export const SEO_EXPERIMENT_ACTIVE_LABEL = 'SEO experiment active — do not rewrite';

export const SEO_EXPERIMENTS = Object.freeze([
  Object.freeze({
    id: 'container-buying-guide-metadata-2026-08-13',
    route: '/blog/best-meal-prep-containers-uk',
    query: 'best meal prep containers',
    startDate: '2026-08-13',
    cooldownUntil: '2026-09-10',
    cooldownDays: 28,
    before: Object.freeze({
      title: 'Best Meal Prep Containers UK: Glass, Plastic & Leakproof',
      description: 'Compare glass, plastic and leakproof meal prep containers for UK work lunches and batch cooking, including five-pack, 1-litre and freezer-safe options.',
    }),
    after: Object.freeze({
      title: 'Best Meal Prep Containers UK: 3 Practical Picks',
      description: 'Compare 3 practical meal prep container picks for work lunches, reheating and weekly batch cooking, with clear glass vs plastic and size guidance.',
    }),
    suppliedHistoricalBaseline: Object.freeze({
      source: 'Historical supplied baseline; not a fresh API pull',
      page: Object.freeze({ clicks: 11, impressions: 8210, ctr: 0.0013, avgPosition: 12.44 }),
      exactQuery: Object.freeze({ clicks: 8, impressions: 7521, ctr: 0.0011, avgPosition: 9.92 }),
    }),
    recrawlCandidate: true,
    allowedEarlyReviewReasons: Object.freeze([
      'title rendering failure',
      'completely inappropriate Google-selected title',
      'major ranking collapse',
      'clear factual, functional or technical defect',
    ]),
  }),
]);

export function buildSeoExperimentReviews({
  searchRows = [],
  snapshots = [],
  now = new Date(),
} = {}) {
  const snapshotById = new Map(snapshots.map(snapshot => [snapshot.id, snapshot]));

  return SEO_EXPERIMENTS.map(experiment => {
    const snapshot = snapshotById.get(experiment.id) || {};
    const pageRows = searchRows.filter(row => row.page === experiment.route);
    const exactQueryRows = pageRows.filter(row => normaliseQuery(row.query) === normaliseQuery(experiment.query));
    const active = dateOnly(now) < experiment.cooldownUntil;

    return {
      ...experiment,
      active,
      label: active ? SEO_EXPERIMENT_ACTIVE_LABEL : 'SEO experiment cooldown complete — review multiple weekly snapshots',
      current: {
        page: snapshot.page || summariseRows(pageRows),
        exactQuery: snapshot.exactQuery || summariseRows(exactQueryRows),
        source: snapshot.source || (pageRows.length ? 'Current weekly query/page rows (page subtotal)' : 'No fresh Search Console data available'),
      },
    };
  });
}

export function summariseRows(rows = []) {
  const clicks = rows.reduce((total, row) => total + number(row.clicks), 0);
  const impressions = rows.reduce((total, row) => total + number(row.impressions), 0);
  const positionWeight = rows.reduce((total, row) => (
    total + number(row.avgPosition) * Math.max(number(row.impressions), 1)
  ), 0);
  const positionDenominator = rows.reduce((total, row) => total + Math.max(number(row.impressions), 1), 0);

  return {
    clicks,
    impressions,
    ctr: impressions ? clicks / impressions : null,
    avgPosition: positionDenominator ? positionWeight / positionDenominator : null,
  };
}

function normaliseQuery(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function dateOnly(value) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
}

function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}
