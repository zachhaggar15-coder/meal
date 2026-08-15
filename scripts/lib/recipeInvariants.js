// Deterministic recipe-quality invariant checks, shared by the
// non-blocking audit (scripts/audit-recipe-invariants.js) and the
// regression corpus so both use one definition rather than drifting
// copies — the same centralisation principle applied to ingredient roles.
import { RAW_PROTEINS_REQUIRING_A_COOK_STEP, hasCookingLiquid, isSoupSideAccompaniment } from '../../src/utils/ingredientRoles.js';

const NEGLIGIBLE_EXCEPTION = /\b(excluded from nutrition estimate|optional|to taste|garnish|spray|as needed)\b/i;
const COOK_VERB_PATTERN = /\b(cook|cooked|bake|baked|grill|grilled|fry|fried|simmer|simmered|roast|roasted|poach|poached|boil|boiled|brown|browned)\b/i;

function ingredientHeadWord(text) {
  return String(text || '').replace(/\d.*$/, '').trim().toLowerCase();
}

function isMaterialIngredient(rawIngredient) {
  const text = String(rawIngredient || '');
  if (NEGLIGIBLE_EXCEPTION.test(text)) return false;
  if (isSoupSideAccompaniment(text)) return false; // accompaniments are legitimately not "cooked into" the dish
  return true;
}

// Seasonings, herbs, spices and small flavourings are legitimately folded
// into a generic "season to taste" without being named — flagging them
// swamped the signal in the first version of this check.
const SEASONING_OR_MINOR = /\b(salt|pepper|herbs?|spices?|paprika|cumin|turmeric|cinnamon|oregano|basil|thyme|rosemary|coriander|parsley|dill|mint|chilli|cayenne|nutmeg|masala|curry powder|garlic powder|onion powder|five spice|mixed spice|stock cube|lemon juice|lime juice|vinegar|seeds?|zest)\b/i;
// Aromatics that a method often folds into a group phrase ("soften the
// aromatics") rather than naming individually.
const COMMON_AROMATIC = /\b(garlic|ginger|lemon|lime)\b/i;

// ── Check 1: core ingredient present but never mentioned in the method ────
// Refined: normalises singular/plural and preparation adjectives, and
// excludes seasonings/aromatics/negligibles that are legitimately not
// named individually. Still non-blocking — see the report for precision.
export function checkCoreIngredientOmission(mealName, ingredients, methodText) {
  const flagged = [];
  const haystack = methodText.toLowerCase();
  for (const raw of ingredients || []) {
    if (!isMaterialIngredient(raw)) continue;
    if (SEASONING_OR_MINOR.test(raw) || COMMON_AROMATIC.test(raw)) continue;
    const head = ingredientHeadWord(raw)
      .replace(/\(.*?\)/g, ' ')
      .replace(/\b(fresh|frozen|tinned|canned|dried|light|low-fat|reduced-fat|lean|raw|cooked|baked|grated|chopped|sliced|mashed|drained|dry)\b/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!head) continue;
    const words = head.split(/\s+/).filter(word => word.length > 2);
    if (!words.length) continue;
    // Match on a singular/plural-insensitive stem so "tomatoes" matches
    // "tomato" and vice versa.
    const mentioned = words.some(word => {
      const stem = word.replace(/(ies|es|s)$/, '');
      return stem.length > 2 && haystack.includes(stem);
    });
    if (!mentioned) flagged.push(raw);
  }
  return flagged;
}

// ── Check 2: a raw protein requiring a cook step has no cooking verb near it ──
export function checkRawProteinWithoutCooking(name, ingredients, methodText) {
  const nameLower = name.toLowerCase();
  const text = `${nameLower} ${(ingredients || []).join(' ')}`.toLowerCase();
  const flaggedProteins = [];
  for (const protein of RAW_PROTEINS_REQUIRING_A_COOK_STEP) {
    if (!text.includes(protein)) continue;
    // Already-prepared exceptions that legitimately need no further cooking.
    if (/(smoked|tinned|canned|cooked|pre-cooked)\s+\w*\s*/i.test(text) && text.includes(`${protein}`)) {
      // Only skip if the protein word itself is adjacent to a prepared marker.
      const preparedNear = new RegExp(`(smoked|tinned|canned|cooked)[^,]{0,20}${protein}|${protein}[^,]{0,20}(smoked|tinned|canned|cooked)`, 'i');
      if (preparedNear.test(text)) continue;
    }
    if (!COOK_VERB_PATTERN.test(methodText)) flaggedProteins.push(protein);
  }
  return flaggedProteins;
}

// ── Check 3: a dish needing hydration has no cooking medium IN THE METHOD ─
// Refined per the audit: water is not a grocery item, so checking the
// ingredient list produced ~86 mostly-false flags. The useful question is
// whether the METHOD tells the user what to hydrate/simmer the dry
// ingredient in — an ingredient-list stock, or explicit method wording.
const DRY_NEEDING_HYDRATION = /\b(lentils?|split peas?|pearl barley|bulgur|couscous|quinoa|rice|pasta|oats)\b/i;
const METHOD_LIQUID_PATTERN = /\b(water|stock|broth|milk|passata|coconut milk|tinned tomatoes|tomatoes|packet instructions|to cover)\b/i;

export function checkHydrationWithoutMedium(name, ingredients, methodText) {
  const nameLower = name.toLowerCase();
  if (!/(curry|chilli|stew|soup|dahl|dal|risotto)/.test(nameLower)) return false;
  const dryIngredients = (ingredients || []).filter(item => (
    DRY_NEEDING_HYDRATION.test(item) && !/\b(tinned|canned|cooked)\b/i.test(item)
  ));
  if (!dryIngredients.length) return false;
  // Satisfied either by a real liquid ingredient or by explicit method wording.
  if (hasCookingLiquid(ingredients)) return false;
  return !METHOD_LIQUID_PATTERN.test(methodText);
}

// ── Check 4: recipe-family validity — is the chosen method compatible
//    with the ingredients actually present? ────────────────────────────────
export function checkFamilyValidity(name, ingredients, methodText) {
  const nameLower = String(name || '').toLowerCase();
  const ingredientText = (ingredients || []).join(' ').toLowerCase();
  const method = methodText.toLowerCase();
  const problems = [];

  // Pancake/waffle with batter ingredients must build AND cook a batter.
  if (/pancake|waffle/.test(nameLower) && /\b(flour|egg)\b/.test(ingredientText)) {
    if (!/batter/.test(method)) problems.push('pancake/waffle with flour+egg but no batter step');
    if (!COOK_VERB_PATTERN.test(method)) problems.push('pancake/waffle batter never cooked');
  }

  // A cold yogurt/cereal bowl must not silently contain raw protein.
  if (/put .* in a bowl/.test(method) && /top with/.test(method)) {
    const rawProteins = [...RAW_PROTEINS_REQUIRING_A_COOK_STEP].filter(p => (
      ingredientText.includes(p) && !/(smoked|tinned|canned|cooked)/.test(ingredientText)
    ));
    if (rawProteins.length) problems.push(`cold assembled bowl contains raw ${rawProteins.join('/')}`);
  }

  // Wrap/sandwich family should have a real carrier, unless it's a
  // recognised lettuce-vessel dish.
  if (/\b(wrap|sandwich|toast|bagel|pitta)\b/.test(nameLower)) {
    const hasCarrier = /\b(bread|bagel|wrap|tortilla|pitta|roll|toast)\b/.test(ingredientText);
    const isLettuceVessel = /\b(lettuce|leaves)\b/.test(ingredientText) && !hasCarrier;
    if (!hasCarrier && !isLettuceVessel) problems.push('wrap/sandwich family with no bread/tortilla carrier');
    if (!hasCarrier && /toast or warm/.test(method)) problems.push('"toast or warm" with nothing to toast');
  }

  // Rice/pasta cooking must only be invoked when the actual starch exists.
  if (/cook the rice/.test(method) && !/\brice\b/.test(ingredientText.replace(/rice cakes?/g, ''))) {
    problems.push('"cook the rice" with no actual rice ingredient');
  }
  if (/cook the pasta/.test(method) && !/\b(pasta|spaghetti|orzo|noodle)\b/.test(ingredientText)) {
    problems.push('"cook the pasta" with no actual pasta ingredient');
  }

  // A salad should not hot-cook every component via a generic fallback.
  if (/\bsalad\b/.test(nameLower) && /warm everything gently in a pan/.test(method)) {
    problems.push('salad routed through a hot generic-warming fallback');
  }

  return problems;
}

// ── Check 5: structural flavour completeness (savoury cooked dishes) ──────
// Deliberately structural, NOT a judgement about taste. Only applied to
// savoury dishes that involve real cooking — a boiled egg or a yogurt pot
// legitimately needs nothing here.
// Trailing \b is deliberately omitted on pluralisable nouns: "\btomato\b"
// does not match "tomatoes", which previously flagged dishes that plainly
// had a tomato base. Coconut milk is a genuine curry sauce base and was
// missing entirely.
const FLAVOUR_COMPONENT = /\b(garlic|ginger|onion|shallot|leek|celery|chilli|herb|spice|paprika|cumin|turmeric|cinnamon|oregano|basil|thyme|rosemary|coriander|parsley|dill|mint|masala|ras el hanout|curry|stock|soy sauce|tamari|miso|pesto|harissa|tahini|mustard|vinegar|balsamic|glaze|gravy|honey|maple|lemon|lime|dressing|sauce|salsa|hoisin|sriracha|mayo|hummus|cheese|parmesan|feta|halloumi|cheddar|mozzarella|ricotta|tomato|coconut milk|coconut cream|olive oil|sesame|peanut butter|nutritional yeast|pickle|kimchi|olives?)/i;
const SAVOURY_COOKED = /(curry|chilli|stew|soup|bake|roast|stir-fry|risotto|bolognese|casserole|dahl|dal|pie|traybake|hash)/i;

export function checkFlavourCompleteness(name, ingredients) {
  if (!SAVOURY_COOKED.test(String(name || ''))) return false;
  return !(ingredients || []).some(item => FLAVOUR_COMPONENT.test(item));
}
