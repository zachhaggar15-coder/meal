import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { buildAnalyticsStats } from '../api/admin-stats.js';
import { sanitisePlanEmailSource } from '../api/email-plan.js';
import { blogPostsData } from '../src/data/blogPosts.js';
import { MEALS } from '../src/data/mealLibrary.js';
import { mealPlansData } from '../src/data/mealPlans.js';
import { PLAN_COUNT as LIGHTWEIGHT_PLAN_COUNT } from '../src/data/planCatalogMeta.js';
import { INDEXABLE_PLAN_SEEDS } from '../src/data/planSeeds.js';
import { canonicaliseLegacyMeal } from '../src/utils/legacyPlanBuilder.js';
import { analyticsSearchIntent, sanitiseAnalyticsPath, sanitiseAnalyticsUrl } from '../src/utils/analyticsSanitisation.js';
import { getEditorialSources, getPriceClaimMeta, getPriceSources, hasSpecificPriceClaims } from '../src/utils/editorialSafeguards.js';
import { impliedMacroCalories, macroMatchStatus, validateMacroCalorieConsistency } from '../src/utils/macroTargets.js';
import { buildPracticalRecipeSteps } from '../src/utils/recipeQuality.js';
import { checkCoreIngredientOmission, checkFlavourCompleteness } from './lib/recipeInvariants.js';

test('quiz answer payloads never enter analytics paths, URLs or intent', () => {
  const encoded = 'eyJnb2FsIjoid2VpZ2h0LWxvc3MiLCJjYWxvcmllcyI6IjE1MDAifQ';
  const raw = `https://www.mealprep.org.uk/quiz/results?q=${encoded}&utm_source=email`;
  assert.equal(sanitiseAnalyticsPath(raw), '/quiz/results?utm_source=email');
  assert.equal(sanitiseAnalyticsUrl(raw), 'https://www.mealprep.org.uk/quiz/results?utm_source=email');
  assert.equal(analyticsSearchIntent(raw), '');
});

test('email-plan source labels can never contain quiz answers or query strings', () => {
  assert.equal(sanitisePlanEmailSource('quiz-results?q=secret#answers'), 'quiz-results');
  assert.equal(sanitisePlanEmailSource('plan/results'), 'plan/results');
});

test('the lightweight public plan count stays in sync with the indexed catalogue', () => {
  assert.equal(LIGHTWEIGHT_PLAN_COUNT, INDEXABLE_PLAN_SEEDS.length);
});

test('health guidance always displays authoritative sources', () => {
  const health = /\b(calorie|weight loss|protein|fibre|nutrition|diet|menopause|inflammat|fasting|muscle building)\b/i;
  const missing = Object.entries(blogPostsData)
    .filter(([slug, post]) => health.test(`${slug} ${post.title} ${post.description}`))
    .filter(([slug, post]) => getEditorialSources(post, slug).length === 0)
    .map(([slug]) => slug);
  assert.deepEqual(missing, []);
});

test('specific price examples carry a dated warning and a current source', () => {
  const missing = Object.entries(blogPostsData)
    .filter(([, post]) => hasSpecificPriceClaims(post))
    .filter(([slug, post]) => !getPriceClaimMeta(post)?.dated || getPriceSources(post, slug).length === 0)
    .map(([slug]) => slug);
  assert.deepEqual(missing, []);
});

test('analytics averages use only sessions with the relevant measurements', () => {
  const now = new Date().toISOString();
  const events = [
    { occurred_at: now, session_id: 'sess_observed_1234', event_name: 'page_view', path: '/quiz/results?q=secret' },
    { occurred_at: now, session_id: 'sess_observed_1234', event_name: 'scroll_depth', path: '/quiz/results?q=secret', scroll_depth: 50 },
    { occurred_at: now, session_id: 'sess_observed_1234', event_name: 'page_exit', path: '/quiz/results?q=secret', active_time_ms: 12000, scroll_depth: 50 },
  ];
  const sessions = [
    { session_id: 'sess_observed_1234', entry_path: '/quiz/results?q=secret', entry_intent: 'eyJhbGwiOiJhbnN3ZXJzIn0' },
    ...Array.from({ length: 50 }, (_, index) => ({ session_id: `sess_empty_${String(index).padStart(12, '0')}` })),
  ];
  const stats = buildAnalyticsStats(events, sessions, [], { windowDays: 30 });
  assert.equal(stats.overview.sessions, 1);
  assert.equal(stats.overview.avgEngagedSeconds, 12);
  assert.equal(stats.overview.engagementSamples, 1);
  assert.equal(stats.overview.avgMaxScrollDepth, 50);
  assert.deepEqual(stats.topPages, [{ name: '/quiz/results', value: 1 }]);
  assert.deepEqual(stats.topEntryIntents, [{ name: 'quiz', value: 1 }]);
});

test('custom macro energy must broadly reconcile with the calorie target', () => {
  assert.equal(impliedMacroCalories({ protein: 180, carbs: 260, fats: 80 }), 2480);
  assert.equal(validateMacroCalorieConsistency({ protein: 180, carbs: 260, fats: 80 }, 2500).valid, true);
  assert.equal(validateMacroCalorieConsistency({ protein: 50, carbs: 50, fats: 25 }, 2500).valid, false);
});

test('fat and fibre misses prevent an exact macro label', () => {
  const target = { protein: 160, carbs: 180, fats: 60, fibre: 30 };
  assert.equal(macroMatchStatus(target, { protein: 160, carbs: 180, fats: 60, fibre: 30 }), 'exact');
  assert.equal(macroMatchStatus(target, { protein: 160, carbs: 180, fats: 100, fibre: 30 }), 'tradeoff');
  assert.equal(macroMatchStatus(target, { protein: 160, carbs: 180, fats: 60, fibre: 55 }), 'tradeoff');
});

test('public budget language separates flexible preference from high-budget plans', () => {
  const sources = ['src/data/planSeeds.js', 'src/data/restoredPlanSeeds.js', 'src/pages/PlanPage.jsx']
    .map(file => fs.readFileSync(file, 'utf8')).join('\n');
  assert.doesNotMatch(sources, /Flexible Budget|Flexible-budget/);
  assert.match(fs.readFileSync('src/pages/Quiz.jsx', 'utf8'), /Flexible \/ no budget preference/);
});

test('every material recipe ingredient is used by its method', () => {
  const offenders = [];
  for (const meal of MEALS) {
    const omitted = checkCoreIngredientOmission(meal.name, meal.ingredients, buildPracticalRecipeSteps(meal).join(' '));
    if (omitted.length) offenders.push(`${meal.id}: ${omitted.join(', ')}`);
  }
  for (const [slug, plan] of Object.entries(mealPlansData)) {
    for (const day of plan.plan || []) {
      for (const sourceMeal of day.meals || []) {
        const meal = canonicaliseLegacyMeal(sourceMeal);
        const omitted = checkCoreIngredientOmission(meal.name, meal.ingredients, (meal.recipe || []).join(' '));
        if (omitted.length) offenders.push(`${slug}/${day.day}/${meal.name}: ${omitted.join(', ')}`);
      }
    }
  }
  assert.deepEqual(offenders, []);
});

test('material-ingredient omission detector reacts when a real use step disappears', () => {
  assert.deepEqual(
    checkCoreIngredientOmission(
      'Chicken Pasta Bake',
      ['Chicken breast 200g', 'Wholemeal pasta 90g dry', 'Crème fraîche 80g'],
      'Cook the chicken. Boil the pasta, combine and bake.',
    ),
    ['Crème fraîche 80g'],
  );
});

test('approved flavour handling clears every structural flavour finding', () => {
  const offenders = [];
  for (const meal of MEALS) {
    if (checkFlavourCompleteness(meal.name, meal.ingredients)) offenders.push(meal.name);
  }
  for (const plan of Object.values(mealPlansData)) {
    for (const day of plan.plan || []) {
      for (const sourceMeal of day.meals || []) {
        const meal = canonicaliseLegacyMeal(sourceMeal);
        if (checkFlavourCompleteness(meal.name, meal.ingredients)) offenders.push(meal.name);
      }
    }
  }
  assert.deepEqual([...new Set(offenders)], []);
});
