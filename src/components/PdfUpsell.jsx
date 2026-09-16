import { Link } from 'react-router-dom';
import { findMatchingPdfProduct } from '../data/mealPrepPdfProducts.js';

// Cross-sell from a free plan page to the matching paid 6-week PDF, for the
// two supermarkets that have one. Renders nothing for any other supermarket,
// or once the matching product is confirmed on sale in Lemon Squeezy — this
// is a nudge toward the product page, not a checkout shortcut, so it always
// links there rather than reading "Available soon" state itself.
export default function PdfUpsell({ supermarket, goal }) {
  const product = findMatchingPdfProduct({ supermarket, goal });
  if (!product) return null;

  return (
    <aside className="pdf-upsell" aria-label="6-week PDF plan">
      <p className="pdf-upsell-eyebrow">Like this plan?</p>
      <p className="pdf-upsell-copy">
        Get <strong>{product.tagline.toLowerCase()}</strong> as a printable PDF —
        {product.pages ? ` ${product.pages} pages, ` : ' '}
        six weeks of {product.supermarket} dinners for two, planned out.
      </p>
      <Link to={`/meal-prep-pdfs/${product.slug}`} className="btn-secondary pdf-upsell-link">
        See {product.name} — £{product.priceGBP.toFixed(2)}
      </Link>
    </aside>
  );
}
