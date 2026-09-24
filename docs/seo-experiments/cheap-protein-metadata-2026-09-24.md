# Cheap protein guide metadata experiment

Page: `/blog/best-cheap-high-protein-foods-uk`

Experiment start date: 24 September 2026

Minimum cooldown ends: 22 October 2026 (28 days)

Weekly status during cooldown: `SEO experiment active — do not rewrite`

## Why

The page's largest query is growing while its click-through falls at a stable
position. From `docs/search-console-weekly-tracker.csv` (28-day windows):

| Window ending | Query | Impressions | Clicks | CTR | Avg position |
| --- | --- | ---: | ---: | ---: | ---: |
| 2026-08-28 | cheapest protein sources | 116 | 1 | 0.86% | 8.9 |
| 2026-09-04 | cheapest protein sources | 174 | 1 | 0.57% | 7.6 |
| 2026-09-11 | cheapest protein sources | 244 | 1 | 0.41% | 7.5 |
| 2026-09-18 | cheapest protein sources | 283 | 1 | 0.35% | 7.7 |
| 2026-09-18 | cheap sources of protein | 79 | 1 | 1.27% | 7.5 |

Same page, same position, roughly three times the CTR on the "sources" phrasing,
so the gap is the snippet rather than the page. The page already contains the
answer that query wants (section "Top Cheap Protein Foods Ranked by Protein per
Penny"); the old title did not say so. Competing results for the query lead with
cost comparisons (ClearScore, NimbleFins: "Comparing the Cost of Protein Sources").

## Metadata record

Before:

- Title: `Cheap High-Protein Foods UK: 10 Best-Value Staples`
- Description: `Compare 10 cheap protein staples, from eggs and tuna to lentils and frozen chicken, with protein-per-penny guidance for UK meal prep.`

Experiment:

- Title: `Cheapest Protein Sources UK: 10 Ranked by Protein per Penny`
- Description: `The cheapest UK protein sources ranked by protein per penny, from eggs and tuna to lentils and frozen chicken, plus how to hit 150g a day for under £3.`

The H1, body, route and canonical are unchanged.

## Baseline (Search Console export, 3 months to 21 September 2026)

| Scope | Clicks | Impressions | CTR | Average position |
| --- | ---: | ---: | ---: | ---: |
| Page | 108 | 15,918 | 0.68% | 9.0 |
| Exact query `cheapest protein sources` (28 days to 18 Sep) | 1 | 283 | 0.35% | 7.7 |

## How to read it

CTR at a comparable position is the primary signal. Compare the page's CTR for
`cheapest protein sources` and for the page overall against the rows above. One
week of movement is not a result. A position change of more than about two
places confounds the CTR read and should be reported separately.
