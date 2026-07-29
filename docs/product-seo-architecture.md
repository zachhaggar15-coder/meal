# Product and SEO architecture

Last reviewed: 29 July 2026

## Product journey

MealPrep.org.uk is a free UK meal-planning product, not a collection of disconnected
SEO pages. The intended journey is:

1. A search visitor lands on a guide, hub or published plan that directly answers
   the query.
2. Contextual next steps move the visitor to a relevant hub, the quiz or a complete
   plan.
3. A plan exposes meals, calculated nutrition, household controls, preparation,
   a grouped shopping list, print, email, share and save actions.
4. Saved and recently viewed plans, the selected day and shopping ticks persist on
   the same device without requiring an account.
5. Consented analytics records progress through discovery, plan use and return
   behaviour. MealPrep+ remains a waitlist validation surface, not a paid product.

## Indexable surfaces

The production build currently exposes 1,377 self-canonical indexable URLs:

- 1,059 deliberately published generated plans under `/plans/`.
- Curated legacy plans under `/meal-plan/`.
- Supermarket, calorie, goal and combination hubs under `/meal-plans/`.
- Practical guides under `/blog/`.
- Tools and commercial comparison hubs with visible, useful functionality.

`/saved-plans`, quiz result state, filtered browse states, admin, error and other
utility routes are `noindex,follow`. The published plan count is 1,059. The larger
76,246 figure is the exhaustively tested feasible combination space and is never
presented as the number of published pages.

## Data and rendering

- `src/data/planSeeds.js` defines feasible and published generated-plan seeds.
- `src/utils/planBuilder.js` builds meals, calculated macros, household views,
  shopping lists, practical guidance and related plans from shared data.
- `src/data/mealPlans.js` and `src/utils/legacyPlanBuilder.js` maintain the smaller
  curated legacy library.
- `prerender.js` emits complete HTML, canonical metadata and sitemaps. Important
  content does not depend on client-side execution.
- `src/components/SEO.jsx` owns canonical, robots, Open Graph and shared
  organisation markup.
- Vercel serves the static output and serverless endpoints for analytics, email,
  waitlist, feedback and constrained AI edits.

## Local product state

`src/utils/planRetention.js` stores only plan references and interaction state:
saved routes, recent routes, current day, household controls and checked shopping
items. It validates, caps and expires records, recovers from invalid storage and
never stores email addresses or copies of nutrition data. Records stay on the
device for at most one year and are not synchronised between devices.

## Search boundaries

Every indexable route must satisfy the rules in
`docs/programmatic-page-eligibility.md` and `docs/search-quality-rules.md`.
Similarity is evidence for review, not an automatic reason to create, delete,
redirect or noindex a page. Metadata must describe visible content and all factual
calorie or supermarket claims are checked against the seed.

## Verification

The release gate builds and statically crawls all 1,405 emitted HTML files, checks
all 1,377 canonicals and 1,059 published plan claims, validates every internal link
and local asset reference, and exhaustively rebuilds all 76,246 feasible plan
combinations. Production then receives a second live crawl of every sitemap URL
plus representative mobile and desktop browser journeys.
