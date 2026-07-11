const LOW_CALORIE_LINKS = [
  { label: 'Printable 1500 calorie meal plan', to: '/meal-plans/1500-calorie' },
  { label: 'Low calorie shopping list', to: '/meal-plans/low-calorie-shopping-list' },
  { label: 'Low calorie ready meals UK', to: '/blog/best-low-calorie-ready-meals-uk' },
];

const HIGH_PROTEIN_LINKS = [
  { label: 'High protein meal plans UK', to: '/meal-plans/high-protein' },
  { label: 'High protein shopping list', to: '/meal-plans/high-protein-shopping-list' },
  { label: 'High protein snacks UK', to: '/blog/high-protein-snacks-uk' },
];

const SHOPPING_LINKS = [
  { label: 'Meal plans with shopping lists', to: '/meal-plans/meal-plans-with-shopping-list' },
  { label: 'Printable meal plan PDFs', to: '/meal-plans/printable-meal-plans' },
  { label: 'Budget shopping list', to: '/meal-plans/budget-shopping-list' },
];

const CONTAINER_LINKS = [
  { label: 'Best meal prep containers UK', to: '/meal-prep-containers' },
  { label: 'Glass meal prep containers', to: '/meal-prep-containers/mid-range' },
  { label: 'Budget meal prep tubs', to: '/meal-prep-containers/budget' },
];

function qa(answer, links) {
  return { answer, links };
}

export const SEO_OPPORTUNITY_QUICK_ANSWERS = {
  'how-to-build-a-calorie-deficit': qa(
    'A calorie deficit works best when it is modest, repeatable and built around filling UK supermarket meals rather than extreme restriction. Start with a realistic calorie target, then use a plan with protein, fibre, vegetables and a shopping list.',
    LOW_CALORIE_LINKS,
  ),
  'best-low-calorie-foods-uk': qa(
    'The best low calorie foods in UK supermarkets are lean proteins, high-volume vegetables, fruit, potatoes, oats, beans, lentils, low-fat dairy and simple ready-to-eat options that make a calorie target easier to follow.',
    LOW_CALORIE_LINKS,
  ),
  'best-low-calorie-ready-meals-uk': qa(
    'A good low calorie ready meal should usually have enough protein, visible vegetables and a proper portion size. Very small ready meals often need a side such as salad, soup, fruit, skyr or cottage cheese.',
    LOW_CALORIE_LINKS,
  ),
  'what-does-1500-calories-look-like-uk': qa(
    'A realistic 1500 calorie day is usually three proper meals plus one snack: protein at each meal, vegetables for volume, and measured portions of oats, rice, potatoes, wraps, fruit or dairy.',
    LOW_CALORIE_LINKS,
  ),
  '1500-vs-1800-vs-2000-calories': qa(
    'The difference between 1500, 1800 and 2000 calories is usually one extra snack, larger carbohydrate portions or more cooking fat. Choose the lowest target you can repeat without constant hunger.',
    LOW_CALORIE_LINKS,
  ),
  '1200-calorie-meal-plan-uk': qa(
    '1200 calories is very low for many adults. If you use it as a reference point, prioritise protein, vegetables and simple meals, then compare 1400 or 1500 calorie plans if energy or hunger becomes difficult.',
    LOW_CALORIE_LINKS,
  ),
  '1400-calorie-meal-plan-uk': qa(
    'A 1400 calorie plan suits some smaller or less active adults, but it needs proper meals: protein at breakfast, a filling lunch, a warm dinner and a planned snack.',
    LOW_CALORIE_LINKS,
  ),
  '1600-calorie-meal-plan-uk': qa(
    'A 1600 calorie meal plan is often a more repeatable fat-loss target than 1200 or 1400 because it leaves room for breakfast, lunch, dinner and a useful snack.',
    LOW_CALORIE_LINKS,
  ),
  '1800-calorie-meal-plan-for-weight-loss-uk': qa(
    'An 1800 calorie meal plan can work well for active adults or anyone who needs a steadier deficit. It should still use measured portions, lean protein and a clear shopping list.',
    LOW_CALORIE_LINKS,
  ),
  '2000-calorie-weight-loss-meal-plan-uk': qa(
    'A 2000 calorie plan can support weight loss for some active or larger adults while keeping meals satisfying. The key is planned portions, protein and fewer untracked extras.',
    LOW_CALORIE_LINKS,
  ),
  'high-protein-low-calorie-meals': qa(
    'The easiest high protein low calorie meals use lean protein plus vegetables and a controlled carbohydrate portion: chicken rice bowls, tuna jackets, tofu stir-fries, turkey chilli and Greek yogurt breakfasts.',
    HIGH_PROTEIN_LINKS,
  ),
  'high-protein-breakfast-uk': qa(
    'The best high protein breakfasts in the UK are quick and repeatable: skyr or Greek yogurt bowls, eggs on toast, protein porridge, cottage cheese toast and tofu scramble.',
    HIGH_PROTEIN_LINKS,
  ),
  'protein-porridge-and-yogurt-breakfasts-uk': qa(
    'Protein porridge is oats plus a protein boost such as Greek yogurt, skyr, cottage cheese, milk or protein powder. It is one of the easiest cheap high-protein breakfasts for UK meal prep.',
    HIGH_PROTEIN_LINKS,
  ),
  'high-protein-snacks-uk': qa(
    'The strongest UK high protein snacks are skyr, Greek yogurt, cottage cheese, eggs, tuna, chicken pieces, edamame, protein puddings and bars used as a backup rather than the whole strategy.',
    HIGH_PROTEIN_LINKS,
  ),
  'high-protein-lunches-for-work-uk': qa(
    'Good high protein work lunches are easy to pack, reheat or eat cold: chicken wraps, tuna pasta, tofu rice bowls, egg salad boxes, chilli portions and cottage cheese sides.',
    HIGH_PROTEIN_LINKS,
  ),
  'best-cheap-high-protein-foods-uk': qa(
    'Cheap protein in the UK usually means supermarket staples: eggs, tuna, Greek yogurt, cottage cheese, chicken, lentils, beans, tofu, sardines and milk rather than specialist protein snacks.',
    HIGH_PROTEIN_LINKS,
  ),
  'cheap-protein-sources-uk-supermarkets': qa(
    'Cheap protein works best when you mix fridge, freezer and cupboard staples: eggs, tins, yogurt, chicken, tofu, beans, lentils and frozen fish all keep the weekly shop flexible.',
    HIGH_PROTEIN_LINKS,
  ),
  'low-calorie-high-volume-foods-uk': qa(
    'High-volume low calorie foods are the foods that make plates look full: vegetables, berries, soup, potatoes, salads, mushrooms, courgette, cabbage, cauliflower and lean protein.',
    LOW_CALORIE_LINKS,
  ),
  'best-fibre-foods-for-weight-loss-uk': qa(
    'The most useful fibre foods for weight loss are oats, beans, lentils, potatoes with skin, wholemeal bread, fruit, vegetables, peas and high-fibre wraps.',
    LOW_CALORIE_LINKS,
  ),
  'protein-meal-prep-without-powder-uk': qa(
    'You can meal prep high protein without powder by using eggs, Greek yogurt, cottage cheese, chicken, tuna, tofu, beans, lentils, prawns, fish and lean mince across the week.',
    HIGH_PROTEIN_LINKS,
  ),
  'summer-meals-uk': qa(
    'Good summer meals for UK meal prep are fresh, cold-friendly and simple to assemble: chicken potato boxes, tuna pasta salad, couscous bowls, prawn noodle salad, overnight oats, salmon potato salad and burger-style salad bowls.',
    [
      { label: 'Work lunch meal prep plans', to: '/meal-plans/work-lunch-meal-prep-uk' },
      { label: 'Overnight oats meal prep', to: '/blog/overnight-oats-meal-prep-uk' },
      { label: 'No microwave meal prep', to: '/blog/meal-prep-without-a-microwave-uk' },
    ],
  ),
  'meal-prep-for-beginners-uk': qa(
    'Beginner meal prep should start with repeatable breakfasts, two lunch options, two dinner bases and a simple shopping list. Do not try to cook seven totally different days at once.',
    SHOPPING_LINKS,
  ),
  'batch-cooking-for-beginners-uk': qa(
    'Good batch cooking starts with freezer-friendly meals such as chilli, curry, pasta bake, soup, rice bowls and overnight oats, then uses containers that match the portions.',
    [...SHOPPING_LINKS, CONTAINER_LINKS[0]],
  ),
  'cheap-meal-prep-shopping-list-uk': qa(
    'A cheap meal prep shopping list should repeat low-cost staples: oats, rice, pasta, potatoes, eggs, tuna, beans, lentils, frozen vegetables, yogurt and simple sauces.',
    SHOPPING_LINKS,
  ),
  'meal-prep-containers-uk': qa(
    'For most UK meal preppers, the best setup is five lunch-sized rectangular containers plus a few smaller tubs for snacks and sauces. Choose plastic for cost, glass for reheating and premium sets for long-term use.',
    CONTAINER_LINKS,
  ),
  'best-meal-prep-containers-uk': qa(
    'The best meal prep containers UK shoppers should compare are budget plastic tubs, mid-range glass lunch boxes and premium leakproof sets. The right choice depends on reheating, commuting and batch-cooking volume.',
    CONTAINER_LINKS,
  ),
  'glass-vs-plastic-meal-prep-containers': qa(
    'Glass is better for reheating, stain resistance and long-term use. Plastic is better for low cost, light weight and bulk freezer portions.',
    CONTAINER_LINKS,
  ),
  'leakproof-meal-prep-containers-uk': qa(
    'Leakproof meal prep containers need the right lid more than the right material. Clip-lock, twist-lock and silicone-seal lids are best for soup, chilli, curry and commuting.',
    CONTAINER_LINKS,
  ),
  'meal-prep-container-size-guide': qa(
    'Most full lunches need around 900ml to 1 litre. Smaller 400-600ml tubs suit snacks and sides, while larger tubs work better for batch bases and freezer portions.',
    CONTAINER_LINKS,
  ),
  'meal-prep-boxes-for-work-lunches': qa(
    'Work lunch boxes should stack neatly, seal reliably and fit a proper portion. Rectangular glass or sturdy plastic boxes usually work better than tiny snack pots.',
    CONTAINER_LINKS,
  ),
  'meal-prep-tubs-for-batch-cooking': qa(
    'Batch cooking needs more tubs than lunch-only meal prep. Use larger containers for chilli, curry and pasta, plus smaller tubs for sauces, snacks and freezer portions.',
    CONTAINER_LINKS,
  ),
  'best-glass-meal-prep-containers-uk': qa(
    'The best glass meal prep containers are rectangular, around 900ml to 1 litre for lunches, with lids that are easy to clean and reliable enough for commuting.',
    CONTAINER_LINKS,
  ),
  'plastic-meal-prep-containers-uk': qa(
    'Plastic meal prep containers are best for budget, freezer portions and light commuting. They are less ideal for repeated tomato-heavy reheating because they can stain.',
    CONTAINER_LINKS,
  ),
  'microwave-safe-meal-prep-containers-uk': qa(
    'For microwave-safe meal prep, check the exact listing instructions. Glass bases are usually the easiest reheating option; plastic should be clearly marked microwave safe.',
    CONTAINER_LINKS,
  ),
};

export const SEO_EXACT_PLAN_LINKS = {
  'best-low-calorie-foods-uk': [
    { label: 'Aldi 1500 calorie meal plan', to: '/meal-plans/aldi-1500-calorie-meal-plan' },
    { label: 'Tesco 1500 calorie meal plan', to: '/meal-plans/tesco-1500-calorie-meal-plan' },
    { label: 'Tesco meal prep for weight loss', to: '/meal-plans/tesco-meal-prep-for-weight-loss' },
  ],
  'best-low-calorie-ready-meals-uk': [
    { label: 'Work lunch meal prep plans', to: '/meal-plans/work-lunch-meal-prep-uk' },
    { label: 'Asda 1800 calorie meal plan', to: '/meal-plans/asda-1800-calorie-meal-plan' },
    { label: 'Tesco 1500 calorie meal plan', to: '/meal-plans/tesco-1500-calorie-meal-plan' },
  ],
  'what-does-1500-calories-look-like-uk': [
    { label: 'Aldi 1500 calorie meal plan', to: '/meal-plans/aldi-1500-calorie-meal-plan' },
    { label: 'Tesco 1500 calorie meal plan', to: '/meal-plans/tesco-1500-calorie-meal-plan' },
    { label: 'Aldi Weight Loss 1500 kcal plan', to: '/plans/aldi-weight-loss-1500' },
  ],
  '1500-vs-1800-vs-2000-calories': [
    { label: 'Aldi 1500 calorie meal plan', to: '/meal-plans/aldi-1500-calorie-meal-plan' },
    { label: 'Asda 1800 calorie meal plan', to: '/meal-plans/asda-1800-calorie-meal-plan' },
    { label: 'Tesco meal prep for weight loss', to: '/meal-plans/tesco-meal-prep-for-weight-loss' },
  ],
  '1200-calorie-meal-plan-uk': [
    { label: 'Aldi 1500 calorie meal plan', to: '/meal-plans/aldi-1500-calorie-meal-plan' },
    { label: 'Tesco 1500 calorie meal plan', to: '/meal-plans/tesco-1500-calorie-meal-plan' },
    { label: 'Printable 1500 calorie plan hub', to: '/meal-plans/1500-calorie' },
  ],
  '1400-calorie-meal-plan-uk': [
    { label: 'Tesco cutting 1400 kcal plan', to: '/plans/tesco-cutting-1400' },
    { label: 'Aldi 1500 calorie meal plan', to: '/meal-plans/aldi-1500-calorie-meal-plan' },
    { label: 'Tesco 1500 calorie meal plan', to: '/meal-plans/tesco-1500-calorie-meal-plan' },
  ],
  '1600-calorie-meal-plan-uk': [
    { label: 'Aldi cutting 1600 kcal plan', to: '/plans/aldi-cutting-1600' },
    { label: 'Tesco meal prep for weight loss', to: '/meal-plans/tesco-meal-prep-for-weight-loss' },
    { label: 'Asda 1800 calorie meal plan', to: '/meal-plans/asda-1800-calorie-meal-plan' },
  ],
  '1800-calorie-meal-plan-for-weight-loss-uk': [
    { label: 'Asda 1800 calorie meal plan', to: '/meal-plans/asda-1800-calorie-meal-plan' },
    { label: 'Tesco meal prep for weight loss', to: '/meal-plans/tesco-meal-prep-for-weight-loss' },
    { label: 'Lidl budget meal prep', to: '/meal-plans/lidl-budget-meal-prep' },
  ],
  '2000-calorie-weight-loss-meal-plan-uk': [
    { label: 'Work lunch meal prep plans', to: '/meal-plans/work-lunch-meal-prep-uk' },
    { label: 'Tesco high protein meal plan', to: '/meal-plans/tesco-high-protein-meal-plan' },
    { label: 'High protein vegetarian meal prep', to: '/meal-plans/high-protein-vegetarian-meal-prep' },
  ],
  'high-protein-low-calorie-meals': [
    { label: 'Aldi high protein meal plan', to: '/meal-plans/aldi-high-protein-meal-plan' },
    { label: 'Tesco high protein meal plan', to: '/meal-plans/tesco-high-protein-meal-plan' },
    { label: 'High protein vegetarian meal prep', to: '/meal-plans/high-protein-vegetarian-meal-prep' },
  ],
  'high-protein-breakfast-uk': [
    { label: 'Aldi high protein meal plan', to: '/meal-plans/aldi-high-protein-meal-plan' },
    { label: 'Tesco high protein meal plan', to: '/meal-plans/tesco-high-protein-meal-plan' },
    { label: 'Protein porridge UK', to: '/blog/protein-porridge-and-yogurt-breakfasts-uk' },
  ],
  'protein-porridge-and-yogurt-breakfasts-uk': [
    { label: 'High protein shopping list', to: '/meal-plans/high-protein-shopping-list' },
    { label: 'Cheap protein UK guide', to: '/blog/best-cheap-high-protein-foods-uk' },
    { label: 'Aldi high protein meal plan', to: '/meal-plans/aldi-high-protein-meal-plan' },
  ],
  'high-protein-snacks-uk': [
    { label: 'Tesco high protein meal plan', to: '/meal-plans/tesco-high-protein-meal-plan' },
    { label: 'Aldi high protein meal plan', to: '/meal-plans/aldi-high-protein-meal-plan' },
    { label: 'High protein vegetarian meal prep', to: '/meal-plans/high-protein-vegetarian-meal-prep' },
  ],
  'high-protein-lunches-for-work-uk': [
    { label: 'Work lunch meal prep plans', to: '/meal-plans/work-lunch-meal-prep-uk' },
    { label: 'Tesco high protein meal plan', to: '/meal-plans/tesco-high-protein-meal-plan' },
    { label: 'Meal prep boxes for work lunches', to: '/blog/meal-prep-boxes-for-work-lunches' },
  ],
  'best-cheap-high-protein-foods-uk': [
    { label: 'High protein shopping list', to: '/meal-plans/high-protein-shopping-list' },
    { label: 'Aldi high protein meal plan', to: '/meal-plans/aldi-high-protein-meal-plan' },
    { label: 'Lidl budget meal prep', to: '/meal-plans/lidl-budget-meal-prep' },
  ],
  'cheap-protein-sources-uk-supermarkets': [
    { label: 'Aldi high protein meal plan', to: '/meal-plans/aldi-high-protein-meal-plan' },
    { label: 'Tesco high protein meal plan', to: '/meal-plans/tesco-high-protein-meal-plan' },
    { label: 'Lidl budget meal prep', to: '/meal-plans/lidl-budget-meal-prep' },
  ],
  'protein-meal-prep-without-powder-uk': [
    { label: 'High protein vegetarian meal prep', to: '/meal-plans/high-protein-vegetarian-meal-prep' },
    { label: 'Aldi high protein meal plan', to: '/meal-plans/aldi-high-protein-meal-plan' },
    { label: 'Tesco high protein meal plan', to: '/meal-plans/tesco-high-protein-meal-plan' },
  ],
  'summer-meals-uk': [
    { label: 'Work lunch meal prep plans', to: '/meal-plans/work-lunch-meal-prep-uk' },
    { label: 'High protein meal plans', to: '/meal-plans/high-protein' },
    { label: 'Printable meal plans', to: '/meal-plans/printable-meal-plans' },
  ],
  'meal-prep-for-beginners-uk': [
    { label: 'Work lunch meal prep plans', to: '/meal-plans/work-lunch-meal-prep-uk' },
    { label: 'Vegetarian batch cooking meal plan', to: '/meal-plans/vegetarian-batch-cooking-meal-plan' },
    { label: 'Cheap student Aldi meal prep', to: '/meal-plans/cheap-student-meal-prep-aldi' },
  ],
  'batch-cooking-for-beginners-uk': [
    { label: 'Vegetarian batch cooking meal plan', to: '/meal-plans/vegetarian-batch-cooking-meal-plan' },
    { label: 'Vegan batch cooking meal plan', to: '/meal-plans/vegan-batch-cooking-meal-plan' },
    { label: 'Work lunch meal prep plans', to: '/meal-plans/work-lunch-meal-prep-uk' },
  ],
  'cheap-meal-prep-shopping-list-uk': [
    { label: 'Cheap student Aldi meal prep', to: '/meal-plans/cheap-student-meal-prep-aldi' },
    { label: 'Lidl budget meal prep', to: '/meal-plans/lidl-budget-meal-prep' },
    { label: 'Aldi 1500 calorie meal plan', to: '/meal-plans/aldi-1500-calorie-meal-plan' },
  ],
  'meal-prep-boxes-for-work-lunches': [
    { label: 'Work lunch meal prep plans', to: '/meal-plans/work-lunch-meal-prep-uk' },
    { label: 'High protein lunches for work UK', to: '/blog/high-protein-lunches-for-work-uk' },
    { label: 'Leakproof containers guide', to: '/blog/leakproof-meal-prep-containers-uk' },
  ],
  'meal-prep-tubs-for-batch-cooking': [
    { label: 'Vegetarian batch cooking meal plan', to: '/meal-plans/vegetarian-batch-cooking-meal-plan' },
    { label: 'Vegan batch cooking meal plan', to: '/meal-plans/vegan-batch-cooking-meal-plan' },
    { label: 'Batch cooking for beginners UK', to: '/blog/batch-cooking-for-beginners-uk' },
  ],
};
