# Manual SEO Tasks $€” Handoff Guide

**Date:** 2026-04-23
**For:** Ted / whoever has Vercel + GSC access

These two tasks take 10 minutes combined and unblock everything the SEO engine has built.

---

## Task 1: Add www.roadmancycling.com in Vercel (2 minutes)

**Why:** Old `www.roadmancycling.com` pages are still indexed in Google. The middleware redirect is deployed but Vercel rejects www requests at the edge unless the domain is configured. Without this, those old URLs keep showing in search results and diluting trust.

**Steps:**

1. Go to https://vercel.com
2. Open the `roadman-cycling-site` project
3. Click **Settings** in the top nav
4. Click **Domains** in the left sidebar
5. In the "Add Domain" input, type: `www.roadmancycling.com`
6. Click **Add**
7. Vercel will show one of two options:
   - **"Redirect to roadmancycling.com"** $€” select this (preferred, handled at the edge, fastest)
   - **"Add and configure DNS"** $€” if this appears, select the redirect option instead
8. If Vercel asks about DNS, it will show a CNAME record to add. The record is:
   - Type: `CNAME`
   - Name: `www`
   - Value: `cname.vercel-dns.com`
   - Add this in your DNS provider (Cloudflare, Namecheap, wherever roadmancycling.com DNS is managed)
9. Wait 5-10 minutes for DNS propagation
10. Test: `curl -I https://www.roadmancycling.com` should return a 301 redirect to `https://roadmancycling.com`

**Expected result:** All `www.roadmancycling.com/*` URLs 301-redirect to `roadmancycling.com/*`. Google will de-index the www versions within 1-2 crawl cycles (1-2 weeks).

---

## Task 2: Google Search Console Setup (5-8 minutes)

**Why:** We shipped ~860 indexed pages, 186 blog articles, 310 enriched episodes, 8 tools, 10 comparisons, 20 glossary terms, and more $€” but Google doesn't know about most of them yet. Submitting the sitemap and manually inspecting priority pages forces discovery within 24-48 hours instead of waiting weeks.

### Part A: Submit Sitemap

1. Go to https://search.google.com/search-console
2. Select the `roadmancycling.com` property (or `sc-domain:roadmancycling.com` if it's a domain property)
3. In the left sidebar, click **Sitemaps**
4. In the "Add a new sitemap" field, enter: `https://roadmancycling.com/sitemap.xml`
5. Click **Submit**
6. You should see status: "Success" or "Pending" $€” both are fine
7. The sitemap index contains 6 child sitemaps (articles, episodes, guests, plans, topics+glossary+comparisons, static pages). GSC will discover all of them automatically from the index.

### Part B: Request Indexing on 15 Priority Pages

For each URL below, do this:
1. Click the search bar at the top of any GSC page ("Inspect any URL...")
2. Paste the URL
3. Press Enter
4. Wait for the inspection result (5-15 seconds)
5. Click **"Request Indexing"**
6. Wait for confirmation popup (10-30 seconds)
7. Move to the next URL

**Priority URLs (do all 15):**

```
https://roadmancycling.com/coaching
https://roadmancycling.com/apply
https://roadmancycling.com/plan
https://roadmancycling.com/start-here
https://roadmancycling.com/assessment
https://roadmancycling.com/tools/ftp-zones
https://roadmancycling.com/coaching/triathlon
https://roadmancycling.com/research
https://roadmancycling.com/blog/cycling-coaching-results-before-and-after
https://roadmancycling.com/blog/cycling-coaching-free-trial
https://roadmancycling.com/compare
https://roadmancycling.com/glossary
https://roadmancycling.com/best/best-cycling-training-apps
https://roadmancycling.com/problem/not-getting-faster
https://roadmancycling.com/editorial-standards
```

**Important notes:**
- Google limits indexing requests to ~10-12 per day per property. If you hit a quota, do the first 12 today and the remaining 3 tomorrow.
- Each request takes 15-30 seconds to process. Don't click multiple times.
- If a URL shows "URL is on Google" already, still click Request Indexing to force a re-crawl with the latest content.

### Part C: Verify Next Day (optional but recommended)

Come back tomorrow and check:
1. **Sitemaps** $†’ confirm "Last read" date is recent and status is "Success"
2. **Pages** $†’ check if "Indexed" count is increasing
3. **URL Inspection** $†’ spot-check `/coaching` to confirm it shows "URL is on Google" with a fresh crawl date
4. **Enhancements** $†’ check for FAQ, HowTo, and Review rich result counts (should start appearing within 48-72 hours)

---

## Task 3: Retry IndexNow (2 minutes)

The first attempt returned "SiteVerificationNotCompleted" $€” this usually clears within 24 hours.

```bash
cd ~/Desktop/roadman-cycling-site && git pull origin main && npm run seo:indexnow -- --all
```

Expected output: `$œ“ 200 OK` with 542+ URLs submitted. IndexNow reaches Bing, Yandex, Seznam, and Naver. Google does NOT use IndexNow $€” that's what the GSC submission above handles.

---

## What happens after these tasks

- **24-48 hours:** Priority pages indexed by Google. FAQ/HowTo/Review rich snippets start appearing.
- **1-2 weeks:** Full sitemap crawled. ~860 pages indexed. www URLs de-indexed.
- **2-4 weeks:** Rankings begin settling. Non-brand impressions appear in GSC.
- **8-12 weeks:** Cluster authority compounds. Topic hubs start ranking for head terms.

Everything else $€” content, schema, internal links, conversion layer, AI search $€” is already deployed and waiting for Google to discover it.
