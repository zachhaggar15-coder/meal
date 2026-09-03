import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { INDEXABLE_PLAN_SEEDS } from '../src/data/planSeeds.js';
import { PLAN_MACRO_INDEX } from '../src/data/planMacroIndex.js';
import { RETIRED_PLAN_REDIRECTS } from '../src/data/retiredPlanRedirects.js';
import { getPlanBySlug } from '../src/utils/planBuilder.js';

const vercelConfig = JSON.parse(fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
const redirects = new Map(
  vercelConfig.redirects.map(redirect => [redirect.source, redirect]),
);

test('generated plan titles are unique after duplicate aliases are retired', () => {
  const slugsByTitle = new Map();

  for (const seed of INDEXABLE_PLAN_SEEDS) {
    const slugs = slugsByTitle.get(seed.title) || [];
    slugs.push(seed.slug);
    slugsByTitle.set(seed.title, slugs);
  }

  const duplicates = [...slugsByTitle.entries()]
    .filter(([, slugs]) => slugs.length > 1)
    .map(([title, slugs]) => ({ title, slugs }));

  assert.deepEqual(duplicates, []);
});

test('each retired duplicate is absent from generated data and permanently redirects', () => {
  const activeSlugs = new Set(INDEXABLE_PLAN_SEEDS.map(seed => seed.slug));

  for (const [retiredSlug, canonicalSlug] of Object.entries(RETIRED_PLAN_REDIRECTS)) {
    assert.equal(activeSlugs.has(retiredSlug), false, `${retiredSlug} is still indexable`);
    assert.equal(getPlanBySlug(retiredSlug), null, `${retiredSlug} still resolves as a plan`);
    assert.equal(retiredSlug in PLAN_MACRO_INDEX, false, `${retiredSlug} remains in the macro index`);

    assert.equal(activeSlugs.has(canonicalSlug), true, `${canonicalSlug} is not indexable`);
    assert.ok(getPlanBySlug(canonicalSlug), `${canonicalSlug} does not resolve as a plan`);
    assert.equal(canonicalSlug in PLAN_MACRO_INDEX, true, `${canonicalSlug} is missing from the macro index`);

    assert.deepEqual(redirects.get(`/plans/${retiredSlug}`), {
      source: `/plans/${retiredSlug}`,
      destination: `/plans/${canonicalSlug}`,
      permanent: true,
    });
  }
});
