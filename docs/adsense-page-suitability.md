# Ad placement suitability by page type

Last reviewed: 16 August 2026

**Ads are not enabled.** This is a planning document for if and when they are.
`src/components/AdSlot.jsx` renders nothing unless `VITE_ADS_ENABLED` is set, no
AdSense script is loaded anywhere on the site, and `index.html` contains only the
`google-adsense-account` verification meta tag, which loads nothing.

The classification below follows the Google Publisher Policies rule that ads may
not be placed on screens "without publisher-content or with low-value content,
that are under construction, that are used for alerts, navigation or other
behavioral purposes".

## Strong candidates — substantial editorial pages

| Page type | Routes | Pages | Median visible words |
|---|---|---:|---:|
| Guides and articles | `/blog/:slug` | 155 | ~1,260 |
| Container buying guides | `/meal-prep-containers/:tier` | 11 | ~2,330 |
| Questions hub | `/questions` | 1 | ~670 |

These carry written editorial content as their main purpose. Restrained
in-article placement below the first section would not compete with the content.

## Potentially suitable with restrained placement — plan pages

| Page type | Routes | Pages | Median visible words |
|---|---|---:|---:|
| Generated plans | `/plans/:slug` | 1,059 | ~4,020 |
| Legacy editorial plans | `/meal-plan/:slug` | 30 | ~2,430 |
| Plan hubs | `/meal-plans/:slug` | 55 | ~1,130 |

Substantial and useful, but the value is functional rather than editorial: a
seven-day menu, per-meal recipes, calculated nutrition, an aggregated shopping
list with tickable state, allergen and storage guidance, and PDF/print output.

Placement constraints if ads are ever enabled here:

- Nothing between a day tab and its meals, or inside the recipe disclosure.
- Nothing adjacent to the shopping-list checkboxes — they are action items, and
  ads next to action items are specifically disallowed.
- Nothing in the allergen or food-safety panels.
- At most one unit, below the shopping list.

## Ad-light or ad-free — interactive and conversion flows

| Page type | Routes | Reason |
|---|---|---|
| Quiz | `/quiz` | An input flow. Ads adjacent to the answer controls would sit next to action items. |
| Quiz results | `/quiz/results` | Already `noindex`; a decision screen. |
| Browse | `/browse`, `/browse/page/:n` | A filtering interface — behavioural, not editorial. |
| Choosers | `/choose-plan`, `/choose-supermarket`, `/choose-diet`, `/choose-calories` | 32 navigation screens, 162–429 visible words. These are routing surfaces and are explicitly the kind of screen the inventory-value policy names. |
| Tools | `/tools` | Calculators; the output is the value. |
| Accessory and container hubs | `/meal-prep-accessories`, `/meal-prep-containers` | Already carry affiliate placements. Adding ads would push paid content past publisher content. |

## Never monetise

| Route | Reason |
|---|---|
| `/admin` | Internal dashboard, `noindex`. |
| `/404` and any not-found state | Error screen. |
| `/saved-plans` when empty | Utility screen with no publisher content. |
| `/feedback` | A form. |
| Any empty filter result | No publisher content on the screen. |

`AdSlot` is currently rendered on plan pages only (`placement="plan-inline"`),
which is consistent with the table above.

## Technical work required before ads are switched on

Nothing in this list should be done now. It becomes necessary only at the point
of enabling ads.

1. **Consent before ad cookies.** The existing banner covers analytics only. Ad
   personalisation needs its own consent signal, and under UK PECR the ad script
   must not load until the user has chosen. The existing pattern in
   `src/utils/analytics.js` — nothing loads until consent is granted — is the one
   to extend, not replace.
2. **Google-certified CMP.** Google requires a certified Consent Management
   Platform for traffic from the UK and EEA. The current hand-rolled banner is
   adequate for first-party analytics but is not a certified CMP.
3. **Privacy policy update.** `/privacy` currently states plainly that the site
   shows no advertising. That section must be rewritten before any ad code ships,
   naming the advertising provider, the cookies involved and the opt-out routes,
   per Google's publisher privacy requirements.
4. **Reserved ad slot dimensions.** `AdSlot` renders `display: block` with no
   reserved height, so an ad arriving late would shift layout. Give each
   placement a fixed min-height per breakpoint before enabling.
5. **Suppress ads on the never-monetise routes** in code rather than by
   convention, so an error or empty state cannot become inventory.
6. **`ads.txt`** already exists at `/ads.txt` with the publisher ID and needs no
   change.
7. **Re-run the performance audit** after enabling. The current budget
   (198.5 KB initial JS gzip) does not include an ad script.
