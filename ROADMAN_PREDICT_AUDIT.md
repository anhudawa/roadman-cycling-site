# Roadman Race Predictor Audit

Last updated: 2026-05-05

## Scope

This audit covers the current `/predict` product in the local Roadman Cycling Next.js codebase. Benchmark context is Best Bike Split's public promise around physics-based time prediction, athlete/bike/course/weather inputs, power targets, route upload, device execution guidance, and paid planning value.

## What Exists Now

- Stack: Next.js App Router (`next@16.2.4`), React 19, TypeScript, Tailwind CSS, Drizzle ORM, Vercel Postgres, Vercel Analytics, GA4 fan-out, Stripe, Resend, Upstash Redis, `fast-xml-parser`, Vitest.
- Routes:
  - `/predict` is the main client-side prediction experience at `src/app/(content)/predict/page.tsx`.
  - `/predict/[slug]` is the result page with predicted time, confidence band, course profile, key insight, email gate, scenario previews, and Race Report upsell.
  - `/predict/[slug]/success` handles checkout success.
  - `/predict/courses` exposes a course catalog page.
- APIs:
  - `POST /api/predict` validates rider inputs, resolves a curated course or GPX points, runs the engine, saves a prediction, and returns a result slug.
  - `POST /api/predict/parse-gpx` parses raw GPX XML for the upload preview.
  - `GET /api/courses` returns verified curated course summaries.
  - `POST /api/predict/[slug]/unlock` captures email for free breakdown unlock.
  - `POST /api/predict/[slug]/upgrade` creates the Stripe checkout flow for `report_race`.
  - `POST /api/predict/[slug]/scenarios` computes what-if deltas.
  - `POST /api/predict/[slug]/actual` stores actual finish times for model calibration.
- Prediction engine:
  - Cleanly separated under `src/lib/race-predictor`.
  - Includes GPX parsing/course building, air density and wind resolution, steady-state cycling physics, variable pacing heuristic, rider power profile synthesis, confidence brackets, scenarios, translator, and paid report generation.
  - Uses rider mass, bike mass, position-derived CdA, surface/tyre-derived Crr, drivetrain efficiency, FTP/power profile, distance, elevation, gradient, climbs, wind speed/direction, temperature, air density, and pacing mode.
- GPX:
  - Accepts `.gpx` upload in the UI with drag-and-drop, client size/type checks, server parse endpoint, profile preview, climb detection, and helpful error messages.
  - Current first improvement added coordinate bounds checks plus GPS/elevation spike cleaning in `src/lib/race-predictor/gpx.ts`.
- Event support:
  - `src/data/races.ts` contains SEO/event guide data with `predictor_slug` links.
  - Curated predictor courses live in DB via `courses` and have fixture fallback in `src/lib/race-predictor/fixtures.ts`.
  - Seed script exists at `scripts/seed-race-events.ts`.
- Paid/report functionality:
  - `report_race` product is seeded by migration `drizzle/0037_race_predictor.sql`.
  - Stripe checkout is wired through the existing paid-reports/order tables.
  - Race Report HTML generation and email delivery exists in `src/lib/race-predictor/report.ts`.
  - Product fallback env support exists in `src/lib/paid-reports/products.ts`.
- Database:
  - Race predictor tables: `courses`, `course_segments`, `predictions`, `prediction_results`.
  - Existing paid report tables: `report_products`, `orders`, `paid_reports`.
  - Rider identity exists via `rider_profiles`.
- Analytics:
  - Shared client helper fans out to internal `/api/events`, GA4, and Vercel Analytics.
  - Existing canonical events include page view, prediction started/completed, email captured, checkout/purchase/report events, share clicked, and CTA clicks.
  - First improvement wired key `/predict` UI events for prediction start/completion, event selection, GPX upload, gate email capture, and Race Report checkout start.
- SEO:
  - `/predict` appears in `src/app/sitemap.ts`.
  - Event guides under `/races/[slug]` are indexable and can deep-link to predictor courses.
  - Prediction result pages explicitly set `robots: { index: false, follow: true }`, which is correct for personal result pages.
- Deployment assumptions:
  - Vercel deployment with Node runtime route handlers.
  - Requires Postgres for persistent production predictions/courses; local/dev falls back to fixtures when DB is unavailable.
  - Stripe/Resend are required for paid report checkout and delivery.

## What Is Broken Or Fragile

- The hero copy previously claimed "±3% typical accuracy" without local validation evidence. That is a trust risk. It has been changed to confidence-range language.
- Curated event courses are synthetic route shapes unless real GPX files have been seeded. This is acceptable for a prototype but not enough to claim benchmark-grade event accuracy.
- Wind direction is not exposed clearly in the main form; only wind speed and temperature are surfaced. This leaves a major race-day factor underused.
- Drafting/group-riding assumptions are not yet represented in the engine or UI, despite being critical for road races, sportives, and gran fondos.
- The event system is split between `src/data/races.ts` SEO/event guide data and DB-backed `courses`. It works, but more metadata belongs in one event/course schema to avoid duplication.
- `/api/predict/parse-gpx` returns full points to the browser, and `/api/predict` sends them back. This is simple but can be heavy for long tracks.
- `course_segments` exists but is not populated/used; segment-level surfaces and route metadata are still JSON-only.
- GPX elevation smoothing is generic. It now removes obvious spikes, but it does not yet provide warnings back to the UI, point-reduction metadata, or confidence penalties for poor files.
- Payment flow depends on Stripe webhook/report generation behaving correctly after checkout. The UI has an availability check, but there is no dedicated end-to-end Race Report purchase test for the prediction path.
- `.env.example` had stale mojibake comments and lacked Race Report env names; Race Report vars have now been added, but the file still needs wider cleanup.

## Missing Versus Best Bike Split

- Real event/course database with verified GPX/FIT routes and route provenance.
- FIT upload support.
- Per-segment weather along the route based on time/location rather than one global wind and temperature input.
- Wind direction UI and course-relative wind maps.
- Device export or live race execution support for Garmin/Wahoo.
- Formal segment-by-segment optimization against target normalized power/IF constraints.
- Explicit yaw/aero equipment analysis in the UI.
- CdA calibration from real ride files.
- Drafting/bunch benefit modelling.
- Course-specific validated accuracy badges backed by submitted actual results.
- Full event page SEO architecture under `/predict/[event-slug]`; current personal prediction pages are noindex and event guides live separately under `/races`.

## Quick Improvements

- Keep accuracy language conservative: confidence range, inputs that affect range, no unsupported precision claims.
- Add wind direction, drafting assumption, tyre/surface, event type, and rider height controls to the free form.
- Surface the top 3 accuracy factors in the result page: course quality, CdA/position certainty, weather/wind uncertainty.
- Add GPX warnings in the parse response: points removed, elevation spikes corrected, missing elevation, sparse track.
- Add indexed event prediction landing pages such as `/predict/mallorca-312`, while keeping personal result pages noindex.
- Expand analytics to cover premium CTA viewed/clicked, checkout started, purchase completed, report generated, report downloaded.
- Add real GPX ingestion/admin tooling for curated routes and mark synthetic fixtures clearly in admin/internal docs.
- Create a Race Report preview component before checkout that shows concrete sample sections, not generic promise text.

## Deeper Modelling Work

- Replace heuristic pacing with constrained optimization over segment groups, target IF/NP, W' balance, and durability.
- Add route-time weather sampling using forecast/historical weather APIs and rider start time.
- Add group/drafting modelling by event type and rider pack assumption.
- Add tyre pressure/gearing recommendations from rider mass, bike type, tyre width, surface, and gradient distribution.
- Build a validation loop dashboard: mean absolute percentage error by course, rider type, event type, and input completeness.
- Add FIT support and ride-file-based CdA/Crr calibration.
- Build exportable race execution files once the pacing model is trusted.

## Implementation Plan

1. Trust and instrumentation first:
   - Remove unsupported accuracy claims.
   - Wire funnel analytics for prediction start/completion, GPX upload, event selection, email capture, checkout start, report generation/download.
   - Add environment variable docs for Race Report checkout.
2. GPX hardening:
   - Validate lat/lon ranges.
   - Smooth elevation and remove isolated spikes.
   - Detect GPS detours and sparse/bad tracks.
   - Return warnings to the UI and penalize confidence when GPX quality is low.
3. Accuracy UX:
   - Add wind direction, drafting assumption, event type, tyre/surface, and rider height inputs.
   - Show confidence drivers beside the prediction.
4. Event architecture:
   - Consolidate event SEO metadata and predictor course metadata.
   - Add indexable `/predict/[event-slug]` event landing pages.
   - Seed priority events with route provenance fields.
5. Premium report:
   - Expand report sections around segment pacing, wind strategy, nutrition, equipment, checklist, biggest gains/risks.
   - Add printable/PDF delivery path when HTML report is stable.
6. Validation:
   - Improve actual-result capture UX.
   - Add admin/reporting views for prediction error over time.
   - Use real result data to tune confidence bands and model defaults.
7. Deployment readiness:
   - Run targeted race-predictor tests, full test suite where feasible, lint, typecheck, and build.
   - Confirm Vercel env requirements and no committed secrets.

## First Chunk Implemented In This Pass

- Added this audit document.
- Hardened GPX parsing/course building for invalid coordinates, GPS detours, and isolated elevation spikes.
- Added GPX tests for malformed coordinates, missing elevation, GPS spike cleaning, and elevation spike cleaning.
- Replaced unsupported public "±3% typical accuracy" hero claim with confidence-range wording.
- Added Race Report env examples.
- Wired client analytics calls in the main predictor flow, email gate, and Race Report upgrade form.

## Second Chunk Implemented

- GPX parse results now return cleaned points, a machine-readable quality report, and rider-facing warnings.
- The GPX upload card now shows when the track was cleaned, including GPS spikes, elevation spikes, bad coordinates, and missing elevation.
- The `/api/predict` submission now receives the cleaned track points from the upload flow instead of the raw spiky points.

## Third Chunk Implemented

- Added wind direction to the `/predict` weather controls instead of treating wind as a vague global headwind.
- Added a drafting/group-riding assumption control: mostly solo, small group, or bunch.
- Restored the intended mode choice between "Plan my race" and "Can I make it?" instead of showing a duplicate power/weight block.
- The prediction engine now reduces effective CdA for drafting assumptions and widens confidence for group-riding scenarios because pack dynamics are less deterministic.
- Added unit coverage proving drafting changes CdA, predicted time, and confidence width.

## Fourth Chunk Implemented

- `/predict/[slug]` now doubles as an SEO event landing page when the slug matches a curated predictor course and no personal prediction exists.
- Personal prediction result pages still stay `noindex`; curated event predictor pages are indexable with event-specific metadata.
- Added predictor event URLs to the sitemap for races that have `predictor_slug` mappings.

## Fifth Chunk Implemented

- The personal result page now explains the confidence range in plain cyclist language.
- The free result now shows the top factors affecting the prediction, including course load, wind risk, and aero setup.
- This moves the free result closer to the brief: finish time, time range, average speed/power, course difficulty insight, and clear reasons behind the number.

## Sixth Chunk Implemented

- Expanded the paid Race Report HTML with coaching sections for biggest time gains, biggest risks, wind strategy, race-week checklist, and morning-of checklist.
- The premium report now better matches the requested Roadman coaching voice: practical, race-day useful, and focused on decisions riders can act on.

## Seventh Chunk Implemented

- Mounted the existing Accuracy Feedback component on prediction result pages.
- Riders can now submit actual finish time, average power, email, and ride link after race day.
- This connects the existing `prediction_results` table and `/api/predict/[slug]/actual` endpoint to the public product, making the validation loop real instead of only architectural.

## Eighth Chunk Implemented

- Added predictor mappings for more high-intent race guides: Fred Whitton Challenge, Maratona dles Dolomites, Gran Fondo New York, and Haute Route Alps.
- Added synthetic but event-shaped seed/fixture courses for Fred Whitton, Maratona dles Dolomites, and Gran Fondo New York so they can appear as prediction-ready before real GPX provenance lands.
- Seed script and local fixture fallback were updated together to keep local/Vercel behaviour aligned.

## Ninth Chunk Implemented

- Added fixture regression tests to ensure every SEO `predictor_slug` has fallback course data.
- Added plausibility checks for the new Maratona, Fred Whitton, and GFNY synthetic fixtures so distance, elevation, and climb counts stay inside reasonable bounds.
- Verified the current implementation with focused predictor tests, lint on changed files, TypeScript, and a production build.

## Tenth Chunk Implemented

- Removed remaining public "within ±3%" / "typical accuracy ±3%" Race Predictor claims from metadata, the tools page, race guide CTAs, and the older predictor form.
- Replaced those claims with confidence-range language that better matches the model's current evidence level.
- Added client-side checkout-success tracking on the Race Report post-payment page, without logging raw Stripe session IDs.

## Eleventh Chunk Implemented

- Exposed the engine's existing surface / rolling-resistance model in the main `/predict` form with road, gravel, and cobble options.
- Passed the selected surface through `/api/predict` into the deterministic model, while preserving explicit AI-derived Crr overrides when present.
- Added API validation and unit coverage proving rougher surfaces increase Crr and produce slower predictions.

## Twelfth Chunk Implemented

- Added event type as a first-class rider input: sportive, gran fondo, road race, time trial, gravel, and triathlon.
- The prediction engine now uses event type to set conservative pacing intensity targets instead of treating every event like the same steady sportive.
- Road race and gravel assumptions widen confidence bands because pack dynamics, surface variability, and tactical surges make the prediction less deterministic.
- Added API validation and unit tests for event-type pacing and confidence behaviour.

## Thirteenth Chunk Implemented

- Added optional rider height to the `/predict` setup form and API validation.
- Height now nudges preset CdA conservatively when no explicit CdA is available, improving the default aero estimate without pretending to know a rider's tested drag.
- Explicit CdA from the bike/setup translator still wins, so measured or richer estimates are not overwritten.
- Added unit coverage for height-adjusted CdA and explicit-CdA precedence.

## Fourteenth Chunk Implemented

- Added drivetrain condition to the `/predict` setup flow with cyclist-language choices: race-ready, normal, dirty, and poor.
- The selected condition maps to drivetrain efficiency and is passed into the deterministic model, where lower efficiency reduces wheel power and slows the prediction.
- Added API validation for drivetrain efficiency and unit coverage proving dirty/poor drivetrains produce slower predictions.

## Fifteenth Chunk Implemented

- Expanded the premium Race Report equipment section with practical tyre-pressure and gearing guidance.
- Tyre-pressure guidance now responds to rider+bike system mass, rolling-resistance/surface signals, and avoids pretending to know tyre width when it was not supplied.
- Gearing guidance responds to climb severity, especially steep routes where bailout gears are a real race-day limiter.
- Added report-rendering test coverage so these premium equipment sections stay present.

## Sixteenth Chunk Implemented

- Saved key modelling assumptions into each prediction `resultSummary`: event type, drafting, surface, rider height, drivetrain efficiency, and whether CdA/Crr came from explicit inputs or presets.
- Added a "Model assumptions" section to the premium Race Report so riders can see the inputs behind the number and correct bad assumptions.
- Extended report-rendering tests to cover the assumptions section.

## Seventeenth Chunk Implemented

- Added a canonical `report_purchased` conversion event to the Stripe-confirmed paid Race Report webhook path.
- The existing `paid_report_checkout_success` event remains in place; `report_purchased` gives the acquisition funnel its generic purchase-completed signal without relying on the browser success redirect.
- The event records product slug, order id, paid report id, prediction slug, and amount in cents, while keeping payment/session details out of public analytics metadata.

## Eighteenth Chunk Implemented

- Added premium upsell impression tracking to the prediction result upgrade form.
- The funnel now captures when the Race Report CTA is viewed, when checkout is started, and when Stripe confirms purchase.
- This closes a key measurement gap between free prediction completion and paid-report conversion.

## Nineteenth Chunk Implemented

- Added API coverage for the Race Report availability endpoint so preview/local deployments safely show checkout as unavailable when Stripe is not configured.
- Hardened the Stripe dispatcher test to cover the canonical `report_purchased` event fired from the webhook-confirmed purchase path.
- Cleaned `.env.example` and documented the Race Report checkout, webhook, database, delivery, and optional Blob storage variables needed for Vercel.

## Twentieth Chunk Implemented

- Added SEO structured data to `/predict/[slug]` event landing pages: breadcrumb schema, predictor app/offers schema, course properties, and FAQPage schema.
- Added a visible event-prediction FAQ block that explains how the model works, what data the event page uses, what improves accuracy, and what the premium Race Report unlocks.
- This strengthens indexable event predictor pages without making unsupported accuracy claims.

## Twenty-First Chunk Implemented

- Expanded the race guide and predictor event catalog with five named priority events from the brief: Strade Bianche Gran Fondo, Paris-Roubaix Challenge, Belgian Waffle Ride California, Unbound Gravel 200, and Leadville Trail 100 MTB.
- Added matching synthetic fallback courses and seed-script entries so local previews and seeded environments can predict these events before real GPX provenance is available.
- Linked Wicklow 200 to its existing predictor course and added regression coverage proving every priority event has a race guide, predictor slug, and fallback course data.

## Twenty-Second Chunk Implemented

- Added a content-type gate to `/api/predict/parse-gpx` so the server accepts GPX/XML uploads and rejects unsupported file types with a clear 415 response.
- Added direct API route tests for unsupported file type, empty GPX, huge GPX, malformed GPX, sparse/too-short tracks, and a valid GPX response with profile, points, quality counts, warnings, and course stats.
- Re-ran the parser test suite alongside the new API tests, strengthening the GPX hardening coverage requested in Phase 3.
