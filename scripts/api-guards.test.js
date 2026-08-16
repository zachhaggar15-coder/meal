import assert from 'node:assert/strict';
import {
  applyApiGuards,
  assertInteger,
  assertSerializedSize,
  assertText,
} from '../api/_guards.js';
import { adminTokenFromHeaders, escCsv } from '../api/admin-stats.js';
import { resolveEmailPlan } from '../api/email-plan.js';
import { cleanSenderEmail } from '../api/feedback.js';

function makeReq({ body = {}, headers = {}, ip = '203.0.113.10', ua = 'guard-test' } = {}) {
  return {
    body,
    headers: {
      'content-type': 'application/json',
      'user-agent': ua,
      ...headers,
    },
    socket: { remoteAddress: ip },
  };
}

function makeRes() {
  return {
    statusCode: 200,
    headers: {},
    payload: undefined,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
  };
}

async function run() {
  const okRes = makeRes();
  assert.equal(
    await applyApiGuards(makeReq({ body: { days: 7 } }), okRes, {
      route: 'security-test-ok',
      maxBodyBytes: 1024,
      rateLimit: { limit: 2, windowMs: 60_000 },
    }),
    true,
  );
  assert.equal(okRes.statusCode, 200);

  const bigRes = makeRes();
  assert.equal(
    await applyApiGuards(makeReq({ body: { text: 'x'.repeat(2000) } }), bigRes, {
      route: 'security-test-big',
      maxBodyBytes: 128,
      rateLimit: { limit: 2, windowMs: 60_000 },
    }),
    false,
  );
  assert.equal(bigRes.statusCode, 413);

  const route = `security-test-rate-${Date.now()}`;
  assert.equal(await applyApiGuards(makeReq({ ua: route }), makeRes(), {
    route,
    maxBodyBytes: 1024,
    rateLimit: { limit: 2, windowMs: 60_000 },
  }), true);
  assert.equal(await applyApiGuards(makeReq({ ua: route }), makeRes(), {
    route,
    maxBodyBytes: 1024,
    rateLimit: { limit: 2, windowMs: 60_000 },
  }), true);
  const limitedRes = makeRes();
  assert.equal(await applyApiGuards(makeReq({ ua: route }), limitedRes, {
    route,
    maxBodyBytes: 1024,
    rateLimit: { limit: 2, windowMs: 60_000 },
  }), false);
  assert.equal(limitedRes.statusCode, 429);
  assert.ok(Number(limitedRes.headers['Retry-After']) > 0);

  assert.equal(assertInteger('7', 'days', { allowed: [1, 3, 7] }), 7);
  assert.throws(() => assertInteger('8', 'days', { allowed: [1, 3, 7] }), /days must be one of/);
  assert.equal(assertText('hello\nworld', 'instruction', 20), 'hello world');
  assert.throws(() => assertText('x'.repeat(21), 'instruction', 20), /instruction must be 20 characters or fewer/);
  assert.throws(() => assertSerializedSize({ text: 'x'.repeat(200) }, 'plan', 50), /plan is too large/);

  assert.equal(adminTokenFromHeaders({ headers: { 'x-admin-token': 'secret' }, query: { token: 'leaky' } }), 'secret');
  assert.equal(adminTokenFromHeaders({ headers: {}, query: { token: 'leaky' } }), '');
  assert.equal(escCsv('=1+1'), '\'=1+1');
  assert.equal(escCsv('hello, world'), '"hello, world"');

  const legacyEmailPlan = resolveEmailPlan('tesco-low-calorie-meal-plan');
  assert.equal(legacyEmailPlan?.slug, 'tesco-low-calorie-meal-plan');
  assert.match(legacyEmailPlan?.seo?.canonical || '', /\/meal-plan\/tesco-low-calorie-meal-plan$/);
  assert.ok(Object.values(legacyEmailPlan?.shoppingList || {}).flat().length > 0);
  assert.equal(resolveEmailPlan('not-a-real-plan'), null);
}

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

// The feedback form's optional reply address is placed in the Reply-To header,
// which makes it the one free-text field on the site that could carry a second
// header if it were passed through unchecked.
{
  for (const good of ['zach@example.co.uk', 'a.b+tag@mail.example.com']) {
    assert.equal(cleanSenderEmail(good), good, `${good} should be accepted`);
  }

  // Absent is fine — feedback never requires an address.
  for (const blank of [undefined, null, '', '   ']) {
    assert.equal(cleanSenderEmail(blank), '', 'a missing address must not be an error');
  }

  // Present but unusable returns null so the caller can say so.
  const LF = String.fromCharCode(10);
  const CR = String.fromCharCode(13);
  for (const bad of [
    `zach@example.com${LF}Bcc: victim@example.com`,
    `zach@example.com${CR}${LF}To: someone@example.com`,
    'zach@example.com, other@example.com',
    'Zach <zach@example.com>',
    'zach@example.com; drop',
    'not-an-email',
    'zach@localhost',
    `${'a'.repeat(250)}@example.com`,
  ]) {
    assert.equal(cleanSenderEmail(bad), null, `should reject: ${JSON.stringify(bad)}`);
  }

  console.log('feedback reply-address validation: ok');
}
