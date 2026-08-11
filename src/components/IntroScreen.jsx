import { useEffect, useMemo } from 'react';
import { stopNarration } from '../utils/audio';

const JOURNEY_STEPS = [
  { icon: '🔍', label: 'Wonder',   desc: 'A real-world mystery' },
  { icon: '📖', label: 'Story',    desc: 'An adventure unfolds' },
  { icon: '🧪', label: 'Simulate', desc: 'Discover by doing' },
  { icon: '🎮', label: 'Practice', desc: '80 gamified questions' },
  { icon: '📓', label: 'Reflect',  desc: 'Teach the mascot' },
];

const INTRO_SYMBOLS  = ['μ','σ','∑','P','%','?','≥','≤','∞','x̄'];
const INTRO_EMOJIS   = ['📊','🎲','📈','🔢','🎯','⭐','💎','🔮'];

export default function IntroScreen({ onStart }) {
  // Stop any active narration when intro loads
  useEffect(() => {
    stopNarration();
  }, []);

  // Build particles once (mix of symbols + emojis + bubbles)
  const particles = useMemo(() => {
    const items = [];
    for (let i = 0; i < 18; i++) {
      items.push({
        id: `s${i}`,
        type: i % 3 === 0 ? 'emoji' : 'symbol',
        content: i % 3 === 0
          ? INTRO_EMOJIS[Math.floor(i / 3) % INTRO_EMOJIS.length]
          : INTRO_SYMBOLS[i % INTRO_SYMBOLS.length],
        x: 3 + (i / 18) * 94,
        size: 0.85 + Math.random() * 0.85,
        delay: Math.random() * 18,
        duration: 14 + Math.random() * 12,
        opacity: 0.12 + Math.random() * 0.10,
      });
    }
    for (let i = 0; i < 10; i++) {
      items.push({
        id: `b${i}`,
        type: 'bubble',
        content: '',
        x: 5 + Math.random() * 90,
        size: 22 + Math.random() * 40,
        delay: Math.random() * 20,
        duration: 18 + Math.random() * 16,
        opacity: 0.08 + Math.random() * 0.08,
      });
    }
    return items;
  }, []);

  return (
    <div className="intro-screen" style={{ position: 'relative', overflow: 'hidden' }}>

      {/* Animated background particles */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {particles.map(p => {
          if (p.type === 'bubble') {
            return (
              <div
                key={p.id}
                className="float-bubble"
                style={{
                  left: `${p.x}%`,
                  width:  `${p.size}px`,
                  height: `${p.size}px`,
                  animationDelay:    `${p.delay}s`,
                  animationDuration: `${p.duration}s`,
                  opacity: p.opacity,
                }}
              />
            );
          }
          return (
            <span
              key={p.id}
              className={`floating-number ${p.type === 'emoji' ? 'float-emoji' : ''}`}
              style={{
                left: `${p.x}%`,
                fontSize: `${p.size}rem`,
                color: 'rgba(255,255,255,0.9)',
                animationDelay:    `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                opacity: p.opacity,
              }}
            >
              {p.content}
            </span>
          );
        })}
      </div>

      {/* Foreground content */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: '100%', maxWidth: '750px' }}>
        <div className="intro-badge">📊 Grade 7 · Data Handling &amp; Probability</div>

        <h1 className="intro-title">
          Data<span style={{ color: 'var(--gold)' }}> &amp; </span>Probability
        </h1>

        <p className="intro-desc">
          Discover the secrets hidden in numbers — mean, median, mode, range, and the
          thrilling world of chance and probability!
        </p>

        <div className="mascot-container" style={{ marginTop: 4 }}>
          <div className="mascot thinking">🤖</div>
          <div className="speech-bubble">
            Ready for a data adventure? Let's go! 📈
          </div>
        </div>

        <button
          className="btn btn-wonder visible intro-start-btn"
          onClick={onStart}
        >
          <span className="wonder-btn-sparkle">✨</span>
          Begin Your Journey!
          <span className="wonder-btn-sparkle">✨</span>
        </button>

        <div className="intro-journey-map">
          <div className="intro-journey-title">
            <span>🗺️</span> YOUR LEARNING JOURNEY <span>✨</span>
          </div>
          <div className="intro-journey-steps">
            {JOURNEY_STEPS.map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                <div className="intro-journey-step">
                  <div className="intro-journey-icon">{step.icon}</div>
                  <div className="intro-journey-info">
                    <div className="intro-journey-label">{step.label}</div>
                    <div className="intro-journey-desc">{step.desc}</div>
                  </div>
                </div>
                {i < JOURNEY_STEPS.length - 1 && (
                  <span className="intro-journey-arrow">➔</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="feature-cards">
          <div className="feature-card">
            <div className="feature-card-icon">🎯</div>
            <div className="feature-card-label">80 Challenges</div>
          </div>
          <div className="feature-card">
            <div className="feature-card-icon">📊</div>
            <div className="feature-card-label">Mean · Median · Mode</div>
          </div>
          <div className="feature-card">
            <div className="feature-card-icon">🎲</div>
            <div className="feature-card-label">Probability</div>
          </div>
          <div className="feature-card">
            <div className="feature-card-icon">✨</div>
            <div className="feature-card-label">Badges &amp; XP</div>
          </div>
        </div>
      </div>
    </div>
  );
}
