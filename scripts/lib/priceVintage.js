// How old are the prices the site quotes?
//
// The supermarket comparison ranked seven retailers by a weekly basket total
// and disclosed, in the second paragraph of an earlier section, that the
// figures were "as of early 2025". By the time anyone noticed, that was
// eighteen months back — long enough for the totals to have drifted, and long
// enough that nothing in the build would ever have said so.
//
// Prices are the one kind of fact on this site that goes stale on its own, so
// they get a check that runs on every build rather than a promise to remember.

/** Month names as they appear in editorial copy. */
const MONTHS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];

// "priced in February 2025", "prices as of early 2025", "correct at March 2026"
const VINTAGE = new RegExp(
  String.raw`\bprice[sd]?\b[^.]{0,60}?\b(?:as of|collected in|correct at|checked in|priced in|in)\s+` +
  String.raw`(?:(early|mid|late)\s+)?(?:(${MONTHS.join('|')})\s+)?(20\d{2})`,
  'gi',
);

/** Where in a year "early"/"mid"/"late" put us, when no month is named. */
const SEASON_MONTH = { early: 2, mid: 6, late: 10 };

/**
 * Finds every stated price vintage in a block of text.
 *
 * @param {string} text prose to scan
 * @returns {Array<{phrase: string, year: number, month: number}>}
 */
export function findPriceVintages(text) {
  const found = [];
  const haystack = String(text || '');
  for (const match of haystack.matchAll(VINTAGE)) {
    const [phrase, season, monthName, year] = match;
    const month = monthName
      ? MONTHS.indexOf(monthName.toLowerCase()) + 1
      : SEASON_MONTH[String(season || '').toLowerCase()] || 6;
    found.push({ phrase: phrase.trim(), year: Number(year), month });
  }
  return found;
}

/** Whole months between a stated vintage and a reference date. */
export function monthsOld(vintage, now = new Date()) {
  return (now.getFullYear() - vintage.year) * 12 + (now.getMonth() + 1 - vintage.month);
}

// Language that tells the reader the figures are a snapshot rather than
// today's shelf price. A year-old comparison can still be worth publishing;
// one that presents itself as current cannot.
const DISCLOSED = new RegExp(
  String.raw`\bsnapshot\b|\bindicative\b|\bhave (?:almost certainly )?risen\b`
  + String.raw`|\bcheck (?:current )?shelf prices\b|\bwill have (?:moved|changed)\b|\bmoved since\b`,
  'i',
);

/**
 * Reports price vintages that are too old to be presented without a caveat.
 *
 * The rule is about disclosure, not age. Prices a year old are still useful —
 * the ranking they support barely moves — but the reader has to be told they
 * are a year old, in the copy, near the figures. The original defect was not
 * that the basket totals came from February 2025; it was that the page read as
 * though they came from this week.
 *
 * @param {Array<{id: string, text: string}>} pages
 * @param {{maxMonths?: number, now?: Date}} [options] maxMonths is how old a
 *   price may be before it needs a caveat.
 */
export function findStalePrices(pages, { maxMonths = 12, now = new Date() } = {}) {
  const stale = [];
  for (const { id, text } of pages) {
    const disclosed = DISCLOSED.test(text || '');
    for (const vintage of findPriceVintages(text)) {
      const age = monthsOld(vintage, now);
      if (age > maxMonths && !disclosed) stale.push({ id, ...vintage, monthsOld: age });
    }
  }
  return stale;
}
