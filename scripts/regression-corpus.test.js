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
//         generic wording. FIXED: needsCooking() is now state-aware
//         (ingredientRoles.js resolvePulseState) — a dry pulse is guaranteed
//         a place in the final "add X and simmer" sentence instead of being
//         excluded as "already handled", and a side accompaniment (bread
//         roll) is excluded from that same sentence and mentioned as a side
//         instead (see isPulseProtein / isSoupSideAccompaniment in
//         recipeQuality.js's curry/chilli/stew/soup branch).
test('[corpus] a dry-lentil soup names and cooks the lentils, and does not simmer the side bread roll', () => {
  const meal = mealById('butternut-squash-soup');
  const method = buildPracticalRecipeSteps(meal).join(' ');
  assert.match(method, /\blentil/i, 'the central named ingredient must appear in the method');
  assert.doesNotMatch(method, /simmer[^.]*\b(roll|bread)\b/i, 'the side bread roll must not be the object of a cooking instruction');
});

test('[corpus] "Lentil and Roasted Vegetable Soup" does not hide its lentils behind "the listed ingredients"', () => {
  const meal = mealById('lentil-roasted-veg-soup');
  const method = buildPracticalRecipeSteps(meal).join(' ');
  assert.doesNotMatch(method, /\bthe listed ingredients\b/i);
  assert.match(method, /\blentil/i);
});

// ── 6. Dry pulses need an adequate cooking instruction (not "warm gently"),
//        which needs real liquid + real simmering time to soften. FIXED:
//        the starch branch now gives a dry pulse an explicit
//        "simmer ... with enough water or stock to cover" instruction
//        instead of routing to the generic fallback.
test('[corpus] dry red lentils get a real cook/simmer instruction, not a "warm gently" pass-through', () => {
  const meal = mealById('lentil-dahl');
  const method = buildPracticalRecipeSteps(meal).join(' ');
  assert.doesNotMatch(method, /warm everything gently in a pan/i);
  assert.match(method, /simmer/i);
});

// ── Green Lentil and Roasted Sweet Potato Bowl — the salad/bowl branch's
//    direct cookProteinStep() call previously silently dropped a dry pulse
//    entirely (no drainTinnedStep fallback fires either, since there's no
//    "tinned" marker to catch). FIXED via cookProteinStep's dryPulse case.
test('[corpus] a dry-lentil bowl explicitly cooks and mentions the lentils, not silently', () => {
  const meal = mealById('lentil-sweet-potato-bowl');
  const method = buildPracticalRecipeSteps(meal).join(' ');
  assert.match(method, /\blentil/i);
  assert.match(method, /simmer/i);
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
// FIXED: cod, haddock, mackerel and sardine are now recognised protein
// families in ingredientRoles.js (PROTEIN_FAMILIES), and cookProteinStep's
// fish-instruction branch (already existed for salmon/mackerel/cod) now
// actually gets reached because `protein` resolves instead of staying ''.
test('[corpus] a baked cod/haddock dish gets an actual cooking instruction for the fish, not "warm gently"', () => {
  for (const id of ['baked-cod-new-potatoes', 'smoked-haddock-bake', 'cod-sweet-potato-chips']) {
    const meal = mealById(id);
    const method = buildPracticalRecipeSteps(meal).join(' ');
    assert.doesNotMatch(method, /warm everything gently in a pan/i, `${id} should not tell the user to just "warm" raw fish`);
    assert.match(method, /cook|opaque|flakes/i, `${id} should have an actual cooking instruction for the fish`);
  }
});

// ── 21. "Rice cakes" substring-collides with the starch keyword "rice",
//         so a 3-minute no-cook snack (rice cakes + cottage cheese, no
//         actual rice) gets told to "cook the rice" and "fold the cooked
//         rice through the pan". Same bug family as the earlier fixed
//         "Veggie"/egg collision, different word. NOT YET FIXED.
// FIXED: ingredientRoles.js's findStarch() excludes "rice cakes" (and
// "cauliflower rice") from matching the "rice" starch family.
test('[corpus] "rice cakes" (the snack) is not misread as containing the starch "rice"', () => {
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
// FIXED: the lettuce-cups branch now only uses the hot cooked-mince
// template when a mince-style protein (mince/turkey/beef/pork) is actually
// present; otherwise it uses a cold-assembly template (cook the protein if
// it needs it, cool, then combine — correct for a prawn cocktail).
test('[corpus] a cold prawn-cocktail lettuce cup is not put through the hot cooked-mince lettuce-cups method', () => {
  const meal = mealById('prawn-cocktail');
  const method = buildPracticalRecipeSteps(meal).join(' ');
  assert.doesNotMatch(method, /hot through/i, 'a cold prawn cocktail should not be instructed to heat the mayo dressing');
  assert.doesNotMatch(method, /breaking it up/i, 'mince-style language should not apply to whole prawns');
});

// ── New findings from the post-fix audit sweep (2026-08) — precisely
//    diagnosed, but NOT fixed in this phase (out of the approved (a)-(d)
//    scope). Kept as regression cases for the next quality phase.

// "Lean Beef Mince Lettuce Wraps" (a literal lettuce leaf wrap, no bread)
// matches the toast/bagel/wrap/sandwich branch purely because its name
// contains "wraps" — the same class of bug as the lettuce-cups mismatch,
// a different instance. `carriers` (bread/wrap/tortilla) is then empty, so
// step one falls back to "Toast or warm the listed ingredients" — nothing
// is actually toasted or warmed.
test('[corpus] a lettuce-wrap dish (no bread/tortilla) is not sent through the toast/wrap branch\'s "toast or warm" opening step', { todo: 'newly diagnosed 2026-08 — toast/wrap branch triggers on the word "wrap" in the name regardless of whether a literal wrap/tortilla ingredient is present; out of scope for the (a)-(d) fix, needs its own approval' }, () => {
  const meal = mealById('beef-lettuce-wraps');
  const method = buildPracticalRecipeSteps(meal).join(' ');
  assert.doesNotMatch(method, /toast or warm the listed ingredients/i);
});

// "Wholemeal Pancakes with Low-Fat Yogurt" and "Protein Waffles with Greek
// Yogurt" match the yogurt/cereal branch (checked before the pancake
// branch) purely because "yogurt" is in the name — so raw eggs and flour
// are "topped" onto a cold yogurt bowl instead of being whisked into a
// batter and cooked. More serious than a wording quality issue: raw egg is
// never cooked.
test('[corpus] a pancake/waffle dish is not routed through the yogurt-bowl branch just because "yogurt" is in its name', { todo: 'newly diagnosed 2026-08 — yogurt/cereal branch is checked before the pancake branch and matches on the word "yogurt" alone; raw eggs end up "topped" on a cold bowl rather than cooked; out of scope for the (a)-(d) fix, needs its own approval (food-safety adjacent — should be prioritised)' }, () => {
  for (const id of ['wholemeal-pancakes', 'protein-waffles-yogurt']) {
    const meal = mealById(id);
    const method = buildPracticalRecipeSteps(meal).join(' ');
    assert.doesNotMatch(method, /top with[^.]*\beggs?\b/i, `${id}: raw egg should never be "topped" on a cold dish`);
  }
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
  // Baseline recorded 2026-08-14: 16 of 169 shared meals (before the
  // pulse/protein/starch/lettuce-cups fixes). Re-measured 2026-08-14 after
  // those fixes: 7 (tuna-pasta-bake, mushroom-lentil-shepherds-pie,
  // spinach-ricotta-pasta, beef-lettuce-wraps, beef-sweet-potato-stew,
  // chicken-coconut-curry, mushroom-pea-risotto) — all confirmed either
  // genuinely coherent (a tinned/pre-cooked combination that legitimately
  // just needs warming through) or a *different*, precisely-diagnosed,
  // out-of-scope issue tracked separately above. This assertion is a
  // ceiling, not a target — generic language is not itself the defect (see
  // the audit report), so it should only go down as further diagnosed gaps
  // are fixed, not be driven to zero for its own sake.
  assert.ok(affected.length <= 7, `expected at most 7 shared meals still using a generic fallback phrase, found ${affected.length}: ${affected.map(m => m.id).join(', ')}`);
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
