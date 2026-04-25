# Lib Data + llms.txt Fact-Check Audit

Date: 2026-04-23
Auditor: Claude (autonomous overnight pass)
Scope: Canonical structured-data files + AI crawler feeds.

## 1. Files checked

- `src/lib/guests.ts`
- `src/lib/guests/profiles.ts`
- `src/lib/personas.ts`
- `src/lib/testimonials.ts`
- `src/lib/topics.ts`
- `src/lib/training-plans.ts`
- `src/app/llms.txt/route.ts`
- `src/app/llms-full.txt/route.ts`

Cross-referenced every blog/podcast slug mentioned in these files against
`content/blog/*.mdx` and `content/podcast/*.mdx` (201 posts, 310 episode
MDX files on disk). All referenced slugs resolve.

Verified pillar values in `topics.ts` against `ContentPillar` union in
`src/types/index.ts` $€” all valid.

## 2. Guest profile corrections

No corrections needed. Spot checks against the landmine list:

- Dan Lorang: description correct (Head of Performance, Red Bull$€“Bora$€“Hansgrohe since 2017; leaving end of 2026; coached Frodeno, Haug, Charles-Barclay). Intentionally does NOT claim Iden / Blummenfelt.
- Dan Bigham: Hour Record 55.548 km (2022); Head of Engineering at Red Bull$€“Bora$€“Hansgrohe. Correct.
- Stephen Seiler: University of Agder; polarised training / 80-20. Correct.
- Tim Spector: ZOE founder, King's College London, microbiome. Correct.
- Rosa KlÃ¶ser: 2024 Unbound Gravel 200 winner, 2025 German gravel national champion, CANYON//SRAM zondacrypto. Correct.
- Greg LeMond: three-time TdF winner (1986, 1989, 1990). Correct.
- Joe Friel: The Cyclist's Training Bible, TrainingPeaks co-founder. Correct.
- Matt Bottrill: UK TT champion / cycling coach. Correct (KNOWN_CREDENTIALS).
- Lachlan Morton: EF Education$€“EasyPost, 2024 Unbound 200 winner. Correct.

Asker Jeukendrup is referenced in the landmine list but does not appear
in profiles.ts $€” `KNOWN_CREDENTIALS` / guest map do not contain him. No
change needed (optional: add as a future override entry).

## 3. Testimonial fixes

None. Each entry's `tier` field note in the brief doesn't match the actual
schema $€” `testimonials.ts` uses `personas: PersonaSlug[]` rather than a
"tier" enum. The persona values (plateau / event / comeback / listener) are
the real taxonomy and every entry uses valid values.

Spot-checked numeric claims:

- Damien Maloney +90 W: FTP 205 $†’ 295 = +90 W. Consistent.
- Chris O'Connor -16 kg: 84 $†’ 68 kg = 16 kg. Consistent.
- Brian Morrissey +15% FTP: 230 $†’ 265 = +15.2 %. Consistent.
- Blair Corey +60 W: 236 $†’ 296 = +60 W. Consistent.
- Gregory Gross 315 lbs $†’ sub-100 kg: 315 lb = 143 kg $†’ under 100 kg $‰ˆ 43 kg drop. Plausible over multiple years (timeline: Nov 2019 $†’ present).
- Vern Locke 915 W 5-sec + earlier 832 W max: 915 > 832. Consistent.
- Keano Donne 610 W 2-min (down from 615 W 2-min PB he mentions). Internal note: quote says "old PB was 615 W, new PB is 610 W, a 25 W improvement." The numbers inside the quote are self-contradictory (a 610 W new PB cannot be a 25 W improvement over 615 W). **Flagged for human review** $€” most likely the original was 585 W $†’ 610 W = +25 W, or the old PB was 585, not 615.

## 4. Training plan event data corrections

- `leadville-100`: `elevationGainM` 3,800 $†’ **3,810** (per landmine; Columbine Mine at 3,810 m).
- `ride-london-100`: edited by linter during this session $€” elevation 1,200 $†’ 900 m, description rewritten to reflect Essex route (post-2022). Left as updated.
- `fred-whitton-challenge`: Hardknott description "cobbled in places" $†’ "narrow unrelenting tarmac" (linter fix during session $€” Hardknott is tarmac, not cobbled). Left as updated.
- Spot-checked others: Maratona dles Dolomites (138 km / 4,230 m / 7 passes) correct; Mallorca 312 (312 km / 5,050 m / April) correct; Cape Epic (700 km / 15,000 m / 8 days) within canonical range; Badlands (800 km / 16,000 m) correct; Unbound Gravel (320 km rounded from 321.87) correct; Ã‰tape du Tour (175 km / 4,500 m) acceptable generic given yearly variation.

## 5. Persona updates

None required.

- `plateau`, `event`, `comeback`, `listener` all reference existing blog + podcast slugs.
- All four `ctaBody` strings mention "Not Done Yet coaching community" as required.
- No "Le Metier" references.
- No "1,400+" references. `listener.metaDescription` uses "1,300+ Roadman Podcast episodes" (matches canonical brand stat).

## 6. Topic / pillar fixes

None required.

- 10 topic hubs defined; every `pillar` is a valid `ContentPillar` ("coaching" | "nutrition" | "strength" | "recovery" | "community").
- All 173 slugs in `TOPIC_POST_MAP` exist as MDX files on disk.
- All 30 `featuredPostSlugs` in `TOPIC_ENRICHMENT` exist on disk.
- `cycling-coaching` description correctly cites "1,300+ podcast conversations".

## 7. llms.txt / llms-full.txt corrections

**`src/app/llms.txt/route.ts`**

- Intro paragraph: "six free browser-based calculators" $†’ "eight free browser-based calculators". The file itself lists eight tools (FTP Zones, Tyre Pressure, Race Weight, In-Ride Fuelling, Energy Availability, Shock Pressure, HR Zones, W/kg).

**`src/app/llms-full.txt/route.ts`**

- Brand section "Free calculator tools" line: appended `HR zones` and `W/kg` to the list of six (now eight), matching the Free Calculator Tools section below.
- Free Calculator Tools section: added `Heart Rate Zone Calculator` and `W/kg Calculator` lines (were missing despite being listed in llms.txt).
- Brand section: hard-coded "182 long-form blog guides" $†’ dynamic `${posts.length}` (current count: 201 $€” the static 182 was stale).
- Notable Guests list: "Rosa Kloser $€” 2024 Unbound Gravel winner" $†’ "Rosa KlÃ¶ser $€” 2024 Unbound Gravel 200 winner, 2025 German gravel national champion" (adds umlaut to match canonical name in `guests.ts` KNOWN_CREDENTIALS, adds "200" distance specificity per landmine, and completes her palmarÃ¨s).

Verified other canonical facts:

- "1,300+ episodes" $€” matches brand stat, present tense.
- "1M+ monthly listeners" $€” matches brand stat.
- "65K newsletter" $€” not mentioned in either file. Optional future addition.
- Dan Lorang bio in llms-full.txt correctly includes the April 2026 announcement.
- Ben Healy $€” 2025 Tour de France stage 6 winner + first Irish yellow jersey since Roche 1987. Correct.
- Dan Bigham $€” former UCI Hour Record holder; Head of Engineering RBBH. Correct.

## 8. Flagged for human review

1. **Keano Donne testimonial internal math** (testimonials.ts line 200):
   quote says "old 615W 2-min PB ... 25W improvement to 610W/2min". 610 cannot be a 25 W improvement on 615. Either the old PB is wrong (likely 585 W) or the new one is (likely 640 W). Needs the original Skool post / Anthony to confirm.

2. **Cape Epic km/elevation**: `700 km / 15,000 m` is on the upper boundary
   of recent editions (most 2022$€“2025 editions have been 600$€“640 km,
   14,500$€“15,000 m). Not strictly wrong as a typical composite, but worth
   updating to the 2026 edition's official numbers once published by ASG.

3. **Mallorca 312 route Sa Calobra inclusion**: Sa Calobra has been dropped
   from the official 312 route in some recent editions. The description
   still leans on Sa Calobra as the defining climb. Verify against the 2026
   official route when published.

4. **Ã‰tape du Tour generic numbers**: 175 km / 4,500 m is a reasonable
   average but the event changes yearly. Consider parameterising or noting
   "typical" framing rather than stating as fixed.

5. **Asker Jeukendrup** is called out in the audit brief landmines but has
   no profile override. If he's been on the podcast, a profiles.ts entry
   would be worth adding (CHO oxidation / multiple transportable CHO / sports nutrition researcher).

## 9. Commit hash

`c1e074d` $€” "Fact-check lib data + llms.txt feeds" on `main`.
Not pushed (per brief: **Do NOT push**).

Staged files only (no `git add -A`):

- `src/lib/training-plans.ts`
- `src/app/llms.txt/route.ts`
- `src/app/llms-full.txt/route.ts`
- `scripts/audits/lib-data-factcheck.md`

Unrelated in-flight edits to `content/`, `src/app/(community)`, etc. from
other ongoing work were intentionally left unstaged.
