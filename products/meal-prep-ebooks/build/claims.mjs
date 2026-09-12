// Prose-claim validation.
//
// This module exists because of a whole class of failure the earlier QA suite
// could not see. The generator validated structure - schedules, quantities,
// nutrition, leftovers - and every one of those checks passed while four books
// shipped sentences that contradicted the schedule sitting directly beneath
// them: "all twenty-four dinners" at a point where twenty-one had been cooked,
// "a third outing" for dishes that appear twice, "everything is familiar" on a
// week introducing three new recipes.
//
// The root cause was two representations of one fact. week.dinners said what
// gets cooked; the week's prose also said what gets cooked, in English, by hand.
// Nothing compared them.
//
// So: every sentence in a book that asserts something about novelty or
// repetition is matched here against the derived occurrence model, and a
// mismatch fails the build. Prose is free to be prose - it just cannot make a
// counting claim that the data does not support.

const WORD_TO_NUMBER = new Map(Object.entries({
  no: 0, none: 0, nothing: 0, zero: 0,
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7,
  eight: 8, nine: 9, ten: 10,
  twenty: 20, 'twenty-one': 21, 'twenty-two': 22, 'twenty-three': 23,
  'twenty-four': 24, 'twenty-five': 25, 'twenty-six': 26,
}));

const toNumber = (token) => {
  const t = String(token || '').toLowerCase().trim();
  if (/^\d+$/.test(t)) return Number(t);
  return WORD_TO_NUMBER.has(t) ? WORD_TO_NUMBER.get(t) : null;
};

// Longest alternatives first: regex alternation is ordered, so listing "twenty"
// ahead of "twenty-four" makes "all twenty-four dinners" match as "twenty".
const NUM = '(\\d+|twenty-one|twenty-two|twenty-three|twenty-four|twenty-five|twenty-six|nothing|none|one|two|three|four|five|six|seven|eight|nine|ten|twenty|no)';

/** Strip markup and entities so patterns match the words a reader sees. */
const plain = (html) =>
  String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&rsquo;/g, "'")
    .replace(/&mdash;/g, ' - ')
    .replace(/&middot;/g, ' ')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Every prose string attached to a week, with a label for the error message. */
function weekProse(week) {
  const out = [
    ['title', week.title],
    ['tocSub', week.tocSub],
    ['lede', week.lede],
  ];
  const walk = (blocks, path) => {
    for (const [i, b] of (blocks || []).entries()) {
      if (!b || typeof b !== 'object') continue;
      if (b.text) out.push([`${path}[${i}].text`, b.text]);
      if (b.h) out.push([`${path}[${i}].h`, b.h]);
      if (Array.isArray(b.items)) {
        b.items.forEach((item, j) => {
          if (typeof item === 'string') out.push([`${path}[${i}].items[${j}]`, item]);
          else if (item && typeof item === 'object') {
            if (item.b) out.push([`${path}[${i}].items[${j}].b`, item.b]);
            if (item.text) out.push([`${path}[${i}].items[${j}].text`, item.text]);
          }
        });
      }
      if (Array.isArray(b.blocks)) walk(b.blocks, `${path}[${i}].blocks`);
    }
  };
  walk(week.notes, 'notes');
  return out.filter(([, v]) => typeof v === 'string' && v.length);
}

/**
 * Check one week's prose against the derived facts for that week.
 * Returns a list of human-readable failures.
 */
export function checkWeekClaims(week, occWeek, occ) {
  const failures = [];
  const note = (field, text, msg) =>
    failures.push(`week ${week.n} ${field}: ${msg}\n           "${text.slice(0, 120)}"`);

  for (const [field, raw] of weekProse(week)) {
    const text = plain(raw);
    const lower = text.toLowerCase();

    // "all twenty-four dinners" / "every dinner in the book" ... cooked
    const allCooked = new RegExp(`\\b(all|every)\\b[^.]{0,60}\\b(dinner|recipe)s?\\b[^.]{0,80}\\b(cooked|made|been through)\\b`, 'i');
    if (allCooked.test(text) && !/not yet|still to come|by the end of week/i.test(text)) {
      if (occWeek.cumulativeUnique !== occ.totalUnique) {
        note(field, text, `claims every dinner has been cooked, but only ${occWeek.cumulativeUnique} of ${occ.totalUnique} have by the end of week ${week.n}`);
      }
    }

    // An explicit count of the whole set: "all twenty-four dinners"
    const allN = new RegExp(`\\ball ${NUM}\\b[^.]{0,40}\\b(dinner|recipe)s?\\b`, 'i').exec(text);
    if (allN) {
      const claimed = toNumber(allN[1]);
      if (claimed !== null && claimed !== occ.totalUnique) {
        note(field, text, `says "all ${allN[1]}" but the book has ${occ.totalUnique} unique dinners`);
      }
      if (claimed !== null && occWeek.cumulativeUnique !== claimed) {
        note(field, text, `implies ${claimed} cooked by week ${week.n}, actual is ${occWeek.cumulativeUnique}`);
      }
    }

    // "seven new dinners", "three new recipes"
    const newN = new RegExp(`${NUM}\\s+new\\s+(dinner|recipe|dish)`, 'i').exec(text);
    if (newN) {
      const claimed = toNumber(newN[1]);
      if (claimed !== null && claimed !== occWeek.newCount) {
        note(field, text, `claims ${claimed} new dinners, actual is ${occWeek.newCount}`);
      }
    }

    // "Three new, four familiar" / "three new and four returning"
    const pair = new RegExp(`${NUM}\\s+new\\b[^.]{0,24}?\\b${NUM}\\s+(familiar|returning|you have cooked|repeat)`, 'i').exec(text);
    if (pair) {
      const a = toNumber(pair[1]);
      const b = toNumber(pair[2]);
      if (a !== null && a !== occWeek.newCount) note(field, text, `claims ${a} new, actual ${occWeek.newCount}`);
      if (b !== null && b !== occWeek.returningCount) note(field, text, `claims ${b} familiar, actual ${occWeek.returningCount}`);
    }

    // "the last two new things" / "the last new ones"
    const newThings = new RegExp(`${NUM}\\s+new\\s+(thing|one|dish|addition)s?`, 'i').exec(text);
    if (newThings) {
      const claimed = toNumber(newThings[1]);
      if (claimed !== null && claimed !== occWeek.newCount) {
        note(field, text, `names ${claimed} new dish(es), but ${occWeek.newCount} appear for the first time this week`);
      }
    }

    // "every dinner here you cooked in the first three weeks"
    if (/\bevery dinner (here|this week|in this week)\b[^.]{0,40}\b(you )?(have )?(already )?(cooked|made)\b/i.test(text)) {
      if (occWeek.newCount !== 0) {
        note(field, text, `says every dinner has been cooked before, but ${occWeek.newCount} are new this week`);
      }
    }

    // "the last of the new" - only true in the week the final first-appearance lands
    if (/\blast of the new\b|\bfinal new\b|\blast new (dinner|recipe|dish)/i.test(text)) {
      if (week.n !== occ.lastNewWeek) {
        note(field, text, `claims the last new dinners, but the final first appearance is in week ${occ.lastNewWeek}`);
      }
    }

    // "nothing new", "every dinner a repeat", "everything is familiar"
    if (/\bnothing (new|unfamiliar)\b|\bno new (dinner|recipe)|\bevery dinner a repeat\b|\beverything (here |this week )?(is|will be) familiar\b|\beverything you already know\b/i.test(text)) {
      if (occWeek.newCount !== 0) {
        note(field, text, `claims nothing is new, but ${occWeek.newCount} dinner(s) appear for the first time this week`);
      }
    }

    // "after Sunday, nothing is unfamiliar" - true only once every dinner has appeared
    if (/\bnothing is unfamiliar\b|\bnothing will be unfamiliar\b/i.test(text)) {
      if (occWeek.cumulativeUnique !== occ.totalUnique) {
        note(field, text, `promises nothing unfamiliar after this week, but ${occ.totalUnique - occWeek.cumulativeUnique} dinner(s) have still not appeared`);
      }
    }

    // "a third outing" / "third time"
    const ordinal = /\b(third|fourth|fifth)\s+(outing|time|run|appearance)\b/i.exec(text);
    if (ordinal) {
      const wanted = { third: 3, fourth: 4, fifth: 5 }[ordinal[1].toLowerCase()];
      if (occWeek.maxOuting < wanted) {
        note(field, text, `refers to a ${ordinal[1]} ${ordinal[2]}, but no dinner reaches outing ${wanted} this week (max is ${occWeek.maxOuting})`);
      }
    }

    // "six of these seven dinners you cooked in the first three weeks"
    const ofSeven = new RegExp(`${NUM}\\s+of\\s+(these\\s+)?(seven|7)\\s+dinners[^.]{0,40}\\b(cooked|made|seen)`, 'i').exec(text);
    if (ofSeven) {
      const claimed = toNumber(ofSeven[1]);
      if (claimed !== null && claimed !== occWeek.returningCount) {
        note(field, text, `claims ${claimed} of seven were cooked before, actual is ${occWeek.returningCount}`);
      }
    }
  }

  return failures;
}

// Words too generic to identify a dish. "chicken" appears in nine recipe names;
// "tagine" appears in one, and that is the kind of token worth checking.
const GENERIC_TOKENS = new Set([
  'chicken', 'beef', 'pork', 'lamb', 'turkey', 'bacon', 'salmon', 'prawn', 'prawns', 'tuna',
  'cheese', 'yogurt', 'bean', 'beans', 'lentil', 'lentils', 'chickpea', 'chickpeas', 'potato',
  'potatoes', 'rice', 'pasta', 'noodle', 'noodles', 'bread', 'toast', 'tomato', 'tomatoes',
  'vegetable', 'vegetables', 'spiced', 'spicy', 'creamy', 'roast', 'roasted', 'baked', 'bake',
  'tray', 'traybake', 'bowl', 'bowls', 'salad', 'soup', 'stew', 'curry', 'sauce', 'green',
  'white', 'black', 'red', 'garlic', 'lemon', 'mixed', 'plate', 'with', 'and', 'the',
]);

/**
 * A week's prose should not name a dish that is not cooked in that week.
 *
 * This caught a sentence in the Lidl budget book promising "the tagine" in week
 * three when the tagine first appears in week four - a contradiction no counting
 * check could see, because the sentence contains no numbers.
 */
export function checkDishReferences(book, occ) {
  const failures = [];

  // A word that names an ingredient cannot identify a dish: prose saying "keep
  // the pepper stew" or "the mustard mash" is talking about food, not titles.
  const ingredientWords = new Set();
  for (const recipe of Object.values(book.meals)) {
    for (const item of recipe.ingredients) {
      for (const word of plain(item.display).toLowerCase().split(/[^a-zà-ÿ]+/)) {
        if (word.length >= 4) ingredientWords.add(word);
      }
    }
  }

  // Distinctive single words, mapped to the recipes that own them.
  const tokenOwners = new Map();
  for (const [id, recipe] of Object.entries(book.meals)) {
    if (recipe.kind !== 'dinner') continue;
    for (const word of plain(recipe.name).toLowerCase().split(/[^a-zà-ÿ]+/)) {
      if (word.length < 5 || GENERIC_TOKENS.has(word) || ingredientWords.has(word)) continue;
      if (!tokenOwners.has(word)) tokenOwners.set(word, new Set());
      tokenOwners.get(word).add(id);
    }
  }
  // Only words owned by exactly one dinner are safe to reason about.
  const unique = new Map([...tokenOwners].filter(([, ids]) => ids.size === 1).map(([w, ids]) => [w, [...ids][0]]));

  for (const week of book.weeks) {
    const scheduled = new Set(week.days.map((d) => d.dinner.id));
    for (const [field, raw] of weekProse(week)) {
      const words = new Set(plain(raw).toLowerCase().split(/[^a-zà-ÿ]+/));
      for (const word of words) {
        const owner = unique.get(word);
        if (!owner || scheduled.has(owner)) continue;
        const first = occ.recipes.get(owner);
        failures.push(
          `week ${week.n} ${field}: mentions "${word}" (${book.meals[owner].name}), which is not cooked this week ` +
          `(it appears in week${first.appearances.length > 1 ? 's' : ''} ${[...new Set(first.appearances.map((a) => a.week))].join(', ')})`
        );
      }
    }
  }
  return failures;
}

/** Contents-page descriptions live outside the week objects and drift the same way. */
export function checkTocClaims(book, occ) {
  const failures = [];
  for (const week of book.weeks) {
    const occWeek = occ.weeks.find((w) => w.n === week.n);
    failures.push(...checkWeekClaims(week, occWeek, occ));
  }
  failures.push(...checkDishReferences(book, occ));
  return failures;
}

export { plain };
