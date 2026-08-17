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
import fs from 'node:fs';

import { MEALS } from '../src/data/mealLibrary.js';
import { mealPlansData } from '../src/data/mealPlans.js';
import { buildPracticalRecipeSteps, resolveApplianceState } from '../src/utils/recipeQuality.js';
import { splitIngredientText } from '../src/utils/nutrition.js';
import { checkFamilyContracts, familiesFor } from './lib/recipeFamilies.js';
import { findNumericContradictions } from './lib/numericPromises.js';
import { indefiniteArticleFor } from '../src/utils/indefiniteArticle.js';
import { getAllPlanMeta, getPlanBySlug, conflictsWithDiet } from '../src/utils/planBuilder.js';
import {
  findProtein,
  isReadyToEatIngredient,
  primaryProteinSignature,
  sharedPrimaryProteins,
} from '../src/utils/ingredientRoles.js';
import { MEAL_PLAN_HUBS } from '../src/data/mealPlanHubs.js';

/** Every distinct recipe across the shared library and legacy editorial plans. */
const MEAL_RECORDS = new Map(MEALS.map(meal => [meal.name, meal]));
/** Plan days carry rendered meals; look up the record that has ingredients. */
function mealRecord(planMeal) {
  return MEAL_RECORDS.get(planMeal?.name) || planMeal;
}

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

// Widened after the homepage calorie shortcuts were found labelling 1,800 kcal
// "Moderate deficit" and 2,000 kcal "Maintenance or light deficit". The old
// pattern only caught verb forms ("creates a deficit"), so a bare noun label
// sitting against a number slipped straight through, and so did the recomp
// copy's "near-maintenance".
const ASSERTS_PHYSIOLOGY = new RegExp([
  '\\b(?:is a|creates a|puts you in a) (?:calorie )?(?:surplus|deficit)\\b',
  '\\byour maintenance\\b',
  '\\bnear-?maintenance\\b',
  '\\bcalories stay close to maintenance\\b',
  '^(?:moderate |light |slight )?(?:calorie )?(?:deficit|surplus)\\b',
].join('|'), 'i');

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
  // No exceptions. The last one, "Baked Cod and Chickpea Stew", was resolved by
  // correcting the title rather than by bolting an oven step onto a stew.
  assert.deepEqual(offenders, []);
});

test('regression: the cod and chickpea stew is named as the stew it is', () => {
  // It shipped as "Baked Cod and Chickpea Stew" across 130 plans while its
  // method — correctly — browned the cod and simmered it in tinned tomatoes.
  // The id had said `cod-chickpea-stew` all along.
  const stew = allRecipes().find(item => /cod and chickpea stew/i.test(item.name));
  assert.ok(stew, 'the cod and chickpea stew is missing from the corpus');
  assert.equal(stew.name, 'Cod and Chickpea Stew');
  assert.doesNotMatch(stew.name, /baked/i, 'the title must not promise baking');

  const steps = buildPracticalRecipeSteps(stew.meal).join(' ');
  assert.match(steps, /simmer/i, 'a stew has to simmer');
  assert.doesNotMatch(steps, /heat the oven|bake for/i, 'a stew is not baked');
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

// Title words that name a defining cooking method.
//
// These are promoted from the ad-hoc checks the adversarial pass used, and only
// the ones where the rule is genuinely unambiguous: if a title says a dish is
// toasted, wrapped, poached or cut into wedges, the method has to do that. They
// are cheap to keep and they cover part of the 182 recipes that have no full
// family contract — coverage, not a claim that the other rules exist.
//
// Deliberately NOT promoted: "grilled" (the site legitimately offers a pan or
// griddle alternative) and "stew"/"bowl" (serving vessels, not methods).
const METHOD_TITLE_CONTRACTS = [
  { word: 'toast', name: /\btoast(?:ed)?\b/i, method: /toast|grill/i },
  { word: 'wrap', name: /\bwrap\b/i, method: /wrap|fill|roll|fold/i },
  { word: 'wedges', name: /\bwedges\b/i, method: /wedge|cut|oven|roast|bake/i },
  { word: 'poached', name: /\bpoach(?:ed)?\b/i, method: /poach|simmer|water/i },
];

test('a title naming a cooking method gets that method', () => {
  const offenders = [];
  let checked = 0;
  for (const { name, meal } of allRecipes()) {
    const steps = buildPracticalRecipeSteps(meal).join(' ');
    for (const contract of METHOD_TITLE_CONTRACTS) {
      if (!contract.name.test(name)) continue;
      checked += 1;
      if (!contract.method.test(steps)) {
        offenders.push(`${name} — title says ${contract.word}, method does not`);
      }
    }
  }
  assert.ok(checked > 25, `expected these contracts to cover real recipes, got ${checked}`);
  assert.deepEqual(offenders, []);
});

test('the method-title contracts fail when the method is wrong (control)', () => {
  // Positive control: a toast recipe whose method never toasts.
  const toast = METHOD_TITLE_CONTRACTS.find(c => c.word === 'toast');
  assert.ok(toast.name.test('Poached Eggs on Toast'));
  assert.ok(!toast.method.test('Fry the eggs and serve with bread.'),
    'a method with no toasting must not satisfy the contract');
  assert.ok(toast.method.test('Toast the bread, then top with the eggs.'));

  // Negative control: the contract must not fire on an unrelated title.
  assert.ok(!toast.name.test('Cod and Chickpea Stew'));
});

// ── Plan copy vs the plan's own structured attributes ───────────────────────
//
// The two tests above check generated copy against the plan's *goal*. Diet is
// the sibling attribute and was never checked, so a vegan plan could open with
// "protein comes from whole foods — fish, eggs, dairy" and suggest "add an
// extra tin of fish", while every meal on the page was vegan. 653 plan/field
// combinations were affected. This generalises the same idea to diet, over
// every user-visible copy field rather than a hand-picked few.

const COPY_FIELDS = ['intro', 'faq', 'swaps', 'summary', 'storeGuide', 'prepPlan', 'seo', 'title'];

test('no plan recommends food its own diet rules out', () => {
  const offenders = [];
  let checked = 0;
  for (const meta of getAllPlanMeta()) {
    const plan = getPlanBySlug(meta.slug);
    if (!plan || meta.dietType === 'standard') continue;
    checked += 1;
    for (const field of COPY_FIELDS) {
      const value = typeof plan[field] === 'string' ? plan[field] : JSON.stringify(plan[field]);
      const conflict = conflictsWithDiet(value, meta.dietType);
      if (conflict) offenders.push(`${meta.slug} [${field}] names "${conflict}" on a ${meta.dietType} plan`);
    }
  }
  assert.ok(checked > 250, `expected to cover the non-standard plans, got ${checked}`);
  assert.deepEqual(offenders.slice(0, 8), []);
});

test('the diet-copy detector fires on real conflicts and not on compatible food (control)', () => {
  // Positive: the exact sentences that shipped.
  assert.ok(conflictsWithDiet('protein comes from whole foods — fish, eggs, dairy', 'vegan'));
  assert.ok(conflictsWithDiet('Use frozen chicken breast instead of fresh', 'vegetarian'));
  assert.ok(conflictsWithDiet('Swap a carb portion for extra chicken breast', 'pescatarian'));
  assert.ok(conflictsWithDiet('Mediterranean-style planning with oily fish', 'vegan'));

  // Negative: plant analogues and absence-of-food phrasing are compatible, and
  // flagging them would make the invariant useless.
  assert.ok(!conflictsWithDiet('use soya milk rather than other plant milks', 'vegan'));
  assert.ok(!conflictsWithDiet('Quorn Mince Bolognese', 'vegetarian'));
  assert.ok(!conflictsWithDiet('High-protein meat-free eating', 'vegetarian'));
  assert.ok(!conflictsWithDiet('Oat Biscuits with Peanut Butter', 'vegan'));
  assert.ok(!conflictsWithDiet('extra white fish or prawns', 'pescatarian'));
  assert.ok(!conflictsWithDiet('grilled chicken breast', 'standard'));
});

// ── Batch-prep storage must not contradict the safety component ─────────────

test('batch-prep instructions never contradict the two-day chilled limit', () => {
  // StorageSafetyNote tells the reader to eat chilled leftovers within 48 hours
  // or freeze them. The batch generator said "keep Monday to Wednesday portions
  // in the fridge and freeze later-week portions if you prefer fresher storage"
  // — three days, with freezing offered as a preference — on the same page.
  const UNSAFE = [
    /Monday to Wednesday portions in the fridge/i,
    /freeze[^.]{0,40}if you prefer fresher/i,
    /fridge[^.]{0,30}\b(?:most|rest) of the week/i,
  ];
  const offenders = [];
  for (const meta of getAllPlanMeta()) {
    const plan = getPlanBySlug(meta.slug);
    if (!plan?.prepPlan) continue;
    const text = JSON.stringify(plan.prepPlan);
    for (const pattern of UNSAFE) {
      if (pattern.test(text)) offenders.push(`${meta.slug}: ${pattern}`);
    }
  }
  assert.deepEqual(offenders.slice(0, 5), []);

  // Control: the detector must still recognise the wording that shipped.
  assert.ok(UNSAFE[0].test('Keep Monday to Wednesday portions in the fridge and freeze later.'));
  assert.ok(UNSAFE[1].test('freeze later-week portions if you prefer fresher storage'));
});

test('batch plans state the two-day limit and treat freezing as a safety step', () => {
  const batch = getAllPlanMeta().find(m => getPlanBySlug(m.slug)?.prepPlan?.steps?.length);
  assert.ok(batch, 'expected at least one plan with a prep plan');
  const text = JSON.stringify(getPlanBySlug(batch.slug).prepPlan);
  assert.match(text, /within two days/i, 'the chilled limit has to be stated');
  assert.match(text, /not a freshness preference/i, 'freezing is a safety decision');
});

// ── Fixed calorie numbers must not assert an energy-balance state ───────────
//
// A kcal figure alone cannot tell anyone whether they are in a deficit; that
// depends on energy expenditure the site never asks for. The homepage shortcuts
// labelled 1,500 "Fat loss", 1,800 "Moderate deficit" and 2,000 "Maintenance or
// light deficit" regardless of who was reading.

function sourceFiles() {
  const roots = ['src/pages', 'src/components', 'src/data'];
  const out = [];
  for (const root of roots) {
    for (const entry of fs.readdirSync(root, { recursive: true, withFileTypes: true })) {
      if (entry.isFile() && /\.(?:js|jsx)$/.test(entry.name)) {
        out.push(`${entry.parentPath || entry.path}/${entry.name}`);
      }
    }
  }
  return out;
}

test('no surface ties an energy-balance state to a calorie number alone', () => {
  const UNQUALIFIED = /[0-9],?[0-9]{3}\s*(?:kcal|calories)?[^.<>]{0,45}?\b(?:moderate |light )?(?:calorie )?(?:deficit|surplus)\b/gi;
  const QUALIFIERS = /\b(?:TDEE|depends|expenditure|for many|for most|some|often|usually|typically|varies|rough guide|average|your own|individual|between|if you|may|can be)\b/i;

  const offenders = [];
  for (const file of sourceFiles()) {
    const text = fs.readFileSync(file, 'utf8');
    for (const match of text.matchAll(UNQUALIFIED)) {
      // A match running across a quote or newline is two unrelated fields
      // (a date next to an article title), not a sentence.
      if (/["'`\r\n]/.test(match[0])) continue;
      // Qualification usually sits in the sentence around the number, not
      // inside the fragment that matched.
      // A worked example states its TDEE once and then lists several lines
      // under it, so the qualification can sit well before the match.
      const from = Math.max(0, match.index - 700);
      if (QUALIFIERS.test(text.slice(from, match.index + match[0].length + 120))) continue;
      offenders.push(`${file}: "${match[0].trim()}"`);
    }
  }
  assert.deepEqual(offenders.slice(0, 6), []);
});

test('the energy-balance detector catches the labels that shipped (control)', () => {
  assert.ok(ASSERTS_PHYSIOLOGY.test('Moderate deficit'));
  assert.ok(ASSERTS_PHYSIOLOGY.test('a near-maintenance calorie target'));
  assert.ok(ASSERTS_PHYSIOLOGY.test('calories stay close to maintenance'));
  // Neutral descriptions of what a target is have to stay allowed, or the
  // invariant just deletes the useful part of the shortcut.
  assert.ok(!ASSERTS_PHYSIOLOGY.test('Lower target — most popular for weight loss'));
  assert.ok(!ASSERTS_PHYSIOLOGY.test('Higher target — usually chosen for muscle gain'));
});

// ── Active UI copy must not describe features the reader cannot see ─────────

test('plan copy only refers to sections the active renderer renders', () => {
  const source = fs.readFileSync('src/pages/PlanPage.jsx', 'utf8');
  assert.match(source, /const SHOW_LEGACY_PLAN_RENDERER = false;/,
    'this test assumes the legacy renderer is disabled');

  // "The swap section keeps the page usable..." is only honest while the swaps
  // section sits outside the disabled legacy block. If it is ever moved inside,
  // this fails and the copy has to change with it.
  const legacyStart = source.indexOf('SHOW_LEGACY_PLAN_RENDERER && (');
  const swapsAt = source.indexOf('plan-swaps-section');
  assert.ok(swapsAt > -1, 'the swaps section must exist for the copy to be honest');
  assert.ok(swapsAt > legacyStart, 'unexpected ordering');
});

// ── Accessory comparison headings ───────────────────────────────────────────

test('the quick-comparison heading does not repeat itself', () => {
  const component = fs.readFileSync('src/components/ProductPicks.jsx', 'utf8');
  // Titles like "Insulated meal prep bags to compare" met an appended
  // ": compare first" and rendered as "...To Compare: compare first".
  assert.doesNotMatch(component, /<h3>[^<]*: compare first/i,
    'the duplicative suffix is back in the heading');
  assert.match(component, /<h3>\{toTitleCase\(title\)\}<\/h3>/,
    'the descriptive title should stand on its own');
});

// ── Same-day lunch/dinner protein diversity ─────────────────────────────────
//
// Weekly repetition is fine and often deliberate — batch cooking, repeated
// breakfasts, ingredient reuse. What a reader notices as lazy is eating the
// same principal protein at both main meals on one day.
//
// The generator always had a hook for this (pickDinnerForLunch), but it asked
// planBuilder's own MAIN_PROTEIN_KW list, which contained eleven meat and fish
// words. Every vegan and vegetarian main meal answered "no protein", so the
// check short-circuited and did nothing on the diets with the smallest pools:
// 638 collisions across 393 plans. See scripts/protein-identity.test.js for the
// resolver this now depends on.

test('no plan serves the same principal protein at lunch and dinner on one day', () => {
  const offenders = [];
  let planDays = 0;
  for (const meta of getAllPlanMeta()) {
    const plan = getPlanBySlug(meta.slug);
    if (!plan) continue;
    for (const day of plan.plan || []) {
      planDays += 1;
      const lunch = (day.meals || []).find(m => /lunch/i.test(m.type));
      const dinner = (day.meals || []).find(m => /dinner/i.test(m.type));
      if (!lunch || !dinner) continue;
      const shared = sharedPrimaryProteins(mealRecord(lunch), mealRecord(dinner));
      if (shared.length) {
        offenders.push(`${meta.slug} ${day.day}: ${lunch.name} + ${dinner.name} both ${shared.join('/')}`);
      }
    }
  }
  assert.ok(planDays > 7000, `expected the whole corpus, got ${planDays} plan-days`);
  assert.deepEqual(offenders.slice(0, 8), []);
});

test('a restricted pool still offers enough proteins to alternate', () => {
  // The residual failures were three vegan high-protein plans whose entire
  // tagged dinner pool was three tofu dishes, so no arrangement of the week
  // could avoid tofu twice in a day. If a pool ever narrows like that again,
  // this catches it before the collision test does.
  const thin = [];
  for (const meta of getAllPlanMeta()) {
    const plan = getPlanBySlug(meta.slug);
    if (!plan) continue;
    const families = new Set();
    for (const day of plan.plan || []) {
      for (const meal of day.meals || []) {
        if (!/lunch|dinner/i.test(meal.type)) continue;
        for (const family of primaryProteinSignature(mealRecord(meal))) families.add(family);
      }
    }
    // Two is the real floor: you only need two proteins to alternate lunch and
    // dinner. Batch plans legitimately sit at two — repeated bases across the
    // week, cross-paired within each day — and carry no collisions.
    if (families.size < 2) thin.push(`${meta.slug}: only ${[...families].join(', ')}`);
  }
  assert.deepEqual(thin.slice(0, 5), []);
});

test('the collision detector reacts to a repeated protein (control)', () => {
  const meal = (name, ingredients) => ({ name, ingredients });
  // Positive: the exact shape that shipped on 393 plans.
  assert.deepEqual(
    sharedPrimaryProteins(
      meal('Baked Tofu and Tahini Buddha Bowl', ['Firm tofu 200g', 'Quinoa 80g dry']),
      meal('Tofu and Vegetable Curry with Brown Rice', ['Firm tofu 200g', 'Brown rice 80g dry']),
    ), ['tofu']);
  // Negative: a varied day must stay clean, and fish must not collapse to one.
  assert.deepEqual(
    sharedPrimaryProteins(
      meal('Tuna Salad', ['Tinned tuna 145g', 'Mixed leaves 80g']),
      meal('Salmon with New Potatoes', ['Salmon fillet 150g', 'New potatoes 250g']),
    ), []);
});

// ── Human realism: would a person actually shop, cook and eat this? ────────
//
// The contracts above ask whether a page delivers what it promises. These ask
// something blunter: whether the instruction is one a human could follow. Each
// defect below shipped, and each was technically valid — the nutrition was
// right, the ingredients were real, the steps parsed.

test('a food that arrives edible is never told to cook', () => {
  // Lean Beef Jerky: "Cook the lean beef jerky in a non-stick pan over medium
  // heat until cooked through." Jerky is cured and dried. The instruction was
  // reachable because the only guard was a two-name exception list.
  const offenders = [];
  for (const { name, meal } of allRecipes()) {
    const steps = buildPracticalRecipeSteps(meal);
    for (const ingredient of meal.ingredients || []) {
      if (!isReadyToEatIngredient(ingredient)) continue;
      const food = String(ingredient).replace(/\s*[\d.].*$/, '').trim().toLowerCase();
      if (!food) continue;
      const cooked = steps.some(step => (
        new RegExp(`cook the ${food}\b|cook ${food}\b.{0,40}until cooked through`, 'i').test(step)
      ));
      if (cooked) offenders.push(`${name}: ${food}`);
    }
  }
  assert.deepEqual(offenders.slice(0, 5), []);
});

test('the ready-to-eat resolver knows a cure from a cooking method (control)', () => {
  // "Smoked" is not a state. Two of these are eaten as they come and one still
  // needs a pan, so a substring rule on the word would have been worse than no
  // rule at all.
  assert.equal(isReadyToEatIngredient('Smoked salmon 100g'), true);
  assert.equal(isReadyToEatIngredient('Smoked mackerel fillet 130g'), true);
  assert.equal(isReadyToEatIngredient('Smoked haddock fillet 180g'), false);
  assert.equal(isReadyToEatIngredient('Smoked paprika 1 tsp'), false);
  assert.equal(isReadyToEatIngredient('Lean beef jerky 40g'), true);
  assert.equal(isReadyToEatIngredient('Chicken breast 200g'), false);
});

test('an oven is never preheated twice', () => {
  // "Roast the sweet potato at 200°C… Meanwhile, heat the oven to 200°C and
  // bake the cod." The oven was already hot. Component builders each knew
  // their own ingredient and nothing about the kitchen they shared.
  const offenders = [];
  for (const { name, meal } of allRecipes()) {
    const steps = buildPracticalRecipeSteps(meal);
    const preheats = steps.filter(step => /heat the oven to/i.test(step)).length;
    if (preheats > 1) offenders.push(`${name}: ${preheats} preheats`);
  }
  assert.deepEqual(offenders.slice(0, 5), []);
});

test('the appliance-state pass reacts to a duplicate preheat (control)', () => {
  // Same temperature: the second instruction goes, and the sentence it was
  // part of still reads.
  assert.deepEqual(
    resolveApplianceState([
      'Roast the potato at 200°C (180°C fan) until tender.',
      'Meanwhile, heat the oven to 200C/180C fan. Bake the cod for 15 minutes.',
    ]),
    [
      'Roast the potato at 200°C (180°C fan) until tender.',
      'Meanwhile, bake the cod for 15 minutes.',
    ],
  );
  // Different temperature: the oven is adjusted, not preheated from cold.
  const changed = resolveApplianceState([
    'Heat the oven to 200°C (180°C fan). Roast the vegetables.',
    'Heat the oven to 180°C (160°C fan). Bake the crumble.',
  ]);
  assert.match(changed[1], /^Turn the oven to 180°C/);
});

test('no method pads itself with a step that says nothing', () => {
  // Filler is not harmless. "Prepare the jerky as described in the ingredient
  // list" and "Add the remaining ingredients" existed to reach three steps,
  // and the shape they filled is what made frying a cured meat look normal.
  const FILLER = [
    /as described in the ingredient list/i,
    /\badd the remaining ingredients\b/i,
    /^have a bowl or lidded container ready/i,
    /\bcook until done\b/i,
  ];
  const offenders = [];
  for (const { name, meal } of allRecipes()) {
    for (const step of buildPracticalRecipeSteps(meal)) {
      if (FILLER.some(pattern => pattern.test(step))) offenders.push(`${name}: ${step}`);
    }
  }
  assert.deepEqual(offenders.slice(0, 5), []);
});

test('a method never asks for equipment most kitchens lack without an alternative', () => {
  const SPECIALIST = /\b(waffle iron|air fryer|food processor|slow cooker|pressure cooker|spiralizer|panini press)\b/i;
  const offenders = [];
  for (const { name, meal } of allRecipes()) {
    const steps = buildPracticalRecipeSteps(meal).join(' ');
    if (!SPECIALIST.test(steps)) continue;
    // An alternative has to actually be offered, not merely implied.
    if (!/\bno |without a |if you (?:do not|don't)|instead|alternatively\b/i.test(steps)) {
      offenders.push(name);
    }
  }
  assert.deepEqual(offenders.slice(0, 5), []);
});

test('the method protein resolver reads a source, not a cut (control)', () => {
  // The same failure the diversity resolver was rebuilt to eliminate was still
  // live in the resolver that drives cooking instructions, where it produced
  // advice rather than a mislabel: a mozzarella and tomato salad was fried,
  // because "beef tomato" answered "beef".
  assert.equal(findProtein('Beef tomato 1'), '');
  assert.equal(findProtein('Cauliflower steak 200g'), '');
  assert.equal(findProtein('Chicken stock 300ml'), '');
  assert.equal(findProtein('Quorn mince 200g'), 'quorn');
  assert.equal(findProtein('Tuna steak 150g'), 'tuna');
  assert.equal(findProtein('Turkey mince 200g'), 'turkey');
  // …and a real protein is still found beside a phrase that is not one.
  assert.equal(findProtein('Baked Cod with New Potatoes and Green Beans'), 'cod');
});
