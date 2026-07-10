import { useParams, Link, Navigate } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import StickerPromo from '../components/StickerPromo.jsx';
import SiteLogo from '../components/SiteLogo.jsx';
import ContextualLinks from '../components/ContextualLinks.jsx';
import AffiliateProductGrid from '../components/AffiliateProductGrid.jsx';
import PopularGuides from '../components/PopularGuides.jsx';
import TrustBox from '../components/TrustBox.jsx';
import { blogPostsData } from '../data/blogPosts.js';
import {
  SEO_EXACT_PLAN_LINKS,
  SEO_OPPORTUNITY_QUICK_ANSWERS,
} from '../data/seoOpportunityPages.js';
import { generateBlogImageUrl, hasCustomBlogImage } from '../utils/imageGenerator.js';
import { BUDGET_CONTAINERS, MID_RANGE_CONTAINERS, MEAL_PREP_STICKERS } from '../data/offers.js';
import { AUTHOR_JSON_LD, SITE_AUTHOR_NAME, SITE_CONTACT_EMAIL } from '../constants/site.js';
import { toTitleCase } from '../utils/textFormatting.js';

export default function BlogPost() {
  const { slug } = useParams();
  const data = blogPostsData[slug];

  if (!data) return <Navigate to="/" replace />;

  const ogImageUrl = generateBlogImageUrl(slug, data.title);
  const sources = data.sources || [];
  const showTrustBox = data.trustNote !== false;
  const quickAnswer = data.quickAnswer || SEO_OPPORTUNITY_QUICK_ANSWERS[slug];
  const exactPlanLinks = SEO_EXACT_PLAN_LINKS[slug] || [];

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: data.h1,
      description: data.description,
      datePublished: data.published || '2026-05-28',
      dateModified: data.modified || '2026-05-30',
      author: AUTHOR_JSON_LD,
      publisher: { '@type': 'Organization', name: 'MealPrep.org.uk', url: 'https://www.mealprep.org.uk', email: SITE_CONTACT_EMAIL },
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
          <p className="content-byline">
            Written and reviewed by <Link to="/about">{SITE_AUTHOR_NAME}</Link>. Last materially reviewed:{' '}
            {data.reviewed || data.modified || '17 June 2026'}.
          </p>
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
              <strong>{toTitleCase('Quick answer')}</strong>
              <p>{quickAnswer.answer}</p>
              {quickAnswer.links?.length > 0 && (
                <div className="quick-answer-links">
                  {quickAnswer.links.map(link => (
                    <Link key={link.to} to={link.to}>{toTitleCase(link.label)}</Link>
                  ))}
                </div>
              )}
            </aside>
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

          <ExactPlanLinks links={exactPlanLinks} />

          {data.sections.map((section, i) => (
            <section key={i}>
              <h2>{toTitleCase(section.h2)}</h2>
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
                <ResponsiveBlogTable table={section.table} />
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

          <PopularGuides slug={slug} post={data} />

          <StickerPromo
            offer={data.offer === 'premium' ? MEAL_PREP_STICKERS : data.offer === 'mid-range' || data.affiliateDisclosure ? MID_RANGE_CONTAINERS : BUDGET_CONTAINERS}
            sourcePage={`blog-${slug}-body`}
          />

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
                  {toTitleCase(r.label)}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/"
                data-event="generator_cta_click"
                data-source-page={`blog-${slug}`}
              >
                Generate A Personalised UK Meal Plan
              </Link>
            </li>
            <li>
              <Link to="/stickers" data-event="container_promo_click" data-source-page={`blog-${slug}`}>
                Glass Meal Prep Containers For Batch Cooking
              </Link>
            </li>
          </ul>
          {showTrustBox && (
            <TrustBox
              sources={sources}
              reviewed={data.reviewed || data.modified || '17 June 2026'}
              note={data.trustNote}
            />
          )}
        </article>
      </div>
      <Footer />
    </>
  );
}

function ExactPlanLinks({ links }) {
  if (!links.length) return null;

  return (
    <aside className="exact-plan-links" aria-label="Exact meal plan matches">
      <div>
        <strong>{toTitleCase('Exact plan matches')}</strong>
        <p>Jump straight from this guide to a practical plan, shopping list or printable week.</p>
      </div>
      <div className="exact-plan-link-list">
        {links.map(link => (
          <Link key={link.to} to={link.to}>{toTitleCase(link.label)}</Link>
        ))}
      </div>
    </aside>
  );
}

function ResponsiveBlogTable({ table }) {
  const headers = table.headers?.length
    ? table.headers
    : table.rows[0]?.map((_, index) => `Column ${index + 1}`) || [];

  return (
    <div className="blog-table-group">
      <div className="blog-table-cards" aria-label="Table summary">
        {table.rows.map((row, rowIndex) => (
          <article className="blog-table-card" key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <div className="blog-table-card-row" key={`${rowIndex}-${cellIndex}`}>
                <strong>{headers[cellIndex]}</strong>
                <span>{cell}</span>
              </div>
            ))}
          </article>
        ))}
      </div>

      <div className="content-table-wrap blog-table-wrap" aria-label="Scrollable comparison table">
        <table className="content-table blog-table">
          {table.headers && (
            <thead>
              <tr>
                {table.headers.map((header, index) => (
                  <th key={index} scope="col">{header}</th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {table.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
