import { Link } from 'react-router-dom';

export default function ContextualNextStep({
  eyebrow = 'Your next step',
  title,
  description,
  primary,
  secondary = [],
  pageType = 'page',
  className = '',
}) {
  if (!title || !primary?.to || !primary?.label) return null;

  const classes = ['contextual-next-step', className].filter(Boolean).join(' ');

  return (
    <aside className={classes} aria-label={title}>
      <div className="contextual-next-step-copy">
        <span className="offer-kicker">{eyebrow}</span>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      <div className="contextual-next-step-actions">
        <SmartLink
          link={primary}
          className="btn-primary"
          pageType={pageType}
          location="contextual_next_step"
          primary
        />
        {secondary.slice(0, 2).map(link => (
          <SmartLink
            key={`${link.to}-${link.label}`}
            link={link}
            className="contextual-next-step-secondary"
            pageType={pageType}
            location="contextual_next_step_secondary"
          />
        ))}
      </div>
    </aside>
  );
}

function SmartLink({ link, className, pageType, location, primary = false }) {
  const analyticsProps = {
    'data-event': link.event || (primary ? 'plan_primary_cta_clicked' : 'contextual_link_clicked'),
    'data-source-page': pageType,
    'data-page-type': pageType,
    'data-cta-location': location,
  };

  if (link.to.startsWith('#')) {
    return (
      <a href={link.to} className={className} {...analyticsProps}>
        {link.label}
      </a>
    );
  }

  return (
    <Link to={link.to} className={className} {...analyticsProps}>
      {link.label}
    </Link>
  );
}
