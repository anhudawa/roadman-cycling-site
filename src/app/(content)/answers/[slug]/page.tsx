import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer, Header } from "@/components/layout";
import { JsonLd } from "@/components/seo/JsonLd";
import { AnswerTemplate } from "@/components/templates";
import { getAllAnswerSlugs, getAnswerBySlug } from "@/lib/answers";
import { getEpisodeBySlug } from "@/lib/podcast";
import { getTopicTitleBySlug } from "@/lib/topics";
import { ENTITY_IDS, SITE_ORIGIN } from "@/lib/brand-facts";

export function generateStaticParams() {
  return getAllAnswerSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const answer = getAnswerBySlug(slug);
  if (!answer) return { title: "Answer Not Found" };

  const url = `${SITE_ORIGIN}/answers/${slug}`;
  return {
    title: answer.seoTitle,
    description: answer.seoDescription,
    alternates: { canonical: url },
    openGraph: {
      title: answer.seoTitle,
      description: answer.seoDescription,
      type: "article",
      url,
      publishedTime: answer.publishDate,
      modifiedTime: answer.updatedDate,
      authors: ["Anthony Walsh"],
    },
    twitter: {
      card: "summary_large_image",
      title: answer.seoTitle,
      description: answer.seoDescription,
    },
  };
}

export default async function AnswerPageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const answer = getAnswerBySlug(slug);
  if (!answer) notFound();

  const url = `${SITE_ORIGIN}/answers/${slug}`;

  // Resolve related episodes (drops any slug that no longer resolves).
  const relatedEpisodes = answer.relatedEpisodes
    .map((s) => {
      const ep = getEpisodeBySlug(s);
      return ep ? { title: ep.title, href: `/podcast/${ep.slug}` } : null;
    })
    .filter((e): e is { title: string; href: string } => e !== null)
    .slice(0, 4);

  // Episode-title lookup for the expert-evidence "hear it here" links —
  // covers expert episodeSlugs as well as the related-episode list.
  const episodeTitleBySlug: Record<string, string> = {};
  const referencedSlugs = new Set<string>([
    ...answer.relatedEpisodes,
    ...answer.expertEvidence
      .map((e) => e.episodeSlug)
      .filter((s): s is string => Boolean(s)),
  ]);
  for (const s of referencedSlugs) {
    const ep = getEpisodeBySlug(s);
    if (ep) episodeTitleBySlug[s] = ep.title;
  }

  // Parent topic hubs the answer points at — used to wire the Article into
  // the same topical Thing/CollectionPage nodes the hub pages emit.
  const parentTopics = answer.relatedTopics
    .filter((t) => t.href.startsWith("/topics/"))
    .map((t) => {
      const topicSlug = t.href.replace("/topics/", "").replace(/\/$/, "");
      return { slug: topicSlug, title: getTopicTitleBySlug(topicSlug) };
    })
    .filter((t): t is { slug: string; title: string } => Boolean(t.title));

  // mentions: cited experts (linked to their /guests/[slug]#person @id) plus
  // related podcast episodes (linked to /podcast/[slug]#episode @id).
  const expertMentions = answer.expertEvidence
    .filter((e) => e.guestSlug)
    .map((e) => ({
      "@type": "Person" as const,
      "@id": `${SITE_ORIGIN}/guests/${e.guestSlug}#person`,
      name: e.name,
      url: `${SITE_ORIGIN}/guests/${e.guestSlug}`,
    }));
  const episodeMentions = answer.relatedEpisodes
    .map((s) => getEpisodeBySlug(s))
    .filter((ep): ep is NonNullable<typeof ep> => ep !== null)
    .map((ep) => ({
      "@type": "PodcastEpisode" as const,
      "@id": `${SITE_ORIGIN}/podcast/${ep.slug}#episode`,
      name: ep.title,
      url: `${SITE_ORIGIN}/podcast/${ep.slug}`,
    }));
  const mentions = [...expertMentions, ...episodeMentions];

  return (
    <>
      {/* Article — references the canonical Person + Organization @ids from
          the site-wide OrganizationJsonLd graph, so crawlers see one
          connected entity rather than duplicates. speakable points at the
          answer capsule so AI/voice engines lift the answer-first chunk. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          "@id": `${url}#article`,
          headline: answer.question,
          description: answer.seoDescription,
          author: { "@id": ENTITY_IDS.person },
          publisher: { "@id": ENTITY_IDS.organization },
          datePublished: answer.publishDate,
          dateModified: answer.updatedDate || answer.publishDate,
          mainEntityOfPage: { "@type": "WebPage", "@id": url },
          inLanguage: "en",
          isPartOf: [
            { "@id": ENTITY_IDS.website },
            ...parentTopics.map((t) => ({
              "@id": `${SITE_ORIGIN}/topics/${t.slug}#topic`,
            })),
          ],
          ...(parentTopics.length > 0 && {
            about: parentTopics.map((t) => ({
              "@type": "Thing",
              "@id": `${SITE_ORIGIN}/topics/${t.slug}#thing`,
              name: t.title,
              url: `${SITE_ORIGIN}/topics/${t.slug}`,
            })),
          }),
          speakable: {
            "@type": "SpeakableSpecification",
            cssSelector: ["h1", ".answer-capsule"],
          },
          ...(mentions.length > 0 && { mentions }),
        }}
      />

      {/* FAQPage — the on-page FAQ accordion mirrors this exactly. */}
      {answer.faq.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: answer.faq.map((f) => ({
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
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
            {
              "@type": "ListItem",
              position: 2,
              name: "Answers",
              item: `${SITE_ORIGIN}/answers`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: answer.question,
              item: url,
            },
          ],
        }}
      />

      <Header />

      <AnswerTemplate
        answer={answer}
        relatedEpisodes={relatedEpisodes}
        episodeTitleBySlug={episodeTitleBySlug}
        source={slug}
      />

      <Footer />
    </>
  );
}
