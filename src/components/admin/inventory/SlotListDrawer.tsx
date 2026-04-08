"use client";

import { useState, useTransition } from "react";
import { Drawer } from "./Drawer";
import { PositionBadge, InventoryStatusBadge } from "./StatusBadge";
import { formatCurrency } from "./helpers";
import {
  bookSlotAction,
  releaseSlotAction,
  convertHeldToSoldAction,
} from "@/app/admin/inventory/actions";
import type { Slot, Sponsor } from "@/lib/inventory";

export function SlotListDrawer({
  open,
  onClose,
  title,
  slots,
  sponsors,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  slots: Slot[];
  sponsors: Sponsor[];
}) {
  return (
    <Drawer open={open} onClose={onClose} title={title} width="max-w-xl">
      {slots.length === 0 ? (
        <p className="text-foreground-subtle text-sm">No slots in this period.</p>
      ) : (
        <div className="space-y-3">
          {slots.map((slot) => (
            <SlotCard key={slot.id} slot={slot} sponsors={sponsors} />
          ))}
        </div>
      )}
    </Drawer>
  );
}

function SlotCard({ slot, sponsors }: { slot: Slot; sponsors: Sponsor[] }) {
  const [showBooking, setShowBooking] = useState(false);
  const [isPending, startTransition] = useTransition();

  const sponsorName = sponsors.find((s) => s.id === slot.sponsorId)?.brandName;

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <PositionBadge type={slot.inventoryType} />
          <InventoryStatusBadge status={slot.status} />
        </div>
        <span className="text-xs text-foreground-subtle tabular-nums">
          {formatCurrency(slot.rackRate)}
        </span>
      </div>

      <div className="text-sm">
        {sponsorName ? (
          <span className="text-off-white font-medium">{sponsorName}</span>
        ) : (
          <span className="text-foreground-subtle italic">Available</span>
        )}
        {slot.ratePaid && (
          <span className="ml-2 text-green-400 text-xs">
            {formatCurrency(slot.ratePaid)} paid
          </span>
        )}
        {slot.campaignId && (
          <span className="ml-2 text-foreground-subtle text-xs">
            {slot.campaignId}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        {slot.status === "available" && (
          <button
            onClick={() => setShowBooking(!showBooking)}
            className="text-xs px-3 py-1 rounded-md bg-coral/10 text-coral hover:bg-coral/20 transition-colors font-medium"
          >
            Book
          </button>
        )}
        {slot.status === "held" && (
          <>
            <button
              onClick={() => setShowBooking(!showBooking)}
              disabled={isPending}
              className="text-xs px-3 py-1 rounded-md bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors font-medium disabled:opacity-50"
            >
              Convert to Sold
            </button>
            <button
              onClick={() =>
                startTransition(() => releaseSlotAction(slot.id))
              }
              disabled={isPending}
              className="text-xs px-3 py-1 rounded-md bg-white/5 text-foreground-muted hover:bg-white/10 transition-colors font-medium disabled:opacity-50"
            >
              Release
            </button>
          </>
        )}
      </div>

      {/* Booking form */}
      {showBooking && (
        <BookingForm
          slot={slot}
          sponsors={sponsors}
          onClose={() => setShowBooking(false)}
        />
      )}
    </div>
  );
}

function BookingForm({
  slot,
  sponsors,
  onClose,
}: {
  slot: Slot;
  sponsors: Sponsor[];
  onClose: () => void;
}) {
  const [sponsorId, setSponsorId] = useState(slot.sponsorId ?? "");
  const [ratePaid, setRatePaid] = useState(slot.ratePaid ?? slot.rackRate);
  const [campaignId, setCampaignId] = useState(slot.campaignId ?? "");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sponsorId) return;

    startTransition(async () => {
      if (slot.status === "held") {
        await convertHeldToSoldAction(slot.id, ratePaid, campaignId);
      } else {
        await bookSlotAction(slot.id, { sponsorId, ratePaid, campaignId });
      }
      onClose();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t border-white/5">
      <div>
        <label className="text-[11px] text-foreground-subtle uppercase tracking-wider block mb-1">
          Sponsor
        </label>
        <select
          value={sponsorId}
          onChange={(e) => setSponsorId(e.target.value)}
          className="w-full bg-white/[0.03] border border-white/10 rounded-md px-3 py-1.5 text-sm text-off-white"
          required
        >
          <option value="">Select sponsor...</option>
          {sponsors.map((s) => (
            <option key={s.id} value={s.id}>
              {s.brandName}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] text-foreground-subtle uppercase tracking-wider block mb-1">
            Rate (GBP)
          </label>
          <input
            type="number"
            value={ratePaid}
            onChange={(e) => setRatePaid(Number(e.target.value))}
            className="w-full bg-white/[0.03] border border-white/10 rounded-md px-3 py-1.5 text-sm text-off-white"
            min={0}
          />
        </div>
        <div>
          <label className="text-[11px] text-foreground-subtle uppercase tracking-wider block mb-1">
            Campaign ID
          </label>
          <input
            type="text"
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
            placeholder="e.g. TP-Q3-2026"
            className="w-full bg-white/[0.03] border border-white/10 rounded-md px-3 py-1.5 text-sm text-off-white"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending || !sponsorId}
          className="text-xs px-4 py-1.5 rounded-md bg-coral text-off-white hover:bg-coral-hover transition-colors font-medium disabled:opacity-50"
        >
          {isPending ? "Saving..." : slot.status === "held" ? "Convert to Sold" : "Book Slot"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="text-xs px-3 py-1.5 rounded-md bg-white/5 text-foreground-muted hover:bg-white/10 transition-colors font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
