# Source log

Every external claim in the four books traces to something in this file. Anything
that could not be sourced was written around rather than asserted.

---

## 1. Nutrition data

**Primary path.** All macros are calculated from the quantified ingredient lists
by `src/utils/nutrition.js`, which resolves foods through
`src/data/nutritionTable.js`. Provenance for that table is documented in
`docs/nutrition-methodology.md`: UK Composition of Foods Integrated Dataset
(CoFID 2021) first, USDA FoodData Central second, a representative UK label
third. No figure in any of the four books was written by hand.

### Addition made for this build

One food was missing and was required by eleven recipes across the four books.

| Food | Values per 100g | Source | Checked |
|---|---|---|---|
| `tomato purée` | 93 kcal, 4.0g protein, 16.4g carbohydrate, 0.5g fat, 2.9g fibre | Representative UK own-label double-concentrate label (Aldi *Cucina* Tomato Purée Double Concentrate), retrieved via Open Food Facts. Lidl *Baresa* (94 kcal, 4.5g protein) and Sainsbury's own-label (89 kcal, 4.3g protein) agree within about 2 kcal and 0.5g protein. | 11 September 2026 |

Also added: `gramsPerTbsp: 16` and `gramsPerTsp: 5.5`, because purée is denser
than the generic water-equivalent spoon conversion; and synonyms for
`tomato puree` (unaccented) and `tomato paste`.

Verified after the change: `node --test scripts/nutrition-system.test.js` (26
passing) and `node scripts/check-nutrition.js` (169 library meals, 4 legacy
plans) both still pass.

**Foods deliberately not added.** Passata, crème fraîche substitutes, plain
flour, mayonnaise, gnocchi and stock cubes were all wanted at some point during
drafting. Values could not be verified from a primary source within this build,
so the recipes were rewritten to use foods the table already resolves
(wholemeal flour, `low-fat crème fraîche`, stock measured in millilitres) rather
than inventing numbers.

---

## 2. Retailer facts

Retailer claims are limited to durable, documented facts about how each chain
operates. **No specific product is claimed to be in stock**, because stock is the
one thing a printed book cannot promise.

All of it comes from `src/data/supermarketProfiles.js`, whose own evidence block
records the source and date.

| Claim used | Retailer | Source recorded in the repo | Checked |
|---|---|---|---|
| Everyday Essentials is the value own-label tier; Specially Selected is the premium tier | Aldi | aldi.co.uk category pages | 16 August 2026 |
| A dedicated higher-protein food and drink category is grouped online rather than scattered through the aisles | Aldi | aldi.co.uk | 16 August 2026 |
| Slimwell groups lower-calorie prepared products | Aldi | aldi.co.uk | 16 August 2026 |
| Short range: one or two options per line, ranges rotate, availability varies by store | Aldi | The Grocer, Which?, Grocery Gazette, Retail Gazette | 20 July 2026 |
| Milbona is the own-brand dairy label, with an unusually broad high-protein line (skyr, high-protein Greek style, fat-free high protein, a high-protein drink) | Lidl | lidl.co.uk product and category pages | 16 August 2026 |
| High-protein products are grouped under a dedicated category online | Lidl | lidl.co.uk | 16 August 2026 |
| Vemondo is the own-brand plant-based range | Lidl | lidl.co.uk | 16 August 2026 |
| Deluxe is the premium own-label tier | Lidl | lidl.co.uk | 16 August 2026 |
| Lidl Plus is the loyalty/coupon scheme; middle-aisle stock is not reliable for planning | Lidl | lidl.co.uk; The Grocer | 20 July / 16 August 2026 |

Both books carry an explicit non-affiliation line naming the retailer's legal
entity.

---

## 3. Prices

**No retailer price appears in any of the four books.** Cost is expressed only as
the MealPrep.org.uk planning tier, per `docs/cost-methodology.md`:

| Tier | Per person per week | Used by |
|---|---|---|
| Budget | £30–£40 | Aldi Budget, Lidl Budget |
| Moderate | £40–£55 | Aldi High-Protein, Lidl High-Protein |

Tier ranges reviewed **29 July 2026**; that date is printed in each book beside
the figure. Each cost chapter states that the range is a planning estimate and
not a basket quotation, and lists what moves it (promotions, pack sizes,
regional variation, reformulation, items already owned).

The high-protein books are placed a tier higher than the budget books because
their baskets contain salmon, steak, prawns, paneer and smoked fish. That is a
judgement about basket composition against the site's own model, not a measured
basket, and it is described as such in the books.

**Comparative claims** were deliberately softened wherever they could not be
evidenced. No book says "cheapest", "always cheaper" or "X is cheaper than Y";
the wording used is "usually", "typically", "often", or the comparison was
removed. The QA suite fails the build if an absolute price comparison appears
(check H).

---

## 4. Food safety

Food Standards Agency guidance, fetched and read during this build rather than
recalled.

| Rule | Source | Checked |
|---|---|---|
| Cool cooked food and refrigerate within one to two hours | gov.uk, *How to chill, freeze and defrost food safely* | 10 September 2026 |
| Eat leftovers within 48 hours, or freeze them | as above; food.gov.uk home food fact checker | 10 September 2026 |
| Fridge 0–5 °C; freezer around −18 °C | as above | 10 September 2026 |
| Defrost in the fridge; use within 24 hours of full defrosting | as above | 10 September 2026 |
| Reheat until steaming hot throughout; reheat once only | food.gov.uk | 10 September 2026 |
| Cooked rice: chill within one hour, keep one day, never reheat twice | food.gov.uk (SFBB rice safe method; home food fact checker) | 10 September 2026 |

The 48-hour rule is the reason every leftover in all four books is eaten the
following day, and the rice rule is why rice is either cooked fresh twice, or
confined to a Sunday that feeds no lunch, or absent entirely (Lidl High-Protein).

---

## 5. Health guidance

General healthy-eating framing cites the **NHS Eatwell Guide**. No book gives
personalised dietary advice, makes a medical claim, or states a therapeutic
benefit. The high-protein books state plainly that protein mostly buys satiety
and helps preserve muscle when calories are controlled, and direct anyone with
kidney disease or a condition affecting protein handling to their GP.

**No allergen-free claim is made anywhere**, in line with
`docs/known-limitations.md`: cross-contamination cannot be inferred from an
ingredient list.

---

## 6. Editorial precedent

The decision to repeat breakfasts across the week was checked against an
independent, Eatwell-aligned published plan rather than asserted: the British
Heart Foundation's seven-day budget menus rotate two or three breakfasts across
the week and push dinner leftovers into the following day's lunch
(bhf.org.uk, *Eat well on a budget: sample menus*, read 11 September 2026). The
books describe this as "designed around the way many people eat" rather than
claiming it is how everyone eats.
