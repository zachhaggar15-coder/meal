import { getCookingIngredientModels } from './cookingQuantities.js';
import { parseIngredientLine } from './ingredientParser.js';
import {
  PROTEIN_FAMILIES,
  PULSE_STATE,
  STARCH_FAMILIES,
  findProtein,
  findStarch,
  hasCookingLiquid,
  isAlreadyPreparedIngredient,
  isDryPulseName,
  isPulseProteinFamily,
  isSoupSideAccompaniment,
  proteinAliasesFor,
  pulseNeedsCooking,
  resolvePulseState,
  starchAliasesFor,
} from './ingredientRoles.js';

// Shared vegetable vocabulary, extended from the actual ingredient
// inventory across every recipe source. The original list omitted green
// beans, celery, parsnips, sweetcorn, leek, asparagus, squash,
// cauliflower, edamame and the "mixed veg" style names, so those were
// silently dropped from chopping/roasting steps and ended up in generic
// "serve with" clauses instead.
const VEGETABLE_PATTERN = /(\bpepper|\bspinach|\bbroccoli|\btomato|\bonion|\bmushroom|\bcourgette|\bcarrot|\bkale|\bpeas\b|\bcabbage|\baubergine|\bcucumber|\bavocado|\bpotato|\blettuce|\brocket|\bleaves|\bwatercress|\bgreen bean|\bcelery|\bparsnip|\bsweetcorn|\bleek|\basparagus|\bsquash\b|\bcauliflower|\bpak choi|\bbok choy|\bedamame|\bbeansprout|\bveg\b|\bgreens\b|\bbeetroot|\bswede\b|\bturnip|\bradish|\bfennel)/i;

// The bread-style carrier a toast/wrap/sandwich dish is built on. "toast"
// belongs here because legacy plans name the ingredient itself that way
// ("1 slice wholemeal toast") — without it, an avocado-toast method opened
// with "Toast or warm the listed ingredients" because it found no carrier.
// Vegetables that need no knife work: sold ready-trimmed, frozen or
// pre-cut. They belong in the pot but never in a "peel and chop" step.
const READY_TO_USE_VEGETABLE = /\b(sweetcorn|frozen|green beans?|beansprouts?|edamame|mixed veg|stir-fry veg|peas)\b/i;

// Herbs, spices and citrus that season a dish rather than form its body.
const SEASONING_PATTERN = /\b(herbs?|spices?|cumin|coriander|turmeric|paprika|cinnamon|oregano|basil|thyme|rosemary|parsley|dill|mint|chilli|cayenne|masala|ras el hanout|garam|nutmeg|lemon juice|lime juice|zest)\b/i;

// What a soup/stew/curry "stirs in" to build its base: liquid and sauce
// bases plus the whole seasoning vocabulary above. The earlier short list
// omitted turmeric, coriander, ginger and the rest, so those were never
// stirred in and got duplicated into the "have ready" step instead.
const FLAVOURING_PATTERN = /\b(paste|powder|stock|tomato|coconut milk|sauce|passata|ginger|herbs?|spices?|cumin|coriander|turmeric|paprika|cinnamon|oregano|basil|thyme|rosemary|parsley|dill|mint|chilli|cayenne|masala|ras el hanout|garam|nutmeg)\b/i;

const BREAD_CARRIER_PATTERN = /(bread|toast|bagel|wrap|tortilla|pitta|roll)/i;

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

// Used only by validateRecipeQuality's "method mentions X but the
// ingredient list doesn't have it" cross-check below. Derived from the
// centralised protein/starch definitions in ingredientRoles.js rather than
// duplicated, so a protein or starch added there (e.g. cod, haddock) is
// automatically covered by this cross-check too.
const INGREDIENT_ALIASES = [
  ...STARCH_FAMILIES.map(([label, aliases]) => [label, aliases]),
  ...PROTEIN_FAMILIES,
];

export function buildPracticalRecipeSteps(meal = {}) {
  const ingredientList = normaliseIngredients(meal.ingredients, meal.portion_size, meal.name);
  const cookingIngredients = getCookingIngredientModels(ingredientList);
  const ingredientSearch = ingredientList.join(' ').toLowerCase();
  const searchable = `${meal.name || ''} ${ingredientList.join(' ')}`.toLowerCase();
  const name = String(meal.name || '').toLowerCase();
  const prepMinutes = readPrepMinutes(meal);
  const starch = findStarch(ingredientSearch);
  const protein = findProtein(name) || findProtein(ingredientSearch);
  // A pulse (lentils/beans/chickpeas) acting as the meal's protein needs
  // state-aware handling: dry needs real cooking, tinned/cooked does not,
  // and neither is ever "browned" the way mince is (see needsCooking below
  // and every branch that checks isPulseProtein).
  const isPulseProtein = isPulseProteinFamily(protein);
  const pulseState = resolvePulseState(cookingIngredients, protein, canonical => parseIngredientLine(canonical).qualifier);
  const isNoCook = prepMinutes <= 5 && (!protein || !needsCooking(protein, searchable, pulseState));
  const starchDisplayName = findCookingName(cookingIngredients, starchAliasesFor(starch));
  const starchName = starch === 'potato' ? starchDisplayName || starch : starch || starchDisplayName;
  const potatoPreparation = starch === 'potato'
    ? resolvePotatoPreparation(meal, ingredientList)
    : null;
  const proteinDisplayName = findCookingName(cookingIngredients, proteinAliasesFor(protein)) || protein;
  const proteinName = normaliseProteinMethodName(protein, proteinDisplayName);
  const vegetables = findCookingNames(
    cookingIngredients,
    VEGETABLE_PATTERN,
  );
  const sauces = findCookingNames(
    cookingIngredients,
    /(dressing|sauce|pesto|paste|glaze|hummus|tahini|yogurt|cream cheese|salsa|oil)/i,
  );
  const tinIngredients = findCookingNames(cookingIngredients, /\b(tinned|canned)\b/i);
  // Cooking spray/oil used only to grease a pan is a cooking aid, not
  // something served or plated — it should never turn up in a "serve with…"
  // sentence. Drop it before any branch below builds those sentences.
  const remainingNames = cookingIngredients
    .filter(item => !/\bspray\b/i.test(item.displayIngredient || item.ingredient || ''))
    .map(item => (
      proseIngredientName(item.displayIngredient || item.ingredient)
    ));

  if (name.includes('overnight') || name.includes('chia')) {
    const bases = findCookingNames(cookingIngredients, /(oats|chia|milk|yogurt|kefir)/i);
    const toppings = withoutNames(remainingNames, bases);
    // Name the loosening liquid the user actually has. Only literal milk
    // earns the word "milk"; a kefir/yogurt base is loosened with itself.
    const looseningLiquid = findCookingName(cookingIngredients, /\bmilk\b/i)
      || findCookingName(cookingIngredients, /\b(kefir|yogurt)\b/i);
    return [
      `Stir ${joinNatural(bases)} together in a lidded jar or container.`,
      'Stir well, cover and chill for at least 4 hours or overnight.',
      toppings.length
        ? `Stir again before eating, then add ${joinNatural(toppings)}.${looseningLiquid ? ` Loosen with a splash of ${looseningLiquid} if needed.` : ''}`
        : `Stir again before eating${looseningLiquid ? ` and loosen with a splash of ${looseningLiquid} if needed` : ''}.`,
    ];
  }

  if (name.includes('smoothie')) {
    // A "smoothie bowl" is eaten with a spoon and crunchy toppings, not
    // poured into a glass — and those toppings (granola, seeds) are meant
    // to stay crunchy, not get blended into the base.
    const isBowl = name.includes('bowl');
    const toppings = isBowl
      ? findCookingNames(cookingIngredients, /(granola|seeds|nuts|coconut flakes)/i)
      : [];
    const base = withoutNames(remainingNames, toppings);
    return [
      `Put ${joinNatural(base)} in a blender.`,
      'Blend until completely smooth, adding a small splash of water or milk only if needed.',
      isBowl
        ? `Pour into a bowl${toppings.length ? ` and top with ${joinNatural(toppings)}` : ''}, then serve cold.`
        : 'Pour into a glass or shaker and serve cold.',
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

  // A pancake/waffle is a strong dish-type signal that must outrank a
  // secondary serving component in the name — "Wholemeal Pancakes with
  // Low-Fat Yogurt" and "Protein Waffles with Greek Yogurt" both contain
  // "yogurt", but the yogurt is a topping, not the dish: raw egg and flour
  // are batter that MUST be whisked and cooked, never "topped" onto a cold
  // yogurt bowl. Checked before the yogurt/cereal branch for that reason.
  if (name.includes('pancake') || name.includes('waffle')) {
    // "batter" catches legacy plans that list a pre-made batter as the
    // ingredient ("80g pancake batter") — without it the batter fell
    // through to the toppings and was bizarrely "served with" the pancakes.
    const batter = findCookingNames(cookingIngredients, /(flour|egg|milk|protein powder|whey|batter)/i);
    const toppings = withoutNames(remainingNames, batter);
    const isWaffle = name.includes('waffle');
    return [
      `Whisk ${joinNatural(batter)} into a smooth batter and leave it to stand for 2 minutes.`,
      isWaffle
        ? 'Cook in a preheated waffle iron until golden and crisp, in batches if needed.'
        : 'Lightly grease a non-stick pan, then cook small pancakes for 1-2 minutes per side.',
      toppings.length
        ? `Serve with ${joinNatural(toppings)}.`
        : 'Serve while warm.',
    ];
  }

  // Bark has to be tested before the yogurt-bowl branch below, which matches
  // on the word "yogurt" and would otherwise claim the dish first — which is
  // exactly what happened: "Frozen Greek Yogurt and Berry Bark" was served as
  // a bowl of yogurt with berries on top, never frozen or broken.
  if (/\bbark\b/.test(name)) return buildFrozenBarkSteps(cookingIngredients, remainingNames);

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

  if (name.includes('fishcake')) {
    const potatoName = findCookingName(cookingIngredients, /sweet potato|potato/i) || 'potato';
    const fishName = findCookingName(cookingIngredients, /tuna|salmon|mackerel|cod/i) || 'fish';
    const onionNames = findCookingNames(cookingIngredients, /spring onion|onion/i);
    const eggName = findCookingName(cookingIngredients, /^eggs?$/i) || 'egg';
    const leaves = findCookingNames(cookingIngredients, /leaves|lettuce|rocket|watercress/i);
    const dressing = findCookingNames(cookingIngredients, /dressing|sauce/i);
    const mixIns = [...onionNames, eggName ? `the ${eggName}` : ''].filter(Boolean);

    return [
      potatoPreparation?.declared
        ? potatoPreparation.state === 'mashed'
          ? `Have the ${potatoName} ready, and leave it to cool if it is still warm.`
          : `Have the ${potatoName} ready, then mash and leave it to cool slightly.`
        : `Cook the ${potatoName.replace(/, cooked and mashed/i, '')} until tender, then mash and leave it to cool slightly.`,
      `Drain the ${stripTinnedPrefix(fishName)}, then mix it with the mashed potato, ${joinNatural(mixIns)}. Season to taste.`,
      'Shape the mixture into evenly sized fishcakes. Cook in a lightly oiled non-stick pan for 3-4 minutes per side, until golden and hot through.',
      `Serve with ${joinNatural([...leaves, ...dressing])}.`,
    ];
  }

  if (starch === 'potato' && (
    potatoPreparation?.state === 'jacket'
    || /\bjacket(?:ed)?\s+potato/i.test(name)
  )) {
    const potatoMethodName = methodPotatoName(starchName);
    const fillingNames = withoutNames(remainingNames, [starchName, starchDisplayName])
      .map(stripTinnedPrefix);
    const drainedNames = tinIngredients.map(stripTinnedPrefix);
    const mixIns = withoutNames(fillingNames, drainedNames);

    return [
      prepareBakedPotatoStep(potatoMethodName, potatoPreparation),
      tinIngredients.length
        ? `${drainTinnedStep(tinIngredients)} Mix with ${joinNatural(mixIns)} and season to taste.`
        : `Prepare ${joinNatural(fillingNames)} for the filling and season to taste.`,
      `Split the ${potatoMethodName}, fluff the middle with a fork, spoon over the filling and serve hot.`,
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
    const potatoes = findCookingName(cookingIngredients, /potato/i);
    const eggs = findCookingName(cookingIngredients, /^eggs?$/i);
    const beans = findCookingName(cookingIngredients, /green beans/i);
    const tuna = findCookingName(cookingIngredients, /tuna/i);
    const tomatoes = findCookingName(cookingIngredients, /tomato/i);
    const olives = findCookingName(cookingIngredients, /olive/i);
    const steps = [];

    if (potatoes) {
      steps.push(`Boil the ${potatoes} in lightly salted water until tender, then drain and cool slightly.`);
    }
    if (eggs && beans) {
      steps.push(`Boil the ${eggs} for 8-9 minutes, adding the ${beans} for the final 4 minutes. Cool under cold water, then peel and halve the egg.`);
    } else if (eggs) {
      steps.push(`Boil the ${eggs} for 8-9 minutes. Cool under cold water, then peel and halve the egg.`);
    } else if (beans) {
      steps.push(`Boil or steam the ${beans} for 4 minutes until just tender, then cool under cold water.`);
    }
    if (tuna || tomatoes || olives) {
      steps.push([
        tuna ? `Drain the ${stripTinnedPrefix(tuna)}` : '',
        tomatoes ? `halve the ${tomatoes}` : '',
        olives ? `drain the ${olives} if needed` : '',
      ].filter(Boolean).join('; ') + '.');
    }
    steps.push('Arrange everything in a bowl, season with black pepper and serve.');
    return steps;
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
    // Every component of a full English is optional in practice — a
    // high-protein version may have turkey rashers but no beans or toast.
    // Each clause is therefore built only when its ingredient exists;
    // previously the templates interpolated empty strings, producing
    // "warm the  gently in a small saucepan" and "toast the ."
    const cookedItems = findCookingNames(cookingIngredients, /(bacon|sausage|rasher)/i);
    const fryPanVegetables = findCookingNames(cookingIngredients, /(mushroom|tomato)/i);
    const beans = findCookingName(cookingIngredients, /baked beans/i);
    const eggs = findCookingName(cookingIngredients, /^eggs?$/i) || 'eggs';
    const toast = findCookingName(cookingIngredients, BREAD_CARRIER_PATTERN);
    const panStep = [
      fryPanVegetables.length ? `Add ${joinNatural(fryPanVegetables)} to the pan and cook until softened` : '',
      beans ? `warm the ${beans} gently in a small saucepan` : '',
    ].filter(Boolean).join('; ');
    return [
      cookedItems.length
        ? `Cook ${joinNatural(cookedItems)} in a non-stick pan until browned and cooked through.`
        : 'Heat a non-stick pan over medium heat.',
      panStep ? `${panStep}.` : '',
      `Cook the ${eggs} to your liking${toast ? ` and toast the ${toast}` : ''}.`,
      'Serve everything together while hot.',
    ].filter(Boolean);
  }

  // A meal named "... Wraps" or "... Cups" is only a bread/tortilla wrap if
  // it actually has one — "Lean Beef Mince Lettuce Wraps" uses lettuce
  // leaves as the wrapping vessel, not bread, and needs the same handling
  // as "lettuce cups" (below), not the toast/bagel/wrap/sandwich branch
  // further down, which would open with "Toast or warm" nothing.
  const breadCarrierNames = findCookingNames(cookingIngredients, BREAD_CARRIER_PATTERN);
  const lettuceVesselNames = findCookingNames(cookingIngredients, /lettuce|leaves/i);
  const isLettuceVessel = lettuceVesselNames.length > 0 && breadCarrierNames.length === 0;

  if (name.includes('lettuce cups') || (isLettuceVessel && /\b(wraps?|cups)\b/.test(name))) {
    const mince = findCookingName(cookingIngredients, /mince|turkey|beef|pork/i);
    const leaves = findCookingName(cookingIngredients, /lettuce|leaves/i) || 'lettuce leaves';
    // "Lettuce cups" describes a container, not a cooking method — a hot
    // cooked-mince filling (Turkey Mince Lettuce Cups) and a cold assembled
    // one (Prawn Cocktail in Lettuce Cups) both use the phrase but need
    // different templates. Only route through the hot-filling template
    // when a mince-style protein is actually present.
    if (!mince) {
      const filling = withoutNames(remainingNames, [leaves]);
      return [
        `Separate, rinse and dry the ${leaves}, keeping them whole so they can hold the filling.`,
        protein && needsCooking(protein, searchable, pulseState) && !isPulseProtein
          ? `${cookProteinStep(proteinName, { finish: 'Cool slightly, then combine with the remaining ingredients.' })}`
          : `Combine ${joinNatural(filling)} in a bowl.`,
        'Spoon the filling into the lettuce leaves and serve immediately.',
      ];
    }
    const fillings = findCookingNames(cookingIngredients, /(carrot|pepper|spring onion|peas)/i);
    // "onion" also matches "spring onion" — without excluding fillings here,
    // spring onion is cooked in step two AND stirred in again in step three.
    const aromatics = withoutNames(findCookingNames(cookingIngredients, /(garlic|ginger|onion)/i), fillings);
    const sauce = findCookingNames(cookingIngredients, /(hoisin|soy sauce|tamari)/i);
    return [
      `Separate, rinse and dry the ${leaves}, keeping them whole so they can hold the filling.`,
      `Cook the ${mince}${aromatics.length ? ` with ${joinNatural(aromatics)}` : ''} in a large non-stick pan, breaking it up, until browned.`,
      `Stir in ${joinNatural([...fillings, ...sauce])} and cook for 2-3 minutes until hot through.`,
      'Spoon the filling into the lettuce leaves and serve immediately.',
    ];
  }

  if (/\beggs?\b/.test(name) || protein === 'eggs' || name.includes('omelette')) {
    const carrier = findCookingNames(cookingIngredients, /(bread|toast|bagel|pitta)/i);
    // Matches both the whole-egg ingredient and egg whites — either way it's
    // the thing already cooked in the step above, not something "served
    // with" the dish.
    const accompaniments = withoutNames(remainingNames, [
      ...findCookingNames(cookingIngredients, /^eggs?(\s+whites?)?$/i),
      ...vegetables,
      ...carrier,
    ]);
    return [
      vegetables.length
        ? `Slice or chop ${joinNatural(vegetables)}, then cook them in a non-stick pan over medium heat until softened.`
        : 'Crack the eggs into a bowl, season lightly and whisk with a fork.',
      // An omelette or frittata is beaten egg set in a pan. When the recipe has
      // vegetables the step above cooks those instead of whisking, so a dish
      // named as an omelette never told the reader to beat the eggs at all.
      name.includes('boiled') || name.includes('poached')
        ? 'Cook the eggs to your preferred set: 5-6 minutes for soft-boiled, or poach gently until the whites are set.'
        : /omelette|frittata/.test(name)
          ? `Beat the eggs in a bowl and season lightly, then pour over the pan and cook over medium heat until just set${/frittata/.test(name) ? ', finishing under a hot grill until the top is firm' : ', folding it over to serve'}.`
          : 'Beat the eggs in a bowl, then cook in a non-stick pan over medium heat, stirring gently until softly set.',
      carrier.length
        ? `Toast ${joinNatural(carrier)}, then serve with the eggs${accompaniments.length ? ` and ${joinNatural(accompaniments)}` : ''}.`
        : `Season to taste and serve${accompaniments.length ? ` with ${joinNatural(accompaniments)}` : ''}.`,
    ];
  }

  if (name.includes('toast') || name.includes('bagel') || name.includes('wrap') || name.includes('sandwich') || name.includes('pitta')) {
    const carriers = findCookingNames(cookingIngredients, BREAD_CARRIER_PATTERN);
    const filling = withoutNames(remainingNames, carriers);
    return [
      `${name.includes('sandwich') ? 'Lay out' : 'Toast or warm'} ${joinNatural(carriers)}.`,
      protein && needsCooking(protein, searchable, pulseState) && !isPulseProtein
        ? cookProteinStep(proteinName, { finish: isAlreadyPreparedIngredient(proteinName) ? '' : 'Rest briefly, then slice it.' })
        : isPulseProtein && needsCooking(protein, searchable, pulseState)
          ? cookProteinStep(proteinName, { dryPulse: true })
          : `Drain, slice or mash ${joinNatural(filling)} as appropriate.`,
      `Layer ${joinNatural(filling)} evenly, season to taste, and serve or wrap tightly for later.`,
    ];
  }

  // Shepherd's/cottage pie: a filling under a topping, browned in the oven.
  // The generic path warmed the filling and served the mash beside it, which
  // is the same ingredients arranged as something else entirely.
  if (/\b(shepherd'?s|cottage)\s+pie\b/.test(name)) {
    const topping = findCookingName(cookingIngredients, /mash|potato/i) || 'the mash';
    const fillingParts = withoutNames(remainingNames, [topping]);
    const liquid = findCookingName(cookingIngredients, /stock|broth/i);
    const fillingWithoutLiquid = withoutNames(fillingParts, [liquid].filter(Boolean));
    return [
      'Heat the oven to 200°C (180°C fan).',
      fillingWithoutLiquid.length
        ? `Cook ${joinNatural(fillingWithoutLiquid)} in a pan over medium heat until softened and hot through.`
        : 'Prepare the filling in a pan over medium heat.',
      liquid
        ? `Add ${liquid} and simmer for 8-10 minutes, until the filling has thickened and is no longer loose.`
        : 'Simmer until the filling has thickened and is no longer loose.',
      `Season the filling, then tip it into an ovenproof dish and level the surface.`,
      `Spread the ${topping} evenly over the top, right to the edges so the filling is sealed in, and rough up the surface with a fork.`,
      'Bake for 20-25 minutes, until the topping is golden and the filling is bubbling at the edges. Rest for 5 minutes before serving.',
    ];
  }

  // Risotto: cooking the rice separately to packet instructions and folding it
  // through afterwards produces rice with sauce, not risotto. The defining
  // action is absorbing the liquid gradually.
  if (/\brisotto\b/.test(name)) {
    const rice = findCookingName(cookingIngredients, /rice/i) || 'the rice';
    const aromatics = findCookingNames(cookingIngredients, /onion|shallot|garlic|leek/i);
    const liquid = findCookingName(cookingIngredients, /stock|broth/i) || 'hot stock';
    const extras = withoutNames(remainingNames, [rice, liquid, ...aromatics]);
    return [
      aromatics.length
        ? `Soften ${joinNatural(aromatics)} in a wide pan over medium heat for 3-4 minutes.`
        : 'Warm a wide pan over medium heat.',
      `Stir in the ${rice} and cook for 1 minute so the grains are coated.`,
      `Add the ${liquid} a ladleful at a time, stirring often and letting each addition be absorbed before adding the next. This takes about 18-20 minutes, until the rice is creamy but still has a little bite.`,
      extras.length
        ? `Stir through ${joinNatural(extras)}, season to taste and serve straight away.`
        : 'Season to taste and serve straight away.',
    ];
  }

  // Stir-fry: previously fell through to the starch branch and produced a
  // plain "cook in a non-stick pan" with no stir/toss action at all, so a
  // dish named stir-fry never actually stir-fried.
  if (/\bstir[- ]?fry\b/.test(name)) {
    const stirVegetables = withoutNames(vegetables, [starchName, starchDisplayName]);
    const stirSauces = sauces.filter(item => !/\boil\b/i.test(item));
    // Only tell the user to heat oil when oil is actually an ingredient —
    // otherwise the method implies a purchase the shopping list never made.
    const stirOil = findCookingName(cookingIngredients, /\boil\b/i);
    const panPhrase = stirOil
      ? `Heat the ${stirOil} in a wok or large frying pan over high heat`
      : 'Heat a wok or large frying pan over high heat';
    const steps = [];
    if (starch) steps.push(cookStarchStep(starchName, { potatoPreparation, displayName: starchDisplayName }));
    steps.push(
      protein && needsCooking(protein, searchable, pulseState)
        ? `${panPhrase} and stir-fry the ${proteinName} for 3-4 minutes, until browned and cooked through.`
        : `${panPhrase}.`,
    );
    if (stirVegetables.length) {
      steps.push(`Add ${joinNatural(stirVegetables)} and stir-fry over high heat for 3-4 minutes, keeping everything moving so it stays crisp.`);
    }
    steps.push(
      stirSauces.length
        ? `Stir in ${joinNatural(stirSauces)}, toss to coat and serve${starch ? ` with the ${starchName}` : ''}.`
        : `Season, toss to combine and serve${starch ? ` with the ${starchName}` : ''}.`,
    );
    return steps;
  }

  // Roast / tray bake: previously fell through to the generic branch and
  // produced "cook in a non-stick pan" for a dish whose name promises the
  // oven — and, for a nut roast, never cooked the main component at all.
  // Only fire the whole-dish roast branch when the dish itself is the roast —
  // a name starting with "Roast(ed)", a tray bake, or a nut roast. Previously
  // `\broast\b` also failed to match "Roasted", so "Roasted Spiced Chickpeas"
  // fell through to a cold assembly branch and was never roasted at all.
  // Dishes that merely have a roasted side ("Grilled Chicken with Roasted
  // Mediterranean Veg") are handled further down, so the chicken stays grilled.
  if (/^roast(?:ed)?\b|\btray ?bake\b|\bnut roast\b/.test(name) && !/\bpotato\b/.test(name)) {
    const roastVegetables = withoutNames(vegetables, [proteinName, proteinDisplayName]);
    const centrepiece = proteinName || findCookingName(cookingIngredients, /nut roast|roast/i) || 'the main ingredient';
    const extras = withoutNames(remainingNames, [...roastVegetables, proteinName, proteinDisplayName, centrepiece]);
    return [
      'Heat the oven to 200°C (180°C fan).',
      roastVegetables.length
        ? `Cut ${joinNatural(roastVegetables)} into even pieces, spread on a roasting tray and roast for 25-30 minutes, turning once, until tender and lightly browned.`
        : 'Line a roasting tray ready for the main ingredients.',
      `Roast the ${centrepiece} until cooked through and piping hot, adding it to the tray so it finishes at the same time as the vegetables.`,
      extras.length
        ? `Serve with ${joinNatural(extras)}, then season to taste.`
        : 'Rest briefly, then season to taste and serve.',
    ];
  }

  if (name.includes('salad') || name.includes('bowl')) {
    const leafy = findCookingNames(cookingIngredients, /leaves|lettuce|rocket|watercress|spinach/i);
    // Ready-prepared or pre-cut vegetables (a roasted veg mix, frozen
    // peas, trimmed green beans) don't need a "slice or chop" step — but
    // they were previously excluded here and then never mentioned again,
    // silently dropping a real 150g ingredient out of the method. They are
    // kept aside and named in the assembly step instead.
    const readyVegetables = withoutNames(
      vegetables.filter(item => /(peas|mixed veg|green beans|\bveg\b)/i.test(item) || isAlreadyPreparedIngredient(item)),
      [...leafy, starchName, starchDisplayName],
    );
    const choppedVegetables = withoutNames(
      vegetables.filter(item => !/(peas|mixed veg|green beans|\bveg\b)/i.test(item) && !isAlreadyPreparedIngredient(item)),
      [...leafy, starchName],
    );
    const carriers = findCookingNames(cookingIngredients, BREAD_CARRIER_PATTERN);
    const eggs = findCookingNames(cookingIngredients, /^eggs?$/i);
    const steps = [];
    if (starch) {
      steps.push(cookStarchStep(starchName, { cool: true, potatoPreparation, displayName: starchDisplayName }));
    }
    if (eggs.length) {
      steps.push(`Boil the ${joinNatural(eggs)} for 8-9 minutes, then cool under cold water, peel and halve.`);
    }
    if (protein && needsCooking(protein, searchable, pulseState)) {
      steps.push(cookProteinStep(proteinName, {
        finish: isPulseProtein ? '' : 'Rest briefly before slicing if needed.',
        dryPulse: isPulseProtein,
      }));
    } else if (tinIngredients.length) {
      steps.push(drainTinnedStep(tinIngredients));
    }
    // A bowl or salad whose name promises roasted vegetables has to
    // actually roast them — otherwise "Lentil & Roasted Veg Bowl" just
    // chops raw squash into a bowl.
    const roastableVegetables = withoutNames(choppedVegetables, leafy);
    if (/\broast(ed)?\b/.test(name) && roastableVegetables.length) {
      steps.push(`Heat the oven to 200°C (180°C fan). Cut ${joinNatural(roastableVegetables)} into even pieces and roast for 25-30 minutes, until tender and lightly browned, then leave to cool slightly.`);
    } else if (choppedVegetables.length || leafy.length) {
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
      `Arrange everything in a bowl${readyVegetables.length ? `, adding ${joinNatural(readyVegetables)}` : ''}${sauces.length ? `${readyVegetables.length ? ', then' : ' and'} finish with ${joinNatural(sauces)}` : ''}.${hasDressing ? ' Keep the dressing separate if packing ahead.' : ''}`,
    );
    return steps.slice(0, 5);
  }

  if (name.includes('curry') || name.includes('chilli') || name.includes('stew') || name.includes('soup')) {
    const aromatics = findCookingNames(cookingIngredients, /(onion|garlic|ginger|celery|carrot)/i);
    // Sweetcorn, frozen veg blends, green beans and similar arrive ready to
    // use — "peel and chop sweetcorn into even pieces" is nonsense. They
    // still belong in the pot, just not in the knife-work step.
    const firmVegetables = withoutNames(
      vegetables.filter(item => (
        !/(spinach|leaves|peas|watercress|rocket)/i.test(item)
        && !/\b(tinned|canned)\b/i.test(item)
        && !READY_TO_USE_VEGETABLE.test(item)
      )),
      aromatics,
    );
    const flavourings = findCookingNames(
      cookingIngredients,
      FLAVOURING_PATTERN,
    );
    const usableFirmVegetables = withoutNames(firmVegetables, flavourings);
    const pulseTins = tinIngredients.filter(item => /(bean|chickpea|lentil)/i.test(item));
    const separateStarchNames = starch && starch !== 'potato'
      ? [starchName, starchDisplayName]
      : [];
    // A side item (a bread roll next to soup) must never be the object of
    // "add X and simmer" just because nothing else claimed it — exclude it
    // from the pot entirely and mention it as a side instead.
    const accompanimentNames = remainingNames.filter(isSoupSideAccompaniment);
    // A pulse acting as the protein is never "browned" the way mince is —
    // it goes straight into the pot and simmers — so it must NOT be
    // excluded from the final addition step the way an already-handled
    // protein is; excluding it here (as if step two had cooked it) is what
    // let dry lentils disappear from the method entirely.
    const proteinExclusions = isPulseProtein ? [] : [proteinName, proteinDisplayName];
    const additions = withoutNames(
      remainingNames,
      [...aromatics, ...usableFirmVegetables, ...flavourings, ...proteinExclusions, ...separateStarchNames, ...accompanimentNames],
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
      // Anything named in a later step (flavourings stirred in, the starch
      // cooked separately) must not also appear in this "have ready"
      // fallback, or the same ingredient is listed twice.
      preparation || `Have ${joinNatural(withoutNames(remainingNames, [...flavourings, ...separateStarchNames, ...accompanimentNames]))} ready by the hob.`,
      protein && needsCooking(protein, searchable, pulseState) && !isPulseProtein
        ? `Heat a large pan over medium heat and brown the ${proteinName}${aromatics.length ? ` with ${joinNatural(aromatics)}` : ''} for 5-7 minutes.`
        : aromatics.length || usableFirmVegetables.length
          // A soup or stew named for roasted vegetables gets its flavour from
          // roasting them first. Softening them in the pan makes a different,
          // milder dish from the one on the label.
          ? (/roast(?:ed)?/.test(name) && usableFirmVegetables.length
            ? `Heat the oven to 200°C (180°C fan) and roast ${joinNatural(usableFirmVegetables)} for 25-30 minutes, until tender and caramelised at the edges. Meanwhile soften ${aromatics.length ? joinNatural(aromatics) : 'the aromatics'} in a large pan over medium heat.`
            : `Heat a large pan over medium heat and soften ${joinNatural([...aromatics, ...usableFirmVegetables])} for 5-7 minutes.`)
          : 'Heat a large pan over medium heat.',
      buildSimmerStep({ flavourings, additions, isPulseProtein, pulseState, remainingNames }),
      starch && starch !== 'potato'
        ? cookStarchStep(starchName, { prefix: 'Meanwhile, ', serveAlongside: true, potatoPreparation, displayName: starchDisplayName })
        : accompanimentNames.length
          ? `Taste, season and serve with ${joinNatural(accompanimentNames)} on the side.`
          : 'Taste, season and portion for serving.',
    ];
  }

  if (starch) {
    // Exclude the starch by BOTH its family name and its display name —
    // step one already cooks it, so leaving "wholemeal pasta (dry weight)"
    // in this list made step two re-"prepare" the very thing just cooked.
    const nonStarch = withoutNames(remainingNames, [starchName, starchDisplayName]);
    const panVegetables = withoutNames(vegetables, [starchName, starchDisplayName]);
    // "Grilled Chicken with Roasted Mediterranean Veg" promises roasted
    // vegetables. Softening them in the pan alongside the protein delivers a
    // different dish from the one named, so honour the roast for the side
    // while leaving the protein's own cooking method alone.
    const nameRoastsVegetables = /roast(?:ed)?/.test(name);
    // Seasonings a recipe genuinely lists (lemon, dill, herbs) were dropped
    // entirely by this branch, which only ever names the protein and
    // vegetables — so a salmon "baked with lemon and dill" never mentioned
    // either. Surface them in the serving step.
    const seasonings = withoutNames(
      findCookingNames(cookingIngredients, SEASONING_PATTERN),
      [...panVegetables, ...sauces, proteinName, proteinDisplayName, starchName, starchDisplayName],
    );
    return [
      cookStarchStep(starchName, { potatoPreparation, displayName: starchDisplayName }),
      protein && needsCooking(protein, searchable, pulseState) && !isPulseProtein
        ? vegetables.length
          // The vegetable pattern also matches potato, which is the starch
          // already cooked in step one — without excluding it the method
          // said "Boil the potatoes… then add potatoes and cook until
          // tender", cooking the same ingredient twice.
          ? `${cookProteinStep(proteinName, { prefix: 'Meanwhile, ' })}${panVegetables.length
            ? (nameRoastsVegetables
              ? ` Meanwhile roast ${joinNatural(panVegetables)} at 200°C (180°C fan) for 25-30 minutes, until tender and lightly browned.`
              : ` Add ${joinNatural(panVegetables)} and cook until tender.`)
            : ''}`
          : cookProteinStep(proteinName, { prefix: 'Meanwhile, ' })
        // A dry pulse is not just "warmed" — it needs real simmering time
        // in liquid to become edible. Keep every non-starch ingredient
        // named (nonStarch already includes the pulse itself, since
        // nothing here excludes it) rather than routing through
        // cookProteinStep, which would drop the aromatics/spices that
        // belong in the same pot.
        : isPulseProtein && needsCooking(protein, searchable, pulseState)
          ? `Meanwhile, simmer ${joinNatural(nonStarch)} together in a pan with enough ${cookingLiquidWord(remainingNames)} to cover, until tender.`
          : `Meanwhile, prepare ${joinNatural(nonStarch)} and warm everything gently in a pan.`,
      starch === 'potato'
        ? `Serve the ${starchName} with the prepared ingredients${seasoningClause(seasonings, sauces)}, then season to taste.`
        : sauces.length || seasonings.length
          ? `Fold the cooked ${starchName} through the pan, stir in ${joinNatural([...sauces, ...seasonings])}, and heat through before serving.`
          : `Fold the cooked ${starchName} through the pan, season to taste and serve hot.`,
    ];
  }

  if (isNoCook) {
    const drainables = findCookingNames(cookingIngredients, /^(tinned|canned)\b|beans|chickpeas|lentils/i);
    const fresh = withoutNames(remainingNames, [...drainables, ...sauces]);
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
    protein && needsCooking(protein, searchable, pulseState) && !isPulseProtein
      ? `Cook the ${proteinName} in a non-stick pan over medium heat until cooked through.`
      : isPulseProtein && needsCooking(protein, searchable, pulseState)
        ? cookProteinStep(proteinName, { dryPulse: true })
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

// The soup/stew branch's central simmer step. Two refinements over a plain
// template string:
//  1. When there's nothing to name in the "stir in" clause (no stock,
//     tomatoes, spice paste etc. detected), that clause is dropped rather
//     than rendered as the meaningless "Stir in the listed ingredients" —
//     generic wording is only acceptable when it isn't hiding something.
//  2. When a dry pulse is present and no cooking-liquid ingredient exists
//     anywhere in the meal (checked via the same signal used elsewhere,
//     not invented), the step says explicitly what the pulse simmers in.
//     This never adds a stock ingredient to the ingredient list or
//     nutrition — water is a free pantry staple, the same way "boil the
//     potatoes in lightly salted water" doesn't require water to be listed.
function buildSimmerStep({ flavourings, additions, isPulseProtein, pulseState, remainingNames }) {
  // A dry pulse needs stated liquid whether or not it's the dish's PRIMARY
  // protein — "Turkey & Lentil Soup" and "Chicken & Vegetable Stew" resolve
  // their protein to the meat, but the dry lentils alongside it still can't
  // simmer in nothing. Checks the actual simmer contents, not just the
  // primary-protein classification.
  const dryPulseInPot = isPulseProtein
    ? pulseState === PULSE_STATE.DRY
    : additions.some(item => isDryPulseName(item));
  const needsLiquidNote = dryPulseInPot && !hasCookingLiquid(remainingNames);
  const liquidClause = needsLiquidNote ? ` with enough ${cookingLiquidWord(remainingNames)} to cover` : '';
  // When every ingredient has already been named in an earlier step there
  // is genuinely nothing left to add — saying "add the listed ingredients"
  // then reads as filler that hides nothing but helps no one. Drop the
  // clause entirely rather than emitting the generic phrase.
  if (!additions.length) {
    return flavourings.length
      ? `Stir in ${joinNatural(flavourings)}${liquidClause}, then simmer gently until tender and thickened.`
      : `Simmer gently${liquidClause} until tender and thickened.`;
  }
  const additionsText = joinNatural(additions);
  return flavourings.length
    ? `Stir in ${joinNatural(flavourings)}, then add ${additionsText}${liquidClause} and simmer gently until tender and thickened.`
    : `Add ${additionsText}${liquidClause} and simmer gently until tender and thickened.`;
}

// Names the cooking liquid the user actually has. Stock is only mentioned
// when a stock ingredient really exists in the recipe — otherwise the
// method would imply the shopping list included stock the user never
// bought. Water is the honest default and needs no shopping entry.
// Joins sauces and seasonings into a natural "and X" clause for a serving
// step, or nothing when the dish has neither.
function seasoningClause(seasonings, sauces) {
  const items = uniqueNames([...(sauces || []), ...(seasonings || [])]);
  return items.length ? ` and ${joinNatural(items)}` : '';
}

function cookingLiquidWord(ingredientNames) {
  return (ingredientNames || []).some(item => /\b(stock|broth|bouillon)\b/i.test(String(item || '')))
    ? 'stock'
    : 'water';
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
  const items = collapseRepeatedToTaste(uniqueNames(values));
  if (!items.length) return fallback;
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`;
}

// "lemon juice, to taste and dill, to taste" reads badly. When more than
// one seasoning carries the same qualifier, state it once at the end:
// "lemon juice and dill, to taste".
function collapseRepeatedToTaste(items) {
  const QUALIFIER = /,\s*(to taste|as needed)$/i;
  const qualified = items.filter(item => QUALIFIER.test(item));
  if (qualified.length < 2) return items;
  const qualifier = qualified[0].match(QUALIFIER)[1];
  if (!qualified.every(item => item.match(QUALIFIER)[1].toLowerCase() === qualifier.toLowerCase())) return items;

  const stripped = [];
  let inserted = false;
  for (const item of items) {
    if (!QUALIFIER.test(item)) { stripped.push(item); continue; }
    const bare = item.replace(QUALIFIER, '');
    // Attach the qualifier to the last one only.
    if (item === qualified.at(-1)) { stripped.push(`${bare}, ${qualifier}`); inserted = true; } else stripped.push(bare);
  }
  return inserted ? stripped : items;
}

function cookProteinStep(proteinName, { prefix = '', finish = '', dryPulse = false } = {}) {
  const protein = String(proteinName || 'protein');
  let finishText = finish;
  let instruction;

  // An ingredient whose own name declares it already cooked ("baked
  // falafel", "baked tofu") must not be given a from-raw instruction —
  // the same principle resolvePotatoPreparation applies to potatoes,
  // generalised to any ingredient carrying a declared state.
  if (isAlreadyPreparedIngredient(protein)) {
    instruction = `warm the ${protein} through in a non-stick pan or oven until piping hot`;
    finishText = '';
  } else if (dryPulse) {
    // Dry lentils/beans are not pan-browned like mince — they need real
    // simmering time in liquid to become tender and safe to eat.
    instruction = `simmer the ${protein} in a pan with plenty of water for 15-20 minutes, until tender, then drain any excess liquid`;
    finishText = '';
  } else if (/prawn/i.test(protein)) {
    instruction = `cook the ${protein} in a non-stick pan over medium heat for 3-4 minutes, turning, until pink and opaque`;
    finishText = '';
  } else if (/(halloumi|paneer)/i.test(protein)) {
    instruction = `cook the ${protein} in a dry non-stick pan for 2-3 minutes per side, until golden`;
    finishText = '';
  } else if (/(salmon|mackerel|cod|haddock|sardine|fish|tuna steak)/i.test(protein)) {
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

function capitaliseFirst(value) {
  const text = String(value || '');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function cookStarchStep(starchName, {
  prefix = '',
  cool = false,
  serveAlongside = false,
  potatoPreparation = null,
  displayName = '',
} = {}) {
  const starch = String(starchName || 'starch');
  let instruction;

  // An ingredient stated as already cooked ("quinoa (cooked)") must not be
  // told to cook from scratch — the same declared-state principle
  // potatoInstruction already applies, extended to the other starches.
  // starchName is often just the family word ("quinoa"), so the declared
  // state lives on the display name ("quinoa (cooked)") — check both.
  if (/\bcooked\b/i.test(`${starch} ${displayName}`) && !/potato/i.test(starch)) {
    const cleanName = String(displayName || starch)
      .replace(/\s*[(,]?\s*\bcooked\b\)?/i, '')
      .replace(/\s+/g, ' ')
      .trim() || starch;
    const readyInstruction = `have the cooked ${cleanName} ready, reheating gently if serving hot`;
    return `${prefix}${prefix ? readyInstruction : capitaliseFirst(readyInstruction)}.`;
  }

  if (/potato/i.test(starch)) {
    instruction = potatoInstruction(starch, potatoPreparation);
  } else {
    const pronoun = /(noodles|potatoes)/i.test(starch) ? 'their' : 'its';
    instruction = `cook the ${starch} according to ${pronoun} packet instructions`;
  }

  const potatoState = /potato/i.test(starch) ? potatoPreparation?.state || 'raw' : '';
  const needsDraining = !potatoState || ['raw', 'boiled'].includes(potatoState);
  if (cool) instruction += needsDraining ? ', then drain and cool slightly' : ', then cool slightly';
  else if (serveAlongside) instruction += needsDraining ? ', then drain and serve alongside' : ' and serve alongside';
  else if (needsDraining) instruction += ', then drain if needed';

  const sentence = prefix
    ? instruction
    : instruction.charAt(0).toUpperCase() + instruction.slice(1);
  return `${prefix}${sentence}.`;
}

function potatoInstruction(starchName, preparation) {
  const potato = methodPotatoName(starchName);
  const state = preparation?.state || 'raw';
  const alreadyPrepared = Boolean(preparation?.declared) && state !== 'raw';

  if (alreadyPrepared) {
    if (state === 'mashed') return `have the ${starchName} ready and reheat gently if serving hot`;
    if (state === 'roast') return `have the ${starchName} ready and reheat until piping hot if needed`;
    if (state === 'baked' || state === 'jacket') return `reheat the ${starchName} until piping hot`;
    if (state === 'boiled') return `have the ${starchName} ready and reheat gently if serving hot`;
    return `have the prepared ${potato} ready and reheat gently if serving hot`;
  }

  if (state === 'mashed') return `boil the ${potato} in lightly salted water until tender, then drain and mash`;
  if (state === 'roast') return `cut the ${potato} into even chunks and roast at 200°C (180°C fan) until tender and browned`;
  if (state === 'baked' || state === 'jacket') return `prick the ${potato} with a fork and bake at 200°C (180°C fan) until tender throughout`;
  if (/sweet potato/i.test(starchName)) return `cut the ${potato} into even chunks and boil in lightly salted water until tender`;
  return `boil the ${potato} in lightly salted water until tender`;
}

function prepareBakedPotatoStep(potatoName, preparation) {
  if (preparation?.declared && preparation.state !== 'raw') {
    return `Reheat the ${potatoName} until piping hot throughout.`;
  }
  return `Heat the oven to 200°C (180°C fan). Prick the ${potatoName} with a fork, then bake until the skin is crisp and the middle is tender.`;
}

function methodPotatoName(value) {
  const cleaned = String(value || 'potato')
    .replace(/^prepared\s+/i, '')
    .replace(/^(?:baked|boiled|roasted|mashed|cooked)\s+/i, '')
    .replace(/,\s*(?:baked|boiled|roasted|mashed|cooked)$/i, '')
    .trim();
  return cleaned || 'potato';
}

export function resolvePotatoPreparation(meal = {}, ingredients = null) {
  const ingredientValues = ingredients || normaliseIngredients(meal.ingredients, meal.portion_size, meal.name);
  const structuredState = findStructuredPotatoPreparation(meal);
  if (structuredState) return { state: structuredState, source: 'structured', declared: true };

  const qualifierState = findPotatoQualifier(ingredientValues);
  if (qualifierState) return { state: qualifierState, source: 'ingredient-qualifier', declared: true };

  const nameState = inferPotatoPreparationFromName(meal.name);
  if (nameState) return { state: nameState, source: 'meal-name', declared: false };

  return { state: 'raw', source: 'default', declared: false };
}

function findStructuredPotatoPreparation(meal) {
  const mealState = meal.potatoPreparation
    || meal.preparationState?.potato
    || meal.preparation?.potato;
  const normalisedMealState = normalisePotatoState(mealState);
  if (normalisedMealState) return normalisedMealState;

  const values = Array.isArray(meal.ingredients) ? meal.ingredients : [];
  for (const ingredient of values) {
    if (!ingredient || typeof ingredient !== 'object') continue;
    const name = ingredient.item || ingredient.name || ingredient.ingredient || '';
    if (!hasIngredientPhrase(name, 'potato')) continue;
    const state = normalisePotatoState(
      ingredient.preparation || ingredient.preparationState || ingredient.qualifier || ingredient.state,
    );
    if (state) return state;
  }
  return '';
}

function findPotatoQualifier(ingredients) {
  for (const ingredient of ingredients || []) {
    const parsed = parseIngredientLine(ingredient);
    if (!hasIngredientPhrase(parsed.name, 'potato')) continue;
    const parsedState = normalisePotatoState(parsed.qualifier);
    if (parsedState) return parsedState;

    const text = String(ingredient || '').toLowerCase();
    // `mash` and `purée` are the noun forms of an already-performed
    // preparation. Matching only the adjective ("mashed") meant an ingredient
    // written as "Sweet potato mash" fell through to `raw`, and the method then
    // told the reader to cut the mash into chunks and boil it.
    const explicitState = text.match(/(?:^|[\s,(])(raw|boiled|baked|jacket|mashed|mash|pur[ée]e[d]?|roast(?:ed)?|cooked|prepared)(?=[\s,)]|$)/i)?.[1];
    const normalised = normalisePotatoState(explicitState);
    if (normalised) return normalised;
  }
  return '';
}

function inferPotatoPreparationFromName(value) {
  const name = String(value || '').toLowerCase();
  if (/\bjacket(?:ed)?\s+potato/.test(name)) return 'jacket';
  if (/\b(?:baked|bake)\s+potato/.test(name)) return 'baked';
  if (/\b(?:roast|roasted)\s+(?:sweet\s+)?potato|\bpotato\s+(?:wedges|roast)/.test(name)) return 'roast';
  if (/\bmashed\s+(?:sweet\s+)?potato|\bpotato\s+mash/.test(name)) return 'mashed';
  if (/\bboiled\s+(?:new\s+)?potato/.test(name)) return 'boiled';
  return '';
}

function normalisePotatoState(value) {
  const state = String(value || '').trim().toLowerCase();
  if (!state) return '';
  if (state === 'jacket' || state === 'jacketed') return 'jacket';
  if (state === 'bake' || state === 'baked') return 'baked';
  if (state === 'roast' || state === 'roasted') return 'roast';
  if (state === 'mash' || state === 'mashed') return 'mashed';
  if (state === 'boil' || state === 'boiled') return 'boiled';
  if (state === 'cooked' || state === 'prepared') return 'prepared';
  if (state === 'raw') return 'raw';
  return '';
}

function hasIngredientPhrase(value, phrase) {
  const normalised = String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const target = String(phrase || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  if (!target) return false;
  const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pluralSuffix = /[a-z]$/.test(target) && !target.endsWith('s') ? '(?:s|es)?' : '';
  return new RegExp(`(?:^| )${escaped}${pluralSuffix}(?=$| )`).test(normalised);
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

function readPrepMinutes(meal) {
  if (Number.isFinite(Number(meal.prepMins))) return Number(meal.prepMins);
  const match = String(meal.prep || '').match(/\d+/);
  return match ? Number(match[0]) : 15;
}

// A pulse (lentils/beans/chickpeas) needs cooking only when it's actually
// dry — tinned/pre-cooked does not. `pulseState` is resolved once per meal
// from the ingredient's own canonical name/qualifier (see
// ingredientRoles.js resolvePulseState) and threaded through here rather
// than re-derived, so every branch agrees on the same answer.
function needsCooking(protein, searchable = '', pulseState = null) {
  if (isPulseProteinFamily(protein)) return pulseState ? pulseNeedsCooking(pulseState) : false;
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

// Frozen bark is defined by being spread flat, frozen solid and broken into
// shards. Kept as a named builder so its branch can sit ahead of the
// yogurt-bowl branch, which matches on the word "yogurt" and would otherwise
// claim the dish first.
function buildFrozenBarkSteps(cookingIngredients, remainingNames) {
  const base = findCookingName(cookingIngredients, /yogurt|skyr|quark|chocolate/i)
    || remainingNames[0] || 'the base';
  const toppings = withoutNames(remainingNames, [base]);
  return [
    'Line a tray or shallow container with baking paper.',
    `Spread the ${base} over the paper in an even layer about 1cm thick.`,
    toppings.length
      ? `Scatter ${joinNatural(toppings)} over the top and press them in lightly.`
      : 'Level the surface so it freezes evenly.',
    'Freeze flat for at least 3-4 hours, until solid.',
    'Break into shards and serve straight from the freezer. Keep any leftovers frozen.',
  ];
}
