# Roadman search measurement runbook

This scorecard measures the 24 August 2026 search-ownership release with two non-overlapping 28-day windows.

## Fixed windows

- Baseline: 26 July–22 August 2026.
- Deployment: 24 August 2026.
- Full-day post period: 25 August–21 September 2026.
- Earliest reliable capture: 23 September 2026, or when Search Console reports data through 21 September.

Do not compare “last 3 months” with “last 28 days.” The longer range overlaps the deployment and dilutes the result. Keep the property, Web search type, query match mode and period length identical.

The machine-readable baseline is [`data/gsc-priority-28d-2026-08-22.json`](data/gsc-priority-28d-2026-08-22.json). Copy it for the current period and replace every measured value; do not remove rows simply because they have fallen to zero.

## Capture checklist

1. In the `sc-domain:roadmancycling.com` Search results report, choose a custom 25 August–21 September range and enable clicks, impressions, CTR and average position.
2. Record the site totals.
3. Use **Exact query** for every priority query except `training camp`, which must use **Queries containing**.
4. For `cycling coach`, `cycling training plan` and the `training camp` family, open the Pages tab. Record the reported URL count and all visible rows, including the intended owner even when it has zero clicks.
5. Open the Generative AI report with the same period. Record total impressions and exact-page impressions for the five owner paths in the baseline.
6. In Roadman Admin → Measurement, use the same date range and record the “Supporting content → definitive guides” total, per-owner clicks and every row in “Top assisted source pages.” In particular, preserve the source rows for the existing GSC winners: the 60-day training article, the online-coach selection article and the best-podcasts article.

Search Console may label filtered chart totals and page tables as partial. That is expected. Use the same filters both times and compare directionally: intended-owner impression share, number of competing URLs, clicks, CTR and position.

## Create the scorecard

Save the new JSON snapshot, then run:

```bash
npm run seo:gsc:compare -- \
  docs/seo/data/gsc-priority-28d-2026-08-22.json \
  docs/seo/data/gsc-priority-28d-2026-09-21.json \
  --output docs/seo/gsc-comparison-2026-09-21.md
```

The comparison fails if the property, period length, priority queries, URL splits or AI pages do not match. This prevents a superficially clean report built from different filters.

## Decision rules

- Keep a supporting article when it wins a genuinely narrower intent and sends users into the definitive guide.
- Rework or consolidate only when a supporting URL still targets the same unqualified head term and has no independent demand.
- Treat a lower average position number as a gain.
- Treat owner-link clicks as a new signal in the first post period. Historical tracking did not exist, so the baseline is unknown—not zero.
- Use the five canonical owner pages as the knowledge-layer score: `/podcast`, `/coaching`, `/training-camps`, `/training-plans` and `/masters`. The topic guides support those owners; they do not replace them in the scorecard.
