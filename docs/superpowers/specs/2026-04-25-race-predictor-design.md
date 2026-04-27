# Race Predictor — Design Spec

**Date**: 2026-04-25
**Status**: Approved, Phase 1+2 building
**Owner**: Anthony (product), Claude (build)

## Goal

Ship a physics-based cycling race predictor that matches or beats Best Bike Split's accuracy (target: <2% error vs. real ride times when inputs are correct), priced at free / $29 per event / $69 bundle, integrated with the existing Roadman ecosystem (diagnostic tools, paid reports, Stripe, Ask Roadman). Differentiate on:

1. **AI parameter translator** — natural language ("Canyon Aeroad, GP5000 28mm, hoods, lean rider") → correct CdA/Crr/mass. BBS users blow predictions because they enter wrong inputs; we close that gap.
2. **Full power-duration curve + durability** — not just FTP. Models the rider who blows up at 200km that BBS misses.
3. **Coaching ecosystem grounding** — Claude commentary anchored in 1,400+ podcast episodes, not generic AI.
4. **Lower friction pricing** — free tier with one insight + paid event report ($29) vs. BBS $19/mo subscription.
5. **"Wake-up call" mode** — training gap analysis 6 months out, not just race-day pacing.

## Non-goals (this build)

- Mobile app — web only.
- Real-time on-bike pacing — Wahoo/Garmin export is Phase 4.
- Course creation tool with interactive mapping — GPX upload + curated event library only.
- Strava integration — manual GPX/.fit upload only.
- Subscription model — single-event purchase + bundle only.
- Cannibalising Not Done Yet — the 90-day roadmap shows WHAT to change, never delivers workouts or weekly accountability. "Plans don't hold you accountable. People do." → bridge to community.

## Architecture

Single Next.js codebase (no microservice). All physics in TypeScript, pure-functional, in `src/lib/race-predictor/`. Persistence/UI/AI are thin shells around the pure core.

```
src/lib/race-predictor/
├── types.ts            # All shared types
├── constants.ts        # Physical constants + Crr/CdA presets
├── environment.ts      # Air density (Tetens), wind→headwind/yaw resolution
├── gpx.ts              # Parse, smooth, gradient, heading, climb detection
├── rider.ts            # Power-duration curve, CP/W' fit, durability decay
├── engine.ts           # Forward-Euler integrator, power balance
├── pacing.ts           # W'/CP balance, variable-power optimizer
├── scenarios.ts        # What-if comparison (Time Analysis equivalent)
├── cda-estimator.ts    # Chung virtual-elevation method
├── analysis.ts         # Variability Index, yaw histogram, drive/non-drive split
└── *.test.ts           # Co-located Vitest suites
```

Each module is pure (no I/O, no DB, no fetch). The persistence layer (`src/lib/race-predictor/store.ts`, Phase 3) and API routes (`src/app/api/predict/...`, Phase 3) sit on top.

## Physics

The engine solves the cycling power balance equation per segment:

```
P_rider · η = P_gravity + P_rolling + P_aero + P_accel
```

where:

- `P_gravity = m_total · g · sin(θ) · v`
- `P_rolling = Crr · m_total · g · cos(θ) · v`
- `P_aero = 0.5 · ρ · CdA · (v + v_headwind)² · v`
- `P_accel = m_total · a · v` (a = dv/dt)
- `η` = drivetrain efficiency (default 0.97)

### Gradient

`θ = atan(Δelevation / Δdistance_horizontal)` — never `rise/run` directly. Elevation is Gaussian-smoothed (σ = 3–5 points) before differentiation to remove GPS jitter.

### Air density

Full Tetens equation:

```
ρ = (P_atm / (R_d · T)) · (1 - 0.378 · e / P_atm)
```

where `e` = water vapor partial pressure from temperature + relative humidity, `R_d` = 287.058 J/(kg·K) for dry air. ρ drops ~12% per 1000m altitude.

### Wind

Per segment: resolve wind vector against road heading.

```
v_headwind = v_wind · cos(wind_dir - road_heading)
v_crosswind = v_wind · sin(wind_dir - road_heading)
yaw_angle = atan2(v_crosswind, v + v_headwind)
```

### Crr defaults

- GP5000 / smooth tarmac: 0.0032
- Mixed road: 0.0040
- Chip-seal / rough: 0.0045
- Training tyre: 0.0050
- Gravel (smooth): 0.0070
- Gravel (rough): 0.0120

### CdA defaults by position

- TT bars: 0.21
- Aero road, drops: 0.24
- Aero road, hoods: 0.31
- Endurance, hoods: 0.34
- Standard road, hoods: 0.38
- Climbing position: 0.40

### Numerical method

Forward-Euler integration, base step `Δs = 10m`, adaptive sub-stepping when `|dv/dt| > 0.5 m/s²` (i.e. on transitions: into climbs, out of corners). Rationale: tractable, fully testable, no ODE solver dependency, error well-controlled at 10m steps for typical road grades.

For each segment:

1. Estimate v at segment end given current rider power target.
2. Solve power balance for v iteratively (3–5 Newton-Raphson steps).
3. Update kinetic energy, distance, time.
4. Pass v_end as v_start to next segment.

### Power-duration curve & durability

Rider profile carries 6 anchors:

- 5-second power (neuromuscular)
- 1-minute power (anaerobic)
- 5-minute power (VO2max)
- 20-minute power (threshold proxy → FTP ≈ 0.95 · 20min)
- 60-minute power (sustainable / CP proxy)
- Durability factor `k` (how well the rider holds power past 1hr)

We fit a 2-parameter critical-power model from the 5/20/60-min anchors:

```
P(t) = CP + W' / t   (for t in seconds, CP in W, W' in J)
```

For events >1hr we apply durability decay:

```
P_sustainable(t) = CP · (1 - k · ln(t / 3600))    for t > 3600s
```

Default `k = 0.05` (typical trained), `0.03` for ultra-endurance specialists, `0.08` for threshold-only riders. This is what catches "pure threshold rider blows up at 200km that BBS misses".

## Pacing

Two pacing modes:

1. **Constant target power** — naive baseline, useful for time predictions.
2. **Variable-power optimizer (Phase 2)** — given a course, rider, and target average IF, distribute power per segment to minimize total time subject to:
   - W'_balance never goes below 0
   - Per-segment power ≤ rider's PD curve at segment duration
   - Durability decay applied past 1hr
   - Push power into headwinds and false-flats; ease on steep climbs (>8%) and on tailwind descents past terminal speed

W'_balance integrates over time: depletes at rate `(P - CP)` when `P > CP`, recovers at rate `(CP - P) · τ_recovery_factor` when below CP. Recovery factor approximated as `(1 - W'_balance / W'_total)` to model slower recovery when fresher.

## CdA estimation (Phase 2)

`estimateCdaFromRideFile(fitFile, knownCrr, knownMass)` implements Chung's virtual elevation method:

1. Compute virtual elevation gain per data point using power, speed, mass, Crr, ρ.
2. Compare to actual GPS elevation gain.
3. Iteratively solve for CdA that minimizes virtual-elevation residual over the full ride (or per cluster).
4. Cluster ride data by position via z-score on cadence/power/speed pattern; estimate CdA per cluster (aero / hoods / climbing).

Validated against 1.35% of wind tunnel for clean rides. We document accuracy expectations clearly.

## Scenarios (Phase 2)

`runScenarioComparison(baseline, deltas)` accepts a baseline prediction and an array of parameter deltas, returns per-segment + cumulative time impact. Drives the "what-if sliders" UI: power +5W, weight -2kg, CdA -0.02, Crr -0.0005.

## Climb detection (Phase 1)

Algorithm in `gpx.ts`:

1. Forward-window scan with 100m window.
2. Climb starts when avg grade > 3% sustained for 100m.
3. Climb ends when avg forward grade < 1% sustained for 100m.
4. Reject climbs < 250m total length.
5. Categorize: cat 4 (≥250m, ≥3%), cat 3 (≥1km, ≥4%), cat 2 (≥3km, ≥5%), cat 1 (≥5km, ≥6%), HC (≥10km, ≥7%).

## Variability Index & Yaw analysis (Phase 2)

- `VI = NormalizedPower / AveragePower` over the prediction.
- Yaw histogram per segment + drive-side / non-drive-side split (whether rider was riding into / away from crosswind on average).

## AI parameter translator (Phase 3)

Free-text input "Canyon Aeroad CFR, Continental GP5000 S TR 28mm, hoods, 76kg rider 7kg bike, lean build" →

```ts
{
  cda: 0.32,
  crr: 0.0034,
  mass_total: 83,
  position: 'hoods_aero',
  confidence: 0.85,
  reasoning: '...',
  overrides: { ... }   // user-editable
}
```

Implementation: Claude Haiku 4.5 with cached system prompt containing the parameter knowledge base (bike model → CdA preset, tyre model → Crr preset, position effects, mass corrections). Prompt caching cuts cost ~10x for steady-state traffic.

## Persistence (Phase 3)

New tables (Drizzle schema):

```sql
courses (
  id, slug, name, country, region,
  distance_km, elevation_gain_m, surface_summary,
  gpx_data jsonb, segments jsonb,
  event_dates date[], verified bool, created_at
)

predictions (
  id, slug, rider_profile_id?, course_id, course_gpx_hash,
  predicted_time_s, confidence_low_s, confidence_high_s,
  pacing_plan jsonb, parameters_used jsonb, weather_data jsonb,
  email?, is_paid bool, paid_report_id?, created_at
)

prediction_results (
  id, prediction_id,
  actual_time_s, ride_file_url,
  segment_actuals jsonb, analysis jsonb,
  model_error_pct, created_at
)
```

`courses` is shared catalog. `predictions` is per-user attempt. `prediction_results` powers community calibration (Phase 4).

## API routes (Phase 3)

- `POST /api/predict` — { course_id?, gpx?, rider, environment, mode } → prediction
- `GET /api/courses` — public catalog
- `POST /api/courses/upload` — GPX upload, parse, store
- `GET /api/predict/[slug]` — retrieve prediction (anonymous-shareable)
- `POST /api/predict/[slug]/upgrade` — Stripe checkout for paid Race Report (reuses existing `/api/reports/checkout`)

## UI (Phase 3)

Landing at `/predict`:

- Mode toggle: **Can I Make It?** (gap analysis, 6mo+ out) | **Plan My Race** (24–48h out)
- Course selection: catalog dropdown OR GPX upload
- Rider input: progressive disclosure
  - Basic: weight, FTP, target event
  - Advanced: full PD curve, position, equipment, environment overrides
  - AI input: free-text "describe your setup" → translator fills the rest

Result page `/predict/[slug]`:

- Course profile chart (elevation + power overlay + speed overlay)
- Predicted time + confidence range
- 1 free key insight ("Your sustainable power on the 14% Galibier ramps will drop you to 8 km/h — sit in")
- Paid Race Report CTA

## Pricing

- **Free**: predicted time range + 1 key insight + email capture.
- **$29 per event**: full pacing plan (per-km), nutrition guidance, equipment/wind/temp scenarios, scenario sliders.
- **$69 bundle**: Race Report + Plateau Analysis + Fuelling Strategy + 90-Day Roadmap.

## Phasing

### Phase 1 — Math foundation (this iteration, ~3-4 days)

- [x] Spec doc
- [ ] `types.ts` + `constants.ts`
- [ ] `environment.ts` + tests (air density, wind/yaw)
- [ ] `gpx.ts` + tests (parse, Haversine, smoothing, gradient, heading, climb detection)
- [ ] `rider.ts` + tests (PD curve, CP/W' fit, durability)
- [ ] `engine.ts` + tests (Euler integrator, power balance, sanity tests)
- [ ] Physics validation suite passes

### Phase 2 — Pacing + scenarios + CdA + analysis

- [ ] `pacing.ts` + tests (W'/CP balance, variable-power optimizer)
- [ ] `scenarios.ts` + tests (what-if comparison)
- [ ] `cda-estimator.ts` + tests (Chung method, position clustering)
- [ ] `analysis.ts` + tests (VI, yaw histogram)
- [ ] Real-ride back-test harness (when .fit files arrive)

### Phase 3 — Persistence + UI + AI + paid tier

- [ ] DB migrations
- [ ] API routes
- [ ] `/predict` page (both modes)
- [ ] Course profile chart
- [ ] AI parameter translator (Haiku + prompt caching)
- [ ] 5–10 seed courses (Etape, Marmotte, Mallorca 312, RideLondon, Dragon Ride)
- [ ] Paid Race Report generator (PDF)
- [ ] Stripe wiring via existing `/api/reports/checkout`

### Phase 4 — Differentiator polish

- [ ] Yaw output panel
- [ ] VI + post-event analysis
- [ ] Per-segment surface Crr (premium)
- [ ] Wahoo ELEMNT real-time pacing export
- [ ] Garmin Edge Power Course / TCX export
- [ ] Community calibration loop (predicted vs. actual feeds back into model error)

## Validation strategy

- **Phase 1**: physics-only. Unit-check each term, conservation of energy on flat-no-wind, sanity targets:
  - 300W, GP5000, η=0.97, ρ=1.225, CdA=0.32, m=80kg, flat, no wind → 38.0 ± 1.5 km/h
  - +5% grade, same → 12 ± 1 km/h
  - ρ drops 12% from 0m to 1000m at 15°C
  - Bearing: London → Paris ≈ 149°
  - Haversine: Land's End → John o' Groats ≈ 970 km
- **Phase 2**: real-ride back-test. Anthony or NDY members supply 5–10 .fit files with power+GPS+known finish times, calibrate model error.
- **Phase 3**: launch with measured-vs-real comparison on 1 known course (BBS comparison plus our own).
- **Phase 4**: community calibration — every paid prediction with a follow-up actual feeds back, surfaces per-course bias.

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| Math wrong on day 1 | Phase 1 ships with comprehensive physics tests; nothing user-facing before tests pass |
| AI translator returns wrong params | Always show extracted values + confidence, allow user override before predict |
| BBS-style "predictions too fast" | Durability decay built in from the start; durability factor visible in advanced inputs |
| GPX quality varies wildly | Gaussian smoothing (σ=3–5), reject GPX with <50 points or implausible elevation |
| Cannibalises NDY community | Roadmap-only output in 90-day report, never delivers workouts or accountability |
| Course catalog stale | Phase 3 includes admin tool for curating/replacing seed GPX |

## Open inputs (not blocking Phase 1)

1. 5–10 .fit files from real rides for Phase 2 back-test.
2. Confirmed GPX for the seed event list (we'll pull from public sources for now).
3. Anthony's own PD curve for the launch demo prediction.

---

## Code style notes

- Pure functions, no classes (except where helpful for stateful integrators).
- Vitest co-located. One assertion focus per test.
- Constants centralised in `constants.ts`.
- All public types exported from `types.ts`.
- No `any`. Strict mode TypeScript.
- File header comments only where the math is non-obvious.
