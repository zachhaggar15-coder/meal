// Listing and advertising assets for the product pages.
//
// Same visual language as the books and the site: cream ground, near-black ink,
// lime as a filled accent only, 1px black borders, the offset shadow, DM Sans.
// No retailer logo or brand-colour imitation appears anywhere in these.
//
// The page images embedded here are rasterised from the finished, QA-passed
// PDFs rather than mocked up, so the thing being advertised is the thing being
// sold. Square 2000x2000 suits most marketplace and social placements; the wide
// variant covers banner slots.

import { FONT_CSS } from './fonts.mjs';

const shell = (w, h, body) => `<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8"><style>
${FONT_CSS}
*,*::before,*::after{box-sizing:border-box}
html,body{margin:0;padding:0}
body{
  width:${w}px;height:${h}px;overflow:hidden;
  font-family:'DM Sans',-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;
  background:#f4f1e8;color:#12130d;
  -webkit-print-color-adjust:exact;print-color-adjust:exact;
}
.pad{padding:110px 110px;height:100%;position:relative}
.brand{font-size:26px;font-weight:700;letter-spacing:.28em;text-transform:uppercase}
.chip{
  display:inline-block;background:#caff2f;border:5px solid #12130d;border-radius:16px;
  box-shadow:10px 10px 0 #12130d;padding:16px 30px;font-size:30px;font-weight:700;
  letter-spacing:.1em;text-transform:uppercase;
}
h1{font-size:132px;line-height:.94;letter-spacing:-.035em;margin:44px 0 0;font-weight:700}
h1.sm{font-size:104px}
.sub{font-size:40px;line-height:1.32;font-weight:500;margin:36px 0 0;max-width:1500px}
.facts{display:flex;gap:0;border:5px solid #12130d;border-radius:22px;background:#fffdf4;
  box-shadow:10px 10px 0 #12130d;overflow:hidden;margin-top:56px}
.fact{flex:1;padding:30px 34px;border-left:4px solid #12130d}
.fact:first-child{border-left:0}
.fact .k{font-size:20px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#55504a}
.fact .v{font-size:44px;font-weight:700;line-height:1.06;margin-top:10px;letter-spacing:-.02em}
.shots{position:absolute;left:0;right:0;bottom:0;height:760px;overflow:hidden}
.shot{position:absolute;border:5px solid #12130d;border-radius:14px;box-shadow:16px 16px 0 #12130d;background:#fff}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:60px;margin-top:70px}
.cell{border:5px solid #12130d;border-radius:18px;background:#fffdf4;box-shadow:10px 10px 0 #12130d;overflow:hidden}
.cell img{display:block;width:100%;border-bottom:5px solid #12130d}
.cell .cap{padding:26px 30px;font-size:30px;font-weight:700}
.steps{margin-top:90px}
.step{display:flex;align-items:flex-start;gap:44px;margin-bottom:72px}
.num{flex:none;width:104px;height:104px;border:5px solid #12130d;border-radius:20px;background:#caff2f;
  box-shadow:8px 8px 0 #12130d;font-size:54px;font-weight:700;display:flex;align-items:center;justify-content:center}
.step .t{font-size:52px;font-weight:700;line-height:1.12;letter-spacing:-.02em}
.step .d{font-size:34px;line-height:1.4;color:#3a352c;margin-top:12px;max-width:1280px}
.foot{position:absolute;left:110px;right:110px;bottom:80px;display:flex;justify-content:space-between;
  align-items:center;font-size:26px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#55504a}
.rule{height:14px;background:#12130d;margin-bottom:44px}
.covers{display:flex;gap:40px;margin-top:64px;align-items:flex-end}
.band{display:flex;gap:36px;margin-top:70px}
.band .b{flex:1;border:5px solid #12130d;border-radius:18px;background:#fffdf4;box-shadow:10px 10px 0 #12130d;padding:30px 34px}
.band .b .t{font-size:34px;font-weight:700;letter-spacing:-.015em}
.band .b .d{font-size:25px;line-height:1.35;color:#3a352c;margin-top:10px}
.covers .c{flex:1;border:5px solid #12130d;border-radius:14px;box-shadow:12px 12px 0 #12130d;overflow:hidden;background:#fff}
.covers .c img{display:block;width:100%}
.note{font-size:24px;color:#55504a;margin-top:30px}
</style></head><body>${body}</body></html>`;

const facts = (items) =>
  `<div class="facts">${items.map((f) => `<div class="fact"><div class="k">${f.k}</div><div class="v">${f.v}</div></div>`).join('')}</div>`;

/** Main product image: what it is, who it is for, and two real pages. */
export const heroAsset = (book, shots) => shell(2000, 2000, `
  <div class="pad">
    <div class="rule"></div>
    <div class="brand">MealPrep.org.uk</div>
    <div style="margin-top:60px"><span class="chip">${book.store} &middot; ${book.planWord}</span></div>
    <h1>${book.adTitle}</h1>
    <p class="sub">${book.adSub}</p>
    ${facts(book.adFacts)}
    <div class="shots">
      <div class="shot" style="width:620px;left:150px;top:120px;transform:rotate(-4deg)"><img src="${shots[0]}" style="width:100%;display:block"></div>
      <div class="shot" style="width:620px;left:700px;top:60px;transform:rotate(3deg)"><img src="${shots[1]}" style="width:100%;display:block"></div>
      <div class="shot" style="width:620px;left:1250px;top:140px;transform:rotate(-2deg)"><img src="${shots[2]}" style="width:100%;display:block"></div>
    </div>
  </div>`);

/** Four real pages, captioned. The honest version of "what's inside". */
export const insideAsset = (book, shots) => shell(2000, 2000, `
  <div class="pad">
    <div class="rule"></div>
    <div class="brand">MealPrep.org.uk &middot; ${book.store}</div>
    <h1 class="sm">What is inside</h1>
    <div class="grid">
      ${shots.map((s) => `<div class="cell"><img src="${s.src}"><div class="cap">${s.cap}</div></div>`).join('')}
    </div>
    <p class="note">Real pages from the book. ${book.pageCount} pages, A4, printable in black and white.</p>
  </div>`);

/** The system in three steps - the actual proposition, with almost no text. */
export const systemAsset = (book) => shell(2000, 2000, `
  <div class="pad">
    <div class="rule"></div>
    <div class="brand">MealPrep.org.uk &middot; ${book.store} &middot; ${book.planWord}</div>
    <h1 class="sm">No more deciding<br>what is for dinner</h1>
    <div class="steps">
      <div class="step"><div class="num">1</div><div><div class="t">One shop a week</div>
        <div class="d">An aisle-by-aisle list, sized for two adults, generated from the meals rather than guessed at.</div></div></div>
      <div class="step"><div class="num">2</div><div><div class="t">One dinner a night, in about 30 minutes</div>
        <div class="d">Forty minutes at the very outside, timed from a cold kitchen. Never a Sunday lost to batch cooking.</div></div></div>
      <div class="step"><div class="num">3</div><div><div class="t">Tomorrow&rsquo;s lunch is already done</div>
        <div class="d">Each dinner makes four portions. Two go on the plate, two go in a tub while the pan is still dirty.</div></div></div>
    </div>
    <div class="foot"><span>Six weeks &middot; Two adults</span><span>${book.adFacts[1].v}</span></div>
  </div>`);

/** Wide banner for placements that are not square. */
export const bannerAsset = (book, shot) => shell(1600, 900, `
  <div class="pad" style="padding:80px 90px">
    <div class="rule" style="height:10px;margin-bottom:30px"></div>
    <div class="brand" style="font-size:20px">MealPrep.org.uk</div>
    <div style="display:flex;gap:60px;align-items:center;margin-top:36px">
      <div style="flex:1">
        <span class="chip" style="font-size:22px;padding:11px 22px;border-width:4px;box-shadow:7px 7px 0 #12130d">${book.store} &middot; ${book.planWord}</span>
        <h1 style="font-size:82px;margin-top:32px">${book.adTitle}</h1>
        <p class="sub" style="font-size:29px;margin-top:24px">${book.adSub}</p>
      </div>
      <div style="flex:none;width:420px"><div class="shot" style="position:static;transform:rotate(2.5deg)"><img src="${shot}" style="width:100%;display:block"></div></div>
    </div>
  </div>`);

/** All four books together. */
export const bundleAsset = (covers) => shell(2000, 2000, `
  <div class="pad">
    <div class="rule"></div>
    <div class="brand">MealPrep.org.uk</div>
    <h1 class="sm">Four six-week plans<br>for two adults</h1>
    <p class="sub">Aldi or Lidl, budget or high-protein. One weekly shop, a dinner a night in about half an hour, and tomorrow&rsquo;s lunch out of the same pan.</p>
    <div class="covers">${covers.map((c) => `<div class="c"><img src="${c}"></div>`).join('')}</div>
    <div class="band">
      <div class="b"><div class="t">42 days, decided</div><div class="d">Six week planners, six shopping lists, twenty-four dinners in each book.</div></div>
      <div class="b"><div class="t">Calculated, not guessed</div><div class="d">Every calorie worked out from weighed ingredients, and printed so you can check it.</div></div>
      <div class="b"><div class="t">Printable</div><div class="d">A4, readable in black and white, with a fridge sheet for the whole six weeks.</div></div>
    </div>
    <p class="note">Not affiliated with, or endorsed by, Aldi or Lidl.</p>
  </div>`);
