# Amazon link monitoring

Every outbound Amazon link on the site is checked once a week: **Monday at 15:00
Europe/London**, by the `Weekly Amazon Link Check` GitHub Action
(`.github/workflows/weekly-amazon-link-check.yml`).

Affiliate links rot quietly. A delisted ASIN keeps rendering a normal-looking
"See Amazon price" button, and the only visible symptom is commission that
stops arriving. This job is the alarm for that.

## What it checks

The checker builds the site and scans the prerendered HTML in `dist/`, not the
source data modules. Links are assembled in three different places
(`amazonProductUrl()` in `src/data/containerProducts.js` and
`src/data/mealPrepProducts.js`, plus hand-written URLs in `src/data/offers.js`
and the blog corpus), so only the rendered output is the full picture.

At the time of writing that is **57 distinct Amazon links across 1,406 pages**,
appearing 1,822 times.

Each link gets one status:

| Status | Meaning | Fails the run |
| --- | --- | --- |
| `in-stock` | ASIN resolves and has a buyable offer | no |
| `reachable` | URL resolves; stock not verified (reachability mode only) | no |
| `out-of-stock` | ASIN resolves but nothing is buyable today | yes |
| `dead` | ASIN no longer resolves — delisted or removed | yes |
| `blocked` | Amazon served a CAPTCHA or a 5xx | no, reported only |
| `unknown` | Could not be determined | no, reported only |

`blocked` and `unknown` deliberately do not fail the run. A CAPTCHA says
something about Amazon, not about the listing, and treating it as link rot would
train everyone to ignore the alert.

## The two modes

**`paapi` — the real check.** Uses the Amazon Product Advertising API
(`GetItems`). This is the only sanctioned source of live availability and the
only mode that can answer "is it in stock". Runs automatically when credentials
are present.

**`reachability` — the fallback.** No credentials, so it probes each product URL
over HTTP and reports only whether it still resolves. **It does not check
stock**, and says so in every report it writes. Amazon serves CAPTCHAs to
datacentre IPs, so on GitHub runners expect some `blocked` results.

### Enabling the stock check

Stock verification needs three GitHub Actions secrets:

- `AMAZON_PAAPI_ACCESS_KEY`
- `AMAZON_PAAPI_SECRET_KEY`
- `AMAZON_PAAPI_PARTNER_TAG` (the store tag, `amazonaf063dc-21`)

Get them from the Associates account that owns the tag, under
[Tools → Product Advertising API](https://affiliate-program.amazon.co.uk/assoc_credentials/home).
Amazon only grants PA-API access to accounts with qualifying sales in the last
180 days, so if the API is not yet available the job keeps running in
reachability mode until it is — no configuration change needed when the
credentials land.

## Running it locally

```bash
npm run build && npm run check:amazon-links
```

Useful flags:

```bash
node scripts/check-amazon-links.js --mode=reachability   # force the probe
node scripts/check-amazon-links.js --fail-on=dead        # ignore stock, alert on dead links only
node scripts/check-amazon-links.js --fail-on=none        # report without failing
node scripts/check-amazon-links.js --probe-delay=1500    # even gentler probing
```

Reachability mode probes two URLs at a time with a 750ms gap. That is
deliberate: running the 57 links flat out gets the IP rate-limited part way
through, after which every remaining result is a CAPTCHA and the run tells you
nothing. If a run comes back all `blocked`, wait a few minutes before retrying —
the limit is on your IP, not on the links.

Exit codes: `0` healthy, `1` link problems found, `2` the check itself could not
run (bad credentials, unreachable API, or a `dist/` that is mid-build). The
distinction matters — `2` means the alarm is broken, not the links.

The checker refuses to scan a half-written `dist/`, comparing the HTML file count
against the sitemap and treating a missing sitemap as an unfinished build. A
partial crawl would otherwise report a subset of the links and stamp the result
`exhaustive`, which is how a dead link gets missed. If you run the check while
another build is in flight, expect exit `2` and retry when it finishes.

## Reports

Both written to `audit-artifacts/` (gitignored) and uploaded by the Action as
the `amazon-link-health` artifact, kept 90 days:

- `amazon-link-health.json` — full machine-readable result, including every page
  that links to each product
- `amazon-link-health.md` — the human summary, also pasted into the Action's job
  summary so a failure is readable without downloading anything

## When it fails

The workflow fails, which sends the repository's normal failure notification.
Open the run, read the job summary, and it names the ASIN, the reason, and every
route that links to it. Fixes go in the product entry in
`src/data/mealPrepProducts.js`, `src/data/containerProducts.js` or
`src/data/offers.js` — update the ASIN and the descriptive copy together, since
the copy describes the specific product.

## Scheduling note

GitHub cron is UTC and does not follow British Summer Time. The workflow
therefore registers two triggers, `14:00 UTC` and `15:00 UTC`, and the first
step drops whichever one is not 15:00 in London that week. The result is exactly
one run every Monday at 3pm local time, year-round.
