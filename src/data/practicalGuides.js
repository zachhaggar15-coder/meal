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

  'how-long-does-cooked-chicken-last-uk': guide({
    title: 'How Long Does Cooked Chicken Last in the Fridge?',
    description:
      'How long cooked chicken and other cooked meat keeps in the fridge and freezer, why smell is the wrong test, and how quickly it needs to be cooled.',
    h1: 'How Long Does Cooked Meat Last?',
    intro:
      'The honest answer is shorter than most meal preppers assume, and the reason people get it wrong is that cooked meat gives almost no warning. Food that has been sitting too long usually looks and smells exactly like food that has not.',
    quickAnswer: {
      answer:
        'Around two days in the fridge for cooked chicken and most cooked leftovers, under NHS and Food Standards Agency guidance. It needs to be cooled and refrigerated within two hours of cooking. Anything you will not eat inside those two days should go in the freezer on the day you cook it.',
      links: [
        { label: 'Store meal prep safely', to: '/blog/how-to-store-meal-prep-safely-uk' },
        { label: 'Defrost meal prep safely', to: '/blog/how-to-defrost-meal-prep-safely-uk' },
      ],
    },
    sections: [
      {
        h2: 'Two days, and the clock starts at cooking',
        paragraphs: [
          'For cooked chicken, mince, fish and most prepared dishes, the working figure is two days in the fridge. That is not two days from when it went in - it is two days from cooking, which matters if a batch sat on the hob cooling for an evening.',
          'Cooling is the part people skip. Get cooked food into the fridge within two hours, and speed that up by splitting a big batch into shallow portions rather than leaving a full pot to cool from the outside in. A large volume can sit warm in the middle for hours, which is exactly the condition the two-hour rule exists to prevent.',
          'The fridge itself should be at 5C or below. A lot of home fridges run warmer than their dial suggests, and a cheap fridge thermometer settles it in a way that guessing does not.',
        ],
      },
      {
        h2: 'Why smell is the wrong test',
        paragraphs: [
          'Spoilage bacteria are what make food smell bad. The bacteria that make people ill are largely different organisms, and they do not announce themselves - food carrying enough of them to cause a problem can look, smell and taste completely normal.',
          'So "it seems fine" is not evidence about cooked leftovers. Use the date you cooked it, which is the argument for labelling containers with the day rather than trusting recall on Thursday about what happened on Sunday.',
          'Obvious spoilage - sliminess, a sour smell, any visible mould - means throw it out. But the absence of those signs is not permission.',
        ],
      },
      {
        h2: 'The freezer changes the arithmetic',
        paragraphs: [
          'At minus 18C, food stays safe more or less indefinitely. What degrades is quality, and for cooked dishes that happens over months rather than days - around three months is a reasonable working limit before texture and flavour noticeably suffer.',
          'The mistake is treating the freezer as the place food goes when it is nearly finished. Freeze on the day you cook, while it is still what you meant to eat. A portion frozen on day three has already spent most of its fridge life and comes out worse than one frozen on day one.',
          'This is why cooking four portions and immediately deciding their fate - one now, one for tomorrow, two frozen - works better than eating from a large container until it becomes a judgement call.',
        ],
      },
      {
        h2: 'Reheating does not reset anything',
        paragraphs: [
          'Reheating food does not extend its life or undo time already spent in the fridge. Reheat once, until piping hot the whole way through, and eat it. Food that has been reheated and not finished should be thrown away rather than returned to the fridge for another round.',
          'That is easier to follow if you portion before storing, so what comes out of the fridge is what gets eaten. Reheating a large container and putting the rest back is the usual way people end up reheating twice without intending to.',
        ],
      },
    ],
    related: [
      { slug: 'how-to-store-meal-prep-safely-uk', label: 'How to Store Meal Prep Safely UK', type: 'blog' },
      { slug: 'how-to-defrost-meal-prep-safely-uk', label: 'How to Defrost Meal Prep Safely', type: 'blog' },
      { slug: 'freezer-labels-for-meal-prep-uk', label: 'Freezer Labels for Meal Prep', type: 'blog' },
      { slug: 'batch-cooking-for-beginners-uk', label: 'Batch Cooking for Beginners UK', type: 'blog' },
    ],
    faq: [
      {
        q: 'How long does cooked chicken last in the fridge?',
        a: 'About two days, counted from when it was cooked rather than when it went in the fridge. That is the NHS and FSA guidance for cooked leftovers generally, not just chicken.',
      },
      {
        q: 'Can I tell if cooked meat has gone off by smelling it?',
        a: 'Not reliably. The bacteria that cause illness are largely different from the ones that cause smells, so food can be unsafe while seeming completely normal. Go by the date you cooked it.',
      },
      {
        q: 'How long does cooked chicken keep in the freezer?',
        a: 'It stays safe indefinitely at minus 18C. Quality is the limit - around three months for most cooked dishes before texture and flavour noticeably drop.',
      },
    ],
  }),

  'batch-cooking-one-hob-ring-uk': guide({
    title: 'Batch Cooking on One Hob Ring (or a Broken Cooker)',
    description:
      'How to batch cook with one working hob ring: what to cook in what order, which formats need only one pan, and how to use the oven, kettle and microwave to fill the gaps.',
    h1: 'Batch Cooking on One Hob Ring',
    intro:
      'Shared kitchens, bedsits, caravans and cookers with three dead rings all produce the same problem: recipes assume you can run three pans at once, and you cannot. The fix is not smaller ambitions, it is a different order of operations.',
    quickAnswer: {
      answer:
        'Cook in sequence and hold things in bowls rather than trying to time everything to finish together. Start with what reheats well and finish with what does not. One-pot formats - chilli, curry, dhal, soup, a rice dish - are built for this and give you a week from a single pan.',
      links: [
        { label: 'Batch cooking for beginners', to: '/blog/batch-cooking-for-beginners-uk' },
        { label: 'Meal prep with no microwave', to: '/blog/meal-prep-without-a-microwave-uk' },
      ],
    },
    sections: [
      {
        h2: 'Cook in sequence, not in parallel',
        paragraphs: [
          'With several rings you time everything to land together. With one, that instinct wastes the session. Cook each component fully, tip it into a bowl, and move on - the ring is never idle and nothing needs to be watched simultaneously.',
          'The order that works: the thing that takes longest and reheats best first, the thing that must be fresh last. So the chilli goes on before the eggs, and the rice before the greens.',
          'Anything you cooked early gets combined or reheated at the end. Because most of it is going into the fridge anyway, a component being lukewarm when it goes into a container is irrelevant - it only has to be properly cooked and then cooled promptly.',
        ],
      },
      {
        h2: 'Formats that only ever need one pan',
        paragraphs: [
          'Chilli, curry, dhal, bolognese, stew and thick soups are one-pan meals by design, and they are also the dishes that survive a week in the fridge best. A single large pan of any of them is four to six portions with nothing else on the hob.',
          'Rice dishes that cook together - a pilaf, a one-pot rice and beans - remove the second pan entirely. So does anything where the starch is a wrap, bread or a potato baked in the oven while the pan does the filling.',
          'The pattern to avoid on one ring is a plate assembled from three separately cooked things. That is three sequential cooks and three lots of washing up for one meal.',
        ],
      },
      {
        h2: 'Use the appliances that are not the hob',
        paragraphs: [
          'An oven, if you have one, is a second cooking surface that needs no attention: a tray of vegetables, potatoes or chicken thighs cooks while the pan works. A microwave does rice, jacket potatoes and frozen vegetables without touching the ring at all.',
          'A kettle is more useful than it looks. Boiling water in the kettle and pouring it over pasta or into a pan means the ring only has to hold a simmer rather than bring several litres up from cold, which is often the longest single step.',
          'A slow cooker, if there is one going spare, is the strongest addition here because it is entirely independent of the hob and suits exactly the wet, braised dishes that prep well.',
        ],
      },
      {
        h2: 'Wash as you go, because you have to',
        paragraphs: [
          'On one ring the same pan does several jobs, so washing is not optional tidying - it is part of the sequence. Rinse between components rather than at the end, and cook in an order that minimises it: light and mild before dark and strong, so the pan does not need scrubbing between steps.',
          'That also decides the running order when it is close. Do the eggs before the chilli, not after.',
        ],
      },
    ],
    related: [
      { slug: 'batch-cooking-for-beginners-uk', label: 'Batch Cooking for Beginners UK', type: 'blog' },
      { slug: 'student-meal-prep-uk', label: 'Student Meal Prep UK', type: 'blog' },
      { slug: 'one-pot-high-protein-meals-uk', label: 'One Pot High Protein Meals UK', type: 'blog' },
      { slug: 'slow-cooker-meal-prep-uk', label: 'Slow Cooker Meal Prep UK', type: 'blog' },
    ],
    faq: [
      {
        q: 'Can you batch cook with only one hob ring?',
        a: 'Yes, by cooking in sequence rather than in parallel. Cook each component fully, move it to a bowl, and carry on. Most of it is going into the fridge anyway, so components do not need to be hot at the same time.',
      },
      {
        q: 'What are the best one-pan meals for batch cooking?',
        a: 'Chilli, curry, dhal, bolognese, stew and thick soups. They need one pan, scale up easily, and are the dishes that keep best across a week.',
      },
      {
        q: 'What if I have no hob at all?',
        a: 'An oven tray plus a microwave covers a surprising amount - roasted protein and vegetables, jacket potatoes, microwave rice and frozen vegetables. A slow cooker covers the wet dishes and needs no hob.',
      },
    ],
  }),

  'freezing-dairy-and-eggs-uk': guide({
    title: 'Can You Freeze Milk, Cheese and Eggs? What Actually Works',
    description:
      'What happens when you freeze milk, cheese, butter, cream, yoghurt and eggs, which of them come back usable, and the one thing never to freeze in its shell.',
    h1: 'Freezing Dairy and Eggs',
    intro:
      'Dairy is where most home freezing goes wrong, because some of it freezes beautifully and some of it separates into something you would not put in a coffee. The difference is mostly fat and water, and knowing which is which turns a lot of nearly-wasted food into next week.',
    quickAnswer: {
      answer:
        'Milk, butter and hard cheese freeze well. Cream, creme fraiche and yoghurt split and are only usable in cooking afterwards. Eggs freeze only out of the shell - beaten, or whites and yolks separated. Never freeze an egg in its shell.',
      links: [
        { label: 'Cut food waste in meal prep', to: '/blog/reduce-food-waste-meal-prep-uk' },
        { label: 'Defrost meal prep safely', to: '/blog/how-to-defrost-meal-prep-safely-uk' },
      ],
    },
    sections: [
      {
        h2: 'What freezes well',
        paragraphs: [
          'Milk freezes and comes back fine, though it separates as it thaws and looks alarming until you shake it. Pour a little out of a full bottle first, because it expands. Semi-skimmed and whole both work; thaw in the fridge and use within a few days.',
          'Butter is the easiest thing in this list. It freezes for months with no change worth noticing, and it is worth buying extra when it is cheap.',
          'Hard cheese freezes but changes texture - cheddar comes out crumblier and does not slice as cleanly. That makes it worse on a sandwich and completely fine grated into a sauce, a bake or on top of pasta. Grate before freezing and it goes straight from freezer to pan.',
        ],
      },
      {
        h2: 'What splits, and what to do with it',
        paragraphs: [
          'Cream, creme fraiche, soured cream and yoghurt all separate when frozen and thawed, because the water and fat come apart and will not recombine by stirring. They are not unsafe, they are just no longer smooth.',
          'That does not make them useless. Split cream still works stirred into a hot sauce, a soup or a curry, where it is being incorporated into something anyway. What it will not do is sit on a dessert or go into coffee.',
          'Soft cheeses - brie, mozzarella, cottage cheese, ricotta - are the same story with the same answer. Freeze them only if the plan is to cook with them.',
        ],
      },
      {
        h2: 'Eggs: out of the shell, always',
        paragraphs: [
          'An egg is mostly water and water expands. Frozen in the shell it cracks, which ruins it and creates a contamination risk from shell fragments and leaked contents. This is the one hard rule here.',
          'Out of the shell they freeze well. Beat whole eggs lightly and freeze in portions - an ice cube tray works, and a couple of cubes is roughly one egg. Whites freeze cleanly on their own. Yolks thicken unpleasantly unless you beat in a pinch of salt or sugar first, depending on what you plan to use them for.',
          'Cooked egg dishes are less successful. Frittata and quiche freeze acceptably; scrambled and boiled eggs come back rubbery and watery, so those are worth cooking fresh.',
        ],
      },
      {
        h2: 'The practical use for all this',
        paragraphs: [
          'The point is not to freeze dairy routinely - it is to stop the part-used pack becoming waste. Half a tub of cream, the end of a block of cheddar, milk that will turn before you get through it: all of that has somewhere to go instead of the bin.',
          'Label what you freeze with the date and the intended use, because "cream, for cooking" is a much more useful note in three weeks than an unmarked tub you no longer trust.',
        ],
      },
    ],
    related: [
      { slug: 'reduce-food-waste-meal-prep-uk', label: 'Cut Food Waste When You Meal Prep', type: 'blog' },
      { slug: 'how-to-defrost-meal-prep-safely-uk', label: 'How to Defrost Meal Prep Safely', type: 'blog' },
      { slug: 'freezer-labels-for-meal-prep-uk', label: 'Freezer Labels for Meal Prep', type: 'blog' },
      { slug: 'how-to-store-meal-prep-safely-uk', label: 'How to Store Meal Prep Safely UK', type: 'blog' },
    ],
    faq: [
      {
        q: 'Can you freeze milk?',
        a: 'Yes. It separates as it thaws and needs a good shake, and you should pour a little out of a full bottle first because it expands. Thaw in the fridge and use within a few days.',
      },
      {
        q: 'Can you freeze eggs in their shell?',
        a: 'No. Eggs are mostly water, and freezing expands them until the shell cracks. Beat them and freeze out of the shell instead - an ice cube tray portions them neatly.',
      },
      {
        q: 'Why does frozen cream go grainy?',
        a: 'The fat and water separate and will not recombine by stirring. It is still safe and still works stirred into a hot sauce or soup, but it will not go back to being smooth cream.',
      },
    ],
  }),

  'portioning-meat-before-freezing-uk': guide({
    title: 'Portion Meat Before You Freeze It (The 10-Minute Habit)',
    description:
      'Why portioning meat on the day you shop saves money and stops portion drift, how to pack it flat for faster thawing, and what to write on the bag.',
    h1: 'Portion Meat Before You Freeze It',
    intro:
      'Large packs are the cheapest way to buy meat and the easiest way to eat more of it than you planned. The gap between those two facts is about ten minutes of work on the day you shop, and it is probably the highest-return habit in meal prep.',
    quickAnswer: {
      answer:
        'Split large packs into meal-sized portions before anything goes in the fridge or freezer, pack them flat, and label with the weight and date. Portions taken out of a big pack drift upward almost invisibly, and a flat pack thaws in a fraction of the time a block does.',
      links: [
        { label: 'Defrost meal prep safely', to: '/blog/how-to-defrost-meal-prep-safely-uk' },
        { label: 'Portion without scales', to: '/blog/portion-sizes-without-scales-uk' },
      ],
    },
    sections: [
      {
        h2: 'Why portions drift out of a big pack',
        paragraphs: [
          'Nobody decides to cook more than they planned. What happens is that a kilo of mince does not divide neatly into the amount a recipe wants, so the extra goes in - it is only a bit, and the alternative is putting a small amount back in the fridge. Repeat that across a week and the plan and the eating have quietly separated.',
          'Portioning at the point of shopping removes the decision entirely. On Thursday evening you take out a bag that is already the right size, and there is nothing to judge.',
          'This is the same mechanism that makes frozen bagged protein work well for a deficit: you cook what you take out. Doing it yourself with a large pack gets the same effect at a lower price per kilo.',
        ],
      },
      {
        h2: 'Pack flat, not in lumps',
        paragraphs: [
          'A portion pressed flat in a freezer bag freezes faster, stacks like paper rather than rubble, and thaws in a fraction of the time a ball of the same weight takes. With mince this is nearly free - flatten the bag on the worktop and press the air out before sealing.',
          'Flat packing also fixes the small freezer problem. A drawer that holds four lumpy tubs will hold a dozen flat bags, which is usually the difference between using the freezer and filling it.',
          'Press out as much air as you can. Air is what causes freezer burn, and a bag with the air squeezed out gets most of the benefit people buy a vacuum sealer for.',
        ],
      },
      {
        h2: 'What to write on it',
        paragraphs: [
          'Three things: what it is, the weight, and the date. The weight is the one people skip and the one that makes the bag useful - "chicken thighs 400g" tells you whether it matches tonight, where "chicken" does not.',
          'Write on the bag before you fill it. A marker will not take on a bag that is already cold and damp, which is how freezers accumulate unidentified flat objects.',
          'Frozen meat stays safe indefinitely at minus 18C; quality is the limit, and a few months is a sensible working window. The date is what tells you where in that window you are.',
        ],
      },
      {
        h2: 'Do it before the fridge, not after',
        paragraphs: [
          'The habit only works if it happens on the day you shop, while the shopping is still on the worktop. Meat that goes into the fridge whole stays whole, and by the time you next look at it you are hungry and it is dinner time.',
          'It is also the safer order. Handling raw meat once, at the point of unpacking, means one round of washing hands, board and knife rather than several across the week.',
        ],
      },
    ],
    related: [
      { slug: 'how-to-defrost-meal-prep-safely-uk', label: 'How to Defrost Meal Prep Safely', type: 'blog' },
      { slug: 'portion-sizes-without-scales-uk', label: 'Portion Sizes Without Scales', type: 'blog' },
      { slug: 'freezer-labels-for-meal-prep-uk', label: 'Freezer Labels for Meal Prep', type: 'blog' },
      { slug: 'reduce-food-waste-meal-prep-uk', label: 'Cut Food Waste When You Meal Prep', type: 'blog' },
    ],
    faq: [
      {
        q: 'Should I freeze meat in the pack it came in?',
        a: 'Better to split it first. A whole pack has to be thawed all at once, and portions taken from a large pack tend to grow. Meal-sized bags remove both problems.',
      },
      {
        q: 'Why pack meat flat before freezing?',
        a: 'It freezes faster, stacks far better in a small freezer, and thaws in a fraction of the time. Pressing the air out also reduces freezer burn without needing a vacuum sealer.',
      },
      {
        q: 'How long does frozen meat keep?',
        a: 'Indefinitely in safety terms at minus 18C. Quality is what limits it, and a few months is a sensible window - which is why the date on the bag matters more than people expect.',
      },
    ],
  }),

  'air-fryer-vs-oven-batch-cooking-uk': guide({
    title: 'Air Fryer vs Oven for Batch Cooking: Which Actually Wins',
    description:
      'Air fryer or oven for batch cooking? How basket capacity, cooking in shifts and running costs compare when you are cooking four or five portions rather than one.',
    h1: 'Air Fryer vs Oven for Batch Cooking',
    intro:
      'Air fryers win nearly every comparison written about them, and almost all of those comparisons are about cooking for one or two. Batch cooking asks a different question, and the answer changes once you need four portions at the same time.',
    quickAnswer: {
      answer:
        'The oven wins on volume, because an air fryer basket realistically holds one or two portions and batch cooking means running it in shifts. The air fryer wins on speed for a single portion, on reheating, and on anything that needs to crisp. For most prep sessions the answer is both - the oven for the tray, the air fryer for the thing that needs to be crisp.',
      links: [
        { label: 'Batch cooking for beginners', to: '/blog/batch-cooking-for-beginners-uk' },
        { label: 'Meal prep equipment', to: '/blog/meal-prep-equipment-uk' },
      ],
    },
    sections: [
      {
        h2: 'Capacity is the whole argument',
        paragraphs: [
          'An air fryer cooks by moving hot air fast around food, which needs space between the pieces. Fill the basket and it stops being an air fryer and becomes a small, slow oven - the food steams rather than browning, which is the same crowding problem a pan has.',
          'That puts a real ceiling on the batch. A typical basket does one or two portions of chicken or vegetables properly, so four portions means two or three shifts. A standard oven tray does four in one go, and two trays on two shelves does eight.',
          'So the sums invert with quantity. For one portion the air fryer is faster than heating an oven. For five, the oven is finished while the air fryer is on its second run.',
        ],
      },
      {
        h2: 'Where the air fryer genuinely wins',
        paragraphs: [
          'Reheating, and it is not close. An air fryer brings a portion back to something like its original texture in a few minutes, where a microwave makes it soft and an oven takes twenty minutes to heat for one container. If you prep food that was crisp, this is the appliance that rescues it.',
          'It also wins on anything small and quick during a prep session - halloumi, tofu, a tray of frozen vegetables - because it needs no preheating worth the name and it does not warm the kitchen.',
          'And on running cost for small jobs. Heating a large oven cavity to cook one portion is wasteful in a way that a small basket is not, which is the real basis of the energy claims people make for them.',
        ],
      },
      {
        h2: 'Where the oven wins',
        paragraphs: [
          'Volume, obviously. Also anything with liquid - a traybake that releases juices, a casserole, anything you want to braise - because a basket with holes in it is the wrong shape for that entirely.',
          'And anything where you want several different things cooking together. A tray of chicken thighs with potatoes and peppers is one dish and one wash; the same food through an air fryer is three shifts, because they need different times.',
          'Once the oven is on, the marginal cost of a second tray is small. That is the argument for cooking more than you need whenever it is already hot.',
        ],
      },
      {
        h2: 'The practical answer for a prep session',
        paragraphs: [
          'Run both, doing what each is good at. The oven takes the bulk - trays of protein, potatoes and vegetables that will become the base of several meals. The air fryer takes whatever needs to be genuinely crisp, and does it in the last ten minutes.',
          'If you only have one, and you are cooking for more than two people, the oven is the more useful appliance for prep. The air fryer is the better second appliance, and it earns its place on reheating alone.',
        ],
      },
    ],
    related: [
      { slug: 'air-fryer-meal-prep-uk', label: 'Air Fryer Meal Prep UK', type: 'blog' },
      { slug: 'batch-cooking-for-beginners-uk', label: 'Batch Cooking for Beginners UK', type: 'blog' },
      { slug: 'meal-prep-equipment-uk', label: 'Meal Prep Equipment UK', type: 'blog' },
      { slug: 'which-recipes-survive-meal-prep-uk', label: 'Which Recipes Survive Meal Prep', type: 'blog' },
    ],
    faq: [
      {
        q: 'Is an air fryer good for batch cooking?',
        a: 'For one or two portions, yes. Beyond that the basket forces you to cook in shifts, because filling it makes food steam instead of crisping. An oven tray does four at once.',
      },
      {
        q: 'Is an air fryer cheaper to run than an oven?',
        a: 'For small quantities, generally yes - you are heating a small basket rather than a large cavity. That advantage shrinks once you need several batches to match one oven tray.',
      },
      {
        q: 'What is an air fryer best at for meal prep?',
        a: 'Reheating. It brings prepped food back to something close to its original texture in minutes, which neither a microwave nor an oven manages well for a single portion.',
      },
    ],
  }),

  'slow-cooker-food-safety-uk': guide({
    title: 'Slow Cooker Food Safety: Frozen Meat, Fill Levels and Overnight',
    description:
      'Slow cooker safety for batch cooking: why frozen meat should not go straight in, how full to fill it, whether overnight cooking is safe and why the lid matters.',
    h1: 'Slow Cooker Food Safety',
    intro:
      'A slow cooker is the best appliance in the house for meal prep - it makes exactly the wet, braised dishes that survive a week, and it does it while you are elsewhere. The safety questions it raises are real but few, and they mostly come down to how quickly the food gets hot.',
    quickAnswer: {
      answer:
        'Do not put frozen meat straight in - thaw it first, because a slow cooker takes too long to bring frozen food through the temperature range where bacteria multiply. Fill it between a half and three quarters full, keep the lid on, and do not use it to reheat cooked food.',
      links: [
        { label: 'Slow cooker meal prep', to: '/blog/slow-cooker-meal-prep-uk' },
        { label: 'Store meal prep safely', to: '/blog/how-to-store-meal-prep-safely-uk' },
      ],
    },
    sections: [
      {
        h2: 'Frozen meat is the one real rule',
        paragraphs: [
          'A slow cooker works by holding food at a low temperature for a long time. That is fine when food reaches a safe temperature reasonably quickly and stays there, and it is a problem when the starting point is frozen, because the pot can spend hours in the range where bacteria multiply before it gets hot enough to matter.',
          'So thaw meat fully first - in the fridge, ideally overnight. If you have forgotten, cook it another way rather than putting it in frozen and hoping the length of the cook compensates. It does not work that way; the issue is the hours spent getting there, not the total time.',
          'Frozen vegetables are a different case and generally fine, since the risk that makes raw meat a problem is not present.',
        ],
      },
      {
        h2: 'Fill level changes how fast it heats',
        paragraphs: [
          'Between a half and three quarters full is the range slow cookers are designed around. Under-filled, the contents can overheat and dry; over-filled, the middle takes too long to come up to temperature and may not cook evenly - and it can spill as things bubble.',
          'That matters more for batch cooking than for a family dinner, because the instinct when prepping is to fill it to the brim to get more portions. If you need more than the pot comfortably holds, do two cooks rather than one overloaded one.',
        ],
      },
      {
        h2: 'The lid, and why lifting it costs so much',
        paragraphs: [
          'A slow cooker has no reserve of heat. Lifting the lid drops the temperature substantially and it can take a long time to recover - commonly cited as adding around twenty minutes each time. Stirring a dish that does not need stirring is the most common way people slow their own cooking down.',
          'Leave it alone. If a recipe needs something added late, add it late and put the lid straight back.',
        ],
      },
      {
        h2: 'Overnight, and reheating',
        paragraphs: [
          'Cooking overnight is fine in principle - the appliance is designed to run unattended, and a long low cook is what it is for. What matters is the same as any other time: thawed meat in, lid on, sensible fill level. Follow the manufacturer instructions for your model, since capacities and settings differ.',
          'What a slow cooker should not do is reheat already-cooked food. It heats too slowly to bring a chilled portion through to piping hot quickly enough, which is exactly the situation to avoid. Reheat in a pan, an oven or a microwave, and use the slow cooker for cooking raw ingredients.',
          'Cool leftovers promptly afterwards. A ceramic pot holds heat for a long time, so decant into shallow containers rather than leaving the whole thing to cool on the side.',
        ],
      },
    ],
    related: [
      { slug: 'slow-cooker-meal-prep-uk', label: 'Slow Cooker Meal Prep UK', type: 'blog' },
      { slug: 'how-to-store-meal-prep-safely-uk', label: 'How to Store Meal Prep Safely UK', type: 'blog' },
      { slug: 'batch-cooking-one-hob-ring-uk', label: 'Batch Cooking on One Hob Ring', type: 'blog' },
      { slug: 'how-to-defrost-meal-prep-safely-uk', label: 'How to Defrost Meal Prep Safely', type: 'blog' },
    ],
    faq: [
      {
        q: 'Can you put frozen meat in a slow cooker?',
        a: 'No - thaw it first. A slow cooker heats too gradually to bring frozen meat through the range where bacteria multiply quickly enough, and a longer cook does not compensate for that.',
      },
      {
        q: 'How full should a slow cooker be?',
        a: 'Between a half and three quarters. Under that it can dry out; over it, the middle may not reach temperature evenly and it can spill.',
      },
      {
        q: 'Can you reheat food in a slow cooker?',
        a: 'No. It heats too slowly to get chilled food piping hot quickly enough. Use a pan, oven or microwave to reheat, and keep the slow cooker for cooking raw ingredients.',
      },
    ],
  }),

  'supermarket-own-brand-tiers-uk': guide({
    title: 'How UK Supermarket Own-Brand Tiers Actually Work',
    description:
      'Value, standard and premium own-brand ranges explained: what actually differs between them, where trading down costs you nothing, and where it costs you the meal.',
    h1: 'How Supermarket Own-Brand Tiers Work',
    intro:
      'Nearly every UK supermarket sells the same product at three prices under its own name. Understanding what changes between those tiers is the difference between a cheap shop and a cheap shop you regret, and it explains most of the budget advice on this site.',
    quickAnswer: {
      answer:
        'Value tiers usually differ on grade, size consistency and meat or fruit content rather than on safety or basic nutrition. Trade down on things you will process - tinned tomatoes, frozen vegetables, oats, rice - and stay standard on things eaten as they are, where texture and consistency show.',
      links: [
        { label: 'Work out cost per portion', to: '/blog/cost-per-portion-uk' },
        { label: 'Read a UK food label', to: '/blog/how-to-read-food-labels-uk' },
      ],
    },
    sections: [
      {
        h2: 'The three tiers, and what the names mean',
        paragraphs: [
          'Most chains run a value range, a standard own-label range and a premium one. Asda has Just Essentials, Aldi has Everyday Essentials with Specially Selected above it, Lidl has Deluxe as its premium line, and Co-op runs Honest Value. The names change; the structure does not.',
          'Standard own-label is the default and is usually the closest thing to the branded equivalent. Premium own-label is generally about sourcing, cut, or a shorter ingredient list rather than about being a different food. Value is where the meaningful differences live.',
        ],
      },
      {
        h2: 'What actually changes at the value tier',
        paragraphs: [
          'Usually grade and consistency rather than safety. Value vegetables are often the odd sizes and shapes that do not pack neatly, which matters not at all once they are chopped. Value tinned tomatoes may be more watery. Value biscuits may have less of the expensive ingredient.',
          'On meat products the difference is more likely to be meat content and fat percentage, and that is worth reading rather than assuming - a cheaper sausage or burger is sometimes cheaper because there is less meat in it, which changes the protein figure as well as the taste.',
          'What does not change is food safety, or the basic identity of a plain ingredient. Value oats are oats. Value frozen peas are peas.',
        ],
      },
      {
        h2: 'Where to trade down and where not to',
        paragraphs: [
          'Trade down freely on anything you are about to cook, chop or blend: tinned tomatoes and pulses, frozen vegetables, oats, rice, pasta, flour, stock. The processing removes almost everything you would have paid extra for.',
          'Stay at standard for things eaten as they are, where texture and consistency are the product - yoghurt, cheese eaten cold, salad leaves, bread you are not toasting. This is also where a disappointing swap makes a whole meal worse rather than slightly cheaper.',
          'The one to judge case by case is meat and fish. Some value lines are simply smaller or less uniform pieces, which is fine for a curry. Others have lower meat content, which is a different product. Read the pack rather than the tier name.',
        ],
      },
      {
        h2: 'Why value tiers reaching fresh food matters',
        paragraphs: [
          'Value ranges used to stop at cupboard goods, which meant a cheap basket was necessarily a carbohydrate-heavy one. Several now extend into fresh meat, fish and produce, and that is the change that makes a genuinely cheap high-protein week possible rather than a compromise.',
          'It is also why the same budget goes further at some chains than others for a protein-led plan. The headline price per item matters less than whether the value tier covers the expensive part of your basket at all.',
        ],
      },
    ],
    related: [
      { slug: 'cost-per-portion-uk', label: 'How to Work Out Cost Per Portion', type: 'blog' },
      { slug: 'how-to-read-food-labels-uk', label: 'How to Read a UK Food Label', type: 'blog' },
      { slug: 'cheapest-uk-supermarket-meal-prep', label: 'Cheapest UK Supermarket for Meal Prep', type: 'blog' },
      { slug: 'best-cheap-high-protein-foods-uk', label: 'Best Cheap High Protein Foods UK', type: 'blog' },
    ],
    faq: [
      {
        q: 'Is supermarket value food lower quality?',
        a: 'Usually it differs on grade, size consistency or the proportion of an expensive ingredient rather than on safety. For anything you chop, cook or blend that difference mostly disappears.',
      },
      {
        q: 'What should I never buy in the value range?',
        a: 'Things eaten as they are, where texture is the product - yoghurt, cold cheese, salad, bread you will not toast. Also check meat products, where a lower price sometimes means lower meat content.',
      },
      {
        q: 'Which supermarket has the best value range?',
        a: 'The useful question is whether the value tier reaches fresh meat and fish, because that is where a protein-led basket spends. Several now do, which is what makes a cheap high-protein week possible.',
      },
    ],
  }),

  'cost-per-portion-uk': guide({
    title: 'How to Work Out Cost Per Portion (Properly)',
    description:
      'How to calculate what a meal actually costs per portion, why counting whole packs overstates it, and how to handle cupboard staples you use a spoonful of.',
    h1: 'How to Work Out Cost Per Portion',
    intro:
      'Almost every claim about cheap eating rests on a cost per portion, and almost nobody calculates one the same way. The arithmetic is simple; the judgement calls are where the numbers people quote diverge by a factor of two.',
    quickAnswer: {
      answer:
        'Divide what you use by what you cook, not what you bought by what you cooked. Count the fraction of each pack the meal actually consumes, ignore cupboard staples you use a spoonful of, and add them as a flat few pence rather than trying to price a teaspoon of paprika.',
      links: [
        { label: 'How own-brand tiers work', to: '/blog/supermarket-own-brand-tiers-uk' },
        { label: 'Cut food waste in meal prep', to: '/blog/reduce-food-waste-meal-prep-uk' },
      ],
    },
    sections: [
      {
        h2: 'Use what you use, not what you bought',
        paragraphs: [
          'The common mistake is charging the whole pack to one meal. A 500g bag of rice does not cost a meal five pounds worth of rice; it costs the meal the 60g it used. Work in fractions: pack price divided by pack size, multiplied by the amount in the recipe.',
          'That is the calculation that makes bulk buying look sensible, and it is also the one that makes it look less impressive than the shelf label suggests - a larger pack lowers the per-gram price, but only for the portion you eat, not for the portion still in the cupboard.',
          'Then divide by the number of portions the dish actually makes, which is the number you will eat, not the number the recipe claims.',
        ],
      },
      {
        h2: 'How to handle the spoonful problem',
        paragraphs: [
          'Spices, oil, stock, mustard, soy sauce and vinegar are used in amounts too small to price sensibly and too numerous to ignore. Pricing a teaspoon of paprika to two decimal places is false precision.',
          'The workable convention is a flat allowance - somewhere around ten to twenty pence per portion covers seasoning, oil and sauces for most home cooking. State it as an assumption rather than pretending it is zero, because a costing that excludes the cupboard and one that includes it are different claims even when they land on the same headline figure.',
          'The exception is anything used in quantity. If a recipe takes three tablespoons of olive oil, that is a real cost and should be counted properly.',
        ],
      },
      {
        h2: 'The waste adjustment nobody makes',
        paragraphs: [
          'A costing assumes every gram bought gets eaten. In practice the half bag of spinach that goes off is part of what the meal cost, and ignoring it is why real spending exceeds calculated spending so reliably.',
          'The honest version is to cost the pack you had to buy when you cannot use the remainder for anything else. If a recipe needs 50g of an ingredient that only comes in 200g packs and nothing else in the week uses it, that meal effectively cost the whole pack.',
          'This is a strong argument for building a week from a short list of ingredients used repeatedly, which is the actual reason repetitive plans are cheaper - not the shelf prices.',
        ],
      },
      {
        h2: 'What the number is for',
        paragraphs: [
          'Comparison, mostly. A cost per portion is most useful for deciding between two options - this chicken dish against that lentil one - rather than as an absolute claim, because the assumptions behind any single figure are doing a lot of work.',
          'It is also how to test advice. When a plan claims a weekly figure, the question worth asking is whether it counts cupboard staples, whether it assumes every gram is eaten, and how many people it feeds. Most disagreements about whether meal prep is cheap come down to those three, not to the food.',
        ],
      },
    ],
    related: [
      { slug: 'supermarket-own-brand-tiers-uk', label: 'How Own-Brand Tiers Work', type: 'blog' },
      { slug: 'reduce-food-waste-meal-prep-uk', label: 'Cut Food Waste When You Meal Prep', type: 'blog' },
      { slug: 'how-much-should-meal-prep-cost-uk', label: 'How Much Should Meal Prep Cost UK', type: 'blog' },
      { slug: 'cheapest-protein-sources-cost-per-gram-uk', label: 'Cheapest Protein Sources per Gram', type: 'blog' },
    ],
    faq: [
      {
        q: 'How do you calculate cost per portion?',
        a: 'Pack price divided by pack size, times the amount the recipe uses, summed across ingredients, then divided by the portions it actually makes. Use the fraction consumed, not the whole pack.',
      },
      {
        q: 'How do I price spices and oil?',
        a: 'With a flat allowance rather than precise arithmetic - roughly ten to twenty pence a portion covers seasoning and sauces for most cooking. Count anything used in real quantity, like several tablespoons of oil, properly.',
      },
      {
        q: 'Why does my shop cost more than the plan says?',
        a: 'Usually because the costing assumes every gram gets eaten and that cupboard staples are already in. Waste and first-shop staples are the two gaps between a calculated figure and a receipt.',
      },
    ],
  }),

  'freezer-inventory-rotation-uk': guide({
    title: 'Freezer Inventory: How to Stop Losing Food in There',
    description:
      'A simple freezer list and rotation system for meal prep: what to record, why first in first out matters, and how to stop the freezer becoming a store of unidentified blocks.',
    h1: 'Freezer Inventory and Rotation',
    intro:
      'A freezer is only useful if you know what is in it. Most household freezers are less a store than an archive - things go in, the intention is genuine, and nobody looks again until something needs digging out from underneath.',
    quickAnswer: {
      answer:
        'Keep a list on the freezer door and update it as things go in and out. Store in categories rather than piles, put new items at the back and take from the front, and treat anything older than about three months as needing to be used rather than kept.',
      links: [
        { label: 'Freezer labels that stay on', to: '/blog/freezer-labels-for-meal-prep-uk' },
        { label: 'Defrost meal prep safely', to: '/blog/how-to-defrost-meal-prep-safely-uk' },
      ],
    },
    sections: [
      {
        h2: 'A list on the door beats a better memory',
        paragraphs: [
          'The list does not need to be sophisticated - a sheet of paper and a pen, or a note on your phone. What makes it work is updating it at the moment food goes in or comes out, which is a five-second habit rather than an inventory exercise.',
          'Write the item, the date and the number of portions. That is enough to answer the only questions you ever ask a freezer: is there anything for tonight, and what needs using.',
          'The payoff is not tidiness. It is that you actually cook from the freezer, which is what makes batch cooking worth doing in the first place.',
        ],
      },
      {
        h2: 'Store in categories, not in strata',
        paragraphs: [
          'A freezer filled chronologically becomes layers, and whatever is at the bottom is invisible for months. Grouping instead - cooked meals here, raw protein there, vegetables in the drawer - means you look in one place rather than excavating.',
          'Flat-packed portions help enormously with this, because they file like paper rather than stacking like rubble. A drawer that holds four lumpy tubs will hold a dozen flat bags.',
          'Boxes or bags as dividers work better than good intentions in a chest freezer, where there is nothing to stop everything becoming one layer.',
        ],
      },
      {
        h2: 'First in, first out',
        paragraphs: [
          'Put new things at the back and take from the front. It is the same principle a shop uses, and it is the only reliable way to stop a small amount of food ageing indefinitely while newer food gets eaten around it.',
          'Frozen food stays safe indefinitely at minus 18C, so this is about quality rather than danger. Around three months is a sensible working window for cooked dishes before texture and flavour noticeably drop, which is exactly the sort of thing a date on the bag makes visible.',
        ],
      },
      {
        h2: 'Run it down on purpose',
        paragraphs: [
          'Once every month or two, plan a week that cooks mostly from the freezer. It empties the awkward corners, it costs almost nothing in shopping, and it stops the slow accumulation that makes the whole thing unusable.',
          'That week is also when you find out whether your labelling is working. Anything you cannot identify or date is a lesson about the label, not about the food.',
        ],
      },
    ],
    related: [
      { slug: 'freezer-labels-for-meal-prep-uk', label: 'Freezer Labels for Meal Prep', type: 'blog' },
      { slug: 'how-to-defrost-meal-prep-safely-uk', label: 'How to Defrost Meal Prep Safely', type: 'blog' },
      { slug: 'portioning-meat-before-freezing-uk', label: 'Portion Meat Before You Freeze It', type: 'blog' },
      { slug: 'reduce-food-waste-meal-prep-uk', label: 'Cut Food Waste When You Meal Prep', type: 'blog' },
    ],
    faq: [
      {
        q: 'How do I keep track of what is in my freezer?',
        a: 'A list on the door, updated as things go in and out, with the item, date and number of portions. It takes five seconds each time and it is the difference between a store and an archive.',
      },
      {
        q: 'How long should food stay in the freezer?',
        a: 'It stays safe indefinitely at minus 18C. Quality is the limit, and around three months is a sensible window for cooked dishes before texture and flavour drop noticeably.',
      },
      {
        q: 'What is the best way to organise a freezer?',
        a: 'By category rather than by date order, with new items at the back and older ones taken from the front. Flat-packed portions file far better than tubs and make the whole thing visible.',
      },
    ],
  }),

  'falling-off-the-meal-plan-uk': guide({
    title: 'What to Do When You Fall Off the Meal Plan',
    description:
      'How to recover a meal prep week that has gone wrong by Wednesday: salvaging the food you already cooked, and why restarting on Monday is the worst option.',
    h1: 'When the Plan Falls Apart Midweek',
    intro:
      'Most meal prep does not fail on Sunday. It fails on Wednesday, when something ran late and the containers are still in the fridge, and the instinct after that is to write off the week and start again next Monday. That instinct costs more than the missed meals.',
    quickAnswer: {
      answer:
        'Deal with the food first - freeze anything you will not eat in the next day or two, before it becomes waste rather than a decision. Then rejoin the plan at the next meal rather than the next Monday. A week that goes four days out of seven is not a failed week.',
      links: [
        { label: 'Weekly calorie deficit meal prep', to: '/blog/weekly-calorie-deficit-meal-prep-uk' },
        { label: 'Weight loss meal prep mistakes', to: '/blog/weight-loss-meal-prep-mistakes-uk' },
      ],
    },
    sections: [
      {
        h2: 'Rescue the food before you think about the plan',
        paragraphs: [
          'Two prepped portions sitting in the fridge on Wednesday have about a day left if they were cooked on Sunday. That is the decision that has a deadline, and it is worth making before anything else - freeze them now and they are next week; leave them another two days and they are the bin.',
          'This is the single biggest cost of a broken week and the easiest to avoid. The food is still perfectly good at the point you realise the plan has slipped; it is only lost if the realisation leads to nothing.',
        ],
      },
      {
        h2: 'Rejoin at the next meal, not the next Monday',
        paragraphs: [
          'Waiting for Monday turns a missed dinner into four days of no plan at all, which is arithmetically much worse and is where most of the damage in a "failed" week actually happens. There is nothing special about Monday except that it feels like a clean start.',
          'The next meal is always available. If Wednesday evening went badly, Thursday breakfast is the plan again - and the week still lands somewhere useful rather than being written off.',
          'This matters more on a deficit than people assume, because a week that averages correctly does much the same job as seven identical days. Four good days and three ordinary ones is a real result.',
        ],
      },
      {
        h2: 'Work out which failure it was',
        paragraphs: [
          'Weeks break for a handful of reasons and they need different fixes. If you ran out of time, the prep session was too ambitious - cook fewer, simpler things next Sunday. If you did not want the food, the menu was wrong, and no amount of discipline fixes a menu you do not like.',
          'If it was one unusually hard day, it was probably just an unusually hard day and nothing needs changing. The mistake is redesigning the whole system in response to a single bad Wednesday.',
          'If it is the same failure every week, that is information. Consistently abandoning Thursday means Thursday needs a different kind of meal, not more willpower.',
        ],
      },
      {
        h2: 'Keep a fallback that requires nothing',
        paragraphs: [
          'The best insurance against a broken week is two or three frozen single portions that need no thought - the accumulated extra from previous batches. That is the difference between a bad evening and a takeaway, and it is free if you cook one extra portion of things you were making anyway.',
          'A tin of something and a bag of frozen vegetables does the same job. The point is that the fallback exists before you need it, because nobody assembles one at seven on a Wednesday.',
        ],
      },
    ],
    related: [
      { slug: 'weekly-calorie-deficit-meal-prep-uk', label: 'Weekly Calorie Deficit Meal Prep', type: 'blog' },
      { slug: 'weight-loss-meal-prep-mistakes-uk', label: 'Weight Loss Meal Prep Mistakes', type: 'blog' },
      { slug: 'how-to-swap-meals-in-a-meal-plan-uk', label: 'How to Swap Meals in a Plan', type: 'blog' },
      { slug: 'batch-cooking-for-beginners-uk', label: 'Batch Cooking for Beginners UK', type: 'blog' },
    ],
    faq: [
      {
        q: 'Should I restart my meal plan on Monday if I fall off midweek?',
        a: 'No - rejoin at the next meal. Waiting for Monday turns one missed dinner into four days without a plan, which does far more damage than the meal you missed.',
      },
      {
        q: 'What should I do with prepped food I did not eat?',
        a: 'Freeze it as soon as you realise the week has slipped, while it is still good. Cooked leftovers keep about two days in the fridge, so the decision has a deadline.',
      },
      {
        q: 'Why does my meal prep keep failing on the same day?',
        a: 'That is usually information rather than a discipline problem. A day you consistently abandon needs a different kind of meal - lower effort, or something you actually look forward to.',
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
