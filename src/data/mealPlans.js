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
  'aldi-1800-calorie-meal-plan': {
    protein: ['Aldi Specially Selected Lean Chicken Breast Fillets (1.2 kg)', 'Aldi Tinned Tuna in Spring Water (4 × 145 g)', 'Aldi Free Range Eggs (12)', 'Aldi Milbona Low Fat Greek Style Yogurt (500 g)', 'Aldi Turkey Mince Lean (500 g)'],
    carbs: ['Aldi Harvest Morn Rolled Oats (1 kg)', "Aldi Village Bakery Wholemeal Sliced Bread (800 g)", 'Aldi Worldwide Foods Basmati Rice (500 g)', 'Aldi Sweet Potatoes (1 kg)', 'Aldi Worldwide Foods Wholewheat Pasta (500 g)'],
    vegetables: ['Aldi Broccoli (500 g)', 'Aldi Baby Spinach (200 g bag)', 'Aldi Mixed Peppers (500 g)', 'Aldi Cherry Tomatoes (400 g)', 'Aldi Frozen Mixed Veg (1 kg)'],
    dairy: ['Aldi Milbona Skimmed Milk (2 L)', 'Aldi Milbona Low Fat Greek Style Yogurt (500 g)'],
    extras: ['Aldi Olive Oil (500 ml)', 'Aldi Reduced Fat Hummus (200 g)', 'Aldi Frozen Mixed Berries (500 g)', 'Aldi Peanut Butter (340 g)', 'Bananas (5–6)'],
  },
  'aldi-high-protein-meal-plan': {
    protein: ['Aldi Lean Chicken Breast Fillets (1.5 kg)', 'Aldi Tinned Tuna in Spring Water (6 × 145 g)', 'Aldi Free Range Eggs (18)', 'Aldi Milbona 0% Fat Greek Style Yogurt (2 × 500 g)', 'Aldi Low Fat Cottage Cheese (500 g)'],
    carbs: ['Aldi Harvest Morn Rolled Oats (1 kg)', "Aldi Village Bakery Wholemeal Sliced Bread (800 g)", 'Aldi Brown Rice (500 g)', 'Aldi Red Lentils (500 g)', 'Aldi Edamame Frozen (300 g)'],
    vegetables: ['Aldi Broccoli (1 kg)', 'Aldi Baby Spinach (400 g)', 'Aldi Green Beans (300 g)', 'Aldi Cherry Tomatoes (400 g)', 'Aldi Cucumber (2)'],
    dairy: ['Aldi Milbona Skimmed Milk (2 L)', 'Aldi Milbona 0% Fat Greek Style Yogurt (1 kg)'],
    extras: ['Aldi Olive Oil Spray (190 ml)', 'Aldi Low Sodium Soy Sauce', 'Aldi Lemons (4)', 'Garlic bulb', 'Mixed herbs'],
  },
  'tesco-1800-calorie-meal-plan': {
    protein: ['Tesco Lean Chicken Breast Fillets (1.2 kg)', 'Tesco Tinned Tuna in Spring Water (4 × 145 g)', 'Tesco Free Range Eggs (12)', 'Tesco Low Fat Greek Style Yogurt (500 g)', 'Tesco Turkey Mince Lean (500 g)'],
    carbs: ['Tesco Rolled Oats (1 kg)', 'Tesco Wholemeal Sliced Bread (800 g)', 'Tesco Brown Basmati Rice (500 g)', 'Tesco Sweet Potatoes (1 kg)', 'Tesco Wholewheat Pasta (500 g)'],
    vegetables: ['Tesco Broccoli (500 g)', 'Tesco Baby Spinach (200 g bag)', 'Tesco Mixed Peppers (500 g)', 'Tesco Cherry Tomatoes (400 g)', 'Tesco Frozen Mixed Veg (1 kg)'],
    dairy: ['Tesco Skimmed Milk (2 L)', 'Tesco Low Fat Greek Style Yogurt (500 g)'],
    extras: ['Tesco Olive Oil (500 ml)', 'Tesco Reduced Fat Hummus (200 g)', 'Tesco Frozen Mixed Berries (500 g)', 'Tesco Peanut Butter Smooth (340 g)', 'Bananas (5–6)'],
  },
  'tesco-high-protein-meal-plan': {
    protein: ['Tesco Lean Chicken Breast Fillets (1.5 kg)', 'Tesco Tinned Tuna in Spring Water (6 × 145 g)', 'Tesco Free Range Eggs (18)', 'Tesco 0% Fat Greek Style Yogurt (1 kg)', 'Tesco Low Fat Cottage Cheese (500 g)'],
    carbs: ['Tesco Rolled Oats (1 kg)', 'Tesco Wholemeal Sliced Bread (800 g)', 'Tesco Brown Rice (500 g)', 'Tesco Red Lentils (500 g)', 'Tesco Frozen Edamame (300 g)'],
    vegetables: ['Tesco Broccoli (1 kg)', 'Tesco Baby Spinach (400 g)', 'Tesco Green Beans (300 g)', 'Tesco Cherry Tomatoes (400 g)', 'Tesco Cucumber (2)'],
    dairy: ['Tesco Skimmed Milk (2 L)', 'Tesco 0% Fat Greek Style Yogurt (1 kg)'],
    extras: ['Tesco Olive Oil Spray (190 ml)', 'Tesco Low Sodium Soy Sauce', 'Tesco Lemons (4)', 'Garlic bulb', 'Mixed herbs'],
  },
  'asda-1800-calorie-meal-plan': {
    protein: ['Asda Chicken Breast Fillets (1.2 kg)', 'Asda Tinned Tuna in Spring Water (4 × 145 g)', 'Asda Free Range Eggs (12)', 'Asda Low Fat Greek Style Yogurt (500 g)', 'Asda Turkey Mince Lean (500 g)'],
    carbs: ['Asda Rolled Oats (1 kg)', 'Asda Wholemeal Sliced Bread (800 g)', 'Asda Brown Basmati Rice (500 g)', 'Asda Sweet Potatoes (1 kg)', 'Asda Wholewheat Penne (500 g)'],
    vegetables: ['Asda Broccoli (500 g)', 'Asda Baby Spinach (200 g bag)', 'Asda Mixed Peppers (500 g)', 'Asda Cherry Tomatoes (400 g)', 'Asda Frozen Mixed Veg (1 kg)'],
    dairy: ['Asda Skimmed Milk (2 L)', 'Asda Low Fat Greek Style Yogurt (500 g)'],
    extras: ['Asda Olive Oil (500 ml)', 'Asda Reduced Fat Hummus (200 g)', 'Asda Frozen Mixed Berries (500 g)', 'Asda Peanut Butter Smooth (340 g)', 'Bananas (5–6)'],
  },
  'asda-1500-calorie-meal-plan': {
    protein: ['Asda Chicken Breast Fillets (1 kg)', 'Asda Tinned Tuna in Spring Water (4 × 145 g)', 'Asda Free Range Eggs (12)', 'Asda Low Fat Greek Style Yogurt (500 g)', 'Asda Turkey Breast Steak (400 g)'],
    carbs: ['Asda Rolled Oats (1 kg)', 'Asda Wholemeal Sliced Bread (800 g)', 'Asda Brown Rice (1 kg)', 'Asda Sweet Potatoes (1 kg)', 'Asda Wholewheat Pasta (500 g)'],
    vegetables: ['Asda Broccoli (500 g)', 'Asda Baby Spinach (200 g)', 'Asda Salad Bag (200 g)', 'Asda Cherry Tomatoes (400 g)', 'Asda Frozen Mixed Veg (1 kg)'],
    dairy: ['Asda Skimmed Milk (2 L)', 'Asda Lighter Cheddar (250 g)'],
    extras: ['Asda Olive Oil (500 ml)', 'Asda Reduced Fat Hummus (200 g)', 'Asda Frozen Mixed Berries (500 g)', 'Asda Wholemeal Pitta Breads (6 pack)'],
  },
  'sainsburys-1800-calorie-meal-plan': {
    protein: ["Sainsbury's Chicken Breast Fillets (1.2 kg)", "Sainsbury's Tinned Tuna in Spring Water (4 × 145 g)", "Sainsbury's Free Range Eggs (12)", "Sainsbury's Low Fat Greek Style Yogurt (500 g)", "Sainsbury's Turkey Mince Lean (500 g)"],
    carbs: ["Sainsbury's Rolled Oats (1 kg)", "Sainsbury's Wholemeal Sliced Bread (800 g)", "Sainsbury's Brown Basmati Rice (500 g)", "Sainsbury's Sweet Potatoes (1 kg)", "Sainsbury's Wholewheat Pasta (500 g)"],
    vegetables: ["Sainsbury's Broccoli (500 g)", "Sainsbury's Baby Spinach (200 g bag)", "Sainsbury's Mixed Peppers (500 g)", "Sainsbury's Cherry Tomatoes (400 g)", "Sainsbury's Frozen Mixed Veg (900 g)"],
    dairy: ["Sainsbury's Skimmed Milk (2 L)", "Sainsbury's Low Fat Greek Style Yogurt (500 g)"],
    extras: ["Sainsbury's Olive Oil (500 ml)", "Sainsbury's Reduced Fat Hummus (200 g)", "Sainsbury's Frozen Mixed Berries (500 g)", "Sainsbury's Peanut Butter Smooth (340 g)", 'Bananas (5–6)'],
  },
  'lidl-1800-calorie-meal-plan': {
    protein: ['Lidl Chicken Breast Fillets (1.2 kg)', 'Lidl Nixe Tuna in Spring Water (4 cans)', 'Lidl Free Range Eggs (12)', 'Lidl Milbona Low Fat Greek Style Yogurt (500 g)', 'Lidl Turkey Breast Steaks (400 g)'],
    carbs: ['Lidl Harvest Basket Rolled Oats (1 kg)', "Lidl Bakers' Life Wholemeal Sliced Bread (800 g)", 'Lidl Brown Rice (500 g)', 'Lidl Sweet Potatoes (1 kg)', 'Lidl Wholewheat Pasta (500 g)'],
    vegetables: ['Lidl Broccoli (500 g)', 'Lidl Baby Spinach (200 g)', 'Lidl Mixed Peppers (500 g)', 'Lidl Cherry Tomatoes (400 g)', 'Lidl Frozen Mixed Vegetables (1 kg)'],
    dairy: ['Lidl Milbona Skimmed Milk (2 L)', 'Lidl Milbona Low Fat Greek Style Yogurt (500 g)'],
    extras: ['Lidl Olive Oil (500 ml)', 'Lidl Hummus (200 g)', 'Lidl Frozen Mixed Berries (500 g)', 'Lidl Peanut Butter (340 g)', 'Bananas (5–6)'],
  },
  'morrisons-1800-calorie-meal-plan': {
    protein: ["Morrisons Chicken Breast Fillets (1.2 kg)", "Morrisons Tinned Tuna in Spring Water (4 × 145 g)", "Morrisons Free Range Eggs (12)", "Morrisons Low Fat Greek Style Yogurt (500 g)", "Morrisons Turkey Mince Lean (500 g)"],
    carbs: ["Morrisons Rolled Oats (1 kg)", "Morrisons Wholemeal Sliced Bread (800 g)", "Morrisons Brown Basmati Rice (500 g)", "Morrisons Sweet Potatoes (1 kg)", "Morrisons Wholewheat Pasta (500 g)"],
    vegetables: ["Morrisons Broccoli (500 g)", "Morrisons Baby Spinach (200 g)", "Morrisons Mixed Peppers (500 g)", "Morrisons Cherry Tomatoes (400 g)", "Morrisons Frozen Mixed Veg (1 kg)"],
    dairy: ["Morrisons Skimmed Milk (2 L)", "Morrisons Low Fat Greek Style Yogurt (500 g)"],
    extras: ["Morrisons Olive Oil (500 ml)", "Morrisons Reduced Fat Hummus (200 g)", "Morrisons Frozen Mixed Berries (500 g)", "Morrisons Peanut Butter (340 g)", 'Bananas (5–6)'],
  },
  'sainsburys-low-calorie-meal-plan': {
    protein: ["Sainsbury's Lean Chicken Breast Fillets (1 kg)", "Sainsbury's Tinned Tuna in Spring Water (4 × 145 g)", "Sainsbury's Free Range Eggs (12)", "Sainsbury's Low Fat Greek Style Yogurt (500 g)", "Sainsbury's Smoked Salmon (100 g)"],
    carbs: ["Sainsbury's Rolled Oats (1 kg)", "Sainsbury's Wholemeal Sliced Bread (800 g)", "Sainsbury's Easy Cook Brown Rice (500 g)", "Sainsbury's Sweet Potatoes (1 kg)", "Sainsbury's New Potatoes (750 g)"],
    vegetables: ["Sainsbury's Broccoli (500 g)", "Sainsbury's Baby Spinach (200 g bag)", "Sainsbury's Mixed Salad Leaves (200 g)", "Sainsbury's Cherry Tomatoes (400 g)", "Sainsbury's Courgette (2)", "Sainsbury's Carrots (750 g)"],
    dairy: ["Sainsbury's Skimmed Milk (2 L)", "Sainsbury's Low Fat Cottage Cheese (300 g)"],
    extras: ["Sainsbury's Olive Oil (500 ml)", "Sainsbury's Reduced Fat Hummus (200 g)", "Sainsbury's Frozen Mixed Berries (500 g)", "Sainsbury's Flaked Almonds (100 g)", 'Honey (jar)'],
  },
  'morrisons-low-calorie-meal-plan': {
    protein: ["Morrisons Lean Chicken Breast Fillets (1 kg)", "Morrisons Tinned Tuna in Spring Water (4 × 145 g)", "Morrisons Free Range Eggs (12)", "Morrisons Low Fat Greek Style Yogurt (500 g)", "Morrisons Smoked Salmon (100 g)"],
    carbs: ["Morrisons Rolled Oats (1 kg)", "Morrisons Wholemeal Sliced Bread (800 g)", "Morrisons Easy Cook Brown Rice (500 g)", "Morrisons Sweet Potatoes (1 kg)", "Morrisons New Potatoes (750 g)"],
    vegetables: ["Morrisons Broccoli (500 g)", "Morrisons Baby Spinach (200 g)", "Morrisons Mixed Salad Leaves (200 g)", "Morrisons Cherry Tomatoes (400 g)", "Morrisons Courgette (2)", "Morrisons Carrots (750 g)"],
    dairy: ["Morrisons Skimmed Milk (2 L)", "Morrisons Low Fat Cottage Cheese (300 g)"],
    extras: ["Morrisons Olive Oil (500 ml)", "Morrisons Reduced Fat Hummus (200 g)", "Morrisons Frozen Mixed Berries (500 g)", "Morrisons Almonds (100 g)", 'Honey (jar)'],
  },
  'iceland-budget-meal-plan': {
    protein: ['Iceland Chicken Breast Fillets (1 kg)', 'Iceland Tinned Tuna in Spring Water (4 × 145 g)', 'Iceland Free Range Eggs (12)', 'Iceland Greek Style Yogurt (500 g)', 'Iceland Turkey Mince (500 g)'],
    frozen: ['Iceland Broccoli Florets (1 kg)', 'Iceland Mixed Vegetables (1 kg)', 'Iceland Sliced Green Beans (750 g)', 'Iceland Baby Peas (1 kg)', 'Iceland Mixed Berries (1 kg)'],
    carbs: ['Rolled Oats (1 kg)', 'Iceland Wholemeal Bread (800 g)', 'Iceland Brown Rice (500 g)', 'Iceland Sweet Potatoes (1 kg)'],
    dairy: ['Iceland Skimmed Milk (2 L)', 'Iceland Low Fat Yogurt (500 g)'],
    extras: ['Olive Oil (500 ml)', 'Iceland Hummus (200 g)', 'Iceland Natural Peanut Butter (340 g)', 'Bananas (5–6)'],
  },
  '2500-calorie-meal-plan': {
    protein: ['Chicken breast (1.5 kg)', 'Salmon fillets (4)', 'Eggs (18)', 'Greek yogurt full-fat (1 kg)', 'Lean beef mince (500 g)', 'Tinned tuna (4 cans)'],
    carbs: ['Rolled oats (1.5 kg)', 'Wholemeal bread (800 g)', 'Brown rice (1 kg)', 'Sweet potatoes (1.5 kg)', 'Wholemeal pasta (750 g)', 'Bananas (8)'],
    vegetables: ['Broccoli (750 g)', 'Spinach (400 g)', 'Mixed peppers (500 g)', 'Avocado (3)', 'Carrots (1 kg)', 'Green beans (300 g)'],
    dairy: ['Semi-skimmed milk (2 L)', 'Cheddar low-fat (200 g)', 'Greek yogurt (1 kg)'],
    extras: ['Olive oil (500 ml)', 'Mixed nuts (200 g)', 'Dark chocolate 85% (100 g)', 'Tinned tomatoes (4 cans)', 'Peanut butter (340 g)'],
  },
  'cheap-student-meal-plan-uk': {
    protein: ['Chicken thighs boneless (1 kg)', 'Tinned tuna in spring water (6 cans)', 'Eggs (18)', 'Low fat Greek yogurt (1 kg)', 'Red lentils (500 g)', 'Tinned chickpeas (4 cans)'],
    carbs: ['Rolled oats (1 kg)', 'Wholemeal bread (800 g loaf)', 'Brown rice (1 kg)', 'Pasta (500 g)', 'Sweet potatoes (1 kg)'],
    vegetables: ['Frozen mixed veg (1.5 kg)', 'Frozen broccoli (750 g)', 'Spinach (200 g bag)', 'Carrots (750 g)', 'Tinned tomatoes (4 cans)'],
    dairy: ['Skimmed milk (2 L)', 'Low fat yogurt (500 g)'],
    extras: ['Olive oil (500 ml)', 'Low-sodium soy sauce', 'Garlic bulb', 'Mixed herbs', 'Tinned kidney beans (4 cans)'],
  },
  'high-protein-vegetarian-meal-plan-uk': {
    protein: ['Eggs (18)', '0% fat Greek yogurt (2 × 500 g)', 'Low fat cottage cheese (500 g)', 'Firm tofu (2 × 400 g)', 'Tinned chickpeas (4 cans)', 'Red lentils (500 g)', 'Edamame frozen (300 g)'],
    carbs: ['Rolled oats (1 kg)', 'Wholemeal bread (800 g)', 'Brown rice (500 g)', 'Quinoa (500 g)', 'Sweet potatoes (1 kg)'],
    vegetables: ['Broccoli (750 g)', 'Spinach (400 g bag)', 'Mixed peppers (500 g)', 'Courgette (3)', 'Cherry tomatoes (400 g)', 'Mushrooms (500 g)'],
    dairy: ['Skimmed milk (2 L)', '0% fat Greek yogurt (1 kg)', 'Low fat cottage cheese (500 g)'],
    extras: ['Olive oil', 'Tahini (jar)', 'Lemon (4)', 'Garlic bulb', 'Nutritional yeast (100 g)', 'Hemp seeds (200 g)', 'Natural peanut butter (340 g)'],
  },
  'budget-bodybuilding-meal-plan-uk': {
    protein: ['Chicken breast (1.5 kg)', 'Tinned tuna in spring water (6 cans)', 'Eggs (18)', 'Low fat Greek yogurt (1 kg)', 'Turkey mince lean (500 g)', 'Whey protein powder (1 bag)'],
    carbs: ['Rolled oats (1.5 kg)', 'Brown rice (1 kg)', 'Wholemeal bread (800 g)', 'Sweet potatoes (1.5 kg)', 'Bananas (8)', 'Wholemeal pasta (500 g)'],
    vegetables: ['Broccoli (750 g)', 'Spinach (400 g)', 'Mixed peppers (500 g)', 'Frozen mixed veg (1 kg)', 'Carrots (750 g)'],
    dairy: ['Skimmed milk (2 L)', 'Low fat Greek yogurt (1 kg)'],
    extras: ['Olive oil (500 ml)', 'Natural peanut butter (340 g)', 'Tinned chickpeas (4 cans)', 'Honey (small jar)', 'Garlic bulb'],
  },
  'gym-beginner-meal-plan-uk': {
    protein: ['Chicken breast (1 kg)', 'Tinned tuna in spring water (4 cans)', 'Eggs (12)', 'Low fat Greek yogurt (500 g)', 'Turkey mince lean (500 g)'],
    carbs: ['Rolled oats (1 kg)', 'Brown rice (500 g)', 'Wholemeal bread (800 g)', 'Sweet potatoes (1 kg)', 'Bananas (6)'],
    vegetables: ['Broccoli (500 g)', 'Spinach (200 g bag)', 'Mixed peppers (500 g)', 'Carrots (750 g)', 'Frozen mixed veg (1 kg)'],
    dairy: ['Skimmed milk (2 L)', 'Low fat Greek yogurt (500 g)'],
    extras: ['Olive oil (500 ml)', 'Natural peanut butter (340 g)', 'Lemon (3)', 'Garlic bulb', 'Mixed herbs'],
  },
  'budget-fat-loss-meal-plan-uk': {
    protein: ['Chicken thighs boneless (1 kg)', 'Tinned tuna in spring water (6 cans)', 'Eggs (18)', 'Low fat Greek yogurt (1 kg)', 'Red lentils (500 g)', 'Tinned chickpeas (4 cans)'],
    carbs: ['Rolled oats (1 kg)', 'Wholemeal bread (800 g)', 'Brown rice (500 g)', 'Sweet potatoes (1 kg)'],
    vegetables: ['Frozen mixed veg (1.5 kg)', 'Frozen broccoli (750 g)', 'Spinach (200 g)', 'Carrots (750 g)', 'Cherry tomatoes (400 g)'],
    dairy: ['Skimmed milk (2 L)', 'Low fat cottage cheese (300 g)'],
    extras: ['Olive oil spray', 'Soy sauce low-sodium', 'Garlic bulb', 'Tinned tomatoes (4 cans)', 'Mixed herbs'],
  },
  'muscle-gain-meal-plan-uk': {
    protein: ['Chicken breast (2 kg)', 'Salmon fillets (4)', 'Eggs (24)', 'Greek yogurt full fat (1 kg)', 'Lean beef mince (500 g)', 'Turkey mince (500 g)', 'Whey protein powder (1 bag)'],
    carbs: ['Rolled oats (2 kg)', 'Brown rice (1.5 kg)', 'Wholemeal bread (2 × 800 g)', 'Sweet potatoes (2 kg)', 'Wholemeal pasta (750 g)', 'Bananas (10)'],
    vegetables: ['Broccoli (1 kg)', 'Spinach (400 g)', 'Mixed peppers (500 g)', 'Avocado (3)', 'Cherry tomatoes (400 g)', 'Frozen mixed veg (1 kg)'],
    dairy: ['Whole milk (2 L)', 'Greek yogurt full fat (1 kg)', 'Cheddar (200 g)'],
    extras: ['Olive oil (500 ml)', 'Peanut butter (340 g)', 'Honey (jar)', 'Mixed nuts (200 g)', 'Tinned chickpeas (4 cans)'],
  },
  'cheap-high-protein-meal-plan-uk': {
    protein: ['Chicken breast (1.5 kg)', 'Tinned tuna in spring water (8 cans)', 'Eggs (24)', '0% fat Greek yogurt (2 × 500 g)', 'Low fat cottage cheese (500 g)', 'Red lentils (500 g)'],
    carbs: ['Rolled oats (1 kg)', 'Wholemeal bread (800 g)', 'Brown rice (500 g)', 'Sweet potatoes (1 kg)'],
    vegetables: ['Frozen broccoli (1 kg)', 'Frozen mixed veg (1 kg)', 'Spinach (200 g)', 'Cherry tomatoes (400 g)', 'Cucumber (2)'],
    dairy: ['Skimmed milk (2 L)', '0% fat Greek yogurt (1 kg)'],
    extras: ['Olive oil spray', 'Soy sauce low-sodium', 'Lemon (4)', 'Garlic bulb', 'Mixed herbs'],
  },
  'low-effort-meal-plan-uk': {
    protein: ['Chicken breast pre-cooked slices (300 g)', 'Tinned tuna in spring water (6 cans)', 'Eggs (12)', 'Low fat Greek yogurt (500 g)', 'Smoked salmon (200 g)', 'Low fat cottage cheese (300 g)'],
    carbs: ['Rolled oats (1 kg)', 'Wholemeal bread (800 g)', 'Microwave brown rice pouches (5 × 250 g)', 'Sweet potatoes (1 kg)'],
    vegetables: ['Frozen mixed veg (1.5 kg)', 'Pre-washed salad bag (200 g)', 'Cherry tomatoes (400 g)', 'Baby spinach (200 g)', 'Carrots (750 g)'],
    dairy: ['Skimmed milk (2 L)', 'Low fat Greek yogurt (500 g)'],
    extras: ['Olive oil spray', 'Reduced fat hummus (200 g)', 'Bananas (5–6)', 'Natural peanut butter (340 g)'],
  },
  'busy-professional-meal-plan-uk': {
    protein: ['Chicken breast (1.2 kg)', 'Tinned tuna in spring water (6 cans)', 'Eggs (12)', 'Low fat Greek yogurt (1 kg)', 'Smoked salmon (150 g)', 'Turkey mince lean (500 g)'],
    carbs: ['Rolled oats (1 kg)', 'Wholemeal bread (800 g)', 'Microwave brown rice pouches (5 × 250 g)', 'Sweet potatoes (1 kg)', 'Wholemeal wraps (8 pack)'],
    vegetables: ['Frozen mixed veg (1.5 kg)', 'Pre-washed salad bag (200 g)', 'Cherry tomatoes (400 g)', 'Baby spinach (200 g)', 'Cucumber (2)'],
    dairy: ['Skimmed milk (2 L)', 'Low fat Greek yogurt (500 g)'],
    extras: ['Olive oil (500 ml)', 'Reduced fat hummus (200 g)', 'Natural peanut butter (340 g)', 'Bananas (5–6)', 'Lemon (3)'],
  },
};

const PLAN_1500 = [
  { day: 'Monday', meals: [
    { type: 'Breakfast', name: 'Overnight Oats with Berries', kcal: 340, protein: 14, prep: '5 min', desc: 'Rolled oats soaked overnight in skimmed milk, topped with frozen berries and a drizzle of honey.', portion_size: '60g oats, 200ml skimmed milk, 80g frozen berries, 1 tsp honey' },
    { type: 'Lunch', name: 'Tuna & Sweetcorn Jacket Potato', kcal: 420, protein: 35, prep: '10 min', desc: 'Medium baked potato topped with tinned tuna mixed with sweetcorn and a teaspoon of light mayo.', portion_size: '200g baked potato, 100g tinned tuna, 50g sweetcorn' },
    { type: 'Dinner', name: 'Grilled Chicken with Roasted Mediterranean Veg', kcal: 540, protein: 48, prep: '25 min', desc: 'Chicken breast grilled with courgette, peppers, and cherry tomatoes, served with a small portion of brown rice.', portion_size: '150g chicken breast, 40g brown rice (dry), 200g mixed veg' },
    { type: 'Snack', name: 'Greek Yogurt with Blueberries', kcal: 200, protein: 15, prep: '2 min', desc: 'Low-fat Greek yogurt topped with fresh or frozen blueberries.', portion_size: '200g Greek yogurt, 80g blueberries' },
  ], totals: { kcal: 1500, protein: 112 } },
  { day: 'Tuesday', meals: [
    { type: 'Breakfast', name: 'Scrambled Eggs on Wholemeal Toast', kcal: 350, protein: 22, prep: '10 min', desc: 'Two eggs scrambled with a handful of spinach, served on a slice of wholemeal toast.', portion_size: '2 eggs, 1 slice wholemeal toast (35g), 40g spinach' },
    { type: 'Lunch', name: 'Homemade Lentil Soup', kcal: 380, protein: 18, prep: '30 min', desc: 'Red lentil and carrot soup seasoned with cumin and coriander, served with a small wholemeal roll.', portion_size: '80g red lentils (dry), 100g carrots, 1 small roll (60g)' },
    { type: 'Dinner', name: 'Baked Salmon with Broccoli & New Potatoes', kcal: 570, protein: 45, prep: '20 min', desc: 'Salmon fillet baked with lemon and dill, served with steamed broccoli and boiled new potatoes.', portion_size: '150g salmon fillet, 150g new potatoes, 150g broccoli' },
    { type: 'Snack', name: 'Apple & Almonds', kcal: 200, protein: 5, prep: '1 min', desc: 'One medium apple and 20 g of unsalted almonds.', portion_size: '1 apple (150g), 20g almonds' },
  ], totals: { kcal: 1500, protein: 90 } },
  { day: 'Wednesday', meals: [
    { type: 'Breakfast', name: 'Banana & Oat Smoothie', kcal: 370, protein: 14, prep: '5 min', desc: 'Blended banana, 50 g oats, skimmed milk, and a teaspoon of peanut butter.', portion_size: '1 banana, 50g oats, 200ml skimmed milk, 1 tsp peanut butter' },
    { type: 'Lunch', name: 'Grilled Chicken Caesar Salad', kcal: 400, protein: 40, prep: '10 min', desc: 'Chicken breast strips over romaine lettuce with a light Caesar dressing and Parmesan shavings. No croutons.', portion_size: '120g chicken breast, 80g romaine lettuce, 20ml light dressing' },
    { type: 'Dinner', name: 'Turkey Mince Chilli with Brown Rice', kcal: 530, protein: 42, prep: '25 min', desc: 'Lean turkey mince cooked with tinned tomatoes, kidney beans, and chilli spices. Served with brown rice.', portion_size: '150g turkey mince, 40g brown rice (dry), 80g kidney beans' },
    { type: 'Snack', name: 'Carrot Sticks & Hummus', kcal: 200, protein: 6, prep: '2 min', desc: '100 g carrot sticks with 40 g reduced-fat hummus.', portion_size: '100g carrot sticks, 40g hummus' },
  ], totals: { kcal: 1500, protein: 102 } },
  { day: 'Thursday', meals: [
    { type: 'Breakfast', name: 'Porridge with Walnuts & Cinnamon', kcal: 350, protein: 12, prep: '5 min', desc: '50 g oats cooked with skimmed milk, topped with 15 g crushed walnuts and a sprinkle of cinnamon.', portion_size: '50g oats, 250ml skimmed milk, 15g walnuts' },
    { type: 'Lunch', name: 'Prawn & Avocado Salad', kcal: 390, protein: 28, prep: '10 min', desc: 'King prawns tossed with mixed leaves, half an avocado, cucumber, and lemon dressing.', portion_size: '120g king prawns, ½ avocado (60g), 80g mixed leaves, 100g cucumber' },
    { type: 'Dinner', name: 'Chicken Tikka with Cauliflower Rice', kcal: 560, protein: 50, prep: '25 min', desc: 'Marinated chicken tikka baked and served over blitzed cauliflower rice with a side of raita.', portion_size: '150g chicken breast, 200g cauliflower rice, 50g raita' },
    { type: 'Snack', name: 'Low-Fat Cottage Cheese with Cucumber', kcal: 200, protein: 20, prep: '2 min', desc: '150 g cottage cheese with sliced cucumber and a grind of black pepper.', portion_size: '150g cottage cheese, 100g cucumber' },
  ], totals: { kcal: 1500, protein: 110 } },
  { day: 'Friday', meals: [
    { type: 'Breakfast', name: 'Poached Eggs & Smoked Salmon on Toast', kcal: 400, protein: 32, prep: '10 min', desc: 'Two poached eggs and 50 g smoked salmon on a slice of wholemeal toast.', portion_size: '2 eggs, 50g smoked salmon, 1 slice wholemeal toast (35g)' },
    { type: 'Lunch', name: 'Chicken & Vegetable Soup', kcal: 350, protein: 28, prep: '25 min', desc: 'Diced chicken breast simmered with carrots, celery, and leek in a light chicken stock.', portion_size: '120g chicken breast, 80g carrots, 50g celery, 50g leek' },
    { type: 'Dinner', name: 'Baked Cod with Sweet Potato Wedges', kcal: 550, protein: 40, prep: '25 min', desc: 'Cod fillet baked with herbs and lemon, served with oven-roasted sweet potato wedges and green beans.', portion_size: '150g cod fillet, 150g sweet potato, 100g green beans' },
    { type: 'Snack', name: 'Protein Yogurt', kcal: 200, protein: 20, prep: '1 min', desc: 'High-protein low-fat yogurt pot (e.g. Arla Protein or Tesco High Protein Yogurt).', portion_size: '1 high-protein yogurt pot (150g)' },
  ], totals: { kcal: 1500, protein: 120 } },
  { day: 'Saturday', meals: [
    { type: 'Breakfast', name: 'Wholemeal Pancakes with Berries', kcal: 380, protein: 18, prep: '15 min', desc: 'Two small wholemeal pancakes made with egg and oat flour, topped with berries and low-fat yogurt.', portion_size: '80g pancake batter (2 pancakes), 80g berries, 50g low-fat yogurt' },
    { type: 'Lunch', name: 'Turkey & Avocado Wholemeal Wrap', kcal: 400, protein: 32, prep: '5 min', desc: 'Sliced turkey breast, half an avocado, spinach, and tomato in a wholemeal tortilla wrap.', portion_size: '100g turkey breast, ½ avocado (60g), 1 wholemeal wrap (60g)' },
    { type: 'Dinner', name: 'Grilled Lean Beef Steak with Roasted Veg', kcal: 520, protein: 48, prep: '15 min', desc: 'Lean sirloin steak grilled to your liking, with roasted courgette, peppers, and cherry tomatoes.', portion_size: '150g lean sirloin steak, 200g roasted veg' },
    { type: 'Snack', name: 'Rice Cakes with Peanut Butter', kcal: 200, protein: 8, prep: '2 min', desc: 'Two plain rice cakes spread with natural peanut butter.', portion_size: '2 rice cakes (20g), 1 tbsp peanut butter (15g)' },
  ], totals: { kcal: 1500, protein: 106 } },
  { day: 'Sunday', meals: [
    { type: 'Breakfast', name: 'Healthy Full English', kcal: 420, protein: 30, prep: '15 min', desc: 'One egg (grilled or poached), two lean bacon rashers (fat trimmed), grilled tomatoes, mushrooms, and one slice of wholemeal toast.', portion_size: '1 egg, 2 lean bacon rashers (60g), 100g tomatoes, 50g mushrooms, 1 slice toast' },
    { type: 'Lunch', name: 'Leftover Steak Salad', kcal: 300, protein: 28, prep: '5 min', desc: 'Sliced leftover steak over mixed leaves with cherry tomatoes and a balsamic dressing.', portion_size: '100g sliced steak, 80g mixed leaves, 100g cherry tomatoes' },
    { type: 'Dinner', name: 'Roast Chicken Breast with Root Veg', kcal: 580, protein: 52, prep: '45 min', desc: 'Roast chicken breast with parsnips, carrots, and a small portion of gravy. A proper Sunday roast, lighter style.', portion_size: '175g chicken breast, 100g parsnips, 100g carrots' },
    { type: 'Snack', name: 'Protein Shake', kcal: 200, protein: 25, prep: '2 min', desc: 'One scoop of unflavoured or vanilla protein powder mixed with water or skimmed milk.', portion_size: '30g protein powder, 250ml skimmed milk' },
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
    { type: 'Breakfast', name: 'Greek Yogurt Protein Bowl', kcal: 380, protein: 35, prep: '5 min', desc: '200 g 0% Greek yogurt, one scoop protein powder, mixed berries, and 15 g chia seeds.', portion_size: '200g 0% Greek yogurt, 30g protein powder, 80g mixed berries, 15g chia seeds' },
    { type: 'Lunch', name: 'Tuna & Egg White Salad', kcal: 420, protein: 55, prep: '10 min', desc: 'Two tins of tuna with three hard-boiled egg whites, mixed leaves, cucumber, and lemon dressing.', portion_size: '2 tins tuna (290g drained), 3 egg whites, 80g mixed leaves, 100g cucumber' },
    { type: 'Dinner', name: 'Chicken Breast with Lentils & Greens', kcal: 560, protein: 60, prep: '25 min', desc: 'Two chicken breasts served over 100 g cooked green lentils with a side of steamed broccoli and asparagus.', portion_size: '280g chicken breast, 100g cooked lentils, 150g broccoli, 100g asparagus' },
    { type: 'Snack', name: 'Cottage Cheese & Cucumber', kcal: 160, protein: 22, prep: '2 min', desc: '200 g low-fat cottage cheese with sliced cucumber and black pepper.', portion_size: '200g cottage cheese, 100g cucumber' },
  ], totals: { kcal: 1520, protein: 172 } },
  { day: 'Tuesday', meals: [
    { type: 'Breakfast', name: 'Egg White Omelette with Spinach', kcal: 320, protein: 30, prep: '10 min', desc: 'Five egg whites and one yolk, spinach, mushrooms, and cherry tomatoes cooked as an omelette.', portion_size: '5 egg whites, 1 yolk, 80g spinach, 80g mushrooms, 100g cherry tomatoes' },
    { type: 'Lunch', name: 'Chicken & Quinoa Power Bowl', kcal: 450, protein: 50, prep: '15 min', desc: 'Grilled chicken breast sliced over 80 g cooked quinoa with edamame, cucumber, and tahini dressing.', portion_size: '140g chicken breast, 80g quinoa (cooked), 50g edamame, 100g cucumber' },
    { type: 'Dinner', name: 'Baked Salmon with Asparagus', kcal: 540, protein: 52, prep: '20 min', desc: 'Salmon fillet baked with lemon and herbs, served with a bunch of roasted asparagus and a small side of brown rice.', portion_size: '150g salmon fillet, 200g asparagus, 40g brown rice (dry)' },
    { type: 'Snack', name: 'Protein Shake & Almonds', kcal: 250, protein: 28, prep: '2 min', desc: 'One scoop protein powder mixed with water, plus 20 g almonds.', portion_size: '30g protein powder, 300ml water, 20g almonds' },
  ], totals: { kcal: 1560, protein: 160 } },
  { day: 'Wednesday', meals: [
    { type: 'Breakfast', name: 'Overnight Protein Oats', kcal: 370, protein: 32, prep: '5 min', desc: '50 g oats, one scoop vanilla protein powder, skimmed milk, and banana slices.', portion_size: '50g oats, 30g protein powder, 200ml skimmed milk, 1 banana' },
    { type: 'Lunch', name: 'Turkey & Lentil Soup', kcal: 420, protein: 45, prep: '30 min', desc: 'Ground turkey and red lentil soup with spinach and mild spices.', portion_size: '150g turkey mince, 40g red lentils (dry), 80g spinach' },
    { type: 'Dinner', name: 'Grilled Chicken Tikka Skewers', kcal: 560, protein: 60, prep: '20 min', desc: 'Marinated chicken tikka skewers grilled and served with cauliflower rice and raita.', portion_size: '200g chicken breast, 250g cauliflower rice, 50g raita' },
    { type: 'Snack', name: 'Greek Yogurt & Walnuts', kcal: 200, protein: 18, prep: '2 min', desc: '150 g 0% Greek yogurt with 15 g walnuts and a teaspoon of honey.', portion_size: '150g 0% Greek yogurt, 15g walnuts, 1 tsp honey' },
  ], totals: { kcal: 1550, protein: 155 } },
  { day: 'Thursday', meals: [
    { type: 'Breakfast', name: 'Smoked Salmon Scrambled Eggs', kcal: 380, protein: 38, prep: '10 min', desc: 'Three-egg scramble with 75 g smoked salmon and a handful of spinach.', portion_size: '3 eggs, 75g smoked salmon, 40g spinach' },
    { type: 'Lunch', name: 'Tuna Nicoise Salad', kcal: 430, protein: 50, prep: '10 min', desc: 'Tinned tuna, one boiled egg, green beans, cherry tomatoes, and olives over mixed leaves.', portion_size: '145g tinned tuna, 1 egg, 80g green beans, 100g cherry tomatoes, 10g olives' },
    { type: 'Dinner', name: 'Lean Beef Stir-Fry', kcal: 540, protein: 55, prep: '15 min', desc: '200 g lean beef strips stir-fried with broccoli, peppers, and a low-sodium soy sauce. Small portion of brown rice.', portion_size: '200g lean beef strips, 35g brown rice (dry), 150g broccoli, 100g peppers' },
    { type: 'Snack', name: 'Edamame Pods', kcal: 180, protein: 17, prep: '5 min', desc: '200 g edamame pods, lightly salted.', portion_size: '200g edamame pods' },
  ], totals: { kcal: 1530, protein: 160 } },
  { day: 'Friday', meals: [
    { type: 'Breakfast', name: 'Protein Pancakes', kcal: 360, protein: 35, prep: '15 min', desc: 'Three small pancakes made with one egg, one scoop protein powder, oat flour, and a mashed banana.', portion_size: '1 egg, 30g protein powder, 40g oat flour, 1 banana' },
    { type: 'Lunch', name: 'Chicken & Chickpea Power Salad', kcal: 440, protein: 48, prep: '10 min', desc: 'Grilled chicken breast, 100 g drained chickpeas, cucumber, spinach, and lemon-garlic dressing.', portion_size: '130g chicken breast, 100g chickpeas (drained), 100g cucumber, 60g spinach' },
    { type: 'Dinner', name: 'Baked Cod with Lentils', kcal: 530, protein: 56, prep: '25 min', desc: 'Baked cod fillet on a bed of 100 g cooked green lentils with roasted tomatoes and a squeeze of lemon.', portion_size: '150g cod fillet, 100g cooked lentils, 100g roasted tomatoes' },
    { type: 'Snack', name: 'Cottage Cheese & Pineapple', kcal: 190, protein: 22, prep: '2 min', desc: '200 g low-fat cottage cheese with a few chunks of tinned pineapple in juice.', portion_size: '200g cottage cheese, 50g tinned pineapple in juice' },
  ], totals: { kcal: 1520, protein: 161 } },
  { day: 'Saturday', meals: [
    { type: 'Breakfast', name: 'High-Protein Full English', kcal: 400, protein: 40, prep: '15 min', desc: 'Two eggs (grilled), two lean turkey rashers, mushrooms, tomatoes, and no toast.', portion_size: '2 eggs, 2 turkey rashers (60g), 100g mushrooms, 100g tomatoes' },
    { type: 'Lunch', name: 'Prawn & Quinoa Bowl', kcal: 450, protein: 48, prep: '10 min', desc: 'King prawns over 80 g quinoa with avocado, cucumber, and a ginger-soy dressing.', portion_size: '150g king prawns, 80g quinoa (cooked), ½ avocado (60g), 100g cucumber' },
    { type: 'Dinner', name: 'Turkey Burger with Salad', kcal: 530, protein: 52, prep: '20 min', desc: '200 g lean turkey burger patty in a wholemeal bun with lettuce, tomato, and Greek yogurt sauce.', portion_size: '200g turkey patty, 1 wholemeal bun (60g), 80g salad leaves and tomato' },
    { type: 'Snack', name: 'Protein Shake', kcal: 180, protein: 25, prep: '2 min', desc: 'One scoop whey protein mixed with water.', portion_size: '30g whey protein, 300ml water' },
  ], totals: { kcal: 1560, protein: 165 } },
  { day: 'Sunday', meals: [
    { type: 'Breakfast', name: 'Eggs Florentine (lighter)', kcal: 380, protein: 32, prep: '15 min', desc: 'Two poached eggs on a bed of wilted spinach on wholemeal toast — no hollandaise.', portion_size: '2 eggs, 100g spinach, 1 slice wholemeal toast (35g)' },
    { type: 'Lunch', name: 'Chicken & Vegetable Stew', kcal: 430, protein: 48, prep: '30 min', desc: 'Diced chicken breast slow-simmered with carrots, celery, and lentils.', portion_size: '150g chicken breast, 80g carrots, 60g celery, 50g lentils (dry)' },
    { type: 'Dinner', name: 'Roast Chicken & Roasted Veg', kcal: 560, protein: 58, prep: '45 min', desc: 'Roast skinless chicken breast with parsnips, carrots, and green beans. Lean high-protein Sunday roast.', portion_size: '175g skinless chicken breast, 100g parsnips, 100g carrots, 100g green beans' },
    { type: 'Snack', name: 'Greek Yogurt & Berries', kcal: 180, protein: 18, prep: '2 min', desc: '150 g 0% Greek yogurt with mixed berries.', portion_size: '150g 0% Greek yogurt, 80g mixed berries' },
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
    { type: 'Breakfast', name: 'Oat & Banana Smoothie Bowl', kcal: 360, protein: 14, prep: '5 min', desc: '50 g oats, banana, soy milk, 1 tbsp almond butter, topped with berries and granola.', portion_size: '50g oats, 1 banana, 200ml soy milk, 1 tbsp almond butter (15g), 30g granola' },
    { type: 'Lunch', name: 'Chickpea & Spinach Salad', kcal: 420, protein: 18, prep: '10 min', desc: 'Tinned chickpeas, baby spinach, cherry tomatoes, cucumber, red onion, and tahini-lemon dressing.', portion_size: '240g chickpeas (drained), 80g spinach, 100g cherry tomatoes, 100g cucumber, 2 tbsp tahini' },
    { type: 'Dinner', name: 'Tofu Stir-Fry with Brown Rice', kcal: 520, protein: 26, prep: '20 min', desc: 'Firm tofu cubes stir-fried with broccoli, peppers, and low-sodium soy sauce, served on brown rice.', portion_size: '200g firm tofu, 40g brown rice (dry), 150g broccoli, 100g peppers' },
    { type: 'Snack', name: 'Coconut Yogurt & Berries', kcal: 200, protein: 4, prep: '2 min', desc: '200 g dairy-free coconut or oat yogurt with a handful of mixed berries.', portion_size: '200g dairy-free yogurt, 80g mixed berries' },
  ], totals: { kcal: 1500, protein: 62 } },
  { day: 'Tuesday', meals: [
    { type: 'Breakfast', name: 'Tofu Scramble on Wholemeal Toast', kcal: 350, protein: 18, prep: '10 min', desc: 'Crumbled firm tofu sautéed with turmeric, spinach, and cherry tomatoes, on wholemeal toast.', portion_size: '150g firm tofu, 1 slice wholemeal toast (35g), 80g spinach, 100g cherry tomatoes' },
    { type: 'Lunch', name: 'Red Lentil & Vegetable Soup', kcal: 370, protein: 16, prep: '30 min', desc: 'Thick red lentil soup with cumin, turmeric, carrot, and onion, with wholemeal bread.', portion_size: '80g red lentils (dry), 100g carrot, 80g onion, 1 small roll (60g)' },
    { type: 'Dinner', name: 'Mushroom & Lentil Bolognese', kcal: 530, protein: 22, prep: '25 min', desc: 'Finely chopped mushrooms and green lentils in a rich tomato sauce, served over wholemeal spaghetti.', portion_size: '80g wholemeal spaghetti (dry), 200g mushrooms, 100g cooked lentils' },
    { type: 'Snack', name: 'Apple & Almond Butter', kcal: 250, protein: 8, prep: '2 min', desc: 'One apple sliced and served with one tablespoon of natural almond butter.', portion_size: '1 apple (180g), 1 tbsp almond butter (15g)' },
  ], totals: { kcal: 1500, protein: 64 } },
  { day: 'Wednesday', meals: [
    { type: 'Breakfast', name: 'Overnight Oats with Nut Butter', kcal: 380, protein: 14, prep: '5 min', desc: '50 g oats soaked in oat milk with a tablespoon of tahini and banana slices.', portion_size: '50g oats, 200ml oat milk, 1 tbsp tahini (15g), 1 banana' },
    { type: 'Lunch', name: 'Tofu & Quinoa Buddha Bowl', kcal: 450, protein: 20, prep: '15 min', desc: 'Baked marinated tofu over 80 g quinoa with roasted peppers, cucumber, avocado, and tahini dressing.', portion_size: '150g baked tofu, 80g quinoa (cooked), 100g roasted peppers, ½ avocado (60g)' },
    { type: 'Dinner', name: 'Black Bean & Sweet Potato Curry', kcal: 480, protein: 18, prep: '25 min', desc: 'Black beans and diced sweet potato in a coconut milk curry sauce with spinach and brown rice.', portion_size: '240g black beans (drained), 200g sweet potato, 100ml coconut milk, 40g brown rice (dry)' },
    { type: 'Snack', name: 'Hummus & Veggie Sticks', kcal: 190, protein: 8, prep: '2 min', desc: '40 g hummus with 100 g carrot and cucumber sticks.', portion_size: '40g hummus, 100g carrot sticks, 100g cucumber' },
  ], totals: { kcal: 1500, protein: 60 } },
  { day: 'Thursday', meals: [
    { type: 'Breakfast', name: 'Smoothie with Hemp Seeds', kcal: 340, protein: 16, prep: '5 min', desc: 'Blended banana, oat milk, 1 scoop plant-based protein powder, 2 tbsp hemp seeds, and berries.', portion_size: '1 banana, 200ml oat milk, 30g plant protein powder, 20g hemp seeds, 80g berries' },
    { type: 'Lunch', name: 'Black Bean Tacos', kcal: 430, protein: 16, prep: '15 min', desc: 'Spiced black beans in two small wholemeal tortillas with shredded cabbage, salsa, avocado, and dairy-free sour cream.', portion_size: '240g black beans (drained), 2 small tortillas (80g), 80g cabbage, ½ avocado (60g)' },
    { type: 'Dinner', name: 'Tofu & Lentil Curry', kcal: 530, protein: 28, prep: '25 min', desc: 'Silken tofu with green lentils in a tomato-based curry sauce, served with a small portion of brown rice.', portion_size: '200g silken tofu, 80g cooked lentils, 200ml tomato curry sauce, 40g brown rice (dry)' },
    { type: 'Snack', name: 'Mixed Nuts & Berries', kcal: 200, protein: 7, prep: '1 min', desc: '30 g mixed unsalted nuts with a small handful of dried berries.', portion_size: '30g mixed nuts, 50g dried berries' },
  ], totals: { kcal: 1500, protein: 67 } },
  { day: 'Friday', meals: [
    { type: 'Breakfast', name: 'Avocado Toast with Nutritional Yeast', kcal: 400, protein: 12, prep: '10 min', desc: 'Two slices wholemeal toast topped with half an avocado, tomato, and nutritional yeast.', portion_size: '2 slices wholemeal toast (70g), ½ avocado (60g), 100g tomato, 2 tbsp nutritional yeast' },
    { type: 'Lunch', name: 'Tofu Caesar Salad', kcal: 390, protein: 22, prep: '10 min', desc: 'Crispy baked tofu cubes over romaine lettuce with plant-based Caesar dressing and nutritional yeast.', portion_size: '150g firm tofu, 100g romaine lettuce, 30ml plant-based dressing, 2 tbsp nutritional yeast' },
    { type: 'Dinner', name: 'Vegetarian Chilli (Vegan)', kcal: 510, protein: 24, prep: '25 min', desc: 'Kidney beans, black beans, and lentils in a smoky tomato chilli, served with brown rice.', portion_size: '120g kidney beans, 120g black beans, 80g cooked lentils, 40g brown rice (dry)' },
    { type: 'Snack', name: 'Tahini & Carrot Sticks', kcal: 200, protein: 8, prep: '2 min', desc: '40 g tahini with 150 g carrot sticks for dipping.', portion_size: '40g tahini, 150g carrot sticks' },
  ], totals: { kcal: 1500, protein: 66 } },
  { day: 'Saturday', meals: [
    { type: 'Breakfast', name: 'Tofu Scramble with Mushrooms', kcal: 360, protein: 20, prep: '10 min', desc: 'Crumbled tofu sautéed with mushrooms, spinach, and nutritional yeast for a cheesy flavour.', portion_size: '200g firm tofu, 150g mushrooms, 80g spinach, 2 tbsp nutritional yeast' },
    { type: 'Lunch', name: 'Lentil & Roasted Veg Bowl', kcal: 420, protein: 18, prep: '30 min', desc: 'Roasted butternut squash, courgette, and peppers over green lentils with tahini dressing.', portion_size: '100g cooked lentils, 150g butternut squash, 100g courgette, 100g peppers' },
    { type: 'Dinner', name: 'Chickpea & Vegetable Curry', kcal: 530, protein: 20, prep: '25 min', desc: 'Tinned chickpeas with spinach, tomato, and coconut milk in a fragrant curry, with brown rice.', portion_size: '240g chickpeas (drained), 100g spinach, 100ml coconut milk, 40g brown rice (dry)' },
    { type: 'Snack', name: 'Energy Balls (homemade)', kcal: 190, protein: 8, prep: '15 min', desc: 'Dates, walnuts, and cacao blended and rolled into balls (~3 balls, 30 g).', portion_size: '3 energy balls (30g total: dates, walnuts, cacao)' },
  ], totals: { kcal: 1500, protein: 66 } },
  { day: 'Sunday', meals: [
    { type: 'Breakfast', name: 'Banana Oat Pancakes', kcal: 380, protein: 12, prep: '15 min', desc: 'Two pancakes made with mashed banana, 50 g oats, soy milk, and a sprinkle of cinnamon.', portion_size: '1 banana, 50g oats, 100ml soy milk' },
    { type: 'Lunch', name: 'Tomato & Chickpea Salad', kcal: 400, protein: 16, prep: '10 min', desc: 'Cherry tomatoes, basil, chickpeas, rocket, and olive oil-balsamic dressing.', portion_size: '240g chickpeas (drained), 200g cherry tomatoes, 40g rocket, 1 tbsp olive oil' },
    { type: 'Dinner', name: 'Lentil Bolognese with Wholemeal Pasta', kcal: 520, protein: 24, prep: '30 min', desc: 'Brown lentils in a rich tomato sauce with mushrooms and herbs, served over wholemeal pasta.', portion_size: '80g wholemeal pasta (dry), 120g cooked lentils, 150g mushrooms' },
    { type: 'Snack', name: 'Peanut Butter & Banana', kcal: 200, protein: 8, prep: '2 min', desc: 'Banana with two tablespoons of natural peanut butter.', portion_size: '1 banana, 2 tbsp peanut butter (30g)' },
  ], totals: { kcal: 1500, protein: 60 } },
];

const PLAN_VEGETARIAN = [
  { day: 'Monday', meals: [
    { type: 'Breakfast', name: 'Oat & Chia Seed Porridge', kcal: 360, protein: 14, prep: '5 min', desc: '50 g oats cooked with soy milk, 1 tbsp chia seeds, topped with sliced banana and a drizzle of honey.', portion_size: '50g oats, 200ml soy milk, 1 tbsp chia seeds (15g), 1 banana' },
    { type: 'Lunch', name: 'Chickpea & Spinach Salad', kcal: 420, protein: 20, prep: '10 min', desc: 'Tinned chickpeas, baby spinach, cherry tomatoes, cucumber, red onion, and lemon-tahini dressing.', portion_size: '240g chickpeas (drained), 60g baby spinach, 150g cherry tomatoes, 1 tbsp tahini (15g)' },
    { type: 'Dinner', name: 'Tofu & Vegetable Stir-Fry', kcal: 520, protein: 28, prep: '20 min', desc: 'Firm tofu cubes stir-fried with broccoli, peppers, and soy sauce, served on brown rice.', portion_size: '150g firm tofu, 200g broccoli, 150g peppers, 80g brown rice (dry)' },
    { type: 'Snack', name: 'Greek Yogurt & Berries', kcal: 200, protein: 15, prep: '2 min', desc: '200 g low-fat Greek yogurt with a handful of mixed berries.', portion_size: '200g low-fat Greek yogurt, 80g mixed berries' },
  ], totals: { kcal: 1500, protein: 77 } },
  { day: 'Tuesday', meals: [
    { type: 'Breakfast', name: 'Scrambled Eggs on Wholemeal Toast', kcal: 350, protein: 22, prep: '10 min', desc: 'Two eggs scrambled with spinach and cherry tomatoes, on a slice of wholemeal toast.', portion_size: '2 eggs, 40g spinach, 100g cherry tomatoes, 1 slice wholemeal toast (40g)' },
    { type: 'Lunch', name: 'Red Lentil Soup', kcal: 370, protein: 18, prep: '30 min', desc: 'Thick red lentil soup with cumin, turmeric, and a wedge of wholemeal bread.', portion_size: '100g red lentils (dry), 1 slice wholemeal bread (40g)' },
    { type: 'Dinner', name: 'Mushroom & Lentil Bolognese', kcal: 530, protein: 24, prep: '25 min', desc: 'Finely chopped mushrooms and green lentils in a rich tomato sauce, served over wholemeal spaghetti.', portion_size: '80g wholemeal spaghetti (dry), 100g green lentils (cooked), 200g mushrooms' },
    { type: 'Snack', name: 'Apple & Peanut Butter', kcal: 250, protein: 7, prep: '2 min', desc: 'One apple sliced and served with one tablespoon of natural peanut butter.', portion_size: '1 apple (180g), 1 tbsp peanut butter (15g)' },
  ], totals: { kcal: 1500, protein: 71 } },
  { day: 'Wednesday', meals: [
    { type: 'Breakfast', name: 'Overnight Oats with Nut Butter', kcal: 380, protein: 16, prep: '5 min', desc: '50 g oats soaked in oat milk with a tablespoon of almond butter and banana slices.', portion_size: '50g oats, 200ml oat milk, 1 tbsp almond butter (15g), 1 banana' },
    { type: 'Lunch', name: 'Halloumi & Quinoa Salad', kcal: 450, protein: 26, prep: '15 min', desc: 'Grilled reduced-fat halloumi over 80 g quinoa with roasted peppers, cucumber, and mint dressing.', portion_size: '80g reduced-fat halloumi, 80g quinoa (dry), 150g roasted peppers, 100g cucumber' },
    { type: 'Dinner', name: 'Egg & Sweet Potato Frittata', kcal: 480, protein: 28, prep: '25 min', desc: 'Four-egg frittata baked with diced sweet potato, spinach, and feta cheese.', portion_size: '4 eggs, 200g sweet potato, 60g spinach, 30g reduced-fat feta' },
    { type: 'Snack', name: 'Cottage Cheese & Cucumber', kcal: 190, protein: 18, prep: '2 min', desc: '200 g low-fat cottage cheese with sliced cucumber.', portion_size: '200g low-fat cottage cheese, 100g cucumber' },
  ], totals: { kcal: 1500, protein: 88 } },
  { day: 'Thursday', meals: [
    { type: 'Breakfast', name: 'Yogurt Parfait', kcal: 340, protein: 20, prep: '5 min', desc: 'Layered 0% Greek yogurt, granola (30 g), and mixed berries.', portion_size: '200g 0% Greek yogurt, 30g granola, 80g mixed berries' },
    { type: 'Lunch', name: 'Black Bean Tacos', kcal: 430, protein: 22, prep: '15 min', desc: 'Spiced black beans in two small wholemeal tortillas with shredded cabbage, salsa, and low-fat sour cream.', portion_size: '240g black beans (drained), 2 small wholemeal tortillas (60g), 80g shredded cabbage' },
    { type: 'Dinner', name: 'Paneer & Spinach Curry', kcal: 530, protein: 30, prep: '25 min', desc: 'Low-fat paneer with spinach in a tomato-based curry sauce, served with a small portion of brown rice.', portion_size: '150g low-fat paneer, 150g spinach, 60g brown rice (dry)' },
    { type: 'Snack', name: 'Hummus & Carrot Sticks', kcal: 200, protein: 7, prep: '2 min', desc: '40 g hummus with 100 g carrot sticks.', portion_size: '40g hummus, 100g carrot sticks' },
  ], totals: { kcal: 1500, protein: 79 } },
  { day: 'Friday', meals: [
    { type: 'Breakfast', name: 'Avocado & Egg Toast', kcal: 400, protein: 20, prep: '10 min', desc: 'Two slices wholemeal toast topped with half a mashed avocado and one poached egg.', portion_size: '2 slices wholemeal toast (80g), half avocado (75g), 1 egg' },
    { type: 'Lunch', name: 'Tofu Caesar Salad', kcal: 390, protein: 24, prep: '10 min', desc: 'Crispy baked tofu cubes over romaine lettuce with a light Caesar-style dressing and Parmesan.', portion_size: '150g firm tofu, 100g romaine lettuce, 1 tbsp Caesar dressing, 15g Parmesan' },
    { type: 'Dinner', name: 'Vegetarian Chilli', kcal: 510, protein: 26, prep: '25 min', desc: 'Kidney beans, black beans, and sweetcorn in a smoky tomato chilli. Served with brown rice.', portion_size: '120g kidney beans (drained), 120g black beans (drained), 80g sweetcorn, 60g brown rice (dry)' },
    { type: 'Snack', name: 'Protein Yogurt & Walnuts', kcal: 200, protein: 14, prep: '2 min', desc: 'Protein yogurt pot with 15 g crushed walnuts.', portion_size: '150g protein yogurt, 15g crushed walnuts' },
  ], totals: { kcal: 1500, protein: 84 } },
  { day: 'Saturday', meals: [
    { type: 'Breakfast', name: 'Spinach & Feta Omelette', kcal: 360, protein: 28, prep: '10 min', desc: 'Three-egg omelette with wilted spinach, 30 g reduced-fat feta, and cherry tomatoes.', portion_size: '3 eggs, 60g wilted spinach, 30g reduced-fat feta, 100g cherry tomatoes' },
    { type: 'Lunch', name: 'Lentil & Roasted Veg Bowl', kcal: 420, protein: 22, prep: '30 min', desc: 'Roasted butternut squash, courgette, and peppers over green lentils with a tahini dressing.', portion_size: '150g butternut squash, 150g courgette, 150g peppers, 120g green lentils (cooked), 1 tbsp tahini' },
    { type: 'Dinner', name: 'Mushroom Risotto (lighter)', kcal: 530, protein: 18, prep: '35 min', desc: 'Arborio rice cooked with mixed mushrooms, low-fat crème fraîche, and Parmesan. Smaller portion.', portion_size: '70g Arborio rice (dry), 200g mixed mushrooms, 2 tbsp low-fat crème fraîche, 15g Parmesan' },
    { type: 'Snack', name: 'Edamame Pods', kcal: 190, protein: 16, prep: '5 min', desc: '200 g edamame pods, lightly salted.', portion_size: '200g edamame pods' },
  ], totals: { kcal: 1500, protein: 84 } },
  { day: 'Sunday', meals: [
    { type: 'Breakfast', name: 'Banana Protein Pancakes', kcal: 380, protein: 22, prep: '15 min', desc: 'Two pancakes made with mashed banana, two eggs, oat flour, and a sprinkle of cinnamon.', portion_size: '1 banana, 2 eggs, 50g oat flour' },
    { type: 'Lunch', name: 'Caprese & Chickpea Salad', kcal: 400, protein: 22, prep: '10 min', desc: 'Buffalo mozzarella, tomato, basil, and chickpeas drizzled with olive oil and balsamic glaze.', portion_size: '125g buffalo mozzarella, 200g tomatoes, 120g chickpeas (drained), 1 tbsp olive oil' },
    { type: 'Dinner', name: 'Nut Roast with Roasted Veg', kcal: 520, protein: 24, prep: '45 min', desc: 'Homemade walnut and lentil nut roast with roasted carrots, parsnips, and a vegetarian gravy.', portion_size: '150g nut roast, 150g carrots, 150g parsnips' },
    { type: 'Snack', name: 'Greek Yogurt & Honey', kcal: 200, protein: 15, prep: '2 min', desc: '200 g 0% Greek yogurt with a teaspoon of honey and a sprinkle of seeds.', portion_size: '200g 0% Greek yogurt, 1 tsp honey, 1 tsp mixed seeds' },
  ], totals: { kcal: 1500, protein: 83 } },
];

const mkSupermarketPlan = (plan, store) =>
  plan.map(day => ({
    ...day,
    meals: day.meals.map(m => ({
      ...m,
      desc: m.desc
        .replace(/brown rice/g, `${store} Brown Rice`)
        .replace(/wholemeal toast/g, `${store} Wholemeal Bread`)
        .replace(/Greek yogurt/g, `${store} Low Fat Greek Yogurt`)
        .replace(/\boats\b/g, `${store} Rolled Oats`)
        .replace(/skimmed milk/g, `${store} Skimmed Milk`),
    })),
  }));

const PLAN_ALDI_1800   = mkSupermarketPlan(PLAN_1800, 'Aldi');
const PLAN_ALDI_HP     = mkSupermarketPlan(PLAN_HIGH_PROTEIN, 'Aldi');
const PLAN_TESCO_1800  = mkSupermarketPlan(PLAN_1800, 'Tesco');
const PLAN_TESCO_HP    = mkSupermarketPlan(PLAN_HIGH_PROTEIN, 'Tesco');
const PLAN_ASDA        = mkSupermarketPlan(PLAN_1800, 'Asda');
const PLAN_ASDA_1500   = mkSupermarketPlan(PLAN_1500, 'Asda');
const PLAN_SAINSBURYS      = mkSupermarketPlan(PLAN_1800, "Sainsbury's");
const PLAN_SAINSBURYS_1500 = mkSupermarketPlan(PLAN_1500, "Sainsbury's");
const PLAN_LIDL            = mkSupermarketPlan(PLAN_1800, 'Lidl');
const PLAN_MORRISONS       = mkSupermarketPlan(PLAN_1800, 'Morrisons');
const PLAN_MORRISONS_1500  = mkSupermarketPlan(PLAN_1500, 'Morrisons');
const PLAN_ICELAND     = mkSupermarketPlan(PLAN_1500, 'Iceland');

const PLAN_2500 = PLAN_2000.map(day => ({
  ...day,
  meals: day.meals.map(m => ({
    ...m,
    kcal: Math.round(m.kcal * 1.25),
    desc: m.desc + ' Scale portions up by roughly 25% and add healthy fats such as avocado or a drizzle of olive oil.',
  })),
  totals: { kcal: 2500, protein: Math.round(day.totals.protein * 1.2) },
}));

export const mealPlansData = {