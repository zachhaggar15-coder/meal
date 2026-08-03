import test from 'node:test';
import assert from 'node:assert/strict';
import { fitMetadataTitle, METADATA_TITLE_LIMITS } from '../src/utils/seoMetadata.js';
import { rateMetric } from '../src/utils/webVitals.js';
import {
  buildCompositionTrafficReview,
  buildPlanCompositionClusters,
} from './lib/planCompositionClusters.js';

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
