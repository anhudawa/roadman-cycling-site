# Race Pace Predictor — Code Review

**Reviewer:** Claude (read-only audit)
**Date:** 2026-04-30
**Scope:** `src/lib/race-predictor/**`, `src/app/(content)/predict/**`, `src/app/api/predict/**` (≈6,600 LOC)
**Reference target:** Best Bike Split (BBS) — match or beat

---

## TL;DR

This is a **genuinely good, professionally-built physics-first predictor** that gets ~80% of the way to BBS on the things that matter (power balance, air density, wind resolution, climb detection) and **beats BBS on durability decay** — the single most differentiated piece. The product surface (UI, AI translator, calibration loop, paid Race Report) is well thought through and commercially coherent.

But there is a **physics gap that prevents it from actually matching BBS in steep terrain**: the engine never models acceleration / kinetic energy. Every segment is teleported to its steady-state speed. On undulating courses with frequent grade transitions this systematically biases the time prediction (typically 0.5–2% fast on rolling profiles, more on punchy ones). For a tool that markets ±2% accuracy, this is the most important thing to fix.

Beyond that, there are sharper edges in the synthetic course fixtures (Mallorca 312 elevation is ~31% low, Flanders is ~57% low — both will produce comically fast predictions), some loose tests, a rough pacing optimizer that's a heuristic in clothing, and component duplication risk in the UI. None of these are show-stoppers; all are addressable.

**Headline scorecard:**

| Area                          | Grade | Notes                                                            |
| ----------------------------- | ----- | ---------------------------------------------------------------- |
| Physics / engine math         | B+    | Correct steady-state, missing dynamics                           |
| Environment (air, wind)       | A     | Best-in-class for an open-source predictor                       |
| GPX & climb detection         | B+    | Solid, but lenient validation                                    |
| PDC / rider model             | B     | 2-anchor CP fit + durability is right idea, under-anchored       |
| Pacing optimizer              | C+    | Heuristic, doesn't close the W'-balance loop                     |
| API & validation              | A−    | Clean, well-validated, sensible rate limits                      |
| Tests                         | B     | BBS-parity benchmarks excellent, edge cases thin                 |
| Course data                   | C     | Real Traka GPX is great; synthetic events have wrong elevations  |
| UI / UX                       | B+    | Strong flow, friction in error/upgrade states, duplication risk  |
| Performance                   | A     | Plenty fast for real-time interactivity                          |
| Vs BBS overall                | B     | Ahead on durability + UX, behind on dynamics + optimizer         |

---

## 1. Strengths

### 1.1 Physics is correct where it's modelled

`src/lib/race-predictor/engine.ts` solves the standard Martin-1998 power-balance equation with **bisection** rather than Newton-Raphson. The choice is deliberate and correct — the comment at lines 30–43 explains exactly why NR fails on steep descents (terminal-velocity local minimum, NR walks the wrong way). Bisection on a fixed bracket converges in <30 iterations and never diverges. This is the kind of detail that separates a hobby project from a production tool.

The drag formula at `engine.ts:63` is `0.5 * ρ * CdA * apparent * Math.abs(apparent)` — preserves the sign of apparent wind, which means tailwind-faster-than-rider correctly produces drag *pushing* the rider, not the more common bug of always-positive resistance. Subtle and right.

### 1.2 Environment modelling is genuinely best-in-class

`src/lib/race-predictor/environment.ts` does a better job than most paid tools:

- **Moist air density** via ideal-gas law combining dry and water-vapor partial pressures (lines 19–25). Tetens equation for saturation vapor pressure (line 11). Both within 1% over the cycling temperature range.
- **Barometric formula with ISA lapse rate** for altitude (lines 32–38). Per-segment air density is then re-computed using the segment-mean elevation (`engine.ts:125–126`) — this means the engine correctly drops air density on Galibier and re-thickens it on the descent.
- **Wind resolution** (`environment.ts:48–58`) returns both headwind and crosswind components, plus a yaw-angle lookup that depends on rider speed. The yaw histogram in `analysis.ts:49` is a piece of analytic candy that no consumer tool exposes.

The meteorological convention (windDirection = direction wind comes *from*, 0 = north) is documented and consistent throughout.

### 1.3 Durability decay is the real differentiator vs BBS

`src/lib/race-predictor/rider.ts:28–34` implements `P_sustainable(t) = CP·(1 − k·ln(t/3600))` past 1 hour, which is the Maunder-2021 form. **BBS does not model this.** For events >4 h, this is the single biggest source of error in BBS predictions for amateur riders. The `run.ts:170–179` block then *caps the mean pacing target at the durability-adjusted sustainable power*, so the engine never promises a time the rider's PD curve cannot support.

This is a real, defensible accuracy advantage. The marketing claim is justified.

### 1.4 Calibration loop is built in

`src/app/api/predict/[slug]/actual/route.ts` accepts a real finish time post-race and persists `model_error_pct` per prediction. `store.ts:504–519` aggregates this into per-course MAE. This is the right architectural call — most predictors ship a model and never measure it. Roadman's predictor is set up to learn from reality.

### 1.5 AI translator is well-engineered

`src/lib/race-predictor/translator.ts` uses Haiku 4.5 with **prompt caching** (`cache_control: ephemeral`, line 170). The knowledge base is ~3 KB and is sent once per ~5 min, dropping steady-state cost ~10×. Output is clamped, validated against enum sets, and the function never throws — failure modes always return sensible defaults with a `reasoning` string the user can read. Confidence calibration buckets are explicit. This is how to ship LLM-powered features that don't blow up in production.

### 1.6 Test discipline on the headline cases

`src/lib/race-predictor/__tests__/competitive-benchmarks.test.ts` is the best-written file in the codebase. The opening comment (lines 1–19) lays out the rigor principle: tight, specific targets vs vague ranges. Examples:

- `Flat 40 km TT @ 300W → 60 min ±30s` (line 193) — anchored to the closed-form Martin-1998 solution AND BBS-published output.
- `Marmotte synthetic, 250W → 6h45–7h05` (line 225) — anchored to ASO timing distribution.
- `Wicklow 200 stronger-rider monotonicity` (line 336) — invariant guard that catches "smarter pacing made the strong rider slower" regressions.
- `Confidence half-width ≤ 15 min` (line 303) — a real product constraint, not just a number.

This level of test rigor is rare. It's the right way to harden a physics engine.

### 1.7 Clean separation of concerns

The split — `gpx.ts` (geometry), `environment.ts` (atmosphere), `rider.ts` (PD), `engine.ts` (sim), `pacing.ts` (optimizer), `analysis.ts` (post-processing), `run.ts` (orchestrator), `store.ts` (persistence), `translator.ts` (AI), `report.ts` (paid HTML), `insights.ts` (free key insight) — is exemplary. Each file has a clear job. The pure-compute layers have no I/O, are easy to test, and are easy to reason about.

---

## 2. Weaknesses, Bugs, and Accuracy Concerns

### 2.1 ⚠️ The engine has no dynamics — this is the big one

`src/lib/race-predictor/engine.ts:108–157` simulates each segment as steady-state. For each segment:

1. Solve the steady-state speed `vSteady` for the target power.
2. Compute `avgSpeed = (v_prev + vSteady) / 2`.
3. `dt = distance / avgSpeed`.
4. Set `v = vSteady` for the next segment.

**Three problems with this:**

1. **No kinetic energy is tracked between segments.** The energy required to accelerate from `v_prev` to `vSteady` (or recovered when decelerating) is silently ignored. On a 10 m segment transitioning from 50 km/h flat to 12 km/h on a 10% ramp, ΔKE ≈ 7,200 J — equivalent to ~700 W for 10 s. The engine pretends this energy doesn't exist.
2. **The averaging is kinematically inconsistent.** `(v_prev + vSteady) / 2` is the time-averaged speed *only if acceleration is constant over the segment*. The engine doesn't model acceleration at all; it just teleports to `vSteady`. So on a real 10 m segment the rider is actually at `v_prev` for most of the segment and `vSteady` for none of it (until the next segment). The endpoint-average is closer to truth than just using `vSteady`, but it's not physical.
3. **Comment at engine.ts:107 calls this "kinetic-energy carry-over via average-of-endpoints integration".** That description is *wrong*. There is no kinetic-energy carry-over. The comment should be deleted or fixed; future maintainers will be misled.

**Why this matters vs BBS:** BBS does proper time-stepped integration (sub-second steps with explicit acceleration). On undulating profiles it produces correct times even when grade transitions are sharp. Roadman's engine produces times that are systematically *too fast* on rollers (because deceleration "frees up" power that's then re-applied at the next steady-state) and slightly *too slow* on punchy climbs preceded by descents (because the kinetic-energy assist is missing).

The competitive-benchmarks test for `Marmotte @ 250W → 6h45–7h05` passes because the segments are 50 m and the transitions are spread out, masking the error. On a 1 km TT with a sharp climb in the middle the error would show.

`constants.ts:30, 33` define `DEFAULT_STEP_M = 10` and `SUBSTEP_ACCEL_THRESHOLD = 0.5` — **these constants are exported and never used**. Likely a leftover from a planned acceleration sub-stepping pass that was deferred. Either implement it or delete the constants (keeping dead config is a code-smell).

**Recommendation:** Add a `simulateCourseDynamic()` variant that integrates `dv/dt = (P_wheel/v − F_resist) / m` with adaptive sub-steps when |a| > 0.5 m/s². Wire it behind a feature flag, run it against the existing BBS-parity tests, and ship it as v2 of the engine. The TT cases shouldn't move; the rolling cases will tighten.

### 2.2 ⚠️ Pacing optimizer doesn't close the W'-balance loop

`src/lib/race-predictor/pacing.ts:75–131` is a heuristic, not an optimizer. It:

1. Runs a constant-power baseline.
2. Computes a per-segment bias from grade and headwind (with arbitrary coefficients: 0.015 per percent grade, 0.01 per percent headwind).
3. Clamps to ±20% surge ceiling.
4. Re-normalizes time-weighted mean.

**It never feeds W'-balance back into the engine.** `trackWPrimeBalance()` exists in the same file (lines 29–48) but isn't called by `optimizePacing` or `simulateCourse`. Result: if the pacing plan drives W' negative on a long climb, the engine still happily simulates the rider holding the high power. This is a silent correctness bug — the rider in the prediction can do things the rider in real life cannot.

The bias coefficients are also un-calibrated. There's no derivation, no citation, no test that says "on a course with 4 climbs, this bias produces N% time savings vs constant-power" matched to a real-world dataset.

**Recommendation:** A proper minimum-time NLP (subject to W'(t) ≥ 0 ∀t) is the right answer; gradient projection or sequential quadratic programming will do. Failing that, at least *enforce* the W' constraint in `simulateCourse` by clamping `targetPower` to `CP + max(0, W'_balance) / dt` per segment. That alone closes a real loophole.

### 2.3 ⚠️ Synthetic event fixtures have wrong elevation

The synthetic profiles in `src/lib/race-predictor/fixtures.ts` are systematically light on elevation:

| Event              | Fixture gain | Real gain      | Error    |
| ------------------ | ------------ | -------------- | -------- |
| Mallorca 312       | ~3,470 m     | ~5,000 m       | -31%     |
| Tour of Flanders   | ~950 m       | ~2,200 m       | -57%     |
| Marmotte           | ~4,350 m     | ~5,000 m       | -13%     |
| Etape (placeholder)| ~3,590 m     | varies         | unknown  |
| Wicklow 200        | ~2,400 m     | ~3,400 m       | -29%     |

Predictions for these courses will be **substantially fast** (10–25 minutes optimistic on a 6-hour event for the worst cases). Worse, every synthetic course is built on a **single constant latitude** (`fixtures.ts:262`, lat constant) — meaning the road heading is purely east, and headwind from the south is identical across the entire course. Wind modelling on these fixtures is degenerate.

These fixtures only fire when `POSTGRES_URL` is unset — i.e., dev preview. But they *also* power the courses page (`/predict/courses`) when the DB is unavailable, and a user uploading a GPX of one of these events with the *real* profile will get a different (correct) answer than someone clicking the curated card. That inconsistency is confusing and erodes trust.

**Recommendation:** Replace synthetic fixtures with downsampled real RWGPS exports (the way `traka-2026.ts` already works for The Traka). Or remove them entirely and require the DB in any environment that surfaces curated courses. The current state — wrong but plausible — is the worst of both worlds.

### 2.4 ⚠️ Normalized Power approximation overweights short segments

`analysis.ts:12–22` computes NP as `(Σ p^4 · dt / Σ dt) ^ 0.25`. The classical NP definition is over a 30-second rolling mean, then 4th-power, then mean. With 50 m segments at 36 km/h, each segment is ~5 s — much shorter than the 30 s smoothing window. Under variable pacing the engine NP will run **higher** than a Garmin would compute on the same ride (because there's no smoothing of the short surges).

This affects the displayed NP and the variability index. It does not affect the predicted time. But it will make riders' actual-NP from their head unit look lower than the predicted NP, which they'll read as "I underperformed" when actually the model overreports.

**Recommendation:** Add a 30-s moving average pass before the 4th-power weighting. Cheap to do; matches the universal definition.

### 2.5 PDC: 2-anchor fit is under-determined for sprinters and pure climbers

`rider.ts:14–18` fits CP/W' from `p20min` and `p60min` only. `synthesizePowerProfile(ftp)` at `run.ts:67–76` synthesizes the curve as `(3.6, 1.85, 1.15, 1.05, 0.95)·FTP`. These multipliers are sensible for a typical trained amateur but:

- An elite sprinter has p5s/FTP ≈ 4–5; a pure climber 2.5–3. Single coefficient ignores rider type.
- The 2-anchor CP fit is *exact* for `p20`/`p60` but says nothing about `p5min`. For a rider with disproportionate W' (high p1min, low p60), the fit's p5min prediction can be off by 10–15%.
- `durabilityFactor` defaults to 0.05 unconditionally in `synthesizePowerProfile`. The type comment says "Typical: 0.05 trained, 0.03 ultra-endurance, 0.08 threshold-only" — but there's no input path that reads rider type and picks an appropriate k. Even paid users can't influence this without an explicit override.

**Recommendation:** Take a third anchor (`p5min` or `p3min`) into the CP/W' fit (over-determined least-squares). Add a rider-type selector ("sprinter / all-rounder / climber / ultra") that adjusts both the synthesized PD curve and the default durability factor.

### 2.6 GPX: missing-elevation silent default is dangerous

`gpx.ts:148` parses `<ele>` and falls back to `0` if missing. A GPX without elevation (rare but possible — some routing exports drop it) will produce a course with `totalElevationGain = 0` and zero climbs. The user sees a wildly fast prediction with no warning.

Similarly, `parseGpx` doesn't check timestamp ordering or reject duplicate points. A GPX with backtracking (out-and-back captured naively) will double-count distance. There's no point-density check — a 200 km route with 100 points (2 km spacing) is parsed without complaint, even though gradient and climb detection are meaningless at that resolution.

**Recommendation:** Add validation in `parseGpx` and surface warnings:
- If <50% of points have elevation, reject or warn.
- If median point spacing > 200 m, reject as too sparse.
- If consecutive timestamps go backwards, reject.

### 2.7 Climb detection doesn't merge nearby climbs

`gpx.ts:238–285` ends a climb the moment the forward-window grade drops below 1%. Real climbs (Ventoux from Bédoin, Stelvio, the Pyrenees HC monsters) often have flat or even briefly descending sections in the middle. The current detector splits a single physical climb into two or three categorized fragments.

**Recommendation:** After detection, post-process and merge climbs separated by <500 m of flat. BBS does this; tour categorizers do this.

### 2.8 Drivetrain efficiency is constant; Crr has no temperature dependence

`constants.ts:24` fixes `DEFAULT_DRIVETRAIN_EFFICIENCY = 0.97`. Reality: 0.95–0.98 depending on chainline angle, gear, and torque. `CRR_BY_SURFACE` (lines 46–54) ignores tire temperature (Crr drops ~2–3% per 10°C above 15°C — not negligible for a 6-hour ride spanning 10°C in the morning to 25°C at midday).

Both are minor (≤0.5% time effect). But for a tool aiming at ±2% accuracy, they collectively eat half the budget.

### 2.9 Scenarios endpoint scales PD curve naively

`src/app/api/predict/[slug]/scenarios/route.ts:81–88` shifts every PD anchor by `ftpDelta × multiplier` where multipliers are 3.6, 1.85, 1.15, 1.05, 1.0 — the same coefficients used to *synthesize* a PD curve from FTP. This is wrong for users who supplied a real PD curve: a +30 W FTP gain doesn't mean +108 W on the 5-second sprint, but the API treats it that way.

**Recommendation:** Scale only `p20min` and `p60min` by the FTP delta; leave `p5s`, `p1min`, `p5min` unchanged unless the user provides them explicitly.

### 2.10 Scenarios endpoint pacing is dual-scaled

`scenarios/route.ts:107–108`:
```ts
const multiplier = clamp(body.pacingMultiplier ?? 1, 0.7, 1.15) * ftpScale;
const pacing = baselinePacing.map((p) => p * multiplier);
```
This scales pacing by *both* the FTP change and the user's slider. If a user moves both, the effects compound multiplicatively when they should compose differently (FTP change should anchor pacing to the new sustainable target; slider should bias around it). For most slider positions the difference is small, but it's not what a careful user expects.

### 2.11 CdA estimator: endpoint-only objective is brittle

`cda-estimator.ts:79–86` minimizes `|VE_final − actual_final|` — a single-point objective. Chung's classical method minimizes the *sum-squared* drift over the whole ride, which is far more robust to noise. With endpoint-only, a smooth CdA-correct ride has the same fitness as a wildly wrong one that just happens to land at the right altitude. There's a "Phase 2 follow-on" comment at line 65 acknowledging this; that follow-on should not wait.

### 2.12 No drafting / group dynamics

Sportive and Gran Fondo riders almost always benefit from drafting (10–30% CdA reduction in a paceline). The model has no notion of this. BBS doesn't either, but a tool aimed at amateurs riding in groups should at least expose a "% time in pack" slider that scales effective CdA.

### 2.13 Tests have a few real issues

(See full Test Coverage section below for the long list. Highlights here:)

- `engine.test.ts:211`: `expect(result.averagePower).toBeCloseTo(250, 0)` is a tautology. The engine computes averagePower as `Σ(p·dt) / Σ(dt)`. With constant pacing of 250 W, this is mathematically guaranteed to be 250 — the test passes whether the simulation is right or wrong.
- `pacing.test.ts:166`: `surgeCeiling: 0.10` test asserts ±20% bound. The comment says "some slack from re-normalisation" — but if the implementation needs 20% slack to satisfy a 10% ceiling, the implementation is buggy or the test is wrong. Pick one.
- No test for: tailwind > rider speed; descents-only routes; missing elevation in GPX; ultra-long (12+ h) durations; NaN/zero-mass inputs; multi-segment dynamic wind angles.

### 2.14 UI: Component duplication

There are two `CourseCard` components, two `MiniElevation` components, and two what-if slider implementations. They have diverged subtly (different sampling strategies, color palettes, prop types). Any UX change requires updating both, and there's no test pinning them in sync. This will rot.

The two what-if slider implementations have different latency profiles too: the landing-page one runs synchronously in-browser, the results-page one debounces 220 ms and hits the server. Same conceptual feature, two different UXes. Pick one.

### 2.15 UI: Email gate vs upgrade gate confusion

The free results page has two gates: an email-capture gate (unlock detail) and a paid upgrade gate (Race Report). They sit one above the other. Users have to figure out which one applies to which content. The flow assumes email capture first, then upgrade — but nothing enforces or visualizes that order.

### 2.16 UI: Static OG image for shareable predictions

The `/share` route generates a beautiful per-prediction PNG poster. The OpenGraph metadata for `/predict/[slug]/page.tsx:53` points to a static `/og-image.jpg`. So when a rider shares their prediction on Twitter/Discord/Strava, they get a generic image instead of the dynamic poster. Trivial fix, big share-rate impact.

### 2.17 GPX: 8 MB max upload, 200 KB return payload

`parse-gpx/route.ts:25` allows 8 MB GPX uploads. The endpoint returns the *full* parsed point array in its JSON response (line 64). For a 200 km / 50 m course that's ~4,000 points × ~80 chars JSON ≈ 320 KB. Not catastrophic, but unnecessary — the client could submit the GPX once, get a server-side ID, and reference that on `/api/predict`. Reduces network volume and prevents the trivial "client tampers with the parsed points" attack surface.

### 2.18 Anti-abuse: cookie-fallback rate limit is bypassable

`rate-limit.ts:131–138` sets a single signed cookie. The user clears the cookie or opens an incognito window and gets 3 fresh predictions. The comment at line 13–15 acknowledges this is intentional ("the goal is to slow casual abuse"). Fair, but in a world where every prediction costs a Haiku call and a DB write, a determined script can drain the budget cheaply. Consider a fingerprint hash + IP-bucket fallback for redis-down state.

### 2.19 Insights: rounding bug in headwind percentage

`insights.ts:55–67` computes `hwSegments / result.segmentResults.length` and reports a percentage. If `result.segmentResults` is empty (degenerate course), `Math.max(1, ...)` saves the divisor but the headline still reports "across 0% of the course costs 0 km/h" — nonsensical. The rest of the function gracefully degrades, but this branch fires only on an empty course, which `simulateCourse` would have already rejected. Still, defensive code.

### 2.20 Report: scenario coefficients hardcoded with magic numbers

`report.ts:393–401` runs five canned scenarios (+10W, -1kg, etc.) with hardcoded multipliers. The math is fine, but `riderPatch: { cda: Math.max(0.18, rider.cda - 0.015) }` (line 397) silently floors to 0.18 — a CdA most riders cannot achieve. If the rider already has CdA = 0.20, the scenario subtracts only 0.015 (correct). If they have 0.19, it floors to 0.18 (only 0.01 reduction). The label "Cleaner aero position" implies a fixed 0.015 improvement, which the reader will assume. Either expose the actual delta in the label, or pick a percentage rather than absolute.

---

## 3. Missing Features (vs BBS)

| Feature                              | Roadman      | BBS    | Notes |
| ------------------------------------ | ------------ | ------ | ----- |
| Acceleration / time-stepped sim      | ❌           | ✅     | The big one |
| Proper W'-balance enforcement        | ❌           | ✅     | Tracked but not enforced |
| Variable-power NLP optimizer         | ❌           | ✅     | Roadman has heuristic only |
| Hour-by-hour weather (timing-aware)  | ❌           | ✅     | Roadman is single-input |
| Bottle / fuel-stop planning          | ❌           | ✅     | |
| Multi-lap support                    | ❌           | ✅     | |
| Tire-pressure to Crr mapping         | ❌           | ✅     | |
| Drafting / group dynamics            | ❌           | ❌     | Neither has it; opportunity |
| Descender-skill profile              | ❌           | ✅     | Power coefficient on descents |
| Per-checkpoint timing prediction     | ❌           | ✅     | |
| Durability decay (>1h)               | ✅           | ❌     | **Roadman wins here** |
| AI free-text translator              | ✅           | ❌     | **Roadman wins here** |
| Open / inspectable physics           | ✅           | ❌     | **Roadman wins here** |
| Real-actual calibration loop         | ✅           | ⚠️     | BBS has it internally; not exposed |
| Beautiful share posters              | ✅           | ❌     | Marketing edge |
| Scenarios / what-if sliders          | ✅           | ✅     | |
| Per-segment air density              | ✅           | ✅     | |
| Yaw histogram                        | ✅           | ⚠️     | Niche but neat |

---

## 4. Edge Case Behavior

What happens with:

| Input                                 | Current behavior                               | Should be                              |
| ------------------------------------- | ---------------------------------------------- | -------------------------------------- |
| Empty rider input                     | `validateRider` returns 400                    | ✓ correct                              |
| Body mass = 0 / NaN                   | 400 ("Body mass is required.")                 | ✓ correct                              |
| GPX with no `<ele>` tags              | Course gain = 0, no climbs, fast prediction    | ⚠️ Should warn or reject               |
| GPX with 49 points                    | 400 ("at least 50 gpxPoints")                  | ✓ correct                              |
| GPX with 200 km / 100 points          | Parses, gradient meaningless                   | ⚠️ Should reject as too sparse         |
| GPX 8.0001 MB                         | 413 ("GPX too large")                          | ✓ correct                              |
| GPX backtracking out-and-back         | Distance double-counted                        | ⚠️ Should detect or warn               |
| FTP 80 W                              | Accepted (≥50)                                 | Untested at this extreme               |
| FTP 600 W                             | 400 ("FTP should be between 50 and 500")       | ✓ correct                              |
| Course of pure descent                | Engine returns time; no climbs detected        | ✓ but no test for it                   |
| Tailwind > rider speed                | Drag flips sign correctly                      | ✓ but no test                          |
| Course duration 24h+                  | Engine + durability computes; no test          | Untested                               |
| Pacing length mismatch                | Throws                                         | ✓                                      |
| Negative humidity                     | No explicit guard                              | Should clamp                           |
| Wind speed 100 m/s                    | Air density physics holds, drag goes wild     | Should clamp at API boundary           |

The bisection solver has guards for unsolvable bracket (line 70–82) — good. But there's no NaN-safety. If somehow a NaN reaches `solveSpeedFromPower`, the function returns NaN silently, propagating through the simulation and failing only at JSON serialization. Add `if (!Number.isFinite(...)) throw` at the entry point.

---

## 5. Performance

A 200 km / 50 m course = 4,000 segments. Each segment runs:
- 1 air-state computation (cheap)
- 1 bisection (≤30 iterations × ~10 floating ops) ≈ 300 ops
- 1 yaw lookup (atan2)

Total ≈ 1.5 M ops per simulation. Modern V8 will run this in <50 ms on server, <100 ms on mid-range mobile.

`optimizePacing` runs 2 simulations (baseline + final). `runPrediction` runs at most 3 (baseline + sustainable check + adjusted). The Race Report generator runs 5 scenarios = 5 simulations. All well within budget.

The `/api/predict/[slug]/scenarios` endpoint runs 1 simulation per slider change with 220 ms debounce — felt as real-time.

**Performance is not a problem.** If anything, there's headroom for the time-stepped dynamics solver suggested above.

One small concern: `parse-gpx/route.ts` re-runs `buildCourse` on the server *and* expects the client to submit the same point array back to `/api/predict` which runs `buildCourse` again. The Gaussian smoothing (sigma=4, ~2,000 multiplications per pass) is run twice. Not catastrophic — but trivially solvable by caching the parsed Course server-side under an opaque ID.

---

## 6. Comparison vs Best Bike Split — Verdict

**Where Roadman matches BBS:**
- Power balance physics (gravity / rolling / aero / drivetrain): equivalent
- Air density modelling at altitude: equivalent or better
- Wind resolution: equivalent
- Climb detection and categorization: roughly equivalent (BBS merges; Roadman doesn't)
- Variable-power pacing: BBS more sophisticated
- GPX support: equivalent

**Where Roadman exceeds BBS:**
- Durability decay: **Roadman has it, BBS doesn't.** Single most important amateur-finish accuracy fix on long events.
- AI free-text input: differentiated
- Open architecture: future-proof
- Calibration loop with real finishes: built-in

**Where BBS exceeds Roadman:**
- Acceleration / time-stepped integration: meaningful on rollers and punchy profiles
- W'-balance enforcement during simulation: real correctness gap
- Pacing optimizer (NLP vs heuristic): BBS's time gains are larger and provably feasible
- Hour-by-hour weather along the course: BBS pulls historic timing-of-day weather
- Per-checkpoint splits, fuel stops, multi-lap, descender-skill profile: Roadman has none
- Track record of accuracy validation across thousands of races

**Net judgement:** On an Étape, a Marmotte, or a Mallorca 312, Roadman's prediction *under perfect inputs* will be within 2–4% of BBS. With user-supplied FTP-only and AI-translated CdA, it'll be within 4–7% of BBS. That's a credible product position, especially given Roadman's durability advantage on >4 h events, where BBS systematically over-predicts amateur finish times by 5–10 min/hour past the 4-hour mark.

The path to "match or beat BBS" is concrete and achievable:
1. Fix the dynamics gap (acceleration / KE).
2. Enforce W'-balance in simulate.
3. Replace the heuristic optimizer with an actual constrained-NLP.
4. Fix synthetic course elevation.
5. Add drafting, hour-of-day weather, and fuel-stop planning.

In that order, those five fixes plausibly move Roadman from "B-grade BBS clone with a durability advantage" to "credibly better than BBS for amateur sportive predictions". None of them require a rewrite.

---

## 7. Specific Recommendations (Prioritized)

### Must-fix (correctness or trust)

1. **Fix synthetic course elevation** (`fixtures.ts`). Mallorca 312, Flanders, Wicklow are all materially wrong. Either substitute real GPX (preferred, follow `traka-2026.ts` pattern) or remove and require DB.
2. **Implement time-stepped integration** with acceleration in `engine.ts`. Wire behind a flag, validate against existing BBS-parity tests, ship as v2. Use the unused `DEFAULT_STEP_M` and `SUBSTEP_ACCEL_THRESHOLD` constants — they were clearly intended for this.
3. **Enforce W'-balance in simulate.** At minimum, clamp `targetPower` to `CP + max(0, W'_balance) / dt` per segment. Document that the optimizer doesn't yet feed back, but the simulator now respects the constraint.
4. **Fix the engine.ts:107 comment.** It misleadingly claims "kinetic energy carry-over" that doesn't exist.
5. **Validate GPX more strictly** in `gpx.ts` and `parse-gpx/route.ts`: reject if <50% points have elevation, if median spacing > 200 m, or if timestamps go backwards. Return user-friendly error messages.
6. **Use dynamic `/share` route as OG image** for prediction pages. Trivial change, big share-conversion impact.

### Should-fix (accuracy budget)

7. **30-s rolling window for normalized power** in `analysis.ts`. Cheap, matches universal definition.
8. **Three-anchor CP/W' fit** including p5min, with rider-type selector for synthesized PD curves.
9. **Fix scenarios endpoint PD scaling.** Only scale p20/p60 by ftpDelta, not all anchors.
10. **Replace endpoint-only CdA objective** with full sum-squared drift in `cda-estimator.ts`.
11. **Merge climbs separated by short flat sections** in `gpx.ts:detectClimbs`.
12. **Tighten test edge cases:** zero-distance, NaN, all-descent, tailwind > rider speed, ultra-long, missing elevation.

### Nice-to-have (product polish)

13. **Consolidate duplicated UI components.** Single `CourseCard`, single `MiniElevation`, single what-if slider implementation.
14. **Clarify email-gate vs upgrade-gate flow** on the results page.
15. **Add drafting toggle / paceline % slider** as a CdA modifier in scenarios.
16. **Pull hour-of-day weather** along the course timing for the paid Race Report.
17. **Per-checkpoint splits and fuel-stop planning** in the Race Report.
18. **Cache parsed GPX server-side** under an opaque ID to avoid re-parsing and large client→server payloads.
19. **Inline GPX upload errors** in the dropzone component.
20. **Stricter rate-limit fallback** when redis is down (fingerprint+IP, not just cookie).

### Polish (low priority)

21. Replace tautological tests (e.g. `engine.test.ts:211`) with energy-balance assertions.
22. Document the magic-number bias coefficients in `pacing.ts` or replace them with calibrated values.
23. Drivetrain efficiency by chainline / temperature-dependent Crr — last 0.5% of accuracy budget.
24. Per-prediction OG image generated once at prediction time and stored, rather than rendered on each share-card request.

---

## 8. Closing Notes

This is a **good codebase**. The math is clean, the layering is right, the test discipline on the headline cases is unusual and welcome, and the product strategy (free prediction → email gate → paid Race Report → coaching community) is coherent. The pieces that aren't done yet (acceleration physics, W'-enforcement, real optimizer) are explicitly flagged in comments as Phase 2/3/4 — they were cut for v1, not forgotten.

The two things that bother me most:

1. **The wrong-elevation synthetic fixtures.** They make the predictor look bad on its most-prominent landing-page courses. Fix this before any marketing push.
2. **The kinetic-energy gap with a misleading comment.** The comment at `engine.ts:107` is the kind of thing an external reviewer (or a future hire) will read, raise an eyebrow, and lose trust over. A 30-second comment fix matters more than the underlying physics fix in the short term.

Beyond that — keep going. The path to BBS-parity-or-better is well-defined, and the product layer around the engine (calibration loop, AI translator, durability advantage, paid report, share posters) is where Roadman's competitive moat actually lives. The engine doesn't need to be *better* than BBS to win; it needs to be *good enough* and surrounded by a better experience. It's most of the way there.

— end of review —
