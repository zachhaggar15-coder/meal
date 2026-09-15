# Pinterest distribution

Last reviewed: 15 September 2026

MealPrep.org.uk publishes to Pinterest by RSS. Pinterest polls a feed per
board and creates the Pins itself, so there is no manual design, upload or
scheduling step and no Pinterest API integration to maintain.

```
site content (hubs, combo pages, articles, paid products)
        │
        ├─ eligibility   src/pinterest/eligibility.js   which pages qualify, ranked
        ├─ metadata      src/pinterest/metadata.js      Pin title, description, link
        ├─ creative      src/pinterest/creative.js      1000x1500 SVG, three templates
        └─ distribution  src/pinterest/feed.js          RSS 2.0 (the first adapter)
                │
        scripts/generate-pinterest-assets.js  →  dist/pinterest/*.xml + dist/pinterest/img/*.png
```

Everything above the distribution layer is plain data. A Pinterest API adapter
would replace `feed.js` only; selection, copy and creatives would not change.

## Feeds

Written at build time, served as static files from the CDN. The feeds are a
**partition**: every eligible page appears on exactly one board feed, so
connecting all of them cannot produce duplicate Pins.

| Feed | Board |
| --- | --- |
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

Then, per board: one Pin per proposition (store + topic + calorie target), at
most three pages per chain on a mixed board, and never more than the board's
`limit`. The whole system is capped at `TOTAL_ENTRY_LIMIT`.

The 1,205 programmatic `/plans/` routes are **excluded**
(`INCLUDE_PLAN_PAGES = false`). They differ from one another by a store name
and a calorie number, which is the near-duplicate pattern Pinterest penalises
and the same structural problem behind the September 2026 AdSense rejection
(see `src/data/planIndexAllowlist.js`). The hubs and combo pages already
represent every one of those intents editorially.

## Images

Three templates, picked from the page's own data:

- **supermarket** — the page names a chain. Deep-green band, store eyebrow,
  headline, three facts.
- **target** — no chain but an explicit calorie target. The figure is the hero.
- **guide** — editorial. Cream card, accent rule, footer band.

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

Campaign is the board key (`aldi`, `lidl`, `supermarket`, `calorie-plans`,
`high-protein`, `budget`, `weight-loss`, `guides`), so GA4 splits Pinterest
traffic by the board that produced it with no extra configuration.

Build links with `pinDestinationUrl()` from `src/pinterest/metadata.js` — never
by hand — so attribution cannot drift. The RSS `guid` is the **clean** canonical
URL, without UTMs, so changing the convention later does not re-Pin every page.
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
| `TOTAL_ENTRY_LIMIT` | hard cap across all boards |
| `MIN_ELIGIBILITY_SCORE` | quality floor |
| `PINTEREST_BOARDS[].limit` | per-board cap |
| `MAX_ENTRIES_PER_SIGNATURE` | near-duplicate cap per board |
| `MAX_ENTRIES_PER_SUPERMARKET_PER_BOARD` | stops one chain filling a mixed board |
| `INCLUDE_PLAN_PAGES` | opens the 400 indexable `/plans/` routes |
| `PINTEREST_PRODUCT_ENTRIES` | paid product landing pages |

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
- **A paid product**: add one record to `PINTEREST_PRODUCT_ENTRIES`. Products
  score above every free page, and no other code changes.

## Turning it off

Set `PINTEREST_ENABLED = false`. The build then writes nothing under
`dist/pinterest/`, the feed URLs 404, and Pinterest stops creating new Pins.
Pins already published stay up — remove them in Pinterest if that is the intent.

## Commands

```bash
npm run pinterest:check    # validate and print every eligibility decision, writes nothing
npm run pinterest:build    # write into dist/ (needs a completed build)
node --test scripts/pinterest-feed.test.js
```

`generate-pinterest-assets.js` runs inside `npm run build`, immediately after
`prerender.js`. It **fails the build** on a defect in its own output, so a
broken feed cannot reach production:

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
- a board feed has ended up empty

Those entries drop out of the feed, each with a `! Pinterest: dropped ...` line
in the build log. Content churn in a 1,500-page site is normal and must never
block an unrelated release - least of all when nobody is watching the deploy.
Pins already published are unaffected; Pinterest simply stops seeing the entry.

## Troubleshooting

**Pinterest is not creating Pins.** Check, in order: the feed URL returns 200
and `Content-Type: application/xml`; the board is still connected under
Settings → Bulk create Pins; the feed has items (`npm run pinterest:check`).
Pinterest polls roughly daily and does not report errors — a feed that fails to
parse simply stops publishing.

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
