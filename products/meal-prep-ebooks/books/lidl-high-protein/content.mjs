// Lidl High-Protein - the written matter.
//
// Retailer facts are limited to what lidl.co.uk documents and what
// src/data/supermarketProfiles.js records (checked 2026-08-16): Milbona as the
// own-brand dairy label with a notably broad high-protein line, a dedicated
// high-protein category online, Deluxe as the premium own-label tier, and Lidl
// Plus as the loyalty scheme. No specific product is claimed to be in stock and
// no coupon is promised.

export const content = {
  planLabel: 'High-protein &middot; Six weeks',
  coverNote:
    'One dinner a night, half an hour, and tomorrow&rsquo;s lunch out of the same pan &mdash; averaging about 145g of protein each a day, without counting a thing.',
  facts: [
    { k: 'Feeds', v: '2 adults' },
    { k: 'Protein', v: 'About 145g each' },
    { k: 'Each day', v: 'About 2,000 kcal' },
    { k: 'Dinners', v: '15&ndash;35 min' },
  ],
  notAffiliated:
    'MealPrep.org.uk is not affiliated with, endorsed by, or connected to Lidl Great Britain Limited. Product ranges, packaging, availability and any loyalty offers are the retailer&rsquo;s and change without notice.',
  tocLede:
    'Six weeks of higher-protein dinners for two adults, the shopping list that buys them, and the twenty-four recipes behind them. The weeks come first; the recipes sit together in one chapter because most come round more than once.',
  shopLede:
    'Generated from the week&rsquo;s meals rather than written by hand, so a breakfast eaten five times is bought five times. Quantities are what the plan needs; buy the nearest pack size up.',
  recipesLede:
    'Thirty recipes: two breakfasts, one daily extra, three Monday lunches and twenty-four dinners. Every figure is calculated from the weighed ingredients, and the protein percentage on each card is worked out from those numbers rather than claimed.',
  recipesTocSub: 'All thirty, with calculated protein and a swap for each',
  fridgeLede:
    'The whole plan on one page. Print it, put it on the fridge, and the book can stay shut until you want a method.',
  blankLede:
    'Week seven onwards is yours. Keep the shape: a dairy-led breakfast that needs no pan, the repeated extra, one assembled lunch on Monday, and six dinners that each feed the next day.',

  sections: [
    {
      id: 'how',
      kicker: 'Start here',
      title: 'How the plan works',
      tocSub: 'Five rules, and what high protein means here',
      lede:
        'Written for <b>two adults</b> eating roughly 2,000 calories each a day, averaging about 145g of protein each (a day-to-day range of 114&ndash;164g across the six weeks). One dinner a night, most of them well inside half an hour, and tomorrow&rsquo;s lunch comes out of the same pan.',
      blocks: [
        { t: 'h', text: 'The five rules' },
        {
          t: 'numlist',
          items: [
            { b: 'Dinner takes thirty-five minutes at the outside, and half of them take thirty or less.', text: ' Total elapsed time from a cold kitchen. One dinner in this book takes fifteen minutes and involves no heat at all beyond a toaster.' },
            { b: 'Every dinner but Sunday&rsquo;s makes four portions.', text: ' Two eaten, two boxed while the pan is still dirty. That is the only preparation asked of you.' },
            { b: 'Dairy does the heavy lifting.', text: ' The breakfast and the daily extra carry about 50g of protein between them before you cook anything. That is why these dinners still look like meals.' },
            { b: 'Monday&rsquo;s lunch is assembled, not cooked.', text: ' Sunday&rsquo;s dinner is made at half size, so Monday gets a rye plate, a quinoa box or a loaded jacket potato.' },
            { b: 'One shop a week, generated from the meals.', text: ' Grouped the way a shop is laid out, with quantities already multiplied by how often you cook each thing.' },
          ],
        },
        { t: 'h', text: 'What "high protein" means here, precisely' },
        {
          t: 'p',
          text:
            'It means <b>at least 20% of the day&rsquo;s energy comes from protein</b> &mdash; the threshold MealPrep.org.uk applies before a plan may use the label. This plan averages close to <b>29%</b>, at roughly 145g per person per day. Both numbers are calculated from the weighed ingredients rather than asserted, and the daily figures are printed in the week planners so you can check them.',
        },
        {
          t: 'p',
          text:
            'That is a generous but unremarkable intake for two adults eating 2,000 calories a day. It is not a medical or sporting prescription, and more is not automatically better. If you have kidney disease or any condition affecting protein handling, talk to your GP rather than to a PDF. General healthy-eating guidance follows the <b>NHS Eatwell Guide</b>.',
        },
        { t: 'h', text: 'Where the numbers come from' },
        {
          t: 'p',
          text:
            'Every calorie and gram is calculated from the ingredient list through the same engine that powers MealPrep.org.uk, drawing on the UK Composition of Foods Integrated Dataset (CoFID 2021), with USDA FoodData Central or a representative UK label where CoFID has no suitable match. Carbohydrate figures are available carbohydrate, excluding fibre. They remain planning estimates: reformulation, natural variation, draining and portioning all move the real number.',
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
            'Fridge between 0&deg;C and 5&deg;C. Worth checking once with a cheap thermometer.',
            'Reheat until steaming hot throughout, and only once.',
          ],
        },
        {
          t: 'callout',
          k: 'There is no rice in this book',
          text:
            'That is deliberate. Cooked rice keeps one day and reheats once, which sits awkwardly with a plan built on next-day lunches. Quinoa, orzo, potatoes and rye do the starch work here instead, and all of them keep their 48 hours comfortably. Eggs are the other exception: poached and baked eggs do not reheat into anything worth eating, so those dishes keep their base and take fresh eggs the following day. <span class="tiny">Food Standards Agency guidance, food.gov.uk, checked 10 September 2026.</span>',
        },
      ],
    },

    {
      id: 'shopping-at-lidl',
      kicker: 'The shop',
      title: 'Buying protein well at Lidl',
      tocSub: 'The dairy aisle is the reason for this book',
      lede:
        'Of the two big discounters, Lidl is the one whose own-brand range covers high-protein dairy deliberately rather than incidentally. That single fact shapes this entire plan.',
      blocks: [
        { t: 'h', text: 'What is worth knowing' },
        {
          t: 'bullets',
          items: [
            '<b>Milbona is the own-brand dairy label, and its high-protein line is unusually broad for a discounter</b> &mdash; skyr, high-protein Greek-style yogurt, fat-free high-protein yogurt and a high-protein drink are all own-brand. Lidl groups them under a dedicated high-protein category online rather than scattering them through general dairy.',
            '<b>This is why the breakfast and the extra are built on dairy.</b> They contribute about 50g of protein a day between them at a cost that no meat could match, and they need no cooking at all.',
            '<b>Deluxe is the premium own-label tier.</b> Nothing here requires it.',
            '<b>Lidl Plus is a coupon scheme, not a plan.</b> Where it helps, it tends to help on meat and dairy. Nothing in these six weeks depends on a coupon, because no printed book can promise one.',
            '<b>Ranges rotate and stock varies by store.</b> No recipe names a specific product, and every one has a swap line beneath it.',
          ],
        },
        { t: 'h', text: 'The protein worth buying, and the protein worth skipping' },
        {
          t: 'p',
          text:
            'The best value in this book is dairy, eggs, tinned fish and pulses, which is why they appear as often as the meat does. Smoked mackerel deserves a particular mention: it is already cooked, already seasoned, needs no preparation and carries a great deal of protein for what it costs. Protein bars and powders are a convenience purchase rather than a value one, and this plan uses none.',
        },
        {
          t: 'p',
          text:
            'Two numbers stay separate on every list. <b>What the plan needs</b> is the printed quantity; <b>what you buy</b> is the nearest pack up, because nobody sells 450g of paneer. The surplus is not waste &mdash; use it and cross the line off.',
        },
        {
          t: 'callout',
          k: 'The cupboard list',
          text:
            'Week one buys the oil, spices, stock, soy, mustard and honey that carry all six weeks. It is why the first shop looks expensive and the next five do not.',
        },
      ],
    },

    {
      id: 'cost',
      kicker: 'Money',
      title: 'What this costs, honestly',
      tocSub: 'Why protein sits a tier higher, and how to bring it down',
      lede:
        'This plan sits in MealPrep.org.uk&rsquo;s <b>moderate tier</b>: roughly &pound;40&ndash;&pound;55 per person per week, so about <b>&pound;80&ndash;&pound;110 a week for two</b> across three meals a day and the daily extra.',
      blocks: [
        {
          t: 'p',
          text:
            'A tier above the budget plan in this series, for the simple reason that protein is the expensive part of a basket. Salmon, steak, prawns, paneer and smoked fish all appear here, and no amount of careful shopping makes them cost what lentils cost.',
        },
        { t: 'h', text: 'How to bring it down without losing the protein' },
        {
          t: 'table',
          head: ['Swap', 'Effect on protein', 'Effect on cost'],
          rows: [
            ['Tinned fish in place of fresh', 'Comparable', 'Lower, often substantially'],
            ['Chicken thighs in place of breast', 'Slightly lower per 100g', 'Usually lower, and better on reheating'],
            ['Frozen fish and prawns in place of fresh', 'The same', 'Lower, with less waste'],
            ['Cottage cheese or eggs in place of a meat dinner', 'Comparable', 'Lower'],
            ['Plain Greek yogurt in place of skyr', 'Roughly 8g lower per serving', 'Lower'],
            ['Pulses replacing a third of the meat', 'Slightly lower, more fibre', 'Lower'],
            ['Dropping the daily extra', 'About 20g a day lower', 'Lower, and the plan stops meeting its own protein figure'],
          ],
        },
        {
          t: 'p',
          text:
            'These are planning ranges, not basket quotations. They assume own-brand ingredients, exclude what is already in your cupboard, and cannot account for offers, coupons, pack sizes, regional variation or reformulation. <span class="tiny">Tier range reviewed 29 July 2026 against the MealPrep.org.uk cost model.</span>',
        },
        {
          t: 'callout',
          k: 'If the budget matters more than the protein',
          text:
            'The budget plan in this series will suit you better than a hollowed-out version of this one. This book is built around protein being the priority; remove that and it is simply a costlier way to eat.',
        },
      ],
    },

    {
      id: 'kit',
      kicker: 'Equipment',
      title: 'What you actually need',
      tocSub: 'Five things, and why the scales matter here',
      lede:
        'One large tray, one heavy pan, a saucepan and a set of tubs will cook everything in this book. The scales matter more here than in a budget plan.',
      blocks: [
        {
          t: 'numlist',
          items: [
            { b: 'Two large roasting trays.', text: ' Six of these dinners are tray dinners. A crowded tray steams, and steamed chicken goes pale and slightly grey rather than catching at the edges.' },
            { b: 'A heavy pan that holds its heat.', text: ' For the steak and the tofu, weight beats non-stick: a thin pan drops its temperature the moment food lands in it, and then the food boils in its own liquid.' },
            { b: 'Eight to twelve identical tubs.', text: ' Identical so they stack and the lids interchange. Around 700ml suits one adult portion.' },
            { b: 'Digital scales.', text: ' The protein figures depend on a portion genuinely being a quarter of the pan. Eyeballing four portions reliably produces three generous ones and a disappointing Thursday.' },
            { b: 'A fridge thermometer.', text: ' The least expensive item here and the only one that tells you whether the 48-hour rule is holding in your kitchen.' },
          ],
        },
        {
          t: 'callout',
          k: 'One thing you do not need',
          text:
            'A shaker. Nothing in these six weeks uses powder, and the daily figure is met from food. If you already use it, treat it as an addition rather than a substitute for the extra.',
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
        'Discounter ranges rotate and stock varies between stores. These swaps change what is in the pan without moving the day&rsquo;s protein much; where they do, the table says so.',
      blocks: [
        {
          t: 'table',
          head: ['If you cannot get', 'Use instead', 'Effect on the day'],
          rows: [
            ['Skyr', 'High-protein Greek-style yogurt, or quark', 'None with either. Plain Greek yogurt costs less and gives up roughly 8g a serving.'],
            ['High-protein yogurt pots', 'Skyr, or quark with honey', 'None. Any of the three does the same job in the extra.'],
            ['Cottage cheese', 'Ricotta, or quark', 'Ricotta is milder and a little lower in protein; quark is higher and sharper.'],
            ['Smoked mackerel', 'Tinned mackerel, or smoked salmon trimmings', 'Comparable protein, less smoke. Add more lemon.'],
            ['Smoked haddock', 'Any white fish plus a teaspoon of mustard in the sauce', 'Comparable. You lose the smoke, which is most of the character.'],
            ['King prawns', 'White fish in chunks, or chicken breast', 'Comparable protein; both need longer, so add them earlier.'],
            ['Paneer', 'Halloumi', 'Similar protein, much saltier. Season the dish less.'],
            ['Quinoa', 'Couscous, bulgur or orzo', 'Slightly lower protein. All keep two days, which is the point of avoiding rice.'],
            ['Lean sirloin', 'Beef strips, or pork loin', 'Comparable. Pork wants a minute longer a side.'],
            ['Firm tofu', 'Chicken breast or prawns', 'Higher protein and quicker; skip the pressing step.'],
            ['Miso paste', 'Soy sauce with a spoon of peanut butter', 'Negligible difference to the numbers; a slightly sweeter, rounder sauce.'],
          ],
        },
        {
          t: 'callout',
          k: 'The swap that quietly breaks the plan',
          text:
            'Dropping the daily extra. It is 20g of protein, it appears forty-two times, and losing it costs more than any single dinner swap in this table. If you dislike yogurt, replace it with two boiled eggs and a piece of fruit rather than removing it.',
        },
      ],
    },

    {
      id: 'waste',
      kicker: 'Reference',
      title: 'Using up what is left',
      tocSub: 'Part-packs, and what to freeze on the day',
      lede:
        'A higher-protein basket means more expensive things in the trolley, so the part-packs matter more than they would on a budget plan.',
      blocks: [
        {
          t: 'table',
          head: ['What is left over', 'Where it goes'],
          rows: [
            ['A part-tub of skyr or quark', 'Into a marinade for chicken, or thinned with lemon as a dressing for any of the trays.'],
            ['Half a block of paneer or halloumi', 'Cubed, browned, and added to the lentil bowl or the tray dinners.'],
            ['Cottage cheese near its date', 'Beaten with an egg and baked into the frittata, or spread under the weekend eggs.'],
            ['Smoked mackerel', 'Flaked into the p&acirc;t&eacute;, or onto a rye plate at lunchtime.'],
            ['A few raw prawns', 'Freeze them the day you buy them; they defrost in ten minutes in cold water.'],
            ['Cooked chicken', 'The Monday quinoa box, which does not mind where its chicken came from.'],
            ['Rye bread going stale', 'Croutons for the caesar bowl, or crumbs for the cod topping.'],
            ['Fresh spinach on the turn', 'Any of the stews, in the last two minutes.'],
          ],
        },
        { t: 'h', text: 'The Sunday gap' },
        {
          t: 'p',
          text:
            'Sunday&rsquo;s dinner is cooked at half size, so for one night the fridge holds no leftovers. That is deliberate: it clears the shelf before the new week&rsquo;s shop and stops a tub ageing quietly past its 48 hours at the back.',
        },
        {
          t: 'p',
          text:
            'If you would rather cook the full four portions, freeze two. Label the bag with the contents and the date, and treat it as a spare dinner in a later week rather than a lunch &mdash; the week&rsquo;s lunches are already accounted for.',
        },
      ],
    },

    {
      id: 'trouble',
      kicker: 'Reference',
      title: 'When it stops working',
      tocSub: 'Seven failures, and what each one really is',
      lede:
        'Plans like this rarely fail on a recipe. They fail for one of these, usually somewhere around week three.',
      blocks: [
        {
          t: 'numlist',
          items: [
            { b: 'You are full before you finish.', text: ' A high-protein day is more filling at the same calories, which is largely the point. If it is genuinely too much, halve the extra rather than skipping a meal &mdash; it is the only component you can halve without unbalancing the day.' },
            { b: 'You are tired of yogurt.', text: ' Understandable by week four. Swap the extra for two boiled eggs and fruit, or cottage cheese on rye. Do not simply delete it; it is 20g of protein a day.' },
            { b: 'The chicken was dry on the second day.', text: ' Breast rather than thigh, or reheated too hard. The marinated dinners are the ones that survive best, which is why the book opens with one.' },
            { b: 'You ate the leftovers as a second dinner.', text: ' Then tomorrow&rsquo;s lunch has gone. The three Monday lunches work on any day and are a reasonable patch.' },
            { b: 'The shop felt expensive.', text: ' It is a tier above the budget plan by design. The swap table above lists the seven changes that bring it down without losing the protein figure.' },
            { b: 'You are not sure the protein is doing anything.', text: ' Honestly: protein mostly buys satiety and helps preserve muscle when calories are controlled. It is not magic, and this plan will not do anything your overall diet and activity do not.' },
            { b: 'You went off-plan and never came back.', text: ' The weeks do not depend on one another. Start again on the next Monday, or repeat whichever week you liked best.' },
          ],
        },
      ],
    },
  ],
};
