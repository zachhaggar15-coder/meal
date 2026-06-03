import { Link } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import SiteLogo from '../components/SiteLogo.jsx';

export default function NotFound() {
  return (
    <>
      <SEO
        title="Page Not Found | MealPrep.org.uk"
        description="This page doesn't exist. Generate a free UK meal plan or browse ready-made plans."
        canonical="/404"
      />
      <div className="page not-found-page">
        <div className="not-found-content">
          <SiteLogo variant="page" className="page-header-logo" />
          <h1 className="not-found-heading">Page not found</h1>
          <p className="not-found-sub">
            That plan or page doesn&apos;t exist — but we can build you one in under 30 seconds.
          </p>
          <div className="not-found-actions">
            <Link to="/" className="btn-primary">Generate a free meal plan</Link>
            <Link to="/#popular-plans" className="btn-secondary">Browse ready-made plans</Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
