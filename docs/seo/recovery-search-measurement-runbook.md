# Cycling recovery search measurement runbook

This scorecard measures the 1 September 2026 cycling-recovery knowledge-layer release without collapsing distinct educational, research and product jobs into one noisy number.

## Frozen baselines

- Seven days: 23–29 August — `data/gsc-recovery-search-7d-2026-08-29.json`.
- 28 days: 2–29 August — `data/gsc-recovery-search-28d-2026-08-29.json`.

Both were captured read-only from `sc-domain:roadmancycling.com` on 1 September, when Web reporting was complete through 29 August. The 1 September release day is excluded from before and after windows.

## Three fixed lanes

The exact regexes and expected owners live in `RECOVERY_SEARCH_LANES` in `src/lib/seo/recovery-search-measurement.ts`.

1. **Clean head terms** → `/blog/cycling-recovery-tips`. This is the canonical-owner measure for broad questions such as “cycling recovery”, “recovery after cycling” and “cycling recovery tips”.
2. **Broad recovery portfolio** → fragmentation monitor. It intentionally captures sleep, soreness, rest-day and recovery variations. Narrow pages are expected to remain visible, so owner share is context rather than a consolidation target.
3. **Recovery/readiness app intent** → `/app`. This keeps product searches out of the educational owner scorecard.

For each lane, record:

- card clicks, impressions, decimal CTR and position;
- total reported Pages and Query rows;
- every visible row, or at least the first ten when the table is longer.

Use `null` position when Search Console reports no impressions. Do not convert missing rankings to position zero.

## Known broad-lane confounder

The query `masters cyclists lower back pain recovery tips questions` contributed 1,245 of the stored 28-day query-row impressions and 465 of the stored seven-day impressions. It is relevant to a back-pain page, but it is not evidence of demand for the broad recovery owner.

The comparator reports this query's share of stored broad-lane query impressions. Always read broad movement beside the clean head-term lane; never rewrite the recovery owner because the lower-back query changed.

Search Console warns that filtered cards and tables can be partial. Visible owner and confounder shares therefore use only stored table rows, never the card total.

## Checkpoints

### Seven-day directional check

- Post period: 2–8 September 2026.
- Earliest valid capture: 11 September.
- Purpose: confirm discovery, correct page selection and obvious delivery errors.
- Do not rewrite a healthy owner from seven volatile days.

### 28-day decision check

- Post period: 2–29 September 2026.
- Earliest valid capture: 2 October.
- Purpose: compare clean head-term demand, owner selection, broad portfolio spread and the first recovery-app signals.

## Run the scorecards

Seven-day:

```bash
npm run seo:recovery:compare -- \
  docs/seo/data/gsc-recovery-search-7d-2026-08-29.json \
  docs/seo/data/gsc-recovery-search-7d-2026-09-08.json \
  --output docs/seo/recovery-search-comparison-7d-2026-09-08.md
```

28-day:

```bash
npm run seo:recovery:compare -- \
  docs/seo/data/gsc-recovery-search-28d-2026-08-29.json \
  docs/seo/data/gsc-recovery-search-28d-2026-09-29.json \
  --output docs/seo/recovery-search-comparison-28d-2026-09-29.md
```

The command rejects changed lane IDs, regexes, owner routes or interpretation; malformed or duplicated rows; overlapping periods; unequal period lengths; inclusion of the release day; and captures made before Google's three-day lag allowance.

## Baseline facts

- Clean 28-day head lane: 2 clicks / 67 impressions / 3% CTR / position 21.3.
- The broad owner held 73 of 120 stored head-lane page-row impressions; page rows are partial and exceed the card total.
- Broad 28-day lane: 10 clicks / 2,404 impressions / 0.4% CTR / position 15.3 across 139 reported queries and 129 reported pages.
- Recovery/readiness app lane: no impressions before the formal app release.
