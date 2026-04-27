"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";

interface HRZone {
  name: string;
  description: string;
  minPercent: number;
  maxPercent: number;
  color: string;
}

const ZONES_MAX_HR: HRZone[] = [
  { name: "Zone 1 — Recovery", description: "Easy spinning. Active recovery.", minPercent: 50, maxPercent: 60, color: "#94A3B8" },
  { name: "Zone 2 — Endurance", description: "Conversational pace. Build your aerobic base here.", minPercent: 60, maxPercent: 70, color: "#3B82F6" },
  { name: "Zone 3 — Tempo", description: "Comfortably hard. Moderate aerobic work.", minPercent: 70, maxPercent: 80, color: "#22C55E" },
  { name: "Zone 4 — Threshold", description: "Hard. Sustainable for 20-60 minutes.", minPercent: 80, maxPercent: 90, color: "#EAB308" },
  { name: "Zone 5 — VO2max", description: "Very hard. Short intervals only.", minPercent: 90, maxPercent: 100, color: "#EF4444" },
];

const ZONES_LTHR: HRZone[] = [
  { name: "Zone 1 — Recovery", description: "Easy spinning. Active recovery.", minPercent: 0, maxPercent: 81, color: "#94A3B8" },
  { name: "Zone 2 — Endurance", description: "Conversational pace. Aerobic base.", minPercent: 81, maxPercent: 90, color: "#3B82F6" },
  { name: "Zone 3 — Tempo", description: "Comfortably hard. Moderate effort.", minPercent: 90, maxPercent: 94, color: "#22C55E" },
  { name: "Zone 4 — Threshold", description: "Hard. Race pace for 1 hour.", minPercent: 94, maxPercent: 100, color: "#EAB308" },
  { name: "Zone 5 — VO2max", description: "Very hard. Short intervals.", minPercent: 100, maxPercent: 106, color: "#EF4444" },
];

export default function HRZonesPage() {
  const [method, setMethod] = useState<"maxhr" | "lthr">("maxhr");
  const [hr, setHr] = useState("");
  const [calculated, setCalculated] = useState(false);
  const [copied, setCopied] = useState(false);
  const hrValue = parseInt(hr) || 0;

  const zones = method === "maxhr" ? ZONES_MAX_HR : ZONES_LTHR;

  const handleCopy = async () => {
    if (!calculated || hrValue <= 0) return;
    const lines = zones.map((z) => {
      const min = Math.round((z.minPercent / 100) * hrValue);
      const max = z.maxPercent >= 100 && method === "maxhr" ? hrValue : Math.round((z.maxPercent / 100) * hrValue);
      return `${z.name}: ${min}-${max} bpm`;
    }).join("\n");
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
              HEART RATE ZONE CALCULATOR
            </h1>
            <p className="text-foreground-muted text-lg">
              Enter your max heart rate or LTHR and get your 5 training zones.
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
                  className={`flex-1 py-2 rounded-lg font-heading text-sm tracking-wider transition-all cursor-pointer ${method === "maxhr" ? "bg-coral text-off-white" : "bg-white/5 text-foreground-muted hover:bg-white/10"}`}
                >
                  MAX HR
                </button>
                <button
                  role="tab"
                  aria-selected={method === "lthr"}
                  aria-label="Calculate from lactate threshold heart rate"
                  onClick={() => { setMethod("lthr"); setCalculated(false); }}
                  className={`flex-1 py-2 rounded-lg font-heading text-sm tracking-wider transition-all cursor-pointer ${method === "lthr" ? "bg-coral text-off-white" : "bg-white/5 text-foreground-muted hover:bg-white/10"}`}
                >
                  LTHR
                </button>
              </div>

              <label htmlFor="hr-input" className="block font-heading text-lg text-off-white mb-2">
                {method === "maxhr" ? "YOUR MAX HEART RATE (BPM)" : "YOUR LTHR (BPM)"}
              </label>
              <p className="text-sm text-foreground-muted mb-4">
                {method === "maxhr"
                  ? "Don't know? Try 220 minus your age as a starting estimate."
                  : "Average HR from a 30-minute all-out effort."}
              </p>
              <div className="flex gap-3">
                <input
                  id="hr-input"
                  type="number"
                  min="100"
                  max="220"
                  placeholder={method === "maxhr" ? "e.g. 185" : "e.g. 170"}
                  value={hr}
                  onChange={(e) => { setHr(e.target.value); setCalculated(false); }}
                  onKeyDown={(e) => { if (e.key === "Enter" && hrValue > 100) setCalculated(true); }}
                  className="flex-1 bg-white/5 border border-white/10 focus:border-coral rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:outline-none transition-colors"
                />
                <Button onClick={() => hrValue > 100 && setCalculated(true)} size="lg">
                  Calculate
                </Button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {calculated && hrValue > 100 && (
                <motion.div
                  key={`${method}-${hrValue}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-heading text-2xl text-off-white">
                      YOUR HR ZONES — {hrValue} BPM {method === "maxhr" ? "MAX" : "LTHR"}
                    </h2>
                    <button onClick={handleCopy} className="text-sm text-coral hover:text-coral/80 font-heading tracking-wider transition-colors cursor-pointer">
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>

                  {zones.map((z) => {
                    const min = Math.round((z.minPercent / 100) * hrValue);
                    const max = z.maxPercent >= 100 && method === "maxhr" ? hrValue : Math.round((z.maxPercent / 100) * hrValue);
                    return (
                      <div key={z.name} className="bg-background-elevated rounded-lg border border-white/5 p-4 flex items-center gap-4">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: z.color }} />
                        <div className="flex-1">
                          <p className="font-heading text-off-white text-sm">{z.name}</p>
                          <p className="text-xs text-foreground-muted">{z.description}</p>
                        </div>
                        <p className="font-heading text-off-white text-lg tracking-wider shrink-0">
                          {min}–{max} <span className="text-xs text-foreground-subtle">bpm</span>
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
                      <li><Link href="/blog/zone-2-training-complete-guide" className="text-coral hover:text-coral/80 text-sm transition-colors">Zone 2 Training: Complete Guide</Link></li>
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
                    <p className="text-off-white font-heading text-lg md:text-xl mb-2">Coaching builds your week around these exact numbers.</p>
                    <p className="text-foreground-muted text-sm mb-5 max-w-md mx-auto">$195/month. 7-day free trial.</p>
                    <a href="/apply" className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm transition-all" data-track="tool_hr_apply">
                      Apply for Coaching →
                    </a>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </Container>
        </Section>

        {/* Methodology */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <h2 className="font-heading text-off-white mb-4" style={{ fontSize: "var(--text-section)" }}>
              METHODOLOGY
            </h2>
            <div className="text-foreground-muted text-sm leading-relaxed space-y-3">
              <p>
                <strong className="text-off-white">Max HR method:</strong> Zones are calculated as percentages
                of maximum heart rate using the 5-zone model widely adopted in cycling coaching. Zone boundaries
                at 60%, 70%, 80%, and 90% of max HR.
              </p>
              <p>
                <strong className="text-off-white">LTHR method:</strong> Zones are calculated from lactate
                threshold heart rate using Joe Friel&apos;s methodology from <em>The Cyclist&apos;s Training Bible</em>.
                LTHR-based zones are more accurate because they reflect fitness, not just genetics.
              </p>
              <p>
                <strong className="text-off-white">Limitations:</strong> Heart rate varies with fatigue, heat,
                caffeine, sleep, and stress. Power-based training zones (from FTP) are more consistent for
                interval targeting. Heart rate remains useful for pacing easy rides and monitoring recovery.
              </p>
              <p className="text-xs text-foreground-subtle">
                Last updated: April 2026 · Tool version 1.0
              </p>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
