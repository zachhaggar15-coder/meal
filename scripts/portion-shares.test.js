import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getCommonDenominatorPortionShares,
  PORTION_SHARE_DENOMINATOR,
} from '../src/utils/portionShares.js';

test('portion shares use one denominator and add up to the finished dish', () => {
  const shares = getCommonDenominatorPortionShares([
    { id: 'adult-1', portionScale: 1 },
    { id: 'adult-2', portionScale: 0.8 },
    { id: 'smaller', portionScale: 0.5 },
    { id: 'person-4', portionScale: 1.5 },
  ]);

  assert.deepEqual(shares.map(share => share.fraction), ['5/20', '4/20', '3/20', '8/20']);
  assert.equal(
    shares.reduce((sum, share) => sum + share.numerator, 0),
    PORTION_SHARE_DENOMINATOR,
  );
});

test('every household member receives at least one share', () => {
  const shares = getCommonDenominatorPortionShares([
    { id: 'small', portionScale: 0.25 },
    ...Array.from({ length: 5 }, (_, index) => ({
      id: `large-${index}`,
      portionScale: 1.75,
    })),
  ]);

  assert.ok(shares.every(share => share.numerator >= 1));
  assert.ok(shares.every(share => share.denominator === PORTION_SHARE_DENOMINATOR));
  assert.equal(shares.reduce((sum, share) => sum + share.numerator, 0), 20);
});
