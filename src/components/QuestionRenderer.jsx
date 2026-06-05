import { useState } from 'react';
import { sounds } from '../utils/audio';

// Mini bar chart for graph questions
function MiniBar({ chartData }) {
  if (!chartData) return null;
  const max = Math.max(...chartData.map(d => d.value));
  const colors = ['#00bcd4', '#4caf50', '#ffc107', '#ff7043', '#9c27b0', '#e91e63'];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100, margin: '12px auto', justifyContent: 'center', maxWidth: 380 }}>
      {chartData.map((d, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700 }}>{d.value}</span>
          <div style={{
            width: 32,
            height: `${Math.round((d.value / max) * 80)}px`,
            background: colors[i % colors.length],
            borderRadius: '4px 4px 0 0',
            minHeight: 4,
          }} />
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', maxWidth: 36, textAlign: 'center', lineHeight: 1.2 }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// Data chips display
function DataRow({ dataSet, sorted }) {
  if (!dataSet) return null;
  const display = sorted ? [...dataSet].sort((a, b) => a - b) : dataSet;
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', margin: '8px 0' }}>
      {display.map((v, i) => (
        <div key={i} style={{
          width: 40, height: 40, borderRadius: 8,
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem',
        }}>{v}</div>
      ))}
    </div>
  );
}

export default function QuestionRenderer({ question, onAnswer, disabled }) {
  const [selected, setSelected] = useState(null);

  if (!question) return null;

  const handleSelect = (opt) => {
    if (disabled || selected !== null) return;
    setSelected(opt.value);
    sounds.click();
    const isCorrect = String(opt.value) === String(question.correctAnswer);
    onAnswer(isCorrect);
  };

  // Stat type badge
  const statBadge = {
    mean:        { label: 'Mean',        color: '#00bcd4', emoji: '⚖️' },
    median:      { label: 'Median',      color: '#4caf50', emoji: '🎯' },
    mode:        { label: 'Mode',        color: '#ffc107', emoji: '🏆' },
    range:       { label: 'Range',       color: '#ff7043', emoji: '📐' },
    probability: { label: 'Probability', color: '#9c27b0', emoji: '🎲' },
    graph:       { label: 'Graph',       color: '#e91e63', emoji: '📊' },
  }[question.statType] || { label: 'Question', color: '#607d8b', emoji: '❓' };

  return (
    <>
      {/* Badge */}
      <div style={{ marginBottom: 12 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 14px', borderRadius: 999,
          background: `${statBadge.color}22`, border: `1px solid ${statBadge.color}55`,
          color: statBadge.color, fontSize: '0.8rem', fontWeight: 700,
          fontFamily: 'var(--font-display)',
        }}>
          {statBadge.emoji} {statBadge.label}
        </span>
      </div>

      {/* Chart or Data set visual */}
      {question.chartData && <MiniBar chartData={question.chartData} />}
      {question.dataSet && !question.chartData && (
        <DataRow dataSet={question.dataSet} sorted={question.type === 'median'} />
      )}

      {/* Question Text */}
      <p className="question-text">{question.questionText}</p>

      {/* Options */}
      <div className="options-grid">
        {question.options.map((opt, i) => {
          let cls = 'option-btn';
          if (disabled) {
            if (String(opt.value) === String(question.correctAnswer)) cls += ' correct';
            else if (String(opt.value) === String(selected)) cls += ' wrong';
            else cls += ' disabled';
          } else if (String(selected) === String(opt.value)) {
            cls += ' selected';
          }
          return (
            <button key={i} className={cls} onClick={() => handleSelect(opt)}>
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Explanation (shown after answer) */}
      {disabled && question.explanation && (
        <div className="hint-text">
          <span>💡</span>
          <span>{question.explanation}</span>
        </div>
      )}
    </>
  );
}
