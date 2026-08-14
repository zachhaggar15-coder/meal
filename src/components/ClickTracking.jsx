import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  hasAnalyticsConsent,
  onAnalyticsConsentChange,
  trackEvent,
} from '../utils/analytics.js';
import {
  AFFILIATE_PRODUCT_IMPRESSION_EVENT,
  AFFILIATE_PRODUCT_CLICK_EVENT,
  buildAffiliateEventProperties,
  buildAffiliateImpressionKey,
  getViewportCategory,
  isAffiliateUrl,
} from '../utils/affiliateAnalytics.js';

export default function ClickTracking() {
  const location = useLocation();

  useEffect(() => {
    const seenImpressions = new Set();
    let impressionObserver = null;
    let mutationObserver = null;
    let scanTimer = null;

    function handleClick(event) {
      const target = event.target instanceof Element
        ? event.target.closest('a[href], [data-event]')
        : null;

      if (!target) return;

      const affiliateClick = isAffiliateUrl(target.href);
      const eventName = affiliateClick
        ? AFFILIATE_PRODUCT_CLICK_EVENT
        : target.dataset.event;
      if (!eventName) return;

      const props = affiliateClick ? buildAffiliateEventProperties(target) : {
        source_page: target.dataset.sourcePage,
        offer: target.dataset.offer,
        target_calories: target.dataset.targetCalories,
        supermarket: target.dataset.supermarket,
        plan_slug: target.dataset.planSlug,
        goal: target.dataset.goal,
        calorie_target: target.dataset.calorieTarget,
        protein_target: target.dataset.proteinTarget,
        page_type: target.dataset.pageType,
        cta_location: target.dataset.ctaLocation,
        affiliate_category: target.dataset.affiliateCategory,
        product_name: target.dataset.productName || target.dataset.offer,
        selected_problem: target.dataset.selectedProblem,
        recommendation_source: target.dataset.recommendationSource,
        placement: target.dataset.placement,
        list_position: target.dataset.listPosition,
        problem_id: target.dataset.problemId,
        problem_label: target.dataset.problemLabel,
        previous_problem: target.dataset.previousProblem,
        target_route: target.dataset.targetRoute,
        viewport_category: getViewportCategory(window.innerWidth),
        destination: target.href,
      };

      trackEvent(eventName, props);
    }

    function stopImpressionTracking() {
      impressionObserver?.disconnect();
      mutationObserver?.disconnect();
      impressionObserver = null;
      mutationObserver = null;
      window.clearTimeout(scanTimer);
      scanTimer = null;
    }

    function scanAffiliateLinks() {
      if (!impressionObserver || !hasAnalyticsConsent()) return;
      const firstLinkByImpression = new Map();

      for (const link of document.querySelectorAll('a[href]')) {
        if (!isAffiliateUrl(link.href)) continue;
        const properties = buildAffiliateEventProperties(link);
        const key = buildAffiliateImpressionKey(properties);
        if (!seenImpressions.has(key) && !firstLinkByImpression.has(key)) {
          firstLinkByImpression.set(key, link);
        }
      }

      for (const link of firstLinkByImpression.values()) impressionObserver.observe(link);
    }

    function scheduleAffiliateScan() {
      window.clearTimeout(scanTimer);
      scanTimer = window.setTimeout(scanAffiliateLinks, 100);
    }

    function startImpressionTracking() {
      stopImpressionTracking();
      if (!hasAnalyticsConsent() || typeof IntersectionObserver === 'undefined') return;

      impressionObserver = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.5) continue;
          const link = entry.target;
          const properties = buildAffiliateEventProperties(link);
          const key = buildAffiliateImpressionKey(properties);
          impressionObserver.unobserve(link);
          if (seenImpressions.has(key)) continue;

          seenImpressions.add(key);
          trackEvent(AFFILIATE_PRODUCT_IMPRESSION_EVENT, properties);
        }
      }, { threshold: [0.5] });

      mutationObserver = new MutationObserver(scheduleAffiliateScan);
      mutationObserver.observe(document.body, { childList: true, subtree: true });
      scanAffiliateLinks();
    }

    document.addEventListener('click', handleClick);
    const unsubscribe = onAnalyticsConsentChange(consent => {
      if (consent === 'granted') startImpressionTracking();
      else stopImpressionTracking();
    });
    startImpressionTracking();

    return () => {
      document.removeEventListener('click', handleClick);
      unsubscribe();
      stopImpressionTracking();
    };
  }, [location.pathname, location.search]);

  return null;
}
