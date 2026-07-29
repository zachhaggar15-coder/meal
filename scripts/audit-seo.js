import { INDEXABLE_PLAN_SEEDS } from '../src/data/planSeeds.js';
import { buildPlanDays } from '../src/utils/planBuilder.js';
import { crawlDist } from './lib/crawlDist.js';
import { writeAuditJson } from './lib/auditOutput.js';

const { pages, sitemapPaths } = crawlDist();
const errors = [];
const titleGroups = groupBy(pages.filter(page => page.indexable), page => page.title);
const descriptionGroups = groupBy(pages.filter(page => page.indexable), page => page.description);

for (const page of pages) {
  if (!page.title) errors.push(`${page.route}: missing title`);
  if (!page.description) errors.push(`${page.route}: missing description`);
  if (page.route !== '/404.html' && page.h1Count !== 1) errors.push(`${page.route}: expected one H1, found ${page.h1Count}`);
  if (page.route !== '/404.html' && !page.canonical) errors.push(`${page.route}: missing canonical`);
  if (page.indexable && !page.sitemapIncluded) errors.push(`${page.route}: indexable canonical missing from sitemap`);
  if (page.sitemapIncluded && !page.indexable) errors.push(`${page.route}: sitemap page is not self-canonical and indexable`);
  if (page.indexable && !page.mainContentPresent) errors.push(`${page.route}: indexable page lacks meaningful prerendered main content`);
  if (page.structuredDataTypes.includes('INVALID_JSON_LD')) errors.push(`${page.route}: invalid JSON-LD`);
}
for (const [title, group] of titleGroups) {
  if (title && group.length > 1) errors.push(`duplicate title "${title}" on ${group.map(page => page.route).join(', ')}`);
}
for (const [description, group] of descriptionGroups) {
  if (description && group.length > 1) errors.push(`duplicate description on ${group.map(page => page.route).join(', ')}`);
}

const compositionGroups = new Map();
const planSummaries = [];
for (const seed of INDEXABLE_PLAN_SEEDS) {
  const { plan } = buildPlanDays(seed);
  const mealNames = plan.flatMap(day => day.meals.map(meal => meal.name));
  const compositionFingerprint = [...mealNames].sort().join('|');
  const summary = {
    slug: seed.slug,
    route: `/plans/${seed.slug}`,
    goal: seed.goal,
    supermarket: seed.supermarket,
    dietType: seed.dietType,
    calories: seed.calories,
    uniqueMeals: new Set(mealNames).size,
    compositionFingerprint,
  };
  planSummaries.push(summary);
  compositionGroups.set(compositionFingerprint, [
    ...(compositionGroups.get(compositionFingerprint) || []),
    summary,
  ]);
}
const exactCompositionClusters = [...compositionGroups.values()]
  .filter(group => group.length > 1)
  .map(group => ({
    size: group.length,
    routes: group.map(item => item.route),
    meaningfulDifferences: [...new Set(group.map(item => (
      `${item.supermarket}|${item.goal}|${item.calories}|${item.dietType}`
    )))],
    resolution: 'Retained only where rendered store guidance, quantities, macros, shopping list or goal context differs.',
  }))
  .sort((a, b) => b.size - a.size);

const nearDuplicateClusters = [];
const comparisonBuckets = groupBy(planSummaries, item => `${item.dietType}|${item.calories}`);
for (const bucket of comparisonBuckets.values()) {
  for (let leftIndex = 0; leftIndex < bucket.length; leftIndex += 1) {
    const left = bucket[leftIndex];
    const leftMeals = new Set(left.compositionFingerprint.split('|'));
    for (let rightIndex = leftIndex + 1; rightIndex < bucket.length; rightIndex += 1) {
      const right = bucket[rightIndex];
      if (left.compositionFingerprint === right.compositionFingerprint) continue;
      const rightMeals = new Set(right.compositionFingerprint.split('|'));
      const intersection = [...leftMeals].filter(meal => rightMeals.has(meal)).length;
      const union = new Set([...leftMeals, ...rightMeals]).size;
      const similarity = union ? intersection / union : 0;
      if (similarity >= 0.85) {
        nearDuplicateClusters.push({
          routes: [left.route, right.route],
          mealJaccardSimilarity: Number(similarity.toFixed(3)),
          differentiators: {
            goal: [left.goal, right.goal],
            supermarket: [left.supermarket, right.supermarket],
          },
        });
      }
    }
  }
}

const urlReport = {
  generatedAt: new Date().toISOString(),
  coverage: {
    generatedHtmlFiles: pages.length,
    canonicalIndexableUrls: pages.filter(page => page.indexable).length,
    sitemapUrls: sitemapPaths.size,
    publishedPlans: INDEXABLE_PLAN_SEEDS.length,
    exhaustive: true,
  },
  thresholds: {
    status: 200,
    selfCanonical: true,
    title: 'present and unique among indexable pages',
    description: 'present and unique among indexable pages',
    h1Count: 1,
    meaningfulPrerenderedContentCharactersMinimum: 100,
  },
  errors,
  pages: pages.map(page => ({
    ...page,
    internalLinks: undefined,
  })),
};
const duplicateReport = {
  generatedAt: new Date().toISOString(),
  coverage: {
    publishedPlanPages: INDEXABLE_PLAN_SEEDS.length,
    exactCompositionClusters: exactCompositionClusters.length,
    nearDuplicatePairsAtOrAbove085: nearDuplicateClusters.length,
    exhaustiveWithinDietAndCalorieBuckets: true,
  },
  exactCompositionClusters,
  nearDuplicateClusters,
  policy: 'Similarity is evidence for review, not an automatic noindex decision. No filler text is generated to change scores.',
};
const urlPath = writeAuditJson('url-indexing.json', urlReport);
const duplicatePath = writeAuditJson('duplicate-content-clusters.json', duplicateReport);

if (errors.length) {
  console.error(`SEO audit failed with ${errors.length} critical issue(s):`);
  errors.slice(0, 80).forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

console.log(
  `SEO audit passed for ${urlReport.coverage.canonicalIndexableUrls} canonical URLs and ` +
  `${pages.length} generated HTML files; similarity assessed across ${INDEXABLE_PLAN_SEEDS.length} published plans. ` +
  `Reports: ${urlPath}, ${duplicatePath}`,
);

function groupBy(values, keyFor) {
  const groups = new Map();
  for (const value of values) {
    const key = keyFor(value);
    groups.set(key, [...(groups.get(key) || []), value]);
  }
  return groups;
}
