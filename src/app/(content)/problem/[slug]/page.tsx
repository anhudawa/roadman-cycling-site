import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header, Footer, Section, Container } from "@/components/layout";
import { JsonLd } from "@/components/seo/JsonLd";
import { SourceMethodology } from "@/components/features/aeo/SourceMethodology";
import { AskRoadmanCTA } from "@/components/features/aeo/AskRoadmanCTA";
import { getProblemBySlug, getAllProblemSlugs } from "@/lib/problems";
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
