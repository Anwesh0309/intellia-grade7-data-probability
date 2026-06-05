import { useState, useEffect, useCallback, useRef } from 'react';
import { narrate, stopNarration, preloadNarration } from '../utils/audio';
import { getStoryNarration } from '../utils/narration';

// ─── Helper: reusable character bodies ───────────────────────────────────────
function Emma({ x = 0, y = 0, scale = 1 }) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      {/* Shadow */}
      <ellipse cx="0" cy="72" rx="22" ry="6" fill="rgba(0,0,0,0.25)"/>
      {/* Legs */}
      <rect x="-10" y="44" width="9" height="28" rx="4" fill="#880e4f"/>
      <rect x="1"   y="44" width="9" height="28" rx="4" fill="#880e4f"/>
      {/* Shoes */}
      <ellipse cx="-6"  cy="73" rx="8" ry="4" fill="#4a148c"/>
      <ellipse cx="5"   cy="73" rx="8" ry="4" fill="#4a148c"/>
      {/* Body */}
      <rect x="-14" y="14" width="28" height="32" rx="6" fill="#e91e63"/>
      {/* Belt */}
      <rect x="-14" y="38" width="28" height="5" rx="2" fill="#880e4f"/>
      {/* Arms */}
      <rect x="-24" y="16" width="11" height="24" rx="5" fill="#e91e63"/>
      <rect x="13"  y="16" width="11" height="24" rx="5" fill="#e91e63"/>
      {/* Hands */}
      <circle cx="-19" cy="42" r="5" fill="#FDBCB4"/>
      <circle cx="18"  cy="42" r="5" fill="#FDBCB4"/>
      {/* Neck */}
      <rect x="-5" y="6" width="10" height="10" rx="3" fill="#FDBCB4"/>
      {/* Head */}
      <ellipse cx="0" cy="-8" rx="18" ry="20" fill="#FDBCB4"/>
      {/* Hair */}
      <ellipse cx="0" cy="-24" rx="18" ry="10" fill="#4e342e"/>
      <rect x="-18" y="-18" width="6" height="20" rx="3" fill="#4e342e"/>
      <rect x="12"  y="-18" width="6" height="20" rx="3" fill="#4e342e"/>
      {/* Eyes */}
      <ellipse cx="-7" cy="-10" rx="4" ry="4.5" fill="white"/>
      <ellipse cx="7"  cy="-10" rx="4" ry="4.5" fill="white"/>
      <circle cx="-7" cy="-10" r="2.5" fill="#4e342e"/>
      <circle cx="7"  cy="-10" r="2.5" fill="#4e342e"/>
      <circle cx="-6" cy="-11" r="1" fill="white"/>
      <circle cx="8"  cy="-11" r="1" fill="white"/>
      {/* Smile */}
      <path d="M-6,-1 Q0,4 6,-1" stroke="#c2185b" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      {/* Cheeks */}
      <ellipse cx="-11" cy="-4" rx="4" ry="3" fill="#f48fb1" opacity="0.5"/>
      <ellipse cx="11"  cy="-4" rx="4" ry="3" fill="#f48fb1" opacity="0.5"/>
    </g>
  );
}

function Liam({ x = 0, y = 0, scale = 1 }) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <ellipse cx="0" cy="72" rx="22" ry="6" fill="rgba(0,0,0,0.25)"/>
      <rect x="-10" y="44" width="9" height="28" rx="4" fill="#1a237e"/>
      <rect x="1"   y="44" width="9" height="28" rx="4" fill="#1a237e"/>
      <ellipse cx="-6"  cy="73" rx="8" ry="4" fill="#263238"/>
      <ellipse cx="5"   cy="73" rx="8" ry="4" fill="#263238"/>
      <rect x="-14" y="14" width="28" height="32" rx="6" fill="#1565c0"/>
      {/* Collar */}
      <polygon points="0,14 -6,26 6,26" fill="white" opacity="0.9"/>
      <rect x="-14" y="38" width="28" height="5" rx="2" fill="#0d47a1"/>
      <rect x="-24" y="16" width="11" height="24" rx="5" fill="#1565c0"/>
      <rect x="13"  y="16" width="11" height="24" rx="5" fill="#1565c0"/>
      <circle cx="-19" cy="42" r="5" fill="#FDBCB4"/>
      <circle cx="18"  cy="42" r="5" fill="#FDBCB4"/>
      <rect x="-5" y="6" width="10" height="10" rx="3" fill="#FDBCB4"/>
      <ellipse cx="0" cy="-8" rx="18" ry="20" fill="#FDBCB4"/>
      {/* Short hair */}
      <ellipse cx="0" cy="-26" rx="18" ry="8" fill="#1a237e"/>
      <rect x="-18" y="-26" width="36" height="14" rx="4" fill="#1a237e"/>
      <ellipse cx="-7" cy="-10" rx="4" ry="4.5" fill="white"/>
      <ellipse cx="7"  cy="-10" rx="4" ry="4.5" fill="white"/>
      <circle cx="-7" cy="-10" r="2.5" fill="#1a237e"/>
      <circle cx="7"  cy="-10" r="2.5" fill="#1a237e"/>
      <circle cx="-6" cy="-11" r="1" fill="white"/>
      <circle cx="8"  cy="-11" r="1" fill="white"/>
      <path d="M-6,-1 Q0,4 6,-1" stroke="#1565c0" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <ellipse cx="-11" cy="-4" rx="4" ry="3" fill="#ffcc80" opacity="0.4"/>
      <ellipse cx="11"  cy="-4" rx="4" ry="3" fill="#ffcc80" opacity="0.4"/>
    </g>
  );
}

// ─── Slide 1: Night Adventure Landscape ──────────────────────────────────────
function IllustrationAdventure() {
  return (
    <svg viewBox="0 0 640 240" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <defs>
        <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#fff9c4" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="#fff9c4" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#050d1f"/>
          <stop offset="100%" stopColor="#0d2744"/>
        </linearGradient>
        <linearGradient id="hillGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#00695c"/>
          <stop offset="100%" stopColor="#004d40"/>
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Sky */}
      <rect width="640" height="240" fill="url(#skyGrad)"/>

      {/* Moon */}
      <circle cx="540" cy="48" r="36" fill="url(#moonGlow)"/>
      <circle cx="540" cy="48" r="26" fill="#fff9c4" opacity="0.95"/>
      <circle cx="552" cy="40" r="18" fill="#0d2744"/>

      {/* Stars */}
      {[[30,18],[80,35],[150,12],[240,28],[360,15],[420,42],[490,22],[60,55],[200,48],[320,38],[560,70],[610,30]].map(([cx,cy],i)=>(
        <g key={i}>
          <circle cx={cx} cy={cy} r={i%3===0?2:1.2} fill="white" opacity={0.6+i%3*0.15}/>
          {i%4===0 && <circle cx={cx} cy={cy} r={4} fill="white" opacity="0.1"/>}
        </g>
      ))}

      {/* Mountains back */}
      <polygon points="0,200 100,90 200,200"  fill="#0d1f3e" opacity="0.9"/>
      <polygon points="140,200 260,55 380,200" fill="#102040" opacity="0.95"/>
      <polygon points="320,200 460,65 600,200" fill="#0a1830" opacity="0.9"/>
      <polygon points="520,200 620,100 660,200" fill="#0d1f3e" opacity="0.8"/>
      {/* Snow caps */}
      <polygon points="260,55 238,95 282,95"  fill="white" opacity="0.7"/>
      <polygon points="460,65 440,100 480,100" fill="white" opacity="0.6"/>

      {/* Ground */}
      <ellipse cx="320" cy="215" rx="320" ry="40" fill="url(#hillGrad)"/>
      <rect y="210" width="640" height="30" fill="#004d40"/>

      {/* Path */}
      <path d="M280,240 Q320,205 360,240" fill="none" stroke="#00897b" strokeWidth="18" opacity="0.5"/>
      <path d="M280,240 Q320,205 360,240" fill="none" stroke="#4db6ac" strokeWidth="6" opacity="0.4"/>

      {/* Trees */}
      {[[80,185],[160,175],[460,175],[540,185]].map(([tx,ty],i)=>(
        <g key={i} transform={`translate(${tx},${ty})`}>
          <rect x="-4" y="-10" width="8" height="18" rx="2" fill="#4e342e"/>
          <polygon points="0,-38 -16,-8 16,-8" fill="#1b5e20"/>
          <polygon points="0,-52 -12,-22 12,-22" fill="#2e7d32"/>
          <polygon points="0,-64 -8,-36 8,-36"  fill="#388e3c"/>
        </g>
      ))}

      {/* Characters */}
      <Emma  x={248} y={148} scale={0.82}/>
      <Liam  x={370} y={148} scale={0.82}/>

      {/* Data chart floating between them */}
      <g transform="translate(295,85)">
        <rect x="0" y="0" width="50" height="38" rx="5" fill="rgba(10,20,50,0.85)" stroke="#ffd54f" strokeWidth="1.5"/>
        {[0,1,2,3].map(i=>(
          <rect key={i} x={4+i*11} y={30-[12,20,28,16][i]} width="8" height={[12,20,28,16][i]} rx="2"
            fill={['#ef5350','#42a5f5','#ffd54f','#66bb6a'][i]}/>
        ))}
        <text x="25" y="10" textAnchor="middle" fontSize="5.5" fill="#ffd54f" fontFamily="sans-serif" fontWeight="bold">DATA</text>
      </g>

      {/* Banner */}
      <rect x="150" y="8" width="340" height="34" rx="10" fill="rgba(0,0,0,0.65)" stroke="#ffd54f" strokeWidth="1.5"/>
      <text x="320" y="30" textAnchor="middle" fill="#ffd54f" fontSize="14" fontWeight="bold" fontFamily="sans-serif">✨ The Data Quest Begins! ✨</text>
    </svg>
  );
}

// ─── Slide 2: Vibrant City Market ─────────────────────────────────────────────
function IllustrationMarket() {
  const stalls = [
    { x: 30,  color:'#c62828', top:'#e53935', item:'🍎', label:'Apples', price:'$12', count:12 },
    { x: 185, color:'#1565c0', top:'#1976d2', item:'📦', label:'Boxes',  price:'$8',  count:8  },
    { x: 340, color:'#2e7d32', top:'#388e3c', item:'🥕', label:'Carrots',price:'$15', count:15 },
    { x: 490, color:'#6a1b9a', top:'#7b1fa2', item:'🎀', label:'Ribbons',price:'$6',  count:6  },
  ];
  return (
    <svg viewBox="0 0 640 240" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <defs>
        <linearGradient id="mkBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#0d2744"/>
          <stop offset="100%" stopColor="#1a1a2e"/>
        </linearGradient>
      </defs>
      <rect width="640" height="240" fill="url(#mkBg)"/>

      {/* Hanging lights */}
      <line x1="0" y1="30" x2="640" y2="30" stroke="#ffd54f" strokeWidth="1.5" opacity="0.5"/>
      {Array.from({length:16},(_,i)=>(
        <g key={i}>
          <line x1={20+i*40} y1="30" x2={20+i*40} y2={44+(i%3)*8} stroke="#ffd54f" strokeWidth="1" opacity="0.5"/>
          <circle cx={20+i*40} cy={46+(i%3)*8} r={4} fill={['#ffd54f','#ef5350','#42a5f5','#66bb6a'][i%4]} opacity="0.9"/>
          <circle cx={20+i*40} cy={46+(i%3)*8} r={7} fill={['#ffd54f','#ef5350','#42a5f5','#66bb6a'][i%4]} opacity="0.15"/>
        </g>
      ))}

      {/* Stalls */}
      {stalls.map((s,i)=>(
        <g key={i}>
          {/* Stall body */}
          <rect x={s.x} y="75" width="120" height="115" rx="5" fill={s.color}/>
          {/* Awning */}
          <path d={`M${s.x-8},75 L${s.x+128},75 L${s.x+110},48 L${s.x+10},48 Z`} fill={s.top}/>
          {/* Awning stripe */}
          {[0,1,2].map(j=>(
            <line key={j} x1={s.x+18+j*30} y1="75" x2={s.x+10+j*28} y2="48" stroke="rgba(255,255,255,0.2)" strokeWidth="8"/>
          ))}
          {/* Counter */}
          <rect x={s.x} y="162" width="120" height="18" rx="3" fill="rgba(0,0,0,0.3)"/>
          {/* Price tag */}
          <rect x={s.x+8} y="84" width="44" height="22" rx="5" fill="white"/>
          <text x={s.x+30} y="99" textAnchor="middle" fontSize="11" fontWeight="bold" fill={s.color} fontFamily="sans-serif">{s.price}</text>
          {/* Item emoji */}
          <text x={s.x+60} y="148" textAnchor="middle" fontSize="30" fontFamily="sans-serif">{s.item}</text>
          {/* Label */}
          <text x={s.x+60} y="195" textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.9)" fontFamily="sans-serif" fontWeight="600">{s.label}</text>
          {/* Count badge */}
          <circle cx={s.x+100} cy="86" r="13" fill="#ffd54f"/>
          <text x={s.x+100} y="91" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1a1a2e" fontFamily="sans-serif">{s.count}</text>
        </g>
      ))}

      {/* Data board top-centre */}
      <rect x="210" y="3" width="220" height="42" rx="8" fill="rgba(0,0,0,0.8)" stroke="#ffd54f" strokeWidth="2"/>
      <text x="320" y="20" textAnchor="middle" fill="#ffd54f" fontSize="11" fontWeight="bold" fontFamily="sans-serif">📊 SALES DATA BOARD</text>
      <text x="230" y="35" fill="white" fontSize="9" fontFamily="sans-serif">🍎×12  📦×8  🥕×15  🎀×6</text>

      {/* Floor */}
      <rect y="205" width="640" height="35" fill="#0d1b2a"/>
      <line x1="0" y1="205" x2="640" y2="205" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>

      {/* Emma in foreground */}
      <Emma x={320} y={148} scale={0.75}/>
      <text x="320" y="232" textAnchor="middle" fontSize="10" fill="#f48fb1" fontFamily="sans-serif" fontWeight="bold">Emma</text>
    </svg>
  );
}

// ─── Slide 3: Mean — Coin Bags with balance scale ─────────────────────────────
function IllustrationMean() {
  const counts = [4, 6, 8, 2, 10];
  const colors = ['#ef5350','#42a5f5','#ffd54f','#66bb6a','#ce93d8'];
  const maxH   = Math.max(...counts);
  return (
    <svg viewBox="0 0 640 240" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <defs>
        <linearGradient id="mnBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#0a1628"/>
          <stop offset="100%" stopColor="#0d2240"/>
        </linearGradient>
        <linearGradient id="tableGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#5d4037"/>
          <stop offset="100%" stopColor="#3e2723"/>
        </linearGradient>
      </defs>
      <rect width="640" height="240" fill="url(#mnBg)"/>

      {/* Formula banner */}
      <rect x="150" y="8" width="340" height="38" rx="10" fill="rgba(255,193,7,0.15)" stroke="#ffd54f" strokeWidth="2"/>
      <text x="320" y="24" textAnchor="middle" fill="white" fontSize="12" fontFamily="sans-serif">4 + 6 + 8 + 2 + 10 = 30</text>
      <text x="320" y="40" textAnchor="middle" fill="#ffd54f" fontSize="13" fontWeight="bold" fontFamily="sans-serif">Mean = 30 ÷ 5 = 6 🪙</text>

      {/* Table surface */}
      <rect x="50" y="178" width="540" height="16" rx="5" fill="url(#tableGrad)"/>
      <rect x="60" y="194" width="20" height="38" rx="4" fill="#4e342e"/>
      <rect x="560" y="194" width="20" height="38" rx="4" fill="#4e342e"/>

      {/* Bags */}
      {counts.map((c,i)=>{
        const x  = 90 + i * 100;
        const bh = (c / maxH) * 105 + 24;
        return (
          <g key={i}>
            {/* Bag shadow */}
            <ellipse cx={x+25} cy="180" rx="24" ry="6" fill="rgba(0,0,0,0.35)"/>
            {/* Bag body */}
            <rect x={x} y={178-bh} width="50" height={bh} rx="10" fill={colors[i]}/>
            {/* Bag shine */}
            <ellipse cx={x+14} cy={180-bh+14} rx="9" ry="12" fill="white" opacity="0.2"/>
            {/* Tie at top */}
            <ellipse cx={x+25} cy={178-bh}   rx="25" ry="9"  fill={colors[i]}/>
            <rect    x={x+18}  y={178-bh-10} width="14" height="14" rx="3" fill={colors[i]} opacity="0.8"/>
            <ellipse cx={x+25} cy={178-bh-10} rx="8"  ry="6"  fill="rgba(0,0,0,0.2)"/>
            {/* Count label */}
            <text x={x+25} y={185-bh} textAnchor="middle" fontSize="16" fontWeight="bold" fill="#1a1a2e" fontFamily="sans-serif">{c}</text>
            {/* Coin icons */}
            {Array.from({length:Math.min(c,5)},(_,j)=>(
              <circle key={j} cx={x+10+j*7} cy={170-bh/2} r="4" fill="#ffd54f" opacity="0.7"/>
            ))}
            {/* Bag label */}
            <text x={x+25} y="200" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.7)" fontFamily="sans-serif">bag {i+1}</text>
          </g>
        );
      })}

      {/* Mean level dashed line */}
      <line x1="75" y1="108" x2="565" y2="108" stroke="#ffd54f" strokeWidth="2.5" strokeDasharray="10,6"/>
      <rect x="570" y="98" width="58" height="20" rx="6" fill="#ffd54f"/>
      <text x="599" y="112" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1a1a2e" fontFamily="sans-serif">Mean=6</text>
      {/* Mean arrow */}
      <polygon points="71,108 82,102 82,114" fill="#ffd54f"/>

      {/* Character */}
      <Emma x={590} y={112} scale={0.65}/>
    </svg>
  );
}

// ─── Slide 4: Median — Sorted height lineup ────────────────────────────────────
function IllustrationMedian() {
  const data   = [138,148,155,162,158,150,140];
  const sorted = [...data].sort((a,b)=>a-b);           // [138,140,148,150,155,158,162]
  const medVal = sorted[3];                             // 150 — middle of 7
  const names  = ['Ali','Ben','Clara','Dan','Eva','Finn','Gia'];
  const bodyColors = ['#ef5350','#42a5f5','#ffd54f','#4caf50','#ab47bc','#ff7043','#26c6da'];

  return (
    <svg viewBox="0 0 640 240" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <defs>
        <linearGradient id="medBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#0a1e36"/>
          <stop offset="100%" stopColor="#081526"/>
        </linearGradient>
        <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#263238"/>
          <stop offset="100%" stopColor="#1c2528"/>
        </linearGradient>
      </defs>
      <rect width="640" height="240" fill="url(#medBg)"/>

      {/* Ruler on left */}
      <rect x="12" y="40" width="16" height="160" rx="3" fill="#37474f"/>
      {[0,1,2,3,4].map(i=>(
        <g key={i}>
          <line x1="12" y1={40+i*40} x2="28" y2={40+i*40} stroke="#80cbc4" strokeWidth="1.5"/>
          <text x="8" y={44+i*40} textAnchor="middle" fontSize="7" fill="#80cbc4" fontFamily="sans-serif">{160-i*10}cm</text>
        </g>
      ))}

      {/* Floor */}
      <rect y="200" width="640" height="40" fill="url(#floorGrad)"/>
      <line x1="0" y1="200" x2="640" y2="200" stroke="#455a64" strokeWidth="2"/>
      {/* Floor tiles */}
      {Array.from({length:10},(_,i)=>(
        <rect key={i} x={i*64} y="200" width="64" height="40" fill={i%2===0?'rgba(255,255,255,0.03)':'transparent'}/>
      ))}

      {/* Characters sorted by height */}
      {sorted.map((h,rank)=>{
        const origIdx = data.indexOf(h);
        const x       = 55 + rank * 78;
        const hPx     = ((h-130)/40)*120 + 30;     // scale 130-170cm → 30-150px
        const isMedian = h === medVal;

        return (
          <g key={rank}>
            {/* Spotlight for median */}
            {isMedian && (
              <ellipse cx={x} cy={200} rx="36" ry="14" fill="#ffd54f" opacity="0.18"/>
            )}

            {/* Height bar (background) */}
            <rect x={x-20} y={200-hPx} width="40" height={hPx} rx="4"
              fill={bodyColors[origIdx]} opacity={isMedian ? 0.35 : 0.15}/>

            {/* Figure */}
            <g transform={`translate(${x}, ${200-hPx-16})`}>
              {/* Body */}
              <rect x="-11" y="4" width="22" height={hPx-30} rx="5" fill={bodyColors[origIdx]} opacity="0.9"/>
              {/* Head */}
              <circle cx="0" cy="0" r="16" fill="#FDBCB4"/>
              {/* Hair hint */}
              <ellipse cx="0" cy="-12" rx="16" ry="7" fill={['#4e342e','#1a237e','#ffd54f','#1b5e20','#4a148c','#e65100','#006064'][origIdx]}/>
              {/* Eyes */}
              <circle cx="-5" cy="-2" r="3" fill="white"/>
              <circle cx="5"  cy="-2" r="3" fill="white"/>
              <circle cx="-5" cy="-2" r="1.5" fill="#333"/>
              <circle cx="5"  cy="-2" r="1.5" fill="#333"/>
              {/* Mouth */}
              <path d="M-4,5 Q0,9 4,5" stroke="#c2185b" strokeWidth="1.5" fill="none"/>
            </g>

            {/* Median crown */}
            {isMedian && (
              <g transform={`translate(${x}, ${200-hPx-58})`}>
                <polygon points="0,-14 -9,0 9,0" fill="#ffd54f"/>
                <circle cx="0" cy="-16" r="5" fill="#ffd54f"/>
                <circle cx="-9" cy="1" r="3" fill="#ffd54f"/>
                <circle cx="9"  cy="1" r="3" fill="#ffd54f"/>
                <text x="0" y="18" textAnchor="middle" fontSize="8" fill="#ffd54f" fontWeight="bold" fontFamily="sans-serif">MEDIAN</text>
              </g>
            )}

            {/* Height tag */}
            <rect x={x-18} y={200-hPx-4} width="36" height="12" rx="3"
              fill={isMedian ? '#ffd54f' : 'rgba(0,0,0,0.6)'}/>
            <text x={x} y={200-hPx+6} textAnchor="middle" fontSize="8" fontWeight="bold"
              fill={isMedian ? '#1a1a2e' : 'white'} fontFamily="sans-serif">{h}cm</text>

            {/* Name */}
            <text x={x} y="220" textAnchor="middle" fontSize="9"
              fill={isMedian ? '#ffd54f' : 'rgba(255,255,255,0.6)'} fontFamily="sans-serif">{names[origIdx]}</text>

            {/* Sorted rank number */}
            <circle cx={x} cy="232" r="8" fill={isMedian ? '#ffd54f' : 'rgba(255,255,255,0.1)'}/>
            <text x={x} y="236" textAnchor="middle" fontSize="8" fontWeight="bold"
              fill={isMedian ? '#1a1a2e' : 'rgba(255,255,255,0.5)'} fontFamily="sans-serif">{rank+1}</text>
          </g>
        );
      })}

      {/* Title */}
      <rect x="160" y="6" width="320" height="28" rx="8" fill="rgba(0,0,0,0.6)" stroke="#ffd54f" strokeWidth="1.5"/>
      <text x="320" y="24" textAnchor="middle" fill="#ffd54f" fontSize="12" fontWeight="bold" fontFamily="sans-serif">
        Sorted Line-up — Middle = Median
      </text>
    </svg>
  );
}

// ─── Slide 5: Mode — Café with animated bar chart ─────────────────────────────
function IllustrationMode() {
  const drinks = [
    { label:'Coffee', emoji:'☕', count:5, color:'#795548', isMode:true  },
    { label:'Tea',    emoji:'🍵', count:3, color:'#26a69a', isMode:false },
    { label:'Juice',  emoji:'🧃', count:5, color:'#f9a825', isMode:true  },
    { label:'Choc',   emoji:'🍫', count:2, color:'#6d4c41', isMode:false },
  ];
  return (
    <svg viewBox="0 0 640 240" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <defs>
        <linearGradient id="cafeBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#1a0a2e"/>
          <stop offset="100%" stopColor="#0a0a1e"/>
        </linearGradient>
      </defs>
      <rect width="640" height="240" fill="url(#cafeBg)"/>

      {/* Café interior wall */}
      <rect x="0" y="0" width="640" height="62" fill="#2d1b69"/>
      <rect x="0" y="58" width="640" height="6"  fill="#1a0a3e"/>

      {/* Café sign */}
      <rect x="200" y="8" width="240" height="36" rx="10" fill="#4a148c" stroke="#ce93d8" strokeWidth="1.5"/>
      <text x="320" y="24" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="sans-serif">☕ Emma's Data Café</text>
      <text x="320" y="38" textAnchor="middle" fill="#ce93d8" fontSize="9" fontFamily="sans-serif">Today's Orders — What's the MODE?</text>

      {/* Counter top */}
      <rect x="0" y="188" width="640" height="52" fill="#1b0a2e"/>
      <rect x="0" y="185" width="640" height="8"  fill="#4a148c" opacity="0.5"/>

      {/* Chart axes */}
      <line x1="68" y1="72" x2="68"  y2="186" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
      <line x1="68" y1="186" x2="572" y2="186" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
      {/* Y-axis labels */}
      {[1,2,3,4,5].map(v=>(
        <g key={v}>
          <line x1="62" y1={186-v*20} x2="68" y2={186-v*20} stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
          <text x="58" y={190-v*20} textAnchor="end" fontSize="9" fill="rgba(255,255,255,0.5)" fontFamily="sans-serif">{v}</text>
        </g>
      ))}

      {/* Bars */}
      {drinks.map((d,i)=>{
        const x  = 100 + i * 118;
        const bh = d.count * 20;
        return (
          <g key={i}>
            {/* Glow for mode */}
            {d.isMode && <rect x={x-10} y={186-bh-12} width="80" height={bh+18} rx="10" fill="rgba(255,193,7,0.08)" stroke="#ffd54f" strokeWidth="1.5"/>}
            {/* Bar */}
            <rect x={x} y={186-bh} width="60" height={bh} rx="6" fill={d.color} opacity="0.9"
              style={{animation:`barGrow 0.6s ease ${i*0.15}s both`}}/>
            {/* Bar shine */}
            <rect x={x+4} y={186-bh+4} width="12" height={bh-8} rx="4" fill="white" opacity="0.12"/>
            {/* Count */}
            <text x={x+30} y={182-bh} textAnchor="middle" fontSize="15" fontWeight="bold" fill="white" fontFamily="sans-serif">{d.count}</text>
            {/* Emoji */}
            <text x={x+30} y={186-bh-14} textAnchor="middle" fontSize="18" fontFamily="sans-serif">{d.emoji}</text>
            {/* Label */}
            <text x={x+30} y="200" textAnchor="middle" fontSize="11" fill={d.isMode?'#ffd54f':'rgba(255,255,255,0.6)'} fontFamily="sans-serif" fontWeight={d.isMode?'bold':'normal'}>{d.label}</text>
            {/* Mode badge */}
            {d.isMode && (
              <g>
                <rect x={x+4} y="206" width="52" height="16" rx="8" fill="#ffd54f"/>
                <text x={x+30} y="218" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1a1a2e" fontFamily="sans-serif">★ MODE</text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ─── Slide 6: Range — Weather Dashboard ───────────────────────────────────────
function IllustrationRange() {
  const days  = ['Mon','Tue','Wed','Thu','Fri'];
  const temps = [18, 24, 30, 15, 27];
  const icons = ['🌧️','⛅','☀️','🌨️','🌤️'];
  const maxT  = Math.max(...temps);   // 30 Wed
  const minT  = Math.min(...temps);   // 15 Thu

  return (
    <svg viewBox="0 0 640 240" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <defs>
        <linearGradient id="rangeBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#0d1b2a"/>
          <stop offset="100%" stopColor="#162032"/>
        </linearGradient>
        <linearGradient id="hotBar"  x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%"   stopColor="#ff7043"/>
          <stop offset="100%" stopColor="#ffd54f"/>
        </linearGradient>
        <linearGradient id="coldBar" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%"   stopColor="#1565c0"/>
          <stop offset="100%" stopColor="#42a5f5"/>
        </linearGradient>
        <linearGradient id="normBar" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%"   stopColor="#00695c"/>
          <stop offset="100%" stopColor="#4db6ac"/>
        </linearGradient>
      </defs>
      <rect width="640" height="240" fill="url(#rangeBg)"/>

      {/* Title card */}
      <rect x="160" y="6" width="320" height="30" rx="8" fill="rgba(0,0,0,0.5)" stroke="#4db6ac" strokeWidth="1.5"/>
      <text x="320" y="26" textAnchor="middle" fill="#4db6ac" fontSize="13" fontWeight="bold" fontFamily="sans-serif">🌡️ Weekly Temperature Chart</text>

      {/* Grid */}
      <line x1="68" y1="45" x2="68"  y2="185" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
      <line x1="68" y1="185" x2="580" y2="185" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
      {[10,15,20,25,30].map((v,i)=>{
        const yy = 185 - ((v-8)/26)*140;
        return (
          <g key={i}>
            <line x1="62" y1={yy} x2="580" y2={yy} stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
            <text x="58" y={yy+4} textAnchor="end" fontSize="9" fill="rgba(255,255,255,0.4)" fontFamily="sans-serif">{v}°</text>
          </g>
        );
      })}

      {/* Bars */}
      {temps.map((t,i)=>{
        const x   = 100 + i * 94;
        const bh  = ((t-8)/26)*140;
        const isMax = t === maxT;
        const isMin = t === minT;
        const grad  = isMax ? 'url(#hotBar)' : isMin ? 'url(#coldBar)' : 'url(#normBar)';
        return (
          <g key={i}>
            <rect x={x} y={185-bh} width="56" height={bh} rx="8" fill={grad}
              style={{animation:`barGrow 0.7s ease ${i*0.12}s both`}}/>
            {/* Shine */}
            <rect x={x+4} y={185-bh+6} width="10" height={bh-12} rx="4" fill="white" opacity="0.15"/>
            {/* Temp label inside bar */}
            <text x={x+28} y={181-bh} textAnchor="middle" fontSize="13" fontWeight="bold" fill="white" fontFamily="sans-serif">{t}°C</text>
            {/* Weather icon */}
            <text x={x+28} y={168-bh} textAnchor="middle" fontSize="18" fontFamily="sans-serif">{icons[i]}</text>
            {/* Day label */}
            <text x={x+28} y="200" textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.8)" fontFamily="sans-serif" fontWeight="600">{days[i]}</text>
            {/* MAX / MIN badge */}
            {isMax && <g>
              <rect x={x+6} y="204" width="44" height="14" rx="7" fill="#ff7043"/>
              <text x={x+28} y="215" textAnchor="middle" fontSize="9" fontWeight="bold" fill="white" fontFamily="sans-serif">▲ MAX</text>
            </g>}
            {isMin && <g>
              <rect x={x+6} y="204" width="44" height="14" rx="7" fill="#1565c0"/>
              <text x={x+28} y="215" textAnchor="middle" fontSize="9" fontWeight="bold" fill="white" fontFamily="sans-serif">▼ MIN</text>
            </g>}
          </g>
        );
      })}

      {/* Range bracket */}
      {(()=>{
        const xMax = 100 + 2*94 + 28;   // Wed bar centre (30°C)
        const xMin = 100 + 3*94 + 28;   // Thu bar centre (15°C)
        const yMax = 185 - ((maxT-8)/26)*140;
        const yMin = 185 - ((minT-8)/26)*140;
        return (
          <g>
            <line x1={xMax} y1={yMax-6} x2={xMax} y2="32" stroke="#ffd54f" strokeWidth="2" strokeDasharray="5,3"/>
            <line x1={xMin} y1={yMin-6} x2={xMin} y2="32" stroke="#ffd54f" strokeWidth="2" strokeDasharray="5,3"/>
            <line x1={xMax} y1="32" x2={xMin} y2="32" stroke="#ffd54f" strokeWidth="2.5"/>
            {/* Arrowheads */}
            <polygon points={`${xMax},32 ${xMax-5},22 ${xMax+5},22`} fill="#ffd54f"/>
            <polygon points={`${xMin},32 ${xMin-5},22 ${xMin+5},22`} fill="#ffd54f"/>
            {/* Range label */}
            <rect x={(xMax+xMin)/2-62} y="10" width="124" height="18" rx="6" fill="#ffd54f"/>
            <text x={(xMax+xMin)/2} y="23" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1a1a2e" fontFamily="sans-serif">Range = 30−15 = 15°C</text>
          </g>
        );
      })()}
    </svg>
  );
}

// ─── Slide 7: Probability — Wheel + Sample Space ─────────────────────────────
function IllustrationProbability() {
  // Wheel sectors: angle from -90 going clockwise, 4 equal sectors of 90°
  const sectors = [
    { label:'Red',    color:'#ef5350', textColor:'white',   prob:'1/4' },
    { label:'Blue',   color:'#42a5f5', textColor:'white',   prob:'1/4' },
    { label:'Green',  color:'#66bb6a', textColor:'#1a1a2e', prob:'1/4' },
    { label:'Yellow', color:'#ffd54f', textColor:'#1a1a2e', prob:'1/4' },
  ];

  const wheelCx = 190, wheelCy = 128, R = 96;

  return (
    <svg viewBox="0 0 640 240" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <defs>
        <linearGradient id="probBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#0d1f3e"/>
          <stop offset="100%" stopColor="#080e1e"/>
        </linearGradient>
        <filter id="wheelShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000" floodOpacity="0.5"/>
        </filter>
      </defs>
      <rect width="640" height="240" fill="url(#probBg)"/>

      {/* Stars */}
      {[[20,20],[560,15],[80,200],[580,210],[320,8],[50,110],[590,100]].map(([cx,cy],i)=>(
        <circle key={i} cx={cx} cy={cy} r="1.5" fill="white" opacity="0.4"/>
      ))}

      {/* Wheel base glow */}
      <circle cx={wheelCx} cy={wheelCy} r={R+20} fill="rgba(255,255,255,0.05)"/>
      <circle cx={wheelCx} cy={wheelCy} r={R+10} fill="rgba(255,255,255,0.04)"/>

      {/* Wheel sectors */}
      <g filter="url(#wheelShadow)">
        {sectors.map((s,i)=>{
          const startA = (i * 90 - 90) * Math.PI / 180;
          const endA   = ((i+1)*90 - 90) * Math.PI / 180;
          const x1 = wheelCx + R * Math.cos(startA);
          const y1 = wheelCy + R * Math.sin(startA);
          const x2 = wheelCx + R * Math.cos(endA);
          const y2 = wheelCy + R * Math.sin(endA);
          const mx = wheelCx + R * 0.62 * Math.cos((startA+endA)/2);
          const my = wheelCy + R * 0.62 * Math.sin((startA+endA)/2);
          return (
            <g key={i}>
              <path d={`M${wheelCx},${wheelCy} L${x1},${y1} A${R},${R} 0 0,1 ${x2},${y2} Z`} fill={s.color}/>
              <text x={mx} y={my+2} textAnchor="middle" fontSize="12" fontWeight="bold"
                fill={s.textColor} fontFamily="sans-serif">{s.label}</text>
              <text x={mx} y={my+14} textAnchor="middle" fontSize="10"
                fill={s.textColor} fontFamily="sans-serif" opacity="0.8">{s.prob}</text>
            </g>
          );
        })}
      </g>

      {/* Wheel rim */}
      <circle cx={wheelCx} cy={wheelCy} r={R}    fill="none" stroke="white"          strokeWidth="4"/>
      <circle cx={wheelCx} cy={wheelCy} r={R-2}  fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="2"/>
      {/* Dividers */}
      {[0,90,180,270].map(a=>{
        const rad = (a-90)*Math.PI/180;
        return <line key={a} x1={wheelCx} y1={wheelCy}
          x2={wheelCx+R*Math.cos(rad)} y2={wheelCy+R*Math.sin(rad)}
          stroke="white" strokeWidth="2" opacity="0.6"/>;
      })}
      {/* Hub */}
      <circle cx={wheelCx} cy={wheelCy} r="12" fill="white"/>
      <circle cx={wheelCx} cy={wheelCy} r="8"  fill="#1a1a2e"/>
      <circle cx={wheelCx} cy={wheelCy} r="3"  fill="#ffd54f"/>
      {/* Pointer */}
      <polygon points={`${wheelCx},${wheelCy-R-14} ${wheelCx-9},${wheelCy-R+6} ${wheelCx+9},${wheelCy-R+6}`} fill="#ffd54f"/>

      {/* Wheel stand */}
      <rect x={wheelCx-6} y={wheelCy+R} width="12" height="24" rx="4" fill="#455a64"/>
      <rect x={wheelCx-28} y={wheelCy+R+20} width="56" height="10" rx="4" fill="#37474f"/>

      {/* ── Probability panel ── */}
      <rect x="310" y="30" width="310" height="180" rx="12" fill="rgba(0,0,0,0.55)" stroke="#4db6ac" strokeWidth="1.5"/>

      {/* Header */}
      <rect x="310" y="30" width="310" height="32" rx="12" fill="#00695c" opacity="0.8"/>
      <rect x="310" y="50" width="310" height="12"  fill="#00695c" opacity="0.8"/>
      <text x="465" y="51" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="sans-serif">📊 Probability Table</text>

      {/* Formula row */}
      <rect x="322" y="70" width="286" height="22" rx="6" fill="rgba(255,193,7,0.15)" stroke="#ffd54f" strokeWidth="1"/>
      <text x="465" y="85" textAnchor="middle" fill="#ffd54f" fontSize="11" fontWeight="bold" fontFamily="sans-serif">P(event) = favourable ÷ total</text>

      {/* Table rows */}
      {sectors.map((s,i)=>{
        const y = 102 + i * 26;
        return (
          <g key={i}>
            <rect x="322" y={y} width="286" height="24" rx="4" fill={i%2===0?'rgba(255,255,255,0.04)':'transparent'}/>
            {/* Color dot */}
            <circle cx="342" cy={y+12} r="8" fill={s.color}/>
            <text x="360" y={y+16} fontSize="11" fill="white" fontFamily="sans-serif">{s.label}</text>
            {/* Fraction */}
            <text x="490" y={y+16} textAnchor="middle" fontSize="11" fill="#80deea" fontFamily="sans-serif" fontWeight="600">1/4</text>
            {/* Decimal */}
            <text x="545" y={y+16} textAnchor="middle" fontSize="11" fill="#a5d6a7" fontFamily="sans-serif">0.25</text>
            {/* Percent */}
            <text x="594" y={y+16} textAnchor="middle" fontSize="11" fill="#ffd54f" fontFamily="sans-serif">25%</text>
          </g>
        );
      })}

      {/* Totals row */}
      <rect x="322" y="208" width="286" height="1" fill="rgba(255,255,255,0.3)"/>
      <text x="360" y="222" fontSize="11" fill="rgba(255,255,255,0.7)" fontFamily="sans-serif" fontWeight="bold">Total</text>
      <text x="490" y="222" textAnchor="middle" fontSize="11" fill="#80deea" fontFamily="sans-serif" fontWeight="bold">4/4</text>
      <text x="545" y="222" textAnchor="middle" fontSize="11" fill="#a5d6a7" fontFamily="sans-serif" fontWeight="bold">1.00</text>
      <text x="594" y="222" textAnchor="middle" fontSize="11" fill="#ffd54f" fontFamily="sans-serif" fontWeight="bold">100%</text>
    </svg>
  );
}

// ─── Story slides data ─────────────────────────────────────────────────────────
const STORY_SLIDES = [
  { Illustration: IllustrationAdventure, title: "Emma & Liam's Data Quest",
    text: 'Emma and Liam are two curious friends who travel the world collecting data. On every adventure, they use maths to understand what they find. Today they begin their biggest quest yet — mastering Data and Probability!',
    highlight: '"Data tells the story of the world around us!"', mascotText: 'Let the adventure begin! 🗺️' },
  { Illustration: IllustrationMarket, title: 'Numbers Everywhere',
    text: 'At the city market, Emma notices price tags, quantities, and scores on the board. "So many numbers!" she says. Liam smiles: "Each one is a data point. Together they tell us something amazing."',
    highlight: '"A collection of numbers is called a data set!"', mascotText: 'Collect them all! 🔢' },
  { Illustration: IllustrationMean, title: 'The Mean — Fair Share',
    text: 'Emma has 5 bags of coins: 4, 6, 8, 2, and 10 coins. "How do I share them fairly?" she asks. Liam adds them all up: 30 total, divided by 5 bags — that is 6 each! This fair-share number is called the mean.',
    highlight: '"Mean = Sum of all values ÷ Number of values"', mascotText: '4+6+8+2+10 = 30 ÷ 5 = 6! 🪙' },
  { Illustration: IllustrationMedian, title: 'The Median — Middle Ground',
    text: 'Liam lines up 7 friends by height and sorts them from shortest to tallest. The person standing right in the middle is the median! With numbers: sort first, then find the middle value.',
    highlight: '"Median = Middle value of sorted data"', mascotText: 'Sort first, then find the middle! 📏' },
  { Illustration: IllustrationMode, title: 'The Mode — Most Popular',
    text: 'At Emma\'s Data Café, orders are: 5 coffees, 3 teas, 5 juices, 2 hot chocolates. Coffee and juice both appear 5 times — the most! When a value appears most often, it is the mode.',
    highlight: '"Mode = The value that appears most often"', mascotText: 'The mode can appear more than once! ☕' },
  { Illustration: IllustrationRange, title: 'The Range — Spread of Data',
    text: 'The weekly temperatures: 18, 24, 30, 15, 27°C. Wednesday is the hottest, Thursday the coldest. Liam subtracts: 30 − 15 = 15. The range of 15°C shows how spread out the data is!',
    highlight: '"Range = Highest value − Lowest value"', mascotText: 'Range shows how spread out data is! 🌡️' },
  { Illustration: IllustrationProbability, title: 'Into the World of Probability',
    text: 'Emma and Liam spin a wheel with 4 equal sections: red, blue, green, yellow. Each colour has a 1 in 4 chance — written as 1/4, 0.25, or 25%. Probability is the science of measuring chance!',
    highlight: '"Probability = Favourable outcomes ÷ Total outcomes"', mascotText: 'P always falls between 0 and 1! 🎯' },
];

export default function StoryPhase({ onComplete, audioEnabled }) {
  const [slide, setSlide]   = useState(0);
  const [anim, setAnim]     = useState(false);
  const [textVis, setTextVis] = useState(false);
  const [hlVis, setHlVis]   = useState(false);
  const narRef = useRef(null);

  const s      = STORY_SLIDES[slide];
  const isLast = slide === STORY_SLIDES.length - 1;
  const pct    = ((slide + 1) / STORY_SLIDES.length) * 100;

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

  const { Illustration } = s;

  return (
    <div className="story-phase">
      <div className="story-progress">
        <div className="story-progress-bar">
          <div className="story-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="story-progress-label">{slide + 1} / {STORY_SLIDES.length}</span>
      </div>

      <div className={`story-card ${anim ? 'flipping' : ''}`}>
        <div className="story-image-section">
          <div className="story-illustration"><Illustration /></div>
          <div className="story-image-overlay" />
        </div>
        <div className="story-text-section">
          <h2 className="story-title">{s.title}</h2>
          <p className={`story-text ${textVis ? 'revealed' : ''}`}>{s.text}</p>
          <div className={`story-highlight ${hlVis ? 'visible' : ''}`}>
            <span>✨</span><span className="story-highlight-text">{s.highlight}</span><span>✨</span>
          </div>
          <div className="story-mascot">
            <div className="mascot" style={{ width:50, height:50, fontSize:'1.4rem' }}>🤖</div>
            <div className="speech-bubble" style={{ fontSize:'0.8rem', padding:'8px 14px', maxWidth:200 }}>
              {s.mascotText}
            </div>
          </div>
        </div>
      </div>

      <div className="story-nav">
        <button className="btn btn-outline btn-sm" onClick={goPrev}
          disabled={slide===0} style={{ opacity: slide===0 ? 0.3 : 1 }}>← Back</button>
        <div className="story-dots">
          {STORY_SLIDES.map((_,i) => (
            <div key={i} className={`story-dot ${i===slide?'active':i<slide?'completed':''}`}/>
          ))}
        </div>
        <button className={`btn ${isLast?'btn-green':'btn-primary'} btn-sm`} onClick={goNext}>
          {isLast ? "🚀 Let's Explore!" : 'Next →'}
        </button>
      </div>
    </div>
  );
}
