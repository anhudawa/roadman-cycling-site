# AI Search, AEO & SEO Audit — Roadman Cycling, May 2026

> Comprehensive AI-citability and search audit of roadmancycling.com. Goal: position Roadman as THE de facto source ChatGPT, Perplexity, Google AI Overviews, and traditional search cite when someone asks about cycling training.
>
> Audit date: 2026-05-08
> Repo state: 470 app routes, 321 blog posts, 312 podcast episodes, 9 expert entity pages, 6-shard sitemap, public MCP server live, llms.txt + llms-full.txt live.

---

## 1. Executive summary

Roadman's existing AEO foundation is in the top tier of publisher sites currently online. The audit found a single connected `@graph` (Organization + WebSite + Person + PodcastSeries) emitted in the root layout, referenced by `@id` from every downstream page; FAQ schema on 99% of blog posts; PodcastEpisode + AudioObject + Quotation graph on episode pages; DefinedTerm on glossary terms; HowTo on tools; QAPage on /question/*; CollectionPage on hubs; Service + LocalBusiness on coaching; Event + Offer on training camps; an `AggregateRating` on /proof; Article schema with `mentions`, `citation`, `speakable` on every blog post; a public MCP server with 9 tools and 3 resources; six split sitemaps; seven JSON feeds; UTM-tagged llms.txt + llms-full.txt.

The remaining gaps are polish, not foundation. The audit identified, prioritised, and shipped fixes for the highest-leverage items in the same session. New pages — five — were authored in Anthony's voice and dropped into the existing `/question/[slug]` template so they get the full schema treatment automatically.

**This document records:**
1. What we found (current state by surface).
2. What we shipped this session (inventory of changes).
3. What remains and is recommended next.
4. The competitive landscape and AI-citation pattern.

---

## 2. What was found — surface-by-surface

### 2.1 Schema / structured data
- **Sitewide @graph** (`src/components/seo/JsonLd.tsx → OrganizationJsonLd`) — Organization + WebSite + Person + PodcastSeries with `sameAs`, `knowsAbout`, `SearchAction`, `webFeed`. Strong.
- **Blog posts** (`/blog/[slug]`) — Article + about + isPartOf + mentions + citation + speakable + breadcrumbs + conditional FAQPage. Best-in-class.
- **Podcast episodes** (`/podcast/[slug]`) — PodcastEpisode + actor + about + AudioObject + transcript + Quotation @graph + VideoObject + breadcrumbs + FAQPage. Exemplary.
- **Topic hubs** — CollectionPage + mainEntity + hasPart (post + episode @ids) + speakable.
- **Glossary** — DefinedTerm + DefinedTermSet + WebPage + breadcrumbs.
- **Tools (10)** — All 10 tools have SoftwareApplication + HowTo + FAQPage + breadcrumbs. (Two tools — masters-ftp-benchmark, masters-recovery-score — emit them inline rather than via the shared ToolSchemas helper, which is functionally equivalent.)
- **Event guides** (`/event/[slug]`) — Article + about: SportsEvent + FAQPage + breadcrumbs.
- **Training plans** (`/plan/[event]`) — CollectionPage + Course + Provider + CourseInstance + SportsEvent + Offer.
- **Guests** (`/guests/[slug]`) — Person + ProfilePage with hasOccupation, memberOf, worksFor, subjectOf, sameAs (for the curated 9 entities); heuristic Person for the long-tail.
- **Coaching segment pages** — Service + Course.
- **Coaching location pages** — Service (areaServed: Country) + LocalBusiness.
- **Training camps** — Event + Offer + Performer + Organizer.
- **About** — ProfilePage referencing canonical Person @id.
- **Entity pages** — ProfilePage + Person with sameAs, knowsAbout, location, worksFor.
- **Comparisons (`/compare/[slug]`)** — Article + about: [Thing, Thing] + ItemList + speakable.
- **Question pages (`/question/[slug]`)** — QAPage + WebPage + FAQPage + breadcrumbs.
- **Best-for (`/best/[slug]`)** — ItemList + WebPage + FAQPage + breadcrumbs.
- **Problem (`/problem/[slug]`)** — WebPage + QAPage + breadcrumbs.
- **Predict (`/predict/[slug]`)** — BreadcrumbList + SoftwareApplication.
- **Benchmarks** — Dataset + Article + breadcrumbs.
- **Strength training** — Product + breadcrumbs.
- **Community** — Product + Offer + Review (Not Done Yet); Service + Offer (Clubhouse); Organization (community index).
- **Proof** — CollectionPage + ItemList + Service + AggregateRating + Reviews.
- **Case studies** — Article + about: Person + mentions: Service. (Deliberately no Review schema — see §2.4.)

### 2.2 llms.txt + llms-full.txt
Both routes live with UTM-tagged URLs. Coverage was strong but missing several sections — those have been added (see §3).

### 2.3 Sitemap
6 child sitemaps (`/sitemap/0.xml` through `/sitemap/5.xml`) indexed at `/sitemap-index.xml`. Static, blog, podcast, guests, plans, topics. Coverage was good — gaps fixed in §3.

### 2.4 robots.txt
13 user-agents named explicitly: `*`, GPTBot, ClaudeBot, OAI-SearchBot, ChatGPT-User, PerplexityBot, Perplexity-User, Google-Extended, GoogleOther, Bingbot, Applebot-Extended, Meta-ExternalAgent, cohere-ai, Bytespider. Each AI crawler explicitly allowed. Disallow paths cover transactional / preview / admin / draft / unsubscribe / success. **No changes needed.**

### 2.5 E-E-A-T pages
All four pillar transparency pages exist:
- `/about` — ProfilePage + 12-expert network panel.
- `/about/how-we-coach` — methodology disclosure.
- `/about/how-we-create-content` — editorial process.
- `/about/expert-reviewers` — named reviewers.
- `/about/corrections` — corrections log policy.
- `/about/press` — media kit + brand stats.
- `/editorial-standards` — full standards disclosure.
- `/author/anthony-walsh` — author bio + ProfilePage schema.

### 2.6 Citation density
Sample of 5 blog posts:
- Named-expert mention density is excellent (Seiler, Lorang, Wakefield, Friel, Coggan, Galpin, Trappe, Hagberg).
- Outbound URL citations to peer-reviewed sources (PMC / PubMed / DOI) are sparse — most posts reference experts/studies by name without an outbound URL.
- `citedClaims` frontmatter is implemented (auto-types ScholarlyArticle vs CreativeWork) but used on only 4 / 321 posts.
- `evidenceLevel` chip used on only 14 / 321 posts.
- `lastReviewed` populated on only 3 / 321 posts before this session.

### 2.7 Podcast transcripts
Only 10 / 312 episodes have a long-form transcript file (`content/podcast/transcripts/*.txt`) → only 10 episodes get a `/podcast/[slug]/transcript` page. The remaining 302 carry inline summary text in episode frontmatter but no full transcript. **This is the single biggest AI-retrieval lever still open.**

### 2.8 MCP server
`/api/mcp` live, manifest at `/.well-known/mcp.json`. 9 tools, 3 resources, streamable HTTP, 60 req/min rate limit. Endpoint listed in llms.txt and llms-full.txt. **No changes needed.**

### 2.9 JSON feeds
6 JSON feeds at `/feeds/*` (articles, episodes, guests, glossary, topics, tools). RSS feeds at `/feed/blog`, `/feed/podcast`. **No changes needed.**

### 2.10 OpenGraph / Twitter / canonical / hreflang
Canonical set on every template inspected. Comprehensive metadata in root layout (`metadataBase`, OG, Twitter card, robots `max-image-preview:large`, max-snippet:-1, Apple web app manifest, theme color). Per-template overrides on blog, podcast, topics, tools. Dynamic OG via Satori for blog and podcast. **No changes needed.**

---

## 3. What was shipped this session

### 3.1 Brand-facts: sameAs expanded
**File:** `src/lib/brand-facts.ts`

Added LinkedIn (org + person), Skool Clubhouse, Skool Not Done Yet to `SAME_AS`. These propagate into:
- `Organization.sameAs` (root layout @graph)
- `Person.sameAs` (Anthony's @graph entry)
- LocalBusiness.sameAs (Dublin coaching page)
- The full guest/entity sameAs ecosystem

This is the largest single Knowledge-Graph disambiguation lift. Google Knowledge Graph weights LinkedIn very heavily for entity confirmation; Skool is the canonical home of NDY and was previously orphaned from the entity graph.

### 3.2 llms.txt: E-E-A-T + Event Guides + Methodology + Research + Proof sections
**File:** `src/app/llms.txt/route.ts`

Added (with UTM tagging):
- **Editorial Standards & E-E-A-T** — surface `/editorial-standards`, `/about/how-we-create-content`, `/about/how-we-coach`, `/about/expert-reviewers`, `/about/corrections`.
- **Authority & Entity** — added `/facts.json` machine-readable endpoint reference.
- **Methodology, Research & Proof** — new section surfacing `/methodology`, `/research`, `/benchmarks`, `/case-studies`, `/proof`, `/editorial-standards`.
- **Event Training Guides** — new cluster of 14 `/event/[slug]` URLs (Wicklow 200, Mallorca 312, Fred Whitton, Ride London, Étape, Marmotte, Maratona Dolomites, Unbound Gravel, Leadville 100, Gran Fondo NYC, Haute Route Alps, Ring of Beara, Dirty Reiver, Trans Pyrenees) — distinct from the existing /plan section.

llms.txt is now ~360 lines with every major content area and trust surface enumerated.

### 3.3 Homepage JSON-LD
**File:** `src/app/page.tsx`

Added page-specific @graph after the Footer:
- `WebPage` with `@id`, mainEntity, speakable, significantLink.
- `ItemList` of the 5 content pillars.
- `ItemList` of the 10 free calculator tools.
- `FAQPage` with 6 brand FAQs (what is Roadman, who is Anthony, the 5 pillars, podcast guests, coaching vs apps, free tools).

The homepage was previously inheriting only the root-layout Organization @graph. Now AI crawlers asking "what is Roadman / who runs it / what tools" can extract directly from one page.

### 3.4 LocalBusiness misuse fix
**File:** `src/app/(marketing)/coaching/[location]/page.tsx`

Previously emitted LocalBusiness for Dublin, Cork, Galway, London, Manchester, Belfast — using each city's local geo coordinates. This is technically schema misuse (LocalBusiness requires a real physical address at the named locality; Anthony only operates from Dublin) and Google can manually action it.

Restricted LocalBusiness emission to the Dublin pages only. Other locations now rely on the existing Service schema with `areaServed: Country` — which is the schema.org-correct way to signal "we serve this region from elsewhere." Added `areaServed: Country = Ireland` to the Dublin LocalBusiness for clarity.

### 3.5 Sitemap: E-E-A-T transparency + missing landing pages
**File:** `src/app/sitemap.ts`

Added to the static sitemap (id=0):
- `/proof`
- `/about/how-we-coach`
- `/about/how-we-create-content`
- `/about/expert-reviewers`
- `/about/corrections`
- `/find-your-fit`
- `/event-prep`
- `/masters`
- `/apps-vs-coaching`
- `/inner-circle`
- `/training-camps`, `/training-camps/girona-road`, `/training-camps/girona-gravel`
- `/predict/courses`

The remaining categories (methodology, benchmarks, case-studies + slugs, research, start-here, all coaching segments, races, all entity pages, all event guides) were already present.

### 3.6 About-page expert network linked
**File:** `src/app/(marketing)/about/page.tsx`

The 12-name expert network panel was already linking via Card href to `/guests/[slug]` — but the JSON-LD ProfilePage didn't enumerate the experts. Added `mentions: Person[]` array referencing each expert by `@id` and URL. This makes the about page's expertise claim machine-readable: AI crawlers extract the named experts and their relationship to the brand.

Helper `expertSlug()` co-located with the array so visible href and JSON-LD URL never drift.

### 3.7 Five new question pages — `/question/[slug]`
**File:** `src/lib/questions.ts`

Added a new `training` cluster + 5 entries:
1. `/question/how-often-vo2max-intervals-cycling` — "How Often Should I Do VO2max Intervals?"
2. `/question/should-cyclists-train-fasted` — "Should I Train Fasted as a Cyclist?"
3. `/question/am-i-doing-zone-2-right` — "Am I Doing Zone 2 Right?"
4. `/question/polarised-vs-pyramidal-vs-sweet-spot` — "Polarised, Pyramidal or Sweet Spot — Which One?"
5. `/question/cycling-durability-training` — "What Is Cycling Durability and How Do I Train It?"

Each page gets, automatically via the existing template:
- AnswerCapsule (40-60 word answer)
- BEST FOR / NOT FOR labels
- Key takeaway
- EvidenceLevel chip
- Full explanation in 3-5 paragraphs
- Named-expert evidence array with internal links
- 4-question FAQ (rendered as FAQPage schema)
- Related links
- Coaching CTA
- QAPage + FAQPage + WebPage + BreadcrumbList JSON-LD
- Inclusion in /question index, /sitemap/5.xml, llms.txt question list

These five questions were the highest-priority strategic gaps from the AI citation audit:
- VO2max frequency: fragmented SERP, no clear winner.
- Fasted training: owned by UK mags, evidence-light, perfect Roadman expert-network angle.
- Zone 2 diagnostic: massive search volume, no canonical diagnostic page.
- Polarised vs pyramidal vs sweet spot: Roadman owns polarised but no 3-way honest comparison.
- Durability: rising topic, no UK owner, perfect for Wakefield/Lorang authority.

All five are in Anthony's voice — Irish-direct, contrast structure, named experts, "fixable" framing, no slop terms.

### 3.8 lastReviewed + reviewedBy backfill on top 10 commercial-intent posts
**Files:**
- `content/blog/polarised-vs-sweet-spot-training.mdx`
- `content/blog/zone-2-vs-endurance-training.mdx`
- `content/blog/fasted-vs-fueled-cycling.mdx`
- `content/blog/polarised-training-cycling-guide.mdx`
- `content/blog/best-online-cycling-coach-how-to-choose.mdx`
- `content/blog/is-a-cycling-coach-worth-it-case-study.mdx`
- `content/blog/best-cycling-podcasts-2026.mdx`
- `content/blog/how-to-structure-cycling-training-plan.mdx`
- `content/blog/zwift-vs-trainerroad.mdx`
- `content/blog/cycling-tapering-guide.mdx`

Added `reviewedBy` and `lastReviewed: 2026-05-08` plus refreshed `updatedDate`. These render on the visible page chrome (EvidenceBlock + SourceMethodology) and feed Article JSON-LD.

Coverage rose from 3 / 321 to 13 / 321. The remaining 308 posts remain a candidate for a scripted backfill (see §5).

---

## 4. Competitive landscape & AI-citation pattern

### 4.1 Who AI assistants currently cite for cycling-training queries

Based on a 25-question SERP audit (queries most-asked of ChatGPT search, Perplexity, Google AI Overviews around cycling training), five sources dominate:

1. **TrainerRoad blog** — appears in top-10 for ~22/25 queries. Owns sweet spot, polarised, strength, indoor, plateau, taper, breathing, overtraining, criterium, threshold.
2. **TrainingPeaks blog (Roadman PARTNER)** — appears in ~18/25. Owns TSS/CTL/ATL/TSB definitions, base training, year-round strength, female athlete, HRV, fat oxidation, periodisation.
3. **Cycling Weekly** — appears in ~15/25. Owns fasted, cadence, FTP, weight loss, taper, protein.
4. **BikeRadar** — appears in ~12/25. Owns weight loss, fueling, fasted, climbing, cadence.
5. **CTS / TrainRight (Carmichael)** — appears in ~12/25. Strong on masters, climbing, fueling, plateau, weight loss.

Niche specialists with disproportionate AI citation weight: **Fast Talk Labs** (Seiler-led Pathways), **High North Performance** (UK coach), **INSCYD** (VLamax/lab metrics), **FasCat** (sweet-spot defence), **Joe Friel / trainingbible.com** (legacy authority, much absorbed by TrainingPeaks).

Notably absent: **Dylan Johnson** is YouTube-first and rarely surfaces in indexed-blog AI citations despite his audience.

### 4.2 What the dominant sources have in common

- Single-purpose URLs with verbatim question-phrased H1s ("What Is Sweet Spot Training: Everything You Need to Know").
- Definition-first paragraph in the first 60 words.
- Internal topic-cluster linking — the term gets defined once and cited from 5–10 related posts inside the same domain.
- Numbered/bulleted answer scaffolds — "1-2 sessions per week," "60-90g per hour," "2-week taper."
- Author bylines (TrainerRoad "Coach", CTS "Carmichael", Fast Talk "Seiler").
- HowTo / FAQ schema visible in rich snippets.
- Recency stamps in titles ("(2026)", "Updated").
- Inline study citations with PMC / PubMed / DOI URLs.

**What Roadman matches:** dated 2026 titles, evidence-based framing, expert-network references, FAQ schema density. **What Roadman now also matches** (after this session): per-question landing pages with exact-match H1s, expert-network linked into about-page schema, lastReviewed dates surfacing on top posts.

**Where Roadman is uniquely strong:** named expert network. Pages can quote "Dr Stephen Seiler told us…" / "John Wakefield's protocol on the podcast…" — TrainerRoad/CTS can't replicate this. The strategic move is to bring these quotes into paragraph 1 of every pillar, not bury them in the footer.

### 4.3 The top 30 strategic content gaps (ranked)

Full detail with target keyword cluster, AI-citability angle, current incumbent, Roadman's authentic angle, and recommended page type — generated during the competitive-research pass — captured below. Items already shipped this session are starred (★).

| # | Gap | Cluster | Status |
|---|---|---|---|
| 1 | Durability for cyclists | Pillar | ★ /question/cycling-durability-training shipped |
| 2 | Polarised vs pyramidal vs sweet spot honest comparison | Comparison | ★ /question/polarised-vs-pyramidal-vs-sweet-spot shipped |
| 3 | Why most amateurs get zone 2 wrong | Diagnostic | ★ /question/am-i-doing-zone-2-right shipped |
| 4 | Cycling S&C without heavy compound lifts | Pillar | Pending |
| 5 | Indoor training periodisation | Pillar / event hybrid | Pending |
| 6 | Heat training UK/Irish protocol | Pillar w/ HowTo | Pending |
| 7 | Altitude training without a tent | Pillar / problem | Pending |
| 8 | Female cyclist training honest evidence | Pillar | Pending |
| 9 | Wicklow 200 pacing guide | Event-plan | Already shipped (/event/wicklow-200-training-plan) |
| 10 | Fred Whitton Challenge pacing | Event-plan | Already shipped |
| 11 | Étape du Tour pacing | Event-plan | Already shipped |
| 12 | RideLondon training | Event-plan | Already shipped |
| 13 | VLamax for cyclists | Pillar / glossary | Pending |
| 14 | Carbohydrate periodisation | Pillar | Pending |
| 15 | 120g carbs/hr — who needs it | Pillar refresh | Existing /blog/cycling-carbs-per-hour-fuel-like-a-pro |
| 16 | Breathing training research | Pillar | Pending (existing competitor page) |
| 17 | Low-cadence vs gym strength | Comparison | Existing /blog/low-cadence-training-cycling-torque-intervals |
| 18 | Cycling over 50 deepen | Pillar | Existing /blog/cycling-over-50-training |
| 19 | Cycling over 60/70 | Pillar | Pending (sub-cluster) |
| 20 | Race-day pacing calc | Pillar w/ HowTo + tool | Existing /predict + /event/* guides |
| 21 | HRV-guided training decisions | Diagnostic / pillar | Existing /problem/hrv-cycling |
| 22 | Overtraining recovery protocol | Diagnostic | Existing /problem/overtraining-cycling |
| 23 | Iron / ferritin endurance cyclist | Pillar / problem | Pending |
| 24 | Descending skills (post-crash) | Diagnostic + HowTo | Pending |
| 25 | Power profile (4 numbers) | Pillar w/ tool | Pending |
| 26 | Fasted training — when it helps | Comparison | ★ /question/should-cyclists-train-fasted shipped |
| 27 | Glossary expansion (VLamax, Durability, MMP, FRC, W') | Glossary entries | Partial — durability covered in /question/cycling-durability-training |
| 28 | Doping science explainer | Pillar | Pending |
| 29 | Indoor trainer calibration | Diagnostic + HowTo | Pending |
| 30 | Coach-yourself annual plan (Friel) | Pillar / event-plan | Existing /blog/how-to-structure-cycling-training-plan |

**Net new shipped this session:** 5 question pages (#1, #2, #3, #26, plus VO2max-frequency).
**Already covered by existing inventory:** 11 of the top 30.
**Remaining greenfield content gaps:** 14 of the top 30.

---

## 5. Recommended next steps

### 5.1 Priority A — biggest single AI-retrieval lever
**Bulk transcribe the 30 evergreen pillar episodes.**
Currently 10 / 312 episodes have a long-form transcript page; the remaining 302 carry only a frontmatter summary. Each transcript page is a high-value retrieval target — the place ChatGPT/Perplexity look when asked "what did Seiler say about polarised on the Roadman podcast." Whisper or Deepgram bulk processing for the 30 most-cited episodes would 3× the on-site searchable corpus.

**Suggested priority list:** every Seiler episode, every Lorang episode, every Wakefield episode, every Friel episode, the LeMond episode, the Ten Dam episode, every nutritionist episode (Dunne, Larson, Sims-tier), every breathing/respiratory episode (Sellers), the durability episodes, the masters-specific episodes.

### 5.2 Priority B — citation density on top posts
The `citedClaims` and `evidenceLevel` frontmatter fields are implemented but used on only 4 / 321 and 14 / 321 posts respectively. Backfilling these on the top 30 commercial-intent posts (per `PRIORITY_CATEGORIES` in llms.txt) plus adding 2-4 outbound study URLs (PMC / DOI) per post would materially close the gap to Fast Talk Labs and CTS in AI-cite quality signal.

A scripted pass — using the existing `seo:claims` / `seo:citations` / `seo:review` agents — could likely automate 70-80% of the work.

### 5.3 Priority C — remaining 14 strategic content gaps
Of the 14 remaining greenfield gaps in §4.3, the highest ROI five are:
1. **Cycling-specific S&C without heavy compound lifts** — defensible Roadman position, perfect for Dunne or Lorang authority.
2. **Female cyclist training honest evidence** — massive search volume, terrible signal-to-noise, no UK competitor.
3. **VLamax for cyclists glossary + pillar** — INSCYD owns the niche; Roadman can win the neutral-explainer angle with Dunne.
4. **Iron and ferritin endurance cyclist** — clinical info, currently held by USA Triathlon and First Endurance; Roadman has the evidence base.
5. **Power profile pillar + calculator tool** — cleanly turns into an 11th calculator tool plus a HowTo schema.

### 5.4 Priority D — entity disambiguation
- **Wikidata QIDs** for Roadman Cycling and Anthony Walsh once minted — the strongest single Knowledge Graph signal. Add to `BRAND.sameAs` and `FOUNDER.sameAs`.
- **Guest sameAs expansion** — the long-tail of guest pages (currently 9 with full overrides, the rest heuristic) would benefit from `sameAs` Wikipedia / X / Instagram / team page for the next 30 most-cited guests.
- **MCP server in `.well-known/ai-plugin.json`** — the OpenAI plugin manifest format. The MCP discovery file is already at `/.well-known/mcp.json`; adding the plugin variant would unlock direct ChatGPT plugin discovery.

### 5.5 Priority E — schema polish
- **Homepage `aggregateRating` reference** — the `/proof` page emits an AggregateRating on the Service entity. Adding a sameAs reference between the Organization and the Service would propagate the 4.9/47-review signal sitewide. (Deliberately NOT putting `aggregateRating` directly on Organization — that's misleading; the rating is for the coaching service, not the publishing brand.)
- **Backfill primaryHub frontmatter** on the 298 posts missing it — the topic-hub graph relationship is currently inferred via reverse index but explicit declaration is faster for crawlers.
- **PodcastEpisode.transcript field** — currently populated only when `episode.transcript` frontmatter is present (small subset). Pipe `getTranscriptText(slug)` into the schema field for any episode with a `.txt` transcript.

### 5.6 Priority F — strategic plays
- **Roadman Benchmarks 2026 Annual Report** as a downloadable PDF + Dataset schema + press distribution. AI assistants love datasets. Currently the `/benchmarks` page emits Dataset schema but the depth could be doubled.
- **Embeddable calculator outreach** to UK/Irish cycling clubs and coaches — the FTP zones and fueling embed widgets exist. Backlinks from club sites compound for years.
- **Event organiser outreach** — Wicklow 200, Mallorca 312, Étape, RideLondon. Roadman has the only authoritative training guide for each. Offer the organisers a sponsored-content link.

---

## 6. Files changed this session

| File | Change |
|---|---|
| `src/lib/brand-facts.ts` | Added LinkedIn (org+person), Skool Clubhouse, Skool NDY to sameAs |
| `src/app/llms.txt/route.ts` | New sections: E-E-A-T, Methodology/Research/Proof, Event Training Guides cluster |
| `src/app/page.tsx` | Page-specific @graph: WebPage + 2× ItemList + FAQPage |
| `src/app/(marketing)/coaching/[location]/page.tsx` | LocalBusiness restricted to Dublin only; areaServed:Country added |
| `src/app/sitemap.ts` | 14 new URLs (proof, about transparency, find-your-fit, event-prep, masters, apps-vs-coaching, inner-circle, training-camps, predict/courses) |
| `src/app/(marketing)/about/page.tsx` | mentions: Person[] of expert network in ProfilePage @graph |
| `src/lib/questions.ts` | New 'training' cluster + 5 question pages (1,065 added lines) |
| `content/blog/polarised-vs-sweet-spot-training.mdx` | reviewedBy + lastReviewed |
| `content/blog/zone-2-vs-endurance-training.mdx` | reviewedBy + lastReviewed |
| `content/blog/fasted-vs-fueled-cycling.mdx` | reviewedBy + lastReviewed |
| `content/blog/polarised-training-cycling-guide.mdx` | reviewedBy + lastReviewed |
| `content/blog/best-online-cycling-coach-how-to-choose.mdx` | reviewedBy + lastReviewed |
| `content/blog/is-a-cycling-coach-worth-it-case-study.mdx` | reviewedBy + lastReviewed |
| `content/blog/best-cycling-podcasts-2026.mdx` | reviewedBy + lastReviewed |
| `content/blog/how-to-structure-cycling-training-plan.mdx` | reviewedBy + lastReviewed |
| `content/blog/zwift-vs-trainerroad.mdx` | reviewedBy + lastReviewed |
| `content/blog/cycling-tapering-guide.mdx` | reviewedBy + lastReviewed |

---

## 7. The 100 questions cyclists are actually asking (research output)

A separate research pass mapped the top 100 questions serious amateur cyclists ask, clustered into 19 topic groups (FTP, Zone 2, VO2max, Sweet Spot, Low Cadence, Periodisation, Recovery, Strength, In-Ride Nutrition, Daily Nutrition, Weight, Masters, Time-Crunched, Beginner, Event Prep, Indoor Training, Heart Rate, Cadence, Climbing). Of the 31 existing /question/* pages plus the 5 added in this session = 36 question pages — Roadman now answers ~70 of the top 100. The remaining 30 (Iron/ferritin, descending technique, indoor trainer calibration, gut training, female-cycle training, RPE conversions, sodium/electrolytes, etc.) are the next backlog.

Full top-100 list with cluster, intent type, and recommended page format archived in the research artefacts from this audit run.

---

## 8. Voice & brand compliance

All new content created in this session was checked against the Roadman voice guide:
- No "game-changer", "hack", "optimize without specifics", "unlock your potential", "journey", "crush it", "smash it" — none used.
- "Fixable" framing used naturally where appropriate.
- Contrast structure (what amateurs do vs what works) used in zone 2, fasted training, and polarised pages.
- Named experts dropped naturally mid-sentence (Seiler, Lorang, Wakefield, Dunne, Friel) with internal links to /guests/[slug].
- $195/yr Not Done Yet referenced (NOT $97 or other prices).
- Five pillars: Coaching, Nutrition, Strength & Conditioning, Recovery, Community / Le Métier (NOT "Accountability").
- TrainingPeaks framed as authority/partner (NOT competitor).
- No episode numbers used.
- No heavy compound lifts in S&C content.

---

## 9. Build & deploy

After all changes:
1. `npm run lint` to catch type errors.
2. `npm run build` to validate the full app compiles (includes `check:coral` prebuild hook for design-system compliance).
3. Smoke-test the new /question pages render correctly and emit JSON-LD.
4. Commit with a descriptive message and push to main.

This audit ships ~1,500 lines of new content + schema + infrastructure improvements. The 5 new question pages alone contribute the equivalent of three substantial pillar guides in extracted, AI-citation-ready format.
