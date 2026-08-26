# Cycling training-plan search ownership — GSC baseline and release decision

**Decision date:** 26 August 2026
**GSC property:** `sc-domain:roadmancycling.com`
**Search type:** Web
**Baseline window:** 24 May–23 August 2026
**Release date:** 26 August 2026

## Decision

Make `/training-plans` the canonical commercial owner for broad queries about Roadman cycling training plans. Keep the existing high-traffic 60-day article live as a first-person case study, and narrow the other destinations by intent instead of redirecting pages that already earn demand.

| Intent | Canonical destination | Boundary |
| --- | --- | --- |
| Roadman coached training-plan service | `/training-plans` | Product facts, delivery, price, review and application |
| How cycling plans are built | `/topics/cycling-training-plans` | Educational method, evidence and limitations |
| Choosing a plan or service format | `/blog/cycling-how-to-choose-a-training-plan-guide` | Ten-check evaluation framework and red flags |
| Event-specific plan finder | `/plan` | Event and weeks-remaining navigation |
| Training experiment and outcome | `/blog/how-pro-cyclist-trains-60-days` | First-person N=1 case study, not universal proof |
| Friel/Lorang/Johnson synthesis | `/blog/cycling-training-plan-build-friel-lorang-johnson` | Named-expert synthesis; preserve, but do not promote as a broad owner until its claims receive a separate evidence review |

## Demand and page distribution

The site baseline was 100,578 clicks, 8,053,309 impressions, 1.2% CTR and average position 7.4.

Queries containing `training plan` produced 337 clicks from 8,226 impressions, 4.1% CTR and average position 8.9. GSC returned 318 query rows and 266 page rows. Leading queries were:

| Query | Clicks | Impressions |
| --- | ---: | ---: |
| tadej pogacar training plan | 40 | 233 |
| cycling training plan | 35 | 840 |
| pogacar training plan | 23 | 104 |
| mallorca 312 training plan | 19 | 339 |
| gran fondo training plan | 17 | 198 |
| pro cyclist training plan | 16 | 103 |
| fred whitton training plan | 14 | 173 |
| dan lorang training plan | 12 | 53 |
| road cycling training plan | 11 | 311 |
| 16 week ironman training plan | 9 | 140 |

The leading pages for this query family were the 60-day case study (88 clicks / 1,919 impressions), Pogačar article (63 / 335), 16-week Ironman plan (18 / 382), Gran Fondo plan (17 / 221), Fred Whitton guide (15 / 371) and Mallorca 312 guide (14 / 540). This confirms that event, athlete and case-study intent should remain distributed across specialist pages.

## Broad-query cannibalisation baseline

Exact query `cycling training plan` produced 35 clicks from 840 impressions, 4.2% CTR and average position 7.4 across 15 Roadman URLs. The 60-day case study accounted for 34 clicks and 780 impressions. The Joe Friel perfect-week article had 1 click / 49 impressions; the Friel/Lorang/Johnson article had 1 / 4; the methodology hub had 0 / 17. `/training-plans` did not appear for the exact query during this pre-release window.

Exact page baselines:

- `/training-plans`: 6 clicks, 151 impressions, 4.0% CTR, average position 14.4; 18 visible query rows. It had only just launched on 25 August, so this is not a mature owner baseline.
- `/blog/how-pro-cyclist-trains-60-days`: 654 clicks, 28,475 impressions, 2.3% CTR, average position 6; 419 query rows. Its leading broad queries included `cycling training plan` (34 / 780), `cycling training` (21 / 901), `pro cyclist training plan` (16 / 104), `cycling training program` (12 / 214) and `road cycling training plan` (11 / 239).
- `/topics/cycling-training-plans`: 25 clicks, 2,667 impressions, 0.9% CTR, average position 30.4; 131 query rows. The page showed weak broad-plan visibility and unrelated tutorial-query leakage, supporting a tighter educational scope.
- `/blog/cycling-training-plan-build-friel-lorang-johnson`: 44 clicks, 3,294 impressions, 1.3% CTR, average position 14.7; 68 query rows. Demand is mainly named-framework intent such as Joe Friel, Dan Lorang and Dylan Johnson, so it remains a separate supporting URL.

## Release changes

- Rewrote the `/training-plans` proposition as the coached service: 16-week TrainingPeaks plan for 6–12 hours a week, weekly review, live group coaching and current price/terms.
- Added a visible reviewed service-facts answer, intent routing, bounded claims, current offer data, author/editor/publisher relationships and product offer seller data.
- Rebuilt the methodology hub around rider briefs, periodisation, intensity distribution, week sequencing, review rules and primary/systematic evidence. It explicitly distinguishes education from Roadman's paid service.
- Rebuilt the selection guide as a reviewed ten-check comparison framework.
- Added reviewer and freshness data to the 60-day case study while preserving its N=1 limits and canonical URL.
- Added explicit owner/supporting relationships, LLM routing, benchmark prompts, sitemap freshness and IndexNow discovery URLs.
- Did not redirect the case study or named-framework page. The expected change is gradual broad-query transfer through clearer intent signals, without sacrificing their specialist demand.

## Measurement cohorts

Use complete post-release days only; do not compare partial days with the baseline.

| Cohort | Dates | Earliest useful read | Purpose |
| --- | --- | --- | --- |
| Seven complete days | 27 August–2 September 2026 | 5 September 2026 | Indexing, first-query ownership and obvious regressions |
| Twenty-eight complete days | 27 August–23 September 2026 | 26 September 2026 | Meaningful query/page distribution and CTR comparison |

Track the exact query `cycling training plan`, contains-query `training plan`, and exact pages above. Success is not simply fewer impressions on the case study. It is increased `/training-plans` impressions and qualified clicks for broad/commercial terms, sustained specialist traffic on the case study and event guides, stronger educational relevance on the topic hub, and fewer broad queries split across weakly differentiated pages.

## Guardrails

- Do not redirect or deindex the 60-day case study while it holds meaningful search demand.
- Investigate any material loss on pro-cyclist, experiment or results queries separately from broad-plan transfer.
- Do not claim that one periodisation or intensity model is universally superior.
- Treat testimonials and the 60-day experiment as individual outcomes, not forecasts.
- Keep health, medical diagnosis and individual sports-nutrition treatment outside the coaching-plan promise.
