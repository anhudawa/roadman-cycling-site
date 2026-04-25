const STRIPE_API = "https://api.stripe.com/v1";

function getHeaders(): HeadersInit {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };
}

// ── Types ────────────────────────────────────────────────
export interface StripeCharge {
  id: string;
  amount: number;
  currency: string;
  created: number;
  description: string | null;
}

export interface RevenueSummary {
  totalCents: number;
  count: number;
  charges: StripeCharge[];
}

// ── Revenue for Period ───────────────────────────────────
export async function fetchRevenueForPeriod(
  since: Date,
  until: Date
): Promise<RevenueSummary | null> {
  try {
    const sinceUnix = Math.floor(since.getTime() / 1000);
    const untilUnix = Math.floor(until.getTime() / 1000);

    const allCharges: StripeCharge[] = [];
    let hasMore = true;
    let startingAfter: string | null = null;

    while (hasMore) {
      const params = new URLSearchParams();
      params.set("created[gte]", String(sinceUnix));
      params.set("created[lte]", String(untilUnix));
      params.set("limit", "100");
      if (startingAfter) {
        params.set("starting_after", startingAfter);
      }

      const res = await fetch(`${STRIPE_API}/charges?${params.toString()}`, {
        headers: getHeaders(),
      });

      if (!res.ok) {
        console.error(
          `[Stripe] fetchRevenueForPeriod failed: ${res.status} ${res.statusText}`
        );
        return null;
      }

      const json = await res.json();
      const charges: {
        id: string;
        amount: number;
        currency: string;
        created: number;
        description: string | null;
        status: string;
      }[] = json.data ?? [];

      // Only include successful charges
      for (const c of charges) {
        if (c.status === "succeeded") {
          allCharges.push({
            id: c.id,
            amount: c.amount,
            currency: c.currency,
            created: c.created,
            description: c.description,
          });
        }
      }

      hasMore = json.has_more === true;
      if (charges.length > 0) {
        startingAfter = charges[charges.length - 1].id;
      } else {
        hasMore = false;
      }
    }

    const totalCents = allCharges.reduce((sum, c) => sum + c.amount, 0);

    return {
      totalCents,
      count: allCharges.length,
      charges: allCharges,
    };
  } catch (err) {
    console.error("[Stripe] fetchRevenueForPeriod error:", err);
    return null;
  }
}

// ── All Customers (bulk import) ──────────────────────────
export interface StripeCustomer {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
}

export async function fetchAllCustomers({
  limit = 2000,
}: { limit?: number } = {}): Promise<StripeCustomer[]> {
  const results: StripeCustomer[] = [];
  let startingAfter: string | null = null;
  let hasMore = true;

  while (hasMore && results.length < limit) {
    const params = new URLSearchParams();
    params.set("limit", "100");
    if (startingAfter) params.set("starting_after", startingAfter);

    const res = await fetch(`${STRIPE_API}/customers?${params.toString()}`, {
      headers: getHeaders(),
    });

    if (!res.ok) {
      console.error(
        `[Stripe] fetchAllCustomers failed: ${res.status} ${res.statusText}`
      );
      break;
    }

    const json = await res.json();
    const customers: Array<{
      id: string;
      email: string | null;
      name: string | null;
      created: number;
    }> = json.data ?? [];

    if (customers.length === 0) break;

    for (const c of customers) {
      if (!c.email) continue;
      results.push({
        id: c.id,
        email: c.email,
        name: c.name ?? null,
        createdAt: new Date(c.created * 1000),
      });
      if (results.length >= limit) break;
    }

    hasMore = json.has_more === true;
    startingAfter = customers[customers.length - 1]?.id ?? null;
    if (!startingAfter) break;

    await new Promise((r) => setTimeout(r, 250));
  }

  return results;
}

// ── MRR from active subscriptions ────────────────────────

export interface MrrBreakdown {
  /** MRR in cents, normalised to monthly. */
  mrrCents: number;
  /** Cents billed on annual plans (counted as 1/12 in mrrCents, exposed separately for ARR parity). */
  annualMrrCents: number;
  /** Count of active subscriptions. */
  activeSubscriptionCount: number;
  /** Count of subscriptions in trial. */
  trialingCount: number;
  /** Count of subscriptions past_due (still counted in MRR but flagged). */
  pastDueCount: number;
  /** Cents of MRR at risk from past_due subscriptions. */
  pastDueMrrCents: number;
}

interface StripeSubscriptionItem {
  price?: {
    unit_amount?: number | null;
    recurring?: { interval?: string; interval_count?: number } | null;
  } | null;
  quantity?: number;
}

interface StripeSubscription {
  id: string;
  status: string;
  items?: { data?: StripeSubscriptionItem[] };
}

function subscriptionMrr(sub: StripeSubscription): number {
  const items = sub.items?.data ?? [];
  let mrr = 0;
  for (const it of items) {
    const unit = it.price?.unit_amount ?? 0;
    const qty = it.quantity ?? 1;
    const interval = it.price?.recurring?.interval ?? "month";
    const count = it.price?.recurring?.interval_count ?? 1;
    // Normalise to monthly cents. Divide price by interval length in months.
    let monthsPerCycle = 1;
    if (interval === "year") monthsPerCycle = 12 * count;
    else if (interval === "month") monthsPerCycle = count;
    else if (interval === "week") monthsPerCycle = count * (7 / 30);
    else if (interval === "day") monthsPerCycle = count * (1 / 30);
    mrr += (unit * qty) / monthsPerCycle;
  }
  return Math.round(mrr);
}

export async function fetchMrrBreakdown(): Promise<MrrBreakdown | null> {
  try {
    let mrr = 0;
    let annualMrr = 0;
    let active = 0;
    let trialing = 0;
    let pastDue = 0;
    let pastDueMrr = 0;
    let startingAfter: string | null = null;
    let hasMore = true;

    while (hasMore) {
      const params = new URLSearchParams();
      // status=all returns active, past_due, trialing, canceled, etc.
      // Filter client-side so we can account past_due separately.
      params.set("status", "all");
      params.set("limit", "100");
      if (startingAfter) params.set("starting_after", startingAfter);

      const res = await fetch(
        `${STRIPE_API}/subscriptions?${params.toString()}`,
        { headers: getHeaders() }
      );
      if (!res.ok) {
        console.error(
          `[Stripe] fetchMrrBreakdown failed: ${res.status} ${res.statusText}`
        );
        return null;
      }
      const json = await res.json();
      const subs: StripeSubscription[] = json.data ?? [];
      if (subs.length === 0) break;

      for (const sub of subs) {
        if (
          sub.status === "active" ||
          sub.status === "trialing" ||
          sub.status === "past_due"
        ) {
          const m = subscriptionMrr(sub);
          mrr += m;
          if (sub.status === "active") active++;
          if (sub.status === "trialing") trialing++;
          if (sub.status === "past_due") {
            pastDue++;
            pastDueMrr += m;
          }
          const interval =
            sub.items?.data?.[0]?.price?.recurring?.interval ?? "month";
          if (interval === "year") annualMrr += m;
        }
      }

      hasMore = json.has_more === true;
      startingAfter = subs[subs.length - 1]?.id ?? null;
      if (!startingAfter) break;
      await new Promise((r) => setTimeout(r, 200));
    }

    return {
      mrrCents: mrr,
      annualMrrCents: annualMrr,
      activeSubscriptionCount: active,
      trialingCount: trialing,
      pastDueCount: pastDue,
      pastDueMrrCents: pastDueMrr,
    };
  } catch (err) {
    console.error("[Stripe] fetchMrrBreakdown error:", err);
    return null;
  }
}

// ── All Subscriptions with customer/email ────────────────
// Used by the subscribers-lifecycle sync — we need to know, per email, what
// the current Stripe subscription status is so we can set trial_started_at /
// paid_at / churned_at on the subscribers table.

export interface StripeSubscriptionForSync {
  id: string;
  customerId: string;
  email: string | null;
  status: string; // active | trialing | past_due | canceled | incomplete | etc.
  createdAt: Date;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  canceledAt: Date | null;
  trialStart: Date | null;
  trialEnd: Date | null;
}

export async function fetchAllSubscriptionsForSync({
  limit = 1000,
}: { limit?: number } = {}): Promise<StripeSubscriptionForSync[]> {
  const results: StripeSubscriptionForSync[] = [];
  let startingAfter: string | null = null;
  let hasMore = true;

  while (hasMore && results.length < limit) {
    const params = new URLSearchParams();
    params.set("status", "all");
    params.set("limit", "100");
    // expand=data.customer means Stripe returns the full customer object
    // inline (not just the ID) — saves a lookup per subscription.
    params.append("expand[]", "data.customer");
    if (startingAfter) params.set("starting_after", startingAfter);

    const res = await fetch(
      `${STRIPE_API}/subscriptions?${params.toString()}`,
      { headers: getHeaders() }
    );
    if (!res.ok) {
      console.error(
        `[Stripe] fetchAllSubscriptionsForSync failed: ${res.status} ${res.statusText}`
      );
      break;
    }
    const json = (await res.json()) as {
      data: Array<{
        id: string;
        status: string;
        created: number;
        current_period_start?: number | null;
        current_period_end?: number | null;
        canceled_at?: number | null;
        trial_start?: number | null;
        trial_end?: number | null;
        customer: string | { id: string; email?: string | null };
      }>;
      has_more?: boolean;
    };
    const subs = json.data ?? [];
    if (subs.length === 0) break;

    for (const s of subs) {
      const customerId =
        typeof s.customer === "string" ? s.customer : s.customer.id;
      const email =
        typeof s.customer === "string"
          ? null
          : (s.customer.email ?? null);
      results.push({
        id: s.id,
        customerId,
        email,
        status: s.status,
        createdAt: new Date(s.created * 1000),
        currentPeriodStart: s.current_period_start
          ? new Date(s.current_period_start * 1000)
          : null,
        currentPeriodEnd: s.current_period_end
          ? new Date(s.current_period_end * 1000)
          : null,
        canceledAt: s.canceled_at ? new Date(s.canceled_at * 1000) : null,
        trialStart: s.trial_start ? new Date(s.trial_start * 1000) : null,
        trialEnd: s.trial_end ? new Date(s.trial_end * 1000) : null,
      });
      if (results.length >= limit) break;
    }
    hasMore = !!json.has_more;
    startingAfter = subs[subs.length - 1]?.id ?? null;
    if (!startingAfter) break;
    await new Promise((r) => setTimeout(r, 200));
  }
  return results;
}

// ── Recent Transactions ──────────────────────────────────
export async function fetchRecentTransactions(
  limit: number
): Promise<StripeCharge[]> {
  try {
    const params = new URLSearchParams();
    params.set("limit", String(Math.min(limit, 100)));

    const res = await fetch(`${STRIPE_API}/charges?${params.toString()}`, {
      headers: getHeaders(),
    });

    if (!res.ok) {
      console.error(
        `[Stripe] fetchRecentTransactions failed: ${res.status} ${res.statusText}`
      );
      return [];
    }

    const json = await res.json();
    const charges: {
      id: string;
      amount: number;
      currency: string;
      created: number;
      description: string | null;
      status: string;
    }[] = json.data ?? [];

    return charges
      .filter((c) => c.status === "succeeded")
      .map((c) => ({
        id: c.id,
        amount: c.amount,
        currency: c.currency,
        created: c.created,
        description: c.description,
      }));
  } catch (err) {
    console.error("[Stripe] fetchRecentTransactions error:", err);
    return [];
  }
}
