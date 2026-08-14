# Accessories problem-led funnel baseline

Page: `/meal-prep-accessories`

Production measurement boundary: `2026-08-14T08:55:04.278Z`

First production deployment: `dpl_2ipgsXwsxJUh2EHDorSM5ps3kjK2`

Feature commit: `26dbed0`

All accessory activity before this deployment is historical and is not directly comparable with the problem-led funnel. Older affiliate data also contains legacy duplicate event labels. The canonical outbound conversion remains `affiliate_product_click`; no legacy conversion label should be added to it.

## Before deployment

- 20 distinct products.
- 26 product-card presentations because six starter products were repeated.
- 32 Amazon links.
- Six always-visible starter product cards before the guide directory.
- Eleven large specialist-guide cards.
- Twenty always-visible catalogue cards.
- Approximate document height at 390px: 18,488px.
- Historical first-party sample was too small and structurally different to select product winners.

## Problem-led baseline

- Eight stable user problems.
- No problem selected by default.
- Zero visible product recommendations and zero Amazon links before deliberate interaction.
- One lead recommendation and at most one useful alternative after problem selection.
- All 20 products remain available after deliberate catalogue expansion.
- The selected recommendation is excluded from the expanded catalogue, preventing duplicate simultaneous presentation.
- Approximate default document height at 390px: 4,115px.
- Approximate selected single-recommendation document height at 390px: 5,238px.
- Default desktop document height at 1440px: 2,334px.

## Measurement

Track from the production boundary:

- accessory page views;
- `accessory_problem_selected`;
- problem selection rate with selections and page-view denominator;
- `affiliate_product_impression` only for visible recommendations;
- canonical `affiliate_product_click`;
- affiliate CTR with click and impression denominator;
- clicks per 1,000 accessory-hub views;
- `accessory_guide_clicked`;
- product clicks by selected problem, placement and device.

Volume labels for human review:

- fewer than 20 product impressions: insufficient data;
- 20–49: directional only;
- 50 or more: worth reviewing;
- substantially larger samples: increasingly useful.

These labels are not statistical guarantees. Weekly reporting must not automatically reorder products, rewrite descriptions, or add/remove products.

The measurable commercial path stops at the outbound Amazon click. Do not infer Amazon conversion or revenue without actual Amazon data.
