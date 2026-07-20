import { Link } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import SiteLogo from '../components/SiteLogo.jsx';
import { toTitleCase } from '../utils/textFormatting.js';

// A question-first knowledge hub: organises real questions people ask before
// shopping, cooking or meal planning into topic clusters, and routes each one
// to the strongest existing page that answers it (mostly existing content;
// only pointing at a new page where nothing already covers that specific
// question well). This is a navigation/discovery layer, not new articles —
// see src/data/blogPostsBatch6.js for the handful of new answer pages this
// hub links into.
const CLUSTERS = [
  {
    label: 'Protein & Macros',
    questions: [
      { q: 'How much protein do I actually need per day?', to: '/tools#protein-calculator' },
      { q: 'What foods are highest in protein?', to: '/blog/best-cheap-high-protein-foods-uk' },
      { q: 'Chicken vs eggs: which is better value for protein?', to: '/blog/chicken-vs-eggs-protein-value-uk' },
      { q: 'Is protein powder cheaper than food, gram for gram?', to: '/blog/is-protein-powder-cheaper-than-food-uk' },
      { q: 'Can I hit my protein target without using powder?', to: '/blog/protein-meal-prep-without-powder-uk' },
      { q: 'What are good high-protein, low-calorie foods?', to: '/blog/high-protein-low-calorie-meals' },
    ],
  },
  {
    label: 'Budget & Food Costs',
    questions: [
      { q: 'What are the cheapest protein sources, per gram of protein?', to: '/blog/cheapest-protein-sources-cost-per-gram-uk' },
      { q: 'How much should a week of meal prep cost for one person?', to: '/blog/how-much-should-meal-prep-cost-uk' },
      { q: 'Is meal prep actually cheaper than meal deals and takeaways?', to: '/blog/is-meal-prep-cheaper-than-meal-deals-uk' },
      { q: 'Which UK supermarket is cheapest for meal prep?', to: '/blog/cheapest-uk-supermarket-meal-prep' },
      { q: 'What should I buy for a cheap high-protein shopping list?', to: '/blog/cheap-meal-prep-shopping-list-uk' },
      { q: 'How do I estimate my weekly shopping budget?', to: '/tools#shopping-budget-estimator' },
    ],
  },
  {
    label: 'Supermarkets',
    questions: [
      { q: 'Which supermarket is best for high-protein meal prep?', to: '/blog/best-supermarket-for-high-protein-meal-prep-uk' },
      { q: 'Is Aldi or Lidl cheaper for meal prep?', to: '/blog/aldi-vs-lidl-meal-prep' },
      { q: 'Is Aldi or Tesco better value for meal prep?', to: '/blog/aldi-vs-tesco-meal-prep' },
      { q: 'Does Aldi have good high-protein own-brand food?', to: '/blog/aldi-high-protein-shopping-list-uk' },
      { q: 'What meal plans are available by supermarket?', to: '/meal-plans' },
    ],
  },
  {
    label: 'Storage & Food Safety',
    questions: [
      { q: 'How long does meal prep actually last in the fridge?', to: '/blog/how-to-store-meal-prep-safely-uk' },
      { q: 'Is it safe to reheat rice that has been in the fridge?', to: '/blog/chicken-and-rice-meal-prep-uk' },
      { q: 'Can you meal prep without freezing anything?', to: '/blog/how-to-store-meal-prep-safely-uk' },
      { q: 'What foods freeze well for meal prep?', to: '/blog/freezer-meal-prep-for-beginners-uk' },
      { q: 'How many meal prep containers do I actually need?', to: '/tools#container-count-calculator' },
    ],
  },
  {
    label: 'Batch Cooking',
    questions: [
      { q: 'What is the best way to start batch cooking?', to: '/blog/batch-cooking-for-beginners-uk' },
      { q: 'Can I batch cook using a slow cooker?', to: '/blog/slow-cooker-meal-prep-uk' },
      { q: 'What is the easiest way to batch cook rice for the week?', to: '/blog/rice-cooker-meal-prep-uk' },
      { q: 'What does a good Sunday meal prep routine look like?', to: '/blog/sunday-meal-prep-routine-uk' },
      { q: 'Can I batch cook in one pan to save on washing up?', to: '/blog/one-pan-meal-prep-uk' },
    ],
  },
  {
    label: 'Work Lunches',
    questions: [
      { q: 'What can I meal prep for work without a microwave?', to: '/blog/meal-prep-without-a-microwave-uk' },
      { q: 'What are good cheap high-protein work lunches?', to: '/blog/high-protein-lunches-for-work-uk' },
      { q: 'How do I meal prep five days of lunches at once?', to: '/blog/five-day-work-lunch-meal-prep-uk' },
      { q: 'What lunch bag actually keeps food cold for work?', to: '/blog/best-lunch-bags-for-meal-prep-uk' },
      { q: 'What are the best containers for carrying lunch to work?', to: '/blog/meal-prep-boxes-for-work-lunches' },
    ],
  },
  {
    label: 'Calories & Portions',
    questions: [
      { q: 'What does 1,500 calories actually look like in a day?', to: '/blog/what-does-1500-calories-look-like-uk' },
      { q: 'Should I eat 1,500, 1,800 or 2,000 calories?', to: '/blog/1500-vs-1800-vs-2000-calories' },
      { q: 'How many calories do I need to lose weight?', to: '/blog/how-many-calories-to-lose-weight' },
      { q: 'How do I build a sensible calorie deficit?', to: '/blog/how-to-build-a-calorie-deficit' },
      { q: 'How do I work out my own calorie target?', to: '/tools#calorie-calculator' },
    ],
  },
  {
    label: 'Meal-Prep Equipment',
    questions: [
      { q: 'What containers do I actually need to start meal prepping?', to: '/meal-prep-containers' },
      { q: 'Is glass or plastic better for meal prep containers?', to: '/blog/glass-vs-plastic-meal-prep-containers' },
      { q: 'Do I really need a food scale for meal prep?', to: '/blog/best-kitchen-scales-for-meal-prep-uk' },
      { q: 'Is a vacuum sealer worth it for meal prep?', to: '/blog/vacuum-sealer-meal-prep-uk' },
      { q: 'Are there any meal prep cookbooks worth buying?', to: '/blog/best-meal-prep-cookbooks-uk' },
    ],
  },
  {
    label: 'Dietary Patterns',
    questions: [
      { q: 'What does a good vegan meal prep week look like?', to: '/blog/vegan-meal-prep-uk' },
      { q: 'How do vegetarians hit a high protein target when meal prepping?', to: '/blog/high-protein-vegetarian-meal-prep-uk' },
      { q: 'What is a good pescatarian meal prep plan?', to: '/blog/pescatarian-meal-prep-uk' },
      { q: 'Does intermittent fasting work with meal prep?', to: '/blog/intermittent-fasting-meal-plan-uk' },
      { q: 'What does a gluten-free meal prep week look like?', to: '/blog/gluten-free-friendly-meal-prep-uk' },
    ],
  },
  {
    label: 'Cooking & Reheating',
    questions: [
      { q: 'Can I meal prep an entire week using an air fryer?', to: '/blog/air-fryer-meal-prep-uk' },
      { q: 'How do I cook chicken and rice for the week without it going dry?', to: '/blog/chicken-and-rice-meal-prep-uk' },
      { q: 'What is the best way to reheat meal prep without a microwave?', to: '/blog/meal-prep-without-a-microwave-uk' },
      { q: 'What meals reheat badly and should be avoided for meal prep?', to: '/blog/how-to-store-meal-prep-safely-uk' },
    ],
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'MealPrep.org.uk Meal Prep Questions',
  description: 'Real questions people ask about protein, cost, supermarkets, storage, batch cooking and meal prep equipment, each linked to the strongest answer on MealPrep.org.uk.',
  url: 'https://www.mealprep.org.uk/questions',
  publisher: { '@type': 'Organization', name: 'MealPrep.org.uk', url: 'https://www.mealprep.org.uk' },
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: CLUSTERS.flatMap(cluster => cluster.questions).map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.q,
      url: `https://www.mealprep.org.uk${item.to}`,
    })),
  },
};

export default function QuestionsHub() {
  return (
    <>
      <SEO
        title="Meal Prep Questions Answered | MealPrep.org.uk"
        description="Real questions about protein value, meal prep cost, supermarkets, storage, batch cooking and equipment, organised by topic and linked to a direct answer."
        canonical="/questions"
        jsonLd={jsonLd}
      />

      <div className="content-page">
        <nav className="breadcrumb">
          <Link to="/">Home</Link> <span aria-hidden>&rsaquo;</span> <span>Meal Prep Questions</span>
        </nav>

        <SiteLogo variant="page" className="page-header-logo" />
        <h1>Meal Prep Questions, Answered</h1>
        <p className="content-intro">
          Real questions people ask before shopping, cooking or planning a week of meals, organised by topic.
          Each question links straight to the page with the fullest answer, rather than a short snippet — use the
          quiz or browse page if you would rather start from a ready-made plan.
        </p>

        {CLUSTERS.map(cluster => (
          <section key={cluster.label} className="search-opportunity-cluster">
            <h2>{toTitleCase(cluster.label)}</h2>
            <div className="search-opportunity-grid">
              {cluster.questions.map(item => (
                <Link key={item.q} to={item.to} className="question-hub-link">
                  {item.q}
                </Link>
              ))}
            </div>
          </section>
        ))}

        <div className="cta-box cta-box--large">
          <h2>Can&apos;t find your question?</h2>
          <p>Browse the full guide library, or take the quiz to get matched to a ready-made plan in about 30 seconds.</p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/blog" className="btn-primary">Browse All Guides &rarr;</Link>
            <Link to="/quiz" className="btn-secondary">Take the Quiz</Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
