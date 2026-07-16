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
  showQuickComparison = true,
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

      {showQuickComparison && products.length > 1 && (
        <div className="product-quick-compare" aria-label={`${title} quick comparison`}>
          <div className="product-quick-head">
            <span className="offer-kicker">Quick comparison</span>
            <h3>{toTitleCase(title)}: compare first</h3>
            <p>See the main difference before reading the full product notes.</p>
          </div>
          <div className="product-quick-grid">
            {products.slice(0, 3).map(product => (
              <article key={product.id} className="product-quick-card">
                <span className="container-search-chip">You searched: {title}</span>
                <h4>{product.name}</h4>
                <dl>
                  <div>
                    <dt>Type</dt>
                    <dd>{product.category}</dd>
                  </div>
                  <div>
                    <dt>Price</dt>
                    <dd>{product.priceBand}</dd>
                  </div>
                  <div>
                    <dt>Best for</dt>
                    <dd>{product.bestFor}</dd>
                  </div>
                </dl>
                <a
                  href={product.href}
                  target="_blank"
                  rel="noopener noreferrer nofollow sponsored"
                  className="btn-primary"
                  data-event="mealprep_product_click"
                  data-source-page={`${sourcePage}-quick-comparison`}
                  data-offer={product.name}
                >
                  See Amazon price
                </a>
              </article>
            ))}
          </div>
        </div>
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
