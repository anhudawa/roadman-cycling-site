"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { ToolLanding } from "@/components/features/tools/ToolLanding";

/* ------------------------------------------------------------------ */
/*  Wheel / tyre data                                                  */
/* ------------------------------------------------------------------ */

interface WheelOption {
  label: string;
  rolloutMm: number;
}

const WHEELS: WheelOption[] = [
  { label: "700x23c", rolloutMm: 2096 },
  { label: "700x25c", rolloutMm: 2105 },
  { label: "700x28c", rolloutMm: 2136 },
  { label: "700x32c", rolloutMm: 2168 },
  { label: "650b x 47mm (gravel)", rolloutMm: 2070 },
];

/* ------------------------------------------------------------------ */
/*  Common cassettes                                                   */
/* ------------------------------------------------------------------ */

interface CassetteOption {
  label: string;
  cogs: number[];
}

const CASSETTES: CassetteOption[] = [
  { label: "11-25", cogs: [11, 12, 13, 14, 15, 16, 17, 19, 21, 23, 25] },
  { label: "11-28", cogs: [11, 12, 13, 14, 15, 17, 19, 21, 24, 28] },
  { label: "11-30", cogs: [11, 12, 13, 14, 15, 17, 19, 21, 24, 27, 30] },
  { label: "11-32", cogs: [11, 12, 13, 14, 16, 18, 20, 22, 25, 28, 32] },
  { label: "11-34", cogs: [11, 12, 13, 15, 17, 19, 21, 24, 28, 32, 34] },
  { label: "11-36", cogs: [11, 12, 13, 15, 17, 19, 22, 25, 28, 32, 36] },
  { label: "10-36 (1x gravel)", cogs: [10, 12, 14, 16, 18, 21, 24, 28, 32, 36] },
  { label: "10-42 (1x wide)", cogs: [10, 12, 14, 16, 18, 21, 24, 28, 32, 36, 42] },
  { label: "10-44 (1x SRAM)", cogs: [10, 12, 14, 16, 18, 21, 24, 28, 32, 36, 40, 44] },
];

/* ------------------------------------------------------------------ */
/*  Chainring presets                                                  */
/* ------------------------------------------------------------------ */

interface ChainringPreset {
  label: string;
  rings: number[];
}

const CHAINRING_PRESETS: ChainringPreset[] = [
  { label: "50/34 Compact", rings: [50, 34] },
  { label: "52/36 Semi-compact", rings: [52, 36] },
  { label: "53/39 Standard", rings: [53, 39] },
  { label: "48/32 Sub-compact", rings: [48, 32] },
  { label: "46/30 Gravel", rings: [46, 30] },
  { label: "40T 1x", rings: [40] },
  { label: "42T 1x", rings: [42] },
  { label: "44T 1x", rings: [44] },
];

/* ------------------------------------------------------------------ */
/*  Scenario presets                                                   */
/* ------------------------------------------------------------------ */

interface ScenarioPreset {
  label: string;
  chainrings: number[];
  cassetteIdx: number;
  wheelIdx: number;
  note: string;
}

const SCENARIOS: ScenarioPreset[] = [
  {
    label: "Road Racing",
    chainrings: [52, 36],
    cassetteIdx: 1, // 11-28
    wheelIdx: 1, // 700x25c
    note: "52/36, 11-28, 700x25c",
  },
  {
    label: "Compact Climbing",
    chainrings: [50, 34],
    cassetteIdx: 3, // 11-32
    wheelIdx: 1, // 700x25c
    note: "50/34, 11-32, 700x25c",
  },
  {
    label: "Gravel",
    chainrings: [40],
    cassetteIdx: 7, // 10-42
    wheelIdx: 3, // 700x32c
    note: "40T 1x, 10-42, 700x32c",
  },
  {
    label: "Time Trial",
    chainrings: [54, 42],
    cassetteIdx: 0, // 11-25
    wheelIdx: 0, // 700x23c
    note: "54/42, 11-25, 700x23c",
  },
];

/* ------------------------------------------------------------------ */
/*  Gear maths                                                         */
/* ------------------------------------------------------------------ */

const MM_PER_INCH = 25.4;

function gearRatio(chainring: number, cog: number): number {
  return chainring / cog;
}

function gearInches(ratio: number, rolloutMm: number): number {
  const wheelDiameterInches = rolloutMm / (Math.PI * MM_PER_INCH);
  return ratio * wheelDiameterInches;
}

function development(ratio: number, rolloutMm: number): number {
  return (ratio * rolloutMm) / 1000;
}

function speedAtCadence(ratio: number, rolloutMm: number, rpm: number): number {
  const distPerRevM = (ratio * rolloutMm) / 1000;
  const mPerMin = distPerRevM * rpm;
  return (mPerMin * 60) / 1000; // km/h
}

/* ------------------------------------------------------------------ */
/*  Shared styles                                                      */
/* ------------------------------------------------------------------ */

const inputClass =
  "w-full bg-white/5 border border-white/10 focus:border-coral rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:outline-none transition-colors";
const selectClass =
  "w-full bg-white/5 border border-white/10 focus:border-coral rounded-lg px-4 py-3 text-off-white text-base focus:outline-none transition-colors appearance-none";
const labelClass = "block font-heading text-sm text-off-white mb-2";

/* ------------------------------------------------------------------ */
/*  Cadence table                                                      */
/* ------------------------------------------------------------------ */

const CADENCES = [
  { rpm: 70, label: "Easy spinning" },
  { rpm: 80, label: "Endurance" },
  { rpm: 90, label: "Sweet spot" },
  { rpm: 100, label: "Fast spinning" },
  { rpm: 110, label: "Sprint cadence" },
];

/* ------------------------------------------------------------------ */
/*  Helper: parse cog string                                           */
/* ------------------------------------------------------------------ */

function parseCogs(input: string): number[] {
  return input
    .split(/[,\s]+/)
    .map((s) => parseInt(s.trim()))
    .filter((n) => !isNaN(n) && n > 0)
    .sort((a, b) => a - b);
}

/* ------------------------------------------------------------------ */
/*  Overlap chart                                                      */
/* ------------------------------------------------------------------ */

function OverlapChart({
  chainrings,
  cogs,
  rolloutMm,
}: {
  chainrings: number[];
  cogs: number[];
  rolloutMm: number;
}) {
  if (chainrings.length < 2 || cogs.length === 0) return null;

  const RING_COLORS = ["#F87171", "#60A5FA", "#34D399", "#FBBF24"];

  const allGearInches: number[] = [];
  chainrings.forEach((ring) => {
    cogs.forEach((cog) => {
      allGearInches.push(gearInches(gearRatio(ring, cog), rolloutMm));
    });
  });

  const globalMin = Math.floor(Math.min(...allGearInches));
  const globalMax = Math.ceil(Math.max(...allGearInches));
  const range = globalMax - globalMin || 1;

  // Sorted large to small so big ring is first
  const sortedRings = [...chainrings].sort((a, b) => b - a);

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 md:p-6 mb-8">
      <h3 className="font-heading text-lg text-off-white mb-1">GEAR OVERLAP</h3>
      <p className="text-foreground-subtle text-xs mb-5">
        Bars show the gear-inch range covered by each chainring. Overlap means redundant ratios.
        Gaps mean jumps in effort when shifting rings.
      </p>
      <div className="space-y-4">
        {sortedRings.map((ring, idx) => {
          const ringGearInches = cogs.map((cog) =>
            gearInches(gearRatio(ring, cog), rolloutMm)
          );
          const ringMin = Math.min(...ringGearInches);
          const ringMax = Math.max(...ringGearInches);
          const leftPct = ((ringMin - globalMin) / range) * 100;
          const widthPct = ((ringMax - ringMin) / range) * 100;

          return (
            <div key={ring}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-heading text-sm text-off-white">{ring}T</span>
                <span className="text-foreground-subtle text-xs">
                  {ringMin.toFixed(0)}-{ringMax.toFixed(0)} gear inches
                </span>
              </div>
              <div className="relative h-6 bg-white/5 rounded-md overflow-hidden">
                <div
                  className="absolute h-full rounded-md transition-all duration-500"
                  style={{
                    left: `${leftPct}%`,
                    width: `${Math.max(widthPct, 1)}%`,
                    backgroundColor: RING_COLORS[idx % RING_COLORS.length],
                    opacity: 0.7,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Overlap zone callout */}
      {sortedRings.length === 2 && (() => {
        const bigRingGI = cogs.map((c) => gearInches(gearRatio(sortedRings[0], c), rolloutMm));
        const smallRingGI = cogs.map((c) => gearInches(gearRatio(sortedRings[1], c), rolloutMm));
        const bigMin = Math.min(...bigRingGI);
        const smallMax = Math.max(...smallRingGI);
        const overlap = smallMax - bigMin;

        if (overlap > 0) {
          const overlapPct = ((overlap / range) * 100).toFixed(0);
          return (
            <p className="text-foreground-muted text-sm mt-4">
              {overlap.toFixed(1)} gear inches of overlap ({overlapPct}% of total range).
              Normal for a double crankset — it gives you shift options without cross-chaining.
            </p>
          );
        }

        return (
          <p className="text-foreground-muted text-sm mt-4">
            No overlap. There is a {Math.abs(overlap).toFixed(1)} gear-inch gap between rings — you
            will feel a noticeable jump when shifting chainrings.
          </p>
        );
      })()}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function GearRatioPage() {
  const [chainrings, setChainrings] = useState<number[]>([50, 34]);
  const [cassetteIdx, setCassetteIdx] = useState(1); // 11-28
  const [manualCogs, setManualCogs] = useState("");
  const [useManualCogs, setUseManualCogs] = useState(false);
  const [wheelIdx, setWheelIdx] = useState(1); // 700x25c
  const [calculated, setCalculated] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState<{ ring: number; cog: number } | null>(null);

  const cogs = useManualCogs ? parseCogs(manualCogs) : CASSETTES[cassetteIdx].cogs;
  const rolloutMm = WHEELS[wheelIdx].rolloutMm;

  // Sort chainrings large-to-small for display
  const sortedChainrings = useMemo(() => [...chainrings].sort((a, b) => b - a), [chainrings]);

  const canCalculate = chainrings.length > 0 && cogs.length > 0;

  // Find min/max gears
  const extremes = useMemo(() => {
    if (!calculated || !canCalculate) return null;

    let lowestRatio = Infinity;
    let highestRatio = 0;
    let lowestCombo = { ring: 0, cog: 0 };
    let highestCombo = { ring: 0, cog: 0 };

    for (const ring of chainrings) {
      for (const cog of cogs) {
        const r = gearRatio(ring, cog);
        if (r < lowestRatio) {
          lowestRatio = r;
          lowestCombo = { ring, cog };
        }
        if (r > highestRatio) {
          highestRatio = r;
          highestCombo = { ring, cog };
        }
      }
    }

    return {
      lowest: {
        ...lowestCombo,
        ratio: lowestRatio,
        gi: gearInches(lowestRatio, rolloutMm),
        dev: development(lowestRatio, rolloutMm),
        speed90: speedAtCadence(lowestRatio, rolloutMm, 90),
      },
      highest: {
        ...highestCombo,
        ratio: highestRatio,
        gi: gearInches(highestRatio, rolloutMm),
        dev: development(highestRatio, rolloutMm),
        speed90: speedAtCadence(highestRatio, rolloutMm, 90),
      },
    };
  }, [calculated, chainrings, cogs, rolloutMm, canCalculate]);

  function applyChainringPreset(preset: ChainringPreset) {
    setChainrings(preset.rings);
    setCalculated(false);
    setSelectedCombo(null);
  }

  function applyScenario(scenario: ScenarioPreset) {
    setChainrings(scenario.chainrings);
    setCassetteIdx(scenario.cassetteIdx);
    setWheelIdx(scenario.wheelIdx);
    setUseManualCogs(false);
    setCalculated(false);
    setSelectedCombo(null);
  }

  return (
    <>
      <Header />
      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow" className="text-center">
            <p className="text-coral text-sm font-body font-medium uppercase tracking-widest mb-4">
              Free Tool
            </p>
            <h1
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              GEAR RATIO CALCULATOR
            </h1>
            <p className="text-foreground-muted text-lg">
              Every chainring and cog combination mapped to gear ratio, gear inches,
              development, and speed at cadence. See where your gearing overlaps and
              where the gaps are.
            </p>
          </Container>
        </Section>

        {/* Calculator */}
        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <div className="bg-background-elevated rounded-xl border border-white/5 p-6 md:p-8 mb-8">

              {/* Scenario presets */}
              <div className="mb-6">
                <p className="font-heading text-xs text-foreground-muted uppercase tracking-widest mb-3">
                  Quick presets
                </p>
                <div className="flex flex-wrap gap-2">
                  {SCENARIOS.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => applyScenario(s)}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-foreground-muted text-xs font-heading uppercase tracking-wider hover:text-off-white hover:border-coral/40 transition-colors"
                      title={s.note}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chainring selection */}
              <div className="mb-6">
                <label className={labelClass}>CHAINRING TEETH</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {CHAINRING_PRESETS.map((p) => {
                    const isActive =
                      p.rings.length === chainrings.length &&
                      p.rings.every((r, i) => chainrings.includes(r));
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => applyChainringPreset(p)}
                        className={`border rounded-lg px-3 py-2 text-xs font-heading uppercase tracking-wider transition-colors ${
                          isActive
                            ? "bg-coral/20 border-coral/50 text-off-white"
                            : "bg-white/5 border-white/10 text-foreground-muted hover:text-off-white hover:border-coral/40"
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-foreground-subtle text-xs">
                  Selected: {sortedChainrings.join("/")}T
                </p>
              </div>

              {/* Cassette selection */}
              <div className="mb-6">
                <div className="flex items-end justify-between mb-2">
                  <label htmlFor="cassette-select" className={labelClass + " !mb-0"}>
                    CASSETTE
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setUseManualCogs(!useManualCogs);
                      if (!useManualCogs) {
                        setManualCogs(CASSETTES[cassetteIdx].cogs.join(", "));
                      }
                      setCalculated(false);
                    }}
                    className="text-coral text-xs font-heading uppercase tracking-wider hover:text-coral/80 transition-colors"
                  >
                    {useManualCogs ? "Use presets" : "Enter manually"}
                  </button>
                </div>

                {useManualCogs ? (
                  <div>
                    <input
                      id="manual-cogs"
                      type="text"
                      placeholder="e.g. 11, 13, 15, 17, 19, 21, 24, 28"
                      value={manualCogs}
                      onChange={(e) => {
                        setManualCogs(e.target.value);
                        setCalculated(false);
                      }}
                      aria-label="Comma-separated cog teeth values"
                      className={inputClass + " !text-base"}
                    />
                    <p className="text-foreground-subtle text-xs mt-1.5">
                      Comma-separated cog teeth (e.g. 11, 13, 15, 17, 19, 21, 24, 28)
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {CASSETTES.map((c, idx) => (
                      <button
                        key={c.label}
                        type="button"
                        onClick={() => {
                          setCassetteIdx(idx);
                          setCalculated(false);
                        }}
                        className={`border rounded-lg px-3 py-2 text-xs font-heading uppercase tracking-wider transition-colors ${
                          cassetteIdx === idx
                            ? "bg-coral/20 border-coral/50 text-off-white"
                            : "bg-white/5 border-white/10 text-foreground-muted hover:text-off-white hover:border-coral/40"
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Wheel/tyre size */}
              <div className="mb-6">
                <label htmlFor="wheel-select" className={labelClass}>
                  WHEEL / TYRE SIZE
                </label>
                <select
                  id="wheel-select"
                  value={wheelIdx}
                  onChange={(e) => {
                    setWheelIdx(parseInt(e.target.value));
                    setCalculated(false);
                  }}
                  aria-label="Wheel and tyre size"
                  className={selectClass}
                >
                  {WHEELS.map((w, idx) => (
                    <option key={w.label} value={idx} className="bg-charcoal">
                      {w.label} ({w.rolloutMm}mm rollout)
                    </option>
                  ))}
                </select>
              </div>

              <Button
                onClick={() => {
                  if (canCalculate) {
                    setCalculated(true);
                    if (!selectedCombo && chainrings.length > 0 && cogs.length > 0) {
                      setSelectedCombo({ ring: sortedChainrings[0], cog: cogs[0] });
                    }
                  }
                }}
                size="lg"
                className="w-full"
                disabled={!canCalculate}
              >
                Calculate Gear Ratios
              </Button>
            </div>

            {/* Results */}
            <div aria-live="polite" aria-atomic="false">
              <AnimatePresence mode="wait">
                {calculated && canCalculate && (
                  <motion.div
                    key={`${chainrings.join("-")}-${cogs.join("-")}-${rolloutMm}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Lowest / Highest gears */}
                    {extremes && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-center">
                          <p className="text-foreground-muted text-xs font-heading uppercase tracking-widest mb-2">
                            Easiest gear (climbing)
                          </p>
                          <p className="font-heading text-3xl md:text-4xl text-coral tabular-nums mb-1">
                            {extremes.lowest.ring}/{extremes.lowest.cog}
                          </p>
                          <p className="text-foreground-muted text-sm">
                            {extremes.lowest.ratio.toFixed(2)} ratio · {extremes.lowest.gi.toFixed(0)}{"″"} · {extremes.lowest.speed90.toFixed(1)} km/h at 90rpm
                          </p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-center">
                          <p className="text-foreground-muted text-xs font-heading uppercase tracking-widest mb-2">
                            Hardest gear (sprinting)
                          </p>
                          <p className="font-heading text-3xl md:text-4xl text-coral tabular-nums mb-1">
                            {extremes.highest.ring}/{extremes.highest.cog}
                          </p>
                          <p className="text-foreground-muted text-sm">
                            {extremes.highest.ratio.toFixed(2)} ratio · {extremes.highest.gi.toFixed(0)}{"″"} · {extremes.highest.speed90.toFixed(1)} km/h at 90rpm
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Gear ratio table */}
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 md:p-6 mb-8 overflow-x-auto">
                      <h3 className="font-heading text-lg text-off-white mb-1">GEAR TABLE</h3>
                      <p className="text-foreground-subtle text-xs mb-4">
                        Click any cell to see speed at different cadences.
                      </p>
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr>
                            <th className="font-heading text-off-white text-xs text-left p-2 border-b border-white/10 sticky left-0 bg-white/[0.03]">
                              Cog
                            </th>
                            {sortedChainrings.map((ring) => (
                              <th
                                key={ring}
                                className="font-heading text-off-white text-xs text-center p-2 border-b border-white/10"
                              >
                                {ring}T
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {cogs.map((cog) => (
                            <tr key={cog} className="border-b border-white/5 last:border-0">
                              <td className="font-heading text-off-white text-xs p-2 sticky left-0 bg-white/[0.03]">
                                {cog}
                              </td>
                              {sortedChainrings.map((ring) => {
                                const ratio = gearRatio(ring, cog);
                                const gi = gearInches(ratio, rolloutMm);
                                const dev = development(ratio, rolloutMm);
                                const isSelected =
                                  selectedCombo?.ring === ring &&
                                  selectedCombo?.cog === cog;

                                return (
                                  <td
                                    key={ring}
                                    className={`text-center p-2 cursor-pointer transition-colors ${
                                      isSelected
                                        ? "bg-coral/20 rounded"
                                        : "hover:bg-white/5"
                                    }`}
                                    onClick={() =>
                                      setSelectedCombo({ ring, cog })
                                    }
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        setSelectedCombo({ ring, cog });
                                      }
                                    }}
                                    aria-label={`${ring}T chainring, ${cog}T cog: ratio ${ratio.toFixed(2)}, ${gi.toFixed(0)} gear inches`}
                                  >
                                    <span className="text-off-white font-heading tabular-nums">
                                      {ratio.toFixed(2)}
                                    </span>
                                    <br />
                                    <span className="text-foreground-subtle text-xs tabular-nums">
                                      {gi.toFixed(0)}&Prime; · {dev.toFixed(1)}m
                                    </span>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Speed at cadence table */}
                    {selectedCombo && (
                      <motion.div
                        key={`cadence-${selectedCombo.ring}-${selectedCombo.cog}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="rounded-xl border border-white/10 bg-white/[0.03] p-5 md:p-6 mb-8"
                      >
                        <h3 className="font-heading text-lg text-off-white mb-1">
                          SPEED AT CADENCE
                        </h3>
                        <p className="text-foreground-subtle text-xs mb-4">
                          {selectedCombo.ring}T / {selectedCombo.cog}T —
                          ratio {gearRatio(selectedCombo.ring, selectedCombo.cog).toFixed(2)},
                          {" "}{gearInches(gearRatio(selectedCombo.ring, selectedCombo.cog), rolloutMm).toFixed(0)} gear inches
                        </p>
                        <div className="space-y-2">
                          {CADENCES.map((c) => {
                            const speed = speedAtCadence(
                              gearRatio(selectedCombo.ring, selectedCombo.cog),
                              rolloutMm,
                              c.rpm
                            );
                            const maxSpeed = speedAtCadence(
                              gearRatio(selectedCombo.ring, selectedCombo.cog),
                              rolloutMm,
                              110
                            );

                            return (
                              <div key={c.rpm} className="flex items-center gap-3">
                                <span className="font-heading text-off-white text-sm w-16 shrink-0 tabular-nums">
                                  {c.rpm} rpm
                                </span>
                                <div className="flex-1 h-5 bg-white/5 rounded overflow-hidden">
                                  <div
                                    className="h-full bg-coral/60 rounded transition-all duration-500"
                                    style={{
                                      width: `${(speed / (maxSpeed * 1.1)) * 100}%`,
                                    }}
                                  />
                                </div>
                                <span className="font-heading text-coral text-sm w-20 text-right shrink-0 tabular-nums">
                                  {speed.toFixed(1)} km/h
                                </span>
                                <span className="text-foreground-subtle text-xs w-24 text-right shrink-0 hidden sm:block">
                                  {c.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    {/* Overlap chart */}
                    <OverlapChart
                      chainrings={sortedChainrings}
                      cogs={cogs}
                      rolloutMm={rolloutMm}
                    />

                    {/* What next */}
                    <div className="rounded-xl border border-white/10 p-6 mb-8">
                      <h3 className="font-heading text-lg text-off-white mb-3">WHAT NEXT?</h3>
                      <ul className="space-y-2">
                        <li>
                          <Link
                            href="/tools/power-speed"
                            className="text-coral hover:text-coral/80 text-sm transition-colors"
                          >
                            See what speed your watts produce
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/tools/ftp-zones"
                            className="text-coral hover:text-coral/80 text-sm transition-colors"
                          >
                            Calculate Your Power Zones
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/blog/cycling-cadence-optimal-guide"
                            className="text-coral hover:text-coral/80 text-sm transition-colors"
                          >
                            Cadence Guide
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/topics/cycling-tech"
                            className="text-coral hover:text-coral/80 text-sm transition-colors"
                          >
                            Cycling Tech hub
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* CTA */}
                    <div className="rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-6 md:p-8 text-center">
                      <p className="font-heading text-coral text-xs tracking-widest mb-2">
                        WANT TO KNOW IF YOUR GEARING MATCHES YOUR FITNESS?
                      </p>
                      <p className="text-off-white font-heading text-lg mb-4">
                        Gearing choice depends on your power, your terrain, and your cadence
                        preference. A coach can match all three.
                      </p>
                      <a
                        href="/apply"
                        className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm transition-all"
                        data-track="tool_gear_ratio_apply"
                      >
                        Apply for Coaching →
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Container>
        </Section>

        {/* Methodology */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <h2
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              METHODOLOGY
            </h2>
            <div className="text-foreground-muted text-sm leading-relaxed space-y-3">
              <p>
                <strong className="text-off-white">Gear ratio:</strong> Chainring teeth
                divided by cog teeth. A 50/25 combination gives a ratio of 2.0 — each pedal
                revolution turns the rear wheel twice.
              </p>
              <p>
                <strong className="text-off-white">Gear inches:</strong> Gear ratio multiplied
                by the wheel diameter in inches. An old standard (dating back to penny-farthing
                comparisons) that remains the most intuitive way to compare gears across
                different wheel sizes.
              </p>
              <p>
                <strong className="text-off-white">Meters of development:</strong> Gear ratio
                multiplied by the wheel circumference (rollout) in meters. This is the distance
                the bike travels per pedal revolution. Widely used in continental Europe and in
                track cycling.
              </p>
              <p>
                <strong className="text-off-white">Rollout variation:</strong> The tyre
                circumferences used here assume standard inflation and no load deformation.
                Real-world rollout varies with tyre pressure, rider weight, and tyre construction.
                A 2-3% difference is typical. For precision, measure your own rollout — mark the
                tyre, ride one revolution, measure the ground distance.
              </p>
              <p>
                <strong className="text-off-white">Source:</strong> The formulas follow
                Sheldon Brown&apos;s canonical gear-calculation methodology. Brown&apos;s work
                remains the definitive reference for bicycle gearing arithmetic.
              </p>
              <p className="text-xs text-foreground-subtle">
                Last updated: July 2026 · Tool version 1.0
              </p>
            </div>
          </Container>
        </Section>

        <ToolLanding slug="gear-ratio" />
      </main>
      <Footer />
    </>
  );
}
