# Reference Accuracy Audit — Roadman Cycling Site

**Audited:** 2026-05-04
**Scope:** ~276 MDX blog posts in `content/blog/`
**Auditor:** Automated scan (grep + manual review)

---

## CRITICAL — Wrong People / Credentials

These are factual errors that should be corrected immediately.

### 1. Dan Lorang falsely credited as coach of Pogacar and Vingegaard

**File:** `vo2-max-workouts-cyclists-over-40.mdx` (line 87)
**Text:** `role: Head coach, BORA-hansgrohe; coached Pogačar and Vingegaard`
**Problem:** Dan Lorang has never coached Pogacar or Vingegaard. Pogacar's physiologist/coach is Inigo San Millan (UAE Team Emirates). Vingegaard's coach was Tim Kerrison at Visma-Lease a Bike. Lorang is Head of Performance at Red Bull-Bora-Hansgrohe — a management role overseeing the whole team, not a personal coach to those riders (who ride for other teams entirely).
**Severity:** HIGH — completely wrong attribution.

**Also appears in SEO metadata:**
- `what-dan-lorang-says-about-endurance.mdx` (lines 3-4): `seoTitle: 'Dan Lorang on Endurance Training: The Coach to Pogacar'` and `seoDescription: 'Dan Lorang — coach to Pogačar, Vingegaard and triathlon world champions'`
- These SEO fields claim Lorang coaches Pogacar and Vingegaard. Both are wrong.

### 2. Dan Lorang falsely credited as personal coach of Remco Evenepoel

**File:** `dan-lorang-amateur-training-plan.mdx` (lines 23-24, 90)
**Text:** `Dan Lorang, head of performance at Red Bull-Bora-Hansgrohe (and coach to Remco Evenepoel, Jan Frodeno, Anne Haug, and Lucy Charles-Barclay)` and `the personal coach behind Remco Evenepoel's recent Grand Tour form`
**Problem:** Evenepoel's personal coach is Koen Pelgrim, who moved with him from Soudal-Quick Step to Red Bull-Bora-Hansgrohe. Lorang is Head of Performance (team-wide), not Evenepoel's individual coach.
**Severity:** HIGH — wrong attribution that could cause reputational issues.

### 3. "Roglic's Coach" episode title implies Lorang coaches Roglic

**File:** `best-roadman-episodes-time-crunched.mdx` (line 111), `dan-lorang-amateur-training-plan.mdx` (line 90)
**Text:** `Roglič's Coach Builds a Training Plan for Amateur Riders — Dan Lorang`
**Problem:** John Wakefield coaches Roglic at Bora (confirmed in `john-wakefield-team-bora-endurance-training.mdx` line 98: `coaches Primož Roglič and Jai Hindley`). Lorang is team Head of Performance, not Roglic's personal coach. The episode title is misleading.
**Severity:** MEDIUM — the episode title is the podcast's own, but the blog text shouldn't reinforce the conflation.

### 4. Vasilis Anastopoulos called "Nate Anastopoulos"

**File:** `what-experts-say-about-zone-2-training.mdx` (line 90)
**Text:** `Nate Anastopoulos`
**Problem:** His name is Vasilis Anastopoulos. "Nate" is wrong. Every other reference in the site correctly uses "Vasilis."
**Severity:** HIGH — wrong first name for a named expert.

### 5. Mark Cavendish listed as "HTC teammate of Greipel in 2011"

**File:** `andre-greipel-sprint-captains-code.mdx` (line 60)
**Text:** `role: Sprinter; HTC teammate of Greipel in 2011; record Tour de France stage winner`
**Problem:** Greipel left HTC-Columbia at the end of 2010, joining Lotto-Belisol for 2011. By 2011, Cavendish was still at HTC-Highroad but Greipel was no longer there. They were teammates at HTC from 2008-2010, not in 2011.
**Severity:** MEDIUM — wrong year for a verifiable fact.

### 6. Rick Zabel listed as "current Israel-Premier Tech rider"

**File:** `andre-greipel-sprint-captains-code.mdx` (line 57)
**Text:** `role: Professional cyclist; close friend of Greipel; current Israel-Premier Tech rider`
**Problem:** Israel-Premier Tech dissolved at the end of the 2023 season. Zabel moved to Jayco-AlUla for 2024. "Current Israel-Premier Tech" is outdated and the team no longer exists.
**Severity:** MEDIUM — outdated team reference.

### 7. Dan Bigham at "Red Bull-Bora-Hansgrohe" — needs verification

**Files:** Multiple (appears in ~10 posts)
**Text:** `Dan Bigham, Head of Engineering at Red Bull-Bora-Hansgrohe`
**Problem:** Bigham was widely known as a performance engineer at INEOS Grenadiers (where he set the Hour Record in 2022). The claim that he moved to Red Bull-Bora-Hansgrohe as "Head of Engineering" from "late 2024" needs verification. If incorrect, this error is replicated across many posts.
**Severity:** MEDIUM-HIGH — if wrong, it's a systematic error across ~10 files.

### 8. Uli Schoberer located in "Ulm, Germany"

**File:** `uli-schoberer-first-power-meter-cycling-history.mdx` (lines 17, 54, 67, 92, 148)
**Text:** `One engineer in Ulm, Germany` / `medical engineer at the University of Ulm`
**Problem:** SRM is headquartered in Julich, Germany (near Aachen), not Ulm. Schoberer studied/worked at institutions near Julich. The "Ulm" claim appears to be wrong and is repeated 5 times in the article.
**Severity:** MEDIUM — wrong city for a named person's background.

### 9. "Pogacar's new coach, Javier Sola"

**File:** `heat-training-cyclists-30-watts-ftp-protocol.mdx` (line 181)
**Text:** `His new coach, Javier Sola, prioritised heat acclimation across the build phase.`
**Problem:** Pogacar's known coaching/physiology lead is Inigo San Millan. "Javier Sola" as "new coach" needs verification. This contradicts the site's own reference in `zone-2-training-complete-guide.mdx` which correctly identifies San Millan as the physiologist who works with Pogacar.
**Severity:** MEDIUM — potentially wrong coach name for the world's biggest cycling star.

### 10. Dan Lorang tenure inconsistency

**File:** `every-roadman-episode-with-dan-lorang.mdx` (line 86)
**Text:** `a role he's held since 2017 and announced in early 2026 that he'll leave the team after the 2026 Tour de France, ending a ten-year spell`
**Problem:** "Since 2017" to 2026 is 9 years, not "a ten-year spell." Internal inconsistency.
**Severity:** LOW — arithmetic error.

---

## Outdated Team Names

### 11. "Trek-Segafredo" — should be "Lidl-Trek"

**File:** `heat-training-cyclists-30-watts-ftp-protocol.mdx` (line 189)
**Text:** `Lotto Dstny, Trek-Segafredo, and Visma-Lease A Bike are all running active heat protocols.`
**Problem:** Trek-Segafredo became Lidl-Trek from the 2023 season. Outdated by 3 years.
**Severity:** LOW-MEDIUM — outdated sponsor name.

### 12. Inconsistent "Visma-Lease a Bike" capitalisation

**Files:** `heat-training-cyclists-30-watts-ftp-protocol.mdx` uses "Visma-Lease A Bike" (capital A); `team-visma-breathing-sensor-ventilation-training.mdx` uses "Visma-Lease a Bike" (lowercase a, with em dash).
**Problem:** The official name uses lowercase 'a'. Mixed capitalisation and punctuation across articles.
**Severity:** LOW — inconsistency.

---

## Brand Name Errors

### 13. "Training Peaks" (two words) instead of "TrainingPeaks"

**File:** `rouvy-vs-zwift.mdx` (lines 64, 118, 120)
**Text:** `Training Peaks` (three occurrences)
**Problem:** The correct brand name is "TrainingPeaks" (one word, camelCase). As a partner, the name should be consistently correct.
**Severity:** MEDIUM — partner brand name misspelled.

---

## Suspicious or Potentially Overstated Statistics

### 14. "20 to 30 watts of FTP gain" from heat training

**File:** `heat-training-cyclists-30-watts-ftp-protocol.mdx` (lines 5, 64, 78, 96, 169)
**Text:** `The performance effect for trained cyclists is roughly 20 to 30 watts on FTP`
**Problem:** This absolute number is extrapolated. The underlying research (Lorenzo, Ronnestad) reports percentage improvements in VO2max and time-to-exhaustion, not absolute FTP watts. 20-30W is a generous interpretation that may not apply to all trained cyclists. The article title itself ("30 Watts FTP") uses the high end. Consider whether this framing overpromises.
**Severity:** MEDIUM — potentially misleading headline stat.

### 15. "23 per cent improvement in endurance test performance"

**File:** `heat-training-cyclists-30-watts-ftp-protocol.mdx` (line 173)
**Text:** `The Norwegian meta-analysis aggregating multiple heat acclimation studies showed an average 23 per cent improvement in endurance test performance`
**Problem:** 23% improvement in endurance performance is an extraordinary claim. This likely refers to time-to-exhaustion at a fixed workload (which can show large % changes) rather than time-trial performance. The framing as "endurance test performance" could be read as a 23% improvement in race results, which it is not.
**Severity:** MEDIUM — potentially misleading framing.

### 16. Ironman calorie calculation

**File:** `what-wattage-should-you-ride-in-an-ironman.mdx` (line 168)
**Text:** `182W NP for a 72kg athlete is roughly 720 kcal/hour of work`
**Problem:** At ~24% gross efficiency, 182W = ~655 kJ/hr mechanical work = ~2730 kJ metabolic cost = ~652 kcal/hr. The stated "720 kcal/hour" is ~10% high. Not a huge error but worth correcting.
**Severity:** LOW — slightly overstated calculation.

### 17. Michael Matthews power inconsistency

**File:** `michael-matthews-no-base-miles-pro-training.mdx`
**Text:** seoDescription (line 6) says `rides high-300 watts all day`; excerpt (line 14) says `rides high-300 watts all day`; but all body text and answerCapsule consistently says `high 200s to low 300s watts`.
**Problem:** "High-300 watts" (350-399W) is materially different from "high 200s to low 300s" (280-320W). The SEO description and excerpt overstate the claim.
**Severity:** MEDIUM — inconsistency between metadata and body text.

---

## Race Results and Historical Claims Needing Verification

### 18. Ben Healy yellow jersey and Worlds bronze — 2025 Tour

**Files:** `heat-training-cyclists-30-watts-ftp-protocol.mdx`, `ben-healy-tactical-reset-tour-stage-win.mdx`
**Text:** `Ben Healy's yellow jersey at the 2025 Tour, the first Irish yellow since Stephen Roche in 1987` and `Bronze at the World Championships behind Pogacar and Remco`
**Problem:** These are forward-looking claims about the 2025 season. If these events happened as described, fine. If any detail is wrong (e.g., Healy's exact Worlds placing, or whether he wore yellow vs. just won a stage), these need correction. The "first Irish yellow since Roche 1987" is historically reasonable assuming no other Irish rider wore it between 1987-2025.
**Severity:** MEDIUM — verify against actual 2025 results.

### 19. Wout van Aert Paris-Roubaix 2026 claims

**File:** `why-cycling-needed-wout-to-win-roubaix.mdx`
**Text:** `48.91 kph average speed` / `Jasper Stuyven finished third and Mathieu van der Poel fourth`
**Problem:** These are 2026 race claims. Verify the exact average speed and finishing positions against actual results.
**Severity:** LOW — presumably written from actual results but worth double-checking.

### 20. Nathan Haas — "first World Tour pro to switch full-time to gravel"

**File:** `nathan-haas-gravel-soul-professionalisation.mdx`
**Text:** `first World Tour pro to switch full-time to gravel` / `first European World Tour pro to switch full-time to gravel`
**Problem:** Peter Stetina left the WorldTour (Trek-Segafredo) for gravel before Haas. Ted King also transitioned early. The "first" claim is debatable. The text hedges with "European World Tour pro" in one instance, but uses unqualified "first" elsewhere.
**Severity:** LOW — debatable claim.

---

## Vasilis Anastopoulos Title

### 21. "Head coach at Astana" — verify exact title

**File:** `80-20-cycling-training-the-grey-zone-trap.mdx` (line 105)
**Text:** `Vasilis Anastopoulos, head coach at Astana`
**Problem:** Anastopoulos's exact title at Astana Qazaqstan may be "performance coach" or "sports scientist" rather than "head coach." The Cavendish article correctly describes him as a coach who worked with Cavendish, but "head coach at Astana" implies he leads the entire coaching operation, which may overstate his role.
**Severity:** LOW — title may be overstated.

---

## Spelling Inconsistencies

### 22. "Ronnestad" vs "Ronnestad"

Mixed spelling across the site: `Ronnestad` (without special character) and `Ronnestad` (with o) are both used. The correct Norwegian spelling is **Ronnestad** (with o-slash). Example files: `cycling-gym-exercises-best.mdx` uses both within the same article.
**Severity:** LOW — inconsistent transliteration.

### 23. "BORA-hansgrohe" capitalisation varies

The team name appears as "BORA-hansgrohe," "Bora-Hansgrohe," "Red Bull-Bora-Hansgrohe," and "Red Bull-Bora-Hansgrohe" across different files. The official style is "Red Bull - BORA - hansgrohe" (with lowercase h).
**Severity:** LOW — cosmetic inconsistency.

---

## TrainingPeaks Partner Compliance

All TrainingPeaks references were reviewed. **No negative references found.** All mentions are positive or neutral, positioning TrainingPeaks as the standard coaching platform. The one edge case — a podcast episode URL containing "is-this-the-end-of-trainingpeaks" — is immediately offset by the text: `TrainingPeaks remains a partner of the show and a critical structured-training tool for serious cyclists.`

**Status: COMPLIANT**

---

## Summary

| Severity | Count |
|----------|-------|
| CRITICAL (wrong facts) | 5 (items 1-4, 7) |
| MEDIUM | 10 (items 5-6, 8-9, 13-15, 17-18, 20) |
| LOW | 8 (items 10-12, 16, 19, 21-23) |

**Highest priority fixes:**
1. Remove all claims that Dan Lorang coached Pogacar, Vingegaard, or Evenepoel
2. Fix "Nate Anastopoulos" to "Vasilis Anastopoulos"
3. Verify Dan Bigham's actual current employer
4. Fix "TrainingPeaks" spelling in `rouvy-vs-zwift.mdx`
5. Correct or remove "Javier Sola" as Pogacar's coach
6. Fix Greipel-Cavendish HTC teammate year from 2011 to 2008-2010
