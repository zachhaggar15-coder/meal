export const AFFILIATE_PRODUCT_CLICK_EVENT = 'affiliate_product_click';
export const AFFILIATE_BASELINE_DATE = '2026-08-13';

export const RECOMMENDATION_SOURCES = Object.freeze([
  'container_buying_guide',
  'container_hub',
  'container_specialist_guide',
  'container_chooser',
  'accessories_hub',
  'accessory_guide',
  'plan_derived',
  'homepage',
  'other',
]);

const RECOMMENDATION_SOURCE_SET = new Set(RECOMMENDATION_SOURCES);

export function isAffiliateUrl(value) {
  const href = typeof value === 'string' ? value : value?.href;
  if (!href) return false;

  try {
    const url = new URL(href, 'https://www.mealprep.org.uk');
    return /(^|\.)(amazon\.[a-z.]+|amzn\.to)$/i.test(url.hostname)
      || url.searchParams.has('tag')
      || url.searchParams.has('ascsubtag');
  } catch {
    return false;
  }
}

export function getViewportCategory(width) {
  const viewportWidth = Number(width);
  if (!Number.isFinite(viewportWidth)) return 'unknown';
  if (viewportWidth < 640) return 'mobile';
  if (viewportWidth < 1024) return 'tablet';
  return 'desktop';
}

export function inferSourcePageType(pathname) {
  const path = normalisePath(pathname);
  if (path === '/') return 'homepage';
  if (path === '/meal-prep-accessories') return 'accessories_hub';
  if (path === '/meal-prep-containers') return 'container_hub';
  if (path.startsWith('/meal-prep-containers/')) return 'container_specialist_guide';
  if (path.startsWith('/blog/')) return 'article';
  if (path.startsWith('/meal-plan/') || path.startsWith('/plans/')) return 'plan';
  if (path.startsWith('/tools')) return 'tool';
  return 'other';
}

export function inferRecommendationSource({ pathname, sourcePage = '', explicit = '' } = {}) {
  if (RECOMMENDATION_SOURCE_SET.has(explicit)) return explicit;

  const path = normalisePath(pathname);
  const source = String(sourcePage || '').toLowerCase();
  if (path === '/') return 'homepage';
  if (path === '/blog/best-meal-prep-containers-uk') return 'container_buying_guide';
  if (path === '/meal-prep-containers') return 'container_hub';
  if (path.startsWith('/meal-prep-containers/')) return 'container_specialist_guide';
  if (path === '/meal-prep-accessories') return 'accessories_hub';
  if (path.startsWith('/plans/') || path.startsWith('/meal-plan/')) return 'plan_derived';
  if (path.startsWith('/tools') || source.includes('chooser') || source.includes('recommender')) return 'container_chooser';
  if (path.startsWith('/blog/') && /(accessor|air-fryer|slow-cooker|rice-cooker|blender|food-safety)/.test(`${path} ${source}`)) {
    return 'accessory_guide';
  }
  return 'other';
}

export function buildAffiliateEventProperties(target, context = {}) {
  const dataset = target?.dataset || {};
  const href = target?.href || target?.getAttribute?.('href') || '';
  const pathname = context.pathname || globalThis.window?.location?.pathname || '/';
  const viewportWidth = context.viewportWidth ?? globalThis.window?.innerWidth;
  const sourceComponent = dataset.sourcePage || '';
  const listPosition = parseListPosition(dataset.listPosition);

  return compactProperties({
    product_id: dataset.productId || extractAmazonProductId(href),
    product_name: dataset.productName || dataset.offer,
    product_category: dataset.productCategory || dataset.affiliateCategory,
    source_page: normalisePath(pathname),
    source_page_type: dataset.sourcePageType || inferSourcePageType(pathname),
    placement: dataset.placement || inferPlacement(sourceComponent),
    list_position: listPosition,
    selected_problem: dataset.selectedProblem,
    viewport_category: getViewportCategory(viewportWidth),
    recommendation_source: inferRecommendationSource({
      pathname,
      sourcePage: sourceComponent,
      explicit: dataset.recommendationSource,
    }),
    source_component: sourceComponent,
    destination: href,
  });
}

export function affiliateLinkData({
  product,
  productCategory,
  sourcePage,
  sourcePageType,
  placement,
  listPosition,
  selectedProblem,
  recommendationSource,
} = {}) {
  return compactProperties({
    'data-event': AFFILIATE_PRODUCT_CLICK_EVENT,
    'data-product-id': product?.id || product?.asin,
    'data-product-name': product?.name,
    'data-product-category': productCategory || product?.category,
    'data-affiliate-category': productCategory || product?.category,
    'data-source-page': sourcePage,
    'data-source-page-type': sourcePageType,
    'data-placement': placement,
    'data-list-position': listPosition,
    'data-selected-problem': selectedProblem,
    'data-recommendation-source': recommendationSource,
    'data-offer': product?.name,
  });
}

function extractAmazonProductId(href) {
  const match = String(href || '').match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})(?:[/?]|$)/i);
  return match?.[1]?.toUpperCase() || '';
}

function inferPlacement(sourcePage) {
  const source = String(sourcePage || '').toLowerCase();
  if (source.includes('snapshot')) return 'quick_comparison_snapshot';
  if (source.includes('quick-comparison') || source.includes('quick-pick')) return 'quick_picks';
  if (source.includes('comparison-table')) return 'comparison_table';
  if (source.includes('image')) return 'product_image';
  if (source.includes('recommender') || source.includes('chooser')) return 'chooser_result';
  if (source.includes('plan') || source.includes('setup')) return 'plan_recommendation';
  return sourcePage || 'unspecified';
}

function parseListPosition(value) {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : undefined;
}

function normalisePath(value) {
  const path = String(value || '/').split(/[?#]/)[0] || '/';
  return path.startsWith('/') ? path : `/${path}`;
}

function compactProperties(properties) {
  return Object.fromEntries(Object.entries(properties).filter(([, value]) => (
    value !== undefined && value !== null && value !== ''
  )));
}
