# Growth plan, September 2026

Written 5 September 2026 against the Search Console export of the same day
(last 3 months) and the AdSense rejection of 5 September.

Supersedes nothing. Sits alongside `plan-page-index-strategy.md`, which records
the indexing decision this plan assumes has shipped.

---

## The audit this plan is built on

### Where the site is

| | |
|---|---:|
| Search clicks, trailing 30 days | 1,020 |
| Impressions, 3 months | 141,819 |
| Site CTR | 1.2% |
| Average position | 18.5 |
| First 3 weeks → last 3 weeks | 11.4x impressions, 21.1x clicks |

The site began ranking in early June 2026. Most growth so far is new-site
indexation and ranking maturation, which is a **one-time event**. The next
phase has to come from CTR and position, not from more pages.

### Finding 1 — CTR is the largest available lever, but smaller than first modelled

**Corrected 5 September, same day.** The first pass benchmarked every page
against a generic industry CTR-by-position curve and produced a gap of ~1,110
clicks per 3 months. That curve assumed this site should earn 3-3.5% at
positions 6-10. It does not, and there was no reason to assume it would.

Re-run using **the site's own median CTR per position band** as the benchmark -
no external assumption - the gap is **482 clicks per 3 months across 39 pages**.
The original figure overstated it by 2.3x. Trust this one; it is self-referential
and checkable.

The site's actual CTR by band (pages with >=200 impressions):

| Position band | Pages | Median CTR |
|---|---:|---:|
| 6-8 | 12 | 1.96% |
| 9-10 | 14 | 1.81% |
| 11-15 | 20 | 0.67% |
| 16-20 | 10 | 1.06% |
| 21+ | 30 | 0.46% |

Pages furthest below their own band, largest gap first:

| Gap | Impressions | CTR vs band | Pos | Page |
|---:|---:|---|---:|---|
| +84 | 8,178 | 0.78% vs 1.81% | 9.3 | `/plans/aldi-high-protein-low-cal-1500` |
| +46 | 9,484 | 0.19% vs 0.67% | 13.3 | `/blog/best-meal-prep-containers-uk` |
| +40 | 2,542 | 0.24% vs 1.81% | 9.6 | `/plans/aldi-veg-low-cal-1500` |
| +35 | 6,089 | 0.48% vs 1.06% | 18.1 | `/blog/what-does-1500-calories-look-like-uk` |
| +32 | 4,209 | 1.05% vs 1.81% | 9.1 | `/meal-plan/tesco-low-calorie-meal-plan` |
| +21 | 1,617 | 0.68% vs 1.96% | 7.9 | `/blog/sainsburys-healthy-ready-meal-combos-uk` |
| +20 | 1,863 | 0.91% vs 1.96% | 7.8 | `/blog/cheapest-uk-supermarket-meal-prep` |

**Four of the largest gaps are not addressable and should be struck from the
list:** `best-meal-prep-containers-uk` (+46) sits on an unwinnable commercial
SERP, see Finding 3; `meal-prep-containers-uk` (+26) is a redirect showing as a
stale row; `/browse` (+27, position 38.1) and `/blog` (+27, position 31.4) rank
too deep for CTR work to reach.

**Corrected again, 6 September, against page-filtered exports.** The largest
single item on that list is not reachable, so the realistic prize is smaller
still.

`/plans/aldi-high-protein-low-cal-1500` (+84) does not have a title problem. Its
own query export splits cleanly:

| | impressions | clicks | CTR |
|---|---:|---:|---:|
| Queries the page answers (high-protein / low-calorie plan) | 49 | 6 | **12.2%** |
| Queries it ranks for but cannot satisfy | 629 | 0 | **0.0%** |

The 0.78% headline is an average of an excellent page and 629 impressions of
queries a seven-day meal plan can never answer - *aldi meal planner* (145),
*high protein pasta aldi* (88), *aldi protein pasta* (85), *protein pasta aldi*
(80), *protein bread aldi* (72), *5 meals for 25 aldi* (71). No title makes
somebody searching for protein pasta want a meal plan. **Leave this page alone.**

Its 12.2% on matched intent is the highest CTR measured anywhere on the site,
which is worth remembering the next time a low headline CTR looks like a defect.

Striking it, **the realistic prize is ~165 clicks per 3 months, about 55/month.**

The 325 impressions of Aldi protein-product queries are still real demand - they
are simply landing on the wrong page. `aldi-high-protein-shopping-list-uk` now
covers Aldi's Higher Protein Food & Drink category, so the route to those clicks
is that page outranking the plan page for them, not a rewrite of either.

Note also that the top two opportunities are **plan pages, not blog posts** -
`aldi-high-protein-low-cal-1500` is the site's largest page by impressions and
converts at under half its band. The CTR session is not a blog session.

### Finding 2 — supermarket intent converts 4.9x better

| Query type | Queries | Clicks | Impressions | CTR |
|---|---:|---:|---:|---:|
| Supermarket-named | 144 | 64 | 5,169 | **1.24%** |
| Generic | 856 | 124 | 49,468 | 0.25% |

Individual examples are stronger still: *lidl budget meal plan* 15.79%,
*lidl shopping list* 9.52%, *lidl meal prep* 8.7%, *600 calorie meals high
protein* 11.76%. This confirms the August finding at 4.9x against 5.4x then.

**Implication for writing: lead with named-retailer intent.** Generic
"best low calorie foods" pages compete with established publishers and convert
at a quarter of the rate.

### Finding 3 — one query is a trap, not an opportunity

*best meal prep containers* takes **7,809 impressions for 10 clicks (0.13%)** at
position 10.1 — nominally the biggest single gap on the site. It is not
winnable with a title rewrite: the SERP is retailer listings and comparison
sites, and a publisher at position 10 on a commercial query gets what this gets.
Do not spend a session on it. Noted here so nobody re-discovers it and tries.

### Finding 4 — `/browse` is simply ranking badly - original claim withdrawn

**6,748 impressions, 4 clicks, 0.06% CTR - at position 38.1.**

This was first written as an intent mismatch, on the assumption that the listing
was surfacing for queries it could not satisfy. Session 3 checked the position
and that was wrong. A page on page four earning 0.06% is behaving exactly as
expected; there is no snippet or intent problem to fix, only a ranking one, and
a listing page is a poor candidate for that fight. **No action.**

### Finding 5 — the 1500-calorie cluster ranks badly despite demand

*1500 calorie meal plan* 488 impressions at position 41.7, *simple 1500 calorie
meal plan* 366 at 50.1, *1500 calorie meal* 363 at 43.5, *low calorie meal plans
uk* 357 at 51.4. Real demand, positions in the 40s. This is a content-strength
problem and the slowest item here, but the demand is proven.

---

## The plan

Six sessions. Each has a single theme, a measurable outcome, and a stopping
point. Order matters: the first two are the highest return per hour.

### Session 1 — ship the index change and the drafted guides

1. Push the plan-page noindex change (built, gated). Index goes 1,496 → 703,
   editorial share 14% → 33%, at a cost of zero measured clicks.
2. Apply the five drafted guides from the scratchpad: food labels, portioning
   without scales, cooking for one, household calorie needs, swapping meals.
   Corpus 139 → 144.
3. Wait ~1 week, confirm in Search Console that noindex is registering, then
   **apply to AdSense**.

*Outcome: the structural objection is addressed and the application is in.*

### Session 2 — CTR on six pages, measured before extending

Titles and meta descriptions only, for the six addressable pages in Finding 1.
Rules, from Finding 2:

- Put the retailer or the number first where one applies - *Aldi*, *Tesco*,
  *1,500 calories* - because that is what the searcher typed.
- Say what the page gives, not what it is about. "Free PDF + shopping list"
  beats "a guide to".
- Meta descriptions are ad copy for a link, not summaries.
- **Do not touch H1s or body content.** This session changes what the SERP
  shows and nothing else, so the result stays attributable.

**Do six, not twenty.** Two reasons. Google rewrites titles a large share of the
time, so the mechanism is less reliable than the arithmetic suggests; and
changing a title makes Google re-evaluate relevance, so a page at position 7 can
move either way. Measure at three weeks, then extend with what was learned.

*Realistic outcome: perhaps 40-85 clicks/month if it works. Treat anything above
a third of the modelled gap as a good result.*

### Session 3 — COMPLETE, and the answer was "no action"

Run 5 September. Both halves of the original premise were wrong.

**`/browse` is not an intent mismatch.** It sits at **position 38.1**. A page on
page four earning 0.06% is behaving normally. It is a ranking problem, and a
listing page competing for head terms is a poor fight to pick. Leave it.

**The container cannibalisation was already fixed.** `meal-prep-containers-uk`,
`/glass-meal-prep-containers`, `best-glass-meal-prep-containers-uk`,
`freezer-safe-meal-prep-containers` and `glass-vs-plastic-meal-prep-containers`
all 301 already - retired in the August consolidation. Roughly 4,000 of the
impressions attributed to "waste" belong to URLs that redirect.

**Also struck: the framing that ~16,000 impressions were "wasted".** Impressions
are not a resource that gets spent. There was nothing to recover.

**What the session did produce** is the strongest available evidence for
Session 4's direction:

| Page | Impressions | Clicks | CTR | Pos |
|---|---:|---:|---:|---:|
| `meal-prep-container-size-guide` | 4,377 | **68** | **1.55%** | 5.9 |
| `best-meal-prep-containers-uk` | 9,484 | 18 | 0.19% | 13.3 |

Twice the impressions, a quarter of the clicks. The size guide answers a
specific question; the head term competes with Amazon. Write problem-shaped
pages, not "best X" pages.

### Session 4 — COMPLETE, and it wrote nothing new

Run 6 September. The plan called for five or six new supermarket-led guides. The
query data said not to: the site already ranks 7-10 for those retailer terms with
existing pages, and a new page targeting the same query is the cannibalisation
that retired six pages in August. The session deepened what already ranks instead.

**`aldi-high-protein-shopping-list-uk`** - 781 to 1,017 words. Its page-filtered
export showed the real intent split: meals 537i (49%), range and products 285i
(26%), shopping list 57i (5%). It was titled for the 5% intent. Retitled to
"Aldi High Protein Meals, Foods and Shopping List UK", and given a section on
Aldi's Higher Protein Food & Drink category, written from
`supermarketProfiles.js` (sourced to aldi.co.uk, checked 2026-08-16).

**`lidl-high-protein-food-ideas-uk`** - its title was 65 characters and being cut
off, while its top query over three months is *lidl protein meals* (292i), with
*lidl high protein meals* (94), *lidl protein meal* (43), *protein meals lidl*
(39) and *high protein meals lidl* (30) behind it. Retitled to "Lidl High Protein
Meals UK: Foods, Snacks and Staples" (53 chars). Two FAQs added for queries it
ranked for and did not answer: *lidl high protein ready meals* (106i) and the
*nutrient dense meals* pair (50i). Its sections are generated from
`formula`/`foods`/`meals` arrays, so FAQ is the only free-prose field available -
adding a body section there needs a supermarket-cluster template change.

**Not done: "aldi meal planner"** (145i, position 8.9, zero clicks). It has no
page of its own, but creating one risks competing with `/meal-plans/aldi`. Needs
a page-filtered export for that hub before anything is written.

### Session 5 — the 1500-calorie cluster

Strengthen or consolidate the pages targeting the 1500-calorie demand
(Finding 5). Positions in the 40s mean the current pages are not competitive;
decide per page whether to deepen, merge, or retarget. Slowest item here and
the one most likely to need two sessions.

### Session 6 — measure and reassess

At 8 weeks after Session 1:

- **Noindex reassessment.** Plan-page clicks were 430 over 3 months, all held by
  the 400 kept pages. If that number has held, extend the pruning. If it has
  fallen materially, restore. Decide on data.
- **CTR results.** Did Tier A move? Re-run the audit and re-rank.
- **Mediavine.** Reapply once sessions are consistently above 1,000/30 days —
  projected to clear comfortably by early October.
- **CMP.** If AdSense approved, the certified CMP must be enabled in the AdSense
  dashboard before any ad serves. Account-side work, not repo work.

---

## Standing constraints

These apply to every session above.

- **The content quality bar governs all writing.** No templated sets, no
  permutation factories. That is what caused the rejection.
- **Measure before acting.** The August "do not deindex" decision was correct on
  its evidence and only changed when better evidence arrived. Same discipline.
- **CTR work does not touch body content.** Changing titles and content in the
  same window makes the result unattributable.
- **One theme per session.** Mixed sessions produce mixed measurements.

## What this plan is not

It is not a route to a large income quickly. At current traffic, ad revenue is
roughly £6–26/month depending on network. The plan is worth doing because
traffic compounds and the levers above are the ones that move it — not because
any single session pays for itself.
