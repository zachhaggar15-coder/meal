// Aldi Budget - the written matter.
//
// Retailer facts here are limited to what is durably documented on aldi.co.uk
// and recorded in src/data/supermarketProfiles.js (checked 2026-08-16): the
// value and premium own-label tiers, the dedicated higher-protein category, and
// the short-range trading model. No specific product is claimed to be in stock,
// because stock is exactly the thing that cannot be promised in print.

export const content = {
  planLabel: 'Budget &middot; Six weeks',
  coverNote:
    'One dinner a night, half an hour, and tomorrow&rsquo;s lunch out of the same pan. Six weeks of it, decided before you start.',
  facts: [
    { k: 'Feeds', v: '2 adults' },
    { k: 'Dinners', v: '20&ndash;40 min' },
    { k: 'Each day', v: 'About 2,000 kcal' },
    { k: 'Shops', v: 'Once a week' },
  ],
  notAffiliated:
    'MealPrep.org.uk is not affiliated with, endorsed by, or connected to Aldi Stores Limited. Product ranges, packaging and availability are the retailer&rsquo;s and change without notice.',
  tocLede:
    'Six weeks of dinners for two adults, the shopping list that buys them, and the twenty-four recipes they are built from. The weeks come first; the recipes sit together in one chapter because most of them come round more than once.',
  shopLede:
    'Generated from the week&rsquo;s meals rather than written by hand, so a breakfast eaten five times is bought five times. Quantities are what the plan needs; buy the nearest pack size up.',
  recipesLede:
    'Thirty recipes: two breakfasts, one daily extra, three Monday lunches and twenty-four dinners. Every figure is calculated from the weighed ingredients rather than estimated, and every dinner makes four portions &mdash; two for tonight, two for tomorrow&rsquo;s lunch.',
  recipesTocSub: 'All thirty, with calculated nutrition and a swap for each',
  fridgeLede:
    'The whole plan on one page. Print it, put it on the fridge door, and you need not open the book again until you want a method.',
  blankLede:
    'Week seven onwards is yours. The structure is the useful part: one fresh lunch on Monday, six dinners that each feed the next day, and a Sunday cooked at half size.',

  sections: [
    {
      id: 'how',
      kicker: 'Start here',
      title: 'How the plan works',
      tocSub: 'The five rules, and the one safety rule behind them',
      lede:
        'Written for <b>two adults</b> eating roughly 2,000 calories each a day. There is no batch cooking in this book and no Sunday afternoon lost to the hob. You cook one dinner a night, most of them in about half an hour, and tomorrow&rsquo;s lunch comes out of the same pan.',
      blocks: [
        { t: 'h', text: 'The five rules' },
        {
          t: 'numlist',
          items: [
            {
              b: 'Dinner takes forty minutes at the outside, and usually about thirty.',
              text: ' That is total elapsed time from a cold kitchen: chopping, preheating the oven, the lot. Where a recipe says 35 minutes, thirty-five minutes is when you eat, not when the timer starts.',
            },
            {
              b: 'Every dinner except Sunday&rsquo;s is cooked slightly big.',
              text: ' Not double &mdash; four portions. Two go on the plate, two go into tubs while the pan is still dirty and the hob is still on. That is the whole of the preparation this book asks for.',
            },
            {
              b: 'Monday&rsquo;s lunch is the only one you make.',
              text: ' There is no Sunday dinner behind it, so Monday gets a sandwich, a jacket potato or a plate of hummus and vegetables. From Tuesday the system feeds itself.',
            },
            {
              b: 'The weekday breakfast does not change.',
              text: ' Porridge Monday to Friday for six weeks, eggs and beans at the weekend. This is designed around the way many people eat rather than the way recipe books pretend they do, and it means one bag of oats instead of five half-finished packets.',
            },
            {
              b: 'One shop a week, from the list as written.',
              text: ' The list is generated from the week&rsquo;s meals, grouped the way a shop is laid out rather than the way the recipes are written.',
            },
          ],
        },
        { t: 'h', text: 'Where the numbers come from' },
        {
          t: 'p',
          text:
            'Every calorie and gram in this book is <b>calculated from the weighed ingredient list</b>, not estimated by eye. The quantities run through the same nutrition engine as MealPrep.org.uk, which uses the UK Composition of Foods Integrated Dataset (CoFID 2021), with USDA FoodData Central or a representative UK label where CoFID has no suitable match. Carbohydrate figures are available carbohydrate, excluding fibre, as UK labels report it.',
        },
        {
          t: 'p',
          text:
            'They remain planning estimates. Brand reformulation, natural variation, how well you drain a tin and how generously you cut a portion all move the real number. General healthy-eating guidance in this book follows the <b>NHS Eatwell Guide</b>; it is not personalised dietary advice, and if you are eating to a clinical target you should be working with someone who knows your history.',
        },
        { t: 'h', text: 'The safety rule that shapes the week' },
        {
          t: 'p',
          text:
            'Because lunch is last night&rsquo;s dinner, leftovers are not an afterthought here &mdash; they are half the plan. Food Standards Agency guidance is to cool cooked food and get it into the fridge within one to two hours, and to eat it <b>within 48 hours</b>. Every leftover in this book is eaten the following day, which sits comfortably inside that window.',
        },
        {
          t: 'bullets',
          items: [
            'Portion the two lunch servings into their tubs while the food is still hot, rather than leaving the pan to cool and dividing it later. It cools faster and it is safer.',
            'Leave the tubs uncovered for twenty minutes or so, then lid them and refrigerate. A lid on boiling food traps steam and slows the cooling down.',
            'Your fridge should sit between 0&deg;C and 5&deg;C. A lot of home fridges run warmer than that, and it is the one variable you cannot feel.',
            'Reheat until steaming hot all the way through, and only ever once.',
          ],
        },
        {
          t: 'callout',
          k: 'Rice gets its own rule',
          text:
            'Cooked rice keeps for one day, not two, and is reheated once only. So where a dinner is served on rice, the rice is cooked fresh on both nights and only the sauce is kept &mdash; it costs ten minutes and removes the only real risk in the week. One dish, the creamy garlic chicken and rice, cooks its rice into the dish and cannot do this; its leftovers are chilled within the hour and eaten the next day. <span class="tiny">Food Standards Agency guidance, food.gov.uk, checked 10 September 2026.</span>',
        },
      ],
    },

    {
      id: 'shopping-at-aldi',
      kicker: 'The shop',
      title: 'Shopping this plan at Aldi',
      tocSub: 'Short range, big packs, and what that means for a plan',
      lede:
        'Aldi trades on a deliberately short list: one or two options per line rather than ten. That is a constraint when you want something specific and an advantage when you simply want the week bought and to be out of there in twenty minutes.',
      blocks: [
        { t: 'h', text: 'What that means for this plan' },
        {
          t: 'bullets',
          items: [
            '<b>Own-label is the default, not the compromise.</b> Aldi&rsquo;s value tier is Everyday Essentials and its premium own-label tier is Specially Selected. This plan is written for the standard own-brand range that sits between them; nothing here needs the premium tier.',
            '<b>The ranges rotate.</b> Aldi carries fewer lines per category than the big four and what is on the shelf moves around, so no recipe in this book names a specific product. Every recipe has a swap line underneath it for the week something is simply not there.',
            '<b>Buy the pack, use the pack.</b> The plan is built so that a pack opened on Tuesday gets finished by Sunday &mdash; the mince, the cheese, the yogurt and the frozen vegetables all recur within the week they are bought.',
            '<b>The middle aisle is not a meal plan.</b> Treat it as a bonus. Nothing in these six weeks depends on it.',
          ],
        },
        { t: 'h', text: 'How the list is built' },
        {
          t: 'p',
          text:
            'Each week&rsquo;s list is generated from that week&rsquo;s meals: every occurrence of every recipe, multiplied by how many times you actually cook it, then added up ingredient by ingredient. If the weekday porridge is eaten on five mornings, five mornings&rsquo; worth of oats and milk are on the list. Nothing is estimated and nothing is left off because it felt obvious.',
        },
        {
          t: 'p',
          text:
            'Two numbers are deliberately kept apart. <b>What the plan needs</b> is the quantity printed on the list. <b>What you have to buy</b> is the nearest pack size up &mdash; you cannot buy 450g of mince. The difference is not waste: the following week&rsquo;s list assumes you start empty, so use the surplus in the ordinary way and cross the item off.',
        },
        {
          t: 'callout',
          k: 'The cupboard list',
          text:
            'Week one&rsquo;s list carries a cupboard section &mdash; oil, spices, mustard, soy sauce, stock cubes, vinegar and honey. These are bought once and carry all six weeks. It is why the first shop is noticeably more expensive than the five that follow, and why judging the plan&rsquo;s cost on week one alone is unfair to it.',
        },
      ],
    },

    {
      id: 'cost',
      kicker: 'Money',
      title: 'What this costs, honestly',
      tocSub: 'A planning range, and why it is not a price promise',
      lede:
        'This plan sits in MealPrep.org.uk&rsquo;s <b>budget tier</b>: roughly &pound;30&ndash;&pound;40 per person per week, so about <b>&pound;60&ndash;&pound;80 a week for two</b>, covering three meals a day and the daily extra.',
      blocks: [
        {
          t: 'p',
          text:
            'That is a planning range, not a basket quotation, and the distinction matters enough to spell out. It assumes own-brand ingredients throughout. It does not subtract what is already in your cupboard, and it does not add anything for delivery or for the things that end up in the trolley on the way round.',
        },
        { t: 'h', text: 'Why we will not print a single number' },
        {
          t: 'p',
          text:
            'Grocery prices move week to week, offers come and go, pack sizes change and the same basket costs differently in different parts of the country. A precise figure printed in a PDF is out of date within a month and misleading for the rest of its life. A range that has been reviewed against the site&rsquo;s own cost model is the honest version.',
        },
        {
          t: 'table',
          head: ['What moves the number', 'Which direction'],
          rows: [
            ['Promotions and multibuys in the week you shop', 'Usually down, unpredictably'],
            ['Buying the next pack size up because that is what is sold', 'Up in the week, down over the plan'],
            ['Cupboard staples bought in week one', 'Up sharply in week one only'],
            ['Ingredients you already own', 'Down, sometimes by a lot'],
            ['Regional price variation', 'Both ways'],
            ['Swapping the meat out for a tin of beans', 'Down, noticeably'],
          ],
        },
        {
          t: 'p',
          text:
            'If you want to know what it actually costs <b>you</b>, week five is the one to measure. It is the leanest basket in the book, the cupboard is already stocked, and nothing in it is unusual. <span class="tiny">Tier range reviewed 29 July 2026 against the MealPrep.org.uk cost model.</span>',
        },
        {
          t: 'callout',
          k: 'Where the savings actually are',
          text:
            'Not in any single clever swap. They are in three dull mechanisms: the lunch you did not buy at work, the vegetables that got eaten rather than composted, and the takeaway that did not get ordered because dinner was already decided. The recipes are the least interesting part of the saving.',
        },
      ],
    },

    {
      id: 'kit',
      kicker: 'Equipment',
      title: 'What you actually need',
      tocSub: 'Five things, and the ones you can ignore',
      lede:
        'Everything in these six weeks can be cooked with one large tray, one big pan, a saucepan and a set of tubs. Everything past that line is genuinely optional, whatever the internet suggests.',
      blocks: [
        {
          t: 'numlist',
          items: [
            {
              b: 'One large, sturdy roasting tray &mdash; ideally two.',
              text: ' A thin tray warps in a hot oven and tips the oil into one corner, which burns half of whatever is on it. Two trays mean a traybake can spread out instead of steaming.',
            },
            {
              b: 'A big lidded pan, four litres or so.',
              text: ' Casserole, stockpot, deep saut&eacute; pan; the name does not matter and the volume does. A four-portion chilli will not fit in a small saucepan without you wearing some of it.',
            },
            {
              b: 'Eight to twelve identical tubs.',
              text: ' Identical is the operative word: they stack, the lids interchange, and the fridge stays legible. Around 700ml suits one adult portion.',
            },
            {
              b: 'Digital scales.',
              text: ' Not for calorie counting &mdash; for splitting a pan into four equal portions. That is the difference between the plan working and Thursday coming up short.',
            },
            {
              b: 'A fridge thermometer.',
              text: ' The least expensive thing here by some distance, and the only one that tells you whether the 48-hour rule is actually holding in your kitchen.',
            },
          ],
        },
        {
          t: 'callout',
          k: 'Measure the shelf before you buy tubs',
          text:
            'The commonest mistake is a handsome set of containers that turns out to be two centimetres too tall to stack two deep in the fridge. That halves your usable space and quietly kills the habit in about three weeks.',
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
        'Aldi runs a short range and it rotates, so sooner or later something on the list will be missing. None of these swaps changes the shape of a week; they change what is in the pan.',
      blocks: [
        {
          t: 'table',
          head: ['If you cannot get', 'Use instead', 'What changes'],
          rows: [
            ['Lean beef mince', 'Turkey mince, or half mince and a tin of lentils', 'Turkey is leaner and drier, so keep the sauce wetter. Lentils drop the cost and raise the fibre.'],
            ['Chicken thigh fillets', 'Chicken breast, or bone-in thighs', 'Breast dries out on reheating, so cut it larger. Bone-in thighs need about ten minutes longer.'],
            ['Cod fillets', 'Any white fish, or salmon', 'Salmon is richer and needs two minutes less. Frozen is fine; defrost in the fridge overnight.'],
            ['Tinned chickpeas', 'Cannellini, butter or mixed beans', 'Softer and creamier. Add them a couple of minutes later.'],
            ['Red lentils', 'Yellow split lentils, or a tin of green lentils', 'Split lentils take longer; tinned green ones keep their shape and need only warming.'],
            ['Frozen spinach', 'Fresh spinach, or shredded cabbage', 'Fresh wilts to almost nothing, so use three times the weight. Cabbage needs a few minutes more.'],
            ['Wholemeal pasta', 'Any pasta shape, or rice', 'If you switch to rice, cook it fresh for the leftover lunch too.'],
            ['Greek yogurt', 'Natural yogurt, or skyr', 'Natural yogurt is looser and lower in protein. Skyr is thicker and higher.'],
            ['Mixed frozen berries', 'Any frozen fruit, or a chopped apple', 'Frozen fruit does not spoil mid-week, which is the main reason it is here.'],
            ['Hard cheese for grating', 'Cheddar', 'Cheddar melts more and browns faster. Use a little less.'],
          ],
        },
        {
          t: 'callout',
          k: 'The one swap to be careful with',
          text:
            'Swapping a pasta or couscous dinner for a rice one changes the leftover rules, not just the taste. Cooked rice keeps one day and reheats once; pasta and couscous are more forgiving. If you make that swap, eat the leftovers the next day without exception.',
        },
      ],
    },

    {
      id: 'waste',
      kicker: 'Reference',
      title: 'Using up what is left',
      tocSub: 'Part-packs, tired vegetables and the Sunday gap',
      lede:
        'Pack sizes and recipes do not agree with each other, and no amount of planning makes them. What follows is what to do with the difference.',
      blocks: [
        { t: 'h', text: 'The usual offenders' },
        {
          t: 'table',
          head: ['What is left over', 'Where it goes'],
          rows: [
            ['Half a tin of chopped tomatoes', 'Into the next tomato-based dinner, or frozen flat in a bag. It keeps three months and defrosts in minutes.'],
            ['Half a bag of spinach', 'Stirred into any curry, dhal or bolognese in the last two minutes.'],
            ['A heel of cheese', 'Grated over the frittata, the pasta bake or a jacket potato.'],
            ['Yogurt approaching its date', 'Into the daily extra, or as the cooling spoon on a curry.'],
            ['Bread going stale', 'Blitzed for the meatballs, or toasted for the bean stew. Stale bread is better in both than fresh.'],
            ['Softening carrots and onions', 'The base of the next rag&ugrave;, soup or stew. Softness is not a problem once they are cooked down.'],
            ['A pack of mince you will not get to', 'Freeze it on the day you buy it, not on the day it expires.'],
          ],
        },
        { t: 'h', text: 'The Sunday gap' },
        {
          t: 'p',
          text:
            'Sunday&rsquo;s dinner is cooked at half size, which means for one night the fridge is empty of leftovers. That is deliberate: it gives you a clean start on Monday and it stops a tub of something from the previous week quietly ageing past its 48 hours at the back of the shelf.',
        },
        {
          t: 'p',
          text:
            'If you would rather not cook at half size, cook the full four portions and freeze two. Label the bag with what it is and the date, and treat it as a bonus dinner in a later week &mdash; not as a lunch, because by then the week&rsquo;s lunches are already spoken for.',
        },
      ],
    },

    {
      id: 'trouble',
      kicker: 'Reference',
      title: 'When it stops working',
      tocSub: 'The seven ways a plan like this actually fails',
      lede:
        'Nobody abandons a meal plan because a recipe was bad. They abandon it for one of these, usually somewhere in week three.',
      blocks: [
        {
          t: 'numlist',
          items: [
            {
              b: 'You are bored by Wednesday.',
              text: ' Almost always a finishing problem rather than a recipe problem. Keep chilli sauce, lemons, yogurt and a bag of fresh herbs in the house and treat them as a kit. The same chicken tastes different under lemon and yogurt than it does under chilli sauce.',
            },
            {
              b: 'You ate the leftovers as a second dinner.',
              text: ' Then tomorrow&rsquo;s lunch is gone, and the day after tends to unravel too. If it happens, the Monday lunches in this book work on any day &mdash; a sandwich is a perfectly good patch.',
            },
            {
              b: 'Something went off before you got to it.',
              text: ' Either it went into the fridge warm, or the fridge is too warm, or it sat past 48 hours. Check the fridge temperature first; it is the one you cannot judge by eye.',
            },
            {
              b: 'Dinner took an hour, not thirty minutes.',
              text: ' Usually the chopping. Every timing in this book assumes you read the recipe through once before you start and get the oven on first.',
            },
            {
              b: 'You went off-plan on Tuesday and never came back.',
              text: ' Expected, and survivable. The weeks are independent of one another: start again on the next Monday, or just pick the week you liked most and repeat it.',
            },
            {
              b: 'The first shop cost more than you expected.',
              text: ' It will have. The cupboard list is bought once in week one and carries all six weeks; weeks two to six are the real cost of the plan.',
            },
            {
              b: 'You are hungry.',
              text: ' These plans are built around roughly 2,000 calories each a day. If you are tall, heavy, male, or on your feet all day, add a portion of carbohydrate to lunch and dinner &mdash; an extra 60g of dry rice or pasta each &mdash; before concluding the food is wrong.',
            },
          ],
        },
      ],
    },
  ],
};
