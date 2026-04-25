import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer, Section, Container } from "@/components/layout";
import {
  getPredictionBySlug,
  getCourseById,
} from "@/lib/race-predictor/store";
import { simulateCourse } from "@/lib/race-predictor/engine";
import type { CourseResult } from "@/lib/race-predictor/types";
import { UpgradeForm } from "./upgrade-form";
import { InteractiveElevation } from "./_components/InteractiveElevation";
import { ClimbBreakdown } from "./_components/ClimbBreakdown";
import { WhatIfSliders } from "./_components/WhatIfSliders";
import { SharePoster } from "./_components/SharePoster";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m`;
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ??
    "https://roadmancycling.com"
  );
}

export default async function PredictResultPage({ params }: PageProps) {
  const { slug } = await params;
  const prediction = await getPredictionBySlug(slug);
  if (!prediction) notFound();

  const course = prediction.courseId
    ? await getCourseById(prediction.courseId)
    : null;
  const courseName = course?.name ?? "Your uploaded course";
  const region = course?.region ?? null;
  const country = course?.country ?? null;

  // Resolve the course geometry. Curated courses store it under courseId;
  // user-uploaded courses store it inline on the prediction.
  const resolvedCourse =
    prediction.courseData ?? course?.courseData ?? null;
  const distanceKm = resolvedCourse
    ? resolvedCourse.totalDistance / 1000
    : (course?.distanceM ?? 0) / 1000;
  const elevationGainM = resolvedCourse
    ? Math.round(resolvedCourse.totalElevationGain)
    : course?.elevationGainM ?? 0;
  const climbCount = resolvedCourse?.climbs.length ?? 0;

  const insight =
    (prediction.resultSummary?.insight as
      | { headline: string; body: string; tag?: string }
      | undefined) ?? null;

  const baselinePower =
    prediction.averagePower ??
    prediction.normalizedPower ??
    Math.round(prediction.riderInputs.powerProfile?.p60min ?? 220);

  const avgSpeedKmh =
    distanceKm > 0
      ? Math.round((distanceKm / (prediction.predictedTimeS / 3600)) * 10) / 10
      : 0;

  // Re-run the engine to recover per-segment results for the interactive
  // chart and climb breakdown. Pure compute — < 50ms typical.
  let segmentResult: CourseResult | null = null;
  if (resolvedCourse && resolvedCourse.segments.length > 0) {
    const pacing =
      prediction.pacingPlan &&
      prediction.pacingPlan.length === resolvedCourse.segments.length
        ? prediction.pacingPlan
        : new Array(resolvedCourse.segments.length).fill(baselinePower);
    try {
      segmentResult = simulateCourse({
        course: resolvedCourse,
        rider: prediction.riderInputs,
        environment: prediction.environmentInputs,
        pacing,
      });
    } catch {
      segmentResult = null;
    }
  }

  const toleranceMinutes = Math.round(
    (prediction.confidenceHighS - prediction.confidenceLowS) / 2 / 60,
  );
  const shareUrl = `${siteUrl()}/predict/${prediction.slug}`;

  return (
    <>
      <Header />
      <main id="main-content">
        {/* HERO + finish card */}
        <Section
          background="deep-purple"
          grain
          className="!pt-32 !pb-12 section-glow-coral"
        >
          <Container width="narrow" className="relative">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <p className="text-coral text-xs uppercase tracking-[0.3em]">
                Race Predictor · prediction
              </p>
              <Link
                href="/predict"
                className="text-off-white/40 text-xs uppercase tracking-wider hover:text-off-white/70 transition"
              >
                Run another →
              </Link>
            </div>
            <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tight text-off-white leading-[0.95] mb-3">
              {courseName}
            </h1>
            <p className="text-off-white/70 text-sm mb-8">
              {distanceKm.toFixed(1)} km · {elevationGainM.toLocaleString()} m
              elevation · {climbCount} climb{climbCount === 1 ? "" : "s"}
              {region && ` · ${region}`}
              {country && `, ${country}`}
            </p>

            {/* Hero finish card */}
            <div className="relative overflow-hidden rounded-2xl border border-coral/30 bg-gradient-to-br from-purple/40 via-deep-purple to-deep-purple p-6 md:p-8">
              <span
                aria-hidden
                className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full bg-coral/15 blur-3xl"
              />
              <div className="relative grid md:grid-cols-[1fr_auto] gap-6 items-end">
                <div>
                  <p className="text-coral text-xs uppercase tracking-[0.3em] mb-2">
                    Predicted finish
                  </p>
                  <p className="font-display text-6xl md:text-8xl text-off-white leading-[0.9] tracking-tight stat-glow">
                    {formatDuration(prediction.predictedTimeS)}
                  </p>
                  <p className="text-coral/95 text-sm font-medium mt-3 uppercase tracking-wider">
                    ± {toleranceMinutes} min · {confidenceLabel(prediction.predictedTimeS, prediction.confidenceLowS, prediction.confidenceHighS)}
                  </p>
                </div>
                <div className="grid grid-cols-3 md:flex md:flex-col gap-3 md:gap-2 text-center md:text-right">
                  <MiniStat label="Avg km/h" value={String(avgSpeedKmh)} />
                  <MiniStat
                    label="Avg W"
                    value={prediction.averagePower ? String(prediction.averagePower) : "—"}
                  />
                  <MiniStat
                    label="NP W"
                    value={prediction.normalizedPower ? String(prediction.normalizedPower) : "—"}
                  />
                </div>
              </div>
            </div>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-10">
          <Container width="narrow" className="space-y-10">
            {/* Free key insight */}
            {insight && (
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-coral/[0.10] via-purple/[0.06] to-transparent border-l-4 border-coral p-6">
                <p className="text-coral text-xs uppercase tracking-[0.3em] mb-2">
                  Key insight · free
                </p>
                <p className="font-display text-2xl md:text-3xl text-off-white uppercase tracking-tight leading-[1.05] mb-3">
                  {insight.headline}
                </p>
                <p className="text-off-white/80 text-base leading-relaxed">
                  {insight.body}
                </p>
              </div>
            )}

            {/* Interactive elevation profile */}
            {resolvedCourse && (
              <section>
                <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
                  <div>
                    <p className="text-coral text-xs uppercase tracking-[0.3em] mb-1">
                      Course profile
                    </p>
                    <h2 className="font-display text-2xl text-off-white uppercase tracking-wide">
                      Where the day is won
                    </h2>
                  </div>
                  <p className="text-off-white/45 text-[11px] uppercase tracking-wider">
                    Drag to scrub · per-segment power
                  </p>
                </div>
                <div className="rounded-xl bg-white/[0.025] border border-white/[0.06] p-4 md:p-5">
                  <InteractiveElevation
                    course={resolvedCourse}
                    segmentResults={segmentResult?.segmentResults}
                    pacingPlan={prediction.pacingPlan}
                  />
                </div>
              </section>
            )}

            {/* What-if sliders */}
            <section className="rounded-xl bg-white/[0.025] border border-white/[0.06] p-5 md:p-6">
              <WhatIfSliders
                slug={prediction.slug}
                baselineFtpW={Math.round(
                  prediction.riderInputs.powerProfile.p60min,
                )}
                baselineBodyMassKg={prediction.riderInputs.bodyMass}
                baselineWindMs={prediction.environmentInputs.windSpeed}
                baselineTempC={prediction.environmentInputs.airTemperature}
                baselinePredictedTimeS={prediction.predictedTimeS}
              />
            </section>

            {/* Climb breakdown */}
            {resolvedCourse && resolvedCourse.climbs.length > 0 && (
              <section>
                <div className="mb-4">
                  <p className="text-coral text-xs uppercase tracking-[0.3em] mb-1">
                    Climbs
                  </p>
                  <h2 className="font-display text-2xl text-off-white uppercase tracking-wide">
                    Climb-by-climb
                  </h2>
                </div>
                <ClimbBreakdown
                  course={resolvedCourse}
                  segmentResults={segmentResult?.segmentResults}
                />
              </section>
            )}

            {/* Stats grid */}
            <section>
              <div className="mb-4">
                <p className="text-coral text-xs uppercase tracking-[0.3em] mb-1">
                  Effort metrics
                </p>
                <h2 className="font-display text-2xl text-off-white uppercase tracking-wide">
                  Under the hood
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Stat
                  label="Avg power"
                  value={
                    prediction.averagePower
                      ? `${prediction.averagePower} W`
                      : "—"
                  }
                />
                <Stat
                  label="Norm power"
                  value={
                    prediction.normalizedPower
                      ? `${prediction.normalizedPower} W`
                      : "—"
                  }
                />
                <Stat
                  label="Variability index"
                  value={
                    prediction.variabilityIndex
                      ? prediction.variabilityIndex.toFixed(2)
                      : "—"
                  }
                />
                <Stat
                  label="Mode"
                  value={
                    prediction.mode === "can_i_make_it"
                      ? "Gap analysis"
                      : "Race plan"
                  }
                />
              </div>
            </section>

            {/* Share + upgrade — two columns on desktop */}
            <section className="grid lg:grid-cols-2 gap-5">
              <div className="rounded-xl bg-white/[0.025] border border-white/[0.06] p-5">
                <p className="text-coral text-xs uppercase tracking-[0.3em] mb-1">
                  Share your time
                </p>
                <h2 className="font-display text-xl text-off-white uppercase tracking-wide mb-4">
                  Poster · download or share
                </h2>
                <SharePoster
                  courseName={courseName}
                  predictedTimeS={prediction.predictedTimeS}
                  toleranceMinutes={toleranceMinutes}
                  distanceKm={distanceKm}
                  elevationGainM={elevationGainM}
                  averagePowerW={prediction.averagePower ?? null}
                  averageSpeedKmh={avgSpeedKmh}
                  shareUrl={shareUrl}
                />
              </div>

              <div className="flex flex-col gap-3">
                {prediction.isPaid ? (
                  <div className="flex-1 rounded-xl bg-gradient-to-br from-coral/[0.12] via-purple/[0.10] to-transparent border border-coral/40 p-6 text-off-white/90">
                    <p className="font-display text-2xl text-coral uppercase tracking-wide mb-3">
                      Race report delivered
                    </p>
                    <p className="text-off-white/85 mb-4 leading-relaxed">
                      Your full Race Report is in your inbox. Check your email
                      for the secure link.
                    </p>
                    <Link
                      href="/community"
                      className="inline-flex items-center gap-2 text-coral text-sm uppercase tracking-wider hover:text-coral-hover transition"
                    >
                      Train with the community →
                    </Link>
                  </div>
                ) : (
                  <div className="flex-1 rounded-xl bg-gradient-to-br from-coral/[0.12] via-purple/[0.10] to-transparent border border-coral/40 p-6">
                    <p className="text-coral text-[11px] uppercase tracking-[0.3em] mb-2">
                      Unlock · $29
                    </p>
                    <p className="font-display text-2xl text-off-white uppercase tracking-tight mb-4 leading-tight">
                      The full Race Report
                    </p>
                    <ul className="text-off-white/85 text-sm space-y-2 mb-5">
                      <UpgradeBullet>
                        Per-km pacing plan with weather-aware power targets
                      </UpgradeBullet>
                      <UpgradeBullet>
                        Climb-by-climb power and time budget
                      </UpgradeBullet>
                      <UpgradeBullet>
                        Fuelling rates dialled to your effort
                      </UpgradeBullet>
                      <UpgradeBullet>
                        Equipment scenarios (CdA / mass / Crr trade-offs)
                      </UpgradeBullet>
                      <UpgradeBullet>
                        Delivered as a PDF + secure web link in &lt; 1 min
                      </UpgradeBullet>
                    </ul>
                    <UpgradeForm slug={prediction.slug} />
                  </div>
                )}
                <Link
                  href="/predict"
                  className="text-center text-off-white/45 text-xs uppercase tracking-wider hover:text-off-white/70 transition"
                >
                  Run another prediction
                </Link>
              </div>
            </section>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-off-white/55 text-[10px] uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <p className="font-display text-2xl md:text-3xl text-off-white leading-none">
        {value}
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4 hover:border-coral/30 transition">
      <p className="text-off-white/55 text-[11px] uppercase tracking-wider mb-1.5">
        {label}
      </p>
      <p className="font-display text-2xl text-off-white leading-none">
        {value}
      </p>
    </div>
  );
}

function UpgradeBullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5 items-start">
      <span
        aria-hidden
        className="text-coral mt-1 leading-none shrink-0"
      >
        ▸
      </span>
      <span>{children}</span>
    </li>
  );
}

function confidenceLabel(predicted: number, low: number, high: number): string {
  const fraction = ((high - low) / 2 / predicted) * 100;
  if (fraction <= 2) return "high confidence";
  if (fraction <= 4) return "good confidence";
  return "fair confidence";
}
