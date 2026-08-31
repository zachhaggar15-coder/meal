// `priority` controls when the browser is allowed to discover the image.
// `lcpCandidate` is separate and much rarer: it forces the fetch ahead of the
// render-blocking stylesheet, which is only ever right for an image that is
// genuinely the largest thing in the first viewport.
//
// Every current caller passes `priority` for an image that sits below the fold
// — the class names say so (--after-results, --after-grid, --after-plans), and
// on the homepage at 375x812 the hero sits 343px past the bottom of the
// viewport. Marking those `fetchpriority="high"` made them contend for
// bandwidth with the one resource that gates first paint, on pages whose LCP
// element is text and so never involves the image at all. They stay eager, so
// nothing pops in later; they just no longer queue jump.
export default function PageHeroVisual({
  visual,
  className = '',
  priority = false,
  lcpCandidate = false,
}) {
  if (!visual?.src) return null;

  return (
    <figure className={`page-hero-visual ${className}`.trim()}>
      <img
        src={visual.src}
        srcSet={visual.srcSet}
        sizes={visual.sizes}
        alt={visual.alt || ''}
        width={visual.width || 1200}
        height={visual.height || 675}
        loading={priority ? 'eager' : 'lazy'}
        fetchpriority={lcpCandidate ? 'high' : undefined}
        decoding="async"
      />
    </figure>
  );
}
