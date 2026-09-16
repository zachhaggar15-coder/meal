// Paid PDF meal-plan products sold via Lemon Squeezy (store: Mealprepuk).
// Each single plan is a six-week plan for two adults: a weekly planner, a
// weekly shopping list organised by aisle, 24 dinner recipes with the
// nutrition worked out, a list of cupboard basics, ingredient swaps and a
// blank planner. Pricing and descriptions mirror what was declared to Lemon
// Squeezy during store approval — keep the two in step if either changes.
//
// `checkoutEnvVar` names the Vite env var holding that product's live-mode
// Lemon Squeezy buy link (see src/utils/lemonSqueezy.js). Until that env var
// is set in Vercel, the product renders with an "Available soon" state
// instead of a checkout link — see checkoutUrl().

const INCLUDES = [
  'A week-by-week planner for six weeks',
  'A weekly shopping list organised by supermarket aisle',
  '24 dinner recipes with the nutrition worked out',
  'A cupboard basics checklist',
  'Ingredient swaps for common substitutions',
  'A blank planner page to reuse for a seventh week onwards',
];

const TRADEMARK_DISCLAIMER = (supermarket) =>
  `Named after ${supermarket} only to describe where the ingredients are bought. MealPrep.org.uk is not affiliated with, endorsed by, or connected to ${supermarket}.`;

export const MEAL_PREP_PDF_PRODUCTS = {
  'aldi-dinner-plan': {
    slug: 'aldi-dinner-plan',
    name: 'The Aldi Dinner Plan',
    kind: 'single',
    supermarket: 'Aldi',
    tagline: '6-Week Dinner Plan for Two',
    pages: 37,
    priceGBP: 9.99,
    checkoutEnvVar: 'VITE_LS_BUY_URL_ALDI_DINNER',
    description: 'Six weeks of Aldi dinners for two, planned out so you stop deciding what to have for dinner every night.',
    includes: INCLUDES,
    disclaimer: TRADEMARK_DISCLAIMER('Aldi'),
  },
  'aldi-high-protein-plan': {
    slug: 'aldi-high-protein-plan',
    name: 'The Aldi High-Protein Plan',
    kind: 'single',
    supermarket: 'Aldi',
    tagline: '6-Week High-Protein Plan for Two',
    pages: 42,
    priceGBP: 9.99,
    checkoutEnvVar: 'VITE_LS_BUY_URL_ALDI_PROTEIN',
    description: 'Six weeks of higher-protein Aldi dinners for two, for couples training or watching protein intake without giving up planning-free evenings.',
    includes: INCLUDES,
    disclaimer: TRADEMARK_DISCLAIMER('Aldi'),
  },
  'lidl-dinner-plan': {
    slug: 'lidl-dinner-plan',
    name: 'The Lidl Dinner Plan',
    kind: 'single',
    supermarket: 'Lidl',
    tagline: '6-Week Dinner Plan for Two',
    pages: 37,
    priceGBP: 9.99,
    checkoutEnvVar: 'VITE_LS_BUY_URL_LIDL_DINNER',
    description: 'Six weeks of Lidl dinners for two, planned out so you stop deciding what to have for dinner every night.',
    includes: INCLUDES,
    disclaimer: TRADEMARK_DISCLAIMER('Lidl'),
  },
  'lidl-high-protein-plan': {
    slug: 'lidl-high-protein-plan',
    name: 'The Lidl High-Protein Plan',
    kind: 'single',
    supermarket: 'Lidl',
    tagline: '6-Week High-Protein Plan for Two',
    pages: 41,
    priceGBP: 9.99,
    checkoutEnvVar: 'VITE_LS_BUY_URL_LIDL_PROTEIN',
    description: 'Six weeks of higher-protein Lidl dinners for two, for couples training or watching protein intake without giving up planning-free evenings.',
    includes: INCLUDES,
    disclaimer: TRADEMARK_DISCLAIMER('Lidl'),
  },
  'aldi-bundle': {
    slug: 'aldi-bundle',
    name: 'The Aldi Bundle',
    kind: 'bundle',
    supermarket: 'Aldi',
    tagline: 'Both Aldi 6-Week Plans',
    priceGBP: 14.99,
    checkoutEnvVar: 'VITE_LS_BUY_URL_ALDI_BUNDLE',
    description: 'The Aldi Dinner Plan and the Aldi High-Protein Plan together, at a saving on buying them separately.',
    bundleOf: ['aldi-dinner-plan', 'aldi-high-protein-plan'],
    disclaimer: TRADEMARK_DISCLAIMER('Aldi'),
  },
  'lidl-bundle': {
    slug: 'lidl-bundle',
    name: 'The Lidl Bundle',
    kind: 'bundle',
    supermarket: 'Lidl',
    tagline: 'Both Lidl 6-Week Plans',
    priceGBP: 14.99,
    checkoutEnvVar: 'VITE_LS_BUY_URL_LIDL_BUNDLE',
    description: 'The Lidl Dinner Plan and the Lidl High-Protein Plan together, at a saving on buying them separately.',
    bundleOf: ['lidl-dinner-plan', 'lidl-high-protein-plan'],
    disclaimer: TRADEMARK_DISCLAIMER('Lidl'),
  },
  'complete-collection': {
    slug: 'complete-collection',
    name: 'The Complete Collection',
    kind: 'bundle',
    supermarket: null,
    tagline: 'All Four 6-Week Meal Plans',
    priceGBP: 19.99,
    checkoutEnvVar: 'VITE_LS_BUY_URL_COMPLETE',
    description: 'All four 6-week plans — Aldi and Lidl, dinner and high-protein — for whichever supermarket and goal fits your week.',
    bundleOf: ['aldi-dinner-plan', 'aldi-high-protein-plan', 'lidl-dinner-plan', 'lidl-high-protein-plan'],
    disclaimer: 'Named after Aldi and Lidl only to describe where the ingredients are bought. MealPrep.org.uk is not affiliated with, endorsed by, or connected to either supermarket.',
  },
};

export const MEAL_PREP_PDF_SLUGS = Object.keys(MEAL_PREP_PDF_PRODUCTS);

export function getPdfProductBySlug(slug) {
  return MEAL_PREP_PDF_PRODUCTS[slug] || null;
}

// Picks the single-plan PDF that best matches a free plan's goal, for the
// "get 6 more weeks of it" cross-sell. Only Aldi and Lidl have PDFs today.
const HIGH_PROTEIN_GOAL_PATTERN = /protein|muscle|bodybuilding|recomp|gym/i;

export function findMatchingPdfProduct({ supermarket, goal }) {
  const key = String(supermarket || '').toLowerCase();
  if (key !== 'aldi' && key !== 'lidl') return null;

  const wantsHighProtein = HIGH_PROTEIN_GOAL_PATTERN.test(String(goal || ''));
  const slug = `${key}-${wantsHighProtein ? 'high-protein' : 'dinner'}-plan`;
  return getPdfProductBySlug(slug);
}
