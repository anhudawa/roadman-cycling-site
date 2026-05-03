import type { Metadata } from "next";
import { Footer, Header } from "@/components/layout";
import { JsonLd } from "@/components/seo/JsonLd";
import { ENTITY_IDS } from "@/lib/brand-facts";
import { AskRoadmanClient } from "@/components/features/ask/AskRoadmanClient";
import { getToolResultBySlug } from "@/lib/tool-results/store";
import { isToolSlug } from "@/lib/tool-results/types";
import { getDefinition } from "@/lib/diagnostics/framework/registry";

export const metadata: Metadata = {
  title: "Ask Roadman — The Cycling Performance Assistant",
  description:
    "Ask Roadman is the on-site cycling performance assistant from Roadman Cycling. Grounded in 1,400+ podcast conversations with Dan Lorang, Professor Seiler, Dr David Dunne, and the rest of the Roadman guest roster. Honest, cited, on-brand answers for serious amateur cyclists.",
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

/**
 * Cap the pre-filled question length so a malformed link can't paste a
 * runaway string into the textarea. The textarea itself maxes at 2000;
 * 600 keeps the AEO handoff prompts well under that and avoids visual
 * overflow on the seed banner.
 */
function sanitiseInitialQuestion(q: string | undefined): string {
  if (!q) return "";
  return q.replace(/\s+/g, " ").trim().slice(0, 600);
}

export default async function AskPage({
  searchParams,
}: {
  searchParams: Promise<{
    seed_tool?: string;
    seed_result?: string;
    /** Pre-fill the chat input. Set by AskRoadmanCTA on content templates. */
    q?: string;
  }>;
}) {
  const { seed_tool: seedTool, seed_result: seedResult, q } = await searchParams;
  const seed = await loadSeedContext(seedTool, seedResult);
  const initialQuestion = sanitiseInitialQuestion(q);
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Ask Roadman",
          description:
            "On-site cycling performance assistant grounded in 1,400+ Roadman Cycling Podcast conversations with World Tour coaches, sports scientists, and pro cyclists.",
          url: "https://roadmancycling.com/ask",
          applicationCategory: "HealthApplication",
          operatingSystem: "Web",
          browserRequirements: "Requires JavaScript, modern browser",
          isAccessibleForFree: true,
          inLanguage: "en",
          featureList: [
            "Conversational answers grounded in 1,400+ podcast conversations",
            "Citations to the source episode for every answer",
            "Tool result handoff (FTP zones, race weight, fuelling, etc.)",
            "Pre-filled prompts from blog posts and guest pages",
          ],
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
          publisher: { "@id": ENTITY_IDS.organization },
          creator: { "@id": ENTITY_IDS.person },
          isPartOf: { "@id": ENTITY_IDS.website },
        }}
      />
      <style
        dangerouslySetInnerHTML={{
          __html: `@keyframes ask-blink { 0%,100%{opacity:1} 50%{opacity:0} }
.ask-composer-input { field-sizing: content; }`,
        }}
      />
      <Header />
      <main id="main-content" className="bg-charcoal">
        {/* Hero — flows with the page; no viewport lock so the chat
            below feels like a continuation of the page rather than
            a separate widget. */}
        <div className="relative">
          <div className="max-w-3xl mx-auto px-4 md:px-6 pt-[calc(5rem+var(--cohort-banner-height,0px))] md:pt-[calc(6rem+var(--cohort-banner-height,0px))] pb-2">
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
              Built on 1,400+ on-the-record Roadman Cycling Podcast conversations
              with World Tour coaches, sports scientists, and pro cyclists.
              Straight answers, cited to the source.
            </p>
          </div>
        </div>

        {seed ? (
          <div className="max-w-3xl mx-auto px-4 md:px-6 pt-4">
            <div className="border-l-2 border-coral pl-4 py-1 text-sm">
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

        {/* Chat — no border, no inner scroll. Messages flow as part of
            the page; the composer is sticky at the viewport bottom. */}
        <div className="max-w-3xl w-full mx-auto px-4 md:px-6">
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
            initialQuestion={initialQuestion}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
