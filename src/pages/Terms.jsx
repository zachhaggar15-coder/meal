import { Link } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import SiteLogo from '../components/SiteLogo.jsx';
import { SITE_CONTACT_EMAIL } from '../constants/site.js';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Terms & Conditions',
  url: 'https://www.mealprep.org.uk/terms',
};

export default function Terms() {
  return (
    <>
      <SEO
        title="Terms & Conditions | MealPrep.org.uk"
        description="Terms and conditions for using MealPrep.org.uk, including acceptable use, content accuracy, affiliate links and liability."
        canonical="/terms"
        jsonLd={jsonLd}
      />

      <div className="content-page privacy-page">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true"> &rsaquo; </span>
          <span aria-current="page">Terms &amp; Conditions</span>
        </nav>
        <SiteLogo variant="page" className="page-header-logo" />
        <h1>Terms &amp; Conditions</h1>
        <p className="content-intro">
          By using MealPrep.org.uk, you agree to the terms below. If you do not agree with them,
          please do not use the site.
        </p>

        <section>
          <h2>Using the Site</h2>
          <p>
            MealPrep.org.uk is a free UK meal-planning resource. Meal plans, recipes, shopping
            lists and calorie/macro figures are provided for general planning purposes and may be
            copied or printed for personal, non-commercial use only. You may not republish,
            resell, or scrape the site's content in bulk without permission.
          </p>
        </section>

        <section>
          <h2>Content Accuracy</h2>
          <p>
            We take reasonable care to keep meal plans, recipes and nutrition figures accurate,
            using standard UK nutritional reference data. Calorie and macro figures are estimates,
            not laboratory measurements, and can vary based on specific brands, portion sizes and
            preparation methods. If you find an error, please tell us via the contact details below
            so we can correct it.
          </p>
        </section>

        <section>
          <h2>No Medical Advice</h2>
          <p>
            Nothing on this site is medical, dietary or health advice. Meal plans are general
            information only and are not a substitute for guidance from a doctor, registered
            dietitian or other qualified professional — particularly if you have a medical
            condition, allergy, or are pregnant or breastfeeding.
          </p>
        </section>

        <section>
          <h2>Affiliate Links</h2>
          <p>
            Some pages contain affiliate links (for example, to container or kitchen products on
            Amazon UK). We may earn a commission on qualifying purchases made through these links,
            at no extra cost to you. This does not affect the meal plans or nutrition figures shown.
          </p>
        </section>

        <section>
          <h2>Liability</h2>
          <p>
            MealPrep.org.uk is provided "as is" without warranties of any kind. We are not liable
            for any loss or damage arising from your use of the site or reliance on its content,
            to the fullest extent permitted by law.
          </p>
        </section>

        <section>
          <h2>Changes to These Terms</h2>
          <p>
            We may update these terms from time to time as the site changes. Continued use of the
            site after an update means you accept the revised terms.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            Questions about these terms can be sent to{' '}
            <a href={`mailto:${SITE_CONTACT_EMAIL}`}>{SITE_CONTACT_EMAIL}</a>.
          </p>
        </section>
      </div>
      <Footer />
    </>
  );
}
