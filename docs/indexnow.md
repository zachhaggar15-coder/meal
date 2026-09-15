# IndexNow

IndexNow tells participating search engines (Bing, Yandex, Seznam, Naver) that a
specific URL has been created, changed or removed, so they can recrawl it sooner.
It is a notification protocol, not a ranking mechanism — submitting a URL does
not make it rank, and resubmitting unchanged URLs is spam, not strategy. Google
does not participate; Google discovery stays with the sitemap and Search Console.

Everything below runs on deployed Vercel infrastructure. No local machine, no
Bing Webmaster Tools login and no manual submission is involved.

## How it works here

1. **`npm run build`** (run by Vercel on every deploy) ends with `prerender.js`,
   which writes `dist/indexnow-manifest.json`: a fingerprint of the rendered
   content of every indexable route. Fingerprints ignore build noise — hashed
   asset filenames, the footer's copyright year, insignificant whitespace — so a
   redeploy with no content change produces an identical manifest. Noindex and
   non-canonical routes are excluded, exactly as they are from the sitemap.
2. **A Vercel cron** declared in `vercel.json` calls `GET /api/indexnow-sync`
   once a day at 04:00 UTC (on the Hobby plan Vercel may fire it anywhere inside
   that hour, and daily is the finest granularity that plan allows). The cron is registered automatically by the
   deployment; there is nothing to configure in the Vercel dashboard.
3. **The sync endpoint** fetches the live manifest, compares it with the snapshot
   of what was last submitted (stored in the Upstash Redis instance the site
   already uses for rate limiting), and submits only the routes that were added,
   materially changed or removed.
   Cron delivery is best effort and can duplicate, so the run takes a 10-minute
   Redis lock and is idempotent: a second run sees no remaining diff.
4. **`server/indexnow.js`** does the actual submission: it canonicalises URLs,
   rejects anything that is not on the production host, deduplicates, batches
   (100 URLs per request) and POSTs to the shared endpoint
   `https://api.indexnow.org/indexnow`.

## Where the key is served

- Key: `aa4b99c49e40c8e76534a164794bc9be`
- Key file: <https://www.mealprep.org.uk/aa4b99c49e40c8e76534a164794bc9be.txt>
  (served from `public/`, `text/plain; charset=utf-8`, body is exactly the key)

IndexNow keys are public by design — the file is how an engine verifies that
whoever submitted the URLs controls the site. It is not an API secret. Both the
key and its location are committed so they cannot drift; the build fails if the
key file is missing from `dist/` or does not match the key being submitted.

## When URLs are submitted

Only when the deployed content of an indexable page actually changes:

| Situation | Submitted? |
| --- | --- |
| New page appears in the build | Yes |
| Existing page's rendered content changes | Yes |
| Page removed, or made noindex/non-canonical | Yes (engines drop it) |
| Redeploy with no content change | No |
| Preview or branch deployment | No — production only |
| First run after installation | No. A baseline is recorded so years of unchanged pages are not resubmitted |

At most 200 URLs go out per run, so one sweeping refactor cannot turn into a
site-wide resubmission; the remainder is picked up on following days. The
snapshot only advances for URLs that were actually accepted, so anything skipped
or failed is retried on the next run.

## How failures are handled

IndexNow is an optimisation and nothing on the site depends on it.

- Normal page requests never touch any of this. The submission runs in a
  scheduled serverless function, not in the request path.
- `submitUrls()` never throws. Network errors, timeouts (8s) and error responses
  are logged and reported.
- `200`/`202` are accepted. `400`/`403`/`422` mean a configuration fault and are
  logged without retrying. `429` and `5xx` leave the URLs unacknowledged so the
  next daily run tries again.
- A failing batch stops the run, so a broken key cannot produce a burst of
  pointless requests.
- The build only fails for a serious fault: a missing or mismatched key file.
- If Redis or the live manifest is unavailable the run is skipped, not retried
  in a loop.

## How to disable it

Any one of these, in order of least disruption:

1. Set `INDEXNOW_DISABLED=true` in Vercel's production environment variables.
   The endpoint returns immediately and submits nothing. No redeploy needed
   beyond the automatic one Vercel does when env vars change.
2. Remove the `crons` block from `vercel.json` and deploy. Nothing calls the
   endpoint any more.
3. Delete `api/indexnow-sync.js`, the `crons` block and
   `public/aa4b99c49e40c8e76534a164794bc9be.txt`.

Setting `CRON_SECRET` in Vercel is optional. If it is set, Vercel sends it as a
bearer token and the endpoint accepts nothing else; if it is not, the endpoint
accepts only requests carrying Vercel's cron markers (`x-vercel-cron-schedule`,
`x-vercel-cron`, or the `vercel-cron/` user agent). The endpoint takes no
input either way — it can only ever submit MealPrep.org.uk URLs that the
deployed build itself reports as changed.

## Tests

`scripts/indexnow.test.js` (part of `npm test`) covers key-file exposure, the
payload shape, production-host enforcement, deduplication, invalid-URL
rejection, batching, preview/local exclusion, API and network failure handling,
the per-run cap and the snapshot logic. It replaces `globalThis.fetch` with a
spy that fails the test if anything makes a real network call.
