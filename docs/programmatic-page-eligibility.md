# Programmatic-page eligibility

Last reviewed: 29 July 2026

## Publish only when all conditions pass

A generated `/plans/` route is indexable only when:

1. Its seed is explicitly present in `INDEXABLE_PLAN_SEEDS`; the feasible
   combination set alone does not create a page.
2. Every meal, ingredient, unit and nutrition reference resolves.
3. The seven-day calorie mean is within ±3% of the named target and each day is
   within ±7.5%.
4. Any exact protein target is within ±5 g or ±5%, whichever is larger, with each
   day within ±10%. High-protein labels also require at least 20% of energy from
   protein.
5. Dietary labels pass ingredient-level prohibited-food checks.
6. The page renders a full week, meaningful quantities, calculated nutrition,
   shopping list, preparation guidance and at least one relevant next step.
7. The title, description, H1, canonical and route accurately represent the seed.
8. The route is reachable internally, self-canonical, present in the correct
   sitemap and returns 200 without a redirect.
9. Its user intent is defensible even when meal composition overlaps another
   route. Store guidance, targets, quantities, preparation pattern or audience
   must create a material difference.

## Do not publish

Do not publish pages created only by permuting labels, pages with unresolved
nutrition, empty/filter states, quiz result parameters, account-like local state,
or pages whose only distinction is filler prose. Similarity reports trigger human
review; they do not authorise manufactured differentiation.

## Consolidation

Use Search Console and journey evidence alongside the exhaustive duplicate report.
Consolidate only when two routes serve the same intent and do not differ
materially in their rendered product. Preserve a useful route with a redirect
rather than producing a broken link. Do not make library-wide noindex changes
without route-level evidence.

## Enforcement

`npm run audit:plans`, `npm run audit:nutrition`, `npm run audit:dietary`,
`npm run audit:seo`, `npm run audit:metadata`, `npm run audit:links` and the live
canonical crawl enforce these rules at build and release time.
