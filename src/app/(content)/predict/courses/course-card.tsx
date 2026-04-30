import Link from "next/link";
import { MiniElevationThumb, type ThumbProfile } from "./mini-elevation-thumb";

/**
 * The slim, serializable shape passed from the server page through the
 * client filter island into the card. We deliberately drop `gpxData`,
 * full `courseData`, and other heavy fields — the catalog only needs to
 * display the card, then link out to `/predict?course=<slug>`.
 */
export interface CourseCardData {
  slug: string;
  name: string;
  country: string | null;
  region: string | null;
  distanceM: number;
  elevationGainM: number;
  climbCount: number;
  hcCount: number;
  cat1Count: number;
  nextEventDate: string | null;
  thumb: ThumbProfile;
}

interface Props {
  course: CourseCardData;
  /** Stagger animation index for the entrance. */
  index?: number;
}

export function CourseCard({ course, index = 0 }: Props) {
  const distanceKm = course.distanceM / 1000;
  const distanceLabel = `${distanceKm.toFixed(0)} km`;
  const elevationLabel = `${course.elevationGainM.toLocaleString("en-GB")} m`;
  const climbsLabel =
    course.climbCount === 0
      ? "Flat"
      : `${course.climbCount} climb${course.climbCount === 1 ? "" : "s"}`;

  const difficultyTier = getDifficultyTier(
    course.distanceM,
    course.elevationGainM,
  );
  const flagEmoji = course.country ? countryToFlag(course.country) : null;

  // Subtle entrance: each card fades up with a small stagger.
  const entranceStyle = {
    animationDelay: `${Math.min(index, 12) * 40}ms`,
  } as React.CSSProperties;

  return (
    <Link
      href={`/predict?course=${course.slug}`}
      prefetch={false}
      className="course-card group relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-coral/50 hover:bg-white/[0.06] hover:shadow-[0_18px_40px_-20px_rgba(241,99,99,0.45)] focus-visible:-translate-y-1 focus-visible:border-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral/60"
      style={entranceStyle}
      aria-label={`Predict your time for ${course.name}`}
    >
      {/* Thumbnail area — gradient elevation profile sits on a darker plinth */}
      <div className="relative h-24 w-full overflow-hidden bg-gradient-to-b from-[#2a0d4a] to-[#190035]">
        {/* Decorative grid pattern behind the chart */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.18] transition-opacity duration-300 group-hover:opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "32px 16px",
          }}
        />
        <div className="absolute inset-0 transition duration-300 group-hover:brightness-125 group-hover:saturate-125">
          <MiniElevationThumb
            profile={course.thumb}
            ariaLabel={`Elevation profile for ${course.name}`}
          />
        </div>

        {/* Top-right difficulty pill */}
        <div className="absolute right-2 top-2 flex items-center gap-1">
          <DifficultyPill tier={difficultyTier} />
        </div>

        {/* Top-left country pill */}
        {course.country && (
          <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-off-white/90 backdrop-blur-sm">
            {flagEmoji && <span aria-hidden="true">{flagEmoji}</span>}
            <span>{course.country}</span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-xl uppercase leading-tight tracking-wide text-off-white transition-colors duration-200 group-hover:text-coral">
              {course.name}
            </h3>
            {course.region && (
              <p className="mt-0.5 truncate text-xs text-off-white/55">
                {course.region}
              </p>
            )}
          </div>
        </div>

        {/* Metric row */}
        <dl className="grid grid-cols-3 gap-2 border-t border-white/5 pt-3 text-xs">
          <Metric label="Distance" value={distanceLabel} />
          <Metric label="Elevation" value={elevationLabel} />
          <Metric label="Climbs" value={climbsLabel} />
        </dl>

        {/* Footer row — next event + CTA */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <p className="truncate text-[11px] uppercase tracking-wide text-off-white/70">
            {course.nextEventDate
              ? `Next: ${course.nextEventDate}`
              : course.hcCount > 0
                ? `${course.hcCount} HC climb${course.hcCount === 1 ? "" : "s"}`
                : course.cat1Count > 0
                  ? `${course.cat1Count} Cat 1 climb${course.cat1Count === 1 ? "" : "s"}`
                  : "Verified course"}
          </p>
          <span className="inline-flex items-center gap-1 whitespace-nowrap text-sm font-semibold text-coral transition-transform duration-200 group-hover:translate-x-1">
            Predict
            <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5">
              &rarr;
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[10px] uppercase tracking-wide text-off-white/70">
        {label}
      </dt>
      <dd className="font-display text-base text-off-white">{value}</dd>
    </div>
  );
}

type DifficultyTier = "flat" | "rolling" | "hilly" | "mountain" | "epic";

function DifficultyPill({ tier }: { tier: DifficultyTier }) {
  const map: Record<DifficultyTier, { label: string; className: string }> = {
    flat: {
      label: "Flat",
      className: "bg-emerald-500/25 text-emerald-200 ring-1 ring-emerald-300/30",
    },
    rolling: {
      label: "Rolling",
      className: "bg-emerald-500/25 text-emerald-100 ring-1 ring-emerald-300/30",
    },
    hilly: {
      label: "Hilly",
      className: "bg-amber-500/25 text-amber-100 ring-1 ring-amber-300/30",
    },
    mountain: {
      label: "Mountain",
      className: "bg-coral/25 text-coral ring-1 ring-coral/40",
    },
    epic: {
      label: "Epic",
      className: "bg-coral/30 text-off-white ring-1 ring-coral/60",
    },
  };
  const { label, className } = map[tier];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide backdrop-blur-sm ${className}`}
    >
      {label}
    </span>
  );
}

function getDifficultyTier(
  distanceM: number,
  elevationM: number,
): DifficultyTier {
  // Hard cases first: epic = long AND mountainous.
  if (distanceM >= 180_000 && elevationM >= 3000) return "epic";
  if (elevationM >= 3000) return "mountain";
  if (elevationM >= 1500) return "hilly";
  if (elevationM >= 600) return "rolling";
  return "flat";
}

/**
 * Best-effort country-name → flag emoji conversion. Falls back to no flag
 * if the country isn't in our small map; we only need the curated catalog
 * to look right.
 */
function countryToFlag(country: string): string | null {
  const map: Record<string, string> = {
    "France": "FR",
    "Italy": "IT",
    "Spain": "ES",
    "Switzerland": "CH",
    "Belgium": "BE",
    "Netherlands": "NL",
    "Germany": "DE",
    "United Kingdom": "GB",
    "UK": "GB",
    "England": "GB",
    "Scotland": "GB",
    "Wales": "GB",
    "Ireland": "IE",
    "United States": "US",
    "USA": "US",
    "US": "US",
    "Canada": "CA",
    "Australia": "AU",
    "New Zealand": "NZ",
    "Portugal": "PT",
    "Austria": "AT",
    "Slovenia": "SI",
    "Norway": "NO",
    "Sweden": "SE",
    "Denmark": "DK",
    "Finland": "FI",
    "Andorra": "AD",
    "Luxembourg": "LU",
    "South Africa": "ZA",
  };
  const code = map[country];
  if (!code) return null;
  // Convert ISO-2 country code to regional indicator emoji.
  return String.fromCodePoint(
    ...code
      .toUpperCase()
      .split("")
      .map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}
