import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Card, ScrollReveal, GradientText, Badge } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { GLOSSARY_TERMS } from "@/lib/glossary";

export const metadata: Metadata = {
  title: "Cycling Performance Glossary — Key Terms Explained",
  description:
    "Cycling performance glossary. FTP, VO2max, polarised training, sweet spot, W/kg, lactate threshold, periodisation, and more — defined by a cycling coach, not a textbook.",
  alternates: {
    canonical: "https://roadmancycling.com/glossary",
  },
};

export default function GlossaryPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Cycling Performance Glossary",
          description: "Key cycling performance terms defined for amateur and masters cyclists.",
          url: "https://roadmancycling.com/glossary",
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://roadmancycling.com" },
            { "@type": "ListItem", position: 2, name: "Glossary", item: "https://roadmancycling.com/glossary" },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-14">
          <Container width="narrow" className="text-center">
            <ScrollReveal direction="up" eager>
              <p className="text-coral font-heading text-sm tracking-widest mb-4">
                DEFINITIONS
              </p>
              <GradientText as="h1" className="font-heading mb-6">
                <span style={{ fontSize: "var(--text-hero)" }}>GLOSSARY.</span>
              </GradientText>
              <p className="text-foreground-muted text-lg max-w-xl mx-auto leading-relaxed">
                {GLOSSARY_TERMS.length} cycling performance terms defined by a coach, not a textbook.
                Each one links to the guide that explains how to apply it.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        <Section background="charcoal">
          <Container width="narrow">
            <div className="space-y-4">
              {GLOSSARY_TERMS.map((term, i) => (
                <ScrollReveal key={term.slug} direction="up" delay={i * 0.03}>
                  <Link href={`/glossary/${term.slug}`} className="block group">
                    <Card className="p-6 transition-all group-hover:border-coral/30">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h2 className="font-heading text-lg text-off-white group-hover:text-coral transition-colors">
                              {term.term}
                            </h2>
                            <Badge pillar={term.pillar} size="sm" />
                          </div>
                          <p className="text-foreground-muted text-sm leading-relaxed">
                            {term.definition}
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
