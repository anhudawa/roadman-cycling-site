import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container, Footer, Header, Section } from "@/components/layout";
import { getToolResultBySlug } from "@/lib/tool-results/store";
import { ftpZonesInputs, ftpZonesOutputs } from "@/lib/tool-results/shapes";
import { AskFromResult } from "@/components/features/results/AskFromResult";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getToolResultBySlug(slug);
  if (!result || result.toolSlug !== "ftp_zones")
    return { title: "FTP zones $€” Roadman Cycling" };
  return {
    title: `Your FTP zones $€” Roadman Cycling`,
    description: result.summary.slice(0, 160),
    robots: { index: false, follow: false },
  };
}

export default async function FtpZonesResultPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getToolResultBySlug(slug);
  if (!result || result.toolSlug !== "ftp_zones") notFound();

  const inputs = ftpZonesInputs(result);
  const outputs = ftpZonesOutputs(result);

  return (
    <>
      <Header />
      <main id="main-content">
        <Section background="charcoal" grain className="pt-32 pb-10">
          <Container width="narrow">
            <p className="text-coral font-heading text-xs tracking-widest mb-3">
              YOUR SAVED POWER ZONES
            </p>
            <h1
              className="font-heading text-off-white mb-4 leading-[1]"
              style={{ fontSize: "var(--text-section)" }}
            >
              {inputs.ftp}W FTP
            </h1>
            <p className="text-off-white/90 text-lg leading-relaxed max-w-2xl">
              {result.summary}
            </p>
          </Container>
        </Section>

        <Section background="charcoal" className="!pt-0 !pb-10">
          <Container width="narrow">
            <div className="bg-background-elevated rounded-xl border border-white/5 p-5">
              <h2 className="font-heading text-xs text-off-white mb-4 tracking-wider">
                ZONES
              </h2>
              <div className="space-y-2">
                {outputs.zones.map((z, i) => {
                  const isLast = i === outputs.zones.length - 1;
                  return (
                    <div
                      key={z.zone + i}
                      className="flex items-center justify-between gap-4 border-b border-white/5 last:border-b-0 py-3"
                    >
                      <div className="min-w-0">
                        <p className="font-heading text-off-white text-sm md:text-base">
                          {z.label.toUpperCase()}
                        </p>
                      </div>
                      <p className="font-heading text-coral text-lg md:text-xl whitespace-nowrap">
                        {isLast && z.upper >= inputs.ftp * 2
                          ? `${z.lower}W+`
                          : `${z.lower}$€“${z.upper}W`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {outputs.wkg !== null && (
              <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground-muted">
                W/kg: <strong className="text-off-white">{outputs.wkg.toFixed(2)}</strong>
              </div>
            )}
          </Container>
        </Section>

        <Section background="charcoal" className="!pt-0 pb-24">
          <Container width="narrow">
            <div className="rounded-xl border border-coral/30 bg-coral/5 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-coral font-heading text-xs tracking-widest mb-1">
                  WANT A WEEK BUILT AROUND THESE?
                </p>
                <p className="text-off-white/90 text-sm">
                  Hand these zones to Ask Roadman for a polarised training
                  template with your exact wattage targets.
                </p>
              </div>
              <AskFromResult tool="ftp_zones" slug={result.slug} summary={result.summary} />
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
