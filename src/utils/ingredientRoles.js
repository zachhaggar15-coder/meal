// Centralised ingredient-role classification for recipe method generation.
//
// Before this module, each branch in recipeQuality.js re-derived "what kind
// of thing is this ingredient" with its own regex — a starch list here, a
// protein list there, a "tinned" check in a third place. That duplication
// is exactly how gaps happened silently: cod/haddock/mackerel were simply
// absent from the protein list nobody thought to check twice, and "rice
// cakes" matched the starch keyword "rice" because nothing centrally
// excluded it.
//
// This module does not add a full culinary ontology and does not attach
// role metadata to the 169 meals — it centralises the DETECTION logic that
// recipeQuality.js branches already needed, using the ingredient's own
// canonical name/qualifier from ingredientParser.js rather than new guesses.
// Vegetable/aromatic/sauce/seasoning matching still lives in
// recipeQuality.js per-branch — see the audit report for why those were
// left alone in this pass.

// ── Protein (meat, poultry, fish, seafood, egg, meat-alternative) ─────────
//
// Canonical protein families with their known text aliases. Centralises
// what was `proteinCandidates` + the protein portion of `INGREDIENT_ALIASES`
// in recipeQuality.js. Order matters: it's the priority a meal name/
// ingredient list is checked in when more than one protein-like word is
// present (e.g. "Chicken and Lentil Stew" resolves to chicken, not lentil).
export const PROTEIN_FAMILIES = [
  ['chicken', ['chicken']],
  ['turkey', ['turkey']],
  ['beef', ['beef', 'steak', 'sirloin', 'mince']],
  ['lamb', ['lamb']],
  ['pork', ['pork', 'bacon', 'gammon']],
  ['salmon', ['salmon']],
  ['tuna', ['tuna']],
  ['cod', ['cod']],
  ['haddock', ['haddock']],
  ['mackerel', ['mackerel']],
  ['sardine', ['sardine', 'sardines']],
  ['prawns', ['prawn']],
  ['tofu', ['tofu']],
  ['halloumi', ['halloumi']],
  ['paneer', ['paneer']],
  ['quorn', ['quorn']],
  ['falafel', ['falafel']],
  ['eggs', ['egg']],
  // Pulses can still act as the named protein of a meat-free dish (e.g.
  // "Red Lentil Dahl"), but — unlike the families above — they need
  // state-aware handling (see PULSE_STATE below): a dry pulse needs real
  // cooking, a tinned one does not, and neither should ever be "browned"
  // the way mince is.
  ['lentils', ['lentil']],
  ['beans', ['bean']],
  ['chickpeas', ['chickpea']],
];

export const PULSE_PROTEIN_FAMILIES = new Set(['lentils', 'beans', 'chickpeas']);
export function isPulseProteinFamily(family) {
  return PULSE_PROTEIN_FAMILIES.has(family);
}

// Which protein a dish's METHOD revolves around — the thing that gets browned,
// baked or simmered. A narrower question than "what protein is in this", and
// the answer drives real instructions, so a wrong one is not cosmetic.
//
// It used to be answered by its own keyword list, which read `steak` and
// `mince` as beef. Everything the protein-diversity work found wrong with that
// list was equally wrong here, and here it reached the page as cooking advice:
//
//   beef tomato      -> beef  -> a mozzarella and tomato salad fried in a pan
//   cauliflower steak-> beef
//   tuna steak       -> beef
//   Quorn mince      -> beef
//   chicken stock    -> chicken (a stock cube, treated as the dish's protein)
//
// So identity now comes from the one resolver that already knows a source from
// a cut, and this function only decides whether the identity it returns is
// something a method should cook.
const METHOD_PROTEIN_BY_IDENTITY = new Map([
  // Cooked as the centre of the dish.
  ['chicken', 'chicken'], ['turkey', 'turkey'], ['duck', 'duck'], ['beef', 'beef'],
  ['lamb', 'lamb'], ['pork', 'pork'], ['venison', 'venison'],
  ['salmon', 'salmon'], ['tuna', 'tuna'], ['cod', 'cod'], ['haddock', 'haddock'],
  ['pollock', 'pollock'], ['mackerel', 'mackerel'], ['sardines', 'sardine'],
  ['prawns', 'prawns'], ['crab', 'crab'], ['mussels', 'mussels'], ['squid', 'squid'],
  ['tofu', 'tofu'], ['tempeh', 'tempeh'], ['seitan', 'seitan'], ['quorn', 'quorn'],
  ['falafel', 'falafel'], ['halloumi', 'halloumi'], ['paneer', 'paneer'],
  ['eggs', 'eggs'],
  ['lentils', 'lentils'], ['beans', 'beans'], ['chickpeas', 'chickpeas'],

  // Present as protein, but never the thing a method cooks: they are stirred
  // in, scattered over or layered. Mapping them to '' is what stops a caprese
  // salad being fried.
  ['cheese', ''], ['feta', ''], ['ricotta', ''], ['cottage-cheese', ''],
  ['greek-yogurt', ''], ['edamame', ''], ['anchovies', ''],
  ['protein-powder', ''], ['nut-butter', ''], ['nuts-seeds', ''],
]);

export function findProtein(searchText) {
  const identity = resolveProteinIdentity(searchText);
  if (!identity) return '';
  return METHOD_PROTEIN_BY_IDENTITY.get(identity) ?? '';
}

export function proteinAliasesFor(family) {
  return PROTEIN_FAMILIES.find(([label]) => label === family)?.[1] || (family ? [family] : []);
}

// Raw proteins that must never fall through to "warm everything gently" or
// receive no cooking instruction. Fish/meat/poultry/egg — not tofu/halloumi/
// quorn/falafel, which read fine with the generic "cook until cooked
// through" default, and not pulses, which have their own path below.
export const RAW_PROTEINS_REQUIRING_A_COOK_STEP = new Set([
  'chicken', 'turkey', 'beef', 'lamb', 'pork', 'salmon', 'tuna', 'cod', 'haddock', 'mackerel', 'sardine', 'prawns', 'eggs',
]);

// ── Pulses (lentils, beans, chickpeas) ─────────────────────────────────────
//
// Botanically beans too, but functionally distinct in this data set — never
// treated as "the protein" of a dish, always added quickly as a vegetable/
// side, and their current handling already works correctly.
const NON_PULSE_BEAN_EXCEPTIONS = /\b(green beans?|bean\s*sprouts?|edamame)\b/i;

const PULSE_PATTERNS = [
  ['lentil', /\blentils?\b/i],
  ['chickpea', /\bchickpeas?\b/i],
  ['bean', /\bbeans?\b/i],
];

export function isPulseIngredient(name) {
  const text = String(name || '');
  if (NON_PULSE_BEAN_EXCEPTIONS.test(text)) return false;
  return PULSE_PATTERNS.some(([, pattern]) => pattern.test(text));
}

export function pulseFamily(name) {
  const text = String(name || '');
  if (NON_PULSE_BEAN_EXCEPTIONS.test(text)) return '';
  const match = PULSE_PATTERNS.find(([, pattern]) => pattern.test(text));
  return match ? match[0] : '';
}

export const PULSE_STATE = { DRY: 'dry', TINNED: 'tinned', COOKED: 'cooked' };

// True when a display name reads as a dry (not tinned/pre-cooked) pulse —
// used to decide whether a simmer step must state its cooking liquid, for
// pulses that are in the pot but are not the dish's primary protein.
// Reads the "(dry weight)" suffix that cookingQuantities.js already renders
// from the parser's 'dry' qualifier, rather than re-parsing the raw line.
export function isDryPulseName(displayName) {
  const text = String(displayName || '');
  if (!isPulseIngredient(text)) return false;
  if (/\b(tinned|canned|cooked)\b/i.test(text)) return false;
  if (isPreparedPulseProduct(text)) return false;
  return /\bdry\b/i.test(text) || !/\b(weight|drained)\b/i.test(text);
}

// Pulse-based products sold ready to eat, already cooked in sauce or
// brine. They contain a pulse word and carry no "tinned"/"cooked" marker,
// so a naive dry-pulse test treats them as dry and tells the user to
// simmer them for 20 minutes and drain — nonsense for a tin of baked
// beans. Kept as an explicit, auditable list because these are product
// names, not something inference can safely derive.
const PREPARED_PULSE_PRODUCTS = /\b(baked beans|refried beans|mushy peas|bean salad|hummus|falafel|beansprouts?|bean sprouts?)\b/i;

export function isPreparedPulseProduct(name) {
  return PREPARED_PULSE_PRODUCTS.test(String(name || ''));
}

// ── Already-prepared ingredients ─────────────────────────────────────────
//
// An ingredient whose own name declares it already cooked ("Falafel 4
// baked", "150g baked tofu", "Courgette 1 roasted") must not then be given
// a from-raw cooking instruction. This generalises the preparation-state
// handling that previously existed only for potatoes
// (resolvePotatoPreparation) to any ingredient carrying the same kind of
// declared state.
const PREPARED_STATE_PATTERN = /\b(baked|roasted|grilled|cooked|pre-cooked|chargrilled|smoked|poached)\b/i;
// Product names where the word is part of the product, not a state the
// user is expected to have already performed.
const PREPARED_FALSE_FRIENDS = /\b(baked beans|smoked salmon|smoked mackerel|smoked haddock|smoked tofu|baked bean)\b/i;

export function isAlreadyPreparedIngredient(name) {
  const text = String(name || '');
  if (PREPARED_FALSE_FRIENDS.test(text)) return false;
  return PREPARED_STATE_PATTERN.test(text);
}

// ── Supply state: how a food arrives from the shop ───────────────────────
//
// Distinct from isAlreadyPreparedIngredient above, which reads a state the
// RECIPE declares ("Courgette 1 roasted"). This reads a state the FOOD has
// before anyone touches it: beef jerky is cured and dried, and no recipe
// needs to say so.
//
// The rule this exists to enforce is small and absolute: a food that arrives
// edible must never be told to cook until cooked through. That instruction
// was reaching the page — "Cook the lean beef jerky in a non-stick pan over
// medium heat until cooked through" — because the only thing standing
// between jerky and a frying pan was a two-line exception list naming tinned
// tuna and smoked salmon. Anything nobody had thought of was assumed raw.
//
// Matching is phrase-first, for the same reason the protein resolver strips
// form words before matching a source. "Smoked" is not a state:
//
//   smoked salmon    -> ready to eat (cured; eaten as it comes)
//   smoked mackerel  -> ready to eat (hot-smoked; already cooked)
//   smoked haddock   -> RAW (cold-smoked, and still needs cooking)
//   smoked paprika   -> not a protein at all
//
// so a substring rule on "smoked" would have poisoned a fish that genuinely
// needs cooking. Every entry below is a phrase, and the raw exceptions are
// tested first.
export const PREPARATION_STATE = {
  RAW: 'raw',
  READY_TO_EAT: 'ready-to-eat',
};

// Foods carrying a ready-to-eat-looking word that are nonetheless raw.
const SUPPLY_STATE_RAW_EXCEPTIONS = [
  /\bsmoked haddock\b/i,
  /\bsmoked cod\b/i,
  // Halloumi is safe to eat cold, but frying it is the entire point of
  // putting it in a recipe, so it is treated as needing the pan.
  /\bhalloumi\b/i,
  /\bsmoked tofu\b/i,
];

const SUPPLY_STATE_READY_TO_EAT = [
  // Cured and dried
  /\b(jerky|biltong|salami|prosciutto|parma ham|pepperoni)\b/i,
  // Smoked fish sold to be eaten as it comes
  /\bsmoked (salmon|mackerel|trout)\b/i,
  // Tinned fish — already cooked in the tin
  /\btinned (tuna|salmon|sardines?|mackerel)\b/i,
  /\btuna (pouch|in spring water|in brine)\b/i,
  // Cultured and soft dairy sold in pots
  /\b(yogurt|yoghurt|skyr|quark|cottage cheese|cream cheese|protein pudding)\b/i,
  // Ready dips and spreads
  /\b(hummus|houmous|guacamole|tzatziki|pesto|olives)\b/i,
  // Packaged snacks
  /\b(protein bar|rice cakes?|oatcakes?|crackers?|granola)\b/i,
  /\b(nuts|walnuts|peanuts|almonds|cashews|pistachios)\b/i,
  /\bdried (fruit|blueberries|cranberries|apricots|dates|mango)\b/i,
  // Cooked deli meat. "Turkey breast slices" and "chicken tikka" are named
  // here rather than corrected in the meal library, because the library's
  // ingredient names are lookup keys: renaming them to "Cooked turkey breast
  // slices" made the nutrition table miss them and silently zeroed the
  // calories of ten plans. What the food IS belongs in this resolver; the
  // library keeps the name the nutrition data knows it by.
  /\b(cooked|sliced) (ham|chicken|turkey)\b/i,
  /\bturkey breast slices\b/i,
  /\bchicken tikka\b/i,
  /\bdeli\b/i,
];

/**
 * How a food arrives from the shop, before any recipe step touches it.
 * Returns PREPARATION_STATE.READY_TO_EAT only for foods that are edible as
 * bought; everything else is RAW, which is the safe default.
 */
export function resolvePreparationState(name) {
  const text = String(name || '');
  if (SUPPLY_STATE_RAW_EXCEPTIONS.some(pattern => pattern.test(text))) {
    return PREPARATION_STATE.RAW;
  }
  return SUPPLY_STATE_READY_TO_EAT.some(pattern => pattern.test(text))
    ? PREPARATION_STATE.READY_TO_EAT
    : PREPARATION_STATE.RAW;
}

export function isReadyToEatIngredient(name) {
  return resolvePreparationState(name) === PREPARATION_STATE.READY_TO_EAT;
}

// Reuses the SAME structured signals the rest of the app already has for
// this — the "tinned"/"canned" substring convention already used by
// cookingQuantities.js and planBuilder.js's shopping aggregation, and the
// state qualifier ingredientParser.js already extracts ('dry', 'cooked',
// 'drained') — rather than adding a new guess. Bare lentils/beans/chickpeas
// with no marker default to dry, matching nutritionTable.js's own synonym
// convention (`'red lentils': 'red lentils dry'`).
export function classifyPulseState(name, qualifier) {
  const text = String(name || '');
  // Ready-to-eat pulse products (baked beans, hummus) are already cooked
  // even though nothing in the name says "tinned" or "cooked".
  if (isPreparedPulseProduct(text)) return PULSE_STATE.COOKED;
  if (/\b(tinned|canned)\b/i.test(text)) return PULSE_STATE.TINNED;
  const cleanQualifier = String(qualifier || '').toLowerCase();
  if (cleanQualifier === 'cooked' || cleanQualifier === 'drained') return PULSE_STATE.COOKED;
  if (cleanQualifier === 'dry') return PULSE_STATE.DRY;
  return PULSE_STATE.DRY;
}

// A dry pulse needs real cooking (simmering in liquid); a tinned or
// already-cooked one does not.
export function pulseNeedsCooking(state) {
  return state === PULSE_STATE.DRY;
}

// Resolves the dry/tinned/cooked state of whichever pulse ingredient in the
// meal matches the given family, using each ingredient's own canonical
// name (for the tinned/canned marker) and parsed qualifier (for an
// explicit "dry"/"cooked" marker) — the same structured fields
// ingredientParser.js already exposes elsewhere, not a new string guess.
// `parseQualifier(canonical)` is injected so this module stays free of a
// direct dependency on ingredientParser.js's internals.
export function resolvePulseState(cookingIngredients, family, parseQualifier) {
  if (!isPulseProteinFamily(family)) return null;
  const targetPattern = family === 'lentils' ? 'lentil' : family === 'chickpeas' ? 'chickpea' : 'bean';
  const match = (cookingIngredients || []).find(item => pulseFamily(item.ingredient) === targetPattern);
  if (!match) return null;
  const qualifier = parseQualifier ? parseQualifier(match.canonical) : '';
  return classifyPulseState(match.ingredient, qualifier);
}

// ── Starch ──────────────────────────────────────────────────────────────
//
// Centralises `findIngredient(text, ['noodles','pasta','rice',...])` with
// explicit exclusions for compound terms that contain a starch word as a
// substring but are not that starch — "rice cakes" is not rice to cook,
// the same way "cauliflower rice" was already excluded from a plain "rice"
// match elsewhere in this codebase (validateRecipeQuality's INGREDIENT_ALIASES
// check). Order matters for priority when more than one starch word appears.
export const STARCH_FAMILIES = [
  ['noodles', ['noodle', 'soba'], null],
  ['pasta', ['pasta', 'orzo', 'spaghetti'], null],
  ['rice', ['rice'], /\brice\s*cakes?\b|\bcauliflower rice\b|\brice[- ]sized\b/i],
  ['couscous', ['couscous'], null],
  ['quinoa', ['quinoa'], null],
  ['potato', ['potato'], null],
];

export function findStarch(searchText) {
  const text = String(searchText || '').toLowerCase();
  for (const [family, aliases, exclude] of STARCH_FAMILIES) {
    if (exclude && exclude.test(text)) continue;
    if (aliases.some(alias => hasWordPhrase(text, alias))) return family;
  }
  return '';
}

export function starchAliasesFor(family) {
  const entry = STARCH_FAMILIES.find(([label]) => label === family);
  return entry ? entry[1] : [];
}

// ── Accompaniments ──────────────────────────────────────────────────────
//
// A side item meant to be served alongside a dish, not simmered/cooked
// into it — bread rolls next to soup, a side of rice cakes, a pitta on the
// side. Deliberately narrow: this only governs whether an item is eligible
// to be swept into a soup/stew's "add X and simmer" catch-all, not a
// general-purpose "is this bread" check (branches that ARE about the bread —
// toast, wraps, sandwiches — already handle it as the point of the dish,
// not an accompaniment, and don't consult this).
// Bread served alongside a bowl, in any of the forms the data uses: a
// roll, or a slice/wedge of bread. Without the slice forms, "1 slice
// wholemeal bread" was simmered into a lentil soup — the same defect the
// roll wording already guarded against.
const ACCOMPANIMENT_PATTERN = /\b(bread roll|wholemeal roll|rye roll|dinner roll|roll|slices? (?:of )?\w*\s*bread|\w*\s*bread slices?|wedge of \w*\s*bread)\b/i;

export function isSoupSideAccompaniment(name) {
  return ACCOMPANIMENT_PATTERN.test(String(name || ''));
}

// ── Cooking liquid ──────────────────────────────────────────────────────
//
// The subset of "flavourings" that actually supplies the liquid a soup/
// stew simmers in — used only to check one is present, not to change how
// `flavourings` itself is displayed in the method (left as-is; low risk,
// not implicated in the reported bugs).
const COOKING_LIQUID_PATTERN = /\b(stock|coconut milk|passata|tinned tomatoes|tomatoes tinned|water)\b/i;

export function hasCookingLiquid(ingredientTexts) {
  return (ingredientTexts || []).some(text => COOKING_LIQUID_PATTERN.test(String(text || '')));
}

function hasWordPhrase(text, phrase) {
  const normalised = String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const target = String(phrase || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  if (!target) return false;
  const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pluralSuffix = /[a-z]$/.test(target) && !target.endsWith('s') ? '(?:s|es)?' : '';
  return new RegExp(`(?:^| )${escaped}${pluralSuffix}(?=$| )`).test(normalised);
}

// ── Primary-protein identity (meal-level) ────────────────────────────────────
//
// PROTEIN_FAMILIES above answers "how must this ingredient be cooked?". This
// answers a different question — "what would a person say this meal is built
// on?" — and is the single source of truth for meal-level protein identity.
//
// It exists because planBuilder carried its own MAIN_PROTEIN_KW list of eleven
// meat and fish words. Every vegan and vegetarian lunch and dinner in the
// library resolved to "no protein" under it, which silently disabled the
// same-day diversity check for exactly the diets with the smallest pools.
//
// The design rule that matters: a protein's identity comes from its SOURCE,
// never from its FORM. "Mince" is a shape, not an animal. Treating form words
// as identifiers is what made "Turkey mince", "Quorn mince" and "Tuna steak"
// all resolve to beef. A new ingredient such as "duck mince" therefore needs no
// new rule — duck is a source, mince is a form.

// Words describing cut, shape, cure or packaging. These NEVER identify a
// protein on their own, and are stripped before matching so no source rule can
// borrow them.
const PROTEIN_FORM_WORDS = [
  'mince', 'minced', 'steak', 'steaks', 'fillet', 'fillets', 'breast', 'breasts',
  'thigh', 'thighs', 'leg', 'legs', 'wing', 'wings', 'chop', 'chops', 'loin',
  'tenderloin', 'shoulder', 'rashers', 'strips', 'chunks', 'diced', 'sliced',
  'slices', 'shredded', 'pulled', 'burger', 'burgers', 'patty', 'patties',
  'meatball', 'meatballs', 'sausage', 'sausages', 'jerky', 'nuggets', 'goujons',
  'smoked', 'tinned', 'canned', 'frozen', 'fresh', 'dried', 'cooked', 'raw',
  'lean', 'reduced-fat', 'low-fat', 'light', 'firm', 'silken', 'extra', 'back',
];

// Source identifiers: the actual animal, plant or product. A cut name appears
// here only where it names one species unambiguously — sirloin and brisket are
// always beef, bacon and gammon are always pork.
export const PRIMARY_PROTEIN_SOURCES = [
  ['chicken', ['chicken']],
  ['turkey', ['turkey']],
  ['duck', ['duck']],
  ['lamb', ['lamb', 'mutton']],
  ['pork', ['pork', 'bacon', 'gammon', 'chorizo', 'prosciutto', 'pancetta', 'salami', 'ham']],
  ['beef', ['beef', 'sirloin', 'rump', 'brisket', 'ribeye']],
  ['venison', ['venison']],

  ['salmon', ['salmon']],
  ['tuna', ['tuna']],
  ['cod', ['cod']],
  ['haddock', ['haddock']],
  ['pollock', ['pollock', 'pollack']],
  ['mackerel', ['mackerel']],
  ['sardines', ['sardine', 'sardines']],
  ['anchovies', ['anchovy', 'anchovies']],
  ['prawns', ['prawn', 'prawns', 'shrimp']],
  ['crab', ['crab']],
  ['mussels', ['mussel', 'mussels']],
  ['squid', ['squid', 'calamari']],

  ['tofu', ['tofu']],
  ['tempeh', ['tempeh']],
  ['seitan', ['seitan']],
  ['quorn', ['quorn', 'mycoprotein']],
  ['falafel', ['falafel']],
  ['edamame', ['edamame']],

  ['eggs', ['egg', 'eggs']],
  ['halloumi', ['halloumi']],
  ['paneer', ['paneer']],
  ['feta', ['feta']],
  ['cottage-cheese', ['cottage cheese']],
  ['greek-yogurt', ['greek yogurt', 'greek-style yogurt', 'skyr', 'quark']],
  ['ricotta', ['ricotta']],
  ['cheese', ['mozzarella', 'cheddar', 'parmesan', 'cream cheese', 'goats cheese', 'cheese']],

  ['lentils', ['lentil', 'lentils', 'dahl', 'dhal']],
  // Culinary beans share one identity on purpose: a black-bean lunch and a
  // kidney-bean dinner is the same plate twice to the person eating it.
  ['beans', ['bean', 'beans']],
  ['chickpeas', ['chickpea', 'chickpeas', 'hummus', 'houmous']],

  ['protein-powder', ['protein powder', 'whey', 'pea protein']],
  ['nut-butter', ['peanut butter', 'almond butter', 'cashew butter', 'nut butter']],
  ['nuts-seeds', ['almond', 'almonds', 'walnut', 'walnuts', 'peanut', 'peanuts',
    'cashew', 'cashews', 'pistachio', 'seeds', 'nuts']],
];

// Phrases that read like a protein but are not one. "Beef stock" is not beef
// and "Beef tomato" is a tomato; green beans are a vegetable; plant milks are
// not dairy; "butternut" is not butter.
const NOT_A_PROTEIN_SOURCE = new RegExp([
  '\\b(?:beef|chicken|vegetable|fish|lamb|ham)\\s+stock\\b',
  '\\bstock\\s+(?:cube|pot)\\b',
  '\\bbroth\\b',
  '\\bbeef\\s+tomato\\b',
  '\\b(?:green|runner|broad)\\s+beans?\\b',
  '\\bbean\\s?sprouts?\\b',
  '\\b(?:coconut|oat|almond|soya|soy|rice|hemp)\\s+milk\\b',
  '\\begg\\s?plant\\b',
  '\\begg\\s+wash\\b',
  '\\b(?:fish|oyster)\\s+sauce\\b',
  '\\bsoy\\s+sauce\\b',
  '\\bcocoa\\s+butter\\b',
  '\\bbutter\\s?nut\\b',
// Global: a line can carry more than one of these ("green beans and soy
// sauce"), and masking only the first would leave the second to match.
].join('|'), 'gi');

// A plant qualifier means any meat word that follows names what the product
// imitates, not what it is: "vegan sausage" and "plant-based mince" must never
// resolve to pork or beef.
const PLANT_IMITATION = /\b(?:vegan|vegetarian|veggie|plant[- ]based|meat[- ]free|meatless)\b/i;
const PLANT_SOURCES = new Set(['tofu', 'tempeh', 'seitan', 'quorn', 'falafel', 'edamame',
  'lentils', 'beans', 'chickpeas', 'nuts-seeds', 'nut-butter', 'protein-powder']);

// A specific source and the generic word it contains are the same ingredient,
// not two competing matches. Declaring the relationship keeps the corpus audit
// meaningful: any remaining multi-family line is a genuine ambiguity.
const SUBSUMED_PARENT = new Map([
  ['cottage-cheese', 'cheese'],
  ['ricotta', 'cheese'],
  ['feta', 'cheese'],
  ['halloumi', 'cheese'],
  ['paneer', 'cheese'],
  ['greek-yogurt', 'cheese'],
  ['nut-butter', 'nuts-seeds'],
]);

function escapeForRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function stripFormWords(text) {
  let out = String(text || '').toLowerCase();
  for (const form of PROTEIN_FORM_WORDS) {
    out = out.replace(new RegExp(`\\b${escapeForRegExp(form)}\\b`, 'g'), ' ');
  }
  return out.replace(/\s+/g, ' ').trim();
}

/**
 * Every source rule a piece of text matches, most specific first. Exposed so
 * the alias-collision audit can see what competed, not only what won.
 */
export function proteinIdentityCandidates(text) {
  const raw = String(text || '').toLowerCase();
  if (!raw) return [];
  // A phrase that only looks like a protein disqualifies ITSELF, not the
  // sentence it sits in. Rejecting the whole string was survivable while this
  // only ever saw one ingredient line at a time, but "Baked Cod with New
  // Potatoes and Green Beans" is a single string too — and the green beans
  // were enough to hide the cod, leaving a fish dish with no fish to cook.
  // Masking the phrase answers both questions correctly: the beans still name
  // no protein, and the cod is still there.
  const masked = raw.replace(NOT_A_PROTEIN_SOURCE, ' ').replace(/\s+/g, ' ').trim();
  if (!masked) return [];
  const stripped = stripFormWords(masked);
  if (!stripped) return [];

  const imitation = PLANT_IMITATION.test(raw);
  const found = [];
  for (const [family, aliases] of PRIMARY_PROTEIN_SOURCES) {
    if (family === 'beans' && !isPulseIngredient(masked)) continue;
    if (!aliases.some(alias => hasWordPhrase(stripped, alias))) continue;
    // "Vegan sausage" names no animal; drop animal families rather than let
    // the imitated meat win.
    if (imitation && !PLANT_SOURCES.has(family)) continue;
    found.push(family);
  }
  // Drop any family that a more specific match already subsumes.
  const parents = new Set(found.map(family => SUBSUMED_PARENT.get(family)).filter(Boolean));
  return found.filter(family => !parents.has(family));
}

/** The single canonical protein a piece of text names, or '' for none. */
export function resolveProteinIdentity(text) {
  return proteinIdentityCandidates(text)[0] || '';
}

// Below this a protein is a garnish, not a basis: parmesan over pasta, a spoon
// of yogurt in a dressing, seeds on a bowl. Two meals must not read as
// repetitive because both happen to carry 20g of cheese.
const PRIMARY_GRAMS = 75;
const PRIMARY_ML = 150;

function statedAmount(line) {
  const grams = /(\d+(?:\.\d+)?)\s*g\b/i.exec(line);
  if (grams) return { value: Number(grams[1]), unit: 'g' };
  const ml = /(\d+(?:\.\d+)?)\s*ml\b/i.exec(line);
  if (ml) return { value: Number(ml[1]), unit: 'ml' };
  if (/\b(?:tbsp|tsp)\b/i.test(line)) return { value: 0, unit: 'spoon' };
  const count = /(\d+(?:\.\d+)?)\s*$/.exec(String(line).trim());
  if (count) return { value: Number(count[1]), unit: 'count' };
  return null;
}

function isPrimaryAmount(amount, family) {
  if (!amount) return true;                        // no amount stated
  if (amount.unit === 'spoon') return false;       // a spoonful is a garnish
  if (amount.unit === 'g') return amount.value >= PRIMARY_GRAMS;
  if (amount.unit === 'ml') return amount.value >= PRIMARY_ML;
  if (family === 'eggs') return amount.value >= 2; // one egg is a topping
  return true;
}

/**
 * The protein families a meal is genuinely built on, as a Set.
 *
 * Structured ingredient lines decide it. The meal's own title only promotes an
 * ingredient the quantity thresholds would otherwise call incidental, and acts
 * as a fallback when the ingredient list yields nothing at all.
 */
export function primaryProteinSignature(meal) {
  if (!meal) return new Set();
  const lines = Array.isArray(meal.ingredients) ? meal.ingredients : [];
  const named = resolveProteinIdentity(meal.name);
  const signature = new Set();
  let namedAppears = false;

  for (const line of lines) {
    const family = resolveProteinIdentity(line);
    if (!family) continue;
    if (family === named) namedAppears = true;
    if (isPrimaryAmount(statedAmount(String(line)), family)) signature.add(family);
  }

  // "Smoked Salmon Bagel" with 60g of salmon is still a salmon meal.
  if (named && namedAppears) signature.add(named);
  // Legacy meals sometimes carry prose portions rather than parsed lines.
  if (!signature.size && named) signature.add(named);
  return signature;
}

/** The families two meals genuinely share; empty means the day reads as varied. */
export function sharedPrimaryProteins(mealA, mealB) {
  const a = primaryProteinSignature(mealA);
  const b = primaryProteinSignature(mealB);
  return [...a].filter(family => b.has(family));
}
