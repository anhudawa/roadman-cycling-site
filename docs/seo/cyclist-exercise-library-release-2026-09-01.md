# Cyclist exercise library release — 1 September 2026

## Search evidence

The 28-day Search Console lane covering cyclist and cycling queries combined
with exercise, gym, strength, squat, deadlift, lunge or core recorded 225 clicks
from 6,020 impressions at 3.7% CTR and average position 8.0. The existing
`/sc/exercises` page was absent from the visible page rows and inherited a
section-wide `noindex` directive.

The frozen baseline is at
`docs/seo/data/gsc-cyclist-exercise-lane-28d-2026-08-29.json`.

## Shipped

- Rebuilt `/sc/exercises` as an indexable, server-rendered cyclist exercise
  collection with a distinct canonical, answer capsule, collection and item-list
  schema, breadcrumbs and JSON alternate.
- Preserved the rest of `/sc` as `noindex`; only the reviewed exercise library
  explicitly opts into indexing.
- A searchable, filterable catalogue of all 54 warm-up, strength, power, core
  and mobility movements used in the public 12-week programme.
- Programme-week provenance, example prescriptions, video availability,
  coaching cues and richer instructions where source data exists.
- Intent routing to the established gym-exercise guide, core routine, programme
  and app instead of competing with their broader searches.
- A machine-readable catalogue at `/feeds/cycling-exercises.json` with explicit
  `researchRankedList: false` and `individualExercisePagesPublished: false`.
- Discovery through the app page, app product feed, MCP product record,
  knowledge graph, sitemap and both LLM reference files.

## Claim boundary

The library records movements and their use in Roadman's programme. It does not
rank one exercise as universally best, validate example prescriptions, promise
cycling transfer or turn programme membership into injury-prevention evidence.

## Verification

- 15 focused tests passed across the catalogue, page, feed, app, product feed,
  MCP and knowledge graph.
- TypeScript and changed-file lint passed.
- Search-quality audit: 1,772 documents, 0 errors.
- Strict search-ownership audit: 1,772 documents, 6 owners, 0 errors and 0
  review-queue items.
- Production build passed with 4,458 generated pages; `/sc/exercises` and
  `/feeds/cycling-exercises.json` are present.
- Rendered HTML contains `robots: index, follow`, the canonical
  `https://roadmancycling.com/sc/exercises` and an item-list count of 54.
