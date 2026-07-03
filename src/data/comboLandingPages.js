const REVIEWED_DATE = '22 June 2026';

export const SUPERMARKET_EVIDENCE = {
  any: {
    label: 'Generic UK supermarket',
    notes: [
      'Use common UK staples first: oats, rice, potatoes, pasta, eggs, tins, frozen vegetables, yogurt and lean protein.',
      'Keep branded products optional so the plan still works at Tesco, Aldi, Lidl, Asda, Sainsbury\'s, Morrisons, Iceland, Waitrose, Ocado, M&S or Co-op.',
      'Check cupboard items before shopping because sauces, oil, spices, oats and rice are often already at home.',
    ],
  },
  aldi: {
    label: 'Aldi',
    notes: [
      'Best for repeatable low-cost staples such as oats, rice, eggs, tins, frozen vegetables, chicken and Greek-style yogurt.',
      'Batch-cook plans suit Aldi well because fewer niche products means fewer swaps when ranges change.',
      'Use the same protein across lunches or dinners if a pack size is larger than one meal needs.',
    ],
  },
  lidl: {
    label: 'Lidl',
    notes: [
      'Best for budget weeks built around simple staples, freezer vegetables, tins, yogurt, eggs and own-brand grains.',
      'Choose flexible recipes because some limited-time ranges can rotate quickly.',
      'For batch cooking, buy the core protein and carbohydrate first, then adapt vegetables to what is available.',
    ],
  },
  tesco: {
    label: 'Tesco',
    notes: [
      'Best for broad choice, easy vegetarian swaps, high-protein dairy, ready-to-eat helpers and Clubcard-style shops.',
      'Good when a plan needs a specific diet type because the range is usually wider than discount stores.',
      'Use own-brand alternatives first, then only add premium products where they solve a real convenience problem.',
    ],
  },
  asda: {
    label: 'Asda',
    notes: [
      'Best for larger weekly shops, family-style staples, freezer options and value packs that can be portioned.',
      'Works well for 1800-2500 kcal plans where bigger carbohydrate and protein portions are needed.',
      'Check multipacks and frozen ranges before buying many single fresh items.',
    ],
  },
  sainsburys: {
    label: "Sainsbury's",
    notes: [
      'Best for wider premium and own-brand choice, vegetarian products, fresh produce and flexible swaps.',
      'Useful when a plan needs quality-of-life convenience items without becoming takeaway-dependent.',
      'Watch total basket cost and swap premium items back to own-brand staples when budget matters.',
    ],
  },
  morrisons: {
    label: 'Morrisons',
    notes: [
      'Best for familiar UK meals, fresh counters, freezer staples and flexible weekly shops.',
      'Works well for plans using potatoes, rice, pasta, eggs, tins, yogurt and straightforward proteins.',
      'Use frozen vegetables and tins to reduce waste on one-person meal-prep weeks.',
    ],
  },
  iceland: {
    label: 'Iceland',
    notes: [
      'Best for freezer-friendly, low-effort and batch-cook plans with vegetables, fish, chicken and ready-to-cook bases.',
      'Use frozen veg and protein to keep weekday cooking quick and reduce missed fresh ingredients.',
      'Pair freezer mains with simple fresh sides if a plan needs more volume or fibre.',
    ],
  },
  waitrose: {
    label: 'Waitrose',
    notes: [
      'Best for quality-focused shops using strong produce, higher-welfare proteins, fish, dairy and prepared vegetables.',
      'Use Waitrose own-label basics first, then reserve premium ingredients for meals where quality noticeably improves the week.',
      'Watch the basket total by keeping carbohydrates, tins, oats and freezer staples simple.',
    ],
  },
  ocado: {
    label: 'Ocado',
    notes: [
      'Best for planned online shops, wider range searches, scheduled deliveries and easy repeat baskets.',
      'Use Ocado plans when you want M&S products, broad branded choice or specialist diet items without visiting multiple stores.',
      'Check substitutions and delivery cut-offs before relying on a narrow ingredient or exact pack size.',
    ],
  },
  'marks-spencer': {
    label: 'M&S',
    notes: [
      'Best for premium convenience, fresh prepared ingredients, quality proteins and smaller high-value baskets.',
      'Use M&S plans when the week needs quick assembly meals, salads, fish, cooked grains or prepared veg that save time.',
      'Balance the shop with simple staples so convenience items do not push the whole plan into a premium basket.',
    ],
  },
  coop: {
    label: 'Co-op',
    notes: [
      'Best for local convenience shops, top-up baskets, simple staples and smaller household meal prep.',
      'Use flexible recipes because range and pack sizes can vary by store format and local availability.',
      'Keep the plan built around easy-to-find basics such as eggs, oats, tins, pasta, potatoes, wraps, yogurt and frozen veg where available.',
    ],
  },
};

const GOAL_LABEL = {
  'weight-loss': 'Weight loss',
  'budget-fat-loss': 'Budget fat loss',
  'high-protein-low-cal': 'High protein low calorie',
  'muscle-gain': 'Muscle gain',
  'cheap-student': 'Cheap student',
  'cheap-high-protein': 'Cheap high protein',
  'low-effort': 'Low effort',
  'busy-professional': 'Busy professional',
  'vegetarian-low-cal': 'Vegetarian low calorie',
  'vegan-low-cal': 'Vegan low calorie',
  'high-protein-vegetarian': 'High protein vegetarian',
  pescatarian: 'Pescatarian',
  'body-recomp': 'Body recomposition',
  cutting: 'Cutting',
};

const DIET_LABEL = {
  standard: 'Standard',
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  pescatarian: 'Pescatarian',
};

const EFFORT_LABEL = {
  minimal: 'Minimal prep',
  low: 'Low effort',
  standard: 'Standard prep',
  batch: 'Batch cooking',
  'high-variety': 'High variety',
};

const DEFAULT_SUPPORTING_LINKS = [
  { label: 'Meal prep for beginners UK', to: '/blog/meal-prep-for-beginners-uk' },
  { label: 'Meal plans with shopping lists', to: '/meal-plans/meal-plans-with-shopping-list' },
  { label: 'Printable meal plan PDFs', to: '/meal-plans/printable-meal-plans' },
  { label: 'Best meal prep containers UK', to: '/blog/best-meal-prep-containers-uk' },
];

function combo({
  slug,
  h1,
  title = `${h1} | MealPrep.org.uk`,
  description,
  kicker = 'UK meal-plan comparison',
  intro,
  match,
  preferredSlugs = [],
  quickAnswer,
  whyItWorks,
  shoppingFocus,
  faq,
  relatedSlugs = [],
  supportingLinks = DEFAULT_SUPPORTING_LINKS,
}) {
  return {
    slug,
    path: `/meal-plans/${slug}`,
    h1,
    title,
    description,
    kicker,
    intro,
    match,
    preferredSlugs,
    quickAnswer,
    whyItWorks,
    shoppingFocus,
    faq,
    relatedSlugs,
    supportingLinks,
    reviewed: REVIEWED_DATE,
  };
}

export const COMBO_LANDING_PAGES = {
  'aldi-1500-calorie-meal-plan': combo({
    slug: 'aldi-1500-calorie-meal-plan',
    h1: 'Aldi 1500 Calorie Meal Plans UK',
    description: 'Compare free Aldi 1500 calorie meal plans for weight loss, high protein and vegetarian weeks, with shopping lists and printable PDFs.',
    intro: 'Use this page when you want a lower-calorie Aldi week without building the shop from scratch. It groups the best Aldi plans around 1500 calories and explains how to keep the basket simple.',
    match: { supermarkets: ['aldi'], calories: [1500], goals: ['weight-loss', 'high-protein-low-cal', 'vegetarian-low-cal', 'vegan-low-cal', 'cutting'] },
    preferredSlugs: ['aldi-weight-loss-1500', 'aldi-high-protein-low-cal-1500', 'aldi-veg-low-cal-1500', 'aldi-vegan-low-cal-1500', 'aldi-cutting-1400'],
    quickAnswer: 'Start with an Aldi 1500 calorie plan if you want a tight, budget-friendly weight-loss week built around simple staples rather than specialist diet products.',
    whyItWorks: 'Aldi works best when the plan repeats core ingredients: oats, eggs, tins, rice, potatoes, frozen vegetables, yogurt and one or two protein anchors.',
    shoppingFocus: 'Buy the protein and carbohydrate staples first, then use frozen or seasonal vegetables to keep the shop flexible.',
    faq: [
      { q: 'Which Aldi 1500 calorie plan should I start with?', a: 'For most people, start with the standard Aldi weight loss plan, then move to high protein, vegetarian or vegan if that matches your diet.' },
      { q: 'Can I print the Aldi shopping list?', a: 'Yes. Open any matching plan and use the PDF or copy-shopping-list tools on the plan page.' },
    ],
    relatedSlugs: ['tesco-1500-calorie-meal-plan', 'aldi-high-protein-meal-plan', 'cheap-student-meal-prep-aldi'],
  }),

  'tesco-1500-calorie-meal-plan': combo({
    slug: 'tesco-1500-calorie-meal-plan',
    h1: 'Tesco 1500 Calorie Meal Plans UK',
    description: 'Compare free Tesco 1500 calorie meal plans with weight-loss, high-protein, vegetarian and batch-cook options plus printable shopping lists.',
    intro: 'These Tesco 1500 calorie plans are for shoppers who want more choice than a discount-store basket but still need a clear calorie-controlled week.',
    match: { supermarkets: ['tesco'], calories: [1500], goals: ['weight-loss', 'high-protein-low-cal', 'vegetarian-low-cal', 'vegan-low-cal', 'cutting'] },
    preferredSlugs: ['tesco-weight-loss-1500', 'tesco-high-protein-low-cal-1500', 'tesco-weight-loss-1500-v2', 'tesco-veg-low-cal-1500', 'tesco-cutting-1400'],
    quickAnswer: 'Tesco is a strong 1500 calorie choice when you want more high-protein dairy, ready-to-eat helpers and vegetarian swaps without losing the weekly structure.',
    whyItWorks: 'The wider range makes it easier to keep the plan realistic if you need pescatarian, vegetarian or high-protein alternatives.',
    shoppingFocus: 'Use Tesco own-brand staples first, then add convenience items only where they prevent skipped meals.',
    faq: [
      { q: 'Are Tesco 1500 calorie plans only for weight loss?', a: 'They are mainly calorie-controlled plans, but the page includes high-protein and diet-specific options too.' },
      { q: 'Can I swap Tesco products for another supermarket?', a: 'Yes. The meals use common UK ingredients, but exact ranges and prices will differ.' },
    ],
    relatedSlugs: ['aldi-1500-calorie-meal-plan', 'tesco-high-protein-meal-plan', 'tesco-meal-prep-for-weight-loss'],
  }),

  'asda-1800-calorie-meal-plan': combo({
    slug: 'asda-1800-calorie-meal-plan',
    h1: 'Asda 1800 Calorie Meal Plans UK',
    description: 'Compare free Asda 1800 calorie meal plans for weight loss, high protein, pescatarian and muscle-gain weeks with shopping lists.',
    intro: 'An 1800 calorie Asda plan gives more room for proper lunches, warm dinners and useful snacks while keeping the weekly shop structured.',
    match: { supermarkets: ['asda'], calories: [1800], goals: ['weight-loss', 'high-protein-low-cal', 'budget-fat-loss', 'busy-professional', 'pescatarian'] },
    preferredSlugs: ['asda-weight-loss-1800', 'asda-high-protein-low-cal-1800', 'asda-budget-fat-loss-1800', 'asda-busy-professional-1800', 'asda-pescatarian-1800'],
    quickAnswer: 'Choose Asda 1800 calorie plans when 1500 feels too tight and you want a bigger, more repeatable supermarket basket.',
    whyItWorks: 'Asda works well for larger weekly shops and value packs that can be portioned across lunches and dinners.',
    shoppingFocus: 'Use multipacks, frozen vegetables and rice or potato bases to make the plan easier to repeat.',
    faq: [
      { q: 'Is 1800 calories better than 1500?', a: 'It depends on body size, activity and hunger. 1800 calories can be easier to repeat if lower targets make evenings difficult.' },
      { q: 'Do the Asda plans include recipes?', a: 'Yes. Each plan page includes meals, recipes, macros and a shopping list.' },
    ],
    relatedSlugs: ['tesco-1500-calorie-meal-plan', 'lidl-budget-meal-prep', 'work-lunch-meal-prep-uk'],
  }),

  'aldi-high-protein-meal-plan': combo({
    slug: 'aldi-high-protein-meal-plan',
    h1: 'Aldi High Protein Meal Plans UK',
    description: 'Compare free Aldi high protein meal plans for low-calorie, vegetarian, muscle-gain and batch-cook weeks with shopping lists.',
    intro: 'These Aldi high protein plans focus on meals that make protein visible without relying on expensive specialist snacks.',
    match: { supermarkets: ['aldi'], goals: ['high-protein-low-cal', 'high-protein-vegetarian', 'muscle-gain', 'cheap-high-protein', 'body-recomp'] },
    preferredSlugs: ['aldi-high-protein-low-cal-1500', 'aldi-high-protein-low-cal-1800', 'aldi-high-protein-low-cal-1500-v2', 'aldi-hp-veg-1800', 'aldi-cheap-hp-1800', 'aldi-body-recomp-1800'],
    quickAnswer: 'Aldi high protein meal prep works best with eggs, yogurt, chicken, tuna, tofu, beans, lentils and repeatable rice or potato bases.',
    whyItWorks: 'The value comes from ordinary foods rather than protein bars: dairy, eggs, tins, meat, tofu and legumes.',
    shoppingFocus: 'Choose two protein anchors for the week, then add oats, rice, potatoes, wraps and frozen vegetables around them.',
    faq: [
      { q: 'Can Aldi high protein plans be vegetarian?', a: 'Yes. Use the Aldi high protein vegetarian plan if you prefer eggs, dairy, tofu and pulses over meat or fish.' },
      { q: 'Do I need protein powder?', a: 'No. These plans are built around supermarket foods, not powder.' },
    ],
    relatedSlugs: ['tesco-high-protein-meal-plan', 'high-protein-vegetarian-meal-prep', 'aldi-1500-calorie-meal-plan'],
    supportingLinks: [
      { label: 'Cheap high protein foods UK', to: '/blog/best-cheap-high-protein-foods-uk' },
      { label: 'High protein snacks UK', to: '/blog/high-protein-snacks-uk' },
      { label: 'High protein shopping list', to: '/meal-plans/high-protein-shopping-list' },
      { label: 'Protein meal prep without powder', to: '/blog/protein-meal-prep-without-powder-uk' },
    ],
  }),

  'tesco-high-protein-meal-plan': combo({
    slug: 'tesco-high-protein-meal-plan',
    h1: 'Tesco High Protein Meal Plans UK',
    description: 'Compare free Tesco high protein meal plans for low-calorie, pescatarian, vegetarian, muscle-gain and batch-cook weeks.',
    intro: 'Use Tesco high protein plans when you want a broader range of lean protein, dairy, vegetarian products and easy swaps inside one weekly shop.',
    match: { supermarkets: ['tesco'], goals: ['high-protein-low-cal', 'high-protein-vegetarian', 'muscle-gain', 'cheap-high-protein', 'body-recomp'] },
    preferredSlugs: ['tesco-high-protein-low-cal-1500', 'tesco-high-protein-low-cal-1800', 'tesco-high-protein-low-cal-veg-1500', 'tesco-high-protein-low-cal-pesc-1800', 'tesco-muscle-gain-2000', 'tesco-body-recomp-2000'],
    quickAnswer: 'Tesco is useful for high protein meal prep because it gives more choice across lean meat, fish, vegetarian proteins, skyr, cottage cheese and ready-to-eat backups.',
    whyItWorks: 'The range makes diet-specific swaps easier, especially vegetarian, pescatarian and higher-calorie training weeks.',
    shoppingFocus: 'Anchor the shop around protein first, then add measured carbohydrates and enough fruit or vegetables for volume.',
    faq: [
      { q: 'Which Tesco high protein plan is best for fat loss?', a: 'Start with the Tesco high protein low calorie 1500 or 1800 plan, depending on your calorie target.' },
      { q: 'Can I batch cook the Tesco high protein plan?', a: 'Yes. Choose a batch-cook variant if you want repeated weekday lunches and dinners.' },
    ],
    relatedSlugs: ['aldi-high-protein-meal-plan', 'tesco-1500-calorie-meal-plan', 'high-protein-vegetarian-meal-prep'],
    supportingLinks: [
      { label: 'High protein lunches for work UK', to: '/blog/high-protein-lunches-for-work-uk' },
      { label: 'High protein low calorie meals', to: '/blog/high-protein-low-calorie-meals' },
      { label: 'High protein shopping list', to: '/meal-plans/high-protein-shopping-list' },
      { label: 'Cheap protein sources UK supermarkets', to: '/blog/cheap-protein-sources-uk-supermarkets' },
    ],
  }),

  'cheap-student-meal-prep-aldi': combo({
    slug: 'cheap-student-meal-prep-aldi',
    h1: 'Cheap Student Meal Prep at Aldi',
    description: 'Free Aldi cheap student meal prep plans with budget weekly shops, simple recipes, shopping lists and printable PDFs.',
    intro: 'This page is for students who need a repeatable Aldi shop with low-cost staples and meals that do not require a complicated kitchen setup.',
    match: { supermarkets: ['aldi'], goals: ['cheap-student', 'budget-fat-loss', 'cheap-high-protein'], budgets: ['very-cheap', 'budget'] },
    preferredSlugs: ['aldi-cheap-student-1800', 'aldi-cheap-student-1500', 'aldi-cheap-student-veg-1800', 'aldi-cheap-student-vegan-1800', 'aldi-budget-fat-loss-1500', 'aldi-cheap-hp-1800'],
    quickAnswer: 'The simplest Aldi student meal prep week repeats cheap staples: oats, eggs, rice, pasta, beans, lentils, tuna, yogurt, potatoes and frozen vegetables.',
    whyItWorks: 'Student plans need low waste, low equipment and ingredients that work in more than one meal.',
    shoppingFocus: 'Buy fewer ingredients with more jobs: oats for breakfast, rice or pasta for dinners, tins for protein, and frozen veg for volume.',
    faq: [
      { q: 'Can this work without a full kitchen?', a: 'Yes. Choose low-effort plans if you rely on a microwave, hob, air fryer or shared kitchen.' },
      { q: 'Are there vegetarian student options?', a: 'Yes. Use the vegetarian or vegan Aldi student plans for meat-free weeks.' },
    ],
    relatedSlugs: ['lidl-budget-meal-prep', 'aldi-1500-calorie-meal-plan', 'work-lunch-meal-prep-uk'],
    supportingLinks: [
      { label: 'Cheap meal prep shopping list UK', to: '/blog/cheap-meal-prep-shopping-list-uk' },
      { label: 'Budget shopping list', to: '/meal-plans/budget-shopping-list' },
      { label: 'Cheap high protein foods UK', to: '/blog/best-cheap-high-protein-foods-uk' },
      { label: 'Budget meal prep containers', to: '/meal-prep-containers/budget' },
    ],
  }),

  'lidl-budget-meal-prep': combo({
    slug: 'lidl-budget-meal-prep',
    h1: 'Lidl Budget Meal Prep Plans UK',
    description: 'Compare free Lidl budget meal prep plans for weight loss, cheap student, high protein and batch-cook weeks with shopping lists.',
    intro: 'These Lidl meal prep plans focus on low-cost staples and repeatable meals that can survive a changing discount-store range.',
    match: { supermarkets: ['lidl'], goals: ['budget-fat-loss', 'cheap-student', 'cheap-high-protein', 'weight-loss', 'high-protein-low-cal'] },
    preferredSlugs: ['lidl-budget-fat-loss-1500', 'lidl-budget-fat-loss-1800', 'lidl-cheap-student-1800', 'lidl-cheap-hp-1800', 'lidl-high-protein-low-cal-1500'],
    quickAnswer: 'Lidl budget meal prep works best when the plan uses flexible staples rather than fragile one-off ingredients.',
    whyItWorks: 'Budget weeks need repeatable meals, freezer vegetables, own-brand grains, eggs, tins and simple sauces.',
    shoppingFocus: 'Build the basket around core staples first, then swap vegetables and protein based on what is available.',
    faq: [
      { q: 'Is Lidl better for batch cooking?', a: 'It can be, especially when you use simple chilli, curry, rice bowl and pasta-style meals.' },
      { q: 'Do Lidl plans include high protein options?', a: 'Yes. Use the Lidl high protein low calorie or cheap high protein plan if protein is the priority.' },
    ],
    relatedSlugs: ['cheap-student-meal-prep-aldi', 'aldi-high-protein-meal-plan', 'asda-1800-calorie-meal-plan'],
  }),

  'vegetarian-batch-cooking-meal-plan': combo({
    slug: 'vegetarian-batch-cooking-meal-plan',
    h1: 'Vegetarian Batch Cooking Meal Plans UK',
    description: 'Compare vegetarian batch cooking meal plans with repeated weekday bases, shopping lists, Sunday prep notes and printable PDFs.',
    intro: 'Vegetarian batch cooking works when the plan repeats sturdy meals such as chilli, curry, tofu bowls, lentil pasta and overnight oats rather than seven unrelated dinners.',
    match: { dietTypes: ['vegetarian'], efforts: ['batch'], goals: ['vegetarian-low-cal', 'high-protein-vegetarian', 'muscle-gain', 'weight-loss'] },
    preferredSlugs: ['aldi-veg-low-cal-batch-1800', 'tesco-veg-low-cal-1800', 'aldi-hp-veg-batch-1800', 'aldi-hp-veg-2000', 'sainsburys-hp-veg-2000'],
    quickAnswer: 'A good vegetarian batch plan repeats one lunch base and one or two dinner bases, using eggs, yogurt, tofu, beans, lentils and grains for protein.',
    whyItWorks: 'Repeated meal bases make Sunday prep honest: you cook once, portion several times, and use fresh toppings for variety.',
    shoppingFocus: 'Prioritise tofu, eggs, Greek yogurt or skyr, lentils, beans, rice, pasta, frozen vegetables and sauce ingredients.',
    faq: [
      { q: 'Can vegetarian batch cooking be high protein?', a: 'Yes. Choose high-protein vegetarian plans built around tofu, eggs, dairy, beans and lentils.' },
      { q: 'Will the meals repeat?', a: 'Yes. Batch-cook plans intentionally repeat weekday bases so the Sunday prep plan makes sense.' },
    ],
    relatedSlugs: ['high-protein-vegetarian-meal-prep', 'vegan-batch-cooking-meal-plan', 'work-lunch-meal-prep-uk'],
    supportingLinks: [
      { label: 'Batch cooking for beginners UK', to: '/blog/batch-cooking-for-beginners-uk' },
      { label: 'Meal prep tubs for batch cooking', to: '/blog/meal-prep-tubs-for-batch-cooking' },
      { label: 'High protein vegetarian plans', to: '/meal-plans/vegetarian' },
      { label: 'Glass meal prep containers', to: '/meal-prep-containers/mid-range' },
    ],
  }),

  'vegan-batch-cooking-meal-plan': combo({
    slug: 'vegan-batch-cooking-meal-plan',
    h1: 'Vegan Batch Cooking Meal Plans UK',
    description: 'Compare vegan batch cooking meal plans with Sunday prep, plant-based shopping lists, repeated weekday bases and printable PDFs.',
    intro: 'Vegan batch cooking needs meals that hold texture: tofu bowls, lentil chilli, chickpea curry, bean pasta, oats and rice bowls.',
    match: { dietTypes: ['vegan'], efforts: ['batch'], goals: ['vegan-low-cal', 'weight-loss', 'budget-fat-loss'] },
    preferredSlugs: ['aldi-vegan-low-cal-batch-1800', 'tesco-vegan-low-cal-1800', 'aldi-weight-loss-1800-vegan', 'sainsburys-weight-loss-1800-v2', 'iceland-budget-fat-loss-vegan-1800'],
    quickAnswer: 'A vegan batch plan should repeat sturdy plant-based bases such as lentil chilli, tofu rice bowls, chickpea curry and overnight oats.',
    whyItWorks: 'The protein sources are planned before the vegetables: tofu, lentils, beans, chickpeas, soy yogurt and edamame.',
    shoppingFocus: 'Buy plant protein first, then add rice, pasta, potatoes, tins, frozen vegetables, fruit and sauces.',
    faq: [
      { q: 'Can vegan batch cooking hit protein targets?', a: 'Yes, but the plan needs deliberate tofu, beans, lentils, chickpeas, soy yogurt or edamame rather than vegetables alone.' },
      { q: 'Are these plans low calorie?', a: 'Several are calorie-controlled; choose the plan card that matches your target.' },
    ],
    relatedSlugs: ['vegetarian-batch-cooking-meal-plan', 'aldi-1500-calorie-meal-plan', 'lidl-budget-meal-prep'],
  }),

  'work-lunch-meal-prep-uk': combo({
    slug: 'work-lunch-meal-prep-uk',
    h1: 'Work Lunch Meal Prep Plans UK',
    description: 'Compare free UK work lunch meal prep plans for busy professionals, high protein lunches, batch cooking and low-effort shopping lists.',
    intro: 'Work lunch meal prep should be portable, reheatable or good cold. These plans prioritise packed lunches and repeatable weekday bases.',
    match: { goals: ['busy-professional', 'low-effort', 'high-protein-low-cal'], efforts: ['batch', 'low', 'minimal', 'standard'] },
    preferredSlugs: ['tesco-busy-professional-1800', 'sainsburys-busy-professional-1800', 'asda-busy-professional-1800', 'aldi-busy-professional-1800', 'any-busy-professional-1800', 'tesco-high-protein-low-cal-1800'],
    quickAnswer: 'The best work lunch plans use meals that pack cleanly: chilli portions, rice bowls, wraps, pasta salad, tuna potatoes, tofu bowls and yogurt snacks.',
    whyItWorks: 'A work plan fails if lunch leaks, needs too much assembly or leaves you hungry by 3pm.',
    shoppingFocus: 'Choose containers, sauces and snacks alongside the meals so the packed lunch is complete.',
    faq: [
      { q: 'Which meals are best for office lunches?', a: 'Rice bowls, wraps, pasta salads, chilli, curry, soup and protein snack boxes are the easiest to pack.' },
      { q: 'Can I copy the shopping list?', a: 'Yes. Each plan has a copy-shopping-list button and a printable PDF summary.' },
    ],
    relatedSlugs: ['tesco-high-protein-meal-plan', 'vegetarian-batch-cooking-meal-plan', 'asda-1800-calorie-meal-plan'],
    supportingLinks: [
      { label: 'High protein lunches for work UK', to: '/blog/high-protein-lunches-for-work-uk' },
      { label: 'Meal prep boxes for work lunches', to: '/blog/meal-prep-boxes-for-work-lunches' },
      { label: 'Low effort meal plans', to: '/meal-plans/low-effort' },
      { label: 'Leakproof meal prep containers UK', to: '/blog/leakproof-meal-prep-containers-uk' },
    ],
  }),

  'tesco-meal-prep-for-weight-loss': combo({
    slug: 'tesco-meal-prep-for-weight-loss',
    h1: 'Tesco Meal Prep for Weight Loss',
    description: 'Compare Tesco weight loss meal prep plans with 1500 and 1800 calorie options, batch cooking, shopping lists and printable PDFs.',
    intro: 'Tesco weight-loss meal prep is useful when you want calorie structure, enough protein and flexible swaps inside one familiar supermarket shop.',
    match: { supermarkets: ['tesco'], goals: ['weight-loss', 'high-protein-low-cal', 'budget-fat-loss', 'cutting'], calories: [1400, 1500, 1600, 1800] },
    preferredSlugs: ['tesco-weight-loss-1500', 'tesco-weight-loss-1800', 'tesco-weight-loss-1500-v2', 'tesco-high-protein-low-cal-1500', 'tesco-cutting-1400'],
    quickAnswer: 'Start with a Tesco weight loss plan if you want a calorie-controlled week with enough product choice to make swaps easy.',
    whyItWorks: 'Tesco gives strong range flexibility for lean protein, vegetarian swaps, dairy, tins, freezer veg and ready-to-eat backups.',
    shoppingFocus: 'Use one planned snack and one ready-to-eat backup so a busy day does not turn into takeaway.',
    faq: [
      { q: 'Which Tesco plan is best for weight loss?', a: 'Start with the 1500 or 1800 calorie weight loss plan, then switch to high protein if hunger is the main issue.' },
      { q: 'Do I need to meal prep every meal?', a: 'No. Prep the meals most likely to fail first, usually work lunches and busy dinners.' },
    ],
    relatedSlugs: ['tesco-1500-calorie-meal-plan', 'tesco-high-protein-meal-plan', 'work-lunch-meal-prep-uk'],
  }),

  'high-protein-vegetarian-meal-prep': combo({
    slug: 'high-protein-vegetarian-meal-prep',
    h1: 'High Protein Vegetarian Meal Prep UK',
    description: 'Compare free high protein vegetarian meal prep plans using eggs, dairy, tofu, beans and lentils, with shopping lists and PDFs.',
    intro: 'High protein vegetarian meal prep needs planned protein at every meal, not just extra vegetables. These plans prioritise tofu, eggs, dairy, beans, lentils and repeatable lunch bases.',
    match: { dietTypes: ['vegetarian'], goals: ['high-protein-vegetarian', 'high-protein-low-cal', 'vegetarian-low-cal', 'muscle-gain'] },
    preferredSlugs: ['aldi-hp-veg-1800', 'tesco-hp-veg-1800', 'asda-hp-veg-1800', 'lidl-hp-veg-1800', 'aldi-hp-veg-batch-1800', 'tesco-high-protein-low-cal-veg-1500'],
    quickAnswer: 'The easiest high protein vegetarian meal prep uses Greek yogurt or skyr, eggs, cottage cheese, tofu, beans, lentils, chickpeas and measured grains.',
    whyItWorks: 'Vegetarian plans need protein anchors before calories are cut; otherwise meals become bulky but not filling.',
    shoppingFocus: 'Pick two dairy or egg proteins and two plant proteins, then build lunches and dinners around them.',
    faq: [
      { q: 'Can vegetarian meal prep be high protein without powder?', a: 'Yes. Eggs, yogurt, cottage cheese, tofu, beans, lentils and chickpeas can carry the week.' },
      { q: 'Are there Aldi and Tesco options?', a: 'Yes. The page links exact Aldi, Tesco, Asda and Lidl high-protein vegetarian plans.' },
    ],
    relatedSlugs: ['vegetarian-batch-cooking-meal-plan', 'aldi-high-protein-meal-plan', 'tesco-high-protein-meal-plan'],
    supportingLinks: [
      { label: 'Protein meal prep without powder UK', to: '/blog/protein-meal-prep-without-powder-uk' },
      { label: 'High protein snacks UK', to: '/blog/high-protein-snacks-uk' },
      { label: 'Vegetarian meal plans UK', to: '/meal-plans/vegetarian' },
      { label: 'High protein shopping list', to: '/meal-plans/high-protein-shopping-list' },
    ],
  }),
};

export const COMBO_LANDING_SLUGS = Object.keys(COMBO_LANDING_PAGES);

export function getSupermarketEvidence(supermarket) {
  return SUPERMARKET_EVIDENCE[supermarket] || SUPERMARKET_EVIDENCE.any;
}

export function filterPlansForCombo(plans, comboPage) {
  const matches = plans.filter(plan => planMatchesCombo(plan, comboPage.match));
  return sortPlansForCombo(matches, comboPage).slice(0, 24);
}

function planMatchesCombo(plan, match = {}) {
  return (
    matchesAny(plan.supermarket, match.supermarkets) &&
    matchesAny(plan.goal, match.goals) &&
    matchesAny(plan.calories, match.calories) &&
    matchesAny(plan.dietType, match.dietTypes) &&
    matchesAny(plan.effort, match.efforts) &&
    matchesAny(plan.budget, match.budgets)
  );
}

function sortPlansForCombo(plans, comboPage) {
  const preferred = new Map((comboPage.preferredSlugs || []).map((slug, index) => [slug, index]));
  return [...plans].sort((a, b) => scorePlanForCombo(b, preferred) - scorePlanForCombo(a, preferred));
}

function scorePlanForCombo(plan, preferred) {
  let score = 0;
  if (preferred.has(plan.slug)) score += 1000 - preferred.get(plan.slug);
  if (plan.effort === 'standard') score += 20;
  if (plan.effort === 'batch') score += 16;
  if (plan.dietType === 'standard') score += 8;
  if (plan.calories === 1500 || plan.calories === 1800) score += 5;
  return score;
}

function matchesAny(value, expected) {
  if (!expected?.length) return true;
  return expected.includes(value);
}

export function comboStatLabels(comboPage) {
  const match = comboPage.match || {};
  const stats = [];
  if (match.supermarkets?.length === 1) {
    stats.push(getSupermarketEvidence(match.supermarkets[0]).label);
  }
  if (match.calories?.length === 1) {
    stats.push(`${Number(match.calories[0]).toLocaleString('en-GB')} kcal focus`);
  } else if (match.calories?.length > 1) {
    stats.push('Calorie options');
  }
  if (match.goals?.length === 1) {
    stats.push(GOAL_LABEL[match.goals[0]] || match.goals[0]);
  } else if (match.goals?.length > 1) {
    stats.push('Multiple goals');
  }
  if (match.dietTypes?.length === 1) {
    stats.push(DIET_LABEL[match.dietTypes[0]] || match.dietTypes[0]);
  }
  if (match.efforts?.includes('batch')) stats.push('Batch-cook options');
  if (!stats.length) stats.push('UK supermarket plans');
  return stats.slice(0, 4);
}

export function comboMatchSummary(comboPage) {
  const match = comboPage.match || {};
  const parts = [];
  if (match.supermarkets?.length) {
    parts.push(match.supermarkets.map(store => getSupermarketEvidence(store).label).join(', '));
  }
  if (match.calories?.length) {
    parts.push(match.calories.map(kcal => `${Number(kcal).toLocaleString('en-GB')} kcal`).join(', '));
  }
  if (match.goals?.length) {
    parts.push(match.goals.map(goal => GOAL_LABEL[goal] || goal).join(', '));
  }
  if (match.dietTypes?.length) {
    parts.push(match.dietTypes.map(diet => DIET_LABEL[diet] || diet).join(', '));
  }
  if (match.efforts?.length) {
    parts.push(match.efforts.map(effort => EFFORT_LABEL[effort] || effort).join(', '));
  }
  return parts.join(' + ');
}
