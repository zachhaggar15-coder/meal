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

export function canonicaliseAiMeal(meal = {}) {
  const ingredients = normaliseAiIngredients(meal.ingredients, meal.portion_size);
  const raw = computeMealNutritionRaw(ingredients);
  if (raw.unmatched.length) throw new UnresolvedNutritionError(raw.unmatched);
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

export function canonicaliseAiPlan(plan = {}) {
  const weeklyPlan = (plan.weekly_plan || []).map(day => {
    const meals = (day.meals || []).map(canonicaliseAiMeal);
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
