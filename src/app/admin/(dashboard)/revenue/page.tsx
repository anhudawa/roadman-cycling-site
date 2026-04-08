import {
  fetchRevenueForPeriod,
  fetchRecentTransactions,
  type RevenueSummary,
  type StripeCharge,
} from "@/lib/integrations/stripe";
import { getRevenueSnapshots } from "@/lib/admin/events-store";
import { parseTimeRange } from "@/lib/admin/time-ranges";
import { Suspense } from "react";
import { TimeRangePicker } from "../components/TimeRangePicker";
import { TimeSeriesChart } from "../components/charts/TimeSeriesChart";

function formatCurrency(cents: number, currency = "eur"): string {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function formatDate(unixTimestamp: number): string {
  const d = new Date(unixTimestamp * 1000);
  return d.toLocaleDateString("en-IE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function RevenuePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const rangeParam = typeof resolvedParams.range === "string" ? resolvedParams.range : "30d";
  const { from, to } = parseTimeRange(rangeParam);

  let revenue: RevenueSummary | null = null;
  let recentCharges: StripeCharge[] = [];
  let apiError = false;

  try {
    // Fetch last 30 days of revenue + recent transactions in parallel
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const now = new Date();

    [revenue, recentCharges] = await Promise.all([
      fetchRevenueForPeriod(thirtyDaysAgo, now),
      fetchRecentTransactions(25),
    ]);
  } catch {
    apiError = true;
  }

  let revenueSnapshots: { date: string; revenue: number }[] = [];
  try {
    revenueSnapshots = await getRevenueSnapshots(from, to);
  } catch {
    // DB not available
  }

  const hasTransactions = recentCharges.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl text-off-white tracking-wider">
            REVENUE
          </h1>
          <p className="text-foreground-muted text-sm mt-1">
            {apiError
              ? "Stripe API not configured \u2014 add STRIPE_SECRET_KEY to .env.local"
              : "Data from Stripe"}
          </p>
        </div>
        <Suspense fallback={null}>
          <TimeRangePicker />
        </Suspense>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
          <p className="text-foreground-subtle text-xs uppercase tracking-wider mb-1">
            Total Revenue (30d)
          </p>
          <p className="text-2xl font-heading text-off-white tracking-wide">
            {revenue !== null ? formatCurrency(revenue.totalCents) : "--"}
          </p>
          <p className="text-xs text-foreground-subtle mt-1">
            {revenue !== null
              ? `${revenue.count} successful charge${revenue.count !== 1 ? "s" : ""}`
              : "Connect Stripe to populate"}
          </p>
        </div>
        <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
          <p className="text-foreground-subtle text-xs uppercase tracking-wider mb-1">
            Transactions (30d)
          </p>
          <p className="text-2xl font-heading text-off-white tracking-wide">
            {revenue !== null ? revenue.count.toLocaleString() : "--"}
          </p>
          <p className="text-xs text-foreground-subtle mt-1">
            Successful charges only
          </p>
        </div>
        <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
          <p className="text-foreground-subtle text-xs uppercase tracking-wider mb-1">
            Avg Transaction
          </p>
          <p className="text-2xl font-heading text-off-white tracking-wide">
            {revenue !== null && revenue.count > 0
              ? formatCurrency(Math.round(revenue.totalCents / revenue.count))
              : "--"}
          </p>
          <p className="text-xs text-foreground-subtle mt-1">
            {revenue !== null && revenue.count > 0
              ? "Per successful charge"
              : "Monthly recurring revenue"}
          </p>
        </div>
      </div>

      {/* Revenue trend chart */}
      <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
        <h2 className="font-heading text-sm text-foreground-muted tracking-wider mb-4">
          REVENUE OVER TIME
        </h2>
        {revenueSnapshots.length > 0 ? (
          <TimeSeriesChart
            data={revenueSnapshots}
            dataKeys={[
              { key: "revenue", color: "#E8836B", label: "Revenue ($)" },
            ]}
            height={256}
          />
        ) : (
          <div className="h-64 flex items-center justify-center border border-dashed border-white/10 rounded-lg">
            <p className="text-foreground-subtle text-sm">
              {apiError
                ? "Revenue chart will appear once Stripe is connected"
                : "Revenue data will appear once daily sync begins"}
            </p>
          </div>
        )}
      </div>

      {/* Recent transactions table */}
      <div className="bg-background-elevated border border-white/5 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5">
          <h2 className="font-heading text-sm text-foreground-muted tracking-wider">
            RECENT TRANSACTIONS
            {hasTransactions ? ` (${recentCharges.length})` : ""}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Description
                </th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Amount
                </th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {hasTransactions ? (
                recentCharges.map((charge) => (
                  <tr
                    key={charge.id}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-off-white max-w-xs truncate">
                      {charge.description || "Stripe charge"}
                    </td>
                    <td className="px-4 py-3 text-sm text-off-white text-right tabular-nums font-medium">
                      {formatCurrency(charge.amount, charge.currency)}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground-muted text-right tabular-nums whitespace-nowrap">
                      {formatDate(charge.created)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-8 text-center text-foreground-subtle text-sm"
                  >
                    {apiError
                      ? "Connect Stripe API to sync payment history."
                      : "No transactions found in the last 30 days."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
