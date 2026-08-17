import { getCookingIngredientDisplay } from '../utils/cookingQuantities.js';
import { buildPracticalRecipeSteps } from '../utils/recipeQuality.js';
import { allergenLabel, resolveAllergens } from '../utils/allergens.js';
import { splitIngredientText } from '../utils/nutrition.js';

export default function RecipeDetails({ meal = {}, children = null, headingLevel = 5 }) {
  const Heading = `h${Math.min(6, Math.max(2, headingLevel))}`;
  const calculationIngredients = meal.calculationIngredients || meal.ingredients || meal.portion_size;
  const cookingIngredients = Array.isArray(meal.cookingIngredients) && meal.cookingIngredients.length
    ? meal.cookingIngredients
    : getCookingIngredientDisplay(calculationIngredients);
  const method = buildPracticalRecipeSteps({ ...meal, ingredients: calculationIngredients });

  // Per-meal allergens, so a reader who sees an allergen listed for the plan
  // can find which meal it comes from and swap that one meal. Wording never
  // implies absence — see src/utils/allergens.js.
  const allergenLines = Array.isArray(calculationIngredients)
    ? calculationIngredients
    : splitIngredientText(calculationIngredients || '');
  const allergens = resolveAllergens(allergenLines);

  if (!cookingIngredients.length && !method.length) return null;

  return (
    <details className="plan-meal-recipe">
      <summary>Recipe</summary>
      <div className="plan-recipe-content">
        {cookingIngredients.length > 0 ? (
          <section className="plan-recipe-ingredients" aria-label={`${meal.name || 'Meal'} ingredients`}>
            <Heading>Ingredients</Heading>
            <ul>
              {cookingIngredients.map((ingredient, index) => (
                <li key={`${ingredient}-${index}`}>{ingredient}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {(allergens.present.length > 0 || allergens.varies.length > 0) && (
          <p className="plan-recipe-allergens">
            {allergens.present.length > 0 && (
              <>
                <strong>Allergens in this meal:</strong>{' '}
                {allergens.present.map(allergenLabel).join(', ')}.{' '}
              </>
            )}
            {allergens.varies.length > 0 && (
              <>
                <strong>Check the label for:</strong>{' '}
                {allergens.varies.map(allergenLabel).join(', ')}.{' '}
              </>
            )}
            Worked out from generic ingredient names — always read the product label.
          </p>
        )}

        {method.length > 0 || children ? (
          <section className="plan-recipe-method" aria-label={`${meal.name || 'Meal'} method`}>
            <Heading>Method</Heading>
            <ol>
              {method.map((step, index) => <li key={`${step}-${index}`}>{step}</li>)}
              {children}
            </ol>
          </section>
        ) : null}
      </div>
    </details>
  );
}
