export const DISCOVERY_PRIORITY_LINKS = [
  {
    to: '/blog/sainsburys-meal-prep-uk',
    label: "Sainsbury's Meal Prep UK",
    note: 'Supermarket guide found by Search Console but not yet crawled.',
  },
  {
    to: '/meal-plan/asda-1500-calorie-meal-plan',
    label: 'Asda 1500 Calorie Legacy Plan',
    note: 'Legacy plan page now linked into the current calorie and supermarket hubs.',
  },
  {
    to: '/plans/aldi-anti-inflammatory-veg-1800-mediterranean',
    label: 'Aldi Vegetarian Anti-Inflammatory Mediterranean Plan',
    note: 'Specific generated plan from the discovered-not-indexed sample.',
  },
  {
    to: '/plans/aldi-budget-bodybuilding-2000-lean-bulk',
    label: 'Aldi Budget Bodybuilding Lean Bulk Plan',
    note: 'Budget muscle-gain page from the discovered-not-indexed sample.',
  },
  {
    to: '/plans/aldi-budget-fat-loss-1500-v2-high-fibre',
    label: 'Aldi High-Fibre Budget Fat-Loss Plan',
    note: 'Low-calorie budget page from the discovered-not-indexed sample.',
  },
  {
    to: '/plans/aldi-busy-professional-1800',
    label: 'Aldi Busy Professional 1800 Calorie Plan',
    note: 'Batch-cook workweek page from the discovered-not-indexed sample.',
  },
  {
    to: '/plans/aldi-busy-professional-1800-v2-high-variety',
    label: 'Aldi High-Variety Busy Professional Plan',
    note: 'Alternative workweek page from the discovered-not-indexed sample.',
  },
  {
    to: '/plans/aldi-cheap-student-batch-2000-one-pan',
    label: 'Aldi One-Pan Student Batch Plan',
    note: 'Student meal prep page from the discovered-not-indexed sample.',
  },
  {
    to: '/plans/aldi-endurance-veg-2000-training-day',
    label: 'Aldi Vegetarian Endurance Training-Day Plan',
    note: 'Training-fuel page from the discovered-not-indexed sample.',
  },
  {
    to: '/plans/aldi-menopause-pesc-1800-batch-cook',
    label: 'Aldi Pescatarian Menopause Batch-Cook Plan',
    note: 'Nutrition-support page from the discovered-not-indexed sample.',
  },
];

export const SEARCH_OPPORTUNITY_CLUSTERS = [
  {
    title: 'Meal Prep Containers',
    intro: 'Highest near-page-one opportunity from Search Console: best meal prep containers, glass containers, tubs and work lunch boxes.',
    links: [
      { to: '/meal-prep-containers', label: 'Best Meal Prep Containers UK' },
      { to: '/blog/best-meal-prep-containers-uk', label: 'Best Containers Buying Guide' },
      { to: '/blog/meal-prep-containers-uk', label: 'Glass vs Plastic and Sizes' },
      { to: '/meal-prep-containers/mid-range', label: 'Glass Meal Prep Containers' },
    ],
  },
  {
    title: '1500 Calorie Meal Plans',
    intro: 'Large impression cluster for printable, simple and free 1500 calorie plan searches.',
    links: [
      { to: '/meal-plans/1500-calorie', label: 'Printable 1500 Calorie Meal Plans' },
      { to: '/blog/what-does-1500-calories-look-like-uk', label: 'What 1500 Calories Looks Like' },
      { to: '/blog/1500-vs-1800-vs-2000-calories', label: '1500 vs 1800 vs 2000 Calories' },
      { to: '/plans/asda-weight-loss-1500', label: 'Asda 1500 Calorie Plan' },
    ],
  },
  {
    title: 'Low Calorie Foods and Weight Loss',
    intro: 'Existing impressions need better hub paths from low-calorie guides into printable plans and shopping lists.',
    links: [
      { to: '/blog/best-low-calorie-foods-uk', label: 'Low Calorie Foods UK' },
      { to: '/meal-plans/low-calorie-shopping-list', label: 'Low Calorie Shopping List' },
      { to: '/meal-plans/weight-loss', label: 'Lose Weight Meal Plans UK' },
      { to: '/plans/aldi-budget-fat-loss-1500-v2-high-fibre', label: 'High-Fibre Budget Fat Loss Plan' },
    ],
  },
  {
    title: 'Cheap Protein and High Protein',
    intro: 'Builds authority around cheap protein, high-protein snacks and supermarket protein planning.',
    links: [
      { to: '/blog/best-cheap-high-protein-foods-uk', label: 'Cheap High Protein Foods UK' },
      { to: '/blog/cheap-protein-sources-uk-supermarkets', label: 'Cheap Protein Sources' },
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
