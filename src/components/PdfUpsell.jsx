import { Link } from 'react-router-dom';
import { findMatchingPdfProduct } from '../data/mealPrepPdfProducts.js';

// Cross-sell from a free plan page to the matching paid 6-week PDF. Only
// Aldi and Lidl have a matching product so far; every other supermarket
// falls back to a generic nudge toward the shop instead of showing nothing,
// so we can see whether there's demand before building more plans.
export default function PdfUpsell({ supermarket, goal }) {
  const product = findMatchingPdfProduct({ supermarket, goal });

  if (!product) {
    return (
      <aside className="pdf-upsell" aria-label="6-week PDF plans">
        <p className="pdf-upsell-eyebrow">Stop the Sunday dinner panic</p>
        <p className="pdf-upsell-copy">
          Our printable 6-week dinner plans are Aldi and Lidl focused so far — take a look and see
          if one fits, even if you shop elsewhere.
        </p>
        <Link
          to="/meal-prep-pdfs"
          className="btn-secondary pdf-upsell-link"
          data-event="nav_link_clicked"
          data-cta-location="plan-pdf-upsell-generic"
          data-supermarket={supermarket}
          data-target-route="/meal-prep-pdfs"
        >
          See the 6-week PDF plans
        </Link>
      </aside>
    );
  }

  return (
    <aside className="pdf-upsell" aria-label="6-week PDF plan">
      <p className="pdf-upsell-eyebrow">Stop the Sunday dinner panic</p>
      <p className="pdf-upsell-copy">
        Take a {product.tagline.toLowerCase()} with you — print it, save it, use it week after week.
        {product.pages ? ` ${product.pages} pages` : ''} of zero-guesswork dinners, ready to go.
        No subscriptions, no faff. Just download and cook.
      </p>
      <Link
        to={`/meal-prep-pdfs/${product.slug}`}
        className="btn-secondary pdf-upsell-link"
        data-event="nav_link_clicked"
        data-cta-location="plan-pdf-upsell-matched"
        data-supermarket={supermarket}
        data-plan-slug={product.slug}
        data-target-route={`/meal-prep-pdfs/${product.slug}`}
      >
        Get {product.name} — £{product.priceGBP.toFixed(2)}
      </Link>
    </aside>
  );
}
