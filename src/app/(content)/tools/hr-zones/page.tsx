"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { ToolLanding } from "@/components/features/tools/ToolLanding";
import {
  calculateHeartRateZones,
  formatHeartRateZoneRange,
} from "@/lib/hr-zones";

function getHrError(value: string): string | null {
  if (!value) return null;
  const num = Number(value);
  if (!Number.isFinite(num) || !Number.isInteger(num)) {
    return "Please enter a whole number";
  }
  if (num < 100) return "Heart rate must be at least 100 bpm";
  if (num > 220) return "Heart rate must be 220 bpm or lower";
  return null;
}

export default function HRZonesPage() {
  const [method, setMethod] = useState<"maxhr" | "lthr">("maxhr");
  const [hr, setHr] = useState("");
  const [calculated, setCalculated] = useState(false);
  const [copied, setCopied] = useState(false);
  const hrValue = Number(hr) || 0;
  const hrError = getHrError(hr);
  const canCalculate = hrValue >= 100 && hrValue <= 220 && !hrError;

  const zones = calculateHeartRateZones(hrValue, method);

  const handleCopy = async () => {
    if (!calculated || hrValue <= 0) return;
    const lines = zones
      .map((zone) => `${zone.name}: ${formatHeartRateZoneRange(zone)} bpm`)
      .join("\n");
    const label = method === "maxhr" ? `Max HR ${hrValue}` : `LTHR ${hrValue}`;
    await navigator.clipboard.writeText(`HR Zones (${label})\n${lines}\n— roadmancycling.com/tools/hr-zones`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Header />
      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow" className="text-center">
            <p className="text-coral text-sm font-body font-medium uppercase tracking-widest mb-4">Free Tool</p>
            <h1 className="font-heading text-off-white mb-4" style={{ fontSize: "var(--text-section)" }}>
              CYCLING HEART RATE ZONES CALCULATOR
            </h1>
            <p className="text-foreground-muted text-lg">
              Calculate five continuous bpm ranges from cycling Max HR or LTHR.
            </p>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <div className="bg-background-elevated rounded-xl border border-white/5 p-8 mb-8">
              <div className="flex gap-3 mb-6" role="tablist" aria-label="Calculation method">
                <button
                  role="tab"
                  aria-selected={method === "maxhr"}
                  aria-label="Calculate from maximum heart rate"
                  onClick={() => { setMethod("maxhr"); setCalculated(false); }}
                  className={`flex-1 min-h-[44px] py-2.5 rounded-lg font-heading text-sm tracking-wider transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-coral ${method === "maxhr" ? "bg-coral text-off-white" : "bg-white/5 text-foreground-muted hover:bg-white/10"}`}
                >
                  MAX HR
                </button>
                <button
                  role="tab"
                  aria-selected={method === "lthr"}
                  aria-label="Calculate from lactate threshold heart rate"
                  onClick={() => { setMethod("lthr"); setCalculated(false); }}
                  className={`flex-1 min-h-[44px] py-2.5 rounded-lg font-heading text-sm tracking-wider transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-coral ${method === "lthr" ? "bg-coral text-off-white" : "bg-white/5 text-foreground-muted hover:bg-white/10"}`}
                >
                  LTHR
                </button>
              </div>

              <label htmlFor="hr-input" className="block font-heading text-lg text-off-white mb-2">
                {method === "maxhr" ? "YOUR MAX HEART RATE (BPM)" : "YOUR LTHR (BPM)"}
              </label>
              <p className="text-sm text-foreground-muted mb-4">
                {method === "maxhr"
                  ? "Use a measured cycling max where possible; age formulas are rough population estimates."
                  : "Use a lab value or a repeatable cycling field estimate and keep the method recorded."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  id="hr-input"
                  type="number"
                  inputMode="numeric"
                  min="100"
                  max="220"
                  aria-label={method === "maxhr" ? "Your maximum heart rate in bpm" : "Your lactate threshold heart rate in bpm"}
                  aria-invalid={!!hrError}
                  placeholder={method === "maxhr" ? "e.g. 185" : "e.g. 170"}
                  value={hr}
                  onChange={(e) => { setHr(e.target.value); setCalculated(false); }}
                  onKeyDown={(e) => { if (e.key === "Enter" && canCalculate) setCalculated(true); }}
                  className={`flex-1 bg-white/5 border rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:outline-none transition-colors ${hrError ? "border-red-500/60 focus:border-red-500" : "border-white/10 focus:border-coral"}`}
                />
                <Button onClick={() => canCalculate && setCalculated(true)} size="lg" className="w-full sm:w-auto">
                  Calculate
                </Button>
              </div>
              {hrError && (
                <p className="text-red-400 text-xs mt-2" role="alert">{hrError}</p>
              )}
            </div>

            <div aria-live="polite" aria-atomic="false">
            <AnimatePresence mode="wait">
              {calculated && canCalculate && (
                <motion.div
                  key={`${method}-${hrValue}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                    <h2 className="font-heading text-xl sm:text-2xl text-off-white">
                      YOUR HR ZONES — {hrValue} BPM {method === "maxhr" ? "MAX" : "LTHR"}
                    </h2>
                    <button onClick={handleCopy} aria-label={copied ? "Results copied to clipboard" : "Copy heart rate zones to clipboard"} className="self-start sm:self-auto shrink-0 inline-flex items-center min-h-[44px] px-3 -ml-3 sm:ml-0 text-sm text-coral hover:text-coral/80 font-heading tracking-wider transition-colors cursor-pointer">
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>

                  {zones.map((zone) => {
                    return (
                      <div key={zone.name} className="bg-background-elevated rounded-lg border border-white/5 p-4 flex items-center gap-3 sm:gap-4">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: zone.color }} />
                        <div className="flex-1 min-w-0">
                          <p className="font-heading text-off-white text-sm">{zone.name}</p>
                          <p className="text-xs text-foreground-muted">{zone.description}</p>
                        </div>
                        <p className="font-heading text-off-white text-base sm:text-lg tracking-wider shrink-0 whitespace-nowrap">
                          {formatHeartRateZoneRange(zone)} <span className="text-xs text-foreground-subtle">bpm</span>
                        </p>
                      </div>
                    );
                  })}

                  <motion.div
                    className="mt-8 rounded-xl border border-white/10 p-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.4 }}
                  >
                    <h3 className="font-heading text-lg text-off-white mb-3">LEARN MORE</h3>
                    <ul className="space-y-2">
                      <li><Link href="/blog/zone-2-cycling-heart-rate-vs-power-vs-rpe" className="text-coral hover:text-coral/80 text-sm transition-colors">Zone 2 Training: Complete Guide</Link></li>
                      <li><Link href="/blog/heart-rate-high-cycling-fixable-reasons" className="text-coral hover:text-coral/80 text-sm transition-colors">Why Is My Heart Rate So High on the Bike?</Link></li>
                      <li><Link href="/tools/ftp-zones" className="text-coral hover:text-coral/80 text-sm transition-colors">FTP Zone Calculator (power-based zones)</Link></li>
                      <li><Link href="/compare/heart-rate-vs-power" className="text-coral hover:text-coral/80 text-sm transition-colors">Heart Rate vs Power: Which Should You Use?</Link></li>
                      <li><Link href="/topics/ftp-training" className="text-coral hover:text-coral/80 text-sm transition-colors">FTP Training topic hub →</Link></li>
                      <li><Link href="/podcast/ep-2095-secret-to-cycling-fast-at-a-low-heart-rate-prof-seiler" className="text-coral hover:text-coral/80 text-sm transition-colors">Podcast: Prof. Seiler on cycling fast at a low heart rate</Link></li>
                    </ul>
                  </motion.div>

                  <motion.div
                    className="mt-8 rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-6 md:p-8 text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.5 }}
                  >
                    <p className="font-heading text-coral text-xs tracking-widest mb-2">WANT THESE ZONES IN A REAL PLAN?</p>
                    <p className="text-off-white font-heading text-lg md:text-xl mb-2">Coaching turns these starting ranges into an individual training week.</p>
                    <p className="text-foreground-muted text-sm mb-5 max-w-md mx-auto">$195/month. 7-day free trial.</p>
                    <a href="/apply" className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm transition-all" data-track="tool_hr_apply">
                      Apply for Coaching →
                    </a>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            </div>
          </Container>
        </Section>

        <ToolLanding slug="hr-zones" />
      </main>
      <Footer />
    </>
  );
}
