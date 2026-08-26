# Domestique search-owner decision — 26 August 2026

## Decision

Keep and strengthen the established owner:

`/answers/what-is-a-domestique`

Permanently redirect `/glossary/domestique` to the answer owner, remove the
legacy URL from XML sitemaps and route glossary, feed, API and knowledge-graph
links to the answer. Keep the term in the glossary set, but identify the answer
URL as its canonical `DefinedTerm` entity.

## Google Search Console baseline

Source: Google Search Console Performance, exact query `domestique cycling`,
three-month view through 24 August 2026, captured on 26 August 2026.

- 18 clicks
- 4,806 impressions
- 0.4% CTR
- Average position 7.6

Leading pages for the exact query:

| URL                                | Clicks | Impressions |  CTR | Position |
| ---------------------------------- | -----: | ----------: | ---: | -------: |
| `/answers/what-is-a-domestique`    |     18 |       4,716 | 0.4% |      7.6 |
| `/glossary/domestique`             |      0 |         183 |   0% |      7.9 |

Page impressions are not additive because Google can show more than one
Roadman URL in a result set. The answer already captures all exact-query
clicks, while the glossary URL competes at almost the same average position.
That makes consolidation preferable to creating or moving the owner.

## Problems found

- The title was longer than the search result needed and did not foreground
  the role's jobs and tactical meaning.
- The direct answer exceeded Roadman's 40–80-word extraction standard.
- The answer and glossary repeated the same definition at two indexable URLs.
- The glossary used unsourced, time-sensitive rider examples.
- The answer reduced the role to sacrifice for one leader rather than a
  stage-specific assignment supporting a protected rider or team plan.
- It did not distinguish a domestique from a road captain, super-domestique or
  lead-out rider.
- Bottle collection and mechanical help were stated without current UCI rule
  boundaries.
- George Hincapie was presented as an uncomplicated exemplar without the
  historical and anti-doping boundary already disclosed in Roadman's profile.
- Answer pages had no reusable field for visible reviewed references or
  structured `citation` data.

## Changes prepared

- CTR-focused title and description aligned to meaning, jobs and tactics.
- A 71-word answer capsule, four extractable takeaways, three viewing prompts,
  three corrected misconceptions and six FAQs.
- Official Tour de France evidence for team support and the best-teammate role.
- Current UCI road regulations for feeding and rider-conduct boundaries.
- An official UCI example distinguishing domestique and road-captain duties.
- First-person Roadman road-captain evidence with an explicit anti-doping
  disclosure boundary.
- Reusable answer-page source fields, visible reviewed-reference links,
  Article `citation`, structured reviewer and optional `DefinedTerm` schema.
- Permanent glossary redirect, sitemap exclusion and canonical URL routing in
  the glossary index, public feeds, search API and knowledge graph.
- `llms.txt`, IndexNow priority URLs and AI benchmark prompt 272.

## Measurement

- 7-day cohort: 27 August–2 September 2026; earliest reliable review
  **5 September 2026**.
- 28-day cohort: 27 August–23 September 2026; earliest reliable review
  **26 September 2026**.

Track exact-query clicks, impressions, CTR and position for the answer owner.
Also track `what is a domestique`, `domestique meaning cycling`, `cycling
domestique role`, `super domestique` and `road captain cycling`. The first goal
is to eliminate the competing glossary impression set, raise CTR from 0.4% and
move the answer from position 7.6 into the top five.

Manual Google URL inspection and “Request indexing” remain a separate approved
action. IndexNow does not submit to Google.
