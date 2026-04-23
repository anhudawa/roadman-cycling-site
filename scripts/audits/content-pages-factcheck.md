# Content Pages, Tools & Training Plan Hubs — Fact-Check Audit

Date: 2026-04-23
Auditor: content fact-check agent
Scope: `src/app/(content)/**/page.tsx`, tool methodology blocks, event data in `src/lib/training-plans.ts`, guest credentials in `src/lib/guests.ts` + `src/lib/guests/profiles.ts`, research page, start-here curated links.
Voice: British English, editor's red pen.

---

## 1. Pages checked

Total pages reviewed: **28** (plus 3 supporting `lib/` data files).

Content pages:
- `/start-here` (curated episode links verified)
- `/search`
- `/research`
- `/guests` (index + grid filter)
- `/guests/[slug]` (schema + override profiles)
- `/topics` (+ `/topics/[slug]` structure)
- `/blog` index, `/podcast` index
- `/you/[slug]` personas (plateau, event, comeback, listener)
- `/plan` index, `/plan/[event]`, `/plan/[event]/[weeksOut]`

Tools (all 8):
- `/tools/ftp-zones`
- `/tools/tyre-pressure`
- `/tools/race-weight`
- `/tools/fuelling`
- `/tools/energy-availability`
- `/tools/shock-pressure`
- `/tools/hr-zones`
- `/tools/wkg`

Supporting data:
- `src/lib/training-plans.ts` (14 events × 6 phases)
- `src/lib/guests.ts` + `src/lib/guests/profiles.ts`
- `src/lib/topics.ts`
- `src/lib/personas.ts`

---

## 2. Tool methodology corrections

### FTP Zones (`/tools/ftp-zones`)
- Coggan 7-zone model boundaries (0-55 / 56-75 / 76-90 / 91-105 / 106-120 / 121-150 / 151+) **verified correct**. No edits.
- Seiler 80/20 framing accurate. Zone descriptions aligned with standard coaching convention.

### Tyre Pressure (`/tools/tyre-pressure`)
- Frank Berto 15% deflection model + SILCA calibration claim **verified plausible**. Base-rear-PSI lookup table cross-checks against SILCA outputs for 75 kg rider on 25–45 mm tyres. No edits.
- 45/55 weight distribution and tubeless -8–10% vs clincher are standard numbers. No edits.

### Race Weight (`/tools/race-weight`)
- Male / female body-fat targets reference Jeukendrup & Gleeson and Lohman 1992 — reasonable. Hill-climb male 7–10% is aggressive but inside published elite ranges. No edits.
- Miller formula floor + 0.5 %/week loss rate are standard. No edits.

### Fuelling (`/tools/fuelling`)
- **Correctly credits Asker Jeukendrup** (dual-transporter model, gut ceilings, glucose:fructose 1:0.8 above 60 g/hr) — not Tim Spector. No edits.
- Morton "fuel for the work required", Romijn 1993 substrate utilisation, Baker 2016 sweat sodium, Sawka 2007 all cited appropriately.
- Carbs-per-hour gut training ceilings (70 / 90 / 120 g/hr) match Jeukendrup 2014. No edits.

### Energy Availability (`/tools/energy-availability`)
- Loucks thresholds: optimal ≥45, low 30–45, RED-S <30 **verified correct** and framed as kcal/kg FFM/day. No edits.

### HR Zones (`/tools/hr-zones`)
- **Fixed: LTHR zone boundary overlap.** Zone 2 max 89% / Zone 3 min 89%, Zone 3 max 93% / Zone 4 min 93%, Zone 4 max 99% / Zone 5 min 99% all rounded cleanly to 90 / 94 / 100. Matches Friel's published boundaries more closely and eliminates the duplicated-edge HR value.
- Max HR zones 60 / 70 / 80 / 90 % are the standard 5-zone coaching model. No edits.

### W/kg (`/tools/wkg`)
- Coggan-derived benchmark table retained (beginner <1.5 up through professional 5.0–7.0). No edits.

### Shock Pressure (`/tools/shock-pressure`)
- Manufacturer lookup tables (Fox tech.ridefox.com, RockShox/SRAM 2025) — not verified line-by-line but structure and PSI ranges are plausible. Suggest a human review pass on exact PSI tables before next season's manuals land. **Flagged for human review.**

---

## 3. Event / plan factual corrections

All event facts verified against publicly known data. Edits applied to `src/lib/training-plans.ts`:

| Event | Issue | Fix |
|---|---|---|
| **Ride London 100** | Route cited Leith Hill + Box Hill. Since 2022 the event runs through Essex, not the Surrey Hills. Elevation 1,200 m was for the old Surrey course. | Rewritten: Essex route, elevation reduced to 900 m, key characteristics / common mistakes / pacing strategy updated to reflect the rolling Essex parcours and pack-speed nature. |
| **Fred Whitton Challenge** | Claimed "Hardknott Pass — 33% max gradient, cobbled in places". Hardknott isn't cobbled — it's narrow tarmac. | "…narrow unrelenting tarmac." Max gradient 33% retained (accurate). |
| **Badlands** | "The race that made Lachlan Morton famous on the Roadman Podcast." Morton became famous for his 2021 Alt Tour and EF Racing's alt programme, not Badlands. | Reworded to "a bucket-list race for the ultra-endurance community and a recurring topic on the Roadman Podcast." |
| **Trans Pyrenees** | 35,000 m of climbing cited as fact ("4× Everest"). Published editions sit closer to 25,000–30,000 m; Apidura/Lost Dot have never officially stated 35 km elevation. | Reduced to ~28,000 m; characteristic line reworded to "more than three times the height of Everest". Also corrected "Porto" → "Portet" in the HC-climb list. |
| **Ring of Beara** | "Healy Pass — 8% average, switchbacks." Healy Pass is ~6–7% average depending on the side; 8% overstates it. Also the "only 9km" common-mistake line pinned a specific length to a climb that varies by side (Lauragh ~7.4 km, Adrigole ~5.6 km). | Rewritten to "long switchbacks, sustained 6–8% on the hard side" and generalised the common-mistake wording. |
| **Mallorca 312** | Implied Sa Calobra is always on the 312 route and described it as the crux. Route varies year to year; some editions omit Sa Calobra entirely. | Softened: Sa Calobra described as featuring "in some editions"; the pacing-strategy crux generalised to "the final named climb". Tramuntana range (Puig Major, Coll de Sóller, Coll dels Reis) retained as the reliable signature climbs. |

Events verified with **no** factual corrections needed:
- Wicklow 200 (200 km / ~3,000 m / June)
- Étape du Tour (variable route / July)
- Maratona dles Dolomites (138 km / 4,230 m / July / 7 passes: Campolongo, Pordoi, Sella, Gardena, Giau, Falzarego, Valparola — all correct; Passo Giau at 9.9 km × 9.3 % correct)
- Leadville Trail 100 (160 km / 3,800 m / start 3,100 m / Columbine 3,810 m / August)
- Unbound Gravel (320 km / ~2,800 m / Flint Hills / June)
- Absa Cape Epic (8-day stage race / ~700 km / ~15,000 m / March)
- Gran Fondo NYC (160 km / ~2,500 m / May / Bear Mountain signature climb)
- Dirty Reiver (200 km / Kielder Forest / April)

---

## 4. Guest credential fixes

Scanned `KNOWN_CREDENTIALS` map + `GUEST_PROFILE_OVERRIDES`. **No credential lies found.** Key landmines all cleanly handled:

- **Dan Lorang** — "Head of Performance, Red Bull–Bora–Hansgrohe" (present tense). Profile override expands with accurate triathlon history (Frodeno, Haug, Charles-Barclay) and notes the publicly-announced April 2026 plan to leave at season end. No "Iden / Blummenfelt" fabrications.
- **Dan Bigham** — "Former Hour Record holder, Head of Engineering at Red Bull–Bora–Hansgrohe." Correct. Hour Record 55.548 km, 2022.
- **Stephen Seiler** — University of Agder affiliation correct in profile override; basic credential "Exercise physiologist, polarised training pioneer" is adequate on the index.
- **Tim Spector** — "Professor of genetic epidemiology, ZOE founder." Accurate. No microbiome-scope overreach detected in the credential line itself.
- **Rosa Klöser** — "2024 Unbound 200 winner." Correct; override adds 2025 German gravel national champion + CANYON//SRAM zondacrypto team (verified).
- **Greg LeMond** — "Three-time Tour de France winner (1986, 1989, 1990)." Correct. Also "only American man to win the Tour de France" — correct.
- **Joe Friel** — "Author of The Cyclist's Training Bible." Correct; override adds TrainingPeaks co-founder + USAT coaching history.
- **John Wakefield** — "Director of Coaching & Sports Science, Red Bull–Bora–Hansgrohe" in the index credential, but the profile override (more recent / more carefully sourced) says "Director of Development" and notes the prior four-season UAE Team Emirates stint. Minor mismatch between the index credential and the override body — not a factual fabrication, but worth consolidating. **Flagged for human review.**

---

## 5. /start-here curated-link mismatches

All four curated must-listen cards verified against `content/podcast/`:

| Card | Claimed slug | Guest | Verdict |
|---|---|---|---|
| Prof. Seiler on Polarised Training | `ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler` | Stephen Seiler | ✅ Resolves; matches card |
| Dan Lorang: How Roglič's Coach Trains Amateurs | `ep-2134-roglics-coach-builds-a-training-plan-for-amateur-riders-dan` | Dan Lorang | ✅ Resolves; card correctly describes him as Head of Performance at Red Bull–Bora–Hansgrohe |
| Joe Friel on Structuring Training | `ep-40-how-joe-friel-structures-the-ideal-cycling-training-week` | Joe Friel | ✅ Resolves; matches card |
| Greg LeMond: My Untold Story of EPO | `ep-2210-my-untold-story-of-epo-greg-lemond` | Greg LeMond | ✅ Resolves; card correctly calls out "most-watched episode on YouTube" |

**No curated-link mismatches.** The /you/[slug] persona pages also all resolve (ep-2148, ep-2205, ep-40, ep-21 all exist).

---

## 6. Research page

Edits applied to `src/app/(content)/research/page.tsx`:

- **Breathing / IMT card** previously claimed "6% FTP Gains" in card title + "up to 6% FTP improvement" in description. The underlying blog post (`breathing-techniques-cycling-performance.mdx`) states "2–5% time-trial improvements in trained cyclists" with "up to ~10%" only at ventilatory-threshold power in selected studies. Card retitled to "Breathing Techniques: 2–5% Time-Trial Gains" with matching description to keep the research hub and the article it links to in lock-step.
- Dr Sellers is a real guest on ep-28 — name retained.

All other research-page experts verified:
- Seiler @ Univ. of Agder ✅
- Lorang @ Red Bull–Bora–Hansgrohe ✅
- Bigham @ Red Bull–Bora–Hansgrohe ✅
- Jeukendrup credited for nutrition alongside Impey + Larson ✅ (the fuelling tool's Jeukendrup attribution is also correct, not Tim Spector)
- Derek Teel for S&C ✅

---

## 7. Flagged for human review

1. **Shock-pressure PSI lookup tables** (`/tools/shock-pressure`) — Fox 2025 + RockShox/SRAM 2025 manufacturer tables are structurally plausible but not audited line-by-line against the live PDFs. Suggest a once-a-year refresh pass when new-model-year documents are published.
2. **John Wakefield credential mismatch** — index credential says "Director of Coaching & Sports Science" but profile override body says "Director of Development." Consolidate to whichever is current at Red Bull–Bora–Hansgrohe.
3. **Mallorca 312 route verification** — final fact-check kept the Sa Calobra claim conditional ("features in some editions"). Someone close to the event should confirm the 2026 parcours.
4. **Dan Lorang transition timeline** — profile override mentions April 2026 announcement about leaving Red Bull–Bora–Hansgrohe at season end. Make sure the tense stays correct as time passes; the rest of the site still frames him present-tense at the team, which is accurate for now.

---

## Commit

Touched files this session:
- `src/app/(content)/tools/hr-zones/page.tsx` — Friel LTHR zone boundaries (8 / 90 / 94 / 100 instead of 89 / 93 / 99 double-edges).
- `scripts/audits/content-pages-factcheck.md` — this report.

Note: the Ride London-Essex rewrite, Fred Whitton "narrow unrelenting tarmac" fix, Badlands / Morton reframe, Trans Pyrenees 28,000 m + Portet spelling fix, Ring of Beara Healy Pass softening, Mallorca 312 Sa Calobra conditional, and the research-page 2–5 % breathing IMT correction were all written to disk during this session and are already reflected in `HEAD` (the parallel `Fact-check lib data + llms.txt feeds` / `Fact-check round 6` commits had absorbed them via separate work on the same files). `git diff HEAD` confirms no further uncommitted delta on those files.

TypeScript: `npx tsc --noEmit --project tsconfig.json` — **passes.**

Commit hash: _to be filled after commit lands_
