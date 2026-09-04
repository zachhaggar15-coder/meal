import assert from 'node:assert/strict';
import test from 'node:test';
import {
  formatWeeklyPrice,
  formatWeeklyPriceEstimate,
} from '../src/utils/priceDisplay.js';

test('adds a weekly unit to generated price ranges', () => {
  assert.equal(formatWeeklyPrice('£20–30'), '£20–30/week');
  assert.equal(formatWeeklyPriceEstimate('£20–30'), '£20–30/week estimate');
});

test('never adds a second weekly unit to legacy prices', () => {
  assert.equal(formatWeeklyPrice('£40–50 per week'), '£40–50 per week');
  assert.equal(formatWeeklyPriceEstimate('£40–50 per week'), '£40–50 per week estimate');
});

test('keeps legacy evidence notes after the estimate label', () => {
  assert.equal(
    formatWeeklyPriceEstimate('£40-45 per week (Tesco basket, checked 8 June 2026)'),
    '£40-45 per week estimate (Tesco basket, checked 8 June 2026)',
  );
});

test('preserves an existing estimate and handles missing values', () => {
  assert.equal(formatWeeklyPriceEstimate('£30/week estimate'), '£30/week estimate');
  assert.equal(formatWeeklyPriceEstimate(''), '');
});
