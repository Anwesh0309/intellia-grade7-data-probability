// ──────────────────────────────────────────────────
// Audio Narration Engine — Grade 7 Data & Probability
// Pre-generated MP3s primary · ElevenLabs API fallback · Web Speech last resort
// ──────────────────────────────────────────────────

import { audioMap } from './audioMap.js';

let currentQueue  = null;
let isSpeaking    = false;
let currentAudio  = null;
let playId        = 0;
const elevenLabsCache = new Map();

const ELEVENLABS_VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID || 'Xb7hH8MSUJpSbSDYk0k2';

// ─── Web Speech style profiles ───────────────────
const SPEECH_STYLES = {
  statement:    { rate: 0.88, pitch: 1.10, volume: 1.0 },
  question:     { rate: 0.82, pitch: 1.28, volume: 1.0 },
  encouragement:{ rate: 0.95, pitch: 1.30, volume: 1.0 },
  emphasis:     { rate: 0.78, pitch: 1.20, volume: 1.0 },
  thinking:     { rate: 0.84, pitch: 1.05, volume: 0.95 },
  celebration:  { rate: 1.02, pitch: 1.40, volume: 1.0 },
  instruction:  { rate: 0.85, pitch: 1.12, volume: 1.0 },
};

const getElevenLabsSettings = (speechStyle) => {
  switch (speechStyle) {
    case 'celebration':   return { stability: 0.12, similarity_boost: 0.45, style: 0.75, use_speaker_boost: true };
    case 'encouragement': return { stability: 0.16, similarity_boost: 0.50, style: 0.65, use_speaker_boost: true };
    case 'question':      return { stability: 0.20, similarity_boost: 0.55, style: 0.55, use_speaker_boost: true };
    case 'emphasis':      return { stability: 0.16, similarity_boost: 0.50, style: 0.60, use_speaker_boost: true };
    case 'thinking':      return { stability: 0.24, similarity_boost: 0.60, style: 0.35, use_speaker_boost: true };
    default:              return { stability: 0.20, similarity_boost: 0.55, style: 0.50, use_speaker_boost: true };
  }
};

// ─── Resolve audio URL: pre-generated → ElevenLabs API → null ────────────────
export async function getAudioUrl(text, style) {
  // 1. Pre-generated static file (zero API cost)
  const mapKey = `${style}::${text}`;
  if (audioMap && audioMap[mapKey]) {
    return audioMap[mapKey];
  }

  // 2. ElevenLabs API (runtime fallback for any line not pre-generated)
  const cacheKey = mapKey;
  if (elevenLabsCache.has(cacheKey)) return elevenLabsCache.get(cacheKey);

  const fetchPromise = (async () => {
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    if (!apiKey) throw new Error('No ElevenLabs API key');

    const voiceSettings = getElevenLabsSettings(style);
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'xi-api-key': apiKey },
        body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2', voice_settings: voiceSettings }),
      }
    );
    if (!response.ok) {
      const err = await response.text().catch(() => '');
      throw new Error(`ElevenLabs ${response.status}: ${err}`);
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  })();

  elevenLabsCache.set(cacheKey, fetchPromise);
  fetchPromise.catch(() => elevenLabsCache.delete(cacheKey));
  return fetchPromise;
}

// ─── Web Speech API fallback ─────────────────────
function speakWebSpeech(text, style) {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    if (!synth) { resolve(); return; }

    // Cancel any current speech first
    synth.cancel();

    const utt = new SpeechSynthesisUtterance(text);
    const s   = SPEECH_STYLES[style] || SPEECH_STYLES.statement;
    utt.rate   = s.rate;
    utt.pitch  = s.pitch;
    utt.volume = s.volume;
    utt.lang   = 'en-US';

    // Pick a good English voice if available
    const voices = synth.getVoices();
    const preferred = voices.find(v =>
      v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Google') || v.name.includes('Samantha'))
    ) || voices.find(v => v.lang.startsWith('en')) || null;
    if (preferred) utt.voice = preferred;

    utt.onend   = () => resolve();
    utt.onerror = () => resolve();
    synth.speak(utt);
  });
}

// ─── Main speak function ─────────────────────────
export function speak(text, enabled = true, style = 'statement') {
  return new Promise(async (resolve) => {
    if (!enabled || !text?.trim()) { resolve(); return; }

    playId++;
    const myPlayId = playId;
    isSpeaking = true;

    // Always kill browser TTS so it never runs alongside ElevenLabs
    try { window.speechSynthesis?.cancel(); } catch {}

    // ── Try ElevenLabs first ──
    let elevenLabsOk = false;
    try {
      const audioUrl = await getAudioUrl(text, style);

      // Bail if a newer speak() started while we awaited the URL
      if (myPlayId !== playId) { isSpeaking = false; resolve(); return; }

      // Stop any previous audio element cleanly
      if (currentAudio) {
        try { currentAudio.pause(); currentAudio.src = ''; } catch {}
        currentAudio = null;
      }

      // Wrap playback in a promise that resolves only when audio ENDS
      await new Promise((resolvePb) => {
        const audio = new Audio(audioUrl);
        audio.onended = () => resolvePb('ended');
        audio.onerror = () => resolvePb('error');
        currentAudio  = audio;
        audio.play().catch(() => resolvePb('error'));
      });

      // If we were cancelled mid-playback, just resolve silently
      elevenLabsOk = true;
    } catch (err) {
      console.warn('[audio] ElevenLabs failed, using Web Speech fallback:', err?.message || err);
    }

    // ── Fallback: Web Speech API (only if ElevenLabs did NOT play) ──
    if (!elevenLabsOk) {
      if (myPlayId !== playId) { isSpeaking = false; resolve(); return; }
      try {
        await speakWebSpeech(text, style);
      } catch {}
    }

    isSpeaking = false;
    resolve();
  });
}

// ─── Segment helpers ────────────────────────────
export function seg(text, style = 'statement', pause = 400) { return { text, style, pause }; }
export const say       = (text, pause = 0) => seg(text, 'statement',    pause);
export const ask       = (text, pause = 0) => seg(text, 'question',     pause);
export const cheer     = (text, pause = 0) => seg(text, 'encouragement',pause);
export const emphasize = (text, pause = 0) => seg(text, 'emphasis',     pause);
export const think     = (text, pause = 0) => seg(text, 'thinking',     pause);
export const celebrate = (text, pause = 0) => seg(text, 'celebration',  pause);
export const instruct  = (text, pause = 0) => seg(text, 'instruction',  pause);
export const pauseSeg  = (ms = 0)          => seg('',   'statement',    ms);

export function preloadNarration(segments) {
  if (!segments) return;
  segments.forEach(s => {
    if (s.text?.trim()) getAudioUrl(s.text, s.style).catch(() => {});
  });
}

// ─── Narration queue ─────────────────────────────
export function narrate(segments, enabled = true) {
  const queueId = Symbol('narration');
  currentQueue  = queueId;
  let cancelled = false;

  const cancel = () => {
    cancelled = true;
    if (currentQueue === queueId) {
      try { window.speechSynthesis?.cancel(); } catch {}
      if (currentAudio) {
        try { currentAudio.pause(); currentAudio.src = ''; } catch {}
        currentAudio = null;
      }
      isSpeaking    = false;
      currentQueue  = null;
    }
  };

  const promise = (async () => {
    if (!enabled || !segments?.length) return;

    for (let i = 0; i < segments.length; i++) {
      if (cancelled || currentQueue !== queueId) return;

      const segment = segments[i];

      // Prefetch next segment while this one plays
      if (i + 1 < segments.length) {
        const next = segments[i + 1];
        if (next.text?.trim()) getAudioUrl(next.text, next.style).catch(() => {});
      }

      if (segment.text?.trim()) {
        await speak(segment.text, true, segment.style);
      }

      if (segment.pause > 0 && !cancelled && currentQueue === queueId) {
        await new Promise(r => setTimeout(r, segment.pause));
      }
    }
  })();

  return { cancel, promise };
}

// ─── Stop everything ─────────────────────────────
export function stopNarration() {
  playId++;
  currentQueue = null;
  try { window.speechSynthesis?.cancel(); } catch {}
  if (currentAudio) {
    try { currentAudio.pause(); currentAudio.src = ''; } catch {}
    currentAudio = null;
  }
  isSpeaking = false;
}

// ─── Tone / sound effects ────────────────────────
let audioCtx = null;
function getCtx() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch { return null; }
  }
  // Resume if suspended (browser autoplay policy)
  if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  return audioCtx;
}

export function playTone(frequency, duration = 200) {
  try {
    const ctx = getCtx();
    if (!ctx) return;
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration / 1000);
  } catch {}
}

export const sounds = {
  correct: () => {
    playTone(523, 150);
    setTimeout(() => playTone(659, 150), 160);
    setTimeout(() => playTone(784, 220), 320);
  },
  wrong: () => {
    playTone(220, 200);
    setTimeout(() => playTone(196, 300), 210);
  },
  badge: () => {
    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 200), i * 150));
  },
  click:  () => playTone(440, 70),
  streak: () => {
    playTone(880, 100);
    setTimeout(() => playTone(1100, 160), 110);
    setTimeout(() => playTone(1320, 200), 270);
  },
};
