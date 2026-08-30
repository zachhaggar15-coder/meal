const SUPERMARKETS = [
  ['marks-spencer', 'M&S'],
  ['sainsburys', "Sainsbury's"],
  ['morrisons', 'Morrisons'],
  ['waitrose', 'Waitrose'],
  ['iceland', 'Iceland'],
  ['tesco', 'Tesco'],
  ['aldi', 'Aldi'],
  ['lidl', 'Lidl'],
  ['asda', 'Asda'],
  ['ocado', 'Ocado'],
  ['coop', 'Co-op'],
];

export function buildBlogNextStep({ slug = '', data = {}, exactPlanLinks = [] }) {
  const firstExactPlan = exactPlanLinks[0];
  const supermarket = SUPERMARKETS.find(([key]) => slug.includes(key));
  const calorieMatch = slug.match(/(?:^|-)(1[24-9]00|2[025]00|3[05]00)(?:-|$)/);
  const isEquipment = Boolean(
    data.productRecommendations ||
    data.toolRecommendations ||
    data.affiliateDisclosure ||
    /(container|freezer-bag|lunch-bag|air-fryer|rice-cooker|kitchen-scale)/.test(slug)
  );

  if (firstExactPlan) {
    const otherExactPlans = exactPlanLinks.slice(1, 3).map(link => ({
      to: link.to,
      label: link.label,
    }));
    return {
      title: 'Put this guide into a real weekly plan',
      description: 'Open the closest matching plan for exact meals, quantities and a grouped shopping list.',
      primary: { to: firstExactPlan.to, label: firstExactPlan.label },
      secondary: otherExactPlans.length
        ? otherExactPlans
        : [
            { to: '/quiz', label: 'Find a better-matched plan' },
            { to: '/browse', label: 'Compare all plans' },
          ],
    };
  }

  // Supermarket is checked before equipment, and the ordering is load-bearing.
  //
  // Three months of Search Console data says supermarket-named queries are what
  // this site actually wins: they convert at 1.14% against 0.21% for generic
  // ones, and /meal-plans/lidl is the single best page on the site at 3.68%.
  // Container queries over the same window returned 9,757 impressions and 11
  // clicks. So when a page is both — an Aldi guide that also recommends a
  // lunch box — the supermarket plan is the more valuable next step by an
  // order of magnitude, and sending that reader to the container calculator
  // instead would trade a proven destination for a dead one.
  //
  // This also means a supermarket page can carry affiliate products without
  // silently losing its plan CTA, which is what lets those pages be monetised
  // at all.
  if (supermarket) {
    const [key, label] = supermarket;
    return {
      title: `Find a weekly plan for ${label}`,
      description: `Move from general advice to a realistic ${label} plan with meals, cost range and shopping list.`,
      primary: { to: `/meal-plans/${key}`, label: `View ${label} meal plans` },
      secondary: [
        { to: `/browse?supermarket=${key}`, label: `Filter all ${label} plans` },
        { to: '/quiz', label: 'Use the plan finder' },
      ],
    };
  }

  if (isEquipment) {
    return {
      title: 'Match the kit to the meals you actually prep',
      description: 'Work out your weekly container count first, then compare only the size and material that fits.',
      primary: { to: '/tools#container-count-calculator', label: 'Calculate my container count' },
      secondary: [
        { to: '/meal-prep-containers', label: 'Compare container types' },
        { to: '/quiz', label: 'Find a weekly meal plan' },
      ],
    };
  }

  if (calorieMatch) {
    const calories = calorieMatch[1];
    return {
      title: `Choose a ${Number(calories).toLocaleString('en-GB')} calorie week`,
      description: 'Compare plans at this target, then open one for recipes, macros and a shopping list.',
      primary: { to: `/meal-plans/${calories}-calorie`, label: `View ${Number(calories).toLocaleString('en-GB')} calorie plans` },
      secondary: [
        { to: `/browse?calories=${calories}`, label: 'Compare supermarkets' },
        { to: '/quiz', label: 'Check this target against my goals' },
      ],
    };
  }

  return {
    title: 'Turn this advice into a supermarket meal plan',
    description: 'Answer seven quick questions to find a realistic week for your goal, budget and usual UK supermarket.',
    primary: { to: '/quiz', label: 'Find my meal plan' },
    secondary: [{ to: '/browse', label: 'Browse plans manually' }],
  };
}
