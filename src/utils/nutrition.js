import { computeIngredientNutrition } from '../data/nutritionTable.js';
import { parseIngredientLine } from './ingredientParser.js';

const MACRO_KEYS = ['kcal', 'protein', 'carbs', 'fats', 'fibre'];
export const NUTRITION_KEYS = Object.freeze([...MACRO_KEYS]);

export function splitIngredientText(text) {
  const parts = [];
  let depth = 0;
  let current = '';

  for (const char of String(text || '')) {
    if (char === '(') depth += 1;
    if (char === ')') depth = Math.max(0, depth - 1);
    if (char === ',' && depth === 0) {
      parts.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim()) parts.push(current);
  return parts.map(part => part.trim()).filter(Boolean);
}

export function computeMealNutritionRaw(ingredients) {
  const lines = Array.isArray(ingredients)
    ? ingredients
    : splitIngredientText(ingredients);

  const totals = { kcal: 0, protein: 0, carbs: 0, fats: 0, fibre: 0 };
  const unmatched = [];
  const ingredientsAudit = [];

  for (const line of lines) {
    const parsed = parseIngredientLine(line);
    const result = computeIngredientNutrition(parsed);
    ingredientsAudit.push({ line, parsed, ...result });

    for (const key of MACRO_KEYS) {
      totals[key] += Number(result[key] || 0);
    }

    if (!result.matched) unmatched.push(line);
  }

  return {
    ...totals,
    unmatched,
    ingredientsAudit,
  };
}

export function roundNutrition(nutrition = {}) {
  return {
    kcal: Math.round(Number(nutrition.kcal || 0)),
    protein: Math.max(0, Math.round(Number(nutrition.protein || 0))),
    carbs: Math.max(0, Math.round(Number(nutrition.carbs || 0))),
    fats: Math.max(0, Math.round(Number(nutrition.fats || 0))),
    fibre: Math.max(0, Math.round(Number(nutrition.fibre || 0))),
    unmatched: Array.isArray(nutrition.unmatched) ? nutrition.unmatched : [],
  };
}

export function computeMealNutrition(ingredients) {
  return roundNutrition(computeMealNutritionRaw(ingredients));
}

export function scaleNutrition(nutrition, portionScale = 1, calorieOverride = null) {
  const scale = Number.isFinite(portionScale) ? portionScale : 1;
  return roundNutrition({
    kcal: Number.isFinite(calorieOverride)
      ? calorieOverride
      : Number(nutrition?.kcal || 0) * scale,
    protein: Number(nutrition?.protein || 0) * scale,
    carbs: Number(nutrition?.carbs || 0) * scale,
    fats: Number(nutrition?.fats || 0) * scale,
    fibre: Number(nutrition?.fibre || 0) * scale,
  });
}

export function sumNutrition(items = []) {
  const totals = Object.fromEntries(MACRO_KEYS.map(key => [
    key,
    items.reduce((sum, item) => sum + Number(item?.[key] || 0), 0),
  ]));
  return roundNutrition(totals);
}

export function averageDailyMacros(days = []) {
  const usableDays = days.filter(Boolean);
  if (!usableDays.length) {
    return { protein: 0, carbs: 0, fats: 0, fibre: 0 };
  }

  const totals = usableDays.reduce((sum, day) => {
    const source = day.totals || {};
    return {
      protein: sum.protein + Number(source.protein || 0),
      carbs: sum.carbs + Number(source.carbs || 0),
      fats: sum.fats + Number(source.fats || 0),
      fibre: sum.fibre + Number(source.fibre || 0),
    };
  }, { protein: 0, carbs: 0, fats: 0, fibre: 0 });

  return {
    protein: Math.round(totals.protein / usableDays.length),
    carbs: Math.round(totals.carbs / usableDays.length),
    fats: Math.round(totals.fats / usableDays.length),
    fibre: Math.round(totals.fibre / usableDays.length),
  };
}
