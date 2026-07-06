import { parseIngredientLine } from '../../src/utils/ingredientParser.js';
import { computeIngredientNutrition } from '../../src/data/nutritionTable.js';

// Splits a comma-separated ingredient string without breaking apart a
// composite item whose own description contains commas, e.g.
// "3 energy balls (30g total: dates, walnuts, cacao)" must stay one item.
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
  return parts.map(p => p.trim()).filter(Boolean);
}

// Sums kcal/protein across a meal's ingredients (either a structured array
// from mealLibrary.js, or a raw portion_size string from mealPlans.js).
export function computeMealNutrition(ingredients) {
  const lines = Array.isArray(ingredients)
    ? ingredients
    : splitIngredientText(ingredients);

  let kcal = 0;
  let protein = 0;
  const unmatched = [];

  for (const line of lines) {
    const parsed = parseIngredientLine(line);
    const result = computeIngredientNutrition(parsed);
    kcal += result.kcal;
    protein += result.protein;
    if (!result.matched) unmatched.push(line);
  }

  return {
    kcal: Math.round(kcal),
    protein: Math.round(protein),
    unmatched,
  };
}

export function percentDiff(stored, computed) {
  if (!stored) return computed ? 100 : 0;
  return Math.round(((computed - stored) / stored) * 1000) / 10;
}
