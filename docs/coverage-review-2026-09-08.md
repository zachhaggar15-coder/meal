# Coverage review — 8 September 2026

Source: mealprep.org.uk-Coverage-Drilldown-2026-09-08.zip. Issue: Crawled - currently not indexed. 80 URLs; report chart ends 4 September. All listed crawl dates predate the 5 September indexing policy.

## Verified live before changes

- 37 URLs return HTTP 200 with indexable robots metadata and self-canonicals.
- 35 URLs return HTTP 200 with deliberate noindex,follow metadata under the existing plan allowlist.
- 8 URLs return permanent HTTP 308 redirects already configured in vercel.json.
- No reported URL returns a 404 or server error.

The export describes Google's historical index state, not a current technical failure on every URL. Do not remove the deliberate noindex policy or request indexing for retired URLs simply to clear this report.

## Changes

Sixteen indexable plans had incoming links only from browse pagination in the prerendered site. Surface these as relevant alternatives on 10 existing topic/supermarket hubs, using each hub's matching plans and retaining its leading recommendation, 12-card limit and matching structured data. Link the orphaned high-protein vegetarian guide from the vegetarian low-calorie guide's related plans. All other indexable report URLs already have contextual incoming links.

## After deployment

Validation: the complete production build passed with 1,569 routes rendered and zero failures, including canonical/sitemap checks and a guard for all 17 contextual links. All 10 SEO tests and targeted lint checks passed. Changes are local; deployment and Search Console recrawl requests have not been performed.

Inspect the changed destinations in Search Console and request indexing for the important indexable pages. The sitemap remains https://www.mealprep.org.uk/sitemap.xml. Existing noindex and redirect entries may remain in historical reports until Google recrawls them. Crawling can take days to weeks; neither these fixes nor an indexing request guarantees inclusion. See https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl.

## URL-level live findings

| Path | Last crawled in export | Live result |
| --- | --- | --- |
| /blog/how-many-calories-to-lose-weight | 2026-05-23 | 200; indexable, self-canonical |
| /blog/how-much-protein-when-dieting | 2026-05-21 | 200; indexable, self-canonical |
| /blog/how-to-build-a-calorie-deficit | 2026-08-26 | 200; indexable, self-canonical |
| /meal-plan/aldi-high-protein-meal-plan | 2026-05-21 | 308 → /plans/aldi-high-protein-low-cal-1500 |
| /meal-plan/asda-1800-calorie-meal-plan | 2026-05-24 | 200; indexable, self-canonical |
| /meal-plan/gym-beginner-meal-plan-uk | 2026-05-21 | 308 → /plans/any-gym-beginner-1800 |
| /meal-plan/high-protein-vegetarian-meal-plan-uk | 2026-05-21 | 200; indexable, self-canonical |
| /meal-plan/morrisons-low-calorie-meal-plan | 2026-05-19 | 308 → /plans/morrisons-weight-loss-1500 |
| /meal-plan/muscle-gain-meal-plan-uk | 2026-05-27 | 200; indexable, self-canonical |
| /meal-plan/sainsburys-1800-calorie-meal-plan | 2026-05-20 | 200; indexable, self-canonical |
| /meal-plan/sainsburys-low-calorie-meal-plan | 2026-05-18 | 308 → /plans/sainsburys-weight-loss-1500 |
| /meal-plan/tesco-1800-calorie-meal-plan | 2026-05-28 | 200; indexable, self-canonical |
| /meal-plan/vegetarian-low-calorie-meal-plan | 2026-05-21 | 200; indexable, self-canonical |
| /meal-plans/low-effort | 2026-06-23 | 308 → /browse |
| /plans/aldi-cheap-hp-2000-best-value | 2026-06-19 | 200; indexable, self-canonical |
| /plans/aldi-cheap-hp-2000-desk-lunch-v3 | 2026-06-18 | 308 → /plans/aldi-cheap-hp-2000 |
| /plans/aldi-cutting-1600-high-protein | 2026-06-05 | 308 → /plans/aldi-cutting-1600 |
| /plans/aldi-endurance-2000 | 2026-06-01 | 200; deliberate noindex |
| /plans/aldi-high-protein-low-cal-1500-v2-higher-protein-vegan-v3 | 2026-06-22 | 200; deliberate noindex |
| /plans/aldi-hp-veg-1800-wholegrain-v3 | 2026-06-25 | 200; indexable, self-canonical |
| /plans/aldi-low-effort-1500 | 2026-06-01 | 200; deliberate noindex |
| /plans/aldi-low-effort-veg-1800-batch-light | 2026-06-20 | 200; indexable, self-canonical |
| /plans/aldi-menopause-1800 | 2026-06-01 | 200; deliberate noindex |
| /plans/aldi-muscle-gain-3000 | 2026-06-21 | 200; deliberate noindex |
| /plans/aldi-veg-low-cal-1500-batch-friendly-v3 | 2026-08-23 | 200; indexable, self-canonical |
| /plans/aldi-weight-loss-1800-vegan | 2026-08-23 | 200; deliberate noindex |
| /plans/any-budget-bodybuilding-2000 | 2026-08-18 | 200; indexable, self-canonical |
| /plans/any-cheap-student-veg-1800-high-protein | 2026-06-05 | 200; deliberate noindex |
| /plans/any-cutting-1600-batch-cook | 2026-08-16 | 200; indexable, self-canonical |
| /plans/any-pescatarian-1500-batch-friendly-v3 | 2026-07-31 | 200; indexable, self-canonical |
| /plans/any-veg-low-cal-1500-whole-food | 2026-08-20 | 200; indexable, self-canonical |
| /plans/asda-budget-bodybuilding-2000-training-day | 2026-08-06 | 200; deliberate noindex |
| /plans/asda-budget-fat-loss-1800-freezer-friendly | 2026-06-05 | 200; indexable, self-canonical |
| /plans/asda-cheap-student-1800 | 2026-06-01 | 200; deliberate noindex |
| /plans/asda-cheap-student-veg-1800 | 2026-06-01 | 200; deliberate noindex |
| /plans/asda-high-protein-low-cal-1500 | 2026-06-01 | 200; deliberate noindex |
| /plans/asda-high-protein-low-cal-1800 | 2026-06-01 | 200; deliberate noindex |
| /plans/asda-muscle-gain-3000-batch-friendly-pescatarian-v3 | 2026-06-18 | 200; indexable, self-canonical |
| /plans/asda-weight-loss-1500-quick-prep | 2026-08-18 | 200; indexable, self-canonical |
| /plans/coop-weight-loss-1500-moderate-batch | 2026-07-03 | 200; indexable, self-canonical |
| /plans/iceland-budget-bodybuilding-3000 | 2026-06-28 | 200; deliberate noindex |
| /plans/iceland-cheap-student-1500-low-fuss-vegetarian-v3 | 2026-06-21 | 200; deliberate noindex |
| /plans/iceland-weight-loss-1500 | 2026-08-23 | 200; indexable, self-canonical |
| /plans/lidl-budget-bodybuilding-2500 | 2026-06-01 | 200; deliberate noindex |
| /plans/lidl-budget-fat-loss-1800 | 2026-06-01 | 200; deliberate noindex |
| /plans/lidl-budget-fat-loss-1800-v2 | 2026-07-03 | 200; deliberate noindex |
| /plans/lidl-cheap-hp-1500-batch-cook | 2026-06-18 | 200; deliberate noindex |
| /plans/lidl-cheap-hp-1800-budget-smart-v3 | 2026-06-18 | 200; indexable, self-canonical |
| /plans/lidl-cheap-student-1800-no-fuss | 2026-08-06 | 200; deliberate noindex |
| /plans/lidl-cheap-student-2000 | 2026-06-01 | 200; deliberate noindex |
| /plans/lidl-endurance-2000-wholegrain-vegetarian-v3 | 2026-06-21 | 200; deliberate noindex |
| /plans/lidl-high-protein-low-cal-1500 | 2026-06-01 | 200; indexable, self-canonical |
| /plans/lidl-hp-veg-1500-high-variety | 2026-06-05 | 200; indexable, self-canonical |
| /plans/lidl-maintenance-2000 | 2026-06-01 | 200; indexable, self-canonical |
| /plans/lidl-muscle-gain-2500 | 2026-06-01 | 200; deliberate noindex |
| /plans/lidl-veg-low-cal-1800-quick-prep | 2026-06-24 | 200; deliberate noindex |
| /plans/lidl-veg-low-cal-1800-wholegrain-v3 | 2026-06-18 | 200; indexable, self-canonical |
| /plans/lidl-vegan-low-cal-1500-protein-focused | 2026-08-16 | 200; indexable, self-canonical |
| /plans/morrisons-anti-inflammatory-1800-omega-three | 2026-08-24 | 200; deliberate noindex |
| /plans/morrisons-body-recomp-2000-high-variety | 2026-06-18 | 200; deliberate noindex |
| /plans/morrisons-vegan-low-cal-1800-five-a-day-v3 | 2026-06-21 | 200; deliberate noindex |
| /plans/sainsburys-anti-inflammatory-pesc-1800-wholegrain-v3 | 2026-06-21 | 200; deliberate noindex |
| /plans/sainsburys-cutting-1600-quick-prep | 2026-06-27 | 200; deliberate noindex |
| /plans/sainsburys-endurance-3000-higher-carb | 2026-08-19 | 200; indexable, self-canonical |
| /plans/sainsburys-high-protein-low-cal-1800-higher-protein-vegan-v3 | 2026-06-18 | 200; indexable, self-canonical |
| /plans/sainsburys-weight-loss-1500 | 2026-06-01 | 200; indexable, self-canonical |
| /plans/sainsburys-weight-loss-1800-five-a-day-v4 | 2026-06-21 | 200; indexable, self-canonical |
| /plans/sainsburys-weight-loss-1800-meal-prep | 2026-06-24 | 200; deliberate noindex |
| /plans/sainsburys-weight-loss-veg-1500-high-fibre-v4 | 2026-06-18 | 200; indexable, self-canonical |
| /plans/tesco-body-recomp-pesc-2000-batch-cook | 2026-06-18 | 200; indexable, self-canonical |
| /plans/tesco-cheap-student-1500 | 2026-06-01 | 200; deliberate noindex |
| /plans/tesco-cheap-student-1800-high-protein | 2026-06-18 | 200; deliberate noindex |
| /plans/tesco-cutting-1400-desk-lunch-v3 | 2026-06-21 | 200; deliberate noindex |
| /plans/tesco-endurance-pesc-2000 | 2026-06-01 | 200; deliberate noindex |
| /plans/tesco-muscle-gain-2500-batch-friendly-v3 | 2026-06-18 | 200; indexable, self-canonical |
| /plans/tesco-pescatarian-1800-higher-protein-v3 | 2026-06-18 | 200; indexable, self-canonical |
| /plans/tesco-weight-loss-1500 | 2026-08-23 | 200; indexable, self-canonical |
| /plans/tesco-weight-loss-1800 | 2026-08-22 | 200; deliberate noindex |
| /plans/tesco-weight-loss-1800-veg-balanced-plate-v4 | 2026-06-21 | 200; deliberate noindex |
| /plans/waitrose-weight-loss-1500-moderate-standard | 2026-08-18 | 200; indexable, self-canonical |
