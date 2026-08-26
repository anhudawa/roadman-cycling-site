# Greg LeMond search-owner decision — 25 August 2026

## Decision

Keep and broaden the established owner:

`/blog/greg-lemond-interview-roadman-podcast`

Do not redirect the guest, expert or episode pages. Differentiate them as
podcast-navigation and topic pages, then point them toward the biography owner.

## Google Search Console baseline

Source: Google Search Console Performance, exact query `greg lemond`,
three-month view captured on 25 August 2026.

- 44 clicks
- 11,539 impressions
- 0.4% CTR
- Average position 10.8

Leading pages for the exact query:

| URL | Clicks | Impressions |
| --- | ---: | ---: |
| `/blog/greg-lemond-interview-roadman-podcast` | 34 | 10,072 |
| `/podcast/ep-2206-lemond-he-almost-killed-me-rdmn-podcast-clips` | 2 | 613 |
| `/guests/greg-lemond` | 1 | 530 |
| `/podcast/ep-33-the-untold-story-of-how-trek-silenced-greg-lemond` | 2 | 518 |
| `/experts/greg-lemond` | 1 | 387 |
| `/podcast/ep-2210-my-untold-story-of-epo-greg-lemond` | 3 | 376 |
| `/podcast/ep-2196-untold-lemond-opens-up-about-relationship-with-lance-rdmn-cl` | 1 | 274 |
| `/tour-de-france/history/greg-lemond-eight-seconds` | 0 | 120 |

Page impressions are not additive because more than one Roadman URL can appear
in the same result set. The owner appeared in 87.3% of exact-query impressions
and received 77.3% of exact-query clicks. Twenty-one Roadman URLs appeared at
least once, so differentiation and owner linking matter even though one page is
already dominant.

## Problems found

- The owner title and opening framed LeMond mainly through doping and the
  podcast instead of answering the broader biography intent.
- It lacked current review fields, visible official sources and claim-level
  evidence boundaries.
- The article repeated a precise 37-pellet figure while Roadman's own episode
  material contains conflicting totals. The count is not needed to explain the
  accident or comeback.
- Several private-event, commercial-retaliation and doping statements were
  written as settled fact instead of being attributed to LeMond's account.
- The article omitted LeMond's two world titles and 2025 Congressional Gold
  Medal presentation.
- The guest profile did not feature the established article owner.
- The Tour-history support page over-attributed the 1989 result to equipment and
  repeated a disputed pellet count.

## Changes shipped

- Direct-answer biography title, description, opening and quick facts.
- Verified Tour wins, first non-European milestone, two world titles, 1989
  eight-second margin and 2025 medal presentation.
- Accident details attributed to LeMond's transcript, with disputed pellet
  counts deliberately removed.
- Doping, Armstrong, Trek and Hinault material explicitly separated into
  official-result facts and LeMond's first-person claims.
- Eight visible sources covering official Tour, UCI, US government and Roadman
  first-person material.
- Five linked Roadman episodes, plus differentiated guest and expert navigation.
- Guest profile metadata and featured-article link strengthened without changing
  its canonical URL.
- Tour-history support page narrowed to the 1989 time-trial intent, sourced and
  linked to the broad owner.
- `llms.txt`, IndexNow priority set and AI benchmark prompt 227 updated.

## Measurement

- 7-day cohort: 26 August–1 September 2026; earliest reliable review
  **4 September 2026**.
- 28-day cohort: 26 August–22 September 2026; earliest reliable review
  **25 September 2026**.

Track exact-query clicks, impressions, CTR and position for the query and owner.
Also track whether episode/profile overlap falls while those URLs retain their
long-tail interview and topic queries. The broad owner should remain dominant;
the goal is not to erase useful episode discovery.

Manual Google URL inspection and “Request indexing” remain a separate approved
action. IndexNow does not submit to Google.
