import crypto from 'node:crypto';

const memoryBuckets = new Map();
const MAX_MEMORY_BUCKETS = 5000;
const JSON_CONTENT_TYPE = /\bapplication\/json\b/i;

export async function applyApiGuards(req, res, options) {
  const contentType = header(req, 'content-type');
  if (contentType && !JSON_CONTENT_TYPE.test(contentType)) {
    return reject(res, 415, 'Send this request as JSON.');
  }

  const bodySize = estimateBodySize(req);
  if (bodySize > options.maxBodyBytes) {
    return reject(
      res,
      413,
      `Request is too large. Keep it under ${Math.floor(options.maxBodyBytes / 1024)} KB.`,
    );
  }

  const rate = hitRateLimit(req, options.route, options.rateLimit);
  if (!rate.allowed) {
    res.setHeader('Retry-After', String(rate.retryAfterSeconds));
    res.setHeader('X-RateLimit-Limit', String(options.rateLimit.limit));
    res.setHeader('X-RateLimit-Remaining', '0');
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(rate.resetAt / 1000)));
    return reject(res, 429, 'Too many requests. Please wait a moment and try again.');
  }

  res.setHeader('X-RateLimit-Limit', String(options.rateLimit.limit));
  res.setHeader('X-RateLimit-Remaining', String(rate.remaining));
  res.setHeader('X-RateLimit-Reset', String(Math.ceil(rate.resetAt / 1000)));
  return true;
}

export function assertInteger(value, name, { min, max, allowed, fallback } = {}) {
  const number = Number(value ?? fallback);
  if (!Number.isInteger(number)) {
    throw badRequest(`${name} must be a whole number.`);
  }
  if (allowed && !allowed.includes(number)) {
    throw badRequest(`${name} must be one of: ${allowed.join(', ')}.`);
  }
  if (min !== undefined && number < min) {
    throw badRequest(`${name} must be at least ${min}.`);
  }
  if (max !== undefined && number > max) {
    throw badRequest(`${name} must be at most ${max}.`);
  }
  return number;
}

export function assertEnum(value, name, allowed, fallback) {
  const candidate = String(value || fallback || '').trim();
  if (!allowed.includes(candidate)) {
    throw badRequest(`${name} must be one of: ${allowed.join(', ')}.`);
  }
  return candidate;
}

export function assertText(value, name, maxLength, fallback = '') {
  const text = String(value ?? fallback).replace(/[\u0000-\u001f\u007f]/g, ' ').trim();
  if (text.length > maxLength) {
    throw badRequest(`${name} must be ${maxLength} characters or fewer.`);
  }
  return text;
}

export function assertBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  return value === true || value === 'true' || value === 1 || value === '1';
}

export function assertObject(value, name) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw badRequest(`${name} must be an object.`);
  }
  return value;
}

export function assertSerializedSize(value, name, maxBytes) {
  const size = Buffer.byteLength(JSON.stringify(value ?? null), 'utf8');
  if (size > maxBytes) {
    throw badRequest(`${name} is too large. Keep it under ${Math.floor(maxBytes / 1024)} KB.`);
  }
  return value;
}

export function sendGuardError(res, err) {
  if (err?.statusCode) {
    return reject(res, err.statusCode, err.message);
  }
  throw err;
}

function hitRateLimit(req, route, { limit, windowMs }) {
  const now = Date.now();
  pruneBuckets(now);

  const key = `${route}:${clientFingerprint(req)}`;
  let bucket = memoryBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowMs };
    memoryBuckets.set(key, bucket);
  }

  bucket.count += 1;
  const remaining = Math.max(0, limit - bucket.count);
  return {
    allowed: bucket.count <= limit,
    remaining,
    resetAt: bucket.resetAt,
    retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
  };
}

function pruneBuckets(now) {
  if (memoryBuckets.size < MAX_MEMORY_BUCKETS) return;
  for (const [key, bucket] of memoryBuckets) {
    if (bucket.resetAt <= now) {
      memoryBuckets.delete(key);
    }
  }
}

function clientFingerprint(req) {
  const ip = firstForwardedIp(header(req, 'x-forwarded-for'))
    || header(req, 'x-real-ip')
    || req.socket?.remoteAddress
    || 'unknown';
  const userAgent = header(req, 'user-agent').slice(0, 160);
  return crypto
    .createHash('sha256')
    .update(`${ip}|${userAgent}`)
    .digest('hex')
    .slice(0, 32);
}

function firstForwardedIp(value) {
  return String(value || '').split(',').map(part => part.trim()).find(Boolean) || '';
}

function estimateBodySize(req) {
  const contentLength = Number(header(req, 'content-length') || 0);
  if (Number.isFinite(contentLength) && contentLength > 0) return contentLength;
  return Buffer.byteLength(JSON.stringify(req.body ?? {}), 'utf8');
}

function header(req, name) {
  const value = req.headers?.[name] ?? req.headers?.[name.toLowerCase()];
  return Array.isArray(value) ? value[0] || '' : String(value || '');
}

function badRequest(message) {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
}

function reject(res, status, error) {
  res.status(status).json({ error });
  return false;
}
