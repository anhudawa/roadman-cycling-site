# Hexis Calculation Engine — Verified Data

## Profile Settings (Anthony's Hexis Account)
- Male, 188cm, DOB 25/09/1983 (age 42)
- Energy Formula: Custom
- RMR: 1600 kcal
- DIT: Carbs 5%, Protein 25%, Fat 1.5%
- Gross Metabolic Efficiency: empty (default ~21.7%)
- Lifestyle: Sedentary, NEAT multiplier 1.2
- Wake: 09:00, Sleep: 00:00
- Current weight: 81.8kg, Target: 72kg
- Goal: Lose, 15% deficit (~1.87kg/week, est 6 weeks)
- Body fat: not set
- Meal pattern: 4 meals (Breakfast 08:30, Lunch 14:00, PM_Snack 17:00, Dinner 20:00)

## Test Case 1: Rest Day (Baseline)
| Meal | Calories | Carbs | Protein | Fat |
|------|----------|-------|---------|-----|
| Breakfast 08:30 | 419 | 12g | 41g | 23g |
| Lunch 14:00 | 532 | 47g | 41g | 20g |
| PM_Snack 17:00 | 267 | 17g | 25g | 11g |
| Dinner 20:00 | 532 | 47g | 41g | 20g |
| **TOTAL** | **1750** | **123g** | **148g** | **74g** |

### Macro Split (Rest Day)
- Carbs: 123g × 4 = 492 kcal (28.1%)
- Protein: 148g × 4 = 592 kcal (33.8%)
- Fat: 74g × 9 = 666 kcal (38.1%)
- Total: 1750 kcal ✓

## Test Case 2: Training Day (Moderate, No Competition)
Workout: Cycling, 20 min at 200W, Intensity 38 (Moderate)
- Hexis auto-calculated: 240 kJ, 264 kcal

| Meal | Calories | Carbs | Protein | Fat |
|------|----------|-------|---------|-----|
| Breakfast 08:30 | 465 | 19g | 41g | 25g |
| *Cycling 10:00-10:20* | — | *0 g/hr* | — | — |
| Lunch 14:00 | 594 | 58g | 41g | 22g |
| PM_Snack 17:00 | 300 | 22g | 26g | 12g |
| Dinner 20:00 | 594 | 58g | 41g | 22g |
| **TOTAL** | **1953** | **157g** | **149g** | **81g** |

### Delta vs Rest Day
- Calories: +203 kcal (exercise was 264 kcal → 77% restored)
- Carbs: +34g (+136 kcal from carbs = 67% of extra)
- Protein: +1g (essentially unchanged)
- Fat: +7g (+63 kcal from fat = 31% of extra)

### Per-Meal Deltas
| Meal | ΔCal | ΔCarbs | ΔProtein | ΔFat |
|------|------|--------|----------|------|
| Breakfast (pre-workout) | +46 | +7g | 0 | +2g |
| Lunch (1st post-workout) | +62 | +11g | 0 | +2g |
| PM_Snack | +33 | +5g | +1g | +1g |
| Dinner | +62 | +11g | 0 | +2g |

## Test Case 3: Competition Day (Same Workout)
Same workout (240kJ/264kcal) but with Competition checkbox enabled

| Meal | Calories | Carbs | Protein | Fat |
|------|----------|-------|---------|-----|
| Breakfast 08:30 | 659 | 63g | 41g | 27g |
| *Cycling 10:00-10:20* | — | *0 g/hr* | — | — |
| Lunch 14:00 | 680 | 75g | 41g | 24g |
| PM_Snack 17:00 | 327 | 22g | 26g | 15g |
| Dinner 20:00 | 643 | 59g | 41g | 27g |
| **TOTAL** | **2309** | **219g** | **149g** | **93g** |

### Competition vs Normal Training Day
- Calories: +356 kcal (2309 vs 1953)
- Carbs: +62g (219 vs 157) — massive carb increase
- Protein: 0g change
- Fat: +12g (93 vs 81)

### Competition vs Rest Day
- Calories: +559 kcal
- Carbs: +96g (219 vs 123)
- Protein: +1g
- Fat: +19g

## Key Calculation Insights

### Energy Calculation
- kJ = average_power_watts × duration_seconds / 1000
- kcal = kJ × 1.1 (at ~21.7% gross metabolic efficiency)
- Alternative: kcal = kJ / (4.184 × GME)

### Deficit Application
- Rest day TDEE before deficit = 1750 / 0.85 = ~2059 kcal
- On training days, ~77% of exercise calories are restored (deficit absorbs 23%)
- On competition days, deficit appears to be reduced/eliminated

### Macro Distribution Rules
1. **Protein stays constant** (~1.8g/kg bodyweight) regardless of training
2. **Carbs scale with training** — primary variable macro
3. **Fat fills remaining** calories after carbs and protein
4. **Competition mode** dramatically increases carbs (especially pre-workout)

### Carb Distribution by Meal Timing
- Pre-workout meals get a moderate carb bump
- Post-workout meals (first meal after training) get the largest carb increase
- Carb loading in competition mode starts from breakfast (before the ride)

### Intensity Slider
- Scale: 0-100, labeled as "Moderate" at 38
- Affects the carb:fat oxidation ratio during exercise
- Higher intensity → more carb-dependent → more carbs prescribed
- At intensity 38, intra-workout carbs = 0 g/hr (below threshold)

## Formula Reconstruction (for our Fuel Planner)

### Step 1: Calculate Base TDEE
```
RMR = user_input (or Mifflin-St Jeor estimate)
NEAT = RMR × activity_multiplier (Sedentary: 1.2, Light: 1.375, Moderate: 1.55, Active: 1.725)
DIT = (carb_cals × 0.05) + (protein_cals × 0.25) + (fat_cals × 0.015)
Base_TDEE = RMR + NEAT_addition + DIT
```

### Step 2: Apply Deficit/Surplus
```
if goal == "lose": target_kcal = Base_TDEE × (1 - deficit_pct)
if goal == "maintain": target_kcal = Base_TDEE
if goal == "gain": target_kcal = Base_TDEE × (1 + surplus_pct)
```

### Step 3: Add Exercise Energy
```
exercise_kJ = avg_power × duration_sec / 1000
exercise_kcal = exercise_kJ × 1.1
restored_kcal = exercise_kcal × 0.77 (normal) or × ~1.0 (competition)
training_day_kcal = target_kcal + restored_kcal
```

### Step 4: Set Protein
```
protein_g = bodyweight_kg × 1.8
protein_kcal = protein_g × 4
```

### Step 5: Set Carbs (periodised)
```
rest_day_carb_g = (target_kcal × 0.28) / 4
training_day_carb_g = rest_day_carb_g + (restored_kcal × 0.67) / 4
competition_carb_g = training_day_carb_g + additional_loading
```

### Step 6: Set Fat (remainder)
```
fat_kcal = total_kcal - protein_kcal - carb_kcal
fat_g = fat_kcal / 9
```

### Step 7: Distribute Across Meals
Larger meals (lunch/dinner) get ~30% each, breakfast ~24%, snack ~15%
Post-workout meals get proportionally more carbs.
