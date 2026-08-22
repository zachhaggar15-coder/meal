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
import { PLAN_MACRO_INDEX } from '../src/data/planMacroIndex.js';
import { canonicaliseLegacyMeal } from '../src/utils/legacyPlanBuilder.js';
import { analyticsSearchIntent, sanitiseAnalyticsPath, sanitiseAnalyticsUrl } from '../src/utils/analyticsSanitisation.js';
import { getEditorialSources, getPriceClaimMeta, getPriceSources, hasSpecificPriceClaims } from '../src/utils/editorialSafeguards.js';
import { buildPlanDays, buildShoppingList, getSeedMacroGrams } from '../src/utils/planBuilder.js';
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

test('editorial dates are never presented as price-check dates', () => {
  const meta = getPriceClaimMeta({ published: '2026-08-20', sections: [{ paragraphs: ['Example price £2.50.'] }] });
  assert.equal(meta.dated, null);
  assert.equal(meta.stale, true);
});

test('catalogue macro data covers every indexed plan and matches its recipes', () => {
  assert.equal(Object.keys(PLAN_MACRO_INDEX).length, INDEXABLE_PLAN_SEEDS.length);
  for (const slug of ['aldi-cheap-hp-veg-1800', 'aldi-muscle-gain-3000', 'any-hp-veg-2000-batch-cook']) {
    const seed = INDEXABLE_PLAN_SEEDS.find(item => item.slug === slug);
    assert.deepEqual(PLAN_MACRO_INDEX[slug], getSeedMacroGrams(seed));
  }
});

test('approved high-egg plans stay within a practical weekly whole-egg quantity', () => {
  const slugs = [
    'aldi-cheap-hp-veg-1800',
    'aldi-muscle-gain-3000',
    'any-hp-veg-1800-protein-focused',
    'any-hp-veg-2000-batch-cook',
    'sainsburys-muscle-gain-2500-performance-protein-vegetarian-v3',
  ];
  for (const slug of slugs) {
    const seed = INDEXABLE_PLAN_SEEDS.find(item => item.slug === slug);
    const eggs = Object.values(buildShoppingList(buildPlanDays(seed).plan)).flat()
      .find(item => /^Eggs\s/i.test(item));
    assert.ok((Number(eggs?.match(/[\d.]+/)?.[0]) || 0) <= 24, `${slug}: ${eggs}`);
  }
});

test('generated plan titles use consistent punctuation and remove repeated concepts', () => {
  const offenders = INDEXABLE_PLAN_SEEDS.filter(seed => (
    /\s-\s[\d,]+\s+kcal\b/.test(seed.title)
    || /\bHigh Protein\b/.test(seed.title)
    || /\b(Simple Gym Gym Beginner|Protein-Focused High Protein|Higher-Protein Weekly High Protein|Budget-Smart Weekly Budget|Low-Fuss Weekly Low Effort)\b/.test(seed.title)
  )).map(seed => seed.slug);
  assert.deepEqual(offenders, []);
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

test('route vitals require enough sessions for each individual metric', () => {
  const now = new Date().toISOString();
  const vitalEvents = Array.from({ length: 5 }, (_, index) => ({
    occurred_at: now,
    session_id: `vital_session_${index}`,
    event_name: 'web_vital',
    path: '/',
    metadata: { metric_name: 'LCP', metric_value: 1800 },
  }));
  vitalEvents.push({
    occurred_at: now,
    session_id: 'vital_session_0',
    event_name: 'web_vital',
    path: '/',
    metadata: { metric_name: 'INP', metric_value: 120 },
  });
  const route = buildAnalyticsStats([], [], vitalEvents).coreWebVitals.routes[0];
  assert.equal(route.lcpStatus, 'measured');
  assert.equal(route.inpStatus, 'insufficient_data');
  assert.equal(route.lcpSessions, 5);
  assert.equal(route.inpSessions, 1);
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
