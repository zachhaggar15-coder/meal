import { parentPort, workerData } from 'node:worker_threads';
import { MEALS } from '../src/data/mealLibrary.js';
import { PLAN_SEEDS } from '../src/data/planSeeds.js';
import {
  buildPlanDays,
  buildShoppingList,
  scalePlanForHousehold,
} from '../src/utils/planBuilder.js';
import {
  averageDailyMacros,
  computeMealNutrition,
  sumNutrition,
} from '../src/utils/nutrition.js';

const nutrientKeys = ['kcal', 'protein', 'carbs', 'fats', 'fibre'];
const sourceMeals = new Map(MEALS.map(meal => [meal.name, meal]));
const result = {
  combinations: 0,
  uniquePlanOutputs: 0,
  days: 0,
  mealOccurrences: 0,
  ingredientOccurrences: 0,
  householdStates: 0,
  intentionalHighEnergySnackRepeats: 0,
  calorieMeanMinPercent: Number.POSITIVE_INFINITY,
  calorieMeanMaxPercent: Number.NEGATIVE_INFINITY,
  failures: [],
};
const auditedFingerprints = new Set();

for (let index = workerData.start; index < workerData.end; index += 1) {
  const seed = PLAN_SEEDS[index];
  const built = buildPlanDays(seed);
  const days = built.plan;
  result.combinations += 1;
  result.days += days.length;
  result.mealOccurrences += days.reduce((sum, day) => sum + (day.meals?.length || 0), 0);
  result.ingredientOccurrences += days.reduce((sum, day) => (
    sum + (day.meals || []).reduce((mealSum, meal) => mealSum + (meal.ingredients?.length || 0), 0)
  ), 0);

  const fingerprint = JSON.stringify(days.map(day => (
    day.meals.map(meal => [meal.name, meal.ingredients])
  )));
  if (auditedFingerprints.has(fingerprint)) continue;
  auditedFingerprints.add(fingerprint);
  result.uniquePlanOutputs += 1;

  auditPlan(seed, days, built.averageMacros);
}

parentPort.postMessage(result);

function auditPlan(seed, days, averageMacros) {
  if (!Array.isArray(days) || days.length !== 7) {
    fail(seed, `expected 7 days, received ${days?.length || 0}`);
    return;
  }

  let weeklyCalories = 0;
  let weeklyProtein = 0;
  for (const day of days) {
    if (!Array.isArray(day.meals) || day.meals.length < 3) {
      fail(seed, `${day.day}: fewer than 3 meals`);
      continue;
    }
    const daySum = sumNutrition(day.meals);
    for (const key of nutrientKeys) {
      if (day.totals?.[key] !== daySum[key]) {
        fail(seed, `${day.day}: ${key} total ${day.totals?.[key]} does not equal meal sum ${daySum[key]}`);
      }
    }
    const dayTargetDifference = percentDifference(day.totals.kcal, seed.calories);
    if (Math.abs(dayTargetDifference) > 7.5) {
      fail(seed, `${day.day}: ${day.totals.kcal} kcal is ${dayTargetDifference.toFixed(2)}% from ${seed.calories}`);
    }
    weeklyCalories += day.totals.kcal;
    weeklyProtein += day.totals.protein;

    const names = new Map();
    for (const meal of day.meals) {
      const source = sourceMeals.get(meal.name);
      if (!source) fail(seed, `${day.day}: unknown meal "${meal.name}"`);
      const canonical = computeMealNutrition(meal.ingredients);
      for (const key of nutrientKeys) {
        if (meal[key] !== canonical[key]) {
          fail(seed, `${day.day}/${meal.name}: displayed ${key} ${meal[key]} differs from ingredient sum ${canonical[key]}`);
        }
      }
      if (canonical.unmatched.length) {
        fail(seed, `${day.day}/${meal.name}: unresolved ingredients ${canonical.unmatched.join(', ')}`);
      }
      if (source && !dietAllows(seed.dietType, source.diet)) {
        fail(seed, `${day.day}/${meal.name}: ${source.diet} meal conflicts with ${seed.dietType} plan`);
      }
      const repeatCount = (names.get(meal.name) || 0) + 1;
      names.set(meal.name, repeatCount);
      if (repeatCount > 1) {
        if (seed.calories >= 3000 && meal.type === 'Snack') {
          result.intentionalHighEnergySnackRepeats += 1;
        } else {
          fail(seed, `${day.day}: duplicate meal "${meal.name}"`);
        }
      }
    }
  }

  const meanCalories = weeklyCalories / 7;
  const meanDifference = percentDifference(meanCalories, seed.calories);
  result.calorieMeanMinPercent = Math.min(result.calorieMeanMinPercent, meanDifference);
  result.calorieMeanMaxPercent = Math.max(result.calorieMeanMaxPercent, meanDifference);
  if (Math.abs(meanDifference) > 3) {
    fail(seed, `seven-day mean ${meanCalories.toFixed(1)} kcal is ${meanDifference.toFixed(2)}% from ${seed.calories}`);
  }

  const calculatedAverage = averageDailyMacros(days);
  for (const key of ['protein', 'carbs', 'fats', 'fibre']) {
    if (averageMacros?.[key] !== calculatedAverage[key]) {
      fail(seed, `summary ${key} ${averageMacros?.[key]} differs from seven-day average ${calculatedAverage[key]}`);
    }
  }

  if (String(seed.goal).includes('high-protein')) {
    const proteinEnergyPercent = weeklyCalories > 0 ? (weeklyProtein * 4 / weeklyCalories) * 100 : 0;
    if (proteinEnergyPercent < 20) {
      fail(seed, `high-protein claim has only ${proteinEnergyPercent.toFixed(2)}% of energy from protein`);
    }
  }

  const slugCalorie = seed.slug.match(/(?:^|-)(1[2-9]00|2[0-9]00|3[0-9]00)(?:-|$)/)?.[1];
  if (slugCalorie && Number(slugCalorie) !== seed.calories) {
    fail(seed, `URL calorie ${slugCalorie} conflicts with seed ${seed.calories}`);
  }
  if (!String(seed.title).includes(seed.calories.toLocaleString('en-GB'))) {
    fail(seed, `title does not contain calorie target ${seed.calories.toLocaleString('en-GB')}`);
  }

  const minimalPlan = {
    slug: seed.slug,
    title: seed.title,
    calories: seed.calories,
    priceEstimate: '£30–40',
    summary: { calorieRange: `~${seed.calories} kcal/day`, budgetRange: '£30–40' },
    plan: days,
    shoppingList: buildShoppingList(days),
  };
  auditShoppingList(seed, minimalPlan.shoppingList);
  for (let people = 1; people <= 6; people += 1) {
    auditHousehold(seed, minimalPlan, people);
  }
  auditHousehold(seed, minimalPlan, [
    { label: 'Adult portion', portionScale: 1 },
    { label: 'Smaller portion', portionScale: 0.75 },
    { label: 'Larger portion', portionScale: 1.25 },
  ]);
}

function auditHousehold(seed, plan, state) {
  const isFullShoppingReconciliation = state === 6;
  const auditPlan = isFullShoppingReconciliation
    ? plan
    : { ...plan, plan: plan.plan.slice(0, 1) };
  const scaled = scalePlanForHousehold(auditPlan, state);
  result.householdStates += 1;
  const expectedPeople = Array.isArray(state) ? state.length : state;
  if (scaled.servings !== expectedPeople) fail(seed, `household state ${expectedPeople}: wrong serving count`);
  for (let dayIndex = 0; dayIndex < auditPlan.plan.length; dayIndex += 1) {
    const baseDay = auditPlan.plan[dayIndex];
    const scaledDay = scaled.plan[dayIndex];
    for (const key of nutrientKeys) {
      if (scaledDay.totals[key] !== baseDay.totals[key]) {
        fail(seed, `household state ${expectedPeople}/${baseDay.day}: per-person ${key} changed`);
      }
      const expectedHousehold = Math.round(baseDay.totals[key] * scaled.totalPortions);
      if (scaledDay.householdTotals[key] !== expectedHousehold) {
        fail(seed, `household state ${expectedPeople}/${baseDay.day}: household ${key} mismatch`);
      }
    }
  }
  if (isFullShoppingReconciliation) auditShoppingList(seed, scaled.shoppingList);
}

function auditShoppingList(seed, shoppingList) {
  const items = Object.values(shoppingList || {}).flat();
  if (!items.length) fail(seed, 'shopping list is empty');
  for (const item of items) {
    if (/\b(?:undefined|null|NaN|Infinity)\b/i.test(item) || /\d+\/\s+\d/.test(item)) {
      fail(seed, `malformed shopping-list item "${item}"`);
    }
  }
}

function dietAllows(planDiet, mealDiet) {
  if (planDiet === 'vegan') return mealDiet === 'vegan';
  if (planDiet === 'vegetarian') return mealDiet === 'vegan' || mealDiet === 'vegetarian';
  if (planDiet === 'pescatarian') return mealDiet !== 'standard';
  return true;
}

function percentDifference(actual, target) {
  return target ? ((actual - target) / target) * 100 : 0;
}

function fail(seed, message) {
  if (result.failures.length < 500) result.failures.push(`${seed.slug}: ${message}`);
}
