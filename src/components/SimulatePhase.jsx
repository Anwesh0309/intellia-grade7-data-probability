import { useState, useEffect, useCallback, useRef } from 'react';
import { narrate, stopNarration, sounds } from '../utils/audio';
import { celebrate, cheer, say, instruct } from '../utils/audio';
import {
  simulateStation1Intro, simulateStation2Intro,
  simulateStation3Intro, simulateProbabilityIntro,
} from '../utils/narration';
import { genDataSet, calcMean, calcMedian, calcMode, calcRange, randInt, shuffle } from '../utils/questionBank';

// ─── Shared: Animated Data Set display ─────────────
function DataChips({ data, highlights = {}, sorted = false }) {
  const display = sorted ? [...data].sort((a, b) => a - b) : data;
  return (
    <div className="data-set-display">
      {display.map((v, i) => {
        let cls = 'data-value-chip';
        if (highlights.gold?.includes(v)) cls += ' highlight';
        else if (highlights.green?.includes(v)) cls += ' highlight-green';
        else if (highlights.cyan?.includes(v)) cls += ' highlight-cyan';
        else if (sorted) cls += ' sorted';
        return (
          <div key={i} className={cls} style={{ animationDelay: `${i * 0.05}s` }}>
            {v}
          </div>
        );
      })}
    </div>
  );
}

// ─── Bar Chart ─────────────────────────────────────
function MiniBarChart({ data, maxVal }) {
  const max = maxVal || Math.max(...data.map(d => d.value));
  const colors = ['#00bcd4', '#4caf50', '#ffc107', '#ff7043', '#9c27b0', '#e91e63'];
  return (
    <div className="data-bar-chart" style={{ justifyContent: 'center' }}>
      {data.map((d, i) => (
        <div key={i} className="data-bar-wrap">
          <div
            className="data-bar"
            style={{
              height: `${Math.round((d.value / max) * 140)}px`,
              background: colors[i % colors.length],
              animation: `barGrow 0.6s ease ${i * 0.1}s both`,
            }}
          >
            <span className="data-bar-val">{d.value}</span>
          </div>
          <span className="data-bar-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// STATION 1: Mean Discovery
// ═══════════════════════════════════════════════════
function Station1({ audioEnabled, onNext }) {
  const [data] = useState(() => {
    // Create data with integer mean
    for (let i = 0; i < 30; i++) {
      const d = Array.from({ length: 5 }, () => randInt(2, 14));
      const sum = d.reduce((a, b) => a + b, 0);
      if (sum % 5 === 0) return d;
    }
    return [4, 6, 8, 10, 12];
  });
  const [step, setStep] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [done, setDone] = useState(false);
  const narRef = useRef(null);

  const sum = data.reduce((a, b) => a + b, 0);
  const mean = sum / data.length;

  useEffect(() => {
    if (audioEnabled) narRef.current = narrate(simulateStation1Intro(), true);
    return () => narRef.current?.cancel();
  }, [audioEnabled]);

  const handleNum = (n) => {
    if (done) return;
    const newVal = inputVal + n;
    setInputVal(newVal);
    sounds.click();
    const target = step === 0 ? sum : mean;
    if (parseInt(newVal) === target) {
      sounds.correct();
      narRef.current?.cancel();
      if (step === 0) {
        if (audioEnabled) narRef.current = narrate([celebrate(`Yes! The sum is ${sum}!`), say(`Now divide by ${data.length} to find the mean.`)], true);
        setTimeout(() => { setStep(1); setInputVal(''); }, 1800);
      } else {
        setDone(true);
        if (audioEnabled) narRef.current = narrate([celebrate(`The mean is ${mean}! Brilliant!`), cheer("Every value got an equal share!")], true);
      }
    } else if (newVal.length >= String(target).length + 1) {
      sounds.wrong();
      setTimeout(() => setInputVal(''), 400);
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="station-header"><h2>⚖️ Find the Mean</h2></div>
      <p style={{ color: '#e0f7fa', marginBottom: 16, fontSize: '0.95rem', fontWeight: 600 }}>
        The mean is the "fair share" of all values.
      </p>

      <div className="simulate-tip">
        💡 Mean = (sum of all values) ÷ (number of values)
      </div>

      <DataChips data={data} highlights={{ cyan: step >= 1 ? data : [] }} />

      <div style={{ margin: '20px 0' }}>
        {step === 0 && (
          <p style={{ color: 'var(--gold)', fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 12 }}>
            Step 1: What is the sum of all values?
          </p>
        )}
        {step === 1 && (
          <p style={{ color: 'var(--teal-light)', fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 12 }}>
            Step 2: Divide {sum} by {data.length}. What is the mean?
          </p>
        )}
        <div className="sentence-row" style={{ fontSize: '1.6rem' }}>
          {step === 0 ? (
            <>
              <span className="sentence-label">{data.join(' + ')} =</span>
              <div className={`blank-input ${done ? 'correct' : inputVal ? 'filled' : ''}`}>{inputVal || '?'}</div>
            </>
          ) : (
            <>
              <span className="sentence-label">{sum} ÷ {data.length} =</span>
              <div className={`blank-input ${done ? 'correct' : inputVal ? 'filled' : ''}`}>{inputVal || '?'}</div>
            </>
          )}
        </div>
      </div>

      {!done && (
        <div className="number-pad">
          {[1,2,3,4,5,6,7,8,9,0].map(n => (
            <button key={n} className="num-pad-btn" onClick={() => handleNum(String(n))}>{n}</button>
          ))}
          <button className="num-pad-btn" onClick={() => setInputVal('')} style={{ gridColumn: 'span 2' }}>Clear</button>
        </div>
      )}

      {done && (
        <div style={{ animation: 'bounceIn 0.5s', marginTop: 20 }}>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
            <span className="stat-pill mean">μ Mean = {mean}</span>
          </div>
          <button className="btn btn-primary" onClick={onNext}>Next Station →</button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// STATION 2: Median Discovery (Sorting)
// ═══════════════════════════════════════════════════
function Station2({ audioEnabled, onNext }) {
  const rawData = useState(() => genDataSet(5, 1, 20, false))[0];
  const [sorted, setSorted] = useState(false);
  const [highlightMiddle, setHighlightMiddle] = useState(false);
  const [done, setDone] = useState(false);
  const narRef = useRef(null);

  const sortedData = [...rawData].sort((a, b) => a - b);
  const median = sortedData[2]; // index 2 for 5 items

  useEffect(() => {
    if (audioEnabled) narRef.current = narrate(simulateStation2Intro(), true);
    return () => narRef.current?.cancel();
  }, [audioEnabled]);

  const handleSort = () => {
    sounds.click();
    setSorted(true);
    setTimeout(() => {
      setHighlightMiddle(true);
      sounds.correct();
      narRef.current?.cancel();
      if (audioEnabled) narRef.current = narrate([celebrate(`The sorted data shows the median is ${median}!`), say("It sits right in the middle.")], true);
    }, 800);
    setTimeout(() => setDone(true), 1600);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="station-header"><h2>🎯 Find the Median</h2></div>
      <p style={{ color: '#e0f7fa', marginBottom: 16, fontSize: '0.95rem', fontWeight: 600 }}>
        The median is the middle value when data is sorted.
      </p>

      <div className="simulate-tip">
        💡 First sort the data, then find the middle value!
      </div>

      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: 8 }}>Unsorted data:</p>
      <DataChips data={rawData} />

      {sorted && (
        <div style={{ animation: 'slideUp 0.4s ease' }}>
          <p style={{ color: 'var(--teal-light)', fontSize: '0.85rem', margin: '12px 0 8px' }}>Sorted data:</p>
          <DataChips
            data={sortedData}
            sorted={false}
            highlights={highlightMiddle ? { gold: [median] } : {}}
          />
        </div>
      )}

      {done && (
        <div style={{ animation: 'bounceIn 0.5s', marginTop: 20 }}>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
            <span className="stat-pill median">Median = {median}</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 16 }}>
            {sortedData[1]} · <strong style={{ color: 'var(--gold)', fontSize: '1.1rem' }}>{median}</strong> · {sortedData[3]}
            &nbsp;— {median} is the middle!
          </p>
          <button className="btn btn-primary" onClick={onNext}>Next Station →</button>
        </div>
      )}

      {!sorted && (
        <button className="btn btn-teal" onClick={handleSort} style={{ marginTop: 20 }}>
          🔀 Sort the Data!
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// STATION 3: Mode & Range Discovery
// ═══════════════════════════════════════════════════
function Station3({ audioEnabled, onNext }) {
  const [data] = useState(() => genDataSet(7, 1, 10, true));
  const [showMode, setShowMode] = useState(false);
  const [showRange, setShowRange] = useState(false);
  const [round, setRound] = useState(0); // 0 = mode, 1 = range
  const narRef = useRef(null);

  useEffect(() => {
    if (audioEnabled) narRef.current = narrate(simulateStation3Intro(), true);
    return () => narRef.current?.cancel();
  }, [audioEnabled]);

  // Frequency map
  const freq = {};
  data.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
  const maxFreq = Math.max(...Object.values(freq));
  const modes = Object.keys(freq).filter(k => freq[k] === maxFreq).map(Number);
  const range = calcRange(data);
  const max = Math.max(...data);
  const min = Math.min(...data);

  // Bar chart from frequency
  const freqChart = Object.entries(freq)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([val, count]) => ({ label: val, value: count }));

  const handleRevealMode = () => {
    sounds.correct();
    setShowMode(true);
    narRef.current?.cancel();
    if (audioEnabled) narRef.current = narrate([celebrate(`The mode is ${modes.join(' and ')}!`), say("Look at the tallest bar — that's the most frequent!")], true);
    setTimeout(() => setRound(1), 1200);
  };

  const handleRevealRange = () => {
    sounds.correct();
    setShowRange(true);
    narRef.current?.cancel();
    if (audioEnabled) narRef.current = narrate([celebrate(`The range is ${range}!`), say(`${max} minus ${min} equals ${range}.`)], true);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="station-header"><h2>🏆 Mode &amp; Range</h2></div>
      <p style={{ color: '#e0f7fa', marginBottom: 16, fontSize: '0.95rem', fontWeight: 600 }}>
        Find the most popular value and the spread of data.
      </p>

      <DataChips data={data} highlights={showMode ? { gold: modes } : {}} />

      <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.8rem', margin: '8px 0 4px' }}>
        Frequency chart:
      </p>
      <MiniBarChart data={freqChart} />

      {round === 0 && !showMode && (
        <div style={{ marginTop: 16 }}>
          <p style={{ color: 'var(--gold)', fontFamily: 'var(--font-display)', marginBottom: 12 }}>
            Which value appears most often in the data?
          </p>
          <button className="btn btn-teal btn-sm" onClick={handleRevealMode}>
            🏆 Reveal the Mode
          </button>
        </div>
      )}

      {showMode && (
        <div style={{ animation: 'bounceIn 0.4s', marginTop: 12 }}>
          <span className="stat-pill mode">Mode = {modes.join(', ')}</span>
        </div>
      )}

      {round === 1 && !showRange && (
        <div style={{ marginTop: 20 }}>
          <p style={{ color: 'var(--coral)', fontFamily: 'var(--font-display)', marginBottom: 8 }}>
            Now find the range: Largest − Smallest = ?
          </p>
          <div className="data-set-display">
            <div className="data-value-chip highlight-green">{min}</div>
            <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)', alignSelf: 'center' }}>→</span>
            <div className="data-value-chip highlight">{max}</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={handleRevealRange} style={{ marginTop: 12 }}>
            📐 Calculate Range
          </button>
        </div>
      )}

      {showRange && (
        <div style={{ animation: 'bounceIn 0.4s', marginTop: 12 }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 8 }}>
            {max} − {min} = {range}
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
            <span className="stat-pill mode">Mode = {modes.join(', ')}</span>
            <span className="stat-pill range">Range = {range}</span>
          </div>
          <button className="btn btn-primary" onClick={onNext}>Next Station →</button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// STATION 4: Probability Simulation — Dice Roller
// ═══════════════════════════════════════════════════
const DICE_DOTS = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 1], [0, 2], [2, 0], [2, 1], [2, 2]],
};

function DiceFace({ value, onClick, size = 56 }) {
  const dots = DICE_DOTS[value] || [];
  return (
    <div
      className="dice-face"
      onClick={onClick}
      style={{ width: size, height: size, cursor: onClick ? 'pointer' : 'default' }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '1fr 1fr 1fr', width: '100%', height: '100%' }}>
        {Array.from({ length: 9 }, (_, i) => {
          const row = Math.floor(i / 3);
          const col = i % 3;
          const hasDot = dots.some(([r, c]) => r === row && c === col);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {hasDot && <div className="dice-dot" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Station4({ audioEnabled, onComplete }) {
  const [rolls, setRolls] = useState([]);
  const [currentRoll, setCurrentRoll] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [totalRolls, setTotalRolls] = useState(0);
  const narRef = useRef(null);

  useEffect(() => {
    if (audioEnabled) narRef.current = narrate(simulateProbabilityIntro(), true);
    return () => narRef.current?.cancel();
  }, [audioEnabled]);

  const rollDice = () => {
    if (rolling) return;
    setRolling(true);
    sounds.click();
    let count = 0;
    const interval = setInterval(() => {
      setCurrentRoll(randInt(1, 6));
      count++;
      if (count > 8) {
        clearInterval(interval);
        const result = randInt(1, 6);
        setCurrentRoll(result);
        setRolls(prev => [...prev, result]);
        setTotalRolls(t => t + 1);
        setRolling(false);
        sounds.correct();
      }
    }, 80);
  };

  const freq = {};
  rolls.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
  const freqChart = [1, 2, 3, 4, 5, 6].map(v => ({ label: String(v), value: freq[v] || 0 }));
  const canComplete = totalRolls >= 10;

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="station-header"><h2>🎲 Explore Probability</h2></div>
      <p style={{ color: '#e0f7fa', marginBottom: 8, fontSize: '0.95rem', fontWeight: 600 }}>
        Roll the dice and record the results. What do you notice?
      </p>
      <div className="simulate-tip">
        💡 Probability of any face = 1/6 ≈ 16.7%
      </div>

      <div style={{ display: 'flex', gap: 24, justifyContent: 'center', alignItems: 'center', margin: '20px 0' }}>
        <div>
          <DiceFace value={currentRoll || 1} onClick={!rolling ? rollDice : null} size={80} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: 4 }}>
            {rolling ? 'Rolling…' : 'Click to roll!'}
          </p>
        </div>
        <div>
          <p style={{ color: 'var(--gold)', fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>
            {totalRolls} rolls
          </p>
          {currentRoll && (
            <p style={{ color: 'var(--teal-light)', fontSize: '0.9rem' }}>
              Last: {currentRoll}
            </p>
          )}
        </div>
      </div>

      {totalRolls > 0 && (
        <div style={{ animation: 'slideUp 0.3s' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: 8 }}>
            Frequency of each face after {totalRolls} rolls:
          </p>
          <MiniBarChart data={freqChart} maxVal={Math.max(...Object.values(freq), 3)} />
        </div>
      )}

      {totalRolls >= 6 && (
        <div style={{ animation: 'slideUp 0.4s', marginTop: 16 }}>
          <div className="probability-bar">
            <div
              className="probability-fill"
              style={{
                width: `${Math.min((freq[1] || 0) / totalRolls * 100, 100)}%`,
                background: 'linear-gradient(90deg, #00bcd4, #4caf50)',
              }}
            >
              P(1) ≈ {totalRolls > 0 ? ((freq[1] || 0) / totalRolls).toFixed(2) : '0'}
            </div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            Experimental probability of rolling 1 (theoretical: 0.17)
          </p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
        <button
          className="btn btn-outline btn-sm"
          onClick={rollDice}
          disabled={rolling}
        >
          🎲 Roll Again
        </button>
        {canComplete && (
          <button className="btn btn-green" onClick={onComplete} style={{ animation: 'bounceIn 0.5s' }}>
            🎉 Complete Simulation!
          </button>
        )}
      </div>
      {!canComplete && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 8 }}>
          Roll at least 10 times to unlock next stage ({totalRolls}/10)
        </p>
      )}
    </div>
  );
}

// ─── Main SimulatePhase ───────────────────────────
const STATIONS = [
  { id: 0, title: 'Mean Discovery',   icon: '⚖️' },
  { id: 1, title: 'Median Sorting',   icon: '🎯' },
  { id: 2, title: 'Mode & Range',     icon: '🏆' },
  { id: 3, title: 'Probability',      icon: '🎲' },
];

export default function SimulatePhase({ onComplete, audioEnabled }) {
  const [station, setStation] = useState(0);
  const next = useCallback(() => { if (station < STATIONS.length - 1) setStation(s => s + 1); }, [station]);

  return (
    <div className="simulate-phase">
      <div className="simulate-header">
        <h3 className="simulate-label">🧪 Simulate</h3>
        <p className="simulate-sublabel">Explore and discover — no wrong answers here!</p>
      </div>

      <div className="progress-dots">
        {STATIONS.map((s, i) => (
          <div key={i} className="simulate-dot-wrapper">
            <div className={`progress-dot ${i === station ? 'active' : i < station ? 'completed' : ''}`} />
            <span className="simulate-dot-label">{s.icon}</span>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ maxWidth: 720, width: '100%', animation: 'slideUp 0.4s ease' }}>
        {station === 0 && <Station1 audioEnabled={audioEnabled} onNext={next} />}
        {station === 1 && <Station2 audioEnabled={audioEnabled} onNext={next} />}
        {station === 2 && <Station3 audioEnabled={audioEnabled} onNext={next} />}
        {station === 3 && <Station4 audioEnabled={audioEnabled} onComplete={onComplete} />}
      </div>
    </div>
  );
}
