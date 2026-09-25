# Pinterest distribution

Last reviewed: 25 September 2026

MealPrep.org.uk publishes to Pinterest by RSS. Pinterest polls a feed per
board and creates the Pins itself, so there is no manual design, upload or
scheduling step and no Pinterest API integration to maintain.

```
site content (hubs, combo pages, articles, the 6-week PDF plans)
        │
        ├─ eligibility   src/pinterest/eligibility.js   which pages qualify, ranked
        ├─ products      src/pinterest/products.js      Pins for the 6-week PDF plans
        ├─ metadata      src/pinterest/metadata.js      Pin title, description, link
        ├─ creative      src/pinterest/creative.js      1000x1500 SVG, five templates
        ├─ schedule      src/pinterest/schedule.js      when each Pin is released
        └─ distribution  src/pinterest/feed.js          RSS 2.0 (the first adapter)
                │
        scripts/generate-pinterest-assets.js  →  dist/pinterest/schedule.json + dist/pinterest/img/*
        api/pinterest-feed.js                 →  /pinterest/<board>.xml, as of right now
```

Everything above the distribution layer is plain data. A Pinterest API adapter
would replace `feed.js` only; selection, copy and creatives would not change.

## Why there is a release queue

The launch feeds (15 September 2026) put every page in the feed at once and
then never changed. Pinterest only makes a Pin from an RSS item it has not seen
before, so it made one batch of 49 Pins on 16 September and nothing after it:
Pinterest analytics showed a single spike of impressions and then a flat line.
Pinterest also favours accounts that publish fresh Pins steadily over ones
that bulk-upload.

So every Pin now has a release date:

- The 49 launch pages (`PINTEREST_LAUNCH_BATCH`) keep the launch date.
- Everything else is released at most `PINS_PER_DAY` (6) a day from
  `PINTEREST_DRIP_START`, spaced out between 07:00 and 21:00 UTC, with the
  boards taking turns. **No board ever gets more than one new Pin a day**, so
  there is never a burst: once only a few boards have Pins left, a day simply
  releases fewer.
- Each page gets a first Pin, and later a second Pin with a different design
  (`checklist`) and copy led by the page's intro. Pinterest counts a new image
  as a fresh Pin even for the same page. `PIN_VARIANTS_PER_PAGE` sets this.
- Each 6-week PDF product gets four Pins, each with its own food photo and hook.

The build writes every Pin and its date to `dist/pinterest/schedule.json`.
`api/pinterest-feed.js` (reached through a `vercel.json` rewrite of
`/pinterest/<board>.xml`) reads that file and serves only the Pins whose date
has passed, newest first, at most `FEED_ITEM_LIMIT` per feed. That is what lets
new Pins appear every day **without a redeploy**. The build deliberately writes
no static `.xml`: a static file at the feed URL would shadow the rewrite and
freeze the feed again.

The build log shows how far the queue has run and when it runs dry, and warns
once fewer than `QUEUE_WARNING_DAYS` (14) days are left. New pages join the
queue automatically; to extend it further, raise the board `limit` values or
`PIN_VARIANTS_PER_PAGE`.

## Feeds

Written at build time, served as static files from the CDN. The feeds are a
**partition**: every eligible page appears on exactly one board feed, so
connecting all of them cannot produce duplicate Pins.

| Feed | Board |
| --- | --- |
| `https://www.mealprep.org.uk/pinterest/meal-prep-pdfs.xml` | 6-Week Meal Prep Plans (**new — create and connect**) |
| `https://www.mealprep.org.uk/pinterest/aldi.xml` | Aldi Meal Plans UK |
| `https://www.mealprep.org.uk/pinterest/lidl.xml` | Lidl Meal Plans UK |
| `https://www.mealprep.org.uk/pinterest/supermarket.xml` | UK Supermarket Meal Plans |
| `https://www.mealprep.org.uk/pinterest/calorie-plans.xml` | Calorie Meal Plans UK |
| `https://www.mealprep.org.uk/pinterest/high-protein.xml` | High Protein Meal Plans UK |
| `https://www.mealprep.org.uk/pinterest/budget.xml` | Budget Meal Plans UK |
| `https://www.mealprep.org.uk/pinterest/weight-loss.xml` | Weight Loss Meal Plans UK |
| `https://www.mealprep.org.uk/pinterest/guides.xml` | UK Meal Prep Guides |
| `https://www.mealprep.org.uk/pinterest/feed.xml` | **none — do not connect** |

`feed.xml` is the union of all the boards. It exists for debugging and for a
future API adapter. Connecting it to a board would Pin everything twice.

The `.xml` feeds are served with `X-Robots-Tag: noindex` so a distribution
endpoint cannot end up in Google's index. The creatives under
`/pinterest/img/` are **not** marked noindex: that header is a search-engine
directive, and there is no reason to risk Pinterest's crawler reading it as a
reason not to fetch the image.

## The 6-week PDF plans

`src/pinterest/products.js` turns every product in
`src/data/mealPrepPdfProducts.js`, plus the `/meal-prep-pdfs` shop page, into
Pins on the **6-Week Meal Prep Plans** board. Paid products have their own
board so the free-plan boards are not filled with adverts.

- Four Pins per product, each with a different food photo, panel colour and
  hook: the product name, its own opening line, the dinner count, the
  shopping list. The shop page has two.
- The design (`product` template) is photo-led: a food photo across the top,
  a "6-week PDF plan" badge and the price tag over it, then the hook and what
  is included.
- All copy and prices come from the product record, so a price change
  reaches the Pins on the next build. A paid Pin never says "free".
- The photos are JPEG copies of `public/images/meal-plans/*.webp`, checked in
  at `assets/pinterest/photos/` because the renderer cannot read WebP. Photo
  Pins are written as JPEG (`jpeg-js`); text Pins stay PNG.
- **A product that is not on sale is never advertised.** If a product page
  shows "Available soon" (its Lemon Squeezy buy link env var is not set in
  that build), the build drops its Pins with a warning. Set the
  `VITE_LS_BUY_URL_*` variables in Vercel and the Pins join the queue on the
  next deploy. The build also checks the buy button is a genuine Lemon
  Squeezy checkout (`https://<store>.lemonsqueezy.com/checkout/buy/<id>`); a
  placeholder or mistyped link counts as not on sale. (Checked on 25 September
  2026: all seven live checkouts open, match their product and price, and are
  not in test mode.)

## How a page becomes eligible

A page qualifies when it passes every gate and then scores at least
`MIN_ELIGIBILITY_SCORE` (55).

Gates (`gateFailures` in `eligibility.js`):

1. It has a canonical path that is not a utility, account, legal, chooser,
   browse or noindex route.
2. Its title is at least 12 characters.
3. Its meta description is at least 60 characters.
4. It has a proposition of its own — an intro, quick answer or description of
   at least 60 characters. A page with nothing to say is not a Pin.

Scoring rewards a named supermarket, an explicit calorie target, the
high-protein/budget/weight-loss clusters, editorial depth, a usable
description length, the article's category, and being in
`WEEKLY_SEO_INSIGHTS.trendingLinks` — which
`scripts/weekly-analytics-improvements.js` refreshes every week from GA4 and
Search Console, so ranking tracks real performance with no manual upkeep.

Then, per board: one templated page (hub, combo, plan) per proposition
(store + topic + calorie target), at most three pages per chain on a mixed
board, and never more than the board's `limit`. Editorial articles are not
collapsed by proposition, because two articles are two different pieces of
writing, but no two pages anywhere may share a title. The whole system is
capped at `TOTAL_ENTRY_LIMIT`.

The 1,205 programmatic `/plans/` routes are **excluded**
(`INCLUDE_PLAN_PAGES = false`). They differ from one another by a store name
and a calorie number, which is the near-duplicate pattern Pinterest penalises
and the same structural problem behind the September 2026 AdSense rejection
(see `src/data/planIndexAllowlist.js`). The hubs and combo pages already
represent every one of those intents editorially.

## Images

Five templates. A page's first Pin uses one of the first three, picked from
the page's own data; its second Pin uses `checklist`; product Pins use
`product` (see above).

- **supermarket** — the page names a chain. Deep-green band, store eyebrow,
  headline, three facts.
- **target** — no chain but an explicit calorie target. The figure is the hero.
- **guide** — editorial. Cream card, accent rule, footer band.
- **checklist** — second Pins. Green band with the page's search title, the
  first sentence of its intro, then its facts ticked off.
- **product** — the PDF plans. Food photo, badge, price tag, hook.

All are 1000×1500 (2:3), drawn as SVG by `creative.js` and rasterised to PNG by
`@resvg/resvg-js` at build time. DM Sans Regular and Bold are checked in at
`assets/fonts/` and system fonts are switched off, so CI renders exactly what a
local build renders. No Canva, no design tool, no runtime image service.

Copy on a creative comes only from the page: its heading, its `stats` /
`comboStatLabels`, its FAQ and recipe counts, its published date. If a page has
no benefit to state, the creative shows fewer facts rather than an invented one.

## UTM convention

```
?utm_source=pinterest&utm_medium=organic&utm_campaign=<board key>
```

Campaign is the board key (`meal-prep-pdfs`, `aldi`, `lidl`, `supermarket`,
`calorie-plans`, `high-protein`, `budget`, `weight-loss`, `guides`), so GA4
splits Pinterest traffic by the board that produced it with no extra
configuration. A page's second and later Pins add `utm_content=pin-2` (and so
on), so GA4 can compare designs; a first Pin's link is unchanged.

Build links with `pinDestinationUrl()` from `src/pinterest/metadata.js` — never
by hand — so attribution cannot drift. The RSS `guid` is the **clean** canonical
URL, without UTMs, so changing the convention later does not re-Pin every page.
Later Pins for the same page use `<canonical>#pin-N`.
Destination pages keep their existing self-referencing canonical tag:
`SEO.jsx` strips the query when it builds `rel=canonical`, so the UTMs create no
duplicate-content risk.

## Structured data

No schema changes were made for Pinterest. Rich Pins read Open Graph first, and
every page already emits a complete `og:` set through `SEO.jsx`. The existing
types are already correct — `CollectionPage`/`ItemList` for hubs, `Article` for
editorial, `Recipe` only on the seven pages that genuinely qualify — and
`docs/structured-data-rules.md` is the authority. Do not relabel a seven-day
meal plan as a `Recipe` to please Pinterest.

## Save button

Deliberately not implemented. The official widget needs `pinit.js`, a
third-party script that scans the DOM on every page, and the pages worth Pinning
carry no in-content photography for it to attach to — the branded creatives
exist only in the feeds. The RSS system distributes the same pages without any
client-side cost. Revisit only if Pinterest shows meaningful referral traffic.

## Configuration

Everything tunable lives in `src/pinterest/config.js`.

| Setting | Meaning |
| --- | --- |
| `PINTEREST_ENABLED` | `false` stops the build writing any feed or image |
| `PINS_PER_DAY` | how many new Pins the queue releases a day, across all boards |
| `PINTEREST_DRIP_START` | first day of the queue |
| `PINTEREST_LAUNCH_BATCH` | the 49 pages already Pinned at launch — history, never add to it |
| `PIN_VARIANTS_PER_PAGE` | Pins per page (products have their own count, in `products.js`) |
| `FEED_ITEM_LIMIT` | newest released items shown per feed |
| `QUEUE_WARNING_DAYS` | build warns when the queue has fewer days left |
| `TOTAL_ENTRY_LIMIT` | hard cap across all boards |
| `MIN_ELIGIBILITY_SCORE` | quality floor |
| `PINTEREST_BOARDS[].limit` | per-board cap |
| `MAX_ENTRIES_PER_SIGNATURE` | near-duplicate cap per board |
| `MAX_ENTRIES_PER_SUPERMARKET_PER_BOARD` | stops one chain filling a mixed board |
| `INCLUDE_PLAN_PAGES` | opens the 400 indexable `/plans/` routes |
| `PINTEREST_PRODUCT_ENTRIES` | other paid product pages (the PDFs are added automatically) |

Environment variable:

| Name | Purpose |
| --- | --- |
| `PINTEREST_DOMAIN_VERIFICATION` | renders `<meta name="p:domain_verify">`. Also accepted as `VITE_PINTEREST_DOMAIN_VERIFICATION`. Unset means no tag is emitted. |

## Expanding or shrinking the feed

- **More pages**: raise the board `limit` values and `TOTAL_ENTRY_LIMIT`.
  Lower `MIN_ELIGIBILITY_SCORE` only if the added pages are genuinely good.
- **Programmatic plans**: set `INCLUDE_PLAN_PAGES = true`. Do this only with
  evidence that the hubs are producing impressions and that Pinterest demand
  exists the hubs cannot serve.
- **A new board**: add an entry to `PINTEREST_BOARDS` above the `guides`
  catch-all, then create the board in Pinterest and connect the new feed URL.
- **Fewer pages**: lower the limits. Removing a board means the pages it held
  fall through to the next matching board, so nothing is orphaned.
- **A new PDF plan**: add it to `src/data/mealPrepPdfProducts.js`; its Pins
  are generated and queued on the next build.
- **Another paid product**: add one record to `PINTEREST_PRODUCT_ENTRIES`.

## Turning it off

Set `PINTEREST_ENABLED = false`. The build then writes nothing under
`dist/pinterest/`, the feed endpoint has no schedule to read and returns 503,
and Pinterest stops creating new Pins.
Pins already published stay up — remove them in Pinterest if that is the intent.

## Commands

```bash
npm run pinterest:check    # validate and print every eligibility decision, writes nothing
npm run pinterest:build    # write into dist/ (needs a completed build)
node --test scripts/pinterest-feed.test.js
```

`generate-pinterest-assets.js` runs inside `npm run build`, immediately after
`prerender.js`. It validates every Pin the queue will ever release (not just
today's), and **fails the build** on a defect in its own output, so a broken
feed cannot reach production:

- a feed is not well-formed RSS 2.0
- a GUID repeats within a feed or appears on two boards
- a link is off-domain, points at localhost or a preview host, or is missing a
  UTM parameter
- a GUID is not the clean canonical URL
- an image is missing, or is not 1000×1500
- *every* eligible page fails to resolve, which means the build output is wrong

It **warns and carries on** when the content has simply moved:

- a destination page is no longer in `dist/` (a retired or renamed slug)
- a destination page is now `noindex`
- a destination now canonicalises somewhere else
- a product page is not on sale yet ("Available soon")
- a board feed has ended up empty
- the release queue has fewer than two weeks of Pins left

Those entries drop out of the feed, each with a `! Pinterest: dropped ...` line
in the build log. Content churn in a 1,500-page site is normal and must never
block an unrelated release - least of all when nobody is watching the deploy.
Pins already published are unaffected; Pinterest simply stops seeing the entry.

## Troubleshooting

**Pinterest is not creating Pins.** Check, in order: the feed URL returns 200
and `Content-Type: application/xml`; `/pinterest/schedule.json` returns 200
(if it does not, the feed endpoint answers 503); the board is still connected
under Settings → Bulk create Pins; the queue still has Pins left (the build
log, or `npm run pinterest:check`). Pinterest polls roughly daily and does
not report errors — a feed that fails to parse simply stops publishing.

**Impressions spike and then go flat.** The feed has stopped changing: either
the queue has run dry (see the build warning) or something is serving a static
copy of the feed. A static `.xml` under `dist/pinterest/` would shadow the
endpoint, which is why the build never writes one.

**A page is missing from a feed.** `npm run pinterest:check` prints every
decision with its reason: a gate failure, a score below the floor, a
near-duplicate of a higher-scoring page, or a board limit.

**A Pin has the wrong image.** Image filenames come from the entry id, which
comes from the source and slug. Changing a page's slug produces a new creative
and a new GUID, so Pinterest treats it as a new Pin — expected, and the reason
GUIDs are canonical URLs rather than a hash of the content.

**The build fails in `generate-pinterest-assets`.** The message names the feed
and the item. A "destination page is not in dist" error means the route was
removed or renamed; fix the source page rather than the feed.

**Creatives render without text.** The font files at `assets/fonts/` are
missing or corrupt. They are checked in deliberately; system fonts are disabled
so that CI and local builds cannot diverge.
