// ─────────────────────────────────────────────────────────────────────────────
// generate_audio.js
// Pre-generates ALL narration audio files from ElevenLabs and saves them to
// public/audio/ so the app never calls the API at runtime.
//
// Usage:  node scripts/generate_audio.js
// ─────────────────────────────────────────────────────────────────────────────

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env manually (dotenv may not be installed; fallback to manual parse)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir   = path.resolve(__dirname, '..');

function loadEnv() {
  const envPath = path.join(rootDir, '.env');
  if (!fs.existsSync(envPath)) return {};
  const lines  = fs.readFileSync(envPath, 'utf8').split('\n');
  const result = {};
  for (const line of lines) {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) result[key.trim()] = rest.join('=').trim();
  }
  return result;
}

let env = {};
try {
  const dotenv = await import('dotenv');
  dotenv.config({ path: path.join(rootDir, '.env') });
  env = process.env;
} catch {
  env = { ...process.env, ...loadEnv() };
}

const API_KEY  = env.VITE_ELEVENLABS_API_KEY;
const VOICE_ID = env.VITE_ELEVENLABS_VOICE_ID || 'Xb7hH8MSUJpSbSDYk0k2';
const OUT_DIR  = path.join(rootDir, 'public', 'audio');

if (!API_KEY) {
  console.error('❌  VITE_ELEVENLABS_API_KEY not found in .env');
  process.exit(1);
}

// ─── ElevenLabs voice settings per style ─────────────────────────────────────
const VOICE_SETTINGS = {
  statement:    { stability: 0.20, similarity_boost: 0.55, style: 0.50, use_speaker_boost: true },
  question:     { stability: 0.20, similarity_boost: 0.55, style: 0.55, use_speaker_boost: true },
  encouragement:{ stability: 0.16, similarity_boost: 0.50, style: 0.65, use_speaker_boost: true },
  emphasis:     { stability: 0.16, similarity_boost: 0.50, style: 0.60, use_speaker_boost: true },
  thinking:     { stability: 0.24, similarity_boost: 0.60, style: 0.35, use_speaker_boost: true },
  celebration:  { stability: 0.12, similarity_boost: 0.45, style: 0.75, use_speaker_boost: true },
  instruction:  { stability: 0.20, similarity_boost: 0.55, style: 0.50, use_speaker_boost: true },
};

// ─── Sanitise text → safe filename ───────────────────────────────────────────
function toFilename(text, style) {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 60);
  return `${style}_${slug}.mp3`;
}

// ─── ALL narration lines in the project ──────────────────────────────────────
// Each entry: { text, style }
const ALL_LINES = [

  // ── IntroScreen ─────────────────────────────────
  { text: "Welcome to Data Handling and Probability!", style: "statement" },
  { text: "Get ready for a data adventure with Emma and Liam!", style: "encouragement" },
  { text: "Mean, median, mode, range — and the exciting world of probability await you!", style: "emphasis" },

  // ── Wonder Phase — generic ───────────────────────
  { text: "Hmm... I wonder...", style: "thinking" },
  { text: "Great thinking! Let's find out together!", style: "encouragement" },
  { text: "Follow me on this data adventure!", style: "statement" },

  // ── Wonder — question 0 (mode) ───────────────────
  { text: "A class recorded their test scores...", style: "thinking" },
  { text: "72, 85, 90, 68, 85, 77 — which score appears most often?", style: "question" },
  { text: "When one value repeats more than the rest, we call it the mode!", style: "statement" },

  // ── Wonder — question 1 (median) ─────────────────
  { text: "Emma asked five friends how many books they read...", style: "thinking" },
  { text: "3, 7, 5, 2, 8 — what is the middle number when they are sorted?", style: "question" },
  { text: "The middle value in sorted data is called the median!", style: "statement" },

  // ── Wonder — question 2 (dice probability) ───────
  { text: "Liam is about to roll a dice...", style: "thinking" },
  { text: "What are the chances of getting a number greater than 4?", style: "question" },
  { text: "Probability tells us exactly how likely something is to happen!", style: "statement" },

  // ── Wonder — question 3 (marbles) ────────────────
  { text: "Imagine a bag full of coloured marbles...", style: "thinking" },
  { text: "3 red, 2 blue, and 5 green — is picking green more likely than picking red?", style: "question" },
  { text: "We can compare likelihoods using fractions and probability!", style: "statement" },

  // ── Wonder — question 4 (range/temperature) ──────
  { text: "Look at this week's temperatures: 18, 22, 25, 19, and 30 degrees...", style: "thinking" },
  { text: "How spread out is this data?", style: "question" },
  { text: "The range equals the highest value minus the lowest — it shows the spread!", style: "statement" },

  // ── Story Phase ──────────────────────────────────
  { text: "Emma and Liam are on an adventure with their friends.", style: "statement" },
  { text: "They collect data on everything they find!", style: "statement" },
  { text: "At the market, they record how many fruits each stall sells.", style: "statement" },
  { text: "Numbers tell a story — if you know how to read them!", style: "emphasis" },
  { text: "To find the mean, add all values and divide by how many there are.", style: "statement" },
  { text: "It is the fair share of all the data!", style: "instruction" },
  { text: "The median is the middle value when numbers are sorted in order.", style: "statement" },
  { text: "Half the data is above it, half below!", style: "emphasis" },
  { text: "The mode is the value that appears most often.", style: "statement" },
  { text: "It is the most popular number in the group!", style: "encouragement" },
  { text: "The range tells us how spread out the data is.", style: "statement" },
  { text: "Subtract the smallest from the largest value.", style: "instruction" },
  { text: "Now Emma and Liam explore probability — the study of chance!", style: "statement" },
  { text: "How likely is something to happen?", style: "question" },

  // ── Simulate Phase ───────────────────────────────
  { text: "Let's build a data set together!", style: "instruction" },
  { text: "Tap the values to add them to the number line.", style: "statement" },
  { text: "Watch how the mean changes as you add more numbers!", style: "encouragement" },
  { text: "Time to sort the data and find the median!", style: "instruction" },
  { text: "Drag the numbers into order from smallest to largest.", style: "statement" },
  { text: "The middle number is your median!", style: "emphasis" },
  { text: "Now let's find the mode and range.", style: "instruction" },
  { text: "Look for the number that appears most often — that is the mode.", style: "statement" },
  { text: "And can you find the difference between the biggest and smallest?", style: "question" },
  { text: "Probability tells us how likely something is to happen.", style: "statement" },
  { text: "We write it as a fraction, decimal, or percentage.", style: "instruction" },
  { text: "Let's spin, flip, and roll to explore chance!", style: "encouragement" },

  // ── Simulate — inline feedback ───────────────────
  { text: "You made equal groups!", style: "encouragement" },
  { text: "That is the equal group!", style: "celebration" },

  // ── Play Phase ───────────────────────────────────
  { text: "Welcome to Data Valley!", style: "encouragement" },
  { text: "Welcome to Sorted Forest!", style: "encouragement" },
  { text: "Welcome to Mode Mountain!", style: "encouragement" },
  { text: "Welcome to Range River!", style: "encouragement" },
  { text: "Welcome to Chance Islands!", style: "encouragement" },
  { text: "Welcome to Graph Galaxy!", style: "encouragement" },
  { text: "Welcome to Word Problem Peak!", style: "encouragement" },
  { text: "Welcome to Master Arena!", style: "encouragement" },
  { text: "Answer the questions to earn stars and XP.", style: "instruction" },
  { text: "Correct! Well done!", style: "celebration" },
  { text: "Great streak! Keep it going!", style: "encouragement" },
  { text: "Not quite — let's think about this one again.", style: "statement" },
  { text: "Read the explanation to understand why.", style: "instruction" },
  { text: "Oh no — you lost all your hearts!", style: "statement" },
  { text: "But don't give up! Every great explorer tries again!", style: "encouragement" },
  { text: "Data Valley complete!", style: "celebration" },
  { text: "Sorted Forest complete!", style: "celebration" },
  { text: "Mode Mountain complete!", style: "celebration" },
  { text: "Range River complete!", style: "celebration" },
  { text: "Chance Islands complete!", style: "celebration" },
  { text: "Graph Galaxy complete!", style: "celebration" },
  { text: "Word Problem Peak complete!", style: "celebration" },
  { text: "Master Arena complete!", style: "celebration" },
  { text: "Fantastic work — on to the next world!", style: "encouragement" },

  // ── Mastery Check ─────────────────────────────────
  { text: "Time for a Mastery Check! These questions test your understanding.", style: "instruction" },
  { text: "Answer them to see how well you have learned!", style: "encouragement" },
  { text: "You scored 5 out of 5 — excellent mastery!", style: "celebration" },
  { text: "Well done — you are making great progress!", style: "encouragement" },
  { text: "Keep practising — your worksheet will help you improve!", style: "statement" },

  // ── Adaptive Worksheet ────────────────────────────
  { text: "Based on your performance, I have created a custom worksheet for you.", style: "statement" },
  { text: "This worksheet focuses on the areas where you need more practice.", style: "instruction" },
  { text: "Work through these problems to strengthen your skills!", style: "encouragement" },
  { text: "That's correct! Great work!", style: "celebration" },
  { text: "Not quite. Let us review this concept together!", style: "encouragement" },
  { text: "Worksheet complete! You have strengthened your skills!", style: "celebration" },

  // ── Reflect Phase ─────────────────────────────────
  { text: "Great job exploring data and probability!", style: "statement" },
  { text: "Now let's check what you've learned.", style: "instruction" },
  { text: "Can you help our mascot understand these concepts?", style: "question" },
  { text: "That's exactly right!", style: "celebration" },
  { text: "You really understand this!", style: "encouragement" },
  { text: "Hmm, not quite — but that's okay!", style: "statement" },
  { text: "The correct answer is highlighted. Read it carefully.", style: "instruction" },
  { text: "How confident do you feel about data and probability?", style: "question" },
  { text: "Be honest — every answer helps us help you!", style: "statement" },
  { text: "Incredible! You are a Data Champion!", style: "celebration" },
  { text: "Share your certificate with your teacher!", style: "encouragement" },
  { text: "Great effort! Keep practising to master it!", style: "encouragement" },
  { text: "Every attempt makes you stronger!", style: "statement" },
  { text: "Good start! Review the lessons and try again.", style: "statement" },
  { text: "You'll get there — I believe in you!", style: "encouragement" },

  // ── Streak celebrations ───────────────────────────
  { text: "Amazing! 5 in a row! You're on fire!", style: "celebration" },
  { text: "Amazing! 10 in a row! You're on fire!", style: "celebration" },
  { text: "Amazing! 15 in a row! You're on fire!", style: "celebration" },
];

// ─── De-duplicate ─────────────────────────────────────────────────────────────
const seen    = new Set();
const UNIQUE  = [];
for (const entry of ALL_LINES) {
  const key = `${entry.style}::${entry.text}`;
  if (!seen.has(key)) { seen.add(key); UNIQUE.push(entry); }
}

// ─── Ensure output directory exists ──────────────────────────────────────────
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// ─── Build audioMap (will be written to src/utils/audioMap.js) ───────────────
const existingMap = {};
const mapPath     = path.join(rootDir, 'src', 'utils', 'audioMap.js');
if (fs.existsSync(mapPath)) {
  // Read existing map to skip already-generated files
  const content = fs.readFileSync(mapPath, 'utf8');
  const matches = content.matchAll(/"([^"]+)":\s*"([^"]+)"/g);
  for (const [, k, v] of matches) existingMap[k] = v;
}

// ─── Fetch function ───────────────────────────────────────────────────────────
async function fetchAudio(text, style) {
  const settings = VOICE_SETTINGS[style] || VOICE_SETTINGS.statement;
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'xi-api-key': API_KEY },
    body: JSON.stringify({
      text,
      model_id:       'eleven_multilingual_v2',
      voice_settings: settings,
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${err.slice(0, 200)}`);
  }

  const buf = Buffer.from(await res.arrayBuffer());
  return buf;
}

// ─── Main loop ────────────────────────────────────────────────────────────────
console.log(`\n🎙  Generating ${UNIQUE.length} audio files → public/audio/\n`);

const audioMap = { ...existingMap };
let generated = 0;
let skipped   = 0;
let failed    = 0;

for (let i = 0; i < UNIQUE.length; i++) {
  const { text, style } = UNIQUE[i];
  const key      = `${style}::${text}`;
  const filename = toFilename(text, style);
  const filepath = path.join(OUT_DIR, filename);
  const pubPath  = `/audio/${filename}`;

  process.stdout.write(`[${String(i + 1).padStart(3)}/${UNIQUE.length}] `);

  // Skip if file already exists AND is in the map
  if (fs.existsSync(filepath) && audioMap[key]) {
    console.log(`⏭  SKIP  ${filename}`);
    skipped++;
    continue;
  }

  try {
    const buf = await fetchAudio(text, style);
    fs.writeFileSync(filepath, buf);
    audioMap[key] = pubPath;
    generated++;
    console.log(`✅  OK   ${filename}  (${buf.length} bytes)`);
  } catch (err) {
    failed++;
    console.error(`❌  FAIL ${filename}  — ${err.message}`);
  }

  // Rate-limit: 3 requests/second to stay within ElevenLabs limits
  if (i < UNIQUE.length - 1) await new Promise(r => setTimeout(r, 340));
}

// ─── Write audioMap.js ───────────────────────────────────────────────────────
const mapContent = `// AUTO-GENERATED by scripts/generate_audio.js — do not edit manually
// Maps "style::text" → "/audio/filename.mp3"
export const audioMap = ${JSON.stringify(audioMap, null, 2)};
`;
fs.writeFileSync(mapPath, mapContent, 'utf8');

console.log(`
─────────────────────────────────
✅  Generated : ${generated}
⏭  Skipped   : ${skipped}
❌  Failed    : ${failed}
📄  audioMap  : src/utils/audioMap.js
📁  Audio dir : public/audio/
─────────────────────────────────
`);

if (failed > 0) process.exit(1);
