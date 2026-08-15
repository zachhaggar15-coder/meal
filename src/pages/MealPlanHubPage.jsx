import { Link, useParams } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import WaitlistSection from '../components/WaitlistSection.jsx';
import SiteLogo from '../components/SiteLogo.jsx';
import PlanCard from '../components/PlanCard.jsx';
import HubContextPanel from '../components/HubContextPanel.jsx';
import { buildHubContextLinks, buildHubDataSummary } from '../utils/hubContext.js';
import TrustBox, { DEFAULT_SOURCES } from '../components/TrustBox.jsx';
import { contentProvenance, schemaDates } from '../utils/contentDates.js';
import ContentByline from '../components/ContentByline.jsx';
import PageHeroVisual from '../components/PageHeroVisual.jsx';
import QuizNudge from '../components/QuizNudge.jsx';
import ComboLandingPage from './ComboLandingPage.jsx';
import NotFound from './NotFound.jsx';
import { getAllPlanMeta } from '../utils/planBuilder.js';
import {
  filterPlansForHub,
  MEAL_PLAN_HUBS,
} from '../data/mealPlanHubs.js';
import { COMBO_LANDING_PAGES } from '../data/comboLandingPages.js';
import { chooseHubVisual } from '../data/visualAssets.js';
import { AUTHOR_JSON_LD, SITE_CONTACT_EMAIL } from '../constants/site.js';
import { toTitleCase } from '../utils/textFormatting.js';

const ALL_PLANS = getAllPlanMeta();
const CARD_LIMIT = 12;

const REDIRECTED_HUB_SLUGS = {
  'low-effort': '/browse',
};

const MARKET_LABEL = {
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
  any: 'Generic UK supermarket',
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
  if (!hub) return <NotFound />;

  const { plans: matchingPlans, usedFallback: usingFallbackPlans } = getHubPlanMatches(hub);
  const shownPlans = matchingPlans.slice(0, CARD_LIMIT);
  // vercel.json 301-redirects these hub slugs elsewhere. The static file
  // still builds, but a non-self canonical keeps it out of the sitemap.
  const canonical = REDIRECTED_HUB_SLUGS[hub.slug] || `/meal-plans/${hub.slug}`;
  const sources = hub.sources || DEFAULT_SOURCES;
  const supportingGuides = hub.supportingGuides || DEFAULT_SUPPORTING_GUIDES;
  const hubVisual = chooseHubVisual(hub);
  // Replaces the identical 16-link "Popular UK searches" block that appeared on
  // every hub. Both the summary and the links are derived from this hub's own
  // matched plans, so each hub now says something only it can say.
  const hubSummary = buildHubDataSummary(matchingPlans);
  const hubContextLinks = buildHubContextLinks({
    hub,
    allHubs: MEAL_PLAN_HUBS,
    plans: matchingPlans,
  });
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: hub.h1,
      description: hub.description,
      url: `https://www.mealprep.org.uk${canonical}`,
      ...schemaDates(hub),
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
          <ContentByline record={hub} verb="Built" />
          <div className="meal-hub-stats" aria-label="Page highlights">
            <span>
              {usingFallbackPlans
                ? `${matchingPlans.length} adaptable UK plans`
                : `${matchingPlans.length} matching plans`}
            </span>
            {hub.stats.map(stat => <span key={stat}>{stat}</span>)}
          </div>
          <div className="meal-hub-actions">
            <a
              className="btn-primary"
              href="#top-plans"
              data-event="plan_primary_cta_clicked"
              data-source-page={`meal-plan-hub-${hub.slug}`}
              data-page-type="meal_plan_hub"
              data-cta-location="hero"
            >
              View the best matching plans
            </a>
            <Link className="btn-secondary" to="/quiz">Find my best match</Link>
          </div>
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

        <section id="top-plans" className="meal-hub-plans">
          <div className="section-head-inline">
            <div>
              <h2>{toTitleCase('Top matching plans')}</h2>
              <p>
                {usingFallbackPlans
                  ? `Exact ${MARKET_LABEL[hub.match?.supermarkets?.[0]] || 'store-specific'} plan pages are not in the indexed plan library yet, so start with these stable generic UK plans and adapt the shop.`
                  : 'Start with one of these plans, then use the plan page to print the PDF, copy the shopping list or edit meals.'}
              </p>
            </div>
            <Link to="/browse" className="inline-text-link">Browse all plans</Link>
          </div>

          <div className="meal-hub-grid">
            {shownPlans.map(plan => (
              <PlanCard key={plan.slug} plan={plan} sourcePage={`meal-plan-hub-${hub.slug}`} />
            ))}
          </div>
        </section>

        <QuizNudge
          sourcePage={`meal-plan-hub-${hub.slug}`}
          pageType="meal_plan_hub"
          location="after_top_plans"
        />

        <PageHeroVisual visual={hubVisual} className="meal-hub-hero-visual meal-hub-hero-visual--after-plans" priority />

        <HubContextPanel
          heading={hub.h1 || hub.title}
          summary={hubSummary}
          links={hubContextLinks}
        />

        {hub.sections.map(section => (
          <section key={section.h2} className="meal-hub-copy-section">
            <h2>{toTitleCase(section.h2)}</h2>
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
                        {section.table.headers.map(header => <th key={header} scope="col">{header}</th>)}
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
              <h2 id="meal-hub-supporting-guides-heading">{toTitleCase('Supporting guides')}</h2>
              <p>Use these guides to refine the plan, build the shopping list and choose practical UK ingredients.</p>
            </div>
          </div>
          <div className="meal-hub-supporting-grid">
            {supportingGuides.slice(0, 5).map(guide => (
              <Link key={guide.to} to={guide.to} className="meal-hub-supporting-card">
                {toTitleCase(guide.label)}
              </Link>
            ))}
          </div>
        </section>

        <section className="meal-hub-container-cta">
          <div>
            <h2>{toTitleCase('Batch cooking these plans?')}</h2>
            <p>
              Compare meal prep containers for budget plastic tubs, mid-range glass boxes
              and premium storage sets before you prep the week.
            </p>
          </div>
          <div className="meal-hub-container-links">
            <Link to="/meal-prep-containers">{toTitleCase('Best containers')}</Link>
            <Link to="/meal-prep-containers/budget">{toTitleCase('Budget containers')}</Link>
            <Link to="/meal-prep-containers/mid-range">{toTitleCase('Mid-range containers')}</Link>
            <Link to="/meal-prep-containers/premium">{toTitleCase('Premium containers')}</Link>
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
        <TrustBox sources={sources} {...contentProvenance(hub)} />
      </div>
      <WaitlistSection sourcePage="meal-plan-hub" />
      <Footer />
    </>
  );
}

function getHubPlanMatches(hub) {
  const directPlans = filterPlansForHub(ALL_PLANS, hub);
  const supermarket = hub.match?.supermarkets?.[0];

  if (directPlans.length || !supermarket) {
    return { plans: directPlans, usedFallback: false };
  }

  const genericHub = {
    ...hub,
    match: {
      ...hub.match,
      supermarkets: ['any'],
    },
  };

  return {
    plans: filterPlansForHub(ALL_PLANS, genericHub),
    usedFallback: true,
  };
}
