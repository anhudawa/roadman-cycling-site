"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { type Race, DIFFICULTY_LABELS, DIFFICULTY_COLORS } from "@/data/races";

interface RaceGridProps {
  races: Race[];
}

const DIFFICULTY_OPTIONS = [
  { value: "", label: "All levels" },
  { value: "1", label: "Accessible (1)" },
  { value: "2", label: "Moderate (2)" },
  { value: "3", label: "Challenging (3)" },
  { value: "4", label: "Hard (4)" },
  { value: "5", label: "Extreme (5)" },
];

const COUNTRY_OPTIONS = [
  { value: "", label: "All countries" },
  { value: "France", label: "France" },
  { value: "Italy", label: "Italy" },
  { value: "Spain", label: "Spain" },
  { value: "England", label: "England" },
  { value: "Wales", label: "Wales" },
  { value: "Ireland", label: "Ireland" },
  { value: "Belgium", label: "Belgium" },
  { value: "Austria", label: "Austria" },
  { value: "USA", label: "USA" },
  { value: "South Africa", label: "South Africa" },
];

function DifficultyDots({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Difficulty ${level} of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`inline-block w-2 h-2 rounded-full ${
            i < level ? "bg-coral" : "bg-white/15"
          }`}
        />
      ))}
    </div>
  );
}

export function RaceGrid({ races }: RaceGridProps) {
  const [difficulty, setDifficulty] = useState("");
  const [country, setCountry] = useState("");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return races.filter((r) => {
      if (difficulty && String(r.difficulty) !== difficulty) return false;
      if (country && !r.country.includes(country)) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          r.name.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q) ||
          r.country.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [races, difficulty, country, search]);

  const selectClass =
    "bg-white/[0.06] border border-white/10 text-off-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-coral/60 transition-colors";

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <input
          type="search"
          placeholder="Search races…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${selectClass} flex-1 min-w-[160px] placeholder:text-foreground-subtle`}
          aria-label="Search races"
        />
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className={selectClass}
          aria-label="Filter by difficulty"
        >
          {DIFFICULTY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className={selectClass}
          aria-label="Filter by country"
        >
          {COUNTRY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {(difficulty || country || search) && (
          <button
            type="button"
            onClick={() => {
              setDifficulty("");
              setCountry("");
              setSearch("");
            }}
            className="text-sm text-foreground-muted hover:text-off-white transition-colors px-2"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Count */}
      <p className="text-foreground-muted text-sm mb-6">
        {filtered.length} {filtered.length === 1 ? "event" : "events"}
        {(difficulty || country || search) && " matching filters"}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-foreground-muted">
          No events match those filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((race) => (
            <Link
              key={race.slug}
              href={`/races/${race.slug}`}
              className="group block rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 transition-all duration-200 p-6"
            >
              {/* Country + difficulty row */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-heading tracking-widest uppercase text-foreground-muted">
                  {race.country}
                </span>
                <DifficultyDots level={race.difficulty} />
              </div>

              {/* Name */}
              <h2 className="font-heading text-xl text-off-white group-hover:text-coral transition-colors leading-tight mb-1">
                {race.name.toUpperCase()}
              </h2>

              {/* Location */}
              <p className="text-foreground-muted text-xs mb-4">{race.location}</p>

              {/* Stats row */}
              <div className="flex gap-4 mb-4">
                <div>
                  <p className="text-coral font-heading text-lg leading-none">
                    {race.distance_km}
                    <span className="text-xs font-body ml-0.5 text-foreground-muted">km</span>
                  </p>
                  <p className="text-[10px] text-foreground-subtle uppercase tracking-wider mt-0.5">
                    Distance
                  </p>
                </div>
                <div>
                  <p className="text-coral font-heading text-lg leading-none">
                    {race.elevation_m.toLocaleString()}
                    <span className="text-xs font-body ml-0.5 text-foreground-muted">m</span>
                  </p>
                  <p className="text-[10px] text-foreground-subtle uppercase tracking-wider mt-0.5">
                    Elevation
                  </p>
                </div>
                <div>
                  <p className={`font-heading text-lg leading-none ${DIFFICULTY_COLORS[race.difficulty]}`}>
                    {DIFFICULTY_LABELS[race.difficulty]}
                  </p>
                  <p className="text-[10px] text-foreground-subtle uppercase tracking-wider mt-0.5">
                    Difficulty
                  </p>
                </div>
              </div>

              {/* Description excerpt */}
              <p className="text-foreground-muted text-sm leading-relaxed line-clamp-3 mb-4">
                {race.description}
              </p>

              {/* CTA */}
              <span className="text-coral text-sm font-medium group-hover:translate-x-0.5 transition-transform inline-block">
                View race guide →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
