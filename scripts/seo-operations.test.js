import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fitMetadataTitle, METADATA_TITLE_LIMITS } from '../src/utils/seoMetadata.js';
import { rateMetric } from '../src/utils/webVitals.js';
import {
  buildCompositionTrafficReview,
  buildPlanCompositionClusters,
} from './lib/planCompositionClusters.js';
import { buildPublicPopularityLinks } from './lib/publicPopularity.js';

test('metadata titles stay inside the review range', () => {
  const values = [
    'One Pan Meal Prep UK',
    'Air Fryer High Protein Meal Prep UK: Fast Chicken, Fish, Tofu and Potatoes',
    'Free UK Diet Plans - Browse 1059 Meal Plans by Calories & Supermarket - Page 45 | MealPrep.org.uk',
  ];

  for (const value of values) {
    const fitted = fitMetadataTitle(value);
    assert.ok(fitted.length >= METADATA_TITLE_LIMITS.min, `${fitted} is too short`);
    assert.ok(fitted.length <= METADATA_TITLE_LIMITS.max, `${fitted} is too long`);
  }
});

test('field vital ratings use Core Web Vitals thresholds', () => {
  assert.equal(rateMetric('INP', 200), 'good');
  assert.equal(rateMetric('INP', 201), 'needs_improvement');
  assert.equal(rateMetric('LCP', 4001), 'poor');
  assert.equal(rateMetric('CLS', 0.1), 'good');
});

test('all composition clusters receive stable route-level review records', () => {
  const clusters = buildPlanCompositionClusters();
  assert.equal(clusters.exactCompositionClusters.length, 31);
  assert.equal(clusters.nearDuplicateClusters.length, 43);

  const first = clusters.exactCompositionClusters[0];
  const review = buildCompositionTrafficReview({
    ...clusters,
    searchRows: [
      { page: first.routes[0], clicks: 12, impressions: 300 },
      { page: first.routes[1], clicks: 1, impressions: 30 },
    ],
    gaRows: [
      { path: first.routes[0], pageViews: 80, activeUsers: 60, engagementRate: 0.7 },
      { path: first.routes[1], pageViews: 5, activeUsers: 4, engagementRate: 0.3 },
    ],
  });

  assert.equal(review.coverage.exactClusters, 31);
  assert.equal(review.coverage.nearDuplicatePairs, 43);
  assert.equal(review.clusters.length, 74);
  assert.equal(new Set(review.clusters.map(item => item.reviewId)).size, 74);
  assert.equal(review.clusters.find(item => item.reviewId === first.reviewId)?.status, 'review_consolidation');
});

test('public popularity links use measured engagement order and curated descriptions only', () => {
  const routeIndex = new Map([
    ['/alpha', { label: 'Alpha', description: 'A curator-written description.', publicEligible: true }],
    ['/zulu', { label: 'Zulu', description: 'Another approved description.', publicEligible: true }],
    ['/missing-copy', { label: 'Missing copy', description: '', publicEligible: true }],
  ]);
  const links = buildPublicPopularityLinks({
    searchRows: [
      { page: '/alpha', clicks: 2, impressions: 500 },
      { page: '/zulu', clicks: 12, impressions: 200 },
      { page: '/missing-copy', clicks: 30, impressions: 1000 },
    ],
    gaRows: [
      { path: '/alpha', pageViews: 5 },
      { path: '/zulu', pageViews: 10 },
      { path: '/missing-copy', pageViews: 50 },
    ],
    routeIndex,
  });

  assert.deepEqual(links.map(link => link.to), ['/zulu', '/alpha']);
  assert.equal(links[0].description, 'Another approved description.');
  assert.ok(!Object.hasOwn(links[0], 'clicks'));
  assert.ok(!Object.hasOwn(links[0], 'pageViews'));
  assert.ok(!Object.hasOwn(links[0], 'impressions'));
});

test('blog tables have one semantic representation with responsive cell labels', () => {
  const pageSource = fs.readFileSync(path.resolve('src/pages/BlogPost.jsx'), 'utf8');
  const styles = fs.readFileSync(path.resolve('src/App.css'), 'utf8');
  assert.ok(!pageSource.includes('blog-table-cards'));
  assert.equal((pageSource.match(/<table className="content-table blog-table">/g) || []).length, 1);
  assert.match(pageSource, /data-label=\{headers\[cellIndex\]\}/);
  assert.match(styles, /\.blog-table td::before\s*\{[^}]*content:\s*attr\(data-label\)/s);
});

test('generated public weekly links contain no fallback descriptions or raw metrics', async () => {
  const { WEEKLY_TRENDING_LINKS } = await import('../src/data/weeklySeoInsights.js');
  const forbidden = /browse related plans|practical guide for planning|readers are finding helpful|planning this week/i;
  assert.ok(WEEKLY_TRENDING_LINKS.length > 0);
  for (const link of WEEKLY_TRENDING_LINKS) {
    assert.ok(link.description && !forbidden.test(link.description));
    assert.deepEqual(Object.keys(link).sort(), ['category', 'description', 'label', 'to']);
  }
});
