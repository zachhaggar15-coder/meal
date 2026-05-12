import { useParams, Link, Navigate } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import GeneratorCTA from '../components/GeneratorCTA.jsx';
import StickerPromo from '../components/StickerPromo.jsx';
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
    dateModified: '2026-05-01',
    publisher: { '@type': 'Organization', name: 'MealPrep.org.uk' },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.mealprep.org.uk/blog/${slug}`,
    },
  };

  return (
    <>
      <SEO
        title={data.title}
        description={data.description}
        canonical={`/blog/${slug}`}
        ogType="article"
        jsonLd={jsonLd}
      />
      <div className="page content-page">
        <nav className="breadcrumb">
          <Link to="/">Home</Link> <span aria-hidden>›</span>{' '}
          <span>Blog</span> <span aria-hidden>›</span>{' '}
          <span>{data.h1}</span>
        </nav>

        <article>
          <h1>{data.h1}</h1>
          <p className="content-intro">{data.intro}</p>

          {/* Early CTA — after the intro, before the main body */}
          <GeneratorCTA sourcePage={`blog-${slug}`} />

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
              {section.table && (
                <div style={{ overflowX: 'auto', margin: '16px 0' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    {section.table.headers && (
                      <thead>
                        <tr>
                          {section.table.headers.map((h, j) => (
                            <th key={j} style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '2px solid var(--border)', color: 'var(--accent-dark)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                    )}
                    <tbody>
                      {section.table.rows.map((row, j) => (
                        <tr key={j} style={{ borderBottom: '1px solid var(--border)' }}>
                          {row.map((cell, k) => (
                            <td key={k} style={{ padding: '8px 12px' }}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}

          {/* Sticker promo — before final CTA */}
          <StickerPromo />

          <div className="cta-box cta-box--large">
            <h2>Generate Your Free UK Meal Plan</h2>
            <p>
              Ready to put this into practice? Use the free AI generator to create a personalised
              meal plan for your preferred UK supermarket, calorie target, and dietary preferences.
            </p>
            <Link
              to={`/?from=blog-${slug}`}
              className="btn-primary"
              data-event="generator_cta_click"
              data-source-page={`blog-${slug}`}
            >
              Generate My Personalised Plan &rarr;
            </Link>
          </div>

          <h2>Related Articles &amp; Meal Plans</h2>
          <ul className="plan-links">
            {data.related.map(r => (
              <li key={r.slug}>
                <Link to={`/${r.type === 'blog' ? 'blog' : 'meal-plan'}/${r.slug}`}>
                  {r.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to={`/?from=blog-${slug}`}
                data-event="generator_cta_click"
                data-source-page={`blog-${slug}`}
              >
                Generate a personalised UK meal plan
              </Link>
            </li>
            <li>
              <Link to="/stickers" data-event="sticker_promo_click" data-source-page={`blog-${slug}`}>
                Meal prep labels for batch cooking
              </Link>
            </li>
          </ul>
        </article>
      </div>
      <Footer />
    </>
  );
}
