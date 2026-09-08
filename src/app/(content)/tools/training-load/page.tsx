"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { ToolLanding } from "@/components/features/tools/ToolLanding";
import { calculatePMC } from "@/lib/training-load/pmc";

const LIGHT_WEEK = [35, 45, 0, 50, 40, 55, 0];
const MODERATE_WEEK = [55, 70, 0, 65, 60, 80, 0];
const HEAVY_WEEK = [75, 90, 0, 85, 80, 110, 0];

export default function TrainingLoadPage() {
  const [days, setDays] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [calculated, setCalculated] = useState(false);
  const [startingCtl, setStartingCtl] = useState(0);
  const [startingAtl, setStartingAtl] = useState(0);

  const { ctl, atl, tsb, nextDayTsb } = calculatePMC(days, { ctl: startingCtl, atl: startingAtl });

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
              Enter your starting CTL and ATL, then your daily TSS. See how recorded training and rest days change the three numbers.
            </p>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <div className="bg-background-elevated rounded-xl border border-white/5 p-5 sm:p-8 mb-8">
              <fieldset className="mb-8">
                <legend className="font-heading text-sm text-off-white mb-2">STARTING LOAD</legend>
                <p className="text-foreground-muted text-sm mb-4">
                  Use your CTL and ATL from the end of the day before Day 1. If you leave both at zero,
                  the result is a model starting from no prior load, not an estimate of your current fitness.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { label: "Starting CTL", value: startingCtl, setValue: setStartingCtl },
                    { label: "Starting ATL", value: startingAtl, setValue: setStartingAtl },
                  ].map(({ label, value, setValue }) => (
                    <label key={label} className="text-off-white text-sm">
                      {label}
                      <input type="number" inputMode="decimal" min="0" max="999" step="any"
                        value={value || ""} placeholder="0"
                        onChange={(event) => {
                          const parsed = Number(event.target.value);
                          setValue(Number.isFinite(parsed) ? Math.max(0, Math.min(999, parsed)) : 0);
                          setCalculated(false);
                        }}
                        className="mt-2 block w-full bg-white/5 border border-white/10 rounded-lg p-3 text-off-white focus:outline-none focus:border-coral" />
                    </label>
                  ))}
                </div>
              </fieldset>
              {/* Presets */}
              <div className="mb-6">
                <label className="block font-heading text-sm text-off-white mb-2">EXAMPLE DATA</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => applyPreset(LIGHT_WEEK)}
                    className="text-xs font-heading tracking-wider uppercase rounded-md border border-white/10 bg-white/5 text-off-white hover:border-coral/40 hover:bg-coral/10 px-3 py-2 transition-all"
                  >
                    225 TSS / week
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset(MODERATE_WEEK)}
                    className="text-xs font-heading tracking-wider uppercase rounded-md border border-white/10 bg-white/5 text-off-white hover:border-coral/40 hover:bg-coral/10 px-3 py-2 transition-all"
                  >
                    330 TSS / week
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset(HEAVY_WEEK)}
                    className="text-xs font-heading tracking-wider uppercase rounded-md border border-white/10 bg-white/5 text-off-white hover:border-coral/40 hover:bg-coral/10 px-3 py-2 transition-all"
                  >
                    440 TSS / week
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

              <p className="text-foreground-muted text-sm mb-6">
                Example buttons repeat a seven-day pattern across the entered days. These are demonstration
                values, not recommended training weeks. Enter every calendar day in order, including zero for rest days.
              </p>
              {/* Day inputs */}
              <div className="mb-6">
                <label className="block font-heading text-sm text-off-white mb-2">
                  DAILY TSS VALUES ({days.length} {days.length === 1 ? "day" : "days"})
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
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
                onClick={() => setCalculated(true)}
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
                    key={`${startingCtl}-${startingAtl}-${days.join("-")}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Big CTL number */}
                    <div className="text-center mb-8">
                      <p className="font-heading text-6xl md:text-8xl text-coral mb-2">{Math.round(ctl)}</p>
                      <p className="font-heading text-xl text-off-white">CHRONIC TRAINING LOAD (CTL)</p>
                      <p className="text-foreground-muted text-sm mt-1">Longer-term modelled load at the end of Day {days.length}</p>
                    </div>

                    {/* ATL and TSB */}
                    <div className="flex items-center justify-center gap-8 mb-8 text-center">
                      <div>
                        <p className="font-heading text-3xl text-off-white">{Math.round(atl)}</p>
                        <p className="text-foreground-subtle text-sm">ATL (recent load)</p>
                        <p className="text-foreground-subtle text-xs">End of Day {days.length}</p>
                      </div>
                      <div>
                        <p className="font-heading text-3xl text-coral">
                          {tsb >= 0 ? "+" : ""}{Math.round(tsb)}
                        </p>
                        <p className="text-foreground-subtle text-sm">TSB before Day {days.length}</p>
                        <p className="text-foreground-subtle text-xs">Previous day’s CTL minus ATL</p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 mb-8">
                      <h2 className="font-heading text-lg text-off-white mb-2">READING THIS RESULT</h2>
                      <p className="text-foreground-muted text-sm">
                        TSB before Day {days.length} uses the values from the preceding day.
                        After the final entry, the next day’s TSB would be {nextDayTsb.toFixed(1)}.
                        A negative value means recent modelled load exceeds longer-term load; a positive value means the reverse.
                      </p>
                      <p className="text-foreground-muted text-sm mt-3">
                        The result reflects the starting values and TSS you entered. It cannot establish
                        race readiness, recovery or whether training has improved your performance.
                        Compare it with your actual rides and how you are responding to the work.
                      </p>
                    </div>

                    {/* TSS bar chart */}
                    {days.length > 1 && days.some(tss => tss > 0) && <div className="mb-8">
                      <p className="font-heading text-sm text-off-white mb-3">DAILY TSS</p>
                      <div className="flex items-end gap-1" style={{ height: "120px" }}>
                        {days.map((val, i) => {
                          const heightPct = maxTss > 0 ? (val / maxTss) * 100 : 0;
                          const barColor = val === 0 ? "rgba(255,255,255,0.05)" : "var(--color-coral)";
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
                    </div>}

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
                      <p className="text-off-white font-heading text-lg mb-2">Get help reviewing your training week.</p>
                      <p className="text-foreground-muted text-sm mb-4">
                        Roadman coaching includes an individual TrainingPeaks plan and weekly review by the coaching team. Bring your recent riding, your available time and the event you are preparing for.
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
            <div className="text-foreground-muted text-sm leading-relaxed space-y-4">
              <p>
                The calculator follows the daily recurrences in TrainingPeaks’ help documentation,
                with time constants of 42 days for CTL and 7 for ATL. Starting CTL and ATL apply
                to the day before your first entry. Every entry advances the model by one day.
              </p>
              <p>
                <strong className="text-off-white">CTL today</strong> = CTL yesterday + (TSS today − CTL yesterday) / 42.
                Read the <a href="https://help.trainingpeaks.com/hc/en-us/articles/204071884-Fitness-CTL" className="text-coral underline">TrainingPeaks CTL definition and formula</a>.
              </p>
              <p>
                <strong className="text-off-white">ATL today</strong> = ATL yesterday + (TSS today − ATL yesterday) / 7.
                The shorter time constant makes ATL respond more quickly to the entered load. See the <a href="https://help.trainingpeaks.com/hc/en-us/articles/204071894-Fatigue-ATL" className="text-coral underline">TrainingPeaks ATL definition and formula</a>.
              </p>
              <p>
                <strong className="text-off-white">TSB today</strong> = CTL yesterday − ATL yesterday.
                TrainingPeaks uses the preceding day’s values; subtracting today’s end-of-day values gives
                the following day’s TSB. See the <a href="https://help.trainingpeaks.com/hc/en-us/articles/204071764-Form-TSB" className="text-coral underline">TrainingPeaks TSB documentation</a>.
              </p>
              <p>
                <strong className="text-off-white">Worked example:</strong> start with CTL 60 and ATL 90, then enter one rest day at 0 TSS.
                That day’s TSB is −30. By the end of the day, CTL is 58.6 and ATL is 77.1; the following
                day’s TSB is −18.6. Those are changes in the model, not measured changes in your body.
              </p>
              <p>
                <strong className="text-off-white">Comparing platforms:</strong> differences in starting values, missing days,
                TSS inputs, time constants and the day assigned to TSB can change the result.
                This tool uses the fixed defaults above and rounds only for display.
              </p>
              <p>
                TrainingPeaks uses the labels Fitness, Fatigue and Form for CTL, ATL and TSB.
                The calculation uses training scores; it does not directly measure those physical states.
                Two diaries with identical daily TSS and starting values produce identical outputs here,
                even if the rides and the riders’ responses differ.
              </p>
              <p className="text-xs text-foreground-subtle">Method checked 7 September 2026 · Tool version 2.0</p>
            </div>
          </Container>
        </Section>

        <ToolLanding slug="training-load" />
      </main>
      <Footer />
    </>
  );
}
