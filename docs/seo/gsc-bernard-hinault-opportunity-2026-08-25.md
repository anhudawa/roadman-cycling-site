# Bernard Hinault search-owner decision — 25 August 2026

## Decision

Keep and strengthen the established owner:

`/tour-de-france/history/bernard-hinault-the-badger`

Do not create a second biography URL and do not redirect the existing owner.

## Google Search Console baseline

Source: Google Search Console Performance, exact query `bernard hinault`,
three-month view captured on 25 August 2026.

- 40 clicks
- 10,015 impressions
- 0.4% CTR
- Average position 8.2

Page distribution for that exact query:

| URL | Clicks | Impressions | Share of impressions |
| --- | ---: | ---: | ---: |
| `/tour-de-france/history/bernard-hinault-the-badger` | 32 | 9,875 | 98.6% |
| `/blog/tour-de-france-recovery-between-stages` | 8 | 127 | 1.3% |
| All other URLs | 0 | 13 | 0.1% |

The history page already owns the query. The opportunity is better CTR, broader
entity coverage and stronger evidence, not consolidation.

## Problems found in the previous owner

- The title and standfirst framed the page around periodisation rather than the
  primary biography intent.
- The opening included the unsupported wording that Hinault “won a sixth that he
  arguably should have”. He withdrew while in yellow in 1980; an unfinished race
  cannot be counted as a win.
- The claim that Hinault was categorically selective was presented as historical
  fact without evidence.
- The page had no visible source list, review record, quick facts or Person entity
  identifiers.
- It did not distinguish official race-record facts from Roadman's coaching
  interpretation.

## Changes shipped

- Direct-answer biography title, description and opening.
- Verified quick facts: birth, career dates, five Tour wins, 28 individual Tour
  stages, ten Grand Tours, 1980 world title and nickname.
- Current 2026 context: Hinault is one of five five-time Tour winners after Tadej
  Pogačar's fifth victory in 2026.
- Corrected 1980 language and balanced 1985–86 LeMond context.
- Explicitly labelled periodisation as analysis rather than biographical proof.
- Nine visible official-race sources, each with a stated verification scope.
- Article-to-Person JSON-LD connection, Wikipedia and Wikidata identity links,
  citations, modified date and organisational review signal.
- Internal link to the Roadman Greg LeMond interview for a first-person rival
  perspective.
- Updated sitemap freshness, `llms.txt`, IndexNow priority set and AI benchmark
  prompt 226.

## Measurement

Compare exact-query and page-level results against the baseline above.

- 7-day cohort: 25–31 August 2026; earliest reliable review **3 September 2026**.
- 28-day cohort: 25 August–21 September 2026; earliest reliable review
  **24 September 2026**.

Track impressions, clicks, CTR, average position and whether the owner retains at
least 95% of exact-query impressions. A CTR lift matters more than raw position if
the page remains around positions 7–9.

Manual Google URL inspection and “Request indexing” remain a separate approved
action. IndexNow does not submit to Google.
