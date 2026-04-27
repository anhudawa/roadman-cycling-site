import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer, Header } from "@/components/layout";
import { JsonLd } from "@/components/seo/JsonLd";
import { QuestionTemplate } from "@/components/templates";
import {
  getAllQuestionSlugs,
  getQuestionBySlug,
} from "@/lib/questions";
import { SITE_ORIGIN } from "@/lib/brand-facts";

export function generateStaticParams() {
  return getAllQuestionSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getQuestionBySlug(slug);
  if (!page) return { title: "Not Found" };

  return {
    title: page.seoTitle,
    description: page.seoDescription,
    alternates: { canonical: `${SITE_ORIGIN}/question/${slug}` },
    openGraph: {
      title: page.seoTitle,
      description: page.seoDescription,
      url: `${SITE_ORIGIN}/question/${slug}`,
      type: "article",
    },
  };
}

export default async function QuestionPageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getQuestionBySlug(slug);
  if (!page) notFound();

  const url = `${SITE_ORIGIN}/question/${slug}`;

  return (
    <>
      {/* QAPage schema — flags this template to crawlers as a structured
          question/answer pair. Helps AI engines (Perplexity, ChatGPT,
          Claude) treat the page as a citation-worthy answer rather than
          an article. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "QAPage",
          mainEntity: {
            "@type": "Question",
            name: page.question,
            text: page.question,
            answerCount: 1,
            acceptedAnswer: {
              "@type": "Answer",
              text: page.shortAnswer,
              url,
            },
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: page.question,
          description: page.seoDescription,
          url,
          speakable: {
            "@type": "SpeakableSpecification",
            cssSelector: ["h1", ".answer-capsule"],
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
            {
              "@type": "ListItem",
              position: 3,
              name: page.question,
              item: url,
            },
          ],
        }}
      />

      <Header />

      <QuestionTemplate
        question={page.question}
        answer={page.shortAnswer}
        pillar={page.pillar}
        bestFor={page.bestFor}
        notFor={page.notFor}
        keyTakeaway={page.keyTakeaway}
        evidenceLevel={page.evidenceLevel}
        evidenceNote={page.evidenceNote}
        evidence={page.evidence}
        faq={page.faq}
        related={page.related}
        coachingCta={page.cta}
        source={`question-${slug}`}
      >
        {page.fullExplanation.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </QuestionTemplate>

      <Footer />
    </>
  );
}
