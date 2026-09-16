import { Link } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import PageHeroVisual from '../components/PageHeroVisual.jsx';
import { SITE_VISUALS } from '../data/visualAssets.js';
import { SITE_URL } from '../constants/site.js';
import { MEAL_PREP_PDF_SLUGS, getPdfProductBySlug } from '../data/mealPrepPdfProducts.js';
import { checkoutUrl } from '../utils/lemonSqueezy.js';

function formatPrice(value) {
  return `£${value.toFixed(2)}`;
}

const CANONICAL = '/meal-prep-pdfs';

export default function ShopIndexPage() {
  const products = MEAL_PREP_PDF_SLUGS.map(getPdfProductBySlug);
  const singles = products.filter(p => p.kind === 'single');
  const bundles = products.filter(p => p.kind === 'bundle');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: '6-Week Meal Prep PDF Plans',
    url: `${SITE_URL}${CANONICAL}`,
    itemListElement: products.map((p, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${SITE_URL}/meal-prep-pdfs/${p.slug}`,
      name: p.name,
    })),
  };

  return (
    <>
      <SEO
        title="6-Week Meal Prep PDF Plans — Aldi & Lidl | MealPrep.org.uk"
        description="Downloadable 6-week dinner and high-protein meal plans for two, built around Aldi and Lidl. Weekly planner, aisle-organised shopping list, 24 recipes with nutrition."
        canonical={CANONICAL}
        jsonLd={jsonLd}
      />

      <div className="shop-page">
        <section className="mealprep-plus-hero shop-hero">
          <div className="mealprep-plus-hero-copy">
            <span className="offer-kicker">Paid PDF meal plans</span>
            <h1>Six weeks of dinners, planned for you</h1>
            <p>
              Four downloadable 6-week meal plans for two, built around Aldi and Lidl. Each one
              has a weekly planner, a shopping list organised by aisle, 24 dinner recipes with the
              nutrition worked out, cupboard basics, ingredient swaps and a blank planner to keep
              going after week six.
            </p>
            <div className="mealprep-plus-actions">
              <Link to="/browse" className="btn-secondary">Prefer a free plan? Browse the library</Link>
            </div>
          </div>
          <PageHeroVisual visual={SITE_VISUALS.printable} className="mealprep-plus-visual" priority />
        </section>

        <section className="mealprep-plus-band shop-band" aria-labelledby="shop-singles-heading">
          <div>
            <span className="offer-kicker">Single plans — £9.99 each</span>
            <h2 id="shop-singles-heading">Pick your supermarket and goal</h2>
          </div>
          <div className="mealprep-plus-grid">
            {singles.map(p => (
              <Link className="mealprep-plus-tile shop-tile-link" to={`/meal-prep-pdfs/${p.slug}`} key={p.slug}>
                <h3>{p.name}</h3>
                <p>{p.tagline} · {p.pages} pages</p>
                <p className="shop-tile-status">{checkoutUrl(p.checkoutEnvVar) ? formatPrice(p.priceGBP) : 'Available soon'}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mealprep-plus-fit shop-bundle-of" aria-labelledby="shop-bundles-heading">
          <div className="mealprep-plus-section-head">
            <span className="offer-kicker">Bundles</span>
            <h2 id="shop-bundles-heading">Save by buying more than one</h2>
          </div>
          <div className="mealprep-plus-grid">
            {bundles.map(p => (
              <Link className="mealprep-plus-tile shop-tile-link" to={`/meal-prep-pdfs/${p.slug}`} key={p.slug}>
                <h3>{p.name}</h3>
                <p>{p.tagline}</p>
                <p className="shop-tile-status">{checkoutUrl(p.checkoutEnvVar) ? formatPrice(p.priceGBP) : 'Available soon'}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mealprep-plus-note shop-disclaimer" aria-label="Trademark disclaimer">
          <p>
            Named after Aldi and Lidl only to describe where the ingredients are bought.
            MealPrep.org.uk is not affiliated with, endorsed by, or connected to either supermarket.
          </p>
          <p>One-off purchases only — no subscriptions, memberships or licence keys.</p>
        </section>
      </div>

      <Footer />
    </>
  );
}
