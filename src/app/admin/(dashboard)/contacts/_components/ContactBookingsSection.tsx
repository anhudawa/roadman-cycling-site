"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { NewBookingForm } from "../../bookings/_components/NewBookingForm";
import type { BookingRow, BookingStatus } from "@/lib/crm/bookings";

function statusClass(status: BookingStatus): string {
  switch (status) {
    case "scheduled":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "completed":
      return "bg-green-500/10 text-green-400 border-green-500/20";
    case "cancelled":
      return "bg-white/5 text-foreground-muted border-white/10";
    case "no_show":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  }
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
}

export function ContactBookingsSection({
  contactId,
  contactName,
  contactEmail,
  currentUserSlug,
}: {
  contactId: number;
  contactName: string | null;
  contactEmail: string;
  currentUserSlug: string;
}) {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/crm/bookings?contactId=${contactId}&limit=50`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [contactId]);

  useEffect(() => {
    load();
  }, [load]);

  const now = Date.now();
  const upcoming = bookings
    .filter((b) => b.status === "scheduled" && new Date(b.scheduledAt).getTime() >= now)
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  const past = bookings
    .filter((b) => b.status !== "scheduled" || new Date(b.scheduledAt).getTime() < now)
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
    .slice(0, 5);

  return (
    <div className="bg-background-elevated rounded-xl border border-white/5 p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] uppercase tracking-widest text-foreground-subtle font-medium">
          Bookings
        </p>
        <NewBookingForm
          currentSlug={currentUserSlug}
          prefilledContact={{ id: contactId, name: contactName, email: contactEmail }}
          triggerLabel="+ Schedule Call"
          triggerClassName="font-body font-semibold text-[13px] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:underline"
          onCreated={load}
        />
      </div>

      {loading ? (
        <p className="text-sm text-foreground-subtle">Loading…</p>
      ) : upcoming.length === 0 && past.length === 0 ? (
        <p className="text-sm text-foreground-subtle">No bookings.</p>
      ) : (
        <div className="space-y-3">
          {upcoming.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-foreground-subtle mb-1.5">
                Upcoming
              </p>
              <ul className="space-y-1.5">
                {upcoming.map((b) => (
                  <BookingLine key={b.id} b={b} />
                ))}
              </ul>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-foreground-subtle mb-1.5">
                Past
              </p>
              <ul className="space-y-1.5">
                {past.map((b) => (
                  <BookingLine key={b.id} b={b} />
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BookingLine({ b }: { b: BookingRow }) {
  return (
    <li>
      <Link
        href={`/admin/bookings/${b.id}`}
        className="flex items-center justify-between gap-3 p-2 rounded-[var(--radius-admin-md)] border border-[var(--color-border)] bg-[var(--color-sunken)] hover:border-[var(--color-border-strong)] hover:bg-white/[0.04] transition"
      >
        <div className="min-w-0">
          <p className="text-sm text-off-white truncate">{b.title}</p>
          <p className="text-[11px] text-foreground-subtle">
            {formatWhen(b.scheduledAt)} · {b.durationMinutes}m · {b.ownerSlug}
          </p>
        </div>
        <span
          className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border shrink-0 ${statusClass(
            b.status
          )}`}
        >
          {b.status.replace("_", " ")}
        </span>
      </Link>
    </li>
  );
}
