import { Link } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import { blogPostsData } from '../data/blogPosts.js';

const CATEGORY_ORDER = [
  {
    label: 'Weight Loss & Calories',
    slugs: [
      'how-to-lose-weight-fast-uk',
      'how-to-build-a-calorie-deficit',
      'how-many-calories-to-lose-weight',
      '1500-vs-1800-vs-2000-calories',
      'how-to-lose-belly-fat-uk',
      'cutting-diet-plan-uk',
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
      'low-calorie-snacks-uk',
    ],
  },
  {
    label: 'Meal Prep & Batch Cooking',
    slugs: [
      'meal-prep-for-beginners-uk',
      'batch-cooking-for-beginners-uk',
      'how-to-meal-plan-for-weight-loss',
      'cheap-meal-prep-shopping-list-uk',
      'meal-prep-containers-uk',
      'intermittent-fasting-meal-plan-uk',
    ],
  },
  {
    label: 'Supermarket Guides',
    slugs: [
      'tesco-low-calorie-shopping-list',
      'aldi-vs-tesco-meal-prep',
      'cheapest-uk-supermarket-meal-prep',
      'sainsburys-meal-prep-uk',
      'asda-meal-prep-uk',
      'best-cheap-high-protein-foods-uk',
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
    ],
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'MealPrep.org.uk Blog — UK Meal Prep & Nutrition Guides',
  description: 'Free UK meal prep guides, nutrition advice, supermarket shopping tips, and diet plans for weight loss, muscle building, and healthy eating.',
  url: 'https://www.mealprep.org.uk/blog',
  publisher: { '@type': 'Organization', name: 'MealPrep.org.uk', url: 'https://www.mealprep.org.uk' },
};

export default function Blog() {
  return (
    <>
      <SEO
        title="Meal Prep Blog UK — Free Nutrition Guides & Eating Plans | MealPrep.org.uk"
        description="Free UK meal prep guides, nutrition advice, supermarket shopping tips, and diet plans. 30 articles covering weight loss, high protein, vegan, batch cooking, and more."
        canonical="/blog"
        jsonLd={jsonLd}
      />

      <div className="content-page">
        <nav className="breadcrumb">
          <Link to="/">Home</Link> <span aria-hidden>›</span> <span>Blog</span>
        </nav>

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
          <p>Browse 300 free UK meal plans or take the quiz to get matched in 30 seconds.</p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/quiz" className="btn-primary">Take the Quiz →</Link>
            <Link to="/browse" className="btn-secondary">Browse All Plans</Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
