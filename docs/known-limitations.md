# Known limitations

Last reviewed: 29 July 2026

- Nutrition is a deterministic planning estimate. Brand reformulation, natural
  variation, cooking loss, drained weight and measured portions can differ.
- Cross-contamination cannot be inferred from ingredients; the site does not make
  absolute allergen-free claims or replace medical advice.
- Weekly cost is a tier or reviewed editorial range, not a live retailer basket.
  Stock, promotions, pack sizes and regional prices change.
- Saved plans, recent plans and shopping progress are local to one browser/device,
  expire after one year and can be removed by clearing site data. There is no
  account or cross-device sync.
- Return behaviour is measured only after consent and only in coarse buckets.
  Consent denial, blocked scripts and cleared storage create unavoidable gaps.
- Search Console and GA4 source data are reviewed by the weekly automation when
  credentials are available. The repository cannot infer unobserved search demand.
- The 31 exact meal-composition clusters and 43 near-duplicate pairs remain
  eligible only where intent or rendered details differ. They need ongoing review
  with route-level search and engagement evidence.
- 648 metadata length items are review flags, not factual failures: 640 titles are
  over 70 characters and eight are below 28. Prioritise routes with impression and
  CTR evidence and respect the 28-day edit cooldown.
- Browser lab results are diagnostic. Population Core Web Vitals, especially INP,
  require sufficient field data.
- The largest lazy article-data chunk is about 120 KB gzip. It is not in the normal
  initial route graph, but further route-level splitting may help article visits.
- Email delivery depends on Resend and verified sender configuration. The UI
  exposes retryable failures, but repository tests cannot guarantee a third-party
  delivery provider's uptime.
- MealPrep+ has a waitlist and measurement funnel only. There is no billing,
  subscription entitlement or claim of active paid membership.
