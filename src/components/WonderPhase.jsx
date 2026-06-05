import { useState, useEffect, useCallback, useRef } from 'react';
import { narrate, stopNarration } from '../utils/audio';
import { getWonderNarration, wonderDiscoverNarration } from '../utils/narration';

const WONDER_QUESTIONS = [
  {
    question: "A class recorded their test scores: 72, 85, 90, 68, 85, 77. Which score appears most often?",
    subtext: "When one value repeats more than others, we call it the mode!",
    emoji: '📝',
    bgEmojis: ['📝', '🔢', '✨', '📊'],
  },
  {
    question: "Emma surveys 5 friends about how many books they read: 3, 7, 5, 2, 8. What is the 'middle' number when sorted?",
    subtext: "The middle value in sorted data is called the median!",
    emoji: '📚',
    bgEmojis: ['📚', '🔢', '📈', '✨'],
  },
  {
    question: "Liam rolls a die. What are the chances of getting a number greater than 4?",
    subtext: "Probability tells us how likely something is to happen!",
    emoji: '🎲',
    bgEmojis: ['🎲', '❓', '🃏', '⭐'],
  },
  {
    question: "A bag has 3 red, 2 blue, and 5 green marbles. Is picking green more or less likely than picking red?",
    subtext: "We can compare likelihoods using fractions and probability!",
    emoji: '🔮',
    bgEmojis: ['🔮', '🔴', '🟢', '🔵'],
  },
  {
    question: "Temperature this week was: 18, 22, 25, 19, 30°C. How spread out is the data?",
    subtext: "The range = highest value minus the lowest value — it shows the spread!",
    emoji: '🌡️',
    bgEmojis: ['🌡️', '📊', '🔢', '🌤️'],
  },
];

export default function WonderPhase({ onComplete, audioEnabled }) {
  const [wonderIdx]  = useState(() => Math.floor(Math.random() * WONDER_QUESTIONS.length));
  const wonder       = WONDER_QUESTIONS[wonderIdx];
  const [stage, setStage]       = useState(0);
  const [particles, setParticles] = useState([]);
  const narRef = useRef(null);

  // Build background particles once
  useEffect(() => {
    const p = Array.from({ length: 22 }, (_, i) => ({
      id: i,
      emoji: wonder.bgEmojis[i % wonder.bgEmojis.length],
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 6,
      duration: 9 + Math.random() * 11,
      size: 1.1 + Math.random() * 1.6,
    }));
    setParticles(p);
  }, [wonder]);

  // Staggered reveal
  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 300);
    const t2 = setTimeout(() => setStage(2), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // ── Narration: fires when stage becomes 1 ──
  useEffect(() => {
    if (stage === 1 && audioEnabled) {
      // Small delay so the reveal animation plays first
      const t = setTimeout(() => {
        narRef.current?.cancel();
        narRef.current = narrate(getWonderNarration(wonderIdx), true);
      }, 600);
      return () => clearTimeout(t);
    }
    return () => narRef.current?.cancel();
  }, [stage, wonderIdx, audioEnabled]);

  const handleDiscover = useCallback(() => {
    narRef.current?.cancel();
    stopNarration();
    if (audioEnabled) {
      const n = narrate(wonderDiscoverNarration(), true);
      // Move on after narration finishes, or after 3 s max
      let done = false;
      const go = () => { if (!done) { done = true; onComplete(); } };
      n.promise.then(go);
      setTimeout(go, 3200);
    } else {
      setTimeout(onComplete, 400);
    }
  }, [onComplete, audioEnabled]);

  return (
    <div className="wonder-phase">
      {/* Floating background particles */}
      <div className="wonder-particles">
        {particles.map(p => (
          <span key={p.id} className="wonder-particle" style={{
            left: `${p.x}%`, top: `${p.y}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            fontSize: `${p.size}rem`,
          }}>
            {p.emoji}
          </span>
        ))}
      </div>

      <div className="wonder-content">
        {/* Question mark orb */}
        <div className={`wonder-qmark ${stage >= 1 ? 'revealed' : ''}`}>
          <span className="wonder-qmark-icon">?</span>
          <div className="wonder-qmark-glow" />
        </div>

        {/* Mascot + speech bubble */}
        <div className={`wonder-mascot ${stage >= 1 ? 'visible' : ''}`}>
          <div className="mascot thinking">🤖</div>
          <div className="speech-bubble wonder-bubble">Hmm… I wonder… 🤔</div>
        </div>

        {/* Question card */}
        <div className={`wonder-question-card ${stage >= 1 ? 'visible' : ''}`}>
          <div className="wonder-emoji">{wonder.emoji}</div>
          <h2 className="wonder-question-text">{wonder.question}</h2>
          <p className="wonder-subtext">{wonder.subtext}</p>
        </div>

        {/* CTA button — appears slightly after card */}
        <button
          className={`btn btn-wonder ${stage >= 2 ? 'visible' : ''}`}
          onClick={handleDiscover}
        >
          <span className="wonder-btn-sparkle">✨</span>
          Let's Discover!
          <span className="wonder-btn-sparkle">✨</span>
        </button>
      </div>
    </div>
  );
}
