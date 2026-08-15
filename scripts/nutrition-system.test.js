import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveEmailPlan } from '../api/email-plan.js';
import { canonicaliseAiMeal, canonicaliseAiPlan, UnresolvedNutritionError } from '../server/canonical-nutrition.js';
import { MEALS } from '../src/data/mealLibrary.js';
import { mealPlansData } from '../src/data/mealPlans.js';
import { NUTRITION_TABLE } from '../src/data/nutritionTable.js';
import { PROTEIN_FOODS } from '../src/data/proteinValueData.js';
import { hasValidIngredientQuantity, parseIngredientLine } from '../src/utils/ingredientParser.js';
import { buildCanonicalLegacyPlan } from '../src/utils/legacyPlanBuilder.js';
import { getTopMatches } from '../src/utils/quizScorer.js';
import {
  buildPlanDays,
  buildShoppingList,
  scalePlanForHousehold,
} from '../src/utils/planBuilder.js';
import {
  averageDailyMacros,
  computeMealNutrition,
  computeMealNutritionRaw,
  roundNutrition,
  sumNutrition,
} from '../src/utils/nutrition.js';
import { INDEXABLE_PLAN_SEEDS } from '../src/data/planSeeds.js';
import {
  calorieTargetResult,
  proteinFilterMatches,
  proteinTargetResult,
} from '../src/utils/targetValidation.js';

test('ingredient parser handles measured, count, slash fraction and excluded optional quantities', () => {
  assert.deepEqual(
    pick(parseIngredientLine('Brown rice 80g dry'), ['name', 'qualifier', 'kind', 'qty', 'unit']),
    { name: 'brown rice', qualifier: 'dry', kind: 'measured', qty: 80, unit: 'g' },
  );
  assert.equal(parseIngredientLine('Avocado 3/4').qty, 0.75);
  assert.equal(parseIngredientLine('Eggs 2').qty, 2);
  assert.equal(parseIngredientLine('Basil, optional to taste (excluded from nutrition estimate)').excluded, true);
});

test('invalid, zero, missing and unsupported ingredient quantities cannot pass validation', () => {
  assert.equal(hasValidIngredientQuantity(parseIngredientLine('Olive oil 0g')), false);
  assert.equal(hasValidIngredientQuantity(parseIngredientLine('Olive oil -10g')), false);
  assert.equal(hasValidIngredientQuantity(parseIngredientLine('Olive oil NaNg')), false);
  assert.equal(hasValidIngredientQuantity(parseIngredientLine('Olive oil 2 buckets')), false);
  assert.equal(hasValidIngredientQuantity(parseIngredientLine('Olive oil')), false);
  assert.equal(hasValidIngredientQuantity(
    parseIngredientLine('Basil, optional to taste (excluded from nutrition estimate)'),
  ), true);
});

test('per-100 calculation uses explicit raw/cooked mapping and per-100ml liquid basis', () => {
  const dry = computeMealNutritionRaw(['Brown rice 100g dry']);
  const cooked = computeMealNutritionRaw(['Brown rice 100g cooked']);
  const milk = computeMealNutritionRaw(['Semi-skimmed milk 100ml']);
  assert.equal(dry.kcal, NUTRITION_TABLE['brown rice dry'].kcal100);
  assert.equal(cooked.kcal, NUTRITION_TABLE['brown rice cooked'].kcal100);
  assert.equal(milk.kcal, NUTRITION_TABLE['semi-skimmed milk'].kcal100);
  assert.equal(milk.ingredientsAudit[0].basis, 'ml');
});

test('recipe summation retains raw precision and applies one shared display rounding rule', () => {
  const ingredients = ['Rolled oats 80g', 'Semi-skimmed milk 200ml', 'Banana 1', 'Honey 1 tsp'];
  const raw = computeMealNutritionRaw(ingredients);
  const display = computeMealNutrition(ingredients);
  assert.deepEqual(display, roundNutrition(raw));
  assert.equal(display.kcal, MEALS.find(meal => meal.id === 'overnight-oats-banana').cal);
});

test('protein comparison outputs resolve from the canonical nutrition table', () => {
  for (const food of PROTEIN_FOODS) {
    assert.equal(food.kcal100, NUTRITION_TABLE[food.nutritionKey].kcal100);
    assert.equal(food.pro100, NUTRITION_TABLE[food.nutritionKey].pro100);
  }
});

test('day, week and average calculations equal their meal-level inputs', () => {
  const seed = INDEXABLE_PLAN_SEEDS[0];
  const built = buildPlanDays(seed);
  for (const day of built.plan) assert.deepEqual(day.totals, sumNutrition(day.meals));
  assert.deepEqual(built.averageMacros, averageDailyMacros(built.plan));
  assert.equal(calorieTargetResult(built.plan, seed.calories).eligible, true);
});

test('target classifiers enforce calorie and protein release thresholds', () => {
  const calorieDays = Array.from({ length: 7 }, (_, index) => ({
    totals: { kcal: index === 0 ? 1388 : 1500, protein: 100 },
  }));
  assert.equal(calorieTargetResult(calorieDays, 1500).eligible, true);
  calorieDays[0].totals.kcal = 1387;
  assert.equal(calorieTargetResult(calorieDays, 1500).eligible, false);

  const proteinDays = Array.from({ length: 7 }, () => ({ totals: { protein: 100 } }));
  assert.equal(proteinTargetResult(proteinDays, 100).eligible, true);
  assert.equal(proteinFilterMatches(105, 100), true);
  assert.equal(proteinFilterMatches(106, 100), false);
});

test('quiz matching honours exact diet, supermarket and calorie constraints', () => {
  const [match] = getTopMatches({
    goal: 'vegan-low-cal',
    diet: 'vegan',
    supermarket: 'aldi',
    calories: '1500',
    budget: 'very-cheap',
    effort: 'standard',
  }, 1);
  assert.equal(match.dietType, 'vegan');
  assert.equal(match.supermarket, 'aldi');
  assert.equal(match.calories, 1500);
  assert.equal(match.compromises.length, 0);
});

test('household scaling preserves per-person nutrition and reconciles shopping quantities', () => {
  const seed = INDEXABLE_PLAN_SEEDS[0];
  const { plan: days } = buildPlanDays(seed);
  const base = {
    title: seed.title,
    calories: seed.calories,
    priceEstimate: '£30–40',
    summary: { calorieRange: `~${seed.calories} kcal/day`, budgetRange: '£30–40' },
    plan: days,
    shoppingList: buildShoppingList(days),
  };
  const scaled = scalePlanForHousehold(base, 4);
  assert.equal(scaled.servings, 4);
  assert.deepEqual(scaled.plan[0].totals, days[0].totals);
  assert.equal(scaled.plan[0].householdTotals.kcal, days[0].totals.kcal * 4);
  assert.notDeepEqual(scaled.shoppingList, base.shoppingList);
});

test('shopping classification is phrase-aware and follows a shopper-friendly taxonomy', () => {
  const shopping = shoppingListFor([
    'Peanut butter 20g', 'Pea 40g', 'Peas 80g', 'Peanut 20g', 'Peanuts 20g',
    'Lean-sirloin steak 150g', 'Beef steaks 150g', 'Pork loin 150g',
    'Turkey bacon 2 slices', 'Smoked bacon 2 rashers',
    'Tinned tuna in spring water 145g', 'Tuna steaks 150g', 'Prawns 120g', 'Tofu 150g', 'Tempeh 150g',
    'Whey protein 30g', 'Protein powder 30g', 'Vegan protein-powder 30g', 'Pea protein powder 30g',
    'Greek yogurt 200g', 'Greek-style yoghurt 200g', 'Cottage cheese 150g', 'Eggs 2',
    'Sweet-chilli sauce 15g', 'Spearmint tea 10g', 'Cornflakes 40g',
  ]);

  assert.ok(shopping.condiments.some(item => /peanut butter/i.test(item)));
  assert.ok(shopping.vegetables.some(item => /^Peas\b/i.test(item)));
  assert.ok(!shopping.vegetables.some(item => /peanut|protein powder|spearmint|cornflakes/i.test(item)));
  for (const matcher of [
    /Lean-sirloin steak/i, /Beef steaks/i, /bacon/i, /pork loin/i,
    /Tinned tuna/i, /Tuna steaks/i, /prawns/i, /tofu/i, /tempeh/i,
    /Whey protein/i, /^Protein powder/i, /Vegan protein-powder/i, /Pea protein powder/i,
    /^Eggs\b/i,
  ]) {
    assert.ok(shopping.protein.some(item => matcher.test(item)), `${matcher} is in Protein`);
  }
  assert.ok(shopping.dairy.some(item => /Greek yogurt/i.test(item)));
  assert.ok(shopping.dairy.some(item => /Greek-style yoghurt/i.test(item)));
  assert.ok(shopping.dairy.some(item => /Cottage cheese/i.test(item)));
});

test('multi-word herb and spice names are not shadowed by a shorter produce keyword', () => {
  const shopping = shoppingListFor([
    'Black pepper, to taste', 'White pepper, to taste', 'Mixed peppers 100g', 'Green beans 100g',
  ]);

  assert.ok(shopping.herbs.some(item => /Black pepper/i.test(item)));
  assert.ok(shopping.herbs.some(item => /White pepper/i.test(item)));
  assert.ok(shopping.vegetables.some(item => /Mixed peppers/i.test(item)));
  assert.ok(shopping.vegetables.some(item => /Green beans/i.test(item)));
  assert.ok(!shopping.vegetables.some(item => /pepper/i.test(item) && !/mixed peppers/i.test(item)));
  assert.ok(!shopping.extras.some(item => /green beans/i.test(item)));
});

test('egg whites are purchased by weight rather than as a whole-item count', () => {
  const shopping = shoppingListFor(['Egg whites 6', 'Egg whites 5']);
  const all = Object.values(shopping).flat();

  assert.ok(all.includes('Egg whites 370g (about 363g used)'));
  assert.ok(!all.some(item => /^Egg whites \d+(\.\d+)?\s*$/.test(item)), 'egg whites should not be a bare whole-item count');
});

test('the same ingredient stated as a weight in one recipe and a count in another merges into one purchase line', () => {
  const shopping = shoppingListFor(['Cherry tomatoes 209g', 'Cherry tomatoes 10', 'Cucumber 52g', 'Cucumber half']);
  const all = Object.values(shopping).flat();

  assert.equal(all.filter(item => /^Cherry tomatoes\b/i.test(item)).length, 1);
  assert.equal(all.filter(item => /^Cucumber\b/i.test(item)).length, 1);
  assert.ok(all.some(item => /^Cherry tomatoes \d+g/i.test(item)));
  assert.ok(all.some(item => /^Cucumber \d+g/i.test(item)));
});

test('olive oil stated in teaspoons in one recipe and tablespoons in another merges into one line', () => {
  const shopping = shoppingListFor(['Olive oil 1 tsp', 'Olive oil 1 tbsp']);
  const all = Object.values(shopping).flat();

  assert.equal(all.filter(item => /^Olive oil\b/i.test(item)).length, 1);
});

test('measured shopping quantities never use "at least" wording', () => {
  const shopping = shoppingListFor([
    'Turkey mince lean 450g', 'Tinned tomatoes 1300g', 'Mixed herbs 7.75 tsp', 'Beef stock 270ml',
  ]);
  const all = Object.values(shopping).flat();

  assert.ok(!all.some(item => /\bat least\b/i.test(item)));
});

test('shopping purchase presentation rounds countable quantities up and shows expected use', () => {
  const shopping = shoppingListFor([
    'Onion 0.36',
    'Peppers 1.14',
    'Avocado half',
    'Wholemeal bread 9.25 slices',
    'Snack mix 0.47 packs',
    '1 small roll (67g)',
    'Semi-skimmed milk 1271ml',
    'Peanut butter 1.15 tsp',
  ]);
  const all = Object.values(shopping).flat();

  assert.ok(all.includes('Onion 1 (about 1/3 used)'));
  assert.ok(all.includes('Peppers 2 (about 1 1/4 used)'));
  assert.ok(all.includes('Avocado 1 (about 1/2 used)'));
  assert.ok(all.includes('Wholemeal bread 10 slices (about 9 1/4 used)'));
  assert.ok(all.includes('Snack mix 1 pack (about 1/2 used)'));
  assert.ok(all.includes('1 small roll'));
  assert.ok(all.includes('Semi-skimmed milk 1300ml (about 1271ml used)'));
  // A 0.1 tsp shortfall is below anything a cook can measure, so the
  // usage note is suppressed for spoon units — it was pure optimiser
  // precision on every spice line. Gram/ml lines keep their note (above),
  // where the shortfall genuinely affects what you buy.
  assert.ok(all.includes('Peanut butter 1.25 tsp'));
  assert.ok(!all.some(item => /Peanut butter[^|]*\(about/.test(item)));
  assert.ok(!all.some(item => /\bat least\b/i.test(item)));
});

test('shopping presentation never mutates ingredients or changes nutrition totals', () => {
  const ingredients = [
    'Semi-skimmed milk 1271ml',
    'Peanut butter 1.15 tsp',
    'Onion 0.36',
    'Eggs 1.14',
  ];
  const sourceSnapshot = [...ingredients];
  const nutritionBefore = computeMealNutritionRaw(ingredients);
  const shopping = shoppingListFor(ingredients);
  const nutritionAfter = computeMealNutritionRaw(ingredients);

  assert.deepEqual(ingredients, sourceSnapshot);
  assert.deepEqual(nutritionAfter, nutritionBefore);
  assert.ok(Object.values(shopping).flat().some(item => item === 'Eggs 2 (about 1 1/4 used)'));
});

test('representative generated plans use whole purchase counts in shopping lists', () => {
  const seed = INDEXABLE_PLAN_SEEDS.find(item => item.slug === 'aldi-high-protein-1500-calorie-meal-plan')
    || INDEXABLE_PLAN_SEEDS[0];
  const { plan } = buildPlanDays(seed);
  const shopping = buildShoppingList(plan);
  const all = Object.values(shopping).flat();

  assert.ok(all.length > 0);
  assert.ok(all.every(item => !/\b\d+\.\d+\s+(?:packs?|slices?|eggs?)\b/i.test(item)));
});

test('legacy page and email paths share the canonical plan builder', () => {
  const [slug, legacy] = Object.entries(mealPlansData)[0];
  const canonicalDays = buildCanonicalLegacyPlan(legacy.plan, legacy.targetCalories);
  const email = resolveEmailPlan(slug);
  assert.deepEqual(email.plan, canonicalDays);
  for (const day of email.plan) assert.deepEqual(day.totals, sumNutrition(day.meals));
});

test('AI nutrition is recalculated from ingredients and unresolved foods are rejected', () => {
  const meal = canonicaliseAiMeal({
    type: 'Lunch',
    name: 'Oats',
    calories: 1,
    protein: 1,
    ingredients: ['Rolled oats 100g'],
    portion_size: 'Rolled oats 100g',
    recipe: ['Measure the oats.', 'Cook with water.'],
  });
  assert.equal(meal.calories, NUTRITION_TABLE['rolled oats'].kcal100);
  assert.equal(meal.protein, Math.round(NUTRITION_TABLE['rolled oats'].pro100));
  assert.throws(
    () => canonicaliseAiMeal({ ingredients: ['Mystery powder 40g'] }),
    UnresolvedNutritionError,
  );
});

test('AI plan edits rebuild day totals and the consolidated shopping list', () => {
  const plan = canonicaliseAiPlan({
    weekly_plan: [{
      day: 'Monday',
      meals: [{
        type: 'Breakfast',
        name: 'Oats',
        ingredients: ['Rolled oats 100g'],
        portion_size: 'Rolled oats 100g',
        recipe: ['Measure.', 'Cook.'],
      }],
      daily_totals: { calories: 1 },
    }],
    shopping_list: { pantry: ['wrong'] },
  });
  assert.equal(plan.weekly_plan[0].daily_totals.calories, NUTRITION_TABLE['rolled oats'].kcal100);
  assert.ok(Object.values(plan.shopping_list).flat().some(item => /rolled oats/i.test(item)));
});

function pick(value, keys) {
  return Object.fromEntries(keys.map(key => [key, value[key]]));
}

function shoppingListFor(ingredients) {
  return buildShoppingList([{ meals: [{ ingredients }] }]);
}
