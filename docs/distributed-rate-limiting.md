# Distributed API rate limiting

All public API routes use the shared guard in `api/_guards.js`. It maintains two fixed-window counters per route:

- a normal per-client allowance, using the short-lived `x-mealprep-client` identifier; and
- a wider per-IP ceiling that prevents a caller bypassing the limit by rotating that identifier.

In production and preview deployments, both counters live in Upstash Redis and are updated together by one atomic Lua script. Local development and tests use the same contract with an in-memory store. Production and preview fail closed with HTTP 503 if Redis is not configured, so a deployment cannot silently fall back to instance-local protection.

## Provisioning

1. Add Upstash Redis to the Vercel project through the Vercel Marketplace.
2. Confirm that `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` exist for Production and Preview.
3. Redeploy after adding or rotating the credentials.
4. Run `npm run test:security` before release.

Never prefix either variable with `VITE_`; both credentials are server-only.

## Failure and refund behaviour

A Redis error prevents the guarded handler from running and returns HTTP 503. Routes that contact an upstream service call `refundRateLimit` before returning an upstream 5xx response. Refunds decrement both counters atomically without extending or resetting the original window, so a user does not spend their allowance on a failure caused by the site.
