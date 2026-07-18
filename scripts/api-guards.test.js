import assert from 'node:assert/strict';
import {
  applyApiGuards,
  assertInteger,
  assertSerializedSize,
  assertText,
} from '../api/_guards.js';
import { adminTokenFromHeaders, escCsv } from '../api/admin-stats.js';

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
}

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
