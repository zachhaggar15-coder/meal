#!/usr/bin/env node
import { PLAN_COUNT } from '../src/data/planCatalogMeta.js';
import { INDEXABLE_PLAN_SEEDS } from '../src/data/planSeeds.js';
import { crawlDist } from './lib/crawlDist.js';
import { writeAuditJson } from './lib/auditOutput.js';

const { pages } = crawlDist();
const indexable = pages.filter(page => page.indexable);
const pageByRoute = new Map(pages.map(page => [page.route, page]));
const errors = [];
const warnings = [];

for (const page of indexable) {
  if (page.title.length > 70) warnings.push(issue(page, 'overlong_title', page.title.length));
  if (page.title.length < 28) warnings.push(issue(page, 'short_title', page.title.length));
  if (page.description.length > 160) warnings.push(issue(page, 'overlong_description', page.description.length));
  if (page.description.length < 90) warnings.push(issue(page, 'short_description', page.description.length));
}

for (const seed of INDEXABLE_PLAN_SEEDS) {
  const route = `/plans/${seed.slug}`;
  const page = pageByRoute.get(route);
  if (!page) {
    errors.push({ route, type: 'missing_plan_metadata', detail: 'Published plan route is missing.' });
    continue;
  }

  const claims = [...`${page.title} ${page.description}`.matchAll(/\b([\d,]{4,5})\s*(?:kcal|calorie)/gi)]
    .map(match => Number(match[1].replace(/,/g, '')));
  const mismatchedCalories = claims.filter(value => value !== seed.calories);
  if (mismatchedCalories.length) {
    errors.push({
      route,
      type: 'calorie_claim_mismatch',
      expected: seed.calories,
      found: [...new Set(mismatchedCalories)],
    });
  }

  const namedMarkets = findNamedMarkets(`${page.title} ${page.description}`);
  if (seed.supermarket !== 'any' && namedMarkets.some(market => market !== seed.supermarket)) {
    errors.push({
      route,
      type: 'supermarket_claim_mismatch',
      expected: seed.supermarket,
      found: namedMarkets,
    });
  }
}

const exactPlanCountPattern = new RegExp(`\\b${PLAN_COUNT.toLocaleString('en-GB')}\\b|\\b${PLAN_COUNT}\\b`);
const countClaimPages = pages.filter(page => exactPlanCountPattern.test(`${page.title} ${page.description} ${page.h1}`));
const normalisedTitleClusters = clusterBy(indexable, page => normaliseTemplate(page.title))
  .filter(cluster => cluster.pages.length > 1)
  .sort((left, right) => right.pages.length - left.pages.length);
const normalisedDescriptionClusters = clusterBy(indexable, page => normaliseTemplate(page.description))
  .filter(cluster => cluster.pages.length > 1)
  .sort((left, right) => right.pages.length - left.pages.length);

const report = {
  generatedAt: new Date().toISOString(),
  coverage: {
    indexablePages: indexable.length,
    publishedPlanPages: INDEXABLE_PLAN_SEEDS.length,
    exactPlanCount: PLAN_COUNT,
    pagesWithExactPlanCountInPrimaryMetadata: countClaimPages.length,
    exhaustive: true,
  },
  thresholds: {
    duplicateTitles: 0,
    duplicateDescriptions: 0,
    calorieOrSupermarketClaimMismatches: 0,
    titleLengthReview: '28 to 70 characters',
    descriptionLengthReview: '90 to 160 characters',
    lengthReviewItems: 0,
  },
  errors,
  warningSummary: countBy(warnings, item => item.type),
  warnings,
  nearDuplicateTemplateClusters: {
    titles: normalisedTitleClusters.slice(0, 100),
    descriptions: normalisedDescriptionClusters.slice(0, 100),
    note: 'Normalised clusters remove retailer names, numbers and branding. They are review evidence, not automatic consolidation decisions.',
  },
};
const reportPath = writeAuditJson('metadata-quality.json', report);

if (errors.length || warnings.length) {
  console.error(`Metadata audit failed with ${errors.length} factual mismatch(es) and ${warnings.length} length review item(s).`);
  errors.slice(0, 80).forEach(error => console.error(`- ${error.route}: ${error.type}`));
  warnings.slice(0, 80).forEach(warning => console.error(`- ${warning.route}: ${warning.type} (${warning.length})`));
  process.exit(1);
}

console.log(
  `Metadata audit passed across ${indexable.length} indexable pages and ` +
  `${INDEXABLE_PLAN_SEEDS.length} published plan claims; ${warnings.length} length review item(s); report: ${reportPath}`,
);

function issue(page, type, length) {
  return { route: page.route, type, length, title: page.title };
}

function findNamedMarkets(text) {
  const markets = [
    ['marks-spencer', /\b(?:m&s|marks\s*&?\s*spencer)\b/i],
    ['sainsburys', /\bsainsbury'?s\b/i],
    ['morrisons', /\bmorrisons?\b/i],
    ['waitrose', /\bwaitrose\b/i],
    ['iceland', /\biceland\b/i],
    ['tesco', /\btesco\b/i],
    ['asda', /\basda\b/i],
    ['aldi', /\baldi\b/i],
    ['lidl', /\blidl\b/i],
    ['ocado', /\bocado\b/i],
    ['coop', /\bco-?op\b/i],
  ];
  return markets.filter(([, pattern]) => pattern.test(text)).map(([value]) => value);
}

function clusterBy(values, keyFor) {
  const groups = new Map();
  for (const value of values) {
    const key = keyFor(value);
    groups.set(key, [...(groups.get(key) || []), value.route]);
  }
  return [...groups.entries()].map(([template, routes]) => ({
    template,
    pages: routes,
  }));
}

function normaliseTemplate(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\b(?:aldi|lidl|tesco|asda|sainsbury'?s|morrisons?|iceland|waitrose|ocado|m&s|marks\s*&?\s*spencer|co-?op)\b/g, '{market}')
    .replace(/\b[\d,]+(?:\.\d+)?\b/g, '{number}')
    .replace(/\bmealprep\.org\.uk\b/g, '{brand}')
    .replace(/[^a-z{}]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function countBy(values, keyFor) {
  const counts = {};
  for (const value of values) {
    const key = keyFor(value);
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}
