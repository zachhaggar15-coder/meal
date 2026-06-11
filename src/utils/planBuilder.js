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
  'cutting': 'Cutting Phase',
};

export const BUDGET_ESTIMATES = {
  'very-cheap': '£20–30',
  'budget': '£30–40',
  'moderate': '£40–55',
  'flexible': '£50–70',
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
};

// Estimated average daily gram targets per emphasis type — used for display only.
// Quiz matching still uses MACRO_PROFILES (0–100 scale, cosine similarity).
const MACRO_GRAMS = {
  'lean-protein':   { protein: 160, carbs: 150, fats: 55, fibre: 30 },
  'whole-food':     { protein: 100, carbs: 220, fats: 65, fibre: 42 },
  'batch-cooking':  { protein: 130, carbs: 200, fats: 60, fibre: 35 },
  'minimal-effort': { protein: 90,  carbs: 210, fats: 70, fibre: 25 },
  'frozen-friendly':{ protein: 100, carbs: 225, fats: 70, fibre: 25 },
  'high-variety':   { protein: 120, carbs: 190, fats: 65, fibre: 35 },
  'low-cal-swaps':  { protein: 120, carbs: 160, fats: 50, fibre: 35 },
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
  'cutting': 'Aggressive calorie deficit while preserving lean muscle mass',
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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

// ── Shopping list builder ──────────────────────────────────────────────────────

const PROTEIN_KW  = ['chicken','beef','turkey','pork','tuna','salmon','mackerel','cod','sardine','prawn','egg','tofu','lentil','chickpea','black bean','kidney bean','quorn','tempeh','mince'];
const CARB_KW     = ['bread','rice','pasta','oat','potato','tortilla','roll','pitta','noodle','flour','wraps','granola'];
const DAIRY_KW    = ['milk','yogurt','cheese','cream','butter','skyr','ricotta','halloumi','cottage','mozzarella'];
const VEG_KW      = ['spinach','broccoli','pepper','courgette','tomato','carrot','onion','lettuce','kale','cucumber','celery','avocado','mushroom','sweet potato','parsnip','pea','edamame','corn','bean sprout','cabbage','leek','asparagus'];

function categoriseIngredient(ing) {
  const lower = ing.toLowerCase();
  if (PROTEIN_KW.some(k => lower.includes(k)))  return 'protein';
  if (DAIRY_KW.some(k => lower.includes(k)))    return 'dairy';
  if (VEG_KW.some(k => lower.includes(k)))      return 'vegetables';
  if (CARB_KW.some(k => lower.includes(k)))     return 'carbs';
  return 'extras';
}

function buildShoppingList(plan) {
  const seen = new Set();
  const list = { protein: [], carbs: [], vegetables: [], dairy: [], extras: [] };

  for (const day of plan) {
    for (const meal of day.meals) {
      for (const ing of meal.ingredients || []) {
        const key = ing.split(' ')[0].toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        const cat = categoriseIngredient(ing);
        list[cat].push(ing);
      }
    }
  }
  return list;
}

// ── SEO metadata ──────────────────────────────────────────────────────────────

function buildSeo(seed) {
  const mkt = seed.supermarket === 'any' ? 'UK' : cap(seed.supermarket);
  const gl = GOAL_LABELS[seed.goal] || seed.goal;
  const cal = seed.calories;
  return {
    title: `${seed.title} | MealPrep.org.uk`,
    description: `Free 7-day ${gl.toLowerCase()} meal plan for ${mkt}: ~${cal} kcal/day with shopping list, macros and AI meal swaps.`,
    canonical: `https://www.mealprep.org.uk/plans/${seed.slug}`,
    ogTitle: seed.title,
    ogDescription: `Free 7-day ${gl.toLowerCase()} meal plan for ${mkt}: ~${cal} kcal/day with shopping list, macros and swaps.`,
  };
}

// ── FAQs ──────────────────────────────────────────────────────────────────────

function buildFaqs(seed) {
  const mkt = seed.supermarket === 'any' ? 'any UK supermarket' : cap(seed.supermarket);
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
  const same_goal_diff_market = PLAN_SEEDS.filter(
    s => s.goal === seed.goal && s.supermarket !== seed.supermarket && s.slug !== seed.slug
  ).slice(0, 2);

  const same_market_diff_cal = PLAN_SEEDS.filter(
    s => s.supermarket === seed.supermarket && s.calories !== seed.calories && s.slug !== seed.slug
  ).slice(0, 2);

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

export function buildPlan(seed) {
  const eligible = getEligibleMeals(seed.dietType);
  const breakfasts = eligible.filter(m => m.type === 'breakfast');
  const lunches    = eligible.filter(m => m.type === 'lunch');
  const dinners    = eligible.filter(m => m.type === 'dinner');
  const snacks     = eligible.filter(m => m.type === 'snack');

  // Use mealSetIndex as a large prime-multiplied offset so sets diverge quickly
  const base = seed.mealSetIndex * 37;

  // Pick 2 breakfasts for the whole week: primary (Mon–Fri) and secondary (Sat–Sun).
  // This mirrors real UK meal-prep behaviour and keeps the week feeling coherent.
  const bPrimary = pick(breakfasts, base);
  let bSecondary = pick(breakfasts, base + 13);
  if (bSecondary.id === bPrimary.id) bSecondary = pick(breakfasts, base + 7);

  const plan = DAYS.map((day, di) => {
    const s = base + di * 11;
    const b = di < 5 ? bPrimary : bSecondary; // Mon–Fri primary, Sat–Sun secondary
    const l = pick(lunches, s + 3);

    // Pick a dinner that doesn't share its main protein with lunch
    const lunchProtein = getMainProtein(l);
    let d = pick(dinners, s + 7);
    if (lunchProtein && getMainProtein(d) === lunchProtein) {
      d = pick(dinners, s + 7 + 19);
    }
    if (lunchProtein && getMainProtein(d) === lunchProtein) {
      d = pick(dinners, s + 7 + 37);
    }

    const mealList = [b, l, d].filter(Boolean);

    // Add snack(s) based on calorie target
    if (seed.calories >= 1800 && snacks.length) mealList.push(pick(snacks, s + 13));
    if (seed.calories >= 2000 && snacks.length) mealList.push(pick(snacks, s + 19));

    const meals = mealList.map(m => ({
      type:       cap(m.type),
      name:       m.name,
      kcal:       m.cal,
      protein:    m.pro,
      prep:       `${m.prepMins} min`,
      desc:       buildMealDesc(m, seed),
      ingredients: m.ingredients,
      portion_size: m.ingredients.join(', '),
    }));

    const totals = {
      kcal:    meals.reduce((sum, m) => sum + m.kcal, 0),
      protein: meals.reduce((sum, m) => sum + m.protein, 0),
    };

    return { day, meals, totals };
  });

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
      supermarkets:    seed.supermarket === 'any' ? 'Any UK supermarket' : cap(seed.supermarket),
      bestFor:         GOAL_BEST_FOR[seed.goal]  || 'General healthy eating',
      prepDifficulty:  EFFORT_LABELS[seed.effort]  || seed.effort,
      calorieRange:    `~${seed.calories} kcal/day`,
      budgetRange:     BUDGET_ESTIMATES[seed.budget],
    },

    seo:          buildSeo(seed),
    faq:          buildFaqs(seed),
    swaps:        buildSwaps(seed),
    plan,
    shoppingList: buildShoppingList(plan),
    relatedSlugs: getRelatedSlugs(seed),
  };
}

function buildMealDesc(meal, seed) {
  const mainIngs = (meal.ingredients || [])
    .slice(0, 3)
    .map(i => i.replace(/\s+\d[\d.]*.*$/i, '').toLowerCase())
    .join(', ');
  return `Made with ${mainIngs}. Ready in ${meal.prepMins} min — ${meal.cal} kcal, ${meal.pro}g protein.`;
}

// ── Lookups ───────────────────────────────────────────────────────────────────

export function getPlanBySlug(slug) {
  const seed = PLAN_SEEDS.find(s => s.slug === slug);
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
