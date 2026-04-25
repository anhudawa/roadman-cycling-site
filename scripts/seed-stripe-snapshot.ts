import { config } from "dotenv";
import { sql } from "@vercel/postgres";

config({ path: ".env.local" });

async function main() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not set");
  if (!process.env.POSTGRES_URL) throw new Error("POSTGRES_URL not set");

  // $”€$”€ MRR fetch (inlined $€” we can't import the app module from a script
  //    because Next path aliases aren't resolved here without extra tooling).
  const STRIPE_API = "https://api.stripe.com/v1";
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
    params.set("status", "all");
    params.set("limit", "100");
    if (startingAfter) params.set("starting_after", startingAfter);
    const res = await fetch(
      `${STRIPE_API}/subscriptions?${params.toString()}`,
      { headers: { Authorization: `Bearer ${key}` } }
    );
    if (!res.ok) throw new Error(`Stripe ${res.status}`);
    const json = (await res.json()) as {
      data: Array<{
        id: string;
        status: string;
        items?: {
          data?: Array<{
            quantity?: number;
            price?: {
              unit_amount?: number | null;
              recurring?: { interval?: string; interval_count?: number } | null;
            } | null;
          }>;
        };
      }>;
      has_more?: boolean;
    };
    const subs = json.data ?? [];
    if (subs.length === 0) break;
    for (const sub of subs) {
      if (["active", "trialing", "past_due"].includes(sub.status)) {
        let m = 0;
        for (const it of sub.items?.data ?? []) {
          const unit = it.price?.unit_amount ?? 0;
          const qty = it.quantity ?? 1;
          const interval = it.price?.recurring?.interval ?? "month";
          const count = it.price?.recurring?.interval_count ?? 1;
          let months = 1;
          if (interval === "year") months = 12 * count;
          else if (interval === "month") months = count;
          m += (unit * qty) / months;
        }
        m = Math.round(m);
        mrr += m;
        if (sub.status === "active") active++;
        if (sub.status === "trialing") trialing++;
        if (sub.status === "past_due") {
          pastDue++;
          pastDueMrr += m;
        }
        if (sub.items?.data?.[0]?.price?.recurring?.interval === "year")
          annualMrr += m;
      }
    }
    hasMore = !!json.has_more;
    startingAfter = subs[subs.length - 1]?.id ?? null;
    if (!startingAfter) break;
    await new Promise((r) => setTimeout(r, 150));
  }

  // $”€$”€ Trailing 24h charges
  const now = new Date();
  const since = new Date(now.getTime() - 86400000);
  const chargeParams = new URLSearchParams();
  chargeParams.set("created[gte]", String(Math.floor(since.getTime() / 1000)));
  chargeParams.set("created[lte]", String(Math.floor(now.getTime() / 1000)));
  chargeParams.set("limit", "100");
  const chargeRes = await fetch(
    `${STRIPE_API}/charges?${chargeParams.toString()}`,
    { headers: { Authorization: `Bearer ${key}` } }
  );
  let totalRevenueCents = 0;
  let transactionCount = 0;
  if (chargeRes.ok) {
    const cj = (await chargeRes.json()) as {
      data: Array<{ status: string; amount: number }>;
    };
    for (const c of cj.data ?? []) {
      if (c.status === "succeeded") {
        totalRevenueCents += c.amount;
        transactionCount++;
      }
    }
  }

  const today = new Date().toISOString().slice(0, 10);

  // Read previous for deltas
  const prev = await sql.query<{ mrr: number; active: number }>(
    `SELECT mrr_cents AS mrr, active_subscriptions AS active
       FROM stripe_snapshots
      WHERE snapshot_date < $1::date
      ORDER BY snapshot_date DESC
      LIMIT 1`,
    [today]
  );
  const netNewMrrCents = prev.rows[0] ? mrr - Number(prev.rows[0].mrr) : 0;
  const netNewSubs = prev.rows[0] ? active - Number(prev.rows[0].active) : 0;

  await sql.query(
    `INSERT INTO stripe_snapshots
       (snapshot_date, total_revenue_cents, transaction_count, mrr_cents,
        active_subscriptions, trialing_count, past_due_count,
        past_due_mrr_cents, annual_mrr_cents, net_new_mrr_cents, net_new_subs,
        raw_data)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     ON CONFLICT (snapshot_date) DO UPDATE SET
       total_revenue_cents = EXCLUDED.total_revenue_cents,
       transaction_count   = EXCLUDED.transaction_count,
       mrr_cents           = EXCLUDED.mrr_cents,
       active_subscriptions = EXCLUDED.active_subscriptions,
       trialing_count      = EXCLUDED.trialing_count,
       past_due_count      = EXCLUDED.past_due_count,
       past_due_mrr_cents  = EXCLUDED.past_due_mrr_cents,
       annual_mrr_cents    = EXCLUDED.annual_mrr_cents,
       net_new_mrr_cents   = EXCLUDED.net_new_mrr_cents,
       net_new_subs        = EXCLUDED.net_new_subs,
       raw_data            = EXCLUDED.raw_data`,
    [
      today,
      totalRevenueCents,
      transactionCount,
      mrr,
      active,
      trialing,
      pastDue,
      pastDueMrr,
      annualMrr,
      netNewMrrCents,
      netNewSubs,
      JSON.stringify({
        capturedAt: now.toISOString(),
        seededBy: "scripts/seed-stripe-snapshot.ts",
      }),
    ]
  );

  console.log("$œ“ seeded snapshot for", today);
  console.log("  MRR:        $" + (mrr / 100).toFixed(2));
  console.log("  Active:    ", active);
  console.log("  Trialing:  ", trialing);
  console.log("  Past due:  ", pastDue, `($${(pastDueMrr / 100).toFixed(2)})`);
  console.log("  Annual MRR:", `$${(annualMrr / 100).toFixed(2)}`);
  console.log("  Net add:   ", `$${(netNewMrrCents / 100).toFixed(2)} $· ${netNewSubs} subs`);
  console.log("  Day revenue:", `$${(totalRevenueCents / 100).toFixed(2)} over ${transactionCount} txns`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
