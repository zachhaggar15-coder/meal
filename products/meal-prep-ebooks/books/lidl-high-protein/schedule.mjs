// Lidl High-Protein - the six-week matrix.
//
// Constraints on top of the shared structure: no two fish dinners on
// consecutive days, the two egg-led dinners a fortnight apart, and no rice at
// all in this book - quinoa, orzo, potatoes and rye do the starch work, which
// removes the one-day cooked-rice clock from the plan entirely.

const B = {
  weekdayBreakfast: 'skyr-berry-bowl',
  weekendBreakfast: 'weekend-eggs-haddock',
  extra: 'protein-pot-fruit',
};

export const weeks = [
  {
    n: 1, ...B,
    title: 'Dairy does the heavy lifting',
    tag: 'Week 1',
    tocSub: 'Seven new dinners, and the first shop',
    lede:
      'Breakfast and the daily extra settle about 50g of protein each before you cook anything, which is why these dinners still look like dinners rather than training food.',
    mondayLunch: 'quark-rye-plate',
    dinners: ['skyr-chicken-skewers', 'cod-herby-crumb', 'beef-mushroom-stroganoff', 'prawn-pea-orzo', 'turkey-ricotta-meatballs', 'salmon-quinoa-bowl', 'eggs-bacon-beans'],
    notes: [{
      t: 'card', shadow: true, h: 'Three things about this week',
      blocks: [{ t: 'bullets', items: [
        'Monday&rsquo;s marinade is the idea the whole book rests on: dairy on chicken before it roasts keeps it soft tonight and again tomorrow. It is worth noticing the difference on Tuesday.',
        'Cod out of the freezer on Monday night, salmon on Friday night. They are the only things here that want a day&rsquo;s notice.',
        'Sunday&rsquo;s baked eggs are cooked at half size and leave no lunch behind, which is why Monday&rsquo;s plate is assembled fresh in every week.',
      ] }],
    }],
  },
  {
    n: 2, ...B,
    title: 'Beans, pulses and a good steak',
    tag: 'Week 2',
    tocSub: 'Where protein comes from when it is not meat',
    lede:
      'Three of this week&rsquo;s dinners get most of their protein from pulses and dairy rather than meat, which is what keeps a high-protein plan from becoming an expensive one.',
    mondayLunch: 'chicken-quinoa-box',
    dinners: ['lamb-butterbean-stew', 'feta-lentil-pepper-bowl', 'peppered-steak-bean-mash', 'tuna-white-bean-pasta', 'paneer-pepper-tray', 'pork-apple-slaw', 'ham-pea-frittata'],
    notes: [{
      t: 'card', shadow: true, h: 'Three things about this week',
      blocks: [{ t: 'bullets', items: [
        'Wednesday swaps potato mash for white bean mash. It takes five minutes rather than twenty and carries roughly four times the protein.',
        'Dry the steak properly and get the pan hotter than feels sensible. Everything else about Wednesday is straightforward; that part is not negotiable.',
        'Sunday&rsquo;s frittata is cooked at half size &mdash; four or five eggs rather than nine.',
      ] }],
    }],
  },
  {
    n: 3, ...B,
    title: 'The last all-new week',
    tag: 'Week 3',
    tocSub: 'Smoked fish, tofu and a Friday with no cooking',
    lede:
      'By Sunday twenty-one of the twenty-four dinners will have been cooked once. Friday is the one to look forward to: a p&acirc;t&eacute; that needs nothing but a toaster.',
    mondayLunch: 'cottage-cheese-jackets',
    dinners: ['spiced-chicken-chickpea-tray', 'miso-tofu-broccoli', 'smoked-haddock-egg', 'beef-quinoa-chilli', 'mackerel-pate-rye', 'turkey-halloumi-burgers', 'chicken-leek-quinoa-broth'],
    notes: [{
      t: 'card', shadow: true, h: 'Three things about this week',
      blocks: [{ t: 'bullets', items: [
        'Press the tofu on Monday evening for Tuesday. Ten minutes under a plate decides whether it browns or steams.',
        'Wednesday&rsquo;s haddock poaches in milk, and that milk becomes the sauce. Do not pour it away.',
        'Friday involves no heat beyond the toaster, which is a reasonable thing to have waiting at the end of a week.',
      ] }],
    }],
  },
  {
    n: 4, ...B,
    title: 'Three new, four familiar',
    tag: 'Week 4',
    tocSub: 'The halfway point',
    lede:
      'The caesar bowl, the prawn bake and the halloumi tray are the last new things in the book. Everything else you have cooked before, and it will be quicker this time.',
    mondayLunch: 'quark-rye-plate',
    dinners: ['chicken-caesar-bowl', 'prawn-tomato-feta-bake', 'halloumi-lentil-tray', 'skyr-chicken-skewers', 'cod-herby-crumb', 'lamb-butterbean-stew', 'eggs-bacon-beans'],
    notes: [{
      t: 'card', shadow: true, h: 'Three things about this week',
      blocks: [{ t: 'bullets', items: [
        'Monday&rsquo;s caesar is the one dish that must be boxed in parts. Leaves under dressing overnight become soup; keep the chicken, eggs and croutons apart and build it in the morning.',
        'Tuesday&rsquo;s prawns go in for the last eight minutes only. They are done the moment they turn opaque.',
        'If a week is going to slip, let it be this one. Every dinner here appears somewhere else, so moving a night costs nothing.',
      ] }],
    }],
  },
  {
    n: 5, ...B,
    title: 'Second time round, and faster',
    tag: 'Week 5',
    tocSub: 'Every dinner a repeat',
    lede:
      'Nothing new at all: seven dinners you have each cooked once. In practice that is about ten minutes less standing over a pan across the week, and a shorter shop.',
    mondayLunch: 'chicken-quinoa-box',
    dinners: ['beef-quinoa-chilli', 'paneer-pepper-tray', 'salmon-quinoa-bowl', 'tuna-white-bean-pasta', 'beef-mushroom-stroganoff', 'spiced-chicken-chickpea-tray', 'ham-pea-frittata'],
    notes: [{
      t: 'card', shadow: true, h: 'Three things about this week',
      blocks: [{ t: 'bullets', items: [
        'Quinoa appears three times. Cook it in a big pan of salted water like pasta and drain it properly; the common complaint about quinoa is nearly always underseasoning and too much water.',
        'The two beef dinners sit three days apart. Freeze one pack on the day you buy it and move it to the fridge on Wednesday night.',
        'A good week to check the figures yourself: weigh one portion of Monday&rsquo;s chilli and compare it with the recipe card.',
      ] }],
    }],
  },
  {
    n: 6, ...B,
    title: 'The week that runs itself',
    tag: 'Week 6',
    tocSub: 'And what to do in week seven',
    lede:
      'The dinners that earned a second outing. After six weeks you will have firm opinions about which of these stay, and that is the real output of the exercise.',
    mondayLunch: 'cottage-cheese-jackets',
    dinners: ['turkey-ricotta-meatballs', 'miso-tofu-broccoli', 'peppered-steak-bean-mash', 'prawn-pea-orzo', 'feta-lentil-pepper-bowl', 'mackerel-pate-rye', 'chicken-leek-quinoa-broth'],
    notes: [{
      t: 'card', shadow: true, h: 'And then what?',
      blocks: [
        { t: 'p', text: 'The structure is what to keep: a dairy-led breakfast that needs no pan, a repeated extra worth 20g, one assembled lunch on Monday, and six dinners that each feed the next day.' },
        { t: 'bullets', items: [
          'To push the protein higher, add to the extra rather than the dinners. Another 100g of high-protein yogurt is roughly 10g of protein for 60 calories, which is the best trade available to you.',
          'To bring the cost down, lean on the pulse-and-dairy dinners: the bean mash, the lentil bowl and the tuna pasta all land above 28% of energy from protein without any meat worth the name.',
          'The blank planner at the back takes the same shape. Five dinners you liked is a perfectly good week.',
        ] },
      ],
    }],
  },
];
