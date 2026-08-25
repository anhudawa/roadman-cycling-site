import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer, Section, Container } from "@/components/layout";
import { JsonLd } from "@/components/seo/JsonLd";
import { EvidenceBlock } from "@/components/seo/EvidenceBlock";
import { SocialProof } from "@/components/proof";
import { ScrollReveal } from "@/components/ui";
import { getAllEpisodes } from "@/lib/podcast";
import { PodcastSearch } from "@/components/features/podcast/PodcastSearch";
import {
  PodcastPagination,
  EPISODES_PER_PAGE,
} from "@/components/features/podcast/PodcastPagination";
import {
  ENTITY_IDS,
  SITE_ORIGIN,
  BRAND_STATS,
  PODCAST,
  PODCAST_HISTORY,
  PODCAST_SAME_AS,
} from "@/lib/brand-facts";
import { buildSearchOwnerTrustProperties } from "@/lib/seo/search-owner-schema";

interface PodcastPageProps {
  searchParams: Promise<{ page?: string }>;
}

function parsePage(raw?: string): number {
  if (!raw) return 1;
  const n = parseInt(raw, 10);
  if (Number.isNaN(n) || n < 1) return 1;
  return n;
}

export async function generateMetadata({
  searchParams,
}: PodcastPageProps): Promise<Metadata> {
  const { page: rawPage } = await searchParams;
  const page = parsePage(rawPage);

  const canonical =
    page === 1
      ? "https://roadmancycling.com/podcast"
      : `https://roadmancycling.com/podcast?page=${page}`;

  // rel prev/next via alternates — Google deprecated <link rel="prev/next">
  // in 2019 and relies on crawlable pagination links instead. The
  // PodcastPagination component's anchor tags carry rel="prev" / rel="next"
  // attributes, which is the effective replacement. We still express
  // canonical correctly per page.
  const alternates: Metadata["alternates"] = { canonical };
  const title =
    page === 1
      ? "Roadman Cycling Podcast: Training, Nutrition & Racing"
      : `Roadman Cycling Podcast Episodes — Page ${page}`;
  const description = `Search ${BRAND_STATS.searchableEpisodePagesLabel} transcript-backed Roadman Cycling Podcast episodes on training, nutrition, racing, bike fit and masters performance.`;

  return {
    // Absolute title avoids appending "| Roadman Cycling" to a title that
    // already contains the complete brand name. The topic-led proposition
    // matches both brand and cycling-podcast discovery queries; reach proof
    // remains in the description, schema and visible page.
    title: { absolute: title },
    description,
    alternates,
    openGraph: {
      title,
      description,
      type: "website",
      url: canonical,
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "Roadman Cycling",
        },
      ],
    },
  };
}

const PODCAST_START_PATHS = [
  {
    href: "/blog/best-cycling-podcasts-2026",
    label: "New listener",
    title: "Best cycling podcasts and where Roadman fits",
  },
  {
    href: "/topics/ftp-training",
    label: "Build fitness",
    title: "FTP, intervals and endurance training",
  },
  {
    href: "/topics/cycling-nutrition",
    label: "Fuel the work",
    title: "Cycling nutrition and recovery episodes",
  },
  {
    href: "/masters",
    label: "Ride faster after 40",
    title: "The masters cycling knowledge hub",
  },
  {
    href: "/topics/bike-fitting",
    label: "Ride comfortably",
    title: "Bike fit, pain and position guidance",
  },
  {
    href: "/guests",
    label: "Find an expert",
    title: "Browse every named podcast guest",
  },
] as const;

export default async function PodcastPage({ searchParams }: PodcastPageProps) {
  const { page: rawPage } = await searchParams;
  const page = parsePage(rawPage);
  const allEpisodes = getAllEpisodes();
  const totalPages = Math.ceil(allEpisodes.length / EPISODES_PER_PAGE);

  // 404 for out-of-range pages (but page 1 always valid even if empty)
  if (page > totalPages && page !== 1) {
    notFound();
  }

  const start = (page - 1) * EPISODES_PER_PAGE;
  const end = start + EPISODES_PER_PAGE;
  const podcastSearchIndex = allEpisodes.map((ep) => ({
    slug: ep.slug,
    title: ep.title,
    episodeNumber: ep.episodeNumber,
    guest: ep.guest,
    guestCredential: ep.guestCredential,
    description: ep.description,
    publishDate: ep.publishDate,
    duration: ep.duration,
    pillar: ep.pillar,
    type: ep.type,
  }));
  const episodes = podcastSearchIndex.slice(start, end);

  return (
    <>
      {/* Augment the canonical PodcastSeries declared in OrganizationJsonLd
          with hub-page specifics (numberOfEpisodes, web feed, cross-platform
          same-as links). Same @id so crawlers merge this into one entity. */}
      {page === 1 && (
        <>
          <JsonLd
            data={{
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              "@id": `${SITE_ORIGIN}/podcast#webpage`,
              url: `${SITE_ORIGIN}/podcast`,
              name: "The Roadman Cycling Podcast Archive",
              description:
                "The searchable cycling podcast archive for training, nutrition, racing, bike fit and masters performance: interviews with coaches, sports scientists, professional riders and practitioners.",
              ...buildSearchOwnerTrustProperties("cycling-podcast"),
              mainEntity: { "@id": ENTITY_IDS.podcast },
              about: [
                { "@type": "Thing", name: "Cycling training" },
                { "@type": "Thing", name: "Cycling nutrition" },
                { "@type": "Thing", name: "Bicycle racing" },
                { "@type": "Thing", name: "Bicycle fitting" },
                { "@type": "Thing", name: "Masters cycling" },
              ],
              audience: {
                "@type": "Audience",
                audienceType: "Amateur and masters cyclists",
              },
              primaryImageOfPage: {
                "@type": "ImageObject",
                url: `${SITE_ORIGIN}/og-image.jpg`,
              },
            }}
          />
          <JsonLd
            data={{
              "@context": "https://schema.org",
              "@type": "PodcastSeries",
              "@id": ENTITY_IDS.podcast,
              name: PODCAST.name,
              alternateName: "Roadman Podcast",
              description:
                "An English-language cycling performance podcast hosted by Anthony Walsh, covering training, nutrition, racing, bike fit and masters cycling.",
              disambiguatingDescription:
                "The cycling training and performance show published by Roadman Cycling.",
              datePublished: PODCAST_HISTORY.feedStartedDate,
              webFeed: `${SITE_ORIGIN}/feed/podcast`,
              author: { "@id": ENTITY_IDS.person },
              publisher: { "@id": ENTITY_IDS.organization },
              inLanguage: "en",
              genre: ["Cycling", "Endurance sports", "Sports science"],
              keywords: [
                "cycling podcast",
                "cycling training podcast",
                "cycling nutrition podcast",
                "masters cycling podcast",
              ],
              numberOfEpisodes: allEpisodes.length,
              sameAs: PODCAST_SAME_AS,
            }}
          />
          <JsonLd
            data={{
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: "Latest Podcast Episodes",
              itemListOrder: "https://schema.org/ItemListOrderDescending",
              numberOfItems: Math.min(allEpisodes.length, 20),
              itemListElement: allEpisodes.slice(0, 20).map((ep, i) => ({
                "@type": "ListItem",
                position: i + 1,
                url: `https://roadmancycling.com/podcast/${ep.slug}`,
                name: ep.title,
              })),
            }}
          />
        </>
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
              item: "https://roadmancycling.com",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Podcast",
              item: "https://roadmancycling.com/podcast",
            },
          ],
        }}
      />
      <Header />
      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container className="text-center">
            <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-8 rounded-full overflow-hidden ring-2 ring-coral/30 ring-offset-4 ring-offset-deep-purple">
              <Image
                src="/images/about/anthony-podcast-promo.jpg"
                alt="Anthony Walsh — Roadman Cycling Podcast host"
                fill
                className="object-cover object-top"
                sizes="160px"
                priority
              />
            </div>
            <h1
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-hero)" }}
            >
              THE ROADMAN CYCLING PODCAST
            </h1>
            <p className="text-foreground-muted max-w-xl mx-auto text-lg mb-2">
              Training, nutrition, racing, bike fit and performance after 40—
              searchable across the transcript-backed Roadman archive.
            </p>
            <p className="text-coral font-heading text-xl">
              100M+ PODCAST DOWNLOADS
            </p>
            <Link
              href="/watch"
              className="mt-5 inline-flex rounded-sm border border-coral/50 px-5 py-2.5 font-heading text-sm tracking-wider text-coral transition-colors hover:bg-coral hover:text-deep-purple"
            >
              WATCH CYCLING PODCAST VIDEOS →
            </Link>

            {/* Archive-scope disclosure: the on-site index covers the
                modern episodes that have transcripts and takeaways
                generated; the back catalogue lives on the podcast
                platforms. Stating both numbers explicitly avoids the
                "1,400+ episodes" claim contradicting a list that shows
                ~310 — and routes long-tail listeners to where the
                older episodes actually exist. */}
            <p className="text-foreground-muted max-w-2xl mx-auto text-sm md:text-base mt-6 leading-relaxed">
              Showing{" "}
              <span className="text-off-white font-semibold">
                {allEpisodes.length} full-length episodes
              </span>{" "}
              with transcripts and takeaways. The Roadman Podcast has{" "}
              <span className="text-off-white font-semibold">
                {BRAND_STATS.episodeCountLabel} episodes total
              </span>{" "}
              — older episodes available on{" "}
              <a
                href={PODCAST.appleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-coral hover:text-coral/80 underline-offset-4 hover:underline transition-colors"
              >
                Apple Podcasts
              </a>
              ,{" "}
              <a
                href={PODCAST.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-coral hover:text-coral/80 underline-offset-4 hover:underline transition-colors"
              >
                Spotify
              </a>
              , and{" "}
              <a
                href={PODCAST.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-coral hover:text-coral/80 underline-offset-4 hover:underline transition-colors"
              >
                YouTube
              </a>
              .
            </p>
          </Container>
        </Section>

        {page === 1 && (
          <Section background="charcoal" className="!py-10 md:!py-14">
            <Container>
              <div className="max-w-5xl mx-auto">
                <p className="text-foreground-muted text-center leading-relaxed max-w-3xl mx-auto mb-7">
                  The Roadman Cycling Podcast is a searchable cycling knowledge
                  archive: interviews with WorldTour coaches, sports scientists,
                  professional riders, and practitioners, plus solo episodes that
                  turn those conversations into answers for amateur cyclists. {" "}
                  {PODCAST_HISTORY.summary}
                </p>
                <p className="text-foreground-subtle text-center text-sm leading-relaxed max-w-3xl mx-auto mb-7">
                  This is the canonical show page and full on-site episode
                  archive. Individual episode pages own their guest and topic;
                  the{" "}
                  <Link
                    href="/blog/best-cycling-podcasts-2026"
                    className="text-coral hover:underline underline-offset-4"
                  >
                    cycling podcast comparison guide
                  </Link>{" "}
                  owns independent listening recommendations.
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {PODCAST_START_PATHS.map((path) => (
                    <Link
                      key={path.href}
                      href={path.href}
                      className="group rounded-xl border border-white/10 bg-white/[0.03] p-5 transition-all hover:border-coral/40 hover:bg-coral/[0.06]"
                    >
                      <p className="font-heading text-[10px] tracking-[0.22em] uppercase text-coral mb-2">
                        {path.label}
                      </p>
                      <h2 className="font-heading text-base text-off-white leading-snug group-hover:text-coral transition-colors">
                        {path.title.toUpperCase()} →
                      </h2>
                    </Link>
                  ))}
                </div>
              </div>
            </Container>
          </Section>
        )}

        {/* Search + Episodes (Client Component) */}
        <Section background="charcoal">
          <Container>
            <div className="text-center mb-8">
              <h2
                className="font-heading text-off-white mb-3"
                style={{ fontSize: "var(--text-section)" }}
              >
                SEARCH THE CYCLING PODCAST ARCHIVE
              </h2>
              <p className="text-foreground-muted max-w-2xl mx-auto">
                Search all {allEpisodes.length} on-site episodes by topic, guest
                or title. Filters also apply to the full archive; normal browsing
                remains paginated below.
              </p>
            </div>
            <PodcastSearch
              episodes={episodes}
              searchIndex={podcastSearchIndex}
            />

            {/* Server-rendered pagination */}
            <PodcastPagination
              currentPage={page}
              totalPages={totalPages}
            />
          </Container>
        </Section>

        {/* Social proof — listener voices. Sits before the podcast
            guides so it lands as proof of the archive's value before
            pushing visitors deeper into the cluster content. */}
        <Section background="charcoal" className="border-y border-white/5">
          <Container>
            <ScrollReveal direction="up">
              <SocialProof
                audience="podcast"
                heading="WHAT LISTENERS SAY"
                subheading="From listeners who took the time to write it down — in their own words."
              />
            </ScrollReveal>
          </Container>
        </Section>

        {/* Podcast guides — internal links from the pillar to
            authority cluster articles */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <div className="text-center mb-10">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                PODCAST GUIDES
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto">
                Finding the right cycling podcast for your needs.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  href: "/blog/best-cycling-podcasts-2026",
                  title: "The 20 Best Cycling Podcasts for 2026",
                },
                {
                  href: "/blog/fast-talk-vs-cycling-podcast-vs-roadman",
                  title: "Fast Talk vs Cycling Podcast vs Roadman",
                },
                {
                  href: "/blog/best-cycling-podcast-for-triathletes",
                  title: "Best Cycling Podcast for Triathletes",
                },
                {
                  href: "/blog/podcasts-for-cyclists-over-40",
                  title: "Podcasts for Cyclists Over 40",
                },
              ].map((article) => (
                <Link
                  key={article.href}
                  href={article.href}
                  className="block p-4 rounded-lg bg-white/5 hover:bg-coral/10 border border-white/5 hover:border-coral/30 transition-all group"
                >
                  <p className="font-heading text-sm text-off-white group-hover:text-coral transition-colors tracking-wide">
                    {article.title.toUpperCase()}
                  </p>
                </Link>
              ))}
            </div>
          </Container>
        </Section>

        {page === 1 && (
          <Section background="charcoal" className="!py-12">
            <Container width="narrow">
              <EvidenceBlock
                lastReviewed="25 August 2026"
                reviewedBy="Roadman Cycling editorial team"
              />
            </Container>
          </Section>
        )}
      </main>
      <Footer />
    </>
  );
}
