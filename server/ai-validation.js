export function parseJsonObject(value) {
  if (typeof value !== 'string') return null;

  try {
    return JSON.parse(value);
  } catch {
    const cleaned = value
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    try {
      return JSON.parse(cleaned);
    } catch {
      return null;
    }
  }
}

export function validateGeneratedPlan(plan) {
  if (!plan || typeof plan !== 'object') return false;
  if (!Array.isArray(plan.weekly_plan) || plan.weekly_plan.length < 1 || plan.weekly_plan.length > 7) {
    return false;
  }

  return plan.weekly_plan.every(day => (
    typeof day?.day === 'string' &&
    Array.isArray(day.meals) &&
    day.meals.length >= 1 &&
    day.meals.length <= 6 &&
    day.meals.every(validateGeneratedMeal) &&
    validateTotals(day.daily_totals)
  ));
}

export function validateGeneratedMeal(meal) {
  if (!meal || typeof meal !== 'object') return false;

  const calories = Number(meal.calories ?? meal.kcal);
  const protein = Number(meal.protein);

  return (
    typeof meal.type === 'string' &&
    typeof meal.name === 'string' &&
    meal.name.trim().length > 0 &&
    Number.isFinite(calories) &&
    calories > 0 &&
    calories < 2000 &&
    Number.isFinite(protein) &&
    protein >= 0 &&
    protein < 250 &&
    hasUsefulIngredients(meal.ingredients) &&
    typeof meal.portion_size === 'string' &&
    meal.portion_size.trim().length > 0 &&
    Array.isArray(meal.recipe) &&
    meal.recipe.length >= 2 &&
    meal.recipe.length <= 8
  );
}

export function validateEditedMealPayload(payload) {
  return Boolean(payload?.meal && validateEditedMeal(payload.meal));
}

export function validateEditedMeal(meal) {
  if (!meal || typeof meal !== 'object') return false;

  const calories = Number(meal.kcal ?? meal.calories);
  const protein = Number(meal.protein);

  return (
    typeof meal.name === 'string' &&
    meal.name.trim().length > 0 &&
    typeof meal.type === 'string' &&
    Number.isFinite(calories) &&
    calories > 0 &&
    calories < 2000 &&
    Number.isFinite(protein) &&
    protein >= 0 &&
    protein < 250 &&
    Array.isArray(meal.ingredients) &&
    meal.ingredients.length > 0 &&
    meal.ingredients.every(item => typeof item === 'string' && item.trim()) &&
    typeof meal.portion_size === 'string' &&
    meal.portion_size.trim().length > 0 &&
    Array.isArray(meal.recipe) &&
    meal.recipe.length >= 2 &&
    meal.recipe.length <= 8
  );
}

function hasUsefulIngredients(value) {
  if (!Array.isArray(value) || value.length === 0) return false;
  return value.every(item => {
    if (typeof item === 'string') return item.trim().length > 0;
    if (item && typeof item === 'object') {
      return Boolean(String(item.item || item.name || '').trim());
    }
    return false;
  });
}

function validateTotals(totals) {
  if (!totals || typeof totals !== 'object') return true;
  const calories = Number(totals.calories ?? totals.kcal);
  const protein = Number(totals.protein);
  return (
    Number.isFinite(calories) &&
    calories > 0 &&
    calories < 6000 &&
    Number.isFinite(protein) &&
    protein >= 0 &&
    protein < 600
  );
}
