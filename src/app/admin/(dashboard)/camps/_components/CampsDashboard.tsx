"use client";

import { useState } from "react";
import Link from "next/link";
import {
  reAutoAssignBooking,
  reassignBooking,
  setBookingStatus,
} from "../actions";
import type { CampSlug } from "@/lib/db/schema";
import type { RoomConfig } from "@/lib/camps/rooms";

export interface CampBookingRow {
  id: number;
  camp: CampSlug;
  name: string;
  email: string;
  phone: string | null;
  singleRoom: boolean;
  dietary: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  medical: string | null;
  heardFrom: string | null;
  status: string;
  createdAt: string;
  // Auto-derived
  roomKey: string | null;
  bedKey: string | null;
  isSingleOccupancy: boolean;
}

interface Props {
  campSlug: CampSlug;
  campLabel: string;
  campDates: string;
  rooms: RoomConfig[];
  bookings: CampBookingRow[];
  capacity: { total: number; taken: number; remaining: number };
  // Sibling tab state
  otherCampSlug: CampSlug;
  otherCampLabel: string;
  otherCapacity: { total: number; taken: number; remaining: number };
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-300 border-amber-500/25",
  confirmed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  waitlist: "bg-purple-500/15 text-purple-300 border-purple-500/25",
  cancelled: "bg-white/5 text-foreground-subtle border-white/10",
};

export function CampsDashboard({
  campSlug,
  campLabel,
  campDates,
  rooms,
  bookings,
  capacity,
  otherCampSlug,
  otherCampLabel,
  otherCapacity,
}: Props) {
  const [reassigning, setReassigning] = useState<number | null>(null);

  const bookingByBed = new Map<string, CampBookingRow>();
  for (const b of bookings) {
    if (b.roomKey && b.bedKey) {
      bookingByBed.set(`${b.roomKey}::${b.bedKey}`, b);
    }
  }

  const unassigned = bookings.filter(
    (b) => !b.roomKey && b.status !== "cancelled",
  );
  const remaining = capacity.remaining;
  const filled = capacity.taken;

  const capacityPct = Math.min(
    100,
    Math.round((capacity.taken / capacity.total) * 100),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-white/10 bg-background-elevated p-0.5 text-[11px]">
          <Link
            href={{ pathname: "/admin/camps", query: { camp: campSlug } }}
            aria-current="page"
            className="px-3 h-8 inline-flex items-center rounded-md font-heading tracking-wider uppercase bg-[var(--color-raised)] text-[var(--color-fg)] shadow-inner"
          >
            {campLabel} · {capacity.taken}/{capacity.total}
          </Link>
          <Link
            href={{ pathname: "/admin/camps", query: { camp: otherCampSlug } }}
            className="px-3 h-8 inline-flex items-center rounded-md font-heading tracking-wider uppercase text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
          >
            {otherCampLabel} · {otherCapacity.taken}/{otherCapacity.total}
          </Link>
        </div>
        <div className="text-foreground-muted text-sm">{campDates}</div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-heading text-xs tracking-[0.3em] uppercase text-foreground-subtle mb-1">
              Capacity
            </p>
            <p className="font-heading text-3xl text-off-white">
              {filled} / {capacity.total} spots filled
            </p>
          </div>
          <div className="text-right">
            <p
              className={`font-heading text-3xl ${
                remaining === 0
                  ? "text-coral"
                  : remaining <= 4
                    ? "text-amber-300"
                    : "text-emerald-300"
              }`}
            >
              {remaining}
            </p>
            <p className="text-xs tracking-[0.2em] uppercase text-foreground-subtle">
              {remaining === 0 ? "SOLD OUT" : "REMAINING"}
            </p>
          </div>
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className={`h-full ${
              capacityPct >= 100
                ? "bg-coral"
                : capacityPct >= 75
                  ? "bg-amber-300"
                  : "bg-emerald-400"
            }`}
            style={{ width: `${capacityPct}%` }}
          />
        </div>
      </div>

      {unassigned.length > 0 && (
        <section>
          <h2 className="font-heading text-coral text-xs tracking-[0.3em] uppercase mb-3">
            Unassigned / waitlist ({unassigned.length})
          </h2>
          <div className="rounded-xl border border-coral/20 bg-coral/[0.04] divide-y divide-white/10">
            {unassigned.map((b) => (
              <UnassignedRow key={b.id} booking={b} campSlug={campSlug} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-heading text-foreground-subtle text-xs tracking-[0.3em] uppercase mb-3">
          Room layout — Can Sagnari
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <RoomCard
              key={room.key}
              room={room}
              bookingByBed={bookingByBed}
              campSlug={campSlug}
              onReassignClick={(b) => setReassigning(b.id)}
              reassigning={reassigning}
              onCancelReassign={() => setReassigning(null)}
              rooms={rooms}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-heading text-foreground-subtle text-xs tracking-[0.3em] uppercase mb-3">
          All bookings ({bookings.length})
        </h2>
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02]">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-foreground-subtle text-xs uppercase tracking-wider">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Single</th>
                <th className="px-4 py-3">Room</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {bookings.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-foreground-muted"
                  >
                    No bookings yet for {campLabel}.
                  </td>
                </tr>
              )}
              {bookings.map((b) => {
                const room = rooms.find((r) => r.key === b.roomKey);
                return (
                  <tr key={b.id}>
                    <td className="px-4 py-3 text-off-white">{b.name}</td>
                    <td className="px-4 py-3 text-foreground-muted">{b.email}</td>
                    <td className="px-4 py-3 text-foreground-muted">
                      {b.singleRoom ? "Yes (+€150)" : "Shared"}
                    </td>
                    <td className="px-4 py-3 text-foreground-muted">
                      {room ? `${room.label} · ${b.bedKey}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] uppercase tracking-wider ${
                          STATUS_COLORS[b.status] ?? STATUS_COLORS.pending
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-foreground-subtle text-xs">
                      {new Date(b.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <BookingActions booking={b} campSlug={campSlug} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// ─── helper components ──────────────────────────────────────────────────────

function RoomCard({
  room,
  bookingByBed,
  campSlug,
  onReassignClick,
  reassigning,
  onCancelReassign,
  rooms,
}: {
  room: RoomConfig;
  bookingByBed: Map<string, CampBookingRow>;
  campSlug: CampSlug;
  onReassignClick: (b: CampBookingRow) => void;
  reassigning: number | null;
  onCancelReassign: () => void;
  rooms: RoomConfig[];
}) {
  const totalSleeps = room.beds.reduce((n, b) => n + b.sleeps, 0);
  const occupied = room.beds.filter((b) =>
    bookingByBed.has(`${room.key}::${b.key}`),
  ).length;

  const reservedTone = room.reservedFor
    ? "border-purple-500/30 bg-purple-500/[0.04]"
    : "";
  const fullTone =
    !room.reservedFor && occupied === room.beds.length && occupied > 0
      ? "border-emerald-500/30 bg-emerald-500/[0.04]"
      : "";

  return (
    <div
      className={`rounded-xl border border-white/10 bg-white/[0.02] p-5 ${reservedTone} ${fullTone}`}
    >
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="font-heading text-off-white text-base tracking-wide">
          {room.label.toUpperCase()}
        </h3>
        <span className="text-xs text-foreground-subtle">
          {occupied}/{room.beds.length} beds · sleeps {totalSleeps}
        </span>
      </div>
      <p className="text-xs text-foreground-muted mb-4">{room.blurb}</p>

      <div className="space-y-2">
        {room.beds.map((bed) => {
          const booking = bookingByBed.get(`${room.key}::${bed.key}`);
          if (room.reservedFor) {
            return (
              <div
                key={bed.key}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-md bg-purple-500/10 border border-purple-500/20"
              >
                <span className="text-xs text-foreground-muted">
                  {bed.label}{" "}
                  <span className="opacity-60">· {bed.type}</span>
                </span>
                <span className="text-xs text-purple-300 font-heading tracking-wider uppercase">
                  Reserved
                </span>
              </div>
            );
          }
          if (!booking) {
            return (
              <div
                key={bed.key}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-md border border-white/5 bg-white/[0.015]"
              >
                <span className="text-xs text-foreground-subtle">
                  {bed.label}{" "}
                  <span className="opacity-60">· {bed.type}</span>
                </span>
                <span className="text-xs text-foreground-subtle font-heading tracking-wider uppercase">
                  Empty
                </span>
              </div>
            );
          }
          return (
            <div
              key={bed.key}
              className={`px-3 py-2 rounded-md border ${
                booking.isSingleOccupancy
                  ? "border-coral/30 bg-coral/[0.04]"
                  : "border-emerald-500/20 bg-emerald-500/[0.03]"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm text-off-white truncate">{booking.name}</p>
                  <p className="text-xs text-foreground-subtle truncate">
                    {bed.label} · {bed.type}
                    {booking.isSingleOccupancy && " · single occupancy"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    reassigning === booking.id
                      ? onCancelReassign()
                      : onReassignClick(booking)
                  }
                  className="text-xs text-foreground-muted hover:text-coral transition-colors px-2"
                  aria-label={
                    reassigning === booking.id
                      ? "Close reassign panel"
                      : `Reassign ${booking.name}`
                  }
                >
                  {reassigning === booking.id ? "✕" : "↔"}
                </button>
              </div>
              {reassigning === booking.id && (
                <ReassignPanel
                  booking={booking}
                  rooms={rooms}
                  campSlug={campSlug}
                  onDone={onCancelReassign}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReassignPanel({
  booking,
  rooms,
  campSlug,
  onDone,
}: {
  booking: CampBookingRow;
  rooms: RoomConfig[];
  campSlug: CampSlug;
  onDone: () => void;
}) {
  const [target, setTarget] = useState("");
  return (
    <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
      <p className="text-[10px] tracking-[0.2em] uppercase text-foreground-subtle">
        Move to
      </p>
      <select
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        className="w-full text-xs bg-white/5 border border-white/15 rounded px-2 py-1 text-off-white"
      >
        <option value="">Pick a bed…</option>
        {rooms
          .filter((r) => !r.reservedFor)
          .map((r) => (
            <optgroup key={r.key} label={r.label}>
              {r.beds.map((b) => (
                <option key={b.key} value={`${r.key}::${b.key}`}>
                  {r.label} · {b.label}
                </option>
              ))}
            </optgroup>
          ))}
      </select>
      <form
        action={async (fd) => {
          await reassignBooking(fd);
          onDone();
        }}
      >
        <input type="hidden" name="bookingId" value={booking.id} />
        <input type="hidden" name="camp" value={campSlug} />
        <input
          type="hidden"
          name="singleRoom"
          value={String(booking.singleRoom)}
        />
        <input type="hidden" name="roomKey" value={target.split("::")[0] ?? ""} />
        <input type="hidden" name="bedKey" value={target.split("::")[1] ?? ""} />
        <button
          type="submit"
          disabled={!target}
          className="mt-2 w-full text-xs font-heading tracking-wider uppercase px-3 py-1.5 rounded bg-coral/90 hover:bg-coral text-off-white disabled:opacity-40"
        >
          Confirm move
        </button>
      </form>
    </div>
  );
}

function UnassignedRow({
  booking,
  campSlug,
}: {
  booking: CampBookingRow;
  campSlug: CampSlug;
}) {
  return (
    <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm text-off-white">
          {booking.name}{" "}
          <span className="text-foreground-subtle text-xs">
            · {booking.email}
          </span>
        </p>
        <p className="text-xs text-foreground-muted">
          {booking.singleRoom ? "Single room (+€150)" : "Shared room"} ·{" "}
          {booking.status}
        </p>
      </div>
      <form action={reAutoAssignBooking}>
        <input type="hidden" name="bookingId" value={booking.id} />
        <input type="hidden" name="camp" value={campSlug} />
        <input
          type="hidden"
          name="singleRoom"
          value={String(booking.singleRoom)}
        />
        <button
          type="submit"
          className="text-xs font-heading tracking-wider uppercase px-3 py-1.5 rounded bg-coral/90 hover:bg-coral text-off-white"
        >
          Try auto-assign
        </button>
      </form>
    </div>
  );
}

function BookingActions({
  booking,
  campSlug,
}: {
  booking: CampBookingRow;
  campSlug: CampSlug;
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      {booking.status !== "confirmed" && (
        <form action={setBookingStatus} className="inline">
          <input type="hidden" name="bookingId" value={booking.id} />
          <input type="hidden" name="status" value="confirmed" />
          <button
            type="submit"
            className="text-[10px] font-heading tracking-wider uppercase px-2 py-1 rounded border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
          >
            Confirm
          </button>
        </form>
      )}
      {booking.status !== "cancelled" && (
        <form action={setBookingStatus} className="inline">
          <input type="hidden" name="bookingId" value={booking.id} />
          <input type="hidden" name="status" value="cancelled" />
          <button
            type="submit"
            className="text-[10px] font-heading tracking-wider uppercase px-2 py-1 rounded border border-white/10 text-foreground-muted hover:text-coral hover:border-coral/30"
          >
            Cancel
          </button>
        </form>
      )}
      {booking.status === "waitlist" && (
        <form action={reAutoAssignBooking} className="inline">
          <input type="hidden" name="bookingId" value={booking.id} />
          <input type="hidden" name="camp" value={campSlug} />
          <input
            type="hidden"
            name="singleRoom"
            value={String(booking.singleRoom)}
          />
          <button
            type="submit"
            className="text-[10px] font-heading tracking-wider uppercase px-2 py-1 rounded border border-coral/30 text-coral hover:bg-coral/10"
          >
            Re-auto
          </button>
        </form>
      )}
    </div>
  );
}
