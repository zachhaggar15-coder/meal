import test from 'node:test';
import assert from 'node:assert/strict';
import { MEALS } from '../src/data/mealLibrary.js';
import { mealPlansData } from '../src/data/mealPlans.js';
import {
  getCookingIngredientDisplay,
  getCookingIngredientModels,
} from '../src/utils/cookingQuantities.js';
import { computeMealNutritionRaw } from '../src/utils/nutrition.js';
import { scaleIngredientsForPortion } from '../src/utils/planBuilder.js';
import { canonicaliseLegacyMeal } from '../src/utils/legacyPlanBuilder.js';
import { buildPracticalRecipeSteps, resolvePotatoPreparation } from '../src/utils/recipeQuality.js';

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

  assert.match(method, /Have the medium sweet potato, cooked and mashed ready/i);
  assert.doesNotMatch(method, /\bboil\b|Cook the medium sweet potato until tender/i);
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

test('legacy and generated jacket potatoes use preparation-aware methods', () => {
  const legacySource = Object.values(mealPlansData)
    .flatMap(plan => plan.plan || [])
    .flatMap(day => day.meals || [])
    .find(meal => /tuna.*jacket potato/i.test(meal.name || ''));
  const legacy = canonicaliseLegacyMeal(legacySource);
  const generated = MEALS.find(meal => meal.id === 'tuna-jacket-potato');
  const generatedMethod = buildPracticalRecipeSteps(generated).join(' ');

  assert.match(legacy.recipe.join(' '), /Reheat the potato until piping hot/i);
  assert.doesNotMatch(legacy.recipe.join(' '), /\bboil\b|fold the cooked baked potato/i);
  assert.match(generatedMethod, /Prick the baking potato.+bake/i);
  assert.match(generatedMethod, /Split the baking potato/i);
  assert.doesNotMatch(generatedMethod, /\bboil\b|fold the cooked baking potato/i);
});

test('potato preparation resolution follows structured, qualifier, name and default precedence', () => {
  assert.deepEqual(
    resolvePotatoPreparation({
      name: 'Roast Potato Bowl',
      ingredients: [{ name: 'Potato', amount: '200g', preparation: 'baked' }],
    }),
    { state: 'baked', source: 'structured', declared: true },
  );
  assert.deepEqual(
    resolvePotatoPreparation({ name: 'Roast Potato Bowl', ingredients: ['Potato 200g mashed'] }),
    { state: 'mashed', source: 'ingredient-qualifier', declared: true },
  );
  assert.deepEqual(
    resolvePotatoPreparation({ name: 'Roast Potato Bowl', ingredients: ['Potato 200g'] }),
    { state: 'roast', source: 'meal-name', declared: false },
  );
  assert.deepEqual(
    resolvePotatoPreparation({ name: 'Potato Plate', ingredients: ['Potato 200g'] }),
    { state: 'raw', source: 'default', declared: false },
  );
});

test('explicitly prepared potatoes never receive a contradictory cooking method', () => {
  const preparedCases = [
    ['Potato 200g baked', /\bboil\b|\bmash\b|\broast\b/],
    ['Potato 200g boiled', /\bbake\b|\bmash\b|\broast\b/],
    ['Potato 200g roasted', /\bboil\b|\bbake\b|\bmash\b/],
    ['Potato 200g mashed', /\bboil\b|\bbake\b|\broast\b/],
    ['Potato 200g cooked', /\bboil\b|\bbake\b|\bmash\b|\broast\b/],
  ];

  for (const [ingredient, contradiction] of preparedCases) {
    const method = buildPracticalRecipeSteps({
      name: 'Potato with Vegetables',
      ingredients: [ingredient, 'Spinach 40g'],
    }).join(' ');
    assert.doesNotMatch(method, contradiction, `${ingredient} is not recooked using another state`);
  }
});

test('raw, boiled, roast and mashed potato intentions produce distinct methods', () => {
  const raw = buildPracticalRecipeSteps({ name: 'Potato Plate', ingredients: ['Potato 200g'] }).join(' ');
  const boiled = buildPracticalRecipeSteps({ name: 'Boiled Potato Plate', ingredients: ['Potato 200g'] }).join(' ');
  const roast = buildPracticalRecipeSteps({ name: 'Roast Potato Bowl', ingredients: ['Potato 200g', 'Spinach 40g'] }).join(' ');
  const mashed = buildPracticalRecipeSteps({ name: 'Mashed Potato Plate', ingredients: ['Potato 200g'] }).join(' ');

  assert.match(raw, /Boil the potato/i);
  assert.match(boiled, /Boil the potato/i);
  assert.match(roast, /roast at 200°C/i);
  assert.match(mashed, /boil.+then drain and mash/i);
});
