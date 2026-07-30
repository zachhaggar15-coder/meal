import { getCookingIngredientDisplay } from '../utils/cookingQuantities.js';
import { buildPracticalRecipeSteps } from '../utils/recipeQuality.js';

export default function RecipeDetails({ meal = {}, children = null }) {
  const calculationIngredients = meal.calculationIngredients || meal.ingredients || meal.portion_size;
  const cookingIngredients = Array.isArray(meal.cookingIngredients) && meal.cookingIngredients.length
    ? meal.cookingIngredients
    : getCookingIngredientDisplay(calculationIngredients);
  const method = buildPracticalRecipeSteps({ ...meal, ingredients: calculationIngredients });

  if (!cookingIngredients.length && !method.length) return null;

  return (
    <details className="plan-meal-recipe">
      <summary>Recipe</summary>
      <div className="plan-recipe-content">
        {cookingIngredients.length > 0 ? (
          <section className="plan-recipe-ingredients" aria-label={`${meal.name || 'Meal'} ingredients`}>
            <h5>Ingredients</h5>
            <ul>
              {cookingIngredients.map((ingredient, index) => (
                <li key={`${ingredient}-${index}`}>{ingredient}</li>
              ))}
            </ul>
            <p className="plan-recipe-quantity-note">
              Cooking measures are rounded for ease; nutrition and plan totals use the precise calculated quantities.
            </p>
          </section>
        ) : null}

        {method.length > 0 || children ? (
          <section className="plan-recipe-method" aria-label={`${meal.name || 'Meal'} method`}>
            <h5>Method</h5>
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
