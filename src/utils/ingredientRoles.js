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

export function findProtein(searchText) {
  const text = String(searchText || '').toLowerCase();
  for (const [family, aliases] of PROTEIN_FAMILIES) {
    // "beans" as a protein family means an actual pulse (kidney/black/
    // cannellini/mixed/baked beans) — not green beans (a vegetable) or
    // edamame/beansprouts, which this same exclusion list already keeps
    // out of pulse-state classification below.
    if (family === 'beans' && !isPulseIngredient(text)) continue;
    if (aliases.some(alias => hasWordPhrase(text, alias))) return family;
  }
  return '';
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
].join('|'), 'i');

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
  if (!raw || NOT_A_PROTEIN_SOURCE.test(raw)) return [];
  const stripped = stripFormWords(raw);
  if (!stripped) return [];

  const imitation = PLANT_IMITATION.test(raw);
  const found = [];
  for (const [family, aliases] of PRIMARY_PROTEIN_SOURCES) {
    if (family === 'beans' && !isPulseIngredient(raw)) continue;
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
