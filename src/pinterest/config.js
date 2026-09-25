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

// How many pages the whole system may publish. This is the size of the pool,
// not how many Pins appear at once: the release queue (below) hands them to
// Pinterest a few a day. Raise this, and the per-board `limit` values below,
// to widen the pool.
export const TOTAL_ENTRY_LIMIT = 300;

// Near-duplicate protection, applied inside each board.
//
// Two templated pages (hubs, combos, plans) with the same store, the same goal
// cluster and the same calorie target are the same Pin as far as a Pinterest
// user is concerned, however different their URLs are. Only the
// highest-scoring one of each signature is published. Editorial articles are
// exempt: each is its own piece of writing (see selectForBoard). The supermarket cap then stops one chain filling a mixed board.
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

// Release queue.
//
// Pinterest's RSS import only makes a Pin from an item it has not seen before.
// The first version of these feeds published every page on day one and then
// never changed, so Pinterest made one batch of Pins on 16 September 2026 and
// nothing after it - impressions spiked once and went flat. Pinterest also
// rewards accounts that publish fresh Pins steadily over ones that bulk-upload.
//
// So every Pin now has a release date, and a feed only shows the Pins whose
// date has passed (api/pinterest-feed.js filters at request time, so no
// redeploy is needed for tomorrow's Pins to appear). The pages in the launch batch
// (below) keep the launch date, and everything else is released PINS_PER_DAY
// at a time from PINTEREST_DRIP_START, taking boards in turn.
export const PINTEREST_LAUNCH_DATE = '2026-09-15';
export const PINTEREST_DRIP_START = '2026-09-26';
export const PINS_PER_DAY = 6;

// The 49 pages the launch feeds carried from 15 September 2026. Pinterest has
// already made Pins from them, so they keep the launch date rather than being
// queued again. This list is history: never add to it.
export const PINTEREST_LAUNCH_BATCH = Object.freeze([
  '/blog/aldi-high-protein-shopping-list-uk',
  '/meal-plans/aldi-1500-calorie-meal-plan',
  '/blog/aldi-low-calorie-food-ideas-uk',
  '/meal-plans/aldi-weight-loss',
  '/meal-plans/aldi',
  '/blog/lidl-high-protein-food-ideas-uk',
  '/meal-plans/lidl',
  '/meal-plans/lidl-budget-meal-prep',
  '/meal-plans/lidl-weight-loss',
  '/meal-plans/asda-1800-calorie-meal-plan',
  '/blog/asda-budget-meal-ideas-uk',
  '/blog/morrisons-meal-prep-uk',
  '/meal-plans/tesco-1500-calorie-meal-plan',
  '/meal-plans/tesco-weight-loss',
  '/blog/iceland-meal-prep-uk',
  '/meal-plans/tesco-high-protein-meal-plan',
  '/blog/asda-meal-prep-uk',
  '/meal-plans/1500-calorie',
  '/blog/1800-calorie-meal-plan-for-weight-loss-uk',
  '/blog/2000-calorie-weight-loss-meal-plan-uk',
  '/blog/500-calorie-dinner-ideas-uk',
  '/meal-plans/3000-calorie',
  '/meal-plans/3500-calorie',
  '/blog/1400-calorie-meal-plan-uk',
  '/blog/high-protein-low-calorie-meals',
  '/meal-plans/high-protein-shopping-list',
  '/blog/best-cheap-high-protein-foods-uk',
  '/meal-plans/high-protein',
  '/blog/high-protein-snacks-uk',
  '/blog/cheap-protein-sources-uk-supermarkets',
  '/blog/cutting-breakfast-ideas-uk',
  '/meal-plans/budget-shopping-list',
  '/blog/cheap-meal-prep-shopping-list-uk',
  '/blog/how-much-should-meal-prep-cost-uk',
  '/meal-plans/cheap-student',
  '/blog/meal-prep-for-beginners-uk',
  '/blog/family-meal-prep-on-a-budget-uk',
  '/meal-plans/weight-loss',
  '/blog/how-to-lose-weight-fast-uk',
  '/blog/best-low-calorie-foods-uk',
  '/blog/cutting-lunch-ideas-uk',
  '/blog/cutting-food-ideas-uk',
  '/blog/how-many-calories-to-lose-weight',
  '/meal-plans/free-online-diet-plans-uk',
  '/meal-plans/vegetarian',
  '/blog/generic-uk-supermarket-meal-plan',
  '/blog/meal-prep-shopping-list-template-uk',
  '/blog/overnight-oats-meal-prep-uk',
  '/meal-plans/vegan-batch-cooking-meal-plan',
]);

// Pinterest counts a new image as a fresh Pin even when the page is the same.
// Once every page has had its first Pin, each gets a second one with a
// different design and copy led by the page's intro rather than its meta
// description. 1 turns this off.
export const PIN_VARIANTS_PER_PAGE = 2;

// How many released items a feed shows, newest first. Pinterest only needs the
// recent ones, and a short feed is quick for it to poll.
export const FEED_ITEM_LIMIT = 30;

// The build warns when the queue has fewer than this many days of unreleased
// Pins left, so it never silently runs dry again.
export const QUEUE_WARNING_DAYS = 14;

// Boards. Each eligible page is assigned to exactly ONE board, so the feeds
// are a partition rather than overlapping views - connecting all of them to
// Pinterest cannot produce the same Pin twice.
//
// `feed` is the filename under /pinterest/. `board` is the suggested Pinterest
// board name. `match` is evaluated in array order, first match wins, and the
// last entry is the catch-all. `limit` caps how many pages the board may ever
// hold; the release queue decides when each one reaches Pinterest.
export const PINTEREST_BOARDS = Object.freeze([
  {
    key: 'aldi',
    feed: 'aldi.xml',
    board: 'Aldi Meal Plans UK',
    title: 'MealPrep.org.uk - Aldi meal plans',
    description: 'Free Aldi meal plans, shopping lists and budget meal prep ideas for UK kitchens.',
    limit: 20,
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
    limit: 20,
    chain: 'lidl',
    match: entry => entry.supermarkets.includes('lidl'),
  },
  {
    key: 'supermarket',
    feed: 'supermarket.xml',
    board: 'UK Supermarket Meal Plans',
    title: 'MealPrep.org.uk - UK supermarket meal plans',
    description: 'Free meal plans built around Tesco, Asda, Sainsbury’s, Morrisons, Iceland and other UK supermarkets.',
    limit: 30,
    match: entry => entry.supermarkets.length > 0,
  },
  {
    key: 'calorie-plans',
    feed: 'calorie-plans.xml',
    board: 'Calorie Meal Plans UK',
    title: 'MealPrep.org.uk - calorie-target meal plans',
    description: 'Free UK meal plans built to a daily calorie target, from 1,200 up to 3,500 kcal.',
    limit: 40,
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
    limit: 40,
    match: entry => entry.topic === 'high-protein',
  },
  {
    key: 'budget',
    feed: 'budget.xml',
    board: 'Budget Meal Plans UK',
    title: 'MealPrep.org.uk - budget meal plans',
    description: 'Free cheap and student UK meal plans with shopping lists that keep the weekly shop down.',
    limit: 25,
    match: entry => entry.topic === 'budget',
  },
  {
    key: 'weight-loss',
    feed: 'weight-loss.xml',
    board: 'Weight Loss Meal Plans UK',
    title: 'MealPrep.org.uk - weight loss meal plans',
    description: 'Free UK weight-loss meal plans and shopping lists built around normal supermarket food.',
    limit: 25,
    match: entry => entry.topic === 'weight-loss',
  },
  {
    key: 'guides',
    feed: 'guides.xml',
    board: 'UK Meal Prep Guides',
    title: 'MealPrep.org.uk - meal prep guides',
    description: 'Practical UK meal prep and nutrition guides: batch cooking, protein, shopping lists and containers.',
    limit: 120,
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
// The 6-week PDF meal plans are added automatically from
// src/data/mealPrepPdfProducts.js by src/pinterest/products.js - do not list
// them here. Add an entry here only for some other paid product, and it joins
// the feeds with no other code change. Every field is
// asserted on the product page itself - do not write a benefit here that the
// page does not support.
//
// Shape: { path, title, description, benefits: string[], supermarket, clusters }
export const PINTEREST_PRODUCT_ENTRIES = Object.freeze([]);
