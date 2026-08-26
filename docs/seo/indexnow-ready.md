# IndexNow submission — current runbook

**Inventory verified:** 26 August 2026

## Quick start

Once the site is deployed and live at `https://roadmancycling.com`, run:

```bash
npm run seo:indexnow -- --all
```

The script discovers the live repository inventory and submits it to the
IndexNow API used by participating engines. A 26 August dry run found **376
curated URLs** and **1,990 URLs** with `--all`; always trust a fresh dry run over
these snapshot counts.

For a preview without sending any requests:

```bash
npm run seo:indexnow:dry -- --all
```

To submit only the curated high-priority URLs (owners, supporting pages, tools
and current release URLs):

```bash
npm run seo:indexnow
```

## Key file

The IndexNow key file is committed at:

```
public/309675b80de50644461aae338ba6e352.txt
```

It must be reachable at `https://roadmancycling.com/309675b80de50644461aae338ba6e352.txt` for submissions to be accepted. The script verifies this before submitting.

## Google does NOT honour IndexNow

Google explicitly does not participate in the IndexNow protocol. To get Google to discover and index new pages quickly, you must:

1. **Submit the sitemap via Google Search Console (GSC).**
   Go to:
   ```
   https://search.google.com/search-console/sitemaps?resource_id=sc-domain:roadmancycling.com
   ```
   Enter `sitemap.xml` and click Submit.

2. **Use URL Inspection as a read-only check for high-priority pages.**
   Go to:
   ```
   https://search.google.com/search-console/inspect?resource_id=sc-domain:roadmancycling.com
   ```
   Paste the exact canonical URL and record Google's reported state. Requesting
   indexing is a separate manual action and requires explicit approval plus a
   justified discovery problem.

## Current Phase 2 owners to inspect in GSC

These owners were inspected on 26 August 2026 and all returned **URL is on
Google**. Reinspect only when a diagnostic or measurement checkpoint requires
fresh evidence:

- [x] `https://roadmancycling.com/podcast`
- [x] `https://roadmancycling.com/coaching`
- [x] `https://roadmancycling.com/masters`
- [x] `https://roadmancycling.com/training-plans`
- [x] `https://roadmancycling.com/training-camps`

## URL inventory

The curated list is maintained in `scripts/submit-indexnow.ts`. With `--all`, the
script also discovers indexable routes and content, de-duplicates them against
the curated set and chunks the resulting submission. Do not copy a historical
URL count into release instructions; run `npm run seo:indexnow:dry` or
`npm run seo:indexnow:dry -- --all` to obtain the current count.

## Troubleshooting

| Error | Fix |
|---|---|
| `Key file returned 403` | The site is not deployed yet, or outbound HTTPS is blocked (sandbox). Deploy first, then re-run. |
| `Key file body does not match` | Check `public/309675b80de50644461aae338ba6e352.txt` contains exactly `309675b80de50644461aae338ba6e352`. |
| `422 Unprocessable Entity` | One or more URLs return 4xx/5xx. Make sure all pages are live. |
