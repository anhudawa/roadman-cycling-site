# Tour de France 2026 Stage Data — Verification Report

**Date:** 6 July 2026
**Method:** 17-agent verification swarm. Each of the 21 stages was fact-checked
by a first-pass agent and then independently re-checked by a second adversarial
agent doing its own web searches; the two blogs and the history file were each
checked by a dedicated agent. Every finding below survived the double-check.

**Files verified:**
- `src/data/tour-de-france-2026.ts` — stage fixture (all 21 stages) — **working-tree state**
- `src/app/tour-de-france/stage/[number]/page.tsx` — stage page template
- `content/blog/tour-de-france-2026-complete-guide.mdx`
- `content/blog/tour-de-france-2026-route-what-it-means-for-you.mdx`
- `src/data/tour-history.ts`

**Sources cross-referenced:** letour.fr / Étape du Tour, Wikipedia (2026 TdF,
citing ASO press kit of 23 Oct 2025), cyclingstage.com, procyclingstats,
intervals.icu, domestiquecycling.com, cyclingnews, franceletour, procyclinguk,
Olympics.com. No single source was trusted alone.

> **Note on the working tree:** `tour-de-france-2026.ts` carries uncommitted
> edits that already corrected the earlier Stage 20 Galibier length (17.7 km /
> 6.8%) and added Col de Sarenne, and reassigned the Stage 13 range to Vosges
> and Stage 15 to Alps. This report verifies that current state and supersedes
> the previous version of this file, which described the pre-edit data.

---

## Verdict at a glance

| Stage | Route | Verdict |
|---|---|---|
| 1 | Barcelona → Barcelona (TTT) | ✓ Verified |
| 2 | Tarragona → Barcelona | ✓ Verified |
| 3 | Granollers → Les Angles | ✗ Climb-length error |
| 4 | Carcassonne → Foix | ✗ Prose error ("five categorised climbs") |
| 5 | Lannemezan → Pau | ✓ Verified (minor: empty climbs array) |
| 6 | Pau → Gavarnie-Gèdre | ✓ Verified |
| 7 | Hagetmau → Bordeaux | ✓ Verified |
| 8 | Périgueux → Bergerac | ✓ Verified |
| 9 | Malemort → Ussel | ✗ Climb-length error + missing climbs |
| 10 | Aurillac → Le Lioran | ✗ Wrong climb headlined, finish climb missing |
| 11 | Vichy → Nevers | ✓ Verified |
| 12 | Magny-Cours → Chalon-sur-Saône | ✓ Verified |
| 13 | Dole → Belfort | ✗ Climb order reversed (minor) |
| 14 | Mulhouse → Le Markstein | ✗ Duplicated climb (Geishouse ≈ Col du Haag) |
| 15 | Champagnole → Plateau de Solaison | ✗ Climb category wrong (Cat 1 → HC) |
| 16 | Évian → Thonon-les-Bains (ITT) | ✓ Verified |
| 17 | Chambéry → Voiron | ✓ Verified (minor: two climb figures) |
| 18 | Voiron → Orcières-Merlette | ✓ Verified |
| 19 | Gap → Alpe d'Huez | ✓ Verified (minor: climb order / opening climb) |
| 20 | Le Bourg-d'Oisans → Alpe d'Huez | ✗ Climb order wrong (Galibier before Télégraphe) |
| 21 | Thoiry → Paris | ✓ Verified |

**Core facts on every stage — start, finish, distance, stage type, date and
day-of-week, summit-finish flag — are correct.** All errors below are in the
climb arrays or in prose; none change a stage's town, distance, type or date.

---

## Confirmed errors — recommend correcting

### 1. Stage 3 — Col du Calvaire length is ~30% too long
- **Data:** `Col du Calvaire — 14.9 km, 4.1%, 1836 m`
- **Correct:** ~**11.4 km** at 4.1%, summit 1,836 m (cyclingstage 11.4 km,
  intervals.icu 11.37 km). Gradient and summit altitude are right; only the
  length is wrong.
- The double-check specifically refuted a web-search summary that echoed
  "14.9 km" — that figure traces back to this data file itself, not to any
  official source. **Suggested fix:** `lengthKm: 11.4`.

### 2. Stage 4 — description claims "five categorised climbs" (stated twice)
- **Data (description + tactical):** "Five categorised climbs with a downhill
  run to the line."
- **Correct:** The stage has ~five *named* ascents, but per cyclingstage and
  domestique only **two are categorised** (Col de Coudons and Col de Montségur).
  The other named rises — Villerouge, Bedos, Paradis — carry no KOM points.
- **Suggested fix:** reword to "five climbs, two categorised" (or similar) in
  both the `description` and `tactical.whoBenefits`/`whatToWatch` text.
- *Minor, same stage:* the climbs array lists Col du Paradis third, but on the
  road it comes first (early in the stage, before Coudons and Montségur).

### 3. Stage 9 — Mont Bessou length wrong, and two categorised climbs missing
- **Data:** `Mont Bessou — 4.2 km, 5.5%`
- **Correct:** Mont Bessou is a short **~0.8 km** final ramp (intervals.icu
  0.84 km; sources ~800 m at ~8.5%) to the high point of Corrèze — not a 4.2 km
  climb. Length is off by roughly 5×.
- **Missing climbs:** the four official categorised climbs are Côte de Naves
  (Cat 3), Suc au May (Cat 2), Côte de la Croix du Pey (Cat 3) and Mont Bessou
  (Cat 4). The data omits **Côte de Naves** (~2.3 km @ 7.6%) and **Côte de la
  Croix du Pey** (~6.9 km @ 4.9%).
- **Overturned first-pass claim:** the first pass flagged `Côte des Gardes` as
  invented. It is **not** — cyclingstage confirms it as a real uncategorised late
  rise at exactly 2.2 km / 4.8%, 14 km from the line. Keep it.

### 4. Stage 10 — the wrong climb is headlined; the finish climb is missing
- **Data climbs:** Pas de Peyrol (Puy Mary), Col de Pertus, **Col de Prat de Bouc**.
- **Issue:** Col de Prat de Bouc crests ~63 km from the line — it does not
  belong in a three-climb "decisive" list. The climb that actually creates the
  uphill finish, **Col de Font de Cère** (~3.1 km @ 5.8%, cresting ~2.5 km from
  Le Lioran), is absent, even though the prose refers to "into Le Lioran."
- **Suggested fix:** replace Prat de Bouc with Col de Font de Cère so the finale
  reads Puy Mary → Col de Pertus → Col de Font de Cère.
- *Confirmed correct:* `summitFinish: true` is right (the first pass questioned
  it; the double-check confirmed Le Lioran is an effective uphill finish).

### 5. Stage 14 — Geishouse duplicates the Col du Haag
- **Data:** lists `Col du Haag — 11.2 km, 7.3%` **and** `Geishouse — 10.9 km,
  7.3%` as separate consecutive climbs.
- **Issue:** these are the same final ascent. intervals.icu lists only the Col
  du Haag as the last categorised climb; cyclingstage describes Geishouse as the
  short (~4 km @ 9%) final pitch of that same climb. The near-identical numbers
  (both ~11 km at 7.3%) are the giveaway — the ascent is entered twice.
- **Suggested fix:** remove the `Geishouse` entry (or correct it to the ~4 km @
  9% final pitch and drop the duplication).
- *Review items, same stage:* `summitFinish: true` is against source consensus
  (cyclingstage, domestique and cyclingnews describe a ~5–6 km flat run-in from
  the last climb to Le Markstein; only intervals.icu tags it a summit finish).
  Col du Haag is also listed second of three but is the final climb.

### 6. Stage 15 — Plateau de Solaison is HC, not Category 1
- **Data:** `Plateau de Solaison — category '1', 11.3 km, 9%`
- **Correct:** length and gradient are right, but franceletour and procyclinguk
  both rate this final wall **hors catégorie (HC)** — franceletour calls it
  "the steepest summit finish of the 2026 race," ramps past 12%. An 11.3 km
  climb averaging 9% would not be Cat 1.
- **Suggested fix:** `category: "HC"`.

### 7. Stage 20 — climb order is geographically impossible
- **Data order:** Croix de Fer → **Galibier → Télégraphe** → Sarenne → Alpe d'Huez.
- **Correct order:** Croix de Fer → **Télégraphe → Galibier** → Sarenne → Alpe
  d'Huez. The Télégraphe is the lower half of the same ascent (via Valloire) and
  always precedes the Galibier. All sources agree.
- **Suggested fix:** swap the Galibier and Télégraphe entries in the array.
- *Overturned first-pass claims:* the first pass called the Télégraphe and
  Sarenne categories ("1") hard errors. The double-check downgraded both to
  defensible — sources disagree (cyclingnews lists the Télégraphe as Cat 1;
  Sarenne's official label for this first-ever ascent is not reliably published).
  The Galibier (17.7 km / 6.8% / 2,642 m), Croix de Fer (24 km / 5.2% / 2,067 m)
  and the 5,600 m elevation figure all check out.

### 8. Stage 13 — climb order reversed (minor)
- **Data order:** Ballon d'Alsace, then Col des Croix.
- **Correct order:** Col des Croix (~km 157) comes **before** Ballon d'Alsace
  (~km 176, the day's last climb). Numbers are right; only the sequence is wrong.

---

## Minor discrepancies and discretionary omissions (not errors)

These are within source-rounding tolerance or are choices the file's own honesty
policy permits. Listed for completeness; none is required to fix.

- **Stage 1:** distance 19.7 km vs official 19.6 km (0.1 km rounding).
- **Stage 3:** elevation 4,000 m vs sources' ~3,850 m (~4% over). Collada de
  Toses could carry its confirmed `category: "1"` and `summitM: 1778`.
- **Stage 5:** climbs array is empty; the roadbook has three small Cat-4 rises
  (~1–1.5 km) in a 12 km window. They do not change the flat/sprint character.
- **Stage 10:** elevation 3,700 m vs sources' 3,791–3,900 m. Puy Mary and Col de
  Pertus are firmly Cat 1 and could be labelled.
- **Stage 11:** spelling — "Billy-Chevannes" vs sourced "Billy-Chévannes".
- **Stage 15:** no `elevationGainM` (the only mountain stage without one; sources
  span ~3,950–4,700 m). Col de la Savine's 5.9 km / 4.6% could not be confirmed
  or refuted — the climb is real but sources don't publish exact figures.
- **Stage 17:** Col de Couz (data 6.3 km / 4.4% vs roadbook ~8.6 km / 2.8%) and
  Col des Prés (data 8.1 km / 5.2% vs roadbook ~3.5 km / ~6.7%) appear to measure
  a different segment than the ASO roadbook. Worth an eye. Range "Alps (approach)"
  is loose — the climbs are Chartreuse/Bauges pre-Alps.
- **Stage 19:** the array lists the Alpe d'Huez finish climb first and omits the
  opening Col Bayard; on-road order is Bayard → Noyer → Ornon → Alpe d'Huez. All
  listed climbs are genuinely on the stage.
- **Stage 20:** the Alpe d'Huez entry uses the standard 13.8 km / 8.1% profile;
  on this stage the Alpe is reached via the Col de Sarenne, so some profiles
  tabulate only the final ~3.7 km. Defensible for a summit-finish reference.

---

## Content files

### `tour-de-france-2026-complete-guide.mdx` — one error
- **✗ Error:** Isaac del Toro is described as "21 years old" (body line 171,
  framing echoed at 163). Born 27 November 2003, he is **22** during the July
  2026 Tour. **Fix:** change "21" to "22".
- **Minor:** Barcelona TTT given as 19.7 km (official 19.6 km); total climbing
  54,450 m matches the data file and cyclingstage, though BikeRadar cites
  53,950 m (~1% spread). Both are defensible published figures.
- **Flag for an editor's eye (search was intermittent, could not fully confirm):**
  the claim that Pogačar's only 2026 defeat was Paris-Roubaix, and the exact
  opening-weekend GC gaps (+6 s / +15 s / +16 s). Both are internally consistent
  and plausible; Vingegaard taking yellow via the Visma TTT win and del Toro
  winning Stage 2 are confirmed.
- All load-bearing route facts verified: 8 mountain stages, 5 summit finishes,
  five ranges including the Jura, first TTT opener since 1971, back-to-back Alpe
  d'Huez, queen stage = Stage 20, Plateau de Solaison 11.3 km @ 9%, Montmartre
  triple ascent, July 4–26, 23 teams / 184 riders / 27 nationalities. Contender
  and history facts (Vingegaard's 2026 Giro win, Pantani 1998 as the last
  Giro-Tour double *at the time*, Seixas at 19, Alpe d'Huez since 1952) verified.

### `tour-de-france-2026-route-what-it-means-for-you.mdx` — no hard errors
- **Minor:** "Stage 20 does it again" implies the same 21-hairpin ascent, but
  Stage 20 reaches Alpe d'Huez via the Col de Sarenne — the first Tour ascent
  that skips the 21 bends. The blog correctly attributes the hairpins to Stage 19
  only, so this is imprecise framing rather than a false statement; the Sarenne
  (the actual differentiator) is simply not mentioned.
- **Minor:** "around 5,600 m" for the queen stage sits at the top of the source
  range (Étape site 5,400 m, tour-magazin 5,450 m). Defensible approximation.

### `src/data/tour-history.ts` — one error
- **✗ Error (line ~130, Pantani article):** "In 1998 he won the Giro and the
  Tour in the same season, the last rider to manage the double." This is no
  longer true — **Tadej Pogačar completed the Giro-Tour double in 2024**. It is
  also internally inconsistent, since the same file repeatedly casts Pogačar as
  the modern star. **Fix:** "...the last rider to manage the double until Tadej
  Pogačar in 2024," or drop the superlative.
- **Minor (line ~103, Indurain article):** weight given as "80 kilograms"; most
  sources (Wikipedia) cite 76 kg. Height 1.88 m is correct. Within rounding.
- Everything else verified: 2026 route facts, climb stats (Alpe d'Huez 13.8 km /
  21 bends, Tourmalet 2,115 m, Galibier 2,642 m first crossed 1911), and the
  historical set pieces (Merckx 1969, LeMond 1989 eight seconds, Simpson 1967,
  Cavendish stage-win record, Festina 1998, and the rest).

### `src/app/tour-de-france/stage/[number]/page.tsx`
The stage page template renders fields from `tour-de-france-2026.ts` and asserts
no facts of its own. It inherits the data file's accuracy — correcting the eight
items above fixes the pages too. No template-level factual issues found.

---

## TOUR_META — all fields verified

Year 2026 · 113th edition · 4–26 July · Barcelona Grand Départ · Paris finish ·
rest days 13 & 20 July · 3,333 km · 54,450 m climbing · 21 stages · highest point
Col du Galibier 2,642 m (Stage 20) · ranges Pyrenees, Massif Central, Vosges,
Jura, Alps — all confirmed against multiple sources.

---

## Correction checklist (data file)

1. Stage 3 — `Col du Calvaire.lengthKm`: `14.9` → `11.4`
2. Stage 4 — description + tactical: "five categorised climbs" → "five climbs,
   two categorised"; move Col du Paradis ahead of Coudons/Montségur
3. Stage 9 — `Mont Bessou.lengthKm`: `4.2` → `~0.8`; add Côte de Naves (Cat 3)
   and Côte de la Croix du Pey (Cat 3); keep Côte des Gardes
4. Stage 10 — replace Col de Prat de Bouc with Col de Font de Cère (~3.1 km @ 5.8%)
5. Stage 13 — swap climb order: Col des Croix before Ballon d'Alsace
6. Stage 14 — remove the duplicated `Geishouse` entry; review the summit-finish flag
7. Stage 15 — `Plateau de Solaison.category`: `"1"` → `"HC"`
8. Stage 20 — swap array order so Télégraphe precedes Galibier

## Correction checklist (content)

9. `tour-de-france-2026-complete-guide.mdx` — Isaac del Toro "21" → "22"
10. `tour-history.ts` — Pantani "last rider to manage the double" → note Pogačar 2024
