// Three-day sample, cut from the Aldi budget edition, for sign-off before the
// four full books are written. It uses the finished page furniture - cover,
// how-it-works, planner, shopping list, recipe cards - at exactly the size and
// density the real books will use, so what is approved here is what ships.

import { recipes as aldiRecipes } from '../aldi-budget/recipes.mjs';

const days = [
  {
    day: 'Mon',
    b: 'Porridge, banana, honey',
    bMeta: '5 min &middot; 390 kcal',
    l: 'Cheese, pickle and salad sandwich',
    lMeta: 'No cooking &middot; 520 kcal',
    d: 'Beef and Bean Chilli',
    dMeta: '30 min &middot; makes tomorrow&rsquo;s lunch',
  },
  {
    day: 'Tue',
    b: 'Yogurt, oats and frozen berries',
    bMeta: '3 min &middot; 360 kcal',
    l: 'Last night&rsquo;s chilli, with rice',
    lMeta: 'Reheat &middot; 560 kcal',
    d: 'Creamy Garlic Chicken and Rice',
    dMeta: '35 min &middot; makes tomorrow&rsquo;s lunch',
  },
  {
    day: 'Wed',
    b: 'Scrambled eggs on toast',
    bMeta: '8 min &middot; 440 kcal',
    l: 'Last night&rsquo;s chicken and rice',
    lMeta: 'Reheat &middot; 580 kcal',
    d: 'Katsu-Style Chicken Curry',
    dMeta: '35 min &middot; makes Thursday&rsquo;s lunch',
  },
];

export default {
  slug: 'SAMPLE-3-day-aldi-budget',
  store: 'Aldi',
  title: 'Three-Day Sample',
  subtitle:
    'A working extract from <b>The Aldi Dinner Plan</b>, printed at full size so you can check the shape before the full six weeks are written.',
  footer: 'MealPrep.org.uk · Aldi dinner plan · sample',
  coverNote:
    'One dinner a night, about half an hour. Tomorrow&rsquo;s lunch comes out of the same pan.',
  showToc: false,
  recipeTotal: 3,
  facts: [
    { k: 'Feeds', v: '2 adults' },
    { k: 'Dinners', v: '30&ndash;35 min' },
    { k: 'Lunches', v: 'From dinner' },
    { k: 'Sample', v: '3 of 42 days' },
  ],

  sections: [
    {
      id: 'how',
      kicker: 'Start here',
      title: 'How the plan works',
      tag: 'Sample',
      tocSub: '',
      lede:
        'Every day in this book is written for <b>two adults</b>, at roughly 2,000 calories each. No batch cooking, no Sunday afternoon lost to the hob: you cook one dinner a night, in about half an hour, and tomorrow&rsquo;s lunch comes out of the same pan.',
      blocks: [
        { t: 'h', text: 'The four rules' },
        {
          t: 'numlist',
          items: [
            {
              b: 'Dinner takes about 30 minutes, and never more than 40.',
              text: ' Every recipe was timed from a cold start, including the chopping. Where a recipe needs an oven, the oven time is time you are not standing over it.',
            },
            {
              b: 'Most dinners are cooked slightly big.',
              text: ' Not double &mdash; just enough that two portions go into tubs for tomorrow&rsquo;s lunch. The pan is already dirty and the hob is already on, so it costs you nothing but the extra ingredients.',
            },
            {
              b: 'Breakfasts are assembled, not cooked.',
              text: ' Four breakfasts rotate through the whole six weeks. None of them takes more than eight minutes and none of them needs a recipe.',
            },
            {
              b: 'One shop a week, from the list as written.',
              text: ' The list is ordered the way the store is laid out rather than the way the recipes are written, so you walk the shop once.',
            },
          ],
        },
        { t: 'h', text: 'The one safety rule worth knowing' },
        {
          t: 'p',
          text:
            'Because lunch is last night&rsquo;s dinner, the leftovers matter. Food Standards Agency guidance is to cool cooked food and get it in the fridge within one to two hours, and to eat it within <b>48 hours</b>. Every leftover in this book is eaten the next day, comfortably inside that window.',
        },
        {
          t: 'callout',
          k: 'Rice is the exception',
          text:
            'Cooked rice has a tighter clock than everything else: chill it within one hour, keep it no more than one day, and reheat it once only. That is why rice dinners in this plan are always followed by a rice lunch the very next day, and never left later in the week. <span class="tiny">Food Standards Agency, food.gov.uk, checked 10 September 2026.</span>',
        },
        { t: 'h', text: 'What each week gives you' },
        {
          t: 'bullets',
          items: [
            '<b>A week planner</b> &mdash; seven days, three meals a day, for both of you, on one page with tick boxes.',
            '<b>One shopping list</b> &mdash; aisle by aisle, sized for two, with a typical basket estimate.',
            '<b>The new recipes</b> &mdash; two to a page, with what to swap when something is out of stock.',
            '<b>A note on the week</b> &mdash; what is worth knowing before you start it.',
          ],
        },
        {
          t: 'callout',
          k: 'About this sample',
          text:
            'The three days that follow are Monday to Wednesday of Week 1. The full book runs six weeks, 42 dinners built from 24 recipes, with the ones you like coming back. Page furniture, type size and recipe density here are final.',
        },
      ],
    },
  ],

  weeks: [
    {
      n: 1,
      title: 'The first three days',
      tag: 'Sample',
      tocSub: '',
      lede:
        'A deliberately steady start: one thing browning, one thing boiling, nothing that needs two pans going at once. Monday&rsquo;s chilli and Tuesday&rsquo;s chicken each make enough for the following day&rsquo;s lunch.',
      days,
      costEstimate: 'About &pound;24',
      shopNote:
        'Everything for three days, for two adults, including breakfasts and lunches. Quantities assume an empty fridge; cross off anything you already have.',
      shopping: [
        {
          aisle: 'Meat and fish',
          items: [
            { q: '250g', n: 'beef mince, 5%' },
            { q: '500g', n: 'chicken thigh fillets', note: 'Cheaper than breast and does not dry out when reheated' },
            { q: '4', n: 'breaded chicken fillets, frozen' },
          ],
        },
        {
          aisle: 'Fresh produce',
          items: [
            { q: '4', n: 'onions' },
            { q: '1', n: 'pepper' },
            { q: '4', n: 'carrots' },
            { q: '1 bulb', n: 'garlic' },
            { q: '3', n: 'bananas' },
            { q: '1', n: 'lemon' },
            { q: '1 bag', n: 'salad leaves' },
            { q: '1', n: 'cucumber' },
            { q: '2', n: 'tomatoes' },
          ],
        },
        {
          aisle: 'Chilled',
          items: [
            { q: '1 pack', n: 'cheddar', note: 'A block, not slices &mdash; cheaper per 100g and grates' },
            { q: '500g', n: 'natural yogurt' },
            { q: '6', n: 'eggs' },
            { q: '1 litre', n: 'milk' },
            { q: '1 small pot', n: 'cr&egrave;me fra&icirc;che' },
          ],
        },
        {
          aisle: 'Frozen',
          items: [
            { q: '1 bag', n: 'peas' },
            { q: '1 bag', n: 'mixed berries', note: 'Cheaper than fresh all year and better in yogurt' },
          ],
        },
        {
          aisle: 'Tins and jars',
          items: [
            { q: '2 tins', n: 'chopped tomatoes' },
            { q: '1 tin', n: 'kidney beans' },
            { q: '1 tube', n: 'tomato pur&eacute;e' },
            { q: '1 jar', n: 'pickle' },
          ],
        },
        {
          aisle: 'Cupboard',
          items: [
            { q: '500g', n: 'rice' },
            { q: '1 bag', n: 'porridge oats' },
            { q: '1 loaf', n: 'wholemeal bread' },
            { q: '1', n: 'honey' },
            { q: '1 pack', n: 'chicken stock cubes' },
          ],
        },
      ],
      cupboard:
        'Oil, salt, pepper, cumin, smoked paprika, curry powder, plain flour, soy sauce. These are the week-one cupboard buy in the full book &mdash; bought once, they cover all six weeks, and they are why the first shop always costs more than the five that follow.',
      notes: [
        {
          t: 'card',
          shadow: true,
          h: 'Before you start',
          blocks: [
            {
              t: 'bullets',
              items: [
                'Tuesday&rsquo;s chicken and rice contains cooked rice, so cool the lunch portions quickly and eat them on Wednesday &mdash; not later.',
                'Monday&rsquo;s chilli is better on day two, which is exactly when you eat the leftovers.',
                'If you want Wednesday lighter, the katsu sauce keeps and the chicken can be baked fresh in twenty minutes.',
              ],
            },
          ],
        },
      ],
      recipesTitle: 'The three dinners',
      newRecipes: ['chilli', 'creamy-chicken-rice', 'katsu-chicken'],
    },
  ],

  appendices: [],
  recipes: {
    chilli: aldiRecipes.chilli,
    'creamy-chicken-rice': aldiRecipes['creamy-chicken-rice'],
    'katsu-chicken': aldiRecipes['katsu-chicken'],
  },
};
