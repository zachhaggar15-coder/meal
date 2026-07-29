# Analytics events

All funnel events pass through `src/utils/analytics.js`. With consent, they are
sent to GA4, optional Plausible, and the first-party behaviour endpoint. Email
addresses, names, form text and other personally identifiable information are
not included.

| Event | Trigger | Main parameters | Question answered |
| --- | --- | --- | --- |
| `quiz_started` | Quiz page is opened | `page_type` | How many visitors enter the matcher? |
| `quiz_completed` | Final quiz answer is submitted | `goal`, `supermarket`, `calorie_target`, `protein_target`, `cta_location` | Which preferences reach completion? |
| `quiz_result_viewed` | A ranked result set is rendered | `result_slug`, `plan_slug`, `supermarket`, `goal`, `calorie_target`, `protein_target` | How many completions produce a viewed recommendation? |
| `plan_viewed_from_quiz` | A plan opens with `source=quiz` | plan context, `traffic_entry_type` | Do quiz users continue into the full plan? |
| `plan_primary_cta_clicked` | Primary journey CTA or plan card is clicked | plan context where available, `page_type`, `cta_location`, `destination` | Which primary next steps move visitors forward? |
| `shopping_list_opened` | Shopping-list shortcut is clicked | plan context, `cta_location` | How often do visitors progress from meals to shopping? |
| `shopping_list_printed` | Shopping-list-only print is started | plan context, `cta_location` | How often is the list taken to the shop? |
| `plan_printed` | Full-plan print/save flow is started | plan context, `cta_location` | How often are plans saved as printable outputs? |
| `plan_shared` | Native share or link-copy share succeeds | plan context, `cta_location` | Which plans are shared? |
| `plan_adjusted` | Household mode or serving count changes | plan context, `adjustment_type`, `adjustment_value`, `serving_count` | Are portion controls useful? |
| `meal_edited` | An AI edit or legacy meal swap completes | plan context, `meal_name`, `cta_location` | How often are plans personalised at meal level? |
| `related_plan_clicked` | An alternative match or related plan is clicked | `plan_slug`, `page_type`, `cta_location`, `destination` | Do contextual alternatives deepen plan exploration? |
| `affiliate_link_clicked` | A labelled affiliate link is clicked | `affiliate_category`, `product_name`, `source_page`, `destination` | Which useful recommendations create commercial intent? |
| `container_recommender_started` | First container-calculator input changes | `source_page`, `page_type`, `cta_location` | How many visitors actively use the recommender? |
| `container_recommendation_viewed` | A recommendation becomes visible | `recommended_tier`, `container_count`, `prep_meal_count`, `source_page` | Which setups are actually seen? |
| `email_plan_started` | Email-plan field receives first focus or form is submitted | plan context, `page_type`, `cta_location` | How many visitors begin the immediate save flow? |
| `email_plan_completed` | Plan email endpoint succeeds | plan context, `page_type`, `cta_location` | How many immediate plan saves complete? |
| `email_plan_failed` | Plan email endpoint fails | plan context, non-sensitive `reason` | Is the save flow technically reliable? |
| `waitlist_viewed` | At least 35% of a waitlist module is visible | `source_page`, `page_type`, `cta_location` | Where is the future-plan proposition seen? |
| `waitlist_started` | First waitlist form interaction occurs | `source_page`, `page_type`, `cta_location` | Which placements create intent? |
| `waitlist_completed` | Waitlist registration succeeds | `source_page`, `registration_status`, optional `supermarket`, optional `goal` | Which placements and segments validate MealPrep+ demand? |

## Shared plan context

Plan events use the same lower-case parameter names when the data exists:

- `plan_slug`
- `supermarket`
- `goal`
- `calorie_target`
- `protein_target`
- `page_type`
- `cta_location`
- `traffic_entry_type`

Automatic behaviour events such as `page_view`, `scroll_depth`,
`content_section_viewed`, `affiliate_click` and `ui_click` remain available for
broader journey analysis. Funnel events above are explicit and deduplicated so
component re-renders do not create a second conversion event.
