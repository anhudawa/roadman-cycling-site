import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { JsonLd } from "@/components/seo/JsonLd";
import { getComparisonBySlug, getAllComparisonSlugs } from "@/lib/comparisons";
import { ComparisonTemplate, type RelatedLink } from "@/components/templates";

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
            cssSelector: ["h1", ".verdict-block"],
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

      <Footer />
    </>
  );
}
