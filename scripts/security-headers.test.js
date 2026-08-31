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

test('the early frame policy does not pre-empt the later CMP-aware CSP', () => {
  const policy = headers.get('content-security-policy') || '';
  assert.equal(policy.split(';').filter(Boolean).length, 1);
  assert.doesNotMatch(policy, /(?:script-src|frame-src|connect-src|default-src)/);
  assert.equal(headers.has('content-security-policy-report-only'), false);
});
