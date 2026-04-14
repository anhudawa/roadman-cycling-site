"use client";

import { useState, useCallback } from "react";
import { SponsorDetailDrawer } from "./SponsorDetailDrawer";
import { FillBar } from "./FillBar";
import { MonthPicker } from "@/components/admin/reports/MonthPicker";
import {
  formatCurrency,
  formatDate,
  daysUntil,
  daysSince,
} from "./helpers";
import type { Sponsor, SponsorWithInventory, Slot } from "@/lib/inventory";

type SortKey = "renewalDate" | "lastContact" | "totalValue" | "tier";

const TIER_LABELS: Record<string, string> = {
  spotlight: "Spotlight",
  quarter_starter: "Quarter Starter",
  quarter_standard: "Quarter Standard",
  quarter_premium: "Quarter Premium",
  annual: "Annual",
};

const TIER_COLORS: Record<string, string> = {
  spotlight: "bg-white/5 text-foreground-muted",
  quarter_starter: "bg-blue-500/15 text-blue-400",
  quarter_standard: "bg-blue-500/15 text-blue-400",
  quarter_premium: "bg-purple-500/15 text-purple-300",
  annual: "bg-coral/15 text-coral",
};

function StalenessDot({ days }: { days: number | null }) {
  if (days === null)
    return <span className="w-2 h-2 rounded-full bg-white/10 inline-block" />;
  const color =
    days < 14
      ? "bg-green-400"
      : days < 30
        ? "bg-yellow-400"
        : "bg-red-400";
  return <span className={`w-2 h-2 rounded-full inline-block ${color}`} />;
}

function RenewalBadge({ days }: { days: number | null }) {
  if (days === null) return <span className="text-foreground-subtle">--</span>;
  const color =
    days > 60
      ? "text-green-400"
      : days > 30
        ? "text-yellow-400"
        : "text-red-400";
  return <span className={`text-xs tabular-nums font-medium ${color}`}>{days}d</span>;
}

export function SponsorsClient({
  sponsors,
  slotsMap,
}: {
  sponsors: Sponsor[];
  slotsMap: Record<string, Slot[]>;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("renewalDate");
  const [selectedSponsor, setSelectedSponsor] =
    useState<SponsorWithInventory | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleRowClick = useCallback(
    (sponsor: Sponsor) => {
      const inv = slotsMap[sponsor.id] ?? [];
      setSelectedSponsor({ ...sponsor, inventory: inv });
      setDrawerOpen(true);
    },
    [slotsMap],
  );

  // Sort
  const sorted = [...sponsors].sort((a, b) => {
    switch (sortKey) {
      case "renewalDate": {
        const da = a.renewalDate ?? "9999-12-31";
        const db = b.renewalDate ?? "9999-12-31";
        return da.localeCompare(db);
      }
      case "lastContact": {
        const da = a.lastContact ?? "0000-01-01";
        const db = b.lastContact ?? "0000-01-01";
        return da.localeCompare(db); // oldest first
      }
      case "totalValue":
        return (b.totalValue ?? 0) - (a.totalValue ?? 0);
      case "tier": {
        const order = [
          "annual",
          "quarter_premium",
          "quarter_standard",
          "quarter_starter",
          "spotlight",
        ];
        return (
          order.indexOf(a.tier ?? "spotlight") -
          order.indexOf(b.tier ?? "spotlight")
        );
      }
      default:
        return 0;
    }
  });

  const needsAttention = (s: Sponsor) => {
    const renewal = daysUntil(s.renewalDate);
    const contact = daysSince(s.lastContact);
    return (
      (renewal !== null && renewal < 30) ||
      (contact !== null && contact > 30)
    );
  };

  return (
    <div className="space-y-4">
      {/* Sort controls */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-foreground-subtle uppercase tracking-wider">
          Sort by:
        </span>
        {(
          [
            { key: "renewalDate", label: "Renewal" },
            { key: "lastContact", label: "Last Contact" },
            { key: "totalValue", label: "Value" },
            { key: "tier", label: "Tier" },
          ] as { key: SortKey; label: string }[]
        ).map((s) => (
          <button
            key={s.key}
            onClick={() => setSortKey(s.key)}
            className={`text-xs px-3 py-1 rounded-md transition-colors ${
              sortKey === s.key
                ? "bg-coral/15 text-coral"
                : "bg-white/5 text-foreground-muted hover:text-off-white"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-background-elevated border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-3 text-[11px] text-foreground-subtle uppercase tracking-wider font-medium">
                  Brand
                </th>
                <th className="text-left p-3 text-[11px] text-foreground-subtle uppercase tracking-wider font-medium">
                  Tier
                </th>
                <th className="text-left p-3 text-[11px] text-foreground-subtle uppercase tracking-wider font-medium">
                  Campaign
                </th>
                <th className="text-right p-3 text-[11px] text-foreground-subtle uppercase tracking-wider font-medium">
                  Value
                </th>
                <th className="text-left p-3 text-[11px] text-foreground-subtle uppercase tracking-wider font-medium w-32">
                  Delivery
                </th>
                <th className="text-center p-3 text-[11px] text-foreground-subtle uppercase tracking-wider font-medium">
                  Renewal
                </th>
                <th className="text-center p-3 text-[11px] text-foreground-subtle uppercase tracking-wider font-medium">
                  Contact
                </th>
                <th className="text-left p-3 text-[11px] text-foreground-subtle uppercase tracking-wider font-medium">
                  Notes
                </th>
                <th className="text-left p-3 text-[11px] text-foreground-subtle uppercase tracking-wider font-medium">
                  Report
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((sponsor) => {
                const slots = slotsMap[sponsor.id] ?? [];
                const delivered = slots.filter(
                  (s) => s.status === "live",
                ).length;
                const total = slots.length;
                const attention = needsAttention(sponsor);
                const renewal = daysUntil(sponsor.renewalDate);
                const contact = daysSince(sponsor.lastContact);

                return (
                  <tr
                    key={sponsor.id}
                    onClick={() => handleRowClick(sponsor)}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] cursor-pointer transition-colors"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-off-white font-medium">
                          {sponsor.brandName}
                        </span>
                        {attention && (
                          <span className="w-2 h-2 rounded-full bg-coral animate-pulse" />
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      {sponsor.tier && (
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${TIER_COLORS[sponsor.tier]}`}
                        >
                          {TIER_LABELS[sponsor.tier]}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-xs text-foreground-muted">
                      {sponsor.contractStart && sponsor.contractEnd
                        ? `${formatDate(sponsor.contractStart)} - ${formatDate(sponsor.contractEnd)}`
                        : "--"}
                    </td>
                    <td className="p-3 text-right text-sm text-off-white tabular-nums">
                      {sponsor.totalValue
                        ? formatCurrency(sponsor.totalValue)
                        : "--"}
                    </td>
                    <td className="p-3">
                      <FillBar sold={delivered} total={total} size="sm" />
                    </td>
                    <td className="p-3 text-center">
                      <RenewalBadge days={renewal} />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <StalenessDot days={contact} />
                        <span className="text-xs text-foreground-muted tabular-nums">
                          {contact !== null ? `${contact}d` : "--"}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 max-w-[200px]">
                      <p className="text-xs text-foreground-subtle truncate">
                        {sponsor.notes || "--"}
                      </p>
                    </td>
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <MonthPicker sponsorId={sponsor.id} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <SponsorDetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sponsor={selectedSponsor}
      />
    </div>
  );
}
