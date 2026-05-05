import { Section, Container } from "@/components/layout";
import { JourneyLinks } from "@/components/features/JourneyLinks";
import { getToolBySlug } from "@/lib/tools-registry";
import { getToolLanding } from "@/lib/tools/landing-content";

// ============================================
// ToolJourney — server-rendered journey block for tool pages
// ============================================
//
// Tool routes (e.g. `/tools/ftp-zones/page.tsx`) are `"use client"`
// because the calculator UI uses useState. Importing `<JourneyLinks>`
// directly into a client subtree pulls `fs` (via blog/podcast)
// into the client bundle and breaks the build.
//
// This wrapper lives one level up — rendered from each tool's
// `layout.tsx` (server component) AFTER the `{children}` slot — so
// the journey block server-renders with full filesystem access
// while the calculator stays client-rendered above it.
//
// Tools that aren't in the public registry (e.g. internal "masters-*"
// benchmarks) silently fall through to null, leaving their existing
// CTA paths unchanged.

interface ToolJourneyProps {
  slug: string;
}

export function ToolJourney({ slug }: ToolJourneyProps) {
  const tool = getToolBySlug(slug);
  if (!tool) return null;

  const landing = getToolLanding(slug);
  const keywords = [
    ...(tool.inputs ?? []),
    ...tool.title.toLowerCase().split(/\s+/),
    ...(landing?.whoItsFor ?? []).flatMap((b) => b.toLowerCase().split(/\s+/)),
  ].filter((k) => k.length > 3);

  return (
    <Section background="charcoal" className="!py-12">
      <Container width="narrow">
        <JourneyLinks
          currentType="tool"
          currentSlug={slug}
          currentTitle={tool.title}
          pillar={tool.pillar}
          keywords={keywords}
          source={`tool-${slug}`}
        />
      </Container>
    </Section>
  );
}
