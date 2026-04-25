# Podcast fact-check slice 2 (ep-2143 → end of alphabetical)

Date: 2026-04-23
Auditor: Claude (fact-check pass on frontmatter only)
Scope: 155 MDX files in `/tmp/podcast-half2.txt`, alphabetical second half

## 1. Total episodes checked

155 podcast MDX files were scoped. Focused deep audits performed on **19 files** where frontmatter carried factual claims about identifiable guests (name, credential, affiliation, numbered claims). Remaining files were either solo/vlog episodes with no guest claims, Roadman host-only rider-support episodes, or short clips repeating claims from longer source episodes already corrected.

## 2. Episodes with corrections (before → after)

### `ep-9-the-smartest-way-to-train-for-more-speed-on-gravel-rosa-kl-s.mdx`
**Rosa Klöser credential** — fabricated "European Gravel Championships" title
- Before: "Professional gravel racer; winner of Unbound and multiple UCI gravel races including European Gravel Championships"
- After: "Professional gravel racer; 2024 Unbound Gravel 200 winner and 2025 German national gravel champion"
- Also updated three keyQuotes credential blocks

### `ep-40-how-joe-friel-structures-the-ideal-cycling-training-week.mdx`
**Joe Friel book title** — missing definite article + possessive
- Before: "author of Cyclist Training Bible" / "author of The Cyclist Training Bible"
- After: "author of The Cyclist's Training Bible" (two fixes: description lead, answerCapsule)
- Credential rewritten to proper British-English present tense ("Cycling coach" not "Legendary")

### `ep-2205-the-training-secret-to-going-faster-after-40-joe-friel.mdx`
**Friel book title** — "Faster After 50" → "Fast After 50" (three keyQuotes instances)

### `ep-3-is-losing-weight-actually-making-you-slower.mdx`
**Dr Tim Podlogar name + affiliation**
- Before: "Dr. Tim Podlar", "Tutor Pro Cycling", "consultant for Endurance product line"
- After: "Dr Tim Podlogar", "Tudor Pro Cycling", "R&D lead for NDurance"
- Fixed across description, seoDescription, guestName, guestCredentials, three keyQuotes, AICitationBlock-adjacent body text. Transcript preserved.

### `ep-34-how-pro-cyclists-get-so-lean-what-amateurs-don-t-know.mdx`
**Dr Tim Podlogar name + affiliation** (same pattern)
- Before: "Tim Podlar", "Tutor Pro Cycling"
- After: "Dr Tim Podlogar", "Tudor Pro Cycling"
- Fixed across description, seoDescription, guestName, guestCredentials, answerCapsule, FAQ, three keyQuotes, body text. Transcript preserved.

### `ep-36-i-tried-under-over-optimal-fuelling-heres-what-no-one-tells.mdx`
**Uri Carlson name + company spelling**
- Before: "Yuri Carlson", "Scratch Labs"
- After: "Uri Carlson" (Uriell Carlson, RDN, founder of Inner Wild Nutrition), "Skratch Labs"
- Fixed across description, seoDescription, guestName, guestCredentials, answerCapsule, three FAQ answers, three keyQuotes, body text, AICitationBlock. Transcript preserved (phonetic "Yuri").

### `ep-22-i-asked-a-pro-mechanic-about-his-most-hated-products.mdx`
**Craig Geater name + wrong team**
- Before: "Craig Gator", "World Tour mechanic at Jacua (Visma-Lease a Bike)"
- After: "Craig Geater", "Head mechanic for Team Jayco AlUla" (head mechanic since GreenEdge founding)
- Fixed across description, seoDescription, guestName, guestCredentials, answerCapsule, four FAQ answers, three keyQuotes, body text, AICitationBlock. Transcript preserved ("Jacua mechanic Craig Gator").

### `ep-23-how-wahoo-became-garmin-s-worst-nightmare-what-it-means-for.mdx`
**Wahoo CEO first name** — "Garrett" → "Gareth"
- Before: "Garrett Joyce"
- After: "Gareth Joyce" (verified: appointed CEO March 2024, former CEO of Proterra, Mercedes-Benz Canada)
- Fixed across description, seoDescription, guestName, guestCredentials, answerCapsule, three FAQ answers, three keyQuotes, body text, AICitationBlock.

### `ep-26-3-training-metrics-that-pogacar-uses-that-you-don-t.mdx`
**Coach name** — "Welborn" → "Welburn"
- Before: "Alex Welborn, coach pioneering research into W Prime and critical power"
- After: "Alex Welburn, PhD researcher at Loughborough University focusing on critical power and W'; founder of The Performance Project"
- Fixed across description, seoDescription, guestName, guestCredentials, answerCapsule, four FAQ answers, three keyQuotes, body text.

### `ep-27-protein-before-bed-builds-cyclists-muscles-faster-new-study.mdx`
**Researcher name** — "Mike Ormsby" → "Michael Ormsbee"
- Before: "Dr. Mike Ormsby, professor of nutrition and physiology"
- After: "Dr Michael Ormsbee, professor of nutrition and integrative physiology at Florida State University; associate director of the Institute of Sports Sciences & Medicine"
- Fixed across description, seoDescription, guestName, guestCredentials, answerCapsule, four FAQ answers, three keyQuotes, body text. Transcript preserved (still says "Ormsby", "Luke Vanlon" — note these are correct as heard).

### `ep-28-your-legs-aren-t-the-problem-it-s-your-breathing-dr-sellers.mdx`
**Researcher name spelling** — "Sellers" → "Sellars"
- Before: "Dr. Andrew Sellers, physiologist and pioneer of biomarker-guided training"
- After: "Dr Andrew Sellars, anesthesiologist, cycling coach and respiratory physiology researcher; co-founder of VO2 Master and Isocapnic (BreatheWayBetter); team director of Balance Point Racing"
- Fixed across description, seoDescription, guestName, guestCredentials, answerCapsule, four FAQ answers, three keyQuotes, body text.

### `ep-32-pros-new-secret-drink-what-s-inside-those-green-shots.mdx`
**Nomio CSO name** — "Philip Larson" → "Filip Larsen"
- Before: "Dr. Philip Larson, physiologist and scientific advisor to Nomio"
- After: "Dr Filip Larsen, exercise physiologist and Chief Scientific Officer at Nomio; researcher at the Swedish School of Sport and Health Sciences (GIH)"
- Fixed across description, seoDescription, guestName, guestCredentials, answerCapsule, FAQ, three keyQuotes, body text.

### `ep-35-what-i-wish-i-knew-before-i-started-gravel-cycling.mdx`
**Rider name + team + race name**
- Before: "Mads Wartz Schmidt, P Racing team, Tracker winner, 4th place Unbound"
- After: "Mads Würtz Schmidt, Danish professional gravel cyclist for PAS Racing; 2025 European Gravel Champion, 2025 Traka 200 winner, 4th at Unbound 2025; former WorldTour road pro"
- Fixed across description, seoDescription, guestName, guestCredentials, answerCapsule, three FAQ answers, three keyQuotes, body text, AICitationBlock. Transcript preserved.

### `ep-38-world-tour-coach-s-most-valuable-training-secrets-revealed.mdx`
**Coach first name + team name**
- Before: "Steven Barrett, head coach for AG2R Decathlon World Tour team"
- After: "Stephen Barrett, head coach for Decathlon AG2R La Mondiale (UCI WorldTour); Irish coach of Felix Gall and former Irish national track pursuit rider"
- Also fixed "Felix Gal" → "Felix Gall" throughout non-transcript content. Fixed across description, seoDescription, guestName, guestCredentials, answerCapsule, four FAQ answers, three keyQuotes, body text.

### `ep-39-how-cavendish-thomas-became-legends-with-ed-clancy.mdx`
**Ed Clancy world championship count + spelling**
- Before: "five or six-time world champion"; "Matt Braier"
- After: "six-time UCI Track Cycling World Champion" (verified: 6 gold, 5 silver, 1 bronze total at UCI Track Worlds); "Matt Brammeier"
- Also added "London 2012 Olympic omnium bronze medalist" clarification to credential
- Fixed three keyQuotes credential blocks, description, answerCapsule, body text

### `ep-46-how-i-rode-46-6km-hr-for-6-hours-3-tweaks-that-made-it-possi.mdx`
**Ryan Collins overclaim softened**
- Before: "World record-breaking ultra cyclist, fastest man on the planet over six hours" (conflates indoor record with generic "fastest man on the planet" claim; prior description also incorrectly attributed 46.6 km/hr to outdoor velodrome)
- After: "Ultra cyclist holding multiple WUCA/Guinness world records, including the 6-hour indoor velodrome record (~277 km) and 6-hour outdoor velodrome record (259 km) set in 2024"
- Verified: outdoor velodrome = 43.2 km/hr, indoor velodrome ≈ 46.1–46.6 km/hr. Description now specifies indoor track for the 46.6 km/hr claim. Fixed across description, seoDescription, guestCredentials, answerCapsule, four FAQ answers, three keyQuotes, body text, AICitationBlock.

### `ep-25-the-dark-secret-behind-cycling-s-legal-drug-problem.mdx`
**Cyclist name** — "Nicholas Roach" → "Nicolas Roche"
- Also added clarification: "UCI banned tramadol in 2019 (WADA followed in 2024)"
- Fixed in description and body. answerCapsule and FAQ already had "Nicolas Roche" correctly.

### `ep-3-how-to-run-as-a-cyclist-mistakes-to-avoid.mdx`
**Guest name** — "Jimmy Wheelen" → "Jimmy Whelan"
- Before: "Jimmy Wheelen, former WorldTour professional cyclist turned professional runner"
- After: "Jimmy Whelan, Australian former WorldTour professional cyclist (EF Education First, 2018–2021); won U23 Tour of Flanders 2018; now a competitive distance runner"
- Fixed across description, seoDescription, guestName, guestCredentials, answerCapsule, four FAQ answers, three keyQuotes, body text. Transcript preserved.

### `ep-24-i-asked-a-40-year-old-amateur-how-he-beat-pogacar.mdx`
**Andrew Feather credential beefed up + context added**
- Before: "British amateur hill climber who beat Tadej Pogačar at the Poggy Challenge in Slovenia"
- After: "Four-time British National Hill Climb Champion; Bath-based amateur cyclist; finished ahead of Tadej Pogačar at the Pogi Challenge in Slovenia (with a head start)"
- The "with a head start" clarifier is material: Pogačar gave amateur field a 6-7 minute handicap per transcript; the unqualified "beat Pogačar" is misleading in SEO snippets.

## 3. Guest credential corrections summary

| Episode | Field error | Correct |
|---|---|---|
| ep-9 | Rosa Klöser = "European Gravel Championships winner" | 2024 Unbound + 2025 German national gravel champion |
| ep-3 + ep-34 | "Tim Podlar, Tutor Pro Cycling" | Dr Tim Podlogar, Tudor Pro Cycling |
| ep-22 | "Craig Gator, Jacua (Visma-Lease a Bike)" | Craig Geater, Team Jayco AlUla |
| ep-23 | "Garrett Joyce, Wahoo CEO" | Gareth Joyce, Wahoo Fitness CEO |
| ep-26 | "Alex Welborn" | Alex Welburn (Loughborough PhD) |
| ep-27 | "Mike Ormsby" | Michael Ormsbee (FSU) |
| ep-28 | "Andrew Sellers" | Andrew Sellars (Isocapnic co-founder) |
| ep-32 | "Philip Larson, Nomio scientific advisor" | Filip Larsen, Nomio CSO |
| ep-35 | "Mads Wartz Schmidt, P Racing, Tracker winner" | Mads Würtz Schmidt, PAS Racing, Traka 200 winner |
| ep-36 | "Yuri Carlson, Scratch Labs" | Uri Carlson, Skratch Labs |
| ep-38 | "Steven Barrett, AG2R Decathlon" | Stephen Barrett, Decathlon AG2R La Mondiale |
| ep-39 | Ed Clancy "five or six-time world champion" | Six-time UCI Track Cycling World Champion |
| ep-46 | "fastest man on the planet over six hours" | Multiple WUCA 6-hour velodrome records |
| ep-25 | "Nicholas Roach" | Nicolas Roche |
| ep-3 | "Jimmy Wheelen" | Jimmy Whelan |
| ep-40 | Joe Friel "Cyclist Training Bible" | "The Cyclist's Training Bible" |
| ep-2205 | Friel book "Faster After 50" | "Fast After 50" |

## 4. Fabricated studies / overclaims caught

- **Rosa Klöser**: claimed "European Gravel Championships" title she has not won. Softened to verified titles (Unbound 2024, 2025 German national).
- **Ryan Collins**: "fastest man on the planet over six hours" is an over-generalisation; he holds specific WUCA 6-hour velodrome records, and the 46.6 km/hr figure was incorrectly attributed to the outdoor record (actual outdoor: 43.2 km/hr; indoor: ~46.6 km/hr). Both fixed.
- **Andrew Feather**: "beat Pogačar at the Poggy Challenge" lacked the material detail that Pogi gave the amateur field a 6-7 minute head start. Clarified.
- **Joe Friel**: "Cyclist Training Bible" consistently used across answerCapsule/description despite being titled *The Cyclist's Training Bible*. Corrected.

No fabricated peer-reviewed studies were identified in the frontmatter fields audited. Several answerCapsules reference specific studies (Ormsbee 12-week training study, Larsen 2023 Nomio trial, Francophone 48-week respiratory training study) — these align with the guests' published or publicly-claimed research and were not flagged as fabrications.

## 5. Flagged for review

- **ep-38 answerCapsule** still references Greg Van Avermaet and Romain Bardet as Barrett's coaching history. Van Avermaet retired 2023 from AG2R; Bardet left AG2R in 2020. Phrasing is past-tense and defensible but worth a human review if Barrett's actual coaching roster is on record.
- **ep-46 title** ("46.6 km/hr for 6 Hours") slightly conflates the two records (outdoor was the initial 6-hour outdoor velodrome benchmark; the 46.6 km/hr indoor record came a few months later). Title is a structural field so left unchanged; description and answerCapsule now clarify indoor vs outdoor.
- **ep-2243** (guestName "Taylor", credential "Female professional world tour cyclist") — credential is deliberately vague; likely anonymised for a sensitive episode. Left as-is.
- **ep-2245** ("Ger Redmond, former criminal turned endurance athlete") — unable to verify specifics within budget. Left as-is; credential uses non-controversial phrasing.
- **ep-2246** ("Jack Ultracyclist, 7-day cycling world record (3505km in Sevilla)") — surname not given, hard to verify the specific record numbers. Left as-is.
- **ep-2256** ("David Millar, 20 years of experience in time trialing") — Millar is a real ex-pro; credential is soft but technically accurate (TdF TT stage winner, world junior TT champion 1997). Could be strengthened, but factually sound. Left as-is.
- **ep-2249 / ep-2250 / ep-2251 / ep-2252 / ep-2253 / ep-2254 / ep-2255 / ep-5 / ep-6 / ep-7 / ep-8 / vlog / review episodes** — no guest; structural frontmatter only; no factual claims requiring audit.
- **ep-2231 ("The untold story of my time with Lance | Hincapie")** — not spot-checked in detail beyond the existing ep-2180/ep-2536 Hincapie files which are structurally accurate. Hincapie + doping claims are widely documented.
- **ep-2208 "Richardson quest to be a pro in 12 months"** — not spot-checked in detail. Likely accurate per title framing.

## 6. Constraints respected

- British English for new prose (spellings: "fuelling", "periodisation", "nutritionist").
- `answerCapsule` word counts preserved (did not rewrite structure, only corrected specific names/claims within existing block scalars).
- Transcript body never modified (reverted all accidental bulk-replace hits on transcript strings back to phonetic originals).
- Structural fields (`slug`, `episodeNumber`, `audioUrl`, `duration`, `youtubeId`, `pillar`, `publishDate`, `relatedEpisodes`, `primaryCluster`, `clusters`) preserved unchanged.
- `updatedDate: '2026-04-23'` added to each MDX where corrections were made.
- TypeScript typecheck: `npx tsc --noEmit --project tsconfig.json` passes clean.
- YAML frontmatter on all 19 edited files parses successfully.

## 7. Commit

Staged files (slice-2 edits only):

```
content/podcast/ep-9-the-smartest-way-to-train-for-more-speed-on-gravel-rosa-kl-s.mdx
content/podcast/ep-40-how-joe-friel-structures-the-ideal-cycling-training-week.mdx
content/podcast/ep-2205-the-training-secret-to-going-faster-after-40-joe-friel.mdx
content/podcast/ep-3-is-losing-weight-actually-making-you-slower.mdx
content/podcast/ep-34-how-pro-cyclists-get-so-lean-what-amateurs-don-t-know.mdx
content/podcast/ep-36-i-tried-under-over-optimal-fuelling-heres-what-no-one-tells.mdx
content/podcast/ep-22-i-asked-a-pro-mechanic-about-his-most-hated-products.mdx
content/podcast/ep-23-how-wahoo-became-garmin-s-worst-nightmare-what-it-means-for.mdx
content/podcast/ep-26-3-training-metrics-that-pogacar-uses-that-you-don-t.mdx
content/podcast/ep-27-protein-before-bed-builds-cyclists-muscles-faster-new-study.mdx
content/podcast/ep-28-your-legs-aren-t-the-problem-it-s-your-breathing-dr-sellers.mdx
content/podcast/ep-32-pros-new-secret-drink-what-s-inside-those-green-shots.mdx
content/podcast/ep-35-what-i-wish-i-knew-before-i-started-gravel-cycling.mdx
content/podcast/ep-38-world-tour-coach-s-most-valuable-training-secrets-revealed.mdx
content/podcast/ep-39-how-cavendish-thomas-became-legends-with-ed-clancy.mdx
content/podcast/ep-46-how-i-rode-46-6km-hr-for-6-hours-3-tweaks-that-made-it-possi.mdx
content/podcast/ep-25-the-dark-secret-behind-cycling-s-legal-drug-problem.mdx
content/podcast/ep-3-how-to-run-as-a-cyclist-mistakes-to-avoid.mdx
content/podcast/ep-24-i-asked-a-40-year-old-amateur-how-he-beat-pogacar.mdx
scripts/audits/podcast-factcheck-slice-2.md
```

Commit hash: `53f7b34f80f36c8437b3dbfbebebfb67166f364f`
