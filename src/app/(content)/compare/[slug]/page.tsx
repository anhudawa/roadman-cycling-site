import type { Metadata } from "next";
import { Fragment } from "react";
import { notFound } from "next/navigation";
import { Header, Footer, Section, Container } from "@/components/layout";
import { JsonLd } from "@/components/seo/JsonLd";
import { ENTITY_IDS, SITE_ORIGIN } from "@/lib/brand-facts";
import { SourceMethodology } from "@/components/features/aeo/SourceMethodology";
import { AskRoadmanCTA } from "@/components/features/aeo/AskRoadmanCTA";
import { getComparisonBySlug, getAllComparisonSlugs } from "@/lib/comparisons";
import { queryContentGraph } from "@/lib/content-graph";

// Comparisons are evergreen — refreshed when the underlying recommendation
// changes, not on a publishing cadence. A static review date keeps Article
// schema valid (Google wants datePublished) without lying about freshness.
const COMPARISON_LAST_REVIEWED = "2026-04-30";
import {
  ComparisonTemplate,
  type RelatedLink,
} from "@/components/templates";

/**
 * Renders a paragraph string supporting two micro-syntaxes:
 *   - **bold** → <strong>
 *   - [text](href) → <a> (internal href stays a relative link)
 * Kept inline rather than pulling in MDX because comparison body copy
 * is short and doesn't need a full markdown pipeline.
 */
function renderInline(text: string): React.ReactNode {
  // First split on bold, then process each chunk for links.
  const boldSplit = text.split(/(\*\*[^*]+\*\*)/g);
  return boldSplit.map((chunk, i) => {
    if (chunk.startsWith("**") && chunk.endsWith("**")) {
      return <strong key={i}>{chunk.slice(2, -2)}</strong>;
    }
    const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
    const out: React.ReactNode[] = [];
    let lastIdx = 0;
    let match: RegExpExecArray | null;
    while ((match = linkRe.exec(chunk)) !== null) {
      if (match.index > lastIdx) out.push(chunk.slice(lastIdx, match.index));
      const isExternal = match[2].startsWith("http");
      out.push(
        <a
          key={`${i}-${match.index}`}
          href={match[2]}
          {...(isExternal
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {match[1]}
        </a>,
      );
      lastIdx = match.index + match[0].length;
    }
    if (lastIdx < chunk.length) out.push(chunk.slice(lastIdx));
    return <Fragment key={i}>{out.length > 0 ? out : chunk}</Fragment>;
  });
}

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
      label: "Full article",
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

  const compareUrl = `${SITE_ORIGIN}/compare/${slug}`;

  return (
    <>
      {/* Article — comparison verdicts are an editorial output (a position
          taken by Anthony, backed by the podcast back-catalogue), not a
          generic WebPage. Connects each comparison to the canonical Person
          + Organization @ids so the verdict carries E-E-A-T weight. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          "@id": `${compareUrl}#article`,
          headline: comp.title,
          description: comp.seoDescription,
          url: compareUrl,
          mainEntityOfPage: { "@type": "WebPage", "@id": compareUrl },
          author: { "@id": ENTITY_IDS.person },
          publisher: { "@id": ENTITY_IDS.organization },
          isPartOf: { "@id": ENTITY_IDS.website },
          datePublished: COMPARISON_LAST_REVIEWED,
          dateModified: COMPARISON_LAST_REVIEWED,
          articleSection: comp.pillar,
          about: [
            { "@type": "Thing", name: comp.optionA },
            { "@type": "Thing", name: comp.optionB },
          ],
          speakable: {
            "@type": "SpeakableSpecification",
            cssSelector: ["h1", ".short-answer", ".verdict-block"],
          },
        }}
      />
      {/* ItemList — the two options under comparison as ranked entries.
          The winning option (per `verdictWinner`) takes position 1; a
          "depends" verdict emits both at their natural order with an
          unordered listing so we don't fabricate a ranking. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: comp.title,
          description: `${comp.optionA} vs ${comp.optionB} — head-to-head comparison.`,
          url: compareUrl,
          numberOfItems: 2,
          itemListOrder:
            comp.verdictWinner === "depends"
              ? "https://schema.org/ItemListUnordered"
              : "https://schema.org/ItemListOrderDescending",
          itemListElement: (() => {
            const a = {
              "@type": "ListItem" as const,
              position: comp.verdictWinner === "B" ? 2 : 1,
              name: comp.optionA,
              description: comp.bestForA.join(" "),
            };
            const b = {
              "@type": "ListItem" as const,
              position: comp.verdictWinner === "B" ? 1 : 2,
              name: comp.optionB,
              description: comp.bestForB.join(" "),
            };
            return [a, b].sort((x, y) => x.position - y.position);
          })(),
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
            ...(comp.faqs ?? []).map((faq) => ({
              "@type": "Question",
              name: faq.q,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.a,
              },
            })),
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
            { "@type": "ListItem", position: 3, name: comp.title, item: compareUrl },
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
      >
        {(comp.intro || comp.body || comp.faqs) && (
          <>
            {comp.intro && comp.intro.length > 0 && (
              <section aria-label="Context" className="mb-8">
                {comp.intro.map((p, i) => (
                  <p key={`intro-${i}`}>{renderInline(p)}</p>
                ))}
              </section>
            )}
            {comp.body && comp.body.length > 0 && (
              <section aria-label="Analysis" className="mb-4">
                <h2>The Honest Read</h2>
                {comp.body.map((p, i) => (
                  <p key={`body-${i}`}>{renderInline(p)}</p>
                ))}
              </section>
            )}
            {comp.faqs && comp.faqs.length > 0 && (
              <section aria-label="Frequently Asked Questions" className="mt-12">
                <h2>FAQ</h2>
                {comp.faqs.map((faq, i) => (
                  <div key={`faq-${i}`} className="mb-6">
                    <h3>{faq.q}</h3>
                    <p>{renderInline(faq.a)}</p>
                  </div>
                ))}
              </section>
            )}
          </>
        )}
      </ComparisonTemplate>

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
