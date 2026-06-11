# TrainingPeaks Plan Analysis

## Source Data
- Account: tedcrilly (ted@roadmancycling.com)
- Plans imported: 7 of Anthony Walsh's free plans
- API endpoint: `tpapi.trainingpeaks.com/fitness/v6/athletes/6389986/workouts`
- Total workouts retrieved: 222 (158 bike + 64 recovery days)
- Unique session types: 21 (20 bike + 1 rest day)
- Date extracted: 2026-05-11

## Plans Inventory

| Plan | Duration | Hrs/Week | Workouts/Week | Level |
|------|----------|----------|---------------|-------|
| 16 Week Gravel Race Plan | 16 weeks | 8.6 | 4-5 | Intermediate |
| 16 Week Road Race Plan | 16 weeks | 8.6 | 4-5 | Intermediate |
| 16 Week Sportive Plan | 16 weeks | 8.8 | 5 | Intermediate |
| 12 Week Base Plan | 12 weeks | 9.2 | 5 | Intermediate |
| 12 Week Build Plan | 12 weeks | 9.2 | 5 | Intermediate |
| 6 Week FTP Booster | 6 weeks | 9.2 | 5 | Intermediate |
| 6 Week VO2 Max Booster | 6 weeks | 8.3 | 5 | Intermediate |

**Critical Gap:** All plans cluster at 8-9 hrs/week Intermediate. No beginner (4-6 hrs), advanced (12-15 hrs), or low-volume variants exist.

---

## 16-Week Plan Structure (Road Race / Gravel / Sportive shared pattern)

### Periodisation: 4-Week Mesocycles (3 Build + 1 Recovery)

| Week | Hours | TSS | Phase | Key Sessions |
|------|-------|-----|-------|-------------|
| W1 | 7.9 | 364 | Base 1 | 30s Sprints, Mixed Cadence Spin, Z2 Endurance, Endurance w micro sprints |
| W2 | 9.0 | 440 | Base 1 | 30s Sprints, Mixed Cadence Spin, Z2 Endurance, Endurance w micro sprints |
| W3 | 9.1 | 465 | Base 1 | 30s Sprints, Mixed Cadence Spin, Z2 Endurance, Endurance w micro sprints |
| **W4** | **7.2** | **327** | **Recovery** | Deload — reduced volume & intensity |
| W5 | 7.8 | 338 | Build 1 (VO2) | 20/30/40 Vo2, High cadence set, 5x2 Mins Vo2, Endurance w micro sprints |
| W6 | 8.5 | 379 | Build 1 (VO2) | 20/30/40 Vo2, High cadence set, 5x2 Mins Vo2, Endurance w micro sprints |
| W7 | 9.0 | 418 | Build 1 (VO2) | 20/30/40 Vo2, High cadence set, 5x2 Mins Vo2, Endurance w micro sprints |
| **W8** | **7.3** | **291** | **Recovery** | Deload — reduced volume & intensity |
| W9 | 9.3 | 396 | Build 2 (Threshold) | Aero-Threshold Ramps, High/Low Cadence Turbo, 4x5min Threshold |
| W10 | 9.6 | 422 | Build 2 (Threshold) | Aero-Threshold Ramps, High/Low Cadence Turbo, 4x8 Threshold |
| W11 | 9.7 | 426 | Build 2 (Threshold) | Aero-Threshold Ramps, High/Low Cadence Turbo, 2x15 Threshold |
| **W12** | **8.4** | **350** | **Recovery** | Deload — reduced volume |
| W13 | 12.1 | 580 | Race Specific | Race Start Prep (x2), Aero Dev Tempo+Strength, Endurance |
| W14 | 12.0 | 625 | Race Specific | Breakaway Over/Unders (x2), Sprint-Maintain-Sprint, Aero Dev |
| W15 | 10.2 | 425 | Pre-Race | Race Pre-Race tuneup, Mixed Cadence Turbo, Aero Dev |
| **W16** | **3.5** | **156** | **Taper** | Taper Reps, Z2 Endurance, Pre Race Day |

### Weekly Day Pattern (consistent across all phases)

**As built in TP plans (5 ride days + 2 rest):**

| Day | TP Plan Role | Typical Session |
|-----|-------------|-----------------|
| Mon | Endurance | Z2 Endurance Ride (60-105min) — lightest session |
| Tue | Key Session 1 | Phase-specific interval work (30s Sprints / VO2 / Threshold) |
| Wed | **Rest** | Recovery Day (off bike) |
| Thu | Key Session 2 | Phase-specific structured work (Mixed Cadence / Ramps / etc.) |
| Fri | Endurance | Z2 Endurance Ride (60-105min) |
| Sat | Long Ride | Endurance w micro sprints (150-210min) |
| Sun | **Rest** | Recovery Day (off bike) |

**Anthony's coaching preference for new plan builds:**

| Day | Role | Session |
|-----|------|---------|
| Mon | **Rest** | Off bike |
| Tue | Key Session 1 | Phase-specific intervals (30s Sprints / VO2 / Threshold) |
| Wed | Endurance | Z2 Endurance Ride (moved from Fri) |
| Thu | Key Session 2 | Phase-specific structured work (Mixed Cadence / Ramps / etc.) |
| Fri | **Rest** | Recovery Day (moved from Wed) |
| Sat | Long Ride | Endurance w micro sprints (150-210min) |
| Sun | **Rest** | Off bike |

Key changes vs existing TP plans: Mon becomes rest (was Z2), Wed becomes endurance (was rest), Fri becomes rest (was endurance). This gives 4 training days (Tue/Wed/Thu/Sat) with 3 rest days (Mon/Fri/Sun) and better recovery spacing around the key sessions.

---

## Complete Session Library (21 types)

### 1. Z2 Endurance Ride
- **Zone:** Z2 (IF ~0.64)
- **Duration variants:** 60, 75, 80, 90, 100, 105 min
- **TSS range:** 40-71
- **Description:** Ride at zone 2 heart rate/easy intensity — conversational pace (intensity 4/10)
- **Fuel category:** LOW (steady state, fat-burning zone)

### 2. 30s Sprints
- **Zone:** Mixed (Z2 base + Z4 activation + full gas sprints) (IF ~1.05-1.12)
- **Duration variants:** 58, 64, 80, 93 min
- **TSS range:** 98-192
- **Description:** WU 10 min → Z2 3x1 min Z4 high cadence (100rpm+) w/ 1 min recovery Z1 → 5 min Z2 → MS 5x30s Full Gas Sprints w/ 4:30 recovery (3 OOS, 2 seated) → WD 15min Z2
- **Fuel category:** HIGH (neuromuscular + high glycolytic demand)

### 3. Recovery Day
- **Zone:** Off
- **Duration:** 0
- **TSS:** 0
- **Description:** Rest day
- **Fuel category:** REST

### 4. Mixed Cadence Endurance Spin
- **Zone:** Z2 with cadence variation (IF ~0.61)
- **Duration variants:** 76, 80, 87, 94 min
- **TSS range:** 48-58
- **Description:** 20 min WU → 4x2 min high cadence w/ 2 min recovery → 3x20 sec sprint w/ 2:40 recovery → 10 min climb effort → 20 min CD
- **Fuel category:** LOW-MODERATE (endurance base with brief surges)

### 5. Endurance w Micro Sprints
- **Zone:** Z1-Z2 with sprints (IF ~0.57)
- **Duration variants:** 150, 180, 195, 200, 210 min
- **TSS range:** 80-114
- **Description:** WU 10 min Z1 → MS 2.5 hrs Z2 → WD 10 min Z1. Include 4x6 sec sprints at 30 min (2 seated, 2 standing). Repeat 4x6 sec before cooldown. Ensure fueling and hydration.
- **Fuel category:** MODERATE (long duration, needs in-ride fueling)

### 6. 20/30/40 VO2
- **Zone:** VO2max (IF ~0.88-1.05+)
- **Duration variants:** 48, 58, 60, 74 min
- **TSS range:** 66-127
- **Description:** Warm Up → 2 sets of: (20s on/40s off, 30s on/30s off, 40s on/20s off) x3. Pretty all out session.
- **Fuel category:** HIGH (VO2max work, high glycolytic demand)

### 7. High Cadence Set
- **Zone:** High Z2/Low Z3 (IF ~0.56)
- **Duration variants:** 62, 72, 92 min
- **TSS range:** 32-48
- **Description:** Turbo. 10 min WU/CD. High cadence set at high Z2/low Z3: 4 min 80rpm → 3 min 85rpm → 2 min 100rpm → 1 min 110rpm → 3 min 100rpm → 2 min 90rpm → 1 min 80rpm. x2 sets, 10 min easy recovery between.
- **Fuel category:** LOW-MODERATE (steady with cadence variation)

### 8. 5x2 Mins VO2
- **Zone:** VO2max (IF ~0.70-0.78)
- **Duration variants:** 45, 50, 55, 60 min
- **TSS range:** 33-58
- **Description:** Tough block of efforts. If outdoors, complete on a hill. Get out of the saddle. The more you put in, the more you'll get out.
- **Fuel category:** HIGH (VO2max intervals)

### 9. Aerobic to Threshold Ramps
- **Zone:** Z2 → Threshold (IF ~0.74-0.78)
- **Duration variants:** 80, 85, 100 min
- **TSS range:** 64-95
- **Description:** 3 blocks of ramp-style efforts starting at Z2 and finishing at threshold. Eat and drink appropriately.
- **Fuel category:** MODERATE-HIGH (progressive intensity)

### 10. High/Low Cadence Turbo
- **Zone:** Mixed Z2-Z4 (IF ~0.66-0.71)
- **Duration variants:** 62, 70, 83 min
- **TSS range:** 46-65
- **Description:** 10 WU → 6x2 min alternating high/low cadence → 3x20 sec sprints → 2 min low cadence → 5 min climb → 10 CD
- **Fuel category:** LOW-MODERATE

### 11. 4x5min Threshold
- **Zone:** Threshold Z4 (IF ~0.73-0.76)
- **Duration variants:** 90, 120 min
- **TSS range:** 82-103
- **Description:** Threshold efforts
- **Fuel category:** MODERATE-HIGH

### 12. 4x8 Threshold
- **Zone:** Threshold Z4+ (IF ~0.80)
- **Duration variants:** 112 min
- **TSS range:** 112
- **Description:** Warm up with 5 min block of 30/30s increasing power. 4x8 min efforts with 5 min recoveries, +5% increase each time (90%, 95%, 100%, 105%). Cool down well. Max fueling today.
- **Fuel category:** HIGH (sustained threshold, coach says "max fueling")

### 13. 2x15 Threshold
- **Zone:** Threshold Z4 (IF ~0.76)
- **Duration variants:** 106 min
- **TSS range:** 98
- **Description:** WU 20 min → 3x1 min Z4 high cadence (100rpm+) w/ 1 min recovery Z1 → 5 min Z2 → MS 2x15 min Z4 w/ 5 min recovery → WD 15 min Z2
- **Fuel category:** HIGH (sustained threshold intervals)

### 14. Race Start Prep
- **Zone:** Mixed (Z2 → 125% FTP → 95% FTP) (IF ~0.88-0.92)
- **Duration variants:** 90, 100 min
- **TSS range:** 111-120
- **Description:** WU 20 min 55→75% FTP → MS 4x(2 min 125% FTP, 3 min 85% FTP) → 25 min 95% FTP → Low Cadence Finish 5x(1 min 100% FTP 60rpm, 30s 60% FTP) → CD 20 min
- **Fuel category:** HIGH (race-simulation intensity)

### 15. Aerobic Development - Tempo plus Strength
- **Zone:** Z2 with Tempo + Power Starts (IF ~0.63)
- **Duration variants:** 133, 135, 141 min
- **TSS range:** 102-108
- **Description:** Base endurance with 2 short tempo efforts (75-85rpm) and 2 sets of Power Starts (flat terrain, 0-5kmh, high gear e.g. 53x11-53x14, OOS, 4-8 pedal strokes/foot, 6 seconds each).
- **Fuel category:** MODERATE (long ride with tempo bursts)

### 16. Breakaway Over/Unders
- **Zone:** Over-under threshold (IF ~0.87-0.86)
- **Duration variants:** 91, 99 min
- **TSS range:** 108-115
- **Description:** WU 20 min progressive → 4x(4 min 105% FTP, 4 min 90% FTP) → 6x(20s 150% FTP, 2 min 75% FTP) → CD 10 min
- **Fuel category:** HIGH (over-under, race-specific)

### 17. Sprint-Maintain-Sprint-40/20
- **Zone:** Threshold + Sprint (IF ~0.93)
- **Duration variants:** 86 min
- **TSS range:** 118
- **Description:** "This is no joke." WU with activation ramp. Short sprint → 1 min threshold → another sprint → 4 min all-out 40/20s. Aim for 3 sets. "Eat as many carbs as you possibly can today — 100g fuel per hour."
- **Fuel category:** VERY HIGH (coach prescribes 100g/hr carbs)

### 18. Race Pre-Race Classic Tuneup
- **Zone:** Mixed (IF varies)
- **Duration variants:** 119 min
- **TSS range:** variable
- **Description:** Tuneup to prepare muscles and cardiovascular system for upcoming race. Short, hard intervals to make legs supple and responsive.
- **Fuel category:** MODERATE-HIGH

### 19. Mixed Cadence Endurance Turbo
- **Zone:** Z2 with cadence work
- **Duration variants:** 95 min
- **TSS range:** variable
- **Description:** No description provided
- **Fuel category:** LOW-MODERATE

### 20. Taper Reps at Race Effort
- **Zone:** Mixed (60-200% FTP)
- **Duration variants:** 76 min
- **TSS range:** variable
- **Description:** WU 15 min (gradual build) → WU 5/5/5 min at 60/70/80% FTP (3x10s fast spin) → Activation 3x(1 min 120% FTP, 3 min 70% FTP) → Race Surges 5x(20s 150% FTP, 2:40 60-65% FTP) → Aero Reset 8 min 80-85% FTP → Sprint Prep 3x(10s 170-200% FTP, 2 min easy) → CD 15 min
- **Fuel category:** MODERATE (low volume, high intensity)

### 21. Pre Race Day
- **Zone:** Z5+ (short)
- **Duration variants:** 57 min
- **TSS range:** variable
- **Description:** 15 min WU → 3x(30s all-out, 4:30 recovery) → 3x(1 min Z5, 4 min recovery) → CD 10 min
- **Fuel category:** LOW-MODERATE (short opener session)

---

## Fuel Planner Session Categories

For the Fuel Planner integration, sessions are categorised by energy demand:

| Category | Sessions | Carb Scaling |
|----------|----------|-------------|
| REST | Recovery Day | Base only, deficit applied |
| LOW | Z2 Endurance Ride (≤75min), High Cadence Set | Minimal extra carbs |
| LOW-MODERATE | Mixed Cadence Spin, Z2 Endurance (>75min), High/Low Cadence Turbo, Pre Race Day, Mixed Cadence Turbo | Some extra carbs |
| MODERATE | Endurance w micro sprints, Aerobic to Threshold Ramps, Aero Dev Tempo+Strength, 4x5min Threshold | Moderate carb increase |
| HIGH | 30s Sprints, 20/30/40 Vo2, 5x2 Mins Vo2, 4x8 Threshold, 2x15 Threshold, Race Start Prep, Breakaway O/U, Race Pre-Race tuneup, Taper Reps | High carb (60-80g/hr) |
| VERY HIGH | Sprint-Maintain-Sprint-40/20 | Maximum carbs (100g/hr as prescribed) |

### Energy Estimation per Session

Using the formula: kJ = IF² × FTP × duration_hrs × 3.6, and kcal = kJ / 4.184:

For an example athlete with FTP 250W:

| Session | Duration | IF | Estimated kJ | Estimated kcal |
|---------|----------|----|-------------|---------------|
| Z2 Endurance 60min | 1.0 hr | 0.64 | 369 | 88 |
| Z2 Endurance 90min | 1.5 hr | 0.64 | 553 | 132 |
| 30s Sprints 64min | 1.07 hr | 1.05 | 1063 | 254 |
| Mixed Cadence 80min | 1.33 hr | 0.61 | 446 | 107 |
| Endurance w sprints 180min | 3.0 hr | 0.57 | 879 | 210 |
| 20/30/40 VO2 58min | 0.97 hr | ~0.95 | 789 | 189 |
| 4x8 Threshold 112min | 1.87 hr | 0.80 | 1075 | 257 |
| Race Start Prep 100min | 1.67 hr | 0.90 | 1215 | 290 |
| Sprint-Maintain-Sprint 86min | 1.43 hr | 0.93 | 1117 | 267 |

**Note:** Actual energy expenditure also depends on gross mechanical efficiency (~21.7%). The full Hexis FFTWR calculation uses: kcal_exercise = kJ × 1.1 (where GME ~21.7% is built in).

---

## Plan Gap Analysis for Hour-Band Variants

### Current state: All plans at ~8-9 hrs/week

### Needed for Roadman Method Week 1 assessment:

| Band | Target hrs/wk | Adjustments from base plan |
|------|--------------|---------------------------|
| Low (6 hrs) | 6 | Drop 1 endurance day, shorten long ride to 2hr, shorten intervals |
| Standard (8 hrs) | 8 | Current plan structure works |
| High (10 hrs) | 10 | Add 1 endurance day, extend long ride to 3.5hr |
| Elite (12 hrs) | 12 | Add 2 endurance rides, extend long ride to 4hr, extend intervals |

### Session scaling rules:
- **Z2 Endurance:** Scale duration directly (proportional)
- **Intervals (30s Sprints, VO2, Threshold):** Keep interval block the same, adjust warm-up/cool-down
- **Long ride:** Scale proportionally, keep sprint inclusions
- **Recovery days:** Keep 2 per week regardless of volume
- **Taper/race week:** Scale proportionally

---

## Next Steps

1. ✅ All 7 plans imported to tedcrilly account
2. ✅ Complete session library extracted via API
3. ✅ Week-by-week progression mapped
4. ✅ Fuel categories assigned per session type
5. ⬜ Build hour-band variants in TrainingPeaks
6. ⬜ Cross-reference session energy with Hexis FFTWR calculation engine
7. ⬜ Build Fuel Planner React component for members area
