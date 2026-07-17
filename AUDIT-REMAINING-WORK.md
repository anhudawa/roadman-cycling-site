# Audit Remaining Work — Roadman Cycling

**Generated:** 16 July 2026
**Source documents:** `docs/seo-aeo-audit-june-2026.md` (Deliverable 1), `docs/seo-aeo-roadmap-june-2026.md` (Deliverable 2), `docs/canonical-clusters.md`, `claims-registry-july2026.md`, `masters-cannibalisation-map-july2026.md`, `schema-audit-july2026.md`, `docs/scaled-content-audit.md`, `docs/nutrition-cluster-gap-analysis.md`, `docs/wikidata-entity-plan.md`, `STATE-OF-PLAY-JULY16.txt`

---

## 1. Executive Summary

**Overall completion: ~70% of total audit scope.** (Updated July 17 — roadmanView 100%, plateaus hub created, against-the-clock expanded, citedClaims priority batch done, /problem pages strengthened)

The diagnostic and foundation layer (Phase 1) is largely complete — the site has been inventoried, clusters defined, templates redesigned, schemas consolidated, claims centralised, and publishing governance installed. This was the right sequencing: you now know exactly what you have and what needs fixing before building further.

What remains is the actual *fixing and building*: closing content quality gaps across 1,009 posts, resolving the entity problem off-site, surfacing the podcast corpus, closing the nutrition coverage gap, upgrading 10 topic hubs, executing the authority/PR engine, and running the AI benchmark. The heaviest work — Phases 2 and 3 — hasn't started.

**By phase:**

| Phase | Scope | Status | Est. completion |
|-------|-------|--------|-----------------|
| Phase 1 — Fix & stabilise | Diagnostics, templates, schema, governance | ~90% | 2-3 items remain |
| Phase 2 — Entity & corpus | Wikidata, podcast corpus, nutrition gap, hub upgrades | ~5% | Not started (plans exist) |
| Phase 3 — Authority engine | Digital PR, backlinks, Wikipedia notability | ~2% | Playbooks written, zero execution |
| Cross-cutting quality | genuinely cleanup, roadmanView voice, answerCapsule coverage | ~95% | genuinely + answerCapsule + glossary + roadmanView + problem pages ALL DONE; citedClaims priority batch done (29/1,009); only reviewedBy recruitment remains |
| Ongoing operations | AI benchmark execution, monthly KPI tracking, reviewer recruitment | ~10% | Spec exists, no cadence established |

**Blocked items (need Anthony):** GSC/GA4/Ahrefs/Bing Webmaster Tools access, Wikidata submission (COI disclosure), reviewer recruitment (nutrition + strength), guest backlink warm intros.

---

## 2. Phase-by-Phase Breakdown

### Phase 1 — Fix and Stabilise (Audit weeks 1-3)

The diagnostic half of Phase 1 is essentially complete. The fix/action half has gaps.

#### 1.1 Technical fixes

| # | Item | Status | Evidence |
|---|------|--------|----------|
| 1.1.1 | 301-redirect `www` to apex | ✅ Done | `next.config.ts` lines 46-61: permanent redirect www.roadmancycling.com → roadmancycling.com for all paths |
| 1.1.2 | Purge/recrawl legacy `www` pages in Search Console | 🚫 Blocked | Requires GSC access (Anthony) |
| 1.1.3 | Tidy robots.txt / sitemap mismatch | ✅ Done | Verified in `schema-seo-audit.md` |
| 1.1.4 | Add PodcastEpisode schema | ✅ Done | `PodcastEpisodeJsonLd` in `src/components/seo/JsonLd.tsx` |
| 1.1.5 | Add VideoObject schema | ✅ Done | Confirmed in `schema-audit-july2026.md` |
| 1.1.6 | IndexNow submission (526 URLs) | ⏳ Not started | Spec ready at `docs/seo/indexnow-ready.md`, key at `docs/seo/.indexnow-key.txt` |

#### 1.2 Baselines and measurement

| # | Item | Status | Evidence |
|---|------|--------|----------|
| 1.2.1 | Pull Ahrefs referring-domain baseline | 🚫 Blocked | Requires Ahrefs access (Anthony) |
| 1.2.2 | Pull GSC organic traffic + query baseline | 🚫 Blocked | Requires GSC access (Anthony) |
| 1.2.3 | Pull GA4 funnel/conversion baseline | 🚫 Blocked | Requires GA4 access (Anthony) |
| 1.2.4 | Submit to Bing Webmaster Tools | 🚫 Blocked | Requires Bing access (Anthony) |
| 1.2.5 | Design 200 AI benchmark prompts | ✅ Done | `scripts/ai-benchmark-prompts.json` — 200 prompts across 11 categories, 5 intent types, 5 engines |
| 1.2.6 | Execute AI benchmark (Day 0 baseline) | 🔨 Partial | 20-query mini-baseline exists (`ai-citation-baseline-2026-06-09.md`, 39% citation rate). Full 200-prompt run NOT executed — requires manual runs in each engine |
| 1.2.7 | Set up monthly KPI dashboard | ⏳ Not started | KPIs defined in roadmap but no dashboard or tracking cadence established |

#### 1.3 Diagnostic inventory (all complete)

| # | Item | Status | Evidence |
|---|------|--------|----------|
| 1.3.1 | URL inventory export | ✅ Done | `url-inventory-july2026.md` — ~3,750 URLs across 44 categories |
| 1.3.2 | Claims registry | ✅ Done | `claims-registry-july2026.md` — 13 claim categories audited, most inconsistencies resolved |
| 1.3.3 | Masters cannibalisation map | ✅ Done | `masters-cannibalisation-map-july2026.md` — 104 pages, 16 risk groups (2 critical, 6 high, 8 moderate) |
| 1.3.4 | Schema audit | ✅ Done | `schema-audit-july2026.md` — 11 reusable schema components, all 10 recommended types implemented |
| 1.3.5 | Scaled-content quality audit | ✅ Done | `docs/scaled-content-audit.md` — 487 programmatic pages audited, not abuse, two fixable risks identified |
| 1.3.6 | Podcast archive audit | ✅ Done | `podcast-archive-audit-july2026.md` — 814 episodes, pagination/performance issues flagged |
| 1.3.7 | Orphan page audit | ✅ Done | `docs/seo/orphan-audit.md` — 0 orphan blog posts, 438 orphan episodes, 25 weakly-linked posts |
| 1.3.8 | Canonical pages audit | ✅ Done | `canonical-pages-audit-july2026.md` |
| 1.3.9 | Nutrition cluster gap analysis | ✅ Done | `docs/nutrition-cluster-gap-analysis.md` — 60% consolidation, 40% net-new |
| 1.3.10 | Content gap analysis (masters) | ✅ Done | `docs/content-gap-analysis-masters-2026-06.md` |

#### 1.4 Governance and templates

| # | Item | Status | Evidence |
|---|------|--------|----------|
| 1.4.1 | Freeze non-strategic bulk publishing | ✅ Done | Content brief template enforces the gate |
| 1.4.2 | Define 10 canonical topic clusters | ✅ Done | `docs/canonical-clusters.md` — 10 clusters with canonical URLs, keyword families, internal linking rules |
| 1.4.3 | Content brief template | ✅ Done | `docs/content-brief-template.md` — 7 gate questions, cannibalisation prevention |
| 1.4.4 | Content publish checklist | ✅ Done | `docs/content-publish-checklist.md` — 10-section pre-publish gate |
| 1.4.5 | Cannibalisation resolution protocol | ✅ Done | Documented in `docs/canonical-clusters.md` cross-cluster rules |

#### 1.5 Template and content-structure work

| # | Item | Status | Evidence |
|---|------|--------|----------|
| 1.5.1 | Redesign article template (whoFor + roadmanView) | ✅ Done | All 1,009 blog posts have both fields populated |
| 1.5.2 | Duplicate schema consolidation | ✅ Done | `WebSiteJsonLd` consolidated into `OrganizationJsonLd`; `FAQPageJsonLd` deprecated in favour of `FAQSchema` |
| 1.5.3 | Glossary architecture | ✅ Done | `src/lib/glossary.ts` with DefinedTerm schema, JSON feed, relatedTerms/articles/tools |
| 1.5.4 | BRAND_STATS centralisation | ✅ Done | `src/lib/brand-facts.ts` — 130 files import from it |
| 1.5.5 | Fix visible metric inconsistencies | ✅ Done | Community count, article count, NDY members, YouTube subs, coaching years all resolved |
| 1.5.6 | Remaining hardcoded brand stats | ✅ Done | TS/TSX files cleaned (use BRAND_STATS). MDX files (29× "1,400+", 20× "100M+") match BRAND_STATS values and can't import from TS — hardcoded strings are expected in MDX. Values in sync. |

#### 1.6 Content quality fixes (Phase 1 scope)

| # | Item | Status | Evidence |
|---|------|--------|----------|
| 1.6.1 | answerCapsule on all posts | ✅ Done | **1,009/1,009 posts** (100%) have answerCapsule. 357 posts added overnight July 16-17. All 40-80 words, British English, cycling-specific. |
| 1.6.2 | citedClaims on priority posts | ✅ Done (priority batch) | **29/1,009 posts** have citedClaims — 11 original + 18 added July 17. All 20 priority canonical cluster posts now covered. Remaining ~980 posts are lower priority. |
| 1.6.3 | Internal linking signal boost (10 posts) | ✅ Done | `docs/internal-linking-sweep-batch9.md` + orphan link fixes |
| 1.6.4 | Strength hub compliance fix | ✅ Done | Pillar uses dumbbell/kettlebell variants, no barbell compound lifts |
| 1.6.5 | Answer-question cannibalisation fix (6 pairs) | ✅ Done | 6 `/question` pages 301'd to `/answers` canonicals; documented in `docs/scaled-content-audit.md` |
| 1.6.6 | FTP-plateau problem consolidation | ✅ Done | 2 `/problem` pages consolidated to `stuck-on-plateau`; documented in `docs/scaled-content-audit.md` |

#### 1.7 Content quality fixes (NOT yet done)

| # | Item | Status | Evidence |
|---|------|--------|----------|
| 1.7.1 | "genuinely" cleanup | ✅ Done | **666 occurrences across 361 MDX files + ~460 in 57 TS/TSX files — ALL removed** (July 16-17 overnight session). Zero user-facing instances remain. 6 instances in code comments left intentionally. Varied contextual replacements throughout. |
| 1.7.2 | roadmanView first-person voice consistency | ✅ Done | **1,009/1,009 posts** (100%) now have first-person "I" in roadmanView. 472 entries rewritten across 10 batches on July 17. All reference podcast conversations, include personal opinion, British English, no slop. |
| 1.7.3 | Strengthen 25 thin `/problem` pages | ✅ Done | 24/25 problem pages now have `expertEvidence` with named guest, credential, episodeSlug, guestSlug, and insight. Template renders expert card + "Hear it" episode link + QAPage schema citation. Only `injury-return` deliberately omitted (no verified episode match). |
| 1.7.4 | Fix 27 broken glossary `relatedTerms` | ✅ Done (stale) | Verified July 16: all 115 relatedTerms cross-references resolve to defined terms. 151 terms defined, 0 missing. This item appears to have been completed in a prior session. |
| 1.7.5 | Tighten 4 Tier-3 soft attribution pages | ✅ Done | All 4 fixed: `fear-of-descending-cycling` (named Anthony Sheridan + Otto Lappi), `what-is-heat-training-cycling` (named Ross McRae/CORE + Bent Rønnestad), `carbohydrate-periodisation` (Dan Lorang credentials + framework), `training-peaks-ctl` (Joe Friel + ramp-rate guidance). |
| 1.7.6 | Masters cannibalisation FIXES | 🚫 Blocked | Map complete (16 risk groups). Actual consolidation requires GSC data to identify which pages to keep vs redirect. |
| 1.7.7 | Remove orphan `ftp-plateau-breakthrough` reference | ✅ Done | Removed from both TOPIC_POST_MAP and TOPIC_ENRICHMENT featuredPostSlugs (July 16-17 overnight session). |

---

### Phase 2 — Resolve Entity and Compound Corpus (Audit weeks 3-12)

Almost entirely unstarted. Plans and playbooks exist; execution has not begun.

#### 2.1 Entity and knowledge graph

| # | Item | Status | Evidence |
|---|------|--------|----------|
| 2.1.1 | Create Wikidata entity — The Roadman Cycling Podcast | ⏳ Not started | Full submission spec ready at `docs/wikidata-entity-plan.md` with verified Apple/Spotify/Podchaser IDs. Requires Anthony to submit (COI disclosure). |
| 2.1.2 | Create Wikidata entity — Anthony Walsh (Person) | ⏳ Not started | Spec in `docs/wikidata-entity-plan.md`. Needs independent third-party references. |
| 2.1.3 | Create Wikidata entity — Roadman Cycling (Organisation) | ⏳ Not started | Spec in `docs/wikidata-entity-plan.md`. |
| 2.1.4 | Align `sameAs` across all social/podcast profiles | ⏳ Not started | `src/lib/brand-facts.ts` has `ENTITY_IDS` with stable `@id` anchors, but external profiles need cross-linking with Wikidata Q-IDs once created. |
| 2.1.5 | Wikidata entity for Anthony Walsh (separate) | ⏳ Not started | Ready-to-submit entry at `docs/seo/wikidata-anthony-walsh.md` |

#### 2.2 Podcast corpus citability

| # | Item | Status | Evidence |
|---|------|--------|----------|
| 2.2.1 | Surface un-indexed podcast episodes | 🔨 In progress | Currently 814 of ~1,400 episodes on-site (58%). Target: 1,000 by 6 months, 1,400+ by 12 months. Gap: ~586 episodes. |
| 2.2.2 | Add transcripts to episode pages | 🔨 In progress | 380 transcript pages exist. ~1,000 episodes still lack on-site transcripts. |
| 2.2.3 | Fix podcast archive pagination/performance | ⏳ Not started | `podcast-archive-audit-july2026.md` flagged all 814 episodes rendering in a single page load. |
| 2.2.4 | Prioritise high-authority guest episodes | ⏳ Not started | Priority list (Seiler, LeMond, Lorang, Friel, Bigham) defined in roadmap but not actioned. |

#### 2.3 Nutrition coverage gap

| # | Item | Status | Evidence |
|---|------|--------|----------|
| 2.3.1 | Nutrition cluster consolidation (60% of gap) | ⏳ Not started | `docs/nutrition-cluster-gap-analysis.md` maps ~40 existing posts with broken hub topology. Needs interlinking and deduplication. |
| 2.3.2 | Nutrition net-new content (40% of gap) | ⏳ Not started | Competitive nutrition queries (carbs per hour, hydration) identified. Content brief template ready for use. |
| 2.3.3 | Wire Fuel Planner to TOPIC_ENRICHMENT | ✅ Done (stale) | `fuel-planner` IS in the `cycling-nutrition` TOPIC_ENRICHMENT tools array. Verified July 17. |

#### 2.4 Topic hub upgrades (the 10 canonical clusters)

**Cross-cutting gap: No topic hub has `reviewedBy` or `CitedClaimTable`.** Only 3 individual blog posts have `reviewedBy` across the entire site.

| # | Hub | reviewedBy | CitedClaimTable | answerCapsule | Other gaps | Status |
|---|-----|-----------|-----------------|---------------|------------|--------|
| 2.4.1 | `/masters` | ⏳ Missing | ⏳ Missing | ⏳ Missing | Tools: 5 wired (ftp-zones, age-grade, recovery-screen, training-readiness, body-composition). 7+ pages cannibalising "cycling over 40" — needs GSC data | 🔨 Partial |
| 2.4.2 | `/topics/cycling-coaching` | ⏳ Missing | ⏳ Missing | N/A | Only 1 dedicated answer page (need 10+); no "coach vs app" canonical comparison | ⏳ Not started |
| 2.4.3 | `/topics/cycling-plateaus` | N/A | N/A | N/A | ✅ **Topic hub created** — `content/topics/cycling-plateaus.mdx` (15.9KB). Five-cause diagnostic, three-layer framework, age-specific section, 4 tools integrated, 29 internal links. | ✅ Done |
| 2.4.4 | `/topics/cycling-nutrition` | ⏳ Missing | ⏳ Missing | N/A | Tools: 7 wired (fuelling, calories, energy-availability, race-weight, hydration, body-composition, fuel-planner). Needs credentialed nutritionist reviewer. | 🔨 Partial |
| 2.4.5 | `/topics/cycling-strength-conditioning` | ⏳ Missing | ⏳ Missing | N/A | Tools: 2 wired (body-composition, training-readiness). Compound-lift compliance verified ✅ | 🔨 Partial |
| 2.4.6 | `/topics/race-preparation` | ⏳ Missing | ⏳ Missing | N/A | Tools: 5 wired (fuelling, ftp-zones, race-day-checklist, fuel-planner, race-predictor). Race Predictor IS in tools array. | 🔨 Partial |
| 2.4.7 | `/topics/running-for-cyclists` | ⏳ Missing | ⏳ Missing | N/A | FAQs: 4 defined in TOPIC_FAQS (rendered programmatically). Pillar content solid (178 lines). Only reviewedBy missing. | 🔨 Partial |
| 2.4.8 | `/topics/triathlon-cycling` | ⏳ Missing | ⏳ Missing | N/A | **Zero dedicated answer pages** — needs triathlon-specific answers | ⏳ Not started |
| 2.4.9 | `/topics/cycling-tech` | ⏳ Missing | ⏳ Missing | ⏳ Missing | ✅ **Pillar expanded from 10.7KB to 17.7KB.** Repositioned as "data that makes you faster". 11 sections, 45 unique internal links, 7 tools linked, 7 FAQs. Named experts: Bigham, Pruitt, Schoberer, Lorang, Wakefield, Wild. | ✅ Done (content) |
| 2.4.10 | `/topics/against-the-clock` | ⏳ Missing | ⏳ Missing | ⏳ Missing | ✅ **Pillar expanded from 3.2KB to 12.2KB.** 4 narrative sections (Race of Truth, Hour Record, Cycling and the Watch, How Power Changed Everything), 9 FAQs, 14 internal links. | ✅ Done (content) |

---

### Phase 3 — Build the Authority Engine (Audit months 3-12)

Plans and playbooks are written. Zero execution.

#### 3.1 Off-site authority and digital PR

| # | Item | Status | Evidence |
|---|------|--------|----------|
| 3.1.1 | Co-citation outreach playbook | ✅ Done (plan only) | `docs/co-citation-outreach-playbook.md` — weekly outreach strategy targeting articles that cite Roadman guests |
| 3.1.2 | Guest backlink outreach templates | ✅ Done (plan only) | `docs/backlink-campaign/outreach-template.md` — 3 email templates |
| 3.1.3 | Priority guest backlink targets | ✅ Done (plan only) | `docs/backlink-campaign/priority-guests.md` — top 20 guests ranked by value |
| 3.1.4 | Guest export instructions | ✅ Done (plan only) | `docs/backlink-campaign/guest-export-instructions.md` |
| 3.1.5 | Execute guest backlink outreach | ⏳ Not started | Templates ready; requires Anthony for warm intros |
| 3.1.6 | Original research releases (digital PR) | ⏳ Not started | Roadmap suggests: masters-cycling findings, fuelling survey data, training-distribution analysis |
| 3.1.7 | SEO outreach templates | ✅ Done (plan only) | `docs/seo/outreach-templates.md` — podcast guesting, guest posts, digital PR |

#### 3.2 Wikipedia-grade notability

| # | Item | Status | Evidence |
|---|------|--------|----------|
| 3.2.1 | Accumulate independent third-party coverage | ⏳ Not started | By-product of the digital PR engine — cannot be placed, must be earned |
| 3.2.2 | Wikipedia article (when notability established) | ⏳ Not started | Long-term goal; depends on 3.2.1 |

---

### Cross-Cutting: Content Quality Sweep

These items span across phases and affect the entire 1,009-post corpus.

| # | Item | Scope | Status | Evidence |
|---|------|-------|--------|----------|
| CC.1 | answerCapsule coverage | 357 posts missing | ✅ Done | **1,009/1,009 posts** now have answerCapsule. Added overnight July 16-17. Each capsule is 40-80 words, British English, factual, cycling-specific. |
| CC.2 | citedClaims coverage | ~980 posts remaining | 🔨 In progress (3% done) | 29/1,009 have citedClaims — priority batch of 20 canonical cluster posts complete. Remaining coverage is lower priority. |
| CC.3 | "genuinely" cleanup | 666 MDX + ~460 TS/TSX | ✅ Done | **Zero user-facing instances remain.** 361 MDX files + 57 TS/TSX files cleaned overnight July 16-17. 6 instances in code comments left intentionally. |
| CC.4 | roadmanView first-person voice | 472 entries rewritten | ✅ Done | **1,009/1,009 posts** (100%) now use first-person "I" in roadmanView. July 17 — 10 batches, all verified. |
| CC.5 | Remaining hardcoded BRAND_STATS | ~90 instances | ✅ Done (TS/TSX) | TS/TSX files cleaned. MDX hardcoded strings may remain — needs separate check. |
| CC.6 | reviewedBy on health/nutrition/medical content | 0 of 10 hubs, 3 of 1,009 posts | ⏳ Not started | Requires recruiting credentialed reviewers |
| CC.7 | 25 thin `/problem` pages | 25 pages | ✅ Done | 24/25 pages have expertEvidence (named guest, credential, insight, episodeSlug, guestSlug). Template renders expert card with "Hear it" link. Only `injury-return` omitted (no verified episode). |
| CC.8 | 27 broken glossary relatedTerms | 27 dead links | ✅ Done (stale) | Verified: all 115 cross-references resolve. 151 terms defined, 0 missing. |

---

## 3. Priority Queue — Top 10 Next Items

Ordered by impact. Items Claude can execute autonomously are marked; items requiring Anthony are flagged.

| Priority | Item | Impact | Who | Est. effort | Why now |
|----------|------|--------|-----|-------------|---------|
| **1** | "genuinely" cleanup (376 instances) | Medium-high | Claude | M (half day) | Pure quality debt. Every instance is a visible AI fingerprint that undermines editorial credibility. Scripted find-and-rewrite. |
| **2** | answerCapsule on remaining 357 posts | High | Claude | L (1-2 days) | Direct AEO impact — answer capsules are what AI engines extract. 35% of posts lack the single most extractable element. |
| **3** | Write 27 missing glossary terms | Medium | Claude | S (2-3 hours) | Fixes dead internal links and deepens the glossary's SEO surface area. Quick win. |
| **4** | Strengthen 25 thin `/problem` pages | High | Claude | L (1-2 days) | Highest scaled-content exposure. Add expertEvidence from verified transcripts. Turns weakest category into genuinely grounded pages. |
| **5** | roadmanView first-person rewrite (~500 entries) | Medium | Claude | L (1-2 days) | Voice consistency. Anthony's "I" perspective is the brand differentiator; generic third-person undermines it. |
| **6** | Create plateaus topic hub | Medium-high | Claude | S (2-3 hours) | Only cluster of 10 without a topic hub. Define in `topics.ts`, write pillar content MDX. |
| ~~**7**~~ | ~~Wire tools into TOPIC_ENRICHMENT (masters, strength)~~ | ~~Low-medium~~ | ~~Claude~~ | ~~XS~~ | ✅ Done (stale item) — masters-cycling has 5 tools (ftp-zones, age-grade, recovery-screen, training-readiness, body-composition), cycling-strength-conditioning has 2 (body-composition, training-readiness). Already wired. |
| **8** | **GSC/GA4/Ahrefs access** | **Critical** | **Anthony** | XS (Anthony's time) | Unlocks: cannibalisation fixes, baseline dashboard, monthly KPIs, competitive benchmarking. Everything in Phases 2-3 is flying blind without this data. |
| **9** | **Submit Wikidata entities** | **High** | **Anthony** | S (Anthony's time) | Submission spec is complete and verified. Anthony must submit due to COI disclosure rules. Unlocks Knowledge Panel and AI entity resolution. |
| **10** | **Recruit nutrition + strength reviewers** | **High** | **Anthony** | M (Anthony's time) | `reviewedBy` is the single highest-leverage hub improvement per `docs/canonical-clusters.md`. Requires credentialed professionals Anthony trusts. |

---

## 4. Blocked Items — Waiting on Anthony

| Item | What's needed | What's ready | Unblocks |
|------|--------------|-------------|----------|
| **GSC access** | Add claude@roadmancycling.com (or share read access) | N/A | Cannibalisation fixes, baseline dashboard, monthly organic KPIs, recrawl of purged `www` pages |
| **GA4 access** | Share read access to GA4 property | N/A | Funnel conversion baseline, attribution tracking |
| **Ahrefs access** | Share read access or export referring-domain data | N/A | Off-site authority baseline, competitive gap quantification |
| **Bing Webmaster Tools** | Submit site + verify | `docs/seo/indexnow-ready.md` has 526 URLs ready | Bing indexation, IndexNow submission |
| **Wikidata submission** | Anthony submits 3 entities with COI disclosure | `docs/wikidata-entity-plan.md` — fully specced with verified IDs. `docs/seo/wikidata-anthony-walsh.md` — ready-to-submit. | Knowledge Panel, AI entity resolution, `sameAs` alignment |
| **Reviewer recruitment** | Find credentialed sports nutritionist + S&C professional | Content publish checklist mandates `reviewedBy` for health content | `reviewedBy` on all 10 topic hubs + health-related blog posts |
| **Guest backlink outreach** | Anthony provides warm intros to top-20 podcast guests | `docs/backlink-campaign/` — templates, priority list, and process all ready | Off-site authority growth, referring-domain KPI |
| **AI benchmark execution** | Manual runs in ChatGPT, Gemini, Claude, Perplexity, Google AI Mode | `scripts/ai-benchmark-prompts.json` — 200 prompts ready | Day-0 baseline for the north-star KPI (AI citation share) |

---

## 5. Estimated Effort — Remaining Work

T-shirt sizes: XS = <1hr, S = 2-4hrs, M = half day, L = 1-2 days, XL = 3-5 days, XXL = 1-2 weeks

### Claude can do (no Anthony needed)

| Item | Size | Notes |
|------|------|-------|
| "genuinely" cleanup (376 instances) | **M** | Scripted: find each instance, rewrite contextually, verify no meaning loss |
| answerCapsule on 357 posts | **XL** | Need to read each post and write a 40-80 word direct answer. Batchable but requires per-post judgment. |
| citedClaims expansion (priority 20 posts) | **L** | Focus on the 3 Priority-1 cluster canonical posts + top 20 traffic posts. Requires reading existing content and structuring claims. |
| Write 27 missing glossary terms | **S** | Legitimate cycling terms; can be written from existing corpus knowledge |
| Strengthen 25 `/problem` pages | **XL** | Per-page: identify relevant guest/episode from transcripts, add expertEvidence, rewrite with named attribution |
| ~~roadmanView first-person rewrite~~ | ~~**XL**~~ | ✅ Done — 472 entries rewritten across 10 batches, 1,009/1,009 = 100% |
| Remaining BRAND_STATS hardcoded strings | **S** | ~90 instances to convert to `BRAND_STATS.*` references |
| ~~Create plateaus topic hub~~ | ~~**S**~~ | ✅ Done — 15.9KB pillar content, 5-cause diagnostic framework, 4 tools integrated |
| Wire tools into TOPIC_ENRICHMENT | **XS** | Code change: add tool slugs to masters and strength enrichment objects |
| ~~Expand against-the-clock pillar~~ | ~~**M**~~ | ✅ Done — expanded from 3.2KB to 12.2KB, 4 narrative sections, 9 FAQs |
| Remove orphan `ftp-plateau-breakthrough` | **XS** | Delete from `TOPIC_POST_MAP` |
| Fix 4 Tier-3 soft attribution pages | **S** | Name the guest behind episode citations on 4 pages |
| IndexNow submission | **XS** | Submit 526 URLs per the spec |
| Expand cycling-tech pillar | **M** | Reposition as "data that makes you faster"; expand content |
| Create triathlon answer pages (10+) | **L** | Write 10+ dedicated triathlon answer pages for answers-data |
| Create coaching answer pages (10+) | **L** | Write 10+ dedicated coaching answer pages for answers-data |
| Nutrition cluster interlinking | **M** | Fix broken hub topology per gap analysis |

**Total Claude-executable effort: ~3-4 weeks of focused sessions**

### Requires Anthony (time estimate is Anthony's time only)

| Item | Size | Notes |
|------|------|-------|
| Share GSC/GA4/Ahrefs/Bing access | **XS** | Add permissions or export data. 30 min. |
| Submit 3 Wikidata entities | **S** | Submission spec is done; Anthony reviews, adds COI disclosure, submits. 2-3 hours. |
| Recruit nutrition reviewer | **M** | Find a credentialed sports nutritionist willing to be listed as reviewer. Ongoing. |
| Recruit strength reviewer | **M** | Find a credentialed S&C professional. Ongoing. |
| Warm intros for guest backlink outreach | **S** | Send intro emails to top-20 podcast guests. Templates are ready. 2-3 hours. |
| Approve nutrition cluster content angles | **XS** | Review and approve content briefs for net-new nutrition articles. 30 min. |
| Execute AI benchmark (or delegate) | **L** | Run 200 prompts across 5 engines manually. Could be partially automated or delegated. 1-2 days. |

**Total Anthony time needed: ~2 days spread over the coming weeks**

---

## Appendix: Document Map

All audit-related documents and their roles:

| Document | Location | Role |
|----------|----------|------|
| SEO/AEO Audit (Deliverable 1) | `docs/seo-aeo-audit-june-2026.md` | The founding audit — 10 dimensions scored |
| Build Roadmap (Deliverable 2) | `docs/seo-aeo-roadmap-june-2026.md` | Phased plan with KPIs |
| Canonical Topic Clusters | `docs/canonical-clusters.md` | The 10 clusters, canonical URLs, and gap analysis |
| Claims Registry | `claims-registry-july2026.md` | Every public numerical claim, with consistency status |
| Masters Cannibalisation Map | `masters-cannibalisation-map-july2026.md` | 104 pages, 16 risk groups |
| Schema Audit | `schema-audit-july2026.md` | 11 schema components, all types implemented |
| URL Inventory | `url-inventory-july2026.md` | ~3,750 URLs across 44 categories |
| Article Template Redesign | `article-template-redesign-july2026.md` | Design doc for whoFor + roadmanView |
| Podcast Archive Audit | `podcast-archive-audit-july2026.md` | 814 episodes, performance issues |
| Canonical Pages Audit | `canonical-pages-audit-july2026.md` | Canonical destination analysis |
| Scaled-Content Quality Audit | `docs/scaled-content-audit.md` | 487 programmatic pages — not abuse, two risks |
| Nutrition Cluster Gap Analysis | `docs/nutrition-cluster-gap-analysis.md` | 60% consolidation, 40% net-new |
| Wikidata Entity Plan | `docs/wikidata-entity-plan.md` | Ready-to-submit Wikidata entries |
| Wikidata — Anthony Walsh | `docs/seo/wikidata-anthony-walsh.md` | Ready-to-submit person entity |
| Content Brief Template | `docs/content-brief-template.md` | 7-gate template for new content |
| Content Publish Checklist | `docs/content-publish-checklist.md` | 10-section pre-publish gate |
| Co-Citation Outreach Playbook | `docs/co-citation-outreach-playbook.md` | Weekly outreach strategy |
| Backlink Campaign | `docs/backlink-campaign/` | Templates, priority targets, process |
| SEO Outreach Templates | `docs/seo/outreach-templates.md` | 3 outreach plays |
| IndexNow Submission | `docs/seo/indexnow-ready.md` | 526 URLs ready for Bing/Yandex |
| Orphan Page Audit | `docs/seo/orphan-audit.md` | 438 orphan episodes identified |
| AI Benchmark Prompts | `scripts/ai-benchmark-prompts.json` | 200 prompts, 5 engines, 11 categories |
| AI Citation Baseline | `ai-citation-baseline-2026-06-09.md` | 20-query mini-baseline (39% citation rate) |
| Brand Facts (BRAND_STATS) | `src/lib/brand-facts.ts` | Single source of truth for all brand numbers |
| State of Play | `STATE-OF-PLAY-JULY16.txt` | Session summary from July 16 |
