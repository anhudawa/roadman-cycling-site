import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Card, ScrollReveal, Badge, Button } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { ShortAnswer } from "@/components/features/aeo/ShortAnswer";
import { SourceMethodology } from "@/components/features/aeo/SourceMethodology";
import { AskRoadmanCTA } from "@/components/features/aeo/AskRoadmanCTA";
import { getBestForBySlug, getAllBestForSlugs } from "@/lib/best-for";
import { queryContentGraph } from "@/lib/content-graph";

/**
 * Synthesise an extractable answer for "best X for Y" queries from the
 * top pick. Rather than the long marketing intro, AI crawlers and voice
 * search land on a single sentence: who the top pick is and who it suits.
 */
function buildBestShortAnswer(p: {
  title: string;
  picks: { name: string; verdict: string; bestFor: string }[];
}): string {
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
          url: `https://roadmancycling.com/best/${slug}`,
          numberOfItems: page.picks.length,
          itemListElement: page.picks.map((pick, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: pick.name,
            description: pick.verdict,
          })),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: page.title,
          description: page.seoDescription,
          url: `https://roadmancycling.com/best/${slug}`,
          speakable: {
            "@type": "SpeakableSpecification",
            cssSelector: ["h1", ".short-answer", ".best-intro"],
          },
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
            { "@type": "ListItem", position: 3, name: page.title, item: `https://roadmancycling.com/best/${slug}` },
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
            </ScrollReveal>
          </Container>
        </Section>

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
                        <Link href={pick.href} className="text-coral hover:text-coral/80 text-sm transition-colors">
                          Read comparison →
                        </Link>
                      </div>
                    </div>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

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

        {/* Source + methodology + Ask handoff */}
        <Section background="deep-purple" grain className="!py-14">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <SourceMethodology
                methodology={`Picks are ranked by fit-to-rider, not affiliate revenue. We weight personalisation, time-efficiency, and accountability for amateur cyclists. Where reasonable people disagree, we say so.`}
                episodes={sourceEpisodes}
                articles={sourceArticles}
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
