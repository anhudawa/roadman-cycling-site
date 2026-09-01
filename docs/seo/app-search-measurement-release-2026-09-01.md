# App search measurement release — 1 September 2026

## Shipped

- Frozen seven- and 28-day Search Console baselines for `/app` and the three
  app-category comparison pages.
- Four fixed query lanes with one expected owner each, including broad cycling
  training app discovery.
- Separate Google generative-AI visibility capture for `/app`.
- One-waitlist conversion fields that preserve `null` when no honest historical
  baseline exists.
- An executable comparator that rejects changed filters, owner routes,
  overlapping windows, release-day contamination and premature captures.

## Baseline signal

- `/app` already had 9 Web impressions at position 5.7 and 1 Google AI
  impression before the formal search-owner release.
- Broad cycling training app queries produced 27 Web impressions and one click
  over 28 days.
- `/best/best-cycling-training-apps` owned 53 of 56 visible page-row impressions
  in that broad query lane.
- The new strength and recovery comparison pages had no reported pre-release
  demand, so future impressions will be measured as new discovery rather than
  concealed inside an aggregate.

## Decision dates

- Seven-day directional capture: no earlier than 11 September 2026.
- 28-day decision capture: no earlier than 2 October 2026.
- Search and waitlist attribution remain a separate app scorecard rather than
  changing the frozen five-owner experiment retroactively.
