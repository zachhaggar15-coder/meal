export const DISCOVERY_PRIORITY_LINKS = [
  {
    to: '/blog/sainsburys-meal-prep-uk',
    label: "Sainsbury's meal prep UK",
    note: 'Supermarket guide found by Search Console but not yet crawled.',
  },
  {
    to: '/meal-plan/asda-1500-calorie-meal-plan',
    label: 'Asda 1500 calorie legacy plan',
    note: 'Legacy plan page now linked into the current calorie and supermarket hubs.',
  },
  {
    to: '/plans/aldi-anti-inflammatory-veg-1800-mediterranean',
    label: 'Aldi vegetarian anti-inflammatory Mediterranean plan',
    note: 'Specific generated plan from the discovered-not-indexed sample.',
  },
  {
    to: '/plans/aldi-budget-bodybuilding-2000-lean-bulk',
    label: 'Aldi budget bodybuilding lean bulk plan',
    note: 'Budget muscle-gain page from the discovered-not-indexed sample.',
  },
  {
    to: '/plans/aldi-budget-fat-loss-1500-v2-high-fibre',
    label: 'Aldi high-fibre budget fat-loss plan',
    note: 'Low-calorie budget page from the discovered-not-indexed sample.',
  },
  {
    to: '/plans/aldi-busy-professional-1800',
    label: 'Aldi busy professional 1800 calorie plan',
    note: 'Batch-cook workweek page from the discovered-not-indexed sample.',
  },
  {
    to: '/plans/aldi-busy-professional-1800-v2-high-variety',
    label: 'Aldi high-variety busy professional plan',
    note: 'Alternative workweek page from the discovered-not-indexed sample.',
  },
  {
    to: '/plans/aldi-cheap-student-batch-2000-one-pan',
    label: 'Aldi one-pan student batch plan',
    note: 'Student meal prep page from the discovered-not-indexed sample.',
  },
  {
    to: '/plans/aldi-endurance-veg-2000-training-day',
    label: 'Aldi vegetarian endurance training-day plan',
    note: 'Training-fuel page from the discovered-not-indexed sample.',
  },
  {
    to: '/plans/aldi-menopause-pesc-1800-batch-cook',
    label: 'Aldi pescatarian menopause batch-cook plan',
    note: 'Nutrition-support page from the discovered-not-indexed sample.',
  },
];

export const SEARCH_OPPORTUNITY_CLUSTERS = [
  {
    title: 'Meal prep containers',
    intro: 'Highest near-page-one opportunity from Search Console: best meal prep containers, glass containers, tubs and work lunch boxes.',
    links: [
      { to: '/meal-prep-containers', label: 'Best meal prep containers UK' },
      { to: '/blog/best-meal-prep-containers-uk', label: 'Best containers buying guide' },
      { to: '/blog/meal-prep-containers-uk', label: 'Glass vs plastic and sizes' },
      { to: '/meal-prep-containers/mid-range', label: 'Glass meal prep containers' },
    ],
  },
  {
    title: '1500 calorie meal plans',
    intro: 'Large impression cluster for printable, simple and free 1500 calorie plan searches.',
    links: [
      { to: '/meal-plans/1500-calorie', label: 'Printable 1500 calorie meal plans' },
      { to: '/blog/what-does-1500-calories-look-like-uk', label: 'What 1500 calories looks like' },
      { to: '/blog/1500-vs-1800-vs-2000-calories', label: '1500 vs 1800 vs 2000 calories' },
      { to: '/plans/asda-weight-loss-1500', label: 'Asda 1500 calorie plan' },
    ],
  },
  {
    title: 'Low calorie foods and weight loss',
    intro: 'Existing impressions need better hub paths from low-calorie guides into printable plans and shopping lists.',
    links: [
      { to: '/blog/best-low-calorie-foods-uk', label: 'Low calorie foods UK' },
      { to: '/meal-plans/low-calorie-shopping-list', label: 'Low calorie shopping list' },
      { to: '/meal-plans/weight-loss', label: 'Lose weight meal plans UK' },
      { to: '/plans/aldi-budget-fat-loss-1500-v2-high-fibre', label: 'High-fibre budget fat loss plan' },
    ],
  },
  {
    title: 'Cheap protein and high protein',
    intro: 'Builds authority around cheap protein, high-protein snacks and supermarket protein planning.',
    links: [
      { to: '/blog/best-cheap-high-protein-foods-uk', label: 'Cheap high protein foods UK' },
      { to: '/blog/cheap-protein-sources-uk-supermarkets', label: 'Cheap protein sources' },
      { to: '/blog/high-protein-snacks-uk', label: 'High protein snacks UK' },
      { to: '/meal-plans/high-protein', label: 'High protein meal plans' },
    ],
  },
  {
    title: 'Supermarket meal prep',
    intro: "Early long-tail rankings around Lidl, Aldi, Tesco and Sainsbury's should point into named-store hubs.",
    links: [
      { to: '/blog/lidl-meal-prep-uk', label: 'Lidl meal prep UK' },
      { to: '/blog/sainsburys-meal-prep-uk', label: "Sainsbury's meal prep UK" },
      { to: '/meal-plans/aldi', label: 'Aldi meal plans' },
      { to: '/meal-plans/tesco', label: 'Tesco meal plans' },
    ],
  },
];

export const SEO_PRIORITY_ROUTES = [
  ...DISCOVERY_PRIORITY_LINKS.map(link => link.to),
  ...SEARCH_OPPORTUNITY_CLUSTERS.flatMap(cluster => cluster.links.map(link => link.to)),
];
