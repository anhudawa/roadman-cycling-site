"use client";

import { useState } from "react";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { ToolLanding } from "@/components/features/tools/ToolLanding";
import { calculateSweatMetrics } from "@/lib/tools/hydration-calculator";

function numberFrom(value: string) {
  return value.trim() === "" ? Number.NaN : Number(value);
}

export default function HydrationPage() {
  const [preWeight, setPreWeight] = useState("");
  const [postWeight, setPostWeight] = useState("");
  const [fluid, setFluid] = useState("");
  const [urine, setUrine] = useState("0");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [bottleSize, setBottleSize] = useState<500 | 750>(750);
  const [calculated, setCalculated] = useState(false);

  const preWeightKg = numberFrom(preWeight);
  const postWeightKg = numberFrom(postWeight);
  const fluidMl = numberFrom(fluid);
  const urineMl = numberFrom(urine);
  const hoursValue = numberFrom(hours);
  const minutesValue = numberFrom(minutes);
  const durationMinutes =
    (Number.isFinite(hoursValue) ? hoursValue : 0) * 60 +
    (Number.isFinite(minutesValue) ? minutesValue : 0);

  const errors: string[] = [];
  if (!Number.isFinite(preWeightKg) || preWeightKg < 30 || preWeightKg > 250) {
    errors.push("Enter a pre-ride body mass between 30 and 250 kg.");
  }
  if (!Number.isFinite(postWeightKg) || postWeightKg < 30 || postWeightKg > 250) {
    errors.push("Enter a post-ride body mass between 30 and 250 kg.");
  }
  if (!Number.isFinite(fluidMl) || fluidMl < 0 || fluidMl > 15000) {
    errors.push("Enter fluid consumed between 0 and 15,000 ml.");
  }
  if (!Number.isFinite(urineMl) || urineMl < 0 || urineMl > 5000) {
    errors.push("Enter urine produced between 0 and 5,000 ml.");
  }
  if (durationMinutes < 15 || durationMinutes > 24 * 60) {
    errors.push("Enter a ride duration between 15 minutes and 24 hours.");
  }
  if (Number.isFinite(minutesValue) && (minutesValue < 0 || minutesValue > 59)) {
    errors.push("Minutes must be between 0 and 59.");
  }

  const canCalculate = errors.length === 0;
  const metrics = canCalculate
    ? calculateSweatMetrics({
        preWeightKg,
        postWeightKg,
        fluidMl,
        urineMl,
        durationMinutes,
      })
    : null;
  const resultIsPlausible = Boolean(metrics && metrics.sweatLossLitres > 0);
  const bottleEquivalent =
    metrics && resultIsPlausible
      ? metrics.sweatLossLitres / (bottleSize / 1000)
      : 0;
  const resetResult = () => setCalculated(false);

  return (
    <>
      <Header />
      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow" className="text-center">
            <p className="text-coral text-sm font-body font-medium uppercase tracking-widest mb-4">
              Free evidence-led tool
            </p>
            <h1
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              CYCLING SWEAT RATE CALCULATOR
            </h1>
            <p className="text-foreground-muted text-lg">
              Turn a real ride into a condition-specific sweat-rate estimate—with
              the assumptions and safety boundaries kept visible.
            </p>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <div className="rounded-xl border border-coral/25 bg-coral/5 p-5 mb-8">
              <p className="text-off-white font-heading text-sm mb-2">MEASURE NORMAL BEHAVIOUR</p>
              <p className="text-foreground-muted text-sm leading-relaxed">
                Drink normally and measure it. You do not need to withhold fluid.
                Use dry minimal clothing, the same scale and a representative
                ride. This tool estimates loss; it does not prescribe how much you
                must drink or diagnose a hydration problem.
              </p>
            </div>

            <div className="bg-background-elevated rounded-xl border border-white/5 p-6 md:p-8 mb-8">
              <div className="grid md:grid-cols-2 gap-5 mb-6">
                <div>
                  <label htmlFor="pre-weight" className="block font-heading text-sm text-off-white mb-2">
                    PRE-RIDE BODY MASS
                  </label>
                  <div className="relative">
                    <input
                      id="pre-weight"
                      type="number"
                      min="30"
                      max="250"
                      step="0.1"
                      inputMode="decimal"
                      value={preWeight}
                      onChange={(event) => {
                        setPreWeight(event.target.value);
                        resetResult();
                      }}
                      placeholder="75.0"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pr-12 text-off-white text-xl font-heading focus:outline-none focus:border-coral"
                    />
                    <span className="absolute right-4 top-3.5 text-foreground-subtle text-sm">kg</span>
                  </div>
                  <p className="text-foreground-subtle text-xs mt-1">After using the toilet; nude or dry minimal clothing.</p>
                </div>

                <div>
                  <label htmlFor="post-weight" className="block font-heading text-sm text-off-white mb-2">
                    POST-RIDE BODY MASS
                  </label>
                  <div className="relative">
                    <input
                      id="post-weight"
                      type="number"
                      min="30"
                      max="250"
                      step="0.1"
                      inputMode="decimal"
                      value={postWeight}
                      onChange={(event) => {
                        setPostWeight(event.target.value);
                        resetResult();
                      }}
                      placeholder="74.4"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pr-12 text-off-white text-xl font-heading focus:outline-none focus:border-coral"
                    />
                    <span className="absolute right-4 top-3.5 text-foreground-subtle text-sm">kg</span>
                  </div>
                  <p className="text-foreground-subtle text-xs mt-1">Remove wet kit and towel dry before weighing.</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5 mb-6">
                <div>
                  <label htmlFor="fluid" className="block font-heading text-sm text-off-white mb-2">
                    FLUID CONSUMED
                  </label>
                  <div className="relative">
                    <input
                      id="fluid"
                      type="number"
                      min="0"
                      max="15000"
                      step="50"
                      inputMode="numeric"
                      value={fluid}
                      onChange={(event) => {
                        setFluid(event.target.value);
                        resetResult();
                      }}
                      placeholder="750"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pr-12 text-off-white text-xl font-heading focus:outline-none focus:border-coral"
                    />
                    <span className="absolute right-4 top-3.5 text-foreground-subtle text-sm">ml</span>
                  </div>
                  <p className="text-foreground-subtle text-xs mt-1">Count every bottle, refill and drink.</p>
                </div>

                <div>
                  <label htmlFor="urine" className="block font-heading text-sm text-off-white mb-2">
                    URINE DURING RIDE
                  </label>
                  <div className="relative">
                    <input
                      id="urine"
                      type="number"
                      min="0"
                      max="5000"
                      step="50"
                      inputMode="numeric"
                      value={urine}
                      onChange={(event) => {
                        setUrine(event.target.value);
                        resetResult();
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pr-12 text-off-white text-xl font-heading focus:outline-none focus:border-coral"
                    />
                    <span className="absolute right-4 top-3.5 text-foreground-subtle text-sm">ml</span>
                  </div>
                  <p className="text-foreground-subtle text-xs mt-1">Use 0 only if there was no bathroom stop.</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block font-heading text-sm text-off-white mb-2">RIDE DURATION</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input
                      aria-label="Ride duration hours"
                      type="number"
                      min="0"
                      max="24"
                      inputMode="numeric"
                      value={hours}
                      onChange={(event) => {
                        setHours(event.target.value);
                        resetResult();
                      }}
                      placeholder="1"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pr-14 text-off-white text-xl font-heading focus:outline-none focus:border-coral"
                    />
                    <span className="absolute right-4 top-3.5 text-foreground-subtle text-sm">hours</span>
                  </div>
                  <div className="relative">
                    <input
                      aria-label="Ride duration minutes"
                      type="number"
                      min="0"
                      max="59"
                      inputMode="numeric"
                      value={minutes}
                      onChange={(event) => {
                        setMinutes(event.target.value);
                        resetResult();
                      }}
                      placeholder="30"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pr-16 text-off-white text-xl font-heading focus:outline-none focus:border-coral"
                    />
                    <span className="absolute right-4 top-3.5 text-foreground-subtle text-sm">minutes</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setCalculated(true)}
                size="lg"
                className="w-full"
              >
                Calculate Sweat Rate
              </Button>

              {!canCalculate && calculated && (
                <div className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4" role="alert">
                  <ul className="text-yellow-200 text-sm space-y-1">
                    {errors.map((error) => (
                      <li key={error}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {calculated && metrics && (
              <div aria-live="polite" className="space-y-8">
                {!resultIsPlausible ? (
                  <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-6">
                    <h2 className="font-heading text-xl text-off-white mb-2">RECHECK THE INPUTS</h2>
                    <p className="text-foreground-muted text-sm">
                      These entries produce zero or negative estimated sweat loss.
                      Check body mass, consumed fluid, urine and units. If the
                      numbers are correct, the field observation is too noisy to
                      use as a sweat-rate estimate.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="text-center">
                      <p className="font-heading text-6xl md:text-8xl text-coral mb-2">
                        {metrics.sweatRateLitresPerHour.toFixed(2)} L/h
                      </p>
                      <p className="font-heading text-xl text-off-white">ESTIMATED SWEAT RATE</p>
                      <p className="text-foreground-muted text-sm mt-2">
                        A context-specific estimate from this ride—not a mandatory drinking target.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 text-center">
                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                        <p className="font-heading text-3xl text-off-white">{metrics.sweatLossLitres.toFixed(2)} L</p>
                        <p className="text-foreground-subtle text-sm">estimated total sweat loss</p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                        <p className="font-heading text-3xl text-off-white">
                          {metrics.netBodyMassChangePercent.toFixed(1)}%
                        </p>
                        <p className="text-foreground-subtle text-sm">net body-mass change</p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                        <p className="font-heading text-3xl text-off-white">{bottleEquivalent.toFixed(1)}</p>
                        <p className="text-foreground-subtle text-sm">{bottleSize} ml bottle equivalents lost</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2">
                      <span className="text-foreground-subtle text-xs">Bottle comparison:</span>
                      {[500, 750].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setBottleSize(size as 500 | 750)}
                          className={`rounded-md px-3 py-1 text-xs transition-all ${
                            bottleSize === size
                              ? "bg-coral/20 text-coral border border-coral/50"
                              : "bg-white/5 text-foreground-muted border border-white/10"
                          }`}
                        >
                          {size} ml
                        </button>
                      ))}
                    </div>

                    {metrics.massChangeKg < 0 && (
                      <div className="rounded-xl border border-red-500/35 bg-red-500/5 p-6">
                        <h2 className="font-heading text-lg text-red-200 mb-2">FLUID-RELATED MASS GAIN FLAG</h2>
                        <p className="text-foreground-muted text-sm">
                          Post-ride body mass was higher than pre-ride mass. The
                          NATA position statement advises normally hydrated
                          athletes not to gain body mass from drinking during
                          prolonged exercise. Recheck the measurements and reduce
                          intake if the pattern repeats.
                        </p>
                      </div>
                    )}

                    {metrics.netBodyMassChangePercent > 2 && (
                      <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-6">
                        <h2 className="font-heading text-lg text-yellow-200 mb-2">REVIEW THE CONTEXT</h2>
                        <p className="text-foreground-muted text-sm">
                          This ride ended more than 2% below starting body mass.
                          That is a useful review signal, especially in heat, but
                          not an automatic diagnosis or a universal performance
                          loss. Check conditions, symptoms, scale accuracy and
                          whether the same pattern repeats.
                        </p>
                      </div>
                    )}

                    {metrics.sweatRateLitresPerHour > 3 && (
                      <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-6">
                        <h2 className="font-heading text-lg text-yellow-200 mb-2">VERY HIGH ESTIMATE</h2>
                        <p className="text-foreground-muted text-sm">
                          Recheck units, wet clothing, drink and urine records,
                          then repeat in similar conditions. Do not attempt to
                          force this full volume during exercise from one field result.
                        </p>
                      </div>
                    )}

                    <div className="rounded-xl border border-white/10 p-6">
                      <h2 className="font-heading text-xl text-off-white mb-4">HOW TO USE THIS RESULT</h2>
                      <ol className="text-foreground-muted text-sm leading-relaxed space-y-3 list-decimal pl-5">
                        <li>Save the temperature, humidity, airflow, clothing, intensity and route beside the number.</li>
                        <li>Repeat a comparable session before treating the result as a usable range.</li>
                        <li>Use the range as an upper boundary and logistics input—not an automatic 100% replacement target.</li>
                        <li>Audit post-ride mass and symptoms; do not drink enough to gain body mass during prolonged exercise.</li>
                        <li>Plan sodium separately from fluid. A sweat-rate result does not measure sweat sodium concentration.</li>
                      </ol>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <Link href="/blog/cycling-hydration-guide" className="rounded-xl border border-coral/30 bg-coral/5 p-5 hover:bg-coral/10 transition-colors">
                        <span className="font-heading text-coral block mb-1">BUILD THE HYDRATION RANGE</span>
                        <span className="text-foreground-muted text-sm">When thirst is enough, when to plan and how to avoid overdrinking.</span>
                      </Link>
                      <Link href="/blog/electrolytes-sweat-rate-cycling" className="rounded-xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.06] transition-colors">
                        <span className="font-heading text-off-white block mb-1">REVIEW ELECTROLYTES</span>
                        <span className="text-foreground-muted text-sm">What sodium can do, label checks and why there is no universal dose.</span>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </Container>
        </Section>

        <Section background="deep-purple" grain>
          <Container width="narrow">
            <h2 className="font-heading text-off-white mb-4" style={{ fontSize: "var(--text-section)" }}>
              METHODOLOGY AND LIMITS
            </h2>
            <div className="text-foreground-muted text-sm leading-relaxed space-y-4">
              <p>
                <strong className="text-off-white">Formula:</strong> estimated sweat loss equals pre-ride body mass minus post-ride body mass, plus fluid consumed, minus urine produced. Divide by duration in hours. The formula follows the 2026 UCI cycling consensus.
              </p>
              <p>
                <strong className="text-off-white">Measurement:</strong> one kilogram of acute mass change is treated as roughly one litre of water. Wet clothing, scale precision, respiratory water, food and unrecorded losses add error. Repeat comparable tests.
              </p>
              <p>
                <strong className="text-off-white">Interpretation:</strong> the result estimates loss during one ride. It does not prescribe 100% replacement, measure sweat sodium or diagnose dehydration. Individual planning should avoid both substantial deficit and fluid-related body-mass gain.
              </p>
              <p>
                <strong className="text-off-white">Safety:</strong> confusion, seizure, collapse, loss of coordination or altered consciousness during or after exercise needs urgent medical help. Do not use this tool to decide whether to give water or salt.
              </p>
              <p className="text-xs text-foreground-subtle">
                Sources: UCI Sports Nutrition Project: Special Environments (2026, PMID 41468209); Baker sweat-testing methodology review (2017, PMID 28332116); NATA fluid-replacement position statement (2017, PMID 28985128). Last reviewed 26 August 2026 · Tool version 2.0.
              </p>
            </div>
          </Container>
        </Section>

        <ToolLanding slug="hydration" />
      </main>
      <Footer />
    </>
  );
}
