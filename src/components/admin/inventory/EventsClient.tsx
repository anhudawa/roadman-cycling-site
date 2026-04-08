"use client";

import { useState } from "react";
import { FillBar } from "./FillBar";
import {
  formatCurrency,
  formatDate,
  formatMonthYear,
  INVENTORY_TYPE_DISPLAY,
} from "./helpers";
import type {
  Event,
  Slot,
  UtilisationByMonth,
  InventoryType,
} from "@/lib/inventory";

const EVENT_TYPE_LABELS: Record<string, string> = {
  grand_tour: "Grand Tour",
  monument: "Monument",
  classics_block: "Classics",
  world_championship: "Worlds",
  olympics: "Olympics",
  roadman_owned: "Roadman",
  winter: "Winter",
};

const TIER_LABELS: Record<string, string> = {
  "1": "Tier 1 (+15%)",
  "2": "Tier 2 (+10%)",
  "3": "Tier 3 (Flat)",
};

const TIER_COLORS: Record<string, string> = {
  "1": "bg-coral/15 text-coral border-coral/20",
  "2": "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  "3": "bg-white/5 text-foreground-muted border-white/10",
};

const INVENTORY_TYPES: InventoryType[] = [
  "podcast_preroll",
  "podcast_midroll",
  "podcast_endroll",
  "newsletter_dedicated",
  "newsletter_banner",
  "newsletter_classified",
  "youtube_integration",
];

interface EventWithSlots extends Event {
  slots: Slot[];
  soldCount: number;
  availableCount: number;
  bookedRevenue: number;
  potentialRevenue: number;
}

export function EventsClient({
  events,
  allSlots,
  utilisation,
}: {
  events: Event[];
  allSlots: Slot[];
  utilisation: UtilisationByMonth[];
}) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Enrich events with slot data
  const enrichedEvents: EventWithSlots[] = events.map((event) => {
    const eventSlots = allSlots.filter((s) => s.eventId === event.id);
    const soldSlots = eventSlots.filter(
      (s) => s.status === "sold" || s.status === "live",
    );
    const availableSlots = eventSlots.filter(
      (s) => s.status === "available",
    );
    const bookedRevenue = soldSlots.reduce(
      (sum, s) => sum + (s.ratePaid ?? s.rackRate),
      0,
    );
    const potentialRevenue = eventSlots.reduce(
      (sum, s) => sum + s.rackRate,
      0,
    );

    return {
      ...event,
      slots: eventSlots,
      soldCount: soldSlots.length,
      availableCount: availableSlots.length,
      bookedRevenue,
      potentialRevenue,
    };
  });

  // Build event band data for pipeline grid
  const eventBands = enrichedEvents.map((event) => ({
    ...event,
    startMonth: event.startDate.slice(0, 7),
    endMonth: event.endDate.slice(0, 7),
  }));

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-6">
      {/* Left panel: event list */}
      <div className="space-y-3">
        <h3 className="font-heading text-sm text-foreground-muted tracking-wider uppercase">
          Events
        </h3>
        {enrichedEvents.length === 0 ? (
          <p className="text-foreground-subtle text-sm">No events found.</p>
        ) : (
          <div className="space-y-2">
            {enrichedEvents.map((event) => (
              <button
                key={event.id}
                onClick={() =>
                  setSelectedEventId(
                    selectedEventId === event.id ? null : event.id,
                  )
                }
                className={`w-full text-left bg-background-elevated border rounded-xl p-4 transition-colors ${
                  selectedEventId === event.id
                    ? "border-coral/30 bg-coral/[0.03]"
                    : "border-white/5 hover:border-white/10"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="text-sm text-off-white font-medium">
                      {event.eventName}
                    </h4>
                    <p className="text-xs text-foreground-subtle">
                      {formatDate(event.startDate)} -{" "}
                      {formatDate(event.endDate)}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${TIER_COLORS[event.premiumTier]}`}
                  >
                    {TIER_LABELS[event.premiumTier]}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-foreground-subtle">
                    {EVENT_TYPE_LABELS[event.eventType]}
                  </span>
                  <span className="text-foreground-subtle">|</span>
                  <span className="text-off-white tabular-nums">
                    {event.soldCount}/{event.slots.length} sold
                  </span>
                  <span className="text-foreground-subtle">|</span>
                  <span className="text-green-400 tabular-nums">
                    {formatCurrency(event.bookedRevenue)}
                  </span>
                  <span className="text-foreground-subtle">/</span>
                  <span className="text-foreground-muted tabular-nums">
                    {formatCurrency(event.potentialRevenue)}
                  </span>
                </div>

                <div className="mt-2">
                  <FillBar
                    sold={event.soldCount}
                    total={event.slots.length}
                    size="sm"
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right panel: pipeline grid with event bands */}
      <div className="space-y-3">
        <h3 className="font-heading text-sm text-foreground-muted tracking-wider uppercase">
          Pipeline with Event Windows
        </h3>
        <div className="bg-background-elevated border border-white/5 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-3 text-[11px] text-foreground-subtle uppercase tracking-wider font-medium w-40">
                    Type
                  </th>
                  {utilisation.map((u) => (
                    <th
                      key={u.month}
                      className="text-center p-2 text-[11px] text-foreground-subtle uppercase tracking-wider font-medium"
                    >
                      {formatMonthYear(u.month)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Event bands row */}
                <tr className="border-b border-white/5">
                  <td className="p-2 text-[11px] text-purple-300 uppercase tracking-wider font-medium">
                    Events
                  </td>
                  {utilisation.map((u) => {
                    const monthEvents = eventBands.filter(
                      (e) =>
                        e.startMonth <= u.month && e.endMonth >= u.month,
                    );
                    return (
                      <td key={u.month} className="p-1.5">
                        <div className="space-y-1">
                          {monthEvents.map((e) => (
                            <div
                              key={e.id}
                              className={`text-[9px] px-1.5 py-0.5 rounded truncate border ${
                                selectedEventId === e.id
                                  ? "bg-coral/15 text-coral border-coral/20"
                                  : "bg-purple/10 text-purple-300 border-purple/20"
                              }`}
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

                {INVENTORY_TYPES.map((type) => (
                  <tr
                    key={type}
                    className="border-b border-white/[0.03]"
                  >
                    <td className="p-2 text-xs text-off-white font-medium">
                      {INVENTORY_TYPE_DISPLAY[type]}
                    </td>
                    {utilisation.map((u) => {
                      const data = u.byType[type];
                      const sold = data.sold + data.held;
                      return (
                        <td key={u.month} className="p-1.5">
                          <FillBar sold={sold} total={data.total} size="sm" />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
