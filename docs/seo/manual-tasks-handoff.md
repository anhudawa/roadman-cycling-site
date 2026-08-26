# Manual SEO tasks — current handoff

**Last verified:** 26 August 2026

**Owner:** Ted / whoever has Vercel and Google Search Console access

This replaces the April 2026 handoff. The domain, sitemap and five Phase 2
search-owner URLs have now been checked. There is no outstanding bulk indexing
task.

## Current verified state

| Check | Verified result |
| --- | --- |
| `https://www.roadmancycling.com` | Permanent `308` redirect to `https://roadmancycling.com/` |
| `https://roadmancycling.com/sitemap.xml` | `200`; GSC last read 26 August 2026 with **Success** |
| `/podcast` | **URL is on Google**; page indexed; HTTPS and breadcrumb valid |
| `/coaching` | **URL is on Google**; page indexed; HTTPS and breadcrumb valid |
| `/masters` | **URL is on Google**; page indexed; HTTPS and breadcrumb valid |
| `/training-plans` | **URL is on Google**; page indexed; HTTPS and breadcrumb valid |
| `/training-camps` | **URL is on Google**; page indexed; HTTPS and breadcrumb valid |

The full inspection record and measurement links are in
[`gsc-phase2-owner-indexing-verification-2026-08-26.md`](./gsc-phase2-owner-indexing-verification-2026-08-26.md).

## Safe Google Search Console workflow

Use URL Inspection as a read-only diagnostic by default:

1. Inspect the exact canonical URL.
2. Record whether Google reports **URL is on Google**, **Page is indexed**, HTTPS
   status and detected enhancements.
3. If the URL is already indexed, stop. Do not request another crawl merely
   because content changed.
4. Treat **Request indexing** as a separate manual action. Use it only when an
   authorised person explicitly approves it and a genuinely new or materially
   changed priority URL has a discovery problem.
5. Never batch-click the action or state a guaranteed crawl, indexing or rich-
   result timeline. Google decides whether and when to crawl, index and show
   search features.

Google does not use IndexNow. Its normal discovery path is the canonical internal
link graph plus the submitted sitemap. URL Inspection verifies Google's state;
it does not need to become a submission step for every release.

## Sitemap check

The public sitemap endpoint is healthy. Search Console reports the canonical
sitemap index and video sitemap as **Success**, last read 26 August 2026. Every
current child endpoint from `/sitemap/0.xml` through `/sitemap/7.xml` also
returns `200` as XML.

Six direct child-sitemap submissions from 23 April still display their old
**Couldn't fetch** state because those rows were not reread. They are historical
dashboard noise, not evidence that the current child endpoints are unavailable.
The successful canonical sitemap index is the active discovery source. Do not
submit duplicate forms merely to make old rows look current.

## IndexNow

IndexNow is the discovery channel for participating engines such as Bing. Run a
preview before a real submission:

```bash
npm run seo:indexnow:dry
npm run seo:indexnow
```

Use `-- --all` only when a full-content resubmission is justified. The script
discovers the current URL inventory, so this handoff deliberately does not
hard-code a count that will become stale.

## Phase 2 release checks

After a production release:

1. Confirm the deployment is ready and the canonical domain serves the new
   version.
2. Check each changed URL returns `200`, is self-canonical and renders one H1.
3. Confirm visible author/reviewer, evidence and internal links where required.
4. Validate JSON-LD and discovery files from the production response.
5. Run the curated IndexNow submission.
6. Use read-only URL Inspection to capture Google's state; do not infer that a
   successful deployment means Google has already recrawled it.

## Measurement cadence

- Use the documented 24 August 2026 GSC baseline as day zero.
- Take a directional read after seven complete days.
- Take the primary comparison after 28 complete days.
- Compare exact owner-page clicks, impressions, CTR and average position, plus
  the clean non-brand query sets in each release decision document.
- Do not claim a ranking or rich-result lift from an index-status check alone.

No manual action is currently required from the site owner. The remaining work
is production verification and time-based measurement.
