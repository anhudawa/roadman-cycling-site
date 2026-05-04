import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Badge } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { AskRoadmanCTA } from "@/components/features/aeo/AskRoadmanCTA";
import { ENTITY_IDS, SITE_ORIGIN } from "@/lib/brand-facts";
import {
  getEpisodeBySlug,
  getTranscript,
  getTranscriptSlugs,
} from "@/lib/podcast";
import { segmentTranscript } from "@/lib/transcript";

export async function generateStaticParams() {
  return getTranscriptSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const episode = getEpisodeBySlug(slug);
  if (!episode) return { title: "Transcript Not Found" };

  const cleanTitle = episode.title.replace(/\s*\|\s*Roadman\b.*$/i, "").trim();
  const title = `${cleanTitle} — Full Transcript`;
  const description = `Full transcript of "${cleanTitle}" on the Roadman Cycling Podcast.${
    episode.guest ? ` With ${episode.guest}.` : ""
  } ${episode.seoDescription}`.slice(0, 300);

  return {
    title,
    description,
    alternates: {
      canonical: `https://roadmancycling.com/podcast/${slug}/transcript`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: episode.publishDate,
      url: `https://roadmancycling.com/podcast/${slug}/transcript`,
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
  };
}

export default async function TranscriptPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const episode = getEpisodeBySlug(slug);
  const transcript = getTranscript(slug);

  if (!episode || !transcript) {
    notFound();
  }

  const episodeUrl = `${SITE_ORIGIN}/podcast/${slug}`;
  const transcriptUrl = `${SITE_ORIGIN}/podcast/${slug}/transcript`;
  const publishDate = new Date(episode.publishDate);

  // Reuse the same segmentation pass the inline TranscriptViewer uses,
  // so segment anchors stay consistent across the inline accordion and
  // this dedicated page. Falls back gracefully when no titles override
  // is available — the heuristic-derived titles still work.
  const segments = segmentTranscript(transcript.text, {
    titles: episode.segmentTitles,
  });

  return (
    <>
      {/* PodcastEpisode + transcript schema. We declare a separate node
          (rather than reusing the episode page's @id) so crawlers see
          this dedicated transcript URL as its own indexable surface
          while still linking back to the canonical episode and series
          via @id refs. The full transcript text is included as a
          first-class schema property — schema.org allows `transcript`
          on PodcastEpisode via CreativeWork inheritance. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "PodcastEpisode",
          "@id": `${transcriptUrl}#transcript`,
          name: `${episode.title} — Full Transcript`,
          url: transcriptUrl,
          description: episode.seoDescription,
          datePublished: episode.publishDate,
          inLanguage: "en",
          partOfSeries: { "@id": ENTITY_IDS.podcast },
          isPartOf: {
            "@type": "PodcastEpisode",
            "@id": `${episodeUrl}#episode`,
            url: episodeUrl,
            name: episode.title,
          },
          author: { "@id": ENTITY_IDS.person },
          publisher: { "@id": ENTITY_IDS.organization },
          ...(episode.guest && {
            actor: {
              "@type": "Person",
              name: episode.guest,
              ...(episode.guestCredential && {
                description: episode.guestCredential,
              }),
            },
          }),
          transcript: transcript.text,
          wordCount: transcript.wordCount,
          // Speakable points at the segment headings so voice
          // assistants can read the chapter list aloud. The `.transcript-body`
          // class scopes the prose so AI crawlers know which DOM node
          // is the authoritative transcript text on this page.
          speakable: {
            "@type": "SpeakableSpecification",
            cssSelector: ["h1", ".transcript-body h2"],
          },
          ...(segments.length > 1 && {
            hasPart: segments.map((segment) => ({
              "@type": "CreativeWork",
              name: segment.title,
              url: `${transcriptUrl}#${segment.id}`,
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
              item: SITE_ORIGIN,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Podcast",
              item: `${SITE_ORIGIN}/podcast`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: "Transcripts",
              item: `${SITE_ORIGIN}/podcast/transcripts`,
            },
            {
              "@type": "ListItem",
              position: 4,
              name: episode.title,
              item: episodeUrl,
            },
            {
              "@type": "ListItem",
              position: 5,
              name: "Transcript",
              item: transcriptUrl,
            },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-10">
          <Container width="narrow">
            <div className="text-center">
              <p className="font-heading text-coral text-xs tracking-widest mb-3">
                FULL TRANSCRIPT
              </p>
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
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-foreground-subtle">
                <span>{episode.duration}</span>
                <span aria-hidden="true">&middot;</span>
                <time dateTime={episode.publishDate}>
                  {publishDate.toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </time>
                <span aria-hidden="true">&middot;</span>
                <span>
                  {transcript.wordCount.toLocaleString("en-GB")} words
                </span>
              </div>
            </div>
          </Container>
        </Section>

        <Section background="charcoal" className="!pt-8 !pb-16">
          <Container width="narrow">
            <Breadcrumbs
              items={[
                { label: "Podcast", href: "/podcast" },
                { label: "Transcripts", href: "/podcast/transcripts" },
                { label: episode.title, href: `/podcast/${slug}` },
                { label: "Transcript" },
              ]}
            />

            {/* Episode handoff strip — keeps a one-click route back to
                the episode (audio/video, show notes, citations) for
                readers who landed on the transcript via search. */}
            <div className="mb-8 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <div>
                <p className="font-heading text-coral text-xs tracking-widest mb-1">
                  WANT TO LISTEN INSTEAD?
                </p>
                <p className="text-sm text-foreground-muted">
                  Audio, video, show notes, and citations live on the episode
                  page.
                </p>
              </div>
              <Link
                href={`/podcast/${slug}`}
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 hover:border-coral/40 bg-white/[0.04] hover:bg-white/[0.07] px-4 py-2 text-sm font-heading text-off-white tracking-wider transition-all whitespace-nowrap"
              >
                ← BACK TO EPISODE
              </Link>
            </div>

            {/* Jump-to-section nav. Mirrors the inline TranscriptViewer
                navigation but rendered inline (no accordion) since the
                whole page is the transcript. */}
            {segments.length > 1 && (
              <nav
                aria-label="Transcript sections"
                className="mb-10 rounded-xl border border-white/5 bg-background-elevated p-6"
              >
                <p className="text-xs text-foreground-subtle uppercase tracking-widest font-heading mb-3">
                  Jump to section
                </p>
                <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-0.5">
                  {segments.map((segment) => (
                    <li key={segment.id}>
                      <a
                        href={`#${segment.id}`}
                        className="group flex items-baseline gap-3 py-1.5 px-2 -mx-2 rounded-md text-sm text-foreground-muted hover:bg-coral/10 hover:text-off-white transition-colors"
                        style={{ transitionDuration: "var(--duration-fast)" }}
                      >
                        <span className="text-coral font-heading text-xs tabular-nums shrink-0 w-6">
                          {String(segment.index).padStart(2, "0")}
                        </span>
                        <span className="leading-snug">{segment.title}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            {/* Transcript body. Each segment renders as an h2-anchored
                section so the dedicated page exposes a deeper outline
                than the inline accordion (which uses h3). The
                .transcript-body class is the schema speakable target. */}
            <article
              className="transcript-body space-y-10"
              data-speakable-transcript="true"
            >
              {segments.map((segment) => (
                <section
                  key={segment.id}
                  id={segment.id}
                  aria-labelledby={`${segment.id}-heading`}
                  className="scroll-mt-24"
                >
                  <h2
                    id={`${segment.id}-heading`}
                    className="font-heading text-xl md:text-2xl text-off-white mb-4 tracking-wide"
                  >
                    <a
                      href={`#${segment.id}`}
                      className="hover:text-coral transition-colors no-underline"
                    >
                      <span className="text-coral mr-2" aria-hidden="true">
                        {segment.index}.
                      </span>
                      {segment.title}
                    </a>
                  </h2>
                  <p className="font-body text-foreground-muted text-base md:text-lg leading-relaxed">
                    {segment.text}
                  </p>
                </section>
              ))}
            </article>

            <div className="mt-16">
              <AskRoadmanCTA
                topic={episode.title}
                question={
                  episode.guest
                    ? `In the episode with ${episode.guest} on "${episode.title}", what's the most important takeaway for me to apply?`
                    : `In the episode "${episode.title}", what's the most important takeaway for me to apply?`
                }
                source={`transcript-${slug}`}
                heading="ASK ABOUT THIS EPISODE"
                buttonLabel="Ask Roadman"
              />
            </div>

            <div className="mt-12 flex flex-col sm:flex-row gap-3 sm:justify-between">
              <Link
                href={`/podcast/${slug}`}
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 hover:border-coral/40 bg-white/[0.04] hover:bg-white/[0.07] px-4 py-2 text-sm font-heading text-off-white tracking-wider transition-all"
              >
                ← BACK TO EPISODE
              </Link>
              <Link
                href="/podcast/transcripts"
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 hover:border-coral/40 bg-white/[0.04] hover:bg-white/[0.07] px-4 py-2 text-sm font-heading text-off-white tracking-wider transition-all"
              >
                ALL TRANSCRIPTS →
              </Link>
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
