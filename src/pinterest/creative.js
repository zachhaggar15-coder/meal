// Pinterest creatives: 1000x1500 (2:3) vertical images, drawn as SVG and
// rasterised to PNG at build time by scripts/generate-pinterest-assets.js.
//
// This extends the approach already used in src/data/visualAssets.js - hand
// written SVG with a small set of themes - rather than introducing a design
// tool or a runtime image service. There are four templates, not four hundred
// designs: a page's first Pin uses one of the first three, decided by the
// page's own data, and its second Pin always uses `checklist`, so the two
// look clearly different in a feed.

import { PIN_IMAGE_HEIGHT, PIN_IMAGE_WIDTH } from './config.js';
import { leadSentences, pinHeadline } from './metadata.js';

const W = PIN_IMAGE_WIDTH;
const H = PIN_IMAGE_HEIGHT;

// Pinterest crops a little off the top and bottom in some surfaces, so nothing
// that has to be read sits inside these margins.
const SAFE_TOP = 70;
const SAFE_BOTTOM = 70;
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

export const TEMPLATES = Object.freeze(['supermarket', 'target', 'guide', 'checklist', 'product']);

/**
 * Which template a Pin gets. Deterministic and derived from the page's own
 * metadata, so the same page always produces the same creative.
 */
export function templateFor(entry, { variant = 1 } = {}) {
  if (entry.pins?.length) return 'product';
  if (variant > 1) return 'checklist';
  if (entry.supermarketLabel) return 'supermarket';
  if (entry.calorieTarget) return 'target';
  return 'guide';
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

// A bullet is a short accent rule plus one line. Three at most: a Pin with a
// paragraph on it is unreadable on a phone and reads as spam.
const BULLET_GAP = 104;

function bulletList(items, { x, y, gap = BULLET_GAP, fill = PALETTE.ink, ruleFill = PALETTE.accent }) {
  return items
    .slice(0, 3)
    .map((item, index) => {
      const lineY = y + index * gap;
      const [line] = wrapToWidth(item, { fontSize: 40, weight: 400, maxWidth: CONTENT_WIDTH - 60, maxLines: 1 });
      return [
        `<rect x="${x}" y="${lineY - 26}" width="34" height="6" rx="3" fill="${ruleFill}"/>`,
        text(line, { x: x + 56, y: lineY, size: 40, weight: 400, fill }),
      ].join('');
    })
    .join('');
}

// Bullets are anchored to the bottom of the content area rather than hung off
// the headline. Hanging them left a third of the canvas empty on short titles.
function bulletStartY(count, bottomBaseline) {
  return bottomBaseline - Math.max(0, count - 1) * BULLET_GAP;
}

function wordmark({ fill = PALETTE.ink, ruleFill = PALETTE.rule }) {
  const baseline = H - SAFE_BOTTOM - 26;
  return [
    `<rect x="${GUTTER}" y="${baseline - 78}" width="${CONTENT_WIDTH}" height="3" fill="${ruleFill}"/>`,
    text('MealPrep.org.uk', { x: GUTTER, y: baseline, size: 44, weight: 700, fill }),
    text('Free UK meal plans', { x: W - GUTTER, y: baseline, size: 30, weight: 400, fill, anchor: 'end' }),
  ].join('');
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

function supermarketTemplate(entry) {
  const { eyebrow, headline, facts } = creativeCopy(entry);
  const bandHeight = 760;
  const lines = wrapToWidth(headline, { fontSize: 78, weight: 700, maxLines: 3 });
  // Optically centred between the eyebrow and the foot of the band, so a
  // one-line title does not float and a three-line one does not crowd.
  const headlineY = Math.round((SAFE_TOP + 240 + bandHeight - 90) / 2) - ((lines.length - 1) * 88) / 2;
  const firstBulletY = bulletStartY(facts.length, H - 300);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img">
<rect width="${W}" height="${H}" fill="${PALETTE.paper}"/>
<rect width="${W}" height="${bandHeight}" fill="${PALETTE.deep}"/>
<rect x="${GUTTER}" y="${SAFE_TOP + 60}" width="96" height="8" rx="4" fill="${PALETTE.accent}"/>
${text(eyebrow, { x: GUTTER, y: SAFE_TOP + 140, size: 34, weight: 700, fill: PALETTE.accent, spacing: 4 })}
${textBlock(lines, { x: GUTTER, y: headlineY, size: 78, lineHeight: 88, weight: 700, fill: PALETTE.onDeep })}
<rect x="${GUTTER}" y="${firstBulletY - 120}" width="140" height="6" rx="3" fill="${PALETTE.brand}"/>
${bulletList(facts, { x: GUTTER, y: firstBulletY })}
${wordmark({})}
</svg>`;
}

function targetTemplate(entry) {
  const { eyebrow, headline, facts } = creativeCopy(entry, { calorieIsHero: true });
  const figure = entry.calorieTarget
    ? entry.calorieTarget.toLocaleString('en-GB')
    : '7';
  const figureLabel = entry.calorieTarget ? 'kcal a day' : 'day plan';
  const lines = wrapToWidth(headline, { fontSize: 66, weight: 700, maxLines: 3 });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img">
<rect width="${W}" height="${H}" fill="${PALETTE.deep}"/>
<rect x="${GUTTER}" y="${SAFE_TOP + 40}" width="96" height="8" rx="4" fill="${PALETTE.accent}"/>
${text(eyebrow, { x: GUTTER, y: SAFE_TOP + 120, size: 34, weight: 700, fill: PALETTE.accent, spacing: 4 })}
${text(figure, { x: GUTTER, y: 520, size: 210, weight: 700, fill: PALETTE.onDeep })}
${text(figureLabel, { x: GUTTER, y: 596, size: 42, weight: 400, fill: PALETTE.accent })}
<rect x="${GUTTER}" y="666" width="${CONTENT_WIDTH}" height="3" fill="rgba(255,255,255,0.28)"/>
${textBlock(lines, { x: GUTTER, y: 772, size: 66, lineHeight: 80, weight: 700, fill: PALETTE.onDeep })}
${bulletList(facts, { x: GUTTER, y: bulletStartY(facts.length, H - 300), fill: PALETTE.paper })}
${wordmark({ fill: PALETTE.onDeep, ruleFill: 'rgba(255,255,255,0.3)' })}
</svg>`;
}

function guideTemplate(entry) {
  const { eyebrow, headline, facts } = creativeCopy(entry);
  const lines = wrapToWidth(headline, { fontSize: 76, weight: 700, maxLines: 4 });
  const firstBulletY = bulletStartY(facts.length, H - 340);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img">
<rect width="${W}" height="${H}" fill="${PALETTE.paper}"/>
<rect x="40" y="40" width="${W - 80}" height="${H - 80}" fill="none" stroke="${PALETTE.rule}" stroke-width="4"/>
<rect x="${GUTTER}" y="${SAFE_TOP + 60}" width="96" height="8" rx="4" fill="${PALETTE.brand}"/>
${text(eyebrow, { x: GUTTER, y: SAFE_TOP + 142, size: 32, weight: 700, fill: PALETTE.brand, spacing: 4 })}
${textBlock(lines, { x: GUTTER, y: 450, size: 76, lineHeight: 92, weight: 700, fill: PALETTE.ink })}
<rect x="${GUTTER}" y="${firstBulletY - 120}" width="140" height="6" rx="3" fill="${PALETTE.accent}"/>
${bulletList(facts, { x: GUTTER, y: firstBulletY, fill: PALETTE.muted })}
<rect y="${H - 200}" width="${W}" height="200" fill="${PALETTE.deep}"/>
${text('MealPrep.org.uk', { x: GUTTER, y: H - 96, size: 46, weight: 700, fill: PALETTE.onDeep })}
${text('Free UK meal plans', { x: W - GUTTER, y: H - 96, size: 30, weight: 400, fill: PALETTE.accent, anchor: 'end' })}
</svg>`;
}

// A tick in a filled circle, drawn as a path so it does not depend on the
// font having a check-mark glyph.
function tick(cx, cy, { fill = PALETTE.brand, stroke = PALETTE.onDeep } = {}) {
  return [
    `<circle cx="${cx}" cy="${cy}" r="24" fill="${fill}"/>`,
    `<path d="M ${cx - 11} ${cy + 1} L ${cx - 3} ${cy + 9} L ${cx + 12} ${cy - 8}" fill="none" stroke="${stroke}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`,
  ].join('');
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
  const headlineY = Math.round(SAFE_TOP + 240 + ((4 - lines.length) * 80) / 2);
  const introLines = wrapToWidth(intro, { fontSize: 42, weight: 400, maxWidth: CONTENT_WIDTH - 40, maxLines: 3 });
  const rowGap = 96;
  const firstRowY = H - 290 - Math.max(0, facts.length - 1) * rowGap;

  const rows = facts.slice(0, 3).map((fact, index) => {
    const y = firstRowY + index * rowGap;
    const [line] = wrapToWidth(fact, { fontSize: 40, weight: 700, maxWidth: CONTENT_WIDTH - 80, maxLines: 1 });
    return `${tick(GUTTER + 24, y - 14)}${text(line, { x: GUTTER + 76, y, size: 40, weight: 700, fill: PALETTE.ink })}`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img">
<rect width="${W}" height="${H}" fill="${PALETTE.paper}"/>
<rect width="${W}" height="${bandHeight}" fill="${PALETTE.brand}"/>
${text(eyebrow, { x: GUTTER, y: SAFE_TOP + 110, size: 34, weight: 700, fill: PALETTE.onDeep, spacing: 4 })}
<rect x="${GUTTER}" y="${SAFE_TOP + 140}" width="96" height="8" rx="4" fill="${PALETTE.accent}"/>
${textBlock(lines, { x: GUTTER, y: headlineY, size: 70, lineHeight: 80, weight: 700, fill: PALETTE.onDeep })}
<rect x="${GUTTER}" y="${bandHeight + 70}" width="8" height="${introLines.length * 58 - 10}" rx="4" fill="${PALETTE.accent}"/>
${textBlock(introLines, { x: GUTTER + 40, y: bandHeight + 112, size: 42, lineHeight: 58, weight: 400, fill: PALETTE.muted })}
${rows}
${wordmark({})}
</svg>`;
}

// Panel colours for product Pins, one per Pin, so the four Pins for a product
// do not look like the same advert four times. Each accent clears 4.5:1
// against its panel.
const PRODUCT_THEMES = Object.freeze([
  { panel: '#123f33', accent: '#f2b544' },
  { panel: '#5c1f32', accent: '#f4b9a8' },
  { panel: '#1f3552', accent: '#f2c96b' },
  { panel: '#4a3826', accent: '#f2b544' },
]);

const PHOTO_HEIGHT = 900;

// A Pin for a paid product: a food photo across the top, a "6-week PDF plan"
// badge and the price over it, and the hook, product name and what is in it on
// a coloured panel below. The photo fades into the panel so the two read as
// one image. Everything written on it comes from the product record.
function productTemplate(entry, { variant = 1, photoBase = '' } = {}) {
  const pin = entry.pins[variant - 1] || entry.pins[0];
  const theme = PRODUCT_THEMES[(variant - 1) % PRODUCT_THEMES.length];
  const photo = `${photoBase}${pin.photo}.jpg`;
  // Two lines at full size; a longer hook drops a size rather than climbing
  // up into the photo.
  const fits = wrapToWidth(pin.headline, { fontSize: 72, weight: 700, maxLines: 9 }).length <= 2;
  const headlineSize = fits ? 72 : 60;
  const headlineLeading = fits ? 82 : 70;
  const lines = wrapToWidth(pin.headline, { fontSize: headlineSize, weight: 700, maxLines: 3 });
  const lastHeadlineY = 1045;
  const firstHeadlineY = lastHeadlineY - (lines.length - 1) * headlineLeading;
  const facts = (pin.facts || []).slice(0, 3);
  const factGap = 66;
  const firstFactY = 1352 - (facts.length - 1) * factGap;
  const price = entry.priceGBP ? `£${Number(entry.priceGBP).toFixed(2)}` : '';

  const rows = facts.map((fact, index) => {
    const y = firstFactY + index * factGap;
    const [line] = wrapToWidth(fact, { fontSize: 36, weight: 400, maxWidth: CONTENT_WIDTH - 70, maxLines: 1 });
    return `${tick(GUTTER + 20, y - 12, { fill: theme.accent, stroke: theme.panel })}${text(line, { x: GUTTER + 64, y, size: 36, weight: 400, fill: PALETTE.onDeep })}`;
  }).join('');

  const priceTag = price ? [
    `<rect x="${W - GUTTER - 230}" y="${SAFE_TOP}" width="230" height="130" rx="65" fill="${PALETTE.paper}"/>`,
    text(price, { x: W - GUTTER - 115, y: SAFE_TOP + 78, size: 56, weight: 700, fill: theme.panel, anchor: 'middle' }),
    text('PDF', { x: W - GUTTER - 115, y: SAFE_TOP + 112, size: 24, weight: 700, fill: theme.panel, spacing: 3, anchor: 'middle' }),
  ].join('') : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img">
<defs>
<linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="${theme.panel}" stop-opacity="0"/>
<stop offset="1" stop-color="${theme.panel}" stop-opacity="1"/>
</linearGradient>
<linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#000000" stop-opacity="0.35"/>
<stop offset="1" stop-color="#000000" stop-opacity="0"/>
</linearGradient>
</defs>
<rect width="${W}" height="${H}" fill="${theme.panel}"/>
<image href="${escapeXml(photo)}" x="0" y="0" width="${W}" height="${PHOTO_HEIGHT}" preserveAspectRatio="xMidYMid slice"/>
<rect width="${W}" height="240" fill="url(#shade)"/>
<rect y="${PHOTO_HEIGHT - 380}" width="${W}" height="381" fill="url(#fade)"/>
<rect x="${GUTTER}" y="${SAFE_TOP + 28}" width="360" height="74" rx="37" fill="${theme.accent}"/>
${text('6-WEEK PDF PLAN', { x: GUTTER + 180, y: SAFE_TOP + 76, size: 30, weight: 700, fill: theme.panel, spacing: 3, anchor: 'middle' })}
${priceTag}
${textBlock(lines, { x: GUTTER, y: firstHeadlineY, size: headlineSize, lineHeight: headlineLeading, weight: 700, fill: PALETTE.onDeep })}
${text(pin.sub, { x: GUTTER, y: lastHeadlineY + 70, size: 36, weight: 700, fill: theme.accent })}
${rows}
${text('MealPrep.org.uk', { x: GUTTER, y: H - SAFE_BOTTOM + 8, size: 34, weight: 700, fill: PALETTE.onDeep })}
${text('Instant PDF download', { x: W - GUTTER, y: H - SAFE_BOTTOM + 8, size: 28, weight: 400, fill: theme.accent, anchor: 'end' })}
</svg>`;
}

const RENDERERS = {
  supermarket: supermarketTemplate,
  target: targetTemplate,
  guide: guideTemplate,
  checklist: checklistTemplate,
  product: productTemplate,
};

/**
 * @param {object} entry
 * @param {object} options
 * @param {number} options.variant   - which of the page's Pins this is
 * @param {string} options.photoBase - prefix for product photo files; the
 *                                     build passes the absolute photo folder
 */
export function buildPinSvg(entry, { variant = 1, photoBase = '' } = {}) {
  const template = templateFor(entry, { variant });
  return { template, svg: RENDERERS[template](entry, { variant, photoBase }) };
}
