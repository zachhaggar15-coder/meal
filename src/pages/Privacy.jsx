import { Link } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';

export default function Privacy() {
  return (
    <>
      <SEO
        title="Privacy Policy — MealPrep.org.uk"
        description="How MealPrep.org.uk handles your data: what we collect, what we don't, cookies, analytics, and your rights under UK GDPR."
        canonical="/privacy"
      />
      <div className="page content-page">
        <nav className="breadcrumb">
          <Link to="/">Home</Link> <span aria-hidden>›</span> <span>Privacy Policy</span>
        </nav>

        <article>
          <h1>Privacy Policy</h1>
          <p className="content-intro">
            Last updated: 19 May 2026. This policy explains what data MealPrep.org.uk collects and
            how it is used.
          </p>

          <section>
            <h2>What We Collect</h2>
            <ul className="content-bullets">
              <li>
                <strong>Meal plan inputs.</strong> When you use the generator, your chosen calorie
                target, supermarket, diet type, and meal preferences are sent to our server to
                create your plan. These inputs are not linked to your identity and no account is
                required.
              </li>
              <li>
                <strong>Anonymous usage analytics.</strong> We record anonymous events (such as
                page views and button clicks) to understand which plans and features are useful.
                This data does not identify you personally.
              </li>
              <li>
                <strong>Emails you send us.</strong> If you contact us, we keep your email to reply
                to you. We do not add you to any mailing list.
              </li>
            </ul>
          </section>

          <section>
            <h2>What We Do Not Do</h2>
            <ul className="content-bullets">
              <li>We do not require accounts or sign-ups.</li>
              <li>We do not sell or share personal data with third parties for marketing.</li>
              <li>We do not store health or medical information about you.</li>
            </ul>
          </section>

          <section>
            <h2>Cookies</h2>
            <p>
              We use only the minimal cookies or local storage needed for the site to function and
              for anonymous analytics. We do not use advertising or cross-site tracking cookies.
            </p>
          </section>

          <section>
            <h2>Your Rights</h2>
            <p>
              Under UK GDPR you have the right to access, correct, or request deletion of any
              personal data we hold about you (in practice, this is usually just email
              correspondence). To exercise these rights, contact us via the{' '}
              <Link to="/contact">contact page</Link>.
            </p>
          </section>

          <section>
            <h2>Changes to This Policy</h2>
            <p>
              If we change how we handle data, we will update this page and revise the date at the
              top.
            </p>
          </section>
        </article>
      </div>
      <Footer />
    </>
  );
}
