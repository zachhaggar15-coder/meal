// Shared vocabulary for turning the site's existing taxonomy (supermarket,
// goal, calorie target, diet, budget tier) into the handful of clusters the
// Pinterest boards are organised around.
//
// Nothing here is Pinterest-only knowledge: every value comes from the same
// `match` objects that src/data/mealPlanHubs.js and
// src/data/comboLandingPages.js already use to select plans.

import { SUPERMARKET_PROFILES } from '../data/supermarketProfiles.js';

export const SUPERMARKET_KEYS = Object.freeze(
  Object.keys(SUPERMARKET_PROFILES).filter(key => key !== 'any'),
);

export function supermarketLabel(key) {
  return SUPERMARKET_PROFILES[key]?.label || '';
}

const HIGH_PROTEIN_GOALS = new Set([
  'high-protein-low-cal',
  'cheap-high-protein',
  'high-protein-vegetarian',
  'budget-bodybuilding',
  'muscle-gain',
  'body-recomp',
  'gym-beginner',
]);

const BUDGET_GOALS = new Set([
  'budget-fat-loss',
  'cheap-student',
  'cheap-high-protein',
  'budget-bodybuilding',
]);

const WEIGHT_LOSS_GOALS = new Set([
  'weight-loss',
  'budget-fat-loss',
  'cutting',
  'vegetarian-low-cal',
  'vegan-low-cal',
  'high-protein-low-cal',
]);

const BUDGET_TIERS = new Set(['very-cheap', 'budget']);

// Word-level signals for editorial articles, which carry no `match` object.
const TEXT_SIGNALS = Object.freeze([
  ['high-protein', /\bhigh[- ]protein\b|\bprotein\b|\bmuscle\b|\bbulking\b|\bgym\b/i],
  ['budget', /\bbudget\b|\bcheap\b|\bstudent\b|\bcost\b|\baffordable\b|\bsave money\b/i],
  ['calorie', /\b\d{3,4}\s*(?:kcal|calorie)\b|\bcalorie[- ]deficit\b|\blow[- ]calorie\b|\bcalories\b/i],
  ['weight-loss', /\bweight[- ]loss\b|\blose weight\b|\bfat[- ]loss\b|\bcutting\b|\bdeficit\b/i],
  ['vegetarian', /\bvegetarian\b|\bmeat[- ]free\b/i],
  ['vegan', /\bvegan\b|\bplant[- ]based\b/i],
  ['shopping-list', /\bshopping list\b|\bmeal plan\b/i],
  ['containers', /\bcontainer\b|\btub\b|\bstorage\b|\bfreezer\b/i],
  ['batch-cooking', /\bbatch\b|\bmeal prep\b|\bprep\b/i],
]);

/**
 * Clusters for a page that has a hub/combo-style `match` object.
 */
export function clustersFromMatch(match = {}) {
  const clusters = new Set();
  const goals = match.goals || [];
  const diets = match.diets || match.dietTypes || [];

  if (goals.some(goal => HIGH_PROTEIN_GOALS.has(goal))) clusters.add('high-protein');
  if (goals.some(goal => BUDGET_GOALS.has(goal))) clusters.add('budget');
  if ((match.budgets || []).some(tier => BUDGET_TIERS.has(tier))) clusters.add('budget');
  if (goals.some(goal => WEIGHT_LOSS_GOALS.has(goal))) clusters.add('weight-loss');
  if ((match.calories || []).length) clusters.add('calorie');
  if (diets.includes('vegetarian')) clusters.add('vegetarian');
  if (diets.includes('vegan')) clusters.add('vegan');

  return [...clusters];
}

/**
 * Clusters inferred from a page's own words. Used for editorial articles and
 * as a supplement for hubs whose slug says more than their `match` does
 * (`budget-shopping-list`, `printable-meal-plans`).
 */
export function clustersFromText(...parts) {
  const text = parts.filter(Boolean).join(' ');
  return TEXT_SIGNALS.filter(([, pattern]) => pattern.test(text)).map(([cluster]) => cluster);
}

/**
 * Which supermarkets a page is about, taken from its `match` where present and
 * otherwise from its slug and title. 'any' is not a supermarket: it is the
 * average-price catch-all, and a Pin claiming a store it does not name would
 * be wrong.
 */
export function supermarketsFromText(...parts) {
  const text = parts.filter(Boolean).join(' ').toLowerCase();
  return SUPERMARKET_KEYS.filter(key => {
    if (key === 'marks-spencer') return /\bm&s\b|marks[- ]spencer/.test(text);
    if (key === 'sainsburys') return /sainsbury/.test(text);
    if (key === 'coop') return /\bco-?op\b/.test(text);
    return new RegExp(`\\b${key}\\b`).test(text);
  });
}

/**
 * The single calorie figure a page is built around, or null when it spans a
 * range. Used for the creative and the description, so it must be the number
 * the page itself commits to.
 */
export function primaryCalorieTarget(match = {}, slug = '') {
  const fromSlug = /^(\d{3,4})-calorie/.exec(slug);
  if (fromSlug) return Number(fromSlug[1]);
  const calories = match.calories || [];
  return calories.length === 1 ? Number(calories[0]) : null;
}

// The one thing a page is mainly about, used to pick its board.
//
// Boards should reflect what a page says it is, not every cluster it happens
// to touch: an "Aldi weight loss" hub also mentions protein, but nobody
// browsing a high-protein board expects to find it there. Order is the
// priority order, and it is deliberate - supermarket comes first because it is
// the strongest Pinterest search this site can answer, and it is applied by
// the board matcher rather than here.
const PRIMARY_TOPIC_RULES = Object.freeze([
  // A page that names a calorie figure is a calorie page whatever else it
  // mentions: "1,800 calorie meal plan for weight loss" is what people search
  // for on the number, not on the goal.
  ['calorie', /\d{3,4}\s*(?:kcal|calorie)/i],
  ['high-protein', /high[- ]protein|\bprotein\b|\bmuscle\b|bodybuilding|\bgym\b|lean bulk|\bbulking\b/i],
  ['budget', /\bbudget\b|\bcheap\b|\bstudent\b|\bcost\b|save money|\baffordable\b/i],
  ['weight-loss', /weight[- ]loss|lose weight|fat[- ]loss|\bcutting\b|belly fat|calorie deficit|\bdeficit\b/i],
  ['calorie', /low[- ]calorie|\bcalories?\b/i],
]);

/**
 * Only the page's own slug and title are read here. A category label or a
 * section kicker describes where a page sits in the site, not what the page
 * promises, and using it put low-calorie articles on the protein board.
 */
export function primaryTopic({ slug = '', title = '', calorieTarget = null } = {}) {
  if (calorieTarget) return 'calorie';
  const text = [slug.replace(/[-/]/g, ' '), title].filter(Boolean).join(' ');
  const hit = PRIMARY_TOPIC_RULES.find(([, pattern]) => pattern.test(text));
  return hit ? hit[0] : 'general';
}
