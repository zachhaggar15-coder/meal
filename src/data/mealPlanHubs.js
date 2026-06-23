const REVIEWED_DATE = '18 June 2026';

const COMMON_NUTRITION_SOURCES = [
  {
    label: 'NHS Eatwell Guide',
    url: 'https://www.nhs.uk/live-well/eat-well/food-guidelines-and-food-labels/the-eatwell-guide/',
  },
  {
    label: 'NHS healthy weight guidance',
    url: 'https://www.nhs.uk/live-well/healthy-weight/',
  },
];

const GUIDE_LINKS = {
  lowCalorieFoods: { label: 'Low calorie foods UK', to: '/blog/best-low-calorie-foods-uk' },
  lowCalorieReadyMeals: { label: 'Low calorie ready meals UK', to: '/blog/best-low-calorie-ready-meals-uk' },
  highProteinSnacks: { label: 'High protein snacks UK', to: '/blog/high-protein-snacks-uk' },
  cheapProtein: { label: 'Cheap protein UK', to: '/blog/best-cheap-high-protein-foods-uk' },
  proteinPorridge: { label: 'Protein porridge UK', to: '/blog/protein-porridge-and-yogurt-breakfasts-uk' },
  mealPrepBeginners: { label: 'Meal prep for beginners UK', to: '/blog/meal-prep-for-beginners-uk' },
  shoppingList: { label: 'Meal plans with shopping lists', to: '/meal-plans/meal-plans-with-shopping-list' },
  printable: { label: 'Printable meal plan PDFs', to: '/meal-plans/printable-meal-plans' },
  containers: { label: 'Best meal prep containers UK', to: '/meal-prep-containers' },
};

function createCalorieHub({
  calories,
  matchCalories = [calories],
  goal = 'calorie-controlled plan hub',
  bestFor = 'Calorie target planning',
  relatedSlugs = ['free-online-diet-plans-uk', 'weight-loss', 'high-protein', 'meal-plans-with-shopping-list'],
  supportingGuides = [GUIDE_LINKS.lowCalorieFoods, GUIDE_LINKS.highProteinSnacks, GUIDE_LINKS.lowCalorieReadyMeals, GUIDE_LINKS.printable],
}) {
  const calorieText = calories.toLocaleString('en-GB');
  const isLow = calories <= 1600;
  const isHigh = calories >= 2500;
  return {
    slug: `${calories}-calorie`,
    path: `/meal-plans/${calories}-calorie`,
    title: `${calorieText} Calorie Meal Plans UK - Printable PDFs + Shopping Lists`,
    description:
      `Browse free ${calorieText} calorie meal plans for UK supermarkets, with 7-day menus, macros, recipes, printable PDFs and shopping lists.`,
    h1: `${calorieText} Calorie Meal Plans UK`,
    kicker: goal,
    intro:
      `Use these ${calorieText} calorie meal plans when you want a clear UK supermarket week with recipes, macros, PDF export and a shopping list. The plans favour realistic meals, visible protein and portions you can actually shop for.`,
    match: { calories: matchCalories },
    stats: [`${calorieText} kcal focus`, 'Printable PDF plans', 'Weekly shopping lists'],
    reviewed: REVIEWED_DATE,
    sources: COMMON_NUTRITION_SOURCES,
    sections: [
      {
        h2: `Quick answer: who suits ${calorieText} calories?`,
        paragraphs: [
          `${calorieText} calories can be useful when it matches your body size, activity, appetite and goal. It is not automatically better because it is lower or higher; the right plan is the one you can repeat while still eating balanced meals.`,
          isLow
            ? 'For lower calorie targets, prioritise lean protein, vegetables, fruit, potatoes, oats, beans, lentils and measured fats so the day still feels like proper food.'
            : isHigh
              ? 'For higher calorie targets, use extra snacks, bigger carbohydrate portions and calorie-dense but useful foods such as oats, rice, pasta, olive oil, nuts, milk and yogurt.'
              : 'For moderate calorie targets, balance protein, carbohydrates, vegetables and a snack rather than pushing all calories into one large evening meal.',
        ],
        table: {
          headers: ['Need', 'Best fit', 'Watch-out'],
          rows: [
            ['Weight loss', isLow ? `${calorieText} calorie low-calorie plans` : 'Compare lower calorie plans first', 'Keep protein and fibre high enough for hunger control'],
            ['Training or active job', isHigh ? `${calorieText} calorie muscle gain or endurance plans` : 'Consider 2000-2500 kcal if energy drops', 'Do not under-fuel repeated hard training'],
            ['Vegetarian or vegan', 'Use matching diet filters from the plan cards', 'Plan protein sources before cutting portions'],
            ['Printing and shopping', 'Open any matching plan and export the PDF', 'Check cupboard staples before buying the full list'],
          ],
        },
      },
      {
        h2: `How to choose a ${calorieText} calorie plan`,
        paragraphs: [
          'Start with goal, diet type and supermarket. Then choose effort level: standard prep for variety, batch cooking for weekday speed, or low effort when you need more ready-to-eat ingredients.',
          'If the target feels too strict or too much food, move to the nearest calorie hub and compare the meal structure before changing the whole plan.',
        ],
      },
    ],
    supportingGuides,
    faq: [
      {
        q: `Do ${calorieText} calorie plans include shopping lists?`,
        a: 'Yes. Each matching plan includes recipes, macros, a grouped weekly shopping list and PDF export.',
      },
      {
        q: `Is ${calorieText} calories right for everyone?`,
        a: 'No. Calorie needs vary by body size, activity, health status and goals. These pages are general information only and are not medical advice.',
      },
    ],
    relatedSlugs,
  };
}

function createSupermarketHub({ key, label, budgetNote, relatedSlugs = ['weight-loss', '1500-calorie', 'high-protein', 'meal-plans-with-shopping-list'] }) {
  return {
    slug: key,
    path: `/meal-plans/${key}`,
    title: `${label} Meal Plans UK - Free Weekly Plans + Shopping Lists`,
    description:
      `Browse free ${label} meal plans for UK weight loss, high protein, vegetarian, vegan, muscle gain and budget goals, with PDFs and shopping lists.`,
    h1: `${label} Meal Plans UK`,
    kicker: 'Supermarket plan hub',
    intro:
      `${label} meal plans are useful when you want the weekly shop to match the store you actually use. These plans turn UK supermarket staples into 7-day menus with macros, recipes, PDF export and a grouped shopping list.`,
    match: { supermarkets: [key] },
    stats: [`${label} plans`, 'Supermarket shopping lists', 'PDF export'],
    reviewed: REVIEWED_DATE,
    sources: COMMON_NUTRITION_SOURCES,
    sections: [
      {
        h2: `Quick answer: when to choose ${label}`,
        paragraphs: [
          `Choose ${label} if you shop there most weeks or want ingredients that are easy to swap within that store. ${budgetNote}`,
          'The strongest starting point is to choose your goal first, then compare the top matching plans by calories, diet type, budget and effort.',
        ],
        table: {
          headers: ['Goal', 'Best starting plan', 'Why'],
          rows: [
            ['Weight loss', `${label} weight loss or high-protein low-calorie`, 'Keeps calories structured while using familiar ingredients'],
            ['Budget control', `${label} budget fat loss or cheap student`, 'Uses repeatable staples and fewer niche products'],
            ['High protein', `${label} high protein or muscle gain`, 'Builds each meal around a clear protein source'],
            ['Meat-free', `${label} vegetarian, vegan or pescatarian`, 'Filters plans by diet type before shopping'],
          ],
        },
      },
      {
        h2: `${label} shopping-list tips`,
        paragraphs: [
          'Check cupboard staples before buying the whole list, especially rice, oats, pasta, spices, oil, sauces and frozen vegetables.',
          'If a plan ingredient is unavailable, swap within the same role: chicken for turkey, skyr for Greek yogurt, tofu for beans, rice for potatoes, or frozen vegetables for fresh.',
        ],
      },
    ],
    supportingGuides: [GUIDE_LINKS.mealPrepBeginners, GUIDE_LINKS.lowCalorieFoods, GUIDE_LINKS.highProteinSnacks, GUIDE_LINKS.shoppingList, GUIDE_LINKS.containers],
    faq: [
      {
        q: `Can I use a ${label} plan at another supermarket?`,
        a: 'Yes. Ingredients are common UK supermarket foods, but exact products and prices may differ.',
      },
      {
        q: `Do ${label} plans include printable shopping lists?`,
        a: 'Yes. Open any plan and use the PDF export section to print the weekly menu and shopping list.',
      },
    ],
    relatedSlugs,
  };
}

function createGoalHub({ key, titleLabel, h1Label = titleLabel, goals = [key], diets, intro, bestFor, relatedSlugs = ['free-online-diet-plans-uk', '1500-calorie', 'high-protein', 'meal-plans-with-shopping-list'] }) {
  return {
    slug: key,
    path: `/meal-plans/${key}`,
    title: `${titleLabel} Meal Plans UK - Free PDFs + Shopping Lists`,
    description:
      `Browse free ${titleLabel.toLowerCase()} meal plans for UK supermarkets, with 7-day menus, macros, recipes, printable PDFs and shopping lists.`,
    h1: `${h1Label} Meal Plans UK`,
    kicker: 'Goal plan hub',
    intro,
    match: diets ? { diets } : { goals },
    stats: [bestFor, 'UK supermarket plans', 'PDF and shopping list'],
    reviewed: REVIEWED_DATE,
    sources: COMMON_NUTRITION_SOURCES,
    sections: [
      {
        h2: `Quick answer: who should start here?`,
        paragraphs: [
          `Start here if ${titleLabel.toLowerCase()} is the main reason you are planning meals. The plan cards let you compare supermarket, calories, diet type, price estimate and cooking effort before opening a full week.`,
        ],
        table: {
          headers: ['Need', 'Best plan style', 'Why'],
          rows: [
            ['Simple week', 'Standard effort plans', 'More variety while staying realistic'],
            ['Busy schedule', 'Batch or low-effort plans', 'Fewer weekday decisions'],
            ['Budget control', 'Very cheap or budget plans', 'Keeps ingredients repeatable'],
            ['Higher protein', 'Protein-focused variants', 'Makes each meal more filling'],
          ],
        },
      },
      {
        h2: `How to use these plans`,
        paragraphs: [
          'Pick the supermarket and calorie target first, then use the full plan page to print the PDF, copy the shopping list or edit any meal.',
          'If the first plan is close but not perfect, use the meal edit controls rather than starting from scratch.',
        ],
      },
    ],
    supportingGuides: [GUIDE_LINKS.mealPrepBeginners, GUIDE_LINKS.lowCalorieFoods, GUIDE_LINKS.highProteinSnacks, GUIDE_LINKS.shoppingList],
    faq: [
      {
        q: `Do ${titleLabel.toLowerCase()} plans include shopping lists?`,
        a: 'Yes. Every plan includes a grouped shopping list and a printable PDF summary.',
      },
      {
        q: `Can I filter these plans by supermarket?`,
        a: 'Yes. Use the browse filters or choose a plan card that matches your preferred supermarket.',
      },
    ],
    relatedSlugs,
  };
}

function createShoppingListHub({ key, titleLabel, match, intro, relatedSlugs = ['printable-meal-plans', 'weight-loss', 'high-protein', 'generic-uk-supermarket'] }) {
  return {
    slug: key,
    path: `/meal-plans/${key}`,
    title: `${titleLabel} UK - Free Meal Plans + Printable Lists`,
    description:
      `Browse free ${titleLabel.toLowerCase()} for UK supermarkets, with 7-day meal plans, recipes, macros, PDF export and grouped weekly lists.`,
    h1: `${titleLabel} UK`,
    kicker: 'Shopping-list hub',
    intro,
    match,
    stats: ['Grouped shopping lists', 'Printable PDFs', 'UK supermarket ingredients'],
    reviewed: REVIEWED_DATE,
    sources: COMMON_NUTRITION_SOURCES,
    sections: [
      {
        h2: 'Quick answer: what should the list include?',
        paragraphs: [
          'A useful shopping list groups protein, carbohydrates, fruit and vegetables, dairy or alternatives, tins, frozen food, sauces and extras. That makes the shop faster and reduces missed ingredients.',
        ],
        table: {
          headers: ['List section', 'Examples', 'Why it matters'],
          rows: [
            ['Protein', 'Chicken, tuna, eggs, tofu, lentils, yogurt, fish', 'Anchors meals and helps satiety'],
            ['Carbs', 'Oats, rice, pasta, potatoes, wraps, bread', 'Keeps meals realistic and repeatable'],
            ['Fruit and veg', 'Frozen mixed veg, salad, berries, apples, broccoli', 'Adds volume, fibre and micronutrients'],
            ['Extras', 'Sauces, spices, oil spray, stock cubes', 'Stops simple meals becoming bland'],
          ],
        },
      },
      {
        h2: 'How to use the printable list',
        paragraphs: [
          'Choose a plan, export the PDF, then remove cupboard staples before shopping. If you shop at a named supermarket, use a named-store plan; if you shop across stores, use Generic UK supermarket plans.',
          'For cost control, repeat breakfasts and batch-cook lunches before adding high-variety dinners.',
        ],
      },
    ],
    supportingGuides: [GUIDE_LINKS.lowCalorieFoods, GUIDE_LINKS.highProteinSnacks, GUIDE_LINKS.mealPrepBeginners, GUIDE_LINKS.containers],
    faq: [
      {
        q: 'Can I print the shopping list?',
        a: 'Yes. Use the plan page PDF export to print the full weekly menu and grouped shopping list.',
      },
      {
        q: 'Can I edit meals and update the list?',
        a: 'Yes. Plan pages support meal edits and rebuild the shopping list around the updated meals.',
      },
    ],
    relatedSlugs,
  };
}

const CALORIE_AUTHORITY_HUBS = {
  '1200-calorie': createCalorieHub({
    calories: 1200,
    matchCalories: [1400, 1500],
    goal: 'Very low calorie reference hub',
    bestFor: 'Lower calorie alternatives',
    supportingGuides: [GUIDE_LINKS.lowCalorieFoods, GUIDE_LINKS.lowCalorieReadyMeals, GUIDE_LINKS.highProteinSnacks, GUIDE_LINKS.printable],
  }),
  '1400-calorie': createCalorieHub({ calories: 1400, goal: 'Low calorie plan hub', bestFor: 'Smaller deficits' }),
  '1600-calorie': createCalorieHub({ calories: 1600, goal: 'Low calorie plan hub', bestFor: 'Steady fat loss' }),
  '1800-calorie': createCalorieHub({ calories: 1800, goal: 'Moderate calorie plan hub', bestFor: 'Sustainable weight loss' }),
  '2000-calorie': createCalorieHub({ calories: 2000, goal: 'Balanced calorie plan hub', bestFor: 'Maintenance or active fat loss' }),
  '2500-calorie': createCalorieHub({
    calories: 2500,
    goal: 'Higher calorie plan hub',
    bestFor: 'Muscle gain and active weeks',
    relatedSlugs: ['muscle-gain', '3000-calorie', 'high-protein', 'meal-plans-with-shopping-list'],
    supportingGuides: [GUIDE_LINKS.highProteinSnacks, GUIDE_LINKS.cheapProtein, GUIDE_LINKS.mealPrepBeginners, GUIDE_LINKS.printable],
  }),
};

const SUPERMARKET_AUTHORITY_HUBS = {
  tesco: createSupermarketHub({
    key: 'tesco',
    label: 'Tesco',
    budgetNote: 'Tesco is strongest when you want broad choice, online availability, Clubcard offers and more specialist high-protein or vegetarian products.',
    relatedSlugs: ['tesco-weight-loss', 'weight-loss', '1500-calorie', 'high-protein'],
  }),
  lidl: createSupermarketHub({
    key: 'lidl',
    label: 'Lidl',
    budgetNote: 'Lidl is strongest for simple budget staples, dairy, frozen veg, oats, rice, pasta and repeatable weekly shops.',
  }),
  asda: createSupermarketHub({
    key: 'asda',
    label: 'Asda',
    budgetNote: 'Asda is useful for broad family-friendly ranges, budget staples, frozen options and high-protein convenience foods.',
  }),
  sainsburys: createSupermarketHub({
    key: 'sainsburys',
    label: "Sainsbury's",
    budgetNote: "Sainsbury's is useful when you want a wider premium range, convenient prepared ingredients and good vegetarian or specialist options.",
  }),
  morrisons: createSupermarketHub({
    key: 'morrisons',
    label: 'Morrisons',
    budgetNote: 'Morrisons is useful for fresh counters, straightforward staples, family portions and practical cooked-at-home meals.',
  }),
  iceland: createSupermarketHub({
    key: 'iceland',
    label: 'Iceland',
    budgetNote: 'Iceland is strongest for frozen-friendly meal prep, low-effort plans, freezer portions and predictable budget shops.',
  }),
};

const GOAL_AUTHORITY_HUBS = {
  vegan: createGoalHub({
    key: 'vegan',
    titleLabel: 'Vegan',
    diets: ['vegan'],
    intro: 'Vegan meal plans work best when protein is planned first. These UK plans use tofu, beans, lentils, chickpeas, soy yogurt, meat-free pieces, grains, vegetables and practical supermarket staples.',
    bestFor: 'Plant-based plans',
  }),
  pescatarian: createGoalHub({
    key: 'pescatarian',
    titleLabel: 'Pescatarian',
    diets: ['pescatarian'],
    intro: 'Pescatarian meal plans are useful when you want fish, eggs, dairy, beans and plant foods without meat. These plans use familiar UK supermarket ingredients and balanced weekly shopping lists.',
    bestFor: 'Fish and meat-free plans',
  }),
  menopause: createGoalHub({
    key: 'menopause',
    titleLabel: 'Menopause Diet',
    h1Label: 'Menopause Nutrition',
    goals: ['menopause-nutrition'],
    intro: 'Menopause nutrition meal plans focus on protein, fibre, calcium-rich foods, healthy fats and practical meals. They are general planning information, not medical advice.',
    bestFor: 'Menopause nutrition',
  }),
  endurance: createGoalHub({
    key: 'endurance',
    titleLabel: 'Endurance Nutrition',
    h1Label: 'Endurance and Running',
    goals: ['endurance-athlete'],
    intro: 'Endurance meal plans are designed for runners, cyclists and active weeks where carbohydrate, protein and recovery meals need to be planned rather than improvised.',
    bestFor: 'Running and endurance',
    relatedSlugs: ['2500-calorie', '3000-calorie', 'high-protein', 'meal-plans-with-shopping-list'],
  }),
  'cheap-student': createGoalHub({
    key: 'cheap-student',
    titleLabel: 'Cheap Student',
    goals: ['cheap-student'],
    intro: 'Cheap student meal plans focus on low-cost UK supermarket staples, repeatable breakfasts, simple lunches and dinners that do not need a full kitchen of equipment.',
    bestFor: 'Student budget plans',
  }),
  'budget-bodybuilding': createGoalHub({
    key: 'budget-bodybuilding',
    titleLabel: 'Budget Bodybuilding',
    goals: ['budget-bodybuilding'],
    intro: 'Budget bodybuilding meal plans aim for higher protein and enough calories without turning the weekly shop into premium products. They use eggs, oats, rice, pasta, chicken, tuna, beans, yogurt and freezer staples.',
    bestFor: 'Budget muscle gain',
    relatedSlugs: ['muscle-gain', '2500-calorie', '3000-calorie', 'high-protein'],
  }),
};

const SHOPPING_LIST_AUTHORITY_HUBS = {
  'low-calorie-shopping-list': createShoppingListHub({
    key: 'low-calorie-shopping-list',
    titleLabel: 'Low Calorie Shopping List',
    match: { goals: ['weight-loss', 'budget-fat-loss', 'high-protein-low-cal', 'vegetarian-low-cal', 'vegan-low-cal', 'cutting'], calories: [1400, 1500, 1600, 1800] },
    intro: 'A low calorie shopping list should make the week easier, not smaller. These plans focus on lean protein, high-volume vegetables, fruit, filling carbohydrates and simple sauces.',
    relatedSlugs: ['1500-calorie', 'weight-loss', 'high-protein', 'meal-plans-with-shopping-list'],
  }),
  'high-protein-shopping-list': createShoppingListHub({
    key: 'high-protein-shopping-list',
    titleLabel: 'High Protein Shopping List',
    match: { goals: ['high-protein-low-cal', 'cheap-high-protein', 'high-protein-vegetarian', 'budget-bodybuilding', 'muscle-gain', 'body-recomp'] },
    intro: 'A high protein shopping list works best when every meal has a clear protein anchor. These plans use UK supermarket staples such as eggs, yogurt, chicken, tuna, tofu, beans, lentils and fish.',
    relatedSlugs: ['high-protein', 'muscle-gain', '2500-calorie', 'meal-plans-with-shopping-list'],
  }),
  'budget-shopping-list': createShoppingListHub({
    key: 'budget-shopping-list',
    titleLabel: 'Budget Meal Prep Shopping List',
    match: { budgets: ['very-cheap', 'budget'], goals: ['budget-fat-loss', 'cheap-student', 'cheap-high-protein', 'budget-bodybuilding', 'weight-loss'] },
    intro: 'A budget meal prep shopping list should repeat useful staples while keeping enough variety to avoid giving up by Wednesday. These plans prioritise cheap protein, filling carbs, frozen veg and simple batch cooks.',
    relatedSlugs: ['cheap-student', 'budget-bodybuilding', 'aldi', 'lidl'],
  }),
};

export const MEAL_PLAN_HUBS = {
  ...CALORIE_AUTHORITY_HUBS,
  ...SUPERMARKET_AUTHORITY_HUBS,
  ...GOAL_AUTHORITY_HUBS,
  ...SHOPPING_LIST_AUTHORITY_HUBS,
  '1500-calorie': {
    slug: '1500-calorie',
    path: '/meal-plans/1500-calorie',
    title: '1500 Calorie Meal Plan UK - Printable 7-Day PDF + Shopping List',
    description:
      'Free printable 1500 calorie meal plans for UK weight loss, with simple 7-day menus, high-protein options, vegetarian plans, PDFs and shopping lists.',
    h1: '1500 Calorie Meal Plan UK',
    kicker: 'Low calorie plan hub',
    intro:
      'A 1500 calorie meal plan works best when it is simple, filling and easy to shop for in UK supermarkets. Use this hub to compare printable 7-day plans, high-protein options, vegetarian and vegan weeks, PDF exports and shopping lists without building every meal from scratch.',
    match: { calories: [1500, 1400, 1600], goals: ['weight-loss', 'budget-fat-loss', 'high-protein-low-cal', 'vegetarian-low-cal', 'vegan-low-cal', 'cutting'] },
    stats: ['1500 kcal/day options', 'Printable PDF plans', 'Weekly shopping lists'],
    reviewed: '17 June 2026',
    sections: [
      {
        h2: 'Quick answer: what does 1500 calories look like?',
        paragraphs: [
          'For most people, a realistic 1500 calorie day is breakfast, lunch, dinner and one or two snacks rather than tiny meals. The exact split can change, but the best plans keep protein visible at every meal and use vegetables, fruit, beans, potatoes, oats, rice or wholemeal bread for volume.',
          'A simple UK supermarket day might look like Greek yogurt with berries and oats, a chicken or tofu wrap with salad, turkey chilli with rice, and a snack such as fruit with cottage cheese or skyr.',
        ],
        table: {
          headers: ['Meal', 'UK example', 'Calories', 'Protein'],
          rows: [
            ['Breakfast', '0% Greek yogurt, berries and oats', '350-400 kcal', '25-35g'],
            ['Lunch', 'Chicken, tuna, egg or tofu wrap with salad', '400-450 kcal', '30-45g'],
            ['Dinner', 'Turkey chilli, lentil curry or salmon with potatoes', '500-600 kcal', '35-50g'],
            ['Snacks', 'Fruit, skyr, cottage cheese, boiled eggs or soup', '150-250 kcal', '10-25g'],
          ],
        },
      },
      {
        h2: 'How to choose a 1500 calorie meal plan',
        paragraphs: [
          'Start with diet type and supermarket before choosing exact meals. A realistic 1500 calorie plan should still include breakfast, lunch, dinner and enough protein to keep the day satisfying.',
          'If you are hungry on 1500 calories, choose high-fibre or high-protein plans first. If your week is busy, use batch-cook plans so lunch and dinner are easier to repeat.',
        ],
      },
      {
        h2: 'Best 1500 calorie plan types by search intent',
        paragraphs: [
          'Weight loss and budget fat loss plans are the safest starting points. High-protein low-calorie plans suit gym users, while vegetarian and vegan low-calorie plans are better when you want plant-forward meals without building the week yourself.',
        ],
        table: {
          headers: ['Intent', 'Best starting point', 'Why it works'],
          rows: [
            ['Simple 1500 calorie meal plan', 'Standard weight loss plans', 'Familiar UK meals, clear portions and no unusual products'],
            ['High protein 1500 calorie plan', 'High protein low calorie plans', 'More chicken, tuna, eggs, yogurt, tofu, beans and lean mince'],
            ['Vegetarian 1500 calorie plan', 'Vegetarian low calorie plans', 'Uses eggs, dairy, tofu, lentils, beans and meat-free protein'],
            ['Printable 1500 calorie PDF', 'Any matching plan page', 'Every plan includes a weekly PDF summary and shopping list'],
          ],
        },
      },
      {
        h2: 'Shopping for a 1500 calorie plan in the UK',
        paragraphs: [
          'The most useful basket is not complicated: oats, 0% Greek yogurt or skyr, eggs, chicken, tuna, tofu or beans, frozen vegetables, salad, potatoes, rice, wraps, fruit, cottage cheese and a few low-calorie sauces.',
          'Aldi and Lidl are strong for basic low-cost weeks. Tesco, Asda and Sainsbury\'s are helpful when you want more specific vegetarian, high-protein, ready-to-eat or free-from options. Generic UK supermarket plans use common ingredients and average UK supermarket pricing when you do not want to pick one shop.',
        ],
      },
    ],
    faq: [
      {
        q: 'Do these 1500 calorie meal plans include shopping lists?',
        a: 'Yes. Every plan includes a weekly shopping list, estimated macros and an export/print PDF option.',
      },
      {
        q: 'Are 1500 calorie meal plans suitable for everyone?',
        a: 'No. Calorie needs vary by body size, activity, health status and goals. These plans are general information only and are not medical advice.',
      },
      {
        q: 'Can I print a 1500 calorie meal plan as a PDF?',
        a: 'Yes. Open any matching plan and use the export or print PDF section to save the full week, recipes, calories, macros and shopping list.',
      },
    ],
    relatedSlugs: ['free-online-diet-plans-uk', 'weight-loss', 'high-protein', 'meal-plans-with-shopping-list', 'printable-meal-plans'],
  },
  'free-online-diet-plans-uk': {
    slug: 'free-online-diet-plans-uk',
    path: '/meal-plans/free-online-diet-plans-uk',
    title: 'Free Online Diet Plans UK - 1000 Printable Meal Plans',
    description:
      'Browse free online diet plans for UK weight loss, high protein, vegetarian, muscle gain and budget goals, with PDFs, shopping lists and supermarket filters.',
    h1: 'Free Online Diet Plans UK',
    kicker: 'Free plan hub',
    intro:
      'Use this page when you want a free UK diet plan without signing up, paying for an app or starting from a blank spreadsheet. The plan library covers calorie targets, supermarkets, diet types, macros, PDFs and shopping lists so you can move from search to a usable week of food quickly.',
    match: {
      goals: ['weight-loss', 'budget-fat-loss', 'high-protein-low-cal', 'muscle-gain', 'cheap-high-protein', 'vegetarian-low-cal', 'vegan-low-cal', 'maintenance'],
    },
    stats: ['Free online plans', 'PDF and shopping list', 'UK supermarket filters'],
    reviewed: '17 June 2026',
    sections: [
      {
        h2: 'Quick answer: what is included?',
        paragraphs: [
          'Each plan page includes a 7-day menu, calorie and macro estimates, simple recipes, a grouped shopping list and an export section for printing or saving as a PDF. You can browse by goal, supermarket, diet type, calorie target and budget.',
          'The best starting point is the quiz if you want a match, or the browse page if you already know your calories, supermarket or diet type.',
        ],
        table: {
          headers: ['Search intent', 'Best page to use', 'What you get'],
          rows: [
            ['Diet plan UK free', 'This hub or the quiz', 'A no-sign-up route into matched 7-day plans'],
            ['Free nutrition plan', 'Browse filters', 'Calories, macros, recipes and shopping list'],
            ['Free online meal plan', 'Quiz results', 'Top matched plans for goal, diet and supermarket'],
            ['Printable diet plan', 'Any plan page', 'PDF summary with full weekly shopping list'],
          ],
        },
      },
      {
        h2: 'Choose by goal first',
        paragraphs: [
          'Weight loss plans focus on calorie control, protein, fibre and realistic portions. High-protein plans suit gym users, body recomposition and people who struggle with hunger. Muscle gain plans use higher calorie targets such as 2500, 3000 and 3500 calories with bigger snacks and more training-friendly carbohydrate.',
          'Vegetarian, vegan and pescatarian options keep the same structure but change the protein sources, using UK supermarket staples such as eggs, yogurt, tofu, beans, lentils, fish and meat-free alternatives.',
        ],
      },
      {
        h2: 'Choose by supermarket or use generic pricing',
        paragraphs: [
          'Named supermarket plans are useful if you shop mostly at Aldi, Lidl, Tesco, Asda, Sainsbury\'s, Morrisons or Iceland. Generic UK supermarket plans are better if you switch between shops or want average-price assumptions rather than one retailer.',
          'The shopping lists use common ingredients rather than niche diet products. That makes the plans easier to buy, cook and repeat in normal UK kitchens.',
        ],
      },
    ],
    faq: [
      {
        q: 'Are the diet plans really free?',
        a: 'Yes. The plan pages, PDFs, shopping lists and browse filters are free to use without an account.',
      },
      {
        q: 'Can I get a free diet plan with a shopping list?',
        a: 'Yes. Every plan includes a grouped weekly shopping list and the PDF export summarises the meals, recipes, calories, macros and shopping list.',
      },
      {
        q: 'Do free online diet plans replace medical advice?',
        a: 'No. They are general meal-planning information only. Speak to a qualified professional if you have medical needs, a history of disordered eating or a specialist nutrition requirement.',
      },
    ],
    relatedSlugs: ['1500-calorie', 'weight-loss', 'high-protein', 'generic-uk-supermarket', 'meal-plans-with-shopping-list'],
  },
  'high-protein': {
    slug: 'high-protein',
    path: '/meal-plans/high-protein',
    title: 'High Protein Meal Plans UK - Free 7-Day Plans + Shopping Lists',
    description:
      'Find free high protein meal plans for UK supermarkets, including fat loss, muscle gain, vegetarian, gym beginner and body recomposition plans.',
    h1: 'High Protein Meal Plans UK',
    kicker: 'Protein-focused plan hub',
    intro:
      'High protein meal plans are useful for fat loss, muscle gain, body recomposition and more filling weekday lunches. These plans use familiar UK ingredients such as chicken, tuna, eggs, skyr, tofu, lentils, beans and lean mince.',
    match: {
      goals: ['high-protein-low-cal', 'cheap-high-protein', 'high-protein-vegetarian', 'budget-bodybuilding', 'gym-beginner', 'body-recomp', 'muscle-gain'],
      emphasis: ['lean-protein', 'recomp-protein'],
    },
    stats: ['Higher protein options', 'Gym-friendly meals', 'Meat and vegetarian plans'],
    sections: [
      {
        h2: 'What makes a good high protein meal plan?',
        paragraphs: [
          'The best high protein plans spread protein across breakfast, lunch, dinner and snacks instead of relying on one huge dinner. This makes the day easier to follow and gives each meal a clear protein anchor.',
          'For fat loss, choose high-protein low-calorie or body recomposition plans. For gaining size, choose muscle gain or budget bodybuilding plans with higher calorie targets.',
        ],
      },
    ],
    faq: [
      {
        q: 'Do the high protein plans include vegetarian options?',
        a: 'Yes. The library includes high-protein vegetarian plans built around eggs, dairy, tofu, beans, lentils and meat-free proteins.',
      },
      {
        q: 'Can I print a high protein meal plan?',
        a: 'Yes. Open any plan and use the export/print PDF section to save a full weekly summary and shopping list.',
      },
    ],
    relatedSlugs: ['free-online-diet-plans-uk', '1500-calorie', 'weight-loss', 'vegetarian', 'meal-plans-with-shopping-list'],
  },
  'muscle-gain': {
    slug: 'muscle-gain',
    path: '/meal-plans/muscle-gain',
    title: 'Muscle Gain Meal Plans UK - 2500, 3000 and 3500 Calorie Plans',
    description:
      'Browse free UK muscle gain meal plans with 2500, 3000 and 3500 calorie options, supermarket filters, macros, PDF export and shopping lists.',
    h1: 'Muscle Gain Meal Plans UK',
    kicker: 'Higher calorie plan hub',
    intro:
      'Muscle gain meal prep works best when calories are high enough, protein is spread through the day, and meals are still realistic to cook. These plans include bigger training-day options without asking you to build the week from scratch.',
    match: { goals: ['muscle-gain', 'budget-bodybuilding', 'gym-beginner', 'body-recomp'], calories: [2500, 3000, 3500, 2200, 2000] },
    stats: ['2500-3500 kcal options', 'High-protein meals', 'Supermarket shopping lists'],
    sections: [
      {
        h2: 'How to choose a muscle gain plan',
        paragraphs: [
          'Start with your calorie target. A 2500 calorie plan suits many lighter or less active users, while 3000 and 3500 calorie plans are better for larger users, hard gainers, active jobs or heavy training blocks.',
          'Choose budget bodybuilding when cost matters most, muscle gain when you want a balanced surplus, or endurance plans when your training needs more carbohydrate.',
        ],
      },
      {
        h2: 'What makes these plans realistic',
        paragraphs: [
          'Higher-calorie plans use extra snacks and larger but still readable ingredient amounts. That is easier to follow than one enormous dinner or vague instructions to multiply every ingredient.',
        ],
      },
    ],
    faq: [
      {
        q: 'Do the muscle gain plans include 3000 and 3500 calorie options?',
        a: 'Yes. The plan library includes 3000 and 3500 calorie muscle gain, budget bodybuilding and endurance-style options.',
      },
      {
        q: 'Can I print a muscle gain meal plan?',
        a: 'Yes. Open any plan and use the export or print PDF section to save the full week and shopping list.',
      },
    ],
    relatedSlugs: ['3000-calorie', '3500-calorie', 'high-protein', 'meal-plans-with-shopping-list'],
  },
  '3000-calorie': {
    slug: '3000-calorie',
    path: '/meal-plans/3000-calorie',
    title: '3000 Calorie Meal Plans UK - Muscle Gain + Shopping Lists',
    description:
      'Browse free 3000 calorie meal plans for UK muscle gain, endurance training and budget bodybuilding, with printable PDFs and shopping lists.',
    h1: '3000 Calorie Meal Plans UK',
    kicker: 'High calorie plan hub',
    intro:
      'A 3000 calorie meal plan needs enough food to support training without turning the day into constant cooking. These plans use familiar UK meals, extra snacks and supermarket-friendly ingredients.',
    match: { calories: [3000], goals: ['muscle-gain', 'budget-bodybuilding', 'endurance-athlete'] },
    stats: ['3000 kcal/day', 'Muscle gain options', 'PDF and shopping list'],
    sections: [
      {
        h2: 'Who a 3000 calorie plan suits',
        paragraphs: [
          'A 3000 calorie plan can suit active people, larger users, gym users trying to gain weight, and endurance athletes with higher weekly training demands.',
          'If this target feels too much, compare 2500 calorie plans first. If you still struggle to gain weight, look at the 3500 calorie options.',
        ],
      },
    ],
    faq: [
      { q: 'Are these 3000 calorie plans only for bodybuilding?', a: 'No. Some are muscle gain or budget bodybuilding plans, while others are endurance-focused for higher training volume.' },
      { q: 'Do the 3000 calorie plans include shopping lists?', a: 'Yes. Each plan includes a full grouped shopping list and printable PDF export.' },
    ],
    relatedSlugs: ['muscle-gain', '3500-calorie', 'high-protein', 'printable-meal-plans'],
  },
  '3500-calorie': {
    slug: '3500-calorie',
    path: '/meal-plans/3500-calorie',
    title: '3500 Calorie Meal Plans UK - Bulking + Heavy Training Plans',
    description:
      'Browse free 3500 calorie meal plans for UK bulking, heavy training and hard gainers, including supermarket shopping lists and PDFs.',
    h1: '3500 Calorie Meal Plans UK',
    kicker: 'Very high calorie plan hub',
    intro:
      'A 3500 calorie meal plan is a specialist target for people with high energy needs. These plans are built for bulking, heavy training weeks and users who already know a lower target is not enough.',
    match: { calories: [3500], goals: ['muscle-gain', 'budget-bodybuilding', 'endurance-athlete'] },
    stats: ['3500 kcal/day', 'Bulking-friendly', 'Printable shopping list'],
    sections: [
      {
        h2: 'How to make 3500 calories easier to follow',
        paragraphs: [
          'Use breakfast, lunch, dinner and several snacks rather than forcing huge single meals. Higher-calorie plans should still use foods you can buy repeatedly: oats, rice, pasta, potatoes, yogurt, milk, eggs, chicken, tofu, fish, beans and olive oil.',
          'Because 3500 calories is high for many adults, use it when your weight trend, training demands or professional advice justify that target.',
        ],
      },
    ],
    faq: [
      { q: 'Is a 3500 calorie meal plan suitable for everyone?', a: 'No. It is a high intake target and is mainly for people with high energy needs, heavy training or deliberate weight gain goals.' },
      { q: 'Can I choose a supermarket for 3500 calorie plans?', a: 'Yes. Use the 3500 calorie chooser or browse filters to combine calorie target with supermarket.' },
    ],
    relatedSlugs: ['3000-calorie', 'muscle-gain', 'high-protein', 'meal-plans-with-shopping-list'],
  },
  'generic-uk-supermarket': {
    slug: 'generic-uk-supermarket',
    path: '/meal-plans/generic-uk-supermarket',
    title: 'Generic UK Supermarket Meal Plans - Average Price Shopping Lists',
    description:
      'Browse generic UK supermarket meal plans using average supermarket pricing, with calorie targets, goals, printable PDFs and shopping lists.',
    h1: 'Generic UK Supermarket Meal Plans',
    kicker: 'Average-price plan hub',
    intro:
      'Generic UK supermarket plans are useful when you do not want the plan tied to Aldi, Tesco, Asda or another named store. They use common ingredients and average-price assumptions so you can shop where convenient.',
    match: { supermarkets: ['any'] },
    stats: ['Average UK pricing', 'No named-store default', 'Printable PDFs'],
    sections: [
      {
        h2: 'When to use the generic supermarket option',
        paragraphs: [
          'Choose the generic option if you switch supermarkets, use a mix of online shops and local stores, or want a plan that is not built around one retailer.',
          'The recipes use standard UK supermarket ingredients, so you can still shop at Aldi, Lidl, Tesco, Asda, Sainsbury\'s, Morrisons or Iceland.',
        ],
      },
    ],
    faq: [
      { q: 'Does generic mean no shopping list?', a: 'No. Generic plans still include a full shopping list, but the price estimate uses average UK supermarket assumptions.' },
      { q: 'Can I switch from generic to a named supermarket?', a: 'Yes. Use the supermarket chooser or browse filters to pick a named store.' },
    ],
    relatedSlugs: ['weight-loss', '1500-calorie', 'muscle-gain', 'meal-plans-with-shopping-list'],
  },
  aldi: {
    slug: 'aldi',
    path: '/meal-plans/aldi',
    title: 'Aldi Meal Plans UK - Free Weekly Plans + Shopping Lists',
    description:
      'Browse free Aldi meal plans for weight loss, muscle gain, high protein, vegetarian, vegan and budget meal prep, with shopping lists and PDFs.',
    h1: 'Aldi Meal Plans UK',
    kicker: 'Supermarket plan hub',
    intro:
      'Aldi meal plans are ideal when you want simple UK supermarket ingredients and a tighter weekly budget. These plans are built around repeatable breakfasts, batch-friendly lunches and realistic dinners.',
    match: { supermarkets: ['aldi'] },
    stats: ['Aldi-focused plans', 'Budget-friendly meals', 'Printable shopping lists'],
    sections: [
      {
        h2: 'Why choose Aldi meal plans?',
        paragraphs: [
          'Aldi is a strong fit for structured meal prep because own-brand staples, frozen vegetables, oats, rice, pasta, tins, yogurts and lean proteins can keep the weekly shop predictable.',
          'Use Aldi plans when budget control matters. If you want the same structure without choosing one store, compare Tesco or Generic UK supermarket plans.',
        ],
      },
    ],
    faq: [
      {
        q: 'Do Aldi meal plans include budget options?',
        a: 'Yes. Aldi has budget fat loss, cheap student, cheap high protein and budget bodybuilding plans alongside standard weight loss and maintenance options.',
      },
      {
        q: 'Can I use an Aldi plan at another supermarket?',
        a: 'Yes. The ingredients are common UK supermarket foods, but prices and exact product names may differ.',
      },
    ],
    relatedSlugs: ['weight-loss', '1500-calorie', 'high-protein', 'tesco-weight-loss'],
  },
  vegetarian: {
    slug: 'vegetarian',
    path: '/meal-plans/vegetarian',
    title: 'Vegetarian Meal Plans UK - High Protein, Low Calorie + PDF',
    description:
      'Browse free vegetarian meal plans for UK meal prep, including high protein, low calorie, Aldi, Tesco and printable shopping-list plans.',
    h1: 'Vegetarian Meal Plans UK',
    kicker: 'Meat-free plan hub',
    intro:
      'Vegetarian meal prep is easiest when each meal has a clear protein source. These plans use eggs, Greek yogurt, cottage cheese, tofu, beans, lentils, halloumi, feta and meat-free proteins to keep the week practical.',
    match: { diets: ['vegetarian'], goals: ['vegetarian-low-cal', 'high-protein-vegetarian', 'maintenance', 'budget-fat-loss', 'weight-loss'] },
    stats: ['Meat-free plans', 'High-protein options', 'UK supermarket ingredients'],
    sections: [
      {
        h2: 'How to make vegetarian meal prep more filling',
        paragraphs: [
          'Choose plans that include protein at breakfast as well as lunch and dinner. Yogurt bowls, eggs on toast, tofu bowls and lentil meals usually work better than vegetable-only lunches.',
          'If you are cutting calories, pick vegetarian low-calorie plans. If you train regularly, start with high-protein vegetarian plans.',
        ],
      },
    ],
    faq: [
      {
        q: 'Are the vegetarian meal plans high protein?',
        a: 'Some are designed specifically for higher protein. Use the high-protein vegetarian goal or the high-protein hub if protein is the priority.',
      },
      {
        q: 'Do vegetarian plans include shopping lists?',
        a: 'Yes. Each vegetarian plan includes a weekly shopping list and a printable PDF summary.',
      },
    ],
    relatedSlugs: ['high-protein', '1500-calorie', 'weight-loss', 'printable-meal-plans'],
  },
  'weight-loss': {
    slug: 'weight-loss',
    path: '/meal-plans/weight-loss',
    title: 'Lose Weight Meal Plan UK - Free 7-Day Plans + Shopping Lists',
    description:
      'Browse free UK lose weight meal plans by supermarket, calories and diet, with printable PDFs, macros, recipes and weekly shopping lists.',
    h1: 'Lose Weight Meal Plan UK',
    kicker: 'Fat loss plan hub',
    intro:
      'A good lose weight meal plan is not the most extreme one. It is the one you can shop for, cook and repeat. These UK plans focus on calorie control, protein, fibre and realistic supermarket meals.',
    match: { goals: ['weight-loss', 'budget-fat-loss', 'high-protein-low-cal', 'vegetarian-low-cal', 'vegan-low-cal', 'cutting'] },
    stats: ['Calorie-controlled plans', 'Supermarket filters', 'Free PDF export'],
    reviewed: '23 June 2026',
    sources: COMMON_NUTRITION_SOURCES,
    sections: [
      {
        h2: 'Quick answer: which UK meal plan helps you lose weight?',
        paragraphs: [
          'The best lose weight meal plan UK shoppers can start with is usually a 1500, 1600 or 1800 calorie plan that includes protein at every meal, filling carbs, fruit, vegetables and a shopping list for the supermarket you actually use.',
          'Pick the lowest calorie target you can repeat without constant hunger. High-protein and high-fibre versions are useful when appetite is the main barrier, while budget versions help when the weekly shop needs to stay predictable.',
        ],
        table: {
          headers: ['Need', 'Best starting point', 'Why it works'],
          rows: [
            ['Simple fat loss', '1500 or 1800 calorie plans', 'Clear portions and familiar UK meals'],
            ['Hunger control', 'High-protein low-calorie plans', 'More protein, fibre and volume'],
            ['Lower weekly shop', 'Budget fat loss plans', 'Repeats cheap staples and avoids niche products'],
            ['Named supermarket', 'Aldi, Tesco, Lidl or Asda plans', 'Uses the store you already shop in'],
          ],
        },
      },
      {
        h2: 'How to choose a lose weight meal plan',
        paragraphs: [
          'Start with your calorie target, then choose a supermarket and diet type. If you are unsure, compare a 1500 calorie plan with an 1800 calorie plan before choosing a more specialised option.',
          'Use the shopping list before you start the week. A plan is much easier to follow when the protein, breakfast staples, lunch ingredients and snacks are already in the kitchen.',
        ],
      },
    ],
    supportingGuides: [GUIDE_LINKS.lowCalorieFoods, GUIDE_LINKS.cheapProtein, GUIDE_LINKS.proteinPorridge, GUIDE_LINKS.shoppingList],
    faq: [
      {
        q: 'What is the best lose weight meal plan UK?',
        a: 'For many people, the best starting point is a 1500, 1600 or 1800 calorie plan with protein at every meal, high-fibre foods, realistic portions and a supermarket shopping list.',
      },
      {
        q: 'Which weight loss meal plan should I start with?',
        a: 'Start with a supermarket you already use and a calorie target you can follow consistently. Then adjust with the AI meal edit tool if a meal does not suit you.',
      },
      {
        q: 'Are these weight loss meal plans free?',
        a: 'Yes. The plans are free to browse, print and save as PDF, with no account required.',
      },
    ],
    relatedSlugs: ['free-online-diet-plans-uk', '1500-calorie', 'high-protein', 'tesco-weight-loss', 'aldi'],
  },
  'tesco-weight-loss': {
    slug: 'tesco-weight-loss',
    path: '/meal-plans/tesco-weight-loss',
    title: 'Tesco Weight Loss Meal Plans UK - Free PDF Plans',
    description:
      'Browse Tesco weight loss meal plans with UK shopping lists, calories, macros, printable PDFs and low-calorie meal prep ideas.',
    h1: 'Tesco Weight Loss Meal Plans UK',
    kicker: 'Tesco fat loss hub',
    intro:
      'Tesco weight loss meal plans are useful when you want a broad UK supermarket range, easy swaps and familiar ingredients. These plans focus on calorie control without making the weekly shop complicated.',
    match: { supermarkets: ['tesco'], goals: ['weight-loss', 'budget-fat-loss', 'high-protein-low-cal', 'cutting'] },
    stats: ['Tesco-focused plans', 'Weight loss goals', 'Printable shopping lists'],
    sections: [
      {
        h2: 'Why choose Tesco for weight loss meal prep?',
        paragraphs: [
          'Tesco is useful for weight loss meal prep because it has broad ranges of lean protein, ready vegetables, frozen fruit, tinned pulses, yogurts, wraps, rice and pasta. That makes swaps easier than relying on niche ingredients.',
          'Use Tesco plans when you want more choice than a discount supermarket while still keeping meals simple and repeatable.',
        ],
      },
    ],
    faq: [
      {
        q: 'Do Tesco weight loss plans include high protein options?',
        a: 'Yes. Tesco high-protein low-calorie and cutting plans are included where they match the weight loss goal.',
      },
      {
        q: 'Can I print the Tesco shopping list?',
        a: 'Yes. Open a plan and use the export/print PDF button to print the full plan and shopping list together.',
      },
    ],
    relatedSlugs: ['weight-loss', '1500-calorie', 'high-protein', 'aldi'],
  },
  'printable-meal-plans': {
    slug: 'printable-meal-plans',
    path: '/meal-plans/printable-meal-plans',
    title: 'Printable Meal Plans UK - Free PDF Weekly Plans',
    description:
      'Find printable UK meal plans with PDF export, 7-day menus, macros, recipes and weekly shopping lists for weight loss, protein and budget goals.',
    h1: 'Printable Meal Plans UK',
    kicker: 'PDF meal plan hub',
    intro:
      'Printable meal plans are useful when you want the week on the fridge, in a kitchen folder or saved as a PDF before shopping. Every plan includes a print-friendly weekly summary and shopping list.',
    match: {},
    stats: ['PDF export', '7-day summaries', 'Shopping lists included'],
    sections: [
      {
        h2: 'What the printable PDF includes',
        paragraphs: [
          'The printable version summarises all seven days, daily calories, protein totals, meal names and the full grouped shopping list. It is designed for planning the weekly shop rather than reading one tab at a time.',
          'Use printable plans when you batch cook on Sunday, shop from a paper list, or want to keep the week visible in the kitchen.',
        ],
      },
    ],
    faq: [
      {
        q: 'Can I save the meal plans as PDF?',
        a: 'Yes. Use the export/print PDF button on any plan page, then choose Save as PDF in your browser print dialog.',
      },
      {
        q: 'Does the PDF include the shopping list?',
        a: 'Yes. The print summary includes the full weekly shopping list grouped by category.',
      },
    ],
    relatedSlugs: ['meal-plans-with-shopping-list', 'weight-loss', '1500-calorie', 'high-protein'],
  },
  'meal-plans-with-shopping-list': {
    slug: 'meal-plans-with-shopping-list',
    path: '/meal-plans/meal-plans-with-shopping-list',
    title: 'Meal Plans With Shopping Lists UK - Free 7-Day Plans',
    description:
      'Browse free UK meal plans with weekly shopping lists, recipes, macros and PDF export for weight loss, high protein, vegetarian and budget goals.',
    h1: 'Meal Plans With Shopping Lists UK',
    kicker: 'Shopping-list plan hub',
    intro:
      'A meal plan is much easier to follow when the shopping list is already built. These plans include grouped weekly shopping lists so you can move from choosing a plan to doing the shop quickly.',
    match: {},
    stats: ['Grouped shopping lists', 'Recipes and macros', 'Free weekly plans'],
    sections: [
      {
        h2: 'Why shopping-list meal plans convert better into action',
        paragraphs: [
          'Without a shopping list, a meal plan is just an idea. The grouped lists on these pages make it clearer what to buy for protein, carbs, vegetables, dairy and extras.',
          'For the smoothest week, choose the plan first, export the PDF, then compare your cupboard staples before buying everything on the list.',
        ],
      },
    ],
    faq: [
      {
        q: 'Are shopping lists included on every plan?',
        a: 'Yes. Every generated plan page includes a grouped weekly shopping list and a copy button.',
      },
      {
        q: 'Can I edit a meal and update the shopping list?',
        a: 'Yes. On plan pages, meal edits recalculate the day totals and rebuild the shopping list.',
      },
    ],
    relatedSlugs: ['printable-meal-plans', 'weight-loss', 'aldi', 'vegetarian'],
  },
};

export const MEAL_PLAN_HUB_SLUGS = Object.keys(MEAL_PLAN_HUBS);

const HUB_GOAL_PRIORITY = {
  'weight-loss': 1,
  'high-protein-low-cal': 2,
  'budget-fat-loss': 3,
  'cheap-high-protein': 4,
  'vegetarian-low-cal': 5,
  'high-protein-vegetarian': 6,
};

export function filterPlansForHub(plans, hub) {
  const match = hub.match || {};
  const filtered = plans.filter(plan => {
    if (match.calories && !match.calories.includes(plan.calories)) return false;
    if (match.goals && !match.goals.includes(plan.goal)) return false;
    if (match.supermarkets && !match.supermarkets.includes(plan.supermarket)) return false;
    if (match.diets && !match.diets.includes(plan.dietType)) return false;
    if (match.emphasis && !match.emphasis.includes(plan.emphasis)) return false;
    if (match.budgets && !match.budgets.includes(plan.budget)) return false;
    if (match.efforts && !match.efforts.includes(plan.effort)) return false;
    return true;
  });

  return filtered.sort((a, b) => scorePlanForHub(b, hub) - scorePlanForHub(a, hub));
}

function scorePlanForHub(plan, hub) {
  const match = hub.match || {};
  let score = 0;

  if (match.calories?.includes(plan.calories)) score += 8;
  if (match.goals?.includes(plan.goal)) score += 8;
  if (match.supermarkets?.includes(plan.supermarket)) score += 8;
  if (match.diets?.includes(plan.dietType)) score += 8;
  if (match.emphasis?.includes(plan.emphasis)) score += 5;
  if (match.budgets?.includes(plan.budget)) score += 5;
  if (match.efforts?.includes(plan.effort)) score += 4;
  if (plan.supermarket === 'aldi' || plan.supermarket === 'tesco') score += 2;
  if (plan.effort === 'batch' || plan.effort === 'standard') score += 2;
  if (plan.dietType === 'standard') score += 1;

  score += Math.max(0, 8 - (HUB_GOAL_PRIORITY[plan.goal] || 8));
  return score;
}
