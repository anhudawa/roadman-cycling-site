# Canonical Topic Cluster Definitions

**Date:** 2026-07-10
**Authority:** SEO Dominance Audit July 2026
**Purpose:** Define the single canonical destination for each of the 10 topic clusters the site must own. Every future content decision -- what to publish, what to consolidate, what to interlink -- flows from this document.

**Rule:** Each cluster has ONE canonical URL. All other pages in that cluster exist to support that canonical. No exceptions.

---

## 1. Masters Cycling Performance

**Canonical URL:** `/masters`
**Page type:** Bespoke authority hub
**File:** `src/app/(marketing)/masters/page.tsx`
**Pillar:** coaching
**Commercial product:** Not Done Yet coaching ($195/mo)
**Commercial path:** `/coaching` (also `/coaching/masters`, `/coaching/over-50`)
**Lead magnet:** Masters Performance Checklist
**Diagnostic/tool:** Masters Plateau Diagnostic (`/plateau`)

### Keyword families owned

- masters cycling training
- cycling after 40
- cycling over 40
- cycling over 50
- getting faster after 40
- cycling training over 40
- masters cycling training plan
- masters cyclist recovery
- cycling after 50
- vo2 max decline cycling

### Tools

| Tool | URL |
|------|-----|
| Masters FTP Benchmark | `/tools/masters-ftp-benchmark` |
| Masters Recovery Score | `/tools/masters-recovery-score` |
| Cycling Age Grade Calculator | `/tools/age-grade` |
| VO2max Estimator | `/tools/vo2max` |

**Note:** The TOPIC_ENRICHMENT for `masters-cycling` in `topics.ts` has `tools: []` -- the masters-specific tools are listed on the `/masters` hub page manually but are not wired into the topic hub enrichment. This should be fixed.

### Supporting pages (blog posts that link UP to `/masters`)

Top 14 by relevance:

- `cycling-over-40-complete-guide`
- `masters-cycling-training-report-2026`
- `cycling-after-40-faster-science`
- `masters-cycling-training-plan-over-40`
- `masters-cyclist-guide-getting-faster-after-40`
- `cycling-over-40-getting-faster`
- `cycling-over-50-training`
- `strength-training-cyclists-over-40-what-works`
- `vo2max-decline-reversibility-masters-cyclists`
- `joe-friel-fast-after-50-cycling-method`
- `what-experts-say-about-masters-cycling`
- `masters-recovery-audit-seven-things-to-check`
- `masters-cycling-recovery-after-40-guide`

Full cluster: 94 blog posts mapped in `TOPIC_POST_MAP["masters-cycling"]`. FTP-by-age benchmark intent belongs to the maintained `age-group-ftp-benchmarks-2026` evidence page below.

### Decision pages

- `best-cycling-coach-masters-riders`
- `cycling-coaching-for-beginners-when-ready` (shared with coaching cluster)
- `trainerroad-vs-online-cycling-coach` (shared with coaching cluster)

### Evidence pages

- `masters-cycling-training-report-2026` (flagship -- only post in the cluster with `reviewedBy`)
- `cycling-after-40-recovery-report-2026`
- `age-group-ftp-benchmarks-2026`
- `new-study-confirms-heavy-strength-training-beats-more-miles-after-40`
- `andy-galpin-fast-twitch-fibres-cyclist-after-40`

### Answer pages

28 in dedicated `answers-data/masters.ts`:

- can-you-get-faster-after-50
- why-am-i-slowing-down-with-age
- why-does-recovery-take-longer-with-age
- strength-training-for-masters-cyclists
- how-much-protein-cyclists-over-50
- does-vo2-max-decline-with-age
- masters-cyclist-training-week
- testosterone-and-masters-cyclists
- losing-muscle-as-a-masters-cyclist
- how-many-hard-sessions-after-50
- weight-loss-for-masters-cyclists
- fast-after-50-cycling
- cycling-into-your-60s-and-beyond
- is-it-too-late-to-start-cycling-at-50
- cycling-bone-density
- masters-vo2-max-intervals
- cycling-through-menopause
- hormones-masters-cycling
- racing-competitively-after-50
- training-40s-vs-50s
- masters-cyclist-winter-training
- getting-back-into-cycling-after-40
- how-long-before-masters-cyclists-lose-fitness
- heart-rate-zones-by-age
- masters-off-season-training
- is-zone-2-enough-for-masters-cyclists
- can-you-improve-ftp-after-40
- how-to-prevent-cycling-injuries-over-40

Plus 11 masters-related answers scattered across high-volume-queries files.

### Internal linking rule

Every page in this cluster must link to:
1. `/masters` (the canonical)
2. One tool (preference: `/tools/masters-ftp-benchmark` or `/tools/masters-recovery-score`)
3. One podcast episode (via named guest: Seiler, Galpin, Friel, Lipman, Teel, Dunne, or Lorang)
4. One next-stage page (`/coaching` or `/plateau`)

### Content gaps

- **No `reviewedBy` on the `/masters` hub itself** -- the 2026 Report has one but the canonical does not
- **No `CitedClaimTable` on the hub** -- evidence is in prose, not structured for AI extraction
- **No `answerCapsule` equivalent** -- the page opens with editorial challenges rather than a direct answer paragraph
- **7+ pages competing for "cycling over 40" variants** -- highest cannibalisation risk of any cluster
- **Topic enrichment tools array is empty** -- needs masters-specific tools wired in
- **No canonical comparison page** for "coach vs app for masters riders"

---

## 2. Cycling Coaching

**Canonical URL:** `/topics/cycling-coaching`
**Page type:** Topic hub (dynamic route)
**File:** `src/lib/topics.ts` (slug: `cycling-coaching`) + `content/topics/cycling-coaching.mdx` (pillar content, ~11KB) + `src/app/(content)/topics/[slug]/page.tsx`
**Pillar:** coaching
**Commercial product:** Not Done Yet coaching ($195/mo)
**Commercial path:** `/apply` (application page)
**Lead magnet:** Coaching readiness assessment
**Diagnostic/tool:** Masters Plateau Diagnostic (`/plateau`)

### Keyword families owned

- cycling coach
- cycling coaching
- online cycling coach
- cycling coaching program
- is a cycling coach worth it
- personalised cycling training plan
- cycling coach ireland
- cycling coach uk

### Tools

| Tool | URL |
|------|-----|
| FTP Test Calculator | `/tools/ftp-test` |
| Training Load Calculator (CTL/ATL/TSB) | `/tools/training-load` |
| Sweet Spot Calculator | `/tools/sweet-spot` |
| Cycling Age Grade Calculator | `/tools/age-grade` |
| Interval Session Builder | `/tools/interval-builder` |
| Body Composition Calculator | `/tools/body-composition` |

### Supporting pages (blog posts that link UP to `/topics/cycling-coaching`)

Top 15 by relevance:

- `is-a-cycling-coach-worth-it`
- `best-online-cycling-coach-how-to-choose`
- `what-does-a-cycling-coach-do`
- `how-much-does-online-cycling-coach-cost-2026`
- `cycling-coaching-results-before-and-after`
- `not-done-yet-coaching-review`
- `cycling-coaching-testimonials`
- `self-coached-cyclist-mistakes`
- `five-mistakes-self-coached-cyclists-make`
- `personalised-cycling-training-plan-why-generic-plans-fail`
- `zwift-vs-cycling-coach`
- `cycling-coaching-for-beginners-when-ready`
- `cycling-working-with-a-coach-guide`
- `is-a-cycling-coach-worth-it-case-study`

Full cluster: 177 blog posts mapped in `TOPIC_POST_MAP["cycling-coaching"]` (topics.ts line 1344).

### Decision pages

- `best-online-cycling-coach-how-to-choose` (has `reviewedBy`)
- `trainerroad-vs-online-cycling-coach`
- `zwift-vs-cycling-coach`
- `cycling-coach-vs-triathlon-coach`
- `cycling-self-coaching-framework-guide`

### Evidence pages

- `cycling-coaching-results-before-and-after`
- `is-a-cycling-coach-worth-it-case-study`
- `cycling-coaching-testimonials`
- `not-done-yet-coaching-review`

### Coaching segment pages (commercial, not informational)

- `/coaching` -- main sales page (1,027 lines)
- `/coaching/masters`
- `/coaching/over-50`
- `/coaching/beginners`
- `/coaching/busy-professionals`
- `/coaching/comeback`
- `/coaching/event-prep`
- `/coaching/gravel`
- `/coaching/post-injury`
- `/coaching/sportives`
- `/coaching/time-crunched`
- `/coaching/triathletes`
- `/coaching/weight-loss`
- `/coaching/women`
- `/coaching/[location]` (dynamic location pages)

### Answer pages

1 dedicated coaching answer page:

- how-to-choose-a-cycling-coach (in `high-volume-queries-5.ts`)

Coaching-related sub-questions also appear in masters.ts answer pages (e.g. "Do I need a coach after 50?").

### Internal linking rule

Every page in this cluster must link to:
1. `/topics/cycling-coaching` (the canonical)
2. One tool (preference: `/tools/ftp-test` or `/tools/training-load`)
3. One podcast episode (via named coach: Lorang, Friel, Seiler, Wakefield, Bottrill)
4. One next-stage page (`/apply` or `/coaching`)

### Content gaps

- **No `reviewedBy` on the topic hub or pillar content** -- `best-online-cycling-coach-how-to-choose` has one but the canonical does not
- **No `CitedClaimTable`** on the topic hub
- **No structured decision framework component** -- the pillar has a "what to look for" section but it is not a formal component
- **Only 1 dedicated coaching answer page** -- massive gap compared to 28 in masters
- **No "coaching vs app" canonical comparison page** -- `trainerroad-vs-online-cycling-coach` and `zwift-vs-cycling-coach` exist but are narrow
- **Need clear intent separation** between `/topics/cycling-coaching` (informational canonical) and `/coaching` (conversion page)

---

## 3. Cycling Plateaus

**Canonical URL:** `/blog/cycling-training-plateaus-how-to-break-through-guide`
**Page type:** Blog post (promoted to pillar)
**File:** `content/blog/cycling-training-plateaus-how-to-break-through-guide.mdx` (245 lines)
**Pillar:** coaching
**Commercial product:** Not Done Yet coaching ($195/mo)
**Commercial path:** `/plateau` (diagnostic funnel for cold paid traffic)
**Lead magnet:** Plateau Diagnostic result
**Diagnostic/tool:** Masters Plateau Diagnostic (`/plateau`)

### Keyword families owned

- cycling training plateau
- cycling plateau how to break through
- FTP plateau cycling
- why your FTP is stuck
- cycling getting slower
- cycling not improving

### Tools

| Tool | URL |
|------|-----|
| Recovery Readiness Screen | `/tools/recovery-screen` |
| Training Readiness Check | `/tools/training-readiness` |
| FTP Zone Calculator | `/tools/ftp-zones` |
| TSS Calculator | `/tools/tss` |

### Supporting pages (blog posts that link UP to the canonical)

- `ftp-plateau-breakthrough` (**note:** referenced in TOPIC_POST_MAP but no .mdx file exists -- orphan reference)
- `why-your-ftp-is-stuck-five-causes`
- `mid-season-fitness-reset-cycling-guide`
- `more-volume-getting-slower-cycling-overtraining`
- `self-coached-cyclist-mistakes`
- `cycling-overtraining-signs-guide`
- `recognising-overtraining-cyclists-guide`
- `cycling-recovering-from-overtraining-guide`
- `cycling-comeback-after-time-off-guide`
- `cycling-dealing-with-setbacks-guide`

### Decision pages

- `trainerroad-vs-online-cycling-coach` (shared with coaching cluster)
- `is-a-cycling-coach-worth-it` (shared with coaching cluster)

### Evidence pages

- No dedicated evidence page for plateaus -- gap

### Answer pages

1 relevant answer page:

- mental-side-of-plateaus (in `mental.ts`)

### Internal linking rule

Every page in this cluster must link to:
1. `/blog/cycling-training-plateaus-how-to-break-through-guide` (the canonical)
2. One tool (preference: `/tools/recovery-screen` or `/tools/training-readiness`)
3. One podcast episode covering plateaus or overtraining
4. One next-stage page (`/plateau` or `/coaching`)

### Content gaps

- **No topic hub for plateaus** -- this is the ONLY cluster of the 10 without a `/topics/` page. Creating a `cycling-plateaus` or `training-plateaus` topic definition in `topics.ts` with a pillar content MDX would bring it in line with the other clusters.
- **No `reviewedBy`** on the blog post
- **No `answerCapsule`** on the blog post (has `keyTakeaways` but not the direct-answer format)
- **No `CitedClaimTable`**
- **Only 1 answer page** -- needs dedicated plateau answer pages
- **`ftp-plateau-breakthrough` is an orphan** -- slug referenced in `TOPIC_POST_MAP` but no corresponding .mdx file exists
- **No evidence/data page** -- e.g. "What percentage of amateur cyclists plateau and why" with survey data

---

## 4. Performance Nutrition

**Canonical URL:** `/topics/cycling-nutrition`
**Page type:** Topic hub (dynamic route)
**File:** `src/lib/topics.ts` (slug: `cycling-nutrition`) + `content/topics/cycling-nutrition.mdx` (pillar content, ~10KB) + `src/app/(content)/topics/[slug]/page.tsx`
**Pillar:** nutrition
**Commercial product:** Not Done Yet coaching ($195/mo), Fuel Planner tool
**Commercial path:** `/coaching`
**Lead magnet:** Fuelling Self-Assessment
**Diagnostic/tool:** Fuelling Self-Assessment (`/tools/fuelling-screen`)

### Keyword families owned

- cycling nutrition
- cycling diet
- what to eat cycling
- cycling fuelling
- endurance nutrition
- cycling weight loss (overlaps with weight-loss cluster)

### Tools

| Tool | URL |
|------|-----|
| In-Ride Fuelling Calculator | `/tools/fuelling` |
| Calories Burned Calculator | `/tools/calories` |
| Energy Availability Calculator | `/tools/energy-availability` |
| Race Weight Calculator | `/tools/race-weight` |
| Hydration Calculator | `/tools/hydration` |
| Body Composition Calculator | `/tools/body-composition` |
| Cycling Fuel Planner | `/tools/fuel-planner` |
| Fuelling Self-Assessment | `/tools/fuelling-screen` |

### Supporting pages (blog posts that link UP to `/topics/cycling-nutrition`)

Top 15 by relevance:

- `cycling-in-ride-nutrition-guide`
- `cycling-nutrition-race-day-guide`
- `cycling-weight-loss-fuel-for-the-work-required`
- `sam-impey-fuelling-carbs-per-hour-world-tour`
- `fasted-vs-fueled-cycling`
- `protein-for-cyclists-complete-guide`
- `supplements-cyclists-what-works-guide`
- `fuelling-self-assessment-cycling-nutrition-guide`
- `cycling-hydration-guide`
- `cycling-periodised-nutrition-guide`
- `cycling-energy-gels-guide`
- `fuel-for-the-work-required-fftwr-explained`
- `gut-training-cycling-absorb-more-carbs`
- `cycling-carb-loading-protocol-race-week`
- `bonking-cycling-what-happens-how-to-prevent`

Full cluster: 100 blog posts mapped in `TOPIC_POST_MAP["cycling-nutrition"]` (topics.ts line 724). This is the largest topic cluster on the site.

### Decision pages

- `cycling-fat-adaptation-low-carb-training-guide`
- `fasted-vs-fueled-cycling`
- `low-carb-vs-high-carb-cycling` (answer page)

### Evidence pages

- `amateur-cyclist-fuelling-benchmarks-report-2026`
- `creatine-for-cyclists-thirty-day-data`
- `creatine-for-cyclists-30-day-experiment`
- `tim-spector-gut-microbiome-cycling-weight-loss`

### Answer pages

19 in dedicated `answers-data/nutrition.ts`:

- what-to-eat-after-cycling
- how-much-protein-do-cyclists-need
- how-to-carb-load-before-an-event
- lose-weight-without-losing-power
- is-fasted-riding-worth-it
- how-to-train-your-gut-cycling
- what-do-pro-cyclists-eat
- how-much-to-drink-cycling
- do-cyclists-need-electrolytes
- fuel-for-the-work-required
- best-recovery-foods-cyclists
- should-cyclists-take-creatine
- does-caffeine-improve-cycling
- how-to-avoid-bonking
- cycling-body-composition
- low-carb-vs-high-carb-cycling
- fuelling-interval-sessions
- sports-nutrition-vs-real-food
- cycling-rest-day-nutrition

Plus nutrition-adjacent answers in other files.

### Internal linking rule

Every page in this cluster must link to:
1. `/topics/cycling-nutrition` (the canonical)
2. One tool (preference: `/tools/fuelling` or `/tools/fuel-planner`)
3. One podcast episode (via named nutritionist: Sam Impey, Tim Podlogar, David Dunne, Hannah Grant)
4. One next-stage page (`/coaching` or `/tools/fuelling-screen`)

### Content gaps

- **No `reviewedBy` on the topic hub or pillar content** -- nutrition is the one area where credentialed review matters most (dietitian or sports nutritionist)
- **No `CitedClaimTable`** -- the pillar has a macro table but no evidence-level citations
- **No structured "which approach for which rider" decision framework** -- has practical baselines but no formal component
- **Fuel Planner tool (`/tools/fuel-planner`) is not in the TOPIC_ENRICHMENT tools array** -- should be added

---

## 5. Strength and Longevity

**Canonical URL:** `/topics/cycling-strength-conditioning`
**Page type:** Topic hub (dynamic route)
**File:** `src/lib/topics.ts` (slug: `cycling-strength-conditioning`) + `content/topics/cycling-strength-conditioning.mdx` (pillar content, ~10KB) + `src/app/(content)/topics/[slug]/page.tsx`
**Pillar:** strength
**Commercial product:** 12-week S&C plan (product page at `/strength-training`)
**Commercial path:** `/strength-training`
**Lead magnet:** Strength training starter checklist (gap -- does not exist)
**Diagnostic/tool:** Recovery Readiness Screen (`/tools/recovery-screen`)

### Keyword families owned

- strength training for cyclists
- strength training for cyclists over 40
- cycling-specific strength training
- cycling gym exercises
- best exercises for cyclists
- core workout for cyclists
- masters cyclist strength training
- gym programme for cyclists

### Tools

| Tool | URL |
|------|-----|
| Recovery Readiness Screen | `/tools/recovery-screen` |
| W/kg Calculator | `/tools/wkg` |
| Body Composition Calculator | `/tools/body-composition` |

**Note:** The TOPIC_ENRICHMENT for `cycling-strength-conditioning` has `tools: []` -- no tools are wired into the topic hub. This should be fixed.

### Supporting pages (blog posts that link UP to `/topics/cycling-strength-conditioning`)

Top 15 by relevance:

- `cycling-strength-training-guide`
- `derek-teel-best-exercises-cyclists`
- `new-study-confirms-heavy-strength-training-beats-more-miles-after-40`
- `strength-training-cyclists-over-40-what-works`
- `strength-training-cyclists-over-50`
- `cycling-strength-training-what-transfers-guide`
- `cycling-strength-training-year-round-plan-guide`
- `gym-vs-bike-strength-training-cyclists-research`
- `cycling-strength-training-guide`
- `strength-training-cyclists-minimum-effective-dose`
- `core-strength-cyclists-beyond-planks`
- `cycling-gym-exercises-best`
- `cycling-core-workout-routine`
- `glute-activation-cyclists-power-leaks`
- `cycling-single-leg-strength-exercises-guide`

Full cluster: 49 blog posts mapped in `TOPIC_POST_MAP["cycling-strength-conditioning"]` (topics.ts line 1149).

### Decision pages

- `gym-vs-bike-strength-training-cyclists-research`
- `strength-training-cyclists-minimum-effective-dose`
- `cycling-weight-training-in-season-guide`

### Evidence pages

- `new-study-confirms-heavy-strength-training-beats-more-miles-after-40` (2024 PLOS ONE study)
- `cycling-blood-flow-restriction-training-guide`

### Answer pages

20 in dedicated `answers-data/strength.ts`:

- best-gym-exercises-for-cyclists
- how-many-strength-sessions-cyclists
- will-lifting-make-me-slower
- heavy-or-light-weights-cyclists
- strength-training-in-season
- core-work-for-cyclists
- are-squats-good-for-cyclists
- when-to-lift-around-rides
- strength-training-without-a-gym
- should-cyclists-do-plyometrics
- single-leg-exercises-for-cycling
- how-long-should-a-cyclists-gym-session-be
- strength-training-for-beginner-cyclists
- does-strength-training-increase-ftp
- periodise-strength-training
- strength-training-injury-prevention
- off-season-strength-training
- glute-and-hip-training-cycling
- strength-training-sprint-power
- how-heavy-should-cyclists-squat

### Internal linking rule

Every page in this cluster must link to:
1. `/topics/cycling-strength-conditioning` (the canonical)
2. One tool (preference: `/tools/recovery-screen` or `/tools/body-composition`)
3. One podcast episode (via named expert: Derek Teel, Andy Galpin)
4. One next-stage page (`/strength-training` or `/coaching`)

### Content gaps

- **No `reviewedBy`** on the topic hub or pillar content
- **No `CitedClaimTable`** -- the PLOS ONE study is mentioned in prose but not in a structured evidence table
- **TOPIC_ENRICHMENT tools array is empty** -- needs strength-relevant tools wired in
- **Pillar content references "squats, deadlifts, hip hinges, presses"** -- verify alignment with the editorial rule about not prescribing heavy compound lifts (deadlifts/squats/barbell rows) for the 35-55 audience. The pillar may need language that frames these as "coach-supervised" or substitutes safer alternatives.
- **No dedicated lead magnet** for strength

---

## 6. Sportive/Event Preparation

**Canonical URL:** `/topics/race-preparation`
**Page type:** Topic hub (dynamic route)
**File:** `src/lib/topics.ts` (slug: `race-preparation`) + `content/topics/race-preparation.mdx` (pillar content, ~11KB) + `src/app/(content)/topics/[slug]/page.tsx`
**Pillar:** coaching
**Commercial product:** Not Done Yet coaching ($195/mo)
**Commercial path:** `/coaching` (also `/event-prep`, `/coaching/sportives`, `/coaching/event-prep`)
**Lead magnet:** Race Day Checklist tool
**Diagnostic/tool:** Race Day Checklist (`/tools/race-day-checklist`)

### Keyword families owned

- cycling race preparation
- cycling taper guide
- sportive preparation
- race day nutrition cycling
- cycling pacing strategy
- cycling warm up protocol

### Tools

| Tool | URL |
|------|-----|
| In-Ride Fuelling Calculator | `/tools/fuelling` |
| FTP Zone Calculator | `/tools/ftp-zones` |
| Race Day Checklist | `/tools/race-day-checklist` |
| Race Time Predictor | `/tools/race-predictor` |
| Climbing Time Estimator | `/tools/climb-time` |

### Supporting pages (blog posts that link UP to `/topics/race-preparation`)

Top 15 by relevance:

- `cycling-taper-guide-peak-race-day`
- `cycling-tapering-guide` (has `reviewedBy` -- only reviewed post in this cluster)
- `cycling-taper-race-preparation-system`
- `race-day-checklist-cycling-complete-guide`
- `pacing-strategy-cycling-sportive`
- `race-day-fuelling-24-hour-timeline`
- `cycling-nutrition-race-day-guide`
- `cycling-carb-loading-protocol-race-week`
- `cycling-tapering-for-events-guide`
- `how-to-train-for-a-sportive-12-weeks`
- `peaking-for-a-sportive-12-week-framework`
- `pre-race-warmup-protocol-cyclists`
- `first-gran-fondo-what-nobody-tells-you-guide`
- `cycling-multi-day-event-preparation-guide`
- `cycling-warm-up-cool-down-guide`

Full cluster: 88 blog posts mapped in `TOPIC_POST_MAP["race-preparation"]` (topics.ts), including 30+ individual sportive training plans (Etape, Marmotte, Fred Whitton, Ride London, etc.).

### Sportive training plan pages (sub-cluster)

- `etape-du-tour-training-plan`
- `wicklow-200-training-plan`
- `fred-whitton-challenge-training-plan`
- `ride-london-training-plan`
- `ring-of-beara-training-plan`
- `la-marmotte-training-guide`
- `gran-fondo-nyc-training-guide`
- `gran-fondo-training-plan-12-weeks`
- `mallorca-312-training-guide`
- `maratona-dles-dolomites-training-guide`
- (plus 40+ more event-specific training guides)

### Decision pages

- `cycling-how-to-choose-a-training-plan-guide`
- `how-to-pace-your-first-century-guide`

### Evidence pages

- `sportive-training-readiness-index-2026`

### Answer pages

21 in dedicated `answers-data/racing.ts`:

- how-to-taper-for-a-race
- how-to-train-for-a-sportive
- how-to-pace-a-gran-fondo
- first-gravel-race-preparation
- what-to-eat-in-race-week
- how-to-pace-a-time-trial
- how-to-race-a-criterium
- how-to-pace-a-long-climb
- what-to-eat-during-a-race
- how-to-peak-for-an-event
- how-to-prepare-for-unbound-200
- race-day-warm-up-cycling
- how-to-stop-cramping-in-races
- training-for-the-etape-or-marmotte
- how-to-prepare-for-your-first-road-race
- pacing-a-race-with-power
- first-bike-race-preparation
- racing-stage-events
- training-for-a-hill-climb
- road-race-positioning
- how-to-sprint-for-the-line

### Internal linking rule

Every page in this cluster must link to:
1. `/topics/race-preparation` (the canonical)
2. One tool (preference: `/tools/race-day-checklist` or `/tools/race-predictor`)
3. One podcast episode covering race execution or tapering
4. One next-stage page (`/coaching` or `/event-prep`)

### Content gaps

- **No `reviewedBy` on the topic hub** -- the `cycling-tapering-guide` blog post has one, but the canonical does not
- **No `CitedClaimTable`**
- **No "which approach for which event type" decision framework** -- has a taper table but no structured matrix
- **`/event-prep` page should clearly funnel to coaching** -- currently competes for "cycling event prep" commercially
- **Race Time Predictor (`/tools/race-predictor`) is not in the TOPIC_ENRICHMENT tools array** -- should be added

---

## 7. Running for Cyclists

**Canonical URL:** `/topics/running-for-cyclists`
**Page type:** Topic hub (dynamic route)
**File:** `src/lib/topics.ts` (slug: `running-for-cyclists`) + `content/topics/running-for-cyclists.mdx` (pillar content, ~18KB -- the deepest non-triathlon pillar) + `src/app/(content)/topics/[slug]/page.tsx`
**Pillar:** strength
**Commercial product:** Not Done Yet coaching ($195/mo)
**Commercial path:** `/strength-training`
**Lead magnet:** Couch-to-5K for Cyclists plan (gap -- does not exist as standalone)
**Diagnostic/tool:** Run-Ride Equivalence Converter (`/tools/run-ride-converter`)

### Keyword families owned

- running for cyclists
- cross training cycling
- is running good for cyclists
- cycling cross training
- running and cycling
- cyclist bone density
- off season running
- running plan for cyclists

### Tools

| Tool | URL |
|------|-----|
| Run-Ride Equivalence Converter | `/tools/run-ride-converter` |
| HR Zone Calculator | `/tools/hr-zones` |
| In-Ride Fuelling Calculator | `/tools/fuelling` |

### Supporting pages (blog posts that link UP to `/topics/running-for-cyclists`)

All 27 posts in the cluster:

- `running-cross-training-cyclists`
- `running-vs-cycling-fitness-transfer`
- `running-plan-cyclists-first-5k`
- `running-injury-prevention-cyclists`
- `running-off-season-cyclists`
- `trail-running-cyclists-guide`
- `cycling-running-weekly-schedule`
- `cycling-bone-density-running-fix`
- `running-cycling-mental-health-benefits`
- `time-crunched-cyclist-running-benefits`
- `zone-2-running-vs-cycling-heart-rate`
- `running-shoes-guide-cyclists`
- `fuelling-running-vs-cycling-differences`
- `super-shoes-carbon-plate-running-cyclists`
- `gps-watches-cycling-running-guide`
- `supplements-endurance-cyclist-runner`
- `hybrid-athlete-over-40-run-ride-lift`
- `brick-workouts-cyclists-guide`
- `couch-to-5k-for-cyclists`
- `switching-from-running-to-cycling-guide`
- `running-cycling-crossover-training-guide`
- `cycling-for-injured-runners`
- `cycling-better-for-knees-than-running`
- `cycling-replace-long-run-marathon`
- `ftp-for-runners-cycling-power-explained`
- `running-cycling-conversion-calculator`
- `parkrun-cycling-cross-training`

### Decision pages

- `running-vs-cycling-fitness-transfer`
- `switching-from-running-to-cycling-guide`

### Evidence pages

- `cycling-bone-density-running-fix` (84% osteopenia statistic)

### Answer pages

7 relevant answer pages across multiple files:

- how-many-minutes-cycling-equals-running (cross-training.ts)
- why-is-my-heart-rate-lower-cycling-than-running (cross-training.ts)
- does-cycling-make-legs-slower-for-running (cross-training.ts)
- best-garmin-running-and-cycling (cycling-tech.ts)
- can-cycling-replace-running (high-volume-queries-14.ts)
- cycling-and-bone-density-over-50 (high-volume-queries-6.ts)
- cycling-bone-density (masters.ts)

### Internal linking rule

Every page in this cluster must link to:
1. `/topics/running-for-cyclists` (the canonical)
2. One tool (preference: `/tools/run-ride-converter`)
3. One podcast episode covering cross-training or bone density
4. One next-stage page (`/strength-training` or `/coaching`)

### Content gaps

- **No `reviewedBy`** on the topic hub or pillar content
- **No `CitedClaimTable`** -- the 2026 systematic review and 84% osteopenia statistic are cited in prose but not in a structured table
- **No structured "when to add running" decision matrix**
- **No FAQs in the pillar MDX** -- FAQs come from the topic definition in `topics.ts`
- **Companion hub `/topics/cycling-for-runners`** exists for the reverse direction -- ensure cross-linking is bidirectional

---

## 8. Triathlon for Cyclists

**Canonical URL:** `/topics/triathlon-cycling`
**Page type:** Topic hub (dynamic route)
**File:** `src/lib/topics.ts` (slug: `triathlon-cycling`) + `content/topics/triathlon-cycling.mdx` (pillar content, ~9KB) + `src/app/(content)/topics/[slug]/page.tsx`
**Pillar:** coaching
**Commercial product:** Not Done Yet coaching ($195/mo)
**Commercial path:** `/coaching/triathletes`
**Lead magnet:** Triathlon bike pacing guide (gap -- does not exist as standalone)
**Diagnostic/tool:** FTP Zone Calculator (`/tools/ftp-zones`)

### Keyword families owned

- triathlon cycling
- triathlon bike training
- ironman bike pacing
- triathlon cycling plan
- cycling for triathletes
- triathlon bike nutrition
- triathlon ftp

### Tools

| Tool | URL |
|------|-----|
| FTP Zone Calculator | `/tools/ftp-zones` |
| In-Ride Fuelling Calculator | `/tools/fuelling` |
| Race Time Predictor | `/tools/race-predictor` |

**Note:** Race Time Predictor is not in the TOPIC_ENRICHMENT but is relevant for triathlon pacing. Should be added.

### Supporting pages (blog posts that link UP to `/topics/triathlon-cycling`)

All 24 posts in the cluster:

- `bike-leg-of-triathlon-why-age-groupers-get-it-wrong`
- `triathlon-cycling-training-plan`
- `triathlon-ftp-pacing-strategy`
- `triathlon-bike-nutrition-strategy`
- `triathlon-cycling-power-to-weight`
- `triathlon-aero-position-guide`
- `triathlon-off-season-cycling`
- `70-3-bike-training-plan-12-weeks`
- `ironman-bike-training-plan-16-weeks`
- `how-to-pace-the-bike-in-a-half-ironman`
- `how-many-bike-hours-per-week-for-70-3`
- `ftp-training-for-triathletes`
- `olav-bu-triathlon-training-plan-design`
- `brick-workouts-for-ironman`
- `indoor-cycling-for-triathletes-winter-plan`
- `what-wattage-should-you-ride-in-an-ironman`
- `ben-hoffman-three-uncommon-habits-triathlete`
- `best-cycling-podcast-for-triathletes`
- `cycling-coach-vs-triathlon-coach`
- `aero-position-training-for-triathletes` (shared with cycling-training-plans)
- `strength-training-for-triathletes-bike-specific` (shared with strength cluster)

Plus shared FTP/nutrition/zone-2 posts.

### Decision pages

- `cycling-coach-vs-triathlon-coach`
- `bike-leg-of-triathlon-why-age-groupers-get-it-wrong`

### Evidence pages

- `olav-bu-triathlon-training-plan-design` (named expert methodology)

### Answer pages

**Zero dedicated triathlon answer pages.** Triathlon content appears only as embedded sub-questions within other answer pages (cycling-tech.ts, ftp.ts, bikefit.ts, power.ts), not as standalone answer page slugs.

### Internal linking rule

Every page in this cluster must link to:
1. `/topics/triathlon-cycling` (the canonical)
2. One tool (preference: `/tools/ftp-zones` or `/tools/fuelling`)
3. One podcast episode (via named expert: Olav Bu, Alistair Brownlee, Ben Hoffman)
4. One next-stage page (`/coaching/triathletes`)

### Content gaps

- **No `reviewedBy`** on the topic hub
- **No `CitedClaimTable`** -- pacing percentages are stated without evidence-level attribution
- **No "which plan for which race distance" structured decision matrix**
- **Zero dedicated answer pages** -- needs triathlon-specific answer pages (e.g. "what power should I ride in an Ironman", "how to pace 70.3 bike leg")
- **No lead magnet** specific to triathletes

---

## 9. Endurance Technology

**Canonical URL:** `/topics/cycling-tech`
**Page type:** Topic hub (dynamic route)
**File:** `src/lib/topics.ts` (slug: `cycling-tech`) + `content/topics/cycling-tech.mdx` (pillar content, ~11KB) + `src/app/(content)/topics/[slug]/page.tsx`
**Pillar:** coaching
**Commercial product:** Not Done Yet coaching ($195/mo)
**Commercial path:** `/coaching`
**Lead magnet:** Data screen setup guide (gap -- does not exist as standalone)
**Diagnostic/tool:** None specific

### Keyword families owned

- cycling tech
- best cycling computers 2026
- gps watch cycling
- wahoo vs garmin
- power meter cycling
- cycling metrics explained
- bike computer vs watch
- cycling data

### Tools

| Tool | URL |
|------|-----|
| Gear Ratio Calculator | `/tools/gear-ratio` |
| FTP Zone Calculator | `/tools/ftp-zones` |
| HR Zone Calculator | `/tools/hr-zones` |
| W/kg Calculator | `/tools/wkg` |
| Power-Speed Calculator | `/tools/power-speed` |
| Cadence Calculator | `/tools/cadence` |
| Wind Chill Calculator | `/tools/wind-chill` |

### Supporting pages (blog posts that link UP to `/topics/cycling-tech`)

Top 15 by relevance:

- `best-cycling-computers-2026`
- `wahoo-vs-garmin-cycling-computers`
- `cycling-metrics-explained`
- `cycling-power-meter-guide`
- `power-meter-training-cyclists-how-to-use`
- `power-meter-vs-smart-trainer`
- `gps-watches-cycling-running-guide`
- `reading-your-training-data-tss-ctl-atl-tsb`
- `uli-schoberer-first-power-meter-cycling-history`
- `power-meter-buying-guide-cyclists`
- `cycling-head-unit-data-screens-setup-guide`
- `cycling-strava-segments-training-guide`
- `cycling-aerodynamic-clothing-guide`
- `cycling-aero-position-road-bike-guide`
- `cycling-marginal-gains-that-actually-matter-guide`

Full cluster: 40 blog posts mapped in `TOPIC_POST_MAP["cycling-tech"]`.

### Decision pages

- `wahoo-vs-garmin-cycling-computers`
- `power-meter-vs-smart-trainer`
- `cycling-endurance-bike-vs-race-bike-guide`
- `cycling-groupset-electronic-vs-mechanical-guide`

### Evidence pages

- `uli-schoberer-first-power-meter-cycling-history`
- `cycling-aero-testing-without-wind-tunnel-guide`

### Answer pages

4 in dedicated `answers-data/cycling-tech.ts`:

- bike-computer-vs-watch-cycling
- apple-watch-accuracy-cycling
- what-cycling-metrics-to-track
- best-garmin-running-and-cycling

Plus 6 in high-volume-queries files:

- how-to-set-up-cycling-computer
- best-cycling-computer-2026
- garmin-vs-wahoo-head-unit-2026
- how-to-pair-a-power-meter
- garmin-vs-wahoo-for-cycling
- do-i-need-a-power-meter

And 2 in topic-specific files:

- ftp-test-without-power-meter (ftp.ts)
- zone-2-without-power-meter (zone2.ts)

### Adjacent topic hubs (not canonicals, but related)

- `/topics/power-meter-training` -- sub-cluster of tech
- `/topics/indoor-training` -- includes Zwift/TrainerRoad tech

### Internal linking rule

Every page in this cluster must link to:
1. `/topics/cycling-tech` (the canonical)
2. One tool (preference: `/tools/gear-ratio` or `/tools/power-speed`)
3. One podcast episode covering data/metrics/equipment
4. One next-stage page (`/coaching`)

### Content gaps

- **No `reviewedBy`** on the topic hub
- **No `CitedClaimTable`** -- opinions on gear are not evidence-graded
- **Pillar content needs expanding** -- currently weakest pillar after against-the-clock. Needs substantially more content on "which data matters for training" rather than competing on spec sheets
- **No `answerCapsule`** on the hub
- **Site's angle should be "data that makes you faster"** rather than competing with DC Rainmaker, GCN Tech, or CyclingTips on product reviews

---

## 10. Watches and Endurance Culture

**Canonical URL:** `/topics/against-the-clock`
**Page type:** Topic hub (dynamic route)
**File:** `src/lib/topics.ts` (slug: `against-the-clock`) + `content/topics/against-the-clock.mdx` (pillar content, ~3KB -- critically thin) + `src/app/(content)/topics/[slug]/page.tsx`
**Pillar:** community
**Commercial product:** Watch brand partnerships (`/against-the-clock/partner/`)
**Commercial path:** `/go` (routed to Plateau Diagnostic funnel)
**Lead magnet:** None
**Diagnostic/tool:** None

### Keyword families owned

- hour record cycling
- cycling time trial
- race of truth cycling
- cycling watches
- richard mille cycling
- tudor pro cycling
- dan bigham hour record
- cycling and time

### Tools

None. The TOPIC_ENRICHMENT for `against-the-clock` deliberately omits tools.

### Supporting pages (blog posts that link UP to `/topics/against-the-clock`)

All 19 posts in the cluster:

- `against-the-clock-cycling-watches` (flagship feature -- has answerCapsule, keyTakeaways, FAQs)
- `tudor-pro-cycling-tour-de-france-2026`
- `tudor-bumblebee-watches-tour-de-france`
- `richard-mille-cycling-watches-modern-peloton`
- `rolex-cycling-great-absence-tudor`
- `omega-olympic-timing-track-cycling-hour-record`
- `breitling-top-time-eddy-merckx-cycling-watch`
- `breitling-top-time-coppi-bartali-cycling-rivalry`
- `casio-f91w-ten-mile-time-trial-cycling`
- `bravur-zwift-collaboration-watch`
- `dan-bigham-aerodynamics-amateur-cyclists`
- `alex-dowsett-pro-cycling-lessons-amateur`
- `ryan-collins-six-hour-velodrome-record-three-tweaks`
- `ryan-collins-six-hour-record-46kmh`
- `cycling-time-trial-tips`
- `tour-de-france-time-trial-lessons-amateurs`
- `cycling-time-trial-beginners-guide`
- `cycling-aerodynamic-clothing-guide`
- `cycling-time-trial-pacing-strategy-guide`

### Decision pages

- None specific to this cluster

### Evidence pages

- `dan-bigham-aerodynamics-amateur-cyclists`
- `ryan-collins-six-hour-velodrome-record-three-tweaks`

### Answer pages

3 tangentially related:

- bike-computer-vs-watch-cycling (cycling-tech.ts)
- apple-watch-accuracy-cycling (cycling-tech.ts)
- how-to-pace-a-time-trial (racing.ts)

### Internal linking rule

Every page in this cluster must link to:
1. `/topics/against-the-clock` (the canonical)
2. The flagship feature: `/blog/against-the-clock-cycling-watches`
3. One podcast episode (via named athlete: Dan Bigham, Alex Dowsett, Ryan Collins)
4. Partnership page: `/against-the-clock/partner/` (for brand content only)

### Content gaps

- **Pillar content is critically thin at 3KB (~27 lines)** -- just an intro paragraph, a divider, and FAQ section. This is the thinnest pillar on the entire site. Needs expanding to 1,500-2,000 words covering the Hour Record narrative, the time trial tradition, and the watches chapter.
- **No `reviewedBy`**
- **No `CitedClaimTable`**
- **No decision framework**
- **No `answerCapsule` on the hub** -- the flagship blog post has one but the hub does not
- **Alternative option:** Make `/blog/against-the-clock-cycling-watches` the canonical and use the topic hub purely as an aggregation page. The hub would need substantial expansion to justify being the canonical over the flagship post.
- **Zero dedicated answer pages** for this cluster

---

## Cross-Cluster Rules

### Universal internal linking standard

Every content page on the site must link to:
1. Its cluster canonical (the URL listed above for its topic)
2. At least one tool
3. At least one podcast episode
4. At least one next-stage/commercial page

### Cannibalisation resolution protocol

When two pages in the same cluster compete for the same query:
1. The canonical URL wins -- all other pages must defer via internal linking, `rel="canonical"` if needed, and reduced keyword targeting
2. Supporting pages should target long-tail variants, not the head term
3. If a supporting page outranks the canonical, the canonical needs strengthening (not the supporting page weakening)

### Content creation protocol

Before publishing any new content:
1. Identify which of the 10 clusters it belongs to
2. Confirm it does not duplicate the canonical's head term
3. Ensure it links UP to the cluster canonical
4. Check the content brief template for required elements

### Priority order for cluster improvements

| Priority | Cluster | Key action |
|----------|---------|------------|
| **1** | Masters cycling performance | Add reviewedBy, CitedClaimTable, answerCapsule to `/masters` hub |
| **1** | Cycling coaching | Add reviewedBy, CitedClaimTable to `/topics/cycling-coaching`; create coaching answer pages |
| **1** | Performance nutrition | Add reviewedBy (credentialed nutritionist), CitedClaimTable to `/topics/cycling-nutrition` |
| **2** | Cycling plateaus | Create `/topics/cycling-plateaus` topic hub with pillar content MDX |
| **2** | Strength and longevity | Add reviewedBy, CitedClaimTable; wire tools into TOPIC_ENRICHMENT |
| **2** | Sportive/event preparation | Add reviewedBy; add race-predictor to TOPIC_ENRICHMENT |
| **2** | Running for cyclists | Add reviewedBy, CitedClaimTable (bone density statistic) |
| **2** | Triathlon for cyclists | Add reviewedBy; create triathlon answer pages |
| **2** | Watches & endurance culture | Expand pillar content from 3KB to 10KB+; or reassign canonical to flagship post |
| **3** | Endurance technology | Expand pillar content; position as "data that makes you faster" |

---

## Summary table

| # | Cluster | Canonical URL | Page type | Posts | Answers | Tools | Priority |
|---|---------|--------------|-----------|-------|---------|-------|----------|
| 1 | Masters cycling performance | `/masters` | Authority hub | 95 | 28+ | 4 | **1** |
| 2 | Cycling coaching | `/topics/cycling-coaching` | Topic hub | 177 | 1 | 6 | **1** |
| 3 | Cycling plateaus | `/blog/cycling-training-plateaus-how-to-break-through-guide` | Blog post | ~10 | 1 | 4 | **2** |
| 4 | Performance nutrition | `/topics/cycling-nutrition` | Topic hub | 100 | 19 | 8 | **1** |
| 5 | Strength and longevity | `/topics/cycling-strength-conditioning` | Topic hub | 53 | 20 | 3 | **2** |
| 6 | Sportive/event preparation | `/topics/race-preparation` | Topic hub | 88 | 21 | 5 | **2** |
| 7 | Running for cyclists | `/topics/running-for-cyclists` | Topic hub | 27 | 7 | 3 | **2** |
| 8 | Triathlon for cyclists | `/topics/triathlon-cycling` | Topic hub | 24 | 0 | 3 | **2** |
| 9 | Endurance technology | `/topics/cycling-tech` | Topic hub | 40 | 12 | 7 | **3** |
| 10 | Watches & endurance culture | `/topics/against-the-clock` | Topic hub | 19 | 3 | 0 | **2** |

---

## Cross-cutting findings

1. **No topic hub has `reviewedBy`.** The only blog posts with reviewedBy are `masters-cycling-training-report-2026`, `cycling-tapering-guide`, and `best-online-cycling-coach-how-to-choose`. Adding a reviewer to the 10 canonical pages is the highest-leverage single improvement.

2. **No topic hub has a `CitedClaimTable`.** The component exists and the `TopicHub` interface supports `citedClaims`, but only `ftp-training` currently uses it. Populating cited claims for the 3 Priority-1 clusters (masters, coaching, nutrition) is the second-highest-leverage improvement.

3. **The `/masters` hub and the topic hubs serve different architectural roles.** The `/masters` page is a bespoke authority page with custom layout, editorial sections, and testimonials. The `/topics/*` pages are generated from a shared template with pillar content MDX. For cluster 1, the bespoke hub is the right canonical. For clusters 2-10, the topic hub template is the right canonical.

4. **Cluster 3 (Plateaus) is the only cluster without a topic hub.** Creating a `cycling-plateaus` topic definition in `topics.ts` with pillar content MDX would bring it in line.

5. **Two pillar content files are critically thin:** `against-the-clock.mdx` (3KB) and `cycling-tech.mdx` (11KB -- recently expanded but still the thinnest after against-the-clock). Both need further work.

6. **Answer page coverage is wildly uneven.** Masters (28), strength (20), racing (21), and nutrition (19) are well-served. Coaching (1), plateaus (1), triathlon (0), and watches (0) are underserved.

7. **Three TOPIC_ENRICHMENT tools arrays are empty** that should not be: `masters-cycling`, `cycling-strength-conditioning`, and `against-the-clock` (deliberate). The first two should have tools wired in.

8. **`ftp-plateau-breakthrough` is an orphan reference** -- slug exists in `TOPIC_POST_MAP` but no corresponding .mdx file exists in `content/blog/`.
