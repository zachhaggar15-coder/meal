import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { INDEXABLE_PLAN_SEEDS } from '../../src/data/planSeeds.js';
import { mealPlansData } from '../../src/data/mealPlans.js';
import { buildPlan, buildShoppingList } from '../../src/utils/planBuilder.js';
import { buildCanonicalLegacyPlan } from '../../src/utils/legacyPlanBuilder.js';
import { parseIngredientLine } from '../../src/utils/ingredientParser.js';
import { resolvePotatoPreparation } from '../../src/utils/recipeQuality.js';
import { buildContainerSetup } from '../../src/utils/containerSetup.js';
import { PRICING_CONTEXT_CHECKED } from '../../src/data/supermarketProfiles.js';
import {
  buildCalibrationMetrics,
  readSemanticQaCalibration,
} from './semanticQaCalibration.js';
import {
  ledgerRows,
  readLedger,
  recheckRoute as recheckRouteInLedger,
  upsertAutoFindings,
  writeLedger,
} from './semanticQaLedger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..', '..');

export const DEFAULT_SEMANTIC_QA_SAMPLE_SIZE = 30;
export const SEMANTIC_QA_COOLDOWN_DAYS = 28;
export const SEMANTIC_QA_HISTORY_PATH = path.join(rootDir, 'docs', 'semantic-qa', 'history.json');
export const SEMANTIC_QA_DASHBOARD_PATH = path.join(rootDir, 'src', 'data', 'semanticQaDashboard.js');

const SEVERITY_ORDER = { None: 0, Low: 1, Medium: 2, High: 3, Critical: 4 };
const REVIEW_STATUSES = new Set(['New', 'Investigating', 'Fixed', 'Accepted', 'False positive']);
const CORE_FAMILIES = [
  ['chicken', ['chicken']],
  ['turkey', ['turkey']],
  ['beef', ['beef', 'steak', 'sirloin', 'mince']],
  ['pork', ['pork', 'bacon', 'ham']],
  ['tuna', ['tuna']],
  ['salmon', ['salmon']],
  ['cod', ['cod']],
  ['prawn', ['prawn', 'prawns']],
  ['tofu', ['tofu']],
  ['tempeh', ['tempeh']],
  ['egg', ['egg', 'eggs']],
  ['lentil', ['lentil', 'lentils']],
  ['chickpea', ['chickpea', 'chickpeas']],
  ['bean', ['bean', 'beans']],
  ['potato', ['potato', 'potatoes']],
];
const CONDIMENT_PATTERN = /(dressing|sauce|glaze|paste|pesto|honey|syrup|mayo|mustard|tahini|oil|relish|chutney|jam)$/i;
const SAVOURY_FRUIT_PATTERN = /\b(?:banana|blueberr(?:y|ies)|raspberr(?:y|ies)|strawberr(?:y|ies))\b/i;
const SHARED_GENERATION_FILES = new Set([
  'src/utils/recipeQuality.js',
  'src/utils/planBuilder.js',
  'src/utils/cookingQuantities.js',
  'src/utils/legacyPlanBuilder.js',
  'src/data/mealLibrary.js',
  'src/data/mealPlans.js',
  'src/data/planSeeds.js',
]);
const SYSTEMIC_HELPERS = {
  'potato-state-contradiction': 'src/utils/recipeQuality.js preparation-state resolver',
  'named-core-ingredient-missing': 'shared meal selection or meal naming data',
  'method-core-ingredient-missing': 'src/utils/recipeQuality.js method generation',
  'important-ingredient-unused': 'src/utils/recipeQuality.js method generation',
  'duplicate-method-step': 'src/utils/recipeQuality.js method generation',
  'meal-style-method-mismatch': 'src/utils/recipeQuality.js meal-style branch',
  'savoury-fruit-garnish': 'shared meal selection or method generation',
  'implausible-condiment-amount': 'shared portion scaling or meal data',
  'unjustified-dinner-repetition': 'src/utils/planBuilder.js weekly selection',
  'renamed-duplicate-dinners': 'src/utils/planBuilder.js weekly selection',
  'shopping-category-protein': 'src/utils/planBuilder.js shopping classifier',
  'shopping-duplicate-alias': 'src/utils/planBuilder.js shopping aggregation',
  'shopping-core-ingredient-missing': 'src/utils/planBuilder.js shopping aggregation',
};

export function buildPlanInventory() {
  const generated = INDEXABLE_PLAN_SEEDS.map(seed => ({
    route: `/plans/${seed.slug}`,
    planId: seed.slug,
    planType: 'generated',
    title: seed.title,
    supermarket: seed.supermarket || 'any',
    calorieTarget: Number(seed.calories) || null,
    diet: seed.dietType || 'standard',
    goal: seed.goal || 'general',
    modifiers: unique([seed.effort, seed.emphasis, seed.budget].filter(Boolean)),
    seed,
  }));

  const editorial = Object.entries(mealPlansData).map(([slug, plan]) => ({
    route: `/meal-plan/${slug}`,
    planId: slug,
    planType: 'editorial',
    title: plan.h1 || plan.title || slug,
    supermarket: inferSupermarket(`${slug} ${plan.h1 || ''}`),
    calorieTarget: Number(plan.targetCalories) || null,
    diet: inferDiet(`${slug} ${plan.h1 || ''}`),
    goal: inferGoal(`${slug} ${plan.h1 || ''}`),
    modifiers: inferModifiers(`${slug} ${plan.h1 || ''}`),
    legacy: plan,
  }));

  return [...generated, ...editorial];
}

export function selectSemanticQaSample({
  inventory,
  history = emptyHistory(),
  trafficByRoute = {},
  recentActivity = { files: [] },
  now = new Date(),
  sampleSize = DEFAULT_SEMANTIC_QA_SAMPLE_SIZE,
  weekSeed = isoWeekKey(now),
} = {}) {
  const plans = Array.isArray(inventory) ? inventory : buildPlanInventory();
  const targetSize = Math.min(plans.length, Math.max(1, Math.round(sampleSize)));
  const selected = [];
  const selectedRoutes = new Set();
  const facetCounts = createFacetCounts();
  const recentFiles = new Set(recentActivity?.files || []);
  const sharedChange = [...recentFiles].some(file => SHARED_GENERATION_FILES.has(file));
  const annotated = plans.map(plan => annotateCandidate(plan, history, trafficByRoute, now, sharedChange));

  const add = (plan, reason) => {
    if (!plan || selectedRoutes.has(plan.route) || selected.length >= targetSize) return false;
    selectedRoutes.add(plan.route);
    selected.push({ ...plan, sampleReason: reason, weekSeed });
    incrementFacets(facetCounts, plan);
    return true;
  };

  const regressionQuota = Math.min(3, targetSize);
  const regressionCandidates = annotated.filter(plan => plan.regressionPriority);
  for (const plan of pickDiverse(regressionCandidates, regressionQuota, facetCounts, weekSeed, now, {
    allowCooldown: true,
  })) add(plan, 'regression');

  const trafficQuota = Math.min(7, Math.max(0, targetSize - selected.length));
  const trafficCandidates = annotated
    .filter(plan => plan.trafficScore > 0 && !selectedRoutes.has(plan.route))
    .sort((left, right) => right.trafficScore - left.trafficScore || seededRank(left.route, weekSeed) - seededRank(right.route, weekSeed));
  for (const plan of trafficCandidates) {
    if (selected.filter(item => item.sampleReason === 'traffic').length >= trafficQuota) break;
    if (!plan.inCooldown) add(plan, 'traffic');
  }

  const editorialTarget = Math.min(4, targetSize, annotated.filter(plan => plan.planType === 'editorial').length);
  const editorialNeeded = Math.max(0, editorialTarget - selected.filter(plan => plan.planType === 'editorial').length);
  const editorialCandidates = annotated.filter(plan => plan.planType === 'editorial' && !selectedRoutes.has(plan.route));
  for (const plan of pickDiverse(editorialCandidates, editorialNeeded, facetCounts, weekSeed, now)) add(plan, 'coverage');

  const remaining = annotated.filter(plan => !selectedRoutes.has(plan.route));
  for (const plan of pickDiverse(remaining, targetSize - selected.length, facetCounts, weekSeed, now)) add(plan, 'coverage');

  if (selected.length < targetSize) {
    const cooldownFallback = annotated
      .filter(plan => !selectedRoutes.has(plan.route))
      .sort((left, right) => candidatePriority(right, now) - candidatePriority(left, now));
    for (const plan of cooldownFallback) add(plan, 'clean-resample');
  }

  return selected;
}

export async function runWeeklySemanticQa({
  currentSearchRows = [],
  gaLandingPages = [],
  recentActivity = { files: [] },
  now = new Date(),
  sampleSize = DEFAULT_SEMANTIC_QA_SAMPLE_SIZE,
  persist = true,
  useModel = Boolean(process.env.OPENAI_API_KEY),
  model = process.env.SEMANTIC_QA_MODEL || 'gpt-5-mini',
  logger = console,
} = {}) {
  const history = readSemanticQaHistory();
  const inventory = buildPlanInventory();
  const trafficByRoute = buildTrafficMap(currentSearchRows, gaLandingPages);
  const weekSeed = isoWeekKey(now);
  const sample = selectSemanticQaSample({
    inventory,
    history,
    trafficByRoute,
    recentActivity,
    now,
    sampleSize,
    weekSeed,
  });
  const hydrated = sample.map(hydratePlanForQa);
  const localReviews = hydrated.map(plan => assessPlanLocally(plan, now));
  let modelReviews = [];
  let modelStatus = useModel ? 'available' : 'not_configured';
  let modelError = '';
  let modelCalls = 0;
  let modelDiagnostics = { attempted: 0, successful: 0, malformed: 0, unavailable: 0 };

  if (useModel) {
    try {
      const modelResult = await assessPlansWithModel(hydrated, { model, logger });
      modelReviews = modelResult.reviews;
      modelCalls = modelResult.calls;
      modelDiagnostics = modelResult.diagnostics;
      if (modelResult.failures) {
        modelStatus = modelReviews.length
          ? 'partial'
          : modelDiagnostics.malformed
            ? 'malformed'
            : 'unavailable';
        modelError = cleanText(modelResult.errors.join(' | '), 240);
      }
    } catch (error) {
      modelStatus = 'unavailable';
      modelError = cleanText(error.message || error, 240);
      modelDiagnostics = { ...modelDiagnostics, attempted: Math.max(1, modelDiagnostics.attempted), unavailable: Math.max(1, modelDiagnostics.unavailable) };
      logger.warn?.(`Semantic QA model review unavailable: ${modelError}`);
    }
  }

  const reviews = mergeReviews(hydrated, localReviews, modelReviews, history, now);
  const systemicIssues = aggregateSystemicIssues(reviews, history.runs || [], now);
  const run = buildRunRecord({
    reviews,
    systemicIssues,
    now,
    weekSeed,
    model,
    modelStatus,
    modelError,
    modelCalls,
    modelDiagnostics,
  });
  const nextHistory = updateHistory(history, run, reviews, inventory.length);
  const calibration = readSemanticQaCalibration();
  const nextLedger = upsertAutoFindings(readLedger(), reviews, now);
  const dashboard = buildDashboardData({ history: nextHistory, inventory, latestRun: run, calibration, ledger: nextLedger });

  if (persist) {
    writeSemanticQaHistory(nextHistory);
    writeLedger(nextLedger);
    writeSemanticQaDashboard(dashboard);
  }

  return { run, reviews, systemicIssues, dashboard, history: nextHistory, ledger: nextLedger };
}

// Reruns local QA for exactly one route right now, for the admin "Recheck
// plan" action. Never rewrites the plan or the weekly sample — it only
// reports still-detected / no-longer-detected / new / unable-to-determine
// against the findings ledger, matching what "Recheck plan" is specified to
// do (scripts/qa-admin.js is the CLI entry point for this).
export function recheckPlanRoute(route, { ledger = readLedger(), now = new Date(), persist = true } = {}) {
  const assessRoute = targetRoute => {
    const inventory = buildPlanInventory();
    const candidate = inventory.find(item => item.route === targetRoute);
    if (!candidate) throw new Error(`No plan found for route ${targetRoute}`);
    const hydrated = hydratePlanForQa(candidate);
    // assessPlanLocally alone (outside the full weekly-run merge path) does
    // not stamp findingId — compute it the same way mergeReviews does, so
    // this reconciles against the same IDs the ledger was written with.
    return assessPlanLocally(hydrated, now).findings.map(item => ({
      ...item,
      findingId: item.findingId || findingId(candidate.route, item),
    }));
  };

  const { ledger: nextLedger, result } = recheckRouteInLedger(ledger, route, assessRoute, now);
  if (persist) writeLedger(nextLedger);
  return { ledger: nextLedger, result };
}

export function assessPlanLocally(plan, now = new Date()) {
  const findings = [];
  const planContext = `${plan.title} ${plan.goal} ${plan.modifiers.join(' ')}`.toLowerCase();

  for (const day of plan.days) {
    for (const meal of day.meals || []) {
      findings.push(...assessMeal(plan, day, meal));
    }
  }

  findings.push(...assessPlanVariety(plan, planContext));
  findings.push(...assessShoppingList(plan));
  findings.push(...assessWeeklyIngredientAccumulation(plan));
  findings.push(...assessPurchaseFormatOddities(plan));
  findings.push(...assessContainerCountOutlier(plan));
  findings.push(...assessCostConfidence(now));

  return finaliseReview(plan, findings, now, 'local');
}

// A repeated meal is allowed (breakfast repetition is a deliberate product
// choice — see planBuilder.js), but the resulting weekly purchase quantity
// for a single ingredient can still be impractical. This never blocks or
// changes plan generation; it only surfaces the accumulation as evidence for
// human review, per the "weekly ingredient accumulation" QA concept.
const ACCUMULATION_THRESHOLDS = { g: 1200, ml: 1200, item: 30 };

function assessWeeklyIngredientAccumulation(plan) {
  const findings = [];
  const shopping = plan.shoppingList || {};
  for (const [category, items] of Object.entries(shopping)) {
    for (const item of items || []) {
      const match = String(item).match(/^(.+?)\s+(\d+(?:\.\d+)?)(g|ml|kg|l)\b/i)
        || String(item).match(/^(.+?)\s+(\d+(?:\.\d+)?)(?:\s|$)(?!\w)/i);
      if (!match) continue;
      const [, label, amountRaw, unitRaw] = match;
      let amount = Number(amountRaw);
      let unit = (unitRaw || 'item').toLowerCase();
      if (unit === 'kg') { amount *= 1000; unit = 'g'; }
      if (unit === 'l') { amount *= 1000; unit = 'ml'; }
      const threshold = ACCUMULATION_THRESHOLDS[unit];
      if (!threshold || amount < threshold) continue;
      findings.push(finding('Medium', 'weekly ingredient practicality', 'weekly-ingredient-accumulation',
        `${label.trim()} totals ${item.match(/\(about[^)]*\)/i)?.[0] || `${amountRaw}${unitRaw || ''}`} for the week (${category}) — review whether this accumulated quantity is still a practical single shop, especially if driven by a repeated meal.`,
        'Weekly shopping list', 'medium', 'uncertain'));
    }
  }
  return findings;
}

// Catches shopping lines that are mathematically correct but read as
// mechanical optimiser output rather than something a person would write on
// a shopping list — e.g. unusually precise fractional spoon measures. The
// shopping formatter already rounds every spoon amount to a quarter-unit
// (1.25 tsp, 2.75 tbsp), so this only fires on precision beyond that —
// a safety net for a formatting regression, not the normal case.
function assessPurchaseFormatOddities(plan) {
  const findings = [];
  const shopping = plan.shoppingList || {};
  const flat = Object.values(shopping).flat();
  for (const item of flat) {
    const oddPrecision = String(item).match(/\b(\d+\.\d{3,})\s*(tsp|tbsp)\b/i);
    if (oddPrecision) {
      findings.push(finding('Low', 'weekly ingredient practicality', 'purchase-format-oddity',
        `"${item}" uses an over-precise spoon measurement (${oddPrecision[1]} ${oddPrecision[2]}) that reads as optimiser output rather than a shopping instruction.`,
        'Weekly shopping list', 'medium', 'uncertain'));
    }
  }
  return findings;
}

// The container recommendation currently sizes off total weekly meals
// rather than meals stored *simultaneously* (see containerSetup.js) — this
// flags implausibly large recommendations as review evidence without
// changing the algorithm itself, which needs a separate approved change.
function assessContainerCountOutlier(plan) {
  try {
    const setup = buildContainerSetup({ weeklyPlan: plan.days });
    if (setup.containerCount > 15) {
      return [finding('Medium', 'container recommendation', 'container-count-outlier',
        `Recommends ${setup.containerCount} containers, which likely assumes zero reuse across the week rather than concurrently stored meals.`,
        'Container recommendation', 'medium', 'template/systemic')];
    }
  } catch {
    // Container sizing needs a fully hydrated plan; skip quietly if unavailable.
  }
  return [];
}

const COST_CONFIDENCE_MAX_DAYS = 120;

function assessCostConfidence(now) {
  const checkedMs = Date.parse(PRICING_CONTEXT_CHECKED);
  if (!Number.isFinite(checkedMs)) return [];
  const ageDays = (Number(now) - checkedMs) / 86400000;
  if (ageDays <= COST_CONFIDENCE_MAX_DAYS) return [];
  return [finding('Low', 'cost estimate', 'cost-confidence-stale',
    `Displayed budget ranges are keyed to pricing context last checked ${PRICING_CONTEXT_CHECKED}, which is over ${Math.floor(ageDays)} days old.`,
    'Weekly cost estimate', 'medium', 'template/systemic')];
}

function assessMeal(plan, day, meal) {
  const findings = [];
  const name = String(meal.name || 'Unnamed meal');
  const nameText = normalise(name);
  const ingredients = meal.cookingIngredients || meal.ingredients || [];
  const ingredientText = normalise(ingredients.join(' '));
  const methodSteps = Array.isArray(meal.recipe) ? meal.recipe : [];
  const methodText = normalise(methodSteps.join(' '));
  const location = `${day.day || day.name || 'Day'} — ${meal.type || 'Meal'}: ${name}`;
  const mealType = String(meal.type || '').toLowerCase();

  for (const [family, aliases] of CORE_FAMILIES) {
    const named = aliases.some(alias => hasPhrase(nameText, alias));
    const present = aliases.some(alias => hasPhrase(ingredientText, alias));
    const mentioned = aliases.some(alias => hasPhrase(methodText, alias));
    if (named && !present) {
      findings.push(finding('High', 'meal-name coherence', 'named-core-ingredient-missing',
        `${name} names ${family}, but no matching ingredient is listed.`, location, 'high', 'plan-specific'));
    }
    if (mentioned && !present) {
      findings.push(finding('High', 'ingredient-method consistency', 'method-core-ingredient-missing',
        `The method mentions ${family}, but no matching ingredient is listed.`, location, 'high', 'template/systemic'));
    }
    if (named && present && !mentioned && methodSteps.length) {
      findings.push(finding('Medium', 'ingredient-method consistency', 'important-ingredient-unused',
        `${family} is central to the meal name but is not clearly used in the method.`, location, 'medium', 'uncertain'));
    }
  }

  const potatoState = resolvePotatoPreparation(meal);
  if (potatoState.declared && potatoState.state !== 'raw') {
    const contradictions = {
      baked: /\bboil\b|\bmash\b|\broast\b/,
      jacket: /\bboil\b|\bmash\b|\broast\b/,
      mashed: /\bboil\b|\bbake\b|\broast\b/,
      roast: /\bboil\b|\bbake\b|\bmash\b/,
      boiled: /\bbake\b|\broast\b|\bmash\b/,
      prepared: /\bboil\b|\bbake\b|\broast\b|\bmash\b/,
    }[potatoState.state];
    if (contradictions?.test(methodText)) {
      findings.push(finding('High', 'ingredient-method consistency', 'potato-state-contradiction',
        `The method contradicts the declared ${potatoState.state} potato state.`, location, 'high', 'template/systemic'));
    }
  }

  const normalisedSteps = methodSteps.map(step => normalise(step)).filter(Boolean);
  if (new Set(normalisedSteps).size < normalisedSteps.length) {
    findings.push(finding('Medium', 'method quality', 'duplicate-method-step',
      'The method repeats an identical instruction.', location, 'high', 'template/systemic'));
  }

  const styleMismatch = mealStyleMismatch(nameText, methodText, potatoState);
  if (styleMismatch) {
    findings.push(finding('Medium', 'meal-name coherence', 'meal-style-method-mismatch',
      styleMismatch, location, 'medium', 'template/systemic'));
  }

  if (['lunch', 'dinner'].includes(mealType)
    && SAVOURY_FRUIT_PATTERN.test(methodText)
    && !SAVOURY_FRUIT_PATTERN.test(nameText)
    && /(garnish|serve|finish|top)/.test(methodText)) {
    findings.push(finding('High', 'culinary coherence', 'savoury-fruit-garnish',
      'The savoury method uses sweet breakfast fruit as a garnish or finishing ingredient.', location, 'medium', 'uncertain'));
  }

  for (const rawIngredient of meal.calculationIngredients || meal.ingredients || []) {
    const parsed = parseIngredientLine(rawIngredient);
    if (!CONDIMENT_PATTERN.test(parsed.name || '')) continue;
    const grams = Number(parsed.grams);
    if (Number.isFinite(grams) && grams > 200) {
      findings.push(finding('Medium', 'portion/use coherence', 'implausible-condiment-amount',
        `${rawIngredient} is unusually large for a condiment or sauce in one meal.`, location, 'medium', 'uncertain'));
    }
  }

  return findings;
}

function assessPlanVariety(plan, planContext) {
  const findings = [];
  const dinners = plan.days.flatMap(day => (day.meals || [])
    .filter(meal => String(meal.type || '').toLowerCase() === 'dinner')
    .map(meal => ({ day: day.day, name: meal.name, signature: ingredientSignature(meal) })));
  const nameCounts = countBy(dinners, dinner => normalise(dinner.name));
  const intentionalBatch = /(batch|freezer|low effort|minimal effort)/.test(planContext);

  for (const [_name, rows] of nameCounts) {
    if (rows.length > (intentionalBatch ? 4 : 3)) {
      findings.push(finding('Medium', 'plan-level variety', 'unjustified-dinner-repetition',
        `${rows.length} dinners repeat ${rows[0].name}${intentionalBatch ? '; the plan appears batch-oriented but the repetition is still high' : ' without an explicit batch-cooking reason'}.`,
        rows.map(row => row.day).join(', '), 'high', 'template/systemic'));
    }
  }

  const signatureCounts = countBy(dinners, dinner => dinner.signature);
  for (const rows of signatureCounts.values()) {
    const names = unique(rows.map(row => normalise(row.name)));
    if (rows.length >= 3 && names.length >= 2) {
      findings.push(finding('Medium', 'plan-level variety', 'renamed-duplicate-dinners',
        `${rows.length} dinners use effectively the same core ingredients under ${names.length} different names.`,
        rows.map(row => `${row.day}: ${row.name}`).join('; '), 'medium', 'template/systemic'));
    }
  }

  return findings;
}

function assessShoppingList(plan) {
  const findings = [];
  const shopping = plan.shoppingList || {};
  const flatShopping = Object.values(shopping).flat();
  const shoppingText = normalise(flatShopping.join(' '));
  const extras = shopping.extras || [];

  for (const item of extras) {
    const text = normalise(item);
    const protein = CORE_FAMILIES.find(([family, aliases]) => !['potato', 'bean'].includes(family)
      && aliases.some(alias => hasPhrase(text, alias)));
    if (protein) {
      findings.push(finding('Medium', 'shopping-list usability', 'shopping-category-protein',
        `${item} appears in Extras rather than a more intuitive food section.`, 'Weekly shopping list', 'high', 'template/systemic'));
    }
  }

  const shoppingAliases = new Map();
  for (const [category, items] of Object.entries(shopping)) {
    for (const item of items || []) {
      const key = shoppingAliasKey(item);
      if (!key) continue;
      const rows = shoppingAliases.get(key) || [];
      rows.push({ category, item });
      shoppingAliases.set(key, rows);
    }
  }
  for (const rows of shoppingAliases.values()) {
    if (rows.length < 2) continue;
    findings.push(finding('Medium', 'shopping-list usability', 'shopping-duplicate-alias',
      `Potential duplicate purchase entries: ${rows.map(row => `${row.item} (${row.category})`).join('; ')}.`,
      'Weekly shopping list', 'medium', 'uncertain'));
  }

  const ingredientText = normalise(plan.days.flatMap(day => day.meals || [])
    .flatMap(meal => meal.calculationIngredients || meal.ingredients || []).join(' '));
  for (const [family, aliases] of CORE_FAMILIES) {
    const required = aliases.some(alias => hasPhrase(ingredientText, alias));
    const listed = aliases.some(alias => hasPhrase(shoppingText, alias));
    if (required && !listed) {
      findings.push(finding('Critical', 'shopping-list usability', 'shopping-core-ingredient-missing',
        `Meals require ${family}, but no matching item appears in the consolidated shopping list.`,
        'Weekly shopping list', 'high', 'template/systemic'));
    }
  }

  return findings;
}

function mealStyleMismatch(name, method, potatoState) {
  if (/\bjacket potato\b/.test(name)) {
    const prepared = potatoState.declared && ['baked', 'jacket'].includes(potatoState.state);
    if (!prepared && !/(bake|oven)/.test(method)) return 'The meal is called a jacket potato, but the method never bakes it.';
    if (!/(split|open|fill|filling|top)/.test(method)) return 'The jacket-potato method does not explain how to open and fill the potato.';
  }
  if (/\bstir[ -]?fry\b/.test(name) && !/(stir[ -]?fry|(?:pan|wok).{0,80}\bstir(?:ring)?\b|\bstir(?:ring)?\b.{0,80}(?:pan|wok))/.test(method)) {
    return 'The meal is called a stir-fry, but the method does not use a stir-fry step.';
  }
  if (/\bsalad\b/.test(name) && !/(arrange|toss|combine|bowl|salad)/.test(method)) return 'The meal is called a salad, but the method does not assemble one.';
  if (/\bcurry\b/.test(name) && !/(simmer|curry|paste|sauce|pan)/.test(method)) return 'The meal is called a curry, but the method does not build or simmer a curry.';
  return '';
}

export function hydratePlanForQa(candidate) {
  let days;
  let shoppingList;
  if (candidate.planType === 'generated') {
    const built = buildPlan(candidate.seed);
    days = built.plan;
    shoppingList = built.shoppingList || buildShoppingList(days);
  } else {
    days = buildCanonicalLegacyPlan(candidate.legacy.plan, candidate.legacy.targetCalories);
    shoppingList = buildShoppingList(days);
  }

  const compact = {
    route: candidate.route,
    planId: candidate.planId,
    planType: candidate.planType,
    title: candidate.title,
    supermarket: candidate.supermarket,
    calorieTarget: candidate.calorieTarget,
    diet: candidate.diet,
    goal: candidate.goal,
    modifiers: candidate.modifiers,
    sampleReason: candidate.sampleReason,
    days,
    shoppingList,
  };
  return { ...compact, sourceHash: sha256(JSON.stringify({ days, shoppingList })) };
}

async function assessPlansWithModel(plans, { model, logger, batchSize = 3 } = {}) {
  const reviews = [];
  let calls = 0;
  let failures = 0;
  const errors = [];
  const diagnostics = { attempted: 0, successful: 0, malformed: 0, unavailable: 0 };
  for (let index = 0; index < plans.length; index += batchSize) {
    const batch = plans.slice(index, index + batchSize);
    calls += 1;
    diagnostics.attempted += 1;
    try {
      const response = await requestModelReview(batch, { model });
      reviews.push(...response.reviews);
      diagnostics.successful += 1;
      logger.info?.(`Semantic QA model batch ${calls}: ${batch.length} plan(s) reviewed.`);
    } catch (error) {
      failures += 1;
      if (error?.code === 'MALFORMED_MODEL_OUTPUT') diagnostics.malformed += 1;
      else diagnostics.unavailable += 1;
      const message = cleanText(error.message || error, 180);
      errors.push(`batch ${calls}: ${message}`);
      logger.warn?.(`Semantic QA model batch ${calls} unavailable: ${message}`);
    }
  }
  return { reviews, calls, failures, errors, diagnostics };
}

async function requestModelReview(plans, { model }) {
  const body = {
    model,
    store: false,
    input: [
      {
        role: 'system',
        content: [{ type: 'input_text', text: MODEL_INSTRUCTIONS }],
      },
      {
        role: 'user',
        content: [{ type: 'input_text', text: JSON.stringify(plans.map(modelPlanPayload)) }],
      },
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'meal_plan_semantic_qa',
        strict: true,
        schema: modelReviewSchema(),
      },
    },
    max_output_tokens: 6000,
  };

  let lastError;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(90_000),
      });
      if (!response.ok) {
        const errorText = cleanText(await response.text(), 400);
        const retryable = response.status === 429 || response.status >= 500;
        if (retryable && attempt < 1) {
          await delay(1000 * (2 ** attempt));
          continue;
        }
        throw new Error(`OpenAI Responses API returned ${response.status}: ${errorText}`);
      }
      const payload = await response.json();
      if (payload.status === 'incomplete') {
        throw new Error(`OpenAI response incomplete: ${payload.incomplete_details?.reason || 'unknown reason'}`);
      }
      const outputText = extractOutputText(payload);
      return parseModelReviewOutput(outputText);
    } catch (error) {
      lastError = error;
      if (attempt < 1 && (error?.code === 'MALFORMED_MODEL_OUTPUT' || /fetch|timeout|aborted|incomplete|429|5\d\d/i.test(String(error.message || error)))) {
        await delay(1000 * (2 ** attempt));
        continue;
      }
      break;
    }
  }
  throw lastError || new Error('Semantic QA model review failed.');
}

export function parseModelReviewOutput(value) {
  const text = String(value || '').trim();
  const fenced = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  const candidate = fenced ? fenced[1].trim() : text;
  let parsed;
  try {
    parsed = JSON.parse(candidate);
  } catch (error) {
    throw malformedModelOutput(`Malformed JSON: ${error.message || error}`);
  }
  validateModelReviewPayload(parsed);
  return parsed;
}

function validateModelReviewPayload(payload) {
  const severities = new Set(['Critical', 'High', 'Medium', 'Low']);
  const categories = new Set(['meal-name coherence', 'ingredient-method consistency', 'culinary coherence', 'method quality', 'portion/use coherence', 'plan-level variety', 'shopping-list usability', 'user usefulness']);
  const confidences = new Set(['high', 'medium', 'low']);
  const scopes = new Set(['plan-specific', 'template/systemic', 'uncertain']);
  if (!payload || typeof payload !== 'object' || Array.isArray(payload) || !Array.isArray(payload.reviews)
    || Object.keys(payload).some(key => key !== 'reviews')) {
    throw malformedModelOutput('Structured output must be an object containing only a reviews array.');
  }
  for (const review of payload.reviews) {
    if (!review || typeof review !== 'object' || Array.isArray(review)
      || typeof review.planId !== 'string' || !Array.isArray(review.findings)
      || Object.keys(review).some(key => !['planId', 'findings'].includes(key))) {
      throw malformedModelOutput('Each review must contain only planId and findings.');
    }
    for (const finding of review.findings) {
      const keys = ['severity', 'category', 'explanation', 'affectedLocation', 'confidence', 'scope', 'patternKey'];
      if (!finding || typeof finding !== 'object' || Array.isArray(finding)
        || Object.keys(finding).some(key => !keys.includes(key))
        || keys.some(key => typeof finding[key] !== 'string')
        || !severities.has(finding.severity)
        || !categories.has(finding.category)
        || !confidences.has(finding.confidence)
        || !scopes.has(finding.scope)) {
        throw malformedModelOutput('A model finding did not match the strict semantic-QA schema.');
      }
    }
  }
}

function malformedModelOutput(message) {
  const error = new Error(message);
  error.code = 'MALFORMED_MODEL_OUTPUT';
  return error;
}

const MODEL_INSTRUCTIONS = `You are a cautious UK meal-plan quality reviewer. Review each complete seven-day plan for human usability, not nutrition arithmetic. Flag only issues likely to confuse or disappoint a normal cook: meal-name mismatch, missing or invented ingredients, contradictory preparation, obviously incoherent combinations, bad sequencing, implausible condiment use, accidental repetition, or unusable shopping-list semantics. Do not flag merely unconventional but plausible food. Do not rewrite or propose replacement copy. Return concise evidence-only findings. Use Critical only when the plan cannot reasonably produce the stated meal, has a serious dietary conflict, or misses essential shopping items. High materially damages trust. Medium is noticeable but usable. Low is polish. patternKey must be a short reusable kebab-case cause. scope must be plan-specific, template/systemic, or uncertain.`;

function modelReviewSchema() {
  return {
    type: 'object',
    additionalProperties: false,
    required: ['reviews'],
    properties: {
      reviews: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['planId', 'findings'],
          properties: {
            planId: { type: 'string' },
            findings: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                required: ['severity', 'category', 'explanation', 'affectedLocation', 'confidence', 'scope', 'patternKey'],
                properties: {
                  severity: { type: 'string', enum: ['Critical', 'High', 'Medium', 'Low'] },
                  category: { type: 'string', enum: ['meal-name coherence', 'ingredient-method consistency', 'culinary coherence', 'method quality', 'portion/use coherence', 'plan-level variety', 'shopping-list usability', 'user usefulness'] },
                  explanation: { type: 'string' },
                  affectedLocation: { type: 'string' },
                  confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
                  scope: { type: 'string', enum: ['plan-specific', 'template/systemic', 'uncertain'] },
                  patternKey: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  };
}

function modelPlanPayload(plan) {
  return {
    planId: plan.planId,
    route: plan.route,
    title: plan.title,
    planType: plan.planType,
    supermarket: plan.supermarket,
    calorieTarget: plan.calorieTarget,
    diet: plan.diet,
    goal: plan.goal,
    modifiers: plan.modifiers,
    days: plan.days.map(day => ({
      day: day.day,
      meals: (day.meals || []).map(meal => ({
        type: meal.type,
        name: meal.name,
        ingredients: (meal.cookingIngredients || meal.ingredients || []).slice(0, 12),
        method: (meal.recipe || []).slice(0, 6),
      })),
    })),
    shoppingList: Object.fromEntries(Object.entries(plan.shoppingList || {}).map(([category, items]) => [category, (items || []).slice(0, 80)])),
  };
}

function mergeReviews(plans, localReviews, modelReviews, history, now) {
  const localById = new Map(localReviews.map(review => [review.planId, review]));
  const modelById = new Map((modelReviews || []).map(review => [review.planId, review]));
  return plans.map(plan => {
    const local = localById.get(plan.planId) || { findings: [] };
    const model = modelById.get(plan.planId) || { findings: [] };
    const findings = dedupeFindings([
      ...local.findings,
      ...model.findings.map(item => normaliseFinding(item, 'model')),
    ]).map(item => ({
      ...item,
      findingId: findingId(plan.route, item),
      reviewStatus: normaliseReviewStatus(history.reviewStatuses?.[findingId(plan.route, item)]),
    }));
    return finaliseReview(plan, findings, now, modelReviews.length ? 'hybrid' : 'local');
  });
}

function finaliseReview(plan, findings, now, assessmentSource) {
  const cleanFindings = dedupeFindings(findings.map(item => ({
    ...normaliseFinding(item, item.source || assessmentSource),
    findingId: item.findingId || '',
    reviewStatus: normaliseReviewStatus(item.reviewStatus),
  })));
  const highestSeverity = cleanFindings.reduce((highest, item) => (
    SEVERITY_ORDER[item.severity] > SEVERITY_ORDER[highest] ? item.severity : highest
  ), 'None');
  const status = ['Critical', 'High'].includes(highestSeverity)
    ? 'Review required'
    : ['Medium', 'Low'].includes(highestSeverity)
      ? 'Review suggested'
      : 'Pass';
  return {
    route: plan.route,
    planId: plan.planId,
    planType: plan.planType,
    supermarket: plan.supermarket,
    calorieTarget: plan.calorieTarget,
    diet: plan.diet,
    goal: plan.goal,
    modifiers: plan.modifiers,
    sampleReason: plan.sampleReason,
    semanticQaDate: new Date(now).toISOString(),
    overallStatus: status,
    highestSeverity,
    findingCount: cleanFindings.length,
    findings: cleanFindings,
    confidence: reviewConfidence(cleanFindings),
    sourceHash: plan.sourceHash,
    assessmentSource,
  };
}

export function aggregateSystemicIssues(reviews, priorRuns = [], now = new Date()) {
  const grouped = new Map();
  for (const review of reviews || []) {
    for (const item of review.findings || []) {
      const group = grouped.get(item.patternKey) || { findings: [], routes: new Set() };
      group.findings.push(item);
      group.routes.add(review.route);
      grouped.set(item.patternKey, group);
    }
  }

  const priorFirstDetected = new Map();
  for (const run of priorRuns || []) {
    for (const issue of run.systemicIssues || []) {
      if (!priorFirstDetected.has(issue.patternKey)) priorFirstDetected.set(issue.patternKey, issue.firstDetected || run.runAt);
    }
  }

  return [...grouped.entries()]
    .filter(([, group]) => group.routes.size >= 2)
    .map(([patternKey, group]) => {
      const highestSeverity = group.findings.reduce((highest, item) => (
        SEVERITY_ORDER[item.severity] > SEVERITY_ORDER[highest] ? item.severity : highest
      ), 'Low');
      return {
        patternKey,
        issue: group.findings[0].explanation,
        affectedSampledPlans: group.routes.size,
        routes: [...group.routes].slice(0, 8),
        severity: highestSeverity,
        likelySharedComponent: SYSTEMIC_HELPERS[patternKey] || 'shared plan generation or source data',
        firstDetected: priorFirstDetected.get(patternKey) || new Date(now).toISOString(),
        mostRecentDetection: new Date(now).toISOString(),
        note: 'Potential systemic issue — investigate shared generation logic.',
      };
    })
    .sort((left, right) => SEVERITY_ORDER[right.severity] - SEVERITY_ORDER[left.severity]
      || right.affectedSampledPlans - left.affectedSampledPlans);
}

function buildRunRecord({ reviews, systemicIssues, now, weekSeed, model, modelStatus, modelError, modelCalls, modelDiagnostics }) {
  const severity = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  for (const review of reviews) {
    for (const finding of review.findings) severity[finding.severity] += 1;
  }
  const passed = reviews.filter(review => review.overallStatus === 'Pass').length;
  const flagged = reviews.length - passed;
  const manualReviewRoutes = reviews
    .filter(review => review.overallStatus !== 'Pass')
    .sort((left, right) => SEVERITY_ORDER[right.highestSeverity] - SEVERITY_ORDER[left.highestSeverity])
    .map(review => review.route);
  return {
    runId: `${weekSeed}-${new Date(now).toISOString().slice(0, 10)}`,
    runAt: new Date(now).toISOString(),
    weekSeed,
    sampleSize: reviews.length,
    passed,
    flagged,
    passRate: reviews.length ? round((passed / reviews.length) * 100, 1) : 0,
    plansWithoutFlagsRate: reviews.length ? round((passed / reviews.length) * 100, 1) : 0,
    severity,
    systemicIssues,
    systemicIssueCount: systemicIssues.length,
    manualReviewRoutes,
    reviews,
    model: {
      status: modelStatus,
      model: modelStatus === 'not_configured' ? '' : model,
      calls: modelCalls,
      attempted: modelDiagnostics?.attempted || 0,
      successful: modelDiagnostics?.successful || 0,
      malformed: modelDiagnostics?.malformed || 0,
      unavailable: modelDiagnostics?.unavailable || 0,
      error: modelError,
      fallback: modelStatus === 'available'
        ? 'Local checks and model review completed.'
        : modelStatus === 'partial'
          ? 'Local checks completed; model enrichment was partial and failed batches were skipped.'
          : modelStatus === 'malformed'
            ? 'Local checks completed; malformed model output was rejected after one retry.'
            : 'Local semantic checks completed; model enrichment did not run.',
    },
  };
}

function updateHistory(history, run, reviews, totalPlans) {
  const next = structuredClone(history || emptyHistory());
  next.version = 1;
  next.updatedAt = run.runAt;
  next.totalPlansAtLastRun = totalPlans;
  next.reviewStatuses = next.reviewStatuses || {};
  next.perPlan = next.perPlan || {};
  for (const review of reviews) {
    const previous = next.perPlan[review.route] || {};
    next.perPlan[review.route] = {
      planId: review.planId,
      planType: review.planType,
      lastQaAt: review.semanticQaDate,
      timesSampled: Number(previous.timesSampled || 0) + 1,
      lastStatus: review.overallStatus,
      highestSeverity: review.highestSeverity,
      lastSourceHash: review.sourceHash,
    };
    for (const item of review.findings) {
      if (!next.reviewStatuses[item.findingId]) next.reviewStatuses[item.findingId] = 'New';
    }
  }
  const plansEverSampled = Object.keys(next.perPlan).length;
  const compactRun = {
    ...compactRunForHistory(run),
    coverageAfterRun: {
      plansEverSampled,
      totalPublishedPlans: totalPlans,
      percentageEverSampled: totalPlans ? round((plansEverSampled / totalPlans) * 100, 1) : 0,
    },
  };
  next.runs = [...(next.runs || []), compactRun].slice(-52);
  return next;
}

export function buildDashboardData({ history, inventory, latestRun, calibration = readSemanticQaCalibration(), ledger = readLedger() }) {
  const plans = inventory || buildPlanInventory();
  const perPlan = history?.perPlan || {};
  const everSampled = Object.keys(perPlan).length;
  const now = latestRun?.runAt ? new Date(latestRun.runAt) : new Date();
  const sampledLast30Days = Object.values(perPlan).filter(item => daysBetween(item.lastQaAt, now) <= 30).length;
  const runs = (history?.runs || []).slice(-12);
  const latestReviews = latestRun?.reviews || [];
  const recentFindings = latestReviews
    .flatMap(review => review.findings.map(item => ({
      id: item.findingId,
      severity: item.severity,
      route: review.route,
      supermarket: review.supermarket,
      calorieTarget: review.calorieTarget,
      category: item.category,
      patternKey: item.patternKey,
      issue: item.explanation,
      scope: item.scope,
      reviewStatus: ledger?.entries?.[item.findingId]?.status || item.reviewStatus || history?.reviewStatuses?.[item.findingId] || 'New',
      humanAssessment: ledger?.entries?.[item.findingId]?.humanAssessment || 'Uncertain',
      affectedLocation: item.affectedLocation,
    })))
    .sort((left, right) => SEVERITY_ORDER[right.severity] - SEVERITY_ORDER[left.severity])
    .slice(0, 80);

  return {
    generatedAt: new Date(now).toISOString(),
    available: Boolean(latestRun),
    latest: latestRun ? {
      runAt: latestRun.runAt,
      sampleSize: latestRun.sampleSize,
      passed: latestRun.passed,
      flagged: latestRun.flagged,
      passRate: latestRun.passRate,
      plansWithoutFlagsRate: latestRun.plansWithoutFlagsRate ?? latestRun.passRate,
      severity: latestRun.severity,
      systemicIssueCount: latestRun.systemicIssueCount,
      model: latestRun.model,
    } : null,
    coverage: {
      totalPublishedPlans: plans.length,
      plansEverSampled: everSampled,
      percentageEverSampled: plans.length ? round((everSampled / plans.length) * 100, 1) : 0,
      plansSampledLast30Days: sampledLast30Days,
      plansNeverSampled: Math.max(0, plans.length - everSampled),
    },
    trend: runs.map(run => ({
      runAt: run.runAt,
      sampleSize: run.sampleSize,
      passRate: run.passRate,
      plansWithoutFlagsRate: run.plansWithoutFlagsRate ?? run.passRate,
      criticalHigh: Number(run.severity?.Critical || 0) + Number(run.severity?.High || 0),
      medium: Number(run.severity?.Medium || 0),
      cumulativeCoverage: run.coverageAfterRun?.plansEverSampled || null,
    })),
    breakdowns: buildBreakdowns(latestReviews),
    recentFindings,
    findingsLedger: ledgerRows(ledger).slice(0, 200).map(entry => ({
      id: entry.id,
      source: entry.source,
      route: entry.route,
      category: entry.category,
      severity: entry.severity,
      evidence: entry.evidence,
      affectedLocation: entry.affectedLocation,
      firstDetectedAt: entry.firstDetectedAt,
      lastDetectedAt: entry.lastDetectedAt,
      lastRecheckAt: entry.lastRecheckAt,
      lastRecheckResult: entry.lastRecheckResult,
      resolvedAt: entry.resolvedAt,
      status: entry.status,
      humanAssessment: entry.humanAssessment,
      humanNote: entry.humanNote,
      potentiallySystemic: entry.potentiallySystemic || false,
    })),
    systemicIssues: latestRun?.systemicIssues || [],
    calibration: {
      ...buildCalibrationMetrics(calibration),
      items: (calibration.items || []).map(item => ({
        id: item.id,
        route: item.route,
        category: item.category,
        patternKey: item.patternKey,
        detectorSeverity: item.detectorSeverity,
        evidence: item.evidence,
        origin: item.origin,
        reviewTheme: item.reviewTheme,
        outcome: item.humanLabel?.outcome || 'Unreviewed',
        humanSeverity: item.humanLabel?.severity || 'Unreviewed',
      })),
    },
  };
}

function compactRunForHistory(run) {
  return {
    runId: run.runId,
    runAt: run.runAt,
    weekSeed: run.weekSeed,
    sampleSize: run.sampleSize,
    passed: run.passed,
    flagged: run.flagged,
    passRate: run.passRate,
    plansWithoutFlagsRate: run.plansWithoutFlagsRate ?? run.passRate,
    severity: run.severity,
    systemicIssueCount: run.systemicIssueCount,
    systemicIssues: run.systemicIssues,
    manualReviewRoutes: run.manualReviewRoutes,
    sampledRoutes: run.reviews.map(review => review.route),
    model: run.model,
  };
}

function buildBreakdowns(reviews) {
  const facets = ['supermarket', 'diet', 'goal', 'planType'];
  return Object.fromEntries(facets.map(facet => {
    const grouped = countBy(reviews || [], review => review[facet] || 'unknown');
    const rows = [...grouped.entries()].map(([name, items]) => ({
      name,
      sampled: items.length,
      flagged: items.filter(item => item.overallStatus !== 'Pass').length,
      reviewRate: items.length ? round((items.filter(item => item.overallStatus !== 'Pass').length / items.length) * 100, 1) : 0,
    })).sort((left, right) => right.flagged - left.flagged || right.sampled - left.sampled);
    return [facet, rows];
  }));
}

export function readSemanticQaHistory(filePath = SEMANTIC_QA_HISTORY_PATH) {
  if (!fs.existsSync(filePath)) return emptyHistory();
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return {
      ...emptyHistory(),
      ...parsed,
      perPlan: parsed.perPlan || {},
      runs: Array.isArray(parsed.runs) ? parsed.runs : [],
      reviewStatuses: parsed.reviewStatuses || {},
    };
  } catch {
    return emptyHistory();
  }
}

export function writeSemanticQaHistory(history, filePath = SEMANTIC_QA_HISTORY_PATH) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(history, null, 2)}\n`, 'utf8');
}

export function writeSemanticQaDashboard(dashboard, filePath = SEMANTIC_QA_DASHBOARD_PATH) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const body = `// Generated by the weekly semantic plan QA process. Internal admin data only.\n` +
    `// Do not import this module into public page components.\n\n` +
    `export const SEMANTIC_QA_DASHBOARD = ${JSON.stringify(dashboard, null, 2)};\n`;
  fs.writeFileSync(filePath, body, 'utf8');
}

export function normaliseSeverity(value) {
  const normalised = String(value || '').trim().toLowerCase();
  return ({ critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' })[normalised] || 'Low';
}

function normaliseFinding(item, source) {
  const patternKey = normalisePatternKey(item.patternKey || item.category || 'semantic-review');
  return {
    severity: normaliseSeverity(item.severity),
    category: cleanText(item.category || 'user usefulness', 80),
    explanation: cleanText(item.explanation || 'Manual review suggested.', 280),
    affectedLocation: cleanText(item.affectedLocation || 'Plan', 180),
    confidence: ['high', 'medium', 'low'].includes(item.confidence) ? item.confidence : 'medium',
    scope: ['plan-specific', 'template/systemic', 'uncertain'].includes(item.scope) ? item.scope : 'uncertain',
    patternKey,
    source: source === 'model' ? 'model' : 'local',
    reviewStatus: normaliseReviewStatus(item.reviewStatus),
  };
}

function finding(severity, category, patternKey, explanation, affectedLocation, confidence, scope) {
  return { severity, category, patternKey, explanation, affectedLocation, confidence, scope, source: 'local' };
}

function findingId(route, item) {
  return `qa_${sha256(`${route}|${item.patternKey}|${item.affectedLocation}`).slice(0, 16)}`;
}

function dedupeFindings(findings) {
  const seen = new Set();
  return findings.filter(item => {
    const key = `${item.patternKey}|${normalise(item.affectedLocation)}|${normalise(item.explanation)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function annotateCandidate(plan, history, trafficByRoute, now, sharedChange) {
  const previous = history?.perPlan?.[plan.route] || null;
  const daysSinceReview = previous?.lastQaAt ? daysBetween(previous.lastQaAt, now) : Number.POSITIVE_INFINITY;
  const traffic = trafficByRoute[plan.route] || { impressions: 0, clicks: 0, pageViews: 0 };
  return {
    ...plan,
    previousReview: previous,
    neverSampled: !previous,
    daysSinceReview,
    inCooldown: Number.isFinite(daysSinceReview) && daysSinceReview < SEMANTIC_QA_COOLDOWN_DAYS,
    trafficScore: Number(traffic.impressions || 0) + (Number(traffic.clicks || 0) * 30) + (Number(traffic.pageViews || 0) * 2),
    regressionPriority: sharedChange && (plan.planType === 'generated' || plan.planType === 'editorial'),
  };
}

function pickDiverse(candidates, limit, facetCounts, seed, now, { allowCooldown = false } = {}) {
  const pool = [...candidates].filter(plan => allowCooldown || !plan.inCooldown);
  const picked = [];
  const workingFacetCounts = cloneFacetCounts(facetCounts);
  while (pool.length && picked.length < limit) {
    pool.sort((left, right) => {
      const rightScore = candidatePriority(right, now) + diversityScore(right, workingFacetCounts) + seededJitter(right.route, seed);
      const leftScore = candidatePriority(left, now) + diversityScore(left, workingFacetCounts) + seededJitter(left.route, seed);
      return rightScore - leftScore;
    });
    const next = pool.shift();
    picked.push(next);
    incrementFacets(workingFacetCounts, next);
  }
  return picked;
}

function candidatePriority(plan) {
  if (plan.regressionPriority && plan.previousReview) return 25_000 + Math.min(5_000, Number(plan.trafficScore || 0));
  if (plan.neverSampled) return 10_000;
  const age = Number.isFinite(plan.daysSinceReview) ? Math.min(365, plan.daysSinceReview) : 365;
  const cleanRecheck = plan.previousReview?.lastStatus === 'Pass' && age >= 84 ? 800 : 0;
  return (age * 10) + cleanRecheck + (plan.trafficScore ? 100 : 300);
}

function diversityScore(plan, counts) {
  return [
    ['planType', plan.planType],
    ['supermarket', plan.supermarket],
    ['calorieBand', calorieBand(plan.calorieTarget)],
    ['diet', plan.diet],
    ['goal', plan.goal],
  ].reduce((score, [facet, value]) => score + (240 / (1 + Number(counts[facet].get(value) || 0))), 0);
}

function createFacetCounts() {
  return {
    planType: new Map(),
    supermarket: new Map(),
    calorieBand: new Map(),
    diet: new Map(),
    goal: new Map(),
  };
}

function cloneFacetCounts(counts) {
  return Object.fromEntries(Object.entries(counts).map(([key, values]) => [key, new Map(values)]));
}

function incrementFacets(counts, plan) {
  increment(counts.planType, plan.planType);
  increment(counts.supermarket, plan.supermarket);
  increment(counts.calorieBand, calorieBand(plan.calorieTarget));
  increment(counts.diet, plan.diet);
  increment(counts.goal, plan.goal);
}

function buildTrafficMap(searchRows, gaRows) {
  const map = {};
  for (const row of searchRows || []) {
    const route = row.page || row.path;
    if (!route) continue;
    const current = map[route] || { impressions: 0, clicks: 0, pageViews: 0 };
    current.impressions += Number(row.impressions || 0);
    current.clicks += Number(row.clicks || 0);
    map[route] = current;
  }
  for (const row of gaRows || []) {
    const route = row.path || row.page;
    if (!route) continue;
    const current = map[route] || { impressions: 0, clicks: 0, pageViews: 0 };
    current.pageViews += Number(row.pageViews || 0);
    map[route] = current;
  }
  return map;
}

function ingredientSignature(meal) {
  return (meal.calculationIngredients || meal.ingredients || [])
    .map(item => normalise(String(item).replace(/\b\d+(?:\.\d+)?\s*(?:kg|g|ml|l|tbsp|tsp|slices?|packs?|items?)?\b/gi, '')))
    .filter(Boolean)
    .sort()
    .slice(0, 5)
    .join('|');
}

function shoppingAliasKey(value) {
  return normalise(value)
    .replace(/\b(?:at least|about|used|standard|small|medium|large|tinned|canned|fresh|frozen)\b/g, ' ')
    .replace(/\b\d+(?:\.\d+)?\b/g, ' ')
    .replace(/\b(?:kg|g|ml|l|tbsp|tsp|tin|tins|pack|packs|slice|slices)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function inferSupermarket(value) {
  const text = normalise(value);
  return ['aldi', 'lidl', 'tesco', 'asda', 'sainsburys', 'morrisons', 'iceland', 'waitrose']
    .find(name => text.includes(name)) || 'any';
}

function inferDiet(value) {
  const text = normalise(value);
  if (text.includes('vegan')) return 'vegan';
  if (text.includes('vegetarian')) return 'vegetarian';
  if (text.includes('pescatarian')) return 'pescatarian';
  return 'standard';
}

function inferGoal(value) {
  const text = normalise(value);
  if (text.includes('muscle') || text.includes('bodybuilding')) return 'muscle-gain';
  if (text.includes('high protein') || text.includes('gym')) return 'high-protein-low-cal';
  if (text.includes('budget') || text.includes('cheap') || text.includes('student')) return 'budget';
  if (text.includes('low effort') || text.includes('busy')) return 'low-effort';
  if (text.includes('low calorie') || text.includes('fat loss') || text.includes('weight loss')) return 'weight-loss';
  return 'general';
}

function inferModifiers(value) {
  const text = normalise(value);
  const modifiers = [];
  if (text.includes('budget') || text.includes('cheap')) modifiers.push('budget');
  if (text.includes('low effort') || text.includes('busy')) modifiers.push('low-effort');
  if (text.includes('high protein') || text.includes('gym') || text.includes('bodybuilding')) modifiers.push('high-protein');
  return modifiers;
}

function buildBreakdownKey(value) {
  return String(value || 'unknown').trim() || 'unknown';
}

function countBy(values, keyFn) {
  const map = new Map();
  for (const value of values || []) {
    const key = buildBreakdownKey(keyFn(value));
    const rows = map.get(key) || [];
    rows.push(value);
    map.set(key, rows);
  }
  return map;
}

function calorieBand(value) {
  const calories = Number(value) || 0;
  if (calories < 1500) return 'under-1500';
  if (calories === 1500) return '1500';
  if (calories <= 1800) return '1501-1800';
  if (calories <= 2000) return '1801-2000';
  if (calories <= 2500) return '2001-2500';
  return 'over-2500';
}

function isoWeekKey(value) {
  const date = new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

function daysBetween(value, now) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return Number.POSITIVE_INFINITY;
  return Math.max(0, (new Date(now).getTime() - date.getTime()) / 86400000);
}

function seededRank(value, seed) {
  return parseInt(sha256(`${seed}|${value}`).slice(0, 8), 16);
}

function seededJitter(value, seed) {
  return seededRank(value, seed) % 100;
}

function extractOutputText(payload) {
  for (const item of payload.output || []) {
    for (const content of item.content || []) {
      if (content.type === 'output_text' && content.text) return content.text;
    }
  }
  throw new Error('OpenAI response did not contain structured output text.');
}

function normaliseReviewStatus(value) {
  const status = String(value || 'New');
  return REVIEW_STATUSES.has(status) ? status : 'New';
}

function normalisePatternKey(value) {
  return String(value || 'semantic-review')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'semantic-review';
}

function normalise(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasPhrase(text, phrase) {
  return (` ${text} `).includes(` ${normalise(phrase)} `);
}

function reviewConfidence(findings) {
  if (!findings.length) return 'high';
  if (findings.some(item => item.confidence === 'high')) return 'high';
  if (findings.some(item => item.confidence === 'medium')) return 'medium';
  return 'low';
}

function emptyHistory() {
  return { version: 1, updatedAt: '', totalPlansAtLastRun: 0, perPlan: {}, runs: [], reviewStatuses: {} };
}

function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function cleanText(value, limit) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, limit);
}

function increment(map, key) {
  map.set(key, Number(map.get(key) || 0) + 1);
}

function unique(values) {
  return [...new Set(values)];
}

function round(value, decimals = 1) {
  const factor = 10 ** decimals;
  return Math.round(Number(value || 0) * factor) / factor;
}

function delay(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}
