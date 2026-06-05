import { useState, useCallback, useEffect, useRef } from 'react';
import { narrate, stopNarration, sounds } from '../utils/audio';
import {
  reflectIntroNarration, reflectCorrectNarration, reflectWrongNarration,
  reflectConfidenceNarration, reflectCertificateNarration,
} from '../utils/narration';

const REFLECT_QUESTIONS = [
  {
    q: "The ages of 5 students are: 12, 14, 13, 14, 17. What is the mode?",
    options: [
      { text: '14 — it appears twice', correct: true,  emoji: '🏆' },
      { text: '13 — it is the middle', correct: false, emoji: '🎯' },
      { text: '17 — it is the largest', correct: false, emoji: '❌' },
    ],
  },
  {
    q: "The data set is: 3, 7, 5, 9, 1. What is the median?",
    options: [
      { text: '5 — the middle when sorted', correct: true,  emoji: '🎯' },
      { text: '7 — the second largest',     correct: false, emoji: '❌' },
      { text: '9 — the largest value',      correct: false, emoji: '❌' },
    ],
  },
  {
    q: "A bag has 4 yellow and 6 blue marbles. What is P(yellow)?",
    options: [
      { text: '4/10 = 2/5',   correct: true,  emoji: '🎲' },
      { text: '6/10 = 3/5',   correct: false, emoji: '❌' },
      { text: '4/6',          correct: false, emoji: '❌' },
    ],
  },
  {
    q: "Test scores: 45, 72, 88, 91, 64. What is the range?",
    options: [
      { text: '46 — 91 minus 45', correct: true,  emoji: '📐' },
      { text: '72 — the median',  correct: false, emoji: '❌' },
      { text: '19 — half the range', correct: false, emoji: '❌' },
    ],
  },
];

const CONFIDENCE_LEVELS = [
  { emoji: '😊', label: "I'm great at data and probability!", color: '#4caf50' },
  { emoji: '🙂', label: 'I understand most of it!',          color: '#ff9800' },
  { emoji: '😐', label: "I'm still learning — I'll practise more!", color: '#42a5f5' },
];

export default function ReflectPhase({ stats, onRestart, onGoHome, audioEnabled }) {
  const [step, setStep] = useState(0);
  const [teachIdx, setTeachIdx] = useState(0);
  const [teachAnswered, setTeachAnswered] = useState(false);
  const [teachCorrect, setTeachCorrect] = useState(0);
  const [confidence, setConfidence] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState([]);
  const narRef = useRef(null);

  const { score = 0, totalAnswered = 0, xp = 0, maxStreak = 0, worldResults = {} } = stats || {};
  const pct = totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0;
  const totalStars = Object.values(worldResults).reduce((a, r) => a + (r.stars || 0), 0);

  useEffect(() => {
    if (step === 0 && audioEnabled) narRef.current = narrate(reflectIntroNarration(), true);
    return () => narRef.current?.cancel();
  }, [step, audioEnabled]);

  useEffect(() => {
    if (showConfetti) {
      const pieces = Array.from({ length: 45 }, (_, i) => ({
        id: i, x: Math.random() * 100, delay: Math.random() * 2,
        color: ['#ffc107', '#e91e63', '#4caf50', '#2196f3', '#ff5722', '#9c27b0'][i % 6],
        size: 6 + Math.random() * 10, duration: 2 + Math.random() * 3,
      }));
      setConfettiPieces(pieces);
    }
  }, [showConfetti]);

  const handleTeachAnswer = useCallback((option) => {
    if (teachAnswered) return;
    setTeachAnswered(true);
    narRef.current?.cancel();
    if (option.correct) {
      setTeachCorrect(c => c + 1);
      sounds.correct();
      if (audioEnabled) narRef.current = narrate(reflectCorrectNarration(), true);
    } else {
      sounds.wrong();
      if (audioEnabled) narRef.current = narrate(reflectWrongNarration(), true);
    }
    setTimeout(() => {
      setTeachAnswered(false);
      if (teachIdx + 1 < REFLECT_QUESTIONS.length) {
        setTeachIdx(i => i + 1);
      } else {
        setStep(1);
      }
    }, 1500);
  }, [teachAnswered, teachIdx, audioEnabled]);

  const handleConfidenceSelect = useCallback((idx) => {
    setConfidence(idx);
    sounds.badge();
    setShowConfetti(true);
    narRef.current?.cancel();
    if (audioEnabled) narRef.current = narrate(reflectCertificateNarration(pct), true);
    setTimeout(() => setStep(2), 900);
  }, [audioEnabled, pct]);

  useEffect(() => {
    if (step === 1 && audioEnabled) {
      narRef.current?.cancel();
      narRef.current = narrate(reflectConfidenceNarration(), true);
    }
  }, [step, audioEnabled]);

  useEffect(() => {
    return () => { narRef.current?.cancel(); stopNarration(); };
  }, []);

  // ── Step 0: Teach the mascot ─────────────────────
  if (step === 0) {
    const rq = REFLECT_QUESTIONS[teachIdx];
    return (
      <div className="reflect-phase">
        <div className="reflect-header">
          <h3 className="reflect-label">📓 Reflect</h3>
          <p className="reflect-sublabel">Teach the mascot what you learned!</p>
        </div>
        <div className="reflect-card">
          <div className="reflect-mascot-row">
            <div className="mascot thinking" style={{ width: 70, height: 70, fontSize: '2rem' }}>🤖</div>
            <div className="speech-bubble" style={{ maxWidth: 280 }}>
              Can you help me? {rq.q}
            </div>
          </div>
          <div className="reflect-options">
            {rq.options.map((opt, i) => (
              <button
                key={i}
                className={`reflect-option ${teachAnswered ? (opt.correct ? 'correct' : 'wrong') : ''}`}
                onClick={() => handleTeachAnswer(opt)}
                disabled={teachAnswered}
              >
                <span className="reflect-option-emoji">{opt.emoji}</span>
                <span>{opt.text}</span>
              </button>
            ))}
          </div>
          <div className="reflect-progress">
            {REFLECT_QUESTIONS.map((_, i) => (
              <div key={i} className={`reflect-dot ${i === teachIdx ? 'active' : i < teachIdx ? 'done' : ''}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Step 1: Confidence ────────────────────────────
  if (step === 1) {
    return (
      <div className="reflect-phase">
        <div className="reflect-card">
          <h3 className="reflect-card-title">How do you feel about Data &amp; Probability?</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Be honest — every answer helps!</p>
          <div className="confidence-grid">
            {CONFIDENCE_LEVELS.map((c, i) => (
              <button
                key={i}
                className={`confidence-btn ${confidence === i ? 'selected' : ''}`}
                onClick={() => handleConfidenceSelect(i)}
                style={{ '--conf-color': c.color }}
              >
                <span className="confidence-emoji">{c.emoji}</span>
                <span className="confidence-label">{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Step 2: Certificate ───────────────────────────
  return (
    <div className="reflect-phase">
      {showConfetti && (
        <div className="confetti-container">
          {confettiPieces.map(p => (
            <div key={p.id} className="confetti-piece" style={{
              left: `${p.x}%`, animationDelay: `${p.delay}s`,
              backgroundColor: p.color, width: p.size, height: p.size,
              animationDuration: `${p.duration}s`,
            }} />
          ))}
        </div>
      )}

      <div className="certificate-card">
        <div className="cert-badge">🏆</div>
        <h2 className="cert-title">Journey Complete!</h2>
        <p className="cert-subtitle">Data Handling &amp; Probability — all 5 phases done!</p>

        <div className="score-circle">
          <span className="score-number">{pct}%</span>
          <span className="score-label">{score}/{totalAnswered}</span>
        </div>

        <div style={{ fontSize: '2rem', display: 'flex', gap: 8, justifyContent: 'center', margin: '16px 0' }}>
          {[1, 2, 3].map(i => (
            <span key={i} style={{ opacity: i <= Math.ceil(totalStars / 8) ? 1 : 0.2 }}>⭐</span>
          ))}
        </div>

        <div className="cert-stats">
          <div className="cert-stat">
            <div className="cert-stat-value" style={{ color: 'var(--gold)' }}>{xp}</div>
            <div className="cert-stat-label">XP Earned</div>
          </div>
          <div className="cert-stat">
            <div className="cert-stat-value" style={{ color: 'var(--coral)' }}>🔥 {maxStreak}</div>
            <div className="cert-stat-label">Max Streak</div>
          </div>
          <div className="cert-stat">
            <div className="cert-stat-value" style={{ color: 'var(--green-light)' }}>{teachCorrect}/{REFLECT_QUESTIONS.length}</div>
            <div className="cert-stat-label">Teaching Score</div>
          </div>
        </div>

        <div className="mascot-container" style={{ marginTop: 16 }}>
          <div className="mascot happy" style={{ width: 80, height: 80, fontSize: '2rem' }}>🤖</div>
          <div className="speech-bubble">
            {pct >= 80
              ? 'Outstanding! You are a Data Champion! 🏆'
              : pct >= 50
              ? 'Great effort! Keep practising to master it! 💪'
              : 'Good start! Review the lessons and try again! 📚'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginTop: 24 }}>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => { narRef.current?.cancel(); stopNarration(); onRestart(); }}
          >
            🔄 Play Again
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => { narRef.current?.cancel(); stopNarration(); onGoHome(); }}
          >
            🏠 Home
          </button>
        </div>
      </div>
    </div>
  );
}
