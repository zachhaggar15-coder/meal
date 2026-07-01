import { MEALS } from '../data/mealLibrary.js';
import { PLAN_SEEDS } from '../data/planSeeds.js';

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
  'whole-food':     { protein: 100, carbs: 220, fats: 65, fibre: 42 },
  'batch-cooking':  { protein: 130, carbs: 200, fats: 60, fibre: 35 },
  'minimal-effort': { protein: 90,  carbs: 210, fats: 70, fibre: 25 },
  'frozen-friendly':{ protein: 100, carbs: 225, fats: 70, fibre: 25 },
  'high-variety':   { protein: 120, carbs: 190, fats: 65, fibre: 35 },
  'low-cal-swaps':  { protein: 120, carbs: 160, fats: 50, fibre: 35 },
  'recomp-protein': { protein: 165, carbs: 190, fats: 60, fibre: 35 },
};

const GOAL_BEST_FOR = {
  'weight-loss': 'Anyone aiming for a sustainable calorie deficit',
  'high-protein-low-cal': 'Fat loss while preserving muscle mass',
  'muscle-gain': 'Building muscle with a calorie surplus',
  'budget-fat-loss': 'Budget-conscious fat loss on ~£30/week',
  'cheap-student': 'Students on a tight budget',
  'busy-professional': 'Minimal daily cooking, batch prep',
  'low-effort': 'Simple meals with minimal cooking',
  'vegetarian-low-cal': 'Vegetarians cutting calories',
  'vegan-low-cal': 'Vegans in a calorie deficit',
  'high-protein-vegetarian': 'High-protein meat-free eating',
  'pescatarian': 'Fish and plant-based meals',
  'budget-bodybuilding': 'Budget-focused muscle building',
  'gym-beginner': 'New to structured gym nutrition',
  'cheap-high-protein': 'Maximum protein on a tight budget',
  'maintenance': 'Maintaining current weight at a balanced ~2,000 kcal/day',
  'anti-inflammatory': 'Reducing inflammation with omega-3-rich, whole-food meals',
  'menopause-nutrition': 'Supporting hormonal balance with calcium, iron and protein',
  'endurance-athlete': 'Fuelling running and endurance training with higher-carb meals',
  'body-recomp': 'Body recomposition with high protein and slightly higher calories',
  'cutting': 'Aggressive calorie deficit while preserving lean muscle mass',
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const PLAN_SEED_BY_SLUG = new Map(PLAN_SEEDS.map(seed => [seed.slug, seed]));
const PLAN_SEEDS_BY_GOAL = groupSeedsBy(PLAN_SEEDS, 'goal');
const PLAN_SEEDS_BY_SUPERMARKET = groupSeedsBy(PLAN_SEEDS, 'supermarket');

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
const MAIN_PROTEIN_KW = ['chicken', 'turkey', 'beef', 'pork', 'lamb', 'tuna', 'salmon', 'mackerel', 'cod', 'sardine', 'prawn'];

function getMainProtein(meal) {
  if (!meal) return null;
  const text = (meal.ingredients || []).join(' ').toLowerCase();
  return MAIN_PROTEIN_KW.find(p => text.includes(p)) || null;
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
  const lunchProtein = getMainProtein(lunch);
  for (let offset = 0; offset < dinners.length; offset += 1) {
    const dinner = pick(dinners, seed + offset);
    if (!dinner || usedIds.has(dinner.id)) continue;
    if (!lunchProtein || getMainProtein(dinner) !== lunchProtein) return dinner;
  }
  return pickDifferent(dinners, seed, usedIds);
}

// ── Shopping list builder ──────────────────────────────────────────────────────

const PROTEIN_KW  = ['chicken','beef','turkey','pork','tuna','salmon','mackerel','cod','sardine','prawn','egg','tofu','lentil','chickpea','black bean','kidney bean','quorn','tempeh','mince'];
const CARB_KW     = ['bread','rice','pasta','oat','potato','tortilla','roll','pitta','noodle','flour','wraps','granola','quinoa','couscous','orzo','soba'];
const DAIRY_KW    = ['milk','yogurt','cheese','cream','butter','skyr','ricotta','halloumi','cottage','mozzarella'];
const VEG_KW      = ['spinach','broccoli','pepper','courgette','tomato','carrot','onion','lettuce','leaf','leaves','kale','cucumber','celery','avocado','mushroom','butternut squash','sweet potato','parsnip','pea','edamame','corn','bean sprout','cabbage','leek','asparagus'];

function categoriseIngredient(ing) {
  const lower = ing.toLowerCase();
  if (lower.includes('peanut butter') || lower.includes('almond butter')) return 'extras';
  if (PROTEIN_KW.some(k => lower.includes(k)))  return 'protein';
  if (VEG_KW.some(k => lower.includes(k)))      return 'vegetables';
  if (CARB_KW.some(k => lower.includes(k)))     return 'carbs';
  if (DAIRY_KW.some(k => lower.includes(k)))    return 'dairy';
  return 'extras';
}

export function buildShoppingList(plan) {
  const grouped = { protein: new Map(), carbs: new Map(), vegetables: new Map(), dairy: new Map(), extras: new Map() };

  for (const day of plan) {
    for (const meal of day.meals) {
      for (const rawIng of meal.ingredients || []) {
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
      [...items.values()].map(formatShoppingIngredient),
    ]),
  );
}

function addShoppingIngredient(group, ingredient) {
  const parsed = parseShoppingIngredient(ingredient);
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

function parseShoppingIngredient(ingredient) {
  const cleaned = cleanPortionScaleText(ingredient);
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

  const key = buildShoppingKey(cleaned);
  return { key, label: cleaned, amount: null, unit: '', suffix: '', count: 1 };
}

function buildParsedIngredient(prefix, amount, unit, suffix = '') {
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
  };
}

function normaliseMeasuredAmount(amount, unit) {
  const lowerUnit = unit.toLowerCase();
  if (lowerUnit === 'kg') return { amount: amount * 1000, unit: 'g' };
  if (lowerUnit === 'l') return { amount: amount * 1000, unit: 'ml' };
  return { amount, unit: lowerUnit };
}

function formatShoppingIngredient(item) {
  if (item.amount === null) {
    return item.count > 1 ? `${item.label} x${item.count}` : item.label;
  }

  const amount = item.unit === 'item'
    ? formatFractionAmount(item.amount)
    : isCountUnit(item.unit)
      ? `${formatWholeCount(item.amount)} ${formatCountUnit(item.unit, formatWholeCount(item.amount))}`
      : formatMeasuredAmount(item.amount, item.unit);
  const suffix = item.suffix ? ` ${item.suffix}` : '';
  return `${item.label} ${amount}${suffix}`.trim();
}

function normaliseShoppingIngredient(ing) {
  if (typeof ing === 'object' && ing !== null) {
    const name = ing.item || ing.name || '';
    const amount = ing.amount ? ` ${ing.amount}` : '';
    return `${name}${amount}`.trim();
  }
  return String(ing || '').trim();
}

function buildShoppingKey(ing) {
  return ing
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/\b\d+(\.\d+)?\s*(g|kg|ml|l|tsp|tbsp|cup|cups|x|medium|small|large|tin|tins|slice|slices|scoop|scoops|pack|packs)\b/g, '')
    .replace(/^\d+(\.\d+)?\s*/, '')
    .replace(/\b\d+(\.\d+)?\b/g, '')
    .replace(/\s+/g, ' ')
    .trim() || ing.toLowerCase();
}

// ── SEO metadata ──────────────────────────────────────────────────────────────

function buildSeo(seed) {
  const mkt = getMarketLabel(seed.supermarket);
  const gl = GOAL_LABELS[seed.goal] || seed.goal;
  const cal = seed.calories;
  return {
    title: `${buildCtrPlanTitle(seed, mkt, gl, cal)} | MealPrep.org.uk`,
    description: buildCtrPlanDescription(seed, mkt, gl, cal),
    canonical: `https://www.mealprep.org.uk/plans/${seed.slug}`,
    ogTitle: buildCtrPlanTitle(seed, mkt, gl, cal),
    ogDescription: buildCtrPlanDescription(seed, mkt, gl, cal),
  };
}

function buildCtrPlanTitle(seed, marketLabel, goalLabel, calories) {
  const diet = seed.dietType !== 'standard' && !goalLabel.toLowerCase().includes(seed.dietType)
    ? `${cap(seed.dietType)} `
    : '';
  const market = marketLabel === 'UK' ? 'UK' : marketLabel;
  return `${market} ${diet}${calories.toLocaleString('en-GB')} Calorie ${goalLabel} Meal Plan - PDF + Shopping List`;
}

function buildCtrPlanDescription(seed, marketLabel, goalLabel, calories) {
  const diet = seed.dietType === 'standard' ? 'UK' : `${seed.dietType} UK`;
  const budget = BUDGET_ESTIMATES[seed.budget];
  const marketPhrase = marketLabel === 'UK' ? 'UK supermarkets' : marketLabel;
  return `Free printable ${diet} ${goalLabel.toLowerCase()} meal plan for ${marketPhrase}: 7 days at ~${calories.toLocaleString('en-GB')} kcal/day, ${budget}/week estimate, macros and shopping list.`;
}

function getMarketLabel(supermarket) {
  return SUPERMARKET_LABELS[supermarket] || cap(supermarket);
}

// ── FAQs ──────────────────────────────────────────────────────────────────────

function buildFaqs(seed) {
  const mkt = seed.supermarket === 'any' ? 'a generic UK supermarket average' : getMarketLabel(seed.supermarket);
  const gl = (GOAL_LABELS[seed.goal] || seed.goal).toLowerCase();

  return [
    {
      q: `How much does this ${gl} plan cost per week?`,
      a: `This plan is designed for ${mkt} and typically costs ${BUDGET_ESTIMATES[seed.budget]} per week for one person, depending on what you already have at home. Buying in bulk, choosing own-brand items, and batch cooking can reduce the cost further.`,
    },
    {
      q: `How much protein does this plan provide per day?`,
      a: seed.emphasis === 'lean-protein'
        ? `This is a high-protein plan. Most days target 140–180g of protein, which supports muscle retention during a calorie deficit and helps manage hunger.`
        : `Protein is balanced across the week. Most days provide 100–130g, which meets general UK dietary guidelines for active adults.`,
    },
    {
      q: `Can I swap meals I don't like?`,
      a: `Yes. Use the AI edit button on any meal to swap it out. Common requests include swapping chicken for turkey, replacing salmon with tinned tuna, or making a day vegetarian. The shopping list updates automatically.`,
    },
    {
      q: `Can I print this ${gl} meal plan or save it as a PDF?`,
      a: `Yes. Use the export / print PDF button on the plan page. The printable version summarises the full 7-day meal plan and includes the weekly shopping list.`,
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
        ? `Yes. The meals use widely available ingredients and straightforward cooking methods. No specialist equipment or culinary experience is needed.`
        : `Yes. Every meal in this plan is ${seed.dietType}, using ingredients readily available from ${mkt}.`,
    },
  ];
}

// ── Swaps / suggestions ────────────────────────────────────────────────────────

function buildSwaps(seed) {
  const isBudget = seed.budget === 'very-cheap' || seed.budget === 'budget';
  return {
    cheaper: [
      'Replace fresh salmon with tinned mackerel or sardines in brine (saves ~£2–3/week)',
      isBudget ? 'Buy store-brand rolled oats, rice, and pasta — nutritionally identical to branded' : 'Switch to own-brand products across the board',
      'Use frozen chicken breast instead of fresh (saves ~£1.50/week, same protein)',
      'Swap fresh berries for frozen mixed berries (same nutrients, fraction of the cost)',
      'Buy pulses (lentils, chickpeas, black beans) dried and cook in bulk',
    ],
    higherProtein: [
      'Add a scoop of unflavoured whey or plant protein to porridge or smoothies',
      'Replace rice or pasta with extra protein (an additional chicken breast or 2 boiled eggs)',
      'Use Skyr or Quark instead of standard yogurt (roughly 2× the protein)',
      'Add a hard-boiled egg as an afternoon snack on rest days',
      'Swap rice cakes or crackers for a protein bar (aim for 20g+ protein, under 200 kcal)',
    ],
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

  const seen = new Set([seed.slug]);
  const related = [];
  for (const s of [...same_goal_diff_market, ...same_market_diff_cal]) {
    if (!seen.has(s.slug)) {
      seen.add(s.slug);
      related.push({ slug: s.slug, title: s.title });
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

  steps.push('Keep Monday to Wednesday portions in the fridge and freeze later-week portions if you prefer fresher storage.');

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

export function buildPlan(seed) {
  const eligible = getEligibleMeals(seed.dietType);
  const breakfasts = eligible.filter(m => m.type === 'breakfast');
  const lunches    = eligible.filter(m => m.type === 'lunch');
  const dinners    = eligible.filter(m => m.type === 'dinner');
  const snacks     = eligible.filter(m => m.type === 'snack');
  const batchPlan  = isBatchPlan(seed);
  const breakfastPool = batchPlan ? batchFriendlyMeals(breakfasts) : breakfasts;
  const lunchPool     = batchPlan ? batchFriendlyMeals(lunches) : lunches;
  const dinnerPool    = batchPlan ? batchFriendlyMeals(dinners) : dinners;
  const snackPool     = batchPlan ? easyBatchSnacks(snacks) : snacks;

  // Use mealSetIndex as a large prime-multiplied offset so sets diverge quickly
  const base = seed.mealSetIndex * 37;

  // Pick 2 breakfasts for the whole week: primary (Mon–Fri) and secondary (Sat–Sun).
  // This mirrors real UK meal-prep behaviour and keeps the week feeling coherent.
  const bPrimary = pick(breakfastPool, base);
  let bSecondary = pick(breakfastPool, base + 13);
  if (bSecondary.id === bPrimary.id) bSecondary = pick(breakfasts, base + 7);

  const batchLunch = batchPlan ? pick(lunchPool, base + 3) : null;
  const batchWeekendLunch = batchPlan ? pickDifferent(lunchPool, base + 17, new Set([batchLunch?.id])) : null;
  const batchDinnerA = batchPlan ? pickDinnerForLunch(dinnerPool, base + 7, batchLunch) : null;
  const batchDinnerB = batchPlan ? pickDinnerForLunch(dinnerPool, base + 29, batchLunch, new Set([batchDinnerA?.id])) : null;
  const batchSnackA = batchPlan ? pick(snackPool, base + 13) : null;
  const batchSnackB = batchPlan ? pickDifferent(snackPool, base + 19, new Set([batchSnackA?.id])) : null;

  const plan = DAYS.map((day, di) => {
    const s = base + di * 11;
    const b = di < 5 ? bPrimary : bSecondary; // Mon–Fri primary, Sat–Sun secondary
    const l = batchPlan && di < 5 ? batchLunch : batchPlan ? batchWeekendLunch : pick(lunches, s + 3);
    const d = batchPlan && di < 5
      ? (di % 2 === 0 ? batchDinnerA : batchDinnerB)
      : batchPlan
        ? pickDinnerForLunch(dinnerPool, s + 7, l)
        : pickDinnerForLunch(dinners, s + 7, l);

    const mealList = [b, l, d].filter(Boolean);

    // Add snack(s) based on calorie target
    if (seed.calories >= 1800 && snacks.length) mealList.push(batchPlan && di < 5 ? batchSnackA : pick(snacks, s + 13));
    if (seed.calories >= 2000 && snacks.length) mealList.push(batchPlan && di < 5 ? batchSnackB : pick(snacks, s + 19));
    if (seed.calories >= 3000 && snacks.length) mealList.push(batchPlan && di < 5 ? batchSnackA : pick(snacks, s + 29));
    if (seed.calories >= 3500 && snacks.length) mealList.push(batchPlan && di < 5 ? batchSnackB : pick(snacks, s + 41));

    const adjustedMeals = rebalanceMealsToTarget(mealList, seed.calories);

    const meals = adjustedMeals.map(({ meal: m, kcal, protein, portionScale }) => {
      const ingredients = scaleIngredientsForPortion(m.ingredients, portionScale);
      const displayMeal = { ...m, ingredients };

      return {
        type:       cap(m.type),
        name:       m.name,
        kcal,
        protein,
        prep:       `${m.prepMins} min`,
        desc:       buildMealDesc(displayMeal, kcal, protein),
        ingredients,
        portion_size: buildPortionSize(ingredients),
        recipe:     buildRecipeSteps(displayMeal),
      };
    });

    const totals = {
      kcal:    meals.reduce((sum, m) => sum + m.kcal, 0),
      protein: meals.reduce((sum, m) => sum + m.protein, 0),
    };

    return { day, meals, totals };
  });
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
    macros:        MACRO_PROFILES[seed.emphasis] || MACRO_PROFILES['lean-protein'],
    macrosGrams:   MACRO_GRAMS[seed.emphasis]    || MACRO_GRAMS['lean-protein'],

    summary: {
      supermarkets:    seed.supermarket === 'any' ? 'Generic UK supermarket' : cap(seed.supermarket),
      bestFor:         GOAL_BEST_FOR[seed.goal]  || 'General healthy eating',
      prepDifficulty:  EFFORT_LABELS[seed.effort]  || seed.effort,
      calorieRange:    `~${seed.calories} kcal/day`,
      budgetRange:     BUDGET_ESTIMATES[seed.budget],
    },

    seo:          buildSeo(seed),
    faq:          buildFaqs(seed),
    swaps:        buildSwaps(seed),
    prepPlan,
    plan,
    shoppingList: buildShoppingList(plan),
    relatedSlugs: getRelatedSlugs(seed),
  };
}

function rebalanceMealsToTarget(meals, targetCalories) {
  const baseTotal = meals.reduce((sum, meal) => sum + (meal.cal || 0), 0);
  if (!baseTotal || !targetCalories) {
    return meals.map(meal => ({
      meal,
      kcal: meal.cal,
      protein: meal.pro,
      portionScale: 1,
    }));
  }

  const portionScale = targetCalories / baseTotal;
  const rawCalories = meals.map(meal => (meal.cal || 0) * portionScale);
  const roundedCalories = distributeRoundedTotal(rawCalories, targetCalories);

  return meals.map((meal, index) => ({
    meal,
    kcal: roundedCalories[index],
    protein: Math.max(1, Math.round((meal.pro || 0) * portionScale)),
    portionScale,
  }));
}

function distributeRoundedTotal(values, targetTotal) {
  const floors = values.map(Math.floor);
  let remaining = targetTotal - floors.reduce((sum, value) => sum + value, 0);
  const order = values
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction);

  for (let i = 0; i < Math.abs(remaining); i += 1) {
    const target = order[i % order.length]?.index ?? 0;
    floors[target] += remaining > 0 ? 1 : -1;
  }

  return floors;
}

function buildPortionSize(ingredients) {
  return (ingredients || []).join(', ');
}

export function scaleIngredientsForPortion(ingredients, portionScale = 1) {
  const values = Array.isArray(ingredients) ? ingredients : [];
  if (!Number.isFinite(portionScale) || Math.abs(portionScale - 1) < 0.03) {
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
  let rounded = value;

  if (lowerUnit === 'g' || lowerUnit === 'ml') {
    if (value < 10) rounded = Math.max(1, Math.round(value));
    else if (value < 250) rounded = roundTo(value, 5);
    else if (value < 500) rounded = roundTo(value, 10);
    else rounded = roundTo(value, 25);
  } else if (lowerUnit === 'kg' || lowerUnit === 'l') {
    rounded = roundTo(value, 0.05);
  } else {
    rounded = Math.max(0.25, roundTo(value, 0.25));
  }

  const spacer = lowerUnit === 'tbsp' || lowerUnit === 'tsp' ? ' ' : '';
  return `${formatNumber(rounded)}${spacer}${unit}`;
}

function formatWholeCount(value) {
  return Math.max(1, Math.round(value));
}

function isCountUnit(unit) {
  return [
    'biscuit', 'biscuits', 'cake', 'cakes', 'clove', 'cloves', 'cracker', 'crackers',
    'date', 'dates', 'egg', 'eggs', 'fillet', 'fillets', 'leaf', 'leaves', 'pack',
    'packs', 'pitta', 'pittas', 'rasher', 'rashers', 'roll', 'rolls', 'sausage',
    'sausages', 'scoop', 'scoops', 'slice', 'slices', 'stick', 'sticks', 'stalk',
    'stalks', 'tin', 'tins', 'tortilla', 'tortillas', 'wrap', 'wraps',
  ].includes(unit.toLowerCase());
}

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

function buildMealDesc(meal, kcal, protein) {
  const mainIngs = (meal.ingredients || [])
    .slice(0, 3)
    .map(i => i.replace(/\s+\d[\d.]*.*$/i, '').toLowerCase())
    .join(', ');
  return `Made with ${mainIngs}. Ready in ${meal.prepMins} min — ${kcal} kcal, ${protein}g protein.`;
}

function buildRecipeSteps(meal) {
  const ingredients = (meal.ingredients || []).join(', ');
  const name = meal.name.toLowerCase();
  const isNoCook = meal.prepMins <= 5 || (meal.tags || []).includes('easy');

  if (name.includes('overnight') || name.includes('chia')) {
    return [
      `Add ${ingredients} to a lidded container.`,
      'Stir well, cover, and chill for at least 4 hours or overnight.',
      'Stir again before eating and add a splash of milk if it is too thick.',
    ];
  }

  if (name.includes('smoothie')) {
    return [
      `Add ${ingredients} to a blender.`,
      'Blend until smooth, adding a splash more milk or water if needed.',
      'Pour into a glass or shaker and serve cold.',
    ];
  }

  if (name.includes('yogurt') || name.includes('cereal') || name.includes('weetabix') || name.includes('bran flakes')) {
    return [
      `Add the base ingredients to a bowl: ${ingredients}.`,
      'Top with the fruit, nuts, seeds, or honey listed.',
      'Eat straight away, or cover and chill for later the same day.',
    ];
  }

  if (name.includes('toast') || name.includes('bagel') || name.includes('wrap') || name.includes('sandwich')) {
    return [
      'Toast or warm the bread, bagel, wrap, or pitta if preferred.',
      `Prepare the filling ingredients: ${ingredients}.`,
      'Layer the filling evenly, season to taste, and serve or wrap tightly for later.',
    ];
  }

  if (name.includes('salad') || name.includes('bowl')) {
    return [
      `Wash and chop the salad or vegetable ingredients: ${ingredients}.`,
      'Cook or warm any protein or grains listed, then let them cool slightly.',
      'Combine everything in a bowl, season, and pack dressing separately if meal prepping.',
    ];
  }

  if (name.includes('pasta') || name.includes('rice') || name.includes('noodle')) {
    return [
      'Cook the pasta, rice, or noodles according to the packet instructions.',
      `Meanwhile, prepare the remaining ingredients: ${ingredients}.`,
      'Combine in a pan or bowl, heat through, season, and portion into containers if needed.',
    ];
  }

  if (name.includes('curry') || name.includes('chilli') || name.includes('stew') || name.includes('soup')) {
    return [
      `Prep the listed ingredients: ${ingredients}.`,
      'Cook the protein and firmer vegetables in a pan for 5-8 minutes.',
      'Add sauces, tins, stock, or pulses from the ingredient list and simmer until hot and thickened.',
    ];
  }

  if (name.includes('egg') || name.includes('scramble') || name.includes('omelette')) {
    return [
      `Prepare the ingredients: ${ingredients}.`,
      'Cook the eggs in a non-stick pan over medium heat, stirring or folding gently.',
      'Serve with the listed bread, vegetables, or toppings.',
    ];
  }

  if (isNoCook) {
    return [
      `Lay out the ingredients: ${ingredients}.`,
      'Drain, slice, or portion anything that needs preparing.',
      'Assemble in a bowl or container, season, and eat cold or microwave until hot if preferred.',
    ];
  }

  return [
    `Prepare the ingredients: ${ingredients}.`,
    'Cook the main protein or vegetables in a pan over medium heat until cooked through.',
    'Add the remaining ingredients, heat until piping hot, season to taste, and serve.',
  ];
}

// ── Lookups ───────────────────────────────────────────────────────────────────

export function getPlanBySlug(slug) {
  const seed = PLAN_SEED_BY_SLUG.get(slug);
  return seed ? buildPlan(seed) : null;
}

export function getAllPlanMeta() {
  return PLAN_SEEDS.map(seed => ({
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
  }));
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
