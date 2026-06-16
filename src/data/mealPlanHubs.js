export const MEAL_PLAN_HUBS = {
  '1500-calorie': {
    slug: '1500-calorie',
    path: '/meal-plans/1500-calorie',
    title: 'Free 1500 Calorie Meal Plans UK - PDF + Shopping Lists',
    description:
      'Browse free 1500 calorie meal plans for UK weight loss, with printable PDFs, weekly shopping lists, macros and supermarket-friendly meals.',
    h1: '1500 Calorie Meal Plans UK',
    kicker: 'Low calorie plan hub',
    intro:
      'A 1500 calorie meal plan works best when the meals are simple, filling and easy to shop for in UK supermarkets. These plans prioritise lean protein, high-fibre carbs, vegetables and practical recipes you can repeat through the week.',
    match: { calories: [1500, 1400, 1600], goals: ['weight-loss', 'budget-fat-loss', 'high-protein-low-cal', 'vegetarian-low-cal', 'vegan-low-cal', 'cutting'] },
    stats: ['Low calorie options', 'Printable PDF plans', 'Weekly shopping lists'],
    sections: [
      {
        h2: 'How to choose a 1500 calorie meal plan',
        paragraphs: [
          'Start with diet type and supermarket before choosing exact meals. A realistic 1500 calorie plan should still include breakfast, lunch, dinner and enough protein to keep the day satisfying.',
          'If you are hungry on 1500 calories, choose high-fibre or high-protein plans first. If your week is busy, use batch-cook plans so lunch and dinner are easier to repeat.',
        ],
      },
      {
        h2: 'Best 1500 calorie plan types',
        paragraphs: [
          'Weight loss and budget fat loss plans are the safest starting points. High-protein low-calorie plans suit gym users, while vegetarian and vegan low-calorie plans are better when you want plant-forward meals without building the week yourself.',
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
    ],
    relatedSlugs: ['weight-loss', 'high-protein', 'meal-plans-with-shopping-list', 'printable-meal-plans'],
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
    relatedSlugs: ['1500-calorie', 'weight-loss', 'vegetarian', 'meal-plans-with-shopping-list'],
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
          'Use Aldi plans when budget control matters. If you want the same structure with broader product ranges, compare Tesco or Any UK supermarket plans.',
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
    title: 'Weight Loss Meal Plans UK - Free 7-Day Plans + Shopping Lists',
    description:
      'Browse free UK weight loss meal plans by supermarket, calories and diet, with printable PDFs, macros, recipes and weekly shopping lists.',
    h1: 'Weight Loss Meal Plans UK',
    kicker: 'Fat loss plan hub',
    intro:
      'The best weight loss meal plan is not the most extreme one. It is the one you can shop for, cook and repeat. These UK plans focus on calorie control, protein, fibre and realistic meals.',
    match: { goals: ['weight-loss', 'budget-fat-loss', 'high-protein-low-cal', 'vegetarian-low-cal', 'vegan-low-cal', 'cutting'] },
    stats: ['Calorie-controlled plans', 'Supermarket filters', 'Free PDF export'],
    sections: [
      {
        h2: 'Choosing a weight loss plan',
        paragraphs: [
          'Start with your calorie target, then choose a supermarket and diet type. If you are unsure, a 1500 or 1800 calorie weight loss plan is often easier to compare than a highly specialised plan.',
          'High-protein and high-fibre versions are useful when hunger is the main barrier. Budget versions help when the weekly shop needs to stay predictable.',
        ],
      },
    ],
    faq: [
      {
        q: 'Which weight loss meal plan should I start with?',
        a: 'Start with a supermarket you already use and a calorie target you can follow consistently. Then adjust with the AI meal edit tool if a meal does not suit you.',
      },
      {
        q: 'Are these weight loss meal plans free?',
        a: 'Yes. The plans are free to browse, print and save as PDF, with no account required.',
      },
    ],
    relatedSlugs: ['1500-calorie', 'high-protein', 'tesco-weight-loss', 'aldi'],
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
  if (plan.supermarket === 'aldi' || plan.supermarket === 'tesco') score += 2;
  if (plan.effort === 'batch' || plan.effort === 'standard') score += 2;
  if (plan.dietType === 'standard') score += 1;

  score += Math.max(0, 8 - (HUB_GOAL_PRIORITY[plan.goal] || 8));
  return score;
}
