// Ninth batch (September 2026): the skills cluster.
//
// Every earlier batch answers "what should I buy", "what should I eat" or "why
// did this go wrong". These five answer "how do I do the thing at all" - read a
// label, portion without scales, cook for one, feed a household on different
// targets, change a meal without breaking the plan.
//
// They exist because the site was 80% programmatically generated plan pages
// when AdSense rejected it for low value content in September 2026. The fix is
// not more permutations of supermarket x goal; it is editorial pages that are
// about something, and that no generator could produce. Each of these is a
// distinct skill rather than a variation on an existing page.
//
// Deliberately not written: an "eating out on a meal plan" post, because
// weekly-calorie-deficit-meal-prep-uk already carries the weekly-average and
// weekend argument, and a second page on it would be the overlap that got six
// pages retired in August.

const PUBLISHED = '2026-09-05';

const planLinks = [
  {
    parts: [
      { text: 'Every plan on the site states its own calories, protein and cost - browse them in the ' },
      { label: 'plan library', to: '/browse' },
      { text: ', or use the ' },
      { label: 'quiz', to: '/quiz' },
      { text: ' to get matched to one.' },
    ],
  },
];

function guide(data) {
  return {
    published: PUBLISHED,
    modified: PUBLISHED,
    reviewed: '5 September 2026',
    contextualLinks: planLinks,
    ...data,
  };
}

export const practicalGuidesData = {
  'how-to-read-food-labels-uk': guide({
    title: 'How to Read a UK Food Label: Per 100g, %RI and Claims',
    description:
      'How to read UK food labels for meal prep: per 100g versus per portion, what %RI actually means, traffic lights, and the legal thresholds behind protein and low-fat claims.',
    h1: 'How to Read a UK Food Label',
    intro:
      'Almost everything people get wrong about food labels comes from one thing: the number on the front was chosen by the manufacturer, and the number on the back was not. Learning to ignore the first and read the second takes about ten minutes and makes every plan on this site easier to follow.',
    quickAnswer: {
      answer:
        'Read the per 100g column, not the per portion one - the portion size is decided by the manufacturer and is often smaller than anyone eats. Use per 100g to compare two products, then work out what your actual portion contains.',
      links: [
        { label: 'See how to build a calorie deficit', to: '/blog/how-to-build-a-calorie-deficit' },
        { label: 'Portion without scales', to: '/blog/portion-sizes-without-scales-uk' },
      ],
    },
    sections: [
      {
        h2: 'Per 100g is the only honest column',
        paragraphs: [
          'UK packaging must carry a back-of-pack table giving energy, fat, saturates, carbohydrate, sugars, protein and salt per 100g or 100ml. That standardisation is the whole point: it is the only way to compare two products directly, because it does not depend on anyone agreeing what a portion is.',
          'The per-portion column beside it is optional and the portion is the manufacturer\'s choice. A "portion" of cereal is frequently 30g, which is a modest bowl by anyone\'s standards; crisps and biscuits are often quoted per half a bag or per two biscuits. None of that is dishonest, but it means two products can look similar per portion and differ substantially per 100g.',
          'The practical habit: compare on per 100g, then multiply by what you will actually eat. If that sounds laborious, it is the calorie-dense foods where it matters - oils, cheese, nuts, granola, sauces - and barely worth doing for vegetables.',
        ],
      },
      {
        h2: 'What %RI actually refers to',
        paragraphs: [
          'The percentages on the front of a pack are Reference Intakes, and they are calculated against a notional average adult on 2,000 kcal a day with fixed values for fat, saturates, sugars and salt. They are a labelling convention, not a recommendation for you.',
          'So a product showing 25% RI for energy is telling you it contains 500 kcal, and nothing about whether that is a lot for your day. If you are eating 1,500 kcal it is a third of it; at 3,000 it is a sixth. Read the gram and calorie figures and let the percentage go.',
          'Traffic light colours are voluntary in the UK and are usually assigned per 100g, which is why a food eaten in small amounts can show red for fat and still be irrelevant to your week - olive oil being the obvious case.',
        ],
      },
      {
        h2: 'The claims on the front are legally defined',
        paragraphs: [
          'This is the useful part almost nobody knows: nutrition claims in the UK are not marketing language, they are regulated thresholds. "Source of protein" means at least 12% of the food\'s energy comes from protein. "High in protein" means at least 20%. That is a proportion of energy, not an absolute amount, which is why a food can be "high protein" and still contain very little protein per serving if the serving is small.',
          '"Low fat" means 3g or less per 100g for a solid food, and 1.5g per 100ml for a liquid. "Fat-free" means no more than 0.5g per 100g. "Low sugars" is 5g or less per 100g; "sugar-free" is 0.5g or less. "Source of fibre" is 3g per 100g and "high fibre" is 6g.',
          '"No added sugar" is the one to read carefully, because it means exactly what it says and nothing more: no sugars were added. A fruit juice or a dried fruit bar can carry it while containing a great deal of naturally occurring sugar. It is not a synonym for low sugar, and the two claims have entirely separate legal tests.',
        ],
      },
      {
        h2: 'Where labels matter for meal prep specifically',
        paragraphs: [
          'Two places. The first is the raw-versus-cooked question: pack figures for rice, pasta and pulses are almost always given for the dry product, and these roughly triple in weight once cooked. Weighing 100g of cooked rice against a 100g dry label is a difference of several hundred calories, and it is the most common reason a carefully followed plan does not add up.',
          'The second is meat, where the label figure is usually raw and cooking removes water. A 500g pack of chicken breast does not produce 500g of cooked chicken, so if a plan gives cooked weights and you weigh raw - or the reverse - the numbers drift. Pick one and stay with it; the plans on this site state which they mean.',
        ],
      },
    ],
    related: [
      { slug: 'how-to-build-a-calorie-deficit', label: 'How to Build a Calorie Deficit', type: 'blog' },
      { slug: 'portion-sizes-without-scales-uk', label: 'Portion Sizes Without Scales', type: 'blog' },
      { slug: 'how-much-protein-when-dieting', label: 'How Much Protein When Dieting', type: 'blog' },
      { slug: 'meal-prep-equipment-uk', label: 'Meal Prep Equipment UK', type: 'blog' },
    ],
    faq: [
      {
        q: 'Should I use the per 100g or per portion column?',
        a: 'Per 100g. It is the standardised figure and the only way to compare two products, because portion sizes are chosen by the manufacturer and are often smaller than anyone actually eats.',
      },
      {
        q: 'What does %RI mean on UK food packaging?',
        a: 'Reference Intake - the percentage of a notional 2,000 kcal adult diet. It is a labelling convention rather than advice for you, so read the calorie and gram figures instead.',
      },
      {
        q: 'What does "high in protein" legally mean?',
        a: 'That at least 20% of the food\'s energy comes from protein. "Source of protein" is 12%. Both are proportions of energy, so a small serving of a "high protein" food can still contain little protein.',
      },
      {
        q: 'Is "no added sugar" the same as low sugar?',
        a: 'No. It only means no sugars were added, so a product can carry it while being high in naturally occurring sugar. "Low sugars" is a separate claim meaning 5g or less per 100g.',
      },
    ],
  }),

  'portion-sizes-without-scales-uk': guide({
    title: 'Portion Sizes Without Scales: UK Hand Guide That Works',
    description:
      'How to judge portion sizes without scales using hand measures, which foods actually need weighing, and how accurate the hand method really is for UK meal prep.',
    h1: 'Portion Sizes Without Scales',
    intro:
      'Scales are more accurate and hands are always with you, which is why the hand method survives despite being approximate. Used on the right foods it is close enough to be genuinely useful; used on the wrong ones it is where a plan quietly falls apart.',
    quickAnswer: {
      answer:
        'A palm of protein, a fist of vegetables, a cupped hand of carbohydrate and a thumb of fat is a reasonable meal. The method works well for protein and vegetables and poorly for oils, nuts and cheese - weigh those, because that is where the error is expensive.',
      links: [
        { label: 'Read the food label guide', to: '/blog/how-to-read-food-labels-uk' },
        { label: 'Build a calorie deficit', to: '/blog/how-to-build-a-calorie-deficit' },
      ],
    },
    sections: [
      {
        h2: 'The hand measures, and what they roughly equal',
        paragraphs: [
          'A palm - the flat of your hand without fingers, about the depth of a deck of cards - is roughly a portion of cooked meat or fish, somewhere around 100 to 120g for most adults. A cupped hand is roughly a portion of cooked rice, pasta or potato. A fist is a portion of vegetables, and you can have several. A thumb is a portion of fat: oil, butter, nut butter, cheese.',
          'The reason this works at all is that hand size scales loosely with body size, so a larger person gets larger portions without doing any arithmetic. That is also its main limitation - it scales with frame rather than with your actual energy needs, which are set by far more than size.',
        ],
      },
      {
        h2: 'Where it is accurate enough, and where it is not',
        paragraphs: [
          'It is fine for protein and vegetables. Being 20g out on a chicken breast is about 30 kcal, and being 50g out on broccoli is about 17. Neither will change a week.',
          'It falls apart on energy-dense food. A thumb of olive oil is a rough guide to something that runs about 120 kcal per tablespoon, and a generous pour is easily three of those before anyone notices. Nuts, cheese, granola, nut butter and dressings carry the same problem: small differences in volume are large differences in calories.',
          'So the honest recommendation is a hybrid rather than a choice. Weigh the dense things, which takes seconds because they are small, and use hands for everything else. That is most of the accuracy of full weighing for a fraction of the effort, and it is the version people actually keep doing.',
        ],
      },
      {
        h2: 'Other things that work without a scale',
        paragraphs: [
          'Use the packet as a unit. A 500g pack of mince divided into four is 125g portions and needs no measurement at all - just a decision made once. Tins are already portioned. A standard mug holds roughly 75 to 90g of dry rice, which is enough consistency to plan around if you always use the same mug.',
          'Plate geometry is the other reliable trick: half the plate vegetables, a quarter protein, a quarter starch. It is not precise and it does not need to be, because it fixes the proportion that most affects fullness rather than trying to control the calorie total directly.',
        ],
      },
      {
        h2: 'When you should use scales anyway',
        paragraphs: [
          'For a few weeks at the start, if you are new to any of this. The value is not the precision itself - it is calibration. Weighing your usual portions for a fortnight recalibrates your eye permanently, and after that the hand method is far more accurate than it would have been without the exercise.',
          'Also when something is not working. If the plan says 1,600 kcal and the weight has not moved in a month, the fastest way to find the gap is a week of actually weighing the dense items rather than adjusting the target.',
        ],
      },
    ],
    related: [
      { slug: 'how-to-read-food-labels-uk', label: 'How to Read a UK Food Label', type: 'blog' },
      { slug: 'how-to-build-a-calorie-deficit', label: 'How to Build a Calorie Deficit', type: 'blog' },
      { slug: 'meal-prep-equipment-uk', label: 'Meal Prep Equipment UK', type: 'blog' },
      { slug: 'weight-loss-meal-prep-mistakes-uk', label: 'Weight Loss Meal Prep Mistakes', type: 'blog' },
    ],
    faq: [
      {
        q: 'How accurate is the hand portion method?',
        a: 'Good enough for protein and vegetables, where being 20 to 50g out changes almost nothing. Poor for oils, nuts, cheese and granola, where small volume differences are large calorie differences - weigh those.',
      },
      {
        q: 'How much rice is one portion without scales?',
        a: 'A cupped hand of cooked rice, or roughly a level mug of dry rice divided between two people. Using the same mug every time matters more than knowing the exact gram figure.',
      },
      {
        q: 'Do I need to weigh food to lose weight?',
        a: 'No, but weighing for a couple of weeks calibrates your judgement in a way that lasts. After that, weighing only the calorie-dense items gets you most of the accuracy for very little effort.',
      },
    ],
  }),

  'meal-prep-for-one-person-uk': guide({
    title: 'Meal Prep for One Person UK: Cooking Without Waste',
    description:
      'Meal prep for one in a UK kitchen: dealing with pack sizes built for four, freezing single portions, avoiding waste, and stopping a solo week becoming repetitive.',
    h1: 'Meal Prep for One Person',
    intro:
      'Cooking for one is not cooking for four with smaller numbers. The recipes assume a household, the packs are sized for a household, and the maths does not divide - which is why the single biggest cost of eating alone is not the food you buy but the food you throw away.',
    quickAnswer: {
      answer:
        'Cook in batches of three or four portions and freeze what you will not eat within two days. Buy loose produce and smaller packs where you can, and accept that the freezer, not the fridge, is what makes cooking for one work.',
      links: [
        { label: 'See plans for one', to: '/browse' },
        { label: 'Batch cooking for beginners', to: '/blog/batch-cooking-for-beginners-uk' },
      ],
    },
    sections: [
      {
        h2: 'The packs are the problem, not the cooking',
        paragraphs: [
          'A pack of chicken thighs is four portions. A bag of spinach wilts in five days. A loaf is twelve slices and you eat four. Nothing in a standard supermarket is sized for one person, and the result is a recurring choice between eating more than you meant to and putting food in the bin.',
          'Three things genuinely help. Buy loose produce where the store offers it, which is the single most useful habit and why Morrisons and market stalls suit solo cooking better than their pricing suggests. Use frozen vegetables as the default rather than the backup, because they cannot spoil while you decide. And treat the smaller pack sizes at M&S or the Co-op as a legitimate purchase rather than a rip-off when the alternative is throwing a third of a larger pack away.',
        ],
      },
      {
        h2: 'The freezer is the whole strategy',
        paragraphs: [
          'For a household, the freezer is storage. For one person it is the mechanism that makes batch cooking possible at all, because cooking a single portion is inefficient and cooking four and eating them across four consecutive days is grim and, after two days, no longer within food safety guidance for most leftovers.',
          'So cook three or four portions, eat one, refrigerate one, and freeze the rest flat in single portions. Flat matters: it freezes faster, stacks in a small freezer and thaws in a fraction of the time. Label with the date and what it is, because a solo freezer accumulates unidentifiable blocks faster than a family one - nobody else is going to ask what they are.',
        ],
      },
      {
        h2: 'Repetition hits harder when you eat alone',
        paragraphs: [
          'In a household, the same meal gets a reaction and a conversation. Alone, the fourth identical container is just the fourth identical container, and the boredom arrives sooner than the calendar suggests it should.',
          'The fix is a rotating freezer rather than a bigger cook. Once you have four or five different meals frozen in single portions, a week can be genuinely varied without cooking more than once - you are eating from a back catalogue rather than from Sunday. That takes a few weeks to build and then it stays built, which is the closest thing to a reliable system this site can recommend for cooking alone.',
        ],
      },
      {
        h2: 'What not to bother with',
        paragraphs: [
          'Halving recipes. It rarely works cleanly, it wastes the part of the pack you did not use, and it removes the only real advantage you have, which is that cooking four portions takes barely longer than cooking one.',
          'And do not aim to prep every meal. Breakfast for one is usually assembly rather than cooking, and forcing it into the batch system adds effort for no benefit. Prep the meals that would otherwise be bought or skipped - which for most people living alone is lunch, and dinner on the days that run late.',
        ],
      },
    ],
    related: [
      { slug: 'meal-prep-for-two-people-uk', label: 'Meal Prep for Two People UK', type: 'blog' },
      { slug: 'batch-cooking-for-beginners-uk', label: 'Batch Cooking for Beginners UK', type: 'blog' },
      { slug: 'how-to-store-meal-prep-safely-uk', label: 'How to Store Meal Prep Safely UK', type: 'blog' },
      { slug: 'freezer-labels-for-meal-prep-uk', label: 'Freezer Labels for Meal Prep', type: 'blog' },
    ],
    faq: [
      {
        q: 'How do I meal prep for one without wasting food?',
        a: 'Cook three or four portions and freeze what you will not eat within two days, rather than halving recipes. Buy loose produce and use frozen vegetables as the default so nothing spoils while you decide.',
      },
      {
        q: 'Is it cheaper to cook for one or buy ready meals?',
        a: 'Cooking is cheaper per portion, but only if the food gets eaten. Once waste is counted, a solo cook who bins a third of every pack can end up level - which is why the freezer matters more than the shopping list here.',
      },
      {
        q: 'How many days of meals should I prep living alone?',
        a: 'Two or three in the fridge and the rest frozen. Most cooked leftovers are only good for about two days refrigerated, so a five-day fridge plan is not a safe one.',
      },
    ],
  }),

  'household-different-calorie-needs-uk': guide({
    title: 'Feeding a Household on Different Calorie Needs UK',
    description:
      'How to cook one meal for a household where people need different calories: scaling portions rather than cooking twice, what to scale first, and where it should not apply.',
    h1: 'One Meal, Different Calorie Needs',
    intro:
      'A household rarely needs the same amount of food. Someone is cutting, someone trains five times a week, someone is thirteen and growing. The instinct is to cook separately, which doubles the work and usually collapses within a fortnight - and it is almost never necessary.',
    quickAnswer: {
      answer:
        'Cook one base and vary the portions rather than the recipe. Serve the protein and vegetables to everyone, then scale the starch and the added fat, which is where most of the calorie difference lives.',
      links: [
        { label: 'Browse plans by calorie target', to: '/browse' },
        { label: 'Meal prep for two people', to: '/blog/meal-prep-for-two-people-uk' },
      ],
    },
    sections: [
      {
        h2: 'Scale the plate, not the menu',
        paragraphs: [
          'The same chilli can be 450 kcal or 800 depending on the rice, the cheese and the sour cream, and none of that requires a second pan. Serve the shared part - the protein and the vegetables - in similar amounts to everyone, then let the starch and the toppings do the scaling. That single habit covers most of the range a normal household contains.',
          'It also avoids the thing that makes separate cooking fail socially, which is that one person visibly eats a different, sadder meal. Everyone eating the same food in different quantities is a much easier arrangement to sustain than everyone eating different food.',
        ],
      },
      {
        h2: 'What to scale first, and what to leave alone',
        paragraphs: [
          'Scale carbohydrate and added fat first: rice, pasta, potatoes, oil, cheese, dressings. They carry the calories, they are added at the end, and adjusting them changes the total substantially without changing what the meal is.',
          'Leave protein and vegetables roughly level. Protein is what keeps the person in a deficit full and the person training recovered, so cutting it is exactly the wrong lever - and the person eating less overall generally needs a higher proportion of protein, not a lower one. Vegetables are close to free in calorie terms and there is nothing to gain from rationing them.',
        ],
      },
      {
        h2: 'Where this should not apply',
        paragraphs: [
          'Children should not be put on a calorie-controlled plan as a side effect of an adult\'s. Growth needs energy, and portion restriction aimed at an adult goal is not appropriate for a child - if there is a genuine concern about a child\'s weight, that is a conversation with a GP or health visitor rather than something to solve by serving smaller plates.',
          'The same caution applies to anyone pregnant, breastfeeding, recovering from illness, or eating under clinical supervision. In those cases the household plan should be built around their requirements and everyone else should scale up from it, which is the reverse of the usual direction.',
        ],
      },
      {
        h2: 'Making it practical mid-week',
        paragraphs: [
          'Cook the base and store the components separately where you can - sauce in one container, rice in another. Assembly at the point of eating makes scaling trivial and reheating better, because rice and sauce want different treatment anyway.',
          'If you are prepping in advance rather than serving at a table, portion into labelled containers on the day you cook and write the target on the lid. Deciding portions once, while you are already thinking about it, works considerably better than deciding again every evening.',
        ],
      },
    ],
    related: [
      { slug: 'meal-prep-for-two-people-uk', label: 'Meal Prep for Two People UK', type: 'blog' },
      { slug: 'family-meal-prep-on-a-budget-uk', label: 'Family Meal Prep on a Budget', type: 'blog' },
      { slug: 'family-high-protein-dinners-uk', label: 'Family High Protein Dinners UK', type: 'blog' },
      { slug: 'portion-sizes-without-scales-uk', label: 'Portion Sizes Without Scales', type: 'blog' },
    ],
    faq: [
      {
        q: 'How do I cook one meal for different calorie needs?',
        a: 'Keep the protein and vegetables similar for everyone and scale the starch and added fat. Rice, pasta, potatoes, oil and cheese carry most of the difference and are added at the end.',
      },
      {
        q: 'Should children eat smaller portions if a parent is dieting?',
        a: 'No. Children need energy to grow and should not be put on a calorie-controlled plan as a side effect of an adult goal. Speak to a GP or health visitor if you have a genuine concern.',
      },
      {
        q: 'Should the person eating less get less protein?',
        a: 'No - usually the opposite. Protein is what makes a smaller intake tolerable, so the person in a deficit generally wants a higher proportion of it. Scale the carbohydrate and fat instead.',
      },
    ],
  }),

  'how-to-scale-a-recipe-uk': guide({
    title: 'How to Scale a Recipe for Batch Cooking (Without Ruining It)',
    description:
      'How to double or triple a recipe for batch cooking: what scales linearly, what does not, why a doubled pan steams instead of browns, and how cooking times change.',
    h1: 'How to Scale a Recipe for Batch Cooking',
    intro:
      'Doubling a recipe is the first thing anyone does when they start batch cooking, and it is the first thing that goes wrong. Most of a recipe scales cleanly. A few parts do not, and those few are the difference between four good portions and four mediocre ones.',
    quickAnswer: {
      answer:
        'Scale the main ingredients and liquid straight up. Hold back on strong spices, chilli and garlic - start at about three quarters and adjust at the end. Do not double the quantity in the same pan: crowding steams food instead of browning it, which is the most common reason a scaled-up batch tastes flat.',
      links: [
        { label: 'Batch cooking for beginners', to: '/blog/batch-cooking-for-beginners-uk' },
        { label: 'Portion without scales', to: '/blog/portion-sizes-without-scales-uk' },
      ],
    },
    sections: [
      {
        h2: 'What scales cleanly, and what does not',
        paragraphs: [
          'Proteins, vegetables, grains, tinned goods and most liquid scale straight up. Double them and the dish is the same dish. Salt scales too, but taste at the end rather than trusting the arithmetic, because a larger volume needs proportionally slightly less to taste the same.',
          'The things to hold back are the assertive ones: chilli, strong spices, garlic, and anything smoked or fermented. Start at roughly three quarters of the scaled amount and add at the end if it needs it. You can always add heat; removing it means cooking more of everything else.',
          'Fresh herbs and acid - lemon, vinegar, yoghurt - go in at the end regardless of scale, because both fade with cooking time, and a doubled batch cooks for longer.',
        ],
      },
      {
        h2: 'The pan is the real constraint',
        paragraphs: [
          'This is the mistake that spoils more scaled-up batches than any seasoning error. Browning needs the surface of the food to reach a temperature where water has boiled off. Double the mince in the same pan and the water cannot escape fast enough, so the food sits in its own liquid and steams grey rather than browning.',
          'The fix is space, not heat. Brown in two or three batches and combine, or move to a genuinely larger pan. Turning the heat up on a crowded pan burns the bottom while the middle still steams.',
          'The same logic applies to a roasting tray. Vegetables on a crowded tray go soft rather than caramelising, so a doubled tray bake wants two trays, and ideally two shelves with a swap halfway.',
        ],
      },
      {
        h2: 'Time does not double, but it does change',
        paragraphs: [
          'A doubled stew does not need twice as long, but it does need longer than the original - mostly because a larger volume takes longer to come up to temperature, not because it cooks more slowly once there. Judge by the food rather than the clock, and start checking around the original time.',
          'Reduction is the exception that catches people out. A sauce thickens by evaporating from its surface, and doubling the volume in the same pan barely changes the surface area, so a doubled sauce can take far longer than twice as long to reduce. Either accept a looser sauce, use a wider pan, or reduce a portion of the liquid separately.',
          'Baking is the one to be careful with. Cakes and anything set by eggs do not scale reliably, because depth changes how heat reaches the centre. Two tins of the original size beat one large one.',
        ],
      },
      {
        h2: 'Scale for the portions you actually want',
        paragraphs: [
          'Recipes are written for four because that is a household, not because four is a useful number for prep. Work backwards from what you need: five lunches, or three dinners plus two frozen. Then scale to that rather than to a tidy multiple, and weigh the protein into portions before cooking so the finished batch divides evenly.',
          'It is also worth scaling less than you think at first. A tripled recipe you have never made before is three times the risk, and a batch nobody enjoys is worse than a small one that ran out.',
        ],
      },
    ],
    related: [
      { slug: 'batch-cooking-for-beginners-uk', label: 'Batch Cooking for Beginners UK', type: 'blog' },
      { slug: 'portion-sizes-without-scales-uk', label: 'Portion Sizes Without Scales', type: 'blog' },
      { slug: 'which-recipes-survive-meal-prep-uk', label: 'Which Recipes Survive Meal Prep', type: 'blog' },
      { slug: 'meal-prep-equipment-uk', label: 'Meal Prep Equipment UK', type: 'blog' },
    ],
    faq: [
      {
        q: 'Do I double the spices when I double a recipe?',
        a: 'Not straight away. Salt scales roughly linearly but taste at the end; chilli, strong spices and garlic are better started at about three quarters of the scaled amount and adjusted before serving. Adding heat is easy, removing it is not.',
      },
      {
        q: 'Why does my doubled recipe taste flat?',
        a: 'Usually pan crowding rather than seasoning. Twice the food in the same pan steams instead of browning, and browning is where most of the flavour comes from. Cook in batches or use a bigger pan.',
      },
      {
        q: 'Does a doubled recipe take twice as long to cook?',
        a: 'No - it mainly takes longer to reach temperature. Start checking at the original time. The exception is reducing a sauce, which can take much more than twice as long because the surface area barely changes.',
      },
    ],
  }),

  'how-to-defrost-meal-prep-safely-uk': guide({
    title: 'How to Defrost Meal Prep Safely (and Quickly)',
    description:
      'How to defrost frozen meal prep safely: fridge, cold water and microwave methods, why the worktop is not one of them, and when to cook straight from frozen.',
    h1: 'How to Defrost Meal Prep Safely',
    intro:
      'Freezing is the part of meal prep everyone gets right. Defrosting is the part almost nobody thinks about, and it is where the food safety actually lives - because a portion left on the worktop spends hours at exactly the temperature bacteria like most.',
    quickAnswer: {
      answer:
        'The fridge overnight is the best method and needs no attention. If you have forgotten, use cold water in a sealed bag, changing the water every half hour, or the microwave - but food defrosted either of those ways has to be cooked straight away. Do not defrost on the worktop.',
      links: [
        { label: 'Store meal prep safely', to: '/blog/how-to-store-meal-prep-safely-uk' },
        { label: 'Freezer labels that stay on', to: '/blog/freezer-labels-for-meal-prep-uk' },
      ],
    },
    sections: [
      {
        h2: 'Why the worktop is the one to avoid',
        paragraphs: [
          'A frozen portion thaws from the outside in. Left at room temperature, the outer layer reaches a temperature where bacteria multiply well before the middle has thawed at all, and it then stays there for hours. The inside being cold is not protecting the outside.',
          'This is the reason Food Standards Agency guidance points at the fridge. It is slower precisely because the whole portion stays cold throughout, which is the point rather than an inconvenience.',
        ],
      },
      {
        h2: 'The three methods that work',
        paragraphs: [
          'In the fridge is the default. A single portion is usually thawed overnight; a large block of stew or a whole joint can take a day or more, so this needs planning rather than remembering at six in the evening. Put it on a plate or in a tub, because thawing food releases liquid.',
          'In cold water is the fast method. Keep the food in a sealed, watertight bag, submerge it, and change the water every thirty minutes so it does not warm up. A portion thaws in an hour or so. Food thawed this way must be cooked immediately, because parts of it will have warmed.',
          'In the microwave is the fastest and the least even. Use the defrost setting, stop before it starts cooking at the edges, and cook it straight away for the same reason. Never defrost in the microwave and then leave it sitting.',
        ],
      },
      {
        h2: 'When to skip defrosting entirely',
        paragraphs: [
          'A lot of prepped food goes straight from freezer to heat, and this is usually the better option. Soups, stews, chilli, curry and bolognese all reheat from frozen in a pan or the microwave with a splash of liquid and regular stirring. Frozen vegetables should never be defrosted first - they go straight in.',
          'The rule is the same as reheating anything else: it has to be piping hot the whole way through, not just at the edges. Frozen food heats unevenly, so stir partway and check the middle rather than the surface.',
        ],
      },
      {
        h2: 'Refreezing, and what is actually allowed',
        paragraphs: [
          'Raw food that has been thawed should not be refrozen raw. But you can cook it and freeze the cooked dish - that is a different food, and it is how a large pack of mince becomes portions of chilli in the freezer.',
          'Food that has been cooked, frozen, thawed and reheated has reached the end of the line. Do not put it back. In practice this rarely matters if you freeze in single portions in the first place, which is the habit that makes all of this easier.',
        ],
      },
    ],
    related: [
      { slug: 'how-to-store-meal-prep-safely-uk', label: 'How to Store Meal Prep Safely UK', type: 'blog' },
      { slug: 'freezer-labels-for-meal-prep-uk', label: 'Freezer Labels for Meal Prep', type: 'blog' },
      { slug: 'batch-cooking-for-beginners-uk', label: 'Batch Cooking for Beginners UK', type: 'blog' },
      { slug: 'meal-prep-for-one-person-uk', label: 'Meal Prep for One Person', type: 'blog' },
    ],
    faq: [
      {
        q: 'Can I defrost meal prep on the worktop?',
        a: 'No. The outside reaches a temperature bacteria multiply at long before the middle thaws, and then stays there for hours. Use the fridge, or cold water in a sealed bag if you need it faster.',
      },
      {
        q: 'How long does a frozen portion take to defrost in the fridge?',
        a: 'A single portion is usually ready overnight. Larger blocks and whole joints can take a day or more, so plan it rather than hoping.',
      },
      {
        q: 'Can I refreeze food after defrosting it?',
        a: 'Not raw food thawed raw. You can cook thawed raw food and freeze the cooked dish. Anything already cooked, frozen, thawed and reheated should not go back in the freezer.',
      },
      {
        q: 'Can I reheat meal prep straight from frozen?',
        a: 'Usually yes, and often it is better. Wet dishes like stew, chilli and curry reheat well from frozen with a splash of liquid and regular stirring. Check the middle is piping hot rather than the edges.',
      },
    ],
  }),

  'which-recipes-survive-meal-prep-uk': guide({
    title: 'Which Recipes Survive Meal Prep (and Which Never Will)',
    description:
      'How to tell before you cook whether a recipe will still be good on day three: what reheats well, what goes soggy, and the one question that predicts most of it.',
    h1: 'Which Recipes Survive Meal Prep',
    intro:
      'Most disappointing meal prep is not badly cooked. It is a good recipe that was never going to survive three days in a fridge, chosen before anyone asked whether it would. Working that out in advance takes about ten seconds once you know what to look for.',
    quickAnswer: {
      answer:
        'Wet, braised dishes survive best and often improve - stew, chilli, curry, dhal, bolognese. Anything meant to be crisp does not survive at all. The quickest test: would you happily eat it cold? If yes, it will almost certainly reheat well too.',
      links: [
        { label: 'Batch cooking for beginners', to: '/blog/batch-cooking-for-beginners-uk' },
        { label: 'Swap meals without breaking the plan', to: '/blog/how-to-swap-meals-in-a-meal-plan-uk' },
      ],
    },
    sections: [
      {
        h2: 'The four categories, best to worst',
        paragraphs: [
          'Wet and braised is the top tier. Stews, chillies, curries, dhals, ragus and soups sit in their own sauce, which protects them from drying and lets the flavours settle. Several are genuinely better on day two, which is the only free lunch in meal prep.',
          'Grain and pulse bowls come next, provided they are assembled cold. Rice, couscous, lentils and roasted vegetables keep well separately; it is dressing them three days early that ruins them.',
          'Roasted food is the acceptable middle. It reheats safely and tastes fine, but it will not be crisp again, so choose it knowing that. A tray bake on day three is a good soft dinner, not the dinner you cooked.',
          'Fried, battered and breaded food does not survive, and no technique fixes it. The coating exists to be crisp and it will not be. Cook that fresh or choose something else.',
        ],
      },
      {
        h2: 'The specific things that go wrong',
        paragraphs: [
          'Starch keeps absorbing. Pasta, noodles and rice continue to soften in a sauce, so a pasta dish sauced on Sunday is noticeably softer by Wednesday. Store the sauce and the starch separately if you care about texture.',
          'Dairy splits. Cream and creme fraiche can separate when reheated, and yoghurt almost always does. Add them at serving rather than cooking them into a dish destined for the fridge.',
          'Leaves and anything crisp collapse on contact with dressing or steam. Keep salad components dry and separate, and dress at the last moment.',
          'Fish is a judgement call. Oily fish like salmon holds up well because the fat protects it; firm white fish is fine cold and unpleasant reheated; prawns are already cooked and turn rubbery if heated again.',
        ],
      },
      {
        h2: 'The test that predicts most of it',
        paragraphs: [
          'Ask whether you would eat the dish cold and be happy. Almost everything that passes that test also reheats well, because both depend on the same thing - the dish does not rely on a texture that only exists in the minutes after cooking.',
          'The second question is whether the recipe has a sauce. A sauce is insurance: it keeps protein from drying, it carries flavour that would otherwise fade, and it makes reheating forgiving. A dry dish has no margin, so it needs to be right.',
        ],
      },
      {
        h2: 'Adapting a recipe that nearly works',
        paragraphs: [
          'Most borderline recipes can be rescued by splitting them. Cook the component that keeps, store the component that does not separately, and combine at eating. A crisp-topped bake becomes the filling plus a topping added at reheat; a salad becomes a base plus dressing in a small pot.',
          'The other adjustment is to undercook slightly what will be reheated. Vegetables in particular get a second cooking when the dish is reheated, so pulling them a little early on the first pass is the difference between fine and mushy on Thursday.',
        ],
      },
    ],
    related: [
      { slug: 'batch-cooking-for-beginners-uk', label: 'Batch Cooking for Beginners UK', type: 'blog' },
      { slug: 'how-to-swap-meals-in-a-meal-plan-uk', label: 'How to Swap Meals in a Plan', type: 'blog' },
      { slug: 'how-to-scale-a-recipe-uk', label: 'How to Scale a Recipe for Batch Cooking', type: 'blog' },
      { slug: 'meal-prep-watery-or-soggy-uk', label: 'Why Meal Prep Goes Watery or Soggy', type: 'blog' },
    ],
    faq: [
      {
        q: 'How do I know if a recipe will work for meal prep?',
        a: 'Ask whether you would happily eat it cold. Almost everything that passes also reheats well, because both depend on the dish not relying on a texture that exists only just after cooking.',
      },
      {
        q: 'What food should I never meal prep?',
        a: 'Anything fried, battered or breaded, and anything whose point is crispness. The coating will be soft and no reheating method changes that.',
      },
      {
        q: 'Why does my pasta go soft by midweek?',
        a: 'Because starch keeps absorbing sauce in the fridge. Store the sauce and the pasta separately and combine when you eat, and cook the pasta a little short on the first pass.',
      },
    ],
  }),

  'reduce-food-waste-meal-prep-uk': guide({
    title: 'How to Cut Food Waste When You Meal Prep',
    description:
      'Where meal prep food waste actually comes from, how to shop so fresh food gets used first, and what use-by and best-before dates really mean.',
    h1: 'How to Cut Food Waste When You Meal Prep',
    intro:
      'Meal prep is supposed to reduce waste, and often does the opposite at first - because a plan makes you buy for seven days when you realistically cook for four. The food that gets thrown away is rarely the food you forgot. It is the food you bought on purpose for a day that never happened.',
    quickAnswer: {
      answer:
        'Buy fresh for the first three or four days and frozen or cupboard for the rest, freeze portions on day two rather than day four, and learn the difference between use-by and best-before. Those three habits remove most of it.',
      links: [
        { label: 'Shopping list template', to: '/blog/meal-prep-shopping-list-template-uk' },
        { label: 'Store meal prep safely', to: '/blog/how-to-store-meal-prep-safely-uk' },
      ],
    },
    sections: [
      {
        h2: 'Where it actually goes',
        paragraphs: [
          'Three places, in order. Fresh produce bought for the back half of the week, which spoils before you reach it. Portions cooked on Sunday that were still fine on Tuesday and are not by Friday. And the part-used pack - half a bag of spinach, two thirds of a tub of creme fraiche - bought because the recipe needed a small amount of something sold in a large amount.',
          'Almost none of it is forgetfulness, which is why reminders do not fix it. It is a mismatch between how food is sold and how one household eats.',
        ],
      },
      {
        h2: 'Shop for the shape of the week, not the length of it',
        paragraphs: [
          'Fresh salad, berries, fish and prepared vegetables realistically hold three or four days. Buying seven days of them guarantees the last two are a gamble. Plan fresh food for the front of the week and frozen or cupboard food for the back, and the same single shop covers seven days without anything sitting too long.',
          'Frozen vegetables are the single most effective change here, because they cannot spoil while you decide. Used as the default rather than the fallback they remove the entire category of produce thrown away half used.',
        ],
      },
      {
        h2: 'Freeze early, not late',
        paragraphs: [
          'The instinct is to freeze what is left when it is about to turn. By then the food has already lost most of its life and you are freezing something you will enjoy less. Freeze on the day you cook, or the day after, while it is still what you meant to eat.',
          'That also means portioning at the point of cooking rather than eating from a big container until it looks doubtful. Cook four, eat one, refrigerate one, freeze two - decided once, on Sunday, rather than negotiated every evening.',
        ],
      },
      {
        h2: 'Use-by and best-before are not the same thing',
        paragraphs: [
          'Use-by is about safety. Do not eat food after its use-by date even if it looks and smells fine, and do not rely on your judgement instead - this is the date on meat, fish, dairy and prepared foods. Freezing before the use-by date pauses it, which is what makes the freezer useful here.',
          'Best-before is about quality. Food past it is generally still safe and often perfectly good - dried pasta, tinned goods, biscuits and most cupboard staples are the usual cases. Judging those by sight, smell and taste is exactly what the date allows.',
          'Confusing the two costs money in both directions: throwing away good cupboard food, and trusting your nose on something where the date was a safety instruction.',
        ],
      },
    ],
    related: [
      { slug: 'meal-prep-shopping-list-template-uk', label: 'Meal Prep Shopping List Template', type: 'blog' },
      { slug: 'how-to-store-meal-prep-safely-uk', label: 'How to Store Meal Prep Safely UK', type: 'blog' },
      { slug: 'meal-prep-for-one-person-uk', label: 'Meal Prep for One Person', type: 'blog' },
      { slug: 'how-to-defrost-meal-prep-safely-uk', label: 'How to Defrost Meal Prep Safely', type: 'blog' },
    ],
    faq: [
      {
        q: 'What is the difference between use-by and best-before?',
        a: 'Use-by is a safety date - do not eat food after it, even if it seems fine. Best-before is a quality date, and food past it is usually still safe. Use-by appears on meat, fish, dairy and prepared foods; best-before on cupboard staples.',
      },
      {
        q: 'How do I stop throwing away fresh food?',
        a: 'Plan fresh ingredients for the first three or four days and frozen or cupboard ones for the rest. One shop still covers the week, but nothing fresh has to survive until Friday.',
      },
      {
        q: 'When should I freeze leftovers?',
        a: 'On the day you cook or the day after, while the food is still what you meant to eat. Freezing something that was about to be thrown away just moves the problem into the freezer.',
      },
    ],
  }),

  'how-to-swap-meals-in-a-meal-plan-uk': guide({
    title: 'How to Swap Meals in a Meal Plan Without Breaking It',
    description:
      'How to substitute meals and ingredients in a UK meal plan: what to match, what actually changes the calories, and when a swap breaks the week rather than saving it.',
    h1: 'How to Swap Meals Without Breaking the Plan',
    intro:
      'No plan survives a week untouched. Something is out of stock, something turns out to be unappealing, and something gets eaten on the wrong day. Swapping well is a skill, and the difference between a plan that bends and one that gets abandoned is usually knowing which part of a meal is load-bearing.',
    quickAnswer: {
      answer:
        'Match the protein first and keep it roughly the same weight - that is the part holding the plan together. Carbohydrate swaps are usually free if the cooked weight is similar, and fats are where a careless swap costs the most calories.',
      links: [
        { label: 'Browse plans you can edit', to: '/browse' },
        { label: 'How to read a food label', to: '/blog/how-to-read-food-labels-uk' },
      ],
    },
    sections: [
      {
        h2: 'The protein is the load-bearing part',
        paragraphs: [
          'Swap chicken for turkey, white fish for another white fish, or beef mince for turkey mince and the plan barely notices - the calories move a little, the protein stays, and everything the meal was doing still happens. Those are free swaps and you should make them without hesitation when a shelf is empty.',
          'Swapping a protein for a carbohydrate is not a swap, it is a different meal. Replacing the chicken in a rice bowl with more rice keeps the calories roughly level and removes the reason the meal kept you full until the evening, which is the failure people then blame on the plan rather than the substitution.',
        ],
      },
      {
        h2: 'What actually moves the numbers',
        paragraphs: [
          'Cooking fat and sauces, by a distance. A meal cooked in a tablespoon of oil rather than a spray is about 120 kcal different, and a creamy sauce instead of a tomato one can be more. If you change nothing else in a week, changing how much fat goes in the pan is the swap that shows up on the scales.',
          'Starches are more forgiving than people expect, as long as you match cooked weight to cooked weight. Rice, pasta, couscous and potato land in a similar range per cooked gram, so the swap is close to neutral - the trap is comparing a dry weight to a cooked one, which triples the figure.',
          'Vegetables are effectively free. Swap them for whatever is in the fridge, in whatever quantity, and stop thinking about it.',
        ],
      },
      {
        h2: 'Swap within the shopping list where you can',
        paragraphs: [
          'The best swap uses something you have already bought. If Thursday\'s meal is unappealing and Tuesday\'s was good, cook Tuesday\'s again - the ingredients are in, nothing is wasted and the week still works. Repeating a meal you like is a better outcome than following a plan you have stopped enjoying.',
          'Buying a new ingredient to rescue one meal is usually the expensive answer, because it introduces a part-used pack and the waste that follows. Save that for when the alternative is not eating.',
        ],
      },
      {
        h2: 'When a swap means the plan is wrong',
        paragraphs: [
          'If you are swapping three or four meals a week, the plan is not fitting you and no amount of substitution will fix that. That is a signal to change the plan rather than keep patching it - usually to a different prep style, a different calorie target, or a plan built around foods you actually reach for.',
          'The same applies if every swap is in the same direction. Consistently replacing the fish, or always adding more carbohydrate, is information about what you will genuinely eat, and it is worth acting on rather than resisting week after week.',
        ],
      },
    ],
    related: [
      { slug: 'how-to-read-food-labels-uk', label: 'How to Read a UK Food Label', type: 'blog' },
      { slug: 'weight-loss-meal-prep-mistakes-uk', label: 'Weight Loss Meal Prep Mistakes', type: 'blog' },
      { slug: 'portion-sizes-without-scales-uk', label: 'Portion Sizes Without Scales', type: 'blog' },
      { slug: 'batch-cooking-for-beginners-uk', label: 'Batch Cooking for Beginners UK', type: 'blog' },
    ],
    faq: [
      {
        q: 'Can I swap meals in a meal plan?',
        a: 'Yes - match the protein first and keep it about the same weight, since that is the part doing the work. Vegetable swaps are free and starch swaps are close to neutral if you match cooked weight to cooked weight.',
      },
      {
        q: 'What swap changes the calories most?',
        a: 'Cooking fat and sauces. A tablespoon of oil instead of a spray is around 120 kcal, and a creamy sauce in place of a tomato one can be more than that.',
      },
      {
        q: 'What if I want to swap most of the meals?',
        a: 'Then the plan is not the right one. Swapping three or four meals a week is a sign to change plan rather than keep patching it - and the direction of your swaps tells you what to change to.',
      },
    ],
  }),
};
