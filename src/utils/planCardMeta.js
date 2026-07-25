// Presentation metadata shared by every meal-plan card (see PlanCard.jsx).
//
// The ~20 goals collapse into six colour families so a full browse grid is
// scannable by category without turning into confetti. Short labels keep the
// banner and stat cells legible where the full goalLabel would overflow.

const GOAL_FAMILY = {
  'weight-loss': 'lean',
  'budget-fat-loss': 'lean',
  'high-protein-low-cal': 'lean',
  'cutting': 'lean',
  'muscle-gain': 'muscle',
  'budget-bodybuilding': 'muscle',
  'gym-beginner': 'muscle',
  'body-recomp': 'muscle',
  'endurance-athlete': 'muscle',
  'cheap-high-protein': 'protein',
  'vegetarian-low-cal': 'veg',
  'vegan-low-cal': 'veg',
  'high-protein-vegetarian': 'veg',
  'pescatarian': 'veg',
  'anti-inflammatory': 'wellness',
  'menopause-nutrition': 'wellness',
  'low-effort': 'neutral',
  'busy-professional': 'neutral',
  'maintenance': 'neutral',
  'cheap-student': 'neutral',
};

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

export function planCardFamily(goal) {
  return GOAL_FAMILY[goal] || 'neutral';
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
