// ──────────────────────────────────────────────────
// Dynamic Question Generation Engine
// Grade 7 — Data Handling & Probability
// No hardcoded banks — all values are generated at runtime
// ──────────────────────────────────────────────────

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

// ─── Core stat calculations ────────────────────────
function calcMean(arr) { return arr.reduce((a, b) => a + b, 0) / arr.length; }

function calcMedian(arr) {
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[mid - 1] + s[mid]) / 2 : s[mid];
}

function calcMode(arr) {
  const freq = {};
  arr.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
  const max = Math.max(...Object.values(freq));
  const modes = Object.keys(freq).filter(k => freq[k] === max).map(Number);
  return modes.length === arr.length ? null : modes; // null if all appear once
}

function calcRange(arr) { return Math.max(...arr) - Math.min(...arr); }

// ─── Generate a clean random data set ─────────────
function genDataSet(size = 5, min = 1, max = 15, forceMode = true) {
  let arr;
  if (forceMode) {
    // Ensure at least one value appears twice
    const base = Array.from({ length: size - 1 }, () => randInt(min, max));
    const repeatVal = base[randInt(0, base.length - 1)];
    arr = shuffle([...base, repeatVal]);
  } else {
    arr = Array.from({ length: size }, () => randInt(min, max));
  }
  return arr;
}

// ─── Wrong answer generators ──────────────────────
function wrongNums(correct, count = 3, range = 5) {
  const wrongs = new Set();
  let attempts = 0;
  while (wrongs.size < count && attempts < 50) {
    const w = correct + randInt(-range, range);
    if (w !== correct && w >= 0) wrongs.add(w);
    attempts++;
  }
  // Fill if needed
  let fill = 1;
  while (wrongs.size < count) { if (correct + fill !== correct) wrongs.add(correct + fill); fill++; }
  return [...wrongs].slice(0, count);
}

function shuffleOptions(correct, wrongs) {
  const opts = shuffle([correct, ...wrongs]);
  return opts.map(v => ({ value: v, label: String(v) }));
}

// ─── Question type generators ─────────────────────

// TYPE 1: Find the mean
function genMeanQuestion(world) {
  const data = genDataSet(randInt(4, 6), 2, 20, false);
  const mean = calcMean(data);
  // Use only integer means for clean questions
  const cleanData = (() => {
    for (let i = 0; i < 20; i++) {
      const d = genDataSet(randInt(4, 5), 1, 15, false);
      const m = calcMean(d);
      if (Number.isInteger(m)) return { data: d, mean: m };
    }
    // Fallback: craft data with integer mean
    const size = 4;
    const vals = Array.from({ length: size - 1 }, () => randInt(2, 12));
    const target = randInt(5, 10);
    const last = target * size - vals.reduce((a, b) => a + b, 0);
    if (last > 0 && last < 20) return { data: [...vals, last], mean: target };
    return { data: [4, 6, 8, 10, 12], mean: 8 };
  })();

  const wrongs = wrongNums(cleanData.mean, 3, 4);
  return {
    world,
    type: 'mean',
    questionText: `The scores of ${cleanData.data.length} students are: ${cleanData.data.join(', ')}. What is the mean score?`,
    dataSet: cleanData.data,
    correctAnswer: cleanData.mean,
    options: shuffleOptions(cleanData.mean, wrongs),
    explanation: `Add all values: ${cleanData.data.join(' + ')} = ${cleanData.data.reduce((a,b)=>a+b,0)}. Divide by ${cleanData.data.length} = ${cleanData.mean}.`,
    statType: 'mean',
  };
}

// TYPE 2: Find the median
function genMedianQuestion(world) {
  const size = randInt(3, 7) % 2 === 0 ? 5 : 7; // odd size for clean median
  const data = genDataSet(size, 1, 20, false);
  const sorted = [...data].sort((a, b) => a - b);
  const median = calcMedian(data);
  const wrongs = wrongNums(median, 3, 5);
  return {
    world,
    type: 'median',
    questionText: `Find the median of this data set: ${data.join(', ')}`,
    dataSet: data,
    sortedDataSet: sorted,
    correctAnswer: median,
    options: shuffleOptions(median, wrongs),
    explanation: `Sort the values: ${sorted.join(', ')}. The middle value is ${median}.`,
    statType: 'median',
  };
}

// TYPE 3: Find the mode
function genModeQuestion(world) {
  const data = genDataSet(6, 1, 12, true);
  const freq = {};
  data.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
  const maxFreq = Math.max(...Object.values(freq));
  const modes = Object.keys(freq).filter(k => freq[k] === maxFreq).map(Number);
  const mode = modes[0];
  const wrongs = data.filter(v => v !== mode).slice(0, 3);
  // Ensure 3 different wrong answers
  const wrongSet = [];
  const seen = new Set([mode]);
  for (const v of [...wrongs, ...data]) {
    if (!seen.has(v)) { seen.add(v); wrongSet.push(v); }
    if (wrongSet.length === 3) break;
  }
  while (wrongSet.length < 3) wrongSet.push(mode + wrongSet.length + 1);

  return {
    world,
    type: 'mode',
    questionText: `What is the mode of: ${data.join(', ')}?`,
    dataSet: data,
    correctAnswer: mode,
    options: shuffleOptions(mode, wrongSet),
    explanation: `${mode} appears the most often (${maxFreq} times). That makes it the mode.`,
    statType: 'mode',
  };
}

// TYPE 4: Find the range
function genRangeQuestion(world) {
  const data = genDataSet(5, 1, 25, false);
  const range = calcRange(data);
  const wrongs = wrongNums(range, 3, 6);
  return {
    world,
    type: 'range',
    questionText: `Find the range of: ${data.join(', ')}`,
    dataSet: data,
    correctAnswer: range,
    options: shuffleOptions(range, wrongs),
    explanation: `Largest value: ${Math.max(...data)}. Smallest: ${Math.min(...data)}. Range = ${Math.max(...data)} − ${Math.min(...data)} = ${range}.`,
    statType: 'range',
  };
}

// TYPE 5: Probability — simple fraction
function genProbabilityQuestion(world) {
  const scenarios = [
    () => {
      const total = randInt(5, 12);
      const favourable = randInt(1, total - 1);
      const item = ['red balls', 'blue marbles', 'even numbers', 'hearts', 'vowels'][randInt(0, 4)];
      const container = ['bag', 'box', 'jar', 'hat'][randInt(0, 3)];
      const pNum = favourable, pDen = total;
      // Simplify
      const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
      const g = gcd(pNum, pDen);
      const simNum = pNum / g, simDen = pDen / g;
      return {
        questionText: `A ${container} has ${total} items. ${favourable} are ${item}. What is the probability of picking ${item}?`,
        correctAnswer: `${simNum}/${simDen}`,
        correctNum: simNum, correctDen: simDen,
        explanation: `P(event) = favourable ÷ total = ${favourable}/${total} = ${simNum}/${simDen}`,
      };
    },
    () => {
      const sides = 6;
      const target = randInt(1, sides);
      return {
        questionText: `A fair dice is rolled once. What is the probability of getting ${target}?`,
        correctAnswer: '1/6',
        correctNum: 1, correctDen: 6,
        explanation: `There is 1 way to get ${target} out of 6 possible outcomes. P = 1/6.`,
      };
    },
    () => {
      const total = randInt(4, 10) * 2;
      const heads = total / 2;
      return {
        questionText: `A coin is flipped ${total} times. Heads came up ${heads} times. What is the experimental probability of heads?`,
        correctAnswer: '1/2',
        correctNum: 1, correctDen: 2,
        explanation: `${heads}/${total} = 1/2. The experimental probability of heads is 1/2.`,
      };
    },
  ];

  const s = scenarios[randInt(0, scenarios.length - 1)]();
  // Generate wrong fraction options
  const wrongFractions = [];
  const seen = new Set([s.correctAnswer]);
  const pool = [
    `${s.correctNum + 1}/${s.correctDen}`,
    `${s.correctNum}/${s.correctDen + 1}`,
    `${s.correctNum + 1}/${s.correctDen + 2}`,
    `${s.correctDen}/${s.correctNum + s.correctDen}`,
  ];
  for (const f of pool) {
    if (!seen.has(f)) { seen.add(f); wrongFractions.push({ value: f, label: f }); }
    if (wrongFractions.length === 3) break;
  }
  while (wrongFractions.length < 3) {
    const f = `${wrongFractions.length + 2}/${s.correctDen + wrongFractions.length}`;
    wrongFractions.push({ value: f, label: f });
  }

  const options = shuffle([{ value: s.correctAnswer, label: s.correctAnswer }, ...wrongFractions]);
  return {
    world,
    type: 'probability',
    questionText: s.questionText,
    correctAnswer: s.correctAnswer,
    options,
    explanation: s.explanation,
    statType: 'probability',
  };
}

// TYPE 6: Graph reading (bar chart data)
function genGraphQuestion(world) {
  const subjects = ['Maths', 'Science', 'English', 'Art', 'PE'];
  const values = subjects.map(() => randInt(5, 30));
  const maxVal = Math.max(...values);
  const maxSubj = subjects[values.indexOf(maxVal)];
  const minVal = Math.min(...values);
  const minSubj = subjects[values.indexOf(minVal)];
  const totalStudents = values.reduce((a, b) => a + b, 0);

  const qTypes = [
    {
      questionText: `The bar chart shows students' favourite subjects. How many students chose ${maxSubj}?`,
      correctAnswer: maxVal,
      explanation: `The bar for ${maxSubj} reaches ${maxVal}.`,
    },
    {
      questionText: `Which subject has the fewest students in the chart? (${subjects.map((s, i) => `${s}: ${values[i]}`).join(', ')})`,
      correctAnswer: minSubj,
      explanation: `${minSubj} has the lowest bar with ${minVal} students.`,
      isText: true,
    },
    {
      questionText: `The chart shows: ${subjects.map((s, i) => `${s}=${values[i]}`).join(', ')}. What is the total number of students?`,
      correctAnswer: totalStudents,
      explanation: `Add all values: ${values.join(' + ')} = ${totalStudents}.`,
    },
  ];

  const q = qTypes[randInt(0, 2)];
  const correctAnswer = q.correctAnswer;

  let options;
  if (q.isText) {
    const wrongSubjects = subjects.filter(s => s !== correctAnswer).slice(0, 3);
    options = shuffle([{ value: correctAnswer, label: correctAnswer }, ...wrongSubjects.map(s => ({ value: s, label: s }))]);
  } else {
    const wrongs = wrongNums(Number(correctAnswer), 3, Math.round(Number(correctAnswer) * 0.3) + 2);
    options = shuffleOptions(Number(correctAnswer), wrongs);
  }

  return {
    world,
    type: 'graph',
    questionText: q.questionText,
    chartData: subjects.map((s, i) => ({ label: s, value: values[i] })),
    correctAnswer,
    options,
    explanation: q.explanation,
    statType: 'graph',
  };
}

// TYPE 7: Word problem combining mean/median/mode
function genWordProblem(world) {
  const names = ['Emma', 'Liam', 'Sofia', 'Noah', 'Mia', 'Ethan', 'Ava', 'Oliver'];
  const count = randInt(4, 6);
  const selectedNames = shuffle(names).slice(0, count);
  const scores = genDataSet(count, 10, 30, true);
  const statChoice = randInt(0, 2);

  if (statChoice === 0) {
    // Mean
    const mean = (() => {
      for (let i = 0; i < 30; i++) {
        const d = Array.from({ length: count }, () => randInt(10, 30));
        const m = calcMean(d);
        if (Number.isInteger(m)) return { data: d, mean: m };
      }
      return { data: [10, 20, 30], mean: 20 };
    })();
    const wrongs = wrongNums(mean.mean, 3, 5);
    return {
      world, type: 'word_mean',
      questionText: `${selectedNames.slice(0, mean.data.length).join(', ')} scored ${mean.data.join(', ')} in a quiz. What was their mean score?`,
      dataSet: mean.data,
      correctAnswer: mean.mean,
      options: shuffleOptions(mean.mean, wrongs),
      explanation: `Mean = (${mean.data.join('+')} ) ÷ ${mean.data.length} = ${mean.data.reduce((a,b)=>a+b,0)} ÷ ${mean.data.length} = ${mean.mean}.`,
      statType: 'mean',
    };
  } else if (statChoice === 1) {
    // Range in context
    const data = genDataSet(count, 5, 40, false);
    const range = calcRange(data);
    const wrongs = wrongNums(range, 3, 5);
    return {
      world, type: 'word_range',
      questionText: `Daily temperatures this week were ${data.join('°C, ')}°C. What is the range of temperatures?`,
      dataSet: data,
      correctAnswer: range,
      options: shuffleOptions(range, wrongs),
      explanation: `Range = highest − lowest = ${Math.max(...data)} − ${Math.min(...data)} = ${range}.`,
      statType: 'range',
    };
  } else {
    // Mode in context
    const data = genDataSet(6, 1, 8, true);
    const freq = {};
    data.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
    const maxFreq = Math.max(...Object.values(freq));
    const mode = Number(Object.keys(freq).find(k => freq[k] === maxFreq));
    const wrongArr = [...new Set(data.filter(v => v !== mode))].slice(0, 3);
    while (wrongArr.length < 3) wrongArr.push(mode + wrongArr.length + 1);
    return {
      world, type: 'word_mode',
      questionText: `A shoe shop recorded these shoe sizes sold: ${data.join(', ')}. What is the modal shoe size?`,
      dataSet: data,
      correctAnswer: mode,
      options: shuffleOptions(mode, wrongArr),
      explanation: `Size ${mode} appears ${maxFreq} times — more than any other size. It is the mode.`,
      statType: 'mode',
    };
  }
}

// ─── World configuration ───────────────────────────
const WORLD_QUESTION_TYPES = [
  { world: 0, generators: [genMeanQuestion], count: 10 },
  { world: 1, generators: [genMedianQuestion], count: 10 },
  { world: 2, generators: [genModeQuestion], count: 10 },
  { world: 3, generators: [genRangeQuestion], count: 10 },
  { world: 4, generators: [genProbabilityQuestion], count: 10 },
  { world: 5, generators: [genGraphQuestion], count: 10 },
  { world: 6, generators: [genWordProblem], count: 10 },
  { world: 7, generators: [genMeanQuestion, genMedianQuestion, genModeQuestion, genRangeQuestion], count: 10 },
];

// ─── Session question generator ───────────────────
export function generateSessionQuestions() {
  const all = [];
  const seen = new Set();

  for (const { world, generators, count } of WORLD_QUESTION_TYPES) {
    let generated = 0;
    let attempts = 0;
    while (generated < count && attempts < count * 5) {
      const gen = generators[Math.floor(Math.random() * generators.length)];
      const q = gen(world);
      const key = q.questionText;
      if (!seen.has(key)) {
        seen.add(key);
        all.push({ ...q, id: `w${world}_${generated}` });
        generated++;
      }
      attempts++;
    }
  }
  return all;
}

// Export individual generators for use in simulations
export { genDataSet, calcMean, calcMedian, calcMode, calcRange, randInt, shuffle };
