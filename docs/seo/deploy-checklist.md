# Deploy checklist — 2026-Q2 SEO overhaul

What this branch contains and the exact sequence for shipping it.

---

## What's in the branch

### Infrastructure
- `/coaching/triathlon` new pillar page with Service + Course + FAQPage + Review + BreadcrumbList schema
- LocalBusiness schema expanded to all 9 UK/IE geo coaching pages
- `/about` Person entity with full `sameAs`, `knowsAbout`, `image`
- `/about/press` new media kit page
- `/feed/blog` new RSS feed (50 most recent posts)
- `/llms.txt` + `/llms-full.txt` dynamic AI-crawler discoverability routes
- Conversion tracking via global click delegate + 5 tagged CTAs
- Transcript segmentation: 1,500 new `#segment-N` anchors with Speakable + hasPart schema across 309 episodes
- LLM-polished segment titles across all 309 episodes
- AI-citation-ready answer capsules across all 309 episodes + 112 existing blog posts
- Guest entity schema with verified `sameAs` URLs for 12 featured experts
- SoftwareApplication + HowTo + FAQ schema on all 6 calculator tools
- Newsletter archive noindex + removal from sitemap
- Course + Review schema on `/coaching`
- `/coaching`, `/coaching/triathlon`, `/podcast` + homepage now have "From the blog" / "Featured guides" sections linking to cluster content

### Content (36 new articles)
- 12 triathlon cluster articles supporting `/coaching/triathlon`
- 12 coaching cluster articles supporting `/coaching`
- 11 podcast-authority cluster articles supporting `/podcast`
- 1 data-journalism linkbait: `/blog/age-group-ftp-benchmarks-2026`

### Documentation (manual-action assets)
- `docs/seo/wikidata-anthony-walsh.md` — ready-to-submit Wikidata payload
- `docs/seo/outreach-templates.md` — 15 podcast-guest pitches, 10 guest-post pitches, 10 digital-PR pitches for the FTP Benchmarks asset
- `public/309675b80de50644461aae338ba6e352.txt` — IndexNow key file

---

## Pre-deploy (5 minutes)

1. **Code review**. Skim the 36 new articles in `content/blog/`. Priority read:
    - `bike-leg-of-triathlon-why-age-groupers-get-it-wrong.mdx` (triathlon cornerstone)
    - `age-group-ftp-benchmarks-2026.mdx` (linkbait asset)
    - `polarised-vs-sweet-spot-training.mdx` (highest-authority coaching)
    - `what-cycling-podcasts-got-wrong-about-polarised-training.mdx` (linkbait opinion piece)
    - `every-roadman-episode-with-stephen-seiler.mdx` (compilation — shorter than others; verify acceptable)

2. **Rotate the Anthropic API key** you shared during the build (all three rotations are in chat history and therefore compromised). Console → API keys → revoke the old ones, create fresh.

3. **Confirm the FTP Benchmarks asset is OK to publish as-is**. It uses publicly-documented Coggan W/kg ranges (real data) and tees up a Q4 2026 community-data release. If you'd rather withhold it until the real community data is collected, unset its `publishDate` or move it to `.draft.mdx` before deploy.

---

## Deploy day

1. **Merge the branch** (`claude/add-blog-post-seo-aQR1C`) to your default branch. Deploy via your usual Vercel / Cloudflare flow.

2. **Sanity-check** a handful of pages once the deploy is live:
    - `https://roadmancycling.com/coaching/triathlon` → renders, "From the blog" section shows 6 articles
    - `https://roadmancycling.com/blog/age-group-ftp-benchmarks-2026` → renders, 2,000 words
    - `https://roadmancycling.com/llms.txt` → returns text with pinned articles + 30 recent episodes
    - `https://roadmancycling.com/feed/blog` → returns valid RSS with 50 posts
    - `https://roadmancycling.com/309675b80de50644461aae338ba6e352.txt` → returns the key string alone

3. **Google Search Console**:
    - Submit the sitemap (`/sitemap.xml`) if not already submitted. GSC → Sitemaps → Add a new sitemap.
    - URL inspect + Request Indexing on the 8 highest-value new pages:
        1. `/coaching/triathlon`
        2. `/about/press`
        3. `/blog/age-group-ftp-benchmarks-2026`
        4. `/blog/bike-leg-of-triathlon-why-age-groupers-get-it-wrong`
        5. `/blog/polarised-vs-sweet-spot-training`
        6. `/blog/is-a-cycling-coach-worth-it-case-study`
        7. `/blog/best-cycling-podcasts-for-2026-edition`
        8. `/blog/what-cycling-podcasts-got-wrong-about-polarised-training`
    - **Baseline snapshot**: export last-28-day Performance report (Queries + Pages tabs), plus the Coverage / Pages report. Store the CSVs — this is what you'll measure the 3-month lift against.

4. **IndexNow submission** (Bing, Yandex, Seznam):
    ```
    npm run seo:indexnow:dry    # preview the 62 URLs
    npm run seo:indexnow         # actually submit
    ```
    The script verifies the key file is publicly reachable before submitting so a failed deploy won't blow the batch. Expect a `200 OK` from `api.indexnow.org` per chunk.

5. **GA4 baseline snapshot**: export Acquisition → Traffic acquisition, last 28 days. This is your organic-sessions baseline.

6. **Custom dimension for AI referrers** (optional but high-value). In GA4 Admin → Custom definitions, add a dimension that captures referrer hostname matching `chat.openai.com|perplexity.ai|claude.ai|gemini.google.com`. This makes AI-citation traffic visible in your reports.

---

## Week 1

- **Wikidata submission** (see `docs/seo/wikidata-anthony-walsh.md`). Need a Wikidata account ≥ 4 days old with 5-10 small existing edits. Estimated time: 45 min.
- **First outreach wave**: pitch the FTP Benchmarks asset to the 10 digital-PR outlets listed in `docs/seo/outreach-templates.md`. Use the prepared template.
- **First podcast-guesting wave**: hit the 6 Tier-1 targets (Fast Talk, TrainerRoad Ask a Cycling Coach, The Real Science of Sport, That Triathlon Show, Scientific Triathlon, Slowtwitch) with the Tier-1 pitch template.

## Weeks 2-4

- Editorial pass on remaining articles you haven't personally read yet.
- Respond to GSC coverage issues as they appear.
- Second outreach wave: 10 guest-post outlets from the template file.

## 30-60-90 day checkpoints

Track in a single spreadsheet, exported from GSC + GA4 monthly:

| Metric | Day 0 baseline | Day 30 | Day 60 | Day 90 |
|---|---|---|---|---|
| Organic clicks (GSC last-28-day) | ___ | | | |
| Organic impressions | ___ | | | |
| Indexed pages | ___ | | | |
| Organic sessions (GA4 last-28-day) | ___ | | | |
| AI-referrer sessions (GA4 custom dim) | ___ | | | |
| `/coaching/triathlon` position for "triathlon bike coach" | ___ | | | |
| `/coaching` position for "online cycling coach" | ___ | | | |
| Coaching applications from organic | ___ | | | |

Realistic expectation: +15-25% organic sessions by day 90, `/coaching/triathlon` in top-20 for its primary keyword, 5-10 new Knowledge Panel-ish branded-search features. 10× requires the backlink + content compounding that this branch sets up — it doesn't deliver in 90 days on its own.

---

## Rollback / escape hatches

- Any of the 36 new articles can be unpublished by moving to `.draft.mdx` (the blog page ignores `.draft.mdx` files).
- The `/coaching/triathlon` pillar can be taken down without breaking anything — it's a standalone page. The cluster articles still exist and still have standalone value.
- The `/feed/blog` and `/llms.txt` / `/llms-full.txt` routes can be deleted without affecting anything else — they're strictly additive.
- Conversion tracking (the global click delegate + `data-track` attributes) is consent-gated; if your consent banner is off, nothing fires, nothing breaks.

---

## Open questions / your decisions

- **AggregateRating**: currently not emitted. We removed the hardcoded version earlier. To enable legitimately, you need a review-collection mechanism (Skool has ratings; Trustpilot integration; etc.). When ready, add `aggregateRating` back to `/coaching/page.tsx` and `/coaching/triathlon/page.tsx` Service schema blocks sourced from real data.
- **Real testimonials on `/coaching/triathlon`**: three of the testimonials currently on the page are real Roadman members but not specifically triathletes. If you collect real triathlete testimonials, swap them in and update the Review schema.
- **Wikipedia article**: achievable with 100M+ podcast downloads + named guest interviews + media mentions as notability evidence. Not required — Wikidata alone gives you most of the Knowledge Graph benefit. If you want to pursue Wikipedia, outsource to a specialist editor (~€500-1,500).
