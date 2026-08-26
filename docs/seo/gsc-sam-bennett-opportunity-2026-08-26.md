# Sam Bennett search-owner decision — 26 August 2026

## Decision

Keep and broaden the established owner:

`/blog/sam-bennett-what-sprinters-do-differently`

Permanently redirect the inaccurate legacy `/entity/sam-bennett` page to the
owner. Keep the four podcast pages indexable because each serves a narrower
race-recap or episode intent. Do not create a guest page: Bennett did not appear
in those episodes.

## Google Search Console baseline

Source: Google Search Console Performance, exact query `sam bennett cyclist`,
three-month view captured on 26 August 2026.

- 19 clicks
- 2,918 impressions
- 0.7% CTR
- Average position 9.6

Leading pages for the exact query:

| URL                                                       | Clicks | Impressions |  CTR | Position |
| --------------------------------------------------------- | -----: | ----------: | ---: | -------: |
| `/blog/sam-bennett-what-sprinters-do-differently`         |     19 |       2,916 | 0.7% |      9.6 |
| `/podcast/the-mystery-around-sam-bennett-and-la-tour-de-france` | 0 | 3 | 0% | 3.0 |
| Other Tour article                                        |      0 |           1 |   0% |        — |

Page impressions are not additive because Google can show more than one
Roadman URL in a result set. The article already owns 99.9% of exact-query
impressions, so the correct move is to strengthen it rather than move the
identity intent to a new URL.

## Problems found

- The search owner was framed as a tactical article but the exact query asks
  for the rider's identity and career.
- The title did not lead with Sam Bennett and the search description was long,
  dated and built around an absolute “150m” claim.
- The article and entity record called Bennett one of the world's fastest or
  Ireland's greatest sprinter without defining or sourcing those comparisons.
- The entity record named Decathlon–AG2R La Mondiale even though Bennett rides
  for Pinarello Q36.5 in 2026.
- It claimed four Roadman guest appearances and linked a nonexistent guest
  profile. The four Bennett-centred episodes are Anthony Walsh solo analyses.
- The page had no reviewer, visible official sources, claim-level evidence
  boundaries or current-career section.
- A bare Person mention pointing at an article URL would not emit the full
  Person node needed to make that article a coherent identity owner.
- The tactical advice did not distinguish controlled sprint practice from
  unsafe open-road or crowded sportive sprinting.

## Changes prepared

- Direct-answer title, description, opening and quick facts aligned with the
  broad identity query.
- Current Pinarello Q36.5 affiliation and a source-bounded 2026 return section.
- Official Tour and UCI verification of the two 2020 Tour stages, points title
  and stage wins across all three Grand Tours.
- Clear separation between career facts and Anthony Walsh's interpretation of
  the 2021 Brugge-De Panne finish.
- Five FAQs, five claim-review rows and seven visible sources.
- Corrected entity relationship: four host analyses, zero asserted guest
  appearances and no nonexistent guest link.
- Legacy entity redirect and sitemap consolidation on the established owner.
- Reusable blog-owner schema: a biography article can now emit its full
  co-located Person node, treat the person as `about` rather than `mentions`,
  and suppress a visible self-link in the featured-expert strip.
- Current canonical entity registry, `llms.txt`, IndexNow priority set and AI
  benchmark prompt 271.
- Explicit safety boundary for controlled or sanctioned sprint practice.

## Measurement

- 7-day cohort: 27 August–2 September 2026; earliest reliable review
  **5 September 2026**.
- 28-day cohort: 27 August–23 September 2026; earliest reliable review
  **26 September 2026**.

Track exact-query clicks, impressions, CTR and position for the article owner.
Also track `sam bennett team`, `sam bennett green jersey`, `sam bennett tour de
france` and `sam bennett podcast`. The first goal is to keep the clean owner,
lift its 0.7% CTR and move the exact query from position 9.6 into the top five.

Manual Google URL inspection and “Request indexing” remain a separate approved
action. IndexNow does not submit to Google.
