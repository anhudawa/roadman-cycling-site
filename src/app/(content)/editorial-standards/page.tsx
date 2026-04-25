import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Card, ScrollReveal, GradientText } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Editorial Standards $€” How We Write and Review Content",
  description:
    "How Roadman Cycling creates, reviews, and maintains its content. Sources, methodology, review process, and the standards every article and episode must meet.",
  alternates: {
    canonical: "https://roadmancycling.com/editorial-standards",
  },
};

const STANDARDS = [
  {
    title: "Source Transparency",
    description:
      "Every factual claim traces to a named expert, a published study, or an on-the-record podcast conversation. We cite sources inline and link to the relevant episode or article where the claim originated.",
  },
  {
    title: "Expert Review",
    description:
      "Training content is reviewed by Anthony Walsh (coaching lead). Nutrition content is checked against current sports-nutrition consensus (Jeukendrup, Burke, Impey). Strength content references published S&C research. We do not publish medical advice.",
  },
  {
    title: "No Fabricated Data",
    description:
      "Statistics, study results, and athlete quotes are never invented. If a number appears, it comes from a published source or from named coaching data with the athlete's consent. When we cite podcast guests, the claim is consistent with their publicly documented work.",
  },
  {
    title: "Update and Refresh Cadence",
    description:
      "Articles are reviewed for accuracy at least annually. Posts with an updatedDate in frontmatter show when the content was last verified. Time-sensitive content (event previews, product comparisons) carries editorial notes when the context has changed.",
  },
  {
    title: "Commercial Transparency",
    description:
      "Roadman Cycling generates revenue through coaching, community membership, and digital products. When an article links to /coaching or /apply, that is a commercial recommendation. We do not accept payment for editorial placement. Comparison articles are honest $€” we recommend competitors when they are the better fit.",
  },
  {
    title: "Corrections",
    description:
      "If we get something wrong, we fix it publicly. Corrections are noted inline with the original text preserved for transparency. Contact anthony@roadmancycling.com to report factual errors.",
  },
];

export default function EditorialStandardsPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Editorial Standards",
          description: "How Roadman Cycling creates, reviews, and maintains its content.",
          url: "https://roadmancycling.com/editorial-standards",
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://roadmancycling.com" },
            { "@type": "ListItem", position: 2, name: "Editorial Standards", item: "https://roadmancycling.com/editorial-standards" },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-14">
          <Container width="narrow" className="text-center">
            <ScrollReveal direction="up" eager>
              <p className="text-coral font-heading text-sm tracking-widest mb-4">
                TRUST
              </p>
              <GradientText as="h1" className="font-heading mb-6">
                <span style={{ fontSize: "var(--text-hero)" }}>EDITORIAL STANDARDS.</span>
              </GradientText>
              <p className="text-foreground-muted text-lg max-w-xl mx-auto leading-relaxed">
                How we create, review, and maintain the content on this site.
                Every article, episode summary, and coaching recommendation
                follows these rules.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        <Section background="charcoal">
          <Container width="narrow">
            <div className="space-y-6">
              {STANDARDS.map((s, i) => (
                <ScrollReveal key={s.title} direction="up" delay={i * 0.04}>
                  <Card className="p-6 md:p-8" hoverable={false}>
                    <h2 className="font-heading text-off-white text-xl mb-3">
                      {s.title}
                    </h2>
                    <p className="text-foreground-muted text-sm leading-relaxed">
                      {s.description}
                    </p>
                  </Card>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal direction="up" className="mt-12 text-center">
              <p className="text-foreground-muted text-sm max-w-lg mx-auto mb-6">
                Questions about our editorial process? Contact{" "}
                <a href="mailto:anthony@roadmancycling.com" className="text-coral hover:text-coral/80 transition-colors">
                  anthony@roadmancycling.com
                </a>
              </p>
              <div className="flex flex-wrap gap-4 justify-center text-sm">
                <Link href="/about" className="text-coral hover:text-coral/80 transition-colors">About $†’</Link>
                <Link href="/research" className="text-coral hover:text-coral/80 transition-colors">Research & Evidence $†’</Link>
              </div>
            </ScrollReveal>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
