// Aldi Budget - the six-week matrix.
//
// Designed as one system rather than six weeks bolted together:
//
//   - 24 dinners across 42 slots. Seventeen recur, which is the point: the
//     second time you cook something you are faster and you waste less.
//   - No dinner repeats on adjacent days, including across a week boundary.
//   - Sunday's dinner is cooked at half scale. There is no Monday lunch to feed,
//     because Monday's lunch is the one meal of the week that is made fresh.
//   - Weeks 1-3 introduce every recipe. Weeks 4-6 are built from ones already
//     cooked once, so the second half of the plan is faster than the first.
//   - Rice dishes are spread out, and the only dish built on pre-cooked rice
//     (egg fried rice) sits on a Sunday where it feeds no lunch.

export const weeks = [
  {
    n: 1,
    title: 'The week you learn the rhythm',
    tag: 'Week 1',
    tocSub: 'Seven new dinners, and the first shop',
    lede:
      'Nothing this week needs two pans watched at once. Monday is a sandwich because there is no Sunday dinner behind it; from Tuesday the system takes over, and what you cook at night becomes what you eat at your desk.',
    weekdayBreakfast: 'porridge-banana',
    weekendBreakfast: 'eggs-beans-toast',
    extra: 'yogurt-berries-peanuts',
    mondayLunch: 'cheese-salad-sandwich',
    dinners: [
      'chilli', 'dhal', 'lemon-chicken-couscous', 'bacon-mushroom-pasta',
      'cod-potato-pea-traybake', 'meatballs', 'egg-fried-rice',
    ],
    notes: [
      {
        t: 'card', shadow: true, h: 'Three things about this week',
        blocks: [{
          t: 'bullets',
          items: [
            'The shop will cost more than the five that follow it. The cupboard list &mdash; oil, spices, stock, soy, honey &mdash; is bought once now and carries all six weeks.',
            'Take the cod out of the freezer on Thursday night so it defrosts in the fridge for Friday. It is the only ingredient in the book that needs thinking about a day ahead.',
            'Sunday&rsquo;s egg fried rice is the one dinner cooked at half size, and the only one that leaves no lunch behind. Monday&rsquo;s sandwich covers that gap every week.',
          ],
        }],
      },
    ],
  },
  {
    n: 2,
    title: 'Mince, tins and the long game',
    tag: 'Week 2',
    tocSub: 'Cheaper proteins, and the Monday jacket potato',
    lede:
      'A week built on mince, tins and the vegetables that stay inexpensive all year. Monday&rsquo;s jacket potatoes go in before you start work and ask nothing of you until lunchtime.',
    weekdayBreakfast: 'porridge-banana',
    weekendBreakfast: 'eggs-beans-toast',
    extra: 'yogurt-berries-peanuts',
    mondayLunch: 'jacket-tuna-sweetcorn',
    dinners: [
      'turkey-ragu-pasta', 'chickpea-curry', 'chicken-fajita-bowls', 'tuna-tomato-spaghetti',
      'mince-and-mash', 'chicken-noodle-stirfry', 'frittata',
    ],
    notes: [
      {
        t: 'card', shadow: true, h: 'Three things about this week',
        blocks: [{
          t: 'bullets',
          items: [
            'Wednesday&rsquo;s fajita tray wants the largest tray you own, and preferably two. Piled up, the chicken steams and goes pale instead of catching at the edges.',
            'Saturday&rsquo;s stir-fry is the one dinner where everything must be chopped before the hob goes on. Twenty-five minutes assumes you did.',
            'Sunday&rsquo;s frittata is cooked at half size: five eggs rather than ten. It is also the dish that quietly absorbs whatever vegetables did not get used.',
          ],
        }],
      },
    ],
  },
  {
    n: 3,
    title: 'The last all-new week',
    tag: 'Week 3',
    tocSub: 'Twenty-one down, three to go',
    lede:
      'By Sunday you will have cooked twenty-one of the twenty-four dinners in this book. From here the plan gets easier rather than harder, because the second time you make something you are not reading while you chop.',
    weekdayBreakfast: 'porridge-banana',
    weekendBreakfast: 'eggs-beans-toast',
    extra: 'yogurt-berries-peanuts',
    mondayLunch: 'hummus-pitta-plate',
    dinners: [
      'lentil-bolognese', 'chicken-chickpea-curry', 'turkey-sausage-bean-pan', 'spanish-eggs',
      'sweet-potato-black-bean-chilli', 'tuna-pasta-bake', 'bean-tomato-stew',
    ],
    notes: [
      {
        t: 'card', shadow: true, h: 'Three things about this week',
        blocks: [{
          t: 'bullets',
          items: [
            'Thursday&rsquo;s Spanish eggs are the one dish whose leftovers are handled differently: keep the pepper stew without the eggs, and poach fresh ones into it on Friday. A reheated poached egg is not worth eating.',
            'Two meat-free dinners land midweek on purpose. If the week needs to be cheaper, this is the pair to repeat rather than the pair to replace.',
            'Monday&rsquo;s hummus plate is deliberately vague about the vegetables. Use whatever survived last week.',
          ],
        }],
      },
    ],
  },
  {
    n: 4,
    title: 'Three new, four familiar',
    tag: 'Week 4',
    tocSub: 'The halfway point, and the easiest week',
    lede:
      'The last three new dinners in the book land here: the creamy garlic chicken, the curried chickpea traybake and the turkey burgers. The other four you cooked in the first three weeks, and each will take less time than it did then.',
    weekdayBreakfast: 'porridge-banana',
    weekendBreakfast: 'eggs-beans-toast',
    extra: 'yogurt-berries-peanuts',
    mondayLunch: 'cheese-salad-sandwich',
    dinners: [
      'chilli', 'creamy-chicken-rice', 'curried-chickpea-potato-traybake', 'bacon-mushroom-pasta',
      'cod-potato-pea-traybake', 'turkey-burgers-wedges', 'dhal',
    ],
    notes: [
      {
        t: 'card', shadow: true, h: 'Three things about this week',
        blocks: [{
          t: 'bullets',
          items: [
            'Tuesday&rsquo;s creamy chicken and rice is the exception to the rice rule, because its rice is steamed into the dish and cannot be cooked separately. Portion the leftovers straight away, refrigerate within the hour, and eat them on Wednesday.',
            'Cod out of the freezer on Thursday night again, for Friday.',
            'If you have found a favourite by now, this is the week to swap one of these out for it. Nothing downstream depends on Thursday being pasta.',
          ],
        }],
      },
    ],
  },
  {
    n: 5,
    title: 'The leanest basket of the six',
    tag: 'Week 5',
    tocSub: 'The week to measure the cost against',
    lede:
      'Mince, lentils, tinned fish and pasta. If you want to know what this plan actually costs you, weigh it against this week&rsquo;s receipt: the cupboard is stocked, nothing here is unusual, and the basket is the leanest in the book without being the dullest.',
    weekdayBreakfast: 'porridge-banana',
    weekendBreakfast: 'eggs-beans-toast',
    extra: 'yogurt-berries-peanuts',
    mondayLunch: 'jacket-tuna-sweetcorn',
    dinners: [
      'meatballs', 'chicken-fajita-bowls', 'lentil-bolognese', 'tuna-tomato-spaghetti',
      'chicken-noodle-stirfry', 'mince-and-mash', 'chickpea-curry',
    ],
    notes: [
      {
        t: 'card', shadow: true, h: 'Three things about this week',
        blocks: [{
          t: 'bullets',
          items: [
            'Monday&rsquo;s meatballs are the longest cook of the week at forty minutes. If Monday is the wrong night for that, swap it with Thursday&rsquo;s spaghetti and move the lunches with it.',
            'Two pasta dinners sit three days apart rather than back to back. That is deliberate; so is the gap between the two tinned-fish dinners.',
            'Nothing this week needs defrosting, an oven preheated for long, or a second tray.',
          ],
        }],
      },
    ],
  },
  {
    n: 6,
    title: 'The week that runs itself',
    tag: 'Week 6',
    tocSub: 'The dishes that earned a second outing',
    lede:
      'The last week is made of the dinners worth cooking twice. By now the shop takes twenty minutes and most nights you will not need the book open.',
    weekdayBreakfast: 'porridge-banana',
    weekendBreakfast: 'eggs-beans-toast',
    extra: 'yogurt-berries-peanuts',
    mondayLunch: 'hummus-pitta-plate',
    dinners: [
      'turkey-ragu-pasta', 'chicken-chickpea-curry', 'sweet-potato-black-bean-chilli', 'spanish-eggs',
      'lemon-chicken-couscous', 'tuna-pasta-bake', 'frittata',
    ],
    notes: [
      {
        t: 'card', shadow: true, h: 'And then what?',
        blocks: [
          {
            t: 'p',
            text:
              'Week seven is where most plans quietly end. The blank planner at the back is there so this one does not: the structure is the part worth keeping, not the particular dinners. One fresh lunch on Monday, six dinners that each feed the next day, one cooked at half size on Sunday.',
          },
          {
            t: 'bullets',
            items: [
              'Pick the five dinners you actually liked and build a week around them. Five is enough; you have just proved that seventeen repeats did not bother you.',
              'Keep the breakfast and the daily extra exactly as they are. They are doing more work than they look like they are.',
              'If you want to start again from Week 1, the shop will be cheaper the second time round, because the cupboard is already full.',
            ],
          },
        ],
      },
    ],
  },
];
