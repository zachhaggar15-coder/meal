import { buildShoppingList } from '../src/utils/planBuilder.js';
import {
  computeMealNutritionRaw,
  roundNutrition,
  splitIngredientText,
  sumNutrition,
} from '../src/utils/nutrition.js';

export class UnresolvedNutritionError extends Error {
  constructor(lines) {
    super(`Unresolved ingredient nutrition: ${lines.join(', ')}`);
    this.name = 'UnresolvedNutritionError';
    this.lines = lines;
  }
}

export function normaliseAiIngredients(value, portionSize = '') {
  const source = Array.isArray(value)
    ? value
    : splitIngredientText(value || portionSize);

  return source.map(ingredient => {
    if (typeof ingredient === 'object' && ingredient !== null) {
      const name = ingredient.item || ingredient.name || '';
      const amount = ingredient.amount || ingredient.quantity || '';
      return `${name} ${amount}`.replace(/\s+/g, ' ').trim();
    }
    return String(ingredient || '').replace(/\s+/g, ' ').trim();
  }).filter(Boolean);
}

// `onUnresolved: 'estimate'` lets a caller accept the model's own macro figures
// for a meal where a minority of ingredient lines don't resolve, rather than
// losing an otherwise good edit to one unrecognised line. The result is marked
// `nutritionEstimated` so the UI can say so. Anything from half the lines up is
// too far off-vocabulary to vouch for and still throws.
export function canonicaliseAiMeal(meal = {}, { onUnresolved = 'throw' } = {}) {
  const ingredients = normaliseAiIngredients(meal.ingredients, meal.portion_size);
  const raw = computeMealNutritionRaw(ingredients);

  if (raw.unmatched.length) {
    const resolvable = onUnresolved === 'estimate'
      && raw.unmatched.length * 2 < ingredients.length;
    if (!resolvable) throw new UnresolvedNutritionError(raw.unmatched);

    const estimated = readStatedNutrition(meal);
    return {
      ...meal,
      ...estimated,
      ingredients,
      portion_size: ingredients.join(', '),
      nutritionEstimated: true,
      unresolvedIngredients: raw.unmatched,
    };
  }

  const nutrition = roundNutrition(raw);

  return {
    ...meal,
    calories: nutrition.kcal,
    kcal: nutrition.kcal,
    protein: nutrition.protein,
    carbs: nutrition.carbs,
    fats: nutrition.fats,
    fibre: nutrition.fibre,
    ingredients,
    portion_size: ingredients.join(', '),
  };
}

// The model writes macros under whichever of the accepted aliases it picks;
// validateEditedMeal has already checked they're present and in range.
function readStatedNutrition(meal) {
  const nutrition = roundNutrition({
    kcal: meal.kcal ?? meal.calories,
    protein: meal.protein,
    carbs: meal.carbs ?? meal.carbohydrates,
    fats: meal.fats ?? meal.fat,
    fibre: meal.fibre ?? meal.fiber,
  });

  return {
    calories: nutrition.kcal,
    kcal: nutrition.kcal,
    protein: nutrition.protein,
    carbs: nutrition.carbs,
    fats: nutrition.fats,
    fibre: nutrition.fibre,
  };
}

export function canonicaliseAiPlan(plan = {}) {
  const weeklyPlan = (plan.weekly_plan || []).map(day => {
    // Called through a lambda so map's index argument can't land in the options.
    const meals = (day.meals || []).map(meal => canonicaliseAiMeal(meal));
    const totals = sumNutrition(meals);
    return {
      ...day,
      meals,
      daily_totals: {
        calories: totals.kcal,
        kcal: totals.kcal,
        protein: totals.protein,
        carbs: totals.carbs,
        fats: totals.fats,
        fibre: totals.fibre,
      },
    };
  });

  return {
    ...plan,
    weekly_plan: weeklyPlan,
    shopping_list: buildShoppingList(weeklyPlan),
  };
}
