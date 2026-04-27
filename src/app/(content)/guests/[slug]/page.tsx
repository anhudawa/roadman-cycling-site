import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer, Section, Container } from "@/components/layout";
import { ScrollReveal, Card, Badge, Button } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { getGuestBySlug, getAllGuestSlugs } from "@/lib/guests";
import { getGuestProfileOverride } from "@/lib/guests/profiles";
import { getPostBySlug } from "@/lib/blog";

export async function generateStaticParams() {
  return getAllGuestSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guest = getGuestBySlug(slug);
  if (!guest) return { title: "Guest Not Found" };

  const description = guest.credential
    ? `${guest.name} — ${guest.credential}. ${guest.episodeCount} episode${guest.episodeCount > 1 ? "s" : ""} on The Roadman Cycling Podcast.`
    : `${guest.name} — ${guest.episodeCount} episode${guest.episodeCount > 1 ? "s" : ""} on The Roadman Cycling Podcast. Expert cycling knowledge from world-class guests.`;

  return {
    title: `${guest.name} — Podcast Guest`,
    description,
    alternates: {
      canonical: `https://roadmancycling.com/guests/${slug}`,
    },
    openGraph: {
      title: `${guest.name} on The Roadman Cycling Podcast`,
      description,
      type: "profile",
      url: `https://roadmancycling.com/guests/${slug}`,
    },
  };
}

export default async function GuestPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guest = getGuestBySlug(slug);

  if (!guest) {
    notFound();
  }

  // Sort episodes newest first
  const sortedEpisodes = [...guest.episodes].sort(
    (a, b) =>
      new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  );

  // Curated entity overrides for featured guests (Wikipedia + Wikidata links,
  // verified social profiles, team/university affiliation). Absent for
  // long-tail guests; in that case the Person schema falls back to the
  // heuristic fields computed from episode data.
  const override = getGuestProfileOverride(slug);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": ["Person", "ProfilePage"],
          name: guest.name,
          mainEntity: {
            "@type": "Person",
            name: guest.name,
          },
          ...(guest.credential && { jobTitle: guest.credential }),
          description:
            override?.whyMatters ??
            override?.description ??
            (guest.credential
              ? `${guest.name} — ${guest.credential}. Expert guest on The Roadman Cycling Podcast.`
              : `${guest.name} — expert guest on The Roadman Cycling Podcast.`),
          url: `https://roadmancycling.com/guests/${slug}`,
          ...(override?.image && { image: override.image }),
          // sameAs is the single strongest Knowledge Graph disambiguation
          // signal — it tells Google our "Greg LeMond" is THE Greg LeMond,
          // not some other person with the same name.
          ...(override?.sameAs &&
            override.sameAs.length > 0 && { sameAs: override.sameAs }),
          ...(override?.worksFor && {
            worksFor: {
              "@type": override.worksFor.type,
              name: override.worksFor.name,
              ...(override.worksFor.url && { url: override.worksFor.url }),
            },
          }),
          // hasOccupation is richer than jobTitle — it carries the credential
          // string plus the inferred occupational category and the cycling/
          // endurance pillars this guest is known for, so AI assistants can
          // ground "what does X do?" queries with the same answer that
          // appears on the visible page.
          ...(guest.credential && {
            hasOccupation: {
              "@type": "Occupation",
              name: guest.credential,
              occupationalCategory: "Sports / Endurance Performance",
              skills: guest.pillars.map((p) =>
                p === "coaching"
                  ? "cycling coaching"
                  : p === "nutrition"
                    ? "cycling nutrition"
                    : p === "recovery"
                      ? "cycling recovery"
                      : p === "strength"
                        ? "strength training for cyclists"
                        : p === "community"
                          ? "cycling culture"
                          : p
              ),
            },
          }),
          // memberOf mirrors worksFor for guests with a verified team /
          // university affiliation — gives Google a redundant Organization
          // reference under the relationship Schema actually documents for
          // sports professionals.
          ...(override?.worksFor && {
            memberOf: {
              "@type": override.worksFor.type,
              name: override.worksFor.name,
              ...(override.worksFor.url && { url: override.worksFor.url }),
            },
          }),
          knowsAbout: guest.pillars.map((p) =>
            p === "coaching"
              ? "cycling coaching"
              : p === "nutrition"
                ? "cycling nutrition"
                : p === "recovery"
                  ? "cycling recovery"
                  : p === "strength"
                    ? "strength training for cyclists"
                    : p === "community"
                      ? "cycling culture"
                      : p
          ),
          subjectOf: guest.episodes.slice(0, 5).map((ep) => ({
            "@type": "PodcastEpisode",
            name: ep.title,
            url: `https://roadmancycling.com/podcast/${ep.slug}`,
          })),
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
              name: "Guests",
              item: "https://roadmancycling.com/guests",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: guest.name,
              item: `https://roadmancycling.com/guests/${slug}`,
            },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow">
            <Breadcrumbs items={[{ label: "Guests", href: "/guests" }, { label: guest.name }]} />
          </Container>
          <Container width="narrow" className="text-center">
            <ScrollReveal direction="up">
              <p className="text-coral font-heading text-lg mb-4 tracking-widest">
                PODCAST GUEST
              </p>
              <h1 className="font-heading text-off-white text-4xl md:text-6xl leading-tight mb-4">
                {guest.name.toUpperCase()}
              </h1>

              {guest.credential && (
                <p className="text-foreground-muted text-lg mb-6">
                  {guest.credential}
                </p>
              )}

              <div className="flex items-center justify-center gap-4 text-sm text-foreground-subtle">
                <span>
                  {guest.episodeCount} episode
                  {guest.episodeCount > 1 ? "s" : ""}
                </span>
                <span>&middot;</span>
                <div className="flex gap-2">
                  {guest.pillars.map((pillar) => (
                    <Badge
                      key={pillar}
                      pillar={pillar}
                      size="sm"
                    />
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Why this guest matters — visible entity context for AEO/SGE.
            Renders the literal answer to "who is X?" and "why is X
            famous?" on the page so Google and LLMs can quote it. */}
        {(override?.whyMatters || override?.description) && (
          <Section background="charcoal" className="!pt-12 !pb-6">
            <Container width="narrow">
              <ScrollReveal direction="up">
                <h2
                  className="font-heading text-off-white mb-4 tracking-wide"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  WHO IS {guest.name.toUpperCase()}?
                </h2>
                <p className="text-foreground-muted text-base leading-relaxed">
                  {override?.whyMatters ?? override?.description}
                </p>
              </ScrollReveal>
            </Container>
          </Section>
        )}

        {/* Key ideas — short, citable claims this expert is known for.
            Bullet structure is what AI search engines pull cleanly. */}
        {override?.keyIdeas && override.keyIdeas.length > 0 && (
          <Section background="charcoal" className="!pt-6 !pb-12">
            <Container width="narrow">
              <ScrollReveal direction="up">
                <h2 className="font-heading text-off-white mb-4 text-2xl tracking-wide">
                  KEY IDEAS
                </h2>
                <p className="text-sm text-foreground-muted mb-6">
                  The major positions {guest.name.split(" ").slice(-1)[0]} is
                  known for in cycling and endurance sport.
                </p>
                <ul className="space-y-3">
                  {override.keyIdeas.map((idea, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-foreground-muted text-base leading-relaxed"
                    >
                      <span
                        aria-hidden="true"
                        className="text-coral font-heading shrink-0"
                      >
                        →
                      </span>
                      <span>{idea}</span>
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
            </Container>
          </Section>
        )}

        {/* Episodes */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2
                className="font-heading text-off-white mb-4 tracking-wide"
                style={{ fontSize: "var(--text-section)" }}
              >
                ON THE ROADMAN PODCAST
              </h2>
              <p className="text-sm text-foreground-muted mb-8">
                Every appearance by {guest.name} on The Roadman Cycling
                Podcast — {guest.episodeCount} episode
                {guest.episodeCount > 1 ? "s" : ""} in total.
              </p>
            </ScrollReveal>

            <div className="space-y-4">
              {sortedEpisodes.map((ep, i) => (
                <ScrollReveal key={ep.slug} direction="up" delay={i * 0.05}>
                  <Link
                    href={`/podcast/${ep.slug}`}
                    className="block group"
                  >
                    <Card className="p-6 transition-all group-hover:border-coral/30">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge pillar={ep.pillar} size="sm" />
                          </div>
                          <h3 className="font-heading text-lg text-off-white group-hover:text-coral transition-colors leading-snug">
                            {ep.title}
                          </h3>
                          <p className="text-sm text-foreground-subtle mt-2 line-clamp-2">
                            {ep.description}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs text-foreground-subtle">
                            {ep.duration}
                          </span>
                          <br />
                          <time
                            className="text-xs text-foreground-subtle"
                            dateTime={ep.publishDate}
                          >
                            {new Date(ep.publishDate).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </time>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </ScrollReveal>
              ))}
            </div>

            {/* Featured articles — blog posts that explicitly cite this
                guest. Creates bidirectional entity↔content links from the
                guest page into the blog cluster. */}
            {override?.featuredArticles && override.featuredArticles.length > 0 && (() => {
              const articles = override.featuredArticles
                .map((s) => getPostBySlug(s))
                .filter((p): p is NonNullable<typeof p> => p !== null);
              if (articles.length === 0) return null;
              return (
                <div className="mt-16">
                  <h2 className="font-heading text-2xl text-off-white mb-4 tracking-wide">
                    FEATURED IN THESE GUIDES
                  </h2>
                  <p className="text-sm text-foreground-muted mb-6">
                    Roadman blog articles that reference {guest.name}&rsquo;s
                    work.
                  </p>
                  <div className="space-y-3">
                    {articles.map((a) => (
                      <Link
                        key={a.slug}
                        href={`/blog/${a.slug}`}
                        className="block p-4 rounded-lg bg-white/5 hover:bg-coral/10 border border-white/5 hover:border-coral/30 transition-all group"
                      >
                        <p className="font-heading text-sm text-off-white group-hover:text-coral transition-colors tracking-wide mb-1">
                          {a.title}
                        </p>
                        <p className="text-xs text-foreground-subtle">
                          {a.excerpt.slice(0, 140)}
                          {a.excerpt.length > 140 ? "…" : ""}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Key quotes from this guest's episodes */}
            {(() => {
              const allQuotes = sortedEpisodes
                .flatMap((ep) =>
                  (ep.keyQuotes || [])
                    .filter((q) => q.speaker === guest.name)
                    .map((q) => ({ ...q, episodeSlug: ep.slug }))
                )
                .slice(0, 3);
              if (allQuotes.length === 0) return null;
              return (
                <div className="mt-16">
                  <h2 className="font-heading text-2xl text-off-white mb-6 tracking-wide">
                    IN THEIR OWN WORDS
                  </h2>
                  <div className="space-y-4">
                    {allQuotes.map((q, i) => (
                      <blockquote
                        key={i}
                        className="rounded-xl border-l-4 border-l-coral bg-white/[0.03] p-5"
                      >
                        <p className="text-foreground-muted text-sm leading-relaxed italic">
                          &ldquo;{q.text}&rdquo;
                        </p>
                        <footer className="mt-2 text-xs text-foreground-subtle">
                          — {q.speaker}
                          {q.credential && `, ${q.credential}`}
                        </footer>
                      </blockquote>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Related topics — prefers curated relatedHubs override
                (specific to the guest's actual subject-matter focus),
                falls back to the auto-derived pillar→topic mapping. */}
            {(() => {
              const TOPIC_TITLES: Record<string, string> = {
                "ftp-training": "FTP Training",
                "cycling-nutrition": "Cycling Nutrition",
                "cycling-training-plans": "Training Plans",
                "cycling-recovery": "Recovery",
                "cycling-strength-conditioning": "Strength & Conditioning",
                "cycling-weight-loss": "Cycling & Weight Loss",
                "cycling-beginners": "Getting Into Cycling",
                "triathlon-cycling": "Triathlon Cycling",
                "mountain-biking": "Mountain Biking",
                "cycling-coaching": "Cycling Coaching",
              };
              const pillarFallback: string[] = guest.pillars
                .map((pillar) => {
                  const map: Record<string, string> = {
                    coaching: "cycling-coaching",
                    nutrition: "cycling-nutrition",
                    strength: "cycling-strength-conditioning",
                    recovery: "cycling-recovery",
                    community: "cycling-beginners",
                  };
                  return map[pillar];
                })
                .filter(Boolean);
              const hubs =
                override?.relatedHubs && override.relatedHubs.length > 0
                  ? override.relatedHubs
                  : pillarFallback;
              if (hubs.length === 0) return null;
              return (
                <div className="mt-12 text-center">
                  <p className="font-heading text-coral text-xs tracking-widest mb-4">
                    EXPLORE RELATED TOPICS
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {hubs.map((slug) => {
                      const title = TOPIC_TITLES[slug];
                      if (!title) return null;
                      return (
                        <Link
                          key={slug}
                          href={`/topics/${slug}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/15 hover:border-coral/40 bg-white/[0.04] hover:bg-white/[0.07] px-4 py-2 text-sm font-heading text-off-white tracking-wider transition-all"
                        >
                          {title} →
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Coaching CTA */}
            <div className="mt-12 rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-6 md:p-8 text-center">
              <p className="font-heading text-coral text-xs tracking-widest mb-2">
                TRAIN WITH THE KNOWLEDGE
              </p>
              <p className="text-off-white font-heading text-lg mb-4">
                Apply the insights from {guest.name}&rsquo;s episodes to your own training.
              </p>
              <Link
                href="/apply"
                className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm transition-all"
                data-track={`guest_${slug}_apply`}
              >
                Apply for Coaching →
              </Link>
            </div>

            {/* Back + CTA */}
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/guests" variant="ghost">
                &larr; All Guests
              </Button>
              <Button href="/podcast">
                Browse All Episodes
              </Button>
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
