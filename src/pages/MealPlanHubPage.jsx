import { Link, Navigate, useParams } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import SiteLogo from '../components/SiteLogo.jsx';
import PopularSearches from '../components/PopularSearches.jsx';
import TrustBox, { DEFAULT_SOURCES } from '../components/TrustBox.jsx';
import PageHeroVisual from '../components/PageHeroVisual.jsx';
import ComboLandingPage from './ComboLandingPage.jsx';
import { getAllPlanMeta } from '../utils/planBuilder.js';
import {
  filterPlansForHub,
  MEAL_PLAN_HUBS,
} from '../data/mealPlanHubs.js';
import { COMBO_LANDING_PAGES } from '../data/comboLandingPages.js';
import { chooseHubVisual } from '../data/visualAssets.js';
import { AUTHOR_JSON_LD, SITE_AUTHOR_NAME, SITE_CONTACT_EMAIL } from '../constants/site.js';

const ALL_PLANS = getAllPlanMeta();
const CARD_LIMIT = 24;

const MARKET_LABEL = {
  aldi: 'Aldi',
  lidl: 'Lidl',
  tesco: 'Tesco',
  asda: 'Asda',
  sainsburys: "Sainsbury's",
  morrisons: 'Morrisons',
  iceland: 'Iceland',
  any: 'Generic UK supermarket',
};

const EFFORT_LABEL = {
  minimal: 'Minimal prep',
  low: 'Low effort',
  standard: 'Standard prep',
  batch: 'Batch cook',
  'high-variety': 'High variety',
};

const DEFAULT_SUPPORTING_GUIDES = [
  { label: 'Low calorie foods UK', to: '/blog/best-low-calorie-foods-uk' },
  { label: 'High protein snacks UK', to: '/blog/high-protein-snacks-uk' },
  { label: 'Printable meal plan PDFs', to: '/meal-plans/printable-meal-plans' },
  { label: 'Meal plans with shopping lists', to: '/meal-plans/meal-plans-with-shopping-list' },
];

export default function MealPlanHubPage() {
  const { slug } = useParams();
  const hub = MEAL_PLAN_HUBS[slug];
  const comboPage = COMBO_LANDING_PAGES[slug];

  if (!hub && comboPage) return <ComboLandingPage page={comboPage} />;
  if (!hub) return <Navigate to="/browse" replace />;

  const matchingPlans = filterPlansForHub(ALL_PLANS, hub);
  const shownPlans = matchingPlans.slice(0, CARD_LIMIT);
  const canonical = `/meal-plans/${hub.slug}`;
  const sources = hub.sources || DEFAULT_SOURCES;
  const supportingGuides = hub.supportingGuides || DEFAULT_SUPPORTING_GUIDES;
  const hubVisual = chooseHubVisual(hub);
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: hub.h1,
      description: hub.description,
      url: `https://www.mealprep.org.uk${canonical}`,
      dateModified: hub.modified || '2026-07-02',
      author: AUTHOR_JSON_LD,
      publisher: {
        '@type': 'Organization',
        name: 'MealPrep.org.uk',
        url: 'https://www.mealprep.org.uk',
        email: SITE_CONTACT_EMAIL,
      },
      citation: sources.map(source => source.url),
      isPartOf: {
        '@type': 'WebSite',
        name: 'MealPrep.org.uk',
        url: 'https://www.mealprep.org.uk',
      },
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: shownPlans.slice(0, 12).map((plan, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: plan.title,
          url: `https://www.mealprep.org.uk/plans/${plan.slug}`,
        })),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.mealprep.org.uk/' },
        { '@type': 'ListItem', position: 2, name: 'Meal Plans', item: 'https://www.mealprep.org.uk/browse' },
        { '@type': 'ListItem', position: 3, name: hub.h1, item: `https://www.mealprep.org.uk${canonical}` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: hub.faq.map(item => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
  ];

  return (
    <>
      <SEO
        title={`${hub.title} | MealPrep.org.uk`}
        description={hub.description}
        canonical={canonical}
        jsonLd={jsonLd}
      />

      <div className="content-page meal-plan-hub-page">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true"> &rsaquo; </span>
          <Link to="/browse">Meal Plans</Link>
          <span aria-hidden="true"> &rsaquo; </span>
          <span aria-current="page">{hub.h1}</span>
        </nav>

        <SiteLogo variant="page" className="page-header-logo" />

        <header className="meal-hub-hero">
          <span className="offer-kicker">{hub.kicker}</span>
          <h1>{hub.h1}</h1>
          <p className="content-intro">{hub.intro}</p>
          <p className="content-byline">
            Built and reviewed by <Link to="/about">{SITE_AUTHOR_NAME}</Link>. Last materially reviewed:{' '}
            {hub.reviewed || '17 June 2026'}.
          </p>
          <div className="meal-hub-stats" aria-label="Page highlights">
            <span>{matchingPlans.length} matching plans</span>
            {hub.stats.map(stat => <span key={stat}>{stat}</span>)}
          </div>
          <div className="meal-hub-actions">
            <a className="btn-primary" href="#top-plans">Compare top plans</a>
            <Link className="btn-secondary" to="/quiz">Find my best match</Link>
          </div>
          <PageHeroVisual visual={hubVisual} className="meal-hub-hero-visual" priority />
        </header>

        <section className="meal-hub-snippet" aria-label="What this hub includes">
          <div>
            <strong>Best for</strong>
            <span>{hub.stats[0]}</span>
          </div>
          <div>
            <strong>Included</strong>
            <span>7-day plans, macros, recipes, PDF export and shopping lists</span>
          </div>
          <div>
            <strong>Format</strong>
            <span>Free UK meal plan pages that can be printed or saved as PDF</span>
          </div>
        </section>

        <TrustBox sources={sources} reviewed={hub.reviewed || '17 June 2026'} />

        <PopularSearches
          title="Popular UK searches"
          intro="Related guides and plan hubs for calorie targets, printable PDFs, supermarket shopping and meal prep kit."
          className="popular-searches--hub"
        />

        <section id="top-plans" className="meal-hub-plans">
          <div className="section-head-inline">
            <div>
              <h2>Top matching plans</h2>
              <p>
                Start with one of these plans, then use the plan page to print the PDF,
                copy the shopping list or edit meals.
              </p>
            </div>
            <Link to="/browse" className="inline-text-link">Browse all plans</Link>
          </div>

          <div className="meal-hub-grid">
            {shownPlans.map(plan => (
              <Link key={plan.slug} to={`/plans/${plan.slug}`} className="meal-hub-card">
                <span className="meal-hub-card-tag">{plan.goalLabel}</span>
                <h3>{plan.title}</h3>
                <div className="meal-hub-card-meta">
                  <span>{MARKET_LABEL[plan.supermarket] || plan.supermarket}</span>
                  <span>{plan.calories.toLocaleString('en-GB')} kcal</span>
                  <span>{plan.priceEstimate}/wk</span>
                  <span>{EFFORT_LABEL[plan.effort] || plan.effort}</span>
                </div>
                {plan.dietType !== 'standard' && (
                  <span className="meal-hub-diet">{cap(plan.dietType)}</span>
                )}
              </Link>
            ))}
          </div>
        </section>

        {hub.sections.map(section => (
          <section key={section.h2} className="meal-hub-copy-section">
            <h2>{section.h2}</h2>
            {section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
            {section.bullets && (
              <ul className="content-bullets">
                {section.bullets.map(bullet => <li key={bullet}>{bullet}</li>)}
              </ul>
            )}
            {section.table && (
              <div className="content-table-wrap">
                <table className="content-table">
                  {section.table.headers && (
                    <thead>
                      <tr>
                        {section.table.headers.map(header => <th key={header}>{header}</th>)}
                      </tr>
                    </thead>
                  )}
                  <tbody>
                    {section.table.rows.map((row, rowIndex) => (
                      <tr key={`${section.h2}-${rowIndex}`}>
                        {row.map((cell, cellIndex) => <td key={`${section.h2}-${rowIndex}-${cellIndex}`}>{cell}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ))}

        <section className="meal-hub-supporting-guides" aria-labelledby="meal-hub-supporting-guides-heading">
          <div className="section-head-inline">
            <div>
              <h2 id="meal-hub-supporting-guides-heading">Supporting guides</h2>
              <p>Use these guides to refine the plan, build the shopping list and choose practical UK ingredients.</p>
            </div>
          </div>
          <div className="meal-hub-supporting-grid">
            {supportingGuides.slice(0, 5).map(guide => (
              <Link key={guide.to} to={guide.to} className="meal-hub-supporting-card">
                {guide.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="meal-hub-container-cta">
          <div>
            <h2>Batch cooking these plans?</h2>
            <p>
              Compare meal prep containers for budget plastic tubs, mid-range glass boxes
              and premium storage sets before you prep the week.
            </p>
          </div>
          <div className="meal-hub-container-links">
            <Link to="/meal-prep-containers">Best containers</Link>
            <Link to="/meal-prep-containers/budget">Budget containers</Link>
            <Link to="/meal-prep-containers/mid-range">Mid-range containers</Link>
            <Link to="/meal-prep-containers/premium">Premium containers</Link>
          </div>
        </section>

        <h2>Frequently Asked Questions</h2>
        <div className="faq">
          {hub.faq.map(item => (
            <div key={item.q} className="faq-item">
              <h3>{item.q}</h3>
              <p>{item.a}</p>
            </div>
          ))}
        </div>

        <h2>Related Meal Plan Hubs</h2>
        <ul className="plan-links">
          {hub.relatedSlugs.map(relatedSlug => {
            const related = MEAL_PLAN_HUBS[relatedSlug];
            return related ? (
              <li key={related.slug}>
                <Link to={related.path}>{related.h1}</Link>
              </li>
            ) : null;
          })}
        </ul>
      </div>
      <Footer />
    </>
  );
}

function cap(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
}
