# Full-Funnel Intelligence Dashboard

**Date:** 2026-04-08  
**Scope:** Transform the admin dashboard from a monitoring tool into a decision engine by adding full-funnel cohort tracking, content ROI scoring, and churn risk detection.  
**Deferred to Phase 2:** Revenue intelligence (LTV by channel, sponsor fill rate), enhanced AI weekly brief with persistent history.

---

## Problem Statement

Roadman Cycling has a massive audience (60k+ newsletter subscribers, 100M+ podcast downloads) but only converts a fraction into paying community members at $195/month. The current dashboard monitors individual metrics (traffic, signups, revenue) but cannot answer the questions that drive growth:

- Which content actually converts listeners/readers into paying members?
- Where in the funnel are we losing people?
- Which subscribers are about to churn before they cancel?
- Are subscribers from podcast different in value from those via referral?

Each platform (Beehiiv, Skool, the website) has its own analytics, but nobody stitches them together. The COO has to manually cross-reference tabs to answer basic questions.

## Business Context

- **MRR:** ~€20k, target €100k (5x growth needed)
- **Pricing:** $195/month with 7-day free trial
- **Funnel:** Site visitor → email signup → free Skool group → paid NDY Collective
- **Team using this:** Ted (COO), Anthony (content decisions), Sarah (community ops)
- **Existing data sources:** Website events (Postgres), Beehiiv API, Stripe API, Skool webhooks

---

## Feature 1: Full-Funnel Cohort Tracking

### What it does

A new "Funnel" admin page that shows the end-to-end journey: **Site Visit → Email Signup → Free Skool → Trial Start → Paid Member**, with conversion rates between each step, broken down by acquisition source and time period.

### Data model

Add a `subscribers` table that unifies identity across platforms:

```
subscribers
  id              serial PK
  email           text NOT NULL UNIQUE
  source          text           -- 'organic', 'podcast', 'referral', 'paid', 'social'
  sourcePage      text           -- which page they signed up from
  signedUpAt      timestamp      -- email signup date (from events table)
  skoolJoinedAt   timestamp      -- when they joined free Skool (from webhook)
  trialStartedAt  timestamp      -- when they started NDY trial (from webhook/Stripe)
  paidAt          timestamp      -- first paid charge (from Stripe)
  churnedAt       timestamp      -- when they cancelled (from Stripe)
  beehiivId       text           -- Beehiiv subscriber ID for API lookups
  stripeCustomerId text          -- Stripe customer ID
  persona         text           -- 'plateau' | 'comeback' | 'event-prep' | 'listener'
  meta            jsonb          -- flexible metadata
```

### How data flows in

1. **Email signup** → `/api/events` records a `signup` event with email + source page → upsert into `subscribers` with `signedUpAt` and `sourcePage`
2. **Skool join** → `/api/skool-webhook` already fires on `member.joined` → extend to also upsert `subscribers.skoolJoinedAt`
3. **Trial start** → Stripe `customer.subscription.created` webhook (or existing sync) → upsert `subscribers.trialStartedAt`
4. **Paid conversion** → Stripe `invoice.paid` (first non-trial invoice) → upsert `subscribers.paidAt`
5. **Churn** → Stripe `customer.subscription.deleted` → upsert `subscribers.churnedAt`

### Funnel page UI

The page shows:

**Funnel visualization** (reuse existing `FunnelDisplay` component):
- Step 1: Email Signups (count in period)
- Step 2: Skool Joins (count with conversion %)
- Step 3: Trial Starts (count with conversion %)
- Step 4: Paid Members (count with conversion %)
- Step 5: Active after 30d (count with retention %)

**Cohort table** — rows = signup week, columns = stage reached:
| Cohort (week) | Signups | → Skool | → Trial | → Paid | → 30d Active |
|---|---|---|---|---|---|
| Mar 31 - Apr 6 | 142 | 23 (16%) | 8 (35%) | 5 (63%) | -- |
| Mar 24 - Mar 30 | 128 | 19 (15%) | 6 (32%) | 4 (67%) | 3 (75%) |

**Source breakdown** — same funnel but split by acquisition source:
| Source | Signups | → Paid | Conv % | Est. LTV |
|---|---|---|---|---|
| Podcast | 45 | 3 | 6.7% | €2,800 |
| Organic | 62 | 1 | 1.6% | €1,200 |
| Referral | 18 | 1 | 5.6% | €3,100 |
| Social | 17 | 0 | 0% | -- |

**TimeRangePicker** at the top (reuse existing component).

### Stripe webhook endpoint

Create `/api/webhooks/stripe` that listens for:
- `customer.subscription.created` → trial start
- `invoice.paid` → paid conversion (check if first non-trial invoice)
- `customer.subscription.deleted` → churn

Verify webhook signature with `STRIPE_WEBHOOK_SECRET` (already in env vars). Upsert into `subscribers` table by matching Stripe customer email.

---

## Feature 2: Content ROI Scoring

### What it does

Enhance the existing **Content** page to show not just views/signups per page, but actual **revenue attribution**. Which blog posts, podcast episodes, and pages drive the most revenue?

### How it works

Using the `subscribers` table from Feature 1:

1. Each subscriber has a `sourcePage` (the page they signed up from)
2. Each subscriber may have `paidAt` and a Stripe customer ID
3. Query: for each `sourcePage`, count total signups, count paid conversions, sum revenue from those customers
4. Score = (total revenue generated by subscribers from this page) / (total pageviews on this page)

### Content page additions

Add two new columns to the existing content table:
- **Paid Conversions** — count of subscribers from this page who became paying members
- **Revenue** — total revenue generated by those subscribers (from Stripe charges)

Add a new **"Content ROI" card** at the top:
- Best performing page (highest revenue per view)
- Worst performing page (most views, zero conversions)
- Suggested action (AI-generated, e.g., "Add newsletter CTA to /blog/zone-2-training — 621 views but no signup form")

### Podcast episode attribution

The existing podcast pages (`/podcast/ep-*`) already record pageview events. If a listener signs up from a podcast page, that episode gets credit. Display podcast episodes separately with:
- Episode title
- Page views
- Email signups from episode page
- Downstream conversions (trial, paid)

---

## Feature 3: Churn Risk Detection

### What it does

A new "Health" section on the overview dashboard (or its own page) that flags subscribers who are showing signs of disengagement before they cancel.

### Risk signals

Combine data from Beehiiv and the events table:

1. **Email disengagement** — subscriber hasn't opened an email in 14+ days (requires Beehiiv subscriber-level engagement data, or approximate from aggregate open rates per cohort)
2. **Site absence** — subscriber hasn't visited the site in 21+ days (track via events table using session/email matching)
3. **Trial about to expire** — trial started 5+ days ago, no paid conversion yet
4. **Community inactivity** — joined Skool but not active (if Skool provides this via webhook or API)

### Practical implementation

Since Beehiiv doesn't expose per-subscriber open data via API, and Skool's analytics are limited, focus on what we CAN track:

**Tier 1 (build now):**
- Trial expiry countdown — list of subscribers in trial with days remaining, sorted by urgency
- Funnel drop-offs — subscribers who signed up 14+ days ago but never joined Skool
- Stale signups — email subscribers who haven't triggered any site event in 30+ days

**Tier 2 (build when data is richer):**
- Beehiiv engagement scoring (when/if they add per-subscriber API)
- Skool activity correlation (if webhooks expand)

### Churn dashboard UI

A card-based layout on a new `/admin/health` page:

**At Risk — Trial Expiring** (red):
- List of subscribers in active trial, sorted by days remaining
- Name/email (masked), trial start date, days left, source page

**At Risk — Stalled in Funnel** (amber):
- Subscribers who signed up but haven't progressed to next stage in 14+ days
- Shows which stage they're stuck at
- Count + trend vs previous period

**Healthy Indicators** (green):
- Trial-to-paid conversion rate this week vs average
- New signups trending up/down
- Community growth rate

---

## Files Changed Summary

| File | Change Type | Description |
|------|------------|-------------|
| `src/lib/db/schema.ts` | Modify | Add `subscribers` table |
| `src/lib/admin/subscribers-store.ts` | New | CRUD + funnel aggregation queries for subscribers |
| `src/app/admin/(dashboard)/funnel/page.tsx` | New | Full-funnel cohort tracking page |
| `src/app/admin/(dashboard)/health/page.tsx` | New | Churn risk detection page |
| `src/app/admin/(dashboard)/content/page.tsx` | Modify | Add revenue attribution columns + Content ROI card |
| `src/app/api/webhooks/stripe/route.ts` | New | Stripe webhook handler for subscription lifecycle |
| `src/app/api/skool-webhook/route.ts` | Modify | Extend to upsert subscribers table on member.joined |
| `src/app/api/events/route.ts` | Modify | Extend to upsert subscribers table on signup events |
| `src/app/admin/(dashboard)/components/CohortTable.tsx` | New | Cohort visualization component |
| `src/app/admin/(dashboard)/layout.tsx` | Modify | Add Funnel + Health nav items |

**Total: 6 modified files, 4 new files.**

---

## What this enables

After this ships, the morning routine for Ted becomes:

1. Open `/admin` — see the funnel health at a glance
2. Check `/admin/health` — any trials about to expire? Anyone stuck in the funnel?
3. Check `/admin/funnel` — which cohorts are converting? Which sources are working?
4. Check `/admin/content` — which content is driving revenue? Where should Anthony focus?

Every decision — which content to create, which CTAs to test, which subscribers to nudge, which acquisition channels to invest in — is now data-backed.
