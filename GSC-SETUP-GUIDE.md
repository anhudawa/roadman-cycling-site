# Google Search Console Setup Guide — roadmancycling.com

**Created:** 2 May 2026
**For:** Anthony Walsh

---

## Current Status: What's Already Done

The site already has almost everything configured for GSC. Here's what exists:

**Verification tokens (both methods already in the codebase):**

- **Meta tag method** — `src/app/layout.tsx` line 52-54 sets `metadata.verification.google` to `o3SBYrUkEn4SxMHmX42sh0yFlSn4xP04UMSjGRM3wUg`. This renders as `<meta name="google-site-verification" content="...">` in the page head.
- **File method** — `public/309675b80de50644461aae338ba6e352.txt` exists and is served at `https://roadmancycling.com/309675b80de50644461aae338ba6e352.txt`

**Sitemaps (fully configured):**

- Sitemap index at `/sitemap.xml` (rewrites to `/sitemap-index.xml`)
- 6 child sitemaps: `/sitemap/0.xml` through `/sitemap/5.xml`
  - 0: Static/core pages, coaching, tools, community (~150+ URLs)
  - 1: Blog articles
  - 2: Podcast episodes
  - 3: Guest pages
  - 4: Training plans (event hubs + phases)
  - 5: Topics, glossary, comparisons, best-for, problems, questions

**robots.txt (dynamically generated via `src/app/robots.ts`):**

- All sitemaps referenced
- Transactional paths disallowed (`/api/`, `/admin/`, `/account/`, etc.)
- AI crawlers explicitly allowed (GPTBot, ClaudeBot, PerplexityBot, etc.)
- `/_next/static/` allowed for JS/CSS rendering

**Analytics:**

- GA4 Data API configured server-side for admin/sponsor reports (but no client-side gtag.js snippet yet)
- Vercel Web Analytics active
- Custom event tracking with consent management
- Facebook Pixel (consent-gated)
- No Google Tag Manager installed

---

## Step 1: Verify Ownership in GSC (5 minutes)

Since the verification meta tag is already deployed, this should be instant.

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Sign in with the Google account you want to manage the property with
3. Click **Add Property**
4. Choose **URL prefix** and enter: `https://roadmancycling.com`
5. GSC will auto-detect the meta tag verification — click **Verify**
6. You should see "Ownership verified" immediately

**Alternative: Domain property (recommended for full coverage)**

If you want to also cover subdomains and http:// variants:

1. Choose **Domain** instead of URL prefix
2. Enter: `roadmancycling.com`
3. GSC will ask you to add a DNS TXT record
4. Go to your DNS provider (wherever roadmancycling.com DNS is managed)
5. Add a TXT record with the value GSC provides (looks like `google-site-verification=XXXXX`)
6. Wait 5-30 minutes for DNS propagation, then click Verify in GSC

The domain property gives you data for all subdomains (coaching.roadmancycling.com, www.roadmancycling.com) in one place.

---

## Step 2: Submit Sitemaps (2 minutes)

1. In GSC, go to **Sitemaps** in the left sidebar
2. Enter `https://roadmancycling.com/sitemap.xml` and click **Submit**
3. Status should show "Success" or "Pending" — both are fine
4. GSC will automatically discover the 6 child sitemaps from the index

That's it. The sitemap is already comprehensive with proper priorities, change frequencies, and lastmod timestamps.

---

## Step 3: Request Indexing on Priority Pages (10 minutes)

Google limits indexing requests to ~10-12 per day. Do the first batch today, the rest tomorrow.

For each URL: click the search bar at the top of GSC → paste URL → Enter → wait for result → click **Request Indexing** → wait for confirmation.

**Batch 1 (today):**

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
```

**Batch 2 (tomorrow):**

```
https://roadmancycling.com/compare
https://roadmancycling.com/glossary
https://roadmancycling.com/best/best-cycling-training-apps
https://roadmancycling.com/problem/not-getting-faster
https://roadmancycling.com/editorial-standards
```

---

## Step 4: Enable Client-Side GA4 (Optional but Recommended)

Right now GA4 is only used server-side for sponsor reports. Adding client-side tracking would give you real-time data in GA4 and unlock the "Google Analytics" verification method in GSC.

**To enable:**

1. Create a GA4 property at [analytics.google.com](https://analytics.google.com) if you don't have one
2. Get your Measurement ID (looks like `G-XXXXXXXXXX`)
3. Add it as an environment variable in Vercel:
   - Go to Vercel → roadman-cycling-site → Settings → Environment Variables
   - Add `NEXT_PUBLIC_GA_ID` with the value `G-XXXXXXXXXX`
4. The codebase already references `NEXT_PUBLIC_GA_ID` and the CSP headers already allow google-analytics.com and googletagmanager.com scripts — but you'll need to add a gtag.js script component. This is a code change that can be done in a future session.

---

## Step 5: Verify Next Day

Come back 24 hours later and check:

1. **Sitemaps** — confirm "Last read" date is recent, status is "Success"
2. **Pages** — check if "Indexed" count is climbing
3. **URL Inspection** — spot-check `/coaching` to confirm "URL is on Google"
4. **Enhancements** — look for FAQ, HowTo, and Review rich result counts (should appear within 48-72 hours)

---

## Verification Methods Summary

For reference, here are all 5 GSC verification methods and where you stand:

| Method | Status | Notes |
|--------|--------|-------|
| **HTML meta tag** | Ready — already deployed | Token in `src/app/layout.tsx` line 53 |
| **HTML file upload** | Ready — already deployed | `public/309675b80de50644461aae338ba6e352.txt` |
| **DNS TXT record** | Available | Add at your DNS provider; needed for domain-level property |
| **Google Analytics** | Not yet available | Requires client-side GA4 (see Step 4) |
| **Google Tag Manager** | Not available | GTM not installed |

---

## File Reference

Files involved in GSC/SEO configuration:

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Google verification meta tag (line 52-54) |
| `public/309675b80de50644461aae338ba6e352.txt` | Google verification file |
| `src/app/robots.ts` | Dynamic robots.txt generation |
| `src/app/sitemap.ts` | Sitemap generation (6 child sitemaps) |
| `src/app/sitemap-index.xml/route.ts` | Sitemap index handler |
| `next.config.ts` | `/sitemap.xml` rewrite, redirects, security headers |
| `src/components/seo/JsonLd.tsx` | Structured data (Organization, WebSite, Person, Podcast) |
| `.env.example` | GA4 env var templates |

---

## Timeline After Setup

- **24-48 hours:** Priority pages indexed. Rich snippets start appearing.
- **1-2 weeks:** Full sitemap crawled. ~860 pages indexed. www URLs de-indexed.
- **2-4 weeks:** Rankings settle. Non-brand impressions appear in GSC.
- **8-12 weeks:** Cluster authority compounds. Topic hubs rank for head terms.

---

## Also See

- `docs/seo/manual-tasks-handoff.md` — the original handoff guide with the same steps plus IndexNow instructions
- `docs/seo/deploy-checklist.md` — broader SEO deployment checklist
