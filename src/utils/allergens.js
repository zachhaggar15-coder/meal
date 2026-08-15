// UK regulated-allergen awareness for the shared meal library.
//
// WHAT THIS IS
// ------------
// UK food law (assimilated Regulation (EU) No 1169/2011, enforced by the Food
// Standards Agency) requires 14 allergens to be declared when they are used as
// an ingredient. This module maps every canonical record in
// src/data/nutritionTable.js to the allergens its *generic* form contains.
//
// WHAT THIS IS NOT
// ----------------
// It is NOT a label check and it can NEVER produce an "allergen-free" claim:
//
//   * the site prices and models generic foods, not specific branded products;
//   * recipes and formulations differ between retailers and change over time;
//   * cross-contamination cannot be inferred from an ingredient name at all.
//
// So this module reports three states per allergen — `present`, `varies` and
// `not-identified` — and callers must never render `not-identified` as
// "free from". `varies` exists precisely so that foods whose allergen status
// genuinely depends on the product (protein powder, granola, stock cubes) are
// never silently asserted either way.
//
// Reference: Food Standards Agency, "Allergen guidance for food businesses"
// https://www.food.gov.uk/business-guidance/allergen-guidance-for-food-businesses

import { NUTRITION_TABLE, NUTRITION_SYNONYMS } from '../data/nutritionTable.js';
import { parseIngredientLine } from './ingredientParser.js';

// The 14 allergens, named as the FSA names them.
export const UK_ALLERGENS = Object.freeze({
  celery: 'Celery',
  gluten: 'Cereals containing gluten',
  crustaceans: 'Crustaceans',
  eggs: 'Eggs',
  fish: 'Fish',
  lupin: 'Lupin',
  milk: 'Milk',
  molluscs: 'Molluscs',
  mustard: 'Mustard',
  nuts: 'Tree nuts',
  peanuts: 'Peanuts',
  sesame: 'Sesame',
  soya: 'Soybeans',
  sulphites: 'Sulphur dioxide and sulphites',
});

export const ALLERGEN_KEYS = Object.freeze(Object.keys(UK_ALLERGENS));

// ── Per-food allergen decisions ──────────────────────────────────────────────
// `contains` = the generic UK form of this food has the allergen as an
//              ingredient.
// `varies`   = the allergen is present in some products and absent in others,
//              so the honest answer is "check the label". Recorded explicitly
//              rather than left out, so the completeness audit can tell a
//              deliberate "varies" apart from an unclassified food.
//
// A food with neither list has no regulated allergen identifiable from its
// generic form. That is still not a "free from" statement — see the header.
const FOOD_ALLERGENS = {
  // ── Dairy ─────────────────────────────────────────────────────────────────
  '0% greek yogurt': { contains: ['milk'] },
  'buffalo mozzarella': { contains: ['milk'] },
  'butter': { contains: ['milk'] },
  'cottage cheese': { contains: ['milk'] },
  'greek yogurt': { contains: ['milk'] },
  'halloumi': { contains: ['milk'] },
  'high-protein yogurt pot': { contains: ['milk'] },
  'light cream cheese': { contains: ['milk'] },
  'light mozzarella': { contains: ['milk'] },
  'low-fat cottage cheese': { contains: ['milk'] },
  'low-fat crème fraîche': { contains: ['milk'] },
  'low-fat greek yogurt': { contains: ['milk'] },
  'low-fat natural yogurt': { contains: ['milk'] },
  'low-fat paneer': { contains: ['milk'] },
  'low-fat yogurt': { contains: ['milk'] },
  'parmesan': { contains: ['milk'] },
  'plain kefir': { contains: ['milk'] },
  'raita': { contains: ['milk'] },
  'reduced-fat cheddar': { contains: ['milk'] },
  'reduced-fat feta': { contains: ['milk'] },
  'reduced-fat halloumi': { contains: ['milk'] },
  'ricotta cheese': { contains: ['milk'] },
  'semi-skimmed milk': { contains: ['milk'] },
  'skimmed milk': { contains: ['milk'] },
  'skyr': { contains: ['milk'] },
  'mint yogurt sauce': { contains: ['milk'] },
  // Protein-enriched yogurts are dairy, but sweeteners/flavourings vary.
  'protein yogurt': { contains: ['milk'] },

  // ── Eggs ──────────────────────────────────────────────────────────────────
  'egg': { contains: ['eggs'] },
  'egg white': { contains: ['eggs'] },
  'egg yolk': { contains: ['eggs'] },
  'light mayo': { contains: ['eggs'], varies: ['mustard'] },
  // Standard UK pancake batter is flour, egg and milk.
  'pancake batter': { contains: ['gluten', 'eggs', 'milk'] },
  // Quorn mince is mycoprotein bound with egg white in the standard product;
  // the vegan range is not. Flagged as varies rather than asserted.
  'quorn mince': { varies: ['eggs', 'milk', 'gluten'] },

  // ── Fish and shellfish ────────────────────────────────────────────────────
  'cod fillet': { contains: ['fish'] },
  'mackerel fillet': { contains: ['fish'] },
  'salmon fillet': { contains: ['fish'] },
  'smoked haddock fillet': { contains: ['fish'] },
  'smoked mackerel fillet': { contains: ['fish'] },
  'smoked salmon': { contains: ['fish'] },
  'tinned mackerel in brine': { contains: ['fish'] },
  'tinned sardines': { contains: ['fish'] },
  'tinned sardines in oil drained': { contains: ['fish'] },
  'tinned tuna in spring water': { contains: ['fish'] },
  'tuna steak': { contains: ['fish'] },
  'king prawns': { contains: ['crustaceans'] },

  // ── Cereals containing gluten ─────────────────────────────────────────────
  // Oats are one of the named cereals containing gluten under UK law.
  'bran flakes': { contains: ['gluten'], varies: ['nuts'] },
  'granola': { contains: ['gluten'], varies: ['nuts', 'peanuts', 'sesame', 'milk', 'soya'] },
  'low-sugar granola': { contains: ['gluten'], varies: ['nuts', 'peanuts', 'sesame', 'milk', 'soya'] },
  'oat biscuits': { contains: ['gluten'], varies: ['milk'] },
  'oat flour': { contains: ['gluten'] },
  'oat milk': { contains: ['gluten'] },
  'oatcakes': { contains: ['gluten'] },
  'orzo pasta dry': { contains: ['gluten'] },
  'rolled oats': { contains: ['gluten'] },
  'rye bread': { contains: ['gluten'], varies: ['soya'] },
  'rye crackers': { contains: ['gluten'] },
  // UK soba is normally a buckwheat/wheat blend rather than pure buckwheat.
  'soba noodles dry': { contains: ['gluten'] },
  'sourdough bread': { contains: ['gluten'] },
  'toast': { contains: ['gluten'], varies: ['soya', 'sesame'] },
  'weetabix': { contains: ['gluten'] },
  'wholemeal bagel': { contains: ['gluten'], varies: ['sesame', 'soya'] },
  'wholemeal bread': { contains: ['gluten'], varies: ['soya', 'sesame'] },
  'wholemeal couscous dry': { contains: ['gluten'] },
  'wholemeal flour': { contains: ['gluten'] },
  'wholemeal pasta cooked': { contains: ['gluten'], varies: ['eggs'] },
  'wholemeal pasta dry': { contains: ['gluten'], varies: ['eggs'] },
  'wholemeal pitta': { contains: ['gluten'] },
  'wholemeal roll': { contains: ['gluten'], varies: ['sesame', 'soya'] },
  'wholemeal tortilla': { contains: ['gluten'] },
  'wholewheat noodles dry': { contains: ['gluten'], varies: ['eggs'] },

  // ── Soya ──────────────────────────────────────────────────────────────────
  'edamame': { contains: ['soya'] },
  'edamame beans': { contains: ['soya'] },
  'firm tofu': { contains: ['soya'] },
  'silken tofu': { contains: ['soya'] },
  'soy milk': { contains: ['soya'] },
  'soy sauce': { contains: ['soya', 'gluten'] },
  // Tamari is the wheat-free soy sauce, but not every brand is certified.
  'tamari': { contains: ['soya'], varies: ['gluten'] },
  'miso paste': { contains: ['soya'], varies: ['gluten'] },
  'hoisin sauce': { contains: ['soya'], varies: ['gluten', 'sesame'] },
  'teriyaki sauce': { contains: ['soya'], varies: ['gluten', 'sesame'] },
  'sweet chilli sauce': { varies: ['fish', 'soya'] },
  'pea protein powder': { varies: ['soya'] },
  'protein powder': { varies: ['milk', 'soya'] },

  // ── Sesame ────────────────────────────────────────────────────────────────
  'sesame oil': { contains: ['sesame'] },
  'sesame seeds': { contains: ['sesame'] },
  'tahini': { contains: ['sesame'] },
  'tahini dressing': { contains: ['sesame'] },
  'hummus': { contains: ['sesame'] },
  'falafel': { varies: ['sesame', 'gluten'] },

  // ── Nuts and peanuts ──────────────────────────────────────────────────────
  'almond butter': { contains: ['nuts'] },
  'almonds': { contains: ['nuts'] },
  'mixed nuts': { contains: ['nuts'], varies: ['peanuts'] },
  'walnuts': { contains: ['nuts'] },
  'peanut butter': { contains: ['peanuts'] },
  'peanuts': { contains: ['peanuts'] },
  'nut roast': { contains: ['nuts'], varies: ['gluten', 'eggs', 'milk', 'celery'] },
  'energy balls': { varies: ['nuts', 'peanuts', 'gluten', 'sesame', 'soya', 'milk'] },
  'dark chocolate 70%': { varies: ['milk', 'nuts', 'soya'] },
  'dark chocolate chips': { varies: ['milk', 'nuts', 'soya'] },

  // ── Celery, mustard and stocks ────────────────────────────────────────────
  'celery': { contains: ['celery'] },
  'mustard': { contains: ['mustard'] },
  'mustard dressing': { contains: ['mustard'] },
  // UK stock cubes and pots very commonly list celery; some list gluten.
  'beef stock': { varies: ['celery', 'gluten', 'soya'] },
  'chicken stock': { varies: ['celery', 'gluten', 'soya'] },
  'vegetable stock': { varies: ['celery', 'gluten', 'soya'] },
  'gravy': { varies: ['celery', 'gluten', 'milk', 'soya'] },

  // ── Dressings and prepared sauces ─────────────────────────────────────────
  // Classic Caesar dressing is anchovy, egg and parmesan based.
  'caesar dressing': { contains: ['fish', 'eggs', 'milk'], varies: ['mustard'] },
  'light caesar dressing': { contains: ['fish', 'eggs', 'milk'], varies: ['mustard'] },
  'balsamic dressing': { varies: ['sulphites', 'mustard'] },
  'balsamic glaze': { contains: ['sulphites'] },
  'lemon dressing': { varies: ['mustard'] },
  'light dressing': { varies: ['mustard', 'eggs', 'milk'] },
  'plant-based dressing': { varies: ['mustard', 'soya'] },
  'green pesto': { contains: ['milk', 'nuts'] },
  'curry paste': { varies: ['mustard', 'fish', 'nuts', 'gluten'] },
  'tikka paste': { varies: ['mustard', 'nuts', 'milk'] },
  'tomato curry sauce': { varies: ['milk', 'nuts', 'celery'] },
  'salsa': { varies: ['celery'] },
  'chicken tikka': { contains: ['milk'], varies: ['mustard', 'nuts'] },

  // ── Sulphites ─────────────────────────────────────────────────────────────
  // Dried fruit is routinely treated with sulphur dioxide as a preservative.
  'dried berries': { varies: ['sulphites'] },
  'dried cranberries': { varies: ['sulphites'] },
  'raisins': { varies: ['sulphites'] },
  'medjool dates': { varies: ['sulphites'] },
  'tinned pineapple in juice': { varies: ['sulphites'] },

  // ── Meat products where binders vary ──────────────────────────────────────
  'turkey sausages': { varies: ['gluten', 'milk', 'soya', 'sulphites'] },
  'turkey patty': { varies: ['gluten', 'milk', 'soya'] },
  'turkey rashers': { varies: ['gluten', 'soya'] },
  'lean beef jerky': { varies: ['soya', 'gluten', 'sesame'] },
  'back bacon rashers': {},
  'lean bacon rashers': {},

  // ── Foods with no regulated allergen in their generic form ────────────────
  // Listed explicitly so the completeness audit can distinguish "checked and
  // none identified" from "never classified".
  'apple': {}, 'arborio rice dry': {}, 'asparagus': {}, 'avocado': {},
  'baby spinach': {}, 'banana': {}, 'beansprouts': {}, 'black beans': {},
  'blueberries': {}, 'broccoli': {}, 'brown rice cooked': {}, 'brown rice dry': {},
  'butternut squash': {}, 'cabbage': {}, 'cannellini beans': {}, 'carrot': {},
  'cauliflower': {}, 'cherry tomatoes': {}, 'chia seeds': {},
  'chicken breast': {}, 'chicken breast cooked': {}, 'chicken thighs': {},
  'chilli powder': {}, 'cinnamon': {}, 'coconut milk': {}, 'coconut milk light': {},
  'courgette': {}, 'cucumber': {}, 'cumin': {}, 'curry powder': {},
  'dairy-free yogurt': { varies: ['soya', 'nuts', 'gluten'] },
  'fajita spice': {}, 'frozen peas': {}, 'garam masala': {}, 'garlic': {},
  'garlic powder': {}, 'ginger': {}, 'green beans': {}, 'green lentils dry': {},
  'hemp seeds': {}, 'honey': {}, 'kidney beans': {}, 'lean beef mince': {},
  'lean beef strips': {}, 'lean lamb mince': {}, 'lean lamb shoulder': {},
  'lean sirloin steak': {}, 'lean stewing beef': {}, 'leek': {}, 'lemon': {},
  'lemon juice': {}, 'lentils cooked': {}, 'lettuce': {}, 'lime juice': {},
  'mango': {}, 'maple syrup': {}, 'mixed beans': {}, 'mixed berries': {},
  'mixed herbs': {}, 'mixed leaves': {}, 'mixed seeds': { varies: ['sesame'] },
  'mixed veg': {}, 'mushrooms': {}, 'new potatoes': {}, 'nutritional yeast': {},
  'olive oil': {}, 'olives': { varies: ['sulphites'] }, 'onion': {},
  'pak choi': {}, 'paprika': {}, 'parsnip': {}, 'peppers': {},
  'pomegranate seeds': {}, 'pork loin': {}, 'pork tenderloin': {},
  'potato': {}, 'potato baked': {}, 'pumpkin seeds': {}, 'quinoa cooked': {},
  'quinoa dry': {}, 'ras el hanout': {}, 'red lentils dry': {},
  'reduced-sugar baked beans': { varies: ['gluten', 'celery'] },
  'rice cakes': {}, 'rice noodles dry': {}, 'rocket': {},
  'smoked paprika': {}, 'spinach': {}, 'spring onion': {}, 'steak': {},
  'sweet potato': {}, 'sweetcorn': {}, 'tinned chickpeas': {}, 'tomatoes': {},
  'turkey breast': {}, 'turkey breast slices': {}, 'turkey mince lean': {},
  'turmeric': {}, 'water': {}, 'watercress': {},
};

// ── Resolution ───────────────────────────────────────────────────────────────

function canonicalKey(name, qualifier) {
  if (!name) return null;
  return (qualifier && NUTRITION_SYNONYMS[`${name}|${qualifier}`])
    || NUTRITION_SYNONYMS[name]
    || (NUTRITION_TABLE[name] ? name : null);
}

export function allergensForCanonicalKey(key) {
  return FOOD_ALLERGENS[key] || null;
}

export function isCanonicalKeyClassified(key) {
  return Object.prototype.hasOwnProperty.call(FOOD_ALLERGENS, key);
}

/**
 * Resolves the regulated allergens identifiable from a list of ingredient
 * lines.
 *
 * Returns `{ present, varies, unclassified }` where `present` and `varies`
 * are allergen keys and `unclassified` lists ingredient lines that could not
 * be resolved to a canonical food — callers should surface that honestly
 * rather than treating it as an absence.
 */
export function resolveAllergens(ingredientLines = []) {
  const present = new Set();
  const varies = new Set();
  const unclassified = [];

  for (const line of ingredientLines) {
    const text = String(line || '').trim();
    if (!text) continue;

    const parsed = parseIngredientLine(text);
    if (parsed.kind === 'negligible') continue;

    const key = canonicalKey(parsed.name, parsed.qualifier);
    if (!key) {
      unclassified.push(text);
      continue;
    }

    const record = FOOD_ALLERGENS[key];
    if (!record) {
      unclassified.push(text);
      continue;
    }

    for (const allergen of record.contains || []) present.add(allergen);
    for (const allergen of record.varies || []) varies.add(allergen);
  }

  // An allergen that is definitely present elsewhere in the meal does not also
  // need a "check the label" caveat.
  for (const allergen of present) varies.delete(allergen);

  return {
    present: ALLERGEN_KEYS.filter(key => present.has(key)),
    varies: ALLERGEN_KEYS.filter(key => varies.has(key)),
    unclassified,
  };
}

/** Merges several per-meal results into one plan-level summary. */
export function mergeAllergenSummaries(summaries = []) {
  const present = new Set();
  const varies = new Set();
  const unclassified = new Set();

  for (const summary of summaries) {
    for (const key of summary?.present || []) present.add(key);
    for (const key of summary?.varies || []) varies.add(key);
    for (const line of summary?.unclassified || []) unclassified.add(line);
  }
  for (const allergen of present) varies.delete(allergen);

  return {
    present: ALLERGEN_KEYS.filter(key => present.has(key)),
    varies: ALLERGEN_KEYS.filter(key => varies.has(key)),
    unclassified: [...unclassified],
  };
}

export function allergenLabel(key) {
  return UK_ALLERGENS[key] || key;
}
