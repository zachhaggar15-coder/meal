// Central Pinterest configuration.
//
// Everything Pinterest-specific that a human might reasonably want to change
// lives here. Nothing in this directory is a second content store: eligibility,
// metadata and creatives are all derived from the site's existing data files,
// so adding or editing a meal-plan hub, combo page or article is the only
// action needed for Pinterest to pick it up.
//
// See docs/pinterest.md for how to expand, shrink or switch the system off.

import { SITE_URL } from '../constants/site.js';

export const PINTEREST_ENABLED = true;

// RSS + image assets are written under this path at build time. Both are
// static files in dist/, so Pinterest's crawler and the RSS poller hit the CDN
// and never the application.
export const PINTEREST_BASE_PATH = '/pinterest';
export const PINTEREST_IMAGE_PATH = `${PINTEREST_BASE_PATH}/img`;

// Pinterest's own guidance is 2:3 vertical. 1000x1500 is the standard.
export const PIN_IMAGE_WIDTH = 1000;
export const PIN_IMAGE_HEIGHT = 1500;

// UTM convention. Campaign is the board key, so GA4 reports break Pinterest
// traffic down by the board that produced it without any further config.
export const PINTEREST_UTM = Object.freeze({
  source: 'pinterest',
  medium: 'organic',
});

// How many entries the whole system may publish. The initial rollout
// deliberately stays small: a few dozen strong pages beats several hundred
// near-identical ones, which is what Pinterest treats as spam. Raise this, and
// the per-board `limit` values below, to widen the rollout.
export const TOTAL_ENTRY_LIMIT = 50;

// Near-duplicate protection, applied inside each board.
//
// Two pages with the same store, the same goal cluster and the same calorie
// target are the same Pin as far as a Pinterest user is concerned, however
// different their URLs are. Only the highest-scoring one of each signature is
// published. The supermarket cap then stops one chain filling a mixed board.
export const MAX_ENTRIES_PER_SIGNATURE = 1;
export const MAX_ENTRIES_PER_SUPERMARKET_PER_BOARD = 3;

// A page must score at least this to be published at all.
export const MIN_ELIGIBILITY_SCORE = 55;

// Programmatic /plans/ pages are excluded from the initial rollout. There are
// 1,205 of them, 400 indexable, and they differ from one another by a store
// name and a calorie number - exactly the near-duplicate pattern Pinterest
// penalises, and the same structural problem that got the site turned down by
// AdSense in September 2026 (see src/data/planIndexAllowlist.js). The hub and
// combo pages already represent every one of those intents editorially.
//
// Set this to true only with evidence that the hubs are producing impressions
// and that there is Pinterest demand the hubs cannot serve.
export const INCLUDE_PLAN_PAGES = false;

// Boards. Each eligible page is assigned to exactly ONE board, so the feeds
// are a partition rather than overlapping views - connecting all of them to
// Pinterest cannot produce the same Pin twice.
//
// `feed` is the filename under /pinterest/. `board` is the suggested Pinterest
// board name. `match` is evaluated in array order, first match wins, and the
// last entry is the catch-all.
export const PINTEREST_BOARDS = Object.freeze([
  {
    key: 'aldi',
    feed: 'aldi.xml',
    board: 'Aldi Meal Plans UK',
    title: 'MealPrep.org.uk - Aldi meal plans',
    description: 'Free Aldi meal plans, shopping lists and budget meal prep ideas for UK kitchens.',
    limit: 6,
    // A single-chain board is exempt from the per-chain cap below: capping
    // Aldi on the Aldi board would only starve it.
    chain: 'aldi',
    match: entry => entry.supermarkets.includes('aldi'),
  },
  {
    key: 'lidl',
    feed: 'lidl.xml',
    board: 'Lidl Meal Plans UK',
    title: 'MealPrep.org.uk - Lidl meal plans',
    description: 'Free Lidl meal plans, shopping lists and budget meal prep ideas for UK kitchens.',
    limit: 6,
    chain: 'lidl',
    match: entry => entry.supermarkets.includes('lidl'),
  },
  {
    key: 'supermarket',
    feed: 'supermarket.xml',
    board: 'UK Supermarket Meal Plans',
    title: 'MealPrep.org.uk - UK supermarket meal plans',
    description: 'Free meal plans built around Tesco, Asda, Sainsbury’s, Morrisons, Iceland and other UK supermarkets.',
    limit: 8,
    match: entry => entry.supermarkets.length > 0,
  },
  {
    key: 'calorie-plans',
    feed: 'calorie-plans.xml',
    board: 'Calorie Meal Plans UK',
    title: 'MealPrep.org.uk - calorie-target meal plans',
    description: 'Free UK meal plans built to a daily calorie target, from 1,200 up to 3,500 kcal.',
    limit: 7,
    // An explicit single calorie target, not the looser "mentions calories"
    // signal - a Pin that promises "1,500 kcal" has to come from a page built
    // to 1,500 kcal.
    match: entry => entry.topic === 'calorie',
  },
  {
    key: 'high-protein',
    feed: 'high-protein.xml',
    board: 'High Protein Meal Plans UK',
    title: 'MealPrep.org.uk - high protein meal plans',
    description: 'Free high-protein UK meal plans and shopping lists for fat loss, the gym and everyday meal prep.',
    limit: 7,
    match: entry => entry.topic === 'high-protein',
  },
  {
    key: 'budget',
    feed: 'budget.xml',
    board: 'Budget Meal Plans UK',
    title: 'MealPrep.org.uk - budget meal plans',
    description: 'Free cheap and student UK meal plans with shopping lists that keep the weekly shop down.',
    limit: 6,
    match: entry => entry.topic === 'budget',
  },
  {
    key: 'weight-loss',
    feed: 'weight-loss.xml',
    board: 'Weight Loss Meal Plans UK',
    title: 'MealPrep.org.uk - weight loss meal plans',
    description: 'Free UK weight-loss meal plans and shopping lists built around normal supermarket food.',
    limit: 6,
    match: entry => entry.topic === 'weight-loss',
  },
  {
    key: 'guides',
    feed: 'guides.xml',
    board: 'UK Meal Prep Guides',
    title: 'MealPrep.org.uk - meal prep guides',
    description: 'Practical UK meal prep and nutrition guides: batch cooking, protein, shopping lists and containers.',
    limit: 6,
    match: () => true,
  },
]);

// The complete feed. It is a superset of every board feed and exists for
// debugging and for a future Pinterest API adapter - it is deliberately NOT
// meant to be connected to a board, because doing so would duplicate every Pin.
export const PINTEREST_MASTER_FEED = Object.freeze({
  key: 'all',
  feed: 'feed.xml',
  board: null,
  title: 'MealPrep.org.uk - all Pinterest-eligible pages',
  description: 'Every MealPrep.org.uk page currently eligible for Pinterest. Diagnostic feed - connect the per-board feeds instead.',
});

export const PINTEREST_FEED_URLS = Object.freeze(
  Object.fromEntries([
    [PINTEREST_MASTER_FEED.key, `${SITE_URL}${PINTEREST_BASE_PATH}/${PINTEREST_MASTER_FEED.feed}`],
    ...PINTEREST_BOARDS.map(board => [board.key, `${SITE_URL}${PINTEREST_BASE_PATH}/${board.feed}`]),
  ]),
);

// Paid product landing pages.
//
// The repository currently has no first-party paid product: /mealprep-plus is
// a noindex waitlist for a service that does not exist yet, and the only
// commercial links are Amazon affiliate products inside editorial articles.
// When a paid product ships (for example a six-week Aldi plan), add one entry
// here and it joins the feeds with no other code change. Every field is
// asserted on the product page itself - do not write a benefit here that the
// page does not support.
//
// Shape: { path, title, description, benefits: string[], supermarket, clusters }
export const PINTEREST_PRODUCT_ENTRIES = Object.freeze([]);

// Share of any one feed that paid products may occupy, so a product launch
// cannot take a board over.
export const MAX_PRODUCT_SHARE_PER_FEED = 0.25;
