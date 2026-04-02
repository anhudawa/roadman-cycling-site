import type { Metadata } from "next";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Card, Badge } from "@/components/ui";
import { getAllEpisodes } from "@/lib/podcast";
import { type ContentPillar, CONTENT_PILLARS } from "@/types";

export const metadata: Metadata = {
  title: "Podcast Archive — The Roadman Cycling Podcast",
  description:
    "Browse every episode of the Roadman Cycling Podcast. 100M+ downloads. Expert interviews with Professor Seiler, Dan Lorang, Lachlan Morton, and more.",
};

export default async function PodcastPage({
  searchParams,
}: {
  searchParams: Promise<{ pillar?: string; type?: string }>;
}) {
  const { pillar: pillarFilter, type: typeFilter } = await searchParams;
  let episodes = getAllEpisodes();

  if (pillarFilter) {
    episodes = episodes.filter((ep) => ep.pillar === pillarFilter);
  }
  if (typeFilter) {
    episodes = episodes.filter((ep) => ep.type === typeFilter);
  }

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container className="text-center">
            <h1
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              THE ARCHIVE
            </h1>
            <p className="text-foreground-muted max-w-xl mx-auto text-lg mb-2">
              Every conversation. Every insight. Searchable, filterable, and
              ready for you.
            </p>
            <p className="text-coral font-heading text-xl">
              {episodes.length} EPISODES &middot; 100M+ DOWNLOADS
            </p>
          </Container>
        </Section>

        {/* Filters */}
        <Section background="charcoal" className="!py-6 border-b border-white/5">
          <Container>
            <div className="flex flex-col gap-3">
              {/* Pillar filter */}
              <div className="flex flex-wrap gap-2 justify-center">
                <a
                  href="/podcast"
                  className={`px-4 py-2 rounded-full text-sm font-body transition-colors ${
                    !pillarFilter && !typeFilter
                      ? "bg-coral text-off-white"
                      : "bg-white/5 text-foreground-muted hover:bg-white/10"
                  }`}
                >
                  All
                </a>
                {(Object.keys(CONTENT_PILLARS) as ContentPillar[]).map(
                  (key) => (
                    <a
                      key={key}
                      href={`/podcast?pillar=${key}`}
                      className={`px-4 py-2 rounded-full text-sm font-body transition-colors ${
                        pillarFilter === key
                          ? "bg-coral text-off-white"
                          : "bg-white/5 text-foreground-muted hover:bg-white/10"
                      }`}
                    >
                      {CONTENT_PILLARS[key].label}
                    </a>
                  )
                )}
              </div>

              {/* Type filter */}
              <div className="flex flex-wrap gap-2 justify-center">
                {(
                  [
                    ["interview", "Interviews"],
                    ["solo", "Solo"],
                    ["panel", "Panel"],
                    ["sarah-anthony", "Sarah & Anthony"],
                  ] as const
                ).map(([type, label]) => (
                  <a
                    key={type}
                    href={`/podcast?type=${type}`}
                    className={`px-3 py-1.5 rounded-full text-xs font-body transition-colors ${
                      typeFilter === type
                        ? "bg-purple text-off-white"
                        : "bg-white/5 text-foreground-subtle hover:bg-white/10"
                    }`}
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </Container>
        </Section>

        {/* Episodes Grid */}
        <Section background="charcoal">
          <Container>
            {episodes.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-foreground-muted text-lg">
                  No episodes found. Try a different filter.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {episodes.map((episode) => (
                  <Card
                    key={episode.slug}
                    href={`/podcast/${episode.slug}`}
                    className="p-5 md:p-6 group"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Episode Number */}
                      <div className="shrink-0 w-14 h-14 rounded-lg bg-deep-purple flex items-center justify-center">
                        <span className="font-heading text-xl text-coral">
                          {episode.episodeNumber}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge pillar={episode.pillar} />
                          <span className="text-xs text-foreground-subtle capitalize">
                            {episode.type.replace("-", " & ")}
                          </span>
                        </div>
                        <h2 className="font-heading text-lg md:text-xl text-off-white group-hover:text-coral transition-colors leading-tight">
                          {episode.title.toUpperCase()}
                        </h2>
                        {episode.guest && (
                          <p className="text-sm text-foreground-muted mt-1">
                            with {episode.guest}
                            {episode.guestCredential && (
                              <span className="text-foreground-subtle">
                                {" "}
                                &mdash; {episode.guestCredential}
                              </span>
                            )}
                          </p>
                        )}
                      </div>

                      {/* Duration & Date */}
                      <div className="shrink-0 text-right">
                        <p className="font-heading text-lg text-off-white">
                          {episode.duration}
                        </p>
                        <p className="text-xs text-foreground-subtle">
                          {new Date(episode.publishDate).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
