import { buildPracticalRecipeSteps } from './recipeQuality.js';
import { getCookingIngredientDisplay } from './cookingQuantities.js';
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
  const baseIngredients = addApprovedLegacyFlavouring(
    meal.name,
    normaliseLegacyIngredients(meal.ingredients, meal.portion_size, meal.name),
  );
  const ingredients = scaleIngredientsForPortion(baseIngredients, portionScale);
  const nutrition = computeMealNutrition(ingredients);
  const mealWithIngredients = {
    ...meal,
    ...nutrition,
    desc: cleanLegacyCopy(meal.desc),
    calculationIngredients: ingredients,
    ingredients,
    cookingIngredients: getCookingIngredientDisplay(ingredients),
    portion_size: ingredients.join(', '),
  };

  return {
    ...mealWithIngredients,
    recipe: buildPracticalRecipeSteps(mealWithIngredients),
  };
}

function addApprovedLegacyFlavouring(mealName, ingredients) {
  const needsMixedHerbs = /^(?:Grilled Chicken with Roasted Mediterranean Veg|Grilled Lean Beef Steak with Roasted Veg|Roast Chicken & Roasted Veg)$/i.test(String(mealName || ''));
  if (!needsMixedHerbs || ingredients.some(item => /\bherbs?\b/i.test(item))) return ingredients;
  return [...ingredients, 'Mixed herbs 1 tsp'];
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
      const canonicalTotal = meals.reduce((sum, meal) => sum + meal.kcal, 0);
      const difference = Math.abs(canonicalTotal - Number(targetCalories));
      if (difference < closestDifference) {
        closestMeals = meals;
        closestDifference = difference;
      }
      if (!canonicalTotal || difference <= 1) break;
      scale *= Number(targetCalories) / canonicalTotal;
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

function cleanLegacyCopy(value) {
  return String(value || '')
    .replace(/\.\s*Use about .*$/i, '')
    .replace(/\s*Use about .*?(?:\.|$)/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}
