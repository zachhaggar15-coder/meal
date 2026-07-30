import { getCookingIngredientModels } from './cookingQuantities.js';

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
  ['halloumi', ['halloumi']],
  ['quorn', ['quorn']],
  ['falafel', ['falafel']],
  ['eggs', ['egg']],
  ['lentils', ['lentil']],
  ['beans', ['bean']],
];

export function buildPracticalRecipeSteps(meal = {}) {
  const ingredientList = normaliseIngredients(meal.ingredients, meal.portion_size, meal.name);
  const cookingIngredients = getCookingIngredientModels(ingredientList);
  const ingredientSearch = ingredientList.join(' ').toLowerCase();
  const searchable = `${meal.name || ''} ${ingredientList.join(' ')}`.toLowerCase();
  const name = String(meal.name || '').toLowerCase();
  const prepMinutes = readPrepMinutes(meal);
  const starch = findIngredient(ingredientSearch, ['noodles', 'pasta', 'rice', 'couscous', 'quinoa', 'potato']);
  const proteinCandidates = ['chicken', 'turkey', 'beef', 'lamb', 'pork', 'salmon', 'tuna', 'prawns', 'tofu', 'halloumi', 'quorn', 'falafel', 'eggs', 'lentils', 'beans'];
  const protein = findIngredient(name, proteinCandidates)
    || findIngredient(ingredientSearch, proteinCandidates);
  const isNoCook = prepMinutes <= 5 && (!protein || !needsCooking(protein, searchable));
  const starchDisplayName = findCookingName(cookingIngredients, starchAliases(starch));
  const starchName = starch === 'potato' ? starchDisplayName || starch : starch || starchDisplayName;
  const proteinDisplayName = findCookingName(cookingIngredients, proteinAliases(protein)) || protein;
  const proteinName = normaliseProteinMethodName(protein, proteinDisplayName);
  const vegetables = findCookingNames(
    cookingIngredients,
    /(\bpepper|\bspinach|\bbroccoli|\btomato|\bonion|\bmushroom|\bcourgette|\bcarrot|\bkale|\bpeas\b|\bcabbage|\baubergine|\bcucumber|\bavocado|\bpotato|\blettuce|\brocket|\bleaves|\bwatercress)/i,
  );
  const sauces = findCookingNames(
    cookingIngredients,
    /(dressing|sauce|pesto|paste|glaze|hummus|tahini|yogurt|cream cheese|salsa|oil)/i,
  );
  const tinIngredients = findCookingNames(cookingIngredients, /\b(tinned|canned)\b/i);
  const remainingNames = cookingIngredients.map(item => (
    proseIngredientName(item.displayIngredient || item.ingredient)
  ));

  if (name.includes('overnight') || name.includes('chia')) {
    const bases = findCookingNames(cookingIngredients, /(oats|chia|milk|yogurt|kefir)/i);
    const toppings = withoutNames(remainingNames, bases);
    return [
      `Stir ${joinNatural(bases)} together in a lidded jar or container.`,
      'Stir well, cover and chill for at least 4 hours or overnight.',
      toppings.length
        ? `Stir again before eating, then add ${joinNatural(toppings)}. Loosen with a splash of milk if needed.`
        : 'Stir again before eating and loosen with a splash of milk if needed.',
    ];
  }

  if (name.includes('smoothie')) {
    return [
      `Put ${joinNatural(remainingNames)} in a blender.`,
      'Blend until completely smooth, adding a small splash of water or milk only if needed.',
      'Pour into a glass or shaker and serve cold.',
    ];
  }

  if (name.includes('porridge')) {
    const porridgeBase = findCookingNames(cookingIngredients, /(oats|milk)/i);
    const toppings = withoutNames(remainingNames, porridgeBase);
    return [
      `Put ${joinNatural(porridgeBase)} in a small saucepan and stir to combine.`,
      'Simmer gently for 4-6 minutes, stirring, until the oats are soft and creamy.',
      toppings.length
        ? `Spoon into a bowl and top with ${joinNatural(toppings)}.`
        : 'Spoon into a bowl and serve hot.',
    ];
  }

  if (name.includes('yogurt') || name.includes('cereal') || name.includes('weetabix') || name.includes('bran flakes')) {
    const bases = findCookingNames(cookingIngredients, /(yogurt|skyr|kefir|weetabix|bran flakes|granola|milk|cereal)/i);
    const toppings = withoutNames(remainingNames, bases);
    return [
      `Put ${joinNatural(bases)} in a bowl.`,
      toppings.length
        ? `Top with ${joinNatural(toppings)}.`
        : 'Stir gently and serve.',
      'Eat straight away, or cover and chill for later the same day.',
    ];
  }

  if (name.includes('pancake')) {
    const batter = findCookingNames(cookingIngredients, /(flour|egg|milk)/i);
    const toppings = withoutNames(remainingNames, batter);
    return [
      `Whisk ${joinNatural(batter)} into a smooth batter and leave it to stand for 2 minutes.`,
      'Lightly grease a non-stick pan, then cook small pancakes for 1-2 minutes per side.',
      toppings.length
        ? `Serve with ${joinNatural(toppings)}.`
        : 'Serve while warm.',
    ];
  }

  if (name.includes('fishcake')) {
    const potatoName = findCookingName(cookingIngredients, /sweet potato|potato/i) || 'potato';
    const fishName = findCookingName(cookingIngredients, /tuna|salmon|mackerel|cod/i) || 'fish';
    const onionNames = findCookingNames(cookingIngredients, /spring onion|onion/i);
    const eggName = findCookingName(cookingIngredients, /^eggs?$/i) || 'egg';
    const leaves = findCookingNames(cookingIngredients, /leaves|lettuce|rocket|watercress/i);
    const dressing = findCookingNames(cookingIngredients, /dressing|sauce/i);
    const mixIns = [...onionNames, eggName ? `the ${eggName}` : ''].filter(Boolean);

    return [
      `Cook the ${potatoName.replace(/, cooked and mashed/i, '')} until tender, then mash and leave it to cool slightly.`,
      `Drain the ${stripTinnedPrefix(fishName)}, then mix it with the mashed potato, ${joinNatural(mixIns)}. Season to taste.`,
      'Shape the mixture into evenly sized fishcakes. Cook in a lightly oiled non-stick pan for 3-4 minutes per side, until golden and hot through.',
      `Serve with ${joinNatural([...leaves, ...dressing])}.`,
    ];
  }

  if (name.includes('tikka') && name.includes('raita')) {
    const chicken = findCookingName(cookingIngredients, /chicken/i) || 'chicken';
    const tikkaPaste = findCookingName(cookingIngredients, /tikka paste/i) || 'tikka paste';
    const cauliflower = findCookingName(cookingIngredients, /cauliflower/i) || 'cauliflower';
    const raita = findCookingNames(cookingIngredients, /(yogurt|cucumber|mint)/i);
    return [
      `Stir ${joinNatural(raita)} together to make the raita, then chill while you cook.`,
      `Coat the ${chicken} with the ${tikkaPaste}, then cook in a non-stick pan over medium heat until cooked through.`,
      `Grate or pulse the ${cauliflower} into rice-sized pieces. Cook in a dry pan for 4-5 minutes, stirring, until just tender.`,
      'Serve the chicken over the cauliflower rice with the cold raita on the side.',
    ];
  }

  if (name.includes('keema') && name.includes('cauliflower')) {
    const mince = findCookingName(cookingIngredients, /lamb|beef|mince/i) || proteinName;
    const cauliflower = findCookingName(cookingIngredients, /cauliflower/i) || 'cauliflower';
    const aromatics = findCookingNames(cookingIngredients, /(onion|garlic|ginger)/i);
    const seasoning = findCookingNames(cookingIngredients, /(masala|spice|cumin|paprika)/i);
    const peas = findCookingNames(cookingIngredients, /\bpeas\b/i);
    return [
      `Grate or pulse the ${cauliflower} into rice-sized pieces and set aside.`,
      `Soften ${joinNatural(aromatics)} in a large non-stick pan over medium heat for 4-5 minutes.`,
      `Add the ${mince} and cook until browned, breaking it up with a spoon. Stir in ${joinNatural([...seasoning, ...peas])} and cook until hot through.`,
      'Cook the cauliflower rice in a separate dry pan for 4-5 minutes, stirring, then season and serve with the keema.',
    ];
  }

  if (name.includes('nicoise') || name.includes('niçoise')) {
    const potatoes = findCookingName(cookingIngredients, /potato/i) || 'potatoes';
    const eggs = findCookingName(cookingIngredients, /^eggs?$/i) || 'egg';
    const beans = findCookingName(cookingIngredients, /green beans/i) || 'green beans';
    const tuna = findCookingName(cookingIngredients, /tuna/i) || 'tuna';
    const tomatoes = findCookingName(cookingIngredients, /tomato/i);
    const olives = findCookingName(cookingIngredients, /olive/i);
    return [
      `Boil the ${potatoes} in lightly salted water until tender, then drain and cool slightly.`,
      `Boil the ${eggs} for 8-9 minutes, adding the ${beans} for the final 4 minutes. Cool under cold water, then peel and halve the egg.`,
      `Drain the ${stripTinnedPrefix(tuna)}${tomatoes ? ` and halve the ${tomatoes}` : ''}${olives ? `; drain the ${olives} if needed` : ''}.`,
      'Arrange everything in a bowl, season with black pepper and serve.',
    ];
  }

  if (name.includes('egg fried') || name.includes('fried rice')) {
    const rice = findCookingName(cookingIngredients, /\brice\b/i) || 'rice';
    const eggs = findCookingName(cookingIngredients, /^eggs?$/i) || 'eggs';
    const stirFryVegetables = findCookingNames(
      cookingIngredients,
      /(mixed veg|peas|pepper|spring onion|carrot|beansprout|edamame)/i,
    );
    const cookedProtein = findCookingName(cookingIngredients, /prawn|chicken|tofu/i);
    const seasonings = findCookingNames(cookingIngredients, /(soy sauce|tamari|sesame oil)/i);
    const steps = [
      `Cook the ${rice} according to its packet instructions, then spread it on a plate to cool slightly.`,
    ];
    if (cookedProtein) steps.push(cookProteinStep(cookedProtein));
    steps.push(
      `Stir-fry ${joinNatural(stirFryVegetables)} in a large non-stick pan for 3-4 minutes. Push them to one side, add the beaten ${eggs}, and stir until softly set.`,
      `Add the cooled rice${cookedProtein ? ` and ${cookedProtein}` : ''}, stir in ${joinNatural(seasonings)}, and toss over high heat until piping hot.`,
    );
    return steps;
  }

  if (name.includes('full english')) {
    const cookedItems = findCookingNames(cookingIngredients, /(bacon|sausage)/i);
    const vegetables = findCookingNames(cookingIngredients, /(mushroom|tomato)/i);
    const beans = findCookingName(cookingIngredients, /baked beans/i);
    const eggs = findCookingName(cookingIngredients, /^eggs?$/i) || 'eggs';
    const toast = findCookingName(cookingIngredients, /bread/i);
    return [
      `Cook ${joinNatural(cookedItems)} in a non-stick pan until browned and cooked through.`,
      `Add ${joinNatural(vegetables)} to the pan and cook until softened; warm the ${beans} gently in a small saucepan.`,
      `Cook the ${eggs} to your liking and toast the ${toast}.`,
      'Serve everything together while hot.',
    ];
  }

  if (name.includes('lettuce cups')) {
    const mince = findCookingName(cookingIngredients, /mince|turkey|beef|pork/i) || proteinName;
    const leaves = findCookingName(cookingIngredients, /lettuce|leaves/i) || 'lettuce leaves';
    const aromatics = findCookingNames(cookingIngredients, /(garlic|ginger|onion)/i);
    const fillings = findCookingNames(cookingIngredients, /(carrot|pepper|spring onion|peas)/i);
    const sauce = findCookingNames(cookingIngredients, /(hoisin|soy sauce|tamari)/i);
    return [
      `Separate, rinse and dry the ${leaves}, keeping them whole so they can hold the filling.`,
      `Cook the ${mince} with ${joinNatural(aromatics)} in a large non-stick pan, breaking it up, until browned.`,
      `Stir in ${joinNatural([...fillings, ...sauce])} and cook for 2-3 minutes until hot through.`,
      'Spoon the filling into the lettuce leaves and serve immediately.',
    ];
  }

  if (name.includes('egg') || protein === 'eggs' || name.includes('omelette')) {
    const carrier = findCookingNames(cookingIngredients, /(bread|toast|bagel|pitta)/i);
    const accompaniments = withoutNames(remainingNames, [
      ...findCookingNames(cookingIngredients, /^eggs?$/i),
      ...vegetables,
      ...carrier,
    ]);
    return [
      vegetables.length
        ? `Slice or chop ${joinNatural(vegetables)}, then cook them in a non-stick pan over medium heat until softened.`
        : 'Crack the eggs into a bowl, season lightly and whisk with a fork.',
      name.includes('boiled') || name.includes('poached')
        ? 'Cook the eggs to your preferred set: 5-6 minutes for soft-boiled, or poach gently until the whites are set.'
        : 'Cook the eggs in a non-stick pan over medium heat, stirring for a scramble or folding for an omelette.',
      carrier.length
        ? `Toast ${joinNatural(carrier)}, then serve with the eggs${accompaniments.length ? ` and ${joinNatural(accompaniments)}` : ''}.`
        : `Season to taste and serve${accompaniments.length ? ` with ${joinNatural(accompaniments)}` : ''}.`,
    ];
  }

  if (name.includes('toast') || name.includes('bagel') || name.includes('wrap') || name.includes('sandwich') || name.includes('pitta')) {
    const carriers = findCookingNames(cookingIngredients, /(bread|bagel|wrap|tortilla|pitta|roll)/i);
    const filling = withoutNames(remainingNames, carriers);
    return [
      `${name.includes('sandwich') ? 'Lay out' : 'Toast or warm'} ${joinNatural(carriers)}.`,
      protein && needsCooking(protein, searchable)
        ? `Cook the ${proteinName} in a non-stick pan over medium heat until cooked through, then rest briefly and slice it.`
        : `Drain, slice or mash ${joinNatural(filling)} as appropriate.`,
      `Layer ${joinNatural(filling)} evenly, season to taste, and serve or wrap tightly for later.`,
    ];
  }

  if (name.includes('salad') || name.includes('bowl')) {
    const leafy = findCookingNames(cookingIngredients, /leaves|lettuce|rocket|watercress|spinach/i);
    const choppedVegetables = withoutNames(
      vegetables.filter(item => !/(peas|mixed veg|green beans)/i.test(item)),
      [...leafy, starchName],
    );
    const carriers = findCookingNames(cookingIngredients, /(bread|bagel|wrap|tortilla|pitta|roll)/i);
    const eggs = findCookingNames(cookingIngredients, /^eggs?$/i);
    const steps = [];
    if (starch) {
      steps.push(
        /roast/i.test(name) && /potato/i.test(starchName)
          ? `Cut the ${starchName} into even chunks and roast at 200°C (180°C fan) for 20-25 minutes, until tender and browned. Cool slightly.`
          : cookStarchStep(starchName, { cool: true }),
      );
    }
    if (eggs.length) {
      steps.push(`Boil the ${joinNatural(eggs)} for 8-9 minutes, then cool under cold water, peel and halve.`);
    }
    if (protein && needsCooking(protein, searchable)) {
      steps.push(cookProteinStep(proteinName, { finish: 'Rest briefly before slicing if needed.' }));
    } else if (tinIngredients.length) {
      steps.push(drainTinnedStep(tinIngredients));
    }
    if (choppedVegetables.length || leafy.length) {
      if (leafy.length && choppedVegetables.length) {
        steps.push(`Rinse ${joinNatural(leafy)}, then slice or chop ${joinNatural(choppedVegetables)}.`);
      } else if (leafy.length) {
        steps.push(`Rinse and dry ${joinNatural(leafy)}.`);
      } else {
        steps.push(`Slice or chop ${joinNatural(choppedVegetables)}.`);
      }
    }
    if (carriers.length) {
      steps.push(`Toast or warm ${joinNatural(carriers)} just before serving.`);
    }
    const hasDressing = sauces.some(item => /dressing/i.test(item));
    steps.push(
      `Arrange everything in a bowl${sauces.length ? ` and finish with ${joinNatural(sauces)}` : ''}.${hasDressing ? ' Keep the dressing separate if packing ahead.' : ''}`,
    );
    return steps.slice(0, 5);
  }

  if (name.includes('curry') || name.includes('chilli') || name.includes('stew') || name.includes('soup')) {
    const aromatics = findCookingNames(cookingIngredients, /(onion|garlic|ginger|celery|carrot)/i);
    const firmVegetables = withoutNames(
      vegetables.filter(item => (
        !/(spinach|leaves|peas|watercress|rocket)/i.test(item)
        && !/\b(tinned|canned)\b/i.test(item)
      )),
      aromatics,
    );
    const flavourings = findCookingNames(
      cookingIngredients,
      /(paste|powder|paprika|cumin|masala|herbs|stock|tomato|coconut milk|sauce)/i,
    );
    const usableFirmVegetables = withoutNames(firmVegetables, flavourings);
    const pulseTins = tinIngredients.filter(item => /(bean|chickpea|lentil)/i.test(item));
    const separateStarchNames = starch && starch !== 'potato'
      ? [starchName, starchDisplayName]
      : [];
    const additions = withoutNames(
      remainingNames,
      [...aromatics, ...usableFirmVegetables, ...flavourings, proteinName, proteinDisplayName, ...separateStarchNames],
    );
    const preparation = [
      aromatics.length || usableFirmVegetables.length
        ? `Peel and chop ${joinNatural([...aromatics, ...usableFirmVegetables])} into even pieces.`
        : '',
      pulseTins.length
        ? `Drain and rinse ${joinNatural(pulseTins.map(stripTinnedPrefix))}.`
        : '',
    ].filter(Boolean).join(' ');
    return [
      preparation || `Have ${joinNatural(remainingNames)} ready by the hob.`,
      protein && needsCooking(protein, searchable)
        ? `Heat a large pan over medium heat and brown the ${proteinName}${aromatics.length ? ` with ${joinNatural(aromatics)}` : ''} for 5-7 minutes.`
        : aromatics.length || usableFirmVegetables.length
          ? `Heat a large pan over medium heat and soften ${joinNatural([...aromatics, ...usableFirmVegetables])} for 5-7 minutes.`
          : 'Heat a large pan over medium heat.',
      `Stir in ${joinNatural(flavourings)}, then add ${joinNatural(additions)} and simmer gently until tender and thickened.`,
      starch && starch !== 'potato'
        ? cookStarchStep(starchName, { prefix: 'Meanwhile, ', serveAlongside: true })
        : 'Taste, season and portion for serving.',
    ];
  }

  if (starch) {
    const nonStarch = withoutNames(remainingNames, [starchName]);
    return [
      cookStarchStep(starchName),
      protein && needsCooking(protein, searchable)
        ? vegetables.length
          ? `${cookProteinStep(proteinName, { prefix: 'Meanwhile, ' })} Add ${joinNatural(vegetables)} and cook until tender.`
          : cookProteinStep(proteinName, { prefix: 'Meanwhile, ' })
        : `Meanwhile, prepare ${joinNatural(nonStarch)} and warm everything gently in a pan.`,
      sauces.length
        ? `Fold the cooked ${starchName} through the pan, stir in ${joinNatural(sauces)}, and heat through before serving.`
        : `Fold the cooked ${starchName} through the pan, season to taste and serve hot.`,
    ];
  }

  if (isNoCook) {
    const drainables = findCookingNames(cookingIngredients, /^(tinned|canned)\b|beans|chickpeas|lentils/i);
    const fresh = withoutNames(remainingNames, drainables);
    return [
      drainables.length
        ? drainTinnedStep(drainables)
        : `Slice or portion ${joinNatural(fresh)} as needed.`,
      drainables.length && fresh.length
        ? `Slice or portion ${joinNatural(fresh)} as needed.`
        : 'Have a bowl or lidded container ready.',
      `Assemble everything in the bowl or container${sauces.length ? `, adding ${joinNatural(sauces)} just before eating` : ''}.`,
    ];
  }

  return [
    vegetables.length
      ? `Slice or chop ${joinNatural(vegetables)} and have the remaining ingredients ready.`
      : `Prepare ${joinNatural(remainingNames)} as described in the ingredient list.`,
    protein && needsCooking(protein, searchable)
      ? `Cook the ${proteinName} in a non-stick pan over medium heat until cooked through.`
      : 'Cook the firmer vegetables in a non-stick pan over medium heat until tender.',
    sauces.length
      ? `Add the remaining ingredients, stir in ${joinNatural(sauces)}, heat through, then taste and serve.`
      : 'Add the remaining ingredients in the order needed to warm them through, then taste and serve.',
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
    const recipeReferenceText = label === 'rice'
      ? recipeText.toLowerCase().replace(/\b(?:cauliflower rice|rice-sized)\b/g, '')
      : recipeText.toLowerCase();
    if (!recipeReferenceText.includes(label)) continue;
    if (!aliases.some(alias => ingredientText.includes(alias))) {
      issues.push(`instruction mentions ${label} but ingredients do not`);
    }
  }

  return [...new Set(issues)];
}

function findCookingName(models, matcher) {
  if (!matcher) return '';
  const match = models.find(model => matchesIngredient(model.ingredient, matcher));
  return match ? proseIngredientName(match.displayIngredient || match.ingredient) : '';
}

function findCookingNames(models, matcher) {
  return uniqueNames(
    models
      .filter(model => matchesIngredient(model.ingredient, matcher))
      .map(model => proseIngredientName(model.displayIngredient || model.ingredient)),
  );
}

function matchesIngredient(ingredient, matcher) {
  if (matcher instanceof RegExp) {
    matcher.lastIndex = 0;
    return matcher.test(ingredient);
  }
  if (Array.isArray(matcher)) {
    return matcher.some(candidate => ingredient.includes(candidate));
  }
  return String(ingredient).includes(String(matcher));
}

function proseIngredientName(value) {
  return String(value || '')
    .replace(/\s*,\s*$/, '')
    .replace(/^(.+),\s+(grated|roasted|baked|sliced|chopped)$/i, '$2 $1')
    .replace(/\bweetabix\b/gi, 'Weetabix')
    .replace(/\bquorn\b/gi, 'Quorn')
    .replace(/\bgreek\b/gi, 'Greek')
    .trim();
}

function starchAliases(starch) {
  return {
    noodles: ['noodle', 'soba'],
    pasta: ['pasta', 'orzo', 'spaghetti'],
    rice: ['rice'],
    couscous: ['couscous'],
    quinoa: ['quinoa'],
    potato: ['potato'],
  }[starch] || [];
}

function proteinAliases(protein) {
  return INGREDIENT_ALIASES.find(([label]) => label === protein)?.[1] || (protein ? [protein] : []);
}

function normaliseProteinMethodName(protein, displayName) {
  const name = stripTinnedPrefix(displayName);
  if (protein === 'tofu') return name.replace(/^(?:firm|silken)\s+/i, '') || 'tofu';
  if (protein === 'eggs') return 'eggs';
  return name || protein;
}

function withoutNames(values, excluded) {
  const blocked = new Set((excluded || []).map(normaliseNameKey));
  return uniqueNames((values || []).filter(value => !blocked.has(normaliseNameKey(value))));
}

function uniqueNames(values) {
  return [...new Set((values || []).map(value => String(value || '').trim()).filter(Boolean))];
}

function normaliseNameKey(value) {
  return String(value || '')
    .replace(/^tinned\s+/i, '')
    .replace(/\s+in (?:spring water|brine)$/i, '')
    .toLowerCase()
    .trim();
}

function stripTinnedPrefix(value) {
  return String(value || '')
    .replace(/^tinned\s+/i, '')
    .replace(/\s+tinned$/i, '')
    .replace(/\s+in (?:spring water|brine)$/i, '')
    .trim();
}

function drainTinnedStep(values) {
  const ingredients = (values || []).map(stripTinnedPrefix);
  const hasPulses = ingredients.some(item => /(bean|chickpea|lentil)/i.test(item));
  const drained = `Drain ${joinNatural(ingredients)}`;
  return hasPulses
    ? `${drained}; rinse the pulses under cold water.`
    : `${drained}.`;
}

function joinNatural(values, fallback = 'the listed ingredients') {
  const items = uniqueNames(values);
  if (!items.length) return fallback;
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`;
}

function cookProteinStep(proteinName, { prefix = '', finish = '' } = {}) {
  const protein = String(proteinName || 'protein');
  let finishText = finish;
  let instruction;

  if (/prawn/i.test(protein)) {
    instruction = `cook the ${protein} in a non-stick pan over medium heat for 3-4 minutes, turning, until pink and opaque`;
    finishText = '';
  } else if (/halloumi/i.test(protein)) {
    instruction = `cook the ${protein} in a dry non-stick pan for 2-3 minutes per side, until golden`;
    finishText = '';
  } else if (/(salmon|mackerel|cod|fish|tuna steak)/i.test(protein)) {
    instruction = `cook the ${protein} in a non-stick pan over medium heat until opaque and it flakes easily`;
  } else if (/(mince|tofu|beans|lentils)/i.test(protein)) {
    instruction = `cook the ${protein} in a non-stick pan over medium heat, stirring, until browned and hot through`;
    finishText = '';
  } else {
    instruction = `cook the ${protein} in a non-stick pan over medium heat until cooked through`;
  }

  const firstLetter = prefix ? instruction : instruction.charAt(0).toUpperCase() + instruction.slice(1);
  const ending = finishText ? `. ${finishText}` : '.';
  return `${prefix}${firstLetter}${ending}`;
}

function cookStarchStep(starchName, { prefix = '', cool = false, serveAlongside = false } = {}) {
  const starch = String(starchName || 'starch');
  let instruction;

  if (/sweet potato/i.test(starch)) {
    instruction = `cut the ${starch} into even chunks and boil in lightly salted water until tender`;
  } else if (/potato/i.test(starch)) {
    instruction = `boil the ${starch} in lightly salted water until tender`;
  } else {
    const pronoun = /(noodles|potatoes)/i.test(starch) ? 'their' : 'its';
    instruction = `cook the ${starch} according to ${pronoun} packet instructions`;
  }

  if (cool) instruction += ', then drain and cool slightly';
  else if (serveAlongside) instruction += ' and serve alongside';
  else instruction += ', then drain if needed';

  const sentence = prefix
    ? instruction
    : instruction.charAt(0).toUpperCase() + instruction.slice(1);
  return `${prefix}${sentence}.`;
}

function normaliseIngredients(value, portionSize, mealName) {
  if (Array.isArray(value) && value.length) {
    return value.map(item => {
      if (item && typeof item === 'object') {
        const name = item.item || item.name || item.ingredient || '';
        const amount = item.amount || item.quantity || '';
        return `${name}${amount ? ` ${amount}` : ''}`.trim();
      }
      return String(item || '').trim();
    }).filter(Boolean);
  }
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

function hasExpectedQuantity(value) {
  const text = String(value || '');
  if (/\bexcluded from nutrition estimate\b/i.test(text)) return true;
  if (/\b(to taste|pinch|drop|handful|half|quarter)\b/i.test(text)) return true;
  return /\d/.test(text);
}
