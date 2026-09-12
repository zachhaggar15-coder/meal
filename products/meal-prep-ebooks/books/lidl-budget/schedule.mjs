// Lidl Budget - the six-week matrix.
//
// Half the dinners are meat-free, which is the largest single lever on a
// discounter bill. They are spread rather than clustered: no week reads as "the
// vegetarian week", and no two consecutive nights are both meat-free in the
// first three weeks, while the habit is still forming.
//
// The one dish built on pre-cooked rice sits on a Sunday, where it feeds no
// lunch and the rice is therefore never stored.

const B = {
  weekdayBreakfast: 'bakery-toast-eggs',
  weekendBreakfast: 'weekend-beans-toast',
  extra: 'apple-peanut-butter',
};

export const weeks = [
  {
    n: 1, ...B,
    title: 'The week you learn the rhythm',
    tag: 'Week 1',
    tocSub: 'Seven new dinners, and the first shop',
    lede:
      'Monday is a flatbread plate because there is no Sunday dinner behind it. From Tuesday the system takes over, and what you cook at night is what you eat at your desk the next day.',
    mondayLunch: 'hummus-falafel-flatbread',
    dinners: ['chana-potato-curry', 'sardine-tomato-spaghetti', 'quorn-cottage-pie', 'tofu-peanut-noodles', 'chicken-leek-potato-bake', 'white-bean-rosemary-stew', 'egg-potato-hash'],
    notes: [{
      t: 'card', shadow: true, h: 'Three things about this week',
      blocks: [{ t: 'bullets', items: [
        'This shop costs more than the five that follow. Oil, spices, stock, soy, mustard and peanut butter are bought once now and carry the whole six weeks.',
        'Press the tofu on Wednesday evening for Thursday. Ten minutes under a plate is the difference between tofu that browns and tofu that steams.',
        'Sunday&rsquo;s hash is cooked at half size and leaves no lunch behind, which is why Monday&rsquo;s lunch is made fresh in every week.',
      ] }],
    }],
  },
  {
    n: 2, ...B,
    title: 'Tins, bakery and one good fish',
    tag: 'Week 2',
    tocSub: 'The cheapest proteins in the shop',
    lede:
      'A week that leans on the tinned aisle and the bread counter. The cod on Wednesday is the one thing worth planning a day ahead for.',
    mondayLunch: 'cheese-pickle-doorstep',
    dinners: ['beef-bean-tacos', 'mushroom-orzo', 'cod-tomato-olive-couscous', 'chickpea-spinach-pasta', 'macaroni-cheese-peas', 'roast-veg-butterbean-tray', 'veg-fried-rice'],
    notes: [{
      t: 'card', shadow: true, h: 'Three things about this week',
      blocks: [{ t: 'bullets', items: [
        'Take the cod out of the freezer on Tuesday night so it defrosts in the fridge for Wednesday. Never on the worktop.',
        'Saturday&rsquo;s tray wants two trays, not one. Crowded vegetables steam and go grey rather than catching at the edges, and the difference is enormous.',
        'Thursday&rsquo;s pasta uses the trick this book returns to several times: crush half the pulses into the sauce and leave the rest whole.',
      ] }],
    }],
  },
  {
    n: 3, ...B,
    title: 'The last all-new week',
    tag: 'Week 3',
    tocSub: 'Twenty-one down, three to go',
    lede:
      'By Sunday you will have cooked twenty-one of the twenty-four dinners at least once. This week also has the dish most worth learning properly: the roasted cauliflower and chickpea tray.',
    mondayLunch: 'soup-and-bread',
    dinners: ['quorn-bolognese', 'pork-apple-mash', 'sweet-potato-lentil-curry', 'turkey-meatball-orzo', 'mackerel-potato-hash', 'cauliflower-chickpea-tray', 'greek-style-bean-bake'],
    notes: [{
      t: 'card', shadow: true, h: 'Three things about this week',
      blocks: [{ t: 'bullets', items: [
        'Monday&rsquo;s soup can be made on Sunday evening while something else is in the oven, which turns Monday lunch into a reheating job.',
        'Saturday&rsquo;s cauliflower needs a hot oven and room to breathe. Roasted hard until the edges blacken it is a different vegetable from boiled cauliflower.',
        'Tuesday&rsquo;s pork wants to come off the heat the moment it is done and rest. Loin goes from tender to dry quickly.',
      ] }],
    }],
  },
  {
    n: 4, ...B,
    title: 'Three new, four familiar',
    tag: 'Week 4',
    tocSub: 'The halfway point',
    lede:
      'The bean burgers, the mushroom and white bean pasta and the tagine are the last three new things in the book. Everything else this week you have already made once, and it will take less time than it did.',
    mondayLunch: 'hummus-falafel-flatbread',
    dinners: ['spiced-bean-burgers', 'mushroom-leek-cannellini-pasta', 'veg-chickpea-tagine', 'chana-potato-curry', 'chicken-leek-potato-bake', 'tofu-peanut-noodles', 'egg-potato-hash'],
    notes: [{
      t: 'card', shadow: true, h: 'Three things about this week',
      blocks: [{ t: 'bullets', items: [
        'Dry the beans properly before mashing them on Monday. Wet beans make a patty that falls apart in the pan, and there is no rescuing it once it has.',
        'Wednesday&rsquo;s tagine is the one dish here that genuinely improves overnight, so Thursday&rsquo;s lunch is the better meal of the two.',
        'Four meat-free dinners this week. If the budget is the point, this is the week to repeat.',
      ] }],
    }],
  },
  {
    n: 5, ...B,
    title: 'The leanest basket of the six',
    tag: 'Week 5',
    tocSub: 'The week to measure the cost against',
    lede:
      'Tins, pulses, mince and pasta, with the cupboard already stocked. If you want to know what this plan actually costs you, weigh it against this week&rsquo;s receipt rather than week one&rsquo;s.',
    mondayLunch: 'cheese-pickle-doorstep',
    dinners: ['quorn-cottage-pie', 'sardine-tomato-spaghetti', 'sweet-potato-lentil-curry', 'beef-bean-tacos', 'mushroom-orzo', 'white-bean-rosemary-stew', 'veg-fried-rice'],
    notes: [{
      t: 'card', shadow: true, h: 'Three things about this week',
      blocks: [{ t: 'bullets', items: [
        'Nothing this week needs defrosting, a second tray or a long oven.',
        'The sardines on Tuesday are the best value protein in the book by a distance. If you are still unsure about them, this is the recipe that usually settles it.',
        'Saturday&rsquo;s stew wants the bread toasted fresh and rubbed with raw garlic. It takes two minutes and it is most of the dish.',
      ] }],
    }],
  },
  {
    n: 6, ...B,
    title: 'The week that runs itself',
    tag: 'Week 6',
    tocSub: 'And what to do in week seven',
    lede:
      'Seven dinners that earned a second outing. By now the shop takes twenty minutes and most nights will not need the book open at all.',
    mondayLunch: 'soup-and-bread',
    dinners: ['turkey-meatball-orzo', 'cauliflower-chickpea-tray', 'macaroni-cheese-peas', 'chickpea-spinach-pasta', 'cod-tomato-olive-couscous', 'quorn-bolognese', 'greek-style-bean-bake'],
    notes: [{
      t: 'card', shadow: true, h: 'And then what?',
      blocks: [
        { t: 'p', text: 'The shape is the part worth keeping: one fresh lunch on Monday, six dinners that each feed the following day, one cooked at half size on Sunday, and a breakfast you never have to think about.' },
        { t: 'bullets', items: [
          'Pick the five dinners you actually liked. Five is plenty &mdash; you have just spent six weeks proving that repetition is not the problem people assume it is.',
          'If the bill mattered more than anything else, build the week from the meat-free dinners and add one meat night. That is roughly where the saving lives.',
          'Starting again from Week 1 is cheaper the second time, because the cupboard is already full.',
        ] },
      ],
    }],
  },
];
