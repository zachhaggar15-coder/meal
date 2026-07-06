// Applies the corrected kcal/protein figures from scripts/output/nutrition-audit.json
// back into src/data/mealLibrary.js and src/data/mealPlans.js. Anchors every edit on a
// unique identifier (a meal's `id` for mealLibrary.js; a day+name pair for mealPlans.js)
// and rewrites only the numeric literal inside that meal's own object — never a global
// find/replace — so meals sharing the same kcal value elsewhere are untouched.
import fs from 'fs';

const DIFF_THRESHOLD = 8; // % — matches the plan's auto-apply threshold
const LIB_PATH = new URL('../src/data/mealLibrary.js', import.meta.url);
const PLANS_PATH = new URL('../src/data/mealPlans.js', import.meta.url);

const report = JSON.parse(fs.readFileSync(new URL('./output/nutrition-audit.json', import.meta.url), 'utf8'));
const toFix = report.computedRows.filter(r => Math.abs(r.kcalDiffPct) > DIFF_THRESHOLD);

function findObjectSpan(text, anchorIndex) {
  let start = anchorIndex;
  while (start > 0 && text[start] !== '{') start -= 1;
  let depth = 1;
  let end = start + 1;
  while (depth > 0 && end < text.length) {
    if (text[end] === '{') depth += 1;
    else if (text[end] === '}') depth -= 1;
    end += 1;
  }
  return [start, end];
}

function replaceField(objText, field, value) {
  const re = new RegExp(`(\\b${field}:\\s*)-?\\d+(?:\\.\\d+)?`);
  if (!re.test(objText)) throw new Error(`field "${field}" not found in object: ${objText.slice(0, 80)}...`);
  return objText.replace(re, `$1${value}`);
}

function applyToObject(text, anchorIndex, fields) {
  const [start, end] = findObjectSpan(text, anchorIndex);
  let obj = text.slice(start, end);
  for (const [field, value] of fields) obj = replaceField(obj, field, value);
  return text.slice(0, start) + obj + text.slice(end);
}

// ── mealLibrary.js: anchor on the meal's unique `id` ────────────────────────
let libText = fs.readFileSync(LIB_PATH, 'utf8');
let libFixed = 0;
for (const row of toFix.filter(r => r.file === 'mealLibrary.js')) {
  const anchor = `id: '${row.id}'`;
  const idx = libText.indexOf(anchor);
  if (idx === -1) { console.warn(`[mealLibrary.js] could not find id "${row.id}", skipping`); continue; }
  libText = applyToObject(libText, idx, [['cal', row.computedKcal], ['pro', row.computedProtein]]);
  libFixed += 1;
}
fs.writeFileSync(LIB_PATH, libText);
console.log(`mealLibrary.js: ${libFixed}/${toFix.filter(r => r.file === 'mealLibrary.js').length} meals updated`);

// ── mealPlans.js: anchor on (plan array, day, meal name) ────────────────────
let plansText = fs.readFileSync(PLANS_PATH, 'utf8');
let plansFixed = 0;
const plansToFix = toFix.filter(r => r.file.startsWith('mealPlans.js:'));

for (const row of plansToFix) {
  const planName = row.file.split(':')[1];
  const [day, mealName] = row.id.split(/:(.+)/);

  const arrayAnchor = `export const ${planName} = [`;
  const arrayStart = plansText.indexOf(arrayAnchor);
  if (arrayStart === -1) { console.warn(`[${row.file}] could not find array "${planName}", skipping`); continue; }
  const bracketStart = plansText.indexOf('[', arrayStart);
  let depth = 1;
  let arrayEnd = bracketStart + 1;
  while (depth > 0 && arrayEnd < plansText.length) {
    if (plansText[arrayEnd] === '[') depth += 1;
    else if (plansText[arrayEnd] === ']') depth -= 1;
    arrayEnd += 1;
  }

  const dayAnchor = `day: '${day}'`;
  const dayStart = plansText.indexOf(dayAnchor, bracketStart);
  if (dayStart === -1 || dayStart > arrayEnd) { console.warn(`[${row.file}] could not find day "${day}", skipping`); continue; }
  const nextDayIdx = plansText.indexOf("day: '", dayStart + dayAnchor.length);
  const dayEnd = nextDayIdx === -1 || nextDayIdx > arrayEnd ? arrayEnd : nextDayIdx;

  const nameAnchor = `name: '${mealName.replace(/'/g, "\\'")}'`;
  const nameIdx = plansText.indexOf(nameAnchor, dayStart);
  if (nameIdx === -1 || nameIdx > dayEnd) { console.warn(`[${row.file}] could not find meal "${mealName}" on ${day}, skipping`); continue; }

  plansText = applyToObject(plansText, nameIdx, [['kcal', row.computedKcal], ['protein', row.computedProtein]]);
  plansFixed += 1;
}
fs.writeFileSync(PLANS_PATH, plansText);
console.log(`mealPlans.js: ${plansFixed}/${plansToFix.length} meals updated`);
