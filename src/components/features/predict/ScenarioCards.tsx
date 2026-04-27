interface Scenario {
  id: string;
  title: string;
  copy: string;
  /** Estimated time delta in seconds (negative = faster). */
  deltaS: number;
  /** Tag like "Equipment" or "Conditions". */
  tag?: string;
}

interface ScenarioCardsProps {
  scenarios: Scenario[];
  /** Base prediction in seconds — used to render relative bars. */
  baseTimeS: number;
}

function formatDelta(s: number): string {
  const sign = s < 0 ? "−" : "+";
  const abs = Math.abs(s);
  if (abs < 60) return `${sign}${Math.round(abs)}s`;
  const m = Math.floor(abs / 60);
  const sec = Math.round(abs % 60);
  if (m < 60) return `${sign}${m}:${sec.toString().padStart(2, "0")}`;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${sign}${h}h ${mm.toString().padStart(2, "0")}m`;
}

/**
 * Equipment / pacing / conditions scenario tiles.
 *
 * Each card shows a what-if (e.g. "Deeper-section wheels") with the resulting
 * time delta visualised as a horizontal magnitude bar. The full Race Report
 * unlocks the precise per-scenario simulation; this preview gives directional
 * deltas computed from the base prediction.
 */
export function ScenarioCards({ scenarios, baseTimeS }: ScenarioCardsProps) {
  const maxAbs = Math.max(60, ...scenarios.map((s) => Math.abs(s.deltaS)));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {scenarios.map((s) => {
        const pct = (Math.abs(s.deltaS) / maxAbs) * 100;
        const negative = s.deltaS < 0;
        const newTimeS = baseTimeS + s.deltaS;
        const newH = Math.floor(newTimeS / 3600);
        const newM = Math.floor((newTimeS % 3600) / 60);

        return (
          <div
            key={s.id}
            className="rounded-xl border border-white/8 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-4 hover:border-white/20 transition-colors"
          >
            {s.tag && (
              <p
                className="text-[0.55rem] tracking-[0.22em] uppercase text-foreground-subtle mb-1.5"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                {s.tag}
              </p>
            )}
            <h4 className="font-heading text-base uppercase tracking-tight text-off-white mb-1.5 leading-tight">
              {s.title}
            </h4>
            <p className="text-xs text-foreground-muted mb-3 leading-relaxed">
              {s.copy}
            </p>

            <div className="flex items-baseline gap-2 mb-2">
              <span
                className={`font-heading text-2xl tabular-nums ${
                  negative ? "text-emerald-400" : "text-coral"
                }`}
              >
                {formatDelta(s.deltaS)}
              </span>
              <span
                className="text-[0.6rem] uppercase tracking-[0.18em] text-foreground-subtle"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                NEW: {newH}h {newM.toString().padStart(2, "0")}m
              </span>
            </div>

            <div className="relative h-1 rounded-full bg-white/6 overflow-hidden">
              <div
                className={`absolute top-0 bottom-0 rounded-full ${
                  negative ? "bg-emerald-400 right-1/2" : "bg-coral left-1/2"
                }`}
                style={{
                  width: `${pct / 2}%`,
                  boxShadow: negative
                    ? "0 0 8px rgba(52, 211, 153, 0.5)"
                    : "0 0 8px rgba(241, 99, 99, 0.5)",
                }}
              />
              <div
                className="absolute top-0 bottom-0 left-1/2 w-px bg-white/30"
                aria-hidden
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function deriveDefaultScenarios(args: {
  baseTimeS: number;
  averagePower: number;
  bodyMass: number;
  cda: number;
  elevationGainM: number;
}): Scenario[] {
  const { baseTimeS, averagePower, bodyMass, cda, elevationGainM } = args;
  const climbHeavy = elevationGainM / Math.max(50, baseTimeS / 60) > 12;

  // Order-of-magnitude estimates calibrated against published power-time curves.
  // CdA delta: shaving 0.02 m² ≈ 2-4% on flat-ish events. Climb-heavy routes
  // see roughly half the aero benefit since less of the day is spent at speed.
  const aeroSavings = baseTimeS * 0.025 * (climbHeavy ? 0.5 : 1);

  // 1 kg lighter ≈ 1% on heavy-climb routes, 0.2% on flat.
  const lightSavings = baseTimeS * (climbHeavy ? 0.011 : 0.0035);

  // +20W ≈ 3.5% across most events.
  const powerSavings = baseTimeS * 0.035;

  // Worse pacing (constant-power) ≈ +2% in race plans.
  const pacingPenalty = baseTimeS * 0.02;

  // Headwind day (+5 m/s) ≈ +6% on flat.
  const windPenalty = baseTimeS * (climbHeavy ? 0.025 : 0.06);

  return [
    {
      id: "deeper-wheels",
      tag: "EQUIPMENT",
      title: "Deeper-section wheels",
      copy: `Drop CdA by ~0.018 m² vs. ${cda.toFixed(2)}. ${
        climbHeavy
          ? "Limited gain on a climb-heavy route."
          : "Meaningful on rolling and flat parcours."
      }`,
      deltaS: -Math.round(aeroSavings),
    },
    {
      id: "lighter-bike",
      tag: "EQUIPMENT",
      title: "1 kg off the bike",
      copy: climbHeavy
        ? "Climb-heavy course — every kilo matters on the long ramps."
        : `Marginal on flat ground — current ${bodyMass.toFixed(0)} kg system already moves well.`,
      deltaS: -Math.round(lightSavings),
    },
    {
      id: "higher-ftp",
      tag: "TRAINING",
      title: "+20 W sustained power",
      copy: `From ${Math.round(averagePower)} W average to ~${Math.round(averagePower + 20)} W. The single biggest lever you control.`,
      deltaS: -Math.round(powerSavings),
    },
    {
      id: "constant-power",
      tag: "PACING",
      title: "Even-pace strategy",
      copy: "Riding identical wattage start-to-finish vs. variable plan that eases descents and pushes climbs.",
      deltaS: Math.round(pacingPenalty),
    },
    {
      id: "headwind-day",
      tag: "CONDITIONS",
      title: "Headwind day (+5 m/s)",
      copy: climbHeavy
        ? "Wind matters less on protected climbs but cripples the valley sections."
        : "Open course — direct and significant. Sit in groups where you can.",
      deltaS: Math.round(windPenalty),
    },
  ];
}
