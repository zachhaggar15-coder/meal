# Redirect coverage review — 8 September 2026

Source: mealprep.org.uk-Coverage-Drilldown-2026-09-08 (1).zip. Issue: Page with redirect. 15 URLs.

## Findings

All 15 source URLs return permanent HTTP 308 redirects and reach an HTTP 200 destination. Fourteen use one redirect. The HTTP non-www homepage uses two redirects (HTTPS upgrade, then www); both work, so no hosting configuration change is needed. No loops or broken destinations were found.

All destinations are self-canonical. Fourteen report entries lead to indexable destinations in the live sitemap. The remaining entry leads to the deliberately noindexed any-gym-beginner-1800-quick-shop-vegetarian-v3 plan, which is correctly absent from the sitemap under the existing plan indexing policy. No source URL from the report occurs in the live sitemap.

Google documents Page with redirect as a non-canonical URL that will not itself be indexed. Preserve intentional redirects; evaluate the destination's index status separately. Source: https://support.google.com/webmasters/answer/7440203?hl=en#redirect

## Fix

The generated /choose-calories/2000 page contained one internal link to /browse?goal=budget-bodybuilding&calories=2000, which redirects to /meal-plans/budget-bodybuilding. The chooser URL builder now links directly to that hub for the exact combination. Additional supermarket, diet, budget, effort or search filters still produce browse URLs so their selections are retained. Other calorie targets also retain their browse URLs.

Targeted tests cover agreement with the live redirect rule, additional-filter preservation, other calorie targets and the previous coverage fixes. All three tests and targeted lint checks passed. No redirect configuration or indexing policy was changed. Changes are local and not deployed.

## Live URL results

Rendered verification: a fresh server-rendering build passed, and rendering /choose-calories/2000 confirmed that the direct hub link is present and the reported redirect link is absent.

| Source | Final destination | Redirects | Destination |
| --- | --- | --- | --- |
| https://www.mealprep.org.uk/plans/uk-cheap-high-protein-1800-very-cheap-batch | https://www.mealprep.org.uk/plans/any-cheap-hp-1800 | 1 | 200; indexable, in sitemap |
| https://www.mealprep.org.uk/blog/best-freezer-bags-for-meal-prep-uk | https://www.mealprep.org.uk/meal-prep-containers/freezer-bags | 1 | 200; indexable, in sitemap |
| https://mealprep.org.uk/ | https://www.mealprep.org.uk/ | 1 | 200; indexable, in sitemap |
| https://www.mealprep.org.uk/?from=vegetarian-low-calorie-meal-plan&kcal=1500 | https://www.mealprep.org.uk/ | 1 | 200; indexable, in sitemap |
| https://www.mealprep.org.uk/?from=vegetarian-low-calorie-meal-plan | https://www.mealprep.org.uk/ | 1 | 200; indexable, in sitemap |
| https://www.mealprep.org.uk/blog/meal-prep-containers-uk | https://www.mealprep.org.uk/blog/best-meal-prep-containers-uk | 1 | 200; indexable, in sitemap |
| https://www.mealprep.org.uk/plans/waitrose-weight-loss-1500-flexible-standard | https://www.mealprep.org.uk/plans/waitrose-weight-loss-1500-moderate-standard | 1 | 200; indexable, in sitemap |
| https://www.mealprep.org.uk/plans/any-gym-beginner-1800-balanced-plate-vegetarian-v3 | https://www.mealprep.org.uk/plans/any-gym-beginner-1800-quick-shop-vegetarian-v3 | 1 | 200; deliberate noindex |
| https://www.mealprep.org.uk/plans/marks-spencer-weight-loss-1400-flexible-standard | https://www.mealprep.org.uk/plans/marks-spencer-weight-loss-1400-moderate-batch | 1 | 200; indexable, in sitemap |
| https://www.mealprep.org.uk/browse?goal=budget-bodybuilding&calories=2000 | https://www.mealprep.org.uk/meal-plans/budget-bodybuilding | 1 | 200; indexable, in sitemap |
| https://www.mealprep.org.uk/plans/waitrose-weight-loss-1400-flexible-batch | https://www.mealprep.org.uk/plans/waitrose-weight-loss-1400-moderate-low | 1 | 200; indexable, in sitemap |
| https://www.mealprep.org.uk/plans/coop-weight-loss-1400-flexible-standard | https://www.mealprep.org.uk/plans/coop-weight-loss-1500-budget-low | 1 | 200; indexable, in sitemap |
| https://www.mealprep.org.uk/plans/aldi-budget-bodybuilding-3500-batch-friendly-v3 | https://www.mealprep.org.uk/plans/aldi-budget-bodybuilding-3500 | 1 | 200; indexable, in sitemap |
| https://www.mealprep.org.uk/plans/iceland-muscle-gain-3500-wholegrain-v3 | https://www.mealprep.org.uk/plans/iceland-muscle-gain-3500 | 1 | 200; indexable, in sitemap |
| http://mealprep.org.uk/ | https://www.mealprep.org.uk/ | 2 | 200; indexable, in sitemap |
