# Sitewide Content Quality Audit

**Date:** 2026-06-10 (run 2)
**Scope:** All 374 articles in `content/blog/` (plus cross-checks into `content/podcast/` and `src/` where an audit item required it).
**Method:** Exhaustive grep sweeps per rule; route-resolution checks against the live Next.js route tree; and — for `/guests/` links — the app's *actual* slug generator (`getAllGuestSlugs` from `src/lib/guests.ts`) executed via `tsx`, not a re-implementation. Unambiguous violations were fixed in place; items where the literal instruction conflicts with the site's deliberate design are flagged for an owner decision rather than changed destructively.

> **Concurrency note:** a second agent session (`51b3c5ba`) was running the same audit against this working tree during this run. Some fixes below were applied by that session moments before this one reached them; the on-disk end state is the union and was re-verified independently (0 broken guest links, 0 metaphorical `leverage`, 0 prose episode numbers). The commit is path-scoped to the audited content files.

---

## Summary

| # | Check | Result | Action |
|---|-------|--------|--------|
| 1 | Slop scan | 28 metaphorical `leverage` (business-speak) | **Fixed in place** |
| 2 | CTA audit | No broken targets; rule conflicts with the deliberate coaching funnel | **Flagged — not mass-rewritten** |
| 3 | Pricing | USD correct; NDY = $195/mo ✓; no GBP; EUR only on real European camp prices | **Flagged EUR — not auto-converted** |
| 4 | Expert attribution | Lorang: **5 frontmatter `role:` fields wrongly stated "coached Pogačar/Vingegaard"**. Vekta: absent from all blog content ✓ | **Fixed 5 role fields** (Vekta note below) |
| 5 | Heavy compounds | Rule premise conflicts with the site's expert-backed position | **Flagged — not rewritten** |
| 6 | Episode numbering in prose | 6 violations across 4 files | **Fixed in place** |
| 7 | Broken internal links | `/blog`, `/podcast`, `/coaching/*` clean; **15 broken `/guests/` refs found** | **Fixed: 2 repointed, 13 de-linked/repointed** |

---

## 1. Slop scan — FIXED

Terms swept: `unlock`, `dive into`, `game-changer`, `journey`, `landscape`, `leverage`, `tapestry`, `delve`, `harness`, `navigate`, `elevate`, "it's important to note", "in today's world".

**Clean (zero occurrences):** `unlock`, `dive into`, `game-changer`, `journey` (as slop), `landscape`, `tapestry`, `delve`, `harness`, "it's important to note", "in today's world".

**`elevate` / `navigate` — all legitimate, kept.** Every hit is literal physiology ("elevate HR / blood glucose / overnight MPS / resting heart rate") or physical movement ("navigate tight trees" — MTB handling). Not slop.

**`leverage` — 28 metaphorical hits FIXED.** Physical-engineering uses were preserved (handlebar / crank / lever leverage in `mtb-bike-fit-basics`, `bike-fit-guide-cyclists`). The metaphorical "highest-leverage X" tic was replaced with varied concrete alternatives — "most effective", "best-value", "most decisive", "best-return", "most valuable", "more important", "pays off most".

*Policy note:* the documented brand policy (`memory/feedback_slop_terms.md`) and the prior audit pass treated `leverage` as banned **only as a verb**, leaving noun-form "highest-leverage" as domain language. This task's instruction lists `leverage` flatly, so these adjectival uses were tightened to concrete phrasing — an improvement under either reading. Post-fix sweep: **zero metaphorical `leverage`** remains.

Files touched (28 edits): strength-training-cyclists-complete-guide, rpe-and-power-using-them-together, mtb-tyre-pressure-guide, how-to-structure-cycling-training-plan, power-meter-training-cyclists-how-to-use, ftp-training-for-triathletes, post-ride-recovery-window-cyclists-over-40, cycling-training-six-hours-roglic-coach, cory-williams-sprint-power-vs-winning-power, breathing-for-cyclists-respiratory-training-guide, why-pros-train-so-easy-mixed-metabolism-zone, dan-lorang-amateur-training-plan, triathlon-ftp-pacing-strategy, cycling-cadence-by-age-masters, alan-murchison-michelin-star-chef-cycling-nutrition, climb-faster-cycling-five-fixable-reasons (×2), alex-wild-sea-otter-2025-power-data-tactics, steady-state-vs-interval-training-cycling, five-mistakes-self-coached-cyclists-make (×2), masters-recovery-audit-seven-things-to-check, ryan-collins-six-hour-record-46kmh, gym-vs-bike-strength-training-cyclists-research, aero-vs-weight-cyclist, how-we-record-the-roadman-podcast, cycling-coach-vs-triathlon-coach (×2).

---

## 2. CTA audit — FLAGGED (not mass-rewritten)

**Rule:** every CTA must point to `https://www.skool.com/roadmancycling`, not `/ask`, `/coaching`, `/apply`, `/community`.

**Sweep:** `](/coaching)` 346, plus ~100 `/coaching/<segment>`; `](/ask)` 204; `](/apply)` 141; `](/community…)` 13. Skool CTA present in only **89 / 374** articles.

**Why not bulk-converted:** every one of these targets is a **live, resolving route** — `/ask`, `/apply`, `/coaching`, `/coaching/[location]`, the static coaching segment pages, `/community`, `/community/clubhouse` all exist. They are the site's deliberate **coaching funnel** (`/coaching` → `/apply` intake; `/ask` = the answer engine), a distinct primary monetisation path from the Skool community. The prior audit reached the same conclusion (it converted only the handful of `/community` *NDY-community* CTAs, leaving `/coaching`/`/apply`/`/ask` intact). Rewriting ~690 funnel links to the Skool URL would gut that funnel.

**Recommendation:** if the intent is specifically that each article's *closing CTA block* should drive to Skool while keeping inline funnel links, that is a bounded, sensible change — but it needs confirmation, since the current design intentionally routes most articles to the coaching funnel. No silent rewrite performed.

---

## 3. Pricing — USD correct; EUR flagged

- **NDY = $195/month** — correct everywhere (`cycling-coaching-results-before-and-after`, `strength-training-cyclists-complete-guide`, `low-cadence-training-world-tour-coaches`, `sweet-spot-vs-threshold-vs-polarised-comparison`, `winter-cycling-training-indoor-protocol-pros`). ✓
- **GBP (£):** zero occurrences anywhere in `content/blog/`. ✓
- Other USD product/illustrative prices ($15 creatine, $65 strength course, $19.99 Rouvy/Zwift, $200–250 lactate kit, $280–800 power meters) are internally consistent. ✓

**EUR (€) — flagged, NOT auto-converted.** EUR appears in four files: `girona-training-camps-2026`, `what-to-expect-cycling-training-camp`, `why-girona-best-place-train-cycling` quote the **actual Roadman Girona camp prices (€995 / €1,700)** and real European costs (hotels, bike hire, meals); `bike-fit-guide-cyclists` uses generic € fit/wheelset figures (and already dual-lists "(or $150–$350)" in two places). Converting €995 → a dollar figure would **misstate a real transacted price**, so these were left as-is.
**Recommendation:** owner decides whether camp pages display USD (with a real FX conversion) or keep EUR as the transacted currency — needs a real conversion + sign-off, not a symbol swap.

**Observation (not a task item):** "$195/month" is labelled inconsistently — `cycling-coaching-results-before-and-after` calls the **$195 NDY programme "1:1"**, while `strength-training-cyclists-complete-guide` calls **$195 the NDY *community*** and positions 1:1 as the Roadman Method ($297–397/mo). Worth reconciling.

---

## 4. Expert attribution — 5 role fields FIXED

**Dan Lorang:** article *bodies* are clean (every prose reference correctly ties him to Jan Frodeno / Anne Haug, Lucy Charles-Barclay, Primož Roglič's programme, and Red Bull–Bora–Hansgrohe). **However, a same-line "Lorang"+"Pogačar" sweep misses the frontmatter `experts:` blocks**, where the `name:` and `role:` sit on separate lines. A `name: Dan Lorang` + next-line `role:` check surfaced **5 `role:` fields wrongly crediting him with Pogačar/Vingegaard** — all fixed to his real athletes (Frodeno, Roglič):

| File | Was | Now |
|------|-----|-----|
| `jay-vine-less-training-made-me-faster.mdx` | "Coach to Pogačar and Vingegaard at various points" | "Head of Performance at Red Bull–Bora–Hansgrohe; coached Frodeno and Roglič" |
| `zone-2-cycling-heart-rate-vs-power-vs-rpe.mdx` | "coached Pogačar and Vingegaard" | "coached Frodeno and Roglič" |
| `five-mistakes-self-coached-cyclists-make.mdx` | "Coached Vingegaard, Roglic" | "Coached Frodeno, Roglič" |
| `polarised-training-cycling-world-tour-prescription.mdx` | "Coached Vingegaard, Pogacar early-career" | "Coached Frodeno and Roglič" |
| `cycling-training-plan-masters-over-40.mdx` | "coached Pogačar and Vingegaard" | "coached Frodeno and Roglič" |

`climb-faster-cycling-five-fixable-reasons.mdx` has `role: Amateur cyclist who beat Pogacar` — that's **Andrew Feather** (factually correct), not Lorang. Left unchanged.

**TrainingPeaks / Vekta:** **"Vekta" appears in zero `content/blog/` files.** ✓ TrainingPeaks references are correct.

**Vekta note (out of blog scope, no action):** "Vekta" exists only in two intentional, non-blog places — `content/podcast/ep-2049-…vekta….mdx` (a dedicated episode *about* the Vekta platform, its subject) and `src/lib/comparisons.ts` (a `TrainingPeaks vs Vekta` page whose verdict **steers readers to TrainingPeaks**). These treat Vekta as a competitor/subject, not a substitution of the partner. Not deleted (removing them would destroy intentional content and the comparison page favours the partner). Flagged for awareness only.

---

## 5. Heavy compound check — FLAGGED (premise conflicts with site)

**Rule:** deadlifts / squats / barbell rows must only appear in "avoid these" framing.

**Finding:** 266 occurrences across 44 files — and the site's entire evidence-based strength position **prescribes** these lifts as beneficial, especially for masters: `cycling-deadlift-guide` is a full how-to *teaching* the deadlift; `new-study-confirms-heavy-strength-training-beats-more-miles-after-40`, `gym-vs-bike-strength-training-cyclists-research`, `joe-friel-fast-after-50-cycling-method`, `derek-teel-best-exercises-cyclists`, and `strength-training-cyclists-over-40-what-works` all advocate heavy compound lifting, citing Joe Friel, Derek Teel, Andy Galpin and a meta-analysis. (The prior pass already reframed the one genuinely problematic reader-facing prescription and did **not** blanket-rewrite the rest.)

Rewriting 266 prescriptions into "avoid" framing would reverse a correct, expert-supported stance and contradict the brand's own coaches. **No changes made.** If there is a specific safety concern (e.g. unqualified prescriptions to true beginners), scope it precisely rather than as a blanket "avoid" rule. Flagged for owner.

---

## 6. Episode numbering in prose — FIXED

6 violations across 4 files, all removed:

| File | Was | Now |
|------|-----|-----|
| unbound-gravel-200-training-guide | …Badlands 800km strategy **(episode 30)** walks… | …strategy walks… |
| haute-route-alps-training-guide | …Badlands 800km strategy **(episode 30)** walks… | …strategy walks… |
| raid-pyreneen-training-guide | …**(episode 30 on the Roadman Cycling Podcast)**… | …on the Roadman Cycling Podcast… |
| polarised-training-cycling-complete-guide (×2) | Stephen Seiler, Roadman Podcast **(ep. 2148)** | Stephen Seiler, Roadman Podcast |
| polarised-training-cycling-complete-guide | Stephen Seiler, Roadman Podcast **(ep. 2095)** | Stephen Seiler, Roadman Podcast |

Frontmatter `relatedEpisodes` / citation *slugs* (`ep-2056-…`) are structural identifiers, not prose — left intact.

---

## 7. Broken internal links — 15 broken `/guests/` refs found and FIXED

Verified every internal-link class against the live route tree / data registries:

- **`/blog/<slug>`** — every target maps to a real `content/blog/*.mdx`. **0 broken.**
- **`/podcast/<slug>`** — every target maps to a real `content/podcast/*.mdx`. **0 broken.**
- **`/coaching/<segment>`** — all resolve (static dirs `busy-professionals`, `event-prep`, `masters`, `over-50`, `post-injury`, `time-crunched`, `triathletes`, `weight-loss`; `[location]` route for `ireland`, `uk`, `usa`, `dublin`, `london`). ✓
- **`/experts/matt-bottrill`** — resolves. ✓

**`/guests/<slug>` — 15 broken found.** Guest pages are generated by slugifying the `guest:` field of episodes (via `getAllGuestSlugs`, with `NAME_ALIASES` + a person-name filter). Running the real generator showed 108 guest pages exist and **15 referenced slugs did not resolve** — surfacing both in body links and, mainly, in the `experts:` frontmatter array (rendered as visible links by `EvidenceBlock` and emitted as JSON-LD `mentions`, so each break was a real user-facing 404 + invalid structured data). Resolution:

**Repointed (page exists under the correct slug):**
- `andrew-sellars` → `dr-andrew-sellars` (improve-ftp-cycling-evidence-based-methods, recovery-for-cyclists-world-tour-protocols, breathing-for-cyclists-respiratory-training-guide, vo2max-training-cyclists-seven-reasons)
- `david-lipman` → `dr-david-lipman` (cycling-after-40-faster-science)

**No guest page exists → de-linked in body and `href` dropped from `experts:` frontmatter** (name + role retained for E-E-A-T; `EvidenceBlock` and the JSON-LD filter both degrade gracefully without an `href`):
- `art-oconnor`, `dan-plews`, `sharon-madigan`, `benji-naesen`, `bent-ronstad`, `jay-vine`, `matej-mohoric`, `peter-leo`, `sebastian-breuer`, `tim-kerrison`, `wout-van-aert`
- `dylan-johnson` — his only episode (`ep-2221`) carries a video *title* in the `guest:` field, so no guest page generates. De-linked across the 5 referencing articles.

**Name/spelling conflict (flagged):** `yori-carlson` was repointed to the existing `uri-carlson` page so the link resolves, but the article/body and the `experts:` `name:` still read **"Yori Carlson"** while the guest page reads **"Uri Carlson."** The display name needs reconciling to one spelling across the article, the episode `guest:` field, and the canonical-entity registry. Flagged — not guessed.

After fixes, re-running the real generator against the current tree: **all 42 distinct `/guests/` slugs referenced in the blog resolve — 0 broken.**

**Systemic recommendation:** `EvidenceBlock` renders any `experts[].href` verbatim. Adding a slug-existence check (render a link only when `getGuestBySlug(slug)` resolves, else plain text) would make future frontmatter typos non-breaking by construction. The same `getAllGuestSlugs` check would keep the Article JSON-LD `mentions` free of 404 `@id`s.

**Broken hero image — FIXED.** `cycling-over-40-complete-guide.mdx` set `featuredImage: /images/blog/cyclist-over-40-climbing.webp`, which does not exist (sibling files in `/images/blog/` do). Repointed to the existing, thematically-matched `/images/cycling/gravel-road-climb.jpg` used by its sibling over-40 articles.

**Audit-tool blind spot — recommend fixing the tooling.** `npm run audit:links:offline` does **not** recognise the `/answers/` route (`getAllAnswerSlugs`, 259 valid slugs), so it reports **568 valid `/answers/` links sitewide as broken "unknown"** — all false positives (every blog `/answers/` link was verified to resolve). This masks real breakage; teaching `scripts/audit-links.mjs` about `/answers/` is recommended. The remaining non-`/answers/` "unknown" hits (95 legacy `https://www.roadmancycling.com/...` CTAs in old `content/podcast/` episodes, 6 `/method` refs in `src/lib`) are outside blog scope.

**Resolved 25 August 2026.** The route dump and auditor now consume the live
inventories for all 569 canonical Answers, 349 Watch pages, 277 expert-topic
pairs, podcast guests, Tour stages/history, and recommendation routes. This
removed 1,280 false-positive Answer references, exposed and repaired 59 real
dead Answer/Guest/editorial links, and identified four retired campaign paths
for permanent consolidation into their current search owners.

---

## Files changed by this audit

Fixes span ~50 `content/blog/*.mdx` files (28 slop edits, 6 episode-number edits, 15 guest-link repoints/de-links across body + `experts:` frontmatter) plus this report. The commit is **path-scoped** to audited content files only — `.claude/*` state, settings, and concurrently-written podcast files were deliberately excluded. All 50 edited files were frontmatter-validated (YAML parses cleanly) to avoid the known unquoted-colon prerender crash.
