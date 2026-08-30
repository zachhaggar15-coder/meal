# Plan page index strategy

Status: **decided — do not deindex.** Proposed 29 August 2026, resolved 30 August 2026
against a three-month Search Console performance export.

## Verdict, up front

The measurement this document asked for has been run, and it contradicts the suspicion
that prompted it. **The plan pages are the site's second-largest source of clicks and its
best-converting substantial section.** Nothing here should be deindexed.

| Section | Pages | Clicks | Impressions | CTR |
|---|---:|---:|---:|---:|
| `/blog` | 146 | 549 | 69,777 | 0.79% |
| **`/plans`** | **741** | **401** | **19,404** | **2.07%** |
| `/meal-plan` | 29 | 209 | 19,956 | 1.05% |
| `/meal-plans` | 41 | 149 | 9,752 | 1.53% |

`/plans/` earns **30% of all site clicks** from **15% of the impressions**, at nearly three
times the blog's click-through rate. The hypothesis that 77% of the sitemap was dead weight
was wrong, and acting on it without measuring would have removed the most efficient traffic
on the site.

The one caveat worth keeping: the value is concentrated and the tail is genuinely thin.
Of the 741 plan pages with impressions, **206 have at least one click and 535 have none**,
and the median plan page took **6 impressions in three months**. One page,
`/plans/aldi-high-protein-low-cal-1500`, accounts for 51 of the 401 clicks. So this is a
real long tail rather than 741 uniformly healthy pages — but a long tail that sums to a
third of the site's traffic is exactly what a long tail is supposed to look like, and
pruning it would cost more than it saved.

**Action: leave the plan pages indexed. Revisit only if CTR falls below the blog's.**

---

## Original proposal, retained for the record

Everything below was written before the data arrived. It is kept because the reasoning
about *how* to decide still applies, and because the conclusion it warned against is the
one the data rejected.

## The question

`/plans/*` is 1,059 of the 1,367 URLs in the sitemap — **77% of the indexable site**.
No `/plans/` URL has ever appeared in the weekly Search Console opportunity tracker,
while `/blog/` accounts for 34 of the 41 tracked query rows.

The question is whether that surface earns its place, and if not, what to do about it.

## What is actually established

These are measured, not inferred:

| Fact | Source |
|---|---|
| 1,059 plan pages, 77% of indexable URLs | `dist/sitemap-plans.xml` |
| ~1,423 of ~1,552 known URLs indexed (92%) | Search Console coverage export, 29 Aug |
| 57 "crawled – currently not indexed", 40 "discovered – not indexed" | same export |
| **Zero** exact-composition clusters and **zero** near-duplicate pairs at ≥0.85 | `audit-artifacts/duplicate-content-clusters.json` |
| A sample plan page carries ~3,675 words of main content | `dist/plans/aldi-anti-inflammatory-1800-high-fibre-vegetarian-v3/` |
| Every plan page is self-canonical, unique-titled, 200, indexable | `audit-artifacts/url-indexing.json`, 0 errors |

**So the plan pages are not thin, and they are not duplicates.** The site's own similarity
audit is exhaustive within diet and calorie buckets and finds nothing. Any argument for
deindexing them cannot rest on quality.

## The claim that must NOT be overstated

I previously said no plan page has "ever registered a search impression". That is wrong as
stated, and the distinction matters.

`docs/search-console-weekly-tracker.csv` applies **impression thresholds — 50 minor, 100
strong, 250 priority**. It is a filtered opportunity list, not an exhaustive export. The
correct statement is:

> No `/plans/` URL has ever cleared the 50-impression threshold required to enter the
> weekly tracker.

1,059 pages each earning 5–40 impressions a month would be entirely invisible to that
tracker while collectively representing meaningful traffic. Nothing currently in the repo
distinguishes that world from the zero-impression world, and the two call for opposite
decisions.

## Step 1 — Measure before deciding (do this first, it is cheap)

Export from Search Console, last 3 months, and answer three questions:

1. Filter **Page contains `/plans/`** → total impressions and clicks. Is the true figure
   near zero, or a long tail that sums to something real?
2. **How many distinct `/plans/` URLs** have ≥1 impression? 40 of 1,059 is a different
   problem from 900 of 1,059.
3. In **Indexing → Pages**, filter by `/plans/`. How many of the 57 "crawled – currently
   not indexed" and 40 "discovered – not indexed" are plan pages rather than blog pages?

There is also an ungenerated report the repo already expects:
`docs/composition-route-review.json`, produced by `npm run analytics:weekly`. The duplicate
audit names it as the intended route-level traffic review. Generate it.

**Do not deindex anything before these numbers exist.** Removing 77% of the index on an
inference would be irreversible for months and is not supportable on current evidence.

## Step 2 — Decide against the numbers

**If plan pages collectively earn real traffic** (say >500 impressions/month or >100 URLs
with impressions): leave them indexed. The combinatorial surface is working as a long tail
and the problem is purely that no single page is big enough to show up in a top-N tracker.
Revisit only the internal linking so the strongest ones get more equity.

**If the traffic is genuinely negligible** (<100 impressions/month across all 1,059): the
pages are being indexed and never surfaced. The recommended shape is then:

- Keep the ~91 `/meal-plans/` hub pages and the highest-demand plan variants indexed —
  these already attract queries ("1500 calorie meal plan", "aldi high protein meal plan").
- `noindex, follow` the combinatorial tail. They stay fully reachable through the quiz,
  `/browse` and internal links, so **no user loses anything** — this is an indexing
  decision, not a deletion.
- Remove the noindexed URLs from `sitemap-plans.xml`, keeping the sitemap a statement of
  what the site wants ranked.
- Reassess after 8 weeks.

**If the middle case** (some demand, concentrated): index the subset with demand plus a
margin, noindex the rest. Same mechanism, different cut line.

## Why this is worth doing at all

The upside is not direct traffic — it is crawl allocation and site-level quality signals.
A large index footprint of pages that are indexed but never surfaced gives Google a lot of
low-value material to attribute to the domain. The container cluster showed the same
pattern in miniature: 20 built pages, one earning impressions, and six actively competing
with stronger pages until they were retired on 29 August.

The honest counterweight is that this is contested SEO ground, the pages are genuinely
good, and 92% indexation is not the signature of a site Google distrusts. That is why this
document recommends measurement first and a reversible mechanism second.

## Explicitly out of scope

The repo already has a stance worth respecting, from
`audit-artifacts/duplicate-content-clusters.json`:

> "Similarity is evidence for weekly route-level traffic review, not an automatic noindex
> decision. No filler text is generated to change scores."

Nothing here proposes generating filler to differentiate pages, and nothing proposes an
automatic rule. The decision stays human and evidence-led.

## Verification, if a noindex change is made

- `npm run build` — `check-google-indexing` reconciles canonicals, sitemap and robots
  directives, and fails on disagreement.
- `npm run audit:seo` — confirms sitemap and canonical agreement across all URLs.
- `npm run audit:links` — confirms no internal link points at a now-noindexed page in a way
  that breaks the journey.
- Confirm the quiz and `/browse` still reach every plan.
- Record the change and its date so the 8-week reassessment has a clean baseline.
