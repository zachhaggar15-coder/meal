import { blogPostsData } from './blogPosts.js';
import { COMBO_LANDING_PAGES } from './comboLandingPages.js';
import { CONTAINER_GUIDE_GROUPS } from './containerProducts.js';
import { MEAL_PLAN_HUBS } from './mealPlanHubs.js';
import { PLAN_COUNT } from './planSeeds.js';
import {
  buildCalorieChooserPath,
  buildDietChooserPath,
  buildPlanChooserPath,
  buildSupermarketChooserPath,
  CALORIE_CHOICES,
  DIET_CHOICES,
  GOAL_CHOOSER_ITEMS,
  INDEXED_SUPERMARKET_CHOICES,
} from './planChooser.js';
import { getAllPlanMeta } from '../utils/planBuilder.js';

export { PLAN_COUNT };

export const TOOL_LINKS = [
  {
    to: '/tools#fridge-dinner-builder',
    label: 'Fridge Dinner Builder',
    description: 'Turn ingredients you already have into dinner ideas.',
  },
  {
    to: '/tools#calorie-calculator',
    label: 'Calorie Calculator',
    description: 'Estimate a daily target before choosing a plan.',
  },
  {
    to: '/tools#protein-calculator',
    label: 'Protein Calculator',
    description: 'Set a simple protein range for the week.',
  },
  {
    to: '/tools#shopping-budget-estimator',
    label: 'Shopping Budget Estimator',
    description: 'Estimate a weekly shop by supermarket and household size.',
  },
  {
    to: '/tools#protein-value-comparator',
    label: 'Protein Value Comparator',
    description: 'Compare foods by cost per 25g/30g of protein.',
  },
  {
    to: '/tools#container-count-calculator',
    label: 'Container Count Recommender',
    description: 'Work out how many tubs you actually need.',
  },
  {
    to: '/tools#printable-plans',
    label: 'Printable Plans',
    description: 'Jump to plans with PDFs and shopping lists.',
  },
];

export const START_LINKS = [
  {
    to: '/quiz',
    label: 'Find My Plan',
    description: 'Take the quick quiz and get matched to your best plan.',
    intent: 'primary',
  },
  {
    to: '/browse',
    label: `Browse ${PLAN_COUNT} Plans`,
    description: 'Filter by goal, supermarket, diet, calories, budget and effort.',
  },
  {
    to: '/tools',
    label: 'Use Planning Tools',
    description: 'Calculators for calories, protein, budget, containers and dinners.',
  },
  {
    to: '/meal-prep-containers',
    label: 'Choose Containers',
    description: 'Compare tubs and box setups before batch cooking.',
  },
];

export const GOAL_NAV_LINKS = GOAL_CHOOSER_ITEMS.map(item => ({
  to: buildPlanChooserPath(item.value),
  label: item.label,
  description: `Compare ${item.label.toLowerCase()} plans by supermarket.`,
}));

export const SUPERMARKET_NAV_LINKS = INDEXED_SUPERMARKET_CHOICES.map(item => ({
  to: buildSupermarketChooserPath(item.value),
  label: item.label,
  description: item.description,
}));

export const CALORIE_NAV_LINKS = CALORIE_CHOICES.map(item => ({
  to: `/meal-plans/${item.value}-calorie`,
  label: item.label,
  description: item.description,
  chooserTo: buildCalorieChooserPath(item.value),
}));

export const DIET_NAV_LINKS = DIET_CHOICES.map(item => ({
  to: buildDietChooserPath(item.value),
  label: item.label,
  description: item.description,
}));

export const GUIDE_NAV_LINKS = [
  {
    to: '/questions',
    label: 'Meal Prep Questions',
    description: 'Real questions about protein, cost, storage and equipment, answered directly.',
  },
  {
    to: '/blog/meal-prep-for-beginners-uk',
    label: 'Meal Prep For Beginners',
    description: 'Start here if you are new to weekly planning.',
  },
  {
    to: '/blog/how-to-build-a-calorie-deficit',
    label: 'Calorie Deficit Guide',
    description: 'Understand the calorie side before picking a plan.',
  },
  {
    to: '/blog/high-protein-low-calorie-meals',
    label: 'High Protein Meals',
    description: 'Ideas for higher-protein, lower-calorie weeks.',
  },
  {
    to: '/blog/cheap-protein-sources-uk-supermarkets',
    label: 'Cheap Protein Sources',
    description: 'Budget-friendly protein across UK supermarkets.',
  },
  {
    to: '/blog/batch-cooking-for-beginners-uk',
    label: 'Batch Cooking Guide',
    description: 'Prep once and make the week easier.',
  },
  {
    to: '/blog',
    label: 'All Guides',
    description: 'Browse the full guide library.',
  },
];

export const CONTAINER_NAV_LINKS = [
  {
    to: '/meal-prep-containers',
    label: 'Best Containers',
    description: 'Compare the three container setups most people need.',
  },
  ...CONTAINER_GUIDE_GROUPS.flatMap(group => group.guides.map(guide => ({
    to: `/meal-prep-containers/${guide.slug}`,
    label: guide.label,
    description: group.label,
  }))),
  {
    to: '/tools#container-count-calculator',
    label: 'Container Count Tool',
    description: 'Calculate your box count from meals and prep days.',
  },
];

export const ACCESSORY_NAV_LINKS = [
  {
    to: '/meal-prep-containers/freezer-bags',
    label: 'Freezer Bags',
    description: 'Reusable freezer bags for flat-freezing batch-cooked meals.',
  },
  {
    to: '/blog/insulated-meal-prep-bags-uk',
    label: 'Insulated Meal Prep Bags',
    description: 'Lunch cooler bags for work, gym meals and longer commutes.',
  },
  {
    to: '/blog/reusable-ice-packs-for-lunch-bags-uk',
    label: 'Reusable Ice Packs',
    description: 'Slim freezer blocks for chilled packed lunches.',
  },
  {
    to: '/blog/best-sauce-pots-for-meal-prep-uk',
    label: 'Sauce Pots',
    description: 'Dressing and dip pots for salads, bowls and wraps.',
  },
  {
    to: '/blog/overnight-oats-jars-for-meal-prep-uk',
    label: 'Overnight Oats Jars',
    description: 'Breakfast jars and pots for grab-and-go prep.',
  },
  {
    to: '/blog/best-food-thermometers-for-meal-prep-uk',
    label: 'Food Thermometers',
    description: 'Probe thermometers for chicken, mince and batch cooking.',
  },
  {
    to: '/blog/insulated-food-flasks-for-meal-prep-uk',
    label: 'Food Flasks',
    description: 'Hot lunch jars for soup, chilli and no-microwave days.',
  },
  {
    to: '/blog/best-vegetable-choppers-for-meal-prep-uk',
    label: 'Vegetable Choppers',
    description: 'Manual choppers and dicers for faster batch prep.',
  },
  {
    to: '/blog/best-air-fryer-accessories-for-meal-prep-uk',
    label: 'Air Fryer Accessories',
    description: 'Liners, racks and kits for repeat air-fryer cooking.',
  },
  {
    to: '/blog/best-protein-shakers-uk',
    label: 'Protein Shakers',
    description: 'Simple shaker bottles for gym snacks and protein top-ups.',
  },
  {
    to: '/blog/freezer-labels-for-meal-prep-uk',
    label: 'Freezer Labels',
    description: 'Date and contents stickers for tubs, bags and jars.',
  },
];

export const PRIMARY_NAV_LINKS = [
  { to: '/browse', label: 'Browse Plans', match: path => path === '/browse' || path.startsWith('/plans/') },
  { to: '/tools', label: 'Tools', match: path => path === '/tools' },
  { to: '/blog', label: 'Guides', match: path => path.startsWith('/blog') },
  { to: '/meal-prep-containers', label: 'Containers', match: path => path.startsWith('/meal-prep-containers') },
];

export const NAV_DROPDOWNS = [
  {
    label: 'Supermarkets',
    items: SUPERMARKET_NAV_LINKS,
    match: path => path === '/meal-plans' || path.startsWith('/choose-supermarket/'),
  },
  {
    label: 'Calories',
    items: CALORIE_NAV_LINKS,
    match: (path, search) => path.startsWith('/choose-calories/') || /\/meal-plans\/\d+-calorie/.test(path) || search.includes('calories='),
  },
];

export const MOBILE_NAV_GROUPS = [
  { label: 'Meal Prep Accessories', items: ACCESSORY_NAV_LINKS, defaultOpen: true },
  { label: 'Start Here', items: START_LINKS, defaultOpen: true },
  { label: 'Plan By Goal', items: GOAL_NAV_LINKS, defaultOpen: true },
  { label: 'Supermarket', items: SUPERMARKET_NAV_LINKS, defaultOpen: true },
  { label: 'Calories', items: CALORIE_NAV_LINKS, defaultOpen: true },
  { label: 'Diet Type', items: DIET_NAV_LINKS },
  { label: 'Tools', items: TOOL_LINKS },
  { label: 'Guides', items: GUIDE_NAV_LINKS },
  { label: 'Containers', items: CONTAINER_NAV_LINKS, defaultOpen: true },
];

export const FOOTER_GROUPS = [
  {
    label: 'Start',
    items: [
      { to: '/quiz', label: 'Find My Plan' },
      { to: '/browse', label: `Browse ${PLAN_COUNT} Plans` },
      { to: '/tools', label: 'Tools' },
      { to: '/meal-plans', label: 'Supermarkets' },
    ],
  },
  {
    label: 'Popular Plans',
    items: [
      { to: '/meal-plans/weight-loss', label: 'Weight Loss' },
      { to: '/meal-plans/high-protein', label: 'High Protein' },
      { to: '/meal-plans/1500-calorie', label: '1,500 kcal' },
      { to: '/meal-plans/meal-plans-with-shopping-list', label: 'Shopping Lists' },
    ],
  },
  {
    label: 'Guides',
    items: [
      { to: '/questions', label: 'Meal Prep Questions' },
      { to: '/blog/meal-prep-for-beginners-uk', label: 'Beginners' },
      { to: '/blog/how-to-build-a-calorie-deficit', label: 'Calorie Deficit' },
      { to: '/blog/high-protein-low-calorie-meals', label: 'High Protein Meals' },
      { to: '/blog', label: 'All Guides' },
    ],
  },
  {
    label: 'Prep Kit',
    items: [
      { to: '/meal-prep-containers', label: 'Best Containers' },
      { to: '/meal-prep-containers/budget', label: 'Budget Containers' },
      { to: '/meal-prep-containers/glass', label: 'Glass Containers' },
      { to: '/stickers', label: 'Meal Prep Stickers' },
    ],
  },
  {
    label: 'Company',
    items: [
      { to: '/about', label: 'About' },
      { to: '/contact', label: 'Contact' },
      { to: '/privacy', label: 'Privacy' },
      { to: '/terms', label: 'Terms' },
    ],
  },
];

const STATIC_SEARCH_ENTRIES = [
  {
    title: 'Find My Plan Quiz',
    to: '/quiz',
    type: 'Start here',
    description: 'Answer a few questions and get matched to a plan.',
    keywords: 'quiz match matched plan beginner first time',
    priority: 100,
  },
  {
    title: `Browse ${PLAN_COUNT} UK Meal Plans`,
    to: '/browse',
    type: 'Plan browser',
    description: 'Filter by goal, supermarket, diet, calories, budget and effort.',
    keywords: 'browse search filter all plans meal plan finder',
    priority: 95,
  },
  {
    title: 'UK Meal Prep Tools',
    to: '/tools',
    type: 'Tools',
    description: 'Calories, protein, budget, fridge dinner and container calculators.',
    keywords: 'calculator tools calorie protein budget shopping list containers fridge dinner printable pdf',
    priority: 80,
  },
  {
    title: 'UK Meal Plans by Supermarket',
    to: '/meal-plans',
    type: 'Supermarkets',
    description: 'Choose your supermarket first, then pick a goal.',
    keywords: 'supermarket aldi lidl tesco asda sainsburys morrisons iceland waitrose ocado m&s coop',
    priority: 85,
  },
  {
    title: 'Best Meal Prep Containers UK',
    to: '/meal-prep-containers',
    type: 'Containers',
    description: 'Compare budget plastic, glass lunch boxes and larger sets.',
    keywords: 'containers tubs boxes glass plastic freezer work lunch leakproof affiliate',
    priority: 78,
  },
  {
    title: 'Meal Prep Blog UK',
    to: '/blog',
    type: 'Guides',
    description: 'Free UK guides for weight loss, high protein, batch cooking and supermarkets.',
    keywords: 'blog guides articles nutrition beginner calorie deficit high protein',
    priority: 70,
  },
  {
    title: 'Meal Prep Questions Answered',
    to: '/questions',
    type: 'Guides',
    description: 'Real questions about protein, cost, supermarkets, storage and equipment, organised by topic.',
    keywords: 'questions faq protein value cost cheapest supermarket storage batch cooking equipment ask',
    priority: 72,
  },
  {
    title: 'MealPrep Feedback',
    to: '/feedback',
    type: 'Feedback',
    description: 'Send site feedback, report confusing pages or suggest improvements.',
    keywords: 'feedback suggestion problem bug issue contact improve report',
    priority: 68,
  },
];

export const SITE_SEARCH_INDEX = buildSiteSearchIndex();

export function searchSite(query, limit = 8) {
  const terms = normaliseSearch(query).split(' ').filter(Boolean);
  if (!terms.length) return STATIC_SEARCH_ENTRIES.slice(0, limit);

  return SITE_SEARCH_INDEX
    .map(item => ({ item, score: scoreSearchItem(item, terms) }))
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score || b.item.priority - a.item.priority)
    .slice(0, limit)
    .map(result => result.item);
}

function buildSiteSearchIndex() {
  const entries = [
    ...STATIC_SEARCH_ENTRIES,
    ...GOAL_NAV_LINKS.map(link => ({
      title: `${link.label} Meal Plans`,
      to: link.to,
      type: 'Goal',
      description: link.description,
      keywords: `${link.label} goal diet plan`,
      priority: 70,
    })),
    ...SUPERMARKET_NAV_LINKS.map(link => ({
      title: `${link.label} Meal Plans`,
      to: link.to,
      type: 'Supermarket',
      description: link.description,
      keywords: `${link.label} supermarket shop weekly plan`,
      priority: 74,
    })),
    ...CALORIE_NAV_LINKS.map(link => ({
      title: `${link.label} Meal Plans`,
      to: link.to,
      type: 'Calories',
      description: link.description,
      keywords: `${link.label} calorie calories kcal target`,
      priority: 72,
    })),
    ...DIET_NAV_LINKS.map(link => ({
      title: `${link.label} Meal Plans`,
      to: link.to,
      type: 'Diet',
      description: link.description,
      keywords: `${link.label} diet vegetarian vegan pescatarian`,
      priority: 68,
    })),
    ...TOOL_LINKS.map(link => ({
      title: link.label,
      to: link.to,
      type: 'Tool',
      description: link.description,
      keywords: link.description,
      priority: 76,
    })),
    ...CONTAINER_NAV_LINKS.map(link => ({
      title: link.label,
      to: link.to,
      type: 'Containers',
      description: link.description,
      keywords: `${link.label} ${link.description} tubs boxes lunch freezer`,
      priority: 66,
    })),
    ...Object.values(MEAL_PLAN_HUBS).map(hub => ({
      title: hub.h1,
      to: hub.path,
      type: 'Meal plan hub',
      description: hub.description || hub.intro,
      keywords: [hub.title, hub.kicker, hub.stats?.join(' '), hub.intro].filter(Boolean).join(' '),
      priority: 62,
    })),
    ...Object.values(COMBO_LANDING_PAGES).map(page => ({
      title: page.h1,
      to: page.path,
      type: 'Meal plan hub',
      description: page.description || page.intro,
      keywords: [page.title, page.kicker, page.intro].filter(Boolean).join(' '),
      priority: 58,
    })),
    ...Object.entries(blogPostsData).map(([slug, post]) => ({
      title: post.h1 || post.title,
      to: `/blog/${slug}`,
      type: 'Guide',
      description: post.description || post.intro,
      keywords: [post.title, post.intro, post.description].filter(Boolean).join(' '),
      priority: 55,
    })),
    ...getAllPlanMeta().map(plan => ({
      title: plan.title,
      to: `/plans/${plan.slug}`,
      type: 'Plan',
      description: `${plan.goalLabel} plan, ${plan.calories.toLocaleString('en-GB')} kcal, ${plan.priceEstimate}/week.`,
      keywords: [
        plan.goalLabel,
        plan.goal,
        plan.supermarket,
        plan.dietType,
        plan.calories,
        plan.budget,
        plan.effort,
        plan.emphasis,
      ].join(' '),
      priority: 45,
    })),
  ];

  const unique = new Map();
  for (const entry of entries) {
    if (!entry?.to || !entry?.title || unique.has(entry.to)) continue;
    const haystack = normaliseSearch([
      entry.title,
      entry.type,
      entry.description,
      entry.keywords,
    ].filter(Boolean).join(' '));
    unique.set(entry.to, { ...entry, haystack });
  }

  return [...unique.values()];
}

function scoreSearchItem(item, terms) {
  const title = normaliseSearch(item.title);
  let score = item.priority || 0;

  for (const term of terms) {
    if (title === term) score += 80;
    else if (title.startsWith(term)) score += 45;
    else if (title.includes(term)) score += 30;
    else if (item.haystack.includes(term)) score += 12;
    else return 0;
  }

  if (terms.join(' ') && title.includes(terms.join(' '))) score += 50;
  return score;
}

function normaliseSearch(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}
