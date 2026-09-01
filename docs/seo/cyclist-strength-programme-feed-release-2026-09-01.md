# Cyclist strength programme source-data release — 1 September 2026

## Decision

Publish Roadman's existing 12-week cyclist strength programme as a complete, machine-readable source while keeping the interactive programme page `noindex, follow`.

The established `/blog/cycling-strength-training-12-week-beginner-plan` article remains the editorial owner for 12-week programme queries. This avoids putting a second Roadman URL into the same search lane.

## Search Console baseline

The frozen 28-day Web baseline (`2026-08-02` to `2026-08-29`) is stored in `docs/seo/data/gsc-cyclist-12-week-strength-lane-28d-2026-08-29.json`.

- 10 clicks
- 100 impressions
- 10% CTR
- Average position 11.3
- Existing beginner-plan owner: 8 clicks / 68 visible impressions
- `/sc/programme`: absent from the visible page rows and intentionally retained as a supporting tool

Google states that filtered chart totals and table rows may be partial, so page rows are not summed as if they equal the card total.

## Released

- `/feeds/cycling-strength-programme.json`
- All 12 weeks and 24 example sessions
- Phase and deload structure
- Common warm-up, weekly workout movements and exact example doses
- Core circuit and recovery examples
- Canonical editorial-owner declaration
- Explicit `noindex-follow` supporting-tool policy
- Explicit non-individualisation and app-product-evidence boundaries
- Discovery links to the exercise library, evidence guides, app and app evidence register
- Programme-feed discovery from the exercise feed, app product feed, MCP product record, knowledge graph and AI discovery files

The human programme page now explains that it is a public example, links to the editorial owner and exposes the source-data feed.

## Verification

- 16 focused tests passed across 8 files
- TypeScript passed
- Changed-file lint passed
- Search-quality audit: 1,772 documents, 0 errors
- Strict ownership audit: 1,772 documents, 6 owners, 0 errors, 0 review queue
- Production build passed: 4,459 generated pages
- Rendered `/sc/programme` output verified `noindex, follow`, the editorial-owner link and the feed link

## Measurement

- Day 7: confirm discovery of the new feed and check whether the established article's impressions, CTR and query mix remain directionally stable.
- Day 28: compare the exact same regex lane against this baseline; investigate only if ownership fragments or the established owner materially loses visibility.
- Do not index `/sc/programme` merely because the feed is new. Any future index decision requires distinct user intent and evidence that the article/tool pair will not cannibalise each other.
