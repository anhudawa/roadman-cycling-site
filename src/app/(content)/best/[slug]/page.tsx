import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Card, ScrollReveal, Badge, Button } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { ShortAnswer } from "@/components/features/aeo/ShortAnswer";
import { SourceMethodology } from "@/components/features/aeo/SourceMethodology";
import { AskRoadmanCTA } from "@/components/features/aeo/AskRoadmanCTA";
import { ENTITY_IDS, SITE_ORIGIN } from "@/lib/brand-facts";
import { getBestForBySlug, getAllBestForSlugs } from "@/lib/best-for";
import { queryContentGraph } from "@/lib/content-graph";

/**
 * Synthesise an extractable answer for "best X for Y" queries from the
 * top pick. Rather than the long marketing intro, AI crawlers and voice
 * search land on a single sentence: who the top pick is and who it suits.
 */
function buildBestShortAnswer(p: {
  title: string;
  shortAnswer?: string;
  picks: { name: string; verdict: string; bestFor: string }[];
}): string {
  if (p.shortAnswer) return p.shortAnswer;
  const top = p.picks[0];
  if (!top) return p.title;
  return `Top pick: ${top.name}. ${top.verdict}. Best for: ${top.bestFor}.`;
}

export function generateStaticParams() {
  return getAllBestForSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getBestForBySlug(slug);
  if (!page) return { title: "Not Found" };

  return {
    title: page.seoTitle,
    description: page.seoDescription,
    alternates: { canonical: `https://roadmancycling.com/best/${slug}` },
  };
}

export default async function BestForPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getBestForBySlug(slug);
  if (!page) notFound();

  const shortAnswer = buildBestShortAnswer(page);
  const pageUrl = `${SITE_ORIGIN}/best/${slug}`;
  const graph = queryContentGraph({ pillar: page.pillar, limit: 2 });
  const sourceEpisodes = graph.episodes.slice(0, 2).map((ep) => ({
    title: ep.title,
    href: `/podcast/${ep.slug}`,
  }));
  const sourceArticles = graph.articles.slice(0, 2).map((a) => ({
    title: a.title,
    href: `/blog/${a.slug}`,
  }));

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: page.title,
          description: page.seoDescription,
          url: pageUrl,
          numberOfItems: page.picks.length,
          itemListElement: page.picks.map((pick, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: pick.name,
            description: pick.verdict,
            ...(pick.officialUrl
              ? {
                  item: {
                    "@type": "SoftwareApplication",
                    name: pick.name,
                    url: pick.officialUrl,
                    applicationCategory: "SportsApplication",
                  },
                }
              : {}),
          })),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "@id": pageUrl,
              name: page.title,
              description: page.seoDescription,
              url: pageUrl,
              isPartOf: { "@id": ENTITY_IDS.website },
              mainEntity: { "@id": `${pageUrl}#article` },
              speakable: {
                "@type": "SpeakableSpecification",
                cssSelector: ["h1", ".short-answer", ".best-intro"],
              },
            },
            {
              "@type": "Article",
              "@id": `${pageUrl}#article`,
              headline: page.title,
              description: page.seoDescription,
              mainEntityOfPage: { "@id": pageUrl },
              author: { "@id": ENTITY_IDS.person },
              publisher: { "@id": ENTITY_IDS.organization },
              datePublished: page.lastReviewed ?? "2026-04-30",
              dateModified: page.lastReviewed ?? "2026-04-30",
              articleSection: page.pillar,
              about: page.picks.map((pick) => ({
                "@type": "SoftwareApplication",
                name: pick.name,
                ...(pick.officialUrl ? { url: pick.officialUrl } : {}),
              })),
            },
          ],
        }}
      />
      {page.faq.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: page.faq.map((f) => ({
              "@type": "Question",
              name: f.question,
              acceptedAnswer: { "@type": "Answer", text: f.answer },
            })),
          }}
        />
      )}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://roadmancycling.com" },
            { "@type": "ListItem", position: 2, name: "Best", item: "https://roadmancycling.com/best" },
            { "@type": "ListItem", position: 3, name: page.title, item: pageUrl },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-14">
          <Container width="narrow">
            <ScrollReveal direction="up" eager>
              <Badge pillar={page.pillar} size="md" />
              <h1
                className="font-heading text-off-white mt-4 mb-6"
                style={{ fontSize: "var(--text-hero)" }}
              >
                {page.title.toUpperCase()}
              </h1>
              <p className="best-intro text-foreground-muted text-lg leading-relaxed max-w-2xl mb-6">
                {page.intro}
              </p>
              {/* Answer-first block — surfaces the top pick + who it suits
                  in one sentence so AI crawlers and voice search lift the
                  recommendation, not the marketing intro. */}
              <ShortAnswer
                text={shortAnswer}
                pillar={page.pillar}
                heading="THE SHORT ANSWER"
              />
              {page.disclosure && (
                <div className="mt-6 rounded-xl border border-coral/25 bg-coral/[0.08] p-4 text-sm leading-relaxed text-foreground-muted">
                  <span className="font-heading tracking-wider text-coral">
                    COMMERCIAL DISCLOSURE: {" "}
                  </span>
                  {page.disclosure}
                </div>
              )}
            </ScrollReveal>
          </Container>
        </Section>

        {page.criteria && page.criteria.length > 0 && (
          <Section background="off-white">
            <Container width="narrow">
              <ScrollReveal direction="up" className="mb-8">
                <p className="font-heading text-xs tracking-widest text-coral">
                  HOW WE JUDGED THE OPTIONS
                </p>
                <h2
                  className="mt-3 font-heading text-charcoal"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  CHOOSE THE DECISION, NOT THE LONGEST FEATURE LIST
                </h2>
              </ScrollReveal>
              <div className="grid gap-4 md:grid-cols-2">
                {page.criteria.map((criterion, index) => (
                  <ScrollReveal
                    key={criterion.title}
                    direction="up"
                    delay={index * 0.04}
                  >
                    <div className="h-full rounded-xl border border-charcoal/10 bg-white p-5 shadow-sm">
                      <h3 className="font-heading text-xl text-charcoal">
                        {criterion.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-charcoal/70">
                        {criterion.description}
                      </p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </Container>
          </Section>
        )}

        <Section background="charcoal">
          <Container width="narrow">
            <div className="space-y-4">
              {page.picks.map((pick, i) => (
                <ScrollReveal key={pick.name} direction="up" delay={i * 0.05}>
                  <Card className="p-6" hoverable={false}>
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 w-10 h-10 rounded-full bg-coral/20 flex items-center justify-center">
                        <span className="font-heading text-coral text-lg">{i + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h2 className="font-heading text-off-white text-xl mb-1">{pick.name}</h2>
                        <p className="text-coral text-sm font-heading tracking-wider mb-2">{pick.verdict.toUpperCase()}</p>
                        <p className="text-foreground-muted text-sm leading-relaxed mb-3">{pick.bestFor}</p>
                        {pick.strength && (
                          <p className="text-foreground-muted text-sm leading-relaxed mb-3">
                            <span className="font-semibold text-off-white">Why it fits: </span>
                            {pick.strength}
                          </p>
                        )}
                        {pick.limitation && (
                          <p className="text-foreground-subtle text-sm leading-relaxed mb-4">
                            <span className="font-semibold text-foreground-muted">Watch-out: </span>
                            {pick.limitation}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-x-5 gap-y-2">
                          <Link href={pick.href} className="text-coral hover:text-coral/80 text-sm transition-colors">
                            Roadman context →
                          </Link>
                          {pick.officialUrl && (
                            <a
                              href={pick.officialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-foreground-muted hover:text-coral text-sm transition-colors"
                            >
                              Verify on official site ↗
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {page.sections && page.sections.length > 0 && (
          <Section background="off-white">
            <Container width="narrow">
              <div className="space-y-12">
                {page.sections.map((section) => (
                  <ScrollReveal key={section.heading} direction="up">
                    <h2
                      className="font-heading text-charcoal"
                      style={{ fontSize: "var(--text-section)" }}
                    >
                      {section.heading}
                    </h2>
                    <div className="mt-5 space-y-4">
                      {section.paragraphs.map((paragraph) => (
                        <p
                          key={paragraph}
                          className="text-base leading-relaxed text-charcoal/75 md:text-lg"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </Container>
          </Section>
        )}

        {page.related && page.related.length > 0 && (
          <Section background="charcoal">
            <Container width="narrow">
              <ScrollReveal direction="up" className="mb-8">
                <p className="font-heading text-xs tracking-widest text-coral">
                  NEXT DECISION
                </p>
                <h2
                  className="mt-3 font-heading text-off-white"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  NARROW THE SEARCH JOB
                </h2>
              </ScrollReveal>
              <div className="grid gap-4 md:grid-cols-2">
                {page.related.map((item) => (
                  <Link key={item.href} href={item.href} className="group">
                    <Card className="h-full p-5">
                      <h3 className="font-heading text-xl text-off-white transition-colors group-hover:text-coral">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
                        {item.description}
                      </p>
                    </Card>
                  </Link>
                ))}
              </div>
            </Container>
          </Section>
        )}

        {page.appCta && (
          <Section background="deep-purple" grain className="!py-16">
            <Container width="narrow" className="text-center">
              <ScrollReveal direction="up">
                <p className="font-heading text-xs tracking-widest text-coral">
                  {page.appCta.eyebrow}
                </p>
                <h2 className="mt-3 font-heading text-3xl text-off-white md:text-4xl">
                  {page.appCta.heading}
                </h2>
                <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-foreground-muted">
                  {page.appCta.body}
                </p>
                <div className="mt-7">
                  <Button href="/app" size="lg" dataTrack={`best_${slug}_app`}>
                    Join App Early Access
                  </Button>
                </div>
              </ScrollReveal>
            </Container>
          </Section>
        )}

        {page.faq.length > 0 && (
          <Section background="deep-purple" grain>
            <Container width="narrow">
              <ScrollReveal direction="up" className="mb-8">
                <h2 className="font-heading text-off-white" style={{ fontSize: "var(--text-section)" }}>
                  FAQ
                </h2>
              </ScrollReveal>
              <div className="space-y-4">
                {page.faq.map((f) => (
                  <ScrollReveal key={f.question} direction="up">
                    <Card className="p-5" hoverable={false}>
                      <h3 className="font-heading text-off-white text-base mb-2">{f.question}</h3>
                      <p className="text-foreground-muted text-sm leading-relaxed">{f.answer}</p>
                    </Card>
                  </ScrollReveal>
                ))}
              </div>
            </Container>
          </Section>
        )}

        {!page.appCta && (
          <Section background="charcoal" className="!py-14">
            <Container width="narrow" className="text-center">
              <ScrollReveal direction="up">
                <p className="font-heading text-coral text-xs tracking-widest mb-3">NOT SURE WHICH TO CHOOSE?</p>
                <p className="text-off-white font-heading text-xl mb-4">A coach removes the guesswork.</p>
                <Button href="/apply" size="lg" dataTrack={`best_${slug}_apply`}>
                  Apply for Coaching
                </Button>
              </ScrollReveal>
            </Container>
          </Section>
        )}

        {/* Source + methodology + Ask handoff */}
        <Section background="deep-purple" grain className="!py-14">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <SourceMethodology
                methodology={page.methodology ?? `Picks are ranked by fit-to-rider, not affiliate revenue. We weight personalisation, time-efficiency, and accountability for amateur cyclists. Where reasonable people disagree, we say so.`}
                episodes={page.officialSources ? undefined : sourceEpisodes}
                articles={page.officialSources ? undefined : sourceArticles}
                research={page.officialSources}
                lastReviewed={page.lastReviewed}
              />
              <AskRoadmanCTA
                topic={page.title}
                question={`I'm trying to choose for: "${page.title}". What fits my situation best?`}
                source={`best-${slug}`}
                heading="STILL DECIDING?"
              />
            </ScrollReveal>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
