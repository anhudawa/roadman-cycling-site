# Roadman Race Predictor Completion Checklist

Last verified: 2026-08-14

## Objective And Success Criteria

The objective is to make `/predict` a premium, revenue-driving race prediction and Race Report product. Completion means the repository provides:

1. A documented audit and phased implementation plan.
2. A deterministic, physics-based engine separated from the UI.
3. A hardened GPX upload and course-processing path.
4. An expandable event catalog and indexable event pages.
5. A mobile-first free prediction flow with transparent confidence.
6. A paid Race Report with practical race-day guidance and private delivery.
7. A Stripe-ready conversion funnel and analytics coverage.
8. SEO metadata, schema, sitemap coverage, and event landing pages.
9. Tests, real-result capture, and cohort calibration metrics.
10. Passing lint, typecheck, tests, build, and a documented launch procedure.

## Prompt-To-Artifact Evidence

| Requirement | Evidence | Status |
| --- | --- | --- |
| Audit current stack, routes, model, APIs, database, analytics, payments, auth, SEO, and deployment assumptions | `ROADMAN_PREDICT_AUDIT.md` | Complete |
| Phased implementation plan | `ROADMAN_PREDICT_AUDIT.md` and `docs/superpowers/plans/2026-04-25-race-predictor-phase-1-2.md` | Complete |
| Rider/bike/power/course/weather/drafting/event inputs | `src/app/(content)/predict/page.tsx`, `src/app/api/predict/route.ts`, `src/lib/race-predictor/run.ts` | Complete |
| CdA, Crr, drivetrain, air density, wind/yaw, gravity, rolling and aero physics | `src/lib/race-predictor/physics.ts`, `environment.ts`, `engine.ts`, `run.ts` | Complete |
| Gradient distribution, climbs, descents, surfaces, pacing, W-prime and durability | `gpx.ts`, `analysis.ts`, `pacing.ts`, `engine.ts` | Complete |
| Deterministic engine and clean UI separation | `src/lib/race-predictor/**` | Complete |
| Input validation and normalization | `src/app/api/predict/route.ts`, `run.ts`, `translator.ts` | Complete |
| Confidence range without unsupported precision claims | `insights.ts`, `run.ts`, result page; route provenance now widens profile-route bands | Complete |
| GPX validation, malformed/empty/large handling, cleaning, smoothing, climbs and warnings | `gpx.ts`, `GpxDropzone.tsx`, `/api/predict/parse-gpx` | Complete |
| Drag/drop, loading state, timeout and helpful errors | `src/components/features/predict/GpxDropzone.tsx` | Complete |
| GPX parser fixtures: valid, empty, malformed, missing elevation, bad coordinates, spikes, long and short | `gpx.test.ts`, `tests/api/predict-parse-gpx.test.ts` | Complete |
| Expandable event model and course catalog | `src/data/races.ts`, DB `courses`, `fixtures.ts`, `scripts/seed-race-events.ts` | Complete |
| Named priority events from the brief | Regression coverage in `src/lib/race-predictor/fixtures.test.ts` | Complete |
| Route provenance and safe replacement of profile routes | `route-provenance.ts`, `scripts/import-race-route.ts` | Complete in code; real organiser GPX files remain an operations/content task |
| Choose event or upload GPX | Browser-verified locally at desktop and 390 px mobile | Complete |
| Rider, bike, power, weather and race-assumption flow | `/predict` UI and prediction API | Complete |
| Free finish time, range, speed, power, difficulty and key factors | `/predict/[slug]`, `PredictedTimeHero.tsx` | Complete |
| Premium preview and paid CTA | `/predict/[slug]`, `upgrade-form.tsx` | Complete |
| Segment and climb pacing, where to push/conserve | `report.ts` pacing and climb plans | Complete |
| Wind, descending and technical guidance | `report.ts` | Complete |
| Nutrition, hydration and feed-station plan | `report.ts` | Complete |
| Equipment, tyre pressure and gearing guidance | `report.ts` | Complete |
| Training priorities, race-week and morning checklist | `report.ts` | Complete |
| Biggest gains and risks | `report.ts` | Complete |
| Printable/downloadable report | Private HTML view plus `Print / Save as PDF` in `IsolatedReportView.tsx`; diagnostic reports retain native PDF delivery | Complete |
| Secure paid unlock and delivery | `/api/predict/[slug]/upgrade`, Stripe dispatch, paid-report generator, Resend delivery, tokenized report view | Complete in code; staging purchase must be run with deployed credentials |
| Funnel analytics events | `useTrack` calls, paid-report analytics, Stripe-confirmed `report_purchased` | Complete |
| `/predict`, event pages, dynamic metadata, FAQ and schema | `/predict/layout.tsx`, `/predict/[slug]/page.tsx`, `sitemap.ts` | Complete |
| Personal results noindex; event pages indexable | `/predict/[slug]/page.tsx` metadata branching | Complete |
| Shareable results and image | result share route and `SharePoster.tsx` | Complete |
| Actual-result capture | `/api/predict/[slug]/actual`, `AccuracyFeedback.tsx`, `prediction_results` | Complete |
| One canonical result per prediction | migration `0062_prediction_result_idempotency.sql`, upsert in `store.ts` | Complete in code; migration must be applied |
| MAPE, bias, median/P90 and course/rider/event cohorts | `calibration.ts`, `npm run predict:calibration` | Complete |
| Unit/API/benchmark coverage | Race predictor tests plus payment and GPX API tests | Complete |
| Vercel compatibility and environment docs | `.env.example`, production build, `docs/race-predictor-launch-handoff.md` | Complete |
| Mobile responsiveness | Browser-verified with zero horizontal overflow; stable finish-time layout at 390 px | Complete |

## Verification Evidence

- Full test suite: 128 files and 914 tests passed against the final code.
- New focused coverage: calibration, route provenance, route confidence, report sections, payment, delivery and GPX API tests passed.
- TypeScript: `npx tsc --noEmit` passed against the final code.
- Repository lint: `npm run lint` passed with zero errors. There are 68 pre-existing warnings outside the release scope.
- Production build: `npm run build` passed against the final code and generated all 4,155 pages.
- Production-mode availability: Stripe checkout, Race Report generation and Resend delivery all reported ready. The configured report price is USD 29.
- Calibration command: completed against four submitted results. Baseline MAPE is 16.5%, median absolute error is 16.19%, and 50% are within 10%; the cohort is far too small for a public accuracy claim.
- Browser path: Mallorca 312 prediction saved successfully at `/predict/936uhnx2w` in local QA.
- Browser path: GPX fixture parsed, cleaned and selected successfully.
- Responsive path: desktop and 390 x 844 checks had no horizontal overflow. Finish time is exposed as `Predicted finish 10 hours 7 minutes 15 seconds` and remains stable on initial render.
- Course catalog: warm response measured at approximately 9 ms after projection/cache hardening; edge-cache headers are present.

## Release Gate

Already verified against the working tree:

```bash
npm run test:run
npm run lint
npx tsc --noEmit
npm run build
npm run predict:calibration
```

Before production release, review and apply the migration, seed or refresh the event catalog, then complete one Stripe test-mode purchase in staging:

```bash
npm run db:migrate:predict
npm run seed:race-events
```

Confirm checkout, webhook receipt, report generation, Resend delivery, private report view, print/save-as-PDF, analytics events, and actual-result submission.

## Honest Remaining Risks

- Most named event routes are event-shaped profile approximations, not final organiser GPX files. The UI now says so, confidence bands widen automatically, and `npm run routes:import` is the replacement path. Accuracy claims must stay conservative until sourced routes and actual-result cohorts exist.
- Migration `0062_prediction_result_idempotency.sql` has not been applied by this local code change. The dedicated command refuses to proceed if duplicates exist and never deletes result data. Do not use the broad migration command against the current production database because its historical migration ledger is empty.
- Calibration code is complete, but the current four-result cohort has 16.5% MAPE and is not large or representative enough for a public accuracy claim. Verified routes and substantially more post-event submissions are the next accuracy priority.
- Garmin/Wahoo execution export and FIT upload remain future integrations; neither is claimed in the current product.
