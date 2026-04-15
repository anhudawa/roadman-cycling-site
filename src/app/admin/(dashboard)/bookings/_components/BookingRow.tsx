"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { BookingRow as BookingRowType, BookingStatus } from "@/lib/crm/bookings";

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const day2 = new Date(today);
  day2.setDate(day2.getDate() + 2);
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  if (d >= today && d < tomorrow) return `Today ${time}`;
  if (d >= tomorrow && d < day2) return `Tomorrow ${time}`;
  return `${d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} ${time}`;
}

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

export function BookingRow({ booking }: { booking: BookingRowType }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

  async function markCompleted() {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/crm/bookings/${booking.id}/complete`, {
        method: "POST",
      });
      if (res.ok) startTransition(() => router.refresh());
    } finally {
      setBusy(false);
    }
  }

  const isPast = new Date(booking.scheduledAt).getTime() < Date.now();

  return (
    <li
      className={`group flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-background-deep/40 hover:border-coral/30 transition-colors ${
        busy || pending ? "opacity-60" : ""
      }`}
    >
      <div className="w-20 shrink-0">
        <p className="text-xs uppercase tracking-wider text-foreground-subtle">
          {formatDateTime(booking.scheduledAt)}
        </p>
        <p className="text-[10px] text-foreground-subtle mt-0.5">
          {booking.durationMinutes}m
        </p>
      </div>
      <div className="flex-1 min-w-0">
        <Link
          href={`/admin/bookings/${booking.id}`}
          className="text-sm text-off-white hover:text-coral block truncate"
        >
          {booking.title}
        </Link>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-foreground-muted">
          {booking.contactId ? (
            <Link
              href={`/admin/contacts/${booking.contactId}`}
              className="hover:text-coral truncate"
            >
              {booking.contactName ?? booking.contactEmail}
            </Link>
          ) : (
            <span className="text-foreground-subtle">No contact</span>
          )}
          {booking.location && (
            <>
              <span className="text-foreground-subtle">·</span>
              <span className="truncate">{booking.location}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span
          className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${statusClass(
            booking.status
          )}`}
        >
          {booking.status.replace("_", " ")}
        </span>
        <span
          className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-coral/10 text-coral text-[11px] font-bold capitalize"
          title={booking.ownerSlug}
        >
          {booking.ownerSlug.charAt(0).toUpperCase()}
        </span>
        {booking.status === "scheduled" && isPast && (
          <button
            type="button"
            onClick={markCompleted}
            disabled={busy}
            className="text-[10px] uppercase tracking-wider px-2 py-1 rounded border border-coral/30 text-coral hover:bg-coral/10"
          >
            Mark done
          </button>
        )}
      </div>
    </li>
  );
}
