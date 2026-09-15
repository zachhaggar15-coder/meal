import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveImageDimensions } from '../src/utils/ogImageMeta.js';

test('category photos declare their real 16:9 dimensions', () => {
  assert.deepEqual(
    resolveImageDimensions('https://www.mealprep.org.uk/images/meal-plans/high-protein.webp'),
    { width: 1200, height: 675 },
  );
});

test('branded cards declare the 1200x630 dimensions they are actually built at', () => {
  assert.deepEqual(resolveImageDimensions('https://www.mealprep.org.uk/og-preview.png'), { width: 1200, height: 630 });
  assert.deepEqual(
    resolveImageDimensions('https://www.mealprep.org.uk/og/blog/best-meal-prep-containers-uk.png'),
    { width: 1200, height: 630 },
  );
});

test('a query string does not change which pipeline an image is matched to', () => {
  assert.deepEqual(
    resolveImageDimensions('https://www.mealprep.org.uk/images/meal-plans/high-protein.webp?v=2'),
    { width: 1200, height: 675 },
  );
});

test('falls back to the branded-card dimensions for an unrecognised or missing image', () => {
  assert.deepEqual(resolveImageDimensions(''), { width: 1200, height: 630 });
  assert.deepEqual(resolveImageDimensions(undefined), { width: 1200, height: 630 });
});
