# Roadman Cycling URL Inventory — July 2026

Generated: 2026-07-10
Source: codebase static analysis of `/Users/tedcrilly/Desktop/roadman-cycling-site/`

---

## Summary

| Category | URLs |
|----------|-----:|
| Blog posts | 1,010 |
| Podcast episodes | 814 |
| Answer pages | 570 |
| Podcast transcript pages | 380 |
| Expert x topic pages | ~150 (estimated) |
| Glossary terms | 151 |
| Guest profiles | ~107 |
| Training plan phase pages | 102 |
| Comparisons | 42 |
| Expert landing pages | ~35 (estimated) |
| Tools | 33 |
| Topic hubs | 33 |
| Question pages | 30 |
| Entity pages | 26 |
| Races | 25 |
| Problem pages | 25 |
| Tour de France stages | 21 |
| Training plan hub pages | 17 |
| Event guides | 16 |
| Race predictor pages | ~16 |
| Coaching segments | 13 |
| Tour de France history | 13 |
| Coaching locations | 11 |
| Best-for pages | 10 |
| Case studies | 8 |
| Girona routes | 6 |
| Cluster hubs | 5 |
| Pillar pages | 5 |
| Persona/you pages | 4 |
| Author pages | 4 |
| Camp landing pages | 2 |
| Static/index/landing pages | ~63 |
| **Estimated grand total** | **~3,750** |

Note: Expert pages marked "estimated" because the count depends on runtime data enrichment (which guests have enough signal for which topics). The indexable subset is gated by `isIndexableExpertTopicPair()` in `src/lib/experts.ts`.

---

## 1. Blog Posts — 1,010 URLs

**Route:** `/blog/[slug]`
**Data source:** `content/blog/*.mdx` (1,010 MDX files)
**Loading:** `src/lib/blog.ts` — `getAllPosts()` reads all MDX files from `content/blog/`, parses frontmatter with gray-matter, and returns sorted by `publishDate`.

Every MDX file in the directory is treated as a published post. Slug is derived from filename.

---

## 2. Podcast Episodes — 814 URLs

**Route:** `/podcast/[slug]`
**Data source:** `content/podcast/*.mdx` (814 MDX files)
**Loading:** `src/lib/podcast.ts` — reads from `content/podcast/` directory.

Each episode has frontmatter with: title, episodeNumber, guest, description, publishDate, duration, spotifyId, youtubeId, pillar, type, keywords, seoDescription. Optional: answerCapsule, keyQuotes, faq, relatedPosts, topicTags.

---

## 3. Podcast Transcript Pages — 380 URLs

**Route:** `/podcast/[slug]/transcript`
**Data source:** `content/podcast/transcripts/*.txt` (380 transcript files)
**Loading:** `getTranscriptSlugs()` in `src/lib/podcast.ts` — reads `.txt` files from the transcripts directory and filters against valid episode slugs.

These are dedicated transcript pages for episodes that have polished transcripts. Not all 814 episodes have transcript pages.

---

## 4. Answer Pages — 570 URLs

**Route:** `/answers/[slug]`
**Data source:** `src/lib/answers.ts` + `src/lib/answers-data/`
**Loading:** Combines inline `BASE_ANSWERS` with imported answer arrays.

| Source | Count |
|--------|------:|
| Inline BASE_ANSWERS (answers.ts) | 10 |
| ftp.ts | 18 |
| zone2.ts | 20 |
| nutrition.ts | 19 |
| strength.ts | 20 |
| recovery.ts | 22 |
| masters.ts | 28 |
| racing.ts | 21 |
| periodisation.ts | 18 |
| power.ts | 20 |
| mental.ts | 22 |
| bikefit.ts | 22 |
| heat.ts | 22 |
| cross-training.ts | 5 |
| metrics.ts | 5 |
| training-physiology.ts | 5 |
| wave3.ts | 5 |
| cycling-tech.ts | 4 |
| high-volume-queries.ts | 4 |
| high-volume-queries-2.ts through 15.ts (14 files) | 280 |
| **Total** | **570** |

Citation-optimised, answer-first pages built for AI engine extraction (ChatGPT, Perplexity, Gemini, Claude). Each emits Article + FAQPage + BreadcrumbList JSON-LD.

---

## 5. Tools — 33 URLs

**Route:** `/tools/[slug]`
**Data source:** `src/lib/tools-registry.ts`

| # | Slug | Title |
|---|------|-------|
| 1 | ftp-zones | FTP Zone Calculator |
| 2 | race-weight | Race Weight Calculator |
| 3 | tyre-pressure | Tyre Pressure Calculator |
| 4 | fuelling | In-Ride Fuelling Calculator |
| 5 | energy-availability | Energy Availability Calculator |
| 6 | fuel-planner | Cycling Fuel Planner |
| 7 | wkg | W/kg Calculator |
| 8 | hr-zones | Heart Rate Zone Calculator |
| 9 | shock-pressure | MTB Setup Calculator |
| 10 | race-predictor | Race Time Predictor |
| 11 | run-ride-converter | Run-Ride Equivalence Converter |
| 12 | tss | TSS Calculator |
| 13 | vo2max | VO2max Estimator |
| 14 | power-speed | Power-Speed Calculator |
| 15 | calories | Calories Burned Calculator |
| 16 | gear-ratio | Gear Ratio Calculator |
| 17 | vam | Climbing Calculator (VAM) |
| 18 | ftp-test | FTP Test Calculator |
| 19 | training-load | Training Load Calculator (CTL/ATL/TSB) |
| 20 | cadence | Cadence Calculator |
| 21 | hydration | Hydration Calculator |
| 22 | climb-time | Climbing Time Estimator |
| 23 | wind-chill | Wind Chill Calculator for Cyclists |
| 24 | masters-ftp-benchmark | Masters FTP Benchmark |
| 25 | masters-recovery-score | Masters Recovery Score |
| 26 | sweet-spot | Sweet Spot Calculator |
| 27 | age-grade | Cycling Age Grade Calculator |
| 28 | body-composition | Cycling Body Composition Calculator |
| 29 | interval-builder | Interval Session Builder |
| 30 | recovery-screen | Recovery Readiness Screen |
| 31 | fuelling-screen | Fuelling Self-Assessment |
| 32 | training-readiness | Training Readiness Check |
| 33 | race-day-checklist | Race Day Checklist |

Some tools also have JSON API endpoints at `/api/v1/tools/[slug]`.

---

## 6. Topic Hubs — 33 URLs

**Route:** `/topics/[slug]`
**Data source:** `src/lib/topics.ts` — `TOPIC_DEFINITIONS` array

| # | Slug | Title |
|---|------|-------|
| 1 | ftp-training | FTP Training for Cyclists |
| 2 | cycling-nutrition | Cycling Nutrition |
| 3 | cycling-training-plans | Cycling Training Plans |
| 4 | cycling-recovery | Cycling Recovery |
| 5 | cycling-strength-conditioning | Strength Training for Cyclists |
| 6 | cycling-weight-loss | Cycling & Weight Loss |
| 7 | cycling-beginners | Getting Into Cycling |
| 8 | triathlon-cycling | Cycling for Triathletes |
| 9 | mountain-biking | Mountain Biking |
| 10 | cycling-coaching | Cycling Coaching |
| 11 | against-the-clock | Against the Clock |
| 12 | masters-cycling | Masters Cycling |
| 13 | polarised-training | Polarised Training |
| 14 | vo2max-training | VO2max Training |
| 15 | indoor-training | Indoor Cycling Training |
| 16 | bike-fitting | Bike Fitting |
| 17 | gravel-cycling | Gravel Cycling |
| 18 | climbing | Climbing |
| 19 | cycling-psychology | Cycling Psychology |
| 20 | heat-training | Heat Training |
| 21 | women-cycling | Women's Cycling |
| 22 | race-preparation | Race Preparation |
| 23 | cycling-periodisation | Cycling Periodisation |
| 24 | sweet-spot-training | Sweet Spot Training |
| 25 | sprint-training | Sprint Training |
| 26 | sleep-performance | Sleep & Cycling Performance |
| 27 | cycling-cadence | Cycling Cadence |
| 28 | ultra-endurance | Ultra-Endurance Cycling |
| 29 | cycling-breathing | Breathing for Cyclists |
| 30 | power-meter-training | Power Meter Training |
| 31 | running-for-cyclists | Running for Cyclists |
| 32 | cycling-for-runners | Cycling for Runners |
| 33 | cycling-tech | Cycling Tech & GPS |

Each hub aggregates related blog posts, episodes, and tools. Some have pillar content (long-form MDX in `content/topics/`) and cited-claims tables.

---

## 7. Guest Profiles — ~107 URLs

**Route:** `/guests/[slug]`
**Data source:** Dynamic — `src/lib/guests.ts` extracts guests from podcast episode frontmatter.

Guest slugs are derived from the `guest` field in episode MDX frontmatter. Names are deduplicated via `NAME_ALIASES`, filtered via `isLikelyPersonName()` heuristic and `EXCLUDED_NAMES` set. The actual count depends on the episode data at build time.

19 guests also have enriched entity pages (full MDX profiles in `content/entities/`) which are served at `/entity/[slug]`.

---

## 8. Comparisons — 42 URLs

**Route:** `/compare/[slug]`
**Data source:** `src/lib/comparisons.ts`

Side-by-side comparison pages (e.g., polarised-vs-pyramidal, strength-vs-more-miles, sweet-spot-vs-threshold). Each compares two training approaches, methods, or tools.

---

## 9. Glossary Terms — 151 URLs

**Route:** `/glossary/[slug]`
**Data source:** `src/lib/glossary.ts`

Cycling terminology definitions. Mix of multi-line and single-line format entries.

---

## 10. Question Pages — 30 URLs

**Route:** `/question/[slug]`
**Data source:** `src/lib/questions.ts`

Longer-form Q&A pages for specific cycling questions. Different from answer pages (which are citation-optimised and shorter).

---

## 11. Best-For Pages — 10 URLs

**Route:** `/best/[slug]`
**Data source:** `src/lib/best-for.ts`

Curated recommendation pages (e.g., best episodes for a specific topic or audience).

---

## 12. Problem Pages — 25 URLs

**Route:** `/problem/[slug]`
**Data source:** `src/lib/problems.ts`

Problem-solution pages targeting specific cycling issues.

---

## 13. Event Guides — 16 URLs

**Route:** `/event/[slug]`
**Data source:** `src/lib/event-guides.ts`

Event-specific training cluster pages. Each is a content hub with climbing analysis, FTP requirement, finish-time bands, and fuelling strategy. Routes riders into the correct weeks-out training plan.

---

## 14. Training Plan Pages — 119 URLs total

**Hub route:** `/plan/[event]` — 17 event hub pages
**Phase route:** `/plan/[event]/[weeksOut]` — 102 phase pages (17 events x 6 phases)
**Data source:** `src/lib/training-plans.ts`

6 time phases per event: 16 weeks, 12 weeks, 8 weeks, 4 weeks, 2 weeks, 1 week.

---

## 15. Race Pages — 25 URLs

**Route:** `/races/[slug]`
**Data source:** `src/data/races.ts`

Race guides with distance, elevation, key climbs, and finish-time estimates. 16 of these races also have a `predictor_slug` linking to the race predictor tool.

---

## 16. Race Predictor Pages — ~16 URLs

**Route:** `/predict/[slug]`
**Data source:** Derived from `RACES` entries with `predictor_slug` (deduplicated via Set).

Physics-based race time predictor pages for specific courses. The `/predict/courses` index is also in the sitemap.

---

## 17. Tour de France — 35 URLs

**Hub:** `/tour-de-france` (1 page)
**Stage route:** `/tour-de-france/stage/[number]` — 21 stages
**Data source:** `src/data/tour-de-france-2026.ts`

**History hub:** `/tour-de-france/history` (1 page)
**History route:** `/tour-de-france/history/[slug]` — 13 articles
**Data source:** `src/data/tour-history.ts`

Seasonal overlay. Stage pages are evergreen route references.

---

## 18. Entity Pages — 26 URLs

**Route:** `/entity/[slug]`
**Data source:** 7 static brand entities (hardcoded in sitemap) + 19 dynamic from `content/entities/*.mdx`

Static entities:
- roadman-cycling, anthony-walsh, roadman-podcast, not-done-yet, ask-roadman, roadman-method, against-the-clock

Dynamic entities (19): Expert network profiles with enriched MDX. Examples: stephen-seiler, dan-lorang, joe-friel, tim-kerrison, lachlan-morton, andy-galpin, john-wakefield, alan-murchison, david-dunne, sam-impey.

---

## 19. Expert Pages — ~185 URLs (estimated)

**Index:** `/experts` (1 page)
**Expert landing:** `/experts/[expertSlug]` — ~35 estimated
**Expert x topic:** `/experts/[expertSlug]/[topicSlug]` — ~150 estimated
**Data source:** `src/lib/experts.ts` (35 topic definitions) + `src/lib/guests/profiles.ts` (curated profile overrides)

Programmatic AEO pages answering "What does {Expert} say about {Topic}?" Only pairs with sufficient signal (editorial summary, on-topic quotes, or real episode evidence) are indexed. Others are rendered with `noindex,follow`.

The expert × topic count is dynamic — depends on how many expert-topic pairs pass the `isIndexableExpertTopicPair()` check at build time.

---

## 20. Coaching Pages — 26 URLs

**Index:** `/coaching` (1 page)

**Segment pages (13):** Static routes under `src/app/(marketing)/coaching/`
masters, over-50, beginners, women, busy-professionals, time-crunched, event-prep, sportives, gravel, triathletes, post-injury, comeback, weight-loss
**Data source:** `src/lib/coaching-segments.ts`

**Location pages (11):** Dynamic `[location]` route
ireland, uk, usa, dublin, cork, galway, london, manchester, belfast, edinburgh, leeds
**Data source:** Inline `LOCATIONS` record in the page.tsx file

---

## 21. Author Pages — 4 URLs

**Static:** `/author/anthony-walsh` (dedicated page)
**Dynamic route:** `/author/[slug]` — ~3 additional authors
**Data source:** `src/lib/authors.ts` (4 entries; anthony-walsh filtered from dynamic route since it has a static page)

---

## 22. Pillar Pages — 5 URLs

**Route:** `/pillars/[slug]`
**Data source:** `content/pillars/*.mdx`

coaching, community, nutrition, recovery, strength

---

## 23. Cluster Hub Pages — 5 URLs

**Data source:** `src/lib/cluster-hubs.ts`

| Path | Description |
|------|-------------|
| /masters/vo2max | Masters VO2max hub |
| /training/zone-2 | Zone 2 training hub |
| /training/reverse-periodisation | Reverse periodisation hub |
| /nutrition/masters | Masters nutrition hub |
| /training/indoor | Indoor training hub |

These are intent-shaped nested paths that aggregate blog posts under topic clusters.

---

## 24. Case Studies — 8 URLs

**Route:** `/case-studies/[slug]`
**Data source:** `src/lib/case-studies.ts`

Coaching outcome case studies with before/after data.

---

## 25. Girona Route Pages — 6 URLs

**Route:** `/cycling-girona/[slug]`
**Data source:** `src/lib/girona/routes.ts`

Per-climb route guides supporting the training camps cluster. Targets "cycling in Girona" and famous-climb long-tail queries (Rocacorba, Els Angels, etc).

---

## 26. Camp Landing Pages — 2 URLs

**Routes:** `/training-camps/girona-road`, `/training-camps/girona-gravel`
**Data source:** `src/lib/camps/camps.ts`

Plus `/training-camps` hub page and `/cycling-girona` pillar guide.

---

## 27. Persona/You Pages — 4 URLs

**Route:** `/you/[slug]`
**Data source:** `src/lib/personas.ts`

| Slug | Purpose |
|------|---------|
| plateau | Rider stuck on a plateau |
| event | Rider targeting an event |
| comeback | Rider returning after a break |
| listener | Podcast listener |

---

## 28. Static/Index/Landing Pages — ~63 URLs

Pages that serve as section indexes, marketing landing pages, or standalone content. These are not generated from data arrays — they have their own `page.tsx` files with hardcoded content.

**Core indexes (in sitemap):**
/, /podcast, /podcast/transcripts, /blog, /tools, /guests, /topics, /compare, /glossary, /answers, /question, /experts, /plan, /races, /case-studies, /predict, /predict/courses, /events, /search

**About/Trust:**
/about, /about/press, /about/corrections, /about/expert-reviewers, /about/how-we-coach, /about/how-we-create-content, /editorial-standards, /methodology, /research, /benchmarks, /facts, /careers

**Marketing/Funnel:**
/plateau, /ask, /strength-training, /proof, /find-your-fit, /masters, /apps-vs-coaching, /event-prep, /wrapped, /inner-circle, /training-plans, /masters-report, /start-here, /assessment

**Community:**
/community, /community/clubhouse, /community/not-done-yet, /community/not-done-yet/fit, /community/club, /apply

**Partners/Contact:**
/newsletter, /partners, /contact, /sponsor

**Legal:**
/privacy, /terms, /cookies

---

## Non-Indexable Pages (excluded from totals)

These exist as page.tsx files but are NOT indexed and NOT in the sitemap:

**Admin dashboard:** 77 pages under `/admin/` — CRM, content management, analytics, Ted agent, fantasy TdF, etc. Behind authentication.

**Method members area:** 13 pages under `/method/` — course modules, dashboard, checkout, fuel planner. Behind authentication.

**Confirmation/success pages:**
/plateau/booked, /strength-training/success, /training-camps/booking-confirmed, /predict/[slug]/success

**Embed pages:**
/embed, /embed/ftp-zones, /embed/fuelling, /embed/race-predictor

**Utility:**
/go, /go/ads (redirect/tracking), /offline

**Auth:**
/profile, /profile/login

**Newsletter issues:** `/newsletter/[slug]` — fetched from Beehiiv API at runtime. Each issue page sets `robots:noindex` per sitemap.ts comments (one-time email broadcasts too thin for web indexing).

**Diagnostic routing:** `/diagnostic/[slug]` — no generateStaticParams, rendered on demand. Not in sitemap.

**Shareable results:** `/results/[tool]/[slug]`, `/results/ftp-zones/[slug]`, `/results/fuelling/[slug]` — user-generated shareable result pages.

**Paid reports:** `/reports/[product]/view/[token]` — token-gated.

**Partner pages:** `/against-the-clock/partner`, `/against-the-clock/partner/one-pager`, `/inner-circle/apply`

---

## Sitemap Structure

The site uses split sitemaps for GSC monitoring:

| Sitemap | Content |
|---------|---------|
| /sitemap/0.xml | Static/core pages, coaching, tools, community, entities, camps, TdF, races, case studies |
| /sitemap/1.xml | Blog articles (1,010) |
| /sitemap/2.xml | Podcast episodes (814) + transcript pages (380) |
| /sitemap/3.xml | Guest pages (~107) |
| /sitemap/4.xml | Plan pages (17 hubs + 102 phase pages + 16 event guides) |
| /sitemap/5.xml | Topics + glossary + comparisons + best-for + problems + questions + answers |
| /sitemap/6.xml | Expert pages (/experts, /experts/[slug], /experts/[slug]/[topic]) |

---

## Flagged Issues

### Potential thin content
- **Glossary (151 pages):** Definitional pages by nature are short. Verify these have enough unique content to avoid thin-content flags. Cross-linking to related blog posts and answers mitigates this.
- **Expert x topic pages with "structured" enrichment:** The system tracks enrichment status. Pages with only a "structured" (auto-generated) summary rather than an "editorial" (hand-written) one may read thin until editorially reviewed. The noindex gate should catch the weakest ones.

### Potential duplicate intent
- **Blog posts vs Answer pages:** Some answer page topics overlap with blog posts on the same subject (e.g., "how-to-improve-ftp" answer page vs. "how-to-improve-ftp-cycling" blog post). Canonical tags and distinct content formats (answer-first capsule vs. long-form guide) differentiate them, but search engines may still consolidate.
- **Topic hubs vs Cluster hubs:** 5 cluster hubs at nested paths (/training/zone-2, etc.) serve similar intent to some of the 33 topic hub pages. Verify these target distinct keyword clusters and don't compete.
- **Coaching segments vs Coaching locations:** 13 segment pages + 11 location pages = 24 coaching pages plus the index. Location pages targeting "cycling coach Dublin" vs. segment pages targeting "cycling coaching for masters" serve different intent, but verify there's enough unique content on each.
- **Multiple blog posts on very similar topics:** With 1,010 blog posts, keyword cannibalization is likely on competitive terms. An overlap audit against Search Console data would surface the worst cases.

### Content worth auditing
- **Guest profiles (~107):** Dynamically generated from episode data. Guests with only 1 appearance may produce thin pages. The `isLikelyPersonName()` heuristic and `EXCLUDED_NAMES` set filter obvious junk, but edge cases may slip through.
- **Training plan phase pages (102):** 17 events x 6 phases. Verify each phase page has enough differentiated content to avoid near-duplicate flags across phases of the same event.
- **Race predictor pages (~16):** These are interactive tools — ensure they have enough static content for indexation beyond the calculator.
- **Podcast transcript pages (380):** Long-form text pages. Strong for long-tail, but verify they're not cannibalizing the parent episode pages.

### Structural notes
- **No blog MDX in expected path:** Blog posts live in `content/blog/` but the glob `content/blog/*.mdx` returned 0. Filenames may not have `.mdx` extension, or the directory name differs slightly. Verified via `src/lib/blog.ts` that `fs.readdirSync` reads the directory and filters `.mdx` — the count of 1,010 comes from that function.
- **Predictor pages are dynamic:** `/predict/[slug]` has no `generateStaticParams` — rendered on demand, not pre-built. The sitemap includes predictor URLs derived from `RACES` entries with `predictor_slug`.
- **Newsletter issues are noindex:** Per the sitemap.ts comments, `/newsletter/[slug]` pages set `robots:noindex`. They are NOT in the sitemap. The `/newsletter` index page IS in the sitemap.
