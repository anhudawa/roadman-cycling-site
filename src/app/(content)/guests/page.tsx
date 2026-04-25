import type { Metadata } from "next";
import { Header, Footer, Section, Container } from "@/components/layout";
import { ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { getAllGuests } from "@/lib/guests";
import { GuestGrid } from "@/components/features/guests/GuestGrid";

export const metadata: Metadata = {
  title: "Podcast Guests $— World-Class Coaches, Scientists & Pro Cyclists",
  description:
    "Browse every guest who's appeared on The Roadman Cycling Podcast. World Tour coaches, exercise scientists, pro cyclists, nutritionists, and endurance athletes sharing real knowledge.",
  alternates: {
    canonical: "https://roadmancycling.com/guests",
  },
  openGraph: {
    title: "Podcast Guests $— World-Class Coaches, Scientists & Pro Cyclists",
    description:
      "Browse every guest who's appeared on The Roadman Cycling Podcast. World Tour coaches, exercise scientists, pro cyclists, nutritionists, and endurance athletes sharing real knowledge.",
    type: "website",
    url: "https://roadmancycling.com/guests",
  },
};

export default function GuestsPage() {
  const guests = getAllGuests();

  // Serialize only what the client component needs
  const guestCards = guests.map((g) => ({
    name: g.name,
    slug: g.slug,
    credential: g.credential,
    episodeCount: g.episodeCount,
    pillars: g.pillars,
    tags: g.tags,
  }));

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

      <main id="main-content">
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
                World-class coaches, scientists, pro cyclists, and endurance
                athletes who&apos;ve shared their knowledge on the podcast.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Guest Grid with filters */}
        <Section background="charcoal">
          <Container>
            <GuestGrid guests={guestCards} />
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
