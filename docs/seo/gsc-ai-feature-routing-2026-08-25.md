# Google AI-feature source routing — 25 August 2026

Source: the signed-in Google Search Console generative-AI features report for
`sc-domain:roadmancycling.com`, 24 May–23 August 2026. This is a routing audit,
not a replacement for the fixed 24 August measurement baseline.

## Evidence

Google reported **1,533,679 Roadman impressions** in generative-AI features for
the three-month period. Several existing sources already carry material
visibility:

| Source | AI-feature impressions | Owner before this batch |
| --- | ---: | --- |
| `/blog/age-group-ftp-benchmarks-2026` | 47,916 | None |
| `/blog/ftp-benchmarks-by-age-and-experience` | 37,004 | Intentionally neutral |
| `/blog/best-cycling-podcasts-2026` | 4,872 | `/podcast` |
| `/blog/ironman-bike-training-plan-16-weeks` | 3,713 | None |
| `/tools/masters-ftp-benchmark` | 2,772 | No reciprocal `/masters` relationship |
| `/blog/triathlon-cycling-training-plan` | 2,714 | `/training-plans` |
| `/blog/gran-fondo-training-plan-12-weeks` | 2,521 | `/training-plans` |
| `/blog/70-3-bike-training-plan-12-weeks` | 1,466 | None |
| `/blog/best-online-cycling-coach-how-to-choose` | 606 | `/coaching` |

The source pages are not being redirected or retargeted. They already win
specific informational intents. The missing piece was a consistent visible and
machine-readable relationship from those winners into the canonical knowledge
owner.

## Implementation

- Set the maintained age-group FTP report's editorial owner to
  `masters-cycling`. The blog template now renders the tracked `/masters` link
  and uses the stable `/masters#webpage` node in `BlogPosting.isPartOf`.
- Set both full- and half-Ironman bike plans to the
  `cycling-training-plans` editorial owner. They now pass their established
  long-tail and AI visibility into `/training-plans` while retaining their
  event-specific URLs and content.
- Added the masters FTP calculator to the `/masters` owner's related-resource
  graph.
- Added an always-visible, tracked `/masters` methodology link to the calculator
  and declared `/masters#webpage` in the calculator Dataset's `isPartOf` graph.
- Added regression coverage for all three article fallbacks and the tool's
  visible/schema relationships.

`/blog/ftp-benchmarks-by-age-and-experience` remains neutral because its
declared intent is training maturity at any age. It links to the maintained
age-group report, but forcing the whole page into the masters owner would blur
the deliberately separate experience-level query.

## Measurement

Keep using the fixed, non-overlapping seven- and 28-day windows in
`gsc-measurement-runbook.md`. At each checkpoint, record owner-page AI
impressions and confirm that these source URLs remain visible; do not compare
this rolling three-month read directly with either fixed post-release window.
