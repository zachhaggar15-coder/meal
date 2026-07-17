import FeedbackBox from '../components/FeedbackBox.jsx';
import SEO from '../components/SEO.jsx';

export default function Feedback() {
  return (
    <>
      <SEO
        title="Feedback | MealPrep.org.uk"
        description="Send feedback about MealPrep.org.uk, meal plans, tools, guides or site issues."
        canonical="https://www.mealprep.org.uk/feedback"
        robots="noindex,follow"
      />
      <div className="page feedback-page">
        <header className="feedback-page-header">
          <span className="offer-kicker">Feedback</span>
          <h1>Tell us what to improve</h1>
          <p>
            Share anything that feels confusing, broken, missing or useful. Your note goes
            through the same private feedback flow used on meal plan pages.
          </p>
        </header>
        <FeedbackBox
          className="feedback-box--standalone"
          title="Site feedback"
          description="Tell us what is confusing, broken, missing or genuinely useful. We read every note and use it to prioritise fixes."
          label="Your feedback"
          placeholder="What should we fix, add, simplify or explain better?"
        />
      </div>
    </>
  );
}
