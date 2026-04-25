import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container, Footer, Header, Section } from "@/components/layout";
import { getToolResultBySlug } from "@/lib/tool-results/store";
import { fuellingInputs, fuellingOutputs } from "@/lib/tool-results/shapes";
import { AskFromResult } from "@/components/features/results/AskFromResult";

/**
 * Permalink view for a saved fuelling-calculator result. Server-rendered
 * from tool_results $€” the slug is unguessable so the row is safe to
 * share; we still set robots:noindex so search engines don't crawl
 * individual rider results.
 */

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getToolResultBySlug(slug);
  if (!result || result.toolSlug !== "fuelling")
    return { title: "Fuelling plan $€” Roadman Cycling" };
  return {
    title: `Your fuelling plan $€” Roadman Cycling`,
    description: result.summary.slice(0, 160),
    robots: { index: false, follow: false },
  };
}

export default async function FuellingResultPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getToolResultBySlug(slug);
  if (!result || result.toolSlug !== "fuelling") notFound();

  const inputs = fuellingInputs(result);
  const outputs = fuellingOutputs(result);

  return (
    <>
      <Header />
      <main id="main-content">
        <Section background="charcoal" grain className="pt-32 pb-10">
          <Container width="narrow">
            <p className="text-coral font-heading text-xs tracking-widest mb-3">
              YOUR SAVED FUELLING PLAN
            </p>
            <h1
              className="font-heading text-off-white mb-4 leading-[1]"
              style={{ fontSize: "var(--text-section)" }}
            >
              {outputs.carbsPerHour}G CARBS/HR
            </h1>
            <p className="text-off-white/90 text-lg leading-relaxed max-w-2xl">
              {result.summary}
            </p>
          </Container>
        </Section>

        <Section background="charcoal" className="!pt-0 !pb-10">
          <Container width="narrow">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MetricTile label="CARBS/HR" value={`${outputs.carbsPerHour}g`} />
              <MetricTile label="FLUID/HR" value={`${outputs.fluidPerHour}ml`} sub={`~${outputs.totalFluid}L total`} />
              <MetricTile label="SODIUM/HR" value={`${outputs.sodiumPerHour}mg`} />
              <MetricTile label="TOTAL CARBS" value={`${outputs.totalCarbs}g`} sub="for entire ride" />
            </div>

            {outputs.weatherNote && (
              <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground-muted">
                {outputs.weatherNote}
              </div>
            )}

            <div className="mt-6 bg-background-elevated rounded-xl border border-white/5 p-5">
              <h3 className="font-heading text-xs text-off-white mb-3 tracking-wider">
                SESSION
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-foreground-muted">
                <div>
                  <p className="text-[10px] text-foreground-subtle tracking-wider mb-0.5">DURATION</p>
                  <p className="font-heading text-off-white text-lg">{inputs.durationMinutes} min</p>
                </div>
                <div>
                  <p className="text-[10px] text-foreground-subtle tracking-wider mb-0.5">INTENSITY</p>
                  <p className="font-heading text-off-white text-lg">{outputs.intensityLabel}</p>
                </div>
                <div>
                  <p className="text-[10px] text-foreground-subtle tracking-wider mb-0.5">TARGET POWER</p>
                  <p className="font-heading text-off-white text-lg">{inputs.watts}W</p>
                </div>
                <div>
                  <p className="text-[10px] text-foreground-subtle tracking-wider mb-0.5">WEIGHT</p>
                  <p className="font-heading text-off-white text-lg">{inputs.weightKg}kg</p>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-background-elevated rounded-xl border border-white/5 p-5">
              <h3 className="font-heading text-xs text-off-white mb-3 tracking-wider">
                TIMING
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-[10px] text-foreground-subtle tracking-wider mb-0.5">START AT</p>
                  <p className="font-heading text-xl text-off-white">{outputs.startFuellingAt} min</p>
                </div>
                <div>
                  <p className="text-[10px] text-foreground-subtle tracking-wider mb-0.5">FEED EVERY</p>
                  <p className="font-heading text-xl text-off-white">{outputs.feedingInterval} min</p>
                </div>
                <div>
                  <p className="text-[10px] text-foreground-subtle tracking-wider mb-0.5">PER FEED</p>
                  <p className="font-heading text-xl text-off-white">
                    ~{Math.round(outputs.carbsPerHour / (60 / Math.max(outputs.feedingInterval, 1)))}g
                  </p>
                </div>
              </div>
            </div>

            {outputs.dualSource && (
              <div className="mt-6 bg-coral/10 rounded-xl border border-coral/20 p-5">
                <h3 className="font-heading text-xs text-coral mb-3 tracking-wider">
                  GLUCOSE : FRUCTOSE SPLIT (1:0.8)
                </h3>
                <p className="text-foreground-muted text-sm">
                  <strong className="text-off-white">Glucose (SGLT1):</strong>{" "}
                  {outputs.glucosePerHour}g/hr $·{" "}
                  <strong className="text-off-white">Fructose (GLUT5):</strong>{" "}
                  {outputs.fructosePerHour}g/hr. Single-source glucose saturates
                  at ~60g/hr $€” fructose uses an independent transporter.
                </p>
              </div>
            )}

            {outputs.strategy.length > 0 && (
              <div className="mt-6 bg-deep-purple/30 rounded-xl border border-purple/20 p-6">
                <h3 className="font-heading text-xs text-off-white mb-3 tracking-wider">
                  STRATEGY
                </h3>
                <div className="space-y-3">
                  {outputs.strategy.map((p, i) => (
                    <p key={i} className="text-foreground-muted text-sm leading-relaxed">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </Container>
        </Section>

        <Section background="charcoal" className="!pt-0 pb-24">
          <Container width="narrow">
            <div className="rounded-xl border border-coral/30 bg-coral/5 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-coral font-heading text-xs tracking-widest mb-1">
                  WANT TO UNPACK THIS?
                </p>
                <p className="text-off-white/90 text-sm">
                  Open this plan in Ask Roadman for a grounded explanation or
                  tweaks to your exact event.
                </p>
              </div>
              <AskFromResult tool="fuelling" slug={result.slug} summary={result.summary} />
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}

function MetricTile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-background-elevated rounded-xl border border-white/5 p-5 text-center">
      <p className="text-[10px] text-foreground-subtle mb-1 tracking-wider">{label}</p>
      <p className="font-heading text-3xl text-coral">{value}</p>
      {sub && <p className="text-[10px] text-foreground-subtle mt-1">{sub}</p>}
    </div>
  );
}
