import { AFFILIATE_DISCLOSURE, getContainerProducts } from '../data/containerProducts.js';
import { toTitleCase } from '../utils/textFormatting.js';

export default function AffiliateProductGrid({
  title = 'Recommended meal prep containers',
  intro,
  productIds = [],
  sourcePage = 'container-guide',
  showDisclosure = true,
}) {
  const products = getContainerProducts(productIds);

  if (!products.length) return null;

  return (
    <section className="affiliate-product-section">
      <div className="affiliate-section-head">
        <h2>{toTitleCase(title)}</h2>
        {intro && <p>{intro}</p>}
      </div>

      {showDisclosure && (
        <p className="affiliate-disclosure">{AFFILIATE_DISCLOSURE}</p>
      )}

      <div className="affiliate-product-grid">
        {products.map(product => (
          <article key={product.name} className="affiliate-product-card">
            <div className="affiliate-product-media">
              <img src={product.image} alt={`${product.name} meal prep containers`} loading="lazy" />
            </div>
            <div className="affiliate-product-body">
              <span className="affiliate-product-badge">{product.badge}</span>
              <h3>{product.name}</h3>
              <p className="affiliate-product-summary">{product.summary}</p>
              <dl className="affiliate-product-facts">
                <div>
                  <dt>Price band</dt>
                  <dd>{product.priceBand}</dd>
                </div>
                <div>
                  <dt>Material</dt>
                  <dd>{product.material}</dd>
                </div>
                <div>
                  <dt>Best for</dt>
                  <dd>{product.bestFor}</dd>
                </div>
                <div>
                  <dt>Set format</dt>
                  <dd>{product.setSize}</dd>
                </div>
                <div>
                  <dt>Layout</dt>
                  <dd>{product.layout}</dd>
                </div>
                <div>
                  <dt>Storage fit</dt>
                  <dd>{product.storageFit}</dd>
                </div>
              </dl>
              <div className="affiliate-product-fit">
                <p><strong>Buy if:</strong> {product.buyIf}</p>
                <p><strong>Avoid if:</strong> {product.avoidIf}</p>
              </div>
              <div className="affiliate-pro-con-grid">
                <div>
                  <strong>Pros</strong>
                  <ul>
                    {product.pros?.map(item => <li key={item}>{item}</li>)}
                  </ul>
                </div>
                <div>
                  <strong>Cons</strong>
                  <ul>
                    {product.cons?.map(item => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              </div>
              <ul className="content-bullets affiliate-product-bullets">
                {product.keyFeatures.map(feature => <li key={feature}>{feature}</li>)}
              </ul>
              <p className="affiliate-watchout"><strong>Watch out:</strong> {product.watchOut}</p>
              <a
                href={product.href}
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
                className="btn-primary affiliate-product-cta"
                data-event="container_product_click"
                data-source-page={sourcePage}
                data-offer={product.name}
              >
                Check on Amazon UK
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
