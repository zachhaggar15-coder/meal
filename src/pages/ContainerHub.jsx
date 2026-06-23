import { Link } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import SiteLogo from '../components/SiteLogo.jsx';
import AffiliateProductGrid from '../components/AffiliateProductGrid.jsx';
import ContainerFinder from '../components/ContainerFinder.jsx';
import {
  AFFILIATE_DISCLOSURE,
  getContainerProducts,
} from '../data/containerProducts.js';

const HUB_PRODUCT_IDS = [
  'budget-compartment-50-pack',
  'harbour-housewares-glass-5-pack',
  'prep-naturals-glass-5-pack',
  'deli-twist-lid-tubs',
  'borohouse-10-pack-glass',
  'rubbermaid-brilliance-glass',
];

const queryRows = [
  {
    query: 'best meal prep containers',
    answer: 'Start with a mid-range rectangular glass set unless low cost or commuting weight matters more.',
    link: '/meal-prep-containers/mid-range',
    label: 'Compare glass picks',
  },
  {
    query: 'meal prep containers',
    answer: 'Choose by job: plastic tubs for budget batches, glass boxes for reheating, premium sets for stronger lids.',
    link: '#comparison',
    label: 'See top picks',
  },
  {
    query: 'free meal prep box',
    answer: 'Use the free checklist here first, then buy only the boxes you actually need for your weekly plan.',
    link: '#free-meal-prep-box',
    label: 'Use checklist',
  },
  {
    query: 'meal prep boxes for work',
    answer: 'Pick rectangular 900ml to 1 litre containers that stack neatly and seal well in a bag.',
    link: '/blog/meal-prep-boxes-for-work-lunches',
    label: 'Work lunch guide',
  },
  {
    query: 'cheap meal prep tubs',
    answer: 'Budget plastic multipacks give the lowest cost per usable tub for freezer portions and batch cooking.',
    link: '/meal-prep-containers/budget',
    label: 'Budget guide',
  },
];

const setupRows = [
  ['One person, work lunches', '5 rectangular lunch containers', 'Add 2-3 small sauce or snack tubs.'],
  ['Lunches and dinners', '10 meal containers', 'Glass for reheating, plastic tubs for freezer overflow.'],
  ['Student or budget prep', '10+ plastic tubs', 'Prioritise quantity and stackability over premium materials.'],
  ['Saucy meals and soup', 'Twist-lid tubs plus glass boxes', 'Test lids with water before commuting.'],
  ['Small kitchen', '5 identical boxes', 'Avoid mixed sets if lid clutter is already a problem.'],
];

const faqs = [
  {
    q: 'What are the best meal prep containers for most people?',
    a: 'For most UK meal preppers, five rectangular glass containers around 900ml to 1 litre are the best all-round choice because they suit work lunches, reheating and fridge stacking.',
  },
  {
    q: 'Are plastic or glass meal prep containers better?',
    a: 'Plastic is better for low cost, light commuting and bulk freezer portions. Glass is better for reheating, stain resistance and long-term daily use.',
  },
  {
    q: 'How many meal prep containers do I need?',
    a: 'For one person, five lunch containers is the minimum. Six to eight is more practical for lunches, and ten to twelve works better if you prep lunches and dinners.',
  },
  {
    q: 'Can I get a free meal prep box?',
    a: 'This page gives you a free meal prep box checklist and free meal plan generator links, but it does not promise a free physical product. Use the checklist to avoid buying a set that is too big or too small.',
  },
];

const products = getContainerProducts(HUB_PRODUCT_IDS);

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Best Meal Prep Containers UK',
    description:
      'Compare the best meal prep containers UK: budget plastic tubs, mid-range glass boxes, leakproof lunch containers and premium meal prep sets.',
    url: 'https://www.mealprep.org.uk/meal-prep-containers',
    isPartOf: {
      '@type': 'WebSite',
      name: 'MealPrep.org.uk',
      url: 'https://www.mealprep.org.uk',
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: products.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: product.name,
        url: product.href,
      })),
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.mealprep.org.uk' },
      { '@type': 'ListItem', position: 2, name: 'Meal Prep Containers', item: 'https://www.mealprep.org.uk/meal-prep-containers' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  },
];

export default function ContainerHub() {
  return (
    <>
      <SEO
        title="Best Meal Prep Containers UK 2026: Glass, Plastic & Leakproof Boxes"
        description="Compare the best meal prep containers UK: budget plastic tubs, mid-range glass boxes, leakproof lunch containers and a free meal prep box checklist."
        canonical="/meal-prep-containers"
        ogImage="https://www.mealprep.org.uk/meal-containers-ad.jpg"
        jsonLd={jsonLd}
      />

      <div className="page content-page container-guide-page container-hub-page">
        <nav className="breadcrumb">
          <Link to="/">Home</Link> <span aria-hidden>&rsaquo;</span>{' '}
          <span>Meal Prep Containers</span>
        </nav>

        <SiteLogo variant="page" className="page-header-logo" />

        <section className="container-guide-hero container-hub-hero">
          <div className="container-guide-copy">
            <span className="offer-kicker">Container buying guide</span>
            <h1>Best Meal Prep Containers UK</h1>
            <p className="content-intro">
              Compare budget plastic tubs, glass meal prep containers, leakproof lunch boxes
              and premium sets before you buy. If you only want one sensible starting point,
              choose five rectangular glass containers around 900ml to 1 litre.
            </p>
            <div className="container-guide-actions">
              <a href="#comparison" className="btn-primary">Compare top picks</a>
              <a href="#chooser" className="btn-secondary">Use the container chooser</a>
              <Link to="/" className="btn-secondary">Generate a free meal plan</Link>
            </div>
            <p className="affiliate-disclosure">{AFFILIATE_DISCLOSURE}</p>
          </div>
          <div className="container-hub-answer" aria-label="Quick answer">
            <strong>Quick answer</strong>
            <p>
              Best overall: mid-range glass. Best cheap option: plastic multipacks.
              Best for commuting: leak-focused boxes with strong lids. Best first setup:
              five lunch boxes plus a few small sauce tubs.
            </p>
          </div>
        </section>

        <div className="container-tier-nav" aria-label="Meal prep container guides">
          <Link to="/meal-prep-containers" className="container-tier-link container-tier-link--active">
            Best containers
          </Link>
          <Link to="/meal-prep-containers/budget" className="container-tier-link">
            Budget
          </Link>
          <Link to="/meal-prep-containers/mid-range" className="container-tier-link">
            Glass and mid range
          </Link>
          <Link to="/meal-prep-containers/premium" className="container-tier-link">
            Premium
          </Link>
        </div>

        <section className="container-intent-section" aria-labelledby="container-query-heading">
          <div className="section-head-inline">
            <div>
              <h2 id="container-query-heading">Best container by search</h2>
              <p>
                Match the search intent before choosing a product. A cheap freezer tub,
                a work lunch box and a glass reheating container are not the same job.
              </p>
            </div>
          </div>
          <div className="content-table-wrap">
            <table className="content-table container-intent-table">
              <thead>
                <tr>
                  <th>Search</th>
                  <th>Best answer</th>
                  <th>Next step</th>
                </tr>
              </thead>
              <tbody>
                {queryRows.map(row => (
                  <tr key={row.query}>
                    <td>{row.query}</td>
                    <td>{row.answer}</td>
                    <td>
                      {row.link.startsWith('#') ? (
                        <a href={row.link}>{row.label}</a>
                      ) : (
                        <Link to={row.link}>{row.label}</Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="free-meal-prep-box" className="container-hub-callout" aria-labelledby="free-box-heading">
          <div>
            <span className="offer-kicker">Free setup checklist</span>
            <h2 id="free-box-heading">Looking for a free meal prep box?</h2>
            <p>
              If you mean a physical box, check the retailer offer carefully. If you mean a
              free meal prep box setup, start with this checklist: five lunch containers,
              two small sauce tubs, one larger freezer tub, labels, and a plan for what
              goes in each box.
            </p>
          </div>
          <Link to="/" className="btn-primary">Build the free meal plan first</Link>
        </section>

        <section aria-labelledby="setup-heading">
          <h2 id="setup-heading">How many meal prep boxes should you buy?</h2>
          <p>
            Do not buy the biggest set first. Buy enough containers for the meals you
            actually prep, then add extras only when the habit is stable.
          </p>
          <div className="content-table-wrap">
            <table className="content-table">
              <thead>
                <tr>
                  <th>Prep style</th>
                  <th>Starter setup</th>
                  <th>Useful extra</th>
                </tr>
              </thead>
              <tbody>
                {setupRows.map(row => (
                  <tr key={row[0]}>
                    <td>{row[0]}</td>
                    <td>{row[1]}</td>
                    <td>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div id="chooser">
          <ContainerFinder currentTier="mid-range" />
        </div>

        <div id="comparison">
          <AffiliateProductGrid
            title="Best meal prep containers to compare first"
            intro="These picks cover the main buying jobs: budget batch cooking, everyday glass reheating, freezer tubs, premium leak resistance and a fuller weekly setup."
            productIds={HUB_PRODUCT_IDS}
            sourcePage="container-hub"
            showDisclosure={false}
          />
        </div>

        <section>
          <h2>Glass, plastic or premium?</h2>
          <p>
            Glass is the best default if you reheat meals often or cook tomato-heavy
            dishes such as chilli, curry, pasta sauce and stew. Plastic is better if
            you need lots of low-cost tubs, commute with lighter lunches or freeze
            many portions at once.
          </p>
          <p>
            Premium sets are worth considering once you already meal prep every week.
            They make most sense when weak lids, awkward storage or stained tubs are
            the thing stopping the habit from feeling easy.
          </p>
        </section>

        <h2>Frequently Asked Questions</h2>
        <div className="faq">
          {faqs.map(item => (
            <div key={item.q} className="faq-item">
              <h3>{item.q}</h3>
              <p>{item.a}</p>
            </div>
          ))}
        </div>

        <h2>Related Container Guides</h2>
        <ul className="plan-links">
          <li><Link to="/blog/best-meal-prep-containers-uk">Best meal prep containers UK buying guide</Link></li>
          <li><Link to="/blog/glass-vs-plastic-meal-prep-containers">Glass vs plastic meal prep containers</Link></li>
          <li><Link to="/blog/leakproof-meal-prep-containers-uk">Leakproof meal prep containers UK</Link></li>
          <li><Link to="/blog/meal-prep-container-size-guide">Meal prep container size guide</Link></li>
          <li><Link to="/blog/how-many-meal-prep-containers-do-you-need">How many meal prep containers do you need?</Link></li>
        </ul>
      </div>
      <Footer />
    </>
  );
}
