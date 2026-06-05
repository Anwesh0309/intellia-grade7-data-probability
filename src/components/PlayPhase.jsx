import { useState, useCallback, useEffect, useRef } from 'react';
import { generateSessionQuestions } from '../utils/questionBank';
import { narrate, stopNarration, sounds } from '../utils/audio';
import {
  playWorldIntro, playReadQuestion, playCorrectNarration,
  playWrongNarration, playWorldComplete, playGameOverNarration,
} from '../utils/narration';
import QuestionRenderer from './QuestionRenderer';

const WORLDS = [
  { id: 0, name: 'Data Valley',       icon: '📊', color: '#00bcd4', desc: 'Mean — 10 questions' },
  { id: 1, name: 'Sorted Forest',     icon: '🌲', color: '#4caf50', desc: 'Median — 10 questions' },
  { id: 2, name: 'Mode Mountain',     icon: '⛰️', color: '#ffc107', desc: 'Mode — 10 questions' },
  { id: 3, name: 'Range River',       icon: '🌊', color: '#ff7043', desc: 'Range — 10 questions' },
  { id: 4, name: 'Chance Islands',    icon: '🎲', color: '#9c27b0', desc: 'Probability — 10 questions' },
  { id: 5, name: 'Graph Galaxy',      icon: '📈', color: '#e91e63', desc: 'Graphs — 10 questions' },
  { id: 6, name: 'Word Problem Peak', icon: '📝', color: '#607d8b', desc: 'Word Problems — 10 questions' },
  { id: 7, name: 'Master Arena',      icon: '🏆', color: '#ff9800', desc: 'Mixed Challenge — 10 questions' },
];

function calcXP(streak) { return 10 + (streak >= 5 ? 5 : 0); }
function calcStars(correct, total) {
  const p = total > 0 ? correct / total : 0;
  if (p >= 0.9) return 3;
  if (p >= 0.7) return 2;
  if (p >= 0.5) return 1;
  return 0;
}

export default function PlayPhase({ onComplete, audioEnabled }) {
  // ── Global state ──────────────────────────────────
  const [currentWorld, setCurrentWorld]   = useState(-1);
  const [worldResults, setWorldResults]   = useState({});
  const [totalXP, setTotalXP]             = useState(0);
  const [maxStreak, setMaxStreak]         = useState(0);

  // ── Per-world state ───────────────────────────────
  const [worldQuestions, setWorldQuestions] = useState([]);
  const [qIndex, setQIndex]               = useState(0);
  const [score, setScore]                 = useState(0);
  const [streak, setStreak]               = useState(0);
  const [lives, setLives]                 = useState(3);
  const [answered, setAnswered]           = useState(false);
  const [worldComplete, setWorldComplete] = useState(false);

  // ── UI feedback ───────────────────────────────────
  const [feedback, setFeedback]           = useState(null);
  const [xpPopup, setXpPopup]             = useState(null);
  const [gameOver, setGameOver]           = useState(false);   // out-of-hearts screen

  // ── Refs to avoid stale closures in timeouts ──────
  const narRef      = useRef(null);
  const stateRef    = useRef({});           // always-fresh snapshot
  const advanceRef  = useRef(null);         // mutable pointer to advance fn
  const finishRef   = useRef(null);         // mutable pointer to finishWorld fn

  // Keep stateRef in sync every render
  stateRef.current = { qIndex, score, streak, lives, worldQuestions, worldComplete, currentWorld, totalXP, maxStreak, worldResults, gameOver };

  const q = worldQuestions[qIndex];

  // Narrate each new question (only when not answered and no feedback)
  useEffect(() => {
    if (!audioEnabled || !q || worldComplete || feedback || answered || currentWorld < 0) return;
    const t = setTimeout(() => {
      narRef.current?.cancel();
      narRef.current = narrate(playReadQuestion(q.questionText), true);
    }, 350);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIndex, currentWorld]);   // intentionally narrow deps — only fire on new question

  // ── finishWorld ─────────────────────────────────
  const finishWorld = useCallback(() => {
    const { score: s, worldQuestions: wq, currentWorld: cw } = stateRef.current;
    sounds.badge();
    const stars = calcStars(s, wq.length);
    setWorldResults(prev => ({ ...prev, [cw]: { score: s, total: wq.length, stars } }));
    setWorldComplete(true);
    narRef.current?.cancel();
    if (audioEnabled) narRef.current = narrate(playWorldComplete(WORLDS[cw]?.name, s, wq.length), true);
  }, [audioEnabled]);
  finishRef.current = finishWorld;

  // ── advance to next question ─────────────────────
  const advance = useCallback(() => {
    const { qIndex: qi, worldQuestions: wq, lives: lv } = stateRef.current;
    setFeedback(null);
    setAnswered(false);
    if (qi + 1 < wq.length && lv > 0) {
      setQIndex(i => i + 1);
    } else {
      finishRef.current();
    }
  }, []);
  advanceRef.current = advance;

  // ── handleAnswer ─────────────────────────────────
  const handleAnswer = useCallback((isCorrect) => {
    if (stateRef.current.answered) return;   // guard double-fire
    setAnswered(true);
    narRef.current?.cancel();

    const { streak: st, lives: lv, totalXP: xp, maxStreak: ms } = stateRef.current;
    const curQ = stateRef.current.worldQuestions[stateRef.current.qIndex];

    if (isCorrect) {
      const ns  = st + 1;
      const earned = calcXP(ns);
      setScore(s => s + 1);
      setStreak(ns);
      setMaxStreak(Math.max(ms, ns));
      setTotalXP(xp + earned);
      sounds.correct();
      if (ns >= 5 && ns % 5 === 0) sounds.streak();
      setXpPopup(`+${earned} XP`);
      setTimeout(() => setXpPopup(null), 1500);
      setFeedback({
        type: 'correct',
        message: ns >= 5 ? `🔥 ${ns} Streak!` : 'Correct! 🎉',
        sub: curQ?.explanation || '',
      });
      if (audioEnabled) narRef.current = narrate(playCorrectNarration(ns), true);
      setTimeout(() => advanceRef.current(), 1800);
    } else {
      const newLives = lv - 1;
      setStreak(0);
      setLives(newLives);
      sounds.wrong();
      setFeedback({
        type: 'wrong',
        message: 'Not quite!',
        sub: curQ?.explanation || '',
      });
      if (audioEnabled) narRef.current = narrate(playWrongNarration(), true);
      if (newLives <= 0) {
        // Show game-over / retry screen after a short pause
        setTimeout(() => { setFeedback(null); setGameOver(true); }, 2000);
      } else {
        setTimeout(() => advanceRef.current(), 2200);
      }
    }
  }, [audioEnabled]);

  // ── startWorld ───────────────────────────────────
  const startWorld = useCallback((worldId) => {
    const allQ     = generateSessionQuestions();
    const filtered = allQ.filter(q => q.world === worldId);
    narRef.current?.cancel();
    stopNarration();
    setWorldQuestions(filtered);
    setCurrentWorld(worldId);
    setQIndex(0);
    setScore(0);
    setLives(3);
    setStreak(0);
    setWorldComplete(false);
    setGameOver(false);
    setFeedback(null);
    setAnswered(false);
    if (audioEnabled) narRef.current = narrate(playWorldIntro(WORLDS[worldId].name), true);
  }, [audioEnabled]);

  const backToMap = useCallback(() => {
    narRef.current?.cancel();
    stopNarration();
    setCurrentWorld(-1);
    setWorldComplete(false);
    setFeedback(null);
  }, []);

  const handleAllComplete = useCallback(() => {
    narRef.current?.cancel();
    stopNarration();
    const { score: s, worldQuestions: wq, currentWorld: cw, totalXP: xp, maxStreak: ms, worldResults: wr } = stateRef.current;
    const totalScore = Object.values(wr).reduce((a, r) => a + r.score, 0) + s;
    const totalQ     = Object.values(wr).reduce((a, r) => a + r.total,  0) + (wq.length || 0);
    onComplete({
      score: totalScore,
      xp,
      maxStreak: ms,
      totalAnswered: totalQ,
      worldResults: { ...wr, [cw]: { score: s, total: wq.length, stars: calcStars(s, wq.length) } },
    });
  }, [onComplete]);

  // ── Narrate game over ────────────────────────────
  useEffect(() => {
    if (gameOver && audioEnabled) {
      narRef.current?.cancel();
      narRef.current = narrate(playGameOverNarration(), true);
    }
  }, [gameOver, audioEnabled]);

  const retryWorld = useCallback(() => {
    const { currentWorld: cw } = stateRef.current;
    startWorld(cw);
  }, [startWorld]);

  // ── World Map ─────────────────────────────────────
  if (currentWorld < 0) {
    const allDone = WORLDS.every((_, i) => worldResults[i]);
    return (
      <div className="play-phase">
        <div className="play-header">
          <h2 className="play-title">🎮 Choose Your World!</h2>
          <p className="play-subtitle">Complete each world to unlock the next. Earn stars and XP!</p>
          {totalXP > 0 && <div className="play-xp-badge">⭐ {totalXP} XP earned</div>}
        </div>

        <div className="world-map">
          {WORLDS.map((w, i) => {
            const unlocked  = i === 0 || worldResults[i - 1];
            const completed = worldResults[i];
            return (
              <div
                key={w.id}
                className={`world-card ${unlocked ? 'unlocked' : 'locked'} ${completed ? 'completed' : ''}`}
                onClick={() => unlocked && startWorld(i)}
                style={{ '--world-color': w.color }}
              >
                {!unlocked && <div className="world-lock">🔒</div>}
                <div className="world-icon">{w.icon}</div>
                <div className="world-name">{w.name}</div>
                <div className="world-desc">{w.desc}</div>
                {completed && (
                  <div className="world-stars">
                    {[1,2,3].map(s => <span key={s} style={{ opacity: s <= completed.stars ? 1 : 0.2 }}>⭐</span>)}
                    <span className="world-score">{completed.score}/{completed.total}</span>
                  </div>
                )}
                {unlocked && !completed && <div className="world-play-btn">▶ PLAY</div>}
              </div>
            );
          })}
        </div>

        {allDone && (
          <button className="btn btn-green btn-lg" onClick={handleAllComplete} style={{ marginTop: 24, animation: 'bounceIn 0.5s ease' }}>
            🏆 Complete Challenge!
          </button>
        )}
      </div>
    );
  }

  // ── World Complete ────────────────────────────────
  if (worldComplete) {
    const w     = WORLDS[currentWorld];
    const stars = calcStars(score, worldQuestions.length);
    const isLast = currentWorld === WORLDS.length - 1;
    return (
      <div className="play-phase">
        <div className="world-complete-card">
          <div className="world-complete-icon">{w.icon}</div>
          <h2 className="world-complete-title">{w.name} Complete!</h2>
          <div className="world-complete-score">{score}/{worldQuestions.length}</div>
          <div className="world-complete-stars">
            {[1,2,3].map(s => (
              <span key={s} className={`world-star ${s <= stars ? 'earned' : ''}`} style={{ animationDelay: `${s * 0.2}s` }}>⭐</span>
            ))}
          </div>
          <div className="world-complete-xp">⭐ {totalXP} XP total</div>
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="btn btn-outline btn-sm" onClick={backToMap}>← World Map</button>
            {isLast ? (
              <button className="btn btn-green" onClick={handleAllComplete}>🏆 Finish!</button>
            ) : (
              <button className="btn btn-primary" onClick={() => {
                setWorldResults(prev => ({ ...prev, [currentWorld]: { score, total: worldQuestions.length, stars } }));
                startWorld(currentWorld + 1);
              }}>
                Next World →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Game Over — retry screen ──────────────────────
  if (gameOver) {
    const w = WORLDS[currentWorld];
    return (
      <div className="play-phase">
        <div className="world-complete-card" style={{ border: '2px solid #ef5350' }}>
          {/* Broken hearts */}
          <div style={{ fontSize: '3rem', marginBottom: 12, animation: 'bounceIn 0.5s' }}>💔</div>
          <h2 className="world-complete-title" style={{ color: '#ef9a9a' }}>Out of Hearts!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: '0.95rem' }}>
            You ran out of hearts in <strong style={{ color: '#ffd54f' }}>{w.name}</strong>.
            You must complete all {worldQuestions.length} questions to move on — let's try again!
          </p>

          {/* Progress so far */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: '12px 0 20px', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center', padding: '10px 20px', background: 'rgba(255,255,255,0.06)', borderRadius: 12 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: '#ffd54f' }}>{score}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Correct this attempt</div>
            </div>
            <div style={{ textAlign: 'center', padding: '10px 20px', background: 'rgba(255,255,255,0.06)', borderRadius: 12 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: '#ef9a9a' }}>
                {qIndex + 1}/{worldQuestions.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Questions reached</div>
            </div>
          </div>

          {/* Mascot encouragement */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 24 }}>
            <div className="mascot thinking" style={{ width: 60, height: 60, fontSize: '1.6rem' }}>🤖</div>
            <div className="speech-bubble" style={{ fontSize: '0.85rem' }}>
              Don't give up — every explorer tries again! 💪
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={retryWorld}
              style={{ animation: 'bounceIn 0.6s ease' }}>
              🔄 Try {w.name} Again
            </button>
            <button className="btn btn-outline btn-sm" onClick={backToMap}>
              ← World Map
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Question View ─────────────────────────────────
  if (!q) return (
    <div className="play-phase">
      <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading questions…</div>
    </div>
  );

  const w   = WORLDS[currentWorld];
  const pct = worldQuestions.length > 0 ? Math.round((qIndex / worldQuestions.length) * 100) : 0;

  return (
    <div className="play-phase">
      <div className="play-world-badge" style={{ background: w.color }}>
        {w.icon} {w.name}
      </div>

      <div className="hud">
        <div className="hud-item">⭐ {totalXP}</div>
        <div className="hearts">
          {Array.from({ length: 3 }, (_, i) => (
            <span key={i} style={{ opacity: i < lives ? 1 : 0.2 }}>❤️</span>
          ))}
        </div>
        <div className={`hud-item ${streak >= 5 ? 'streak-fire' : ''}`}>🔥 {streak}x</div>
      </div>

      <div style={{ width: '100%', maxWidth: 700, marginBottom: 16 }}>
        <div className="progress-bar-container">
          <div className="progress-bar-label">
            <span>Question {qIndex + 1} / {worldQuestions.length}</span>
            <span>{pct}%</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      <div className="question-card" style={{ animation: 'slideUp 0.3s ease' }}>
        <QuestionRenderer key={`${currentWorld}-${qIndex}`} question={q} onAnswer={handleAnswer} disabled={answered} />
      </div>

      {xpPopup && <div className="xp-popup">{xpPopup}</div>}

      {feedback && (
        <div className="feedback-overlay">
          <div className={`feedback-content ${feedback.type}`}>
            <div className="feedback-emoji">{feedback.type === 'correct' ? '🎉' : '😢'}</div>
            <div className="feedback-message">{feedback.message}</div>
            <div className="feedback-sub">{feedback.sub}</div>
          </div>
        </div>
      )}
    </div>
  );
}
