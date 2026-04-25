"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, Badge } from "@/components/ui";
import { type ContentPillar, CONTENT_PILLARS } from "@/types";
import type { GuestTag } from "@/lib/guests";

interface GuestCardData {
  name: string;
  slug: string;
  credential?: string;
  episodeCount: number;
  pillars: ContentPillar[];
  tags: GuestTag[];
}

type FilterKey = "all" | ContentPillar | GuestTag;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "coaching", label: "Coaching" },
  { key: "nutrition", label: "Nutrition" },
  { key: "strength", label: "S&C" },
  { key: "recovery", label: "Recovery" },
  { key: "community", label: "Community" },
  { key: "triathlon", label: "Triathlon" },
  { key: "pro-rider", label: "Pro Riders" },
  { key: "ultra-endurance", label: "Ultra" },
  { key: "science", label: "Science" },
];

const PILLAR_KEYS = new Set(["coaching", "nutrition", "strength", "recovery", "community"]);

export function GuestGrid({ guests }: { guests: GuestCardData[] }) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const filtered =
    activeFilter === "all"
      ? guests
      : PILLAR_KEYS.has(activeFilter)
        ? guests.filter((g) => g.pillars.includes(activeFilter as ContentPillar))
        : guests.filter((g) => g.tags.includes(activeFilter as GuestTag));

  return (
    <>
      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 justify-center mb-10" role="group" aria-label="Filter guests by topic">
        {FILTERS.map(({ key, label }) => {
          const isActive = activeFilter === key;
          const pillarColor =
            PILLAR_KEYS.has(key)
              ? CONTENT_PILLARS[key as ContentPillar].color
              : undefined;

          return (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              aria-pressed={isActive}
              className={`
                font-heading text-sm tracking-wider px-5 py-2 rounded-full
                border transition-all duration-200
                ${
                  isActive
                    ? "bg-white/10 border-coral text-off-white"
                    : "bg-transparent border-white/10 text-foreground-subtle hover:border-white/25 hover:text-foreground-muted"
                }
              `}
              style={
                isActive && pillarColor
                  ? { borderColor: `color-mix(in srgb, ${pillarColor} 60%, transparent)` }
                  : undefined
              }
            >
              {label.toUpperCase()}
              {isActive && activeFilter !== "all" && (
                <span className="ml-2 text-foreground-subtle text-xs">
                  {filtered.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Grid $— cards render statically; the earlier per-card ScrollReveal
          wrapper pushed 57 guest cards to opacity:0 in SSR HTML which hid
          them from crawlers and no-JS users. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((guest) => (
          <Link
            key={guest.slug}
            href={`/guests/${guest.slug}`}
            className="block group"
          >
            <Card className="p-6 h-full transition-all group-hover:border-coral/30">
              <div className="flex items-start justify-between mb-3">
                <h2 className="font-heading text-xl text-off-white group-hover:text-coral transition-colors">
                  {guest.name.toUpperCase()}
                </h2>
                <span className="text-xs text-foreground-subtle font-heading whitespace-nowrap ml-3">
                  {guest.episodeCount}{" "}
                  {guest.episodeCount === 1 ? "EP" : "EPS"}
                </span>
              </div>

              {guest.credential && (
                <p className="text-sm text-foreground-muted mb-3 leading-relaxed">
                  {guest.credential}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                {guest.pillars.map((pillar) => (
                  <Badge key={pillar} pillar={pillar} size="sm" />
                ))}
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <p className="text-center text-foreground-subtle py-12">
          No guests found for this topic.
        </p>
      )}
    </>
  );
}
