import { Link, useParams } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import { SITE_AUTHOR_NAME, SITE_AUTHOR_URL } from '../constants/site.js';
import ContextualNextStep from '../components/ContextualNextStep.jsx';
import Footer from '../components/Footer.jsx';
import SiteLogo from '../components/SiteLogo.jsx';
import AffiliateProductGrid from '../components/AffiliateProductGrid.jsx';
import ContainerFinder from '../components/ContainerFinder.jsx';
import ContainerGuideNav from '../components/ContainerGuideNav.jsx';
import NotFound from './NotFound.jsx';
import ContainerQuickComparison from '../components/ContainerQuickComparison.jsx';
import {
  AFFILIATE_DISCLOSURE,
  CONTAINER_GUIDES,
  getContainerProduct,
  getContainerProducts,
} from '../data/containerProducts.js';
import { CONTAINER_GUIDE_GROUPS } from '../data/containerGuideGroups.js';
import { CONTAINER_LAST_CHECKED } from '../utils/containerSetup.js';
import { toTitleCase } from '../utils/textFormatting.js';

const guideLabels = CONTAINER_GUIDE_GROUPS
  .flatMap(group => group.guides)
  .reduce((labels, guide) => ({ ...labels, [guide.slug]: guide.label }), {});

const searchIntentRows = [
  {
    intent: 'Best meal prep containers UK',
    best: 'Quick size comparison',
    why: 'Best balance of reheating, stain resistance, lid quality and sensible price.',
    path: '/meal-prep-containers',
  },
  {
    intent: 'Glass meal prep containers',
    best: 'Five-pack rectangular glass sets',
    why: 'Best for reheating, stain resistance and everyday work lunches.',
    path: '/meal-prep-containers/glass',
  },
  {
    intent: 'Plastic meal prep containers',
    best: 'Plastic multipacks',
    why: 'Lowest cost per box for batch cooking, freezer portions and beginner meal prep.',
    path: '/meal-prep-containers/plastic',
  },
  {
    intent: 'Leakproof meal prep containers',
    best: 'Clip-lock or twist-lid sets',
    why: 'Better fit for commuting, soup, chilli, salad dressing and saucy meals.',
    path: '/meal-prep-containers/leakproof',
  },
  {
    intent: 'Freezer safe meal prep containers',
    best: 'Bulk tubs and freezer-friendly glass',
    why: 'Best for batch cooking, leftovers and freezer rotation.',
    path: '/meal-prep-containers/freezer-safe',
  },
  {
    intent: 'Best freezer bags for meal prep',
    best: 'Reusable silicone freezer bags',
    why: 'Best for flat-freezing soups, sauces, smoothie packs and batch-cooked portions.',
    path: '/meal-prep-containers/freezer-bags',
  },
  {
    intent: 'Meal prep boxes for work',
    best: 'Rectangular lunch containers',
    why: 'Easy to stack, pack and portion for five weekday lunches.',
    path: '/meal-prep-containers/work-lunch',
  },
  {
    intent: 'Large meal prep container set',
    best: '10 pack, 20 pack or bulk sets',
    why: 'Best when five lunch boxes are not enough for dinners, family prep or freezer batches.',
    path: '/meal-prep-containers/large-sets',
  },
];

function guideLabel(slug) {
  return guideLabels[slug] || slug.charAt(0).toUpperCase() + slug.slice(1);
}

export default function ContainerGuide() {
  const { tier } = useParams();
  const guide = CONTAINER_GUIDES[tier];

  if (!guide) return <NotFound />;

  const products = getContainerProducts(guide.productIds);
  const heroProduct = getContainerProduct(guide.heroProductId);
  const canonical = `/meal-prep-containers/${guide.slug}`;
  const quickComparisonPicks = products.slice(0, 3).map(product => ({
    product,
    searchedFor: guide.h1,
    sizeLabel: product.badge,
    sizeFocus: `${product.setSize} - ${product.layout}`,
    fit: product.bestFor,
  }));

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: guide.h1,
      description: guide.description,
      url: `https://www.mealprep.org.uk${canonical}`,
      isPartOf: {
        '@type': 'WebSite',
        name: 'MealPrep.org.uk',
        url: 'https://www.mealprep.org.uk',
      },
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: products.map((product, index) => (
          {
            '@type': 'ListItem',
            position: index + 1,
            name: product.name,
            url: product.href,
            item: { '@id': productJsonLdId(canonical, product) },
          }
        )),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.mealprep.org.uk' },
        { '@type': 'ListItem', position: 2, name: 'Meal Prep Containers', item: 'https://www.mealprep.org.uk/meal-prep-containers' },
        { '@type': 'ListItem', position: 3, name: guide.h1, item: `https://www.mealprep.org.uk${canonical}` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: guide.faq.map(item => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
    ...products.map(product => buildProductJsonLd(product, canonical)),
  ];

  return (
    <>
      <SEO
        title={`${guide.title} | MealPrep.org.uk`}
        description={guide.description}
        canonical={canonical}
        jsonLd={jsonLd}
      />

      <div className="page content-page container-guide-page">
        <nav className="breadcrumb">
          <Link to="/">Home</Link> <span aria-hidden>&rsaquo;</span>{' '}
          <Link to="/meal-prep-containers">Meal Prep Containers</Link>{' '}
          <span aria-hidden>&rsaquo;</span> <span>{guideLabel(guide.slug)}</span>
        </nav>

        <SiteLogo variant="page" className="page-header-logo" />

        <ContainerQuickComparison
          eyebrow={`Sponsored #ad - ${guide.kicker}`}
          title={guide.h1}
          intro={guide.quickComparisonIntro || `Quickly compare ${guideLabel(guide.slug).toLowerCase()} picks by size, material and use. The full buying notes continue below.`}
          picks={quickComparisonPicks}
          fastPick={guide.fastPickText || (heroProduct ? `Start with ${heroProduct.shortName} if you want the main ${guideLabel(guide.slug).toLowerCase()} recommendation, then scroll for all ${products.length} picks and buying notes.` : null)}
          headingLevel="h1"
          sourcePage={`${guide.slug}-quick-comparison`}
        />

        <div id="comparison">
        <AffiliateProductGrid
            title={guide.productGridTitle || `Best ${guideLabel(guide.slug).toLowerCase()} meal prep containers`}
            intro={guide.productGridIntro || 'Each recommendation is chosen for a different buyer job: low cost, glass upgrade, divided portions, leak resistance, commuting, or a fuller weekly setup.'}
            productIds={guide.productIds}
            sourcePage={`${guide.slug}-guide`}
            showDisclosure={false}
            showQuickComparison={false}
        />

        <ContextualNextStep
          eyebrow="Before you buy"
          title="Match the set size to your actual prep week"
          description="Use the free count tool if you are unsure whether you need five boxes, ten boxes or freezer extras."
          primary={{ to: '/tools#container-count-calculator', label: 'Calculate my container count' }}
          secondary={[
            { to: '/quiz', label: 'Find a meal plan to portion' },
            { to: '/meal-prep-containers', label: 'Compare all container types' },
          ]}
          pageType={`container-guide-${guide.slug}`}
          className="container-contextual-next-step"
        />
        </div>

        <section className="container-comparison-section" aria-labelledby="container-comparison-heading">
          <div className="section-head-inline">
            <div>
              <h2 id="container-comparison-heading">{toTitleCase('Full comparison table')}</h2>
              <p>
                Use this if you want the deeper side-by-side details before opening an Amazon UK listing.
              </p>
            </div>
          </div>
          <p className="affiliate-disclosure">{AFFILIATE_DISCLOSURE}</p>
          <div className="content-table-wrap">
            <table className="content-table container-comparison-table">
              <thead>
                <tr>
                  <th scope="col">Pick</th>
                  <th scope="col">Best for</th>
                  <th scope="col">Material</th>
                  <th scope="col">Format</th>
                  <th scope="col">Layout</th>
                  <th scope="col">Watch-out</th>
                  <th scope="col">Checked</th>
                  <th scope="col">Amazon</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td>
                      <strong>{product.badge}</strong>
                      <span>{product.shortName}</span>
                    </td>
                    <td>{product.bestFor}</td>
                    <td>{product.material}</td>
                    <td>{product.setSize}</td>
                    <td>{product.layout}</td>
                    <td>{product.watchOut}</td>
                    <td>{product.lastChecked || CONTAINER_LAST_CHECKED}</td>
                    <td>
                      <a
                        href={product.href}
                        target="_blank"
                        rel="noopener noreferrer nofollow sponsored"
                        data-event="container_product_click"
                        data-affiliate-category="meal-prep-containers"
                        data-product-name={product.name}
                        data-source-page={`${guide.slug}-comparison-table`}
                        data-offer={product.name}
                      >
                        View deal
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <ContainerGuideNav currentSlug={guide.slug} />

        <ContainerFinder currentTier={guide.slug} />

        <section className="container-search-match" aria-labelledby="container-intent-heading">
          <div className="section-head-inline">
            <div>
              <h2 id="container-intent-heading">Choose by how you will use it</h2>
              <p>
                Start with the job you need the container to do: cheap plastic tubs, glass meal prep boxes,
                leakproof lunch containers, freezer bags or a work-lunch setup.
              </p>
            </div>
          </div>
          <div className="container-search-grid">
            {searchIntentRows.map(row => (
              <article key={row.intent} className="container-search-card">
                <span>Search</span>
                <h3>{toTitleCase(row.intent)}</h3>
                <p><strong>{toTitleCase(row.best)}:</strong> {row.why}</p>
                <Link to={row.path}>Compare</Link>
              </article>
            ))}
          </div>
        </section>

        {guide.sections.map(section => (
          <section key={section.h2}>
            <h2>{toTitleCase(section.h2)}</h2>
            {section.paragraphs.map(paragraph => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}

        <h2>Frequently Asked Questions</h2>
        <div className="faq">
          {guide.faq.map(item => (
            <div key={item.q} className="faq-item">
              <h3>{item.q}</h3>
              <p>{item.a}</p>
            </div>
          ))}
        </div>

        <h2>Related Container Guides</h2>
        <ul className="plan-links">
          <li><Link to="/meal-prep-containers">Best meal prep containers UK</Link></li>
          <li><Link to="/meal-prep-containers/glass">Glass meal prep containers UK</Link></li>
          <li><Link to="/meal-prep-containers/plastic">Plastic meal prep containers UK</Link></li>
          <li><Link to="/meal-prep-containers/leakproof">Leakproof meal prep containers UK</Link></li>
          <li><Link to="/meal-prep-containers/freezer-safe">Freezer safe meal prep containers UK</Link></li>
          <li><Link to="/meal-prep-containers/freezer-bags">Freezer bags for meal prep UK</Link></li>
          <li><Link to="/meal-prep-containers/work-lunch">Meal prep boxes for work UK</Link></li>
          <li><Link to="/meal-prep-containers/large-sets">Large meal prep container sets UK</Link></li>
          <li><Link to="/blog/best-meal-prep-containers-uk">Detailed container buying guide</Link></li>
          <li><Link to="/meal-prep-containers/freezer-bags">Best freezer bags for meal prep UK</Link></li>
          <li><Link to="/blog/glass-vs-plastic-meal-prep-containers">Glass vs plastic meal prep containers</Link></li>
          <li><Link to="/blog/meal-prep-container-size-guide">Meal prep container size guide</Link></li>
        </ul>
      </div>
      <Footer />
    </>
  );
}

function productJsonLdId(canonical, product) {
  return `https://www.mealprep.org.uk${canonical}#product-${product.id}`;
}

// Product structured data for the buying guide.
//
// The review describes assessment that genuinely exists on the page — the
// summary, buy-if, avoid-if, pros and cons are all rendered to the reader — and
// deliberately carries no reviewRating, price, availability or aggregateRating,
// because the site maintains none of those. The page itself states that the
// assessment "follow[s] current Amazon listing or manufacturer information, not
// hands-on testing", so the markup is not a stronger claim than the visible
// content.
//
// The author was previously '@type': 'Team', which is not a schema.org type and
// is not one of the two types Google accepts for a review author (Person or
// Organization). An editorial team is an Organization, not a Person.
function buildProductJsonLd(product, canonical) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': productJsonLdId(canonical, product),
    name: product.name,
    description: product.summary,
    sku: product.asin,
    url: product.href,
    review: {
      '@type': 'Review',
      name: `${product.shortName || product.name} assessment`,
      author: {
        '@type': 'Organization',
        name: SITE_AUTHOR_NAME,
        url: SITE_AUTHOR_URL,
      },
      reviewBody: `${product.summary} ${product.buyIf} ${product.avoidIf}`,
      positiveNotes: {
        '@type': 'ItemList',
        itemListElement: (product.pros || []).map((note, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: note,
        })),
      },
      negativeNotes: {
        '@type': 'ItemList',
        itemListElement: (product.cons || []).map((note, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: note,
        })),
      },
    },
  };
}
