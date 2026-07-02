import { Link } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact MealPrep.org.uk',
  url: 'https://www.mealprep.org.uk/contact',
};

export default function Contact() {
  return (
    <>
      <SEO
        title="Contact MealPrep.org.uk — Questions, Corrections & Feedback"
        description="Get in touch with the MealPrep.org.uk team. Report an error in a meal plan, suggest a new plan, or ask a question about the free UK meal plan generator."
        canonical="/contact"
        jsonLd={jsonLd}
      />
      <div className="page content-page">
        <nav className="breadcrumb">
          <Link to="/">Home</Link> <span aria-hidden>›</span> <span>Contact</span>
        </nav>

        <article>
          <h1>Contact Us</h1>
          <p className="content-intro">
            Questions, corrections, or suggestions for new meal plans — we read every message.
          </p>

          <section>
            <h2>Email</h2>
            <p>
              The fastest way to reach us is email:{' '}
              <a href="mailto:hello@mealprep.org.uk">hello@mealprep.org.uk</a>
            </p>
            <p>We aim to reply within 2–3 working days.</p>
          </section>

          <section>
            <h2>Report an Error</h2>
            <p>
              If you have spotted a mistake in a meal plan — a calorie figure that looks wrong, a
              discontinued supermarket product, or a broken shopping list — please include the page
              link in your email so we can fix it quickly.
            </p>
          </section>

          <section>
            <h2>A Note on Medical Questions</h2>
            <p>
              We cannot give individual medical or dietetic advice. For questions about a medical
              condition, pregnancy, an eating disorder, or a clinical diet, please speak to your GP
              or ask for a referral to an NHS dietitian.
            </p>
          </section>

          <section>
            <h2>More About Us</h2>
            <p>
              Curious who runs the site and how the plans are made? See our{' '}
              <Link to="/about">about page</Link>.
            </p>
          </section>
        </article>
      </div>
      <Footer />
    </>
  );
}
