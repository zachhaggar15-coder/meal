import { buildPracticalRecipeSteps } from './recipeQuality.js';
import { computeMealNutrition, computeMealNutritionRaw, splitIngredientText, sumNutrition } from './nutrition.js';
import { scaleIngredientsForPortion } from './planBuilder.js';

export function normaliseLegacyIngredients(value, portionSize, mealName) {
  if (Array.isArray(value)) {
    const ingredients = value.map(formatLegacyIngredient).filter(Boolean);
    if (ingredients.length) return ingredients;
  }

  if (typeof value === 'string' && value.trim()) {
    const ingredients = splitIngredientText(value).map(formatLegacyIngredient).filter(Boolean);
    if (ingredients.length) return ingredients;
  }

  if (portionSize) {
    const ingredients = splitIngredientText(portionSize).map(formatLegacyIngredient).filter(Boolean);
    if (ingredients.length) return ingredients;
  }

  return mealName ? [String(mealName)] : [];
}

export function canonicaliseLegacyMeal(meal = {}, portionScale = 1) {
  const baseIngredients = normaliseLegacyIngredients(meal.ingredients, meal.portion_size, meal.name);
  const ingredients = scaleIngredientsForPortion(baseIngredients, portionScale);
  const nutrition = computeMealNutrition(ingredients);
  const mealWithIngredients = {
    ...meal,
    ...nutrition,
    desc: cleanLegacyCopy(meal.desc),
    ingredients,
    portion_size: ingredients.join(', '),
  };

  return {
    ...mealWithIngredients,
    recipe: normaliseLegacyRecipe(meal.recipe) || buildPracticalRecipeSteps(mealWithIngredients),
  };
}

export function buildCanonicalLegacyPlan(plan, targetCalories) {
  if (!Array.isArray(plan) || !Number.isFinite(Number(targetCalories))) return [];

  return plan.map(day => {
    const sourceMeals = Array.isArray(day.meals) ? day.meals : [];
    const baseTotal = sourceMeals.reduce((sum, meal) => (
      sum + computeMealNutritionRaw(
        normaliseLegacyIngredients(meal.ingredients, meal.portion_size, meal.name),
      ).kcal
    ), 0);
    let scale = baseTotal > 0 ? Number(targetCalories) / baseTotal : 1;
    let meals = [];
    let closestMeals = [];
    let closestDifference = Number.POSITIVE_INFINITY;

    for (let pass = 0; pass < 6; pass += 1) {
      meals = sourceMeals.map(meal => canonicaliseLegacyMeal(meal, scale));
      const displayedTotal = meals.reduce((sum, meal) => sum + meal.kcal, 0);
      const difference = Math.abs(displayedTotal - Number(targetCalories));
      if (difference < closestDifference) {
        closestMeals = meals;
        closestDifference = difference;
      }
      if (!displayedTotal || difference <= 1) break;
      scale *= Number(targetCalories) / displayedTotal;
    }
    meals = closestMeals.length ? closestMeals : meals;

    return {
      ...day,
      meals,
      totals: sumNutrition(meals),
    };
  });
}

function formatLegacyIngredient(ingredient) {
  if (typeof ingredient === 'object' && ingredient !== null) {
    const name = ingredient.item || ingredient.name || '';
    const amount = ingredient.amount ? ` ${ingredient.amount}` : '';
    return cleanLegacyCopy(`${name}${amount}`);
  }
  return cleanLegacyCopy(ingredient);
}

function normaliseLegacyRecipe(recipe) {
  if (Array.isArray(recipe)) {
    const steps = recipe.map(cleanLegacyCopy).filter(Boolean);
    return steps.length ? steps.slice(0, 8) : null;
  }

  if (typeof recipe === 'string') {
    const steps = recipe
      .split(/\n+|(?:^|\s)\d+\.\s*/g)
      .map(cleanLegacyCopy)
      .filter(Boolean);
    return steps.length ? steps.slice(0, 8) : null;
  }

  return null;
}

function cleanLegacyCopy(value) {
  return String(value || '')
    .replace(/\.\s*Use about .*$/i, '')
    .replace(/\s*Use about .*?(?:\.|$)/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}
