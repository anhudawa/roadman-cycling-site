# Tour-stage recovery search cluster — 31 August 2026

## Opportunity

Google Search Console recorded 9,910 impressions and 46 clicks for queries
containing "recovery" in the three months to 29 August 2026: 0.5% CTR at an
average position of 6.5. The broad active-recovery guide remains its existing
owner. This release repairs a narrower Pogačar / Tour-stage cluster that had two
podcast episodes and a companion article describing almost the same routine.

The newer Tour-stage podcast scored 79/100 in the episode-coverage audit. It had
chapters and reviewed editorial citations, but lacked a transcript,
`segmentTitles` and `guestBio`. Its more important problem was a set of
search-visible guarantees about recovery windows, tart cherry, cold water,
massage and pre-sleep protein.

## Intent separation

- `/blog/pogacar-recovery-routine` is the Pogačar recovery-routine article
  owner and evidence summary.
- `/podcast/ep-31-5-things-pogacar-always-does-after-a-ride` covers the first
  60 minutes and the boundary between observed practice and evidence.
- `/podcast/pogacar-tour-de-france-recovery-routine` now targets the overnight
  Tour de France stage-recovery sequence.
- `/blog/tour-de-france-recovery-between-stages` retains the broader between-
  stages protocol job and is a future evidence-review target.

The two podcast pages now link to each other with descriptive anchors. The
companion article links to both, so their different jobs are explicit to users
and crawlers.

## Evidence corrections

- Rapid glycogen restoration: about 1.2 g/kg/hour carbohydrate, or 0.8
  g/kg/hour carbohydrate with 0.2-0.4 g/kg/hour protein, when the recovery
  period is under four hours. No universal one-hour deadline is claimed.
- Tart cherry: selected possible benefits, substantial heterogeneity,
  low-to-moderate certainty and no significant pooled soreness result in the
  2026 athlete review.
- Cold-water immersion: the clearest repeated-use downside is attenuated
  strength adaptation. Endurance effects are mixed, so cycling adaptation is
  not described as universally erased.
- Massage: no pooled direct performance benefit, with small soreness and
  flexibility effects.
- Pre-sleep protein: overnight synthesis is plausible; total intake comes first,
  and a high-protein professional-cyclist trial found no recovery benefit.

## Product handoff

The episode and article route practical intent into `/tools/recovery-screen`,
`/tools/training-readiness` and the single app waiting list. The app message is
the actual product thesis: recovery inputs should change the strength and
conditioning decision instead of sitting beside it as generic advice.
