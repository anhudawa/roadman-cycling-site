import type { Metadata } from "next";
import { Header, Footer } from "@/components/layout";
import { JsonLd } from "@/components/seo/JsonLd";
import { ENTITY_IDS } from "@/lib/brand-facts";
import { RACES } from "@/data/races";
import { RaceGrid } from "./RaceGrid";

export const metadata: Metadata = {
  title: "Major Cycling Sportives & Gran Fondos — Race Guides | Roadman Cycling",
  description:
    "Complete race guides for 20+ major cycling sportives and gran fondos — Étape du Tour, La Marmotte, Fred Whitton, Ötztaler Radmarathon, Maratona dles Dolomites and more. Distances, elevation, finish times and training advice from Roadman Cycling.",
  alternates: { canonical: "https://roadmancycling.com/races" },
  openGraph: {
    title: "Major Cycling Sportives & Gran Fondos — Race Guides",
    description:
      "Race guides for 20+ major sportives. Key stats, climbs, finish times by ability and training advice.",
    type: "website",
    url: "https://roadmancycling.com/races",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling Race Guides" }],
  },
  robots: { index: true, follow: true },
};

export default function RacesPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Major Cycling Sportives & Gran Fondos",
    description:
      "Race guides for 20+ major cycling sportives and gran fondos worldwide.",
    url: "https://roadmancycling.com/races",
    publisher: { "@id": ENTITY_IDS.organization },
    numberOfItems: RACES.length,
    itemListElement: RACES.map((race, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://roadmancycling.com/races/${race.slug}`,
      name: race.name,
    })),
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <Header />
      <main id="main-content">
        {/* Hero */}
        <section className="relative bg-deep-purple overflow-hidden pt-32 pb-14">
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(76, 18, 115, 0.6) 0%, transparent 70%)",
            }}
          />
          <div className="relative max-w-[1200px] mx-auto w-full px-5 md:px-8 text-center">
            <p className="font-heading text-coral tracking-widest text-xs uppercase mb-4">
              Race Guides
            </p>
            <h1
              className="font-heading text-off-white leading-[0.9] mb-6"
              style={{ fontSize: "clamp(3rem, 7vw, 6rem)" }}
            >
              MAJOR SPORTIVES<br />& GRAN FONDOS
            </h1>
            <p className="text-foreground-muted max-w-2xl mx-auto text-lg leading-relaxed">
              Key stats, climbs, finish times and training insight for the world&rsquo;s most
              significant cycling events — grounded in conversations with the coaches who&rsquo;ve
              prepared riders for all of them.
            </p>
          </div>
        </section>

        {/* Grid */}
        <section className="bg-charcoal py-16">
          <div className="max-w-[1200px] mx-auto w-full px-5 md:px-8">
            <RaceGrid races={RACES} />
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="bg-deep-purple border-t border-white/10 py-16">
          <div className="max-w-[1200px] mx-auto w-full px-5 md:px-8 text-center">
            <p className="font-heading text-coral tracking-widest text-xs uppercase mb-4">
              Ask Roadman
            </p>
            <h2
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
            >
              GOT A RACE QUESTION?
            </h2>
            <p className="text-foreground-muted max-w-xl mx-auto mb-8 leading-relaxed">
              Ask Roadman is the on-site AI assistant grounded in 1,400+ podcast conversations
              with World Tour coaches and sports scientists. Ask anything about race preparation,
              pacing strategy or training for your target event.
            </p>
            <a
              href="/ask"
              className="inline-block font-heading tracking-wider uppercase text-sm bg-coral hover:bg-coral-hover text-off-white px-8 py-4 rounded-md transition-colors"
            >
              Ask a Race Question
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
