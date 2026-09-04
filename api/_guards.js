import crypto from 'node:crypto';
import { getRateLimitStore } from './_rate-limit-store.js';

const JSON_CONTENT_TYPE = /\bapplication\/json\b/i;

// Sent by the browser (see src/utils/apiClient.js) so two people sharing one
// IP — an office, a school, a mobile carrier's CGNAT — get their own budget
// instead of one exhausting the other's.
const CLIENT_HEADER = 'x-mealprep-client';
// The client id is supplied by the caller, so it can be rotated to mint fresh
// budgets. The per-IP ceiling is what actually caps abuse; the per-client limit
// is there for fairness between people who happen to share an address.
const SHARED_CEILING_MULTIPLIER = 5;

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

  let rate;
  try {
    rate = await hitRateLimit(req, options.route, options.rateLimit);
  } catch (err) {
    console.error('Rate-limit store unavailable:', err?.message || err);
    return reject(res, 503, 'This service is temporarily unavailable. Please try again shortly.');
  }
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

// Hands a request's slot back when the failure was ours, not the caller's — an
// upstream error or a result we couldn't vouch for. Without this a user who
// retries after a server-side failure spends their own budget on our fault and
// ends up rate-limited for it.
export async function refundRateLimit(req, route) {
  try {
    await getRateLimitStore().refund(rateLimitKeys(req, route));
  } catch (err) {
    // A failed refund must never replace the real upstream error response.
    console.error('Could not refund rate-limit allowance:', err?.message || err);
  }
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

// Two buckets, not one. The per-client bucket is the limit a normal visitor
// feels; the per-IP ceiling sits well above it and only bites when a single
// address is genuinely hammering a route. A stranger on your office wifi can
// no longer spend your allowance, and rotating the client id buys a caller
// nothing beyond the ceiling.
async function hitRateLimit(req, route, { limit, windowMs, sharedLimit }) {
  const now = Date.now();
  const ceiling = sharedLimit ?? limit * SHARED_CEILING_MULTIPLIER;
  const [clientHit, addressHit] = await getRateLimitStore().hit(rateLimitKeys(req, route), windowMs);
  const perClient = describeBucket(clientHit, limit, now);
  const perAddress = describeBucket(addressHit, ceiling, now);

  const blocking = [perClient, perAddress].find(bucket => !bucket.allowed);
  const resetAt = blocking?.resetAt ?? Math.max(perClient.resetAt, perAddress.resetAt);

  return {
    allowed: !blocking,
    remaining: Math.min(perClient.remaining, perAddress.remaining),
    resetAt,
    retryAfterSeconds: Math.max(1, Math.ceil((resetAt - now) / 1000)),
  };
}

function describeBucket(hit, limit, now) {
  return {
    allowed: hit.count <= limit,
    remaining: Math.max(0, limit - hit.count),
    resetAt: now + hit.ttlMs,
  };
}

function rateLimitKeys(req, route) {
  return [
    `${route}:client:${clientFingerprint(req)}`,
    `${route}:ip:${addressFingerprint(req)}`,
  ];
}

// Identifies one caller. IP and user-agent alone put everyone behind a shared
// address on the same browser build into a single bucket, so the browser's own
// per-tab id joins them. A caller that sends no id degrades to exactly the old
// behaviour rather than sharing a bucket with every other id-less caller.
function clientFingerprint(req) {
  const clientId = header(req, CLIENT_HEADER).slice(0, 64);
  const userAgent = header(req, 'user-agent').slice(0, 160);
  return hash(`${requestAddress(req)}|${userAgent}|${clientId}`);
}

// The ceiling is per address only — a client id must not be able to escape it.
function addressFingerprint(req) {
  return hash(requestAddress(req));
}

function requestAddress(req) {
  return firstForwardedIp(header(req, 'x-forwarded-for'))
    || header(req, 'x-real-ip')
    || req.socket?.remoteAddress
    || 'unknown';
}

function hash(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 32);
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
