# Race Predictor Launch Handoff

## Local Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000/predict`. With no Postgres URL, the app uses bundled course fixtures and a temporary local prediction store.

## Required Production Environment

- `POSTGRES_URL` and `POSTGRES_URL_NON_POOLING`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_RACE_REPORT_PRICE_ID`, or `RACE_REPORT_PRICE_CENTS` and `RACE_REPORT_CURRENCY`
- `RACE_REPORT_ACTIVE=true`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_SITE_URL=https://roadmancycling.com`
- `BLOB_READ_WRITE_TOKEN` is optional for other paid-report PDF storage; Race Reports have a private printable web view.
- Analytics variables already used by the main site, including `NEXT_PUBLIC_GA_ID`, should remain configured.

Never commit real values. `.env.example` is the canonical name list.

## Database And Catalog

The current production database has an empty Drizzle migration ledger despite having the historical schema. Do not run the broad `npm run db:migrate` command against it. Apply only the predictor integrity change:

```bash
npm run db:migrate:predict
```

This command runs in a transaction, refuses to proceed if duplicates exist, deletes no result data, and adds the uniqueness constraint used by the application upsert.

Seed the event catalog:

```bash
npm run seed:race-events
```

The seed routes are event-profile approximations. The seed command skips any route already imported with verified GPX provenance, so a later seed cannot downgrade it. Replace each profile route when a permitted final GPX is available. Imports dry-run unless `--commit` is present:

```bash
npm run routes:import -- \
  --file=/absolute/path/event.gpx \
  --slug=event-slug \
  --name="Event Name" \
  --country=Ireland \
  --region=Wicklow \
  --event-date=2027-06-01 \
  --surface=tarmac_mixed \
  --source-url=https://organiser.example/final-route
```

Review distance, elevation, points, climbs, parser warnings and SHA-256 output. Repeat with `--commit` only after provenance and route shape are approved.

## Calibration

Riders submit their actual finish on the private result page. Generate an anonymous aggregate report with:

```bash
npm run predict:calibration
```

The JSON output includes count, MAPE, signed bias, median/P90 absolute error, percentage within 5% and 10%, and breakdowns by course, rider and event type. Do not publish an accuracy claim from a tiny cohort.

On 2026-08-14 the available baseline contained four submissions: 16.5% MAPE, 16.19% median absolute error, and 50% within 10%. Treat this as a pipeline check, not model validation.

## Release Verification

```bash
npm run test:run
npm run lint
npx tsc --noEmit
npm run build
```

These checks passed on 2026-08-14: 914 tests across 128 files, zero lint errors, clean TypeScript, and a production build covering 4,155 generated pages. A production-mode health check also confirmed Stripe, Race Report generation and Resend were configured, with the Race Report priced at USD 29.

In staging, verify:

1. Choose a catalog event and generate a prediction.
2. Upload a clean and a malformed GPX.
3. Check desktop and mobile result layouts.
4. Complete one Stripe test-mode Race Report purchase.
5. Confirm the webhook marks the order paid and starts generation.
6. Confirm Resend delivers the private report link.
7. Open and print/save the report as PDF.
8. Submit an actual result and run the calibration command.
9. Confirm analytics records the prediction, email, premium CTA, checkout, purchase, generation and delivery events.

## Rollback

Application changes are deploy-reversible. Migration `0062` is intentionally not automatically reversible because reintroducing duplicate actual results would weaken calibration integrity. If the application must be rolled back, the unique index remains compatible with older insert behavior for first submissions; repeated submissions would surface a constraint error until the new upsert code is restored.
