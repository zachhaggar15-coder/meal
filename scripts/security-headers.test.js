import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const config = JSON.parse(fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
const globalRule = config.headers.find(rule => rule.source === '/(.*)');
const headers = new Map(globalRule?.headers.map(header => [header.key.toLowerCase(), header.value]));

test('every response receives the baseline security headers', () => {
  assert.ok(globalRule, 'vercel.json needs a global header rule');
  assert.equal(headers.get('x-content-type-options'), 'nosniff');
  assert.equal(headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
  assert.equal(headers.get('x-frame-options'), 'DENY');
  assert.equal(headers.get('content-security-policy'), "frame-ancestors 'none'");
  assert.match(headers.get('permissions-policy') || '', /camera=\(\)/);
  assert.match(headers.get('permissions-policy') || '', /microphone=\(\)/);
});

test('the enforced policy still only covers framing', () => {
  // The full policy must not be enforced until Google's certified CMP is live:
  // it injects scripts and iframes from origins that cannot be enumerated in
  // advance, so an enforced CSP would be torn up the moment ads switch on.
  const policy = headers.get('content-security-policy') || '';
  assert.equal(policy.split(';').filter(Boolean).length, 1);
  assert.doesNotMatch(policy, /(?:script-src|frame-src|connect-src|default-src)/);
});

test('the full policy ships report-only, so CMP gaps surface instead of breaking', () => {
  const reportOnly = headers.get('content-security-policy-report-only');
  assert.ok(reportOnly, 'report-only CSP must be present to observe the CMP install');

  // The origins the site actually loads from today, read out of the code:
  // AdSense (AdSlot.jsx), GA4 (analytics.js), Plausible (analytics.js) and
  // Vercel analytics (main.jsx).
  assert.match(reportOnly, /script-src[^;]*pagead2\.googlesyndication\.com/);
  assert.match(reportOnly, /script-src[^;]*googletagmanager\.com/);
  assert.match(reportOnly, /script-src[^;]*plausible\.io/);
  assert.match(reportOnly, /connect-src[^;]*google-analytics\.com/);
  // Card visuals are inline SVG data URIs (visualAssets.js).
  assert.match(reportOnly, /img-src[^;]*data:/);
  assert.match(reportOnly, /object-src 'none'/);
  assert.match(reportOnly, /frame-ancestors 'none'/);
});

test('report-only and enforced policies do not contradict each other on framing', () => {
  const enforced = headers.get('content-security-policy') || '';
  const reportOnly = headers.get('content-security-policy-report-only') || '';
  assert.match(enforced, /frame-ancestors 'none'/);
  assert.match(reportOnly, /frame-ancestors 'none'/);
});
