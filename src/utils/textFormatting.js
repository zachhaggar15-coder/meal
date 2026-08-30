const UPPERCASE_WORDS = new Map([
  ['ai', 'AI'],
  ['faq', 'FAQ'],
  ['frive', 'Frive'],
  ['fuelhub', 'FuelHub'],
  ['gousto', 'Gousto'],
  ['hellofresh', 'HelloFresh'],
  ['nhs', 'NHS'],
  ['pdf', 'PDF'],
  ['pdfs', 'PDFs'],
  ['simmer', 'Simmer'],
  ['seo', 'SEO'],
  ['tdee', 'TDEE'],
  ['uk', 'UK'],
]);

const LOWERCASE_WORDS = new Set(['cm', 'g', 'kcal', 'kg', 'ml', 'vs', 'wk']);

// Articles, conjunctions and short prepositions stay lowercase inside a title.
// Without this every heading came out as "Sample Day Of Eating", "Best Foods For
// Lidl" and "Two Things That Make A High-Protein Shop Go Further" — capitalising
// each word is what a script does, not what a title looks like.
//
// The rule only applies in the middle: the first and last word are always
// capitalised, so "What To Look For" keeps its "For".
const MINOR_WORDS = new Set([
  'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'from', 'if', 'in', 'into',
  'nor', 'of', 'on', 'onto', 'or', 'per', 'so', 'the', 'to', 'up', 'via', 'with',
  'yet',
]);

function titleCaseWord(word) {
  const lower = word.toLowerCase();

  if (UPPERCASE_WORDS.has(lower)) return UPPERCASE_WORDS.get(lower);
  if (LOWERCASE_WORDS.has(lower)) return lower;
  if (word.includes('.')) return word;

  return lower
    .split('-')
    .map(part => {
      const [first, ...rest] = part.split("'");
      const capitalised = first ? first.charAt(0).toUpperCase() + first.slice(1) : first;
      return [capitalised, ...rest].join("'");
    })
    .join('-');
}

export function toTitleCase(value) {
  if (!value) return '';

  const text = String(value);
  const words = [...text.matchAll(/[A-Za-z][A-Za-z'.-]*/g)];
  const lastIndex = words.length - 1;
  let seen = -1;

  return text.replace(/[A-Za-z][A-Za-z'.-]*/g, word => {
    seen += 1;
    const lower = word.toLowerCase();
    // A minor word keeps its lowercase form unless it opens or closes the title,
    // and an explicit casing rule always wins over the minor-word list.
    if (
      seen > 0
      && seen < lastIndex
      && MINOR_WORDS.has(lower)
      && !UPPERCASE_WORDS.has(lower)
    ) {
      return lower;
    }
    return titleCaseWord(word);
  });
}
