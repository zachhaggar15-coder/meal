# Ad placement suitability by page type

Last reviewed: 30 August 2026

**Ads are not enabled.** `src/components/AdSlot.jsx` renders nothing unless
`VITE_ADS_ENABLED` is set, no AdSense script is loaded anywhere on the site, and
`index.html` contains only the `google-adsense-account` verification meta tag,
which loads nothing.

The classification below follows the Google Publisher Policies rule that ads may
not be placed on screens "without publisher-content or with low-value content,
that are under construction, that are used for alerts, navigation or other
behavioral purposes".

## Strong candidates — substantial editorial pages

| Page type | Routes | Pages | Median visible words |
|---|---|---:|---:|
| Guides and articles | `/blog/:slug` | 154 | ~1,394 |
| Container buying guides | `/meal-prep-containers/:tier` | 11 | ~2,527 |
| Questions hub | `/questions` | 1 | ~670 |

These carry written editorial content as their main purpose. Restrained
in-article placement below the first section would not compete with the content.

## Potentially suitable with restrained placement — plan pages

| Page type | Routes | Pages | Median visible words |
|---|---|---:|---:|
| Generated plans | `/plans/:slug` | 1,055 | ~3,813 |
| Legacy editorial plans | `/meal-plan/:slug` | 30 | ~2,261 |
| Plan hubs | `/meal-plans/:slug` | 55 | ~1,186 |

Substantial and useful, but the value is functional rather than editorial: a
seven-day menu, per-meal recipes, calculated nutrition, an aggregated shopping
list with tickable state, allergen and storage guidance, and PDF/print output.

Placement constraints if ads are ever enabled here:

- Nothing between a day tab and its meals, or inside the recipe disclosure.
- Nothing adjacent to the shopping-list checkboxes — they are action items, and
  ads next to action items are specifically disallowed.
- Nothing in the allergen or food-safety panels.
- At most one unit, below the shopping list and clear of the feedback form.

## Ad-light or ad-free — interactive and conversion flows

| Page type | Routes | Reason |
|---|---|---|
| Quiz | `/quiz` | An input flow. Ads adjacent to the answer controls would sit next to action items. |
| Quiz results | `/quiz/results` | Already `noindex`; a decision screen. |
| Browse | `/browse`, `/browse/page/:n` | A filtering interface — behavioural, not editorial. |
| Choosers | `/choose-plan`, `/choose-supermarket`, `/choose-diet`, `/choose-calories` | 32 navigation screens, 306–570 visible words. Routing surfaces, and now `noindex,follow` for the same reason. |
| MealPrep+ | `/mealprep-plus` | A waitlist for a service that does not exist yet — an under-construction screen. Now `noindex,follow`. |
| Tools | `/tools` | Calculators; the output is the value. |
| Container buying guide | `/blog/best-meal-prep-containers-uk` | Roughly a quarter of its main content is product blocks. Excluded in code from the in-article unit. |
| Accessory and container hubs | `/meal-prep-accessories`, `/meal-prep-containers` | Already carry affiliate placements. Adding ads would push paid content past publisher content. |

## Never monetise

| Route | Reason |
|---|---|
| `/admin` | Internal dashboard, `noindex`. |
| `/404` and any not-found state | Error screen. |
| `/saved-plans` when empty | Utility screen with no publisher content. |
| `/feedback` | A form. |
| Any empty filter result | No publisher content on the screen. |

These are enforced in code, not by convention: `isMonetisableRoute` in
`src/components/AdSlot.jsx` holds the exclusion list, and `AdSlot` returns null
on any route it names. A slot placed on one of these routes by mistake renders
nothing.

`AdSlot` is currently rendered in two places: one in-article unit on
`/blog/:slug` (mid-article, between two content sections, and skipped on the
container buying guide) and one on `/plans/:slug` below the plan content.

## Technical work required before ads are switched on

Items 1-5 and 7 are done. What remains is the account-side work and a
re-measurement, neither of which can be done from the repository.

1. ~~**Consent before ad cookies.**~~ Done. `src/utils/adConsent.js` holds a
   separate advertising consent signal — analytics consent does not imply it,
   because they are different purposes under UK PECR. `AdSlot` loads nothing
   until it is granted, and Do Not Track forces it to denied.
2. **Google-certified CMP.** Still outstanding, and the reason ads must stay
   off. Google requires a certified Consent Management Platform for traffic from
   the UK and EEA. The consent gate above satisfies PECR but is not a TCF
   string, so it does not by itself let Google serve personalised ads here.
   Google's own consent management solution is configured in the AdSense
   dashboard under **Privacy & messaging**, not in this repository — turn it on
   there before setting `VITE_ADS_ENABLED`.
3. ~~**Privacy policy update.**~~ Done. `/privacy` now names Google AdSense,
   describes the cookies, states that the advertising choice is asked separately
   from analytics, and links My Ad Center for opting out of personalisation.
4. ~~**Reserved ad slot dimensions.**~~ Done. `.ad-slot` in `App.css` reserves
   280px (250px from 768px up) so a late-arriving unit cannot shift the article.
5. ~~**Suppress ads on the never-monetise routes in code.**~~ Done — see
   `isMonetisableRoute` above.
6. **`ads.txt`** already exists at `/ads.txt` with the publisher ID and needs no
   change.
7. ~~**Reduce promotional density on container articles first.**~~ Addressed
   from the other direction: the buying guide is excluded from ads in code, and
   `/glass-meal-prep-containers` — 469 words at ~96% promotional — was retired
   into `/meal-prep-containers/glass` rather than padded out.
8. **Re-run the performance audit** after enabling. The current budget
   (198.5 KB initial JS gzip) does not include an ad script.
