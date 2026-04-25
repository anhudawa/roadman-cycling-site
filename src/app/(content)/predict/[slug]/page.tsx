import { notFound } from "next/navigation";
import { Header, Footer, Section, Container } from "@/components/layout";
import {
  getPredictionBySlug,
  getCourseById,
} from "@/lib/race-predictor/store";
import { UpgradeForm } from "./upgrade-form";

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

export default async function PredictResultPage({ params }: PageProps) {
  const { slug } = await params;
  const prediction = await getPredictionBySlug(slug);
  if (!prediction) notFound();

  const course = prediction.courseId
    ? await getCourseById(prediction.courseId)
    : null;
  const courseName = course?.name ?? "Your uploaded course";

  const distanceKm = course
    ? course.distanceM / 1000
    : (prediction.courseData?.totalDistance ?? 0) / 1000;
  const elevationGainM = course
    ? course.elevationGainM
    : Math.round(prediction.courseData?.totalElevationGain ?? 0);
  const climbCount =
    prediction.courseData?.climbs.length ??
    (course?.courseData?.climbs.length ?? 0);

  const insight =
    (prediction.resultSummary?.insight as
      | { headline: string; body: string }
      | undefined) ?? null;

  const avgSpeedKmh =
    distanceKm > 0
      ? (distanceKm / (prediction.predictedTimeS / 3600)).toFixed(1)
      : "—";

  return (
    <>
      <Header />
      <main>
        <Section background="deep-purple" grain className="pt-32 pb-10">
          <Container width="narrow">
            <p className="text-coral text-sm uppercase tracking-wide mb-2">
              Race Predictor · prediction
            </p>
            <h1 className="font-display text-4xl uppercase tracking-wide text-off-white mb-2">
              {courseName}
            </h1>
            <p className="text-off-white/70">
              {distanceKm.toFixed(1)} km · {elevationGainM} m elevation ·{" "}
              {climbCount} climb{climbCount === 1 ? "" : "s"}
            </p>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-10">
          <Container width="narrow">
            <div className="bg-purple text-off-white rounded-lg p-8 mb-8 text-center">
              <p className="text-sm uppercase tracking-wide opacity-70 mb-1">
                Predicted finish
              </p>
              <p className="font-display text-5xl uppercase tracking-wide mb-2">
                {formatDuration(prediction.predictedTimeS)}
              </p>
              <p className="text-sm opacity-80">
                Confidence range:{" "}
                {formatDuration(prediction.confidenceLowS)} –{" "}
                {formatDuration(prediction.confidenceHighS)}
              </p>
              <p className="text-sm opacity-80 mt-1">
                {avgSpeedKmh} km/h average ·{" "}
                {prediction.averagePower
                  ? `${prediction.averagePower} W average`
                  : "—"}
              </p>
            </div>

            {insight && (
              <div className="bg-white/[0.03] border-l-4 border-coral rounded-lg p-6 mb-8">
                <p className="text-coral text-sm uppercase tracking-wide mb-2">
                  Key insight (free)
                </p>
                <p className="font-display text-2xl text-off-white mb-3">
                  {insight.headline}
                </p>
                <p className="text-off-white/80">{insight.body}</p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              <Stat
                label="Avg power"
                value={prediction.averagePower ? `${prediction.averagePower} W` : "—"}
              />
              <Stat
                label="Norm power"
                value={prediction.normalizedPower ? `${prediction.normalizedPower} W` : "—"}
              />
              <Stat
                label="VI"
                value={
                  prediction.variabilityIndex
                    ? prediction.variabilityIndex.toFixed(2)
                    : "—"
                }
              />
              <Stat label="Mode" value={prediction.mode === "can_i_make_it" ? "Gap analysis" : "Race plan"} />
            </div>

            {prediction.isPaid ? (
              <div className="bg-white/[0.03] border border-coral/30 rounded-lg p-6 text-off-white/90">
                <p className="font-display text-xl text-coral uppercase tracking-wide mb-2">
                  Race report delivered
                </p>
                <p>
                  Your full Race Report is in your inbox. Check your email for
                  the secure link.
                </p>
              </div>
            ) : (
              <div className="bg-white/[0.03] border border-coral/30 rounded-lg p-6">
                <p className="font-display text-xl text-coral uppercase tracking-wide mb-2">
                  Unlock the full Race Report — $29
                </p>
                <ul className="text-off-white/80 text-sm space-y-1 mb-4">
                  <li>· Per-km pacing plan with weather-aware power targets</li>
                  <li>· Climb-by-climb power and time budget</li>
                  <li>· Fuelling rates dialled to your effort</li>
                  <li>· Equipment scenarios (CdA / mass / Crr trade-offs)</li>
                  <li>· Delivered as a PDF + secure web link</li>
                </ul>
                <UpgradeForm slug={prediction.slug} />
              </div>
            )}
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded p-3">
      <p className="text-off-white/60 text-xs uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-off-white font-display text-lg">{value}</p>
    </div>
  );
}
