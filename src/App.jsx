import { useState, useCallback, useEffect } from 'react';
import { stopNarration } from './utils/audio';
import FloatingNumbers from './components/FloatingNumbers';
import IntroScreen from './components/IntroScreen';
import WonderPhase from './components/WonderPhase';
import StoryPhase from './components/StoryPhase';
import SimulatePhase from './components/SimulatePhase';
import PlayPhase from './components/PlayPhase';
import MasteryCheck from './components/MasteryCheck';
import AdaptiveWorksheet from './components/AdaptiveWorksheet';
import ReflectPhase from './components/ReflectPhase';

// Full 8-phase journey
const PHASES = ['intro', 'wonder', 'story', 'simulate', 'play', 'mastery', 'worksheet', 'reflect'];

const JOURNEY_ITEMS = [
  { key: 'wonder',    icon: '🔍', label: 'Wonder'    },
  { key: 'story',     icon: '📖', label: 'Story'     },
  { key: 'simulate',  icon: '🧪', label: 'Simulate'  },
  { key: 'play',      icon: '🎮', label: 'Practice'  },
  { key: 'mastery',   icon: '📋', label: 'Mastery'   },
  { key: 'worksheet', icon: '📝', label: 'Worksheet' },
  { key: 'reflect',   icon: '📓', label: 'Reflect'   },
];

export default function App() {
  const [phase, setPhase]                 = useState('intro');
  const [audioEnabled, setAudioEnabled]   = useState(true);
  const [playStats, setPlayStats]         = useState(null);
  const [masteryResults, setMasteryResults] = useState(null);

  const toggleAudio = useCallback(() => {
    setAudioEnabled(prev => { if (prev) stopNarration(); return !prev; });
  }, []);

  const goHome = useCallback(() => {
    stopNarration();
    setPhase('intro');
    setPlayStats(null);
    setMasteryResults(null);
  }, []);

  const restart = useCallback(() => {
    stopNarration();
    setPhase('wonder');
    setPlayStats(null);
    setMasteryResults(null);
  }, []);

  useEffect(() => { return () => stopNarration(); }, []);

  const currentIdx = PHASES.indexOf(phase);
  const showJourney = phase !== 'intro';

  return (
    <>
      <FloatingNumbers />
      <div className="app-container">

        {/* Header containing Home, Navbar, and Mute Button — hidden in Intro phase */}
        {showJourney && (
          <header className="navbar-container">
            <button className="home-btn" onClick={goHome} title="Go Home">
              🏠 Home
            </button>

            <nav className="journey-bar">
              {JOURNEY_ITEMS.map((item, i) => {
                const isActive = phase === item.key;
                const itemIdx  = PHASES.indexOf(item.key);
                const isCompleted = currentIdx > itemIdx;
                return (
                  <div key={item.key} className="journey-step-wrapper">
                    <button
                      type="button"
                      className={`journey-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                      onClick={() => setPhase(item.key)}
                      title={`Switch to ${item.label} phase`}
                    >
                      <div className="journey-step-dot">
                        {isCompleted ? '✓' : item.icon}
                      </div>
                      <div className="journey-step-label">{item.label}</div>
                    </button>
                    {i < JOURNEY_ITEMS.length - 1 && (
                      <div className={`journey-connector ${currentIdx > itemIdx ? 'filled' : ''}`} />
                    )}
                  </div>
                );
              })}
            </nav>

            <button
              type="button"
              className="audio-toggle-btn navbar-mute-btn"
              onClick={toggleAudio}
              title={audioEnabled ? 'Mute Audio' : 'Unmute Audio'}
            >
              {audioEnabled ? '🔊' : '🔇'}
            </button>
          </header>
        )}

        {/* ── Phase Content ── */}
        {phase === 'intro' && (
          <IntroScreen
            onStart={() => setPhase('wonder')}
            audioEnabled={audioEnabled}
            onToggleAudio={toggleAudio}
          />
        )}

        {phase === 'wonder' && (
          <WonderPhase
            onComplete={() => setPhase('story')}
            audioEnabled={audioEnabled}
          />
        )}

        {phase === 'story' && (
          <StoryPhase
            onComplete={() => setPhase('simulate')}
            audioEnabled={audioEnabled}
          />
        )}

        {phase === 'simulate' && (
          <SimulatePhase
            onComplete={() => setPhase('play')}
            audioEnabled={audioEnabled}
          />
        )}

        {phase === 'play' && (
          <PlayPhase
            onComplete={(stats) => { setPlayStats(stats); setPhase('mastery'); }}
            audioEnabled={audioEnabled}
          />
        )}

        {phase === 'mastery' && (
          <MasteryCheck
            onComplete={(results) => { setMasteryResults(results); setPhase('worksheet'); }}
            audioEnabled={audioEnabled}
          />
        )}

        {phase === 'worksheet' && (
          <AdaptiveWorksheet
            masteryLevel={masteryResults?.level || 'developing'}
            onComplete={() => setPhase('reflect')}
            audioEnabled={audioEnabled}
          />
        )}

        {phase === 'reflect' && (
          <ReflectPhase
            stats={playStats}
            onRestart={restart}
            onGoHome={goHome}
            audioEnabled={audioEnabled}
          />
        )}

      </div>
    </>
  );
}

