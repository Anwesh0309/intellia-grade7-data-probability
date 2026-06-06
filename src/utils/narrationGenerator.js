// ──────────────────────────────────────────────────
// Narration Generator — Pre-generate all MP3s with consistent voice ID
// ──────────────────────────────────────────────────

const ELEVENLABS_VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID || 'Xb7hH8MSUJpSbSDYk0k2';
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;

// Voice ID database for narration caching
const narrationCache = new Map();

const getElevenLabsSettings = (speechStyle) => {
  switch (speechStyle) {
    case 'celebration':   return { stability: 0.12, similarity_boost: 0.45, style: 0.75, use_speaker_boost: true };
    case 'encouragement': return { stability: 0.16, similarity_boost: 0.50, style: 0.65, use_speaker_boost: true };
    case 'question':      return { stability: 0.20, similarity_boost: 0.55, style: 0.55, use_speaker_boost: true };
    case 'emphasis':      return { stability: 0.16, similarity_boost: 0.50, style: 0.60, use_speaker_boost: true };
    case 'thinking':      return { stability: 0.24, similarity_boost: 0.60, style: 0.35, use_speaker_boost: true };
    case 'statement':     return { stability: 0.20, similarity_boost: 0.55, style: 0.50, use_speaker_boost: true };
    case 'instruction':   return { stability: 0.18, similarity_boost: 0.52, style: 0.50, use_speaker_boost: true };
    default:              return { stability: 0.20, similarity_boost: 0.55, style: 0.50, use_speaker_boost: true };
  }
};

/**
 * Generate a single narration MP3 with ElevenLabs
 * @param {string} text - Text to convert to speech
 * @param {string} style - Speech style (statement, question, encouragement, etc.)
 * @returns {Promise<Blob>} Audio blob
 */
export async function generateNarrationMP3(text, style = 'statement') {
  const cacheKey = `${text}_${style}`;
  
  // Check cache first
  if (narrationCache.has(cacheKey)) {
    return narrationCache.get(cacheKey);
  }

  if (!ELEVENLABS_API_KEY) {
    console.warn('No ElevenLabs API key provided. Narration generation will fail.');
    throw new Error('ElevenLabs API key not configured');
  }

  try {
    const voiceSettings = getElevenLabsSettings(style);
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: voiceSettings,
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`ElevenLabs ${response.status}: ${errText}`);
    }

    const blob = await response.blob();
    narrationCache.set(cacheKey, blob);
    return blob;
  } catch (error) {
    console.error(`Failed to generate narration for: "${text}"`, error);
    throw error;
  }
}

/**
 * Get cached narration or generate if not available
 * @param {string} text - Text to speak
 * @param {string} style - Speech style
 * @returns {Promise<string>} Object URL for audio
 */
export async function getNarrationAudioUrl(text, style = 'statement') {
  const blob = await generateNarrationMP3(text, style);
  return URL.createObjectURL(blob);
}

/**
 * Pre-generate all narrations for the lesson
 * Call this during app initialization
 * @returns {Promise<void>}
 */
export async function preGenerateAllNarrations() {
  console.log('Starting pre-generation of all narrations...');
  
  const allNarrations = getAllNarrationsToGenerate();
  const total = allNarrations.length;
  let completed = 0;
  const errors = [];

  for (const { text, style } of allNarrations) {
    try {
      await generateNarrationMP3(text, style);
      completed++;
      console.log(`Generated narration ${completed}/${total}`);
    } catch (error) {
      errors.push({ text, style, error });
      console.warn(`Failed to generate: "${text.substring(0, 50)}..."`, error);
    }
  }

  console.log(`Narration generation complete: ${completed}/${total} successful`);
  if (errors.length > 0) {
    console.warn(`${errors.length} narrations failed to generate`);
  }

  return { completed, total, errors };
}

/**
 * Get all narrations needed for the lesson
 * @returns {Array<{text: string, style: string}>}
 */
export function getAllNarrationsToGenerate() {
  const narrations = [];

  // ─── Wonder Phase ───
  narrations.push(
    { text: "Hmm... I wonder...", style: 'thinking' },
    { text: "Great thinking! Let's find out together!", style: 'encouragement' },
    { text: "Follow me on this data adventure!", style: 'statement' }
  );

  // Wonder questions
  const wonderQuestions = [
    { text: "A class recorded their test scores: 72, 85, 90, 68, 85, 77. Which score appears most often?", style: 'question' },
    { text: "When one value repeats more than others, we call it the mode!", style: 'statement' },
    { text: "Emma surveys 5 friends about how many books they read: 3, 7, 5, 2, 8. What is the 'middle' number when sorted?", style: 'question' },
    { text: "The middle value in sorted data is called the median!", style: 'statement' },
    { text: "Liam rolls a die. What are the chances of getting a number greater than 4?", style: 'question' },
    { text: "Probability tells us how likely something is to happen!", style: 'statement' },
    { text: "A bag has 3 red, 2 blue, and 5 green marbles. Is picking green more or less likely than picking red?", style: 'question' },
    { text: "We can compare likelihoods using fractions and probability!", style: 'statement' },
    { text: "Temperature this week was: 18, 22, 25, 19, 30°C. How spread out is the data?", style: 'question' },
    { text: "The range = highest value minus the lowest value — it shows the spread!", style: 'statement' },
  ];
  narrations.push(...wonderQuestions);

  // ─── Story Phase ───
  const storyTexts = [
    { text: "Emma and Liam are on an adventure with their friends.", style: 'statement' },
    { text: "They collect data on everything they find!", style: 'emphasis' },
    { text: "At the market, they record how many fruits each stall sells.", style: 'statement' },
    { text: "Numbers tell a story — if you know how to read them!", style: 'emphasis' },
    { text: "To find the mean, add all values and divide by how many there are.", style: 'instruction' },
    { text: "It is the fair share of all the data!", style: 'instruction' },
    { text: "The median is the middle value when numbers are sorted in order.", style: 'statement' },
    { text: "Half the data is above it, half below!", style: 'emphasis' },
    { text: "The mode is the value that appears most often.", style: 'statement' },
    { text: "It is the most popular number in the group!", style: 'encouragement' },
    { text: "The range tells us how spread out the data is.", style: 'statement' },
    { text: "Subtract the smallest from the largest value.", style: 'instruction' },
    { text: "Now Emma and Liam explore probability — the study of chance!", style: 'statement' },
    { text: "How likely is something to happen?", style: 'question' },
  ];
  narrations.push(...storyTexts);

  // ─── Simulate Phase ───
  const simulateTexts = [
    { text: "Let's build a data set together!", style: 'instruction' },
    { text: "Tap the values to add them to the number line.", style: 'instruction' },
    { text: "Watch how the mean changes as you add more numbers!", style: 'encouragement' },
    { text: "Time to sort the data and find the median!", style: 'instruction' },
    { text: "Drag the numbers into order from smallest to largest.", style: 'instruction' },
    { text: "The middle number is your median!", style: 'emphasis' },
    { text: "Now let's find the mode and range.", style: 'instruction' },
    { text: "Look for the number that appears most often — that is the mode.", style: 'instruction' },
    { text: "And can you find the difference between the biggest and smallest?", style: 'question' },
    { text: "Probability tells us how likely something is to happen.", style: 'statement' },
    { text: "We write it as a fraction, decimal, or percentage.", style: 'instruction' },
    { text: "Let's spin, flip, and roll to explore chance!", style: 'encouragement' },
  ];
  narrations.push(...simulateTexts);

  // ─── Play Phase ───
  const playTexts = [
    { text: "Welcome to Data Valley!", style: 'celebration' },
    { text: "Welcome to Sorted Forest!", style: 'celebration' },
    { text: "Welcome to Mode Mountain!", style: 'celebration' },
    { text: "Welcome to Range River!", style: 'celebration' },
    { text: "Welcome to Chance Islands!", style: 'celebration' },
    { text: "Welcome to Graph Galaxy!", style: 'celebration' },
    { text: "Welcome to Word Problem Peak!", style: 'celebration' },
    { text: "Welcome to Master Arena!", style: 'celebration' },
    { text: "Answer the questions to earn stars and XP.", style: 'instruction' },
    { text: "That's correct! Great work!", style: 'celebration' },
    { text: "Not quite right. Let's try again!", style: 'encouragement' },
    { text: "You completed this world! You earned stars and XP!", style: 'celebration' },
  ];
  narrations.push(...playTexts);

  // ─── Mastery Check Phase ───
  const masteryTexts = [
    { text: "Time for a Mastery Check! These questions test your understanding.", style: 'instruction' },
    { text: "Answer them to see how well you've learned!", style: 'encouragement' },
    { text: "Excellent! You've mastered this concept!", style: 'celebration' },
    { text: "Good work! You're making progress!", style: 'encouragement' },
    { text: "Let's review this topic. You'll get it next time!", style: 'encouragement' },
  ];
  narrations.push(...masteryTexts);

  // ─── Adaptive Worksheet Phase ───
  const worksheetTexts = [
    { text: "Based on your performance, I've created a custom worksheet for you.", style: 'statement' },
    { text: "This worksheet focuses on the areas where you need more practice.", style: 'instruction' },
    { text: "Work through these problems to strengthen your skills!", style: 'encouragement' },
    { text: "Great work on your worksheet! You're improving!", style: 'celebration' },
  ];
  narrations.push(...worksheetTexts);

  // ─── Reflect Phase ───
  const reflectTexts = [
    { text: "Let's reflect on your learning journey!", style: 'statement' },
    { text: "How confident are you with data and probability?", style: 'question' },
    { text: "You're a data superstar!", style: 'celebration' },
    { text: "You're on your way to becoming a data expert!", style: 'encouragement' },
    { text: "Keep practising and you'll master this soon!", style: 'encouragement' },
  ];
  narrations.push(...reflectTexts);

  return narrations;
}

/**
 * Get cached narration blob
 * @param {string} text - Text to find
 * @param {string} style - Style to find
 * @returns {Blob|null}
 */
export function getCachedNarration(text, style) {
  const cacheKey = `${text}_${style}`;
  return narrationCache.get(cacheKey) || null;
}

/**
 * Get all cached narrations
 * @returns {Map<string, Blob>}
 */
export function getAllCachedNarrations() {
  return new Map(narrationCache);
}

/**
 * Clear narration cache
 */
export function clearNarrationCache() {
  narrationCache.clear();
}
