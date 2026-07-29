import { useEffect } from 'react';
import { trackEvent } from '../utils/analytics.js';

export default function ClickTracking() {
  useEffect(() => {
    function handleClick(event) {
      const target = event.target instanceof Element
        ? event.target.closest('[data-event]')
        : null;

      if (!target) return;

      const props = {
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
        destination: target.href,
      };

      trackEvent(target.dataset.event, props);

      if (
        target.dataset.affiliateCategory &&
        target.dataset.event !== 'affiliate_link_clicked'
      ) {
        trackEvent('affiliate_link_clicked', props);
      }
    }

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return null;
}
