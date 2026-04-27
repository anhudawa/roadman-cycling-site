import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Card, ScrollReveal, GradientText, Badge } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  QUESTION_PAGES,
  QUESTION_CLUSTERS,
  getQuestionsByCluster,
} from "@/lib/questions";
import { SITE_ORIGIN } from "@/lib/brand-facts";

export const metadata: Metadata = {
  title: "Cycling Questions Answered — FTP, Masters, Nutrition, Coaching",
  description:
    "Answer-first guides to the questions amateur cyclists actually ask — FTP benchmarks, masters training, nutrition, and coaching. Grounded in 1,400+ podcast conversations.",
  alternates: {
    canonical: `${SITE_ORIGIN}/question`,
  },
};

export default function QuestionIndexPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Cycling Questions Answered",
          description:
            "Answer-first guides to the questions amateur and masters cyclists ask most.",
          url: `${SITE_ORIGIN}/question`,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Cycling Questions",
          itemListElement: QUESTION_PAGES.map((q, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: q.question,
            url: `${SITE_ORIGIN}/question/${q.slug}`,
          })),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: SITE_ORIGIN,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Questions",
              item: `${SITE_ORIGIN}/question`,
            },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-14">
          <Container width="narrow" className="text-center">
            <ScrollReveal direction="up" eager>
              <p className="text-coral font-heading text-sm tracking-widest mb-4">
                ANSWERS
              </p>
              <GradientText as="h1" className="font-heading mb-6">
                <span style={{ fontSize: "var(--text-hero)" }}>
                  CYCLING QUESTIONS, ANSWERED.
                </span>
              </GradientText>
              <p className="text-foreground-muted text-lg max-w-xl mx-auto leading-relaxed">
                Answer-first guides to the questions amateur and masters
                cyclists ask most — grounded in 1,400+ on-the-record
                conversations with World Tour coaches, sports scientists, and
                pro riders.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        <Section background="charcoal">
          <Container width="narrow">
            <div className="space-y-12">
              {QUESTION_CLUSTERS.map((cluster) => {
                const questions = getQuestionsByCluster(cluster.id);
                if (questions.length === 0) return null;

                return (
                  <div key={cluster.id}>
                    <ScrollReveal direction="up" className="mb-5">
                      <h2 className="font-heading text-off-white text-2xl mb-2">
                        {cluster.label.toUpperCase()}
                      </h2>
                      <p className="text-foreground-muted text-sm leading-relaxed">
                        {cluster.description}
                      </p>
                    </ScrollReveal>

                    <div className="space-y-3">
                      {questions.map((q, i) => (
                        <ScrollReveal
                          key={q.slug}
                          direction="up"
                          delay={i * 0.03}
                        >
                          <Link
                            href={`/question/${q.slug}`}
                            className="block group"
                          >
                            <Card className="p-5 transition-all group-hover:border-coral/30">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <h3 className="font-heading text-base text-off-white group-hover:text-coral transition-colors">
                                      {q.question}
                                    </h3>
                                    <Badge pillar={q.pillar} size="sm" />
                                  </div>
                                  <p className="text-foreground-muted text-sm leading-relaxed">
                                    {q.seoDescription}
                                  </p>
                                </div>
                                <span className="text-coral shrink-0 mt-1">
                                  →
                                </span>
                              </div>
                            </Card>
                          </Link>
                        </ScrollReveal>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Container>
        </Section>

        <Section background="deep-purple" grain className="!py-14">
          <Container width="narrow" className="text-center">
            <ScrollReveal direction="up">
              <p className="font-heading text-coral text-xs tracking-widest mb-3">
                STILL HAVEN&apos;T FOUND YOUR ANSWER?
              </p>
              <p className="text-off-white font-heading text-xl mb-4">
                Ask Roadman — the on-site cycling performance assistant.
              </p>
              <Link
                href="/ask"
                className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm transition-all"
                data-track="question_index_ask"
              >
                Ask a Question →
              </Link>
            </ScrollReveal>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
