// Tiny public catalogue metadata. Keep this separate from planSeeds.js so the
// navigation and homepage do not download the complete generated-plan data
// merely to display the published plan count.
export const PLAN_COUNT = 1055;

// The same number was appearing as "Browse 1055 Plans" in the nav and sidebar
// and as "1,055" on the browse page and homepage stat. Anything shown to a
// reader should use this; PLAN_COUNT stays raw for arithmetic and for schema
// fields that want a plain integer.
export const PLAN_COUNT_LABEL = PLAN_COUNT.toLocaleString('en-GB');

// Which supermarkets actually have at least one indexable plan. This used to be
// derived by mapping over INDEXABLE_PLAN_SEEDS, which meant planChooser.js —
// and therefore navigation.js, and therefore the navbar on every single page —
// pulled the whole 164 kB generated-plan chunk into the boot path to work out
// twelve strings. remediation-contracts.test.js asserts this stays in step with
// the real seed data, so a new supermarket cannot silently go missing.
export const INDEXED_SUPERMARKET_VALUES = Object.freeze([
  'aldi',
  'tesco',
  'asda',
  'sainsburys',
  'lidl',
  'morrisons',
  'iceland',
  'any',
  'marks-spencer',
  'waitrose',
  'coop',
  'ocado',
]);
