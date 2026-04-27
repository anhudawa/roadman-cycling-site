"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import {
  CourseCard,
  type CourseCardData,
  ModeCard,
  PositionPicker,
  GpxDropzone,
  type GpxUploadResult,
  WhatIfSliders,
  ElevationProfile,
} from "@/components/features/predict";
import type { Course } from "@/lib/race-predictor/types";

type Mode = "plan_my_race" | "can_i_make_it";
type Position =
  | "tt_bars"
  | "aero_drops"
  | "aero_hoods"
  | "endurance_hoods"
  | "standard_hoods"
  | "climbing";

interface CourseAPIItem {
  slug: string;
  name: string;
  country: string | null;
  region: string | null;
  distanceKm: number;
  elevationGainM: number;
  surfaceSummary: string | null;
  eventDates: string[];
  climbCount: number;
  hcCount: number;
  profile: number[][];
  climbs: {
    startDistance: number;
    endDistance: number;
    length: number;
    averageGradient: number;
    elevationGain: number;
    category: "cat4" | "cat3" | "cat2" | "cat1" | "hc";
  }[];
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

export default function PredictPage() {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("plan_my_race");
  const [courses, setCourses] = useState<CourseAPIItem[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [courseSlug, setCourseSlug] = useState<string>("");
  const [gpx, setGpx] = useState<GpxUploadResult | null>(null);

  const [bodyMass, setBodyMass] = useState<number>(75);
  const [bikeMass, setBikeMass] = useState<number>(8);
  const [position, setPosition] = useState<Position>("aero_hoods");
  const [ftp, setFtp] = useState<number>(260);

  const [airTempC, setAirTempC] = useState<number>(18);
  const [windSpeedMs, setWindSpeedMs] = useState<number>(0);

  const [aiText, setAiText] = useState<string>("");
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<TranslatorResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setCoursesLoading(true);
    fetch("/api/courses")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.courses)) {
          setCourses(data.courses);
          if (!courseSlug && data.courses.length > 0) {
            setCourseSlug(data.courses[0].slug);
          }
        }
      })
      .catch(() => {})
      .finally(() => setCoursesLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedCourse = useMemo(
    () => courses.find((c) => c.slug === courseSlug) ?? null,
    [courses, courseSlug],
  );

  // Effective profile data for the live preview. Builds a synthetic Course
  // shape from the compact profile pairs so ElevationProfile renders the same
  // way for curated events and uploaded GPX.
  const previewData = useMemo(() => {
    function profileToCourse(
      profile: number[][],
      name: string,
      elevationGainM: number,
      climbs: {
        startDistance: number;
        endDistance: number;
        length: number;
        averageGradient: number;
        elevationGain: number;
        category: "cat4" | "cat3" | "cat2" | "cat1" | "hc";
      }[],
    ): Course {
      const segs = [];
      for (let i = 0; i < profile.length - 1; i++) {
        const [d0, e0] = profile[i];
        const [d1, e1] = profile[i + 1];
        const dist = Math.max(1, d1 - d0);
        const dElev = e1 - e0;
        segs.push({
          index: i,
          startLat: 0,
          startLon: 0,
          endLat: 0,
          endLon: 0,
          startElevation: e0,
          endElevation: e1,
          distance: dist,
          gradient: Math.atan2(dElev, dist),
          heading: 0,
        });
      }
      const total = segs.reduce((acc, s) => acc + s.distance, 0);
      return {
        name,
        segments: segs,
        totalDistance: total,
        totalElevationGain: elevationGainM,
        totalElevationLoss: 0,
        climbs: climbs.map((c) => ({
          ...c,
          startSegmentIndex: 0,
          endSegmentIndex: 0,
        })),
      };
    }

    if (gpx) {
      return {
        distanceKm: gpx.distanceM / 1000,
        elevationGainM: gpx.elevationGainM,
        name: gpx.name,
        course: profileToCourse(gpx.profile, gpx.name, gpx.elevationGainM, gpx.climbs),
      };
    }
    if (selectedCourse) {
      return {
        distanceKm: selectedCourse.distanceKm,
        elevationGainM: selectedCourse.elevationGainM,
        name: selectedCourse.name,
        course: profileToCourse(
          selectedCourse.profile,
          selectedCourse.name,
          selectedCourse.elevationGainM,
          selectedCourse.climbs,
        ),
      };
    }
    return null;
  }, [gpx, selectedCourse]);

  const cardCourses: CourseCardData[] = useMemo(
    () =>
      courses.map((c) => ({
        slug: c.slug,
        name: c.name,
        country: c.country,
        region: c.region,
        distanceKm: c.distanceKm,
        elevationGainM: c.elevationGainM,
        surfaceSummary: c.surfaceSummary,
        eventDates: c.eventDates,
        profile: c.profile,
        climbCount: c.climbCount,
        hcCount: c.hcCount,
      })),
    [courses],
  );

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

  const fieldErrors: { ftp?: string; bodyMass?: string; bikeMass?: string } = {};
  if (!Number.isFinite(ftp) || ftp < 50 || ftp > 500) {
    fieldErrors.ftp = "FTP should be 50–500 W.";
  }
  if (!Number.isFinite(bodyMass) || bodyMass < 40 || bodyMass > 150) {
    fieldErrors.bodyMass = "Body mass should be 40–150 kg.";
  }
  if (!Number.isFinite(bikeMass) || bikeMass < 5 || bikeMass > 30) {
    fieldErrors.bikeMass = "Bike mass should be 5–30 kg.";
  }
  const formInvalid = Object.keys(fieldErrors).length > 0;

  async function handleSubmit() {
    setSubmitError(null);
    if (!gpx && !courseSlug) {
      setSubmitError("Pick a course or drop a GPX file.");
      return;
    }
    if (formInvalid) {
      setSubmitError(
        Object.values(fieldErrors)[0] ?? "Fix the highlighted fields and try again.",
      );
      return;
    }
    setSubmitting(true);
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 12_000);
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: ctrl.signal,
        body: JSON.stringify({
          courseSlug: gpx ? undefined : courseSlug,
          gpxPoints: gpx?.points,
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
      }).finally(() => clearTimeout(timer));
      const data = await res.json().catch(() => ({}));
      if (res.status === 429) {
        setSubmitError(
          data?.error ??
            "You've used your free predictions for today — come back tomorrow or grab a Race Report.",
        );
        return;
      }
      if (!res.ok) {
        setSubmitError(
          data?.error ??
            "Prediction failed. The engine retried but couldn't finish — try again in a moment.",
        );
        return;
      }
      router.push(`/predict/${data.slug}`);
    } catch (e) {
      const aborted = e instanceof DOMException && e.name === "AbortError";
      setSubmitError(
        aborted
          ? "That took too long. The engine usually answers in under 3 seconds — check your connection and retry."
          : "Network issue — try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Header />
      <main>
        {/* HERO */}
        <Section
          background="deep-purple"
          grain
          className="pt-32 md:pt-40 pb-12 md:pb-16 relative overflow-hidden"
        >
          {/* Aurora wash */}
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute -top-32 -left-24 w-[600px] h-[600px] rounded-full blur-[140px] opacity-50"
              style={{
                background: "radial-gradient(circle, rgba(241,99,99,0.35), transparent 65%)",
              }}
            />
            <div
              className="absolute -bottom-40 right-0 w-[520px] h-[520px] rounded-full blur-[120px] opacity-50"
              style={{
                background: "radial-gradient(circle, rgba(76,18,115,0.7), transparent 65%)",
              }}
            />
          </div>

          <Container className="relative">
            <div className="max-w-3xl">
              <p
                className="text-[0.65rem] tracking-[0.28em] uppercase text-coral mb-4"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                ROADMAN · RACE PREDICTOR
              </p>
              <h1 className="font-heading uppercase tracking-tight text-off-white leading-[0.92] text-[clamp(2.75rem,8vw,6rem)] mb-5">
                Predict your finish.
                <br />
                <span className="text-coral">Pace your race.</span>
              </h1>
              <p className="text-lg md:text-xl text-off-white/80 max-w-2xl leading-relaxed mb-2">
                Physics-grade time prediction for any event in the calendar — or
                drop your own GPX. Free first insight. The full pacing plan,
                fuelling, and equipment scenarios live in the $29 Race Report.
              </p>

              <div
                className="mt-6 flex items-center gap-2 text-sm text-foreground-muted"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                <span className="block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>SOLVES POWER BALANCE PER 50M SEGMENT</span>
                <span className="text-foreground-subtle">·</span>
                <span>±3% TYPICAL ACCURACY</span>
              </div>
            </div>
          </Container>
        </Section>

        {/* MODE SELECTION */}
        <Section background="charcoal" className="!py-10 md:!py-12">
          <Container>
            <div className="grid md:grid-cols-2 gap-4 md:gap-5">
              <ModeCard
                mode="plan_my_race"
                selected={mode === "plan_my_race"}
                onSelect={() => setMode("plan_my_race")}
              />
              <ModeCard
                mode="can_i_make_it"
                selected={mode === "can_i_make_it"}
                onSelect={() => setMode("can_i_make_it")}
              />
            </div>
          </Container>
        </Section>

        {/* COURSE SELECTION */}
        <Section background="charcoal" className="!py-10 md:!py-12">
          <Container>
            <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
              <div>
                <p
                  className="text-[0.65rem] tracking-[0.22em] uppercase text-coral mb-2"
                  style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                >
                  STEP 01 · COURSE
                </p>
                <h2 className="font-heading text-3xl md:text-4xl uppercase tracking-tight text-off-white">
                  Pick your event
                </h2>
              </div>
              <p className="text-sm text-foreground-muted max-w-md">
                Curated calendar, or drop a GPX from Strava / Komoot / Garmin.
              </p>
            </div>

            {/* Curated grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
              {coursesLoading
                ? Array.from({ length: 6 }).map((_, i) => <CourseSkeleton key={i} />)
                : cardCourses.map((c) => (
                    <CourseCard
                      key={c.slug}
                      data={c}
                      selected={!gpx && courseSlug === c.slug}
                      onSelect={() => {
                        setGpx(null);
                        setCourseSlug(c.slug);
                      }}
                    />
                  ))}
            </div>

            {/* GPX dropzone */}
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-px bg-white/8" />
                <span
                  className="text-[0.6rem] tracking-[0.25em] uppercase text-foreground-subtle"
                  style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                >
                  OR UPLOAD CUSTOM
                </span>
                <div className="flex-1 h-px bg-white/8" />
              </div>
              <GpxDropzone
                value={gpx}
                onChange={(g) => {
                  setGpx(g);
                  if (g) setCourseSlug("");
                }}
              />
            </div>
          </Container>
        </Section>

        {/* LIVE PROFILE PREVIEW */}
        {previewData && (
          <Section background="charcoal" className="!py-10 md:!py-12">
            <Container>
              <div className="rounded-2xl border border-white/8 bg-gradient-to-br from-deep-purple/40 via-charcoal to-charcoal p-5 md:p-6">
                <div className="flex items-end justify-between flex-wrap gap-3 mb-4">
                  <div>
                    <p
                      className="text-[0.62rem] tracking-[0.22em] uppercase text-coral"
                      style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                    >
                      INTERACTIVE PROFILE · HOVER TO SCRUB
                    </p>
                    <p className="font-heading text-2xl uppercase tracking-tight text-off-white mt-1">
                      {previewData.name}
                    </p>
                  </div>
                  <div
                    className="grid grid-cols-3 gap-4 text-right text-xs"
                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                  >
                    <Stat label="DIST" value={`${previewData.distanceKm.toFixed(0)} km`} />
                    <Stat label="GAIN" value={`${previewData.elevationGainM.toLocaleString()} m`} />
                    <Stat label="CLIMBS" value={`${previewData.course.climbs.length}`} />
                  </div>
                </div>
                <ElevationProfile course={previewData.course} height={280} />
              </div>
            </Container>
          </Section>
        )}

        {/* RIDER SETUP */}
        <Section background="charcoal" className="!py-10 md:!py-12">
          <Container>
            <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
              {/* LEFT: Setup */}
              <div>
                <div className="mb-6">
                  <p
                    className="text-[0.65rem] tracking-[0.22em] uppercase text-coral mb-2"
                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                  >
                    STEP 02 · YOUR SETUP
                  </p>
                  <h2 className="font-heading text-3xl md:text-4xl uppercase tracking-tight text-off-white">
                    Tell us about you
                  </h2>
                </div>

                {/* AI shortcut */}
                <div className="rounded-xl border border-white/8 bg-gradient-to-br from-purple/10 via-deep-purple/30 to-charcoal p-5 mb-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-coral/15 border border-coral/30 flex items-center justify-center">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#F16363" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2 v 4 M12 18 v 4 M4 12 h 4 M16 12 h 4" />
                        <path d="M6 6 l 2 2 M16 16 l 2 2 M6 18 l 2 -2 M16 8 l 2 -2" />
                      </svg>
                    </div>
                    <p
                      className="text-[0.62rem] tracking-[0.22em] uppercase text-coral"
                      style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                    >
                      AI BIKE & RIDER SHORTCUT
                    </p>
                  </div>
                  <p className="text-sm text-foreground-muted mb-3">
                    One sentence. Bike, tyres, position, weight. We extract CdA,
                    Crr, position — pre-fill the form below for you to tweak.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={aiText}
                      onChange={(e) => setAiText(e.target.value)}
                      placeholder='e.g. "Canyon Aeroad CFR, GP5000 28mm, on the hoods, 76 kg"'
                      className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-off-white placeholder:text-foreground-subtle focus:border-coral focus:outline-none text-sm"
                      maxLength={500}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") runTranslator();
                      }}
                    />
                    <Button
                      onClick={runTranslator}
                      disabled={aiLoading || !aiText.trim()}
                      variant="outline"
                      size="md"
                    >
                      {aiLoading ? "Reading…" : "Translate →"}
                    </Button>
                  </div>
                  {aiError && (
                    <p
                      className="text-coral text-xs mt-2"
                      style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                    >
                      {aiError}
                    </p>
                  )}
                  {aiResult && (
                    <div className="mt-3 p-3 rounded-lg bg-charcoal/60 border border-coral/30 text-sm">
                      <div
                        className="flex items-center gap-3 mb-1.5"
                        style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                      >
                        <span className="text-coral text-[0.62rem] tracking-[0.18em] uppercase">
                          PARSED · {(aiResult.confidence * 100).toFixed(0)}% CONFIDENCE
                        </span>
                      </div>
                      <p className="text-off-white/80 text-sm">{aiResult.reasoning}</p>
                      {aiResult.missing.length > 0 && (
                        <p className="text-foreground-subtle text-xs mt-2">
                          Couldn&apos;t extract: {aiResult.missing.join(", ")}. Adjust below.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Position picker */}
                <div className="rounded-xl border border-white/8 bg-white/[0.02] p-5 mb-5">
                  <div className="flex items-baseline justify-between mb-3">
                    <p
                      className="text-[0.62rem] tracking-[0.22em] uppercase text-foreground-muted"
                      style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                    >
                      RIDING POSITION
                    </p>
                    <p className="text-[0.62rem] text-foreground-subtle">
                      Drives CdA preset
                    </p>
                  </div>
                  <PositionPicker value={position} onChange={setPosition} />
                </div>

                {/* Numeric inputs */}
                <div className="rounded-xl border border-white/8 bg-white/[0.02] p-5">
                  <p
                    className="text-[0.62rem] tracking-[0.22em] uppercase text-foreground-muted mb-3"
                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                  >
                    POWER & MASS
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <NumberField
                      label="FTP"
                      unit="W"
                      value={ftp}
                      step={5}
                      min={50}
                      max={500}
                      onChange={setFtp}
                      error={fieldErrors.ftp}
                    />
                    <NumberField
                      label="Body mass"
                      unit="kg"
                      value={bodyMass}
                      step={0.5}
                      min={40}
                      max={150}
                      onChange={setBodyMass}
                      error={fieldErrors.bodyMass}
                    />
                    <NumberField
                      label="Bike mass"
                      unit="kg"
                      value={bikeMass}
                      step={0.1}
                      min={5}
                      max={30}
                      onChange={setBikeMass}
                      error={fieldErrors.bikeMass}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAdvanced((v) => !v)}
                    className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-foreground-muted hover:text-coral transition-colors"
                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                  >
                    <span>{showAdvanced ? "Hide" : "Show"} conditions</span>
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className={`transition-transform ${showAdvanced ? "rotate-180" : ""}`}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>

                  {showAdvanced && (
                    <div className="grid grid-cols-2 gap-3 mt-3 pt-4 border-t border-white/5">
                      <NumberField
                        label="Air temp"
                        unit="°C"
                        value={airTempC}
                        step={1}
                        min={-10}
                        max={45}
                        onChange={setAirTempC}
                      />
                      <NumberField
                        label="Headwind"
                        unit="m/s"
                        value={windSpeedMs}
                        step={0.5}
                        min={0}
                        max={20}
                        onChange={setWindSpeedMs}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT: live preview */}
              <div>
                <div className="lg:sticky lg:top-28 space-y-4">
                  {previewData ? (
                    <WhatIfSliders
                      ftp={ftp}
                      bodyMass={bodyMass}
                      bikeMass={bikeMass}
                      windSpeed={windSpeedMs}
                      onFtp={setFtp}
                      onBodyMass={setBodyMass}
                      onBikeMass={setBikeMass}
                      onWindSpeed={setWindSpeedMs}
                      distanceKm={previewData.distanceKm}
                      elevationGainM={previewData.elevationGainM}
                    />
                  ) : (
                    <div className="rounded-xl border border-white/8 bg-white/[0.02] p-6 text-center">
                      <p className="text-sm text-foreground-muted">
                        Pick a course above to see a live what-if estimate.
                      </p>
                    </div>
                  )}

                  {submitError && (
                    <div
                      role="alert"
                      className="rounded-lg border border-coral/40 bg-coral/8 p-3"
                    >
                      <p
                        className="text-coral text-sm leading-snug"
                        style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                      >
                        {submitError}
                      </p>
                      <button
                        type="button"
                        onClick={() => setSubmitError(null)}
                        className="mt-2 text-[0.62rem] tracking-[0.18em] uppercase text-coral hover:text-coral-hover transition-colors"
                        style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                      >
                        Dismiss & retry
                      </button>
                    </div>
                  )}

                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || (!gpx && !courseSlug) || formInvalid}
                    size="lg"
                    className="w-full"
                    dataTrack="predict_run_prediction"
                  >
                    {submitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-1"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                          <path d="M12 2 a 10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
                        </svg>
                        Solving power balance…
                      </>
                    ) : (
                      <>Run prediction →</>
                    )}
                  </Button>

                  <p className="text-[0.6rem] tracking-[0.18em] uppercase text-foreground-subtle text-center" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                    Free first insight · No signup
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}

function CourseSkeleton() {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.015] overflow-hidden h-[222px]">
      <div className="h-[80px] bg-gradient-to-b from-deep-purple/20 to-charcoal/0 animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-white/5 rounded animate-pulse w-1/3" />
        <div className="h-5 bg-white/8 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-white/5 rounded animate-pulse w-1/2" />
      </div>
    </div>
  );
}

interface NumberFieldProps {
  label: string;
  unit: string;
  value: number;
  step: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  error?: string;
}

function NumberField({ label, unit, value, step, min, max, onChange, error }: NumberFieldProps) {
  const id = `num-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div>
      <label
        htmlFor={id}
        className="text-[0.62rem] tracking-[0.18em] uppercase text-foreground-muted mb-1.5 block"
        style={{ fontFamily: "var(--font-jetbrains-mono)" }}
      >
        {label} <span className="text-foreground-subtle">/ {unit}</span>
      </label>
      <input
        id={id}
        type="number"
        step={step}
        min={min}
        max={max}
        value={Number.isFinite(value) ? value : ""}
        onChange={(e) => {
          const v = Number(e.target.value);
          onChange(Number.isFinite(v) ? v : NaN);
        }}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full px-3 py-2.5 rounded-lg bg-white/5 border text-off-white text-base focus:outline-none tabular-nums transition-colors ${
          error
            ? "border-coral/70 focus:border-coral"
            : "border-white/10 focus:border-coral"
        }`}
      />
      {error && (
        <p
          id={`${id}-error`}
          className="text-coral text-[0.65rem] tracking-[0.05em] mt-1"
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.55rem] tracking-[0.2em] uppercase text-foreground-subtle">
        {label}
      </p>
      <p className="text-off-white text-sm mt-0.5">{value}</p>
    </div>
  );
}
