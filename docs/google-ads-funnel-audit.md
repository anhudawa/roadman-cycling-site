# Google Ads → Conversion Funnel Audit

**Roadman Cycling — read-only code audit**
**Date:** 25 May 2026
**Prepared for:** Anthony Walsh
**Spend snapshot:** €866 spent · 737 clicks · 10 conversions (1.4%) · €86.64 CPA

> Scope: this is a **code-level** audit of the funnel and its tracking. It does not (and cannot) read the live Google Ads console — several conclusions below end with a "verify in console" instruction because the final answer lives in account settings we can't see from the repo. No code was changed.

---

## TL;DR — what's actually broken

The €86 CPA is not one bug. It's three compounding problems:

1. **Google is only counting the single hardest action in the funnel.** The only conversion recording (10) is "Diagnostic Complete," which fires on the **results page** — i.e. after the visitor has crossed **two full sales pages and an 18-screen quiz behind a mandatory email+consent gate**. 10 ÷ 737 = 1.4%, which is exactly the survival rate you'd expect from a funnel that long. This isn't (only) a tracking glitch — the funnel is genuinely too long for cold paid traffic.
2. **The early, high-volume conversion signal isn't recording.** "Ads Landing Page View" (the €1 conversion that should fire on every ad click) is the one the console flags **"Needs attention."** It only exists on `/go/ads` and was never verified during the 8-day 2FA lockout. With only ~10 lifetime conversion signals, Google's bidding has nothing to optimise on — so CPC stays blunt and CPA balloons.
3. **Source attribution is silently dropped.** The ad landing pages pass `?source=ads`, but the diagnostic reads `?utm_source`. They never match, so every internal `diagnostic_complete` / `signup` / CRM / Beehiiv record loses the ads-vs-organic source. You cannot currently answer "how many of my ad clicks completed the diagnostic" from your own data.

On top of those, a full-screen exit-intent popup is allowed to fire **on top of the live quiz**, and the transition from the clean ad page to the cluttered `/plateau` page reintroduces every distraction the ad page was built to avoid.

---

## 1. The full funnel path

```
Google Ad (gclid)
      │  Final URL = ???  ← UNVERIFIED. Intended /go/ads; possibly /go or /plateau (see §3)
      ▼
┌─────────────────────────────────────────────────────────────┐
│ /go/ads  (src/app/go/ads/page.tsx)            [noindex]       │
│  • Full sales page: hero, 4 causes, who-it's-for,             │
│    5 testimonials, podcast credibility, 6-item FAQ, final CTA │
│  • Single CTA repeated 3× → /plateau?source=ads               │
│  • FIRES: Google Ads "Ads Landing Page View" conv (€1)        │
│    on mount  (AdsLandingAnalytics.tsx:36)                     │
│  • Clean surface: no header/footer/banner/exit-popup          │
└─────────────────────────────────────────────────────────────┘
      │  click "GET MY FREE DIAGNOSIS"  (data-track=go_ads_hero_cta)
      ▼
┌─────────────────────────────────────────────────────────────┐
│ /plateau  (src/app/(marketing)/plateau/page.tsx)  [indexed]  │
│  • A SECOND full sales page — near-duplicate pitch:           │
│    hero, Anthony intro, 4 profiles, how-it-works,             │
│    testimonials, what-you-get, social proof, FAQ, final CTA   │
│  • CTAs are anchor links (#start) — scroll, don't auto-start  │
│  • Diagnostic embedded BELOW THE FOLD (Suspense)              │
│  • FULL site chrome now present: CohortBanner, exit popup,    │
│    sticky CTAs, smooth cursor, header, footer                 │
│  • FIRES: diagnostic_start on quiz mount (DiagnosticFlow:153) │
└─────────────────────────────────────────────────────────────┘
      │  scroll to #start, then 18 screens:
      │   age → hours → ftp → goal → Q1…Q12 → Q13 → EMAIL+CONSENT
      │   (DiagnosticFlow.tsx; fires diagnostic_progress per question :284)
      ▼
┌─────────────────────────────────────────────────────────────┐
│ POST /api/diagnostic/submit  (route.ts)                       │
│  • Requires: valid email + consent===true + all 12 answers    │
│    or it returns 400 (parse.ts / route.ts:80-93)              │
│  • Server records diagnostic_complete (:258) + signup (:276)  │
│    — both with source = NULL (see §4 attribution bug)         │
│  • Beehiiv + CRM + Resend confirmation fire in after()        │
└─────────────────────────────────────────────────────────────┘
      │  router.push(/diagnostic/[slug]?fresh=1)
      ▼
┌─────────────────────────────────────────────────────────────┐
│ /diagnostic/[slug]  (the results page) [noindex]              │
│  • FIRES: Google Ads "Plateau Diagnostic Complete" conv (€10) │
│    (ResultsAnalytics.tsx:38)   ◄── THIS IS THE "10 CONVERSIONS"│
│  • FIRES: Meta Pixel "Lead"  (page.tsx:189 / MetaPixel.tsx:32)│
│  • CTA → /coaching (Not Done Yet) → Skool (off-site)          │
└─────────────────────────────────────────────────────────────┘
```

**Clicks/taps from ad to the counted conversion:** ~3 page navigations + ~19 interactions (4 demographic + 12 questions + Q13 + email + consent + submit). The conversion is measured at the **very last possible on-site moment**.

---

## 2. Landing-page review

### `/go/ads` (`src/app/go/ads/page.tsx`) — the paid surface
- **Primary CTA:** "GET MY FREE DIAGNOSIS" → `/plateau?source=ads` (constant `CTA_HREF`, line 31). Repeated 3× (hero :369, mid :615, final :1021). Clear, single, consistent. ✅
- **Above the fold on mobile:** The hero is `min-h-[88vh]` with the CTA after an eyebrow + 3-line headline + a 5-line subhead. On a short phone the button likely sits right at/below the fold. The value-stack, credibility and "built-by" rows all come *after* the CTA, which is correct, but consider tightening the headline/subhead so the button is unambiguously visible without a scroll on a 667px viewport. ⚠️
- **Broken links / dead ends:** None. The page is deliberately zero-escape — the only link is the CTA. ✅
- **Performance:** Excellent by design — pure server-rendered, no framer-motion, no DB, no client hydration except the tiny `AdsLandingAnalytics` effect. This page is not the performance problem. ✅
- **Note:** `AdsLandingAnalytics` (the €1 landing conversion) is the *only* client component on the page, and it exists **only here** — see §3.

### `/go` (`src/app/go/page.tsx`) — the organic/A-B surface
- Same spine as `/go/ads` but with: an A/B headline test (variant A/B via middleware cookie), a `/tools` fallback link, a footer with brand link + privacy/terms, and the `GoExitIntent` toolkit popup.
- CTA → `/plateau?source=go&variant=A|B`.
- **Critically: `/go` does NOT fire the "Ads Landing Page View" conversion.** `AdsLandingAnalytics` is only mounted on `/go/ads`. If any ad final URL points at `/go` (the A/B page) instead of `/go/ads`, that conversion can never fire. See §3.

### `/plateau` (`src/app/(marketing)/plateau/page.tsx`) — where the quiz lives
- This is a **second full-length sales page**, repeating the same arguments the visitor just read on `/go/ads` (FTP stuck, four causes, testimonials, FAQ). For cold ad traffic this is redundant friction — they came to "find out why," and instead get pitched again before the tool appears.
- CTAs are **anchor links to `#start`** (hero :532, mid :834, bottom :1153, sticky :96). They scroll the page; they do not auto-focus or auto-start the quiz. The quiz is rendered below the fold inside a `<Suspense>` (page.tsx:953).
- **Heaviest page in the funnel:** framer-motion `ScrollReveal` on nearly every block, aurora CSS animations, a live Postgres query (`recentSubmissionCount`, page.tsx:366) on each revalidation, Header + Footer, plus the full `ConversionChrome` stack. This is the page to run Lighthouse against, not `/go/ads`.

---

## 3. Conversion tracking setup

**One Google Ads account/tag:** `AW-18123737652`, loaded unconditionally in the root layout (`GoogleAdsTag.tsx`, mounted `layout.tsx:181`). **Not consent-gated** — so cookie-consent is *not* suppressing Google conversions (good for measurement, worth a compliance look for UK/IE/EU under Consent Mode v2 — see §6).

Two conversion actions exist in code:

| Code conversion | `send_to` label | Value | Fires where | File |
|---|---|---|---|---|
| **Ads Landing Page View** | `AW-18123737652/up0JCJqHxKwcELSUicJD` | €1 | `/go/ads` mount | `AdsLandingAnalytics.tsx:15,36` |
| **Plateau Diagnostic Complete** | `AW-18123737652/WDZ_CNiOvKwcELSUicJD` | €10 | `/diagnostic/[slug]` mount | `ResultsAnalytics.tsx:15,38` |

### Mapping to the console "Sign-up" / "Submit lead form" goals

The console shows **"Sign-up" = 10 results** and **"Submit lead form" = Needs attention.** Reconciling with the code:

- **"Sign-up" (10) = "Plateau Diagnostic Complete"** (`WDZ…`). 10 ÷ 737 clicks = 1.4% — exactly the completion rate of an 18-step, email-gated funnel. This is the deep, low-volume conversion and it *is* recording.
- **"Submit lead form" (Needs attention) = "Ads Landing Page View"** (`up0J…`). This should fire on *every* `/go/ads` landing (≈ clicks), so a healthy account would show hundreds here, not "Needs attention." The fact that it's effectively zero means **one of two things**, and you must check which:

  **A. The ad final URL isn't `/go/ads`.** The landing pixel exists *only* on `/go/ads`. `/go/ads` is **orphaned in the codebase** — nothing links to it, the middleware only seeds the A/B cookie on `/go` (`middleware.ts:138`), and the only in-repo reference is a comment (`middleware.ts:47`). If the campaign's Final URL is set to `/go` or straight to `/plateau`, the €1 pixel never mounts → permanent "Needs attention," and the only thing Google ever sees is the 10 deep completions. **This is the leading hypothesis and it would explain the entire data picture.**

  **B. The tag was never verified.** Per `docs/google-ads-recovery-plan.md`, the account was locked out 8+ days awaiting 2FA and "ads have been running with **unverified conversion tracking**." "Needs attention" is exactly the status of an action that has never recorded a verified conversion, even if the pixel is firing client-side.

  → **Action #1: in Google Ads, open the "Cycling Coach" ad/ad-group and read the Final URL, and open Goals → Conversions and read the Tag Status for both actions.** This single check resolves the biggest unknown in the whole audit.

### Why CPA is €86 regardless of A vs B

Smart/automated bidding needs **~30 conversions in 30 days** to optimise. You have **10 across the whole period**, all on the single deepest action. Google literally cannot learn what a good click looks like, so it can't lower CPA. Even if the tag is firing perfectly, the *measurement design* (only count the bottom of the funnel) guarantees a starved algorithm.

---

## 4. Analytics event inventory (every tracking call in the funnel)

### Google Ads (gtag) — `AW-18123737652`
| Event | File:line | Notes |
|---|---|---|
| tag load + `config` | `GoogleAdsTag.tsx:8-23` (mounted `layout.tsx:181`) | unconditional, `afterInteractive` |
| `conversion` — Landing Page View (€1) | `AdsLandingAnalytics.tsx:36` | **only on `/go/ads`** (mounted `go/ads/page.tsx:291`) |
| `conversion` — Diagnostic Complete (€10) | `ResultsAnalytics.tsx:38` | on results page (mounted `diagnostic/[slug]/page.tsx:196`) |

### Meta Pixel — `649389789190949`
| Event | File:line | Notes |
|---|---|---|
| init + `PageView` | `ConsentAwarePixel.tsx:62-63` (mounted `layout.tsx:180`) | **consent-gated** (`lazyOnload`) |
| `Lead` | `MetaPixel.tsx:32` (mounted `diagnostic/[slug]/page.tsx:189`) | only if fbq loaded (i.e. consent given) |

### Internal events via `Tracker.tsx` `sendEvent` → `/api/events` — **CONSENT-GATED** (`Tracker.tsx:54`)
| Event | File:line |
|---|---|
| `pageview` | `Tracker.tsx:193` |
| `cta_click` (delegate on any `[data-track]`) | `Tracker.tsx:217` |
| `scroll_depth` | `Tracker.tsx:171` |
| `time_on_page` (30/60/120/300s + on hide) | `Tracker.tsx:125,136` |
| `signup` (via `trackSignup` helper) | `Tracker.tsx:231` |

### Internal events via `trackAnalyticsEvent` → `/api/events` — **NOT consent-gated** (`lib/analytics/client.ts`)
| Event | File:line | Notes |
|---|---|---|
| `diagnostic_start` | `DiagnosticFlow.tsx:153` | reads `utm_source`/`utm_campaign` → **always empty** (see bug below) |
| `diagnostic_progress` (per question) | `DiagnosticFlow.tsx:284` | |
| `diagnostic_results_view` | `ResultsAnalytics.tsx:56` | |
| `diagnostic_cta_click` (delegate on `[data-cta]`) | `ResultsAnalytics.tsx:71` | results-page CTAs only |
| `go_exit_intent_shown` | `GoExitIntent.tsx:53` | `/go` only |
| `go_exit_intent_dismissed` | `GoExitIntent.tsx:59` | `/go` only |
| `go_exit_intent_submit` | `GoExitIntent.tsx:158` | `/go` only |

### Server-side `recordEvent` (in `after()`, `api/diagnostic/submit/route.ts`)
| Event | File:line | Source value stored |
|---|---|---|
| `diagnostic_complete` | `route.ts:258` | `utm.utmSource ?? undefined` → **NULL** |
| `signup` | `route.ts:276` | `utm.utmSource ?? "plateau-diagnostic"` → **fallback** |

### `data-track` CTAs that emit `cta_click` (via the consent-gated Tracker delegate)
- `/go`: `go_hero_cta` (:453), `go_four_reasons_cta` (:743), `go_final_cta` (:1191), `go_all_testimonials_link` (:942), `go_faq_q{n}` (:1135), `go_tools_fallback` (:1207), `go_footer_site_link` (:1229)
- `/go/ads`: `go_ads_hero_cta` (:369), `go_ads_four_reasons_cta` (:615), `go_ads_final_cta` (:1021), `go_ads_faq_q{n}` (:962)
- `/plateau`: `plateau_diagnostic_hero` (:532), `plateau_diagnostic_mid` (:834), `plateau_diagnostic_bottom` (:1153)

### The attribution bug (confirmed)
The landing pages link to `/plateau?source=ads` (`go/ads/page.tsx:31`) and `/plateau?source=go&variant=…` (`go/page.tsx:41-43`). But `DiagnosticFlow` builds its UTM object from **`utm_source`**, not `source`:

```ts
// DiagnosticFlow.tsx:180-189
source:  searchParams.get("utm_source") ?? undefined,   // ← ?source=ads is ignored
content: searchParams.get("utm_content") ?? searchParams.get("variant") ?? undefined, // ← variant IS read
```

That `utm` object is POSTed and parsed by `parseUtm` (`parse.ts:103`, picks key `"source"`), so `utmSource` ends up **null** for 100% of ad and organic traffic. Downstream, `diagnostic_complete`, `signup`, the CRM `utm_source` custom field (`route.ts:307`), and the Beehiiv segmentation (`route.ts:351`, defaults to `"diagnostic"`) all lose the source. **The `variant` (A/B) *is* preserved; the traffic source is not.** The recovery plan's recommended cross-check ("`/admin/funnel` filtered `source=ads`") returns nothing as a result.

> Note: this is an **internal** attribution blind spot. Google Ads' own conversion attribution uses the `gclid`/`_gcl_aw` cookie set by gtag on the landing page and is independent of this param, so this bug doesn't change Google's count — but it does mean you can't independently verify Google's numbers against your own DB.

### Signals Google never sees
Per `docs/google-ads-recovery-plan.md` and confirmed in code: there is **no Google Ads conversion** for CTA-click-to-start, diagnostic-start, email-capture, or community/Skool-click. Between "landed" and "completed the whole quiz," Google has **zero** intermediate signals. `email_captured` and `community_cta_clicked` are explicitly **not bridged**.

---

## 5. Friction audit

| # | Friction point | Evidence | Impact |
|---|---|---|---|
| F1 | **Two full sales pages back-to-back.** `/go/ads` and `/plateau` repeat the same pitch (FTP stuck, 4 causes, testimonials, FAQ) before the tool appears. | `go/ads/page.tsx` vs `plateau/page.tsx` | High — cold traffic reads the same argument twice; many bounce on page 2. |
| F2 | **Conversion gated behind email + consent at the END.** A bail at the email step = no conversion AND no lead. | `DiagnosticFlow.tsx:752-764`; `route.ts:80-93` | High — the single biggest drop-off point. |
| F3 | **18 screens, not "12 questions."** 4 demographic + 12 + Q13 + email. The promise says "12 questions / 4 minutes." | `DiagnosticFlow.tsx:196` (`totalSteps = 18`) | Medium — perceived length once inside. |
| F4 | **CTA on `/plateau` is an anchor, not a start.** Visitors must scroll to a below-the-fold quiz. | `plateau/page.tsx:529,953` | Medium — adds a step + risk of not finding the tool. |
| F5 | **Full-screen exit popup can fire mid-quiz.** `/plateau` is **not** in the popup's exclusion list, so `ExitIntentPopup` (a `z-[10000]` modal) arms on `/plateau`. Desktop: top-edge mouseleave after 5s. Mobile: **after 45s on page** — well within the 4-minute quiz. The component's own docstring warns this "reads as 'the site is broken'" on interactive-tool pages. | `LazyExitIntent.tsx:20` (excludes only `/apply,/predict,/ask,/tools`); `ExitIntentPopup.tsx:74-80,105` | High — directly interrupts the live quiz; also offers a *newsletter* email capture that siphons the lead into the wrong bucket. |
| F6 | **Clean→cluttered transition.** `/go/ads` is intentionally distraction-free, but `/plateau` reintroduces the `CohortBanner` (top, with a competing apply CTA + countdown), the smooth cursor, and sticky CTAs — every distraction the ad page removed. | `ConversionChrome.tsx:15-30` (only `/go*` is lean, not `/plateau`); `CohortBanner.tsx:20` | Medium. |
| F7 | **Mandatory consent checkbox.** Diagnosis is blocked unless the consent box is ticked (separate from entering the email). | `DiagnosticFlow.tsx:758`; `route.ts:80` | Medium — necessary for GDPR, but it's a second required action at the highest-friction step. |

Things that are **right**, and shouldn't be "fixed":
- `/go/ads` itself is clean, fast, single-CTA. ✅
- The quiz auto-starts at Q1 (no redundant "Start" screen) and saves to `sessionStorage`. ✅
- `StickyMobileCta` on `/plateau` correctly **hides while the quiz is on screen** (`StickyMobileCta.tsx:43-50,66`). ✅
- Email gate is at the end (sunk-cost), not the start. ✅
- `MobileStickyApply` does **not** render on `/plateau` (only `/coaching`, `/community`, `/about`). ✅

---

## 6. Recommended fixes

### Tier 1 — Measurement (do these before spending another euro)
1. **Verify the ad Final URL and tag status in the console.** Resolve hypothesis A vs B from §3. If Final URL ≠ `/go/ads`, either point it there *or* move the `AdsLandingAnalytics` pixel to wherever ads actually land. Use Tag Assistant to confirm both conversions fire end-to-end.
2. **Add an earlier, higher-volume primary conversion.** Counting only "Diagnostic Complete" starves the algorithm. Add a conversion for **diagnostic *start*** (or "reached email step") and/or bridge **`email_captured`** to Google Ads (recovery plan Phase 1 Step 4). Make the higher-volume action the bidding target until you clear 30/30-day.
3. **Fix the source attribution bug.** Either make the landing CTAs emit `utm_source`/`utm_medium`/`utm_campaign` (e.g. `/plateau?utm_source=google&utm_medium=cpc&utm_content=ads`) **or** make `DiagnosticFlow` (`:180`) and `parseUtm` also read the bare `source`/`variant` params. Without this you can't validate Google's numbers against `/admin/funnel`.

### Tier 2 — Funnel length (the real CPA lever)
4. **Collapse the double sales page.** Point ads either straight to `/plateau` (and drop `/go/ads`), or make `/go/ads`'s CTA jump *directly into the quiz* rather than to a second pitch page. One pitch, then the tool.
5. **Start the quiz on the landing page, or auto-scroll into it.** Replace the `#start` anchor with a CTA that scrolls-and-focuses the first question (or embed Q1 directly in the hero).
6. **Reconsider the mandatory email gate for the *conversion*.** Keep email collection, but let Google count an earlier step so bidding has signal even when someone abandons at the email step.

### Tier 3 — Interference & polish
7. **Exclude `/plateau` from the exit-intent popup.** Add `/plateau` to `POPUP_EXCLUDED_PATHS` in `LazyExitIntent.tsx:20`. A full-screen newsletter modal must never fire over a live quiz (this is the same rule the file already applies to `/apply`, `/ask`, `/tools`).
8. **Suppress `CohortBanner` (and ideally smooth cursor) on `/plateau`.** Keep the diagnostic surface as clean as the ad page that fed it.
9. **Run Lighthouse mobile on `/plateau`** (not `/go/ads`). It carries the framer-motion, aurora, live DB query and full chrome. If LCP/TBT are poor on 4G, that's compounding the drop between landing and start.
10. **Compliance:** consider Google Consent Mode v2 for UK/IE/EU traffic — the gtag currently fires regardless of consent, which records conversions but may be non-compliant.

---

## 7. Priority order

| Priority | Fix | Why first |
|---|---|---|
| **P0** | #1 Verify Final URL + tag status | Everything else is guesswork until you know whether ads even hit the pixel-bearing page. |
| **P0** | #2 Add earlier/primary conversion | Unblocks automated bidding; the direct cause of an unoptimisable €86 CPA. |
| **P1** | #3 Fix `source` → `utm_source` bug | Restores your ability to independently measure the funnel. |
| **P1** | #7 Exclude `/plateau` from exit popup | Quick, high-impact: stops a modal interrupting the live quiz. |
| **P1** | #4 Collapse the double sales page | Biggest structural lever on completion rate. |
| **P2** | #5 Start quiz on landing / auto-scroll | Removes a navigation + "find the tool" step. |
| **P2** | #8 Strip CohortBanner/cursor on `/plateau` | Restores the clean single-CTA intent through to the tool. |
| **P2** | #6 Earlier conversion definition | Reduces dependence on the email gate for *measurement*. |
| **P3** | #9 Lighthouse `/plateau` | Confirm/deny a mobile-speed contribution. |
| **P3** | #10 Consent Mode v2 | Compliance hygiene for the primary geo targets. |

---

## Appendix — files reviewed

- `src/app/go/page.tsx`, `src/app/go/ads/page.tsx`, `src/app/go/layout.tsx`, `src/app/go/ads/layout.tsx`
- `src/app/go/ads/AdsLandingAnalytics.tsx`, `src/app/go/_components/GoExitIntent.tsx`
- `src/app/(marketing)/plateau/page.tsx`, `src/app/(marketing)/plateau/_components/StickyMobileCta.tsx`
- `src/components/features/diagnostic/DiagnosticFlow.tsx`, `ResultsAnalytics.tsx`, `MetaPixel.tsx`
- `src/app/(marketing)/diagnostic/[slug]/page.tsx`
- `src/app/api/diagnostic/submit/route.ts`, `src/lib/diagnostic/parse.ts`
- `src/components/analytics/GoogleAdsTag.tsx`, `ConsentAwarePixel.tsx`, `Tracker.tsx`
- `src/lib/analytics/client.ts`, `src/lib/analytics/ga4.ts`
- `src/components/layout/ConversionChrome.tsx`, `src/app/layout.tsx`, `src/middleware.ts`
- `src/components/features/conversion/LazyExitIntent.tsx`, `ExitIntentPopup.tsx`, `MobileStickyApply.tsx`, `CohortBanner.tsx`
- `docs/google-ads-recovery-plan.md` (existing context)
