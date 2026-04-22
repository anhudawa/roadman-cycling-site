import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Card, ScrollReveal, Badge, Button } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { getComparisonBySlug, getAllComparisonSlugs } from "@/lib/comparisons";

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

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: comp.title,
          description: comp.seoDescription,
          url: `https://roadmancycling.com/compare/${slug}`,
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

      <main id="main-content">
        {/* Hero + Verdict */}
        <Section background="deep-purple" grain className="pt-32 pb-14">
          <Container width="narrow">
            <ScrollReveal direction="up" eager>
              <Badge pillar={comp.pillar} size="md" />
              <h1
                className="font-heading text-off-white mt-4 mb-6"
                style={{ fontSize: "var(--text-hero)" }}
              >
                {comp.optionA.toUpperCase()}
                <br />
                <span className="text-coral">VS {comp.optionB.toUpperCase()}</span>
              </h1>
              <div className="rounded-xl border border-coral/30 bg-coral/10 p-5 md:p-6">
                <p className="font-heading text-coral text-xs tracking-widest mb-2">
                  QUICK VERDICT
                </p>
                <p className="text-off-white text-base leading-relaxed">
                  {comp.verdict}
                </p>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Comparison Table */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up" className="mb-8 text-center">
              <h2 className="font-heading text-off-white" style={{ fontSize: "var(--text-section)" }}>
                SIDE BY SIDE
              </h2>
            </ScrollReveal>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-foreground-subtle font-heading text-xs tracking-widest">FEATURE</th>
                    <th className="text-left py-3 px-4 text-coral font-heading text-xs tracking-widest">{comp.optionA.toUpperCase()}</th>
                    <th className="text-left py-3 px-4 text-foreground-subtle font-heading text-xs tracking-widest">{comp.optionB.toUpperCase()}</th>
                  </tr>
                </thead>
                <tbody>
                  {comp.features.map((f) => (
                    <tr key={f.feature} className="border-b border-white/5">
                      <td className="py-3 px-4 text-off-white font-medium">{f.feature}</td>
                      <td className="py-3 px-4 text-foreground-muted">{f.optionA}</td>
                      <td className="py-3 px-4 text-foreground-muted">{f.optionB}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Container>
        </Section>

        {/* Best For */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ScrollReveal direction="up">
                <Card className="p-6 h-full" hoverable={false}>
                  <p className="font-heading text-coral text-xs tracking-widest mb-3">
                    CHOOSE {comp.optionA.toUpperCase()} IF
                  </p>
                  <ul className="space-y-2">
                    {comp.bestForA.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-foreground-muted text-sm">
                        <span className="text-coral mt-0.5 shrink-0">&#10003;</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </ScrollReveal>
              <ScrollReveal direction="up" delay={0.1}>
                <Card className="p-6 h-full" hoverable={false}>
                  <p className="font-heading text-foreground-subtle text-xs tracking-widest mb-3">
                    CHOOSE {comp.optionB.toUpperCase()} IF
                  </p>
                  <ul className="space-y-2">
                    {comp.bestForB.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-foreground-muted text-sm">
                        <span className="text-foreground-subtle mt-0.5 shrink-0">&#10003;</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </ScrollReveal>
            </div>
          </Container>
        </Section>

        {/* Related + CTA */}
        <Section background="charcoal" className="!py-14">
          <Container width="narrow" className="text-center">
            <ScrollReveal direction="up">
              <div className="flex flex-wrap gap-3 justify-center mb-8">
                {comp.relatedArticle && (
                  <Link
                    href={comp.relatedArticle}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/15 hover:border-coral/40 bg-white/[0.04] hover:bg-white/[0.07] px-4 py-2 text-sm font-heading text-off-white tracking-wider transition-all"
                  >
                    Deep Dive Article →
                  </Link>
                )}
                {comp.relatedTool && (
                  <Link
                    href={comp.relatedTool}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/15 hover:border-coral/40 bg-white/[0.04] hover:bg-white/[0.07] px-4 py-2 text-sm font-heading text-off-white tracking-wider transition-all"
                  >
                    Free Assessment →
                  </Link>
                )}
              </div>
              <Button href="/apply" size="lg" dataTrack={`compare_${slug}_apply`}>
                Apply for Coaching
              </Button>
            </ScrollReveal>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
