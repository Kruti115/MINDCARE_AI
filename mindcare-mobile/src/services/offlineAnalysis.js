// src/services/offlineAnalysis.js
// FIXED VERSION — proper scoring, polarity-aware wellness, correct crisis threshold

// ─── WELLNESS SCORES (matches backend exactly) ────────────────────────────
const WELLNESS_SCORES = {
  joy:     8.5,
  neutral: 5.0,
  sadness: 2.5,
  anxiety: 2.5,
  anger:   2.0,
};

const NEGATIVE_EMOTIONS = new Set(['sadness', 'anxiety', 'anger']);
const POSITIVE_EMOTIONS = new Set(['joy']);

// ─── KEYWORD GROUPS ───────────────────────────────────────────────────────
// Each word maps to an emotion. Longer/more specific words score higher.
const EMOTION_KEYWORDS = {
  joy: [
    'happy', 'happiness', 'joyful', 'joy', 'excited', 'excitement',
    'great', 'wonderful', 'amazing', 'fantastic', 'love', 'loving',
    'excellent', 'good', 'cheerful', 'delighted', 'delight', 'glad',
    'grateful', 'gratitude', 'proud', 'pride', 'optimistic', 'optimism',
    'enthusiastic', 'enthusiasm', 'playful', 'content', 'satisfied',
    'satisfaction', 'relief', 'relieved', 'admiration', 'caring',
    'affection', 'blissful', 'elated', 'thrilled', 'overjoyed',
  ],

  sadness: [
    'sad', 'sadness', 'unhappy', 'depressed', 'depression', 'lonely',
    'loneliness', 'hopeless', 'hopelessness', 'miserable', 'misery',
    'grief', 'grieve', 'crying', 'cry', 'tears', 'weeping', 'wept',
    'hurt', 'heartbroken', 'heartbreak', 'devastated', 'devastation',
    'disappointed', 'disappointment', 'regret', 'remorse', 'guilt',
    'shame', 'embarrassed', 'embarrassment', 'sorrow', 'sorrowful',
    'mourning', 'mourn', 'anguish', 'despair', 'despairing',
    'discouraged', 'discouragement', 'insecure', 'worthless',
    'empty', 'numb', 'hollow', 'broken', 'shattered', 'lost',
    'abandoned', 'betrayed', 'unloved', 'unwanted',
  ],

  anger: [
    'angry', 'anger', 'mad', 'furious', 'fury', 'rage', 'enraged',
    'hate', 'hatred', 'frustrated', 'frustration', 'annoyed', 'annoyance',
    'irritated', 'irritation', 'pissed', 'outraged', 'outrage',
    'resentful', 'resentment', 'bitter', 'bitterness', 'disgusted',
    'disgust', 'contempt', 'disapproval', 'indignant', 'indignation',
    'agitated', 'agitation', 'hostile', 'hostility', 'vengeance',
    'livid', 'seething', 'fed up', 'sick of', 'tired of',
    // frustration/burnout signals
    'stuck', 'blocked', 'unable to', 'not able to', 'can\'t seem',
    'no motivation', 'demotivated', 'unmotivated', 'burnt out',
    'burned out', 'drained', 'nothing works',
  ],

  anxiety: [
    'anxious', 'anxiety', 'worried', 'worry', 'scared', 'fear', 'fearful',
    'afraid', 'nervous', 'nervousness', 'stressed', 'stress', 'panic',
    'panicking', 'overwhelmed', 'terror', 'terrified', 'dread', 'dreading',
    'apprehensive', 'apprehension', 'alarm', 'alarmed', 'uneasy',
    'uneasiness', 'doubt', 'doubtful', 'restless', 'restlessness',
    'shock', 'shocked', 'phobia', 'hypervigilant',
  ],

  neutral: [
    'okay', 'ok', 'fine', 'alright', 'normal', 'average', 'neutral',
    'indifferent', 'bored', 'boredom', 'curious', 'curiosity',
    'thinking', 'reflecting', 'reflection', 'calm', 'composed',
    'detached', 'detachment', 'focused', 'focus', 'accepted',
    'acceptance', 'contemplating', 'contemplation',
  ],
};

// ─── NEGATION WORDS ───────────────────────────────────────────────────────
const NEGATION_WORDS = [
  'not', "n't", 'no', 'never', 'dont', "don't", 'cant', "can't",
  'wont', "won't", 'isnt', "isn't", 'wasnt', "wasn't", 'havent',
  "haven't", 'without', 'unable', 'cannot', 'hardly', 'barely',
];

// ─── BURNOUT SIGNALS (maps to anger/frustration) ──────────────────────────
const BURNOUT_PHRASES = [
  'tired but', 'exhausted but', 'not able to', 'not being able',
  'unable to', "can't seem", 'cannot seem', 'want to but',
  'trying but', 'no motivation', 'demotivated', 'burnt out',
  'burned out', 'nothing is working', 'not working out',
  'keep failing', 'stuck',
];

// ─── PAIN SIGNALS (suppresses joy if present) ────────────────────────────
const PAIN_SIGNALS = [
  'affliction', 'anguish', 'agony', 'torment', 'suffering',
  'despair', 'desolation', 'heartbreak', 'devastated', 'shattered',
  'hollow', 'empty', 'numb', 'void', 'worthless', 'hopeless',
  'helpless', 'abandoned', 'betrayed', 'trapped', 'suffocating',
  'drowning', 'dying inside', 'want to disappear',
];

// ─── SARCASM PAIRS (positive word + negative context) ────────────────────
const SARCASM_PAIRS = [
  ['laugh',   'pain'],  ['laugh',   'hurt'],  ['laugh',  'cry'],
  ['smile',   'tears'], ['smile',   'hurt'],  ['smile',  'alone'],
  ['happy',   'fake'],  ['happy',   'mask'],  ['happy',  'pretend'],
  ['fine',    'not'],   ['okay',    'not'],   ['great',  'not'],
  ['laughter','wake'],  ['laughter','grief'], ['laughter','pain'],
  ['joy',     'grief'], ['joy',     'sorrow'],
];

// ─── MAIN FUNCTION ────────────────────────────────────────────────────────
export const analyzeTextOffline = (text) => {
  if (!text || !text.trim()) {
    return buildResult('neutral', { neutral: 1.0 }, 0.5);
  }

  const t = text.toLowerCase();

  // ── Step 1: Score each emotion by keyword matches ──────────────────────
  const rawScores = { joy: 0, sadness: 0, anger: 0, anxiety: 0, neutral: 0 };

  for (const [emotion, words] of Object.entries(EMOTION_KEYWORDS)) {
    for (const word of words) {
      if (t.includes(word)) {
        // Longer/more specific phrases score 2x
        rawScores[emotion] += word.includes(' ') ? 2 : 1;
      }
    }
  }

  // ── Step 2: Context detection ──────────────────────────────────────────
  const hasNegation   = NEGATION_WORDS.some(n => t.includes(n));
  const hasPain       = PAIN_SIGNALS.some(p => t.includes(p));
  const hasBurnout    = BURNOUT_PHRASES.some(b => t.includes(b));
  const hasSarcasm    = SARCASM_PAIRS.some(([pos, neg]) => t.includes(pos) && t.includes(neg));
  const painCount     = PAIN_SIGNALS.filter(p => t.includes(p)).length;

  // ── Step 3: Context adjustments ───────────────────────────────────────

  // Burnout + negation → boost anger (frustration), reduce anxiety/neutral
  if (hasBurnout && hasNegation) {
    rawScores.anger   += 3;
    rawScores.anxiety  = Math.max(0, rawScores.anxiety - 1);
    rawScores.neutral  = Math.max(0, rawScores.neutral - 1);
  }

  // Pain signals → suppress joy, boost sadness
  if (hasPain) {
    const penalty = Math.min(4, painCount);
    rawScores.joy     = Math.max(0, rawScores.joy - penalty);
    rawScores.sadness += Math.floor(penalty * 0.7);
    rawScores.anxiety += Math.floor(penalty * 0.3);
  }

  // Sarcasm → flip joy to sadness
  if (hasSarcasm && rawScores.joy > rawScores.sadness) {
    const flip = Math.floor(rawScores.joy * 0.6);
    rawScores.joy     -= flip;
    rawScores.sadness += flip;
  }

  // Negation + joy dominant → shift to sadness
  if (hasNegation && rawScores.joy > 0 && rawScores.joy >= rawScores.sadness) {
    const shift = Math.floor(rawScores.joy * 0.4);
    rawScores.joy     -= shift;
    rawScores.sadness += shift;
  }

  // ── Step 4: Normalize to probabilities ───────────────────────────────
  const total = Object.values(rawScores).reduce((a, b) => a + b, 0);
  let probs;

  if (total === 0) {
    // No keywords matched — default to neutral
    probs = { joy: 0.1, sadness: 0.1, anger: 0.1, anxiety: 0.1, neutral: 0.6 };
  } else {
    probs = {};
    for (const [e, s] of Object.entries(rawScores)) {
      probs[e] = parseFloat((s / total).toFixed(4));
    }
  }

  // ── Step 5: Pick primary emotion ──────────────────────────────────────
  const primary = Object.entries(probs).sort((a, b) => b[1] - a[1])[0][0];
  const rawConfidence = probs[primary];

  // Confidence: scale down — offline is less reliable than online model
  const confidence = parseFloat(Math.min(0.75, Math.max(0.45, rawConfidence * 0.85)).toFixed(3));

  // ── Step 6: Wellness score — polarity-aware blending (matches backend) ─
  let wellnessScore = WELLNESS_SCORES[primary] ?? 5.0;

  const sorted = Object.entries(probs).sort((a, b) => b[1] - a[1]);
  if (sorted.length >= 2) {
    const [secondEmotion, secondScore] = sorted[1];
    const samePolarity = (
      (NEGATIVE_EMOTIONS.has(primary) && NEGATIVE_EMOTIONS.has(secondEmotion)) ||
      (POSITIVE_EMOTIONS.has(primary) && POSITIVE_EMOTIONS.has(secondEmotion))
    );
    if (samePolarity && secondScore > 0.15) {
      const secondWellness = WELLNESS_SCORES[secondEmotion] ?? 5.0;
      wellnessScore = parseFloat((0.7 * wellnessScore + 0.3 * secondWellness).toFixed(2));
    }
  }

  return buildResult(primary, probs, confidence, wellnessScore, {
    hasNegation, hasPain, hasSarcasm, hasBurnout,
  });
};

// ─── HELPER ───────────────────────────────────────────────────────────────
function buildResult(primary, probs, confidence, wellnessScore, flags = {}) {
  const ws = wellnessScore ?? WELLNESS_SCORES[primary] ?? 5.0;
  const crisis = ws <= 3.0;

  let contextNote = '';
  if (flags.hasSarcasm)            contextNote = 'Possible sarcasm detected. ';
  else if (flags.hasBurnout && flags.hasNegation) contextNote = 'Signs of frustration or burnout detected. ';
  else if (flags.hasPain)          contextNote = 'Distress signals detected. ';
  else if (flags.hasNegation)      contextNote = 'Negation context considered. ';

  let moodNote = '';
  if      (ws >= 7)   moodNote = 'You seem to be in a positive emotional state.';
  else if (ws >= 5)   moodNote = 'Your emotional state appears balanced.';
  else if (ws >= 3.5) moodNote = 'You may be experiencing some emotional difficulty.';
  else                moodNote = 'This seems like a difficult time — support is available.';

  return {
    status: 'success',
    data: {
      emotion: {
        primary,
        confidence,
        all_probabilities: probs,
      },
      wellness_score: ws,
      interpretation: `${contextNote}Offline analysis: ${primary}. ${moodNote} (Connect to internet for AI-powered results.)`,
      crisis_indicators: {
        crisis_detected: crisis,
        recommendation: crisis ? 'Seek professional support' : 'Continue monitoring',
      },
      mode: 'offline',
    },
  };
}