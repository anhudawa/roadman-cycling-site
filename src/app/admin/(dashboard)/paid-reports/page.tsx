import Link from "next/link";
import { requireAuth } from "@/lib/admin/auth";
import { maskEmail } from "@/lib/admin/events-store";
import {
  getPaidReportStats,
  listPaidReportsForAdmin,
} from "@/lib/paid-reports/admin-queries";
import type { PaidReportStatus } from "@/lib/paid-reports/types";
import { PaidReportActions } from "./PaidReportActions";

/**
 * Admin dashboard for the paid-report funnel.
 *
 * Top-line stats $†’ revenue + delivery health. The table is keyed on
 * report id and shows the join of report + order + rider lead score
 * so we can triage failures and spot high-value leads at a glance.
 * Per-row actions (resend / revoke / regenerate) are gated on the
 * current status and routed through server actions.
 */

export const dynamic = "force-dynamic";

const STATUS_FILTERS: Array<{ value: string; label: string }> = [
  { value: "all", label: "All" },
  { value: "delivered", label: "Delivered" },
  { value: "generating", label: "Generating" },
  { value: "generated", label: "Generated" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
  { value: "revoked", label: "Revoked" },
];

function formatMoney(cents: number, currency: string): string {
  const major = (cents / 100).toFixed(2);
  switch (currency.toLowerCase()) {
    case "eur":
      return `$$$${major}`;
    case "gbp":
      return `$$${major}`;
    case "usd":
      return `$${major}`;
    default:
      return `${major} ${currency.toUpperCase()}`;
  }
}

function statusTone(status: PaidReportStatus): "ok" | "warn" | "alert" | "info" {
  switch (status) {
    case "delivered":
    case "generated":
      return "ok";
    case "generating":
    case "payment_confirmed":
    case "pending_payment":
      return "info";
    case "failed":
    case "revoked":
      return "alert";
    case "refunded":
      return "warn";
    default:
      return "info";
  }
}

export default async function AdminPaidReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAuth();
  const { status: rawStatus } = await searchParams;
  const status =
    rawStatus && rawStatus !== "all" ? rawStatus : null;
  const [stats, rows] = await Promise.all([
    getPaidReportStats(),
    listPaidReportsForAdmin({ limit: 100, status }),
  ]);

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-white">Paid Reports</h1>
          <p className="text-sm text-foreground-subtle mt-1">
            Every Stripe checkout, every generated PDF, every delivery.
            Triage failures here, resend to paying riders, or revoke a
            leaked download link.
          </p>
        </div>
        <Link
          href="/admin/diagnostics"
          className="text-sm rounded-md bg-white/5 border border-white/10 text-white hover:bg-white/10 px-3 py-1.5"
        >
          Diagnostics overview $†’
        </Link>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Total reports" value={stats.total} />
        <StatCard label="Delivered" value={stats.delivered} tone="ok" />
        <StatCard label="In flight" value={stats.pending} tone="info" />
        <StatCard label="Failed" value={stats.failed} tone="alert" />
        <StatCard
          label="Revenue (paid)"
          value={formatMoney(stats.revenueCents, "eur")}
          hint="Sum of paid orders, EUR-normalised"
        />
      </section>

      <section className="rounded-md bg-white/5 border border-white/10 p-5">
        <div className="flex items-baseline justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-lg font-semibold text-white">Recent orders</h2>
          <nav className="flex flex-wrap items-center gap-1 text-xs">
            {STATUS_FILTERS.map((f) => {
              const active =
                (f.value === "all" && !status) || status === f.value;
              const href =
                f.value === "all"
                  ? "/admin/paid-reports"
                  : `/admin/paid-reports?status=${f.value}`;
              return (
                <Link
                  key={f.value}
                  href={href}
                  className={
                    active
                      ? "rounded-full bg-white/10 border border-white/30 text-off-white px-3 py-1 font-semibold"
                      : "rounded-full bg-white/5 border border-white/10 text-foreground-muted hover:text-white hover:bg-white/10 px-3 py-1"
                  }
                >
                  {f.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {rows.length === 0 ? (
          <p className="text-sm text-foreground-subtle">
            No paid reports match this filter yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-widest text-foreground-subtle">
                <tr>
                  <th className="py-2 pr-4">When</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Product</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Downloads</th>
                  <th className="py-2 pr-4">Lead</th>
                  <th className="py-2 pr-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rows.map((r) => (
                  <tr key={r.reportId} className="text-foreground-muted">
                    <td className="py-2 pr-4 whitespace-nowrap text-xs">
                      {r.createdAt
                        .toISOString()
                        .slice(0, 16)
                        .replace("T", " ")}
                    </td>
                    <td className="py-2 pr-4 font-mono text-xs text-white">
                      {maskEmail(r.email)}
                    </td>
                    <td className="py-2 pr-4 text-xs">
                      {r.productSlug.replace(/^report_/, "")}
                    </td>
                    <td className="py-2 pr-4 text-xs">
                      {formatMoney(r.amountCents, r.currency)}
                    </td>
                    <td className="py-2 pr-4">
                      <Badge variant={statusTone(r.status)}>{r.status}</Badge>
                      {r.generatorVersion ? (
                        <span className="ml-2 text-[10px] text-foreground-subtle font-mono">
                          {r.generatorVersion}
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2 pr-4 text-xs">{r.downloadCount}</td>
                    <td className="py-2 pr-4 text-xs">
                      {r.riderFirstName ? (
                        <span className="text-off-white">
                          {r.riderFirstName}
                        </span>
                      ) : (
                        <span className="text-foreground-subtle">$€”</span>
                      )}
                      {typeof r.riderLeadScore === "number" ? (
                        <span className="ml-2 text-[10px] tracking-widest text-foreground-subtle">
                          {r.riderLeadScore}
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2 pr-4 text-right whitespace-nowrap">
                      <PaidReportActions
                        reportId={r.reportId}
                        status={r.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "ok" | "warn" | "alert" | "info";
}) {
  const valueCls =
    tone === "ok"
      ? "text-emerald-300"
      : tone === "alert"
      ? "text-red-300"
      : tone === "warn"
      ? "text-yellow-300"
      : tone === "info"
      ? "text-sky-300"
      : "text-white";
  return (
    <div className="rounded-md bg-white/5 border border-white/10 p-5">
      <p className="text-xs uppercase tracking-widest text-foreground-subtle mb-2">
        {label}
      </p>
      <p className={`text-3xl font-semibold ${valueCls}`}>{value}</p>
      {hint && (
        <p className="text-xs text-foreground-subtle mt-2 leading-relaxed">
          {hint}
        </p>
      )}
    </div>
  );
}

function Badge({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: "ok" | "warn" | "alert" | "info";
}) {
  const cls = {
    ok: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    warn: "bg-yellow-500/10 text-yellow-300 border-yellow-500/30",
    alert: "bg-red-500/10 text-red-300 border-red-500/30",
    info: "bg-sky-500/10 text-sky-300 border-sky-500/30",
  }[variant];
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${cls}`}
    >
      {children}
    </span>
  );
}
