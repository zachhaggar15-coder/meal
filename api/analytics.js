// Vercel serverless function: POST /api/analytics
// Receives first-party behaviour analytics from the browser and stores them in
// Supabase. The browser never talks to Supabase directly.
//
// Required env vars:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY

import {
  applyApiGuards,
  assertSerializedSize,
  sendGuardError,
} from './_guards.js';

const MAX_EVENTS_PER_REQUEST = 25;
const MAX_METADATA_BYTES = 12 * 1024;
const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const guarded = await applyApiGuards(req, res, {
    route: 'analytics',
    maxBodyBytes: 64 * 1024,
    rateLimit: { limit: 240, windowMs: 60 * 1000 },
  });
  if (!guarded) return;

  let payload;
  try {
    payload = parseBody(req.body);
    assertSerializedSize(payload, 'analytics payload', 64 * 1024);
  } catch (err) {
    return sendGuardError(res, err);
  }

  const session = normaliseSession(payload?.session);
  if (!session?.session_id) {
    return res.status(400).json({ error: 'Missing analytics session.' });
  }

  const events = normaliseEvents(payload?.events, session.session_id);
  if (events.length === 0) {
    return res.status(200).json({ ok: true, stored: 0 });
  }

  const supabaseUrl = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error('Analytics misconfigured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    return res.status(500).json({ error: 'Analytics is not configured.' });
  }

  const authHeaders = {
    'Content-Type': 'application/json',
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
  };

  try {
    const sessionRes = await fetch(`${supabaseUrl}/rest/v1/analytics_sessions?on_conflict=session_id`, {
      method: 'POST',
      headers: {
        ...authHeaders,
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify({
        ...session,
        last_seen_at: new Date().toISOString(),
      }),
    });

    if (!sessionRes.ok) {
      const text = await sessionRes.text();
      console.error('Analytics session upsert error:', sessionRes.status, text.slice(0, 500));
      return res.status(500).json({ error: 'Could not store analytics session.' });
    }

    const eventRes = await fetch(`${supabaseUrl}/rest/v1/analytics_events`, {
      method: 'POST',
      headers: { ...authHeaders, Prefer: 'return=minimal' },
      body: JSON.stringify(events),
    });

    if (!eventRes.ok) {
      const text = await eventRes.text();
      console.error('Analytics event insert error:', eventRes.status, text.slice(0, 500));
      return res.status(500).json({ error: 'Could not store analytics events.' });
    }
  } catch (err) {
    console.error('Analytics insert exception:', err);
    return res.status(500).json({ error: 'Could not store analytics.' });
  }

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ ok: true, stored: events.length });
}

function normaliseSession(input) {
  const source = input && typeof input === 'object' ? input : {};
  const sessionId = cleanToken(source.session_id || source.sessionId, 96);
  if (!/^[a-zA-Z0-9_-]{12,96}$/.test(sessionId)) return null;

  return {
    session_id: sessionId,
    entry_path: cleanPath(source.entry_path || source.entryPath),
    entry_url: cleanUrl(source.entry_url || source.entryUrl, 700),
    entry_title: cleanText(source.entry_title || source.entryTitle, 180),
    entry_referrer: cleanUrl(source.entry_referrer || source.entryReferrer, 700),
    entry_referrer_host: cleanText(source.entry_referrer_host || source.entryReferrerHost, 180),
    entry_source: cleanText(source.entry_source || source.entrySource, 80),
    entry_intent: cleanText(source.entry_intent || source.entryIntent, 120),
    utm_source: cleanText(source.utm_source || source.utmSource, 120),
    utm_medium: cleanText(source.utm_medium || source.utmMedium, 120),
    utm_campaign: cleanText(source.utm_campaign || source.utmCampaign, 160),
    utm_term: cleanText(source.utm_term || source.utmTerm, 160),
    device_category: cleanText(source.device_category || source.deviceCategory, 40),
    viewport_width: cleanInt(source.viewport_width || source.viewportWidth, 0, 10000),
    viewport_height: cleanInt(source.viewport_height || source.viewportHeight, 0, 10000),
    screen_width: cleanInt(source.screen_width || source.screenWidth, 0, 20000),
    screen_height: cleanInt(source.screen_height || source.screenHeight, 0, 20000),
    language: cleanText(source.language, 40),
    timezone: cleanText(source.timezone, 80),
    consent_state: cleanText(source.consent_state || source.consentState, 40),
    metadata: cleanJson(source.metadata, MAX_METADATA_BYTES),
  };
}

function normaliseEvents(input, sessionId) {
  const list = Array.isArray(input) ? input.slice(0, MAX_EVENTS_PER_REQUEST) : [];
  const rows = [];

  for (const raw of list) {
    if (!raw || typeof raw !== 'object') continue;
    const eventName = cleanEventName(raw.event_name || raw.eventName || raw.name);
    if (!eventName) continue;

    rows.push({
      occurred_at: cleanDate(raw.occurred_at || raw.occurredAt),
      session_id: sessionId,
      event_name: eventName,
      path: cleanPath(raw.path),
      page_title: cleanText(raw.page_title || raw.pageTitle, 180),
      page_category: cleanText(raw.page_category || raw.pageCategory, 80),
      source_page: cleanText(raw.source_page || raw.sourcePage, 180),
      target_text: cleanText(raw.target_text || raw.targetText, 220),
      target_role: cleanText(raw.target_role || raw.targetRole, 80),
      target_tag: cleanText(raw.target_tag || raw.targetTag, 40),
      target_href: cleanUrl(raw.target_href || raw.targetHref || raw.destination, 700),
      target_host: cleanText(raw.target_host || raw.targetHost, 180),
      target_id: cleanText(raw.target_id || raw.targetId, 120),
      section_heading: cleanText(raw.section_heading || raw.sectionHeading, 220),
      section_level: cleanText(raw.section_level || raw.sectionLevel, 20),
      section_index: cleanInt(raw.section_index || raw.sectionIndex, 0, 500),
      scroll_depth: cleanInt(raw.scroll_depth || raw.scrollDepth, 0, 100),
      active_time_ms: cleanInt(raw.active_time_ms || raw.activeTimeMs, 0, 24 * 60 * 60 * 1000),
      time_on_page_ms: cleanInt(raw.time_on_page_ms || raw.timeOnPageMs, 0, 24 * 60 * 60 * 1000),
      visible_section_count: cleanInt(raw.visible_section_count || raw.visibleSectionCount, 0, 500),
      viewport_width: cleanInt(raw.viewport_width || raw.viewportWidth, 0, 10000),
      viewport_height: cleanInt(raw.viewport_height || raw.viewportHeight, 0, 10000),
      metadata: cleanJson(raw.metadata || raw.props, MAX_METADATA_BYTES),
    });
  }

  return rows;
}

function parseBody(body) {
  if (!body) return {};
  if (typeof body === 'object' && !Buffer.isBuffer(body)) return body;
  const text = Buffer.isBuffer(body) ? body.toString('utf8') : String(body);
  try { return JSON.parse(text); } catch { return {}; }
}

function cleanEventName(value) {
  const text = cleanToken(value, 80).toLowerCase();
  return /^[a-z0-9_:-]{2,80}$/.test(text) ? text : '';
}

function cleanToken(value, maxLength) {
  return String(value || '')
    .replace(/[^\w:-]/g, '')
    .slice(0, maxLength);
}

function cleanText(value, maxLength) {
  return String(value || '')
    .replace(EMAIL_RE, '[email]')
    .replace(/[\u0000-\u001f\u007f]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength) || null;
}

function cleanPath(value) {
  const text = cleanText(value, 700);
  if (!text) return null;
  if (text.startsWith('/')) return text;
  try {
    const url = new URL(text);
    return `${url.pathname}${url.search}`.slice(0, 700);
  } catch {
    return text.slice(0, 700);
  }
}

function cleanUrl(value, maxLength) {
  const text = cleanText(value, maxLength);
  if (!text) return null;
  try {
    const url = new URL(text, 'https://www.mealprep.org.uk');
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    url.username = '';
    url.password = '';
    return url.toString().slice(0, maxLength);
  } catch {
    return text.slice(0, maxLength);
  }
}

function cleanInt(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.max(min, Math.min(max, Math.round(number)));
}

function cleanDate(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  const now = Date.now();
  if (date.getTime() > now + 60 * 60 * 1000) return null;
  if (date.getTime() < now - 1000 * 60 * 60 * 24 * 30) return null;
  return date.toISOString();
}

function cleanJson(value, maxBytes) {
  const seen = new WeakSet();
  const clean = sanitizeJson(value, seen, 0);
  const serialised = JSON.stringify(clean ?? {});
  if (Buffer.byteLength(serialised, 'utf8') <= maxBytes) return clean ?? {};
  return { truncated: true };
}

function sanitizeJson(value, seen, depth) {
  if (value === null || value === undefined) return null;
  if (depth > 3) return '[truncated]';
  if (typeof value === 'string') return cleanText(value, 500);
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'boolean') return value;
  if (Array.isArray(value)) return value.slice(0, 20).map(item => sanitizeJson(item, seen, depth + 1));
  if (typeof value === 'object') {
    if (seen.has(value)) return '[circular]';
    seen.add(value);
    const out = {};
    for (const [key, item] of Object.entries(value).slice(0, 40)) {
      const cleanKey = cleanText(key, 80);
      if (cleanKey) out[cleanKey] = sanitizeJson(item, seen, depth + 1);
    }
    return out;
  }
  return null;
}
