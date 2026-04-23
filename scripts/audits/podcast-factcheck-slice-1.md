# Podcast Fact-Check Audit — Slice 1 (ep-1 to ep-2142)

**Date:** 2026-04-23
**Auditor:** Claude Opus 4.7
**Scope:** 155 podcast MDX files, alphabetical first half of `content/podcast/`
**Slice range (alphabetical):** `ep-1-1-thing-i-learned-riding-37-ultra-distance-races-roadman-pod.mdx` → `ep-2142-f1-inspired-tips-every-cyclist-should-know-bottas.mdx`

## 1. Summary

| Metric | Count |
| --- | --- |
| Total episodes in slice | 155 |
| Episodes I intentionally edited | 22 |
| Landmine credential fixes (Lorang, Bigham, Seiler, LeMond, Bottrill, Kloser, etc.) | 7 |
| Spelling / attribution errors corrected | 13 files |
| Overclaims softened | 5 files |
| Fabricated-stat corrections | 1 (17.8% cycling efficiency misattribution) |
| `updatedDate: '2026-04-23'` added | 22 files |

Note: A repo-wide MDX linter also stripped the `" | Roadman Cycling"` suffix from `seoTitle` fields across ~80 files in the slice while I worked. Those linter-only changes are NOT part of this audit and were left un-staged; only files I intentionally audited are staged for this commit.

TypeScript check passed (`npx tsc --noEmit --project tsconfig.json` → exit 0) after edits.

## 2. Episodes with Corrections (before → after)

### ep-2095-secret-to-cycling-fast-at-a-low-heart-rate-prof-seiler.mdx
- `answerCapsule`: "exercise physiologist and **architect** of the 80/20 polarized training model" → "exercise physiologist at the **University of Agder** who **codified** the 80/20 polarised training model".
- FAQ: "Prof Seiler, **who developed this model**" → "whose **research codified this distribution**".
- Added `guestCredential: Exercise physiologist, University of Agder; codified 80/20 polarised training`.
- Replaced short `description: The Secret To Cycling Fast At A Low Heart Rate` with a substantive one-sentence frontmatter description.

### ep-2056-13-years-of-coaching-pros-what-amateurs-dont-know.mdx
- `description` / `answerCapsule`: removed unverifiable "coached **Tour de France winners**" claim; replaced with verifiable "Jan Frodeno (Olympic triathlon champion) and Anne Haug (2019 Ironman World Champion)".
- Initially wrote "three-time Ironman world champion Anne Haug" → corrected to "2019 Ironman World Champion Anne Haug" (Haug has one Kona title, five podiums).
- Added `guest: Dan Lorang` (was missing) and `guestCredential`.

### ep-2106-he-accidentally-mastered-aerodynamics-dan-bigham.mdx
- `answerCapsule`: "former UCI Hour Record holder and **newly signed to Red Bull after leaving Ineos Grenadiers**" → "former UCI Hour Record holder and **now Head of Engineering at Red Bull–Bora–Hansgrohe**" (reflects current role as of 2026-04).
- Added `guestCredential: Head of Engineering, Red Bull–Bora–Hansgrohe; former UCI Hour Record holder`.

### ep-2128-7-hacks-pro-riders-use-that-you-probably-dont-matt-bottrill.mdx
- `description`: expanded with verified credentials — multiple-time British national TT champion at 10/25/50/100 miles; coached Victor Campenaerts to the 2019 UCI Hour Record.
- Added `guestCredential`.

### ep-2134-roglics-coach-builds-a-training-plan-for-amateur-riders-dan.mdx
- `answerCapsule`: softened "**coach to Primoz Roglic**" → "long-time coach to Olympic triathlon champion Jan Frodeno" (Roglic's direct personal coach is Marc Lamberts, not Lorang; Lorang is the team-level Head of Performance).
- FAQ question: "How does **Primoz Roglic's coach** structure training…" → "How does **Red Bull–Bora–Hansgrohe's head of performance** structure training…".
- Added `guestCredential`.

### ep-2113-5-common-training-mistakes-even-pro-s-make-and-how-to-fix-th.mdx
- Global replace: **"Olaf Bu" → "Olav Aleksander Bu"** (correct name of Norwegian performance scientist; coach to Kristian Blummenfelt and Gustav Iden).

### ep-2047-the-dark-secret-behind-hidden-motors-in-cycling.mdx
- keyQuote credential: "Greg LeMond — Former Tour de France champion" → "**Three-time** Tour de France winner (1986, 1989, 1990)" (landmine: must never be 2-time).
- keyQuote speaker: "**Thierry Bilard**" → "**Thierry Braillard**" (correct spelling of France's former Secretary of State for Sports).

### ep-2110-how-this-simple-training-plan-won-me-unbound-2024-rosa-kl-se.mdx
- Added `guestCredential: 2024 Unbound Gravel 200 winner; 2025 German gravel national champion` (landmine: Kloser is NOT a "Gravel World Champion", and this was flagged as a known risk in the guardrails).

### ep-10-inside-gravels-first-super-team-with-european-gravel-champio.mdx
- Global replace: **"Mads Wart Schmidt" → "Mads Würtz Schmidt"** (correct Danish spelling).
- Global replace: **"European and Tracker Champion" → "2025 European Gravel Champion and Traka winner"** ("Tracker" was a misheard "Traka").
- Global replace: **"European and Dutch gravel champion" → "Danish 2025 European Gravel Champion"** (Würtz Schmidt is Danish, not Dutch).

### ep-2-i-asked-world-tour-coaches-about-zone-2-heres-what-they-said.mdx
- description / seoDescription / body / answerCapsule: corrected multiple misspelt coach names:
  - "**Vasily Anastasyan**" → "**Vasilis Anastopoulos**" (correct; Head of Performance at Astana, not UAE Team Emirates as one body passage wrongly stated).
  - "**Christian Schroer**" / "**Christian Schrout**" → "**Dr. Christian Schrot**" (performance scientist, Jayco-AlUla).
  - "Christian Schroer at **Bora RedBull**" → "Dr. Christian Schrot at **Jayco-AlUla**" (double error: wrong name AND wrong team).
- keyQuote speakers: "**Steven Syler**" → "**Stephen Seiler**" (×3); credential updated to "Professor, exercise physiologist, University of Agder".
- AICitation block: "Professor Steven Seiler, who **coined the term** polarised training in **approximately 2004**" → "Professor Stephen Seiler, whose **research codified and popularised** polarised training in endurance sport" (landmine: must not overclaim Seiler as "inventor").

### ep-2027-train-slower-ride-faster-why-it-actually-works.mdx
- AICitation body: "Professor Stephen Seiler, exercise physiologist and **originator** of the polarised training model" → "exercise physiologist at the University of Agder who **codified and popularised** the polarised training model".
- keyQuote credential: "paraphrasing Professor **Steven Siler**" → "paraphrasing Professor **Stephen Seiler**".
- "Vacillus/Vasilus Anastopoulos, **Estana** head coach" → "Vasilis Anastopoulos, **Astana** head coach".
- Global: "**Christian Shrout**" → "**Dr. Christian Schrot**".

### ep-2037-the-new-science-of-getting-faster-after-40.mdx
- **Fabricated-stat fix**: AICitation body claimed "A published study found masters cyclists who added weight training **improved cycling efficiency by 17.8%, compared to 5.9% in younger riders**" — but per Louis et al. (2011), the 17.8% / 5.9% figures are for **maximal voluntary contraction torque (strength)**, not cycling efficiency. The study did report a significant improvement in cycling delta efficiency in masters (numeric value not in abstract). Rewrote as "a heavy strength-training block significantly improved cycling delta efficiency in the masters group, with larger strength gains in masters (+17.8% maximal voluntary contraction torque) than in younger athletes (+5.9%)".

### ep-2132-how-do-team-bora-approach-building-endurance-we-find-out-joh.mdx
- Global replace: **"Jay Hindley" → "Jai Hindley"** (correct spelling of Australian rider).
- Global replace: **"Rob Britain" → "Rob Britton"** (correct spelling of Canadian gravel/ex-WorldTour rider, 2023 Badlands winner).

### ep-2044-world-tour-nutritionist-we-got-weight-loss-wrong.mdx
- Global replace: **"Dr. David Dunn" → "Dr David Dunne"** (16 occurrences).
- Added `guest: Dr David Dunne` + `guestCredential: Performance nutritionist to INEOS Grenadiers, EF Education, and Uno-X`.

### ep-2035-world-tour-nutritionist-we-got-fuelling-wrong.mdx
- Global replace: **"Sam Impy" → "Sam Impey"** (correct spelling; co-founder of Hexis, lead nutritionist at British Cycling).
- Global replace: **"Philippe Ganz" / "Philippe Gilbert" → "Filippo Ganna"** (Italian TT specialist at Ineos Grenadiers; the transcript source misheard "Filippo Ganna" as "Philippe Ganz/Gilbert/Oana").

### ep-2054-i-tried-keegan-swensons-insane-strength-routine-heres-what-n.mdx
- Global replace: **"Sophia Gomez" → "Sofia Gomez Villafañe"** (Argentinian-American pro gravel/MTB racer).

### ep-21-my-untold-story-about-why-i-quit-world-tour-lachlan-morton.mdx
- `guestCredentials`: "former WorldTour rider with Garmin and Dimension Data, **multiple Unbound winner**" → "with EF Education–EasyPost; former WorldTour rider (Garmin-Sharp, Dimension Data); **2024 Unbound Gravel 200 winner**" (Morton has ONE Unbound 200 win, 2024; "multiple" was an overclaim).

### ep-2039-why-pros-train-so-easy-what-amateurs-dont-know.mdx
- Global replace: **"Christian Shrout" → "Dr. Christian Schrot"**.

### ep-2-i-asked-astana-coach-about-zone-2-heres-what-he-said.mdx
- Global replace: **"Vasilus Anastopoulos" → "Vasilis Anastopoulos"**.

### ep-14-i-tried-eating-like-pidcock-for-60-days-here-s-what-happened.mdx
- Global replace: **"Sam Impy" → "Sam Impey"**.

### ep-1-i-lost-9kg-eating-more-and-got-faster-on-the-bike.mdx
- Global replace: **"Sam Impy" → "Sam Impey"** and "Dr. Sam Impy" → "Dr. Sam Impey".

### ep-2031-ben-healy-s-insane-fueling-strategy-revealed.mdx
- description + FAQ answer: **"101km stage"** (wrong) → "201.5km Bayeux to Vire Normandie stage" (correct distance of 2025 TdF stage 6).

## 3. Guest Credential Corrections (old → new)

| File | Old | New |
| --- | --- | --- |
| ep-2095 (Seiler) | (missing) | Exercise physiologist, University of Agder; codified 80/20 polarised training |
| ep-2056 (Lorang) | "coached Olympic champions and Tour de France winners" | Head of Performance, Red Bull–Bora–Hansgrohe; long-time coach to Jan Frodeno and Anne Haug |
| ep-2106 (Bigham) | "newly signed to Red Bull after leaving Ineos" | Head of Engineering, Red Bull–Bora–Hansgrohe; former UCI Hour Record holder |
| ep-2128 (Bottrill) | vague "one of the UK's top time trial cyclists" | Multiple-time British national TT champion; coached Victor Campenaerts to the 2019 UCI Hour Record |
| ep-2134 (Lorang) | "Primoz Roglic's coach" | Head of Performance, Red Bull–Bora–Hansgrohe; long-time coach to Jan Frodeno and Anne Haug |
| ep-2110 (Kloser) | (missing) | 2024 Unbound Gravel 200 winner; 2025 German gravel national champion |
| ep-2044 (Dunne) | (missing) + "David Dunn" name | Performance nutritionist to INEOS Grenadiers, EF Education, and Uno-X |
| ep-21 (Morton) | "multiple Unbound winner" | 2024 Unbound Gravel 200 winner (single win) |
| ep-2047 (LeMond keyQuote) | "Former Tour de France champion" | Three-time Tour de France winner (1986, 1989, 1990) |
| ep-2047 (Braillard) | "Thierry Bilard" | Thierry Braillard, France's Secretary of State for Sports (2014–2017) |

## 4. Fabricated / Overclaimed Statistics Caught

1. **ep-2037 — 17.8% cycling efficiency**: The 17.8%/5.9% figures from Louis et al. (2011) describe **strength** gains (maximal voluntary contraction torque), not cycling efficiency improvements. The study did find a significant delta efficiency improvement in masters, but the specific percentage was not in the claim. Rewrote to accurately reflect the study.
2. **ep-2056 — "Tour de France winners"**: Dan Lorang has coached Olympic champions (Frodeno 2008) and Grand Tour podium finishers, but Bora-Hansgrohe / Red Bull-Bora-Hansgrohe has not won a Tour de France overall under his tenure. Removed the overclaim.
3. **ep-2095 / ep-2-zone-2 / ep-2027 — Seiler as "architect"/"originator"/"coined"**: Seiler's research codified and popularised polarised training but he did not "invent" it (athletes trained this way long before his research). Softened language per guardrails.
4. **ep-21 — "Multiple Unbound winner"** for Lachlan Morton: he has ONE Unbound 200 win (2024). Overclaim removed.
5. **ep-10 — "Tracker Champion"** for Mads Würtz Schmidt: "Tracker" is a misheard "Traka" (Spanish gravel race). Corrected.

## 5. Flagged for Human Review

- **ep-12-i-trained-like-a-pro-cyclist-for-60-days**: Claim "Ian Field, who coached Matteo Trentin to the European championship" — Ian Field runs VELD Coaching and has worked with pros, but I could not independently verify he coached Trentin specifically for the 2018 European RR title (Italian national coach Davide Cassani is the publicly credited mentor). The claim may be accurate through a private coaching relationship but is unverifiable from public sources. Left as-is; recommend Anthony confirm.
- **ep-2106 (Bigham)**: Episode recorded Sept 2024 when Bigham was mid-transition from Ineos to Red Bull. I updated the answerCapsule to reflect his current (2026) role as Head of Engineering at Red Bull–Bora–Hansgrohe, but the transcript preserves the original timing. OK as-is.
- **ep-15-untold-story-of-pogacar**: Claim "Pogačar's VO2 max may reach 96" is attributed correctly (Berg 2024 study in Journal of Science & Cycling estimates 91–96 ml/kg/min). Leave as-is.
- **ep-2121 (CORE heat training)**: The "5% power drop per 1°C core temperature rise" claim is CORE/McRae marketing and not a peer-reviewed consensus figure. It is attributed correctly as CORE's position, so left as-is, but worth flagging if the episode gets promoted more aggressively.
- **ep-2035**: Pogacar "7.2 watts per kilogram for 22 minutes" vs Thomas "6.1 W/kg for 8–9 minutes in 2018" — these specific numbers could not be fully verified in the time budget. Not edited.
- **ep-2028 — "200 Swiss Francs" UCI fine** and Blocken wind-tunnel 50%/14 sec-per-min figures for TV moto drafting are broadly consistent with published work; left as-is.
- **ep-2126 (Dan Martin Liège)**: Not audited in detail; no known landmine.
- **ep-2120 (TdF key stages — LeMond reference)**: "LeMond's 8-second win over Fignon 1989" is accurate. No changes.
- **ep-2132**: John Wakefield's guestCredentials says "formerly at UAE Team Emirates" which is correct (he was at UAE 2018–2022 before joining Bora for 2023). Left as-is after adding updatedDate.

## 6. Files Edited (final list, to be staged)

1. `content/podcast/ep-1-i-lost-9kg-eating-more-and-got-faster-on-the-bike.mdx`
2. `content/podcast/ep-10-inside-gravels-first-super-team-with-european-gravel-champio.mdx`
3. `content/podcast/ep-14-i-tried-eating-like-pidcock-for-60-days-here-s-what-happened.mdx`
4. `content/podcast/ep-2-i-asked-astana-coach-about-zone-2-heres-what-he-said.mdx`
5. `content/podcast/ep-2-i-asked-world-tour-coaches-about-zone-2-heres-what-they-said.mdx`
6. `content/podcast/ep-2027-train-slower-ride-faster-why-it-actually-works.mdx`
7. `content/podcast/ep-2031-ben-healy-s-insane-fueling-strategy-revealed.mdx`
8. `content/podcast/ep-2035-world-tour-nutritionist-we-got-fuelling-wrong.mdx`
9. `content/podcast/ep-2037-the-new-science-of-getting-faster-after-40.mdx`
10. `content/podcast/ep-2039-why-pros-train-so-easy-what-amateurs-dont-know.mdx`
11. `content/podcast/ep-2044-world-tour-nutritionist-we-got-weight-loss-wrong.mdx`
12. `content/podcast/ep-2047-the-dark-secret-behind-hidden-motors-in-cycling.mdx`
13. `content/podcast/ep-2054-i-tried-keegan-swensons-insane-strength-routine-heres-what-n.mdx`
14. `content/podcast/ep-2056-13-years-of-coaching-pros-what-amateurs-dont-know.mdx`
15. `content/podcast/ep-2095-secret-to-cycling-fast-at-a-low-heart-rate-prof-seiler.mdx`
16. `content/podcast/ep-2106-he-accidentally-mastered-aerodynamics-dan-bigham.mdx`
17. `content/podcast/ep-21-my-untold-story-about-why-i-quit-world-tour-lachlan-morton.mdx`
18. `content/podcast/ep-2110-how-this-simple-training-plan-won-me-unbound-2024-rosa-kl-se.mdx`
19. `content/podcast/ep-2113-5-common-training-mistakes-even-pro-s-make-and-how-to-fix-th.mdx`
20. `content/podcast/ep-2128-7-hacks-pro-riders-use-that-you-probably-dont-matt-bottrill.mdx`
21. `content/podcast/ep-2132-how-do-team-bora-approach-building-endurance-we-find-out-joh.mdx`
22. `content/podcast/ep-2134-roglics-coach-builds-a-training-plan-for-amateur-riders-dan.mdx`

Plus this audit report at `scripts/audits/podcast-factcheck-slice-1.md`.

## 7. Commit Hash

To be filled in once staged and committed with message:
`Podcast fact-check slice 1 (ep-1 to ep-2116)`
