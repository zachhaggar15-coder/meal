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

export const GOAL_CHOOSER_SLUGS = GOAL_CHOOSER_ITEMS.map(item => item.value);

export function getGoalChoice(goal) {
  return GOAL_CHOOSER_ITEMS.find(item => item.value === goal) || null;
}

export function buildPlanChooserPath(goal) {
  return `/choose-plan/${goal}`;
}

export function buildBrowsePlanUrl({ goal, supermarket, calories }) {
  const params = new URLSearchParams();
  if (goal) params.set('goal', goal);
  if (supermarket) params.set('supermarket', supermarket);
  if (calories) params.set('calories', String(calories));
  return `/browse${params.toString() ? `?${params.toString()}` : ''}`;
}
