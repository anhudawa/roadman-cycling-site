"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { ToolLanding } from "@/components/features/tools/ToolLanding";

const BENCHMARKS = [
  { min: 0, max: 1.5, label: "Beginner", color: "#94A3B8" },
  { min: 1.5, max: 2.5, label: "Recreational", color: "#3B82F6" },
  { min: 2.5, max: 3.0, label: "Fitness cyclist", color: "#22C55E" },
  { min: 3.0, max: 3.5, label: "Competitive amateur", color: "#EAB308" },
  { min: 3.5, max: 4.0, label: "Strong amateur", color: "#F97316" },
  { min: 4.0, max: 4.5, label: "Elite amateur", color: "#EF4444" },
  { min: 4.5, max: 5.0, label: "Semi-pro", color: "#DC2626" },
  { min: 5.0, max: 7.0, label: "Professional", color: "#9333EA" },
];

function getLevel(wkg: number) {
  return BENCHMARKS.find((b) => wkg >= b.min && wkg < b.max) || BENCHMARKS[BENCHMARKS.length - 1];
}

export default function WkgPage() {
  const [ftp, setFtp] = useState("");
  const [weight, setWeight] = useState("");
  const [calculated, setCalculated] = useState(false);

  const ftpVal = parseInt(ftp) || 0;
  const weightVal = parseFloat(weight) || 0;
  const wkg = weightVal > 0 ? ftpVal / weightVal : 0;
  const level = getLevel(wkg);

  return (
    <>
      <Header />
      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow" className="text-center">
            <p className="text-coral text-sm font-body font-medium uppercase tracking-widest mb-4">Free Tool</p>
            <h1 className="font-heading text-off-white mb-4" style={{ fontSize: "var(--text-section)" }}>
              W/KG CALCULATOR
            </h1>
            <p className="text-foreground-muted text-lg">
              Enter your FTP and body weight. See where you stand.
            </p>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <div className="bg-background-elevated rounded-xl border border-white/5 p-8 mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="ftp-input" className="block font-heading text-sm text-off-white mb-2">FTP (WATTS)</label>
                  <input
                    id="ftp-input"
                    type="number"
                    min="50"
                    aria-label="Your Functional Threshold Power in watts"
                    max="600"
                    placeholder="e.g. 250"
                    value={ftp}
                    onChange={(e) => { setFtp(e.target.value); setCalculated(false); }}
                    className="w-full bg-white/5 border border-white/10 focus:border-coral rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="weight-input" className="block font-heading text-sm text-off-white mb-2">WEIGHT (KG)</label>
                  <input
                    id="weight-input"
                    type="number"
                    min="40"
                    max="150"
                    step="0.1"
                    aria-label="Your body weight in kilograms"
                    placeholder="e.g. 75"
                    value={weight}
                    onChange={(e) => { setWeight(e.target.value); setCalculated(false); }}
                    onKeyDown={(e) => { if (e.key === "Enter" && ftpVal > 0 && weightVal > 0) setCalculated(true); }}
                    className="w-full bg-white/5 border border-white/10 focus:border-coral rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <Button onClick={() => ftpVal > 0 && weightVal > 0 && setCalculated(true)} size="lg" className="w-full">
                Calculate W/kg
              </Button>
            </div>

            <AnimatePresence mode="wait">
              {calculated && wkg > 0 && (
                <motion.div
                  key={`${ftpVal}-${weightVal}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="text-center mb-8">
                    <p className="font-heading text-6xl md:text-8xl text-coral mb-2">{wkg.toFixed(2)}</p>
                    <p className="font-heading text-xl text-off-white">WATTS PER KILOGRAM</p>
                    <p className="text-foreground-muted mt-2" style={{ color: level.color }}>
                      {level.label}
                    </p>
                  </div>

                  <div className="space-y-2 mb-8">
                    {BENCHMARKS.map((b) => {
                      const isActive = wkg >= b.min && wkg < b.max;
                      return (
                        <div
                          key={b.label}
                          className={`flex items-center gap-4 rounded-lg p-3 transition-all ${isActive ? "bg-white/[0.08] border border-white/15" : ""}`}
                        >
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
                          <span className="text-off-white text-sm flex-1">{b.label}</span>
                          <span className="text-foreground-subtle text-xs">{b.min}-{b.max} W/kg</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="rounded-xl border border-white/10 p-6 mb-8">
                    <h3 className="font-heading text-lg text-off-white mb-3">WHAT NEXT?</h3>
                    <ul className="space-y-2">
                      <li><Link href="/blog/cycling-power-to-weight-ratio-guide" className="text-coral hover:text-coral/80 text-sm transition-colors">Complete W/kg Guide</Link></li>
                      <li><Link href="/tools/ftp-zones" className="text-coral hover:text-coral/80 text-sm transition-colors">Calculate Your Power Zones</Link></li>
                      <li><Link href="/tools/race-weight" className="text-coral hover:text-coral/80 text-sm transition-colors">Find Your Target Race Weight</Link></li>
                      <li><Link href="/glossary/w-kg" className="text-coral hover:text-coral/80 text-sm transition-colors">What Is W/kg?</Link></li>
                      <li><Link href="/topics/ftp-training" className="text-coral hover:text-coral/80 text-sm transition-colors">FTP Training topic hub →</Link></li>
                      <li><Link href="/podcast/ep-2026-ftp-jumped-30-watts-after-this-workout" className="text-coral hover:text-coral/80 text-sm transition-colors">Podcast: FTP jumped 30 watts after this workout</Link></li>
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-6 md:p-8 text-center">
                    <p className="font-heading text-coral text-xs tracking-widest mb-2">WANT TO IMPROVE THIS NUMBER?</p>
                    <p className="text-off-white font-heading text-lg mb-4">Coaching targets both sides — more power, better composition.</p>
                    <a href="/apply" className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm transition-all" data-track="tool_wkg_apply">
                      Apply for Coaching →
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Container>
        </Section>

        <Section background="deep-purple" grain>
          <Container width="narrow">
            <h2 className="font-heading text-off-white mb-4" style={{ fontSize: "var(--text-section)" }}>
              METHODOLOGY
            </h2>
            <div className="text-foreground-muted text-sm leading-relaxed space-y-3">
              <p>
                <strong className="text-off-white">Formula:</strong> W/kg = FTP (watts) ÷ Body weight (kg).
                FTP should be determined from a 20-minute all-out test (×0.95) or ramp test.
              </p>
              <p>
                <strong className="text-off-white">Benchmarks:</strong> Based on published data from Coggan&apos;s
                power profiling, adjusted for real-world amateur and masters populations. Professional benchmarks
                from World Tour race data.
              </p>
              <p>
                <strong className="text-off-white">Limitations:</strong> W/kg predicts climbing speed but not
                flat performance (where absolute watts matter more). Body weight should be measured consistently
                (morning, before eating). W/kg varies with hydration and time of day.
              </p>
              <p className="text-xs text-foreground-subtle">
                Last updated: April 2026 · Tool version 1.0
              </p>
            </div>
          </Container>
        </Section>

        <ToolLanding slug="wkg" />
      </main>
      <Footer />
    </>
  );
}
