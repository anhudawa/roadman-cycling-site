"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { ZoneChart } from "@/components/features/tools/ZoneChart";
import { SaveToolResultForm } from "@/components/features/tools/SaveToolResultForm";
import { ToolLanding } from "@/components/features/tools/ToolLanding";
import { TOOL_EVENTS, trackTool } from "@/lib/analytics/tool-events";
import { calculateFtpZones } from "@/lib/tools/calculators";

const ZONE_COLORS = [
  "#94A3B8",
  "#3B82F6",
  "#22C55E",
  "#EAB308",
  "#F97316",
  "#EF4444",
  "#DC2626",
] as const;

function getFtpError(value: string): string | null {
  if (!value) return null;
  const num = parseInt(value);
  if (isNaN(num)) return "Please enter a valid number";
  if (num < 50) return "FTP must be at least 50W";
  if (num > 600) return "FTP must be under 600W";
  return null;
}

interface FTPZonesClientProps {
  /** Pre-fill from the signed-in rider's profile, if available. */
  initialFtp?: number | null;
}

export function FTPZonesClient({ initialFtp }: FTPZonesClientProps = {}) {
  const [ftp, setFtp] = useState<string>(
    initialFtp && initialFtp >= 50 && initialFtp <= 600 ? String(initialFtp) : "",
  );
  const [calculated, setCalculated] = useState<boolean>(
    Boolean(initialFtp && initialFtp >= 50 && initialFtp <= 600),
  );
  const [copied, setCopied] = useState(false);
  const ftpValue = parseInt(ftp) || 0;
  const ftpError = getFtpError(ftp);
  const zones = ftpValue > 0 ? calculateFtpZones(ftpValue) : [];

  const handleCalculate = () => {
    if (ftpValue > 0 && !ftpError) {
      setCalculated(true);
      trackTool({
        name: TOOL_EVENTS.COMPLETED,
        tool: "ftp_zones",
        meta: { ftp: ftpValue },
      });
    }
  };

  const handleCopyResults = async () => {
    if (!calculated || ftpValue <= 0) return;
    const zoneLines = zones.map((zone) => {
      const range = zone.maxWatts
        ? `${zone.minWatts}-${zone.maxWatts}W`
        : `${zone.minWatts}W+`;
      return `Zone ${zone.zone} — ${zone.name}: ${range}`;
    }).join("\n");
    const text = `FTP Zones (${ftpValue}W FTP)\n${zoneLines}\n— roadmancycling.com/tools/ftp-zones`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
              FTP CALCULATOR: 7 CYCLING POWER ZONES
            </h1>
            <p className="text-foreground-muted text-lg">
              Enter your FTP and get seven continuous whole-watt ranges as
              practical starting targets for structured training.
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
                Enter a recent FTP from the same test protocol you plan to
                repeat. Need an estimate first? Use the{" "}
                <Link href="/tools/ftp-test" className="text-coral hover:text-coral/80">
                  FTP test calculator
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
                <p className="text-red-400 text-xs mt-1" role="alert">{ftpError}</p>
              )}
              <p className="text-xs text-foreground-subtle mt-4">
                Looking for an age-and-gender comparison rather than training
                zones? Use the{" "}
                <Link
                  href="/tools/masters-ftp-benchmark"
                  className="text-coral hover:text-coral/80"
                >
                  masters FTP calculator by age and gender
                </Link>
                .
              </p>
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
                  <h2 className="font-heading text-xl sm:text-2xl text-off-white">
                    YOUR POWER ZONES — {ftpValue}W FTP
                  </h2>
                  <button
                    onClick={handleCopyResults}
                    aria-label={copied ? "Results copied to clipboard" : "Copy zone results to clipboard"}
                    className="self-start sm:self-auto shrink-0 inline-flex items-center min-h-[44px] px-3 -ml-3 sm:ml-0 text-sm text-coral hover:text-coral/80 font-heading tracking-wider transition-colors cursor-pointer"
                  >
                    {copied ? "Copied!" : "Copy Results"}
                  </button>
                </div>

                {/* Visual Zone Chart */}
                <motion.div
                  className="bg-background-elevated rounded-xl border border-white/5 p-6 mb-6"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <ZoneChart
                    ftp={ftpValue}
                    zones={zones.map((zone) => ({
                      name: `Zone ${zone.zone} — ${zone.name}`,
                      shortName: `Zone ${zone.zone}`,
                      minWatts: zone.minWatts,
                      maxWatts: zone.maxWatts,
                      color: ZONE_COLORS[zone.zone - 1],
                    }))}
                  />
                </motion.div>

                {zones.map((zone, zoneIndex) => {
                  return (
                    <motion.div
                      key={zone.zone}
                      className="bg-background-elevated rounded-lg border border-white/5 p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.35,
                        delay: 0.15 + zoneIndex * 0.06,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      <div
                        className="w-2 h-2 rounded-full shrink-0 sm:w-3 sm:h-3"
                        style={{ backgroundColor: ZONE_COLORS[zone.zone - 1] }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-heading text-lg text-off-white">
                          {`ZONE ${zone.zone} — ${zone.name}`.toUpperCase()}
                        </h3>
                        <p className="text-sm text-foreground-muted mt-0.5">
                          {zone.description}
                        </p>
                      </div>
                      <div className="sm:text-right shrink-0">
                        <p className="font-heading text-2xl text-coral stat-glow">
                          {zone.maxWatts
                            ? `${zone.minWatts}–${zone.maxWatts}W`
                            : `${zone.minWatts}W+`}
                        </p>
                        <p className="text-xs text-foreground-subtle">
                          {zone.zone === 1
                            ? `Up to ${zone.maxPercentFtp}% FTP`
                            : zone.maxPercentFtp
                              ? `>${zone.minPercentFtp}–${zone.maxPercentFtp}% FTP`
                              : `>${zone.minPercentFtp}% FTP`}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Training Tips */}
                <div className="mt-8 bg-deep-purple/30 rounded-xl border border-purple/20 p-8">
                  <h3 className="font-heading text-xl text-off-white mb-4">
                    HOW TO USE YOUR ZONES
                  </h3>
                  <div className="space-y-3 text-foreground-muted text-sm leading-relaxed">
                    <p>
                      <strong className="text-off-white">
                        Do not confuse seven power zones with three-zone research models.
                      </strong>{" "}
                      Polarised and pyramidal studies group intensity around
                      physiological thresholds, not these seven labels. Both
                      approaches can work; your weekly distribution is a
                      programming decision, not a result this calculator can make.
                    </p>
                    <p>
                      <strong className="text-off-white">
                        Treat each boundary as a starting range.
                      </strong>{" "}
                      FTP-derived percentages do not locate your individual
                      lactate or ventilatory thresholds. Use breathing, RPE,
                      heart rate and repeatability to calibrate the target.
                    </p>
                    <p>
                      <strong className="text-off-white">
                        Keep the test protocol consistent.
                      </strong>{" "}
                      A 20-minute estimate, ramp-test estimate and critical-power
                      model are related but not interchangeable. Compare progress
                      using the same device, environment and protocol.
                    </p>
                  </div>
                </div>

                {/* Email-gated report — "get the 7-day training week built
                    around your exact FTP". Personalised, delivered via Resend,
                    subscribes to Beehiiv tagged tool-ftp-zones-report. */}
                <motion.div
                  className="mt-8"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.5 }}
                >
                  <SaveToolResultForm
                    tool="ftp_zones"
                    resultsPathTool="ftp-zones"
                    inputs={{ ftp: ftpValue, weightKg: null, maxHr: null }}
                    outputs={{
                      wkg: null,
                      zones: zones.map((zone) => ({
                        zone: `Zone ${zone.zone}`,
                        label: `Zone ${zone.zone} — ${zone.name}`,
                        lower: zone.minWatts,
                        upper: zone.maxWatts ?? ftpValue * 3,
                      })),
                    }}
                    heading={`Save your ${ftpValue}w power zones`}
                    subheading="We'll email your personalised zone table and save the permalink to your rider profile, so you can pull it up from your phone mid-session — or hand it to Ask Roadman to plan a session around it."
                    bullets={[
                      "Permalink you can screenshot or share",
                      "Emailed copy with every zone range in watts",
                      "Saved to your rider profile for future tool results",
                      "One-click handoff to Ask Roadman for a custom week",
                    ]}
                  />
                </motion.div>

                {/* Learn More */}
                <motion.div
                  className="mt-8 rounded-xl border border-white/10 p-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.6 }}
                >
                  <h3 className="font-heading text-lg text-off-white mb-3">LEARN MORE</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/blog/how-to-improve-ftp-cycling" className="text-coral hover:text-coral/80 text-sm transition-colors">
                        How to Improve Your FTP
                      </Link>
                    </li>
                    <li>
                      <Link href="/blog/ftp-training-zones-cycling-complete-guide" className="text-coral hover:text-coral/80 text-sm transition-colors">
                        FTP Training Zones: The Complete Guide
                      </Link>
                    </li>
                    <li>
                      <Link href="/topics/ftp-training" className="text-coral hover:text-coral/80 text-sm transition-colors">
                        FTP Training topic hub →
                      </Link>
                    </li>
                    <li>
                      <Link href="/podcast/ep-2026-ftp-jumped-30-watts-after-this-workout" className="text-coral hover:text-coral/80 text-sm transition-colors">
                        Podcast: FTP jumped 30 watts after this workout
                      </Link>
                    </li>
                  </ul>
                </motion.div>

                {/* Coaching CTA — post-calculation, highest intent */}
                <motion.div
                  className="mt-8 rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-6 md:p-8 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.7 }}
                >
                  <p className="font-heading text-coral text-xs tracking-widest mb-2">
                    WANT THESE ZONES IN A REAL PLAN?
                  </p>
                  <p className="text-off-white font-heading text-lg md:text-xl mb-2">
                    Roadman coaching builds your week around these exact numbers.
                  </p>
                  <p className="text-foreground-muted text-sm mb-5 max-w-md mx-auto">
                    Personalised TrainingPeaks plan, weekly calls, five pillars.
                    7-day free trial. $195/month.
                  </p>
                  <a
                    href="/apply"
                    className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm transition-all"
                    data-track="tool_ftp_apply"
                  >
                    Apply for Coaching →
                  </a>
                </motion.div>
              </motion.div>
            )}
            </AnimatePresence>
            </div>
          </Container>
        </Section>

        <ToolLanding slug="ftp-zones" />
      </main>
      <Footer />
    </>
  );
}
