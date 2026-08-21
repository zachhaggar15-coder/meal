import { INDEXABLE_PLAN_SEEDS } from '../data/planSeeds.js';
import { GOAL_LABELS, BUDGET_ESTIMATES, MACRO_PROFILES, MACRO_GRAMS, getSeedMacroGrams } from './planBuilder.js';
import { macroMatchStatus } from './macroTargets.js';

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
// The plan seeds' own budget tiers, cheapest first. `flexible` is a tier name
// in the plan data (the £55+ one) and is left alone here; what changed is the
// QUIZ, which used to offer that tier under the word "Flexible" and had no way
// at all to say "budget does not matter to me".
const BUDGET_ORDER = ['very-cheap', 'budget', 'moderate', 'flexible'];
export const BUDGET_NO_PREFERENCE = 'no-preference';

/** True when the answer means "do not rank on budget at all". */
export function isBudgetUnweighted(answer) {
  return !answer || answer === BUDGET_NO_PREFERENCE || answer === 'any' || answer === 'unsure';
}
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
  // "No preference" has to mean no preference. The old top option was labelled
  // "Flexible" while sitting at the top of this ordered scale, so a reader who
  // meant "I don't mind" was scored as "I want the most expensive tier" — the
  // one answer that should remove budget from the ranking was quietly the
  // strongest budget signal available.
  if (answers.budget && !isBudgetUnweighted(answers.budget)) {
    const si = BUDGET_ORDER.indexOf(seed.budget);
    const ai = BUDGET_ORDER.indexOf(answers.budget);
    const diff = Math.abs(si - ai);
    if (diff === 0)       score += W_BUDGET;
    else if (diff === 1)  score += Math.round(W_BUDGET * 0.5);
    // else 0
  } else {
    // Every plan scores the same here, so budget cannot move the ranking.
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

// A plan can score highly on goal, diet, supermarket, budget and effort while
// completely missing the requested calorie target, because calories are only
// worth W_CALORIES of the base total. Labelling that "Great Match" is
// misleading, so hard constraints cap the label regardless of overall score.
const CALORIE_NEAR_MISS = 300;

// ── Calorie distance ──────────────────────────────────────────────────────
//
// Calories are not a preference like a supermarket. Asda instead of Tesco is an
// inconvenience; 1,800 kcal instead of 2,500 is a different diet, and no amount
// of agreement elsewhere makes up for it. Points could, though: calories were
// worth 15 and the supermarket 20, so a plan 700 kcal out at the right shop
// outranked one at the right calories at the wrong shop. Asking for 2,500
// returned 1,800, summarised as "5 exact · 1 trade-off".
//
// Measured across 34,560 quiz outcomes before this changed: 27.9% landed more
// than 500 kcal from what was asked for, and the worst was 2,100 kcal out.
//
// The bands come from the corpus, not from taste. Plans exist at 1,400, 1,500,
// 1,600, 1,800, 2,000, 2,200, 2,500, 3,000 and 3,500 kcal, so adjacent levels
// sit 100-500 apart, and the same absolute gap means less at the top of that
// range than the bottom: 300 kcal is a fifth of a 1,500 plan and a tenth of a
// 3,000 one. Hence a floor with a proportional term above it.
export const CALORIE_DISTANCE = {
  EXACT: 'exact',
  VERY_CLOSE: 'very-close',
  NEARBY: 'nearby',
  MISMATCHED: 'mismatched',
};

const CALORIE_VERY_CLOSE = 150;
const CALORIE_NEARBY_FLOOR = 300;
const CALORIE_NEARBY_SHARE = 0.12;

export function calorieDistanceBand(target, planCalories) {
  const wanted = Number(target);
  const got = Number(planCalories);
  if (!Number.isFinite(wanted) || !Number.isFinite(got)) return CALORIE_DISTANCE.NEARBY;

  const diff = Math.abs(got - wanted);
  if (diff === 0) return CALORIE_DISTANCE.EXACT;
  if (diff <= CALORIE_VERY_CLOSE) return CALORIE_DISTANCE.VERY_CLOSE;
  if (diff <= Math.max(CALORIE_NEARBY_FLOOR, wanted * CALORIE_NEARBY_SHARE)) {
    return CALORIE_DISTANCE.NEARBY;
  }
  return CALORIE_DISTANCE.MISMATCHED;
}

/** The calorie target the answers ask for, or null when none was given. */
export function requestedCalories(answers = {}) {
  if (!answers.calories || answers.calories === 'unsure') return null;
  const target = parseInt(answers.calories, 10);
  return Number.isFinite(target) ? target : null;
}

function matchLabel(score, compromises = []) {
  const hasHardMiss = compromises.some(item => item.severity === 'hard');
  if (hasHardMiss) return 'Closest Match';
  if (compromises.length) return score >= 72 ? 'Good Match' : 'Possible Match';

  if (score >= 88) return 'Best Match';
  if (score >= 72) return 'Great Match';
  if (score >= 55) return 'Good Match';
  return 'Possible Match';
}

// Lists the ways a plan does not actually satisfy what was asked for, so the
// results card can say so plainly instead of implying a clean match.
function buildCompromises(seed, answers) {
  const compromises = [];

  if (answers.calories && answers.calories !== 'unsure') {
    const target = parseInt(answers.calories, 10);
    const diff = Math.abs(seed.calories - target);
    if (diff > CALORIE_NEAR_MISS) {
      compromises.push({
        type: 'calories',
        severity: 'hard',
        text: `This plan is ${seed.calories.toLocaleString('en-GB')} kcal, not the ${target.toLocaleString('en-GB')} kcal you asked for.`,
      });
    }
  }

  if (answers.supermarket && answers.supermarket !== 'any' && seed.supermarket !== answers.supermarket) {
    compromises.push({
      type: 'supermarket',
      severity: seed.supermarket === 'any' ? 'soft' : 'hard',
      text: seed.supermarket === 'any'
        ? 'Uses generic UK supermarket ingredients rather than a specific store.'
        : `Built around ${marketLabel(seed.supermarket)}, not ${marketLabel(answers.supermarket)}.`,
    });
  }

  if (answers.diet && answers.diet !== 'standard' && seed.dietType !== answers.diet) {
    compromises.push({
      type: 'diet',
      severity: 'hard',
      text: `This is a ${seed.dietType} plan, not ${answers.diet}.`,
    });
  }

  return compromises;
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
    const macroBits = [
      ['protein', 'protein'],
      ['carbs', 'carbs'],
      ['fats', 'fat'],
      ['fibre', 'fibre'],
    ].filter(([key]) => Number.isFinite(Number(macrosGrams[key])))
      .map(([key, label]) => `${macrosGrams[key]}g ${label}`);
    if (macroBits.length) parts.push(`averages about ${macroBits.join(' and ')}`);
  }
  if (parts.length === 0) return 'Closest match across your preferences.';
  return `This plan ${parts.join(', ')}.`;
}

function buildMatchDetails(seed, answers, macrosGrams = null) {
  const details = [];

  if (answers.goal) {
    const exact = seed.goal === answers.goal;
    const related = (RELATED_GOALS[answers.goal] || []).includes(seed.goal);
    details.push({
      type: 'goal',
      label: 'Goal',
      status: exact ? 'exact' : (related ? 'close' : 'tradeoff'),
      text: exact
        ? `${GOAL_LABELS[seed.goal] || seed.goal} matches your goal.`
        : related
          ? `${GOAL_LABELS[seed.goal] || seed.goal} is a related goal.`
          : `${GOAL_LABELS[seed.goal] || seed.goal} differs from your selected goal.`,
    });
  }

  if (answers.diet) {
    const unrestricted = answers.diet === 'standard';
    const exact = seed.dietType === answers.diet;
    details.push({
      type: 'diet',
      label: 'Diet',
      status: unrestricted || exact ? 'exact' : 'tradeoff',
      text: unrestricted
        ? 'No dietary restriction was requested.'
        : exact
          ? `${cap(seed.dietType)} meals throughout.`
          : `${cap(seed.dietType)} does not match your ${answers.diet} choice.`,
    });
  }

  if (answers.supermarket) {
    const anyMarket = answers.supermarket === 'any';
    const exact = seed.supermarket === answers.supermarket;
    const generic = seed.supermarket === 'any';
    details.push({
      type: 'supermarket',
      label: 'Supermarket',
      status: anyMarket || exact ? 'exact' : (generic ? 'close' : 'tradeoff'),
      text: anyMarket
        ? `${marketLabel(seed.supermarket)} fits your flexible supermarket choice.`
        : exact
          ? `Built around ${marketLabel(seed.supermarket)}.`
          : generic
            ? 'Uses generic UK supermarket ingredients.'
            : `Built around ${marketLabel(seed.supermarket)}, not ${marketLabel(answers.supermarket)}.`,
    });
  }

  if (answers.calories && answers.calories !== 'unsure') {
    const target = parseInt(answers.calories, 10);
    if (Number.isFinite(target)) {
      const diff = Math.abs(seed.calories - target);
      details.push({
        type: 'calories',
        label: 'Calories',
        status: diff <= 100 ? 'exact' : (diff <= CALORIE_NEAR_MISS ? 'close' : 'tradeoff'),
        text: diff === 0
          ? `Matches your ${target.toLocaleString('en-GB')} kcal target.`
          : `${seed.calories.toLocaleString('en-GB')} kcal/day is ${diff.toLocaleString('en-GB')} kcal from your target.`,
      });
    }
  }

  // Saying "no preference" must not then produce a budget verdict. Reporting a
  // plan as "outside your budget choice" when the reader made none is the same
  // mistake as scoring them for the top tier.
  if (!isBudgetUnweighted(answers.budget)) {
    const seedIndex = BUDGET_ORDER.indexOf(seed.budget);
    const answerIndex = BUDGET_ORDER.indexOf(answers.budget);
    const diff = Math.abs(seedIndex - answerIndex);
    details.push({
      type: 'budget',
      label: 'Budget',
      status: diff === 0 ? 'exact' : (diff === 1 ? 'close' : 'tradeoff'),
      text: diff === 0
        ? `${BUDGET_ESTIMATES[seed.budget]} per person, per week matches your budget band.`
        : `${BUDGET_ESTIMATES[seed.budget]} per person, per week is ${diff === 1 ? 'one band from' : 'outside'} your budget choice.`,
    });
  }

  if (answers.effort) {
    const seedIndex = EFFORT_ORDER.indexOf(seed.effort);
    const answerIndex = EFFORT_ORDER.indexOf(answers.effort);
    const diff = Math.abs(seedIndex - answerIndex);
    details.push({
      type: 'effort',
      label: 'Cooking effort',
      status: diff === 0 ? 'exact' : (diff <= 1 ? 'close' : 'tradeoff'),
      text: diff === 0
        ? `${effortLabel(seed.effort)} matches your choice.`
        : `${effortLabel(seed.effort)} is ${diff === 1 ? 'close to' : 'different from'} your preferred effort.`,
    });
  }

  if (answers.macros && answers.macroMode === 'custom-grams' && macrosGrams) {
    const status = macroMatchStatus(answers.macros, macrosGrams);
    details.push({
      type: 'macros',
      label: 'Macros',
      status,
      text: `About ${macrosGrams.protein}g protein, ${macrosGrams.carbs}g carbs, ${macrosGrams.fats}g fat and ${macrosGrams.fibre}g fibre per day.`,
    });
  }

  return details;
}

function buildMatchSummary(details) {
  const exact = details.filter(item => item.status === 'exact').length;
  const close = details.filter(item => item.status === 'close').length;
  const tradeoffs = details.filter(item => item.status === 'tradeoff').length;
  return [
    exact ? `${exact} exact` : '',
    close ? `${close} close` : '',
    tradeoffs ? `${tradeoffs} trade-off${tradeoffs === 1 ? '' : 's'}` : '',
  ].filter(Boolean).join(' · ') || 'Broad match';
}

// ── Public API ────────────────────────────────────────────────────────────────

export function getTopMatches(answers, n = 3) {
  // For vegetarian/vegan diet answers, also boost vegetarian-specific goals
  const enrichedAnswers = { ...answers };
  if (answers.diet === 'vegetarian' && !answers.goal) enrichedAnswers.goal = 'vegetarian-low-cal';
  if (answers.diet === 'vegan'       && !answers.goal) enrichedAnswers.goal = 'vegan-low-cal';

  const useExactMacroMatch = enrichedAnswers.macros && enrichedAnswers.macroMode === 'custom-grams';
  const allScored = useExactMacroMatch
    ? scoreExactMacroCandidates(enrichedAnswers)
    : INDEXABLE_PLAN_SEEDS
        .map(seed => ({ seed, score: scorePlan(seed, enrichedAnswers) }))
        .sort((a, b) => b.score - a.score || comparePlanPreference(a.seed, b.seed));

  // Two constraints are not preferences, and they are not equal to each other.
  //
  // Diet is the harder of the two: someone who says vegan is not accepting a
  // meat plan at any calorie count, so diet is filtered first and calories are
  // only ever applied inside what is left. Get that order wrong and tightening
  // calories starts handing vegans chicken — a 2,000 kcal vegan plan would be
  // out of band for a 3,000 kcal request, leaving a 3,000 kcal meat plan to win.
  //
  // Calories come second, and are a bound rather than a tie-break. A plan
  // outside the band cannot win on points collected elsewhere, however many it
  // collects — that is the whole defect. It is still shown when nothing inside
  // the band exists, but labelled as the compromise it is.
  const dietRestricted = enrichedAnswers.diet && enrichedAnswers.diet !== 'standard';
  const dietMatched = dietRestricted
    ? allScored.filter(({ seed }) => seed.dietType === enrichedAnswers.diet)
    : allScored;
  const pool = dietMatched.length ? dietMatched : allScored;

  const target = requestedCalories(enrichedAnswers);
  const withinBand = target === null
    ? pool
    : pool.filter(({ seed }) => (
      calorieDistanceBand(target, seed.calories) !== CALORIE_DISTANCE.MISMATCHED
    ));
  const noCloseMatch = target !== null && withinBand.length === 0;
  // When nothing is in band, proximity becomes the ranking rather than one
  // term in it. Otherwise the fallback answers a 3,500 kcal request with a
  // 1,400 kcal plan — because it happens to share the goal — while the note
  // beside it truthfully says the nearest targets are 2,000 and 3,000.
  const scored = noCloseMatch
    ? [...pool].sort((a, b) => (
      Math.abs(a.seed.calories - target) - Math.abs(b.seed.calories - target)
        || b.score - a.score
        || comparePlanPreference(a.seed, b.seed)
    ))
    : withinBand;
  const closestAvailable = noCloseMatch
    ? [...new Set(pool.map(({ seed }) => seed.calories))]
      .sort((a, b) => Math.abs(a - target) - Math.abs(b - target))
      .slice(0, 2)
      .sort((a, b) => a - b)
    : [];

  return scored.slice(0, n).map(({ seed, score, macrosGrams }) => {
    const actualMacros = macrosGrams || getSeedMacroGrams(seed);
    const compromises = buildCompromises(seed, enrichedAnswers);
    const matchDetails = buildMatchDetails(seed, enrichedAnswers, actualMacros);
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
    matchLabel:    matchLabel(score, compromises),
    matchReason:   buildMatchReason(seed, enrichedAnswers, actualMacros),
    matchDetails,
    // A 700 kcal miss counted as one "trade-off" beside five "exact" dimensions,
    // so the headline read "5 exact · 1 trade-off" — five agreements outvoting
    // the one thing the reader actually asked for. When the calories are not
    // close, that is the summary.
    matchSummary: noCloseMatch
      ? `${Math.abs(seed.calories - target).toLocaleString('en-GB')} kcal from your target`
      : buildMatchSummary(matchDetails),
    compromises,
    // Every dimension the user expressed must actually be satisfied. This used
    // to be `compromises.length === 0`, which tolerated anything inside the
    // near-miss thresholds — a 1,800 kcal plan came back flagged as an exact
    // match for a 1,500 kcal request. The rendered card was already honest
    // (matchSummary said "5 exact · 1 close"), but the flag itself overstated,
    // and it is part of the public result shape.
    isExactMatch:  compromises.length === 0 && matchDetails.every(item => item.status === 'exact'),
    // How far this plan's calories are from the request, as a band rather than
    // a score, so a caller can say "not close" without re-deriving it.
    calorieBand:   target === null ? null : calorieDistanceBand(target, seed.calories),
    // True only when the library genuinely has nothing near the request. The
    // results page must say so rather than presenting the gap as a trade-off
    // among others — "5 exact · 1 trade-off" is what a 700 kcal miss used to
    // look like.
    noCloseCalorieMatch: noCloseMatch,
    calorieShortfallNote: noCloseMatch
      ? `No plan in the library is close to ${target.toLocaleString('en-GB')} kcal. The nearest targets are ${
        closestAvailable.map(value => `${value.toLocaleString('en-GB')} kcal`).join(' and ')
      } — pick one of those, or set a custom target near them.`
      : '',
    };
  });
}

// Deterministic tie-break for equally-scoring plans.
//
// The main ranking path sorted on score alone, so plans on the same score were
// left in whatever order they happened to occupy in INDEXABLE_PLAN_SEEDS.
// Reversing that array changed the recommendation — aldi-weight-loss-1500
// became aldi-weight-loss-1500-lower-sugar-v4 — which is the same failure class
// as the chooser routing defect: an accidental ordering deciding which member
// of an equally-good set the user is shown, and favouring a variant carrying
// attributes the user never asked for.
//
// Ties now resolve the way src/utils/planRecommendation.js resolves them:
// prefer the least specialised plan, then the slug, so the answer depends only
// on the plans themselves. The macro path already tie-broke on slug; this
// extends the same guarantee to the default path and to the candidate pool that
// feeds exact macro matching.
function slugSegmentCount(slug) {
  return String(slug || '').split('-').length;
}

function comparePlanPreference(a, b) {
  const specificity = slugSegmentCount(a.slug) - slugSegmentCount(b.slug);
  if (specificity !== 0) return specificity;
  return String(a.slug).localeCompare(String(b.slug));
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
    b.roughMacroScore - a.roughMacroScore ||
    comparePlanPreference(a.seed, b.seed)
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
      comparePlanPreference(a.seed, b.seed)
    ));
}

function cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

function marketLabel(value) {
  return MARKET_LABELS[value] || cap(value);
}

function effortLabel(value) {
  const labels = {
    minimal: 'Minimal prep',
    low: 'Low effort',
    standard: 'Standard cooking',
    batch: 'Batch cooking',
    'high-variety': 'High variety',
  };
  return labels[value] || cap(value);
}
