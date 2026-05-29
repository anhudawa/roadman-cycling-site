import type { CheckpointSplit } from "@/lib/race-predictor/types";

interface SplitsTableProps {
  splits: CheckpointSplit[];
}

/** Cumulative elapsed time as H:MM (e.g. 2:07). */
function formatElapsed(s: number): string {
  const total = Math.max(0, Math.round(s));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  return `${h}:${m.toString().padStart(2, "0")}`;
}

const KIND_LABELS: Record<CheckpointSplit["kind"], string> = {
  distance: "Split",
  climb_start: "Climb foot",
  climb_top: "Climb top",
  finish: "Finish",
};

/** Climb tops and the finish get a coral accent; distance markers stay neutral. */
function isHighlighted(kind: CheckpointSplit["kind"]): boolean {
  return kind === "climb_top" || kind === "finish";
}

/**
 * Per-checkpoint split predictions — a free taste of the paid plan's pacing
 * detail. Presentational only; renders nothing when there are no splits.
 */
export function SplitsTable({ splits }: SplitsTableProps) {
  if (!splits || splits.length === 0) return null;

  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
      <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
        <h3
          className="text-[0.7rem] tracking-[0.22em] uppercase text-coral"
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        >
          SPLIT TIMES
        </h3>
        <span className="text-xs text-foreground-subtle">
          {splits.length} checkpoint{splits.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Horizontal scroll on narrow viewports keeps the table readable on mobile. */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse">
          <caption className="sr-only">
            Predicted cumulative split times by checkpoint, with leg speed,
            power and elevation gained.
          </caption>
          <thead>
            <tr
              className="text-[0.6rem] tracking-[0.18em] uppercase text-foreground-subtle border-b border-white/5"
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            >
              <th scope="col" className="text-left font-normal px-5 py-2.5">
                Checkpoint
              </th>
              <th scope="col" className="text-right font-normal px-3 py-2.5">
                Dist
              </th>
              <th scope="col" className="text-right font-normal px-3 py-2.5">
                Elapsed
              </th>
              <th scope="col" className="text-right font-normal px-3 py-2.5">
                Leg spd
              </th>
              <th scope="col" className="text-right font-normal px-3 py-2.5">
                Leg pwr
              </th>
              <th scope="col" className="text-right font-normal px-5 py-2.5">
                Climbed
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {splits.map((split, i) => {
              const highlight = isHighlighted(split.kind);
              return (
                <tr
                  key={`${split.kind}-${split.distance}-${i}`}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <th
                    scope="row"
                    className="text-left font-normal px-5 py-2.5 align-middle"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{
                          background: highlight ? "var(--coral, #f16363)" : "rgba(255,255,255,0.18)",
                          boxShadow: highlight ? "0 0 6px rgba(241,99,99,0.7)" : undefined,
                        }}
                        aria-hidden="true"
                      />
                      <span className="flex flex-col">
                        <span
                          className={`text-sm leading-tight ${highlight ? "text-coral" : "text-off-white"}`}
                        >
                          {split.label}
                        </span>
                        <span
                          className="text-[0.55rem] tracking-[0.16em] uppercase text-foreground-subtle"
                          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                        >
                          {KIND_LABELS[split.kind]}
                        </span>
                      </span>
                    </span>
                  </th>
                  <td className="text-right px-3 py-2.5 text-sm text-off-white tabular-nums whitespace-nowrap">
                    {(split.distance / 1000).toFixed(1)} km
                  </td>
                  <td
                    className={`text-right px-3 py-2.5 text-sm tabular-nums whitespace-nowrap ${highlight ? "text-coral" : "text-off-white"}`}
                  >
                    {formatElapsed(split.cumulativeTime)}
                  </td>
                  <td className="text-right px-3 py-2.5 text-sm text-off-white/85 tabular-nums whitespace-nowrap">
                    {(split.legSpeed * 3.6).toFixed(1)} km/h
                  </td>
                  <td className="text-right px-3 py-2.5 text-sm text-off-white/85 tabular-nums whitespace-nowrap">
                    {Math.round(split.legPower)} W
                  </td>
                  <td className="text-right px-5 py-2.5 text-sm text-off-white/85 tabular-nums whitespace-nowrap">
                    {Math.round(split.cumulativeElevationGain).toLocaleString()} m
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
