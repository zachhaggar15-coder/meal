# MealPrep.org.uk six-week supermarket plans — governing specification

Last reviewed: 11 September 2026.

This file governs the four paid products in `products/meal-prep-ebooks/`. It is the
authority the build validates against. Where this file and a habit disagree, this
file wins; where this file and `docs/nutrition-methodology.md` or
`docs/cost-methodology.md` disagree, **the site docs win** and this file is wrong
and must be corrected.

The standard the whole build is measured against:

> If two people paid for this, bought exactly what the weekly list told them to
> buy, and followed the plan for six weeks, would the system actually work?

"Does the PDF look good" is not the standard.

---

## 1. The products

Four self-contained six-week products:

| Book | Store | Plan |
|---|---|---|
| `aldi-budget` | Aldi | Budget |
| `aldi-high-protein` | Aldi | High-protein |
| `lidl-budget` | Lidl | Budget |
| `lidl-high-protein` | Lidl | High-protein |

They must not be four cosmetically renamed versions of one book. Retailer and plan
type must produce real differences in recipes, ingredient choices, pack-size
utilisation, pricing, weekly lists, ingredient overlap, swaps, editorial advice and
meal sequencing.

**Core promise:** *for two adults who hate deciding what is for dinner.*

What the product sells, in order: fewer food decisions; one organised weekly shop;
practical weeknight cooking; tomorrow's lunch already solved; predictable calories;
less food waste. Saving money matters for the Budget books but decision relief is
the proposition.

---

## 2. Audience and structure

- Written explicitly for **two adults**, same portion size each.
- **~2,000 kcal per person per day.**
- British audience, **British English** throughout.
- Target **under 45 pages** per book. Page count is subordinate to usefulness: if a
  book genuinely needs more, report why rather than degrading it. Never compress
  typography or drop instructions, lists or safety guidance to hit the number.
- A4 portrait throughout.
- **~24 distinct dinners** across 42 dinner slots. Favourites recur; repetition
  should feel intentional. **No dinner repeats on adjacent days**, and avoid very
  short recurrence intervals without a practical reason.
- Two recipes per recipe page where practical.

### Meal system

- **Not batch cooking.** One dinner cooked each night.
- Most dinners yield **four portions**: two eaten, two refrigerated for tomorrow's
  lunch.
- Each week is **self-contained**: Monday's lunch is a fresh no-cook lunch, Monday
  to Saturday dinners each feed the following day's lunch, and Sunday's dinner
  yields two portions only. Where the system cannot work, the exception is stated
  in the book.
- **Breakfasts repeat heavily**: one weekday breakfast, one weekend breakfast.
- A **repeated daily extra** is part of the system. Standard is yogurt + frozen
  berries + peanuts. Any change must be nutritionally calculated, not improvised.

### Dinner time

- **Hard limit 40 minutes total elapsed time**, aiming at ~30.
- The clock starts cold and includes chopping, preparation, **oven preheating** and
  cooking. **Unattended oven time still counts.** Never advertise 40 minutes and
  hide passive cooking behind it.
- Breakfasts and lunches may exceed this only where presented as such. The dinner
  promise stays intact.

### Practicality

Reject a recipe where: an important ingredient never appears in the method; raw
meat or fish is not explicitly cooked; a sauce or stew lacks liquid; timings are
implausible; several high-attention tasks run at once; specialist equipment is
assumed; quantities are unrealistic; or leftovers would be unpleasant or unsafe the
next day.

Aim for one primary pan or tray plus a simple side. Avoid restaurant-style
finishing steps and decorative garnish.

---

## 3. Six-week design

Design each book as **one system**, not six weeks concatenated. Build the 42-day
matrix first — day, breakfast, lunch source, dinner, extra, calories, protein,
whether the dinner produces lunch, ingredient reuse, retailer-relevant items,
estimated weekly cost — and review it before writing prose.

Maintain genuine variety across protein, carbohydrate, cooking method, texture and
flavour profile, without novelty for its own sake. Ingredient overlap within a week
is good where it reduces waste and uses realistic pack sizes; it must not become
monotonous across every meal.

Test for every dinner: *would two ordinary working adults want to eat this on a
Tuesday?* Reject meals justified only by nutritional optimisation.

---

## 4. Differentiation

**Budget books** prioritise sensible own-brand ingredients, low cost per useful
portion, legumes, cheaper cuts, ingredient reuse, realistic pack-size utilisation,
low waste and inexpensive staples. Governing tier **£30–£40 per person per week
(~£60–£80 for two)**. Never force a week into range by inventing prices or ignoring
ingredients — redesign the week, or state the truthful estimate.

**High-protein books** must not be the Budget book with extra chicken. The absolute
rule is **≥20% of energy from protein**, but these should land materially higher
than the Budget books wherever realistic. Never state a protein target the
generated data does not support. Use meat, poultry, fish, eggs, yogurt, dairy and
legumes. They remain ordinary food for couples, not bodybuilding diets.

**Retailer differentiation** must account, where verifiable, for products ordinarily
sold there, own-brand ranges, relevant pack sizes, realistic pricing and how the
rest of a pack gets reused. **Do not invent product availability** — where it cannot
be verified, name a generic category instead of a specific product. No retailer
logos. Every book carries: *MealPrep.org.uk is not affiliated with or endorsed by
Aldi/Lidl.*

---

## 5. Shopping lists — strict data rules

The shopping list is **generated from the meal schedule and quantified ingredients**.
Never written by hand.

For every week the generator must: expand every meal occurrence; expand every
recipe ingredient; **multiply by actual frequency**; account for recipe yield;
aggregate identical ingredients; normalise compatible units; compare against the
displayed list; and **fail the build** on anything missing or materially
inconsistent.

A breakfast using 120g oats that occurs three times is **360g oats**, not 120g. The
same applies to repeated breakfasts, daily extras, repeated dinners, lunch
leftovers, milk, yogurt, fruit, grains, oil, meat, tins and every other quantified
ingredient.

**Pantry.** Distinguish ingredients bought this week, pantry staples, and
ingredients bought earlier in the plan. Never silently assume an expensive
ingredient already exists. A spice bought in Week 1 shows in Week 1, is not
rebought, and the carry-forward is explicit.

**Pack sizes.** Keep *recipe quantity required* and *retail pack quantity purchased*
distinct. Never change recipe nutrition because a shopper must buy a bigger packet.

**Grouping.** Fruit and vegetables; meat and fish; chilled; frozen; tins and jars;
bakery; cupboard. Order resembles a normal shop without pretending to know any
branch's aisle sequence. Notes only where they add value.

---

## 6. Leftover and yield reconciliation

A dinner marked "serves 2, plus 2 lunches" yields exactly **four** planned portions,
and its nutrition is **total ÷ 4**, never ÷ 2.

An automated leftover ledger tracks, per day: portions produced, eaten immediately,
refrigerated, consumed later, frozen, remaining.

**Fail the build if** a lunch references leftovers never produced; leftovers are
consumed twice; surplus portions disappear unexplained; or required leftovers
exceed the recipe yield.

---

## 7. Nutrition

The quantified ingredient list is canonical. All macros run
`ingredientParser` → `nutritionTable` → `nutrition.js`. **No nutrition figure may be
authored manually.**

Provenance order: CoFID 2021, then USDA FoodData Central, then a representative UK
label. Never infer a missing macro from calories, another macro or a generic
assumption.

- Raw and cooked are separate keys; dry grains never use cooked records; drained
  tins use drained values.
- **No vague count units.** Grams and millilitres unless the food has a validated
  `gramsEach`. `1 tin chopped tomatoes` silently resolves to ~22 kcal — one tomato.
- An unresolved ingredient makes the recipe **ineligible**; the builder fails rather
  than publishing incomplete nutrition.
- Seasonings are zero only with the exact suffix
  `optional to taste (excluded from nutrition estimate)`. Material oils, sauces,
  dressings, nut butters, cheese, sugar and honey stay quantified.
- Carbohydrate is **available carbohydrate excluding fibre**. Do not state sugars,
  saturates or salt.
- Round once, after summation. Yield divides the recipe exactly once. Per-person
  nutrition does not change because a recipe makes more portions.

**Calorie eligibility, per seven-day week:** mean within **±3%** of 2,000 kcal, every
day within **±7.5%**. Fix by changing quantified food portions, never by editing a
displayed number.

**Protein claims:** where an explicit target is claimed, mean within ±5 g or ±5%, and
every day within ±10%.

**High-protein claim:** ≥20% of energy from protein, validated from calculated
protein and calories.

### Nutrition-table additions

Genuinely missing foods may be added to `src/data/nutritionTable.js`. Values must
not be invented: follow the provenance hierarchy, record the source, use the correct
raw/cooked/drained form, add or extend tests, and verify parsing and units. Codex
may be working the same branch — inspect current state, avoid overwriting unrelated
work, keep changes small and attributable.

---

## 8. Cost

Costs are **planning ranges**, never guaranteed basket prices.

| Tier | Per person per week |
|---|---|
| Very cheap | £20–£30 |
| Budget | £30–£40 |
| Moderate | £40–£55 |
| Flexible | £50–£70 |

Scale linearly for two. Editorial estimates are not silently mixed with the tier
model. Any current price claim needs a real source (retailer or ONS) and a real
check date, and goes stale after 120 days under `editorialSafeguards.js`. Where
prices cannot be verified, use the validated planning model and label it an
estimate; never fabricate retailer prices.

Every cost section states that estimates differ because of promotions, pack sizes,
regional variation, reformulation and items already owned.

**No unsupported absolutes.** Not "frozen berries are always cheaper", "chicken
thighs are always cheaper than breast", "turkey mince is cheaper". Use "often",
"typically", or drop the comparison.

---

## 9. Food safety

Food Standards Agency, verified 10 September 2026:

- Cool cooked food and refrigerate within 1–2 hours.
- Eat refrigerated leftovers within 48 hours, or freeze.
- Fridge 0–5 °C; freezer −18 °C.
- Reheat until steaming hot throughout; reheat once only.
- Defrost in the fridge; use within 24 hours of defrosting.

**Cooked rice:** chill within one hour, refrigerate no more than one day, reheat once
only. Default strategy is to cook rice fresh for dinner and fresh again for the
leftover lunch. Do not create avoidable rice-storage dependencies. Couscous, pasta
and potato may be used strategically for next-day lunches, subject to their own
requirements.

**No allergen-free claims.**

---

## 10. Claims and editorial standard

Never invent nutrition, prices, statistics, scientific claims, citations, product
availability, retailer practices or health claims. Health guidance cites the NHS
Eatwell Guide or NHS healthy-weight guidance; food safety cites the FSA. Dates must
be genuine.

Avoid universal claims such as "this is how people eat"; prefer "designed around the
way many people eat".

Writing is concrete, confident, practical, edited, occasionally witty, economical.
Avoid generic AI enthusiasm, filler, repetitive introductions, formulaic recipe
descriptions, "delicious and nutritious", "perfect for busy weeknights", and
identical sentence structures across recipes.

Reusable components are fine. **Reusable prose is not.** The four books should feel
written, not mail-merged.

---

## 11. Design

- White page background; cream only for selected panels.
- Lime only as a filled accent behind near-black text; never lime body text.
- Greyscale printing must stay readable.
- ~3px offset shadow, not 6px.
- Fonts embedded as data URIs; no CDN dependency during PDF generation.
- No retailer logos or brand-colour imitation.
- Pages information-dense but calm. Never shrink type merely to hit a page target.

Each book contains a genuinely printable compact six-week planner / fridge sheet
showing day, dinner, next-day lunch, preparation note and a tick box. No decorative
filler pages.

---

## 12. Automated QA (mandatory)

The build runs these and refuses to publish on a critical failure.

| ID | Check |
|---|---|
| A | Schedule: exactly 42 days; every day has breakfast, lunch, dinner, extra |
| B | Calories: every day within ±7.5%; each 7-day mean within ±3% |
| C | High-protein: ≥20% of energy from protein |
| D | Yield: servings agree with the schedule; every leftover lunch has a producing dinner |
| E | Shopping list: every quantified weekly ingredient appears in the aggregation, repeats multiplied correctly, nothing without a source meal or pantry reason |
| F | Leftovers: no negative inventory, no missing portions, no phantom lunches |
| G | Nutrition: no unresolved ingredient, no invalid unit, no missing macro, no duplicate yield division |
| H | Cost: any dated price claim has a source and check date; stale claims flagged |
| I | Food safety: rice logic complies; next-day leftovers inside safe windows |
| J | Content: dinner ≤40 minutes elapsed; no missing method steps; raw protein explicitly cooked; major ingredients present in the method |
| K | Output: A4 portrait; under 45 pages unless justified; no clipped content; fonts embedded; greyscale-readable |
| L | No dinner repeats on adjacent days |
| M | Every prose claim about novelty or repetition agrees with the derived occurrence model |
| N | Every cupboard staple assumed in weeks 2–6 was bought on week one's list |
| O | One canonical name per ingredient concept per list; no combined seasoning strings |
| P | Pack guidance never under-buys, pack counts are exact, and static notes make no week-specific quantity claim |
| Q | Retailer content is specific to the book and carries the right disclaimer; no cross-retailer terminology |
| R | Stated dinner time ranges cover the real spread |
| S | Stated protein figures match the computed plan, at the scope claimed |
| T | Every factual statement in editorial and front-matter prose reconciles with the derived fact model |

### Why T exists

M–S read week objects. Four figures survived a full passing QA run by sitting
in introductory chapters nothing scanned: 55g of protein from a breakfast pair
that makes 51.6g, a week-one cupboard described as containing miso and peanut
butter that neither book buys, and a forty-minute dinner ceiling on a book whose
longest dinner is thirty-five.

T walks **every string in the book** — sections, appendices, recipe taglines,
cover facts, contents ledes, shop notes, week prose — and reconciles each claim
it recognises against `build/facts.mjs`: protein at the scope stated (daily,
breakfast, extra, the two combined, a named dish, a range, a percentage of
energy), week-one cupboard prose resolved term by term through
`CUPBOARD_CONCEPTS`, dinner-time ceilings and ranges against the real spread
(dinners only — a Monday jacket potato must never widen the dinner promise),
and whole-book counts.

`build/frontmatter.selftest.mjs` re-injects each stale statement that reached a
released PDF and asserts the checker still catches it, plus a positive control
that the shipped books stay clean. A validator reporting nothing is otherwise
indistinguishable from one doing nothing.

### Why M–S exist

The first release passed A–L and still shipped twenty contradictions: "all
twenty-four dinners" in a week where twenty-one had been cooked, "a third
outing" for dishes cooked twice, cupboard lists assuming spices no list ever
bought, and "150g of protein every day" when nine days missed the band.

The root cause was always the same shape: **two representations of one fact**.
`week.dinners` said what gets cooked and the week's prose said it again in
English; the shopping engine knew what staples a week needed and the cupboard
copy listed them again by hand. Nothing compared the pair.

The rule that follows: **where a fact can be derived, derive it, and where prose
restates a derived fact, validate the prose against the derivation.** Prose may
be prose; it may not make a counting claim the data does not support.

### Render-time checks

Run against the rendered DOM and the finished PDF, because they cannot be seen
in the data: content overflowing the text area, unresolved `${...}` or stray
`undefined`/`NaN` reaching the page, a contents page whose own length changes
when numbers are added (which would shift every number after it), and pages
carrying almost no text, which means a `break-inside: avoid` block was orphaned
onto a sheet of its own.

A QA report is produced per book. No product is complete while a critical check
fails.

### Manual pass

After automated tests pass, inspect every PDF for broken page flow, clipped text,
awkward wrapping, excessive whitespace, tiny text, orphan headings, bad table
breaks, contradictory claims, repetitive prose, culinary nonsense, odd quantities,
monotonous weeks, implausible timings and superficial retailer differentiation.

Trace at least **two complete weeks per book** end to end: shopping list → recipes →
schedule → leftovers → calories → protein → cost.

---

## 13. Listing assets

Only after all four books pass QA. No retailer logos. Communicate: six weeks; two
adults; ~2,000 kcal each; one weekly shop; dinner in ≤40 minutes; tomorrow's lunch
from tonight's dinner; supermarket-specific planning; Budget or High-Protein
positioning. Do not overload with text. Use real spreads from the validated books
where useful.

---

## 14. Deliverables

RULES.md; four PDFs; generator changes; automated validation tests; a QA report per
book; nutrition-table additions with sources; a retailer and pricing source log;
listing assets; and a build report covering unique and repeated dinner counts,
average/min/max daily kcal, average protein, high-protein energy percentage,
estimated weekly cost range, page count, unresolved ingredients (zero),
shopping-list reconciliation failures (zero), leftover reconciliation failures
(zero), and any compromises or assumptions.
