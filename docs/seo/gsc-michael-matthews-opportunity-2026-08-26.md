# Michael Matthews search-owner decision — 26 August 2026

## Decision

Make the complete guest profile the single broad identity owner:

`/guests/michael-matthews`

Permanently redirect the legacy duplicate `/entity/michael-matthews` page to
the owner. Keep the expert topic index, two podcast episodes and training
article indexable because each serves a narrower intent. Point their Person
references and visible identity links back to the guest owner.

## Google Search Console baseline

Source: Google Search Console Performance, exact query
`michael matthews cyclist`, three-month view captured on 26 August 2026.

- 10 clicks
- 3,509 impressions
- 0.3% CTR
- Average position 11.8

Leading pages for the exact query:

| URL                                                                      | Clicks | Impressions |  CTR | Position |
| ------------------------------------------------------------------------ | -----: | ----------: | ---: | -------: |
| `/podcast/ep-4-15-years-of-pro-riding-what-amateurs-don-t-know-matthews` |      5 |       2,770 | 0.2% |     12.3 |
| `/blog/michael-matthews-no-base-miles-pro-training`                      |      3 |         488 | 0.6% |     10.8 |
| `/entity/michael-matthews`                                               |      2 |         208 | 1.0% |      9.1 |
| `/experts/michael-matthews`                                              |      0 |          42 |   0% |     11.0 |
| `/podcast/bling-matthews-the-hunt-for-green-jerseys`                     |      0 |          12 |   0% |      3.3 |
| `/guests/michael-matthews`                                               |      0 |           9 |   0% |     12.1 |

Page impressions are not additive because Google can show more than one
Roadman URL in a result set. The broad query currently lands mostly on a
training interview even though its intent is the cyclist's identity and career.
The guest profile is the durable identity surface because it can carry the
current record and every Roadman appearance without turning one episode into a
generic biography.

## Problems found

- Six Roadman URLs appeared for the same broad identity query.
- The legacy entity and guest pages emitted different Person `@id` values for
  the same human.
- The guest title was the generic `Michael Matthews — Podcast Guest` and its
  short description did not answer career or current-team intent.
- The 2020 Roadman interview did not declare Michael Matthews as its guest, so
  it was absent from his profile and the shared Person graph.
- The profile had no visible sources, FAQs, reviewer or review date.
- Current Team Jayco AlUla affiliation was marked unverified even though the
  team and UCI both publish a current record; the team has announced a contract
  through the end of 2027.
- The Instagram identity used a legacy path instead of the current `bling90`
  profile, and Wikidata was absent.
- The main training episode said a polarised experiment cost Matthews top-end
  power. The transcript says he could perform the efforts but felt underdone
  for the race.
- The supporting article described high-200s to low-300s watts as “high-300”
  watts and misspelled coach Brian Stephens's surname.

## Changes prepared

- Direct biography-and-career title and description for the guest owner.
- Current visible credential, current-team relationship and contract boundary.
- Six fact-first bullets, five FAQs and six visible reviewed sources.
- ProfilePage review date, reviewer, citations and FAQ structured data.
- Official Team Jayco AlUla, UCI, Tour de France and Australian Olympic records
  distinguish career facts from first-person Roadman training statements.
- The legacy entity record now declares the guest owner, permanently redirects
  to it and is excluded from the sitemap.
- Featured-expert links and Article Person mentions resolve to the owner rather
  than creating a second Person node.
- The 2020 interview now joins the profile and PodcastEpisode graph.
- Transcript-faithful training summary, claim and surfaced quotations.
- `llms.txt`, IndexNow priority set and AI benchmark prompt 270 extended.

## Measurement

- 7-day cohort: 27 August–2 September 2026; earliest reliable review
  **5 September 2026**.
- 28-day cohort: 27 August–23 September 2026; earliest reliable review
  **26 September 2026**.

Track the exact-query clicks, impressions, CTR and position for the guest
owner. Also track whether the training episode and article retain their
training-specific queries while losing broad identity overlap. The first goal
is to replace the six-way split with one identity result and lift broad-query
CTR from 0.3%.

Manual Google URL inspection and “Request indexing” remain a separate approved
action. IndexNow does not submit to Google.
