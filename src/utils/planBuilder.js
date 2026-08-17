import { MEALS } from '../data/mealLibrary.js';
import { INDEXABLE_PLAN_SEEDS } from '../data/planSeeds.js';
import { getStoreMealBias, getSupermarketProfile, PRICING_CONTEXT_CHECKED } from '../data/supermarketProfiles.js';
import { isCountUnit } from './countUnits.js';
import {
  averageDailyMacros,
  computeMealNutrition,
  computeMealNutritionRaw,
  sumNutrition,
} from './nutrition.js';
import { getCookingIngredientDisplay } from './cookingQuantities.js';
import { buildPracticalRecipeSteps } from './recipeQuality.js';
import { NUTRITION_TABLE } from '../data/nutritionTable.js';
import { sharedPrimaryProteins, primaryProteinSignature } from './ingredientRoles.js';

// ── Constants ─────────────────────────────────────────────────────────────────

export const GOAL_LABELS = {
  'weight-loss': 'Weight Loss',
  'high-protein-low-cal': 'High Protein Low Calorie',
  'muscle-gain': 'Muscle Gain',
  'budget-fat-loss': 'Budget Fat Loss',
  'cheap-student': 'Cheap Student',
  'busy-professional': 'Busy Professional',
  'low-effort': 'Low Effort',
  'vegetarian-low-cal': 'Vegetarian Low Calorie',
  'vegan-low-cal': 'Vegan Low Calorie',
  'high-protein-vegetarian': 'High Protein Vegetarian',
  'pescatarian': 'Pescatarian',
  'budget-bodybuilding': 'Budget Bodybuilding',
  'gym-beginner': 'Gym Beginner',
  'cheap-high-protein': 'Cheap High Protein',
  'maintenance': 'Maintenance',
  'anti-inflammatory': 'Anti-Inflammatory',
  'menopause-nutrition': 'Menopause Nutrition',
  'endurance-athlete': 'Endurance & Running',
  'body-recomp': 'Body Recomposition',
  'cutting': 'Cutting Phase',
};

export const BUDGET_ESTIMATES = {
  'very-cheap': '£20–30',
  'budget': '£30–40',
  'moderate': '£40–55',
  'flexible': '£50–70',
};

const SUPERMARKET_LABELS = {
  aldi: 'Aldi',
  lidl: 'Lidl',
  tesco: 'Tesco',
  asda: 'Asda',
  sainsburys: "Sainsbury's",
  morrisons: 'Morrisons',
  iceland: 'Iceland',
  waitrose: 'Waitrose',
  ocado: 'Ocado',
  'marks-spencer': 'M&S',
  coop: 'Co-op',
  any: 'UK',
};

export const EFFORT_LABELS = {
  'minimal': 'Minimal (under 10 min/day)',
  'low': 'Low (10–20 min/day)',
  'standard': 'Standard (20–30 min/day)',
  'batch': 'Batch cook (prep on Sunday)',
  'high-variety': 'Higher variety',
};

export const MACRO_PROFILES = {
  'lean-protein':   { protein: 90, carbs: 50, fats: 35, fibre: 55 },
  'performance-protein': { protein: 82, carbs: 82, fats: 45, fibre: 58 },
  'high-carb-fuel': { protein: 58, carbs: 92, fats: 38, fibre: 62 },
  'whole-food':     { protein: 65, carbs: 60, fats: 50, fibre: 80 },
  'batch-cooking':  { protein: 75, carbs: 65, fats: 45, fibre: 60 },
  'minimal-effort': { protein: 60, carbs: 65, fats: 50, fibre: 50 },
  'frozen-friendly':{ protein: 65, carbs: 70, fats: 55, fibre: 45 },
  'high-variety':   { protein: 70, carbs: 60, fats: 55, fibre: 65 },
  'low-cal-swaps':  { protein: 70, carbs: 55, fats: 40, fibre: 60 },
  'recomp-protein': { protein: 88, carbs: 62, fats: 42, fibre: 60 },
};

// Estimated average daily gram targets per emphasis type.
// Quiz custom macro matching and plan displays use these concrete values.
export const MACRO_GRAMS = {
  'lean-protein':   { protein: 160, carbs: 150, fats: 55, fibre: 30 },
  'performance-protein': { protein: 170, carbs: 230, fats: 60, fibre: 35 },
  'high-carb-fuel': { protein: 125, carbs: 280, fats: 65, fibre: 40 },
  'whole-food':     { protein: 100, carbs: 220, fats: 65, fibre: 42 },
  'batch-cooking':  { protein: 130, carbs: 200, fats: 60, fibre: 35 },
  'minimal-effort': { protein: 90,  carbs: 210, fats: 70, fibre: 25 },
  'frozen-friendly':{ protein: 100, carbs: 225, fats: 70, fibre: 25 },
  'high-variety':   { protein: 120, carbs: 190, fats: 65, fibre: 35 },
  'low-cal-swaps':  { protein: 120, carbs: 160, fats: 50, fibre: 35 },
  'recomp-protein': { protein: 165, carbs: 190, fats: 60, fibre: 35 },
};

// Why each emphasis targets the macro split it does (see MACRO_PROFILES above),
// and the protein swaps that actually fit that approach. Without this, the
// "higher protein" swap list was one fixed array of five lines rendered
// identically on every plan page regardless of goal, effort or supermarket —
// real duplicate content across 1,000+ URLs. This ties the visible copy back
// to an attribute the meal-selection algorithm already treats as meaningful.
const EMPHASIS_CONTEXT = {
  'lean-protein': {
    // Emphasis is chosen independently of goal, so this sentence is rendered on
    // muscle-gain, bodybuilding and recomp plans too. Naming fat loss here put
    // fat-loss copy on 64 gain-type plans. Describe what the emphasis does —
    // protein density per calorie — and let the goal copy state the goal.
    rationale: 'Meals lean on lower-fat protein — chicken breast, white fish, egg whites, low-fat dairy — so each meal carries more protein for the calories it costs, leaving room to hit the day\'s target without relying on volume alone.',
    distinguisher: 'the meal selection is biased toward lower-fat protein sources rather than just hitting a protein number however it can',
    proteinSwaps: [
      'Add extra egg whites (3–4) to a breakfast instead of whole eggs — protein without the extra fat',
      'Swap a carb portion for extra chicken breast or white fish on higher-hunger days',
      'Use 0% fat Greek yogurt or quark instead of standard yogurt for the same volume, far more protein',
    ],
  },
  'batch-cooking': {
    rationale: 'Meals are chosen to hold up after a few days in the fridge or freezer — stews, chillies, tray bakes and grain bowls — rather than anything that goes soggy or dries out on reheating.',
    distinguisher: 'meals are filtered for how well they hold up over several days, not just for taste on day one',
    proteinSwaps: [
      'Cook an extra portion of mince or beans into the weekly batch — cheap to add, keeps well',
      'Add tinned beans or lentils to a batch-cooked chilli or curry for extra protein at low cost',
      'Portion cooked chicken thighs into the freezer in 100g bags to add to any meal without extra cooking',
    ],
  },
  'frozen-friendly': {
    rationale: 'Meals are built around ingredients that freeze well — frozen fish, frozen vegetables, freezer-friendly bases — so a weekly shop keeps for longer and less goes to waste.',
    distinguisher: 'ingredients are chosen so a single shop keeps for the full week without a mid-week top-up',
    proteinSwaps: [
      'Keep a bag of frozen prawns or white fish fillets as a fast protein top-up on any meal',
      'Frozen chicken breast portions cost less than fresh and add protein without a special shop',
      'Add frozen edamame to a rice or noodle dish for extra plant protein with no prep',
    ],
  },
  'high-carb-fuel': {
    rationale: 'Carbohydrate sits higher relative to protein in this plan — useful when training volume is high and the priority is fuelling sessions rather than restricting calories.',
    distinguisher: 'the carb-to-protein ratio is deliberately higher than a typical fat-loss plan, to leave enough fuel for training',
    proteinSwaps: [
      'Stir a scoop of whey or plant protein into porridge or a smoothie rather than swapping out rice or pasta',
      'Add a protein source alongside the carb-heavy meals (extra chicken, tofu or eggs) instead of replacing carbs',
      'Use a higher-protein bread or pasta as a straight swap without changing portion sizes',
    ],
  },
  'high-variety': {
    rationale: 'Meals deliberately rotate protein sources and formats across the week — this plan avoids repeating the same protein twice in one day so the week does not feel monotonous.',
    distinguisher: 'the meal rotation actively avoids repeating the same protein twice in one day',
    proteinSwaps: [
      'Rotate in a protein you have not used yet that week (turkey, tofu, prawns) rather than repeating the same one',
      'Add a handful of nuts or seeds to a salad or bowl for a different protein source and texture',
      'Swap one dairy-based snack for a plant-based one (edamame, hummus) to keep variety going',
    ],
  },
  'low-cal-swaps': {
    rationale: 'Every meal already carries at least one lower-calorie swap — egg whites instead of whole eggs, cauliflower rice, extra lean protein instead of extra carbs — to keep calories down without cutting protein.',
    distinguisher: 'each meal already has a lower-calorie substitution built in, rather than leaving that to you',
    proteinSwaps: [
      'Use 0% fat Greek yogurt or quark in place of standard yogurt for more protein at a similar calorie cost',
      'Add a hard-boiled egg or egg white as an afternoon snack instead of a higher-calorie option',
      'Swap a carb side for extra lean protein when a meal feels short on fullness',
    ],
  },
  'minimal-effort': {
    rationale: 'Meals need close to no active cooking — assemble-and-eat, one-pan or ready-to-eat combinations — so the plan stays realistic on the busiest days.',
    distinguisher: 'meals are filtered for near-zero active cooking time, not just for being quick recipes',
    proteinSwaps: [
      'Keep tinned tuna, mackerel or pre-cooked chicken on hand for a zero-prep protein top-up',
      'Add cottage cheese or a protein yogurt as a snack — no cooking, no extra washing up',
      'A ready-made protein shake covers a gap without adding a single extra step',
    ],
  },
  'performance-protein': {
    rationale: 'Both protein and carbohydrate run high in this plan — it is built for training performance and recovery, not calorie restriction, so there is no need to trade one macro off against the other.',
    distinguisher: 'both protein and carbs are set high together, rather than trading one off against the other',
    proteinSwaps: [
      'Add a post-workout combination of fast carbs and protein (banana and whey, or chocolate milk) after harder sessions',
      'Use an extra portion of chicken, fish or tofu on higher-training days rather than cutting carbs to make room',
      'Greek yogurt with fruit and granola covers both protein and carb needs in one snack',
    ],
  },
  'recomp-protein': {
    rationale: 'Protein sits high relative to the calorie target — the aim is building muscle and losing fat at the same time, which needs more protein than either goal alone. Whether that target sits above or below your own maintenance depends on your energy needs.',
    distinguisher: 'protein is set higher than a typical weight-loss plan without cutting calories as hard',
    proteinSwaps: [
      'Add 2–3 extra egg whites to breakfast rather than increasing portion size across the board',
      'Use a protein shake as a between-meal top-up instead of an extra carb-based snack',
      'Swap a starchy side for extra chicken, fish or tofu when a meal runs light on protein',
    ],
  },
  'whole-food': {
    rationale: 'Protein comes from whole foods — fish, eggs, dairy, legumes — rather than protein powders or bars, in line with the whole-food approach this plan takes throughout.',
    distinguisher: 'protein comes from whole foods throughout, with no reliance on powders or bars',
    proteinSwaps: [
      'Add an extra tin of fish (mackerel, sardines, tuna) rather than reaching for a protein bar',
      'Use extra eggs or cottage cheese as a whole-food protein top-up between meals',
      'Swap a processed snack for a handful of nuts and a boiled egg to keep protein whole-food',
    ],
  },
};

// ── Diet-aware copy ───────────────────────────────────────────────────────────
//
// Meal *selection* has always respected the plan's diet. The prose generated
// alongside it did not: emphasis is chosen independently of diet, so a vegan
// plan could explain itself with "protein comes from whole foods — fish, eggs,
// dairy" and offer "add an extra tin of fish" as a suggestion. The meals were
// vegan throughout; the sentence under the H1 contradicted them.
//
// Foods each diet rules out. Deliberately excludes plant analogues, which are
// compatible: "soya milk", "oat milk", "vegan cheese", "plant-based mince".
const PLANT_QUALIFIER = '(?<!\\bplant[- ])(?<!\\bplant-based )(?<!\\bvegan )(?<!\\bsoya )(?<!\\bsoy )(?<!\\bsoy-)(?<!\\boat )(?<!\\balmond )(?<!\\bcoconut )(?<!\\bmeat-free )(?<!\\bdairy-free )(?<!\\bno )(?<!\\bpeanut )(?<!\\bnut )(?<!\\bcashew )(?<!\\bquorn )(?<!\\btofu )(?<!\\bmeat-free )(?<!\\bmeatless )(?<!\\bveggie )(?<!\\bvegetarian )';
// "meat-free", "dairy-free" and "fish-free" describe the absence of the food,
// so the word appearing there is compatible copy, not a contradiction.
const FREE_SUFFIX = '(?!\\s*-\\s*free)(?!-free)(?! free\\b)(?! alternative)(?! substitute)(?! analogue)';
const MEAT = 'chicken|beef|pork|lamb|turkey|bacon|ham|mince|meat|steak|sausages?';
const FISH = 'fish|salmon|tuna|cod|prawns?|mackerel|sardines?|anchov(?:y|ies)|seafood';
const ANIMAL = 'eggs?|egg whites?|dairy|yogurt|yoghurt|quark|cottage cheese|cheese|halloumi|feta|whey|milk|butter|honey';

const DIET_EXCLUDED_FOODS = {
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

// Diet-appropriate protein suggestions, used to top up a list after the
// incompatible lines have been filtered out, so a vegan reader still gets three
// usable suggestions rather than a short or empty section.
const DIET_PROTEIN_SWAPS = {
  vegan: [
    'Stir a scoop of plant protein into porridge, oats or a smoothie for an easy 20g',
    'Add extra firm tofu, tempeh or edamame to any bowl or stir-fry',
    'Keep tinned lentils, chickpeas and black beans in to bulk out a meal at low cost',
    'Use soya milk rather than other plant milks — it carries roughly three times the protein',
  ],
  vegetarian: [
    'Add a couple of eggs or a portion of cottage cheese as a whole-food protein top-up',
    'Use 0% fat Greek yogurt or quark in place of standard yogurt — same volume, far more protein',
    'Stir extra tinned lentils or chickpeas through a curry, chilli or salad',
    'Swap standard cheese for a portion of paneer or halloumi in a lunch salad',
  ],
  pescatarian: [
    'Keep tinned tuna, mackerel or sardines in for a fast protein top-up with no cooking',
    'Add extra white fish or prawns to a bowl, curry or pasta dish',
    'Use 0% fat Greek yogurt or quark instead of standard yogurt for more protein',
    'Add a couple of eggs or extra firm tofu when a meal runs light on protein',
  ],
};

/** Drop suggestions the diet rules out, topping the list back up to `keep`. */
function adaptSuggestions(suggestions, dietType, keep = 3) {
  if (!DIET_EXCLUDED_FOODS[dietType]) return suggestions;
  const compatible = (suggestions || []).filter(s => !conflictsWithDiet(s, dietType));
  if (compatible.length >= keep) return compatible.slice(0, keep);
  const topUp = (DIET_PROTEIN_SWAPS[dietType] || []).filter(s => !compatible.includes(s));
  return [...compatible, ...topUp].slice(0, keep);
}

// Where the default rationale names specific foods, a diet needs its own
// sentence rather than a filtered one — you cannot delete "fish, eggs, dairy"
// from the middle of an explanation and still have it read.
const EMPHASIS_BY_DIET = {
  'lean-protein': {
    vegan: {
      rationale: 'Meals lean on lower-fat plant protein — tofu, tempeh, seitan, pulses and soya — so each meal carries more protein for the calories it costs, leaving room to hit the day\'s target without relying on volume alone.',
      distinguisher: 'the meal selection is biased toward higher-protein plant foods rather than just hitting a protein number however it can',
    },
    vegetarian: {
      rationale: 'Meals lean on lower-fat vegetarian protein — egg whites, low-fat dairy, tofu and pulses — so each meal carries more protein for the calories it costs, leaving room to hit the day\'s target without relying on volume alone.',
    },
    pescatarian: {
      rationale: 'Meals lean on lower-fat protein — white fish, prawns, egg whites and low-fat dairy — so each meal carries more protein for the calories it costs, leaving room to hit the day\'s target without relying on volume alone.',
    },
  },
  'frozen-friendly': {
    vegan: {
      rationale: 'Meals are built around ingredients that freeze well — frozen vegetables, edamame, frozen fruit and freezer-friendly bases — so a weekly shop keeps for longer and less goes to waste.',
    },
    vegetarian: {
      rationale: 'Meals are built around ingredients that freeze well — frozen vegetables, frozen fruit, tofu and freezer-friendly bases — so a weekly shop keeps for longer and less goes to waste.',
    },
  },
  'low-cal-swaps': {
    vegan: {
      rationale: 'Every meal already carries at least one lower-calorie swap — cauliflower rice, extra tofu or pulses instead of extra carbs, lighter plant milks — to keep calories down without cutting protein.',
    },
  },
  'whole-food': {
    vegan: {
      rationale: 'Protein comes from whole foods — pulses, tofu, tempeh, nuts and seeds — rather than protein powders or bars, in line with the whole-food approach this plan takes throughout.',
    },
    vegetarian: {
      rationale: 'Protein comes from whole foods — eggs, dairy, pulses and tofu — rather than protein powders or bars, in line with the whole-food approach this plan takes throughout.',
    },
  },
};

// Goal descriptions name foods as well, and goal is orthogonal to diet, so the
// anti-inflammatory line opened every vegan anti-inflammatory plan with "oily
// fish". Only the goals whose wording names a food need a variant.
const GOAL_BEST_FOR_BY_DIET = {
  'anti-inflammatory': {
    vegan: 'Mediterranean-style planning built on plants, pulses and whole foods',
    vegetarian: 'Mediterranean-style planning with plants, pulses and whole foods',
  },
};

function getGoalBestFor(goal, dietType = 'standard') {
  return GOAL_BEST_FOR_BY_DIET[goal]?.[dietType]
    || GOAL_BEST_FOR[goal]
    || 'General healthy eating';
}

function getEmphasisContext(emphasis, dietType = 'standard') {
  const base = EMPHASIS_CONTEXT[emphasis] || EMPHASIS_CONTEXT['lean-protein'];
  const override = EMPHASIS_BY_DIET[emphasis]?.[dietType] || {};
  return {
    ...base,
    ...override,
    proteinSwaps: adaptSuggestions(base.proteinSwaps, dietType),
  };
}

const GOAL_BEST_FOR = {
  'weight-loss': 'Anyone aiming for a sustainable calorie deficit',
  'high-protein-low-cal': 'Higher-protein meal planning within a lower-calorie target',
  'muscle-gain': 'Muscle building, at a higher daily calorie target',
  'budget-fat-loss': 'Budget-conscious fat loss on ~£30/week',
  'cheap-student': 'Students on a tight budget',
  'busy-professional': 'Minimal daily cooking, batch prep',
  'low-effort': 'Simple meals with minimal cooking',
  'vegetarian-low-cal': 'Vegetarians cutting calories',
  'vegan-low-cal': 'Vegans working to a lower daily calorie target',
  'high-protein-vegetarian': 'High-protein meat-free eating',
  'pescatarian': 'Fish and plant-based meals',
  'budget-bodybuilding': 'Budget-focused muscle building',
  'gym-beginner': 'New to structured gym nutrition',
  'cheap-high-protein': 'Maximum protein on a tight budget',
  'maintenance': 'Steady, balanced eating around a ~2,000 kcal/day target',
  'anti-inflammatory': 'Mediterranean-style planning with oily fish, plants and whole foods',
  'menopause-nutrition': 'General meal planning with protein, fibre and calcium-rich foods',
  'endurance-athlete': 'Fuelling running and endurance training with higher-carb meals',
  'body-recomp': 'Body recomposition: high protein with a moderate calorie target',
  'cutting': 'A structured lower-calorie, higher-protein plan for active adults',
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const PLAN_SEED_BY_SLUG = new Map(INDEXABLE_PLAN_SEEDS.map(seed => [seed.slug, seed]));
const INDEXABLE_PLAN_SLUGS = new Set(INDEXABLE_PLAN_SEEDS.map(seed => seed.slug));
const PLAN_SEEDS_BY_GOAL = groupSeedsBy(INDEXABLE_PLAN_SEEDS, 'goal');
const PLAN_SEEDS_BY_SUPERMARKET = groupSeedsBy(INDEXABLE_PLAN_SEEDS, 'supermarket');
const MEAL_NUTRITION_CACHE = new Map();

// ── Diet filtering ─────────────────────────────────────────────────────────────

function getEligibleMeals(dietType) {
  switch (dietType) {
    case 'vegan':
      return MEALS.filter(m => m.diet === 'vegan');
    case 'vegetarian':
      return MEALS.filter(m => m.diet === 'vegetarian' || m.diet === 'vegan');
    case 'pescatarian':
      return MEALS.filter(m => m.diet !== 'standard');
    default:
      return MEALS;
  }
}

// Deterministic selection: cycles through array with an offset
function pick(arr, seed) {
  if (!arr || arr.length === 0) return null;
  return arr[((seed % arr.length) + arr.length) % arr.length];
}

// Main protein keywords in priority order — used to avoid same-protein lunch+dinner on one day
// Was MAIN_PROTEIN_KW: eleven meat and fish words, checked with a substring
// match. Every vegan and vegetarian lunch and dinner in the library returned
// null under it, so the collision guard below short-circuited and did nothing
// for precisely the diets with the smallest protein pools. It also read `mince`
// and `steak` as beef, so turkey and tuna dishes registered as beef.
// ingredientRoles now owns this; see primaryProteinSignature there.
// A week of lunches and dinners cannot avoid same-day repetition if the pool
// offers fewer than two genuinely different proteins to alternate between.
const MIN_DISTINCT_PROTEINS = 3;

function mealsShareProtein(a, b) {
  return sharedPrimaryProteins(a, b).length > 0;
}

function isBatchPlan(seed) {
  return seed.effort === 'batch';
}

function batchFriendlyMeals(meals, fallback = meals) {
  const batchable = meals.filter(meal => (meal.tags || []).includes('batch-friendly'));
  return batchable.length ? batchable : fallback;
}

function easyBatchSnacks(meals, fallback = meals) {
  const batchable = meals.filter(meal => {
    const tags = meal.tags || [];
    return tags.includes('batch-friendly') || tags.includes('easy');
  });
  return batchable.length ? batchable : fallback;
}

function pickDifferent(arr, seed, usedIds = new Set()) {
  if (!arr || arr.length === 0) return null;
  for (let offset = 0; offset < arr.length; offset += 1) {
    const meal = pick(arr, seed + offset);
    if (meal && !usedIds.has(meal.id)) return meal;
  }
  return pick(arr, seed);
}

function pickDinnerForLunch(dinners, seed, lunch, usedIds = new Set()) {
  for (let offset = 0; offset < dinners.length; offset += 1) {
    const dinner = pick(dinners, seed + offset);
    if (!dinner || usedIds.has(dinner.id)) continue;
    if (!mealsShareProtein(lunch, dinner)) return dinner;
  }
  // Nothing in the pool avoids it — keep a valid plan rather than none.
  return pickDifferent(dinners, seed, usedIds);
}

// ── Shopping list builder ──────────────────────────────────────────────────────

const PROTEIN_KW    = ['chicken','beef','steak','sirloin','turkey','pork','bacon','tuna','salmon','mackerel','cod','sardine','prawn','egg','tofu','lentil','chickpea','black bean','kidney bean','quorn','tempeh','mince','falafel','whey protein','protein powder','vegan protein powder','pea protein'];
const CARB_KW       = ['bread','rice','pasta','oat','potato','tortilla','roll','pitta','noodle','flour','wraps','granola','quinoa','couscous','orzo','soba'];
const DAIRY_KW      = ['milk','yogurt','yoghurt','cheese','cream','butter','skyr','ricotta','halloumi','cottage cheese','mozzarella','parmesan','feta','creme fraiche','crème fraîche','mascarpone','kefir'];
const VEG_KW        = ['spinach','broccoli','pepper','courgette','tomato','carrot','onion','lettuce','leaf','leaves','kale','cucumber','celery','avocado','mushroom','butternut squash','sweet potato','parsnip','pea','edamame','corn','bean sprout','green bean','runner bean','cabbage','leek','asparagus','watercress','rocket','mixed veg','frozen veg','pak choi','bok choy','aubergine','coleslaw','radish','fennel','beetroot','turnip','swede'];
const FRUIT_KW      = ['banana','apple','orange','mango','berry','strawberry','blueberry','raspberry','grape','peach','pear','plum','melon','pineapple','pomegranate','kiwi','apricot','nectarine','grapefruit','dates','raisins','dried fruit','dried mango','dried apricot'];
const HERB_KW       = ['garlic','ginger','chilli','cumin','turmeric','paprika','cinnamon','oregano','basil','thyme','rosemary','coriander','parsley','mixed herbs','bay leaf','black pepper','white pepper','cayenne','nutmeg','cardamom','clove','star anise','fenugreek','chive','dill','mint','tarragon','sage','fennel seed','caraway','allspice','za\'atar','harissa','smoked paprika','ground coriander','ground cumin','curry powder','garam masala','five spice','mixed spice'];
const CONDIMENT_KW  = ['olive oil','vegetable oil','sunflower oil','coconut oil','sesame oil','rapeseed oil','soy sauce','tamari','honey','mayo','mayonnaise','mustard','ketchup','vinegar','dressing','paste','stock','gravy','miso','sriracha','tabasco','worcestershire','fish sauce','oyster sauce','hoisin','teriyaki','tahini','pesto','salsa','relish','chutney','jam','hummus','peanut butter','almond butter','nut butter','hot sauce','sweet chilli','reduced sugar sauce'];
const TIN_KW        = ['tinned','canned','baked bean','mixed bean','butter bean','cannellini','haricot','flageolet','borlotti'];
const SHOPPING_CATEGORY_FAMILIES = [
  ['condiments', CONDIMENT_KW],
  ['fruit', FRUIT_KW],
  ['dairy', DAIRY_KW],
  ['protein', PROTEIN_KW],
  ['vegetables', VEG_KW],
  ['carbs', CARB_KW],
  ['herbs', HERB_KW],
  ['tins', TIN_KW],
].map(([category, keywords]) => [
  category,
  keywords.map(keyword => normaliseIngredientPhrase(keyword).split(' ').filter(Boolean)),
]);
const SHOPPING_CATEGORY_CACHE = new Map();

function categoriseIngredient(ing) {
  const normalised = normaliseIngredientPhrase(ing);
  const categoryKey = normalised.replace(/\b\d+\b/g, '').replace(/\s+/g, ' ').trim();
  const cached = SHOPPING_CATEGORY_CACHE.get(categoryKey);
  if (cached) return cached;

  // A phrase can match keywords from more than one family (e.g. "black
  // pepper" matches herbs' "black pepper" AND vegetables' "pepper", since
  // "pepper" is a substring token of "black pepper"). The most specific
  // (longest) keyword match wins rather than the first family checked, so
  // multi-word herb/spice names are not shadowed by shorter produce names.
  let bestCategory = 'extras';
  let bestLength = 0;
  for (const [category, keywordTokenGroups] of SHOPPING_CATEGORY_FAMILIES) {
    const matchLength = longestMatchingKeywordLength(categoryKey, keywordTokenGroups);
    if (matchLength > bestLength) {
      bestLength = matchLength;
      bestCategory = category;
    }
  }
  SHOPPING_CATEGORY_CACHE.set(categoryKey, bestCategory);
  return bestCategory;
}

function longestMatchingKeywordLength(normalisedIngredient, keywordTokenGroups) {
  const ingredientTokens = normalisedIngredient.split(' ').filter(Boolean);
  let longest = 0;

  for (const keywordTokens of keywordTokenGroups) {
    if (!keywordTokens.length || keywordTokens.length > ingredientTokens.length) continue;
    if (keywordTokens.length <= longest) continue;

    const matches = ingredientTokens.some((_, start) => keywordTokens.every((keywordToken, offset) => (
      ingredientTokenMatches(ingredientTokens[start + offset], keywordToken)
    )));
    if (matches) longest = keywordTokens.length;
  }

  return longest;
}

function ingredientTokenMatches(ingredientToken, keywordToken) {
  if (!ingredientToken) return false;
  if (ingredientToken === keywordToken) return true;
  if (keywordToken.endsWith('y')) return ingredientToken === `${keywordToken.slice(0, -1)}ies`;
  if (keywordToken.endsWith('s')) return false;
  return ingredientToken === `${keywordToken}s` || ingredientToken === `${keywordToken}es`;
}

function normaliseIngredientPhrase(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function buildShoppingList(plan) {
  const grouped = { protein: new Map(), carbs: new Map(), vegetables: new Map(), dairy: new Map(), fruit: new Map(), herbs: new Map(), condiments: new Map(), tins: new Map(), extras: new Map() };

  for (const day of plan) {
    for (const meal of day.meals) {
      for (const rawIng of meal.calculationIngredients || meal.ingredients || []) {
        const ing = normaliseShoppingIngredient(rawIng);
        if (!ing) continue;
        const cat = categoriseIngredient(ing);
        addShoppingIngredient(grouped[cat], ing);
      }
    }
  }

  return Object.fromEntries(
    Object.entries(grouped).map(([cat, items]) => [
      cat,
      mergeConvertibleDuplicates([...items.values()]).map(formatShoppingIngredient),
    ]),
  );
}

// A small number of ingredients are only ever a sensible *purchase* unit in
// one form, even though recipes can state them either as a count or as a
// weight (e.g. "6 egg whites" vs a gram amount after portion scaling).
// Nobody buys "35 individual egg whites" — liquid/separated egg white is
// bought by weight/volume — so counted occurrences are normalised to grams
// up front using the same gramsEach figure the nutrition table already uses,
// before aggregation, rather than left as a whole-item count.
const KNOWN_ITEM_TO_GRAMS = {
  'egg white': NUTRITION_TABLE['egg white']?.gramsEach || 33,
  'egg whites': NUTRITION_TABLE['egg white']?.gramsEach || 33,
};

function applyKnownUnitOverride(parsed) {
  if (parsed.unit !== 'item' || parsed.amount === null) return parsed;
  const gramsEach = KNOWN_ITEM_TO_GRAMS[buildShoppingKey(parsed.label)];
  if (!gramsEach) return parsed;
  return {
    ...parsed,
    amount: parsed.amount * gramsEach,
    unit: 'g',
    key: `${buildShoppingKey(parsed.label)}|g|${buildShoppingKey(parsed.suffix)}`,
  };
}

function addShoppingIngredient(group, ingredient) {
  const parsed = applyKnownUnitOverride(parseShoppingIngredient(ingredient));
  const existing = group.get(parsed.key);

  if (!existing) {
    group.set(parsed.key, parsed);
    return;
  }

  if (parsed.amount !== null && existing.amount !== null && parsed.unit === existing.unit) {
    existing.amount += parsed.amount;
    return;
  }

  if (parsed.amount === null && existing.amount === null) {
    existing.count += 1;
  }
}

// Different recipes can state the same ingredient in incompatible units —
// grams in one meal, a whole-item count in another (e.g. "209g cherry
// tomatoes" and "10 cherry tomatoes") — which produces two separate,
// confusing purchase lines for one thing to buy. Where a verified
// gramsEach figure exists (the same data nutrition calculations already
// use), fold the counted line into the weighed one rather than leaving a
// duplicate. Ingredients with no such figure, or with more than the two
// convertible unit forms present, are left untouched — safer than guessing.
function mergeConvertibleDuplicates(items) {
  const buckets = new Map();
  for (const item of items) {
    const identityKey = `${buildShoppingKey(item.label)}|${buildShoppingKey(item.suffix)}`;
    const bucket = buckets.get(identityKey) || [];
    bucket.push(item);
    buckets.set(identityKey, bucket);
  }

  const merged = [];
  for (const bucket of buckets.values()) {
    merged.push(...(bucket.length > 1 ? combineConvertibleItems(bucket) : bucket));
  }
  return merged;
}

function combineConvertibleItems(bucket) {
  const gramItem = bucket.find(item => item.unit === 'g');
  const countItem = bucket.find(item => item.unit === 'item');
  const others = bucket.filter(item => item !== gramItem && item !== countItem);
  if (others.length || !gramItem || !countItem) return bucket;

  const gramsEach = NUTRITION_TABLE[buildShoppingKey(countItem.label)]?.gramsEach;
  if (!gramsEach) return bucket;

  const label = gramItem.label;
  const suffix = gramItem.suffix;
  return [{
    key: `${buildShoppingKey(label)}|g|${buildShoppingKey(suffix)}`,
    label,
    amount: gramItem.amount + (countItem.amount * gramsEach),
    unit: 'g',
    suffix,
    count: 1,
    amountFirst: false,
  }];
}

function parseShoppingIngredient(ingredient) {
  const cleaned = cleanPortionScaleText(ingredient);
  const leadingCountWithGramNote = cleaned.match(/^(\d+(?:\.\d+)?)\s+(.+?)\s*\(\s*\d+(?:\.\d+)?\s*g[^)]*\)$/i);
  if (leadingCountWithGramNote) {
    const [, amount, label] = leadingCountWithGramNote;
    const countNoun = label.match(/\b([a-z]+s?)\b(?=[^a-z]*$)/i)?.[1];
    if (isCountUnit(countNoun)) {
      return buildParsedIngredient(label, Number(amount), 'item', '', true);
    }
  }

  const measured = cleaned.match(/^(.*?)(\d+(?:\.\d+)?)\s*(kg|g|ml|l|tbsp|tsp)\b(.*)$/i);
  if (measured) {
    const [, prefix, amount, unit, suffix] = measured;
    const normalised = normaliseMeasuredAmount(Number(amount), unit);
    return buildParsedIngredient(prefix, normalised.amount, normalised.unit, suffix);
  }

  const countWithUnit = cleaned.match(/^(.*?)(\d+(?:\.\d+)?)\s+([a-z]+s?)\b(.*)$/i);
  if (countWithUnit && isCountUnit(countWithUnit[3])) {
    const [, prefix, amount, unit, suffix] = countWithUnit;
    return buildParsedIngredient(prefix, Number(amount), unit.toLowerCase(), suffix);
  }

  const mixedFraction = cleaned.match(/^(.*?)(?:(\d+)\s+)?(\d+)\s*\/\s*(\d+)(.*)$/);
  if (mixedFraction) {
    const [, prefix, whole = '0', numerator, denominator, suffix] = mixedFraction;
    const amount = Number(whole) + (Number(numerator) / Number(denominator));
    return buildParsedIngredient(prefix, amount, 'item', suffix);
  }

  const trailingCount = cleaned.match(/^(.*?)(\d+(?:\.\d+)?)(\s+(?:baked|cooked|roasted|grated|mashed|soft-boiled|hard-boiled))?$/i);
  if (trailingCount) {
    const [, prefix, amount, suffix = ''] = trailingCount;
    return buildParsedIngredient(prefix, Number(amount), 'item', suffix);
  }

  const wordAmount = cleaned.match(/\b(half|quarter)\b/i);
  if (wordAmount) {
    const amount = wordAmount[1].toLowerCase() === 'half' ? 0.5 : 0.25;
    const prefix = cleaned.slice(0, wordAmount.index);
    const suffix = cleaned.slice(wordAmount.index + wordAmount[0].length);
    return buildParsedIngredient(prefix, amount, 'item', suffix);
  }

  const leadingBareCount = cleaned.match(/^(\d+(?:\.\d+)?)\s+(.+)$/);
  if (leadingBareCount) {
    const [, amount, label] = leadingBareCount;
    return buildParsedIngredient(label, Number(amount), 'item');
  }

  const key = buildShoppingKey(cleaned);
  return { key, label: cleaned, amount: null, unit: '', suffix: '', count: 1 };
}

function buildParsedIngredient(prefix, amount, unit, suffix = '', amountFirst = false) {
  const label = prefix.trim();
  const cleanSuffix = suffix.trim();
  const key = `${buildShoppingKey(label)}|${unit}|${buildShoppingKey(cleanSuffix)}`;

  return {
    key,
    label,
    amount,
    unit,
    suffix: cleanSuffix,
    count: 1,
    amountFirst,
  };
}

function normaliseMeasuredAmount(amount, unit) {
  const lowerUnit = unit.toLowerCase();
  if (lowerUnit === 'kg') return { amount: amount * 1000, unit: 'g' };
  if (lowerUnit === 'l') return { amount: amount * 1000, unit: 'ml' };
  // tbsp and tsp are the same spoon measure at a fixed ratio (1 tbsp = 3
  // tsp). Recipes state small liquid/spoon amounts in either one, so without
  // this an ingredient like olive oil can appear as two separate purchase
  // lines — one in tsp, one in tbsp — for the same thing to buy.
  if (lowerUnit === 'tbsp') return { amount: amount * 3, unit: 'tsp' };
  return { amount, unit: lowerUnit };
}

// tsp is the canonical aggregation unit (see normaliseMeasuredAmount above),
// but a shopping line in double-digit teaspoons reads oddly — recipes and
// shoppers alike think in tablespoons past a certain size. This only affects
// display; aggregation and the underlying amount are unchanged.
function toShoppingDisplayUnit(amount, unit, roundUp) {
  if (unit !== 'tsp' || amount < 3) return { amount, unit };
  const tbsp = amount / 3;
  const rounded = roundUp ? Math.ceil(tbsp / 0.25) * 0.25 : Math.round(tbsp / 0.25) * 0.25;
  return { amount: rounded, unit: 'tbsp' };
}

function formatShoppingIngredient(item) {
  if (item.amount === null) {
    return item.count > 1 ? `${item.label} x${item.count}` : item.label;
  }

  const countable = item.unit === 'item' || isCountUnit(item.unit);
  const purchaseAmount = countable
    ? Math.max(1, Math.ceil(item.amount - Number.EPSILON))
    : roundShoppingMeasurementUp(item.amount, item.unit);
  const amount = item.unit === 'item'
    ? String(purchaseAmount)
    : isCountUnit(item.unit)
      ? `${purchaseAmount} ${formatCountUnit(item.unit, purchaseAmount)}`
      : formatMeasuredForDisplay(purchaseAmount, item.unit, true);
  const suffix = item.suffix ? ` ${item.suffix}` : '';
  const purchaseText = item.amountFirst
    ? `${amount} ${item.label}${suffix}`
    : `${item.label} ${amount}${suffix}`;
  return purchaseText.trim();
}

// A shopping list gives you ONE number: what to put in the trolley.
//
// It used to give two — "Chicken breast 1350g (about 1336g used)" — and the
// second one could never be worth reading, because of where it came from. The
// purchase amount is the canonical amount rounded UP to the nearest shoppable
// step by roundShoppingMeasurementUp below: 1g under 25g, rising to 50g past a
// kilo. So the gap the note reported was always smaller than one rounding
// step. It was not a fact about the recipes; it was the rounding, restated.
//
// Counted items were worse. "Eggs 10 (about 9¼ used)" and "Garlic 14 cloves
// (about 13½ used)" invited a cook to measure a quarter of an egg and half a
// clove — precision that exists only because a week's meals were summed and
// the total happened to land off a whole number.
//
// Both are gone. Buy 1350g of chicken; buy 10 eggs. Nutrition, macros, plan
// balancing and aggregation are untouched and still use the exact amount.
//
// Where purchase and use genuinely diverge, the divergence is in packs rather
// than grams — a tin you open and half use — and that is expressed by the tin
// itself in cookingQuantities.js, not by a decimal in brackets.

function formatMeasuredForDisplay(amount, unit, roundUp) {
  const display = toShoppingDisplayUnit(amount, unit, roundUp);
  return formatMeasuredAmount(display.amount, display.unit);
}

function roundShoppingMeasurementUp(value, unit) {
  const amount = Number(value);
  const lowerUnit = String(unit || '').toLowerCase();
  let increment = 0.25;

  if (lowerUnit === 'g' || lowerUnit === 'ml') {
    if (amount <= 25) increment = 1;
    else if (amount <= 100) increment = 5;
    else if (amount <= 500) increment = 10;
    else if (amount <= 1000) increment = 25;
    else increment = 50;
  } else if (lowerUnit === 'kg' || lowerUnit === 'l') {
    increment = 0.05;
  }

  return Math.ceil((amount - Number.EPSILON) / increment) * increment;
}

function normaliseShoppingIngredient(ing) {
  if (typeof ing === 'object' && ing !== null) {
    const name = ing.item || ing.name || '';
    const amount = ing.amount ? ` ${ing.amount}` : '';
    return `${name}${amount}`.trim();
  }
  return String(ing || '').trim();
}

// Two lines for one food is not a cosmetic problem: it makes the list SHORT.
// "Reduced-fat cheddar 35g" and "Cheddar reduced-fat 30g" sat in the same
// category of the same list, and a shopper who read either one bought 35g for
// recipes that use 57g. The two spellings came from the meal library naming one
// cheese two ways, which is fixed at source — but relying on every future
// ingredient being spelled consistently is how this happened the first time.
//
// Word order does not change what a food is, so it does not change the key
// either. "Frozen mixed veg" and "Mixed frozen veg" aggregate as one line
// whichever way a recipe happens to say it.
function buildShoppingKey(ing) {
  const cleaned = ing
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/\b\d+(\.\d+)?\s*(g|kg|ml|l|tsp|tbsp|cup|cups|x|medium|small|large|tin|tins|slice|slices|scoop|scoops|pack|packs)\b/g, '')
    .replace(/^\d+(\.\d+)?\s*/, '')
    .replace(/\b\d+(\.\d+)?\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return ing.toLowerCase();
  return cleaned.split(' ').sort().join(' ');
}

// ── SEO metadata ──────────────────────────────────────────────────────────────

const PLAN_TITLE_SUFFIX = '';
const PLAN_TITLE_MAX_LENGTH = 70;
const PLAN_DESCRIPTION_MAX_LENGTH = 155;

const COMPACT_GOAL_LABELS = {
  'weight-loss': 'Weight Loss',
  'high-protein-low-cal': 'High Protein',
  'muscle-gain': 'Muscle Gain',
  'budget-fat-loss': 'Budget Fat Loss',
  'cheap-student': 'Student Budget',
  'busy-professional': 'Work Lunch',
  'low-effort': 'Low Effort',
  'vegetarian-low-cal': 'Vegetarian Low Cal',
  'vegan-low-cal': 'Vegan Low Cal',
  'high-protein-vegetarian': 'High Protein Veg',
  pescatarian: 'Pescatarian',
  'budget-bodybuilding': 'Budget Bodybuilding',
  'gym-beginner': 'Gym Beginner',
  'cheap-high-protein': 'Cheap High Protein',
  maintenance: 'Maintenance',
  'anti-inflammatory': 'Anti-Inflammatory',
  'menopause-nutrition': 'Menopause',
  'endurance-athlete': 'Endurance',
  'body-recomp': 'Body Recomp',
  cutting: 'Cutting',
};

const SEO_TITLE_COLLISION_INDEX = buildSeoTitleCollisionIndex();

function buildSeo(seed) {
  const mkt = getMarketLabel(seed.supermarket);
  const gl = GOAL_LABELS[seed.goal] || seed.goal;
  const cal = seed.calories;
  const planTitle = buildCtrPlanTitle(seed, mkt, gl, cal);
  const planDescription = buildCtrPlanDescription(seed, mkt, gl, cal, planTitle);

  return {
    title: `${planTitle}${PLAN_TITLE_SUFFIX}`,
    description: planDescription,
    canonical: `https://www.mealprep.org.uk/plans/${seed.slug}`,
    ogTitle: planTitle,
    ogDescription: planDescription,
  };
}

function buildCtrPlanTitle(seed, marketLabel, goalLabel, calories) {
  const seedTitle = compactSeedPlanTitle(seed.title);
  const topic = buildCompactPlanTopic(seed, goalLabel);
  const market = marketLabel === 'UK' ? 'UK' : marketLabel;
  const caloriesText = calories.toLocaleString('en-GB');
  const candidates = buildPlanTitleCandidates(seedTitle, market, caloriesText, topic);
  const collisionIndex = SEO_TITLE_COLLISION_INDEX.get(seed.slug);
  const collisionCue = collisionIndex ? ` - Option ${collisionIndex}` : '';
  const selected = pickFirstWithinLimit(candidates, PLAN_TITLE_MAX_LENGTH, `${collisionCue}${PLAN_TITLE_SUFFIX}`);

  return `${selected}${collisionCue}`;
}

function buildPlanTitleCandidates(seedTitle, market, caloriesText, topic) {
  return [
    seedTitle,
    `${market} ${caloriesText} kcal ${topic} Plan`,
    `${market} ${topic} Plan`,
    `${caloriesText} kcal ${topic} Plan`,
    `${topic} Meal Plan`,
  ];
}

function buildCtrPlanDescription(seed, marketLabel, goalLabel, calories, planTitle) {
  const budget = BUDGET_ESTIMATES[seed.budget];
  const caloriesText = calories.toLocaleString('en-GB');
  const planLead = planTitle.replace(/\s+-\s+(\d{1,2},)?\d{3}\s+kcal$/i, '');
  return trimSeoDescription(
    `Free ${planLead}: 7 days at ~${caloriesText} kcal/day with recipes, macros, PDF print view and shopping list. Budget ${budget}/week.`,
    PLAN_DESCRIPTION_MAX_LENGTH,
  );
}

function buildSeoTitleCollisionIndex() {
  const groups = new Map();

  for (const seed of INDEXABLE_PLAN_SEEDS) {
    const market = getMarketLabel(seed.supermarket);
    const marketText = market === 'UK' ? 'UK' : market;
    const goal = GOAL_LABELS[seed.goal] || seed.goal;
    const topic = buildCompactPlanTopic(seed, goal);
    const title = pickFirstWithinLimit(
      buildPlanTitleCandidates(
        compactSeedPlanTitle(seed.title),
        marketText,
        seed.calories.toLocaleString('en-GB'),
        topic,
      ),
      PLAN_TITLE_MAX_LENGTH,
      PLAN_TITLE_SUFFIX,
    );
    groups.set(title, [...(groups.get(title) || []), seed.slug]);
  }

  const index = new Map();
  for (const slugs of groups.values()) {
    if (slugs.length < 2) continue;
    [...slugs].sort().forEach((slug, position) => index.set(slug, position + 1));
  }
  return index;
}

function compactSeedPlanTitle(title) {
  return String(title || '')
    .replace(/\s+Meal Plan\b/g, ' Plan')
    .replace(/\bHigh Protein Low Calorie\b/g, 'High Protein')
    .replace(/\bBody Recomposition\b/g, 'Body Recomp')
    .replace(/\bEndurance Athlete\b/g, 'Endurance')
    .replace(/\bVegetarian Low Calorie\b/g, 'Vegetarian Low Cal')
    .replace(/\bVegan Low Calorie\b/g, 'Vegan Low Cal')
    .replace(/\s+[—-]\s+/g, ' - ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildCompactPlanTopic(seed, goalLabel) {
  const goal = COMPACT_GOAL_LABELS[seed.goal] || goalLabel;
  const lowerGoal = goal.toLowerCase();
  const diet = seed.dietType !== 'standard' && !lowerGoal.includes(seed.dietType)
    ? `${cap(seed.dietType)} `
    : '';
  return `${diet}${goal}`.trim();
}

function pickFirstWithinLimit(candidates, maxLength, suffix = '') {
  return candidates.find(candidate => `${candidate}${suffix}`.length <= maxLength) || candidates[candidates.length - 1];
}

function trimSeoDescription(value, maxLength) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;

  const clipped = text.slice(0, maxLength - 3).trim();
  const lastSpace = clipped.lastIndexOf(' ');
  const safeText = lastSpace > 110 ? clipped.slice(0, lastSpace) : clipped;
  return `${safeText.replace(/[.,;:!?-]+$/, '')}...`;
}

function getMarketLabel(supermarket) {
  return SUPERMARKET_LABELS[supermarket] || cap(supermarket);
}

// ── Intro paragraph ─────────────────────────────────────────────────────────────
//
// The visible on-page intro used to just reuse plan.seo.description — a
// ~155-character meta description written for a search snippet, not a real
// explanation of the plan. Two plans with the same goal and calories had a
// near-identical one-line intro. This builds a genuine 3-sentence intro from
// goal purpose, real computed protein, supermarket positioning and the
// emphasis rationale — none of it duplicated in the FAQ (see distinguisher
// above, used instead of rationale in "how is this different").
function buildIntro(seed, averageMacros) {
  const mkt = getMarketLabel(seed.supermarket);
  const profile = getSupermarketProfile(seed.supermarket);
  const emphasisContext = getEmphasisContext(seed.emphasis, seed.dietType);
  const dailyProtein = Math.round(averageMacros?.protein || 0);
  const bestFor = getGoalBestFor(seed.goal, seed.dietType);
  const caloriesText = seed.calories.toLocaleString('en-GB');

  const marketClause = seed.supermarket === 'any'
    ? 'built from ingredients stocked at any major UK supermarket'
    : `built around ${mkt}'s ${profile.valueRange}`;

  return `${bestFor}. This 7-day plan targets ${caloriesText} kcal/day and averages ${dailyProtein}g of protein, ${marketClause} for roughly ${BUDGET_ESTIMATES[seed.budget]}/week. ${emphasisContext.rationale}`;
}

// ── FAQs ──────────────────────────────────────────────────────────────────────

function buildFaqs(seed, averageMacros) {
  // One label cannot fill three different grammatical slots. "the X shopping
  // list" wants a bare noun; "designed for X" and "available at X" want a
  // determiner, which a brand name supplies by itself and a generic noun does
  // not. Using a single string for both produced "the a generic UK supermarket
  // average shopping list" on every plan built for no particular shop.
  const genericMarket = seed.supermarket === 'any';
  const mkt = genericMarket ? 'generic UK supermarket' : getMarketLabel(seed.supermarket);
  const mktPhrase = genericMarket ? 'a generic UK supermarket' : mkt;
  const gl = (GOAL_LABELS[seed.goal] || seed.goal).toLowerCase();
  const emphasisContext = getEmphasisContext(seed.emphasis, seed.dietType);
  const profile = getSupermarketProfile(seed.supermarket);
  const dailyProtein = Math.round(averageMacros?.protein || 0);
  const caloriesText = seed.calories.toLocaleString('en-GB');

  return [
    {
      q: `How much does this ${gl} plan cost per week?`,
      a: `This plan is designed for ${mktPhrase} and typically costs ${BUDGET_ESTIMATES[seed.budget]} per week for one person, depending on what you already have at home. ${profile.loyalty ? `${profile.loyalty} can reduce this further.` : 'Buying in bulk and choosing own-brand items can reduce this further.'}`,
    },
    {
      q: `How much protein does this plan provide per day?`,
      a: `This plan averages ${dailyProtein}g of protein per day across the week, based on the meals actually selected — ${dailyProtein >= 130 ? 'well above' : 'in line with'} general UK guidance of roughly 0.8–1.6g per kg of bodyweight for active adults.`,
    },
    {
      q: `How is this different from a generic ${gl} plan?`,
      a: `Plenty of ${gl} plans share the same ${seed.calories.toLocaleString('en-GB')} kcal target — the difference here is that ${emphasisContext.distinguisher}.`,
    },
    {
      q: `Can I print this ${gl} meal plan or save it as a PDF?`,
      a: `Yes. Use the export / print PDF button on the plan page. The printable version summarises all 7 days at ${caloriesText} kcal/day, the ${mkt} shopping list, and your chosen household portion sizes.`,
    },
    {
      q: `Is this plan suitable for meal prep?`,
      a: seed.effort === 'batch'
        ? `Yes — this plan is specifically designed for batch cooking. Prep everything on Sunday in 60–90 minutes and portion into containers for the week ahead.`
        : `Most recipes in this plan scale well and reheat easily. Soups, stews, and grain dishes are ideal for making in larger batches to save time midweek.`,
    },
    {
      q: `Is this plan suitable for ${seed.dietType === 'standard' ? 'beginners' : seed.dietType + ' eaters'}?`,
      a: seed.dietType === 'standard'
        ? `Yes. Recipes are rated ${EFFORT_LABELS[seed.effort] || seed.effort} and use ingredients available at ${mktPhrase} — no specialist equipment or advanced technique is needed.`
        : `Yes. Every meal in this plan is ${seed.dietType}, using ingredients readily available from ${mktPhrase}.`,
    },
  ];
}

// ── Swaps / suggestions ────────────────────────────────────────────────────────

function buildSwaps(seed) {
  const isBudget = seed.budget === 'very-cheap' || seed.budget === 'budget';
  const profile = getSupermarketProfile(seed.supermarket);
  const emphasisContext = getEmphasisContext(seed.emphasis, seed.dietType);

  return {
    // These were hardcoded around salmon and chicken, so a vegan plan was told
    // to buy frozen chicken breast. Filtered against the plan's own diet, with
    // diet-appropriate savings put back in their place.
    cheaper: adaptSuggestions([
      seed.supermarket === 'any'
        ? 'Buy own-brand rolled oats, rice, pasta and tins — nutritionally identical to branded, at any supermarket'
        : `Buy ${profile.label}'s ${profile.valueRange} range for rice, pasta, oats and tins — nutritionally identical to standard lines, at the lowest price point in store`,
      'Replace fresh salmon with tinned mackerel or sardines in brine (saves ~£2–3/week)',
      isBudget
        ? 'Buy dried pulses (lentils, chickpeas, black beans) and cook in bulk rather than tinned — cheaper per portion'
        : `Switch to ${profile.label}'s value range across the board rather than mid-tier lines`,
      'Use frozen chicken breast instead of fresh (saves ~£1.50/week, same protein)',
      'Swap fresh berries for frozen mixed berries (same nutrients, fraction of the cost)',
    ], seed.dietType, 5),
    higherProtein: emphasisContext.proteinSwaps,
    vegetarian: seed.dietType === 'standard' ? [
      'Replace chicken with Quorn fillets or diced firm tofu',
      'Swap beef mince for tinned green lentils or plant-based mince',
      'Use halloumi or feta instead of meat in lunch salads',
      'Substitute eggs or cottage cheese for fish-based meals',
    ] : [],
  };
}

// ── Related plans ─────────────────────────────────────────────────────────────

function getRelatedSlugs(seed) {
  const same_goal_diff_market = takeRelatedSeeds(
    PLAN_SEEDS_BY_GOAL.get(seed.goal),
    seed,
    s => s.supermarket !== seed.supermarket,
    2,
  );

  const same_market_diff_cal = takeRelatedSeeds(
    PLAN_SEEDS_BY_SUPERMARKET.get(seed.supermarket),
    seed,
    s => s.calories !== seed.calories,
    2,
  );

  // Related plans are offered as alternatives, so they have to carry the things
  // an alternative is judged on. Passing only the title left a reader choosing
  // between four names, with the calories, store and cost — the whole reason
  // one of them might suit better — left off the card.
  const seen = new Set([seed.slug]);
  const related = [];
  for (const s of [...same_goal_diff_market, ...same_market_diff_cal]) {
    if (!seen.has(s.slug)) {
      seen.add(s.slug);
      related.push({
        slug: s.slug,
        title: s.title,
        goal: s.goal,
        goalLabel: GOAL_LABELS[s.goal] || s.goal,
        supermarket: s.supermarket,
        calories: s.calories,
        dietType: s.dietType,
        effort: s.effort,
        priceEstimate: BUDGET_ESTIMATES[s.budget],
        macrosGrams: getSeedMacroGrams(s),
      });
    }
  }
  return related.slice(0, 4);
}

// ── Core builder ──────────────────────────────────────────────────────────────

function buildBatchPrepPlan(seed, plan) {
  if (!isBatchPlan(seed)) return null;

  const weekdays = plan.slice(0, 5);
  const lunches = uniqueMealNames(weekdays, 'Lunch');
  const dinners = uniqueMealNames(weekdays, 'Dinner');
  const breakfasts = uniqueMealNames(weekdays, 'Breakfast');
  const snacks = uniqueMealNames(weekdays, 'Snack');
  const steps = [];

  if (breakfasts.length) {
    steps.push(`Prepare ${breakfasts.length === 1 ? 'five portions' : 'weekday portions'} of ${joinNames(breakfasts)} for quick breakfasts.`);
  }
  if (lunches.length) {
    steps.push(`Cook and portion five lunches of ${joinNames(lunches)}.`);
  }
  if (dinners.length) {
    steps.push(`Batch cook ${joinNames(dinners)} as the main dinner bases, then alternate them Monday to Friday.`);
  }
  if (snacks.length) {
    steps.push(`Portion snacks in advance: ${joinNames(snacks)}.`);
  }

  // Was "keep Monday to Wednesday portions in the fridge and freeze later-week
  // portions if you prefer fresher storage" — three days chilled, with freezing
  // offered as a preference. StorageSafetyNote on the same page says two days,
  // or freeze. Food Standards Agency guidance is the two-day one.
  steps.push('Cool everything quickly and get it into the fridge within one to two hours.');
  steps.push('Refrigerate only the portions you will eat within two days — freeze the rest '
    + 'straight away, and move each one to the fridge the night before you need it. '
    + 'Freezing the later part of the week is a food-safety step, not a freshness preference.');

  return {
    title: 'Sunday batch-cook plan',
    intro: 'This plan uses repeated weekday bases so the Sunday prep instruction matches the actual meals.',
    steps,
  };
}

function uniqueMealNames(days, type) {
  return [...new Set(
    days
      .flatMap(day => day.meals || [])
      .filter(meal => meal.type === type)
      .map(meal => meal.name)
      .filter(Boolean),
  )];
}

function joinNames(names) {
  if (names.length <= 1) return names[0] || '';
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}

function rankMealPool(meals, seed) {
  if (!Array.isArray(meals) || meals.length <= 1) return meals || [];

  return [...meals].sort((a, b) => {
    const scoreDiff = scoreMealForSeed(b, seed) - scoreMealForSeed(a, seed);
    if (Math.abs(scoreDiff) > 0.001) return scoreDiff;
    return String(a.id || a.name).localeCompare(String(b.id || b.name));
  });
}

function scoreMealForSeed(meal, seed) {
  const nutrition = getMealNutrition(meal);
  const kcal = Math.max(1, nutrition.kcal || meal.cal || 1);
  const protein = nutrition.protein || meal.pro || 0;
  const carbs = nutrition.carbs || 0;
  const fats = nutrition.fats || 0;
  const fibre = nutrition.fibre || 0;
  const tags = new Set(meal.tags || []);
  const proteinDensity = (protein / kcal) * 1000;
  const carbDensity = (carbs / kcal) * 1000;
  const fibreDensity = (fibre / kcal) * 1000;
  const emphasis = seed.emphasis || '';
  const goal = seed.goal || '';

  let score = 0;

  if (emphasis === 'performance-protein') {
    score += proteinDensity * 2.2 + carbDensity * 1.5 + fibreDensity * 0.35 - fats * 0.15;
  } else if (emphasis === 'high-carb-fuel') {
    score += carbDensity * 2.4 + fibreDensity * 0.5 + proteinDensity * 0.8 - fats * 0.1;
  } else if (emphasis === 'lean-protein' || emphasis === 'recomp-protein') {
    score += proteinDensity * 2.6 + fibreDensity * 0.35 - fats * 0.18;
  } else if (emphasis === 'whole-food') {
    score += carbDensity * 1.2 + fibreDensity * 1.3 + proteinDensity * 0.8;
  } else if (emphasis === 'low-cal-swaps') {
    score += proteinDensity * 1.4 + fibreDensity * 1.5 - fats * 0.2;
  } else {
    score += proteinDensity + carbDensity * 0.8 + fibreDensity * 0.6;
  }

  if (tags.has('high-protein')) score += 16;
  if (tags.has('batch-friendly') && seed.effort === 'batch') score += 10;
  if (tags.has('easy') && (seed.effort === 'minimal' || seed.effort === 'low')) score += 8;
  if ((goal.includes('muscle') || goal.includes('bodybuilding') || goal.includes('endurance')) && carbs >= 45) score += 10;
  if ((goal.includes('protein') || goal.includes('recomp') || goal.includes('cutting')) && protein >= 30) score += 10;
  if (seed.calories <= 1600 && kcal > 750) score -= 18;
  if (seed.calories >= 2500 && kcal < 250) score -= 8;

  score += storeMealBias(meal, seed, { tags, protein, proteinDensity });

  return score;
}

// Nudges meal choice toward what a given retailer is actually good at, so two
// plans with the same goal and calorie target do not come out identical just
// because they were built from the same meal library. Kept small relative to
// the goal/emphasis terms above — this breaks ties, it does not drive the plan.
// Stable per-store offsets into the meal pool. Coprime-ish spacing so stores
// do not converge on the same picks. Fixed values rather than a hash, so a
// store's plans stay stable across deploys — these URLs are indexed and should
// not reshuffle their meals every time the code changes.
const STORE_INDEX_OFFSETS = {
  aldi: 0,
  lidl: 23,
  tesco: 47,
  asda: 71,
  sainsburys: 97,
  morrisons: 113,
  iceland: 139,
  waitrose: 163,
  ocado: 191,
  'marks-spencer': 211,
  coop: 233,
  any: 259,
};

function storeIndexOffset(supermarket) {
  return STORE_INDEX_OFFSETS[supermarket] ?? 0;
}

function storeMealBias(meal, seed, { tags, protein, proteinDensity }) {
  const bias = getStoreMealBias(seed.supermarket);
  let delta = 0;

  if (bias.budget && tags.has('budget')) delta += bias.budget;
  if (bias.batch && tags.has('batch-friendly')) delta += bias.batch;
  if (bias.easy && tags.has('easy')) delta += bias.easy;
  if (bias.protein && tags.has('high-protein')) delta += bias.protein;

  // Retailers with unusually deep catalogues favour less obvious picks, which
  // is what "more variety" means in practice here.
  if (bias.variety) {
    const prepMins = Number(meal.prepMins) || 0;
    if (prepMins >= 20) delta += bias.variety;
    if (proteinDensity > 0 && protein >= 25) delta += bias.variety * 0.4;
  }

  return delta;
}

function getMealNutrition(meal) {
  const key = meal?.id || meal?.name;
  if (key && MEAL_NUTRITION_CACHE.has(key)) return MEAL_NUTRITION_CACHE.get(key);
  const nutrition = computeMealNutritionRaw(meal?.calculationIngredients || meal?.ingredients || []);
  if (key) MEAL_NUTRITION_CACHE.set(key, nutrition);
  return nutrition;
}

export function buildPlanDays(seed) {
  const eligible = getEligibleMeals(seed.dietType);
  const requireHighProtein = String(seed.goal || '').includes('high-protein');
  const forType = type => {
    const pool = eligible.filter(meal => meal.type === type);
    if (!requireHighProtein) return pool;
    const qualifying = pool.filter(meal => meal.tags?.includes('high-protein'));
    if (!qualifying.length) return pool;

    // The high-protein tag is applied by hand, and on a restricted diet it can
    // leave a pool that is technically high in protein but built on one
    // ingredient: the vegan high-protein dinner pool was three meals, all tofu,
    // which made a tofu lunch and a tofu dinner unavoidable however the week
    // was arranged. Meanwhile a 47g chickpea curry and a 42g bean chilli sat
    // just outside the tag. Where the tagged pool cannot offer two distinct
    // proteins, admit the next-highest-protein meals until it can — they are
    // comparable on protein, and identical on diet, budget and effort.
    const distinctProteins = new Set();
    for (const meal of qualifying) {
      for (const family of primaryProteinSignature(meal)) distinctProteins.add(family);
    }
    if (distinctProteins.size >= MIN_DISTINCT_PROTEINS) return qualifying;

    // Rank by protein DENSITY, not grams. Sorting by absolute protein admitted
    // meals that were high in protein but also high in calories, which pushed
    // several vegan high-protein plans below the 20%-of-energy bar their own
    // label depends on. A candidate has to hold the line the tagged pool sets.
    const density = meal => ((meal.pro || 0) * 4) / Math.max(1, meal.cal || 1);
    const bar = Math.min(...qualifying.map(density));
    const topUp = pool
      .filter(meal => !qualifying.includes(meal) && density(meal) >= bar)
      .sort((a, b) => density(b) - density(a));
    const widened = [...qualifying];
    for (const meal of topUp) {
      const adds = [...primaryProteinSignature(meal)].some(f => !distinctProteins.has(f));
      if (!adds) continue;
      widened.push(meal);
      for (const family of primaryProteinSignature(meal)) distinctProteins.add(family);
      if (distinctProteins.size >= MIN_DISTINCT_PROTEINS) break;
    }
    return widened;
  };
  const breakfasts = forType('breakfast');
  const lunches    = forType('lunch');
  const dinners    = forType('dinner');
  const snacks     = forType('snack');
  const batchPlan  = isBatchPlan(seed);
  const breakfastPool = rankMealPool(batchPlan ? batchFriendlyMeals(breakfasts) : breakfasts, seed);
  const lunchPool     = rankMealPool(batchPlan ? batchFriendlyMeals(lunches) : lunches, seed);
  const dinnerPool    = rankMealPool(batchPlan ? batchFriendlyMeals(dinners) : dinners, seed);
  const snackPool     = rankMealPool(batchPlan ? easyBatchSnacks(snacks) : snacks, seed);

  // Use mealSetIndex as a large prime-multiplied offset so sets diverge quickly.
  // The per-store offset matters as much as the ranking bias: without it, two
  // plans sharing a mealSetIndex start at the same point in the pool and land on
  // near-identical weeks even after biasing, which is the duplicate-content
  // problem this is meant to solve.
  const base = (seed.mealSetIndex * 37) + storeIndexOffset(seed.supermarket);

  // Pick 2 breakfasts for the whole week: primary (Mon–Fri) and secondary (Sat–Sun).
  // This mirrors real UK meal-prep behaviour and keeps the week feeling coherent.
  const bPrimary = pick(breakfastPool, base);
  let bSecondary = pick(breakfastPool, base + 13);
  if (bSecondary.id === bPrimary.id) bSecondary = pick(breakfastPool, base + 7);

  const batchLunch = batchPlan ? pick(lunchPool, base + 3) : null;
  const batchWeekendLunch = batchPlan ? pickDifferent(lunchPool, base + 17, new Set([batchLunch?.id])) : null;
  const batchDinnerA = batchPlan ? pickDinnerForLunch(dinnerPool, base + 7, batchLunch) : null;
  const batchDinnerB = batchPlan ? pickDinnerForLunch(dinnerPool, base + 29, batchLunch, new Set([batchDinnerA?.id])) : null;
  const batchSnackA = batchPlan ? pick(snackPool, base + 13) : null;
  const batchSnackB = batchPlan ? pickDifferent(snackPool, base + 19, new Set([batchSnackA?.id])) : null;
  const batchSnackC = batchPlan ? pickDifferent(snackPool, base + 29, new Set([batchSnackA?.id, batchSnackB?.id])) : null;
  const batchSnackD = batchPlan ? pickDifferent(snackPool, base + 41, new Set([batchSnackA?.id, batchSnackB?.id, batchSnackC?.id])) : null;

  const plan = DAYS.map((day, di) => {
    const s = base + di * 11;
    const b = di < 5 ? bPrimary : bSecondary; // Mon–Fri primary, Sat–Sun secondary
    const l = batchPlan && di < 5 ? batchLunch : batchPlan ? batchWeekendLunch : pick(lunchPool, s + 3);
    const d = batchPlan && di < 5
      ? (di % 2 === 0 ? batchDinnerA : batchDinnerB)
      : batchPlan
        ? pickDinnerForLunch(dinnerPool, s + 7, l)
        : pickDinnerForLunch(dinnerPool, s + 7, l);

    const mealList = [b, l, d].filter(Boolean);

    // Add distinct snacks where the eligible pool allows it. Repeated snack
    // portions remain possible only on 3,000+ kcal plans whose restricted diet
    // has fewer qualifying snack recipes than the number of required portions.
    const usedSnackIds = new Set();
    const addSnack = (batchSnack, offset) => {
      if (!snackPool.length) return;
      const snack = batchPlan && di < 5
        ? batchSnack
        : pickDifferent(snackPool, s + offset, usedSnackIds);
      if (!snack) return;
      mealList.push(snack);
      usedSnackIds.add(snack.id);
    };
    if (seed.calories >= 1800) addSnack(batchSnackA, 13);
    if (seed.calories >= 2000) addSnack(batchSnackB, 19);
    if (seed.calories >= 3000) addSnack(batchSnackC, 29);
    if (seed.calories >= 3500) addSnack(batchSnackD, 41);

    const adjustedMeals = rebalanceMealsToTarget(mealList, seed.calories);

    const meals = adjustedMeals.map(({ meal: m, ingredients, nutrition }) => {
      const displayMeal = { ...m, ingredients };

      return {
        type:       cap(m.type),
        name:       m.name,
        kcal:        nutrition.kcal,
        protein:     nutrition.protein,
        carbs:       nutrition.carbs,
        fats:        nutrition.fats,
        fibre:       nutrition.fibre,
        prep:       `${m.prepMins} min`,
        desc:       buildMealDesc(displayMeal, nutrition.kcal, nutrition.protein, nutrition.carbs),
        calculationIngredients: ingredients,
        ingredients,
        cookingIngredients: getCookingIngredientDisplay(ingredients),
        portion_size: buildPortionSize(ingredients),
        recipe:     buildRecipeSteps(displayMeal),
      };
    });

    const totals = sumNutrition(meals);

    return { day, meals, totals };
  });
  return {
    plan,
    averageMacros: averageDailyMacros(plan),
  };
}

const PLAN_MACRO_CACHE = new Map();

export function getSeedMacroGrams(seed) {
  if (!seed?.slug) return MACRO_GRAMS['lean-protein'];
  const cached = PLAN_MACRO_CACHE.get(seed.slug);
  if (cached) return cached;

  const { averageMacros } = buildPlanDays(seed);
  PLAN_MACRO_CACHE.set(seed.slug, averageMacros);
  return averageMacros;
}

export function buildPlan(seed) {
  const { plan, averageMacros } = buildPlanDays(seed);
  const prepPlan = buildBatchPrepPlan(seed, plan);

  return {
    slug:         seed.slug,
    title:        seed.title,
    goal:         seed.goal,
    goalLabel:    GOAL_LABELS[seed.goal] || seed.goal,
    supermarket:  seed.supermarket,
    calories:     seed.calories,
    dietType:     seed.dietType,
    budget:       seed.budget,
    effort:       seed.effort,
    emphasis:     seed.emphasis,

    effortLabel:   EFFORT_LABELS[seed.effort]  || seed.effort,
    priceEstimate: BUDGET_ESTIMATES[seed.budget],
    macros:        buildMacroProfilePercentages(averageMacros),
    macrosGrams:   averageMacros,

    summary: {
      supermarkets:    seed.supermarket === 'any' ? 'Generic UK supermarket' : getMarketLabel(seed.supermarket),
      bestFor:         getGoalBestFor(seed.goal, seed.dietType),
      prepDifficulty:  EFFORT_LABELS[seed.effort]  || seed.effort,
      calorieRange:    `~${seed.calories} kcal/day`,
      budgetRange:     BUDGET_ESTIMATES[seed.budget],
    },

    seo:          buildSeo(seed),
    intro:        buildIntro(seed, averageMacros),
    faq:          buildFaqs(seed, averageMacros),
    swaps:        buildSwaps(seed),
    storeGuide:   buildStoreGuide(seed),
    prepPlan,
    plan,
    shoppingList: buildShoppingList(plan),
    relatedSlugs: getRelatedSlugs(seed),
  };
}

// Retailer-specific guidance. Without this, two plans with the same goal and
// calorie target are identical apart from the store name — which is
// near-duplicate content across hundreds of URLs, and no use to a reader
// deciding where to actually shop.
function buildStoreGuide(seed) {
  const profile = getSupermarketProfile(seed.supermarket);

  return {
    label: profile.label,
    tier: profile.tier,
    positioning: profile.positioning,
    valueRange: profile.valueRange,
    loyalty: profile.loyalty,
    // Presented as why this shop suits this plan, so "large fresh meat and
    // mince packs" has no business on a vegan one.
    prepStrengths: (profile.prepStrengths || []).filter(
      strength => !conflictsWithDiet(strength, seed.dietType),
    ),
    watchOuts: profile.watchOuts,
    checked: PRICING_CONTEXT_CHECKED,
  };
}

function buildMacroProfilePercentages(macros) {
  const proteinKcal = Number(macros.protein || 0) * 4;
  const carbsKcal = Number(macros.carbs || 0) * 4;
  const fatsKcal = Number(macros.fats || 0) * 9;
  const fibreKcal = Number(macros.fibre || 0) * 2;
  const total = proteinKcal + carbsKcal + fatsKcal + fibreKcal;

  if (!total) return MACRO_PROFILES['lean-protein'];

  return {
    protein: Math.round((proteinKcal / total) * 100),
    carbs: Math.round((carbsKcal / total) * 100),
    fats: Math.round((fatsKcal / total) * 100),
    fibre: Math.round((fibreKcal / total) * 100),
  };
}

export function normaliseServingCount(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return 1;
  return Math.min(6, Math.max(1, parsed));
}

export function scalePlanForPeople(plan, servingCount = 1) {
  return scalePlanForHousehold(plan, servingCount);
}

export function scalePlanForHousehold(plan, householdInput = 1) {
  if (!plan) return plan;

  const members = normaliseHouseholdMembers(householdInput);
  const people = members.length;
  const totalPortions = getHouseholdTotalPortions(members);
  const hasMixedPortions = members.some(member => Math.abs(member.portionScale - 1) >= 0.03);
  const days = (plan.plan || []).map(day => ({
    ...day,
    meals: (day.meals || []).map(meal => scaleMealForHousehold(meal, members, totalPortions)),
    totals: { ...day.totals },
    memberTotals: members.map(member => ({
      ...member,
      kcal: Math.round((day.totals?.kcal || 0) * member.portionScale),
      protein: Math.round((day.totals?.protein || 0) * member.portionScale),
      carbs: Math.round((day.totals?.carbs || 0) * member.portionScale),
      fats: Math.round((day.totals?.fats || 0) * member.portionScale),
      fibre: Math.round((day.totals?.fibre || 0) * member.portionScale),
    })),
    householdTotals: {
      kcal: Math.round((day.totals?.kcal || 0) * totalPortions),
      protein: Math.round((day.totals?.protein || 0) * totalPortions),
      carbs: Math.round((day.totals?.carbs || 0) * totalPortions),
      fats: Math.round((day.totals?.fats || 0) * totalPortions),
      fibre: Math.round((day.totals?.fibre || 0) * totalPortions),
    },
  }));

  const scaledPlan = {
    ...plan,
    servings: people,
    peopleLabel: people === 1 ? '1 person' : `${people} people`,
    totalPortions,
    totalPortionLabel: formatPortionCount(totalPortions),
    householdLabel: hasMixedPortions
      ? `${people === 1 ? '1 person' : `${people} people`}, ${formatPortionCount(totalPortions)} total portions`
      : people === 1 ? '1 person' : `${people} people`,
    household: {
      members,
      hasMixedPortions,
      totalPortions,
      totalPortionLabel: formatPortionCount(totalPortions),
    },
    priceEstimate: scaleBudgetEstimate(plan.priceEstimate, totalPortions),
    summary: {
      ...(plan.summary || {}),
      calorieRange: hasMixedPortions
        ? `${plan.summary?.calorieRange || `~${plan.calories} kcal/day`} full portion`
        : `${plan.summary?.calorieRange || `~${plan.calories} kcal/day`} per person`,
      budgetRange: scaleBudgetEstimate(plan.summary?.budgetRange || plan.priceEstimate, totalPortions),
      servings: people === 1 ? '1 person' : `${people} people`,
      totalPortions: formatPortionCount(totalPortions),
    },
    plan: days,
  };

  return {
    ...scaledPlan,
    shoppingList: buildShoppingList(days),
  };
}

export function normaliseHouseholdMembers(householdInput = 1) {
  if (Array.isArray(householdInput)) {
    const members = householdInput
      .slice(0, 6)
      .map((member, index) => normaliseHouseholdMember(member, index))
      .filter(Boolean);

    return members.length ? members : [normaliseHouseholdMember({}, 0)];
  }

  const count = normaliseServingCount(householdInput);
  return Array.from({ length: count }, (_, index) => normaliseHouseholdMember({
    label: count === 1 ? 'Person 1' : `Person ${index + 1}`,
    portionScale: 1,
  }, index));
}

function normaliseHouseholdMember(member = {}, index = 0) {
  const label = String(member.label || member.name || `Person ${index + 1}`).trim() || `Person ${index + 1}`;
  const portionScale = normalisePortionScale(member.portionScale ?? member.portion ?? 1);

  return {
    id: String(member.id || `person-${index + 1}`),
    label,
    portionScale,
    portionPercent: Math.round(portionScale * 100),
  };
}

function normalisePortionScale(value) {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return 1;
  return Math.round(Math.min(1.75, Math.max(0.25, parsed)) * 100) / 100;
}

function getHouseholdTotalPortions(members) {
  const total = members.reduce((sum, member) => sum + member.portionScale, 0);
  return Math.round(Math.max(0.25, total) * 100) / 100;
}

function formatPortionCount(value) {
  const rounded = Math.round(Number(value || 1) * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/0$/, '');
}

function scaleMealForHousehold(meal, members, totalPortions) {
  const baseIngredients = meal.calculationIngredients || meal.ingredients || [];
  const ingredients = scaleIngredientsForPortion(baseIngredients, totalPortions);
  const presentationMeal = { ...meal, ingredients };

  return {
    ...meal,
    servings: members.length,
    totalPortions,
    householdPortions: members.map(member => ({
      ...member,
      kcal: Math.round((meal.kcal || 0) * member.portionScale),
      protein: Math.round((meal.protein || 0) * member.portionScale),
      carbs: Math.round((meal.carbs || 0) * member.portionScale),
      fats: Math.round((meal.fats || 0) * member.portionScale),
      fibre: Math.round((meal.fibre || 0) * member.portionScale),
    })),
    calculationIngredients: ingredients,
    ingredients,
    cookingIngredients: getCookingIngredientDisplay(ingredients),
    portion_size: buildPortionSize(ingredients),
    recipe: buildPracticalRecipeSteps(presentationMeal),
  };
}

function scaleBudgetEstimate(value, people) {
  const source = String(value || '').trim();
  if (!source || people <= 1) return source;

  return source.replace(/\d+(?:\.\d+)?/g, amount => (
    Math.round(Number(amount) * people).toLocaleString('en-GB')
  ));
}

function rebalanceMealsToTarget(meals, targetCalories) {
  const enrichedMeals = meals.map(meal => ({
    meal,
    nutrition: getMealNutrition(meal),
  }));
  const baseTotal = enrichedMeals.reduce((sum, item) => (
    sum + (item.nutrition.kcal || item.meal.cal || 0)
  ), 0);

  let portionScale = baseTotal && targetCalories ? targetCalories / baseTotal : 1;
  let adjusted = [];
  let closest = [];
  let closestDifference = Number.POSITIVE_INFINITY;

  // These scaled strings are canonical calculation quantities. Nutrition,
  // shopping aggregation and plan totals all use them. A separate cooking
  // presentation is derived later and never round-trips into this loop.
  for (let pass = 0; pass < 6; pass += 1) {
    adjusted = enrichedMeals.map(({ meal }) => {
      const ingredients = scaleIngredientsForPortion(meal.ingredients, portionScale);
      return { meal, ingredients, nutrition: computeMealNutrition(ingredients), portionScale };
    });
    const displayedTotal = adjusted.reduce((sum, item) => sum + item.nutrition.kcal, 0);
    const difference = Math.abs(displayedTotal - Number(targetCalories || displayedTotal));
    if (difference < closestDifference) {
      closest = adjusted;
      closestDifference = difference;
    }
    if (!targetCalories || !displayedTotal || difference <= 1) break;
    portionScale *= targetCalories / displayedTotal;
  }

  return closest.length ? closest : adjusted;
}

function buildPortionSize(ingredients) {
  return (ingredients || []).join(', ');
}

export function scaleIngredientsForPortion(ingredients, portionScale = 1) {
  const values = Array.isArray(ingredients) ? ingredients : [];
  if (!Number.isFinite(portionScale) || Math.abs(portionScale - 1) < 0.0001) {
    return values.map(cleanPortionScaleText);
  }
  return values.map(ingredient => scaleIngredientForPortion(ingredient, portionScale));
}

function scaleIngredientForPortion(rawIngredient, portionScale) {
  const ingredient = cleanPortionScaleText(rawIngredient);
  if (!ingredient) return ingredient;

  const leadingMeasured = ingredient.match(/^(\d+(?:\.\d+)?)\s*(kg|g|ml|l|tbsp|tsp)\b(.*)$/i);
  if (leadingMeasured) {
    const [, amount, unit, rest] = leadingMeasured;
    return `${formatMeasuredAmount(Number(amount) * portionScale, unit)}${rest}`;
  }

  const measured = ingredient.match(/^(.*?)(\d+(?:\.\d+)?)\s*(kg|g|ml|l|tbsp|tsp)\b(.*)$/i);
  if (measured) {
    const [, prefix, amount, unit, suffix] = measured;
    return `${prefix}${formatMeasuredAmount(Number(amount) * portionScale, unit)}${suffix}`;
  }

  const leadingCount = ingredient.match(/^(\d+(?:\.\d+)?)\s+([a-z]+s?)\b(.*)$/i);
  if (leadingCount && isCountUnit(leadingCount[2])) {
    const [, amount, unit, rest] = leadingCount;
    const count = formatWholeCount(Number(amount) * portionScale);
    return `${count} ${formatCountUnit(unit, count)}${rest}`;
  }

  const countWithUnit = ingredient.match(/^(.*?)(\d+(?:\.\d+)?)\s+([a-z]+s?)\b(.*)$/i);
  if (countWithUnit && isCountUnit(countWithUnit[3])) {
    const [, prefix, amount, unit, suffix] = countWithUnit;
    const count = formatWholeCount(Number(amount) * portionScale);
    return `${prefix}${count} ${formatCountUnit(unit, count)}${suffix}`;
  }

  const trailingCount = ingredient.match(/^(.*?)(\d+(?:\.\d+)?)(\s+(?:baked|cooked|roasted|grated|mashed|soft-boiled))?$/i);
  if (trailingCount) {
    const [, prefix, amount, suffix = ''] = trailingCount;
    return `${prefix}${formatWholeCount(Number(amount) * portionScale)}${suffix}`;
  }

  return scaleWordAmount(ingredient, portionScale);
}

function cleanPortionScaleText(value) {
  return String(value || '')
    .replace(/\.\s*Use about .*$/i, '')
    .replace(/\s*Use about .*?(?:\.|$)/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatMeasuredAmount(value, unit) {
  const lowerUnit = unit.toLowerCase();
  let rounded;

  if (lowerUnit === 'g' || lowerUnit === 'ml') {
    rounded = Math.max(1, Math.round(value));
  } else if (lowerUnit === 'kg' || lowerUnit === 'l') {
    rounded = roundTo(value, 0.01);
  } else {
    rounded = Math.max(0.05, roundTo(value, 0.05));
  }

  const spacer = lowerUnit === 'tbsp' || lowerUnit === 'tsp' ? ' ' : '';
  return `${formatNumber(rounded)}${spacer}${unit}`;
}

function formatWholeCount(value) {
  return Math.max(0.25, roundTo(value, 0.25));
}

export { isCountUnit } from './countUnits.js';

function formatCountUnit(unit, count) {
  const lowerUnit = unit.toLowerCase();
  const singular = { leaves: 'leaf' };
  const plural = { leaf: 'leaves' };

  if (count === 1 && singular[lowerUnit]) return singular[lowerUnit];
  if (count !== 1 && plural[lowerUnit]) return plural[lowerUnit];
  if (count === 1 && lowerUnit.endsWith('s')) return unit.slice(0, -1);
  if (count !== 1 && !lowerUnit.endsWith('s')) return `${unit}s`;
  return unit;
}

function scaleWordAmount(ingredient, portionScale) {
  const wordAmount = ingredient.match(/\b(half|quarter)\b/i);
  if (!wordAmount) return ingredient;

  const base = wordAmount[1].toLowerCase() === 'half' ? 0.5 : 0.25;
  return ingredient.replace(wordAmount[0], formatFractionAmount(base * portionScale));
}

function formatFractionAmount(value) {
  const rounded = Math.max(0.25, roundTo(value, 0.25));
  const whole = Math.floor(rounded);
  const fraction = Number((rounded - whole).toFixed(2));
  const fractionText = {
    0.25: '1/4',
    0.5: '1/2',
    0.75: '3/4',
  }[fraction] || '';

  if (!whole) return fractionText || formatNumber(rounded);
  if (!fractionText) return String(whole);
  return `${whole} ${fractionText}`;
}

function roundTo(value, increment) {
  return Math.round(value / increment) * increment;
}

function formatNumber(value) {
  return String(Number(value.toFixed(2))).replace(/\.0$/, '');
}

function buildMealDesc(meal, kcal, protein, carbs = null) {
  const mainIngs = (meal.ingredients || [])
    .slice(0, 3)
    .map(i => i.replace(/\s+\d[\d.]*.*$/i, '').toLowerCase())
    .join(', ');
  const carbText = Number.isFinite(carbs) ? `, ${carbs}g carbs` : '';
  return `Made with ${mainIngs}. Ready in ${meal.prepMins} min — ${kcal} kcal, ${protein}g protein${carbText}.`;
}

function buildRecipeSteps(meal) {
  return buildPracticalRecipeSteps(meal);
}

// ── Lookups ───────────────────────────────────────────────────────────────────

export function getPlanBySlug(slug) {
  const seed = PLAN_SEED_BY_SLUG.get(slug);
  return seed ? buildPlan(seed) : null;
}

export function getAllPlanMeta() {
  return INDEXABLE_PLAN_SEEDS.map(seed => ({
    slug:          seed.slug,
    title:         seed.title,
    goal:          seed.goal,
    goalLabel:     GOAL_LABELS[seed.goal] || seed.goal,
    supermarket:   seed.supermarket,
    calories:      seed.calories,
    dietType:      seed.dietType,
    budget:        seed.budget,
    effort:        seed.effort,
    emphasis:      seed.emphasis,
    priceEstimate: BUDGET_ESTIMATES[seed.budget],
    macros:        MACRO_PROFILES[seed.emphasis] || MACRO_PROFILES['lean-protein'],
    macrosGrams:   getSeedMacroGrams(seed),
  }));
}

export function isIndexedPlanSlug(slug) {
  return INDEXABLE_PLAN_SLUGS.has(slug);
}

function cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

function groupSeedsBy(seeds, key) {
  const groups = new Map();
  for (const seed of seeds) {
    const value = seed[key];
    if (!groups.has(value)) groups.set(value, []);
    groups.get(value).push(seed);
  }
  return groups;
}

function takeRelatedSeeds(seeds = [], currentSeed, predicate, limit) {
  const related = [];
  for (const seed of seeds) {
    if (seed.slug === currentSeed.slug || !predicate(seed)) continue;
    related.push(seed);
    if (related.length >= limit) break;
  }
  return related;
}
