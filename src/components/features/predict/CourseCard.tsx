import Link from "next/link";
import { CourseElevationMini } from "./CourseElevationMini";

export interface CourseCardData {
  slug: string;
  name: string;
  country: string | null;
  region: string | null;
  distanceKm: number;
  elevationGainM: number;
  surfaceSummary: string | null;
  eventDates: string[];
  /** Compact `[[distM, elevM], ...]` elevation profile for the thumbnail. */
  profile: number[][];
  climbCount: number;
  hcCount: number;
}

interface CourseCardProps {
  data: CourseCardData;
  selected?: boolean;
  onSelect?: () => void;
  /** When set, renders an <a> link instead of a selectable button. */
  href?: string;
}

function formatDate(d?: string): string | null {
  if (!d) return null;
  try {
    const date = new Date(d);
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return d;
  }
}

function surfaceLabel(s: string | null): string | null {
  if (!s) return null;
  if (s.startsWith("tarmac")) return "Tarmac";
  if (s.startsWith("gravel")) return "Gravel";
  if (s === "cobbles") return "Cobbles";
  if (s === "chip_seal") return "Chipseal";
  return s;
}

export function CourseCard({ data, selected, onSelect, href }: CourseCardProps) {
  const inner = (
    <div className="relative h-full flex flex-col">
      {/* Elevation strip across the top — visual hook */}
      <div className="relative bg-gradient-to-b from-deep-purple/40 to-charcoal/0 px-5 pt-5 pb-3">
        <CourseElevationMini
          profile={data.profile}
          width={300}
          height={56}
          className="w-full"
          ariaLabel={`Elevation profile of ${data.name}`}
        />
      </div>

      <div className="px-5 pb-5 pt-1 flex-1 flex flex-col">
        {/* Country tag */}
        <div className="flex items-center gap-2 mb-2">
          {data.country && (
            <span
              className="inline-flex items-center gap-1.5 text-[0.65rem] tracking-[0.18em] uppercase text-off-white/70"
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            >
              <span className="block w-1.5 h-1.5 rounded-full bg-coral" />
              {data.country}
              {data.region ? ` · ${data.region}` : ""}
            </span>
          )}
        </div>

        <h3 className="font-heading text-[1.5rem] leading-tight text-off-white uppercase tracking-tight mb-3 group-hover:text-coral transition-colors">
          {data.name}
        </h3>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Stat label="Distance" value={`${data.distanceKm.toFixed(0)}km`} />
          <Stat label="Climb" value={`${data.elevationGainM.toLocaleString()}m`} />
          <Stat
            label="Climbs"
            value={
              data.hcCount > 0
                ? `${data.climbCount} (${data.hcCount} HC)`
                : `${data.climbCount}`
            }
          />
        </div>

        {/* Footer row */}
        <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-xs">
          <span className="text-foreground-subtle">
            {surfaceLabel(data.surfaceSummary) ?? "Mixed"}
          </span>
          <span className="text-foreground-muted" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
            {formatDate(data.eventDates[0]) ?? "Year-round"}
          </span>
        </div>
      </div>

      {/* Selection corner indicator */}
      {selected && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-coral text-charcoal flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
      )}
    </div>
  );

  const baseClass = `group relative block w-full text-left rounded-xl overflow-hidden border transition-all duration-300 ${
    selected
      ? "border-coral bg-gradient-to-br from-coral/8 via-deep-purple/30 to-charcoal shadow-[0_0_0_1px_rgba(241,99,99,0.5),0_8px_40px_-8px_rgba(241,99,99,0.4)]"
      : "border-white/8 bg-background-elevated hover:border-white/20 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
  }`;

  if (href) {
    return (
      <Link href={href} className={baseClass}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onSelect} className={baseClass}>
      {inner}
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.6rem] tracking-[0.15em] uppercase text-foreground-subtle mb-0.5">
        {label}
      </p>
      <p className="font-heading text-lg text-off-white leading-none">{value}</p>
    </div>
  );
}
