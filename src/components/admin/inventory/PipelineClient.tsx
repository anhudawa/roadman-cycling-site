"use client";

import { useState } from "react";
import { FillBar } from "./FillBar";
import { SlotListDrawer } from "./SlotListDrawer";
import {
  formatCurrency,
  formatMonthYear,
  INVENTORY_TYPE_DISPLAY,
} from "./helpers";
import type {
  UtilisationByMonth,
  InventoryType,
  Slot,
  Sponsor,
  Event,
} from "@/lib/inventory";

interface MetricBar {
  revenueBooked: number;
  availableAtRack: number;
  gap: number;
}

interface PipelineProps {
  utilisation: UtilisationByMonth[];
  metrics: MetricBar;
  allSlots: Slot[];
  sponsors: Sponsor[];
  events: Event[];
}

const INVENTORY_TYPES: InventoryType[] = [
  "podcast_preroll",
  "podcast_midroll",
  "podcast_endroll",
  "newsletter_dedicated",
  "newsletter_banner",
  "newsletter_classified",
  "youtube_integration",
];

export function PipelineClient({
  utilisation,
  metrics,
  allSlots,
  sponsors,
  events,
}: PipelineProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState("");
  const [drawerSlots, setDrawerSlots] = useState<Slot[]>([]);
  const [showEvents, setShowEvents] = useState(false);

  function handleCellClick(month: string, type: InventoryType) {
    const monthSlots = allSlots.filter(
      (s) =>
        s.plannedPublishDate.startsWith(month) && s.inventoryType === type,
    );
    setDrawerTitle(
      `${INVENTORY_TYPE_DISPLAY[type]} - ${formatMonthYear(month)}`,
    );
    setDrawerSlots(monthSlots);
    setDrawerOpen(true);
  }

  // Build event band data for overlay
  const eventBands = events.map((event) => {
    const start = event.startDate.slice(0, 7);
    const end = event.endDate.slice(0, 7);
    return { ...event, startMonth: start, endMonth: end };
  });

  return (
    <div className="space-y-6">
      {/* Top metric bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
          <p className="text-[11px] text-foreground-subtle uppercase tracking-wider mb-1">
            Revenue Booked
          </p>
          <p className="text-2xl font-heading text-green-400">
            {formatCurrency(metrics.revenueBooked)}
          </p>
        </div>
        <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
          <p className="text-[11px] text-foreground-subtle uppercase tracking-wider mb-1">
            Available at Rack Rate
          </p>
          <p className="text-2xl font-heading text-foreground-muted">
            {formatCurrency(metrics.availableAtRack)}
          </p>
        </div>
        <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
          <p className="text-[11px] text-foreground-subtle uppercase tracking-wider mb-1">
            Gap (Opportunity)
          </p>
          <p className="text-2xl font-heading text-[var(--color-warn)]">
            {formatCurrency(metrics.gap)}
          </p>
        </div>
      </div>

      {/* Events overlay toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowEvents(!showEvents)}
          className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
            showEvents
              ? "bg-purple/15 text-purple-300 border border-purple/20"
              : "bg-white/5 text-foreground-muted hover:text-off-white border border-white/10"
          }`}
        >
          {showEvents ? "Hide Events" : "Show Events Overlay"}
        </button>
      </div>

      {/* Pipeline grid */}
      <div className="bg-background-elevated border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-3 text-[11px] text-foreground-subtle uppercase tracking-wider font-medium w-48 sticky left-0 bg-background-elevated z-10">
                  Inventory Type
                </th>
                {utilisation.map((u) => (
                  <th
                    key={u.month}
                    className="text-center p-3 text-[11px] text-foreground-subtle uppercase tracking-wider font-medium"
                  >
                    {formatMonthYear(u.month)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Events overlay row */}
              {showEvents && (
                <tr className="border-b border-white/5">
                  <td className="p-3 text-[11px] text-purple-300 uppercase tracking-wider font-medium sticky left-0 bg-background-elevated z-10">
                    Events
                  </td>
                  {utilisation.map((u) => {
                    const monthEvents = eventBands.filter(
                      (e) => e.startMonth <= u.month && e.endMonth >= u.month,
                    );
                    return (
                      <td key={u.month} className="p-2">
                        <div className="space-y-1">
                          {monthEvents.map((e) => (
                            <div
                              key={e.id}
                              className="text-[10px] px-2 py-0.5 rounded bg-purple/15 text-purple-300 border border-purple/20 truncate"
                              title={e.eventName}
                            >
                              {e.eventName}
                            </div>
                          ))}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              )}

              {INVENTORY_TYPES.map((type) => (
                <tr key={type} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="p-3 text-sm text-off-white font-medium sticky left-0 bg-background-elevated z-10">
                    {INVENTORY_TYPE_DISPLAY[type]}
                  </td>
                  {utilisation.map((u) => {
                    const data = u.byType[type];
                    const sold = data.sold + data.held;
                    return (
                      <td key={u.month} className="p-2">
                        <button
                          onClick={() => handleCellClick(u.month, type)}
                          className="w-full p-2 rounded-lg hover:bg-white/5 transition-colors"
                        >
                          <FillBar sold={sold} total={data.total} />
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slot list drawer */}
      <SlotListDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={drawerTitle}
        slots={drawerSlots}
        sponsors={sponsors}
      />
    </div>
  );
}
