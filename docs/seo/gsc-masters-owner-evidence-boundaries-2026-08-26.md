# Masters owner evidence and intent boundaries

**Decision date:** 26 August 2026
**GSC property:** `sc-domain:roadmancycling.com`
**Canonical owner:** `/masters`

## Search opportunity

With an exact-page filter for 24 May–23 August 2026, `/masters` recorded 16 clicks, 331 impressions, 4.8% CTR and average position 12.6. The fixed 28-day baseline for 26 July–22 August recorded 2 clicks, 106 impressions, 1.9% CTR and position 19.5, plus 24 Google generative-AI feature impressions.

The fixed seven-day capture for 17–23 August recorded 2 clicks, 36 impressions, 5.6% CTR and position 11.7. That window predates this release and is an observational baseline, not evidence that the new work caused a change.

The owner is close enough to page one to protect its URL, title intent and indexability. The opportunity is stronger classification and citation trust, not a new competing masters hub.

## Overlap audit

Body-text term-frequency cosine similarity across four established masters guides was high:

| Pair                                                | Similarity |
| --------------------------------------------------- | ---------: |
| Weekly schedule vs 12-week plan                     |      0.780 |
| 12-week plan vs complete over-40 guide              |      0.757 |
| Weekly schedule vs three-mistake decision framework |      0.755 |
| 12-week plan vs decision framework                  |      0.717 |
| Complete guide vs decision framework                |      0.725 |
| Weekly schedule vs complete guide                   |      0.676 |

The captured GSC snapshot does not contain complete page-level totals for these four URLs. Do not redirect an established page without that evidence. Assign one job to each URL and rewrite the supporting pages in later releases.

| Intent                                                                       | Destination                                           |
| ---------------------------------------------------------------------------- | ----------------------------------------------------- |
| Broad masters cycling knowledge layer                                        | `/masters`                                            |
| Broad over-40 overview across training, health, nutrition, fit and community | `/blog/cycling-over-40-complete-guide`                |
| Three-mistake plateau decision framework                                     | `/blog/masters-cyclist-guide-getting-faster-after-40` |
| Flexible Monday-to-Sunday schedule and modification rules                    | `/blog/cycling-training-plan-masters-over-40`         |
| Twelve-week goal-specific plan examples                                      | `/blog/masters-cycling-training-plan-over-40`         |

The weekly schedule now declares `primaryHub: masters-cycling`; it previously fed the broader cycling-coaching owner.

## Evidence problems found on the owner

The owner previously converted memorable numbers and interview positions into universal masters rules:

- 5% VO2max decline per decade was presented as the trained-rider number rather than one small historical cohort result;
- all riders were assigned 48–72 hours between hard sessions;
- 80/20 and two hard sessions were presented as the age-specific answer;
- a 17-study strength meta-analysis was described as proving an over-40 effect, although it included adult cyclists without an established masters subgroup and rated the evidence low;
- 1.6–2.2 g/kg protein and one dose above 35 g were presented as masters requirements despite sparse, heterogeneous population-specific research;
- expert interview summaries were allowed to imply comparative scientific proof.

## Primary-source boundaries published

The owner now gives each claim a visible finding, limitation, source and evidence grade:

1. Rogers et al. observed 5.5% versus 12% VO2max decline per decade in 15 male masters athletes and 14 sedentary men; the result is not an individual forecast. A later review reported a 5–46% range tied closely to training changes.
2. Athlete-specific recovery evidence is limited and does not establish one 48–72-hour rule.
3. No masters-cyclist trial establishes one universal 80/20 prescription; current comparative evidence does not show an overall polarised-versus-pyramidal winner.
4. Heavy strength training has low-certainty supportive evidence for some adult-cyclist outcomes, not proof of one over-40 programme.
5. The 2025 masters-protein scoping review found only 12 heterogeneous studies and described population-specific recommendations as uncertain.
6. The adult sleep consensus establishes a minimum of seven hours for health, not one exact masters-performance dose.

The WebPage graph exposes these six claim checks and their primary citations and uses a 26 August 2026 modification date. The visible trust block names Anthony Walsh and states the review method rather than using an anonymous “coaching team” label.

## Discovery and ownership release

- Add the complete guide, weekly schedule and 12-week plan as distinct supporting destinations of the `/masters` search owner.
- Pin the weekly schedule beside the already-pinned complete guide and 12-week plan in LLM discovery.
- Replace AI-discovery claims that one study “settles” strength versus volume.
- Add high-priority AI benchmark prompts 268–269 for the fixed-recovery and universal-80/20 myths.
- Preserve all current URLs, canonicals and publication dates.

## Measurement

| Cohort                     | Dates                       | Earliest useful read | Purpose                                                                     |
| -------------------------- | --------------------------- | -------------------- | --------------------------------------------------------------------------- |
| Seven complete days        | 27 August–2 September 2026  | 5 September 2026     | Recrawl, snippet adoption and owner-query movement                          |
| Twenty-eight complete days | 27 August–23 September 2026 | 26 September 2026    | Owner CTR, average position, AI visibility and child-page intent separation |

Compare exact `/masters` clicks, impressions, CTR and average position against the fixed 28-day baseline. Track broad masters queries separately from `masters cycling age groups`, whose proper destination is the racing guide. Do not combine an irrelevant aggregate `masters` filter with cycling intent.

## Guardrails

- Do not promise that a rider will improve because they are trainable after 40.
- Do not infer an individual decline rate from a cohort average.
- Do not turn interview guidance into comparative scientific evidence.
- Do not diagnose menopause, iron deficiency, cardiovascular risk, low energy availability or another health condition from age or performance data.
- Do not redirect an overlapping guide until complete query/page evidence and its distinct job are reviewed.
