import { useEffect } from 'react';
import { trackEvent } from '../utils/analytics.js';
import {
  AFFILIATE_PRODUCT_CLICK_EVENT,
  buildAffiliateEventProperties,
  isAffiliateUrl,
} from '../utils/affiliateAnalytics.js';

export default function ClickTracking() {
  useEffect(() => {
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
        destination: target.href,
      };

      trackEvent(eventName, props);
    }

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return null;
}
