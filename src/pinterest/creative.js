// Pinterest creatives: 1000x1500 (2:3) vertical images, drawn as SVG and
// rasterised at build time by scripts/generate-pinterest-assets.js.
//
// This extends the approach already used in src/data/visualAssets.js - hand
// written SVG with a small set of themes - rather than introducing a design
// tool or a runtime image service.
//
// The designs follow what does well on Pinterest (see docs/pinterest.md):
// real food photography rather than text-only graphics, a short bold
// headline, numbers where the page has them, a two-word call to action with
// an arrow, and branding kept small and away from the bottom-right corner,
// where Pinterest draws its own buttons. There are three templates:
//
//   photo      a page's first Pin: a food photo matched to its topic
//   checklist  a page's second Pin: the page's intro and facts, text-led, for
//              contrast in a feed of photos
//   product    the 6-week PDF plans: photo, price tag and what is included
import { PIN_IMAGE_HEIGHT, PIN_IMAGE_WIDTH } from './config.js';
import { leadSentences, pinHeadline } from './metadata.js';


const W = PIN_IMAGE_WIDTH;
const H = PIN_IMAGE_HEIGHT;

// Pinterest crops a little off the top and bottom in some surfaces, so nothing
// that has to be read sits inside these margins.
const SAFE_TOP = 70;
const GUTTER = 80;
const CONTENT_WIDTH = W - GUTTER * 2;

// The site palette: the header green from index.html's theme-color, the deep
// green and cream already used by the card visuals, and a warm accent that
// clears 4.5:1 against both greens.
const PALETTE = Object.freeze({
  deep: '#123f33',
  brand: '#2f855a',
  paper: '#f8f3ea',
  ink: '#1c2b25',
  muted: '#55655c',
  accent: '#f2b544',
  rule: '#d8c8ae',
  onDeep: '#ffffff',
});

export const TEMPLATES = Object.freeze(['photo', 'checklist', 'product']);

/**
 * Which template a Pin gets. Deterministic, so the same Pin always produces
 * the same creative.
 */
export function templateFor(entry, { variant = 1 } = {}) {
  if (entry.pins?.length) return 'product';
  return variant > 1 ? 'checklist' : 'photo';
}

// Food photos checked in at assets/pinterest/photos/ (JPEG copies of the
// site's own category photos). A page gets one that matches what it is about;
// the first matching rule wins.
export const PHOTOS = Object.freeze([
  'batch-cooking', 'budget-shop', 'high-protein', 'low-calorie', 'muscle-gain',
  'plant-based', 'printable-plan', 'supermarket-shop', 'weekly-prep', 'work-lunch',
]);

const PHOTO_RULES = Object.freeze([
  [/vegan|vegetarian|plant|pescatarian|meat-free/, ['plant-based']],
  [/lunch|work|office|shift|desk/, ['work-lunch']],
  [/shopping-list|printable|template|checklist/, ['printable-plan', 'supermarket-shop']],
  [/protein|muscle|bodybuilding|gym|bulk|post-workout/, ['muscle-gain', 'high-protein']],
  [/calorie|weight-loss|lose-weight|cutting|deficit|low-cal|belly|fibre/, ['low-calorie', 'weekly-prep']],
  [/budget|cheap|student|cost|price|saving/, ['budget-shop', 'batch-cooking']],
  [/batch|freez|slow-cooker|air-fryer|rice|chicken|soup|oats|recipe/, ['batch-cooking', 'weekly-prep']],
]);

// A small stable hash, so choices vary between pages but never between builds.
function hash(value) {
  let result = 0;
  for (const char of String(value)) result = (result * 31 + char.charCodeAt(0)) >>> 0;
  return result;
}

/**
 * The photo for a page's Pin. Rules match on the page's path and topic; a
 * named supermarket falls back to the shopping photo and anything else to the
 * weekly prep spread.
 */
export function photoFor(entry, { variant = 1 } = {}) {
  const subject = `${entry.path || ''} ${entry.topic || ''} ${(entry.clusters || []).join(' ')}`.toLowerCase();
  const rule = PHOTO_RULES.find(([pattern]) => pattern.test(subject));
  const options = rule ? rule[1] : entry.supermarketLabel ? ['supermarket-shop', 'weekly-prep'] : ['weekly-prep', 'batch-cooking'];
  return options[(hash(entry.id || entry.path) + variant - 1) % options.length];
}

function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// DM Sans advance widths average close to these fractions of the font size.
// Good enough to wrap reliably without embedding a metrics table.
const AVERAGE_ADVANCE = { 400: 0.52, 700: 0.55 };

function wrapToWidth(value, { fontSize, weight = 700, maxWidth = CONTENT_WIDTH, maxLines = 3 }) {
  const perChar = fontSize * (AVERAGE_ADVANCE[weight] || 0.55);
  const maxChars = Math.max(8, Math.floor(maxWidth / perChar));
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
  kept[maxLines - 1] = `${kept[maxLines - 1].replace(/\s+\S+$/, '').replace(/[\s,;:.!?&–—-]+$/, '')}…`;
  return kept;
}

function text(content, { x, y, size, weight = 400, fill = PALETTE.ink, spacing = 0, anchor = 'start' }) {
  const letterSpacing = spacing ? ` letter-spacing="${spacing}"` : '';
  const textAnchor = anchor === 'start' ? '' : ` text-anchor="${anchor}"`;
  return `<text x="${x}" y="${y}" fill="${fill}" font-family="DM Sans" font-size="${size}" font-weight="${weight}"${letterSpacing}${textAnchor}>${escapeXml(content)}</text>`;
}

function textBlock(lines, { x, y, size, lineHeight, weight = 700, fill = PALETTE.ink }) {
  return lines
    .map((line, index) => text(line, { x, y: y + index * lineHeight, size, weight, fill }))
    .join('');
}

/**
 * Copy for a creative, assembled from the page's own metadata.
 *
 * `eyebrow` names the proposition, `headline` is the page's heading and the
 * bullets are facts the page itself states. Nothing here is written for the
 * Pin - if a page has no benefit to show, the creative shows fewer bullets
 * rather than a manufactured one.
 */
export function creativeCopy(entry, { calorieIsHero = false } = {}) {
  const eyebrow = entry.supermarketLabel
    ? `${entry.supermarketLabel} meal plans`.toUpperCase()
    : String(entry.kicker || 'UK meal prep').toUpperCase();

  const facts = [];
  // When the template already prints the calorie figure at 210px, repeating it
  // as a bullet - and repeating any stat label that contains it - says the same
  // number three times.
  if (entry.calorieTarget && !calorieIsHero) {
    facts.push(`${entry.calorieTarget.toLocaleString('en-GB')} kcal a day`);
  }

  for (const benefit of entry.benefits || []) {
    const clean = String(benefit || '').replace(/\s+/g, ' ').trim();
    if (!clean || clean === entry.supermarketLabel) continue;
    // "1,500 kcal focus" next to "1,500 kcal a day" says the same thing twice.
    if (entry.calorieTarget && mentionsNumber(clean, entry.calorieTarget)) continue;
    if (facts.some(fact => fact.toLowerCase() === clean.toLowerCase())) continue;
    facts.push(clean);
  }

  if (facts.length < 3) {
    const freshness = reviewMonth(entry.modified || entry.published);
    if (freshness) facts.push(`Updated ${freshness}`);
  }
  if (facts.length < 3 && entry.kind === 'guide') facts.push('Free UK guide');
  if (!facts.length) facts.push('Free UK meal plans');

  return {
    eyebrow,
    headline: String(entry.title || '').replace(/\s*[|\u2013\u2014-]\s*MealPrep\.org\.uk\s*$/i, ''),
    facts: facts.slice(0, 3),
  };
}

// True when `value` contains `number`, written with or without a thousands
// separator.
export function mentionsNumber(value, number) {
  return String(value).replace(/(\d),(\d{3})/g, '$1$2').includes(String(number));
}

// "Updated June 2026", from the page's own published/modified date. Returns ''
// when the page carries no date rather than inventing one.
function reviewMonth(value) {
  const date = new Date(String(value || ''));
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

// A tick in a filled circle, drawn as a path so it does not depend on the
// font having a check-mark glyph.
function tick(cx, cy, { fill = PALETTE.brand, stroke = PALETTE.onDeep } = {}) {
  return [
    `<circle cx="${cx}" cy="${cy}" r="24" fill="${fill}"/>`,
    `<path d="M ${cx - 11} ${cy + 1} L ${cx - 3} ${cy + 9} L ${cx + 12} ${cy - 8}" fill="none" stroke="${stroke}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`,
  ].join('');
}

// A short call to action with an arrow, in a pill. Placed bottom-left: the
// bottom-right corner is where Pinterest draws its own buttons.
function callToAction(label, { x = GUTTER, y, fill, color }) {
  const width = Math.round(label.length * 32 * 0.56) + 120;
  const arrowX = x + width - 58;
  const midY = y + 40;
  return [
    `<rect x="${x}" y="${y}" width="${width}" height="80" rx="40" fill="${fill}"/>`,
    text(label, { x: x + 36, y: y + 51, size: 32, weight: 700, fill: color }),
    `<path d="M ${arrowX} ${midY} L ${arrowX + 28} ${midY} M ${arrowX + 16} ${midY - 12} L ${arrowX + 28} ${midY} L ${arrowX + 16} ${midY + 12}" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`,
  ].join('');
}

// Two words, matched to what the page is.
export function callToActionLabel(entry) {
  if (entry.kind === 'product') return 'Get the plan';
  if (entry.kind === 'guide') return 'Read the guide';
  return 'See the plans';
}

// The brand, small, at the top where the save button cannot cover it.
function brandMark({ fill, y = SAFE_TOP + 12 }) {
  return text('MealPrep.org.uk', { x: GUTTER, y, size: 28, weight: 700, fill, spacing: 1 });
}

// The second Pin for a page. The headline is the page's search title, the body
// is the first sentence of its own intro, and the facts are ticked off below.
// Everything on it is still the page's own words.
function checklistTemplate(entry) {
  const { eyebrow, facts } = creativeCopy(entry);
  const headline = pinHeadline(entry, { variant: 2 });
  const intro = leadSentences(entry.proposition || entry.description, 170);
  const bandHeight = 620;
  const lines = wrapToWidth(headline, { fontSize: 70, weight: 700, maxLines: 4 });
  const headlineY = Math.round(SAFE_TOP + 250 + ((4 - lines.length) * 80) / 2);
  const introLines = wrapToWidth(intro, { fontSize: 42, weight: 400, maxWidth: CONTENT_WIDTH - 40, maxLines: 3 });
  const rowGap = 92;
  const firstRowY = 1190 - Math.max(0, facts.length - 1) * rowGap;

  const rows = facts.slice(0, 3).map((fact, index) => {
    const y = firstRowY + index * rowGap;
    const [line] = wrapToWidth(fact, { fontSize: 40, weight: 700, maxWidth: CONTENT_WIDTH - 80, maxLines: 1 });
    return `${tick(GUTTER + 24, y - 14)}${text(line, { x: GUTTER + 76, y, size: 40, weight: 700, fill: PALETTE.ink })}`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img">
<rect width="${W}" height="${H}" fill="${PALETTE.paper}"/>
<rect width="${W}" height="${bandHeight}" fill="${PALETTE.brand}"/>
${brandMark({ fill: PALETTE.onDeep })}
${text(eyebrow, { x: GUTTER, y: SAFE_TOP + 120, size: 34, weight: 700, fill: PALETTE.accent, spacing: 4 })}
<rect x="${GUTTER}" y="${SAFE_TOP + 150}" width="96" height="8" rx="4" fill="${PALETTE.accent}"/>
${textBlock(lines, { x: GUTTER, y: headlineY, size: 70, lineHeight: 80, weight: 700, fill: PALETTE.onDeep })}
<rect x="${GUTTER}" y="${bandHeight + 70}" width="8" height="${introLines.length * 58 - 10}" rx="4" fill="${PALETTE.accent}"/>
${textBlock(introLines, { x: GUTTER + 40, y: bandHeight + 112, size: 42, lineHeight: 58, weight: 400, fill: PALETTE.muted })}
${rows}
${callToAction(callToActionLabel(entry), { y: 1290, fill: PALETTE.deep, color: PALETTE.onDeep })}
</svg>`;
}

// Panel colours for photo Pins. Pages and product Pins rotate through them so
// a board is not one colour, and each accent clears 4.5:1 against its panel.
const PHOTO_THEMES = Object.freeze([
  { panel: '#123f33', accent: '#f2b544' },
  { panel: '#5c1f32', accent: '#f4b9a8' },
  { panel: '#1f3552', accent: '#f2c96b' },
  { panel: '#4a3826', accent: '#f2b544' },
]);

// The shortest the photo gets; it grows when the text below is short.
const PHOTO_HEIGHT = 900;
// The source photos are 16:9, so a 1000x900 window shows part of each one.
// Which part varies by Pin, so a photo used twice is not the same picture.
const CROPS = ['xMidYMid', 'xMinYMid', 'xMaxYMid'];

/**
 * The shared photo layout: a food photo across the top with a badge and an
 * optional tag (price, calories) over it, then the headline, a subheading, up
 * to three ticked facts and a call to action on a coloured panel. The photo
 * fades into the panel so the two read as one image.
 */
function photoLayout({ photo, crop, theme, badge, tag, headline, sub, facts, cta }) {
  // Two lines at full size; a longer headline drops a size rather than
  // climbing up into the photo.
  const fits = wrapToWidth(headline, { fontSize: 72, weight: 700, maxLines: 9 }).length <= 2;
  const headlineSize = fits ? 72 : 60;
  const headlineLeading = fits ? 82 : 70;
  const lines = wrapToWidth(headline, { fontSize: headlineSize, weight: 700, maxLines: 3 });
  // Built from the bottom up - call to action, facts, subheading, headline -
  // so a page with fewer facts gives the photo more room rather than leaving
  // a gap at the foot of the Pin.
  const shownFacts = facts.filter(fact => fact.toLowerCase() !== String(sub || '').toLowerCase()).slice(0, 3);
  const factGap = 62;
  const ctaY = 1330;
  const firstFactY = ctaY - 56 - Math.max(0, shownFacts.length - 1) * factGap;
  const lastHeadlineY = (shownFacts.length ? firstFactY - 86 : ctaY - 60) - (sub ? 66 : 0);
  const firstHeadlineY = lastHeadlineY - (lines.length - 1) * headlineLeading;
  // The photo runs down to just under the headline, however tall the text is.
  const photoHeight = Math.max(PHOTO_HEIGHT, firstHeadlineY - 20);

  const rows = shownFacts.map((fact, index) => {
    const y = firstFactY + index * factGap;
    const [line] = wrapToWidth(fact, { fontSize: 36, weight: 400, maxWidth: CONTENT_WIDTH - 70, maxLines: 1 });
    return `${tick(GUTTER + 20, y - 12, { fill: theme.accent, stroke: theme.panel })}${text(line, { x: GUTTER + 64, y, size: 36, weight: 400, fill: PALETTE.onDeep })}`;
  }).join('');

  const tagWidth = tag ? Math.max(210, Math.round(tag.big.length * 56 * 0.58) + 60) : 0;
  const badgeText = wrapToWidth(badge, { fontSize: 28, weight: 700, maxWidth: CONTENT_WIDTH - tagWidth - 110, maxLines: 1 })[0] || '';
  const badgeWidth = Math.round(badgeText.length * 28 * 0.62 + badgeText.length * 3) + 64;

  const tagMarkup = tag ? [
    `<rect x="${W - GUTTER - tagWidth}" y="${SAFE_TOP + 40}" width="${tagWidth}" height="130" rx="65" fill="${PALETTE.paper}"/>`,
    text(tag.big, { x: W - GUTTER - tagWidth / 2, y: SAFE_TOP + 118, size: 56, weight: 700, fill: theme.panel, anchor: 'middle' }),
    text(tag.small, { x: W - GUTTER - tagWidth / 2, y: SAFE_TOP + 152, size: 22, weight: 700, fill: theme.panel, spacing: 3, anchor: 'middle' }),
  ].join('') : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img">
<defs>
<linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="${theme.panel}" stop-opacity="0"/>
<stop offset="1" stop-color="${theme.panel}" stop-opacity="1"/>
</linearGradient>
<linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#000000" stop-opacity="0.45"/>
<stop offset="1" stop-color="#000000" stop-opacity="0"/>
</linearGradient>
</defs>
<rect width="${W}" height="${H}" fill="${theme.panel}"/>
<image href="${escapeXml(photo)}" x="0" y="0" width="${W}" height="${photoHeight}" preserveAspectRatio="${crop} slice"/>
<rect width="${W}" height="280" fill="url(#shade)"/>
<rect y="${photoHeight - 420}" width="${W}" height="421" fill="url(#fade)"/>
${brandMark({ fill: PALETTE.onDeep })}
<rect x="${GUTTER}" y="${SAFE_TOP + 44}" width="${badgeWidth}" height="66" rx="33" fill="${theme.accent}"/>
${text(badgeText, { x: GUTTER + badgeWidth / 2, y: SAFE_TOP + 88, size: 28, weight: 700, fill: theme.panel, spacing: 3, anchor: 'middle' })}
${tagMarkup}
${textBlock(lines, { x: GUTTER, y: firstHeadlineY, size: headlineSize, lineHeight: headlineLeading, weight: 700, fill: PALETTE.onDeep })}
${sub ? text(wrapToWidth(sub, { fontSize: 36, weight: 700, maxLines: 1 })[0], { x: GUTTER, y: lastHeadlineY + 66, size: 36, weight: 700, fill: theme.accent }) : ''}
${rows}
${callToAction(cta, { y: ctaY, fill: theme.accent, color: theme.panel })}
</svg>`;
}

// A page's first Pin. Headline, facts and badge all come from the page; a
// page built to a calorie target shows it as the tag, since a number is what
// people scan for.
function photoTemplate(entry, { variant = 1, photoBase = '' } = {}) {
  const { eyebrow, headline, facts } = creativeCopy(entry, { calorieIsHero: Boolean(entry.calorieTarget) });
  const seed = hash(entry.id || entry.path);
  return photoLayout({
    photo: `${photoBase}${photoFor(entry, { variant })}.jpg`,
    crop: CROPS[seed % CROPS.length],
    theme: PHOTO_THEMES[seed % PHOTO_THEMES.length],
    badge: eyebrow,
    tag: entry.calorieTarget ? { big: entry.calorieTarget.toLocaleString('en-GB'), small: 'KCAL A DAY' } : null,
    headline,
    sub: entry.kind === 'guide' ? 'Free UK guide' : 'Free UK meal plans',
    facts,
    cta: callToActionLabel(entry),
  });
}

// A Pin for a paid product: the same layout with a "6-week PDF plan" badge
// and the price as the tag. Everything written on it comes from the product
// record, and it never says free.
function productTemplate(entry, { variant = 1, photoBase = '' } = {}) {
  const pin = entry.pins[variant - 1] || entry.pins[0];
  return photoLayout({
    photo: `${photoBase}${pin.photo}.jpg`,
    crop: CROPS[(variant - 1) % CROPS.length],
    theme: PHOTO_THEMES[(variant - 1) % PHOTO_THEMES.length],
    badge: '6-WEEK PDF PLAN',
    tag: entry.priceGBP ? { big: `£${Number(entry.priceGBP).toFixed(2)}`, small: 'INSTANT PDF' } : null,
    headline: pin.headline,
    sub: pin.sub,
    facts: pin.facts || [],
    cta: callToActionLabel(entry),
  });
}

const RENDERERS = {
  photo: photoTemplate,
  checklist: checklistTemplate,
  product: productTemplate,
};

/**
 * @param {object} entry
 * @param {object} options
 * @param {number} options.variant   - which of the page's Pins this is
 * @param {string} options.photoBase - prefix for photo files; the build
 *                                     passes the absolute photo folder
 */
export function buildPinSvg(entry, { variant = 1, photoBase = '' } = {}) {
  const template = templateFor(entry, { variant });
  return { template, svg: RENDERERS[template](entry, { variant, photoBase }) };
}
