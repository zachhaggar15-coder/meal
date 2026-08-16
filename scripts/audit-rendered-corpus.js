// Scans the built site for the classes of defect that only show up in the
// rendered output.
//
// The earlier passes checked source data. That misses anything produced by
// interpolation, template assembly or component composition — which is where
// generated grammar breaks and where two implementations of the same page class
// drift apart. This reads dist/ and reports:
//
//   strong-claims   unsupported research / superlative / health-outcome language
//   temporal        volatile retailer facts stated as current
//   grammar         a/an, doubled words, broken interpolation, empty slots
//
// Non-blocking by default; --strict makes any finding exit 1.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const STRICT = process.argv.includes('--strict');

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name === 'index.html') files.push(full);
  }
  return files;
}

/** Visible body text, with script/style/head stripped. */
export function visibleText(html) {
  const body = html.replace(/^[\s\S]*?<body[^>]*>/i, '').replace(/<\/body>[\s\S]*$/i, '');
  return body
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&rsquo;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

// ── Strong claims ───────────────────────────────────────────────────────────
// Language asserting evidence, superiority or a health outcome. Each pattern
// describes a claim the site would have to be able to support.
export const STRONG_CLAIM_PATTERNS = [
  { id: 'studies-show', re: /\b(?:studies|research|trials?|evidence)\s+(?:show|shows|prove[sd]?|demonstrate[sd]?|confirm[sd]?)\b/i },
  { id: 'clinical', re: /\bclinical(?:ly)?\s+(?:trial|proven|tested|shown)\b/i },
  { id: 'proven', re: /\b(?:scientifically|clinically|medically)?\s*proven\b/i },
  { id: 'superlative-effect', re: /\bthe (?:most|single most) (?:effective|powerful|important|proven)\b/i },
  { id: 'guaranteed-outcome', re: /\b(?:guarantee[sd]?|will (?:definitely|certainly))\s+(?:you\s+)?(?:lose|gain|burn|drop)\b/i },
  { id: 'health-outcome', re: /\b(?:prevents?|cures?|treats?|reverses?|eliminates?)\s+(?:disease|diabetes|cancer|illness|obesity)\b/i },
  { id: 'prescriptive-nutrition', re: /\byou (?:must|need to|have to) eat\b/i },
  { id: 'boosts-metabolism', re: /\b(?:boosts?|speeds? up|increases?)\s+(?:your\s+)?metabolism\b/i },
  { id: 'detox', re: /\bdetox(?:es|ify|ifying)?\b/i },
  { id: 'cheapest-absolute', re: /\b(?:is|are) the cheapest\b(?! (?:of|in) )/i },
  { id: 'best-absolute', re: /\bis the best (?:supermarket|option|choice|product|container)\b/i },
];

// Hedged or attributed phrasing that makes a strong-sounding line acceptable.
const CLAIM_SOFTENERS = /\b(?:commonly|typically|generally|often|may|can|tends? to|on the basis that|varies from person to person|not medical advice|indicative|broadly)\b/i;

// ── Temporal / volatile retailer facts ──────────────────────────────────────
export const TEMPORAL_PATTERNS = [
  { id: 'current-price', re: /\b(?:currently|right now|at the moment|this week)\s+(?:costs?|priced|sells? for|£)/i },
  { id: 'loyalty-scheme', re: /\b(?:Clubcard|Nectar|Asda Rewards|More Card|Lidl Plus|My Morrisons)\b/ },
  { id: 'named-range', re: /\b(?:Super 6|Specialbuys?|Taste the Difference|The Best|Finest|Good For You|Healthy Living|Brooklea|Market Street|Slimming World)\b/ },
  { id: 'availability', re: /\b(?:in stock|currently stocks?|now stocks?|has just launched|newly launched)\b/i },
  { id: 'pack-size-absolute', re: /\bcomes? in (?:a )?\d+\s?(?:g|kg|ml|l|pack)\b/i },
];

// Phrasing that already tells the reader the fact is changeable.
const TEMPORAL_HEDGES = /\b(?:check|varies|vary|may (?:change|differ|not)|can change|at the time of writing|snapshot|rotates?|rotating|subject to|where (?:available|stocked)|when stocked|if stocked|availability)\b/i;

// ── Generated grammar ───────────────────────────────────────────────────────
export const GRAMMAR_PATTERNS = [
  { id: 'article-a-vowel', re: /\ba (?=(?:Aldi|Asda|Iceland|Ocado|M&S|hour|honest|apple|orange|egg|extra|item|option|8|11|18)\b)/ },
  { id: 'article-an-consonant', re: /\ban (?=(?:Tesco|Lidl|Waitrose|Morrisons|Co-op|Sainsbury|meal|plan|day|week|budget|one)\b)/ },
  { id: 'doubled-word', re: /\b([A-Za-z]{3,})\s+\1\b(?!\s*\1)/ },
  { id: 'broken-interpolation', re: /\$\{[^}]*\}|\{\{[^}]*\}\}|\[object Object\]|undefined|NaN(?![a-z])/ },
  { id: 'empty-placeholder', re: /\b(?:TBC|TODO|FIXME|Lorem ipsum|XXX)\b/ },
  { id: 'malformed-punctuation', re: /\s[,.;:]\s|[,.]{2,}(?!\.)|\s\)|\(\s/ },
  { id: 'double-space-sentence', re: /\b(?:a|an|the)\s+(?:a|an|the)\b/i },
];

// "that that", "had had" are valid English; so is a doubled proper noun in a
// list. Restrict the doubled-word rule to the same-case repeats that indicate a
// templating slip.
const DOUBLED_ALLOWED = /\b(?:that that|had had|is is|new new)\b/i;

function classify(text, patterns, hedge) {
  const hits = [];
  for (const { id, re } of patterns) {
    const match = re.exec(text);
    if (!match) continue;
    const start = Math.max(0, match.index - 90);
    const context = text.slice(start, match.index + match[0].length + 90);
    if (id === 'doubled-word' && DOUBLED_ALLOWED.test(match[0])) continue;
    if (hedge && hedge.test(context)) continue;
    hits.push({ id, matched: match[0].trim(), context: context.trim() });
  }
  return hits;
}

// Only run the scan when invoked directly; rendered-grammar.test.js imports
// visibleText from here and must not trigger a full corpus pass on import.
const RUN_DIRECTLY = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (RUN_DIRECTLY) {
if (!fs.existsSync(DIST)) {
  console.error('audit-rendered-corpus: no dist/. Build first.');
  process.exit(1);
}

const pages = walk(DIST);
const report = { pages: pages.length, strongClaims: [], temporal: [], grammar: [] };

for (const page of pages) {
  const route = `/${path.relative(DIST, page).split(path.sep).join('/').replace(/index\.html$/, '')}`;
  const text = visibleText(fs.readFileSync(page, 'utf8'));
  if (!text) continue;

  for (const hit of classify(text, STRONG_CLAIM_PATTERNS, CLAIM_SOFTENERS)) {
    report.strongClaims.push({ route, ...hit });
  }
  for (const hit of classify(text, TEMPORAL_PATTERNS, TEMPORAL_HEDGES)) {
    report.temporal.push({ route, ...hit });
  }
  for (const hit of classify(text, GRAMMAR_PATTERNS, null)) {
    report.grammar.push({ route, ...hit });
  }
}

const OUT = path.join(ROOT, 'audit-artifacts', 'rendered-corpus.json');
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(report, null, 2));

const summarise = (label, rows) => {
  const byId = rows.reduce((acc, row) => { acc[row.id] = (acc[row.id] || 0) + 1; return acc; }, {});
  const detail = Object.entries(byId).sort((a, b) => b[1] - a[1])
    .map(([id, n]) => `${id}=${n}`).join(', ');
  console.log(`${label}: ${rows.length}${detail ? ` (${detail})` : ''}`);
};

console.log(`Rendered corpus audit: ${report.pages} pages.`);
summarise('  strong claims', report.strongClaims);
summarise('  temporal/volatile', report.temporal);
summarise('  grammar', report.grammar);
console.log(`Report: ${OUT}`);

const total = report.strongClaims.length + report.temporal.length + report.grammar.length;
if (STRICT && total > 0) process.exit(1);
}
