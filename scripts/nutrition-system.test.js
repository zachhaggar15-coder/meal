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
