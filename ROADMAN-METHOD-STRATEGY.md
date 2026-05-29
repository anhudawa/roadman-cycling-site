# The Roadman Method — Strategy & Build Plan

**Owner:** Anthony Walsh
**Author:** Strategy/engineering working doc
**Date:** 2026-05-29
**Status:** Execution-ready. P0 items are revenue-affecting and should ship this sprint.

---

## 1. Executive Summary

The Roadman Method is a genuinely strong product — a self-paced 12-week course built on 1,400+ podcast conversations with World Tour coaches and sport scientists, with 12 video-ready modules, written companions, ~50 downloadable PDFs, an entry/exit assessment system, a phased dashboard, and a fuel planner. The content and the platform are world-class-adjacent. **The problem is not the product. The problem is that the product is orphaned, the checkout is mischarging customers, and the upsell to Not Done Yet (NDY) is a dead end.**

Three concrete failures are losing money right now:

1. **The Method is invisible in the funnel.** It is not in the site navigation (`NAV_ITEMS` in `src/types/index.ts` has no `/method` entry anywhere — not top-level, not in the Coaching dropdown). It is not a rung on the homepage offer ladder (`src/app/page.tsx`, "FOUR STEPS. ONE DIRECTION." — ladder goes Free → Plateau Diagnostic → NDY $195/mo → Inner Circle $525/mo, skipping the Method entirely). The Plateau Diagnostic and Find Your Fit quiz never route anyone to it.

2. **The checkout is broken in two revenue-critical ways.**
   - **Tier is ignored.** The sales page offers Standard ($297) and Premium ($397) and links to `/method/checkout?tier=premium|standard` (`sales/Pricing.tsx`). The checkout page reads the tier param, but `CheckoutForm.tsx` and `/api/method/checkout/route.ts` both ignore it and **always charge `DEFAULT_PRICE_CENTS = 29700` ($297)**. Premium buyers are undercharged $100 and silently downgraded — the `method_enrollments.tier` column exists (`schema.ts`, defaults to `'standard'`) but is never set.
   - **The webhook is not wired in.** `src/lib/stripe/method-dispatch.ts` contains the fulfillment handler (`handleMethodCourseCheckoutCompleted`) but its own header comment says it must be branched into `handleCheckoutCompleted` in `src/lib/stripe/dispatch.ts` "on merge into main." **That branch does not exist** — `dispatch.ts` handles `paid_report`, `spotlight`, `camp_booking`, and a legacy fallback, but has no `metadata.type === "method_course"` case. So a paying customer may never get flipped to `active`, never get the magic-link welcome email, and never get access. This is a P0 customer-trust and chargeback risk.

3. **The Method→NDY upsell is a dead end.** Module 12 ("Not Done Yet") tells graduates "the link is in your account page" — but `/method/account` has no NDY link. The dashboard graduation banner (`12/12 GRADUATED`) has no NDY CTA at all. The Premium tier promises "Priority access to a Not Done Yet community trial" (`sales/Pricing.tsx`) with zero fulfillment. The course is literally named to set up the ascension and then drops the handoff.

**The opportunity.** The Method is the missing middle of the ladder — a $297/$397 product sitting between a free diagnostic and a $195/mo membership. Wired correctly, it (a) monetises the large pool of riders who want a system but aren't ready for monthly coaching, (b) becomes the highest-intent feeder into NDY (a graduate who finished 12 weeks of self-coaching is the warmest NDY lead on the site), and (c) gives the brand a true offer ladder instead of a barbell. Fixing the wiring and the checkout is mostly connection work on assets that already exist.

---

## 2. The Offer Ladder

Each rung exists today **except the Tripwire**. The job is to connect them and add the one missing mid-rung so price/commitment steps are smooth, not a cliff.

| Rung | Offer | Price | Commitment | Primary job | Feeds → |
|---|---|---|---|---|---|
| 0 | Podcast, Saturday Spin newsletter, 10 free tools, Ask Roadman | Free | None | Attention + email capture | Diagnostic |
| 1 | **Plateau Diagnostic** (lead magnet) | Free | 4 min | Diagnose the limiter, capture email, segment | Tripwire / Method |
| 2 | **NEW — Tripwire mini-product** | $19–37 | ~1 hour | Convert diagnostic takers into buyers; prove value + build buyer habit | Method |
| 3 | **The Roadman Method** (12-week course) | $297 / $397 | 12 weeks self-paced | Deliver a complete self-coaching system; create graduates | NDY |
| 4 | **Not Done Yet** (coaching community) | $195/mo | Ongoing | Accountability, live calls, updated plans | Inner Circle |
| 5 | **Inner Circle / 1:1** | $525/mo / by application | Ongoing | High-touch, event-specific | — |

**Why the Tripwire is non-negotiable.** Today the ladder jumps from $0 (diagnostic) to $195/mo (NDY) — an enormous trust and price gap. The Method ($297 one-time) partially bridges it, but a $19–37 tripwire creates the *buyer relationship* cheaply and warms people for the $297 purchase. Classic direct-response logic: the hardest conversion is $0 → first dollar, not $37 → $297.

**Tripwire candidates (all derivable from assets that already exist):**
- "The Honest Baseline" — the Module 01 audit workbook + a 20-min video walkthrough (entry assessment PDFs already shipped in `public/method/resources/01-*`).
- "The Polarised Week" — a single 6/8/10/12-hour training-week template + explainer (architecture PDFs already exist: `02-architecture-6hr…12hr.pdf`).
- "Fuel For The Work Required" — a mini fuelling protocol (the fuel-planner methodology is already built at `/method/fuel-planner`).

The tripwire's only job is to feed Rung 3. Its thank-you page and follow-up emails pitch the Method with a "credit your $37 toward the Method" ascension hook.

**The ascension spine:** Free content earns the email → Diagnostic names the problem → Tripwire makes them a buyer → Method makes them a graduate → NDY keeps the graduate. Every rung's success metric is *click-through to the next rung*, not just its own conversion.

---

## 3. Competitive Positioning

Benchmarks and the specific lessons to copy:

| Competitor | Model | What they do well | Lesson for Roadman |
|---|---|---|---|
| **Road Cycling Academy — "Uplevel"** | ~$500 course | Video lessons + structured plans + **onboarding call** + community + **30-day money-back guarantee** | These are *table stakes* at this price. The Method already promises the guarantee (good) but lacks an included onboarding call and ships video as placeholders. Match the package. |
| **FasCat** | Plans → coaching ladder | **Best-in-class upsell ladder**; a single shared training framework (FasCat methodology) reused across every tier so each purchase makes the next feel native | Roadman already has a shared framework (the Five Pillars). Use the *same language and assets* across Method and NDY so the Method graduate sees NDY as "more of the system I already know," not a new product. |
| **TrainerRoad / Wahoo SYSTM / Zwift** | App subscriptions, $18–22/mo | Frictionless delivery, automatic plan adjustment, workouts pushed to device | The Method's "you'll be your own coach / understand *why*" positioning is the deliberate antidote to "the app rides for you." Lean into it — but still match their *delivery* (plans land in TrainingPeaks/the app, not a dead link). |
| **Dylan Johnson / Empirical Cycling** | Creator → plans → coaching | Authority-first; audience trusts the creator before any product exists; products feel like an extension of the free content | This is exactly Roadman's shape (100M+ downloads → Method → NDY). The creator trust is already earned; the products just need to be *connected* to the content engine. |

**Net positioning statement:** *The Roadman Method is the course that makes you your own coach — built on the same World Tour conversations behind the podcast, delivered with app-grade polish (video + TrainingPeaks), and backed by a no-questions guarantee — and the on-ramp to the Not Done Yet coaching community when you want people in the trenches with you.*

---

## 4. World-Class Gaps to Close

### Table stakes the Method currently lacks
| Gap | Current state | What world-class looks like |
|---|---|---|
| **Video lessons** | `VideoEmbed` + `METHOD_WELCOME_VIDEO_YT_ID` exist but are placeholders; modules describe video minutes that aren't produced | 12 produced lessons (12–15 min), professionally shot, captioned |
| **TrainingPeaks / Strava delivery** | Module TP links point to `/method/training-peaks/<slug>` (e.g. `polarised-base`, `build-block`) — **routes that do not exist** (`src/lib/method/modules.ts`); `TrainingPeaksCallout.tsx` renders dead `href`s | Real TP plan handoff (library plans for Standard, personalised for Premium), Strava optional |
| **30-day money-back guarantee** | **Already present** in copy (`checkout/page.tsx`, `Pricing.tsx`) | Keep; make sure refund ops actually honour it |
| **Included onboarding call** | None | Add a short onboarding call (live or Loom-style async) — at minimum for Premium; competitors include it at this price |
| **Server-persisted progress** | Onboarding selections only `console.log` in `/api/method/onboarding/route.ts` ("No DB write yet"); module progress is persisted, but plan/onboarding choice and tier are not reliably stored | Persist onboarding answers + assigned plan + tier server-side; the `method_onboarding` table referenced in code comments does not exist yet |

### Differentiators to actively pursue
- **Whole-athlete content.** The Five Pillars (Coaching, Nutrition, S&C, Recovery, Le Métier) already cover ground the apps ignore — masters S&C, recovery-as-training, the mental game. This is the moat. Market it harder.
- **Accountability / cohort mechanics on Skool.** The Method is currently solo. Adding light cohort mechanics (start dates, a thread per module, weekly check-in prompts) on the existing Skool community lifts completion — and completion is what produces NDY-ready graduates.
- **Smart plan adjustment.** Premium already promises a "Week 6 data-backed adjustment." Productise it: a structured mid-course review (the `06-mid-course-check.pdf` asset exists) that visibly re-tunes the plan. This is the felt difference vs. a static PDF.

---

## 5. Funnel Wiring Fixes (connect the orphan)

All four of these are connection work, not new product:

1. **Navigation** — Add the Method to `NAV_ITEMS` (`src/types/index.ts`). It belongs in the **Coaching** dropdown (between "Find Your Fit" and "Not Done Yet Coaching") and arguably as a "Train" surface. Without this the product has no organic discovery path.

2. **Homepage offer ladder** — Insert the Method as a rung in the "FOUR STEPS" ladder in `src/app/page.tsx`. The ladder currently jumps free → $195/mo. Add Method as the "$297 · self-paced system" rung between Plateau Diagnostic and Not Done Yet. (Re-label to FIVE steps, or split into a "DIY vs. coached" fork.)

3. **Plateau Diagnostic results routing** — `src/lib/diagnostics/definitions/plateau.ts` routes all four profiles (Under-recovered, No-man's-land, Strength Gap, Fuelling Deficit) to `/ask`, blog posts, and `/apply` (NDY). Each profile maps cleanly to a Method pillar (recovery, coaching/architecture, S&C, nutrition). Add a Method CTA to the results — ideally profile-aware ("Your limiter is recovery → Module 05 of the Method addresses exactly this"). This is the single highest-intent traffic source on the site and it currently never sees the Method.

4. **Find Your Fit quiz** — `find-your-fit/_components/FitFinder.tsx` scores only across clubhouse / NDY / Inner Circle / 1:1. The "self-directed structure, $100-ish budget" rider has no home and gets mis-routed. Add the Method as a fifth result tier for the "structured + self-directed + under-$100/mo or one-time" answer cluster.

---

## 6. The Method → NDY Upsell

The course is *named* "Not Done Yet" at Module 12 specifically to tee up the ascension. Right now the handoff is broken at every touchpoint. Fix all five:

1. **Fix the dead-end graduation CTA.** The `GraduationBanner` in `dashboard/page.tsx` (the `12/12 GRADUATED` block) has no next step. Add a primary NDY CTA: "You ran the system solo for 12 weeks. Not Done Yet is where you keep sharpening it — with people who've done the same course." Route to a graduate-specific NDY page/offer (see #4).

2. **Fulfil the Premium "NDY trial" promise.** Premium buyers are sold "Priority access to a Not Done Yet community trial" (`sales/Pricing.tsx`) that is never delivered. Either (a) build a real trial (a Skool invite + a defined trial window) and trigger it from the webhook on a Premium purchase, or (b) remove the promise. Selling an undelivered benefit is a refund/trust liability. Recommended: build it — a Premium buyer is your best NDY prospect.

3. **Seed NDY across the member surfaces.**
   - **Welcome** (`/method/welcome`): a soft "where this goes next" mention, not a hard sell on day one.
   - **Account** (`/method/account`): add the NDY link Module 12 explicitly promises is there. Currently absent.
   - **Dashboard** (`/method/dashboard`): a persistent, low-key NDY tile (alongside the existing Fuel Planner tile) that intensifies as completion climbs.

4. **Run graduates through a tailored fit flow.** Don't dump grads onto the generic `/apply`. Send them through a Method-aware version of the NDY fit flow (reuse `FitFlow.tsx` / `/community/not-done-yet/fit`) that knows they're a graduate and pre-fills context (their plan, their exit-assessment trajectory).

5. **Ascension incentive.** Offer Method graduates a concrete reason to move now: e.g. "first month of NDY at a graduate rate" or "your Method exit-assessment review counts as your NDY onboarding." Tie it to the emotional beat Module 12 already builds ("the course has finished, the riding hasn't").

---

## 7. Revenue / Fulfillment Fixes

These are the P0 engineering fixes. Order matters — #1 and #2 are actively losing money or breaking purchases.

1. **Wire the webhook (CRITICAL).** Add the missing branch to `handleCheckoutCompleted` in `src/lib/stripe/dispatch.ts`:
   ```ts
   if (metadata.type === "method_course") {
     const { handleMethodCourseCheckoutCompleted } = await import("./method-dispatch");
     await handleMethodCourseCheckoutCompleted(session, eventId);
     return;
   }
   ```
   Until this lands, paid enrollments may never flip to `active` and welcome/magic-link emails may never send. Verify against a real Stripe test event end-to-end.

2. **Fix the two-tier checkout (CRITICAL).** Today every buyer is charged $297 regardless of tier.
   - `CheckoutForm.tsx` must accept and pass the `tier` (it's already in the URL via `?tier=`; the checkout page reads it but the form doesn't forward it).
   - `/api/method/checkout/route.ts` must select the price by tier: a `STRIPE_METHOD_PRICE_ID_STANDARD` / `STRIPE_METHOD_PRICE_ID_PREMIUM` pair (preferred — editable in Stripe dashboard) or tier-specific `price_data` ($297 / $397). Put `tier` into the Stripe session `metadata`.
   - The webhook (`method-dispatch.ts`) must read `metadata.tier` and write it to `method_enrollments.tier` (the column already exists in `schema.ts`). Stop inferring tier from `amountCents` heuristics (the `>= $350` guess in `account/page.tsx`) once tier is stored authoritatively.
   - Premium fulfillment must actually differ: personalised TP plan, Week-6 adjustment, end-of-course data review, NDY trial. Gate these on the stored tier.

3. **Persist onboarding.** Replace the `console.log` in `/api/method/onboarding/route.ts` with a real write (the `method_onboarding` table the comments reference doesn't exist — create it). The CRM `recordAssignment` call is good but the rider's own answers/assigned plan should be queryable, not log-scraped.

4. **Build or replace the dead TrainingPeaks links.** Module resources link to `/method/training-peaks/<slug>` routes that don't exist (`src/lib/method/modules.ts`; rendered by `TrainingPeaksCallout.tsx`). Either build those routes (a handoff page per plan block) or repoint to real TrainingPeaks plan URLs. Every Premium buyer hits these. Standard buyers are promised "a TrainingPeaks plan for every block" too — decide the Standard-vs-Premium TP difference and make both real.

---

## 8. Launch Plan

**The "Plateau-Breaker Challenge" — a free gamified cohort launch (Zwift Academy model).**

- **Mechanic:** A free, time-boxed challenge (e.g. 7–14 days) run as a cohort on the existing **Skool** community. Daily prompts, a leaderboard/streak, a few of the Method's lightest assets given free (the Honest Baseline audit, the polarised-week template). It is a *taste* of the Method's structure and the cohort feel.
- **Why:** It converts diagnostic/newsletter audiences into an engaged cohort, manufactures social proof and testimonials (which the Method badly needs — see Open Decisions), and creates a natural, dated "doors open" moment to sell the Method at the end. The Zwift Academy model proves free gamified challenges drive paid conversion at scale.
- **Email nurture:** Two sequences. (a) **Challenge → Method**: daily challenge emails ending in a Method pitch with a cohort-close deadline. (b) **Method → NDY**: a graduation sequence triggered at 12/12 completion (or week 12 of the drip) that runs the ascension offer. Both should be drafted now; the drip on/off decision is in Open Decisions.
- **Guarantee:** Keep the 30-day no-questions refund front and centre in launch copy — it's already written and it directly answers the "is this just another influencer course" objection.

---

## 9. Prioritized Roadmap

### P0 — This sprint (revenue, funnel-connection, upsell)
- [ ] Wire `method_course` branch into `dispatch.ts` (fulfillment is currently disconnected). **(§7.1)**
- [ ] Fix two-tier checkout: pass tier through form → API → Stripe → webhook → `tier` column; charge $397 for Premium. **(§7.2)**
- [ ] Gate Premium deliverables on stored tier; stop the `amountCents` heuristic. **(§7.2)**
- [ ] Add the Method to `NAV_ITEMS` and the homepage offer ladder. **(§5.1, §5.2)**
- [ ] Add Method CTAs to Plateau Diagnostic results (profile-aware) and Find Your Fit. **(§5.3, §5.4)**
- [ ] Fix the graduation dead-end: NDY CTA on dashboard banner + the promised account-page NDY link. **(§6.1, §6.3)**
- [ ] Decide + ship the Premium "NDY trial" (build it or remove the promise). **(§6.2)**

### P1 — Landing pages, tripwire, proof
- [ ] Build/refresh the Method sales landing page as a first-class funnel destination.
- [ ] Build the Tripwire mini-product ($19–37) + Stripe price + thank-you-page ascension to the Method. **(§2)**
- [ ] Collect and place real testimonials/proof (current member quotes appear placeholder). **(§10)**
- [ ] Method-aware NDY fit flow for graduates + ascension incentive. **(§6.4, §6.5)**

### P2 — World-class delivery
- [ ] Produce the 12 video lessons + welcome video. **(§4)**
- [ ] Build real TrainingPeaks delivery; kill the dead `/method/training-peaks/*` links. **(§7.4)**
- [ ] Persist onboarding server-side (`method_onboarding` table). **(§7.3)**
- [ ] Add included onboarding call (start with Premium).

### P3 — Cohort + membership growth
- [ ] Run the Plateau-Breaker Challenge cohort launch on Skool. **(§8)**
- [ ] Add cohort mechanics to the Method (start dates, per-module threads, check-ins).
- [ ] Build the Method→NDY graduation email sequence and the challenge→Method sequence.

---

## 10. Open Decisions for Anthony

1. **Video production.** The Method is sold as a video course but the lessons aren't produced (placeholders only). Are we shooting 12 lessons now, or do we relaunch as "written + worksheets, video coming" and update copy to match? This affects P0 copy honesty and the guarantee exposure.
2. **Testimonials / proof.** The member quotes (James/Mark/Sarah) and the result stats read as illustrative/placeholder. We need real, attributable graduate results before scaling paid traffic. Who can we get on record, and can the Challenge cohort manufacture them?
3. **Stripe price setup.** Confirm we want two real Stripe Price objects (Standard $297 / Premium $397) so pricing is dashboard-editable, plus a third for the Tripwire. Do you want a graduate ascension discount as a Stripe coupon?
4. **Email drip on/off.** The Method drips content over 12 weeks (`dripStartAt`). Keep the enforced drip, or give lifetime/all-at-once access and let riders self-pace? This changes the welcome copy, the dashboard "next module" logic, and the graduation trigger timing.
5. **TrainingPeaks integration approach.** Three options: (a) manual — ops assigns library plans (the onboarding flow already records the plan code for this); (b) static handoff pages we build at `/method/training-peaks/*`; (c) full TrainingPeaks partner API (the onboarding route has a `// once the TrainingPeaks partner API lands` hook). Which do we commit to, and is Standard's TP plan a shared library plan vs. Premium's personalised one?
6. **Premium "NDY trial" mechanics.** If we build it: what's the trial length, does it require a card, and does it auto-roll into $195/mo or stay opt-in? This defines the §6.2 build.

---

### Appendix — Key file references

| Concern | File |
|---|---|
| Checkout form (ignores tier) | `src/app/(method)/method/_components/CheckoutForm.tsx` |
| Checkout API (always $297) | `src/app/api/method/checkout/route.ts` |
| Checkout page (reads tier, unused downstream) | `src/app/(method)/method/checkout/page.tsx` |
| Tier pricing + copy | `src/app/(method)/method/_components/sales/Pricing.tsx`, `.../sales/data.ts` |
| Webhook handler (not wired in) | `src/lib/stripe/method-dispatch.ts` |
| Dispatcher (missing method branch) | `src/lib/stripe/dispatch.ts` |
| Enrollment schema (tier column exists) | `src/lib/method/schema.ts` |
| Account page (tier inferred from amount) | `src/app/(method)/method/account/page.tsx` |
| Dashboard graduation dead-end | `src/app/(method)/method/dashboard/page.tsx` |
| Onboarding (console.log only) | `src/app/api/method/onboarding/route.ts`, `src/app/(method)/method/onboarding/` |
| Module 12 "link in your account page" | `content/method/protocols/12-not-done-yet.mdx` |
| Dead TrainingPeaks links | `src/lib/method/modules.ts`, `.../_components/TrainingPeaksCallout.tsx` |
| Navigation (no Method entry) | `src/types/index.ts` (`NAV_ITEMS`) |
| Homepage offer ladder (no Method rung) | `src/app/page.tsx` |
| Plateau Diagnostic routing (no Method CTA) | `src/lib/diagnostics/definitions/plateau.ts` |
| Find Your Fit quiz (no Method tier) | `src/app/(marketing)/find-your-fit/_components/FitFinder.tsx` |
| NDY fit flow (reuse for grads) | `src/components/features/ndy/FitFlow.tsx`, `src/app/(community)/community/not-done-yet/fit/` |
