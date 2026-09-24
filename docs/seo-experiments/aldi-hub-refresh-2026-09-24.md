# Aldi hub refresh

Page: `/meal-plans/aldi`

Change date: 24 September 2026

Minimum cooldown ends: 22 October 2026 (28 days)

Weekly status during cooldown: `SEO experiment active — do not rewrite`

## Why

Owner-supplied Search Console export, 3 months to 21 September 2026:

| Hub | Clicks | Impressions | CTR | Avg position |
| --- | ---: | ---: | ---: | ---: |
| `/meal-plans/aldi` | 2 | 33 | 6.06% | 5.4 |
| `/meal-plans/lidl` | 165 | 3,544 | 4.66% | 7.9 |
| other supermarket hubs | 0–7 each | 31–253 each | | 5.0–8.8 |

Lidl is the outlier, not Aldi. The likely reason is the results page: Aldi runs
an official meal planner (aldi.co.uk/recipes/meal-planner) that takes the
"aldi meal planner" results, while Lidl has none and this site's Lidl hub
appears for "lidl meal planner". "aldi meal planner" (166 impressions, 0 clicks,
position 9.3) is therefore not the target.

The target is the Aldi version of what the Lidl hub wins:

| Lidl query | CTR | Aldi query (3 months, site-wide) |
| --- | ---: | --- |
| lidl meal plan | 14.3% | 7 day aldi meal plan: 14 impr, 14.3% |
| lidl budget meal plan | 17.5% | budget meal planner aldi: 68 impr, 0 clicks, pos 7.4 |
| lidl shopping list | 8.5% | aldi shopping list uk: 19 impr, 0 clicks, pos 7.7 |
| lidl meal prep | 6.7% | aldi meal prep: 45 impr, 0 clicks, pos 6.6 |

Competing Aldi meal-plan results lead with "7-day", "free shopping list" and a
weekly cost. 203 of the 205 Aldi plan pages state £20–40 a week, so the cost
claim is true of the set the hub lists.

## What changed

- Title: `Aldi Meal Plans UK - Free Weekly Plans + Shopping Lists` → `Aldi Meal Plans UK: Free 7-Day Plans + Shopping Lists`
- Description: now leads with 7-day plans and the £20–40 weekly cost.
- Moved from a hand-written entry onto `createSupermarketHub`, the builder
  every other supermarket hub uses. The Aldi-specific writing is kept; the page
  gains the reviewed date, sources, "Choosing your Aldi plan by goal" table and
  supporting guides the other hubs already had.
- Related hubs: `tesco-weight-loss` (another supermarket) replaced by the three
  Aldi hubs the page did not link to at all: `aldi-weight-loss`,
  `aldi-budget-fat-loss`, `aldi-cheap-student`.
- Intro rewritten to state the verified facts: seven-day plans, shopping list
  per plan, £20–40 a week.

## Expected size

Small. The winnable Aldi queries total roughly 200 impressions in three months,
so even Lidl-level CTR is on the order of 10–20 extra clicks per quarter. It is
worth doing because the hub already carries the Aldi 6-week PDF promo.

## How to read it

Primary signal: hub impressions and clicks against the 33 / 2 baseline, and
whether the hub starts appearing for the Aldi queries above. Several changes
landed together, so the result reads as "the refresh", not as the title alone.
