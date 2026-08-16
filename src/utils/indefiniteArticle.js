// "a" vs "an" for interpolated names.
//
// Generated copy assembled phrases as `a ${label}`, which reads correctly for
// most retailers and wrongly for the ones starting with a vowel sound:
//
//   "Choose a Aldi meal plan by goal"
//   "Can I use a Asda plan at another supermarket?"
//   "a Iceland meal plan by goal"
//
// The rule is about the *sound* a word starts with, not the letter, so a
// lookup table keyed on retailers would be both fragile and incomplete. This
// handles the general case and records the genuine exceptions.

// Words beginning with a vowel letter but a consonant sound: "a European
// supermarket", "a one-pot meal", "a universal staple".
const CONSONANT_SOUNDED_VOWEL = /^(?:eu|ewe|one\b|once\b|uni(?![aeiou])|use|user|usual|utili)/i;

// Words beginning with a consonant letter but a vowel sound. Initialisms are
// the common case: an M&S plan, an SEO guide, an F-rated item.
const VOWEL_SOUNDED_CONSONANT = /^(?:hour|honest|honour|heir|[FHLMNRSX](?![a-z]))/;

/**
 * Returns "a" or "an" for the word that follows.
 *
 * @param {string} value the phrase the article will precede
 * @returns {'a'|'an'}
 */
export function indefiniteArticleFor(value) {
  const word = String(value || '').trim();
  if (!word) return 'a';

  if (VOWEL_SOUNDED_CONSONANT.test(word)) return 'an';
  if (CONSONANT_SOUNDED_VOWEL.test(word)) return 'a';
  return /^[aeiou]/i.test(word) ? 'an' : 'a';
}

/**
 * Prefixes a phrase with the correct article: `withArticle('Aldi')` gives
 * "an Aldi". Capitalisation of the article is left to the caller.
 */
export function withArticle(value) {
  return `${indefiniteArticleFor(value)} ${String(value || '').trim()}`.trim();
}
