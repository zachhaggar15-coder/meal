export { computeMealNutrition, splitIngredientText } from '../../src/utils/nutrition.js';

export function percentDiff(stored, computed) {
  if (!stored) return computed ? 100 : 0;
  return Math.round(((computed - stored) / stored) * 1000) / 10;
}
