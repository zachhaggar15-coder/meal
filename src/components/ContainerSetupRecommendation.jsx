import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AFFILIATE_DISCLOSURE } from '../data/containerProducts.js';
import { BUDGET_CONTAINERS, MEAL_PREP_STICKERS, MID_RANGE_CONTAINERS } from '../data/offers.js';
import { buildContainerSetup, CONTAINER_LAST_CHECKED } from '../utils/containerSetup.js';
import { trackEvent } from '../utils/analytics.js';

const OFFER_BY_TIER = {
  budget: BUDGET_CONTAINERS,
  'mid-range': MID_RANGE_CONTAINERS,
  premium: MEAL_PREP_STICKERS,
};

export default function ContainerSetupRecommendation({
  plan,
  weeklyPlan,
  formValues,
  sourcePage = 'container-setup',
  className = '',
}) {
  const setup = useMemo(() => buildContainerSetup({ plan, weeklyPlan, formValues }), [plan, weeklyPlan, formValues]);
  const offer = OFFER_BY_TIER[setup.recommendation] || MID_RANGE_CONTAINERS;

  useEffect(() => {
    trackEvent('container_recommendation_view', {
      source_page: sourcePage,
      recommended_tier: setup.recommendation,
      container_count: setup.containerCount,
      prep_meal_count: setup.prepMealCount,
    });
  }, [setup.containerCount, setup.prepMealCount, setup.recommendation, sourcePage]);

  return (
    <section className={`container-setup-recommendation ${className}`.trim()} aria-labelledby={`${sourcePage}-container-setup-heading`}>
      <div className="container-setup-main">
        <span className="offer-kicker">Sponsored #ad - container setup</span>
        <h2 id={`${sourcePage}-container-setup-heading`}>Container setup for this plan</h2>
        <p>
          This plan has about <strong>{setup.prepMealCount}</strong> prep-friendly meals.
          Start with <strong>{setup.containerCount}</strong> main containers,
          {' '}<strong>{setup.sauceTubs}</strong> small sauce or snack tubs, and
          {' '}<strong>{setup.freezerTubs}</strong> freezer {setup.freezerTubs === 1 ? 'tub' : 'tubs'}.
        </p>
        <p>{setup.copy.setup}</p>
      </div>

      <div className="container-setup-result">
        <span>Recommended</span>
        <strong>{setup.copy.label}</strong>
        <p>{setup.copy.fit}</p>
        <dl className="container-setup-facts">
          <div>
            <dt>Material</dt>
            <dd>{setup.copy.material}</dd>
          </div>
          <div>
            <dt>Last checked</dt>
            <dd>{CONTAINER_LAST_CHECKED}</dd>
          </div>
        </dl>
        {setup.hasSaucyMeals && (
          <p className="container-setup-note">
            This plan includes saucy or reheated meals, so glass bases and reliable lids are worth prioritising.
          </p>
        )}
        <div className="container-setup-actions">
          <a
            href={offer.href}
            target="_blank"
            rel="noopener noreferrer nofollow sponsored"
            className="btn-primary"
            data-event={offer.eventName}
            data-source-page={`${sourcePage}-${setup.recommendation}`}
            data-offer={offer.name}
          >
            View matched pick on Amazon UK
          </a>
          <Link
            to={setup.copy.guidePath}
            className="btn-secondary"
            data-event="container_recommendation_guide_click"
            data-source-page={sourcePage}
            data-offer={setup.copy.label}
          >
            {setup.copy.guideLabel}
          </Link>
        </div>
        <p className="affiliate-disclosure">{AFFILIATE_DISCLOSURE}</p>
      </div>
    </section>
  );
}
