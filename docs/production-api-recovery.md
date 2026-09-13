# Production API recovery

The production and preview APIs deliberately fail closed when their distributed
rate-limit store is missing. Do not replace this with an in-memory production
fallback: serverless instances do not share memory, so that would weaken abuse
protection while appearing to work.

## Manual prerequisite: free Upstash Redis

1. In Upstash, create or claim one Redis database on the **Free** plan. Do not
   enter a payment card or enable pay-as-you-go.
2. In the Vercel project, add these values to **Production** and **Preview**:
   `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
3. Redeploy, then verify that malformed requests reach normal validation rather
   than returning `503`, valid generation/edit routes respond, and an invalid
   admin token returns `401`.

The current free allowance is 500,000 commands and 256 MB. The limiter performs
one atomic Redis operation per guarded request, plus a refund operation only
when the server or an upstream service fails.

## Email sender correction

Replace the misspelled Vercel variable `MEALPREP_PLAN_FROM_EMAI` with
`MEALPREP_PLAN_FROM_EMAIL` in Production and Preview. The code temporarily
accepts the misspelling as a compatibility fallback so existing delivery does
not change during the correction. Remove the misspelled variable after the
correct name is present everywhere.

Use a controlled recipient when testing `/api/email-plan`; never use a visitor
address or a mailing list for an operational check.

## Weekly report credentials

Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to GitHub Actions repository
secrets. They should match the existing server-side Vercel values. The weekly
report now marks this source as unavailable or stale instead of displaying
missing commercial data as zero.
