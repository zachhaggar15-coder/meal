import { AFFILIATE_DISCLOSURE, getContainerProducts } from '../data/containerProducts.js';
import { CONTAINER_LAST_CHECKED } from '../utils/containerSetup.js';
import { toTitleCase } from '../utils/textFormatting.js';
import ContainerQuickComparison from './ContainerQuickComparison.jsx';

export default function AffiliateProductGrid({
  title = 'Recommended meal prep containers',
  intro,
  productIds = [],
  sourcePage = 'container-guide',
  showDisclosure = true,
  showQuickComparison = true,
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

      {showQuickComparison && products.length > 1 && (
        <ContainerQuickComparison
          eyebrow="Quick comparison"
          title={`${toTitleCase(title)}: quick comparison`}
          intro={`Compare ${Math.min(products.length, 3)} options first, then scroll for the longer buying notes.`}
          picks={products.slice(0, 3).map(product => ({
            product,
            searchedFor: title,
            sizeLabel: product.badge,
            sizeFocus: `${product.setSize} - ${product.layout}`,
            fit: product.bestFor,
          }))}
          headingLevel="h3"
          sourcePage={`${sourcePage}-quick-comparison`}
          showDisclosure={false}
        />
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
                  <dt>Size note</dt>
                  <dd>{product.layout}</dd>
                </div>
                <div>
                  <dt>Last checked</dt>
                  <dd>{product.lastChecked || CONTAINER_LAST_CHECKED}</dd>
                </div>
              </dl>
              <div className="affiliate-product-fit">
                <p><strong>Buy if:</strong> {product.buyIf}</p>
                <p><strong>Avoid if:</strong> {product.avoidIf}</p>
              </div>
              <details className="affiliate-product-details">
                <summary>Pros, cons and key features</summary>
                <div className="affiliate-product-detail-body">
                  <dl className="affiliate-product-facts affiliate-product-detail-facts">
                    <div>
                      <dt>Layout</dt>
                      <dd>{product.layout}</dd>
                    </div>
                    <div>
                      <dt>Storage fit</dt>
                      <dd>{product.storageFit}</dd>
                    </div>
                  </dl>
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
                </div>
              </details>
              <a
                href={product.href}
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
                className="btn-primary affiliate-product-cta"
                data-event="container_product_click"
                data-source-page={sourcePage}
                data-offer={product.name}
              >
                See price on Amazon UK
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
