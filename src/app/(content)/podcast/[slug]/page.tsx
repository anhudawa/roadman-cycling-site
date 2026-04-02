import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Badge, Button } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { getEpisodeBySlug, getAllEpisodeSlugs } from "@/lib/podcast";

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

  return {
    title: episode.seoTitle || episode.title,
    description: episode.seoDescription,
    keywords: episode.keywords,
    openGraph: {
      title: episode.seoTitle || episode.title,
      description: episode.seoDescription,
      type: "article",
      publishedTime: episode.publishDate,
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

      <Header />

      <main>
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow" className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="font-heading text-coral text-lg">
                EP {episode.episodeNumber}
              </span>
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

            <div className="flex items-center justify-center gap-4 text-sm text-foreground-subtle">
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
          </Container>
        </Section>

        {/* Spotify Embed */}
        {episode.spotifyId && (
          <Section background="charcoal" className="!py-6 border-b border-white/5">
            <Container width="narrow">
              <div className="rounded-xl overflow-hidden bg-background-elevated border border-white/5">
                <iframe
                  src={`https://open.spotify.com/embed/episode/${episode.spotifyId}?theme=0`}
                  width="100%"
                  height="152"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="border-0"
                  title={`Listen to ${episode.title}`}
                />
              </div>
            </Container>
          </Section>
        )}

        {/* Content / Show Notes */}
        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <article
              className="
                [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:md:text-3xl [&_h2]:text-off-white [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:uppercase
                [&_h3]:font-heading [&_h3]:text-xl [&_h3]:md:text-2xl [&_h3]:text-off-white [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:uppercase
                [&_p]:text-foreground-muted [&_p]:leading-relaxed [&_p]:mb-5
                [&_strong]:text-off-white [&_strong]:font-semibold
                [&_em]:text-foreground-muted
                [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-5 [&_ul]:space-y-2
                [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-5 [&_ol]:space-y-2
                [&_li]:text-foreground-muted [&_li]:leading-relaxed
                [&_blockquote]:border-l-2 [&_blockquote]:border-coral [&_blockquote]:pl-5 [&_blockquote]:py-1 [&_blockquote]:my-6 [&_blockquote]:italic [&_blockquote]:text-foreground-muted
                [&_a]:text-coral [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-coral-hover
                [&_hr]:border-white/10 [&_hr]:my-10
              "
            >
              <MDXRemote source={episode.content} />
            </article>

            {/* CTA */}
            <div className="mt-16 bg-deep-purple/30 rounded-xl border border-purple/20 p-8 text-center">
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
