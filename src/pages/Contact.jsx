import { Link } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import SiteLogo from '../components/SiteLogo.jsx';
import { SITE_CONTACT_EMAIL } from '../constants/site.js';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact MealPrep.org.uk',
  url: 'https://www.mealprep.org.uk/contact',
  mainEntity: {
    '@type': 'Organization',
    name: 'MealPrep.org.uk',
    email: SITE_CONTACT_EMAIL,
    url: 'https://www.mealprep.org.uk',
  },
};

export default function Contact() {
  return (
    <>
      <SEO
        title="Contact MealPrep.org.uk"
        description="Contact MealPrep.org.uk for editorial corrections, plan feedback, source questions, product updates or business enquiries."
        canonical="/contact"
        jsonLd={jsonLd}
      />

      <div className="content-page contact-page">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true"> &rsaquo; </span>
          <span aria-current="page">Contact</span>
        </nav>
        <SiteLogo variant="page" className="page-header-logo" />
        <h1>Contact MealPrep.org.uk</h1>
        <p className="content-intro">
          For editorial corrections, source questions, meal-plan feedback, product updates or
          business enquiries, email <a href={`mailto:${SITE_CONTACT_EMAIL}`}>{SITE_CONTACT_EMAIL}</a>.
        </p>
        <section>
          <h2>What to Include</h2>
          <ul className="content-bullets">
            <li>The page URL or plan name.</li>
            <li>What looks wrong, outdated or unclear.</li>
            <li>Any source, product or supermarket detail that helps us verify the correction.</li>
          </ul>
        </section>
      </div>
      <Footer />
    </>
  );
}
