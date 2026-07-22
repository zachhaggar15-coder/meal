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

  return String(value).replace(/[A-Za-z][A-Za-z'.-]*/g, titleCaseWord);
}
