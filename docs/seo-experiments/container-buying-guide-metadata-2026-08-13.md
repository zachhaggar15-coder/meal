# Container buying guide metadata experiment

Page: `/blog/best-meal-prep-containers-uk`

Experiment start date: 13 August 2026

Minimum cooldown ends: 10 September 2026 (28 days)

Weekly status during cooldown: `SEO experiment active — do not rewrite`

## Metadata record

Before the experiment:

- Title: `Best Meal Prep Containers UK: Glass, Plastic & Leakproof`
- Description: `Compare glass, plastic and leakproof meal prep containers for UK work lunches and batch cooking, including five-pack, 1-litre and freezer-safe options.`

Approved experiment:

- Title: `Best Meal Prep Containers UK: 3 Practical Picks`
- Description: `Compare 3 practical meal prep container picks for work lunches, reheating and weekly batch cooking, with clear glass vs plastic and size guidance.`

The H1 remains `Best Meal Prep Containers UK: Leakproof, Cheap and Freezer-Safe Options` because it does not materially conflict with the approved positioning. The route, canonical and page ownership are unchanged.

## Historical supplied Search Console baselines

These figures were supplied by the site owner. They are historical baselines, not fresh API pulls.

| Scope | Clicks | Impressions | CTR | Average position |
| --- | ---: | ---: | ---: | ---: |
| Page | 11 | 8,210 | 0.13% | approximately 12.44 |
| Exact query: `best meal prep containers` | 8 | 7,521 | 0.11% | approximately 9.92 |

Fresh weekly Search Console data should record page and exact-query clicks, impressions, CTR and average position when credentials and data are available. One week of movement is not sufficient reason to change metadata again.

Early review is permitted only for a title-rendering failure, a completely inappropriate Google-selected title, a major ranking collapse, or a genuine factual, functional or technical defect. The automated workflow must not rewrite the page.

## Indexing and recrawl

The changed URL is recorded as a one-time indexing/recrawl candidate for this deployment. Normal sitemap generation updates its last-modified date at build time. No special indexing system and no recurring weekly indexing request are required.

## Commercial measurement boundary

`affiliate_product_click baseline period begins: 2026-08-13T18:54:50.777Z`

This is the actual timestamp of production deployment `dpl_565mBMphB4C9S3DjguVWSF9nAv8A`, which launched the canonical affiliate event. Earlier affiliate labels are historical and non-comparable.

The measurable on-site funnel is:

`Search impressions → Google clicks → buying-guide landing views → affiliate product impressions → affiliate_product_click → Amazon`

Measurement stops at the outbound Amazon click unless actual Amazon conversion or revenue data becomes available. No conversion or revenue estimate should be inferred.

Commercial reports should show buying-guide views, product impressions, canonical clicks, clicks per 1,000 page views, and CTR as clicks divided by product impressions. Every CTR must retain its click and impression denominator, especially for small samples. Breakdowns should cover placement, product ID/category/list position/recommendation source, and mobile/desktop/tablet where the sample supports it.

## Mid-cooldown confounder: inbound internal links added 29 August 2026

The metadata under test was not changed. What changed is the link graph around it.

On 29 August 2026, seventeen days into the twenty-eight day cooldown, internal
contextual links pointing at `/blog/best-meal-prep-containers-uk` were added to
a set of previously unlinked informational pages — the calorie plan cluster
(1200/1400/1500/1600/1800/2000), several meal-prep routine guides, and a number
of diet-guidance pages. Before this the page received almost no internal links
from the pages that actually carry the site's traffic, and took 23 page views in
ninety days.

This was a deliberate commercial decision, made with the confounder understood
and accepted, because the page was starved of on-site traffic for the whole
observation window and waiting a further twelve days had a real cost.

What it means for the 10 September read:

- **CTR at a given position remains the primary signal and is the least
  affected.** The experiment tests whether the new title and description earn
  more clicks from the same impressions. Internal links do not change what the
  snippet says.
- **Average position is now confounded.** Any improvement in position from
  10 September onward cannot be cleanly attributed to the metadata, because
  additional internal links are a recognised ranking input and landed
  mid-window. Treat a position change as jointly caused.
- **Page views and affiliate clicks are heavily confounded and should not be
  read as a metadata outcome at all.** They were the explicit target of the
  linking change.

Recommended handling: report the CTR result as the experiment outcome, and
report position, views and affiliate clicks separately as "post-linking" figures
against the pre-29-August baseline rather than against the 13 August baseline.
If a clean position read matters more than the traffic, the linking change is
reversible.

## Outcome, recorded 25 September 2026: inconclusive

Read from page- and query-filtered Search Console exports for
`best meal prep containers` (last 3 months, and last 28 days against the
previous 28), supplied by the site owner.

**The page lost the query before the test began.** Daily impressions for the
exact query were 350–670 a day from 26 July to 1 August, then fell to 0–60 a day
from 4 August. The metadata was rewritten on 3 August and again on 13 August, so
the loss was not caused by either rewrite and neither can be judged against it.

**Other URLs took the query over.** In the last 28 days the buying guide had 83
impressions for it (previous 28 days: 1,741). The retired
`/blog/freezer-safe-meal-prep-containers` had 1,685 at position 6.6 and the
retired `/blog/meal-prep-boxes-for-work-lunches` had 912. Both 301 since 29
August; Google was still showing the old URLs.

**Most of the impressions do not look like people.** Over three months the query
had 9,415 desktop impressions for 1 click and 410 mobile impressions for 9
clicks (2.2% CTR). Impressions arrive in on/off bursts (4–9 September:
2,280 impressions, 0 clicks, then near zero), which is the usual signature of
rank-tracking tools rather than shoppers. The "0.11% CTR" baseline was mostly
this traffic, and the later "1.22% CTR" is the same small human sample on a much
smaller denominator.

What follows from this:

- Do not report a CTR result for this experiment.
- Do not rewrite this page's title again to chase the head-term figure.
- Judge container pages on mobile figures and on clicks, not desktop
  impressions.
- The H1 was aligned with the tested title on 25 September, after the cooldown.
