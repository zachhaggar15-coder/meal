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
import {
  buildPracticalRecipeSteps,
  resolvePotatoPreparation,
  validateRecipeQuality,
} from '../src/utils/recipeQuality.js';

const FISHCAKE_CANONICAL = [
  'Tinned tuna 128g',
  'Sweet potato 176g mashed',
  'Spring onion 1.75',
  'Egg 1',
  'Mixed leaves 53g',
  'Lemon dressing 13g',
];

test('awkward optimisation quantities become practical cooking measures', () => {
  // A reference weight survives only where the quantity word does not tell a
  // cook what to reach for. "2 generous handfuls" needs one; "1 medium sweet
  // potato" and "1 standard tin" do not, and a second number beside them is
  // one more thing to disagree with.
  assert.deepEqual(getCookingIngredientDisplay(FISHCAKE_CANONICAL), [
    '1 standard tin of tuna, drained',
    '1 medium sweet potato, cooked and mashed',
    '2 spring onions',
    '1 egg',
    '2 generous handfuls mixed leaves (about 50g)',
    '1 tbsp lemon dressing',
  ]);
});

test('a tin fraction and its weight can never contradict each other', () => {
  // These lines used to state a share of a tin and a gram amount that were not
  // the same quantity: "1 standard tin of tomatoes (about 475g)" asked for 75g
  // more than a 400g tin holds, and "about ¼ of a standard tin of tomatoes
  // (about 150g)" called 37% of a tin a quarter — the ⅓ candidate printed as
  // "¼" because the fraction formatter only renders quarters.
  //
  // The tin share is now the only quantity stated, so the tin size implies the
  // grams and there is no second number to disagree with. An amount that no
  // quarter-step share describes falls back to plain grams rather than
  // rounding a lie into place.
  const display = value => getCookingIngredientDisplay([value])[0];

  assert.equal(display('Tinned tomatoes 400g'), '1 standard tin of tomatoes');
  assert.equal(display('Tinned tomatoes 600g'), '1½ standard tins of tomatoes');
  assert.equal(display('Tinned chickpeas 120g'), '½ of a standard tin of chickpeas, drained');
  assert.equal(display('Tinned tomatoes 150g'), '150g tomatoes');

  for (const grams of [65, 90, 120, 150, 175, 200, 240, 300, 400, 475, 600, 700]) {
    for (const food of ['tomatoes', 'chickpeas', 'tuna']) {
      const line = display(`Tinned ${food} ${grams}g`);
      const statesTin = /\btins?\b/.test(line);
      const statesGrams = /\d+g\b/.test(line);
      assert.ok(
        statesTin !== statesGrams,
        `"${line}" states both a tin count and a weight, which can disagree`,
      );
    }
  }
});

test('practical quantities are stated confidently, not hedged', () => {
  // "about 275g oats" reads as an estimate the cook should second-guess. It is
  // not: 275g IS the instruction, already rounded from the optimiser's 281g.
  // Hedging belongs on quantities that genuinely vary — a handful, a whole
  // vegetable, a share of a tin — and those keep it.
  assert.equal(getCookingIngredientDisplay(['Oats 281g'])[0], '275g oats');
  assert.equal(getCookingIngredientDisplay(['Gravy 97ml'])[0], '95ml gravy');
  assert.equal(getCookingIngredientDisplay(['Steak 194g'])[0], '200g steak');
  assert.equal(getCookingIngredientDisplay(['Mushrooms 97g'])[0], '100g mushrooms');
  assert.match(getCookingIngredientDisplay(['Mixed leaves 53g'])[0], /^2 generous handfuls/);
});

test('counted produce is counted, not counted and then weighed', () => {
  // "1 apple (220g)" makes a shopper check a weight they will never act on.
  assert.equal(getCookingIngredientDisplay(['Apple 1'])[0], '1 apple');
  assert.equal(getCookingIngredientDisplay(['Banana 1'])[0], '1 banana');
  assert.equal(getCookingIngredientDisplay(['Sweet potato 176g'])[0], '1 medium sweet potato');
  // …but produce you cut a share off keeps its anchor, because "½ a cauliflower"
  // is not a portion size anyone can picture.
  assert.match(getCookingIngredientDisplay(['Broccoli 175g'])[0], /\(about 175g\)$/);
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
    // A method must exist and every step must do something. It must NOT be
    // three steps long: this assertion used to demand three, and a bag of
    // beef jerky met the quota by being told to cook until cooked through.
    // "No preparation needed — eat as it comes" is the complete and correct
    // method for that dish.
    assert.ok(recipe.length > 0, `${meal.name} has a method`);
    for (const step of recipe) {
      assert.ok(step.trim().length > 0, `${meal.name} has no empty step`);
    }
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

test('Niçoise methods only prepare ingredients that are actually listed', () => {
  const potatoFree = canonicaliseLegacyMeal({
    name: 'Tuna Nicoise Salad',
    prep: '10 min',
    portion_size: '145g tinned tuna, 1 egg, 80g green beans, 100g cherry tomatoes, 10g olives',
  });
  const generated = MEALS.find(meal => meal.id === 'tuna-niçoise');
  const generatedMethod = buildPracticalRecipeSteps(generated).join(' ');

  assert.doesNotMatch(potatoFree.recipe.join(' '), /\bpotato(?:es)?\b/i);
  assert.match(potatoFree.recipe.join(' '), /Boil the egg.+green beans/i);
  assert.match(generatedMethod, /Boil the new potatoes/i);
});

test('meal-name matching is boundary-aware and recognises common beef aliases', () => {
  const veggieMethod = buildPracticalRecipeSteps({
    name: 'Hummus & Veggie Sticks',
    prep: '2 min',
    ingredients: ['Hummus 40g', 'Carrot sticks 100g', 'Cucumber 100g'],
  }).join(' ');
  const steak = {
    name: 'Grilled Lean Beef Steak with Roasted Veg',
    ingredients: ['Lean sirloin steak 150g', 'Roasted veg 200g'],
  };
  const steakRecipe = buildPracticalRecipeSteps(steak);

  assert.doesNotMatch(veggieMethod, /\beggs?\b|scramble|omelette/i);
  assert.match(veggieMethod, /carrot sticks.+cucumber/i);
  assert.match(steakRecipe.join(' '), /lean sirloin steak/i);
  assert.deepEqual(
    validateRecipeQuality({ ...steak, recipe: steakRecipe })
      .filter(issue => issue.startsWith('instruction mentions')),
    [],
  );
});

test('egg white omelette methods do not re-serve the eggs or cooking spray as accompaniments', () => {
  const method = buildPracticalRecipeSteps({
    name: 'Egg White Omelette with Peppers',
    prep: '10 min',
    ingredients: [
      'Egg whites 7.75', 'Mixed peppers 127g', 'Onion 0.75',
      'Olive oil spray, optional light coating (excluded from nutrition estimate)',
      'Mixed herbs 1.25 tsp',
    ],
  }).join(' ');

  assert.doesNotMatch(method, /eggs? whites?,/i, 'egg whites should not be listed as something served alongside the eggs');
  assert.doesNotMatch(method, /spray/i, 'cooking spray is a pan aid, not a serving ingredient');
  assert.match(method, /serve with mixed herbs/i);
});

test('turkey lettuce cups cook spring onion once, not once as an aromatic and once as a filling', () => {
  const method = buildPracticalRecipeSteps({
    name: 'Turkey Mince Lettuce Cups with Hoisin',
    prep: '12 min',
    ingredients: [
      'Turkey mince lean 229g', 'Romaine lettuce leaves 5', 'Spring onion 2.5',
      'Hoisin sauce 25g', 'Sesame seeds 1.25 tsp', 'Carrot grated 64g',
    ],
  });
  const stirInStep = method.find(step => /^Stir in/i.test(step));
  const cookStep = method.find(step => /^Cook the/i.test(step));

  assert.match(stirInStep, /spring onion/i);
  assert.doesNotMatch(cookStep, /spring onion/i, 'spring onion should only be introduced once, in the stir-in step');
});

test('complete shared and editorial meal libraries never prepare an absent material ingredient', () => {
  const assertConsistent = (meal, label) => {
    const recipe = meal.recipe || buildPracticalRecipeSteps(meal);
    const issues = validateRecipeQuality({ ...meal, recipe })
      .filter(issue => issue.startsWith('instruction mentions'));
    assert.deepEqual(issues, [], `${label}: ${issues.join(', ')}`);
  };

  for (const meal of MEALS) assertConsistent(meal, `shared ${meal.name}`);
  for (const [slug, plan] of Object.entries(mealPlansData)) {
    for (const day of plan.plan || []) {
      for (const meal of day.meals || []) {
        assertConsistent(canonicaliseLegacyMeal(meal), `${slug} ${day.day} ${meal.name}`);
      }
    }
  }
});
