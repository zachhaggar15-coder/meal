const BRAND_SUFFIX = ' | MealPrep.org.uk';
const TITLE_MIN_LENGTH = 28;
const TITLE_MAX_LENGTH = 70;

/**
 * Keep document titles inside the editorial review range without changing the
 * visible page heading. Long titles lose redundant branding first, then use a
 * word-safe ending; genuinely short titles gain the site name for context.
 */
export function fitMetadataTitle(value, {
  minLength = TITLE_MIN_LENGTH,
  maxLength = TITLE_MAX_LENGTH,
} = {}) {
  let title = String(value || '').replace(/\s+/g, ' ').trim();
  if (!title) return 'MealPrep.org.uk - Free UK Meal Plans';

  if (title.length < minLength && !title.endsWith(BRAND_SUFFIX)) {
    title = `${title}${BRAND_SUFFIX}`;
  }

  if (title.length <= maxLength) return title;

  const withoutBrand = title.replace(/\s*[|\u2014-]\s*MealPrep\.org\.uk$/i, '').trim();
  if (withoutBrand.length >= minLength && withoutBrand.length <= maxLength) {
    return withoutBrand;
  }

  title = withoutBrand
    .replace(/\bFree Weekly Plans?\b/gi, 'Weekly Plans')
    .replace(/\bPrintable PDFs?\b/gi, 'PDFs')
    .replace(/\bShopping Lists?\b/gi, 'Lists')
    .replace(/\bMeal Prep Containers?\b/gi, 'Meal Prep Boxes')
    .replace(/\band\b/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();

  if (title.length <= maxLength) return title;
  return truncateAtWord(title, maxLength);
}

function truncateAtWord(value, maxLength) {
  const clipped = value.slice(0, maxLength - 1).trim();
  const lastSpace = clipped.lastIndexOf(' ');
  const safeCut = lastSpace >= Math.max(TITLE_MIN_LENGTH, maxLength - 18)
    ? clipped.slice(0, lastSpace)
    : clipped;
  return `${safeCut.replace(/[\s,;:!?&|\u2014-]+$/, '')}\u2026`;
}

export const METADATA_TITLE_LIMITS = Object.freeze({
  min: TITLE_MIN_LENGTH,
  max: TITLE_MAX_LENGTH,
});
