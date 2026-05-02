import { useParams, Link, Navigate } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import { blogPostsData } from '../data/blogPosts.js';

export default function BlogPost() {
  const { slug } = useParams();
  const data = blogPostsData[slug];

  if (!data) return <Navigate to="/" replace />;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.h1,
    description: data.description,
    datePublished: '2025-01-01',
    dateModified: '2025-05-01',
    publisher: { '@type': 'Organization', name: 'UK Meal Plan Generator' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://www.mealprep.org.uk/blog/${slug}` },
  };

  return (
    <>
      <SEO
        title={data.title}
        description={data.description}
        canonical={`/blog/${slug}`}
        jsonLd={jsonLd}
      />
      <div className="page content-page">
        <nav className="breadcrumb">
          <Link to="/">Home</Link> <span aria-hidden>›</span> <span>{data.h1}</span>
        </nav>

        <article>
          <h1>{data.h1}</h1>
          <p className="content-intro">{data.intro}</p>

          {data.sections.map((section, i) => (
            <section key={i}>
              <h2>{section.h2}</h2>
              {section.paragraphs.map((para, j) => (
                <p key={j}>{para}</p>
              ))}
              {section.bullets && (
                <ul className="content-bullets">
                  {section.bullets.map((bullet, j) => <li key={j}>{bullet}</li>)}
                </ul>
              )}
              {section.numbered && (
                <ol className="content-numbered">
                  {section.numbered.map((item, j) => <li key={j}>{item}</li>)}
                </ol>
              )}
            </section>
          ))}

          <div className="cta-box cta-box--large">
            <h2>Generate Your Free UK Meal Plan</h2>
            <p>Ready to put this into practice? Use our free AI generator to create a personalised low-calorie meal plan for your preferred UK supermarket.</p>
            <Link to="/" className="btn-primary">Try the Free Generator →</Link>
          </div>

          <h2>Related Articles & Meal Plans</h2>
          <ul className="plan-links">
            {data.related.map(r => (
              <li key={r.slug}>
                <Link to={`/${r.type === 'blog' ? 'blog' : 'meal-plan'}/${r.slug}`}>{r.label}</Link>
              </li>
            ))}
          </ul>
        </article>
      </div>
      <Footer />
    </>
  );
}
