import { Link } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import SiteLogo from '../components/SiteLogo.jsx';
import TrustBox, { DEFAULT_SOURCES } from '../components/TrustBox.jsx';
import PageHeroVisual from '../components/PageHeroVisual.jsx';
import { getAllPlanMeta } from '../utils/planBuilder.js';
import {
  COMBO_LANDING_PAGES,
  comboMatchSummary,
  comboStatLabels,
  filterPlansForCombo,
  getSupermarketEvidence,
} from '../data/comboLandingPages.js';
import { chooseComboVisual } from '../data/visualAssets.js';

const ALL_PLANS = getAllPlanMeta();

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

export default function ComboLandingPage({ page }) {
  const matchingPlans = filterPlansForCombo(ALL_PLANS, page);
  const stats = comboStatLabels(page);
  const matchSummary = comboMatchSummary(page);
  const primaryMarket = page.match?.supermarkets?.[0];
  const evidence = primaryMarket ? getSupermarketEvidence(primaryMarket) : null;
  const comboVisual = chooseComboVisual(page);
  const relatedPages = page.relatedSlugs
    .map(slug => COMBO_LANDING_PAGES[slug])
    .filter(Boolean);

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: page.h1,
      description: page.description,
      url: `https://www.mealprep.org.uk${page.path}`,
      dateModified: page.reviewed,
      isPartOf: {
        '@type': 'WebSite',
        name: 'MealPrep.org.uk',
        url: 'https://www.mealprep.org.uk',
      },
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: matchingPlans.slice(0, 12).map((plan, index) => ({
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
        { '@type': 'ListItem', position: 3, name: page.h1, item: `https://www.mealprep.org.uk${page.path}` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: page.faq.map(item => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
  ];

  return (
    <>
      <SEO
        title={page.title}
        description={page.description}
        canonical={page.path}
        jsonLd={jsonLd}
      />

      <div className="content-page combo-page">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true"> &rsaquo; </span>
          <Link to="/browse">Meal Plans</Link>
          <span aria-hidden="true"> &rsaquo; </span>
          <span aria-current="page">{page.h1}</span>
        </nav>

        <SiteLogo variant="page" className="page-header-logo" />

        <header className="combo-hero">
          <span className="offer-kicker">{page.kicker}</span>
          <h1>{page.h1}</h1>
          <p className="content-intro">{page.intro}</p>
          <div className="meal-hub-stats" aria-label="Page highlights">
            <span>{matchingPlans.length} matching plans</span>
            {stats.map(stat => <span key={stat}>{stat}</span>)}
          </div>
          <div className="meal-hub-actions">
            <a className="btn-primary" href="#matching-plans">Compare plans</a>
            <Link className="btn-secondary" to="/quiz">Find my best match</Link>
          </div>
          <PageHeroVisual visual={comboVisual} className="meal-hub-hero-visual" priority />
        </header>

        <section className="combo-quick-answer" aria-label="Quick answer">
          <strong>Quick answer</strong>
          <p>{page.quickAnswer}</p>
        </section>

        <section className="combo-match-card" aria-labelledby="combo-match-heading">
          <div>
            <h2 id="combo-match-heading">What this page filters for</h2>
            <p>{matchSummary || 'UK supermarket meal plans with recipes, shopping lists and printable PDFs.'}</p>
          </div>
          <Link to="/browse" className="inline-text-link">Browse all filters</Link>
        </section>

        <TrustBox sources={DEFAULT_SOURCES} reviewed={page.reviewed} />

        <section id="matching-plans" className="meal-hub-plans">
          <div className="section-head-inline">
            <div>
              <h2>Best matching meal plans</h2>
              <p>Open a plan to see the 7-day menu, recipes, macros, copyable shopping list and printable PDF summary.</p>
            </div>
          </div>

          <div className="meal-hub-grid">
            {matchingPlans.map(plan => (
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

        <section className="combo-copy-grid">
          <article>
            <h2>Why this page is useful</h2>
            <p>{page.whyItWorks}</p>
          </article>
          <article>
            <h2>Shopping focus</h2>
            <p>{page.shoppingFocus}</p>
          </article>
        </section>

        {evidence && (
          <section className="supermarket-evidence" aria-labelledby="combo-evidence-heading">
            <div className="section-head-inline">
              <div>
                <h2 id="combo-evidence-heading">{evidence.label} shopping evidence notes</h2>
                <p>Use these practical basket notes before opening an exact plan.</p>
              </div>
            </div>
            <ul>
              {evidence.notes.map(note => <li key={note}>{note}</li>)}
            </ul>
          </section>
        )}

        <section className="meal-hub-supporting-guides" aria-labelledby="combo-guides-heading">
          <h2 id="combo-guides-heading">Supporting guides</h2>
          <div className="meal-hub-supporting-grid">
            {page.supportingLinks.map(link => (
              <Link key={link.to} to={link.to} className="meal-hub-supporting-card">
                {link.label}
              </Link>
            ))}
          </div>
        </section>

        <h2>Frequently Asked Questions</h2>
        <div className="faq">
          {page.faq.map(item => (
            <div key={item.q} className="faq-item">
              <h3>{item.q}</h3>
              <p>{item.a}</p>
            </div>
          ))}
        </div>

        {relatedPages.length > 0 && (
          <>
            <h2>Related exact meal-plan pages</h2>
            <ul className="plan-links">
              {relatedPages.map(related => (
                <li key={related.slug}>
                  <Link to={related.path}>{related.h1}</Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
}

function cap(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
}
