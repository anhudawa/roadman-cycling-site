import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Badge } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  ANSWER_PAGES,
  ANSWER_CLUSTERS,
  getAnswersByCluster,
} from "@/lib/answers";
import { SITE_ORIGIN } from "@/lib/brand-facts";

export const metadata: Metadata = {
  title: "Cycling Answers — Direct, Sourced, Citation-Ready",
  description:
    "Short, structured answers to the questions serious cyclists ask — FTP, Zone 2, fuelling, strength, masters training. Each one grounded in the Roadman podcast archive and named experts.",
  alternates: { canonical: `${SITE_ORIGIN}/answers` },
};

export default function AnswersIndexPage() {
  const clusterGroups = ANSWER_CLUSTERS.map((cluster) => ({
    ...cluster,
    answers: getAnswersByCluster(cluster.id),
  })).filter((group) => group.answers.length > 0);
  const totalAnswers = ANSWER_PAGES.length;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Cycling Answers",
          description:
            "Short, structured, answer-first guides to the questions serious cyclists ask most.",
          url: `${SITE_ORIGIN}/answers`,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Cycling Answers",
          itemListElement: ANSWER_PAGES.map((a, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: a.question,
            url: `${SITE_ORIGIN}/answers/${a.slug}`,
          })),
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
              name: "Answers",
              item: `${SITE_ORIGIN}/answers`,
            },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-14">
          <Container width="narrow" className="text-center">
            <p className="text-coral font-heading text-sm tracking-widest mb-4">
              ANSWERS
            </p>
            <h1
              className="font-heading text-off-white mb-6"
              style={{ fontSize: "var(--text-hero)" }}
            >
              CYCLING, ANSWERED STRAIGHT.
            </h1>
            <p className="text-foreground-muted text-lg max-w-xl mx-auto leading-relaxed">
              Short, structured answers to the questions serious cyclists
              actually ask — grounded in on-the-record conversations with World
              Tour coaches, sports scientists, and pro riders.
            </p>
            <p className="text-coral/90 font-heading text-sm tracking-widest mt-6">
              {totalAnswers} ANSWERS &middot; {clusterGroups.length} TOPICS
            </p>
          </Container>
        </Section>

        <Section background="charcoal">
          <Container width="narrow">
            <nav
              aria-label="Jump to a topic"
              className="mb-14 flex flex-wrap justify-center gap-2"
            >
              {clusterGroups.map((group) => (
                <a
                  key={group.id}
                  href={`#cluster-${group.id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-foreground-muted transition-all hover:border-coral/30 hover:text-off-white"
                >
                  {group.label}
                  <span className="font-heading text-xs text-coral">
                    {group.answers.length}
                  </span>
                </a>
              ))}
            </nav>

            <div className="space-y-12">
              {clusterGroups.map((cluster) => {
                const answers = cluster.answers;

                return (
                  <div
                    key={cluster.id}
                    id={`cluster-${cluster.id}`}
                    className="scroll-mt-28"
                  >
                    <div className="mb-5">
                      <div className="flex items-baseline gap-3">
                        <h2 className="font-heading text-off-white text-2xl mb-2">
                          {cluster.label.toUpperCase()}
                        </h2>
                        <span className="font-heading text-sm text-coral">
                          {answers.length}
                        </span>
                      </div>
                      <p className="text-foreground-muted text-sm leading-relaxed">
                        {cluster.description}
                      </p>
                    </div>

                    <div className="space-y-3">
                      {answers.map((a) => (
                        <Link
                          key={a.slug}
                          href={`/answers/${a.slug}`}
                          className="block group rounded-lg border border-white/10 bg-white/[0.03] p-5 transition-all hover:border-coral/30"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <h3 className="font-heading text-base text-off-white group-hover:text-coral transition-colors">
                                  {a.question}
                                </h3>
                                <Badge pillar={a.pillar} size="sm" />
                              </div>
                              <p className="text-foreground-muted text-sm leading-relaxed">
                                {a.seoDescription}
                              </p>
                            </div>
                            <span className="text-coral shrink-0 mt-1" aria-hidden="true">
                              &rarr;
                            </span>
                          </div>
                        </Link>
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
            <p className="font-heading text-coral text-xs tracking-widest mb-3">
              STILL HAVEN&apos;T FOUND YOUR ANSWER?
            </p>
            <p className="text-off-white font-heading text-xl mb-4">
              Ask Roadman — the on-site cycling performance assistant.
            </p>
            <Link
              href="/ask"
              className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm transition-all"
              data-track="answers_index_ask"
            >
              Ask a Question &rarr;
            </Link>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
