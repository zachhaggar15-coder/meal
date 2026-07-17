import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  flushQueuedFirstPartyEvents,
  hasAnalyticsConsent,
  isFirstPartyAnalyticsEnabled,
  onAnalyticsConsentChange,
  trackPageView,
} from '../utils/analytics.js';

const SESSION_KEY = 'mealprep_analytics_session_id';
const ENTRY_KEY = 'mealprep_analytics_entry';
const ENDPOINT = '/api/analytics';
const HEARTBEAT_MS = 15000;
const FLUSH_DELAY_MS = 2500;
const SCROLL_MILESTONES = [25, 50, 75, 90, 100];

export default function BehaviorAnalytics() {
  const location = useLocation();
  const locationRef = useRef(location);
  const trackerRef = useRef(null);
  const firstRouteEffectRef = useRef(true);
  const startTrackerRef = useRef(null);

  useEffect(() => {
    locationRef.current = location;
    if (firstRouteEffectRef.current) {
      firstRouteEffectRef.current = false;
      return;
    }

    if (!isTrackablePath(currentPath(locationRef))) {
      trackerRef.current?.cleanup();
      trackerRef.current = null;
      return;
    }

    if (!trackerRef.current && startTrackerRef.current) {
      startTrackerRef.current(true);
      return;
    }

    trackerRef.current?.onRouteChange(currentPath(locationRef));
  }, [location]);

  useEffect(() => {
    if (!isFirstPartyAnalyticsEnabled()) return undefined;

    function startTracker(trackInitialPageView = false) {
      trackerRef.current?.cleanup();
      trackerRef.current = null;

      if (!hasAnalyticsConsent() || !isTrackablePath(currentPath(locationRef))) return;

      trackerRef.current = createTracker(() => currentPath(locationRef));
      flushQueuedFirstPartyEvents();

      if (trackInitialPageView) {
        trackPageView(currentPath(locationRef));
      }
    }

    startTrackerRef.current = startTracker;
    startTracker(false);
    const unsubscribe = onAnalyticsConsentChange(consent => startTracker(consent === 'granted'));

    return () => {
      unsubscribe();
      startTrackerRef.current = null;
      trackerRef.current?.cleanup();
      trackerRef.current = null;
    };
  }, []);

  return null;
}

function createTracker(getPath) {
  const session = getOrCreateSession(getPath);
  let page = createPageState(getPath());
  let queue = [];
  let flushTimer = null;
  let sectionObserver = null;
  let observeTimer = null;
  let lastResizeAt = 0;

  const api = {
    track,
    onRouteChange(nextPath) {
      if (nextPath === page.path) return;
      finishPage('route_change');
      page = createPageState(nextPath);
      observeSectionsSoon();
    },
    cleanup() {
      finishPage('tracker_cleanup');
      detach();
      if (window.__mealprepAnalytics === api) {
        delete window.__mealprepAnalytics;
      }
    },
  };

  window.__mealprepAnalytics = api;

  document.addEventListener('click', handleClick, true);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('pagehide', handlePageHide);
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', handleResize, { passive: true });

  const heartbeat = window.setInterval(() => {
    updateActiveTime();
    if (document.visibilityState === 'visible') {
      track('engagement_heartbeat', pageMetrics());
    }
  }, HEARTBEAT_MS);

  track('session_start', {
    entry_intent: session.entry_intent,
    entry_source: session.entry_source,
  });
  observeSectionsSoon();

  return api;

  function track(name, props = {}) {
    updateActiveTime();
    enqueue(buildEvent(name, props, page));
  }

  function enqueue(event) {
    queue.push(event);
    if (queue.length >= 10) {
      flush(false);
      return;
    }

    if (!flushTimer) {
      flushTimer = window.setTimeout(() => flush(false), FLUSH_DELAY_MS);
    }
  }

  function flush(useBeacon) {
    if (flushTimer) {
      window.clearTimeout(flushTimer);
      flushTimer = null;
    }
    if (queue.length === 0) return;

    const events = queue.splice(0, 25);
    const payload = JSON.stringify({ session: refreshSession(session), events });

    if (useBeacon && navigator.sendBeacon) {
      const sent = navigator.sendBeacon(ENDPOINT, new Blob([payload], { type: 'application/json' }));
      if (sent) return;
    }

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: useBeacon,
    }).catch(() => {});
  }

  function buildEvent(name, props, state) {
    const path = props.path || state.path || getPath();
    return {
      event_name: normaliseEventName(name),
      occurred_at: new Date().toISOString(),
      path,
      page_title: props.page_title || document.title,
      page_category: categorisePath(path),
      source_page: props.source_page,
      target_text: props.target_text,
      target_role: props.target_role,
      target_tag: props.target_tag,
      target_href: props.target_href || props.destination,
      target_host: props.target_host,
      target_id: props.target_id,
      section_heading: props.section_heading,
      section_level: props.section_level,
      section_index: props.section_index,
      scroll_depth: props.scroll_depth ?? state.maxScrollDepth,
      active_time_ms: props.active_time_ms ?? Math.round(state.activeMs),
      time_on_page_ms: props.time_on_page_ms ?? Math.max(0, Date.now() - state.startedAt),
      visible_section_count: props.visible_section_count ?? state.seenSections.size,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      metadata: eventMetadata(props),
    };
  }

  function finishPage(reason) {
    updateActiveTime();
    track('page_exit', {
      ...pageMetrics(),
      exit_reason: reason,
      sections_seen: [...page.seenSections.values()].slice(0, 40),
    });
    flush(true);
  }

  function pageMetrics() {
    return {
      scroll_depth: page.maxScrollDepth,
      active_time_ms: Math.round(page.activeMs),
      time_on_page_ms: Math.max(0, Date.now() - page.startedAt),
      visible_section_count: page.seenSections.size,
    };
  }

  function updateActiveTime() {
    const now = Date.now();
    if (document.visibilityState === 'visible') {
      page.activeMs += Math.max(0, now - page.lastTickAt);
    }
    page.lastTickAt = now;
  }

  function handleClick(event) {
    const target = event.target instanceof Element
      ? event.target.closest('a,button,summary,input[type="button"],input[type="submit"],[role="button"],[data-event]')
      : null;
    if (!target) return;

    const href = getHref(target);
    const targetUrl = href ? safeUrl(href) : null;
    const isOutbound = targetUrl && targetUrl.host !== window.location.host;
    const eventName = isOutbound
      ? (isAffiliateHref(targetUrl.href) ? 'affiliate_click' : 'outbound_click')
      : 'ui_click';

    track(eventName, {
      target_text: getElementLabel(target),
      target_role: target.getAttribute('role') || target.getAttribute('type') || '',
      target_tag: target.tagName.toLowerCase(),
      target_href: targetUrl?.href || href || '',
      target_host: targetUrl?.host || '',
      target_id: target.id || '',
      data_event: target.dataset?.event || '',
      source_page: target.dataset?.sourcePage || '',
    });
  }

  function handleVisibilityChange() {
    updateActiveTime();
    if (document.visibilityState === 'hidden') {
      track('page_hidden', pageMetrics());
      flush(true);
    } else {
      page.lastTickAt = Date.now();
      track('page_visible', pageMetrics());
    }
  }

  function handlePageHide() {
    finishPage('pagehide');
  }

  function handleScroll() {
    const depth = getScrollDepth();
    if (depth <= page.maxScrollDepth) return;
    page.maxScrollDepth = depth;

    for (const milestone of SCROLL_MILESTONES) {
      if (depth >= milestone && !page.scrollMilestones.has(milestone)) {
        page.scrollMilestones.add(milestone);
        track('scroll_depth', { scroll_depth: milestone });
      }
    }
  }

  function handleResize() {
    const now = Date.now();
    if (now - lastResizeAt < 1200) return;
    lastResizeAt = now;
    track('viewport_changed', {
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
    });
  }

  function observeSectionsSoon() {
    window.clearTimeout(observeTimer);
    observeTimer = window.setTimeout(observeSections, 350);
    window.setTimeout(observeSections, 1200);
  }

  function observeSections() {
    if (sectionObserver) sectionObserver.disconnect();
    const main = document.getElementById('main-content') || document.body;
    const candidates = [...main.querySelectorAll('[data-analytics-section], h1, h2, h3')]
      .filter(el => getElementLabel(el).length > 0)
      .slice(0, 100);

    sectionObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.55) continue;
        const el = entry.target;
        const text = getElementLabel(el);
        const index = candidates.indexOf(el);
        const key = `${page.path}|${el.tagName}|${index}|${text}`;
        if (page.seenSections.has(key)) continue;

        page.seenSections.set(key, text);
        track('content_section_viewed', {
          section_heading: text,
          section_level: el.dataset.analyticsSection ? 'custom' : el.tagName.toLowerCase(),
          section_index: index,
        });
      }
    }, { threshold: [0.55, 0.75] });

    for (const el of candidates) sectionObserver.observe(el);
  }

  function detach() {
    document.removeEventListener('click', handleClick, true);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('pagehide', handlePageHide);
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('resize', handleResize);
    window.clearInterval(heartbeat);
    window.clearTimeout(flushTimer);
    window.clearTimeout(observeTimer);
    sectionObserver?.disconnect();
  }
}

function currentPath(locationRef) {
  const current = locationRef.current;
  return `${current.pathname}${current.search}`;
}

function isTrackablePath(path) {
  return !String(path || '').startsWith('/admin');
}

function createPageState(path) {
  return {
    path,
    startedAt: Date.now(),
    activeMs: 0,
    lastTickAt: Date.now(),
    maxScrollDepth: getScrollDepth(),
    scrollMilestones: new Set(),
    seenSections: new Map(),
  };
}

function getOrCreateSession(getPath) {
  const sessionId = readStorage('session', SESSION_KEY) || makeId();
  writeStorage('session', SESSION_KEY, sessionId);

  const storedEntry = parseJson(readStorage('session', ENTRY_KEY));
  const entry = storedEntry?.entry_path ? storedEntry : buildEntryContext(getPath());
  writeStorage('session', ENTRY_KEY, JSON.stringify(entry));

  return {
    session_id: sessionId,
    ...entry,
    ...viewportFields(),
    language: navigator.language || '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    consent_state: 'granted',
    metadata: {
      app: 'mealprep',
      tracker_version: 1,
    },
  };
}

function refreshSession(session) {
  return {
    ...session,
    ...viewportFields(),
  };
}

function buildEntryContext(path) {
  const url = new URL(window.location.href);
  const referrer = document.referrer || '';
  const referrerHost = referrer ? safeUrl(referrer)?.host || '' : '';
  const searchIntent = url.searchParams.get('search') || url.searchParams.get('q') || url.searchParams.get('utm_term') || '';

  return {
    entry_path: path,
    entry_url: url.href,
    entry_title: document.title,
    entry_referrer: referrer,
    entry_referrer_host: referrerHost,
    entry_source: inferEntrySource(url, referrerHost),
    entry_intent: searchIntent || categorisePath(path),
    utm_source: url.searchParams.get('utm_source') || '',
    utm_medium: url.searchParams.get('utm_medium') || '',
    utm_campaign: url.searchParams.get('utm_campaign') || '',
    utm_term: url.searchParams.get('utm_term') || '',
  };
}

function inferEntrySource(url, referrerHost) {
  if (url.searchParams.get('utm_source')) return 'campaign';
  if (!referrerHost) return 'direct';
  if (referrerHost === window.location.host) return 'internal';
  if (/(google|bing|duckduckgo|yahoo|ecosia)\./i.test(referrerHost)) return 'organic_search';
  if (/(facebook|instagram|tiktok|pinterest|reddit|x\.com|twitter|youtube)\./i.test(referrerHost)) return 'social';
  return 'referral';
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
  if (clean.startsWith('/privacy') || clean.startsWith('/terms') || clean.startsWith('/contact') || clean.startsWith('/about')) return 'support';
  return 'other';
}

function viewportFields() {
  return {
    device_category: window.innerWidth < 740 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    screen_width: window.screen?.width || null,
    screen_height: window.screen?.height || null,
  };
}

function getScrollDepth() {
  const doc = document.documentElement;
  const body = document.body;
  const scrollTop = window.scrollY || doc.scrollTop || body.scrollTop || 0;
  const viewport = window.innerHeight || doc.clientHeight || 1;
  const height = Math.max(
    body.scrollHeight || 0,
    doc.scrollHeight || 0,
    body.offsetHeight || 0,
    doc.offsetHeight || 0,
    viewport,
  );
  return Math.max(0, Math.min(100, Math.round(((scrollTop + viewport) / height) * 100)));
}

function getHref(element) {
  if (element instanceof HTMLAnchorElement) return element.href;
  return element.getAttribute('href') || element.dataset?.href || '';
}

function getElementLabel(element) {
  const aria = element.getAttribute('aria-label') || element.getAttribute('title') || '';
  const text = aria || element.innerText || element.textContent || element.getAttribute('name') || element.id || '';
  return text.replace(/\s+/g, ' ').trim().slice(0, 220);
}

function safeUrl(value) {
  try {
    return new URL(value, window.location.href);
  } catch {
    return null;
  }
}

function isAffiliateHref(href) {
  return /(amazon|amzn\.to|awin1|track|affiliate|tag=|ascsubtag|partner)/i.test(String(href || ''));
}

function normaliseEventName(name) {
  return String(name || 'event')
    .toLowerCase()
    .replace(/[^a-z0-9_:-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80) || 'event';
}

function eventMetadata(props) {
  const directKeys = new Set([
    'path', 'page_title', 'source_page', 'target_text', 'target_role', 'target_tag',
    'target_href', 'destination', 'target_host', 'target_id', 'section_heading',
    'section_level', 'section_index', 'scroll_depth', 'active_time_ms',
    'time_on_page_ms', 'visible_section_count', 'viewport_width', 'viewport_height',
  ]);

  const metadata = {};
  for (const [key, value] of Object.entries(props || {})) {
    if (!directKeys.has(key) && value !== undefined && value !== '') {
      metadata[key] = value;
    }
  }
  return metadata;
}

function makeId() {
  if (window.crypto?.randomUUID) {
    return `sess_${window.crypto.randomUUID().replace(/-/g, '')}`;
  }
  return `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 14)}`;
}

function readStorage(type, key) {
  try {
    const store = type === 'session' ? window.sessionStorage : window.localStorage;
    return store.getItem(key);
  } catch {
    return '';
  }
}

function writeStorage(type, key, value) {
  try {
    const store = type === 'session' ? window.sessionStorage : window.localStorage;
    store.setItem(key, value);
  } catch {
    // Storage can be unavailable in strict privacy contexts. The page-level
    // tracker still works for the current render.
  }
}

function parseJson(value) {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}
