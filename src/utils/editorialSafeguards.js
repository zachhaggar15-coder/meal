import { formatContentDate, toIsoDate } from './contentDates.js';

const NHS_EATWELL = {
  label: 'NHS Eatwell Guide',
  url: 'https://www.nhs.uk/live-well/eat-well/food-guidelines-and-food-labels/the-eatwell-guide/',
};
const NHS_HEALTHY_WEIGHT = {
  label: 'NHS healthy weight guidance',
  url: 'https://www.nhs.uk/live-well/healthy-weight/',
};
const FSA_FOOD_SAFETY = {
  label: 'Food Standards Agency food safety guidance',
  url: 'https://www.gov.uk/government/publications/home-food-fact-checker/home-food-fact-checker',
};
const ONS_PRICES = {
  label: 'ONS inflation and price indices',
  url: 'https://www.ons.gov.uk/economy/inflationandpriceindices',
};

const RETAILER_SOURCES = [
  ['aldi', { label: 'Aldi UK', url: 'https://www.aldi.co.uk/' }],
  ['tesco', { label: 'Tesco Groceries', url: 'https://www.tesco.com/groceries/' }],
  ['asda', { label: 'Asda Groceries', url: 'https://www.asda.com/' }],
  ['sainsbury', { label: "Sainsbury's Groceries", url: 'https://www.sainsburys.co.uk/gol-ui/groceries' }],
  ['lidl', { label: 'Lidl GB', url: 'https://www.lidl.co.uk/' }],
  ['morrisons', { label: 'Morrisons Groceries', url: 'https://groceries.morrisons.com/' }],
  ['iceland', { label: 'Iceland Foods', url: 'https://www.iceland.co.uk/' }],
  ['waitrose', { label: 'Waitrose', url: 'https://www.waitrose.com/' }],
  ['ocado', { label: 'Ocado', url: 'https://www.ocado.com/' }],
];

const HEALTH_GUIDANCE = /\b(calorie|weight loss|fat loss|protein|fibre|nutrition|diet(?:ing)?|menopause|inflammat|fasting|muscle building|body composition|healthy eating)\b/i;
const WEIGHT_GUIDANCE = /\b(calorie|weight loss|fat loss|deficit|healthy weight|belly fat|cutting diet)\b/i;
const FOOD_SAFETY_GUIDANCE = /\b(food safety|store|storage|chill|freeze|freezer|reheat|leftover|batch cook)\b/i;
const PRICE_CLAIM = /(?:£\s?\d|\b\d+(?:\.\d+)?p\b)/i;

function recordText(record = {}, slug = '') {
  return `${slug} ${JSON.stringify(record)}`;
}

export function hasSpecificPriceClaims(record = {}) {
  return PRICE_CLAIM.test(JSON.stringify(record));
}

export function getPriceSources(record = {}, slug = '') {
  if (!hasSpecificPriceClaims(record)) return [];
  const text = recordText(record, slug).toLowerCase();
  const retailers = RETAILER_SOURCES
    .filter(([keyword]) => text.includes(keyword))
    .map(([, source]) => source);
  return retailers.length ? retailers : [ONS_PRICES];
}

export function getEditorialSources(record = {}, slug = '') {
  const sources = [...(record.sources || [])];
  const text = recordText(record, slug);
  if (HEALTH_GUIDANCE.test(text)) sources.push(NHS_EATWELL);
  if (WEIGHT_GUIDANCE.test(text)) sources.push(NHS_HEALTHY_WEIGHT);
  if (FOOD_SAFETY_GUIDANCE.test(text)) sources.push(FSA_FOOD_SAFETY);
  sources.push(...getPriceSources(record, slug));

  const unique = new Map();
  for (const source of sources) {
    if (source?.url && !unique.has(source.url)) unique.set(source.url, source);
  }
  return [...unique.values()];
}

export function getPriceClaimMeta(record = {}, now = new Date()) {
  if (!hasSpecificPriceClaims(record)) return null;
  const dateValue = record.priceChecked;
  const iso = toIsoDate(dateValue);
  const ageDays = iso ? Math.floor((Number(now) - Date.parse(`${iso}T00:00:00Z`)) / 86400000) : null;
  return {
    dated: formatContentDate(dateValue),
    stale: ageDays === null || ageDays > 120,
    ageDays,
  };
}
