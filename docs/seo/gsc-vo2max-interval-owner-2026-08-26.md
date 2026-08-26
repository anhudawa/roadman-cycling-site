# VO2max interval owner decision — 26 August 2026

## Decision

Keep `/blog/cycling-vo2max-intervals` as the canonical owner for broad **VO2 max intervals cycling**, **VO2 max intervals** and related workout-selection intent.

- Rebuild the established owner around 4×4, 4×8, 30/15 and an introductory 4×3 session, with explicit evidence and monitoring limits.
- Permanently redirect `/blog/cycling-vo2max-intervals-complete-guide` and `/blog/vo2max-intervals-cycling-session-guide` to the established owner. Their metadata, content and visible queries repeat the same broad job.
- Remove and permanently redirect `/answers/how-to-do-vo2-max-intervals`; its direct answer asserted a fixed duration, recovery, frequency and heart-rate gate that the evidence does not support.
- Keep `/blog/cycling-zone-5-vo2max-intervals-guide` for the narrower **what is Zone 5 cycling?** job.
- Keep the masters, low-score diagnostic and VO2max measurement pages separate.

This supersedes only the session-guide retention decision in the 25 August diagnostic audit. That audit used a 28-day window to separate diagnostic intent; the present review uses the full three-month window and exact interval-query splits.

## Google Search Console baseline

Source: Search results performance, exact site URLs and exact query filters, 24 May–23 August 2026. Search Console rounds some headline totals and hides low-volume page-query rows for privacy.

### Page owners

| URL                                             | Clicks | Impressions |  CTR | Average position | Role after release                         |
| ----------------------------------------------- | -----: | ----------: | ---: | ---------------: | ------------------------------------------ |
| `/blog/cycling-vo2max-intervals`                |  1.05K |       71.8K | 1.5% |              4.8 | Canonical broad interval owner             |
| `/blog/cycling-vo2max-intervals-complete-guide` |     43 |        1.8K | 2.4% |              6.9 | Permanent redirect to owner                |
| `/blog/vo2max-intervals-cycling-session-guide`  |     65 |       3.81K | 1.7% |              8.3 | Permanent redirect to owner                |
| `/blog/cycling-zone-5-vo2max-intervals-guide`   |     19 |       1.15K | 1.7% |              7.5 | Retained Zone 5 definition/application job |
| `/topics/vo2max-training`                       |      7 |         539 | 1.3% |             11.5 | Retained navigation hub                    |

Search Console did not expose page-level headline cards for `/answers/how-to-do-vo2-max-intervals` during the check. It nevertheless appeared for the exact query `vo2 max intervals` with 10 impressions, 0 clicks and position 37.6, while the canonical owner had 806 impressions and all 16 clicks. A contemporaneous web result also surfaced the unsafe answer, which makes consolidation urgent despite its low volume.

### Exact broad queries

| Exact query                 | All-page clicks | All-page impressions |  CTR | Position | Canonical owner split                                 |
| --------------------------- | --------------: | -------------------: | ---: | -------: | ----------------------------------------------------- |
| `vo2 max intervals cycling` |              44 |                  474 | 9.3% |      2.4 | 44 clicks / 465 impressions / 9.5% CTR / position 1.7 |
| `vo2 max intervals`         |              16 |                  807 | 2.0% |      4.8 | 16 clicks / 806 impressions / position 4.8            |
| `vo2max intervals cycling`  |              13 |                  135 | 9.6% |      2.0 | 13 clicks / 134 impressions / 9.7% CTR / position 1.6 |
| `cycling vo2 max intervals` |              13 |                  158 | 8.2% |      6.4 | 13 clicks / 136 impressions / 9.6% CTR / position 2.1 |

The session-guide duplicate received 0 clicks for these visible exact queries and ranked between positions 15.9 and 33.8. The complete-guide duplicate received 0 clicks and only one or two impressions. This supports transferring their history to the incumbent rather than maintaining separate broad answers.

Exact plan variants showed no durable separate job:

- `vo2max training plan cycling`: 0 impressions;
- `6 week vo2 max cycling plan`: 0 impressions; and
- `vo2 max training plan cycling`: 46 impressions across the site, led by the masters page and canonical interval owner rather than the session guide.

## Problems corrected

The old cluster blurred evidence, coaching convention and guarantee. It claimed or implied that:

- VO2max is a single ceiling that mechanically determines FTP and race performance;
- Helgerud's 4×4 trial was cycling research and made 4×4 the best-validated cycling workout;
- every VO2max interval must be 3–8 minutes at 106–120% FTP;
- heart rate must exceed 90% or 95% of maximum for the work to count;
- equal-duration recovery is required and clears lactate faster;
- 30/15 is categorically superior to long intervals;
- two weekly sessions are the universal ceiling;
- blocks expire after four to six weeks; and
- riders can expect fixed 3–12% improvements by age and protocol.

The replacement distinguishes the running and cycling trials, explains small samples and intensity-control effects, adds six cited claims, six FAQs and a six-step first-session HowTo, and includes explicit medical and road-safety boundaries.

## Ownership map

| Search job                                                                 | Owner                                               |
| -------------------------------------------------------------------------- | --------------------------------------------------- |
| Broad VO2max interval definition, format choice, execution and progression | `/blog/cycling-vo2max-intervals`                    |
| Zone 5 label and its place among training zones                            | `/blog/cycling-zone-5-vo2max-intervals-guide`       |
| Masters-specific VO2max programming                                        | `/blog/vo2-max-workouts-cyclists-over-40`           |
| Unexpected low score and diagnostic next steps                             | `/blog/vo2max-cycling-fixable-reasons-low`          |
| Measurement and interpretation of the number                               | `/blog/vo2max-cycling-what-your-number-means-guide` |
| VO2max topic navigation                                                    | `/topics/vo2max-training`                           |

## Measurement cohort

Do not make another title, canonical, redirect or broad-intent change to the canonical owner before the first stable comparison unless a factual or safety correction is required.

- **5 September 2026:** confirm the owner, three redirects, canonical, sitemap and machine-discovery files are stable; note only directional movement.
- **26 September 2026:** compare the same 28-day query and page cohort with the preceding 28 days, allowing for reporting lag.
- Primary measures: clicks, impressions, CTR and average position for the four exact queries; total owner visibility; duplicate impressions transferring toward the owner; and Zone 5 visibility remaining distinct.
- Secondary measures: FAQ/HowTo eligibility, AI benchmark prompt 287, AI citations and assisted coaching visits.

## Rollback boundary

Keep the redirects. If broad-query performance materially declines after a full comparison window, test title and snippet language on the canonical owner rather than recreating the duplicates. Recreate a separate plan page only if Search Console later demonstrates a durable plan-specific query job that the canonical, masters and training-plan pages do not serve.
