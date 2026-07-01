# Morning blockers — Sunday 31 May 2026

Things only you can action that are holding up active projects. Status reflects what's actually in the repo vs the original May 13 list.

---

## 1. Method video scripts — RECORDING ONLY
~~Scripts unwritten~~ → **Scripts done.** All 12 module scripts are written in `docs/method-module-teleprompter-scripts.md` (60–90 sec each, same setup as the diagnostic profile scripts). Recording is the only remaining step. Estimate 1–2 batched days. **No script work needed from you.**

## 2. Beehiiv post-diagnostic nurture sequence — STILL BLOCKED
5 emails live in `plateau-diagnostic-nurture-sequence.md`, segmented across 4 plateau types (training/FTP, nutrition/body comp, recovery/fatigue, no structure). Copy + segmentation logic is final. **You or Sarah need to build the automation in Beehiiv.** Until that happens every diagnostic completion since the sequence was written drops into the generic Saturday Spin list instead of the targeted nurture.

## 3. Exit intent + Masters Report Beehiiv wiring — PARTIALLY RESOLVED
~~Both forms need endpoints confirmed~~ → **Masters Report path is now Resend-primary.** `src/app/api/newsletter/route.ts` sends the transactional welcome with the PDF link, and `scripts/beehiiv-masters-report-automation.md` documents the belt-and-braces Beehiiv tag automation as a fallback. **Still on you:** (a) build the `Masters Report — PDF delivery` automation in the Beehiiv UI per the doc, (b) confirm the `/go` exit-intent popup (`src/components/features/conversion/ExitIntentPopup.tsx` → `/api/newsletter`) is tagging correctly in Beehiiv. Both are 15-min UI tasks.

## 4. TrainingPeaks legacy plan logic — LOGIC EXTRACTED, PLANS NOT BUILT
~~Legacy plan structure needs explaining~~ → **Done.** `docs/trainingpeaks-plan-analysis.md` and `docs/trainingpeaks-hour-band-variants.md` capture your day-pattern (Mon REST / Tue Key 1 / Wed Endurance / Thu Key 2 / Fri REST / Sat Long / Sun REST), the scaling rules for 6/8/10/12 hr bands, and per-phase session modifications. `docs/method-training-plan-matrix.md` defines all 48 plans (4 goals × 4 hour-tiers × 3 levels) with exact naming convention. **Remaining ask:** the 48 plans don't yet exist in TrainingPeaks. Need you to confirm whether you'll build them or grant access so someone else can.

## 5. Method onboarding quiz — STILL BLOCKED
Matrix doc references `src/lib/method/onboarding/plan-matrix.ts` as the code-side source of truth — that file does not exist in the repo yet, and there's no `/method/onboarding` route. **Need from you:** final onboarding questions and the answer-to-plan decision tree (which combination of answers maps to which of the 48 plans). Without that, the quiz can't be scaffolded.

## 6. Athlete CRM API access — STILL BLOCKED
No keys provisioned in the repo for Stripe, Skool, TrainingPeaks, or Beehiiv API access at the level needed for the unified CRM. **Need from you:** which of those four are accessible programmatically and the credentials (or instruction that one is off-limits, in which case we route around it).

## 7. Google Ads conversion test — STILL BLOCKED ON 2FA
`docs/google-ads-recovery-plan.md` shows account is "BLOCKED — awaiting 2FA verification on anthony@roadmancycling.com" as of 24 May. Code is in place: `GoogleAdsTag.tsx` (AW-18123737652), `AdsLandingAnalytics.tsx` (landing conversion), `ResultsAnalytics.tsx` (diagnostic-complete conversion, €10). **Until you complete 2FA, the test diagnostic can't be verified in the Google Ads console.** Phase 1 of the recovery plan (30-min damage assessment) is queued behind this.

---

## Net asks today, ranked

1. **5 min:** Complete Google Ads 2FA on anthony@roadmancycling.com → unlocks item 7 → unlocks Phase 1 of recovery plan.
2. **30 min:** Send the onboarding quiz questions + decision tree (item 5).
3. **30 min:** List which of Stripe / Skool / TrainingPeaks / Beehiiv we have API access to and forward keys (item 6).
4. **15 min × 2:** Build the Masters Report automation in Beehiiv UI and verify the `/go` exit-intent tag (item 3).
5. **Decide:** are you building the 48 TrainingPeaks plans yourself or delegating (item 4)?
6. **Block:** 1–2 days this week to batch-record the 12 Method scripts (item 1).
7. **Hand off:** put item 2 (Beehiiv nurture build) on Sarah's plate this week.

Items 1, 3 (partial), and 4 (partial) have moved since May 13. Items 2, 5, 6, 7 are unchanged.
