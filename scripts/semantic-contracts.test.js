// Semantic contracts: does the page deliver what it promises?
//
// Every defect pinned here was technically valid. The recipes were safe and
// their nutrition was right; the plans routed correctly; the articles' figures
// were individually accurate. What was wrong was the relationship between a
// promise and what sat underneath it:
//
//   a "bark" that was never frozen
//   a shepherd's pie whose mash was boiled and served alongside
//   a muscle-gain plan explaining fat loss
//   "all under 500 calories" above a 560 kcal dinner
//   "Choose a Aldi meal plan"
//
// Each test carries its own controls, because a detector that silently stops
// matching is worse than no detector — see scripts/source-integrity.test.js for
// the incident that taught us that.
import test from 'node:test';
import assert from 'node:assert/strict';

import { MEALS } from '../src/data/mealLibrary.js';
import { mealPlansData } from '../src/data/mealPlans.js';
import { buildPracticalRecipeSteps } from '../src/utils/recipeQuality.js';
import { splitIngredientText } from '../src/utils/nutrition.js';
import { checkFamilyContracts, familiesFor } from './lib/recipeFamilies.js';
import { findNumericContradictions } from './lib/numericPromises.js';
import { indefiniteArticleFor } from '../src/utils/indefiniteArticle.js';
import { getAllPlanMeta, getPlanBySlug } from '../src/utils/planBuilder.js';
import { MEAL_PLAN_HUBS } from '../src/data/mealPlanHubs.js';

/** Every distinct recipe across the shared library and legacy editorial plans. */
function allRecipes() {
  const seen = new Set();
  const recipes = [];
  for (const meal of MEALS) {
    if (seen.has(meal.name)) continue;
    seen.add(meal.name);
    recipes.push({ name: meal.name, meal });
  }
  for (const plan of Object.values(mealPlansData)) {
    for (const day of plan.plan || []) {
      for (const meal of day.meals || []) {
        if (seen.has(meal.name)) continue;
        seen.add(meal.name);
        const ingredients = Array.isArray(meal.ingredients)
          ? meal.ingredients
          : splitIngredientText(meal.portion_size || '');
        recipes.push({ name: meal.name, meal: { ...meal, ingredients } });
      }
    }
  }
  return recipes;
}

// ── Recipe title → method ───────────────────────────────────────────────────

test('every recipe method produces the dish its title names', () => {
  const violations = [];
  let covered = 0;
  for (const { name, meal } of allRecipes()) {
    if (familiesFor(name).length) covered += 1;
    const steps = buildPracticalRecipeSteps(meal);
    for (const violation of checkFamilyContracts(name, steps)) {
      violations.push(`${violation.name} — ${violation.because}`);
    }
  }
  assert.ok(covered > 60, `expected broad family coverage, got ${covered}`);
  assert.deepEqual(violations, []);
});

test('regression: the reported bark and shepherd\'s pie deliver their dish', () => {
  const bark = allRecipes().find(item => /bark/i.test(item.name));
  assert.ok(bark, 'bark recipe missing from the corpus');
  const barkSteps = buildPracticalRecipeSteps(bark.meal).join(' ');
  assert.match(barkSteps, /freez/i, 'bark must be frozen');
  assert.match(barkSteps, /spread/i, 'bark must be spread flat');
  assert.match(barkSteps, /break/i, 'bark must be broken into pieces');

  const pie = allRecipes().find(item => /shepherd/i.test(item.name));
  assert.ok(pie, 'shepherd\'s pie missing from the corpus');
  const pieSteps = buildPracticalRecipeSteps(pie.meal).join(' ');
  assert.match(pieSteps, /spread .*mash|top/i, 'the pie needs a topping over the filling');
  assert.match(pieSteps, /bake|oven/i, 'the pie has to be finished in the oven');
  assert.doesNotMatch(pieSteps, /cut the sweet potato mash/i, 'mash must not be treated as raw potato');
});

test('an ingredient stated as already mashed is never boiled from raw', () => {
  const offenders = [];
  for (const { name, meal } of allRecipes()) {
    const ingredients = (meal.ingredients || []).join(' ');
    if (!/\bmash\b|\bmashed\b/i.test(ingredients)) continue;
    const steps = buildPracticalRecipeSteps(meal).join(' ');
    if (/(cut|chop|peel).{0,40}mash.{0,40}(boil|simmer)/i.test(steps)) offenders.push(name);
  }
  assert.deepEqual(offenders, []);
});

test('the family checker reacts to a broken method (control)', () => {
  // Positive control: prove the contract fails when the defining step is gone.
  const broken = checkFamilyContracts('Frozen Yogurt Bark', [
    'Put the yogurt in a bowl.', 'Top with berries.', 'Eat straight away.',
  ]);
  assert.ok(broken.length > 0, 'a bark with no freezing step must be reported');

  // Negative control: a correct method must pass.
  const fixed = checkFamilyContracts('Frozen Yogurt Bark', [
    'Spread the yogurt on a lined tray.', 'Freeze flat for 4 hours.', 'Break into shards.',
  ]);
  assert.deepEqual(fixed, []);
});

// ── Plan goal → copy ────────────────────────────────────────────────────────

const ASSERTS_PHYSIOLOGY = /\b(?:is a|creates a|puts you in a) (?:calorie )?(?:surplus|deficit)\b|\byour maintenance\b/i;

test('no plan asserts a calorie surplus or deficit it cannot know', () => {
  // The site never asks for the reader's energy expenditure, so it cannot know
  // whether any figure is a surplus, a deficit or maintenance for them.
  const offenders = [];
  for (const meta of getAllPlanMeta()) {
    const plan = getPlanBySlug(meta.slug);
    if (!plan) continue;
    const copy = [
      plan.intro, plan.summary?.bestFor, plan.summary?.rationale,
      plan.whyThisPlan, plan.emphasisContext?.rationale,
    ].filter(Boolean).join(' ');
    if (ASSERTS_PHYSIOLOGY.test(copy)) offenders.push(`${meta.slug}: ${copy.match(ASSERTS_PHYSIOLOGY)[0]}`);
  }
  assert.deepEqual(offenders.slice(0, 6), []);
});

test('a gain-goal plan never explains itself as a fat-loss plan', () => {
  // The emphasis rationale is chosen independently of goal, so a sentence
  // naming fat loss reached 64 muscle-gain, bodybuilding and recomp plans.
  const offenders = [];
  for (const meta of getAllPlanMeta()) {
    if (!/muscle-gain|budget-bodybuilding|gym-beginner|body-recomp/.test(meta.goal)) continue;
    const plan = getPlanBySlug(meta.slug);
    if (!plan) continue;
    const copy = [plan.summary?.rationale, plan.emphasisContext?.rationale, plan.summary?.bestFor]
      .filter(Boolean).join(' ');
    if (/\bthe goal is fat loss\b|\bfor fat loss\b/i.test(copy)) offenders.push(meta.slug);
  }
  assert.deepEqual(offenders.slice(0, 6), []);
});

// ── Article promise → examples ──────────────────────────────────────────────

test('the numeric promise detector catches the defects it was built for (control)', () => {
  const positives = [
    [['These meals are all under 500 calories per serving:', 'Chicken with lentils = ~560 kcal, 62 g protein.'], 'kcal ceiling'],
    [['These snacks each deliver at least 15 g of protein:', 'Boiled eggs (2): ~156 kcal, 13 g protein.'], 'protein floor'],
    [['These options each deliver 20–35 g of protein:', 'Yogurt bowl = ~350 kcal, 40 g protein.'], 'protein range'],
  ];
  for (const [blocks, label] of positives) {
    assert.ok(findNumericContradictions(blocks).length > 0, `${label} should be detected`);
  }

  const negatives = [
    [['These meals are all under 500 calories per serving:', 'Cod with sweet potato = ~450 kcal, 40 g protein.'], 'compliant example'],
    [['Aim for 130–150 g of protein per day.', 'Greek yogurt (200 g): ~115 kcal, 20 g protein.'], 'daily target'],
    [['These options each deliver 20–35 g of protein:', 'Chicken breast: 31 g protein per 100 g.'], 'per-100g figure'],
  ];
  for (const [blocks, label] of negatives) {
    assert.deepEqual(findNumericContradictions(blocks), [], `${label} must not be flagged`);
  }
});

// ── Generated grammar ───────────────────────────────────────────────────────

test('the indefinite article follows the sound, not the letter', () => {
  for (const [word, expected] of [
    ['Aldi', 'an'], ['Asda', 'an'], ['Iceland', 'an'], ['Ocado', 'an'], ['M&S', 'an'],
    ['Tesco', 'a'], ['Lidl', 'a'], ['Waitrose', 'a'], ['Morrisons', 'a'], ['Co-op', 'a'],
    ['European', 'a'], ['one-pot', 'a'], ['hour', 'an'], ['honest', 'an'],
  ]) {
    assert.equal(indefiniteArticleFor(word), expected, `"${expected} ${word}"`);
  }
});

test('no generated hub copy mismatches its indefinite article', () => {
  const WRONG = /\ba (?:Aldi|Asda|Iceland|Ocado|M&S|hour)\b|\ban (?:Tesco|Lidl|Waitrose|Morrisons|Co-op)\b/;
  const offenders = [];
  for (const hub of Object.values(MEAL_PLAN_HUBS)) {
    const copy = [
      hub.intro, hub.title, hub.h1,
      ...(hub.faq || []).flatMap(item => [item.q, item.a]),
      ...(hub.sections || []).flatMap(section => section.paragraphs || []),
    ].filter(Boolean).join(' ');
    const match = WRONG.exec(copy);
    if (match) offenders.push(`${hub.slug}: "${match[0]}"`);
  }
  assert.deepEqual(offenders, []);
});

// ── Price freshness ─────────────────────────────────────────────────────────

test('the price-vintage detector reads dates the way the copy writes them (control)', async () => {
  const { findPriceVintages, findStalePrices } = await import('./lib/priceVintage.js');
  const now = new Date('2026-08-16T00:00:00Z');

  for (const [copy, year, month] of [
    ['using in-store prices collected in February 2025.', 2025, 2],
    ['Prices are correct at March 2026.', 2026, 3],
    ['using online prices as of early 2025.', 2025, 2],
    ['using prices as of late 2024.', 2024, 10],
  ]) {
    const [vintage] = findPriceVintages(copy);
    assert.ok(vintage, `no vintage read from "${copy}"`);
    assert.equal(vintage.year, year);
    assert.equal(vintage.month, month);
  }

  // Positive: the defect as it stood — 18 months of drift, undisclosed.
  assert.equal(findStalePrices(
    [{ id: 'comparison', text: 'prices as of early 2025.' }], { now },
  ).length, 1);

  // Negative: recent prices, old-but-disclosed prices, and a year that is not
  // a price at all.
  assert.deepEqual(findStalePrices(
    [{ id: 'recent', text: 'Prices checked in July 2026.' }], { now },
  ), []);
  assert.deepEqual(findStalePrices(
    [{ id: 'disclosed', text: 'prices collected in February 2025. Read the totals as a snapshot; check shelf prices before shopping.' }],
    { now },
  ), []);
  assert.deepEqual(findStalePrices(
    [{ id: 'unrelated', text: 'The plan was published in 2023 and still works.' }], { now },
  ), []);
});

test('no page presents year-old prices as if they were current', async () => {
  const { findStalePrices } = await import('./lib/priceVintage.js');
  const { blogPostsData } = await import('../src/data/blogPosts.js');

  const pages = Object.entries(blogPostsData).map(([slug, post]) => ({
    id: `/blog/${slug}`,
    text: [
      post.intro,
      ...(post.sections || []).flatMap(section => [
        ...(section.paragraphs || []),
        ...(section.bullets || []).map(bullet => (Array.isArray(bullet) ? bullet.join(' ') : bullet)),
      ]),
    ].filter(item => typeof item === 'string').join(' '),
  }));

  const stale = findStalePrices(pages);
  assert.deepEqual(
    stale.map(item => `${item.id}: "${item.phrase}" is ${item.monthsOld} months old`),
    [],
  );
});

// ── Titles that name a cooking method ───────────────────────────────────────
//
// Found by the final adversarial pass, which asked which recipes could still
// produce something other than their title. The family contracts covered 86 of
// 268 recipes; these defects were all in the other 182.

test('a title that says baked produces something baked', () => {
  const offenders = [];
  for (const { name, meal } of allRecipes()) {
    if (!/\bbaked?\b/i.test(name) || /no.?bake/i.test(name)) continue;
    const steps = buildPracticalRecipeSteps(meal).join(' ');
    if (!/oven|bake|roast/i.test(steps)) offenders.push(name);
  }
  // "Baked Cod and Chickpea Stew" is a known naming conflict rather than a
  // method defect: it is a stew, and stewing the cod is the right method for
  // the dish. Listed explicitly so it cannot grow silently.
  assert.deepEqual(offenders, ['Baked Cod and Chickpea Stew']);
});

test('a title that says No-Bake never turns the oven on', () => {
  const offenders = [];
  for (const { name, meal } of allRecipes()) {
    if (!/no.?bake/i.test(name)) continue;
    const steps = buildPracticalRecipeSteps(meal).join(' ');
    if (/heat the oven|bake for/i.test(steps)) offenders.push(name);
  }
  assert.deepEqual(offenders, []);
});

test('regression: no-cook protein balls are mixed, rolled and chilled', () => {
  // This recipe was given "Cook the firmer vegetables in a non-stick pan until
  // tender" — a step naming ingredients it does not contain, in a dish whose
  // title says it is not cooked.
  const balls = allRecipes().find(item => /No-Bake.*Balls/i.test(item.name));
  assert.ok(balls, 'the no-bake protein balls recipe is missing');
  const steps = buildPracticalRecipeSteps(balls.meal).join(' ');
  assert.match(steps, /roll into/i, 'balls have to be rolled');
  assert.match(steps, /chill|fridge/i, 'they have to be chilled to set');
  assert.doesNotMatch(steps, /vegetables/i, 'there are no vegetables in this recipe');
  assert.doesNotMatch(steps, /heat the oven/i, 'a no-bake recipe must not be baked');
});

test('regression: a pasta bake is finished in the oven', () => {
  const bake = allRecipes().find(item => /Pasta Bake/i.test(item.name));
  assert.ok(bake, 'the pasta bake recipe is missing');
  const steps = buildPracticalRecipeSteps(bake.meal).join(' ');
  assert.match(steps, /oven/i, 'a bake needs an oven');
  assert.match(steps, /ovenproof dish|bake for/i, 'it has to be assembled and baked');
});
