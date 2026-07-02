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

  const wordCount = data.sections.reduce((total, s) => {
    const pWords = s.paragraphs?.join(' ').split(/\s+/).length ?? 0;
    const bWords = s.bullets?.join(' ').split(/\s+/).length ?? 0;
    return total + pWords + bWords;
  }, 0);
  const readingTime = data.readingTime ?? Math.max(4, Math.round(wordCount / 220));
  const updatedDate = data.dateModified ?? '2026-05-01';
  const formattedUpdatedDate = new Date(updatedDate).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: data.h1,
      description: data.description,
      datePublished: data.datePublished ?? '2025-09-01',
      dateModified: data.dateModified ?? '2026-05-01',
      author: { '@type': 'Organization', name: 'MealPrep.org.uk', url: 'https://www.mealprep.org.uk' },
      publisher: { '@type': 'Organization', name: 'MealPrep.org.uk' },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://www.mealprep.org.uk/blog/${slug}`,
      },
    },
    ...(data.faq?.length ? [{
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: data.faq.map(item => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    }] : []),
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.mealprep.org.uk/' },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.mealprep.org.uk/blog' },
        { '@type': 'ListItem', position: 3, name: data.h1 },
      ],
    },
  ];

  return (
    <>
      <SEO
        title={data.title}
        description={data.description}
        canonical={`/blog/${slug}`}
        ogType="article"
        ogImage="/og-blog.png"
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
          <p className="article-meta">
            By the <Link to="/about">MealPrep.org.uk team</Link>
            {' · '}
            <time dateTime={data.datePublished ?? '2025-09-01'}>
              {new Date(data.datePublished ?? '2025-09-01').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </time>
            {' · '}{readingTime} min read
            {' · '}Updated {formattedUpdatedDate}
          </p>
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
              {i === 1 && (
                <div className="inline-cta">
                  <strong>Want this calculated for your calories?</strong>{' '}
                  <Link
                    to={`/?from=blog-${slug}`}
                    data-event="generator_cta_click"
                    data-source-page={`blog-${slug}`}
                  >
                    Build my free 7-day plan
                  </Link>
                </div>
              )}
            </section>
          ))}

          {data.sources?.length > 0 && (
            <section className="article-sources">
              <h2>Sources</h2>
              <ul className="content-bullets">
                {data.sources.map((src, i) => (
                  <li key={i}>
                    <a href={src.url} target="_blank" rel="noopener noreferrer">{src.label}</a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {data.faq?.length > 0 && (
            <div className="faq">
              <h2>Frequently Asked Questions</h2>
              {data.faq.map((item, i) => (
                <div key={i} className="faq-item">
                  <h3>{item.q}</h3>
                  <p>{item.a}</p>
                </div>
              ))}
            </div>
          )}

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
              Build My Free 7-Day Plan &rarr;
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
