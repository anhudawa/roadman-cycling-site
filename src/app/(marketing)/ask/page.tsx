import type { Metadata } from "next";
import { Footer, Header } from "@/components/layout";
import { JsonLd } from "@/components/seo/JsonLd";
import { AskRoadmanClient } from "@/components/features/ask/AskRoadmanClient";
import { getToolResultBySlug } from "@/lib/tool-results/store";
import { isToolSlug } from "@/lib/tool-results/types";
import { getDefinition } from "@/lib/diagnostics/framework/registry";

export const metadata: Metadata = {
  title: "Ask Roadman — the cycling performance assistant",
  description:
    "Ask Roadman: the on-site cycling performance assistant. Grounded in 100M+ downloads of conversations with Dan Lorang, Professor Seiler, Dr David Dunne and the Roadman guest roster. Honest, cited, on-brand answers for serious amateur cyclists.",
  alternates: { canonical: "https://roadmancycling.com/ask" },
  openGraph: {
    title: "Ask Roadman",
    description:
      "The on-site cycling performance assistant from Roadman Cycling. Grounded answers for serious riders.",
    type: "website",
    url: "https://roadmancycling.com/ask",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
  robots: { index: true, follow: true },
};

export const dynamic = "force-dynamic";

interface SeedContext {
  toolSlug: string;
  toolTitle: string;
  summary: string;
  primaryCategoryLabel: string | null;
  resultSlug: string;
}

/**
 * Resolve the `?seed_tool=&seed_result=` pair into a banner-ready
 * context object. Silently bails if either param is missing, the tool
 * slug isn't a known one, or the result doesn't exist / doesn't match
 * the requested tool — we never surface an error on the free Ask page.
 */
async function loadSeedContext(
  seedTool: string | undefined,
  seedResult: string | undefined,
): Promise<SeedContext | null> {
  if (!seedTool || !seedResult) return null;
  const normalised = seedTool === "ftp-zones" ? "ftp_zones" : seedTool;
  if (!isToolSlug(normalised)) return null;
  const row = await getToolResultBySlug(seedResult);
  if (!row || row.toolSlug !== normalised) return null;
  const def = getDefinition(normalised);
  const primary = row.primaryResult
    ? def.categories.find((c) => c.key === row.primaryResult)?.label ?? null
    : null;
  return {
    toolSlug: normalised,
    toolTitle: def.title,
    summary: row.summary,
    primaryCategoryLabel: primary,
    resultSlug: row.slug,
  };
}

export default async function AskPage({
  searchParams,
}: {
  searchParams: Promise<{ seed_tool?: string; seed_result?: string }>;
}) {
  const { seed_tool: seedTool, seed_result: seedResult } = await searchParams;
  const seed = await loadSeedContext(seedTool, seedResult);
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Ask Roadman",
          description:
            "On-site cycling performance assistant grounded in the Roadman Cycling content library.",
          url: "https://roadmancycling.com/ask",
          applicationCategory: "HealthApplication",
          isAccessibleForFree: true,
          publisher: {
            "@type": "Organization",
            name: "Roadman Cycling",
            url: "https://roadmancycling.com",
          },
        }}
      />
      <style
        dangerouslySetInnerHTML={{
          __html: `@keyframes ask-blink { 0%,100%{opacity:1} 50%{opacity:0} }`,
        }}
      />
      <Header />
      <main id="main-content" className="bg-charcoal">
        {/* Hero */}
        <div className="relative border-b border-white/10">
          <div className="max-w-5xl mx-auto px-4 md:px-6 pt-20 pb-6">
            <p className="font-heading text-coral tracking-widest text-xs uppercase mb-3">
              Ask Roadman
            </p>
            <h1
              className="font-heading text-off-white leading-[0.95] mb-3"
              style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)" }}
            >
              CYCLING IS HARD.<br />
              THIS WILL HELP.
            </h1>
            <p className="text-foreground-muted max-w-2xl text-base md:text-lg leading-relaxed">
              Trained on 100M+ downloads of Roadman Cycling Podcast conversations
              with World Tour coaches, sports scientists and pro cyclists. Straight
              answers, cited to the source.
            </p>
          </div>
        </div>

        {seed ? (
          <div className="max-w-5xl mx-auto px-4 md:px-6 pt-6">
            <div className="rounded-lg border border-coral/30 bg-coral/[0.06] px-4 py-3 text-sm">
              <p className="font-heading text-coral tracking-widest text-[10px] uppercase mb-1">
                Asked with context
              </p>
              <p className="text-off-white">
                {seed.toolTitle}
                {seed.primaryCategoryLabel ? (
                  <>
                    {" — "}
                    <span className="text-coral">
                      {seed.primaryCategoryLabel}
                    </span>
                  </>
                ) : null}
              </p>
              <p className="text-foreground-muted text-xs mt-1 leading-relaxed">
                {seed.summary}
              </p>
            </div>
          </div>
        ) : null}

        {/* Chat */}
        <div className="max-w-5xl mx-auto px-0 md:px-6">
          <div className="bg-charcoal md:bg-white/[0.01] md:rounded-xl md:my-6 md:border md:border-white/10 h-[calc(100vh-220px)] md:h-[72vh] flex flex-col overflow-hidden">
            <AskRoadmanClient
              seed={
                seed
                  ? {
                      toolSlug: seed.toolSlug,
                      toolTitle: seed.toolTitle,
                      summary: seed.summary,
                      primaryCategoryLabel: seed.primaryCategoryLabel,
                      resultSlug: seed.resultSlug,
                    }
                  : null
              }
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
