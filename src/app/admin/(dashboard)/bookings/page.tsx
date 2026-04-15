import Link from "next/link";
import { requireAuth } from "@/lib/admin/auth";
import {
  listBookings,
  BOOKING_STATUSES,
  type BookingStatus,
  type BookingRow as BookingRowType,
} from "@/lib/crm/bookings";
import { NewBookingForm } from "./_components/NewBookingForm";
import { BookingRow } from "./_components/BookingRow";

export const dynamic = "force-dynamic";

const SCOPE_OPTIONS = [
  { value: "mine", label: "Mine" },
  { value: "all", label: "All" },
];

function linkFor(base: Record<string, string>, override: Record<string, string>): string {
  const merged = { ...base, ...override };
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v) p.set(k, v);
  }
  const s = p.toString();
  return s ? `/admin/bookings?${s}` : "/admin/bookings";
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfToday(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireAuth();
  const sp = await searchParams;

  const scope = (typeof sp.scope === "string" ? sp.scope : "mine") === "all" ? "all" : "mine";
  const statusRaw = typeof sp.status === "string" ? sp.status : "";
  const status: BookingStatus | undefined =
    statusRaw && (BOOKING_STATUSES as string[]).includes(statusRaw)
      ? (statusRaw as BookingStatus)
      : undefined;

  const ownerSlug = scope === "mine" ? user.slug : undefined;

  const todayStart = startOfToday();
  const todayEnd = endOfToday();
  const sevenDays = new Date(todayEnd.getTime() + 7 * 86_400_000);
  const fourteenDaysAgo = new Date(todayStart.getTime() - 14 * 86_400_000);

  const [todayBookings, upcomingBookings, pastBookings] = await Promise.all([
    listBookings({ ownerSlug, status, after: todayStart, before: todayEnd, limit: 100 }),
    listBookings({ ownerSlug, status, after: todayEnd, before: sevenDays, limit: 100 }),
    listBookings({ ownerSlug, status, after: fourteenDaysAgo, before: todayStart, limit: 100 }),
  ]);

  // Past should show most recent first
  const pastSorted = [...pastBookings].sort(
    (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
  );

  const base = { scope, status: status ?? "" };

  return (
    <div>
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-heading text-2xl text-off-white tracking-wider">BOOKINGS</h1>
          <p className="text-sm text-foreground-muted mt-1">
            Scheduled calls and meetings
          </p>
        </div>
        <NewBookingForm currentSlug={user.slug} />
      </div>

      {/* Scope tabs */}
      <div className="flex gap-1 mb-4 border-b border-white/5">
        {SCOPE_OPTIONS.map((s) => {
          const active = scope === s.value;
          return (
            <Link
              key={s.value}
              href={linkFor(base, { scope: s.value })}
              className={`px-4 py-2 text-sm font-heading tracking-wider border-b-2 -mb-px transition-colors ${
                active
                  ? "border-coral text-off-white"
                  : "border-transparent text-foreground-muted hover:text-off-white"
              }`}
            >
              {s.label.toUpperCase()}
            </Link>
          );
        })}
      </div>

      {/* Status chips */}
      <div className="flex flex-wrap gap-2 mb-6 text-xs">
        <span className="text-foreground-subtle uppercase tracking-widest self-center">
          Status:
        </span>
        <Link
          href={linkFor(base, { status: "" })}
          className={`px-2 py-1 rounded border ${
            !status
              ? "border-coral/40 bg-coral/10 text-coral"
              : "border-white/10 text-foreground-muted hover:border-white/20"
          }`}
        >
          All
        </Link>
        {BOOKING_STATUSES.map((s) => (
          <Link
            key={s}
            href={linkFor(base, { status: s })}
            className={`px-2 py-1 rounded border capitalize ${
              status === s
                ? "border-coral/40 bg-coral/10 text-coral"
                : "border-white/10 text-foreground-muted hover:border-white/20"
            }`}
          >
            {s.replace("_", " ")}
          </Link>
        ))}
      </div>

      <Section title="Today" rows={todayBookings} empty="Nothing scheduled today." />
      <Section
        title="Upcoming (next 7 days)"
        rows={upcomingBookings}
        empty="No bookings in the next week."
      />
      <Section
        title="Past (last 14 days)"
        rows={pastSorted}
        empty="No bookings in the last 14 days."
      />
    </div>
  );
}

function Section({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: BookingRowType[];
  empty: string;
}) {
  return (
    <div className="mb-8">
      <h2 className="font-heading text-sm tracking-wider uppercase text-foreground-muted mb-3">
        {title} <span className="text-foreground-subtle">({rows.length})</span>
      </h2>
      {rows.length === 0 ? (
        <div className="text-center py-10 text-foreground-subtle bg-background-elevated rounded-xl border border-white/5 text-sm">
          {empty}
        </div>
      ) : (
        <ul className="space-y-2">
          {rows.map((b) => (
            <BookingRow key={b.id} booking={b} />
          ))}
        </ul>
      )}
    </div>
  );
}
