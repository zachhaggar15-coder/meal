// The generator: turns a book definition into a fully expanded, reconciled plan.
//
// Everything downstream - PDF, QA report, build report - reads the object this
// produces. Nothing downstream is allowed to invent a number.
//
// The three jobs here, in order of how badly they went wrong in the first sample:
//
//   1. SHOPPING AGGREGATION. A meal that occurs three times in a week costs three
//      times its ingredients. The first sample listed 120g of oats for a breakfast
//      eaten on three mornings. Shopping is now derived by expanding every meal
//      occurrence in the schedule, multiplying ingredient quantities by the
//      occurrence scale, and summing by parsed food identity - never by hand.
//
//   2. THE LEFTOVER LEDGER. A dinner that "serves 2 plus 2 lunches" must actually
//      produce four portions, and exactly one later lunch must consume the two it
//      refrigerates. The ledger tracks production and consumption per day and the
//      build fails on a phantom lunch or an orphaned portion.
//
//   3. YIELD. Per-portion nutrition is total / yield, once. Scaling a recipe up or
//      down for a particular night changes the shopping quantities and the number
//      of portions, and must never change the per-portion figures.

import { computeMealNutritionRaw, roundNutrition } from '../../../src/utils/nutrition.js';
import { parseIngredientLine } from '../../../src/utils/ingredientParser.js';

export const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const KCAL_TARGET = 2000;

const COUNT_UNIT_RISK = /^\s*[\d.]+\s*(tin|tins|pack|packs|bag|bags|jar|jars|pot|pots|bunch|punnet|tub|tubs|box|boxes)\b/i;

/** Seasonings genuinely below the threshold the nutrition table models. */
export const negligible = (name) => `${name}, optional to taste (excluded from nutrition estimate)`;

/* ── ingredient identity and aggregation ──────────────────────────────── */

const keyOf = (parsed) => `${parsed.name}|${parsed.qualifier || ''}`;

/**
 * Staples are bought as a container in week one and used across the plan. They
 * stay fully quantified for nutrition; this only changes how they are shopped.
 */
export const STAPLES = new Map([
  ['olive oil', { pack: '1 x 500ml bottle', aisle: 'Cupboard' }],
  ['honey', { pack: '1 jar', aisle: 'Cupboard' }],
  ['mustard', { pack: '1 jar', aisle: 'Cupboard' }],
  ['soy sauce', { pack: '1 bottle', aisle: 'Cupboard' }],
  ['peanut butter', { pack: '1 jar', aisle: 'Cupboard' }],
  ['vegetable stock', { pack: '1 pack stock cubes', aisle: 'Cupboard' }],
  ['chicken stock', { pack: '1 pack stock cubes', aisle: 'Cupboard' }],
  ['beef stock', { pack: '1 pack stock cubes', aisle: 'Cupboard' }],
  ['curry powder', { pack: '1 jar', aisle: 'Cupboard' }],
  ['smoked paprika', { pack: '1 jar', aisle: 'Cupboard' }],
  ['curry paste', { pack: '1 jar', aisle: 'Cupboard' }],
  ['vinegar', { pack: '1 bottle', aisle: 'Cupboard' }],
  ['sesame oil', { pack: '1 small bottle', aisle: 'Cupboard' }],
  ['butter', { pack: '1 block', aisle: 'Chilled' }],
]);

// Aisle is decided by an explicit table first, because regexes get this wrong in
// exactly the ways that make a shopping list useless: "tinned chickpeas" ends in
// "peas" and lands in the freezer, "rolled oats" contains "roll" and lands in the
// bakery. Only genuinely open-ended produce falls through to the pattern list.
const AISLE_BY_NAME = new Map(Object.entries({
  'tinned tomatoes': 'Tins and jars',
  'tinned chickpeas': 'Tins and jars',
  'tinned tuna in spring water': 'Tins and jars',
  'tinned sardines': 'Tins and jars',
  'tinned mackerel in brine': 'Tins and jars',
  'kidney beans': 'Tins and jars',
  'black beans': 'Tins and jars',
  'cannellini beans': 'Tins and jars',
  'mixed beans': 'Tins and jars',
  'lentils': 'Tins and jars',
  'lentils cooked': 'Tins and jars',
  'reduced-sugar baked beans': 'Tins and jars',
  'coconut milk': 'Tins and jars',
  'coconut milk light': 'Tins and jars',
  'sweetcorn': 'Tins and jars',
  'olives': 'Tins and jars',
  'tomato purée': 'Tins and jars',
  'rolled oats': 'Cupboard',
  'red lentils': 'Cupboard',
  'green lentils': 'Cupboard',
  'brown rice': 'Cupboard',
  'wholemeal pasta': 'Cupboard',
  'wholemeal couscous': 'Cupboard',
  'wholewheat noodles': 'Cupboard',
  'peanuts': 'Cupboard',
  'mixed seeds': 'Cupboard',
  'wholemeal flour': 'Cupboard',
  'hummus': 'Chilled',
  'falafel': 'Chilled',
  'firm tofu': 'Chilled',
  'silken tofu': 'Chilled',
  'quorn mince': 'Chilled',
  'low-fat paneer': 'Chilled',
  'reduced-fat halloumi': 'Chilled',
  'halloumi': 'Chilled',
  'reduced-fat feta': 'Chilled',
  'light mozzarella': 'Chilled',
  'ricotta cheese': 'Chilled',
  'cottage cheese': 'Chilled',
  'low-fat crème fraîche': 'Chilled',
  'skyr': 'Chilled',
  'protein yogurt': 'Chilled',
  'high-protein yogurt pot': 'Chilled',
  'mint yogurt sauce': 'Chilled',
  'raita': 'Chilled',
  'edamame beans': 'Frozen',
  'light caesar dressing': 'Cupboard',
  'miso paste': 'Cupboard',
  'oatcakes': 'Cupboard',
  'quinoa': 'Cupboard',
  'orzo pasta': 'Cupboard',
  'rye bread': 'Bakery',
  'sourdough bread': 'Bakery',
  'light mayo': 'Cupboard',
  'frozen peas': 'Frozen',
  'mixed berries': 'Frozen',
  'spinach': 'Frozen',
  'wholemeal bread': 'Bakery',
  'wholemeal pitta': 'Bakery',
  'wholemeal tortilla': 'Bakery',
  'wholemeal roll': 'Bakery',
  'potato baked': 'Fruit and vegetables',
}));

const AISLES = [
  [/(mince|chicken|beef|pork|lamb|turkey|bacon|sausage|gammon|salmon|cod|haddock|prawn|mackerel fillet|sardine)/i, 'Meat and fish'],
  [/(milk|yogurt|skyr|kefir|cheddar|cheese|parmesan|feta|mozzarella|halloumi|butter|^egg$|cream|paneer|quark)/i, 'Chilled'],
  [/(bread|pitta|tortilla|bagel|roll|naan|wrap)/i, 'Bakery'],
  [/(onion|garlic|carrot|peppers|mushrooms|courgette|broccoli|spinach|cabbage|leek|celery|potato|squash|cauliflower|tomatoes|cucumber|leaves|lettuce|rocket|banana|apple|lemon|lime|avocado|green beans|kale|ginger)/i, 'Fruit and vegetables'],
];

const aisleFor = (name) => {
  if (AISLE_BY_NAME.has(name)) return AISLE_BY_NAME.get(name);
  for (const [pattern, aisle] of AISLES) if (pattern.test(name)) return aisle;
  return 'Cupboard';
};

// The parser keeps the trailing comma from "salt, optional to taste (...)", which
// would otherwise print as "salt,," in the cupboard list.
const cleanName = (name) => String(name || '').replace(/[\s,.]+$/, '');

// Count nouns are stored singular. A list that says "13 egg" reads like a bug.
const PLURALS = new Map(Object.entries({
  egg: 'eggs', onion: 'onions', 'spring onion': 'spring onions', lemon: 'lemons',
  lime: 'limes', banana: 'bananas', apple: 'apples', carrot: 'carrots',
  leek: 'leeks', 'wholemeal pitta': 'wholemeal pittas',
  'wholemeal tortilla': 'wholemeal tortillas', 'wholemeal roll': 'wholemeal rolls',
}));

export const shopperName = (row) => {
  const base = cleanName(row.name);
  const total = Object.values(row.counts || {}).reduce((a, b) => a + b, 0);
  if (total > 1 && PLURALS.has(base)) return PLURALS.get(base);
  return base;
};

// What the shopper has to put in the trolley, as distinct from what the plan
// needs. Keeping these apart is a rule rather than a nicety: a recipe calling for
// 480g of drained kidney beans means two 400g tins, and neither number is wrong.
// Values are the usable amount one standard UK unit yields - drained weight for a
// tin of pulses, pack weight for everything else.
const PACKS = new Map(Object.entries({
  'tinned tomatoes': { each: 400, unit: 'tin' },
  'kidney beans': { each: 240, unit: 'tin' },
  'black beans': { each: 240, unit: 'tin' },
  'cannellini beans': { each: 240, unit: 'tin' },
  'tinned chickpeas': { each: 240, unit: 'tin' },
  'lentils cooked': { each: 240, unit: 'tin' },
  'sweetcorn': { each: 165, unit: 'tin' },
  'reduced-sugar baked beans': { each: 400, unit: 'tin' },
  'tinned tuna in spring water': { each: 100, unit: 'tin' },
  'coconut milk light': { each: 400, unit: 'tin' },
  'coconut milk': { each: 400, unit: 'tin' },
  'low-fat greek yogurt': { each: 1000, unit: '1kg tub' },
  'semi-skimmed milk': { each: 2272, unit: '4-pint bottle' },
  'lean beef mince': { each: 500, unit: '500g pack' },
  'turkey mince lean': { each: 500, unit: '500g pack' },
  'turkey sausages': { each: 400, unit: 'pack' },
  'mixed berries': { each: 500, unit: '500g bag' },
  'frozen peas': { each: 900, unit: '900g bag' },
  'rolled oats': { each: 1000, unit: '1kg bag' },
  'chicken thighs': { each: 650, unit: 'pack' },
  'cod fillet': { each: 400, unit: 'pack' },
  'back bacon rashers': { each: 300, unit: 'pack' },
}));

export function packHint(row) {
  const pack = PACKS.get(row.name);
  if (!pack || !row.grams) return '';
  const n = Math.ceil(row.grams / pack.each - 1e-9);
  if (n < 1) return '';
  // Suppress the hint where the plan needs only a small part of one pack: the
  // shopper knows to buy a bottle of milk without being told to buy four pints
  // for the 80ml a recipe wants.
  if (n === 1 && row.grams < pack.each * 0.5) return '';
  return `Buy ${n} &times; ${pack.unit}${n > 1 ? "s" : ""}`;
}

export const AISLE_ORDER = [
  'Fruit and vegetables',
  'Meat and fish',
  'Chilled',
  'Frozen',
  'Bakery',
  'Tins and jars',
  'Cupboard',
];

/* ── recipes ──────────────────────────────────────────────────────────── */

export function computeRecipe(recipe, id) {
  const lines = recipe.ingredients.map((i) => i.line);

  for (const line of lines) {
    if (COUNT_UNIT_RISK.test(line)) {
      throw new Error(`${id}: "${line}" uses a pack/tin count, which resolves to the wrong weight. Use grams or ml.`);
    }
  }

  const total = computeMealNutritionRaw(lines);
  if (total.unmatched.length) {
    throw new Error(`${id}: unresolved ingredient(s): ${total.unmatched.join(' | ')}`);
  }

  const portions = Number(recipe.yield);
  if (!Number.isFinite(portions) || portions <= 0) {
    throw new Error(`${id}: recipe yield must be a positive number of portions`);
  }

  // The single yield division. Scaling an occurrence never touches this.
  const macros = roundNutrition({
    kcal: total.kcal / portions,
    protein: total.protein / portions,
    carbs: total.carbs / portions,
    fats: total.fats / portions,
    fibre: total.fibre / portions,
  });

  return {
    ...recipe,
    id,
    macros,
    proteinEnergyPercent: macros.kcal ? (macros.protein * 4 * 100) / macros.kcal : 0,
    parsed: recipe.ingredients.map((i) => ({ ...i, parsed: parseIngredientLine(i.line) })),
  };
}

/* ── schedule ─────────────────────────────────────────────────────────── */

/**
 * Expands a week definition into seven days.
 *
 * The week is deliberately self-contained: Monday's lunch is cooked fresh, each
 * dinner from Monday to Saturday feeds the next day's lunch, and Sunday's dinner
 * is scaled to two portions so nothing is left stranded at the end of the week.
 */
export function expandWeek(week, meals) {
  if (week.dinners.length !== 7) throw new Error(`week ${week.n}: needs exactly 7 dinners`);

  return DAY_NAMES.map((dayName, i) => {
    const weekend = i >= 5;
    const breakfastId = weekend ? week.weekendBreakfast : week.weekdayBreakfast;
    const dinnerId = week.dinners[i];
    const dinner = meals[dinnerId];
    if (!dinner) throw new Error(`week ${week.n} ${dayName}: unknown dinner "${dinnerId}"`);

    // Sunday cooks half the batch: there is no Monday lunch to feed.
    const dinnerScale = i === 6 ? 0.5 : 1;
    const producesLunch = i < 6;

    const lunch = i === 0
      ? { id: week.mondayLunch, kind: 'cook', scale: 1 }
      : { id: week.dinners[i - 1], kind: 'leftover', scale: 0 };

    return {
      index: i,
      day: dayName,
      weekend,
      breakfast: { id: breakfastId, scale: 1 },
      lunch,
      dinner: { id: dinnerId, scale: dinnerScale, producesLunch },
      extra: { id: week.extra, scale: 1 },
    };
  });
}

/* ── leftover ledger ──────────────────────────────────────────────────── */

export function buildLedger(days, meals) {
  const ledger = [];
  const failures = [];
  let fridge = []; // { fromDay, recipeId, portions }

  days.forEach((day) => {
    const dinner = meals[day.dinner.id];
    const produced = dinner.yield * day.dinner.scale;

    // Lunch first: it consumes what yesterday refrigerated.
    let lunchConsumed = 0;
    if (day.lunch.kind === 'leftover') {
      const held = fridge.find((f) => f.recipeId === day.lunch.id);
      if (!held) {
        failures.push(`${day.day}: lunch expects leftovers of "${day.lunch.id}" but none were refrigerated`);
      } else if (held.portions < 2) {
        failures.push(`${day.day}: lunch needs 2 portions of "${day.lunch.id}", only ${held.portions} held`);
      } else {
        held.portions -= 2;
        lunchConsumed = 2;
        if (held.portions === 0) fridge = fridge.filter((f) => f !== held);
      }
    }

    // Anything still in the fridge at the end of a day has missed its 48-hour
    // window under the one-day-later system and is a planning error.
    const stranded = fridge.filter((f) => f.fromDay < day.index - 1 && f.portions > 0);
    for (const s of stranded) {
      failures.push(`${day.day}: ${s.portions} portion(s) of "${s.recipeId}" from ${DAY_NAMES[s.fromDay]} were never eaten`);
    }
    fridge = fridge.filter((f) => f.portions > 0 && f.fromDay >= day.index - 1);

    const eaten = 2;
    const refrigerated = produced - eaten;
    if (refrigerated < 0) {
      failures.push(`${day.day}: dinner "${day.dinner.id}" yields ${produced} portions but two adults eat 2`);
    }
    if (refrigerated > 0 && !day.dinner.producesLunch) {
      failures.push(`${day.day}: dinner "${day.dinner.id}" refrigerates ${refrigerated} portion(s) that no lunch consumes`);
    }
    if (refrigerated > 0) fridge.push({ fromDay: day.index, recipeId: day.dinner.id, portions: refrigerated });

    ledger.push({
      day: day.day,
      recipe: day.dinner.id,
      produced,
      eaten,
      refrigerated: Math.max(0, refrigerated),
      lunchConsumed,
      inFridgeAfter: fridge.reduce((s, f) => s + f.portions, 0),
    });
  });

  const leftAtWeekEnd = fridge.reduce((s, f) => s + f.portions, 0);
  if (leftAtWeekEnd > 0) {
    failures.push(`week ends with ${leftAtWeekEnd} unconsumed portion(s) in the fridge`);
  }

  return { ledger, failures };
}

/* ── shopping ─────────────────────────────────────────────────────────── */

/**
 * Every cooking event in the week, with the scale it is cooked at. A leftover
 * lunch is not a cooking event: its ingredients were bought for the dinner.
 */
export function cookingEvents(days) {
  const events = [];
  days.forEach((day) => {
    events.push({ id: day.breakfast.id, scale: day.breakfast.scale, day: day.day, slot: 'breakfast' });
    if (day.lunch.kind === 'cook') events.push({ id: day.lunch.id, scale: day.lunch.scale, day: day.day, slot: 'lunch' });
    events.push({ id: day.dinner.id, scale: day.dinner.scale, day: day.day, slot: 'dinner' });
    events.push({ id: day.extra.id, scale: day.extra.scale, day: day.day, slot: 'extra' });
  });
  return events;
}

export function aggregateShopping(days, meals) {
  const events = cookingEvents(days);
  const totals = new Map();

  for (const event of events) {
    const recipe = meals[event.id];
    if (!recipe) throw new Error(`unknown meal "${event.id}"`);
    for (const item of recipe.parsed) {
      const p = item.parsed;
      const key = keyOf(p);
      if (!totals.has(key)) {
        totals.set(key, {
          key,
          name: cleanName(p.name),
          qualifier: p.qualifier,
          kind: p.kind,
          grams: 0,
          isMl: p.unit === 'ml',
          counts: new Map(),
          sources: new Set(),
          negligible: p.kind === 'negligible',
          display: item.display,
        });
      }
      const row = totals.get(key);
      row.sources.add(`${recipe.name} (${event.slot}, ${event.day})`);
      if (p.kind === 'measured') row.grams += Number(p.grams || 0) * event.scale;
      else if (p.kind === 'count') {
        const unit = p.unit || 'item';
        row.counts.set(unit, (row.counts.get(unit) || 0) + Number(p.qty || 0) * event.scale);
      }
    }
  }

  return [...totals.values()].map((row) => {
    const out = {
      ...row,
      sources: [...row.sources],
      counts: Object.fromEntries(row.counts),
      aisle: STAPLES.get(row.name)?.aisle || aisleFor(row.name),
      staple: STAPLES.has(row.name) || row.negligible,
    };
    out.shopperName = shopperName(out);
    return out;
  });
}

/* ── shopper-facing quantities ────────────────────────────────────────── */

const round5 = (g) => Math.ceil(g / 5) * 5;
const round10 = (g) => Math.ceil(g / 10) * 10;

export function shopperQuantity(row) {
  if (row.negligible) return '';
  if (row.kind === 'count' || Object.keys(row.counts).length) {
    return Object.entries(row.counts)
      .map(([unit, qty]) => {
        const n = Math.ceil(qty - 1e-9);
        if (unit === 'item' || unit === 'egg') return String(n);
        if (unit === 'slices') return `${n} slices`;
        if (unit === 'cloves') return `${n} cloves`;
        return `${n} ${unit}`;
      })
      .join(' + ');
  }
  const g = row.grams;
  if (row.isMl) {
    if (g >= 1000) return `${(Math.ceil(g / 100) / 10).toFixed(1)} litres`;
    return `${round10(g)}ml`;
  }
  if (g >= 1000) return `${(Math.ceil(g / 100) / 10).toFixed(1)}kg`;
  return `${g < 50 ? round5(g) : round10(g)}g`;
}

/* ── the book ─────────────────────────────────────────────────────────── */

export function buildBook(def) {
  const meals = Object.fromEntries(
    Object.entries(def.meals).map(([id, r]) => [id, computeRecipe(r, id)])
  );

  const weeks = def.weeks.map((week) => {
    const days = expandWeek(week, meals);
    const { ledger, failures } = buildLedger(days, meals);
    const shopping = aggregateShopping(days, meals);

    const dayRows = days.map((day) => {
      const parts = [meals[day.breakfast.id], meals[day.lunch.id], meals[day.dinner.id], meals[day.extra.id]];
      const kcal = parts.reduce((s, m) => s + m.macros.kcal, 0);
      const protein = parts.reduce((s, m) => s + m.macros.protein, 0);
      return {
        ...day,
        kcal,
        protein,
        diff: ((kcal - KCAL_TARGET) / KCAL_TARGET) * 100,
        proteinEnergyPercent: kcal ? (protein * 4 * 100) / kcal : 0,
      };
    });

    const mean = dayRows.reduce((s, d) => s + d.kcal, 0) / dayRows.length;
    const meanProtein = dayRows.reduce((s, d) => s + d.protein, 0) / dayRows.length;

    return {
      ...week,
      days: dayRows,
      ledger,
      ledgerFailures: failures,
      shopping,
      mean,
      meanProtein,
      meanDiff: ((mean - KCAL_TARGET) / KCAL_TARGET) * 100,
      proteinEnergyPercent: mean ? (meanProtein * 4 * 100) / mean : 0,
    };
  });

  return { ...def, meals, weeks };
}
