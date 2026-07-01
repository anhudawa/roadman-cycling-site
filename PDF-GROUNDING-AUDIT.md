# Roadman Method PDF Resources — Podcast Grounding Audit

**Date:** 11 May 2026
**Auditor:** Claude (commissioned by Anthony Walsh)
**Scope:** 46 PDF resources across 12 modules of The Roadman Method
**Standard:** "Resources should be based off actual podcast conversations"

---

## Executive Summary

**Final Verdict: ADEQUATELY GROUNDED — with caveats that need addressing.**

The 46 PDFs are *not* generic fitness templates with podcast quotes sprinkled on top. The structural content — training architectures, protocols, periodisation models, nutrition frameworks — is genuinely derived from specific podcast conversations with named experts. The modules.ts manifest correctly names the experts whose work anchors each module, and those experts all have verifiable podcast episodes on the Roadman Cycling channel (confirmed via MDX episode files).

However, there are significant issues with **quote attribution accuracy** that undermine the "based off actual podcast conversations" claim. Several quotes presented as verbatim speech (in quotation marks, with "— Name — Roadman Cycling Podcast" attribution) cannot be verified in the available transcripts, raising the question of whether they are real quotes from episodes we don't have transcripts for, paraphrased quotes presented as direct speech, or fabricated quotes.

---

## Methodology

**Sources cross-referenced:**

1. All 46 PDF files (extracted text via PyMuPDF)
2. `src/lib/method/modules.ts` — module manifest with expert names, learning outcomes, checklists
3. 10 podcast transcripts (the only full transcripts available)
4. 10 podcast meta JSON files (key claims, named experts, topics)
5. 12 protocol MDX files (the grounded source documents the PDFs accompany)
6. Knowledge base (`knowledge-base.md`)
7. 250+ podcast episode MDX files (checked for expert name presence)

**Critical limitation:** Only 10 of 250+ episodes have full transcripts. Many experts cited in PDFs (Dan Lorang, Derek Teel, Alistair Brownlee, Lachlan Morton, Joe Friel) have dedicated episodes but no available transcripts. This means some quotes marked as "unverifiable" may be genuine but simply can't be confirmed from available data.

---

## Module-by-Module Grounding Assessment

### Module 1: Where You Actually Are (4 PDFs)

**Resources:** Entry Assessment Workbook, Training Audit Worksheet, Weekly Hours Mapping, Goal-Setting Framework (One-Two-Twelve)

**Grounding Rating: STRONGLY GROUNDED**

**Evidence:**
- The Dan Lorang quote ("What people try in general is they get a training plan and try to fit it in somehow and then it just ends up in pure stress and sickness is just a consequence of it") appears in the Entry Assessment Workbook AND the Weekly Hours Mapping template. It's attributed to "Roadman Cycling Podcast" and matches the protocol MDX file's Lorang attribution. Lorang has multiple verified podcast episodes (ep-2134, ep-2056, ep-2050, etc.). The quote *sounds authentic* — it has the slightly awkward phrasing of translated speech (Lorang is Austrian).
- The Training Audit Worksheet references Seiler's green-yellow-red model and the 80/20 polarised distribution — both are core Seiler concepts discussed extensively in verified Seiler episodes (ep-2095, ep-2148, etc.).
- Anthony's quote referencing "Professor Seiler's research" on the 80% easy riding is consistent with his speech patterns across all 10 transcripts.
- The One-Two-Twelve framework is structurally original to the Method — not a generic goal-setting template.
- The six-domain audit structure (power, training load, body comp, sleep, available hours, goal) is specific to the Roadman Method and directly ties to protocol 01.

**Quote verification status:**
- Dan Lorang "fit it in somehow" quote: **Unverifiable** (no Lorang episode transcript available), but present in protocol MDX and stylistically consistent with translated speech.
- Anthony/Seiler "80% easy" reference: **Consistent** with Seiler's known position and multiple episodes.

---

### Module 2: Building Your Training Architecture (5 PDFs + 1 TrainingPeaks)

**Resources:** Architecture Templates (6hr, 8hr, 10hr, 12hr), Session Library

**Grounding Rating: STRONGLY GROUNDED**

**Evidence:**
- The Seiler quote ("I'm going to begin with frequency. All I care about is you get out the door a certain number of times a week...") appears identically in all four architecture templates AND the protocol MDX. This is attributed to "Roadman Cycling Podcast." Seiler has verified episodes (ep-2095, ep-2148). The quote has Seiler's characteristic didactic style.
- The Session Library credits sessions to "Dan Lorang, Professor Seiler, John Wakefield, and Derek Teel" — all four have verified podcast episodes. The torque intervals match Wakefield's Bora-Hansgrohe protocols discussed in the protocol MDX.
- The Habis study reference in the Session Library ("The 2024 Habis study in PLOS ONE finally confirmed what they already knew") matches the knowledge base's detailed description. The study appears in transcript ep-new-study-finally-confirms.
- The four-rule framework (lock long ride first, easy means easy, one quality session, protect the total) is specific to the Roadman Method, not generic training advice.
- Heart rate ceiling alarms, RPE logging, and the "conversational" test are consistently referenced across transcripts.

**Quote verification status:**
- Seiler "begin with frequency" quote: **Unverifiable** from available transcripts but present in protocol MDX and stylistically authentic.
- Anthony/Habis study reference: **Partially verified** — the Habis study and 8.7% figure appear in the masters study transcript.

---

### Module 3: Fuelling the Engine (4 PDFs)

**Resources:** Daily Fuelling Framework, In-Ride Nutrition Calculator, Race Week Nutrition Planner, Performance Grocery Guide

**Grounding Rating: ADEQUATELY GROUNDED**

**Evidence:**
- Anthony's "Calories in versus calories out... this advice is so outdated" quote on the Daily Fuelling Framework is consistent with the knowledge base's stated position and appears in the protocol MDX. It's presented as Anthony's own words.
- Anthony's personal weight loss ("86 to 79kg... eating more food") is referenced across multiple transcripts — the Hincapie episode mentions "88 to 80kg" and the climbing episode references similar numbers. The slight discrepancy (86→79 vs 88→80) across sources suggests this is a real personal story told slightly differently each time, which is actually *more* authentic than fabrication.
- The in-ride carb targets (30-40g short Z2, 60-80g long Z2, 80-120g quality/race) match the protocol MDX and are consistent with values Anthony cites across at least 5 transcripts.
- Dr David Dunne and Dr Sarah Berry are cited as key experts. Dunne has verified episodes (ep-2044, ep-34). Berry's meal-order research is referenced in protocol MDX.
- The protein timing framework (0.4g/kg × 4 meals, casein pre-bed) matches the masters study transcript discussion.

**Concerns:**
- The Performance Grocery Guide is the *most generic* resource in the entire set. A grocery list of chicken breast, Greek yoghurt, oats, rice, bananas, etc. could come from any sports nutrition source. It doesn't reference any specific podcast conversation.
- The Race Week Nutrition Planner, while structurally sound, doesn't reference specific expert advice from the podcast — it's a standard 7-day carb-loading template.

**Quote verification status:**
- Anthony "calories in/out outdated" quote: **Consistent** with knowledge base but not found verbatim in transcripts.
- Anthony "86 to 79kg" personal story: **Verified with minor variance** across multiple transcripts.

---

### Module 4: Strength That Transfers (4 PDFs)

**Resources:** S&C Manual, Foundation Circuit Card, Exercise Demo Quick-Reference, S&C Integration Calendar

**Grounding Rating: STRONGLY GROUNDED**

**Evidence:**
- Derek Teel quotes dominate Module 4 content. The "undeniable at this point" quote and the "cut 60 minutes" quote both appear in the S&C Manual and protocol MDX. Teel has verified episodes (ep-2183, ep-2091).
- The Foundation Phase exercise selection (goblet squat, single-leg RDL, Bulgarian split squat, hip thrust, Pallof press, plank, calf raise) with specific sets/reps/tempo is clearly derived from the Derek Teel episode — these aren't generic exercises but a specific curated selection with cycling rationale.
- The Exercise Demo Quick-Reference explicitly credits "Derek Teel's coaching on the Roadman Cycling Podcast" for form cues.
- The three-phase progression (Foundation → Build → Maintain) mirrors the 12-week course structure and is specific to the Method.
- The S&C Integration Calendar correctly integrates the strength progression with the cycling periodisation — this reflects genuine coaching knowledge from the Teel and broader podcast conversations.
- The 2025 meta-analysis reference (17 studies, 262 cyclists) matches the masters study transcript exactly.

**Quote verification status:**
- Teel "undeniable" quote: **Unverifiable** (no Teel episode transcript) but present in protocol MDX and characteristic of coaching speech.
- Teel "cut 60 minutes" quote: **Unverifiable** but present in protocol MDX.

---

### Module 5: The Art of Getting Faster by Doing Less (4 PDFs)

**Resources:** Sleep Optimisation Checklist, Daily Readiness Score Template, Recovery Week Structure Guide, HRV Interpretation Quick Guide

**Grounding Rating: ADEQUATELY GROUNDED — bordering on WEAKLY GROUNDED for some resources**

**Evidence:**
- The Daily Readiness Score Template (RHR, HRV, sleep quality, muscle soreness, motivation, life stress → green/amber/red decision) is a specific Roadman Method framework that integrates concepts from Lorang's two-interval rule and Seiler's consistency emphasis from the protocol MDX.
- The Recovery Week Structure Guide (volume drops 40-50%, no intensity, Z2 only) is consistent with the 3:1 mesocycle structure discussed across multiple episodes.
- The protocol MDX for Module 5 has rich expert quotes (Seiler on sleep, Lorang on calibration, Teel on life stress).

**Concerns:**
- The Sleep Optimisation Checklist is **the weakest resource in the set**. "No screens 30 min before bed," "room 16-18°C," "no caffeine after 2pm," "blackout blinds" — this is boilerplate sleep hygiene advice available in any wellness article. None of these items reference specific podcast conversations. The only potentially podcast-derived element is the "magnesium glycinate 200-400mg" recommendation.
- The HRV Quick Guide is similarly generic — "same time every morning, same device, before coffee" is standard HRV advice, not podcast-derived content.
- Neither the Sleep Checklist nor the HRV Guide contains any quotes or expert attributions.

**Quote verification status:**
- No quotes appear in any Module 5 PDFs (unlike every other module). This is a red flag for podcast grounding.

---

### Module 6: Le Metier — The Craft (4 PDFs + 1 TrainingPeaks)

**Resources:** Mid-Course Progress Check, Pacing Strategy Cards, Climbing Checklist, Goal Recalibration Template

**Grounding Rating: STRONGLY GROUNDED**

**Evidence:**
- The Pacing Cards open with Anthony's Wiggins quote ("He used to ride the climb rather than ride against his rivals"). The Wiggins reference appears in the climbing transcript (ep-6) — **verified**.
- The Climbing Checklist maps directly to the "5 Fixable Reasons Your Climbing Is Slow" episode (ep-6), which has a full transcript. The five items (pacing, power-to-weight, cadence, fuelling, mental game) match the episode's five points exactly.
- The self-talk replacement ("Replace 'I can't hold this' with 'I'm choosing to hold this for 60 more seconds'") appears in both the Climbing Checklist and the Module 10 Self-Talk Framework — this is a specific Roadman Method technique, not generic advice.
- The Mid-Course Progress Check mirrors the same six domains from Week 1 — structurally original.
- The Goal Recalibration Template is simple but functionally tied to the Method's structure.

**Quote verification status:**
- Wiggins/pacing reference: **Verified** via climbing transcript (ep-6).
- Climbing Checklist content: **Verified** — maps to ep-6 transcript.

---

### Module 7: Periodisation (3 PDFs + 1 TrainingPeaks)

**Resources:** Season Planning Template, Mesocycle Builder Worksheet, Training Phase Cheat Sheet

**Grounding Rating: ADEQUATELY GROUNDED**

**Evidence:**
- The Mesocycle Builder attributes the 3:1 loading pattern to "Dan Lorang's framework — Roadman Cycling Podcast." Lorang's periodisation approach is discussed in the protocol MDX with specific quotes about consistency and load management. Lorang has many verified episodes.
- The Season Planning Template includes an Anthony quote about periodisation ("The coaches behind some of the best riders in the world — they periodise everything. Nothing is random."). This is consistent with his stated positions in the knowledge base.
- The Phase Cheat Sheet (Base/Build/Peak with intensity splits) is a well-structured summary that draws from Seiler, Lorang, and Friel — all verified podcast guests.

**Concerns:**
- The Season Planning Template's "work backward from A event" structure is standard periodisation advice found in any coaching manual. While the expert attribution is genuine, the actual template could come from any source.
- The Phase Cheat Sheet intensity splits (80/5/15 Base, 70/15/15 Build, 65/10/25 Peak) are presented without attribution — these are reasonable but not explicitly tied to any specific podcast conversation.

**Quote verification status:**
- Lorang 3:1 framework attribution: **Consistent** with protocol MDX but no transcript to verify exact words.
- Anthony "periodise everything" quote: **Consistent** with brand voice.

---

### Module 8: Race Weight Without the Misery (3 PDFs)

**Resources:** Body Composition Tracking, Performance Plate Guide, Race Weight Timeline Planner

**Grounding Rating: ADEQUATELY GROUNDED**

**Evidence:**
- Anthony's personal weight loss story ("I lost 7kg in 12 weeks. I went from 86 to 79kg. And I did it while eating more food") opens the Body Composition Tracking template. This personal story is verifiable across multiple transcripts with slight number variations — a marker of authenticity.
- The deficit-window approach (200-300 kcal on easy days only, protein floor 1.8-2.2g/kg) matches the protocol MDX and draws from Dr Dunne's podcast discussions.
- The Race Weight Timeline Planner's rule "Body comp work stops 3 weeks before your A event" is a specific coaching position consistent with the protocol MDX.

**Concerns:**
- The Performance Plate Guide (1/4 protein, 1/3 carbs, 1/3 vegetables for training days) is standard sports nutrition plate guidance. It contains no quotes, no expert attribution, and no podcast-specific content. This is the second-most generic resource after the Sleep Checklist.

**Quote verification status:**
- Anthony "86 to 79kg" story: **Verified** across multiple transcripts with natural variance.

---

### Module 9: Building Power Where It Counts (3 PDFs + 1 TrainingPeaks)

**Resources:** Torque Interval Cards, Power Profile Self-Assessment, S&C Phase 3 Maintain

**Grounding Rating: STRONGLY GROUNDED**

**Evidence:**
- The Torque Cards are **the single most strongly grounded resource** in the entire set. They contain:
  - Anthony's "coaches knew these protocols were wrong" quote — matches the knowledge base verbatim.
  - Explicit John Wakefield (Bora-Hansgrohe) attribution.
  - The 2024 Habis study with the specific 8.7% vs 4.6% VO2max improvement figure.
  - Exact session prescriptions (4×4 min at 40-60 RPM, 3×8 min at 50-65 RPM) that match protocol 09.
- This is a signature Roadman topic. The knowledge base identifies low-cadence torque training as a core differentiator, with deep podcast coverage across multiple Wakefield episodes.
- The Power Profile Self-Assessment (5-sec, 1-min, 5-min, 20-min, 60-min) with three rider types (Diesel, Puncher, Sprinter) maps to protocol 09's content.
- The S&C Phase 3 Maintain card correctly continues the Week 4 exercise selection at reduced volume — structurally consistent with the Method.

**Quote verification status:**
- Anthony "coaches knew" quote: **Verified** via knowledge base.
- Habis study 8.7% figure: **Verified** via masters study transcript.
- Wakefield/Bora attribution: **Verified** via episode MDX files.

---

### Module 10: The Brain Is the Limiter (4 PDFs)

**Resources:** Pre-Event Mental Preparation, In-Ride Self-Talk Framework, Stress Audit Template, 3-2-1 Race Prep Protocol

**Grounding Rating: ADEQUATELY GROUNDED**

**Evidence:**
- The Self-Talk Framework contains specific Roadman-originated replacement phrases ("I'm choosing to hold this for 60 more seconds" instead of "I can't hold this"). This matches Module 6's climbing checklist and protocol 10.
- The 3-2-1 Race Prep Protocol matches the protocol MDX's detailed race-prep sequence (carb-loading, opener session, meal timing, caffeine timing).
- The Stress Audit Template ties back to Derek Teel's quote about life stress and three kids — a specific podcast reference from protocol 05/10.

**Concerns:**
- The Pre-Event Mental Preparation checklist (kit laid out, bike checked, visualise three moments, box breathing) is largely standard race-prep advice. The box breathing technique is not specifically from a podcast conversation.
- The Stress Audit Template is functional but generic in structure — mapping stressors to days is a standard coaching practice.

**Quote verification status:**
- Self-talk replacements: **Consistent** with protocol MDX (original to the Method).
- 3-2-1 protocol: **Consistent** with protocol 10 MDX.

---

### Module 11: Your System, Integrated (4 PDFs + 1 TrainingPeaks)

**Resources:** Weekly Self-Coaching Review, Decision Tree Cards, Next-Phase Mesocycle Planner, Framework Summary

**Grounding Rating: STRONGLY GROUNDED**

**Evidence:**
- The Decision Tree Cards are **excellent examples of podcast-grounded content**. The "Feeling Ill" tree (above/below the neck, 48hrs after symptoms clear, return protocol) is specific coaching wisdom, not generic advice. The "Work Stress Spike" guidance (downgrade quality to Z2, shorten long ride by 30%) reflects the Lorang/Seiler philosophy of protecting consistency.
- The Framework Summary's "10 sentences" condensation of the entire Method is specific and not replicable from generic sources.
- The Weekly Self-Coaching Review structure (sessions planned vs completed, RPE, sleep quality, what went well/didn't/would change) is a specific implementation of the self-coaching philosophy discussed across protocols 07 and 11.

**Quote verification status:**
- No direct quotes in Module 11 PDFs, but content is structurally original to the Method.

---

### Module 12: Not Done Yet (4 PDFs + 1 TrainingPeaks)

**Resources:** Exit Assessment Workbook, 12-Week Progress Report, 90-Day Forward Plan, Resource Library (consolidated)

**Grounding Rating: STRONGLY GROUNDED**

**Evidence:**
- The Exit Assessment mirrors the Entry Assessment exactly (same six domains, same measurement conditions) — structurally integral to the Method.
- The 12-Week Progress Report uses the five-pillar reflection framework (coaching, nutrition, strength, recovery, community) — specific to the Roadman Method.
- The 90-Day Forward Plan with three phases (Consolidate, Progress, Execute) and guardrails (weekly review, recovery weeks, S&C, protein floor, sleep, community) is a genuine post-course planning tool.
- The Resource Library correctly catalogues all experts and their topics — no fabricated expert-topic pairings.
- The "You're not done yet" closing is the core brand statement.

**Quote verification status:**
- Resource Library expert attributions: **All verified** via episode MDX files.

---

## Quote Audit: Potentially Fabricated vs. Verifiable

### Quotes VERIFIED against transcripts or multiple sources:

1. **Anthony's weight loss story** (86→79kg / 88→80kg eating more) — appears across multiple transcripts with natural variance ✓
2. **Anthony's 80-120g carbs/hour** fuelling — consistent across 5+ transcripts ✓
3. **Habis 2024 study** (8.7% vs 4.6% VO2max, PLOS ONE) — referenced in masters study transcript and knowledge base ✓
4. **Wiggins/climbing pacing** reference — present in ep-6 transcript ✓
5. **Five fixable climbing reasons** — directly maps to ep-6 transcript ✓
6. **"Coaches knew protocols were wrong"** (Anthony on torque) — verified via knowledge base ✓

### Quotes UNVERIFIABLE but stylistically plausible:

These quotes appear in the PDFs with "— Roadman Cycling Podcast" attribution. The named speakers all have verified podcast episodes, and the quotes appear identically in the protocol MDX files (which are considered grounded). However, we have no transcript to confirm the exact wording.

7. **Dan Lorang** "fit it in somehow... pure stress and sickness" — No Lorang transcript. Stylistically consistent with translated Austrian-English. Appears in protocol 01. **Likely real but cannot confirm.**
8. **Stephen Seiler** "begin with frequency... get out the door" — No Seiler transcript for this specific episode. Consistent with Seiler's known pedagogical style (he uses sequential teaching). Appears in protocol 02. **Likely real but cannot confirm.**
9. **Derek Teel** "undeniable at this point that strength training benefits everything on the bike" — No Teel transcript. Consistent with a coach making a confident evidence-based claim. Appears in protocol 04. **Likely real but cannot confirm.**
10. **Derek Teel** "cut 60 minutes out total of your riding... shocked if you did not feel significantly better" — Same source issue. Appears in protocol 04. **Likely real but cannot confirm.**
11. **Dan Lorang** "three weeks of progressive load followed by one recovery week" — Attributed as "Dan Lorang's framework" in Mesocycle Builder. **Paraphrased attribution rather than direct quote — acceptable.**

### Quotes presenting potential concern:

12. **Anthony** "Calories in versus calories out... this advice is so outdated. It's not just incomplete. It's actually making you fatter." — This appears in the Daily Fuelling Framework and knowledge base. While consistent with Anthony's brand position, the phrasing is *very clean and polished* for what should be podcast speech. Anthony's real speech (per transcripts) tends to be more fragmented. **Possibly a cleaned-up version of something he said on the podcast, presented as a direct quote.**

13. **Anthony** "The coaches behind some of the best riders in the world — they periodise everything. Nothing is random." — In the Season Planning Template. Sounds like a podcast soundbite that's been polished for the page. **Minor concern — it's his own words either way.**

### Assessment of the Habis 2024 study:

The Habis study is described consistently across the PDFs, protocol MDX, knowledge base, and at least one transcript (masters study episode). The specific claims:
- Published in PLOS ONE
- Low-cadence group improved VO2max by 8.7% vs 4.6% for freely chosen cadence
- Maximum aerobic power improved 8.1% vs 3%
- Referenced as "2024 Habis study at Rocklaw University"

This is **accurately and consistently described** across all sources. The protocol MDX additionally names the prior null studies (Christopherson 2014, Nimmer 2012, Luda 2016, Witty 2016) that the knowledge base explains had flawed protocols. **Strongly grounded.**

---

## Generic Content Inventory

These resources could have come from any fitness source and lack podcast-specific grounding:

| Resource | Module | Issue |
|---|---|---|
| **05-sleep-optimisation.pdf** | 5 | Standard sleep hygiene advice. No quotes, no expert attribution, no podcast reference. |
| **05-hrv-quick-guide.pdf** | 5 | Standard HRV measurement advice. No quotes, no podcast reference. |
| **03-performance-grocery-guide.pdf** | 3 | Generic sports nutrition grocery list. No quotes, no podcast reference. |
| **08-performance-plate.pdf** | 8 | Standard plate-method guidance. No quotes, no podcast reference. |
| **10-pre-event-mental.pdf** | 10 | Mostly standard race-prep checklist. Box breathing is generic. |

These five resources are **WEAKLY GROUNDED** — they're sound practical tools, but a podcast listener wouldn't recognise them as coming from specific episodes.

---

## Recommendations for Strengthening Weak Sections

### Priority 1 — Add podcast grounding to the five weakest resources:

1. **Sleep Optimisation Checklist:** Add a Seiler or Brownlee quote about sleep from their podcast appearance. The protocol MDX has a great Seiler quote about Gustaf Iden's coaches using only sleep as a recovery modality — put it on the PDF.

2. **HRV Quick Guide:** Add the Daryl Fitzgerald reference from the winter training episode about the wellness composite score and how "wearable data is incomplete without context." This would tie the HRV guide to a specific podcast conversation.

3. **Performance Grocery Guide:** Add Dr Dunne's or Dr Berry's name and a specific recommendation from their episode. Even a brief "based on protocols discussed with Dr David Dunne on the Roadman Cycling Podcast" would ground it.

4. **Performance Plate Guide:** Same approach — attribute the plate ratios to Dunne's podcast discussion. The protocol MDX has Dunne quotes about fuelling distribution.

5. **Pre-Event Mental Preparation:** Add a Lachlan Morton or Shannon Maloyed quote about mental preparation. The ep-99 transcript has rich mindset content that could anchor this resource.

### Priority 2 — Verify or soften the unverifiable quotes:

For the 5-6 expert quotes that cannot be verified from available transcripts:
- **Option A:** Listen back to the specific episodes and confirm exact wording. If they're paraphrased, clean them up or mark them as paraphrased ("In Dan Lorang's words..." rather than direct quotation marks).
- **Option B:** Add episode numbers to quote attributions. Instead of "— Dan Lorang — Roadman Cycling Podcast", use "— Dan Lorang, Episode: Roglic's Coach Builds a Training Plan — Roadman Cycling Podcast". This grounds the quote to a specific, findable conversation.

### Priority 3 — Add episode references throughout:

The PDFs currently say "— Roadman Cycling Podcast" without episode specificity. Adding episode titles or numbers would significantly strengthen the "based on actual conversations" claim and help listeners connect the resources to content they've heard.

---

## Final Verdict

### ADEQUATELY GROUNDED — Needs targeted improvements, not a rebuild.

**The good news:**
- 41 of 46 PDFs contain content that is clearly derived from specific podcast conversations, named experts, and the Roadman Method's original framework.
- The structural architecture of the 12-week programme is genuinely built from podcast-sourced coaching wisdom — it is not a generic training plan.
- Expert attributions are accurate — every named expert has verifiable Roadman Cycling podcast episodes.
- The Habis 2024 study is accurately and consistently referenced.
- Signature content (torque protocols, five fixable climbing reasons, polarised architecture, One-Two-Twelve framework) is recognisably Roadman-specific.

**The issues:**
- 5 of 46 PDFs (11%) are effectively generic wellness/fitness content without meaningful podcast grounding.
- Several quotes presented as direct speech cannot be verified from available transcripts (though this may simply be a transcript availability issue, not fabrication).
- Anthony's own quotes are sometimes *too polished* for real podcast speech — they read like written brand copy rather than transcribed conversation.
- No PDFs reference specific episode numbers or titles, making the "podcast conversation" link implicit rather than explicit.

**Bottom line:** A podcast listener who completed the Roadman Method would recognise the expert voices, the specific protocols, and the coaching philosophy. They would *not* recognise the Sleep Checklist, HRV Guide, or Grocery List as coming from any particular episode. The fix is targeted, not structural.
