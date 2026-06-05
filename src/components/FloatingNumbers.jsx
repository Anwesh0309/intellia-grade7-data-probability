import { useMemo } from 'react';
import './FloatingNumbers.css';

const SYMBOLS = ['μ', 'σ', '∑', 'P', '%', '?', '≥', '≤', '∞', '~', 'x̄', 'n'];
const EMOJIS  = ['📊', '🎲', '📈', '🔢', '🎯', '⭐', '💎', '🔮'];

// Mix of text symbols AND bubbles
function buildItems() {
  const items = [];
  // 14 floating symbol bubbles
  for (let i = 0; i < 14; i++) {
    items.push({
      id: `sym-${i}`,
      type: 'symbol',
      content: SYMBOLS[i % SYMBOLS.length],
      x: 3 + (i / 14) * 94,
      size: 0.9 + Math.random() * 0.8,
      delay: Math.random() * 16,
      duration: 16 + Math.random() * 12,
      opacity: 0.12 + Math.random() * 0.1,
    });
  }
  // 10 emoji bubbles
  for (let i = 0; i < 10; i++) {
    items.push({
      id: `emoji-${i}`,
      type: 'emoji',
      content: EMOJIS[i % EMOJIS.length],
      x: 5 + Math.random() * 90,
      size: 1.1 + Math.random() * 0.9,
      delay: Math.random() * 20,
      duration: 18 + Math.random() * 14,
      opacity: 0.18 + Math.random() * 0.1,
    });
  }
  // 8 pure glass bubbles (no text)
  for (let i = 0; i < 8; i++) {
    items.push({
      id: `bubble-${i}`,
      type: 'bubble',
      content: '',
      x: 5 + Math.random() * 90,
      size: 1.8 + Math.random() * 2.4, // rem → used as px via em in CSS
      delay: Math.random() * 18,
      duration: 20 + Math.random() * 16,
      opacity: 0.08 + Math.random() * 0.08,
    });
  }
  return items;
}

export default function FloatingNumbers() {
  const items = useMemo(buildItems, []);

  return (
    <div className="floating-numbers" aria-hidden="true">
      {items.map(item => {
        if (item.type === 'bubble') {
          return (
            <div
              key={item.id}
              className="float-bubble"
              style={{
                left: `${item.x}%`,
                width:  `${item.size * 28}px`,
                height: `${item.size * 28}px`,
                animationDelay:    `${item.delay}s`,
                animationDuration: `${item.duration}s`,
                opacity: item.opacity,
              }}
            />
          );
        }
        return (
          <span
            key={item.id}
            className={`floating-number ${item.type === 'emoji' ? 'float-emoji' : ''}`}
            style={{
              left: `${item.x}%`,
              fontSize: `${item.size}rem`,
              animationDelay:    `${item.delay}s`,
              animationDuration: `${item.duration}s`,
              opacity: item.opacity,
            }}
          >
            {item.content}
          </span>
        );
      })}
    </div>
  );
}
