import { Link } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import SiteLogo from '../components/SiteLogo.jsx';
import { blogPostsData } from '../data/blogPosts.js';
import { PLAN_COUNT } from '../data/planSeeds.js';
import { generateBlogCardImageUrl, hasCustomBlogImage } from '../utils/imageGenerator.js';

const CATEGORY_ORDER = [
  {
    label: 'Weight Loss & Calories',
    slugs: [
      'how-to-lose-weight-fast-uk',
      'how-to-build-a-calorie-deficit',
      'how-many-calories-to-lose-weight',
      '1500-vs-1800-vs-2000-calories',
      'what-does-1500-calories-look-like-uk',
      'how-to-lose-belly-fat-uk',
      'cutting-diet-plan-uk',
      '1200-calorie-meal-plan-uk',
      '1400-calorie-meal-plan-uk',
      '1600-calorie-meal-plan-uk',
      '1800-calorie-meal-plan-for-weight-loss-uk',
      '2000-calorie-weight-loss-meal-plan-uk',
      '3000-vs-3500-calorie-meal-plan-uk',
      'weekly-calorie-deficit-meal-prep-uk',
      'weight-loss-meal-prep-mistakes-uk',
      'low-calorie-dinners-for-meal-prep-uk',
    ],
  },
  {
    label: 'Protein & Nutrition',
    slugs: [
      'high-protein-low-calorie-meals',
      'high-protein-breakfast-uk',
      'high-protein-snacks-uk',
      'how-much-protein-when-dieting',
      'best-low-calorie-foods-uk',
      'best-low-calorie-ready-meals-uk',
      'low-calorie-snacks-uk',
      'high-protein-lunches-for-work-uk',
      'high-protein-vegetarian-meal-prep-uk',
      'cheap-protein-sources-uk-supermarkets',
      'protein-porridge-and-yogurt-breakfasts-uk',
      'overnight-oats-meal-prep-uk',
      'low-calorie-high-volume-foods-uk',
      'best-fibre-foods-for-weight-loss-uk',
      'protein-meal-prep-without-powder-uk',
      'high-protein-pasta-meal-prep-uk',
    ],
  },
  {
    label: 'Cost & Value Questions',
    slugs: [
      'cheapest-protein-sources-cost-per-gram-uk',
      'chicken-vs-eggs-protein-value-uk',
      'is-protein-powder-cheaper-than-food-uk',
      'how-much-should-meal-prep-cost-uk',
      'is-meal-prep-cheaper-than-meal-deals-uk',
    ],
  },
  {
    label: 'Meal Prep & Batch Cooking',
    slugs: [
      'summer-meals-uk',
      'meal-prep-for-beginners-uk',
      'batch-cooking-for-beginners-uk',
      'how-to-meal-plan-for-weight-loss',
      'cheap-meal-prep-shopping-list-uk',
      'meal-prep-containers-uk',
      'intermittent-fasting-meal-plan-uk',
      'sunday-meal-prep-routine-uk',
      'five-day-work-lunch-meal-prep-uk',
      'freezer-meal-prep-for-beginners-uk',
      'meal-prep-without-a-microwave-uk',
      'healthy-ready-meal-alternatives-uk',
      'one-pan-meal-prep-uk',
      'meal-prep-shopping-list-template-uk',
      'how-to-store-meal-prep-safely-uk',
      'air-fryer-meal-prep-uk',
      'chicken-and-rice-meal-prep-uk',
      'meal-prep-for-two-people-uk',
      'student-meal-prep-uk',
    ],
  },
  {
    label: 'Meal Prep Tools & Equipment',
    slugs: [
      'slow-cooker-meal-prep-uk',
      'rice-cooker-meal-prep-uk',
      'best-kitchen-scales-for-meal-prep-uk',
      'best-blender-for-meal-prep-smoothies-uk',
      'best-freezer-bags-for-meal-prep-uk',
      'vacuum-sealer-meal-prep-uk',
      'best-meal-prep-cookbooks-uk',
    ],
  },
  {
    label: 'Meal Prep Containers',
    slugs: [
      'best-meal-prep-containers-uk',
      'glass-vs-plastic-meal-prep-containers',
      'leakproof-meal-prep-containers-uk',
      'meal-prep-container-size-guide',
      'meal-prep-boxes-for-work-lunches',
      'freezer-safe-meal-prep-containers',
      'dishwasher-safe-meal-prep-containers',
      'bento-meal-prep-boxes-uk',
      'meal-prep-tubs-for-batch-cooking',
      'how-many-meal-prep-containers-do-you-need',
      'best-glass-meal-prep-containers-uk',
      'plastic-meal-prep-containers-uk',
      'microwave-safe-meal-prep-containers-uk',
      'meal-prep-containers-for-soup-uk',
      'meal-prep-containers-for-salads-uk',
      'best-lunch-bags-for-meal-prep-uk',
      'meal-prep-container-lids-leaking',
      'budget-vs-premium-meal-prep-containers',
    ],
  },
  {
    label: 'Supermarket Guides',
    slugs: [
      'tesco-low-calorie-shopping-list',
      'aldi-vs-tesco-meal-prep',
      'aldi-vs-lidl-meal-prep',
      'best-supermarket-for-high-protein-meal-prep-uk',
      'cheapest-uk-supermarket-meal-prep',
      'sainsburys-meal-prep-uk',
      'asda-meal-prep-uk',
      'best-cheap-high-protein-foods-uk',
      'lidl-meal-prep-uk',
      'morrisons-meal-prep-uk',
      'iceland-meal-prep-uk',
      'generic-uk-supermarket-meal-plan',
      'tesco-clubcard-meal-prep-uk',
      'aldi-high-protein-shopping-list-uk',
    ],
  },
  {
    label: 'Diet Types',
    slugs: [
      'vegan-meal-prep-uk',
      'vegetarian-meal-prep-uk',
      'anti-inflammatory-diet-meal-plan-uk',
      'menopause-diet-plan-uk',
      'endurance-running-nutrition-uk',
      'muscle-building-meal-plan-uk',
      'pescatarian-meal-prep-uk',
      'gluten-free-friendly-meal-prep-uk',
      'family-meal-prep-on-a-budget-uk',
      'night-shift-meal-prep-uk',
    ],
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'MealPrep.org.uk Blog — UK Meal Prep & Nutrition Guides',
  description: 'Free UK meal prep guides for weight loss, high protein eating, supermarket shopping, vegan meals, batch cooking and budget planning.',
  url: 'https://www.mealprep.org.uk/blog',
  publisher: { '@type': 'Organization', name: 'MealPrep.org.uk', url: 'https://www.mealprep.org.uk' },
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: CATEGORY_ORDER.flatMap(cat => cat.slugs)
      .filter(slug => blogPostsData[slug])
      .map((slug, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: blogPostsData[slug].h1,
        url: `https://www.mealprep.org.uk/blog/${slug}`,
      })),
  },
};

export default function Blog() {
  return (
    <>
      <SEO
        title="Meal Prep Blog UK — Free Nutrition Guides & Eating Plans | MealPrep.org.uk"
        description="Free UK meal prep guides for weight loss, high protein eating, supermarket shopping, vegan meals, batch cooking and budget planning."
        canonical="/blog"
        jsonLd={jsonLd}
      />

      <div className="content-page">
        <nav className="breadcrumb">
          <Link to="/">Home</Link> <span aria-hidden>›</span> <span>Blog</span>
        </nav>

        <SiteLogo variant="page" className="page-header-logo" />
        <h1>UK Meal Prep &amp; Nutrition Blog</h1>
        <p className="content-intro">
          Free guides covering everything from calorie deficits and high-protein eating to
          supermarket comparisons, batch cooking, and specialist diets. All advice is tailored to
          UK supermarket ingredients and realistic budgets.
        </p>

        {CATEGORY_ORDER.map(cat => (
          <section key={cat.label} className="blog-category-section">
            <h2 className="blog-category-heading">{cat.label}</h2>
            <div className="blog-card-grid">
              {cat.slugs.map(slug => {
                const post = blogPostsData[slug];
                if (!post) return null;
                return (
                  <Link key={slug} to={`/blog/${slug}`} className="blog-card">
                    {hasCustomBlogImage(slug) && (
                      <img
                        className="blog-card-thumb"
                        src={generateBlogCardImageUrl(slug, post.h1)}
                        alt=""
                        loading="lazy"
                      />
                    )}
                    <h3 className="blog-card-title">{post.h1}</h3>
                    <p className="blog-card-desc">{post.description}</p>
                    <span className="blog-card-cta">Read guide →</span>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}

        <div className="cta-box cta-box--large">
          <h2>Ready to put it into practice?</h2>
          <p>Browse {PLAN_COUNT} free UK meal plans or take the quiz to get matched in 30 seconds.</p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/quiz" className="btn-primary">Take the Quiz →</Link>
            <Link to="/browse" className="btn-secondary">Browse All {PLAN_COUNT} Plans</Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
