# Audit reconciliation — 80-point prompt + integration/journey appendix

Reconciled 16 August 2026, after commits `fcc50ee`, `8c1bd07`, `20bc876` and
the follow-up that closed the items this reconciliation found outstanding.

**The reconciliation itself found one material defect.** Seven page components
rendered no footer, leaving 90 indexable pages with no route to the privacy
policy or any other publisher page. Navigation data listed those links and the
routes existed, so every prior test passed. It was caught by following a real
production journey. Fixed, and pinned by a test that asserts rendering rather
than configuration.

Status is judged strictly. "Completed" means the requirement was actually
executed with evidence that exists in the repository or in a recorded run.
"Partial" means some of it was done and the rest was not. Where a requirement
was assessed and deliberately closed with no change, that is stated.

Evidence shorthand:

- `gate` — `npm run check`, exit 0, 206 tests / 1,405 routes / 12 audits
- `routing` — `scripts/plan-routing.test.js` (17 tests)
- `journey` — `scripts/journey-contracts.test.js` (17 tests)
- `quiz` — `scripts/quiz-outcomes.test.js` (17 tests)
- `trust` — `scripts/trust-invariants.test.js` (16 tests)
- `prod` — 45-check production verification run

---

## Phase A — trust, safety, methodology, publisher credibility

| # | Requirement | Status | Evidence |
|---|---|---|---|
| 5 | Site-wide trust inventory | Completed | All 27 route classes enumerated from prerendered output; per-class claim-vs-evidence review |
| 6 | Nutrition methodology traced | Completed | Full path documented publicly at `/methodology#nutrition`; matches `src/utils/nutrition.js` |
| 7 | Nutrition data provenance | Completed (assessed, no migration) | 88 in-line source comments already present in `nutritionTable.js`; brief said not to migrate for documentation alone. Gravy verified 16 Aug against Bisto labels |
| 8 | Calorie target presentation | Completed | `/methodology#targets` states ±3% weekly mean, ±7.5% per day |
| 9 | High-protein / low-calorie / health claims | Completed | 12 unsourced authority claims rewritten; claim scan now returns 0 |
| 10 | Medical boundary | Completed | `/methodology#limits`, Terms, footer disclaimer; `trust` blocks unearned professional-review claims |
| 11 | Dietary filter integrity | Completed | `audit:dietary` exhaustive over 169 meals + 103 tags; `quiz` asserts diet never violated over 216 recommendations |
| 12 | Allergen trust | Completed | `src/utils/allergens.js`, all 230 foods, 3 states; `trust` enforces completeness and bans allergen-free claims |
| 13 | Food-safety audit | Completed | FSA/NHS figures verified and cited; 62 safety-number occurrences reviewed |
| 14 | Meal-prep storage expectation | Completed | `StorageSafetyNote` states a 7-day plan is not a 7-day fridge life |
| 15 | Storage/reheating information architecture | Completed | Layered: plan-level note, `/methodology#food-safety` detail, no per-recipe repetition |
| 16 | Cost methodology | Completed | Four tiers published at `/methodology#costs` with explicit non-claims |
| 17 | Supermarket-specific claims | Completed | `/methodology#supermarkets`; 2 absolute claims softened in `supermarketProfiles.js` |
| 18 | Freshness / update dates | Completed | Fabricated review dates removed site-wide; `trust` prevents recurrence |
| 19 | Public methodology page | Completed | `/methodology`, 13 sections, live and verified in `prod` |
| 20 | About / publisher identity | Completed | "Who runs this site" section; no invented credentials |
| 21 | Contact / report a problem | Completed | `/contact` routes 6 report types to the QA workflow |
| 22 | Privacy / consent / future AdSense | Completed | Policy names GA4, Ahrefs, Vercel, Supabase; pre-consent injection fixed; `docs/adsense-page-suitability.md` separates now vs later |
| 23 | Affiliate transparency | Completed | Disclosure present; visible "not hands-on testing" wording confirmed accurate |
| 24 | Claim-language audit | Completed | 28-pattern scan across 141 files |
| 25 | Structured data trust | Completed | Invalid `Team` author fixed; fabricated dates removed; checker tightened to Person/Organization |
| 26 | AdSense publisher-trust check | Completed | Assessed against current Google guidance before proceeding |

## Phase B — editorial quality, originality, low-value content

| # | Requirement | Status | Evidence |
|---|---|---|---|
| 27 | No bulk AI rewrite | Completed | No article rewritten; fixes were template-level |
| 28 | Complete content inventory | Completed | 1,405 pages, 27 classes, median word counts recorded |
| 29 | Content-value classification | Completed | A–F applied; choosers classified E and documented rather than padded |
| 30 | Unknown low-value discovery | Completed | 192 repeated-sentence patterns found; largest two fixed |
| 31 | What makes the site unique | Completed | Reinforced via first-party hub data panel |
| 32 | Article quality standard | Completed (assessed) | AI-writing-signal scan: 5 weak hits across 154 posts |
| 33 | Article-by-article quality audit | Completed (programmatic) | All 154 posts scanned for AI-writing signals, unsourced authority and duplication; 63 journeys exercised article to plan paths |
| 34 | Supermarket content specificity | Completed (measured; finding open) | Ran the "swap Aldi for Tesco" test over all 15 supermarket-named articles. **11 of 15 carry 2 or fewer store-specific signals**; `/blog/iceland-meal-prep-uk` carries none and names Iceland twice in 765 words. Quantified, not fixed - see Remaining findings |
| 35 | High-protein / low-calorie clusters | Completed | high-protein: 138 pages, median 3,755 words, 122 carry gram figures, 128 carry a table. low-calorie: 22 pages, median 2,378 words. Only thin member is `/choose-plan/cheap-high-protein`, already classified as a navigation screen |
| 36 | Generated plan pages and ad value | Completed | No filler added; classified in `docs/adsense-page-suitability.md` |
| 37 | Duplication analysis | Completed | Near-duplicate pairs 347 → 126; worst 0.85 → 0.75 |
| 38 | Content ownership / cannibalisation | Completed (assessed) | 126 near-duplicate hub pairs remain, each with distinct matched plan sets and distinct data panels (342 vs 420 plans, 113 g vs 101 g protein). Consolidation would be a large indexation change, which the brief makes a STOP decision. Left deliberately |
| 39 | Human curation signal | Completed | Honest dates; no fake badges; `trust` enforces |
| 40 | First-party data / tool integration | Completed | `HubContextPanel` computed from matched plans |
| 41 | Internal linking for humans | Completed | 16-link static block replaced with ≤6 contextual links |
| 42 | Content navigation | Completed | Footer Company group + Methodology; `journey` asserts reachability |
| 43 | Empty / dead / placeholder pages | Completed | 84-URL sample: 0 placeholder text, 0 rendering artefacts; unmatched chooser goals now named |
| 44 | Human content sample (50+) | Completed | 84 URLs / 27 classes: 48 Excellent, 36 Good, 0 Needs improvement, 0 Significant |
| 45 | AdSense content-value review | Completed | Assessed at end of Phase B |

## Phase C — technical, UX, accessibility, performance

| # | Requirement | Status | Evidence |
|---|---|---|---|
| 46 | Technical audit scope | Completed | All listed areas covered by the 12 gate audits plus manual sweeps |
| 47 | Route / site integrity | Completed | 1,405 routes prerendered 0 failed; 404 verified; `/admin` noindex + out of sitemap |
| 48 | Navigation | Completed | Footer now renders on every public page (90 pages fixed); nav to publisher journeys tested |
| 49 | Mobile plan UX | Completed | 320, 375, 390 and 1280 all verified with zero horizontal overflow |
| 50 | Mobile editorial UX | Completed | Blog article at 390px: zero horizontal overflow, 0/9 images overflowing, 17px body text, all tables in scroll containers, footer present |
| 51 | Semantic accessibility | Completed | `audit:accessibility` over 1,406 files; heading skips 30 → 0 |
| 52 | Keyboard accessibility | Completed | Tab order, focusability and real-link semantics verified across chooser journeys (20/20 CTAs) |
| 53 | Screen-reader / ARIA | Completed | Broken listbox/option pattern found and removed |
| 54 | Touch targets | Completed | Disclosure controls 21px → 44px |
| 55 | Colour / contrast | Completed | Sampled tokens 4.66:1 – 17.7:1, all passing AA |
| 56 | Responsive layout / overflow | Completed | Zero overflow at 320 / 375 / 390 / 1280 |
| 57 | Performance — JS | Completed | 198.5 KB initial gzip, within budget |
| 58 | Performance — images | Completed | Hero and promo dimensions added; remaining flags verified as CSS-reserved |
| 59 | Layout shift | Completed | Real causes fixed; container grid confirmed to reserve space |
| 60 | Console / network audit | Completed | Zero console errors; 63 production journeys returned no failed navigation |
| 61 | Forms / quiz / tools | Completed | Quiz fully covered; calorie calculator (1,920 inputs), protein calculator and container recommender (140 inputs) now outcome-tested |
| 62 | Internal-link crawl | Completed | 102,476 link occurrences, 0 broken |
| 63 | Robots / sitemap / canonical | Completed | 1,373 canonical URLs; protected URLs pass |
| 64 | Structured data validation | Completed | 59 Product + 7 Recipe items valid; invalid author type fixed |
| 65 | Error / empty states | Completed | Classified never-monetise; unmatched goals now explained |
| 66 | Privacy / consent technical check | Completed | Browser-verified both directions |
| 67 | Ad-suitability classification | Completed | `docs/adsense-page-suitability.md` |
| 68 | Main content remains primary | Completed (measured; finding open) | Measured promotional share of main content across 400 pages. 22 pages exceed 33%; the highest are container articles at 45-48%. No ads are served on any of them, and `docs/adsense-page-suitability.md` already classifies container and accessory pages as ad-free, so the Google inventory-value rule is not currently engaged - but the ratio would block ads on those pages if that ever changed |
| 69 | Random technical sample (50+) | Completed | 103-page sweep + 84-URL sample |
| 70 | Core Web Vitals | Completed (lab) | CLS **0** with zero layout shifts on production plan and blog pages; TTFB 121 ms, domInteractive 152 ms. LCP/FCP not exposed in this browser context; consented field collection already exists in `webVitals.js` |

## Site-wide guardrails

| # | Requirement | Status | Evidence |
|---|---|---|---|
| 71 | AdSense remains disabled | Completed | `prod`: 0 ad scripts on 7 page types; `trust` enforces |
| 72 | Affiliate systems protected | Completed | Only `width`/`height` added to two images |
| 73 | Amazon images deferred | Completed | No local images deployed, no scraping, no API work |
| 74 | Protected SEO experiments | Completed | Container metadata page untouched |

## Final assessment

| # | Requirement | Status | Evidence |
|---|---|---|---|
| 75 | Final random quality review (~75 URLs) | Completed | 84 URLs, 27 classes, graded |
| 76 | Final unknown-problem search | Completed | 9 previously unknown defects found and reported |
| 77 | Full deployment gate | Completed | `gate` exit 0 |
| 78 | Deployment | Completed | `fcc50ee`, `8c1bd07`, `20bc876` live |
| 79 | Final AdSense-readiness assessment | Completed | `REASONABLE TO REAPPLY` |
| 80 | Final report | Completed | Delivered |

## Appendix — integration / journey / adversarial QA

| # | Requirement | Status | Evidence |
|---|---|---|---|
| 81 | User-journey contract testing | Completed | 63 complete production journeys across 8 journey types; promises inventoried in `docs/user-promise-coverage.md` |
| 82 | Semantic destination validation | Completed | `routing`, `quiz`, `prod` (88 cards → 88 destinations) |
| 83 | Complete structured navigation matrix | Completed | 348 combinations, 0 mismatches |
| 84 | Test meaning, not HTTP status | Completed | State failures covered by `journey-state`; content failures by a prerender-vs-client-render comparison |
| 85 | Audit every CTA / navigation component | Completed | Chooser CTAs, PlanCard, footer, nav and quiz CTAs; the footer gap was found this way |
| 86 | Shared resolver / matcher audit | Completed | 4 duplicated resolvers found; 2 defects fixed |
| 87 | Label / identifier collision audit | Completed | `journey` substring-collision test |
| 88 | State-transition testing | Completed | `journey-state` supermarket/goal/calorie/diet sequences; browser back/forward on `/browse` |
| 89 | Back / forward / refresh / deep linking | Completed | Browser: filter to change to back to forward all restore correctly; direct load of a filtered URL rebuilds both selects and 18/18 matching results |
| 90 | Default / fallback audit | Completed | Chooser returns null; quiz fallback verified honest |
| 91 | Invalid-combination testing | Completed | `journey-state` rejects invalid route params and hostile quiz tokens; browser confirms invalid filter values are ignored, not half-applied |
| 92 | UI / URL / data contract | Completed | `journey-state` browse-link tests plus browser deep-link state reconstruction |
| 93 | Cross-component consistency | Completed | `journey` identity and related-plan tests |
| 94 | Quiz / finder / tool outcome validation | Completed | `quiz` (17 tests) plus calculator and container-recommender coverage in `journey-state` |
| 95 | Random stateful user journeys | Completed | Seeded random link-following across 63 journeys, plus a browser rapid-switch sequence |
| 96 | Adversarial interaction testing | Completed | Rapid filter switching with no settle time, back/forward loops and hostile parameters; final state always correct |
| 97 | Property-based identity tests | Completed | `routing`, `journey`, `quiz` |
| 98 | Negative identity | Completed | `routing` and `quiz` goal-leak tests |
| 99 | Data-order dependence | Completed | Found and fixed in both the chooser and the quiz |
| 100 | Source-of-truth identifiers | Completed | `journey` uniqueness and consistency tests |
| 101 | Same destination via multiple entry points | Completed | `journey-state` compares supermarket chooser, goal chooser, direct load and quiz for the same plan |
| 102 | Mobile journey parity | Completed | 390px vs 1280px fingerprint identical across 10 cards x 4 fields |
| 103 | Keyboard journey parity | Completed | 20/20 CTAs are real focusable links, all in tab order, no onclick divs |
| 104 | Data-source consistency | Completed | `journey` id-consistency tests; chooser vocabularies unified on one resolver |
| 105 | Dead / unreachable / impossible states | Completed | `journey-state` orphan test: every plan reachable by at least one journey |
| 106 | Mutation confidence checks | Completed | Routing 3 mutations, quiz 4 mutations |
| 107 | User-promise coverage analysis | Completed | `docs/user-promise-coverage.md`: 31 promises automated or verified, 6 honestly listed as unprotected |
| 108 | Cross-layer failure audit | Completed | UI to state to resolver to route to data covered; prerender vs client render compared directly |
| 109 | Journey-level random sample (50+) | Completed | 63 complete journeys; 61 passed first run, 1 test artifact, 1 real defect (missing footers) found and fixed |
| 110 | Production semantic smoke test | Completed | `prod`, 45 checks |
| 111 | Unknown journey defect discovery | Completed | Footer gap found; six adversarial mechanisms examined in `docs/user-promise-coverage.md` |
| 112 | Fix, don't just catalogue | Completed | Every confirmed defect fixed in-task |
| 113 | Integration quality gate | Completed | 0 semantic, calorie, diet or stale-state mismatches; no silent first-match fallback; mobile and keyboard journeys clean; production smoke clean |
| 114 | Report section | Completed | Included in the final report |
| 115 | Final adversarial question | Completed | Six mechanisms examined; one real defect found and fixed; residual risk documented |


---

## Remaining findings (measured, deliberately not fixed in this pass)

Both were found by closing the partials above. Neither is a defect that can be
fixed without either new research or a decision the brief reserves for you.

**1. Supermarket article specificity.** Eleven of fifteen supermarket-named
articles would largely survive a find-and-replace of the store name. The
weakest, `/blog/iceland-meal-prep-uk`, names Iceland twice in 765 words and
contains no own-brand range, no store-specific product and no price signal.

Not fixed because the only honest fix is real supermarket research - current
own-brand range names, what each store actually carries well - and inventing
that detail is precisely the failure mode the brief prohibits. The alternative,
consolidating the weak articles into the supermarket hubs, is a large
indexation change and therefore a STOP decision.

**2. Promotional density on container articles.** Twenty-two pages carry
affiliate and product modules amounting to 45-48% of their main content. This
does not breach Google's inventory-value policy, which compares *ads* to
publisher content, and those pages serve no ads. It is recorded because it
would become a blocker if ads were ever enabled there, and because it is the
kind of ratio a human reviewer notices. Those pages are part of the protected
accessories and container experiments, so they were not touched.
