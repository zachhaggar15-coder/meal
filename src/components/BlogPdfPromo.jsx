import { Link } from 'react-router-dom';
import { getPdfProductBySlug } from '../data/mealPrepPdfProducts.js';

// Promotes specific paid 6-week PDF plans inside a blog post's own content —
// distinct from ShopHubPromo (a supermarket hub's fixed dinner+protein+bundle
// trio) and PdfUpsell (one plan matched to a free plan's goal). A blog post
// picks its own product slugs because the best match depends on what the
// article is actually about, not a supermarket or a single free plan.
export default function BlogPdfPromo({ title, intro, productSlugs, sourcePage }) {
  const products = (productSlugs || []).map(getPdfProductBySlug).filter(Boolean);
  if (!products.length) return null;

  return (
    <section className="pdf-hub-promo blog-pdf-promo" aria-label="6-week PDF meal plans">
      <div className="mealprep-plus-section-head">
        <span className="offer-kicker">Want six weeks planned, not just tonight?</span>
        <h2>{title || 'Turn this into a 6-week plan'}</h2>
        {intro ? <p>{intro}</p> : null}
      </div>
      <div className="mealprep-plus-grid pdf-hub-promo-grid">
        {products.map(p => (
          <Link
            className="mealprep-plus-tile shop-tile-link"
            to={`/meal-prep-pdfs/${p.slug}`}
            key={p.slug}
            data-event="pdf_promo_click"
            data-offer={p.name}
            data-plan-slug={p.slug}
            data-source-page={sourcePage}
            data-cta-location="blog-pdf-promo"
          >
            <h3>{p.name}</h3>
            <p>{p.tagline} · £{p.priceGBP.toFixed(2)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
