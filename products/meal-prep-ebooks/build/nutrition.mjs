// Nutrition for the books, computed through the site's own pipeline.
//
// The books do not carry hand-written macros. Every figure is calculated from
// the quantified ingredient list by src/utils/nutrition.js, which is the same
// path plan pages, print, email and JSON-LD use, so a recipe in a book and the
// same recipe on the site cannot disagree.
//
// Two rules from docs/nutrition-methodology.md drive the shape of this file:
//
//   - Recipe yield divides the full recipe exactly once. A dish written to four
//     portions is costed and calculated at four portions, whether those are
//     eaten as two dinners or as a dinner and two lunches.
//   - An unresolved ingredient makes the recipe ineligible. computeRecipe throws
//     rather than quietly returning a total that is missing an ingredient.
//
// Count units are avoided deliberately. "1 tin chopped tomatoes" resolves - to
// roughly one tomato, 22 kcal, not a 400g tin - so every material quantity in
// these books is written in grams or millilitres.

import { computeMealNutritionRaw, roundNutrition } from '../../../src/utils/nutrition.js';

/** Seasonings genuinely below the threshold the table models. */
export const negligible = (name) => `${name}, optional to taste (excluded from nutrition estimate)`;

const COUNT_UNIT_RISK = /^\s*\d+\s*(tin|tins|pack|packs|bag|bags|jar|jars|pot|pots|bunch|punnet|tub|tubs)\b/i;

export function computeRecipe(recipe) {
  const lines = recipe.ingredients.map((i) => i.line);

  for (const line of lines) {
    if (COUNT_UNIT_RISK.test(line)) {
      throw new Error(`${recipe.id}: "${line}" uses a pack/tin count, which resolves to the wrong weight. Use grams or ml.`);
    }
  }

  const total = computeMealNutritionRaw(lines);
  if (total.unmatched.length) {
    throw new Error(`${recipe.id}: unresolved ingredient(s): ${total.unmatched.join(' | ')}`);
  }

  const yieldPortions = Number(recipe.yield);
  if (!Number.isFinite(yieldPortions) || yieldPortions <= 0) {
    throw new Error(`${recipe.id}: recipe yield must be a positive number of portions`);
  }

  const perPortion = roundNutrition({
    kcal: total.kcal / yieldPortions,
    protein: total.protein / yieldPortions,
    carbs: total.carbs / yieldPortions,
    fats: total.fats / yieldPortions,
    fibre: total.fibre / yieldPortions,
  });

  return {
    ...recipe,
    macros: perPortion,
    proteinEnergyPercent: perPortion.kcal ? (perPortion.protein * 4 * 100) / perPortion.kcal : 0,
  };
}

export function computeAll(recipes) {
  return Object.fromEntries(
    Object.entries(recipes).map(([id, r]) => [id, computeRecipe({ ...r, id })])
  );
}

/**
 * Day and week checks from docs/nutrition-methodology.md: a calorie claim needs
 * the seven-day mean within +/-3% and every day within +/-7.5%.
 */
export function checkDays(days, target) {
  const rows = days.map((day) => {
    const kcal = day.meals.reduce((sum, m) => sum + m.kcal, 0);
    const protein = day.meals.reduce((sum, m) => sum + m.protein, 0);
    return {
      label: day.label,
      kcal,
      protein,
      diff: ((kcal - target) / target) * 100,
      proteinEnergyPercent: kcal ? (protein * 4 * 100) / kcal : 0,
    };
  });
  const mean = rows.reduce((s, r) => s + r.kcal, 0) / rows.length;
  return {
    rows,
    mean,
    meanDiff: ((mean - target) / target) * 100,
    everyDayWithin: rows.every((r) => Math.abs(r.diff) <= 7.5),
    meanWithin: Math.abs(((mean - target) / target) * 100) <= 3,
  };
}
