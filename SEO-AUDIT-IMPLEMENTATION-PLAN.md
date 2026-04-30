# SEO Discoverability Audit — Implementation Plan

> Cross-referenced against the 26 DEV-* items shipped Apr 27 2026.
> This document tracks what's ALREADY DONE vs what's NEW.

---

## Already Shipped (from prior audit)

These items from the incoming audit are **already live on main**:

| Audit Recommendation | Status | Prior Item |
|---|---|---|
| robots.txt with AI crawler rules | ✅ Done | DEV-SEO-02 — 13 user-agents with explicit allow/disallow |
| Sitemap split by page type | ✅ Done | DEV-SEO-01 — 6 child sitemaps (static, blog, podcast, guests, plans, topics+more) |
| llms.txt + llms-full.txt | ✅ Done | DEV-SEO-02 / DEV-AEO-03 |
| Answer-first summary blocks | ✅ Done | DEV-AEO-04 — ShortAnswer + AnswerCapsule components |
| Source/methodology blocks | ✅ Done | DEV-AEO-05 — SourceMethodology component |
| Content-map API with relationships | ✅ Done | DEV-AEO-02 |
| Ask Roadman CTAs on templates | ✅ Done | DEV-AEO-01 — AskRoadmanCTA component |
| JSON-LD dedup (layout vs page) | ✅ Done | DEV-SEO-05 |
| Reusable page templates (Question, Comparison, Benchmark, Protocol, Diagnosis) | ✅ Done | DEV-GROWTH-02 |
| Proof/case-study modules | ✅ Done | DEV-GROWTH-03 — AthleteProfileCard, BeforeAfterMetrics, TestimonialBlock |
| Internal link journey modules | ✅ Done | DEV-GROWTH-05 — JourneyBlock (funnel-aware, pillar-aware) |
| Author/entity layer | ✅ Done | DEV-GROWTH-04 — author pages, methodology pages, guest pages |
| Homepage/coaching story + CTA hierarchy | ✅ Done | DEV-GROWTH-01 |
| Analytics dashboard (organic + AI + citations + conversion) | ✅ Done | DEV-DATA-01 |
| AI referrer attribution | ✅ Done | DEV-DATA-02 — server-side fallback + indexed DB column |
| Brand citation testing system | ✅ Done | DEV-DATA-03 — multi-provider adapters |
| All security hardening | ✅ Done | DEV-SEC-01 through DEV-SEC-08 |
| LCP optimization | ✅ Done | DEV-SEO-04 |
| JS weight reduction | ✅ Done | DEV-SEO-03 — ConversionChrome lazy loading |

---

## NEW Work — Prioritised Implementation

### Priority 1: Entity & Brand Infrastructure — ✅ ALL COMPLETE

**SEO-NEW-01: Entity pages** ✅ SHIPPED
- Create /entity/roadman-cycling, /entity/anthony-walsh, /entity/roadman-podcast, /entity/not-done-yet, /entity/ask-roadman, /entity/roadman-method
- Each page: one-sentence definition, canonical name, alternate names, sameAs links, claims with evidence, JSON-LD, internal links
- Schema: Organization, Person, PodcastSeries, WebApplication as appropriate

**SEO-NEW-02: Brand Facts page + /api/facts.json**
- Consolidate: 1M+ listeners, 65K newsletter, 1,400+ episodes, 18 countries, founded 2013, founder Anthony Walsh
- Machine-readable JSON endpoint
- Reference on press, about, organization schema

**SEO-NEW-03: Schema expansion on existing templates**
- PodcastSeries on /podcast
- PodcastEpisode + Person + AudioObject on episode pages
- DefinedTerm + DefinedTermSet on glossary pages
- WebApplication on tool pages
- Service on coaching page
- Enhanced Person (sameAs, knowsAbout, hasOccupation) on guest pages
- SearchAction on homepage

**SEO-NEW-04: Evidence level labels + cited claim tables**
- Add evidence grading system component (Strong / Moderate / Emerging / Anecdotal)
- Add cited claim table component (Claim | Position | Evidence | Implication)
- Deploy on article and topic hub templates

### Priority 2: API & Content Infrastructure — ✅ ALL COMPLETE

**SEO-NEW-05: Public JSON feeds** ✅ SHIPPED (PR #87)
- /feeds/articles.json, /feeds/episodes.json, /feeds/topics.json, /feeds/glossary.json, /feeds/tools.json, /feeds/guests.json
- Each item: id, type, title, summary, canonical URL, dates, author, primaryTopic, entities, relatedEpisodes, relatedTools, evidenceLevel

**SEO-NEW-06: Search + Fetch API endpoints**
- /api/v1/search?q= — returns ranked results with summaries
- /api/v1/fetch?id= — returns title, URL, summary, clean markdown body, citations, related pages, FAQ, schema entities

**SEO-NEW-07: Tool API endpoints**
- /api/v1/tools/ftp-zones?ftp=
- /api/v1/tools/race-weight?weight=&height=&bodyfat=
- Machine-readable versions of existing calculators

**SEO-NEW-08: Legacy URL cleanup** ✅ SHIPPED (branch claude/amazing-grothendieck-10edef)
- 301 www → non-www
- Canonicalize query parameter pagination (/blog/?post_page=1)
- 301 old /blog/[category] → current topic hubs
- noindex low-value parameter pages
- Audit + fix redirect chains

### Priority 3: Content Expansion — ✅ ALL COMPLETE

**SEO-NEW-09: Event training cluster template + first 5 events** ✅ SHIPPED
- Scalable template: event overview, fitness demands, climbing demands, finish time ranges, 16/12/8/4/2/1-week plan variants, fueling, pacing, mistakes, race predictor integration, coaching CTA
- First events: Wicklow 200, Mallorca 312, Fred Whitton, RideLondon, Étape du Tour

**SEO-NEW-10: "Coaching for [segment]" landing pages**
- Commercial landing pages with educational depth
- Segments: masters cyclists, beginners, women, busy professionals, triathletes, sportive riders, gravel racers, over 40, over 50, time-crunched (6hrs/week), post-injury, weight loss
- Structure: H1, direct answer, common problem, training approach, example week, mistakes, case study, FAQ, CTA

**SEO-NEW-11: Podcast episode page upgrades (pilot 10)**
- Add: transcript, key takeaways, timestamps, guest bio, claims from episode, citations/resources, topic tags, PodcastEpisode schema
- Priority episodes by guest authority + topic demand

**SEO-NEW-12: Podcast-derived authority pages**
- "What Stephen Seiler says about polarized training"
- "What Dan Lorang says about endurance training"
- "25 coaches on how to increase FTP"
- "Best Roadman episodes for masters cyclists"
- "Best Roadman episodes for time-crunched cyclists"

**SEO-NEW-13: Expanded comparison pages**
- Roadman vs TrainerRoad, vs FasCat, vs JOIN Cycling, vs Zwift plans
- cycling coach vs training app, vs AI training plan
- polarized vs pyramidal, sweet spot vs zone 2, FTP vs heart rate
- indoor vs outdoor, strength vs more volume, group vs 1:1 coaching

**SEO-NEW-14: Question-based content pages**
- FTP cluster: good FTP for amateur? how long to increase? why not improving? FTP vs HR? how often test? what FTP for sportive?
- Masters cluster: train over 40? recover over 50? more strength? hard rides per week? why losing power?
- Nutrition cluster: carbs per hour? eat before long ride? fuel a sportive? protein needs? train fasted?
- Coaching cluster: worth it? cost? what does coach do? when hire?
- Event cluster: train for Wicklow 200? pace Mallorca 312? weeks for sportive?

### Priority 4: Strategic Plays — ✅ ALL COMPLETE (Apr 30)

**SEO-NEW-15: Read-only MCP server** ✅ SHIPPED (branch claude/agitated-dirac-b72809)
- Endpoints: search_roadman, fetch_article, fetch_episode, fetch_guest, fetch_tool_result, fetch_training_plan, fetch_glossary_term
- Read-only, retrieval-focused, non-destructive

**SEO-NEW-16: Embeddable calculators** ✅ SHIPPED (branch claude/fervent-knuth-42853f)
- FTP zones calculator embed snippet
- Sportive finish time predictor embed
- Carbs-per-hour calculator embed
- Embed code with attribution link for clubs and coaches

**SEO-NEW-17: Intent-specific CTAs per page type** ✅ SHIPPED (branch claude/cranky-nobel-40e75c)
- FTP plateau → Plateau diagnostic + email report
- FTP zones → Save zones + email workout plan
- Sportive training → Download event-specific plan
- Masters cycling → Masters training checklist
- Nutrition → Carbs/hour calculator + fueling guide
- Coaching cost → Book/apply/free trial
- Comparison → Decision quiz: coach vs app

**SEO-NEW-18: Backlink outreach strategy** ✅ PLANNED (scheduled task created)
- Guest backlink reclamation (offer episode page with transcript + key takeaways)
- Event organizer outreach (training guides, pacing guides, predictor)
- Club & coach embeddable calculator outreach
- Annual report / data asset for press + link earning

**SEO-NEW-19: Roadman Benchmarks (data asset)**
- FTP by age, FTP by weight, W/kg by age
- Training hours by goal, average sportive finish time
- Sources: anonymized coaching data, community polls, tool usage, podcast insights
- "The Roadman Amateur Cycling Performance Report 2026"

**SEO-NEW-20: Podcast SEO at scale (300 episodes)** ✅ SHIPPED (branch claude/brave-fermi-5a3294)
- Full prioritisation scorer + batch enrichment system for 311 episodes
- Scripts: seo:batch, seo:audit:episodes, episode:enrich, seo:review

---

## Agent Assignment

| Agent | Items | Type |
|---|---|---|
| Agent A: Entity & Brand | SEO-NEW-01, SEO-NEW-02 | Code |
| Agent B: Schema Expansion | SEO-NEW-03 | Code |
| Agent C: Evidence & Claims | SEO-NEW-04 | Code |
| Agent D: JSON Feeds & API | SEO-NEW-05, SEO-NEW-06, SEO-NEW-07 | Code |
| Agent E: Legacy URL Cleanup | SEO-NEW-08 | Code |
| Agent F: Event Training Template | SEO-NEW-09 | Code + Content |
| Agent G: Coaching Segment Pages | SEO-NEW-10 | Code + Content |
| Agent H: Podcast Episode Upgrade | SEO-NEW-11 | Code + Content |
| Agent I: Comparison Expansion | SEO-NEW-13 | Content |
| Agent J: Question Content | SEO-NEW-14 | Content |
| Agent K: Podcast Authority Pages | SEO-NEW-12 | Content |

Priority 4 items (SEO-NEW-15 through SEO-NEW-20) are strategic plays for month 2-3 and don't need agents yet.

---

## Currently Running Agents

- Search Console indexing audit (code, running)
- Fix Ask Roadman bugs (code, running)
- Pre-deploy audit main (code, running)
