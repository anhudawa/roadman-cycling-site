# Roadman Cycling — AI, Search & Answer-Engine Audit (Deliverable 1)

**Date:** 9 June 2026
**Scope:** roadmancycling.com — technical SEO, schema, content/AEO, AI-citation visibility, entity strength, off-site authority, multi-surface presence, competitive position, funnel alignment.
**Method note:** Findings below are verified against the live site (raw HTML, headers, robots, sitemaps, schema) and live web-search results on 9 June 2026. Three things require tooling not used here and are flagged where they appear: (a) backlink/referring-domain quantification needs Ahrefs/Semrush; (b) true per-engine AI-citation testing needs manual runs in ChatGPT, Perplexity, Gemini and Google AI Mode; (c) traffic and conversion baselines need Search Console and analytics. Web-search results are used as a directional proxy for citation visibility, not a substitute for per-engine testing.

---

## 1. Executive summary

Roadman's on-site technical and answer-engine foundation is, on the evidence, ahead of almost every competitor in the cycling space. The apex domain is clean, fast (Vercel/Next.js), comprehensively schema-marked, and carries an `llms.txt` and a full AI-crawler allowlist — a deliberate AEO posture most cycling publishers haven't built. Where the content corpus has coverage, Roadman already dominates the result set.

The gap between where Roadman is and "the biggest cycling media brand in the world" is not on-page. It is three things:

1. **A live technical defect actively splitting authority.** The legacy `www` subdomain is not redirecting to the apex domain. It returns 403 to direct requests, yet Google still has stale legacy `www` pages indexed (one visibly containing "Lorem ipsum" placeholder text). This duplicates the brand across two hosts, wastes authority, and muddies the entity.
2. **A weak brand entity.** "Roadman Cycling" and "Anthony Walsh" have no Wikipedia presence, no clear Knowledge Panel, and compete against an ambiguous brand name ("roadman" returns UK slang, a 1988 video game, and unrelated brands). AI answer engines resolve and trust entities; a weak entity caps citation share regardless of content quality.
3. **Pillar-uneven visibility, driven by off-site authority.** Roadman owns training-methodology queries outright but is absent from the most competitive nutrition queries it explicitly targets. The most probable cause is off-site authority depth, which the stated hypothesis already identifies as the binding constraint — the evidence here supports that.

**The single biggest constraint:** off-site authority and entity strength. The content engine is built; it is under-cited because the brand is under-authoritative off-site and under-resolved as an entity.

---

## 2. Scorecard

| # | Dimension | Rating | One-line justification |
|---|-----------|--------|------------------------|
| 1 | Technical SEO foundation | 🟠 Amber | Apex is excellent; the `www` legacy 403 + stale indexation is a live defect dragging the whole domain. |
| 2 | Structured data / schema | 🟢 Green | Comprehensive, valid schema across templates (Org, Person, PodcastSeries, FAQPage, BreadcrumbList, Speakable). |
| 3 | On-page & content SEO | 🟢 Green | Deep, fresh, answer-shaped content — but coverage is uneven across pillars. |
| 4 | AEO / GEO | 🟢 Green | Standout. `llms.txt`, answer-first pages, full AI-bot allowlist, Speakable schema. Ahead of the field. |
| 5 | Entity & knowledge graph | 🔴 Red | No Wikipedia, no clear Knowledge Panel, ambiguous brand name. The biggest single gap for the goal. |
| 6 | Off-site authority & digital PR | 🔴 Red | Not directly quantified (needs Ahrefs), but strong indirect evidence this is the binding constraint. |
| 7 | Multi-surface media presence | 🟠 Amber | 100M+ downloads and two YouTube channels, but only ~311 episode pages on-site vs 1,400+ episodes — most of the corpus is not yet citable. |
| 8 | Competitive landscape | 🟠 Amber | Dominates the coaching/answer lane; absent in top nutrition queries; not contesting the news lane (correctly). |
| 9 | Content gap / whitespace | 🟠 Amber | Clear nutrition gap; the podcast corpus is the largest untapped citable asset. |
| 10 | Business / funnel alignment | 🟢 Green | Every surface routes cleanly to Plateau Diagnostic → NDY → Inner Circle. |

---

## 3. Findings by dimension

### 1. Technical SEO foundation — 🟠
**Strong:** Apex `roadmancycling.com` returns clean 200s on Vercel with a strict permissions-policy. Seven XML sitemaps under a valid index, totalling **2,369 URLs**, with fresh `lastmod` timestamps (same-day). Canonicals are self-referential and correct; article-level `robots` is `index, follow`. Robots.txt is well-formed and disallows the right operational paths (`/api/`, `/account/`, `/checkout/`, `/draft/`).

**Broken / live defect:** `www.roadmancycling.com` does **not 301-redirect** to the apex. The root and subpaths (`/contact`, `/blog`) return **HTTP 403** to direct requests, while Google's index still surfaces legacy `www` pages with old content — the legacy `/blog` page visibly contains "Lorem ipsum" placeholder text and promotes an old "Roadman Toolkit." This is duplicate-host exposure: two versions of the brand, one stale, competing for the same signals. **This is the top-priority fix.**

**Minor:** robots.txt lists `sitemap-index.xml` plus `sitemap/0–5.xml`, but the live index contains `0–6.xml` (sitemap 6 omitted from robots). Cosmetic, worth tidying.

### 2. Structured data / schema — 🟢
Homepage carries `Organization`, `Person`, `PodcastSeries`, `WebSite` + `SearchAction`, `FAQPage` (with `Question`/`Answer`), `ItemList`, `SpeakableSpecification` and `Place`. Articles carry `BlogPosting`, `BreadcrumbList`, `FAQPage`, author `Person`, `Organization` and `SpeakableSpecification`. This is broader than most publishers run and directly supports rich results and AI extraction. **Opportunity:** add `PodcastEpisode` and `VideoObject` schema at the episode/video level to make the audio/video corpus individually citable (ties to Finding 7).

### 3. On-page & content SEO — 🟢
~356 blog articles plus answer pages, comparisons, glossary and diagnostics. Content is genuinely answer-shaped: leads with a direct extractable answer, cites named experts and studies, and links to source episodes ("Hear it:"). Freshness is active — several core pages updated within the last two weeks. **Caveat:** coverage is pillar-uneven (see Findings 8–9). Minor content-QA note: at least one answer page uses "robustly" — on the internal banned-words list for written content.

### 4. AEO / GEO — 🟢 (standout)
The `llms.txt` is best-in-class: entity-first description, canonical pillar taxonomy, named guests with correct credentials (Dan Lorang correctly described as Red Bull–Bora–Hansgrohe, not miscredited), explicit citation guidance ("link to /author/anthony-walsh"), and UTM tagging for AI crawlers. Robots.txt explicitly allows the full modern AI-crawler set: GPTBot, ClaudeBot, OAI-SearchBot, ChatGPT-User, PerplexityBot, Perplexity-User, Google-Extended, Applebot-Extended, Meta-ExternalAgent, cohere-ai and Bytespider. Combined with answer-first page formats and Speakable schema, this is a deliberate, sophisticated AEO build. The ceiling on it is entity strength and off-site authority, not structure.

### 5. Entity & knowledge graph — 🔴
No Wikipedia article for Roadman Cycling, the podcast, or Anthony Walsh. A `site:` and brand search surfaces heavy disambiguation noise — UK "roadman" slang, the 1988 "Cycle Race: Road Man" video game, Boardman Bikes, Roadrunner magazine — meaning search engines and LLMs have weak signals tying the brand to a single, authoritative entity. No clear Google Knowledge Panel. For a brand targeting maximum AI-citation share this is the highest-leverage gap: answer engines preferentially cite well-resolved entities, and the `llms.txt` already does the on-site half of the work — the off-site half (Wikidata, Wikipedia-grade references, consistent `sameAs`) is missing.

### 6. Off-site authority & digital PR — 🔴 (needs quantification)
Not directly measured here — referring-domain counts and authority scores require Ahrefs/Semrush and should be pulled to set a baseline. The indirect evidence is consistent and strong: Roadman is absent from the most competitive nutrition SERPs despite deep on-page coverage and a dedicated fuelling tool, while authority-heavy domains (TrainerRoad, CTS, EF Pro Cycling, Cycling Weekly) hold those positions. When on-page quality is high and the page still doesn't rank or get cited, off-site authority is the usual cause. This aligns with the stated hypothesis and should be treated as the primary constraint pending quantification.

### 7. Multi-surface media presence — 🟠
The brand's defining asset — 1,400+ episodes, 100M+ downloads — is the largest untapped citable resource. The `llms.txt` states only **311+ searchable episode pages on-site**, meaning roughly three-quarters of the episode corpus is not individually represented as a citable URL. Transcripts, episode pages and `PodcastEpisode`/`VideoObject` schema are how an LLM cites a podcast; right now most of the corpus can't be cited because it isn't on-site in citable form. Two YouTube channels (~75K combined subs) are a discovery and citation surface that AI engines increasingly pull from. There is also no evident presence in the community sources (Reddit, forums) that LLMs retrieve from heavily.

### 8. Competitive landscape — 🟠
Two distinct lanes emerge from the query testing:
- **Coaching / training-methodology lane:** Roadman wins decisively. For "polarised vs sweet spot training," it holds four top positions (its answer page plus three articles), out-covering Fast Talk Labs, FasCat, Veloi and TrainCraft.
- **Nutrition lane:** Roadman is absent from the top results for "how many grams of carbs per hour cycling." The positions are held by ROUVY, TrainerRoad, CTS/TrainRight, EF Pro Cycling, Cycling Weekly and Road Cycling Academy.
- **News / racing / gear lane:** dominated by Future plc (Cyclingnews, BikeRadar) and GCN. Roadman is not contesting this and **should not** — it's a different, capital-intensive game.

The strategic read: Roadman's realistic path to "biggest" runs through owning the **coaching, training-science and answer lane** completely, then extending into nutrition — not through fighting news publishers.

### 9. Content gap / whitespace — 🟠
The clearest near-term gap is competitive nutrition queries (carbs per hour, fuelling, hydration) — high-volume, directly tied to an existing tool and pillar, and currently lost. The larger whitespace is the un-surfaced podcast corpus: hundreds of expert conversations that no competitor can replicate and that are not yet citable.

### 10. Business / funnel alignment — 🟢
Confirmed across templates: homepage, articles and hubs all route into the funnel (Plateau Diagnostic → Not Done Yet → Inner Circle), with consistent CTAs and an "Ask Roadman" RAG layer capturing intent. Visibility that arrives converts.

---

## 4. AI-citation share analysis (directional proxy)

True per-engine testing should be run by the team in each engine; the below is from live web-search results on 9 June 2026 and indicates retrieval visibility.

| Test query | Roadman present? | Position strength | Who else wins |
|---|---|---|---|
| polarised vs sweet spot training | Yes — 4 results | Dominant (answer page + 3 articles) | Fast Talk Labs, FasCat, Veloi, TrainCraft |
| how many grams of carbs per hour cycling | No | Absent from top set | ROUVY, TrainerRoad, CTS, EF Pro Cycling, Cycling Weekly |
| (brand) Roadman Cycling | Yes — own properties | Owns brand term, but with disambiguation noise | video game, slang, Boardman Bikes |

**Pattern:** retrieval visibility tracks corpus coverage × authority. Strong where Roadman has built a content cluster in its core lane; absent where a competitive cluster meets higher off-site authority. Brand queries are won but diluted by entity ambiguity.

---

## 5. Competitive position and the path to #1

Roadman is already the strongest **coaching-and-training-science** voice in the independent cycling space on the evidence of its core-lane dominance and its AEO build. It is not the biggest cycling **media** brand — that title sits with corporate publishers (Future plc) and GCN, who win news, racing and gear.

The realistic path to #1 is not to become a second Cyclingnews. It is to become **the definitive, most-cited cycling source for "how to train and ride better"** — the question-and-answer layer of the entire sport — and to own that across both search and AI. That means:
- **vs Fast Talk Labs / FasCat / CTS / TrainerRoad:** Roadman already matches or beats them on depth in its lane and is ahead on AEO. The lever is authority + entity, not content.
- **vs ROUVY / TrainerRoad in nutrition:** close the coverage gap and build authority; this lane is winnable.
- **vs Cyclingnews / BikeRadar / GCN:** do not contest head-on. Win the adjacent, higher-intent lane they under-serve.

---

## 6. Risk register (ranked by severity)

| Sev | Risk | Evidence | Impact |
|---|---|---|---|
| **1 — Critical** | `www` legacy subdomain not redirecting; stale pages indexed | `www` returns 403; Google indexes legacy `www/blog` with "Lorem ipsum" text | Splits authority across two hosts, dilutes entity, wastes crawl |
| **2 — High** | Weak/ambiguous brand entity | No Wikipedia/Knowledge Panel; brand-name disambiguation noise | Caps AI-citation share regardless of content quality |
| **3 — High** | Off-site authority depth (to be quantified) | Absent from competitive nutrition SERPs despite strong pages | Limits rankings and citations across competitive clusters |
| **4 — Medium** | Podcast corpus not citable | ~311 episode pages vs 1,400+ episodes | Largest unique asset is mostly invisible to AI |
| **5 — Low** | Sitemap/robots minor mismatch; missing PodcastEpisode/VideoObject schema | robots omits sitemap 6; no episode/video schema | Marginal crawl/eligibility loss |

---

*End of Deliverable 1. The build roadmap that sequences the fixes and investments above is in Deliverable 2.*
