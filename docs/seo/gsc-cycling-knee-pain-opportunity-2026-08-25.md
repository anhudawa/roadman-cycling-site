# Cycling knee-pain search ownership — 25 August 2026

## Scope

Read-only Google Search Console review for the `sc-domain:roadmancycling.com`
property. Search type was Web and the date range was 24 May–23 August 2026.
No validation or indexing control was used.

## Exact-query split

The exact query `cycling knee pain` recorded 88 impressions, no clicks and an
average position of 27.4. Four blog URLs appeared for the query:

| URL | Clicks | Impressions |
| --- | ---: | ---: |
| `/blog/cycling-knee-pain-causes-fixes` | 0 | 62 |
| `/blog/knee-pain-cycling-what-to-check-first` | 0 | 34 |
| `/podcast/ep-2184-the-riders-guide-to-knee-pain` | 0 | 5 |
| `/blog/cycling-knee-pain-prevention-treatment-guide` | 0 | 1 |

Rows can overlap because Google aggregates anonymised and page-level data
differently; they should not be summed as a replacement for the query total.

## Page-level demand

The intended head-term owner,
`/blog/cycling-knee-pain-causes-fixes`, recorded:

- 248 clicks
- 29,568 impressions
- 0.8% CTR
- average position 7.6
- 711 query rows

The narrower diagnostic page,
`/blog/knee-pain-cycling-what-to-check-first`, recorded:

- 191 clicks
- 26,578 impressions
- 0.7% CTR
- average position 7.1
- 381 query rows

Its visible queries show a useful diagnostic sub-intent, including Q-factor,
knee tracking, medial pain, cleat position and a cycling knee-pain chart. It
should remain a separate page, but its title, lead and body must explicitly
cede the broad causes-and-treatment intent to the canonical guide.

The duplicate prevention/treatment page,
`/blog/cycling-knee-pain-prevention-treatment-guide`, recorded:

- 16 clicks
- 4,624 impressions
- 0.3% CTR
- average position 9.8
- 37 query rows

It substantially duplicates the broad guide and has neither a sufficiently
distinct query set nor a stronger performance signal. Its useful information
should be merged into the canonical guide and the URL permanently redirected.

## Answer-page check

The exact query `how to set saddle height` recorded 10 impressions, no clicks
and an average position of 13.1. The only page shown was
`/answers/how-to-set-saddle-height` with 14 page-row impressions, confirming
that the answer route already owns that narrow intent. No exact-query data was
available for `why do my knees hurt cycling` or `how to choose a bike saddle`.

## Decision

1. Keep `/blog/cycling-knee-pain-causes-fixes` as the broad canonical owner.
2. Rewrite it around evidence limits, load and equipment history, safe fit
   investigation and clinical boundaries. Pain location is context, not a
   diagnosis or an automatic component adjustment.
3. Keep `/blog/knee-pain-cycling-what-to-check-first` as a distinct,
   reversible diagnostic checklist for Q-factor, cleats, saddle, recent load
   and equipment changes.
4. Merge and permanently redirect
   `/blog/cycling-knee-pain-prevention-treatment-guide` to the canonical owner.
5. Preserve `/answers/why-do-my-knees-hurt-cycling` for a short extractable
   answer and route readers to the canonical guide for depth.

## Measurement

Compare each surviving page and the exact query at the 7-day and 28-day
checkpoints. Watch clicks, impressions, CTR, average position, query overlap
and whether the redirected URL disappears from the page split.
