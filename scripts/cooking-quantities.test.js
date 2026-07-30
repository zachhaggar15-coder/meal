import test from 'node:test';
import assert from 'node:assert/strict';
import { MEALS } from '../src/data/mealLibrary.js';
import {
  getCookingIngredientDisplay,
  getCookingIngredientModels,
} from '../src/utils/cookingQuantities.js';
import { computeMealNutritionRaw } from '../src/utils/nutrition.js';
import { scaleIngredientsForPortion } from '../src/utils/planBuilder.js';
import { buildPracticalRecipeSteps } from '../src/utils/recipeQuality.js';

const FISHCAKE_CANONICAL = [
  'Tinned tuna 128g',
  'Sweet potato 176g mashed',
  'Spring onion 1.75',
  'Egg 1',
  'Mixed leaves 53g',
  'Lemon dressing 13g',
];

test('awkward optimisation quantities become practical cooking measures', () => {
  assert.deepEqual(getCookingIngredientDisplay(FISHCAKE_CANONICAL), [
    '1 standard tin of tuna, drained (about 125g)',
    '1 medium sweet potato, cooked and mashed (about 175g)',
    '2 spring onions',
    '1 egg',
    '2 generous handfuls mixed leaves (about 50g)',
    '1 tbsp lemon dressing',
  ]);
});

test('cooking display retains the untouched canonical calculation quantity', () => {
  const source = [...FISHCAKE_CANONICAL];
  const nutritionBefore = computeMealNutritionRaw(source);
  const models = getCookingIngredientModels(source);
  const nutritionAfter = computeMealNutritionRaw(source);

  assert.deepEqual(source, FISHCAKE_CANONICAL);
  assert.equal(models[1].canonical, 'Sweet potato 176g mashed');
  assert.deepEqual(models[1].canonicalQuantity, {
    amount: 176,
    unit: 'g',
    quantityGrams: 176,
  });
  assert.equal(models[1].displayQuantity, '1');
  assert.deepEqual(nutritionAfter, nutritionBefore);
});

test('household scaling stays canonical while its cooking projection is rounded', () => {
  const base = [
    'Tinned tuna 145g',
    'Sweet potato 200g mashed',
    'Spring onion 2',
    'Egg 1',
    'Mixed leaves 60g',
    'Lemon dressing 15g',
  ];
  const canonical = scaleIngredientsForPortion(base, 0.88);
  const cooking = getCookingIngredientDisplay(canonical);

  assert.deepEqual(canonical, FISHCAKE_CANONICAL);
  assert.equal(cooking[2], '2 spring onions');
  assert.doesNotMatch(cooking.join(' '), /\b1\.75\b/);
});

test('fishcake method reads like a cooking method and does not repeat optimiser output', () => {
  const recipe = buildPracticalRecipeSteps({
    name: 'Tuna and Sweet Potato Fishcakes with Salad',
    prepMins: 25,
    ingredients: FISHCAKE_CANONICAL,
  });
  const method = recipe.join(' ');

  assert.match(method, /Cook the medium sweet potato until tender/i);
  assert.match(method, /Shape the mixture into evenly sized fishcakes/i);
  assert.doesNotMatch(method, /128g|176g|1\.75|53g|13g/);
  assert.doesNotMatch(method, /Wash and chop.+Tinned tuna/i);
});

test('all shared recipes use the presentation layer without raw quantity dumps', () => {
  for (const meal of MEALS) {
    const cooking = getCookingIngredientDisplay(meal.ingredients);
    const recipe = buildPracticalRecipeSteps(meal);
    const method = recipe.join(' ');

    assert.ok(cooking.length > 0, `${meal.name} has cooking ingredients`);
    assert.ok(recipe.length >= 3, `${meal.name} has a complete method`);
    assert.doesNotMatch(cooking.join(' '), /\bexcluded from nutrition estimate\b/i);
    assert.doesNotMatch(cooking.join(' '), /\b\d+\.\d+\b/, `${meal.name} has no decimal cooking count`);
    assert.ok(
      !method.includes(meal.ingredients.join(', ')),
      `${meal.name} method does not dump canonical ingredients`,
    );
  }
});
