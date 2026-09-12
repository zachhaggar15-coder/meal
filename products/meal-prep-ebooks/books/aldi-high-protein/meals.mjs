// Aldi High-Protein - the repeating meals.
//
// The protein target is met mostly here rather than in the dinners. A breakfast
// at 35g and an extra at 25g mean the dinners do not have to become slabs of
// chicken to make the daily figure work, which is what keeps this a plan for two
// people who like food rather than a bodybuilding diet.

import { negligible } from '../../build/plan.mjs';

const ing = (line, display) => ({ line, display: display || line });

export const repeatingMeals = {
  /* ── breakfasts ──────────────────────────────────────────────────── */

  'skyr-oats-seeds': {
    name: 'Skyr, Oats and Seeds',
    kind: 'breakfast',
    tagline: 'Made the night before in the tub you eat it from. Roughly twice the protein of the same bowl made with milk.',
    time: '5 min, plus overnight',
    yield: 2,
    ingredients: [
      ing('65g rolled oats', '65g porridge oats'),
      ing('400g skyr'),
      ing('160ml semi-skimmed milk'),
      ing('2 banana', '2 bananas, sliced in the morning'),
      ing('15g mixed seeds'),
      ing('2 tsp honey'),
    ],
    method: [
      'Divide the oats between two tubs, 33g each, and stir 200g of skyr and 80ml of milk into each one. Stir right to the bottom; dry oats hiding under the skyr is the usual way this goes wrong.',
      'Lid them and leave in the fridge overnight.',
      'In the morning add the banana, seeds and honey. Loosen with a splash more milk if it has set firmer than you like.',
    ],
    swap: 'Greek yogurt instead of skyr costs a little less and gives up some protein. Both work.',
    leftovers: 'Make both tubs at once the night before. They keep three days, so Monday night can cover Tuesday and Wednesday too.',
  },

  'eggs-mushrooms-toast': {
    name: 'Eggs, Mushrooms and Cottage Cheese on Toast',
    kind: 'breakfast',
    tagline: 'The weekend breakfast. Cottage cheese under the eggs sounds odd and disappears completely into them.',
    time: '12 min',
    yield: 2,
    ingredients: [
      ing('4 egg', '4 eggs'),
      ing('120g cottage cheese'),
      ing('250g mushrooms', '250g mushrooms, sliced'),
      ing('4 slices wholemeal bread'),
      ing('100g cherry tomatoes', '100g cherry tomatoes, halved'),
      ing('1 tbsp olive oil'),
      ing(negligible('black pepper'), 'salt and black pepper'),
    ],
    method: [
      'Fry the mushrooms and tomatoes hard in the oil for 6 minutes, until the mushrooms have given up their water and browned.',
      'Beat the eggs with a good pinch of salt and scramble them slowly over a low heat, taking the pan off while they still look slightly underdone.',
      'Toast the bread, spread the cottage cheese over it, pile on the eggs and mushrooms, and finish with plenty of pepper.',
    ],
    swap: 'Ricotta or light cream cheese in place of the cottage cheese; both are milder.',
    leftovers: 'None. Eggs do not keep.',
  },

  /* ── the daily extra ─────────────────────────────────────────────── */

  'protein-yogurt-nuts': {
    name: 'Protein Yogurt with Berries and Almonds',
    kind: 'extra',
    tagline: 'The same thing every day, and the reason the daily protein figure lands where it does without any dinner working overtime.',
    time: '2 min',
    yield: 2,
    ingredients: [
      ing('300g protein yogurt'),
      ing('200g mixed berries', '200g frozen mixed berries'),
      ing('25g almonds', '25g almonds, roughly chopped'),
      ing('1 tsp honey'),
    ],
    method: [
      'Spoon the yogurt into two bowls.',
      'Tip the berries on from the freezer and leave them ten minutes to thaw into it.',
      'Almonds and honey over the top.',
    ],
    swap: 'Skyr or a high-protein yogurt pot. Aldi groups these together online under its higher-protein range, which makes the comparison easy.',
    leftovers: 'Assemble fresh.',
  },

  /* ── Monday lunches ──────────────────────────────────────────────── */

  'tuna-bean-salad-box': {
    name: 'Tuna, Butter Bean and Egg Box',
    kind: 'lunch',
    tagline: 'No cooking beyond boiling two eggs, and around 45g of protein before you have touched the bread.',
    time: '15 min',
    yield: 2,
    ingredients: [
      ing('200g tinned tuna in spring water', '2 tins tuna, drained'),
      ing('480g cannellini beans', '2 x 400g tins butter or cannellini beans, drained'),
      ing('4 egg', '4 eggs'),
      ing('150g cherry tomatoes', '150g cherry tomatoes, halved'),
      ing('100g cucumber', '100g cucumber, diced'),
      ing('60g mixed leaves'),
      ing('1 lemon'),
      ing('2 tbsp olive oil'),
      ing('2 tsp mustard'),
    ],
    method: [
      'Boil the eggs for 9 minutes, then cool them under cold running water before peeling.',
      'Whisk the lemon juice, oil, mustard, salt and pepper in the bottom of a large bowl.',
      'Add the beans, tuna, tomatoes and cucumber and fold together, breaking up the tuna but not to a paste.',
      'Divide between two boxes, add the leaves on top and two halved eggs each.',
    ],
    swap: 'Tinned salmon or mackerel. Chickpeas instead of butter beans stay firmer.',
    leftovers: 'Dress it the morning you eat it if you can; the leaves go limp overnight.',
  },

  'chicken-hummus-wrap': {
    name: 'Chicken, Hummus and Slaw Wraps',
    kind: 'lunch',
    tagline: 'Built from a chicken breast poached while the kettle boils, which is the quietest way to cook one.',
    time: '20 min',
    yield: 2,
    ingredients: [
      ing('300g chicken breast'),
      ing('4 wholemeal tortilla', '4 tortilla wraps'),
      ing('150g hummus'),
      ing('200g cabbage', '200g cabbage, finely shredded'),
      ing('1 carrot', '1 carrot, coarsely grated'),
      ing('100g low-fat greek yogurt'),
      ing('1 lemon'),
      ing(negligible('black pepper'), 'salt and black pepper'),
    ],
    method: [
      'Put the chicken breasts in a small pan, cover with boiling water, bring back to a bare simmer and cook 14 minutes. Check the thickest part is white all the way through, then shred with two forks.',
      'Mix the cabbage and carrot with the yogurt, lemon juice, salt and pepper.',
      'Spread the hummus over the wraps, add the chicken and the slaw, and roll them up tightly.',
    ],
    swap: 'Leftover roast chicken, or two tins of chickpeas crushed with lemon for a meat-free version.',
    leftovers: 'Keep the chicken and slaw in separate tubs and build the wrap in the morning.',
  },

  'cottage-cheese-jacket': {
    name: 'Jacket Potato with Cottage Cheese and Chives',
    kind: 'lunch',
    tagline: 'The oven does an hour of unattended work and the topping takes two minutes. Unfashionable, and quietly one of the highest-protein lunches here.',
    time: '1 hr, 5 min of it yours',
    yield: 2,
    ingredients: [
      ing('600g potato baked', '2 large baking potatoes, about 300g each'),
      ing('400g cottage cheese'),
      ing('150g sweetcorn', '150g tinned sweetcorn, drained'),
      ing('4 spring onion', '4 spring onions, sliced'),
      ing('100g cherry tomatoes', '100g cherry tomatoes, halved'),
      ing('40g cheddar', '40g cheddar, grated'),
      ing(negligible('black pepper'), 'salt and black pepper'),
    ],
    method: [
      'Heat the oven to 200&deg;C fan. Prick the potatoes, rub with a little oil and plenty of salt, and put them straight on the shelf &mdash; no tray, no foil.',
      'Bake 55&ndash;65 minutes, until a knife goes through without resistance.',
      'Mix the cottage cheese, sweetcorn, spring onions and tomatoes with a lot of black pepper.',
      'Split the potatoes, fork up the insides, pile the mixture in and scatter the cheddar over.',
    ],
    swap: 'Sweet potato, which needs about ten minutes less.',
    leftovers: 'Bake a spare while the oven is hot; it keeps two days.',
  },
};
