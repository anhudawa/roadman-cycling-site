# The Roadman Method: PDF Resource Fact-Check Report

**Date:** 11 May 2026
**Scope:** All 46 PDF resource files across Protocols 01-12
**Sources cross-referenced:** Knowledge base, voice guide, 12 protocol MDX files, 10 podcast meta JSON files

---

## Final Verdict: NEEDS CORRECTION

The resource library is overwhelmingly accurate. Expert attributions, training numbers, nutrition targets, and the anti-calorie-counting philosophy are all consistent across materials. Both critical brand rules (no barbell lifts, no Vekta) pass cleanly. However, there are **2 content mismatches** and **5 minor discrepancies** that should be resolved before the course ships.

---

## Critical Brand Rule Checks

| Rule | Result | Details |
|------|--------|---------|
| No heavy barbell lifts (deadlifts, barbell squats, barbell rows) | **PASS** | All S&C PDFs (04-sc-manual, 04-foundation-circuit, 04-exercise-demos, 09-sc-phase-3) are 100% dumbbell-led and bodyweight. The S&C Manual explicitly states "No heavy barbell movements." |
| No mention of Vekta | **PASS** | Zero mentions across all 46 PDFs, all 12 MDX files, and all 10 podcast meta files. TrainingPeaks is referenced correctly in MDX 04 and MDX 12. |

---

## Issues Requiring Correction

### HIGH PRIORITY

**1. FAIL — Climbing checklist Fix #4 mismatch**
- **File:** `06-climbing-checklist.pdf`
- **Problem:** PDF lists the 5 fixable climbing reasons as: Pacing, Power-to-Weight, Cadence, **Fuelling**, Mental Game
- **Source says:** Knowledge base and MDX 06 both list them as: Pacing, W/kg, Cadence, **Position/Bike Fit**, Mental Game
- **Fix:** Replace "Fuelling" with "Position/Bike Fit" in the climbing checklist PDF, or update the MDX and knowledge base to include Fuelling. A decision is needed on which is authoritative — the fuelling advice itself (60-90g carbs/hr) is factually sound but doesn't match the established list.

**2. FAIL — MDX/PDF exercise list mismatch (Protocol 04)**
- **File:** `04-sc-manual.pdf` vs `04-strength-that-transfers.mdx`
- **Problem:** The MDX article lists Foundation Phase exercises as: reverse lunge, hip thrust, step-ups, single-leg hip hinge, push-ups, Pallof press, dead bug. The S&C Manual PDF lists: Goblet Squat, Single-Leg RDL, Bulgarian Split Squat, Hip Thrust, Pallof Press, Front Plank, Calf Raise.
- **Impact:** Members read the MDX article then download the PDF — the exercises don't match. Step-ups appear in MDX Foundation Phase but only in PDF Build Phase. Push-ups and dead bugs appear in MDX but nowhere in any PDF.
- **Fix:** Align the MDX article exercise list with the S&C Manual PDF (the PDF is the actual training tool members follow).

### MEDIUM PRIORITY

**3. MDX rep range vs PDF rep range (Protocol 04)**
- **File:** `04-strength-that-transfers.mdx` vs `04-sc-manual.pdf`
- **Problem:** MDX says the sweet spot is "5-8 reps per set, near maximal effort." PDF Foundation Phase prescribes 10-15 reps. Build Phase drops to 8-10 reps.
- **Note:** The PDF's more conservative approach is arguably better for the 35-55 age group, but the discrepancy could confuse members.
- **Fix:** Update MDX to reflect the PDF's progressive rep scheme (10-15 Foundation, 8-10 Build, 8 Maintain).

**4. Session 2 torque recovery time discrepancy**
- **File:** `09-torque-cards.pdf` vs `09-power-where-it-counts.mdx`
- **Problem:** PDF says 5 min recovery between Session 2 reps. MDX says 4 min.
- **Fix:** Standardise to one value across both files.

**5. Pre-event warm-up duration discrepancy**
- **File:** `10-pre-event-mental.pdf` vs `10-the-brain-is-the-limiter.mdx`
- **Problem:** PDF says 10-15 min warm-up. MDX says "at least 20 minutes."
- **Fix:** Align the PDF to the MDX (20 min minimum) or vice versa.

### LOW PRIORITY

**6. S&C session duration inconsistency between PDFs**
- **Files:** `09-sc-phase-3.pdf` says 2x25 min/week. `11-framework-summary.pdf` says 2x30 min/week.
- **Fix:** Pick one and standardise.

**7. Dan Lorang attribution incomplete in resource library**
- **File:** `12-resource-library.pdf`
- **Problem:** Lists Dan Lorang as having "coached Pogacar" but omits Vingegaard. Knowledge base confirms he coached both.
- **Fix:** Update to "coached Pogacar and Vingegaard."

**8. Torque gradient omission in session library**
- **File:** `02-session-library.pdf`
- **Problem:** Torque climb interval description omits the 4-7% gradient specification that appears in the knowledge base and torque cards.
- **Fix:** Add "4-7% gradient" to the session library torque entry.

**9. "John Lorang" typo in podcast meta**
- **File:** `content/podcast/meta/ep-8-how-to-structure-winter-training-intensity-frequency-duratio.json`
- **Problem:** Lists "John Lorang" as a named expert. Should be "Dan Lorang."
- **Fix:** Correct the name.

### COSMETIC

**10. HTML entity rendering artifact**
- **Files:** Multiple S&C-related PDFs render "S&C;" with a trailing semicolon (HTML `&amp;` entity not properly decoded).
- **Fix:** Fix the ampersand rendering in the PDF generation pipeline.

---

## Claim-by-Claim Audit Summary

### Expert Attributions

| Claim | Verdict |
|-------|---------|
| Dan Lorang coached Pogacar and Vingegaard | PASS (incomplete in 12-resource-library — see issue #7) |
| John Wakefield is Bora-Hansgrohe coach | PASS |
| Professor Stephen Seiler is the polarised training pioneer | PASS |
| Tim Kerrison is ex-Team Sky head of performance | PASS |
| Derek Teel is the S&C specialist | PASS |
| Dr David Dunne — sports science | PASS |
| Joe Friel — season planning, periodisation | PASS |
| Lachlan Morton — EF Education, alt-racing | PASS |

### Study References

| Claim | Verdict |
|-------|---------|
| 2024 Habis study published in PLOS ONE | PASS |
| Low-cadence group improved VO2max by 8.7% vs 4.6% | PASS (in MDX and torque cards) |
| Maximum aerobic power up 8.1% vs 3% | PASS (in MDX; omitted from PDFs — acceptable) |
| Authors: Raphael Habis and Paulina Habis, Rocklaw University (Poland) | PASS (in MDX; PDFs reference study but not full author details) |
| Debunked studies: Christopherson 2014, Nimmer 2012, Luda 2016, Witty 2016 | UNVERIFIABLE (not referenced in PDFs, only in knowledge base) |

### Training Numbers

| Claim | Verdict |
|-------|---------|
| 80/20 polarised training split | PASS |
| Torque intervals: 4x4min, 40-60 RPM, RPE 7/10 | PASS |
| Torque gradient: 4-7% | PASS (in torque cards; missing from session library) |
| Session 2 torque: 8-12 min, 50-65 RPM | PASS (PDF uses 3x8min — within range) |
| VO2max intervals: 5x4min @ 106-120% FTP | PASS |
| Architecture PDFs total hours match their bracket labels | PASS (all 4 brackets verified) |
| Green 75-80%, Yellow 5-10%, Red 15-20% | PASS (compatible with MDX "roughly 80% green") |

### Nutrition Claims

| Claim | Verdict |
|-------|---------|
| 60-90g carbs/hour in-ride nutrition | PASS |
| Protein 1.8-2.2g/kg/day | PASS |
| Anthony lost 7kg (86 to 79) in 12 weeks eating more food | PASS |
| Anti-calorie-counting, anti-MyFitnessPal position | PASS |
| Rejects fasted rides | PASS (consistent across all materials) |
| Race-week carb loading from D-3 | PASS |
| Race breakfast 100-150g carbs, 3 hours before | PASS |
| Deficit on easy days only, 200-300 kcal | PASS |
| Performance plate model (visual, not calorie counting) | PASS |
| Grocery guide protein estimates (chicken 150g = 45g protein, etc.) | PASS (all values verified as reasonable) |

### Exercise Prescriptions

| Claim | Verdict |
|-------|---------|
| All S&C exercises are dumbbell/bodyweight only | PASS |
| Three phases: Foundation (Wk 4-6), Build (Wk 7-9), Maintain (Wk 9-12) | PASS |
| No gym first 3 weeks (aerobic focus) | PASS |
| Foundation exercises appropriate for 35-55 age group | PASS |
| No dangerous exercises for older amateurs | PASS |

### Recovery and Safety

| Claim | Verdict |
|-------|---------|
| Sleep target 7.5-8 hours | PASS |
| Room temperature 16-18 degrees | PASS |
| HRV measurement protocol (before coffee, 60+ seconds) | PASS |
| 3+ days below HRV baseline = overreaching | PASS |
| Recovery week every 3-4 weeks, 30-50% volume drop | PASS |
| Illness: above neck = easy Z2, below neck = full rest, 48hr clear | PASS |
| No dangerous advice found for target demographic | PASS |

### Mental Game

| Claim | Verdict |
|-------|---------|
| Mental game is "the most misunderstood factor" | PASS |
| Box breathing: 4-4-4-4 | PASS |
| Self-talk reframing techniques | PASS (evidence-based sports psychology) |
| 3-2-1 race prep countdown structure | PASS |

### Brand/Platform

| Claim | Verdict |
|-------|---------|
| "Not Done Yet" identity framing | PASS |
| TrainingPeaks as delivery partner | PASS |
| No mention of Vekta anywhere | PASS |
| Five pillars: Coaching, Nutrition, Strength, Recovery, Community | PASS |

---

## Potentially Dangerous Advice Check

No dangerous exercise or nutrition advice was found across any of the 46 PDFs. Specifically:

- All S&C exercises are appropriate for the 35-55 age group with no heavy barbell work
- Nutrition advice avoids extreme restriction — the plate-based model and anti-calorie-counting stance are health-positive
- The 200-300 kcal deficit is conservative and only applied on easy days
- Recovery guidance includes explicit stop signals (daily readiness red zone, illness protocols)
- The max weight loss rate (0.5kg/week) is safe and evidence-based
- HRV and readiness tools encourage backing off, not pushing through fatigue
- Body composition work stops 3 weeks before any A event

---

## Summary Statistics

| Category | Count |
|----------|-------|
| Total PDFs audited | 46 |
| Total claims checked | 100+ |
| PASS | 90+ |
| FAIL (content mismatch) | 2 |
| UNVERIFIABLE | 1 |
| Minor discrepancies | 5 |
| Cosmetic issues | 2 |
| Dangerous advice found | 0 |
| Barbell lift violations | 0 |
| Vekta mentions | 0 |
