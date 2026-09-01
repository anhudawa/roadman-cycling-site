# Roadman app search measurement runbook

This is a separate scorecard for the 1 September 2026 formal `/app` search-owner
release. It does not add the app retroactively to the fixed five-owner 24 August
experiment.

## Frozen baselines

- Seven days: 23–29 August —
  `data/gsc-app-search-7d-2026-08-29.json`.
- 28 days: 2–29 August —
  `data/gsc-app-search-28d-2026-08-29.json`.

Both were captured read-only from `sc-domain:roadmancycling.com` on 1 September,
when Web and Google generative-AI reporting were complete through 29 August.
The release day is excluded from every before/after window.

## Checkpoints

### Seven-day directional read

- Post period: 2–8 September 2026.
- Earliest valid capture: 11 September.
- Purpose: confirm discovery, correct owner routing and first waitlist signals.
- Do not rewrite a healthy page on seven days of volatility.

### 28-day decision read

- Post period: 2–29 September 2026.
- Earliest valid capture: 2 October.
- Purpose: judge demand growth, category ownership, AI visibility and conversion.

## Fixed page filters

Use **Exact URL** and record clicks, impressions, decimal CTR and position for:

- `/app`
- `/best/best-cycling-training-apps`
- `/best/best-cycling-strength-training-apps`
- `/best/best-cycling-recovery-apps`

Use `null` position when Search Console reports no data; do not turn missing data
into a ranking position of zero.

## Fixed query lanes

Use **Query → Custom (regex)** with the exact expressions stored in
`APP_SEARCH_LANES` in `src/lib/seo/app-search-measurement.ts`. Record the card
metric, the reported URL count, every visible Pages row and every visible Query
row.

The owner jobs remain distinct:

- Roadman product intent → `/app`.
- Strength app comparisons → `/best/best-cycling-strength-training-apps`.
- Recovery/readiness app comparisons → `/best/best-cycling-recovery-apps`.
- Broad training app discovery → `/best/best-cycling-training-apps`.

Search Console warns that filtered card totals and table rows can be partial.
The comparator therefore calculates owner share only from visible stored page
rows, never by dividing a page row by the card total.

## AI and waitlist

- In Google Search generative-AI features, apply an exact `/app` page filter and
  record impressions for the same window.
- In Roadman analytics, capture the one app waitlist's total submissions,
  attributed submissions and source breakdown for the same window.
- A missing historical conversion capture is `null`, not zero. Once comparable
  captures exist, keep all subscribers in the same audience and compare source
  attribution rather than creating another list.

## Run the scorecards

Seven-day:

```bash
npm run seo:app:compare -- \
  docs/seo/data/gsc-app-search-7d-2026-08-29.json \
  docs/seo/data/gsc-app-search-7d-2026-09-08.json \
  --output docs/seo/app-search-comparison-7d-2026-09-08.md
```

28-day:

```bash
npm run seo:app:compare -- \
  docs/seo/data/gsc-app-search-28d-2026-08-29.json \
  docs/seo/data/gsc-app-search-28d-2026-09-29.json \
  --output docs/seo/app-search-comparison-28d-2026-09-29.md
```

The command rejects changed pages, changed regexes, changed owner routes,
overlapping windows, inclusion of the release day, unequal period lengths and a
post-period capture made before Google's three-day lag allowance.

## Baseline facts

- `/app`: 9 Web impressions, 0 clicks, 0% CTR, position 5.7 in both frozen
  windows; 1 Google AI impression.
- Exact Roadman product lane: no reported impressions before release.
- Strength and recovery app comparison lanes: no reported impressions before
  release.
- Broad cycling training app lane: 1 click / 27 impressions / 3.7% CTR /
  position 15 over 28 days. The training-app comparison page held 53 of 56
  visible page-row impressions (94.6%).
- The 28-day `/best/best-cycling-training-apps` exact-page baseline was 12
  clicks / 805 impressions / 1.5% CTR / position 16.
