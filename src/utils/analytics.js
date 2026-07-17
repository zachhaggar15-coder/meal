const DEFAULT_GA_MEASUREMENT_ID = 'G-SRW78FVYWM';
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || DEFAULT_GA_MEASUREMENT_ID;
const PLAUSIBLE_DOMAIN = import.meta.env.VITE_PLAUSIBLE_DOMAIN || '';
const PLAUSIBLE_SRC = import.meta.env.VITE_PLAUSIBLE_SRC || 'https://plausible.io/js/script.js';
const FIRST_PARTY_ANALYTICS_ENABLED = import.meta.env.VITE_BEHAVIOR_ANALYTICS !== 'false';
const ANALYTICS_REQUIRE_CONSENT = import.meta.env.VITE_ANALYTICS_REQUIRE_CONSENT !== 'false';
const CONSENT_KEY = 'mealprep_analytics_consent';
const CONSENT_EVENT = 'mealprep:analytics-consent-changed';

let analyticsInitialised = false;
let inMemoryConsent = '';

export function initAnalytics() {
  if (typeof window === 'undefined' || analyticsInitialised) return;
  if (!hasAnalyticsConsent()) return;
  analyticsInitialised = true;

  if (GA_MEASUREMENT_ID && !document.querySelector('[data-analytics-provider="ga4"]')) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
    script.dataset.analyticsProvider = 'ga4';
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag(){ window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });
  }

  if (PLAUSIBLE_DOMAIN && !document.querySelector('[data-analytics-provider="plausible"]')) {
    window.plausible = window.plausible || function plausible(){
      (window.plausible.q = window.plausible.q || []).push(arguments);
    };
    const script = document.createElement('script');
    script.defer = true;
    script.src = PLAUSIBLE_SRC;
    script.dataset.domain = PLAUSIBLE_DOMAIN;
    script.dataset.analyticsProvider = 'plausible';
    document.head.appendChild(script);
  }
}

export function trackPageView(path) {
  if (typeof window === 'undefined') return;
  initAnalytics();

  const pagePath = path || `${window.location.pathname}${window.location.search}`;
  if (hasAnalyticsConsent()) {
    window.gtag?.('event', 'page_view', {
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title,
    });
    window.plausible?.('pageview', { u: window.location.href });
  }

  trackFirstPartyEvent('page_view', {
    path: pagePath,
    page_title: document.title,
  });
}

export function trackEvent(name, props = {}) {
  if (typeof window === 'undefined' || !name) return;
  initAnalytics();

  const cleanProps = Object.fromEntries(
    Object.entries(props).filter(([, value]) => value !== undefined && value !== '')
  );

  if (hasAnalyticsConsent()) {
    window.gtag?.('event', name, cleanProps);
    window.plausible?.(name, { props: cleanProps });
  }
  trackFirstPartyEvent(name, cleanProps);
}

export function trackFirstPartyEvent(name, props = {}) {
  if (typeof window === 'undefined' || !FIRST_PARTY_ANALYTICS_ENABLED || !hasAnalyticsConsent()) return;
  if (!name) return;

  if (window.__mealprepAnalytics?.track) {
    window.__mealprepAnalytics.track(name, props);
    return;
  }

  window.__mealprepAnalyticsQueue = window.__mealprepAnalyticsQueue || [];
  if (window.__mealprepAnalyticsQueue.length < 100) {
    window.__mealprepAnalyticsQueue.push({ name, props });
  }
}

export function flushQueuedFirstPartyEvents() {
  if (typeof window === 'undefined' || !window.__mealprepAnalytics?.track) return;
  const queue = window.__mealprepAnalyticsQueue || [];
  window.__mealprepAnalyticsQueue = [];
  for (const item of queue) {
    window.__mealprepAnalytics.track(item.name, item.props);
  }
}

export function isFirstPartyAnalyticsEnabled() {
  return FIRST_PARTY_ANALYTICS_ENABLED;
}

export function isAnalyticsConsentRequired() {
  return ANALYTICS_REQUIRE_CONSENT;
}

export function getAnalyticsConsent() {
  if (typeof window === 'undefined') return 'denied';
  if (isDoNotTrackEnabled()) return 'denied';
  if (!ANALYTICS_REQUIRE_CONSENT) return 'granted';
  if (inMemoryConsent === 'granted' || inMemoryConsent === 'denied') return inMemoryConsent;

  try {
    const saved = window.localStorage.getItem(CONSENT_KEY);
    if (saved === 'granted' || saved === 'denied') return saved;
  } catch {
    return 'unset';
  }

  return 'unset';
}

export function hasAnalyticsConsent() {
  return getAnalyticsConsent() === 'granted';
}

export function setAnalyticsConsent(value) {
  if (typeof window === 'undefined') return;
  const next = value === 'granted' ? 'granted' : 'denied';
  inMemoryConsent = next;
  try {
    window.localStorage.setItem(CONSENT_KEY, next);
  } catch {
    // If storage is unavailable, keep the choice for this page view only.
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: { consent: next } }));
  if (next === 'granted') initAnalytics();
}

export function onAnalyticsConsentChange(handler) {
  if (typeof window === 'undefined') return () => {};
  const listener = event => handler(event.detail?.consent || getAnalyticsConsent());
  window.addEventListener(CONSENT_EVENT, listener);
  return () => window.removeEventListener(CONSENT_EVENT, listener);
}

function isDoNotTrackEnabled() {
  if (typeof navigator === 'undefined') return false;
  return navigator.doNotTrack === '1'
    || window.doNotTrack === '1'
    || navigator.msDoNotTrack === '1';
}

export const track = {
  // Generator
  planGenerated: (props) => trackEvent('plan_generated', props),
  planGenerationFailed: (props) => trackEvent('plan_generation_failed', props),
  generatorCtaClick: (sourcePage) => trackEvent('generator_cta_click', { source_page: sourcePage }),
  // Plan interaction
  shoppingListCopied: () => trackEvent('shopping_list_copied'),
  planCopied: () => trackEvent('plan_copied'),
  shareClicked: () => trackEvent('share_clicked'),
  printClicked: () => trackEvent('print_clicked'),
  readyMadePlanClicked: (slug) => trackEvent('ready_made_plan_clicked', { slug }),
  planEmailSubmitted: (slug) => trackEvent('plan_email_submitted', { slug }),
  planEmailSent: (slug) => trackEvent('plan_email_sent', { slug }),
  planEmailFailed: (slug, reason) => trackEvent('plan_email_failed', { slug, reason }),
  mealEditSubmitted: (slug) => trackEvent('meal_edit_submitted', { slug }),
  mealEditCompleted: (slug) => trackEvent('meal_edit_completed', { slug }),
  mealEditFailed: (slug) => trackEvent('meal_edit_failed', { slug }),
  // Form inputs
  supermarketSelected: (store) => trackEvent('supermarket_selected', { store }),
  calorieTargetChanged: (kcal) => trackEvent('calorie_target_changed', { kcal }),
  quizStarted: () => trackEvent('quiz_started'),
  quizCompleted: () => trackEvent('quiz_completed'),
  quizAdjusted: (field) => trackEvent('quiz_results_adjusted', { field }),
  // Sticker promo
  stickerPromoClick: (sourcePage) => trackEvent('sticker_promo_click', { source_page: sourcePage }),
  // Meal prompt
  copyMealPrompt: (mealName) => trackEvent('copy_meal_prompt', { meal: mealName }),
  usePromptInGenerator: (mealName) => trackEvent('use_prompt_in_generator', { meal: mealName }),
};
