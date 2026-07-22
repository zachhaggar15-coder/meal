import { Link } from 'react-router-dom';
import { PLAN_COUNT } from '../data/planSeeds.js';
import { toTitleCase } from '../utils/textFormatting.js';

function hasAny(value, needles) {
  return needles.some(needle => value.includes(needle));
}

function buildGuides(slug, post) {
  const text = `${slug} ${post?.title || ''} ${post?.h1 || ''}`.toLowerCase();
  const isContainer = post?.affiliateDisclosure || hasAny(text, ['container', 'lunch bag', 'meal prep box', 'meal prep tub']);
  const isSupermarket = hasAny(text, ['tesco', 'aldi', 'asda', 'sainsbury', 'lidl', 'morrisons', 'iceland', 'waitrose', 'ocado', 'marks-spencer', 'm&s', 'coop', 'co-op', 'supermarket']);
  const isCalorie = hasAny(text, ['calorie', 'weight loss', 'fat loss', 'deficit']);
  const isProtein = hasAny(text, ['protein', 'muscle', 'gym']);
  const isDelivery = hasAny(text, ['delivery', 'prepared meals', 'hellofresh', 'gousto', 'recipe box', 'recipe boxes']);

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
        to: '/meal-prep-containers',
        title: 'Best containers',
        description: 'Start with the full comparison hub for glass, plastic and leakproof picks.',
        event: 'popular_guide_container_click',
      },
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
      base[0],
    ];
  }

  if (isSupermarket) {
    return [
      base[0],
      {
        to: '/choose-plan/weight-loss',
        title: 'Choose supermarket',
        description: 'Pick Aldi, Lidl, Tesco, Asda, Sainsbury\'s, Morrisons, Iceland, Waitrose, Ocado, M&S, Co-op, or generic.',
        event: 'popular_guide_supermarket_click',
      },
      {
        to: '/meal-plans/meal-plans-with-shopping-list',
        title: 'Plans with lists',
        description: 'Printable meal plans with shopping lists built in.',
        event: 'popular_guide_hub_click',
      },
      {
        to: '/meal-prep-containers',
        title: 'Container guide',
        description: 'Compare work-lunch boxes, tubs, and glass containers.',
        event: 'popular_guide_container_click',
      },
    ];
  }

  if (isDelivery) {
    return [
      {
        to: '/blog/best-meal-prep-delivery-uk',
        title: 'Delivery comparison',
        description: 'Compare prepared meals, recipe boxes and supermarket self-prep.',
        event: 'popular_guide_delivery_click',
      },
      {
        to: '/blog/cheap-meal-prep-delivery-uk',
        title: 'Cheap delivery options',
        description: 'Check recipe-box offers, prepared meals and cheaper self-prep routes.',
        event: 'popular_guide_delivery_click',
      },
      {
        to: '/meal-plans/high-protein',
        title: 'High protein plans',
        description: 'Use supermarket plans when delivery is too expensive.',
        event: 'popular_guide_hub_click',
      },
      base[0],
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
        to: '/meal-plans/low-calorie',
        title: 'Low calorie meal plans',
        description: 'Weekly low-calorie UK plans with PDFs and shopping lists.',
        event: 'popular_guide_hub_click',
      },
      {
        to: '/meal-plans/weight-loss',
        title: 'Weight loss meal plan',
        description: 'Browse UK plans by calories, supermarket and diet type.',
        event: 'popular_guide_hub_click',
      },
      {
        to: '/meal-prep-containers',
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
      {
        to: '/blog/best-cheap-high-protein-foods-uk',
        title: 'Cheap protein UK',
        description: 'Budget supermarket protein staples for meal prep.',
        event: 'popular_guide_blog_click',
      },
      {
        to: '/blog/protein-porridge-and-yogurt-breakfasts-uk',
        title: 'Protein porridge UK',
        description: 'High-protein oats and yogurt breakfasts for busy weeks.',
        event: 'popular_guide_blog_click',
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
      to: '/meal-prep-containers',
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
        <span className="offer-kicker">{toTitleCase('Popular next steps')}</span>
        <h2 id="popular-guides-heading">{toTitleCase('Useful guides for this article')}</h2>
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
            <span>{toTitleCase(guide.title)}</span>
            <small>{guide.description}</small>
          </Link>
        ))}
      </div>
    </aside>
  );
}
