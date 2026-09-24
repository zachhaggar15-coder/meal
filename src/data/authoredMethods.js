// Hand-written methods for shared meals the step generator cannot describe
// properly. The generator builds a method from ingredient roles, which works
// for most dishes but produced steps that made no sense for these: quinoa
// porridge simmered "until the oats are soft" and served the quinoa raw,
// tzatziki "sliced" its grated cucumber and dill, a broth put the bread roll in
// the soup, roast dinners served their olive oil and herbs on the side, and
// silken tofu was "browned" in a pan.
//
// Keyed by the meal's exact display name, because plan pages rebuild the
// method from the meal name and its (possibly household-scaled) ingredients.
// Methods therefore never state quantities, so they stay right at any portion
// size, and they only name ingredients the meal actually lists.
export const AUTHORED_METHODS = Object.freeze({
  'Quinoa and Coconut Milk Porridge with Mango': [
    'Rinse the quinoa in a sieve, then put it in a small saucepan with the light coconut milk and cinnamon.',
    'Bring to a gentle simmer and cook for 15-20 minutes, stirring often, until the quinoa is tender and creamy. Add a splash of water if it gets too thick.',
    'Spoon into a bowl, top with the mango chunks and drizzle over the maple syrup.',
  ],
  'Tzatziki with Vegetable Dippers': [
    'Squeeze the grated cucumber in a clean tea towel to remove the excess water.',
    'Crush or finely grate the garlic, then stir it into the low-fat Greek yogurt with the cucumber and dill. Season to taste.',
    'Cut the carrot and celery sticks into batons and serve them with the tzatziki for dipping.',
  ],
  'Smoked Mackerel Pâté on Oatcakes': [
    'Peel the skin off the smoked mackerel fillet and flake the fish into a bowl.',
    'Mash it with the light cream cheese and lemon juice until fairly smooth, then season to taste.',
    'Spread the pâté onto the oatcakes and serve.',
  ],
  'Turkey Breast and Cream Cheese Roll-Up': [
    'Lay the turkey breast slices flat and spread each one with light cream cheese.',
    'Put a cucumber slice at one end of each and roll up tightly.',
    'Eat straight away, or pack into a lidded container and keep chilled.',
  ],
  'Roasted Spiced Chickpeas': [
    'Heat the oven to 200°C (180°C fan).',
    'Drain and rinse the chickpeas, then pat them dry with kitchen paper.',
    'Toss with the olive oil, smoked paprika and cumin, spread on a baking tray in a single layer and roast for 25-30 minutes, shaking halfway, until crisp.',
    'Leave to cool on the tray; they crisp up further as they cool.',
  ],
  'Frozen Edamame Beans with Sea Salt': [
    'Cook the frozen edamame beans in boiling water for 3-4 minutes, then drain.',
    'Sprinkle with sea salt to taste and eat warm, or cool and chill for later.',
  ],
  'Chocolate Protein Shake': [
    'Pour the semi-skimmed milk into a shaker, add the whey protein powder and shake hard for 20-30 seconds until smooth.',
    'Drink straight away.',
  ],
  'Chicken and Vegetable Broth with Bread': [
    'Peel and chop the carrots, celery and onion.',
    'Put them in a large pan with the chicken stock, bring to the boil and simmer for 10 minutes.',
    'Add the chicken breast and simmer gently for 12-15 minutes, until cooked through. Lift it out, shred it with two forks and return it to the pan.',
    'Season to taste and serve with the wholemeal roll on the side.',
  ],
  'Chicken and Orzo Soup': [
    'Peel and chop the carrot, celery and onion.',
    'Put them in a large pan with the chicken stock, bring to the boil, then add the chicken breast and simmer gently for 12-15 minutes, until cooked through.',
    'Lift out the chicken and shred it. Add the orzo pasta to the pan and simmer for 8-10 minutes, until tender.',
    'Return the chicken to the pan, season to taste and scatter over the parsley before serving.',
  ],
  'Mushroom and Pea Brown Rice Risotto': [
    'Soften the onion and garlic in a wide pan over medium heat for 3-4 minutes, then add the sliced mushrooms and cook until golden.',
    'Stir in the brown rice and cook for 1 minute so the grains are coated.',
    'Add the hot vegetable stock a ladleful at a time, stirring often and letting each addition be absorbed before adding the next. Brown rice takes about 35-40 minutes to become tender and creamy.',
    'Stir in the frozen peas for the last 3-4 minutes, then take the pan off the heat, stir through the parmesan and season to taste.',
  ],
  'Miso Tofu and Edamame Bowl': [
    'Cook the brown rice according to its packet instructions.',
    'Cook the edamame beans in boiling water for 3-4 minutes, then drain.',
    'Mix the miso paste and soy sauce with a tablespoon of hot water to make a dressing.',
    'Cut the silken tofu gently into cubes; it is too delicate to fry. Arrange the rice, edamame and tofu in a bowl, spoon over the dressing and scatter with sesame seeds.',
  ],
  'Cod and Chickpea Stew': [
    'Peel and chop the onion and garlic. Drain and rinse the chickpeas.',
    'Soften the onion and garlic in a large pan over medium heat for 5 minutes, then stir in the paprika.',
    'Add the tomatoes and chickpeas with a splash of water and simmer for 10 minutes, until thickened.',
    'Nestle the cod fillet into the sauce, cover and simmer gently for 8-10 minutes, until it flakes easily. Break it into chunks, season to taste and scatter over the parsley.',
  ],
  'Lentil and Turkey Sausage Casserole': [
    'Chop the onion and celery.',
    'Brown the turkey sausages all over in a large non-stick pan, then lift them out.',
    'Soften the onion and celery in the same pan for 5 minutes, then stir in the paprika.',
    'Add the red lentils, tomatoes and enough water to cover, return the sausages and simmer for 20-25 minutes, until the lentils are tender and the sausages cooked through. Season to taste.',
  ],
  'Tofu Scramble with Peppers': [
    'Chop the mixed peppers. Heat the olive oil in a non-stick pan and cook the peppers for 3-4 minutes, until softening.',
    'Crumble the firm tofu into the pan, add the turmeric and cumin, and cook the tofu, stirring, for 5-6 minutes until hot through and lightly golden.',
    'Season to taste and serve.',
  ],
  'Spinach and Ricotta Wholemeal Pasta': [
    'Cook the pasta according to its packet instructions, keeping a mug of the cooking water before you drain it.',
    'Meanwhile, gently cook the crushed garlic in the olive oil in a large pan for 1 minute, then add the baby spinach and stir until wilted.',
    'Stir in the ricotta with a splash of the pasta water to make a sauce, then toss through the drained pasta.',
    'Serve with the parmesan grated over.',
  ],
  'Roast Chicken Breast with Potatoes and Greens': [
    'Heat the oven to 200°C (180°C fan).',
    'Cut the white potatoes and carrots into even pieces, toss with the olive oil and crushed garlic, and roast for 35-40 minutes, turning halfway.',
    'Add the chicken breast to the tray for the last 20-25 minutes, until cooked through.',
    'Meanwhile, steam or boil the broccoli for 4-5 minutes, then serve everything together.',
  ],
  'Pork Tenderloin with Roasted Root Vegetables': [
    'Heat the oven to 200°C (180°C fan).',
    'Cut the parsnip, carrot and sweet potato into even chunks, toss with the olive oil and mixed herbs, and roast for 30-35 minutes, turning halfway.',
    'Meanwhile, brown the pork tenderloin all over in a hot non-stick pan, then add it to the tray for the final 15-20 minutes, until cooked through with no pink juices.',
    'Rest the pork for 5 minutes, then slice and serve with the roasted vegetables.',
  ],
  'Lean Pork Loin with Roasted Root Vegetables': [
    'Heat the oven to 200°C (180°C fan).',
    'Cut the parsnips, carrots and sweet potato into even chunks, toss with the olive oil and rosemary, and roast for 30-35 minutes, turning halfway.',
    'Meanwhile, brown the pork loin all over in a hot non-stick pan, then add it to the tray for the final 15-20 minutes, until cooked through with no pink juices.',
    'Rest the pork for 5 minutes, then slice and serve with the roasted vegetables.',
  ],
  'Pork Tenderloin with Apple and Sweet Potato': [
    'Heat the oven to 200°C (180°C fan).',
    'Cut the sweet potato into chunks and the apple into wedges, toss with the olive oil, crushed garlic and rosemary, and roast for 25-30 minutes.',
    'Meanwhile, brown the pork tenderloin all over in a hot non-stick pan, then add it to the tray for the final 15-20 minutes, until cooked through with no pink juices.',
    'Rest the pork for 5 minutes, then slice and serve with the sweet potato and apple.',
  ],
  'Baked Cod with Sweet Potato Wedges': [
    'Heat the oven to 200°C (180°C fan).',
    'Cut the sweet potato into wedges, toss with the olive oil and paprika, and roast for 30-35 minutes, turning halfway.',
    'Add the cod fillet to the tray for the final 12-15 minutes, until it flakes easily.',
    'Serve with the lemon cut into wedges for squeezing over.',
  ],
  'Baked Salmon, Sweet Potato Wedges and Broccoli': [
    'Heat the oven to 200°C (180°C fan).',
    'Cut the sweet potato into wedges, toss with most of the olive oil and roast for 30-35 minutes, turning halfway.',
    'Add the salmon fillet to the tray for the final 12-15 minutes, topped with the dill and a slice of the lemon, until it flakes easily.',
    'Meanwhile, steam or boil the broccoli for 4-5 minutes, drizzle with the remaining olive oil and serve with lemon wedges.',
  ],
  'Baked Cod with New Potatoes and Green Beans': [
    'Heat the oven to 200°C (180°C fan). Boil the new potatoes in lightly salted water for 15-20 minutes, until tender.',
    'Meanwhile, put the cod fillet in a small baking dish, drizzle with the olive oil and a squeeze of lemon, and bake for 12-15 minutes, until it flakes easily.',
    'Cook the green beans in boiling water for 4-5 minutes, then drain.',
    'Serve with the parsley scattered over and the rest of the lemon in wedges.',
  ],
  'Grilled Chicken, Brown Rice and Roasted Peppers': [
    'Heat the oven to 200°C (180°C fan). Slice the mixed peppers, toss with half the olive oil and the crushed garlic, and roast for 25-30 minutes.',
    'Meanwhile, cook the brown rice according to its packet instructions.',
    'Brush the chicken breast with the remaining oil and cook under a hot grill or on a griddle pan for 6-8 minutes per side, until cooked through. Rest briefly, then slice.',
    'Serve the chicken over the rice with the roasted peppers.',
  ],
  'Grilled Lean Sirloin Steak with Brown Rice and Roasted Veg': [
    'Heat the oven to 200°C (180°C fan). Cut the courgette and red pepper into chunks, toss with most of the olive oil and roast for 25-30 minutes.',
    'Meanwhile, cook the brown rice according to its packet instructions.',
    'Rub the steak with the remaining oil and cook under a hot grill or on a griddle pan for 2-4 minutes per side, depending on its thickness and how you like it. Rest for 5 minutes, then slice.',
    'Serve the steak with the rice and roasted vegetables.',
  ],
  'Grilled Tuna Steak with Brown Rice and Asparagus': [
    'Cook the brown rice according to its packet instructions.',
    'Brush the tuna steak and asparagus with the olive oil. Cook the asparagus on a hot griddle pan or under the grill for 4-5 minutes, turning, until tender.',
    'Cook the tuna steak for 1-2 minutes per side for a pink middle, or a little longer if you prefer it cooked through.',
    'Serve over the rice with the soy sauce and lemon juice spooned over.',
  ],
  'Cottage Cheese and Roasted Vegetable Bowl': [
    'Warm the roasted courgette and roasted red pepper through, or use them cold. Halve the cherry tomatoes.',
    'Put the vegetables in a bowl, top with the cottage cheese and sprinkle over the mixed herbs.',
    'Toast the wholemeal pitta, cut it into strips and serve alongside.',
  ],
  'Tuna and Sweetcorn Pasta Bake': [
    'Heat the oven to 200°C (180°C fan). Cook the pasta for 2 minutes less than its packet instructions, then drain.',
    'Drain the tuna, then mix it with the pasta, tomatoes and sweetcorn in an ovenproof dish.',
    'Scatter the reduced-fat cheddar over the top and bake for 20-25 minutes, until bubbling and golden.',
  ],
});

// A method written for one ingredient list is only right for that list. Plan
// pages scale quantities but keep the same ingredients; anything else sharing
// the name (a test fixture, a legacy plan variant) falls back to the generator.
function ingredientKey(lines) {
  return (Array.isArray(lines) ? lines : [])
    .map(line => String(line || '')
      .toLowerCase()
      .replace(/\([^)]*\)/g, ' ')
      .replace(/,.*$/, '')
      .replace(/\b\d+\/\d+\b/g, ' ')
      .replace(/\b\d+(?:\.\d+)?\s*(?:g|kg|ml|l|tsp|tbsp|x)?\b/g, ' ')
      .replace(/\b(half|quarter|dry|cooked|raw|drained|grated|roasted|baked|mashed|slices?|stalks?|cloves?|biscuits?|sticks?|leaves)\b/g, ' ')
      .replace(/\s+/g, ' ')
      .trim())
    .filter(Boolean)
    .sort()
    .join('|');
}

export function authoredMethodFor(name, ingredients, libraryIngredients) {
  const method = AUTHORED_METHODS[String(name || '').trim()];
  if (!method) return null;
  if (libraryIngredients && ingredientKey(ingredients) !== ingredientKey(libraryIngredients)) return null;
  return [...method];
}

export { ingredientKey };
