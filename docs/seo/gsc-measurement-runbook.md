# Roadman search measurement runbook

This scorecard measures the 24 August 2026 search-ownership release at two fixed checkpoints: a directional seven-day read and the decision-grade 28-day comparison. Each checkpoint uses non-overlapping pre- and post-deployment windows.

## Fixed windows

Deployment: 24 August 2026. The release day is excluded from both sides.

### Directional seven-day checkpoint

- Baseline: 17–23 August 2026.
- Full-day post period: 25–31 August 2026.
- Earliest reliable capture: 3 September 2026, or when Search Console reports data through 31 August.
- Baseline: [`data/gsc-priority-7d-2026-08-23.json`](data/gsc-priority-7d-2026-08-23.json).

Use this checkpoint to catch indexing failures, owner-page disappearance and major directional movement. Do not consolidate or rewrite a healthy page solely because of seven days of ranking volatility.

### Decision-grade 28-day checkpoint

- Baseline: 26 July–22 August 2026.
- Full-day post period: 25 August–21 September 2026.
- Earliest reliable capture: 24 September 2026, or when Search Console reports data through 21 September.
- Baseline: [`data/gsc-priority-28d-2026-08-22.json`](data/gsc-priority-28d-2026-08-22.json).

Do not compare “last 3 months” with “last 28 days.” The longer range overlaps the deployment and dilutes the result. Keep the property, Web search type, query match mode and period length identical.

Copy the matching baseline for the current period and replace every measured value; do not remove filters or owner rows simply because they have fallen to zero.

## Capture checklist

Before capturing either checkpoint, verify that the live owner graph still
resolves end to end:

```bash
npm run seo:audit:owners:live
```

The command must report five owner pages, every related resource and entity
reference resolving, and zero errors. It also fails on a missing canonical,
duplicate breadcrumb graph, missing visible review trail, or missing canonical
owner node. Treat a failure as a release/indexing defect before interpreting
performance movement.

1. In the `sc-domain:roadmancycling.com` Search results report, choose the checkpoint's exact post period and enable clicks, impressions, CTR and average position.
2. Record the site totals.
3. Use **Exact query** for every priority query except `training camp`, which must use **Queries containing**.
4. For `cycling coach`, `cycling training plan` and the `training camp` family, open the Pages tab. Record the reported URL count and all visible rows, preserving the intended owner when Google exposes it even if it has zero clicks. Do not invent a zero-impression row when Google omits the owner; its absence correctly produces zero owner share.
5. Open the Generative AI report with the same period. For the seven-day checkpoint, record the total card using the same compact-card method as the baseline. For the 28-day checkpoint, also record exact-page impressions for the five owner paths in its baseline.
6. Open **Video indexing** and record its `Last update`, `Video indexed`, `No video indexed`, and every reason/count/validation row. This report is point-in-time rather than date-filtered, so preserve Google's displayed update date. Keep the baseline reason even if it disappears by recording zero videos and `Not present` in the current snapshot.
7. In Roadman Admin → Measurement, use the same date range and record the “Supporting content → definitive guides” total, per-owner clicks and every row in “Top assisted source pages.” In particular, preserve the source rows for the existing GSC winners: the 60-day training article, the online-coach selection article and the best-podcasts article.

Search Console may label filtered chart totals and page tables as partial. That is expected. Use the same filters both times and compare directionally: intended-owner impression share, number of competing URLs, clicks, CTR and position.

## Create the scorecards

For the seven-day checkpoint:

```bash
npm run seo:gsc:compare -- \
  docs/seo/data/gsc-priority-7d-2026-08-23.json \
  docs/seo/data/gsc-priority-7d-2026-08-31.json \
  --output docs/seo/gsc-comparison-7d-2026-08-31.md
```

For the 28-day checkpoint:

```bash
npm run seo:gsc:compare -- \
  docs/seo/data/gsc-priority-28d-2026-08-22.json \
  docs/seo/data/gsc-priority-28d-2026-09-21.json \
  --output docs/seo/gsc-comparison-2026-09-21.md
```

The comparison fails on invalid inclusive day counts, overlapping windows, deployment-date changes, duplicate or extra filters, query match-mode changes, URL-owner changes, or different AI page sets. This prevents a superficially clean report built from mismatched dates or filters.

## Decision rules

- Keep a supporting article when it wins a genuinely narrower intent and sends users into the definitive guide.
- Rework or consolidate only when a supporting URL still targets the same unqualified head term and has no independent demand.
- Treat a lower average position number as a gain.
- Treat owner-link clicks as a new signal in the first post period. Historical tracking did not exist, so the baseline is unknown—not zero.
- Use the five canonical owner pages as the knowledge-layer score: `/podcast`, `/coaching`, `/training-camps`, `/training-plans` and `/masters`. The topic guides support those owners; they do not replace them in the scorecard.
- Judge the video release by growth in indexed `/watch/` pages. Companion podcast pages can remain excluded as “Video isn't on a watch page” because their primary purpose is show notes and evidence; that exclusion does not invalidate an indexed dedicated watch URL.
