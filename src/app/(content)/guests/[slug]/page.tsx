import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer, Section, Container } from "@/components/layout";
import { ScrollReveal, Card, Badge, Button } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { getGuestBySlug, getAllGuestSlugs } from "@/lib/guests";

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
    title: `${guest.name} — Roadman Cycling Podcast Guest`,
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

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: guest.name,
          description: guest.credential || `Podcast guest on The Roadman Cycling Podcast`,
          url: `https://roadmancycling.com/guests/${slug}`,
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

        {/* Episodes */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2
                className="font-heading text-off-white mb-8"
                style={{ fontSize: "var(--text-section)" }}
              >
                EPISODES WITH {guest.name.toUpperCase()}
              </h2>
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
