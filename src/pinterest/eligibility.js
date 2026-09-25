// Which pages are allowed into the Pinterest feeds, and in what order.
//
// This mirrors docs/programmatic-page-eligibility.md: a page is published only
// when it passes every rule, and the rules run on metadata the site already
// keeps rather than on a hand-maintained allowlist.
//
// Three content sources feed it:
//   - meal-plan hubs         (src/data/mealPlanHubs.js)
//   - combo landing pages    (src/data/comboLandingPages.js)
//   - editorial articles     (src/data/blogSearchIndex.json + blogPosts.js)
// plus any paid products declared in config.js.
//
// The 1,205 programmatic /plans/ routes are excluded by default - see
// INCLUDE_PLAN_PAGES in config.js for why.

import { MEAL_PLAN_HUBS } from '../data/mealPlanHubs.js';
import { COMBO_LANDING_PAGES, comboStatLabels } from '../data/comboLandingPages.js';
import { blogPostsData } from '../data/blogPosts.js';
import blogSearchIndex from '../data/blogSearchIndex.json' with { type: 'json' };
import { WEEKLY_SEO_INSIGHTS } from '../data/weeklySeoInsights.js';
import { INDEXABLE_PLAN_SEEDS } from '../data/planSeeds.js';
import { isPlanIndexed } from '../data/planIndexAllowlist.js';
import { buildPlan } from '../utils/planBuilder.js';
import {
  INCLUDE_PLAN_PAGES,
  MAX_ENTRIES_PER_SIGNATURE,
  MAX_ENTRIES_PER_SUPERMARKET_PER_BOARD,
  MIN_ELIGIBILITY_SCORE,
  PINTEREST_BOARDS,
  PINTEREST_PRODUCT_ENTRIES,
  TOTAL_ENTRY_LIMIT,
} from './config.js';
import { pdfProductEntries } from './products.js';
import {
  clustersFromMatch,
  clustersFromText,
  primaryCalorieTarget,
  primaryTopic,
  supermarketLabel,
  supermarketsFromText,
} from './taxonomy.js';

// Routes that must never enter a feed whatever else they score. Utility,
// account-like, legal and noindex surfaces. Kept as prefixes so a new route
// under any of them is excluded by default rather than by being remembered.
export const EXCLUDED_PATH_PREFIXES = Object.freeze([
  '/quiz',
  '/saved-plans',
  '/admin',
  '/feedback',
  '/contact',
  '/privacy',
  '/terms',
  '/about',
  '/methodology',
  '/404',
  '/mealprep-plus',
  '/choose-plan/',
  '/choose-supermarket/',
  '/choose-diet/',
  '/choose-calories/',
  '/browse',
  '/tools',
]);

// Editorial categories worth a Pin. Categories outside this list are still
// indexable pages; they just do not have a visual proposition that works on
// Pinterest.
const GUIDE_CATEGORY_SCORES = Object.freeze({
  'Supermarket Guides': 18,
  'Weight Loss & Calories': 16,
  'Protein & Nutrition': 16,
  'Meal Prep & Batch Cooking': 12,
  'Cost & Value Questions': 12,
  'Diet Types': 10,
  'Work, Family & Student Food': 8,
  // Equipment and container round-ups are affiliate comparison pages. They are
  // legitimate content, but their proposition is a product list rather than
  // something a Pinterest user saves for later, so they only reach the feed if
  // everything else about them is strong.
  'Meal Prep Tools & Equipment': 0,
  'Meal Prep Containers': 0,
  // Recipe-box comparisons send traffic to other companies' products.
  'Meal Delivery & Recipe Boxes': -30,
});

const TRENDING_PATHS = new Set(
  (WEEKLY_SEO_INSIGHTS.trendingLinks || []).map(link => link.to),
);

export function isExcludedPath(path) {
  return EXCLUDED_PATH_PREFIXES.some(prefix => (
    prefix.endsWith('/') ? path.startsWith(prefix) : path === prefix || path.startsWith(`${prefix}/`)
  ));
}

// ── Candidate construction ───────────────────────────────────────────────────

function hubCandidates() {
  return Object.values(MEAL_PLAN_HUBS).map(hub => {
    const match = hub.match || {};
    const supermarkets = (match.supermarkets || []).filter(key => key !== 'any');
    const clusters = [...new Set([
      ...clustersFromMatch(match),
      ...clustersFromText(hub.slug, hub.h1, hub.kicker),
    ])];

    return {
      id: `hub:${hub.slug}`,
      kind: 'hub',
      path: hub.path,
      title: hub.h1 || hub.title,
      metaTitle: hub.title,
      description: hub.description || '',
      proposition: hub.intro || hub.description || '',
      kicker: hub.kicker || 'UK meal plan hub',
      supermarkets,
      goals: match.goals || [],
      calorieTarget: primaryCalorieTarget(match, hub.slug),
      clusters,
      benefits: (hub.stats || []).slice(0, 3),
      depth: (hub.sections?.length || 0) + (hub.faq?.length || 0),
    };
  });
}

function comboCandidates() {
  return Object.values(COMBO_LANDING_PAGES).map(page => {
    const match = page.match || {};
    const supermarkets = (match.supermarkets || []).filter(key => key !== 'any');
    const clusters = [...new Set([
      ...clustersFromMatch(match),
      ...clustersFromText(page.slug, page.h1, page.kicker),
    ])];

    return {
      id: `combo:${page.slug}`,
      kind: 'combo',
      path: page.path,
      title: page.h1 || page.title,
      metaTitle: page.title,
      description: page.description || '',
      proposition: quickAnswerText(page.quickAnswer) || page.intro || page.description || '',
      kicker: page.kicker || 'UK meal-plan comparison',
      supermarkets,
      goals: match.goals || [],
      calorieTarget: primaryCalorieTarget(match, page.slug),
      clusters,
      benefits: comboStatLabels(page).slice(0, 3),
      depth: (page.faq?.length || 0) + 2,
    };
  });
}

// `quickAnswer` is a string on hub pages and a { answer, links } object on
// articles. Only the answer is copy.
function quickAnswerText(value) {
  if (!value) return '';
  return typeof value === 'string' ? value : String(value.answer || '');
}

function guideCandidates() {
  return blogSearchIndex.map(record => {
    const post = blogPostsData[record.slug] || {};
    const clusters = clustersFromText(record.slug, record.title, record.description);
    const supermarkets = supermarketsFromText(record.slug, record.title);

    return {
      id: `guide:${record.slug}`,
      kind: 'guide',
      path: `/blog/${record.slug}`,
      title: post.h1 || record.title,
      metaTitle: post.title || record.title,
      description: record.description || '',
      proposition: quickAnswerText(post.quickAnswer) || record.description || post.intro || '',
      kicker: record.category || 'UK meal prep guide',
      category: record.category || '',
      supermarkets,
      goals: [],
      calorieTarget: primaryCalorieTarget({}, record.slug),
      clusters,
      // Only facts the article itself supplies. An article has no `stats`
      // array, so these are counted from its own content rather than written.
      benefits: [
        post.faq?.length >= 3 ? `${post.faq.length} questions answered` : '',
        post.recipes?.length ? `${post.recipes.length} recipes included` : '',
      ].filter(Boolean),
      depth: post.sections?.length || 0,
      published: record.published || post.published || '',
      modified: post.modified || record.reviewed || '',
    };
  });
}

function productCandidates() {
  return [...PINTEREST_PRODUCT_ENTRIES, ...pdfProductEntries()].map((product, index) => ({
    id: `product:${product.path || index}`,
    kind: 'product',
    path: product.path,
    title: product.title,
    metaTitle: product.title,
    description: product.description || '',
    proposition: product.description || '',
    kicker: product.kicker || 'MealPrep.org.uk product',
    supermarkets: product.supermarket ? [product.supermarket] : [],
    goals: [],
    calorieTarget: product.calorieTarget ?? null,
    clusters: product.clusters || [],
    benefits: (product.benefits || []).slice(0, 3),
    depth: 6,
    priceGBP: product.priceGBP ?? null,
    // Hand-written Pins (a title, photo and hook each), when the product has them.
    ...(product.pins?.length ? { pins: product.pins } : {}),
  }));
}

// Off by default. When switched on, plan copy comes from the same buildPlan()
// the page itself renders from, so a Pin can never describe a plan differently
// from the page it links to. buildPlan is only called for the 400 Search
// Console-validated slugs, and only when the flag is set.
function planCandidates() {
  if (!INCLUDE_PLAN_PAGES) return [];
  return INDEXABLE_PLAN_SEEDS
    .filter(seed => isPlanIndexed(seed.slug))
    .map(seed => {
      const { seo } = buildPlan(seed);
      return {
      id: `plan:${seed.slug}`,
      kind: 'plan',
      path: `/plans/${seed.slug}`,
      title: seed.title,
      metaTitle: seo.title,
      description: seo.description,
      proposition: seo.description,
      kicker: 'Seven-day UK meal plan',
      supermarkets: seed.supermarket && seed.supermarket !== 'any' ? [seed.supermarket] : [],
      goals: [seed.goal],
      calorieTarget: seed.calories || null,
      clusters: clustersFromMatch({ goals: [seed.goal], calories: [seed.calories] }),
      benefits: ['Seven days of meals', 'Shopping list included'],
      depth: 3,
      };
    });
}

// Every candidate factory returns the same shape; this fills in the derived
// fields that depend on the finished record.
function finalise(candidate) {
  return {
    ...candidate,
    slug: candidate.path.split('/').filter(Boolean).pop() || '',
    topic: primaryTopic({
      slug: candidate.path,
      title: candidate.title,
      calorieTarget: candidate.calorieTarget,
    }),
  };
}

// ── Scoring ──────────────────────────────────────────────────────────────────

const KIND_BASE_SCORE = { product: 70, hub: 58, combo: 58, guide: 44, plan: 36 };

export function scoreCandidate(candidate) {
  const reasons = [];
  let score = KIND_BASE_SCORE[candidate.kind] ?? 0;
  reasons.push(`${candidate.kind} base ${score}`);

  const add = (points, why) => {
    if (!points) return;
    score += points;
    reasons.push(`${points > 0 ? '+' : ''}${points} ${why}`);
  };

  // A named supermarket is the single strongest Pinterest proposition this
  // site has: "Aldi meal plan" is a search people actually run on Pinterest.
  if (candidate.supermarkets.length === 1) add(12, 'single named supermarket');
  if (candidate.calorieTarget) add(8, 'explicit calorie target');
  if (candidate.clusters.includes('high-protein')) add(6, 'high-protein cluster');
  if (candidate.clusters.includes('budget')) add(6, 'budget cluster');
  if (candidate.clusters.includes('weight-loss')) add(4, 'weight-loss cluster');
  if (candidate.clusters.includes('shopping-list')) add(4, 'shopping-list proposition');

  // Editorial depth, capped so a long article cannot outrank a strong hub on
  // length alone.
  add(Math.min(candidate.depth * 2, 10), 'editorial depth');

  // A description in the range that reads well both in search and in a Pin.
  const length = candidate.description.length;
  if (length >= 80 && length <= 170) add(5, 'usable description length');

  if (candidate.kind === 'guide') {
    add(GUIDE_CATEGORY_SCORES[candidate.category] ?? -20, `category ${candidate.category || 'uncategorised'}`);
  }

  // Real measured performance, refreshed weekly by
  // scripts/weekly-analytics-improvements.js. No manual upkeep.
  if (TRENDING_PATHS.has(candidate.path)) add(15, 'currently trending in GA4/Search Console');

  return { score, reasons };
}

// ── Gates ────────────────────────────────────────────────────────────────────

function gateFailures(candidate) {
  const failures = [];
  if (!candidate.path || !candidate.path.startsWith('/')) failures.push('no canonical path');
  if (isExcludedPath(candidate.path)) failures.push('excluded route');
  if (!candidate.title || candidate.title.length < 12) failures.push('title too short');
  if (!candidate.description || candidate.description.length < 60) failures.push('description too short or missing');
  if (!candidate.proposition || candidate.proposition.length < 60) failures.push('no usable Pinterest proposition');
  return failures;
}

// ── Near-duplicate suppression ───────────────────────────────────────────────

/**
 * The identity of the *idea* behind a page, as opposed to its URL.
 *
 * "Aldi weight loss" is one idea whether it arrives as a hub, a combo page or
 * an article, and publishing all three would put three near-identical Pins on
 * one board. Only the highest-scoring page per signature is published.
 */
export function duplicateSignature(candidate) {
  const store = candidate.supermarkets[0] || 'none';
  const calories = candidate.calorieTarget || 'any';
  // With a named store the store/topic/target triple is the whole idea. Without
  // one, the full cluster set is what separates "high protein meal plans" from
  // "high protein shopping list", which are different propositions.
  const shape = store === 'none'
    ? [...candidate.clusters].sort().join('+') || candidate.topic
    : candidate.topic;
  return `${store}|${shape}|${calories}`;
}

/**
 * Pick a board's entries: best first, one page per idea, no single chain
 * dominating a mixed board, and never more than the board's own limit.
 */
function selectForBoard(candidates, board, titlesTaken = new Set()) {
  const perSignature = new Map();
  const perSupermarket = new Map();
  const kept = [];
  const suppressed = [];

  for (const candidate of candidates) {
    if (kept.length >= board.limit) {
      suppressed.push({ ...candidate, dropReason: `board limit (${board.key})` });
      continue;
    }

    // Two pages with the same heading would be two identical Pins, wherever
    // they sit on the site. The better-scoring one wins.
    const titleKey = String(candidate.title || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    if (titlesTaken.has(titleKey)) {
      suppressed.push({ ...candidate, dropReason: 'same title as a higher-scoring page' });
      continue;
    }

    // Templated pages (hubs, combos, plans) that share a signature differ only
    // by a store name or a number, so one of each is enough. Articles are
    // different: "why meal prep rice goes hard" and "air fryer meal prep" share
    // the batch-cooking signature but are separate pieces of writing with
    // their own titles and answers, and the release queue already spaces them
    // out, so they are not collapsed.
    const signature = duplicateSignature(candidate);
    const signatureCount = perSignature.get(signature) || 0;
    // Products have their own board and are never near-duplicates of a page.
    if (candidate.kind !== 'guide' && candidate.kind !== 'product' && signatureCount >= MAX_ENTRIES_PER_SIGNATURE) {
      suppressed.push({ ...candidate, dropReason: `near-duplicate of ${signature}` });
      continue;
    }

    // Only boards that mix chains need the per-chain cap; a single-chain board
    // declares itself with `chain` and is exempt.
    const store = candidate.supermarkets[0];
    const storeCount = store ? perSupermarket.get(store) || 0 : 0;
    if (!board.chain && store && storeCount >= MAX_ENTRIES_PER_SUPERMARKET_PER_BOARD) {
      suppressed.push({ ...candidate, dropReason: `supermarket cap (${store}) on ${board.key}` });
      continue;
    }

    titlesTaken.add(titleKey);
    // A product never takes a page's place as "the" Pin for its idea.
    if (candidate.kind !== 'product') perSignature.set(signature, signatureCount + 1);
    if (store) perSupermarket.set(store, storeCount + 1);
    kept.push(candidate);
  }

  return { kept, suppressed };
}

export function assignBoard(candidate) {
  return PINTEREST_BOARDS.find(board => board.match(candidate)) || null;
}

/**
 * The published set, ranked best first and already assigned to boards.
 *
 * Deterministic: the same repository state always produces the same list in
 * the same order, which is what keeps RSS GUIDs and image URLs stable.
 */
export function buildPinterestEntries() {
  const all = [
    ...productCandidates(),
    ...hubCandidates(),
    ...comboCandidates(),
    ...guideCandidates(),
    ...planCandidates(),
  ].map(finalise);

  const rejected = [];
  const scored = [];

  for (const candidate of all) {
    const failures = gateFailures(candidate);
    if (failures.length) {
      rejected.push({ id: candidate.id, path: candidate.path, reasons: failures });
      continue;
    }
    const { score, reasons } = scoreCandidate(candidate);
    if (score < MIN_ELIGIBILITY_SCORE) {
      rejected.push({ id: candidate.id, path: candidate.path, reasons: [`score ${score} < ${MIN_ELIGIBILITY_SCORE}`] });
      continue;
    }
    scored.push({
      ...candidate,
      score,
      scoreReasons: reasons,
      supermarketLabel: candidate.supermarkets[0] ? supermarketLabel(candidate.supermarkets[0]) : '',
    });
  }

  // Rank by score, then by path so ties never reorder between builds.
  scored.sort((a, b) => b.score - a.score || a.path.localeCompare(b.path));

  const suppressed = [];
  const published = [];
  const titlesTaken = new Set();

  for (const board of PINTEREST_BOARDS) {
    const forBoard = scored.filter(candidate => (
      !published.some(entry => entry.id === candidate.id)
      && !suppressed.some(entry => entry.id === candidate.id)
      && assignBoard(candidate)?.key === board.key
    ));
    const selection = selectForBoard(forBoard, board, titlesTaken);
    published.push(...selection.kept.map(candidate => ({ ...candidate, board })));
    suppressed.push(...selection.suppressed.map(item => ({
      id: item.id,
      path: item.path,
      reasons: [item.dropReason],
    })));
  }

  // Global backstop. Per-board limits already keep the total in range; this
  // guarantees it even if someone raises them without re-reading the note.
  const overflow = published.slice(TOTAL_ENTRY_LIMIT);
  const withinLimit = published.slice(0, TOTAL_ENTRY_LIMIT);

  return {
    published: withinLimit,
    rejected,
    suppressed: [
      ...suppressed,
      ...overflow.map(item => ({ id: item.id, path: item.path, reasons: ['over total entry limit'] })),
    ],
  };
}
