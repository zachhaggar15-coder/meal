#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { google } from 'googleapis';
import { INDEXABLE_PLAN_SEEDS } from '../src/data/planSeeds.js';
import { blogPostsData } from '../src/data/blogPosts.js';
import { mealPlansData } from '../src/data/mealPlans.js';
import { COMBO_LANDING_PAGES } from '../src/data/comboLandingPages.js';
import { CONTAINER_GUIDES } from '../src/data/containerProducts.js';
import { MEAL_PLAN_HUBS } from '../src/data/mealPlanHubs.js';
import { SEO_PRIORITY_ROUTES } from '../src/data/seoPriorityLinks.js';
import {
  CALORIE_CHOICES,
  DIET_CHOICES,
  GOAL_CHOOSER_ITEMS,
  SUPERMARKET_CHOICES,
} from '../src/data/planChooser.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const trackerPath = path.join(rootDir, 'docs', 'search-console-weekly-tracker.csv');
const latestReportPath = path.join(rootDir, 'docs', 'weekly-analytics-report.md');
const reportDir = path.join(rootDir, 'docs', 'seo-reports');
const generatedDataPath = path.join(rootDir, 'src', 'data', 'weeklySeoInsights.js');

const INTERNAL_LANGUAGE_PATTERNS = [
  /search console/gi,
  /near-page-one/gi,
  /seo cluster/gi,
  /exact-match/gi,
  /ranking opportunity/gi,
  /query cluster/gi,
  /impression cluster/gi,
  /\bctr\b/gi,
  /\bseo\b/gi,
];

loadDotEnv(path.join(rootDir, '.env'));

const args = parseArgs(process.argv.slice(2));
const dryRun = args.has('dry-run');
const sampleMode = args.has('sample');

const options = {
  days: numberFromEnv('WEEKLY_ANALYTICS_DAYS', args.get('days'), 28),
  gscRowLimit: numberFromEnv('WEEKLY_ANALYTICS_GSC_ROW_LIMIT', args.get('gsc-row-limit'), 500),
  gaRowLimit: numberFromEnv('WEEKLY_ANALYTICS_GA_ROW_LIMIT', args.get('ga-row-limit'), 150),
  minImpressions: numberFromEnv('WEEKLY_ANALYTICS_MIN_IMPRESSIONS', args.get('min-impressions'), 50),
  strongImpressions: numberFromEnv('WEEKLY_ANALYTICS_STRONG_IMPRESSIONS', args.get('strong-impressions'), 100),
  priorityImpressions: numberFromEnv('WEEKLY_ANALYTICS_PRIORITY_IMPRESSIONS', args.get('priority-impressions'), 250),
  minPosition: numberFromEnv('WEEKLY_ANALYTICS_MIN_POSITION', args.get('min-position'), 4),
  maxPosition: numberFromEnv('WEEKLY_ANALYTICS_MAX_POSITION', args.get('max-position'), 40),
  cooldownDays: numberFromEnv('WEEKLY_ANALYTICS_COOLDOWN_DAYS', args.get('cooldown-days'), 28),
  siteUrl: process.env.SEARCH_CONSOLE_SITE_URL || args.get('site-url') || '',
  ga4PropertyId: process.env.GA4_PROPERTY_ID || args.get('ga4-property-id') || '',
};

main().catch(error => {
  console.error(error.message || error);
  process.exitCode = 1;
});

async function main() {
  const range = buildDateRange(options.days);
  const routeIndex = buildRouteIndex();
  const recentActivity = getRecentContentActivity(options.cooldownDays);
  const warnings = [];
  let currentSearchRows = [];
  let previousSearchRows = [];
  let gaLandingPages = [];

  if (sampleMode) {
    ({ currentSearchRows, previousSearchRows, gaLandingPages } = sampleAnalyticsData());
  } else {
    if (!options.siteUrl && !options.ga4PropertyId) {
      throw new Error(
        'Set SEARCH_CONSOLE_SITE_URL and/or GA4_PROPERTY_ID, or run with --sample for a local dry run.'
      );
    }

    const auth = createGoogleAuth([
      'https://www.googleapis.com/auth/webmasters.readonly',
      'https://www.googleapis.com/auth/analytics.readonly',
    ]);

    if (options.siteUrl) {
      currentSearchRows = await fetchSearchConsoleRows(auth, {
        siteUrl: options.siteUrl,
        startDate: range.current.startDate,
        endDate: range.current.endDate,
        rowLimit: options.gscRowLimit,
      });
      previousSearchRows = await fetchSearchConsoleRows(auth, {
        siteUrl: options.siteUrl,
        startDate: range.previous.startDate,
        endDate: range.previous.endDate,
        rowLimit: options.gscRowLimit,
      });
    } else {
      warnings.push('SEARCH_CONSOLE_SITE_URL is missing, so search opportunity scoring was skipped.');
    }

    if (options.ga4PropertyId) {
      try {
        gaLandingPages = await fetchGa4LandingPages(auth, {
          propertyId: options.ga4PropertyId,
          startDate: range.current.startDate,
          endDate: range.current.endDate,
          rowLimit: options.gaRowLimit,
        });
      } catch (error) {
        warnings.push(`GA4 fetch failed: ${error.message || error}`);
      }
    } else {
      warnings.push('GA4_PROPERTY_ID is missing, so GA landing page enrichment was skipped.');
    }
  }

  const analysis = buildAnalysis({
    currentSearchRows,
    previousSearchRows,
    gaLandingPages,
    range,
    routeIndex,
    recentActivity,
    warnings,
  });

  if (dryRun) {
    JSON.stringify(analysis.generatedPublicData);
    renderWeeklyReport(analysis);
    console.log(renderConsoleSummary(analysis));
    return;
  }

  writeGeneratedData(analysis);
  updateWeeklyTracker(analysis);
  writeWeeklyReports(analysis);

  console.log(renderConsoleSummary(analysis));
}

function parseArgs(values) {
  const parsed = new Map();
  for (const raw of values) {
    if (!raw.startsWith('--')) continue;
    const withoutPrefix = raw.slice(2);
    const [key, ...rest] = withoutPrefix.split('=');
    parsed.set(key, rest.length ? rest.join('=') : 'true');
  }
  return parsed;
}

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;

    process.env[key] = stripEnvQuotes(rawValue.trim());
  }
}

function stripEnvQuotes(value) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}

function numberFromEnv(envName, argValue, fallback) {
  const raw = process.env[envName] || argValue;
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function createGoogleAuth(scopes) {
  const credentials = readServiceAccountCredentials();
  const hasCredentialPath = Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS);

  if (!credentials && !hasCredentialPath) {
    throw new Error(
      'Google credentials are missing. Set GOOGLE_SERVICE_ACCOUNT_JSON, GOOGLE_APPLICATION_CREDENTIALS_JSON, or GOOGLE_APPLICATION_CREDENTIALS.'
    );
  }

  return new google.auth.GoogleAuth({
    scopes,
    ...(credentials ? { credentials } : {}),
  });
}

function readServiceAccountCredentials() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!raw) return null;

  const trimmed = raw.trim();
  const jsonText = trimmed.startsWith('{')
    ? trimmed
    : Buffer.from(trimmed, 'base64').toString('utf8');
  const credentials = JSON.parse(jsonText);

  if (credentials.private_key) {
    credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
  }

  return credentials;
}

async function fetchSearchConsoleRows(auth, { siteUrl, startDate, endDate, rowLimit }) {
  const searchconsole = google.searchconsole({ version: 'v1', auth });
  const response = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions: ['query', 'page'],
      rowLimit,
      searchType: 'web',
    },
  });

  return (response.data.rows || []).map(row => {
    const [query, page] = row.keys || [];
    return normaliseSearchRow({
      query,
      page,
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position,
    });
  }).filter(Boolean);
}

async function fetchGa4LandingPages(auth, { propertyId, startDate, endDate, rowLimit }) {
  const analyticsdata = google.analyticsdata({ version: 'v1beta', auth });
  const response = await analyticsdata.properties.runReport({
    property: normaliseGaProperty(propertyId),
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'activeUsers' },
        { name: 'engagementRate' },
      ],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: rowLimit,
    },
  });

  return (response.data.rows || []).map(row => {
    const metrics = row.metricValues || [];
    return {
      path: normalisePath(row.dimensionValues?.[0]?.value || ''),
      pageViews: numberOrZero(metrics[0]?.value),
      activeUsers: numberOrZero(metrics[1]?.value),
      engagementRate: numberOrZero(metrics[2]?.value),
    };
  }).filter(row => isPublicPagePath(row.path));
}

function normaliseGaProperty(value) {
  const property = String(value || '').trim().replace(/^properties\//, '');
  if (!property) throw new Error('GA4_PROPERTY_ID is empty.');
  return `properties/${property}`;
}

function buildDateRange(days) {
  const today = new Date();
  const currentEnd = addDays(today, -3);
  const currentStart = addDays(currentEnd, -(days - 1));
  const previousEnd = addDays(currentStart, -1);
  const previousStart = addDays(previousEnd, -(days - 1));

  return {
    generatedAt: new Date().toISOString(),
    current: {
      startDate: formatDate(currentStart),
      endDate: formatDate(currentEnd),
    },
    previous: {
      startDate: formatDate(previousStart),
      endDate: formatDate(previousEnd),
    },
  };
}

function addDays(date, days) {
  const copy = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function buildRouteIndex() {
  const routes = new Map();

  function addRoute(route, meta) {
    const pathValue = normalisePath(route);
    if (!isPublicPagePath(pathValue)) return;
    routes.set(pathValue, {
      route: pathValue,
      label: sanitisePublicText(meta.label || labelFromPath(pathValue), 90),
      type: meta.type || 'page',
      publicEligible: meta.publicEligible !== false,
      source: meta.source || 'source-route-map',
    });
  }

  addRoute('/', { label: 'MealPrep.org.uk', type: 'home' });
  addRoute('/quiz', { label: 'Meal plan quiz', type: 'tool' });
  addRoute('/browse', { label: 'Browse UK meal plans', type: 'hub' });
  addRoute('/stickers', { label: 'Meal prep stickers', type: 'promo' });
  addRoute('/meal-prep-containers', { label: 'Meal prep containers', type: 'container-guide' });
  addRoute('/blog', { label: 'Meal prep guides', type: 'blog-index' });
  addRoute('/tools', { label: 'Meal prep tools', type: 'tool' });
  addRoute('/about', { label: 'About MealPrep.org.uk', type: 'support' });
  addRoute('/contact', { label: 'Contact MealPrep.org.uk', type: 'support' });
  addRoute('/privacy', { label: 'Privacy', type: 'support', publicEligible: false });
  addRoute('/terms', { label: 'Terms', type: 'support', publicEligible: false });
  addRoute('/meal-plans', { label: 'Meal plan hub', type: 'hub' });

  for (const item of GOAL_CHOOSER_ITEMS) {
    addRoute(`/choose-plan/${item.value}`, { label: `${item.label} meal plans`, type: 'chooser' });
  }
  for (const item of SUPERMARKET_CHOICES) {
    addRoute(`/choose-supermarket/${item.value}`, { label: `${item.label} meal plans`, type: 'chooser' });
  }
  for (const item of DIET_CHOICES) {
    addRoute(`/choose-diet/${item.value}`, { label: `${item.label} meal plans`, type: 'chooser' });
  }
  for (const item of CALORIE_CHOICES) {
    addRoute(`/choose-calories/${item.value}`, { label: `${item.label} meal plans`, type: 'chooser' });
  }
  for (const page of Object.values(MEAL_PLAN_HUBS)) {
    addRoute(page.path, { label: page.h1 || page.title, type: 'meal-plan-hub' });
  }
  for (const page of Object.values(COMBO_LANDING_PAGES)) {
    addRoute(page.path, { label: page.h1 || page.title, type: 'meal-plan-hub' });
  }
  for (const page of Object.values(CONTAINER_GUIDES)) {
    addRoute(page.path, { label: page.h1 || page.title, type: 'container-guide' });
  }
  for (const seed of INDEXABLE_PLAN_SEEDS) {
    addRoute(`/plans/${seed.slug}`, {
      label: seed.title,
      type: 'generated-plan',
      publicEligible: false,
    });
  }
  for (const [slug, page] of Object.entries(mealPlansData)) {
    addRoute(`/meal-plan/${slug}`, { label: page.h1 || page.title, type: 'legacy-meal-plan' });
  }
  for (const [slug, page] of Object.entries(blogPostsData)) {
    addRoute(`/blog/${slug}`, { label: page.h1 || page.title, type: 'blog-guide' });
  }
  for (const route of SEO_PRIORITY_ROUTES) {
    addRoute(route, { label: labelFromPath(route), type: 'priority-route' });
  }

  return routes;
}

function normaliseSearchRow(row) {
  const pathValue = normalisePath(row.page);
  if (!row.query || !isPublicPagePath(pathValue)) return null;

  return {
    query: cleanText(row.query, 120),
    page: pathValue,
    clicks: numberOrZero(row.clicks),
    impressions: numberOrZero(row.impressions),
    ctr: numberOrZero(row.ctr),
    avgPosition: numberOrZero(row.position),
  };
}

function normalisePath(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';

  try {
    const url = raw.startsWith('http') ? new URL(raw) : new URL(raw, 'https://www.mealprep.org.uk');
    const pathname = decodeURIComponent(url.pathname || '/');
    return pathname.length > 1 ? pathname.replace(/\/$/, '') : '/';
  } catch {
    const withoutQuery = raw.split('?')[0].split('#')[0];
    return withoutQuery.startsWith('/') ? withoutQuery.replace(/\/$/, '') || '/' : '';
  }
}

function isPublicPagePath(value) {
  if (!value || !value.startsWith('/')) return false;
  if (value.startsWith('/api') || value.startsWith('/admin')) return false;
  if (value.includes('/_next') || value.includes('/assets')) return false;
  if (/\.(css|js|json|png|jpg|jpeg|webp|svg|ico|xml|txt|map)$/i.test(value)) return false;
  return true;
}

function buildAnalysis({ currentSearchRows, previousSearchRows, gaLandingPages, range, routeIndex, recentActivity, warnings }) {
  const unverifiedRoutes = collectUnverifiedRoutes(currentSearchRows, gaLandingPages, routeIndex);
  if (unverifiedRoutes.length) {
    warnings.push(`Skipped ${unverifiedRoutes.length} analytics rows because their routes were not in the verified route inventory.`);
  }

  const currentRows = currentSearchRows.filter(row => routeIndex.has(row.page));
  const previousRows = previousSearchRows.filter(row => routeIndex.has(row.page));
  const gaRows = gaLandingPages.filter(row => routeIndex.has(row.path));
  const previousByKey = new Map(previousRows.map(row => [searchKey(row), row]));
  const gaByPath = new Map(gaRows.map(row => [row.path, row]));

  const enrichedSearchRows = currentRows.map(row => {
    const previous = previousByKey.get(searchKey(row));
    const ga = gaByPath.get(row.page);
    const routeMeta = routeIndex.get(row.page);
    const expectedCtrValue = expectedCtr(row.avgPosition);
    const ctrGap = Math.max(0, expectedCtrValue - row.ctr);
    const opportunityClass = classifyOpportunity(row);
    const considerationLevel = classifyConsideration(row.impressions);
    const cooldown = isRouteInCooldown(row.page, routeMeta, recentActivity);
    const trend = buildTrend(row, previous);
    const score = opportunityScore({ row, ctrGap, trend, opportunityClass, considerationLevel, ga, cooldown });

    return {
      ...row,
      routeLabel: routeMeta.label,
      routeType: routeMeta.type,
      routeVerified: true,
      impressionDelta: previous ? row.impressions - previous.impressions : row.impressions,
      clickDelta: previous ? row.clicks - previous.clicks : row.clicks,
      ctrDelta: previous ? row.ctr - previous.ctr : row.ctr,
      positionDelta: previous ? previous.avgPosition - row.avgPosition : 0,
      expectedCtr: expectedCtrValue,
      opportunityScore: score,
      opportunityClass,
      considerationLevel,
      cooldown,
      trend,
      pageViews: ga?.pageViews || 0,
      activeUsers: ga?.activeUsers || 0,
      engagementRate: ga?.engagementRate || 0,
    };
  });

  const qualifiedRows = enrichedSearchRows
    .filter(row => !isLowVolumeAnomaly(row))
    .sort(compareOpportunityRows);

  const searchOpportunities = qualifiedRows
    .filter(row => (
      row.impressions >= options.minImpressions &&
      row.avgPosition >= options.minPosition &&
      row.avgPosition <= options.maxPosition &&
      row.ctr < row.expectedCtr
    ))
    .slice(0, 20)
    .map(reportOpportunityRow);

  const publicTrendingLinks = buildTrendingLinks(qualifiedRows, gaRows, routeIndex);
  const pageRollups = buildPageRollups(enrichedSearchRows, gaRows, routeIndex);
  const cannibalisationRisks = findCannibalisationRisks(enrichedSearchRows);
  const doNotEdit = buildDoNotEditList(recentActivity, searchOpportunities);
  const recommendedAction = chooseRecommendedAction({ searchOpportunities, cannibalisationRisks, doNotEdit });

  const generatedPublicData = {
    generatedAt: range.generatedAt,
    range: {
      current: range.current,
    },
    source: sampleMode ? 'sample' : 'google-analytics-and-search-console',
    trendingLinks: publicTrendingLinks,
  };

  return {
    range,
    generatedPublicData,
    enrichedSearchRows,
    searchOpportunities,
    pageRollups,
    cannibalisationRisks,
    doNotEdit,
    recommendedAction,
    recentActivity,
    unverifiedRoutes,
    warnings,
  };
}

function collectUnverifiedRoutes(searchRows, gaRows, routeIndex) {
  const rows = [
    ...searchRows.map(row => row.page),
    ...gaRows.map(row => row.path),
  ];
  return [...new Set(rows.filter(route => isPublicPagePath(route) && !routeIndex.has(route)))].sort();
}

function classifyOpportunity(row) {
  if (row.impressions < options.minImpressions && row.avgPosition <= 10) return 'low_impression_high_rank';
  if (row.avgPosition >= 4 && row.avgPosition <= 15 && row.impressions >= options.minImpressions) return 'near_page_one';
  if (row.avgPosition > 15 && row.avgPosition <= 30 && row.impressions >= options.minImpressions) return 'striking_distance';
  if (row.avgPosition > 30 && row.impressions >= options.priorityImpressions) return 'high_impression_poor_rank';
  return 'monitor';
}

function classifyConsideration(impressions) {
  if (impressions >= options.priorityImpressions) return 'priority';
  if (impressions >= options.strongImpressions) return 'strong';
  if (impressions >= options.minImpressions) return 'minor';
  return 'low_volume';
}

function buildTrend(row, previous) {
  if (!previous) return 'new_or_no_previous_period';
  const impressionDelta = row.impressions - previous.impressions;
  const clickDelta = row.clicks - previous.clicks;
  const positionDelta = previous.avgPosition - row.avgPosition;

  if (impressionDelta > options.minImpressions && positionDelta >= 1) return 'gaining_visibility';
  if (impressionDelta > options.minImpressions && clickDelta <= 0) return 'more_visibility_without_clicks';
  if (impressionDelta < -options.minImpressions || positionDelta <= -2) return 'losing_visibility';
  if (clickDelta > 0) return 'gaining_clicks';
  return 'steady';
}

function opportunityScore({ row, ctrGap, trend, opportunityClass, considerationLevel, ga, cooldown }) {
  const classBoost = {
    near_page_one: 1.6,
    striking_distance: 1.25,
    high_impression_poor_rank: 0.7,
    low_impression_high_rank: 0.25,
    monitor: 0.45,
  }[opportunityClass] || 0.5;
  const considerationBoost = {
    priority: 1.4,
    strong: 1.15,
    minor: 1,
    low_volume: 0.25,
  }[considerationLevel] || 1;
  const trendBoost = trend === 'more_visibility_without_clicks' ? 1.25 : trend === 'gaining_visibility' ? 1.15 : 1;
  const engagementBoost = ga?.engagementRate >= 0.55 ? 1.1 : 1;
  const cooldownPenalty = cooldown ? 0.35 : 1;
  return Math.round(row.impressions * Math.max(ctrGap, 0.002) * 100 * classBoost * considerationBoost * trendBoost * engagementBoost * cooldownPenalty);
}

function isLowVolumeAnomaly(row) {
  if (row.impressions < options.minImpressions) return true;
  if (row.impressions <= 10 && row.clicks <= 1) return true;
  return false;
}

function compareOpportunityRows(a, b) {
  return (
    b.opportunityScore - a.opportunityScore ||
    b.impressions - a.impressions ||
    a.avgPosition - b.avgPosition ||
    a.query.localeCompare(b.query) ||
    a.page.localeCompare(b.page)
  );
}

function reportOpportunityRow(row) {
  return {
    query: row.query,
    page: row.page,
    pageLabel: row.routeLabel,
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: round(row.ctr, 4),
    avgPosition: round(row.avgPosition, 1),
    impressionDelta: row.impressionDelta,
    clickDelta: row.clickDelta,
    ctrDelta: round(row.ctrDelta, 4),
    positionDelta: round(row.positionDelta, 1),
    opportunityClass: row.opportunityClass,
    considerationLevel: row.considerationLevel,
    cooldown: row.cooldown,
    opportunityScore: row.opportunityScore,
    recommendedAction: nextActionFor(row),
    approvalRequired: true,
  };
}

function buildTrendingLinks(searchRows, gaRows, routeIndex) {
  const byPath = new Map();

  for (const row of searchRows) {
    if (byPath.has(row.page)) continue;
    const meta = routeIndex.get(row.page);
    if (!isEligibleForPopularLink(row.page, meta, row)) continue;
    byPath.set(row.page, {
      to: row.page,
      label: sanitisePublicText(meta.label || titleCase(row.query), 90),
      description: publicDescriptionForRoute(meta, row),
      category: publicCategory(meta),
    });
  }

  for (const row of gaRows) {
    if (byPath.has(row.path)) continue;
    const meta = routeIndex.get(row.path);
    if (!isEligibleForPopularLink(row.path, meta, row)) continue;
    byPath.set(row.path, {
      to: row.path,
      label: sanitisePublicText(meta.label || labelFromPath(row.path), 90),
      description: publicDescriptionForRoute(meta, row),
      category: publicCategory(meta),
    });
  }

  return [...byPath.values()]
    .sort((a, b) => a.label.localeCompare(b.label))
    .slice(0, 8);
}

function isEligibleForPopularLink(route, meta, metrics) {
  if (!meta?.publicEligible) return false;
  if (meta.type === 'support' || route === '/privacy' || route === '/terms') return false;
  if (meta.type === 'generated-plan') {
    return (metrics.impressions >= options.strongImpressions && metrics.clicks >= 2) || metrics.pageViews >= 25;
  }
  return true;
}

function publicDescriptionForRoute(meta, row) {
  const descriptions = {
    home: 'Start with the generator, quiz and practical weekly planning tools.',
    hub: 'Compare useful routes into calorie, goal and supermarket meal plans.',
    'meal-plan-hub': 'Browse related plans, shopping-list ideas and UK supermarket options.',
    'blog-guide': 'A practical guide for planning, shopping or prepping meals in the UK.',
    'container-guide': 'Compare storage options for work lunches, freezing, batch cooking and reheating.',
    'legacy-meal-plan': 'Use this ready-made plan as a starting point, then compare related alternatives.',
    chooser: 'Narrow the plan library by a specific goal, diet, supermarket or calorie target.',
    tool: 'Use a practical tool to choose or customise your meal plan.',
    promo: 'A useful extra for organising prep, labels and weekly food planning.',
  };
  if (row?.impressionDelta > options.minImpressions || row?.pageViews > 0) {
    return descriptions[meta.type] || 'A useful MealPrep.org.uk guide readers are finding helpful.';
  }
  return descriptions[meta.type] || 'A useful MealPrep.org.uk guide for planning this week.';
}

function publicCategory(meta) {
  const categories = {
    'meal-plan-hub': 'Meal plans',
    'blog-guide': 'Guide',
    'container-guide': 'Containers',
    'legacy-meal-plan': 'Ready-made plan',
    'generated-plan': 'Ready-made plan',
    chooser: 'Plan finder',
    tool: 'Tool',
    hub: 'Meal plans',
  };
  return categories[meta.type] || 'Guide';
}

function buildPageRollups(rows, gaRows, routeIndex) {
  const byPage = new Map();
  for (const row of rows) {
    const current = byPage.get(row.page) || {
      page: row.page,
      label: routeIndex.get(row.page)?.label || labelFromPath(row.page),
      clicks: 0,
      impressions: 0,
      bestPosition: Infinity,
      weightedPositionTotal: 0,
      weightedPositionCount: 0,
      queries: new Set(),
      impressionDelta: 0,
      clickDelta: 0,
    };
    current.clicks += row.clicks;
    current.impressions += row.impressions;
    current.bestPosition = Math.min(current.bestPosition, row.avgPosition);
    current.weightedPositionTotal += row.avgPosition * Math.max(row.impressions, 1);
    current.weightedPositionCount += Math.max(row.impressions, 1);
    current.queries.add(row.query);
    current.impressionDelta += row.impressionDelta;
    current.clickDelta += row.clickDelta;
    byPage.set(row.page, current);
  }

  const gaByPath = new Map(gaRows.map(row => [row.path, row]));
  const rollups = [...byPage.values()].map(row => {
    const ga = gaByPath.get(row.page);
    return {
      page: row.page,
      label: row.label,
      clicks: row.clicks,
      impressions: row.impressions,
      bestPosition: round(row.bestPosition === Infinity ? 0 : row.bestPosition, 1),
      avgPosition: round(row.weightedPositionTotal / Math.max(row.weightedPositionCount, 1), 1),
      queryCount: row.queries.size,
      impressionDelta: row.impressionDelta,
      clickDelta: row.clickDelta,
      pageViews: ga?.pageViews || 0,
      activeUsers: ga?.activeUsers || 0,
      engagementRate: ga?.engagementRate || 0,
    };
  });

  return {
    byClicks: [...rollups].sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions || a.page.localeCompare(b.page)).slice(0, 5),
    byImpressions: [...rollups].sort((a, b) => b.impressions - a.impressions || b.clicks - a.clicks || a.page.localeCompare(b.page)).slice(0, 5),
    byPosition: [...rollups]
      .filter(row => row.impressions >= options.minImpressions)
      .sort((a, b) => a.bestPosition - b.bestPosition || b.impressions - a.impressions || a.page.localeCompare(b.page))
      .slice(0, 5),
    byEngagement: [...rollups]
      .filter(row => row.pageViews > 0)
      .sort((a, b) => b.engagementRate - a.engagementRate || b.pageViews - a.pageViews || a.page.localeCompare(b.page))
      .slice(0, 5),
    gaining: [...rollups].sort((a, b) => b.impressionDelta - a.impressionDelta || b.clickDelta - a.clickDelta || a.page.localeCompare(b.page)).slice(0, 5),
    losing: [...rollups].sort((a, b) => a.impressionDelta - b.impressionDelta || a.clickDelta - b.clickDelta || a.page.localeCompare(b.page)).slice(0, 5),
  };
}

function findCannibalisationRisks(rows) {
  const intentMap = new Map();
  for (const row of rows) {
    if (row.impressions < options.minImpressions) continue;
    const intent = normaliseIntent(row.query);
    if (!intent) continue;
    const entry = intentMap.get(intent) || new Map();
    const current = entry.get(row.page) || { page: row.page, label: row.routeLabel, impressions: 0, clicks: 0, bestPosition: Infinity };
    current.impressions += row.impressions;
    current.clicks += row.clicks;
    current.bestPosition = Math.min(current.bestPosition, row.avgPosition);
    entry.set(row.page, current);
    intentMap.set(intent, entry);
  }

  return [...intentMap.entries()]
    .map(([intent, pages]) => ({
      intent,
      pages: [...pages.values()].sort((a, b) => b.impressions - a.impressions || a.bestPosition - b.bestPosition),
    }))
    .filter(group => group.pages.length > 1)
    .sort((a, b) => totalImpressions(b.pages) - totalImpressions(a.pages) || a.intent.localeCompare(b.intent))
    .slice(0, 8);
}

function normaliseIntent(query) {
  const stopWords = new Set(['uk', 'best', 'free', 'simple', 'easy', 'guide', 'guides', 'plan', 'plans', 'meal', 'meals']);
  const words = String(query || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
  return words.slice(0, 5).join(' ');
}

function totalImpressions(pages) {
  return pages.reduce((total, page) => total + page.impressions, 0);
}

function buildDoNotEditList(recentActivity, opportunities) {
  const cooldownRoutes = new Set(opportunities.filter(row => row.cooldown).map(row => row.page));
  const routeItems = [...cooldownRoutes].map(route => ({
    item: route,
    reason: `Recent source changes detected in the last ${options.cooldownDays} days; wait for more data unless there is a factual, UX or broken-link issue.`,
  }));

  const sourceItems = recentActivity.files.slice(0, 10).map(file => ({
    item: file,
    reason: 'Recently changed source file; avoid broad follow-up rewrites without a fresh reason.',
  }));

  return [...routeItems, ...sourceItems].slice(0, 12);
}

function chooseRecommendedAction({ searchOpportunities, cannibalisationRisks, doNotEdit }) {
  const eligible = searchOpportunities.find(row => !row.cooldown && ['near_page_one', 'striking_distance'].includes(row.opportunityClass));
  if (eligible) {
    return {
      action: 'Improve one existing page after approval',
      page: eligible.page,
      query: eligible.query,
      why: 'This has enough impressions, a verified existing route and a realistic position range. It is safer than creating another page.',
      approvalRequired: true,
      newPageJustified: false,
    };
  }

  if (cannibalisationRisks.length) {
    return {
      action: 'Review one cannibalisation cluster after approval',
      page: cannibalisationRisks[0].pages[0]?.page || '',
      query: cannibalisationRisks[0].intent,
      why: 'Multiple verified pages appear to overlap on one intent, so consolidation or clearer internal linking is safer than adding content.',
      approvalRequired: true,
      newPageJustified: false,
    };
  }

  return {
    action: 'Do nothing and wait for more data',
    page: '',
    query: '',
    why: doNotEdit.length
      ? 'Current opportunities are either too noisy or within the cooldown window.'
      : 'No strong verified opportunity met the data thresholds this week.',
    approvalRequired: true,
    newPageJustified: false,
  };
}

function isRouteInCooldown(route, routeMeta, recentActivity) {
  if (!recentActivity.files.length) return false;
  const files = recentActivity.files;
  if (route === '/' && files.includes('src/pages/Home.jsx')) return true;
  if (route === '/browse' && files.includes('src/pages/BrowsePlans.jsx')) return true;
  if (route.startsWith('/blog/') && files.some(file => file.startsWith('src/data/blogPosts') || file.startsWith('src/data/expandedBlogPosts') || file.startsWith('src/data/containerBlogPosts'))) return true;
  if (route.startsWith('/meal-plans/') && files.includes('src/data/mealPlanHubs.js')) return true;
  if (route.startsWith('/meal-plan/') && files.includes('src/data/mealPlans.js')) return true;
  if (route.startsWith('/meal-prep-containers') && files.includes('src/data/containerProducts.js')) return true;
  if (route.startsWith('/plans/') && files.includes('src/data/planSeeds.js')) return true;
  return routeMeta?.source && files.includes(routeMeta.source);
}

function getRecentContentActivity(days) {
  const paths = [
    'src/data',
    'src/pages',
    'src/components',
    'prerender.js',
  ];

  try {
    const output = execFileSync('git', ['log', `--since=${days} days ago`, '--name-only', '--pretty=format:', '--', ...paths], {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const files = [...new Set(output.split(/\r?\n/).map(line => line.trim()).filter(Boolean))]
      .filter(file => !file.includes('weeklySeoInsights') && !file.includes('WeeklyTrendingLinks'))
      .sort();
    return { days, files };
  } catch {
    return { days, files: [] };
  }
}

function searchKey(row) {
  return `${row.query.toLowerCase()}\u0000${row.page}`;
}

function expectedCtr(position) {
  if (position <= 3) return 0.12;
  if (position <= 5) return 0.08;
  if (position <= 10) return 0.045;
  if (position <= 20) return 0.025;
  if (position <= 40) return 0.012;
  return 0.006;
}

function nextActionFor(row) {
  if (row.cooldown) {
    return 'Monitor for now because this page is inside the recent-edit cooldown window.';
  }
  if (row.opportunityClass === 'near_page_one') {
    return 'Plan one approved improvement to title/meta, intro clarity, snippet answer or natural internal links.';
  }
  if (row.opportunityClass === 'striking_distance') {
    return 'Plan one approved content-depth or hub-linking improvement if the route already satisfies the intent.';
  }
  if (row.opportunityClass === 'high_impression_poor_rank') {
    return 'Diagnose intent fit, page quality and authority first; do not create a new page by default.';
  }
  if (row.opportunityClass === 'low_impression_high_rank') {
    return 'Use as supporting evidence or internal-link destination, not a major edit trigger.';
  }
  return 'Monitor until the data is stronger.';
}

function writeGeneratedData(analysis) {
  ensureDir(path.dirname(generatedDataPath));
  const body = `// Generated by scripts/weekly-analytics-improvements.js. Do not edit manually.\n` +
    `// Public-safe frontend data only: raw analytics metrics stay in docs reports.\n\n` +
    `export const WEEKLY_SEO_INSIGHTS = ${JSON.stringify(analysis.generatedPublicData, null, 2)};\n\n` +
    `export const WEEKLY_TRENDING_LINKS = WEEKLY_SEO_INSIGHTS.trendingLinks;\n` +
    `export const WEEKLY_SEARCH_OPPORTUNITIES = [];\n` +
    `export const WEEKLY_GA_LANDING_PAGES = [];\n`;
  fs.writeFileSync(generatedDataPath, body, 'utf8');
}

function updateWeeklyTracker(analysis) {
  ensureDir(path.dirname(trackerPath));
  const runDate = analysis.range.current.endDate;
  const header = [
    'date',
    'query',
    'page',
    'impressions',
    'clicks',
    'ctr',
    'avg_position',
    '28_day_impression_delta',
    '28_day_click_delta',
    'opportunity_class',
    'consideration_level',
    'route_verified',
    'cooldown',
    'action_taken',
    'next_action',
  ];

  const existingLines = fs.existsSync(trackerPath)
    ? fs.readFileSync(trackerPath, 'utf8').split(/\r?\n/).filter(Boolean)
    : [];
  const existingData = existingLines.slice(1).filter(line => !line.startsWith(`${runDate},`));
  const generatedPaths = new Set(analysis.generatedPublicData.trendingLinks.map(link => link.to));

  const rows = analysis.enrichedSearchRows
    .filter(row => row.impressions >= options.minImpressions)
    .sort(compareOpportunityRows)
    .slice(0, 60)
    .map(row => [
      runDate,
      row.query,
      row.page,
      row.impressions,
      row.clicks,
      `${round(row.ctr * 100, 2)}%`,
      round(row.avgPosition, 1),
      row.impressionDelta,
      row.clickDelta,
      row.opportunityClass,
      row.considerationLevel,
      row.routeVerified ? 'yes' : 'no',
      row.cooldown ? 'yes' : 'no',
      generatedPaths.has(row.page) ? 'added_to_public_weekly_links' : 'report_only',
      nextActionFor(row),
    ].map(csvCell).join(','));

  fs.writeFileSync(trackerPath, [header.join(','), ...existingData, ...rows, ''].join('\n'), 'utf8');
}

function writeWeeklyReports(analysis) {
  ensureDir(reportDir);
  const report = renderWeeklyReport(analysis);
  const datedReportPath = path.join(reportDir, `${analysis.range.current.endDate}.md`);
  fs.writeFileSync(datedReportPath, report, 'utf8');
  fs.writeFileSync(latestReportPath, report, 'utf8');
}

function renderWeeklyReport(analysis) {
  const lines = [
    '# Weekly Analytics SEO Report',
    '',
    `Generated: ${analysis.range.generatedAt}`,
    `Current range: ${analysis.range.current.startDate} to ${analysis.range.current.endDate}`,
    `Previous range: ${analysis.range.previous.startDate} to ${analysis.range.previous.endDate}`,
    `Source: ${sampleMode ? 'sample data' : 'GA4 and Google Search Console'}`,
    '',
    '## Automation Boundary',
    '',
    '- Automated run may update generated insight data, tracker CSV and report files.',
    '- Automated run must not rewrite blog posts, meal plans, metadata, routes or long-form copy.',
    '- Any editorial/content change requires a human-reviewed plan and approval.',
    '',
  ];

  if (analysis.warnings.length) {
    lines.push('## Warnings', '');
    for (const warning of analysis.warnings) lines.push(`- ${warning}`);
    lines.push('');
  }

  lines.push('## Automated Data Observations', '');
  lines.push(`- Public "Popular this week" links generated: ${analysis.generatedPublicData.trendingLinks.length}`);
  lines.push(`- Verified route rows analysed: ${analysis.enrichedSearchRows.length}`);
  lines.push(`- Unverified route rows skipped: ${analysis.unverifiedRoutes.length}`);
  lines.push(`- Cooldown window: ${options.cooldownDays} days`);
  lines.push(`- Impression thresholds: ${options.minImpressions} minor, ${options.strongImpressions} strong, ${options.priorityImpressions} priority`);
  lines.push('');

  lines.push('## Public Links Written', '');
  if (analysis.generatedPublicData.trendingLinks.length) {
    for (const link of analysis.generatedPublicData.trendingLinks) {
      lines.push(`- ${link.label} -> ${link.to} (${link.category})`);
    }
  } else {
    lines.push('- No public links were generated.');
  }
  lines.push('');

  lines.push('## Top Page Opportunities', '');
  writeOpportunityTable(lines, analysis.searchOpportunities.slice(0, 10));

  lines.push('## Top Query Opportunities', '');
  writeOpportunityTable(lines, analysis.searchOpportunities.slice(0, 10), true);

  lines.push('## Pages Gaining Traction', '');
  writePageTable(lines, analysis.pageRollups.gaining);

  lines.push('## Pages Losing Traction', '');
  writePageTable(lines, analysis.pageRollups.losing);

  lines.push('## High-Performing Pages To Learn From', '');
  lines.push('### Top 5 By Clicks', '');
  writePageTable(lines, analysis.pageRollups.byClicks);
  lines.push('### Top 5 By Impressions', '');
  writePageTable(lines, analysis.pageRollups.byImpressions);
  lines.push('### Strongest Positions With Meaningful Impressions', '');
  writePageTable(lines, analysis.pageRollups.byPosition);
  lines.push('### Best GA4 Engagement Where Available', '');
  writePageTable(lines, analysis.pageRollups.byEngagement, true);

  lines.push('## Cannibalisation Risks', '');
  if (analysis.cannibalisationRisks.length) {
    for (const risk of analysis.cannibalisationRisks) {
      const pages = risk.pages.slice(0, 4).map(page => `${page.page} (${page.impressions} impressions)`).join('; ');
      lines.push(`- Intent "${risk.intent}": ${pages}`);
    }
  } else {
    lines.push('- No obvious multi-page intent overlap crossed the current threshold.');
  }
  lines.push('');

  lines.push('## Do Not Edit This Week', '');
  if (analysis.doNotEdit.length) {
    for (const item of analysis.doNotEdit) lines.push(`- ${item.item}: ${item.reason}`);
  } else {
    lines.push('- No cooldown items detected from recent source history.');
  }
  lines.push('');

  lines.push('## Recommended Action For The Week', '');
  lines.push(`- Action: ${analysis.recommendedAction.action}`);
  if (analysis.recommendedAction.page) lines.push(`- Page: ${analysis.recommendedAction.page}`);
  if (analysis.recommendedAction.query) lines.push(`- Query/intent: ${analysis.recommendedAction.query}`);
  lines.push(`- Why: ${analysis.recommendedAction.why}`);
  lines.push(`- New page justified: ${analysis.recommendedAction.newPageJustified ? 'yes' : 'no'}`);
  lines.push(`- Approval required: ${analysis.recommendedAction.approvalRequired ? 'yes' : 'yes'}`);
  lines.push('');

  lines.push('## Actions Requiring Approval', '');
  lines.push('- Any title/meta, intro, article, route, meal-plan, hub or internal-link edit.');
  lines.push('- Any new page brief or page creation.');
  lines.push('- Any consolidation or redirect.');
  lines.push('');

  lines.push('## Actions Not Recommended', '');
  lines.push('- Do not create pages from one-off or low-volume queries.');
  lines.push('- Do not rewrite pages inside the cooldown window unless there is a factual, UX or broken-link issue.');
  lines.push('- Do not expose analytics language such as CTR, impressions or query clusters in user-facing copy.');
  lines.push('');

  lines.push('## Suggested Pages To Request Indexing After Approved Edits', '');
  const indexingTargets = analysis.searchOpportunities
    .filter(row => !row.cooldown)
    .slice(0, 5)
    .map(row => row.page);
  if (indexingTargets.length) {
    for (const route of [...new Set(indexingTargets)]) lines.push(`- https://www.mealprep.org.uk${route}`);
  } else {
    lines.push('- None this week.');
  }
  lines.push('');

  lines.push('## Risks To Watch', '');
  lines.push('- Stale prices or product claims if any product copy is edited later.');
  lines.push('- Cannibalisation if new pages are created instead of improving the best existing route.');
  lines.push('- Low-quality AI copy if reports are turned into broad rewrites without approval.');
  lines.push('- Broken links if future internal links are added without route verification.');
  lines.push('- Layout issues if large link blocks are added to compact pages.');
  lines.push('');

  lines.push('## Human-Reviewed Edit Limit', '');
  lines.push('- At most one major page improvement.');
  lines.push('- At most one minor metadata/internal-linking sweep.');
  lines.push('- At most one consolidation/cannibalisation fix.');
  lines.push('- Optional one new page brief only; do not create it without explicit approval.');
  lines.push('');

  return lines.join('\n');
}

function writeOpportunityTable(lines, rows, queryFirst = false) {
  if (!rows.length) {
    lines.push('- No qualifying opportunities crossed the thresholds.', '');
    return;
  }
  const header = queryFirst
    ? '| Query | Page | Class | Impressions | Clicks | CTR | Position | Cooldown | Recommended action |'
    : '| Page | Query | Class | Impressions | Clicks | CTR | Position | Cooldown | Recommended action |';
  lines.push(header);
  lines.push('| --- | --- | --- | ---: | ---: | ---: | ---: | --- | --- |');
  for (const row of rows) {
    const first = queryFirst ? row.query : row.page;
    const second = queryFirst ? row.page : row.query;
    lines.push(`| ${mdCell(first)} | ${mdCell(second)} | ${row.opportunityClass} | ${row.impressions} | ${row.clicks} | ${round(row.ctr * 100, 2)}% | ${row.avgPosition} | ${row.cooldown ? 'yes' : 'no'} | ${mdCell(row.recommendedAction)} |`);
  }
  lines.push('');
}

function writePageTable(lines, rows, includeEngagement = false) {
  if (!rows.length) {
    lines.push('- No qualifying pages.', '');
    return;
  }
  const header = includeEngagement
    ? '| Page | Clicks | Impressions | Avg position | Views | Engagement |'
    : '| Page | Clicks | Impressions | Avg position | Delta impressions | Delta clicks |';
  lines.push(header);
  lines.push('| --- | ---: | ---: | ---: | ---: | ---: |');
  for (const row of rows) {
    if (includeEngagement) {
      lines.push(`| ${mdCell(row.page)} | ${row.clicks} | ${row.impressions} | ${row.avgPosition} | ${row.pageViews} | ${round(row.engagementRate * 100, 2)}% |`);
    } else {
      lines.push(`| ${mdCell(row.page)} | ${row.clicks} | ${row.impressions} | ${row.avgPosition} | ${row.impressionDelta} | ${row.clickDelta} |`);
    }
  }
  lines.push('');
}

function renderConsoleSummary(analysis) {
  return [
    `Weekly analytics range: ${analysis.range.current.startDate} to ${analysis.range.current.endDate}`,
    `Public trending links: ${analysis.generatedPublicData.trendingLinks.length}`,
    `Search opportunities: ${analysis.searchOpportunities.length}`,
    `Verified rows: ${analysis.enrichedSearchRows.length}`,
    `Unverified routes skipped: ${analysis.unverifiedRoutes.length}`,
    `Recommended action: ${analysis.recommendedAction.action}`,
    ...(analysis.warnings.length ? [`Warnings: ${analysis.warnings.join(' | ')}`] : []),
  ].join('\n');
}

function sampleAnalyticsData() {
  const currentSearchRows = [
    normaliseSearchRow({ query: 'cheap protein sources uk', page: 'https://www.mealprep.org.uk/blog/cheap-protein-sources-uk-supermarkets', impressions: 740, clicks: 19, ctr: 0.0257, position: 9.8 }),
    normaliseSearchRow({ query: 'best meal prep containers uk', page: 'https://www.mealprep.org.uk/meal-prep-containers', impressions: 620, clicks: 4, ctr: 0.0065, position: 12.4 }),
    normaliseSearchRow({ query: '1500 calorie meal plan uk', page: 'https://www.mealprep.org.uk/meal-plans/1500-calorie', impressions: 410, clicks: 8, ctr: 0.0195, position: 10.7 }),
    normaliseSearchRow({ query: 'high protein lunch ideas uk', page: 'https://www.mealprep.org.uk/blog/high-protein-lunches-for-work-uk', impressions: 160, clicks: 5, ctr: 0.0313, position: 8.9 }),
    normaliseSearchRow({ query: 'one weird low volume query', page: 'https://www.mealprep.org.uk/blog/no-such-page', impressions: 1, clicks: 1, ctr: 1, position: 1 }),
  ].filter(Boolean);

  const previousSearchRows = [
    normaliseSearchRow({ query: 'cheap protein sources uk', page: 'https://www.mealprep.org.uk/blog/cheap-protein-sources-uk-supermarkets', impressions: 510, clicks: 11, ctr: 0.0216, position: 11.2 }),
    normaliseSearchRow({ query: 'best meal prep containers uk', page: 'https://www.mealprep.org.uk/meal-prep-containers', impressions: 590, clicks: 3, ctr: 0.0051, position: 13.1 }),
    normaliseSearchRow({ query: '1500 calorie meal plan uk', page: 'https://www.mealprep.org.uk/meal-plans/1500-calorie', impressions: 380, clicks: 7, ctr: 0.0184, position: 10.9 }),
  ].filter(Boolean);

  const gaLandingPages = [
    { path: '/', pageViews: 1200, activeUsers: 760, engagementRate: 0.61 },
    { path: '/browse', pageViews: 840, activeUsers: 530, engagementRate: 0.58 },
    { path: '/meal-prep-containers', pageViews: 420, activeUsers: 300, engagementRate: 0.52 },
    { path: '/blog/cheap-protein-sources-uk-supermarkets', pageViews: 330, activeUsers: 220, engagementRate: 0.64 },
  ];

  return { currentSearchRows, previousSearchRows, gaLandingPages };
}

function titleCase(value) {
  return cleanText(value, 90)
    .toLowerCase()
    .replace(/\b[a-z][a-z'.-]*/g, word => {
      const upper = { uk: 'UK', ai: 'AI', faq: 'FAQ', pdf: 'PDF', ga4: 'GA4' }[word];
      return upper || word.charAt(0).toUpperCase() + word.slice(1);
    });
}

function labelFromPath(value) {
  if (value === '/') return 'Home';
  const last = value.split('/').filter(Boolean).pop() || value;
  return last.replace(/-/g, ' ');
}

function sanitisePublicText(value, maxLength) {
  let text = cleanText(value, maxLength);
  for (const pattern of INTERNAL_LANGUAGE_PATTERNS) {
    text = text.replace(pattern, '');
  }
  return cleanText(text.replace(/\s{2,}/g, ' '), maxLength) || 'Meal prep guide';
}

function cleanText(value, maxLength) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function csvCell(value) {
  const text = String(value ?? '');
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function mdCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function numberOrZero(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function round(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round(numberOrZero(value) * factor) / factor;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}
