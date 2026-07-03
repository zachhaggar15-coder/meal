import { PLAN_SEEDS } from '../data/planSeeds.js';
import { GOAL_LABELS, BUDGET_ESTIMATES, MACRO_PROFILES, MACRO_GRAMS } from './planBuilder.js';

// ── Weights ───────────────────────────────────────────────────────────────────
const W_GOAL        = 30;
const W_DIET        = 25;
const W_SUPERMARKET = 20;
const W_CALORIES    = 15;
const W_BUDGET      = 5;
const W_EFFORT      = 5;
const W_MACROS      = 5;
const W_TOTAL       = W_GOAL + W_DIET + W_SUPERMARKET + W_CALORIES + W_BUDGET + W_EFFORT + W_MACROS;

// Goals that are "related" — partial credit when user picks one and plan has another
const RELATED_GOALS = {
  'weight-loss':           ['budget-fat-loss', 'high-protein-low-cal', 'low-effort'],
  'budget-fat-loss':       ['weight-loss', 'cheap-high-protein', 'cheap-student'],
  'high-protein-low-cal':  ['weight-loss', 'cheap-high-protein', 'muscle-gain', 'body-recomp'],
  'muscle-gain':           ['gym-beginner', 'budget-bodybuilding', 'high-protein-low-cal', 'body-recomp'],
  'gym-beginner':          ['muscle-gain', 'high-protein-low-cal', 'body-recomp'],
  'budget-bodybuilding':   ['muscle-gain', 'cheap-high-protein'],
  'cheap-student':         ['budget-fat-loss', 'cheap-high-protein', 'low-effort'],
  'cheap-high-protein':    ['high-protein-low-cal', 'budget-fat-loss', 'cheap-student'],
  'low-effort':            ['busy-professional', 'cheap-student'],
  'busy-professional':     ['low-effort', 'weight-loss', 'high-protein-low-cal'],
  'vegetarian-low-cal':    ['vegan-low-cal', 'high-protein-vegetarian'],
  'vegan-low-cal':         ['vegetarian-low-cal'],
  'high-protein-vegetarian':['vegetarian-low-cal', 'high-protein-low-cal'],
  'pescatarian':           ['high-protein-low-cal', 'weight-loss'],
  'body-recomp':           ['high-protein-low-cal', 'muscle-gain', 'maintenance', 'cutting'],
};

const EFFORT_ORDER = ['minimal', 'low', 'standard', 'batch', 'high-variety'];
const BUDGET_ORDER = ['very-cheap', 'budget', 'moderate', 'flexible'];
const MARKET_LABELS = {
  aldi: 'Aldi',
  lidl: 'Lidl',
  tesco: 'Tesco',
  asda: 'Asda',
  sainsburys: "Sainsbury's",
  morrisons: 'Morrisons',
  iceland: 'Iceland',
  waitrose: 'Waitrose',
  ocado: 'Ocado',
  'marks-spencer': 'M&S',
  coop: 'Co-op',
  any: 'Generic UK supermarket',
};

// ── Scoring ───────────────────────────────────────────────────────────────────

function scorePlan(seed, answers) {
  let score = 0;

  // ── Goal (30pts) ──
  if (answers.goal) {
    if (seed.goal === answers.goal) {
      score += W_GOAL;
    } else if ((RELATED_GOALS[answers.goal] || []).includes(seed.goal)) {
      score += Math.round(W_GOAL * 0.5);
    }
  } else {
    score += Math.round(W_GOAL * 0.5);
  }

  // ── Diet (25pts) ──
  if (answers.diet) {
    if (seed.dietType === answers.diet) {
      score += W_DIET;
    } else if (answers.diet === 'standard') {
      score += Math.round(W_DIET * 0.6); // standard user is fine with any plan
    } else {
      // Strict mismatch — vegan user shouldn't get meat plan, etc.
      score += 0;
    }
  } else {
    score += Math.round(W_DIET * 0.5);
  }

  // ── Supermarket (20pts) ──
  if (answers.supermarket && answers.supermarket !== 'any') {
    if (seed.supermarket === answers.supermarket) {
      score += W_SUPERMARKET;
    } else if (seed.supermarket === 'any') {
      score += Math.round(W_SUPERMARKET * 0.5);
    } else {
      score += 2; // wrong supermarket — small consolation
    }
  } else {
    score += Math.round(W_SUPERMARKET * 0.6);
  }

  // ── Calories (15pts) ──
  if (answers.calories && answers.calories !== 'unsure') {
    const target = parseInt(answers.calories, 10);
    const diff = Math.abs(seed.calories - target);
    if (diff === 0)        score += W_CALORIES;
    else if (diff <= 300)  score += Math.round(W_CALORIES * 0.7);
    else if (diff <= 500)  score += Math.round(W_CALORIES * 0.3);
    // else 0
  } else {
    score += Math.round(W_CALORIES * 0.5);
  }

  // ── Budget (5pts) ──
  if (answers.budget) {
    const si = BUDGET_ORDER.indexOf(seed.budget);
    const ai = BUDGET_ORDER.indexOf(answers.budget);
    const diff = Math.abs(si - ai);
    if (diff === 0)       score += W_BUDGET;
    else if (diff === 1)  score += Math.round(W_BUDGET * 0.5);
    // else 0
  } else {
    score += Math.round(W_BUDGET * 0.5);
  }

  // ── Effort (5pts) ──
  if (answers.effort) {
    const si = EFFORT_ORDER.indexOf(seed.effort);
    const ai = EFFORT_ORDER.indexOf(answers.effort);
    const diff = Math.abs(si - ai);
    if (diff === 0)       score += W_EFFORT;
    else if (diff <= 1)   score += Math.round(W_EFFORT * 0.6);
    else if (diff <= 2)   score += Math.round(W_EFFORT * 0.3);
    // else 0
  } else {
    score += Math.round(W_EFFORT * 0.5);
  }

  // ── Macro preference (5pts bonus) ──
  if (answers.macros) {
    const plan = answers.macroMode === 'custom-grams'
      ? MACRO_GRAMS[seed.emphasis] || MACRO_GRAMS['lean-protein']
      : MACRO_PROFILES[seed.emphasis] || MACRO_PROFILES['lean-protein'];
    const sim = cosineSimilarity(answers.macros, plan);
    score += Math.round(sim * W_MACROS);
  } else {
    score += Math.round(W_MACROS * 0.5);
  }

  return Math.min(100, Math.round((score / W_TOTAL) * 100));
}

function cosineSimilarity(a, b) {
  const keys = ['protein', 'carbs', 'fats', 'fibre'];
  const dot  = keys.reduce((s, k) => s + (a[k] || 50) * (b[k] || 50), 0);
  const magA = Math.sqrt(keys.reduce((s, k) => s + (a[k] || 50) ** 2, 0));
  const magB = Math.sqrt(keys.reduce((s, k) => s + (b[k] || 50) ** 2, 0));
  return magA && magB ? dot / (magA * magB) : 0;
}

// ── Match label & reason ──────────────────────────────────────────────────────

function matchLabel(score) {
  if (score >= 88) return 'Best Match';
  if (score >= 72) return 'Great Match';
  if (score >= 55) return 'Good Match';
  return 'Possible Match';
}

function buildMatchReason(seed, answers) {
  const parts = [];
  if (answers.goal && seed.goal === answers.goal) {
    parts.push(`matches your ${GOAL_LABELS[seed.goal] || seed.goal} goal`);
  }
  if (answers.supermarket && answers.supermarket !== 'any' && seed.supermarket === answers.supermarket) {
    parts.push(`uses ${marketLabel(seed.supermarket)}`);
  }
  if (answers.diet && seed.dietType === answers.diet && answers.diet !== 'standard') {
    parts.push(`${seed.dietType} meals throughout`);
  }
  if (answers.calories && answers.calories !== 'unsure') {
    const diff = Math.abs(seed.calories - parseInt(answers.calories, 10));
    if (diff <= 300) parts.push(`~${seed.calories} kcal target`);
  }
  if (parts.length === 0) return 'Closest match across your preferences.';
  return `This plan ${parts.join(', ')}.`;
}

// ── Public API ────────────────────────────────────────────────────────────────

export function getTopMatches(answers, n = 3) {
  // For vegetarian/vegan diet answers, also boost vegetarian-specific goals
  const enrichedAnswers = { ...answers };
  if (answers.diet === 'vegetarian' && !answers.goal) enrichedAnswers.goal = 'vegetarian-low-cal';
  if (answers.diet === 'vegan'       && !answers.goal) enrichedAnswers.goal = 'vegan-low-cal';

  const scored = PLAN_SEEDS.map(seed => ({
    seed,
    score: scorePlan(seed, enrichedAnswers),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, n).map(({ seed, score }) => ({
    slug:          seed.slug,
    title:         seed.title,
    goal:          seed.goal,
    goalLabel:     GOAL_LABELS[seed.goal] || seed.goal,
    supermarket:   seed.supermarket,
    calories:      seed.calories,
    dietType:      seed.dietType,
    budget:        seed.budget,
    effort:        seed.effort,
    priceEstimate: BUDGET_ESTIMATES[seed.budget],
    macros:        MACRO_PROFILES[seed.emphasis] || MACRO_PROFILES['lean-protein'],
    macrosGrams:   MACRO_GRAMS[seed.emphasis] || MACRO_GRAMS['lean-protein'],
    score,
    matchLabel:    matchLabel(score),
    matchReason:   buildMatchReason(seed, enrichedAnswers),
  }));
}

function cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

function marketLabel(value) {
  return MARKET_LABELS[value] || cap(value);
}
