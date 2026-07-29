import { NUTRITION_TABLE } from './nutritionTable.js';

// Protein value comparison dataset: cost, calories and protein for common UK
// protein sources, used by the Protein Value Comparator tool (ToolsPage) and
// by protein-value comparison guides in the blog content.
//
// NUTRITION: kcal100/pro100 figures are resolved at module load from
// src/data/nutritionTable.js (the same canonical dataset used to compute every recipe's
// calorie/macro figures on the site), which is sourced from UK CoFID
// (McCance & Widdowson's Composition of Foods) cross-checked against USDA
// FoodData Central. This file does not hold an independent nutrition copy.
//
// PRICE: costPer100gLowPence/costPer100gHighPence are REPRESENTATIVE ranges,
// not live prices. They were checked against real UK supermarket listings
// (Tesco, Aldi own-brand and price-match lines) on the date below, but prices
// vary by retailer, pack size, brand and promotion — always check current
// prices before relying on an exact figure. Do not present these as live or
// precise. See PRICE_CHECKED_DATE.
export const PRICE_CHECKED_DATE = '2026-07-14';
export const PRICE_METHODOLOGY =
  'Representative UK supermarket price ranges (own-brand to mid-range, checked against Tesco and Aldi listings). Prices vary by retailer, pack size, brand and promotion, and change over time — treat these as a starting point for comparison, not a live quote.';

// costPer100gLowPence/HighPence = pence per 100g of the food AS PURCHASED
// (raw meat/fish weight, as-sold tinned/dry weight), matching the same weight
// basis as kcal100/pro100. This keeps "cost per gram of protein" calculations
// internally consistent: you buy chicken raw, so its purchase price should be
// divided by its raw-weight protein content, not its cooked-and-reduced weight.
const PROTEIN_FOOD_DEFINITIONS = [
  {
    id: 'chicken-breast',
    nutritionKey: 'chicken breast',
    name: 'Chicken breast (raw)',
    category: 'Meat',
    costPer100gLowPence: 45,
    costPer100gHighPence: 70,
    servingG: 150,
    servingNote: 'a typical 150g raw fillet',
    notes: 'Widely available on promotion; own-brand price-match lines are usually the cheapest fresh option.',
  },
  {
    id: 'chicken-thighs',
    nutritionKey: 'chicken thighs',
    name: 'Chicken thighs, boneless skinless (raw)',
    category: 'Meat',
    costPer100gLowPence: 35,
    costPer100gHighPence: 55,
    servingG: 150,
    servingNote: 'a typical 150g raw portion',
    notes: 'Usually cheaper per kg than breast, with more fat and slightly less protein per 100g.',
  },
  {
    id: 'eggs',
    nutritionKey: 'egg',
    name: 'Eggs, large',
    category: 'Dairy & eggs',
    costPer100gLowPence: 50,
    costPer100gHighPence: 65,
    servingG: 116,
    servingNote: '2 large eggs (~58g each)',
    notes: 'One of the most consistent-value proteins; price varies less by retailer than meat or fish.',
  },
  {
    id: 'greek-yogurt',
    nutritionKey: 'low-fat greek yogurt',
    name: 'Greek yogurt (0% or low-fat)',
    category: 'Dairy & eggs',
    costPer100gLowPence: 23,
    costPer100gHighPence: 38,
    servingG: 200,
    servingNote: 'a 200g pot',
    notes: 'Own-brand tubs are consistently the cheapest way to add protein to breakfast.',
  },
  {
    id: 'skyr',
    nutritionKey: 'skyr',
    name: 'Skyr',
    category: 'Dairy & eggs',
    costPer100gLowPence: 30,
    costPer100gHighPence: 45,
    servingG: 200,
    servingNote: 'a 200g pot',
    notes: 'Slightly higher protein and lower calories than Greek yogurt, typically at a modest price premium.',
  },
  {
    id: 'cottage-cheese',
    nutritionKey: 'cottage cheese',
    name: 'Cottage cheese',
    category: 'Dairy & eggs',
    costPer100gLowPence: 35,
    costPer100gHighPence: 55,
    servingG: 150,
    servingNote: 'half a typical 300g tub',
    notes: 'Good value protein, though texture puts some people off; blends smooth for sauces and pancake batter.',
  },
  {
    id: 'tinned-tuna',
    nutritionKey: 'tinned tuna in spring water',
    name: 'Tinned tuna in spring water',
    category: 'Fish',
    costPer100gLowPence: 45,
    costPer100gHighPence: 90,
    servingG: 145,
    servingNote: 'one standard 145g tin (drained ~100g)',
    notes: 'Budget and premium brands sit far apart in price for similar protein content — own-brand and price-matched lines are usually the better-value pick.',
  },
  {
    id: 'tinned-sardines',
    nutritionKey: 'tinned sardines in oil drained',
    name: 'Tinned sardines in oil, drained',
    category: 'Fish',
    costPer100gLowPence: 55,
    costPer100gHighPence: 95,
    servingG: 90,
    servingNote: 'one standard tin, drained',
    notes: 'Higher calorie than tuna due to oil content, but a similarly strong protein source and often better value.',
  },
  {
    id: 'lean-beef-mince',
    nutritionKey: 'lean beef mince',
    name: 'Lean beef mince (5% fat, raw)',
    category: 'Meat',
    costPer100gLowPence: 60,
    costPer100gHighPence: 100,
    servingG: 125,
    servingNote: 'a typical 125g raw portion',
    notes: 'Price varies significantly by fat percentage and whether it is a premium breed line (e.g. Aberdeen Angus).',
  },
  {
    id: 'turkey-mince',
    nutritionKey: 'turkey mince lean',
    name: 'Turkey mince, lean (raw)',
    category: 'Meat',
    costPer100gLowPence: 55,
    costPer100gHighPence: 85,
    servingG: 125,
    servingNote: 'a typical 125g raw portion',
    notes: 'Similar protein to beef mince at a similar or slightly lower calorie count, usually a comparable price.',
  },
  {
    id: 'firm-tofu',
    nutritionKey: 'firm tofu',
    name: 'Firm tofu',
    category: 'Plant protein',
    costPer100gLowPence: 45,
    costPer100gHighPence: 70,
    servingG: 150,
    servingNote: 'roughly half a standard 300-400g block',
    notes: 'Fully plant-based; press and marinate for better texture. Price per 100g is broadly competitive with meat.',
  },
  {
    id: 'lentils-cooked',
    nutritionKey: 'lentils cooked',
    name: 'Lentils, cooked',
    category: 'Plant protein',
    costPer100gLowPence: 8,
    costPer100gHighPence: 15,
    servingG: 200,
    servingNote: 'roughly 200g cooked (about 75g dry)',
    notes: 'One of the cheapest protein sources per 100g by a wide margin, though lower protein density than meat, fish or eggs.',
  },
  {
    id: 'kidney-beans',
    nutritionKey: 'kidney beans',
    name: 'Kidney beans, tinned (drained)',
    category: 'Plant protein',
    costPer100gLowPence: 14,
    costPer100gHighPence: 21,
    servingG: 200,
    servingNote: 'roughly half a standard 400g tin, drained',
    notes: 'Very cheap and shelf-stable, but the lowest protein density on this list, so a larger portion is needed to hit the same protein total.',
  },
  {
    id: 'protein-powder',
    nutritionKey: 'protein powder',
    name: 'Whey protein powder',
    category: 'Supplement',
    costPer100gLowPence: 168,
    costPer100gHighPence: 267,
    servingG: 30,
    servingNote: 'one 30g scoop',
    notes: 'By far the most protein-dense option, and often cheaper per gram of protein than meat once bought in bulk or on a sale, but it is a supplement rather than a whole food.',
  },
];

export const PROTEIN_FOODS = PROTEIN_FOOD_DEFINITIONS.map(food => {
  const nutrition = NUTRITION_TABLE[food.nutritionKey];
  if (!nutrition) {
    throw new Error(`Unknown canonical nutrition key: ${food.nutritionKey}`);
  }
  return {
    ...food,
    kcal100: nutrition.kcal100,
    pro100: nutrition.pro100,
  };
});

// ── Derived calculations ────────────────────────────────────────────────────

export function proteinPerServing(food) {
  return round1((food.pro100 * food.servingG) / 100);
}

export function kcalPerServing(food) {
  return Math.round((food.kcal100 * food.servingG) / 100);
}

export function costPerServingPence(food) {
  return {
    low: Math.round((food.costPer100gLowPence * food.servingG) / 100),
    high: Math.round((food.costPer100gHighPence * food.servingG) / 100),
  };
}

// Cost in pence for a given target amount of protein (default 25g and 30g,
// the two most commonly cited "a good serving of protein" targets).
export function costPerProteinTarget(food, targetGrams) {
  const gramsNeeded = (targetGrams / food.pro100) * 100;
  return {
    low: Math.round((food.costPer100gLowPence / 100) * gramsNeeded),
    high: Math.round((food.costPer100gHighPence / 100) * gramsNeeded),
    gramsNeeded: Math.round(gramsNeeded),
  };
}

export function formatPence(pence) {
  if (pence >= 100) return `£${(pence / 100).toFixed(2)}`;
  return `${Math.round(pence)}p`;
}

export function formatPenceRange(low, high) {
  return `${formatPence(low)}-${formatPence(high)}`;
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

export function getProteinFood(id) {
  return PROTEIN_FOODS.find(food => food.id === id) || null;
}
