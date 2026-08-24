#!/usr/bin/env node
// Verifies that the configured Supabase project matches what the API handlers
// expect: the right project, the right key tier, every column the code selects,
// and the constraints the handlers rely on (session_id PK upsert, the events
// foreign key, the unique index on email).
//
// Run with:  npm run verify:supabase
//
// Reads SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from the environment; the
// npm script loads .env via --env-file-if-exists. Set SUPABASE_ANON_KEY too and
// the script additionally proves Row Level Security is blocking public reads.
//
// Writes a handful of test rows and deletes them again. Prints no secrets.

const url = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const anonKey = process.env.SUPABASE_ANON_KEY || '';

const pass = [];
const warn = [];
const fail = [];
const ok = m => pass.push(m);
const wr = m => warn.push(m);
const bad = m => fail.push(m);

// Every column the handlers select. Selecting a column that does not exist
// makes PostgREST return 400, so this doubles as a schema assertion.
const SELECTS = {
  interest_registrations: [
    'id', 'created_at', 'email', 'first_name', 'supermarket', 'goal',
    'source_page', 'subscribed', 'welcome_email_sent', 'notes',
  ],
  analytics_sessions: [
    'session_id', 'created_at', 'last_seen_at', 'entry_path', 'entry_url',
    'entry_title', 'entry_referrer', 'entry_referrer_host', 'entry_source',
    'entry_intent', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term',
    'device_category', 'viewport_width', 'viewport_height', 'screen_width',
    'screen_height', 'language', 'timezone', 'consent_state', 'metadata',
  ],
  analytics_events: [
    'id', 'received_at', 'occurred_at', 'session_id', 'event_name', 'path',
    'page_title', 'page_category', 'source_page', 'target_text', 'target_role',
    'target_tag', 'target_href', 'target_host', 'target_id', 'section_heading',
    'section_level', 'section_index', 'scroll_depth', 'active_time_ms',
    'time_on_page_ms', 'visible_section_count', 'viewport_width',
    'viewport_height', 'metadata',
  ],
};

function describeKey(value) {
  if (value.startsWith('sb_secret_')) return { tier: 'secret', label: 'new-style secret key' };
  if (value.startsWith('sb_publishable_')) return { tier: 'publishable', label: 'publishable key' };
  if (value.startsWith('eyJ')) {
    try {
      const role = JSON.parse(Buffer.from(value.split('.')[1], 'base64').toString()).role;
      return { tier: role, label: `legacy JWT with role=${role}` };
    } catch {
      return { tier: 'unknown', label: 'JWT whose payload could not be decoded' };
    }
  }
  return { tier: 'unknown', label: 'key of unrecognised format' };
}

async function main() {
  if (!url) bad('SUPABASE_URL is not set');
  else if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url)) wr(`SUPABASE_URL has an unexpected shape: ${url}`);
  else ok(`SUPABASE_URL valid — project ref "${url.match(/https:\/\/([a-z0-9-]+)\./)[1]}"`);

  if (!key) {
    bad('SUPABASE_SERVICE_ROLE_KEY is not set');
  } else {
    const { tier, label } = describeKey(key);
    if (tier === 'secret' || tier === 'service_role') ok(`Service key is a ${label} — correct tier`);
    else if (tier === 'publishable' || tier === 'anon') bad(`SUPABASE_SERVICE_ROLE_KEY holds a ${label} — that is the public tier, wrong key`);
    else wr(`SUPABASE_SERVICE_ROLE_KEY is a ${label}`);
  }

  if (!url || !key) return report();

  const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };

  // ── Schema ────────────────────────────────────────────────────────────────
  for (const [table, cols] of Object.entries(SELECTS)) {
    const res = await fetch(`${url}/rest/v1/${table}?select=${cols.join(',')}&limit=1`, {
      headers: { ...headers, Prefer: 'count=exact' },
    });
    if (res.ok) {
      const count = (res.headers.get('content-range') || '').split('/')[1] || '?';
      ok(`${table}: all ${cols.length} columns present, ${count} row(s)`);
    } else {
      bad(`${table}: HTTP ${res.status} — ${(await res.text()).slice(0, 200)}`);
    }
  }

  // ── Public access must be refused ─────────────────────────────────────────
  const unauth = await fetch(`${url}/rest/v1/interest_registrations?select=email&limit=1`);
  if (unauth.status === 401) ok('Unauthenticated read rejected (401)');
  else wr(`Unauthenticated read returned ${unauth.status}, expected 401`);

  // RLS can only be proven with a public key in hand. Without one this is the
  // single gap in the check, so say so rather than implying full coverage.
  if (anonKey) {
    const anonHeaders = { apikey: anonKey, Authorization: `Bearer ${anonKey}` };
    for (const table of Object.keys(SELECTS)) {
      const res = await fetch(`${url}/rest/v1/${table}?select=*&limit=1`, { headers: anonHeaders });
      const rows = res.ok ? await res.json() : null;
      if (!res.ok) ok(`${table}: anon read blocked (HTTP ${res.status}) — RLS holding`);
      else if (Array.isArray(rows) && rows.length === 0) ok(`${table}: anon read returns no rows — RLS holding`);
      else bad(`${table}: ANON CAN READ ${rows.length} row(s) — RLS is not blocking public access`);
    }
  } else {
    wr('SUPABASE_ANON_KEY not set — RLS not verified. Set it to close this gap, or confirm in the dashboard that all three tables show RLS enabled with zero policies.');
  }

  // ── Constraints the handlers depend on ────────────────────────────────────
  const sid = `verify_${Date.now()}`;
  const email = `verify-${Date.now()}@example.invalid`;
  const sessionBody = { session_id: sid, entry_path: '/verify', last_seen_at: new Date().toISOString() };

  const insert = await fetch(`${url}/rest/v1/analytics_sessions?on_conflict=session_id`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(sessionBody),
  });
  if (insert.ok) ok('analytics_sessions: insert OK');
  else bad(`analytics_sessions insert: ${insert.status} — ${(await insert.text()).slice(0, 200)}`);

  const upsert = await fetch(`${url}/rest/v1/analytics_sessions?on_conflict=session_id`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(sessionBody),
  });
  if (upsert.ok) ok('analytics_sessions: upsert on session_id OK (primary key correct)');
  else bad(`analytics_sessions upsert: ${upsert.status} — ${(await upsert.text()).slice(0, 200)}`);

  const event = await fetch(`${url}/rest/v1/analytics_events`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'return=minimal' },
    body: JSON.stringify([{ session_id: sid, event_name: 'verify', path: '/verify', occurred_at: new Date().toISOString() }]),
  });
  if (event.ok) ok('analytics_events: insert OK');
  else bad(`analytics_events insert: ${event.status} — ${(await event.text()).slice(0, 200)}`);

  const orphan = await fetch(`${url}/rest/v1/analytics_events`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'return=minimal' },
    body: JSON.stringify([{ session_id: 'no_such_session_xyz', event_name: 'verify' }]),
  });
  if (orphan.status === 409) ok('analytics_events: foreign key to analytics_sessions enforced');
  else wr(`Orphan event returned ${orphan.status}, expected 409 — the foreign key may be missing`);

  const waitlistBody = { email, first_name: 'Verify', source_page: '/verify' };
  const first = await fetch(`${url}/rest/v1/interest_registrations`, {
    method: 'POST', headers: { ...headers, Prefer: 'return=minimal' }, body: JSON.stringify(waitlistBody),
  });
  if (first.ok) ok('interest_registrations: insert OK');
  else bad(`interest_registrations insert: ${first.status} — ${(await first.text()).slice(0, 200)}`);

  const duplicate = await fetch(`${url}/rest/v1/interest_registrations`, {
    method: 'POST', headers: { ...headers, Prefer: 'return=minimal' }, body: JSON.stringify(waitlistBody),
  });
  if (duplicate.status === 409) ok('interest_registrations: unique index on email enforced');
  else wr(`Duplicate email returned ${duplicate.status}, expected 409 — the unique index may be missing`);

  // ── Cleanup ───────────────────────────────────────────────────────────────
  const cleanup = await Promise.all([
    fetch(`${url}/rest/v1/analytics_events?session_id=eq.${sid}`, { method: 'DELETE', headers }),
    fetch(`${url}/rest/v1/analytics_sessions?session_id=eq.${sid}`, { method: 'DELETE', headers }),
    fetch(`${url}/rest/v1/interest_registrations?email=eq.${email}`, { method: 'DELETE', headers }),
  ]);
  if (cleanup.every(res => res.ok)) ok('Cleanup: all test rows removed');
  else wr(`Cleanup returned ${cleanup.map(r => r.status).join('/')} — remove leftover verify_* rows manually`);

  return report();
}

function report() {
  console.log('\n-- PASS ------------------------------');
  pass.forEach(m => console.log(`  [ok] ${m}`));
  if (warn.length) {
    console.log('\n-- WARN ------------------------------');
    warn.forEach(m => console.log(`  [!]  ${m}`));
  }
  if (fail.length) {
    console.log('\n-- FAIL ------------------------------');
    fail.forEach(m => console.log(`  [x]  ${m}`));
  }
  const verdict = fail.length ? 'NOT READY' : warn.length ? 'READY (with warnings)' : 'ALL CHECKS PASSED';
  console.log(`\n${verdict} — ${pass.length} passed, ${warn.length} warnings, ${fail.length} failures`);
  process.exitCode = fail.length ? 1 : 0;
}

await main();
