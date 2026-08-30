// Tiny public catalogue metadata. Keep this separate from planSeeds.js so the
// navigation and homepage do not download the complete generated-plan data
// merely to display the published plan count.
export const PLAN_COUNT = 1059;

// The same number was appearing as "Browse 1059 Plans" in the nav and sidebar
// and as "1,059" on the browse page and homepage stat. Anything shown to a
// reader should use this; PLAN_COUNT stays raw for arithmetic and for schema
// fields that want a plain integer.
export const PLAN_COUNT_LABEL = PLAN_COUNT.toLocaleString('en-GB');
