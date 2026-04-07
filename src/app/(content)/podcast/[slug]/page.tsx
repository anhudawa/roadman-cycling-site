import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Badge, Button } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { getEpisodeBySlug, getAllEpisodeSlugs } from "@/lib/podcast";
import { PodcastLinks } from "@/components/features/podcast/PodcastLinks";
import { TranscriptViewer } from "@/components/features/podcast/TranscriptViewer";
import { PlayButton } from "@/components/features/podcast/PlayButton";
import { EmailCapture } from "@/components/features/conversion/EmailCapture";

export async function generateStaticParams() {
  return getAllEpisodeSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const episode = getEpisodeBySlug(slug);
  if (!episode) return { title: "Episode Not Found" };

  const ogParams = new URLSearchParams({
    type: "podcast",
    title: episode.title,
    pillar: episode.pillar,
    ...(episode.episodeNumber && {
      episodeNumber: String(episode.episodeNumber),
    }),
    ...(episode.guest && { guest: episode.guest }),
  });

  const ogImageUrl = `https://roadmancycling.com/api/og?${ogParams.toString()}`;

  return {
    title: episode.seoTitle || episode.title,
    description: episode.seoDescription,
    keywords: episode.keywords,
    alternates: {
      canonical: `https://roadmancycling.com/podcast/${slug}`,
    },
    openGraph: {
      title: episode.seoTitle || episode.title,
      description: episode.seoDescription,
      type: "article",
      publishedTime: episode.publishDate,
      url: `https://roadmancycling.com/podcast/${slug}`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: episode.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: episode.seoTitle || episode.title,
      description: episode.seoDescription,
      images: [ogImageUrl],
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

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "PodcastEpisode",
          name: episode.title,
          description: episode.seoDescription,
          episodeNumber: episode.episodeNumber,
          datePublished: episode.publishDate,
          duration: `PT${episode.duration.replace(":", "H").replace(":", "M")}S`,
          partOfSeries: {
            "@type": "PodcastSeries",
            name: "The Roadman Cycling Podcast",
            url: "https://roadmancycling.com/podcast",
          },
          ...(episode.guest && {
            actor: {
              "@type": "Person",
              name: episode.guest,
              description: episode.guestCredential,
            },
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
            publisher: {
              "@type": "Organization",
              name: "Roadman Cycling",
              url: "https://roadmancycling.com",
            },
          }}
        />
      )}

      <Header />

      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow" className="text-center">
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
            <article className="prose-roadman prose-episode">
              <MDXRemote source={episode.content} />
            </article>

            {/* Transcript */}
            {episode.transcript && (
              <TranscriptViewer
                transcript={episode.transcript}
                className="mt-12"
              />
            )}

            {/* Newsletter */}
            <EmailCapture
              variant="inline"
              heading="NEVER MISS AN EPISODE"
              subheading="Weekly insights from the podcast. The stuff that actually makes you faster."
              source={`podcast-${slug}`}
              className="mt-16"
            />

            {/* CTA */}
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
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
