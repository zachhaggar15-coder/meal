# Phase 0 Search Console Checklist

Use this after the deployment finishes. Search Console submission and indexing requests are manual unless a Search Console connector is available.

## Sitemap

- Submit `https://www.mealprep.org.uk/sitemap.xml` in Google Search Console.
- Confirm the submitted sitemap is accepted and shows discovered URLs.

## Request Indexing

Request indexing for these priority URLs:

- `https://www.mealprep.org.uk/sitemap.xml`
- `https://www.mealprep.org.uk/about`
- `https://www.mealprep.org.uk/meal-plans/free-online-diet-plans-uk`
- `https://www.mealprep.org.uk/meal-plans/1500-calorie`
- `https://www.mealprep.org.uk/blog/best-low-calorie-foods-uk`
- `https://www.mealprep.org.uk/blog/best-low-calorie-ready-meals-uk`
- `https://www.mealprep.org.uk/blog/what-does-1500-calories-look-like-uk`
- `https://www.mealprep.org.uk/blog/high-protein-snacks-uk`
- `https://www.mealprep.org.uk/blog/best-meal-prep-containers-uk`
- `https://www.mealprep.org.uk/meal-prep-containers/mid-range`

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
