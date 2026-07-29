# Nutrition methodology

Last reviewed: 29 July 2026

## Scope and source of truth

MealPrep.org.uk treats the quantified ingredient list as the canonical nutrition source. A meal's calories, protein, carbohydrate, fat and fibre are calculated from those ingredients at full precision and rounded once for display. Stored meal headlines are synchronized copies, not an independent authority.

The calculation path is:

1. `src/data/nutritionTable.js` holds deterministic food records and aliases.
2. `src/utils/ingredientParser.js` parses quantity, unit, food name and raw/cooked qualifiers.
3. `src/data/nutritionTable.js` converts the parsed quantity to grams, millilitres or a documented count-unit weight.
4. `src/utils/nutrition.js` sums unrounded ingredient values and applies the shared display rounding rule.
5. `src/utils/planBuilder.js` and `src/utils/legacyPlanBuilder.js` compose meals into days, weekly averages, household views and shopping lists.
6. Page, print, email, filter and structured-data outputs read the same calculated values.
7. AI plan endpoints pass their result through `server/canonical-nutrition.js`; unresolved ingredients make the response invalid.

## Data sources and provenance

Generic foods use the UK Composition of Foods Integrated Dataset (CoFID) 2021 Proximates workbook as the preferred reference when a suitable deterministic match exists. USDA FoodData Central or a typical current UK manufacturer/retailer label is used when CoFID lacks a suitable match. Branded-style products use a representative UK label value rather than fuzzy matching to an unrelated generic food.

The release contains 229 explicit canonical food records and 320 reviewed aliases. Every canonical record has explicit values for all stored macros. The build does not infer missing macros from calories or from another macro.

Reference sources:

- [UK Composition of Foods Integrated Dataset](https://www.gov.uk/government/publications/composition-of-foods-integrated-dataset-cofid)
- [USDA FoodData Central](https://fdc.nal.usda.gov/)
- Current UK manufacturer or retailer nutrition panels where noted beside an entry

Reference mappings are stored locally. Builds and production requests never depend on an external nutrition service or fuzzy match.

## Field definitions

| Field | Definition |
|---|---|
| `kcal` | Source energy in kilocalories. Source energy remains authoritative; macro-derived energy is a plausibility check. |
| `protein` | Protein grams. |
| `carbs` | Available carbohydrate grams using the UK convention, excluding fibre. |
| `fats` | Total fat grams. |
| `fibre` | Fibre grams. Fibre is retained separately from available carbohydrate. |
| sugars | Not stored. No exact sugar total is generated. |
| saturates | Not stored. No exact saturated-fat total is generated. |
| salt/sodium | Not stored. No exact salt or sodium total is generated. |
| serving | One person's displayed meal portion unless the record explicitly says otherwise. |
| recipe yield | The count of servings produced. It must be positive before a per-serving value is eligible for display. |
| household total | The quantity and nutrition for all selected household portions. Per-person nutrition does not change merely because more portions are prepared. |

## Weight and unit rules

- Food records are per 100 g unless `basis: 'ml'` explicitly marks a per-100 ml liquid.
- Raw and cooked records are different deterministic keys. Dry grains never use cooked values, and cooked quantities never use dry values.
- Drained canned foods map to explicitly drained keys where the ingredient says drained.
- Count units require a food-specific `gramsEach` value.
- Tablespoons and teaspoons use food-specific density overrides where water-equivalent conversion would be materially wrong, including oils, honey and nut butters.
- Litres convert to millilitres; kilograms convert to grams.
- An unsupported unit, invalid number, missing material quantity or unresolved alias fails the nutrition audit.
- Optional water, herbs, seasoning and negligible garnishes contribute zero only when the ingredient explicitly says that they are excluded from the estimate. Material oils, sauces and dressings remain quantified.

The model estimates edible ingredient weight. It does not claim purchased-pack weight, cooking loss, bioavailability or laboratory precision. Plans and recipes are therefore labelled as estimates.

## Raw, cooked and yield treatment

The ingredient wording selects the reference state. A raw chicken quantity uses the raw chicken record; a quantity explicitly stated as cooked uses the cooked record. Cooking does not create or remove a second nutrition multiplier. Recipe yield divides the full recipe once. Portion and household scaling multiply ingredient quantities once and preserve the original per-person values.

## Energy reconciliation and rounding

Energy calculated as protein × 4 + available carbohydrate × 4 + fat × 9 is used only to detect implausible records. It can differ from source energy because UK source data treats fibre separately and because of rounding and other energy-bearing components.

Internal sums retain decimals. `roundNutrition` is the only display-rounding rule: calories and each stored macro are rounded to the nearest whole unit after summation. Day totals sum displayed meal values; weekly summaries average the seven day totals. Page, print, email and JSON-LD use those same rounded objects.

## Exact-target eligibility

A calorie-target plan is eligible only when its seven-day mean is within ±3% of the stated target and every day is within ±7.5%. A requested protein target is eligible only when its mean is within ±5 g or ±5%, whichever is larger, and every day is within ±10%. High-protein labels require at least 20% of calculated energy from protein.

An unresolved ingredient, unit or serving yield makes a plan ineligible for an exact claim. The system rejects such generated or edited output instead of substituting guessed nutrition.

## Limitations

Values are planning estimates, not medical advice. Brand reformulation, natural variation, drained weight, cooking loss and portion measurement can change actual intake. Cross-contamination cannot be inferred from an ingredient name, so the taxonomy does not create absolute allergen-free claims.
