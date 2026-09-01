# App acquisition dashboard release — 1 September 2026

## Shipped

- A dedicated `/admin/funnel/app` scorecard for the single app early-access
  audience.
- Server-side unique joins and repeat attempts, independent of analytics
  consent.
- A clearly separated consented funnel from `/app` visit to form start to
  confirmed capture.
- Acquisition-source and hero/bottom placement breakdowns without creating a
  second Beehiiv list or segment.
- AI-referred app sessions, source-tagged sessions and content CTA traffic into
  `/app`.
- First-interaction form-start tracking for every email capture, with app
  reporting isolated by the permanent `roadman-app-waitlist-*` source prefix.

## Measurement boundary

The subscriber table retains a person's original acquisition source, so it is
not a complete app-list ledger when an existing Saturday Spin subscriber later
joins early access. The app scorecard therefore uses the server-recorded signup
event for every app form post and deduplicates its masked email fingerprint.
Browser visit and form-stage rates are shown separately because they require
analytics consent.
