const DEFAULT_GA_MEASUREMENT_ID = 'G-SRW78FVYWM';
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || DEFAULT_GA_MEASUREMENT_ID;
const PLAUSIBLE_DOMAIN = import.meta.env.VITE_PLAUSIBLE_DOMAIN || '';
const PLAUSIBLE_SRC = import.meta.env.VITE_PLAUSIBLE_SRC || 'https://plausible.io/js/script.js';

let analyticsInitialised = false;

export function initAnalytics() {
  if (typeof window === 'undefined' || analyticsInitialised) return;
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
  window.gtag?.('event', 'page_view', {
    page_path: pagePath,
    page_location: window.location.href,
    page_title: document.title,
  });
  window.plausible?.('pageview', { u: window.location.href });
}

export function trackEvent(name, props = {}) {
  if (typeof window === 'undefined' || !name) return;
  initAnalytics();

  const cleanProps = Object.fromEntries(
    Object.entries(props).filter(([, value]) => value !== undefined && value !== '')
  );

  window.gtag?.('event', name, cleanProps);
  window.plausible?.(name, { props: cleanProps });
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
