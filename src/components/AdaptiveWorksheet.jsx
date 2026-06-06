import { useState, useCallback, useEffect, useRef } from 'react';
import { narrate, stopNarration, sounds } from '../utils/audio';

// ─── Adaptive problem bank per mastery level ──────────────────────────────────
const PROBLEMS = {
  excellent: [
    {
      q: 'A dataset has mean 25, median 24, and mode 22. Which measure is LEAST affected by outliers?',
      opts: ['Median','Mean','Mode','Range'],
      correct: 0,
      exp: 'The median only depends on order, not magnitude — outliers barely move it.',
    },
    {
      q: 'If you roll two fair dice, what is P(sum = 7)?',
      opts: ['1/6','1/8','1/12','1/4'],
      correct: 0,
      exp: '6 combinations give sum 7 out of 36 total → 6/36 = 1/6.',
    },
    {
      q: 'Scores: 10, 20, 20, 30, 200. Which measure best represents a typical score?',
      opts: ['Median','Mean','Mode','Range'],
      correct: 0,
      exp: 'The outlier 200 skews the mean. Median (20) is more representative.',
    },
  ],
  good: [
    {
      q: 'Numbers: 10, 15, 20, 25, 30. Find the mean.',
      opts: ['20','15','25','22'],
      correct: 0,
      exp: 'Mean = (10+15+20+25+30) ÷ 5 = 100 ÷ 5 = 20.',
    },
    {
      q: 'In a bag: 5 red, 3 blue, 2 green. What is P(not red)?',
      opts: ['1/2','3/5','2/5','5/10'],
      correct: 0,
      exp: 'Not red = 3+2 = 5. P = 5/10 = 1/2.',
    },
    {
      q: 'Data: 4, 7, 7, 9, 13. What is the range?',
      opts: ['9','6','7','13'],
      correct: 0,
      exp: 'Range = 13 − 4 = 9.',
    },
  ],
  developing: [
    {
      q: 'Scores: 60, 70, 80, 90. What is the mean?',
      opts: ['75','80','70','65'],
      correct: 0,
      exp: 'Mean = (60+70+80+90) ÷ 4 = 300 ÷ 4 = 75.',
    },
    {
      q: 'A coin is flipped once. What is P(heads)?',
      opts: ['1/2','1/1','2/2','1/3'],
      correct: 0,
      exp: '1 head out of 2 possible outcomes → P = 1/2.',
    },
    {
      q: 'Numbers: 3, 5, 5, 7, 9. What is the mode?',
      opts: ['5','3','7','9'],
      correct: 0,
      exp: '5 appears twice — more than any other value.',
    },
  ],
  needsSupport: [
    {
      q: 'Numbers: 5, 10, 15. What is the mean (fair share)?',
      opts: ['10','5','15','8'],
      correct: 0,
      exp: 'Mean = (5+10+15) ÷ 3 = 30 ÷ 3 = 10.',
    },
    {
      q: 'A bag has 3 red marbles and 2 blue marbles. Which colour is more likely to be picked?',
      opts: ['Red','Blue','Equal','Can\'t tell'],
      correct: 0,
      exp: '3 red vs 2 blue — red has more marbles so it is more likely.',
    },
    {
      q: 'Data: 2, 4, 6, 8. What is the range?',
      opts: ['6','4','8','2'],
      correct: 0,
      exp: 'Range = Largest − Smallest = 8 − 2 = 6.',
    },
  ],
};

const LEVEL_META = {
  excellent:   { label: 'Advanced Challenge',  color: '#4caf50', icon: '🌟', desc: 'You mastered the basics — time for harder problems!' },
  good:        { label: 'Skill Builder',        color: '#00bcd4', icon: '✨', desc: 'Solidify your understanding with these focused problems.' },
  developing:  { label: 'Practice Problems',   color: '#ff9800', icon: '🌱', desc: 'Build your skills step by step with guided practice.' },
  needsSupport:{ label: 'Foundation Practice', color: '#ef5350', icon: '💪', desc: 'Start from the basics — every expert began here!' },
};

export default function AdaptiveWorksheet({ masteryLevel, onComplete, audioEnabled }) {
  const problems  = PROBLEMS[masteryLevel]  || PROBLEMS.developing;
  const levelMeta = LEVEL_META[masteryLevel] || LEVEL_META.developing;

  const [pIdx, setPIdx]           = useState(0);
  const [score, setScore]         = useState(0);
  const [answered, setAnswered]   = useState(false);
  const [selected, setSelected]   = useState(null);
  const [done, setDone]           = useState(false);
  const [animIn, setAnimIn]       = useState(true);
  const narRef = useRef(null);

  const prob = problems[pIdx];

  // ── Intro narration ──────────────────────────────
  useEffect(() => {
    if (pIdx === 0 && audioEnabled) {
      const t = setTimeout(() => {
        narRef.current = narrate([
          { text: "Based on your performance, I have created a custom worksheet for you.", style: 'statement' },
          { text: "Work through these problems to strengthen your skills!", style: 'encouragement' },
        ], true);
      }, 600);
      return () => { clearTimeout(t); narRef.current?.cancel(); };
    }
  }, [pIdx, audioEnabled]);

  const handleAnswer = useCallback((optIdx) => {
    if (answered) return;
    setAnswered(true);
    setSelected(optIdx);
    narRef.current?.cancel();

    const isCorrect = optIdx === prob.correct;
    if (isCorrect) {
      sounds.correct();
      setScore(s => s + 1);
      if (audioEnabled) narRef.current = narrate([{ text: "That's correct! Great work!", style: 'celebration' }], true);
    } else {
      sounds.wrong();
      if (audioEnabled) narRef.current = narrate([{ text: "Not quite. Let us review this concept together!", style: 'encouragement' }], true);
    }

    setTimeout(() => {
      if (pIdx + 1 < problems.length) {
        setAnimIn(false);
        setTimeout(() => {
          setPIdx(i => i + 1);
          setAnswered(false);
          setSelected(null);
          setAnimIn(true);
        }, 300);
      } else {
        setDone(true);
      }
    }, 1700);
  }, [answered, prob, pIdx, problems.length, audioEnabled]);

  const handleContinue = useCallback(() => {
    narRef.current?.cancel();
    stopNarration();
    onComplete({ score, total: problems.length, percentage: Math.round((score / problems.length) * 100) });
  }, [onComplete, score, problems.length]);

  // ── Completion screen ────────────────────────────
  if (done) {
    const pct = Math.round((score / problems.length) * 100);
    return (
      <div className="reflect-phase">
        <div className="certificate-card" style={{ border: `2px solid ${levelMeta.color}` }}>
          <div style={{ fontSize: '3rem', marginBottom: 8 }}>📝</div>
          <h2 className="cert-title">Worksheet Complete!</h2>
          <p className="cert-subtitle">{levelMeta.label}</p>

          <div className="score-circle" style={{ borderColor: levelMeta.color }}>
            <span className="score-number" style={{ color: levelMeta.color }}>{pct}%</span>
            <span className="score-label">{score}/{problems.length}</span>
          </div>

          {/* Problem results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '20px 0' }}>
            {problems.map((pr, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '10px 14px', borderRadius: 10,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}>
                <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: 2 }}>
                  {i < score ? '✅' : '❌'}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
                  {pr.q}
                </span>
              </div>
            ))}
          </div>

          <div className="mascot-container">
            <div className="mascot happy">🤖</div>
            <div className="speech-bubble" style={{ fontSize: '0.85rem' }}>
              {pct >= 80
                ? 'Brilliant work! Your skills are growing! 🚀'
                : pct >= 50
                ? 'Good effort! Keep practising and you will get there! 💪'
                : 'Every attempt counts — you are learning! 📚'}
            </div>
          </div>

          <button className="btn btn-primary btn-lg" onClick={handleContinue}
            style={{ marginTop: 24, animation: 'bounceIn 0.6s ease' }}>
            📓 Reflect on Your Learning →
          </button>
        </div>
      </div>
    );
  }

  // ── Problem screen ───────────────────────────────
  const progress = (pIdx / problems.length) * 100;

  return (
    <div className="play-phase">
      {/* Header badge */}
      <div className="play-world-badge"
        style={{ background: `linear-gradient(135deg,${levelMeta.color}99,${levelMeta.color})` }}>
        {levelMeta.icon} {levelMeta.label} — Problem {pIdx + 1}/{problems.length}
      </div>

      {/* Desc */}
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: 12, textAlign: 'center' }}>
        {levelMeta.desc}
      </p>

      {/* Progress bar */}
      <div style={{ width: '100%', maxWidth: 700, marginBottom: 20 }}>
        <div className="progress-bar-container">
          <div className="progress-bar-label">
            <span>Problem {pIdx + 1}/{problems.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill"
              style={{ width: `${progress}%`, background: `linear-gradient(90deg,${levelMeta.color},#ffd54f)` }} />
          </div>
        </div>
      </div>

      {/* Problem card */}
      <div className="question-card"
        style={{ animation: animIn ? 'slideUp 0.35s ease' : 'fadeOut 0.25s ease', maxWidth: 680 }}>

        {/* Worksheet badge */}
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 14px', borderRadius: 999, marginBottom: 14,
          background: `${levelMeta.color}22`, border: `1px solid ${levelMeta.color}66`,
          color: levelMeta.color, fontSize: '0.82rem', fontWeight: 700,
          fontFamily: 'var(--font-display)',
        }}>
          📝 Adaptive Worksheet
        </span>

        <p className="question-text">{prob.q}</p>

        <div className="options-grid">
          {prob.opts.map((opt, i) => {
            let cls = 'option-btn';
            if (answered) {
              if (i === prob.correct)          cls += ' correct';
              else if (i === selected)         cls += ' wrong';
              else                             cls += ' disabled';
            }
            return (
              <button key={i} className={cls} onClick={() => handleAnswer(i)}>
                {opt}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {answered && (
          <div className="hint-text" style={{ marginTop: 12 }}>
            <span>💡</span><span>{prob.exp}</span>
          </div>
        )}
      </div>
    </div>
  );
}
