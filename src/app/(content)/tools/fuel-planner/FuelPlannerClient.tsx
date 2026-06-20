"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { SkoolTrialButton } from "@/components/features/community/SkoolTrialButton";
import { ToolLanding } from "@/components/features/tools/ToolLanding";
import { calculateDailyMacros, IN_RIDE_CARBS_BY_CATEGORY } from "@/lib/fuel-planner";
import type {
  UserProfile,
  TrainingSession,
  FuelCategory,
  DailyMacros,
  Sex,
  BodyCompGoal,
  ActivityLevel,
} from "@/lib/fuel-planner";
import { TOOL_EVENTS } from "@/lib/analytics/tool-events";
import { trackAnalyticsEvent } from "@/lib/analytics/client";

const SKOOL_URL = "https://www.skool.com/roadmancycling";

/* ------------------------------------------------------------------ */
/*  Input option models                                                */
/* ------------------------------------------------------------------ */

interface RideIntensity {
  id: string;
  label: string;
  desc: string;
  /** Intensity Factor used by the calorie engine. */
  intensityFactor: number;
  /** Fuel category driving in-ride carb targets. */
  cat: FuelCategory;
  /** Sweat-rate coefficient (ml per kg body weight per hour). */
  sweatMlPerKgHr: number;
}

/**
 * Five ride profiles mapped onto the engine's fuel categories. The
 * intensityFactor feeds calorie restoration; the category drives the
 * in-ride carb prescription via IN_RIDE_CARBS_BY_CATEGORY.
 */
const RIDE_INTENSITIES: RideIntensity[] = [
  { id: "easy", label: "Easy / Recovery", desc: "Coffee ride, Z1–low Z2", intensityFactor: 0.55, cat: "LOW", sweatMlPerKgHr: 8 },
  { id: "endurance", label: "Endurance", desc: "Steady Z2, long ride", intensityFactor: 0.65, cat: "MODERATE", sweatMlPerKgHr: 9 },
  { id: "tempo", label: "Tempo / Sweet spot", desc: "Sustained Z3–low Z4", intensityFactor: 0.8, cat: "MODERATE_HIGH", sweatMlPerKgHr: 10.5 },
  { id: "threshold", label: "Threshold / Intervals", desc: "Z4 intervals, hard", intensityFactor: 0.88, cat: "HIGH", sweatMlPerKgHr: 12 },
  { id: "race", label: "Race / VO2", desc: "Full gas, race day", intensityFactor: 0.95, cat: "VERY_HIGH", sweatMlPerKgHr: 12.5 },
];

const SEX_OPTIONS: { id: Sex; label: string }[] = [
  { id: "male", label: "Male" },
  { id: "female", label: "Female" },
];

const GOAL_OPTIONS: { id: BodyCompGoal; label: string; hint: string }[] = [
  { id: "lose", label: "Lose weight", hint: "15% deficit" },
  { id: "maintain", label: "Maintain", hint: "Fuel to train" },
  { id: "gain", label: "Build", hint: "10% surplus" },
];

const ACTIVITY_OPTIONS: { id: ActivityLevel; label: string; hint: string }[] = [
  { id: "sedentary", label: "Desk job", hint: "Mostly seated" },
  { id: "light", label: "Light", hint: "On feet some" },
  { id: "moderate", label: "Moderate", hint: "Active day" },
  { id: "active", label: "Active", hint: "Manual / on feet" },
];

/* ------------------------------------------------------------------ */
/*  Results model                                                      */
/* ------------------------------------------------------------------ */

interface HydrationEstimate {
  fluidPerHrMl: number;
  totalFluidMl: number;
  bottles: number;
}

interface FuelResults {
  restDay: DailyMacros;
  trainingDay: DailyMacros;
  inRideGPerHr: number;
  inRideTotalG: number;
  hydration: HydrationEstimate;
  rideHours: number;
  intensityLabel: string;
}

/**
 * Hydration estimate. Sweat rate scales with body weight and ride
 * intensity; total fluid scales with duration. Output is rounded to
 * sensible 50ml steps and capped at a realistic 1,200 ml/hr ceiling.
 */
function estimateHydration(weightKg: number, durationMin: number, intensity: RideIntensity): HydrationEstimate {
  const rawPerHr = weightKg * intensity.sweatMlPerKgHr;
  const fluidPerHrMl = Math.min(1200, Math.round(rawPerHr / 50) * 50);
  const hours = durationMin / 60;
  const totalFluidMl = Math.round((fluidPerHrMl * hours) / 50) * 50;
  return {
    fluidPerHrMl,
    totalFluidMl,
    bottles: Math.round((totalFluidMl / 500) * 10) / 10,
  };
}

function clampNum(value: string, min: number, max: number, fallback: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

/* ------------------------------------------------------------------ */
/*  Small UI primitives                                                */
/* ------------------------------------------------------------------ */

function NumberField({
  id,
  label,
  suffix,
  value,
  onChange,
  min,
  max,
}: {
  id: string;
  label: string;
  suffix: string;
  value: string;
  onChange: (v: string) => void;
  min: number;
  max: number;
}) {
  return (
    <div>
      <label htmlFor={id} className="block font-heading text-sm text-off-white tracking-wide mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white/5 border border-white/10 focus:border-coral rounded-lg px-4 py-3 pr-14 text-off-white text-lg font-heading tracking-wider placeholder:text-foreground-subtle focus:outline-none transition-colors"
          style={{ transitionDuration: "var(--duration-fast)" }}
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground-subtle text-sm pointer-events-none">
          {suffix}
        </span>
      </div>
    </div>
  );
}

function PillGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: T; label: string; hint?: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <p className="font-heading text-sm text-off-white tracking-wide mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = opt.id === value;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              aria-pressed={active}
              className={`flex min-h-[44px] flex-col justify-center rounded-lg border px-3 py-2 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-coral ${
                active
                  ? "border-coral bg-coral/10 text-off-white"
                  : "border-white/10 bg-white/[0.03] text-foreground-muted hover:border-white/25"
              }`}
              style={{ transitionDuration: "var(--duration-fast)" }}
            >
              <span className="block text-sm font-heading tracking-wide">{opt.label}</span>
              {opt.hint && <span className="block text-xs text-foreground-subtle">{opt.hint}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MacroBar({ macros }: { macros: DailyMacros }) {
  const segments = [
    { label: "Carbs", pct: macros.carbPct, color: "#F59E0B" },
    { label: "Protein", pct: macros.proteinPct, color: "#3B82F6" },
    { label: "Fat", pct: macros.fatPct, color: "#F16363" },
  ];
  return (
    <div className="flex h-3 w-full overflow-hidden rounded-full">
      {segments.map((s) => (
        <div key={s.label} style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
      ))}
    </div>
  );
}

function MacroStat({ label, grams, pct, color }: { label: string; grams: number; pct: number; color: string }) {
  return (
    <div className="rounded-lg border border-white/5 bg-background-elevated p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <span className="text-xs uppercase tracking-widest text-foreground-subtle">{label}</span>
      </div>
      <p className="font-heading text-2xl text-off-white">{grams}g</p>
      <p className="text-xs text-foreground-subtle">{pct}% of calories</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function FuelPlannerClient() {
  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState("35");
  const [heightCm, setHeightCm] = useState("178");
  const [weightKg, setWeightKg] = useState("75");
  const [ftp, setFtp] = useState("250");
  const [goal, setGoal] = useState<BodyCompGoal>("maintain");
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [intensityId, setIntensityId] = useState("endurance");
  const [rideHours, setRideHours] = useState("2");

  const [results, setResults] = useState<FuelResults | null>(null);

  const handleCalculate = () => {
    const w = clampNum(weightKg, 35, 200, 75);
    const intensity = RIDE_INTENSITIES.find((r) => r.id === intensityId) ?? RIDE_INTENSITIES[1];
    const durationMin = clampNum(rideHours, 0.25, 12, 2) * 60;

    const profile: UserProfile = {
      sex,
      age: clampNum(age, 14, 90, 35),
      heightCm: clampNum(heightCm, 130, 220, 178),
      weightKg: w,
      bodyCompGoal: goal,
      deficitPct: 15,
      surplusPct: 10,
      ftp: clampNum(ftp, 80, 600, 250),
      activityLevel: activity,
    };

    const session: TrainingSession = {
      name: intensity.label,
      durationMin,
      intensityFactor: intensity.intensityFactor,
      fuelCategory: intensity.cat,
      startTime: "09:00",
      isCompetition: false,
    };

    const restDay = calculateDailyMacros(profile, null);
    const trainingDay = calculateDailyMacros(profile, session);

    // In-ride carbs only matter for rides of an hour or more — matches
    // the engine's generateDayPlan threshold.
    const inRideGPerHr = durationMin >= 60 ? IN_RIDE_CARBS_BY_CATEGORY[intensity.cat] : 0;
    const inRideTotalG = Math.round(inRideGPerHr * (durationMin / 60));

    setResults({
      restDay,
      trainingDay,
      inRideGPerHr,
      inRideTotalG,
      hydration: estimateHydration(w, durationMin, intensity),
      rideHours: durationMin / 60,
      intensityLabel: intensity.label,
    });

    trackAnalyticsEvent({
      type: TOOL_EVENTS.COMPLETED,
      page: typeof window !== "undefined" ? window.location.pathname : "/tools/fuel-planner",
      meta: {
        tool: "fuel_planner",
        weightKg: String(w),
        ftp: String(profile.ftp),
        goal,
        intensity: intensity.id,
      },
    });
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
            <h1 className="font-heading text-off-white mb-4" style={{ fontSize: "var(--text-section)" }}>
              CYCLING FUEL PLANNER
            </h1>
            <p className="text-foreground-muted text-lg">
              Your daily calorie target, macro split, in-ride carbs, and hydration —
              calculated for the rider you are and the ride you&apos;re doing. No
              guesswork, no generic 60g-an-hour rule.
            </p>
          </Container>
        </Section>

        {/* Calculator */}
        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            {/* Inputs */}
            <div className="bg-background-elevated rounded-xl border border-white/5 p-6 md:p-8 mb-8 space-y-6">
              <div>
                <h2 className="font-heading text-lg text-off-white mb-1">ABOUT YOU</h2>
                <p className="text-sm text-foreground-muted">
                  Everything stays in your browser. We never see your numbers.
                </p>
              </div>

              <PillGroup label="Sex" options={SEX_OPTIONS} value={sex} onChange={setSex} />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <NumberField id="age" label="Age" suffix="yrs" value={age} onChange={setAge} min={14} max={90} />
                <NumberField id="height" label="Height" suffix="cm" value={heightCm} onChange={setHeightCm} min={130} max={220} />
                <NumberField id="weight" label="Weight" suffix="kg" value={weightKg} onChange={setWeightKg} min={35} max={200} />
                <NumberField id="ftp" label="FTP" suffix="W" value={ftp} onChange={setFtp} min={80} max={600} />
              </div>

              <PillGroup label="Body composition goal" options={GOAL_OPTIONS} value={goal} onChange={setGoal} />
              <PillGroup label="Daily activity (off the bike)" options={ACTIVITY_OPTIONS} value={activity} onChange={setActivity} />

              <div className="border-t border-white/10 pt-6">
                <h2 className="font-heading text-lg text-off-white mb-1">TODAY&apos;S RIDE</h2>
                <p className="text-sm text-foreground-muted mb-4">
                  Pick the session you&apos;re fuelling for.
                </p>
                <div className="space-y-4">
                  <PillGroup
                    label="Ride intensity"
                    options={RIDE_INTENSITIES.map((r) => ({ id: r.id, label: r.label, hint: r.desc }))}
                    value={intensityId}
                    onChange={setIntensityId}
                  />
                  <div className="max-w-[12rem]">
                    <NumberField
                      id="rideHours"
                      label="Ride duration"
                      suffix="hrs"
                      value={rideHours}
                      onChange={setRideHours}
                      min={0.25}
                      max={12}
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleCalculate} size="lg" className="w-full">
                Calculate My Fuel
              </Button>
            </div>

            {/* Results */}
            <div aria-live="polite" aria-atomic="false">
              <AnimatePresence mode="wait">
                {results && (
                  <motion.div
                    key={`${results.trainingDay.totalKcal}-${results.intensityLabel}-${results.rideHours}`}
                    className="space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {/* Calorie targets */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="rounded-xl border border-coral/30 bg-coral/5 p-6">
                        <p className="text-xs uppercase tracking-widest text-coral mb-2">
                          Training day · {results.intensityLabel}
                        </p>
                        <p className="font-heading text-4xl text-off-white stat-glow">
                          {results.trainingDay.totalKcal.toLocaleString()}
                          <span className="text-lg text-foreground-muted"> kcal</span>
                        </p>
                        <p className="text-sm text-foreground-muted mt-1">
                          What to eat across the day you train.
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-background-elevated p-6">
                        <p className="text-xs uppercase tracking-widest text-foreground-subtle mb-2">
                          Rest day
                        </p>
                        <p className="font-heading text-4xl text-off-white">
                          {results.restDay.totalKcal.toLocaleString()}
                          <span className="text-lg text-foreground-muted"> kcal</span>
                        </p>
                        <p className="text-sm text-foreground-muted mt-1">
                          Lower intake — you&apos;re not paying back a session.
                        </p>
                      </div>
                    </div>

                    {/* Macro split (training day) */}
                    <div className="rounded-xl border border-white/5 bg-background-elevated p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="font-heading text-xl text-off-white">TRAINING-DAY MACROS</h2>
                        <span className="text-xs text-foreground-subtle">{results.intensityLabel}</span>
                      </div>
                      <MacroBar macros={results.trainingDay} />
                      <div className="grid grid-cols-3 gap-3 mt-4">
                        <MacroStat label="Carbs" grams={results.trainingDay.carbsG} pct={results.trainingDay.carbPct} color="#F59E0B" />
                        <MacroStat label="Protein" grams={results.trainingDay.proteinG} pct={results.trainingDay.proteinPct} color="#3B82F6" />
                        <MacroStat label="Fat" grams={results.trainingDay.fatG} pct={results.trainingDay.fatPct} color="#F16363" />
                      </div>
                      <p className="text-xs text-foreground-subtle mt-4">
                        Protein held at 1.8 g/kg. Carbs scale with the work you do — fat
                        fills the rest. This is fuel-for-the-work-required, not a flat ratio.
                      </p>
                    </div>

                    {/* In-ride carbs + hydration */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="rounded-xl border border-white/5 bg-background-elevated p-6">
                        <p className="text-xs uppercase tracking-widest text-foreground-subtle mb-3">
                          On the bike — carbs
                        </p>
                        {results.inRideGPerHr > 0 ? (
                          <>
                            <p className="font-heading text-3xl text-coral">
                              {results.inRideGPerHr}
                              <span className="text-base text-foreground-muted"> g/hr</span>
                            </p>
                            <p className="text-sm text-foreground-muted mt-1">
                              ≈ {results.inRideTotalG}g total over {results.rideHours}h.
                              {results.inRideGPerHr >= 70 && " Use a 2:1 glucose:fructose mix."}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="font-heading text-3xl text-off-white">Optional</p>
                            <p className="text-sm text-foreground-muted mt-1">
                              Short or easy enough to ride on water. Eat if you fancy it.
                            </p>
                          </>
                        )}
                      </div>
                      <div className="rounded-xl border border-white/5 bg-background-elevated p-6">
                        <p className="text-xs uppercase tracking-widest text-foreground-subtle mb-3">
                          On the bike — hydration
                        </p>
                        <p className="font-heading text-3xl text-coral">
                          {results.hydration.fluidPerHrMl}
                          <span className="text-base text-foreground-muted"> ml/hr</span>
                        </p>
                        <p className="text-sm text-foreground-muted mt-1">
                          ≈ {(results.hydration.totalFluidMl / 1000).toFixed(1)}L total ·{" "}
                          {results.hydration.bottles} bottles. Add 300–700mg sodium/hr and more
                          fluid in the heat.
                        </p>
                      </div>
                    </div>

                    {/* Gated 12-week plan CTA */}
                    <div className="relative overflow-hidden rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/50 to-charcoal p-6 md:p-8">
                      <p className="font-heading text-coral text-xs tracking-widest mb-3">
                        GET THE FULL 12-WEEK PLAN
                      </p>
                      <h3 className="font-heading text-2xl text-off-white mb-3">
                        This is one day. Inside the community, you get the whole block.
                      </h3>
                      <ul className="space-y-2 text-sm text-foreground-muted mb-6">
                        {[
                          "A periodised 12-week fuel calendar mapped to your training week",
                          "Meal-by-meal macros — breakfast, lunch, snacks, dinner — with pre and post-ride timing",
                          "Recovery-week and race-day adjustments built in automatically",
                          "Weekly live calls with Anthony and the same access the pros get",
                        ].map((line) => (
                          <li key={line} className="flex gap-3">
                            <span className="text-coral shrink-0 mt-0.5">→</span>
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                        <SkoolTrialButton href={SKOOL_URL} source="fuel_planner_tool" size="lg">
                          Get the Full Plan →
                        </SkoolTrialButton>
                        <span className="text-xs text-foreground-subtle">
                          7-day free trial · cancel anytime
                        </span>
                      </div>
                    </div>

                    {/* How the numbers work */}
                    <div className="rounded-xl border border-white/10 p-6">
                      <h3 className="font-heading text-lg text-off-white mb-3">
                        HOW THESE NUMBERS WORK
                      </h3>
                      <div className="space-y-3 text-sm text-foreground-muted leading-relaxed">
                        <p>
                          <strong className="text-off-white">Fuel for the work required.</strong>{" "}
                          Your calorie target isn&apos;t a fixed number — it moves with what you do.
                          Train hard, eat more carbs. Rest, pull them back. This is the method James
                          Morton built for Team Sky and the one the World Tour runs on today.
                        </p>
                        <p>
                          <strong className="text-off-white">Protein stays steady.</strong>{" "}
                          We hold protein at 1.8 g/kg every day to protect muscle while you periodise
                          carbs around training. Fat fills whatever calories are left.
                        </p>
                        <p>
                          <strong className="text-off-white">It&apos;s a starting prescription.</strong>{" "}
                          Your daily energy comes off the Mifflin-St Jeor equation; the carb
                          periodisation runs on the Hexis Fuel For The Work Required model that
                          sports nutritionist Dr Sam Impey took us through on the podcast. Both are
                          population estimates — dial them in over a few weeks against how you
                          actually feel and perform on the bike.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Container>
        </Section>

        <ToolLanding slug="fuel-planner" />
      </main>
      <Footer />
    </>
  );
}
