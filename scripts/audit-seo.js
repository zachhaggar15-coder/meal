import { INDEXABLE_PLAN_SEEDS } from '../src/data/planSeeds.js';
import { crawlDist } from './lib/crawlDist.js';
import { writeAuditJson } from './lib/auditOutput.js';
import { buildPlanCompositionClusters } from './lib/planCompositionClusters.js';

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

const { exactCompositionClusters, nearDuplicateClusters } = buildPlanCompositionClusters();

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
  trafficReview: {
    command: 'npm run analytics:weekly',
    report: 'docs/composition-route-review.json',
    cadence: 'weekly',
  },
  policy: 'Similarity is evidence for weekly route-level traffic review, not an automatic noindex decision. No filler text is generated to change scores.',
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
