const PLACEHOLDER_PATTERNS = [
  /\bcook (?:the )?pasta,?\s*rice or noodles\b/i,
  /\badd (?:your )?chosen protein\b/i,
  /\bcook until done\b/i,
  /\bcombine all ingredients\b/i,
  /\bcook the main protein or vegetables\b/i,
  /\bcereal or yogurt\b/i,
  /\bbread, bagel, wrap or pitta\b/i,
  /\btins, stock, sauce, spices or pulses\b/i,
  /\bvegetables or sauce\b/i,
  /\bseasoning or sauce\b/i,
];

const INGREDIENT_ALIASES = [
  ['noodles', ['noodle', 'soba']],
  ['pasta', ['pasta', 'orzo', 'spaghetti']],
  ['rice', ['rice']],
  ['couscous', ['couscous']],
  ['quinoa', ['quinoa']],
  ['potato', ['potato']],
  ['chicken', ['chicken']],
  ['turkey', ['turkey']],
  ['beef', ['beef', 'mince']],
  ['lamb', ['lamb']],
  ['pork', ['pork']],
  ['salmon', ['salmon']],
  ['tuna', ['tuna']],
  ['prawns', ['prawn']],
  ['tofu', ['tofu']],
  ['eggs', ['egg']],
  ['lentils', ['lentil']],
  ['beans', ['bean']],
];

export function buildPracticalRecipeSteps(meal = {}) {
  const ingredientList = normaliseIngredients(meal.ingredients, meal.portion_size, meal.name);
  const ingredientsText = ingredientList.join(', ');
  const ingredientSearch = ingredientList.join(' ').toLowerCase();
  const searchable = `${meal.name || ''} ${ingredientList.join(' ')}`.toLowerCase();
  const name = String(meal.name || '').toLowerCase();
  const prepMinutes = readPrepMinutes(meal);
  const starch = findIngredient(ingredientSearch, ['noodles', 'pasta', 'rice', 'couscous', 'quinoa', 'potato']);
  const protein = findIngredient(ingredientSearch, ['chicken', 'turkey', 'beef', 'lamb', 'pork', 'salmon', 'tuna', 'prawns', 'tofu', 'eggs', 'lentils', 'beans']);
  const isNoCook = prepMinutes <= 5 && (!protein || !needsCooking(protein, searchable));
  const vegetables = ingredientList.filter(item => (
    /(pepper|spinach|broccoli|tomato|onion|mushroom|courgette|carrot|kale|peas|cabbage|aubergine|cucumber|lettuce|rocket)/i.test(item)
  ));

  if (name.includes('overnight') || name.includes('chia')) {
    return [
      `Add ${ingredientsText} to a lidded container.`,
      'Stir well, cover and chill for at least 4 hours or overnight.',
      'Stir again before eating; loosen with a small splash of the listed milk if needed.',
    ];
  }

  if (name.includes('smoothie')) {
    return [
      `Add ${ingredientsText} to a blender.`,
      'Blend until smooth, adding a small splash of water or the listed milk only if needed.',
      'Pour into a glass or shaker and serve cold.',
    ];
  }

  if (name.includes('porridge')) {
    return [
      `Put the oats and listed milk in a saucepan: ${ingredientsText}.`,
      'Simmer gently for 4-6 minutes, stirring, until the oats are soft and creamy.',
      'Spoon into a bowl and add the listed fruit, nuts or sweetener.',
    ];
  }

  if (name.includes('yogurt') || name.includes('cereal') || name.includes('weetabix') || name.includes('bran flakes')) {
    const base = name.includes('yogurt')
      ? 'yogurt'
      : name.includes('weetabix')
        ? 'Weetabix'
        : name.includes('bran flakes')
          ? 'bran flakes'
          : 'cereal';
    return [
      `Add the ${base} to a bowl: ${ingredientsText}.`,
      'Top with the fruit, nuts, seeds or honey named in the ingredient list.',
      'Eat straight away, or cover and chill for later the same day.',
    ];
  }

  if (name.includes('pancake')) {
    return [
      `Whisk the flour, eggs and milk from the ingredient list into a smooth batter: ${ingredientsText}.`,
      'Cook small pancakes in a lightly greased non-stick pan for 1-2 minutes per side.',
      'Serve with the listed yogurt and fruit.',
    ];
  }

  if (name.includes('egg') || protein === 'eggs' || name.includes('omelette')) {
    const vegText = vegetables.length ? ` Cook ${vegetables.join(' and ')} first until softened.` : '';
    return [
      `Prepare the eggs and accompaniments: ${ingredientsText}.${vegText}`,
      name.includes('boiled') || name.includes('poached')
        ? 'Cook the eggs to your preferred set, following standard hob timings.'
        : 'Cook the eggs in a non-stick pan over medium heat, stirring for a scramble or folding for an omelette.',
      'Season to taste and serve with the remaining prepared accompaniments.',
    ];
  }

  if (name.includes('toast') || name.includes('bagel') || name.includes('wrap') || name.includes('sandwich') || name.includes('pitta')) {
    const carrier = name.includes('bagel')
      ? 'bagel'
      : name.includes('wrap')
        ? 'wrap'
        : name.includes('pitta')
          ? 'pitta'
          : 'bread';
    return [
      `Toast or warm the ${carrier}, then prepare the filling: ${ingredientsText}.`,
      protein && needsCooking(protein, searchable)
        ? `Cook the ${protein} in a non-stick pan over medium heat until cooked through, then slice or flake it.`
        : 'Drain, slice or mash the filling ingredients as needed.',
      'Layer the filling evenly, season with the listed herbs or sauce, and serve or wrap tightly for later.',
    ];
  }

  if (name.includes('salad') || name.includes('bowl')) {
    const steps = [
      `Wash and chop the salad and vegetable ingredients: ${ingredientsText}.`,
    ];
    if (starch) steps.push(`Cook the ${starch} according to its packet instructions, then cool slightly.`);
    if (protein && needsCooking(protein, searchable)) {
      steps.push(`Cook the ${protein} in a non-stick pan over medium heat until cooked through.`);
    }
    steps.push('Combine the prepared ingredients, add the listed dressing or seasoning, and keep dressing separate if packing ahead.');
    return steps.slice(0, 4);
  }

  if (name.includes('curry') || name.includes('chilli') || name.includes('stew') || name.includes('soup')) {
    return [
      `Chop and measure the listed ingredients: ${ingredientsText}.`,
      protein && needsCooking(protein, searchable)
        ? `Brown the ${protein} with the onion or firmer vegetables in a pan over medium heat.`
        : 'Soften the onion and firmer vegetables in a pan over medium heat.',
      'Add the remaining measured ingredients and simmer gently until the vegetables are tender and the dish has thickened.',
      starch ? `Cook the ${starch} separately according to its packet instructions and serve alongside.` : 'Taste, season and portion for serving.',
    ];
  }

  if (starch) {
    const remaining = protein || (vegetables[0] ? stripQuantity(vegetables[0]) : 'sauce and vegetables');
    return [
      `Cook the ${starch} according to its packet instructions, then drain if needed.`,
      protein && needsCooking(protein, searchable)
        ? `Meanwhile, cook the ${protein} in a non-stick pan over medium heat until cooked through; add the listed vegetables.`
        : `Meanwhile, prepare the ${remaining} and warm it with the remaining listed ingredients.`,
      `Fold the cooked ${starch} through the prepared ${remaining}, add the listed seasoning and heat through before serving.`,
    ];
  }

  if (isNoCook) {
    return [
      `Lay out the listed ingredients: ${ingredientsText}.`,
      'Drain, slice or portion each ingredient as needed.',
      'Assemble in a bowl or container, add any listed dressing and seasoning, and serve cold.',
    ];
  }

  return [
    `Chop and measure the listed ingredients: ${ingredientsText}.`,
    protein && needsCooking(protein, searchable)
      ? `Cook the ${protein} in a non-stick pan over medium heat until cooked through.`
      : 'Cook the firmer vegetables in a non-stick pan over medium heat until tender.',
    'Add the remaining listed ingredients in the order needed to warm them through, then season and serve.',
  ];
}

export function validateRecipeQuality(meal = {}) {
  const issues = [];
  const ingredients = normaliseIngredients(meal.ingredients, meal.portion_size, meal.name);
  const steps = Array.isArray(meal.recipe) ? meal.recipe : [];
  const recipeText = steps.join(' ');
  const ingredientText = ingredients.join(' ').toLowerCase();

  if (!ingredients.length) issues.push('missing ingredients');
  if (!steps.length) issues.push('missing cooking method');
  if (steps.some(step => PLACEHOLDER_PATTERNS.some(pattern => pattern.test(step)))) {
    issues.push('placeholder language');
  }
  if (ingredients.some(item => !hasExpectedQuantity(item))) {
    issues.push('ingredient missing quantity');
  }

  for (const [label, aliases] of INGREDIENT_ALIASES) {
    if (!recipeText.toLowerCase().includes(label)) continue;
    if (!aliases.some(alias => ingredientText.includes(alias))) {
      issues.push(`instruction mentions ${label} but ingredients do not`);
    }
  }

  return [...new Set(issues)];
}

function normaliseIngredients(value, portionSize, mealName) {
  if (Array.isArray(value) && value.length) return value.map(String).map(item => item.trim()).filter(Boolean);
  if (typeof value === 'string' && value.trim()) return value.split(',').map(item => item.trim()).filter(Boolean);
  if (portionSize) return String(portionSize).split(',').map(item => item.trim()).filter(Boolean);
  return mealName ? [String(mealName)] : [];
}

function findIngredient(searchable, candidates) {
  for (const candidate of candidates) {
    const aliases = INGREDIENT_ALIASES.find(([label]) => label === candidate)?.[1] || [candidate];
    if (aliases.some(alias => searchable.includes(alias))) return candidate;
  }
  return '';
}

function readPrepMinutes(meal) {
  if (Number.isFinite(Number(meal.prepMins))) return Number(meal.prepMins);
  const match = String(meal.prep || '').match(/\d+/);
  return match ? Number(match[0]) : 15;
}

function needsCooking(protein, searchable = '') {
  if (['beans', 'lentils'].includes(protein)) return false;
  if (protein === 'tuna' && /(tinned|canned|tin of|tuna pouch)/.test(searchable)) return false;
  if (protein === 'salmon' && /smoked salmon/.test(searchable)) return false;
  return true;
}

function stripQuantity(value) {
  return String(value || '').replace(/\s+\d.*$/, '').trim().toLowerCase();
}

function hasExpectedQuantity(value) {
  const text = String(value || '');
  if (/\bexcluded from nutrition estimate\b/i.test(text)) return true;
  if (/\b(to taste|pinch|drop|handful|half|quarter)\b/i.test(text)) return true;
  return /\d/.test(text);
}
