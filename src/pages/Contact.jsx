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

// What happens to each kind of report. These are descriptions of the checks
// that actually run on every release (see /methodology#qa), not promises about
// response times we cannot keep.
const REPORT_TYPES = [
  {
    problem: 'A recipe looks wrong',
    detail:
      'A step that does not match the ingredients, a missing ingredient, or a method that would not work in a real kitchen.',
    handling:
      'Checked against the recipe rules that run over the whole library. Where it is a rule failure rather than a one-off, the rule is fixed and a permanent test is added so it cannot come back.',
  },
  {
    problem: 'A nutrition figure looks wrong',
    detail: 'Calories or macros that do not match the ingredients listed, or a portion that looks implausible.',
    handling:
      'Traced back to the ingredient quantities, which are the source of truth. If the underlying food record is wrong, every plan using it is corrected at once.',
  },
  {
    problem: 'The shopping list does not work',
    detail:
      'A duplicated line, a quantity that makes no sense, an item in the wrong section, or something missing that the plan clearly needs.',
    handling: 'Reproduced from the plan data, then fixed in the list builder rather than on the one page.',
  },
  {
    problem: 'A diet label looks wrong',
    detail: 'A plan labelled vegan, vegetarian or pescatarian that contains something it should not.',
    handling:
      'Treated as urgent. Diet labels are re-derived from ingredients on every release, so this normally means a food record is misclassified — which would affect other plans too.',
  },
  {
    problem: 'Something looks unsafe',
    detail: 'Storage, reheating, cooking or allergen guidance that contradicts current UK advice.',
    handling: 'Treated as the highest priority and checked against current FSA or NHS guidance before anything else in the queue.',
  },
  {
    problem: 'Something is broken or confusing',
    detail: 'A page that will not load, a link that goes somewhere unexpected, a layout problem, or wording that misleads.',
    handling: 'Reproduced and fixed. Navigation problems in particular get a permanent test, because a working page can still be the wrong page.',
  },
];

export default function Contact() {
  return (
    <>
      <SEO
        title="Contact MealPrep.org.uk"
        description="Report a recipe, nutrition, shopping-list, dietary or safety problem on MealPrep.org.uk, or get in touch about corrections and business enquiries."
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
          Two ways to reach us: the{' '}
          <Link to="/feedback">feedback form</Link> if you just want to send a note, or email{' '}
          <a href={`mailto:${SITE_CONTACT_EMAIL}`}>{SITE_CONTACT_EMAIL}</a> if you would rather have
          a reply. Both reach the same place.
        </p>

        <section>
          <h2>Reporting a problem</h2>
          <p>
            Reports genuinely change the site, because most problems here are not one-off typos —
            they are a rule producing the same fault across many plans. Finding one bad recipe
            usually means finding a bad rule, and fixing the rule fixes every plan it touched.
          </p>
          <div className="table-scroll">
            <table className="content-table">
              <caption>What happens to each kind of report</caption>
              <thead>
                <tr>
                  <th scope="col">What you spotted</th>
                  <th scope="col">What we do with it</th>
                </tr>
              </thead>
              <tbody>
                {REPORT_TYPES.map(row => (
                  <tr key={row.problem}>
                    <th scope="row">
                      {row.problem}
                      <span className="contact-report-detail">{row.detail}</span>
                    </th>
                    <td>{row.handling}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2>What to include</h2>
          <ul className="content-bullets">
            <li>The page URL, or the plan and day if it is easier.</li>
            <li>What looked wrong, and what you expected instead.</li>
            <li>Any product, supermarket or source detail that helps us check it.</li>
          </ul>
          <p>
            Please do not send medical details or anything sensitive — we do not need them, and the
            form is not the right place for them.
          </p>
        </section>

        <section>
          <h2>Other enquiries</h2>
          <p>
            Editorial corrections, source questions, product updates and business enquiries all go
            to the same address. If you want to understand how something on the site is produced
            before reporting it, the <Link to="/methodology">methodology page</Link> explains how
            plans, nutrition, costs, diet filters and allergens are worked out — and what the site
            deliberately does not claim.
          </p>
        </section>
      </div>
      <Footer />
    </>
  );
}
