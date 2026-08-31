// The full site search index, deliberately kept out of the module graph that
// the navbar reaches. Importing this pulls in blogSearchIndex.json plus the
// meal plan hub and combo landing catalogues, and builds a ~1000 entry index —
// work that used to happen during boot on every page because navigation.js
// exported searchSite(). SiteSearch.jsx loads this on first interaction with
// the search box and falls back to searchStaticSite() until it arrives.
import blogSearchIndex from './blogSearchIndex.json' with { type: 'json' };
import { COMBO_LANDING_PAGES } from './comboLandingPages.js';
import { MEAL_PLAN_HUBS } from './mealPlanHubs.js';
import {
  ACCESSORY_NAV_LINKS,
  CALORIE_NAV_LINKS,
  CONTAINER_NAV_LINKS,
  DIET_NAV_LINKS,
  GOAL_NAV_LINKS,
  searchEntries,
  STATIC_SEARCH_ENTRIES,
  SUPERMARKET_NAV_LINKS,
  TOOL_LINKS,
  withSearchHaystack,
} from './navigation.js';

export const SITE_SEARCH_INDEX = buildSiteSearchIndex();

export function searchSite(query, limit = 8) {
  return searchEntries(SITE_SEARCH_INDEX, query, limit);
}

function buildSiteSearchIndex() {
  return withSearchHaystack([
    ...STATIC_SEARCH_ENTRIES,
    ...GOAL_NAV_LINKS.map(link => ({
      title: `${link.label} Meal Plans`,
      to: link.to,
      type: 'Goal',
      description: link.description,
      keywords: `${link.label} goal diet plan`,
      priority: 70,
    })),
    ...SUPERMARKET_NAV_LINKS.map(link => ({
      title: `${link.label} Meal Plans`,
      to: link.to,
      type: 'Supermarket',
      description: link.description,
      keywords: `${link.label} supermarket shop weekly plan`,
      priority: 74,
    })),
    ...CALORIE_NAV_LINKS.map(link => ({
      title: `${link.label} Meal Plans`,
      to: link.to,
      type: 'Calories',
      description: link.description,
      keywords: `${link.label} calorie calories kcal target`,
      priority: 72,
    })),
    ...DIET_NAV_LINKS.map(link => ({
      title: `${link.label} Meal Plans`,
      to: link.to,
      type: 'Diet',
      description: link.description,
      keywords: `${link.label} diet vegetarian vegan pescatarian`,
      priority: 68,
    })),
    ...TOOL_LINKS.map(link => ({
      title: link.label,
      to: link.to,
      type: 'Tool',
      description: link.description,
      keywords: link.description,
      priority: 76,
    })),
    ...ACCESSORY_NAV_LINKS.map(link => ({
      title: link.label,
      to: link.to,
      type: 'Accessories',
      description: link.description,
      keywords: `${link.label} ${link.description} meal prep accessories amazon uk`,
      priority: 73,
    })),
    ...CONTAINER_NAV_LINKS.map(link => ({
      title: link.label,
      to: link.to,
      type: 'Containers',
      description: link.description,
      keywords: `${link.label} ${link.description} tubs boxes lunch freezer`,
      priority: 66,
    })),
    ...Object.values(MEAL_PLAN_HUBS).map(hub => ({
      title: hub.h1,
      to: hub.path,
      type: 'Meal plan hub',
      description: hub.description || hub.intro,
      keywords: [hub.title, hub.kicker, hub.stats?.join(' '), hub.intro].filter(Boolean).join(' '),
      priority: 62,
    })),
    ...Object.values(COMBO_LANDING_PAGES).map(page => ({
      title: page.h1,
      to: page.path,
      type: 'Meal plan hub',
      description: page.description || page.intro,
      keywords: [page.title, page.kicker, page.intro].filter(Boolean).join(' '),
      priority: 58,
    })),
    ...blogSearchIndex.map(post => ({
      title: post.title,
      to: `/blog/${post.slug}`,
      type: 'Guide',
      description: post.description,
      keywords: post.keywords,
      priority: 55,
    })),
    // Individual plans remain searchable in the full plan browser. Loading all
    // seed records here made every page download the catalogue before search.
  ]);
}
