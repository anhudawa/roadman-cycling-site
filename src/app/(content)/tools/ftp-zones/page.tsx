"use client";

import { useState } from "react";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { ZoneChart } from "@/components/features/tools/ZoneChart";

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

export default function FTPZonesPage() {
  const [ftp, setFtp] = useState<string>("");
  const [calculated, setCalculated] = useState(false);
  const ftpValue = parseInt(ftp) || 0;

  const handleCalculate = () => {
    if (ftpValue > 0) {
      setCalculated(true);
    }
  };

  return (
    <>
      <Header />
      <main>
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
                  placeholder="e.g. 250"
                  value={ftp}
                  onChange={(e) => {
                    setFtp(e.target.value);
                    setCalculated(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCalculate();
                  }}
                  className="
                    flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3
                    text-off-white text-xl font-heading tracking-wider
                    placeholder:text-foreground-subtle
                    focus:border-coral focus:outline-none
                    transition-colors
                  "
                  style={{ transitionDuration: "var(--duration-fast)" }}
                />
                <Button onClick={handleCalculate} size="lg">
                  Calculate
                </Button>
              </div>
            </div>

            {/* Results */}
            {calculated && ftpValue > 0 && (
              <div className="space-y-3">
                <h2 className="font-heading text-2xl text-off-white mb-6">
                  YOUR POWER ZONES — {ftpValue}W FTP
                </h2>

                {/* Visual Zone Chart */}
                <div className="bg-background-elevated rounded-xl border border-white/5 p-6 mb-6">
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
                </div>

                {ZONES.map((zone) => {
                  const min =
                    zone.minPercent === 0
                      ? 0
                      : Math.round((zone.minPercent / 100) * ftpValue);
                  const max =
                    zone.maxPercent === 999
                      ? null
                      : Math.round((zone.maxPercent / 100) * ftpValue);

                  return (
                    <div
                      key={zone.name}
                      className="bg-background-elevated rounded-lg border border-white/5 p-5 flex flex-col sm:flex-row sm:items-center gap-4"
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
                        <p className="font-heading text-2xl text-coral">
                          {max ? `${min}–${max}W` : `${min}W+`}
                        </p>
                        <p className="text-xs text-foreground-subtle">
                          {max
                            ? `${zone.minPercent}–${zone.maxPercent}% FTP`
                            : `${zone.minPercent}%+ FTP`}
                        </p>
                      </div>
                    </div>
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

                {/* CTA */}
                <div className="mt-8 bg-coral/10 rounded-xl border border-coral/20 p-8 text-center">
                  <h3 className="font-heading text-2xl text-off-white mb-3">
                    WANT A PLAN THAT USES THESE ZONES?
                  </h3>
                  <p className="text-foreground-muted mb-6">
                    Join the Clubhouse for free 16-week training plans built
                    around your zones, plus weekly Q&amp;A with Anthony.
                  </p>
                  <Button href="/community/clubhouse" size="lg">
                    Join the Clubhouse — Free
                  </Button>
                </div>
              </div>
            )}
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
