import { Link } from 'react-router-dom';
import {
  SITE_LOGO_HEIGHT,
  SITE_LOGO_PATH,
  SITE_LOGO_WIDTH,
  SITE_NAME,
} from '../constants/site.js';

export default function SiteLogo({
  asLink = true,
  className = '',
  onClick,
  showName = false,
  variant = 'page',
}) {
  const classes = ['site-logo', `site-logo--${variant}`, className]
    .filter(Boolean)
    .join(' ');
  const loading = variant === 'hero' ? 'eager' : 'lazy';

  const content = (
    <>
      <img
        className="site-logo-img"
        src={SITE_LOGO_PATH}
        alt={`${SITE_NAME} logo`}
        width={SITE_LOGO_WIDTH}
        height={SITE_LOGO_HEIGHT}
        loading={loading}
        decoding="async"
      />
      {showName && <span className="site-logo-text">{SITE_NAME}</span>}
    </>
  );

  if (!asLink) {
    return <div className={classes}>{content}</div>;
  }

  return (
    <Link to="/" className={classes} onClick={onClick} aria-label={`${SITE_NAME} home`}>
      {content}
    </Link>
  );
}
