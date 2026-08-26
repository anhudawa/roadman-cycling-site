"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { ToolLanding } from "@/components/features/tools/ToolLanding";
import { calculateFtpZones } from "@/lib/tools/calculators";

/* ------------------------------------------------------------------ */
/*  Test protocols & benchmark data                                    */
/* ------------------------------------------------------------------ */

interface Protocol {
  id: string;
  label: string;
  short: string;
  factor: number;
  inputLabel: string;
  placeholder: string;
  description: string;
}

const PROTOCOLS: Protocol[] = [
  {
    id: "20min",
    label: "20-Minute Test",
    short: "20 min",
    factor: 0.95,
    inputLabel: "20-MINUTE AVERAGE POWER (WATTS)",
    placeholder: "e.g. 280",
    description: "A common field estimate: this calculator applies 95% to your 20-minute average. The conversion is not exact for every rider.",
  },
  {
    id: "8min",
    label: "2 × 8-Minute Test",
    short: "2×8 min",
    factor: 0.90,
    inputLabel: "BEST 8-MINUTE AVERAGE POWER (WATTS)",
    placeholder: "e.g. 310",
    description: "A protocol-specific estimate: this calculator applies 90% to the entered 8-minute power. Confirm that this matches the protocol you completed.",
  },
  {
    id: "ramp",
    label: "Ramp Test (MAP)",
    short: "Ramp",
    factor: 0.75,
    inputLabel: "LAST COMPLETED STEP POWER (WATTS)",
    placeholder: "e.g. 350",
    description: "A simplified ramp estimate: this calculator applies 75% to the entered final-step power. Platform equations and step definitions can differ.",
  },
  {
    id: "60min",
    label: "60-Minute Test",
    short: "60 min",
    factor: 1.0,
    inputLabel: "60-MINUTE AVERAGE POWER (WATTS)",
    placeholder: "e.g. 250",
    description: "Uses the entered 60-minute average as an FTP estimate. Pacing, course and individual time to exhaustion still affect interpretation.",
  },
];

const ZONE_COLORS = ["#94A3B8", "#22C55E", "#3B82F6", "#8B5CF6", "#EAB308", "#F97316", "#EF4444"];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function FtpTestPage() {
  const [protocolId, setProtocolId] = useState("20min");
  const [testPower, setTestPower] = useState("");
  const [weight, setWeight] = useState("");
  const [useLb, setUseLb] = useState(false);
  const [calculated, setCalculated] = useState(false);

  const protocol = PROTOCOLS.find((p) => p.id === protocolId)!;
  const testWatts = parseInt(testPower) || 0;
  const rawWeight = parseFloat(weight) || 0;
  const riderKg = useLb ? rawWeight * 0.4536 : rawWeight;

  const estimatedFtp = Math.round(testWatts * protocol.factor);
  const wkg = riderKg > 30 ? estimatedFtp / riderKg : 0;
  const zones = estimatedFtp > 0 ? calculateFtpZones(estimatedFtp) : [];

  /* Validation */
  const powerError = testPower && (testWatts < 50 || testWatts > 800) ? "Enter a power between 50 and 800 watts" : null;
  const weightError = weight && (rawWeight < 30 || rawWeight > 400) ? `Enter a weight between 30 and ${useLb ? "400 lb" : "180 kg"}` : null;

  const canCalculate = testWatts >= 50 && !powerError;
  const resetCalc = () => setCalculated(false);

  /* Show comparison across all protocols for the same test wattage */
  const comparisons = PROTOCOLS.filter((p) => p.id !== protocolId).map((p) => ({
    ...p,
    equivalentTestPower: Math.round(estimatedFtp / p.factor),
  }));

  return (
    <>
      <Header />
      <main id="main-content">
        {/* ---- Hero ---- */}
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow" className="text-center">
            <p className="text-coral text-sm font-body font-medium uppercase tracking-widest mb-4">Free Tool</p>
            <h1 className="font-heading text-off-white mb-4" style={{ fontSize: "var(--text-section)" }}>
              FTP TEST CALCULATOR
            </h1>
            <p className="text-foreground-muted text-lg">
              Apply a stated protocol equation to a completed test result. Outputs are estimates, not interchangeable laboratory thresholds.
            </p>
            <p className="text-foreground-subtle text-sm mt-3">
              Not sure which protocol fits?{" "}
              <Link href="/answers/ftp-test-guide" className="text-coral hover:text-coral/80">
                Read the FTP test selection guide
              </Link>
              .
            </p>
          </Container>
        </Section>

        {/* ---- Calculator ---- */}
        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <div className="bg-background-elevated rounded-xl border border-white/5 p-8 mb-8">
              {/* Protocol selector */}
              <div className="mb-6">
                <p className="font-heading text-sm text-off-white mb-3">TEST PROTOCOL</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {PROTOCOLS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => { setProtocolId(p.id); resetCalc(); }}
                      className={`text-sm font-heading tracking-wider py-2.5 px-3 rounded-lg border transition-all ${
                        protocolId === p.id
                          ? "bg-coral text-off-white border-coral"
                          : "bg-white/5 text-foreground-muted border-white/10 hover:border-coral/40 hover:text-coral"
                      }`}
                    >
                      {p.short}
                    </button>
                  ))}
                </div>
                <p className="text-foreground-subtle text-xs mt-2">{protocol.description}</p>
              </div>

              {/* Test power input */}
              <div className="mb-6">
                <label htmlFor="test-power-input" className="block font-heading text-sm text-off-white mb-2">
                  {protocol.inputLabel}
                </label>
                <input
                  id="test-power-input"
                  type="number"
                  inputMode="numeric"
                  min="50"
                  max="800"
                  placeholder={protocol.placeholder}
                  aria-label={protocol.inputLabel}
                  value={testPower}
                  onChange={(e) => { setTestPower(e.target.value); resetCalc(); }}
                  className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:outline-none transition-colors ${powerError ? "border-red-500/60 focus:border-red-500" : "border-white/10 focus:border-coral"}`}
                />
                {powerError && <p className="text-red-400 text-xs mt-1" role="alert">{powerError}</p>}
                <p className="text-foreground-subtle text-xs mt-1.5">
                  Conversion factor: FTP = {(protocol.factor * 100).toFixed(0)} % of your {protocol.short} power
                </p>
              </div>

              {/* Weight (optional for W/kg) */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="weight-input" className="font-heading text-sm text-off-white">
                    RIDER WEIGHT ({useLb ? "LB" : "KG"}) <span className="text-foreground-subtle font-body text-xs font-normal">— optional, for W/kg</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => { setUseLb(!useLb); resetCalc(); }}
                    className="text-coral text-xs font-body hover:text-coral/80 transition-colors"
                  >
                    {useLb ? "KG" : "LB"}
                  </button>
                </div>
                <input
                  id="weight-input"
                  type="number"
                  inputMode="decimal"
                  placeholder={useLb ? "e.g. 165" : "e.g. 75"}
                  aria-label={`Rider weight in ${useLb ? "pounds" : "kilograms"}`}
                  value={weight}
                  onChange={(e) => { setWeight(e.target.value); resetCalc(); }}
                  className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider placeholder:text-foreground-subtle focus:outline-none transition-colors ${weightError ? "border-red-500/60 focus:border-red-500" : "border-white/10 focus:border-coral"}`}
                />
                {weightError && <p className="text-red-400 text-xs mt-1" role="alert">{weightError}</p>}
              </div>

              <Button onClick={() => canCalculate && setCalculated(true)} size="lg" className="w-full">
                Estimate FTP
              </Button>
            </div>

            {/* ---- Results ---- */}
            <div aria-live="polite" aria-atomic="false">
              <AnimatePresence mode="wait">
                {calculated && estimatedFtp > 0 && (
                  <motion.div
                    key={`${testWatts}-${protocolId}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Big FTP number */}
                    <div className="text-center mb-8">
                      <p className="font-heading text-6xl md:text-8xl text-coral mb-2">{estimatedFtp}W</p>
                      <p className="font-heading text-xl text-off-white">ESTIMATED FTP</p>
                      {wkg > 0 && (
                        <p className="mt-2 text-foreground-muted">
                          {wkg.toFixed(2)} W/kg from this estimated FTP
                        </p>
                      )}
                    </div>

                    {/* How we got here */}
                    <div className="flex items-center justify-center gap-6 mb-8 text-center">
                      <div>
                        <p className="font-heading text-3xl text-off-white">{testWatts}W</p>
                        <p className="text-foreground-subtle text-sm">{protocol.short} power</p>
                      </div>
                      <div className="text-foreground-subtle text-2xl">&times;</div>
                      <div>
                        <p className="font-heading text-3xl text-off-white">{(protocol.factor * 100).toFixed(0)}%</p>
                        <p className="text-foreground-subtle text-sm">Conversion factor</p>
                      </div>
                      <div className="text-foreground-subtle text-2xl">=</div>
                      <div>
                        <p className="font-heading text-3xl text-coral">{estimatedFtp}W</p>
                        <p className="text-foreground-subtle text-sm">Estimated FTP</p>
                      </div>
                    </div>

                    {/* Zone preview */}
                    <div className="rounded-xl border border-white/10 p-6 mb-8">
                      <h3 className="font-heading text-lg text-off-white mb-4">POWER ZONES (PREVIEW)</h3>
                      <div className="space-y-2">
                        {zones.map((z, i) => {
                          return (
                            <div key={z.zone} className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: ZONE_COLORS[i] + "30" }}>
                                <span className="font-heading text-sm" style={{ color: ZONE_COLORS[i] }}>{z.zone}</span>
                              </div>
                              <span className="text-off-white text-sm flex-1">{z.name}</span>
                              <span className="font-heading text-sm text-foreground-muted">
                                {z.maxWatts !== null
                                  ? `${z.minWatts}–${z.maxWatts}W`
                                  : `${z.minWatts}W+`}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-foreground-subtle text-xs mt-4">
                        Full zone detail with descriptions and heart-rate overlay:{" "}
                        <Link href="/tools/ftp-zones" className="text-coral hover:text-coral/80">FTP Zone Calculator</Link>
                      </p>
                    </div>

                    {/* Protocol comparison */}
                    <div className="rounded-xl border border-white/10 p-6 mb-8">
                      <h3 className="font-heading text-lg text-off-white mb-4">EQUATION COMPARISON</h3>
                      <p className="text-foreground-subtle text-sm mb-4">
                        These are the inputs that each fixed equation would map to {estimatedFtp}W. They are not predictions that you will achieve equivalent results on each protocol.
                      </p>
                      <div className="space-y-3">
                        {comparisons.map((c) => (
                          <div key={c.id} className="flex items-center justify-between">
                            <span className="text-off-white text-sm">{c.label}</span>
                            <span className="font-heading text-coral text-sm">
                              {c.equivalentTestPower}W ({(c.factor * 100).toFixed(0)}% &rarr; {estimatedFtp}W)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* What Next */}
                    <div className="rounded-xl border border-white/10 p-6 mb-8">
                      <h3 className="font-heading text-lg text-off-white mb-3">WHAT NEXT?</h3>
                      <ul className="space-y-2">
                        <li><Link href="/tools/ftp-zones" className="text-coral hover:text-coral/80 text-sm transition-colors">Full FTP Zone Calculator — with heart-rate overlay</Link></li>
                        <li><Link href="/tools/tss" className="text-coral hover:text-coral/80 text-sm transition-colors">TSS Calculator — training load from your new FTP</Link></li>
                        <li><Link href="/tools/wkg" className="text-coral hover:text-coral/80 text-sm transition-colors">W/kg Calculator — detailed benchmarks</Link></li>
                        <li><Link href="/answers/ftp-test-guide" className="text-coral hover:text-coral/80 text-sm transition-colors">Choose and interpret an FTP test</Link></li>
                        <li><Link href="/blog/when-to-test-ftp-cycling" className="text-coral hover:text-coral/80 text-sm transition-colors">When to Test Your FTP (and When Testing Hurts)</Link></li>
                        <li><Link href="/topics/ftp-training" className="text-coral hover:text-coral/80 text-sm transition-colors">What FTP means in cycling</Link></li>
                      </ul>
                    </div>

                    {/* CTA */}
                    <div className="rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-6 md:p-8 text-center">
                      <p className="font-heading text-coral text-xs tracking-widest mb-2">WANT TO RAISE THAT NUMBER?</p>
                      <p className="text-off-white font-heading text-lg mb-2">An FTP test measures where you are. A coach moves the line.</p>
                      <p className="text-foreground-muted text-sm mb-4">
                        Structured periodisation, targeted sessions, and someone who
                        knows when to push and when to pull back.
                      </p>
                      <a href="/apply" className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm transition-all" data-track="tool_ftp_test_apply">
                        Apply for Coaching
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Container>
        </Section>

        {/* ---- Methodology ---- */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <h2 className="font-heading text-off-white mb-4" style={{ fontSize: "var(--text-section)" }}>
              METHODOLOGY
            </h2>
            <div className="text-foreground-muted text-sm leading-relaxed space-y-3">
              <p>
                <strong className="text-off-white">What this tool does:</strong> It applies the displayed
                conversion factor to the value you enter. It does not verify the test protocol, device,
                pacing or physiological threshold, and it does not make different tests interchangeable.
              </p>
              <p>
                <strong className="text-off-white">20-minute equation (× 0.95):</strong>{" "}
                <a href="https://help.trainingpeaks.com/hc/en-us/articles/204071934-How-to-Calculate-Threshold-Values-for-Power-Heart-Rate-or-Pace" className="text-coral hover:text-coral/80">
                  TrainingPeaks documents this as an estimate
                </a>
                . A scoping review found the field test can be reliable while agreement with physiological
                threshold markers still has meaningful individual limits.
              </p>
              <p>
                <strong className="text-off-white">Ramp and 8-minute equations:</strong> These are
                simplified fixed-factor calculations. Platforms can define the input and conversion
                differently, so use the equation supplied with the protocol you actually completed.
              </p>
              <p>
                <strong className="text-off-white">Measurement boundary:</strong> A systematic review
                found that cycling power-meter validity and reproducibility can vary with the device and
                testing conditions, including cadence, temperature and exercise intensity. Keep the same
                hardware and calibration procedure when following a trend.
              </p>
              <p>
                <strong className="text-off-white">Interpretation boundary:</strong> Time to exhaustion
                at a measured FTP varies substantially. Use the result as one training anchor and review
                the wider power-duration curve, session response and target-event demands.
              </p>
              <p>
                <strong className="text-off-white">Reviewed references:</strong>{" "}
                <a href="https://pubmed.ncbi.nlm.nih.gov/34304689/" className="text-coral hover:text-coral/80">FTP field-test scoping review</a>
                {" · "}
                <a href="https://pubmed.ncbi.nlm.nih.gov/35009945/" className="text-coral hover:text-coral/80">cycling power-meter review</a>
                {" · "}
                <a href="https://pubmed.ncbi.nlm.nih.gov/35835698/" className="text-coral hover:text-coral/80">time-to-exhaustion study</a>
              </p>
              <p className="text-xs text-foreground-subtle">
                Reviewed by Anthony Walsh for method and primary-source alignment &middot; Last updated: 26 August 2026
              </p>
            </div>
          </Container>
        </Section>

        <ToolLanding slug="ftp-test" />
      </main>
      <Footer />
    </>
  );
}
