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
