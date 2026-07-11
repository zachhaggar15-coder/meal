import { AFFILIATE_DISCLOSURE, getMealPrepProducts } from '../data/mealPrepProducts.js';
import { toTitleCase } from '../utils/textFormatting.js';

// Generic (non-container) product recommendation cards: slow cookers, rice
// cookers, scales, blenders, freezer bags, vacuum sealers, cookbooks.
// Sibling to AffiliateProductGrid, which is container-specific.
export default function ProductPicks({
  title = 'Products mentioned in this guide',
  intro,
  productIds = [],
  sourcePage = 'blog-tool-recommendation',
  showDisclosure = true,
}) {
  const products = getMealPrepProducts(productIds);

  if (!products.length) return null;

  return (
    <section className="product-picks-section">
      <div className="affiliate-section-head">
        <h2>{toTitleCase(title)}</h2>
        {intro && <p>{intro}</p>}
      </div>

      {showDisclosure && (
        <p className="affiliate-disclosure">{AFFILIATE_DISCLOSURE}</p>
      )}

      <div className="product-picks-grid">
        {products.map(product => (
          <article key={product.id} className="product-pick-card">
            <span className="product-pick-category">{product.category}</span>
            <h3>{product.name}</h3>
            <p className="product-pick-summary">{product.summary}</p>
            <dl className="affiliate-product-facts">
              <div>
                <dt>Price band</dt>
                <dd>{product.priceBand}</dd>
              </div>
              <div>
                <dt>Best for</dt>
                <dd>{product.bestFor}</dd>
              </div>
            </dl>
            {product.watchOut && (
              <p className="affiliate-watchout"><strong>Watch out:</strong> {product.watchOut}</p>
            )}
            <a
              href={product.href}
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
              className="btn-primary affiliate-product-cta"
              data-event="mealprep_product_click"
              data-source-page={sourcePage}
              data-offer={product.name}
            >
              See price on Amazon UK
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
