# Strength, recovery and app search baseline

**Captured:** 2026-08-28

**Source:** Google Search Console, Web search, last three months

**Reporting window shown by GSC:** 2026-05-27 to 2026-08-26

**Data note:** Google warns that totals and table results can be partial when filters are applied.

## Strength and gym cluster

Filter: `strength|gym|recovery|readiness|soreness|mobility|weight training|resistance training|lifting`

- 707 clicks
- 30,286 impressions
- 2.3% CTR
- Average position 7.7

Top queries included:

| Query                                  | Clicks | Impressions |
| -------------------------------------- | -----: | ----------: |
| strength training for cyclists         |     92 |       1,604 |
| cycling strength training              |     26 |         915 |
| gym workout for cyclists               |     26 |         159 |
| strength training for cyclists over 50 |     25 |         128 |
| weight training for cyclists over 50   |     23 |         100 |
| gym exercises for cyclists             |     21 |         239 |
| gym routine for cyclists               |     20 |          97 |
| cycling gym workout                    |     17 |         598 |

Top pages included:

| Page                                                    | Clicks | Impressions |
| ------------------------------------------------------- | -----: | ----------: |
| `/blog/cycling-strength-training-guide`                 |    310 |       9,005 |
| `/blog/cycling-gym-exercises-best`                      |    160 |       3,787 |
| `/blog/strength-training-cyclists-over-50`              |     52 |         402 |
| `/blog/cycling-mobility-routine`                        |     34 |       4,855 |
| `/blog/cycling-strength-training-12-week-beginner-plan` |     24 |         336 |
| `/blog/strength-training-cyclists-complete-guide`       |     20 |       1,226 |

## Recovery-only cluster

Filter: `recovery|readiness|soreness|rest day|fatigue|overtraining`

- 61 clicks
- 11,570 impressions
- 0.5% CTR
- Average position 7.2

Top pages included:

| Page                                              | Clicks | Impressions |
| ------------------------------------------------- | -----: | ----------: |
| `/blog/cycling-active-recovery-rides-guide`       |     11 |       2,124 |
| `/blog/tour-de-france-recovery-between-stages`    |      9 |         376 |
| `/blog/cycling-fatigue-signs-when-to-back-off`    |      7 |         522 |
| `/blog/best-recovery-foods-after-cycling`         |      4 |         490 |
| `/blog/cycling-recovery-week-what-to-actually-do` |      4 |         325 |

## App-intent caution

A broad app regex was dominated by `best indoor cycling apps` (203,065 impressions) and also matched unrelated words such as `apparel`. It is not a valid baseline for the strength-and-recovery product. Relevant rows were early but small: `best cycling training app` (1 click / 16 impressions), `best cycling training apps` (1 / 14), `best ai cycling training app` (1 / 3), `cycling training app` (0 / 10) and `cycling training apps` (0 / 5).

## Decisions

1. Preserve `/blog/cycling-strength-training-guide` as the broad informational strength owner.
2. Preserve `/blog/cycling-gym-exercises-best` as the exercise-selection owner.
3. Use `/app` as the only product, early-access and launch owner.
4. Link the two strongest trusted strength owners to `/app` now; together they account for 470 of the 707 filtered clicks.
5. Correct overconfident readiness and recovery rules before sending their users into the app funnel.
6. Treat recovery CTR as the largest near-term snippet and intent-ownership opportunity.
7. Audit the over-50 and active-recovery articles before using them as product feeders because their current fixed prescriptions conflict with Roadman's evidence boundaries.
