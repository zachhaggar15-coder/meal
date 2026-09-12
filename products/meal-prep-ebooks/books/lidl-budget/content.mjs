// Lidl Budget - the written matter.
//
// Retailer facts are limited to what lidl.co.uk documents and what
// src/data/supermarketProfiles.js records (checked 2026-08-16): the Vemondo
// plant-based range, the Milbona dairy label, Deluxe as the premium own-label
// tier, Lidl Plus as the loyalty scheme, and the bakery. No specific product is
// claimed to be in stock, and no coupon or offer is promised.

export const content = {
  planLabel: 'Budget &middot; Six weeks',
  coverNote:
    'One dinner a night, half an hour, and tomorrow&rsquo;s lunch out of the same pan. Six weeks of it, decided before you start.',
  facts: [
    { k: 'Feeds', v: '2 adults' },
    { k: 'Dinners', v: '20&ndash;40 min' },
    { k: 'Each day', v: 'About 2,000 kcal' },
    { k: 'Meat-free', v: 'Half the dinners' },
  ],
  notAffiliated:
    'MealPrep.org.uk is not affiliated with, endorsed by, or connected to Lidl Great Britain Limited. Product ranges, packaging, availability and any loyalty offers are the retailer&rsquo;s and change without notice.',
  tocLede:
    'Six weeks of dinners for two adults, the shopping list that buys them, and the twenty-four recipes behind them. The weeks come first; the recipes sit together in one chapter because most come round more than once.',
  shopLede:
    'Generated from the week&rsquo;s meals rather than written by hand, so a breakfast eaten five times is bought five times. Quantities are what the plan needs; buy the nearest pack size up.',
  recipesLede:
    'Thirty recipes: two breakfasts, one daily extra, three Monday lunches and twenty-four dinners. Every figure is calculated from the weighed ingredients, and every dinner makes four portions &mdash; two for tonight, two for tomorrow&rsquo;s lunch.',
  recipesTocSub: 'All thirty, with calculated nutrition and a swap for each',
  fridgeLede:
    'The whole plan on one page. Print it, put it on the fridge, and the book can stay shut until you want a method.',
  blankLede:
    'Week seven onwards is yours. Keep the structure: one fresh lunch on Monday, six dinners that each feed the next day, and a Sunday cooked at half size.',

  sections: [
    {
      id: 'how',
      kicker: 'Start here',
      title: 'How the plan works',
      tocSub: 'Five rules, and the one safety rule behind them',
      lede:
        'Written for <b>two adults</b> eating roughly 2,000 calories each a day. No batch cooking and no Sunday afternoon at the hob: one dinner a night, most of them in about half an hour, and tomorrow&rsquo;s lunch comes out of the same pan.',
      blocks: [
        { t: 'h', text: 'The five rules' },
        {
          t: 'numlist',
          items: [
            { b: 'Dinner takes forty minutes at the outside, usually about thirty.', text: ' Total elapsed time from a cold kitchen, chopping and oven preheating included. Nothing is hidden behind an hour of unattended roasting.' },
            { b: 'Every dinner but Sunday&rsquo;s makes four portions.', text: ' Two eaten, two boxed while the pan is still dirty. That is the only preparation this book asks of you.' },
            { b: 'Monday&rsquo;s lunch is the only one you make.', text: ' There is no Sunday dinner behind it, so Monday gets a flatbread plate, a thick sandwich or a bowl of soup.' },
            { b: 'The weekday breakfast does not change.', text: ' Toast, boiled eggs and fruit, Monday to Friday, for six weeks. It is designed around the way many people actually eat, and it means one loaf rather than four half-used packets.' },
            { b: 'One shop a week, generated from the meals.', text: ' Grouped the way a shop is laid out rather than the way the recipes are written.' },
          ],
        },
        { t: 'h', text: 'Why half the dinners have no meat in them' },
        {
          t: 'p',
          text:
            'Because meat is usually the largest single line on a discounter receipt, and because Lidl&rsquo;s own-brand plant-based range makes the alternative cheaper here than it is in most shops. That is the honest reason: this is a budget book, and the beans, lentils and tofu are where the saving is.',
        },
        {
          t: 'p',
          text:
            'It is not an argument about diet. There is beef, pork, chicken, turkey and fish in these six weeks, and the meat-free dinners are spread through the weeks rather than clumped into a vegetarian block, so no week reads as the week you have to get through.',
        },
        { t: 'h', text: 'Where the numbers come from' },
        {
          t: 'p',
          text:
            'Every calorie and gram is <b>calculated from the weighed ingredient list</b> rather than estimated, through the same engine as MealPrep.org.uk. It draws on the UK Composition of Foods Integrated Dataset (CoFID 2021), with USDA FoodData Central or a representative UK label where CoFID has no suitable match. Carbohydrate is available carbohydrate, excluding fibre.',
        },
        {
          t: 'p',
          text:
            'They are planning estimates. Reformulation, natural variation, how well a tin is drained and how generously a portion is cut all move the real figure. General healthy-eating guidance here follows the <b>NHS Eatwell Guide</b> and is not personalised dietary advice.',
        },
        { t: 'h', text: 'The safety rule that shapes the week' },
        {
          t: 'p',
          text:
            'Lunch is last night&rsquo;s dinner, so leftovers are half the plan. Food Standards Agency guidance is to cool cooked food and refrigerate it within one to two hours, and eat it <b>within 48 hours</b>. Everything here is eaten the next day.',
        },
        {
          t: 'bullets',
          items: [
            'Box the two lunch portions while the food is hot rather than dividing a cooled pan later.',
            'Leave them uncovered twenty minutes, then lid and refrigerate.',
            'Fridge between 0&deg;C and 5&deg;C &mdash; worth checking once, because plenty of home fridges run warmer.',
            'Reheat until steaming hot throughout, and only once.',
          ],
        },
        {
          t: 'callout',
          k: 'Rice and eggs each need a word',
          text:
            'Cooked rice keeps one day and reheats once, which is why the only rice dinner in this book sits on a Sunday and leaves no leftovers. Fried and baked eggs do not survive reheating, so the two egg dinners keep their base and take fresh eggs the following day. <span class="tiny">Food Standards Agency guidance, food.gov.uk, checked 10 September 2026.</span>',
        },
      ],
    },

    {
      id: 'shopping-at-lidl',
      kicker: 'The shop',
      title: 'Shopping this plan at Lidl',
      tocSub: 'The bakery, the plant-based aisle and the app',
      lede:
        'Lidl runs a short range like every discounter, but two parts of it shape this book: a bakery that is unusually good for the price point, and an own-brand plant-based range that makes meat-free cooking genuinely cheap rather than merely worthy.',
      blocks: [
        { t: 'h', text: 'What is worth knowing' },
        {
          t: 'bullets',
          items: [
            '<b>The bakery does real work here.</b> Several dinners are built around good bread rather than beside it &mdash; the bean stew, the soup, the baked beans with feta. A loaf bought on the day it is baked and used across three days is one of the better value decisions in the shop.',
            '<b>Vemondo is the own-brand plant-based range.</b> Where a recipe calls for tofu or meat-free mince, this is where it comes from, and it is the reason this book can put six meat-free dinners into a fortnight without the bill rising.',
            '<b>Milbona is the own-brand dairy label</b> and Deluxe the premium own-label tier. Nothing here needs Deluxe.',
            '<b>Lidl Plus is a coupon scheme, not a plan.</b> If you use it, the savings tend to land on meat and dairy. Nothing in these six weeks depends on a coupon existing, because no book can promise one.',
            '<b>The middle aisle is a bonus, not a staple.</b> Stock varies week to week and store to store; plan around the food aisles.',
          ],
        },
        { t: 'h', text: 'How the list is built' },
        {
          t: 'p',
          text:
            'Each week&rsquo;s list is generated from that week&rsquo;s meals: every occurrence of every recipe, multiplied by how many times you actually cook it, then summed ingredient by ingredient. The weekday breakfast is eaten on five mornings, so five mornings&rsquo; worth of bread and eggs are on the list. Nothing is left off for being obvious.',
        },
        {
          t: 'p',
          text:
            'Two numbers stay separate. <b>What the plan needs</b> is the printed quantity. <b>What you buy</b> is the nearest pack up, because nobody sells 450g of tofu. The surplus is not waste; the following week&rsquo;s list assumes an empty cupboard, so use it and cross the line off.',
        },
        {
          t: 'callout',
          k: 'The cupboard list',
          text:
            'Week one buys oil, spices, stock, soy sauce, mustard, honey and peanut butter. They carry all six weeks, which is why the first shop is noticeably more expensive and why judging this plan on week one alone is unfair to it.',
        },
      ],
    },

    {
      id: 'cost',
      kicker: 'Money',
      title: 'What this costs, honestly',
      tocSub: 'A planning range, and where the saving really comes from',
      lede:
        'This plan sits in MealPrep.org.uk&rsquo;s <b>budget tier</b>: roughly &pound;30&ndash;&pound;40 per person per week, so about <b>&pound;60&ndash;&pound;80 a week for two</b>, covering three meals a day and the daily extra.',
      blocks: [
        {
          t: 'p',
          text:
            'That is a planning range and not a basket quotation. It assumes own-brand ingredients, does not subtract what is already in your cupboard, and makes no allowance for the things that find their way into a trolley on the way round.',
        },
        { t: 'h', text: 'Why there is no single number on the cover' },
        {
          t: 'p',
          text:
            'Grocery prices move weekly, offers appear and vanish, pack sizes change and the same basket costs differently in different parts of the country. A precise figure printed in a PDF is out of date within a month. A reviewed range is the honest version of the same claim.',
        },
        {
          t: 'table',
          head: ['What moves the number', 'Which direction'],
          rows: [
            ['Coupons and offers in the week you shop', 'Usually down, unpredictably'],
            ['Buying the next pack size up', 'Up in the week, down across the plan'],
            ['The week-one cupboard shop', 'Up sharply, once'],
            ['Ingredients you already own', 'Down, sometimes a lot'],
            ['Regional variation', 'Both ways'],
            ['Swapping a meat dinner for a meat-free one', 'Down, noticeably'],
          ],
        },
        {
          t: 'p',
          text:
            'Week five is the week to measure against if you want your own figure: the cupboard is stocked, nothing in it is unusual, and it is the leanest basket in the book. <span class="tiny">Tier range reviewed 29 July 2026 against the MealPrep.org.uk cost model.</span>',
        },
        {
          t: 'callout',
          k: 'Where the saving actually is',
          text:
            'Not in any single swap. It is in the lunch you did not buy at work, the half a cabbage that got eaten instead of composted, and the takeaway that did not get ordered because dinner was already decided. The recipes are the least interesting part of it.',
        },
      ],
    },

    {
      id: 'kit',
      kicker: 'Equipment',
      title: 'What you actually need',
      tocSub: 'Five things, and a note about the grill',
      lede:
        'One large tray, one wide pan, a saucepan and a set of tubs will cook everything here. The grill matters more in this book than in most.',
      blocks: [
        {
          t: 'numlist',
          items: [
            { b: 'Two large roasting trays.', text: ' Several dinners are tray dinners, and a crowded tray steams. Cauliflower and courgette are the two that punish it most.' },
            { b: 'A wide, heavy-based pan with a lid.', text: ' The hashes, the stews and the one-pan orzo all want width rather than depth, and a lid for the stage where eggs go in.' },
            { b: 'A grill you trust.', text: ' Two dinners finish under the grill rather than in the oven, which is what brings them in under forty minutes. Learn where the hot spot is; every grill has one.' },
            { b: 'Eight to twelve identical tubs.', text: ' Identical so they stack and the lids interchange. Around 700ml suits one adult portion.' },
            { b: 'Digital scales.', text: ' For splitting a pan into four honest portions, not for counting calories. That is the difference between the plan working and Thursday being short.' },
          ],
        },
        {
          t: 'callout',
          k: 'Measure the shelf before buying tubs',
          text:
            'The commonest mistake is a set that turns out to be two centimetres too tall to stack two deep in the fridge. That halves your usable space and quietly ends the habit in about three weeks.',
        },
      ],
    },
  ],

  appendices: [
    {
      id: 'swaps',
      kicker: 'Reference',
      title: 'When something is not there',
      tocSub: 'Swaps that do not break the plan',
      lede:
        'Discounter ranges rotate and stock varies by store, so sooner or later something on the list will be missing. None of these changes the shape of a week.',
      blocks: [
        {
          t: 'table',
          head: ['If you cannot get', 'Use instead', 'What changes'],
          rows: [
            ['Firm tofu', 'Halloumi, or a tin of chickpeas browned hard', 'Halloumi is saltier, so season the dish less. Chickpeas need no pressing.'],
            ['Meat-free mince', 'Green lentils, or beef mince', 'Lentils need no browning and give more fibre. Mince needs draining.'],
            ['Tinned sardines', 'Tinned mackerel or tuna', 'Mackerel is richer, tuna milder. Both go in at the very end.'],
            ['Smoked mackerel', 'Tinned mackerel, or smoked salmon trimmings', 'Less smoke from tinned; add an extra squeeze of lemon.'],
            ['Cod', 'Any white fish', 'Frozen is fine. Defrost in the fridge overnight, never on the worktop.'],
            ['Bakery bread', 'Any wholemeal loaf', 'The recipes work; the bean stew and the soup are simply less good.'],
            ['Falafel', 'Hummus and extra seeds, or halloumi', 'A little less protein with hummus; more with halloumi.'],
            ['Oatcakes', 'Rice cakes or rye crackers', 'Slightly fewer calories. The extra is sized around oatcakes, so add a piece of fruit.'],
            ['Butter beans', 'Cannellini, haricot or mixed beans', 'All crush into a sauce the same way.'],
            ['Orzo', 'Any small pasta shape, or long grain rice', 'If you switch to rice, cook it fresh for the leftover lunch as well.'],
          ],
        },
        {
          t: 'callout',
          k: 'The swap to think twice about',
          text:
            'Turning a pasta or couscous dinner into a rice one changes the leftover rules rather than just the taste. Cooked rice keeps one day and reheats once; pasta and couscous are far more forgiving.',
        },
      ],
    },

    {
      id: 'waste',
      kicker: 'Reference',
      title: 'Using up what is left',
      tocSub: 'Part-packs, stale bread and the Sunday gap',
      lede:
        'Pack sizes and recipes never quite agree. This is what to do with the difference, and most of it involves bread.',
      blocks: [
        {
          t: 'table',
          head: ['What is left over', 'Where it goes'],
          rows: [
            ['Bread going stale', 'Blitzed to crumbs for the macaroni cheese, or toasted for the bean stew. Stale bread is better than fresh in both.'],
            ['Half a tin of chopped tomatoes', 'Into the next tomato dinner, or frozen flat in a bag.'],
            ['Half a block of tofu', 'Pressed, cubed and browned into the fried rice on Sunday.'],
            ['A heel of cheese', 'Grated into the soup, the hash or the macaroni cheese.'],
            ['Half a bag of spinach', 'Any curry, any pasta, in the last two minutes.'],
            ['Soft carrots and onions', 'The base of the next stew or bolognese. Softness stops mattering once they are cooked down.'],
            ['A part-tub of hummus', 'Thinned with lemon and water into a dressing for the cauliflower tray.'],
            ['Bananas going brown', 'Into the porridge, or frozen whole for later.'],
          ],
        },
        { t: 'h', text: 'The Sunday gap' },
        {
          t: 'p',
          text:
            'Sunday&rsquo;s dinner is cooked at half size, so for one night there are no leftovers in the fridge. That is deliberate: it clears the shelf before the new week&rsquo;s shop, and it stops a tub quietly ageing past its 48 hours at the back.',
        },
        {
          t: 'p',
          text:
            'If you would rather cook the full four portions, freeze two. Label the bag with what it is and the date, and treat it as a spare dinner in a later week rather than as a lunch &mdash; the week&rsquo;s lunches are already spoken for.',
        },
      ],
    },

    {
      id: 'trouble',
      kicker: 'Reference',
      title: 'When it stops working',
      tocSub: 'Seven ways a plan like this actually fails',
      lede:
        'Plans rarely collapse because a recipe was bad. They collapse for one of these, usually in week three.',
      blocks: [
        {
          t: 'numlist',
          items: [
            { b: 'The meat-free dinners are not filling you up.', text: ' Usually a seasoning problem rather than a volume one: a bean stew needs noticeably more salt than the same dish with meat in it. If it is genuinely volume, add a slice of bread rather than a second portion.' },
            { b: 'You ate the leftovers as a second dinner.', text: ' Then tomorrow&rsquo;s lunch has gone. The three Monday lunches work on any day and are a fair patch.' },
            { b: 'Something went off early.', text: ' Either it went into the fridge warm, or the fridge is too warm, or it sat past 48 hours. Check the temperature first; it is the one you cannot feel.' },
            { b: 'Dinner took an hour.', text: ' Almost always the chopping. Read the recipe through once before you start and get the oven on first.' },
            { b: 'The tofu was disappointing.', text: ' It was not pressed, or the pan was not hot enough, or both. Tofu needs a genuinely hot pan and to be left alone once it lands in it.' },
            { b: 'The first shop was expensive.', text: ' It will have been. The cupboard list is bought once and carries all six weeks; weeks two to six are the real weekly cost.' },
            { b: 'You are hungry.', text: ' These plans are built on roughly 2,000 calories each a day. If you are tall, heavy, male, or on your feet all day, add a portion of carbohydrate to lunch and dinner before concluding the food is wrong.' },
          ],
        },
      ],
    },
  ],
};
