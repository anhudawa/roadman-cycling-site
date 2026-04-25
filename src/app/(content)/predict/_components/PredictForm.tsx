"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui";
import { CourseCard, type CourseCardItem } from "./CourseCard";

type Mode = "can_i_make_it" | "plan_my_race";
type Position =
  | "tt_bars"
  | "aero_drops"
  | "aero_hoods"
  | "endurance_hoods"
  | "standard_hoods"
  | "climbing";

interface PredictFormProps {
  /** Server-fetched course catalog. Keeps the form deterministic & SSR-safe. */
  courses: CourseCardItem[];
}

interface TranslatorResult {
  cda: number;
  crr: number;
  bodyMass: number;
  bikeMass: number;
  position: Position;
  confidence: number;
  reasoning: string;
  missing: string[];
}

const POSITIONS: { value: Position; label: string }[] = [
  { value: "tt_bars", label: "TT bars" },
  { value: "aero_drops", label: "Aero road · drops" },
  { value: "aero_hoods", label: "Aero road · hoods" },
  { value: "endurance_hoods", label: "Endurance · hoods" },
  { value: "standard_hoods", label: "Standard road · hoods" },
  { value: "climbing", label: "Climbing position" },
];

export function PredictForm({ courses }: PredictFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedCourse = searchParams.get("course");

  const initialSlug = useMemo(() => {
    if (courses.length === 0) return "";
    const match = requestedCourse
      ? courses.find((c) => c.slug === requestedCourse)
      : null;
    return (match ?? courses[0]).slug;
  }, [courses, requestedCourse]);

  const [mode, setMode] = useState<Mode>("plan_my_race");
  const [courseSlug, setCourseSlug] = useState<string>(initialSlug);
  const [showAllCourses, setShowAllCourses] = useState(false);

  // Keep the selection in sync if the catalog hydrates after mount or the
  // ?course= param changes via in-app navigation.
  useEffect(() => {
    if (initialSlug && initialSlug !== courseSlug) setCourseSlug(initialSlug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSlug]);

  const [bodyMass, setBodyMass] = useState<number>(75);
  const [bikeMass, setBikeMass] = useState<number>(8);
  const [position, setPosition] = useState<Position>("aero_hoods");
  const [ftp, setFtp] = useState<number>(260);
  const [airTempC, setAirTempC] = useState<number>(18);
  const [windSpeedMs, setWindSpeedMs] = useState<number>(0);

  const [aiText, setAiText] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<TranslatorResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const visibleCourses = useMemo(
    () => (showAllCourses ? courses : courses.slice(0, 6)),
    [courses, showAllCourses],
  );
  const selectedCourse = courses.find((c) => c.slug === courseSlug);

  async function runTranslator() {
    if (!aiText.trim()) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/predict/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: aiText }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiError(data?.error ?? "Translation failed.");
        return;
      }
      const r = data.params as TranslatorResult;
      setAiResult(r);
      setBodyMass(r.bodyMass);
      setBikeMass(r.bikeMass);
      setPosition(r.position);
    } catch {
      setAiError("Couldn't reach the translator. Fill the form manually.");
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit() {
    setSubmitError(null);
    if (!courseSlug) {
      setSubmitError("Pick an event first.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseSlug,
          mode,
          rider: {
            bodyMass,
            bikeMass,
            position,
            powerProfile: { ftp },
            cda: aiResult?.cda,
            crr: aiResult?.crr,
          },
          environment: {
            airTemperatureC: airTempC,
            windSpeedMs,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data?.error ?? "Prediction failed.");
        return;
      }
      router.push(`/predict/${data.slug}`);
    } catch {
      setSubmitError("Network issue — try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8 pb-32 lg:pb-12">
      {/* Step 1: Mode toggle */}
      <Step number={1} title="Why are you riding this?">
        <div className="grid sm:grid-cols-2 gap-3">
          <ModeCard
            active={mode === "plan_my_race"}
            onClick={() => setMode("plan_my_race")}
            title="Plan my race"
            window="24–48 h out"
            body="Optimised pacing for your A-race. Variable-power plan, weather-aware, durability-aware."
          />
          <ModeCard
            active={mode === "can_i_make_it"}
            onClick={() => setMode("can_i_make_it")}
            title="Can I make it?"
            window="6+ months out"
            body="Honest gap analysis. What you'd ride today at sustainable effort, surfacing where the work is."
          />
        </div>
      </Step>

      {/* Step 2: Course picker */}
      <Step
        number={2}
        title="Pick your event"
        action={
          courses.length > 0 ? (
            <Link
              href="/predict/courses"
              className="text-coral text-xs uppercase tracking-wider hover:text-coral-hover"
            >
              Browse all →
            </Link>
          ) : null
        }
      >
        {courses.length === 0 ? (
          <div className="bg-white/[0.03] border border-white/5 rounded-lg p-6 text-off-white/70">
            <p className="mb-2">Event catalog is empty.</p>
            <p className="text-sm text-off-white/50">
              Run <code className="text-coral">npm run seed:race-events</code>{" "}
              to populate it, then refresh.
            </p>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {visibleCourses.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => setCourseSlug(c.slug)}
                  className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-coral rounded-xl"
                >
                  <CourseCard
                    slug={c.slug}
                    name={c.name}
                    country={c.country}
                    region={c.region}
                    distanceM={c.distanceM}
                    elevationGainM={c.elevationGainM}
                    course={c.courseData}
                    eventDates={c.eventDates}
                    href="#"
                    selected={courseSlug === c.slug}
                  />
                </button>
              ))}
            </div>
            {courses.length > 6 && !showAllCourses && (
              <button
                type="button"
                onClick={() => setShowAllCourses(true)}
                className="mt-4 text-coral text-sm uppercase tracking-wider hover:text-coral-hover"
              >
                Show {courses.length - 6} more events ↓
              </button>
            )}
          </>
        )}
      </Step>

      {/* Step 3: AI translator */}
      <Step
        number={3}
        title="Setup"
        subtitle="Describe your bike, kit and weight in one line — we'll fill the rest."
      >
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
          <textarea
            value={aiText}
            onChange={(e) => setAiText(e.target.value)}
            placeholder="e.g. Canyon Aeroad CFR, Continental GP5000 28mm, hoods, 76 kg lean rider"
            className="w-full bg-charcoal/60 text-off-white border border-white/10 rounded-md p-3 text-sm h-20 resize-none focus:outline-none focus:border-coral/60 transition"
            maxLength={500}
          />
          <div className="flex items-center justify-between gap-3 mt-3 flex-wrap">
            <Button
              onClick={runTranslator}
              disabled={aiLoading || !aiText.trim()}
              variant="outline"
              size="sm"
            >
              {aiLoading ? "Reading…" : "Translate"}
            </Button>
            {aiError && <span className="text-coral text-xs">{aiError}</span>}
            {aiResult && !aiError && (
              <span className="text-[#3FB67A] text-xs">
                ✓ Confidence{" "}
                {(aiResult.confidence * 100).toFixed(0)}%
              </span>
            )}
          </div>
          {aiResult && (
            <div className="mt-3 bg-deep-purple/40 rounded-md p-3 text-xs text-off-white/80 border-l-2 border-coral/60">
              <p>{aiResult.reasoning}</p>
              {aiResult.missing.length > 0 && (
                <p className="mt-1.5 text-off-white/55">
                  Couldn't extract: {aiResult.missing.join(", ")}. Adjust below.
                </p>
              )}
            </div>
          )}
        </div>
      </Step>

      {/* Step 4: Rider */}
      <Step number={4} title="You">
        <div className="grid grid-cols-2 gap-3">
          <NumberSlider
            label="Body mass"
            unit="kg"
            min={45}
            max={120}
            step={0.5}
            value={bodyMass}
            onChange={setBodyMass}
          />
          <NumberSlider
            label="Bike mass"
            unit="kg"
            min={6}
            max={15}
            step={0.1}
            value={bikeMass}
            onChange={setBikeMass}
          />
          <NumberSlider
            label="FTP"
            unit="W"
            min={130}
            max={400}
            step={5}
            value={ftp}
            onChange={setFtp}
          />
          <div>
            <label className="text-off-white/65 text-[11px] uppercase tracking-wider block mb-1.5">
              Position
            </label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value as Position)}
              className="w-full bg-white/[0.04] text-off-white border border-white/10 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-coral/60"
            >
              {POSITIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Step>

      {/* Step 5: Conditions */}
      <Step number={5} title="Conditions on the day">
        <div className="grid grid-cols-2 gap-3">
          <NumberSlider
            label="Air temp"
            unit="°C"
            min={-5}
            max={40}
            step={1}
            value={airTempC}
            onChange={setAirTempC}
          />
          <NumberSlider
            label="Wind speed"
            unit="m/s"
            min={0}
            max={15}
            step={0.5}
            value={windSpeedMs}
            onChange={setWindSpeedMs}
          />
        </div>
      </Step>

      {/* Submit — sticky on mobile, inline on desktop */}
      <div className="hidden lg:block">
        {submitError && (
          <p className="text-coral text-sm mb-3">{submitError}</p>
        )}
        <Button
          onClick={handleSubmit}
          disabled={submitting || !courseSlug}
          size="lg"
          className="w-full"
        >
          {submitting ? "Predicting…" : "Run prediction"}
        </Button>
        <p className="text-off-white/40 text-xs text-center mt-3">
          Free · Instant · Physics-grade time prediction
        </p>
      </div>

      {/* Sticky CTA on mobile */}
      <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-deep-purple/95 backdrop-blur border-t border-white/10 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {submitError && (
          <p className="text-coral text-xs mb-2 text-center">{submitError}</p>
        )}
        {selectedCourse && (
          <p className="text-off-white/70 text-[11px] text-center mb-2 truncate">
            <span className="text-coral">●</span> {selectedCourse.name}
          </p>
        )}
        <Button
          onClick={handleSubmit}
          disabled={submitting || !courseSlug}
          size="lg"
          className="w-full"
        >
          {submitting ? "Predicting…" : "Run prediction"}
        </Button>
      </div>
    </div>
  );
}

function Step({
  number,
  title,
  subtitle,
  action,
  children,
}: {
  number: number;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <div>
          <p className="text-coral text-[11px] uppercase tracking-[0.2em] mb-1">
            Step {number}
          </p>
          <h2 className="font-display text-2xl text-off-white uppercase tracking-wide">
            {title}
          </h2>
          {subtitle && (
            <p className="text-off-white/60 text-sm mt-1">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function ModeCard({
  active,
  onClick,
  title,
  window: windowLabel,
  body,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  window: string;
  body: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-xl p-5 border transition-all ${
        active
          ? "border-coral bg-coral/[0.08] shadow-[0_0_24px_rgba(241,99,99,0.15)]"
          : "border-white/[0.07] bg-white/[0.03] hover:border-coral/40 hover:bg-white/[0.05]"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <p
          className={`font-display text-xl uppercase tracking-wide ${
            active ? "text-coral" : "text-off-white"
          }`}
        >
          {title}
        </p>
        <span className="text-[10px] uppercase tracking-wider text-off-white/50 bg-white/[0.05] px-2 py-0.5 rounded">
          {windowLabel}
        </span>
      </div>
      <p className="text-off-white/65 text-sm leading-relaxed">{body}</p>
    </button>
  );
}

function NumberSlider({
  label,
  unit,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="bg-white/[0.04] border border-white/[0.06] rounded-lg p-3">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-off-white/65 text-[11px] uppercase tracking-wider">
          {label}
        </span>
        <span className="font-display text-lg text-off-white">
          {Number.isInteger(value) ? value : value.toFixed(1)}
          <span className="text-off-white/50 text-xs ml-1">{unit}</span>
        </span>
      </div>
      <div
        className="relative h-1.5 rounded-full bg-white/[0.06] overflow-hidden mb-1"
        aria-hidden
      >
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple to-coral"
          style={{ width: `${pct}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full -mt-2 appearance-none bg-transparent cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-off-white
          [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-coral
          [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-off-white
          [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-coral"
      />
    </div>
  );
}
