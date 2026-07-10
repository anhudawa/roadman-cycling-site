"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { ToolLanding } from "@/components/features/tools/ToolLanding";

const TSB_ZONES = [
  { min: -Infinity, max: -30, label: "Overreaching", desc: "High fatigue accumulation. Risk of overtraining if sustained.", color: "#EF4444" },
  { min: -30, max: -10, label: "Productive training", desc: "Carrying fatigue from solid training. Normal during a training block.", color: "#F97316" },
  { min: -10, max: 5, label: "Grey zone", desc: "Moderate form. Maintaining but not peaking.", color: "#EAB308" },
  { min: 5, max: 25, label: "Fresh / race ready", desc: "Good taper. Race-day form window.", color: "#22C55E" },
  { min: 25, max: Infinity, label: "Detrained", desc: "Extended rest. Fitness dropping — time to rebuild.", color: "#3B82F6" },
];

function getTsbZone(tsb: number) {
  return TSB_ZONES.find((z) => tsb >= z.min && tsb < z.max) || TSB_ZONES[TSB_ZONES.length - 1];
}

const LIGHT_WEEK = [35, 45, 0, 50, 40, 55, 0];
const MODERATE_WEEK = [55, 70, 0, 65, 60, 80, 0];
const HEAVY_WEEK = [75, 90, 0, 85, 80, 110, 0];

function calculatePMC(days: number[]) {
  if (days.length === 0) return { ctl: 0, atl: 0, tsb: 0 };

  let ctl = days[0];
  let atl = days[0];

  for (let i = 1; i < days.length; i++) {
    ctl = ctl + (days[i] - ctl) * (1 / 42);
    atl = atl + (days[i] - atl) * (1 / 7);
  }

  return { ctl, atl, tsb: ctl - atl };
}

export default function TrainingLoadPage() {
  const [days, setDays] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [calculated, setCalculated] = useState(false);

  const { ctl, atl, tsb } = calculatePMC(days);
  const tsbZone = getTsbZone(tsb);

  const maxTss = Math.max(...days, 1);

  const updateDay = (index: number, value: string) => {
    const num = parseInt(value) || 0;
    const clamped = Math.max(0, Math.min(num, 999));
    const updated = [...days];
    updated[index] = clamped;
    setDays(updated);
    setCalculated(false);
  };

  const addDay = () => {
    if (days.length < 84) {
      setDays([...days, 0]);
      setCalculated(false);
    }
  };

  const removeDay = () => {
    if (days.length > 1) {
      setDays(days.slice(0, -1));
      setCalculated(false);
    }
  };

  const applyPreset = (preset: number[]) => {
    const filled: number[] = [];
    for (let i = 0; i < days.length; i++) {
      filled.push(preset[i % preset.length]);
    }
    setDays(filled);
    setCalculated(false);
  };

  const setRestDay = () => {
    // Set the last day to 0
    const updated = [...days];
    updated[updated.length - 1] = 0;
    setDays(updated);
    setCalculated(false);
  };

  return (
    <>
      <Header />
      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow" className="text-center">
            <p className="text-coral text-sm font-body font-medium uppercase tracking-widest mb-4">Free Tool</p>
            <h1 className="font-heading text-off-white mb-4" style={{ fontSize: "var(--text-section)" }}>
              TRAINING LOAD CALCULATOR
            </h1>
            <p className="text-foreground-muted text-lg">
              Daily TSS in. CTL, ATL, and TSB out. See where you sit on the fitness-fatigue curve.
            </p>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <div className="bg-background-elevated rounded-xl border border-white/5 p-8 mb-8">
              {/* Presets */}
              <div className="mb-6">
                <label className="block font-heading text-sm text-off-white mb-2">QUICK FILL</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => applyPreset(LIGHT_WEEK)}
                    className="text-xs font-heading tracking-wider uppercase rounded-md border border-white/10 bg-white/5 text-off-white hover:border-coral/40 hover:bg-coral/10 px-3 py-2 transition-all"
                  >
                    Light week (~40 avg)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset(MODERATE_WEEK)}
                    className="text-xs font-heading tracking-wider uppercase rounded-md border border-white/10 bg-white/5 text-off-white hover:border-coral/40 hover:bg-coral/10 px-3 py-2 transition-all"
                  >
                    Moderate week (~60 avg)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset(HEAVY_WEEK)}
                    className="text-xs font-heading tracking-wider uppercase rounded-md border border-white/10 bg-white/5 text-off-white hover:border-coral/40 hover:bg-coral/10 px-3 py-2 transition-all"
                  >
                    Heavy week (~80 avg)
                  </button>
                  <button
                    type="button"
                    onClick={setRestDay}
                    className="text-xs font-heading tracking-wider uppercase rounded-md border border-white/10 bg-white/5 text-off-white hover:border-coral/40 hover:bg-coral/10 px-3 py-2 transition-all"
                  >
                    Rest day (last = 0)
                  </button>
                </div>
              </div>

              {/* Day inputs */}
              <div className="mb-6">
                <label className="block font-heading text-sm text-off-white mb-2">
                  DAILY TSS VALUES ({days.length} {days.length === 1 ? "day" : "days"})
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {days.map((val, i) => (
                    <div key={i} className="relative">
                      <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        max="999"
                        value={val || ""}
                        placeholder="0"
                        aria-label={`Day ${i + 1} TSS`}
                        onChange={(e) => updateDay(i, e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-off-white text-sm font-heading tracking-wider text-center placeholder:text-foreground-subtle focus:outline-none focus:border-coral transition-colors"
                      />
                      <span className="text-foreground-subtle text-[10px] block text-center mt-0.5">
                        D{i + 1}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={addDay}
                    disabled={days.length >= 84}
                    className="text-xs font-heading tracking-wider uppercase text-coral hover:text-coral/80 disabled:text-foreground-subtle disabled:cursor-not-allowed transition-colors"
                  >
                    + Add 1 day
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const toAdd = Math.min(7, 84 - days.length);
                      if (toAdd > 0) {
                        setDays([...days, ...Array(toAdd).fill(0)]);
                        setCalculated(false);
                      }
                    }}
                    disabled={days.length >= 84}
                    className="text-xs font-heading tracking-wider uppercase text-coral hover:text-coral/80 disabled:text-foreground-subtle disabled:cursor-not-allowed transition-colors"
                  >
                    + Add 7 days
                  </button>
                  <button
                    type="button"
                    onClick={removeDay}
                    disabled={days.length <= 1}
                    className="text-xs font-heading tracking-wider uppercase text-red-400 hover:text-red-300 disabled:text-foreground-subtle disabled:cursor-not-allowed transition-colors"
                  >
                    - Remove last
                  </button>
                </div>
              </div>

              <Button
                onClick={() => days.some((d) => d > 0) && setCalculated(true)}
                size="lg"
                className="w-full"
              >
                Calculate Training Load
              </Button>
            </div>

            <div aria-live="polite" aria-atomic="false">
              <AnimatePresence mode="wait">
                {calculated && (
                  <motion.div
                    key={days.join("-")}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Big CTL number */}
                    <div className="text-center mb-8">
                      <p className="font-heading text-6xl md:text-8xl text-coral mb-2">{Math.round(ctl)}</p>
                      <p className="font-heading text-xl text-off-white">CHRONIC TRAINING LOAD (CTL)</p>
                      <p className="text-foreground-muted text-sm mt-1">Your fitness — the 42-day weighted average of daily TSS</p>
                    </div>

                    {/* ATL and TSB */}
                    <div className="flex items-center justify-center gap-8 mb-8 text-center">
                      <div>
                        <p className="font-heading text-3xl text-off-white">{Math.round(atl)}</p>
                        <p className="text-foreground-subtle text-sm">ATL (Fatigue)</p>
                        <p className="text-foreground-subtle text-xs">7-day average</p>
                      </div>
                      <div>
                        <p className="font-heading text-3xl" style={{ color: tsbZone.color }}>
                          {tsb >= 0 ? "+" : ""}{Math.round(tsb)}
                        </p>
                        <p className="text-foreground-subtle text-sm">TSB (Form)</p>
                        <p className="text-foreground-subtle text-xs">CTL minus ATL</p>
                      </div>
                    </div>

                    {/* TSB interpretation */}
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 mb-8 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tsbZone.color }} />
                        <p className="font-heading text-lg text-off-white">{tsbZone.label.toUpperCase()}</p>
                      </div>
                      <p className="text-foreground-muted text-sm">{tsbZone.desc}</p>
                    </div>

                    {/* TSS bar chart */}
                    <div className="mb-8">
                      <p className="font-heading text-sm text-off-white mb-3">DAILY TSS</p>
                      <div className="flex items-end gap-1" style={{ height: "120px" }}>
                        {days.map((val, i) => {
                          const heightPct = maxTss > 0 ? (val / maxTss) * 100 : 0;
                          const barColor = val === 0 ? "rgba(255,255,255,0.05)" : val < 60 ? "#22C55E" : val < 120 ? "#3B82F6" : val < 200 ? "#EAB308" : "#EF4444";
                          return (
                            <motion.div
                              key={i}
                              className="flex-1 rounded-t-sm"
                              style={{ backgroundColor: barColor, minHeight: val > 0 ? "4px" : "2px" }}
                              initial={{ height: 0 }}
                              animate={{ height: `${Math.max(heightPct, 2)}%` }}
                              transition={{ duration: 0.5, delay: i * 0.02 }}
                              title={`Day ${i + 1}: ${val} TSS`}
                            />
                          );
                        })}
                      </div>
                      <div className="flex justify-between text-foreground-subtle text-[10px] mt-1">
                        <span>Day 1</span>
                        <span>Day {days.length}</span>
                      </div>
                    </div>

                    {/* TSB zone scale */}
                    <div className="space-y-2 mb-8">
                      {TSB_ZONES.map((z) => {
                        const isActive = tsb >= z.min && tsb < z.max;
                        return (
                          <div
                            key={z.label}
                            className={`flex items-center gap-4 rounded-lg p-3 transition-all ${isActive ? "bg-white/[0.08] border border-white/15" : ""}`}
                          >
                            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: z.color }} />
                            <span className="text-off-white text-sm flex-1">{z.label}</span>
                            <span className="text-foreground-subtle text-xs">
                              {z.min === -Infinity ? `< -30` : z.max === Infinity ? `> +25` : `${z.min >= 0 ? "+" : ""}${z.min} to ${z.max >= 0 ? "+" : ""}${z.max}`} TSB
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* What Next */}
                    <div className="rounded-xl border border-white/10 p-6 mb-8">
                      <h3 className="font-heading text-lg text-off-white mb-3">WHAT NEXT?</h3>
                      <ul className="space-y-2">
                        <li><Link href="/tools/tss" className="text-coral hover:text-coral/80 text-sm transition-colors">Calculate TSS for a single ride</Link></li>
                        <li><Link href="/tools/ftp-zones" className="text-coral hover:text-coral/80 text-sm transition-colors">Calculate Your Power Zones</Link></li>
                        <li><Link href="/tools/hr-zones" className="text-coral hover:text-coral/80 text-sm transition-colors">Heart Rate Zone Calculator</Link></li>
                      </ul>
                    </div>

                    {/* CTA box */}
                    <div className="rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-6 md:p-8 text-center">
                      <p className="font-heading text-coral text-xs tracking-widest mb-2">WANT STRUCTURED TRAINING LOAD MANAGEMENT?</p>
                      <p className="text-off-white font-heading text-lg mb-2">Numbers without context are just numbers.</p>
                      <p className="text-foreground-muted text-sm mb-4">
                        A coach reads the CTL trend across weeks, adjusts the load when life gets in the way, and tells you when the taper should start. That is what turns a PMC chart into actual race-day form.
                      </p>
                      <a href="/apply" className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm transition-all" data-track="tool_training-load_apply">
                        Apply for Coaching
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Container>
        </Section>

        <Section background="deep-purple" grain>
          <Container width="narrow">
            <h2 className="font-heading text-off-white mb-4" style={{ fontSize: "var(--text-section)" }}>
              METHODOLOGY
            </h2>
            <div className="text-foreground-muted text-sm leading-relaxed space-y-3">
              <p>
                <strong className="text-off-white">The impulse-response model:</strong> Banister and colleagues introduced the
                fitness-fatigue framework in the 1970s. Every training session produces two competing responses — a slow-building
                fitness gain and a fast-peaking fatigue cost. Performance at any point is the difference between accumulated
                fitness and accumulated fatigue. That difference is what we call form, or TSB.
              </p>
              <p>
                <strong className="text-off-white">CTL (Chronic Training Load):</strong> A 42-day exponentially weighted moving
                average of daily TSS. It represents your accumulated fitness — the body of work you have done over the past
                several weeks. CTL rises slowly and decays slowly, which is why consistent training matters more than any single
                session. The formula: CTL<sub>today</sub> = CTL<sub>yesterday</sub> + (TSS<sub>today</sub> &minus; CTL<sub>yesterday</sub>) &times; (1/42).
              </p>
              <p>
                <strong className="text-off-white">ATL (Acute Training Load):</strong> A 7-day exponentially weighted moving
                average of daily TSS. It represents recent fatigue — how hard the last week has been. ATL responds quickly:
                a single big day can push it well above CTL, and a few rest days bring it back down fast.
                ATL<sub>today</sub> = ATL<sub>yesterday</sub> + (TSS<sub>today</sub> &minus; ATL<sub>yesterday</sub>) &times; (1/7).
              </p>
              <p>
                <strong className="text-off-white">TSB (Training Stress Balance):</strong> Simply CTL minus ATL. When ATL
                exceeds CTL, TSB is negative — you are carrying fatigue and your performance is suppressed. When ATL drops
                below CTL (typically during a taper), TSB goes positive — stored fitness is expressing itself, and you are
                in race-ready form.
              </p>
              <p>
                <strong className="text-off-white">Coggan, Allen, and TrainingPeaks:</strong> Dr. Andrew Coggan and Hunter Allen
                adapted Banister&apos;s model for cycling with power data, and TrainingPeaks built the Performance Management Chart
                (PMC) that popularised CTL, ATL, and TSB as the standard training-load vocabulary. The PMC remains one of the
                most useful single views in endurance coaching.
              </p>
              <p>
                <strong className="text-off-white">Limitations:</strong> The 42-day and 7-day time constants are population
                averages — your personal response curve may differ, particularly if you are a masters rider or have a long
                endurance background. TSB treats all TSS equally: 100 TSS from a Zone 2 ride and 100 TSS from VO2max
                intervals carry identical weight in the model, even though the recovery demand is very different. The model
                also ignores life stress, sleep quality, and illness — all of which affect real-world readiness. Use TSB
                as a trend indicator, not as a single number to race off.
              </p>
              <p className="text-xs text-foreground-subtle">
                Last updated: July 2026 &middot; Tool version 1.0
              </p>
            </div>
          </Container>
        </Section>

        <ToolLanding slug="training-load" />
      </main>
      <Footer />
    </>
  );
}
