export function buildPublicPopularityLinks({
  searchRows = [],
  gaRows = [],
  routeIndex = new Map(),
  limit = 8,
  isEligible = () => true,
  categoryFor = () => 'Guide',
} = {}) {
  const metricsByRoute = new Map();

  for (const row of searchRows) {
    addMetrics(metricsByRoute, row.page, {
      clicks: row.clicks,
      impressions: row.impressions,
    });
  }
  for (const row of gaRows) {
    addMetrics(metricsByRoute, row.path, { pageViews: row.pageViews });
  }

  return [...metricsByRoute.entries()]
    .map(([route, metrics]) => {
      const meta = routeIndex.get(route);
      const label = cleanOptionalText(meta?.label, 90);
      const description = cleanOptionalText(meta?.description, 180);
      const popularity = metrics.clicks + metrics.pageViews;
      if (!meta || !label || !description || popularity <= 0 || !isEligible(route, meta, metrics)) return null;
      return {
        to: route,
        label,
        description,
        category: categoryFor(meta),
        _popularity: popularity,
        _clicks: metrics.clicks,
        _pageViews: metrics.pageViews,
        _impressions: metrics.impressions,
      };
    })
    .filter(Boolean)
    .sort((left, right) => right._popularity - left._popularity
      || right._clicks - left._clicks
      || right._pageViews - left._pageViews
      || right._impressions - left._impressions
      || left.to.localeCompare(right.to))
    .slice(0, Math.max(0, limit))
    .map(({ _popularity, _clicks, _pageViews, _impressions, ...publicLink }) => publicLink);
}

function addMetrics(map, route, values) {
  if (!route) return;
  const current = map.get(route) || { clicks: 0, impressions: 0, pageViews: 0 };
  current.clicks += finiteNumber(values.clicks);
  current.impressions += finiteNumber(values.impressions);
  current.pageViews += finiteNumber(values.pageViews);
  map.set(route, current);
}

function finiteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : 0;
}

function cleanOptionalText(value, limit) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, limit);
}
