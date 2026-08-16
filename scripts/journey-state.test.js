// State, deep-link, entry-point and tool-outcome contracts.
//
// The earlier journey work proved that a control leads where its label
// promises. This file covers the layer above that: what happens when a user
// *changes their mind*, arrives by URL, comes in from a different entry point,
// or acts on a number a calculator gave them.
//
// The failure classes here are the two the appendix called out as untested:
//
//   state failure   — the first result is right, but a later selection reuses
//                     something from the earlier one;
//   content failure — the URL says one thing and the loaded data says another.
//
// Everything is asserted against the same resolvers the pages use, so a test
// passing here means the page cannot disagree with it.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getAllPlanMeta, getPlanBySlug } from '../src/utils/planBuilder.js';
import { recommendPlanForIntent } from '../src/utils/planRecommendation.js';
import { getTopMatches } from '../src/utils/quizScorer.js';
import { encodeQuizAnswers, decodeQuizAnswers, normaliseQuizAnswers } from '../src/utils/quizStorage.js';
import { buildContainerSetup } from '../src/utils/containerSetup.js';
import {
  buildBrowsePlanUrl,
  CALORIE_CHOICES,
  DIET_CHOICES,
  GOAL_CHOOSER_ITEMS,
  INDEXED_SUPERMARKET_CHOICES,
  getCalorieChoice,
  getDietChoice,
  getGoalChoice,
  getIndexedSupermarketChoice,
} from '../src/data/planChooser.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const ALL_PLANS = getAllPlanMeta();
const PLANS_BY_SLUG = new Map(ALL_PLANS.map(plan => [plan.slug, plan]));

// The browse page's own filter vocabulary, mirrored so a drift between the
// links the site generates and the filters it accepts is caught here.
const BROWSE_FILTERS = {
  goal: new Set(ALL_PLANS.map(plan => plan.goal)),
  supermarket: new Set(ALL_PLANS.map(plan => plan.supermarket)),
  diet: new Set(ALL_PLANS.map(plan => plan.dietType)),
  calories: new Set(ALL_PLANS.map(plan => String(plan.calories))),
};

function planMatchesBrowseFilters(plan, filters) {
  if (filters.goal && plan.goal !== filters.goal) return false;
  if (filters.supermarket && plan.supermarket !== filters.supermarket) return false;
  if (filters.diet && plan.dietType !== filters.diet) return false;
  if (filters.calories && String(plan.calories) !== String(filters.calories)) return false;
  return true;
}

function parseBrowseUrl(url) {
  const query = url.includes('?') ? url.slice(url.indexOf('?') + 1) : '';
  return Object.fromEntries(new URLSearchParams(query));
}

// ── State transitions: changing a selection must not reuse the previous one ──

test('changing supermarket changes the recommendation and never keeps the old store', () => {
  // The sequence a user actually performs: look at Lidl, change to Waitrose,
  // then pick a goal. Nothing from the Lidl view may survive into the result.
  const sequence = ['lidl', 'waitrose', 'aldi', 'iceland', 'tesco'];
  const goal = GOAL_CHOOSER_ITEMS.find(item => item.value === 'weight-loss');

  let previous = null;
  for (const supermarket of sequence) {
    const plan = recommendPlanForIntent(ALL_PLANS, {
      supermarket,
      goal: goal.value,
      targetCalories: goal.defaultCalories,
    });
    assert.ok(plan, `${supermarket}: no plan`);
    assert.equal(plan.supermarket, supermarket, `after switching to ${supermarket} the plan is ${plan.supermarket}`);
    if (previous) assert.notEqual(plan.slug, previous.slug, `${supermarket} returned the previous store's plan`);
    previous = plan;
  }
});

test('changing goal, then calories, then diet leaves no trace of the earlier choice', () => {
  const steps = [
    { supermarket: 'aldi', goal: 'weight-loss', targetCalories: 1500 },
    { supermarket: 'aldi', goal: 'muscle-gain', targetCalories: 2500 },
    { supermarket: 'aldi', goal: 'muscle-gain', targetCalories: 3000 },
    { supermarket: 'aldi', goal: 'vegan-low-cal', dietType: 'vegan', targetCalories: 1500 },
  ];

  for (const intent of steps) {
    const plan = recommendPlanForIntent(ALL_PLANS, intent);
    if (!plan) continue;
    assert.equal(plan.goal, intent.goal, `goal leaked: asked ${intent.goal}, got ${plan.goal}`);
    assert.equal(plan.supermarket, intent.supermarket);
    if (intent.dietType) assert.equal(plan.dietType, intent.dietType, 'diet leaked');
    assert.equal(plan.calories, intent.targetCalories, 'calorie target leaked');
  }
});

test('resolving is pure — the same intent gives the same answer regardless of what came before', () => {
  // A resolver holding state would produce a different answer the second time.
  const intent = { supermarket: 'lidl', goal: 'weight-loss', targetCalories: 1500 };
  const first = recommendPlanForIntent(ALL_PLANS, intent);

  // Interleave a long run of unrelated resolutions.
  for (const market of INDEXED_SUPERMARKET_CHOICES) {
    for (const goal of GOAL_CHOOSER_ITEMS) {
      recommendPlanForIntent(ALL_PLANS, { supermarket: market.value, goal: goal.value, targetCalories: goal.defaultCalories });
    }
  }

  const second = recommendPlanForIntent(ALL_PLANS, intent);
  assert.equal(second?.slug, first?.slug, 'resolver is carrying state between calls');
});

test('quiz answers do not leak between separate submissions', () => {
  const vegan = { goal: 'vegan-low-cal', diet: 'vegan', supermarket: 'aldi', calories: '1500', budget: 'budget', effort: 'standard' };
  const meat = { goal: 'muscle-gain', diet: 'standard', supermarket: 'tesco', calories: '3000', budget: 'moderate', effort: 'batch' };

  const veganFirst = getTopMatches(vegan, 3);
  getTopMatches(meat, 3);
  const veganAgain = getTopMatches(vegan, 3);
  assert.deepEqual(
    veganAgain.map(match => match.slug),
    veganFirst.map(match => match.slug),
    'a later quiz submission changed an earlier one',
  );

  const meatResult = getTopMatches(meat, 3);
  for (const match of meatResult) {
    assert.notEqual(match.dietType, 'vegan', 'the previous vegan answer leaked into a standard-diet result');
  }
});

// ── Deep links: a URL must reconstruct exactly the state it encodes ──────────

test('quiz answers survive a full encode/decode round trip', () => {
  // This is the deep-link path: /quiz/results?q=… is how a shared or refreshed
  // result rebuilds its state.
  const profiles = [
    { goal: 'weight-loss', diet: 'standard', supermarket: 'aldi', calories: '1500', budget: 'very-cheap', effort: 'standard' },
    { goal: 'vegan-low-cal', diet: 'vegan', supermarket: 'lidl', calories: '1500', budget: 'budget', effort: 'batch' },
    { goal: 'muscle-gain', diet: 'standard', supermarket: 'tesco', calories: '3000', budget: 'moderate', effort: 'batch' },
  ];

  for (const answers of profiles) {
    const decoded = decodeQuizAnswers(encodeQuizAnswers(answers));
    assert.deepEqual(decoded, normaliseQuizAnswers(answers), 'answers changed through the URL');

    // And the reconstructed state must produce the same recommendation.
    assert.deepEqual(
      getTopMatches(decoded, 3).map(match => match.slug),
      getTopMatches(answers, 3).map(match => match.slug),
      'a deep link produced a different recommendation from the live answers',
    );
  }
});

test('a malformed or hostile quiz token is rejected rather than half-applied', () => {
  for (const token of ['', '!!!!', 'x'.repeat(5000), 'eyJub3QiOiJ2YWxpZCJ9', '../../etc/passwd', '<script>']) {
    const decoded = decodeQuizAnswers(token);
    assert.ok(decoded === null || typeof decoded === 'object', `token ${token.slice(0, 12)} produced ${typeof decoded}`);
    if (decoded) {
      for (const value of Object.values(decoded)) {
        assert.notEqual(typeof value, 'object', 'a hostile token injected structured data');
      }
    }
  }
});

test('every chooser route parameter resolves or is rejected outright', () => {
  // Deep links people can type or share. A wrong one must 404, not render a
  // page built from a partially-applied parameter.
  for (const [resolver, valid, invalid] of [
    [getIndexedSupermarketChoice, INDEXED_SUPERMARKET_CHOICES.map(item => item.value), ['tescos', 'ALDI', 'aldi ', 'sains', '../aldi', '']],
    [getGoalChoice, GOAL_CHOOSER_ITEMS.map(item => item.value), ['weight_loss', 'weight', 'loss', 'Weight-Loss', '']],
    [getDietChoice, DIET_CHOICES.map(item => item.value), ['vegetarianism', 'vegans', 'VEGAN', '']],
    [getCalorieChoice, CALORIE_CHOICES.map(item => item.value), ['1501', '150', '15000', 'abc', '']],
  ]) {
    for (const value of valid) assert.ok(resolver(value), `valid value ${value} did not resolve`);
    for (const value of invalid) assert.equal(resolver(value), null, `invalid value "${value}" resolved to something`);
  }
});

// ── UI ↔ URL ↔ data: generated links must return what they advertise ─────────

test('every "More options" link filters to plans that actually exist', () => {
  // The chooser's secondary CTA. If it produced an empty or mismatched filter
  // the user would be dropped into a blank browse page.
  const failures = [];
  for (const market of INDEXED_SUPERMARKET_CHOICES) {
    for (const goal of GOAL_CHOOSER_ITEMS) {
      const url = buildBrowsePlanUrl({ supermarket: market.value, goal: goal.value });
      const filters = parseBrowseUrl(url);

      assert.equal(filters.supermarket, market.value, `${url} lost the supermarket`);
      assert.equal(filters.goal, goal.value, `${url} lost the goal`);

      const matches = ALL_PLANS.filter(plan => planMatchesBrowseFilters(plan, filters));
      const anyPlanExists = ALL_PLANS.some(plan => plan.supermarket === market.value && plan.goal === goal.value);
      if (anyPlanExists && matches.length === 0) failures.push(url);
    }
  }
  assert.deepEqual(failures, []);
});

test('generated browse links only use filter values the data recognises', () => {
  const failures = [];
  const urls = [
    ...INDEXED_SUPERMARKET_CHOICES.map(item => buildBrowsePlanUrl({ supermarket: item.value })),
    ...GOAL_CHOOSER_ITEMS.map(item => buildBrowsePlanUrl({ goal: item.value })),
    ...DIET_CHOICES.map(item => buildBrowsePlanUrl({ diet: item.dietType, goal: item.defaultGoal })),
    ...CALORIE_CHOICES.map(item => buildBrowsePlanUrl({ calories: item.calories })),
  ];

  for (const url of urls) {
    for (const [key, value] of Object.entries(parseBrowseUrl(url))) {
      const vocabulary = BROWSE_FILTERS[key];
      if (!vocabulary) continue;
      if (!vocabulary.has(value)) failures.push(`${url}: ${key}=${value} matches no plan`);
    }
  }
  assert.deepEqual(failures, []);
});

// ── Multiple entry points must agree on plan identity ───────────────────────

test('a plan reached by any route is the same plan with the same identity', () => {
  // Direct URL, supermarket chooser, goal chooser and quiz can all land on the
  // same plan. An entry-point-specific transformation would show up here.
  const probes = [
    { supermarket: 'aldi', goal: 'weight-loss', calories: 1500 },
    { supermarket: 'tesco', goal: 'muscle-gain', calories: 2500 },
    { supermarket: 'lidl', goal: 'high-protein-low-cal', calories: 1500 },
  ];

  for (const probe of probes) {
    const viaSupermarketChooser = recommendPlanForIntent(ALL_PLANS, {
      supermarket: probe.supermarket, goal: probe.goal, targetCalories: probe.calories,
    });
    const viaGoalChooser = recommendPlanForIntent(ALL_PLANS, {
      goal: probe.goal, supermarket: probe.supermarket, targetCalories: probe.calories,
    });
    assert.equal(viaGoalChooser?.slug, viaSupermarketChooser?.slug, `${probe.goal}/${probe.supermarket}: choosers disagree`);

    const slug = viaSupermarketChooser.slug;
    const direct = getPlanBySlug(slug);
    const listed = PLANS_BY_SLUG.get(slug);

    for (const field of ['goal', 'supermarket', 'calories', 'dietType', 'title']) {
      assert.equal(direct[field], listed[field], `${slug}: direct load differs from the listing on ${field}`);
    }

    // And via the quiz, when it recommends the same plan.
    const quizMatch = getTopMatches({
      goal: probe.goal, diet: 'standard', supermarket: probe.supermarket,
      calories: String(probe.calories), budget: listed.budget, effort: listed.effort,
    }, 5).find(match => match.slug === slug);
    if (quizMatch) {
      for (const field of ['goal', 'supermarket', 'calories', 'dietType', 'title']) {
        assert.equal(quizMatch[field], listed[field], `${slug}: quiz card differs from the listing on ${field}`);
      }
    }
  }
});

// ── Tool outcomes: a number a calculator gives must lead somewhere real ─────

const PLAN_CALORIES = [1400, 1500, 1600, 1800, 2000, 2200, 2500, 3000, 3500];
const ACTIVITY_FACTORS = [1.2, 1.375, 1.55, 1.725];
const GOAL_ADJUSTMENTS = [-450, -250, 0, 350];

function calorieCalculatorTarget({ sex, age, height, weight, factor, adjustment }) {
  // Mirrors the Mifflin-St Jeor calculation in src/pages/ToolsPage.jsx.
  const bmr = sex === 'male'
    ? (10 * weight) + (6.25 * height) - (5 * age) + 5
    : (10 * weight) + (6.25 * height) - (5 * age) - 161;
  const tdee = Math.round(bmr * factor);
  return Math.max(1200, tdee + adjustment);
}

function nearestPlanCalories(target) {
  return PLAN_CALORIES.reduce((best, value) => (
    Math.abs(value - target) < Math.abs(best - target) ? value : best
  ), PLAN_CALORIES[0]);
}

test('the calorie calculator always points at a calorie level that has plans', () => {
  // The tool tells the user "closest plan filter: N kcal" and links to it. If
  // any reachable N had no plans, the tool would send them to an empty page.
  const failures = new Set();
  let combinations = 0;

  for (const sex of ['female', 'male']) {
    for (const age of [18, 30, 45, 60, 90]) {
      for (const height of [130, 165, 185, 220]) {
        for (const weight of [40, 70, 110, 220]) {
          for (const factor of ACTIVITY_FACTORS) {
            for (const adjustment of GOAL_ADJUSTMENTS) {
              combinations += 1;
              const nearest = nearestPlanCalories(calorieCalculatorTarget({ sex, age, height, weight, factor, adjustment }));
              const url = buildBrowsePlanUrl({ calories: nearest });
              const matches = ALL_PLANS.filter(plan => planMatchesBrowseFilters(plan, parseBrowseUrl(url)));
              if (!matches.length) failures.add(`${nearest} kcal has no plans (${url})`);
            }
          }
        }
      }
    }
  }

  assert.ok(combinations > 1000, `expected broad coverage, ran ${combinations}`);
  assert.deepEqual([...failures], []);
});

test('every calorie level the calculator can recommend is a real plan level', () => {
  const planLevels = new Set(ALL_PLANS.map(plan => plan.calories));
  const unreachable = PLAN_CALORIES.filter(level => !planLevels.has(level));
  assert.deepEqual(unreachable, [], 'the calculator offers a calorie level no plan uses');
});

test('the protein calculator produces a sane range and a filter that returns plans', () => {
  for (const weight of [40, 70, 100, 220]) {
    for (const [goal, multiplier] of Object.entries({ fatLoss: [1.6, 2.0], maintain: [1.4, 1.8], gain: [1.8, 2.2] })) {
      const low = Math.round(weight * multiplier[0]);
      const high = Math.round(weight * multiplier[1]);
      assert.ok(low > 0 && high > low, `${weight}kg/${goal}: nonsensical range ${low}-${high}`);

      const filterGoal = goal === 'gain' ? 'muscle-gain' : 'high-protein-low-cal';
      const matches = ALL_PLANS.filter(plan => plan.goal === filterGoal);
      assert.ok(matches.length > 0, `${goal} links to a goal filter with no plans`);
    }
  }
});

test('the container recommender returns a usable setup for every input it accepts', () => {
  const failures = [];
  for (const prepDays of [1, 2, 3, 4, 5, 6, 7]) {
    for (const mealsPerDay of [1, 2, 3, 4, 5]) {
      for (const people of [1, 2, 3, 4]) {
        const setup = buildContainerSetup({ prepDays, mealsPerDay, people, spareContainers: 0 });
        if (!setup) { failures.push(`${prepDays}/${mealsPerDay}/${people}: no setup`); continue; }
        const count = setup.containerCount ?? setup.count;
        if (!Number.isFinite(count) || count < 1) {
          failures.push(`${prepDays}/${mealsPerDay}/${people}: container count ${count}`);
        }
      }
    }
  }
  assert.deepEqual(failures.slice(0, 8), []);
});

// ── Nothing reachable is a dead end ─────────────────────────────────────────

test('every plan in the library is reachable through at least one journey', () => {
  // A plan nobody can navigate to is inventory that only search engines see.
  const reachable = new Set();

  for (const market of INDEXED_SUPERMARKET_CHOICES) {
    for (const goal of GOAL_CHOOSER_ITEMS) {
      const plan = recommendPlanForIntent(ALL_PLANS, { supermarket: market.value, goal: goal.value, targetCalories: goal.defaultCalories });
      if (plan) reachable.add(plan.slug);
    }
  }

  // Browse is the general-purpose route: every plan must survive its filters.
  for (const plan of ALL_PLANS) {
    const url = buildBrowsePlanUrl({ goal: plan.goal, supermarket: plan.supermarket });
    if (ALL_PLANS.filter(item => planMatchesBrowseFilters(item, parseBrowseUrl(url))).some(item => item.slug === plan.slug)) {
      reachable.add(plan.slug);
    }
  }

  const orphans = ALL_PLANS.filter(plan => !reachable.has(plan.slug)).map(plan => plan.slug);
  assert.deepEqual(orphans.slice(0, 10), [], `${orphans.length} plans are unreachable by any journey`);
});

// ── Publisher pages must be reachable from every public page ────────────────

test('every public page component renders the site footer', () => {
  // Found by a production journey, not by a unit test: seven page components
  // rendered no footer, so 90 indexable pages offered no route to Privacy,
  // Terms, About, Methodology or Contact. Checking that navigation *data*
  // contains those links is not the same as checking a page *renders* them.
  const pagesDir = path.join(root, 'src/pages');
  const exempt = new Set([
    'AdminDashboard.jsx', // internal, noindex, deliberately chrome-free
    'NotFound.jsx',       // renders the 404 body inside another page's layout
  ]);

  const offenders = [];
  for (const file of fs.readdirSync(pagesDir)) {
    if (!file.endsWith('.jsx') || exempt.has(file)) continue;
    const source = fs.readFileSync(path.join(pagesDir, file), 'utf8');
    if (!/<Footer\s*\/>/.test(source)) offenders.push(file);
  }

  assert.deepEqual(
    offenders,
    [],
    'These pages render no footer, so a reader cannot reach the privacy policy '
    + 'or any publisher page from them.',
  );
});
