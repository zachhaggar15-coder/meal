export const DISCOVERY_PRIORITY_LINKS = [
  {
    to: '/blog/sainsburys-meal-prep-uk',
    label: "Sainsbury's Meal Prep UK",
    note: "A practical guide for planning a Sainsbury's shop around meal prep.",
  },
  {
    to: '/meal-plan/asda-1500-calorie-meal-plan',
    label: 'Asda 1500 Calorie Legacy Plan',
    note: 'A lower-calorie Asda plan with links to related calorie and supermarket options.',
  },
  {
    to: '/plans/aldi-anti-inflammatory-veg-1800-mediterranean',
    label: 'Aldi Vegetarian Anti-Inflammatory Mediterranean Plan',
    note: 'A vegetarian Aldi option with Mediterranean-style meals.',
  },
  {
    to: '/plans/aldi-budget-bodybuilding-2000-lean-bulk',
    label: 'Aldi Budget Bodybuilding Lean Bulk Plan',
    note: 'A budget-focused Aldi plan for higher-calorie muscle-gain weeks.',
  },
  {
    to: '/plans/aldi-budget-fat-loss-1500-v2-high-fibre',
    label: 'Aldi High-Fibre Budget Fat-Loss Plan',
    note: 'A high-fibre Aldi option for lower-calorie budget planning.',
  },
  {
    to: '/plans/aldi-busy-professional-1800',
    label: 'Aldi Busy Professional 1800 Calorie Plan',
    note: 'A practical Aldi workweek plan built around repeatable meals.',
  },
  {
    to: '/plans/aldi-busy-professional-1800-v2-high-variety',
    label: 'Aldi High-Variety Busy Professional Plan',
    note: 'A higher-variety workweek option for people who dislike repeating meals.',
  },
  {
    to: '/plans/aldi-cheap-student-batch-2000-one-pan',
    label: 'Aldi One-Pan Student Batch Plan',
    note: 'A student-friendly batch plan with lower-effort cooking.',
  },
  {
    to: '/plans/aldi-endurance-veg-2000-training-day',
    label: 'Aldi Vegetarian Endurance Training-Day Plan',
    note: 'A vegetarian training-day plan with extra carbohydrate support.',
  },
  {
    to: '/plans/aldi-menopause-pesc-1800-batch-cook',
    label: 'Aldi Pescatarian Menopause Batch-Cook Plan',
    note: 'A batch-cook pescatarian plan with steady meals across the week.',
  },
];

export const SEARCH_OPPORTUNITY_CLUSTERS = [
  {
    title: 'Meal Prep Containers',
    intro: 'Compare practical container options for work lunches, freezing, batch cooking and reheating.',
    links: [
      { to: '/meal-prep-containers', label: 'Best Meal Prep Containers UK' },
      { to: '/blog/best-meal-prep-containers-uk', label: 'Best Containers Buying Guide' },
      { to: '/blog/meal-prep-containers-uk', label: 'Glass vs Plastic and Sizes' },
      { to: '/meal-prep-containers/mid-range', label: 'Glass Meal Prep Containers' },
    ],
  },
  {
    title: '1500 Calorie Meal Plans',
    intro: 'Plan a simple lower-calorie week with printable options, shopping lists and realistic UK meals.',
    links: [
      { to: '/meal-plans/1500-calorie', label: 'Printable 1500 Calorie Meal Plans' },
      { to: '/blog/what-does-1500-calories-look-like-uk', label: 'What 1500 Calories Looks Like' },
      { to: '/blog/1500-vs-1800-vs-2000-calories', label: '1500 vs 1800 vs 2000 Calories' },
      { to: '/plans/asda-weight-loss-1500', label: 'Asda 1500 Calorie Plan' },
    ],
  },
  {
    title: 'Low Calorie Foods and Weight Loss',
    intro: 'Move from low-calorie food ideas into complete weekly plans, shopping lists and filling meals.',
    links: [
      { to: '/blog/best-low-calorie-foods-uk', label: 'Low Calorie Foods UK' },
      { to: '/meal-plans/low-calorie', label: 'Low Calorie Meal Plans UK' },
      { to: '/meal-plans/low-calorie-shopping-list', label: 'Low Calorie Shopping List' },
      { to: '/meal-plans/weight-loss', label: 'Weight Loss Meal Plan UK' },
      { to: '/plans/aldi-budget-fat-loss-1500-v2-high-fibre', label: 'High-Fibre Budget Fat Loss Plan' },
    ],
  },
  {
    title: 'Cheap Protein and High Protein',
    intro: 'Builds authority around cheap protein, high-protein snacks and supermarket protein planning.',
    links: [
      { to: '/blog/best-cheap-high-protein-foods-uk', label: 'Cheap Protein UK' },
      { to: '/blog/cheap-protein-sources-uk-supermarkets', label: 'Cheap Protein Sources UK' },
      { to: '/blog/high-protein-snacks-uk', label: 'High Protein Snacks UK' },
      { to: '/meal-plans/high-protein', label: 'High Protein Meal Plans' },
    ],
  },
  {
    title: 'Summer Meals and Cold Lunches',
    intro: 'Seasonal recipe-led content for summer meals, no-reheat lunches, overnight oats and high-protein work lunches.',
    links: [
      { to: '/blog/summer-meals-uk', label: 'Summer Meals UK' },
      { to: '/blog/meal-prep-without-a-microwave-uk', label: 'No Microwave Meal Prep' },
      { to: '/blog/overnight-oats-meal-prep-uk', label: 'Overnight Oats Meal Prep' },
      { to: '/blog/high-protein-lunches-for-work-uk', label: 'High Protein Work Lunches' },
    ],
  },
  {
    title: 'Supermarket Meal Prep',
    intro: 'Compare UK supermarkets for meal prep, or go straight to named-store meal plans and guides.',
    links: [
      { to: '/blog/cheapest-uk-supermarket-meal-prep', label: 'Best UK Supermarkets for Meal Prep' },
      { to: '/blog/lidl-meal-prep-uk', label: 'Lidl Meal Prep UK' },
      { to: '/meal-plans/aldi', label: 'Aldi Meal Plans' },
      { to: '/meal-plans/tesco', label: 'Tesco Meal Plans' },
    ],
  },
];

export const SEO_PRIORITY_ROUTES = [
  ...DISCOVERY_PRIORITY_LINKS.map(link => link.to),
  ...SEARCH_OPPORTUNITY_CLUSTERS.flatMap(cluster => cluster.links.map(link => link.to)),
];
