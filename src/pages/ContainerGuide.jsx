import { Link, Navigate, useParams } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import SiteLogo from '../components/SiteLogo.jsx';
import AffiliateProductGrid from '../components/AffiliateProductGrid.jsx';
import ContainerFinder from '../components/ContainerFinder.jsx';
import {
  AFFILIATE_DISCLOSURE,
  CONTAINER_GUIDES,
  getContainerProduct,
  getContainerProducts,
} from '../data/containerProducts.js';
import { CONTAINER_LAST_CHECKED } from '../utils/containerSetup.js';
import { toTitleCase } from '../utils/textFormatting.js';

const guideOrder = ['budget', 'mid-range', 'premium'];

const searchIntentRows = [
  {
    intent: 'Best meal prep containers UK',
    best: 'Mid range glass containers',
    why: 'Best balance of reheating, stain resistance, lid quality and sensible price.',
    path: '/meal-prep-containers/mid-range',
  },
  {
    intent: 'Budget meal prep tubs',
    best: 'Plastic multipacks',
    why: 'Lowest cost per box for batch cooking, freezer portions and beginner meal prep.',
    path: '/meal-prep-containers/budget',
  },
  {
    intent: 'Glass meal prep containers',
    best: 'Five-pack rectangular glass sets',
    why: 'Good for work lunches, curry, chilli, pasta and repeat microwave reheating.',
    path: '/meal-prep-containers/mid-range',
  },
  {
    intent: 'Leakproof lunch boxes',
    best: 'Premium clip-lock or twist-lock sets',
    why: 'Better fit for commuting, soup, chilli, salad dressing and saucy meals.',
    path: '/meal-prep-containers/premium',
  },
  {
    intent: 'Meal prep boxes for work',
    best: 'Rectangular lunch containers',
    why: 'Easy to stack, pack and portion for five weekday lunches.',
    path: '/meal-prep-containers/mid-range',
  },
];

function guideLabel(slug) {
  if (slug === 'mid-range') return 'Mid range';
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

export default function ContainerGuide() {
  const { tier } = useParams();
  const guide = CONTAINER_GUIDES[tier];

  if (!guide) return <Navigate to="/meal-prep-containers/mid-range" replace />;

  const products = getContainerProducts(guide.productIds);
  const heroProduct = getContainerProduct(guide.heroProductId);
  const heroImage = heroProduct?.image || guide.heroImage;
  const canonical = `/meal-prep-containers/${guide.slug}`;

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
            item: {
              '@type': 'Product',
              name: product.name,
              image: product.image,
              description: product.summary,
              sku: product.asin,
            },
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
    ...products.map(product => buildProductReviewJsonLd(product)),
  ];

  return (
    <>
      <SEO
        title={`${guide.title} | MealPrep.org.uk`}
        description={guide.description}
        canonical={canonical}
        ogImage={`https://www.mealprep.org.uk${guide.heroImage}`}
        jsonLd={jsonLd}
      />

      <div className="page content-page container-guide-page">
        <nav className="breadcrumb">
          <Link to="/">Home</Link> <span aria-hidden>&rsaquo;</span>{' '}
          <Link to="/meal-prep-containers">Meal Prep Containers</Link>{' '}
          <span aria-hidden>&rsaquo;</span> <span>{guideLabel(guide.slug)}</span>
        </nav>

        <SiteLogo variant="page" className="page-header-logo" />

        <section className="container-guide-hero">
          <div className="container-guide-copy">
            <span className="offer-kicker">Sponsored #ad - {guide.kicker}</span>
            <h1>{guide.h1}</h1>
            <p className="content-intro">{guide.intro}</p>
            <div className="container-guide-actions">
              {heroProduct && (
                <a
                  href={heroProduct.href}
                  target="_blank"
                  rel="noopener noreferrer nofollow sponsored"
                  className="btn-primary"
                  data-event="container_product_click"
                  data-source-page={`${guide.slug}-hero`}
                  data-offer={heroProduct.name}
                >
                  Check top pick on Amazon UK
                </a>
              )}
              <a href="#comparison" className="btn-secondary">
                Compare all 6 picks
              </a>
            </div>
            <p className="affiliate-disclosure">{AFFILIATE_DISCLOSURE}</p>
          </div>
          {heroProduct && (
            <a
              href={heroProduct.href}
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
              className="container-guide-image"
              data-event="container_product_click"
              data-source-page={`${guide.slug}-hero-image`}
              data-offer={heroProduct.name}
            >
              <img src={heroImage} alt={`${heroProduct.name} for meal prep`} />
            </a>
          )}
        </section>

        <div className="container-tier-nav" aria-label="Meal prep container price bands">
          {guideOrder.map(slug => (
            <Link
              key={slug}
              to={`/meal-prep-containers/${slug}`}
              className={slug === guide.slug ? 'container-tier-link container-tier-link--active' : 'container-tier-link'}
            >
              {guideLabel(slug)}
            </Link>
          ))}
        </div>

        <section className="conversion-panel" aria-label="Buying guide summary">
          <div>
            <strong>{toTitleCase(guide.priceBand)}</strong>
            <span>
              Compare six Amazon UK meal prep boxes, tubs, and containers for this price tier.
            </span>
          </div>
          {heroProduct && (
            <a
              href={heroProduct.href}
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
              className="conversion-panel-btn"
              data-event="container_product_click"
              data-source-page={`${guide.slug}-summary`}
              data-offer={heroProduct.name}
            >
              View top pick
            </a>
          )}
        </section>

        <section className="container-comparison-section" aria-labelledby="container-comparison-heading">
          <div className="section-head-inline">
            <div>
                <h2 id="container-comparison-heading">{toTitleCase('Quick comparison')}</h2>
              <p>
                Shortlist by material, format, layout and buyer need before opening the Amazon UK listing.
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

        <div id="comparison">
          <AffiliateProductGrid
            title={`Best ${guideLabel(guide.slug).toLowerCase()} meal prep containers`}
            intro="Each recommendation is chosen for a different buyer job: low cost, glass upgrade, divided portions, leak resistance, commuting, or a fuller weekly setup."
            productIds={guide.productIds}
            sourcePage={`${guide.slug}-guide`}
            showDisclosure={false}
          />
        </div>

        <ContainerFinder currentTier={guide.slug} />

        <section className="container-intent-section" aria-labelledby="container-intent-heading">
          <div className="section-head-inline">
            <div>
              <h2 id="container-intent-heading">Best container by search intent</h2>
              <p>
                Match the buyer need first: cheap plastic tubs, glass meal prep boxes,
                leakproof lunch containers or a work-lunch setup.
              </p>
            </div>
          </div>
          <div className="content-table-wrap">
            <table className="content-table container-intent-table">
              <thead>
                <tr>
                  <th scope="col">Search</th>
                  <th scope="col">{toTitleCase('Best choice')}</th>
                  <th scope="col">Why</th>
                  <th scope="col">Guide</th>
                </tr>
              </thead>
              <tbody>
                {searchIntentRows.map(row => (
                  <tr key={row.intent}>
                    <td>{toTitleCase(row.intent)}</td>
                    <td>{toTitleCase(row.best)}</td>
                    <td>{row.why}</td>
                    <td><Link to={row.path}>Compare</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
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
          <li><Link to="/blog/best-meal-prep-containers-uk">Detailed container buying guide</Link></li>
          <li><Link to="/blog/glass-vs-plastic-meal-prep-containers">Glass vs plastic meal prep containers</Link></li>
          <li><Link to="/blog/leakproof-meal-prep-containers-uk">Leakproof meal prep containers UK</Link></li>
          <li><Link to="/blog/meal-prep-container-size-guide">Meal prep container size guide</Link></li>
        </ul>
      </div>
      <Footer />
    </>
  );
}

function buildProductReviewJsonLd(product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.image,
    description: product.summary,
    sku: product.asin,
    url: product.href,
    review: {
      '@type': 'Review',
      author: {
        '@type': 'Organization',
        name: 'MealPrep.org.uk',
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
