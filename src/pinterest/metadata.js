// Pinterest-facing copy and links for an eligible page.
//
// Every string here is derived from what the page already says about itself.
// Nothing invents a claim: if a benefit is not in the page's own metadata, it
// does not appear on the Pin.

import { SITE_URL } from '../constants/site.js';
import {
  PINTEREST_IMAGE_PATH,
  PIN_IMAGE_HEIGHT,
  PIN_IMAGE_WIDTH,
  PINTEREST_UTM,
} from './config.js';

const TITLE_MAX = 64;
// Pinterest truncates descriptions around 500 characters. Leaving headroom
// keeps the last sentence intact rather than cut mid-word.
const DESCRIPTION_MAX = 460;

const BRAND_TAIL = /\s*[|–—-]\s*MealPrep\.org\.uk\s*$/i;

function collapse(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function truncateAtWord(value, max) {
  if (value.length <= max) return value;
  const clipped = value.slice(0, max - 1);
  const lastSpace = clipped.lastIndexOf(' ');
  const cut = lastSpace > max * 0.6 ? clipped.slice(0, lastSpace) : clipped;
  return `${cut.replace(/[\s,;:.!?&|–—-]+$/, '')}…`;
}

/**
 * Pin title: the page's own heading, without the brand tail Pinterest already
 * shows next to the Pin, and short enough not to be cut off in a grid.
 *
 * A second Pin for the same page uses the page's search title instead when it
 * says something different, so the two Pins are not word-for-word copies.
 */
export function pinTitle(entry, { variant = 1 } = {}) {
  return truncateAtWord(pinHeadline(entry, { variant }), TITLE_MAX);
}

/**
 * The same title at full length, for a creative that has room to wrap it.
 */
export function pinHeadline(entry, { variant = 1 } = {}) {
  const pin = entry.pins?.[variant - 1];
  if (pin) return collapse(pin.title);
  const heading = collapse(entry.title || entry.metaTitle).replace(BRAND_TAIL, '');
  const searchTitle = collapse(entry.metaTitle).replace(BRAND_TAIL, '');
  return variant > 1 && searchTitle && searchTitle.toLowerCase() !== heading.toLowerCase()
    ? searchTitle
    : heading;
}

// The first sentences of a longer passage, whole, up to about `max` characters.
export function leadSentences(value, max) {
  const text = collapse(value);
  const sentences = text.match(/[^.!?]+[.!?]+(?=\s|$)/g) || [text];
  let out = '';
  for (const sentence of sentences) {
    const next = collapse(`${out} ${sentence}`);
    if (out && next.length > max) break;
    out = next;
  }
  return truncateAtWord(out, max);
}

/**
 * Pin description: what the reader gets, in the page's own words, followed by
 * the concrete facts that make it different from the next Pin.
 */
export function pinDescription(entry, { variant = 1 } = {}) {
  // A product's Pins carry their own copy, written from the product record.
  // It is paid, so it never ends "Free on ...".
  const pin = entry.pins?.[variant - 1];
  if (pin) return truncateAtWord(collapse(`${pin.description} From MealPrep.org.uk.`), DESCRIPTION_MAX);

  // The meta description is the page's own one-sentence pitch, written to be
  // read out of context. That is exactly what a Pin needs, and it is already
  // reviewed by the site's metadata audit - so it leads, and the page's longer
  // intro is only a fallback. A second Pin leads with the intro instead, so it
  // reads as a different Pin rather than a repeat.
  const intro = leadSentences(entry.proposition, 300);
  const metaDescription = collapse(entry.description);
  const lead = sentenceCase(
    variant > 1 && intro && intro.toLowerCase() !== metaDescription.toLowerCase()
      ? intro
      : metaDescription || intro,
  );
  const facts = [];
  const seen = lead.toLowerCase();

  if (entry.calorieTarget && !seen.includes(String(entry.calorieTarget))) {
    facts.push(`${entry.calorieTarget.toLocaleString('en-GB')} kcal a day`);
  }
  for (const benefit of entry.benefits || []) {
    const clean = collapse(benefit);
    // A bare store name repeats the title and adds nothing.
    if (!clean || clean === entry.supermarketLabel) continue;
    if (seen.includes(clean.toLowerCase())) continue;
    // The calorie target is already stated; "1,500 kcal focus" would repeat it.
    if (entry.calorieTarget && clean.replace(/(\d),(\d{3})/g, '$1$2').includes(String(entry.calorieTarget))) continue;
    if (facts.some(fact => fact.toLowerCase() === clean.toLowerCase())) continue;
    facts.push(clean);
  }

  const body = [lead, ...facts.slice(0, 2).map(sentenceCase)].filter(Boolean).join(' ');
  return truncateAtWord(collapse(`${body} Free on MealPrep.org.uk.`), DESCRIPTION_MAX);
}

// Ends a fragment with a full stop so the description reads as sentences
// rather than as a run-on of stat labels.
function sentenceCase(value) {
  const text = collapse(value);
  if (!text) return '';
  return /[.!?\u2026]$/.test(text) ? text : `${text}.`;
}

/**
 * Campaign name. One per board, so GA4 splits Pinterest traffic by the board
 * that produced it with no further configuration.
 */
export function pinCampaign(entry) {
  return entry.board?.key || 'unassigned';
}

/**
 * The Pin's destination.
 *
 * The canonical URL with Pinterest UTMs appended. Any query the page already
 * carries is preserved and the UTM keys overwrite same-named ones, so a stray
 * utm_source in source data cannot produce two competing attributions. The
 * page's own canonical tag keeps pointing at the clean URL - SEO.jsx strips
 * the query when it builds `rel=canonical` - so this cannot create duplicate
 * content.
 */
export function pinDestinationUrl(entry, { origin = SITE_URL, variant = 1 } = {}) {
  const url = new URL(entry.path, origin);
  url.searchParams.set('utm_source', PINTEREST_UTM.source);
  url.searchParams.set('utm_medium', PINTEREST_UTM.medium);
  url.searchParams.set('utm_campaign', pinCampaign(entry));
  // Later Pins for the same page say which one they are, so GA4 can compare
  // the designs. The first Pin's link is left exactly as launched.
  if (variant > 1) url.searchParams.set('utm_content', `pin-${variant}`);
  else url.searchParams.delete('utm_content');
  return url.toString();
}

/**
 * The clean, canonical URL for the same page.
 */
export function pinCanonicalUrl(entry, { origin = SITE_URL } = {}) {
  return new URL(entry.path, origin).toString();
}

/**
 * The RSS GUID: the canonical URL, so a Pin's identity never changes when the
 * UTM convention does. A later Pin for the same page adds `#pin-N`, which
 * Pinterest sees as a new item while the page itself stays the same.
 */
export function pinGuid(entry, { origin = SITE_URL, variant = 1 } = {}) {
  const canonical = pinCanonicalUrl(entry, { origin });
  return variant > 1 ? `${canonical}#pin-${variant}` : canonical;
}

/**
 * Stable filename for the page's Pinterest creative. Derived from the entry id
 * so the URL survives re-ranking, re-scoring and board changes.
 */
export function pinImageFilename(entry, { variant = 1 } = {}) {
  const base = entry.id.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
  const extension = pinImageType(entry, { variant }) === 'image/jpeg' ? 'jpg' : 'png';
  return variant > 1 ? `${base}-v${variant}.${extension}` : `${base}.${extension}`;
}

/**
 * Photo Pins (a page's first Pin, and every product Pin) are JPEG: as PNG each
 * one is around 1.5 MB. The text-led second Pin stays PNG, which keeps its
 * lettering sharp and its file small.
 */
export function pinImageType(entry, { variant = 1 } = {}) {
  return entry.pins?.length || variant === 1 ? 'image/jpeg' : 'image/png';
}

export function pinImageUrl(entry, { origin = SITE_URL, variant = 1 } = {}) {
  return `${origin}${PINTEREST_IMAGE_PATH}/${pinImageFilename(entry, { variant })}`;
}

/**
 * The record's id: the page id for its first Pin, and `<page id>~vN` for the
 * later ones, so every Pin can be told apart while still naming its page.
 */
export function pinRecordId(entry, { variant = 1 } = {}) {
  return variant > 1 ? `${entry.id}~v${variant}` : entry.id;
}

/**
 * Everything one feed item needs, in one object, so the RSS writer and any
 * later Pinterest API adapter consume exactly the same record.
 */
export function buildPinRecord(entry, options = {}) {
  const variant = options.variant || 1;
  return {
    id: pinRecordId(entry, { variant }),
    pageId: entry.id,
    path: entry.path,
    variant,
    guid: pinGuid(entry, options),
    title: pinTitle(entry, { variant }),
    description: pinDescription(entry, { variant }),
    link: pinDestinationUrl(entry, options),
    canonical: pinCanonicalUrl(entry, options),
    campaign: pinCampaign(entry),
    board: entry.board?.board || null,
    boardKey: entry.board?.key || null,
    image: {
      url: pinImageUrl(entry, options),
      width: PIN_IMAGE_WIDTH,
      height: PIN_IMAGE_HEIGHT,
      type: pinImageType(entry, options),
    },
    published: entry.published || '',
    modified: entry.modified || '',
    score: entry.score,
    kind: entry.kind,
  };
}
