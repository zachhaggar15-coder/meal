// Presentation metadata shared by every meal-plan card (see PlanCard.jsx).
//
// Short labels keep the banner and stat cells legible where the full
// goalLabel would overflow. Colour families live under MARKET_FAMILY below.


// Short banner labels. Full goalLabels like "High Protein Low Calorie" or
// "Endurance & Running" are too long for the compact banner.
const GOAL_SHORT = {
  'weight-loss': 'Weight loss',
  'budget-fat-loss': 'Fat loss',
  'high-protein-low-cal': 'High protein',
  'cutting': 'Cutting',
  'muscle-gain': 'Muscle gain',
  'budget-bodybuilding': 'Bodybuilding',
  'gym-beginner': 'Gym beginner',
  'body-recomp': 'Body recomp',
  'endurance-athlete': 'Endurance',
  'cheap-high-protein': 'Cheap protein',
  'vegetarian-low-cal': 'Vegetarian',
  'vegan-low-cal': 'Vegan',
  'high-protein-vegetarian': 'Protein veg',
  'pescatarian': 'Pescatarian',
  'anti-inflammatory': 'Anti-inflammatory',
  'menopause-nutrition': 'Menopause',
  'low-effort': 'Low effort',
  'busy-professional': 'Professional',
  'maintenance': 'Maintenance',
  'cheap-student': 'Student',
};

const EFFORT_SHORT = {
  minimal: 'Minimal',
  low: 'Low',
  standard: 'Standard',
  batch: 'Batch',
  'high-variety': 'Variety',
};

const MARKET_SHORT = {
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
  any: 'Any UK',
};

// Card colour keys off the supermarket, not the goal.
//
// It used to key off goal, which meant a browse grid could show two cards
// differing only by calorie target in the same colour while two differing by
// diet took another - colour that looked like a category but encoded nothing a
// reader could act on. Supermarket is the axis people actually filter by
// (supermarket-qualified queries convert several times better than generic
// ones), and it is the one fact every card already states, so the colour and
// the store chip reinforce each other instead of competing.
//
// Colour is a scanning aid here, not the only signal: with twelve values no
// palette is reliably distinguishable, and the store name is printed on every
// card regardless.
const MARKET_FAMILY = {
  aldi: 'aldi',
  tesco: 'tesco',
  lidl: 'lidl',
  asda: 'asda',
  sainsburys: 'sainsburys',
  morrisons: 'morrisons',
  iceland: 'iceland',
  waitrose: 'waitrose',
  ocado: 'ocado',
  'marks-spencer': 'marks',
  coop: 'coop',
  any: 'neutral',
};

const DIET_SHORT = {
  standard: 'Standard',
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  pescatarian: 'Pescatarian',
};

// The Diet Types group on the homepage mixes diet and emphasis - a
// high-protein vegetarian plan is still vegetarian - so the tag names the diet
// and lets the title carry the rest.
export function planDietShort(dietType) {
  return DIET_SHORT[dietType] || dietType || null;
}

export function planCardFamily(supermarket) {
  return MARKET_FAMILY[supermarket] || 'neutral';
}

export function planGoalShort(goal, fallback) {
  return GOAL_SHORT[goal] || fallback || goal;
}

export function planEffortShort(effort) {
  return EFFORT_SHORT[effort] || effort;
}

export function planMarketShort(supermarket) {
  return MARKET_SHORT[supermarket] || supermarket;
}

// The calorie count already appears in the stat strip, so drop a trailing
// "— 1,500 kcal" from the title to avoid showing the same number twice.
export function planCardTitle(title) {
  return String(title || '').replace(/\s*[—–-]\s*[\d,]+\s*kcal\s*$/i, '').trim();
}
