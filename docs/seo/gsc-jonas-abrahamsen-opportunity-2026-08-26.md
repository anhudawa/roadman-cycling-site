# Jonas Abrahamsen search-owner decision — 26 August 2026

## Decision

Keep and strengthen the established owner:

`/podcast/ep-29-untold-story-ofjonas-abrahamsens-pro-winter-training`

Do not change the established typo-bearing slug, create another broad biography
or redirect the guest and expert pages. The episode owns the broad name query
and its distinctive interview intent. The guest profile remains the canonical
Person support page, while the expert page remains topic navigation. Both point
users and structured entities back to the established episode and guest record.

## Google Search Console baseline

Source: Google Search Console Performance, exact query `jonas abrahamsen`,
three-month view captured on 26 August 2026.

- 61 clicks
- 6,479 impressions
- 0.9% CTR
- Average position 9.5

Leading pages for the exact query:

| URL | Clicks | Impressions |
| --- | ---: | ---: |
| `/podcast/ep-29-untold-story-ofjonas-abrahamsens-pro-winter-training` | 60 | 6,179 |
| `/guests/jonas-abrahamsen` | 1 | 312 |
| `/experts/jonas-abrahamsen` | 0 | 29 |
| `/blog/pre-ride-breakfast-cyclists-guide` | 0 | 1 |
| `www.roadmancycling.com/guests/jonas-abrahamsen` | 0 | 1 |

Page impressions are not additive because more than one Roadman URL can appear
in the same result set. The episode appeared in 95.4% of exact-query impressions
and earned 98.4% of exact-query clicks. Replacing it or changing its slug would
risk the strongest existing signal in this query family.

## Problems found

- Search metadata led with an unsourced individual VO2-max number instead of
  the verified Tour result and the interview's broader value.
- The answer capsule, FAQ, biography, body copy and structured data incorrectly
  called Abrahamsen a 2024 Tour de France stage winner. He won Stage 11 in 2025;
  his 2024 Tour was the green- and polka-dot-jersey breakout.
- The page presented self-reported weight, power, VO2-max, altitude and training
  figures as independently established facts.
- The heat-training FAQ claimed an individual 10% haemoglobin-mass gain and a
  causal VO2-max increase. The published elite-cyclist study found a 42g (4.6%)
  group increase in haemoglobin mass but no statistically greater VO2-max or
  performance gain than control.
- The page cited a broader 10-day heat-acclimation paper instead of the matching
  five-week Lillehammer elite-cyclist study.
- The Person entity lacked verified identity links, current WorldTour team
  context, reviewed sources and a transparent official-record/interview boundary.
- Surfaced quotations exposed raw transcript errors instead of readable,
  meaning-preserving excerpts.

## Changes prepared

- Direct title and description for the established episode owner, led by the
  2025 Tour win and 18kg interview hook.
- Correct 2025 Stage 11 and 2024 jersey history across visible copy, FAQ,
  metadata, schema-facing fields and supporting episode copy.
- Explicit distinction between official race/team records, Abrahamsen's own
  retrospective figures and group-level peer-reviewed heat-training evidence.
- Matching Rønnestad et al. five-week heat-training paper, official Tour reports,
  current Uno-X roster and UCI identity record added.
- Guest ProfilePage strengthened with reviewed sources, review disclosure,
  FAQs, current credential, sameAs links and a differentiated support role.
- Canonical entity registry, generic guest copy, `llms.txt`, IndexNow priorities
  and AI benchmark prompt 230 updated.

## Measurement

- 7-day cohort: 27 August–2 September 2026; earliest reliable review
  **5 September 2026**.
- 28-day cohort: 27 August–23 September 2026; earliest reliable review
  **26 September 2026**.

Track exact-query clicks, impressions, CTR and position for the episode owner.
Also track whether the guest and expert support pages retain entity and topic
queries without increasing broad-name-query overlap. The first target is a
material CTR lift from 0.9% while preserving or improving the current 9.5
average position and established canonical URL.

Manual Google URL inspection and “Request indexing” remain a separate approved
action. IndexNow does not submit to Google.
