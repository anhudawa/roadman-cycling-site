# Cycling Zone 5 search-owner decision — 26 August 2026

## Decision

Keep `/blog/cycling-zone-5-vo2max-intervals-guide` as the distinct owner for **cycling Zone 5**, **Zone 5 cycling**, **Zone 5 VO2 max**, **Zone 5 intervals** and the interpretation of power, heart-rate and research zone models.

- Rebuild the page around the direct question: what does Zone 5 mean in cycling?
- Keep the page separate from `/blog/cycling-vo2max-intervals`, which owns workout formats, protocol comparison, execution and progression.
- Do not repeat full 4×4, 4×8, 30/15 or block prescriptions on the Zone 5 page.
- Add a canonicalised `/glossary/zone-5` entity entry that permanently resolves to the article rather than creating another indexable definition page.
- Replace fixed frequency, recovery, age-decline and gain promises with model-specific definitions and evidence boundaries.

## Google Search Console baseline

Source: Search results performance, exact page and query filters, 24 May–23 August 2026. Search Console rounds page totals and can omit low-volume rows for privacy.

### Page owner

| URL                                           | Clicks | Impressions |  CTR | Average position | Role after release                     |
| --------------------------------------------- | -----: | ----------: | ---: | ---------------: | -------------------------------------- |
| `/blog/cycling-zone-5-vo2max-intervals-guide` |     19 |       1.15K | 1.7% |              7.5 | Canonical Zone 5 definition owner      |
| `/blog/cycling-vo2max-intervals`              |  1.05K |       71.8K | 1.5% |              4.8 | Separate VO2max workout/protocol owner |

The Zone 5 page already has an established search footprint, but its 1.7% CTR and position 7.5 leave a title, answer-quality and intent-alignment opportunity. Redirecting it would discard a visible, narrower job and push definition queries into a protocol-comparison page.

### Visible exact Zone 5 queries

| Exact query                                              | Clicks | Impressions | CTR | Average position |
| -------------------------------------------------------- | -----: | ----------: | --: | ---------------: |
| `zone 5 vo2 max`                                         |      0 |          13 |  0% |              7.1 |
| `zone 5 cycling`                                         |      0 |           9 |  0% |              5.1 |
| `zone 5 intervals`                                       |      0 |           7 |  0% |              6.6 |
| `is zone 5 vo2 max`                                      |      0 |           7 |  0% |              7.0 |
| `is vo2 max zone 5`                                      |      0 |           7 |  0% |              8.3 |
| `trainerroad vo2 max intervals 3-5 minutes 106-120% ftp` |      0 |           6 |  0% |              6.5 |
| `how much zone 5 per week`                               |      0 |           5 |  0% |              8.4 |

The visible rows are small because of query privacy and fragmentation, but their wording is consistent: users want the definition, relationship with VO2max, percentage interpretation and weekly boundary. The former page diluted that job with a long workout catalogue and rigid periodisation claims.

## Problems corrected

The former page stated or implied that:

- Zone 5 has the same meaning in every zone model;
- 106–120% FTP proves the rider is at VO2max;
- power Zone 5 and heart-rate Zone 5 should align in real time;
- every rider can sustain the zone for the same three-to-eight-minute duration;
- two sessions per week is a research-backed ceiling;
- recovery always takes 36–48 hours;
- every block must stop after four to six weeks;
- suppressed heart rate diagnoses cardiac fatigue or overtraining;
- masters VO2max declines by one fixed percentage per decade; and
- a fixed number of Zone 5 minutes produces a guaranteed 3–8% gain.

The replacement names the model before the number, distinguishes an FTP band from measured oxygen uptake, explains heart-rate and oxygen-uptake lag, introduces critical-power and power-duration context, and places dose inside the complete training programme. It adds six cited claims, six direct FAQs and a six-step interpretation HowTo.

## Evidence record

| Question                                   | Evidence used                                                                                                                     | Boundary applied                                                                                      |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| What is Coggan Zone 5?                     | Andrew Coggan's TrainingPeaks power-level explanation                                                                             | 106–120% FTP is a named band in that model, not a universal biological switch                         |
| Do zone models use the same numbers?       | Zhou et al. 2025 model-comparison review, PMID 41169886                                                                           | Three-zone and five-/seven-zone labels cannot be compared without translation                         |
| Is FTP a precise physiological threshold?  | Mackey and Horner 2021 scoping review, PMID 34304689; Borszcz et al. 2018, PMID 29801189                                          | FTP methods can be repeatable but show large individual limits of agreement                           |
| Does FTP describe severe-intensity work?   | Chorley and Lamb 2020 critical-power review, PMID 32899777; Leo et al. 2022 power-profile review, PMID 34708276                   | Power above the heavy–severe boundary also depends on W′ and the power-duration profile               |
| Should heart rate match power immediately? | Festa et al. 2022 oxygen-uptake kinetics review, PMID 35995143; Meyler et al. 2025 intensity-prescription meta-analysis, 39538060 | Power, heart rate and RPE are different signals; generic anchors can classify riders differently      |
| Is there one frequency or gain formula?    | Stavrinou et al. 2025 FITT review, PMID 40247924; Schoenmakers et al. 2026 systematic review, PMID 42237396                       | Frequency interacts with the whole dose; acute time near VO2max does not guarantee chronic adaptation |
| What safety boundary applies?              | American Society for Preventive Cardiology clinical practice statement, PMID 36281325                                             | Stop for concerning symptoms and use appropriate clinical guidance; a zone display is not a diagnosis |

## Ownership map

| Search job                                                 | Owner                                                                 |
| ---------------------------------------------------------- | --------------------------------------------------------------------- |
| What cycling Zone 5 means across power, HR and zone models | `/blog/cycling-zone-5-vo2max-intervals-guide`                         |
| VO2max workout formats, execution and progression          | `/blog/cycling-vo2max-intervals`                                      |
| Beginner interval readiness and first progression          | `/blog/cycling-interval-training-beginners`                           |
| Masters-specific VO2max programming                        | `/blog/vo2-max-workouts-cyclists-over-40`                             |
| Understanding a VO2max number                              | `/blog/vo2max-cycling-what-your-number-means-guide`                   |
| Cycling zone calculator                                    | `/tools/ftp-zones`                                                    |
| Zone 5 glossary entity                                     | `/glossary/zone-5` → permanent canonical redirect to the Zone 5 owner |

## Measurement cohort

Do not change the title, canonical target or intent boundary before the first stable comparison unless a factual or safety correction is required.

- **5 September 2026:** verify the article, `/glossary/zone-5` redirect, canonical, schema, sitemap, LLM discovery and internal handoffs; record only directional movement.
- **26 September 2026:** compare the same 28-day page and query cohort with the preceding 28 days, allowing for Search Console reporting lag.
- Primary measures: total page clicks, impressions, CTR and average position; impressions and position for the seven exact query rows; discovery of new `cycling zone 5 power` and `cycling zone 5 heart rate` variants.
- Guardrail: broad 4×4, 4×8, 30/15 and VO2max-workout queries should continue to resolve to `/blog/cycling-vo2max-intervals`, not migrate to the Zone 5 definition owner.
- Secondary measures: FAQ/HowTo eligibility, AI benchmark prompt 288, AI citations and assisted visits into the workout guide or coaching journey.

## Rollback boundary

Keep the distinct URL and glossary redirect. If CTR does not improve after a stable comparison window, test the title and description on the Zone 5 owner. Do not restore the unsupported dosing claims or copy the full protocol catalogue from the VO2max interval owner.
