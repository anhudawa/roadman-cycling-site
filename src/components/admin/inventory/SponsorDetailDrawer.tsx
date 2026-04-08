"use client";

import { useState, useTransition, useCallback } from "react";
import { Drawer } from "./Drawer";
import { InventoryStatusBadge, PositionBadge } from "./StatusBadge";
import { formatCurrency, formatDate, daysUntil, daysSince } from "./helpers";
import { updateSponsorFieldAction } from "@/app/admin/inventory/actions";
import type { SponsorWithInventory } from "@/lib/inventory";

function EditableField({
  label,
  value,
  field,
  sponsorId,
  type = "text",
}: {
  label: string;
  value: string | number | null;
  field: string;
  sponsorId: string;
  type?: "text" | "date" | "number" | "textarea";
}) {
  const [localValue, setLocalValue] = useState(value ?? "");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const handleBlur = useCallback(() => {
    const newVal =
      type === "number" ? Number(localValue) || null : localValue || null;
    if (String(newVal ?? "") !== String(value ?? "")) {
      startTransition(async () => {
        await updateSponsorFieldAction(sponsorId, field, newVal as string | number | null);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      });
    }
  }, [localValue, value, sponsorId, field, type]);

  const baseClass =
    "w-full bg-white/[0.03] border border-white/10 rounded-md px-3 py-1.5 text-sm text-off-white focus:border-coral/30 focus:ring-1 focus:ring-coral/20 outline-none transition-colors";

  return (
    <div>
      <label className="flex items-center gap-2 text-[11px] text-foreground-subtle uppercase tracking-wider mb-1">
        {label}
        {isPending && (
          <span className="text-foreground-subtle normal-case">saving...</span>
        )}
        {saved && !isPending && (
          <span className="text-green-400 normal-case">saved</span>
        )}
      </label>
      {type === "textarea" ? (
        <textarea
          value={localValue as string}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          rows={3}
          className={`${baseClass} resize-y`}
        />
      ) : (
        <input
          type={type}
          value={localValue as string}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          className={baseClass}
        />
      )}
    </div>
  );
}

export function SponsorDetailDrawer({
  open,
  onClose,
  sponsor,
}: {
  open: boolean;
  onClose: () => void;
  sponsor: SponsorWithInventory | null;
}) {
  if (!sponsor) return null;

  const renewalDays = daysUntil(sponsor.renewalDate);
  const contactDays = daysSince(sponsor.lastContact);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={sponsor.brandName}
      width="max-w-xl"
    >
      <div className="space-y-6">
        {/* Alert badges */}
        <div className="flex flex-wrap gap-2">
          {renewalDays !== null && renewalDays < 30 && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20">
              Renewal in {renewalDays} days
            </span>
          )}
          {contactDays !== null && contactDays > 30 && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/20">
              Last contact {contactDays} days ago
            </span>
          )}
        </div>

        {/* Editable fields */}
        <div className="grid grid-cols-2 gap-4">
          <EditableField
            label="Contact Name"
            value={sponsor.contactName}
            field="contactName"
            sponsorId={sponsor.id}
          />
          <EditableField
            label="Contact Email"
            value={sponsor.contactEmail}
            field="contactEmail"
            sponsorId={sponsor.id}
          />
          <EditableField
            label="Contract Start"
            value={sponsor.contractStart}
            field="contractStart"
            sponsorId={sponsor.id}
            type="date"
          />
          <EditableField
            label="Contract End"
            value={sponsor.contractEnd}
            field="contractEnd"
            sponsorId={sponsor.id}
            type="date"
          />
          <EditableField
            label="Total Value (GBP)"
            value={sponsor.totalValue}
            field="totalValue"
            sponsorId={sponsor.id}
            type="number"
          />
          <EditableField
            label="Renewal Date"
            value={sponsor.renewalDate}
            field="renewalDate"
            sponsorId={sponsor.id}
            type="date"
          />
          <EditableField
            label="Last Contact"
            value={sponsor.lastContact}
            field="lastContact"
            sponsorId={sponsor.id}
            type="date"
          />
        </div>

        <EditableField
          label="Notes"
          value={sponsor.notes}
          field="notes"
          sponsorId={sponsor.id}
          type="textarea"
        />

        {/* Assigned slots */}
        <div>
          <h3 className="font-heading text-sm text-foreground-muted tracking-wider uppercase mb-3">
            Assigned Slots ({sponsor.inventory.length})
          </h3>
          {sponsor.inventory.length === 0 ? (
            <p className="text-foreground-subtle text-sm">No slots assigned.</p>
          ) : (
            <div className="space-y-2">
              {sponsor.inventory.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between gap-2 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <PositionBadge type={slot.inventoryType} />
                    <span className="text-xs text-foreground-muted">
                      {formatDate(slot.plannedPublishDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <InventoryStatusBadge status={slot.status} />
                    {slot.ratePaid && (
                      <span className="text-xs text-green-400 tabular-nums">
                        {formatCurrency(slot.ratePaid)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
