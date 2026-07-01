# Nutrition Cluster — Gap Analysis & Build Plan

**Date:** 2026-06-09
**Source findings:** SEO/AEO audit (`docs/seo-aeo-audit-june-2026.md`), Findings 8–9
**Scope:** Research/planning only. No articles written here — this maps the gap and sequences the build.

---

## 1. Headline conclusion (read this first)

The audit frames nutrition as a *content gap*. It is not, primarily. Roadman already has **~40 nutrition-related blog posts** and a dedicated **In-Ride Fuelling Calculator** (`/tools/fuelling`), with coverage for every one of the three queries the audit named:

- "how many grams of carbs per hour cycling" → **two** posts already target this exact query
- cycling hydration → `cycling-hydration-guide`
- race-day fuelling → `cycling-nutrition-race-day-guide` **and** `race-day-fuelling-24-hour-timeline`

So absence from the SERP is **not** caused by missing pages. The real, actionable causes — in order of leverage — are:

1. **Keyword cannibalisation** on the headline query. Two near-identical posts compete for "carbs per hour cycling," splitting signal and link equity instead of concentrating it.
2. **Broken hub topology.** Of 16 core nutrition posts checked, **0 link to the `/topics/cycling-nutrition` hub in body text.** Google can't see the cluster as a cluster, so the hub can't accrue or distribute authority.
3. **Genuine whitespace** on a handful of high-intent, high-volume sub-topics (gut training, bonking, electrolytes/sweat rate, post-ride recovery nutrition) — competitors rank for these and we have nothing.
4. **Off-site authority** (audit Risk #3) — the binding constraint, but **out of scope for this doc.** No amount of on-page work overcomes a domain-authority deficit on its own; this plan makes the cluster *deserve* to rank so that authority-building (digital PR, the podcast corpus) has something to lift.

**The build is therefore 60% consolidation/interlinking, 40% net-new content.** Shipping 8 more thin articles into a cluster that can't internally signal itself would make the problem worse, not better.

---

## 2. Existing nutrition content inventory

### 2a. The hub and its mapped posts

**Hub:** `cycling-nutrition` — *"Cycling Nutrition — The Complete Evidence-Based Guide"* (`/topics/cycling-nutrition`)
Pillar: Nutrition. Targets: cycling nutrition, cycling diet, what to eat cycling, cycling fuelling, endurance nutrition, cycling weight loss.
Hub tool strip: **In-Ride Fuelling Calculator**, Energy Availability Calculator, Race Weight Calculator.

Posts currently mapped to the hub in `src/lib/topics.ts` (`TOPIC_POST_MAP`):

| Slug | Sub-cluster |
|---|---|
| `cycling-in-ride-nutrition-guide` | In-ride fuelling |
| `cycling-nutrition-race-day-guide` | Race-day |
| `cycling-energy-gels-guide` | In-ride fuelling |
| `cycling-hydration-guide` | Hydration |
| `cycling-fasted-riding-myth` | Fasted / weight |
| `cycling-body-composition-guide` | Body comp |
| `cycling-weight-loss-fuel-for-the-work-required` | Weight loss |
| `eating-like-pidcock-60-days` | Pro-emulation |
| `fasted-vs-fueled-cycling` | Fasted / weight |
| `cycling-body-recomposition` | Body comp |
| `cycling-protein-timing-guide` | Protein |
| `alan-murchison-michelin-star-chef-cycling-nutrition` | Expert interview |

### 2b. Nutrition posts that EXIST but are NOT mapped to the hub

These live in `content/blog/` and are nutrition-cluster by topic, but are absent from `TOPIC_POST_MAP["cycling-nutrition"]` — so the hub doesn't surface them and they don't get hub equity:

| Slug | Topic | Notes |
|---|---|---|
| `carbohydrate-per-hour-cyclists` | Carbs/hour | **Cannibalisation pair (see §4.1)** |
| `cycling-carbs-per-hour-fuel-like-a-pro` | Carbs/hour | **Cannibalisation pair** |
| `cycling-carb-loading-protocol-race-week` | Carb loading | |
| `race-day-fuelling-24-hour-timeline` | Race-day | |
| `cycling-nutrition-plan-100-mile-sportive` | Event fuelling | |
| `pre-ride-breakfast-cyclists-guide` | Pre-ride | |
| `nutrition-periodisation-base-build-race` | Periodised nutrition | |
| `fuel-for-the-work-required-fftwr-explained` | FFTWR concept | |
| `amateur-cyclist-fuelling-benchmarks-report-2026` | Data/benchmark | Citable asset |
| `cycling-protein-requirements` | Protein | |
| `bedtime-protein-cyclists-recovery-protocol` | Protein/recovery | |
| `cycling-caffeine-performance` | Caffeine | |
| `cycling-nutrition-world-tour-nutritionists` | Expert | |
| `what-experts-say-about-cycling-nutrition` | Expert roundup | |
| `david-dunne-world-tour-nutritionist-cycling-weight-loss` | Expert interview | |
| `hannah-grant-pro-team-chef-weight-loss` | Expert interview | |
| `tim-spector-gut-microbiome-cycling-weight-loss` | Gut/microbiome | |
| `best-roadman-episodes-nutrition` | Internal index | |
| `mtb-nutrition-trail-fuelling` | MTB fuelling | Cross-pillar |
| `triathlon-bike-nutrition-strategy` | Tri fuelling | Cross-pillar |
| `post-ride-recovery-window-cyclists-over-40` | Recovery nutrition | Over-40 niche only |

> **Finding:** ~20 nutrition posts exist that the hub does not claim. This is the single largest quick win — half a cluster is invisible to the hub's topical-authority signal.

### 2c. The fuelling tool's outbound links

`FuellingClient.tsx` has a "Learn More" block (post-calculation) linking to: `cycling-in-ride-nutrition-guide`, `cycling-energy-gels-guide`, `/topics/cycling-nutrition`, and one podcast episode. **11 of 16 core posts link *into* the tool; the tool links back to only 4 places, all gated behind running a calculation.**

---

## 3. Target-keyword → coverage map

| Target query (audit + adjacents) | Existing coverage | State |
|---|---|---|
| how many grams of carbs per hour cycling | `carbohydrate-per-hour-cyclists` **+** `cycling-carbs-per-hour-fuel-like-a-pro` | ⚠️ **Covered twice — cannibalised** |
| cycling hydration / how much to drink | `cycling-hydration-guide` | ✅ Covered (1 post) |
| race-day fuelling | `cycling-nutrition-race-day-guide`, `race-day-fuelling-24-hour-timeline` | ✅ Covered (2 — verify intent split) |
| in-ride / on-the-bike nutrition | `cycling-in-ride-nutrition-guide` | ✅ Covered |
| energy gels for cycling | `cycling-energy-gels-guide` | ✅ Covered |
| carb loading before a race | `cycling-carb-loading-protocol-race-week` | ✅ Covered |
| pre-ride breakfast | `pre-ride-breakfast-cyclists-guide` | ✅ Covered |
| fuel for the work required | `fuel-for-the-work-required-fftwr-explained` | ✅ Covered |
| protein for cyclists / timing | `cycling-protein-requirements`, `cycling-protein-timing-guide`, `bedtime-protein…` | ✅ Covered (3) |
| caffeine for performance | `cycling-caffeine-performance` | ✅ Covered |
| sportive / century fuelling | `cycling-nutrition-plan-100-mile-sportive` | ✅ Covered (1 distance) |
| **training the gut / carb absorption** | — | ❌ **Whitespace** |
| **bonking / hitting the wall** | — | ❌ **Whitespace** |
| **electrolytes / sweat rate / sodium** | inside `cycling-hydration-guide` only | ❌ **No standalone page** |
| **post-ride recovery nutrition (general)** | over-40 niche post only | ❌ **No general page** |
| **drink mix / DIY carb drink** | — | ❌ **Whitespace** |
| **winter / cold-weather fuelling** | — | ❌ **Whitespace (lower priority)** |
| **ketones / beetroot / nitrate** | creatine only | ❌ **Whitespace (lower priority)** |

---

## 4. The build plan

### 4.1 — Consolidate before creating (do this FIRST)

**A. Resolve the carbs-per-hour cannibalisation.** Pick `carbohydrate-per-hour-cyclists` *or* `cycling-carbs-per-hour-fuel-like-a-pro` as the canonical answer page for the headline query; merge the stronger material into it; 301 the loser to the winner (or `rel=canonical` if the loser serves a distinct long-tail). Two pages fighting for the exact query the audit flagged is actively suppressing both. **Highest single-action ROI.**

> Also note near-duplicate clusters elsewhere in the folder (`creatine-for-cyclists-*` ×3, `jay-vine-*` ×2, `benji-naesen-*` ×2, `cycling-protein-requirements` vs `cycling-protein-timing-guide` overlap). Audit these for the same cannibalisation pattern — likely draft variants that were never reconciled.

**B. Expand `TOPIC_POST_MAP["cycling-nutrition"]`** in `src/lib/topics.ts` to claim the ~20 unmapped nutrition posts in §2b. This is a one-file edit that doubles the hub's visible cluster and the bidirectional post↔hub signal (`getTopicsForPost` already wires the reverse link on each post).

### 4.2 — Net-new articles to close the whitespace (5–8)

Prioritised. "Volume" and "difficulty" are **estimates pending an Ahrefs/Semrush pull** (audit Risk #3 calls this out — numbers below are directional, not measured).

| # | Working title | Target query | Est. volume | Est. difficulty | Priority | Rationale |
|---|---|---|---|---|---|---|
| 1 | **Training Your Gut: How to Absorb More Carbs Per Hour** | "gut training cycling", "train the gut", "carb absorption" | High | Medium | **P0** | The natural sequel to the carbs-per-hour page — the question every reader asks next ("how do I actually tolerate 90–120g?"). Marginal-gains topic competitors own; we have World Tour nutritionist guests (Dunne, Murchison) as unique proof. Directly feeds the fuelling tool. |
| 2 | **Bonking: Why Cyclists Hit the Wall and How to Prevent It** | "bonking cycling", "hitting the wall cycling", "what is bonking" | High | Low–Med | **P0** | Classic high-volume, high-intent informational query with a clear answer-page shape. We have nothing. Low difficulty, strong AEO/featured-snippet potential. Routes to the fuelling tool as the prevention CTA. |
| 3 | **Electrolytes & Sweat Rate: How Much Sodium Cyclists Actually Need** | "electrolytes cycling", "sweat rate cycling", "how much sodium cycling" | Med–High | Medium | **P1** | Currently buried inside the hydration guide. Standalone page lets the hydration post link down and the fuelling tool (which outputs sodium) link across. Sodium is a tool output with no supporting article. |
| 4 | **What to Eat After a Ride: The Recovery Nutrition Guide** | "post ride nutrition", "what to eat after cycling", "recovery nutrition cycling" | High | Medium | **P1** | Only an over-40 niche post exists. The general query is high-volume and completes the timing arc (pre → in-ride → post). Links protein cluster ↔ fuelling cluster. |
| 5 | **The DIY Cycling Drink Mix: Build Your Own Carb + Electrolyte Bottle** | "diy energy drink cycling", "homemade carb drink", "cycling drink mix recipe" | Med | Low | **P2** | Practical, link-worthy, low-difficulty. Pairs with #3 and the fuelling tool's fluid/sodium outputs. Strong shareability for off-site links (helps Risk #3). |
| 6 | **Fuelling a Century / 100-Mile Ride** *(or expand existing sportive post)* | "century ride nutrition", "100 mile bike ride fuelling", "long ride nutrition" | Med–High | Medium | **P2** | A `cycling-nutrition-plan-100-mile-sportive` post exists — decide expand-vs-new. The distance/event fuelling intent is underserved beyond one event framing. |
| 7 | **Caffeine for Cycling: Dose, Timing, and What the Science Says** *(audit existing)* | "caffeine cycling performance", "caffeine before cycling" | Med | Low–Med | **P3** | `cycling-caffeine-performance` exists — verify it's optimised and mapped rather than rebuilding. Listed for completeness of the cluster. |
| 8 | **Cold-Weather & Winter Fuelling for Cyclists** | "winter cycling nutrition", "cold weather fuelling" | Low–Med | Low | **P3** | Seasonal whitespace; lower volume. Pairs with the existing heat-training content for an environment sub-cluster. Defer unless capacity. |

**Recommended first wave:** #1, #2, #3, #4 (the four P0/P1s). These are the highest-volume genuine gaps and each has a clean interlink home (see §5). Hold #5–#8 for a second wave.

---

## 5. Recommended interlink structure

The cluster should form a **hub-and-spoke with the tool as a shared hub-of-action**, not the current flat web where posts link to the tool but nothing links to the hub.

```
                         /topics/cycling-nutrition  (PILLAR HUB)
                          ▲   ▲   ▲            │
        body-text hub link │   │   │            │ hub lists all spokes
        from EVERY spoke ──┘   │   └──────────┐ │ (expand TOPIC_POST_MAP)
                               │              │ ▼
   ┌───────────────┐   ┌───────┴───────┐   ┌──┴────────────┐
   │ Carbs/hour    │   │ Hydration +   │   │ Race-day +    │
   │ (canonical) ──┼──▶│ electrolytes  │──▶│ carb-loading  │
   │ + gut-training│   │ + sweat rate  │   │ + timeline    │
   └──────┬────────┘   └──────┬────────┘   └──────┬────────┘
          │                   │                   │
          └─────────┬─────────┴─────────┬─────────┘
                    ▼                    ▼
          ┌──────────────────────────────────────┐
          │   /tools/fuelling  (CONVERSION HUB)   │
          │   carbs + fluid + sodium per hour     │
          │   ◀── every spoke links IN (done)     │
          │   ──▶ links OUT to 4 posts + hub      │
          │       (un-gate + expand — see below)  │
          └──────────────────────────────────────┘
```

**Rules to enforce:**

1. **Every nutrition spoke links to the hub in body text** (not just frontmatter). Currently 0/16 do. This is the missing signal that prevents Google reading the cluster as a cluster. Highest-leverage interlink fix.
2. **Every fuelling/carbs/hydration/race-day spoke links to the tool** with contextual anchor text ("calculate your carb, fluid and sodium targets"). 11/16 already do — fill the 5 gaps (`cycling-carb-loading-protocol`, `fuel-for-the-work-required`, `pre-ride-breakfast`, `cycling-protein-timing-guide`, `bedtime-protein`).
3. **The tool links back out** to more than 4 posts, and surfaces a hub link **before** calculation (currently gated behind running the calc). Add a persistent "related reading" rail including the new gut-training and electrolytes posts.
4. **Sub-cluster reciprocal links.** Connect the currently-isolated sub-clusters:
   - Protein cluster ↔ recovery-nutrition (#4) ↔ carbs cluster (no current cross-links).
   - Hydration ↔ electrolytes (#3) ↔ gels.
   - Pre-ride breakfast ↔ carbs-per-hour ↔ gut-training (#1).
5. **New posts inherit the pattern at creation:** body-text hub link + tool link + 2–3 sibling-spoke links + frontmatter `relatedTools: [fuelling]` and hub mapping in `TOPIC_POST_MAP`.

---

## 6. Sequenced execution (suggested)

| Phase | Action | Effort | Why first |
|---|---|---|---|
| **0** | Resolve carbs-per-hour cannibalisation (§4.1A); audit other near-dupes | Low | Stops two pages suppressing each other on the headline query |
| **0** | Expand `TOPIC_POST_MAP["cycling-nutrition"]` to claim ~20 orphan posts (§4.1B) | Low (1 file) | Doubles hub cluster, one edit |
| **1** | Body-text hub links into all nutrition spokes; fill 5 tool-link gaps (§5.1–2) | Med | Builds the cluster signal so new content lands on solid topology |
| **2** | Write first wave: gut-training, bonking, electrolytes, recovery nutrition (#1–4) | High | Highest-volume genuine whitespace |
| **3** | Un-gate + expand the tool's outbound "related reading" rail (§5.3) | Low–Med | Closes the tool↔article loop both directions |
| **4** | Second wave (#5–8) + sub-cluster reciprocal links | Med | Depth once the spine is solid |
| **(parallel)** | Pull Ahrefs/Semrush to replace estimated volume/difficulty; begin off-site authority work (audit Risk #3) | — | The binding constraint; on-page work alone won't rank without it |

---

## 7. What this doc deliberately does NOT solve

- **Off-site authority / digital PR** (audit Risk #3) — the actual binding constraint on ranking. This plan makes the cluster *worthy* of ranking; it does not build the links/citations that authority requires. Flag for a separate workstream.
- **Surfacing the podcast corpus** (audit Finding 7) — the nutrition expert interviews (Dunne, Murchison, Grant, Spector) are the unique, un-replicable citable asset. Worth its own plan; referenced here only as proof-point fuel for the new articles.
- **Actual article drafts** — out of scope by request. Titles and angles only.
