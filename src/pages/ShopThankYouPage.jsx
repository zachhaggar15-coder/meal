import { Link } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';

export default function ShopThankYouPage() {
  return (
    <>
      <SEO
        title="Thanks for your order | MealPrep.org.uk"
        description="Your PDF meal plan order is confirmed. Check your email for the download link from Lemon Squeezy."
        canonical="/meal-prep-pdfs/thank-you"
        robots="noindex,follow"
      />

      <div className="shop-page shop-thank-you">
        <section className="mealprep-plus-hero shop-hero">
          <div className="mealprep-plus-hero-copy">
            <span className="offer-kicker">Order confirmed</span>
            <h1>Thanks for your order!</h1>
            <p>
              Your PDF is on its way — check your email for a message from Lemon Squeezy with your
              download link. It can take a couple of minutes to arrive, and it&apos;s worth checking
              spam if you don&apos;t see it.
            </p>
            <div className="mealprep-plus-actions">
              <Link to="/meal-prep-pdfs" className="btn-secondary">See all 6-week PDF plans</Link>
              <Link to="/browse" className="btn-secondary">Browse free plans</Link>
            </div>
          </div>
        </section>

        <section className="shop-support" aria-labelledby="shop-support-heading">
          <div className="mealprep-plus-section-head">
            <h2 id="shop-support-heading">Need help or a refund?</h2>
            <p>
              If you run into any issues with your download, have questions about the plan, or need
              a refund, we&apos;re here to help. Get in touch at{' '}
              <a href="mailto:mealprep.org.uk@proton.me">mealprep.org.uk@proton.me</a> and we&apos;ll
              sort it out for you.
            </p>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
