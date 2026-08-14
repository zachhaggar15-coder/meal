// Permanent regression corpus — one case per real issue found during the
// meal-plan practicality/QA audits (2026-08). Every future change to
// planBuilder.js, recipeQuality.js, cookingQuantities.js or the meal
// library should run against this file. Fixed issues assert the fix
// directly; issues found but not yet fixed are declared with node:test's
// `{ todo: true }` so they run, are visible in output, and do not block
// the suite — flipping a todo to a normal passing test is the signal that
// a fix landed. Cases already covered in depth by a dedicated test file are
// noted rather than duplicated at length.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { MEALS } from '../src/data/mealLibrary.js';
import { mealPlansData } from '../src/data/mealPlans.js';
import { INDEXABLE_PLAN_SEEDS } from '../src/data/planSeeds.js';
import { buildPlanDays, buildShoppingList } from '../src/utils/planBuilder.js';
import { buildPracticalRecipeSteps, resolvePotatoPreparation, validateRecipeQuality } from '../src/utils/recipeQuality.js';

function mealById(id) {
  const meal = MEALS.find(item => item.id === id);
  assert.ok(meal, `regression corpus expects a meal with id "${id}" to still exist`);
  return meal;
}

// ── 1. Jacket-potato preparation contradiction ─────────────────────────────
// Also covered in scripts/cooking-quantities.test.js ("raw, boiled, roast
// and mashed potato intentions produce distinct methods").
test('[corpus] a declared potato preparation never gets a contradictory cooking instruction', () => {
  const state = resolvePotatoPreparation({ name: 'Jacket Potato', ingredients: ['Potato 1 baked'] });
  assert.equal(state.state, 'baked');
  assert.ok(state.declared);
});

// ── 2. Tuna Niçoise invented potato ─────────────────────────────────────────
// Also covered in "Niçoise methods only prepare ingredients that are
// actually listed" (cooking-quantities.test.js).
test('[corpus] Nicoise method never mentions potato when none is in the ingredient list', () => {
  const method = buildPracticalRecipeSteps({
    name: 'Tuna Nicoise Salad',
    ingredients: ['Tinned tuna 145g', 'Eggs 1', 'Green beans 80g', 'Cherry tomatoes 100g', 'Olives 10g'],
  }).join(' ');
  assert.doesNotMatch(method, /\bpotato(?:es)?\b/i);
});

// ── 3/4. Veggie/egg substring collision + sirloin/beef alias issue ─────────
// Also covered in "meal-name matching is boundary-aware and recognises
// common beef aliases" (cooking-quantities.test.js).
test('[corpus] "Veggie" sticks does not collide with the egg-dish branch, and "sirloin" resolves as beef', () => {
  const veggieMethod = buildPracticalRecipeSteps({
    name: 'Hummus & Veggie Sticks',
    ingredients: ['Hummus 40g', 'Carrot sticks 100g', 'Cucumber 100g'],
  }).join(' ');
  assert.doesNotMatch(veggieMethod, /\beggs?\b|scramble|omelette/i);

  const steakRecipe = buildPracticalRecipeSteps({
    name: 'Grilled Lean Beef Steak with Roasted Veg',
    ingredients: ['Lean sirloin steak 150g', 'Roasted veg 200g'],
  });
  assert.match(steakRecipe.join(' '), /sirloin steak/i);
});

// ── 5/7. Lentil soup simmers a bread roll; central lentils hidden by
//         generic wording (root cause: needsCooking() treats 'lentils' and
//         'beans' as never needing cooking, regardless of dry vs tinned —
//         see recipeQuality.js needsCooking()). NOT YET FIXED.
test('[corpus] a dry-lentil soup names and cooks the lentils, and does not simmer the side bread roll', { todo: 'root cause identified — needsCooking() excludes lentils/beans unconditionally; see audit report' }, () => {
  const meal = mealById('butternut-squash-soup');
  const method = buildPracticalRecipeSteps(meal).join(' ');
  assert.match(method, /\blentil/i, 'the central named ingredient must appear in the method');
  assert.doesNotMatch(method, /simmer[^.]*\b(roll|bread)\b/i, 'the side bread roll must not be the object of a cooking instruction');
});

test('[corpus] "Lentil and Roasted Vegetable Soup" does not hide its lentils behind "the listed ingredients"', { todo: 'root cause identified — see audit report' }, () => {
  const meal = mealById('lentil-roasted-veg-soup');
  const method = buildPracticalRecipeSteps(meal).join(' ');
  assert.doesNotMatch(method, /\bthe listed ingredients\b/i);
  assert.match(method, /\blentil/i);
});

// ── 6. Dry pulses need an adequate cooking instruction (not "warm gently"),
//        which needs real liquid + real simmering time to soften. NOT YET FIXED.
test('[corpus] dry red lentils get a real cook/simmer instruction, not a "warm gently" pass-through', { todo: 'root cause identified — see audit report' }, () => {
  const meal = mealById('lentil-dahl');
  const method = buildPracticalRecipeSteps(meal).join(' ');
  assert.doesNotMatch(method, /warm everything gently in a pan/i);
});

// ── 8. Cooking spray treated as a serving ingredient (FIXED) ───────────────
test('[corpus] cooking spray is never listed as something the dish is "served with"', () => {
  const method = buildPracticalRecipeSteps({
    name: 'Egg White Omelette with Peppers',
    ingredients: [
      'Egg whites 6', 'Mixed peppers 100g', 'Onion half',
      'Olive oil spray, optional light coating (excluded from nutrition estimate)', 'Mixed herbs 1 tsp',
    ],
  }).join(' ');
  assert.doesNotMatch(method, /spray/i);
});

// ── 9. Duplicate spring-onion use in Turkey Lettuce Cups (FIXED) ──────────
test('[corpus] spring onion is introduced once in Turkey Lettuce Cups, not once as an aromatic and once as a filling', () => {
  const steps = buildPracticalRecipeSteps({
    name: 'Turkey Mince Lettuce Cups with Hoisin',
    ingredients: [
      'Turkey mince lean 229g', 'Romaine lettuce leaves 5', 'Spring onion 2.5',
      'Hoisin sauce 25g', 'Sesame seeds 1.25 tsp', 'Carrot grated 64g',
    ],
  });
  const cookStep = steps.find(step => /^Cook the/i.test(step));
  assert.doesNotMatch(cookStep, /spring onion/i);
});

// ── 10. Peanut butter / pea classification (FIXED, pre-existing) ──────────
test('[corpus] peanut butter and peas classify correctly and never bleed into each other\'s category', () => {
  const shopping = buildShoppingList([{ meals: [{ ingredients: ['Peanut butter 20g', 'Peas 80g', 'Peanut 20g'] }] }]);
  assert.ok(shopping.condiments.some(item => /peanut butter/i.test(item)));
  assert.ok(shopping.vegetables.some(item => /^Peas\b/i.test(item)));
  assert.ok(!shopping.vegetables.some(item => /peanut/i.test(item)));
});

// ── 11. Duplicate peanut-butter shopping lines across units (FIXED — same
//         tsp/tbsp merge mechanism as the olive-oil fix) ──────────────────
test('[corpus] peanut butter stated in tsp in one recipe and tbsp in another merges into one shopping line', () => {
  const shopping = buildShoppingList([{ meals: [{ ingredients: ['Peanut butter 1 tsp'] }, { ingredients: ['Peanut butter 1 tbsp'] }] }]);
  const all = Object.values(shopping).flat();
  assert.equal(all.filter(item => /^Peanut butter\b/i.test(item)).length, 1);
});

// ── 12/13. Duplicate cherry-tomato and olive-oil representations (FIXED) ──
test('[corpus] cherry tomatoes (grams vs count) and olive oil (tsp vs tbsp) each collapse to one shopping line', () => {
  const shopping = buildShoppingList([{ meals: [{ ingredients: ['Cherry tomatoes 200g', 'Cherry tomatoes 10', 'Olive oil 1 tsp', 'Olive oil 1 tbsp'] }] }]);
  const all = Object.values(shopping).flat();
  assert.equal(all.filter(item => /^Cherry tomatoes\b/i.test(item)).length, 1);
  assert.equal(all.filter(item => /^Olive oil\b/i.test(item)).length, 1);
});

// ── 14. Vague "light dressing" in a legacy editorial plan (NOT YET FIXED) ──
// Root cause: hand-authored mealPlans.js has `desc: "...light Caesar
// dressing..."` but `portion_size: "...20ml light dressing"` — the specific
// name exists in the same record but was never propagated to the
// ingredient string used for shopping/nutrition. Low blast radius (1
// occurrence) — a legacy-data hygiene issue, not a generator bug.
test('[corpus] a dressing already named specifically in the description is not shopped for under a vague generic name', { todo: 'confirmed in mealPlans.js Wednesday Grilled Chicken Caesar Salad — desc says "light Caesar dressing", portion_size says "20ml light dressing"' }, () => {
  const plan = Object.values(mealPlansData).find(item => (item.plan || []).some(day => (day.meals || []).some(meal => /caesar/i.test(meal.desc || ''))));
  const meal = plan?.plan.flatMap(day => day.meals).find(item => /caesar/i.test(item.desc || ''));
  assert.ok(meal, 'expected to find the Caesar salad meal this case documents');
  assert.doesNotMatch(meal.portion_size || '', /\blight dressing\b/i, 'portion_size should name the same dressing as desc, not a generic fallback');
});

// ── 15/16. Black pepper / green beans shopping-category errors (FIXED) ────
test('[corpus] black pepper files under Herbs & Spices and green beans under Vegetables', () => {
  const shopping = buildShoppingList([{ meals: [{ ingredients: ['Black pepper, to taste', 'Green beans 100g'] }] }]);
  assert.ok(shopping.herbs.some(item => /black pepper/i.test(item)));
  assert.ok(shopping.vegetables.some(item => /green beans/i.test(item)));
});

// ── 17. Extreme egg-white accumulation shown as a bare item count (FIXED) ─
test('[corpus] egg whites are shopped for by weight, never as a bare whole-item count', () => {
  const shopping = buildShoppingList([{ meals: [{ ingredients: ['Egg whites 6'] }, { ingredients: ['Egg whites 6'] }] }]);
  const all = Object.values(shopping).flat();
  assert.ok(all.some(item => /^Egg whites \d+g/i.test(item)));
});

// ── 18. Misleading "All diets" plan label (FIXED) ──────────────────────────
test('[corpus] the standard-diet plan label is not rendered as the misleading "All diets"', () => {
  const source = fs.readFileSync(new URL('../src/pages/PlanPage.jsx', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /'All diets'/);
  assert.match(source, /No specific dietary restriction/);
});

// ── 19. Unrealistic container recommendation (intentionally NOT fixed —
//         pending a separate approved model; the detector staying accurate
//         is what this locks in) ──────────────────────────────────────────
test('[corpus] the container-count-outlier detector still flags the known 23-container Aldi plan', async () => {
  const { assessPlanLocally, hydratePlanForQa, buildPlanInventory } = await import('./lib/semanticPlanQa.js');
  const candidate = buildPlanInventory().find(item => item.planId === 'aldi-high-protein-low-cal-1500');
  const review = assessPlanLocally(hydratePlanForQa(candidate), new Date());
  assert.ok(review.findings.some(item => item.patternKey === 'container-count-outlier'));
});

// ── 20. Undercooked fish: proteinCandidates/INGREDIENT_ALIASES in
//         recipeQuality.js has no entry for cod, haddock or mackerel, so a
//         cod/haddock dish with a starch side gets no cooking instruction
//         at all for the fish — "warm everything gently in a pan" applied
//         to a raw fillet. More serious than the lentil cases (food-safety
//         adjacent, not just vague wording). Same root-cause family
//         (protein/ingredient-role recognition is an incomplete keyword
//         list) as the lentil issues above. NOT YET FIXED.
test('[corpus] a baked cod/haddock dish gets an actual cooking instruction for the fish, not "warm gently"', { todo: 'root cause identified — cod/haddock/mackerel missing from recipeQuality.js proteinCandidates; see audit report' }, () => {
  for (const id of ['baked-cod-new-potatoes', 'smoked-haddock-bake', 'cod-sweet-potato-chips']) {
    const meal = mealById(id);
    const method = buildPracticalRecipeSteps(meal).join(' ');
    assert.doesNotMatch(method, /warm everything gently in a pan/i, `${id} should not tell the user to just "warm" raw fish`);
  }
});

// ── 21. "Rice cakes" substring-collides with the starch keyword "rice",
//         so a 3-minute no-cook snack (rice cakes + cottage cheese, no
//         actual rice) gets told to "cook the rice" and "fold the cooked
//         rice through the pan". Same bug family as the earlier fixed
//         "Veggie"/egg collision, different word. NOT YET FIXED.
test('[corpus] "rice cakes" (the snack) is not misread as containing the starch "rice"', { todo: 'root cause identified — findIngredient() starch matching treats "rice cakes" as containing "rice"; see audit report' }, () => {
  for (const id of ['rice-cakes-cottage-cheese', 'peanut-butter-banana']) {
    const meal = mealById(id);
    const method = buildPracticalRecipeSteps(meal).join(' ');
    assert.doesNotMatch(method, /cook the rice\b/i, `${id} has no loose rice to cook, only rice cakes`);
  }
});

// ── 22. Meal-name branch selection mismatch: "Prawn Cocktail in Lettuce
//         Cups" is a cold, no-cook, mayo-dressed dish (3-8 min prep, snack
//         type), but the method generator selects its branch purely from
//         the meal name containing "lettuce cups" — the same branch built
//         for hot cooked-mince fillings (Turkey Mince Lettuce Cups) — so it
//         instructs "cook"-ing the prawns further and heating the mayo
//         "until hot through". NOT YET FIXED.
test('[corpus] a cold prawn-cocktail lettuce cup is not put through the hot cooked-mince lettuce-cups method', { todo: 'root cause identified — lettuce-cups branch assumes a hot cooked filling regardless of dish; see audit report' }, () => {
  const meal = mealById('prawn-cocktail');
  const method = buildPracticalRecipeSteps(meal).join(' ');
  assert.doesNotMatch(method, /hot through/i, 'a cold prawn cocktail should not be instructed to heat the mayo dressing');
});

// ── Whole-library sweep: how many shared meals currently rely on a generic
//    fallback phrase, so this number is visible and trackable over time
//    rather than only discoverable by manual inspection. ──────────────────
test('[corpus] generic-fallback usage across the shared meal library is tracked, not silently growing', () => {
  const GENERIC_PATTERNS = [/\bthe listed ingredients\b/i, /\bwarm everything gently in a pan\b/i];
  const affected = MEALS.filter(meal => {
    const method = buildPracticalRecipeSteps(meal).join(' ');
    return GENERIC_PATTERNS.some(pattern => pattern.test(method));
  });
  // Baseline recorded 2026-08-14: 16 of 169 shared meals hit one of these
  // two phrases (cod/haddock dishes with no recognised protein, and
  // lentil/bean dishes whose needsCooking() special-case fires). This
  // assertion is a ceiling, not a target — it should only go down as the
  // protein-role and pulse-cooking gaps described in the audit are fixed.
  assert.ok(affected.length <= 16, `expected at most 16 shared meals still using a generic fallback phrase, found ${affected.length}: ${affected.map(m => m.id).join(', ')}`);
});

test('[corpus] deterministic recipe-quality gate and full-library nutrition/plan sanity remain green', () => {
  for (const meal of MEALS) {
    const recipe = buildPracticalRecipeSteps(meal);
    const issues = validateRecipeQuality({ ...meal, recipe });
    assert.deepEqual(issues.filter(item => (
      item === 'placeholder language' || item === 'missing cooking method' || item === 'ingredient missing quantity'
    )), [], `${meal.id} has a blocking recipe-quality issue`);
  }
  assert.ok(INDEXABLE_PLAN_SEEDS.length > 0);
  const sampleSeed = INDEXABLE_PLAN_SEEDS.find(seed => seed.slug === 'aldi-high-protein-low-cal-1500');
  assert.ok(buildPlanDays(sampleSeed).plan.length === 7);
});
