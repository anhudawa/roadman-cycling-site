# Roadman Cycling — Build Roadmap (Deliverable 2)

**Date:** 9 June 2026
**Companion to:** Audit (Deliverable 1)
**North star:** Become the world's most-cited cycling source across traditional search and every major AI answer engine — and convert that visibility into coaching revenue.

This roadmap turns the audit into a sequenced build. The principle throughout: the content engine is already built and ahead of the field, so the work is **fix what leaks, resolve the entity, and build authority** — in that order. Nothing here depends on the founder beyond sign-off and the occasional named asset.

---

## 1. North star and KPIs

"Biggest cycling media brand in the world" needs measurable proxies. Track these; set the baseline in week one (several need tooling not yet in use).

| KPI | What it proves | Baseline | 90-day | 6-month | 12-month |
|---|---|---|---|---|---|
| AI-citation share (test-query set, 5 engines) | The actual goal | Run baseline now | +1 lane owned | Coaching lane dominant across engines | Coaching + nutrition cited by default |
| Referring domains (Ahrefs) | Off-site authority | Pull now | +10% quality domains | +25% | Top-3 vs independent coaching peers |
| Brand entity resolved | Knowledge Panel / Wikidata | None | Wikidata entity live | Knowledge Panel triggered | Wikipedia-grade citations accruing |
| Non-brand organic sessions (GSC) | Search demand capture | Pull now | +15% | +40% | Category-leading in coaching lane |
| Episode pages indexed | Corpus citability | 311 | 600 | 1,000 | 1,400+ |
| Funnel conversions from organic/AI | Revenue, not vanity | Pull now | Attribution live | +20% | +50% |

The non-negotiable: every initiative below must move citation/visibility **or** funnel conversion. Anything that moves neither is cut (Section 6).

---

## 2. Prioritised initiative list (ICE: Impact × Confidence ÷ Effort, 1–10)

| Initiative | Impact | Confidence | Effort | ICE | Type |
|---|---|---|---|---|---|
| 301-redirect `www` → apex; purge/recrawl legacy pages | 9 | 9 | 2 | **40.5** | Quick win |
| Pull baselines (Ahrefs, GSC, per-engine citation test) | 7 | 9 | 2 | **31.5** | Quick win |
| Wikidata entity + consistent `sameAs` across profiles | 8 | 7 | 3 | **18.7** | Quick win |
| Robots/sitemap tidy + add PodcastEpisode/VideoObject schema | 5 | 8 | 2 | **20.0** | Quick win |
| Close the nutrition coverage gap (cluster build) | 7 | 7 | 5 | **9.8** | Strategic |
| Surface the podcast corpus as citable episode pages | 9 | 7 | 7 | **9.0** | Strategic |
| Off-site authority / digital-PR engine | 9 | 6 | 8 | **6.8** | Strategic |
| Wikipedia-grade notability (earned, not placed) | 8 | 5 | 8 | **5.0** | Strategic |

Quick wins ship in days and are mostly dev/ops. Strategic builds are the ones that move the brand from "excellent site" to "category-defining."

---

## 3. Phased plan

### Phase 1 — Fix and stabilise (weeks 1–3)
Stop the leaks before pouring more in.
- **301 the `www` host to the apex** for all paths at the DNS/host level; remove the legacy deployment; submit a removal/recrawl in Search Console. *Outcome:* one authoritative host. *Proof metric:* zero legacy `www` URLs in `site:www.` results.
- **Pull all baselines** — Ahrefs referring domains, GSC organic + queries, and a manual AI-citation test across ChatGPT, Perplexity, Gemini, Google AI Mode and Claude using the audit's query set. *Proof metric:* baseline dashboard exists.
- **Tidy robots/sitemap** (add sitemap 6) and **add `PodcastEpisode` + `VideoObject` schema**. *Proof metric:* validators clean; episode/video rich-result eligibility.

### Phase 2 — Resolve the entity and compound the corpus (weeks 3–12)
- **Create the Wikidata entity** for Roadman Cycling and Anthony Walsh; align `sameAs` across podcast platforms, YouTube, socials and the author page so engines resolve one entity. *Proof metric:* Wikidata live; Knowledge Panel begins triggering.
- **Surface the podcast corpus:** generate citable episode pages with transcripts and schema for the un-surfaced episodes, prioritising the highest-authority guests (Seiler, LeMond, Lorang, Friel, Bigham) and the highest-intent topics. *Proof metric:* episode pages 311 → 1,000. This is the single biggest defensible AEO asset — no competitor has 1,400 expert conversations.
- **Close the nutrition gap:** build the answer-first cluster around carbs-per-hour, fuelling and hydration, interlinked with the existing fuelling tool. *Proof metric:* Roadman enters the top set for the nutrition test queries.

### Phase 3 — Build the authority engine (months 3–12)
- **Off-site authority / digital PR:** the highest-leverage and hardest lever. Use the corpus as the engine — original data and research releases (e.g. masters-cycling findings, fuelling survey data, training-distribution analysis drawn from the guest conversations) are exactly what earns links and AI citations. Pair with podcast-guest link reciprocity (every World Tour guest is a potential referring domain) and expert-citation outreach. *Proof metric:* referring domains +25%; citations accruing in competitive lanes.
- **Earn Wikipedia-grade notability:** not by placing an article, but by accumulating the independent, authoritative coverage that makes one defensible — a by-product of the digital-PR engine. *Proof metric:* third-party references suitable for an entity record.

---

## 4. The structural plays (validated against the audit)

Four builds move Roadman from "good site" to "category-defining." Each is justified by a specific audit finding.

1. **The corpus citability layer.** *Justified by Finding 7* (only 311 of 1,400+ episodes are citable URLs). Making the full corpus machine-readable — transcripts, episode pages, `PodcastEpisode` schema — converts the brand's single biggest asset into citable surface area. This is the moat: original primary-source expert dialogue that competitors structurally cannot copy. **Highest strategic priority of the four.**
2. **The entity/knowledge-graph build.** *Justified by Finding 5* (no Wikipedia, weak Knowledge Panel, name ambiguity). The on-site half (`llms.txt`, author schema) is done; the off-site half (Wikidata, `sameAs`, earned references) is the unlock for AI-citation share.
3. **The off-site authority / digital-PR engine.** *Justified by Finding 6* (the binding constraint). Built on original research drawn from the corpus, not generic outreach. This is what actually delivers "biggest."
4. **The AI-citability layer.** *Already largely built* (`llms.txt`, full bot allowlist, answer pages, Speakable). Maintain and extend as new page types ship; do not rebuild. This is a genuine head start — most competitors haven't started here.

The honest sequencing: the AI-citability layer is done and ahead; the corpus and entity builds are the compounding work; the authority engine is the hard, decisive lever. Validate the off-site quantification (Phase 1 baseline) before committing the largest effort to it — but the directional evidence is already strong.

---

## 5. Ownership and cadence (founder capped under 5 hrs/week)

| Initiative | Owner | Founder involvement |
|---|---|---|
| `www` 301, host cleanup, schema, sitemap | Dev team | Sign-off only |
| Baseline pull + monthly KPI dashboard | Content/ops lead (Ted) | Review monthly |
| Wikidata + `sameAs` alignment | Content/ops lead (Ted) | None |
| Corpus episode-page generation (transcripts/schema) | Dev + AI agent pipeline | None (automatable) |
| Nutrition cluster build | Content/ops lead (Ted) | Approve angles |
| Digital-PR / original-research releases | Partnerships lead (Sarah) + Ted | Named quotes / data sign-off |
| Guest-reciprocity outreach | Partnerships lead (Sarah) | Warm intros only |

Cadence: weekly dev/ops standup against the KPI dashboard; one monthly review with the founder. The corpus pipeline and the AI-agent layer (Ted) carry the recurring load so nothing bottlenecks on the founder.

---

## 6. What to say no to

- **Don't contest the news/racing/gear lane** against Future plc and GCN. It's capital-intensive, low-intent for the funnel, and not winnable on current resources. Win the adjacent coaching/answer lane instead.
- **Don't add affiliate commerce** — ruled out, and it would dilute the premium positioning the funnel depends on.
- **Don't rebuild the AEO layer** — it's already ahead. Maintain, don't re-architect.
- **Don't chase content volume for its own sake.** The leak (`www`), the entity, and authority are what's capping the existing content — more articles on a split, under-authoritative domain compound slower than fixing the foundation first.
- **Don't let the founder become the bottleneck.** Any initiative that can't be delegated to the team or an agent gets re-scoped until it can.

---

*End of Deliverable 2.*
