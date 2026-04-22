"use client";

import { useState } from "react";
import { PositionBadge, InventoryStatusBadge } from "./StatusBadge";
import { ReadStatusStepper } from "./ReadStatusStepper";
import { ScriptEditor } from "./ScriptEditor";
import { formatDate, formatCurrency } from "./helpers";
import type { Slot, Sponsor } from "@/lib/inventory";

type WindowSize = "7" | "14";
type FilterMode = "all" | "needs_attention" | "sold_only";

interface EpisodeGroup {
  date: string;
  episodeTitle: string | null;
  episodeNumber: number | null;
  slots: (Slot & { sponsorName: string | null })[];
}

export function ThisWeekClient({
  allSlots,
  sponsors,
  isAnthony,
}: {
  allSlots: Slot[];
  sponsors: Sponsor[];
  isAnthony: boolean;
}) {
  const [windowDays, setWindowDays] = useState<WindowSize>("14");
  const [filter, setFilter] = useState<FilterMode>("all");

  // Build sponsor lookup
  const sponsorMap = new Map(sponsors.map((s) => [s.id, s.brandName]));

  // Filter by window
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() + parseInt(windowDays));

  let filteredSlots = allSlots.filter((slot) => {
    const d = new Date(slot.plannedPublishDate + "T00:00:00");
    return d >= now && d <= cutoff;
  });

  // Apply status filter
  if (filter === "needs_attention") {
    filteredSlots = filteredSlots.filter(
      (s) =>
        s.status === "sold" &&
        s.readStatus !== "live" &&
        s.readStatus !== "approved",
    );
  } else if (filter === "sold_only") {
    filteredSlots = filteredSlots.filter(
      (s) => s.status === "sold" || s.status === "live",
    );
  }

  // Group by date + episode
  const groupMap = new Map<string, EpisodeGroup>();
  for (const slot of filteredSlots) {
    const key = `${slot.plannedPublishDate}-${slot.episodeNumber ?? slot.inventoryType}`;
    if (!groupMap.has(key)) {
      groupMap.set(key, {
        date: slot.plannedPublishDate,
        episodeTitle: slot.episodeTitle,
        episodeNumber: slot.episodeNumber,
        slots: [],
      });
    }
    groupMap.get(key)!.slots.push({
      ...slot,
      sponsorName: slot.sponsorId ? (sponsorMap.get(slot.sponsorId) ?? null) : null,
    });
  }

  const groups = [...groupMap.values()].sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  // Group groups by date for display
  const dateGroups = new Map<string, EpisodeGroup[]>();
  for (const g of groups) {
    if (!dateGroups.has(g.date)) dateGroups.set(g.date, []);
    dateGroups.get(g.date)!.push(g);
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 bg-white/5 rounded-lg p-1">
          {(["7", "14"] as WindowSize[]).map((w) => (
            <button
              key={w}
              onClick={() => setWindowDays(w)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                windowDays === w
                  ? "bg-[var(--color-raised)] text-[var(--color-fg)] shadow-inner"
                  : "text-foreground-muted hover:text-off-white"
              }`}
            >
              {w} Days
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-white/5 rounded-lg p-1">
          {(
            [
              { key: "all", label: "All" },
              { key: "needs_attention", label: "Needs Attention" },
              { key: "sold_only", label: "Sold Only" },
            ] as { key: FilterMode; label: string }[]
          ).map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filter === f.key
                  ? "bg-[var(--color-raised)] text-[var(--color-fg)] shadow-inner"
                  : "text-foreground-muted hover:text-off-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grouped slots */}
      {groups.length === 0 ? (
        <div className="bg-background-elevated border border-white/5 rounded-xl p-8 text-center">
          <p className="text-foreground-subtle">
            No episodes found in the next {windowDays} days
            {filter !== "all" ? " matching the current filter" : ""}.
          </p>
        </div>
      ) : (
        [...dateGroups.entries()].map(([date, episodeGroups]) => (
          <div key={date} className="space-y-3">
            <h3 className="font-heading text-sm text-foreground-muted tracking-wider uppercase sticky top-0 bg-charcoal/95 backdrop-blur-sm py-2 z-10">
              {formatDate(date)}
            </h3>
            {episodeGroups.map((group, gi) => (
              <div
                key={`${date}-${gi}`}
                className="bg-background-elevated border border-white/5 rounded-xl p-5 space-y-4"
              >
                {/* Episode header */}
                {group.episodeTitle && (
                  <div className="flex items-center gap-2">
                    {group.episodeNumber && (
                      <span className="text-xs text-foreground-subtle tabular-nums">
                        #{group.episodeNumber}
                      </span>
                    )}
                    <span className="text-sm text-off-white font-medium">
                      {group.episodeTitle}
                    </span>
                  </div>
                )}

                {/* Slots */}
                <div className="space-y-3">
                  {group.slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="border border-white/[0.03] rounded-lg p-4 space-y-3"
                    >
                      {/* Slot header */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <PositionBadge type={slot.inventoryType} />
                          {slot.sponsorName ? (
                            <span className="text-sm text-off-white font-medium">
                              {slot.sponsorName}
                            </span>
                          ) : (
                            <span className="text-sm text-foreground-subtle italic">
                              AVAILABLE
                            </span>
                          )}
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

                      {/* Brief + talking points */}
                      {slot.briefUrl && (
                        <a
                          href={slot.briefUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[var(--color-info)] hover:text-[var(--color-fg)] underline underline-offset-2"
                        >
                          View Brief
                        </a>
                      )}

                      {/* Script editor (only for sold/live podcast slots) */}
                      {slot.status !== "available" &&
                        slot.inventoryType.startsWith("podcast_") && (
                          <ScriptEditor
                            slotId={slot.id}
                            initialScript={slot.scriptText}
                          />
                        )}

                      {/* Read status stepper (podcast only) */}
                      {slot.readStatus &&
                        slot.inventoryType.startsWith("podcast_") && (
                          <ReadStatusStepper
                            slotId={slot.id}
                            currentStatus={slot.readStatus}
                            isAnthony={isAnthony}
                          />
                        )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
