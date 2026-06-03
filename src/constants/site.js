export const SITE_NAME = 'MealPrep.org.uk';
export const SITE_URL = 'https://www.mealprep.org.uk';
export const SITE_DESCRIPTION =
  'Free UK meal plans by goal, supermarket, calories, budget, and diet.';

export const SITE_LOGO_PATH = '/mealprep-logo.png';
export const SITE_LOGO_URL = `${SITE_URL}${SITE_LOGO_PATH}`;
export const SITE_LOGO_WIDTH = 1254;
export const SITE_LOGO_HEIGHT = 1254;
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;

export const ORGANIZATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': ORGANIZATION_ID,
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  logo: {
    '@type': 'ImageObject',
    url: SITE_LOGO_URL,
    width: SITE_LOGO_WIDTH,
    height: SITE_LOGO_HEIGHT,
    caption: `${SITE_NAME} logo`,
  },
  image: SITE_LOGO_URL,
};
