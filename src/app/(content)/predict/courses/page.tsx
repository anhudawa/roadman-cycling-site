"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { CourseCard, type CourseCardData } from "@/components/features/predict";

interface CourseAPIItem {
  slug: string;
  name: string;
  country: string | null;
  region: string | null;
  distanceKm: number;
  elevationGainM: number;
  surfaceSummary: string | null;
  eventDates: string[];
  climbCount: number;
  hcCount: number;
  profile: number[][];
  climbs: {
    startDistance: number;
    endDistance: number;
    length: number;
    averageGradient: number;
    elevationGain: number;
    category: "cat4" | "cat3" | "cat2" | "cat1" | "hc";
  }[];
}

type DistanceFilter = "all" | "short" | "medium" | "long" | "ultra";
type ElevationFilter = "all" | "flat" | "rolling" | "mountainous" | "summit";

const DISTANCE_BUCKETS: { id: DistanceFilter; label: string; min: number; max: number }[] = [
  { id: "all", label: "Any", min: 0, max: 1e9 },
  { id: "short", label: "<100km", min: 0, max: 100 },
  { id: "medium", label: "100-160km", min: 100, max: 160 },
  { id: "long", label: "160-220km", min: 160, max: 220 },
  { id: "ultra", label: "220km+", min: 220, max: 1e9 },
];

const ELEVATION_BUCKETS: {
  id: ElevationFilter;
  label: string;
  min: number;
  max: number;
}[] = [
  { id: "all", label: "Any", min: 0, max: 1e9 },
  { id: "flat", label: "<500m", min: 0, max: 500 },
  { id: "rolling", label: "500-1500m", min: 500, max: 1500 },
  { id: "mountainous", label: "1500-3500m", min: 1500, max: 3500 },
  { id: "summit", label: "3500m+", min: 3500, max: 1e9 },
];

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseAPIItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState<string>("all");
  const [distance, setDistance] = useState<DistanceFilter>("all");
  const [elevation, setElevation] = useState<ElevationFilter>("all");

  useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.courses)) setCourses(data.courses);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const countries = useMemo(() => {
    const set = new Set<string>();
    for (const c of courses) if (c.country) set.add(c.country);
    return Array.from(set).sort();
  }, [courses]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const distBucket = DISTANCE_BUCKETS.find((b) => b.id === distance) ?? DISTANCE_BUCKETS[0];
    const elevBucket = ELEVATION_BUCKETS.find((b) => b.id === elevation) ?? ELEVATION_BUCKETS[0];
    return courses.filter((c) => {
      if (q) {
        const hay = `${c.name} ${c.country ?? ""} ${c.region ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (country !== "all" && c.country !== country) return false;
      if (c.distanceKm < distBucket.min || c.distanceKm > distBucket.max) return false;
      if (c.elevationGainM < elevBucket.min || c.elevationGainM > elevBucket.max) return false;
      return true;
    });
  }, [courses, search, country, distance, elevation]);

  const cards: CourseCardData[] = useMemo(
    () =>
      filtered.map((c) => ({
        slug: c.slug,
        name: c.name,
        country: c.country,
        region: c.region,
        distanceKm: c.distanceKm,
        elevationGainM: c.elevationGainM,
        surfaceSummary: c.surfaceSummary,
        eventDates: c.eventDates,
        profile: c.profile,
        climbCount: c.climbCount,
        hcCount: c.hcCount,
      })),
    [filtered],
  );

  return (
    <>
      <Header />
      <main>
        <Section
          background="deep-purple"
          grain
          className="pt-32 md:pt-40 pb-10 relative overflow-hidden"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute -top-32 left-1/4 w-[500px] h-[500px] rounded-full blur-[140px] opacity-50"
              style={{ background: "radial-gradient(circle, rgba(241,99,99,0.3), transparent 65%)" }}
            />
            <div
              className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-[120px] opacity-50"
              style={{ background: "radial-gradient(circle, rgba(76,18,115,0.6), transparent 65%)" }}
            />
          </div>
          <Container className="relative">
            <div className="flex items-end justify-between flex-wrap gap-4">
              <div>
                <p
                  className="text-[0.65rem] tracking-[0.28em] uppercase text-coral mb-3"
                  style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                >
                  RACE PREDICTOR · CALENDAR
                </p>
                <h1 className="font-heading uppercase tracking-tight text-off-white leading-[0.95] text-[clamp(2.5rem,7vw,5.5rem)] mb-3">
                  Every event in the Roadman calendar
                </h1>
                <p className="text-lg text-off-white/80 max-w-2xl">
                  Curated GranFondos, sportives, and bucket-list events.
                  Predict your finish, plan your pacing, build your race.
                </p>
              </div>
              <Button href="/predict" variant="outline" size="lg">
                Run a prediction →
              </Button>
            </div>
          </Container>
        </Section>

        {/* FILTERS */}
        <Section background="charcoal" className="!py-6 sticky top-0 z-20 backdrop-blur-md bg-charcoal/85 border-b border-white/5">
          <Container>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px] max-w-md">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-subtle"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search Etape, Marmotte, Mallorca…"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-off-white placeholder:text-foreground-subtle focus:border-coral focus:outline-none text-sm"
                />
              </div>

              <FilterPill
                label="Country"
                value={country}
                options={[
                  { id: "all", label: "Any" },
                  ...countries.map((c) => ({ id: c, label: c })),
                ]}
                onChange={setCountry}
              />
              <FilterPill
                label="Distance"
                value={distance}
                options={DISTANCE_BUCKETS.map((b) => ({ id: b.id, label: b.label }))}
                onChange={(v) => setDistance(v as DistanceFilter)}
              />
              <FilterPill
                label="Elevation"
                value={elevation}
                options={ELEVATION_BUCKETS.map((b) => ({ id: b.id, label: b.label }))}
                onChange={(v) => setElevation(v as ElevationFilter)}
              />

              <div
                className="ml-auto text-[0.62rem] tracking-[0.2em] uppercase text-foreground-subtle whitespace-nowrap"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                {loading
                  ? "LOADING…"
                  : `${filtered.length} OF ${courses.length} EVENT${courses.length === 1 ? "" : "S"}`}
              </div>
            </div>
          </Container>
        </Section>

        {/* GRID */}
        <Section background="charcoal" className="!py-10">
          <Container>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-10 text-center">
                <p
                  className="text-[0.65rem] tracking-[0.22em] uppercase text-foreground-subtle mb-3"
                  style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                >
                  NO EVENTS MATCH
                </p>
                <h3 className="font-heading text-2xl uppercase tracking-tight text-off-white mb-2">
                  Reset your filters
                </h3>
                <p className="text-foreground-muted text-sm mb-5">
                  Or upload your own GPX from the predictor.
                </p>
                <Button
                  onClick={() => {
                    setSearch("");
                    setCountry("all");
                    setDistance("all");
                    setElevation("all");
                  }}
                  variant="outline"
                  size="md"
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.map((c) => (
                  <CourseCard key={c.slug} data={c} href={`/predict?course=${c.slug}`} />
                ))}
              </div>
            )}
          </Container>
        </Section>

        {/* CTA */}
        <Section background="deep-purple" grain className="!py-14 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-40"
              style={{ background: "radial-gradient(circle, rgba(241,99,99,0.4), transparent 65%)" }}
            />
          </div>
          <Container className="relative">
            <div className="max-w-3xl">
              <p
                className="text-[0.62rem] tracking-[0.22em] uppercase text-coral mb-3"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                CAN&apos;T FIND IT?
              </p>
              <h2 className="font-heading text-4xl md:text-5xl uppercase tracking-tight text-off-white mb-3 leading-tight">
                Drop your own GPX
              </h2>
              <p className="text-off-white/80 text-lg max-w-2xl mb-5">
                Export from Strava, Komoot, Garmin, or RideWithGPS. We&apos;ll
                predict your finish on any track in under 30 seconds.
              </p>
              <Button href="/predict" size="lg">
                Open the predictor →
              </Button>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}

interface FilterPillProps {
  label: string;
  value: string;
  options: { id: string; label: string }[];
  onChange: (v: string) => void;
}

function FilterPill({ label, value, options, onChange }: FilterPillProps) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <div className="relative flex items-center">
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[0.6rem] tracking-[0.2em] uppercase text-foreground-subtle pointer-events-none"
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        >
          {label}
        </span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-[5.5rem] pr-8 py-2.5 rounded-lg bg-white/5 border border-white/10 text-off-white text-sm hover:border-white/20 focus:border-coral focus:outline-none cursor-pointer appearance-none"
        >
          {options.map((o) => (
            <option key={o.id} value={o.id} className="bg-charcoal text-off-white">
              {o.label}
            </option>
          ))}
        </select>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground-subtle pointer-events-none"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </label>
  );
}

function Skeleton() {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.015] overflow-hidden h-[222px]">
      <div className="h-[80px] bg-gradient-to-b from-deep-purple/20 to-charcoal/0 animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-white/5 rounded animate-pulse w-1/3" />
        <div className="h-5 bg-white/8 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-white/5 rounded animate-pulse w-1/2" />
      </div>
    </div>
  );
}

// Suppress unused Link import warning (used in Button href prop rendering)
void Link;
