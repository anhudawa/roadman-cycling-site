# Full-Funnel Intelligence Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a subscribers table that unifies identity across Beehiiv/Skool/Stripe, build a full-funnel cohort tracking page, enhance the content page with revenue attribution, and add a churn risk health page.

**Architecture:** A new `subscribers` table acts as the unified identity layer. Data flows in from three sources: the `/api/events` route (on signup), the `/api/skool-webhook` route (on Skool join), and a new `/api/webhooks/stripe` route (on subscription lifecycle events). Three new admin pages consume this data via a `subscribers-store.ts` query layer.

**Tech Stack:** Next.js 16, React 19, Drizzle ORM, Vercel Postgres (Neon), Stripe webhooks, Tailwind CSS

**CRITICAL: Next.js 16 conventions:**
- `searchParams` and `params` are `Promise` types $€” must be `await`ed
- All DB queries must be wrapped in try/catch with demo data fallbacks (DB may be empty)
- Auth uses NextAuth v5 via `src/lib/auth.ts`

---

### Task 1: Add `subscribers` table to Drizzle schema

**Files:**
- Modify: `src/lib/db/schema.ts`

- [ ] **Step 1: Add the subscribers table definition**

In `src/lib/db/schema.ts`, add after the `agentReports` table (before the `repurposedEpisodes` table):

```typescript
// $”€$”€ Subscribers (unified identity) $”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€
export const subscribers = pgTable(
  "subscribers",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull().unique(),
    source: text("source"), // 'organic' | 'podcast' | 'referral' | 'paid' | 'social'
    sourcePage: text("source_page"),
    signedUpAt: timestamp("signed_up_at", { withTimezone: true }),
    skoolJoinedAt: timestamp("skool_joined_at", { withTimezone: true }),
    trialStartedAt: timestamp("trial_started_at", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    churnedAt: timestamp("churned_at", { withTimezone: true }),
    beehiivId: text("beehiiv_id"),
    stripeCustomerId: text("stripe_customer_id"),
    persona: text("persona"), // 'plateau' | 'comeback' | 'event-prep' | 'listener'
    meta: jsonb("meta"),
  },
  (table) => [
    index("subscribers_email_idx").on(table.email),
    index("subscribers_signed_up_at_idx").on(table.signedUpAt),
  ]
);
```

- [ ] **Step 2: Push schema to database**

Run: `cd /Users/tedcrilly/Desktop/roadman-cycling-site && POSTGRES_URL=$(grep '^POSTGRES_URL=' .env.local | cut -d= -f2- | tr -d '"') npm run db:push 2>&1 | tail -5`

Expected: `[$œ“] Changes applied`

- [ ] **Step 3: Verify build passes**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/lib/db/schema.ts
git commit -m "feat: add subscribers table for unified identity tracking"
```

---

### Task 2: Create subscribers-store.ts query layer

**Files:**
- Create: `src/lib/admin/subscribers-store.ts`

- [ ] **Step 1: Create the subscribers store with upsert and query functions**

Create `src/lib/admin/subscribers-store.ts`:

```typescript
import { db } from "@/lib/db";
import { subscribers } from "@/lib/db/schema";
import { eq, and, gte, lte, isNull, isNotNull, sql, count, desc } from "drizzle-orm";

// $”€$”€ Types $”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€

export interface Subscriber {
  id: number;
  email: string;
  source: string | null;
  sourcePage: string | null;
  signedUpAt: Date | null;
  skoolJoinedAt: Date | null;
  trialStartedAt: Date | null;
  paidAt: Date | null;
  churnedAt: Date | null;
  beehiivId: string | null;
  stripeCustomerId: string | null;
  persona: string | null;
}

export interface FunnelStats {
  signups: number;
  skoolJoins: number;
  trialStarts: number;
  paidMembers: number;
  activeAfter30d: number;
}

export interface CohortRow {
  week: string; // ISO date of week start
  signups: number;
  skoolJoins: number;
  trialStarts: number;
  paidMembers: number;
  activeAfter30d: number;
}

export interface SourceRow {
  source: string;
  signups: number;
  paidMembers: number;
  convRate: number;
}

export interface ContentROI {
  sourcePage: string;
  signups: number;
  paidConversions: number;
  revenue: number; // cents
}

export interface AtRiskTrial {
  email: string;
  trialStartedAt: Date;
  daysLeft: number;
  sourcePage: string | null;
}

export interface StalledSubscriber {
  email: string;
  signedUpAt: Date;
  stalledStage: "no_skool" | "no_trial" | "no_paid";
  daysSinceSignup: number;
}

// $”€$”€ Upsert functions $”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€

export async function upsertOnSignup(
  email: string,
  sourcePage: string,
  source?: string
): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  await db
    .insert(subscribers)
    .values({
      email: normalizedEmail,
      source: source ?? inferSource(sourcePage),
      sourcePage,
      signedUpAt: new Date(),
    })
    .onConflictDoUpdate({
      target: subscribers.email,
      set: {
        source: sql`COALESCE(${subscribers.source}, excluded.source)`,
        sourcePage: sql`COALESCE(${subscribers.sourcePage}, excluded.source_page)`,
        signedUpAt: sql`COALESCE(${subscribers.signedUpAt}, excluded.signed_up_at)`,
      },
    });
}

export async function upsertOnSkoolJoin(
  email: string,
  persona?: string
): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  await db
    .insert(subscribers)
    .values({
      email: normalizedEmail,
      skoolJoinedAt: new Date(),
      persona: persona ?? null,
    })
    .onConflictDoUpdate({
      target: subscribers.email,
      set: {
        skoolJoinedAt: sql`COALESCE(${subscribers.skoolJoinedAt}, excluded.skool_joined_at)`,
        persona: sql`COALESCE(excluded.persona, ${subscribers.persona})`,
      },
    });
}

export async function upsertOnTrialStart(
  email: string,
  stripeCustomerId: string
): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  await db
    .insert(subscribers)
    .values({
      email: normalizedEmail,
      trialStartedAt: new Date(),
      stripeCustomerId,
    })
    .onConflictDoUpdate({
      target: subscribers.email,
      set: {
        trialStartedAt: sql`COALESCE(${subscribers.trialStartedAt}, excluded.trial_started_at)`,
        stripeCustomerId: sql`COALESCE(excluded.stripe_customer_id, ${subscribers.stripeCustomerId})`,
      },
    });
}

export async function upsertOnPaid(
  email: string,
  stripeCustomerId: string
): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  await db
    .insert(subscribers)
    .values({
      email: normalizedEmail,
      paidAt: new Date(),
      stripeCustomerId,
    })
    .onConflictDoUpdate({
      target: subscribers.email,
      set: {
        paidAt: sql`COALESCE(${subscribers.paidAt}, excluded.paid_at)`,
        stripeCustomerId: sql`COALESCE(excluded.stripe_customer_id, ${subscribers.stripeCustomerId})`,
      },
    });
}

export async function upsertOnChurn(
  email: string
): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  await db
    .update(subscribers)
    .set({ churnedAt: new Date() })
    .where(eq(subscribers.email, normalizedEmail));
}

// $”€$”€ Query functions $”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€

export async function getFunnelStats(from: Date, to: Date): Promise<FunnelStats> {
  const thirtyDaysAgo = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [signupCount, skoolCount, trialCount, paidCount, activeCount] =
    await Promise.all([
      db.select({ cnt: count() }).from(subscribers)
        .where(and(gte(subscribers.signedUpAt, from), lte(subscribers.signedUpAt, to))),
      db.select({ cnt: count() }).from(subscribers)
        .where(and(gte(subscribers.skoolJoinedAt, from), lte(subscribers.skoolJoinedAt, to))),
      db.select({ cnt: count() }).from(subscribers)
        .where(and(gte(subscribers.trialStartedAt, from), lte(subscribers.trialStartedAt, to))),
      db.select({ cnt: count() }).from(subscribers)
        .where(and(gte(subscribers.paidAt, from), lte(subscribers.paidAt, to))),
      db.select({ cnt: count() }).from(subscribers)
        .where(and(
          gte(subscribers.paidAt, from),
          lte(subscribers.paidAt, thirtyDaysAgo),
          isNull(subscribers.churnedAt)
        )),
    ]);

  return {
    signups: Number(signupCount[0]?.cnt ?? 0),
    skoolJoins: Number(skoolCount[0]?.cnt ?? 0),
    trialStarts: Number(trialCount[0]?.cnt ?? 0),
    paidMembers: Number(paidCount[0]?.cnt ?? 0),
    activeAfter30d: Number(activeCount[0]?.cnt ?? 0),
  };
}

export async function getCohortData(from: Date, to: Date): Promise<CohortRow[]> {
  const rows = await db
    .select({
      week: sql<string>`DATE_TRUNC('week', ${subscribers.signedUpAt})::date`,
      signups: count(),
      skoolJoins: sql<number>`COUNT(CASE WHEN ${subscribers.skoolJoinedAt} IS NOT NULL THEN 1 END)`,
      trialStarts: sql<number>`COUNT(CASE WHEN ${subscribers.trialStartedAt} IS NOT NULL THEN 1 END)`,
      paidMembers: sql<number>`COUNT(CASE WHEN ${subscribers.paidAt} IS NOT NULL THEN 1 END)`,
      activeAfter30d: sql<number>`COUNT(CASE WHEN ${subscribers.paidAt} IS NOT NULL AND ${subscribers.churnedAt} IS NULL AND ${subscribers.paidAt} < NOW() - INTERVAL '30 days' THEN 1 END)`,
    })
    .from(subscribers)
    .where(and(
      isNotNull(subscribers.signedUpAt),
      gte(subscribers.signedUpAt, from),
      lte(subscribers.signedUpAt, to)
    ))
    .groupBy(sql`DATE_TRUNC('week', ${subscribers.signedUpAt})`)
    .orderBy(desc(sql`DATE_TRUNC('week', ${subscribers.signedUpAt})`));

  return rows.map((r) => ({
    week: r.week,
    signups: Number(r.signups),
    skoolJoins: Number(r.skoolJoins),
    trialStarts: Number(r.trialStarts),
    paidMembers: Number(r.paidMembers),
    activeAfter30d: Number(r.activeAfter30d),
  }));
}

export async function getSourceBreakdown(from: Date, to: Date): Promise<SourceRow[]> {
  const rows = await db
    .select({
      source: sql<string>`COALESCE(${subscribers.source}, 'unknown')`,
      signups: count(),
      paidMembers: sql<number>`COUNT(CASE WHEN ${subscribers.paidAt} IS NOT NULL THEN 1 END)`,
    })
    .from(subscribers)
    .where(and(
      isNotNull(subscribers.signedUpAt),
      gte(subscribers.signedUpAt, from),
      lte(subscribers.signedUpAt, to)
    ))
    .groupBy(sql`COALESCE(${subscribers.source}, 'unknown')`)
    .orderBy(desc(count()));

  return rows.map((r) => {
    const signups = Number(r.signups);
    const paidMembers = Number(r.paidMembers);
    return {
      source: r.source,
      signups,
      paidMembers,
      convRate: signups > 0 ? (paidMembers / signups) * 100 : 0,
    };
  });
}

export async function getContentROI(): Promise<ContentROI[]> {
  const rows = await db
    .select({
      sourcePage: subscribers.sourcePage,
      signups: count(),
      paidConversions: sql<number>`COUNT(CASE WHEN ${subscribers.paidAt} IS NOT NULL THEN 1 END)`,
    })
    .from(subscribers)
    .where(isNotNull(subscribers.sourcePage))
    .groupBy(subscribers.sourcePage)
    .orderBy(desc(sql`COUNT(CASE WHEN ${subscribers.paidAt} IS NOT NULL THEN 1 END)`));

  // Revenue estimation: $195/month * months active
  return rows.map((r) => ({
    sourcePage: r.sourcePage!,
    signups: Number(r.signups),
    paidConversions: Number(r.paidConversions),
    revenue: Number(r.paidConversions) * 195 * 100, // Approximate: 1 month revenue in cents per paid conversion
  }));
}

export async function getTrialsAtRisk(): Promise<AtRiskTrial[]> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const rows = await db
    .select({
      email: subscribers.email,
      trialStartedAt: subscribers.trialStartedAt,
      sourcePage: subscribers.sourcePage,
    })
    .from(subscribers)
    .where(and(
      isNotNull(subscribers.trialStartedAt),
      gte(subscribers.trialStartedAt, sevenDaysAgo),
      isNull(subscribers.paidAt)
    ))
    .orderBy(subscribers.trialStartedAt);

  return rows.map((r) => {
    const trialStart = r.trialStartedAt!;
    const trialEnd = new Date(trialStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    const daysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / (24 * 60 * 60 * 1000)));
    return {
      email: r.email,
      trialStartedAt: trialStart,
      daysLeft,
      sourcePage: r.sourcePage,
    };
  });
}

export async function getStalledSubscribers(): Promise<StalledSubscriber[]> {
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const rows = await db
    .select({
      email: subscribers.email,
      signedUpAt: subscribers.signedUpAt,
      skoolJoinedAt: subscribers.skoolJoinedAt,
      trialStartedAt: subscribers.trialStartedAt,
      paidAt: subscribers.paidAt,
    })
    .from(subscribers)
    .where(and(
      isNotNull(subscribers.signedUpAt),
      lte(subscribers.signedUpAt, fourteenDaysAgo),
      isNull(subscribers.paidAt)
    ))
    .orderBy(subscribers.signedUpAt)
    .limit(50);

  return rows.map((r) => {
    const daysSinceSignup = Math.floor(
      (Date.now() - r.signedUpAt!.getTime()) / (24 * 60 * 60 * 1000)
    );

    let stalledStage: "no_skool" | "no_trial" | "no_paid";
    if (!r.skoolJoinedAt) stalledStage = "no_skool";
    else if (!r.trialStartedAt) stalledStage = "no_trial";
    else stalledStage = "no_paid";

    return {
      email: r.email,
      signedUpAt: r.signedUpAt!,
      stalledStage,
      daysSinceSignup,
    };
  });
}

export async function getHealthStats(): Promise<{
  trialToPaidRate: number;
  trialToPaidRateAvg: number;
  newSignupsTrend: number; // positive = up, negative = down
  communityGrowthRate: number;
}> {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const [thisWeekTrials, thisWeekPaid, lastWeekTrials, lastWeekPaid, thisWeekSignups, lastWeekSignups, thisWeekSkool, lastWeekSkool] =
    await Promise.all([
      db.select({ cnt: count() }).from(subscribers).where(and(gte(subscribers.trialStartedAt, oneWeekAgo), lte(subscribers.trialStartedAt, now))),
      db.select({ cnt: count() }).from(subscribers).where(and(gte(subscribers.paidAt, oneWeekAgo), lte(subscribers.paidAt, now))),
      db.select({ cnt: count() }).from(subscribers).where(and(gte(subscribers.trialStartedAt, twoWeeksAgo), lte(subscribers.trialStartedAt, oneWeekAgo))),
      db.select({ cnt: count() }).from(subscribers).where(and(gte(subscribers.paidAt, twoWeeksAgo), lte(subscribers.paidAt, oneWeekAgo))),
      db.select({ cnt: count() }).from(subscribers).where(and(gte(subscribers.signedUpAt, oneWeekAgo), lte(subscribers.signedUpAt, now))),
      db.select({ cnt: count() }).from(subscribers).where(and(gte(subscribers.signedUpAt, twoWeeksAgo), lte(subscribers.signedUpAt, oneWeekAgo))),
      db.select({ cnt: count() }).from(subscribers).where(and(gte(subscribers.skoolJoinedAt, oneWeekAgo), lte(subscribers.skoolJoinedAt, now))),
      db.select({ cnt: count() }).from(subscribers).where(and(gte(subscribers.skoolJoinedAt, twoWeeksAgo), lte(subscribers.skoolJoinedAt, oneWeekAgo))),
    ]);

  const twTrials = Number(thisWeekTrials[0]?.cnt ?? 0);
  const twPaid = Number(thisWeekPaid[0]?.cnt ?? 0);
  const lwTrials = Number(lastWeekTrials[0]?.cnt ?? 0);
  const lwPaid = Number(lastWeekPaid[0]?.cnt ?? 0);
  const twSignups = Number(thisWeekSignups[0]?.cnt ?? 0);
  const lwSignups = Number(lastWeekSignups[0]?.cnt ?? 0);
  const twSkool = Number(thisWeekSkool[0]?.cnt ?? 0);
  const lwSkool = Number(lastWeekSkool[0]?.cnt ?? 0);

  return {
    trialToPaidRate: twTrials > 0 ? (twPaid / twTrials) * 100 : 0,
    trialToPaidRateAvg: lwTrials > 0 ? (lwPaid / lwTrials) * 100 : 0,
    newSignupsTrend: lwSignups > 0 ? ((twSignups - lwSignups) / lwSignups) * 100 : 0,
    communityGrowthRate: lwSkool > 0 ? ((twSkool - lwSkool) / lwSkool) * 100 : 0,
  };
}

// $”€$”€ Helpers $”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€

function inferSource(page: string): string {
  if (page.startsWith("/podcast")) return "podcast";
  if (page.includes("ref=")) return "referral";
  return "organic";
}
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/lib/admin/subscribers-store.ts
git commit -m "feat: add subscribers-store with upsert and funnel query functions"
```

---

### Task 3: Extend events API to upsert subscribers on signup

**Files:**
- Modify: `src/app/api/events/route.ts`

- [ ] **Step 1: Add subscriber upsert to the events handler**

In `src/app/api/events/route.ts`, add the import at the top:

```typescript
import { upsertOnSignup } from "@/lib/admin/subscribers-store";
```

After the `recordEvent` call (line ~25), add a conditional upsert for signup events:

```typescript
    const event = await recordEvent(type, page, {
      referrer,
      userAgent,
      email,
      source,
      meta,
      sessionId: session_id,
      variantId: variant_id,
    });

    // Upsert subscriber on signup events
    if (type === "signup" && email) {
      try {
        await upsertOnSignup(email, page, source);
      } catch (err) {
        console.error("[Events API] Subscriber upsert failed:", err);
        // Non-blocking $€” event was already recorded
      }
    }

    return Response.json({ success: true, id: event.id });
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/app/api/events/route.ts
git commit -m "feat: upsert subscriber on email signup events"
```

---

### Task 4: Extend Skool webhook to upsert subscribers

**Files:**
- Modify: `src/app/api/skool-webhook/route.ts`

- [ ] **Step 1: Add subscriber upsert to the Skool webhook handler**

In `src/app/api/skool-webhook/route.ts`, add the import at the top:

```typescript
import { upsertOnSkoolJoin } from "@/lib/admin/subscribers-store";
```

After the persona classification (around line 180, after `const persona = classifyPersona(answers);`), add:

```typescript
    // Upsert subscriber with Skool join timestamp
    try {
      await upsertOnSkoolJoin(email, persona);
    } catch (err) {
      console.error("[Skool Webhook] Subscriber upsert failed:", err);
      // Non-blocking $€” continue with Beehiiv flow
    }
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/app/api/skool-webhook/route.ts
git commit -m "feat: upsert subscriber on Skool member join"
```

---

### Task 5: Create Stripe webhook for subscription lifecycle

**Files:**
- Create: `src/app/api/webhooks/stripe/route.ts`

- [ ] **Step 1: Create the Stripe webhook handler**

Create `src/app/api/webhooks/stripe/route.ts`:

```typescript
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { upsertOnTrialStart, upsertOnPaid, upsertOnChurn } from "@/lib/admin/subscribers-store";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2025-03-31.basil",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  if (!webhookSecret) {
    console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        if (customer.deleted) break;
        const email = customer.email;
        if (!email) break;

        // If subscription has a trial, this is a trial start
        if (subscription.trial_end) {
          await upsertOnTrialStart(email, customer.id);
          console.log(`[Stripe Webhook] Trial started: ${email}`);
        } else {
          // Direct paid subscription (no trial)
          await upsertOnPaid(email, customer.id);
          console.log(`[Stripe Webhook] Paid directly: ${email}`);
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        if (!invoice.subscription) break;

        const customer = await stripe.customers.retrieve(invoice.customer as string);
        if (customer.deleted) break;
        const email = customer.email;
        if (!email) break;

        // Only count as "paid conversion" if this is the first real charge (not trial)
        // billing_reason "subscription_create" with amount > 0 means first paid invoice after trial
        if (
          invoice.billing_reason === "subscription_cycle" ||
          (invoice.billing_reason === "subscription_create" && (invoice.amount_paid ?? 0) > 0)
        ) {
          await upsertOnPaid(email, customer.id);
          console.log(`[Stripe Webhook] Paid invoice: ${email}, amount: ${invoice.amount_paid}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        if (customer.deleted) break;
        const email = customer.email;
        if (!email) break;

        await upsertOnChurn(email);
        console.log(`[Stripe Webhook] Churned: ${email}`);
        break;
      }

      default:
        // Ignore other event types
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[Stripe Webhook] Handler error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }
}
```

Note: The Stripe API version may need adjustment. Check what version is used in the existing Stripe integration at `src/lib/integrations/stripe.ts`. If no explicit version is set, use the default.

- [ ] **Step 2: Verify build passes**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds (may warn about missing Stripe types $€” install if needed: `npm install stripe`)

- [ ] **Step 3: Commit**

```bash
git add src/app/api/webhooks/stripe/route.ts
git commit -m "feat: add Stripe webhook for subscription lifecycle tracking"
```

---

### Task 6: Create CohortTable component

**Files:**
- Create: `src/app/admin/(dashboard)/components/CohortTable.tsx`

- [ ] **Step 1: Create the cohort visualization component**

Create `src/app/admin/(dashboard)/components/CohortTable.tsx`:

```tsx
import { maskEmail } from "@/lib/admin/events-store";
import type { CohortRow } from "@/lib/admin/subscribers-store";

function pct(numerator: number, denominator: number): string {
  if (denominator === 0) return "--";
  return `${((numerator / denominator) * 100).toFixed(0)}%`;
}

function formatWeek(iso: string): string {
  const d = new Date(iso);
  const end = new Date(d.getTime() + 6 * 24 * 60 * 60 * 1000);
  const fmt = (date: Date) =>
    date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return `${fmt(d)} $€“ ${fmt(end)}`;
}

export function CohortTable({ rows }: { rows: CohortRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center border border-dashed border-white/10 rounded-lg">
        <p className="text-foreground-subtle text-sm">
          No cohort data yet. Signups will appear here as they progress through the funnel.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-3 pr-4 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
              Cohort
            </th>
            <th className="text-right py-3 px-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
              Signups
            </th>
            <th className="text-right py-3 px-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
              $†’ Skool
            </th>
            <th className="text-right py-3 px-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
              $†’ Trial
            </th>
            <th className="text-right py-3 px-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
              $†’ Paid
            </th>
            <th className="text-right py-3 pl-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
              30d Active
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.week} className="border-b border-white/5">
              <td className="py-3 pr-4 text-off-white whitespace-nowrap">
                {formatWeek(row.week)}
              </td>
              <td className="py-3 px-3 text-right text-off-white tabular-nums">
                {row.signups}
              </td>
              <td className="py-3 px-3 text-right text-foreground-muted tabular-nums">
                {row.skoolJoins} <span className="text-xs text-foreground-subtle">({pct(row.skoolJoins, row.signups)})</span>
              </td>
              <td className="py-3 px-3 text-right text-foreground-muted tabular-nums">
                {row.trialStarts} <span className="text-xs text-foreground-subtle">({pct(row.trialStarts, row.skoolJoins)})</span>
              </td>
              <td className="py-3 px-3 text-right text-foreground-muted tabular-nums">
                {row.paidMembers} <span className="text-xs text-foreground-subtle">({pct(row.paidMembers, row.trialStarts)})</span>
              </td>
              <td className="py-3 pl-3 text-right tabular-nums">
                {row.activeAfter30d > 0 ? (
                  <span className="text-green-400">
                    {row.activeAfter30d} <span className="text-xs">({pct(row.activeAfter30d, row.paidMembers)})</span>
                  </span>
                ) : (
                  <span className="text-foreground-subtle">--</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/\(dashboard\)/components/CohortTable.tsx
git commit -m "feat: add CohortTable component for funnel visualization"
```

---

### Task 7: Create Funnel admin page

**Files:**
- Create: `src/app/admin/(dashboard)/funnel/page.tsx`

- [ ] **Step 1: Create the funnel page**

Create `src/app/admin/(dashboard)/funnel/page.tsx`:

```tsx
import { Suspense } from "react";
import { TimeRangePicker } from "../components/TimeRangePicker";
import { FunnelDisplay } from "../components/charts/FunnelDisplay";
import { CohortTable } from "../components/CohortTable";
import { parseTimeRange } from "@/lib/admin/time-ranges";
import {
  getFunnelStats,
  getCohortData,
  getSourceBreakdown,
  type FunnelStats,
  type CohortRow,
  type SourceRow,
} from "@/lib/admin/subscribers-store";

const DEMO_FUNNEL: FunnelStats = {
  signups: 142, skoolJoins: 23, trialStarts: 8, paidMembers: 5, activeAfter30d: 3,
};

const DEMO_COHORTS: CohortRow[] = [
  { week: "2026-03-31", signups: 142, skoolJoins: 23, trialStarts: 8, paidMembers: 5, activeAfter30d: 0 },
  { week: "2026-03-24", signups: 128, skoolJoins: 19, trialStarts: 6, paidMembers: 4, activeAfter30d: 3 },
  { week: "2026-03-17", signups: 135, skoolJoins: 21, trialStarts: 7, paidMembers: 4, activeAfter30d: 3 },
];

const DEMO_SOURCES: SourceRow[] = [
  { source: "organic", signups: 62, paidMembers: 1, convRate: 1.6 },
  { source: "podcast", signups: 45, paidMembers: 3, convRate: 6.7 },
  { source: "referral", signups: 18, paidMembers: 1, convRate: 5.6 },
  { source: "social", signups: 17, paidMembers: 0, convRate: 0 },
];

export default async function FunnelPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const rangeParam = typeof resolvedParams.range === "string" ? resolvedParams.range : "30d";
  const { from, to } = parseTimeRange(rangeParam);

  let funnel = DEMO_FUNNEL;
  let cohorts = DEMO_COHORTS;
  let sources = DEMO_SOURCES;
  let usingLiveData = false;

  try {
    const [f, c, s] = await Promise.all([
      getFunnelStats(from, to),
      getCohortData(from, to),
      getSourceBreakdown(from, to),
    ]);
    if (f.signups > 0 || c.length > 0) {
      funnel = f;
      cohorts = c;
      sources = s;
      usingLiveData = true;
    }
  } catch {
    // DB not available $€” demo data already set
  }

  const funnelSteps = [
    { label: "Email Signups", value: funnel.signups },
    { label: "Skool Joins", value: funnel.skoolJoins },
    { label: "Trial Starts", value: funnel.trialStarts },
    { label: "Paid Members", value: funnel.paidMembers },
    { label: "Active 30d", value: funnel.activeAfter30d },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl text-off-white tracking-wider">
            FUNNEL
          </h1>
          <p className="text-foreground-muted text-sm mt-1">
            {usingLiveData
              ? "End-to-end conversion tracking"
              : "Demo data \u2014 subscriber data will populate as signups flow through"}
          </p>
        </div>
        <Suspense fallback={null}>
          <TimeRangePicker />
        </Suspense>
      </div>

      {/* Funnel visualization */}
      <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
        <h2 className="font-heading text-sm text-foreground-muted tracking-wider mb-4">
          CONVERSION FUNNEL
        </h2>
        <FunnelDisplay steps={funnelSteps} />
      </div>

      {/* Cohort table */}
      <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
        <h2 className="font-heading text-sm text-foreground-muted tracking-wider mb-4">
          WEEKLY COHORTS
        </h2>
        <CohortTable rows={cohorts} />
      </div>

      {/* Source breakdown */}
      <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
        <h2 className="font-heading text-sm text-foreground-muted tracking-wider mb-4">
          ACQUISITION SOURCE BREAKDOWN
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 pr-4 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Source
                </th>
                <th className="text-right py-3 px-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Signups
                </th>
                <th className="text-right py-3 px-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Paid
                </th>
                <th className="text-right py-3 pl-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Conv %
                </th>
              </tr>
            </thead>
            <tbody>
              {sources.map((row) => (
                <tr key={row.source} className="border-b border-white/5">
                  <td className="py-3 pr-4 text-off-white capitalize">{row.source}</td>
                  <td className="py-3 px-3 text-right text-foreground-muted tabular-nums">{row.signups}</td>
                  <td className="py-3 px-3 text-right text-foreground-muted tabular-nums">{row.paidMembers}</td>
                  <td className="py-3 pl-3 text-right">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      row.convRate >= 5 ? "text-green-400 bg-green-400/10" :
                      row.convRate >= 2 ? "text-yellow-400 bg-yellow-400/10" :
                      row.convRate > 0 ? "text-coral bg-coral/10" :
                      "text-foreground-subtle bg-white/5"
                    }`}>
                      {row.convRate.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/\(dashboard\)/funnel/page.tsx
git commit -m "feat: add full-funnel cohort tracking page"
```

---

### Task 8: Create Health (churn risk) admin page

**Files:**
- Create: `src/app/admin/(dashboard)/health/page.tsx`

- [ ] **Step 1: Create the health page**

Create `src/app/admin/(dashboard)/health/page.tsx`:

```tsx
import { maskEmail } from "@/lib/admin/events-store";
import {
  getTrialsAtRisk,
  getStalledSubscribers,
  getHealthStats,
  type AtRiskTrial,
  type StalledSubscriber,
} from "@/lib/admin/subscribers-store";

const DEMO_TRIALS: AtRiskTrial[] = [
  { email: "j***n@gmail.com", trialStartedAt: new Date(Date.now() - 5 * 86400000), daysLeft: 2, sourcePage: "/blog/zone-2-training" },
  { email: "s***a@outlook.com", trialStartedAt: new Date(Date.now() - 4 * 86400000), daysLeft: 3, sourcePage: "/" },
  { email: "m***e@yahoo.com", trialStartedAt: new Date(Date.now() - 2 * 86400000), daysLeft: 5, sourcePage: "/podcast" },
];

const DEMO_STALLED: StalledSubscriber[] = [
  { email: "r***k@gmail.com", signedUpAt: new Date(Date.now() - 21 * 86400000), stalledStage: "no_skool", daysSinceSignup: 21 },
  { email: "d***s@icloud.com", signedUpAt: new Date(Date.now() - 18 * 86400000), stalledStage: "no_skool", daysSinceSignup: 18 },
  { email: "l***y@hotmail.com", signedUpAt: new Date(Date.now() - 16 * 86400000), stalledStage: "no_trial", daysSinceSignup: 16 },
];

function stageLabel(stage: string): string {
  switch (stage) {
    case "no_skool": return "Not joined Skool";
    case "no_trial": return "No trial started";
    case "no_paid": return "Trial not converted";
    default: return stage;
  }
}

function stageColor(stage: string): string {
  switch (stage) {
    case "no_skool": return "text-coral bg-coral/10";
    case "no_trial": return "text-yellow-400 bg-yellow-400/10";
    case "no_paid": return "text-blue-400 bg-blue-400/10";
    default: return "text-foreground-subtle bg-white/5";
  }
}

export default async function HealthPage() {
  let trials = DEMO_TRIALS;
  let stalled = DEMO_STALLED;
  let healthStats = { trialToPaidRate: 62.5, trialToPaidRateAvg: 58.3, newSignupsTrend: 8.2, communityGrowthRate: 12.1 };
  let usingLiveData = false;

  try {
    const [t, s, h] = await Promise.all([
      getTrialsAtRisk(),
      getStalledSubscribers(),
      getHealthStats(),
    ]);
    trials = t.length > 0 ? t : DEMO_TRIALS;
    stalled = s.length > 0 ? s : DEMO_STALLED;
    healthStats = h.trialToPaidRate > 0 || h.newSignupsTrend !== 0 ? h : healthStats;
    usingLiveData = t.length > 0 || s.length > 0;
  } catch {
    // DB not available $€” demo data already set
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl text-off-white tracking-wider">
          HEALTH
        </h1>
        <p className="text-foreground-muted text-sm mt-1">
          {usingLiveData ? "Churn risk signals and funnel health" : "Demo data \u2014 will populate as subscribers flow through"}
        </p>
      </div>

      {/* Health indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
          <p className="text-foreground-subtle text-xs uppercase tracking-wider mb-1">
            Trial $†’ Paid (This Week)
          </p>
          <p className="text-2xl font-heading text-off-white">
            {healthStats.trialToPaidRate.toFixed(0)}%
          </p>
          <p className="text-xs text-foreground-subtle mt-1">
            Avg: {healthStats.trialToPaidRateAvg.toFixed(0)}%
          </p>
        </div>
        <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
          <p className="text-foreground-subtle text-xs uppercase tracking-wider mb-1">
            New Signups Trend
          </p>
          <p className={`text-2xl font-heading ${healthStats.newSignupsTrend >= 0 ? "text-green-400" : "text-coral"}`}>
            {healthStats.newSignupsTrend >= 0 ? "+" : ""}{healthStats.newSignupsTrend.toFixed(0)}%
          </p>
          <p className="text-xs text-foreground-subtle mt-1">vs previous week</p>
        </div>
        <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
          <p className="text-foreground-subtle text-xs uppercase tracking-wider mb-1">
            Community Growth
          </p>
          <p className={`text-2xl font-heading ${healthStats.communityGrowthRate >= 0 ? "text-green-400" : "text-coral"}`}>
            {healthStats.communityGrowthRate >= 0 ? "+" : ""}{healthStats.communityGrowthRate.toFixed(0)}%
          </p>
          <p className="text-xs text-foreground-subtle mt-1">Skool joins vs prev week</p>
        </div>
      </div>

      {/* Trials at risk */}
      <div className="bg-background-elevated border border-red-500/10 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          <h2 className="font-heading text-sm text-red-400 tracking-wider">
            AT RISK $€” TRIALS EXPIRING ({trials.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">Email</th>
                <th className="text-left px-3 py-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">Trial Started</th>
                <th className="text-right px-3 py-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">Days Left</th>
                <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">Source</th>
              </tr>
            </thead>
            <tbody>
              {trials.map((t, i) => (
                <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="px-5 py-3 text-off-white font-mono">{maskEmail(t.email)}</td>
                  <td className="px-3 py-3 text-foreground-muted">
                    {t.trialStartedAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      t.daysLeft <= 1 ? "text-red-400 bg-red-400/10" :
                      t.daysLeft <= 3 ? "text-yellow-400 bg-yellow-400/10" :
                      "text-foreground-muted bg-white/5"
                    }`}>
                      {t.daysLeft}d
                    </span>
                  </td>
                  <td className="px-5 py-3 text-foreground-subtle">{t.sourcePage ?? "--"}</td>
                </tr>
              ))}
              {trials.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-foreground-subtle">No active trials</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stalled in funnel */}
      <div className="bg-background-elevated border border-yellow-500/10 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-yellow-400" />
          <h2 className="font-heading text-sm text-yellow-400 tracking-wider">
            STALLED IN FUNNEL ({stalled.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">Email</th>
                <th className="text-left px-3 py-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">Signed Up</th>
                <th className="text-left px-3 py-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">Stuck At</th>
                <th className="text-right px-5 py-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">Days</th>
              </tr>
            </thead>
            <tbody>
              {stalled.map((s, i) => (
                <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="px-5 py-3 text-off-white font-mono">{maskEmail(s.email)}</td>
                  <td className="px-3 py-3 text-foreground-muted">
                    {s.signedUpAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </td>
                  <td className="px-3 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stageColor(s.stalledStage)}`}>
                      {stageLabel(s.stalledStage)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-foreground-muted tabular-nums">{s.daysSinceSignup}d</td>
                </tr>
              ))}
              {stalled.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-foreground-subtle">No stalled subscribers</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/\(dashboard\)/health/page.tsx
git commit -m "feat: add churn risk health page with trial expiry and funnel stall detection"
```

---

### Task 9: Enhance Content page with revenue attribution

**Files:**
- Modify: `src/app/admin/(dashboard)/content/page.tsx`

- [ ] **Step 1: Add revenue attribution to the content page**

In `src/app/admin/(dashboard)/content/page.tsx`:

1. Add import at the top:
```typescript
import { getContentROI, type ContentROI } from "@/lib/admin/subscribers-store";
```

2. Inside the page function, after the existing data fetching try/catch, add a new try/catch for content ROI:

```typescript
  let contentROI: ContentROI[] = [];
  try {
    contentROI = await getContentROI();
  } catch {
    // DB not available
  }

  // Merge ROI data into pages
  const roiMap = new Map(contentROI.map((r) => [r.sourcePage, r]));
```

3. Add a "Content ROI" summary card section above the table. After the summary cards grid, add:

```tsx
      {/* Content ROI highlights */}
      {contentROI.length > 0 && (
        <div className="bg-background-elevated border border-coral/10 rounded-xl p-5">
          <h2 className="font-heading text-sm text-coral tracking-wider mb-3">
            CONTENT ROI
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {contentROI[0] && (
              <div>
                <p className="text-foreground-subtle text-xs uppercase tracking-wider mb-1">Best Converter</p>
                <p className="text-off-white">{contentROI[0].sourcePage}</p>
                <p className="text-foreground-muted text-xs">{contentROI[0].paidConversions} paid from {contentROI[0].signups} signups</p>
              </div>
            )}
            {(() => {
              const worst = [...pages].filter(p => p.views > 100).sort((a, b) => a.conversionRate - b.conversionRate)[0];
              return worst ? (
                <div>
                  <p className="text-foreground-subtle text-xs uppercase tracking-wider mb-1">Needs Attention</p>
                  <p className="text-off-white">{worst.page}</p>
                  <p className="text-foreground-muted text-xs">{worst.views} views, {worst.conversionRate.toFixed(1)}% conv rate</p>
                </div>
              ) : null;
            })()}
          </div>
        </div>
      )}
```

4. Add two new columns to the table. In the `<thead>`, after the "Conv Rate" th, add:

```tsx
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Paid
                </th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Revenue
                </th>
```

In the `<tbody>` row mapping, after the `<ConvBadge>` td, add:

```tsx
                  <td className="px-4 py-3 text-right text-sm text-foreground-muted tabular-nums">
                    {roiMap.get(row.page)?.paidConversions ?? 0}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-off-white tabular-nums font-medium">
                    {roiMap.get(row.page)?.revenue
                      ? `$${(roiMap.get(row.page)!.revenue / 100).toLocaleString()}`
                      : "--"}
                  </td>
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/\(dashboard\)/content/page.tsx
git commit -m "feat: add revenue attribution columns and Content ROI card to content page"
```

---

### Task 10: Add Funnel + Health to sidebar navigation

**Files:**
- Modify: `src/app/admin/(dashboard)/AdminSidebar.tsx`

- [ ] **Step 1: Add new nav items to the sidebar**

In `src/app/admin/(dashboard)/AdminSidebar.tsx`, update the `NAV_SECTIONS` array. Add a new "Growth" section between "Analytics" and "Business":

```typescript
const NAV_SECTIONS: NavSection[] = [
  {
    title: "Analytics",
    items: [
      { href: "/admin", label: "Overview", icon: "grid" },
      { href: "/admin/traffic", label: "Traffic", icon: "trending" },
      { href: "/admin/emails", label: "Conversions", icon: "mail" },
      { href: "/admin/leads", label: "Leads", icon: "users" },
    ],
  },
  {
    title: "Growth",
    items: [
      { href: "/admin/funnel", label: "Funnel", icon: "funnel" },
      { href: "/admin/health", label: "Health", icon: "heart" },
    ],
  },
  {
    title: "Business",
    items: [
      { href: "/admin/newsletter", label: "Newsletter", icon: "newspaper" },
      { href: "/admin/revenue", label: "Revenue", icon: "dollar" },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/content/repurposed", label: "Content Pipeline", icon: "pipeline" },
    ],
  },
  {
    title: "Optimization",
    items: [
      { href: "/admin/content", label: "Content", icon: "document" },
      { href: "/admin/experiments", label: "Experiments", icon: "beaker" },
      { href: "/admin/agent", label: "AI Agent", icon: "sparkle" },
    ],
  },
];
```

Then add two new icon cases in the `NavIcon` function:

```typescript
    case "funnel":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
        </svg>
      );
    case "heart":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
        </svg>
      );
```

Add these cases before the `default:` case in the switch statement.

- [ ] **Step 2: Verify build passes**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/\(dashboard\)/AdminSidebar.tsx
git commit -m "feat: add Funnel and Health pages to sidebar navigation"
```

---

### Task 11: Push updated schema to database

**Files:** None (database operation only)

- [ ] **Step 1: Push schema changes**

Run: `cd /Users/tedcrilly/Desktop/roadman-cycling-site && POSTGRES_URL=$(grep '^POSTGRES_URL=' .env.local | cut -d= -f2- | tr -d '"') npm run db:push 2>&1 | tail -5`

Expected: `[$œ“] Changes applied`

- [ ] **Step 2: Final build verification**

Run: `npm run build 2>&1 | tail -10`
Expected: Build succeeds

- [ ] **Step 3: Verify TypeScript**

Run: `npx tsc --noEmit 2>&1 | tail -5`
Expected: No type errors
