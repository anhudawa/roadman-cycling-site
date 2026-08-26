# Tyler Hamilton search-owner decision — 26 August 2026

## Decision

Keep and strengthen the established owner:

`/guests/tyler-hamilton`

Do not create another broad biography or redirect the expert index or podcast
episodes. The guest profile owns the name query; the expert index remains topic
navigation, the two leading interviews retain doping and forgiveness intent,
and the coaching interview retains power-meter training intent. Point every
shared Person entity back to the guest profile.

## Google Search Console baseline

Source: Google Search Console Performance, exact query `tyler hamilton`,
three-month view captured on 26 August 2026.

- 8 clicks
- 6,783 impressions
- 0.1% CTR
- Average position 11.7

Leading pages for the exact query:

| URL | Clicks | Impressions |
| --- | ---: | ---: |
| `/guests/tyler-hamilton` | 5 | 6,474 |
| `/podcast/ep-2152-hamiltons-untold-account-of-doping-forgiving-lance` | 3 | 459 |
| `/podcast/tyler-hamilton-forgiveness-and-rebirth` | 0 | 39 |
| `/experts/tyler-hamilton` | 0 | 30 |
| `/blog/tyler-hamilton-us-postal-doping-confession` | 0 | 1 |

One transcript URL also appeared once. Page impressions are not additive
because more than one Roadman URL can appear in the same result set. The guest
owner appeared in 95.4% of exact-query impressions, so replacing it with a new
article would create avoidable competition.

## Problems found

- The title was the generic `Tyler Hamilton — Podcast Guest` despite the page
  already owning nearly every broad-name impression.
- The visible credential and description incorrectly presented Hamilton as a
  current Olympic champion. Hamilton returned the medal, asked the IOC to
  remove him from the record and is listed as disqualified from the 2004 time
  trial.
- The page had no visible source list, review disclosure or direct FAQ answers
  for the medal, anti-doping cases, book or current coaching work.
- The page blended Hamilton's interview account with official anti-doping facts
  without clearly separating attribution and adjudicated records.
- Wikidata, the current coaching organisation and the Olympic record were
  absent from the Person entity links.
- The expert topic index and generic guest data repeated the inaccurate
  Olympic-champion credential.
- Three quotations surfaced raw transcript errors and stutters instead of
  readable, meaning-preserving excerpts.
- Supporting entity, directory and episode copy repeated the stale medal
  credential or omitted the subsequent return.

## Changes prepared

- Direct broad-intent title and description for the established guest owner.
- Current visible credential and Tyler Hamilton Training relationship.
- Source-bounded direct answer covering the retained road career, two official
  anti-doping cases, returned Olympic medal, The Secret Race and coaching work.
- Six fact-first bullets, five visible FAQs and six reviewed sources.
- ProfilePage review date, reviewer, citations and FAQ structured data.
- Wikidata, official coaching and Olympic-record entity links added.
- Expert topic index keeps its differentiated title while its shared Person
  points to the guest owner.
- Surfaced quotations cleaned without changing their meaning; companion
  episode, entity and directory descriptions corrected.
- `llms.txt`, IndexNow priority set and AI benchmark prompt 229 extended.

## Measurement

- 7-day cohort: 27 August–2 September 2026; earliest reliable review
  **5 September 2026**.
- 28-day cohort: 27 August–23 September 2026; earliest reliable review
  **26 September 2026**.

Track exact-query clicks, impressions, CTR and position for the guest owner.
Also track whether the interview pages retain specific doping, confession and
coaching queries while losing broad name-query overlap. The current target is
a material CTR lift from 0.1% without changing the established canonical URL.

Manual Google URL inspection and “Request indexing” remain a separate approved
action. IndexNow does not submit to Google.
