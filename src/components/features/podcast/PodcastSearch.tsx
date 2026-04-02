"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui";
import { type ContentPillar, CONTENT_PILLARS } from "@/types";

interface EpisodeSearchItem {
  slug: string;
  title: string;
  episodeNumber: number;
  guest?: string;
  guestCredential?: string;
  description: string;
  publishDate: string;
  duration: string;
  pillar: ContentPillar;
  type: string;
}

interface PodcastSearchProps {
  episodes: EpisodeSearchItem[];
}

export function PodcastSearch({ episodes }: PodcastSearchProps) {
  const [query, setQuery] = useState("");
  const [pillarFilter, setPillarFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");

  const filtered = useMemo(() => {
    let results = episodes;

    if (pillarFilter) {
      results = results.filter((ep) => ep.pillar === pillarFilter);
    }

    if (typeFilter) {
      results = results.filter((ep) => ep.type === typeFilter);
    }

    if (query.trim()) {
      const terms = query.toLowerCase().trim().split(/\s+/).filter(t => t.length > 1);

      // Score-based search: title 10x, guest 8x, description 2x
      const scored = results.map((ep) => {
        let score = 0;
        const titleLower = ep.title.toLowerCase();
        const guestLower = (ep.guest || "").toLowerCase();
        const descLower = ep.description.toLowerCase();

        for (const term of terms) {
          if (titleLower.includes(term)) score += 10;
          if (guestLower.includes(term)) score += 8;
          if (descLower.includes(term)) score += 2;
          // Exact word match bonus
          if (titleLower.split(/\s+/).includes(term)) score += 5;
        }

        return { ep, score };
      });

      results = scored
        .filter((s) => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((s) => s.ep);
    }

    return results;
  }, [episodes, query, pillarFilter, typeFilter]);

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="search"
          placeholder="Search episodes, guests, topics..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="
            w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4
            text-off-white text-lg placeholder:text-foreground-subtle
            focus:border-coral focus:outline-none transition-colors
          "
          style={{ transitionDuration: "var(--duration-fast)" }}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setPillarFilter("")}
            className={`px-4 py-2 rounded-full text-sm font-body transition-colors cursor-pointer ${
              !pillarFilter
                ? "bg-coral text-off-white"
                : "bg-white/5 text-foreground-muted hover:bg-white/10"
            }`}
          >
            All
          </button>
          {(Object.keys(CONTENT_PILLARS) as ContentPillar[]).map((key) => (
            <button
              key={key}
              onClick={() => setPillarFilter(pillarFilter === key ? "" : key)}
              className={`px-4 py-2 rounded-full text-sm font-body transition-colors cursor-pointer ${
                pillarFilter === key
                  ? "bg-coral text-off-white"
                  : "bg-white/5 text-foreground-muted hover:bg-white/10"
              }`}
            >
              {CONTENT_PILLARS[key].label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {(
            [
              ["interview", "Interviews"],
              ["solo", "Solo"],
              ["panel", "Panel"],
              ["sarah-anthony", "Sarah & Anthony"],
            ] as const
          ).map(([type, label]) => (
            <button
              key={type}
              onClick={() => setTypeFilter(typeFilter === type ? "" : type)}
              className={`px-3 py-1.5 rounded-full text-xs font-body transition-colors cursor-pointer ${
                typeFilter === type
                  ? "bg-purple text-off-white"
                  : "bg-white/5 text-foreground-subtle hover:bg-white/10"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Result count */}
      <p className="text-sm text-foreground-subtle mb-4 text-center">
        {filtered.length} episode{filtered.length !== 1 ? "s" : ""}
        {query && ` matching "${query}"`}
      </p>

      {/* Episode List */}
      <div className="space-y-3">
        {filtered.map((episode) => (
          <Link
            key={episode.slug}
            href={`/podcast/${episode.slug}`}
            className="
              block p-5 md:p-6 bg-background-elevated rounded-lg border border-white/5
              hover:border-white/10 hover:shadow-[var(--shadow-card)] hover:-translate-y-0.5
              transition-all group
            "
            style={{ transitionDuration: "var(--duration-normal)" }}
          >
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Episode Number */}
              <div className="shrink-0 w-14 h-14 rounded-lg bg-deep-purple flex items-center justify-center">
                <span className="font-heading text-xl text-coral">
                  {episode.episodeNumber}
                </span>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge pillar={episode.pillar} />
                  <span className="text-xs text-foreground-subtle capitalize">
                    {episode.type.replace("-", " & ")}
                  </span>
                </div>
                <h2 className="font-heading text-lg md:text-xl text-off-white group-hover:text-coral transition-colors leading-tight">
                  {episode.title.toUpperCase()}
                </h2>
                {episode.guest && (
                  <p className="text-sm text-foreground-muted mt-1">
                    with {episode.guest}
                    {episode.guestCredential && (
                      <span className="text-foreground-subtle">
                        {" "}
                        &mdash; {episode.guestCredential}
                      </span>
                    )}
                  </p>
                )}
              </div>

              {/* Duration & Date */}
              <div className="shrink-0 text-right">
                <p className="font-heading text-lg text-off-white">
                  {episode.duration}
                </p>
                <p className="text-xs text-foreground-subtle">
                  {new Date(episode.publishDate).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </Link>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-foreground-muted text-lg">
              No episodes found. Try a different search or filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
