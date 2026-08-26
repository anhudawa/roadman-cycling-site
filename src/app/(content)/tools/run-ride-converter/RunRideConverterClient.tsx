"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { ToolLanding } from "@/components/features/tools/ToolLanding";
import {
  ToolNextSteps,
  type ToolNextStepsPost,
} from "@/components/features/tools/ToolNextSteps";
import {
  convertRunRideEnergyCost,
  CYCLING_ACTIVITIES,
  milesToKilometres,
  RUNNING_ACTIVITIES,
  type RunRideDirection,
  type RunRideDistanceUnit,
  type RunRideInputMode,
} from "@/lib/tools/run-ride-equivalence";

interface RunRideConverterClientProps {
  runToRidePosts: ToolNextStepsPost[];
  rideToRunPosts: ToolNextStepsPost[];
}

const DEFAULTS = {
  "run-to-ride": { source: "run-6", target: "ride-12" },
  "ride-to-run": { source: "ride-12", target: "run-6" },
} as const;

function formatMinutes(minutes: number): string {
  const rounded = Math.max(1, Math.round(minutes));
  if (rounded < 60) return `${rounded} min`;
  const hours = Math.floor(rounded / 60);
  const remainder = rounded % 60;
  return remainder ? `${hours} hr ${remainder} min` : `${hours} hr`;
}

function formatDistance(
  miles: number,
  unit: RunRideDistanceUnit,
): string {
  const value = unit === "km" ? milesToKilometres(miles) : miles;
  return `${value.toFixed(1)} ${unit}`;
}

export default function RunRideConverterClient({
  runToRidePosts,
  rideToRunPosts,
}: RunRideConverterClientProps) {
  const [direction, setDirection] =
    useState<RunRideDirection>("run-to-ride");
  const [inputMode, setInputMode] = useState<RunRideInputMode>("distance");
  const [distanceUnit, setDistanceUnit] =
    useState<RunRideDistanceUnit>("km");
  const [amount, setAmount] = useState("5");
  const [sourceActivityId, setSourceActivityId] = useState<string>(
    DEFAULTS["run-to-ride"].source,
  );
  const [targetActivityId, setTargetActivityId] = useState<string>(
    DEFAULTS["run-to-ride"].target,
  );
  const [calculated, setCalculated] = useState(false);

  const sourceActivities =
    direction === "run-to-ride" ? RUNNING_ACTIVITIES : CYCLING_ACTIVITIES;
  const targetActivities =
    direction === "run-to-ride" ? CYCLING_ACTIVITIES : RUNNING_ACTIVITIES;
  const numericAmount = Number(amount);
  const amountError =
    amount && (!Number.isFinite(numericAmount) || numericAmount <= 0)
      ? "Enter a positive number"
      : null;
  const canCalculate = numericAmount > 0 && !amountError;

  const result = useMemo(() => {
    if (!calculated || !canCalculate) return null;
    return convertRunRideEnergyCost({
      direction,
      inputMode,
      amount: numericAmount,
      distanceUnit,
      sourceActivityId,
      targetActivityId,
    });
  }, [
    calculated,
    canCalculate,
    direction,
    distanceUnit,
    inputMode,
    numericAmount,
    sourceActivityId,
    targetActivityId,
  ]);

  const updateDirection = (next: RunRideDirection) => {
    setDirection(next);
    setSourceActivityId(DEFAULTS[next].source);
    setTargetActivityId(DEFAULTS[next].target);
    setCalculated(false);
  };

  const sourceName = direction === "run-to-ride" ? "run" : "ride";
  const targetName = direction === "run-to-ride" ? "ride" : "run";
  const nextPosts =
    direction === "run-to-ride" ? runToRidePosts : rideToRunPosts;

  return (
    <>
      <Header />
      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow" className="text-center">
            <p className="text-coral text-sm font-body font-medium uppercase tracking-widest mb-4">
              Free Tool
            </p>
            <h1
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              CYCLING TO RUNNING CONVERSION CALCULATOR
            </h1>
            <p className="text-foreground-muted text-lg">
              Match a run and ride by population-average energy cost using
              published 2024 Compendium MET values. The result is a planning
              estimate—not equivalent performance or impact load.
            </p>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <div className="bg-background-elevated rounded-xl border border-white/5 p-6 md:p-8 mb-8">
              <fieldset className="mb-7">
                <legend className="block font-heading text-sm text-off-white mb-3">
                  CONVERSION DIRECTION
                </legend>
                <div
                  className="flex gap-3"
                  role="tablist"
                  aria-label="Conversion direction"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={direction === "run-to-ride"}
                    onClick={() => updateDirection("run-to-ride")}
                    className={`flex-1 min-h-[44px] py-2.5 rounded-lg font-heading text-sm tracking-wider transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-coral ${direction === "run-to-ride" ? "bg-coral text-off-white" : "bg-white/5 text-foreground-muted hover:bg-white/10"}`}
                  >
                    RUN → RIDE
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={direction === "ride-to-run"}
                    onClick={() => updateDirection("ride-to-run")}
                    className={`flex-1 min-h-[44px] py-2.5 rounded-lg font-heading text-sm tracking-wider transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-coral ${direction === "ride-to-run" ? "bg-coral text-off-white" : "bg-white/5 text-foreground-muted hover:bg-white/10"}`}
                  >
                    RIDE → RUN
                  </button>
                </div>
              </fieldset>

              <fieldset className="mb-7">
                <legend className="block font-heading text-sm text-off-white mb-3">
                  START WITH
                </legend>
                <div
                  className="flex gap-3"
                  role="tablist"
                  aria-label="Input type"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={inputMode === "distance"}
                    onClick={() => {
                      setInputMode("distance");
                      setAmount("5");
                      setCalculated(false);
                    }}
                    className={`flex-1 min-h-[42px] py-2 rounded-lg font-heading text-xs tracking-wider transition-all cursor-pointer ${inputMode === "distance" ? "bg-white/15 text-off-white" : "bg-white/5 text-foreground-muted hover:bg-white/10"}`}
                  >
                    DISTANCE
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={inputMode === "time"}
                    onClick={() => {
                      setInputMode("time");
                      setAmount("30");
                      setCalculated(false);
                    }}
                    className={`flex-1 min-h-[42px] py-2 rounded-lg font-heading text-xs tracking-wider transition-all cursor-pointer ${inputMode === "time" ? "bg-white/15 text-off-white" : "bg-white/5 text-foreground-muted hover:bg-white/10"}`}
                  >
                    TIME
                  </button>
                </div>
              </fieldset>

              <div className="mb-6">
                <label
                  htmlFor="run-ride-amount"
                  className="block font-heading text-sm text-off-white mb-2"
                >
                  {inputMode === "distance"
                    ? `${sourceName.toUpperCase()} DISTANCE`
                    : `${sourceName.toUpperCase()} DURATION`}
                </label>
                <div className="flex gap-3">
                  <input
                    id="run-ride-amount"
                    type="number"
                    inputMode="decimal"
                    min="0.1"
                    step="0.1"
                    value={amount}
                    onChange={(event) => {
                      setAmount(event.target.value);
                      setCalculated(false);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && canCalculate) {
                        setCalculated(true);
                      }
                    }}
                    aria-invalid={Boolean(amountError)}
                    className={`flex-1 bg-white/5 border rounded-lg px-4 py-3 text-off-white text-xl font-heading tracking-wider focus:outline-none transition-colors ${amountError ? "border-red-500/60 focus:border-red-500" : "border-white/10 focus:border-coral"}`}
                  />
                  {inputMode === "distance" ? (
                    <div className="flex rounded-lg border border-white/10 overflow-hidden shrink-0">
                      {(["km", "mile"] as const).map((unit) => (
                        <button
                          key={unit}
                          type="button"
                          aria-pressed={distanceUnit === unit}
                          onClick={() => {
                            setDistanceUnit(unit);
                            setCalculated(false);
                          }}
                          className={`px-4 min-h-[44px] font-heading text-sm uppercase transition-colors cursor-pointer ${distanceUnit === unit ? "bg-coral text-off-white" : "bg-white/5 text-foreground-muted hover:bg-white/10"}`}
                        >
                          {unit}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span className="flex items-center rounded-lg border border-white/10 bg-white/5 px-4 font-heading text-sm text-foreground-muted">
                      MIN
                    </span>
                  )}
                </div>
                {amountError && (
                  <p className="text-red-400 text-xs mt-2" role="alert">
                    {amountError}
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-5 mb-7">
                <div>
                  <label
                    htmlFor="source-activity"
                    className="block font-heading text-sm text-off-white mb-2"
                  >
                    {sourceName.toUpperCase()} SPEED
                  </label>
                  <select
                    id="source-activity"
                    value={sourceActivityId}
                    onChange={(event) => {
                      setSourceActivityId(event.target.value);
                      setCalculated(false);
                    }}
                    className="w-full min-h-[48px] bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-off-white font-body focus:outline-none focus:border-coral"
                  >
                    {sourceActivities.map((activity) => (
                      <option
                        key={activity.id}
                        value={activity.id}
                        className="bg-charcoal"
                      >
                        {activity.label} · {activity.met} MET
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="target-activity"
                    className="block font-heading text-sm text-off-white mb-2"
                  >
                    TARGET {targetName.toUpperCase()} SPEED
                  </label>
                  <select
                    id="target-activity"
                    value={targetActivityId}
                    onChange={(event) => {
                      setTargetActivityId(event.target.value);
                      setCalculated(false);
                    }}
                    className="w-full min-h-[48px] bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-off-white font-body focus:outline-none focus:border-coral"
                  >
                    {targetActivities.map((activity) => (
                      <option
                        key={activity.id}
                        value={activity.id}
                        className="bg-charcoal"
                      >
                        {activity.label} · {activity.met} MET
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button
                onClick={() => canCalculate && setCalculated(true)}
                size="lg"
                className="w-full sm:w-auto"
              >
                Calculate energy-cost match
              </Button>
            </div>

            <div aria-live="polite" aria-atomic="false">
              <AnimatePresence mode="wait">
                {result && (
                  <motion.div
                    key={`${direction}-${inputMode}-${sourceActivityId}-${targetActivityId}-${amount}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.35 }}
                    className="space-y-4"
                  >
                    <h2 className="font-heading text-xl sm:text-2xl text-off-white">
                      POPULATION-AVERAGE ENERGY-COST MATCH
                    </h2>
                    <div className="bg-background-elevated rounded-lg border border-white/5 p-6 text-center">
                      <p className="font-heading text-5xl md:text-6xl text-coral mb-1">
                        {formatMinutes(result.targetMinutes)}
                      </p>
                      <p className="text-foreground-muted text-sm">
                        at {result.target.label} ≈ {formatDistance(result.targetDistanceMiles, distanceUnit)}
                      </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="bg-background-elevated rounded-lg border border-white/5 p-4">
                        <p className="font-heading text-off-white text-sm mb-1">
                          SOURCE SESSION
                        </p>
                        <p className="text-foreground-muted text-sm">
                          {formatMinutes(result.sourceMinutes)} · {formatDistance(result.sourceDistanceMiles, distanceUnit)} · {result.source.met} MET
                        </p>
                      </div>
                      <div className="bg-background-elevated rounded-lg border border-white/5 p-4">
                        <p className="font-heading text-off-white text-sm mb-1">
                          MATCHED EXPOSURE
                        </p>
                        <p className="text-foreground-muted text-sm">
                          {Math.round(result.metMinutes)} MET-minutes on each side
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg border border-coral/30 bg-coral/5 p-5">
                      <p className="font-heading text-coral text-sm mb-2">
                        WHAT THIS RESULT DOES NOT MEAN
                      </p>
                      <p className="text-foreground-muted text-sm leading-relaxed">
                        Equal MET-minutes do not create equal race fitness,
                        tissue load, recovery time, training stress or
                        adaptation. Running economy, cycling efficiency,
                        gradient, wind, drafting and sport-specific skill are
                        not captured. Use this as an energy-cost starting point,
                        then preserve the purpose of the original session.
                      </p>
                    </div>

                    <CaveatsList />
                    <LearnMoreBlock />
                    <CoachingCTA />
                    <ToolNextSteps
                      posts={nextPosts}
                      dataTrack={`tool_run_ride_next_steps_${direction.replaceAll("-", "_")}`}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Container>
        </Section>

        <Section background="deep-purple" grain>
          <Container width="narrow">
            <h2
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              METHOD AND EVIDENCE BOUNDARY
            </h2>
            <div className="text-foreground-muted text-sm leading-relaxed space-y-4">
              <p>
                The calculator uses the named running and bicycling activity
                codes in the{" "}
                <a
                  href="https://pacompendium.com/wp-content/uploads/2024/03/1_2024-adult-compendium_1_2024.pdf"
                  className="text-coral hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  2024 Adult Compendium of Physical Activities
                </a>
                . MET-minutes equal MET value × session minutes. The target
                duration is source MET-minutes ÷ target MET value. Body mass
                cancels when comparing the same person, so the tool does not
                need weight.
              </p>
              <p>
                METs are standardized population values designed to estimate
                activity energy cost, not to prove individual equivalence. A{" "}
                <a
                  href="https://pubmed.ncbi.nlm.nih.gov/42267259/"
                  className="text-coral hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  2026 systematic review and meta-analysis
                </a>{" "}
                found no clear between-group differences in the limited
                running/cycling cross-training evidence, but explicitly said
                the available evidence does not establish interchangeability.
              </p>
              <p>
                Exercise mode matters. A review of running and cycling
                physiology found modality-specific VO2max, threshold, heart
                rate, economy and neuromuscular responses. That is why this
                tool no longer predicts FTP from a running time or running race
                performance from FTP.
              </p>
              <p className="text-xs text-foreground-subtle">
                Last updated: 26 August 2026 · Model version 2.0 · Reviewed by
                Anthony Walsh for source and calculation scope
              </p>
            </div>
          </Container>
        </Section>

        <ToolLanding slug="run-ride-converter" />
      </main>
      <Footer />
    </>
  );
}

function CaveatsList() {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
      <ul className="space-y-1.5 text-foreground-subtle text-xs leading-relaxed">
        <li>Road speed is a proxy category; wind, gradient, surface and drafting can change cycling cost substantially.</li>
        <li>Running impact and eccentric loading have no cycling-distance equivalent.</li>
        <li>MET values estimate population-average energy cost; individual economy and efficiency vary.</li>
        <li>Preserve sport-specific sessions when race preparation, rehabilitation or tissue adaptation is the goal.</li>
      </ul>
    </div>
  );
}

function LearnMoreBlock() {
  return (
    <motion.div
      className="mt-8 rounded-xl border border-white/10 p-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.25 }}
    >
      <h3 className="font-heading text-lg text-off-white mb-3">LEARN MORE</h3>
      <ul className="space-y-2">
        <li><Link href="/blog/running-cycling-conversion-calculator" className="text-coral hover:text-coral/80 text-sm transition-colors">Cycling-to-running conversion guide and chart</Link></li>
        <li><Link href="/blog/running-vs-cycling-fitness-transfer" className="text-coral hover:text-coral/80 text-sm transition-colors">What fitness transfers between running and cycling?</Link></li>
        <li><Link href="/blog/cycling-replace-long-run-marathon" className="text-coral hover:text-coral/80 text-sm transition-colors">Can cycling replace a long run?</Link></li>
        <li><Link href="/topics/running-for-cyclists" className="text-coral hover:text-coral/80 text-sm transition-colors">Running for cyclists topic hub →</Link></li>
      </ul>
    </motion.div>
  );
}

function CoachingCTA() {
  return (
    <motion.div
      className="mt-8 rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-6 md:p-8 text-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.35 }}
    >
      <p className="font-heading text-coral text-xs tracking-widest mb-2">
        MIXING RUNNING AND CYCLING EACH WEEK?
      </p>
      <p className="text-off-white font-heading text-lg md:text-xl mb-2">
        Coaching protects the purpose and recovery cost of each session.
      </p>
      <p className="text-foreground-muted text-sm mb-5 max-w-md mx-auto">
        $195/month. 7-day free trial.
      </p>
      <a
        href="/apply"
        className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm transition-all"
        data-track="tool_run_ride_apply"
      >
        Apply for Coaching →
      </a>
    </motion.div>
  );
}
