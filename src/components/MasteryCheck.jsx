import { useState, useCallback, useEffect, useRef } from 'react';
import { narrate, stopNarration, sounds } from '../utils/audio';

// ─── 5 mastery questions — one per core topic ─────────────────────────────────
const MASTERY_QUESTIONS = [
  {
    topic: 'Mean',
    topicIcon: '⚖️',
    question: 'A dataset is: 3, 5, 7, 9, 11. What is the mean?',
    options: [
      { label: '7',  correct: true  },
      { label: '9',  correct: false },
      { label: '5',  correct: false },
      { label: '11', correct: false },
    ],
    explanation: 'Mean = (3+5+7+9+11) ÷ 5 = 35 ÷ 5 = 7',
  },
  {
    topic: 'Median',
    topicIcon: '🎯',
    question: 'Scores: 72, 68, 75, 68, 80. What is the median?',
    options: [
      { label: '72', correct: true  },
      { label: '68', correct: false },
      { label: '75', correct: false },
      { label: '80', correct: false },
    ],
    explanation: 'Sorted: 68, 68, 72, 75, 80 — the middle value is 72.',
  },
  {
    topic: 'Mode',
    topicIcon: '🏆',
    question: 'Numbers: 2, 4, 4, 6, 8, 4. What is the mode?',
    options: [
      { label: '4',  correct: true  },
      { label: '6',  correct: false },
      { label: '2',  correct: false },
      { label: '8',  correct: false },
    ],
    explanation: '4 appears 3 times — more than any other value.',
  },
  {
    topic: 'Range',
    topicIcon: '📐',
    question: 'Data: 15, 23, 18, 35, 20. What is the range?',
    options: [
      { label: '20', correct: true  },
      { label: '23', correct: false },
      { label: '18', correct: false },
      { label: '15', correct: false },
    ],
    explanation: 'Range = Highest − Lowest = 35 − 15 = 20.',
  },
  {
    topic: 'Probability',
    topicIcon: '🎲',
    question: 'A fair die is rolled. What is P(rolling a 3)?',
    options: [
      { label: '1/6', correct: true  },
      { label: '1/3', correct: false },
      { label: '1/2', correct: false },
      { label: '1/4', correct: false },
    ],
    explanation: 'There is 1 favourable outcome out of 6 total — P = 1/6.',
  },
];

function getMasteryLevel(pct) {
  if (pct >= 0.9) return { key: 'excellent',    label: 'Excellent! 🌟',     color: '#4caf50', emoji: '🏆', msg: "You've mastered this topic! Ready for the next challenge." };
  if (pct >= 0.7) return { key: 'good',         label: 'Good Work! ✨',     color: '#00bcd4', emoji: '⭐', msg: 'Great progress! Keep practising to reach full mastery.' };
  if (pct >= 0.5) return { key: 'developing',   label: 'Developing 🌱',    color: '#ff9800', emoji: '💪', msg: "You're building skills! Your worksheet will help you grow." };
  return           { key: 'needsSupport', label: 'Keep Going! 💛',   color: '#ef5350', emoji: '📚', msg: "Don't worry — a personalised worksheet is coming to help you!" };
}

export default function MasteryCheck({ onComplete, audioEnabled }) {
  const [qIdx, setQIdx]         = useState(0);
  const [score, setScore]       = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState(null);   // index of chosen option
  const [done, setDone]         = useState(false);
  const [animIn, setAnimIn]     = useState(true);
  const narRef = useRef(null);

  const q = MASTERY_QUESTIONS[qIdx];

  // ── Intro narration on first question ──
  useEffect(() => {
    if (qIdx === 0 && audioEnabled) {
      const t = setTimeout(() => {
        narRef.current = narrate([
          { text: "Time for a Mastery Check! These questions test your understanding.", style: 'instruction' },
          { text: "Answer them to see how well you have learned!", style: 'encouragement' },
        ], true);
      }, 600);
      return () => { clearTimeout(t); narRef.current?.cancel(); };
    }
  }, [qIdx, audioEnabled]);

  const handleAnswer = useCallback((optIdx) => {
    if (answered) return;
    setAnswered(true);
    setSelected(optIdx);
    narRef.current?.cancel();

    const isCorrect = q.options[optIdx].correct;
    if (isCorrect) {
      sounds.correct();
      setScore(s => s + 1);
      if (audioEnabled) narRef.current = narrate([{ text: "That's exactly right!", style: 'celebration' }], true);
    } else {
      sounds.wrong();
      if (audioEnabled) narRef.current = narrate([{ text: "Hmm, not quite — but that's okay!", style: 'statement' }], true);
    }

    setTimeout(() => {
      if (qIdx + 1 < MASTERY_QUESTIONS.length) {
        setAnimIn(false);
        setTimeout(() => {
          setQIdx(i => i + 1);
          setAnswered(false);
          setSelected(null);
          setAnimIn(true);
        }, 300);
      } else {
        setDone(true);
      }
    }, 1600);
  }, [answered, q, qIdx, audioEnabled]);

  const handleContinue = useCallback(() => {
    narRef.current?.cancel();
    stopNarration();
    const pct   = score / MASTERY_QUESTIONS.length;
    const level = getMasteryLevel(pct);
    onComplete({ score, total: MASTERY_QUESTIONS.length, percentage: Math.round(pct * 100), level: level.key, levelData: level });
  }, [onComplete, score]);

  // ── Topic pills ──────────────────────────────────
  const TopicPills = () => (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
      {MASTERY_QUESTIONS.map((mq, i) => {
        const state = i < qIdx ? 'done' : i === qIdx ? 'active' : 'pending';
        return (
          <div key={i} style={{
            padding: '4px 12px', borderRadius: 999,
            fontSize: '0.78rem', fontWeight: 700,
            fontFamily: 'var(--font-display)',
            background: state === 'done'   ? 'rgba(76,175,80,0.25)'
                       : state === 'active' ? 'rgba(255,193,7,0.2)'
                       : 'rgba(255,255,255,0.07)',
            border: `1px solid ${state === 'done' ? '#4caf50' : state === 'active' ? '#ffd54f' : 'rgba(255,255,255,0.15)'}`,
            color:  state === 'done' ? '#a5d6a7' : state === 'active' ? '#ffd54f' : 'rgba(255,255,255,0.4)',
          }}>
            {mq.topicIcon} {mq.topic} {state === 'done' ? '✓' : ''}
          </div>
        );
      })}
    </div>
  );

  // ── Completion screen ────────────────────────────
  if (done) {
    const pct   = score / MASTERY_QUESTIONS.length;
    const level = getMasteryLevel(pct);
    return (
      <div className="reflect-phase">
        <div className="certificate-card" style={{ border: `2px solid ${level.color}`, animation: 'bounceIn 0.5s' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 8 }}>{level.emoji}</div>
          <h2 className="cert-title">Mastery Check Complete!</h2>
          <p className="cert-subtitle">{level.label}</p>

          <div className="score-circle" style={{ borderColor: level.color }}>
            <span className="score-number" style={{ color: level.color }}>
              {Math.round(pct * 100)}%
            </span>
            <span className="score-label">{score}/{MASTERY_QUESTIONS.length}</span>
          </div>

          {/* Per-topic results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '20px 0' }}>
            {MASTERY_QUESTIONS.map((mq, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 16px', borderRadius: 10,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: '#e0f7fa' }}>
                  {mq.topicIcon} {mq.topic}
                </span>
                <span style={{ fontSize: '1rem' }}>
                  {i < score ? '✅' : '❌'}
                </span>
              </div>
            ))}
          </div>

          <div className="mascot-container">
            <div className="mascot happy">🤖</div>
            <div className="speech-bubble" style={{ fontSize: '0.85rem' }}>
              {level.msg}
            </div>
          </div>

          <button className="btn btn-primary btn-lg" onClick={handleContinue}
            style={{ marginTop: 24, animation: 'bounceIn 0.6s ease' }}>
            📝 Your Personalised Worksheet →
          </button>
        </div>
      </div>
    );
  }

  // ── Question screen ──────────────────────────────
  const pct = qIdx / MASTERY_QUESTIONS.length * 100;

  return (
    <div className="play-phase">
      {/* Header badge */}
      <div className="play-world-badge" style={{ background: 'linear-gradient(135deg,#6a1b9a,#9c27b0)' }}>
        📋 Mastery Check — Question {qIdx + 1}/{MASTERY_QUESTIONS.length}
      </div>

      {/* Progress */}
      <div style={{ width: '100%', maxWidth: 700, marginBottom: 16 }}>
        <div className="progress-bar-container">
          <div className="progress-bar-label">
            <span>{q.topicIcon} {q.topic}</span>
            <span>{Math.round(pct)}%</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#6a1b9a,#ffd54f)' }} />
          </div>
        </div>
      </div>

      {/* Topic pills */}
      <TopicPills />

      {/* Question card */}
      <div className="question-card"
        style={{ animation: animIn ? 'slideUp 0.35s ease' : 'fadeOut 0.25s ease', maxWidth: 680 }}>

        {/* Topic badge */}
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 14px', borderRadius: 999, marginBottom: 14,
          background: 'rgba(106,27,154,0.25)', border: '1px solid rgba(156,39,176,0.5)',
          color: '#ce93d8', fontSize: '0.82rem', fontWeight: 700,
          fontFamily: 'var(--font-display)',
        }}>
          {q.topicIcon} {q.topic}
        </span>

        <p className="question-text">{q.question}</p>

        <div className="options-grid">
          {q.options.map((opt, i) => {
            let cls = 'option-btn';
            if (answered) {
              if (opt.correct)                cls += ' correct';
              else if (i === selected)        cls += ' wrong';
              else                            cls += ' disabled';
            }
            return (
              <button key={i} className={cls} onClick={() => handleAnswer(i)}>
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Explanation shown after answer */}
        {answered && (
          <div className="hint-text" style={{ marginTop: 12 }}>
            <span>💡</span><span>{q.explanation}</span>
          </div>
        )}
      </div>
    </div>
  );
}
