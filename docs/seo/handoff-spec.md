# SEO Handoff Spec $€” Roadman Cycling

**Date:** 2026-04-22
**Author:** Claude (SEO window)
**Branch:** `claude/add-blog-post-seo-aQR1C` (all merged to main via PRs #5$€“#41)

---

## What Was Built

### Content (63 new articles this session)

| Cluster | Count | Target |
|---|---|---|
| Triathlon bike coaching | 12 | /coaching/triathlon support |
| Coaching methodology | 12 | Coaching buyer queries |
| Podcast authority | 11 | "best cycling podcast" queries |
| X vs Y comparisons | 10 | Commercial-intent decision queries |
| Transcript-derived | 12 | Expert episode deep-dives |
| Bottom-of-funnel | 5 | Buyer-intent coaching queries |
| Linkbait | 1 | FTP benchmarks digital PR |

**Total blog posts:** 186 (was 123 at start of session)

### Enrichment (existing content)

| Asset | Coverage |
|---|---|
| Blog answerCapsule | 186/186 (100%) |
| Blog FAQ schema | 186/186 (100%) |
| Blog relatedEpisodes | 186/186 (100%) |
| Blog seoTitle + seoDescription | 186/186 (100%) |
| Episode answerCapsule | 309/310 (99.7%) |
| Episode FAQ schema | 310/310 (100%) |
| Episode keyQuotes + Quotation schema | 308/310 (99.4%) |
| Episode segmentTitles | 309/310 |
| Episode relatedPosts | 310/310 (100%) |

### New Pages (non-blog)

| Page | Purpose |
|---|---|
| `/plan/[event]` (14 hubs) | Event-level training plan hubs (was 404) |
| `/start-here` | Curated onboarding for new visitors |
| `/research` | Evidence base hub $€” maps experts to articles |
| `/assessment` | 5-question coaching diagnostic quiz |
| `/about/press` | Media kit page |
| `/coaching/triathlon` | Triathlon bike coaching pillar |

### Schema Coverage (20+ types)

Every indexed page has structured data. Types in use:
BlogPosting, PodcastEpisode, PodcastSeries, VideoObject, FAQPage, HowTo, Service, Product, Course, Review, Quotation, SoftwareApplication, CollectionPage, ItemList, BreadcrumbList, SpeakableSpecification, SearchAction, Person, Organization, WebSite, LocalBusiness, SportsEvent, ContactPage

### Dynamic OG Images (7 generators)

| Route | Generator |
|---|---|
| `/blog/[slug]` | Title + pillar badge + author |
| `/podcast/[slug]` | Title + episode number + guest |
| `/guests/[slug]` | Name + credential + episode count |
| `/topics/[slug]` | Headline + pillar color |
| `/plan/[event]` | Event name + distance + elevation |
| `/plan/[event]/[weeksOut]` | Event + weeks-out + phase label |
| `/you/[slug]` | Persona headline + kicker |

### Internal Linking

| Link type | Count |
|---|---|
| Blog $†’ episode (relatedEpisodes) | 186 Ã— 3 = ~558 |
| Episode $†’ blog (relatedPosts) | 310 Ã— 3 = ~930 |
| Auto blog $†’ plan event hubs | Dynamic (event name match) |
| Auto podcast $†’ plan event hubs | Dynamic (event name match) |
| Geo coaching $†’ event plans | Region-specific |
| Topic hub $†’ blog posts (hasPart) | 10 hubs Ã— ~15 posts |
| Footer sitewide links | 33 links on every page |
| Inline cross-links | 7 pillar articles hand-linked |

### Conversion Layer

| Surface | Trigger | CTA |
|---|---|---|
| 6 tool pages | After calculator result | "Want these zones in a real plan?" |
| 84 plan phase pages | Bottom of page | "Want this built around your FTP?" |
| 14 plan event hubs | Bottom of page | "Apply for Coaching" |
| Blog articles (coaching/nutrition) | 40% scroll | StickyCoachingBar (dismissible) |
| Podcast episodes (coaching/nutrition) | After key quotes | "Want this applied to your training?" |
| /assessment | Quiz completion | Routes to /apply, /coaching, or /tools |
| All CTAs | Always | `data-track` attribute for analytics |

### AI Search Infrastructure

| Asset | Purpose |
|---|---|
| `/llms.txt` | Navigation map for AI crawlers (ChatGPT, Perplexity, Claude) |
| `/llms-full.txt` | Full content index with answerCapsules + FAQ inline |
| `robots.txt` | 9 AI crawlers explicitly allowed |
| SpeakableSpecification | On blog, podcast, plan, topic pages |
| Quotation schema | 308 episodes with citeable expert quotes |
| `/research` hub | Positions site as primary source for AI citation |

### Infrastructure & Scripts

| Script | Purpose | Command |
|---|---|---|
| `generate-cluster-articles.ts` | LLM article generation | `npx tsx scripts/generate-cluster-articles.ts --cluster=X --sonnet` |
| `generate-episode-faqs.ts` | FAQ generation for episodes | `npx tsx scripts/generate-episode-faqs.ts` |
| `extract-key-quotes.ts` | Key quote extraction | `npx tsx scripts/extract-key-quotes.ts` |
| `populate-related-episodes.ts` | Blog $†’ episode linking | `npx tsx scripts/populate-related-episodes.ts` |
| `populate-episode-related-posts.ts` | Episode $†’ blog linking | `npx tsx scripts/populate-episode-related-posts.ts` |
| `submit-indexnow.ts` | IndexNow submission (542 URLs) | `npm run seo:indexnow -- --all` |
| `audit-orphans.ts` | Orphan page detection | `npx tsx scripts/audit-orphans.ts` |

All scripts have `--dry-run`, `--limit=N`, `--slug=X` flags. Article generator has `--sonnet` flag for faster output + AbortController timeout + retry logic.

### Redirect Layer

- **Middleware:** `www.roadmancycling.com/*` $†’ 301 $†’ `roadmancycling.com/*`
- **40+ old URL redirects** in `next.config.ts` (ClickFunnels paths, tool shortcuts, spelling variants)
- **Manual step required:** Add `www.roadmancycling.com` in Vercel Domains

---

## What's NOT Done (requires human action)

### P0 $€” Do This Week

1. **Add `www.roadmancycling.com` in Vercel Domains dashboard**
   - Without this, www requests never reach the app
   - The middleware redirect only fires if Vercel routes the request to the app

2. **Submit sitemap to Google Search Console**
   - Go to GSC $†’ Sitemaps $†’ Add `https://roadmancycling.com/sitemap.xml`
   - URL-inspect top 10 pages (see `docs/seo/indexnow-ready.md` for the list)

3. **Retry IndexNow submission**
   ```bash
   cd ~/Desktop/roadman-cycling-site && npm run seo:indexnow -- --all
   ```
   First attempt returned "SiteVerificationNotCompleted" $€” retry after 24 hours.

4. **Run migration for diagnostic tables**
   ```bash
   npx tsx scripts/migrate-diagnostic.ts
   ```
   The plateau diagnostic (from another window) needs DB tables created.

### P1 $€” Do This Month

5. **Digital PR outreach** $€” templates ready at `docs/seo/outreach-templates.md`
   - 15 podcast pitch emails
   - 10 guest post pitches
   - FTP Benchmarks article pitched to CyclingTips, road.cc, BikeRadar

6. **Wikidata entity submission** $€” payload at `docs/seo/wikidata-anthony-walsh.md`
   - Unlocks Knowledge Panel eligibility for "Anthony Walsh cycling"

7. **Core Web Vitals audit** $€” run Lighthouse on:
   - `/coaching` (most important conversion page)
   - `/tools/ftp-zones` (highest-traffic tool)
   - `/blog/zone-2-training-complete-guide` (highest-traffic article likely)
   - `/plan/wicklow-200` (representative programmatic page)

8. **Schema validation** $€” run Rich Results Test on:
   - A blog post (BlogPosting + FAQPage + BreadcrumbList)
   - A podcast episode (PodcastEpisode + VideoObject + Quotation + FAQPage)
   - `/coaching` (Service + Course + Review + FAQPage)
   - `/tools/ftp-zones` (SoftwareApplication + HowTo + FAQPage)

### P2 $€” Ongoing

9. **Monitor GSC** after 2 weeks:
   - Check indexed page count (target: 800+)
   - Check "Coverage" for errors
   - Check "Enhancements" for FAQ/HowTo/Review rich result counts
   - Identify top-performing queries and create content to strengthen them

10. **Content velocity** $€” the article generator is ready for more clusters:
    ```bash
    npx tsx scripts/generate-cluster-articles.ts --cluster=X --sonnet
    ```
    Potential next clusters: "cycling injuries", "bike fit", "gravel racing"

---

## Key Files Reference

| File | What it does |
|---|---|
| `src/middleware.ts` | www$†’non-www redirect |
| `next.config.ts` $†’ `redirects()` | 40+ old URL 301s |
| `src/app/robots.ts` | Crawler policy (AI bots allowed) |
| `src/app/sitemap.ts` | Dynamic sitemap (~800 URLs) |
| `src/app/llms.txt/route.ts` | AI crawler navigation map |
| `src/app/llms-full.txt/route.ts` | Full AI content index |
| `src/components/seo/JsonLd.tsx` | Organization + WebSite schema |
| `src/components/seo/FAQSchema.tsx` | Reusable FAQPage schema |
| `src/components/seo/SoftwareApplicationSchema.tsx` | Tool page schema |
| `src/components/features/blog/AuthorBio.tsx` | E-E-A-T author signal |
| `src/components/features/conversion/StickyCoachingBar.tsx` | Scroll-triggered coaching CTA |
| `src/lib/search.ts` | Search scoring + pillar classification |
| `src/lib/transcript.ts` | Transcript segmentation for hasPart |
| `src/lib/guests/profiles.ts` | Guest entity sameAs overrides |
| `scripts/data/*.ts` | Article spec files for each cluster |
| `docs/seo/indexnow-ready.md` | IndexNow submission guide |
| `docs/seo/outreach-templates.md` | Digital PR email templates |
| `docs/seo/wikidata-anthony-walsh.md` | Wikidata submission payload |
| `docs/seo/deploy-checklist.md` | Pre-deploy/deploy-day checklist |

---

## Merge Considerations

This branch is synced with main as of 2026-04-22. If other windows have diverged, likely conflict files:
- `src/app/sitemap.ts` $€” we added plan hubs, assessment, research, start-here
- `src/lib/podcast.ts` $€” we added faq, keyQuotes fields
- `src/lib/blog.ts` $€” we added relatedEpisodes, answerCapsule
- `src/components/layout/Footer.tsx` $€” we added Start Here, Training Plans, Research, Press links
- `next.config.ts` $€” we added 40 redirects
- `content/podcast/*.mdx` $€” 310 files modified (FAQ + keyQuotes frontmatter)

All changes are additive. Conflicts should be resolvable by keeping both sides.
