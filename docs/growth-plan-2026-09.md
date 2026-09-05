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

### Finding 1 — CTR is the largest available lever

Modelled against an approximate organic CTR-by-position benchmark, the gap
between what pages earn and what their positions should earn is **~1,110 clicks
per 3 months (~370/month)** against a current total of 1,685. Split:

| Tier | Pages | Gap (3mo) | Fix |
|---|---:|---:|---|
| **A** — position ≤10, CTR below benchmark | 101 | **727** | Title and snippet |
| **B** — position 11–20, high impressions | 29 | **357** | Ranking + snippet |

Tier A is the priority: these already rank on page one and are simply not being
chosen. That is a writing problem, not an authority problem, and it is the
cheapest work on this list.

Top Tier A opportunities:

| Gap | Impressions | CTR | Pos | Page |
|---:|---:|---:|---:|---|
| +129 | 4,377 | 1.55% | 5.9 | `/blog/meal-prep-container-size-guide` |
| +116 | 8,178 | 0.78% | 9.3 | `/plans/aldi-high-protein-low-cal-1500` |
| +63 | 4,074 | 1.96% | 7.0 | `/blog/lidl-high-protein-food-ideas-uk` |
| +50 | 2,542 | 0.24% | 9.6 | `/plans/aldi-veg-low-cal-1500` |
| +49 | 4,209 | 1.05% | 9.1 | `/meal-plan/tesco-low-calorie-meal-plan` |
| +43 | 3,375 | 1.72% | 7.0 | `/blog/aldi-high-protein-shopping-list-uk` |
| +39 | 1,863 | 0.91% | 7.8 | `/blog/cheapest-uk-supermarket-meal-prep` |
| +38 | 1,617 | 0.68% | 7.9 | `/blog/sainsburys-healthy-ready-meal-combos-uk` |

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

### Finding 4 — `/browse` ranks for things it does not answer

**6,748 impressions, 4 clicks, 0.06% CTR.** Either the listing is surfacing for
informational queries it cannot satisfy, or its title promises something the
page does not deliver. Needs diagnosis before a fix is chosen.

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

### Session 2 — Tier A CTR (the highest-return session on this list)

Rewrite titles and meta descriptions for the ~20 largest Tier A gaps. Rules,
derived from Finding 2:

- Put the retailer or the number first where one applies — *Lidl*, *Aldi*,
  *1,500 calories* — because that is what the searcher typed.
- Say what the page gives, not what it is about. "Free PDF + shopping list"
  outperforms "a guide to".
- Meta descriptions are ad copy for a link, not summaries. Lead with the
  specific thing nobody else on the page-one SERP is offering.
- Do not touch H1s or body content. This session changes what the SERP shows,
  nothing else, so the measurement stays clean.

*Outcome: measurable in 3–4 weeks. Modelled ceiling ~240 clicks/month; treat
half of that as a good result.*

### Session 3 — `/browse` and the container cluster

1. Diagnose `/browse`: pull its queries from Search Console, decide whether it
   is a title problem, an intent mismatch, or a page that should not rank for
   what it ranks for. Fix accordingly.
2. Decide the container cluster. `best-meal-prep-containers-uk` takes 9,484
   impressions for 18 clicks at position 13.3 and the head query is unwinnable
   (Finding 3). Options: accept it as an impression farm, retarget it at a
   longer-tail commercial query, or fold its authority into the guide routes.

*Outcome: one clear decision on ~16,000 wasted impressions.*

### Session 4 — new guides, supermarket-intent led

Write 5–6 guides that lead with named-retailer intent, since that is what
converts. Candidate shapes, to be confirmed against the query export at the
time rather than assumed now:

- retailer × specific need where a plan page is the answer
- the "what to buy at X for Y" shape that already converts at 5–15%
- anything the query export shows demand for that the site cannot currently
  answer

**Constraint: no permutation sets.** Each guide must have a premise the others
do not. If two candidates cannot justify different content, write one.

*Outcome: corpus ~150, all at the quality bar.*

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
