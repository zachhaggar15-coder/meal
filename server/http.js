export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseBody(body) {
  if (!body) return {};
  if (typeof body === 'object') return body;
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}

export function cleanMeta(value, maxLength = 500) {
  return String(value || '')
    .replace(/[\r\n]+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

export function cleanHeader(value) {
  return String(value || '')
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .replace(/[\r\n]+/g, ' ');
}

export function cleanEmail(value) {
  const email = String(value || '').trim().toLowerCase();
  return EMAIL_RE.test(email) && email.length <= 254 ? email : '';
}

export function cleanUrl(value) {
  const cleaned = String(value || '').trim().replace(/^['"]|['"]$/g, '');
  if (!cleaned) return '';

  try {
    const url = new URL(cleaned);
    return url.protocol === 'https:' ? url.toString() : '';
  } catch {
    return '';
  }
}

export function getRequestIp(req) {
  return cleanMeta(
    (req.headers['x-forwarded-for'] || '').split(',')[0] ||
    req.socket?.remoteAddress ||
    '',
    80,
  );
}

export function createInMemoryRateLimiter({ windowMs, max, maxKeys = 5000 }) {
  const hits = new Map();

  return function rateLimited(key) {
    if (!key) return false;
    const now = Date.now();
    const bucket = (hits.get(key) || []).filter(timestamp => now - timestamp < windowMs);
    bucket.push(now);
    hits.set(key, bucket);

    if (hits.size > maxKeys) hits.clear();
    return bucket.length > max;
  };
}

export function readNumber(value, { fallback, min, max, integer = true } = {}) {
  const parsed = integer ? Number.parseInt(value, 10) : Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export function truncateText(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

export function jsonSize(value) {
  try {
    return JSON.stringify(value).length;
  } catch {
    return Infinity;
  }
}

export function safeEqual(a, b) {
  const left = String(a || '');
  const right = String(b || '');
  if (left.length !== right.length) return false;

  let diff = 0;
  for (let i = 0; i < left.length; i += 1) {
    diff |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }
  return diff === 0;
}

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
