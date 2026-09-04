import { Link } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import SiteLogo from '../components/SiteLogo.jsx';
import blogSearchIndex from '../data/blogSearchIndex.json' with { type: 'json' };
import { PLAN_COUNT_LABEL } from '../data/planCatalogMeta.js';
import { generateBlogCardImageUrl } from '../utils/imageGenerator.js';

const BLOG_CATEGORY_GROUPS = blogSearchIndex.reduce((groups, post) => {
  const current = groups.at(-1);
  if (current?.label === post.category) {
    current.posts.push(post);
  } else {
    groups.push({ label: post.category, posts: [post] });
  }
  return groups;
}, []);

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'MealPrep.org.uk Blog — UK Meal Prep & Nutrition Guides',
  description: 'Free UK meal prep guides for weight loss, high protein eating, supermarket shopping, vegan meals, batch cooking and budget planning.',
  url: 'https://www.mealprep.org.uk/blog',
  publisher: { '@type': 'Organization', name: 'MealPrep.org.uk', url: 'https://www.mealprep.org.uk' },
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: blogSearchIndex.map((post, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: post.title,
      url: `https://www.mealprep.org.uk/blog/${post.slug}`,
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
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link> <span aria-hidden>›</span> <span>Blog</span>
        </nav>

        <SiteLogo variant="page" className="page-header-logo" />
        <h1>UK Meal Prep &amp; Nutrition Blog</h1>
        <p className="content-intro">
          Free guides covering everything from calorie deficits and high-protein eating to
          supermarket comparisons, batch cooking, and specialist diets. All advice is tailored to
          UK supermarket ingredients and realistic budgets.
        </p>

        {/* Every category is a native <details>. The 153 article links stay in the
            served HTML whether a section is open or closed, so nothing here
            depends on JavaScript and nothing is hidden from a crawler - the
            page already earns impressions and must not lose its links. What it
            loses is height: 16 collapsed rows instead of 153 stacked cards.

            The first category is open so the page still shows real guides on
            arrival rather than a wall of headings. Any article is then two
            interactions away: open its category, click the card. */}
        {BLOG_CATEGORY_GROUPS.map((category, categoryIndex) => (
          <details
            key={category.label}
            className="blog-category-section"
            open={categoryIndex === 0}
          >
            <summary className="blog-category-heading">
              <span>{category.label}</span>
              <span className="blog-category-count">
                {category.posts.length} {category.posts.length === 1 ? 'guide' : 'guides'}
              </span>
            </summary>
            <div className="blog-card-grid">
              {category.posts.map(post => (
                <Link key={post.slug} to={`/blog/${post.slug}`} className="blog-card">
                  <img
                    className="blog-card-thumb"
                    src={generateBlogCardImageUrl(post.imageId, post.title)}
                    alt=""
                    loading="lazy"
                  />
                  <h3 className="blog-card-title">{post.title}</h3>
                  <p className="blog-card-desc">{post.description}</p>
                  <span className="blog-card-cta">Read guide →</span>
                </Link>
              ))}
            </div>
          </details>
        ))}

        <div className="cta-box cta-box--large">
          <h2>Ready to put it into practice?</h2>
          <p>Browse {PLAN_COUNT_LABEL} free UK meal plans or take the quiz to get matched in 30 seconds.</p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/quiz" className="btn-primary">Take the Quiz →</Link>
            <Link to="/browse" className="btn-secondary">Browse All {PLAN_COUNT_LABEL} Plans</Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
