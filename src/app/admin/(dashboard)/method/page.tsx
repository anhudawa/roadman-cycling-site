import Link from "next/link";
import { requireAuth } from "@/lib/admin/auth";
import { maskEmail } from "@/lib/admin/events-store";
import {
  getMethodAdminStats,
  listMethodEnrollmentsForAdmin,
  type MethodAdminRow,
} from "@/lib/method/admin-queries";
import { Card, CardBody, PageHeader, Pill, StatTile } from "@/components/admin/ui";

/**
 * Admin ops view for The Roadman Method.
 *
 * Surfaces enrollments joined with course progress and the rider's
 * onboarding plan selection so the team can fulfil Premium TrainingPeaks
 * plans, spot graduates ready to ascend into Not Done Yet, and triage the
 * funnel. Read-only; per-row fulfilment actions can layer on later.
 */

export const dynamic = "force-dynamic";

const STATUS_FILTERS: Array<{ value: string; label: string }> = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "refunded", label: "Refunded" },
  { value: "cancelled", label: "Cancelled" },
];

function formatMoney(cents: number, currency = "usd"): string {
  const major = (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2);
  switch (currency.toLowerCase()) {
    case "eur":
      return `€${major}`;
    case "gbp":
      return `£${major}`;
    default:
      return `$${major}`;
  }
}

function statusTone(status: string): "good" | "info" | "warn" | "bad" | "neutral" {
  switch (status) {
    case "active":
      return "good";
    case "pending":
      return "info";
    case "refunded":
      return "warn";
    case "cancelled":
      return "bad";
    default:
      return "neutral";
  }
}

export default async function AdminMethodPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAuth();
  const params = await searchParams;
  const statusFilter = params.status ?? "all";

  const [stats, rows] = await Promise.all([
    getMethodAdminStats(),
    listMethodEnrollmentsForAdmin(statusFilter),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="The Roadman Method"
        subtitle="Enrollments, tier mix, course progress and onboarding plan selections."
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatTile label="Active" value={String(stats.active)} tone="good" />
        <StatTile label="Pending" value={String(stats.pending)} tone="neutral" />
        <StatTile label="Premium" value={String(stats.premium)} tone="neutral" />
        <StatTile label="Graduated" value={String(stats.graduated)} tone="good" />
        <StatTile
          label="Revenue"
          value={formatMoney(stats.revenueCents)}
          tone="neutral"
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {STATUS_FILTERS.map((f) => {
          const active = f.value === statusFilter;
          return (
            <Link
              key={f.value}
              href={`/admin/method?status=${f.value}`}
              className={`h-[28px] px-3 inline-flex items-center rounded-[var(--radius-admin-sm)] border text-[length:var(--text-caption-admin)] font-body font-medium transition-colors ${
                active
                  ? "border-[var(--color-fg)] text-[var(--color-fg)]"
                  : "border-[var(--color-border)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <Card>
        <CardBody compact className="overflow-x-auto">
          {rows.length === 0 ? (
            <p className="text-[var(--color-fg-muted)] text-[length:var(--text-body-sm-admin)] py-6 text-center">
              No enrollments for this filter yet.
            </p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[length:var(--text-caption-admin)] uppercase tracking-wide text-[var(--color-fg-subtle)]">
                  <Th>Rider</Th>
                  <Th>Tier</Th>
                  <Th>Status</Th>
                  <Th>Progress</Th>
                  <Th>Plan selected</Th>
                  <Th>Paid</Th>
                  <Th>Joined</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <Row key={r.id} row={r} />
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="font-medium py-2.5 pr-4 border-b border-[var(--color-border)]">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td className="py-2.5 pr-4 align-top border-b border-[var(--color-border)] text-[length:var(--text-body-sm-admin)] text-[var(--color-fg)]">
      {children}
    </td>
  );
}

function Row({ row }: { row: MethodAdminRow }) {
  const isPremium = row.tier === "premium";
  const graduated = row.completedCount >= row.totalModules;
  return (
    <tr>
      <Td>
        <span className="block text-[var(--color-fg)]">
          {row.name ?? "—"}
        </span>
        <span className="block text-[var(--color-fg-subtle)] font-mono text-[length:var(--text-caption-admin)]">
          {maskEmail(row.email)}
        </span>
      </Td>
      <Td>
        <Pill tone={isPremium ? "good" : "neutral"}>
          {isPremium ? "Premium" : "Standard"}
        </Pill>
      </Td>
      <Td>
        <Pill tone={statusTone(row.status)}>{row.status}</Pill>
      </Td>
      <Td>
        <span className="font-mono tabular-nums">
          {row.completedCount}/{row.totalModules}
        </span>
        {graduated && (
          <Pill tone="good" className="ml-2">
            Graduated
          </Pill>
        )}
      </Td>
      <Td>
        {row.planName ? (
          <>
            <span className="block">{row.planName}</span>
            <span className="block text-[var(--color-fg-subtle)] text-[length:var(--text-caption-admin)]">
              {isPremium ? "Needs TrainingPeaks build" : "Self-serve plan"}
            </span>
          </>
        ) : (
          <span className="text-[var(--color-fg-subtle)]">—</span>
        )}
      </Td>
      <Td>
        {row.amountCents != null
          ? formatMoney(row.amountCents, row.currency)
          : "—"}
      </Td>
      <Td>
        <span className="text-[var(--color-fg-muted)]">
          {(row.paidAt ?? row.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      </Td>
    </tr>
  );
}
