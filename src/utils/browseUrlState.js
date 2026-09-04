import { buildBrowsePagePath } from '../data/browsePagination.js';

export const BROWSE_FILTER_QUERY_KEYS = Object.freeze([
  'search',
  'goal',
  'supermarket',
  'diet',
  'calories',
  'budget',
  'effort',
]);

export function buildBrowseUrl(filters, page = 1, currentQuery = '') {
  const params = new URLSearchParams(currentQuery);

  for (const key of BROWSE_FILTER_QUERY_KEYS) params.delete(key);
  for (const key of BROWSE_FILTER_QUERY_KEYS) {
    const value = String(filters?.[key] || '');
    if (value) params.set(key, value);
  }

  const query = params.toString();
  return `${buildBrowsePagePath(page)}${query ? `?${query}` : ''}`;
}
