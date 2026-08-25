import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Badge } from "@/components/ui";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { getVideoEpisodes, getYouTubeThumbnailUrl } from "@/lib/seo/video-watch";

export const metadata: Metadata = {
  title: "Cycling Podcast Videos",
  description:
    "Watch the latest Roadman Cycling Podcast interviews, training explainers and evidence-led cycling videos.",
  alternates: { canonical: "https://roadmancycling.com/watch" },
  openGraph: {
    title: "Cycling Podcast Videos | Roadman Cycling",
    description:
      "Watch Roadman Cycling Podcast interviews, training explainers and evidence-led cycling videos.",
    type: "website",
    url: "https://roadmancycling.com/watch",
  },
};

export default function WatchIndexPage() {
  // Keep the hub fast and scannable. Every older watch page remains
  // discoverable from its podcast episode plus the HTML/video sitemaps.
  const episodes = getVideoEpisodes().slice(0, 48);

  return (
    <>
      <Header />
      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 !pb-12">
          <Container>
            <Breadcrumbs items={[{ label: "Cycling videos" }]} />
            <p className="font-heading text-coral tracking-[0.3em] mb-4">
              ROADMAN VIDEO LIBRARY
            </p>
            <h1 className="font-heading text-off-white text-5xl md:text-7xl leading-none">
              CYCLING PODCAST VIDEOS
            </h1>
            <p className="mt-5 max-w-3xl text-lg text-foreground-muted leading-relaxed">
              Watch full Roadman conversations, cycling training explainers,
              and practical performance lessons. Every video links to the
              complete show notes, evidence and transcript where available.
            </p>
          </Container>
        </Section>

        <Section background="charcoal">
          <Container>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {episodes.map((episode) => (
                <article
                  key={episode.slug}
                  className="overflow-hidden rounded-xl border border-white/10 bg-background-elevated"
                >
                  <Link href={`/watch/${episode.slug}`} className="group block">
                    <div className="relative aspect-video overflow-hidden bg-black">
                      <Image
                        src={getYouTubeThumbnailUrl(episode.youtubeId)}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                      <span className="absolute bottom-3 right-3 rounded bg-black/80 px-2 py-1 text-xs text-white">
                        {episode.duration}
                      </span>
                    </div>
                    <div className="p-5">
                      <Badge pillar={episode.pillar} size="sm" />
                      <h2 className="mt-3 font-heading text-xl leading-tight text-off-white transition-colors group-hover:text-coral">
                        {episode.title}
                      </h2>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link
                href="/podcast"
                className="inline-flex rounded-sm border border-coral/50 px-6 py-3 font-heading tracking-wider text-coral transition-colors hover:bg-coral hover:text-deep-purple"
              >
                BROWSE ALL PODCAST EPISODES
              </Link>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
