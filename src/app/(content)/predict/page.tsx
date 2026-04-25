"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";

type Mode = "can_i_make_it" | "plan_my_race";
type Position =
  | "tt_bars"
  | "aero_drops"
  | "aero_hoods"
  | "endurance_hoods"
  | "standard_hoods"
  | "climbing";

interface CourseSummary {
  slug: string;
  name: string;
  country: string | null;
  region: string | null;
  distanceKm: number;
  elevationGainM: number;
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
  { value: "aero_drops", label: "Aero road, drops" },
  { value: "aero_hoods", label: "Aero road, hoods" },
  { value: "endurance_hoods", label: "Endurance, hoods" },
  { value: "standard_hoods", label: "Standard road, hoods" },
  { value: "climbing", label: "Climbing position" },
];

export default function PredictPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("plan_my_race");
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [courseSlug, setCourseSlug] = useState<string>("");

  const [bodyMass, setBodyMass] = useState<string>("75");
  const [bikeMass, setBikeMass] = useState<string>("8");
  const [position, setPosition] = useState<Position>("aero_hoods");
  const [ftp, setFtp] = useState<string>("260");

  const [airTempC, setAirTempC] = useState<string>("18");
  const [windSpeedMs, setWindSpeedMs] = useState<string>("0");

  const [aiText, setAiText] = useState<string>("");
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<TranslatorResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.courses)) setCourses(data.courses);
        if (Array.isArray(data?.courses) && data.courses.length > 0) {
          setCourseSlug(data.courses[0].slug);
        }
      })
      .catch(() => {});
  }, []);

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
      setAiResult(data.params as TranslatorResult);
      // Apply AI suggestions to the form so the user can adjust before predict.
      const r = data.params as TranslatorResult;
      setBodyMass(String(r.bodyMass));
      setBikeMass(String(r.bikeMass));
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
      setSubmitError("Pick a course first.");
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
            bodyMass: Number(bodyMass),
            bikeMass: Number(bikeMass),
            position,
            powerProfile: { ftp: Number(ftp) },
            cda: aiResult?.cda,
            crr: aiResult?.crr,
          },
          environment: {
            airTemperatureC: Number(airTempC),
            windSpeedMs: Number(windSpeedMs),
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
    <>
      <Header />
      <main>
        <Section background="deep-purple" grain className="pt-32 pb-10">
          <Container width="narrow" className="text-center">
            <h1 className="font-display text-4xl uppercase tracking-wide text-off-white mb-3">
              Race Predictor
            </h1>
            <p className="text-off-white/80 text-lg max-w-2xl mx-auto">
              Physics-grade time prediction for your event. Free first insight.
              Full pacing plan, fuelling, and equipment scenarios in the $29
              Race Report.
            </p>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-10">
          <Container width="narrow">
            <div className="bg-white/[0.03] border border-white/5 rounded-lg p-6 mb-8">
              <div className="flex gap-2 mb-6 flex-wrap">
                <button
                  type="button"
                  onClick={() => setMode("plan_my_race")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    mode === "plan_my_race"
                      ? "bg-coral text-charcoal"
                      : "bg-charcoal text-off-white/70 hover:text-off-white"
                  }`}
                >
                  Plan My Race · 24–48 h out
                </button>
                <button
                  type="button"
                  onClick={() => setMode("can_i_make_it")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    mode === "can_i_make_it"
                      ? "bg-coral text-charcoal"
                      : "bg-charcoal text-off-white/70 hover:text-off-white"
                  }`}
                >
                  Can I Make It? · 6+ months out
                </button>
              </div>
              <p className="text-sm text-off-white/60">
                {mode === "plan_my_race"
                  ? "Optimised pacing for your A-race: variable-power plan, weather-aware, durability-aware."
                  : "Honest gap analysis: what you'd ride today at sustainable effort, surfacing where the work needs doing."}
              </p>
            </div>

            <div className="bg-white/[0.03] border border-white/5 rounded-lg p-6 mb-6">
              <h2 className="font-display text-xl uppercase tracking-wide text-off-white mb-4">
                1 · Course
              </h2>
              <label className="text-sm text-off-white/70 block mb-2">
                Curated event
              </label>
              <select
                value={courseSlug}
                onChange={(e) => setCourseSlug(e.target.value)}
                className="w-full bg-white/5 text-off-white border border-white/10 rounded px-3 py-2"
              >
                {courses.length === 0 && <option value="">Loading…</option>}
                {courses.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name} · {c.distanceKm.toFixed(0)} km · {c.elevationGainM} m
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-white/[0.03] border border-white/5 rounded-lg p-6 mb-6">
              <h2 className="font-display text-xl uppercase tracking-wide text-off-white mb-4">
                2 · Setup (AI shortcut)
              </h2>
              <p className="text-sm text-off-white/70 mb-3">
                Describe your bike, position, tyres, and weight in one sentence.
                We'll fill the rest.
              </p>
              <textarea
                value={aiText}
                onChange={(e) => setAiText(e.target.value)}
                placeholder='e.g. "Canyon Aeroad CFR, Continental GP5000 28mm, hoods, 76 kg lean rider"'
                className="w-full bg-white/5 text-off-white border border-white/10 rounded p-3 text-sm h-20"
                maxLength={500}
              />
              <div className="flex items-center gap-3 mt-3">
                <Button
                  onClick={runTranslator}
                  disabled={aiLoading || !aiText.trim()}
                  variant="secondary"
                  size="sm"
                >
                  {aiLoading ? "Reading…" : "Translate"}
                </Button>
                {aiError && <span className="text-coral text-sm">{aiError}</span>}
              </div>
              {aiResult && (
                <div className="mt-4 p-3 bg-charcoal/60 rounded border border-coral/30 text-sm text-off-white/80">
                  <p className="mb-1">
                    <strong className="text-off-white">Confidence:</strong>{" "}
                    {(aiResult.confidence * 100).toFixed(0)}%
                  </p>
                  <p>{aiResult.reasoning}</p>
                  {aiResult.missing.length > 0 && (
                    <p className="mt-1 text-off-white/60">
                      Couldn't extract: {aiResult.missing.join(", ")}. Edit the
                      form below if needed.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white/[0.03] border border-white/5 rounded-lg p-6 mb-6">
              <h2 className="font-display text-xl uppercase tracking-wide text-off-white mb-4">
                3 · Rider
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-off-white/70 block mb-1">
                    Body mass (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="40"
                    max="130"
                    value={bodyMass}
                    onChange={(e) => setBodyMass(e.target.value)}
                    className="w-full bg-white/5 text-off-white border border-white/10 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm text-off-white/70 block mb-1">
                    Bike mass (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="5"
                    max="25"
                    value={bikeMass}
                    onChange={(e) => setBikeMass(e.target.value)}
                    className="w-full bg-white/5 text-off-white border border-white/10 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm text-off-white/70 block mb-1">
                    FTP (W)
                  </label>
                  <input
                    type="number"
                    step="5"
                    min="100"
                    max="500"
                    value={ftp}
                    onChange={(e) => setFtp(e.target.value)}
                    className="w-full bg-white/5 text-off-white border border-white/10 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm text-off-white/70 block mb-1">
                    Position
                  </label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value as Position)}
                    className="w-full bg-white/5 text-off-white border border-white/10 rounded px-3 py-2"
                  >
                    {POSITIONS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/5 rounded-lg p-6 mb-6">
              <h2 className="font-display text-xl uppercase tracking-wide text-off-white mb-4">
                4 · Conditions
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-off-white/70 block mb-1">
                    Air temp (°C)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={airTempC}
                    onChange={(e) => setAirTempC(e.target.value)}
                    className="w-full bg-white/5 text-off-white border border-white/10 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm text-off-white/70 block mb-1">
                    Wind speed (m/s)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="20"
                    value={windSpeedMs}
                    onChange={(e) => setWindSpeedMs(e.target.value)}
                    className="w-full bg-white/5 text-off-white border border-white/10 rounded px-3 py-2"
                  />
                </div>
              </div>
            </div>

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
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
