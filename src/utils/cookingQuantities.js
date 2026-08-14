import { parseIngredientLine } from './ingredientParser.js';
import { splitIngredientText } from './nutrition.js';

const FRACTIONS = new Map([
  [0.25, '\u00bc'],
  [0.5, '\u00bd'],
  [0.75, '\u00be'],
]);

const PRODUCE_EQUIVALENTS = [
  { pattern: /^sweet potato$/, grams: 180, label: 'medium sweet potato' },
  { pattern: /^(?:red )?onion$/, grams: 150, label: ingredient => `medium ${ingredient}` },
  { pattern: /^(?:red )?pepper$/, grams: 150, label: ingredient => ingredient },
  { pattern: /^mixed peppers$/, grams: 150, label: 'pepper' },
  { pattern: /^courgette$/, grams: 200, label: 'medium courgette' },
  { pattern: /^(?:carrot|carrot grated)$/, grams: 80, label: 'medium carrot' },
  { pattern: /^broccoli$/, grams: 300, label: 'small head of broccoli', massNoun: true },
  { pattern: /^cauliflower$/, grams: 600, label: 'medium cauliflower' },
  { pattern: /^cucumber$/, grams: 300, label: 'cucumber' },
  { pattern: /^butternut squash$/, grams: 700, label: 'medium butternut squash' },
  { pattern: /^parsnip$/, grams: 100, label: 'medium parsnip' },
  { pattern: /^beef tomato$/, grams: 150, label: 'large beef tomato' },
  { pattern: /^tomato$/, grams: 100, label: 'medium tomato' },
  { pattern: /^apple$/, grams: 150, label: 'medium apple' },
  { pattern: /^banana$/, grams: 120, label: 'medium banana' },
  { pattern: /^lemon$/, grams: 80, label: 'lemon' },
];

const LEAFY_GREENS = /^(?:baby )?spinach$|^mixed leaves$|^watercress$|^rocket$|^kale$|^lettuce$/;
const SPOONABLE = /(dressing|sauce|glaze|paste|pesto|honey|syrup|mayo|mustard|tahini|hummus|nut butter|peanut butter|almond butter)$/;
const PROTEIN = /(chicken|turkey|beef|pork|lamb|tuna|salmon|mackerel|cod|sardine|prawn|tofu|halloumi|steak|mince|fillet|jerky)/;
const OPTIONAL_INTERNAL_NOTE = /\s*,?\s*optional(?:\s+to taste)?\s*\(excluded from nutrition estimate\)\s*$/i;

/**
 * Build the presentation-only ingredient model used by recipes.
 *
 * `canonical` is never rewritten and remains the source for nutrition,
 * shopping aggregation and plan totals. `displayText` is a deliberately
 * approximate, cook-friendly rendering of the same amount.
 */
export function getCookingIngredientModels(value) {
  return normaliseCanonicalIngredients(value)
    .map(toCookingIngredient)
    .filter(model => model.displayText);
}

export function getCookingIngredientDisplay(value) {
  return getCookingIngredientModels(value).map(model => model.displayText);
}

export function toCookingIngredient(rawIngredient) {
  const canonical = String(rawIngredient || '').trim();
  const parsed = parseIngredientLine(canonical);
  const ingredient = normaliseIngredientName(parsed.name || canonical);
  const canonicalQuantity = {
    amount: Number.isFinite(parsed.qty) ? parsed.qty : null,
    unit: parsed.unit || (parsed.kind === 'fraction' || parsed.kind === 'count' ? 'item' : null),
    quantityGrams: Number.isFinite(parsed.grams) ? parsed.grams : null,
  };
  const display = formatCookingDisplay({ canonical, parsed, ingredient });

  return {
    ingredient,
    canonical,
    canonicalQuantity,
    displayQuantity: display.quantity,
    displayIngredient: display.ingredient,
    displayText: display.text,
  };
}

function normaliseCanonicalIngredients(value) {
  if (Array.isArray(value)) {
    return value.map(item => {
      if (item && typeof item === 'object') {
        const name = item.item || item.name || item.ingredient || '';
        const amount = item.amount || item.quantity || '';
        return `${name}${amount ? ` ${amount}` : ''}`.trim();
      }
      return String(item || '').trim();
    }).filter(Boolean);
  }
  if (typeof value === 'string') return splitIngredientText(value);
  return [];
}

function formatCookingDisplay({ canonical, parsed, ingredient }) {
  const explicitTin = formatExplicitTin(canonical);
  if (explicitTin) return explicitTin;

  if (parsed.excluded || parsed.kind === 'negligible' || parsed.kind === 'unparsed') {
    const cleaned = canonical
      .replace(/\s*,?\s*optional[^()]*(?:\(excluded from nutrition estimate\))?\s*$/i, '')
      .replace(OPTIONAL_INTERNAL_NOTE, '')
      .replace(/\s*\(excluded from nutrition estimate\)\s*/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    const optional = /optional/i.test(canonical);
    const practicalNote = /spray/i.test(cleaned) ? 'as needed' : 'to taste';
    const text = optional && !/\b(to taste|as needed)\b/i.test(cleaned)
      ? `${cleaned}, ${practicalNote}`
      : cleaned;
    return {
      quantity: optional ? practicalNote : '',
      ingredient: normaliseIngredientName(text),
      text: normaliseIngredientName(text),
    };
  }

  if (parsed.kind === 'measured') {
    return formatMeasuredDisplay(parsed, ingredient);
  }

  if (parsed.kind === 'count' || parsed.kind === 'fraction') {
    return formatCountDisplay(parsed, ingredient);
  }

  return { quantity: '', ingredient, text: ingredient };
}

function formatMeasuredDisplay(parsed, ingredient) {
  const amount = Number(parsed.qty);
  const unit = String(parsed.unit || '').toLowerCase();
  const grams = Number(parsed.grams);

  if ((unit === 'g' || unit === 'ml') && isTinnedIngredient(ingredient)) {
    return formatTinnedDisplay(ingredient, grams, parsed.qualifier);
  }

  if (unit === 'g' && LEAFY_GREENS.test(ingredient) && grams <= 180) {
    const handfuls = Math.max(1, Math.round(grams / 30));
    const roundedGrams = roundMeasuredGrams(grams, ingredient);
    const quantity = `${handfuls} generous ${handfuls === 1 ? 'handful' : 'handfuls'}`;
    const displayIngredient = applyQualifier(ingredient, parsed.qualifier);
    return {
      quantity,
      ingredient: displayIngredient,
      text: `${quantity} ${displayIngredient} (about ${roundedGrams}g)`,
    };
  }

  if (unit === 'g') {
    const produce = PRODUCE_EQUIVALENTS.find(item => item.pattern.test(ingredient));
    if (produce && grams >= produce.grams * 0.25 && grams <= produce.grams * 5) {
      return formatProduceDisplay(produce, ingredient, grams, parsed.qualifier);
    }
  }

  if (unit === 'g' && SPOONABLE.test(ingredient) && grams <= 90) {
    const quantity = formatSpoonAmount(grams);
    const displayIngredient = applyQualifier(ingredient, parsed.qualifier);
    return {
      quantity,
      ingredient: displayIngredient,
      text: `${quantity} ${displayIngredient}`,
    };
  }

  if (unit === 'ml' && amount <= 45) {
    const quantity = formatSpoonAmount(amount);
    const displayIngredient = applyQualifier(ingredient, parsed.qualifier);
    return {
      quantity,
      ingredient: displayIngredient,
      text: `${quantity} ${displayIngredient}`,
    };
  }

  if (unit === 'tbsp' || unit === 'tsp') {
    const quantity = formatMeasuredSpoon(amount, unit);
    const displayIngredient = applyQualifier(ingredient, parsed.qualifier);
    return {
      quantity,
      ingredient: displayIngredient,
      text: `${quantity} ${displayIngredient}`,
    };
  }

  const roundedAmount = unit === 'g'
    ? roundMeasuredGrams(grams, ingredient)
    : unit === 'ml'
      ? roundTo(amount, amount < 100 ? 5 : 25)
      : roundTo(amount, 0.05);
  const prefix = differsMeaningfully(roundedAmount, amount) ? 'about ' : '';
  const quantity = `${prefix}${formatNumber(roundedAmount)}${unit}`;
  const displayIngredient = applyQualifier(ingredient, parsed.qualifier);

  return {
    quantity,
    ingredient: displayIngredient,
    text: `${quantity} ${displayIngredient}`,
  };
}

function formatCountDisplay(parsed, ingredient) {
  const amount = Number(parsed.qty);
  const unit = String(parsed.unit || 'item').toLowerCase();
  const isFractionFriendly = /(avocado|onion|cucumber|mango|lemon|lime)/.test(ingredient)
    && !/spring onion/.test(ingredient);

  if (unit !== 'item') {
    const count = Math.max(1, Math.round(amount));
    const unitLabel = formatCountUnit(unit, count);
    const displayIngredient = applyQualifier(ingredient, parsed.qualifier);
    const quantity = String(count);
    const text = formatCountUnitText(count, unitLabel, displayIngredient);
    return { quantity, ingredient: displayIngredient, text };
  }

  const practicalAmount = isFractionFriendly
    ? Math.max(0.25, roundTo(amount, 0.25))
    : Math.max(1, Math.round(amount));
  const quantity = formatMixedFraction(practicalAmount);
  const countedIngredient = pluraliseCountedIngredient(
    applyQualifier(ingredient, parsed.qualifier),
    practicalAmount,
  );

  return {
    quantity,
    ingredient: countedIngredient,
    text: `${quantity} ${countedIngredient}`,
  };
}

function formatExplicitTin(canonical) {
  const match = canonical.match(
    /^(\d+(?:\.\d+)?)\s+tins?\s+(.+?)(?:\s*\((\d+(?:\.\d+)?)\s*g(?:\s+([^)]*))?\))?$/i,
  );
  if (!match) return null;

  const [, countRaw, nameRaw, gramsRaw, noteRaw] = match;
  const count = Math.max(1, Math.round(Number(countRaw)));
  const ingredient = normaliseIngredientName(nameRaw.replace(/^tinned\s+/i, ''));
  const drained = /drain/i.test(noteRaw || '') || /(tuna|beans|chickpeas|lentils|mackerel|sardines)/.test(ingredient);
  const quantity = `${count} ${count === 1 ? 'tin' : 'tins'}`;
  const gramNote = gramsRaw ? ` (about ${roundMeasuredGrams(Number(gramsRaw), ingredient)}g total)` : '';
  const text = `${quantity} of ${ingredient}${drained ? ', drained' : ''}${gramNote}`;
  return { quantity, ingredient, text };
}

function formatTinnedDisplay(ingredient, grams, qualifier) {
  const cleanIngredient = ingredient
    .replace(/^tinned\s+/i, '')
    .replace(/\s+tinned$/i, '')
    .replace(/\s+in (?:spring water|brine)$/i, '')
    .trim();
  const standardTinGrams = /(tuna|mackerel|sardine)/.test(cleanIngredient)
    ? 130
    : /(tomato|coconut milk)/.test(cleanIngredient)
      ? 400
      : 240;
  const ratio = grams / standardTinGrams;
  const practicalRatio = nearestTinRatio(ratio);
  const roundedGrams = roundMeasuredGrams(grams, cleanIngredient);
  const drained = !/(tomato|coconut milk)/.test(cleanIngredient);
  const qualifierText = qualifier && !/drain/i.test(qualifier)
    ? `, ${qualifier}`
    : '';

  let quantity;
  if (practicalRatio === 1) quantity = '1 standard tin';
  else if (practicalRatio === 2) quantity = '2 standard tins';
  else if (practicalRatio > 1) quantity = `about ${formatMixedFraction(practicalRatio)} tins`;
  else quantity = `about ${formatMixedFraction(practicalRatio)} of a standard tin`;

  return {
    quantity,
    ingredient: cleanIngredient,
    text: `${quantity} of ${cleanIngredient}${drained ? ', drained' : ''}${qualifierText} (about ${roundedGrams}g)`,
  };
}

function formatProduceDisplay(produce, ingredient, grams, qualifier) {
  const ratio = grams / produce.grams;
  const roundedGrams = roundMeasuredGrams(grams, ingredient);
  let practicalRatio;
  let quantity;

  if (ratio > 1.25 && !Number.isInteger(Math.round(ratio))) {
    const low = Math.max(1, Math.floor(ratio));
    const high = Math.ceil(ratio);
    practicalRatio = high;
    quantity = `${low}-${high}`;
  } else {
    practicalRatio = ratio < 1
      ? Math.max(0.25, roundTo(ratio, 0.25))
      : Math.max(1, Math.round(ratio));
    quantity = formatMixedFraction(practicalRatio);
  }

  const baseLabel = typeof produce.label === 'function'
    ? produce.label(ingredient)
    : produce.label;
  const countedLabel = produce.massNoun
    ? baseLabel
    : pluraliseCountedIngredient(baseLabel, practicalRatio);
  const displayIngredient = applyQualifier(countedLabel, qualifier);

  return {
    quantity,
    ingredient: displayIngredient,
    text: `${quantity} ${displayIngredient} (about ${roundedGrams}g)`,
  };
}

function formatSpoonAmount(gramsOrMl) {
  const teaspoons = Math.max(0.5, Math.round(Number(gramsOrMl) / 5));
  const tablespoons = Math.floor(teaspoons / 3);
  const remainingTeaspoons = teaspoons % 3;

  if (!tablespoons) return `${formatMixedFraction(teaspoons)} tsp`;
  if (!remainingTeaspoons) return `${formatMixedFraction(tablespoons)} tbsp`;
  return `${formatMixedFraction(tablespoons)} tbsp plus ${remainingTeaspoons} tsp`;
}

function formatMeasuredSpoon(amount, unit) {
  const rounded = Math.max(0.25, roundTo(amount, 0.25));
  return `${formatMixedFraction(rounded)} ${unit}`;
}

function roundMeasuredGrams(value, ingredient) {
  const grams = Number(value);
  if (grams < 10) return Math.max(1, Math.round(grams));
  if (grams < 25) return roundTo(grams, 5);
  if (PROTEIN.test(ingredient)) return roundTo(grams, 25);
  if (grams < 100) return roundTo(grams, 10);
  if (grams < 500) return roundTo(grams, 25);
  return roundTo(grams, 50);
}

function nearestTinRatio(value) {
  const options = [0.25, 1 / 3, 0.5, 2 / 3, 0.75, 1, 1.5, 2];
  return options.reduce((best, option) => (
    Math.abs(option - value) < Math.abs(best - value) ? option : best
  ), options[0]);
}

function applyQualifier(ingredient, qualifier) {
  const cleanQualifier = String(qualifier || '').trim().toLowerCase();
  if (!cleanQualifier) return ingredient;
  if (cleanQualifier === 'dry') return `${ingredient} (dry weight)`;
  if (cleanQualifier === 'cooked') return `cooked ${ingredient}`;
  if (cleanQualifier === 'raw') return `raw ${ingredient}`;
  if (cleanQualifier === 'soft-boiled' || cleanQualifier === 'hard-boiled') {
    return `${cleanQualifier} ${ingredient}`;
  }
  if (cleanQualifier === 'mashed') return `${ingredient}, cooked and mashed`;
  if (['grated', 'roasted', 'baked', 'sliced', 'chopped', 'drained'].includes(cleanQualifier)) {
    return `${ingredient}, ${cleanQualifier}`;
  }
  return `${ingredient} (${cleanQualifier})`;
}

function pluraliseCountedIngredient(ingredient, amount) {
  if (amount === 1 || amount < 1) {
    return ingredient
      .replace(/^eggs\b/i, 'egg')
      .replace(/^cherry tomatoes\b/i, 'cherry tomato')
      .replace(/^medjool dates\b/i, 'Medjool date');
  }

  const replacements = [
    // Negative lookahead keeps "egg whites" (already plural-invariant) from
    // being mangled into "eggs whites" — this only pluralises the standalone
    // "egg" ingredient (optionally with a trailing qualifier like ", boiled").
    [/^egg\b(?!\s*whites?)/i, 'eggs'],
    [/^spring onion\b/i, 'spring onions'],
    [/^onion\b/i, 'onions'],
    [/^banana\b/i, 'bananas'],
    [/^apple\b/i, 'apples'],
    [/^courgette\b/i, 'courgettes'],
    [/^red pepper\b/i, 'red peppers'],
    [/^pepper\b/i, 'peppers'],
    [/^tomato\b/i, 'tomatoes'],
    [/^cherry tomato\b/i, 'cherry tomatoes'],
    [/^medium sweet potato\b/i, 'medium sweet potatoes'],
    [/^medium carrot\b/i, 'medium carrots'],
    [/^medium parsnip\b/i, 'medium parsnips'],
    [/^medium courgette\b/i, 'medium courgettes'],
    [/^medium onion\b/i, 'medium onions'],
    [/^medium red onion\b/i, 'medium red onions'],
    [/^lemon\b/i, 'lemons'],
    [/^Medjool date\b/i, 'Medjool dates'],
  ];
  const replacement = replacements.find(([pattern]) => pattern.test(ingredient));
  return replacement ? ingredient.replace(replacement[0], replacement[1]) : ingredient;
}

function formatCountUnit(unit, amount) {
  const cleanUnit = String(unit || '').toLowerCase();
  if (amount === 1) {
    if (cleanUnit === 'leaves') return 'leaf';
    return cleanUnit.endsWith('s') ? cleanUnit.slice(0, -1) : cleanUnit;
  }
  if (cleanUnit === 'leaf') return 'leaves';
  return cleanUnit.endsWith('s') ? cleanUnit : `${cleanUnit}s`;
}

function formatCountUnitText(count, unit, ingredient) {
  const lowerIngredient = ingredient.toLowerCase();
  if (lowerIngredient === 'weetabix' && /biscuits?/.test(unit)) return `${count} Weetabix`;
  if (/^garlic\b/.test(lowerIngredient) && /cloves?/.test(unit)) return `${count} garlic ${unit}`;
  if (/^celery\b/.test(lowerIngredient) && /stalks?/.test(unit)) return `${count} celery ${unit}`;
  if (/^cucumber\b/.test(lowerIngredient) && /slices?/.test(unit)) return `${count} cucumber ${unit}`;
  if (/bread\b/.test(lowerIngredient) && /slices?/.test(unit)) return `${count} ${unit} of ${ingredient}`;
  return `${count} ${unit} ${ingredient}`;
}

function formatMixedFraction(value) {
  const rounded = roundTo(Number(value), 0.25);
  const whole = Math.floor(rounded);
  const fraction = Number((rounded - whole).toFixed(2));
  const fractionText = FRACTIONS.get(fraction) || '';
  if (!whole) return fractionText || formatNumber(rounded);
  return fractionText ? `${whole}${fractionText}` : String(whole);
}

function normaliseIngredientName(value) {
  return String(value || '')
    .replace(/\s*,\s*$/, '')
    .replace(/\s+/g, ' ')
    .replace(/^(.+)\s+fresh$/i, 'fresh $1')
    .replace(/^tinned\s+(.+)\s+light$/i, 'tinned light $1')
    .replace(/^(.+)\s+(light|lean|reduced-fat)$/i, '$2 $1')
    .replace(/\bweetabix\b/gi, 'Weetabix')
    .replace(/\bquorn\b/gi, 'Quorn')
    .replace(/\bgreek\b/gi, 'Greek')
    .replace(/\bmedjool\b/gi, 'Medjool')
    .trim();
}

function differsMeaningfully(displayAmount, canonicalAmount) {
  return Math.abs(Number(displayAmount) - Number(canonicalAmount)) >= 0.5;
}

function isTinnedIngredient(ingredient) {
  return /\btinned\b/.test(ingredient);
}

function roundTo(value, increment) {
  return Math.round(Number(value) / increment) * increment;
}

function formatNumber(value) {
  return String(Number(Number(value).toFixed(2)));
}
