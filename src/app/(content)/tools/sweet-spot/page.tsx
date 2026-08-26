"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { ToolLanding } from "@/components/features/tools/ToolLanding";
import { TOOL_EVENTS, trackTool } from "@/lib/analytics/tool-events";

/* ------------------------------------------------------------------ */
/*  Zone definitions (Coggan's classic model)                         */
/* ------------------------------------------------------------------ */

interface ZoneBand {
  name: string;
  label: string;
  minPct: number;
  maxPct: number;
  color: string;
  description: string;
}

const ZONE_BANDS: ZoneBand[] = [
  {
    name: "Tempo",
    label: "Zone 3 — Tempo",
    minPct: 76,
    maxPct: 87,
    color: "#22C55E",
    description:
      "A power band in the classic model. Its internal cost still depends on duration, the FTP anchor and the rider.",
  },
  {
    name: "Sweet Spot",
    label: "Sweet Spot",
    minPct: 88,
    maxPct: 94,
    color: "#F97316",
    description:
      "A coaching convention spanning upper tempo and lower threshold, commonly displayed at 88-94% FTP.",
  },
  {
    name: "Threshold",
    label: "Zone 4 — Threshold",
    minPct: 95,
    maxPct: 105,
    color: "#EAB308",
    description:
      "A band around FTP in the classic model. FTP test methods and sustainable duration differ between riders.",
  },
];

/* ------------------------------------------------------------------ */
/*  Session structures                                                */
/* ------------------------------------------------------------------ */

interface SessionTemplate {
  name: string;
  totalMinutes: number;
  structure: string;
  recovery: string;
  when: string;
}

const SESSION_TEMPLATES: SessionTemplate[] = [
  {
    name: "Classic 2x20",
    totalMinutes: 40,
    structure: "2 x 20 min @ sweet spot, 5 min recovery between",
    recovery: "Review the full set before scheduling the next hard day",
    when: "A familiar format for riders with recent evidence that twenty-minute sub-threshold blocks are repeatable.",
  },
  {
    name: "Triple 15s",
    totalMinutes: 45,
    structure: "3 x 15 min @ sweet spot, 5 min recovery between",
    recovery: "Use the next normal training day to confirm the dose was absorbed",
    when: "A similar amount of work split into shorter blocks; reduce duration if pacing deteriorates.",
  },
  {
    name: "Steady State 45",
    totalMinutes: 45,
    structure: "1 x 45 min continuous @ sweet spot",
    recovery: "Do not assign a fixed recovery time from the template alone",
    when: "A continuous option only when recent comparable work supports it; this can become a threshold test if FTP is inaccurate.",
  },
  {
    name: "Short Blocks",
    totalMinutes: 30,
    structure: "3 x 10 min @ sweet spot, 3 min recovery between",
    recovery: "Check normal power, soreness and motivation before the next quality session",
    when: "A conservative introduction that can be shortened further for riders returning to structure.",
  },
  {
    name: "Long Blocks",
    totalMinutes: 60,
    structure: "3 x 20 min @ sweet spot, 5 min recovery between",
    recovery: "Plan from the rider's observed response, not weekly hours alone",
    when: "A high-volume option for experienced riders who already complete shorter versions with control.",
  },
  {
    name: "Weekend Special",
    totalMinutes: 90,
    structure: "2 x 45 min @ sweet spot, 10 min recovery between",
    recovery: "Individualise; the calculator cannot prescribe the next hard day",
    when: "A demanding event-specific example, not a default or progression target. Use only with relevant preparation.",
  },
];

/* ------------------------------------------------------------------ */
/*  Weekly volume by training phase                                   */
/* ------------------------------------------------------------------ */

interface VolumePhase {
  phase: string;
  weeklyHours: string;
  ssMinutes: string;
  sessions: string;
  notes: string;
}

const VOLUME_PHASES: VolumePhase[] = [
  {
    phase: "Base / General Prep",
    weeklyHours: "Any",
    ssMinutes: "No fixed amount",
    sessions: "Start from history",
    notes: "Ask whether sub-threshold work solves a current goal before adding it to the base phase.",
  },
  {
    phase: "Build",
    weeklyHours: "Any",
    ssMinutes: "Progress one variable",
    sessions: "Count all hard days",
    notes: "Races, group rides, threshold work, strength and life stress belong in the dose decision.",
  },
  {
    phase: "Speciality / Race Prep",
    weeklyHours: "Event-led",
    ssMinutes: "Match the demand",
    sessions: "No fixed frequency",
    notes: "Keep sweet spot only when sustained sub-threshold work matches the event and does not displace a more specific quality.",
  },
  {
    phase: "Recovery / Off-season",
    weeklyHours: "Reduced or unstructured",
    ssMinutes: "Purpose first",
    sessions: "Optional",
    notes: "Recovery and enjoyment may be the goal. Do not add structured intensity merely to fill a table.",
  },
];

/* ------------------------------------------------------------------ */
/*  Comparison table data                                             */
/* ------------------------------------------------------------------ */

interface ComparisonRow {
  attribute: string;
  tempo: string;
  sweetSpot: string;
  threshold: string;
}

const COMPARISON_DATA: ComparisonRow[] = [
  {
    attribute: "% FTP",
    tempo: "76-87%",
    sweetSpot: "88-94%",
    threshold: "95-105%",
  },
  {
    attribute: "Role in the model",
    tempo: "Lower sustained power band",
    sweetSpot: "Coaching overlap band",
    threshold: "Band around FTP",
  },
  {
    attribute: "What it measures",
    tempo: "External power target",
    sweetSpot: "External power target",
    threshold: "External power target",
  },
  {
    attribute: "What % FTP misses",
    tempo: "Duration and internal response",
    sweetSpot: "Duration and internal response",
    threshold: "Test method and time to exhaustion",
  },
  {
    attribute: "Possible use",
    tempo: "Sustained event-specific work",
    sweetSpot: "Controlled sub-threshold intervals",
    threshold: "Work specific to riding near FTP",
  },
  {
    attribute: "Decision check",
    tempo: "Does it match the event and full week?",
    sweetSpot: "Is the complete set repeatable?",
    threshold: "Is FTP current and the cost absorbable?",
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function getFtpError(value: string): string | null {
  if (!value) return null;
  const num = parseInt(value);
  if (isNaN(num)) return "Please enter a valid number";
  if (num < 50) return "FTP must be at least 50W";
  if (num > 600) return "FTP must be under 600W";
  return null;
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function SweetSpotCalculatorPage() {
  const [ftp, setFtp] = useState<string>("");
  const [calculated, setCalculated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sessionTarget, setSessionTarget] = useState<number>(45);
  const ftpValue = parseInt(ftp) || 0;
  const ftpError = getFtpError(ftp);

  /* Compute watt ranges */
  const ssMin = Math.round(ftpValue * 0.88);
  const ssMax = Math.round(ftpValue * 0.94);
  const tempoMin = Math.round(ftpValue * 0.76);
  const tempoMax = Math.round(ftpValue * 0.87);
  const threshMin = Math.round(ftpValue * 0.95);
  const threshMax = Math.round(ftpValue * 1.05);

  const handleCalculate = () => {
    if (ftpValue > 0 && !ftpError) {
      setCalculated(true);
      trackTool({
        name: TOOL_EVENTS.COMPLETED,
        tool: "sweet_spot",
        meta: { ftp: ftpValue },
      });
    }
  };

  const handleCopyResults = async () => {
    if (!calculated || ftpValue <= 0) return;
    const text = [
      `Sweet Spot Calculator (${ftpValue}W FTP)`,
      ``,
      `Tempo: ${tempoMin}-${tempoMax}W (76-87% FTP)`,
      `Sweet Spot: ${ssMin}-${ssMax}W (88-94% FTP)`,
      `Threshold: ${threshMin}-${threshMax}W (95-105% FTP)`,
      ``,
      `Target sweet spot: ${ssMin}-${ssMax}W`,
      ``,
      `— roadmancycling.com/tools/sweet-spot`,
    ].join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* Session builder: filter templates by target */
  const matchedSessions = SESSION_TEMPLATES.filter(
    (s) => s.totalMinutes <= sessionTarget + 15 && s.totalMinutes >= sessionTarget - 15,
  );
  const displaySessions = matchedSessions.length > 0 ? matchedSessions : SESSION_TEMPLATES.slice(0, 3);

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
              SWEET SPOT CALCULATOR
            </h1>
            <p className="text-foreground-muted text-lg">
              Calculate the common 88-94% FTP band, compare neighbouring power
              ranges and review sample sessions with explicit dosing and
              evidence limits.
            </p>
          </Container>
        </Section>

        {/* Calculator */}
        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            {/* Input */}
            <div className="bg-background-elevated rounded-xl border border-white/5 p-8 mb-8">
              <label
                htmlFor="ftp-input"
                className="block font-heading text-lg text-off-white mb-2"
              >
                YOUR FTP (WATTS)
              </label>
              <p className="text-sm text-foreground-muted mb-4">
                Don&apos;t know your FTP? Multiplying best 20-minute power by
                0.95 is one common estimate, not a universal conversion. Compare
                protocols with the{" "}
                <Link
                  href="/tools/ftp-test"
                  className="text-coral hover:text-coral/80 transition-colors"
                >
                  FTP Test Calculator
                </Link>
                .
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  id="ftp-input"
                  type="number"
                  inputMode="numeric"
                  min="50"
                  max="600"
                  aria-label="Your Functional Threshold Power in watts"
                  aria-invalid={!!ftpError}
                  placeholder="e.g. 250"
                  value={ftp}
                  onChange={(e) => {
                    setFtp(e.target.value);
                    setCalculated(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCalculate();
                  }}
                  className={`
                    flex-1 bg-white/5 border rounded-lg px-4 py-3
                    text-off-white text-xl font-heading tracking-wider
                    placeholder:text-foreground-subtle
                    focus:outline-none
                    transition-colors
                    ${ftpError ? "border-red-500/60 focus:border-red-500" : "border-white/10 focus:border-coral"}
                  `}
                  style={{ transitionDuration: "var(--duration-fast)" }}
                />
                <Button onClick={handleCalculate} size="lg" className="w-full sm:w-auto">
                  Calculate
                </Button>
              </div>
              {ftpError && (
                <p className="text-red-400 text-xs mt-1" role="alert">
                  {ftpError}
                </p>
              )}
            </div>

            {/* Results */}
            <div aria-live="polite" aria-atomic="false">
              <AnimatePresence mode="wait">
                {calculated && ftpValue > 0 && (
                  <motion.div
                    className="space-y-3"
                    key={ftpValue}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {/* Header + Copy */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
                      <h2 className="font-heading text-xl sm:text-2xl text-off-white">
                        YOUR SWEET SPOT — {ftpValue}W FTP
                      </h2>
                      <button
                        onClick={handleCopyResults}
                        aria-label={
                          copied
                            ? "Results copied to clipboard"
                            : "Copy results to clipboard"
                        }
                        className="self-start sm:self-auto shrink-0 inline-flex items-center min-h-[44px] px-3 -ml-3 sm:ml-0 text-sm text-coral hover:text-coral/80 font-heading tracking-wider transition-colors cursor-pointer"
                      >
                        {copied ? "Copied!" : "Copy Results"}
                      </button>
                    </div>

                    {/* Visual zone band */}
                    <motion.div
                      className="bg-background-elevated rounded-xl border border-white/5 p-6 mb-6"
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      <h3 className="font-heading text-lg text-off-white mb-4">
                        POWER ZONES AROUND SWEET SPOT
                      </h3>
                      {/* Visual bar chart */}
                      <div className="space-y-3">
                        {ZONE_BANDS.map((band, i) => {
                          const minW = Math.round((band.minPct / 100) * ftpValue);
                          const maxW = Math.round((band.maxPct / 100) * ftpValue);
                          const isSweetSpot = band.name === "Sweet Spot";
                          /* Width relative to max zone (threshold tops at 105%) */
                          const barWidth = ((band.maxPct - band.minPct) / 105) * 100;
                          const barOffset = ((band.minPct - 76) / 105) * 100;

                          return (
                            <motion.div
                              key={band.name}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                duration: 0.35,
                                delay: 0.15 + i * 0.08,
                                ease: [0.16, 1, 0.3, 1],
                              }}
                            >
                              <div className="flex items-baseline justify-between mb-1">
                                <span
                                  className={`font-heading text-sm ${isSweetSpot ? "text-coral" : "text-foreground-muted"}`}
                                >
                                  {band.label.toUpperCase()}
                                </span>
                                <span
                                  className={`font-heading text-lg ${isSweetSpot ? "text-coral stat-glow" : "text-off-white"}`}
                                >
                                  {minW}-{maxW}W
                                </span>
                              </div>
                              <div className="relative h-8 rounded-md bg-white/5 overflow-hidden">
                                <motion.div
                                  className={`absolute top-0 h-full rounded-md ${isSweetSpot ? "ring-2 ring-coral/40" : ""}`}
                                  style={{
                                    left: `${barOffset}%`,
                                    width: `${barWidth}%`,
                                    backgroundColor: band.color,
                                    opacity: isSweetSpot ? 1 : 0.5,
                                  }}
                                  initial={{ scaleX: 0 }}
                                  animate={{ scaleX: 1 }}
                                  transition={{
                                    duration: 0.6,
                                    delay: 0.2 + i * 0.1,
                                    ease: [0.16, 1, 0.3, 1],
                                  }}
                                />
                              </div>
                              <p className="text-xs text-foreground-subtle mt-1">
                                {band.minPct}-{band.maxPct}% FTP
                                {isSweetSpot && " — your target zone"}
                              </p>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>

                    {/* Sweet spot highlight card */}
                    <motion.div
                      className="bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal rounded-xl border border-coral/20 p-6 mb-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.25 }}
                    >
                      <p className="font-heading text-coral text-xs tracking-widest mb-2">
                        YOUR SWEET SPOT TARGET
                      </p>
                      <p className="font-heading text-3xl sm:text-4xl text-off-white stat-glow">
                        {ssMin}-{ssMax}W
                      </p>
                      <p className="text-foreground-muted text-sm mt-2">
                        88-94% of your {ftpValue}W FTP. Set your trainer or head
                        unit to this range and hold it there.
                      </p>
                    </motion.div>

                    {/* Session Builder */}
                    <motion.div
                      className="bg-background-elevated rounded-xl border border-white/5 p-6 mb-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                    >
                      <h3 className="font-heading text-lg text-off-white mb-2">
                        SESSION BUILDER
                      </h3>
                      <p className="text-sm text-foreground-muted mb-4">
                        How much sweet spot time do you want today? Pick a target
                        and get a session structure.
                      </p>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {[30, 45, 60, 90].map((mins) => (
                          <button
                            key={mins}
                            onClick={() => setSessionTarget(mins)}
                            className={`
                              px-4 py-2 rounded-lg font-heading text-sm tracking-wider transition-all cursor-pointer
                              ${
                                sessionTarget === mins
                                  ? "bg-coral text-off-white"
                                  : "bg-white/5 text-foreground-muted hover:bg-white/10 hover:text-off-white border border-white/10"
                              }
                            `}
                          >
                            {mins} MIN
                          </button>
                        ))}
                      </div>

                      <div className="space-y-4">
                        {displaySessions.map((session, i) => (
                          <motion.div
                            key={session.name}
                            className="bg-white/5 rounded-lg border border-white/5 p-5"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              duration: 0.3,
                              delay: 0.35 + i * 0.06,
                            }}
                          >
                            <div className="flex items-baseline justify-between mb-2">
                              <h4 className="font-heading text-base text-coral">
                                {session.name.toUpperCase()}
                              </h4>
                              <span className="font-heading text-sm text-foreground-subtle">
                                {session.totalMinutes} MIN
                              </span>
                            </div>
                            <p className="text-off-white text-sm mb-1">
                              {session.structure.replace(
                                "@ sweet spot",
                                `@ ${ssMin}-${ssMax}W`,
                              )}
                            </p>
                            <p className="text-xs text-foreground-muted mb-2">
                              <span className="text-foreground-subtle">Recovery:</span>{" "}
                              {session.recovery}
                            </p>
                            <p className="text-xs text-foreground-subtle italic">
                              {session.when}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Dose decision guide */}
                    <motion.div
                      className="bg-background-elevated rounded-xl border border-white/5 p-6 mb-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 }}
                    >
                      <h3 className="font-heading text-lg text-off-white mb-2">
                        DOSE QUESTIONS BY TRAINING PHASE
                      </h3>
                      <p className="text-sm text-foreground-muted mb-4">
                        Research does not provide one weekly amount. Use the
                        phase as context, then judge the complete programme and
                        the rider&apos;s response.
                      </p>

                      {/* Desktop table */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-white/10">
                              <th className="text-left font-heading text-foreground-muted py-3 pr-4">
                                PHASE
                              </th>
                              <th className="text-left font-heading text-foreground-muted py-3 pr-4">
                                VOLUME CONTEXT
                              </th>
                              <th className="text-left font-heading text-foreground-muted py-3 pr-4">
                                WORK DECISION
                              </th>
                              <th className="text-left font-heading text-foreground-muted py-3 pr-4">
                                FREQUENCY CHECK
                              </th>
                              <th className="text-left font-heading text-foreground-muted py-3">
                                NOTES
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {VOLUME_PHASES.map((vp, i) => (
                              <tr
                                key={vp.phase}
                                className={
                                  i < VOLUME_PHASES.length - 1
                                    ? "border-b border-white/5"
                                    : ""
                                }
                              >
                                <td className="py-3 pr-4 text-off-white font-medium">
                                  {vp.phase}
                                </td>
                                <td className="py-3 pr-4 text-foreground-muted">
                                  {vp.weeklyHours}
                                </td>
                                <td className="py-3 pr-4 text-coral font-heading">
                                  {vp.ssMinutes}
                                </td>
                                <td className="py-3 pr-4 text-foreground-muted">
                                  {vp.sessions}
                                </td>
                                <td className="py-3 text-foreground-subtle text-xs">
                                  {vp.notes}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile cards */}
                      <div className="md:hidden space-y-4">
                        {VOLUME_PHASES.map((vp) => (
                          <div
                            key={vp.phase}
                            className="bg-white/5 rounded-lg p-4"
                          >
                            <p className="font-heading text-sm text-off-white mb-2">
                              {vp.phase.toUpperCase()}
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                              <div>
                                <span className="text-foreground-subtle">
                                  Volume context:{" "}
                                </span>
                                <span className="text-foreground-muted">
                                  {vp.weeklyHours}
                                </span>
                              </div>
                              <div>
                                <span className="text-foreground-subtle">
                                  Work decision:{" "}
                                </span>
                                <span className="text-coral">{vp.ssMinutes}</span>
                              </div>
                              <div>
                                <span className="text-foreground-subtle">
                                  Frequency check:{" "}
                                </span>
                                <span className="text-foreground-muted">
                                  {vp.sessions}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-foreground-subtle">
                              {vp.notes}
                            </p>
                          </div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Comparison: Sweet Spot vs Tempo vs Threshold */}
                    <motion.div
                      className="bg-background-elevated rounded-xl border border-white/5 p-6 mb-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.45 }}
                    >
                      <h3 className="font-heading text-lg text-off-white mb-2">
                        SWEET SPOT VS TEMPO VS THRESHOLD
                      </h3>
                      <p className="text-sm text-foreground-muted mb-4">
                        These are bands in one power model. The table compares
                        their prescription roles without treating the cutoffs
                        as physiological switches.
                      </p>

                      {/* Desktop table */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-white/10">
                              <th className="text-left font-heading text-foreground-muted py-3 pr-4">
                                &nbsp;
                              </th>
                              <th className="text-left font-heading text-foreground-muted py-3 pr-4">
                                TEMPO
                              </th>
                              <th className="text-left font-heading text-coral py-3 pr-4">
                                SWEET SPOT
                              </th>
                              <th className="text-left font-heading text-foreground-muted py-3">
                                THRESHOLD
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {COMPARISON_DATA.map((row, i) => (
                              <tr
                                key={row.attribute}
                                className={
                                  i < COMPARISON_DATA.length - 1
                                    ? "border-b border-white/5"
                                    : ""
                                }
                              >
                                <td className="py-3 pr-4 text-off-white font-medium text-xs">
                                  {row.attribute}
                                </td>
                                <td className="py-3 pr-4 text-foreground-muted text-xs">
                                  {row.tempo}
                                </td>
                                <td className="py-3 pr-4 text-off-white text-xs">
                                  {row.sweetSpot}
                                </td>
                                <td className="py-3 text-foreground-muted text-xs">
                                  {row.threshold}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile cards */}
                      <div className="md:hidden space-y-4">
                        {COMPARISON_DATA.map((row) => (
                          <div
                            key={row.attribute}
                            className="bg-white/5 rounded-lg p-4"
                          >
                            <p className="font-heading text-xs text-foreground-subtle mb-2">
                              {row.attribute.toUpperCase()}
                            </p>
                            <div className="space-y-1 text-xs">
                              <p>
                                <span className="text-foreground-subtle">Tempo: </span>
                                <span className="text-foreground-muted">{row.tempo}</span>
                              </p>
                              <p>
                                <span className="text-coral">Sweet Spot: </span>
                                <span className="text-off-white">{row.sweetSpot}</span>
                              </p>
                              <p>
                                <span className="text-foreground-subtle">Threshold: </span>
                                <span className="text-foreground-muted">{row.threshold}</span>
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Methodology / Science */}
                    <motion.div
                      className="mt-8 bg-deep-purple/30 rounded-xl border border-purple/20 p-8"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.5 }}
                    >
                      <h3 className="font-heading text-xl text-off-white mb-4">
                        WHAT THE EVIDENCE CAN SUPPORT
                      </h3>
                      <div className="space-y-3 text-foreground-muted text-sm leading-relaxed">
                        <p>
                          <strong className="text-off-white">
                            Where the name comes from.
                          </strong>{" "}
                          Sweet spot is a coaching convention commonly displayed
                          at 88-94% FTP. In the classic power model it overlaps
                          upper tempo and lower threshold. It is not a separate
                          measured physiological zone, and no direct evidence
                          validates a universal percentage-of-benefit formula.
                        </p>
                        <p>
                          <strong className="text-off-white">
                            Why it works.
                          </strong>{" "}
                          The calculator multiplies FTP by 0.88 and 0.94. That
                          arithmetic does not show where an individual&apos;s
                          physiological thresholds sit. FTP20 research reports
                          large limits of agreement with other markers, so keep
                          the test method attached to the value and adjust when
                          the planned work is not repeatable.
                        </p>
                        <p>
                          <strong className="text-off-white">
                            The polarised debate.
                          </strong>{" "}
                          Recent reviews find that several training-intensity
                          distributions can improve cycling performance. They do
                          not establish sweet spot as universally best for
                          time-crunched riders or polarised training as
                          universally superior. Athlete level, intervention
                          length and the complete programme matter.
                        </p>
                        <p>
                          <strong className="text-off-white">
                            When to choose threshold instead.
                          </strong>{" "}
                          Choose threshold when sustained work near FTP matches
                          the goal and the rider can absorb it. Choose sweet spot
                          when controlled sub-threshold work solves the current
                          problem. Neither band comes with a universal block
                          length, frequency, recovery time or guaranteed gain.
                        </p>
                        <p>
                          Read the{" "}
                          <Link
                            href="/blog/sweet-spot-training-cycling-guide"
                            className="text-coral hover:text-coral/80 transition-colors"
                          >
                            evidence-reviewed sweet spot guide
                          </Link>{" "}
                          for the source record, masters guidance and progression
                          boundaries behind this calculator.
                        </p>
                      </div>
                    </motion.div>

                    {/* Learn More */}
                    <motion.div
                      className="mt-8 rounded-xl border border-white/10 p-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.55 }}
                    >
                      <h3 className="font-heading text-lg text-off-white mb-3">
                        LEARN MORE
                      </h3>
                      <ul className="space-y-2">
                        <li>
                          <Link
                            href="/blog/sweet-spot-training-cycling-guide"
                            className="text-coral hover:text-coral/80 text-sm transition-colors"
                          >
                            Sweet Spot Training Guide — evidence and dose boundaries
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/tools/ftp-zones"
                            className="text-coral hover:text-coral/80 text-sm transition-colors"
                          >
                            FTP Zone Calculator — full 7-zone breakdown
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/tools/tss"
                            className="text-coral hover:text-coral/80 text-sm transition-colors"
                          >
                            TSS Calculator — quantify session stress
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/tools/ftp-test"
                            className="text-coral hover:text-coral/80 text-sm transition-colors"
                          >
                            FTP Test Calculator — find your FTP first
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/topics/ftp-training"
                            className="text-coral hover:text-coral/80 text-sm transition-colors"
                          >
                            FTP Training topic hub
                          </Link>
                        </li>
                      </ul>
                    </motion.div>

                    {/* Coaching CTA */}
                    <motion.div
                      className="mt-8 rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-6 md:p-8 text-center"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.6 }}
                    >
                      <p className="font-heading text-coral text-xs tracking-widest mb-2">
                        WANT A STRUCTURED PLAN BUILT AROUND {ssMin}-{ssMax}W?
                      </p>
                      <p className="text-off-white font-heading text-lg md:text-xl mb-2">
                        Roadman coaching writes your week around these exact
                        numbers.
                      </p>
                      <p className="text-foreground-muted text-sm mb-5 max-w-md mx-auto">
                        Personalised TrainingPeaks plan, weekly calls, five
                        pillars. 7-day free trial. $195/month.
                      </p>
                      <a
                        href="/apply"
                        className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm transition-all"
                        data-track="tool_sweet_spot_apply"
                      >
                        Apply for Coaching
                      </a>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Container>
        </Section>

        <ToolLanding slug="sweet-spot" />
      </main>
      <Footer />
    </>
  );
}
