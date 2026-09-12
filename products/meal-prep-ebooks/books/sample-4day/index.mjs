// Four-day sample - Monday, Tuesday, Wednesday and Saturday - for sign-off.
//
// Rebuilt after a rules review against docs/nutrition-methodology.md and
// docs/cost-methodology.md. Three things changed from the first sample:
//
//   1. No macro is written by hand. Every figure comes from the quantified
//      ingredient list through src/utils/nutrition.js.
//   2. The day totals are checked against the site's own tolerance before the
//      book claims a calorie figure. All four days land inside +/-2%.
//   3. Cost is the site's budget tier range with a checked date, not a made-up
//      basket total.
//
// Monday, Tuesday and Wednesday share one breakfast; Saturday gets the other.
// That is how the BHF's own budget menus are built, and it is how people eat.

import { meals } from './meals.mjs';
import { computeAll, checkDays } from '../../build/nutrition.mjs';

const m = computeAll(meals);

const DAYS = [
  { label: 'Mon', b: 'porridge-banana', l: 'cheese-salad-sandwich', d: 'chilli' },
  { label: 'Tue', b: 'porridge-banana', l: 'chilli', d: 'dhal', lLeftover: true },
  { label: 'Wed', b: 'porridge-banana', l: 'dhal', d: 'lemon-chicken-couscous', lLeftover: true },
  { label: 'Sat', b: 'eggs-on-toast', l: 'jacket-beans', d: 'meatballs', weekend: true },
];

const check = checkDays(
  DAYS.map((d) => ({ label: d.label, meals: [m[d.b], m[d.l], m[d.d], m['yogurt-berries']].map((x) => x.macros) })),
  2000
);

const kcalOf = (id) => `${m[id].macros.kcal} kcal`;

const days = DAYS.map((d, i) => ({
  day: d.label,
  weekend: d.weekend,
  b: m[d.b].name,
  bMeta: `${m[d.b].time} &middot; ${kcalOf(d.b)}`,
  l: d.lLeftover ? `Yesterday&rsquo;s ${m[d.l].name.toLowerCase()}` : m[d.l].name,
  lMeta: d.lLeftover ? `Reheat &middot; ${kcalOf(d.l)}` : `${m[d.l].time} &middot; ${kcalOf(d.l)}`,
  d: m[d.d].name,
  dMeta: `${m[d.d].time} &middot; ${kcalOf(d.d)}${m[d.d].makesLunch ? ' &middot; makes lunch' : ''}`,
  total: check.rows[i].kcal,
}));

export default {
  slug: 'SAMPLE-4-day-aldi-budget',
  store: 'Aldi',
  title: 'Four-Day Sample',
  subtitle:
    'Monday, Tuesday, Wednesday and Saturday from <b>The Aldi Dinner Plan</b> &mdash; at full size, with every calorie calculated rather than estimated.',
  footer: 'MealPrep.org.uk · Aldi dinner plan · sample',
  coverNote:
    'One dinner a night, half an hour. The same breakfast on weekdays. Tomorrow&rsquo;s lunch out of tonight&rsquo;s pan.',
  showToc: false,
  recipeTotal: Object.keys(m).length,
  facts: [
    { k: 'Feeds', v: '2 adults' },
    { k: 'Dinners', v: '30&ndash;40 min' },
    { k: 'Day total', v: `${Math.round(check.mean)} kcal each` },
    { k: 'Sample', v: '4 of 42 days' },
  ],

  sections: [
    {
      id: 'how',
      kicker: 'Start here',
      title: 'How the plan works',
      tag: 'Sample',
      lede:
        'Written for <b>two adults</b> at roughly 2,000 calories each. No batch cooking and no Sunday lost to the hob: one dinner a night, about half an hour, and tomorrow&rsquo;s lunch comes out of the same pan.',
      blocks: [
        { t: 'h', text: 'The five rules' },
        {
          t: 'numlist',
          items: [
            {
              b: 'Dinner takes about 30 minutes and never more than 40.',
              text: ' Timed from a cold start, chopping included. Where a dish uses the oven, that is time you are not standing over it.',
            },
            {
              b: 'The weekday breakfast does not change.',
              text: ' One breakfast Monday to Friday, a second at weekends. This is not laziness on our part &mdash; it is how people actually eat, it removes a decision on the worst mornings, and it means one bag of oats instead of five half-used packets.',
            },
            {
              b: 'Most dinners are cooked slightly big.',
              text: ' Not double. Just enough that two portions go into tubs for tomorrow&rsquo;s lunch, while the pan is already dirty and the hob is already on.',
            },
            {
              b: 'There is one extra, every day, and it is the same one.',
              text: ' Yogurt, frozen berries and a few peanuts. It is what takes each day from about 1,750 calories to 2,000, and it needs no thought at all.',
            },
            {
              b: 'One shop a week, from the list as written.',
              text: ' Ordered the way the store is laid out rather than the way the recipes are, so you walk it once.',
            },
          ],
        },
        { t: 'h', text: 'Where the numbers come from' },
        {
          t: 'p',
          text:
            'Every calorie and gram in this book is <b>calculated from the weighed ingredient list</b>, not estimated. The quantities run through the same nutrition engine that powers MealPrep.org.uk, which draws on the UK Composition of Foods Integrated Dataset (CoFID 2021), with USDA FoodData Central or a representative UK label where CoFID has no suitable match.',
        },
        {
          t: 'table',
          head: ['Day', 'Total each', 'Against 2,000 kcal', 'Protein'],
          rows: check.rows.map((r) => [
            r.label,
            `${r.kcal} kcal`,
            `${r.diff >= 0 ? '+' : ''}${r.diff.toFixed(1)}%`,
            `${r.protein}g (${r.proteinEnergyPercent.toFixed(0)}% of energy)`,
          ]),
        },
        {
          t: 'small',
          text: `Four-day mean ${Math.round(check.mean)} kcal, ${check.meanDiff >= 0 ? '+' : ''}${check.meanDiff.toFixed(1)}% against target. Values are planning estimates, not medical advice: brand reformulation, cooking loss, drained weight and how you measure a portion all move the real figure. General healthy-eating guidance follows the <b>NHS Eatwell Guide</b>.`,
        },
        { t: 'h', text: 'The safety rule that shapes the week' },
        {
          t: 'p',
          text:
            'Because lunch is last night&rsquo;s dinner, leftovers matter. Food Standards Agency guidance is to cool cooked food and refrigerate it within one to two hours, and eat it within <b>48 hours</b>. Every leftover here is eaten the next day, well inside that.',
        },
        {
          t: 'callout',
          k: 'Rice is the exception',
          text:
            'Cooked rice keeps one day, not two, and is reheated once only. That is why the chilli&rsquo;s rice is cooked fresh on both nights rather than kept, and why Wednesday&rsquo;s traybake uses couscous &mdash; it holds for two days without the same clock. <span class="tiny">Food Standards Agency, food.gov.uk, checked 10 September 2026.</span>',
        },
        {
          t: 'callout',
          k: 'About this sample',
          text:
            'Four days of Week 1: three weekdays and a Saturday, so you can see both the weekday rhythm and how a weekend differs. The full book runs six weeks, with the dinners you like coming back rather than 42 recipes you cook once.',
        },
      ],
    },
  ],

  weeks: [
    {
      n: 1,
      title: 'Monday to Wednesday, and Saturday',
      tag: 'Sample',
      lede:
        'A deliberately steady start: one thing browning, one thing boiling, never two pans needing attention at once. Monday&rsquo;s chilli feeds Tuesday&rsquo;s lunch, Tuesday&rsquo;s dhal feeds Wednesday&rsquo;s.',
      days,
      everyDay: `Greek yogurt with frozen berries and peanuts &mdash; ${kcalOf('yogurt-berries')}, ${m['yogurt-berries'].macros.protein}g protein, two minutes.`,
      costEstimate: 'Budget tier',
      shopNote:
        'Everything for these four days, for two adults, including breakfasts, lunches and the daily extra. Quantities assume an empty cupboard; cross off what you already have.',
      shopping: [
        {
          aisle: 'Meat',
          items: [
            { q: '950g', n: 'lean beef mince (5%)', note: 'Two packs; one for Monday, one for Saturday' },
            { q: '600g', n: 'chicken thigh fillets', note: 'Cheaper than breast and does not dry out when reheated' },
          ],
        },
        {
          aisle: 'Fresh produce',
          items: [
            { q: '6', n: 'onions' },
            { q: '1', n: 'red onion' },
            { q: '600g', n: 'peppers', note: 'About four' },
            { q: '2 bulbs', n: 'garlic' },
            { q: '6', n: 'bananas' },
            { q: '2', n: 'apples' },
            { q: '1', n: 'lemon' },
            { q: '1 bag', n: 'mixed salad leaves' },
            { q: '1', n: 'cucumber' },
            { q: '100g', n: 'cherry tomatoes' },
            { q: '2', n: 'spring onions' },
            { q: '600g', n: 'baking potatoes', note: 'Two large ones' },
          ],
        },
        {
          aisle: 'Chilled',
          items: [
            { q: '160g', n: 'cheddar', note: 'A block, not slices: cheaper per 100g and it grates' },
            { q: '40g', n: 'hard cheese for grating' },
            { q: '300g', n: 'low-fat Greek yogurt' },
            { q: '60g', n: 'natural yogurt' },
            { q: '6', n: 'eggs' },
            { q: '1.5 litres', n: 'semi-skimmed milk' },
            { q: '1 small pack', n: 'butter' },
          ],
        },
        {
          aisle: 'Frozen',
          items: [{ q: '200g', n: 'mixed berries', note: 'Cheaper than fresh all year and better in yogurt' }],
        },
        {
          aisle: 'Tins',
          items: [
            { q: '5 x 400g', n: 'chopped tomatoes' },
            { q: '2 x 400g', n: 'kidney beans' },
            { q: '1 x 400g', n: 'chickpeas' },
            { q: '2 x 200g', n: 'reduced-sugar baked beans' },
          ],
        },
        {
          aisle: 'Cupboard',
          items: [
            { q: '300g', n: 'brown rice' },
            { q: '320g', n: 'couscous' },
            { q: '320g', n: 'pasta' },
            { q: '300g', n: 'red lentils' },
            { q: '120g', n: 'porridge oats' },
            { q: '1 loaf', n: 'wholemeal bread', note: 'You need 12 slices across the four days' },
            { q: '4', n: 'wholemeal pittas' },
            { q: '40g', n: 'peanuts' },
            { q: '1', n: 'honey' },
            { q: '1', n: 'olive oil' },
            { q: '2', n: 'vegetable stock cubes' },
            { q: '2', n: 'chicken stock cubes' },
          ],
        },
      ],
      cupboard:
        'Ground cumin, smoked paprika, chilli powder, ground turmeric, cumin seeds, dried oregano, mustard, salt and pepper. These are the week-one buy: bought once, they cover all six weeks, which is why the first shop always costs more than the five that follow.',
      notes: [
        {
          t: 'card',
          shadow: true,
          h: 'What this costs',
          blocks: [
            {
              t: 'p',
              text:
                'This plan sits in MealPrep.org.uk&rsquo;s <b>budget tier</b>: roughly <b>&pound;30&ndash;&pound;40 per person per week</b>, so about <b>&pound;60&ndash;&pound;80 a week for two</b> covering all three meals a day plus the extra. These four days are a little over half of that.',
            },
            {
              t: 'small',
              text:
                'That is a planning range, not a basket quotation. It assumes own-brand ingredients, does not subtract what is already in your cupboard, and does not account for offers, pack sizes or regional differences. Tier range reviewed 29 July 2026; prices move, so treat it as the shape of the shop rather than a quote.',
            },
          ],
        },
        {
          t: 'card',
          h: 'Before you start',
          blocks: [
            {
              t: 'bullets',
              items: [
                'Monday&rsquo;s chilli and Tuesday&rsquo;s dhal are both better on day two, which is exactly when you eat the leftovers.',
                'Cook the chilli&rsquo;s rice fresh on both nights. It takes 25 minutes for brown rice and it removes the only real food-safety risk in the week.',
                'Saturday&rsquo;s meatballs are the longest cook at 40 minutes. If that is too much on a Saturday, swap the day with Monday&rsquo;s chilli &mdash; nothing else moves.',
              ],
            },
          ],
        },
      ],
      recipesTitle: 'The recipes',
      newRecipes: ['porridge-banana', 'eggs-on-toast', 'yogurt-berries', 'cheese-salad-sandwich', 'jacket-beans', 'chilli', 'dhal', 'lemon-chicken-couscous', 'meatballs'],
    },
  ],

  appendices: [],
  recipes: m,
};
