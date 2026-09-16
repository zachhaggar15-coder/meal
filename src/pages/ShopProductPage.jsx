import { Link, useParams } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import PageHeroVisual from '../components/PageHeroVisual.jsx';
import { SITE_VISUALS } from '../data/visualAssets.js';
import { SITE_URL } from '../constants/site.js';
import {
  MEAL_PREP_PDF_SLUGS,
  getPdfProductBySlug,
} from '../data/mealPrepPdfProducts.js';
import { checkoutUrl } from '../utils/lemonSqueezy.js';
import NotFound from './NotFound.jsx';

function formatPrice(value) {
  return `£${value.toFixed(2)}`;
}

export default function ShopProductPage() {
  const { slug } = useParams();
  const product = getPdfProductBySlug(slug);
  if (!product) return <NotFound />;

  const canonical = `/meal-prep-pdfs/${product.slug}`;
  const buyUrl = checkoutUrl(product.checkoutEnvVar);
  const image = `${SITE_URL}${SITE_VISUALS.printable.src}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image,
    brand: { '@type': 'Brand', name: 'MealPrep.org.uk' },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}${canonical}`,
      priceCurrency: 'GBP',
      price: product.priceGBP.toFixed(2),
      availability: buyUrl ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };

  const otherProducts = MEAL_PREP_PDF_SLUGS
    .filter(s => s !== product.slug)
    .map(s => getPdfProductBySlug(s));

  return (
    <>
      <SEO
        title={`${product.name} | ${product.tagline} | MealPrep.org.uk`}
        description={`${product.description} ${product.pages ? `${product.pages} pages, ` : ''}delivered as a PDF straight after purchase.`}
        canonical={canonical}
        jsonLd={jsonLd}
        ogType="product"
        ogImage={image}
      />

      <div className="shop-page">
        <section className="mealprep-plus-hero shop-hero">
          <div className="mealprep-plus-hero-copy">
            <span className="offer-kicker">{product.supermarket ? `${product.supermarket} · PDF meal plan` : 'PDF meal plan bundle'}</span>
            <h1>{product.name}</h1>
            <p className="shop-tagline">{product.tagline}</p>
            <p>{product.description}</p>

            <div className="shop-buy-box">
              <span className="shop-price">{formatPrice(product.priceGBP)}</span>
              {buyUrl ? (
                <a className="btn-primary" href={buyUrl} target="_blank" rel="noopener noreferrer">
                  Buy now — instant PDF download
                </a>
              ) : (
                <span className="btn-secondary shop-available-soon" aria-disabled="true">
                  Available soon
                </span>
              )}
            </div>
            {!buyUrl ? (
              <p className="shop-available-soon-note">
                This plan isn&apos;t on sale yet — check back soon, or browse the free plan library while you wait.
              </p>
            ) : null}

            <div className="mealprep-plus-actions">
              <Link to="/meal-prep-pdfs" className="shop-back-link">See all 6-week PDF plans</Link>
              <Link to="/browse" className="shop-back-link">Browse free plans</Link>
            </div>
          </div>
          <PageHeroVisual visual={SITE_VISUALS.printable} className="mealprep-plus-visual" priority />
        </section>

        {product.includes ? (
          <section className="mealprep-plus-band shop-band" aria-labelledby="shop-includes-heading">
            <div>
              <span className="offer-kicker">What&apos;s inside</span>
              <h2 id="shop-includes-heading">
                {product.pages ? `${product.pages} pages, ` : ''}A4 PDF, delivered instantly
              </h2>
              <p>One personal-use PDF, written and designed for MealPrep.org.uk. No supermarket logos or branding — just the plan.</p>
            </div>
            <ul className="mealprep-plus-checklist">
              {product.includes.map(item => <li key={item}>{item}</li>)}
            </ul>
          </section>
        ) : null}

        {product.bundleOf ? (
          <section className="mealprep-plus-fit shop-bundle-of" aria-labelledby="shop-bundle-heading">
            <div className="mealprep-plus-section-head">
              <span className="offer-kicker">In this bundle</span>
              <h2 id="shop-bundle-heading">What you get</h2>
            </div>
            <div className="mealprep-plus-grid">
              {product.bundleOf.map(s => {
                const p = getPdfProductBySlug(s);
                if (!p) return null;
                return (
                  <article className="mealprep-plus-tile" key={s}>
                    <h3>{p.name}</h3>
                    <p>{p.tagline}{p.pages ? ` · ${p.pages} pages` : ''}</p>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}

        <section className="mealprep-plus-fit shop-other-products" aria-labelledby="shop-other-heading">
          <div className="mealprep-plus-section-head">
            <span className="offer-kicker">More 6-week plans</span>
            <h2 id="shop-other-heading">Other PDF plans</h2>
          </div>
          <div className="mealprep-plus-grid">
            {otherProducts.map(p => (
              <Link className="mealprep-plus-tile shop-tile-link" to={`/meal-prep-pdfs/${p.slug}`} key={p.slug}>
                <h3>{p.name}</h3>
                <p>{p.tagline} · {formatPrice(p.priceGBP)}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mealprep-plus-note shop-disclaimer" aria-label="Trademark disclaimer">
          <p>{product.disclaimer}</p>
          <p>
            One-off purchase — no subscription, membership or licence key. Delivered by
            Lemon Squeezy straight after checkout, for personal use.
          </p>
        </section>
      </div>

      <Footer />
    </>
  );
}
