import Link from "next/link";
import type { Course, ClimbCategory } from "@/lib/race-predictor/types";
import { CourseMiniProfile } from "./CourseMiniProfile";

export interface CourseCardItem {
  slug: string;
  name: string;
  country: string | null;
  region: string | null;
  distanceM: number;
  elevationGainM: number;
  courseData: Course;
  eventDates: string[] | null;
}

interface Props {
  slug: string;
  name: string;
  country: string | null;
  region: string | null;
  distanceM: number;
  elevationGainM: number;
  course: Course;
  eventDates?: string[] | null;
  href?: string;
  /** Visual highlight for picker selection state. */
  selected?: boolean;
}

/**
 * Visual course card with mini-profile, flag, key stats, hardest-climb pill.
 * Used by /predict/courses (catalog) and inside the form course picker.
 */
export function CourseCard({
  slug,
  name,
  country,
  region,
  distanceM,
  elevationGainM,
  course,
  eventDates,
  href,
  selected = false,
}: Props) {
  const flag = countryFlag(country);
  const distanceKm = distanceM / 1000;
  const climbs = course.climbs.length;
  const hardestClimb = pickHardestClimb(course.climbs.map((c) => c.category));
  const upcoming = nextEventDate(eventDates ?? null);
  const target = href ?? `/predict?course=${slug}`;

  return (
    <Link
      href={target}
      data-track={`course_card_${slug}`}
      className={`group relative block rounded-2xl border overflow-hidden transition-all focus-ring ${
        selected
          ? "border-coral bg-coral/[0.06] shadow-[0_0_24px_rgba(241,99,99,0.18)]"
          : "border-white/8 bg-gradient-to-br from-white/[0.04] to-white/[0.01] hover:border-coral/40 hover:-translate-y-0.5 hover:shadow-[0_18px_60px_-20px_rgba(241,99,99,0.35)]"
      }`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-coral/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
      />
      <div className="relative bg-deep-purple/40 p-3">
        <div className="h-16 rounded-lg bg-black/20 ring-1 ring-white/5 overflow-hidden">
          <CourseMiniProfile course={course} height={64} />
        </div>
        {hardestClimb && (
          <span className="absolute top-4 right-4 bg-deep-purple/85 backdrop-blur-sm border border-coral/40 text-coral text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
            {labelClimb(hardestClimb)}
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h3 className="font-display text-xl leading-tight text-off-white uppercase tracking-wide group-hover:text-coral transition-colors">
            {name}
          </h3>
          {flag && <span className="text-xl shrink-0">{flag}</span>}
        </div>
        <p className="text-off-white/55 text-[11px] uppercase tracking-wider mb-3">
          {region ? region : country ?? ""}
          {region && country ? ` · ${country}` : ""}
        </p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <Stat value={distanceKm.toFixed(distanceKm >= 100 ? 0 : 1)} unit="km" />
          <Stat
            value={elevationGainM.toLocaleString()}
            unit="m up"
            accent="coral"
          />
          <Stat
            value={String(climbs)}
            unit={climbs === 1 ? "climb" : "climbs"}
          />
        </div>
        {upcoming && (
          <p className="text-off-white/45 text-[11px] uppercase tracking-wider mt-3 text-center">
            Next event · {upcoming}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between text-coral text-sm font-medium">
          <span>Predict my time</span>
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>
    </Link>
  );
}

function Stat({
  value,
  unit,
  accent,
}: {
  value: string;
  unit: string;
  accent?: "coral";
}) {
  return (
    <div className="bg-black/20 rounded-md py-2">
      <div
        className={`font-display text-lg leading-none ${
          accent === "coral" ? "text-coral" : "text-off-white"
        }`}
      >
        {value}
      </div>
      <div className="text-off-white/45 text-[10px] uppercase tracking-wider mt-0.5">
        {unit}
      </div>
    </div>
  );
}

const FLAGS: Record<string, string> = {
  France: "🇫🇷",
  Spain: "🇪🇸",
  Italy: "🇮🇹",
  "United Kingdom": "🇬🇧",
  Ireland: "🇮🇪",
  Belgium: "🇧🇪",
  Netherlands: "🇳🇱",
  Germany: "🇩🇪",
  Switzerland: "🇨🇭",
  Austria: "🇦🇹",
  Portugal: "🇵🇹",
  "United States": "🇺🇸",
  Canada: "🇨🇦",
  Australia: "🇦🇺",
};

function countryFlag(country: string | null): string | null {
  if (!country) return null;
  return FLAGS[country] ?? null;
}

const CLIMB_RANK: ClimbCategory[] = ["cat4", "cat3", "cat2", "cat1", "hc"];

function pickHardestClimb(cats: ClimbCategory[]): ClimbCategory | null {
  if (cats.length === 0) return null;
  let hardest = cats[0];
  for (const c of cats) {
    if (CLIMB_RANK.indexOf(c) > CLIMB_RANK.indexOf(hardest)) hardest = c;
  }
  return hardest;
}

function labelClimb(cat: ClimbCategory): string {
  switch (cat) {
    case "cat4":
      return "Cat 4";
    case "cat3":
      return "Cat 3";
    case "cat2":
      return "Cat 2";
    case "cat1":
      return "Cat 1";
    case "hc":
      return "HC";
  }
}

function nextEventDate(dates: string[] | null): string | null {
  if (!dates || dates.length === 0) return null;
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = dates
    .filter((d) => d >= today)
    .sort()
    .at(0);
  return upcoming ?? dates[0] ?? null;
}
