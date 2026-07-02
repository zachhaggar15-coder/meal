import { Link } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import SiteLogo from '../components/SiteLogo.jsx';
import { SITE_CONTACT_EMAIL } from '../constants/site.js';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Privacy Policy',
  url: 'https://www.mealprep.org.uk/privacy',
};

export default function Privacy() {
  return (
    <>
      <SEO
        title="Privacy Policy | MealPrep.org.uk"
        description="Privacy information for MealPrep.org.uk, including analytics, feedback forms, affiliate links and contact details."
        canonical="/privacy"
        jsonLd={jsonLd}
      />

      <div className="content-page privacy-page">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true"> &rsaquo; </span>
          <span aria-current="page">Privacy</span>
        </nav>
        <SiteLogo variant="page" className="page-header-logo" />
        <h1>Privacy Policy</h1>
        <p className="content-intro">
          MealPrep.org.uk is a free UK meal-planning website. This page explains the basic data
          handling used for analytics, feedback and affiliate links.
        </p>

        <section>
          <h2>Analytics</h2>
          <p>
            We use privacy-conscious site analytics to understand which pages are useful and where
            people find broken or confusing journeys. Analytics data is used in aggregate to improve
            pages, navigation and search visibility.
          </p>
        </section>

        <section>
          <h2>Feedback and Contact</h2>
          <p>
            If you submit feedback or email us, we use the information you provide to review the
            relevant page, answer the enquiry or correct an issue. Do not send sensitive medical
            details through the feedback form.
          </p>
        </section>

        <section>
          <h2>Affiliate Links</h2>
          <p>
            Some container and product links may be affiliate links. If you click one, the retailer
            may receive standard referral information and set its own cookies under its privacy
            policy.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            Questions about privacy or corrections can be sent to{' '}
            <a href={`mailto:${SITE_CONTACT_EMAIL}`}>{SITE_CONTACT_EMAIL}</a>.
          </p>
        </section>
      </div>
      <Footer />
    </>
  );
}
