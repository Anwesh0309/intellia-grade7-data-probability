import { useState, useEffect, useCallback, useRef } from 'react';
import { narrate, stopNarration, preloadNarration } from '../utils/audio';
import { getStoryNarration } from '../utils/narration';

// ─── Story slides data ─────────────────────────────────────────────────────────
const STORY_SLIDES = [
  {
    imageSrc: '/images/story_slide_1.png',
    title: "Emma & Liam's Data Quest",
    objective: '🎯 LEARNING OBJECTIVE: UNDERSTAND DATA & PROBABILITY',
    text: 'Emma and Liam are two curious friends who travel the world collecting data. On every adventure, they use maths to understand what they find. Today they begin their biggest quest yet — mastering Data and Probability!',
    highlight: '"Data tells the story of the world around us!"',
    mascotText: 'Let the adventure begin! 🗺️'
  },
  {
    imageSrc: '/images/story_slide_2.png',
    title: 'Numbers Everywhere',
    objective: '🎯 LEARNING OBJECTIVE: READ & COLLECT DATA SETS',
    text: 'At the city market, Emma notices price tags, quantities, and scores on the board. "So many numbers!" she says. Liam smiles: "Each one is a data point. Together they tell us something amazing."',
    highlight: '"A collection of numbers is called a data set!"',
    mascotText: 'Collect them all! 🔢'
  },
  {
    imageSrc: '/images/story_slide_3.png',
    title: 'The Mean — Fair Share',
    objective: '🎯 LEARNING OBJECTIVE: CALCULATE THE MEAN (FAIR SHARE)',
    text: 'Emma has 5 bags of coins: 4, 6, 8, 2, and 10 coins. "How do I share them fairly?" she asks. Liam adds them all up: 30 total, divided by 5 bags — that is 6 each! This fair-share number is called the mean.',
    highlight: '"Mean = Sum of all values ÷ Number of values"',
    mascotText: '4+6+8+2+10 = 30 ÷ 5 = 6! 🪙'
  },
  {
    imageSrc: '/images/story_slide_4.png',
    title: 'The Median — Middle Ground',
    objective: '🎯 LEARNING OBJECTIVE: FIND THE MEDIAN (MIDDLE VALUE)',
    text: 'Liam lines up 7 friends by height and sorts them from shortest to tallest. The person standing right in the middle is the median! With numbers: sort first, then find the middle value.',
    highlight: '"Median = Middle value of sorted data"',
    mascotText: 'Sort first, then find the middle! 📏'
  },
  {
    imageSrc: '/images/story_slide_5.png',
    title: 'The Mode — Most Popular',
    objective: '🎯 LEARNING OBJECTIVE: IDENTIFY THE MODE (MOST FREQUENT)',
    text: 'At Emma\'s Data Café, orders are: 5 coffees, 3 teas, 5 juices, 2 hot chocolates. Coffee and juice both appear 5 times — the most! When a value appears most often, it is the mode.',
    highlight: '"Mode = The value that appears most often"',
    mascotText: 'The mode can appear more than once! ☕'
  },
  {
    imageSrc: '/images/story_slide_6.png',
    title: 'The Range — Spread of Data',
    objective: '🎯 LEARNING OBJECTIVE: MEASURE THE RANGE (SPREAD OF DATA)',
    text: 'The weekly temperatures: 18, 24, 30, 15, 27°C. Wednesday is the hottest, Thursday the coldest. Liam subtracts: 30 − 15 = 15. The range of 15°C shows how spread out the data is!',
    highlight: '"Range = Highest value − Lowest value"',
    mascotText: 'Range shows how spread out data is! 🌡️'
  },
  {
    imageSrc: '/images/story_slide_7.png',
    title: 'Into the World of Probability',
    objective: '🎯 LEARNING OBJECTIVE: CALCULATE PROBABILITY OF EVENTS',
    text: 'Emma and Liam spin a wheel with 4 equal sections: red, blue, green, yellow. Each colour has a 1 in 4 chance — written as 1/4, 0.25, or 25%. Probability is the science of measuring chance!',
    highlight: '"Probability = Favourable outcomes ÷ Total outcomes"',
    mascotText: 'P always falls between 0 and 1! 🎯'
  },
];

export default function StoryPhase({ onComplete, audioEnabled }) {
  const [slide, setSlide]       = useState(0);
  const [anim, setAnim]         = useState(false);
  const [textVis, setTextVis]   = useState(false);
  const [hlVis, setHlVis]       = useState(false);
  const narRef                  = useRef(null);

  const s      = STORY_SLIDES[slide];
  const isLast = slide === STORY_SLIDES.length - 1;

  useEffect(() => {
    if (audioEnabled) {
      preloadNarration(getStoryNarration(slide));
      if (slide + 1 < STORY_SLIDES.length) preloadNarration(getStoryNarration(slide + 1));
    }
  }, [slide, audioEnabled]);

  useEffect(() => {
    setTextVis(false); setHlVis(false);
    const t1 = setTimeout(() => setTextVis(true), 100);
    const t2 = setTimeout(() => setHlVis(true), 800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [slide]);

  useEffect(() => {
    if (textVis && audioEnabled) {
      narRef.current?.cancel();
      narRef.current = narrate(getStoryNarration(slide), true);
    }
    return () => narRef.current?.cancel();
  }, [textVis, slide, audioEnabled]);

  const goNext = useCallback(() => {
    if (anim) return;
    narRef.current?.cancel(); stopNarration();
    setAnim(true);
    setTimeout(() => { isLast ? onComplete() : setSlide(i => i + 1); setAnim(false); }, 400);
  }, [anim, isLast, onComplete]);

  const goPrev = useCallback(() => {
    if (anim || slide === 0) return;
    narRef.current?.cancel(); stopNarration();
    setAnim(true);
    setTimeout(() => { setSlide(i => i - 1); setAnim(false); }, 400);
  }, [anim, slide]);

  return (
    <div className="story-phase">
      {/* Top Learning Objective Pill */}
      <div className="learning-objective-pill">
        {s.objective}
      </div>

      {/* Main Side-by-Side Story Card */}
      <div className={`story-card-sidebyside ${anim ? 'flipping' : ''}`}>
        {/* Left Half: Image */}
        <div className="story-left-col">
          <img src={s.imageSrc} alt={s.title} className="story-cover-image" />
        </div>

        {/* Right Half: Content */}
        <div className="story-right-col">
          <div>
            <h2 className="story-title">{s.title}</h2>
            <p className={`story-text ${textVis ? 'revealed' : ''}`}>{s.text}</p>
          </div>

          <div className={`story-highlight-pill ${hlVis ? 'visible' : ''}`}>
            <span>✨</span>
            <span className="story-highlight-text">{s.highlight}</span>
            <span>✨</span>
          </div>

          <div className="story-mascot-row">
            <div className="story-mascot-avatar">🦉</div>
            <div className="story-speech-bubble">
              {s.mascotText}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="story-nav-bottom">
        <button
          className="story-nav-btn back"
          onClick={goPrev}
          disabled={slide === 0}
          style={{ opacity: slide === 0 ? 0.3 : 1 }}
        >
          ‹ Back
        </button>

        <div className="story-dots">
          {STORY_SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`story-dot ${i === slide ? 'active' : i < slide ? 'completed' : ''}`}
              onClick={() => { narRef.current?.cancel(); stopNarration(); setSlide(i); }}
              title={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        <button
          className={`story-nav-btn next ${isLast ? 'btn-green-glow' : ''}`}
          onClick={goNext}
        >
          {isLast ? "Let's Explore! ›" : 'Next ›'}
        </button>
      </div>
    </div>
  );
}
