// A per-tab identifier sent with our own API requests so the rate limiter can
// tell two callers apart when they share an IP address — an office, a school,
// a mobile carrier's CGNAT. Without it those people share one budget and a
// stranger's usage locks you out (api/_guards.js).
//
// Deliberately not a tracking identifier, and not gated on analytics consent
// because it never feeds analytics: it lives in sessionStorage so it dies with
// the tab, is never persisted across visits, is sent to no one but our own
// API, and says nothing about the visitor. It is also not a security control —
// being client-supplied it can be rotated, which is why the server keeps a
// wider per-IP ceiling behind it.

const STORAGE_KEY = 'mealprep_client_id';
const CLIENT_HEADER = 'x-mealprep-client';

let cached = '';

export function getClientId() {
  if (typeof window === 'undefined') return '';
  if (cached) return cached;

  const stored = readStoredId();
  if (stored) {
    cached = stored;
    return cached;
  }

  cached = makeClientId();
  try {
    window.sessionStorage.setItem(STORAGE_KEY, cached);
  } catch {
    // Private mode or storage disabled — the id stays in memory for this page
    // view, which still separates this caller from everyone else on the IP.
  }
  return cached;
}

// Adds the client id to a request's headers, leaving whatever else you pass
// untouched. Use for every browser call to a rate-limited /api route.
export function apiHeaders(headers = {}) {
  const clientId = getClientId();
  return clientId ? { ...headers, [CLIENT_HEADER]: clientId } : { ...headers };
}

function readStoredId() {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

function makeClientId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID().replace(/-/g, '');
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 14)}`;
}
