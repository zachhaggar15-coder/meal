// Per-hub context derived from the plans a hub actually matches.
//
// The 55 /meal-plans/ hub pages were 68-82% identical sentence-for-sentence,
// and the two largest contributors were both template-level rather than
// editorial: an identical 16-link "Popular UK searches" block on every hub, and
// generic advice paragraphs shared across every hub in a family. The site's own
// internal-linking policy already says to "prefer two to five contextual
// alternatives over large unrelated link blocks", so the fix is to derive both
// the links and a short factual summary from the hub's own matched plans.
//
// Everything here is computed from real plan data. Nothing is padding: if a hub
// has nothing distinctive to report, it reports nothing.

import { GOAL_LABELS } from './planBuilder.js';

const MARKET_LABELS = {
  any: 'Generic UK supermarket',
  aldi: 'Aldi',
  lidl: 'Lidl',
  tesco: 'Tesco',
  asda: 'Asda',
  sainsburys: "Sainsbury's",
  morrisons: 'Morrisons',
  iceland: 'Iceland',
  waitrose: 'Waitrose',
  ocado: 'Ocado',
  'marks-spencer': 'M&S',
  coop: 'Co-op',
};

const DIET_LABELS = {
  standard: 'no specific dietary restriction',
  vegetarian: 'vegetarian',
  vegan: 'vegan',
  pescatarian: 'pescatarian',
};

function countBy(items, key) {
  const counts = new Map();
  for (const item of items) {
    const value = item?.[key];
    if (value === undefined || value === null || value === '') continue;
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])));
}

function formatList(values) {
  if (!values.length) return '';
  if (values.length === 1) return values[0];
  return `${values.slice(0, -1).join(', ')} and ${values[values.length - 1]}`;
}

function median(numbers) {
  if (!numbers.length) return null;
  const sorted = [...numbers].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

/**
 * A short factual summary of what this hub's plans actually contain.
 *
 * Returns null when there are too few plans for a summary to say anything —
 * a two-plan hub does not need a paragraph about its "spread".
 */
export function buildHubDataSummary(plans = []) {
  if (plans.length < 3) return null;

  const markets = countBy(plans, 'supermarket');
  const diets = countBy(plans, 'dietType');
  const goals = countBy(plans, 'goal');
  const efforts = countBy(plans, 'effort');

  const proteins = plans.map(plan => Number(plan.macrosGrams?.protein)).filter(Number.isFinite);
  const calories = plans.map(plan => Number(plan.calories)).filter(Number.isFinite);

  const nonStandardDiets = diets.filter(([diet]) => diet !== 'standard');
  const dietCount = nonStandardDiets.reduce((total, [, count]) => total + count, 0);

  return {
    planCount: plans.length,
    marketCount: markets.length,
    marketList: formatList(markets.slice(0, 4).map(([value]) => MARKET_LABELS[value] || value)),
    topGoals: goals.slice(0, 3).map(([value, count]) => ({
      label: GOAL_LABELS?.[value] || value,
      count,
    })),
    dietCount,
    dietList: formatList(nonStandardDiets.map(([value]) => DIET_LABELS[value] || value)),
    medianProtein: median(proteins),
    calorieRange: calories.length
      ? { min: Math.min(...calories), max: Math.max(...calories) }
      : null,
    batchCount: efforts.find(([value]) => value === 'batch')?.[1] || 0,
    lowEffortCount: efforts
      .filter(([value]) => value === 'low' || value === 'minimal')
      .reduce((total, [, count]) => total + count, 0),
  };
}

/**
 * Contextual "where to go next" links for a hub, built from the hubs and plans
 * that are genuinely adjacent to this one rather than from a fixed site-wide
 * list. Capped at six, per the internal-linking policy.
 */
export function buildHubContextLinks({ hub, allHubs = {}, plans = [] }) {
  const links = [];
  const seen = new Set([hub.path]);

  const add = (to, label) => {
    if (!to || seen.has(to) || links.length >= 6) return;
    seen.add(to);
    links.push({ to, label });
  };

  // 1. Hubs the editor has already declared related to this one.
  for (const slug of hub.relatedSlugs || []) {
    const related = allHubs[slug];
    if (related) add(related.path, related.h1 || related.title);
  }

  // 2. Neighbouring calorie targets, which is the most common next question on
  //    a calorie hub ("is 1,500 too low for me?").
  const calorieMatch = /^(\d{3,4})-calorie$/.exec(hub.slug);
  if (calorieMatch) {
    const current = Number(calorieMatch[1]);
    const neighbours = Object.values(allHubs)
      .map(candidate => {
        const match = /^(\d{3,4})-calorie$/.exec(candidate.slug);
        return match ? { hub: candidate, calories: Number(match[1]) } : null;
      })
      .filter(Boolean)
      .filter(candidate => candidate.calories !== current)
      .sort((a, b) => Math.abs(a.calories - current) - Math.abs(b.calories - current));
    for (const neighbour of neighbours.slice(0, 2)) {
      add(neighbour.hub.path, neighbour.hub.h1 || neighbour.hub.title);
    }
  }

  // 3. The supermarkets this hub's own plans are actually built around.
  const markets = countBy(plans, 'supermarket').filter(([value]) => value !== 'any');
  for (const [market] of markets.slice(0, 3)) {
    const marketHub = allHubs[market];
    if (marketHub) add(marketHub.path, marketHub.h1 || marketHub.title);
  }

  // 4. The strongest single plan in this hub, so there is always one route
  //    straight into the product rather than sideways into another hub.
  if (plans[0]) add(`/plans/${plans[0].slug}`, plans[0].title);

  return links;
}

export { MARKET_LABELS, DIET_LABELS };
