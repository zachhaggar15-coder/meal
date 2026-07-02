# Phase 0 Search Console Checklist

Use this after the deployment finishes. Search Console submission and indexing requests are manual unless a Search Console connector is available.

## Sitemap

- Submit `https://www.mealprep.org.uk/sitemap.xml` in Google Search Console.
- Confirm the submitted sitemap is accepted and shows discovered URLs.

## Request Indexing

Request indexing for these priority URLs:

- `https://www.mealprep.org.uk/sitemap.xml`
- `https://www.mealprep.org.uk/about`
- `https://www.mealprep.org.uk/browse`
- `https://www.mealprep.org.uk/meal-plans/free-online-diet-plans-uk`
- `https://www.mealprep.org.uk/meal-plans/1500-calorie`
- `https://www.mealprep.org.uk/meal-plans/weight-loss`
- `https://www.mealprep.org.uk/meal-plans/high-protein`
- `https://www.mealprep.org.uk/meal-plans/high-protein-shopping-list`
- `https://www.mealprep.org.uk/blog/best-low-calorie-foods-uk`
- `https://www.mealprep.org.uk/blog/best-low-calorie-ready-meals-uk`
- `https://www.mealprep.org.uk/blog/what-does-1500-calories-look-like-uk`
- `https://www.mealprep.org.uk/blog/high-protein-snacks-uk`
- `https://www.mealprep.org.uk/blog/best-cheap-high-protein-foods-uk`
- `https://www.mealprep.org.uk/blog/best-meal-prep-containers-uk`
- `https://www.mealprep.org.uk/blog/meal-prep-containers-uk`
- `https://www.mealprep.org.uk/meal-prep-containers`
- `https://www.mealprep.org.uk/meal-prep-containers/mid-range`

## Discovered Not Indexed Samples

After deployment, inspect these exact examples from the Search Console export. They now have explicit links from `/browse`, sitemap priority, and related hub links:

- `https://www.mealprep.org.uk/blog/sainsburys-meal-prep-uk`
- `https://www.mealprep.org.uk/meal-plan/asda-1500-calorie-meal-plan`
- `https://www.mealprep.org.uk/plans/aldi-anti-inflammatory-veg-1800-mediterranean`
- `https://www.mealprep.org.uk/plans/aldi-budget-bodybuilding-2000-lean-bulk`
- `https://www.mealprep.org.uk/plans/aldi-budget-fat-loss-1500-v2-high-fibre`
- `https://www.mealprep.org.uk/plans/aldi-busy-professional-1800`
- `https://www.mealprep.org.uk/plans/aldi-busy-professional-1800-v2-high-variety`
- `https://www.mealprep.org.uk/plans/aldi-cheap-student-batch-2000-one-pan`
- `https://www.mealprep.org.uk/plans/aldi-endurance-veg-2000-training-day`
- `https://www.mealprep.org.uk/plans/aldi-menopause-pesc-1800-batch-cook`

## Live Checks

For each URL above:

- Page returns `200`.
- Page has a visible `h1`.
- Page has a unique title and meta description.
- Canonical points to the clean self URL.
- Page does not include `noindex`.
- JSON-LD only describes visible page content.

## Weekly Tracker

Update `docs/search-console-weekly-tracker.csv` each week with the latest query/page export. Prioritise query/page pairs with high impressions and average position 8-40.
