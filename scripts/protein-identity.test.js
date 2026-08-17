// Primary-protein identity: does the resolver name the right protein?
//
// The whole diversity system rests on this. The failure that motivated it was
// not a missing keyword — it was a design error: planBuilder's MAIN_PROTEIN_KW
// treated `mince` and `steak` as if they identified beef, so "Turkey mince",
// "Quorn mince" and "Tuna steak" all came back as beef, while every vegan and
// vegetarian meal came back as nothing at all.
//
// The rule these tests defend: a protein's identity comes from its SOURCE, and
// words describing cut, shape, cure or packaging never override it.
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  resolveProteinIdentity,
  proteinIdentityCandidates,
  primaryProteinSignature,
  sharedPrimaryProteins,
  PRIMARY_PROTEIN_SOURCES,
} from '../src/utils/ingredientRoles.js';
import { MEALS } from '../src/data/mealLibrary.js';
import { mealPlansData } from '../src/data/mealPlans.js';

// ── Source beats form ───────────────────────────────────────────────────────

test('mince names a shape, never an animal', () => {
  const cases = [
    ['beef mince', 'beef'], ['lean beef mince', 'beef'],
    ['turkey mince lean', 'turkey'], ['chicken mince', 'chicken'],
    ['pork mince', 'pork'], ['lean lamb mince', 'lamb'],
    ['duck mince', 'duck'], ['Quorn mince 200g', 'quorn'],
  ];
  for (const [input, expected] of cases) {
    assert.equal(resolveProteinIdentity(input), expected, `${input} should be ${expected}`);
  }
  // A plant qualifier means the meat word describes what it imitates.
  for (const input of ['vegetarian mince', 'vegan mince', 'plant-based mince', 'meat-free mince']) {
    assert.notEqual(resolveProteinIdentity(input), 'beef', `${input} must not be beef`);
  }
});

test('steak names a cut, and only names beef when the cut is beef-specific', () => {
  assert.equal(resolveProteinIdentity('lean sirloin steak 220g'), 'beef');
  assert.equal(resolveProteinIdentity('rump steak'), 'beef');
  assert.equal(resolveProteinIdentity('beef steak'), 'beef');
  assert.equal(resolveProteinIdentity('pork steak'), 'pork');
  assert.equal(resolveProteinIdentity('tuna steak 200g'), 'tuna');
  assert.equal(resolveProteinIdentity('salmon steak'), 'salmon');
  assert.equal(resolveProteinIdentity('cauliflower steak'), '');
});

test('fillet, breast and thigh identify nothing on their own', () => {
  const cases = [
    ['chicken fillet', 'chicken'], ['turkey fillet', 'turkey'],
    ['salmon fillet 150g', 'salmon'], ['cod fillet 200g', 'cod'],
    ['smoked haddock fillet 180g', 'haddock'], ['pork fillet', 'pork'],
    ['chicken breast 200g', 'chicken'], ['chicken thighs 220g', 'chicken'],
    ['turkey breast slices 100g', 'turkey'], ['duck breast', 'duck'],
  ];
  for (const [input, expected] of cases) {
    assert.equal(resolveProteinIdentity(input), expected, `${input} should be ${expected}`);
  }
  // Bare form words name nothing.
  for (const form of ['fillet', 'breast', 'mince', 'steak', 'thigh', 'diced', 'strips']) {
    assert.equal(resolveProteinIdentity(form), '', `bare "${form}" must not name a protein`);
  }
});

test('sausages, burgers and meatballs take their source from the ingredient', () => {
  assert.equal(resolveProteinIdentity('pork sausages'), 'pork');
  assert.equal(resolveProteinIdentity('turkey sausages 4'), 'turkey');
  assert.equal(resolveProteinIdentity('chicken sausage'), 'chicken');
  assert.equal(resolveProteinIdentity('beef burger'), 'beef');
  assert.equal(resolveProteinIdentity('turkey burger'), 'turkey');
  assert.equal(resolveProteinIdentity('black bean burger'), 'beans');
  assert.equal(resolveProteinIdentity('beef meatballs'), 'beef');
  assert.equal(resolveProteinIdentity('turkey meatballs'), 'turkey');

  // No source, or a plant source: never assume pork or beef.
  for (const input of ['vegan sausage', 'vegetarian sausage', 'veggie burger', 'vegan meatballs']) {
    const identity = resolveProteinIdentity(input);
    assert.ok(identity !== 'pork' && identity !== 'beef',
      `${input} must not assume an animal source (got "${identity}")`);
  }
  assert.equal(resolveProteinIdentity('sausages'), '', 'a bare sausage names no source');
});

// ── The full canonical taxonomy ─────────────────────────────────────────────

test('every protein source in the library resolves to its own identity', () => {
  const cases = [
    ['Chicken breast 200g', 'chicken'], ['Chicken tikka 150g', 'chicken'],
    ['Turkey mince lean 180g', 'turkey'], ['Lean beef strips 160g', 'beef'],
    ['Lean stewing beef 200g', 'beef'], ['Lean beef jerky 40g', 'beef'],
    ['Pork loin 200g', 'pork'], ['Pork tenderloin 180g', 'pork'],
    ['Back bacon rashers 2', 'pork'], ['Lean lamb shoulder 200g', 'lamb'],
    ['Salmon fillet 180g', 'salmon'], ['Smoked salmon 80g', 'salmon'],
    ['Tinned tuna in spring water 145g', 'tuna'], ['Cod fillet 180g', 'cod'],
    ['Smoked haddock fillet 180g', 'haddock'], ['Mackerel fillet 180g', 'mackerel'],
    ['Tinned mackerel in brine 125g', 'mackerel'], ['Tinned sardines 120g', 'sardines'],
    ['King prawns 150g', 'prawns'],
    ['Firm tofu 200g', 'tofu'], ['Silken tofu 150g', 'tofu'],
    ['Quorn mince 200g', 'quorn'], ['Falafel 4 baked', 'falafel'],
    ['Edamame beans 100g', 'edamame'], ['Frozen edamame beans 150g', 'edamame'],
    ['Red lentils 120g', 'lentils'], ['Green lentils tinned 200g', 'lentils'],
    ['Tinned chickpeas 200g', 'chickpeas'],
    ['Black beans tinned 200g', 'beans'], ['Cannellini beans tinned 200g', 'beans'],
    ['Mixed beans tinned 400g', 'beans'], ['Reduced-sugar baked beans 200g', 'beans'],
    ['Eggs 2', 'eggs'], ['Egg whites 6', 'eggs'],
    ['Halloumi 100g', 'halloumi'], ['Reduced-fat feta 60g', 'feta'],
    ['Cottage cheese 200g', 'cottage-cheese'], ['Skyr 200g', 'greek-yogurt'],
    ['Low-fat Greek yogurt 150g', 'greek-yogurt'], ['Ricotta cheese 100g', 'ricotta'],
    ['Reduced-fat cheddar 30g', 'cheese'], ['Light mozzarella 100g', 'cheese'],
    ['Whey protein powder 30g', 'protein-powder'], ['Pea protein powder 30g', 'protein-powder'],
    ['Peanut butter 30g', 'nut-butter'],
  ];
  for (const [input, expected] of cases) {
    assert.equal(resolveProteinIdentity(input), expected, `${input} should be ${expected}`);
  }
});

// ── Substring and lookalike traps ───────────────────────────────────────────

test('ingredients that merely look like proteins are not proteins', () => {
  const notProteins = [
    'Beef stock 300ml', 'Chicken stock 600ml', 'Beef tomato 1',
    'Green beans 100g', 'Beansprouts 100g', 'Runner beans 100g',
    'Coconut milk 200ml', 'Oat milk 250ml', 'Soya milk 200ml', 'Almond milk 200ml',
    'Butternut squash 200g', 'Soy sauce 15ml', 'Fish sauce 10ml',
    'Egg wash', 'Eggplant 200g', 'Stock cube 1',
  ];
  for (const input of notProteins) {
    assert.equal(resolveProteinIdentity(input), '', `${input} must not resolve to a protein`);
  }
  // Peanut butter is a nut butter, never dairy.
  assert.equal(resolveProteinIdentity('Peanut butter 1 tbsp'), 'nut-butter');
});

// ── One ingredient, one identity ────────────────────────────────────────────

test('no ingredient in the library resolves to more than one protein family', () => {
  const ambiguous = [];
  for (const line of allIngredientLines()) {
    const candidates = proteinIdentityCandidates(line);
    if (candidates.length > 1) ambiguous.push(`${line} -> ${candidates.join(', ')}`);
  }
  assert.deepEqual(ambiguous, [],
    'each ingredient line must resolve to exactly one protein identity or none');
});

// ── Mutation controls ───────────────────────────────────────────────────────
//
// These prove the tests defend the general failure class rather than today's
// three known examples. Re-introducing the old design must break them.

test('mutation: treating "mince" as a beef alias breaks turkey, lamb and Quorn', () => {
  const brokenResolve = (text) => {
    const value = String(text).toLowerCase();
    // The old design: a form word used as a protein identifier.
    if (/\bmince\b/.test(value)) return 'beef';
    return resolveProteinIdentity(text);
  };
  const wrong = ['turkey mince', 'lamb mince', 'Quorn mince', 'chicken mince', 'vegan mince']
    .filter(input => brokenResolve(input) === 'beef');
  assert.equal(wrong.length, 5,
    'the mutation must misclassify every non-beef mince, proving the guard is meaningful');
  // And the real resolver must get all of them right.
  for (const input of ['turkey mince', 'lamb mince', 'Quorn mince', 'chicken mince']) {
    assert.notEqual(resolveProteinIdentity(input), 'beef');
  }
});

test('mutation: treating "steak" as a beef alias breaks tuna, salmon and pork', () => {
  const brokenResolve = (text) => (/\bsteak\b/i.test(text) ? 'beef' : resolveProteinIdentity(text));
  const wrong = ['tuna steak', 'salmon steak', 'pork steak']
    .filter(input => brokenResolve(input) === 'beef');
  assert.equal(wrong.length, 3, 'the mutation must misclassify every non-beef steak');
  assert.equal(resolveProteinIdentity('tuna steak'), 'tuna');
  assert.equal(resolveProteinIdentity('salmon steak'), 'salmon');
  assert.equal(resolveProteinIdentity('pork steak'), 'pork');
});

test('mutation: a meat-only vocabulary silently blanks every plant meal', () => {
  // This is precisely what MAIN_PROTEIN_KW did, and why the diversity check
  // did nothing at all on vegan and vegetarian plans.
  const MEAT_ONLY = ['chicken', 'turkey', 'beef', 'pork', 'lamb', 'tuna', 'salmon',
    'mackerel', 'cod', 'sardine', 'prawn'];
  const plantMeals = MEALS.filter(m => m.diet === 'vegan' && /lunch|dinner/.test(m.type));
  assert.ok(plantMeals.length > 10, 'expected a real vegan pool to test against');

  const blanked = plantMeals.filter((meal) => {
    const text = (meal.ingredients || []).join(' ').toLowerCase();
    return !MEAT_ONLY.some(word => text.includes(word));
  });
  assert.equal(blanked.length, plantMeals.length,
    'the old vocabulary must blank every vegan meal, which is the bug');

  // The real resolver identifies all of them.
  const unresolved = plantMeals.filter(meal => primaryProteinSignature(meal).size === 0);
  assert.deepEqual(unresolved.map(m => m.name), []);
});

// ── Meal-level signatures: primary vs incidental ────────────────────────────

test('a garnish never becomes a second primary protein', () => {
  const chickenWithParmesan = {
    name: 'Chicken and Tomato Pasta',
    ingredients: ['Chicken breast 160g', 'Wholemeal pasta 80g dry', 'Parmesan 10g'],
  };
  assert.deepEqual([...primaryProteinSignature(chickenWithParmesan)], ['chicken']);

  const salmonWithYogurt = {
    name: 'Salmon with New Potatoes',
    ingredients: ['Salmon fillet 150g', 'New potatoes 250g', 'Low-fat Greek yogurt 30g'],
  };
  assert.deepEqual([...primaryProteinSignature(salmonWithYogurt)], ['salmon']);

  const beefWithSeeds = {
    name: 'Beef Salad Bowl',
    ingredients: ['Lean beef strips 160g', 'Mixed leaves 80g', 'Pumpkin seeds 10g'],
  };
  assert.deepEqual([...primaryProteinSignature(beefWithSeeds)], ['beef']);
});

test('a genuinely substantial second protein is kept', () => {
  const chickenChorizo = {
    name: 'Chicken and Chorizo Rice',
    ingredients: ['Chicken breast 100g', 'Chorizo 80g', 'Brown rice 80g dry'],
  };
  const signature = primaryProteinSignature(chickenChorizo);
  assert.ok(signature.has('chicken') && signature.has('pork'),
    `expected chicken and pork, got ${[...signature]}`);
});

// ── Same-day collision semantics ────────────────────────────────────────────

test('collisions are detected on shared principal protein, not on family', () => {
  const meal = (name, ingredients) => ({ name, ingredients });

  // Same protein twice: a collision.
  assert.deepEqual(
    sharedPrimaryProteins(
      meal('Tofu Buddha Bowl', ['Firm tofu 200g', 'Quinoa 80g dry']),
      meal('Tofu Stir Fry', ['Firm tofu 180g', 'Mixed frozen veg 200g']),
    ), ['tofu']);

  // Two different beans canonicalise together, which is the intent.
  assert.deepEqual(
    sharedPrimaryProteins(
      meal('Black Bean Burrito Bowl', ['Black beans tinned 200g', 'Brown rice 80g dry']),
      meal('Kidney Bean Chilli', ['Kidney beans tinned 200g', 'Tinned tomatoes 400g']),
    ), ['beans']);

  // Different proteins: no collision, and specifically NOT collapsed to "fish".
  assert.deepEqual(
    sharedPrimaryProteins(
      meal('Tuna Salad', ['Tinned tuna 145g', 'Mixed leaves 80g']),
      meal('Salmon with Potatoes', ['Salmon fillet 150g', 'New potatoes 250g']),
    ), []);
  assert.deepEqual(
    sharedPrimaryProteins(
      meal('Cod with Potatoes', ['Cod fillet 200g', 'New potatoes 250g']),
      meal('Salmon Pasta', ['Salmon fillet 150g', 'Wholemeal pasta 80g dry']),
    ), []);
  // Nor all poultry, nor all meat.
  assert.deepEqual(
    sharedPrimaryProteins(
      meal('Chicken Salad', ['Chicken breast 160g', 'Mixed leaves 80g']),
      meal('Beef Chilli', ['Lean beef mince 180g', 'Tinned tomatoes 400g']),
    ), []);
  assert.deepEqual(
    sharedPrimaryProteins(
      meal('Chickpea Salad', ['Tinned chickpeas 200g', 'Mixed leaves 80g']),
      meal('Lentil Curry', ['Red lentils 120g', 'Tinned tomatoes 200g']),
    ), []);

  // Incidental overlap is not a collision.
  assert.deepEqual(
    sharedPrimaryProteins(
      meal('Chicken Pasta', ['Chicken breast 160g', 'Parmesan 10g']),
      meal('Lentil Bake', ['Red lentils 120g', 'Parmesan 15g']),
    ), []);
});

test('every lunch and dinner in the library has a protein identity', () => {
  const unresolved = [];
  for (const meal of MEALS) {
    if (!/lunch|dinner/.test(meal.type)) continue;
    if (primaryProteinSignature(meal).size === 0) unresolved.push(`${meal.name} (${meal.diet})`);
  }
  // A mushroom-and-pea risotto genuinely has no principal protein — its only
  // protein-bearing ingredient is 20g of parmesan, which is a garnish. That is
  // a property of the dish, not a resolver gap, and a meal with no identity
  // simply cannot collide. Listed explicitly so the set cannot grow quietly.
  assert.deepEqual(unresolved, ['Mushroom and Pea Brown Rice Risotto (vegetarian)'],
    'a main meal with no protein identity cannot take part in the diversity check');
});

test('the taxonomy keeps distinct sources distinct', () => {
  const families = PRIMARY_PROTEIN_SOURCES.map(([family]) => family);
  for (const required of ['chicken', 'turkey', 'duck', 'beef', 'pork', 'lamb',
    'salmon', 'tuna', 'cod', 'haddock', 'mackerel', 'prawns',
    'tofu', 'tempeh', 'seitan', 'beans', 'lentils', 'chickpeas', 'eggs', 'halloumi']) {
    assert.ok(families.includes(required), `taxonomy is missing "${required}"`);
  }
  // No blunt catch-alls.
  for (const banned of ['meat', 'fish', 'poultry', 'seafood', 'dairy']) {
    assert.ok(!families.includes(banned), `"${banned}" is too broad to be an identity`);
  }
});

/** Every distinct ingredient line across the shared library and legacy plans. */
function allIngredientLines() {
  const lines = new Set();
  for (const meal of MEALS) for (const line of meal.ingredients || []) lines.add(String(line));
  for (const plan of Object.values(mealPlansData)) {
    for (const day of plan.plan || []) {
      for (const meal of day.meals || []) {
        if (!Array.isArray(meal.ingredients)) continue;
        for (const line of meal.ingredients) lines.add(String(line));
      }
    }
  }
  return [...lines];
}
