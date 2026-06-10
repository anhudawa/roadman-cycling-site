import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer, Section, Container } from "@/components/layout";
import { JsonLd } from "@/components/seo/JsonLd";
import { SourceMethodology } from "@/components/features/aeo/SourceMethodology";
import { AskRoadmanCTA } from "@/components/features/aeo/AskRoadmanCTA";
import { getProblemBySlug, getAllProblemSlugs } from "@/lib/problems";
import { getEpisodeBySlug } from "@/lib/podcast";
import { queryContentGraph } from "@/lib/content-graph";
import {
  DiagnosisTemplate,
  type DiagnosisCause,
  type DiagnosisFix,
} from "@/components/templates";

/**
 * Build a short, extractable answer from the structured problem-page
 * data. The page already declares the most-likely cause (causes[0]) and
 * the canonical fix (solutions[0]) — combining them produces a 1-2
 * sentence direct answer that AI crawlers can lift verbatim without
 * having to read the whole page.
 */
function buildProblemShortAnswer(p: {
  problem: string;
  causes: string[];
  solutions: { title: string; description: string }[];
}): string {
  const cause = p.causes[0];
  const fix = p.solutions[0];
  if (cause && fix) {
    return `Most often, this is because ${cause.charAt(0).toLowerCase() + cause.slice(1)}. The fix: ${fix.title.toLowerCase()} — ${fix.description.toLowerCase()}.`;
  }
  if (fix) {
    return `${fix.title}: ${fix.description}`;
  }
  return p.problem;
}

export function generateStaticParams() {
  return getAllProblemSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getProblemBySlug(slug);
  if (!page) return { title: "Not Found" };

  return {
    title: page.seoTitle,
    description: page.seoDescription,
    alternates: { canonical: `https://roadmancycling.com/problem/${slug}` },
  };
}

export default async function ProblemPageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getProblemBySlug(slug);
  if (!page) notFound();

  const shortAnswer = buildProblemShortAnswer(page);
  const graph = queryContentGraph({ pillar: page.pillar, limit: 2 });
  const sourceEpisodes = graph.episodes.slice(0, 2).map((ep) => ({
    title: ep.title,
    href: `/podcast/${ep.slug}`,
  }));
  const sourceArticles = graph.articles.slice(0, 2).map((a) => ({
    title: a.title,
    href: `/blog/${a.slug}`,
  }));

  const causes: DiagnosisCause[] = page.causes.map((c) => ({ body: c }));
  const fixes: DiagnosisFix[] = page.solutions.map((s) => ({
    title: s.title,
    description: s.description,
    href: s.href,
  }));

  // Named-expert evidence — resolve the linked episode title server-side so
  // the "Hear it" link only renders when the episode actually exists.
  const evidence = page.expertEvidence;
  const evidenceEpisode = evidence
    ? getEpisodeBySlug(evidence.episodeSlug)
    : null;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: page.title,
          description: page.seoDescription,
          url: `https://roadmancycling.com/problem/${slug}`,
          speakable: {
            "@type": "SpeakableSpecification",
            cssSelector: ["h1", ".short-answer", ".problem-description"],
          },
        }}
      />
      {/* QAPage schema — flags this template to crawlers as a structured
          question/answer pair. Helps AI engines like Perplexity and ChatGPT
          treat the page as a citation-worthy answer rather than an article. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "QAPage",
          mainEntity: {
            "@type": "Question",
            name: page.title,
            text: page.problem,
            answerCount: 1,
            acceptedAnswer: {
              "@type": "Answer",
              text: shortAnswer,
              url: `https://roadmancycling.com/problem/${slug}`,
              // When the page carries named-expert evidence, cite the source
              // podcast episode so crawlers can see the answer is backed by a
              // real, attributable conversation rather than generic text.
              ...(evidence && evidenceEpisode
                ? {
                    citation: {
                      "@type": "CreativeWork",
                      name: evidenceEpisode.title,
                      url: `https://roadmancycling.com/podcast/${evidence.episodeSlug}`,
                      author: {
                        "@type": "Person",
                        name: evidence.name,
                        url: `https://roadmancycling.com/guests/${evidence.guestSlug}`,
                      },
                    },
                  }
                : {}),
            },
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://roadmancycling.com" },
            { "@type": "ListItem", position: 2, name: page.title, item: `https://roadmancycling.com/problem/${slug}` },
          ],
        }}
      />

      <Header />

      <DiagnosisTemplate
        title={page.title}
        pillar={page.pillar}
        problem={page.problem}
        shortAnswer={shortAnswer}
        causes={causes}
        fixes={fixes}
        tool={
          page.toolHref
            ? { href: page.toolHref, label: page.toolLabel || "Try the free tool" }
            : undefined
        }
        source={`problem-${slug}`}
      />

      {/* Named-expert evidence — a verified podcast guest with credential,
          a relevant episode link, and grounded advice. Mirrors the
          answer-page pattern and is what turns these diagnostic pages from
          thin templates into attributed, citation-worthy content. */}
      {evidence && (
        <Section background="deep-purple" grain className="!py-12 border-t border-white/5">
          <Container width="narrow">
            <p className="font-heading text-coral text-xs tracking-[0.3em] mb-3">
              EXPERT EVIDENCE
            </p>
            <h2 className="font-heading text-off-white text-2xl mb-6">
              WHAT THE EXPERTS SAY
            </h2>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
              <div className="flex flex-wrap items-baseline gap-x-2 mb-2">
                <Link
                  href={`/guests/${evidence.guestSlug}`}
                  className="font-heading text-off-white hover:text-coral transition-colors"
                >
                  {evidence.name}
                </Link>
                <span className="text-foreground-subtle text-xs">
                  {evidence.credential}
                </span>
              </div>
              <p className="text-foreground-muted text-sm md:text-base leading-relaxed m-0">
                {evidence.insight}
              </p>
              {evidenceEpisode && (
                <Link
                  href={`/podcast/${evidence.episodeSlug}`}
                  className="inline-flex items-center gap-1 mt-3 text-coral text-sm hover:text-coral/80 transition-colors"
                >
                  Hear it: {evidenceEpisode.title}
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              )}
            </div>
          </Container>
        </Section>
      )}

      {(sourceEpisodes.length > 0 || sourceArticles.length > 0) && (
        <Section background="charcoal" className="!py-12 border-t border-white/5">
          <Container width="narrow">
            <SourceMethodology
              methodology={`This page draws on ${page.pillar} content from the Roadman Cycling Podcast and our written guides. The diagnosis pattern reflects what we see most often in the coaching community — adjusted for serious amateur and masters cyclists.`}
              episodes={sourceEpisodes}
              articles={sourceArticles}
            />
          </Container>
        </Section>
      )}

      <Section background="deep-purple" grain className="!py-12">
        <Container width="narrow">
          <AskRoadmanCTA
            topic={page.title}
            source={`problem-${slug}`}
          />
        </Container>
      </Section>

      <Footer />
    </>
  );
}
