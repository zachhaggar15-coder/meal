export const MACRO_MATCH_LIMITS = Object.freeze({
  protein: { exact: 15, close: 30 },
  carbs: { exact: 25, close: 50 },
  fats: { exact: 10, close: 20 },
  fibre: { exact: 8, close: 15 },
});

export function impliedMacroCalories(macros = {}) {
  const protein = Number(macros.protein);
  const carbs = Number(macros.carbs);
  const fats = Number(macros.fats);
  if (![protein, carbs, fats].every(Number.isFinite)) return null;
  return Math.round((protein * 4) + (carbs * 4) + (fats * 9));
}

export function validateMacroCalorieConsistency(macros, calorieTarget) {
  const target = Number(calorieTarget);
  const implied = impliedMacroCalories(macros);
  if (!Number.isFinite(target) || target <= 0 || implied === null) return { valid: true, impliedCalories: implied };

  // Food-label rounding and fibre treatment create small differences, so the
  // targets need not add up exactly. A 15% band is wide enough for those
  // effects but rejects combinations describing materially different diets.
  const tolerance = Math.max(150, Math.round(target * 0.15));
  const difference = Math.abs(implied - target);
  return {
    valid: difference <= tolerance,
    impliedCalories: implied,
    targetCalories: target,
    tolerance,
    difference,
  };
}

export function macroMatchStatus(target = {}, actual = {}) {
  const differences = Object.fromEntries(Object.keys(MACRO_MATCH_LIMITS).map(key => [
    key,
    Math.abs(Number(actual[key] || 0) - Number(target[key] || 0)),
  ]));
  const exact = Object.entries(MACRO_MATCH_LIMITS).every(([key, limit]) => differences[key] <= limit.exact);
  if (exact) return 'exact';
  const close = Object.entries(MACRO_MATCH_LIMITS).every(([key, limit]) => differences[key] <= limit.close);
  return close ? 'close' : 'tradeoff';
}
