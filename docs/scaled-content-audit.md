# Scaled-Content Quality Audit — Programmatic Pages

**Date:** 2026-06-09
**Scope:** `/answers`, `/glossary`, `/compare`, `/question`, `/problem`
**Trigger:** Audit flagged scaled-content-abuse risk on the programmatic page corpus.
**Verdict:** **Not scaled-content abuse — but two fixable risks.** The corpus is genuinely grounded (zero fabricated citations, all internal links resolve, real editorial voice). Risk is concentrated in (1) the thin `/problem` category and (2) answer↔question query cannibalisation. Both are fixable without mass de-indexing.

---

## 1. Corpus inventory (actual counts)

| Category | Pages | Source file(s) | Format |
|---|---|---|---|
| Answers | **249** | `src/lib/answers-data/*.ts` (12 cluster files) | Deep answer pages |
| Glossary | **133** | `src/lib/glossary.ts` | Definition + extended definition |
| Compare | **42** | `src/lib/comparisons.ts` | Comparison tables + verdict |
| Questions | **36** | `src/lib/questions.ts` | Q&A answer pages |
| Problem | **27** | `src/lib/problems.ts` | Diagnostic / funnel pages |
| **Total** | **487** | | |

> Counts differ slightly from the original audit's figures (260/134/43/37/27). The numbers above are the live counts as of this audit. The order-of-magnitude concern stands: ~490 programmatic pages is scaled publishing and warrants the quality gate.

---

## 2. The single most important finding: citations are real

The decisive question in a scaled-content review is whether pages provide genuine value or are keyword-swapped templates with invented authority. We verified every machine-checkable citation in the corpus:

| Citation type | Unique refs | Resolve to real content | Broken |
|---|---|---|---|
| Answer → podcast episode (`episodeSlug`) | 94 | 94 | **0** |
| Answer → guest page (`guestSlug`) | 57 | 57 | **0** |
| Answer → blog article (`/blog/…`) | 139 | 139 | **0** |
| Question → blog article | 50 | 50 | **0** |
| Problem → blog article | 35 | 35 | **0** |

**Not a single fabricated episode, guest, or article reference across the corpus.** The expert evidence on answer and question pages attributes positions to real podcast guests (Stephen Barrett, Joe Friel, Dan Lorang, Stephen Seiler, John Wakefield, Derek Teel, Andy Galpin, etc.) with resolvable episode and guest slugs. This is the strongest possible signal that the corpus is editorially backed, not algorithmically spun.

**One integrity gap:** 27 of the glossary `relatedTerms` cross-links point to terms that are referenced but not yet defined (e.g. `altitude-training`, `glycolysis`, `heat-acclimation`, `cardiac-output`, `peripheral-fatigue`). These are dead internal anchors — a UX/internal-linking gap, not a penalty risk. See §6.

---

## 3. Sample review — 10 pages per category

Each sample was read in full and scored against the gate: (a) genuine information gain, (b) more than a keyword-swapped template, (c) cites specific Roadman content, (d) would a human editor approve it. Scale: 8–10 strong / editor-approved, 5–7 acceptable, 1–4 thin.

### ANSWERS — sample avg **8.2/10** — STRONG
| slug | score | thin? | rationale |
|---|---|---|---|
| what-is-a-good-ftp | 9 | no | W/kg benchmarks by level; two named guests w/ credentials + episodeSlugs. |
| ftp-vs-watts-per-kg | 8 | no | Real decision-point framing; Lorang + Friel evidence; authored, not templated. |
| what-is-zone-2-training | 9 | no | Seiler polarised research; three named coaches; names episode + guest in roadmanView. |
| how-much-protein-do-cyclists-need | 9 | no | Ormsbee + Impey cited; novel nighttime-protein angle; strong practical tables. |
| best-gym-exercises-for-cyclists | 9 | no | Derek Teel + Andy Galpin; rep ranges & form cues show editorial depth. |
| what-is-a-recovery-week | 8 | no | Lorang + Friel; clear periodisation principle; common-mistakes section. |
| fear-of-descending-cycling | 7 | **yes** | Solid practical content but expert evidence is generically attributed (episode slugs, no named guest). |
| how-to-train-for-a-sportive | 8 | no | Friel + Lorang; concrete 12-week structure; honest evidence level. |
| what-is-reverse-periodisation | 8 | no | Lorang + Seiler; nuanced "when it works" caveats; defensible stance. |
| how-to-climb-faster-cycling | 8 | no | Jack Burke + Andrew Feather named; unique pacing emphasis. |
| what-is-heat-training-cycling | 7 | **yes** | Credible science but expert attribution is soft (episodes, no named guest). |

**Assessment:** 8/10 sampled score 8–9 and are editor-approvable. Typical entry runs 550–900 words with directAnswer, 3-paragraph roadmanView, 2+ attributed experts, practical-application and common-mistakes blocks, and a 3+ item FAQ. No keyword-swap templates found. Two pages (`fear-of-descending-cycling`, `what-is-heat-training-cycling`) cite episodes without naming the guest — a soft spot, easily tightened.

### COMPARE — sample avg **8.2/10** — STRONG
| slug | score | thin? | rationale |
|---|---|---|---|
| coach-vs-app | 8 | no | Decision framework; clear verdictWinner logic; related article + tool. |
| polarised-vs-pyramidal | 9 | no | 6-para body citing Seiler + Wakefield; decision tree; FAQs. |
| strength-vs-more-miles | 8 | no | Cites Rønnestad by name; training-protocol specifics; age thresholds. |
| trainerroad-vs-trainingpeaks | 7 | no | Solid feature matrix but no prose body — feature-table only. |
| zwift-plan-vs-coach | 8 | no | 8-para body unpacking Zwift's limits; cost reality; FAQs. |
| trainingpeaks-vs-vekta | 9 | no | Market context (Today's Plan shutdown); cites podcast guests; clear verdict. |
| base-vs-build-training | 8 | no | Readiness-signal matrix (decoupling <5%); linked tools. |
| cycling-coach-vs-fascat | 8 | no | Cites Frank Overton methodology + Seiler; bootstrap-first logic. |
| join-cycling-vs-coaching | 8 | no | Honest AI-limits critique; clear upgrade threshold. |
| sweet-spot-vs-zone-2 | 9 | no | Strong body citing Seiler; names Wakefield + Kerrison; FAQs. |

**Assessment:** Renders well beyond the comparison table — a `SourceMethodology` block auto-pulls pillar-matched episodes/articles, an `AskRoadmanCTA`, and most entries carry 4–8 paragraphs of attributed prose. Low risk. Weakest pattern is feature-table-only entries (e.g. `trainerroad-vs-trainingpeaks`) that lack a prose body.

### GLOSSARY — sample avg **7.7/10** — ACCEPTABLE (thin-by-nature, but grounded)
| slug | score | thin? | rationale |
|---|---|---|---|
| ftp | 8 | no | Definition + lab-testing detail (Coggan) + W/kg context; article/tool/hub links. |
| vo2max | 7 | no | Range context + Seiler 80/20; could add interval protocols. |
| red-s | 8 | no | Clinical threshold + warning signs + Energy-Availability tool. |
| normalised-power | 7 | no | Coggan attribution + method + use case; technical but sound. |
| durability | 8 | no | Novel 2020s metric; elite vs amateur context; interval protocol. |
| carbohydrate-periodisation | 7 | **yes** | Lorang + Burke mentioned; thin on implementation ratios/timing. |
| training-peaks-ctl | 6 | **yes** | Platform-specific; useful only to power-meter users; self-limited. |
| hrv | 9 | no | Tools named (Whoop/Garmin/Oura); Olav Bu podcast ref; actionable. |
| adaptation | 9 | no | Roadman philosophy hub + recovery-first framing; reads like a micro-essay. |
| mobility-cycling | 8 | no | Specific drills + daily time budget + Roadman voice. |

**Assessment:** Each entry carries ~150–200 words of *unique* prose (definition + extendedDefinition), most naming a specific expert (Coggan, Seiler, Lorang, Olav Bu) and linking 2–3 internal resources. Short by the nature of a glossary, but well above dictionary-stub spam. This is the lowest-content category and therefore the most exposed in a strict review, but the per-page editorial investment is real. Two entries are soft (`carbohydrate-periodisation`, `training-peaks-ctl`).

### QUESTIONS — sample avg **7.5/10** — STRONG individually, but DUPLICATES answers
| slug | score | thin? | rationale |
|---|---|---|---|
| what-is-good-ftp-for-amateur | 8 | no | Coggan/Friel/Wakefield/Lorang; **overlaps /answers/what-is-a-good-ftp**. |
| how-often-test-ftp | 7 | no | Friel/Coggan; **same slug exists in /answers**. |
| what-ftp-for-sportive | 7 | no | Event-specific W/kg; basic "FTP for event X" template structure. |
| recovery-for-cyclists-over-50 | 9 | no | Masters-specific protocol; named coaches; resource links. |
| carbs-per-hour-cycling | 8 | no | Jeukendrup science; World Tour framing via Dunne; calculator link. |
| what-to-eat-before-long-ride | 6 | no | Largely textbook pre-ride nutrition; moderate template feel. |
| how-much-cycling-coaching-costs | 7 | no | Honest pricing tiers; partly marketing-oriented. |
| what-does-cycling-coach-do | 7 | no | Generic outline of coaching scope; mid-altitude. |
| how-to-pace-mallorca-312 | 8 | no | Event-specific pacing by km; World Tour sourcing. |
| should-cyclists-train-fasted | 8 | no | Rigorous evidence (Van Proeyen/Burke); gender-specific caution. |

**Assessment:** Strong on their own — named guests, internal links, all blog refs resolve. **The problem is structural overlap with `/answers`:** both categories are Q&A answer pages on the same topic clusters (ftp, nutrition, recovery…), and several target the same query. See §4.

### PROBLEM — sample avg **4.7/10** — WEAKEST CATEGORY ⚠️
| slug | score | thin? | rationale |
|---|---|---|---|
| not-getting-faster | 5 | **yes** | Generic training blockers; links to blog/tools, no named episode/coach. |
| coming-back-after-break | 4 | **yes** | Detraining percentages with no cited source. |
| losing-power-after-40 | 6 | **yes** | Specific stats (8%/decade) but unattributed; generic masters advice. |
| slow-climbing | 5 | **yes** | W/kg solid but generic; no Roadman voice. |
| hr-too-high | 5 | **yes** | Reasonable causes but no research/episode citation. |
| cant-lose-weight-cycling | 4 | **yes** | RED-S pattern real but unsourced. |
| group-ride-dropped | 5 | **yes** | Pure problem/cause/solution template. |
| injury-return | 4 | **yes** | Detraining figures unattributed; links out, no owned IP. |
| saddle-pain | 4 | **yes** | Practical but zero Roadman testing/episode/rider stories. |
| blowing-up-on-climbs | 5 | **yes** | Useful pacing framework but no named coach/episode. |

**Assessment:** **All 10 sampled pages flagged thin.** `problems.ts` contains **zero** `episodeSlug`, `guestSlug`, or `expertEvidence` fields — confirmed by grep across the whole file. Each page is structured data (problem → causes[] → solutions[] with internal links). The template adds a generic `SourceMethodology` boilerplate line ("draws on [pillar] content from the Roadman Cycling Podcast") but no named-episode proof or expert voice. These read as keyword-funnel diagnostic stubs. **This category is the primary scaled-content exposure.**

---

## 4. Duplicate candidates

### A. Answer ↔ Question — same format, same query (HIGH priority)
Both categories are Q&A answer pages. These pairs target effectively the same query on two URLs — classic cannibalisation:

| # | /answers slug | /question slug | Title overlap |
|---|---|---|---|
| 1 | `train-by-ftp-or-heart-rate` | `ftp-vs-heart-rate-training` | **Identical** — "Should I Train by FTP or Heart Rate?" |
| 2 | `how-often-test-ftp` | `how-often-test-ftp` | **Same slug**; "How Often Should I Test (My) FTP?" |
| 3 | `how-much-protein-do-cyclists-need` | `how-much-protein-cyclists-need` | **Identical** — "How Much Protein Do Cyclists Need?" |
| 4 | `what-is-a-good-ftp` | `what-is-good-ftp-for-amateur` | Same intent — "good FTP for a cyclist/amateur" |
| 5 | `lose-weight-without-losing-power` | `lose-weight-without-losing-power-cycling` | Same intent — lose weight without losing power |
| 6 | `what-is-durability-cycling` | `cycling-durability-training` | Same intent — what is durability / how to train it |

### B. Intra-`/problem` — FTP-plateau cluster (MEDIUM priority)
Four `/problem` pages cover the same underlying complaint (FTP not improving / not getting faster):
- `not-getting-faster` — "Why Am I Not Getting Faster at Cycling?"
- `stuck-on-plateau` — "Cycling FTP Plateau — How to Break Through"
- `flat-ftp` — "My FTP Hasn't Moved in 6 Months — What's Wrong?"
- `ftp-stuck-250-watts` — "FTP Stuck at 250 Watts? What You're Probably Doing Wrong"

(`losing-power-after-40` partially overlaps too.) These can be differentiated by genuinely distinct angle (beginner plateau vs masters plateau vs specific-wattage long-tail) or consolidated.

### C. Answer ↔ Glossary — title overlap, but intent-distinct (LOW priority)
~9 pairs where a deep answer page shares a title stem with a glossary term — e.g. `answers/what-is-sweet-spot-training` ↔ `glossary/sweet-spot`; `answers/what-is-block-periodisation` ↔ `glossary/block-periodisation`; `answers/what-is-base-training` ↔ `glossary/base-training`; `answers/should-cyclists-take-creatine` ↔ `glossary/creatine-for-cyclists`. These serve different intents (quick definition vs full answer) and are defensible **provided** they cross-link and a clear canonical hierarchy exists (glossary stub → answer page). Worth a spot-check, not urgent.

---

## 5. Flagged thin pages / noindex candidates *(pending approval — nothing has been changed)*

Per instruction, these are **identified, not actioned**. No page has been noindexed, deleted, or edited.

**Tier 1 — strengthen or noindex (highest exposure):**
- **All 27 `/problem` pages** — no expert/episode grounding. Either add verified expert evidence (see §6) or noindex the weakest and keep them as in-funnel diagnostics only.

**Tier 2 — consolidate (duplication):**
- The 6 `/question` pages in §4.A — fold into their `/answers` twin (301 or `rel=canonical` to the stronger page), or sharpen the intent split.
- 3 of the 4 FTP-plateau `/problem` pages in §4.B — consolidate or differentiate.

**Tier 3 — tighten attribution (quick wins, keep indexed):**
- `/answers/fear-of-descending-cycling`, `/answers/what-is-heat-training-cycling` — name the guest behind the episode citations.
- `/glossary/carbohydrate-periodisation`, `/glossary/training-peaks-ctl` — add implementation detail / a named expert.

---

## 6. Recommendations

1. **Strengthen `/problem` pages (do not bulk-noindex).** Add an `expertEvidence` field to `problems.ts` (named guest + resolving `episodeSlug`) and render it in `problem/[slug]/page.tsx`, mirroring the answer-page pattern. This is the highest-leverage fix and turns the weakest category into genuinely grounded pages. **It requires a schema + template change and per-page transcript verification to avoid fabricated quotes — so it should be a scoped, approved task, not a blind bulk edit.** Verified guest/topic anchors already exist in the corpus to draw from (e.g. plateau/FTP → Stephen Barrett ep-38, Joe Friel ep-40; masters → Andy Galpin; recovery → Dan Lorang). A worked mapping can be produced on request.
2. **Resolve the 6 answer↔question duplicates.** For each pair, choose the canonical page (usually the richer `/answers` entry), then 301-redirect or `rel=canonical` the weaker URL. This removes the clearest cannibalisation signal.
3. **Consolidate the FTP-plateau `/problem` cluster** to 1–2 pages with distinct angles, redirecting the rest.
4. **Fix the 27 broken glossary `relatedTerms`.** Either write the 27 missing terms (they're legitimate cycling concepts — `glycolysis`, `altitude-training`, `heat-acclimation`, etc., which would also deepen the glossary) or strip the dead anchors. Writing them is the better SEO outcome.
5. **Tighten the 4 Tier-3 soft pages** (§5) — fast, keeps them indexed.
6. **Hold the line on net-new programmatic pages** until the above is cleared. The corpus is high quality where it's grounded; the risk is additive volume outpacing the per-page editorial bar.

### Bottom line
This is **not** scaled-content abuse. Every machine-checkable citation resolves to real Roadman content, the answer/compare/question/glossary pages carry genuine named-expert evidence and editorial voice, and there are no keyword-swap templates in those four categories. The real, fixable risks are: the **27 thin `/problem` pages** (strengthen or trim) and **answer↔question query overlap** (consolidate ~6 pairs). Addressing those two clears the scaled-content concern without touching the ~430 pages that already pass the gate.

---

*Methodology: full inventory via source-file parsing; 10 full-page samples per category scored against the 4-point gate by independent review; citation integrity checked by resolving every `episodeSlug`/`guestSlug`/`/blog` reference against the actual content tree; duplicate detection via normalised-title Jaccard similarity across all 487 pages. No content files were modified.*
