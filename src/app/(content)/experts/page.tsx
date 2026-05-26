import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { ScrollReveal, Card, Badge } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { ENTITY_IDS, SITE_ORIGIN } from "@/lib/brand-facts";
import {
  getExpertsWithTopics,
  getActiveExpertTopics,
  getAllExpertTopicPairs,
} from "@/lib/experts";

export const metadata: Metadata = {
  title: "What The Experts Say — By Topic | Roadman Cycling",
  description:
    "What does Seiler say about polarised training? Friel about periodisation? Bigham about aerodynamics? Direct quotes and key positions from World Tour coaches, sport scientists and pro riders, organised by topic.",
  alternates: { canonical: `${SITE_ORIGIN}/experts` },
  openGraph: {
    title: "What The Experts Say — By Topic",
    description:
      "Direct quotes and key positions from the coaches, scientists and pro riders on The Roadman Cycling Podcast, organised by the topics people actually ask about.",
    type: "website",
    url: `${SITE_ORIGIN}/experts`,
  },
};

export default function ExpertsIndexPage() {
  const experts = getExpertsWithTopics();
  const topics = getActiveExpertTopics();
  const pageCount = getAllExpertTopicPairs().length;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "What The Experts Say — By Topic",
          description:
            "Direct quotes and key positions from the experts on The Roadman Cycling Podcast, organised by topic.",
          url: `${SITE_ORIGIN}/experts`,
          isPartOf: { "@id": ENTITY_IDS.website },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
            {
              "@type": "ListItem",
              position: 2,
              name: "Experts",
              item: `${SITE_ORIGIN}/experts`,
            },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container className="text-center">
            <ScrollReveal direction="up">
              <p className="text-coral font-heading text-lg mb-4 tracking-widest">
                ON THE RECORD
              </p>
              <h1
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-hero)" }}
              >
                WHAT THE EXPERTS SAY
              </h1>
              <p className="text-foreground-muted max-w-2xl mx-auto text-lg">
                What does Seiler say about polarised training? Friel about
                periodisation? Bigham about aerodynamics? We&rsquo;ve pulled
                the direct quotes and key positions from {experts.length}{" "}
                coaches, scientists and pro riders across {pageCount} topic
                pages — organised by the questions people actually ask.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Browse by topic */}
        <Section background="charcoal" className="!pb-8">
          <Container>
            <ScrollReveal direction="up">
              <h2 className="font-heading text-off-white mb-6 text-2xl tracking-wide">
                BROWSE BY TOPIC
              </h2>
            </ScrollReveal>
            <div className="flex flex-wrap gap-3">
              {topics.map(({ topic, expertCount }) => (
                <Link
                  key={topic.slug}
                  href={`/topics/${topic.parentHub}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/15 hover:border-coral/40 bg-white/[0.04] hover:bg-white/[0.07] px-4 py-2 text-sm font-heading text-off-white tracking-wider transition-all"
                >
                  {topic.label}
                  <span className="text-coral text-xs">{expertCount}</span>
                </Link>
              ))}
            </div>
          </Container>
        </Section>

        {/* Browse by expert */}
        <Section background="charcoal">
          <Container>
            <ScrollReveal direction="up">
              <h2 className="font-heading text-off-white mb-6 text-2xl tracking-wide">
                BROWSE BY EXPERT
              </h2>
            </ScrollReveal>
            <div className="grid gap-4 md:grid-cols-2">
              {experts.map((e, i) => (
                <ScrollReveal key={e.slug} direction="up" delay={(i % 6) * 0.04}>
                  <Card className="p-6 h-full">
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        href={`/experts/${e.slug}`}
                        className="font-heading text-xl text-off-white hover:text-coral transition-colors tracking-wide"
                      >
                        {e.name}
                      </Link>
                      {e.pillars[0] && <Badge pillar={e.pillars[0]} size="sm" />}
                    </div>
                    {e.credential && (
                      <p className="text-xs text-foreground-subtle mb-4">
                        {e.credential}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {e.topics.map((t) => (
                        <Link
                          key={t.slug}
                          href={`/experts/${e.slug}/${t.slug}`}
                          className="inline-flex items-center rounded-md border border-white/10 hover:border-coral/40 bg-white/[0.03] hover:bg-coral/10 px-3 py-1 text-xs font-heading text-foreground-muted hover:text-off-white tracking-wide transition-all"
                        >
                          {t.label}
                        </Link>
                      ))}
                    </div>
                  </Card>
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
