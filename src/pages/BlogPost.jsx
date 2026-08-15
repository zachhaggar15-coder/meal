import { Fragment } from 'react';
import { useParams, Link } from 'react-router-dom';
import AdSlot from '../components/AdSlot.jsx';
import SEO from '../components/SEO.jsx';
import Footer from '../components/Footer.jsx';
import StickerPromo from '../components/StickerPromo.jsx';
import SiteLogo from '../components/SiteLogo.jsx';
import ContextualLinks from '../components/ContextualLinks.jsx';
import ContextualNextStep from '../components/ContextualNextStep.jsx';
import AffiliateProductGrid from '../components/AffiliateProductGrid.jsx';
import ContainerQuickComparison from '../components/ContainerQuickComparison.jsx';
import ProductPicks from '../components/ProductPicks.jsx';
import PopularGuides from '../components/PopularGuides.jsx';
import QuizNudge from '../components/QuizNudge.jsx';
import TrustBox from '../components/TrustBox.jsx';
import ContentByline from '../components/ContentByline.jsx';
import { contentProvenance, schemaDates } from '../utils/contentDates.js';
import NotFound from './NotFound.jsx';
import { blogPostsData } from '../data/blogPosts.js';
import {
  SEO_EXACT_PLAN_LINKS,
  SEO_OPPORTUNITY_QUICK_ANSWERS,
} from '../data/seoOpportunityPages.js';
import { generateBlogImageUrl, hasCustomBlogImage } from '../utils/imageGenerator.js';
import { BUDGET_CONTAINERS, MID_RANGE_CONTAINERS, MEAL_PREP_STICKERS } from '../data/offers.js';
import { AUTHOR_JSON_LD, SITE_CONTACT_EMAIL } from '../constants/site.js';
import { toTitleCase } from '../utils/textFormatting.js';
import { buildBlogNextStep } from '../utils/contextualJourney.js';

export default function BlogPost() {
  const { slug } = useParams();
  const data = blogPostsData[slug];

  if (!data) return <NotFound />;

  const ogImageUrl = generateBlogImageUrl(slug, data.title);
  const sources = data.sources || [];
  const showTrustBox = data.trustNote !== false;
  const quickAnswer = data.quickAnswer || SEO_OPPORTUNITY_QUICK_ANSWERS[slug];
  const exactPlanLinks = SEO_EXACT_PLAN_LINKS[slug] || [];
  const nextStep = buildBlogNextStep({ slug, data, exactPlanLinks });
  const useBuyingGuideFlow = data.commercialLayout === 'container-buying-guide';

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: data.h1,
      description: data.description,
      ...schemaDates(data),
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

  if (data.recipes?.length) {
    jsonLd.push(...data.recipes.map(recipe => ({
      '@context': 'https://schema.org',
      '@type': 'Recipe',
      name: recipe.name,
      description: recipe.description,
      author: AUTHOR_JSON_LD,
      ...schemaDates(data),
      image: ogImageUrl,
      recipeCategory: recipe.category || 'Main course',
      recipeCuisine: recipe.cuisine || 'British',
      recipeYield: recipe.servings,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      totalTime: recipe.totalTime,
      recipeIngredient: recipe.ingredients,
      recipeInstructions: recipe.method.map(step => ({
        '@type': 'HowToStep',
        text: step,
      })),
      nutrition: {
        '@type': 'NutritionInformation',
        calories: recipe.calories,
        proteinContent: recipe.protein,
      },
    })));
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
          {!useBuyingGuideFlow && (
            <ContentByline record={data} />
          )}
          {quickAnswer && !useBuyingGuideFlow && (
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
          {!useBuyingGuideFlow && (
            <>
              <QuizNudge
                sourcePage={`blog-${slug}`}
                pageType="blog"
                location="after_quick_answer"
              />
              <ContextualNextStep
                {...nextStep}
                eyebrow="Make this practical"
                pageType={`blog-${slug}`}
                className="blog-next-step"
              />
              <AdSlot
                placement="in-article-intro"
                slotId={import.meta.env.VITE_AD_SLOT_IN_ARTICLE}
              />
            </>
          )}

          {hasCustomBlogImage(slug) && !useBuyingGuideFlow && (
            <figure className="blog-hero-image blog-hero-image--after-answer">
              <img
                src={ogImageUrl}
                alt={`${data.h1} guide`}
                width={1200}
                height={630}
                decoding="async"
              />
            </figure>
          )}
          {data.affiliateDisclosure && (
            <p className="affiliate-disclosure">{data.affiliateDisclosure}</p>
          )}
          {useBuyingGuideFlow && data.productRecommendations && (
            <>
              <ContainerQuickComparison
                eyebrow="Quick picks"
                title={data.productRecommendations.title}
                intro={data.productRecommendations.intro}
                picks={data.productRecommendations.quickPicks}
                sourcePage={`blog-${slug}-quick-picks`}
                showDisclosure={false}
                showSnapshotStrip={false}
                compact
                recommendationSource="container_buying_guide"
              />
              <ContentByline record={data} />
            </>
          )}
          {!useBuyingGuideFlow && <ContextualLinks blocks={data.contextualLinks} />}

          {data.productRecommendations && !useBuyingGuideFlow && (
            <AffiliateProductGrid
              title={data.productRecommendations.title}
              intro={data.productRecommendations.intro}
              productIds={data.productRecommendations.productIds}
              sourcePage={`blog-${slug}-recommendations`}
              showDisclosure={false}
            />
          )}

          {data.toolRecommendations && (
            <ProductPicks
              title={data.toolRecommendations.title}
              intro={data.toolRecommendations.intro}
              productIds={data.toolRecommendations.productIds}
              sourcePage={`blog-${slug}-tools`}
              showDisclosure={false}
            />
          )}

          <RecipeCollection recipes={data.recipes} slug={slug} />

          {data.sections.map((section, i) => (
            <Fragment key={i}>
              <section>
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
              {useBuyingGuideFlow && data.detailedProductsAfterSection === i && (
                <AffiliateProductGrid
                  title="Details on the three picks"
                  intro="Compare the trade-offs once you know which use case fits you. Amazon shows the current price and listing details."
                  productIds={data.productRecommendations.productIds}
                  sourcePage={`blog-${slug}-detailed-picks`}
                  showDisclosure={false}
                  showQuickComparison={false}
                  recommendationSource="container_buying_guide"
                  compact
                />
              )}
              {i === Math.floor((data.sections.length - 1) / 2) && (
                <AdSlot
                  placement="in-article-midpoint"
                  slotId={import.meta.env.VITE_AD_SLOT_IN_ARTICLE}
                />
              )}
            </Fragment>
          ))}

          {useBuyingGuideFlow && (
            <>
              <ContextualLinks blocks={data.contextualLinks} />
              <QuizNudge
                sourcePage={`blog-${slug}`}
                pageType="blog"
                location="after_buying_guide"
              />
              <ContextualNextStep
                {...nextStep}
                eyebrow="Use your containers"
                pageType={`blog-${slug}`}
                className="blog-next-step"
              />
              <AdSlot
                placement="in-article-midpoint"
                slotId={import.meta.env.VITE_AD_SLOT_IN_ARTICLE}
              />
            </>
          )}

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

          {!useBuyingGuideFlow && (
            <StickerPromo
              offer={data.offer === 'premium' ? MEAL_PREP_STICKERS : data.offer === 'mid-range' || data.affiliateDisclosure ? MID_RANGE_CONTAINERS : BUDGET_CONTAINERS}
              sourcePage={`blog-${slug}-body`}
            />
          )}

          <div className="cta-box cta-box--large">
            <h2>Find Your UK Supermarket Meal Plan</h2>
            <p>
              Answer seven quick questions to find a realistic weekly plan for your supermarket,
              calorie target, budget and dietary preferences.
            </p>
            <Link
              to="/quiz"
              className="btn-primary"
              data-event="plan_primary_cta_clicked"
              data-source-page={`blog-${slug}`}
              data-page-type="blog"
              data-cta-location="article_end"
            >
              Find My Meal Plan &rarr;
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
                to="/quiz"
                data-event="plan_primary_cta_clicked"
                data-source-page={`blog-${slug}`}
              >
                Generate A Personalised UK Meal Plan
              </Link>
            </li>
            <li>
              <Link to="/glass-meal-prep-containers" data-event="container_promo_click" data-source-page={`blog-${slug}`}>
                Glass Meal Prep Container Quick Compare
              </Link>
            </li>
          </ul>
          {showTrustBox && (
            <TrustBox
              sources={sources}
              {...contentProvenance(data)}
              note={data.trustNote}
            />
          )}
        </article>
      </div>
      <Footer />
    </>
  );
}

function RecipeCollection({ recipes, slug }) {
  if (!recipes?.length) return null;

  return (
    <section className="recipe-collection" aria-labelledby={`${slug}-recipes-heading`}>
      <div className="recipe-collection-head">
        <span className="offer-kicker">{toTitleCase('Recipe section')}</span>
        <h2 id={`${slug}-recipes-heading`}>{toTitleCase('Summery recipes to make this week')}</h2>
        <p>
          These are light, practical UK summer meal prep ideas with supermarket ingredients,
          simple methods and storage notes for warmer weeks.
        </p>
      </div>
      <div className="recipe-card-grid">
        {recipes.map(recipe => (
          <article className="recipe-card" key={recipe.name}>
            <div className="recipe-card-top">
              <div>
                <h3>{toTitleCase(recipe.name)}</h3>
                <p>{recipe.description}</p>
              </div>
              <div className="recipe-card-meta" aria-label={`${recipe.name} nutrition summary`}>
                <span>{recipe.calories}</span>
                <span>{recipe.protein}</span>
              </div>
            </div>
            <dl className="recipe-facts">
              <div>
                <dt>Serves</dt>
                <dd>{recipe.servings}</dd>
              </div>
              <div>
                <dt>Total</dt>
                <dd>{recipe.totalLabel}</dd>
              </div>
              <div>
                <dt>Best</dt>
                <dd>{recipe.bestServed}</dd>
              </div>
            </dl>
            <div className="recipe-card-body">
              <div>
                <h4>{toTitleCase('Ingredients')}</h4>
                <ul>
                  {recipe.ingredients.map(item => <li key={item}>{item}</li>)}
                </ul>
              </div>
              <div>
                <h4>{toTitleCase('Method')}</h4>
                <ol>
                  {recipe.method.map(step => <li key={step}>{step}</li>)}
                </ol>
              </div>
            </div>
            <p className="recipe-storage-note">{recipe.storage}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ResponsiveBlogTable({ table }) {
  const headers = table.headers?.length
    ? table.headers
    : table.rows[0]?.map((_, index) => `Column ${index + 1}`) || [];

  return (
    <div className="blog-table-group">
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
                  <td key={cellIndex} data-label={headers[cellIndex]}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
