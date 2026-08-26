# George Hincapie search-owner decision — 26 August 2026

## Decision

Keep and strengthen the established owner:

`/guests/george-hincapie`

Do not redirect the expert index or podcast episodes. The guest profile owns
the broad biography query; the expert index remains a topic navigation page and
the episodes retain interview-specific intent. Point the shared Person entity
back to the guest profile.

## Google Search Console baseline

Source: Google Search Console Performance, exact query `george hincapie`,
three-month view captured on 26 August 2026.

- 13 clicks
- 7,311 impressions
- 0.2% CTR
- Average position 10

Leading pages for the exact query:

| URL | Clicks | Impressions |
| --- | ---: | ---: |
| `/guests/george-hincapie` | 9 | 6,306 |
| `/experts/george-hincapie` | 4 | 992 |
| `/podcast/ep-2231-the-untold-story-of-my-time-with-lance-hincapie` | 0 | 52 |
| `/podcast/ep-2536-hincape-opens-up-about-how-pogacar-can-win-roubaix` | 0 | 10 |

Four other Roadman URLs appeared once each. Page impressions are not additive
because more than one Roadman URL can appear in the same result set. The guest
owner appeared in 86.3% of exact-query impressions and received 69.2% of the
clicks, so replacing it with a new article would create avoidable competition.

## Problems found

- The title was the generic `George Hincapie — Podcast Guest`, despite the page
  already ranking around the first-page boundary for the broad name query.
- The description inherited a terse `17x Tour de France starter, team leader`
  credential and did not answer the current-career or US Postal intent.
- The page had no visible sources, review date or FAQ answers for the major
  questions around Hincapie's career and anti-doping record.
- Doping was described as a team-level idea without plainly stating Hincapie's
  own admission, sworn evidence and accepted results disqualification.
- The page described Modern Adventure as a 2025 launch instead of reflecting
  Hincapie's current 2026 founder and team-lead role.
- The current-team entity pointed to the Hincapie shop rather than the team's
  leadership page, and the Person `sameAs` set omitted Wikidata.
- The main Roubaix episode confused seven top-10 finishes with seven starts.
  Hincapie's record is 17 Paris-Roubaix starts and seven top-10 results.
- Three surfaced quotations contained raw transcription errors, including
  `Coppenberg`, `pelaton`, an incomplete word and a non-existent `Alpas team`.

## Changes prepared

- Direct broad-intent title and description for the established guest owner.
- Current visible credential and Modern Adventure team relationship.
- Source-bounded direct answer covering 17 Tour starts, five Olympics, the
  official USADA record and the current team role.
- Six fact-first bullets, five visible FAQs and five reviewed sources.
- ProfilePage review date, reviewer, citations and FAQ structured data.
- Wikidata and current-team entity links added to the Person graph.
- Expert topic index keeps its differentiated title while its shared Person
  entity now uses the guest profile as the canonical entity URL.
- Roubaix episode metadata corrected to 17 starts and seven top-10 results;
  visible quote transcriptions cleaned without changing their meaning.
- `llms.txt`, IndexNow priority set and AI benchmark prompt 228 extended.

## Measurement

- 7-day cohort: 27 August–2 September 2026; earliest reliable review
  **5 September 2026**.
- 28-day cohort: 27 August–23 September 2026; earliest reliable review
  **26 September 2026**.

Track exact-query clicks, impressions, CTR and position for the guest owner.
Also track whether the expert index retains topic queries while losing broad
name-query overlap. The current target is a material CTR lift from 0.2% without
changing the established canonical URL.

Manual Google URL inspection and “Request indexing” remain a separate approved
action. IndexNow does not submit to Google.
