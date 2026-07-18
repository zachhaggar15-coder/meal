import { INDEXABLE_PLAN_SEEDS } from '../data/planSeeds.js';
import { GOAL_LABELS, BUDGET_ESTIMATES, MACRO_PROFILES, MACRO_GRAMS, getSeedMacroGrams } from './planBuilder.js';

// ── Weights ───────────────────────────────────────────────────────────────────
const W_GOAL        = 30;
const W_DIET        = 25;
const W_SUPERMARKET = 20;
const W_CALORIES    = 15;
const W_BUDGET      = 5;
const W_EFFORT      = 5;
const W_BASE_TOTAL  = W_GOAL + W_DIET + W_SUPERMARKET + W_CALORIES + W_BUDGET + W_EFFORT;
const MACRO_EXACT_POOL_LIMIT = 800;
const CUSTOM_MACRO_WEIGHT = 0.42;
const PRESET_MACRO_WEIGHT = 0.12;
const DEFAULT_MACRO_PROFILE = MACRO_PROFILES['lean-protein'];
const DEFAULT_MACRO_GRAMS = MACRO_GRAMS['lean-protein'];

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

function scoreBasePlan(seed, answers) {
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

  return Math.min(100, Math.round((score / W_BASE_TOTAL) * 100));
}

function scorePlan(seed, answers, actualMacros = null) {
  const baseScore = scoreBasePlan(seed, answers);
  if (!answers.macros) return baseScore;

  const macroWeight = answers.macroMode === 'custom-grams'
    ? CUSTOM_MACRO_WEIGHT
    : PRESET_MACRO_WEIGHT;
  const planMacros = actualMacros || getFallbackMacros(seed, answers);
  const macroScore = answers.macroMode === 'custom-grams'
    ? macroTargetScore(answers.macros, planMacros)
    : Math.round(cosineSimilarity(answers.macros, planMacros) * 100);

  return Math.min(100, Math.round((baseScore * (1 - macroWeight)) + (macroScore * macroWeight)));
}

function getFallbackMacros(seed, answers) {
  if (answers.macroMode === 'custom-grams') {
    return MACRO_GRAMS[seed.emphasis] || DEFAULT_MACRO_GRAMS;
  }
  return MACRO_PROFILES[seed.emphasis] || DEFAULT_MACRO_PROFILE;
}

function macroTargetScore(target, plan) {
  const weights = { protein: 0.35, carbs: 0.35, fats: 0.15, fibre: 0.15 };
  const tolerances = { protein: 70, carbs: 90, fats: 45, fibre: 25 };
  let score = 0;
  let totalWeight = 0;

  for (const key of Object.keys(weights)) {
    const targetValue = Number(target?.[key] || 0);
    const planValue = Number(plan?.[key] || 0);
    if (!Number.isFinite(targetValue) || targetValue <= 0) continue;

    const diff = Math.abs(planValue - targetValue);
    const keyScore = Math.max(0, 100 - ((diff / tolerances[key]) * 100));
    score += keyScore * weights[key];
    totalWeight += weights[key];
  }

  return totalWeight ? Math.round(score / totalWeight) : 0;
}

function roughMacroPriority(seed, answers, baseScore, roughMacroScore) {
  const target = answers.macros || {};
  let boost = 0;

  if (target.carbs >= 210 && ['performance-protein', 'high-carb-fuel'].includes(seed.emphasis)) {
    boost += 8;
  }
  if (target.carbs >= 260 && seed.emphasis === 'high-carb-fuel') {
    boost += 8;
  }
  if (target.protein >= 140 && ['performance-protein', 'lean-protein', 'recomp-protein'].includes(seed.emphasis)) {
    boost += 6;
  }

  return (baseScore * (1 - CUSTOM_MACRO_WEIGHT)) + (roughMacroScore * CUSTOM_MACRO_WEIGHT) + boost;
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

function buildMatchReason(seed, answers, macrosGrams = null) {
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
  if (answers.macros && answers.macroMode === 'custom-grams' && macrosGrams) {
    const macroBits = [];
    if (Number.isFinite(macrosGrams.protein)) macroBits.push(`${macrosGrams.protein}g protein`);
    if (Number.isFinite(macrosGrams.carbs)) macroBits.push(`${macrosGrams.carbs}g carbs`);
    if (macroBits.length) parts.push(`averages about ${macroBits.join(' and ')}`);
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

  const useExactMacroMatch = enrichedAnswers.macros && enrichedAnswers.macroMode === 'custom-grams';
  const scored = useExactMacroMatch
    ? scoreExactMacroCandidates(enrichedAnswers)
    : INDEXABLE_PLAN_SEEDS
        .map(seed => ({ seed, score: scorePlan(seed, enrichedAnswers) }))
        .sort((a, b) => b.score - a.score);

  return scored.slice(0, n).map(({ seed, score, macrosGrams }) => {
    const actualMacros = macrosGrams || getSeedMacroGrams(seed);
    return {
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
    macrosGrams:   actualMacros,
    score,
    matchLabel:    matchLabel(score),
    matchReason:   buildMatchReason(seed, enrichedAnswers, actualMacros),
    };
  });
}

function scoreExactMacroCandidates(answers) {
  const roughScored = INDEXABLE_PLAN_SEEDS.map(seed => {
    const baseScore = scoreBasePlan(seed, answers);
    const roughMacroScore = macroTargetScore(answers.macros, getFallbackMacros(seed, answers));
    return {
      seed,
      baseScore,
      roughMacroScore,
      priority: roughMacroPriority(seed, answers, baseScore, roughMacroScore),
    };
  }).sort((a, b) => (
    b.priority - a.priority ||
    b.baseScore - a.baseScore ||
    b.roughMacroScore - a.roughMacroScore
  ));

  return roughScored
    .slice(0, MACRO_EXACT_POOL_LIMIT)
    .map(({ seed }) => {
      const macrosGrams = getSeedMacroGrams(seed);
      const macroScore = macroTargetScore(answers.macros, macrosGrams);
      return {
        seed,
        macrosGrams,
        macroScore,
        score: scorePlan(seed, answers, macrosGrams),
      };
    })
    .sort((a, b) => (
      b.score - a.score ||
      b.macroScore - a.macroScore ||
      String(a.seed.slug).localeCompare(String(b.seed.slug))
    ));
}

function cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

function marketLabel(value) {
  return MARKET_LABELS[value] || cap(value);
}
