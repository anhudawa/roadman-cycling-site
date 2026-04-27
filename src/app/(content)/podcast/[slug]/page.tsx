import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Header, Footer, Section, Container } from "@/components/layout";
import { AICitationBlock, Badge, Button } from "@/components/ui";
import { AnswerCapsule } from "@/components/ui/AnswerCapsule";
import { AskRoadmanCTA } from "@/components/features/aeo/AskRoadmanCTA";
import { JsonLd } from "@/components/seo/JsonLd";
import { FAQSchema } from "@/components/seo/FAQSchema";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { EvidenceBlock } from "@/components/seo/EvidenceBlock";
import { ENTITY_IDS, SITE_ORIGIN } from "@/lib/brand-facts";
import { getEpisodeBySlug, getAllEpisodeSlugs } from "@/lib/podcast";
import { segmentTranscript } from "@/lib/transcript";
import { PodcastLinks } from "@/components/features/podcast/PodcastLinks";
import { TranscriptViewer } from "@/components/features/podcast/TranscriptViewer";
import { PlayButton } from "@/components/features/podcast/PlayButton";
import { RelatedContent } from "@/components/features/RelatedContent";
import { RelatedEpisodes } from "@/components/features/podcast/RelatedEpisodes";
import { EmailCapture } from "@/components/features/conversion/EmailCapture";
import { getPostBySlug } from "@/lib/blog";
import { EVENTS } from "@/lib/training-plans";
import Link from "next/link";
import { mdxComponents } from "@/components/mdx/MDXComponents";

export async function generateStaticParams() {
  return getAllEpisodeSlugs().map((slug) => ({ slug }));
}

const stripBrandSuffix = (t: string) =>
  t.replace(/\s*\|\s*Roadman\b.*$/i, "").trim();

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const episode = getEpisodeBySlug(slug);
  if (!episode) return { title: "Episode Not Found" };

  const cleanTitle = stripBrandSuffix(episode.seoTitle || episode.title);

  return {
    title: cleanTitle,
    description: episode.seoDescription,
    keywords: episode.keywords,
    alternates: {
      canonical: `https://roadmancycling.com/podcast/${slug}`,
    },
    openGraph: {
      title: cleanTitle,
      description: episode.seoDescription,
      type: "article",
      publishedTime: episode.publishDate,
      url: `https://roadmancycling.com/podcast/${slug}`,
      images: episode.youtubeId
        ? [
            {
              url: `https://img.youtube.com/vi/${episode.youtubeId}/maxresdefault.jpg`,
              width: 1280,
              height: 720,
              alt: episode.title,
            },
          ]
        : [
            {
              url: "https://roadmancycling.com/images/podcast-cover.jpg",
              width: 1200,
              height: 630,
              alt: "Roadman Cycling Podcast",
            },
          ],
    },
    twitter: {
      card: "summary_large_image",
      title: cleanTitle,
      description: episode.seoDescription,
      images: episode.youtubeId
        ? [`https://img.youtube.com/vi/${episode.youtubeId}/maxresdefault.jpg`]
        : ["https://roadmancycling.com/images/podcast-cover.jpg"],
    },
  };
}

export default async function EpisodePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const episode = getEpisodeBySlug(slug);

  if (!episode) {
    notFound();
  }

  const publishDate = new Date(episode.publishDate);
  const episodeUrl = `https://roadmancycling.com/podcast/${slug}`;

  const mentionedEvents = EVENTS.filter((e) => {
    const haystack = `${episode.title} ${episode.description} ${episode.transcript || ""}`.toLowerCase();
    return haystack.includes(e.name.toLowerCase()) || haystack.includes(e.shortName.toLowerCase());
  }).slice(0, 3);

  // Segment the transcript once on the server so the schema and the
  // TranscriptViewer render from the same segmentation — keeping schema
  // `hasPart` anchors in sync with the actual `<h3 id>`s in the DOM.
  const segments = episode.transcript
    ? segmentTranscript(episode.transcript, { titles: episode.segmentTitles })
    : [];

  return (
    <>
      {/* PodcastEpisode connected via @id to the PodcastSeries, Person, and
          Organization entities declared in OrganizationJsonLd, so crawlers
          ingest the whole show/host/publisher graph in one pass. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "PodcastEpisode",
          "@id": `${episodeUrl}#episode`,
          name: episode.title,
          url: episodeUrl,
          description: episode.seoDescription,
          episodeNumber: episode.episodeNumber,
          datePublished: episode.publishDate,
          timeRequired: (() => {
            const parts = episode.duration.split(":").map(Number);
            if (parts.length === 3) return `PT${parts[0]}H${parts[1]}M${parts[2]}S`;
            if (parts.length === 2) return `PT${parts[0]}M${parts[1]}S`;
            return `PT${parts[0]}M`;
          })(),
          image: episode.youtubeId
            ? `https://img.youtube.com/vi/${episode.youtubeId}/maxresdefault.jpg`
            : `${SITE_ORIGIN}/images/podcast-cover.jpg`,
          partOfSeries: { "@id": ENTITY_IDS.podcast },
          author: { "@id": ENTITY_IDS.person },
          publisher: { "@id": ENTITY_IDS.organization },
          associatedMedia: episode.spotifyId
            ? {
                "@type": "MediaObject",
                contentUrl: `https://open.spotify.com/episode/${episode.spotifyId}`,
              }
            : undefined,
          ...(episode.guest && {
            actor: {
              "@type": "Person",
              name: episode.guest,
              description: episode.guestCredential,
            },
          }),
          // Expose the full transcript text to search + AI assistants as a
          // first-class schema field (supported under PodcastEpisode via
          // schema.org CreativeWork inheritance). Lets LLM crawlers ingest
          // the episode content without needing to render the page.
          ...(episode.transcript && { transcript: episode.transcript }),
          // Speakable targets the same `.answer-capsule` block blog posts
          // use, so voice search gets a consistent TL;DR across all content
          // types. The h1 fallback ensures voice UAs always have something
          // to read even for episodes that pre-date the capsule rollout.
          speakable: {
            "@type": "SpeakableSpecification",
            cssSelector: ["h1", ".answer-capsule"],
          },
          // Declare every transcript segment as a CreativeWork part with a
          // fragment URL pointing at its h3 anchor. Gives Google a native
          // route to "passage indexing" — each segment can rank independently
          // for its specific topic.
          ...(segments.length > 1 && {
            hasPart: segments.map((segment) => ({
              "@type": "CreativeWork",
              name: segment.title,
              url: `${episodeUrl}#${segment.id}`,
              position: segment.index,
              wordCount: segment.wordCount,
              isPartOf: { "@type": "PodcastEpisode", url: episodeUrl },
            })),
          }),
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
              item: "https://roadmancycling.com",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Podcast",
              item: "https://roadmancycling.com/podcast",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: episode.title,
              item: `https://roadmancycling.com/podcast/${slug}`,
            },
          ],
        }}
      />
      {/* VideoObject for YouTube episodes */}
      {episode.youtubeId && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "VideoObject",
            name: episode.title,
            description: episode.seoDescription,
            thumbnailUrl: `https://img.youtube.com/vi/${episode.youtubeId}/maxresdefault.jpg`,
            uploadDate: episode.publishDate,
            contentUrl: `https://www.youtube.com/watch?v=${episode.youtubeId}`,
            embedUrl: `https://www.youtube.com/embed/${episode.youtubeId}`,
            duration: (() => {
              const parts = episode.duration.split(":").map(Number);
              if (parts.length === 3) return `PT${parts[0]}H${parts[1]}M${parts[2]}S`;
              if (parts.length === 2) return `PT${parts[0]}M${parts[1]}S`;
              return `PT${parts[0]}M`;
            })(),
            publisher: { "@id": ENTITY_IDS.organization },
          }}
        />
      )}
      {/* Quotation schema for key expert quotes extracted from transcript */}
      {episode.keyQuotes && episode.keyQuotes.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": episode.keyQuotes.map((quote) => ({
              "@type": "Quotation",
              text: quote.text,
              creator: {
                "@type": "Person",
                name: quote.speaker,
                ...(quote.credential && { description: quote.credential }),
              },
              isPartOf: {
                "@type": "PodcastEpisode",
                name: episode.title,
                url: episodeUrl,
              },
            })),
          }}
        />
      )}

      {/* FAQPage schema for episodes with FAQ sections */}
      {episode.faq && episode.faq.length > 0 && (
        <FAQSchema faqs={episode.faq} />
      )}

      <Header />

      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow">
            <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Badge pillar={episode.pillar} size="md" />
              <span className="text-sm text-foreground-subtle capitalize">
                {episode.type.replace("-", " & ")}
              </span>
            </div>

            <h1 className="font-heading text-off-white text-3xl md:text-5xl leading-tight mb-4">
              {episode.title.toUpperCase()}
            </h1>

            {episode.guest && (
              <p className="text-foreground-muted text-lg mb-2">
                with{" "}
                <span className="text-off-white font-medium">
                  {episode.guest}
                </span>
                {episode.guestCredential && (
                  <span className="text-foreground-subtle">
                    {" "}
                    &mdash; {episode.guestCredential}
                  </span>
                )}
              </p>
            )}

            <div className="flex items-center justify-center gap-4 text-sm text-foreground-subtle mb-6">
              <span>{episode.duration}</span>
              <span>&middot;</span>
              <time dateTime={episode.publishDate}>
                {publishDate.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </time>
            </div>

            {episode.youtubeId && (
              <div className="flex items-center justify-center mb-4">
                <PlayButton
                  episode={{
                    slug: episode.slug,
                    title: episode.title,
                    guest: episode.guest,
                    youtubeId: episode.youtubeId,
                    spotifyId: episode.spotifyId,
                    duration: episode.duration,
                  }}
                  className="mr-3"
                />
                <span className="text-sm text-foreground-muted font-heading tracking-wider">
                  LISTEN NOW
                </span>
              </div>
            )}

            <PodcastLinks
              spotifyId={episode.spotifyId}
              episodeTitle={episode.title}
              className="flex flex-col items-center"
            />
            </div>
          </Container>
        </Section>

        {/* YouTube Embed (primary) — Wide for cinematic feel */}
        {episode.youtubeId && (
          <Section background="charcoal" className="!py-8 border-b border-white/5">
            <Container>
              <div className="max-w-4xl mx-auto rounded-xl overflow-hidden bg-background-elevated border border-white/5 aspect-video shadow-[var(--shadow-elevated)]">
                <iframe
                  src={`https://www.youtube.com/embed/${episode.youtubeId}`}
                  width="100%"
                  height="100%"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                  className="border-0"
                  title={`Watch ${episode.title}`}
                />
              </div>
            </Container>
          </Section>
        )}

        {/* Guest Info Card + Spotify */}
        <Section background="charcoal" className="!py-6 border-b border-white/5">
          <Container width="narrow">
            <div className="flex flex-col gap-6">
              {/* Guest card with link to guest page */}
              {episode.guest && (
                <a
                  href={`/guests/${episode.guest.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}
                  className="flex items-center gap-4 p-5 bg-background-elevated rounded-xl border border-white/5 hover:border-coral/30 transition-all group"
                  style={{ transitionDuration: "var(--duration-normal)" }}
                >
                  <div className="w-14 h-14 rounded-full bg-purple/40 border border-purple/30 flex items-center justify-center shrink-0 group-hover:border-coral/40 transition-colors">
                    <span className="font-heading text-lg text-off-white">
                      {episode.guest.split(" ").map(w => w[0]).join("").slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading text-lg text-off-white group-hover:text-coral transition-colors">
                      {episode.guest.toUpperCase()}
                    </p>
                    {episode.guestCredential && (
                      <p className="text-sm text-foreground-muted truncate">
                        {episode.guestCredential}
                      </p>
                    )}
                  </div>
                  <span className="text-coral text-sm font-heading shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    VIEW &rarr;
                  </span>
                </a>
              )}

              {/* Spotify Embed (secondary, if available) */}
              {episode.spotifyId && (
                <div>
                  <p className="text-xs text-foreground-subtle mb-2 uppercase tracking-widest font-heading">
                    Also on Spotify
                  </p>
                  <div className="rounded-xl overflow-hidden bg-background-elevated border border-white/5">
                    <iframe
                      src={`https://open.spotify.com/embed/episode/${episode.spotifyId}?theme=0`}
                      width="100%"
                      height="152"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      className="border-0"
                      title={`Listen to ${episode.title} on Spotify`}
                    />
                  </div>
                </div>
              )}
            </div>
          </Container>
        </Section>

        {/* Content / Show Notes */}
        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <Breadcrumbs
              items={[
                { label: "Podcast", href: "/podcast" },
                { label: episode.title },
              ]}
            />
            {/* Answer capsule — AI-citation-optimised TL;DR of the episode.
                Prefers the curated `answerCapsule` (60–100 words, generated
                from the full transcript) over `seoDescription` (150-char
                SERP snippet). Aligned with the .answer-capsule CSS selector
                referenced by SpeakableSpecification schema. Primary AI-
                citation target for ChatGPT / Perplexity / Claude when this
                episode is quoted as a source. */}
            {(episode.answerCapsule ?? episode.seoDescription) && (
              <AnswerCapsule
                text={episode.answerCapsule ?? episode.seoDescription}
                pillar={episode.pillar}
              />
            )}
            <article className="prose-roadman prose-episode">
              <MDXRemote
                source={episode.content}
                components={{ ...mdxComponents, AICitationBlock }}
              />
            </article>

            {/* Key Quotes — verbatim expert quotes from the transcript,
                rendered as styled blockquotes with speaker attribution.
                Placed between show notes and transcript for maximum
                visibility without interrupting the reading flow. */}
            {episode.keyQuotes && episode.keyQuotes.length > 0 && (
              <section className="mt-12" aria-label="Key quotes from this episode">
                <h2 className="font-heading text-xl text-off-white mb-6 tracking-wide">
                  KEY QUOTES
                </h2>
                <div className="space-y-6">
                  {episode.keyQuotes.map((quote, idx) => (
                    <blockquote
                      key={idx}
                      className="relative pl-5 border-l-2 border-coral/60"
                    >
                      <p className="text-foreground-muted text-base italic leading-relaxed">
                        &ldquo;{quote.text}&rdquo;
                      </p>
                      <footer className="mt-2 text-sm text-foreground-subtle">
                        <span className="text-off-white font-medium not-italic">
                          {quote.speaker}
                        </span>
                        {quote.credential && (
                          <span className="not-italic">
                            {" "}&mdash; {quote.credential}
                          </span>
                        )}
                      </footer>
                    </blockquote>
                  ))}
                </div>
              </section>
            )}

            {/* Coaching CTA — high-intent position after content, before transcript */}
            {(episode.pillar === "coaching" || episode.pillar === "nutrition") && (
              <div className="mt-12 rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-6 md:p-8 text-center">
                <p className="font-heading text-coral text-xs tracking-widest mb-2">
                  WANT THIS APPLIED TO YOUR TRAINING?
                </p>
                <p className="text-off-white font-heading text-lg md:text-xl mb-2">
                  Not Done Yet coaching builds your plan around these principles.
                </p>
                <p className="text-foreground-muted text-sm mb-5 max-w-md mx-auto">
                  5 pillars. Personalised TrainingPeaks plan. Weekly calls. $195/month, 7-day free trial.
                </p>
                <Link
                  href="/apply"
                  className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm transition-all"
                  data-track="podcast_coaching_cta"
                >
                  Apply for Coaching →
                </Link>
              </div>
            )}

            {/* Transcript */}
            {episode.transcript && (
              <TranscriptViewer
                transcript={episode.transcript}
                titles={episode.segmentTitles}
                className="mt-12"
              />
            )}

            {/* FAQ section — visible accordion for episodes with FAQ pairs */}
            {episode.faq && episode.faq.length > 0 && (
              <section className="mt-16" aria-label="Frequently asked questions">
                <h2 className="font-heading text-2xl text-off-white mb-6 tracking-wide">
                  FREQUENTLY ASKED QUESTIONS
                </h2>
                <div className="space-y-4">
                  {episode.faq.map((item, idx) => (
                    <details
                      key={idx}
                      className="group rounded-lg bg-white/5 border border-white/5 hover:border-coral/20 transition-colors"
                    >
                      <summary className="flex items-center justify-between cursor-pointer p-4 font-heading text-off-white text-sm tracking-wide select-none list-none [&::-webkit-details-marker]:hidden">
                        <span>{item.question}</span>
                        <span className="ml-4 shrink-0 text-coral transition-transform group-open:rotate-45">+</span>
                      </summary>
                      <div className="px-4 pb-4 text-sm text-foreground-muted leading-relaxed">
                        {item.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {/* E-E-A-T trust block — named host, editorial standards,
                corrections link + named on-episode guest as an expert
                source when present. Renders on every episode page. */}
            <EvidenceBlock
              experts={
                episode.guest
                  ? [
                      {
                        name: episode.guest,
                        role: episode.guestCredential,
                        href: `/guests/${episode.guest
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/(^-|-$)/g, "")}`,
                      },
                    ]
                  : undefined
              }
              lastReviewed={episode.publishDate}
            />

            {/* Ask Roadman handoff — episode-specific question seed so a
                listener with a follow-up can take the topic into the
                assistant without re-establishing context. */}
            <AskRoadmanCTA
              topic={episode.title}
              question={
                episode.guest
                  ? `In the episode with ${episode.guest} on "${episode.title}", what's the most important takeaway for me to apply?`
                  : `In the episode "${episode.title}", what's the most important takeaway for me to apply?`
              }
              source={`podcast-${slug}`}
            />

            {/* Newsletter */}
            <EmailCapture
              variant="inline"
              heading="NEVER MISS AN EPISODE"
              subheading="Weekly insights from the podcast. The stuff that actually makes you faster."
              source={`podcast-${slug}`}
              className="mt-16"
            />

            {/* Author-curated related blog posts — explicit episode→blog
                link equity. Populated by
                scripts/populate-episode-related-posts.ts. */}
            {episode.relatedPosts && episode.relatedPosts.length > 0 && (() => {
              const posts = episode.relatedPosts
                .map((s) => getPostBySlug(s))
                .filter((p): p is NonNullable<typeof p> => p !== null);
              if (posts.length === 0) return null;
              return (
                <section className="mt-16" aria-label="Related blog posts">
                  <h2 className="font-heading text-2xl text-off-white mb-4 tracking-wide">
                    READ THE GUIDE
                  </h2>
                  <p className="text-sm text-foreground-muted mb-6">
                    The written companion to this episode.
                  </p>
                  <div className="space-y-3">
                    {posts.map((p) => (
                      <Link
                        key={p.slug}
                        href={`/blog/${p.slug}`}
                        className="block p-4 rounded-lg bg-white/5 hover:bg-coral/10 border border-white/5 hover:border-coral/30 transition-all group"
                      >
                        <p className="font-heading text-sm text-off-white group-hover:text-coral transition-colors tracking-wide mb-1">
                          {p.title}
                        </p>
                        <p className="text-xs text-foreground-subtle">
                          {p.excerpt.slice(0, 140)}
                          {p.excerpt.length > 140 ? "…" : ""}
                        </p>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })()}

            {mentionedEvents.length > 0 && (
              <div className="mt-10 rounded-xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
                <p className="font-heading text-coral text-xs tracking-widest mb-3">
                  FREE TRAINING PLANS
                </p>
                <div className="flex flex-wrap gap-2">
                  {mentionedEvents.map((e) => (
                    <Link
                      key={e.slug}
                      href={`/plan/${e.slug}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-white/15 hover:border-coral/40 bg-white/[0.04] hover:bg-white/[0.07] px-4 py-2 text-sm font-heading text-off-white tracking-wider transition-all"
                    >
                      {e.shortName.toUpperCase()} →
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Related Episodes (podcast-only, server-rendered for SEO) */}
            <RelatedEpisodes
              currentSlug={slug}
              pillar={episode.pillar}
              keywords={episode.keywords}
              title={episode.title}
              className="mt-16"
            />

            {/* Related Content (cross-content: blog + podcast) */}
            <RelatedContent
              currentSlug={slug}
              currentType="podcast"
              pillar={episode.pillar}
              keywords={episode.keywords}
              className="mt-16"
            />

            {/* CTA — coaching-pillar episodes get a coaching funnel,
                others get the Clubhouse community CTA */}
            {episode.pillar === "coaching" ? (
              <div className="mt-12 bg-deep-purple/30 rounded-xl border border-purple/20 p-8 text-center">
                <h3 className="font-heading text-2xl text-off-white mb-3">
                  WANT THIS APPLIED TO YOUR TRAINING?
                </h3>
                <p className="text-foreground-muted mb-6 max-w-md mx-auto">
                  The Not Done Yet coaching community is 1:1 personalised
                  coaching — training, nutrition, strength, recovery, and
                  accountability. $195/month. 7-day free trial.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button href="/apply">Apply Now — 7-Day Free Trial</Button>
                  <Button href="/coaching" variant="ghost">
                    See Coaching Options
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-12 bg-deep-purple/30 rounded-xl border border-purple/20 p-8 text-center">
                <h3 className="font-heading text-2xl text-off-white mb-3">
                  LIKED THIS EPISODE?
                </h3>
                <p className="text-foreground-muted mb-6 max-w-md mx-auto">
                  Join the Clubhouse to discuss this episode, ask Anthony your
                  questions, and connect with serious cyclists.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button href="/community/clubhouse">
                    Join the Clubhouse — Free
                  </Button>
                  <Button href="/podcast" variant="ghost">
                    More Episodes
                  </Button>
                </div>
              </div>
            )}
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
