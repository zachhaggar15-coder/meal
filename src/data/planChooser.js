export const GOAL_CHOOSER_ITEMS = [
  { value: 'weight-loss', label: 'Weight Loss', defaultCalories: 1500 },
  { value: 'budget-fat-loss', label: 'Budget Fat Loss', defaultCalories: 1500 },
  { value: 'high-protein-low-cal', label: 'High Protein Low Cal', defaultCalories: 1500 },
  { value: 'muscle-gain', label: 'Muscle Gain', defaultCalories: 2500 },
  { value: 'gym-beginner', label: 'Gym Beginner', defaultCalories: 1800 },
  { value: 'budget-bodybuilding', label: 'Budget Bodybuilding', defaultCalories: 2000 },
  { value: 'cheap-student', label: 'Cheap Student', defaultCalories: 1800 },
  { value: 'cheap-high-protein', label: 'Cheap High Protein', defaultCalories: 1800 },
  { value: 'low-effort', label: 'Low Effort', defaultCalories: 1800 },
  { value: 'busy-professional', label: 'Busy Professional', defaultCalories: 1800 },
];

export const SUPERMARKET_CHOICES = [
  {
    value: 'any',
    label: 'Generic UK supermarket',
    shortLabel: 'Generic',
    description: 'Uses average UK supermarket pricing when you do not want a named-store plan.',
  },
  {
    value: 'aldi',
    label: 'Aldi',
    shortLabel: 'Aldi',
    description: 'Best for lower-cost staples, simple shops and budget meal prep.',
  },
  {
    value: 'lidl',
    label: 'Lidl',
    shortLabel: 'Lidl',
    description: 'Useful for budget-friendly plans built around familiar staples.',
  },
  {
    value: 'tesco',
    label: 'Tesco',
    shortLabel: 'Tesco',
    description: 'Good for broader ranges, easy swaps and Clubcard-style shopping.',
  },
  {
    value: 'asda',
    label: 'Asda',
    shortLabel: 'Asda',
    description: 'A practical option for family-friendly staples and larger shops.',
  },
  {
    value: 'sainsburys',
    label: "Sainsbury's",
    shortLabel: "Sainsbury's",
    description: 'Useful when you want wider premium and own-brand choice.',
  },
  {
    value: 'morrisons',
    label: 'Morrisons',
    shortLabel: 'Morrisons',
    description: 'Good for familiar UK meals and flexible weekly shops.',
  },
  {
    value: 'iceland',
    label: 'Iceland',
    shortLabel: 'Iceland',
    description: 'Best for freezer-friendly, low-effort and batch-cook plans.',
  },
];

export const DIET_CHOICES = [
  {
    value: 'vegetarian',
    label: 'Vegetarian',
    shortLabel: 'Vegetarian',
    dietType: 'vegetarian',
    defaultGoal: 'vegetarian-low-cal',
    defaultCalories: 1500,
    description: 'Meat-free plans using eggs, dairy, tofu, beans, lentils, halloumi and familiar UK supermarket staples.',
  },
  {
    value: 'high-protein-vegetarian',
    label: 'High Protein Vegetarian',
    shortLabel: 'High protein veg',
    dietType: 'vegetarian',
    defaultGoal: 'high-protein-vegetarian',
    defaultCalories: 1800,
    description: 'Vegetarian plans with stronger protein anchors such as Greek yogurt, eggs, cottage cheese, tofu and pulses.',
  },
  {
    value: 'vegan',
    label: 'Vegan Low Calorie',
    shortLabel: 'Vegan',
    dietType: 'vegan',
    defaultGoal: 'vegan-low-cal',
    defaultCalories: 1500,
    description: 'Plant-based plans built around tofu, beans, lentils, chickpeas, oats, rice, potatoes and vegetables.',
  },
  {
    value: 'pescatarian',
    label: 'Pescatarian',
    shortLabel: 'Pescatarian',
    dietType: 'pescatarian',
    defaultGoal: 'pescatarian',
    defaultCalories: 1800,
    description: 'Fish, eggs, dairy and plant-forward meals for a flexible week without meat-heavy lunches and dinners.',
  },
];

export const CALORIE_CHOICES = [
  { value: '1500', calories: 1500, label: '1,500 kcal', defaultGoal: 'weight-loss', description: 'A popular lower-calorie target for weight loss plans with high-protein and vegetarian options.' },
  { value: '1800', calories: 1800, label: '1,800 kcal', defaultGoal: 'weight-loss', description: 'A flexible target for weight loss, maintenance-style dieting and busier training weeks.' },
  { value: '2000', calories: 2000, label: '2,000 kcal', defaultGoal: 'muscle-gain', description: 'Useful for maintenance, gym beginner plans and modest muscle-gain targets.' },
  { value: '2500', calories: 2500, label: '2,500 kcal', defaultGoal: 'muscle-gain', description: 'A higher-calorie target for muscle gain, endurance training and active weeks.' },
  { value: '3000', calories: 3000, label: '3,000 kcal', defaultGoal: 'muscle-gain', description: 'Higher-calorie muscle gain and endurance plans with extra snacks to keep portions realistic.' },
  { value: '3500', calories: 3500, label: '3,500 kcal', defaultGoal: 'muscle-gain', description: 'Very high-calorie bulking and heavy training plans for users who need larger daily intake.' },
];

export const GOAL_CHOOSER_SLUGS = GOAL_CHOOSER_ITEMS.map(item => item.value);
export const SUPERMARKET_CHOOSER_SLUGS = SUPERMARKET_CHOICES.map(item => item.value);
export const DIET_CHOOSER_SLUGS = DIET_CHOICES.map(item => item.value);
export const CALORIE_CHOOSER_SLUGS = CALORIE_CHOICES.map(item => item.value);

export function getGoalChoice(goal) {
  return GOAL_CHOOSER_ITEMS.find(item => item.value === goal) || null;
}

export function getSupermarketChoice(supermarket) {
  return SUPERMARKET_CHOICES.find(item => item.value === supermarket) || null;
}

export function getDietChoice(diet) {
  return DIET_CHOICES.find(item => item.value === diet) || null;
}

export function getCalorieChoice(calories) {
  const value = String(calories || '');
  return CALORIE_CHOICES.find(item => item.value === value) || null;
}

export function buildPlanChooserPath(goal) {
  return `/choose-plan/${goal}`;
}

export function buildSupermarketChooserPath(supermarket) {
  return `/choose-supermarket/${supermarket}`;
}

export function buildDietChooserPath(diet) {
  return `/choose-diet/${diet}`;
}

export function buildCalorieChooserPath(calories) {
  return `/choose-calories/${calories}`;
}

export function buildBrowsePlanUrl({ goal, supermarket, diet, calories, budget, effort }) {
  const params = new URLSearchParams();
  if (goal) params.set('goal', goal);
  if (supermarket) params.set('supermarket', supermarket);
  if (diet) params.set('diet', diet);
  if (calories) params.set('calories', String(calories));
  if (budget) params.set('budget', budget);
  if (effort) params.set('effort', effort);
  return `/browse${params.toString() ? `?${params.toString()}` : ''}`;
}
