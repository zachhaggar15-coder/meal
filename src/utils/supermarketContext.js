// Retailer context for editorial pages.
//
// An audit found that supermarket-named articles would survive a find-and-
// replace of the store name: they carried general meal-prep advice with a
// retailer mentioned in the introduction. Plan pages already differed by
// retailer, because `planBuilder` consumes `SUPERMARKET_PROFILES` — the
// articles never did.
//
// This module gives editorial pages the same two things a plan page gets:
//
//   1. researched, sourced facts about how that retailer actually works
//      (`mealPrepEvidence` on the profile, checked against the retailer's own
//      site and dated);
//   2. a summary computed from this site's own plan library, which is the part
//      no competing article can copy.
//
// Nothing here invents a fact. If a retailer has no researched evidence, the
// evidence block is simply absent rather than filled with something plausible.

import { getAllPlanMeta, GOAL_LABELS } from './planBuilder.js';
import { SUPERMARKET_PROFILES, getSupermarketProfile } from '../data/supermarketProfiles.js';

const DIET_LABELS = {
  standard: 'no specific dietary restriction',
  vegetarian: 'vegetarian',
  vegan: 'vegan',
  pescatarian: 'pescatarian',
};

const EFFORT_LABELS = {
  minimal: 'minimal prep',
  low: 'low effort',
  standard: 'standard cooking',
  batch: 'batch cooking',
  'high-variety': 'high variety',
};

let planCache = null;
function allPlans() {
  if (!planCache) planCache = getAllPlanMeta();
  return planCache;
}

function countBy(items, key) {
  const counts = new Map();
  for (const item of items) {
    const value = item?.[key];
    if (value === undefined || value === null || value === '') continue;
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])));
}

function median(numbers) {
  if (!numbers.length) return null;
  const sorted = [...numbers].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function formatList(values) {
  const list = values.filter(Boolean);
  if (!list.length) return '';
  if (list.length === 1) return list[0];
  return `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}`;
}

/**
 * What this site's own plan library actually holds for one retailer.
 *
 * Every number is computed from the current plan data, so it cannot drift away
 * from what the reader will find if they follow the links. Returns null when a
 * retailer has too few plans for a summary to mean anything.
 */
export function buildSupermarketPlanSummary(supermarket) {
  const plans = allPlans().filter(plan => plan.supermarket === supermarket);
  if (plans.length < 3) return null;

  const calories = plans.map(plan => Number(plan.calories)).filter(Number.isFinite);
  const proteins = plans.map(plan => Number(plan.macrosGrams?.protein)).filter(Number.isFinite);
  const goals = countBy(plans, 'goal');
  const diets = countBy(plans, 'dietType');
  const efforts = countBy(plans, 'effort');
  const budgets = countBy(plans, 'budget');

  const nonStandardDiets = diets.filter(([diet]) => diet !== 'standard');

  return {
    supermarket,
    planCount: plans.length,
    calorieRange: calories.length ? { min: Math.min(...calories), max: Math.max(...calories) } : null,
    medianProtein: median(proteins),
    proteinRange: proteins.length ? { min: Math.min(...proteins), max: Math.max(...proteins) } : null,
    goalCount: goals.length,
    topGoals: goals.slice(0, 3).map(([value, count]) => ({
      value,
      label: GOAL_LABELS?.[value] || value,
      count,
    })),
    dietCount: nonStandardDiets.reduce((total, [, count]) => total + count, 0),
    dietList: formatList(nonStandardDiets.map(([value]) => DIET_LABELS[value] || value)),
    effortList: formatList(efforts.slice(0, 3).map(([value]) => EFFORT_LABELS[value] || value)),
    budgetCount: budgets.length,
    /** A representative plan to link to: the plainest one at the commonest goal. */
    examplePlan: [...plans]
      .filter(plan => plan.goal === goals[0]?.[0] && plan.dietType === 'standard')
      .sort((a, b) => String(a.slug).split('-').length - String(b.slug).split('-').length
        || String(a.slug).localeCompare(String(b.slug)))[0] || plans[0],
  };
}

/** The researched retailer evidence, or null where none has been gathered. */
export function getSupermarketEvidence(supermarket) {
  return getSupermarketProfile(supermarket)?.mealPrepEvidence || null;
}

/**
 * Everything an editorial page needs to be genuinely about one retailer.
 * Returns null for an unknown retailer so a caller renders nothing rather than
 * an empty shell.
 */
export function buildSupermarketContext(supermarket) {
  const profile = SUPERMARKET_PROFILES[supermarket];
  if (!profile) return null;

  return {
    supermarket,
    label: profile.label,
    tier: profile.tier,
    valueRange: profile.valueRange,
    loyalty: profile.loyalty,
    positioning: profile.positioning,
    prepStrengths: profile.prepStrengths || [],
    watchOuts: profile.watchOuts || [],
    evidence: profile.mealPrepEvidence || null,
    planSummary: buildSupermarketPlanSummary(supermarket),
    hubPath: `/meal-plans/${supermarket}`,
    chooserPath: `/choose-supermarket/${supermarket}`,
  };
}

/** Retailers that have researched evidence, for auditing and tests. */
export function supermarketsWithEvidence() {
  return Object.keys(SUPERMARKET_PROFILES).filter(key => SUPERMARKET_PROFILES[key].mealPrepEvidence);
}

export { DIET_LABELS, EFFORT_LABELS };
