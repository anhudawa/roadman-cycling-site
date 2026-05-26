import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer, Section, Container } from "@/components/layout";
import { ScrollReveal, Card, Badge, Button } from "@/components/ui";
import { JsonLd, FAQPageJsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { PlateauCTA } from "@/components/cta";
import { SITE_ORIGIN } from "@/lib/brand-facts";
import {
  getAllExpertTopicPairs,
  getExpertTopicPage,
  TOPIC_HUB_TITLES,
} from "@/lib/experts";

export async function generateStaticParams() {
  return getAllExpertTopicPairs().map(({ expertSlug, topicSlug }) => ({
    expertSlug,
    topicSlug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ expertSlug: string; topicSlug: string }>;
}): Promise<Metadata> {
  const { expertSlug, topicSlug } = await params;
  const page = getExpertTopicPage(expertSlug, topicSlug);
  if (!page) return { title: "Not Found" };

  const { expert, topic } = page;
  const url = `${SITE_ORIGIN}/experts/${expertSlug}/${topicSlug}`;
  const title = `${expert.name} on ${topic.label}`;
  const description = `What does ${expert.name} say about ${topic.phrase}? ${
    expert.credential ? `${expert.credential}. ` : ""
  }Direct quotes, key positions and podcast episodes — on the record.`.slice(
    0,
    158,
  );

  return {
    title: `${title} | Roadman Cycling`,
    description,
    keywords: [
      `${expert.name} ${topic.label.toLowerCase()}`,
      `${expert.name} ${topic.phrase}`,
      `what does ${expert.name.toLowerCase()} say about ${topic.label.toLowerCase()}`,
      ...topic.aliases,
    ],
    alternates: { canonical: url },
    openGraph: {
      title: `${title} — The Roadman Cycling Podcast`,
      description,
      type: "article",
      url,
    },
  };
}

export default async function ExpertTopicPage({
  params,
}: {
  params: Promise<{ expertSlug: string; topicSlug: string }>;
}) {
  const { expertSlug, topicSlug } = await params;
  const page = getExpertTopicPage(expertSlug, topicSlug);

  if (!page) {
    notFound();
  }

  const {
    expert,
    topic,
    question,
    summary,
    enrichment,
    keyPositions,
    quotes,
    episodes,
    faqs,
    relatedTopics,
    relatedExperts,
  } = page;

  const pageUrl = `${SITE_ORIGIN}/experts/${expertSlug}/${topicSlug}`;
  const personId = `${SITE_ORIGIN}/guests/${expertSlug}#person`;
  const override = expert.override;
  const parentHubTitle = TOPIC_HUB_TITLES[topic.parentHub];

  return (
    <>
      {/* Person schema — anchored to the canonical guest Person @id so this
          page reinforces the same Knowledge Graph entity rather than
          minting a duplicate. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          "@id": personId,
          name: expert.name,
          ...(expert.credential && { jobTitle: expert.credential }),
          description: expert.bio,
          url: `${SITE_ORIGIN}/guests/${expertSlug}`,
          ...(override?.image && { image: override.image }),
          ...(override?.sameAs &&
            override.sameAs.length > 0 && { sameAs: override.sameAs }),
          ...(override?.worksFor && {
            worksFor: {
              "@type": override.worksFor.type,
              name: override.worksFor.name,
              ...(override.worksFor.url && { url: override.worksFor.url }),
            },
          }),
          knowsAbout: [
            topic.phrase,
            topic.label,
            ...topic.aliases,
          ],
        }}
      />

      {/* QAPage + speakable — the page is a direct answer to a named query,
          and `speakable` points voice assistants at the answer. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "QAPage",
          "@id": `${pageUrl}#qapage`,
          url: pageUrl,
          name: question,
          speakable: {
            "@type": "SpeakableSpecification",
            cssSelector: [".expert-answer"],
          },
          mainEntity: {
            "@type": "Question",
            name: question,
            answerCount: 1,
            acceptedAnswer: {
              "@type": "Answer",
              text: summary,
              url: pageUrl,
              author: { "@id": personId },
            },
          },
        }}
      />

      {/* Quotation nodes — each attributed to the expert and cited to the
          episode it came from. Rich-result eligible and AI-extractable. */}
      {quotes.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": quotes.map((q) => ({
              "@type": "Quotation",
              text: q.text,
              spokenByCharacter: {
                "@type": "Person",
                "@id": personId,
                name: expert.name,
              },
              creator: { "@id": personId },
              isPartOf: {
                "@type": "PodcastEpisode",
                "@id": `${SITE_ORIGIN}/podcast/${q.episodeSlug}#episode`,
                name: q.episodeTitle,
                url: `${SITE_ORIGIN}/podcast/${q.episodeSlug}`,
              },
            })),
          }}
        />
      )}

      <FAQPageJsonLd questions={faqs} />

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
            {
              "@type": "ListItem",
              position: 3,
              name: expert.name,
              item: `${SITE_ORIGIN}/experts/${expertSlug}`,
            },
            {
              "@type": "ListItem",
              position: 4,
              name: topic.label,
              item: pageUrl,
            },
          ],
        }}
      />

      <Header />

      <main id="main-content" data-enrichment-status={enrichment}>
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow">
            <Breadcrumbs
              items={[
                { label: "Experts", href: "/experts" },
                { label: expert.name, href: `/experts/${expertSlug}` },
                { label: topic.label },
              ]}
            />
          </Container>
          <Container width="narrow" className="text-center">
            <ScrollReveal direction="up">
              <p className="text-coral font-heading text-lg mb-4 tracking-widest">
                EXPERT INSIGHT · {topic.label.toUpperCase()}
              </p>
              <h1 className="font-heading text-off-white text-3xl md:text-5xl leading-tight mb-5">
                {question.toUpperCase()}
              </h1>
              {expert.credential && (
                <p className="text-foreground-muted text-base md:text-lg mb-6">
                  {expert.credential}
                </p>
              )}
              <div className="flex items-center justify-center gap-3 text-sm text-foreground-subtle flex-wrap">
                <Link
                  href={`/guests/${expertSlug}`}
                  className="hover:text-coral transition-colors underline underline-offset-4 decoration-white/20"
                >
                  Full profile
                </Link>
                <span>&middot;</span>
                <span>
                  {expert.episodeCount} episode
                  {expert.episodeCount > 1 ? "s" : ""}
                </span>
                <span>&middot;</span>
                <div className="flex gap-2">
                  {expert.pillars.map((pillar) => (
                    <Badge key={pillar} pillar={pillar} size="sm" />
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* The answer — editorial summary in Roadman's voice */}
        <Section background="charcoal" className="!pt-12 !pb-8">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <p className="font-heading text-coral text-xs tracking-widest mb-4">
                THE SHORT ANSWER
              </p>
              <p className="expert-answer text-off-white text-lg md:text-xl leading-relaxed">
                {summary}
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Who is the expert — entity context */}
        {(override?.whyMatters || override?.description) && (
          <Section background="charcoal" className="!pt-4 !pb-8">
            <Container width="narrow">
              <ScrollReveal direction="up">
                <h2 className="font-heading text-off-white mb-4 text-2xl tracking-wide">
                  WHO IS {expert.name.toUpperCase()}?
                </h2>
                <p className="text-foreground-muted text-base leading-relaxed">
                  {override?.whyMatters ?? override?.description}
                </p>
              </ScrollReveal>
            </Container>
          </Section>
        )}

        {/* Key positions — citable claims filtered to the topic */}
        {keyPositions.length > 0 && (
          <Section background="charcoal" className="!pt-4 !pb-8">
            <Container width="narrow">
              <ScrollReveal direction="up">
                <h2 className="font-heading text-off-white mb-2 text-2xl tracking-wide">
                  {expert.lastName.toUpperCase()} ON {topic.label.toUpperCase()}
                </h2>
                <p className="text-sm text-foreground-muted mb-6">
                  {expert.lastName}&rsquo;s key positions on {topic.phrase}.
                </p>
                <ul className="space-y-3">
                  {keyPositions.map((idea, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-foreground-muted text-base leading-relaxed"
                    >
                      <span
                        aria-hidden="true"
                        className="text-coral font-heading shrink-0"
                      >
                        &rarr;
                      </span>
                      <span>{idea}</span>
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
            </Container>
          </Section>
        )}

        {/* Direct quotes */}
        {quotes.length > 0 && (
          <Section background="charcoal" className="!pt-4 !pb-8">
            <Container width="narrow">
              <ScrollReveal direction="up">
                <h2 className="font-heading text-off-white mb-2 text-2xl tracking-wide">
                  IN {expert.lastName.toUpperCase()}&rsquo;S OWN WORDS
                </h2>
                <p className="text-sm text-foreground-muted mb-6">
                  Verbatim from {expert.name}&rsquo;s appearances on the
                  podcast.
                </p>
                <div className="space-y-4">
                  {quotes.map((q, i) => (
                    <blockquote
                      key={i}
                      className="rounded-xl border-l-4 border-l-coral bg-white/[0.03] p-5"
                    >
                      <p className="text-foreground-muted text-base leading-relaxed italic">
                        &ldquo;{q.text}&rdquo;
                      </p>
                      <footer className="mt-3 text-xs text-foreground-subtle">
                        &mdash; {expert.name}
                        {q.credential && `, ${q.credential}`} ·{" "}
                        <Link
                          href={`/podcast/${q.episodeSlug}`}
                          className="hover:text-coral transition-colors underline underline-offset-2 decoration-white/20"
                        >
                          {q.episodeTitle}
                        </Link>
                      </footer>
                    </blockquote>
                  ))}
                </div>
              </ScrollReveal>
            </Container>
          </Section>
        )}

        {/* Episodes */}
        {episodes.length > 0 && (
          <Section background="charcoal" className="!pt-4 !pb-8">
            <Container width="narrow">
              <ScrollReveal direction="up">
                <h2 className="font-heading text-off-white mb-2 text-2xl tracking-wide">
                  HEAR IT ON THE PODCAST
                </h2>
                <p className="text-sm text-foreground-muted mb-6">
                  Episodes where {expert.name} covers {topic.phrase} and
                  related ground.
                </p>
              </ScrollReveal>
              <div className="space-y-4">
                {episodes.map((ep, i) => (
                  <ScrollReveal key={ep.slug} direction="up" delay={i * 0.05}>
                    <Link href={`/podcast/${ep.slug}`} className="block group">
                      <Card className="p-6 transition-all group-hover:border-coral/30">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge pillar={ep.pillar} size="sm" />
                            </div>
                            <h3 className="font-heading text-lg text-off-white group-hover:text-coral transition-colors leading-snug">
                              {ep.title}
                            </h3>
                            <p className="text-sm text-foreground-subtle mt-2 line-clamp-2">
                              {ep.description}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs text-foreground-subtle">
                              {ep.duration}
                            </span>
                            <br />
                            <time
                              className="text-xs text-foreground-subtle"
                              dateTime={ep.publishDate}
                            >
                              {new Date(ep.publishDate).toLocaleDateString(
                                "en-GB",
                                { day: "numeric", month: "short", year: "numeric" },
                              )}
                            </time>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            </Container>
          </Section>
        )}

        {/* FAQ */}
        {faqs.length > 0 && (
          <Section background="charcoal" className="!pt-4 !pb-8">
            <Container width="narrow">
              <ScrollReveal direction="up">
                <h2 className="font-heading text-off-white mb-6 text-2xl tracking-wide">
                  FREQUENTLY ASKED
                </h2>
                <div className="space-y-3">
                  {faqs.map((f, i) => (
                    <details
                      key={i}
                      className="group rounded-xl border border-white/10 bg-white/[0.03] p-5"
                    >
                      <summary className="cursor-pointer list-none font-heading text-off-white tracking-wide flex items-center justify-between gap-4">
                        <span>{f.question}</span>
                        <span
                          aria-hidden="true"
                          className="text-coral shrink-0 transition-transform group-open:rotate-45"
                        >
                          +
                        </span>
                      </summary>
                      <p className="mt-3 text-foreground-muted text-sm leading-relaxed">
                        {f.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </ScrollReveal>
            </Container>
          </Section>
        )}

        {/* Related topics + parent hub */}
        <Section background="charcoal" className="!pt-4 !pb-8">
          <Container width="narrow">
            {relatedTopics.length > 0 && (
              <div className="mb-10 text-center">
                <p className="font-heading text-coral text-xs tracking-widest mb-4">
                  MORE FROM {expert.lastName.toUpperCase()}
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {relatedTopics.map((t) => (
                    <Link
                      key={t.slug}
                      href={`/experts/${expertSlug}/${t.slug}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/15 hover:border-coral/40 bg-white/[0.04] hover:bg-white/[0.07] px-4 py-2 text-sm font-heading text-off-white tracking-wider transition-all"
                    >
                      On {t.label} &rarr;
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {parentHubTitle && (
              <div className="mb-10 text-center">
                <p className="font-heading text-coral text-xs tracking-widest mb-4">
                  EXPLORE THE TOPIC
                </p>
                <Link
                  href={`/topics/${topic.parentHub}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-coral/40 hover:border-coral bg-coral/10 hover:bg-coral/20 px-5 py-2.5 text-sm font-heading text-off-white tracking-wider transition-all"
                >
                  {parentHubTitle} — The Complete Guide &rarr;
                </Link>
              </div>
            )}

            {relatedExperts.length > 0 && (
              <div className="text-center">
                <p className="font-heading text-coral text-xs tracking-widest mb-4">
                  OTHER EXPERTS ON {topic.label.toUpperCase()}
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {relatedExperts.map((e) => (
                    <Link
                      key={e.slug}
                      href={`/experts/${e.slug}/${topicSlug}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/15 hover:border-coral/40 bg-white/[0.04] hover:bg-white/[0.07] px-4 py-2 text-sm font-heading text-off-white tracking-wider transition-all"
                    >
                      {e.name} &rarr;
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </Container>
        </Section>

        {/* CTA */}
        <Section background="charcoal" className="!pt-4">
          <Container width="narrow">
            <PlateauCTA variant="inline" source={`expert-${expertSlug}-${topicSlug}`} />
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <Button href={`/experts/${expertSlug}`} variant="ghost">
                &larr; All {expert.lastName} Topics
              </Button>
              <Button href="/experts">Browse All Experts</Button>
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
