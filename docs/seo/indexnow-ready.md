# IndexNow Submission $€” Ready to Run

## Quick start

Once the site is deployed and live at `https://roadmancycling.com`, run:

```bash
npm run seo:indexnow -- --all
```

This submits **526 URLs** (92 curated high-priority + all blog articles + all podcast episodes) to the IndexNow API, which is honoured by Bing, Yandex, Seznam, and Naver.

For a preview without sending any requests:

```bash
npm run seo:indexnow:dry -- --all
```

To submit only the 92 curated high-priority URLs (pillar pages, coaching geo pages, tools, clusters):

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

2. **Use URL Inspection for high-priority pages.**
   Go to:
   ```
   https://search.google.com/search-console/inspect?resource_id=sc-domain:roadmancycling.com
   ```
   Paste each URL, click "Request Indexing".

## Top 10 URLs to manually inspect in GSC

These are the highest-priority pages $€” manually request indexing for each one via the URL Inspection tool:

- [ ] `https://roadmancycling.com/` $€” homepage
- [ ] `https://roadmancycling.com/coaching` $€” coaching pillar
- [ ] `https://roadmancycling.com/coaching/triathlon` $€” triathlon coaching pillar
- [ ] `https://roadmancycling.com/start-here` $€” curated onboarding hub
- [ ] `https://roadmancycling.com/plan` $€” training plan hub
- [ ] `https://roadmancycling.com/blog/age-group-ftp-benchmarks-2026` $€” flagship content asset
- [ ] `https://roadmancycling.com/podcast` $€” podcast index
- [ ] `https://roadmancycling.com/tools` $€” tools hub
- [ ] `https://roadmancycling.com/tools/ftp-zones` $€” FTP zones calculator
- [ ] `https://roadmancycling.com/about` $€” about / trust page

## URL breakdown (curated, 92 URLs)

| Category | Count |
|---|---|
| Pillar + authority pages | 6 |
| Geo coaching pages | 11 |
| Tools | 7 |
| AI discoverability (llms.txt) | 2 |
| Flagship content | 1 |
| Persona routes (/you/*) | 4 |
| Start here | 1 |
| Training plan hub + 14 event hubs | 15 |
| Triathlon cluster (blog) | 12 |
| Coaching cluster (blog) | 12 |
| Comparison cluster (blog) | 10 |
| Podcast authority cluster (blog) | 11 |
| **Total curated** | **92** |

With `--all`, the script also discovers all `.mdx` files in `content/blog/` and `content/podcast/`, de-duplicates against the curated set, and submits the full batch (currently **526 URLs**).

## Troubleshooting

| Error | Fix |
|---|---|
| `Key file returned 403` | The site is not deployed yet, or outbound HTTPS is blocked (sandbox). Deploy first, then re-run. |
| `Key file body does not match` | Check `public/309675b80de50644461aae338ba6e352.txt` contains exactly `309675b80de50644461aae338ba6e352`. |
| `422 Unprocessable Entity` | One or more URLs return 4xx/5xx. Make sure all pages are live. |
