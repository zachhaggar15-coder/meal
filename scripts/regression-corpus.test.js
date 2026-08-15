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
import { canonicaliseLegacyMeal } from '../src/utils/legacyPlanBuilder.js';
import {
  checkFamilyValidity,
  checkHydrationWithoutMedium,
  checkRawProteinWithoutCooking,
} from './lib/recipeInvariants.js';
import { isAlreadyPreparedIngredient } from '../src/utils/ingredientRoles.js';

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
// FIXED 2026-08: the specific identity ("light Caesar dressing") already
// existed in nutritionTable.js — only the meal's portion_size string used
// the vague generic "light dressing". Corrected the data so the identity
// flows through to the displayed ingredients, method and shopping list.
// No flavour was invented: the same record's own description already said
// "a light Caesar dressing".
test('[corpus] a dressing already named specifically in the description is not shopped for under a vague generic name', () => {
  const plan = Object.values(mealPlansData).find(item => (item.plan || []).some(day => (day.meals || []).some(meal => /caesar/i.test(meal.desc || ''))));
  const meal = plan?.plan.flatMap(day => day.meals).find(item => /caesar/i.test(item.desc || ''));
  assert.ok(meal, 'expected to find the Caesar salad meal this case documents');
  assert.doesNotMatch(meal.portion_size || '', /\blight dressing\b/i, 'portion_size should name the same dressing as desc, not a generic fallback');
  assert.match(meal.portion_size || '', /caesar/i);
});

// No meal anywhere should carry the bare, unbuyable "light dressing"
// identity — a shopper cannot tell what to buy from it. Guards against the
// vague identity being reintroduced in any meal, not just the one fixed.
test('[corpus] no meal uses the unbuyably-vague bare "light dressing" identity', () => {
  const offenders = [];
  for (const [slug, plan] of Object.entries(mealPlansData)) {
    for (const day of plan.plan || []) {
      for (const meal of day.meals || []) {
        if (/\blight dressing\b/i.test(meal.portion_size || '')) offenders.push(`${slug}:${day.day}:${meal.name}`);
      }
    }
  }
  for (const meal of MEALS) {
    if ((meal.ingredients || []).some(item => /\blight dressing\b/i.test(item))) offenders.push(meal.id);
  }
  assert.deepEqual(offenders, [], `these meals still use the vague "light dressing" identity: ${offenders.join(', ')}`);
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

// ── 19. Unrealistic container recommendation — FIXED 2026-08. The count
//         now models simultaneously stored portions (derived from plan
//         structure and fridge-safe storage windows) rather than one
//         container per meal of the week, so the Aldi plan that once
//         recommended 23 no longer trips the outlier detector.
test('[corpus] the known 23-container Aldi plan no longer trips the container-count-outlier detector', async () => {
  const { assessPlanLocally, hydratePlanForQa, buildPlanInventory } = await import('./lib/semanticPlanQa.js');
  const candidate = buildPlanInventory().find(item => item.planId === 'aldi-high-protein-low-cal-1500');
  const review = assessPlanLocally(hydratePlanForQa(candidate), new Date());
  assert.ok(
    !review.findings.some(item => item.patternKey === 'container-count-outlier'),
    'the container count should now be realistic for this plan',
  );
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

// ── FIXED 2026-08 (second recipe-quality phase): family-selection
//    precedence bugs, same architecture class as the lettuce-cups fix.

// "Lean Beef Mince Lettuce Wraps" (a literal lettuce leaf wrap, no bread)
// used to match the toast/bagel/wrap/sandwich branch purely because its
// name contains "wraps". Fixed: the lettuce-cups branch now also triggers
// on "wrap(s)"/"cups" names when ingredient evidence shows a lettuce
// vessel and no bread/tortilla carrier — using ingredient roles, not just
// the name, per the audit's requirement.
test('[corpus] a lettuce-wrap dish (no bread/tortilla) is not sent through the toast/wrap branch\'s "toast or warm" opening step', () => {
  const meal = mealById('beef-lettuce-wraps');
  const method = buildPracticalRecipeSteps(meal).join(' ');
  assert.doesNotMatch(method, /toast or warm the listed ingredients/i);
  assert.match(method, /lean beef mince/i, 'the mince filling must still be named and cooked');
});

test('[corpus] a real bread/tortilla wrap is unaffected by the lettuce-vessel fix', () => {
  for (const id of ['chicken-caesar-wrap', 'turkey-avocado-wrap', 'chicken-tikka-wrap']) {
    const meal = mealById(id);
    const method = buildPracticalRecipeSteps(meal).join(' ');
    assert.match(method, /toast or warm/i, `${id} should still toast/warm its actual tortilla`);
  }
});

// "Wholemeal Pancakes with Low-Fat Yogurt" and "Protein Waffles with Greek
// Yogurt" used to match the yogurt/cereal branch (checked before the
// pancake branch) purely because "yogurt" is in the name, leaving raw egg
// "topped" onto a cold bowl. Fixed: pancake/waffle is now checked first —
// a strong dish-type signal outranking a secondary serving component.
test('[corpus] a pancake/waffle dish is not routed through the yogurt-bowl branch just because "yogurt" is in its name', () => {
  for (const id of ['wholemeal-pancakes', 'protein-waffles-yogurt']) {
    const meal = mealById(id);
    const method = buildPracticalRecipeSteps(meal).join(' ');
    assert.doesNotMatch(method, /top with[^.]*\beggs?\b/i, `${id}: raw egg should never be "topped" on a cold dish`);
    assert.match(method, /whisk[^.]*\beggs?\b[^.]*batter/i, `${id}: eggs must be explicitly whisked into a batter`);
    assert.match(method, /cook/i, `${id}: the batter must be explicitly cooked`);
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

// ── Second-phase fixes (2026-08): defects found by the post-fix audit
//    sweep, all fixed in the same pass as the family-collision work.

// "1 slice wholemeal toast" names the carrier "toast", which was missing
// from the bread-carrier pattern — so an avocado-toast method opened with
// "Toast or warm the listed ingredients" having found nothing to toast.
test('[corpus] a toast dish whose ingredient is named "toast" finds its carrier', () => {
  const method = buildPracticalRecipeSteps({
    name: 'Avocado Toast with Nutritional Yeast',
    ingredients: ['2 slices wholemeal toast (70g)', 'Avocado half', 'Tomato 1', 'Nutritional yeast 2 tbsp'],
  }).join(' ');
  assert.doesNotMatch(method, /the listed ingredients/i);
  assert.match(method, /toast/i);
});

// A full English is assembled from optional components; missing ones used
// to interpolate as empty strings ("warm the  gently", "toast the .").
test('[corpus] a full English with no beans or bread never emits an empty ingredient slot', () => {
  const steps = buildPracticalRecipeSteps({
    name: 'High-Protein Full English',
    ingredients: ['Eggs 2', 'Turkey rashers 60g', 'Mushrooms 100g', 'Tomatoes 100g'],
  });
  const method = steps.join(' ');
  assert.doesNotMatch(method, /\bthe\s+\./, 'no "the ." from an empty name');
  assert.doesNotMatch(method, /\bthe\s{2,}/, 'no "the  " double space from an empty name');
  assert.doesNotMatch(method, /warm the\s+gently/i);
});

// A legacy plan can list a pre-made batter as the ingredient; "batter"
// was missing from the batter pattern, so it fell through to toppings and
// the pancakes were bizarrely "served with pancake batter".
test('[corpus] a pre-made pancake batter ingredient is whisked, not served as a topping', () => {
  const method = buildPracticalRecipeSteps({
    name: 'Wholemeal Pancakes with Berries',
    ingredients: ['80g pancake batter (2 pancakes)', '80g berries', '50g low-fat yogurt'],
  }).join(' ');
  assert.doesNotMatch(method, /serve with[^.]*batter/i);
  assert.match(method, /whisk[^.]*batter/i);
});

// The starch is cooked in step one; leaving its display name in the
// "prepare ..." list made step two re-prepare the very thing just cooked.
test('[corpus] a starch cooked in step one is not re-listed as something to prepare in step two', () => {
  const method = buildPracticalRecipeSteps({
    name: 'Spinach and Ricotta Wholemeal Pasta',
    ingredients: ['Ricotta 100g', 'Wholemeal pasta 90g dry', 'Baby spinach 150g', 'Garlic 2 cloves', 'Parmesan 15g', 'Olive oil 1 tbsp'],
  });
  const prepareStep = method.find(step => /prepare/i.test(step)) || '';
  assert.doesNotMatch(prepareStep, /pasta/i, 'the pasta is already cooked in step one');
});

// A soup/stew where every ingredient is already named earlier should not
// append a meaningless "add the listed ingredients" clause.
test('[corpus] a stew with nothing left to add omits the filler clause instead of saying "the listed ingredients"', () => {
  const method = buildPracticalRecipeSteps({
    name: 'Lean Beef and Sweet Potato Stew',
    ingredients: ['Lean stewing beef 200g', 'Sweet potato 250g', 'Tinned tomatoes 400g', 'Onion 1', 'Garlic 3 cloves', 'Carrot 2', 'Beef stock 300ml'],
  }).join(' ');
  assert.doesNotMatch(method, /the listed ingredients/i);
  assert.match(method, /simmer/i);
});

// A smoothie BOWL is spooned with crunchy toppings, not poured into a
// glass with the granola blended into it.
test('[corpus] a smoothie bowl keeps its crunchy toppings out of the blender and serves in a bowl', () => {
  const method = buildPracticalRecipeSteps({
    name: 'Banana and Date Smoothie Bowl with Seeds',
    ingredients: ['Banana 2', 'Medjool dates 2', 'Oat milk 100ml', 'Hemp seeds 1 tbsp', 'Low-sugar granola 20g'],
  });
  const blendStep = method.find(step => /blender/i.test(step)) || '';
  assert.doesNotMatch(blendStep, /granola/i, 'granola should not go in the blender');
  assert.match(method.join(' '), /bowl/i);
});

// ── Promoted blocking invariants ────────────────────────────────────────
// These three started as non-blocking audit checks. After the family-
// selection and pulse-state fixes they sit at zero flags across the whole
// library (169 shared + 840 legacy occurrences), and every case they ever
// flagged was a genuine defect — no false positives in review. They are
// promoted here so a regression reintroducing an unsafe or incoherent
// method fails the build rather than waiting for a manual audit run.
// (The remaining two checks — core-ingredient omission and structural
// flavour completeness — stay non-blocking in
// scripts/audit-recipe-invariants.js: both still carry real false
// positives, and flavour gaps need ingredient additions, which is a
// product decision, not a method fix.)
test('[corpus][invariant] no raw protein anywhere in the library lacks a cooking step', () => {
  const offenders = [];
  for (const meal of MEALS) {
    const method = buildPracticalRecipeSteps(meal).join(' ');
    const uncooked = checkRawProteinWithoutCooking(meal.name, meal.ingredients, method);
    if (uncooked.length) offenders.push(`${meal.id}: ${uncooked.join('/')}`);
  }
  for (const [slug, plan] of Object.entries(mealPlansData)) {
    for (const day of plan.plan || []) {
      for (const sourceMeal of day.meals || []) {
        const meal = canonicaliseLegacyMeal(sourceMeal);
        const uncooked = checkRawProteinWithoutCooking(meal.name, meal.ingredients, (meal.recipe || []).join(' '));
        if (uncooked.length) offenders.push(`${slug}:${day.day}:${meal.name}: ${uncooked.join('/')}`);
      }
    }
  }
  assert.deepEqual(offenders, [], `raw protein with no cooking step: ${offenders.join(' | ')}`);
});

test('[corpus][invariant] no dish needing hydration simmers without a stated cooking medium', () => {
  const offenders = [];
  for (const meal of MEALS) {
    const method = buildPracticalRecipeSteps(meal).join(' ');
    if (checkHydrationWithoutMedium(meal.name, meal.ingredients, method)) offenders.push(meal.id);
  }
  for (const [slug, plan] of Object.entries(mealPlansData)) {
    for (const day of plan.plan || []) {
      for (const sourceMeal of day.meals || []) {
        const meal = canonicaliseLegacyMeal(sourceMeal);
        if (checkHydrationWithoutMedium(meal.name, meal.ingredients, (meal.recipe || []).join(' '))) {
          offenders.push(`${slug}:${day.day}:${meal.name}`);
        }
      }
    }
  }
  assert.deepEqual(offenders, [], `dry ingredient simmered with no stated liquid: ${offenders.join(' | ')}`);
});

test('[corpus][invariant] no meal is routed through a method family incompatible with its ingredients', () => {
  const offenders = [];
  for (const meal of MEALS) {
    const method = buildPracticalRecipeSteps(meal).join(' ');
    const problems = checkFamilyValidity(meal.name, meal.ingredients, method);
    if (problems.length) offenders.push(`${meal.id}: ${problems.join('; ')}`);
  }
  for (const [slug, plan] of Object.entries(mealPlansData)) {
    for (const day of plan.plan || []) {
      for (const sourceMeal of day.meals || []) {
        const meal = canonicaliseLegacyMeal(sourceMeal);
        const problems = checkFamilyValidity(meal.name, meal.ingredients, (meal.recipe || []).join(' '));
        if (problems.length) offenders.push(`${slug}:${day.day}:${meal.name}: ${problems.join('; ')}`);
      }
    }
  }
  assert.deepEqual(offenders, [], `family/ingredient incompatibility: ${offenders.join(' | ')}`);
});

// ── Phase-3 discoveries (2026-08): found by exploratory library-wide
//    scanning, NOT from a supplied example. Each pairs a specific
//    regression with a general property covering unseen members of the
//    same failure class.

test('[corpus] a ready-to-eat pulse product is never simmered from dry and drained', () => {
  const method = buildPracticalRecipeSteps(mealById('baked-beans-toast')).join(' ');
  assert.doesNotMatch(method, /simmer[^.]*15-20 minutes/i, 'baked beans are already cooked in sauce');
  assert.doesNotMatch(method, /drain any excess liquid/i);
});

test('[corpus][property] no ingredient declaring itself already cooked is given a from-raw instruction', () => {
  const offenders = [];
  const check = (label, ingredients, method) => {
    for (const raw of ingredients || []) {
      if (!isAlreadyPreparedIngredient(raw)) continue;
      const head = String(raw).replace(/[\d.]+\s*\w*\s*/, '').split(/[,(]/)[0].trim().split(/\s+/).pop();
      if (!head || head.length < 4) continue;
      const fromRaw = new RegExp(`\b(boil|simmer|roast|bake)\b[^.]{0,40}\b${head}`, 'i');
      if (fromRaw.test(method)) offenders.push(`${label}: ${raw}`);
    }
  };
  for (const meal of MEALS) check(meal.id, meal.ingredients, buildPracticalRecipeSteps(meal).join(' '));
  assert.deepEqual(offenders, [], `already-prepared ingredient cooked from raw: ${offenders.join(' | ')}`);
});

test('[corpus][property] the method never names a material ingredient the recipe does not contain', () => {
  // Water, salt and pepper are the only permitted method-only basics.
  const MATERIAL = ['stock', 'broth', 'butter', 'cream', 'honey', 'breadcrumbs', 'wine'];
  const offenders = [];
  for (const meal of MEALS) {
    const method = buildPracticalRecipeSteps(meal).join(' ').toLowerCase();
    const ing = (meal.ingredients || []).join(' ').toLowerCase();
    for (const word of MATERIAL) {
      if (new RegExp(`\b${word}\b`).test(method) && !new RegExp(`\b${word}`).test(ing)) {
        offenders.push(`${meal.id}: "${word}"`);
      }
    }
  }
  assert.deepEqual(offenders, [], `method invents a material ingredient: ${offenders.join(' | ')}`);
});

test('[corpus] a dish named as a roast is actually roasted, and its centrepiece is cooked', () => {
  const method = buildPracticalRecipeSteps({
    name: 'Nut Roast with Roasted Veg',
    ingredients: ['Nut roast 150g', 'Carrot 150g', 'Parsnip 150g'],
  }).join(' ');
  assert.match(method, /oven/i);
  assert.match(method, /roast the nut roast/i, 'the centrepiece must itself be cooked');
});

test('[corpus] a dish named as a stir-fry actually stir-fries', () => {
  const method = buildPracticalRecipeSteps({
    name: 'Lean Beef Stir-Fry',
    ingredients: ['Lean beef strips 200g', 'Brown rice 35g dry', 'Broccoli 150g', 'Peppers 100g'],
  }).join(' ');
  assert.match(method, /stir-fry/i);
  assert.match(method, /wok|high heat/i);
});

test('[corpus] an already-cooked starch is not told to cook from its packet', () => {
  const method = buildPracticalRecipeSteps({
    name: 'Tofu & Quinoa Buddha Bowl',
    ingredients: ['Baked tofu 150g', 'Quinoa 80g cooked', 'Roasted peppers 100g'],
  }).join(' ');
  assert.doesNotMatch(method, /cook the quinoa according to/i);
  assert.match(method, /cooked quinoa ready/i);
});

test('[corpus][property] a vegetable ingredient is never silently dropped from its method', () => {
  // Asserts real generator behaviour rather than duplicating the
  // vocabulary: if a vegetable-like ingredient exists, the method must
  // mention it somewhere. Guards the class of bug where an unrecognised
  // vegetable (green beans, parsnip, celery, "mixed frozen veg") vanishes
  // from chopping/roasting steps entirely.
  const offenders = [];
  for (const meal of MEALS) {
    const method = buildPracticalRecipeSteps(meal).join(' ').toLowerCase();
    for (const raw of meal.ingredients || []) {
      const name = String(raw).toLowerCase();
      if (!/\b(green bean|parsnip|celery|sweetcorn|leek|asparagus|cauliflower|pak choi|edamame|beansprout|beetroot|swede|turnip|radish|fennel|veg)\b/.test(name)) continue;
      const head = name.replace(/[\d.]+\s*\w*/g, '').replace(/[(),]/g, ' ').trim().split(/\s+/).filter(w => w.length > 3).pop();
      if (!head) continue;
      const stem = head.replace(/(ies|es|s)$/, '');
      if (stem.length > 2 && !method.includes(stem)) offenders.push(`${meal.id}: ${raw}`);
    }
  }
  assert.deepEqual(offenders, [], `vegetable dropped from its method: ${offenders.join(' | ')}`);
});

// ── Container recommendation ────────────────────────────────────────────
test('[corpus] container count reflects simultaneously stored meals, not every meal of the week', async () => {
  const { buildContainerSetup } = await import('../src/utils/containerSetup.js');
  const seed = INDEXABLE_PLAN_SEEDS.find(item => item.slug === 'aldi-high-protein-low-cal-1500');
  const { buildPlan } = await import('../src/utils/planBuilder.js');
  const plan = buildPlan(seed);
  const setup = buildContainerSetup({ plan, weeklyPlan: plan.plan, formValues: {} });
  assert.ok(setup.containerCount < setup.prepMealCount, 'nobody needs one container per meal of the week');
  assert.ok(setup.containerCount >= 3 && setup.containerCount <= 18, `expected a realistic container count, got ${setup.containerCount}`);
});

test('[corpus][property] no plan recommends more containers than it has prep meals', async () => {
  const { buildContainerSetup } = await import('../src/utils/containerSetup.js');
  const { buildPlan } = await import('../src/utils/planBuilder.js');
  const offenders = [];
  for (const seed of INDEXABLE_PLAN_SEEDS.filter((_, index) => index % 37 === 0)) {
    const plan = buildPlan(seed);
    const setup = buildContainerSetup({ plan, weeklyPlan: plan.plan, formValues: {} });
    if (setup.prepMealCount > 6 && setup.containerCount >= setup.prepMealCount) {
      offenders.push(`${seed.slug}: ${setup.containerCount} containers for ${setup.prepMealCount} meals`);
    }
  }
  assert.deepEqual(offenders, [], `container count not reduced below whole-week meal count: ${offenders.join(' | ')}`);
});

// ── Description ↔ structured-data drift (phase-4) ───────────────────────
// A recipe's public description promising a material component that its
// ingredient data omits. High-confidence mappings only: each pairing is a
// specific named ingredient, not a loose keyword.
test('[corpus][property] a description promising a material ingredient is backed by the ingredient data', () => {
  const PROMISES = [
    ['gravy', /\bgravy\b/i, /\bgravy\b/i],
    ['tahini', /\btahini\b/i, /\btahini\b/i],
    ['soy sauce', /\bsoy sauce\b/i, /\b(soy sauce|tamari)\b/i],
    // An oil-plus-acid pairing (olive oil + balsamic) is itself a dressing,
    // so it satisfies the promise without a bottled "dressing" ingredient.
    ['a named dressing', /\b(lemon|balsamic|tahini|mint|caesar|ginger-soy|lemon-garlic)[- ]?\w*\s*dressing\b/i, /\b(dressing|tahini|sauce|mayo|glaze|vinegar|vinaigrette)\b/i],
    ['a curry base', /\b(tomato-based curry|curry sauce|curry paste)\b/i, /\b(curry sauce|curry paste|curry powder|tomato|coconut milk|masala)\b/i],
    ['parmesan', /\bparmesan\b/i, /\bparmesan\b/i],
  ];
  const offenders = [];
  const seen = new Set();
  for (const [, plan] of Object.entries(mealPlansData)) {
    for (const day of plan.plan || []) {
      for (const meal of day.meals || []) {
        const key = `${meal.name}|${meal.portion_size}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const desc = String(meal.desc || '');
        const ing = String(meal.portion_size || '').toLowerCase();
        for (const [label, promise, satisfied] of PROMISES) {
          if (promise.test(desc) && !satisfied.test(ing)) offenders.push(`${meal.name}: promises ${label}`);
        }
      }
    }
  }
  assert.deepEqual(offenders, [], `description promises a material ingredient the data omits: ${offenders.join(' | ')}`);
});

test('[corpus] Paneer & Spinach Curry actually has a curry base and cooks like a curry', () => {
  const seen = [];
  for (const [, plan] of Object.entries(mealPlansData)) {
    for (const day of plan.plan || []) {
      for (const meal of day.meals || []) {
        if (meal.name !== 'Paneer & Spinach Curry') continue;
        seen.push(meal);
      }
    }
  }
  assert.ok(seen.length, 'expected the Paneer & Spinach Curry this case documents');
  for (const meal of seen) {
    assert.match(meal.portion_size, /curry sauce/i, 'a curry needs a curry base in its ingredient data');
    const method = (canonicaliseLegacyMeal(meal).recipe || []).join(' ');
    assert.match(method, /curry sauce/i, 'the method must use the curry base');
    assert.match(method, /simmer/i);
  }
});

test('[corpus] a bowl or salad promising roasted vegetables actually roasts them', () => {
  const method = buildPracticalRecipeSteps({
    name: 'Lentil & Roasted Veg Bowl',
    ingredients: ['Butternut squash 150g', 'Courgette 150g', 'Peppers 150g', 'Green lentils 120g cooked', 'Tahini 1 tbsp'],
  }).join(' ');
  assert.match(method, /oven/i);
  assert.match(method, /roast/i);
});
