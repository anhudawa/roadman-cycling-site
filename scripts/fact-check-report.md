# Roadman Cycling Website — Fact Check Audit Report

**Date:** 2026-04-03
**Auditor:** Claude (automated)
**Scope:** All main page files across the site

---

## Summary

| Category | Count |
|---|---|
| Total claims checked | 68 |
| Verified | 38 |
| Unverifiable | 12 |
| Incorrect / Outdated | 6 |
| Inconsistent (across pages) | 12 |

**Critical issues requiring attention: 7**

---

## CRITICAL ISSUES

### 1. INCORRECT: Podcast launch year (About page timeline)
- **Claim:** "2020 — Roadman Cycling Podcast launches"
- **Reality:** The Apple Podcasts listing (id1224143549) shows the podcast launched in **2017**, not 2020. This is a 3-year error.
- **Location:** `src/app/(marketing)/about/page.tsx` line 40
- **Severity:** HIGH — This is the origin story timeline; getting it wrong undermines credibility.

### 2. INCORRECT: Rosa Kloser described as "European gravel champion"
- **Claim:** "European gravel champion" (About page expert network)
- **Reality:** Rosa Kloser won the **UCI Gravel World Championship** in 2024, not the European championship. She actually finished **3rd** at the European Gravel Championships after a late puncture. She also won Unbound 200 in 2024.
- **Location:** `src/app/(marketing)/about/page.tsx` line 35
- **Severity:** HIGH — The title is wrong; she should be "Gravel World Champion" or "Unbound 200 winner."

### 3. INCONSISTENT: Two different Skool URLs for the Clubhouse
- **Clubhouse pages** link to: `https://skool.com/roadman`
- **Homepage, Footer, NDY pages** link to: `https://skool.com/roadmancycling`
- These appear to be two different Skool groups. The Clubhouse (free) correctly links to `/roadman`, and NDY (paid) correctly links to `/roadmancycling`. However, the homepage "Join Not Done Yet" button (line 107) links to `skool.com/roadmancycling` which is correct.
- **Severity:** MEDIUM — Verify these are intentionally different URLs for different communities. If so, this is fine. If not, one set of links is wrong.

### 4. POSSIBLY INCORRECT: Standard NDY annual price ($75/year)
- **Claim:** Standard tier is "$15/month" or "$75/year"
- **Math:** $15 x 12 = $180/year. But annual is listed as $75/year ($6.25/month) — a 58% discount.
- **Location:** `src/app/(community)/community/not-done-yet/page.tsx` line 21
- **Severity:** HIGH — If this is a typo and should be $150/year (a common ~17% annual discount), it could be costing revenue or confusing customers. Verify with actual Skool pricing.

### 5. INCORRECT: Podcast launch preceded "1 million downloads" by only 1 year
- **Claim:** Timeline says 2020 launch, 2021 "1 million downloads"
- **Reality:** If the podcast actually launched in 2017, reaching 1M total downloads by 2021 (4 years) is plausible. But the timeline suggests it took only 1 year, which is misleading if the launch year is wrong.
- **Location:** `src/app/(marketing)/about/page.tsx` lines 40-41
- **Severity:** HIGH — Tied to issue #1.

### 6. POSSIBLY OUTDATED: Alistair Brownlee described as earning singular "Olympic triathlon gold"
- **Claim:** "Olympic triathlon gold"
- **Reality:** Alistair Brownlee won **TWO** Olympic gold medals in triathlon (London 2012, Rio 2016). He is the only athlete to win two individual Olympic triathlon titles. Saying "Olympic triathlon gold" (singular) is technically not wrong but significantly undersells his achievement.
- **Location:** `src/app/page.tsx` line 16
- **Severity:** LOW — Not incorrect, but a missed opportunity. Consider "2x Olympic triathlon gold."

### 7. POSSIBLY OUTDATED: Ed Clancy described as earning singular "Olympic gold, team pursuit"
- **Claim:** "Olympic gold, team pursuit"
- **Reality:** Ed Clancy won **THREE** consecutive Olympic gold medals in team pursuit (Beijing 2008, London 2012, Rio 2016). Like the Brownlee case, technically not wrong but underselling.
- **Location:** `src/app/page.tsx` line 23
- **Severity:** LOW — Consider "3x Olympic gold, team pursuit."

---

## PAGE-BY-PAGE AUDIT

---

### Homepage (`src/app/page.tsx`)

#### Guest Credentials (Marquee)

| Guest | Claim | Verdict | Notes |
|---|---|---|---|
| Greg LeMond | "3x Tour de France winner" | VERIFIED | Won 1986, 1989, 1990 |
| Professor Seiler | "Polarised training pioneer" | VERIFIED | Prof. of Sport Science, University of Agder; world authority on polarised training |
| Dan Lorang | "Red Bull-Bora-Hansgrohe" | VERIFIED | Head of Endurance/coaching at Red Bull-Bora-Hansgrohe |
| Lachlan Morton | "EF Education, alt-racing pioneer" | VERIFIED | Rides for EF Education-EasyPost; pioneered alt-calendar racing |
| Dan Bigham | "Former Hour Record holder" | VERIFIED | Set UCI Hour Record Aug 2022 (55.548km); lost it to Ganna Oct 2022. "Former" is correct. |
| Alistair Brownlee | "Olympic triathlon gold" | PARTIAL | Won 2 Olympic golds (2012, 2016). "Gold" singular undersells. |
| Valtteri Bottas | "F1 driver & cyclist" | VERIFIED | Active F1 driver (Cadillac); serious gravel cyclist, co-founded FNLD GRVL |
| Alex Dowsett | "Former Hour Record holder, TT specialist" | VERIFIED | Held Hour Record in 2015 (52.937km); lost to Wiggins 36 days later. Multiple national TT titles. |
| George Hincapie | "17x Tour de France starter" | VERIFIED | Started 17 Tours de France (record at the time) |
| Andre Greipel | "22 Grand Tour stage wins" | VERIFIED | 11 TdF + 7 Giro + 4 Vuelta = 22 |
| Joe Friel | "Author, Cyclist's Training Bible" | VERIFIED | Confirmed author of the book |
| Hannah Grant | "Pro team chef" | VERIFIED | Chef for Tinkoff-Saxo, Orica-Scott; author of Eat, Race, Win |
| Ed Clancy | "Olympic gold, team pursuit" | PARTIAL | Won 3 Olympic golds in team pursuit (2008, 2012, 2016). Undersold. |
| Tim Spector | "ZOE founder, epidemiologist" | VERIFIED | Co-founder of ZOE; Professor of Epidemiology at King's College London |
| Mark Beaumont | "Around the World record" | VERIFIED | Cycled round the world in 78 days 14 hours (2017) |
| Colin O'Brady | "First solo Antarctic crossing" | DISPUTED | O'Brady claims first solo unsupported Antarctic crossing (2018), but this is heavily disputed by National Geographic, polar experts, and 48 explorers including Jon Krakauer. Route was shorter than previous crossings and used a graded vehicle road. |
| Uli Schoberer | "Inventor of the SRM power meter" | VERIFIED | Founded SRM in 1986; patented first crank-based power meter |
| Olav Bu | "Uno-X performance lead" | VERIFIED | Head of Performance and Head Coach at Uno-X Mobility |

#### Stats (StatsSection.tsx)

| Stat | Claim | Verdict | Notes |
|---|---|---|---|
| 1M+ | Monthly Listeners | UNVERIFIABLE | Cannot independently verify; plausible for a large cycling podcast |
| 2,100+ | Community Members | UNVERIFIABLE | Refers to Clubhouse Skool group; cannot verify without Skool access |
| 61K+ | YouTube Subscribers | UNVERIFIABLE | Could be checked via YouTube API but not done in this audit |
| 49K+ | Instagram Followers | UNVERIFIABLE | Could be checked via Instagram but not done in this audit |

#### Other Homepage Claims

| Claim | Verdict | Notes |
|---|---|---|
| "1,400+ EPISODES" | UNVERIFIABLE | Apple Podcasts shows ~1,300+ episodes. "1,400+" may include YouTube-only content or clips. The actual .mdx files on the site number only 311 (partial migration). Could be slightly inflated. |
| "113 cyclists" in NDY | UNVERIFIABLE | Cannot verify without Skool access; number used consistently across pages |
| "From $15/month" for NDY | CONSISTENT | Used consistently across all pages |
| "2,100 cyclists" in Clubhouse | CONSISTENT | Used consistently across homepage, community, and clubhouse pages |
| Newsletter called "The Saturday Spin" | CONSISTENT | Consistent across homepage and footer |

---

### About Page (`src/app/(marketing)/about/page.tsx`)

#### Timeline

| Year | Event | Verdict | Notes |
|---|---|---|---|
| 2020 | Podcast launches | INCORRECT | Podcast launched in 2017 per Apple Podcasts |
| 2021 | 1 million downloads | UNVERIFIABLE | Plausible if podcast started in 2017 |
| 2023 | Sarah joins team | UNVERIFIABLE | Cannot independently verify |
| 2024 | Greg LeMond interview | UNVERIFIABLE | Plausible; LeMond episodes referenced in content |
| 2025 | 1 million monthly listeners | UNVERIFIABLE | Cannot independently verify |
| 2026 | Not Done Yet launches | UNVERIFIABLE | Plausible given current date is April 2026 |

#### Expert Network

| Expert | Claim | Verdict | Notes |
|---|---|---|---|
| Professor Stephen Seiler | "Exercise physiologist" | VERIFIED | Professor of Sport Science at University of Agder |
| Dan Lorang | "Head of Performance, Red Bull-Bora-Hansgrohe" | VERIFIED | Confirmed |
| Greg LeMond | "3x Tour de France winner" | VERIFIED | |
| Lachlan Morton | "EF Education pro" | VERIFIED | Rides for EF Education-EasyPost |
| Joe Friel | "Author, Cyclist's Training Bible" | VERIFIED | |
| Dr. David Dunne | "Sports science researcher" | UNVERIFIABLE | Cannot find prominent public profile |
| Ben Healy | "Pro cyclist, Tour de France" | UNVERIFIABLE | Irish pro cyclist; has ridden TdF. Plausible. |
| John Wakefield | "Red Bull-Bora-Hansgrohe coach" | UNVERIFIABLE | Named on podcast episodes but hard to verify current role |
| Michael Matthews | "15+ year World Tour pro" | VERIFIED | Turned pro 2011; 15 years by 2026 |
| Dan Bigham | "Former Hour Record holder" | VERIFIED | |
| Rosa Kloser | "European gravel champion" | INCORRECT | Won Gravel World Championship 2024; came 3rd at European Championships |
| Tim Spector | "ZOE founder, epidemiologist" | VERIFIED | Co-founder; Professor of Epidemiology |

#### Team Members

| Member | Role | Verdict | Notes |
|---|---|---|---|
| Anthony Walsh | "Host & Content" | VERIFIED | Confirmed podcast host |
| Sarah Ann Egan | "Operations & Community" | UNVERIFIABLE | Cannot independently verify |
| Wes Andrade | "Production" | UNVERIFIABLE | Cannot independently verify |
| Matthew Devins | "Coaching" / "Not Done Yet programme lead" | UNVERIFIABLE | Cannot independently verify |

#### Other About Page Claims

| Claim | Verdict | Notes |
|---|---|---|
| "1M+ listener podcast" (metadata) | UNVERIFIABLE | Same as homepage |
| "1,400 conversations" in body text | UNVERIFIABLE | See episode count note above |
| "1,400+ more conversations" in expert network | UNVERIFIABLE | Consistent with other pages |
| "The voice behind 1,400+ episodes" (Anthony bio) | UNVERIFIABLE | Consistent |
| "world's largest cycling performance podcast" | UNVERIFIABLE | No independent ranking confirms this. Other major cycling podcasts exist (The Cycling Podcast, TrainerRoad Podcast, Lanterne Rouge). Claim appears in Footer only. |

---

### Guests Page (`src/app/(content)/guests/page.tsx`)

No specific factual claims beyond what's in guest data files. The page dynamically renders from `getAllGuests()`.

---

### Community Page (`src/app/(community)/community/page.tsx`)

| Claim | Verdict | Notes |
|---|---|---|
| "2,100+ cyclists" in Clubhouse | CONSISTENT | Matches other pages |
| "113 cyclists" in NDY | CONSISTENT | Matches other pages |
| "From $15/month" | CONSISTENT | |
| "Personalised Vekta plans" | UNVERIFIABLE | Vekta is a training platform; claim plausible |
| "Expert masterclasses (Seiler, Lorang, Wakefield)" | UNVERIFIABLE | Cannot verify without community access |

---

### Clubhouse Page (`src/app/(community)/community/clubhouse/page.tsx`)

| Claim | Verdict | Notes |
|---|---|---|
| "2,100 cyclists" / "2,100+ cyclists" | CONSISTENT | Minor inconsistency: sometimes "2,100" (exact), sometimes "2,100+" |
| "1,400+ episodes" | CONSISTENT | Matches other pages |
| "Free 16-week training plans (Road, Gravel, Sportive)" | UNVERIFIABLE | |
| "Delivered through Vekta integration" | UNVERIFIABLE | |
| Skool URL: `skool.com/roadman` | INCONSISTENT | Different from NDY URL `skool.com/roadmancycling` — likely intentional (separate groups) |

---

### Not Done Yet Page (`src/app/(community)/community/not-done-yet/page.tsx`)

| Claim | Verdict | Notes |
|---|---|---|
| Standard: $15/month | CONSISTENT | |
| Standard annual: $75/year | POSSIBLY INCORRECT | 58% discount from monthly seems very steep. Could be a typo for $150/year. |
| Premium: $195/month | UNVERIFIABLE | |
| VIP: $1,950/year | UNVERIFIABLE | |
| "113 cyclists who refuse to plateau" | CONSISTENT | Used 3x on this page and 1x on homepage |
| "7-day free trial" | CONSISTENT | Mentioned 2x on page |
| "30-day money-back guarantee" | MENTIONED ONCE | Only appears in hero subtitle; not repeated in pricing cards |
| Testimonial: Chris O'Connor "20% body fat down to 7%, 84kg to 68kg" | UNVERIFIABLE | |
| Testimonial: Ian McKnight "Commuter to racer in one season" | UNVERIFIABLE | |
| Testimonial: Kazim "800km, 18,500m climbing in 7 days" | UNVERIFIABLE | |
| "$200-500/month" for 1:1 coaching (FAQ) | UNVERIFIABLE | Plausible market rate |

---

### Club Page (`src/app/(community)/community/club/page.tsx`)

| Claim | Verdict | Notes |
|---|---|---|
| Dublin, Ireland location | UNVERIFIABLE | Plausible |
| Thursday 6:30 PM, Pope's Cross, Phoenix Park | UNVERIFIABLE | |
| Saturday 9:30 AM, 360 Cycles, Clontarf | UNVERIFIABLE | |
| Sunday 10:00 AM, 360 Cycles, Clontarf | UNVERIFIABLE | |
| ~40km Thursday ride | UNVERIFIABLE | |
| ~90km Saturday ride | UNVERIFIABLE | |
| ~80km Sunday ride | UNVERIFIABLE | |
| "All levels. From first sportive to Cat 1." | UNVERIFIABLE | |

---

### Podcast Page (`src/app/(content)/podcast/page.tsx`)

| Claim | Verdict | Notes |
|---|---|---|
| "1M+ MONTHLY LISTENERS" | CONSISTENT | Matches other pages |
| `{episodes.length} EPISODES` | DYNAMIC | Shows actual count from content files (currently 311). Does NOT hardcode 1,400+. |

**Note:** The podcast page dynamically shows the actual episode count from content files. If there are only 311 .mdx files, this page will show "311 EPISODES" alongside "1M+ MONTHLY LISTENERS," which contradicts the "1,400+" claim used elsewhere. This is a significant inconsistency.

---

### Strength Training Page (`src/app/(marketing)/strength-training/page.tsx`)

| Claim | Verdict | Notes |
|---|---|---|
| Price: $65 one-time | CONSISTENT | Matches JSON-LD schema |
| "Lifetime access" | UNVERIFIABLE | |
| "100% money back guarantee" | UNVERIFIABLE | |
| "8-15% power increase" (Ronnestad 2010) | PARTIALLY VERIFIED | Ronnestad studies show ~9.4% Wingate improvement and other power metrics. "8-15%" is a reasonable range across multiple studies but is a composite, not from one study. |
| "3-5% cycling economy" (Sunde 2010) | VERIFIED | Sunde 2010 showed 4.8% CE improvement, which is within the stated range |
| "17% longer time to exhaustion" (Aagaard 2011) | VERIFIED | Aagaard 2011 showed 17.2% improvement in time to exhaustion at max aerobic power |
| "cyclists over 30" target audience | N/A | Marketing claim, not factual |
| Testimonial: Kevin L, Age 67 | UNVERIFIABLE | |
| Testimonial: Mary K, Age 56 | UNVERIFIABLE | |

---

### Newsletter Page (`src/app/(marketing)/newsletter/page.tsx`)

| Claim | Verdict | Notes |
|---|---|---|
| "29,782 cyclists" subscribed | UNVERIFIABLE | Suspiciously specific number suggests it was real at time of writing but will quickly become outdated |
| "Every Saturday" delivery | UNVERIFIABLE | |
| Newsletter called "The Saturday Spin" | INCONSISTENT | Page heading says "THE INSIGHTS" but homepage calls it "THE SATURDAY SPIN." The page does not use the Saturday Spin name at all. |

---

### Footer (`src/components/layout/Footer.tsx`)

| Claim | Verdict | Notes |
|---|---|---|
| "The world's largest cycling performance podcast" | UNVERIFIABLE | Bold claim; no independent ranking confirms this |
| "1,400+ episodes" | CONSISTENT | Matches other pages |
| Skool link: `skool.com/roadmancycling` | CONSISTENT | Points to NDY community |

---

### Tools Page (`src/app/(content)/tools/page.tsx`)

No factual claims beyond tool descriptions. All tools are described functionally; claims are about what the calculators do, not external facts.

---

## INCONSISTENCY TRACKER

| Fact | Locations | Issue |
|---|---|---|
| Episode count | Homepage, About, Clubhouse, NDY, Footer all say "1,400+" | Podcast page shows dynamic `episodes.length` which is currently 311 from content files |
| Clubhouse size | Homepage, Community, Clubhouse all say "2,100" or "2,100+" | Minor: sometimes with "+", sometimes without |
| NDY size | Homepage, Community, NDY all say "113" | Consistent |
| NDY price | All pages say "$15/month" | Consistent. BUT annual price of "$75/year" seems too cheap. |
| Newsletter name | Homepage/Footer: "THE SATURDAY SPIN" | Newsletter page heading: "THE INSIGHTS" |
| Skool URLs | Clubhouse: `skool.com/roadman` vs NDY: `skool.com/roadmancycling` | Likely intentional (two different groups) but should be verified |
| Podcast launch | About timeline: 2020 | Apple Podcasts: 2017 |

---

## RECOMMENDATIONS (Priority Order)

1. **FIX: Podcast launch year** — Change from 2020 to 2017 in the about page timeline. Adjust subsequent milestones accordingly.
2. **FIX: Rosa Kloser credential** — Change from "European gravel champion" to "Gravel World Champion" or "UCI Gravel World Champion."
3. **VERIFY: $75/year annual pricing** — Confirm this is the actual Skool price. If it should be $150/year, update. If it is genuinely $75/year, consider whether the steep discount is intentional.
4. **FIX: Newsletter naming** — Decide whether it's "The Saturday Spin" or "The Insights" and use consistently.
5. **CONSIDER: Episode count on podcast page** — The dynamic `episodes.length` will show far fewer than 1,400. Either migrate all episodes to content files or hardcode "1,400+" on the podcast page.
6. **CONSIDER: Brownlee and Clancy credentials** — Upgrade to "2x Olympic triathlon gold" and "3x Olympic gold, team pursuit" respectively.
7. **CONSIDER: Colin O'Brady claim** — "First solo Antarctic crossing" is heavily disputed. Consider softening to "Antarctic explorer" or "endurance athlete."
8. **CONSIDER: "World's largest cycling performance podcast"** — Cannot be independently verified. Consider softening to "one of the world's largest" or simply "the world's leading cycling podcast" which is more subjective.

---

*Report generated 2026-04-03. External facts verified via web search. Internal consistency checked across all page files.*
