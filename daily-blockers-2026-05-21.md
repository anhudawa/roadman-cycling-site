# Daily Blockers — Wednesday, 21 May 2026

Updated mid-day after audit. Several "blockers" turned out to be stale.

---

## CLOSED — Already Done

### ~~5. Method onboarding quiz~~ ✅ SHIPPED
Fully built and deployed: questions, 48-plan matrix (4 goals × 4 hour tiers × 3 levels), decision tree, recommender engine, UI, results view. Live at `/method/onboarding`. Gated behind auth middleware. Nothing needed.

### ~~3. Exit intent + Masters Report Beehiiv wiring~~ ✅ SHIPPED
Newsletter API route handles both `go-exit-intent` and `masters-report` sources with proper Beehiiv tagging, Resend welcome emails, and CRM upsert. Fully wired.

### ~~2. Beehiiv email sequences~~ ✅ LIVE
4 plateau diagnostic automations running in Beehiiv with 3 emails each:
- Fuelling Deficit: 57% open, 12 enrolled
- Strength Gap: 62% open, 17 enrolled
- Polarisation Gap: 43% open, 16 enrolled
- Under-Recovered: 44% open, 6 enrolled

V2 expansion to 7 emails/sequence is a future optimization, not a current blocker.

---

## FIXED TODAY

### Meta Pixel duplicate initialization ✅ PUSHED
`ConsentAwarePixel` (root layout) and `MetaPixel` were both initializing fbq on diagnostic pages. Consolidated: MetaPixel is now event-only (fires Lead on results page). Commit `b93b1c51`.

### Trustpilot free plan compliance ✅ PUSHED
Replaced trademarked green star tiles with plain coral stars, removed "Verified" language. Commit `9fddbef7`.

---

## STILL BLOCKED ON ANTHONY

| # | Item | Status |
|---|------|--------|
| 1 | Google Ads 2FA on anthony@ | BLOCKED — can't access Google Ads at all without this |
| 2 | Google Ads conversion test | BLOCKED on #1 |
| 3 | Google Ads ad groups 2-4 | BLOCKED on #1 |
| 4 | TrainingPeaks legacy plan structure | BLOCKED — need access or walkthrough |
| 5 | CRM API keys (Stripe, Skool, TP, Beehiiv) | BLOCKED — need keys granted |
| 6 | Method course module video recordings | BLOCKED — teleprompter scripts ready, Anthony records |
| 7 | Hero video for /go | BLOCKED — 60-sec script delivered, Anthony records |
