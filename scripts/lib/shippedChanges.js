// Registry of shipped UX/copy changes to watch for a before/after effect in
// the weekly analytics report, instead of shipping on judgement and never
// checking whether it actually moved anything.
//
// Each entry is hand-added at the time a change ships (not auto-detected —
// git history alone can't tell us which commits are "a change worth
// watching" vs routine maintenance). Add a new entry whenever you ship a UX
// or copy change to a component/data file used across many pages and want
// to know if it worked.
//
// routeMatch(path) decides which routes count as "affected" for the
// before/after comparison. Keep matches broad-but-honest: over-matching a
// little is fine for a directional signal, but don't narrow it down to make
// a change look better than the evidence supports.

export const SHIPPED_CHANGES = [
  {
    id: 'plan-card-redesign',
    title: 'Shared banner + stat-strip PlanCard',
    date: '2026-07-25',
    commit: '08f3e62',
    description:
      'Replaced the flat-text browse/hub plan card (kicker, title, four identical pills) with a goal-coded banner and a three-cell stat strip (calories, cost, effort), used on /browse, /browse/page/N and every /meal-plans/ hub and combo page.',
    routeMatch: path => path === '/browse' || path.startsWith('/browse/page/') || path.startsWith('/meal-plans/'),
    watchEvents: ['plan_primary_cta_clicked'],
  },
  {
    id: 'affiliate-cta-copy-unification',
    title: 'Unified Amazon affiliate CTA copy',
    date: '2026-08-07',
    commit: 'b4d1751',
    description:
      'Unified three different "go to Amazon" button phrasings ("See Amazon price", "See price on Amazon →", "View on Amazon") into one "See Amazon price →" across AffiliateProductGrid, ContainerQuickComparison, ProductPicks and the StickerPromo offers, matching the site\'s existing trailing-arrow CTA convention.',
    routeMatch: path => path.startsWith('/meal-prep-containers') || path === '/meal-prep-accessories' || path.startsWith('/blog/'),
    watchEvents: [
      'container_product_click',
      'mid_range_container_product_click',
      'budget_container_product_click',
      'mealprep_product_click',
    ],
  },
  {
    id: 'canonical-affiliate-measurement',
    title: 'Canonical affiliate product click measurement',
    date: '2026-08-13',
    description:
      'Replaced duplicate automatic and component-specific Amazon conversion labels with one affiliate_product_click event and a stable product, placement, viewport and recommendation-source taxonomy.',
    routeMatch: path => path === '/'
      || path.startsWith('/plans/')
      || path.startsWith('/meal-plan/')
      || path.startsWith('/meal-prep-containers')
      || path === '/meal-prep-accessories'
      || path.startsWith('/blog/')
      || path.startsWith('/tools'),
    watchEvents: ['affiliate_product_click'],
  },
];

export function daysSince(dateString) {
  const shipped = new Date(`${dateString}T00:00:00Z`);
  const now = new Date();
  return Math.max(0, Math.floor((now.getTime() - shipped.getTime()) / (24 * 60 * 60 * 1000)));
}

// Splits the accumulated weekly-tracker CSV history into before/after the
// change's ship date for routes the change actually touched, and sums the
// raw metrics (not deltas, which the tracker already stores relative to a
// rolling 28-day window and would double-count here).
export function buildTrackerBeforeAfter(change, trackerRows) {
  const matched = trackerRows.filter(row => change.routeMatch(row.page));
  const before = matched.filter(row => row.date < change.date);
  const after = matched.filter(row => row.date >= change.date);

  return {
    matchedRouteCount: new Set(matched.map(row => row.page)).size,
    beforeSnapshots: new Set(before.map(row => row.date)).size,
    afterSnapshots: new Set(after.map(row => row.date)).size,
    before: sumTrackerRows(before),
    after: sumTrackerRows(after),
  };
}

function sumTrackerRows(rows) {
  const impressions = rows.reduce((total, row) => total + row.impressions, 0);
  const clicks = rows.reduce((total, row) => total + row.clicks, 0);
  const positionWeight = rows.reduce((total, row) => total + row.avgPosition * Math.max(row.impressions, 1), 0);
  const weightTotal = rows.reduce((total, row) => total + Math.max(row.impressions, 1), 0);

  return {
    impressions,
    clicks,
    ctr: impressions ? clicks / impressions : 0,
    avgPosition: weightTotal ? positionWeight / weightTotal : 0,
  };
}

// Splits the event-count tracker (see updateShippedChangeEventTracker in the
// main script) the same way, for the on-site click-through events a change
// actually targets — the more direct answer to "did this move click-through"
// than Google's own search-result CTR, which the tracker above measures.
export function buildEventBeforeAfter(change, eventTrackerRows) {
  const matched = eventTrackerRows.filter(row => row.changeId === change.id);
  const before = matched.filter(row => row.date < change.date);
  const after = matched.filter(row => row.date >= change.date);

  return {
    beforeSnapshots: new Set(before.map(row => row.date)).size,
    afterSnapshots: new Set(after.map(row => row.date)).size,
    beforeEvents: before.reduce((total, row) => total + row.eventCount, 0),
    afterEvents: after.reduce((total, row) => total + row.eventCount, 0),
    beforeViews: before.reduce((total, row) => total + row.pageViews, 0),
    afterViews: after.reduce((total, row) => total + row.pageViews, 0),
  };
}
