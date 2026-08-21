// Vercel serverless function: GET /api/admin-stats
// Returns aggregate MealPrep+ waitlist stats, behaviour analytics, or CSV
// exports. Access is gated by ADMIN_DASHBOARD_TOKEN.
//
// Required env vars:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//   ADMIN_DASHBOARD_TOKEN   (a long random string you choose)

import { SEMANTIC_QA_DASHBOARD } from '../src/data/semanticQaDashboard.js';
import {
  AFFILIATE_BASELINE_TIMESTAMP,
  AFFILIATE_PRODUCT_CLICK_EVENT,
  AFFILIATE_PRODUCT_IMPRESSION_EVENT,
  ACCESSORIES_FUNNEL_BASELINE_TIMESTAMP,
  ACCESSORY_GUIDE_CLICK_EVENT,
  ACCESSORY_PROBLEM_SELECTED_EVENT,
  getAffiliatePlacementGroup,
} from '../src/utils/affiliateAnalytics.js';
import {
  sanitiseAnalyticsPath,
  sanitiseAnalyticsUrl,
} from '../src/utils/analyticsSanitisation.js';

const ANALYTICS_WINDOW_DAYS = 30;
const MIN_ROUTE_VITAL_SESSIONS = 5;

const WAITLIST_SELECT = [
  'email',
  'first_name',
  'supermarket',
  'goal',
  'source_page',
  'subscribed',
  'welcome_email_sent',
  'created_at',
].join(',');

const ANALYTICS_EVENT_SELECT = [
  'received_at',
  'occurred_at',
  'session_id',
  'event_name',
  'path',
  'page_title',
  'page_category',
  'source_page',
  'target_text',
  'target_role',
  'target_tag',
  'target_href',
  'target_host',
  'section_heading',
  'section_level',
  'section_index',
  'scroll_depth',
  'active_time_ms',
  'time_on_page_ms',
  'visible_section_count',
  'viewport_width',
  'viewport_height',
  'metadata',
].join(',');

const ANALYTICS_SESSION_SELECT = [
  'session_id',
  'created_at',
  'last_seen_at',
  'entry_path',
  'entry_title',
  'entry_referrer_host',
  'entry_source',
  'entry_intent',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'device_category',
  'viewport_width',
  'viewport_height',
  'language',
  'timezone',
  'consent_state',
].join(',');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  const expected = process.env.ADMIN_DASHBOARD_TOKEN;
  const provided = adminTokenFromHeaders(req);
  if (!expected || !safeEqual(String(provided), String(expected))) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const supabaseUrl = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: 'Server not configured for Supabase.' });
  }

  const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` };
  const format = String(req.query?.format || '').toLowerCase();

  if (format === 'analytics-events-csv') {
    const events = await readAnalyticsEvents(supabaseUrl, headers, 20000);
    return sendCsv(res, 'mealprep-analytics-events.csv', analyticsEventsCsv(events));
  }

  if (format === 'analytics-sessions-csv') {
    const sessions = await readAnalyticsSessions(supabaseUrl, headers, 10000);
    return sendCsv(res, 'mealprep-analytics-sessions.csv', analyticsSessionsCsv(sessions));
  }

  let rows;
  try {
    rows = await readWaitlistRows(supabaseUrl, headers);
  } catch (err) {
    console.error('Supabase waitlist read error:', err);
    return res.status(500).json({ error: 'Could not read registrations.' });
  }

  if (format === 'csv') {
    return sendCsv(res, 'mealprep-waitlist.csv', waitlistCsv(rows));
  }

  const stats = buildWaitlistStats(rows);
  stats.analytics = await loadAnalyticsStats(supabaseUrl, headers);
  stats.semanticQa = SEMANTIC_QA_DASHBOARD;

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json(stats);
}

async function readWaitlistRows(supabaseUrl, headers) {
  const url = restUrl(supabaseUrl, 'interest_registrations', {
    select: WAITLIST_SELECT,
    order: 'created_at.desc',
  });
  return fetchJson(url, headers, 'interest_registrations');
}

async function loadAnalyticsStats(supabaseUrl, headers) {
  try {
    const since = new Date(Date.now() - ANALYTICS_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();
    const [events, sessions, vitalEvents] = await Promise.all([
      readAnalyticsEvents(supabaseUrl, headers, 5000, '', since),
      readAnalyticsSessions(supabaseUrl, headers, 1000, since),
      readAnalyticsEvents(supabaseUrl, headers, 10000, 'web_vital', since),
    ]);
    return buildAnalyticsStats(events, sessions, vitalEvents, { since, windowDays: ANALYTICS_WINDOW_DAYS });
  } catch (err) {
    console.error('Analytics stats unavailable:', err.message || err);
    return {
      configured: false,
      error: 'Analytics tables are not available yet. Run supabase/migrations/0002_behavior_analytics.sql, then refresh.',
    };
  }
}

async function readAnalyticsEvents(supabaseUrl, headers, limit, eventName = '', since = '') {
  const url = restUrl(supabaseUrl, 'analytics_events', {
    select: ANALYTICS_EVENT_SELECT,
    order: 'occurred_at.desc.nullslast',
    limit: String(limit),
    ...(eventName ? { event_name: `eq.${eventName}` } : {}),
    ...(since ? { occurred_at: `gte.${since}` } : {}),
  });
  return fetchJson(url, headers, 'analytics_events');
}

async function readAnalyticsSessions(supabaseUrl, headers, limit, since = '') {
  const url = restUrl(supabaseUrl, 'analytics_sessions', {
    select: ANALYTICS_SESSION_SELECT,
    order: 'last_seen_at.desc',
    limit: String(limit),
    ...(since ? { last_seen_at: `gte.${since}` } : {}),
  });
  return fetchJson(url, headers, 'analytics_sessions');
}

async function fetchJson(url, headers, label) {
  const response = await fetch(url, { headers });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${label} ${response.status}: ${text.slice(0, 300)}`);
  }
  return response.json();
}

function restUrl(supabaseUrl, table, params) {
  const query = new URLSearchParams(params);
  return `${supabaseUrl}/rest/v1/${table}?${query.toString()}`;
}

function buildWaitlistStats(rows) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  return {
    total: rows.length,
    subscribed: rows.filter(r => r.subscribed).length,
    welcomeEmailsSent: rows.filter(r => r.welcome_email_sent).length,
    thisWeek: rows.filter(r => new Date(r.created_at) >= weekAgo).length,
    thisMonth: rows.filter(r => new Date(r.created_at) >= monthAgo).length,
    bySupermarket: countBy(rows, 'supermarket'),
    byGoal: countBy(rows, 'goal'),
    recent: rows.slice(0, 15).map(r => ({
      email: maskEmail(r.email),
      first_name: r.first_name || '',
      supermarket: r.supermarket || '',
      goal: r.goal || '',
      created_at: r.created_at,
    })),
  };
}

export function buildAnalyticsStats(events, sessions, vitalEvents = [], options = {}) {
  const cleanEvents = events
    .map(event => ({
      ...event,
      path: sanitiseAnalyticsPath(event.path || ''),
      target_href: sanitiseAnalyticsUrl(event.target_href || ''),
      ts: dateValue(event.occurred_at || event.received_at),
      metadata: event.metadata && typeof event.metadata === 'object' ? event.metadata : {},
    }))
    .filter(event => event.ts && !String(event.path || '').startsWith('/admin'));

  const observedSessionIds = new Set(cleanEvents.map(event => event.session_id).filter(Boolean));
  const cleanSessions = sessions
    .filter(session => !String(session.entry_path || '').startsWith('/admin'))
    .filter(session => observedSessionIds.has(session.session_id))
    .map(session => ({
      ...session,
      entry_path: sanitiseAnalyticsPath(session.entry_path || ''),
      entry_intent: looksLikeQuizPayload(session.entry_intent) ? 'quiz' : session.entry_intent,
    }));
  const grouped = groupEventsBySession(cleanEvents, cleanSessions);
  const journeys = [...grouped.values()]
    .map(buildJourneySummary)
    .sort((a, b) => b.lastSeenMs - a.lastSeenMs);

  const pageViews = cleanEvents.filter(event => event.event_name === 'page_view');
  const clickEvents = cleanEvents.filter(isClickEvent);
  const sectionEvents = cleanEvents.filter(event => event.event_name === 'content_section_viewed');
  const searchEvents = cleanEvents.filter(isSearchEvent);
  const outboundClicks = cleanEvents.filter(event => (
    event.event_name === 'outbound_click'
    || event.event_name === 'affiliate_product_click'
    || event.event_name === 'affiliate_click'
  ));
  const canonicalAffiliateClicks = cleanEvents.filter(event => event.event_name === 'affiliate_product_click');
  const deprecatedAffiliateClicks = cleanEvents.filter(event => (
    event.event_name === 'affiliate_click' || event.event_name === 'affiliate_link_clicked'
  ));
  const returnEvents = cleanEvents.filter(event => event.event_name === 'return_visit');
  const funnel = buildFunnelSummary(cleanEvents);

  const engagementJourneys = journeys.filter(journey => journey.hasEngagementMeasurement);
  const scrollJourneys = journeys.filter(journey => journey.hasScrollMeasurement);
  const engagedSeconds = sum(engagementJourneys.map(journey => journey.engagedSeconds));

  return {
    configured: true,
    generatedAt: new Date().toISOString(),
    sample: {
      events: cleanEvents.length,
      sessions: cleanSessions.length,
      sourceSessions: sessions.length,
      eventLimit: 5000,
      sessionLimit: 1000,
      since: options.since || null,
      windowDays: options.windowDays || null,
    },
    overview: {
      sessions: cleanSessions.length || grouped.size,
      events: cleanEvents.length,
      pageViews: pageViews.length,
      clicks: clickEvents.length,
      outboundClicks: outboundClicks.length,
      canonicalAffiliateClicks: canonicalAffiliateClicks.length,
      deprecatedAffiliateClicks: deprecatedAffiliateClicks.length,
      internalSearches: searchEvents.length,
      sectionsSeen: sectionEvents.length,
      avgPagesPerSession: round(avg(journeys.map(journey => journey.pageCount))),
      avgEngagedSeconds: round(engagedSeconds / (engagementJourneys.length || 1)),
      engagementSamples: engagementJourneys.length,
      avgMaxScrollDepth: round(avg(scrollJourneys.map(journey => journey.maxScrollDepth))),
      scrollSamples: scrollJourneys.length,
      avgExplorationScore: round(avg(journeys.map(journey => journey.explorationScore))),
      returnVisits: unique(returnEvents.map(event => event.session_id)).length,
      savedPlanActions: funnel.find(item => item.event === 'plan_saved')?.events || 0,
      shoppingListUses: sum(funnel
        .filter(item => ['shopping_list_opened', 'shopping_item_toggled', 'shopping_list_printed'].includes(item.event))
        .map(item => item.events)),
    },
    affiliateMeasurement: buildAffiliateMeasurement(cleanEvents),
    accessoriesFunnel: buildAccessoryFunnelMeasurement(cleanEvents),
    funnel,
    entrySources: toNameValue(countBy(cleanSessions, 'entry_source')).slice(0, 10),
    topEntryIntents: toNameValue(countBy(cleanSessions, 'entry_intent')).slice(0, 12),
    topPages: toNameValue(countBy(pageViews, 'path')).slice(0, 15),
    topClicks: topClicks(clickEvents).slice(0, 20),
    recentClicks: clickEvents
      .sort((a, b) => b.ts - a.ts)
      .slice(0, 50)
      .map(event => ({
        at: iso(event.ts),
        session: shortSession(event.session_id),
        event: event.event_name,
        path: event.path || '',
        label: event.target_text || event.target_href || event.event_name,
        href: event.target_href || '',
        host: event.target_host || '',
      })),
    contentSeen: topContentSections(sectionEvents).slice(0, 20),
    scrollDepthByPage: scrollDepthByPage(cleanEvents).slice(0, 15),
    coreWebVitals: buildCoreWebVitals(vitalEvents),
    sessionJourneys: journeys.slice(0, 25),
    explorationLeaders: journeys
      .filter(journey => journey.explorationScore > 0)
      .sort((a, b) => b.explorationScore - a.explorationScore)
      .slice(0, 15),
  };
}

export function buildAffiliateMeasurement(events) {
  const baselineTimestamp = AFFILIATE_BASELINE_TIMESTAMP;
  const baselineDate = baselineTimestamp.slice(0, 10);
  const baselineMs = Date.parse(baselineTimestamp);
  const current = events.filter(event => event.ts >= baselineMs);
  const clicks = current.filter(event => event.event_name === AFFILIATE_PRODUCT_CLICK_EVENT);
  const impressions = current.filter(event => event.event_name === AFFILIATE_PRODUCT_IMPRESSION_EVENT);
  const pageViews = current.filter(event => event.event_name === 'page_view');
  const legacy = events.filter(event => (
    event.event_name === 'affiliate_click' || event.event_name === 'affiliate_link_clicked'
  ));

  const countMetadata = (rows, key, normalise = value => value) => toNameValue(rows.reduce((counts, event) => {
    const value = normalise(event.metadata?.[key] || 'Not specified');
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {})).slice(0, 20);

  const buildBreakdown = key => {
    const clickCounts = countByMetadata(clicks, key);
    const impressionCounts = countByMetadata(impressions, key);
    return unique([...Object.keys(clickCounts), ...Object.keys(impressionCounts)])
      .map(value => metricRow(value, clickCounts[value] || 0, impressionCounts[value] || 0))
      .sort((left, right) => right.clicks - left.clicks || right.impressions - left.impressions);
  };

  const buildPlacementBreakdown = () => {
    const clickCounts = countByMetadata(clicks, 'placement', getAffiliatePlacementGroup);
    const impressionCounts = countByMetadata(impressions, 'placement', getAffiliatePlacementGroup);
    return ['quick_picks', 'detailed_recommendation', 'comparison_section', 'other']
      .map(value => metricRow(value, clickCounts[value] || 0, impressionCounts[value] || 0));
  };

  const paths = unique([
    ...pageViews.map(event => event.path),
    ...clicks.map(event => event.path),
    ...impressions.map(event => event.path),
  ].filter(Boolean));

  return {
    baselineDate,
    baselineTimestamp,
    canonicalEvent: AFFILIATE_PRODUCT_CLICK_EVENT,
    impressionEvent: AFFILIATE_PRODUCT_IMPRESSION_EVENT,
    clicks: clicks.length,
    impressions: impressions.length,
    pageViews: pageViews.length,
    clicksPerThousandPageViews: pageViews.length
      ? round((clicks.length / pageViews.length) * 1000)
      : null,
    affiliateCtr: impressions.length ? round((clicks.length / impressions.length) * 100) : null,
    affiliateCtrNumerator: clicks.length,
    affiliateCtrDenominator: impressions.length,
    affiliateCtrNote: impressions.length
      ? 'CTR is canonical clicks divided by measured product impressions; always show both counts.'
      : 'Awaiting affiliate_product_impression events; do not substitute page views or legacy click labels.',
    byProduct: countMetadata(clicks, 'product_name'),
    byPlacement: buildPlacementBreakdown(),
    byProductId: buildBreakdown('product_id'),
    byProductCategory: buildBreakdown('product_category'),
    byListPosition: buildBreakdown('list_position'),
    byViewport: buildBreakdown('viewport_category'),
    byRecommendationSource: buildBreakdown('recommendation_source'),
    pages: paths.map(path => {
      const views = pageViews.filter(event => event.path === path).length;
      const pageClicks = clicks.filter(event => event.path === path).length;
      const pageImpressions = impressions.filter(event => event.path === path).length;
      return {
        path,
        pageViews: views,
        clicks: pageClicks,
        impressions: pageImpressions,
        affiliateCtr: pageImpressions ? round((pageClicks / pageImpressions) * 100) : null,
        affiliateCtrNumerator: pageClicks,
        affiliateCtrDenominator: pageImpressions,
        clicksPerThousandPageViews: views ? round((pageClicks / views) * 1000) : null,
      };
    }).sort((left, right) => right.clicks - left.clicks || right.pageViews - left.pageViews),
    deprecatedHistoricalEvents: {
      total: legacy.length,
      affiliateClick: legacy.filter(event => event.event_name === 'affiliate_click').length,
      affiliateLinkClicked: legacy.filter(event => event.event_name === 'affiliate_link_clicked').length,
      note: 'Historical diagnostics only; never add these to canonical conversions.',
    },
  };
}

export function buildAccessoryFunnelMeasurement(events, options = {}) {
  const baselineTimestamp = options.baselineTimestamp
    || ACCESSORIES_FUNNEL_BASELINE_TIMESTAMP
    || AFFILIATE_BASELINE_TIMESTAMP;
  const baselineMs = Date.parse(baselineTimestamp);
  const current = events.filter(event => (
    event.path === '/meal-prep-accessories'
    && event.ts >= baselineMs
  ));
  const commercial = buildAffiliateMeasurement(current);
  const problemSelections = current.filter(event => event.event_name === ACCESSORY_PROBLEM_SELECTED_EVENT);
  const guideClicks = current.filter(event => event.event_name === ACCESSORY_GUIDE_CLICK_EVENT);
  const problemIds = unique([
    ...problemSelections.map(event => event.metadata?.problem_id),
    ...current.map(event => event.metadata?.selected_problem),
  ].filter(Boolean));

  const byProblem = problemIds.map(problemId => {
    const selections = problemSelections.filter(event => event.metadata?.problem_id === problemId);
    const impressions = current.filter(event => (
      event.event_name === AFFILIATE_PRODUCT_IMPRESSION_EVENT
      && event.metadata?.selected_problem === problemId
    ));
    const clicks = current.filter(event => (
      event.event_name === AFFILIATE_PRODUCT_CLICK_EVENT
      && event.metadata?.selected_problem === problemId
    ));
    return {
      problemId,
      problemLabel: selections.find(event => event.metadata?.problem_label)?.metadata?.problem_label || problemId,
      selections: selections.length,
      impressions: impressions.length,
      clicks: clicks.length,
      affiliateCtr: impressions.length ? round((clicks.length / impressions.length) * 100) : null,
      affiliateCtrNumerator: clicks.length,
      affiliateCtrDenominator: impressions.length,
      sampleStatus: classifyAccessorySample(impressions.length),
    };
  }).sort((left, right) => right.selections - left.selections || right.impressions - left.impressions);

  const guideCounts = countByMetadata(guideClicks, 'target_route');
  const pageViews = commercial.pageViews;

  return {
    ...commercial,
    baselineTimestamp,
    baselineStatus: ACCESSORIES_FUNNEL_BASELINE_TIMESTAMP ? 'production_deployment' : 'pending_production_deployment',
    problemSelectionEvent: ACCESSORY_PROBLEM_SELECTED_EVENT,
    problemSelections: problemSelections.length,
    problemSelectionRate: pageViews ? round((problemSelections.length / pageViews) * 100) : null,
    problemSelectionRateNumerator: problemSelections.length,
    problemSelectionRateDenominator: pageViews,
    guideClicks: guideClicks.length,
    byProblem,
    byGuideRoute: toNameValue(guideCounts).slice(0, 20),
    sampleStatus: classifyAccessorySample(commercial.impressions),
    sampleNote: 'Under 20 product impressions is insufficient data; 20–49 is directional only; 50+ is worth human review. Product ordering never changes automatically.',
  };
}

function classifyAccessorySample(impressions) {
  if (impressions < 20) return 'insufficient_data';
  if (impressions < 50) return 'directional_only';
  if (impressions < 200) return 'worth_reviewing';
  return 'increasingly_useful';
}

function countByMetadata(events, key, normalise = value => value) {
  return events.reduce((counts, event) => {
    const raw = event.metadata?.[key];
    const value = String(normalise(raw === undefined || raw === '' ? 'Not specified' : raw));
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}

function metricRow(value, clicks, impressions) {
  return {
    name: String(value),
    clicks,
    impressions,
    affiliateCtr: impressions ? round((clicks / impressions) * 100) : null,
    affiliateCtrNumerator: clicks,
    affiliateCtrDenominator: impressions,
  };
}

function buildCoreWebVitals(events) {
  const valuesByMetric = new Map();
  const valuesByRoute = new Map();

  for (const event of events) {
    const metadata = event?.metadata && typeof event.metadata === 'object' ? event.metadata : {};
    const name = String(metadata.metric_name || '').toUpperCase();
    const value = Number(metadata.metric_value);
    const route = String(event.path || metadata.path || '').split('?')[0] || '/';
    if (!['LCP', 'INP', 'CLS', 'FCP', 'TTFB'].includes(name) || !Number.isFinite(value)) continue;

    valuesByMetric.set(name, [...(valuesByMetric.get(name) || []), value]);
    const routeKey = `${route}|${name}`;
    const routeEntry = valuesByRoute.get(routeKey) || { route, name, values: [], sessions: new Set() };
    routeEntry.values.push(value);
    if (event.session_id) routeEntry.sessions.add(event.session_id);
    valuesByRoute.set(routeKey, routeEntry);
  }

  const summary = ['LCP', 'INP', 'CLS'].map(name => {
    const values = valuesByMetric.get(name) || [];
    const p75 = percentile(values, 0.75);
    return {
      name,
      p75,
      unit: name === 'CLS' ? 'score' : 'ms',
      rating: vitalRating(name, p75),
      samples: values.length,
    };
  });

  const routeMap = new Map();
  for (const entry of valuesByRoute.values()) {
    const row = routeMap.get(entry.route) || { route: entry.route, samples: 0, sessions: new Set() };
    row[entry.name.toLowerCase()] = percentile(entry.values, 0.75);
    row.samples += entry.values.length;
    for (const session of entry.sessions) row.sessions.add(session);
    routeMap.set(entry.route, row);
  }

  const routes = [...routeMap.values()]
    .map(row => {
      const sessions = row.sessions.size;
      return {
        ...row,
        sessions,
        dataStatus: sessions >= MIN_ROUTE_VITAL_SESSIONS ? 'measured' : 'insufficient_data',
      };
    })
    .sort((left, right) => (right.inp || 0) - (left.inp || 0) || right.samples - left.samples)
    .slice(0, 30);

  return {
    configured: true,
    samples: events.length,
    summary,
    routes,
    note: events.length
      ? `p75 values from consented visits in the reporting window. Route ratings require at least ${MIN_ROUTE_VITAL_SESSIONS} sessions.`
      : 'Collection is active. Values appear after consented production visits.',
  };
}

function percentile(values, percentileValue) {
  const sorted = values.map(Number).filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return null;
  return sorted[Math.max(0, Math.ceil(sorted.length * percentileValue) - 1)];
}

function vitalRating(name, value) {
  if (!Number.isFinite(value)) return 'awaiting_data';
  const thresholds = {
    LCP: [2500, 4000],
    INP: [200, 500],
    CLS: [0.1, 0.25],
  }[name];
  if (!thresholds) return 'observed';
  if (value <= thresholds[0]) return 'good';
  if (value <= thresholds[1]) return 'needs_improvement';
  return 'poor';
}

function buildFunnelSummary(events) {
  const stages = [
    ['quiz_started', 'Quiz started', 'Discovery'],
    ['quiz_completed', 'Quiz completed', 'Discovery'],
    ['quiz_result_viewed', 'Recommendation viewed', 'Discovery'],
    ['plan_viewed_from_quiz', 'Quiz plan opened', 'Plan use'],
    ['plan_primary_cta_clicked', 'Plan next step', 'Plan use'],
    ['shopping_list_opened', 'Shopping list opened', 'Shopping'],
    ['shopping_item_toggled', 'Shopping item ticked', 'Shopping'],
    ['shopping_list_printed', 'Shopping list printed', 'Shopping'],
    ['plan_printed', 'Plan printed', 'Save and share'],
    ['plan_shared', 'Plan shared', 'Save and share'],
    ['email_plan_completed', 'Plan emailed', 'Save and share'],
    ['plan_saved', 'Plan saved locally', 'Retention'],
    ['saved_plan_reopened', 'Saved plan reopened', 'Retention'],
    ['recent_plan_reopened', 'Recent plan reopened', 'Retention'],
    ['plan_reopened', 'Plan revisited after 4h+', 'Retention'],
    ['return_visit', 'Return visit after 4h+', 'Retention'],
    ['affiliate_product_click', 'Affiliate product click (canonical)', 'Commercial'],
    ['affiliate_link_clicked', 'Affiliate link clicked (deprecated)', 'Deprecated analytics'],
    ['affiliate_click', 'Affiliate exit (deprecated)', 'Deprecated analytics'],
    ['waitlist_completed', 'MealPrep+ signup', 'Commercial'],
  ];

  return stages.map(([eventName, label, stage]) => {
    const matching = events.filter(event => event.event_name === eventName);
    return {
      stage,
      event: eventName,
      label,
      events: matching.length,
      sessions: unique(matching.map(event => event.session_id)).length,
    };
  });
}

function groupEventsBySession(events, sessions) {
  const grouped = new Map();
  for (const session of sessions) {
    grouped.set(session.session_id, { session, events: [] });
  }
  for (const event of events) {
    if (!grouped.has(event.session_id)) {
      grouped.set(event.session_id, { session: { session_id: event.session_id }, events: [] });
    }
    grouped.get(event.session_id).events.push(event);
  }
  return grouped;
}

function buildJourneySummary(group) {
  const { session } = group;
  const events = group.events.sort((a, b) => a.ts - b.ts);
  const paths = unique(events.map(event => event.path).filter(Boolean));
  const categories = unique(events.map(event => event.page_category).filter(Boolean));
  const entryCategory = categorisePath(session.entry_path || paths[0] || '');
  const beyondCategories = categories.filter(category => category && category !== entryCategory && category !== 'admin');
  const clicks = events.filter(isClickEvent);
  const searches = events.filter(isSearchEvent);
  const exits = events.filter(event => event.event_name === 'page_exit');
  const scrollEvents = events.filter(event => event.event_name === 'scroll_depth');
  const sections = events.filter(event => event.event_name === 'content_section_viewed');
  const maxScrollDepth = max(events.map(event => Number(event.scroll_depth || 0)));
  const engagedMs = sum(exits.map(event => Number(event.active_time_ms || 0)));
  const lastSeen = dateValue(session.last_seen_at) || events[events.length - 1]?.ts || dateValue(session.created_at) || new Date(0);
  const firstSeen = dateValue(session.created_at) || events[0]?.ts || lastSeen;
  const explorationScore = scoreExploration({
    pageCount: paths.length,
    beyondCategoryCount: beyondCategories.length,
    searchCount: searches.length,
    clickCount: clicks.length,
    maxScrollDepth,
    sectionCount: sections.length,
  });

  return {
    session: shortSession(session.session_id),
    startedAt: iso(firstSeen),
    lastSeenAt: iso(lastSeen),
    lastSeenMs: lastSeen.getTime(),
    entryPath: session.entry_path || paths[0] || '',
    entrySource: session.entry_source || 'unknown',
    entryIntent: session.entry_intent || entryCategory || 'unknown',
    device: session.device_category || '',
    pageCount: paths.length,
    pages: paths.slice(0, 8),
    categories,
    beyondEntryCategories: beyondCategories,
    clickCount: clicks.length,
    searchCount: searches.length,
    sectionCount: sections.length,
    maxScrollDepth,
    engagedSeconds: round(engagedMs / 1000),
    hasEngagementMeasurement: exits.length > 0,
    hasScrollMeasurement: scrollEvents.length > 0 || maxScrollDepth > 0,
    explorationScore,
    timeline: journeyTimeline(events).slice(-14),
  };
}

function scoreExploration({ pageCount, beyondCategoryCount, searchCount, clickCount, maxScrollDepth, sectionCount }) {
  const score = ((pageCount - 1) * 16)
    + (beyondCategoryCount * 24)
    + (searchCount * 14)
    + Math.min(clickCount * 2, 18)
    + (maxScrollDepth >= 75 ? 10 : 0)
    + (sectionCount >= 5 ? 8 : 0);
  return Math.max(0, Math.min(100, Math.round(score)));
}

function journeyTimeline(events) {
  return events
    .filter(event => (
      event.event_name === 'page_view'
      || isClickEvent(event)
      || isSearchEvent(event)
      || event.event_name === 'scroll_depth'
    ))
    .map(event => ({
      at: iso(event.ts),
      event: event.event_name,
      path: event.path || '',
      label: event.target_text
        || event.metadata?.query
        || event.metadata?.result_title
        || (event.scroll_depth ? `${event.scroll_depth}% scroll` : '')
        || event.page_title
        || event.path
        || event.event_name,
    }));
}

function topClicks(events) {
  const grouped = new Map();
  for (const event of events) {
    const key = [
      event.event_name,
      event.path || '',
      event.target_text || event.target_href || 'Unlabelled click',
      event.target_href || '',
    ].join('|');
    const current = grouped.get(key) || {
      event: event.event_name,
      path: event.path || '',
      label: event.target_text || event.target_href || 'Unlabelled click',
      href: event.target_href || '',
      count: 0,
      sessions: new Set(),
    };
    current.count += 1;
    current.sessions.add(event.session_id);
    grouped.set(key, current);
  }
  return [...grouped.values()]
    .map(item => ({ ...item, sessions: item.sessions.size }))
    .sort((a, b) => b.count - a.count);
}

function topContentSections(events) {
  const grouped = new Map();
  for (const event of events) {
    const key = `${event.path || ''}|${event.section_heading || ''}`;
    const current = grouped.get(key) || {
      path: event.path || '',
      section: event.section_heading || 'Untitled section',
      level: event.section_level || '',
      views: 0,
      sessions: new Set(),
    };
    current.views += 1;
    current.sessions.add(event.session_id);
    grouped.set(key, current);
  }
  return [...grouped.values()]
    .map(item => ({ ...item, sessions: item.sessions.size }))
    .sort((a, b) => b.sessions - a.sessions || b.views - a.views);
}

function scrollDepthByPage(events) {
  const bySessionPage = new Map();
  for (const event of events) {
    if (!event.path || event.scroll_depth === null || event.scroll_depth === undefined) continue;
    const key = `${event.session_id}|${event.path}`;
    bySessionPage.set(key, Math.max(bySessionPage.get(key) || 0, Number(event.scroll_depth || 0)));
  }

  const grouped = new Map();
  for (const [key, depth] of bySessionPage) {
    const path = key.split('|').slice(1).join('|');
    const item = grouped.get(path) || { path, depths: [] };
    item.depths.push(depth);
    grouped.set(path, item);
  }

  return [...grouped.values()]
    .map(item => ({
      path: item.path,
      sessions: item.depths.length,
      avgDepth: round(avg(item.depths)),
      deepest: max(item.depths),
    }))
    .sort((a, b) => b.sessions - a.sessions || b.avgDepth - a.avgDepth);
}

function isClickEvent(event) {
  return event.event_name === 'ui_click'
    || event.event_name === 'outbound_click'
    || event.event_name === 'affiliate_product_click'
    || event.event_name === 'affiliate_click'
    || event.event_name.endsWith('_click')
    || event.event_name.includes('clicked');
}

function isSearchEvent(event) {
  return event.event_name === 'site_search_submitted'
    || event.event_name === 'site_search_result_click'
    || event.event_name === 'browse_filters_changed';
}

function categorisePath(path) {
  const clean = String(path || '').split('?')[0];
  if (clean === '/') return 'generator';
  if (clean.startsWith('/blog')) return 'blog';
  if (clean.startsWith('/meal-plans') || clean.startsWith('/meal-plan')) return 'meal_plan';
  if (clean.startsWith('/plans') || clean.startsWith('/choose-')) return 'plan_discovery';
  if (clean.startsWith('/browse')) return 'browse_search';
  if (clean.startsWith('/meal-prep-containers')) return 'containers';
  if (clean.startsWith('/quiz')) return 'quiz';
  if (clean.startsWith('/tools')) return 'tools';
  if (clean.startsWith('/stickers')) return 'stickers';
  if (clean.startsWith('/admin')) return 'admin';
  return 'other';
}

function countBy(rows, key) {
  const out = {};
  for (const row of rows) {
    const value = row[key] || 'Not specified';
    out[value] = (out[value] || 0) + 1;
  }
  return out;
}

function toNameValue(map) {
  return Object.entries(map || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function maskEmail(email) {
  const [user, domain] = String(email || '').split('@');
  if (!domain) return '***';
  const head = user.slice(0, 2);
  return `${head}${'*'.repeat(Math.max(1, user.length - 2))}@${domain}`;
}

function sendCsv(res, filename, csv) {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).send(csv);
}

function waitlistCsv(rows) {
  const cols = ['email', 'first_name', 'supermarket', 'goal', 'source_page', 'subscribed', 'welcome_email_sent', 'created_at'];
  return toCsv(rows, cols);
}

function analyticsEventsCsv(rows) {
  const cols = [
    'occurred_at',
    'received_at',
    'session_id',
    'event_name',
    'path',
    'page_category',
    'target_text',
    'target_href',
    'target_host',
    'section_heading',
    'scroll_depth',
    'active_time_ms',
    'time_on_page_ms',
    'visible_section_count',
    'metadata',
  ];
  return toCsv(rows, cols);
}

function analyticsSessionsCsv(rows) {
  const cols = [
    'session_id',
    'created_at',
    'last_seen_at',
    'entry_path',
    'entry_source',
    'entry_intent',
    'entry_referrer_host',
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'device_category',
    'viewport_width',
    'viewport_height',
    'language',
    'timezone',
  ];
  return toCsv(rows, cols);
}

function toCsv(rows, cols) {
  const lines = [cols.join(',')];
  for (const row of rows) {
    lines.push(cols.map(col => escCsv(row[col])).join(','));
  }
  return lines.join('\r\n');
}

export function escCsv(value) {
  const raw = value && typeof value === 'object' ? JSON.stringify(value) : value;
  const text = raw === null || raw === undefined ? '' : String(raw);
  const safeText = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return /[",\n\r]/.test(safeText) ? `"${safeText.replace(/"/g, '""')}"` : safeText;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function sum(values) {
  return values.reduce((total, value) => total + (Number(value) || 0), 0);
}

function avg(values) {
  const clean = values.map(Number).filter(Number.isFinite);
  return clean.length ? sum(clean) / clean.length : 0;
}

function max(values) {
  const clean = values.map(Number).filter(Number.isFinite);
  return clean.length ? Math.max(...clean) : 0;
}

function round(value) {
  return Math.round((Number(value) || 0) * 10) / 10;
}

function dateValue(value) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

function iso(value) {
  const date = value instanceof Date ? value : dateValue(value);
  return date ? date.toISOString() : '';
}

function shortSession(sessionId) {
  return String(sessionId || '').replace(/^sess_/, '').slice(0, 10);
}

function looksLikeQuizPayload(value) {
  const text = String(value || '');
  // Earlier analytics stored the compact base64 quiz payload as an intent.
  // Even a very small answer object can be shorter than 40 characters, so
  // identify the JSON-base64 prefix and alphabet instead of relying on size.
  return text.length >= 12
    && /^(?:eyJ|e30)[A-Za-z0-9_-]*={0,2}$/.test(text);
}

export function adminTokenFromHeaders(req) {
  const value = req.headers?.['x-admin-token'] ?? req.headers?.['X-Admin-Token'];
  return Array.isArray(value) ? value[0] || '' : String(value || '');
}

// Length-safe, timing-safe-ish string compare.
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
