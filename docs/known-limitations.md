# Known limitations

Last reviewed: 3 August 2026

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
- Meal-composition similarity is reviewed automatically every week. The full
  route-level evidence for all 31 exact clusters and 43 near-duplicate pairs is
  written to `docs/composition-route-review.json`; consolidation remains a human
  decision because similarity alone does not prove duplicated search intent.
- Metadata generation is release-gated to 28–70 characters for titles and 90–160
  characters for descriptions. The previous 648 title-length review items have
  been cleared, and any recurrence now fails `npm run audit:metadata`.
- Browser lab results are diagnostic. Production now collects consented,
  route-aware LCP, INP and CLS measurements and reports p75 values in the private
  dashboard and weekly analytics report. A representative field sample still
  depends on real production visits.
- The largest lazy article-data chunk is about 120 KB gzip. It is not in the normal
  initial route graph, but further route-level splitting may help article visits.
- Email delivery depends on Resend and verified sender configuration. The UI
  exposes retryable failures, but repository tests cannot guarantee a third-party
  delivery provider's uptime.
- MealPrep+ has a waitlist and measurement funnel only. There is no billing,
  subscription entitlement or claim of active paid membership.
