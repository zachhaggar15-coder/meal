// Aldi High-Protein - the written matter.
//
// Retailer facts are limited to what aldi.co.uk documents and what
// src/data/supermarketProfiles.js records (checked 2026-08-16): the own-label
// tiers, the dedicated higher-protein category, the Slimwell range and the
// short-range trading model. No specific product is claimed to be in stock.

export const content = {
  planLabel: 'High-protein &middot; Six weeks',
  coverNote:
    'One dinner a night, half an hour, and tomorrow&rsquo;s lunch out of the same pan &mdash; at around 150g of protein each, every day, without counting a thing.',
  facts: [
    { k: 'Feeds', v: '2 adults' },
    { k: 'Protein', v: 'About 150g each' },
    { k: 'Each day', v: 'About 2,000 kcal' },
    { k: 'Dinners', v: '25&ndash;40 min' },
  ],
  notAffiliated:
    'MealPrep.org.uk is not affiliated with, endorsed by, or connected to Aldi Stores Limited. Product ranges, packaging and availability are the retailer&rsquo;s and change without notice.',
  tocLede:
    'Six weeks of higher-protein dinners for two adults, the shopping list that buys them, and the twenty-four recipes behind them. The weeks come first; the recipes sit together in one chapter because most come round more than once.',
  shopLede:
    'Generated from the week&rsquo;s meals rather than written by hand, so a breakfast eaten five times is bought five times. Quantities are what the plan needs; buy the nearest pack size up.',
  recipesLede:
    'Thirty recipes: two breakfasts, one daily extra, three Monday lunches and twenty-four dinners. Every figure is calculated from the weighed ingredients, and the protein percentage on each card is worked out from those numbers rather than asserted.',
  recipesTocSub: 'All thirty, with calculated protein and a swap for each',
  fridgeLede:
    'The whole plan on one page. Print it, put it on the fridge, and the book can stay shut until you want a method.',
  blankLede:
    'Week seven onwards is yours. Keep the shape: a protein-led breakfast made the night before, the repeated extra, one fresh lunch on Monday, and six dinners that each feed the next day.',

  sections: [
    {
      id: 'how',
      kicker: 'Start here',
      title: 'How the plan works',
      tocSub: 'Five rules, and where the protein actually comes from',
      lede:
        'Written for <b>two adults</b> eating roughly 2,000 calories each a day, at around 150g of protein each. No batch cooking: one dinner a night, most in about half an hour, and tomorrow&rsquo;s lunch comes out of the same pan.',
      blocks: [
        { t: 'h', text: 'The five rules' },
        {
          t: 'numlist',
          items: [
            { b: 'Dinner takes forty minutes at the outside, usually nearer thirty.', text: ' Total elapsed time from a cold kitchen: chopping, preheating, cooking. Nothing hides behind an hour of unattended oven time.' },
            { b: 'Every dinner but Sunday&rsquo;s makes four portions.', text: ' Two eaten, two boxed for tomorrow while the pan is still dirty. That is the only preparation this book asks of you.' },
            { b: 'The protein is spread, not stacked.', text: ' Breakfast carries about 35g and the daily extra about 20g. That is over a third of the day&rsquo;s protein settled before dinner, which is why these dinners still look like meals rather than training food.' },
            { b: 'Monday&rsquo;s lunch is the only one you make.', text: ' Sunday&rsquo;s dinner is cooked at half size, so Monday gets a tuna and bean box, a wrap or a loaded jacket potato.' },
            { b: 'One shop a week, generated from the meals.', text: ' Aisle by aisle, with the quantities already multiplied by how often you actually cook each thing.' },
          ],
        },
        { t: 'h', text: 'What "high protein" means here, precisely' },
        {
          t: 'p',
          text:
            'It means <b>at least 20% of the day&rsquo;s energy comes from protein</b>, which is the threshold MealPrep.org.uk uses before a plan may carry the label. This plan is not scraping that line: it averages closer to <b>30%</b>, at roughly 150g per person per day. Both figures are calculated from the weighed ingredients, not asserted.',
        },
        {
          t: 'p',
          text:
            'That is a generous but unexceptional intake for two adults eating 2,000 calories. It is not a medical or performance prescription, and more is not automatically better &mdash; if you have kidney disease or any condition affecting how you handle protein, this is a conversation for your GP rather than a PDF. General healthy-eating guidance here follows the <b>NHS Eatwell Guide</b>.',
        },
        { t: 'h', text: 'Where the numbers come from' },
        {
          t: 'p',
          text:
            'Every calorie and gram is calculated from the ingredient list through the same engine as MealPrep.org.uk, drawing on the UK Composition of Foods Integrated Dataset (CoFID 2021), with USDA FoodData Central or a representative UK label where CoFID has no match. Carbohydrate is available carbohydrate, excluding fibre. They are planning estimates: reformulation, natural variation, draining and portioning all move the real figure.',
        },
        { t: 'h', text: 'The safety rule that shapes the week' },
        {
          t: 'p',
          text:
            'Lunch is last night&rsquo;s dinner, so leftovers are half the plan rather than an afterthought. Food Standards Agency guidance is to cool cooked food and refrigerate within one to two hours and eat it <b>within 48 hours</b>. Everything here is eaten the following day.',
        },
        {
          t: 'bullets',
          items: [
            'Box the two lunch portions while the food is hot rather than dividing a cooled pan later.',
            'Leave the tubs uncovered twenty minutes, then lid and refrigerate.',
            'Fridge between 0&deg;C and 5&deg;C. Many home fridges run warmer, and it is the one variable you cannot judge by eye.',
            'Reheat until steaming hot throughout, once only.',
          ],
        },
        {
          t: 'callout',
          k: 'Fish, eggs and rice each need a word',
          text:
            'Cooked rice keeps one day and reheats once, so rice dinners are served with rice cooked fresh on both nights. Baked and poached eggs do not reheat into anything pleasant, so the two egg dinners keep their stew and take fresh eggs the next day. Cooked fish keeps its 48 hours perfectly well but dislikes a second hard heating &mdash; warm it gently. <span class="tiny">Food Standards Agency guidance, food.gov.uk, checked 10 September 2026.</span>',
        },
      ],
    },

    {
      id: 'shopping-at-aldi',
      kicker: 'The shop',
      title: 'Buying protein well at Aldi',
      tocSub: 'Short range, own-label, and where the value sits',
      lede:
        'Aldi carries one or two options per line rather than ten. For a protein-led plan that is mostly helpful: fewer decisions, and the own-label version is the default rather than the compromise.',
      blocks: [
        { t: 'h', text: 'What is worth knowing' },
        {
          t: 'bullets',
          items: [
            '<b>There is a higher-protein category, and it is grouped.</b> Aldi lists higher-protein food and drink together online rather than scattering it through the aisles, which makes comparing a skyr against a protein yogurt straightforward. Everything in this plan sits in the ordinary ranges, so none of it is required.',
            '<b>Everyday Essentials and Specially Selected</b> are the value and premium own-label tiers. This plan is written for the standard range in between.',
            '<b>The Slimwell range</b> groups lower-calorie prepared products. Nothing here depends on it, but it is a sensible aisle to know about if you want to swap a dinner for something bought.',
            '<b>Ranges rotate and stock varies by store.</b> No recipe names a specific product, and every one has a swap line for the week something is missing.',
          ],
        },
        { t: 'h', text: 'The protein worth buying, and the protein worth skipping' },
        {
          t: 'p',
          text:
            'The best-value protein in this book is typically not in the higher-protein aisle at all. It is eggs, cottage cheese, tinned fish and dried pulses &mdash; which is why they appear as often as the chicken does. Protein bars, powders and fortified snacks are a convenience purchase rather than a value one, and this plan needs none of them.',
        },
        {
          t: 'p',
          text:
            'Two numbers are kept apart on every list. <b>What the plan needs</b> is the printed quantity. <b>What you buy</b> is the nearest pack up, because nobody sells 450g of mince. The surplus is not waste &mdash; use it normally and cross the line off.',
        },
        {
          t: 'callout',
          k: 'The cupboard list',
          text:
            'Week one buys the oil, spices, stock, soy, mustard and honey that carry all six weeks. It is why the first shop looks expensive and the next five do not, and why judging this plan&rsquo;s cost on week one alone is unfair to it.',
        },
      ],
    },

    {
      id: 'cost',
      kicker: 'Money',
      title: 'What this costs, honestly',
      tocSub: 'Why a protein-led plan sits a tier higher',
      lede:
        'This plan sits in MealPrep.org.uk&rsquo;s <b>moderate tier</b>: roughly &pound;40&ndash;&pound;55 per person per week, so about <b>&pound;80&ndash;&pound;110 a week for two</b> across three meals a day and the daily extra.',
      blocks: [
        {
          t: 'p',
          text:
            'That is a tier higher than the budget plan, and the reason is simply arithmetic: protein is the expensive part of a shopping basket. Salmon, steak, prawns and paneer all appear here, and no amount of clever shopping makes them cost the same as lentils.',
        },
        { t: 'h', text: 'How to bring it down without losing the protein' },
        {
          t: 'table',
          head: ['Swap', 'What happens to the protein', 'What happens to the cost'],
          rows: [
            ['Chicken thighs in place of breast', 'Slightly lower per 100g', 'Usually lower, and they reheat better'],
            ['Tinned fish in place of fresh', 'Comparable', 'Lower, often substantially'],
            ['Eggs and cottage cheese in place of a meat dinner', 'Comparable', 'Lower'],
            ['Frozen fish and prawns in place of fresh', 'The same', 'Lower, and less waste'],
            ['Lentils replacing a third of the mince', 'Slightly lower, more fibre', 'Lower'],
            ['Dropping the daily extra', 'About 20g a day lower', 'Lower, and the plan stops meeting its own protein figure'],
          ],
        },
        {
          t: 'p',
          text:
            'These are planning ranges rather than basket quotations. They assume own-brand ingredients, exclude what is already in your cupboard, and cannot account for offers, pack sizes, regional variation or reformulation. <span class="tiny">Tier range reviewed 29 July 2026 against the MealPrep.org.uk cost model.</span>',
        },
        {
          t: 'callout',
          k: 'If the budget matters more than the protein',
          text:
            'Then the honest advice is that the budget plan in this series will suit you better than a stripped-back version of this one. This plan is designed around protein being the priority; take that away and it is simply a more expensive way to eat.',
        },
      ],
    },

    {
      id: 'kit',
      kicker: 'Equipment',
      title: 'What you actually need',
      tocSub: 'Five things, and a word about the scales',
      lede:
        'One large tray, one big pan, a saucepan and a set of tubs will cook every dinner in this book. The scales matter more here than in most plans.',
      blocks: [
        {
          t: 'numlist',
          items: [
            { b: 'Two large roasting trays.', text: ' Several of these dinners are tray dinners, and a crowded tray steams rather than roasts. Chicken that steams goes pale and slightly grey, which is a texture problem as much as a looks one.' },
            { b: 'A wide, heavy pan.', text: ' For the stir-fries and the steak, weight matters more than non-stick: a thin pan drops its temperature the moment the meat hits it, and then the meat boils in its own juice.' },
            { b: 'Eight to twelve identical tubs.', text: ' Identical so they stack and the lids interchange. Around 700ml suits one adult portion.' },
            { b: 'Digital scales.', text: ' More important here than in the budget book. Protein figures depend on the portion actually being a quarter of the pan, and eyeballing four portions reliably gives you three generous ones and one disappointing Thursday.' },
            { b: 'A fridge thermometer.', text: ' The least expensive thing on this list and the only one that tells you whether the 48-hour rule is holding in your kitchen.' },
          ],
        },
        {
          t: 'callout',
          k: 'One thing you do not need',
          text:
            'A protein shaker. Nothing in these six weeks uses powder, and the daily figure is met from food. If you already use it, treat it as an addition rather than a replacement for the extra.',
        },
      ],
    },
  ],

  appendices: [
    {
      id: 'swaps',
      kicker: 'Reference',
      title: 'When something is not there',
      tocSub: 'Swaps that keep the protein figure intact',
      lede:
        'Aldi runs a short range and it rotates. These swaps change what is in the pan without moving the day&rsquo;s protein much; where they do move it, the table says so.',
      blocks: [
        {
          t: 'table',
          head: ['If you cannot get', 'Use instead', 'Effect on the day'],
          rows: [
            ['Skyr', 'Greek yogurt, or a high-protein yogurt pot', 'Greek yogurt gives up roughly 5g per serving. Two extra eggs at the weekend covers it.'],
            ['Protein yogurt', 'Skyr, or Greek yogurt plus a spoon of milk powder', 'Small drop with plain Greek yogurt; none with skyr.'],
            ['Chicken thigh fillets', 'Chicken breast', 'Slightly higher protein, drier on reheating. Cut the pieces larger.'],
            ['Cod', 'Any white fish, or salmon', 'Salmon is fattier and higher in calories; give it two minutes less.'],
            ['King prawns', 'White fish, or chicken breast', 'Comparable protein. Both need longer than prawns, so add them earlier.'],
            ['Paneer', 'Halloumi', 'Similar protein, considerably saltier. Season the dish less.'],
            ['Cottage cheese', 'Ricotta, or quark if it is stocked', 'Ricotta is milder and slightly lower in protein; quark is higher.'],
            ['Smoked mackerel', 'Tinned mackerel or salmon', 'Comparable protein, less smoke. Add a squeeze more lemon.'],
            ['Lean beef strips', 'Sirloin cut into strips, or pork loin', 'Comparable. Pork wants a minute longer.'],
            ['Firm tofu', 'Chicken breast or prawns', 'Higher protein, shorter cooking. Skip the pressing step.'],
            ['Edamame', 'Frozen peas plus a tin of chickpeas', 'Slightly lower protein, more fibre.'],
          ],
        },
        {
          t: 'callout',
          k: 'The swap that quietly breaks the plan',
          text:
            'Dropping the daily extra. It is 20g of protein and it appears forty-two times, so losing it costs more than any single dinner swap in this table. If you dislike yogurt, replace it with two boiled eggs and a piece of fruit rather than removing it.',
        },
      ],
    },

    {
      id: 'waste',
      kicker: 'Reference',
      title: 'Using up what is left',
      tocSub: 'Part-packs, and the protein worth freezing',
      lede:
        'Higher-protein shopping means more of the expensive things in the trolley, so the part-packs matter more than they do on a budget plan.',
      blocks: [
        {
          t: 'table',
          head: ['What is left over', 'Where it goes'],
          rows: [
            ['Half a block of paneer or halloumi', 'Cubed and browned into any of the curries, or on top of the halloumi tray.'],
            ['A part-tub of cottage cheese', 'Into the pasta bake, or onto toast under the weekend eggs.'],
            ['Yogurt near its date', 'The daily extra, the raita, or stirred into a curry off the heat.'],
            ['A few raw prawns', 'Freeze them on the day; they defrost in ten minutes in cold water and go into the linguine.'],
            ['Cooked chicken', 'Into the Monday wrap, which is written for poached chicken but does not mind where it came from.'],
            ['Fresh spinach on the turn', 'Any curry, any pasta sauce, in the last two minutes.'],
            ['Half a tin of beans', 'Frozen flat in a bag. They lose a little texture and nothing else.'],
            ['Fish you will not get to', 'Freeze on the day of purchase, not on the use-by date.'],
          ],
        },
        { t: 'h', text: 'The Sunday gap' },
        {
          t: 'p',
          text:
            'Sunday&rsquo;s dinner is cooked at half size, so for one night no leftovers sit in the fridge. That is deliberate: it clears the shelf before the new week&rsquo;s shop and stops a tub quietly ageing past its 48 hours at the back.',
        },
        {
          t: 'p',
          text:
            'If you would rather cook the full four portions, do &mdash; and freeze two. Label the bag with the contents and the date, and treat it as a spare dinner in a later week rather than a lunch, since the week&rsquo;s lunches are already accounted for.',
        },
      ],
    },

    {
      id: 'trouble',
      kicker: 'Reference',
      title: 'When it stops working',
      tocSub: 'Seven failures, and what each one actually is',
      lede:
        'Plans like this rarely fail because of a recipe. They fail for one of these, usually around week three.',
      blocks: [
        {
          t: 'numlist',
          items: [
            { b: 'You are full before you finish.', text: ' A high-protein day is a more filling day at the same calories, and that is mostly the point. If it is genuinely too much food, cut the extra in half rather than skipping a meal &mdash; the extra is the only thing here you can halve without unbalancing the day.' },
            { b: 'The chicken was dry on the second day.', text: ' Breast rather than thigh, most likely, or reheated too hard. Both are fixable: cut the pieces larger, and warm leftovers to steaming rather than blasting them.' },
            { b: 'You ate the leftovers as a second dinner.', text: ' Then tomorrow&rsquo;s lunch has gone. The three Monday lunches work on any day of the week and are a fair patch.' },
            { b: 'The shop felt expensive.', text: ' It is a tier above the budget plan by design. The swap table earlier lists the six changes that bring it down without dropping the protein figure.' },
            { b: 'Dinner took an hour.', text: ' Usually the chopping, occasionally the pan. Read the recipe through once before starting and get the oven on first.' },
            { b: 'You are not seeing the point of the protein.', text: ' The honest answer is that protein mostly buys satiety and helps preserve muscle when calories are controlled. It is not a magic macronutrient, and this plan will not do anything on its own that your overall diet and activity do not.' },
            { b: 'You went off-plan and never came back.', text: ' The weeks do not depend on each other. Start the next Monday, or repeat whichever week you liked most.' },
          ],
        },
      ],
    },
  ],
};
