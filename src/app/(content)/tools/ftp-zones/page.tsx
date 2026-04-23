"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { ZoneChart } from "@/components/features/tools/ZoneChart";
import { ReportRequestForm } from "@/components/features/tools/ReportRequestForm";

interface Zone {
  name: string;
  description: string;
  minPercent: number;
  maxPercent: number;
  color: string;
}

const ZONES: Zone[] = [
  {
    name: "Zone 1 — Active Recovery",
    description: "Easy spinning. Recovery rides. Coffee stops.",
    minPercent: 0,
    maxPercent: 55,
    color: "#94A3B8",
  },
  {
    name: "Zone 2 — Endurance",
    description:
      "The base. Where pros spend 80% of their time. Build your aerobic engine here.",
    minPercent: 56,
    maxPercent: 75,
    color: "#3B82F6",
  },
  {
    name: "Zone 3 — Tempo",
    description:
      "Moderate effort. Useful for specific training blocks but often the 'grey zone' to avoid.",
    minPercent: 76,
    maxPercent: 90,
    color: "#22C55E",
  },
  {
    name: "Zone 4 — Threshold",
    description:
      "Your FTP. The effort you can sustain for about an hour. The line between aerobic and anaerobic.",
    minPercent: 91,
    maxPercent: 105,
    color: "#EAB308",
  },
  {
    name: "Zone 5 — VO2max",
    description:
      "Hard intervals. 3-8 minute efforts that build your ceiling. This is where breakthroughs happen.",
    minPercent: 106,
    maxPercent: 120,
    color: "#F97316",
  },
  {
    name: "Zone 6 — Anaerobic Capacity",
    description:
      "Short, sharp efforts. 30 seconds to 3 minutes. Builds top-end power for attacks and sprints.",
    minPercent: 121,
    maxPercent: 150,
    color: "#EF4444",
  },
  {
    name: "Zone 7 — Neuromuscular",
    description:
      "Max sprints. Under 30 seconds. Pure explosive power. Think Cavendish on the Champs-Elysees.",
    minPercent: 151,
    maxPercent: 999,
    color: "#DC2626",
  },
];

function getFtpError(value: string): string | null {
  if (!value) return null;
  const num = parseInt(value);
  if (isNaN(num)) return "Please enter a valid number";
  if (num < 50) return "FTP must be at least 50W";
  if (num > 600) return "FTP must be under 600W";
  return null;
}

export default function FTPZonesPage() {
  const [ftp, setFtp] = useState<string>("");
  const [calculated, setCalculated] = useState(false);
  const [copied, setCopied] = useState(false);
  const ftpValue = parseInt(ftp) || 0;
  const ftpError = getFtpError(ftp);

  const handleCalculate = () => {
    if (ftpValue > 0 && !ftpError) {
      setCalculated(true);
    }
  };

  const handleCopyResults = async () => {
    if (!calculated || ftpValue <= 0) return;
    const zoneLines = ZONES.map((z) => {
      const min = z.minPercent === 0 ? 0 : Math.round((z.minPercent / 100) * ftpValue);
      const max = z.maxPercent === 999 ? null : Math.round((z.maxPercent / 100) * ftpValue);
      return `${z.name}: ${max ? `${min}-${max}W` : `${min}W+`}`;
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
              FTP ZONE CALCULATOR
            </h1>
            <p className="text-foreground-muted text-lg">
              Enter your FTP and get your 7-zone power table instantly. Know
              exactly where to train for every session.
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
                Don&apos;t know your FTP? Use your best 20-minute power and
                multiply by 0.95.
              </p>
              <div className="flex gap-3">
                <input
                  id="ftp-input"
                  type="number"
                  min="50"
                  max="600"
                  aria-label="Your Functional Threshold Power in watts"
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
                <Button onClick={handleCalculate} size="lg" aria-label="Calculate your FTP power zones">
                  Calculate
                </Button>
              </div>
              {ftpError && (
                <p className="text-red-400 text-xs mt-1" role="alert">{ftpError}</p>
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
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-heading text-2xl text-off-white">
                    YOUR POWER ZONES — {ftpValue}W FTP
                  </h2>
                  <button
                    onClick={handleCopyResults}
                    aria-label={copied ? "Results copied to clipboard" : "Copy zone results to clipboard"}
                    className="text-sm text-coral hover:text-coral/80 font-heading tracking-wider transition-colors cursor-pointer"
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
                    zones={ZONES.map((z) => ({
                      name: z.name,
                      shortName: z.name.split("—")[0].trim(),
                      minWatts: z.minPercent === 0 ? 0 : Math.round((z.minPercent / 100) * ftpValue),
                      maxWatts: z.maxPercent === 999 ? null : Math.round((z.maxPercent / 100) * ftpValue),
                      color: z.color,
                    }))}
                  />
                </motion.div>

                {ZONES.map((zone, zoneIndex) => {
                  const min =
                    zone.minPercent === 0
                      ? 0
                      : Math.round((zone.minPercent / 100) * ftpValue);
                  const max =
                    zone.maxPercent === 999
                      ? null
                      : Math.round((zone.maxPercent / 100) * ftpValue);

                  return (
                    <motion.div
                      key={zone.name}
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
                        style={{ backgroundColor: zone.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-heading text-lg text-off-white">
                          {zone.name.toUpperCase()}
                        </h3>
                        <p className="text-sm text-foreground-muted mt-0.5">
                          {zone.description}
                        </p>
                      </div>
                      <div className="sm:text-right shrink-0">
                        <p className="font-heading text-2xl text-coral stat-glow">
                          {max ? `${min}–${max}W` : `${min}W+`}
                        </p>
                        <p className="text-xs text-foreground-subtle">
                          {max
                            ? `${zone.minPercent}–${zone.maxPercent}% FTP`
                            : `${zone.minPercent}%+ FTP`}
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
                        The 80/20 rule is real.
                      </strong>{" "}
                      Professor Seiler&apos;s research shows the best endurance
                      athletes spend roughly 80% of training time in Zone 1-2
                      and 20% in Zone 4+. Most amateurs ride too hard on easy
                      days and too easy on hard days.
                    </p>
                    <p>
                      <strong className="text-off-white">
                        Zone 2 is your foundation.
                      </strong>{" "}
                      If your Zone 2 ceiling feels low, that&apos;s precisely
                      why you need to spend time there. It builds mitochondrial
                      density, fat oxidation, and aerobic capacity.
                    </p>
                    <p>
                      <strong className="text-off-white">
                        Zone 4 is your benchmark.
                      </strong>{" "}
                      Your FTP represents roughly the power you can sustain for
                      an hour. Threshold intervals (2x20min at Zone 4) are the
                      bread and butter of cycling training.
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
                  <ReportRequestForm
                    tool="ftp-zones"
                    inputs={{ ftp: ftpValue }}
                    heading={`Your personalised ${ftpValue}w training week`}
                    subheading="We'll email you a polarised 7-day template built around the zones above — with specific wattage targets for each session. The same distribution the Norwegian lab's proven works for twenty years."
                    bullets={[
                      "Full 7-zone cheat sheet you can screenshot",
                      "Tuesday threshold session at your exact wattage",
                      "Thursday VO2 max 4×4 with your target numbers",
                      "Long Saturday Zone 2 with your ceiling",
                      "The three rules that unlock the week",
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
                      <Link href="/blog/ftp-training-zones-cycling-complete-guide" className="text-coral hover:text-coral/80 text-sm transition-colors">
                        FTP Training Zones: The Complete Guide
                      </Link>
                    </li>
                    <li>
                      <Link href="/blog/how-to-improve-ftp-cycling" className="text-coral hover:text-coral/80 text-sm transition-colors">
                        How to Improve Your FTP
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
      </main>
      <Footer />
    </>
  );
}
