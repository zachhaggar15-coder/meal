import { useParams, Link, Navigate } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import GeneratorCTA from '../components/GeneratorCTA.jsx';
import StickerPromo from '../components/StickerPromo.jsx';
import SiteLogo from '../components/SiteLogo.jsx';
import ContextualLinks from '../components/ContextualLinks.jsx';
import AffiliateProductGrid from '../components/AffiliateProductGrid.jsx';
import PopularGuides from '../components/PopularGuides.jsx';
import TrustBox from '../components/TrustBox.jsx';
import { blogPostsData } from '../data/blogPosts.js';
import { SEO_OPPORTUNITY_QUICK_ANSWERS } from '../data/seoOpportunityPages.js';
import { generateBlogImageUrl, hasCustomBlogImage } from '../utils/imageGenerator.js';
import { BUDGET_CONTAINERS } from '../data/offers.js';

export default function BlogPost() {
  const { slug } = useParams();
  const data = blogPostsData[slug];

  if (!data) return <Navigate to="/" replace />;

  const ogImageUrl = generateBlogImageUrl(slug, data.title);
  const sources = data.sources || [];
  const showTrustBox = Boolean(data.reviewed || data.sources?.length || data.trustNote);
  const quickAnswer = data.quickAnswer || SEO_OPPORTUNITY_QUICK_ANSWERS[slug];

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: data.h1,
      description: data.description,
      datePublished: data.published || '2026-05-28',
      dateModified: data.modified || '2026-05-30',
      author: { '@type': 'Organization', name: 'MealPrep.org.uk', url: 'https://www.mealprep.org.uk' },
      publisher: { '@type': 'Organization', name: 'MealPrep.org.uk', url: 'https://www.mealprep.org.uk' },
      about: [
        'UK meal prep',
        'Meal planning',
        data.h1,
      ],
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://www.mealprep.org.uk/blog/${slug}`,
      },
      image: ogImageUrl,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.mealprep.org.uk' },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.mealprep.org.uk/blog' },
        { '@type': 'ListItem', position: 3, name: data.h1, item: `https://www.mealprep.org.uk/blog/${slug}` },
      ],
    },
  ];

  if (sources.length) {
    jsonLd[0].citation = sources.map(source => source.url);
  }

  if (data.faq?.length) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: data.faq.map(item => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    });
  }

  return (
    <>
      <SEO
        title={data.title}
        description={data.description}
        canonical={`/blog/${slug}`}
        ogType="article"
        ogImage={ogImageUrl}
        jsonLd={jsonLd}
      />
      <div className="page content-page">
        <nav className="breadcrumb">
          <Link to="/">Home</Link> <span aria-hidden>›</span>{' '}
          <span>Blog</span> <span aria-hidden>›</span>{' '}
          <span>{data.h1}</span>
        </nav>

        <article>
          <SiteLogo variant="page" className="page-header-logo" />
          <h1>{data.h1}</h1>
          <p className="content-intro">{data.intro}</p>
          {hasCustomBlogImage(slug) && (
            <figure className="blog-hero-image">
              <img src={ogImageUrl} alt={`${data.h1} guide`} />
            </figure>
          )}
          {data.affiliateDisclosure && (
            <p className="affiliate-disclosure">{data.affiliateDisclosure}</p>
          )}
          {quickAnswer && (
            <aside className="quick-answer-box" aria-label="Quick answer">
              <strong>Quick answer</strong>
              <p>{quickAnswer.answer}</p>
              {quickAnswer.links?.length > 0 && (
                <div className="quick-answer-links">
                  {quickAnswer.links.map(link => (
                    <Link key={link.to} to={link.to}>{link.label}</Link>
                  ))}
                </div>
              )}
            </aside>
          )}
          {showTrustBox && (
            <TrustBox
              sources={sources}
              reviewed={data.reviewed || data.modified || '17 June 2026'}
              note={data.trustNote}
            />
          )}
          <ContextualLinks blocks={data.contextualLinks} />

          {data.productRecommendations && (
            <AffiliateProductGrid
              title={data.productRecommendations.title}
              intro={data.productRecommendations.intro}
              productIds={data.productRecommendations.productIds}
              sourcePage={`blog-${slug}-recommendations`}
              showDisclosure={false}
            />
          )}

          {/* Early CTA — after the intro, before the main body */}
          <GeneratorCTA sourcePage={`blog-${slug}`} />
          <PopularGuides slug={slug} post={data} />

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
          {data.faq?.length && (
            <>
              <h2>Frequently Asked Questions</h2>
              <div className="faq">
                {data.faq.map((item, i) => (
                  <div key={i} className="faq-item">
                    <h3>{item.q}</h3>
                    <p>{item.a}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          <StickerPromo offer={BUDGET_CONTAINERS} sourcePage={`blog-${slug}-body`} />

          <div className="cta-box cta-box--large">
            <h2>Generate Your Free UK Meal Plan</h2>
            <p>
              Ready to put this into practice? Use the free AI generator to create a personalised
              meal plan for your preferred UK supermarket, calorie target, and dietary preferences.
            </p>
            <Link
              to="/"
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
              <li key={r.path || r.slug}>
                <Link to={r.path || `/${r.type === 'blog' ? 'blog' : r.type === 'plan' ? 'plans' : 'meal-plan'}/${r.slug}`}>
                  {r.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/"
                data-event="generator_cta_click"
                data-source-page={`blog-${slug}`}
              >
                Generate a personalised UK meal plan
              </Link>
            </li>
            <li>
              <Link to="/stickers" data-event="container_promo_click" data-source-page={`blog-${slug}`}>
                Glass meal prep containers for batch cooking
              </Link>
            </li>
          </ul>
        </article>
      </div>
      <Footer />
    </>
  );
}
