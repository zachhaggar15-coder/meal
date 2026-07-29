# Structured-data rules

Last reviewed: 29 July 2026

Structured data exists to describe visible content, not to manufacture a search
feature.

## Global entities

`src/constants/site.js` supplies one consistent Organization entity. The SEO
component emits it with page-specific markup and canonical URLs. Page markup must
use the same title, description, image and organisation identity visible to users.

## Recipe

Recipe markup is eligible only when the page visibly supplies a qualifying recipe,
yield/serving context, quantified ingredients, practical instructions and
calculated nutrition. A seven-day meal plan is not one Recipe. The current release
contains seven qualifying Recipe entities.

Nutrition values in schema must come from the same canonical calculated object
used on screen, in print and in email. Do not add values the site does not store,
such as precise sugar, salt or saturated fat.

## Product

Product markup may describe a visibly recommended third-party item. It must not
claim first-party stock, current offer price, availability, rating, review,
personal testing or ownership unless the repository has current evidence. The
current release contains 59 Product entities across ten eligible pages.

## Collection and breadcrumbs

CollectionPage, ItemList and BreadcrumbList markup must mirror visible navigation
and canonical links. Item lists may describe the visible subset; they must not
claim hidden inventory.

## Validation

`npm run check:structured-data` and `npm run audit:schema` parse every emitted
JSON-LD block, reconcile eligible recipe/product entities with visible content
and fail misleading or invalid data. `npm run audit:seo` additionally fails
unparseable markup anywhere in the 1,405-file build.
