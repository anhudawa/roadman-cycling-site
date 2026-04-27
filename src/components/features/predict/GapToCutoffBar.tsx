interface GapToCutoffBarProps {
  /** Predicted finish time in seconds. */
  predictedTimeS: number;
  /** Event cutoff (sweep wagon) in seconds. */
  cutoffS: number;
  /** Confidence-high (slowest plausible time) in seconds. */
  confidenceHighS: number;
}

function fmt(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

/**
 * Visual "buffer to the cutoff" bar. Shows the rider's predicted time as a
 * coral marker, the confidence-high plausibly-slow band as a subtle wash, and
 * the cutoff as a hard amber line.
 */
export function GapToCutoffBar({
  predictedTimeS,
  cutoffS,
  confidenceHighS,
}: GapToCutoffBarProps) {
  // Scale: span from a bit before the predicted time to a bit past the cutoff.
  const headroom = Math.max(60, cutoffS * 0.05);
  const min = Math.max(0, Math.min(predictedTimeS, cutoffS) - headroom);
  const max = Math.max(cutoffS, confidenceHighS) + headroom;
  const span = max - min;

  const pred = ((predictedTimeS - min) / span) * 100;
  const cutoff = ((cutoffS - min) / span) * 100;
  const high = ((confidenceHighS - min) / span) * 100;
  const buffer = cutoffS - predictedTimeS;
  const bufferLabel = (buffer >= 0 ? "−" : "+") + fmt(Math.abs(buffer));
  const ok = buffer >= 0;
  const tightAtConf = cutoffS - confidenceHighS;
  const tight = tightAtConf < 600;

  return (
    <div className="rounded-xl border border-white/8 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-5">
      <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
        <p
          className="text-[0.65rem] tracking-[0.22em] uppercase text-coral"
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        >
          GAP TO CUTOFF
        </p>
        <div className="text-right">
          <span
            className={`font-heading text-2xl tabular-nums ${
              ok ? (tight ? "text-amber-400" : "text-emerald-400") : "text-coral"
            }`}
          >
            {bufferLabel}
          </span>
          <span
            className="ml-2 text-[0.62rem] tracking-[0.2em] uppercase text-foreground-subtle"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            {ok ? "BUFFER" : "OVER CUTOFF"}
          </span>
        </div>
      </div>

      <div className="relative h-12">
        {/* Track */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-white/8" />

        {/* Slow band (predicted → confidence-high) */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-coral/30"
          style={{ left: `${pred}%`, width: `${Math.max(1, high - pred)}%` }}
        />

        {/* Cutoff line */}
        <div
          className="absolute top-1 bottom-1 w-px bg-amber-400"
          style={{ left: `${cutoff}%` }}
        />
        <div
          className="absolute -top-0.5 -translate-x-1/2 text-[0.55rem] tracking-[0.22em] uppercase text-amber-400"
          style={{ left: `${cutoff}%`, fontFamily: "var(--font-jetbrains-mono)" }}
        >
          CUTOFF
        </div>
        <div
          className="absolute bottom-0 -translate-x-1/2 text-[0.55rem] tabular-nums text-amber-400/80"
          style={{ left: `${cutoff}%`, fontFamily: "var(--font-jetbrains-mono)" }}
        >
          {fmt(cutoffS)}
        </div>

        {/* Predicted marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-coral shadow-[0_0_12px_rgba(241,99,99,0.7)]"
          style={{ left: `${pred}%` }}
        />
        <div
          className="absolute -top-0.5 -translate-x-1/2 text-[0.55rem] tracking-[0.22em] uppercase text-coral"
          style={{ left: `${pred}%`, fontFamily: "var(--font-jetbrains-mono)" }}
        >
          YOU
        </div>
        <div
          className="absolute bottom-0 -translate-x-1/2 text-[0.55rem] tabular-nums text-coral/80"
          style={{ left: `${pred}%`, fontFamily: "var(--font-jetbrains-mono)" }}
        >
          {fmt(predictedTimeS)}
        </div>
      </div>

      <p className="text-xs text-foreground-muted mt-3 leading-relaxed">
        {ok
          ? tight
            ? "Inside the cutoff — but the slow-day plausible time pushes uncomfortably close. Don't accept anything but the optimal pacing plan."
            : "Comfortable buffer to the sweep wagon at sustainable effort. Still, weather and mechanicals chew through margin fast."
          : "Predicted finish is past the cutoff. The Race Report flags exactly which kilometres you're losing time and how to claw it back."}
      </p>
    </div>
  );
}
