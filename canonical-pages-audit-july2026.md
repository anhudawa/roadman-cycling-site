# Canonical Pages Audit — July 2026

**Date:** 2026-07-10
**Purpose:** Identify the single canonical destination page for each of the 10 topic clusters the site must own. Analysis only — no files modified.
**Framework:** Dominance Audit July 2026 (masters-cannibalisation-map, claims-registry)

---

## Audit Template Reference

The ideal canonical page for each cluster should contain:
- **Direct answer** (answerCapsule or equivalent opening paragraph)
- **Expert reviewer** (reviewedBy with named credentials)
- **Decision framework** (structured methodology the reader can apply)
- **Cited claims** (named sources with evidence levels)
- **FAQs** (visible accordion + FAQPage JSON-LD)
- **Internal link authority** (hub links inbound, tools linked, related posts linked)
- **Structured data** (CollectionPage, Article, or WebPage schema)

---

## 1. Masters Cycling Performance

### Recommended Canonical: `/masters`

**URL:** `https://roadmancycling.com/masters`
**File:** `src/app/(marketing)/masters/page.tsx` (~1,290 lines)
**Title:** "Masters Cycling Training — Getting Faster Over 40, 45, 50+"

### Why This Page

The `/masters` hub is the purpose-built authority page for the entire masters cluster. It aggregates the full Roadman masters evidence base — named-guest episodes (Seiler, Galpin, Friel, Lipman, Teel, Dunne, Lorang), the written archive, topic hubs, masters-specific tools (FTP Benchmark, Recovery Score, Age-Grade, VO2max), and the 2026 Masters Report. It has WebPage + FAQPage + BreadcrumbList schema, structured editorial sections covering physiology, methodology, and evidence, and routes readers to every sub-cluster. It is the only page that functions as a genuine authority hub rather than a single article.

### Competing Pages

| Slug | URL | Type | Risk |
|------|-----|------|------|
| `cycling-over-40-complete-guide` | `/blog/cycling-over-40-complete-guide` | Blog (365 lines) | HIGH — targets same "cycling over 40" head term with answerCapsule + citedClaims + FAQs |
| `masters-cycling-training-report-2026` | `/blog/masters-cycling-training-report-2026` | Blog (720 lines) | MODERATE — flagship long-form, only post with `reviewedBy`, but targets "masters cycling training report" not the head term |
| `cycling-after-40-faster-science` | `/blog/cycling-after-40-faster-science` | Blog (226 lines) | HIGH — "cycling after 40 how to get faster" overlaps hub title |
| `cycling-over-40-getting-faster` | `/blog/cycling-over-40-getting-faster` | Blog (146 lines) | HIGH — shorter piece, same intent |
| `masters-cyclist-guide-getting-faster-after-40` | `/blog/masters-cyclist-guide-getting-faster-after-40` | Blog (207 lines) | MODERATE — "3 mistakes" angle differentiates |
| `masters-cycling` (topic hub) | `/topics/masters-cycling` | Topic hub (dynamic, 53 posts + 28 answers) | MODERATE — aggregation page with pillar content MDX |
| `cycling-over-50-evidence-based-training-guide` | `/blog/cycling-over-50-evidence-based-training-guide` | Blog (288 lines) | LOW — differentiated by age band |

### Missing Elements vs Audit Template

- **Expert reviewer:** No `reviewedBy` on the hub page itself (the 2026 Report has one, but the hub does not)
- **Cited claims table:** No structured `CitedClaimTable` component — evidence is woven into prose but not in the auditable tabular format the topic hubs use
- **answerCapsule equivalent:** The page opens with editorial challenges rather than a direct answer paragraph optimised for AI extraction

### Improvement Priority: 1 (Highest)

This is the single most important cluster for the brand. The hub exists and is strong, but the cannibalisation map shows 7+ pages competing for "cycling over 40" variants.

---

## 2. Cycling Coaching

### Recommended Canonical: `/topics/cycling-coaching`

**URL:** `https://roadmancycling.com/topics/cycling-coaching`
**File:** `src/lib/topics.ts` (slug: `cycling-coaching`) + `content/topics/cycling-coaching.mdx` (pillar content) + `src/app/(content)/topics/[slug]/page.tsx` (dynamic route)
**Title:** "Cycling Coaching — Online & In-Person"

### Why This Page

The `/topics/cycling-coaching` hub has a 2,000+ word pillar content MDX file covering what coaching is, when to get one, what to look for, online vs in-person, cost, and coaching vs platforms. It aggregates 60+ mapped blog posts, linked tools, and routes to the commercial `/coaching` page. The pillar content opens with a direct answer paragraph. It has CollectionPage schema, FAQ accordion, and internal links to every coaching sub-topic. The `/coaching` page itself (1,027 lines) is a sales/conversion page with testimonials and before/after metrics — strong commercially but wrong as the informational canonical because its intent is conversion, not education.

### Competing Pages

| Slug | URL | Type | Risk |
|------|-----|------|------|
| `/coaching` | `/coaching` | Marketing page (1,027 lines) | MODERATE — targets "online cycling coach" commercially; different intent |
| `best-cycling-coach-guide` | `/blog/best-cycling-coach-guide` | Blog (~175 lines) | HIGH — targets "best cycling coach" with answerCapsule + FAQs |
| `best-online-cycling-coach-how-to-choose` | `/blog/best-online-cycling-coach-how-to-choose` | Blog (~160 lines, `reviewedBy`) | HIGH — reviewed, targets "best online cycling coach" |
| `what-does-a-cycling-coach-do` | `/blog/what-does-a-cycling-coach-do` | Blog | MODERATE — specific "what does a coach do" intent |
| `cycling-working-with-a-coach-guide` | `/blog/cycling-working-with-a-coach-guide` | Blog (232 lines) | MODERATE — "working with a coach" angle |
| `is-a-cycling-coach-worth-it-case-study` | `/blog/is-a-cycling-coach-worth-it-case-study` | Blog | MODERATE — case-study angle differentiates |
| `how-much-does-online-cycling-coach-cost-2026` | `/blog/how-much-does-online-cycling-coach-cost-2026` | Blog | LOW — cost-specific intent |
| `best-cycling-coach-masters-riders` | `/blog/best-cycling-coach-masters-riders` | Blog (175 lines) | MODERATE — masters-specific overlap with `/coaching/masters` |
| `/coaching/masters` | `/coaching/masters` | Segment page | LOW — masters coaching segment |
| `/coaching/over-50` | `/coaching/over-50` | Segment page | LOW — over-50 coaching segment |

### Missing Elements vs Audit Template

- **Expert reviewer:** No `reviewedBy` on the topic hub or its pillar content
- **Cited claims table:** No CitedClaimTable — evidence is in prose
- **Decision framework:** The pillar content has a "what to look for" section but not a structured decision framework component
- **answerCapsule in schema:** The opening paragraph functions as one but is not tagged for AI extraction

### Improvement Priority: 1 (Highest)

Coaching is the commercial heart of the business ($195/mo NDY). The informational canonical needs to be clearly separated from the commercial `/coaching` page, with the topic hub earning the "cycling coaching" head term and the `/coaching` page converting warm traffic.

---

## 3. Cycling Plateaus

### Recommended Canonical: `/blog/cycling-training-plateaus-how-to-break-through-guide`

**URL:** `https://roadmancycling.com/blog/cycling-training-plateaus-how-to-break-through-guide`
**File:** `content/blog/cycling-training-plateaus-how-to-break-through-guide.mdx` (245 lines)
**Title:** "Cycling Training Plateau: Systematic Diagnosis Guide"

### Why This Page

No dedicated topic hub or authority page exists for plateaus. The `/plateau` page (1,162 lines) is a conversion funnel — the Masters Plateau Diagnostic designed for cold paid traffic — not an editorial resource. The best editorial candidate is `cycling-training-plateaus-how-to-break-through-guide`, which has a systematic three-layer diagnostic framework (recovery first, training stimulus second, non-training stressors third), 5 FAQs, 4 relatedTools, 6 relatedPosts, and 7 keyTakeaways. It was published 2026-07-10 (fresh content). The alternative, `ftp-plateau-breakthrough`, is narrower (FTP-specific) and older (2026-03-28).

### Competing Pages

| Slug | URL | Type | Risk |
|------|-----|------|------|
| `/plateau` | `/plateau` | Diagnostic funnel (1,162 lines) | LOW — different intent (conversion vs information), but title "Cycling Plateau Diagnostic" competes for "cycling plateau" queries |
| `ftp-plateau-breakthrough` | `/blog/ftp-plateau-breakthrough` | Blog (~180 lines) | HIGH — targets "FTP plateau cycling" with answerCapsule + FAQs, significant content overlap |
| `why-your-ftp-is-stuck-five-causes` | `/blog/why-your-ftp-is-stuck-five-causes` | Blog | MODERATE — "FTP stuck" is a plateau variant |
| `mid-season-fitness-reset-cycling-guide` | `/blog/mid-season-fitness-reset-cycling-guide` | Blog | LOW — seasonal angle differentiates |

### Missing Elements vs Audit Template

- **Expert reviewer:** No `reviewedBy`
- **Cited claims table:** No CitedClaimTable
- **No topic hub:** Plateaus have no dedicated `/topics/` page — content is scattered under `cycling-coaching` and `ftp-training` hubs
- **Direct answer:** Has keyTakeaways but no `answerCapsule`

### Improvement Priority: 2

The plateau cluster needs a topic hub page created, or this blog post needs to be elevated to pillar status with a reviewer, answerCapsule, and cited claims. The diagnostic funnel `/plateau` should stay as the commercial page, not the informational canonical.

---

## 4. Performance Nutrition

### Recommended Canonical: `/topics/cycling-nutrition`

**URL:** `https://roadmancycling.com/topics/cycling-nutrition`
**File:** `src/lib/topics.ts` (slug: `cycling-nutrition`) + `content/topics/cycling-nutrition.mdx` (pillar content) + `src/app/(content)/topics/[slug]/page.tsx` (dynamic route)
**Title:** "Cycling Nutrition — The Complete Evidence-Based Guide"

### Why This Page

The `/topics/cycling-nutrition` hub has a comprehensive pillar content MDX covering daily fuelling, in-ride nutrition, recovery nutrition, race weight, hydration, and common mistakes. It opens with a direct answer paragraph ("Aim for 60-90g of carbohydrate per hour on rides over 90 minutes..."). The topic definition maps 80+ blog posts — the largest topic cluster on the site. No single blog post covers the full nutrition landscape; they're all sub-topic specific (gels, hydration, race-day, protein, etc.). The hub is the only page that ties them all together.

### Competing Pages

| Slug | URL | Type | Risk |
|------|-----|------|------|
| `cycling-nutrition-race-day-guide` | `/blog/cycling-nutrition-race-day-guide` | Blog | LOW — race-day specific |
| `supplements-cyclists-what-works-guide` | `/blog/supplements-cyclists-what-works-guide` | Blog (~6,254 words) | LOW — supplements specific |
| `fuelling-self-assessment-cycling-nutrition-guide` | `/blog/fuelling-self-assessment-cycling-nutrition-guide` | Blog (~5,640 words) | MODERATE — broad fuelling assessment |
| `protein-for-cyclists-complete-guide` | `/blog/protein-for-cyclists-complete-guide` | Blog (~5,244 words) | LOW — protein specific |
| `cycling-periodised-nutrition-guide` | `/blog/cycling-periodised-nutrition-guide` | Blog (~4,296 words) | MODERATE — periodised nutrition is broad |
| `/nutrition/masters` | `/nutrition/masters` | Cluster hub | LOW — masters nutrition sub-cluster |
| `sam-impey-fuelling-carbs-per-hour-world-tour` | `/blog/sam-impey-fuelling-carbs-per-hour-world-tour` | Blog | LOW — episode recap, specific angle |

### Missing Elements vs Audit Template

- **Expert reviewer:** No `reviewedBy` on the topic hub or pillar content — despite nutrition being the one area where credentialed review matters most
- **Cited claims table:** No CitedClaimTable — the pillar has a macro table but no evidence-level citations
- **Decision framework:** Has practical baselines but no structured "which approach for which rider" framework

### Improvement Priority: 1 (Highest)

Nutrition is a massive search cluster and the pillar content is strong but lacks the credibility signals (reviewer, citations) that would make it authoritative vs competitors like Precision Fuel & Hydration or British Cycling.

---

## 5. Strength and Longevity

### Recommended Canonical: `/topics/cycling-strength-conditioning`

**URL:** `https://roadmancycling.com/topics/cycling-strength-conditioning`
**File:** `src/lib/topics.ts` (slug: `cycling-strength-conditioning`) + `content/topics/cycling-strength-conditioning.mdx` (pillar content) + `src/app/(content)/topics/[slug]/page.tsx` (dynamic route)
**Title:** "Strength Training for Cyclists — The Complete Guide"

### Why This Page

The pillar content MDX covers why cyclists need strength, the core programme (heavy compounds), programming alongside riding, strength for masters (40+, 50+), mobility, and common mistakes. It cites the 2024 PLOS ONE study on heavy lifting in masters cyclists. The topic definition targets 13 keywords including "strength training for cyclists" and "strength training for cyclists over 40". The hub links to 16+ blog posts and routes to the commercial `/strength-training` product page. The `/strength-training` page itself is a sales page for a 12-week S&C plan product — wrong as the informational canonical.

### Competing Pages

| Slug | URL | Type | Risk |
|------|-----|------|------|
| `/strength-training` | `/strength-training` | Product page | LOW — commercial, different intent |
| `strength-training-cyclists-over-40-what-works` | `/blog/strength-training-cyclists-over-40-what-works` | Blog (186 lines) | HIGH — targets same "strength training cyclists over 40" |
| `new-study-confirms-heavy-strength-training-beats-more-miles-after-40` | `/blog/new-study-confirms-heavy-strength-training-beats-more-miles-after-40` | Blog (190 lines) | HIGH — research angle, same query |
| `strength-training-cyclists-over-50` | `/blog/strength-training-cyclists-over-50` | Blog (253 lines) | MODERATE — age-band differentiated |
| `cycling-strength-training-what-transfers-guide` | `/blog/cycling-strength-training-what-transfers-guide` | Blog (~4,252 words) | MODERATE — "what transfers" sub-topic |
| `cycling-strength-training-year-round-plan-guide` | `/blog/cycling-strength-training-year-round-plan-guide` | Blog (~3,663 words) | MODERATE — year-round plan sub-topic |
| `strength-training-for-triathletes-bike-specific` | `/blog/strength-training-for-triathletes-bike-specific` | Blog | LOW — triathlon-specific |

### Missing Elements vs Audit Template

- **Expert reviewer:** No `reviewedBy`
- **Cited claims table:** No CitedClaimTable — the PLOS ONE study is mentioned in prose but not in a structured evidence table
- **answerCapsule equivalent:** The opening paragraph is a strong direct answer but not tagged
- **Note:** The pillar content references "squats, deadlifts, hip hinges, presses" — verify this aligns with the memory note about not prescribing heavy compound lifts (deadlifts/squats/barbell rows) for the 35-55 audience

### Improvement Priority: 2

The topic hub is structurally solid. The main gap is credibility signals (reviewer, evidence table). The competing blog posts in the masters sub-cluster need GSC data to resolve.

---

## 6. Sportive/Event Preparation

### Recommended Canonical: `/topics/race-preparation`

**URL:** `https://roadmancycling.com/topics/race-preparation`
**File:** `src/lib/topics.ts` (slug: `race-preparation`) + `content/topics/race-preparation.mdx` (pillar content) + `src/app/(content)/topics/[slug]/page.tsx` (dynamic route)
**Title:** "Race Preparation — Tapering, Pacing & Race-Day Execution"

### Why This Page

The pillar content MDX covers tapering (with a structured volume-reduction table), race-week nutrition (48-hour protocol), race-morning fuelling, pacing strategy, warm-up, race-day checklist, and expert references. It targets "cycling race preparation", "sportive preparation", and "cycling taper guide". The hub aggregates blog posts for specific sportive training plans (Etape, Wicklow 200, Fred Whitton, Ride London, Marmotte, etc.) plus general race-prep content. The `/event-prep` page exists as a commercial landing page routing to coaching — different intent. The `/coaching/sportives` page is a coaching segment page.

### Competing Pages

| Slug | URL | Type | Risk |
|------|-----|------|------|
| `/event-prep` | `/event-prep` | Marketing hub (~50+ lines visible) | MODERATE — targets "cycling event prep" commercially |
| `/coaching/sportives` | `/coaching/sportives` | Coaching segment | LOW — commercial, different intent |
| `cycling-tapering-guide` | `/blog/cycling-tapering-guide` | Blog (~1,598 words, has `reviewedBy`) | MODERATE — taper-specific, only reviewed post in this cluster |
| `cycling-tapering-for-events-guide` | `/blog/cycling-tapering-for-events-guide` | Blog (~4,415 words) | MODERATE — broader tapering guide |
| `race-day-checklist-cycling-complete-guide` | `/blog/race-day-checklist-cycling-complete-guide` | Blog (~4,072 words) | LOW — checklist-specific sub-topic |
| `cycling-taper-race-preparation-system` | `/blog/cycling-taper-race-preparation-system` | Blog | MODERATE — "race preparation system" overlaps |
| `race-day-fuelling-24-hour-timeline` | `/blog/race-day-fuelling-24-hour-timeline` | Blog | LOW — fuelling-specific |
| `etape-du-tour-training-plan` | `/blog/etape-du-tour-training-plan` | Blog | LOW — event-specific |
| Various sportive training plans | `/blog/{event}-training-plan` | Blogs (10+) | LOW — event-specific, differentiated |

### Missing Elements vs Audit Template

- **Expert reviewer:** No `reviewedBy` on the topic hub (the `cycling-tapering-guide` blog post has one)
- **Cited claims table:** No CitedClaimTable
- **Decision framework:** Has a taper table but no "which approach for which event type" framework
- **answerCapsule:** The opening paragraph is a strong direct answer but not tagged for extraction

### Improvement Priority: 2

The content is comprehensive but spread across many event-specific posts. The topic hub needs the reviewer and evidence table. The competing `/event-prep` page should be clearly positioned as the commercial funnel, with the topic hub as the informational canonical.

---

## 7. Running for Cyclists

### Recommended Canonical: `/topics/running-for-cyclists`

**URL:** `https://roadmancycling.com/topics/running-for-cyclists`
**File:** `src/lib/topics.ts` (slug: `running-for-cyclists`) + `content/topics/running-for-cyclists.mdx` (pillar content, 102 lines) + `src/app/(content)/topics/[slug]/page.tsx` (dynamic route)
**Title:** "Running for Cyclists"

### Why This Page

The pillar content MDX is the strongest single resource on running for cyclists. It covers why cyclists should run (bone density, time efficiency, fitness insurance), the science of fitness transfer (citing a 2026 systematic review), the "trained engine, untrained chassis" problem, walk-run build protocols, Zone 2 heart rate differences, injury prevention (5 key injuries), when to run (off-season, time-crunched, travel), pro examples, and equipment. It links to the Run-Ride Converter tool and a 7-post deep-dive series. The topic also has a companion hub (`cycling-for-runners`) for the reverse direction. The `/topics/running-for-cyclists` aggregates 23+ blog posts.

### Competing Pages

| Slug | URL | Type | Risk |
|------|-----|------|------|
| `running-plan-cyclists-first-5k` | `/blog/running-plan-cyclists-first-5k` | Blog | MODERATE — beginner plan angle |
| `running-cycling-crossover-training-guide` | `/blog/running-cycling-crossover-training-guide` | Blog | MODERATE — "crossover" targets same cluster |
| `hybrid-athlete-over-40-run-ride-lift` | `/blog/hybrid-athlete-over-40-run-ride-lift` | Blog (211 lines) | MODERATE — multi-sport, 40+ overlap with masters |
| `fuelling-running-vs-cycling-differences` | `/blog/fuelling-running-vs-cycling-differences` | Blog | LOW — nutrition sub-topic |
| `trail-running-cyclists-guide` | `/blog/trail-running-cyclists-guide` | Blog | LOW — trail-specific |
| `running-cycling-conversion-calculator` | `/blog/running-cycling-conversion-calculator` | Blog | LOW — calculator companion |
| `running-injury-prevention-cyclists` | `/blog/running-injury-prevention-cyclists` | Blog | LOW — injury sub-topic |
| `running-shoes-guide-cyclists` | `/blog/running-shoes-guide-cyclists` | Blog | LOW — gear sub-topic |
| `/topics/cycling-for-runners` | `/topics/cycling-for-runners` | Topic hub (reverse direction) | LOW — different audience intent |

### Missing Elements vs Audit Template

- **Expert reviewer:** No `reviewedBy`
- **Cited claims table:** No CitedClaimTable — the 2026 systematic review is cited in prose but not in a structured table
- **Decision framework:** No structured "when to add running" decision matrix
- **FAQs on the pillar content:** The pillar MDX file has no YAML frontmatter or FAQ section (FAQs would come from the topic definition in topics.ts)

### Improvement Priority: 2

The content is strong and well-structured. The gap is entirely in credibility signals (reviewer, evidence table) and structured data for AI extraction. The bone density statistic (84% of competitive cyclists meet osteopenia/osteoporosis criteria) is a strong proprietary-feeling claim that would benefit from a cited claims table.

---

## 8. Triathlon for Cyclists

### Recommended Canonical: `/topics/triathlon-cycling`

**URL:** `https://roadmancycling.com/topics/triathlon-cycling`
**File:** `src/lib/topics.ts` (slug: `triathlon-cycling`) + `content/topics/triathlon-cycling.mdx` (pillar content, 173 lines) + `src/app/(content)/topics/[slug]/page.tsx` (dynamic route)
**Title:** "Cycling for Triathletes — The Bike Leg Specialist"

### Why This Page

The triathlon pillar content is the deepest topic MDX at 173 lines. It covers the bike-for-the-run mindset, triathlon-specific FTP and pacing (with structured tables for Ironman and 70.3 targets), aero position, in-ride nutrition for racing, brick workouts, off-season training, and common mistakes. It opens with a direct answer paragraph. The hub aggregates 20+ blog posts and routes to `/coaching/triathletes`. The site's triathlon content is comprehensive: 70.3 plan, Ironman plan, half-Ironman pacing, brick workouts, triathlon nutrition, aero position, and named-expert content (Olav Bu, Alistair Brownlee, Ben Hoffman).

### Competing Pages

| Slug | URL | Type | Risk |
|------|-----|------|------|
| `triathlon-cycling-training-plan` | `/blog/triathlon-cycling-training-plan` | Blog | MODERATE — "triathlon cycling training plan" is a high-value sub-query |
| `bike-leg-of-triathlon-why-age-groupers-get-it-wrong` | `/blog/bike-leg-of-triathlon-why-age-groupers-get-it-wrong` | Blog (183 lines) | MODERATE — "bike leg triathlon" is a distinct intent |
| `70-3-bike-training-plan-12-weeks` | `/blog/70-3-bike-training-plan-12-weeks` | Blog | LOW — event-specific |
| `ironman-bike-training-plan-16-weeks` | `/blog/ironman-bike-training-plan-16-weeks` | Blog | LOW — event-specific |
| `how-to-pace-the-bike-in-a-half-ironman` | `/blog/how-to-pace-the-bike-in-a-half-ironman` | Blog | LOW — pacing-specific |
| `triathlon-bike-nutrition-strategy` | `/blog/triathlon-bike-nutrition-strategy` | Blog | LOW — nutrition sub-topic |
| `triathlon-aero-position-guide` | `/blog/triathlon-aero-position-guide` | Blog | LOW — aero sub-topic |
| `brick-workouts-for-ironman` | `/blog/brick-workouts-for-ironman` | Blog | LOW — brick-specific |
| `olav-bu-triathlon-training-plan-design` | `/blog/olav-bu-triathlon-training-plan-design` | Blog | LOW — episode recap |

### Missing Elements vs Audit Template

- **Expert reviewer:** No `reviewedBy`
- **Cited claims table:** No CitedClaimTable — pacing percentages are stated without evidence-level attribution
- **Decision framework:** The pacing tables serve as a decision framework, but no "which plan for which race distance" structured matrix exists

### Improvement Priority: 2

The content is comprehensive and well-structured with useful pacing tables. The main gap is credibility signals. The triathlon cluster is well-differentiated from the general cycling content, with low cannibalisation risk between sub-topics.

---

## 9. Endurance Technology

### Recommended Canonical: `/topics/cycling-tech`

**URL:** `https://roadmancycling.com/topics/cycling-tech`
**File:** `src/lib/topics.ts` (slug: `cycling-tech`) + `content/topics/cycling-tech.mdx` (pillar content, ~72 lines) + `src/app/(content)/topics/[slug]/page.tsx` (dynamic route)
**Title:** "Cycling Tech & GPS — Bike Computers, Watches & Power Meters"

### Why This Page

The pillar content MDX covers why data matters, bike computer vs GPS watch, key metrics to track (power, cadence, HR), and links to the full comparison posts. It targets "cycling tech", "best cycling computers 2026", "wahoo vs garmin", and "cycling metrics explained". Three adjacent topic hubs exist (`indoor-training`, `power-meter-training`) that could compete, but `cycling-tech` is the broadest umbrella. The pillar content is readable and opinionated (Anthony's voice comes through), which helps it compete against spec-list content from DC Rainmaker or GCN.

### Competing Pages

| Slug | URL | Type | Risk |
|------|-----|------|------|
| `/topics/power-meter-training` | `/topics/power-meter-training` | Topic hub | MODERATE — "power meter" is a sub-cluster of tech |
| `/topics/indoor-training` | `/topics/indoor-training` | Topic hub | MODERATE — "indoor training" includes Zwift/TrainerRoad tech |
| `cycling-metrics-explained` | `/blog/cycling-metrics-explained` | Blog | MODERATE — "cycling metrics" overlaps with tech |
| `best-cycling-computers-2026` | `/blog/best-cycling-computers-2026` | Blog | LOW — product roundup, different intent |
| `wahoo-vs-garmin-cycling-computers` | `/blog/wahoo-vs-garmin-cycling-computers` | Blog | LOW — comparison, different intent |
| `zwift-vs-trainerroad` | `/blog/zwift-vs-trainerroad` | Blog | LOW — platform comparison |
| `power-meter-vs-smart-trainer` | `/blog/power-meter-vs-smart-trainer` | Blog | LOW — hardware comparison |
| `gps-watches-cycling-running-guide` | `/blog/gps-watches-cycling-running-guide` | Blog | MODERATE — "GPS watches cycling" targets tech cluster |
| `reading-your-training-data-tss-ctl-atl-tsb` | `/blog/reading-your-training-data-tss-ctl-atl-tsb` | Blog | LOW — data-specific |

### Missing Elements vs Audit Template

- **Expert reviewer:** No `reviewedBy`
- **Cited claims table:** No CitedClaimTable — opinions on gear are not evidence-graded
- **Decision framework:** The "bike computer vs GPS watch" section functions as a decision framework but is not structured as a formal component
- **Pillar depth:** At ~72 lines the pillar content is the thinnest of all the topic hubs — it needs substantially more content to compete for "cycling tech" as a head term
- **answerCapsule:** No direct answer paragraph

### Improvement Priority: 3

The tech cluster is the least competitive for Roadman (DC Rainmaker, GCN Tech, and CyclingTips dominate product reviews). The site's angle should be "which data matters for training" rather than competing on spec sheets. The pillar content needs expanding, but this is lower priority than clusters 1-4.

---

## 10. Watches and Endurance Culture

### Recommended Canonical: `/topics/against-the-clock`

**URL:** `https://roadmancycling.com/topics/against-the-clock`
**File:** `src/lib/topics.ts` (slug: `against-the-clock`) + `content/topics/against-the-clock.mdx` (pillar content, 27 lines) + `src/app/(content)/topics/[slug]/page.tsx` (dynamic route)
**Title:** "Against the Clock: Cycling and the Race Against Time"

### Why This Page

The `/topics/against-the-clock` hub is the home for cycling's relationship with time — the Hour Record, the time trial, and the watches that ended up on the wrist. It aggregates 18+ blog posts covering individual watch brands (Tudor, Omega, Richard Mille, Breitling, Casio, Bravur, Rolex) and cycling-time stories (Dan Bigham, Ryan Collins, Alex Dowsett). It has a companion commercial route (`/against-the-clock/partner/` for watch brand partnership inquiries). The flagship blog post `against-the-clock-cycling-watches` (which has answerCapsule, keyTakeaways, and FAQs) is the strongest individual piece but functions better as the pillar post linked from the hub than as the canonical itself.

### Competing Pages

| Slug | URL | Type | Risk |
|------|-----|------|------|
| `against-the-clock-cycling-watches` | `/blog/against-the-clock-cycling-watches` | Blog (flagship feature) | HIGH — the strongest individual content piece, with answerCapsule and FAQs; could be the canonical if the hub stays thin |
| `tudor-pro-cycling-tour-de-france-2026` | `/blog/tudor-pro-cycling-tour-de-france-2026` | Blog | LOW — Tudor-specific |
| `tudor-bumblebee-watches-tour-de-france` | `/blog/tudor-bumblebee-watches-tour-de-france` | Blog | LOW — Tudor model-specific |
| `richard-mille-cycling-watches-modern-peloton` | `/blog/richard-mille-cycling-watches-modern-peloton` | Blog | LOW — RM-specific |
| `rolex-cycling-great-absence-tudor` | `/blog/rolex-cycling-great-absence-tudor` | Blog | LOW — Rolex-specific |
| `omega-olympic-timing-track-cycling-hour-record` | `/blog/omega-olympic-timing-track-cycling-hour-record` | Blog | LOW — Omega-specific |
| `breitling-top-time-eddy-merckx-cycling-watch` | `/blog/breitling-top-time-eddy-merckx-cycling-watch` | Blog | LOW — Breitling-specific |
| `breitling-top-time-coppi-bartali-cycling-rivalry` | `/blog/breitling-top-time-coppi-bartali-cycling-rivalry` | Blog | LOW — Breitling-specific |
| `casio-f91w-ten-mile-time-trial-cycling` | `/blog/casio-f91w-ten-mile-time-trial-cycling` | Blog | LOW — Casio culture piece |
| `bravur-zwift-collaboration-watch` | `/blog/bravur-zwift-collaboration-watch` | Blog | LOW — Bravur-specific |
| `/against-the-clock/partner` | `/against-the-clock/partner` | Partnership page | LOW — commercial, different intent |

### Missing Elements vs Audit Template

- **Pillar depth:** At 27 lines the pillar content is extremely thin — just an intro paragraph, a divider, and FAQ section. This is the thinnest pillar on the entire site.
- **Expert reviewer:** No `reviewedBy`
- **Cited claims table:** No CitedClaimTable
- **Decision framework:** No structured framework
- **answerCapsule:** The flagship blog post has one, but the hub does not
- **Content gap:** The hub needs substantial editorial content to justify being the canonical over the `against-the-clock-cycling-watches` blog post

### Improvement Priority: 2

**Important note:** The topic hub at 27 lines is too thin to function as a real canonical. Two options: (a) expand the pillar content MDX to 1,500-2,000 words covering the Hour Record narrative, the time trial tradition, and the watches chapter — drawing from the flagship blog post's structure; or (b) make `/blog/against-the-clock-cycling-watches` the canonical and use the topic hub purely as an aggregation page. Option (a) is better long-term because the topic hub has CollectionPage schema and aggregates all the individual watch/time pieces.

---

## Summary Table

| # | Cluster | Canonical URL | Page Type | Priority | Key Gap |
|---|---------|--------------|-----------|----------|---------|
| 1 | Masters cycling performance | `/masters` | Authority hub | **1** | No reviewedBy, no CitedClaimTable, no answerCapsule |
| 2 | Cycling coaching | `/topics/cycling-coaching` | Topic hub | **1** | No reviewedBy, no CitedClaimTable, no decision framework |
| 3 | Cycling plateaus | `/blog/cycling-training-plateaus-how-to-break-through-guide` | Blog post | **2** | No topic hub, no reviewedBy, no answerCapsule |
| 4 | Performance nutrition | `/topics/cycling-nutrition` | Topic hub | **1** | No reviewedBy, no CitedClaimTable |
| 5 | Strength and longevity | `/topics/cycling-strength-conditioning` | Topic hub | **2** | No reviewedBy, no CitedClaimTable |
| 6 | Sportive/event prep | `/topics/race-preparation` | Topic hub | **2** | No reviewedBy, no CitedClaimTable |
| 7 | Running for cyclists | `/topics/running-for-cyclists` | Topic hub | **2** | No reviewedBy, no CitedClaimTable |
| 8 | Triathlon for cyclists | `/topics/triathlon-cycling` | Topic hub | **2** | No reviewedBy, no CitedClaimTable |
| 9 | Endurance technology | `/topics/cycling-tech` | Topic hub | **3** | Thin pillar (72 lines), no reviewedBy |
| 10 | Watches & endurance culture | `/topics/against-the-clock` | Topic hub | **2** | Extremely thin pillar (27 lines), needs major expansion |

## Cross-Cutting Findings

1. **No topic hub has `reviewedBy`.** This is the single most consistent gap across all 10 clusters. The only blog posts with reviewedBy are `masters-cycling-training-report-2026` and `cycling-tapering-guide`. Adding a reviewer to the 10 canonical pages is the highest-leverage single improvement.

2. **No topic hub has a CitedClaimTable.** The component exists (imported in the topic hub page.tsx) and the `TopicHub` interface supports `citedClaims`, but no topic is currently using it. Populating cited claims for the 3 Priority-1 clusters (masters, coaching, nutrition) would be the second-highest-leverage improvement.

3. **The `/masters` hub and the topic hubs serve different architectural roles.** The `/masters` page is a bespoke authority page with custom layout, editorial sections, and testimonials. The `/topics/*` pages are generated from a shared template with pillar content MDX. For cluster 1, the bespoke hub is the right canonical. For clusters 2-10, the topic hub template is the right canonical because it already has CollectionPage schema, FAQ accordion, and the pillar content slot.

4. **Cluster 3 (Plateaus) is the only cluster without a topic hub.** Creating a `plateaus` or `cycling-plateaus` topic definition in `topics.ts` with a pillar content MDX would bring it in line with the other clusters.

5. **Two pillar content files are critically thin:** `against-the-clock.mdx` (27 lines) and `cycling-tech.mdx` (~72 lines). Both need substantial expansion to function as real canonical content.

6. **The cannibalisation risk is concentrated in cluster 1 (Masters).** The cannibalisation map identifies 7+ pages competing for "cycling over 40" variants. Clusters 2-10 have much cleaner separation between the canonical and supporting pages.
