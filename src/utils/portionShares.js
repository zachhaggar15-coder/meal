export const PORTION_SHARE_DENOMINATOR = 20;

export function getCommonDenominatorPortionShares(
  portions = [],
  denominator = PORTION_SHARE_DENOMINATOR,
) {
  if (!Array.isArray(portions) || portions.length === 0) return [];

  const safeDenominator = Math.max(portions.length, Math.round(Number(denominator) || 0));
  const scales = portions.map(portion => {
    const scale = Number(portion?.portionScale);
    return Number.isFinite(scale) && scale > 0 ? scale : 1;
  });
  const totalScale = scales.reduce((sum, scale) => sum + scale, 0);
  const exactShares = scales.map(scale => (scale / totalScale) * safeDenominator);
  const numerators = exactShares.map(share => Math.max(1, Math.floor(share)));

  let allocated = numerators.reduce((sum, numerator) => sum + numerator, 0);

  while (allocated < safeDenominator) {
    let bestIndex = 0;
    let bestRemainder = -Infinity;

    exactShares.forEach((share, index) => {
      const remainder = share - numerators[index];
      if (remainder > bestRemainder) {
        bestRemainder = remainder;
        bestIndex = index;
      }
    });

    numerators[bestIndex] += 1;
    allocated += 1;
  }

  while (allocated > safeDenominator) {
    let bestIndex = -1;
    let smallestRemainder = Infinity;

    exactShares.forEach((share, index) => {
      if (numerators[index] <= 1) return;
      const remainder = share - numerators[index];
      if (remainder < smallestRemainder) {
        smallestRemainder = remainder;
        bestIndex = index;
      }
    });

    if (bestIndex < 0) break;
    numerators[bestIndex] -= 1;
    allocated -= 1;
  }

  return portions.map((portion, index) => ({
    ...portion,
    denominator: safeDenominator,
    fraction: `${numerators[index]}/${safeDenominator}`,
    numerator: numerators[index],
  }));
}
