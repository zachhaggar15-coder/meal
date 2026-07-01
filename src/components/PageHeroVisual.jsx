export default function PageHeroVisual({ visual, className = '', priority = false }) {
  if (!visual?.src) return null;

  return (
    <figure className={`page-hero-visual ${className}`.trim()}>
      <img
        src={visual.src}
        alt={visual.alt || ''}
        width={visual.width || 1200}
        height={visual.height || 675}
        loading={priority ? 'eager' : 'lazy'}
        fetchpriority={priority ? 'high' : undefined}
        decoding="async"
      />
    </figure>
  );
}
