import assert from 'node:assert/strict';
import { test } from 'node:test';
import handler from '../api/waitlist.js';
import { resetRateLimitStoreForTests, setRateLimitStoreForTests } from '../api/_rate-limit-store.js';

for (const scenario of [
  { name: 'uses the shared verified sender when the waitlist override is absent', override: '', expected: 'MealPrep <hello@mealprep.org.uk>' },
  { name: 'keeps an explicit waitlist sender', override: 'MealPrep <waitlist@mealprep.org.uk>', expected: 'MealPrep <waitlist@mealprep.org.uk>' },
  { name: 'keeps the registration when Resend rejects the email', override: '', expected: 'MealPrep <hello@mealprep.org.uk>', fails: true },
]) {
  test(scenario.name, async (t) => {
    const env = {
      SUPABASE_URL: 'https://database.example',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
      RESEND_API_KEY: 'test-resend-key',
      MEALPREP_FROM_EMAIL: 'MealPrep <hello@mealprep.org.uk>',
      MEALPREP_WAITLIST_FROM_EMAIL: scenario.override,
    };
    const previous = Object.fromEntries(Object.keys(env).map(key => [key, process.env[key]]));
    Object.assign(process.env, env);
    setRateLimitStoreForTests({ hit: async () => [{ count: 1, ttlMs: 600000 }, { count: 1, ttlMs: 600000 }] });
    t.after(() => {
      for (const [key, value] of Object.entries(previous)) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
      resetRateLimitStoreForTests();
    });
    const calls = [];
    t.mock.method(console, 'error', () => {});
    t.mock.method(globalThis, 'fetch', async (url, options) => {
      calls.push({ url, options });
      if (url === 'https://api.resend.com/emails') {
        assert.equal(JSON.parse(options.body).from, scenario.expected);
        return new Response(JSON.stringify(scenario.fails ? { message: 'Rejected' } : { id: 'email-1' }), { status: scenario.fails ? 403 : 200 });
      }
      if (options.method === 'POST') return new Response(JSON.stringify([{ id: 'signup-1' }]));
      assert.equal(options.method, 'PATCH');
      assert.deepEqual(JSON.parse(options.body), { welcome_email_sent: true });
      return new Response(null, { status: 204 });
    });
    const res = {
      statusCode: 200,
      setHeader() {},
      status(code) { this.statusCode = code; return this; },
      json(body) { this.body = body; return this; },
    };
    await handler({ method: 'POST', body: { email: 'signup@example.com' }, headers: {}, socket: { remoteAddress: '203.0.113.1' } }, res);
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, { ok: true, duplicate: false });
    assert.equal(calls.length, scenario.fails ? 2 : 3);
  });
}
