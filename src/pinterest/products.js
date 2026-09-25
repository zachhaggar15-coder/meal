// Pins that advertise the 6-week PDF meal plans (src/data/mealPrepPdfProducts.js).
//
// Every product page, and the /meal-prep-pdfs shop page, becomes a Pinterest
// entry with several Pins of its own: a different food photo and a different
// hook on each, so Pinterest sees fresh Pins rather than one advert repeated.
// They go on the existing Aldi and Lidl boards - the Aldi plans on Aldi, the
// Lidl plans on Lidl, the complete collection on Aldi and the shop page on
// Lidl - and the release queue mixes them in between the free pages (see
// schedule.js) rather than posting them back to back.
//
// Everything written here comes from the product record - its name, tagline,
// description, page count, price and what it includes - so a Pin can never
// promise something the product page does not. Prices are read from the same
// record the shop renders, so a price change reaches the Pins on the next build.
//
// A product that is not on sale yet (its page shows "Available soon") is
// dropped at build time by scripts/generate-pinterest-assets.js, so Pinterest
// is never sent to a product nobody can buy.

import { MEAL_PREP_PDF_PRODUCTS } from '../data/mealPrepPdfProducts.js';

export const PDF_SHOP_PATH = '/meal-prep-pdfs';

// Dinners per six-week plan, as the product copy states ("24 dinner recipes").
const DINNERS_PER_PLAN = 24;

// Photos checked in at assets/pinterest/photos/ (JPEG copies of the site's own
// category photos under public/images/meal-plans/, because the PNG renderer
// cannot read WebP). Each Pin for a product uses a different one.
const PHOTOS = Object.freeze({
  dinner: ['batch-cooking', 'weekly-prep', 'printable-plan', 'supermarket-shop'],
  protein: ['muscle-gain', 'high-protein', 'printable-plan', 'supermarket-shop'],
  bundle: ['muscle-gain', 'batch-cooking', 'printable-plan', 'low-calorie'],
  shop: ['batch-cooking', 'muscle-gain'],
});

/**
 * True for a genuine Lemon Squeezy checkout link: https, on a
 * *.lemonsqueezy.com store, at /checkout/buy/<id> or /buy/<id>. A product page
 * whose buy button points anywhere else is treated as not on sale, so no Pin
 * ever sends someone to a broken or placeholder checkout.
 */
export function isRealCheckoutUrl(value) {
  let url;
  try {
    url = new URL(String(value || '').replace(/&amp;/g, '&'));
  } catch {
    return false;
  }
  return url.protocol === 'https:'
    && /^[a-z0-9-]+\.lemonsqueezy\.com$/.test(url.hostname)
    && /^\/(checkout\/)?buy\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/?$/.test(url.pathname);
}

export function formatPrice(value) {
  return `£${Number(value).toFixed(2)}`;
}

// The opening line of a description: up to its first full stop, or its first
// dash when that comes sooner, so it reads as a headline.
function firstSentence(value) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  const sentence = (text.match(/^.+?[.!?](?=\s|$)/) || [text])[0];
  return sentence.split(/\s*—\s*/)[0];
}

// "Hook | Product name" when it fits a Pin title, then "Hook | Store", then
// the hook alone - the store keeps the Aldi and Lidl Pins from sharing a title.
function hookTitle(hook, ...suffixes) {
  const clean = hook.replace(/[.!?]$/, '');
  for (const suffix of suffixes.filter(Boolean)) {
    if (`${clean} | ${suffix}`.length <= 64) return `${clean} | ${suffix}`;
  }
  return clean;
}

function singlePins(product) {
  const store = product.supermarket;
  const protein = /protein/i.test(product.slug);
  const photos = protein ? PHOTOS.protein : PHOTOS.dinner;
  const price = formatPrice(product.priceGBP);
  const facts = [
    `${DINNERS_PER_PLAN} dinner recipes, nutrition worked out`,
    'Weekly shopping list by aisle',
    `${product.pages}-page PDF · ${price}`,
  ];
  const includes = 'A week-by-week planner, a weekly shopping list organised by supermarket aisle and 24 dinner recipes with the nutrition worked out.';
  const delivery = `${product.pages}-page PDF, ${price}, delivered straight after purchase.`;
  const dinners = protein ? `${DINNERS_PER_PLAN} high-protein ${store} dinners` : `${DINNERS_PER_PLAN} ${store} dinners`;

  return [
    {
      title: `${product.name}: ${product.tagline}`,
      headline: product.name,
      sub: product.tagline,
      description: `${product.description} ${includes} ${delivery}`,
    },
    {
      title: hookTitle(firstSentence(product.description), product.name, store),
      headline: firstSentence(product.description),
      sub: `${product.name} · 6 weeks`,
      description: `${product.description} ${delivery}`,
    },
    {
      title: `${dinners}, planned for six weeks`,
      headline: `${dinners}, planned for six weeks`,
      sub: product.name,
      description: `${includes} ${product.description} ${delivery}`,
    },
    {
      title: `Six weeks of ${protein ? 'high-protein ' : ''}${store} shopping lists, sorted by aisle`,
      headline: 'Six weeks of shopping lists, sorted by aisle',
      sub: `${product.name} · ${price}`,
      description: `Every week comes with a shopping list organised by ${store} aisle, a planner and the recipes to go with it. ${product.description} ${delivery}`,
    },
  ].map((pin, index) => ({ ...pin, facts, photo: photos[index] }));
}

function bundlePins(product) {
  const plans = product.bundleOf.map(slug => MEAL_PREP_PDF_PRODUCTS[slug]).filter(Boolean);
  const dinners = plans.length * DINNERS_PER_PLAN;
  const price = formatPrice(product.priceGBP);
  const separate = plans.reduce((sum, plan) => sum + plan.priceGBP, 0);
  const where = product.supermarket || 'Aldi and Lidl';
  const count = plans.length === 2 ? 'Both' : `All ${plans.length}`;
  const facts = [
    `${plans.length} six-week plans in one`,
    `${dinners} dinner recipes for two`,
    `${price} instead of ${formatPrice(separate)}`,
  ];
  const planNames = plans.map(plan => plan.name.replace(/^The /, '')).join(', ');
  const delivery = plans.length <= 2
    ? `${price} for ${plans.length} PDF plans (${planNames}), delivered straight after purchase.`
    : `${price} for all ${plans.length} PDF plans, delivered straight after purchase.`;

  return [
    {
      title: `${product.name}: ${product.tagline}`,
      headline: product.name,
      sub: product.tagline,
      description: `${product.description} ${delivery}`,
    },
    {
      title: `${count} ${where} 6-week meal plans for ${price}`,
      headline: `${count} ${where} 6-week plans for ${price}`,
      sub: product.name,
      description: `${delivery} ${product.description}`,
    },
    {
      title: `${dinners} ${where} dinners, planned for you`,
      headline: `${dinners} dinners, planned for you`,
      sub: `${product.name} · ${product.tagline}`,
      description: `${dinners} dinner recipes across ${plans.length} six-week plans, each with a weekly planner and an aisle-by-aisle shopping list. ${product.description} ${delivery}`,
    },
    {
      // "Switch between Aldi and Lidl, dinner and high-protein, week by week"
      // is too long for a title or a headline; its point is switching plans
      // week by week.
      title: firstSentence(product.description).length <= 60
        ? hookTitle(firstSentence(product.description), product.name)
        : `Switch between ${count.toLowerCase()} ${where} plans week by week`,
      headline: firstSentence(product.description).length <= 60
        ? firstSentence(product.description)
        : `Switch between ${count.toLowerCase()} plans week by week`,
      sub: `${product.name} · ${price}`,
      description: `${product.description} ${delivery}`,
    },
  ].map((pin, index) => ({ ...pin, facts, photo: PHOTOS.bundle[index] }));
}

function shopPins(products) {
  const singles = products.filter(product => product.kind === 'single');
  const from = formatPrice(Math.min(...singles.map(product => product.priceGBP)));
  const facts = [
    '6 weeks of dinners for two',
    'Planner, shopping list and recipes',
    `Aldi and Lidl plans from ${from}`,
  ];
  return [
    {
      title: '6-Week Meal Prep PDF Plans for Aldi and Lidl',
      headline: '6-week meal prep plans for Aldi and Lidl',
      sub: `Dinner and high-protein · from ${from}`,
      description: `Downloadable 6-week dinner and high-protein meal plans for two, built around Aldi and Lidl: a weekly planner, an aisle-organised shopping list and 24 recipes with the nutrition worked out. Single plans from ${from}.`,
    },
    {
      title: 'Never wonder what’s for dinner for six weeks',
      headline: 'Six weeks of dinners, already planned',
      sub: `Aldi and Lidl PDF plans · from ${from}`,
      description: `Six weeks of dinners for two, planned around one supermarket: pick Aldi or Lidl, dinner or high-protein, and get the planner, the shopping list and the recipes in one PDF. Single plans from ${from}.`,
    },
  ].map((pin, index) => ({ ...pin, facts, photo: PHOTOS.shop[index] }));
}

/**
 * Pinterest entries for the PDF shop, in the shape eligibility.js expects of
 * PINTEREST_PRODUCT_ENTRIES, each with its own `pins`.
 */
export function pdfProductEntries(catalogue = MEAL_PREP_PDF_PRODUCTS) {
  const products = Object.values(catalogue);
  const entries = products.map(product => {
    const pins = product.kind === 'bundle' ? bundlePins(product) : singlePins(product);
    // The complete collection covers both chains; it goes on the Aldi board,
    // and the shop page (below) on the Lidl one, so each board carries four.
    const supermarket = String(product.supermarket || 'aldi').toLowerCase();
    return {
      path: `${PDF_SHOP_PATH}/${product.slug}`,
      title: pins[0].title,
      description: pins[0].description,
      kicker: '6-week PDF plan',
      supermarket: supermarket || null,
      benefits: pins[0].facts,
      priceGBP: product.priceGBP,
      pins,
    };
  });

  if (products.some(product => product.kind === 'single')) {
    const pins = shopPins(products);
    entries.push({
      path: PDF_SHOP_PATH,
      title: pins[0].title,
      description: pins[0].description,
      kicker: '6-week PDF plans',
      supermarket: 'lidl',
      benefits: pins[0].facts,
      priceGBP: null,
      pins,
    });
  }
  return entries;
}
