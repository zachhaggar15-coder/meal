// Nutrition reference data used to compute (and audit) the calories and macro
// figures shown for every recipe on the site.
//
// Methodology: values are per 100g (or 100ml for liquids) unless noted, based
// on UK CoFID (McCance & Widdowson's Composition of Foods) where available,
// cross-checked against USDA FoodData Central. Macro coverage was broadened
// across the full ingredient table on 2026-07-11 using the CoFID 2021
// Proximates workbook as the primary source, with USDA FDC or typical UK label
// values used where a close CoFID row was not available. Figures remain
// estimates based on standard UK nutritional data.
//
// `gramsEach` gives the typical weight of one count-unit (an egg, a slice, a
// clove) so "Eggs 3" or "Onion 1" can be converted to grams and priced off
// the same kcal100/pro100 figures as a measured amount. `gramsPerTbsp` /
// `gramsPerTsp` override the generic 15g/5g spoon conversion for ingredients
// whose density differs meaningfully from water (oils, honey, nut butters).

export const NUTRITION_TABLE = {
  // ── Grains & carbs (dry/raw weight unless the key says otherwise) ────────
  'rolled oats':            { kcal100: 375, pro100: 13.5 }, // verified: UK CoFID/manufacturer avg 2026-07-06
  'oat flour':              { kcal100: 375, pro100: 13 },
  'bran flakes':            { kcal100: 320, pro100: 10 },
  'weetabix':               { kcal100: 362, pro100: 12, gramsEach: 18.7 },
  'brown rice dry':         { kcal100: 362, pro100: 7.5 },
  'brown rice cooked':      { kcal100: 112, pro100: 2.3 }, // verified 2026-07-06
  'arborio rice dry':       { kcal100: 349, pro100: 7 },
  'wholemeal pasta dry':    { kcal100: 348, pro100: 13.4 },
  'wholemeal pasta cooked': { kcal100: 124, pro100: 5.3 },
  'orzo pasta dry':         { kcal100: 356, pro100: 12 },
  'wholewheat noodles dry': { kcal100: 340, pro100: 12 },
  'soba noodles dry':       { kcal100: 336, pro100: 14 },
  'rice noodles dry':       { kcal100: 360, pro100: 6 },
  'quinoa dry':             { kcal100: 368, pro100: 14.1 },
  'quinoa cooked':          { kcal100: 120, pro100: 4.4 },
  'wholemeal couscous dry': { kcal100: 355, pro100: 13 },
  'wholemeal flour':        { kcal100: 310, pro100: 13 },
  'granola':                { kcal100: 450, pro100: 10 },
  'low-sugar granola':      { kcal100: 420, pro100: 12 },
  'sweet potato':           { kcal100: 86, pro100: 1.6 },
  'new potatoes':           { kcal100: 72, pro100: 1.9 }, // corrected 2026-07-06: CoFID "new/salad potatoes, raw" ~69-72kcal
  'potato':                 { kcal100: 87, pro100: 1.9 },
  'potato baked':           { kcal100: 93, pro100: 2.6 }, // corrected 2026-07-06: USDA baked potato (flesh+skin)
  'parsnip':                { kcal100: 65, pro100: 1.6 },
  'butternut squash':       { kcal100: 45, pro100: 1 },
  'cauliflower':            { kcal100: 25, pro100: 1.9 },
  'wholemeal bread':        { kcal100: 230, pro100: 9.5, gramsEach: 40 }, // verified 2026-07-06 (avg Tesco/Hovis)
  'sourdough bread':        { kcal100: 260, pro100: 9, gramsEach: 60 },
  'rye bread':              { kcal100: 250, pro100: 8, gramsEach: 50 },
  'wholemeal bagel':        { kcal100: 250, pro100: 10, gramsEach: 85 },
  'wholemeal roll':         { kcal100: 250, pro100: 9, gramsEach: 60 },
  'wholemeal tortilla':     { kcal100: 260, pro100: 8, gramsEach: 55 },
  'wholemeal pitta':        { kcal100: 250, pro100: 9.5, gramsEach: 70 },
  'rice cakes':             { kcal100: 387, pro100: 8, gramsEach: 9 },
  'oatcakes':               { kcal100: 430, pro100: 10, gramsEach: 13 },
  'oat biscuits':           { kcal100: 470, pro100: 7, gramsEach: 15 },
  'rye crackers':           { kcal100: 340, pro100: 8, gramsEach: 10 }, // corrected 2026-07-06: Ryvita Original official label ~350kcal/100g

  // ── Dairy & alternatives ─────────────────────────────────────────────────
  'semi-skimmed milk':      { kcal100: 47, pro100: 3.6 }, // verified 2026-07-06
  'skimmed milk':           { kcal100: 34, pro100: 3.4 },
  'oat milk':               { kcal100: 47, pro100: 1.0 },
  'soy milk':               { kcal100: 33, pro100: 3 },
  'low-fat greek yogurt':   { kcal100: 73, pro100: 10 }, // verified 2026-07-06
  '0% greek yogurt':        { kcal100: 57, pro100: 10 },
  'greek yogurt':           { kcal100: 73, pro100: 10 },
  'low-fat yogurt':         { kcal100: 56, pro100: 4.8 },
  'low-fat natural yogurt': { kcal100: 56, pro100: 4.8 },
  'dairy-free yogurt':      { kcal100: 70, pro100: 1.5 },
  'high-protein yogurt pot':{ kcal100: 75, pro100: 11.5, gramsEach: 150 }, // corrected 2026-07-06: Arla Protein/Milbona branded pots ~10-12.5g/100g
  'protein yogurt':         { kcal100: 75, pro100: 11.5 },
  'skyr':                   { kcal100: 63, pro100: 11 },
  'plain kefir':            { kcal100: 41, pro100: 3.4 },
  'cottage cheese':         { kcal100: 98, pro100: 12 },
  'low-fat cottage cheese': { kcal100: 80, pro100: 11 },
  'reduced-fat cheddar':    { kcal100: 280, pro100: 29 }, // corrected 2026-07-06: Cathedral City/Pilgrims Choice reduced-fat cheddar ~274-315kcal, 28-30g
  'parmesan':               { kcal100: 420, pro100: 33 }, // corrected 2026-07-06: Parmigiano Reggiano Consortium official figure
  'halloumi':               { kcal100: 320, pro100: 22 },
  'reduced-fat halloumi':   { kcal100: 245, pro100: 22 }, // corrected 2026-07-06: Sainsbury's Light Halloumi ~244kcal
  'light cream cheese':     { kcal100: 155, pro100: 3.2 }, // corrected 2026-07-06: Philadelphia Light official panel
  'ricotta cheese':         { kcal100: 150, pro100: 10 }, // corrected 2026-07-06: whole/part-skim ricotta average ~10-11g protein
  'light mozzarella':       { kcal100: 250, pro100: 24 }, // corrected 2026-07-06: generic low-fat mozzarella ~254kcal
  'buffalo mozzarella':     { kcal100: 280, pro100: 18 },
  'reduced-fat feta':       { kcal100: 200, pro100: 16 },
  'low-fat paneer':         { kcal100: 220, pro100: 18 },
  'low-fat crème fraîche':  { kcal100: 165, pro100: 3 },
  'butter':                 { kcal100: 717, pro100: 0.6 },
  'egg':                    { kcal100: 143, pro100: 12.6, gramsEach: 58 }, // large egg, verified 2026-07-06 (78kcal/6.3g per egg)
  'egg white':              { kcal100: 52, pro100: 11, gramsEach: 33 },
  'egg yolk':               { kcal100: 322, pro100: 16, gramsEach: 17 },

  // ── Meat, fish & meat-free protein (raw weight unless marked cooked) ─────
  'chicken breast':         { kcal100: 120, pro100: 22.5 }, // verified 2026-07-06 (USDA raw)
  'chicken breast cooked':  { kcal100: 165, pro100: 31 },   // verified 2026-07-06 (USDA cooked)
  'chicken thighs':         { kcal100: 115, pro100: 20 }, // corrected 2026-07-06: was ~25% high vs CoFID raw dark meat
  'chicken tikka':          { kcal100: 170, pro100: 25 },
  'turkey mince lean':      { kcal100: 132, pro100: 21 }, // corrected 2026-07-06: Sainsbury's/Tesco UK extra-lean turkey mince labels ~130-138kcal
  'turkey breast slices':   { kcal100: 104, pro100: 22 },
  'turkey breast':          { kcal100: 104, pro100: 22 },
  'turkey sausages':        { kcal100: 180, pro100: 16, gramsEach: 50 },
  'turkey rashers':         { kcal100: 110, pro100: 20, gramsEach: 15 },
  'turkey patty':           { kcal100: 160, pro100: 20 },
  'lean beef mince':        { kcal100: 137, pro100: 21 },
  'lean beef strips':       { kcal100: 150, pro100: 22 },
  'lean sirloin steak':     { kcal100: 140, pro100: 22 }, // corrected 2026-07-06: nudged toward CoFID lean sirloin (~135)
  'lean stewing beef':      { kcal100: 150, pro100: 22 },
  'steak':                  { kcal100: 135, pro100: 22 }, // corrected 2026-07-06: was ~25-30% high vs CoFID lean beef steak cuts
  'lean beef jerky':        { kcal100: 410, pro100: 33 }, // corrected 2026-07-06: was ~39% low vs USDA beef jerky
  'lean lamb mince':        { kcal100: 200, pro100: 20 },
  'lean lamb shoulder':     { kcal100: 200, pro100: 20 },
  'pork tenderloin':        { kcal100: 110, pro100: 22 },
  'pork loin':              { kcal100: 130, pro100: 21 }, // corrected 2026-07-06: nudged toward CoFID pork steaks (~120)
  'back bacon rashers':     { kcal100: 213, pro100: 26, gramsEach: 30 }, // corrected 2026-07-06: was ~30% low vs CoFID grilled back bacon
  'lean bacon rashers':     { kcal100: 213, pro100: 26, gramsEach: 30 },
  'salmon fillet':          { kcal100: 195, pro100: 20, gramsEach: 150 }, // corrected 2026-07-06: nudged toward USDA raw farmed salmon (~208)
  'smoked salmon':          { kcal100: 184, pro100: 23 }, // corrected 2026-07-06: was ~29% low vs CoFID cold-smoked
  'smoked mackerel fillet': { kcal100: 301, pro100: 21, gramsEach: 80 }, // corrected 2026-07-06: was ~27% low vs CoFID smoked mackerel
  'mackerel fillet':        { kcal100: 205, pro100: 19, gramsEach: 80 },
  'tinned mackerel in brine': { kcal100: 190, pro100: 19 },
  'tinned sardines':        { kcal100: 175, pro100: 21 },
  'smoked haddock fillet':  { kcal100: 100, pro100: 23, gramsEach: 150 },
  'cod fillet':             { kcal100: 82, pro100: 18, gramsEach: 150 },
  'tuna steak':             { kcal100: 120, pro100: 26 }, // corrected 2026-07-06: nudged toward USDA raw tuna (species-dependent)
  'tinned tuna in spring water': { kcal100: 116, pro100: 26, gramsEach: 145 },
  'king prawns':            { kcal100: 71, pro100: 18 }, // corrected 2026-07-06: Waitrose UK label matches kcal exactly; protein nudged toward brand range (20-24g)
  'quorn mince':            { kcal100: 103, pro100: 16 }, // corrected 2026-07-06: Quorn official UK product page
  'falafel':                { kcal100: 230, pro100: 8, gramsEach: 45 },
  'firm tofu':              { kcal100: 145, pro100: 15.5 },
  'silken tofu':            { kcal100: 55, pro100: 5.5 },
  'nutritional yeast':      { kcal100: 320, pro100: 45 },
  'protein powder':         { kcal100: 380, pro100: 78 },
  'pea protein powder':     { kcal100: 370, pro100: 75 },
  'hummus':                 { kcal100: 166, pro100: 7.6 },
  'tinned chickpeas':       { kcal100: 115, pro100: 7.5 },
  'kidney beans':           { kcal100: 100, pro100: 7 },
  'black beans':            { kcal100: 110, pro100: 7.5 },
  'cannellini beans':       { kcal100: 95, pro100: 6.5 },
  'mixed beans':            { kcal100: 100, pro100: 7 },
  'edamame beans':          { kcal100: 121, pro100: 11 },
  'red lentils dry':        { kcal100: 340, pro100: 24.6 }, // corrected 2026-07-06: USDA raw lentils
  'green lentils dry':      { kcal100: 340, pro100: 24.6 }, // corrected 2026-07-06: USDA raw lentils (no distinct green-lentil source found)
  'lentils cooked':         { kcal100: 114, pro100: 9 }, // corrected 2026-07-06: USDA boiled lentils
  'sweetcorn':              { kcal100: 86, pro100: 3.2 },
  'nut roast':              { kcal100: 220, pro100: 10 },

  // ── Nuts, seeds & spreads ────────────────────────────────────────────────
  'almonds':                { kcal100: 579, pro100: 21 },
  'walnuts':                { kcal100: 654, pro100: 15 },
  'peanuts':                { kcal100: 567, pro100: 25 },
  'mixed nuts':             { kcal100: 600, pro100: 20 },
  'mixed seeds':            { kcal100: 550, pro100: 20 },
  'pumpkin seeds':          { kcal100: 559, pro100: 30 },
  'sesame seeds':           { kcal100: 573, pro100: 17 },
  'chia seeds':             { kcal100: 486, pro100: 17 },
  'hemp seeds':             { kcal100: 553, pro100: 31 },
  'peanut butter':          { kcal100: 588, pro100: 25, gramsPerTbsp: 16 },
  'almond butter':          { kcal100: 614, pro100: 21, gramsPerTbsp: 16 },
  'tahini':                 { kcal100: 595, pro100: 17, gramsPerTbsp: 15 },
  'dark chocolate 70%':     { kcal100: 598, pro100: 7.8 },
  'dark chocolate chips':   { kcal100: 480, pro100: 5 },
  'medjool dates':          { kcal100: 277, pro100: 1.8, gramsEach: 24 },
  'raisins':                { kcal100: 299, pro100: 3.1 },
  'dried cranberries':      { kcal100: 325, pro100: 0.1 },
  'dried berries':          { kcal100: 325, pro100: 0.5 },

  // ── Fruit & veg ──────────────────────────────────────────────────────────
  'banana':                 { kcal100: 89, pro100: 1.1, gramsEach: 118 }, // verified 2026-07-06
  'apple':                  { kcal100: 52, pro100: 0.3, gramsEach: 150 },
  'avocado':                { kcal100: 160, pro100: 2, gramsEach: 120 },
  'mango':                  { kcal100: 60, pro100: 0.8, gramsEach: 200 },
  'blueberries':            { kcal100: 43, pro100: 0.7 },
  'mixed berries':          { kcal100: 43, pro100: 0.7 },
  'pomegranate seeds':      { kcal100: 83, pro100: 1.7 },
  'olives':                 { kcal100: 145, pro100: 1, gramsEach: 4 },
  'lemon':                  { kcal100: 29, pro100: 1.1, gramsEach: 60 },
  'lemon juice':            { kcal100: 22, pro100: 0.4 },
  'lime juice':             { kcal100: 25, pro100: 0.4 },
  'tomatoes':               { kcal100: 18, pro100: 0.9, gramsEach: 120 },
  'cherry tomatoes':        { kcal100: 18, pro100: 0.9, gramsEach: 17 },
  'cucumber':               { kcal100: 12, pro100: 0.6, gramsEach: 300, unitGrams: { slice: 5, slices: 5 } },
  'carrot':                 { kcal100: 41, pro100: 0.9, gramsEach: 60 },
  'celery':                 { kcal100: 16, pro100: 0.7, gramsEach: 15, unitGrams: { stalk: 40, stalks: 40 } },
  'onion':                  { kcal100: 40, pro100: 1.1, gramsEach: 150 },
  'spring onion':           { kcal100: 32, pro100: 1.8, gramsEach: 15 },
  'garlic':                 { kcal100: 149, pro100: 6.4, gramsEach: 3 },
  'ginger':                 { kcal100: 80, pro100: 1.8 },
  'peppers':                { kcal100: 31, pro100: 1, gramsEach: 120 },
  'broccoli':               { kcal100: 34, pro100: 2.8 },
  'courgette':              { kcal100: 17, pro100: 1.2, gramsEach: 200 },
  'spinach':                { kcal100: 23, pro100: 2.9 },
  'baby spinach':           { kcal100: 23, pro100: 2.9 },
  'mushrooms':              { kcal100: 22, pro100: 3.1 },
  'green beans':            { kcal100: 31, pro100: 1.8 },
  'asparagus':              { kcal100: 20, pro100: 2.2 },
  'pak choi':               { kcal100: 13, pro100: 1.5 },
  'watercress':             { kcal100: 11, pro100: 2.3 },
  'lettuce':                { kcal100: 15, pro100: 1.2, gramsEach: 10 },
  'mixed leaves':           { kcal100: 15, pro100: 1.2 },
  'rocket':                 { kcal100: 25, pro100: 2.6 },
  'cabbage':                { kcal100: 25, pro100: 1.3 },
  'leek':                   { kcal100: 61, pro100: 1.5 }, // corrected 2026-07-06: was understated ~65% vs USDA/multiple sources
  'beansprouts':            { kcal100: 30, pro100: 3 },
  'frozen peas':            { kcal100: 79, pro100: 5.4 },
  'mixed veg':              { kcal100: 40, pro100: 2.2 },
  'edamame':                { kcal100: 121, pro100: 11 },
  'toast':                  { kcal100: 230, pro100: 9.5, gramsEach: 35 },

  // ── Sauces, condiments, oils & spices ────────────────────────────────────
  'olive oil':              { kcal100: 884, pro100: 0, gramsPerTbsp: 13.5, gramsPerTsp: 4.5 }, // verified 2026-07-06 (119kcal/tbsp)
  'sesame oil':             { kcal100: 884, pro100: 0, gramsPerTbsp: 13.5, gramsPerTsp: 4.5 },
  'soy sauce':              { kcal100: 60, pro100: 8 },
  'tamari':                 { kcal100: 60, pro100: 10.5 }, // corrected 2026-07-06: USDA — tamari is more protein-dense than soy sauce
  'hoisin sauce':           { kcal100: 220, pro100: 3 },
  'teriyaki sauce':         { kcal100: 90, pro100: 3 },
  'sweet chilli sauce':     { kcal100: 200, pro100: 0.5 },
  'salsa':                  { kcal100: 35, pro100: 1.2 },
  'mustard':                { kcal100: 66, pro100: 4 },
  'light mayo':             { kcal100: 265, pro100: 1 }, // corrected 2026-07-06: Hellmann's Light Mayo UK label
  'green pesto':            { kcal100: 380, pro100: 4 },
  'honey':                  { kcal100: 304, pro100: 0.3, gramsPerTsp: 7, gramsPerTbsp: 21 }, // verified 2026-07-06
  'maple syrup':            { kcal100: 260, pro100: 0.1, gramsPerTsp: 7, gramsPerTbsp: 21 },
  'balsamic glaze':         { kcal100: 250, pro100: 0.5 },
  'light dressing':         { kcal100: 50, pro100: 1 },
  'lemon dressing':         { kcal100: 90, pro100: 1.5 },
  'mustard dressing':       { kcal100: 90, pro100: 1.5 },
  'tahini dressing':        { kcal100: 235, pro100: 9 }, // corrected 2026-07-06: Al'Fez UK tahini dressing label
  'balsamic dressing':      { kcal100: 90, pro100: 0.5 },
  'plant-based dressing':   { kcal100: 90, pro100: 1.5 },
  'caesar dressing':        { kcal100: 300, pro100: 2 },
  'light caesar dressing':  { kcal100: 120, pro100: 2 },
  'mint yogurt sauce':      { kcal100: 60, pro100: 3 },
  'raita':                  { kcal100: 60, pro100: 3 },
  'curry paste':            { kcal100: 250, pro100: 5 },
  'tikka paste':            { kcal100: 250, pro100: 5 },
  'tomato curry sauce':     { kcal100: 78, pro100: 1.5 }, // corrected 2026-07-06: Sharwood's UK jarred curry sauce labels (Jalfrezi/Rogan Josh/Balti)
  'miso paste':             { kcal100: 200, pro100: 12 },
  'coconut milk':           { kcal100: 190, pro100: 2 },
  'coconut milk light':     { kcal100: 95, pro100: 1 },
  'reduced-sugar baked beans': { kcal100: 75, pro100: 5 },
  'tinned pineapple in juice': { kcal100: 60, pro100: 0.5 },
  'pancake batter':         { kcal100: 200, pro100: 7 },
  'energy balls':           { kcal100: 450, pro100: 6 },
  'vegetable stock':        { kcal100: 6, pro100: 0.3 }, // corrected 2026-07-06: Knorr/Oxo UK made-up stock labels
  'chicken stock':          { kcal100: 6, pro100: 0.4 }, // corrected 2026-07-06: consistent with Knorr/Oxo made-up stock labels
  'beef stock':             { kcal100: 7, pro100: 0.4 }, // corrected 2026-07-06: consistent with Knorr/Oxo made-up stock labels
  'water':                  { kcal100: 0, pro100: 0 },
  'garlic powder':          { kcal100: 330, pro100: 17 },
  'curry powder':           { kcal100: 300, pro100: 12 },
  'garam masala':           { kcal100: 300, pro100: 12 },
  'ras el hanout':          { kcal100: 300, pro100: 12 },
  'fajita spice':           { kcal100: 300, pro100: 10 },
  'chilli powder':          { kcal100: 300, pro100: 12 },
  'paprika':                { kcal100: 280, pro100: 14 },
  'smoked paprika':         { kcal100: 280, pro100: 14 },
  'cumin':                  { kcal100: 375, pro100: 18 },
  'turmeric':               { kcal100: 310, pro100: 8 },
  'cinnamon':               { kcal100: 250, pro100: 4 },
  'mixed herbs':            { kcal100: 300, pro100: 12 },
};

// Full macro fields layered over the legacy kcal/protein table.
//
// Primary source: UK CoFID 2021 Proximates sheet (Public Health England /
// McCance & Widdowson). Fallback/cross-check source: USDA FoodData Central for
// generic foods where CoFID has no close UK row, plus typical UK label averages
// for branded-style foods such as protein yogurt and protein powder.
//
// Values are per 100g/ml. kcal/protein stay in NUTRITION_TABLE so existing
// calorie regression checks remain stable; these fields add fat, carbohydrate
// and fibre without replacing the already-audited kcal/protein figures.
const NUTRITION_MACRO_OVERRIDES = {
  'rolled oats': { fat100: 6.5, carb100: 60, fibre100: 10.1 },
  'oat flour': { fat100: 6.5, carb100: 60, fibre100: 10 },
  'bran flakes': { fat100: 2.2, carb100: 73.3, fibre100: 12.8 },
  weetabix: { fat100: 2, carb100: 72.7, fibre100: 7.3 },
  'brown rice dry': { fat100: 1.5, carb100: 77, fibre100: 1.8 },
  'brown rice cooked': { fat100: 0.9, carb100: 23, fibre100: 1.8 },
  'arborio rice dry': { fat100: 1, carb100: 85.2, fibre100: 0.9 },
  'wholemeal pasta dry': { fat100: 2.5, carb100: 64, fibre100: 8 },
  'wholemeal pasta cooked': { fat100: 1, carb100: 24, fibre100: 3.2 },
  'orzo pasta dry': { fat100: 1.6, carb100: 75.6, fibre100: 3.7 },
  'wholewheat noodles dry': { fat100: 2, carb100: 72.6, fibre100: 3.9 },
  'soba noodles dry': { fat100: 2.7, carb100: 71, fibre100: 4 },
  'rice noodles dry': { fat100: 0.6, carb100: 80, fibre100: 1.6 },
  'quinoa dry': { fat100: 5, carb100: 55.7, fibre100: 7 },
  'quinoa cooked': { fat100: 1.9, carb100: 21.3, fibre100: 2.8 },
  'wholemeal couscous dry': { fat100: 2.1, carb100: 79.2, fibre100: 3.6 },
  'wholemeal flour': { fat100: 2.2, carb100: 61, fibre100: 10.7 },
  granola: { fat100: 15, carb100: 64, fibre100: 7 },
  'low-sugar granola': { fat100: 12, carb100: 62, fibre100: 9 },
  'sweet potato': { fat100: 0.3, carb100: 21.3, fibre100: 2.4 },
  'new potatoes': { fat100: 0.1, carb100: 16.1, fibre100: 1 },
  potato: { fat100: 0.1, carb100: 20.1, fibre100: 1.8 },
  'potato baked': { fat100: 0.1, carb100: 21.2, fibre100: 2.2 },
  parsnip: { fat100: 1.1, carb100: 12.5, fibre100: 4.6 },
  'butternut squash': { fat100: 0.1, carb100: 8.3, fibre100: 1.6 },
  cauliflower: { fat100: 0.4, carb100: 4.4, fibre100: 1.8 },
  'wholemeal bread': { fat100: 2.5, carb100: 42, fibre100: 6 },
  'sourdough bread': { fat100: 1.5, carb100: 51, fibre100: 2.8 },
  'rye bread': { fat100: 3.3, carb100: 48, fibre100: 5.8 },
  'wholemeal bagel': { fat100: 1.8, carb100: 49, fibre100: 5 },
  'wholemeal roll': { fat100: 3.3, carb100: 46.1, fibre100: 4.4 },
  'wholemeal tortilla': { fat100: 5.7, carb100: 53.9, fibre100: 1.9 },
  'wholemeal pitta': { fat100: 1.3, carb100: 55.1, fibre100: 2.4 },
  'rice cakes': { fat100: 2.8, carb100: 81, fibre100: 3.1 },
  oatcakes: { fat100: 20, carb100: 62.8, fibre100: 8.8 },
  'oat biscuits': { fat100: 19, carb100: 65, fibre100: 4 },
  'rye crackers': { fat100: 1.3, carb100: 74, fibre100: 15 },

  'semi-skimmed milk': { fat100: 1.7, carb100: 4.8, fibre100: 0 },
  'skimmed milk': { fat100: 0.1, carb100: 4.9, fibre100: 0 },
  'oat milk': { fat100: 1.5, carb100: 6.5, fibre100: 0.8 },
  'soy milk': { fat100: 1.8, carb100: 2.5, fibre100: 0.6 },
  'low-fat greek yogurt': { fat100: 2, carb100: 4, fibre100: 0 },
  '0% greek yogurt': { fat100: 0.2, carb100: 3.8, fibre100: 0 },
  'greek yogurt': { fat100: 2, carb100: 4, fibre100: 0 },
  'low-fat yogurt': { fat100: 1, carb100: 7.8, fibre100: 0 },
  'low-fat natural yogurt': { fat100: 1, carb100: 7.8, fibre100: 0 },
  'dairy-free yogurt': { fat100: 2.2, carb100: 9, fibre100: 0.5 },
  'high-protein yogurt pot': { fat100: 0.3, carb100: 5.5, fibre100: 0 },
  'protein yogurt': { fat100: 0.3, carb100: 5.5, fibre100: 0 },
  skyr: { fat100: 0.2, carb100: 4, fibre100: 0 },
  'plain kefir': { fat100: 1.5, carb100: 4.7, fibre100: 0 },
  'cottage cheese': { fat100: 4.3, carb100: 3.4, fibre100: 0 },
  'low-fat cottage cheese': { fat100: 1.5, carb100: 3.3, fibre100: 0 },
  'reduced-fat cheddar': { fat100: 18, carb100: 0.8, fibre100: 0 },
  parmesan: { fat100: 29.7, carb100: 0.9, fibre100: 0 },
  halloumi: { fat100: 23.5, carb100: 1.7, fibre100: 0 },
  'reduced-fat halloumi': { fat100: 16, carb100: 2, fibre100: 0 },
  'light cream cheese': { fat100: 11, carb100: 5, fibre100: 0 },
  'ricotta cheese': { fat100: 11, carb100: 2, fibre100: 0 },
  'light mozzarella': { fat100: 12, carb100: 1.5, fibre100: 0 },
  'buffalo mozzarella': { fat100: 20.3, carb100: 0, fibre100: 0 },
  'reduced-fat feta': { fat100: 13, carb100: 1.5, fibre100: 0 },
  'low-fat paneer': { fat100: 15, carb100: 1, fibre100: 0 },
  'low-fat crème fraîche': { fat100: 15, carb100: 4.4, fibre100: 0 },
  butter: { fat100: 82.2, carb100: 0.6, fibre100: 0 },
  egg: { fat100: 9.5, carb100: 0.7, fibre100: 0 },
  'egg white': { fat100: 0, carb100: 0, fibre100: 0 },
  'egg yolk': { fat100: 31.3, carb100: 0, fibre100: 0 },

  'chicken breast': { fat100: 2.6, carb100: 0, fibre100: 0 },
  'chicken breast cooked': { fat100: 3.6, carb100: 0, fibre100: 0 },
  'chicken thighs': { fat100: 3.9, carb100: 0, fibre100: 0 },
  'chicken tikka': { fat100: 6, carb100: 2.5, fibre100: 0.5 },
  'turkey mince lean': { fat100: 4.2, carb100: 0, fibre100: 0 },
  'turkey breast slices': { fat100: 1.9, carb100: 1.2, fibre100: 0 },
  'turkey breast': { fat100: 0.8, carb100: 0, fibre100: 0 },
  'turkey sausages': { fat100: 10, carb100: 4, fibre100: 0.5 },
  'turkey rashers': { fat100: 2.5, carb100: 1.5, fibre100: 0 },
  'turkey patty': { fat100: 8, carb100: 3, fibre100: 0.5 },
  'lean beef mince': { fat100: 4.2, carb100: 0, fibre100: 0 },
  'lean beef strips': { fat100: 6, carb100: 0, fibre100: 0 },
  'lean sirloin steak': { fat100: 5.8, carb100: 0, fibre100: 0 },
  'lean stewing beef': { fat100: 6.5, carb100: 0, fibre100: 0 },
  steak: { fat100: 5.2, carb100: 0, fibre100: 0 },
  'lean beef jerky': { fat100: 11, carb100: 34, fibre100: 1.8 },
  'lean lamb mince': { fat100: 12, carb100: 0, fibre100: 0 },
  'lean lamb shoulder': { fat100: 12, carb100: 0, fibre100: 0 },
  'pork tenderloin': { fat100: 2.7, carb100: 0, fibre100: 0 },
  'pork loin': { fat100: 5, carb100: 0, fibre100: 0 },
  'back bacon rashers': { fat100: 13, carb100: 0, fibre100: 0 },
  'lean bacon rashers': { fat100: 13, carb100: 0, fibre100: 0 },
  'salmon fillet': { fat100: 13, carb100: 0, fibre100: 0 },
  'smoked salmon': { fat100: 9, carb100: 0, fibre100: 0 },
  'smoked mackerel fillet': { fat100: 24, carb100: 0, fibre100: 0 },
  'mackerel fillet': { fat100: 13.9, carb100: 0, fibre100: 0 },
  'tinned mackerel in brine': { fat100: 12, carb100: 0, fibre100: 0 },
  'tinned sardines': { fat100: 9, carb100: 0, fibre100: 0 },
  'smoked haddock fillet': { fat100: 0.6, carb100: 0, fibre100: 0 },
  'cod fillet': { fat100: 0.7, carb100: 0, fibre100: 0 },
  'tuna steak': { fat100: 1, carb100: 0, fibre100: 0 },
  'tinned tuna in spring water': { fat100: 1, carb100: 0, fibre100: 0 },
  'king prawns': { fat100: 0.9, carb100: 0, fibre100: 0 },
  'quorn mince': { fat100: 2, carb100: 7.5, fibre100: 5.5 },
  falafel: { fat100: 13, carb100: 20, fibre100: 5 },
  'firm tofu': { fat100: 8.5, carb100: 2, fibre100: 1 },
  'silken tofu': { fat100: 3, carb100: 1.5, fibre100: 0.5 },
  'nutritional yeast': { fat100: 5, carb100: 26, fibre100: 20 },
  'protein powder': { fat100: 6, carb100: 8, fibre100: 2 },
  'pea protein powder': { fat100: 6, carb100: 6, fibre100: 3 },
  hummus: { fat100: 9.6, carb100: 14.3, fibre100: 6 },
  'tinned chickpeas': { fat100: 2.3, carb100: 16.8, fibre100: 4.4 },
  'kidney beans': { fat100: 0.6, carb100: 14, fibre100: 6 },
  'black beans': { fat100: 0.5, carb100: 16.5, fibre100: 6.9 },
  'cannellini beans': { fat100: 0.5, carb100: 15.5, fibre100: 6.3 },
  'mixed beans': { fat100: 0.6, carb100: 15, fibre100: 6 },
  'edamame beans': { fat100: 5.2, carb100: 8.9, fibre100: 5.2 },
  'red lentils dry': { fat100: 1.1, carb100: 52.7, fibre100: 10.7 },
  'green lentils dry': { fat100: 1.1, carb100: 52.7, fibre100: 10.7 },
  'lentils cooked': { fat100: 0.4, carb100: 15.8, fibre100: 7.9 },
  sweetcorn: { fat100: 1.2, carb100: 18.4, fibre100: 2.4 },
  'nut roast': { fat100: 12, carb100: 18, fibre100: 4 },

  almonds: { fat100: 49.9, carb100: 5.3, fibre100: 7.4 },
  walnuts: { fat100: 65, carb100: 7, fibre100: 6.7 },
  peanuts: { fat100: 49, carb100: 12, fibre100: 8.5 },
  'mixed nuts': { fat100: 55, carb100: 12, fibre100: 8 },
  'mixed seeds': { fat100: 47, carb100: 18, fibre100: 9 },
  'pumpkin seeds': { fat100: 49, carb100: 11, fibre100: 6 },
  'sesame seeds': { fat100: 50, carb100: 12, fibre100: 12 },
  'chia seeds': { fat100: 31, carb100: 7.7, fibre100: 34 },
  'hemp seeds': { fat100: 49, carb100: 8.7, fibre100: 4 },
  'peanut butter': { fat100: 50, carb100: 20, fibre100: 6 },
  'almond butter': { fat100: 56, carb100: 19, fibre100: 10 },
  tahini: { fat100: 54, carb100: 17, fibre100: 9 },
  'dark chocolate 70%': { fat100: 43, carb100: 34, fibre100: 11 },
  'dark chocolate chips': { fat100: 25, carb100: 63, fibre100: 7 },
  'medjool dates': { fat100: 0.2, carb100: 75, fibre100: 6.7 },
  raisins: { fat100: 0.5, carb100: 79, fibre100: 3.7 },
  'dried cranberries': { fat100: 1, carb100: 82, fibre100: 5 },
  'dried berries': { fat100: 1, carb100: 80, fibre100: 6 },

  banana: { fat100: 0.3, carb100: 22.8, fibre100: 2.6 },
  apple: { fat100: 0.2, carb100: 14, fibre100: 2.4 },
  avocado: { fat100: 14.7, carb100: 1.9, fibre100: 6.7 },
  mango: { fat100: 0.4, carb100: 15, fibre100: 1.6 },
  blueberries: { fat100: 0.3, carb100: 9.1, fibre100: 2.4 },
  'mixed berries': { fat100: 0.4, carb100: 10, fibre100: 2.5 },
  'pomegranate seeds': { fat100: 1.2, carb100: 18.7, fibre100: 4 },
  olives: { fat100: 15, carb100: 3.8, fibre100: 3.3 },
  lemon: { fat100: 0.3, carb100: 9.3, fibre100: 2.8 },
  'lemon juice': { fat100: 0.2, carb100: 6.9, fibre100: 0.3 },
  'lime juice': { fat100: 0.1, carb100: 8.4, fibre100: 0.4 },
  tomatoes: { fat100: 0.2, carb100: 3.9, fibre100: 1.2 },
  'cherry tomatoes': { fat100: 0.2, carb100: 3.9, fibre100: 1.2 },
  cucumber: { fat100: 0.1, carb100: 2.2, fibre100: 0.7 },
  carrot: { fat100: 0.2, carb100: 10, fibre100: 2.8 },
  celery: { fat100: 0.2, carb100: 3, fibre100: 1.6 },
  onion: { fat100: 0.1, carb100: 9.3, fibre100: 1.7 },
  'spring onion': { fat100: 0.2, carb100: 7.3, fibre100: 2.6 },
  garlic: { fat100: 0.5, carb100: 33, fibre100: 2.1 },
  ginger: { fat100: 0.8, carb100: 17.8, fibre100: 2 },
  peppers: { fat100: 0.3, carb100: 6, fibre100: 2.1 },
  broccoli: { fat100: 0.4, carb100: 6.6, fibre100: 2.6 },
  courgette: { fat100: 0.3, carb100: 3.1, fibre100: 1 },
  spinach: { fat100: 0.4, carb100: 3.6, fibre100: 2.2 },
  'baby spinach': { fat100: 0.4, carb100: 3.6, fibre100: 2.2 },
  mushrooms: { fat100: 0.3, carb100: 3.3, fibre100: 1 },
  'green beans': { fat100: 0.2, carb100: 7, fibre100: 3.4 },
  asparagus: { fat100: 0.1, carb100: 3.9, fibre100: 2.1 },
  'pak choi': { fat100: 0.2, carb100: 2.2, fibre100: 1 },
  watercress: { fat100: 0.1, carb100: 1.3, fibre100: 0.5 },
  lettuce: { fat100: 0.2, carb100: 2.9, fibre100: 1.3 },
  'mixed leaves': { fat100: 0.2, carb100: 2.5, fibre100: 1.5 },
  rocket: { fat100: 0.7, carb100: 3.7, fibre100: 1.6 },
  cabbage: { fat100: 0.1, carb100: 5.8, fibre100: 2.5 },
  leek: { fat100: 0.3, carb100: 14.2, fibre100: 1.8 },
  beansprouts: { fat100: 0.2, carb100: 5.9, fibre100: 1.8 },
  'frozen peas': { fat100: 0.7, carb100: 10.7, fibre100: 3.9 },
  'mixed veg': { fat100: 0.4, carb100: 7, fibre100: 2.8 },
  edamame: { fat100: 5.2, carb100: 8.9, fibre100: 5.2 },
  toast: { fat100: 2.5, carb100: 42, fibre100: 6 },

  'olive oil': { fat100: 100, carb100: 0, fibre100: 0 },
  'sesame oil': { fat100: 100, carb100: 0, fibre100: 0 },
  'soy sauce': { fat100: 0.1, carb100: 5.6, fibre100: 0.8 },
  tamari: { fat100: 0.1, carb100: 5.6, fibre100: 0.8 },
  'hoisin sauce': { fat100: 3, carb100: 44, fibre100: 1.5 },
  'teriyaki sauce': { fat100: 0.3, carb100: 18, fibre100: 0.3 },
  'sweet chilli sauce': { fat100: 0, carb100: 50, fibre100: 0.5 },
  salsa: { fat100: 0.2, carb100: 7, fibre100: 1.5 },
  mustard: { fat100: 3.3, carb100: 6, fibre100: 4 },
  'light mayo': { fat100: 25, carb100: 8, fibre100: 0 },
  'green pesto': { fat100: 35, carb100: 6, fibre100: 2 },
  honey: { fat100: 0, carb100: 82, fibre100: 0 },
  'maple syrup': { fat100: 0, carb100: 67, fibre100: 0 },
  'balsamic glaze': { fat100: 0.5, carb100: 55, fibre100: 0 },
  'light dressing': { fat100: 2, carb100: 7, fibre100: 0 },
  'lemon dressing': { fat100: 6, carb100: 6, fibre100: 0 },
  'mustard dressing': { fat100: 6, carb100: 6, fibre100: 0 },
  'tahini dressing': { fat100: 19, carb100: 9, fibre100: 2 },
  'balsamic dressing': { fat100: 6, carb100: 7, fibre100: 0 },
  'plant-based dressing': { fat100: 6, carb100: 7, fibre100: 0 },
  'caesar dressing': { fat100: 30, carb100: 4, fibre100: 0 },
  'light caesar dressing': { fat100: 9, carb100: 8, fibre100: 0 },
  'mint yogurt sauce': { fat100: 2, carb100: 5, fibre100: 0 },
  raita: { fat100: 2, carb100: 5, fibre100: 0 },
  'curry paste': { fat100: 21.3, carb100: 11.3, fibre100: 3 },
  'tikka paste': { fat100: 21, carb100: 12, fibre100: 3 },
  'tomato curry sauce': { fat100: 3, carb100: 10, fibre100: 1.5 },
  'miso paste': { fat100: 6, carb100: 26, fibre100: 5 },
  'coconut milk': { fat100: 19, carb100: 3, fibre100: 0.5 },
  'coconut milk light': { fat100: 9, carb100: 2.8, fibre100: 0.3 },
  'reduced-sugar baked beans': { fat100: 0.4, carb100: 12, fibre100: 4.2 },
  'tinned pineapple in juice': { fat100: 0.1, carb100: 14.7, fibre100: 1.2 },
  'pancake batter': { fat100: 5, carb100: 32, fibre100: 1 },
  'energy balls': { fat100: 18, carb100: 60, fibre100: 6 },
  'vegetable stock': { fat100: 0, carb100: 0.8, fibre100: 0 },
  'chicken stock': { fat100: 0, carb100: 0.8, fibre100: 0 },
  'beef stock': { fat100: 0, carb100: 0.9, fibre100: 0 },
  water: { fat100: 0, carb100: 0, fibre100: 0 },
  'garlic powder': { fat100: 0.7, carb100: 73, fibre100: 9 },
  'curry powder': { fat100: 14, carb100: 56, fibre100: 33 },
  'garam masala': { fat100: 12, carb100: 55, fibre100: 25 },
  'ras el hanout': { fat100: 12, carb100: 55, fibre100: 25 },
  'fajita spice': { fat100: 8, carb100: 60, fibre100: 18 },
  'chilli powder': { fat100: 14, carb100: 50, fibre100: 35 },
  paprika: { fat100: 13, carb100: 54, fibre100: 35 },
  'smoked paprika': { fat100: 13, carb100: 54, fibre100: 35 },
  cumin: { fat100: 22, carb100: 44, fibre100: 11 },
  turmeric: { fat100: 3.3, carb100: 67, fibre100: 22.7 },
  cinnamon: { fat100: 1.2, carb100: 80, fibre100: 53 },
  'mixed herbs': { fat100: 7, carb100: 50, fibre100: 37 },
};

// Raw parsed ingredient names (see src/utils/ingredientParser.js) mapped to a
// NUTRITION_TABLE key. Keyed as "name" or "name|qualifier" — a qualifier-
// specific entry is tried first, then the bare name.
export const NUTRITION_SYNONYMS = {
  'oats': 'rolled oats',
  'oat flour': 'oat flour',
  'bran flakes': 'bran flakes',
  'weetabix': 'weetabix',
  'brown rice|dry': 'brown rice dry',
  'brown rice|cooked': 'brown rice cooked',
  'brown rice': 'brown rice dry',
  'arborio rice': 'arborio rice dry',
  'wholemeal pasta|dry': 'wholemeal pasta dry',
  'wholemeal pasta|cooked': 'wholemeal pasta cooked',
  'wholemeal pasta': 'wholemeal pasta dry',
  'wholemeal spaghetti': 'wholemeal pasta dry',
  'orzo pasta': 'orzo pasta dry',
  'wholewheat noodles': 'wholewheat noodles dry',
  'soba noodles': 'soba noodles dry',
  'rice noodles': 'rice noodles dry',
  'quinoa|cooked': 'quinoa cooked',
  'quinoa': 'quinoa dry',
  'wholemeal couscous': 'wholemeal couscous dry',
  'wholemeal flour': 'wholemeal flour',
  'granola': 'granola',
  'low-sugar granola': 'low-sugar granola',
  'sweet potato': 'sweet potato',
  'sweet potato mash': 'sweet potato',
  'new potatoes': 'new potatoes',
  'white potatoes': 'potato',
  'baking potato': 'potato',
  'potato|baked': 'potato baked',
  'baked potato': 'potato baked',
  'potato': 'potato',
  'parsnip': 'parsnip', 'parsnips': 'parsnip',
  'butternut squash': 'butternut squash',
  'cauliflower': 'cauliflower', 'cauliflower rice': 'cauliflower',
  'wholemeal bread': 'wholemeal bread',
  'slice wholemeal bread': 'wholemeal bread',
  'slice wholemeal toast': 'wholemeal bread',
  'slices wholemeal toast': 'wholemeal bread',
  'toast': 'toast',
  'sourdough bread': 'sourdough bread',
  'rye bread': 'rye bread',
  'wholemeal bagel': 'wholemeal bagel',
  'wholemeal roll': 'wholemeal roll',
  'small roll': 'wholemeal roll',
  'wholemeal bun': 'wholemeal roll',
  'wholemeal tortilla': 'wholemeal tortilla',
  'wholemeal wrap': 'wholemeal tortilla',
  'small tortillas': 'wholemeal tortilla',
  'small wholemeal tortillas': 'wholemeal tortilla',
  'wholemeal pitta': 'wholemeal pitta',
  'rice cakes': 'rice cakes',
  'oatcakes': 'oatcakes',
  'oat biscuits': 'oat biscuits',
  'rye crackers': 'rye crackers',

  'semi-skimmed milk': 'semi-skimmed milk',
  'skimmed milk': 'skimmed milk',
  'oat milk': 'oat milk',
  'soy milk': 'soy milk',
  'low-fat greek yogurt': 'low-fat greek yogurt',
  '0% greek yogurt': '0% greek yogurt',
  'greek yogurt': 'greek yogurt',
  'low-fat yogurt': 'low-fat yogurt',
  'low-fat natural yogurt': 'low-fat natural yogurt',
  'dairy-free yogurt': 'dairy-free yogurt',
  'high-protein yogurt pot': 'high-protein yogurt pot',
  'protein yogurt': 'protein yogurt',
  'skyr': 'skyr',
  'plain kefir': 'plain kefir',
  'cottage cheese': 'cottage cheese',
  'low-fat cottage cheese': 'low-fat cottage cheese',
  'reduced-fat cheddar': 'reduced-fat cheddar',
  'cheddar reduced-fat': 'reduced-fat cheddar',
  'parmesan': 'parmesan',
  'halloumi': 'halloumi',
  'reduced-fat halloumi': 'reduced-fat halloumi',
  'light cream cheese': 'light cream cheese',
  'ricotta cheese': 'ricotta cheese', 'ricotta': 'ricotta cheese',
  'light mozzarella': 'light mozzarella',
  'buffalo mozzarella': 'buffalo mozzarella',
  'reduced-fat feta': 'reduced-fat feta',
  'low-fat paneer': 'low-fat paneer',
  'low-fat crème fraîche': 'low-fat crème fraîche',
  'reduced-fat crème fraîche': 'low-fat crème fraîche',
  'butter': 'butter',
  'eggs': 'egg', 'egg': 'egg',
  'egg whites': 'egg white', 'egg white': 'egg white', 'whites': 'egg white',
  'yolk': 'egg yolk', 'egg yolk': 'egg yolk',

  'chicken breast': 'chicken breast',
  'chicken breast|cooked': 'chicken breast cooked',
  'skinless chicken breast': 'chicken breast',
  'chicken thighs': 'chicken thighs',
  'chicken tikka': 'chicken tikka',
  'turkey mince lean': 'turkey mince lean', 'turkey mince': 'turkey mince lean',
  'turkey breast slices': 'turkey breast slices',
  'turkey breast': 'turkey breast',
  'turkey sausages': 'turkey sausages',
  'turkey rashers': 'turkey rashers',
  'turkey patty': 'turkey patty',
  'lean beef mince': 'lean beef mince',
  'lean beef strips': 'lean beef strips',
  'lean sirloin steak': 'lean sirloin steak',
  'lean stewing beef': 'lean stewing beef',
  'steak': 'steak', 'sliced steak': 'steak',
  'lean beef jerky': 'lean beef jerky',
  'lean lamb mince': 'lean lamb mince',
  'lean lamb shoulder': 'lean lamb shoulder',
  'pork tenderloin': 'pork tenderloin',
  'pork loin': 'pork loin',
  'back bacon rashers': 'back bacon rashers',
  'lean bacon rashers': 'lean bacon rashers',
  'salmon fillet': 'salmon fillet',
  'smoked salmon': 'smoked salmon',
  'smoked mackerel fillet': 'smoked mackerel fillet',
  'mackerel fillet': 'mackerel fillet',
  'tinned mackerel in brine': 'tinned mackerel in brine',
  'tinned sardines': 'tinned sardines',
  'tinned sardines in spring water': 'tinned sardines',
  'smoked haddock fillet': 'smoked haddock fillet',
  'cod fillet': 'cod fillet',
  'tuna steak': 'tuna steak',
  'tinned tuna in spring water': 'tinned tuna in spring water',
  'tinned tuna': 'tinned tuna in spring water',
  'tins tuna': 'tinned tuna in spring water',
  'king prawns': 'king prawns',
  'quorn mince': 'quorn mince',
  'falafel': 'falafel',
  'firm tofu': 'firm tofu', 'baked tofu': 'firm tofu', 'tofu': 'firm tofu',
  'silken tofu': 'silken tofu',
  'nutritional yeast': 'nutritional yeast',
  'protein powder': 'protein powder',
  'whey protein powder': 'protein powder', 'whey protein': 'protein powder',
  'plant protein powder': 'pea protein powder', 'pea protein powder': 'pea protein powder',
  'hummus': 'hummus',
  'tinned chickpeas': 'tinned chickpeas', 'chickpeas': 'tinned chickpeas',
  'kidney beans': 'kidney beans', 'kidney beans tinned': 'kidney beans',
  'black beans': 'black beans', 'black beans tinned': 'black beans',
  'cannellini beans': 'cannellini beans', 'cannellini beans tinned': 'cannellini beans',
  'mixed beans': 'mixed beans', 'mixed beans tinned': 'mixed beans',
  'edamame beans': 'edamame beans', 'frozen edamame beans': 'edamame beans', 'edamame pods': 'edamame beans',
  'red lentils|dry': 'red lentils dry', 'red lentils': 'red lentils dry',
  'green lentils|dry': 'green lentils dry', 'green lentils': 'green lentils dry',
  'green lentils tinned': 'lentils cooked',
  'lentils|cooked': 'lentils cooked', 'cooked lentils': 'lentils cooked', 'lentils': 'lentils cooked',
  'sweetcorn': 'sweetcorn',
  'nut roast': 'nut roast',

  'almonds': 'almonds',
  'walnuts': 'walnuts', 'crushed walnuts': 'walnuts',
  'peanuts': 'peanuts',
  'mixed nuts': 'mixed nuts',
  'mixed seeds': 'mixed seeds',
  'pumpkin seeds': 'pumpkin seeds',
  'sesame seeds': 'sesame seeds',
  'chia seeds': 'chia seeds',
  'hemp seeds': 'hemp seeds',
  'peanut butter': 'peanut butter',
  'almond butter': 'almond butter',
  'tahini': 'tahini',
  'dark chocolate 70%': 'dark chocolate 70%',
  'dark chocolate chips': 'dark chocolate chips',
  'medjool dates': 'medjool dates',
  'raisins': 'raisins',
  'dried cranberries': 'dried cranberries',
  'dried berries': 'dried berries', 'dried blueberries': 'dried berries',

  'banana': 'banana',
  'apple': 'apple',
  'avocado': 'avocado', '½ avocado': 'avocado', 'half avocado': 'avocado',
  'mango': 'mango', 'mango chunks': 'mango',
  'blueberries': 'blueberries',
  'mixed berries': 'mixed berries', 'berries': 'mixed berries',
  'frozen berries': 'mixed berries', 'frozen mixed berries': 'mixed berries',
  'pomegranate seeds': 'pomegranate seeds',
  'olives': 'olives',
  'lemon': 'lemon',
  'lemon juice': 'lemon juice',
  'lime juice': 'lime juice',
  'tomatoes': 'tomatoes', 'tomato': 'tomatoes',
  'tinned tomatoes': 'tomatoes', 'beef tomato': 'tomatoes', 'roasted tomatoes': 'tomatoes',
  'cherry tomatoes': 'cherry tomatoes',
  'cucumber': 'cucumber', 'cucumber slices': 'cucumber',
  'carrot': 'carrot', 'carrots': 'carrot', 'carrot sticks': 'carrot', 'carrot grated': 'carrot',
  'celery': 'celery', 'celery sticks': 'celery',
  'onion': 'onion', 'red onion': 'onion',
  'spring onion': 'spring onion',
  'garlic': 'garlic', 'garlic clove': 'garlic',
  'ginger': 'ginger',
  'peppers': 'peppers', 'red pepper': 'peppers', 'mixed peppers': 'peppers', 'roasted peppers': 'peppers',
  'broccoli': 'broccoli',
  'courgette': 'courgette',
  'spinach': 'spinach', 'wilted spinach': 'spinach',
  'baby spinach': 'baby spinach',
  'mushrooms': 'mushrooms', 'mixed mushrooms': 'mushrooms',
  'green beans': 'green beans',
  'asparagus': 'asparagus',
  'pak choi': 'pak choi',
  'watercress': 'watercress',
  'lettuce': 'lettuce', 'romaine lettuce': 'lettuce', 'romaine lettuce leaves': 'lettuce',
  'mixed leaves': 'mixed leaves', 'salad leaves and tomato': 'mixed leaves',
  'rocket': 'rocket',
  'cabbage': 'cabbage', 'shredded cabbage': 'cabbage',
  'leek': 'leek',
  'beansprouts': 'beansprouts',
  'frozen peas': 'frozen peas', 'peas': 'frozen peas',
  'mixed veg': 'mixed veg', 'frozen mixed veg': 'mixed veg', 'mixed frozen veg': 'mixed veg',
  'roasted mixed veg': 'mixed veg', 'roasted veg': 'mixed veg', 'veg': 'mixed veg',
  'frozen stir-fry veg': 'mixed veg',
  'edamame': 'edamame',

  'olive oil': 'olive oil', 'olive oil spray': 'olive oil',
  'sesame oil': 'sesame oil',
  'soy sauce': 'soy sauce',
  'tamari': 'tamari',
  'hoisin sauce': 'hoisin sauce',
  'teriyaki sauce': 'teriyaki sauce',
  'sweet chilli sauce': 'sweet chilli sauce',
  'salsa': 'salsa',
  'mustard': 'mustard',
  'light mayo': 'light mayo',
  'green pesto': 'green pesto',
  'honey': 'honey',
  'maple syrup': 'maple syrup',
  'balsamic glaze': 'balsamic glaze',
  'light dressing': 'light dressing', 'plant-based dressing': 'plant-based dressing',
  'lemon dressing': 'lemon dressing',
  'mustard dressing': 'mustard dressing',
  'tahini dressing': 'tahini dressing',
  'balsamic dressing': 'balsamic dressing',
  'caesar dressing': 'caesar dressing',
  'light caesar dressing': 'light caesar dressing',
  'mint yogurt sauce': 'mint yogurt sauce',
  'raita': 'raita',
  'curry paste': 'curry paste',
  'tikka paste': 'tikka paste',
  'tomato curry sauce': 'tomato curry sauce',
  'miso paste': 'miso paste',
  'coconut milk': 'coconut milk', 'tinned coconut milk light': 'coconut milk light',
  'coconut milk light': 'coconut milk light',
  'reduced-sugar baked beans': 'reduced-sugar baked beans',
  'tinned pineapple in juice': 'tinned pineapple in juice',
  'pancake batter': 'pancake batter',
  'energy balls': 'energy balls',
  'vegetable stock': 'vegetable stock',
  'chicken stock': 'chicken stock',
  'beef stock': 'beef stock',
  'water': 'water',
  'garlic powder': 'garlic powder',
  'curry powder': 'curry powder',
  'garam masala': 'garam masala',
  'ras el hanout': 'ras el hanout',
  'fajita spice': 'fajita spice',
  'chilli powder': 'chilli powder',
  'paprika': 'paprika',
  'smoked paprika': 'smoked paprika',
  'cumin': 'cumin',
  'turmeric': 'turmeric',
  'cinnamon': 'cinnamon',
  'mixed herbs': 'mixed herbs',
  'dill': 'mixed herbs', 'mint': 'mixed herbs', 'rosemary': 'mixed herbs', 'thyme': 'mixed herbs',
  'basil': 'mixed herbs', 'parsley': 'mixed herbs', 'coriander': 'mixed herbs',
};

const NEGLIGIBLE_ESTIMATE = { kcal: 3, protein: 0, carbs: 0, fats: 0, fibre: 0 };
const UNIT_TO_GRAMS = { g: 1, kg: 1000, ml: 1, l: 1000, tbsp: 15, tsp: 5 };

function lookupEntry(name, qualifier) {
  const key = (qualifier && NUTRITION_SYNONYMS[`${name}|${qualifier}`])
    || NUTRITION_SYNONYMS[name]
    || (NUTRITION_TABLE[name] ? name : null);
  return key ? completeNutritionEntry(key, NUTRITION_TABLE[key]) : null;
}

function completeNutritionEntry(key, entry) {
  if (!entry) return null;
  const override = NUTRITION_MACRO_OVERRIDES[key] || {};
  const fallback = inferMissingMacros(key, entry, override);

  return {
    ...entry,
    fat100: numberOr(override.fat100, fallback.fat100),
    carb100: numberOr(override.carb100, fallback.carb100),
    fibre100: numberOr(override.fibre100, fallback.fibre100),
  };
}

function numberOr(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}

function inferMissingMacros(key, entry, override) {
  const kcal = Number(entry.kcal100 || 0);
  const protein = Number(entry.pro100 || 0);
  const keyText = String(key || '').toLowerCase();

  if (Number.isFinite(override.fat100) && Number.isFinite(override.carb100)) {
    return {
      fat100: override.fat100,
      carb100: override.carb100,
      fibre100: Number.isFinite(override.fibre100) ? override.fibre100 : 0,
    };
  }

  if (
    keyText.includes('oil') ||
    keyText.includes('butter') ||
    keyText.includes('ghee')
  ) {
    return { fat100: round1(kcal / 9), carb100: 0, fibre100: 0 };
  }

  if (isZeroCarbProtein(keyText)) {
    return {
      fat100: round1(Math.max(0, (kcal - protein * 4) / 9)),
      carb100: 0,
      fibre100: 0,
    };
  }

  const assumedFat = Number.isFinite(override.fat100)
    ? override.fat100
    : inferDefaultFat(keyText);
  const carbs = Math.max(0, (kcal - (protein * 4) - (assumedFat * 9)) / 4);

  return {
    fat100: round1(assumedFat),
    carb100: round1(carbs),
    fibre100: Number.isFinite(override.fibre100) ? override.fibre100 : 0,
  };
}

function isZeroCarbProtein(keyText) {
  return [
    'chicken', 'turkey', 'beef', 'steak', 'lamb', 'pork', 'bacon',
    'salmon', 'mackerel', 'sardine', 'haddock', 'cod', 'tuna', 'prawn',
    'egg white', 'egg yolk',
  ].some(term => keyText.includes(term));
}

function inferDefaultFat(keyText) {
  if (keyText.includes('nut') || keyText.includes('seed') || keyText.includes('tahini')) return 45;
  if (keyText.includes('cheese') || keyText.includes('halloumi') || keyText.includes('paneer')) return 12;
  if (keyText.includes('yogurt') || keyText.includes('milk') || keyText.includes('skyr')) return 1;
  if (keyText.includes('sauce') || keyText.includes('dressing') || keyText.includes('paste')) return 5;
  if (keyText.includes('bread') || keyText.includes('pasta') || keyText.includes('rice') || keyText.includes('oat')) return 2;
  return 1;
}

function round1(value) {
  return Math.round(Number(value || 0) * 10) / 10;
}

// Computes calories and macros for a single parsed ingredient (see
// parseIngredientLine in src/utils/ingredientParser.js). `matched: false`
// means no nutrition-table entry was found — callers should surface these
// rather than silently treating them as zero-calorie.
export function computeIngredientNutrition(parsed) {
  if (parsed.kind === 'negligible') {
    return { ...NEGLIGIBLE_ESTIMATE, matched: true };
  }
  if (parsed.kind === 'unparsed' || !parsed.name) {
    return { kcal: 0, protein: 0, carbs: 0, fats: 0, fibre: 0, matched: false };
  }

  const entry = lookupEntry(parsed.name, parsed.qualifier);
  if (!entry) return { kcal: 0, protein: 0, carbs: 0, fats: 0, fibre: 0, matched: false };

  let grams = null;
  if (parsed.kind === 'measured') {
    if (parsed.unit === 'tbsp' && entry.gramsPerTbsp) grams = parsed.qty * entry.gramsPerTbsp;
    else if (parsed.unit === 'tsp' && entry.gramsPerTsp) grams = parsed.qty * entry.gramsPerTsp;
    else grams = parsed.qty * (UNIT_TO_GRAMS[parsed.unit] ?? 1);
  } else if (parsed.kind === 'count' || parsed.kind === 'fraction') {
    const gramsEach = entry.unitGrams?.[parsed.unit] ?? entry.gramsEach;
    if (gramsEach) grams = parsed.qty * gramsEach;
  }

  if (grams === null) return { kcal: 0, protein: 0, carbs: 0, fats: 0, fibre: 0, matched: false };

  return {
    kcal: (entry.kcal100 * grams) / 100,
    protein: (entry.pro100 * grams) / 100,
    carbs: (entry.carb100 * grams) / 100,
    fats: (entry.fat100 * grams) / 100,
    fibre: (entry.fibre100 * grams) / 100,
    matched: true,
  };
}
