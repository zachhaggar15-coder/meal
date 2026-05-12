// Analytics utility — no-op stubs until a provider is wired up.
// Replace trackEvent with your provider (e.g. window.gtag?.('event', name, props)).

export function trackEvent(name, props = {}) {
  // window.gtag?.('event', name, props);
}

export const track = {
  // Generator
  planGenerated: (props) => trackEvent('plan_generated', props),
  generatorCtaClick: (sourcePage) => trackEvent('generator_cta_click', { source_page: sourcePage }),
  // Plan interaction
  shoppingListCopied: () => trackEvent('shopping_list_copied'),
  planCopied: () => trackEvent('plan_copied'),
  shareClicked: () => trackEvent('share_clicked'),
  printClicked: () => trackEvent('print_clicked'),
  readyMadePlanClicked: (slug) => trackEvent('ready_made_plan_clicked', { slug }),
  // Form inputs
  supermarketSelected: (store) => trackEvent('supermarket_selected', { store }),
  calorieTargetChanged: (kcal) => trackEvent('calorie_target_changed', { kcal }),
  // Sticker promo
  stickerPromoClick: (sourcePage) => trackEvent('sticker_promo_click', { source_page: sourcePage }),
  // Meal prompt
  copyMealPrompt: (mealName) => trackEvent('copy_meal_prompt', { meal: mealName }),
  usePromptInGenerator: (mealName) => trackEvent('use_prompt_in_generator', { meal: mealName }),
};
