# Site-Wide Audit: Quotes, Testimonials & Factual Claims

**Date:** 2026-05-03
**Auditor:** Automated audit (Claude)
**Scope:** All source files, blog posts, podcast pages, content drafts, and data files

---

## 1. BLOCKQUOTES & PULL QUOTES

### 1a. Member Testimonials (src/lib/testimonials.ts)

19 named member testimonials. All attributed to named individuals with specific locations and measurable outcomes (FTP gains, weight, race results). Language is natural and conversational throughout. No AI-generation markers detected.

**One flag:**

- **src/lib/testimonials.ts ~line 177** — Rob Capps testimonial reads noticeably more polished/formal than peer testimonials. Not AI-generated, but appears editorially refined. Consider adding "edited for clarity" if it was.

### 1b. Partner/Sponsor Quotes

- **src/app/(marketing)/partners/page.tsx** — 4iiii quote attributed to Andreja Grenier. Verifiable B2B language.
- **src/app/(marketing)/sponsor/page.tsx** — "THE ROADMAN AUDIENCE DOESN'T JUST LISTEN — THEY ACT." Attributed to 4iiii. Marketing language, appropriate for context.

### 1c. Blog Post Pull Quotes (blockquotes with citations)

All blog pull quotes found are attributed to named experts and linked to specific podcast episodes:

- **content/blog/stephen-seiler-80-20-polarised-training-cyclists.mdx** — Prof. Stephen Seiler quotes (3 instances). Attributed, linked to podcast.
- **content/blog/hrv-training-cyclists-olav-bu-protocol.mdx** — Olav Bu quote. Attributed, linked to podcast.
- **content/blog/coaching-roi-cost-benefit-analysis.mdx** — Anthony Walsh self-quote on coaching selection. Attributed.
- **content/podcast/ep-2092-sports-nutritionist-the-one-food-thats-slowing-us-down.mdx, lines 781-785** — Three blockquotes attributed to Yori Carlson. Note: the first quote ("It's not what we know for sure that hurts us...") is a well-known Mark Twain misattribution — it is being attributed here to Yori Carlson as if she said it on the podcast, but it is a famous aphorism. **FLAG: Verify whether Carlson actually said this on the episode or whether the quote was incorrectly attributed.**

### 1d. Podcast Key Quotes (keyQuotes metadata)

Multiple podcast episode MDX files contain `keyQuotes` arrays with speaker attributions. All checked are properly attributed to named speakers and linked to specific episodes. No unattributed or generic quotes found.

**VERDICT: Quotes are well-sourced overall. One potential misattribution flagged above.**

---

## 2. NUMERICAL CLAIMS & DOWNLOAD COUNTS

### 2a. Canonical Source

All major numerical claims are centralised in **src/lib/brand-facts.ts** (lines 65-84):

| Metric | Value | Label |
|---|---|---|
| Episode count | 1,400 | "1,400+" |
| Video episodes | 311 | "311+" |
| Monthly listeners | 1,000,000 | "1M+" |
| Newsletter subscribers | 65,000 | "65,000+" |
| Newsletter open rate | — | "65%+" |
| Countries reached | 18 | "18" |

### 2b. Consistency Check

All instances across the codebase reference `brand-facts.ts` imports. **No "100M+ downloads" claim found anywhere on the site.** The site uses "1M+ monthly listeners" consistently.

### 2c. Historical Milestone (potential confusion source)

- **src/app/(marketing)/about/page.tsx, line 51** — "2022: 1 million downloads"
- **src/app/(marketing)/about/page.tsx, line 54** — "2025: 1 million monthly listeners"

These are two different metrics (cumulative downloads vs. monthly listeners) presented as timeline milestones. **FLAG: The proximity of these two claims could confuse readers into thinking "1 million" refers to the same thing. Consider clarifying the distinction more explicitly.**

### 2d. Episode Count

The site claims "1,400+ episodes" but only 311 are listed as video/searchable episode pages. The total appears to include audio-only episodes. **FLAG: Verify that the 1,400 figure is accurate and current. The gap between 311 searchable pages and 1,400 total episodes should be explained if it isn't already.**

**VERDICT: Numerical claims are consistent and centralised. No "100M+" claim exists. Two clarification flags raised.**

---

## 3. GUEST CREDENTIALS

### 3a. Credentials Data Sources

Guest credentials are maintained in two locations:
- **src/lib/guests/profiles.ts** — 12 detailed guest profiles with full bios
- **src/lib/guests.ts** (KNOWN_CREDENTIALS, lines 99-172) — 73 credential entries

### 3b. Verifiable Credentials (spot-checked)

| Person | Claim | File | Assessment |
|---|---|---|---|
| Stephen Seiler | "Professor of Sport Science at the University of Agder" | profiles.ts:114 | **CORRECT** — verifiable academic appointment |
| Stephen Seiler | "coined the polarised-training model" | profiles.ts:114 | **FLAG: Overstated.** Seiler popularised and provided the research base for the polarised model, but "coined" implies sole invention. The concept predates his work. Consider "pioneered" or "established the research basis for." |
| Tim Spector | "Professor of Genetic Epidemiology at King's College London, co-founder of ZOE" | profiles.ts:145 | **CORRECT** — verifiable |
| Greg LeMond | "won the 1986 Tour de France" | multiple files | **CORRECT** — won 1986, 1989, 1990 |
| Ben Healy | "Winner of stage 6 of the 2025 Tour de France" | profiles.ts:221 | **Cannot independently verify** — 2025 Tour results are after training cutoff. Appears sourced from podcast interview with Healy himself. |
| Ben Healy | "wore the yellow jersey after stage 10" | profiles.ts:221 | **Cannot independently verify** — same as above. |
| Ben Healy | "first Irish rider in yellow since Stephen Roche in 1987" | profiles.ts:221, 234 | **Roche claim CORRECT** — Roche won the 1987 Tour. Whether Healy was the next Irish rider in yellow depends on 2025 results. |
| Michael Matthews | "2010 U23 Road Race World Champion" | profiles.ts:246, guests.ts | **CORRECT** — won at Geelong in 2010. |
| Michael Matthews | "Tour de France green jersey winner" | profiles.ts:246 | **CORRECT** — won green jersey in 2022. |
| Michael Matthews | "Grand Tour stage winner across all three Grand Tours" | profiles.ts:246 | **FLAG: Verify.** Matthews has won Tour and Vuelta stages. Giro stage wins need confirmation. |
| Dan Bigham | "UCI Hour Record holder (55.548km, 2022)" | profiles.ts:271 | **CORRECT** — set the record on 19 Aug 2022 at 55.548 km. Note: Filippo Ganna broke this record on 8 Oct 2022 with 56.792 km. The site correctly uses "former" in most places but the profiles.ts entry does not include "former." **FLAG: profiles.ts:271 should say "former UCI Hour Record holder."** |
| Dan Lorang | "Head of Performance at Red Bull–Bora–Hansgrohe since 2017" | profiles.ts:294 | **FLAG: "Since 2017" needs verification.** Lorang joined Bora, but the team was called "Bora-Hansgrohe" (without Red Bull) in 2017. The "Red Bull–Bora–Hansgrohe" name is the 2024+ branding. Also, the same entry says he "announced in April 2026 that he will leave at the end of the 2026 season" — **verify this is public information.** |
| John Wakefield | "Director of Coaching & Sports Science at Red Bull–Bora–Hansgrohe" | profiles.ts:318 | Verifiable via team announcements. |
| John Wakefield | "Previously Performance Co-ordinator and Coach at UAE Team Emirates over four seasons" | profiles.ts:319 | **FLAG: Verify "four seasons" claim.** |
| David Dunne | "PhD in Behaviour Change, Design Thinking, and Technology Innovation in Sports Nutrition from Liverpool John Moores University" | profiles.ts:332 | **FLAG: Very specific PhD title — verify exact wording matches his actual thesis.** |
| Alan Murchison | "Held a Michelin star at L'Ortolan in Berkshire from 2003 to 2014" | profiles.ts:346 | **FLAG: Verify dates.** L'Ortolan is in Reading, Berkshire — that's correct. But the Michelin star dates (2003-2014) should be verified against Michelin records. |
| Rosa Klöser | "2024 Unbound Gravel 200 winner and 2025 German gravel national champion" | profiles.ts:380 | **FLAG: Verify both results.** |
| Rosa Klöser | "PhD researcher in green shipping at Copenhagen Business School" | profiles.ts:380 | **FLAG: Verify current academic status.** |

### 3c. Credential Inflation Flags

| Person | Claim | File:Line | Issue |
|---|---|---|---|
| Yori Carlson | "World tour nutritionist" | content/drafts/companion/companion-ep-2092...:5, 10, 31 | **FLAG: The seoDescription and excerpt call her "World tour nutritionist" but the podcast intro says "nutritionist for some of the very biggest names in cycling." The latter is vaguer. "World Tour nutritionist" implies direct team employment. Verify whether Carlson is/was employed by a WorldTour team or works independently with individual riders.** |
| Yori Carlson | Keyword metadata: "uri carlon" | content/podcast/ep-2092...:18 | **FLAG: Name misspelled in keywords as "uri carlon." Should be "Yori Carlson."** |
| Sam Impey | "World Tour nutritionist" | content/podcast/ep-14...:31 and guests.ts:128 | **FLAG: Verify whether Impey holds/held a direct WorldTour team position or is an independent consultant.** |

**VERDICT: Most credentials are accurate and well-sourced. Several need verification (flagged above). One credential inflation risk (Yori Carlson "World Tour nutritionist").**

---

## 4. HISTORICAL & SCIENTIFIC CLAIMS

### 4a. Historical Claims

| Claim | File:Line | Assessment |
|---|---|---|
| "Greg LeMond won the 1986 Tour de France" | content/blog/uli-schoberer-first-power-meter-cycling-history.mdx:180 | **CORRECT** |
| "first Irish yellow since Stephen Roche in 1987" | src/lib/guests/profiles.ts:221, content/blog/heat-training-cyclists-30-watts-ftp-protocol.mdx:187 | **CORRECT** that Roche wore yellow in 1987. Whether Healy was next requires 2025 verification. |
| "Pogacar pursues Giro-Tour-Worlds triple crown not achieved since Stephen Roche in 1987" | content/podcast/ep-2116...:434 | **CORRECT** — Roche completed the triple in 1987. Merckx did it in 1974, but the claim says "since" which is accurate. |
| "Dan Bigham set the UCI Hour Record in 2022" | multiple files | **CORRECT** — but it was subsequently broken by Ganna in Oct 2022. Most references correctly say "former." |
| "LeMond's 1989 win by eight seconds over Fignon" | content/blog/trek-lemond-doping-dispute-cycling-history.mdx:149 | **CORRECT** — 8 seconds is the famous margin. |

### 4b. Scientific/Research Claims

| Claim | File:Line | Assessment |
|---|---|---|
| "2024 Bent Ronnestad study — heat + altitude retained haemoglobin gains for 3.5 weeks" | content/blog/heat-training-cyclists-30-watts-ftp-protocol.mdx:75 | **FLAG: Verify specific study. Ronnestad publishes on this topic, but exact findings and year need confirmation.** |
| "Santiago Lorenzo — 10 days heat acclimation raised VO2 max by 8%, threshold power by 5%" | heat-training...:173 | **FLAG: The Lorenzo et al. (2010) study in JAP did show improvements of this magnitude. Numbers appear correct but should be verified against the original paper.** |
| "Norwegian meta-analysis: 23% endurance improvement, 6% VO2 max lift" | heat-training...:173 | **FLAG: "23% improvement in endurance test performance" is a very large effect size. Verify which meta-analysis this references and whether the number is accurate.** |
| "2019 Christopherson trial" on gym vs bike sprint intervals | content/blog/gym-vs-bike-strength-training-cyclists-research.mdx:157 | **FLAG: Verify author name spelling and study details.** |
| "2021 Vikmoen and Ronnestad review" | gym-vs-bike...:169 | **FLAG: Verify exact publication year and journal.** |
| "2024 Habis study in PLOS ONE — VO2 max improved 8.7% with low cadence vs 4.6% free cadence" | gym-vs-bike...:185 | **FLAG: Very specific numbers. Verify against original paper.** |
| "Seiler and Kjerland, Scand J Med Sci Sports, 2006" | content/blog/stephen-seiler-80-20-polarised-training-cyclists.mdx:163 | **CORRECT** — this is a real, well-known paper. |
| "Stoggl and Sperlich, 2014, Frontiers in Physiology" | stephen-seiler...:173 | **CORRECT** — this is a real study with the results described. |
| "Stellingwerff's 2012 work on race weight" | content/blog/cutting-training-half-real-power-data.mdx:189 | **FLAG: Verify Stellingwerff published on this specific topic in 2012.** |
| "Phil Burt — British Cycling track riders 172.5mm to 165mm showed ~15W FTP gain" | content/blog/shorter-cranks-cycling-power-gains.mdx:170 | **FLAG: "15 watts" is a very specific claim attributed to Burt's presentation. Verify this is what he actually reported.** |
| "Bradley Wiggins moved from 177mm to 170mm cranks — front end dropped 30mm, 3.5% aero improvement" | shorter-cranks...:181 | **FLAG: Very specific numbers for a specific athlete. Verify source.** |
| "Fifteen minutes of meditation, three times a week, can halve cortisol levels" | content/blog/free-testosterone-cyclists-50th-percentile-dr-gordon.mdx:191 | **FLAG: "Halve cortisol levels" is an extraordinary claim. This needs a specific citation. As stated, it's likely an oversimplification.** |
| "Only around two percent of total testosterone is the free, biologically active fraction" | free-testosterone...:152 | **CORRECT** — standard medical reference (typically cited as 1-3%). |

### 4c. Performance Claims

| Claim | File:Line | Assessment |
|---|---|---|
| "Heat training adds 20-30 watts FTP" | heat-training...:2, 64 | **FLAG: This is the article headline claim. The body attributes it to Ronnestad's research, but 20-30W is a very wide range and sits at the high end of reported effects. Verify whether this is the direct finding or an extrapolation.** |
| "Ben Healy consumed 140g carbs/hr, 535g total, during stage 6 win" | ep-2031...:345 | Specific claim sourced from podcast episode with EF nutritionist. Internally consistent across all references. |
| "Ben Healy: 495 watts at 62kg at 2025 Worlds" | ep-19...:873 | **FLAG: Attributed to Healy himself on the podcast. Very specific — 495W at 62kg = ~8.0 W/kg. Plausible for a WorldTour climber in a Worlds effort, but verify against any published data.** |

**VERDICT: Most historical claims are accurate. Scientific claims reference real studies but specific numbers should be verified against original papers. Several extraordinary performance claims need sourcing.**

---

## 5. CROSS-POST CONSISTENCY

### 5a. Name Spelling Issues

| Issue | Files | Lines |
|---|---|---|
| **"Ben Healy" vs "Ben Healey"** — Structured metadata consistently uses "Healy" (correct). Transcript text uses "Healey" (incorrect) in ~30+ instances. | ep-2031:43,45,54,58,64,66,119,144,147,192,206,219,255,256,263,319,321; ep-19:120,128,175,209,331,480,628,672,823; ep-2026:212,213,294; ep-2100:182; ep-11:1069-1071; ep-15:312,313,317,322; and others | Multiple lines across ~15 files |
| **"Stephen Roche" vs "Steven Roach"** — Structured content uses "Stephen Roche" (correct). Transcript text uses "Steven Roach" (phonetic mishearing). | ep-2026:212; ep-7:1075; ep-2231:106; ep-2029:67 | 4 instances in transcript text |
| **"Vasilis" vs "Vasilus"** — Structured content uses "Vasilis Anastopoulos" (correct). One transcript misspells as "Vasilus." | ep-2-secret-to-zone-2:152,165 | 2 instances |
| **"Yori Carlson" vs "uri carlon"** — Keywords metadata misspells as "uri carlon." | ep-2092:18 | 1 instance |

### 5b. Credential Consistency

| Person | Inconsistency | Files |
|---|---|---|
| Dan Lorang | "Head of Performance" (profiles.ts) vs "performance coach" (some references) | profiles.ts:294 vs various comparisons.ts references |
| Dan Bigham | Some files say "former UCI Hour Record holder," profiles.ts:271 omits "former" | profiles.ts:271 vs src/app/page.tsx:20, about/press/page.tsx:71 |
| Yori Carlson | "World tour nutritionist" (drafts) vs "nutritionist for some of cycling's biggest names" (transcript) — different specificity level | companion-ep-2092:5 vs ep-2092:29 |

### 5c. Ben Healy Stage Win — Consistency Check

All structured references consistently say "stage 6" of the 2025 Tour. Transcript references say "stage six." No conflicting stage numbers found. **CONSISTENT.**

### 5d. Stephen Roche Triple Crown — Consistency Check

All references say 1987. ep-2116 correctly notes "Giro-Tour-Worlds triple crown not achieved since Stephen Roche in 1987." **CONSISTENT.**

**VERDICT: Transcript-level spelling errors are widespread (expected from auto-transcription). Structured content is consistent. Two credential inconsistencies flagged.**

---

## SUMMARY OF ALL FLAGS

### HIGH PRIORITY (potential factual errors)

1. **Dan Bigham "former" omission** — profiles.ts:271 says "UCI Hour Record holder" without "former." Ganna broke the record in Oct 2022. Most other files correctly say "former."
2. **Meditation/cortisol claim** — "Fifteen minutes of meditation, three times a week, can halve cortisol levels" (free-testosterone...:191) is an extraordinary claim without a specific citation.
3. **Heat training headline** — "20 to 30 Watts" (heat-training...:2) is at the high end of reported effects and may overstate typical results.
4. **Stephen Seiler "coined"** — profiles.ts:114 says he "coined the polarised-training model." "Pioneered" or "established the research basis for" would be more accurate.
5. **Michael Matthews Grand Tour stages** — profiles.ts:246 claims "stage winner across all three Grand Tours." Verify Giro stage wins.

### MEDIUM PRIORITY (credential verification needed)

6. **Yori Carlson "World Tour nutritionist"** — May inflate her credential. Transcript suggests she works with top riders, not necessarily as a direct team employee.
7. **Sam Impey "World Tour nutritionist"** — Same concern. Verify direct team employment.
8. **Dan Lorang "since 2017"** — Verify start date at Bora. Also verify April 2026 departure announcement is public.
9. **John Wakefield "four seasons" at UAE** — Verify exact tenure.
10. **David Dunne PhD title** — Verify exact thesis title matches claim.
11. **Alan Murchison Michelin star dates (2003-2014)** — Verify.
12. **Rosa Kloser results and academic status** — Verify 2024 Unbound and 2025 German gravel champ.

### LOW PRIORITY (transcript-level, not reader-facing in structured content)

13. **"Ben Healey" misspelling** — ~30+ instances in transcript text across ~15 files. Correct spelling is "Healy."
14. **"Steven Roach" misspelling** — 4 instances in transcript text. Correct spelling is "Stephen Roche."
15. **"Vasilus" misspelling** — 2 instances in transcript text. Correct is "Vasilis."
16. **"uri carlon" in keywords** — ep-2092 keywords metadata. Should be "Yori Carlson."
17. **Yori Carlson / Mark Twain quote** — ep-2092:781 attributes a famous aphorism to Carlson. Verify she actually said it on the episode (she may have been quoting it, in which case the attribution framing is misleading).

### RESEARCH CLAIMS NEEDING CITATION VERIFICATION

18. **2024 Ronnestad heat + altitude study** — Verify specific findings.
19. **Norwegian meta-analysis "23% endurance improvement"** — Verify source and accuracy.
20. **2019 Christopherson trial** — Verify author name and study details.
21. **2024 Habis study in PLOS ONE** — Verify 8.7% vs 4.6% VO2 max numbers.
22. **Stellingwerff 2012** — Verify publication topic and year.
23. **Phil Burt / British Cycling 15W crank claim** — Verify presentation source.
24. **Wiggins crank / aero numbers** — Verify 30mm drop and 3.5% aero gain.
25. **Ben Healy 495W at 62kg at Worlds** — Verify against any published data.

### NO ISSUES FOUND

- **All 19 member testimonials** — Authentic language, specific metrics, no AI-generation markers.
- **Partner/sponsor quotes** — Appropriate B2B language, verifiable relationships.
- **Numerical claims (1,400+ episodes, 1M+ listeners, 65K+ subscribers)** — Consistent across all files, centralised in brand-facts.ts.
- **No "100M+ downloads" claim found anywhere on the site.**
- **Greg LeMond historical claims** — All accurate (1986, 1989, 1990 Tours).
- **Stephen Roche 1987 claims** — All accurate and consistent.
- **Seiler and Kjerland 2006 paper** — Correctly cited.
- **Stoggl and Sperlich 2014 paper** — Correctly cited.
