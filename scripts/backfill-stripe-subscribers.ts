import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY not set");
  if (!process.env.POSTGRES_URL) throw new Error("POSTGRES_URL not set");

  // Dynamic import so dotenv is loaded first
  const { syncStripeCustomers } = await import("../src/lib/crm/sync");
  const res = await syncStripeCustomers();
  console.log("sync complete — runId:", res.runId);
  console.log("result:", res.result);

  const { sql } = await import("@vercel/postgres");
  const rows = await sql.query<{
    paid: number;
    trialing: number;
    churned: number;
    has_stripe: number;
  }>(`SELECT
        count(*) FILTER (WHERE paid_at IS NOT NULL)::int AS paid,
        count(*) FILTER (WHERE trial_started_at IS NOT NULL AND paid_at IS NULL)::int AS trialing,
        count(*) FILTER (WHERE churned_at IS NOT NULL)::int AS churned,
        count(*) FILTER (WHERE stripe_customer_id IS NOT NULL)::int AS has_stripe
      FROM subscribers`);
  const r = rows.rows[0];
  console.log("subscribers now:");
  console.log("  paid:       ", r.paid);
  console.log("  trialing:   ", r.trialing);
  console.log("  churned:    ", r.churned);
  console.log("  stripe ids: ", r.has_stripe);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
