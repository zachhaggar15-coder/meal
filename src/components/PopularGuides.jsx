import { Link } from 'react-router-dom';
import { PLAN_COUNT } from '../data/planSeeds.js';

function hasAny(value, needles) {
  return needles.some(needle => value.includes(needle));
}

function buildGuides(slug, post) {
  const text = `${slug} ${post?.title || ''} ${post?.h1 || ''}`.toLowerCase();
  const isContainer = post?.affiliateDisclosure || hasAny(text, ['container', 'lunch bag', 'meal prep box', 'meal prep tub']);
  const isSupermarket = hasAny(text, ['tesco', 'aldi', 'asda', 'sainsbury', 'lidl', 'morrisons', 'iceland', 'supermarket']);
  const isCalorie = hasAny(text, ['calorie', 'weight loss', 'fat loss', 'deficit']);
  const isProtein = hasAny(text, ['protein', 'muscle', 'gym']);

  const base = [
    {
      to: '/quiz',
      title: 'Find your best plan',
      description: 'Answer 7 quick questions and get matched to a UK meal plan.',
      event: 'popular_guide_quiz_click',
    },
    {
      to: '/browse',
      title: `Browse ${PLAN_COUNT} plans`,
      description: 'Filter by calories, diet type, supermarket, goal, and effort.',
      event: 'popular_guide_browse_click',
    },
  ];

  if (isContainer) {
    return [
      {
        to: '/meal-prep-containers/budget',
        title: 'Budget containers',
        description: 'Cheap meal prep boxes and tubs for starting out.',
        event: 'popular_guide_container_click',
      },
      {
        to: '/meal-prep-containers/mid-range',
        title: 'Glass containers',
        description: 'Mid-range glass picks for reheating and work lunches.',
        event: 'popular_guide_container_click',
      },
      {
        to: '/meal-prep-containers/premium',
        title: 'Premium containers',
        description: 'Long-term sets with stronger lids and better storage.',
        event: 'popular_guide_container_click',
      },
      base[0],
    ];
  }

  if (isSupermarket) {
    return [
      base[0],
      {
        to: '/choose-plan/weight-loss',
        title: 'Choose supermarket',
        description: 'Pick Aldi, Lidl, Tesco, Asda, Sainsbury\'s, Morrisons, Iceland, or generic.',
        event: 'popular_guide_supermarket_click',
      },
      {
        to: '/meal-plans/meal-plans-with-shopping-list',
        title: 'Plans with lists',
        description: 'Printable meal plans with shopping lists built in.',
        event: 'popular_guide_hub_click',
      },
      {
        to: '/meal-prep-containers/mid-range',
        title: 'Container guide',
        description: 'Compare work-lunch boxes, tubs, and glass containers.',
        event: 'popular_guide_container_click',
      },
    ];
  }

  if (isCalorie) {
    return [
      base[0],
      {
        to: '/meal-plans/1500-calorie',
        title: '1500 calorie plans',
        description: 'Compare ready-made UK plans for lower-calorie weeks.',
        event: 'popular_guide_hub_click',
      },
      {
        to: '/meal-plans/weight-loss',
        title: 'Weight loss plans',
        description: 'Browse structured plans by goal, supermarket, and diet type.',
        event: 'popular_guide_hub_click',
      },
      {
        to: '/meal-prep-containers/mid-range',
        title: 'Prep containers',
        description: 'Make batch cooking easier with boxes that fit real portions.',
        event: 'popular_guide_container_click',
      },
    ];
  }

  if (isProtein) {
    return [
      base[0],
      {
        to: '/meal-plans/high-protein',
        title: 'High protein plans',
        description: 'Protein-led plans for fat loss, gym beginners, and muscle gain.',
        event: 'popular_guide_hub_click',
      },
      base[1],
      {
        to: '/meal-prep-containers/mid-range',
        title: 'Prep containers',
        description: 'Compare containers for work lunches and batch cooking.',
        event: 'popular_guide_container_click',
      },
    ];
  }

  return [
    base[0],
    base[1],
    {
      to: '/meal-plans/printable-meal-plans',
      title: 'Printable plans',
      description: 'Export-friendly plans with shopping lists for the week.',
      event: 'popular_guide_hub_click',
    },
    {
      to: '/meal-prep-containers/mid-range',
      title: 'Container guide',
      description: 'Compare meal prep boxes, tubs, and glass containers.',
      event: 'popular_guide_container_click',
    },
  ];
}

export default function PopularGuides({ slug, post }) {
  const guides = buildGuides(slug, post);

  return (
    <aside className="popular-guides" aria-labelledby="popular-guides-heading">
      <div className="popular-guides-head">
        <span className="offer-kicker">Popular next steps</span>
        <h2 id="popular-guides-heading">Useful guides for this article</h2>
      </div>
      <div className="popular-guides-grid">
        {guides.map(guide => (
          <Link
            key={guide.to}
            to={guide.to}
            className="popular-guide-card"
            data-event={guide.event}
            data-source-page={`blog-${slug}`}
          >
            <span>{guide.title}</span>
            <small>{guide.description}</small>
          </Link>
        ))}
      </div>
    </aside>
  );
}
