import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { ScrollReveal, Card, Badge, AnimatedCounter } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { getAllGuests } from "@/lib/guests";

export const metadata: Metadata = {
  title: "Podcast Guests — World-Class Coaches, Scientists & Pro Cyclists",
  description:
    "Browse every guest who's appeared on The Roadman Cycling Podcast. World Tour coaches, exercise scientists, pro cyclists, nutritionists, and endurance athletes sharing real knowledge.",
  alternates: {
    canonical: "https://roadmancycling.com/guests",
  },
};

export default function GuestsPage() {
  const guests = getAllGuests();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Podcast Guests",
          description:
            "Every guest who has appeared on The Roadman Cycling Podcast",
          url: "https://roadmancycling.com/guests",
          isPartOf: {
            "@type": "WebSite",
            name: "Roadman Cycling",
            url: "https://roadmancycling.com",
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
              name: "Guests",
              item: "https://roadmancycling.com/guests",
            },
          ],
        }}
      />

      <Header />

      <main>
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container className="text-center">
            <ScrollReveal direction="up">
              <h1
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-hero)" }}
              >
                THE EXPERTS
              </h1>
              <p className="text-foreground-muted max-w-xl mx-auto text-lg">
                <span className="text-off-white font-heading text-2xl"><AnimatedCounter value={String(guests.length)} /></span>{" "}
                world-class coaches, scientists, pro cyclists,
                and endurance athletes who&apos;ve shared their knowledge on the
                podcast.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Guest Grid */}
        <Section background="charcoal">
          <Container>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {guests.map((guest, i) => (
                <ScrollReveal
                  key={guest.slug}
                  direction="up"
                  delay={Math.min(i * 0.03, 0.3)}
                >
                  <Link href={`/guests/${guest.slug}`} className="block group">
                    <Card className="p-6 h-full transition-all group-hover:border-coral/30">
                      <div className="flex items-start justify-between mb-3">
                        <h2 className="font-heading text-xl text-off-white group-hover:text-coral transition-colors">
                          {guest.name.toUpperCase()}
                        </h2>
                        <span className="text-xs text-foreground-subtle font-heading whitespace-nowrap ml-3">
                          {guest.episodeCount}{" "}
                          {guest.episodeCount === 1 ? "EP" : "EPS"}
                        </span>
                      </div>

                      {guest.credential && (
                        <p className="text-sm text-foreground-muted mb-3 leading-relaxed">
                          {guest.credential}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {guest.pillars.map((pillar) => (
                          <Badge
                            key={pillar}
                            pillar={pillar}
                            size="sm"
                          />
                        ))}
                      </div>
                    </Card>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
