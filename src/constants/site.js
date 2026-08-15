export const SITE_NAME = 'MealPrep.org.uk';
export const SITE_URL = 'https://www.mealprep.org.uk';
export const SITE_DESCRIPTION =
  'Free UK meal plans by goal, supermarket, calories, budget, and diet.';
export const SITE_CONTACT_EMAIL = 'mealprep.org.uk@proton.me';
export const SITE_AUTHOR_NAME = 'MealPrep.org.uk editorial team';

// The date the plan library last passed the full release gate (nutrition,
// dietary, plan, recipe-invariant, link, schema and accessibility audits).
// This is a real automated-validation date, not an editorial review date, and
// it is kept in step with docs/semantic-qa/deployment-log.json by
// scripts/check-validation-date.js — which fails the build if they diverge.
export const LIBRARY_VALIDATED_ON = '2026-08-16';
export const SITE_AUTHOR_URL = `${SITE_URL}/about`;

export const SITE_LOGO_PATH = '/mealprep-logo.webp';
export const SITE_LOGO_URL = `${SITE_URL}${SITE_LOGO_PATH}`;
export const SITE_LOGO_WIDTH = 600;
export const SITE_LOGO_HEIGHT = 600;
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;

export const ORGANIZATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': ORGANIZATION_ID,
  name: SITE_NAME,
  url: SITE_URL,
  email: SITE_CONTACT_EMAIL,
  description: SITE_DESCRIPTION,
  knowsAbout: [
    'UK meal planning',
    'UK supermarket meal prep',
    'Calorie-target meal plans',
    'Shopping-list meal prep',
  ],
  areaServed: {
    '@type': 'Country',
    name: 'United Kingdom',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    email: SITE_CONTACT_EMAIL,
    contactType: 'editorial enquiries',
    availableLanguage: 'en-GB',
  },
  logo: {
    '@type': 'ImageObject',
    url: SITE_LOGO_URL,
    width: SITE_LOGO_WIDTH,
    height: SITE_LOGO_HEIGHT,
    caption: `${SITE_NAME} logo`,
  },
  image: SITE_LOGO_URL,
};

// The site is produced by an editorial team, not by a named individual, so the
// author is declared as an Organization. Emitting `Person` for a team name
// asserts an authorship structure that does not exist.
export const AUTHOR_JSON_LD = {
  '@type': 'Organization',
  name: SITE_AUTHOR_NAME,
  url: SITE_AUTHOR_URL,
  email: SITE_CONTACT_EMAIL,
  worksFor: {
    '@id': ORGANIZATION_ID,
  },
};
