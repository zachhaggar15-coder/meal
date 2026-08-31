import assert from 'node:assert/strict';
import test from 'node:test';
import { generateDinnerOptions, normaliseFridgeRows } from '../src/utils/dinnerBuilder.js';

test('normalises fridge rows without retaining empty entries', () => {
  assert.deepEqual(normaliseFridgeRows([
    { name: '  Chicken breast ', quantity: ' 200g ' },
    { name: ' ', quantity: '1' },
  ]), [
    { name: 'Chicken breast', quantity: '200g', search: 'chicken breast 200g' },
  ]);
});

test('only returns dinner templates that use an entered ingredient', () => {
  const options = generateDinnerOptions([{ name: 'Chicken breast', quantity: '200g' }], 600);

  assert.equal(options.length, 2);
  assert.ok(options.every(option => option.fridgeIngredients.includes('Chicken breast 200g')));
  assert.ok(options.every(option => !option.id.includes('tuna')));
});

test('does not qualify a recipe solely from a secondary ingredient', () => {
  const options = generateDinnerOptions([
    { name: 'Chicken breast', quantity: '200g' },
    { name: 'Pasta', quantity: '100g' },
  ], 600);

  assert.ok(options.length > 0);
  assert.ok(options.every(option => option.fridgeIngredients.includes('Chicken breast 200g')));
  assert.ok(options.every(option => option.id !== 'tuna-pasta-salad'));
});

test('returns no result instead of attaching an unrelated ingredient to a recipe', () => {
  const options = generateDinnerOptions([{ name: 'Aubergine', quantity: '1' }], 550);
  assert.deepEqual(options, []);
});

test('separates matched fridge ingredients from template pantry additions', () => {
  const [option] = generateDinnerOptions([
    { name: 'Tofu', quantity: '250g' },
    { name: 'Broccoli', quantity: '1 head' },
  ], 650);

  assert.equal(option.id, 'tofu-stir-fry');
  assert.deepEqual(option.fridgeIngredients, ['Tofu 250g', 'Broccoli 1 head']);
  assert.ok(option.pantryIngredients.includes('Soy sauce 1 tbsp'));
  assert.deepEqual(option.ingredients, [...option.fridgeIngredients, ...option.pantryIngredients]);
});

test('caps matching output at three options and keeps calories in bounds', () => {
  const options = generateDinnerOptions([
    { name: 'Pepper', quantity: '2' },
    { name: 'Rice', quantity: '250g' },
    { name: 'Tomato', quantity: '3' },
  ], 5000);

  assert.equal(options.length, 3);
  assert.ok(options.every(option => option.kcal >= 350 && option.kcal <= 1200));
  assert.ok(options.every(option => option.fridgeIngredients.length > 0));
});
