# Experiment backlog

Last reviewed: 29 July 2026

Experiments must have a user problem, primary metric, guardrail and minimum
evidence threshold. Rankings are not claimed as outcomes.

| Priority | Hypothesis | Primary metric | Guardrails | Start condition |
|---|---|---|---|---|
| P1 | A clearer plan CTA on high-impression organic landing pages increases useful plan opens. | `plan_primary_cta_clicked / qualified organic landing sessions` | engaged time, return rate, no affiliate-click loss | Enough sessions on one stable template; exclude recently edited snippets |
| P1 | Showing a brief saved-plan reminder after meaningful plan use increases return usage. | coarse `return_visit` and `saved_plan_reopened` | dismiss rate, no layout shift, no notification channel | At least 50 plan saves and stable consented tracking |
| P1 | A top-result explanation ordered by the user's strongest constraint improves quiz-to-plan continuation. | `plan_viewed_from_quiz / quiz_result_viewed` | quiz completion, alternative-plan clicks | 100 consented quiz result views |
| P2 | A narrower mobile hero image reduces LCP without hurting quiz starts. | mobile LCP and quiz starts | CLS, image quality | Reproducible local source-size saving and field baseline |
| P2 | Container guides that lead with calculated container count improve qualified affiliate use. | recommender completion to affiliate click | engaged time, disclosure visibility | Sufficient container-guide traffic after cooldown |

Do not run multiple copy changes on the same low-traffic route simultaneously.
Use the weekly Search Console/GA report's cooldown and minimum-impression rules,
record the exact change date and retain a control period. Prefer reversible
template changes; do not create a bespoke experimentation platform at current
traffic levels.
