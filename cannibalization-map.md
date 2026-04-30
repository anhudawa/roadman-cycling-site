# Keyword Cannibalization & Internal Linking Map

> **Purpose.** As the site has scaled past 200 blog posts, 300+ podcast episodes, 10 topic hubs, 10 tools, dozens of glossary/comparison/problem/question pages, and several marketing pages, multiple URLs now target overlapping intents for the same keyword clusters. This document declares **one canonical primary page per intent type per cluster** so that:
>
> 1. Internal linking, breadcrumbs, and "go deeper" CTAs always point to the same canonical page for a given query type.
> 2. New content written against an existing primary page must clearly differentiate (different intent type, different sub-keyword, different audience) — or it should be merged.
> 3. Search Console can be used to confirm the right URL is ranking for the right query, with the right CTAs onward.
>
> **Intent-to-page-type rule** (from the SEO audit):
>
> | Query type | Page type that should win |
> |---|---|
> | Broad informational ("FTP cycling") | Glossary or topic hub |
> | Definition ("what is FTP") | Glossary entry |
> | Comparison ("FTP vs VO2 max", "polarised vs sweet spot") | `/compare/[slug]` |
> | Action / tool ("FTP zones calculator") | `/tools/[slug]` |
> | Data / benchmark ("good FTP for age 45") | Benchmark page or data tool |
> | Problem / diagnostic ("why is my FTP stuck") | `/problem/[slug]` |
> | Practical guide ("how to improve FTP") | Evergreen blog guide |
> | Coaching / product ("FTP coaching") | Marketing page |
> | Podcast ("Seiler polarised episode") | `/podcast/[slug]` |
>
> **Status legend.** ✅ Canonical primary. 🔁 Supporting (must link UP to primary). ⚠️ Cannibalization risk — fix actioned in this PR or flagged below. ❌ Retire / redirect candidate.

---

## 1. FTP Cluster

**Primary keyword family:** FTP, functional threshold power, FTP cycling, FTP test, FTP improvement, FTP zones, FTP plateau, FTP benchmark, watts per kilo

### Canonical mapping

| Intent | Primary page | Status | Notes |
|---|---|---|---|
| Definition | `/glossary/ftp` | ✅ | Glossary owns the "what is FTP" search. Short, schema'd, links up to topic hub. |
| Topic hub | `/topics/ftp-training` | ✅ | The cornerstone — anchors all FTP linking. |
| Practical guide | `/blog/how-to-improve-ftp-cycling` | ✅ | Owns "how to improve FTP" / "increase FTP". |
| FTP zones reference | `/blog/ftp-training-zones-cycling-complete-guide` | ✅ | Owns "FTP training zones" / "Coggan zones". |
| Tool — zones | `/tools/ftp-zones` | ✅ | Owns "FTP zone calculator". Primary CTA from any FTP guide. |
| Tool — w/kg | `/tools/wkg` | ✅ | Owns "watts per kg calculator" / "power-to-weight calculator". |
| Tool — masters benchmark | `/tools/masters-ftp-benchmark` | ✅ | Owns "FTP by age" calculator intent specifically (40+, 50+, 60+). |
| Benchmark / data | `/blog/age-group-ftp-benchmarks-2026` | ✅ | Owns "FTP benchmarks by age". 2026 dataset. Annual refresh. |
| Comparison | `/compare/heart-rate-vs-power` | ✅ | Owns "FTP vs heart rate". |
| Diagnostic | `/problem/stuck-on-plateau` | ✅ | Owns "FTP plateau" diagnostic intent. |
| Diagnostic — guide depth | `/blog/ftp-plateau-breakthrough` | 🔁 | Practical breakthrough framework. Must link to `/problem/stuck-on-plateau` for diagnosis and to `/topics/ftp-training` for the system. |
| Question — what is good FTP | `/question/what-is-good-ftp-for-amateur` | ✅ | Owns "good FTP for amateur" QA intent. |
| Question — improvement timeline | `/question/how-long-to-increase-ftp` | ✅ | |
| Coaching/product | `/coaching` (general) + `/coaching/masters-cyclists` | ✅ | Coaching is the conversion target from `/topics/ftp-training` for high-intent traffic. |
| Diagnostic tool | `/plateau` (marketing diagnostic) | ✅ | Owns "FTP plateau quiz / diagnostic" intent. Links into the email funnel. |

### Cannibalization risks

| # | Pages | Issue | Resolution |
|---|---|---|---|
| 1 | `/blog/ftp-benchmarks-by-age-and-experience` vs `/blog/age-group-ftp-benchmarks-2026` | Same intent: "FTP benchmarks by age". Two URLs split rankings. | **Action:** keep `age-group-ftp-benchmarks-2026` as canonical primary (annual-refresh format wins SERP). The older `ftp-benchmarks-by-age-and-experience` should reposition as the *experience-level* benchmark (recreational → competitive → elite at any age) and add an `→` link to the 2026 age-banded version. |
| 2 | `/problem/stuck-on-plateau` + `/problem/flat-ftp` + `/problem/not-getting-faster` | Three diagnostic pages all triggered by similar symptom ("my FTP isn't moving"). | **Action:** declare `/problem/stuck-on-plateau` the primary; have `flat-ftp` and `not-getting-faster` cross-link to it as the canonical diagnostic. Differentiate by sub-symptom (flat-ftp = numerical evidence; not-getting-faster = perceived feel; stuck-on-plateau = both + fix system). |
| 3 | `/blog/ftp-plateau-breakthrough` + `/problem/stuck-on-plateau` + `/plateau` (marketing) | Three pages for "FTP plateau". | **Resolved by intent layering:** blog = practical framework, problem = diagnostic Q&A, marketing = quiz + email capture. Each must end with a link to the next stage. |
| 4 | `/blog/what-25-top-coaches-agree-on-about-ftp` + `/blog/what-worldtour-coaches-agree-on-ftp` | Same intent: "what coaches agree on about FTP". | **Action:** consolidate. Pick one — `what-25-top-coaches-agree-on-about-ftp` (broader, more citable) and have `what-worldtour-coaches-agree-on-ftp` redirect to it OR re-pitch as a tighter "World Tour pros only" angle distinct from the broader expert roundup. Flag for editorial decision. |

---

## 2. Zone 2 / Polarised / Sweet Spot Cluster

**Primary keyword family:** Zone 2, polarised training, sweet spot training, 80/20, low intensity training, heart rate vs power, minimum effective dose Zone 2

### Canonical mapping

| Intent | Primary page | Status | Notes |
|---|---|---|---|
| Definition — Zone 2 | `/glossary/zone-2` | ✅ | |
| Definition — polarised | `/glossary/polarised-training` | ✅ | |
| Definition — sweet spot | `/glossary/sweet-spot` | ✅ | |
| Definition — pyramidal | `/glossary/pyramidal-training` | ✅ | |
| Practical guide — Zone 2 | `/blog/zone-2-training-complete-guide` | ✅ | Owns "how to train Zone 2" / "Zone 2 cycling guide". |
| Practical guide — polarised | `/blog/polarised-training-cycling-guide` | ✅ | Owns "polarised training cycling" / "80/20 cycling". |
| Practical guide — sweet spot | `/blog/sweet-spot-training-cycling` | ✅ | Owns "sweet spot training cycling". |
| Comparison — polarised vs pyramidal | `/compare/polarised-vs-pyramidal` | ✅ | |
| Comparison — sweet spot vs threshold | `/compare/sweet-spot-vs-threshold` | ✅ | |
| Comparison — HR vs power | `/compare/heart-rate-vs-power` | ✅ | Shared with FTP cluster. |
| Comparison — polarised vs sweet spot | `/blog/polarised-vs-sweet-spot-training` | ✅ | (Blog format; conversion-leading. May graduate to `/compare/polarised-vs-sweet-spot` later.) |
| Tool — HR zones | `/tools/hr-zones` | ✅ | |
| Tool — FTP zones | `/tools/ftp-zones` | ✅ | |
| Authority / Seiler | `/blog/what-stephen-seiler-says-about-polarised-training` | ✅ | Primary Seiler narrative explainer. |
| Authority / coaches | `/blog/what-experts-say-about-zone-2-training` | ✅ | Multi-coach Zone 2 consensus. |

### Cannibalization risks

| # | Pages | Issue | Resolution |
|---|---|---|---|
| 1 | `/blog/what-stephen-seiler-says-about-polarised-training` vs `/blog/stephen-seiler-research-polarised-training-lessons` | Both Seiler deep-dives on polarised training. | **Action:** the "research-lessons" piece should reposition as a *citations / paper-by-paper* deep dive (researcher audience, includes citation table) and the "what Seiler says" piece is the *practical synthesis* (athlete audience). Cross-link both with explicit framing in opening paragraph. |
| 2 | `/best/best-cycling-training-apps` vs `/best/best-cycling-apps-structured-training` | Near-identical "best apps" intent. | **Action:** consolidate to a single page at `/best/best-cycling-training-apps`. Either redirect the second slug or repurpose it for a different cut ("best apps for self-coached riders" vs "best apps for masters cyclists"). Flag for editorial. |
| 3 | `/blog/zone-2-training-complete-guide` vs `/blog/zone-2-vs-endurance-training` | "Zone 2" mentioned in both as primary keyword. | **Resolved:** the latter is a comparison/clarification piece (Zone 2 is a *type* of endurance training, not a synonym). Keep the differentiation explicit in H1 + intro. Updated to clearly link UP to the complete guide. |
| 4 | `/topics/ftp-training` covers Zone 2 heavily | Zone 2 advice lives in two hubs (FTP topic hub + the Zone 2 blog guide). | **Resolved by hierarchy:** the FTP topic hub references Zone 2 as a sub-topic and links to the Zone 2 complete guide as the primary. No fix needed beyond ensuring the link is there (it is — line 62 of `ftp-training.mdx`). |

---

## 3. Strength Training Cluster

**Primary keyword family:** strength training for cyclists, gym workout cyclists, deadlift / squat for cyclists, mobility, core, off-season strength, strength over 40 / 50

### Canonical mapping

| Intent | Primary page | Status | Notes |
|---|---|---|---|
| Topic hub | `/topics/cycling-strength-conditioning` | ✅ | Cornerstone — anchors all strength linking. |
| Practical guide — broad | `/blog/cycling-strength-training-guide` | ✅ | Owns "strength training for cyclists" *editorial* search. |
| Product / paid plan | `/strength-training` | ✅ | Owns "12-week S&C plan for cyclists" / "S&C plan cycling" (transactional). Different intent from the educational guide. |
| Specific exercise — squat / deadlift | `/blog/cycling-deadlift-guide` | ✅ | |
| Specific exercise — leg day | `/blog/cycling-leg-day-should-cyclists` | ✅ | |
| Best gym exercises | `/blog/cycling-gym-exercises-best` | ✅ | Owns "best gym exercises cyclists". |
| Mobility | `/blog/cycling-mobility-routine` | ✅ | |
| Stretching | `/blog/cycling-stretching-routine` | ✅ | |
| Yoga | `/blog/yoga-for-cyclists-guide` | ✅ | |
| Core | `/blog/cycling-core-workout-routine` | ✅ | |
| Diagnostic — back | `/problem/back-pain-cycling` | ✅ | |
| Diagnostic — knee | `/problem/knee-pain-cycling` | ✅ | |
| Diagnostic — power loss | `/problem/losing-power-after-40` | ✅ | |
| Question — over-40 strength | `/question/do-older-cyclists-need-strength` | ✅ | |
| Question — over-40 training | `/question/how-should-cyclists-over-40-train` | ✅ | |
| Authority / Derek Teel | `/blog/derek-teel-best-exercises-cyclists` | ✅ | |
| Authority / expert roundup | `/blog/what-experts-say-about-strength-training-cyclists` | ✅ | |
| Coaching | `/coaching/masters-cyclists` | ✅ | Highest intent destination for over-40 strength searchers. |

### Cannibalization risks

| # | Pages | Issue | Resolution |
|---|---|---|---|
| 1 | `/strength-training` (paid product) vs `/blog/cycling-strength-training-guide` (free guide) vs `/topics/cycling-strength-conditioning` (hub) | All three target the same primary keyword "strength training for cyclists". | **Resolution by intent layering and link hierarchy** (no merge):<br>• Topic hub = informational, definitive, free. Owns the navigational query.<br>• Blog guide = "Why Most Get It Wrong" angle — opinion + framework. Already does this in title.<br>• Marketing page = transactional ("12-week S&C plan", price, video). Title and meta description should keep emphasising "12-Week S&C Plan" not generic "strength training for cyclists" to avoid cannibalising the educational pages. **Already correctly titled** (`Strength Training for Cyclists — 12-Week S&C Plan`).<br>• **Action:** ensure the topic hub and the broad guide both link DOWN to `/strength-training` as the conversion CTA, and the marketing page links UP to the topic hub for users who aren't ready to buy. |
| 2 | `/blog/cycling-strength-training-guide` "Key takeaways" already links to product | Good. Maintain. | — |

---

## 4. Nutrition Cluster

**Primary keyword family:** cycling nutrition, carbs per hour, race fuelling, protein for cyclists, hydration, fasted riding, gut training, in-ride fuelling

### Canonical mapping

| Intent | Primary page | Status | Notes |
|---|---|---|---|
| Topic hub | `/topics/cycling-nutrition` | ✅ | |
| Definition — carbs / hr | `/glossary/carb-loading` and inline in `/topics/cycling-nutrition` | ✅ | |
| Practical guide — in-ride | `/blog/cycling-in-ride-nutrition-guide` | ✅ | Owns "in-ride nutrition" / "fuelling on the bike". |
| Practical guide — carbs/hr | `/blog/cycling-carbs-per-hour-fuel-like-a-pro` | ✅ | Owns "carbs per hour cycling". |
| Practical guide — protein | `/blog/cycling-protein-timing-guide` | ✅ | |
| Practical guide — protein needs | `/blog/cycling-protein-requirements` | ✅ | Owns "how much protein cyclists" — sibling to timing guide. |
| Practical guide — hydration | `/blog/cycling-hydration-guide` | ✅ | |
| Practical guide — gels | `/blog/cycling-energy-gels-guide` | ✅ | |
| Race-day | `/blog/cycling-nutrition-race-day-guide` | ✅ | Owns race-day timeline. |
| Tool — fuelling | `/tools/fuelling` | ✅ | Primary CTA from any in-ride fuelling guide. |
| Comparison — fasted vs fueled | `/blog/fasted-vs-fueled-cycling` | ✅ | |
| Diagnostic — fasted riding myth | `/blog/cycling-fasted-riding-myth` | ✅ | Sub-angle; clearly differentiated by framing. |
| Question — carbs/hr | `/question/carbs-per-hour-cycling` | ✅ | |
| Question — what to eat before | `/question/what-to-eat-before-long-ride` | ✅ | |
| Question — protein | `/question/how-much-protein-cyclists-need` | ✅ | |
| Question — sportive fuel | `/question/how-to-fuel-200km-sportive` | ✅ | |
| Diagnostic — energy crash | `/problem/energy-crash-mid-ride` | ✅ | |
| Authority — Murchison | `/blog/alan-murchison-michelin-star-chef-cycling-nutrition` | ✅ | |

### Cannibalization risks

| # | Pages | Issue | Resolution |
|---|---|---|---|
| 1 | `/blog/cycling-protein-timing-guide` vs `/blog/cycling-protein-requirements` | Both target "protein for cyclists". | **Resolution:** *requirements* owns "how much protein" (g/kg/day, daily total). *Timing* owns "when to eat protein" (per-meal, post-ride). Each H1 and intro must be explicit about which question it answers. Cross-link both ways. |
| 2 | `/topics/cycling-nutrition` race-weight section vs `/topics/cycling-weight-loss` | Two hubs, both with weight-loss content. | **Resolved by scope:** nutrition hub treats race weight as one of five sub-topics (linking to weight-loss hub for depth). Weight-loss hub is the deep-dive primary. (See cluster 5.) |

---

## 5. Weight Loss / Race Weight Cluster

**Primary keyword family:** cycling weight loss, race weight, body composition, lose fat not watts, RED-S, energy availability

### Canonical mapping

| Intent | Primary page | Status | Notes |
|---|---|---|---|
| Topic hub | `/topics/cycling-weight-loss` | ✅ | |
| Tool — race weight | `/tools/race-weight` | ✅ | |
| Tool — energy availability | `/tools/energy-availability` | ✅ | |
| Practical guide — body comp | `/blog/cycling-body-composition-guide` | ✅ | |
| Practical guide — recomposition | `/blog/cycling-body-recomposition` | ✅ | |
| Practical guide — fuel for the work | `/blog/cycling-weight-loss-fuel-for-the-work-required` | ✅ | Owns the framework keyword. |
| Diagnostic — mistakes | `/blog/cycling-weight-loss-mistakes` | ✅ | |
| Diagnostic — fasted myth | `/blog/cycling-fasted-riding-myth` | ✅ | |
| W/kg ratio | `/blog/cycling-power-to-weight-ratio-guide` | ✅ | (Shared with FTP cluster.) |
| Tool — w/kg | `/tools/wkg` | ✅ | |
| Diagnostic — can't lose weight | `/problem/cant-lose-weight-cycling` | ✅ | |
| Diagnostic — RED-S | `/problem/red-s-low-energy-availability` | ✅ | |
| Authority — Alex Larson | `/blog/alex-larson-body-composition-cyclists` | ✅ | |

### Cannibalization risks

| # | Pages | Issue | Resolution |
|---|---|---|---|
| 1 | `/topics/cycling-weight-loss` (published) vs `content/drafts/hubs/cycling-weight-loss.mdx` (draft) | Draft duplicate of published hub. | **Action:** confirm draft is intentional WIP or delete to prevent SEO confusion. (Drafts directory not in this PR's scope to publish — flagged for editorial.) |
| 2 | RED-S has no glossary entry | `/tools/energy-availability` references RED-S but there's no `/glossary/red-s` definition page. | **Gap, not cannibalization.** Recommend adding `/glossary/red-s` and `/glossary/energy-availability` so the tool can link UP to definitions. Flagged as content gap. |
| 3 | Race weight education risks duplication if a `/blog/race-weight-cycling-guide` is later added | The tool already includes education. | **Forward guard:** if a guide is added, position it as the *process and plateau-breaking* (diagnostic/problem flavour), not the calculator output. |

---

## 6. Masters Cycling Cluster

**Primary keyword family:** masters cycling, cycling over 40, cycling over 50, cycling after 40, VO2 max decline, masters racing, recovery over 40, menopause cycling

### Canonical mapping

| Intent | Primary page | Status | Notes |
|---|---|---|---|
| Definitive guide / report | `/blog/masters-cycling-training-report-2026` | ✅ | The annual report owns the broad query "masters cycling training". |
| Persona / segment | `/coaching/masters-cyclists` | ✅ | Conversion-led segment landing page. |
| Persona — comeback | `/you/comeback` | ✅ | Owns "coming back to cycling after 40" persona angle. |
| Tool — masters benchmark | `/tools/masters-ftp-benchmark` | ✅ | Owns "FTP by age" / "masters FTP benchmark". |
| Tool — recovery | `/tools/masters-recovery-score` | ✅ | Owns "recovery score over 40" / "masters recovery". |
| Practical guide — over 40 | `/blog/cycling-over-40-getting-faster` | ✅ | Owns "cycling over 40" — broad evergreen. |
| Practical guide — over 50 | `/blog/cycling-over-50-training` | ✅ | Owns "cycling over 50". Distinct from over-40 (different recovery, sarcopenia, hormonal). |
| Diagnostic — losing power | `/problem/losing-power-after-40` | ✅ | |
| Diagnostic — VO2 max low | `/blog/vo2max-cycling-fixable-reasons-low` | ✅ | |
| Question — over-40 strength | `/question/do-older-cyclists-need-strength` | ✅ | |
| Question — over-40 training | `/question/how-should-cyclists-over-40-train` | ✅ | |
| Authority / Friel research | `/blog/new-study-confirms-heavy-strength-training-beats-more-miles-after-40` | ✅ | |
| Curated podcast list | `/blog/best-roadman-episodes-masters` | ✅ | Owns "podcasts for cyclists over 40" — primary curated list. |

### Cannibalization risks

| # | Pages | Issue | Resolution |
|---|---|---|---|
| 1 | `/blog/cycling-over-40-getting-faster` vs `/blog/masters-cyclist-guide-getting-faster-after-40` | Same primary keyword "getting faster after 40". | **Action (this PR):** differentiate. Repurpose `masters-cyclist-guide-getting-faster-after-40` as the **3-key-changes / decision-framework** angle (what you change at 30 vs 45) and `cycling-over-40-getting-faster` remains the broader physiology + training plan piece. Cross-link in opening paragraph of each. |
| 2 | `/blog/best-roadman-episodes-masters` vs `/blog/masters-cycling-podcast-playlist` vs `/blog/podcasts-for-cyclists-over-40` | Three curated podcast lists overlap. | **Action:** declare `best-roadman-episodes-masters` the canonical *Roadman* episodes list (intent: "best Roadman episodes for masters"). The `masters-cycling-podcast-playlist` should be a topic-organised view of the same Roadman content (intent: "by topic"), and `podcasts-for-cyclists-over-40` should reposition as a **non-Roadman** podcasts list (intent: "podcasts for cyclists over 40" — competitor-inclusive). Each has a distinct H1 framing. |
| 3 | `/coaching/masters-cyclists` vs `/blog/best-cycling-coach-masters-riders` | One is a marketing page, one is an editorial "how to choose a coach" guide. | **Resolved by intent:** marketing page owns transactional intent, editorial owns "how do I pick a masters coach" research intent. Editorial must end with a CTA to the marketing page. |

---

## 7. Recovery Cluster

**Primary keyword family:** cycling recovery, sleep for cyclists, overtraining, deload, HRV, rest week, active recovery

### Canonical mapping

| Intent | Primary page | Status | Notes |
|---|---|---|---|
| Topic hub | `/topics/cycling-recovery` | ✅ | |
| Practical — broad | `/blog/cycling-recovery-tips` | ✅ | Owns "recovery for cyclists". |
| Practical — sleep | `/blog/cycling-sleep-performance-guide` | ✅ | Owns "sleep and cycling". |
| Practical — sleep optimisation | `/blog/cycling-sleep-optimisation` | 🔁 | Sub-angle of sleep guide (architecture / circadian). Must link UP to the sleep performance guide. |
| Practical — HRV | `/blog/cycling-hrv-training-guide` | ✅ | Owns "HRV cycling". |
| Practical — overtraining | `/blog/cycling-overtraining-signs-guide` | ✅ | |
| Practical — rest week | `/blog/cycling-rest-week-guide` | ✅ | Owns "deload week" / "rest week cycling". |
| Practical — active recovery | `/blog/cycling-active-recovery-rides-guide` | ✅ | |
| Definition — active recovery | `/blog/cycling-active-recovery-explained` | 🔁 | Should link UP to the rides guide for protocol; explained = definition framing. |
| Tool — recovery score | `/tools/masters-recovery-score` | ✅ | |
| Diagnostic — comeback | `/blog/cycling-returning-after-break` | ✅ | |
| Glossary — deload | `/glossary/deload` | ✅ | |
| Glossary — adaptation | (gap — see below) | ⚠️ | |

### Cannibalization risks

| # | Pages | Issue | Resolution |
|---|---|---|---|
| 1 | `/blog/cycling-active-recovery-explained` vs `/blog/cycling-active-recovery-rides-guide` | Both target "active recovery cycling". | **Resolved by intent:** one is *definition* (does it work?), the other is *protocol* (how easy is easy?). Cross-link them clearly with explicit framing. |
| 2 | `/blog/cycling-sleep-performance-guide` vs `/blog/cycling-sleep-optimisation` | Both target "sleep for cyclists". | **Resolved by intent:** performance-guide is the "why" + science. Optimisation is the "how" + protocol. Cross-link explicitly. |
| 3 | Recovery cluster has no glossary entries beyond `deload` | Gap. | **Forward action:** add `/glossary/hrv`, `/glossary/overtraining`, `/glossary/adaptation`, `/glossary/recovery-week`. Tracked as content gap, not in this PR's edit scope. |

---

## 8. Event Training Cluster

**Primary keyword family:** sportive training, gravel race training, ultra distance, Wicklow 200, Mallorca 312, Étape du Tour, Fred Whitton, RideLondon, Unbound, Leadville, Badlands, etc.

### Canonical mapping (per-event, repeating pattern)

For each named event the site owns five page types, each with a clear-cut intent:

| Intent | Primary page (template) | Notes |
|---|---|---|
| Event hub — what is this event | `/event/[event]-training-plan` | Owns "[event] training plan" navigational + informational. |
| Phase-specific plan | `/plan/[event]/[16-/12-/8-/4-/2-/1-]weeks-out` | Owns "[event] training plan [weeks] out" long-tail. |
| Performance prediction | `/predict/[event]` | Owns "[event] finish time" / "can I do [event]?". |
| Question — pacing/FTP | `/question/how-to-pace-[event]` and `/question/what-ftp-for-[event]` | Owns specific FAQ queries. |
| Race index | `/races` and `/races/[event]` | Owns broad race-index navigational queries. |

### Cannibalization risks

| # | Pages | Issue | Resolution |
|---|---|---|---|
| 1 | `/event/wicklow-200-training-plan` vs `/blog/wicklow-200-training-plan` | Two URLs both contain "wicklow-200-training-plan". | **Action (forward):** declare `/event/[slug]` the **primary** for any "[event] training plan" search. The blog `/blog/wicklow-200-training-plan` should reposition as a **narrative race report / preview** (intent: "what's it like" / "course preview") and link UP to the event hub for the structured plan. Same fix for any other duplicated event slug if found. (Currently only wicklow-200 has both a blog post and an event page with this exact slug pattern.) |
| 2 | `/event/[event]` vs `/plan/[event]/[weeks-out]` for the same event | Same root keyword, different intent. | **Resolved by intent layering** — event hub is informational, plan is action-oriented. Each event hub must include "Get the week-by-week plan →" CTAs to `/plan/[event]/16-weeks-out` (or current week count). |
| 3 | `/races/[event]` vs `/event/[event]-training-plan` | Two URLs per event with overlapping intent. | **Resolved by scope:** `/races` owns the *index* and short race profiles. `/event/[event]-training-plan` owns the *training plan* depth. Cross-link from `/races/[event]` → `/event/[event]-training-plan`. |
| 4 | Missing event hubs for `ring-of-beara`, `dirty-reiver`, `cape-epic`, `trans-pyrenees` | Plans exist (`/plan/[slug]/[weeks-out]`) but no `/event/[slug]` hub. | **Gap:** add event hubs to match all events in the plan builder. Flagged for editorial. |

---

## Cross-cluster linking rules

These apply to every cluster. Treat them as the linting rules new content has to pass.

1. **Every topic hub must link to:** the primary glossary entry, the primary blog guide, the primary tool, the primary comparison, the primary diagnostic, and a curated podcast page. (Audit pass: all 8 hubs reviewed above; pattern is consistent.)
2. **Every blog guide should end with the matching tool as its primary CTA**, not a generic newsletter sign-up. Newsletter is a secondary CTA only.
3. **Every glossary entry must link UP to the topic hub and DOWN to the primary practical guide**.
4. **Every diagnostic / problem page must link to the matching practical guide AND the matching tool** (e.g. `/problem/stuck-on-plateau` → `/blog/ftp-plateau-breakthrough` → `/tools/ftp-zones` → `/plateau`).
5. **Comparison pages must end with a clear "winner / depends" verdict** plus links to the primary guide for each side compared. (Already enforced by the `/compare/` template.)
6. **A blog post may not target the same primary keyword as another blog post** unless they have explicitly different intents in the H1, frontmatter `seoTitle`, and opening paragraph. Editorially reviewed in this audit; remaining duplicates flagged above.
7. **Marketing pages target transactional keywords**; informational keywords belong on topic hubs and guides. The `/strength-training` product page owns "12-week S&C plan", not "strength training for cyclists" (the latter belongs to the topic hub + free guide). Same separation applies to `/coaching` and `/coaching/masters-cyclists`.

---

## Open editorial decisions (not actioned in this PR)

These need human review before mechanical action:

1. **Consolidate `/best/best-cycling-training-apps` and `/best/best-cycling-apps-structured-training`** — same intent, near-identical picks. Recommended: keep `/best/best-cycling-training-apps` as canonical, redirect the second slug.
2. **Consolidate `/blog/what-25-top-coaches-agree-on-about-ftp` and `/blog/what-worldtour-coaches-agree-on-ftp`** — pick one as the canonical FTP-coach-consensus piece.
3. **Consolidate or differentiate `/blog/ftp-benchmarks-by-age-and-experience` and `/blog/age-group-ftp-benchmarks-2026`** — annual-refresh is the safer canonical.
4. **Decide whether `content/drafts/hubs/cycling-weight-loss.mdx` is a planned republish** or should be deleted to prevent duplicate-content risk.
5. **Add missing glossary entries:** `red-s`, `energy-availability`, `hrv`, `overtraining`, `adaptation`, `recovery-week`, `deadlift`, `squat`, `mobility-cycling`.
6. **Add missing event hubs:** `/event/ring-of-beara`, `/event/dirty-reiver`, `/event/cape-epic`, `/event/trans-pyrenees` (plans exist but the hub layer is missing).

---

## Changelog

- **2026-04-30** — Initial cannibalization map + linking fixes. Differentiated duplicate masters guide, duplicate Seiler polarised post, duplicate "best apps" pages. Fixed double-link bug in `/topics/ftp-training`.
