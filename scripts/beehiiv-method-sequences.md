# Beehiiv Email Sequences — The Roadman Method

Three automations that wrap the Method funnel: **activation** after purchase,
**ascension** into Not Done Yet on graduation, and **recovery** of abandoned
checkouts. Build these as Beehiiv Automations; this doc is the source copy +
trigger logic. From: **Anthony Walsh <anthony@roadmancycling.com>**.

## Triggers & data the app already emits

| Signal | Where it's set | Use |
|---|---|---|
| Tag `method-paid` + `method_status=active`, `method_paid_at` | Stripe webhook on purchase (`src/lib/stripe/method-dispatch.ts`) | Start the **Activation** sequence |
| Tag `method-graduate` + `method_status=graduated`, `method_graduated_at` | On 12/12 completion (`src/app/api/method/progress/route.ts`) | Start the **Ascension** sequence |
| Pending enrolment, no `method-paid` after ~1h | `method_enrollments.status='pending'` (no Beehiiv tag yet) | **Abandoned checkout** — see note below |

> The welcome email with the magic-link **login** link is transactional and is
> sent immediately by the webhook (`sendMethodWelcomeEmail`) — it is NOT part of
> these marketing sequences. The Activation sequence assumes the rider already
> has their login link.

> **Abandoned-checkout note:** pending enrolments aren't pushed to Beehiiv today
> (only paid ones are). To enable sequence 3, either (a) add a Beehiiv subscribe
> with tag `method-checkout-started` in `/api/method/checkout`, or (b) run a
> daily job over `method_enrollments` where `status='pending'` and `created_at`
> is 1–48h old. Flagged as a follow-up; copy is ready below.

---

## Sequence 1 — Activation (trigger: tag `method-paid`)

**Goal:** login → build rider profile → start Module 01 → keep the rhythm →
plant the Not Done Yet seed. 6 emails over ~16 days. Exit on tag `method-graduate`.

### Email 1 — Day 0: You're in (orientation)
**Subject A:** You're in — here's exactly how to start
**Subject B:** The Method is yours. First move inside.
**Preview:** Two clicks to set up, then Module 01.

Hey {{first_name | default:"there"}},

You're in — The Roadman Method is yours for life.

Two things get you set up in five minutes:

1. **Log in.** Use the sign-in link we just emailed you (separate email, subject "You're in"). It sets your access — no password to remember.
2. **Build your rider profile.** Three minutes on your goal, hours and history. It tunes how you run the twelve weeks, and on Premium it shapes the plan we build around your Week-1 audit.

Then open **Module 01 — The Honest Baseline**. Don't race it. Everything that follows is built on what you map this week.

**CTA:** Build my rider profile → `/method/onboarding`

### Email 2 — Day 1: How to actually get through it
**Subject A:** The riders who finish all 12 do this one thing
**Preview:** Rhythm beats intensity. Here's the rhythm.

Short one. The single biggest predictor of who finishes the Method isn't fitness or free time — it's **rhythm**. One module a week, the checklist ticked off across the days, the protocol actually run on the bike.

Your dashboard tracks the streak for you. Tick the week checklist as you go — it now saves to your account, so it follows you across devices.

**CTA:** Open my dashboard → `/method/dashboard`

### Email 3 — Day 4: Pillar deep-dive (Coaching / polarisation)
**Subject A:** Why your "easy" rides are probably too hard
**Preview:** The Seiler 80/20 thing, properly explained.

[Short teaching email on intensity distribution — the Module 01–03 throughline. Establishes that the Method is real coaching, not a PDF. Reference Prof. Stephen Seiler.]

**CTA:** Jump to the Coaching modules → `/method/dashboard`

### Email 4 — Day 8: Fuel the work (nudge the Fuel Planner)
**Subject A:** You're probably training under-fuelled
**Preview:** Open the Fuel Planner — it does the maths for you.

[Teaching email on Fuel For The Work Required; drive them into the Fuel Planner, which now persists across devices.]

**CTA:** Open the Fuel Planner → `/method/fuel-planner`

### Email 5 — Day 12: Midpoint check-in
**Subject A:** Halfway. How's it landing?
**Preview:** Reply and tell me — I read every one.

[Encouragement + reply prompt for deliverability + soft proof: real member results.]

**CTA:** Reply with where you're at (mailto)

### Email 6 — Day 16: What comes after the Method
**Subject A:** The Method ends. The work doesn't.
**Preview:** Where graduates go next — no rush.

[Plant the NDY seed gently: the Method is the system; Not Done Yet is where riders keep it sharp with weekly eyes on their training. Honest, low-pressure — they haven't finished yet.]

**CTA:** See what's next → `/community/not-done-yet?from=method-activation`

---

## Sequence 2 — Ascension (trigger: tag `method-graduate`)

**Goal:** convert graduates — the highest-intent prospects on the site — into a
Not Done Yet trial. 4 emails over ~10 days. Exit on NDY signup.

### Email 1 — Day 0: Congratulations (and the honest pitch)
**Subject A:** You finished the Method. Here's the honest next step.
**Preview:** You've done the hard part — keep the momentum.

[Celebrate 12/12. Frame NDY as ascension, not a second purchase: "you've learned the system; Not Done Yet is weekly eyes on you running it." Mention the 7-day free trial.]

**CTA:** Start my Not Done Yet trial → `/community/not-done-yet?from=method-grad`

### Email 2 — Day 3: What changes with a coach in the room
**Subject A:** The difference between knowing the system and running it
**Preview:** What NDY adds on top of the Method.

[Concrete: weekly live calls, plan updates as your week changes, the 5 pillars maintained, a cohort. Real member proof.]

**CTA:** See everything in Not Done Yet → `/community/not-done-yet?from=method-grad`

### Email 3 — Day 6: For the event chasers (Inner Circle)
**Subject A:** Got a date on the calendar?
**Preview:** When 1:1 makes sense instead.

[Branch: if they're chasing a specific time-bound event, point to Inner Circle / 1:1. Keeps the highest-value graduates from under-buying.]

**CTA:** Look at 1:1 / Inner Circle → `/inner-circle`

### Email 4 — Day 10: Last nudge + door stays open
**Subject A:** No pressure — the framework's yours either way
**Preview:** Re-run the Method any season. Or keep climbing.

[Reassure: they can re-run the Method for free forever. Final, soft trial CTA.]

**CTA:** Try Not Done Yet free for 7 days → `/community/not-done-yet?from=method-grad`

---

## Sequence 3 — Abandoned checkout (trigger: `method-checkout-started`, no `method-paid`)

**Goal:** recover the sale. 3 emails over ~3 days. Hard-exit the moment
`method-paid` lands. (Requires the checkout-started signal — see note above.)

### Email 1 — 1 hour: You left something
**Subject A:** You were one step from The Method
**Preview:** Your spot's still here — pick it back up.

[Friendly, no guilt. One-line restate of what's inside + the 30-day refund. Direct link back to checkout.]

**CTA:** Finish enrolling → `/method/checkout`

### Email 2 — Day 1: Handle the real objection
**Subject A:** "Is this just another training plan?"
**Preview:** No. Here's the difference.

[Address the top objection: it's the distilled framework from 1,400+ expert conversations, not a generic plan. Restate the guarantee.]

**CTA:** Read what's inside → `/method`

### Email 3 — Day 3: Last call + the self-paced fit
**Subject A:** Still on the fence? Read this.
**Preview:** Why self-paced beats another subscription for most.

[Position the Method vs ongoing coaching for the self-directed rider; reinforce one-payment / lifetime / guarantee.]

**CTA:** Enrol now → `/method/checkout`

---

## Measurement

- Tag opens/clicks per sequence; primary conversion events:
  - Activation → `method-graduate` rate (course completion)
  - Ascension → NDY trial starts attributed `from=method-grad`
  - Abandoned → `method-paid` within 72h of `method-checkout-started`
- Keep subject-line A/B on emails 1 of each sequence. Suppress the marketing
  sequences for anyone already tagged the next rung up.
