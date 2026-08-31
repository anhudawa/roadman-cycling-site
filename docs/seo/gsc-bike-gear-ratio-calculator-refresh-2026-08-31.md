# Bike gear ratio calculator trust refresh — 31 August 2026

## Why this owner moved next

The rolling Search Console opportunity scan through 29 August showed the query
`bike gear ratio calculator` rising from 2 clicks / 87 impressions to 53 clicks /
1,203 impressions. The canonical calculator was already winning, so this release
defends and extends it instead of creating another competing page.

## Intent boundary

- `/tools/gear-ratio` owns calculator, comparison, speed-at-cadence, gear-inches,
  development, range and overlap intent.
- `/blog/gear-ratio-cycling-complete-guide` owns explanation, worked examples and
  how-to-choose intent.
- `/answers/what-gear-ratio-for-climbing` owns the concise climbing question.

## Release changes

- Corrected 700x32c nominal rollout from 2,168 mm to 2,155 mm and relabelled
  2,168 mm as 700x35c using the Garmin circumference table.
- Removed the unsupported 650b x 47 preset and added a custom measured-rollout
  input, following Wahoo's warning that rim, tyre, pressure and load change real
  circumference.
- Replaced ambiguous or incorrect cassette arrays with manufacturer-labelled
  Shimano and SRAM 11/12-speed sequences.
- Added visible method, limitations, worked examples, FAQs, author/reviewer,
  review date, nine named sources and an explicit compatibility boundary.
- Restored WebApplication, WebPage, HowTo, FAQ and breadcrumb data by adding the
  missing central tool-registry record.
- Linked calculator, guide, climbing answer and adjacent tools in both directions.
- Added the calculator and guide to the priority IndexNow release set.

## Source set

- Garmin and Wahoo: wheel circumference and measurement boundary.
- Shimano CS-R8000, CS-R7100 and CS-HG710: published tooth sequences.
- SRAM XG-1250, PG-1130 and XPLR XG-1251: published tooth sequences and
  compatibility boundaries.
- Sheldon Brown: original gain-ratio definition.

## Measurement contract

Record exact query and page clicks, impressions, CTR and position after Google
has had time to recrawl. Do not interpret same-day rolling data as release impact.
The fixed scorecard remains the source of truth for the next decision.
