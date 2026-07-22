const BASE = '/images/meal-plans/';

function visual(file, alt) {
  return {
    src: `${BASE}${file}`,
    alt,
    width: 1200,
    height: 675,
  };
}

function asset(path, alt, width = 1200, height = 675) {
  return {
    src: path,
    alt,
    width,
    height,
  };
}

const CARD_THEMES = [
  { paper: '#f8f3ea', band: '#174f3f', accent: '#0f8b63', line: '#d8c8ae' },
  { paper: '#f4f7ec', band: '#273f7a', accent: '#f5b82e', line: '#cbd6b9' },
  { paper: '#fff6df', band: '#005d52', accent: '#c84332', line: '#dcc999' },
  { paper: '#f2f5f8', band: '#1f3552', accent: '#6aa84f', line: '#c9d2dd' },
  { paper: '#fbf1f4', band: '#5c2f48', accent: '#e07a5f', line: '#dfc1cc' },
  { paper: '#f1f7f4', band: '#2b4b36', accent: '#7fb069', line: '#c4d9ca' },
  { paper: '#f7f0e6', band: '#4a3826', accent: '#c07a2c', line: '#d8c2a6' },
  { paper: '#eff5fa', band: '#234969', accent: '#7cc6d8', line: '#c3d6e4' },
  { paper: '#f7f4fb', band: '#4a315f', accent: '#8e6eb4', line: '#d6c6df' },
  { paper: '#edf7f7', band: '#164b54', accent: '#e0a93b', line: '#bad7d8' },
  { paper: '#fff4ef', band: '#5c1f32', accent: '#d45a43', line: '#e3c2b9' },
  { paper: '#f5f6ed', band: '#31513b', accent: '#c7a542', line: '#cfd5b9' },
];

function cardVisual({ label, eyebrow, note, themeIndex = 0, alt = '' }) {
  const theme = CARD_THEMES[themeIndex % CARD_THEMES.length];
  const lines = wrapText(label, 20, 3);
  const lineHeight = lines.length > 2 ? 82 : 96;
  const firstY = lines.length > 2 ? 244 : 270;
  const labelLines = lines
    .map((line, index) => (
      `<text x="78" y="${firstY + (index * lineHeight)}" fill="#18130d" font-family="Georgia, Times New Roman, serif" font-size="76" font-weight="400">${escapeSvg(line)}</text>`
    ))
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
<rect width="1200" height="675" fill="${theme.paper}"/>
<rect x="34" y="34" width="1132" height="607" fill="none" stroke="${theme.line}" stroke-width="3"/>
<rect x="34" y="34" width="1132" height="98" fill="${theme.band}"/>
<circle cx="1010" cy="292" r="134" fill="${theme.accent}" opacity="0.18"/>
<circle cx="1078" cy="424" r="74" fill="${theme.accent}" opacity="0.12"/>
<text x="78" y="96" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="31" font-weight="800">${escapeSvg(eyebrow)}</text>
${labelLines}
<text x="80" y="570" fill="#6e6251" font-family="Inter, Arial, sans-serif" font-size="29" font-weight="700">${escapeSvg(note)}</text>
<text x="864" y="588" fill="${theme.band}" font-family="Inter, Arial, sans-serif" font-size="36" font-weight="900">MealPrep</text>
</svg>`;

  return asset(`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`, alt);
}

export const SUPERMARKET_CARD_VISUALS = {
  any: cardVisual({
    label: 'Generic UK supermarket',
    eyebrow: 'Average UK shop',
    note: 'Flexible basket planning',
    themeIndex: 0,
    alt: 'Generic UK supermarket meal plan card',
  }),
  aldi: cardVisual({
    label: 'Aldi',
    eyebrow: 'Budget staples',
    note: 'Lower-cost weekly prep',
    themeIndex: 1,
    alt: 'Aldi meal plan card',
  }),
  lidl: cardVisual({
    label: 'Lidl',
    eyebrow: 'Value weekly shop',
    note: 'Simple familiar staples',
    themeIndex: 2,
    alt: 'Lidl meal plan card',
  }),
  tesco: cardVisual({
    label: 'Tesco',
    eyebrow: 'Flexible range',
    note: 'Broad swaps and staples',
    themeIndex: 3,
    alt: 'Tesco meal plan card',
  }),
  asda: cardVisual({
    label: 'Asda',
    eyebrow: 'Family staples',
    note: 'Practical weekly baskets',
    themeIndex: 4,
    alt: 'Asda meal plan card',
  }),
  sainsburys: cardVisual({
    label: "Sainsbury's",
    eyebrow: 'Own-brand choice',
    note: 'Premium and everyday options',
    themeIndex: 5,
    alt: "Sainsbury's meal plan card",
  }),
  morrisons: cardVisual({
    label: 'Morrisons',
    eyebrow: 'Fresh weekly meals',
    note: 'Classic UK meal prep',
    themeIndex: 6,
    alt: 'Morrisons meal plan card',
  }),
  iceland: cardVisual({
    label: 'Iceland',
    eyebrow: 'Freezer friendly',
    note: 'Low-effort batch planning',
    themeIndex: 7,
    alt: 'Iceland meal plan card',
  }),
  waitrose: cardVisual({
    label: 'Waitrose',
    eyebrow: 'Premium produce',
    note: 'Quality-focused weekly prep',
    themeIndex: 8,
    alt: 'Waitrose meal plan card',
  }),
  ocado: cardVisual({
    label: 'Ocado',
    eyebrow: 'Online grocery',
    note: 'Delivery-led meal planning',
    themeIndex: 9,
    alt: 'Ocado meal plan card',
  }),
  'marks-spencer': cardVisual({
    label: 'M&S',
    eyebrow: 'Premium convenience',
    note: 'Prepared and fresh options',
    themeIndex: 10,
    alt: 'M&S meal plan card',
  }),
  coop: cardVisual({
    label: 'Co-op',
    eyebrow: 'Local convenience',
    note: 'Simple top-up shops',
    themeIndex: 11,
    alt: 'Co-op meal plan card',
  }),
};

export const SITE_VISUALS = {
  home: visual(
    'weekly-prep.webp',
    'Prepared weekly meals, supermarket ingredients and a meal planning list on a kitchen counter'
  ),
  browse: visual(
    'supermarket-shop.webp',
    'A weekly supermarket shop arranged with a blank shopping list for meal planning'
  ),
  tools: visual(
    'tools-calculator.webp',
    'Meal prep ingredients beside a kitchen scale, notebook and calculator'
  ),
  supermarket: visual(
    'supermarket-shop.webp',
    'UK supermarket staples arranged for a weekly meal plan'
  ),
  printable: visual(
    'printable-plan.webp',
    'A printable weekly meal plan and shopping list beside prepared meals'
  ),
};

export const PLAN_CATEGORY_VISUALS = {
  default: SITE_VISUALS.home,
  lowCalorie: visual(
    'low-calorie.webp',
    'Balanced lower calorie meal prep containers with vegetables and simple supermarket ingredients'
  ),
  highProtein: visual(
    'high-protein.webp',
    'High protein meal prep containers with eggs, yogurt, fish, lean protein and vegetables'
  ),
  muscleGain: visual(
    'muscle-gain.webp',
    'Higher calorie meal prep containers with rice, pasta, oats, nuts and protein foods'
  ),
  budget: visual(
    'budget-shop.webp',
    'Budget meal prep staples including oats, rice, pasta, eggs, tins and simple containers'
  ),
  plantBased: visual(
    'plant-based.webp',
    'Plant-based meal prep containers with tofu, chickpeas, lentils, grains and vegetables'
  ),
  workLunch: visual(
    'work-lunch.webp',
    'Work lunch meal prep containers packed with snacks and weekday lunch ingredients'
  ),
  batchCooking: visual(
    'batch-cooking.webp',
    'Batch cooked food being portioned into meal prep containers on a kitchen counter'
  ),
  shoppingList: SITE_VISUALS.supermarket,
  printable: SITE_VISUALS.printable,
  tools: SITE_VISUALS.tools,
};

export function choosePlanVisual(plan = {}) {
  const goal = normalise(plan.goal || plan.slug || plan.title || '');
  const diet = normalise(plan.dietType || '');
  const effort = normalise(plan.effort || plan.effortLabel || '');
  const budget = normalise(plan.budget || plan.priceEstimate || '');
  const calories = Number(plan.calories || 0);

  if (diet.includes('vegan') || diet.includes('vegetarian') || goal.includes('vegan') || goal.includes('vegetarian')) {
    return PLAN_CATEGORY_VISUALS.plantBased;
  }

  if (
    goal.includes('budget') ||
    goal.includes('cheap') ||
    goal.includes('student')
  ) {
    return PLAN_CATEGORY_VISUALS.budget;
  }

  if (
    goal.includes('muscle') ||
    goal.includes('bodybuilding') ||
    goal.includes('endurance') ||
    goal.includes('gym') ||
    calories >= 2500
  ) {
    return PLAN_CATEGORY_VISUALS.muscleGain;
  }

  if (
    goal.includes('protein') ||
    goal.includes('recomp') ||
    goal.includes('cutting') ||
    diet.includes('pescatarian')
  ) {
    return PLAN_CATEGORY_VISUALS.highProtein;
  }

  if (goal.includes('busy') || goal.includes('work') || goal.includes('low-effort') || effort.includes('minimal') || effort.includes('low')) {
    return PLAN_CATEGORY_VISUALS.workLunch;
  }

  if (goal.includes('loss') || goal.includes('low-cal') || calories <= 1600) {
    return PLAN_CATEGORY_VISUALS.lowCalorie;
  }

  if (effort.includes('batch')) {
    return PLAN_CATEGORY_VISUALS.batchCooking;
  }

  if (budget.includes('very-cheap')) {
    return PLAN_CATEGORY_VISUALS.budget;
  }

  return PLAN_CATEGORY_VISUALS.default;
}

export function chooseSupermarketVisual(supermarket) {
  return SUPERMARKET_CARD_VISUALS[supermarket] || SITE_VISUALS.supermarket;
}

export function chooseBlogCardVisual(slug = '', title = '') {
  const label = title || titleFromSlug(slug);
  const topic = chooseBlogTopic(slug);
  return cardVisual({
    label,
    eyebrow: topic,
    note: 'UK meal prep guide',
    themeIndex: hashText(slug || label),
    alt: `${label} guide`,
  });
}

export function chooseNavigationCardVisual({ label, eyebrow = 'Meal plan', note = 'MealPrep.org.uk', seed = '' }) {
  return cardVisual({
    label,
    eyebrow,
    note,
    themeIndex: hashText(seed || label),
    alt: `${label} card`,
  });
}

export function chooseHubVisual(hub = {}) {
  const text = normalise([
    hub.slug,
    hub.h1,
    hub.title,
    hub.kicker,
    ...(hub.stats || []),
    ...(hub.match?.goals || []),
    ...(hub.match?.diets || []),
    ...(hub.match?.supermarkets || []),
  ].filter(Boolean).join(' '));

  if (text.includes('printable')) return PLAN_CATEGORY_VISUALS.printable;
  if (text.includes('shopping-list') || text.includes('shopping list')) return PLAN_CATEGORY_VISUALS.shoppingList;
  if (includesAny(text, ['aldi', 'lidl', 'tesco', 'asda', 'sainsbury', 'morrisons', 'iceland', 'waitrose', 'ocado', 'marks-spencer', 'm&s', 'coop', 'co-op', 'supermarket'])) {
    return PLAN_CATEGORY_VISUALS.shoppingList;
  }
  if (includesAny(text, ['vegan', 'vegetarian', 'plant'])) return PLAN_CATEGORY_VISUALS.plantBased;
  if (includesAny(text, ['budget', 'cheap', 'student'])) return PLAN_CATEGORY_VISUALS.budget;
  if (includesAny(text, ['batch', 'sunday'])) return PLAN_CATEGORY_VISUALS.batchCooking;
  if (includesAny(text, ['work', 'lunch', 'busy'])) return PLAN_CATEGORY_VISUALS.workLunch;
  if (includesAny(text, ['muscle', 'endurance', '3000', '3500', '2500'])) return PLAN_CATEGORY_VISUALS.muscleGain;
  if (includesAny(text, ['protein', 'cutting', 'pescatarian'])) return PLAN_CATEGORY_VISUALS.highProtein;
  if (includesAny(text, ['weight', 'loss', 'low-calorie', '1200', '1400', '1500', '1600', '1800'])) {
    return PLAN_CATEGORY_VISUALS.lowCalorie;
  }

  return PLAN_CATEGORY_VISUALS.default;
}

export function chooseComboVisual(page = {}) {
  return chooseHubVisual({
    ...page,
    stats: [
      ...(page.supportingLinks || []).map(link => link.label),
      page.quickAnswer,
      page.shoppingFocus,
    ].filter(Boolean),
  });
}

export function chooseChooserVisual({ mode, choice, goalChoice } = {}) {
  if (mode === 'supermarket') return PLAN_CATEGORY_VISUALS.shoppingList;
  if (mode === 'diet') {
    return choosePlanVisual({
      goal: choice?.defaultGoal,
      dietType: choice?.dietType,
      calories: choice?.defaultCalories,
    });
  }
  if (mode === 'calories') {
    return choosePlanVisual({
      goal: choice?.defaultGoal,
      calories: choice?.calories,
    });
  }
  return choosePlanVisual({
    goal: goalChoice?.value,
    calories: goalChoice?.defaultCalories,
  });
}

export function chooseBlogVisual(slug = '') {
  const text = normalise(slug);

  if (includesAny(text, ['delivery', 'hellofresh', 'gousto', 'prepared-meals', 'recipe-box'])) return PLAN_CATEGORY_VISUALS.workLunch;
  if (includesAny(text, ['container', 'box', 'tub', 'lunch-bag', 'lid'])) return PLAN_CATEGORY_VISUALS.batchCooking;
  if (includesAny(text, ['vegan', 'vegetarian', 'plant', 'pescatarian'])) return PLAN_CATEGORY_VISUALS.plantBased;
  if (includesAny(text, ['protein', 'fibre', 'snack', 'breakfast', 'powder'])) return PLAN_CATEGORY_VISUALS.highProtein;
  if (includesAny(text, ['supermarket', 'aldi', 'lidl', 'tesco', 'asda', 'sainsbury', 'morrisons', 'iceland', 'waitrose', 'ocado', 'marks-spencer', 'm&s', 'coop', 'co-op', 'shopping'])) {
    return PLAN_CATEGORY_VISUALS.shoppingList;
  }
  if (includesAny(text, ['batch', 'sunday', 'freezer', 'work-lunch', 'microwave', 'one-pan'])) {
    return PLAN_CATEGORY_VISUALS.batchCooking;
  }
  if (includesAny(text, ['3000', '3500', 'muscle', 'endurance', 'running'])) return PLAN_CATEGORY_VISUALS.muscleGain;
  if (includesAny(text, ['budget', 'cheap', 'student', 'family'])) return PLAN_CATEGORY_VISUALS.budget;
  if (includesAny(text, ['calorie', 'deficit', 'weight', 'belly-fat', 'cutting', 'low-calorie'])) {
    return PLAN_CATEGORY_VISUALS.lowCalorie;
  }

  return PLAN_CATEGORY_VISUALS.default;
}

function normalise(value) {
  return String(value || '').toLowerCase();
}

function includesAny(text, needles) {
  return needles.some(needle => text.includes(needle));
}

function chooseBlogTopic(slug = '') {
  const text = normalise(slug);
  if (includesAny(text, ['delivery', 'hellofresh', 'gousto', 'prepared-meals', 'recipe-box'])) return 'Delivery guide';
  if (includesAny(text, ['container', 'box', 'tub', 'lid'])) return 'Meal prep kit';
  if (includesAny(text, ['protein', 'snack', 'breakfast', 'fibre'])) return 'Protein planning';
  if (includesAny(text, ['supermarket', 'aldi', 'lidl', 'tesco', 'asda', 'sainsbury', 'morrisons', 'iceland', 'waitrose', 'ocado', 'marks-spencer', 'm&s', 'coop', 'co-op'])) return 'Supermarket guide';
  if (includesAny(text, ['vegan', 'vegetarian', 'plant', 'pescatarian'])) return 'Diet type guide';
  if (includesAny(text, ['batch', 'freezer', 'work-lunch', 'one-pan'])) return 'Batch cooking';
  if (includesAny(text, ['3000', '3500', 'muscle', 'endurance', 'running'])) return 'Training week';
  if (includesAny(text, ['budget', 'cheap', 'student', 'family'])) return 'Budget planning';
  return 'Calorie planning';
}

function titleFromSlug(slug = '') {
  return String(slug || 'Meal prep guide')
    .split('-')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function wrapText(value, maxChars, maxLines) {
  const words = String(value || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  if (lines.length <= maxLines) return lines;

  const kept = lines.slice(0, maxLines);
  kept[maxLines - 1] = `${kept[maxLines - 1].replace(/\s+\S+$/, '')}...`;
  return kept;
}

function escapeSvg(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function hashText(value) {
  return String(value || '').split('').reduce((total, char) => (
    total + char.charCodeAt(0)
  ), 0);
}
