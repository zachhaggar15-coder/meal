// Which foods a diet rules out, and whether a sentence recommends one.
//
// This lives in its own module for a load-order reason, not a tidiness one.
// comboLandingPages.js needs exactly this one function, and it used to import
// it from planBuilder.js. That single import chained
// App -> Navbar/Sidebar -> navigation.js -> comboLandingPages.js ->
// planBuilder.js -> planMacroIndex.js, so every page on the site — the
// homepage included — downloaded the whole plan generator and a 1,055-entry
// macro table to render a nav menu. Initial JavaScript went over its budget.
//
// The function itself is pure and depends on nothing, so keeping it here lets
// the nav take the few hundred bytes it actually needs. planBuilder re-exports
// it, so its existing callers are unaffected.

// Foods each diet rules out. Deliberately excludes plant analogues, which are
// compatible: "soya milk", "oat milk", "vegan cheese", "plant-based mince".
const PLANT_QUALIFIER = '(?<!\\bplant[- ])(?<!\\bplant-based )(?<!\\bvegan )(?<!\\bsoya )(?<!\\bsoy )(?<!\\bsoy-)(?<!\\boat )(?<!\\balmond )(?<!\\bcoconut )(?<!\\bmeat-free )(?<!\\bdairy-free )(?<!\\bno )(?<!\\bpeanut )(?<!\\bnut )(?<!\\bcashew )(?<!\\bquorn )(?<!\\btofu )(?<!\\bmeat-free )(?<!\\bmeatless )(?<!\\bveggie )(?<!\\bvegetarian )';
// "meat-free", "dairy-free" and "fish-free" describe the absence of the food,
// so the word appearing there is compatible copy, not a contradiction.
const FREE_SUFFIX = '(?!\\s*-\\s*free)(?!-free)(?! free\\b)(?! alternative)(?! substitute)(?! analogue)';
const MEAT = 'chicken|beef|pork|lamb|turkey|bacon|ham|mince|meat|steak|sausages?';
const FISH = 'fish|salmon|tuna|cod|prawns?|mackerel|sardines?|anchov(?:y|ies)|seafood';
const ANIMAL = 'eggs?|egg whites?|dairy|yogurt|yoghurt|quark|cottage cheese|cheese|halloumi|feta|whey|milk|butter|honey';

export const DIET_EXCLUDED_FOODS = {
  vegan: new RegExp(`${PLANT_QUALIFIER}\\b(?:${MEAT}|${FISH}|${ANIMAL})\\b${FREE_SUFFIX}`, 'i'),
  vegetarian: new RegExp(`${PLANT_QUALIFIER}\\b(?:${MEAT}|${FISH})\\b${FREE_SUFFIX}`, 'i'),
  pescatarian: new RegExp(`${PLANT_QUALIFIER}\\b(?:${MEAT})\\b${FREE_SUFFIX}`, 'i'),
  standard: null,
};

/** Does this sentence recommend something the diet rules out? */
export function conflictsWithDiet(text, dietType) {
  const excluded = DIET_EXCLUDED_FOODS[dietType];
  if (!excluded || typeof text !== 'string') return null;
  const match = excluded.exec(text);
  return match ? match[0] : null;
}
