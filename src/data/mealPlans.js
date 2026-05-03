// Static data powering the six programmatic meal-plan pages.
// Each entry keyed by URL slug.

const BASE_SHOPPING = {
  '1500-calorie-meal-plan': {
    protein: ['Chicken breast (1 kg)', 'Tinned tuna (4 cans)', 'Eggs (12)', 'Greek yogurt low-fat (500 g)', 'Smoked salmon (100 g)'],
    carbs: ['Rolled oats (1 kg)', 'Wholemeal bread (800 g loaf)', 'Brown rice (500 g)', 'Sweet potatoes (1 kg)', 'New potatoes (750 g)'],
    vegetables: ['Broccoli (500 g)', 'Spinach (200 g bag)', 'Mixed salad leaves (200 g)', 'Cherry tomatoes (400 g)', 'Courgette (2)', 'Carrots (750 g)'],
    dairy: ['Skimmed milk (2 L)', 'Low-fat cottage cheese (300 g)'],
    extras: ['Olive oil (small bottle)', 'Hummus (200 g)', 'Mixed berries frozen (500 g)', 'Almonds (100 g)', 'Honey (jar)'],
  },
  '1800-calorie-meal-plan': {
    protein: ['Chicken breast (1.2 kg)', 'Tinned tuna (4 cans)', 'Eggs (12)', 'Greek yogurt (500 g)', 'Turkey mince (500 g)'],
    carbs: ['Rolled oats (1 kg)', 'Wholemeal bread (800 g)', 'Basmati rice (500 g)', 'Sweet potatoes (1 kg)', 'Wholemeal pasta (500 g)'],
    vegetables: ['Broccoli (500 g)', 'Spinach (200 g)', 'Mixed peppers (500 g)', 'Cherry tomatoes (400 g)', 'Courgette (2)', 'Carrots (750 g)'],
    dairy: ['Semi-skimmed milk (2 L)', 'Low-fat Greek yogurt (500 g)'],
    extras: ['Olive oil (small bottle)', 'Pesto (190 g jar)', 'Mixed berries frozen (500 g)', 'Peanut butter (340 g)', 'Banana (5–6)'],
  },
  '2000-calorie-meal-plan': {
    protein: ['Chicken breast (1.2 kg)', 'Salmon fillets (4)', 'Eggs (12)', 'Greek yogurt (500 g)', 'Lean beef mince (500 g)'],
    carbs: ['Rolled oats (1 kg)', 'Wholemeal bread (800 g)', 'Brown rice (1 kg)', 'Sweet potatoes (1 kg)', 'Wholemeal pasta (500 g)'],
    vegetables: ['Broccoli (500 g)', 'Spinach (200 g)', 'Mixed peppers (500 g)', 'Avocado (2)', 'Carrots (750 g)', 'Green beans (300 g)'],
    dairy: ['Semi-skimmed milk (2 L)', 'Cheddar low-fat (200 g)', 'Greek yogurt (500 g)'],
    extras: ['Olive oil (small bottle)', 'Nuts mixed (150 g)', 'Banana (6)', 'Dark chocolate 85% (100 g)', 'Tinned tomatoes (2 cans)'],
  },
  'high-protein-low-calorie-meal-plan': {
    protein: ['Chicken breast (1.5 kg)', 'Tinned tuna (6 cans)', 'Eggs (18)', 'Greek yogurt 0% fat (2 × 500 g)', 'Cottage cheese (500 g)', 'Protein powder (bag)'],
    carbs: ['Rolled oats (1 kg)', 'Brown rice (500 g)', 'Wholemeal bread (800 g)', 'Lentils (500 g)', 'Edamame (300 g frozen)'],
    vegetables: ['Broccoli (1 kg)', 'Spinach (400 g)', 'Asparagus (300 g)', 'Green beans (300 g)', 'Cucumber (2)', 'Cherry tomatoes (400 g)'],
    dairy: ['Skimmed milk (2 L)', '0% fat Greek yogurt (1 kg)'],
    extras: ['Olive oil spray', 'Soy sauce low-sodium', 'Lemon (4)', 'Garlic bulb', 'Mixed herbs'],
  },
  'tesco-low-calorie-meal-plan': {
    protein: ['Tesco Lean Chicken Breast Fillets (1 kg)', 'Tesco Tinned Tuna in Spring Water (4 × 145 g)', 'Tesco Free Range Eggs (12)', 'Tesco Low Fat Greek Style Yogurt (500 g)', 'Tesco Turkey Breast Steak (400 g)'],
    carbs: ['Tesco Rolled Oats (1 kg)', 'Tesco Wholemeal Sliced Bread (800 g)', 'Tesco Easy Cook Brown Rice (1 kg)', 'Tesco Sweet Potatoes (1 kg)', 'Tesco Wholewheat Pasta (500 g)'],
    vegetables: ['Tesco Broccoli (500 g)', 'Tesco Baby Spinach (200 g)', 'Tesco Salad Bag (200 g)', 'Tesco Cherry Tomatoes (400 g)', 'Tesco Frozen Mixed Veg (1 kg)'],
    dairy: ['Tesco Skimmed Milk (2 L)', 'Tesco Lighter Cheddar (250 g)'],
    extras: ['Tesco Olive Oil (500 ml)', 'Tesco Reduced Fat Hummus (200 g)', 'Tesco Frozen Mixed Berries (750 g)', 'Tesco Wholemeal Pitta Breads (6 pack)'],
  },
  'vegetarian-low-calorie-meal-plan': {
    protein: ['Tofu firm (2 × 400 g)', 'Eggs (18)', 'Greek yogurt 0% (1 kg)', 'Cottage cheese (500 g)', 'Tinned chickpeas (4 cans)', 'Red lentils (500 g)'],
    carbs: ['Rolled oats (1 kg)', 'Wholemeal bread (800 g)', 'Brown rice (500 g)', 'Sweet potatoes (1 kg)', 'Quinoa (500 g)'],
    vegetables: ['Broccoli (500 g)', 'Spinach (400 g)', 'Mixed peppers (500 g)', 'Courgette (3)', 'Cherry tomatoes (400 g)', 'Mushrooms (500 g)', 'Kale (200 g)'],
    dairy: ['Skimmed milk (2 L)', 'Low-fat cheese (200 g)'],
    extras: ['Olive oil', 'Tinned tomatoes (4 cans)', 'Soy sauce', 'Tahini (jar)', 'Lemon (4)', 'Garlic bulb', 'Nutritional yeast (100 g)'],
  },
  'aldi-low-calorie-meal-plan': {
    protein: ['Aldi Lean Chicken Breast Fillets (1 kg)', 'Aldi Tinned Tuna in Spring Water (4 × 145 g)', 'Aldi Free Range Eggs (12)', 'Aldi Low Fat Greek Style Yogurt (500 g)', 'Aldi Turkey Breast Steak (400 g)'],
    carbs: ['Aldi Rolled Oats (1 kg)', 'Aldi Wholemeal Sliced Bread (800 g)', 'Aldi Easy Cook Brown Rice (1 kg)', 'Aldi Sweet Potatoes (1 kg)', 'Aldi Wholewheat Pasta (500 g)'],
    vegetables: ['Aldi Broccoli (500 g)', 'Aldi Baby Spinach (200 g)', 'Aldi Salad Bag (200 g)', 'Aldi Cherry Tomatoes (400 g)', 'Aldi Frozen Mixed Veg (1 kg)'],
    dairy: ['Aldi Skimmed Milk (2 L)', 'Aldi Lighter Cheddar (250 g)'],
    extras: ['Aldi Olive Oil (500 ml)', 'Aldi Reduced Fat Hummus (200 g)', 'Aldi Frozen Mixed Berries (750 g)', 'Aldi Wholemeal Pitta Breads (6 pack)'],
  },
  'vegan-low-calorie-meal-plan': {
    protein: ['Firm tofu (2 × 400 g)', 'Silken tofu (400 g)', 'Tinned chickpeas (6 cans)', 'Tinned black beans (4 cans)', 'Red lentils (500 g)', 'Green lentils (500 g)', 'Peanut butter natural (340 g)', 'Hemp seeds (200 g)'],
    carbs: ['Rolled oats (1 kg)', 'Wholemeal bread (800 g)', 'Brown rice (500 g)', 'Sweet potatoes (1 kg)', 'Quinoa (500 g)', 'Wholemeal pasta (500 g)'],
    vegetables: ['Broccoli (500 g)', 'Spinach (400 g)', 'Mixed peppers (500 g)', 'Courgette (3)', 'Cherry tomatoes (400 g)', 'Mushrooms (500 g)', 'Butternut squash (1)'],
    plantbased: ['Soy milk (1 L)', 'Oat milk (1 L)', 'Coconut milk tinned (2 cans)', 'Dairy-free yogurt (500 g)'],
    extras: ['Olive oil', 'Tinned tomatoes (4 cans)', 'Soy sauce low-sodium', 'Tahini (jar)', 'Almond butter (jar)', 'Lemon (4)', 'Garlic bulb', 'Nutritional yeast (100 g)'],
  },
};

const PLAN_1500 = [
  { day: 'Monday', meals: [
    { type: 'Breakfast', name: 'Overnight Oats with Berries', kcal: 340, protein: 14, prep: '5 min', desc: 'Rolled oats soaked overnight in skimmed milk, topped with frozen berries and a drizzle of honey.' },
    { type: 'Lunch', name: 'Tuna & Sweetcorn Jacket Potato', kcal: 420, protein: 35, prep: '10 min', desc: 'Medium baked potato topped with tinned tuna mixed with sweetcorn and a teaspoon of light mayo.' },
    { type: 'Dinner', name: 'Grilled Chicken with Roasted Mediterranean Veg', kcal: 540, protein: 48, prep: '25 min', desc: 'Chicken breast grilled with courgette, peppers, and cherry tomatoes, served with a small portion of brown rice.' },
    { type: 'Snack', name: 'Greek Yogurt with Blueberries', kcal: 200, protein: 15, prep: '2 min', desc: 'Low-fat Greek yogurt topped with fresh or frozen blueberries.' },
  ], totals: { kcal: 1500, protein: 112 } },
  { day: 'Tuesday', meals: [
    { type: 'Breakfast', name: 'Scrambled Eggs on Wholemeal Toast', kcal: 350, protein: 22, prep: '10 min', desc: 'Two eggs scrambled with a handful of spinach, served on a slice of wholemeal toast.' },
    { type: 'Lunch', name: 'Homemade Lentil Soup', kcal: 380, protein: 18, prep: '30 min', desc: 'Red lentil and carrot soup seasoned with cumin and coriander, served with a small wholemeal roll.' },
    { type: 'Dinner', name: 'Baked Salmon with Broccoli & New Potatoes', kcal: 570, protein: 45, prep: '20 min', desc: 'Salmon fillet baked with lemon and dill, served with steamed broccoli and boiled new potatoes.' },
    { type: 'Snack', name: 'Apple & Almonds', kcal: 200, protein: 5, prep: '1 min', desc: 'One medium apple and 20 g of unsalted almonds.' },
  ], totals: { kcal: 1500, protein: 90 } },
  { day: 'Wednesday', meals: [
    { type: 'Breakfast', name: 'Banana & Oat Smoothie', kcal: 370, protein: 14, prep: '5 min', desc: 'Blended banana, 50 g oats, skimmed milk, and a teaspoon of peanut butter.' },
    { type: 'Lunch', name: 'Grilled Chicken Caesar Salad', kcal: 400, protein: 40, prep: '10 min', desc: 'Chicken breast strips over romaine lettuce with a light Caesar dressing and Parmesan shavings. No croutons.' },
    { type: 'Dinner', name: 'Turkey Mince Chilli with Brown Rice', kcal: 530, protein: 42, prep: '25 min', desc: 'Lean turkey mince cooked with tinned tomatoes, kidney beans, and chilli spices. Served with brown rice.' },
    { type: 'Snack', name: 'Carrot Sticks & Hummus', kcal: 200, protein: 6, prep: '2 min', desc: '100 g carrot sticks with 40 g reduced-fat hummus.' },
  ], totals: { kcal: 1500, protein: 102 } },
  { day: 'Thursday', meals: [
    { type: 'Breakfast', name: 'Porridge with Walnuts & Cinnamon', kcal: 350, protein: 12, prep: '5 min', desc: '50 g oats cooked with skimmed milk, topped with 15 g crushed walnuts and a sprinkle of cinnamon.' },
    { type: 'Lunch', name: 'Prawn & Avocado Salad', kcal: 390, protein: 28, prep: '10 min', desc: 'King prawns tossed with mixed leaves, half an avocado, cucumber, and lemon dressing.' },
    { type: 'Dinner', name: 'Chicken Tikka with Cauliflower Rice', kcal: 560, protein: 50, prep: '25 min', desc: 'Marinated chicken tikka baked and served over blitzed cauliflower rice with a side of raita.' },
    { type: 'Snack', name: 'Low-Fat Cottage Cheese with Cucumber', kcal: 200, protein: 20, prep: '2 min', desc: '150 g cottage cheese with sliced cucumber and a grind of black pepper.' },
  ], totals: { kcal: 1500, protein: 110 } },
  { day: 'Friday', meals: [
    { type: 'Breakfast', name: 'Poached Eggs & Smoked Salmon on Toast', kcal: 400, protein: 32, prep: '10 min', desc: 'Two poached eggs and 50 g smoked salmon on a slice of wholemeal toast.' },
    { type: 'Lunch', name: 'Chicken & Vegetable Soup', kcal: 350, protein: 28, prep: '25 min', desc: 'Diced chicken breast simmered with carrots, celery, and leek in a light chicken stock.' },
    { type: 'Dinner', name: 'Baked Cod with Sweet Potato Wedges', kcal: 550, protein: 40, prep: '25 min', desc: 'Cod fillet baked with herbs and lemon, served with oven-roasted sweet potato wedges and green beans.' },
    { type: 'Snack', name: 'Protein Yogurt', kcal: 200, protein: 20, prep: '1 min', desc: 'High-protein low-fat yogurt pot (e.g. Arla Protein or Tesco High Protein Yogurt).' },
  ], totals: { kcal: 1500, protein: 120 } },
  { day: 'Saturday', meals: [
    { type: 'Breakfast', name: 'Wholemeal Pancakes with Berries', kcal: 380, protein: 18, prep: '15 min', desc: 'Two small wholemeal pancakes made with egg and oat flour, topped with berries and low-fat yogurt.' },
    { type: 'Lunch', name: 'Turkey & Avocado Wholemeal Wrap', kcal: 400, protein: 32, prep: '5 min', desc: 'Sliced turkey breast, half an avocado, spinach, and tomato in a wholemeal tortilla wrap.' },
    { type: 'Dinner', name: 'Grilled Lean Beef Steak with Roasted Veg', kcal: 520, protein: 48, prep: '15 min', desc: 'Lean sirloin steak grilled to your liking, with roasted courgette, peppers, and cherry tomatoes.' },
    { type: 'Snack', name: 'Rice Cakes with Peanut Butter', kcal: 200, protein: 8, prep: '2 min', desc: 'Two plain rice cakes spread with natural peanut butter.' },
  ], totals: { kcal: 1500, protein: 106 } },
  { day: 'Sunday', meals: [
    { type: 'Breakfast', name: 'Healthy Full English', kcal: 420, protein: 30, prep: '15 min', desc: 'One egg (grilled or poached), two lean bacon rashers (fat trimmed), grilled tomatoes, mushrooms, and one slice of wholemeal toast.' },
    { type: 'Lunch', name: 'Leftover Steak Salad', kcal: 300, protein: 28, prep: '5 min', desc: 'Sliced leftover steak over mixed leaves with cherry tomatoes and a balsamic dressing.' },
    { type: 'Dinner', name: 'Roast Chicken Breast with Root Veg', kcal: 580, protein: 52, prep: '45 min', desc: 'Roast chicken breast with parsnips, carrots, and a small portion of gravy. A proper Sunday roast, lighter style.' },
    { type: 'Snack', name: 'Protein Shake', kcal: 200, protein: 25, prep: '2 min', desc: 'One scoop of unflavoured or vanilla protein powder mixed with water or skimmed milk.' },
  ], totals: { kcal: 1500, protein: 135 } },
];

const PLAN_1800 = PLAN_1500.map(day => ({
  ...day,
  meals: day.meals.map((m, i) => ({
    ...m,
    kcal: i < 3 ? Math.round(m.kcal * 1.18) : m.kcal,
    desc: m.desc + (i === 0 ? ' Add an extra handful of oats or a banana for more energy.' : i === 1 ? ' Add a wholemeal roll or extra portion of carbs.' : i === 2 ? ' Increase the rice or potato portion by about a third.' : ''),
  })),
  totals: { kcal: 1800, protein: Math.round(day.totals.protein * 1.1) },
}));

const PLAN_2000 = PLAN_1500.map(day => ({
  ...day,
  meals: day.meals.map((m, i) => ({
    ...m,
    kcal: i < 3 ? Math.round(m.kcal * 1.32) : Math.round(m.kcal * 1.15),
    desc: m.desc + (i === 2 ? ' Add a drizzle of olive oil and include a larger portion of complex carbs.' : ''),
  })),
  totals: { kcal: 2000, protein: Math.round(day.totals.protein * 1.15) },
}));

const PLAN_HIGH_PROTEIN = [
  { day: 'Monday', meals: [
    { type: 'Breakfast', name: 'Greek Yogurt Protein Bowl', kcal: 380, protein: 35, prep: '5 min', desc: '200 g 0% Greek yogurt, one scoop protein powder, mixed berries, and 15 g chia seeds.' },
    { type: 'Lunch', name: 'Tuna & Egg White Salad', kcal: 420, protein: 55, prep: '10 min', desc: 'Two tins of tuna with three hard-boiled egg whites, mixed leaves, cucumber, and lemon dressing.' },
    { type: 'Dinner', name: 'Chicken Breast with Lentils & Greens', kcal: 560, protein: 60, prep: '25 min', desc: 'Two chicken breasts served over 100 g cooked green lentils with a side of steamed broccoli and asparagus.' },
    { type: 'Snack', name: 'Cottage Cheese & Cucumber', kcal: 160, protein: 22, prep: '2 min', desc: '200 g low-fat cottage cheese with sliced cucumber and black pepper.' },
  ], totals: { kcal: 1520, protein: 172 } },
  { day: 'Tuesday', meals: [
    { type: 'Breakfast', name: 'Egg White Omelette with Spinach', kcal: 320, protein: 30, prep: '10 min', desc: 'Five egg whites and one yolk, spinach, mushrooms, and cherry tomatoes cooked as an omelette.' },
    { type: 'Lunch', name: 'Chicken & Quinoa Power Bowl', kcal: 450, protein: 50, prep: '15 min', desc: 'Grilled chicken breast sliced over 80 g cooked quinoa with edamame, cucumber, and tahini dressing.' },
    { type: 'Dinner', name: 'Baked Salmon with Asparagus', kcal: 540, protein: 52, prep: '20 min', desc: 'Salmon fillet baked with lemon and herbs, served with a bunch of roasted asparagus and a small side of brown rice.' },
    { type: 'Snack', name: 'Protein Shake & Almonds', kcal: 250, protein: 28, prep: '2 min', desc: 'One scoop protein powder mixed with water, plus 20 g almonds.' },
  ], totals: { kcal: 1560, protein: 160 } },
  { day: 'Wednesday', meals: [
    { type: 'Breakfast', name: 'Overnight Protein Oats', kcal: 370, protein: 32, prep: '5 min', desc: '50 g oats, one scoop vanilla protein powder, skimmed milk, and banana slices.' },
    { type: 'Lunch', name: 'Turkey & Lentil Soup', kcal: 420, protein: 45, prep: '30 min', desc: 'Ground turkey and red lentil soup with spinach and mild spices.' },
    { type: 'Dinner', name: 'Grilled Chicken Tikka Skewers', kcal: 560, protein: 60, prep: '20 min', desc: 'Marinated chicken tikka skewers grilled and served with cauliflower rice and raita.' },
    { type: 'Snack', name: 'Greek Yogurt & Walnuts', kcal: 200, protein: 18, prep: '2 min', desc: '150 g 0% Greek yogurt with 15 g walnuts and a teaspoon of honey.' },
  ], totals: { kcal: 1550, protein: 155 } },
  { day: 'Thursday', meals: [
    { type: 'Breakfast', name: 'Smoked Salmon Scrambled Eggs', kcal: 380, protein: 38, prep: '10 min', desc: 'Three-egg scramble with 75 g smoked salmon and a handful of spinach.' },
    { type: 'Lunch', name: 'Tuna Nicoise Salad', kcal: 430, protein: 50, prep: '10 min', desc: 'Tinned tuna, one boiled egg, green beans, cherry tomatoes, and olives over mixed leaves.' },
    { type: 'Dinner', name: 'Lean Beef Stir-Fry', kcal: 540, protein: 55, prep: '15 min', desc: '200 g lean beef strips stir-fried with broccoli, peppers, and a low-sodium soy sauce. Small portion of brown rice.' },
    { type: 'Snack', name: 'Edamame Pods', kcal: 180, protein: 17, prep: '5 min', desc: '200 g edamame pods, lightly salted.' },
  ], totals: { kcal: 1530, protein: 160 } },
  { day: 'Friday', meals: [
    { type: 'Breakfast', name: 'Protein Pancakes', kcal: 360, protein: 35, prep: '15 min', desc: 'Three small pancakes made with one egg, one scoop protein powder, oat flour, and a mashed banana.' },
    { type: 'Lunch', name: 'Chicken & Chickpea Power Salad', kcal: 440, protein: 48, prep: '10 min', desc: 'Grilled chicken breast, 100 g drained chickpeas, cucumber, spinach, and lemon-garlic dressing.' },
    { type: 'Dinner', name: 'Baked Cod with Lentils', kcal: 530, protein: 56, prep: '25 min', desc: 'Baked cod fillet on a bed of 100 g cooked green lentils with roasted tomatoes and a squeeze of lemon.' },
    { type: 'Snack', name: 'Cottage Cheese & Pineapple', kcal: 190, protein: 22, prep: '2 min', desc: '200 g low-fat cottage cheese with a few chunks of tinned pineapple in juice.' },
  ], totals: { kcal: 1520, protein: 161 } },
  { day: 'Saturday', meals: [
    { type: 'Breakfast', name: 'High-Protein Full English', kcal: 400, protein: 40, prep: '15 min', desc: 'Two eggs (grilled), two lean turkey rashers, mushrooms, tomatoes, and no toast.' },
    { type: 'Lunch', name: 'Prawn & Quinoa Bowl', kcal: 450, protein: 48, prep: '10 min', desc: 'King prawns over 80 g quinoa with avocado, cucumber, and a ginger-soy dressing.' },
    { type: 'Dinner', name: 'Turkey Burger with Salad', kcal: 530, protein: 52, prep: '20 min', desc: '200 g lean turkey burger patty in a wholemeal bun with lettuce, tomato, and Greek yogurt sauce.' },
    { type: 'Snack', name: 'Protein Shake', kcal: 180, protein: 25, prep: '2 min', desc: 'One scoop whey protein mixed with water.' },
  ], totals: { kcal: 1560, protein: 165 } },
  { day: 'Sunday', meals: [
    { type: 'Breakfast', name: 'Eggs Florentine (lighter)', kcal: 380, protein: 32, prep: '15 min', desc: 'Two poached eggs on a bed of wilted spinach on wholemeal toast — no hollandaise.' },
    { type: 'Lunch', name: 'Chicken & Vegetable Stew', kcal: 430, protein: 48, prep: '30 min', desc: 'Diced chicken breast slow-simmered with carrots, celery, and lentils.' },
    { type: 'Dinner', name: 'Roast Chicken & Roasted Veg', kcal: 560, protein: 58, prep: '45 min', desc: 'Roast skinless chicken breast with parsnips, carrots, and green beans. Lean high-protein Sunday roast.' },
    { type: 'Snack', name: 'Greek Yogurt & Berries', kcal: 180, protein: 18, prep: '2 min', desc: '150 g 0% Greek yogurt with mixed berries.' },
  ], totals: { kcal: 1550, protein: 156 } },
];

const PLAN_TESCO = PLAN_1500.map(day => ({
  ...day,
  meals: day.meals.map(m => ({
    ...m,
    desc: m.desc.replace('brown rice', 'Tesco Easy Cook Brown Rice').replace('wholemeal toast', "Tesco Wholemeal Sliced Bread").replace('Greek yogurt', 'Tesco Low Fat Greek Style Yogurt').replace('oats', 'Tesco Rolled Oats').replace('skimmed milk', 'Tesco Skimmed Milk'),
  })),
}));

const PLAN_ALDI = PLAN_1500.map(day => ({
  ...day,
  meals: day.meals.map(m => ({
    ...m,
    desc: m.desc.replace('brown rice', 'Aldi Easy Cook Brown Rice').replace('wholemeal toast', "Aldi Wholemeal Sliced Bread").replace('Greek yogurt', 'Aldi Low Fat Greek Style Yogurt').replace('oats', 'Aldi Rolled Oats').replace('skimmed milk', 'Aldi Skimmed Milk'),
  })),
}));

const PLAN_VEGAN = [
  { day: 'Monday', meals: [
    { type: 'Breakfast', name: 'Oat & Banana Smoothie Bowl', kcal: 360, protein: 14, prep: '5 min', desc: '50 g oats, banana, soy milk, 1 tbsp almond butter, topped with berries and granola.' },
    { type: 'Lunch', name: 'Chickpea & Spinach Salad', kcal: 420, protein: 18, prep: '10 min', desc: 'Tinned chickpeas, baby spinach, cherry tomatoes, cucumber, red onion, and tahini-lemon dressing.' },
    { type: 'Dinner', name: 'Tofu Stir-Fry with Brown Rice', kcal: 520, protein: 26, prep: '20 min', desc: 'Firm tofu cubes stir-fried with broccoli, peppers, and low-sodium soy sauce, served on brown rice.' },
    { type: 'Snack', name: 'Coconut Yogurt & Berries', kcal: 200, protein: 4, prep: '2 min', desc: '200 g dairy-free coconut or oat yogurt with a handful of mixed berries.' },
  ], totals: { kcal: 1500, protein: 62 } },
  { day: 'Tuesday', meals: [
    { type: 'Breakfast', name: 'Tofu Scramble on Wholemeal Toast', kcal: 350, protein: 18, prep: '10 min', desc: 'Crumbled firm tofu sautéed with turmeric, spinach, and cherry tomatoes, on wholemeal toast.' },
    { type: 'Lunch', name: 'Red Lentil & Vegetable Soup', kcal: 370, protein: 16, prep: '30 min', desc: 'Thick red lentil soup with cumin, turmeric, carrot, and onion, with wholemeal bread.' },
    { type: 'Dinner', name: 'Mushroom & Lentil Bolognese', kcal: 530, protein: 22, prep: '25 min', desc: 'Finely chopped mushrooms and green lentils in a rich tomato sauce, served over wholemeal spaghetti.' },
    { type: 'Snack', name: 'Apple & Almond Butter', kcal: 250, protein: 8, prep: '2 min', desc: 'One apple sliced and served with one tablespoon of natural almond butter.' },
  ], totals: { kcal: 1500, protein: 64 } },
  { day: 'Wednesday', meals: [
    { type: 'Breakfast', name: 'Overnight Oats with Nut Butter', kcal: 380, protein: 14, prep: '5 min', desc: '50 g oats soaked in oat milk with a tablespoon of tahini and banana slices.' },
    { type: 'Lunch', name: 'Tofu & Quinoa Buddha Bowl', kcal: 450, protein: 20, prep: '15 min', desc: 'Baked marinated tofu over 80 g quinoa with roasted peppers, cucumber, avocado, and tahini dressing.' },
    { type: 'Dinner', name: 'Black Bean & Sweet Potato Curry', kcal: 480, protein: 18, prep: '25 min', desc: 'Black beans and diced sweet potato in a coconut milk curry sauce with spinach and brown rice.' },
    { type: 'Snack', name: 'Hummus & Veggie Sticks', kcal: 190, protein: 8, prep: '2 min', desc: '40 g hummus with 100 g carrot and cucumber sticks.' },
  ], totals: { kcal: 1500, protein: 60 } },
  { day: 'Thursday', meals: [
    { type: 'Breakfast', name: 'Smoothie with Hemp Seeds', kcal: 340, protein: 16, prep: '5 min', desc: 'Blended banana, oat milk, 1 scoop plant-based protein powder, 2 tbsp hemp seeds, and berries.' },
    { type: 'Lunch', name: 'Black Bean Tacos', kcal: 430, protein: 16, prep: '15 min', desc: 'Spiced black beans in two small wholemeal tortillas with shredded cabbage, salsa, avocado, and dairy-free sour cream.' },
    { type: 'Dinner', name: 'Tofu & Lentil Curry', kcal: 530, protein: 28, prep: '25 min', desc: 'Silken tofu with green lentils in a tomato-based curry sauce, served with a small portion of brown rice.' },
    { type: 'Snack', name: 'Mixed Nuts & Berries', kcal: 200, protein: 7, prep: '1 min', desc: '30 g mixed unsalted nuts with a small handful of dried berries.' },
  ], totals: { kcal: 1500, protein: 67 } },
  { day: 'Friday', meals: [
    { type: 'Breakfast', name: 'Avocado Toast with Nutritional Yeast', kcal: 400, protein: 12, prep: '10 min', desc: 'Two slices wholemeal toast topped with half an avocado, tomato, and nutritional yeast.' },
    { type: 'Lunch', name: 'Tofu Caesar Salad', kcal: 390, protein: 22, prep: '10 min', desc: 'Crispy baked tofu cubes over romaine lettuce with plant-based Caesar dressing and nutritional yeast.' },
    { type: 'Dinner', name: 'Vegetarian Chilli (Vegan)', kcal: 510, protein: 24, prep: '25 min', desc: 'Kidney beans, black beans, and lentils in a smoky tomato chilli, served with brown rice.' },
    { type: 'Snack', name: 'Tahini & Carrot Sticks', kcal: 200, protein: 8, prep: '2 min', desc: '40 g tahini with 150 g carrot sticks for dipping.' },
  ], totals: { kcal: 1500, protein: 66 } },
  { day: 'Saturday', meals: [
    { type: 'Breakfast', name: 'Tofu Scramble with Mushrooms', kcal: 360, protein: 20, prep: '10 min', desc: 'Crumbled tofu sautéed with mushrooms, spinach, and nutritional yeast for a cheesy flavour.' },
    { type: 'Lunch', name: 'Lentil & Roasted Veg Bowl', kcal: 420, protein: 18, prep: '30 min', desc: 'Roasted butternut squash, courgette, and peppers over green lentils with tahini dressing.' },
    { type: 'Dinner', name: 'Chickpea & Vegetable Curry', kcal: 530, protein: 20, prep: '25 min', desc: 'Tinned chickpeas with spinach, tomato, and coconut milk in a fragrant curry, with brown rice.' },
    { type: 'Snack', name: 'Energy Balls (homemade)', kcal: 190, protein: 8, prep: '15 min', desc: 'Dates, walnuts, and cacao blended and rolled into balls (~3 balls, 30 g).' },
  ], totals: { kcal: 1500, protein: 66 } },
  { day: 'Sunday', meals: [
    { type: 'Breakfast', name: 'Banana Oat Pancakes', kcal: 380, protein: 12, prep: '15 min', desc: 'Two pancakes made with mashed banana, 50 g oats, soy milk, and a sprinkle of cinnamon.' },
    { type: 'Lunch', name: 'Tomato & Chickpea Salad', kcal: 400, protein: 16, prep: '10 min', desc: 'Cherry tomatoes, basil, chickpeas, rocket, and olive oil-balsamic dressing.' },
    { type: 'Dinner', name: 'Lentil Bolognese with Wholemeal Pasta', kcal: 520, protein: 24, prep: '30 min', desc: 'Brown lentils in a rich tomato sauce with mushrooms and herbs, served over wholemeal pasta.' },
    { type: 'Snack', name: 'Peanut Butter & Banana', kcal: 200, protein: 8, prep: '2 min', desc: 'Banana with two tablespoons of natural peanut butter.' },
  ], totals: { kcal: 1500, protein: 60 } },
];

const PLAN_VEGETARIAN = [
  { day: 'Monday', meals: [
    { type: 'Breakfast', name: 'Oat & Chia Seed Porridge', kcal: 360, protein: 14, prep: '5 min', desc: '50 g oats cooked with soy milk, 1 tbsp chia seeds, topped with sliced banana and a drizzle of honey.' },
    { type: 'Lunch', name: 'Chickpea & Spinach Salad', kcal: 420, protein: 20, prep: '10 min', desc: 'Tinned chickpeas, baby spinach, cherry tomatoes, cucumber, red onion, and lemon-tahini dressing.' },
    { type: 'Dinner', name: 'Tofu & Vegetable Stir-Fry', kcal: 520, protein: 28, prep: '20 min', desc: 'Firm tofu cubes stir-fried with broccoli, peppers, and soy sauce, served on brown rice.' },
    { type: 'Snack', name: 'Greek Yogurt & Berries', kcal: 200, protein: 15, prep: '2 min', desc: '200 g low-fat Greek yogurt with a handful of mixed berries.' },
  ], totals: { kcal: 1500, protein: 77 } },
  { day: 'Tuesday', meals: [
    { type: 'Breakfast', name: 'Scrambled Eggs on Wholemeal Toast', kcal: 350, protein: 22, prep: '10 min', desc: 'Two eggs scrambled with spinach and cherry tomatoes, on a slice of wholemeal toast.' },
    { type: 'Lunch', name: 'Red Lentil Soup', kcal: 370, protein: 18, prep: '30 min', desc: 'Thick red lentil soup with cumin, turmeric, and a wedge of wholemeal bread.' },
    { type: 'Dinner', name: 'Mushroom & Lentil Bolognese', kcal: 530, protein: 24, prep: '25 min', desc: 'Finely chopped mushrooms and green lentils in a rich tomato sauce, served over wholemeal spaghetti.' },
    { type: 'Snack', name: 'Apple & Peanut Butter', kcal: 250, protein: 7, prep: '2 min', desc: 'One apple sliced and served with one tablespoon of natural peanut butter.' },
  ], totals: { kcal: 1500, protein: 71 } },
  { day: 'Wednesday', meals: [
    { type: 'Breakfast', name: 'Overnight Oats with Nut Butter', kcal: 380, protein: 16, prep: '5 min', desc: '50 g oats soaked in oat milk with a tablespoon of almond butter and banana slices.' },
    { type: 'Lunch', name: 'Halloumi & Quinoa Salad', kcal: 450, protein: 26, prep: '15 min', desc: 'Grilled reduced-fat halloumi over 80 g quinoa with roasted peppers, cucumber, and mint dressing.' },
    { type: 'Dinner', name: 'Egg & Sweet Potato Frittata', kcal: 480, protein: 28, prep: '25 min', desc: 'Four-egg frittata baked with diced sweet potato, spinach, and feta cheese.' },
    { type: 'Snack', name: 'Cottage Cheese & Cucumber', kcal: 190, protein: 18, prep: '2 min', desc: '200 g low-fat cottage cheese with sliced cucumber.' },
  ], totals: { kcal: 1500, protein: 88 } },
  { day: 'Thursday', meals: [
    { type: 'Breakfast', name: 'Yogurt Parfait', kcal: 340, protein: 20, prep: '5 min', desc: 'Layered 0% Greek yogurt, granola (30 g), and mixed berries.' },
    { type: 'Lunch', name: 'Black Bean Tacos', kcal: 430, protein: 22, prep: '15 min', desc: 'Spiced black beans in two small wholemeal tortillas with shredded cabbage, salsa, and low-fat sour cream.' },
    { type: 'Dinner', name: 'Paneer & Spinach Curry', kcal: 530, protein: 30, prep: '25 min', desc: 'Low-fat paneer with spinach in a tomato-based curry sauce, served with a small portion of brown rice.' },
    { type: 'Snack', name: 'Hummus & Carrot Sticks', kcal: 200, protein: 7, prep: '2 min', desc: '40 g hummus with 100 g carrot sticks.' },
  ], totals: { kcal: 1500, protein: 79 } },
  { day: 'Friday', meals: [
    { type: 'Breakfast', name: 'Avocado & Egg Toast', kcal: 400, protein: 20, prep: '10 min', desc: 'Two slices wholemeal toast topped with half a mashed avocado and one poached egg.' },
    { type: 'Lunch', name: 'Tofu Caesar Salad', kcal: 390, protein: 24, prep: '10 min', desc: 'Crispy baked tofu cubes over romaine lettuce with a light Caesar-style dressing and Parmesan.' },
    { type: 'Dinner', name: 'Vegetarian Chilli', kcal: 510, protein: 26, prep: '25 min', desc: 'Kidney beans, black beans, and sweetcorn in a smoky tomato chilli. Served with brown rice.' },
    { type: 'Snack', name: 'Protein Yogurt & Walnuts', kcal: 200, protein: 14, prep: '2 min', desc: 'Protein yogurt pot with 15 g crushed walnuts.' },
  ], totals: { kcal: 1500, protein: 84 } },
  { day: 'Saturday', meals: [
    { type: 'Breakfast', name: 'Spinach & Feta Omelette', kcal: 360, protein: 28, prep: '10 min', desc: 'Three-egg omelette with wilted spinach, 30 g reduced-fat feta, and cherry tomatoes.' },
    { type: 'Lunch', name: 'Lentil & Roasted Veg Bowl', kcal: 420, protein: 22, prep: '30 min', desc: 'Roasted butternut squash, courgette, and peppers over green lentils with a tahini dressing.' },
    { type: 'Dinner', name: 'Mushroom Risotto (lighter)', kcal: 530, protein: 18, prep: '35 min', desc: 'Arborio rice cooked with mixed mushrooms, low-fat crème fraîche, and Parmesan. Smaller portion.' },
    { type: 'Snack', name: 'Edamame Pods', kcal: 190, protein: 16, prep: '5 min', desc: '200 g edamame pods, lightly salted.' },
  ], totals: { kcal: 1500, protein: 84 } },
  { day: 'Sunday', meals: [
    { type: 'Breakfast', name: 'Banana Protein Pancakes', kcal: 380, protein: 22, prep: '15 min', desc: 'Two pancakes made with mashed banana, two eggs, oat flour, and a sprinkle of cinnamon.' },
    { type: 'Lunch', name: 'Caprese & Chickpea Salad', kcal: 400, protein: 22, prep: '10 min', desc: 'Buffalo mozzarella, tomato, basil, and chickpeas drizzled with olive oil and balsamic glaze.' },
    { type: 'Dinner', name: 'Nut Roast with Roasted Veg', kcal: 520, protein: 24, prep: '45 min', desc: 'Homemade walnut and lentil nut roast with roasted carrots, parsnips, and a vegetarian gravy.' },
    { type: 'Snack', name: 'Greek Yogurt & Honey', kcal: 200, protein: 15, prep: '2 min', desc: '200 g 0% Greek yogurt with a teaspoon of honey and a sprinkle of seeds.' },
  ], totals: { kcal: 1500, protein: 83 } },
];

export const mealPlansData = {
  '1500-calorie-meal-plan': {
    title: '1500 Calorie Meal Plan UK | Free 7-Day Weight Loss Plan',
    description: 'Browse a free 1500 calorie UK meal plan with simple high-protein meals, calories, prep times, and supermarket-friendly ingredients.',
    h1: '1500 Calorie Meal Plan UK — Free 7-Day Weight Loss Guide',
    planLabel: '1500 Calorie',
    targetCalories: 1500,
    intro: 'A 1,500 calorie meal plan is one of the most popular choices for weight loss in the UK. For most women and smaller-framed men, eating 1,500 calories per day creates a meaningful calorie deficit that supports steady fat loss of around 0.5–1 kg per week — without the hunger and fatigue that come with more extreme restriction. This guide gives you a complete, ready-to-use 7-day plan built around everyday UK supermarket ingredients.',
    whyThisPlan: 'A 1,500 calorie target works well for people whose Total Daily Energy Expenditure (TDEE) sits between 1,800 and 2,200 calories — common for women aged 25–55 with moderate activity levels and lighter men. At 1,500 calories you create a deficit of 300–700 calories per day, which over a week amounts to 2,100–4,900 calories — enough to lose 0.3–0.7 kg of body fat. This plan prioritises protein (90–120 g per day) to keep you feeling full, preserve muscle mass, and support an active lifestyle.',
    tips: [
      'Weigh your portions for the first week to calibrate your eye. A digital kitchen scale costs under £10 and removes all guesswork.',
      'Batch-cook proteins like chicken breast and hard-boiled eggs at the weekend so weekday lunches take under five minutes.',
      'Keep low-calorie snacks visible in the fridge — Greek yogurt, carrot sticks, and cottage cheese are all under 200 kcal.',
      'Drink 2–3 litres of water per day. Thirst is often mistaken for hunger.',
      'If you are hungry, bulk up meals with non-starchy vegetables (spinach, cucumber, courgette) — they add volume for almost no calories.',
    ],
    faq: [
      { q: 'Is 1500 calories a day enough?', a: 'For most adults seeking weight loss, yes. 1,500 calories provides enough energy and nutrients when the diet is high in protein and includes a wide variety of vegetables. Active individuals or those over 90 kg may need to increase to 1,800 calories.' },
      { q: 'How much weight will I lose on 1500 calories?', a: 'Most people lose 0.5–1 kg per week on a 1,500 calorie diet, assuming their TDEE is around 2,000–2,200 calories. Results vary based on starting weight, activity level, and metabolic rate.' },
      { q: 'Can I swap meals around?', a: 'Absolutely. Each day is planned to hit the 1,500 calorie target, but you can mix and match days or repeat favourite days without issue.' },
    ],
    related: [
      { slug: '1800-calorie-meal-plan', label: '1800 Calorie Meal Plan' },
      { slug: 'high-protein-low-calorie-meal-plan', label: 'High Protein Low Calorie Plan' },
      { slug: 'tesco-low-calorie-meal-plan', label: 'Tesco Meal Plan' },
      { slug: 'vegetarian-low-calorie-meal-plan', label: 'Vegetarian Meal Plan' },
    ],
    blogLinks: [
      { path: '/blog/how-to-build-a-calorie-deficit', label: 'How to Build a Calorie Deficit' },
      { path: '/blog/how-to-meal-plan-for-weight-loss', label: 'How to Meal Plan for Weight Loss' },
    ],
    plan: PLAN_1500,
    shoppingList: BASE_SHOPPING['1500-calorie-meal-plan'],
    priceEstimate: '£40–50 per week',
  },

  '1800-calorie-meal-plan': {
    title: '1800 Calorie Meal Plan UK | Free 7-Day High Protein Plan',
    description: 'A free 1800 calorie UK meal plan for weight loss, with filling meals, protein estimates, and practical supermarket ingredients.',
    h1: '1800 Calorie Meal Plan UK — Free 7-Day High Protein Guide',
    planLabel: '1800 Calorie',
    targetCalories: 1800,
    intro: 'An 1,800 calorie meal plan is one of the most widely recommended targets for sustainable weight loss in the UK. It is particularly effective for women who are moderately to very active, and for men who are sedentary or lightly active. Eating 1,800 calories per day typically creates a 300–600 calorie deficit — enough to lose 0.3–0.6 kg of fat per week without the energy crashes associated with more aggressive cuts. This plan is built around familiar UK supermarket ingredients to keep both the cooking and the shopping straightforward.',
    whyThisPlan: 'At 1,800 calories, you have enough room to eat satisfying, varied meals — three proper meals a day with room for a snack. This makes the plan far more sustainable than 1,200 or 1,500 calorie approaches. The meals in this plan are built around a protein target of 100–130 g per day, with the remaining calories split between complex carbohydrates and healthy fats. High protein keeps hunger at bay, while the carb allowance gives you enough energy for exercise and daily life.',
    tips: [
      'Start with a protein-rich breakfast to reduce cravings throughout the day. Eggs, Greek yogurt, and oats are ideal.',
      'Prepare your lunch the night before to avoid reaching for higher-calorie convenience options at work.',
      'Use your snack allowance strategically — eat it when you are most hungry to prevent overeating at the next meal.',
      'Track your food in an app for the first two weeks. Even experienced calorie counters are often surprised by portion sizes.',
      'Add a 20–30 minute walk after dinner to increase your calorie burn without affecting your appetite significantly.',
    ],
    faq: [
      { q: 'Who should follow an 1800 calorie diet?', a: 'An 1,800 calorie diet works well for women who are moderately active, men who are sedentary, and anyone who found 1,500 calories too restrictive. It creates a steady deficit without leaving you constantly hungry.' },
      { q: 'Can men lose weight on 1800 calories?', a: 'Yes, particularly sedentary or lightly active men. Very active men may need to increase to 2,000–2,200 calories to maintain a deficit without losing energy.' },
      { q: 'Is 1800 calories too low for muscle building?', a: 'For most people, 1,800 calories while weight training will result in fat loss with some muscle maintenance. To build muscle, you generally need to eat at or above your TDEE.' },
    ],
    related: [
      { slug: '1500-calorie-meal-plan', label: '1500 Calorie Meal Plan' },
      { slug: '2000-calorie-meal-plan', label: '2000 Calorie Meal Plan' },
      { slug: 'high-protein-low-calorie-meal-plan', label: 'High Protein Plan' },
    ],
    blogLinks: [
      { path: '/blog/how-to-build-a-calorie-deficit', label: 'How to Build a Calorie Deficit' },
      { path: '/blog/how-to-meal-plan-for-weight-loss', label: 'How to Meal Plan for Weight Loss' },
    ],
    plan: PLAN_1800,
    shoppingList: BASE_SHOPPING['1800-calorie-meal-plan'],
    priceEstimate: '£45–55 per week',
  },

  '2000-calorie-meal-plan': {
    title: '2000 Calorie Meal Plan UK | Free 7-Day Meal Plan',
    description: 'A simple 2000 calorie UK meal plan for active people wanting structure, high-protein meals, and a practical shopping list.',
    h1: '2000 Calorie Meal Plan UK — Free 7-Day Balanced Guide',
    planLabel: '2000 Calorie',
    targetCalories: 2000,
    intro: 'A 2,000 calorie meal plan is ideal for people looking to maintain their weight, create only a very gentle deficit, or fuel an active lifestyle while eating cleanly. It is widely used by active men as a weight-loss target and by active women as a maintenance target. At 2,000 calories per day, there is plenty of room for nutritious, satisfying meals that include healthy fats, complex carbohydrates, and lean protein. This plan uses everyday UK supermarket ingredients and is designed to be enjoyed — not endured.',
    whyThisPlan: 'The UK government recommends 2,000 calories per day as a reference intake for the average adult. In practice, how much you need depends on your size and how active you are. For very active individuals, 2,000 calories may still represent a moderate deficit. For sedentary adults, it may be at or above maintenance. This plan maximises the nutritional quality of those 2,000 calories — prioritising whole grains, lean proteins, and a wide range of vegetables to give you energy, support recovery from exercise, and keep you feeling great.',
    tips: [
      'At 2,000 calories you have more flexibility. Use it to include healthy fats like avocado, nuts, and olive oil that are often cut on lower-calorie plans.',
      'This is a good calorie level for people who exercise 3–5 times per week — you should have enough energy to perform well and recover properly.',
      'Include at least five portions of fruit and vegetables every day. The variety of nutrients supports overall health alongside weight management.',
      'Choose whole-grain versions of bread, pasta, and rice wherever possible. They have more fibre, keeping you fuller for longer.',
      'Consider timing larger carbohydrate portions around your workouts for better energy and recovery.',
    ],
    faq: [
      { q: 'Is 2000 calories enough for an active person?', a: 'For moderately active women, yes. Active men may need 2,200–2,500 calories. Use our generator to set your exact target based on your TDEE.' },
      { q: 'Will I lose weight on 2000 calories?', a: 'Possibly. If your TDEE is above 2,000 calories — common for active or larger adults — then 2,000 creates a deficit and weight loss will follow. Use the generator to personalise your target.' },
      { q: 'What is the difference between 1800 and 2000 calories?', a: 'A 200-calorie difference equates to about one extra serving of oats or rice per day. Over a week that is 1,400 calories — roughly 0.2 kg of fat. The right choice depends on your TDEE and how fast you want to lose weight.' },
    ],
    related: [
      { slug: '1800-calorie-meal-plan', label: '1800 Calorie Meal Plan' },
      { slug: 'high-protein-low-calorie-meal-plan', label: 'High Protein Plan' },
      { slug: 'vegetarian-low-calorie-meal-plan', label: 'Vegetarian Plan' },
    ],
    blogLinks: [
      { path: '/blog/how-to-build-a-calorie-deficit', label: 'How to Build a Calorie Deficit' },
      { path: '/blog/how-to-meal-plan-for-weight-loss', label: 'How to Meal Plan for Weight Loss' },
    ],
    plan: PLAN_2000,
    shoppingList: BASE_SHOPPING['2000-calorie-meal-plan'],
    priceEstimate: '£50–60 per week',
  },

  'high-protein-low-calorie-meal-plan': {
    title: 'High Protein Low Calorie Meal Plan UK | Free 7-Day Guide',
    description: 'A free high protein low calorie meal plan for UK weight loss, designed around simple meals, supermarket ingredients, and practical prep times.',
    h1: 'High Protein Low Calorie Meal Plan UK — Free 7-Day Guide',
    planLabel: 'High Protein Low Calorie',
    targetCalories: 1550,
    intro: 'A high protein low calorie meal plan is the gold standard approach for losing fat while preserving — or even building — lean muscle mass. By keeping calories in a deficit while eating 140–170 g of protein per day, you force your body to burn fat for energy rather than breaking down muscle. This 7-day UK plan delivers 150+ g of protein daily from lean, widely available sources such as chicken breast, tinned tuna, eggs, Greek yogurt, and cottage cheese — all affordable and easy to find in any major UK supermarket.',
    whyThisPlan: 'Protein has the highest thermic effect of any macronutrient — your body burns roughly 25–30% of protein calories just by digesting it. It is also the most satiating macronutrient, meaning gram for gram it keeps you fuller than carbohydrate or fat. Research from the British Journal of Nutrition shows that increasing protein to 25–30% of total calories significantly reduces appetite and late-night snacking. This plan targets approximately 1.8–2.2 g of protein per kg of body weight — at the high end of the recommended range for people losing weight while exercising.',
    tips: [
      'Spread protein intake across all meals rather than concentrating it at dinner. Your body can only synthesise around 30–40 g of protein per meal effectively.',
      'Tinned tuna, boiled eggs, and low-fat cottage cheese are your best friends — all extremely high in protein, low in calories, and require almost no preparation.',
      'Use protein powder strategically, not as a meal replacement, but as an easy top-up to bring a meal\'s protein content up to 30 g+.',
      'Combine protein sources where possible — e.g. chicken with lentils, or eggs with Greek yogurt — for a full amino acid profile.',
      'Track protein, not just calories. Hitting your protein target is more important than tracking every macronutrient on this plan.',
    ],
    faq: [
      { q: 'How much protein do I need per day to lose fat without losing muscle?', a: 'Most research suggests 1.6–2.2 g of protein per kg of body weight. For an 80 kg person, that is 128–176 g per day. This plan targets the higher end to maximise muscle preservation.' },
      { q: 'Is high protein safe for kidneys?', a: 'For healthy adults with no pre-existing kidney conditions, high protein diets are considered safe. If you have kidney disease, consult your GP before increasing protein intake.' },
      { q: 'Can I follow this plan if I do not eat meat?', a: 'Yes, though it requires more planning. High-protein vegetarian sources include eggs, Greek yogurt, cottage cheese, tofu, edamame, and protein powder. See our vegetarian plan for more ideas.' },
    ],
    related: [
      { slug: '1500-calorie-meal-plan', label: '1500 Calorie Plan' },
      { slug: 'vegetarian-low-calorie-meal-plan', label: 'Vegetarian Plan' },
      { slug: '1800-calorie-meal-plan', label: '1800 Calorie Plan' },
    ],
    blogLinks: [
      { path: '/blog/high-protein-low-calorie-meals', label: 'High Protein Low Calorie Meals Guide' },
      { path: '/blog/how-to-build-a-calorie-deficit', label: 'How to Build a Calorie Deficit' },
    ],
    plan: PLAN_HIGH_PROTEIN,
    shoppingList: BASE_SHOPPING['high-protein-low-calorie-meal-plan'],
    priceEstimate: '£45–55 per week',
  },

  'tesco-low-calorie-meal-plan': {
    title: 'Tesco Low Calorie Meal Plan UK | 7-Day Budget Guide',
    description: 'A Tesco-focused low calorie meal plan using affordable UK supermarket ingredients, with meal ideas, calories, protein, and shopping list guidance.',
    h1: 'Tesco Low Calorie Meal Plan UK — Budget 7-Day Guide',
    planLabel: 'Tesco Low Calorie',
    targetCalories: 1500,
    intro: 'Tesco is the UK\'s largest supermarket and one of the best places to find affordable, high-quality ingredients for a calorie-controlled diet. From Tesco Rolled Oats at under £1 a bag to Tesco Lean Chicken Breast Fillets at a competitive price per kilogram, the own-brand range makes healthy eating genuinely accessible on any budget. This 7-day plan is built exclusively around products available at Tesco — including Tesco Finest and Tesco own-brand items — and comes in at an estimated £40–50 per week for one person.',
    whyThisPlan: 'Shopping at a single supermarket simplifies the weekly shop, reduces decision fatigue, and makes it easier to build consistent habits. Tesco\'s Clubcard scheme adds an extra layer of savings — many of the products used in this plan are regularly discounted for Clubcard holders. The plan targets 1,500 calories per day with a strong focus on protein (90–120 g daily) using readily available Tesco products including Tesco Low Fat Greek Style Yogurt, Tesco Tinned Tuna in Spring Water, and Tesco Free Range Eggs.',
    tips: [
      'Download the Tesco app and use the Clubcard. Many of the staples in this plan — chicken, eggs, yogurt — are regularly on Clubcard Price.',
      'Buy in bulk where possible. Tesco Rolled Oats (1 kg) and Tesco Brown Rice (1 kg) are significantly cheaper per 100 g than smaller packs.',
      'Tesco\'s frozen vegetable range is just as nutritious as fresh and significantly cheaper. Frozen broccoli, peas, and mixed veg are perfect for this plan.',
      'Tesco Reduced Fat Hummus and Tesco Low Fat Greek Yogurt are both excellent high-protein, lower-calorie snack options under £2.',
      'Use the Tesco website or app to check Clubcard Prices before shopping and swap to the best-value option on the day.',
    ],
    faq: [
      { q: 'How much does this Tesco meal plan cost per week?', a: 'Approximately £40–50 per week for one person, using Tesco own-brand products and taking advantage of regular Clubcard Prices. Costs will vary with current promotions.' },
      { q: 'Can I use this plan at other supermarkets?', a: 'The ingredients are widely available at Aldi, Sainsbury\'s, Asda, and Morrisons too. Use our generator to create a plan tailored to your preferred store.' },
      { q: 'Does Tesco sell everything I need for this plan?', a: 'Yes. All ingredients are available in a standard large Tesco superstore. Some smaller Express stores may not stock all items, so a larger branch or online order is recommended.' },
    ],
    related: [
      { slug: '1500-calorie-meal-plan', label: '1500 Calorie Plan' },
      { slug: '1800-calorie-meal-plan', label: '1800 Calorie Plan' },
      { slug: 'high-protein-low-calorie-meal-plan', label: 'High Protein Plan' },
      { slug: 'vegetarian-low-calorie-meal-plan', label: 'Vegetarian Plan' },
    ],
    blogLinks: [
      { path: '/blog/tesco-low-calorie-shopping-list', label: 'Tesco Low Calorie Shopping List' },
      { path: '/blog/how-to-meal-plan-for-weight-loss', label: 'How to Meal Plan for Weight Loss' },
    ],
    plan: PLAN_TESCO,
    shoppingList: BASE_SHOPPING['tesco-low-calorie-meal-plan'],
    priceEstimate: '£40–50 per week (Tesco own-brand)',
  },

  'vegetarian-low-calorie-meal-plan': {
    title: 'Vegetarian Low Calorie Meal Plan UK | Free 7-Day Guide',
    description: 'A vegetarian low calorie meal plan for UK shoppers, with high-protein meals using eggs, dairy, tofu, legumes, and simple supermarket ingredients.',
    h1: 'Vegetarian Low Calorie Meal Plan UK — Free 7-Day Guide',
    planLabel: 'Vegetarian Low Calorie',
    targetCalories: 1500,
    intro: 'Losing weight on a vegetarian diet is entirely achievable — and often easier than people expect. Plant-based proteins like eggs, Greek yogurt, tofu, legumes, and cottage cheese are filling, nutritious, and widely available at UK supermarkets. This 7-day vegetarian low calorie meal plan is designed for UK shoppers, targeting 1,500 calories per day with a strong emphasis on protein to keep you satisfied and support a healthy metabolism. Every meal uses ingredients you can pick up at Tesco, Aldi, Sainsbury\'s, or Asda.',
    whyThisPlan: 'A well-planned vegetarian diet is associated with lower body weight, reduced risk of type 2 diabetes, and better heart health, according to the British Dietetic Association. The key to losing weight as a vegetarian is ensuring adequate protein — without meat, it is easy to fill up on carbohydrate-heavy foods that push you over your calorie target. This plan solves that by building every meal around a protein anchor — eggs, tofu, lentils, chickpeas, or dairy — before adding vegetables and complex carbs. You will hit 75–90 g of protein per day, which is appropriate for weight loss in most adults.',
    tips: [
      'Eggs are one of the cheapest and most protein-dense foods available. Keep a batch of hard-boiled eggs in the fridge for quick lunches and snacks.',
      'Tinned chickpeas, lentils, and kidney beans are nutritional powerhouses. Buy several tins a week — they store for years and cost around 60–80p each.',
      'Tofu takes on flavour well when marinated before cooking. Press it with a clean towel to remove moisture before pan-frying or baking for a better texture.',
      'Nutritional yeast is a brilliant addition to vegetarian cooking — it adds a cheesy, umami flavour and is high in B vitamins. Find it in most UK supermarkets.',
      'Greek yogurt (not plant-based) is the easiest high-protein snack on a lacto-vegetarian diet. 200 g of 0% fat Greek yogurt contains about 20 g of protein for around 130 kcal.',
    ],
    faq: [
      { q: 'Can I get enough protein on a vegetarian diet?', a: 'Yes. Eggs, Greek yogurt, cottage cheese, tofu, lentils, chickpeas, and edamame are all excellent protein sources. This plan delivers 75–90 g of protein per day, which is sufficient for most adults losing weight.' },
      { q: 'Is this plan vegan-friendly?', a: 'Not as written — it includes eggs, dairy, and sometimes halloumi or paneer. However, you can swap these for plant-based alternatives (silken tofu for eggs, soy yogurt for Greek yogurt) to make it vegan.' },
      { q: 'Will I be hungry on 1500 calories as a vegetarian?', a: 'Hunger depends on food choices more than total calories. This plan is built around high-protein, high-fibre meals that keep you full. If you are regularly hungry, try adding more non-starchy vegetables and ensuring each meal includes at least 20 g of protein.' },
    ],
    related: [
      { slug: '1500-calorie-meal-plan', label: '1500 Calorie Plan' },
      { slug: 'high-protein-low-calorie-meal-plan', label: 'High Protein Plan' },
      { slug: '1800-calorie-meal-plan', label: '1800 Calorie Plan' },
    ],
    blogLinks: [
      { path: '/blog/how-to-meal-plan-for-weight-loss', label: 'How to Meal Plan for Weight Loss' },
      { path: '/blog/best-low-calorie-foods-uk', label: 'Best Low Calorie Foods in UK Supermarkets' },
    ],
    plan: PLAN_VEGETARIAN,
    shoppingList: BASE_SHOPPING['vegetarian-low-calorie-meal-plan'],
    priceEstimate: '£35–45 per week',
  },

  'aldi-low-calorie-meal-plan': {
    title: 'Aldi Low Calorie Meal Plan UK | Budget 7-Day Guide',
    description: 'A budget-friendly Aldi low calorie meal plan using affordable own-brand ingredients, with meal ideas, calories, protein, and shopping list for weight loss.',
    h1: 'Aldi Low Calorie Meal Plan UK — Budget 7-Day Guide',
    planLabel: 'Aldi Low Calorie',
    targetCalories: 1500,
    intro: 'Aldi is renowned for offering some of the lowest prices on healthy, calorie-controlled ingredients in the UK. From Aldi Rolled Oats at 85p per kg to Aldi Lean Chicken Breast Fillets at highly competitive prices, the own-brand range makes healthy eating genuinely accessible on almost any budget. This 7-day plan is built exclusively around products available at Aldi — and comes in at an estimated £35–45 per week for one person, making it one of the most affordable calorie-controlled meal plans available.',
    whyThisPlan: 'Shopping at Aldi means consistently low prices without frequent special offers or loyalty schemes required. Their own-brand lean proteins, frozen vegetables, and whole grains form the backbone of affordable weight loss. This plan targets 1,500 calories per day with a strong focus on protein (90–120 g daily) using readily available Aldi products including Aldi Low Fat Greek Style Yogurt, Aldi Tinned Tuna in Spring Water, and Aldi Free Range Eggs — all significantly cheaper than many competitors.',
    tips: [
      'Aldi\'s frozen vegetable range is consistently excellent value and just as nutritious as fresh. Frozen broccoli, peas, and mixed veg are perfect for batch cooking.',
      'Buy own-brand staples: Aldi Rolled Oats, Brown Rice, and Wholemeal Bread are some of the cheapest available while maintaining quality.',
      'Aldi\'s Specially Selected range offers premium options at reasonable prices — use for special meals without blowing your budget.',
      'Aldi egg prices are consistently among the lowest in the UK. Buying larger packs (18 or 30 packs) provides excellent value.',
      'Check the Aldi app or in-store for upcoming Specialbuys — many include kitchen equipment useful for meal prep.',
    ],
    faq: [
      { q: 'How much does this Aldi meal plan cost per week?', a: 'Approximately £35–45 per week for one person, using Aldi own-brand products. Aldi\'s consistently low prices mean no need for loyalty schemes or special offers.' },
      { q: 'Can I use this plan at other supermarkets?', a: 'Yes. While Aldi has the lowest prices overall, the ingredients are available at Tesco, Sainsbury\'s, Asda, and Morrisons. Use our generator to tailor a plan to your preferred store.' },
      { q: 'Does Aldi have everything I need?', a: 'Yes. All ingredients are stocked in standard Aldi stores. Smaller Aldi Smaller Stores may have a reduced range, so a larger superstore or online order is recommended for the full plan.' },
    ],
    related: [
      { slug: '1500-calorie-meal-plan', label: '1500 Calorie Plan' },
      { slug: 'tesco-low-calorie-meal-plan', label: 'Tesco Low Calorie Plan' },
      { slug: 'high-protein-low-calorie-meal-plan', label: 'High Protein Plan' },
      { slug: 'vegan-low-calorie-meal-plan', label: 'Vegan Plan' },
    ],
    blogLinks: [
      { path: '/blog/best-low-calorie-foods-uk', label: 'Best Low Calorie Foods UK' },
      { path: '/blog/how-to-meal-plan-for-weight-loss', label: 'How to Meal Plan for Weight Loss' },
    ],
    plan: PLAN_ALDI,
    shoppingList: BASE_SHOPPING['aldi-low-calorie-meal-plan'],
    priceEstimate: '£35–45 per week (Aldi own-brand)',
  },

  'vegan-low-calorie-meal-plan': {
    title: 'Vegan Low Calorie Meal Plan UK | Free 7-Day Guide',
    description: 'A vegan low calorie meal plan for UK shoppers, with high-protein plant-based meals using tofu, legumes, nuts, and simple supermarket ingredients.',
    h1: 'Vegan Low Calorie Meal Plan UK — Free 7-Day Guide',
    planLabel: 'Vegan Low Calorie',
    targetCalories: 1500,
    intro: 'Losing weight on a vegan diet is entirely achievable and often easier than people expect. Plant-based proteins like tofu, legumes, nuts, seeds, and plant-based alternatives are filling, nutritious, and widely available at all UK supermarkets. This 7-day vegan low calorie meal plan is designed for UK shoppers, targeting 1,500 calories per day with a strong emphasis on protein and fibre to keep you satisfied and support a healthy metabolism. Every meal uses ingredients you can pick up at Tesco, Aldi, Sainsbury\'s, or Asda.',
    whyThisPlan: 'A well-planned vegan diet is associated with lower body weight, reduced risk of type 2 diabetes, and better heart health. The key to losing weight on a vegan diet is ensuring adequate protein and fibre — without animal products, it is easy to fill up on carbohydrate-heavy foods that push you over your calorie target. This plan solves that by building every meal around a protein anchor — tofu, lentils, chickpeas, or nuts — before adding vegetables and complex carbs. You will hit 60–70 g of protein per day, which is appropriate for weight loss in most adults.',
    tips: [
      'Firm tofu is your best friend — press it to remove moisture, then pan-fry or bake for better texture and flavour absorption.',
      'Tinned chickpeas, lentils, and beans are nutritional powerhouses. Buy several tins a week — they store for years and cost around 60–80p each.',
      'Plant-based yogurt (oat, soy, or coconut) provides protein and probiotics. Use instead of dairy yogurt for breakfast and snacks.',
      'Nutritional yeast adds a cheesy, umami flavour and is high in B vitamins. Find it in most UK supermarkets.',
      'Hemp seeds and pumpkin seeds are excellent plant-based protein sources. Add to smoothies, salads, and porridge for a protein boost.',
    ],
    faq: [
      { q: 'Can I get enough protein on a vegan diet?', a: 'Yes. Tofu, legumes, nuts, seeds, and plant-based protein powder are all excellent vegan protein sources. This plan delivers 60–70 g of protein per day, which is sufficient for most adults losing weight.' },
      { q: 'What is the difference between vegan and vegetarian plans?', a: 'The vegetarian plan includes eggs, dairy, and sometimes cheese. The vegan plan excludes all animal products, using tofu, legumes, nuts, and plant-based milk instead.' },
      { q: 'Will I be hungry on 1500 calories as a vegan?', a: 'Hunger depends on food choices more than total calories. This plan is built around high-protein, high-fibre meals that keep you full. If regularly hungry, add more non-starchy vegetables and ensure each meal includes at least 15 g of plant-based protein.' },
    ],
    related: [
      { slug: '1500-calorie-meal-plan', label: '1500 Calorie Plan' },
      { slug: 'vegetarian-low-calorie-meal-plan', label: 'Vegetarian Plan' },
      { slug: 'high-protein-low-calorie-meal-plan', label: 'High Protein Plan' },
    ],
    blogLinks: [
      { path: '/blog/best-low-calorie-foods-uk', label: 'Best Low Calorie Foods in UK Supermarkets' },
      { path: '/blog/how-to-meal-plan-for-weight-loss', label: 'How to Meal Plan for Weight Loss' },
    ],
    plan: PLAN_VEGAN,
    shoppingList: BASE_SHOPPING['vegan-low-calorie-meal-plan'],
    priceEstimate: '£40–50 per week',
  },
};
