# Method onboarding — training plan matrix

Single source of truth for the TrainingPeaks plans that need to exist
behind the Method onboarding quiz at `/method/onboarding`.

48 plans total: **4 goals × 4 weekly-hours tiers × 3 experience levels.**

The code-side source of truth is `src/lib/method/onboarding/plan-matrix.ts` —
if that file says a plan exists, this document must reflect it. If a
plan is missing in TrainingPeaks, the quiz will still recommend it and
the team needs to build it.

---

## Naming convention (must match TrainingPeaks exactly)

```
Method: {Goal} — {Level} — {hours}h/wk
```

Examples:
- `Method: Gran Fondo — Beginner — 6h/wk`
- `Method: Racing — Advanced — 12h/wk`
- `Method: Comeback — Intermediate — 8h/wk`

Hyphens are em-dashes (`—`, U+2014), not hyphen-minus. Match exactly.

---

## Internal code convention

```
{goal}--{level}--{hours}h
```

Examples:
- `gran-fondo--beginner--6h`
- `racing--advanced--12h`
- `comeback--intermediate--8h`

Used in URLs, log lines, and the API contract.

---

## Goals

| Code | Display label | Periodisation default |
|---|---|---|
| `gran-fondo` | Gran Fondo / Sportive | Base 4 / Build 5 / Peak 3 |
| `racing` | Racing (Crit / Road) | Base 3 / Build 5 / Race 4 (with recovery weeks) |
| `general-fitness` | General fitness & health | 12 progressive weeks, recovery every 4th |
| `comeback` | Comeback (returning after break) | Re-base 6 / Build 4 / Consolidate 2 |

## Weekly hours tiers

`6`, `8`, `10`, `12` hours per week.

## Experience levels

| Code | Display label |
|---|---|
| `beginner` | Beginner — new to structured training |
| `intermediate` | Intermediate — some structure |
| `advanced` | Advanced — experienced with training plans |

---

## Full matrix — 48 plans

Each row is one TrainingPeaks plan that must exist.

### Goal: Gran Fondo / Sportive (12 plans)

| # | Plan name | Code |
|---:|---|---|
| 01 | Method: Gran Fondo — Beginner — 6h/wk | `gran-fondo--beginner--6h` |
| 02 | Method: Gran Fondo — Intermediate — 6h/wk | `gran-fondo--intermediate--6h` |
| 03 | Method: Gran Fondo — Advanced — 6h/wk | `gran-fondo--advanced--6h` |
| 04 | Method: Gran Fondo — Beginner — 8h/wk | `gran-fondo--beginner--8h` |
| 05 | Method: Gran Fondo — Intermediate — 8h/wk | `gran-fondo--intermediate--8h` |
| 06 | Method: Gran Fondo — Advanced — 8h/wk | `gran-fondo--advanced--8h` |
| 07 | Method: Gran Fondo — Beginner — 10h/wk | `gran-fondo--beginner--10h` |
| 08 | Method: Gran Fondo — Intermediate — 10h/wk | `gran-fondo--intermediate--10h` |
| 09 | Method: Gran Fondo — Advanced — 10h/wk | `gran-fondo--advanced--10h` |
| 10 | Method: Gran Fondo — Beginner — 12h/wk | `gran-fondo--beginner--12h` |
| 11 | Method: Gran Fondo — Intermediate — 12h/wk | `gran-fondo--intermediate--12h` |
| 12 | Method: Gran Fondo — Advanced — 12h/wk | `gran-fondo--advanced--12h` |

### Goal: Racing — Crit / Road (12 plans)

| # | Plan name | Code |
|---:|---|---|
| 13 | Method: Racing — Beginner — 6h/wk | `racing--beginner--6h` |
| 14 | Method: Racing — Intermediate — 6h/wk | `racing--intermediate--6h` |
| 15 | Method: Racing — Advanced — 6h/wk | `racing--advanced--6h` |
| 16 | Method: Racing — Beginner — 8h/wk | `racing--beginner--8h` |
| 17 | Method: Racing — Intermediate — 8h/wk | `racing--intermediate--8h` |
| 18 | Method: Racing — Advanced — 8h/wk | `racing--advanced--8h` |
| 19 | Method: Racing — Beginner — 10h/wk | `racing--beginner--10h` |
| 20 | Method: Racing — Intermediate — 10h/wk | `racing--intermediate--10h` |
| 21 | Method: Racing — Advanced — 10h/wk | `racing--advanced--10h` |
| 22 | Method: Racing — Beginner — 12h/wk | `racing--beginner--12h` |
| 23 | Method: Racing — Intermediate — 12h/wk | `racing--intermediate--12h` |
| 24 | Method: Racing — Advanced — 12h/wk | `racing--advanced--12h` |

### Goal: General Fitness & Health (12 plans)

| # | Plan name | Code |
|---:|---|---|
| 25 | Method: General Fitness — Beginner — 6h/wk | `general-fitness--beginner--6h` |
| 26 | Method: General Fitness — Intermediate — 6h/wk | `general-fitness--intermediate--6h` |
| 27 | Method: General Fitness — Advanced — 6h/wk | `general-fitness--advanced--6h` |
| 28 | Method: General Fitness — Beginner — 8h/wk | `general-fitness--beginner--8h` |
| 29 | Method: General Fitness — Intermediate — 8h/wk | `general-fitness--intermediate--8h` |
| 30 | Method: General Fitness — Advanced — 8h/wk | `general-fitness--advanced--8h` |
| 31 | Method: General Fitness — Beginner — 10h/wk | `general-fitness--beginner--10h` |
| 32 | Method: General Fitness — Intermediate — 10h/wk | `general-fitness--intermediate--10h` |
| 33 | Method: General Fitness — Advanced — 10h/wk | `general-fitness--advanced--10h` |
| 34 | Method: General Fitness — Beginner — 12h/wk | `general-fitness--beginner--12h` |
| 35 | Method: General Fitness — Intermediate — 12h/wk | `general-fitness--intermediate--12h` |
| 36 | Method: General Fitness — Advanced — 12h/wk | `general-fitness--advanced--12h` |

### Goal: Comeback — returning after a break (12 plans)

| # | Plan name | Code |
|---:|---|---|
| 37 | Method: Comeback — Beginner — 6h/wk | `comeback--beginner--6h` |
| 38 | Method: Comeback — Intermediate — 6h/wk | `comeback--intermediate--6h` |
| 39 | Method: Comeback — Advanced — 6h/wk | `comeback--advanced--6h` |
| 40 | Method: Comeback — Beginner — 8h/wk | `comeback--beginner--8h` |
| 41 | Method: Comeback — Intermediate — 8h/wk | `comeback--intermediate--8h` |
| 42 | Method: Comeback — Advanced — 8h/wk | `comeback--advanced--8h` |
| 43 | Method: Comeback — Beginner — 10h/wk | `comeback--beginner--10h` |
| 44 | Method: Comeback — Intermediate — 10h/wk | `comeback--intermediate--10h` |
| 45 | Method: Comeback — Advanced — 10h/wk | `comeback--advanced--10h` |
| 46 | Method: Comeback — Beginner — 12h/wk | `comeback--beginner--12h` |
| 47 | Method: Comeback — Intermediate — 12h/wk | `comeback--intermediate--12h` |
| 48 | Method: Comeback — Advanced — 12h/wk | `comeback--advanced--12h` |

---

## Build notes for the TrainingPeaks library

### Periodisation by goal

- **Gran Fondo** — Polarised 80/20. Sustained sweet-spot work in Build,
  long endurance rides on weekends, two-week taper into the event.
- **Racing** — Pyramidal with race-pace efforts. VO2 and threshold are
  the headline weekday sessions, race-pace inside Build, opener
  workouts before Race weeks. Recovery week every fourth.
- **General Fitness** — Pyramidal with no peak. Endurance and tempo
  dominate, sweet-spot once a week. Recovery every fourth week. No
  taper at the end — the plan resets and runs again.
- **Comeback** — Endurance-heavy. Intensity reintroduced slowly through
  Build. The two final Consolidate weeks are about laying down
  durability, not pushing peaks.

### Level adjustments (apply across all goals)

- **Beginner** — RPE-first prescriptions with power as a backstop.
  Lower weekly intensity load. Two genuine rest days. Sessions written
  in plain English, no jargon, no acronyms.
- **Intermediate** — Power-targeted intervals, RPE backstops, FTP-based
  zones. Standard recovery week every fourth.
- **Advanced** — Power and HRV-aware loading. Higher density of
  quality. More autonomy on warm-ups and cool-downs. Optional
  add-on sessions on top of the prescribed week.

### Volume targets (longest ride per week, by hours tier)

| Hours/wk | Longest ride (Base) | Longest ride (Build/Peak) |
|---:|---|---|
| 6  | 1.5 h | 2 h |
| 8  | 2 h | 2.5–3 h |
| 10 | 2.5 h | 3–4 h |
| 12 | 3 h | 4–5 h |

### Strength & conditioning

Cycling-specific S&C runs in parallel with every plan — bodyweight,
core, single-leg, and hip-stability work. **No heavy compound lifts.**
The Method's audience (35–55) carries injury history and time
constraints; the S&C is designed to make them more durable on the bike,
not to chase 1RMs.

### Calibration inputs (do not change the plan, only its setup)

- **FTP** — seeds zones in TrainingPeaks at plan assignment time. If
  the rider didn't supply one, Module 01 includes an honest baseline
  test and the team revisits zones after week 1.
- **Event date** — drives where in the 12-week block the rider starts.
  Less than 8 weeks → compress into a peaking block (skip front of
  Base, run Build into Peak). 12–16 weeks → exact fit. 16+ weeks →
  extended Base before the structured block begins.

---

## Edge cases the recommender flags

The quiz lets the rider pick any combination, but `recommend()` adds a
tuning note for these unusual combos. The TrainingPeaks plan itself
doesn't need to change — the note is for the rider's awareness and the
team's setup:

- **Comeback + 12h + non-advanced** — "Twelve hours is a lot of
  comeback volume. Drop to 10h if a few weeks in this feels too much."
- **Beginner + 12h** — "Twelve hours as a beginner is ambitious. First
  month deliberately keeps intensity low to let adaptation catch up."
- **Racing + 6h** — "Six hours for racing is the tight end. Every
  session has to count; you'll do less endurance volume than you'd
  like."

---

## Verification checklist

Before the onboarding quiz can go live, the team needs to confirm:

- [ ] All 48 plans exist in the TrainingPeaks library with the exact
      names listed in this document.
- [ ] Each plan ships with the structure and intensity distribution
      documented above.
- [ ] S&C add-on is attached to every plan (cycling-specific,
      no heavy compound lifts).
- [ ] Zone-setting workflow is documented for both with-FTP and
      without-FTP onboardings.
- [ ] Email template to sarah@roadmancycling.com (or a dashboard
      surface) is in place to notify the team when a rider submits the
      "Apply this plan" CTA on `/method/onboarding`.
