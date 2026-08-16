# User-promise coverage

Last reviewed: 16 August 2026.

Behavioural coverage, not line coverage. Each row is a promise the interface
makes to a reader, and how strongly that promise is actually protected.

- **Automated** — a test in `npm run check` fails if the promise breaks.
- **Verified** — checked in production or in a browser, but not pinned by a test.
- **None** — no meaningful coverage.

## Core promises

| Promise the interface makes | Coverage | Protected by |
|---|---|---|
| "View plan" opens the plan the card describes | Automated | `plan-routing` (348 combinations), `journey`, production smoke (88 cards) |
| The card's title is the destination plan's own title | Automated | `plan-routing` |
| A goal card cannot resolve to a different goal | Automated | `plan-routing`, `journey` negative-identity tests |
| "More options" keeps the supermarket and goal | Automated | `journey-state` |
| A chosen supermarket survives navigation | Automated | `journey-state` transition tests |
| Changing a filter discards the previous one | Automated | `journey-state`; browser back/forward verified |
| Browse results all satisfy the active filter | Verified | Browser: 24/24 Aldi cards, 18/18 Tesco muscle-gain |
| A deep link rebuilds the same state | Automated | `journey-state` round-trip; browser refresh verified |
| Back and forward restore the right filter state | Verified | Browser sequence on `/browse` |
| Quiz recommendations reflect the answers given | Automated | `quiz` (17 tests, 10 profiles) |
| "Vegan" means vegan | Automated | `quiz` exhaustive, 216 recommendations |
| A quiz compromise is stated, never silent | Automated | `quiz`; production verified on two profiles |
| An exact match outranks every near match | Automated | `quiz` |
| Recommendations do not depend on data order | Automated | `plan-routing`, `quiz` (both under reversal and rotation) |
| Nutrition figures match the ingredients shown | Automated | `audit:nutrition`, 1,226 ingredient occurrences |
| A plan's diet label matches its ingredients | Automated | `audit:dietary`, exhaustive |
| Calorie labels stay inside their stated tolerance | Automated | `audit:plans`, 76,246 combinations |
| Allergens shown are derived from real ingredients | Automated | `trust`, all 230 foods classified |
| No page claims anything is allergen-free | Automated | `trust` |
| Dates shown are real, never substituted | Automated | `trust` |
| Every page can reach the privacy policy | Automated | `journey-state` footer test (added after a production journey found 90 pages without one) |
| No analytics loads before consent | Automated | `trust`; browser-verified both directions |
| AdSense stays disabled | Automated | `trust`; production verified on 7 page types |
| The calorie calculator points at a level with plans | Automated | `journey-state`, 1,920 input combinations |
| The container recommender returns a usable count | Automated | `journey-state`, 140 combinations |
| Every plan is reachable by some journey | Automated | `journey-state` orphan test |
| Internal links resolve | Automated | `audit:links`, 102,476 occurrences |
| Mobile shows the same result as desktop | Verified | 390px vs 1280px fingerprint identical across 10 cards |
| Keyboard reaches the same destinations | Verified | 20/20 CTAs real focusable links, in tab order |
| Pages do not shift as they load | Verified | CLS 0 measured on plan and blog pages |

## Promises with weaker coverage

| Promise | Coverage | Why, and what would close it |
|---|---|---|
| Shopping-list ticks persist and restore correctly | None | Local-storage behaviour is not exercised by any test. Would need a browser-driven test of tick → reload → restore. |
| Household portion scaling keeps per-person nutrition constant | Automated (data) | `audit:plans` covers 505,701 household-state checks, but the *UI* control is not tested. |
| Print and PDF output matches the on-screen plan | None | No test compares print output to the rendered plan. |
| "Email me this plan" delivers the plan shown | None | Depends on a third-party provider; not testable in the gate. |
| Saved plans reopen with the same content | None | Local-storage journey, untested. |
| The fridge-dinner builder returns usable dinners | None | Generation logic is inline in the page component and not exported. |

None of these are known to be broken; they are honestly unprotected. The first
and last are the most worth closing if this work continues.

## Final adversarial exercise

*If every page, component, recipe and route passes its own tests, how could the
site still give a user the wrong result?*

Six mechanisms were considered and checked:

1. **A page omits something the data contains.** This is what actually happened:
   navigation data listed the publisher pages and the routes existed, so every
   test passed, while seven page components rendered no footer at all — 90
   indexable pages with no route to the privacy policy. Found by following a
   real production journey, not by a unit test. Fixed, and pinned by a test that
   asserts rendering rather than configuration.
2. **Prerendered HTML differing from client-rendered.** Checked directly: the
   facts on `/plans/lidl-weight-loss-1500` are identical whether the page is
   fetched fresh or reached by clicking through — same calorie figures, price
   band, validation date, allergen and storage sections.
3. **Ties decided by data order.** Found in two places and fixed; now asserted
   under both reversal and rotation.
4. **State surviving a change of mind.** Tested across supermarket, goal,
   calorie and diet sequences, plus browser back/forward. No leakage.
5. **Invalid input half-applied.** Hostile filter values and malformed quiz
   tokens are rejected outright rather than partially accepted.
6. **A calculator pointing somewhere empty.** 1,920 calorie-calculator input
   combinations all resolve to a plan level that has plans.

The residual risk is concentrated in the local-storage features listed above,
which is where an unprotected promise would be most likely to break next.
