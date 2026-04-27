"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import {
  PositionPicker,
  GpxDropzone,
  type GpxUploadResult,
  WhatIfSliders,
  ElevationProfile,
  CourseElevationMini,
} from "@/components/features/predict";
import {
  RACES,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
  type Race,
} from "@/data/races";
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

const COUNTRY_OPTIONS = [
  { value: "", label: "All countries" },
  ...Array.from(new Set(RACES.map((r) => r.country)))
    .sort()
    .map((c) => ({ value: c, label: c })),
];

const DIFFICULTY_OPTIONS = [
  { value: "", label: "All levels" },
  { value: "1", label: "Accessible (1)" },
  { value: "2", label: "Moderate (2)" },
  { value: "3", label: "Challenging (3)" },
  { value: "4", label: "Hard (4)" },
  { value: "5", label: "Extreme (5)" },
];

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

  // Race grid filters
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [difficulty, setDifficulty] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setCoursesLoading(true);
    fetch("/api/courses")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.courses)) {
          setCourses(data.courses);
        }
      })
      .catch(() => {})
      .finally(() => setCoursesLoading(false));
  }, []);

  // Lookup the predictor course for a given race slug. Races with no
  // matching course are still shown but only link to the race guide.
  const coursesBySlug = useMemo(() => {
    const m = new Map<string, CourseAPIItem>();
    for (const c of courses) m.set(c.slug, c);
    return m;
  }, [courses]);

  // Pre-select the first predictable race once courses have loaded so the
  // live preview/what-if panel has something to render.
  useEffect(() => {
    if (coursesLoading) return;
    if (courseSlug || gpx) return;
    const firstPredictable = RACES.find(
      (r) => r.predictor_slug && coursesBySlug.has(r.predictor_slug),
    );
    if (firstPredictable?.predictor_slug) {
      setCourseSlug(firstPredictable.predictor_slug);
    }
  }, [coursesLoading, coursesBySlug, courseSlug, gpx]);

  const filteredRaces = useMemo(() => {
    const q = search.trim().toLowerCase();
    return RACES.filter((r) => {
      if (difficulty && String(r.difficulty) !== difficulty) return false;
      if (country && r.country !== country) return false;
      if (q) {
        return (
          r.name.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q) ||
          r.country.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [search, country, difficulty]);

  const selectedCourse = useMemo(
    () => courses.find((c) => c.slug === courseSlug) ?? null,
    [courses, courseSlug],
  );

  // Build a Course-shaped object for the elevation preview from either a
  // selected curated course or an uploaded GPX.
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
      setSubmitError("Pick an event or upload your own GPX first.");
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

  const filtersActive = Boolean(search || country || difficulty);

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
                Enter your FTP and weight, pick your event or drop a GPX, and
                we&rsquo;ll simulate the ride on real elevation, real wind, and
                real rolling resistance — and hand you a finish time within
                ±3%. Free for the prediction. The $29 Race Report adds your
                full pacing plan, fuelling strategy, and equipment what-ifs.
              </p>

              <div
                className="mt-6 flex items-center gap-2 text-sm text-foreground-muted flex-wrap"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                <span className="block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>REAL ELEVATION · REAL WIND</span>
                <span className="text-foreground-subtle">·</span>
                <span>±3% TYPICAL ACCURACY</span>
              </div>
            </div>
          </Container>
        </Section>

        {/* STEP 01 — PICK YOUR EVENT */}
        <Section background="charcoal" className="!py-10 md:!py-14">
          <Container>
            <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
              <div>
                <p
                  className="text-[0.65rem] tracking-[0.22em] uppercase text-coral mb-2"
                  style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                >
                  STEP 01 · YOUR EVENT
                </p>
                <h2 className="font-heading text-3xl md:text-4xl uppercase tracking-tight text-off-white">
                  Pick your race
                </h2>
              </div>
              <p className="text-sm text-foreground-muted max-w-md">
                {RACES.length} sportives in the calendar — Étape, Marmotte,
                Mallorca 312, Wicklow 200 and more.
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-5">
              <input
                type="search"
                placeholder="Search by name, country, or tag…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 min-w-[180px] bg-white/[0.06] border border-white/10 text-off-white text-sm rounded-lg px-3 py-2 placeholder:text-foreground-subtle focus:outline-none focus:border-coral/60 transition-colors"
                aria-label="Search races"
              />
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="bg-white/[0.06] border border-white/10 text-off-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-coral/60 transition-colors"
                aria-label="Filter by country"
              >
                {COUNTRY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="bg-white/[0.06] border border-white/10 text-off-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-coral/60 transition-colors"
                aria-label="Filter by difficulty"
              >
                {DIFFICULTY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              {filtersActive && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCountry("");
                    setDifficulty("");
                  }}
                  className="text-sm text-foreground-muted hover:text-off-white transition-colors px-2"
                >
                  Clear filters
                </button>
              )}
            </div>

            <p className="text-foreground-muted text-xs mb-5">
              {filteredRaces.length} {filteredRaces.length === 1 ? "race" : "races"}
              {filtersActive ? " match the filters" : " in the calendar"} ·{" "}
              <span className="text-coral">Coral border</span> = you can run a
              prediction now
            </p>

            {/* Race grid */}
            {filteredRaces.length === 0 ? (
              <div className="text-center py-12 text-foreground-muted">
                No races match those filters. Try clearing them, or upload your
                own GPX below.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                {filteredRaces.map((race) => {
                  const matchedCourse = race.predictor_slug
                    ? coursesBySlug.get(race.predictor_slug)
                    : undefined;
                  const isSelected =
                    !gpx && race.predictor_slug === courseSlug && Boolean(matchedCourse);
                  return (
                    <RaceTile
                      key={race.slug}
                      race={race}
                      profile={matchedCourse?.profile}
                      selected={isSelected}
                      predictable={Boolean(matchedCourse)}
                      coursesLoading={coursesLoading}
                      onSelect={() => {
                        if (matchedCourse && race.predictor_slug) {
                          setGpx(null);
                          setCourseSlug(race.predictor_slug);
                        }
                      }}
                    />
                  );
                })}
              </div>
            )}

            {/* GPX alternative — secondary, below */}
            <div className="mt-10 pt-8 border-t border-white/8">
              <div className="flex items-end justify-between mb-4 flex-wrap gap-3">
                <div>
                  <p
                    className="text-[0.62rem] tracking-[0.22em] uppercase text-foreground-muted mb-1"
                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                  >
                    NOT IN THE CALENDAR?
                  </p>
                  <h3 className="font-heading text-xl uppercase tracking-tight text-off-white">
                    Upload your own GPX
                  </h3>
                </div>
                <p className="text-sm text-foreground-muted max-w-md">
                  Export the route from Strava, Komoot, Garmin or RideWithGPS,
                  then drop the .gpx file here.
                </p>
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
                      THIS IS THE COURSE · HOVER TO SCRUB
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

        {/* STEP 02 — RIDER SETUP */}
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
                    Tell us about you and your bike
                  </h2>
                </div>

                {/* Numeric inputs — moved above AI shortcut so the basics come first */}
                <div className="rounded-xl border border-white/8 bg-white/[0.02] p-5 mb-5">
                  <p
                    className="text-[0.62rem] tracking-[0.22em] uppercase text-foreground-muted mb-3"
                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                  >
                    POWER & WEIGHT
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <NumberField
                      label="FTP"
                      unit="W"
                      value={ftp}
                      step={5}
                      min={50}
                      max={500}
                      placeholder="260"
                      onChange={setFtp}
                      error={fieldErrors.ftp}
                    />
                    <NumberField
                      label="Body weight"
                      unit="kg"
                      value={bodyMass}
                      step={0.5}
                      min={40}
                      max={150}
                      placeholder="75"
                      onChange={setBodyMass}
                      error={fieldErrors.bodyMass}
                    />
                    <NumberField
                      label="Bike weight"
                      unit="kg"
                      value={bikeMass}
                      step={0.1}
                      min={5}
                      max={30}
                      placeholder="8"
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
                    <span>{showAdvanced ? "Hide" : "Show"} weather</span>
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
                        placeholder="18"
                        onChange={setAirTempC}
                      />
                      <NumberField
                        label="Headwind"
                        unit="m/s"
                        value={windSpeedMs}
                        step={0.5}
                        min={0}
                        max={20}
                        placeholder="0"
                        onChange={setWindSpeedMs}
                      />
                    </div>
                  )}
                </div>

                {/* Position picker */}
                <div className="rounded-xl border border-white/8 bg-white/[0.02] p-5 mb-5">
                  <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
                    <p
                      className="text-[0.62rem] tracking-[0.22em] uppercase text-foreground-muted"
                      style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                    >
                      RIDING POSITION
                    </p>
                    <p className="text-[0.62rem] text-foreground-subtle">
                      How aero you sit changes how fast you go
                    </p>
                  </div>
                  <PositionPicker value={position} onChange={setPosition} />
                </div>

                {/* AI shortcut — re-framed: clear what it does, what you get */}
                <div className="rounded-xl border border-white/8 bg-gradient-to-br from-purple/10 via-deep-purple/30 to-charcoal p-5">
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
                      OPTIONAL · DESCRIBE YOUR BIKE & SETUP
                    </p>
                  </div>
                  <p className="text-sm text-foreground-muted mb-3">
                    Tell us your bike, tyres and how you sit on it in plain
                    English. We&rsquo;ll fill in the aero and rolling-resistance
                    numbers for you — saves a few minutes versus picking a
                    riding position by hand.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={aiText}
                      onChange={(e) => setAiText(e.target.value)}
                      placeholder='e.g. "Canyon Aeroad, GP5000 28mm, on the hoods, 76 kg"'
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
                      {aiLoading ? "Reading…" : "Fill the form →"}
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
                          Couldn&apos;t pick up: {aiResult.missing.join(", ")}. Adjust below.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* STEP 03 — Mode toggle: when are you racing */}
                <div className="mt-6 rounded-xl border border-white/8 bg-white/[0.02] p-5">
                  <p
                    className="text-[0.62rem] tracking-[0.22em] uppercase text-coral mb-2"
                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                  >
                    STEP 03 · WHEN ARE YOU RACING?
                  </p>
                  <p className="text-sm text-foreground-muted mb-3">
                    Race week or still training? It changes how we model the
                    ride.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <ModeToggle
                      label="Race week"
                      sublabel="Optimised pacing — power targets, fuelling rate"
                      selected={mode === "plan_my_race"}
                      onSelect={() => setMode("plan_my_race")}
                    />
                    <ModeToggle
                      label="Still training"
                      sublabel="Honest baseline — what you'd ride today"
                      selected={mode === "can_i_make_it"}
                      onSelect={() => setMode("can_i_make_it")}
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT: live preview / submit */}
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
                        Pick a race above (or upload a GPX) to see your
                        rough finish time before you commit.
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
                        Running the simulation…
                      </>
                    ) : (
                      <>Predict my finish time →</>
                    )}
                  </Button>

                  <p className="text-[0.6rem] tracking-[0.18em] uppercase text-foreground-subtle text-center" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                    Free · No signup · Within ±3%
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

interface RaceTileProps {
  race: Race;
  profile?: number[][];
  selected: boolean;
  predictable: boolean;
  coursesLoading: boolean;
  onSelect: () => void;
}

function RaceTile({
  race,
  profile,
  selected,
  predictable,
  coursesLoading,
  onSelect,
}: RaceTileProps) {
  const inner = (
    <div className="relative h-full flex flex-col">
      {profile && profile.length > 1 ? (
        <div className="relative bg-gradient-to-b from-deep-purple/40 to-charcoal/0 px-5 pt-5 pb-3">
          <CourseElevationMini
            profile={profile}
            width={300}
            height={56}
            className="w-full"
            ariaLabel={`Elevation profile of ${race.name}`}
          />
        </div>
      ) : (
        <div className="h-[68px] bg-gradient-to-b from-deep-purple/30 to-charcoal/0" />
      )}

      <div className="px-5 pb-5 pt-2 flex-1 flex flex-col">
        {/* Country + difficulty row */}
        <div className="flex items-center justify-between mb-2">
          <span
            className="inline-flex items-center gap-1.5 text-[0.65rem] tracking-[0.18em] uppercase text-off-white/70"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            <span className="block w-1.5 h-1.5 rounded-full bg-coral" />
            {race.country}
          </span>
          <DifficultyDots level={race.difficulty} />
        </div>

        <h3 className="font-heading text-[1.4rem] leading-tight text-off-white uppercase tracking-tight mb-1 group-hover:text-coral transition-colors">
          {race.name}
        </h3>
        <p className="text-foreground-muted text-xs mb-3">{race.location}</p>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <Stat label="Distance" value={`${race.distance_km}km`} />
          <Stat label="Climb" value={`${race.elevation_m.toLocaleString()}m`} />
          <Stat
            label="Difficulty"
            value={DIFFICULTY_LABELS[race.difficulty]}
            valueClass={DIFFICULTY_COLORS[race.difficulty]}
          />
        </div>

        <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-xs">
          <span className="text-foreground-subtle">
            {race.month ?? "Year-round"}
          </span>
          <span
            className={
              predictable
                ? "text-coral"
                : "text-foreground-subtle italic"
            }
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            {predictable
              ? selected
                ? "SELECTED"
                : "PREDICT →"
              : coursesLoading
                ? "LOADING…"
                : "RACE GUIDE →"}
          </span>
        </div>
      </div>

      {selected && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-coral text-charcoal flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
      )}
    </div>
  );

  const baseClass = `group relative block w-full text-left rounded-xl overflow-hidden border transition-all duration-300 ${
    selected
      ? "border-coral bg-gradient-to-br from-coral/8 via-deep-purple/30 to-charcoal shadow-[0_0_0_1px_rgba(241,99,99,0.5),0_8px_40px_-8px_rgba(241,99,99,0.4)]"
      : predictable
        ? "border-coral/40 bg-background-elevated hover:border-coral/70 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
        : "border-white/8 bg-background-elevated hover:border-white/20"
  }`;

  if (predictable) {
    return (
      <button type="button" onClick={onSelect} className={baseClass}>
        {inner}
      </button>
    );
  }
  return (
    <Link href={`/races/${race.slug}`} className={baseClass}>
      {inner}
    </Link>
  );
}

function DifficultyDots({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Difficulty ${level} of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`inline-block w-1.5 h-1.5 rounded-full ${
            i < level ? "bg-coral" : "bg-white/15"
          }`}
        />
      ))}
    </div>
  );
}

interface ModeToggleProps {
  label: string;
  sublabel: string;
  selected: boolean;
  onSelect: () => void;
}

function ModeToggle({ label, sublabel, selected, onSelect }: ModeToggleProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`text-left rounded-lg border px-4 py-3 transition-all ${
        selected
          ? "border-coral bg-coral/8"
          : "border-white/10 bg-white/[0.02] hover:border-white/25"
      }`}
    >
      <p
        className={`font-heading text-base uppercase tracking-tight mb-0.5 ${
          selected ? "text-coral" : "text-off-white"
        }`}
      >
        {label}
      </p>
      <p className="text-xs text-foreground-muted leading-snug">{sublabel}</p>
    </button>
  );
}

interface NumberFieldProps {
  label: string;
  unit: string;
  value: number;
  step: number;
  min: number;
  max: number;
  placeholder?: string;
  onChange: (v: number) => void;
  error?: string;
}

function NumberField({
  label,
  unit,
  value,
  step,
  min,
  max,
  placeholder,
  onChange,
  error,
}: NumberFieldProps) {
  const id = `num-${label.replace(/\s+/g, "-").toLowerCase()}`;

  // Internal string state lets the input be momentarily empty (for typing /
  // editing) without forcing a 0 into parent state. Sync down whenever the
  // parent value changes externally — e.g. when the AI translator pre-fills
  // body mass — so the visible input matches the underlying number.
  const [text, setText] = useState<string>(
    Number.isFinite(value) ? String(value) : "",
  );

  useEffect(() => {
    if (!Number.isFinite(value)) {
      setText("");
      return;
    }
    if (Number(text) !== value) {
      setText(String(value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

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
        inputMode="decimal"
        step={step}
        min={min}
        max={max}
        value={text}
        placeholder={placeholder}
        onFocus={(e) => e.target.select()}
        onChange={(e) => {
          const next = e.target.value;
          setText(next);
          if (next === "") {
            onChange(NaN);
            return;
          }
          const n = Number(next);
          if (Number.isFinite(n)) onChange(n);
        }}
        onBlur={() => {
          if (text === "") return;
          const n = Number(text);
          if (Number.isFinite(n)) {
            // Strip leading zeros / normalise scientific notation on blur.
            setText(String(n));
          }
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

function Stat({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div>
      <p className="text-[0.55rem] tracking-[0.2em] uppercase text-foreground-subtle">
        {label}
      </p>
      <p
        className={`font-heading text-base text-off-white mt-0.5 leading-none ${valueClass ?? ""}`}
      >
        {value}
      </p>
    </div>
  );
}
