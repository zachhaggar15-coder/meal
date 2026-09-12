// Print stylesheet for the MealPrep.org.uk six-week supermarket planners.
//
// The design language is the website's, not a new one: cream, near-black, the
// lime accent, 1px black borders, the hard offset shadow, DM Sans throughout
// including headings (src/index.css sets h1-h4 to --font-sans, so no serif).
//
// Two deliberate departures, both because this is paper rather than a screen:
//
//   1. The page is white, not cream. The site's --bg on every A4 sheet is a
//      full-bleed flood of ink on a home printer. Cream survives as the panel
//      fill (--card and --bg), which is where it does the work anyway.
//   2. The offset shadow is 3px, not 6px. At A4 scale 6px reads as a printing
//      misregistration rather than a design decision.
//
// Everything else is chosen so the page still works printed in greyscale: lime
// only ever appears as a fill behind near-black text, never as text itself, so
// a mono printer renders it as a pale grey block and nothing becomes illegible.

import { FONT_CSS } from './fonts.mjs';

// Inlined rather than linked: headless Chrome cannot reach the Google Fonts CDN
// in this environment, and a stylesheet that never resolves stalls the render.
export const FONT_LINK = `<style>${FONT_CSS}</style>`;

export const pageRule = (kind) =>
  kind === 'bleed'
    ? '@page { size: A4; margin: 0; }'
    : '@page { size: A4; margin: 15mm 14mm 18mm 14mm; }';

export const baseCss = `
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  font-family: 'DM Sans', -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif;
  font-size: 9.2pt;
  line-height: 1.45;
  color: var(--text);
  background: #fff;
}

:root {
  --bg: #f4f1e8;
  --card: #fffdf4;
  --text: #12130d;
  --muted: #55504a;
  --accent: #caff2f;
  --border: #12130d;
  --hair: #cdc9bc;
}

h1, h2, h3, h4, h5 { font-family: inherit; color: var(--text); margin: 0; font-weight: 700; letter-spacing: -.015em; }
p { margin: 0 0 5pt; }
p:last-child { margin-bottom: 0; }
strong, b { font-weight: 700; }
a { color: var(--text); text-decoration: none; }

/* ── page furniture ──────────────────────────────────────────────────── */
.part { break-after: page; }
.part:last-child { break-after: auto; }
.newpage { break-before: page; }
.keep { break-inside: avoid; }

.page-head {
  display: table; width: 100%; border-bottom: 1.4pt solid var(--border);
  padding-bottom: 4pt; margin-bottom: 9pt;
}
.page-head .ph-l, .page-head .ph-r { display: table-cell; vertical-align: bottom; }
.page-head .ph-r { text-align: right; }
.page-head h1 { font-size: 21pt; line-height: 1.02; }
.page-head .kicker {
  font-size: 6.8pt; font-weight: 700; letter-spacing: .16em; text-transform: uppercase;
  color: var(--muted); margin-bottom: 3pt;
}
.page-head .ph-r .tag {
  display: inline-block; background: var(--accent); border: 1pt solid var(--border);
  border-radius: 4px; padding: 2.5pt 6pt; font-size: 7pt; font-weight: 700;
  letter-spacing: .08em; text-transform: uppercase;
}

.lede { font-size: 10pt; line-height: 1.42; margin: 0 0 9pt; max-width: 152mm; }
.small { font-size: 7.8pt; line-height: 1.42; color: var(--muted); }
.tiny  { font-size: 6.8pt; line-height: 1.38; color: var(--muted); }

/* ── cover ───────────────────────────────────────────────────────────── */
.cover {
  width: 210mm; height: 297mm; position: relative; overflow: hidden;
  background: var(--bg); padding: 20mm 18mm;
}
.cover-rule { height: 3.5pt; background: var(--border); margin-bottom: 7mm; }
.cover-brand {
  font-size: 8.5pt; font-weight: 700; letter-spacing: .26em; text-transform: uppercase;
}
.cover-store {
  display: inline-block; margin-top: 40mm; background: var(--accent);
  border: 1.6pt solid var(--border); border-radius: 6px; box-shadow: 3px 3px 0 var(--border);
  padding: 5pt 11pt; font-size: 11pt; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
}
.cover h1 { font-size: 52pt; line-height: .97; letter-spacing: -.035em; margin: 9mm 0 0; max-width: 160mm; }
.cover .sub { font-size: 14pt; line-height: 1.32; margin: 7mm 0 0; max-width: 132mm; font-weight: 500; }

/* The week strip. Without it the cover has a dead band between the subtitle and
   the facts bar; with it, the format of the book is legible before it is opened. */
.cover-strip { margin-top: 16mm; display: table; table-layout: fixed; width: 128mm; }
.cover-day {
  display: table-cell; text-align: center; padding-right: 2.6mm;
}
.cover-day .b {
  border: 1.4pt solid var(--border); border-radius: 5px; background: #fff;
  padding: 4.5pt 0 4pt; font-size: 8pt; font-weight: 700; letter-spacing: .04em;
}
.cover-day.on .b { background: var(--accent); }
.cover-strip-note { font-size: 9.5pt; font-weight: 500; margin-top: 5mm; max-width: 128mm; }
.cover-facts {
  position: absolute; left: 18mm; right: 18mm; bottom: 18mm;
  display: table; width: calc(100% - 36mm); table-layout: fixed;
  border: 1.6pt solid var(--border); border-radius: 8px; background: var(--card);
  box-shadow: 3px 3px 0 var(--border); overflow: hidden;
}
.cover-fact { display: table-cell; padding: 7pt 8pt; border-left: 1pt solid var(--border); vertical-align: top; }
.cover-fact:first-child { border-left: 0; }
.cover-fact .k { font-size: 6.4pt; font-weight: 700; letter-spacing: .13em; text-transform: uppercase; color: var(--muted); }
.cover-fact .v { font-size: 12.5pt; font-weight: 700; line-height: 1.1; margin-top: 2pt; letter-spacing: -.02em; }

/* ── cards, panels, callouts ─────────────────────────────────────────── */
.card {
  border: 1pt solid var(--border); border-radius: 8px; background: var(--card);
  padding: 8pt 10pt; margin: 0 0 8pt; break-inside: avoid;
}
.card.shadow { box-shadow: 3px 3px 0 var(--border); }
.card h4 { font-size: 10pt; margin-bottom: 3.5pt; }

.strip {
  background: var(--accent); border: 1pt solid var(--border); border-radius: 6px;
  padding: 4pt 8pt; font-size: 7.4pt; font-weight: 700; letter-spacing: .12em;
  text-transform: uppercase; margin: 0 0 6pt; break-after: avoid;
}

.callout {
  border: 1pt solid var(--border); border-radius: 8px; background: var(--bg);
  padding: 7pt 9pt; margin: 8pt 0; break-inside: avoid;
}
.callout .k {
  display: inline-block; background: var(--accent); border: 1pt solid var(--border);
  border-radius: 4px; padding: 1.5pt 5pt; font-size: 6.4pt; font-weight: 700;
  letter-spacing: .12em; text-transform: uppercase; margin-bottom: 4pt;
}
.callout p { font-size: 8.1pt; }

/* ── lists ───────────────────────────────────────────────────────────── */
.bullets { margin: 0 0 5pt; padding: 0; list-style: none; }
.bullets li { font-size: 8.5pt; line-height: 1.42; padding: 0 0 3.5pt 6.5mm; position: relative; }
.bullets li::before {
  content: ''; position: absolute; left: 1.8mm; top: 4.2pt;
  width: 4pt; height: 4pt; background: var(--border);
}
.numlist { margin: 0 0 5pt; padding: 0; list-style: none; counter-reset: n; }
.numlist li { font-size: 8.5pt; line-height: 1.42; padding: 0 0 5pt 8.5mm; position: relative; break-inside: avoid; }
.numlist li::before {
  counter-increment: n; content: counter(n);
  position: absolute; left: 0; top: -.5pt; width: 5.6mm; height: 5.6mm; line-height: 5.6mm;
  text-align: center; font-size: 7.4pt; font-weight: 700;
  background: var(--accent); border: 1pt solid var(--border); border-radius: 3px;
}
.numlist li b { display: block; font-size: 8.8pt; margin-bottom: .5pt; }

/* ── tables ──────────────────────────────────────────────────────────── */
table { width: 100%; border-collapse: collapse; }
.tbl { font-size: 8pt; }
.tbl th {
  text-align: left; font-size: 6.6pt; font-weight: 700; letter-spacing: .13em;
  text-transform: uppercase; background: var(--accent);
  border: 1pt solid var(--border); padding: 4pt 5pt;
}
.tbl td { padding: 4.5pt 5pt; border: 1pt solid var(--hair); vertical-align: top; }
.tbl tr { break-inside: avoid; }
.tbl td.lead { font-weight: 700; }

/* ── the week planner grid ───────────────────────────────────────────── */
.planner { font-size: 8pt; table-layout: fixed; }
.planner th {
  font-size: 6.6pt; font-weight: 700; letter-spacing: .13em; text-transform: uppercase;
  background: var(--accent); border: 1pt solid var(--border); padding: 4pt 5pt; text-align: left;
}
.planner td { border: 1pt solid var(--border); padding: 5pt 5.5pt; vertical-align: top; }
.planner .day {
  width: 15mm; font-weight: 700; font-size: 8.6pt; background: var(--bg);
  letter-spacing: -.01em;
}
.planner .day span { display: block; font-size: 6.2pt; font-weight: 500; color: var(--muted); letter-spacing: .06em; text-transform: uppercase; }
.planner .dish { font-weight: 700; }
.planner .meta { display: block; font-size: 6.6pt; font-weight: 400; color: var(--muted); margin-top: 1.5pt; }
.planner .box {
  width: 8mm; text-align: center; vertical-align: middle; background: var(--card);
}
.planner .box::after {
  content: ''; display: inline-block; width: 8pt; height: 8pt;
  border: 1pt solid var(--border); border-radius: 2px;
}
.planner tr.weekend .day { background: var(--accent); }
.planner .tot { text-align: center; font-weight: 700; font-size: 9pt; background: var(--card); }
.planner .tot .meta { display: block; font-size: 5.8pt; font-weight: 500; letter-spacing: .08em; text-transform: uppercase; }
.everyday {
  margin-top: 5pt; border: 1pt solid var(--border); border-radius: 6px;
  background: var(--accent); padding: 4.5pt 8pt; font-size: 8.2pt;
}

/* ── shopping list ───────────────────────────────────────────────────── */
.aisles { column-count: 2; column-gap: 8mm; }
.aisle { break-inside: avoid; margin-bottom: 7pt; }
.aisle h4 {
  font-size: 6.8pt; font-weight: 700; letter-spacing: .13em; text-transform: uppercase;
  background: var(--accent); border: 1pt solid var(--border); border-radius: 4px;
  padding: 2.5pt 5pt; margin-bottom: 3.5pt;
}
.aisle ul { list-style: none; margin: 0; padding: 0; }
.aisle li {
  font-size: 7.9pt; line-height: 1.32; padding: 2.6pt 0 2.6pt 11pt; position: relative;
  border-bottom: .5pt solid var(--hair);
}
.aisle li:last-child { border-bottom: 0; }
.aisle li::before {
  content: ''; position: absolute; left: 0; top: 3.4pt;
  width: 7pt; height: 7pt; border: 1pt solid var(--border); border-radius: 2px;
}
.aisle .q { font-weight: 700; }
.aisle .note { display: block; font-size: 6.5pt; color: var(--muted); line-height: 1.25; }

/* ── recipe cards, two to a page ─────────────────────────────────────── */
.rgrid { margin: 0; }
.recipe {
  border: 1pt solid var(--border); border-radius: 8px; overflow: hidden;
  margin-bottom: 7pt; break-inside: avoid; background: #fff;
}
.recipe-top { background: var(--card); border-bottom: 1pt solid var(--border); padding: 6pt 9pt; }
.recipe-top h3 { font-size: 13pt; line-height: 1.08; }
.recipe-top .tagline { font-size: 7.6pt; line-height: 1.35; color: var(--muted); margin-top: 2pt; }
.rmeta { margin-top: 4pt; }
.rmeta span {
  display: inline-block; background: var(--accent); border: 1pt solid var(--border);
  border-radius: 3px; padding: 1.5pt 4.5pt; font-size: 6.3pt; font-weight: 700;
  letter-spacing: .09em; text-transform: uppercase; margin-right: 3pt;
}
.rbody { display: table; width: 100%; table-layout: fixed; }
.rcol-i { display: table-cell; width: 34%; padding: 7pt 8pt; border-right: 1pt solid var(--hair); vertical-align: top; }
.rcol-m { display: table-cell; width: 66%; padding: 7pt 9pt; vertical-align: top; }
.rcol-i h5, .rcol-m h5 {
  font-size: 6.3pt; font-weight: 700; letter-spacing: .14em; text-transform: uppercase;
  color: var(--muted); margin: 0 0 3.5pt;
}
.ing { list-style: none; margin: 0; padding: 0; }
.ing li { font-size: 7.7pt; line-height: 1.3; padding: 1.6pt 0; border-bottom: .5pt solid var(--hair); }
.ing li:last-child { border-bottom: 0; }
.ing .q { font-weight: 700; }
.steps { list-style: none; counter-reset: s; margin: 0; padding: 0; }
.steps li { font-size: 7.9pt; line-height: 1.38; position: relative; padding: 0 0 3.5pt 6.5mm; }
.steps li::before {
  counter-increment: s; content: counter(s) '.';
  position: absolute; left: 0; top: 0; font-weight: 700; font-size: 7.9pt;
}
.rfoot {
  border-top: 1pt solid var(--hair); padding: 5pt 9pt; background: var(--bg);
  display: table; width: 100%; table-layout: fixed;
}
.rfoot .macros { display: table-cell; width: 46%; vertical-align: top; }
.rfoot .macros b { font-size: 8.4pt; }
.rfoot .macros .k { font-size: 6.2pt; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); }
.rfoot .note { display: table-cell; width: 54%; vertical-align: top; font-size: 7pt; line-height: 1.35; padding-left: 7pt; }
.rfoot .note b { font-size: 6.2pt; letter-spacing: .11em; text-transform: uppercase; }

/* ── contents ────────────────────────────────────────────────────────── */
.toc-row {
  display: table; width: 100%; border-bottom: .75pt solid var(--hair);
  padding: 4.5pt 0; break-inside: avoid;
}
.toc-t { display: table-cell; vertical-align: baseline; }
.toc-t .lbl { font-size: 9.6pt; font-weight: 700; }
.toc-t .sub { font-size: 7.2pt; color: var(--muted); margin-top: .5pt; }
.toc-p {
  display: table-cell; text-align: right; width: 12mm; vertical-align: baseline;
  font-size: 9.6pt; font-weight: 700;
}

/* ── blank planner / fridge sheet ────────────────────────────────────── */
.blank td { height: 13.5mm; }
/* The six-week fridge sheet: 42 dish names on one page, so the type is small by
   necessity. 6pt is the floor - below that it stops being readable when printed. */
.planner.fridge td.mini { font-size: 6.2pt; line-height: 1.2; padding: 3pt 3pt; vertical-align: top; }
.planner.fridge th { font-size: 6pt; }
.planner.fridge .day { width: 11mm; font-size: 7.5pt; }
.blank .day { background: var(--bg); }
.writeline { border-bottom: .75pt solid var(--hair); height: 9mm; }

.twocol { column-count: 2; column-gap: 8mm; }
.twocol > * { break-inside: avoid; }
`;
