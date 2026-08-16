// The block that sits where a product photo used to.
//
// The photos were Amazon listing images — some hotlinked from their media
// servers, some downloaded and re-hosted. The Associates programme allows
// neither: product images may only be obtained through the Creators API, and
// even then only as a link held for 24 hours, which a statically prerendered
// site cannot honour. They were removed rather than risk the account.
//
// What replaced them is not a placeholder. A white-background studio shot of a
// stack of tubs tells a reader almost nothing they could not guess from the
// product name — every container looks like containers. The two facts that
// actually decide the purchase are what it is made of and roughly what it
// costs, and those are already in the data, so the slot now shows those.

/**
 * @param {object} props
 * @param {object} props.product a container or accessory record
 * @param {string} [props.className] extra class for the surrounding card layout
 * @param {string} [props.tone] 'plain' drops the badge line for dense grids
 */
export default function ProductSpecPlate({ product, className = '', tone = 'full' }) {
  if (!product) return null;

  // Different product sets name these differently; take whichever exists.
  const specs = [
    product.material && { label: 'Material', value: product.material },
    product.capacity && { label: 'Capacity', value: product.capacity },
    product.priceBand && { label: 'Price', value: product.priceBand },
  ].filter(Boolean).slice(0, 3);

  const badge = tone === 'full' ? (product.badge || product.category) : null;

  // The promo offers carry proofPoints instead of a spec table. They serve the
  // same purpose here, so use them when there is nothing else to show.
  const proofPoints = specs.length ? [] : (product.proofPoints || []).slice(0, 3);

  // A plate needs enough in it to look deliberate. One lonely row in a bordered
  // box reads as a failed image, which is exactly the impression to avoid — and
  // the accessory cards, which carry only a price band, already show everything
  // else in the detail list beneath. Better to draw nothing there.
  const worthDrawing = Boolean(badge) || specs.length >= 2 || proofPoints.length > 0;
  if (!worthDrawing) return null;

  return (
    <div className={['product-spec-plate', className].filter(Boolean).join(' ')}>
      {badge && <span className="product-spec-plate-badge">{badge}</span>}
      {specs.length > 0 && (
        <dl className="product-spec-plate-list">
          {specs.map(spec => (
            <div className="product-spec-plate-row" key={spec.label}>
              <dt>{spec.label}</dt>
              <dd>{spec.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {proofPoints.length > 0 && (
        <ul className="product-spec-plate-points">
          {proofPoints.map(point => <li key={point}>{point}</li>)}
        </ul>
      )}
    </div>
  );
}
