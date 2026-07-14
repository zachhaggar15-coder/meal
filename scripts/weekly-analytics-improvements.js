#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { google } from 'googleapis';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const trackerPath = path.join(rootDir, 'docs', 'search-console-weekly-tracker.csv');
const reportPath = path.join(rootDir, 'docs', 'weekly-analytics-report.md');
const generatedDataPath = path.join(rootDir, 'src', 'data', 'weeklySeoInsights.js');

loadDotEnv(path.join(rootDir, '.env'));

const args = parseArgs(process.argv.slice(2));
const dryRun = args.has('dry-run');
const sampleMode = args.has('sample');

const options = {
  days: numberFromEnv('WEEKLY_ANALYTICS_DAYS', args.get('days'), 28),
  gscRowLimit: numberFromEnv('WEEKLY_ANALYTICS_GSC_ROW_LIMIT', args.get('gsc-row-limit'), 250),
  gaRowLimit: numberFromEnv('WEEKLY_ANALYTICS_GA_ROW_LIMIT', args.get('ga-row-limit'), 100),
  minImpressions: numberFromEnv('WEEKLY_ANALYTICS_MIN_IMPRESSIONS', args.get('min-impressions'), 25),
  minPosition: numberFromEnv('WEEKLY_ANALYTICS_MIN_POSITION', args.get('min-position'), 8),
  maxPosition: numberFromEnv('WEEKLY_ANALYTICS_MAX_POSITION', args.get('max-position'), 40),
  siteUrl: process.env.SEARCH_CONSOLE_SITE_URL || args.get('site-url') || '',
  ga4PropertyId: process.env.GA4_PROPERTY_ID || args.get('ga4-property-id') || '',
};

main().catch(error => {
  console.error(error.message || error);
  process.exitCode = 1;
});

async function main() {
  const range = buildDateRange(options.days);
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
    warnings,
  });

  if (dryRun) {
    console.log(renderConsoleSummary(analysis));
    return;
  }

  writeGeneratedData(analysis);
  updateWeeklyTracker(analysis);
  writeWeeklyReport(analysis);

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

function buildAnalysis({ currentSearchRows, previousSearchRows, gaLandingPages, range, warnings }) {
  const previousByKey = new Map(previousSearchRows.map(row => [searchKey(row), row]));
  const gaByPath = new Map(gaLandingPages.map(row => [row.path, row]));

  const enrichedSearchRows = currentSearchRows.map(row => {
    const previous = previousByKey.get(searchKey(row));
    const ga = gaByPath.get(row.page);
    const expectedCtrValue = expectedCtr(row.avgPosition);
    const ctrGap = Math.max(0, expectedCtrValue - row.ctr);
    const positionBoost = row.avgPosition <= 10 ? 1.6 : row.avgPosition <= 20 ? 1.25 : 1;
    const momentumBoost = previous ? Math.max(0, row.impressions - previous.impressions) * 0.15 : 0;
    const score = Math.round((row.impressions * ctrGap * 100 * positionBoost) + momentumBoost);

    return {
      ...row,
      impressionDelta: previous ? row.impressions - previous.impressions : row.impressions,
      clickDelta: previous ? row.clicks - previous.clicks : row.clicks,
      expectedCtr: expectedCtrValue,
      opportunityScore: score,
      pageViews: ga?.pageViews || 0,
      activeUsers: ga?.activeUsers || 0,
    };
  });

  const searchOpportunities = enrichedSearchRows
    .filter(row => (
      row.impressions >= options.minImpressions &&
      row.avgPosition >= options.minPosition &&
      row.avgPosition <= options.maxPosition &&
      row.ctr < row.expectedCtr
    ))
    .sort((a, b) => b.opportunityScore - a.opportunityScore)
    .slice(0, 12)
    .map(row => ({
      query: row.query,
      to: row.page,
      label: titleCase(row.query),
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: round(row.ctr, 4),
      avgPosition: round(row.avgPosition, 1),
      impressionDelta: row.impressionDelta,
      clickDelta: row.clickDelta,
      opportunityScore: row.opportunityScore,
      nextAction: nextActionFor(row),
    }));

  const generatedData = {
    generatedAt: range.generatedAt,
    range,
    source: sampleMode ? 'sample' : 'google-analytics-and-search-console',
    warnings,
    trendingLinks: buildTrendingLinks(enrichedSearchRows, gaLandingPages),
    searchOpportunities,
    gaLandingPages: gaLandingPages.slice(0, 12).map(row => ({
      to: row.path,
      label: titleCase(labelFromPath(row.path)),
      pageViews: row.pageViews,
      activeUsers: row.activeUsers,
      engagementRate: round(row.engagementRate, 4),
    })),
  };

  return {
    range,
    generatedData,
    enrichedSearchRows,
  };
}

function buildTrendingLinks(searchRows, gaLandingPages) {
  const byPath = new Map();

  for (const row of [...searchRows].sort((a, b) => trendingScore(b) - trendingScore(a))) {
    if (byPath.has(row.page)) continue;
    byPath.set(row.page, {
      to: row.page,
      label: titleCase(row.query),
      sourceQuery: row.query,
      clicks: row.clicks,
      impressions: row.impressions,
      avgPosition: round(row.avgPosition, 1),
      pageViews: row.pageViews,
      reason: row.impressionDelta > 0 ? 'rising search demand' : 'current search demand',
    });
  }

  for (const row of gaLandingPages) {
    if (byPath.has(row.path)) continue;
    byPath.set(row.path, {
      to: row.path,
      label: titleCase(labelFromPath(row.path)),
      sourceQuery: '',
      clicks: 0,
      impressions: 0,
      avgPosition: 0,
      pageViews: row.pageViews,
      reason: 'top GA4 landing page',
    });
  }

  return [...byPath.values()]
    .filter(link => isPublicPagePath(link.to))
    .slice(0, 8);
}

function trendingScore(row) {
  return (row.clicks * 12) + row.impressions + Math.max(0, row.impressionDelta * 0.5) + row.pageViews;
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
  const query = row.query.replace(/"/g, "'");
  if (row.clicks === 0) {
    return `Strengthen snippet, quick answer and internal links for "${query}".`;
  }
  if (row.avgPosition <= 15) {
    return `Tighten title/meta and above-fold copy around "${query}".`;
  }
  return `Add supporting internal links and answer coverage for "${query}".`;
}

function writeGeneratedData(analysis) {
  ensureDir(path.dirname(generatedDataPath));
  const body = `// Generated by scripts/weekly-analytics-improvements.js. Do not edit manually.\n\n` +
    `export const WEEKLY_SEO_INSIGHTS = ${JSON.stringify(analysis.generatedData, null, 2)};\n\n` +
    `export const WEEKLY_TRENDING_LINKS = WEEKLY_SEO_INSIGHTS.trendingLinks;\n` +
    `export const WEEKLY_SEARCH_OPPORTUNITIES = WEEKLY_SEO_INSIGHTS.searchOpportunities;\n` +
    `export const WEEKLY_GA_LANDING_PAGES = WEEKLY_SEO_INSIGHTS.gaLandingPages;\n`;
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
    'action_taken',
    'next_action',
  ];

  const existingLines = fs.existsSync(trackerPath)
    ? fs.readFileSync(trackerPath, 'utf8').split(/\r?\n/).filter(Boolean)
    : [];
  const existingData = existingLines.slice(1).filter(line => !line.startsWith(`${runDate},`));
  const generatedPaths = new Set(analysis.generatedData.trendingLinks.map(link => link.to));

  const rows = analysis.enrichedSearchRows
    .filter(row => row.impressions >= options.minImpressions)
    .sort((a, b) => b.opportunityScore - a.opportunityScore)
    .slice(0, 40)
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
      generatedPaths.has(row.page) ? 'added_to_weekly_popular_links' : 'flagged_for_review',
      nextActionFor(row),
    ].map(csvCell).join(','));

  fs.writeFileSync(trackerPath, [header.join(','), ...existingData, ...rows, ''].join('\n'), 'utf8');
}

function writeWeeklyReport(analysis) {
  ensureDir(path.dirname(reportPath));
  const { generatedData } = analysis;
  const lines = [
    '# Weekly Analytics SEO Report',
    '',
    `Generated: ${generatedData.generatedAt}`,
    `Current range: ${generatedData.range.current.startDate} to ${generatedData.range.current.endDate}`,
    `Previous range: ${generatedData.range.previous.startDate} to ${generatedData.range.previous.endDate}`,
    `Source: ${generatedData.source}`,
    '',
  ];

  if (generatedData.warnings.length) {
    lines.push('## Warnings', '');
    for (const warning of generatedData.warnings) lines.push(`- ${warning}`);
    lines.push('');
  }

  lines.push('## Site Updates Written', '');
  if (generatedData.trendingLinks.length) {
    for (const link of generatedData.trendingLinks) {
      const metrics = link.impressions
        ? `${link.impressions} impressions, ${link.clicks} clicks, avg position ${link.avgPosition}`
        : `${link.pageViews} GA4 page views`;
      lines.push(`- ${link.label} -> ${link.to} (${metrics})`);
    }
  } else {
    lines.push('- No weekly links were generated.');
  }

  lines.push('', '## Search Opportunities', '');
  if (generatedData.searchOpportunities.length) {
    lines.push('| Query | Page | Impressions | Clicks | CTR | Avg position | Next action |');
    lines.push('| --- | --- | ---: | ---: | ---: | ---: | --- |');
    for (const row of generatedData.searchOpportunities.slice(0, 10)) {
      lines.push(`| ${mdCell(row.query)} | ${mdCell(row.to)} | ${row.impressions} | ${row.clicks} | ${round(row.ctr * 100, 2)}% | ${row.avgPosition} | ${mdCell(row.nextAction)} |`);
    }
  } else {
    lines.push('No Search Console opportunities matched the current thresholds.');
  }

  lines.push('', '## GA4 Landing Pages', '');
  if (generatedData.gaLandingPages.length) {
    lines.push('| Page | Views | Active users | Engagement rate |');
    lines.push('| --- | ---: | ---: | ---: |');
    for (const row of generatedData.gaLandingPages.slice(0, 10)) {
      lines.push(`| ${mdCell(row.to)} | ${row.pageViews} | ${row.activeUsers} | ${round(row.engagementRate * 100, 2)}% |`);
    }
  } else {
    lines.push('No GA4 landing page data was available.');
  }

  lines.push(
    '',
    '## Review Notes',
    '',
    '- The generated frontend links are intentionally low-risk freshness updates.',
    '- Use the Search Opportunities table for deeper title, meta, quick-answer and internal-link edits.',
    '- Re-run `npm run analytics:weekly` after adding or changing analytics credentials.',
    ''
  );

  fs.writeFileSync(reportPath, lines.join('\n'), 'utf8');
}

function renderConsoleSummary(analysis) {
  const data = analysis.generatedData;
  return [
    `Weekly analytics range: ${data.range.current.startDate} to ${data.range.current.endDate}`,
    `Trending links: ${data.trendingLinks.length}`,
    `Search opportunities: ${data.searchOpportunities.length}`,
    `GA4 landing pages: ${data.gaLandingPages.length}`,
    ...(data.warnings.length ? [`Warnings: ${data.warnings.join(' | ')}`] : []),
  ].join('\n');
}

function sampleAnalyticsData() {
  const currentSearchRows = [
    normaliseSearchRow({ query: 'cheap protein sources uk', page: 'https://www.mealprep.org.uk/blog/cheap-protein-sources-uk-supermarkets', impressions: 740, clicks: 19, ctr: 0.0257, position: 9.8 }),
    normaliseSearchRow({ query: 'best meal prep containers uk', page: 'https://www.mealprep.org.uk/meal-prep-containers', impressions: 620, clicks: 4, ctr: 0.0065, position: 12.4 }),
    normaliseSearchRow({ query: '1500 calorie meal plan uk', page: 'https://www.mealprep.org.uk/meal-plans/1500-calorie', impressions: 410, clicks: 8, ctr: 0.0195, position: 10.7 }),
    normaliseSearchRow({ query: 'high protein lunch ideas uk', page: 'https://www.mealprep.org.uk/blog/high-protein-lunches-for-work-uk', impressions: 160, clicks: 5, ctr: 0.0313, position: 8.9 }),
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
