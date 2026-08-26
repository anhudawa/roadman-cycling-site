"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Header, Footer, Section, Container } from "@/components/layout";
import { ReportRequestForm } from "@/components/features/tools/ReportRequestForm";
import { ToolLanding } from "@/components/features/tools/ToolLanding";
import {
  FORK_PROFILES,
  REAR_PROFILES,
  calculateSuspensionSetup,
  type ForkProfileId,
  type RearProfileId,
  type SuspensionSetupResult,
} from "@/lib/tools/mtb-suspension";

type WeightUnit = "kg" | "lb";

function toKg(value: number, unit: WeightUnit): number {
  return unit === "kg" ? value : value / 2.2046226218;
}

function convertWeightInput(value: string, from: WeightUnit, to: WeightUnit): string {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || from === to) return value;
  const converted = to === "lb" ? parsed * 2.2046226218 : parsed / 2.2046226218;
  return String(Math.round(converted * 10) / 10);
}

function numericError(
  value: string,
  label: string,
  min: number,
  max: number,
  unit: string,
): string | null {
  const parsed = Number(value);
  if (!value.trim() || !Number.isFinite(parsed)) return `Enter ${label.toLowerCase()}.`;
  if (parsed < min || parsed > max) return `${label} must be ${min}–${max}${unit}.`;
  return null;
}

function pressureLabel(result: SuspensionSetupResult["fork"]): string {
  switch (result.pressureStatus) {
    case "outside-chart":
      return "OUTSIDE PUBLISHED CHART";
    case "over-maximum":
      return "DO NOT USE A WEIGHT ESTIMATE";
    case "coil":
      return "SPRING LOOKUP REQUIRED";
    case "lookup-required":
      return "OFFICIAL LOOKUP REQUIRED";
    default:
      return "STARTING PRESSURE";
  }
}

export default function MtbSuspensionCalculatorPage() {
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");
  const [bodyWeight, setBodyWeight] = useState("");
  const [kitWeight, setKitWeight] = useState("3");
  const [forkProfileId, setForkProfileId] = useState<ForkProfileId>("fox-38-float-2026");
  const [forkTravelMm, setForkTravelMm] = useState("170");
  const [forkSagPercent, setForkSagPercent] = useState("20");
  const [rearProfileId, setRearProfileId] = useState<RearProfileId>("fox-float-x-sl-evol-2026");
  const [rearStrokeMm, setRearStrokeMm] = useState("55");
  const [rearSagPercent, setRearSagPercent] = useState("30");
  const [result, setResult] = useState<SuspensionSetupResult | null>(null);
  const [copied, setCopied] = useState(false);

  const selectedFork = FORK_PROFILES.find((profile) => profile.id === forkProfileId)!;
  const selectedRear = REAR_PROFILES.find((profile) => profile.id === rearProfileId)!;
  const forkTravelMin = selectedFork.travelRangeMm?.min ?? 80;
  const forkTravelMax = selectedFork.travelRangeMm?.max ?? 220;
  const bodyWeightKg = toKg(Number(bodyWeight), weightUnit);
  const kitWeightKg = toKg(Number(kitWeight), weightUnit);
  const bodyWeightError = numericError(
    bodyWeight,
    "Body weight",
    weightUnit === "kg" ? 40 : 88,
    weightUnit === "kg" ? 200 : 440,
    weightUnit,
  );
  const kitWeightError = numericError(
    kitWeight,
    "Kit weight",
    0,
    weightUnit === "kg" ? 20 : 44,
    weightUnit,
  );
  const forkTravelError = numericError(
    forkTravelMm,
    "Fork travel",
    forkTravelMin,
    forkTravelMax,
    "mm",
  );
  const forkSagError = numericError(forkSagPercent, "Fork sag", 10, 30, "%");
  const rearStrokeError = numericError(rearStrokeMm, "Shock stroke", 20, 100, "mm");
  const rearSagError = numericError(rearSagPercent, "Rear sag", 20, 40, "%");
  const errors = [
    bodyWeightError,
    kitWeightError,
    forkTravelError,
    forkSagError,
    rearStrokeError,
    rearSagError,
  ].filter(Boolean);

  function clearResult() {
    setResult(null);
    setCopied(false);
  }

  function switchWeightUnit(nextUnit: WeightUnit) {
    if (nextUnit === weightUnit) return;
    setBodyWeight(convertWeightInput(bodyWeight, weightUnit, nextUnit));
    setKitWeight(convertWeightInput(kitWeight, weightUnit, nextUnit));
    setWeightUnit(nextUnit);
    clearResult();
  }

  function handleCalculate() {
    if (errors.length > 0) return;
    setResult(calculateSuspensionSetup({
      bodyWeightKg,
      kitWeightKg,
      forkProfileId,
      forkTravelMm: Number(forkTravelMm),
      forkSagPercent: Number(forkSagPercent),
      rearProfileId,
      rearStrokeMm: Number(rearStrokeMm),
      rearSagPercent: Number(rearSagPercent),
    }));
  }

  async function copyResult() {
    if (!result) return;
    const forkPressure = result.fork.startingPsi === null
      ? "official product lookup required"
      : `${result.fork.startingPsi} PSI starting point`;
    const rearPressure = result.rear.startingPsi === null
      ? result.rear.pressureStatus === "coil"
        ? "bike-specific spring lookup required"
        : "official bike/product lookup required"
      : `${result.rear.startingPsi} PSI starting point`;
    const text = [
      "MTB suspension setup — Roadman Cycling",
      `Riding weight: ${result.ridingWeightKg} kg (${result.ridingWeightLb} lb)`,
      `Fork: ${result.fork.label} — ${forkPressure}; ${result.fork.sagMm} mm at ${result.fork.sagPercent}% sag`,
      `Rear: ${result.rear.label} — ${rearPressure}; ${result.rear.sagMm} mm at ${result.rear.sagPercent}% sag`,
      "Starting pressure is not the target: equalise the air spring, measure sag in full kit, and follow the exact manufacturer/manual limits.",
      "https://roadmancycling.com/tools/shock-pressure",
    ].join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  const inputClasses =
    "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 font-heading tracking-wider text-off-white outline-none transition-colors placeholder:text-foreground-subtle focus:border-coral";
  const errorClasses = inputClasses.replace("border-white/10", "border-coral/70");

  return (
    <>
      <Header />
      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow" className="text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-coral">
              Free, source-aware tool
            </p>
            <h1 className="mb-4 font-heading text-off-white" style={{ fontSize: "var(--text-section)" }}>
              MTB SUSPENSION CALCULATOR
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-foreground-muted">
              Calculate fork and rear-shock sag in millimetres, get a manufacturer-backed starting pressure where the exact source supports one, and see when an official bike or serial-number lookup must take over.
            </p>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <div className="mb-6 rounded-xl border border-coral/30 bg-coral/5 p-5">
              <p className="mb-2 font-heading text-xs tracking-widest text-coral">THE IMPORTANT BIT</p>
              <p className="text-sm leading-relaxed text-foreground-muted">
                PSI is a starting input; measured sag is the setup target. This calculator never invents a universal rear-shock pressure, extrapolates beyond a published chart, or changes PSI automatically for riding style or volume spacers.
              </p>
            </div>

            <div className="space-y-8 rounded-2xl border border-white/5 bg-background-elevated p-6 md:p-8">
              <fieldset className="space-y-5">
                <legend className="font-heading text-xl text-off-white">01 — RIDER</legend>
                <p className="text-sm leading-relaxed text-foreground-muted">
                  Body weight drives the FOX rear-shock starting method. Body plus kit is matched to the fork chart and is the weight you use when measuring sag.
                </p>

                <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
                  <div>
                    <label htmlFor="body-weight" className="mb-2 block text-sm font-medium text-off-white">Body weight</label>
                    <input
                      id="body-weight"
                      type="number"
                      min={weightUnit === "kg" ? 40 : 88}
                      max={weightUnit === "kg" ? 200 : 440}
                      step="0.1"
                      placeholder={weightUnit === "kg" ? "e.g. 80" : "e.g. 176"}
                      value={bodyWeight}
                      onChange={(event) => { setBodyWeight(event.target.value); clearResult(); }}
                      className={bodyWeightError ? errorClasses : inputClasses}
                    />
                    {bodyWeightError && <p className="mt-1 text-xs text-coral" role="alert">{bodyWeightError}</p>}
                  </div>
                  <div>
                    <label htmlFor="kit-weight" className="mb-2 block text-sm font-medium text-off-white">Kit + hydration</label>
                    <input
                      id="kit-weight"
                      type="number"
                      min="0"
                      max={weightUnit === "kg" ? 20 : 44}
                      step="0.1"
                      value={kitWeight}
                      onChange={(event) => { setKitWeight(event.target.value); clearResult(); }}
                      className={kitWeightError ? errorClasses : inputClasses}
                    />
                    {kitWeightError && <p className="mt-1 text-xs text-coral" role="alert">{kitWeightError}</p>}
                  </div>
                  <div>
                    <span className="mb-2 block text-sm font-medium text-off-white">Unit</span>
                    <div className="flex overflow-hidden rounded-lg border border-white/10">
                      {(["kg", "lb"] as const).map((unit) => (
                        <button
                          key={unit}
                          type="button"
                          aria-pressed={weightUnit === unit}
                          onClick={() => switchWeightUnit(unit)}
                          className={`px-4 py-3 font-heading text-sm tracking-wider transition-colors ${weightUnit === unit ? "bg-coral text-off-white" : "bg-white/5 text-foreground-muted hover:bg-white/10"}`}
                        >
                          {unit.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {!bodyWeightError && !kitWeightError && (
                  <p className="rounded-lg bg-white/[0.03] px-4 py-3 text-sm text-foreground-muted">
                    Dressed riding weight: <span className="font-heading text-off-white">{Math.round((bodyWeightKg + kitWeightKg) * 10) / 10} kg</span>
                  </p>
                )}
              </fieldset>

              <div className="border-t border-white/10" />

              <fieldset className="space-y-5">
                <legend className="font-heading text-xl text-off-white">02 — FORK</legend>
                <div>
                  <label htmlFor="fork-profile" className="mb-2 block text-sm font-medium text-off-white">Exact fork source profile</label>
                  <select
                    id="fork-profile"
                    value={forkProfileId}
                    onChange={(event) => { setForkProfileId(event.target.value as ForkProfileId); clearResult(); }}
                    className={`${inputClasses} appearance-none`}
                  >
                    {FORK_PROFILES.map((profile) => <option key={profile.id} value={profile.id} className="bg-charcoal">{profile.label}</option>)}
                  </select>
                  <p className="mt-2 text-xs leading-relaxed text-foreground-subtle">{selectedFork.note}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="fork-travel" className="mb-2 block text-sm font-medium text-off-white">Fork travel (mm)</label>
                    <input
                      id="fork-travel"
                      type="number"
                      min={forkTravelMin}
                      max={forkTravelMax}
                      value={forkTravelMm}
                      onChange={(event) => { setForkTravelMm(event.target.value); clearResult(); }}
                      className={forkTravelError ? errorClasses : inputClasses}
                    />
                    {forkTravelError && <p className="mt-1 text-xs text-coral" role="alert">{forkTravelError}</p>}
                    {selectedFork.travelRangeMm && !forkTravelError && (
                      <p className="mt-2 text-xs text-foreground-subtle">
                        Published 2026 FOX 38 travel range: {forkTravelMin}–{forkTravelMax} mm.
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="fork-sag" className="mb-2 block text-sm font-medium text-off-white">Target fork sag (%)</label>
                    <input
                      id="fork-sag"
                      type="number"
                      min="10"
                      max="30"
                      step="1"
                      value={forkSagPercent}
                      onChange={(event) => { setForkSagPercent(event.target.value); clearResult(); }}
                      className={forkSagError ? errorClasses : inputClasses}
                    />
                    {forkSagError && <p className="mt-1 text-xs text-coral" role="alert">{forkSagError}</p>}
                    <p className="mt-2 text-xs text-foreground-subtle">FOX specifies 15–20% for the 2026 38. RockShox describes 10–20% as firmer and 20–30% as more sensitive; use the exact manual.</p>
                  </div>
                </div>
              </fieldset>

              <div className="border-t border-white/10" />

              <fieldset className="space-y-5">
                <legend className="font-heading text-xl text-off-white">03 — REAR SUSPENSION</legend>
                <div>
                  <label htmlFor="rear-profile" className="mb-2 block text-sm font-medium text-off-white">Exact rear-shock source profile</label>
                  <select
                    id="rear-profile"
                    value={rearProfileId}
                    onChange={(event) => { setRearProfileId(event.target.value as RearProfileId); clearResult(); }}
                    className={`${inputClasses} appearance-none`}
                  >
                    {REAR_PROFILES.map((profile) => <option key={profile.id} value={profile.id} className="bg-charcoal">{profile.label}</option>)}
                  </select>
                  <p className="mt-2 text-xs leading-relaxed text-foreground-subtle">{selectedRear.note}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="rear-stroke" className="mb-2 block text-sm font-medium text-off-white">Shock stroke (mm)</label>
                    <input
                      id="rear-stroke"
                      type="number"
                      min="20"
                      max="100"
                      step="0.5"
                      value={rearStrokeMm}
                      onChange={(event) => { setRearStrokeMm(event.target.value); clearResult(); }}
                      className={rearStrokeError ? errorClasses : inputClasses}
                    />
                    {rearStrokeError && <p className="mt-1 text-xs text-coral" role="alert">{rearStrokeError}</p>}
                    <p className="mt-2 text-xs text-foreground-subtle">Use shock stroke, not rear-wheel travel. Check the shock ID or bike manual.</p>
                  </div>
                  <div>
                    <label htmlFor="rear-sag" className="mb-2 block text-sm font-medium text-off-white">Target rear sag (%)</label>
                    <input
                      id="rear-sag"
                      type="number"
                      min="20"
                      max="40"
                      step="1"
                      value={rearSagPercent}
                      onChange={(event) => { setRearSagPercent(event.target.value); clearResult(); }}
                      className={rearSagError ? errorClasses : inputClasses}
                    />
                    {rearSagError && <p className="mt-1 text-xs text-coral" role="alert">{rearSagError}</p>}
                    <p className="mt-2 text-xs text-foreground-subtle">FOX specifies 25–30% for 2026 FLOAT X/SL and approximately 30% for FLOAT X2.</p>
                  </div>
                </div>
              </fieldset>

              <button
                type="button"
                onClick={handleCalculate}
                disabled={errors.length > 0}
                className="w-full rounded-lg bg-coral px-6 py-4 font-heading text-lg tracking-wider text-off-white transition-colors hover:bg-coral/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                CALCULATE STARTING SETUP
              </button>
              {errors.length > 0 && bodyWeight && (
                <p className="text-center text-xs text-coral">Correct the highlighted input before calculating.</p>
              )}
            </div>
          </Container>
        </Section>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
              <Section background="deep-purple" grain className="!py-12">
                <Container width="narrow">
                  <div className="mb-7 text-center">
                    <p className="mb-2 font-heading text-xs tracking-widest text-coral">YOUR STARTING SETUP</p>
                    <h2 className="font-heading text-3xl text-off-white">PRESSURE STARTS IT. SAG DECIDES IT.</h2>
                    <p className="mt-3 text-sm text-foreground-muted">Riding weight {result.ridingWeightKg} kg / {result.ridingWeightLb} lb</p>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    {[{ name: "Fork", component: result.fork }, { name: "Rear", component: result.rear }].map(({ name, component }) => (
                      <article key={name} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                        <p className="mb-2 font-heading text-xs tracking-widest text-coral">{name.toUpperCase()}</p>
                        <h3 className="mb-5 font-heading text-lg leading-tight text-off-white">{component.label}</h3>
                        <div className="mb-5 rounded-xl bg-charcoal/60 p-5 text-center">
                          <p className="mb-2 text-xs uppercase tracking-widest text-foreground-subtle">{pressureLabel(component)}</p>
                          {component.startingPsi !== null ? (
                            <p className="font-heading text-5xl text-coral">{component.startingPsi}<span className="ml-2 text-lg text-foreground-muted">PSI</span></p>
                          ) : (
                            <p className="font-heading text-xl text-off-white">USE THE EXACT PRODUCT LOOKUP</p>
                          )}
                          {component.sourceBand && <p className="mt-2 text-xs text-foreground-subtle">Published chart band: {component.sourceBand}</p>}
                        </div>
                        <div className="mb-5 flex items-end justify-between gap-4 border-b border-white/10 pb-5">
                          <div>
                            <p className="text-xs uppercase tracking-widest text-foreground-subtle">Sag target</p>
                            <p className="mt-1 font-heading text-3xl text-off-white">{component.sagMm} mm</p>
                          </div>
                          <p className="font-heading text-lg text-coral">{component.sagPercent}%</p>
                        </div>
                        <p className="text-sm leading-relaxed text-foreground-muted">{component.pressureExplanation}</p>
                        {component.maximumPsi && (
                          <p className="mt-3 text-xs text-foreground-subtle">Manufacturer-stated maximum for this selected profile: {component.maximumPsi} PSI. Never exceed the lowest applicable bike or component limit.</p>
                        )}
                        {component.sourceUrl ? (
                          <a href={component.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex text-sm text-coral hover:text-coral/80">
                            Open source: {component.sourceLabel} →
                          </a>
                        ) : (
                          <p className="mt-4 text-sm text-coral">Source required: {component.sourceLabel}</p>
                        )}
                      </article>
                    ))}
                  </div>

                  <div className="mt-6 rounded-2xl border border-white/10 bg-charcoal/60 p-6 md:p-8">
                    <h3 className="mb-5 font-heading text-xl text-off-white">THE DEFENSIBLE SETUP SEQUENCE</h3>
                    <ol className="space-y-4 text-sm leading-relaxed text-foreground-muted">
                      <li><span className="mr-2 font-heading text-coral">01</span> Confirm the exact model, model year, travel/stroke, maximum pressure and bicycle-manufacturer setup note.</li>
                      <li><span className="mr-2 font-heading text-coral">02</span> Open compression damping. Add air in the manufacturer’s increments and follow its chamber-equalisation procedure.</li>
                      <li><span className="mr-2 font-heading text-coral">03</span> Wearing full riding kit, settle into your normal position without bouncing and measure the O-ring movement.</li>
                      <li><span className="mr-2 font-heading text-coral">04</span> Add or remove a small amount of air, equalise again where required, and repeat until the measured sag matches the millimetre target.</li>
                      <li><span className="mr-2 font-heading text-coral">05</span> Set rebound and compression from the exact product guide only after sag is correct. Test one change at a time on a repeatable trail.</li>
                    </ol>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-coral/20 bg-coral/5 p-5">
                      <p className="mb-2 font-heading text-sm text-off-white">VOLUME SPACERS</p>
                      <p className="text-sm leading-relaxed text-foreground-muted">Spacers change mid/end-stroke progression and bottom-out support. They do not justify a hidden percentage increase in starting PSI. Set sag again after any approved spacer change.</p>
                    </div>
                    <div className="rounded-xl border border-coral/20 bg-coral/5 p-5">
                      <p className="mb-2 font-heading text-sm text-off-white">COIL SPRINGS</p>
                      <p className="text-sm leading-relaxed text-foreground-muted">Roadman does not estimate spring rate from rider weight alone. Use a bike-specific calculator or frame maker because leverage curve, travel, stroke and preload all matter.</p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button type="button" onClick={copyResult} className="flex-1 rounded-lg border border-white/15 bg-white/5 px-5 py-3 font-heading text-sm tracking-wider text-off-white transition-colors hover:border-coral/40 hover:bg-coral/5">
                      {copied ? "COPIED" : "COPY SETUP"}
                    </button>
                    <Link href="/tools/tyre-pressure" className="flex-1 rounded-lg border border-white/15 bg-white/5 px-5 py-3 text-center font-heading text-sm tracking-wider text-off-white transition-colors hover:border-coral/40 hover:bg-coral/5">
                      OPEN TYRE PRESSURE TOOL →
                    </Link>
                  </div>

                  <p className="mt-5 text-center text-xs leading-relaxed text-foreground-subtle">
                    Independent calculator; not affiliated with FOX, SRAM or RockShox. Product names are used only to identify the applicable manufacturer source. The bicycle and component manufacturers’ instructions override this page.
                  </p>

                  <div className="mt-8">
                    <ReportRequestForm
                      tool="shock-pressure"
                      inputs={{
                        bodyWeightKg: result.bodyWeightKg,
                        ridingWeightKg: result.ridingWeightKg,
                        forkLabel: result.fork.label,
                        forkStartingPsi: result.fork.startingPsi ?? undefined,
                        forkPressureStatus: result.fork.pressureStatus,
                        forkSagPercent: result.fork.sagPercent,
                        forkSagMm: result.fork.sagMm,
                        rearLabel: result.rear.label,
                        rearStartingPsi: result.rear.startingPsi ?? undefined,
                        rearPressureStatus: result.rear.pressureStatus,
                        rearSagPercent: result.rear.sagPercent,
                        rearSagMm: result.rear.sagMm,
                      }}
                      heading="Keep your suspension setup card"
                      subheading="We’ll email the exact starting values, sag measurements, source boundary and repeatable setup sequence shown here."
                      bullets={[
                        "Fork and rear sag targets in millimetres",
                        "Clearly labelled pressure value or official-lookup requirement",
                        "A source-aware setup and re-check sequence",
                        "No invented rebound clicks or generic coil spring rate",
                      ]}
                      buttonText="EMAIL MY SETUP"
                    />
                  </div>
                </Container>
              </Section>
            </motion.div>
          )}
        </AnimatePresence>

        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <div className="rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-6 text-center md:p-8">
              <p className="mb-2 font-heading text-xs tracking-widest text-coral">SETUP IS ONLY ONE PART</p>
              <p className="mb-2 font-heading text-lg text-off-white md:text-xl">Build the engine that makes the bike fast.</p>
              <p className="mx-auto mb-5 max-w-md text-sm text-foreground-muted">Roadman coaching builds your training, fuelling, strength and recovery around your real riding and available time.</p>
              <Link href="/apply" className="inline-flex items-center justify-center rounded-md bg-coral px-6 py-3 font-heading text-sm uppercase tracking-wider text-off-white transition-colors hover:bg-coral/90" data-track="tool_shock_apply">
                Apply for coaching →
              </Link>
            </div>
          </Container>
        </Section>

        <ToolLanding slug="shock-pressure" />
      </main>
      <Footer />
    </>
  );
}
