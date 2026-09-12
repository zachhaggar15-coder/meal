// The canonical occurrence model.
//
// Every claim a book makes about novelty or repetition - "seven new dinners",
// "the last of the new recipes", "nothing new at all", "a third outing", "all
// twenty-four have now been cooked" - is a statement about this data. Before
// this module existed those claims were hand-written prose sitting beside the
// schedule, and four of them had drifted out of agreement with it.
//
// Nothing here is authored. It is all derived from week.dinners, which is the
// single source of truth for what gets cooked when.

export function deriveOccurrences(book) {
  /** @type {Map<string, {id, appearances: {week:number, day:string, index:number}[]}>} */
  const byRecipe = new Map();
  let index = 0;

  for (const week of book.weeks) {
    for (const day of week.days) {
      const id = day.dinner.id;
      if (!byRecipe.has(id)) byRecipe.set(id, { id, appearances: [] });
      byRecipe.get(id).appearances.push({ week: week.n, day: day.day, index: index++ });
    }
  }

  const recipes = new Map();
  for (const [id, row] of byRecipe) {
    const first = row.appearances[0];
    recipes.set(id, {
      id,
      firstWeek: first.week,
      firstDay: first.day,
      appearances: row.appearances,
      count: row.appearances.length,
    });
  }

  // Per-week facts, computed by walking the weeks in order.
  const seen = new Set();
  const weeks = book.weeks.map((week) => {
    const newIds = [];
    const returningIds = [];
    const nthOutingByDay = [];

    for (const day of week.days) {
      const id = day.dinner.id;
      const rec = recipes.get(id);
      const nth = rec.appearances.findIndex((a) => a.week === week.n && a.day === day.day) + 1;
      nthOutingByDay.push({ day: day.day, id, nth });
      if (!seen.has(id)) {
        newIds.push(id);
        seen.add(id);
      } else {
        returningIds.push(id);
      }
    }

    return {
      n: week.n,
      newIds,
      returningIds,
      newCount: newIds.length,
      returningCount: returningIds.length,
      nthOutingByDay,
      // How many distinct dinners the reader has cooked by the END of this week.
      cumulativeUnique: seen.size,
      allSeenByEndOfWeek: seen.size === recipes.size,
      maxOuting: Math.max(...nthOutingByDay.map((d) => d.nth)),
    };
  });

  return {
    recipes,
    weeks,
    totalUnique: recipes.size,
    totalSlots: index,
    // The week in which the last never-before-seen dinner appears.
    lastNewWeek: Math.max(...[...recipes.values()].map((r) => r.firstWeek)),
  };
}

/** Short human-readable summary used on the week page, generated not written. */
export function weekFactLine(occ, n) {
  const w = occ.weeks.find((x) => x.n === n);
  const parts = [];
  if (w.newCount === 7) parts.push('All seven dinners are new this week');
  else if (w.newCount === 0) parts.push('No new dinners this week');
  else parts.push(`${numberWord(w.newCount)} new ${w.newCount === 1 ? 'dinner' : 'dinners'}, ${numberWord(w.returningCount)} returning`);
  parts.push(`${w.cumulativeUnique} of ${occ.totalUnique} cooked by Sunday`);
  return parts.join(' &middot; ');
}

const WORDS = ['none', 'one', 'two', 'three', 'four', 'five', 'six', 'seven'];
export const numberWord = (n) => WORDS[n] ?? String(n);
