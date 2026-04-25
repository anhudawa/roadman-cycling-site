"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { BookingRow as BookingRowType, BookingStatus } from "@/lib/crm/bookings";
import { Card, CardBody } from "@/components/admin/ui";

const OWNERS = [
  { value: "ted", label: "Ted" },
  { value: "sarah", label: "Sarah" },
  { value: "wes", label: "Wes" },
  { value: "matthew", label: "Matthew" },
];
const DURATIONS = [15, 30, 45, 60, 90];

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 16);
}

export function BookingEditor({
  booking,
  currentUser,
}: {
  booking: BookingRowType;
  currentUser: { slug: string; name: string; role: string };
}) {
  const router = useRouter();
  const [title, setTitle] = useState(booking.title);
  const [scheduledAt, setScheduledAt] = useState(toLocalInput(booking.scheduledAt));
  const [durationMinutes, setDurationMinutes] = useState(booking.durationMinutes);
  const [location, setLocation] = useState(booking.location ?? "");
  const [notes, setNotes] = useState(booking.notes ?? "");
  const [ownerSlug, setOwnerSlug] = useState(booking.ownerSlug);
  const [status, setStatus] = useState<BookingStatus>(booking.status);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const canDelete =
    currentUser.role === "admin" || currentUser.slug === booking.ownerSlug;

  async function save() {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const res = await fetch(`/api/admin/crm/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          scheduledAt: new Date(scheduledAt).toISOString(),
          durationMinutes,
          location: location.trim() || null,
          notes: notes.trim() || null,
          ownerSlug,
          status,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Failed to save");
      } else {
        setMsg("Saved");
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  async function quickStatus(next: BookingStatus) {
    setStatus(next);
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/admin/crm/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const d = await res.json();
        setErr(d.error ?? "Failed");
      } else {
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this booking?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/crm/bookings/${booking.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/admin/bookings");
      } else {
        const d = await res.json();
        setErr(d.error ?? "Failed");
        setBusy(false);
      }
    } catch {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-2 text-xs text-foreground-subtle mb-2">
        <Link href="/admin/bookings" className="hover:text-[var(--color-fg)]">
          $Üê Bookings
        </Link>
      </div>
      <div className="flex items-start justify-between gap-4 mb-6">
        <h1 className="font-heading text-2xl text-off-white tracking-wider">
          {booking.title}
        </h1>
        <div className="flex gap-2">
          {status === "scheduled" && (
            <>
              <button
                type="button"
                onClick={() => quickStatus("completed")}
                disabled={busy}
                className="px-3 py-1.5 text-xs font-heading tracking-wider uppercase rounded border border-green-500/30 text-green-400 hover:bg-green-500/10"
              >
                Mark Completed
              </button>
              <button
                type="button"
                onClick={() => quickStatus("cancelled")}
                disabled={busy}
                className="px-3 py-1.5 text-xs font-heading tracking-wider uppercase rounded border border-white/10 text-foreground-muted hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => quickStatus("no_show")}
                disabled={busy}
                className="px-3 py-1.5 text-xs font-heading tracking-wider uppercase rounded border border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
              >
                No-show
              </button>
            </>
          )}
        </div>
      </div>

      {booking.contactId && (
        <div className="mb-4 p-3 rounded border border-white/5 bg-background-elevated">
          <p className="text-[10px] uppercase tracking-widest text-foreground-subtle mb-1">
            Contact
          </p>
          <Link
            href={`/admin/contacts/${booking.contactId}`}
            className="text-[var(--color-fg)] hover:underline"
          >
            {booking.contactName ?? booking.contactEmail}
          </Link>
        </div>
      )}

      <Card>
        <CardBody className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-widest text-foreground-subtle mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-[var(--color-sunken)] border border-[var(--color-border-strong)] rounded-[var(--radius-admin-md)] text-[var(--color-fg)] focus-ring focus:border-[var(--color-border-focus)]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs uppercase tracking-widest text-foreground-subtle mb-1">
              Scheduled
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--color-sunken)] border border-[var(--color-border-strong)] rounded-[var(--radius-admin-md)] text-[var(--color-fg)] focus-ring focus:border-[var(--color-border-focus)]"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-foreground-subtle mb-1">
              Duration
            </label>
            <select
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 bg-[var(--color-sunken)] border border-[var(--color-border-strong)] rounded-[var(--radius-admin-md)] text-[var(--color-fg)] focus-ring focus:border-[var(--color-border-focus)]"
            >
              {DURATIONS.map((d) => (
                <option key={d} value={d}>
                  {d} min
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-foreground-subtle mb-1">
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3 py-2 bg-[var(--color-sunken)] border border-[var(--color-border-strong)] rounded-[var(--radius-admin-md)] text-[var(--color-fg)] focus-ring focus:border-[var(--color-border-focus)]"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-foreground-subtle mb-1">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 bg-[var(--color-sunken)] border border-[var(--color-border-strong)] rounded-[var(--radius-admin-md)] text-[var(--color-fg)] focus-ring focus:border-[var(--color-border-focus)] resize-y"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs uppercase tracking-widest text-foreground-subtle mb-1">
              Owner
            </label>
            <select
              value={ownerSlug}
              onChange={(e) => setOwnerSlug(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--color-sunken)] border border-[var(--color-border-strong)] rounded-[var(--radius-admin-md)] text-[var(--color-fg)] focus-ring focus:border-[var(--color-border-focus)]"
            >
              {OWNERS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-foreground-subtle mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as BookingStatus)}
              className="w-full px-3 py-2 bg-[var(--color-sunken)] border border-[var(--color-border-strong)] rounded-[var(--radius-admin-md)] text-[var(--color-fg)] focus-ring focus:border-[var(--color-border-focus)]"
            >
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No-show</option>
            </select>
          </div>
        </div>

        {err && <p className="text-[var(--color-bad)] text-sm">{err}</p>}
        {msg && <p className="text-green-400 text-sm">{msg}</p>}

        <div className="flex justify-between pt-2">
          {canDelete ? (
            <button
              type="button"
              onClick={remove}
              disabled={busy}
              className="px-4 py-2 text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-bad)]"
            >
              Delete
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={save}
            disabled={busy}
            className="px-4 py-2 bg-[var(--color-elevated)] hover:bg-[var(--color-raised)] disabled:opacity-50 text-[var(--color-fg)] border border-[var(--color-border-strong)] font-body font-semibold text-[14px] rounded-[var(--radius-admin-md)]"
          >
            {busy ? "Saving..." : "Save"}
          </button>
        </div>
        </CardBody>
      </Card>
    </div>
  );
}
