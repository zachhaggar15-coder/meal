# Nutrition integrity audit

Audit date: 29 July 2026

## Outcome

The nutrition system now has one deterministic ingredient-to-output calculation path. All 169 shared meals and all 112 legacy meal occurrences were recalculated from quantified ingredients. The same calculated objects feed the plan page, print view, email output, filters, household view and eligible nutrition schema.

The machine-readable detailed report is generated at `audit-artifacts/nutrition-discrepancies.json` by `npm run audit:nutrition`.

## Architecture map

| Entry point | Canonical input | Calculation and serving path | Visible or machine output | Previous bypass removed |
|---|---|---|---|---|
| Shared meals | `mealLibrary.js` ingredients | parser → table → `computeMealNutrition` | generated plans, cards, print, shopping | stored kcal/protein no longer drive scaled values |
| Legacy plans | `mealPlans.js` ingredients | `buildCanonicalLegacyPlan` | legacy page and email | duplicate page/email calculations unified |
| Generated combinations | seed + shared meals | `buildPlanDays` recalculates displayed scaled ingredients | page, filters, quiz result, print | independent calorie override removed |
| Household scaling | canonical one-person plan | scale ingredient quantities; retain per-person values | household plan and shopping list | no nutrition rescaling drift |
| Meal edits and substitutions | edited ingredient arrays | `server/canonical-nutrition.js` | API response, page totals, shopping list | model-supplied macros rejected |
| Email | canonical legacy or generated plan object | shared builders and totals | HTML email | no separate legacy arithmetic |
| Structured data | visible calculated plan/recipe object | shared rounded values | JSON-LD | no independent nutrition constants |
| Search metadata | calculated plan summaries | target classifiers | cards and exact filters | protein filter no longer uses stale ±30 g band |
| Blog search | generated title/summary index | build-time JSON index | site search | full article corpus removed from global navigation chunk |

Values are copied only as synchronized display caches in the two source meal files. `scripts/sync-stored-nutrition.js` rewrites those copies from the canonical calculation. Audit commands compare them exactly after shared rounding.

## Exhaustive coverage

| Area | Coverage | Failure threshold | Result |
|---|---:|---|---|
| Shared meal records | 169/169 | any unresolved ingredient, invalid quantity, non-finite/negative value or stored/display difference | passed |
| Legacy meal occurrences | 112/112 across four base plans | same as shared meals | passed |
| Ingredient occurrences | 1,181 | any unresolved or invalid item | passed |
| Unique ingredient lines | 591 | deterministic food and unit resolution required | passed |
| Canonical food records | 229 | explicit kcal, protein, carbs, fat and fibre required | passed |
| Aliases | 320 | duplicate/conflicting resolution prohibited | passed |
| Dietary meal labels | 169/169 | known prohibited ingredients or unsupported high-protein tag | passed |
| Generated combinations | 76,246 | meal arithmetic zero drift; mean calories ±3%; each day ±7.5%; high-protein ≥20% energy; no invalid references or accidental duplicates | see final `plan-combinations.json` report |
| Household states | seven states for every distinct rendered output | per-person values unchanged; household totals and shopping list reconcile | see final `plan-combinations.json` report |

## Findings and resolutions

| Issue category | Before | After | Severity | Resolution |
|---|---:|---:|---|---|
| Previously reported unresolved recipe quantities | 21 | 0 | P0 | Explicit optional/excluded wording added only to genuinely negligible garnish/seasoning items; material oils and sauces stay quantified. |
| Shared stored kcal/protein records that drifted | 85 | 0 | P0 | Recalculated and synchronized from ingredients. |
| Legacy stored meal occurrences that drifted | 47 | 0 | P0 | Recalculated and synchronized from ingredients. |
| Heuristic missing-macro fallback paths | 1 | 0 | P0 | Removed; all 229 records now require explicit macro data. |
| Unmarked liquid density assumptions | 14 food records | 0 | P0 | Per-100 ml basis declared explicitly for liquids. |
| Fraction parsing defect (`3/4`) | 1 parser path | 0 | P0 | Slash fractions now parse as one quantity. |
| Generated display nutrition independent of displayed quantities | 1 systemic path | 0 | P0 | Plans now recalculate from the final displayed ingredient strings. |
| Legacy page/email arithmetic implementations | 2 | 1 | P0 | Both call `buildCanonicalLegacyPlan`. |
| AI paths accepting model-supplied nutrition | 3 | 0 | P0 | Recalculate and reject unresolved output. |
| False vegan meal label | 1 | 0 | P0 | Honey-containing protein balls relabelled vegetarian. |
| Unsupported high-protein meal tag | 1 | 0 | P1 | Tag removed; all remaining tags meet the 20% criterion. |
| Published high-protein plans below the criterion in the initial audit | 19 | 0 | P1 | Goal pools now require qualifying meals. |
| Accidental duplicate snack occurrences found by the first exhaustive run | 816 | 0 | P1 | Snack selection tracks meals already used that day; high-energy repeats remain only where the restricted pool is insufficient. |
| Exact protein filter tolerance | ±30 g | ±5 g or ±5% | P1 | Filter uses recalculated summary protein and the documented release rule. |

The discrepancy report records each meal's stored and recalculated values, absolute and percentage difference, cause, applied fix, source basis and exact-claim eligibility.

## Regression protection

- `npm run audit:nutrition` exhaustively validates meal and ingredient records.
- `npm run audit:recipes` fails on missing material quantities and critical instruction defects.
- `npm run audit:dietary` validates every shared meal label.
- `npm run audit:plans` enumerates all 76,246 feasible combinations and all supported household states.
- `npm test` covers parsing, units, raw/cooked mapping, summation, rounding, target classification, household scaling, shopping reconciliation, legacy/email equivalence and AI edit rejection/recalculation.
- `.github/workflows/quality.yml` runs the complete release gate on every pull request and main-branch push.

See `docs/nutrition-methodology.md` for field semantics and source provenance.
