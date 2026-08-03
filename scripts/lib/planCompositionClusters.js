import { createHash } from 'node:crypto';
import { INDEXABLE_PLAN_SEEDS } from '../../src/data/planSeeds.js';
import { buildPlanDays } from '../../src/utils/planBuilder.js';

export function buildPlanCompositionClusters(seeds = INDEXABLE_PLAN_SEEDS) {
  const compositionGroups = new Map();
  const planSummaries = [];

  for (const seed of seeds) {
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
    .map(group => {
      const routes = group.map(item => item.route).sort();
      return {
        reviewId: stableReviewId('exact', routes),
        size: group.length,
        routes,
        meaningfulDifferences: [...new Set(group.map(item => (
          `${item.supermarket}|${item.goal}|${item.calories}|${item.dietType}`
        )))],
        resolution: 'Retained only where rendered store guidance, quantities, macros, shopping list or goal context differs.',
      };
    })
    .sort((left, right) => right.size - left.size || left.reviewId.localeCompare(right.reviewId));

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
        if (similarity < 0.85) continue;

        const routes = [left.route, right.route].sort();
        nearDuplicateClusters.push({
          reviewId: stableReviewId('near', routes),
          routes,
          mealJaccardSimilarity: Number(similarity.toFixed(3)),
          differentiators: {
            goal: [left.goal, right.goal],
            supermarket: [left.supermarket, right.supermarket],
          },
        });
      }
    }
  }

  return {
    planSummaries,
    exactCompositionClusters,
    nearDuplicateClusters: nearDuplicateClusters.sort((left, right) => left.reviewId.localeCompare(right.reviewId)),
  };
}

export function buildCompositionTrafficReview({
  exactCompositionClusters,
  nearDuplicateClusters,
  searchRows = [],
  gaRows = [],
}) {
  const metrics = buildRouteMetrics(searchRows, gaRows);
  const clusters = [
    ...exactCompositionClusters.map(cluster => ({ ...cluster, type: 'exact' })),
    ...nearDuplicateClusters.map(cluster => ({ ...cluster, type: 'near' })),
  ].map(cluster => reviewCluster(cluster, metrics));

  const reviewedRoutes = new Set(clusters.flatMap(cluster => cluster.routes.map(route => route.route)));
  const routesWithTraffic = new Set(
    clusters.flatMap(cluster => cluster.routes)
      .filter(route => route.impressions > 0 || route.pageViews > 0)
      .map(route => route.route),
  );

  return {
    generatedAt: new Date().toISOString(),
    coverage: {
      exactClusters: exactCompositionClusters.length,
      nearDuplicatePairs: nearDuplicateClusters.length,
      routes: reviewedRoutes.size,
      routesWithTrafficEvidence: routesWithTraffic.size,
      exhaustive: true,
    },
    statusSummary: countBy(clusters, cluster => cluster.status),
    clusters: clusters.sort(compareReviewedClusters),
    policy: 'Traffic evidence informs human consolidation review. Routes are never redirected, noindexed or rewritten automatically.',
  };
}

function reviewCluster(cluster, metrics) {
  const routes = cluster.routes.map(route => ({
    route,
    ...(metrics.get(route) || emptyMetrics()),
  })).sort((left, right) => routeEvidenceScore(right) - routeEvidenceScore(left) || left.route.localeCompare(right.route));
  const trafficRoutes = routes.filter(route => route.impressions > 0 || route.pageViews > 0);
  const leader = trafficRoutes[0] || null;
  const runnerUp = trafficRoutes[1] || null;
  const leaderScore = routeEvidenceScore(leader);
  const runnerUpScore = routeEvidenceScore(runnerUp);
  const dominant = leaderScore >= 20 && leaderScore >= Math.max(2 * runnerUpScore, runnerUpScore + 10);

  let status = 'awaiting_route_traffic';
  let recommendation = 'Collect route-level impressions and engagement before changing indexation.';
  if (trafficRoutes.length >= 2 && dominant) {
    status = 'review_consolidation';
    recommendation = `Review ${leader.route} as the evidence leader; compare intent and conversions before consolidating weaker routes.`;
  } else if (trafficRoutes.length >= 2) {
    status = 'retain_and_monitor';
    recommendation = 'Multiple routes have demand; retain while intent and engagement remain distinct.';
  } else if (trafficRoutes.length === 1) {
    status = 'collect_more_evidence';
    recommendation = 'One route has traffic, but the alternatives need more evidence before a consolidation decision.';
  }

  return {
    reviewId: cluster.reviewId,
    type: cluster.type,
    similarity: cluster.mealJaccardSimilarity ?? 1,
    status,
    recommendation,
    leader: leader?.route || null,
    routes,
  };
}

function buildRouteMetrics(searchRows, gaRows) {
  const metrics = new Map();
  for (const row of searchRows) {
    const route = row.page || row.path;
    if (!route) continue;
    const current = metrics.get(route) || emptyMetrics();
    current.clicks += Number(row.clicks || 0);
    current.impressions += Number(row.impressions || 0);
    metrics.set(route, current);
  }
  for (const row of gaRows) {
    const route = row.path || row.page;
    if (!route) continue;
    const current = metrics.get(route) || emptyMetrics();
    current.pageViews += Number(row.pageViews || 0);
    current.activeUsers += Number(row.activeUsers || 0);
    current.engagementRate = Math.max(current.engagementRate, Number(row.engagementRate || 0));
    metrics.set(route, current);
  }
  return metrics;
}

function emptyMetrics() {
  return { clicks: 0, impressions: 0, pageViews: 0, activeUsers: 0, engagementRate: 0 };
}

function routeEvidenceScore(route) {
  if (!route) return 0;
  return Number(route.clicks || 0) * 5
    + Number(route.pageViews || 0)
    + Number(route.impressions || 0) * 0.05
    + Number(route.engagementRate || 0) * 10;
}

function compareReviewedClusters(left, right) {
  const priority = {
    review_consolidation: 0,
    retain_and_monitor: 1,
    collect_more_evidence: 2,
    awaiting_route_traffic: 3,
  };
  return priority[left.status] - priority[right.status] || left.reviewId.localeCompare(right.reviewId);
}

function stableReviewId(type, routes) {
  const digest = createHash('sha256').update(routes.join('|')).digest('hex').slice(0, 10);
  return `${type}-${digest}`;
}

function groupBy(values, keyFor) {
  const groups = new Map();
  for (const value of values) {
    const key = keyFor(value);
    groups.set(key, [...(groups.get(key) || []), value]);
  }
  return groups;
}

function countBy(values, keyFor) {
  const counts = {};
  for (const value of values) {
    const key = keyFor(value);
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}
