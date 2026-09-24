import { Link, useParams } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import PageHeroVisual from '../components/PageHeroVisual.jsx';
import { SITE_VISUALS } from '../data/visualAssets.js';
import { SITE_URL, SITE_CONTACT_EMAIL } from '../constants/site.js';
import {
  MEAL_PREP_PDF_SLUGS,
  getPdfProductBySlug,
} from '../data/mealPrepPdfProducts.js';
import { checkoutUrl } from '../utils/lemonSqueezy.js';
import NotFound from './NotFound.jsx';

function formatPrice(value) {
  return `£${value.toFixed(2)}`;
}

// Every single plan has 24 dinner recipes (see INCLUDES in mealPrepPdfProducts.js);
// a bundle's recipe count is the sum of the plans it bundles.
const DINNERS_PER_PLAN = 24;

function roundToTen(value) {
  return Math.round(value / 10) * 10;
}

function formatGBPRange(low, high) {
  return `£${roundToTen(low).toLocaleString('en-GB')}–${roundToTen(high).toLocaleString('en-GB')}`;
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

  const totalDinners = product.bundleOf ? product.bundleOf.length * DINNERS_PER_PLAN : DINNERS_PER_PLAN;
  const costRange = formatGBPRange(totalDinners * 3, totalDinners * 5);
  const eatOutRange = formatGBPRange(totalDinners * 10, totalDinners * 15);
  const savingsRange = formatGBPRange(totalDinners * 7, totalDinners * 10);

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
                <a
                  className="btn-primary"
                  href={buyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-event="pdf_checkout_click"
                  data-offer={product.name}
                  data-plan-slug={product.slug}
                  data-source-page={canonical}
                  data-cta-location="shop-buy-box"
                >
                  Get instant access — download in 2 minutes
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
            ) : (
              <p className="shop-available-soon-note">
                Not happy with it? Email{' '}
                <a href={`mailto:${SITE_CONTACT_EMAIL}`}>{SITE_CONTACT_EMAIL}</a> and we&apos;ll sort out
                a refund.
              </p>
            )}

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

        <section className="mealprep-plus-fit shop-social-proof" aria-labelledby="shop-proof-heading">
          <div className="mealprep-plus-section-head">
            <span className="offer-kicker">What you're getting</span>
            <h2 id="shop-proof-heading">Why choose this plan</h2>
          </div>
          <ul className="shop-proof-list">
            <li><strong>Six weeks planned</strong> — from shopping to table, no weekly decisions</li>
            <li><strong>Curated recipes</strong> — chosen for taste, cost, and supermarket availability</li>
            <li><strong>One-off purchase</strong> — no subscription, no hidden charges</li>
            <li><strong>Instant download</strong> — use it tonight, no waiting</li>
          </ul>
        </section>

        <section className="mealprep-plus-fit shop-faq" aria-labelledby="shop-faq-heading">
          <div className="mealprep-plus-section-head">
            <span className="offer-kicker">Questions answered</span>
            <h2 id="shop-faq-heading">Frequently asked</h2>
          </div>
          <div className="shop-faq-grid">
            <details className="shop-faq-item">
              <summary>Will I actually cook all these recipes?</summary>
              <p>These recipes are chosen for taste and simplicity—most take under 30 minutes. The six-week structure lets you swap recipes freely if your mood or schedule changes. Treat it as a flexible guide, not a rigid commitment.</p>
            </details>
            <details className="shop-faq-item">
              <summary>How much money will I save?</summary>
              <p>A typical dinner at {product.supermarket || 'Aldi or Lidl'} for two costs £3–5 in ingredients. These recipes are built within that budget. Across the {totalDinners} dinners, you'll spend roughly {costRange} versus {eatOutRange} for the same meals eaten out. The PDF itself pays for itself in under a week.</p>
            </details>
            <details className="shop-faq-item">
              <summary>Can I adapt recipes for my family size?</summary>
              <p>Yes. These recipes are written for two, with ingredient quantities easy to halve or double. Most dinners scale proportionally—just adjust portions and cooking time slightly.</p>
            </details>
            <details className="shop-faq-item">
              <summary>{product.supermarket ? `What if I don't like ${product.supermarket}?` : 'What if I only shop at one supermarket?'}</summary>
              <p>{product.supermarket
                ? `The recipes use ${product.supermarket} brands and own-label products, but most ingredients are common enough to swap across supermarkets without losing much on cost or quality.`
                : 'Each recipe is labelled by supermarket, so you can stick to just the Aldi half or just the Lidl half of the collection if you only shop at one.'}</p>
            </details>
          </div>
        </section>

        <section className="mealprep-plus-fit shop-value" aria-labelledby="shop-value-heading">
          <div className="mealprep-plus-section-head">
            <span className="offer-kicker">Your win</span>
            <h2 id="shop-value-heading">What you get for {formatPrice(product.priceGBP)}</h2>
          </div>
          <div className="shop-value-comparison">
            <div className="shop-value-item">
              <p className="shop-value-label">Time saved</p>
              <p className="shop-value-stat">7+ hours</p>
              <p className="shop-value-detail">No weekly meal planning, shopping list juggling, or dinner-time panic</p>
            </div>
            <div className="shop-value-item">
              <p className="shop-value-label">Money saved</p>
              <p className="shop-value-stat">{savingsRange}</p>
              <p className="shop-value-detail">Planned {product.supermarket || 'Aldi and Lidl'} dinners cost 60–70% less than eating out</p>
            </div>
            <div className="shop-value-item">
              <p className="shop-value-label">Recipes</p>
              <p className="shop-value-stat">{totalDinners} dinners</p>
              <p className="shop-value-detail">Mix-and-match across six weeks to keep meals interesting</p>
            </div>
            <div className="shop-value-item">
              <p className="shop-value-label">Instant access</p>
              <p className="shop-value-stat">Download now</p>
              <p className="shop-value-detail">No waiting—use tonight or print for future weeks</p>
            </div>
          </div>
        </section>

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
