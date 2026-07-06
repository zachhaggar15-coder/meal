import { isCountUnit } from './planBuilder.js';

// Ingredient strings appear in two orders across the data: "Rolled oats 80g"
// (src/data/mealLibrary.js) and "90g oats" (src/data/mealPlans.js portion_size
// text), plus assorted word-fractions, unicode fractions, parenthetical gram
// overrides, and trailing/parenthetical state qualifiers (cooked/dry/mashed).
// This parses any of those into a normalised shape for nutrition lookup.

const MEASURED_UNIT_TO_GRAMS = { g: 1, kg: 1000, ml: 1, l: 1000, tbsp: 15, tsp: 5 };

const STATE_QUALIFIERS = [
  'dry', 'cooked', 'raw', 'drained', 'roasted', 'grated', 'mashed',
  'baked', 'soft-boiled', 'hard-boiled', 'sliced', 'chopped',
];

const FRACTION_WORDS = { half: 0.5, quarter: 0.25 };
const FRACTION_GLYPHS = { '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 1 / 3, '⅔': 2 / 3 };

// Items with no stated quantity, or a bare "pinch", that contribute a
// negligible number of calories and aren't worth a full lookup entry.
const NEGLIGIBLE_KEYWORDS = [
  'pinch', 'black pepper', 'white pepper', 'sea salt', 'salt', 'mixed herbs',
  'dried herbs', 'basil', 'parsley', 'coriander', 'mint', 'dill', 'thyme',
  'rosemary', 'bay leaf', 'cayenne', 'vanilla extract', 'nutmeg', 'cardamom',
  'lemon juice', 'lime juice', 'chilli flakes', 'spray',
];

function stripQualifier(text) {
  const lower = text.trim().toLowerCase();
  for (const qualifier of STATE_QUALIFIERS) {
    const suffixMatch = lower.match(new RegExp(`^(.*?)[\\s(]+${qualifier}\\)?$`));
    if (suffixMatch && suffixMatch[1].trim()) {
      return { name: suffixMatch[1].trim(), qualifier };
    }
    const prefixMatch = lower.match(new RegExp(`^${qualifier}\\s+(.*)$`));
    if (prefixMatch && prefixMatch[1].trim()) {
      return { name: prefixMatch[1].trim(), qualifier };
    }
  }
  return { name: lower, qualifier: null };
}

function cleanName(name) {
  return name
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[,.]$/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function parseIngredientLine(raw) {
  const original = String(raw || '').trim();
  if (!original) return { name: '', kind: 'unparsed', raw: original };

  // 1. Explicit parenthetical gram override always wins — it's the most
  //    reliable stated quantity, regardless of what precedes it.
  const parenGrams = original.match(/\((\d+(?:\.\d+)?)\s*g\b/i);
  if (parenGrams) {
    const namePart = original.slice(0, original.indexOf('('))
      .replace(/^\d+(?:\.\d+)?\s*/, '')
      .replace(/^(?:kg|g|ml|l|tbsp|tsp)\b\s*/i, '');
    const { name, qualifier } = stripQualifier(namePart);
    const grams = Number(parenGrams[1]);
    return {
      name: cleanName(name), qualifier, kind: 'measured',
      grams, qty: grams, unit: 'g', raw: original,
    };
  }

  // 2. Leading measured amount: "90g oats", "220ml semi-skimmed milk".
  const leadingMeasured = original.match(/^(\d+(?:\.\d+)?)\s*(kg|g|ml|l|tbsp|tsp)\b\s*(.*)$/i);
  if (leadingMeasured) {
    const [, amount, unit, rest] = leadingMeasured;
    const { name, qualifier } = stripQualifier(rest);
    return buildMeasured(cleanName(name), Number(amount), unit.toLowerCase(), qualifier, original);
  }

  // 3. Name-first measured amount: "Rolled oats 80g", "Chicken breast 120g cooked".
  const trailingMeasured = original.match(/^(.*?)(\d+(?:\.\d+)?)\s*(kg|g|ml|l|tbsp|tsp)\b\s*(.*)$/i);
  if (trailingMeasured) {
    const [, prefix, amount, unit, suffix] = trailingMeasured;
    const qualifier = suffix.trim() ? suffix.trim().toLowerCase() : null;
    return buildMeasured(cleanName(prefix), Number(amount), unit.toLowerCase(), qualifier, original);
  }

  // 4. Leading count + count-unit: "2 eggs", "3 tinned sardines".
  const leadingCount = original.match(/^(\d+(?:\.\d+)?)\s+([a-z]+s?)\b\s*(.*)$/i);
  if (leadingCount && isCountUnit(leadingCount[2])) {
    const [, amount, unit, rest] = leadingCount;
    // "egg" is a count-unit token that can also start a compound food name
    // ("egg whites") rather than being followed by an unrelated food name.
    if (unit.toLowerCase() === 'egg' && /^whites?\b/i.test(rest.trim())) {
      return buildCount('egg whites', Number(amount), 'item', null, original);
    }
    const { name, qualifier } = stripQualifier(rest);
    // For units like "egg"/"eggs" the unit word IS the food name, so when
    // nothing follows it (e.g. "2 eggs"), fall back to the unit itself.
    const resolvedName = name || unit.toLowerCase();
    return buildCount(cleanName(resolvedName), Number(amount), unit.toLowerCase(), qualifier, original);
  }

  // 5. Name-first count + count-unit: "Eggs 3", "Wholemeal bread 2 slices".
  const trailingCount = original.match(/^(.*?)(\d+(?:\.\d+)?)\s+([a-z]+s?)\b\s*(.*)$/i);
  if (trailingCount && isCountUnit(trailingCount[3])) {
    const [, prefix, amount, unit, suffix] = trailingCount;
    const qualifier = suffix.trim() || null;
    return buildCount(cleanName(prefix), Number(amount), unit.toLowerCase(), qualifier, original);
  }

  // 6. Unicode fraction glyph: "½ avocado".
  const glyphMatch = original.match(/^([½¼¾⅓⅔])\s*(.*)$/);
  if (glyphMatch) {
    const [, glyph, rest] = glyphMatch;
    const { name, qualifier } = stripQualifier(rest);
    return { name: cleanName(name), qualifier, kind: 'fraction', qty: FRACTION_GLYPHS[glyph], raw: original };
  }

  // 7. Word-fraction, either order: "Avocado half", "half avocado".
  const wordAmount = original.match(/\b(half|quarter)\b/i);
  if (wordAmount) {
    const prefix = original.slice(0, wordAmount.index);
    const suffix = original.slice(wordAmount.index + wordAmount[0].length);
    const namePart = (prefix + ' ' + suffix).trim();
    const { name, qualifier } = stripQualifier(namePart);
    return { name: cleanName(name), qualifier, kind: 'fraction', qty: FRACTION_WORDS[wordAmount[1].toLowerCase()], raw: original };
  }

  // 8. Bare leading/trailing integer with no unit — a plain count: "Onion 1", "1 banana".
  const trailingBareCount = original.match(/^(.*?)(\d+(?:\.\d+)?)\s*((?:baked|cooked|roasted|grated|mashed|soft-boiled|hard-boiled)?)$/i);
  if (trailingBareCount && trailingBareCount[1].trim()) {
    const [, prefix, amount, suffix] = trailingBareCount;
    return { name: cleanName(prefix), qualifier: suffix || null, kind: 'count', qty: Number(amount), unit: 'item', raw: original };
  }
  const leadingBareCount = original.match(/^(\d+(?:\.\d+)?)\s+(.*)$/);
  if (leadingBareCount) {
    const [, amount, rest] = leadingBareCount;
    const { name, qualifier } = stripQualifier(rest);
    return { name: cleanName(name), qualifier, kind: 'count', qty: Number(amount), unit: 'item', raw: original };
  }

  // 9. No digits at all — either a recognised negligible garnish/herb, or unparsed.
  const lower = original.toLowerCase();
  if (NEGLIGIBLE_KEYWORDS.some(k => lower.includes(k))) {
    return { name: cleanName(original), qualifier: null, kind: 'negligible', raw: original };
  }
  return { name: cleanName(original), qualifier: null, kind: 'unparsed', raw: original };
}

function buildMeasured(name, amount, unit, qualifier, raw) {
  const grams = amount * (MEASURED_UNIT_TO_GRAMS[unit] ?? 1);
  return { name, qualifier, kind: 'measured', grams, unit, qty: amount, raw };
}

function buildCount(name, qty, unit, qualifier, raw) {
  return { name, qualifier, kind: 'count', qty, unit, raw };
}
