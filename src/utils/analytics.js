// Analytics utility — no-op stubs until a provider is wired up.
// TODO: replace console.log calls with your analytics provider
// (e.g. window.gtag, posthog.capture, mixpanel.track).

export function trackEvent(name, props = {}) {
  // TODO: implement with your analytics provider
  // Example: window.gtag?.('event', name, props);
}

export const track = {
  planGenerated: (props) => trackEvent('plan_generated', props),
  shoppingListCopied: () => trackEvent('shopping_list_copied'),
  planCopied: () => trackEvent('plan_copied'),
  shareClicked: () => trackEvent('share_clicked'),
  printClicked: () => trackEvent('print_clicked'),
  readyMadePlanClicked: (slug) => trackEvent('ready_made_plan_clicked', { slug }),
  supermarketSelected: (store) => trackEvent('supermarket_selected', { store }),
  calorieTargetChanged: (kcal) => trackEvent('calorie_target_changed', { kcal }),
};
