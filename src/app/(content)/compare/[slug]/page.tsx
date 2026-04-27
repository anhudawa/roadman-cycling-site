import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header, Footer, Section, Container } from "@/components/layout";
import { JsonLd } from "@/components/seo/JsonLd";
import { SourceMethodology } from "@/components/features/aeo/SourceMethodology";
import { AskRoadmanCTA } from "@/components/features/aeo/AskRoadmanCTA";
import { getComparisonBySlug, getAllComparisonSlugs } from "@/lib/comparisons";
import { queryContentGraph } from "@/lib/content-graph";
import {
  ComparisonTemplate,
  type RelatedLink,
} from "@/components/templates";

export function generateStaticParams() {
  return getAllComparisonSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const comp = getComparisonBySlug(slug);
  if (!comp) return { title: "Comparison Not Found" };

  return {
    title: comp.seoTitle,
    description: comp.seoDescription,
    alternates: {
      canonical: `https://roadmancycling.com/compare/${slug}`,
    },
  };
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const comp = getComparisonBySlug(slug);
  if (!comp) notFound();

  // Pull pillar-matched episodes + articles for the methodology block so
  // every comparison page exposes its evidence trail without bespoke
  // per-page wiring. Limited to 2 of each to keep the footer scannable.
  const graph = queryContentGraph({ pillar: comp.pillar, limit: 2 });
  const sourceEpisodes = graph.episodes.slice(0, 2).map((ep) => ({
    title: ep.title,
    href: `/podcast/${ep.slug}`,
  }));
  const sourceArticles = graph.articles.slice(0, 2).map((a) => ({
    title: a.title,
    href: `/blog/${a.slug}`,
  }));

  // Combine the legacy `relatedArticle`/`relatedTool` plus the graph-
  // derived articles into a single related rail rendered by the
  // template. Episodes go through the SourceMethodology block below so
  // the visual hierarchy stays "decision → evidence → CTA".
  const related: RelatedLink[] = [];
  if (comp.relatedArticle) {
    related.push({
      label: "Deep dive article",
      href: comp.relatedArticle,
      description: "The long-form piece that backs this comparison.",
    });
  }
  if (comp.relatedTool) {
    related.push({
      label: "Free tool / assessment",
      href: comp.relatedTool,
      description: "Apply this comparison to your own numbers.",
    });
  }
  for (const a of sourceArticles) {
    if (!related.some((r) => r.href === a.href)) {
      related.push({ label: a.title, href: a.href });
    }
  }

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: comp.title,
          description: comp.seoDescription,
          url: `https://roadmancycling.com/compare/${slug}`,
          speakable: {
            "@type": "SpeakableSpecification",
            cssSelector: ["h1", ".short-answer", ".verdict-block"],
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: `Which is better: ${comp.optionA} or ${comp.optionB}?`,
              acceptedAnswer: {
                "@type": "Answer",
                text: comp.verdict,
              },
            },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://roadmancycling.com" },
            { "@type": "ListItem", position: 2, name: "Compare", item: "https://roadmancycling.com/compare" },
            { "@type": "ListItem", position: 3, name: comp.title, item: `https://roadmancycling.com/compare/${slug}` },
          ],
        }}
      />

      <Header />

      <ComparisonTemplate
        optionA={comp.optionA}
        optionB={comp.optionB}
        pillar={comp.pillar}
        verdict={comp.verdict}
        rows={comp.features}
        bestForA={comp.bestForA}
        bestForB={comp.bestForB}
        related={related.length > 0 ? related : undefined}
        source={`compare-${slug}`}
      />

      {/* Source methodology — pillar-matched episodes that informed the
          verdict, surfaced under the template so the trail from claim to
          source is one scroll away. AskRoadmanCTA gives high-intent
          readers a path into the assistant for follow-up questions. */}
      {(sourceEpisodes.length > 0 || sourceArticles.length > 0) && (
        <Section background="charcoal" className="!py-12 border-t border-white/5">
          <Container width="narrow">
            <SourceMethodology
              methodology={`This comparison is built from ${comp.pillar} content on the Roadman Cycling Podcast and our written guides. The verdict mirrors the consensus across these conversations — adjusted for serious amateur and masters cyclists rather than World Tour riders.`}
              episodes={sourceEpisodes}
              articles={sourceArticles}
            />
          </Container>
        </Section>
      )}

      <Section background="deep-purple" grain className="!py-12">
        <Container width="narrow">
          <AskRoadmanCTA
            topic={`${comp.optionA} vs ${comp.optionB}`}
            source={`compare-${slug}`}
          />
        </Container>
      </Section>

      <Footer />
    </>
  );
}
