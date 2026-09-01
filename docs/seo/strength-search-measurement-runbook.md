# Roadman cycling strength search measurement runbook

This scorecard measures the 1 September 2026 formal strength search-owner
release without disturbing the pages refreshed on 26 August.

## Frozen baselines

- Seven days: 23–29 August —
  `data/gsc-strength-search-7d-2026-08-29.json`.
- 28 days: 2–29 August —
  `data/gsc-strength-search-28d-2026-08-29.json`.

Both were captured read-only from `sc-domain:roadmancycling.com` on 1 September,
when Web reporting was complete through 29 August. The release day is excluded
from every before/after window.

## Fixed intent lanes

Use **Query → Custom (regex)** with the exact expressions stored in
`STRENGTH_SEARCH_LANES` in
`src/lib/seo/strength-search-measurement.ts`. Capture the summary metrics, the
reported row counts, every visible Pages row and every visible Queries row.

- S&C synonyms → `/blog/cycling-strength-training-guide`.
- `cycling gym` → `/blog/cycling-gym-exercises-best`.

These jobs are deliberately separate. The broad guide owns programme design,
frequency and cycling-transfer intent. The gym page owns exercise selection and
the adaptable routine. The `/app` route owns Roadman's upcoming product, not
informational gym queries.

Search Console warns that filtered chart totals and table rows can be partial.
The scorecard calculates owner share only from the stored Pages rows and never
adds those rows to the chart total.

## Baseline signal

- S&C synonyms, 28 days: 0 clicks / 91 impressions / position 7.6. The owner
  holds 78 visible page-row impressions; a retired redirect and the research hub
  retain historical visibility during consolidation.
- `cycling gym`, 28 days: 0 clicks / 121 impressions / position 8.9. The correct
  gym owner holds 119 visible page-row impressions.
- `cycling gym`, seven days: 0 clicks / 49 impressions / position 9.5. All
  visible impressions belong to the correct owner.

This is a near-page-one click-through opportunity, not permission for an
immediate rewrite. Both owners were refreshed on 26 August.

## Checkpoints

### Seven-day directional read

- Post period: 2–8 September 2026.
- Earliest valid capture: 11 September.
- Inspect discovery, clicks, position and owner share.
- Do not rewrite from a volatile seven-day result alone.

### 28-day decision read

- Post period: 2–29 September 2026.
- Earliest valid capture: 2 October.
- If impressions remain high, CTR remains at zero and position is stable, test
  one title/description change on the correct owner—do not create a rival page.

## Run the scorecards

Seven-day:

```bash
npm run seo:strength:compare -- \
  docs/seo/data/gsc-strength-search-7d-2026-08-29.json \
  docs/seo/data/gsc-strength-search-7d-2026-09-08.json \
  --output docs/seo/strength-search-comparison-7d-2026-09-08.md
```

28-day:

```bash
npm run seo:strength:compare -- \
  docs/seo/data/gsc-strength-search-28d-2026-08-29.json \
  docs/seo/data/gsc-strength-search-28d-2026-09-29.json \
  --output docs/seo/strength-search-comparison-28d-2026-09-29.md
```

The command rejects changed filters, changed owner routes, overlapping windows,
release-day contamination, unequal period lengths and captures taken before
Google's three-day lag allowance.
