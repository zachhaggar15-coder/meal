// Turns a built book into renderable HTML parts.
//
// Each part becomes its own PDF and the parts are merged, which is what makes
// accurate contents-page numbering possible: every part starts on a fresh sheet,
// so a part rendered alone paginates identically to the same part rendered
// inside the whole book and page counts can simply be accumulated.
//
// Structure: cover, contents, front matter, six week spreads (planner + list),
// one recipe chapter, appendices, printables. Recipes live in one chapter rather
// than being reprinted in each week that uses them - seventeen of the twenty-four
// dinners recur, and printing them twice would add fifteen pages saying nothing.
//
// Body copy is authored, not user input, so inline <b> and <i> pass through.

import { baseCss, pageRule, FONT_LINK } from './styles.mjs';
import { AISLE_ORDER, shopperQuantity, packHint } from './plan.mjs';

const doc = (book, kind, body) => `<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8">
<title>${book.title}</title>${FONT_LINK}
<style>${pageRule(kind)}
${baseCss}</style></head><body>${body}</body></html>`;

/* ── block vocabulary ─────────────────────────────────────────────────── */

function block(b) {
  switch (b.t) {
    case 'p': return `<p>${b.text}</p>`;
    case 'lede': return `<p class="lede">${b.text}</p>`;
    case 'small': return `<p class="small">${b.text}</p>`;
    case 'h': return `<div class="strip">${b.text}</div>`;
    case 'h4': return `<h4 style="font-size:10.5pt;margin:9pt 0 4pt">${b.text}</h4>`;
    case 'bullets': return `<ul class="bullets">${b.items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
    case 'numlist':
      return `<ol class="numlist">${b.items
        .map((i) => (typeof i === 'string' ? `<li>${i}</li>` : `<li><b>${i.b}</b>${i.text}</li>`))
        .join('')}</ol>`;
    case 'callout':
      return `<div class="callout"><div class="k">${b.k}</div><p>${b.text}</p></div>`;
    case 'card':
      return `<div class="card${b.shadow ? ' shadow' : ''}">${b.h ? `<h4>${b.h}</h4>` : ''}${b.blocks.map(block).join('')}</div>`;
    case 'table':
      return `<table class="tbl"><thead><tr>${b.head.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${b.rows.map((r) => `<tr>${r.map((c, i) => `<td${i === 0 && b.leadCol !== false ? ' class="lead"' : ''}>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    case 'twocol': return `<div class="twocol">${b.blocks.map(block).join('')}</div>`;
    case 'space': return `<div style="height:${b.mm || 4}mm"></div>`;
    case 'raw': return b.html;
    default: throw new Error(`unknown block type: ${b.t}`);
  }
}

const blocks = (list = []) => list.map(block).join('');

const pageHead = (kicker, title, tag) => `<div class="page-head">
  <div class="ph-l"><div class="kicker">${kicker}</div><h1>${title}</h1></div>
  ${tag ? `<div class="ph-r"><span class="tag">${tag}</span></div>` : ''}
</div>`;

/* ── recipe card ──────────────────────────────────────────────────────── */

// What to do with the pan once it is cooked, derived rather than written.
//
// A dinner card is printed once but may be cooked on a weekday at full size and
// on a Sunday at half, so the card has to say both. Whether a recipe is ever
// half-batched is read from the schedule, so the Sunday sentence only appears on
// the cards it actually applies to.
function portionNote(r, book) {
  if (r.kind !== 'dinner') return `Makes ${r.yield} portions, one each.`;
  const halved = book.halfBatchRecipes?.has(r.id);
  return `Divide into 4 equal portions. Two on the plate now; the other two straight into tubs and ` +
    `into the fridge within two hours, for tomorrow&rsquo;s lunch.` +
    (halved ? ' Cooked on a Sunday, halve every quantity and make just the two &mdash; Monday&rsquo;s lunch is made fresh.' : '');
}

function recipeCard(r, book) {
  const m = r.macros;
  const serves = r.kind === 'dinner' ? '2, plus 2 lunches' : '2';
  const weeks = book.recipeWeeks?.[r.id];
  return `<article class="recipe">
  <div class="recipe-top">
    <h3>${r.name}</h3>
    <p class="tagline">${r.tagline}</p>
    <div class="rmeta">
      <span>${r.time}</span><span>Serves ${serves}</span>${weeks ? `<span>${weeks}</span>` : ''}
    </div>
  </div>
  <div class="rbody">
    <div class="rcol-i">
      <h5>Ingredients</h5>
      <ul class="ing">${r.ingredients.map((i) => `<li>${i.display}</li>`).join('')}</ul>
    </div>
    <div class="rcol-m">
      <h5>Method</h5>
      <ol class="steps">${r.method.map((s) => `<li>${s}</li>`).join('')}</ol>
    </div>
  </div>
  <div class="rfoot">
    <div class="macros">
      <div class="k">Per portion</div>
      <b>${m.kcal} kcal &middot; ${m.protein}g protein &middot; ${m.carbs}g carbs &middot; ${m.fats}g fat &middot; ${m.fibre}g fibre</b>
    </div>
    <div class="note"><b>Portions</b> ${portionNote(r, book)}<br><b>Swap</b> ${r.swap}<br><b>Leftovers</b> ${r.leftovers}</div>
  </div>
</article>`;
}

/* ── week planner ─────────────────────────────────────────────────────── */

function plannerTable(week, book) {
  const nameOf = (id) => book.meals[id].name;
  return `<table class="planner"><thead><tr>
    <th style="width:12mm">Day</th><th>Breakfast</th><th>Lunch</th><th>Dinner</th><th style="width:14mm">Each</th><th style="width:7mm"></th>
  </tr></thead><tbody>${week.days
    .map((d) => {
      const dinner = book.meals[d.dinner.id];
      const lunchLabel = d.lunch.kind === 'leftover'
        ? `Yesterday&rsquo;s ${nameOf(d.lunch.id).toLowerCase()}`
        : nameOf(d.lunch.id);
      return `<tr${d.weekend ? ' class="weekend"' : ''}>
      <td class="day">${d.day}</td>
      <td><span class="dish">${nameOf(d.breakfast.id)}</span></td>
      <td><span class="dish">${lunchLabel}</span><span class="meta">${d.lunch.kind === 'leftover' ? 'Reheat' : book.meals[d.lunch.id].time}</span></td>
      <td><span class="dish">${dinner.name}</span><span class="meta">${dinner.time}${d.dinner.scale !== 1 ? ' &middot; half batch' : ''}${d.dinner.producesLunch ? ' &middot; makes tomorrow&rsquo;s lunch' : ''}</span></td>
      <td class="tot">${d.kcal}<span class="meta">kcal</span></td>
      <td class="box"></td>
    </tr>`;
    })
    .join('')}</tbody></table>
  <div class="everyday"><b>Every day as well:</b> ${book.meals[week.extra].name} &mdash; ${book.meals[week.extra].macros.kcal} kcal, ${book.meals[week.extra].macros.protein}g protein, two minutes.</div>`;
}

/* ── shopping list ────────────────────────────────────────────────────── */

function shoppingList(week, book) {
  const buys = week.shopping.filter((r) => !r.staple);
  const staples = week.shopping.filter((r) => r.staple);

  const byAisle = new Map();
  for (const row of buys) {
    if (!byAisle.has(row.aisle)) byAisle.set(row.aisle, []);
    byAisle.get(row.aisle).push(row);
  }

  const aisles = AISLE_ORDER.filter((a) => byAisle.has(a)).map((aisle) => {
    const rows = byAisle.get(aisle).sort((a, b) => a.name.localeCompare(b.name));
    return `<div class="aisle"><h4>${aisle}</h4><ul>${rows
      .map((r) => {
        const hint = packHint(r);
        const note = [hint, book.shopNotes?.[r.name]].filter(Boolean).join(' &middot; ');
        const qual = r.qualifier && r.qualifier !== 'dry' ? ` (${r.qualifier})` : '';
        return `<li><span class="q">${shopperQuantity(r)}</span> ${r.shopperName}${qual}${note ? `<span class="note">${note}</span>` : ''}</li>`;
      })
      .join('')}</ul></div>`;
  }).join('');

  // Week one prints the whole plan's staples; later weeks print only what that
  // week uses, which the cupboard model guarantees is a subset of week one's buy.
  const stapleNames = week.n === 1 ? book.cupboard.weekOne : book.cupboard.byWeek.get(week.n);

  return `<div class="aisles">${aisles}</div>
  <div class="callout"><div class="k">${week.n === 1 ? 'Buy these once, in week one' : 'Check you still have'}</div>
    <p>${stapleNames.join(', ')}.
    ${week.n === 1
      ? 'Everything the whole six weeks needs from the cupboard, bought once. It is why the first shop costs noticeably more than the five that follow, and why weeks two to six look cheap by comparison.'
      : 'All of it was on week one&rsquo;s cupboard list. Replace only what has actually run out.'}</p></div>`;
}

/* ── parts ────────────────────────────────────────────────────────────── */

const coverHtml = (book) => `<div class="cover">
  <div class="cover-rule"></div>
  <div class="cover-brand">MealPrep.org.uk</div>
  <div class="cover-store">${book.store} &middot; ${book.planLabel}</div>
  <h1>${book.title}</h1>
  <p class="sub">${book.subtitle}</p>
  <div class="cover-strip">
    ${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d) => `<div class="cover-day on"><div class="b">${d}</div></div>`).join('')}
  </div>
  <p class="cover-strip-note">${book.coverNote}</p>
  <div class="cover-facts">
    ${book.facts.map((f) => `<div class="cover-fact"><div class="k">${f.k}</div><div class="v">${f.v}</div></div>`).join('')}
  </div>
</div>`;

const tocHtml = (book, entries) => `${pageHead('Contents', 'What is in this book', `${book.uniqueDinners} dinners`)}
  <p class="lede">${book.tocLede}</p>
  ${entries
    .map((e) => `<div class="toc-row">
      <div class="toc-t"><div class="lbl">${e.label}</div>${e.sub ? `<div class="sub">${e.sub}</div>` : ''}</div>
      <div class="toc-p">${e.page ?? ''}</div>
    </div>`)
    .join('')}
  <p class="tiny" style="margin-top:10pt">${book.notAffiliated}</p>`;

const sectionHtml = (s) => `${pageHead(s.kicker, s.title, s.tag)}
  ${s.lede ? `<p class="lede">${s.lede}</p>` : ''}
  ${blocks(s.blocks)}`;

function weekHtml(book, w) {
  return `${pageHead(`Week ${w.n}`, w.title, w.tag)}
  <p class="lede">${w.lede}</p>
  ${plannerTable(w, book)}
  <div style="height:4mm"></div>
  ${blocks(w.notes)}

  <div class="newpage">
    ${pageHead(`Week ${w.n} &middot; shopping`, 'The list', book.cost.tier)}
    <p class="small" style="margin-bottom:7pt">${book.shopLede}</p>
    ${shoppingList(w, book)}
  </div>`;
}

function recipesHtml(book) {
  const order = ['breakfast', 'extra', 'lunch', 'dinner'];
  const labels = {
    breakfast: 'Breakfasts',
    extra: 'The daily extra',
    lunch: 'Monday lunches',
    dinner: 'The dinners',
  };
  const groups = order.map((kind) => {
    const rows = Object.values(book.meals).filter((m) => m.kind === kind);
    if (!rows.length) return '';
    rows.sort((a, b) => a.name.localeCompare(b.name));
    return `<div class="strip" style="margin-top:7pt">${labels[kind]}</div>
      ${rows.map((r) => recipeCard(r, book)).join('')}`;
  });
  return `${pageHead('Recipes', 'Every recipe in the plan', `${Object.keys(book.meals).length} in all`)}
    <p class="lede">${book.recipesLede}</p>
    ${groups.join('')}`;
}

// A blank week to photocopy once the six weeks are done.
//
// The "six weeks on one sheet" grid that used to sit here was removed: a
// seven-by-six table of dinner names is unreadable at A4 and tells the reader
// nothing the week pages do not already say more clearly.
function blankWeekHtml(book) {
  return `${pageHead('Printable', 'A blank week', 'Fridge')}
    <p class="lede">${book.blankLede}</p>
    <table class="planner blank"><thead><tr>
      <th style="width:14mm">Day</th><th>Breakfast</th><th>Lunch</th><th>Dinner</th><th style="width:7mm"></th>
    </tr></thead><tbody>${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      .map((d) => `<tr><td class="day">${d}</td><td></td><td></td><td></td><td class="box"></td></tr>`)
      .join('')}</tbody></table>
    <p class="small" style="margin-top:6pt">Every dinner except Sunday&rsquo;s makes the next day&rsquo;s lunch, so the lunch column is simply the dinner to its left, a day later. Sunday is cooked at half size because Monday&rsquo;s lunch is made fresh.</p>
    <div style="height:3mm"></div>
    <div class="card"><h4>The shop</h4>
      ${Array.from({ length: 9 }).map(() => '<div class="writeline"></div>').join('')}
    </div>`;
}

/* ── assembly ─────────────────────────────────────────────────────────── */

export function buildParts(book, tocPages = null) {
  const entries = [];
  const parts = [];
  const push = (id, html, entry) => {
    if (entry) entries.push({ key: id, ...entry });
    parts.push({ id, kind: 'text', html: doc(book, 'text', html) });
  };

  parts.push({ id: 'cover', kind: 'bleed', html: doc(book, 'bleed', coverHtml(book)) });
  parts.push({ id: 'toc', kind: 'text', html: '' });

  book.sections.forEach((s) => push(`sec:${s.id}`, sectionHtml(s), { label: s.title, sub: s.tocSub }));
  book.weeks.forEach((w) => push(`week:${w.n}`, weekHtml(book, w), { label: `Week ${w.n} &mdash; ${w.title}`, sub: w.tocSub }));
  push('recipes', recipesHtml(book), { label: 'Every recipe in the plan', sub: book.recipesTocSub });
  book.appendices.forEach((s) => push(`sec:${s.id}`, sectionHtml(s), { label: s.title, sub: s.tocSub }));
  push('fridge', blankWeekHtml(book), { label: 'A blank week', sub: 'For when the six weeks are done' });

  if (tocPages) entries.forEach((e) => { e.page = tocPages[e.key] ?? ''; });
  parts[1].html = doc(book, 'text', tocHtml(book, entries));

  return parts;
}
