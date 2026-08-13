# Container buying guide baseline

Baseline owner: `/blog/best-meal-prep-containers-uk`

Captured: 13 August 2026

Pre-change observation window: 15 May to 12 August 2026

Canonical affiliate measurement starts: 13 August 2026, after the canonical-event release reaches production

## Search

The following evidence is retained without combining unlike windows:

| Evidence | Clicks | Impressions | CTR | Average position |
| --- | ---: | ---: | ---: | ---: |
| Supplied 90-day page total | 11 | 8,210 | 0.13% | 12.44 |
| Supplied 90-day query: `best meal prep containers` on this page | 8 | 7,521 | 0.11% | 9.92 |
| Latest committed 28-day query snapshot ending 7 August 2026 | 7 | 4,900 | 0.14% | 9.8 |
| Supplied size-guide context (separate page, not this page) | 21 | 1,495 | 1.40% | 6.86 |

No authenticated local Search Console connection was available for a fresh
query export. Baselines for `meal prep containers`, `meal prep containers UK`,
`meal prep boxes` and `meal prep tubs` are therefore unavailable rather
than estimated.

## First-party behaviour

These are consented first-party production events for the 90-day observation
window. They are a small sample and should be treated as directional only.

| Metric | Baseline |
| --- | ---: |
| Page views / distinct page-view sessions | 23 / 23 |
| Recorded page exits | 2 |
| Average active time on recorded exits | 54.3 seconds |
| Average elapsed time on recorded exits | 105.8 seconds |
| Average exit scroll depth | 55% |
| Sessions reaching 25% / 50% / 75% / 90% / 100% | 2 / 1 / 1 / 0 / 0 |

Exit rate is unavailable because only two explicit `page_exit` events were
recorded. It would be misleading to infer a reliable rate from that sample.
GA4 landing-page views, engaged sessions and engagement time are unavailable
locally because the repository has property-name placeholders but no local
Google service-account credentials.

## Commercial

Two observed Amazon interactions each produced:

- 2 `affiliate_click` events;
- 2 `container_product_click` events;
- 2 `affiliate_link_clicked` events.

Those are the same two interactions represented three times. They are retained
as historical diagnostics only and are not a conversion baseline.

| Metric | Baseline |
| --- | ---: |
| Canonical `affiliate_product_click` | 0 (event not live in the observation window) |
| Canonical affiliate CTR | Unavailable |
| Canonical clicks by product / placement / viewport | Unavailable before launch |
| Affiliate product impressions | Not collected |

From the canonical start date, the private analytics response reports canonical
clicks, page views, clicks per 1,000 page views, and breakdowns by product,
placement, viewport and recommendation source. Affiliate CTR remains explicitly
unavailable until a dedicated `affiliate_product_impression` event is shipped;
page views must not be mislabeled as product impressions.

## Internal journey

One recorded internal click returned to the homepage. No reliable container
count-tool, hub, size-guide or quiz click baseline exists in the small
first-party sample. Future internal-journey reporting should use the existing
destination URL and placement fields and keep those clicks separate from Amazon
conversions.

## Evaluation guardrails

- Do not compare post-change canonical clicks with the sum of old event labels.
- Review search and affiliate movement over several weekly snapshots, not one week.
- Primary outcomes: stable impressions/position, higher organic CTR, and more
  canonical Amazon clicks per 1,000 page views.
- Trust checks remain pass/fail guardrails: no unsupported testing claim, no
  stale precise price, clear disclosure, no public SEO terminology, and no
  mobile regression.
