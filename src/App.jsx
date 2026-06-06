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

// Full 8-phase journey (intro is not counted in the bar)
const PHASES = ['intro', 'wonder', 'story', 'simulate', 'play', 'mastery', 'worksheet', 'reflect'];

const JOURNEY_ITEMS = [
  { icon: '🔍', label: 'Wonder'    },
  { icon: '📖', label: 'Story'     },
  { icon: '🧪', label: 'Simulate'  },
  { icon: '🎮', label: 'Play'      },
  { icon: '📋', label: 'Mastery'   },
  { icon: '📝', label: 'Worksheet' },
  { icon: '📓', label: 'Reflect'   },
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

  const phaseIndex = PHASES.indexOf(phase);
  const showJourney = phase !== 'intro';

  return (
    <>
      <FloatingNumbers />
      <div className="app-container">

        {/* Audio Toggle */}
        <button className="audio-toggle-btn" onClick={toggleAudio}
          title={audioEnabled ? 'Mute' : 'Unmute'}>
          {audioEnabled ? '🔊' : '🔇'}
        </button>

        {/* Home Button */}
        {showJourney && (
          <button className="home-btn" onClick={goHome}>🏠 Home</button>
        )}

        {/* Journey Progress Bar — 7 visible steps */}
        {showJourney && (
          <div className="journey-bar">
            {JOURNEY_ITEMS.map((item, i) => {
              const stepPhaseIndex = i + 1; // wonder=1 … reflect=7
              const isActive    = phaseIndex === stepPhaseIndex;
              const isCompleted = phaseIndex > stepPhaseIndex;
              return (
                <div key={i} className="journey-step-wrapper"
                  style={{ display: 'flex', alignItems: 'center' }}>
                  <div className={`journey-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                    <div className="journey-step-dot">
                      {isCompleted ? '✓' : item.icon}
                    </div>
                    <div className="journey-step-label">{item.label}</div>
                  </div>
                  {i < JOURNEY_ITEMS.length - 1 && (
                    <div className={`journey-connector ${phaseIndex > stepPhaseIndex ? 'filled' : ''}`} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Phase Content ── */}
        {phase === 'intro' && (
          <IntroScreen onStart={() => setPhase('wonder')}
            audioEnabled={audioEnabled} onToggleAudio={toggleAudio} />
        )}

        {phase === 'wonder' && (
          <WonderPhase onComplete={() => setPhase('story')}
            audioEnabled={audioEnabled} />
        )}

        {phase === 'story' && (
          <StoryPhase onComplete={() => setPhase('simulate')}
            audioEnabled={audioEnabled} />
        )}

        {phase === 'simulate' && (
          <SimulatePhase onComplete={() => setPhase('play')}
            audioEnabled={audioEnabled} />
        )}

        {phase === 'play' && (
          <PlayPhase
            onComplete={(stats) => { setPlayStats(stats); setPhase('mastery'); }}
            audioEnabled={audioEnabled} />
        )}

        {phase === 'mastery' && (
          <MasteryCheck
            onComplete={(results) => { setMasteryResults(results); setPhase('worksheet'); }}
            audioEnabled={audioEnabled} />
        )}

        {phase === 'worksheet' && masteryResults && (
          <AdaptiveWorksheet
            masteryLevel={masteryResults.level}
            onComplete={() => setPhase('reflect')}
            audioEnabled={audioEnabled} />
        )}

        {phase === 'reflect' && (
          <ReflectPhase
            stats={playStats}
            onRestart={restart}
            onGoHome={goHome}
            audioEnabled={audioEnabled} />
        )}

      </div>
    </>
  );
}
