import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { buildBrowseUrl } from '../src/utils/browseUrlState.js';

const browseSource = fs.readFileSync(new URL('../src/pages/BrowsePlans.jsx', import.meta.url), 'utf8');

test('browse filters are encoded into a shareable URL', () => {
  assert.equal(
    buildBrowseUrl({
      search: 'high protein',
      goal: 'weight-loss',
      supermarket: 'aldi',
      diet: 'vegetarian',
      calories: '1800',
      budget: 'very-cheap',
      effort: 'batch',
    }),
    '/browse?search=high+protein&goal=weight-loss&supermarket=aldi&diet=vegetarian&calories=1800&budget=very-cheap&effort=batch',
  );
});

test('filtered pagination remains a path route and never becomes a page query', () => {
  const url = buildBrowseUrl({ goal: 'weight-loss' }, 3);
  assert.equal(url, '/browse/page/3?goal=weight-loss');
  assert.equal(new URL(url, 'https://www.mealprep.org.uk').searchParams.has('page'), false);
});

test('updating filters removes stale managed values but preserves attribution parameters', () => {
  assert.equal(
    buildBrowseUrl(
      { supermarket: 'lidl', calories: '1500' },
      1,
      'goal=muscle-gain&utm_source=newsletter&unknown=value',
    ),
    '/browse?utm_source=newsletter&unknown=value&supermarket=lidl&calories=1500',
  );
});

test('the first client render keeps empty filter state before reading the URL in an effect', () => {
  for (const stateName of ['search', 'goal', 'supermarket', 'diet', 'calories', 'budget', 'effort']) {
    assert.match(
      browseSource,
      new RegExp(`const \\[${stateName},\\s*set[A-Z][A-Za-z]+\\]\\s*=\\s*useState\\(''\\)`),
      `${stateName} must start empty for hydration`,
    );
  }
  assert.match(browseSource, /useEffect\(\(\) => \{\s*const currentParams = new URLSearchParams\(paramString\)/);
});
