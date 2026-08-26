# Phase 2 search-owner indexing verification — 26 August 2026

## Scope

This record covers the five canonical search-owner pages named in the Roadman
Cycling Phase 2 search-growth objective. It is an indexing and discovery check,
not evidence of a ranking lift.

## Google Search Console evidence

Each exact canonical URL was checked with read-only URL Inspection in the
`sc-domain:roadmancycling.com` property on 26 August 2026. No **Request
indexing** action was triggered.

| Search job | Canonical owner | Inspection result | Indexing | Delivery | Enhancement |
| --- | --- | --- | --- | --- | --- |
| Cycling podcasts | `/podcast` | **URL is on Google** | Page is indexed | HTTPS | Breadcrumb valid |
| Online cycling coaching | `/coaching` | **URL is on Google** | Page is indexed | HTTPS | Breadcrumb valid |
| Masters cycling | `/masters` | **URL is on Google** | Page is indexed | HTTPS | Breadcrumb valid |
| Cycling training plans | `/training-plans` | **URL is on Google** | Page is indexed | HTTPS | Breadcrumb valid |
| Cycling training camps | `/training-camps` | **URL is on Google** | Page is indexed | HTTPS | Breadcrumb valid |

## Public discovery checks

Also verified on 26 August 2026:

- `https://www.roadmancycling.com` returns a permanent `308` redirect to the
  non-`www` canonical host.
- `https://roadmancycling.com/sitemap.xml` returns `200` as XML. Search Console
  reports the sitemap index as **Success**, submitted 25 August and last read 26
  August 2026, with 349 discovered pages and 349 discovered videos.
- `https://roadmancycling.com/video-sitemap.xml` also reports **Success**, last
  read 26 August 2026.
- All eight current child endpoints, `/sitemap/0.xml` through
  `/sitemap/7.xml`, return `200` as XML.
- The owner pages use the non-`www` canonical host.

Six direct child-sitemap rows submitted on 23 April retain a historical
**Couldn't fetch** result in the Search Console table. Their live endpoints are
healthy, and the successful parent sitemap index is the current source of truth;
the stale rows are not treated as a present crawl failure.

## Search-ownership interpretation

The inspection evidence supports retaining all five URLs. It does not justify
creating alternative head-term owners or redirecting a working owner page.
Supporting articles should answer narrower questions and link back to the owner
without copying its title, H1 or broad commercial job.

The release decisions and baseline metrics are recorded in:

- [`gsc-podcast-hub-opportunity-2026-08-25.md`](./gsc-podcast-hub-opportunity-2026-08-25.md)
- [`gsc-cycling-coach-search-ownership-2026-08-26.md`](./gsc-cycling-coach-search-ownership-2026-08-26.md)
- [`gsc-masters-owner-evidence-boundaries-2026-08-26.md`](./gsc-masters-owner-evidence-boundaries-2026-08-26.md)
- [`gsc-cycling-training-plan-search-ownership-2026-08-26.md`](./gsc-cycling-training-plan-search-ownership-2026-08-26.md)
- [`gsc-training-camps-owner-support-2026-08-25.md`](./gsc-training-camps-owner-support-2026-08-25.md)

## Release rule

URL Inspection remains read-only by default. Already-indexed owners do not need
a repeated manual submission. Discovery should flow through stable canonicals,
internal links and the sitemap; IndexNow is reserved for participating search
engines and does not submit URLs to Google.

## Next measurement

Index status is a prerequisite, not the success metric. Use the existing 24
August baseline documents for the seven-complete-day directional read and the
28-complete-day primary comparison. Track exact owner-page clicks, impressions,
CTR and average position, then inspect query/page pairs for cannibalisation.
