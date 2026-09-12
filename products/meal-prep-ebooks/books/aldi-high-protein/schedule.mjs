// Aldi High-Protein - the six-week matrix.
//
// Same structural rules as the budget book, with three constraints on top:
// no two fish dinners on consecutive days, the egg-based dinners sit a week
// apart, and the one dish built on pre-cooked rice (prawn egg fried rice) lands
// on a Sunday where it feeds no lunch.
//
// The protein load is deliberately spread rather than stacked: the breakfast and
// the daily extra carry about 55g between them, so no dinner has to be a slab of
// chicken to make the day's figure work.

const B = {
  weekdayBreakfast: 'skyr-oats-seeds',
  weekendBreakfast: 'eggs-mushrooms-toast',
  extra: 'protein-yogurt-nuts',
};

export const weeks = [
  {
    n: 1, ...B,
    title: 'Where the protein actually comes from',
    tag: 'Week 1',
    tocSub: 'Seven new dinners, and the first shop',
    lede:
      'A week that spreads the load rather than stacking it. Breakfast and the daily extra do about a third of the work before you cook anything, which is why the dinners can still look like dinners.',
    mondayLunch: 'tuna-bean-salad-box',
    dinners: ['chicken-shawarma-tray', 'cod-bacon-butter-beans', 'lemon-chicken-orzo', 'turkey-chilli-yogurt', 'salmon-potato-tray', 'beef-lentil-ragu', 'prawn-egg-fried-rice'],
    notes: [{
      t: 'card', shadow: true, h: 'Three things about this week',
      blocks: [{ t: 'bullets', items: [
        'Make both breakfast tubs on Sunday night. The overnight oats keep three days, so one five-minute job covers Monday to Wednesday.',
        'Cod out of the freezer on Monday night for Tuesday, salmon on Thursday night for Friday. They are the only two ingredients in the book that want a day&rsquo;s notice.',
        'Sunday&rsquo;s prawn fried rice is cooked at half size and leaves no lunch behind. Monday&rsquo;s tuna and bean box covers that gap in every week.',
      ] }],
    }],
  },
  {
    n: 2, ...B,
    title: 'Dairy, eggs and the cheaper proteins',
    tag: 'Week 2',
    tocSub: 'Paneer, cottage cheese and a mackerel salad',
    lede:
      'Chicken is not the only way to hit a protein figure, and it is rarely the most interesting. This week leans on paneer, cottage cheese, eggs and smoked mackerel instead.',
    mondayLunch: 'chicken-hummus-wrap',
    dinners: ['paneer-chickpea-curry', 'beef-black-bean-stirfry', 'cottage-cheese-pasta-bake', 'chicken-tikka-raita', 'mackerel-beetroot-potato', 'turkey-courgette-burgers', 'baked-eggs-beans-feta'],
    notes: [{
      t: 'card', shadow: true, h: 'Three things about this week',
      blocks: [{ t: 'bullets', items: [
        'Wednesday&rsquo;s pasta bake uses cottage cheese where a white sauce would normally go. Beaten with eggs it sets into something close to ricotta, and it is one of the least expensive ways to add 25g of protein to a dish.',
        'Friday&rsquo;s mackerel salad needs no cooking beyond the potatoes, which makes it the right dinner for the end of a long week.',
        'Sunday&rsquo;s baked eggs are cooked at half size. Keep the bean stew for Monday if there is any left and poach fresh eggs into it &mdash; a reheated baked egg is not worth the plate.',
      ] }],
    }],
  },
  {
    n: 3, ...B,
    title: 'The last all-new week',
    tag: 'Week 3',
    tocSub: 'Steak, pork, tofu and a very plain plate',
    lede:
      'By Sunday twenty-one of the twenty-four dinners will have been cooked once. This week has the widest spread of the six: beef, pork, salmon, tofu, halloumi and a bacon-and-egg plate that is deliberately unfashionable.',
    mondayLunch: 'cottage-cheese-jacket',
    dinners: ['chicken-lentil-spinach-curry', 'steak-pepper-rice', 'salmon-broccoli-pasta', 'tofu-edamame-noodles', 'pork-mustard-mash', 'halloumi-veg-tray', 'gammon-egg-potatoes'],
    notes: [{
      t: 'card', shadow: true, h: 'Three things about this week',
      blocks: [{ t: 'bullets', items: [
        'Tuesday&rsquo;s steak is the one dinner where the pan temperature decides everything. Get it hotter than feels sensible, cook in two batches, and dry the meat first.',
        'Press the tofu on Wednesday evening for Thursday if you remember. Ten minutes under a plate is the difference between browning and steaming.',
        'Friday&rsquo;s pork wants to come off the heat while it still has a faint blush, then rest. Tenderloin goes from tender to dry in about ninety seconds.',
      ] }],
    }],
  },
  {
    n: 4, ...B,
    title: 'The familiar half begins',
    tag: 'Week 4',
    tocSub: 'Three new, four you have cooked before',
    lede:
      'Three new dinners and four returning ones. From here the plan is mostly recall rather than reading, and the shop gets faster because you know what the packs look like.',
    mondayLunch: 'tuna-bean-salad-box',
    dinners: ['chicken-fajita-black-bean', 'prawn-tomato-linguine', 'lamb-kofta-yogurt', 'cod-bacon-butter-beans', 'turkey-chilli-yogurt', 'chicken-shawarma-tray', 'prawn-egg-fried-rice'],
    notes: [{
      t: 'card', shadow: true, h: 'Three things about this week',
      blocks: [{ t: 'bullets', items: [
        'Prawns appear twice, on Tuesday and again on Sunday. Buy them once, frozen, and take out what you need &mdash; a bag in the freezer is the more forgiving way to buy them.',
        'Wednesday&rsquo;s kofta is grilled rather than fried, which means no pan to wash and no oil. The yogurt with garlic and lemon stirred through it is the sauce, not a garnish.',
        'If a week is going to slip, let it be this one: every dinner here also appears somewhere else, so nothing is lost by moving a night.',
      ] }],
    }],
  },
  {
    n: 5, ...B,
    title: 'Second time round, and faster',
    tag: 'Week 5',
    tocSub: 'Every dinner a repeat',
    lede:
      'Nothing new at all. Seven dinners you have each cooked once already, which in practice means about ten minutes less standing over a pan across the week.',
    mondayLunch: 'chicken-hummus-wrap',
    dinners: ['beef-lentil-ragu', 'chicken-tikka-raita', 'salmon-potato-tray', 'beef-black-bean-stirfry', 'lemon-chicken-orzo', 'paneer-chickpea-curry', 'baked-eggs-beans-feta'],
    notes: [{
      t: 'card', shadow: true, h: 'Three things about this week',
      blocks: [{ t: 'bullets', items: [
        'Tuesday&rsquo;s tikka marinade works harder the longer it sits. Mix the chicken into the yogurt and paste in the morning if you can; if you cannot, ten minutes still helps.',
        'The two beef dinners sit three days apart. If you buy the mince and the strips in the same shop, freeze the strips on the day and move them to the fridge on Wednesday night.',
        'This is a good week to check your own numbers: weigh one portion of the rag&ugrave; and compare it against the figure on the recipe card.',
      ] }],
    }],
  },
  {
    n: 6, ...B,
    title: 'The week that runs itself',
    tag: 'Week 6',
    tocSub: 'And what to do in week seven',
    lede:
      'The dinners that earned a second outing. By now you will have opinions about which of these are worth keeping, and that is the actual output of six weeks.',
    mondayLunch: 'cottage-cheese-jacket',
    dinners: ['chicken-lentil-spinach-curry', 'mackerel-beetroot-potato', 'cottage-cheese-pasta-bake', 'steak-pepper-rice', 'salmon-broccoli-pasta', 'lamb-kofta-yogurt', 'halloumi-veg-tray'],
    notes: [{
      t: 'card', shadow: true, h: 'And then what?',
      blocks: [
        { t: 'p', text: 'The structure is the part worth keeping, not the particular dinners: a high-protein breakfast made the night before, a repeated extra that quietly adds 20g, one fresh lunch on Monday and six dinners that each feed the following day.' },
        { t: 'bullets', items: [
          'If you want the protein higher still, the lever is the extra rather than the dinners. Another 100g of the yogurt adds roughly 10g of protein and 80 calories, which is the least expensive trade in the book.',
          'If you want it lower, cut the dinners&rsquo; meat by about a fifth and add a tin of beans. The daily figure moves less than you would expect.',
          'The blank planner at the back takes the same shape. Five dinners you actually liked is a perfectly good week.',
        ] },
      ],
    }],
  },
];
