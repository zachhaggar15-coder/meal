// Aldi budget edition - the meals used by the Mon/Tue/Wed/Sat sample.
//
// Ingredient lines are canonical: grams and millilitres, named so the site's
// nutrition table resolves them, with seasonings carrying the documented
// "excluded from nutrition estimate" suffix. Nothing here states a macro; every
// figure in the finished book is computed from these lines.
//
// `yield` is the number of adult portions the quantities produce. A dinner with
// yield 4 feeds two people tonight and puts two lunches in the fridge.

import { negligible } from '../../build/nutrition.mjs';

const ing = (line, display) => ({ line, display: display || line });

export const meals = {
  /* ── breakfasts: two, repeated, which is how people actually eat ────── */

  'porridge-banana': {
    name: 'Porridge with Banana and Honey',
    kind: 'breakfast',
    tagline: 'The weekday breakfast for the whole six weeks. Five minutes, one pan, and you stop thinking about it by Wednesday.',
    time: '5 min',
    yield: 2,
    ingredients: [
      ing('120g rolled oats', '120g porridge oats'),
      ing('500ml semi-skimmed milk'),
      ing('2 banana', '2 bananas, sliced'),
      ing('2 tsp honey'),
      ing(negligible('salt'), 'a pinch of salt'),
    ],
    method: [
      'Put the oats, milk and a pinch of salt in a pan over a medium heat.',
      'Stir more or less constantly for 4&ndash;5 minutes until it thickens. The salt is what stops porridge tasting of nothing.',
      'Take it off the heat, slice the banana over the top and trickle the honey on.',
    ],
    swap: 'Water instead of half the milk if you want it lighter. Oat milk works and costs a little more.',
    leftovers: 'Make it fresh &mdash; it takes five minutes and porridge sets solid in the fridge.',
  },

  'eggs-on-toast': {
    name: 'Scrambled Eggs on Toast',
    kind: 'breakfast',
    tagline: 'The weekend breakfast. The whole recipe is a low heat and taking the pan off before it looks done.',
    time: '8 min',
    yield: 2,
    ingredients: [
      ing('5 egg', '5 eggs'),
      ing('4 slices wholemeal bread'),
      ing('10g butter'),
      ing('2 tbsp semi-skimmed milk'),
      ing(negligible('salt and black pepper'), 'salt and black pepper'),
    ],
    method: [
      'Beat the eggs with the milk and a good pinch of salt until completely uniform in colour.',
      'Melt the butter in a non-stick pan over a <b>low</b> heat. Low is the whole recipe.',
      'Pour the eggs in, leave them 20 seconds, then fold slowly with a spatula, pulling the set edges into the middle.',
      'Get the toast on when the eggs are about half set.',
      'Take the pan off the heat while they still look slightly underdone &mdash; they keep cooking in the pan. Season and serve.',
    ],
    swap: 'Poached or boiled if you prefer; the numbers barely move.',
    leftovers: 'None. Scrambled egg does not keep.',
  },

  /* ── the daily extra, repeated every day ───────────────────────────── */

  'yogurt-berries': {
    name: 'Greek Yogurt with Berries',
    kind: 'extra',
    tagline: 'The same extra every day, on purpose. It closes the gap to 2,000 calories and takes no decision.',
    time: '2 min',
    yield: 2,
    ingredients: [
      ing('300g low-fat greek yogurt'),
      ing('200g mixed berries', '200g frozen mixed berries'),
      ing('40g peanuts', '40g peanuts, roughly chopped'),
      ing('2 tsp honey'),
    ],
    method: [
      'Spoon the yogurt into two bowls.',
      'Tip the frozen berries straight on top and leave them ten minutes. They defrost into the yogurt and bleed colour through it.',
      'Peanuts and honey over the top.',
    ],
    swap: 'Any frozen fruit. Frozen is cheaper than fresh all year and better in this.',
    leftovers: 'Assemble fresh.',
  },

  /* ── lunches ────────────────────────────────────────────────────────── */

  'cheese-salad-sandwich': {
    name: 'Cheese and Salad Sandwich',
    kind: 'lunch',
    tagline: 'The only lunch in the week that is not last night&rsquo;s dinner. No cooking at all.',
    time: '6 min',
    yield: 2,
    ingredients: [
      ing('6 slices wholemeal bread'),
      ing('100g cheddar', '100g cheddar, sliced'),
      ing('60g mixed leaves'),
      ing('100g cucumber', '100g cucumber, sliced'),
      ing('100g cherry tomatoes', '100g cherry tomatoes, halved'),
      ing('2 tsp mustard'),
      ing('2 apple', '2 apples, to finish'),
    ],
    method: [
      'Spread the mustard on the bread.',
      'Layer the cheese, then the salad, and press the sandwich together firmly so it holds.',
      'Cut in half, and take an apple each.',
    ],
    swap: 'Any hard cheese. Wholemeal rolls or pitta instead of sliced bread.',
    leftovers: 'Build it the morning you eat it &mdash; a sandwich made the night before is a wet paper bag by noon.',
  },

  'jacket-beans': {
    name: 'Jacket Potato with Beans and Cheese',
    kind: 'lunch',
    tagline: 'Five minutes of work and an hour of ignoring the oven. The Saturday lunch, put in before you go out.',
    time: '1 hr, 5 min of it yours',
    yield: 2,
    ingredients: [
      ing('600g potato baked', '2 large baking potatoes, about 300g each'),
      ing('400g reduced-sugar baked beans'),
      ing('60g cheddar', '60g cheddar, grated'),
      ing('60g low-fat natural yogurt', '2 tbsp natural yogurt'),
      ing('2 spring onion', '2 spring onions, sliced'),
      ing(negligible('salt'), 'salt, for the skins'),
    ],
    method: [
      'Heat the oven to 200&deg;C fan. Prick the potatoes all over, rub with a little oil and a lot of salt.',
      'Put them <b>straight on the oven shelf</b> &mdash; not on a tray, not in foil. Both steam the skin, and a jacket potato is all about the skin.',
      'Bake 55&ndash;65 minutes, until a knife meets no resistance.',
      'Warm the beans for the last five minutes. Split, fluff the insides with a fork, and load up.',
    ],
    swap: 'Leftover chilli from Monday instead of beans, if there is any left.',
    leftovers: 'Bake a spare potato while the oven is on; it keeps two days and reheats well.',
  },

  /* ── dinners ────────────────────────────────────────────────────────── */

  chilli: {
    name: 'Beef and Bean Chilli',
    kind: 'dinner',
    tagline: 'Half mince, half beans, which halves the cost without anyone at the table noticing.',
    time: '30 min',
    yield: 4,
    makesLunch: true,
    ingredients: [
      ing('450g lean beef mince', '450g lean beef mince (5%)'),
      ing('2 onion', '2 onions, diced'),
      ing('300g peppers', '2 peppers, diced'),
      ing('4 cloves garlic', '4 cloves garlic, crushed'),
      ing('800g chopped tomatoes', '2 x 400g tins chopped tomatoes'),
      ing('480g kidney beans', '2 x 400g tins kidney beans, drained'),
      ing('2 tbsp olive oil'),
      ing('300g brown rice dry', '300g brown rice, cooked fresh'),
      ing(negligible('ground cumin'), '2 tsp ground cumin'),
      ing(negligible('smoked paprika seasoning'), '2 tsp smoked paprika'),
      ing(negligible('chilli powder'), 'chilli powder, to taste'),
    ],
    method: [
      'Brown the mince in a dry pan over a high heat. Leave it alone a minute at a time so it colours rather than steams &mdash; grey mince tastes boiled.',
      'Turn the heat down, add the oil, onions and peppers, and cook 6 minutes.',
      'Garlic and spices for a minute, then the tomatoes and beans with a splash of water.',
      'Simmer 15 minutes while the rice cooks, until it is thick enough to hold a spoon mark for a second.',
      'Season well. Serve two portions; the other two go into tubs for tomorrow, cooled quickly.',
    ],
    swap: 'A third tin of beans instead of the mince drops the cost by about a third.',
    leftovers: 'Two lunch portions, better on day two. Cook the rice fresh both times rather than keeping it.',
  },

  dhal: {
    name: 'Red Lentil Dhal with Pitta',
    tagline: 'The cheapest dinner here by a distance, and one of the best. The spiced oil at the end is not a garnish.',
    kind: 'dinner',
    time: '30 min',
    yield: 4,
    makesLunch: true,
    ingredients: [
      ing('300g red lentils dry', '300g red lentils, rinsed'),
      ing('400g chopped tomatoes', '1 x 400g tin chopped tomatoes'),
      ing('2 onion', '2 onions, diced'),
      ing('4 cloves garlic', '4 cloves garlic, crushed'),
      ing('900ml vegetable stock'),
      ing('3 tbsp olive oil'),
      ing('4 wholemeal pitta', '4 wholemeal pittas, to serve'),
      ing(negligible('ground turmeric'), '2 tsp ground turmeric'),
      ing(negligible('ground cumin'), '2 tsp ground cumin'),
      ing(negligible('cumin seeds'), '1 tsp cumin seeds, for the spiced oil'),
    ],
    method: [
      'Cook the onions in 1 tbsp of the oil for 6 minutes, then add the garlic, turmeric and ground cumin for a minute.',
      'Add the lentils, tomatoes and stock. Boil, then simmer 20 minutes, stirring every few minutes so it does not catch.',
      'It is done when the lentils have collapsed completely. Season hard &mdash; dhal takes more salt than you expect.',
      'Heat the remaining 2 tbsp oil in a small pan until shimmering, add the cumin seeds and swirl 30 seconds until they smell nutty. Watch it; it burns in seconds.',
      'Pour the spiced oil over, stir once, and serve with warm pitta.',
    ],
    swap: 'Any tinned tomatoes. A handful of spinach stirred in at the end costs pennies and adds iron.',
    leftovers: 'Two lunch portions. It thickens overnight &mdash; loosen with a splash of boiling water.',
  },

  'lemon-chicken-couscous': {
    name: 'Lemon Chicken and Couscous Traybake',
    kind: 'dinner',
    tagline: 'One tray, and couscous rather than rice on purpose: it keeps for two days in the fridge without rice&rsquo;s one-day clock.',
    time: '35 min',
    yield: 4,
    makesLunch: true,
    ingredients: [
      ing('600g chicken thighs', '600g chicken thigh fillets, in large pieces'),
      ing('300g peppers', '2 peppers, in chunks'),
      ing('1 onion', '1 red onion, in wedges'),
      ing('240g tinned chickpeas', '1 x 400g tin chickpeas, drained'),
      ing('320g wholemeal couscous dry', '320g couscous'),
      ing('500ml chicken stock'),
      ing('3 tbsp olive oil'),
      ing('1 lemon'),
      ing(negligible('ground cumin'), '2 tsp ground cumin'),
      ing(negligible('smoked paprika seasoning'), '2 tsp smoked paprika'),
    ],
    method: [
      'Heat the oven to 200&deg;C fan. Toss the chicken, peppers, onion and chickpeas on a large tray with the oil, cumin, paprika, salt and pepper.',
      'Roast 25 minutes, turning once halfway, until the chicken is cooked through and the edges have caught.',
      'Meanwhile pour the stock over the couscous, cover with a plate, and leave 8 minutes. Fork it through.',
      'Squeeze the lemon over the tray, scraping up the juices &mdash; they are the best part of it.',
      'Serve two portions over the couscous; box the other two once cool.',
    ],
    swap: 'Chicken breast works but dries out on reheating; thighs are cheaper and more forgiving.',
    leftovers: 'Two lunch portions, good hot or cold, within 48 hours.',
  },

  meatballs: {
    name: 'Beef Meatballs in Tomato Sauce',
    kind: 'dinner',
    tagline: 'Bread soaked in milk is what keeps a cheap meatball tender. Skip it and you get little rubber balls.',
    time: '40 min',
    yield: 4,
    makesLunch: true,
    ingredients: [
      ing('500g lean beef mince'),
      ing('2 slices wholemeal bread', '2 slices bread, crusts off, torn'),
      ing('50ml semi-skimmed milk'),
      ing('1 egg'),
      ing('1 onion', '1 onion, finely diced'),
      ing('4 cloves garlic', '4 cloves garlic, crushed'),
      ing('800g chopped tomatoes', '2 x 400g tins chopped tomatoes'),
      ing('320g wholemeal pasta dry', '320g pasta'),
      ing('40g parmesan', '40g hard cheese, grated'),
      ing('2 tbsp olive oil'),
      ing(negligible('dried oregano'), '2 tsp dried oregano'),
    ],
    method: [
      'Soak the torn bread in the milk 5 minutes, then squeeze it and mash to a paste.',
      'Mix with the mince, egg, one crushed garlic clove, half the oregano, salt and pepper. Use your hands and stop the moment it comes together &mdash; overworking makes them bouncy. Roll into about 20 balls.',
      'Brown them in 1 tbsp of the oil in a wide pan, turning, for 6 minutes. They do not need to be cooked through yet. Lift them out.',
      'Cook the onion in the rest of the oil for 6 minutes, add the remaining garlic and oregano for a minute, then the tomatoes and a splash of water.',
      'Return the meatballs, cover, and simmer 15 minutes while the pasta boils. Finish with the grated cheese.',
    ],
    swap: 'Turkey mince is leaner and cheaper still, but needs the bread trick even more.',
    leftovers: 'Two lunch portions. Best in a roll with the sauce.',
  },
};
