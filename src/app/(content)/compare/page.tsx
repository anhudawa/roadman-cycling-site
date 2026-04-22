import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Card, ScrollReveal, GradientText, Badge } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { COMPARISONS } from "@/lib/comparisons";

export const metadata: Metadata = {
  title: "Compare — Cycling Training Decisions Made Simple",
  description:
    "Side-by-side comparisons for cycling training decisions. Coach vs app, power vs heart rate, polarised vs pyramidal, and more.",
  alternates: {
    canonical: "https://roadmancycling.com/compare",
  },
};

export default function CompareIndexPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Cycling Training Comparisons",
          url: "https://roadmancycling.com/compare",
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://roadmancycling.com" },
            { "@type": "ListItem", position: 2, name: "Compare", item: "https://roadmancycling.com/compare" },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-14">
          <Container width="narrow" className="text-center">
            <ScrollReveal direction="up" eager>
              <p className="text-coral font-heading text-sm tracking-widest mb-4">
                DECISIONS
              </p>
              <GradientText as="h1" className="font-heading mb-6">
                <span style={{ fontSize: "var(--text-hero)" }}>COMPARE.</span>
              </GradientText>
              <p className="text-foreground-muted text-lg max-w-xl mx-auto leading-relaxed">
                {COMPARISONS.length} side-by-side comparisons for the training
                decisions cyclists actually face. Quick verdict, feature table,
                honest recommendation.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        <Section background="charcoal">
          <Container width="narrow">
            <div className="space-y-4">
              {COMPARISONS.map((comp, i) => (
                <ScrollReveal key={comp.slug} direction="up" delay={i * 0.03}>
                  <Link href={`/compare/${comp.slug}`} className="block group">
                    <Card className="p-6 transition-all group-hover:border-coral/30">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h2 className="font-heading text-lg text-off-white group-hover:text-coral transition-colors">
                              {comp.optionA} vs {comp.optionB}
                            </h2>
                            <Badge pillar={comp.pillar} size="sm" />
                          </div>
                          <p className="text-foreground-muted text-sm leading-relaxed line-clamp-2">
                            {comp.verdict}
                          </p>
                        </div>
                        <span className="text-coral shrink-0 mt-1">→</span>
                      </div>
                    </Card>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
