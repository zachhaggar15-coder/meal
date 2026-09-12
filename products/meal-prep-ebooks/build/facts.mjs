// The derived fact model.
//
// Every number a book states about itself lives here, computed from the plan.
// Prose is then checked against this rather than against a hand-maintained copy
// of the same figures.
//
// The gap this closes: the previous validator read week prose only. Front matter
// - "How the plan works", the retailer chapter, the shopping introduction - was
// never scanned, so it kept figures that were true of an earlier draft: 55g of
// protein from a breakfast pair that now makes 51.6g, a week-one cupboard
// containing miso and peanut butter that neither book buys, and a forty-minute
// dinner promise on a book whose longest dinner is thirty-five.

import { deriveOccurrences } from './occurrences.mjs';

const mean = (xs) => xs.reduce((a, c) => a + c, 0) / xs.length;

export function deriveFacts(book) {
  const days = book.weeks.flatMap((w) => w.days);
  const dinners = Object.values(book.meals).filter((m) => m.kind === 'dinner');

  const proteinOf = (slot) => days.map((d) => book.meals[d[slot].id].macros.protein);
  const breakfast = proteinOf('breakfast');
  const extra = proteinOf('extra');
  const combo = days.map((d, i) => breakfast[i] + extra[i]);
  const daily = days.map((d) => d.protein);
  const kcal = days.map((d) => d.kcal);

  const range = (xs) => ({ min: Math.min(...xs), max: Math.max(...xs), mean: mean(xs) });

  return {
    occurrences: deriveOccurrences(book),

    protein: {
      daily: range(daily),
      breakfast: range(breakfast),
      extra: range(extra),
      // The combined breakfast-and-extra figure, which both high-protein books
      // quote as the reason their dinners can stay ordinary.
      combo: range(combo),
      dinner: range(days.map((d) => book.meals[d.dinner.id].macros.protein)),
      lunch: range(days.map((d) => book.meals[d.lunch.id].macros.protein)),
      energyPercent: range(days.map((d) => d.proteinEnergyPercent)),
    },

    kcal: range(kcal),

    time: {
      // Dinner only. A Monday jacket potato is an hour in the oven and is
      // presented as such; it must never widen the dinner promise.
      dinner: range(dinners.map((m) => m.timeMins)),
      byRecipe: new Map(Object.values(book.meals).map((m) => [m.id, m.timeMins])),
    },

    cupboard: {
      weekOne: new Set(book.cupboard.weekOne),
      byWeek: book.cupboard.byWeek,
    },

    counts: {
      uniqueDinners: new Set(days.map((d) => d.dinner.id)).size,
      dinnerSlots: days.length,
      weeks: book.weeks.length,
      recipes: Object.keys(book.meals).length,
      meatFreeDinners: dinners.filter((m) => m.meatFree).length,
    },
  };
}

/**
 * Cupboard concepts, as prose names them.
 *
 * Editorial copy says "oil, spices, stock, soy" where the shopping engine holds
 * "olive oil", "cumin", "chicken stock", "soy sauce". A prose term is checked by
 * resolving it to the canonical staples that would satisfy it; a term satisfied
 * by nothing in the week-one set is a false claim.
 */
export const CUPBOARD_CONCEPTS = new Map(Object.entries({
  oil: ['olive oil', 'sesame oil'],
  oils: ['olive oil', 'sesame oil'],
  'olive oil': ['olive oil'],
  'sesame oil': ['sesame oil'],
  spices: ['cumin', 'turmeric', 'smoked paprika', 'chilli powder', 'chilli flakes', 'cinnamon', 'curry powder', 'mixed herbs'],
  spice: ['cumin', 'turmeric', 'smoked paprika', 'chilli powder', 'chilli flakes', 'cinnamon', 'curry powder', 'mixed herbs'],
  stock: ['chicken stock', 'beef stock', 'vegetable stock'],
  'stock cubes': ['chicken stock', 'beef stock', 'vegetable stock'],
  soy: ['soy sauce'],
  'soy sauce': ['soy sauce'],
  mustard: ['mustard'],
  honey: ['honey'],
  miso: ['miso paste'],
  'miso paste': ['miso paste'],
  'peanut butter': ['peanut butter'],
  vinegar: ['vinegar'],
  butter: ['butter'],
  cocoa: ['cocoa powder'],
  'cocoa powder': ['cocoa powder'],
  'curry powder': ['curry powder'],
  'curry paste': ['curry paste'],
  salt: ['salt'],
  pepper: ['black pepper'],
}));

/** Number words a book actually uses, for minutes and counts. */
export const WORD_NUMBERS = new Map(Object.entries({
  ten: 10, fifteen: 15, twenty: 20, 'twenty-five': 25, thirty: 30,
  'thirty-five': 35, forty: 40, 'forty-five': 45, fifty: 50, sixty: 60,
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  'twenty-four': 24, 'twenty-one': 21,
}));

export const toNumber = (token) => {
  const t = String(token || '').toLowerCase().trim();
  if (/^\d+$/.test(t)) return Number(t);
  return WORD_NUMBERS.has(t) ? WORD_NUMBERS.get(t) : null;
};
