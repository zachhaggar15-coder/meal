import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import SiteLogo from '../components/SiteLogo.jsx';
import { track } from '../utils/analytics.js';
import {
  getPlanLibrary,
  onPlanLibraryChange,
  removeSavedPlan,
} from '../utils/planRetention.js';

const EMPTY_LIBRARY = { saved: [], recent: [] };

export default function SavedPlans() {
  const [library, setLibrary] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const sync = () => setLibrary(getPlanLibrary());
    sync();
    track.savedPlansViewed({ page_type: 'saved_plans' });
    return onPlanLibraryChange(sync);
  }, []);

  const resolved = library || EMPTY_LIBRARY;
  const savedRoutes = new Set(resolved.saved.map(plan => plan.route));
  const recent = resolved.recent.filter(plan => !savedRoutes.has(plan.route));

  function removePlan(plan) {
    const ok = removeSavedPlan(plan.route);
    setMessage(ok ? `${plan.title} removed.` : 'Could not update saved plans in this browser.');
    if (ok) {
      track.planUnsaved({
        plan_slug: plan.slug,
        page_type: 'saved_plans',
        cta_location: 'saved_plan_card',
      });
    }
  }

  return (
    <>
      <SEO
        title="Saved Meal Plans | MealPrep.org.uk"
        description="Reopen meal plans saved on this device and continue with your weekly shopping list."
        canonical="/saved-plans"
        robots="noindex,follow"
      />

      <div className="content-page saved-plans-page">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true"> &rsaquo; </span>
          <span aria-current="page">Saved plans</span>
        </nav>
        <SiteLogo variant="page" className="page-header-logo" />
        <span className="offer-kicker">No account needed</span>
        <h1>Your saved meal plans</h1>
        <p className="content-intro">
          Plans, shopping-list ticks and your last open day stay in this browser on this device.
          Nothing in this list is uploaded to an account.
        </p>

        {message && <p className="saved-plans-message" role="status">{message}</p>}

        {!library ? (
          <p className="saved-plans-loading" role="status">Loading plans saved on this device...</p>
        ) : (
          <>
            <PlanCollection
              title="Saved for later"
              plans={resolved.saved}
              emptyText="You have not saved a plan on this device yet."
              actionLabel="Open saved plan"
              eventName="savedPlanReopened"
              onRemove={removePlan}
            />

            <PlanCollection
              title="Recently viewed"
              plans={recent}
              emptyText={resolved.saved.length ? 'No other recently viewed plans.' : ''}
              actionLabel="Continue this plan"
              eventName="recentPlanReopened"
            />
          </>
        )}

        {library && resolved.saved.length === 0 && recent.length === 0 && (
          <div className="saved-plans-empty-actions">
            <Link className="btn-primary" to="/quiz">Find my meal plan</Link>
            <Link className="btn-secondary" to="/browse">Browse all plans</Link>
          </div>
        )}

        <aside className="saved-plans-privacy" aria-label="How saving works">
          <strong>Saved locally</strong>
          <p>
            Clearing this browser's site data removes saved plans and shopping progress. Email a
            plan or print it if you need a copy that works on another device.
          </p>
        </aside>
      </div>
      <Footer />
    </>
  );
}

function PlanCollection({
  title,
  plans,
  emptyText,
  actionLabel,
  eventName,
  onRemove,
}) {
  if (!plans.length && !emptyText) return null;

  return (
    <section className="saved-plan-section" aria-labelledby={`saved-${slugify(title)}`}>
      <div className="saved-plan-section-head">
        <h2 id={`saved-${slugify(title)}`}>{title}</h2>
        {plans.length > 0 && <span>{plans.length}</span>}
      </div>
      {plans.length === 0 ? <p className="saved-plan-empty">{emptyText}</p> : (
        <div className="saved-plan-grid">
          {plans.map(plan => (
            <article className="saved-plan-card" key={plan.route}>
              <div>
                <span className="saved-plan-card-kicker">
                  {[marketLabel(plan.supermarket), calorieLabel(plan.calories)].filter(Boolean).join(' · ') || 'UK meal plan'}
                </span>
                <h3>{plan.title}</h3>
                <p>
                  {[plan.goal, plan.priceEstimate ? `${plan.priceEstimate}/week estimate` : '']
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
              <div className="saved-plan-card-actions">
                <Link
                  className="btn-primary"
                  to={plan.route}
                  onClick={() => track[eventName]({
                    plan_slug: plan.slug,
                    supermarket: plan.supermarket,
                    goal: plan.goal,
                    calorie_target: plan.calories,
                    page_type: 'saved_plans',
                    cta_location: title === 'Saved for later' ? 'saved_plan_card' : 'recent_plan_card',
                  })}
                >
                  {actionLabel}
                </Link>
                {onRemove && (
                  <button type="button" className="saved-plan-remove" onClick={() => onRemove(plan)}>
                    Remove
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function marketLabel(value) {
  const labels = {
    aldi: 'Aldi',
    lidl: 'Lidl',
    tesco: 'Tesco',
    asda: 'Asda',
    sainsburys: "Sainsbury's",
    morrisons: 'Morrisons',
    iceland: 'Iceland',
    waitrose: 'Waitrose',
    ocado: 'Ocado',
    'marks-spencer': 'M&S',
    coop: 'Co-op',
    any: 'UK supermarkets',
  };
  return labels[value] || value;
}

function calorieLabel(value) {
  return Number.isFinite(Number(value))
    ? `${Number(value).toLocaleString('en-GB')} kcal`
    : '';
}

function slugify(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
