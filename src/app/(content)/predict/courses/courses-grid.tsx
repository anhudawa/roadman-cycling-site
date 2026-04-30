"use client";

import { useMemo, useState, useDeferredValue } from "react";
import { CourseCard, type CourseCardData } from "./course-card";

type DistanceFilter = "all" | "sportive" | "fondo" | "epic";
type ElevationFilter = "all" | "flat" | "hilly" | "mountain";
type SortOrder = "default" | "name" | "distance" | "elevation";

interface Props {
  courses: CourseCardData[];
}

/**
 * Client filter island. Owns search/chip state, derives a filtered+sorted
 * list, and renders the grid. Pure-CSS animations on the cards themselves —
 * this component just gates which cards render.
 */
export function CoursesGrid({ courses }: Props) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [country, setCountry] = useState<string>("all");
  const [distance, setDistance] = useState<DistanceFilter>("all");
  const [elevation, setElevation] = useState<ElevationFilter>("all");
  const [sort, setSort] = useState<SortOrder>("default");

  // All countries in the catalog (deduped, alpha-sorted).
  const countryOptions = useMemo(() => {
    const set = new Set<string>();
    for (const c of courses) {
      if (c.country) set.add(c.country);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [courses]);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    let out = courses.filter((c) => {
      if (country !== "all" && c.country !== country) return false;
      if (distance === "sportive" && c.distanceM >= 100_000) return false;
      if (distance === "fondo" && (c.distanceM < 100_000 || c.distanceM >= 180_000))
        return false;
      if (distance === "epic" && c.distanceM < 180_000) return false;
      if (elevation === "flat" && c.elevationGainM >= 1000) return false;
      if (elevation === "hilly" && (c.elevationGainM < 1000 || c.elevationGainM >= 3000))
        return false;
      if (elevation === "mountain" && c.elevationGainM < 3000) return false;
      if (q) {
        const haystack = `${c.name} ${c.country ?? ""} ${c.region ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    if (sort === "name") {
      out = out.slice().sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "distance") {
      out = out.slice().sort((a, b) => b.distanceM - a.distanceM);
    } else if (sort === "elevation") {
      out = out.slice().sort((a, b) => b.elevationGainM - a.elevationGainM);
    }
    return out;
  }, [courses, deferredQuery, country, distance, elevation, sort]);

  const activeFilterCount =
    (country !== "all" ? 1 : 0) +
    (distance !== "all" ? 1 : 0) +
    (elevation !== "all" ? 1 : 0) +
    (query.trim() ? 1 : 0);

  const reset = () => {
    setQuery("");
    setCountry("all");
    setDistance("all");
    setElevation("all");
    setSort("default");
  };

  return (
    <div>
      {/* Sticky filter bar */}
      <div className="sticky top-0 z-20 -mx-5 mb-8 border-b border-white/5 bg-charcoal/85 px-5 py-4 backdrop-blur-md md:-mx-8 md:px-8">
        <div className="flex flex-col gap-4">
          {/* Row 1: search + result count + sort */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <label className="relative block w-full md:max-w-md">
              <span className="sr-only">Search events</span>
              <SearchIcon />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search events, regions, countries…"
                className="w-full rounded-full border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-10 text-sm text-off-white placeholder:text-off-white/60 transition focus:border-coral/60 focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-coral/40"
                aria-label="Search events"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-off-white/50 transition hover:bg-white/10 hover:text-off-white"
                  aria-label="Clear search"
                >
                  <ClearIcon />
                </button>
              )}
            </label>

            <div className="flex items-center gap-3 text-sm">
              <span className="text-off-white/55">
                <span className="font-display text-coral">
                  {filtered.length}
                </span>
                {" / "}
                {courses.length} events
              </span>
              <label className="relative">
                <span className="sr-only">Sort</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOrder)}
                  className="appearance-none rounded-full border border-white/10 bg-white/[0.04] py-1.5 pl-3 pr-8 text-xs text-off-white/80 transition hover:border-white/20 focus:border-coral/60 focus:outline-none focus:ring-2 focus:ring-coral/40"
                >
                  <option value="default">Sort: Featured</option>
                  <option value="name">Sort: Name (A–Z)</option>
                  <option value="distance">Sort: Distance ↓</option>
                  <option value="elevation">Sort: Elevation ↓</option>
                </select>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-off-white/50"
                >
                  &#9662;
                </span>
              </label>
            </div>
          </div>

          {/* Row 2: chip groups */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <ChipGroup label="Distance">
              <Chip
                active={distance === "all"}
                onClick={() => setDistance("all")}
              >
                All
              </Chip>
              <Chip
                active={distance === "sportive"}
                onClick={() => setDistance("sportive")}
              >
                Sportive
                <ChipHint>&lt;100 km</ChipHint>
              </Chip>
              <Chip
                active={distance === "fondo"}
                onClick={() => setDistance("fondo")}
              >
                Fondo
                <ChipHint>100–180 km</ChipHint>
              </Chip>
              <Chip
                active={distance === "epic"}
                onClick={() => setDistance("epic")}
              >
                Epic
                <ChipHint>180 km+</ChipHint>
              </Chip>
            </ChipGroup>

            <ChipGroup label="Elevation">
              <Chip
                active={elevation === "all"}
                onClick={() => setElevation("all")}
              >
                All
              </Chip>
              <Chip
                active={elevation === "flat"}
                onClick={() => setElevation("flat")}
              >
                Flat
                <ChipHint>&lt;1,000 m</ChipHint>
              </Chip>
              <Chip
                active={elevation === "hilly"}
                onClick={() => setElevation("hilly")}
              >
                Hilly
                <ChipHint>1,000–3,000 m</ChipHint>
              </Chip>
              <Chip
                active={elevation === "mountain"}
                onClick={() => setElevation("mountain")}
              >
                Mountain
                <ChipHint>3,000 m+</ChipHint>
              </Chip>
            </ChipGroup>

            {countryOptions.length > 0 && (
              <ChipGroup label="Country">
                <Chip
                  active={country === "all"}
                  onClick={() => setCountry("all")}
                >
                  All
                </Chip>
                {countryOptions.map((c) => (
                  <Chip
                    key={c}
                    active={country === c}
                    onClick={() => setCountry(country === c ? "all" : c)}
                  >
                    {c}
                  </Chip>
                ))}
              </ChipGroup>
            )}

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={reset}
                className="ml-auto inline-flex items-center gap-1 rounded-full border border-coral/40 px-3 py-1 text-xs font-medium uppercase tracking-wide text-coral transition hover:border-coral hover:bg-coral/10"
              >
                Reset filters
                <span className="rounded-full bg-coral/20 px-1.5 py-0.5 text-[10px] leading-none">
                  {activeFilterCount}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid or empty state */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-white/5 bg-white/[0.03] p-10 text-center">
          <p className="font-display text-2xl uppercase tracking-wide text-off-white">
            No matches
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-off-white/60">
            Nothing fits those filters. Try widening distance or elevation —
            or upload your own GPX from the predictor.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-4 inline-block rounded-full bg-coral px-4 py-2 text-sm font-semibold uppercase tracking-wide text-charcoal transition hover:bg-coral-hover"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c, i) => (
            <CourseCard key={c.slug} course={c} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function ChipGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-off-white/70">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-1.5">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition " +
        (active
          ? "border-coral bg-coral text-charcoal shadow-[0_0_0_3px_rgba(241,99,99,0.18)]"
          : "border-white/10 bg-white/[0.03] text-off-white/75 hover:border-white/25 hover:bg-white/[0.07] hover:text-off-white")
      }
    >
      {children}
    </button>
  );
}

function ChipHint({ children }: { children: React.ReactNode }) {
  return (
    <span className="ml-1 text-[10px] font-normal opacity-70">{children}</span>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-off-white/45"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
