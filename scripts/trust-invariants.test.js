// Regression protection for the publisher-trust work.
//
// These are structural invariants, not opinions about wording: each one
// encodes a defect that was actually found on the live site and must not be
// able to return silently.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { NUTRITION_TABLE } from '../src/data/nutritionTable.js';
import {
  ALLERGEN_KEYS,
  allergensForCanonicalKey,
  isCanonicalKeyClassified,
  mergeAllergenSummaries,
  resolveAllergens,
} from '../src/utils/allergens.js';
import { formatContentDate, schemaDates, toIsoDate } from '../src/utils/contentDates.js';
import { isMonetisableRoute } from '../src/utils/adPlacement.js';
import { getAllPlanMeta, getPlanBySlug } from '../src/utils/planBuilder.js';
import { mealPlansData } from '../src/data/mealPlans.js';
import { computeMealNutritionRaw, splitIngredientText } from '../src/utils/nutrition.js';
import { MEALS } from '../src/data/mealLibrary.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');

// ── Allergens ────────────────────────────────────────────────────────────────

test('every canonical food has an explicit allergen decision', () => {
  const unclassified = Object.keys(NUTRITION_TABLE).filter(key => !isCanonicalKeyClassified(key));
  assert.deepEqual(
    unclassified,
    [],
    'A new nutrition record was added without recording its allergens. Add it to '
    + 'FOOD_ALLERGENS in src/utils/allergens.js — an empty object means "checked, '
    + 'none identified" and is a valid answer.',
  );
});

test('allergen decisions only use the 14 legally regulated allergen keys', () => {
  const invalid = [];
  for (const key of Object.keys(NUTRITION_TABLE)) {
    const record = allergensForCanonicalKey(key) || {};
    for (const allergen of [...(record.contains || []), ...(record.varies || [])]) {
      if (!ALLERGEN_KEYS.includes(allergen)) invalid.push(`${key} → ${allergen}`);
    }
  }
  assert.deepEqual(invalid, []);
});

test('an allergen is never reported as both present and "check the label"', () => {
  const summary = mergeAllergenSummaries([
    { present: ['milk'], varies: [], unclassified: [] },
    { present: [], varies: ['milk', 'soya'], unclassified: [] },
  ]);
  assert.deepEqual(summary.present, ['milk']);
  assert.deepEqual(summary.varies, ['soya']);
});

test('every generated plan resolves its allergens with nothing left unclassified', () => {
  const failures = [];
  for (const meta of getAllPlanMeta()) {
    const plan = getPlanBySlug(meta.slug);
    if (!plan) continue;
    const summary = mergeAllergenSummaries(
      (plan.plan || []).flatMap(day => (day.meals || []).map(meal => (
        resolveAllergens(meal.ingredients || [])
      ))),
    );
    if (summary.unclassified.length) {
      failures.push(`${meta.slug}: ${summary.unclassified.join(' | ')}`);
    }
  }
  assert.deepEqual(failures.slice(0, 10), []);
});

test('every ingredient name in the shared library resolves to nutrition data', () => {
  // An ingredient name is a lookup key, not just a label. Tidying "Turkey
  // breast slices" to "Cooked turkey breast slices" — a change that reads as
  // purely editorial — silently dropped the nutrition table's match and took
  // ten plans' calories for that meal to zero. Nothing failed loudly: the
  // totals were still numbers, just smaller.
  //
  // The allergen invariant above caught it, but only obliquely. This says what
  // actually broke, straight away.
  const failures = [];
  for (const meal of MEALS) {
    const { unmatched } = computeMealNutritionRaw(meal.ingredients || []);
    if (unmatched.length) failures.push(`${meal.id}: ${unmatched.join(' | ')}`);
  }
  assert.deepEqual(failures.slice(0, 10), []);
});

test('the nutrition-resolution check notices an unknown ingredient (control)', () => {
  const { unmatched } = computeMealNutritionRaw(['Reduced-fat cheddar 30g', 'Nonexistent food 50g']);
  assert.deepEqual(unmatched, ['Nonexistent food 50g']);
});

test('every legacy editorial plan resolves its allergens too', () => {
  const failures = [];
  for (const [slug, plan] of Object.entries(mealPlansData)) {
    for (const day of plan.plan || []) {
      for (const meal of day.meals || []) {
        const lines = Array.isArray(meal.ingredients)
          ? meal.ingredients
          : splitIngredientText(meal.portion_size || '');
        if (!lines.length) continue;
        const summary = resolveAllergens(lines);
        if (summary.unclassified.length) {
          failures.push(`${slug} / ${meal.name}: ${summary.unclassified.join(' | ')}`);
        }
      }
    }
  }
  assert.deepEqual(failures.slice(0, 10), []);
});

test('the site never claims anything is allergen-free or free from an allergen', () => {
  const banned = /\b(allergen[- ]free|free from (milk|gluten|nuts?|egg|soya|sesame|fish)|guaranteed (gluten|dairy|nut)[- ]free)\b/i;
  const offenders = [];
  for (const dir of ['src', 'api', 'server']) {
    const dirPath = path.join(root, dir);
    if (!fs.existsSync(dirPath)) continue;
    const walk = current => {
      for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
        const full = path.join(current, entry.name);
        if (entry.isDirectory()) { walk(full); continue; }
        if (!/\.(jsx?|json)$/.test(entry.name)) continue;
        // allergens.js states the rule itself, so it legitimately names the phrase.
        if (full.endsWith(path.join('utils', 'allergens.js'))) continue;
        read(path.relative(root, full)).split('\n').forEach((line, index) => {
          // "we do not make allergen-free claims" is the opposite of a claim.
          if (banned.test(line) && !/\b(not|never|cannot|no)\b/i.test(line)) {
            offenders.push(`${path.relative(root, full)}:${index + 1}`);
          }
        });
      }
    };
    walk(dirPath);
  }
  assert.deepEqual(offenders, []);
});

// ── Content dates ────────────────────────────────────────────────────────────

test('content dates format both stored formats and refuse to invent one', () => {
  assert.equal(formatContentDate('2026-07-11'), '11 July 2026');
  assert.equal(formatContentDate('11 July 2026'), '11 July 2026');
  assert.equal(formatContentDate(''), null);
  assert.equal(formatContentDate(undefined), null);
  assert.equal(formatContentDate('not a date'), null);
  assert.equal(toIsoDate('11 July 2026'), '2026-07-11');
  assert.equal(toIsoDate('2026-07-11'), '2026-07-11');
  assert.equal(toIsoDate('nonsense'), null);
});

test('schema dates omit properties rather than fabricating them', () => {
  assert.deepEqual(schemaDates({}), {});
  assert.deepEqual(schemaDates({ published: '2026-06-16' }), { datePublished: '2026-06-16' });
  assert.deepEqual(
    schemaDates({ published: '2026-06-16', modified: '2026-08-13' }),
    { datePublished: '2026-06-16', dateModified: '2026-08-13' },
  );
});

test('no page falls back to a hardcoded editorial review date', () => {
  const offenders = [];
  const pattern = /(reviewed|dateModified|datePublished)[^\n]*\|\|\s*'[^']*\d{4}/i;
  for (const dir of ['src/pages', 'src/components']) {
    for (const file of fs.readdirSync(path.join(root, dir))) {
      if (!file.endsWith('.jsx')) continue;
      const relative = `${dir}/${file}`;
      read(relative).split('\n').forEach((line, index) => {
        if (pattern.test(line)) offenders.push(`${relative}:${index + 1} ${line.trim()}`);
      });
    }
  }
  assert.deepEqual(
    offenders,
    [],
    'A page is substituting a hardcoded date where real provenance is missing. '
    + 'Use ContentByline / contentProvenance, which omit what is not known.',
  );
});

test('the plan validation date matches the recorded deployment log', () => {
  const log = JSON.parse(read('docs/semantic-qa/deployment-log.json'));
  const expected = String(log.deployments.at(-1).deployedAt).slice(0, 10);
  const match = /LIBRARY_VALIDATED_ON\s*=\s*'(\d{4}-\d{2}-\d{2})'/.exec(read('src/constants/site.js'));
  assert.ok(match, 'LIBRARY_VALIDATED_ON is missing from src/constants/site.js');
  assert.equal(match[1], expected);
});

// ── Publisher and privacy disclosure ─────────────────────────────────────────

test('the privacy policy names every analytics provider the site can load', () => {
  const analytics = read('src/utils/analytics.js');
  const privacy = read('src/pages/Privacy.jsx');

  // Only providers that are on by default need naming. A provider whose id
  // defaults to an empty string is inert until someone configures it, and
  // configuring it is what should trigger the disclosure.
  const providers = [
    [/DEFAULT_GA_MEASUREMENT_ID\s*=\s*'([^']*)'/, 'Google Analytics'],
    [/AHREFS_ANALYTICS_KEY\s*=\s*ENV\.\w+\s*\|\|\s*'([^']*)'/, 'Ahrefs'],
    [/PLAUSIBLE_DOMAIN\s*=\s*ENV\.\w+\s*\|\|\s*'([^']*)'/, 'Plausible'],
  ];

  for (const [detector, label] of providers) {
    const match = detector.exec(analytics);
    if (!match || !match[1]) continue;
    assert.ok(
      privacy.includes(label),
      `${label} is enabled by default in src/utils/analytics.js but is not named in the privacy policy.`,
    );
  }

  if (/@vercel\/analytics/.test(read('src/main.jsx'))) {
    assert.ok(privacy.includes('Vercel Analytics'), 'Vercel Analytics is not named in the privacy policy.');
  }
});

test('no analytics provider is loaded before consent', () => {
  const main = read('src/main.jsx');
  assert.ok(
    /hasAnalyticsConsent\(\)/.test(main),
    'src/main.jsx must gate Vercel Analytics behind consent rather than injecting on load.',
  );
  assert.ok(
    !/^inject\(\);/m.test(main),
    'src/main.jsx calls inject() at the top level, which loads analytics before consent.',
  );

  const analytics = read('src/utils/analytics.js');
  const initBody = analytics.slice(analytics.indexOf('export function initAnalytics'));
  assert.ok(
    /if \(!hasAnalyticsConsent\(\)\) return;/.test(initBody.slice(0, 400)),
    'initAnalytics must return early without consent.',
  );
});

test('AdSense stays disabled and is never loaded before an explicit opt-in', () => {
  const adSlot = read('src/components/AdSlot.jsx');
  const adConsent = read('src/utils/adConsent.js');

  // The flag lives in adConsent.js now, so AdSlot is checked through it.
  assert.ok(
    /VITE_ADS_ENABLED/.test(adConsent),
    'Ads must remain behind the ads-enabled flag.',
  );
  assert.ok(
    /areAdsEnabled\(\)/.test(adSlot),
    'AdSlot must consult the ads-enabled flag.',
  );

  // Two independent reasons to render nothing: ads not enabled or the route is
  // not monetisable (`eligible`), and no advertising consent (`consented`).
  assert.ok(
    /if \(!eligible \|\| !consented\) return null;/.test(adSlot),
    'AdSlot must render nothing without both an eligible route and consent.',
  );

  // The loader must sit behind the consent check, not run on mount.
  // lastIndexOf skips the function declaration and finds the call site.
  const loaderCall = adSlot.lastIndexOf('ensureAdsenseScript(clientId)');
  const consentGuard = adSlot.indexOf('if (!eligible || !consented) return;');
  assert.ok(consentGuard > -1, 'AdSlot must guard its effect on consent.');
  assert.ok(
    consentGuard < loaderCall,
    'AdSlot requests the AdSense script before checking consent.',
  );

  // Advertising consent must be its own signal. Analytics consent is a
  // different purpose under UK PECR and cannot stand in for it.
  assert.ok(
    !/hasAnalyticsConsent/.test(adSlot),
    'AdSlot must not treat analytics consent as advertising consent.',
  );
  assert.ok(
    /doNotTrack/.test(adConsent),
    'Advertising consent must respect Do Not Track.',
  );

  // No page may embed the AdSense loader directly, bypassing the flag.
  const indexHtml = read('index.html');
  assert.ok(
    !/pagead2\.googlesyndication\.com/.test(indexHtml),
    'index.html must not load the AdSense script globally.',
  );
});

test('ads are refused on screens with no publisher content', () => {
  // Google's inventory-value policy rules out error screens, forms, empty
  // utility screens and navigation surfaces. Enforced in code so a misplaced
  // slot renders nothing rather than relying on nobody placing one.
  for (const route of [
    '/404',
    '/admin',
    '/feedback',
    '/saved-plans',
    '/quiz',
    '/quiz/results',
    '/browse',
    '/browse/page/3',
    '/tools',
    '/mealprep-plus',
    '/choose-plan/muscle-gain',
    '/choose-supermarket/ocado',
    '/choose-diet/vegan',
    '/choose-calories/1500',
  ]) {
    assert.equal(isMonetisableRoute(route), false, `${route} must not carry ads.`);
  }

  for (const route of [
    '/plans/aldi-cutting-1600-batch-cook',
    '/blog/how-to-build-a-calorie-deficit',
    '/meal-plan/1800-calorie-meal-plan',
  ]) {
    assert.equal(isMonetisableRoute(route), true, `${route} should be monetisable.`);
  }
});

test('the publisher pages a reader needs are reachable from the footer', () => {
  const navigation = read('src/data/navigation.js');
  for (const route of ['/about', '/methodology', '/contact', '/privacy', '/terms']) {
    assert.ok(navigation.includes(`'${route}'`), `${route} is missing from site navigation.`);
  }
});

test('the methodology page is routed and prerendered', () => {
  assert.ok(read('src/App.jsx').includes('path="/methodology"'), 'no /methodology route');
  assert.ok(read('prerender.js').includes("'/methodology'"), '/methodology is not prerendered');
});

test('the site does not claim recipe testing or professional review it has not done', () => {
  const banned = /\b(dietitian|nutritionist|doctor|medically|clinically)[- ]?(reviewed|approved|verified|endorsed)\b|\bwe (cooked|tested|trialled) (every|each|all)\b|\bexpert[- ]reviewed\b/i;
  const offenders = [];
  const walk = current => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) { walk(full); continue; }
      if (!/\.(jsx?|json)$/.test(entry.name)) continue;
      read(path.relative(root, full)).split('\n').forEach((line, index) => {
        if (banned.test(line) && !/\b(no|not|never|nor)\b/i.test(line)) {
          offenders.push(`${path.relative(root, full)}:${index + 1}`);
        }
      });
    }
  };
  walk(path.join(root, 'src'));
  assert.deepEqual(offenders, []);
});
