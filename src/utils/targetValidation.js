export function calorieTargetResult(days = [], targetCalories) {
  const target = Number(targetCalories);
  const usableDays = days.filter(day => Number.isFinite(Number(day?.totals?.kcal)));
  if (!target || usableDays.length !== 7) {
    return { eligible: false, meanDifferencePercent: null, dayDifferencesPercent: [] };
  }
  const dayDifferencesPercent = usableDays.map(day => (
    ((Number(day.totals.kcal) - target) / target) * 100
  ));
  const mean = usableDays.reduce((sum, day) => sum + Number(day.totals.kcal), 0) / usableDays.length;
  const meanDifferencePercent = ((mean - target) / target) * 100;
  return {
    eligible: Math.abs(meanDifferencePercent) <= 3
      && dayDifferencesPercent.every(difference => Math.abs(difference) <= 7.5),
    meanDifferencePercent,
    dayDifferencesPercent,
  };
}

export function proteinTargetResult(days = [], targetProtein) {
  const target = Number(targetProtein);
  const usableDays = days.filter(day => Number.isFinite(Number(day?.totals?.protein)));
  if (!target || usableDays.length !== 7) {
    return { eligible: false, meanDifferenceGrams: null, dayDifferencesPercent: [] };
  }
  const mean = usableDays.reduce((sum, day) => sum + Number(day.totals.protein), 0) / usableDays.length;
  const tolerance = Math.max(5, target * 0.05);
  const dayDifferencesPercent = usableDays.map(day => (
    ((Number(day.totals.protein) - target) / target) * 100
  ));
  return {
    eligible: Math.abs(mean - target) <= tolerance
      && dayDifferencesPercent.every(difference => Math.abs(difference) <= 10),
    meanDifferenceGrams: mean - target,
    toleranceGrams: tolerance,
    dayDifferencesPercent,
  };
}

export function proteinFilterMatches(actualProtein, targetProtein) {
  const actual = Number(actualProtein);
  const target = Number(targetProtein);
  if (!Number.isFinite(actual) || !Number.isFinite(target) || target <= 0) return false;
  return Math.abs(actual - target) <= Math.max(5, target * 0.05);
}
