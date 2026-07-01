import { chooseBlogVisual } from '../data/visualAssets.js';

const DOMAIN = 'https://www.mealprep.org.uk';
const STATIC_OG = `${DOMAIN}/og-preview.png`;

const BLOG_OG_IMAGES = {
  'best-meal-prep-containers-uk': '/og/blog/best-meal-prep-containers-uk.png',
  'meal-prep-containers-uk': '/og/blog/meal-prep-containers-uk.png',
  'best-glass-meal-prep-containers-uk': '/og/blog/best-glass-meal-prep-containers-uk.png',
  'plastic-meal-prep-containers-uk': '/og/blog/plastic-meal-prep-containers-uk.png',
  'microwave-safe-meal-prep-containers-uk': '/og/blog/microwave-safe-meal-prep-containers-uk.png',
  'how-to-build-a-calorie-deficit': '/og/blog/how-to-build-a-calorie-deficit.png',
  '1500-vs-1800-vs-2000-calories': '/og/blog/1500-vs-1800-vs-2000-calories.png',
  '1200-calorie-meal-plan-uk': '/og/blog/1200-calorie-meal-plan-uk.png',
  '1400-calorie-meal-plan-uk': '/og/blog/1400-calorie-meal-plan-uk.png',
  '1600-calorie-meal-plan-uk': '/og/blog/1600-calorie-meal-plan-uk.png',
  '1800-calorie-meal-plan-for-weight-loss-uk': '/og/blog/1800-calorie-meal-plan-for-weight-loss-uk.png',
  '2000-calorie-weight-loss-meal-plan-uk': '/og/blog/2000-calorie-weight-loss-meal-plan-uk.png',
  'high-protein-low-calorie-meals': '/og/blog/high-protein-low-calorie-meals.png',
  'cheap-protein-sources-uk-supermarkets': '/og/blog/cheap-protein-sources-uk-supermarkets.png',
  'tesco-low-calorie-shopping-list': '/og/blog/tesco-low-calorie-shopping-list.png',
  'aldi-high-protein-shopping-list-uk': '/og/blog/aldi-high-protein-shopping-list-uk.png',
  'generic-uk-supermarket-meal-plan': '/og/blog/generic-uk-supermarket-meal-plan.png',
};

function absoluteAsset(path) {
  return `${DOMAIN}${path}`;
}

export const generateMealPlanImageUrl = () => STATIC_OG;
export const generateBlogImageUrl = slug => {
  if (BLOG_OG_IMAGES[slug]) return absoluteAsset(BLOG_OG_IMAGES[slug]);
  const fallback = chooseBlogVisual(slug);
  return fallback?.src ? absoluteAsset(fallback.src) : STATIC_OG;
};
export const hasCustomBlogImage = slug => Boolean(BLOG_OG_IMAGES[slug] || chooseBlogVisual(slug)?.src);
