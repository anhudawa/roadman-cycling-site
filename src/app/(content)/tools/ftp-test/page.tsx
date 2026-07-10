"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { ToolLanding } from "@/components/features/tools/ToolLanding";

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
    description: "The industry standard. Ride as hard as you can sustain for 20 minutes. FTP = 95 % of your average power.",
  },
  {
    id: "8min",
    label: "2 × 8-Minute Test",
    short: "2×8 min",
    factor: 0.90,
    inputLabel: "BEST 8-MINUTE AVERAGE POWER (WATTS)",
    placeholder: "e.g. 310",
    description: "Two maximal 8-minute efforts with recovery between. FTP = 90 % of the better effort. Useful when 20 minutes feels psychologically daunting.",
  },
  {
    id: "ramp",
    label: "Ramp Test (MAP)",
    short: "Ramp",
    factor: 0.75,
    inputLabel: "LAST COMPLETED STEP POWER (WATTS)",
    placeholder: "e.g. 350",
    description: "Progressive ramp until failure. FTP = 75 % of your maximum aerobic power (MAP), typically the last full step you completed. Most Zwift and TrainerRoad ramp tests use this.",
  },
  {
    id: "60min",
    label: "60-Minute Test",
    short: "60 min",
    factor: 1.0,
    inputLabel: "60-MINUTE AVERAGE POWER (WATTS)",
    placeholder: "e.g. 250",
    description: "The gold standard by definition — FTP is the power you can sustain for approximately one hour. Rarely used in practice because it requires exceptional pacing discipline.",
  },
];

interface FtpTier {
  min: number;
  max: number;
  label: string;
  desc: string;
  color: string;
}

const FTP_TIERS: FtpTier[] = [
  { min: 0, max: 1.5, label: "Beginner", desc: "New to structured cycling", color: "#94A3B8" },
  { min: 1.5, max: 2.5, label: "Recreational", desc: "Regular rider, moderate fitness", color: "#22C55E" },
  { min: 2.5, max: 3.2, label: "Trained amateur", desc: "Structured training paying off", color: "#3B82F6" },
  { min: 3.2, max: 3.7, label: "Strong amateur", desc: "Cat 3-4 competitive level", color: "#8B5CF6" },
  { min: 3.7, max: 4.2, label: "Very strong", desc: "Cat 1-2, competitive in regional racing", color: "#EAB308" },
  { min: 4.2, max: 4.7, label: "Elite amateur", desc: "National-level talent", color: "#F97316" },
  { min: 4.7, max: 5.5, label: "Professional", desc: "Continental / domestic pro", color: "#EF4444" },
  { min: 5.5, max: 10, label: "World Tour", desc: "Grand Tour contender territory", color: "#DC2626" },
];

/* Coggan 7-zone model (factors of FTP) */
const ZONES = [
  { zone: 1, name: "Active Recovery", low: 0, high: 0.55 },
  { zone: 2, name: "Endurance", low: 0.55, high: 0.75 },
  { zone: 3, name: "Tempo", low: 0.75, high: 0.90 },
  { zone: 4, name: "Threshold", low: 0.90, high: 1.05 },
  { zone: 5, name: "VO2max", low: 1.05, high: 1.20 },
  { zone: 6, name: "Anaerobic", low: 1.20, high: 1.50 },
  { zone: 7, name: "Neuromuscular", low: 1.50, high: 2.0 },
];

const ZONE_COLORS = ["#94A3B8", "#22C55E", "#3B82F6", "#8B5CF6", "#EAB308", "#F97316", "#EF4444"];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getTier(wkg: number): FtpTier {
  return FTP_TIERS.find((t) => wkg >= t.min && wkg < t.max) || FTP_TIERS[FTP_TIERS.length - 1];
}

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
  const tier = wkg > 0 ? getTier(wkg) : null;

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
              Your test result in. Estimated FTP, W/kg, and power zones out.
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
                      {wkg > 0 && tier && (
                        <p className="mt-2" style={{ color: tier.color }}>
                          {wkg.toFixed(2)} W/kg — {tier.label}
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

                    {/* W/kg benchmark scale */}
                    {wkg > 0 && (
                      <div className="space-y-2 mb-8">
                        <h3 className="font-heading text-sm text-off-white mb-2">W/KG BENCHMARK</h3>
                        {FTP_TIERS.map((t) => {
                          const isActive = wkg >= t.min && wkg < t.max;
                          return (
                            <div
                              key={t.label}
                              className={`flex items-center gap-4 rounded-lg p-3 transition-all ${isActive ? "bg-white/[0.08] border border-white/15" : ""}`}
                            >
                              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                              <span className="text-off-white text-sm flex-1">{t.label}</span>
                              <span className="text-foreground-subtle text-xs">
                                {t.max < 10 ? `${t.min}–${t.max}` : `${t.min}+`} W/kg
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Zone preview */}
                    <div className="rounded-xl border border-white/10 p-6 mb-8">
                      <h3 className="font-heading text-lg text-off-white mb-4">POWER ZONES (PREVIEW)</h3>
                      <div className="space-y-2">
                        {ZONES.map((z, i) => {
                          const low = Math.round(estimatedFtp * z.low);
                          const high = z.zone === 7 ? null : Math.round(estimatedFtp * z.high);
                          return (
                            <div key={z.zone} className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: ZONE_COLORS[i] + "30" }}>
                                <span className="font-heading text-sm" style={{ color: ZONE_COLORS[i] }}>{z.zone}</span>
                              </div>
                              <span className="text-off-white text-sm flex-1">{z.name}</span>
                              <span className="font-heading text-sm text-foreground-muted">
                                {high ? `${low}–${high}W` : `${low}W+`}
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
                      <h3 className="font-heading text-lg text-off-white mb-4">EQUIVALENT TEST RESULTS</h3>
                      <p className="text-foreground-subtle text-sm mb-4">
                        For the same {estimatedFtp}W FTP, here&apos;s what you&apos;d need to hit on other protocols:
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
                        <li><Link href="/blog/when-to-test-ftp-cycling" className="text-coral hover:text-coral/80 text-sm transition-colors">When to Test Your FTP (and When Testing Hurts)</Link></li>
                        <li><Link href="/topics/ftp-training" className="text-coral hover:text-coral/80 text-sm transition-colors">FTP Training topic hub</Link></li>
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
                <strong className="text-off-white">What is FTP?</strong> Functional Threshold Power is the
                highest power you can sustain for approximately one hour. In practice, it represents
                the boundary between steady-state and accumulating fatigue — the point where lactate
                production starts outrunning clearance. The concept was formalised by Dr. Andrew Coggan
                and Hunter Allen in <em>Training and Racing with a Power Meter</em>.
              </p>
              <p>
                <strong className="text-off-white">20-minute test (× 0.95):</strong> The most widely
                used field test. The 5 % discount accounts for the anaerobic contribution during a
                20-minute effort that wouldn&apos;t be sustainable for a full hour. First popularised
                by Allen and Coggan, adopted by TrainingPeaks, Strava, and most coaching platforms.
              </p>
              <p>
                <strong className="text-off-white">Ramp test (× 0.75):</strong> You start at a low
                wattage and increase by a fixed increment (typically 20W) every minute until failure.
                FTP is estimated at 75 % of the last completed step — your Maximum Aerobic Power (MAP).
                The ramp test is popular because it&apos;s short (~15-20 minutes of actual effort) and
                doesn&apos;t require pacing skill. The trade-off: it can overestimate FTP for riders
                with strong anaerobic systems and underestimate for pure endurance types.
              </p>
              <p>
                <strong className="text-off-white">8-minute test (× 0.90):</strong> Two maximal
                8-minute efforts with 10 minutes recovery. FTP = 90 % of the better effort. Originally
                developed by CTS (Carmichael Training Systems). Useful for riders who struggle to pace
                a 20-minute effort.
              </p>
              <p>
                <strong className="text-off-white">Which protocol is most accurate?</strong> No short
                test perfectly predicts hour power. The 20-minute test is the most validated, but all
                protocols have individual error of &plusmn;3-5 %. Consistency matters more than protocol
                choice — pick one, use the same protocol every time, and track the trend.
              </p>
              <p>
                <strong className="text-off-white">Limitations:</strong> FTP is a useful training
                anchor but not a complete picture of fitness. Two riders with identical FTP can have very
                different VO2max, anaerobic capacity, fatigue resistance, and repeatability profiles.
                Power duration modelling (e.g., WKO&apos;s mFTP) attempts a more nuanced estimate by
                looking at the full power-duration curve rather than a single test.
              </p>
              <p className="text-xs text-foreground-subtle">
                Last updated: July 2026 &middot; Tool version 1.0
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
