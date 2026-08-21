const PRIVATE_QUERY_KEYS = new Set(['q', 'answers', 'quiz', 'quiz_answers', 'token']);

export function sanitiseAnalyticsPath(value) {
  if (!value) return '';
  const parsed = parseUrl(value);
  if (!parsed) return cleanFallback(value);
  removePrivateQueryParams(parsed);
  return `${parsed.pathname}${parsed.search}` || '/';
}

export function sanitiseAnalyticsUrl(value) {
  if (!value) return '';
  const parsed = parseUrl(value);
  if (!parsed) return cleanFallback(value);
  removePrivateQueryParams(parsed);
  return parsed.origin === 'https://analytics.invalid'
    ? `${parsed.pathname}${parsed.search}`
    : parsed.href;
}

export function analyticsSearchIntent(value) {
  const parsed = parseUrl(value);
  if (!parsed) return '';
  return parsed.searchParams.get('search') || parsed.searchParams.get('utm_term') || '';
}

function removePrivateQueryParams(url) {
  for (const key of [...url.searchParams.keys()]) {
    if (PRIVATE_QUERY_KEYS.has(key.toLowerCase())) url.searchParams.delete(key);
  }
  url.hash = '';
}

function parseUrl(value) {
  try {
    return new URL(String(value || ''), 'https://analytics.invalid');
  } catch {
    return null;
  }
}

function cleanFallback(value) {
  return String(value || '').split(/[?#]/, 1)[0] || '';
}
