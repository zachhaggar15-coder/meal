// The container guide taxonomy, kept apart from containerProducts.js on
// purpose. navigation.js needs these labels to build the Containers nav menu,
// and navigation.js is imported by the navbar, sidebar and footer — so pulling
// this literal out of the 62 kB product catalogue keeps that catalogue off the
// boot path of every page on the site.
//
// containerProducts.js re-exports this, so existing importers are unaffected.
// semantic-contracts.test.js asserts every slug here still resolves to a real
// guide in CONTAINER_GUIDES.
export const CONTAINER_GUIDE_GROUPS = [
  {
    label: 'Price bands',
    guides: [
      { slug: 'budget', label: 'Budget' },
      { slug: 'mid-range', label: 'Mid range' },
      { slug: 'premium', label: 'Premium' },
    ],
  },
  {
    label: 'Materials',
    guides: [
      { slug: 'glass', label: 'Glass' },
      { slug: 'plastic', label: 'Plastic' },
    ],
  },
  {
    label: 'Buyer needs',
    guides: [
      { slug: 'leakproof', label: 'Leakproof' },
      { slug: 'freezer-safe', label: 'Freezer safe' },
      { slug: 'freezer-bags', label: 'Freezer bags' },
      { slug: 'work-lunch', label: 'Work lunches' },
      { slug: 'large-sets', label: 'Large sets' },
    ],
  },
];
