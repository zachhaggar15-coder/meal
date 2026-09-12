// Assembles a book definition into the object the layout renders.
//
// Everything added here is *derived* from the schedule rather than authored, so
// a claim on the cover cannot drift away from the plan behind it: the dinner
// count, which weeks a recipe appears in, and the shopping notes that depend on
// how a pack gets used across a week.

import { buildBook } from './plan.mjs';

export function assemble(def) {
  const book = buildBook(def);

  // Which weeks each recipe actually appears in. Printed on the recipe card so a
  // cook in week five can see they have made this before.
  const weeksFor = new Map();
  for (const w of book.weeks) {
    for (const day of w.days) {
      for (const id of [day.breakfast.id, day.lunch.id, day.dinner.id, day.extra.id]) {
        if (!weeksFor.has(id)) weeksFor.set(id, new Set());
        weeksFor.get(id).add(w.n);
      }
    }
  }

  const recipeWeeks = {};
  for (const [id, set] of weeksFor) {
    const list = [...set].sort((a, b) => a - b);
    if (list.length === 6) recipeWeeks[id] = 'Every week';
    else if (list.length === 1) recipeWeeks[id] = `Week ${list[0]}`;
    else recipeWeeks[id] = `Weeks ${list.join(', ')}`;
  }

  const dinnerIds = new Set();
  for (const w of book.weeks) for (const d of w.days) dinnerIds.add(d.dinner.id);

  return {
    ...book,
    ...def.content,
    recipeWeeks,
    uniqueDinners: dinnerIds.size,
  };
}
