// ──────────────────────────────────────────────────
// Narration Scripts — Grade 7: Data Handling & Probability
// ──────────────────────────────────────────────────
import { say, ask, cheer, emphasize, think, celebrate, instruct, pauseSeg } from './audio.js';

// ─── Wonder Phase ───────────────────────────────
export const wonderNarration = (question, subtext) => [
  think("Hmm... I wonder...", 400),
  ask(question, 500),
  say(subtext, 200),
];

export const wonderDiscoverNarration = () => [
  cheer("Great thinking! Let's find out together!", 300),
  say("Follow me on this data adventure!", 0),
];

// Per-question specific narration (richer than the generic version)
export const getWonderNarration = (wonderIdx) => {
  const scripts = [
    // 0 — mode question
    [
      think("A class recorded their test scores...", 400),
      ask("72, 85, 90, 68, 85, 77 — which score appears most often?", 500),
      say("When one value repeats more than the rest, we call it the mode!", 200),
    ],
    // 1 — median question
    [
      think("Emma asked five friends how many books they read...", 400),
      ask("3, 7, 5, 2, 8 — what is the middle number when they are sorted?", 500),
      say("The middle value in sorted data is called the median!", 200),
    ],
    // 2 — probability dice
    [
      think("Liam is about to roll a dice...", 400),
      ask("What are the chances of getting a number greater than 4?", 500),
      say("Probability tells us exactly how likely something is to happen!", 200),
    ],
    // 3 — probability marbles
    [
      think("Imagine a bag full of coloured marbles...", 400),
      ask("3 red, 2 blue, and 5 green — is picking green more likely than picking red?", 500),
      say("We can compare likelihoods using fractions and probability!", 200),
    ],
    // 4 — range temperature
    [
      think("Look at this week's temperatures: 18, 22, 25, 19, and 30 degrees...", 400),
      ask("How spread out is this data?", 500),
      say("The range equals the highest value minus the lowest — it shows the spread!", 200),
    ],
  ];
  return scripts[wonderIdx] || scripts[0];
};

// ─── Story Phase ─────────────────────────────────
export const getStoryNarration = (slideIndex) => {
  const scripts = [
    [say("Emma and Liam are on an adventure with their friends."), say("They collect data on everything they find!"), pauseSeg(300)],
    [say("At the market, they record how many fruits each stall sells."), emphasize("Numbers tell a story — if you know how to read them!"), pauseSeg(300)],
    [say("To find the mean, add all values and divide by how many there are."), instruct("It is the fair share of all the data!"), pauseSeg(300)],
    [say("The median is the middle value when numbers are sorted in order."), emphasize("Half the data is above it, half below!"), pauseSeg(300)],
    [say("The mode is the value that appears most often."), cheer("It is the most popular number in the group!"), pauseSeg(300)],
    [say("The range tells us how spread out the data is."), instruct("Subtract the smallest from the largest value."), pauseSeg(300)],
    [say("Now Emma and Liam explore probability — the study of chance!"), ask("How likely is something to happen?"), pauseSeg(300)],
  ];
  return scripts[slideIndex] || [say("Let's keep exploring!")];
};

// ─── Simulate Phase ──────────────────────────────
export const simulateStation1Intro = () => [
  instruct("Let's build a data set together!"),
  say("Tap the values to add them to the number line."),
  cheer("Watch how the mean changes as you add more numbers!", 0),
];

export const simulateStation2Intro = () => [
  instruct("Time to sort the data and find the median!"),
  say("Drag the numbers into order from smallest to largest."),
  emphasize("The middle number is your median!", 0),
];

export const simulateStation3Intro = () => [
  instruct("Now let's find the mode and range."),
  say("Look for the number that appears most often — that is the mode."),
  ask("And can you find the difference between the biggest and smallest?", 0),
];

export const simulateProbabilityIntro = () => [
  say("Probability tells us how likely something is to happen."),
  instruct("We write it as a fraction, decimal, or percentage."),
  cheer("Let's spin, flip, and roll to explore chance!", 0),
];

// ─── Play Phase ──────────────────────────────────
export const playWorldIntro = (worldName) => [
  cheer(`Welcome to ${worldName}!`),
  instruct("Answer the questions to earn stars and XP.", 0),
];

export const playReadQuestion = (questionText) => [
  say(questionText, 0),
];

export const playCorrectNarration = (streak) => {
  if (streak >= 5) return [celebrate(`Amazing! ${streak} in a row! You're on fire!`)];
  if (streak >= 3) return [cheer("Great streak! Keep it going!")];
  return [celebrate("Correct! Well done!")];
};

export const playWrongNarration = () => [
  say("Not quite — let's think about this one again."),
  instruct("Read the explanation to understand why.", 0),
];

export const playGameOverNarration = () => [
  say("Oh no — you lost all your hearts!"),
  cheer("But don't give up! Every great explorer tries again!", 0),
];

export const playWorldComplete = (worldName, score, total) => [
  celebrate(`${worldName} complete!`),
  say(`You scored ${score} out of ${total}.`),
  cheer("Fantastic work — on to the next world!", 0),
];

// ─── Reflect Phase ────────────────────────────────
export const reflectIntroNarration = () => [
  say("Great job exploring data and probability!"),
  instruct("Now let's check what you've learned."),
  ask("Can you help our mascot understand these concepts?", 0),
];

export const reflectCorrectNarration = () => [
  celebrate("That's exactly right!"),
  cheer("You really understand this!", 0),
];

export const reflectWrongNarration = () => [
  say("Hmm, not quite — but that's okay!"),
  instruct("The correct answer is highlighted. Read it carefully.", 0),
];

export const reflectConfidenceNarration = () => [
  ask("How confident do you feel about data and probability?"),
  say("Be honest — every answer helps us help you!", 0),
];

export const reflectCertificateNarration = (pct) => {
  if (pct >= 80) return [celebrate("Incredible! You are a Data Champion!"), cheer("Share your certificate with your teacher!")];
  if (pct >= 50) return [cheer("Great effort! Keep practising to master it!"), say("Every attempt makes you stronger!")];
  return [say("Good start! Review the lessons and try again."), cheer("You'll get there — I believe in you!")];
};
