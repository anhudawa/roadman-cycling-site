import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Badge } from "@/components/ui";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { ENTITY_IDS } from "@/lib/brand-facts";
import { getEpisodeBySlug } from "@/lib/podcast";
import { stripRoadmanBrandSuffix } from "@/lib/seo/search-ownership";
import {
  durationToIso,
  getVideoEpisodes,
  getWatchUrl,
  getYouTubeEmbedUrl,
  getYouTubeThumbnailUrl,
} from "@/lib/seo/video-watch";

// A watch page only exists for a known episode with a YouTube video. Reject
// every other slug at the route boundary so this index stays finite and clean.
export const dynamicParams = false;

export function generateStaticParams() {
  return getVideoEpisodes().map((episode) => ({ slug: episode.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const episode = getEpisodeBySlug(slug);
  if (!episode?.youtubeId) notFound();

  const cleanTitle = stripRoadmanBrandSuffix(episode.seoTitle || episode.title);
  const watchUrl = getWatchUrl(slug);
  const thumbnailUrl = getYouTubeThumbnailUrl(episode.youtubeId);

  return {
    title: `Watch ${cleanTitle}`,
    description: episode.seoDescription,
    alternates: { canonical: watchUrl },
    openGraph: {
      title: `Watch ${cleanTitle}`,
      description: episode.seoDescription,
      type: "video.other",
      url: watchUrl,
      videos: [getYouTubeEmbedUrl(episode.youtubeId)],
      images: [
        {
          url: thumbnailUrl,
          width: 480,
          height: 360,
          alt: episode.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Watch ${cleanTitle}`,
      description: episode.seoDescription,
      images: [thumbnailUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function WatchPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const episode = getEpisodeBySlug(slug);
  if (!episode?.youtubeId) notFound();

  const watchUrl = getWatchUrl(slug);
  const embedUrl = getYouTubeEmbedUrl(episode.youtubeId);
  const thumbnailUrl = getYouTubeThumbnailUrl(episode.youtubeId);
  const isoDuration = durationToIso(episode.duration);
  const publishDate = new Date(episode.publishDate);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "VideoObject",
          "@id": `${watchUrl}#video`,
          name: episode.title,
          description: episode.seoDescription,
          thumbnailUrl,
          uploadDate: episode.publishDate,
          ...(isoDuration && { duration: isoDuration }),
          embedUrl,
          url: watchUrl,
          inLanguage: "en",
          publisher: { "@id": ENTITY_IDS.organization },
          mainEntityOfPage: { "@type": "WebPage", "@id": watchUrl },
          isPartOf: {
            "@type": "PodcastEpisode",
            "@id": `https://roadmancycling.com/podcast/${slug}#episode`,
            name: episode.title,
            url: `https://roadmancycling.com/podcast/${slug}`,
          },
          potentialAction: {
            "@type": "WatchAction",
            target: watchUrl,
          },
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
              name: "Cycling videos",
              item: "https://roadmancycling.com/watch",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: episode.title,
              item: watchUrl,
            },
          ],
        }}
      />

      <Header />
      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 !pb-8">
          <Container>
            <Breadcrumbs
              items={[
                { label: "Cycling videos", href: "/watch" },
                { label: episode.title },
              ]}
            />
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge pillar={episode.pillar} size="sm" />
              <span className="font-heading text-sm tracking-widest text-foreground-subtle">
                WATCH THE ROADMAN PODCAST
              </span>
            </div>
            <h1 className="max-w-5xl font-heading text-off-white text-3xl md:text-5xl leading-tight">
              {episode.title.toUpperCase()}
            </h1>
          </Container>
        </Section>

        {/* The single, eagerly loaded video is the primary purpose and first
            substantive content of this URL. The fuller notes, evidence and
            transcript stay on the companion podcast page. */}
        <Section background="charcoal" className="!pt-8 !pb-12">
          <Container>
            <div className="mx-auto max-w-6xl">
              <div className="aspect-video overflow-hidden rounded-xl border border-white/10 bg-black shadow-[var(--shadow-elevated)]">
                <iframe
                  src={embedUrl}
                  width="100%"
                  height="100%"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="border-0"
                  title={`Watch ${episode.title}`}
                />
              </div>

              <div className="mt-6 flex flex-col gap-5 border-t border-white/10 pt-6 md:flex-row md:items-start md:justify-between">
                <div className="max-w-3xl">
                  <p className="text-foreground-muted leading-relaxed">
                    {episode.seoDescription}
                  </p>
                  <p className="mt-3 text-sm text-foreground-subtle">
                    {episode.duration} ·{" "}
                    <time dateTime={episode.publishDate}>
                      {publishDate.toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </time>
                  </p>
                </div>
                <Link
                  href={`/podcast/${slug}`}
                  className="shrink-0 rounded-sm border border-coral/50 px-5 py-3 font-heading text-sm tracking-wider text-coral transition-colors hover:bg-coral hover:text-deep-purple"
                >
                  READ SHOW NOTES &amp; TRANSCRIPT
                </Link>
              </div>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
