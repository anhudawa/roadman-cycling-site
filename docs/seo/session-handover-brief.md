# SEO Session Handover Brief
**Date:** 2026-04-23
**Session:** Claude Code SEO Window
**Branch:** `claude/add-blog-post-seo-aQR1C` (all work merged to main via PRs #5–#61)

---

## What Was Built This Session

### Content Created
- **192 blog articles** (was 123 at start — 69 new across 8 clusters)
  - 12 triathlon bike coaching
  - 12 coaching methodology  
  - 11 podcast authority
  - 10 X vs Y comparisons
  - 12 transcript-derived expert articles
  - 5 bottom-of-funnel buyer intent
  - 3 digital PR linkable assets
  - 1 FTP benchmarks linkbait
  - Plus 3 from other windows we enriched

### Content Enrichment
- **310/310 podcast episodes** enriched with: FAQ schema (1,240 FAQs), keyQuotes (308 episodes), segmentTitles (309), answerCapsule (309), relatedPosts (310)
- **192/192 blog posts** at 100% coverage: answerCapsule, FAQ, seoTitle, seoDescription, keywords, featuredImage, relatedEpisodes
- **90 titles** truncated to ≤60 chars, **71 descriptions** to ≤155 chars

### New Page Frameworks (16 page types, all data-driven)
| Framework | Route | Count |
|---|---|---|
| Topic hubs v2 | `/topics/[slug]` | 10 (tools + CTA + related) |
| Comparison pages | `/compare/[slug]` | 10 + index |
| Best-for pages | `/best/[slug]` | 3 |
| Problem pages | `/problem/[slug]` | 4 |
| Glossary terms | `/glossary/[slug]` | 20 + index |
| Plan event hubs | `/plan/[event]` | 14 |
| Plan phase pages | `/plan/[event]/[weeksOut]` | 84 |
| Guest pages v2 | `/guests/[slug]` | ~55 (quotes + topics) |
| Tool pages | `/tools/*` | 8 (HR zones + W/kg new) |
| Start Here | `/start-here` | 1 |
| Research hub | `/research` | 1 |
| Assessment quiz | `/assessment` | 1 |
| Editorial standards | `/editorial-standards` | 1 |
| About/Press | `/about/press` | 1 |
| Coaching/Triathlon | `/coaching/triathlon` | 1 |
| Compare index | `/compare` | 1 |

### Infrastructure
| System | What it does |
|---|---|
| `src/lib/content-graph.ts` | Unified query layer — get all related content for any topic |
| `src/lib/topics.ts` | Cluster data model with tools, commercial path, related topics |
| `src/lib/glossary.ts` | 20 glossary terms with DefinedTerm schema |
| `src/lib/comparisons.ts` | 10 comparisons with verdict + feature table |
| `src/lib/best-for.ts` | 3 best-for pages with ranked picks |
| `src/lib/problems.ts` | 4 problem pages with causes + solutions |
| `src/app/sitemap.ts` | Single flat sitemap (~870 URLs) |
| `src/app/llms.txt/route.ts` | AI crawler navigation map |
| `src/app/llms-full.txt/route.ts` | Full content index with FAQ + capsules |
| `src/app/api/content-map/route.ts` | Public JSON content inventory |
| `src/app/robots.ts` | 9 AI crawlers explicitly allowed |
| `src/middleware.ts` | www→non-www redirect (deleted by other window, may need re-adding) |
| `next.config.ts` | 40+ old URL 301 redirects |
| `.github/workflows/seo-qa.yml` | SEO QA audit on content changes |
| `scripts/seo-qa-audit.ts` | Checks all content against definition of done |
| `scripts/fix-meta-lengths.ts` | Title/description length truncation |
| `scripts/generate-cluster-articles.ts` | LLM article generator (8 clusters registered) |
| `scripts/generate-episode-faqs.ts` | Episode FAQ generation |
| `scripts/extract-key-quotes.ts` | Key quote extraction from transcripts |
| `scripts/populate-related-episodes.ts` | Blog → episode linking |
| `scripts/populate-episode-related-posts.ts` | Episode → blog linking |
| `scripts/submit-indexnow.ts` | 542 URL IndexNow submission |
| `scripts/audit-orphans.ts` | Orphan page detection |

### Schema Coverage (22+ types)
BlogPosting, PodcastEpisode, PodcastSeries, VideoObject, FAQPage, HowTo, Service, Product, Course, Review, Quotation, SoftwareApplication, CollectionPage, ItemList, BreadcrumbList, SpeakableSpecification, SearchAction, Person, ProfilePage, Organization, WebSite, LocalBusiness, SportsEvent, ContactPage, DefinedTerm, DefinedTermSet, WebPage

### Dynamic OG Images (7 generators)
Blog, podcast, guest, topic hub, plan hub, plan phase, persona

### Conversion Layer
- StickyCoachingBar on coaching/nutrition blog articles (scroll-triggered)
- Coaching CTA on all 8 tool pages, 98 plan pages, coaching/nutrition podcast episodes
- /assessment coaching diagnostic quiz (5 questions, 3 result tiers)
- All CTAs use `data-track` for conversion analytics

### Navigation
- Intent-led header: Podcast → Learn → Tools → Coaching → About
- Footer: Start Here, Blog, Topics, Training Plans, Glossary, All Tools, Coaching, Community, Research, Press, Editorial Standards

### Answer Optimization (AEO report tickets)
| Ticket | Status |
|---|---|
| AEO-001 Fix sitemap | Done — was 404, now working |
| AEO-002 Submit discovery | Ready — handoff doc written |
| AEO-003 Measurement | Needs GA4 config |
| AEO-004 Bot access | Done — robots.txt |
| AEO-005 Schema renderer | Done — reusable components |
| AEO-006 ProfilePage | Done — about + guest pages |
| AEO-007 Relationship graph | Done — content-graph.ts |
| AEO-008 Answer capsule | Done — 192 blog + 310 podcast |
| AEO-009 Evidence block | Done — EvidenceBlock.tsx on all articles |
| AEO-010 FAQ composer | Done — frontmatter + FAQSchema |
| AEO-011 Tool methodology | Done — HR zones + W/kg |
| AEO-012 Internal linking | Done — auto blog→plan, podcast→plan |
| AEO-013 Topic hubs | Done — v2 with tools + CTA |
| AEO-014 Benchmarks | Done — plateau diagnostic + assessment |
| AEO-015 llms.txt | Done — dynamic generation |
| AEO-016 Content map JSON | Done — /api/content-map |
| AEO-017 Accessibility | Done — ARIA on tools |

---

## Manual Tasks (You Need To Do)

Full guide at `docs/seo/manual-tasks-handoff.md`

### 1. Add www.roadmancycling.com in Vercel (2 min)
- Vercel dashboard → Settings → Domains → Add `www.roadmancycling.com`
- Select "Redirect to roadmancycling.com"
- If DNS required: CNAME `www` → `cname.vercel-dns.com`

### 2. Google Search Console (5-8 min)
- Sitemaps → Add `https://roadmancycling.com/sitemap.xml`
- URL Inspection → Request Indexing on these 15 URLs:
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

### 3. Retry IndexNow (2 min)
```bash
cd ~/Desktop/roadman-cycling-site && git pull origin main && npm run seo:indexnow -- --all
```

### 4. GA4 Answer Engine Measurement
- Create channel grouping for `utm_source=chatgpt.com`
- Add referral segments for Perplexity, Bing/Copilot
- Create page-group reporting by template type

### 5. Digital PR Outreach
- Templates at `docs/seo/outreach-templates.md`
- Pitch the 3 linkable assets to CyclingTips, road.cc, BikeRadar
- Submit Wikidata entity from `docs/seo/wikidata-anthony-walsh.md`

---

## Key File Locations

| Purpose | File |
|---|---|
| Sitemap | `src/app/sitemap.ts` |
| Robots | `src/app/robots.ts` |
| AI crawler map | `src/app/llms.txt/route.ts` |
| AI full index | `src/app/llms-full.txt/route.ts` |
| Content map API | `src/app/api/content-map/route.ts` |
| Content graph | `src/lib/content-graph.ts` |
| Topic enrichment | `src/lib/topics.ts` |
| Glossary data | `src/lib/glossary.ts` |
| Comparisons data | `src/lib/comparisons.ts` |
| Best-for data | `src/lib/best-for.ts` |
| Problem pages data | `src/lib/problems.ts` |
| Guest profiles | `src/lib/guests/profiles.ts` |
| Evidence block | `src/components/seo/EvidenceBlock.tsx` |
| Sticky CTA | `src/components/features/conversion/StickyCoachingBar.tsx` |
| Assessment quiz | `src/app/(content)/assessment/CoachingAssessment.tsx` |
| Article generator | `scripts/generate-cluster-articles.ts` |
| FAQ generator | `scripts/generate-episode-faqs.ts` |
| Quote extractor | `scripts/extract-key-quotes.ts` |
| SEO QA audit | `scripts/seo-qa-audit.ts` |
| Meta length fixer | `scripts/fix-meta-lengths.ts` |
| IndexNow submit | `scripts/submit-indexnow.ts` |
| Orphan audit | `scripts/audit-orphans.ts` |
| Old URL redirects | `next.config.ts` → `redirects()` |
| Navigation | `src/types/index.ts` → `NAV_ITEMS` |
| Handoff guide | `docs/seo/manual-tasks-handoff.md` |
| Original handoff | `docs/seo/handoff-spec.md` |
| IndexNow guide | `docs/seo/indexnow-ready.md` |
| Outreach templates | `docs/seo/outreach-templates.md` |
| Wikidata payload | `docs/seo/wikidata-anthony-walsh.md` |

---

## How To Add More Content

### New blog article cluster
1. Create spec file: `scripts/data/your-cluster.ts` (use `ClusterArticleSpec` interface)
2. Register in `scripts/generate-cluster-articles.ts` CLUSTERS map
3. Run: `npx tsx scripts/generate-cluster-articles.ts --cluster=your-cluster --sonnet`
4. Run: `npx tsx scripts/populate-related-episodes.ts`

### New comparison page
Append to `COMPARISONS` array in `src/lib/comparisons.ts`

### New glossary term
Append to `GLOSSARY_TERMS` array in `src/lib/glossary.ts`

### New best-for page
Append to `BEST_FOR_PAGES` array in `src/lib/best-for.ts`

### New problem page
Append to `PROBLEM_PAGES` array in `src/lib/problems.ts`

### New tool
1. Create `src/app/(content)/tools/[name]/layout.tsx` (schema)
2. Create `src/app/(content)/tools/[name]/page.tsx` (calculator)
3. Add to sitemap static section
4. Add to topic enrichment in `src/lib/topics.ts`
5. Add to llms.txt

---

## Site Totals

| Metric | Count |
|---|---|
| Total indexed pages | ~870 |
| Blog articles | 192 |
| Podcast episodes | 310 |
| Plan pages | 98 + 14 hubs |
| Topic hubs | 10 |
| Guest profiles | ~55 |
| Comparison pages | 10 |
| Glossary terms | 20 |
| Best-for pages | 3 |
| Problem pages | 4 |
| Tool pages | 8 |
| Hub/utility pages | 8 |
| Schema types | 22+ |
| OG image generators | 7 |
| Internal cross-links | ~2,500+ |
| Old URL redirects | 40+ |

---

## What Happens Next

**24-48 hours after GSC submission:** Priority pages indexed. FAQ/HowTo/Review rich snippets appear.

**1-2 weeks:** Full sitemap crawled. ~870 pages indexed. www URLs de-indexed.

**2-4 weeks:** Rankings settle. Non-brand impressions visible in GSC.

**8-12 weeks:** Cluster authority compounds. Topic hubs rank for head terms. Coaching leads from organic traffic.

**Ongoing:** Run `npx tsx scripts/seo-qa-audit.ts` before any content deploy. The GitHub Action does this automatically on PRs.
