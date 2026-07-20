import type { Metadata } from "next";
import { Container, Footer, Header, Section } from "@/components/layout";
import { RideZonesApp } from "@/components/features/ridezones";

export const metadata: Metadata = {
  title: "RideZones App — Your Riding History, Analysed | Roadman Cycling",
  description:
    "Import your riding history and get your fitness profile across eight systems, per-ride execution scores, your race recipe, and a goal-specific training week. Runs entirely in your browser.",
  alternates: {
    canonical: "https://roadmancycling.com/ridezones/app",
  },
  openGraph: {
    title: "RideZones App — Your Riding History, Analysed",
    description:
      "Eight-system fitness profile, execution scoring, race recipe analysis, and a training week built from your zones.",
    type: "website",
    url: "https://roadmancycling.com/ridezones/app",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "RideZones by Roadman Cycling",
      },
    ],
  },
};

export default function RideZonesAppPage() {
  return (
    <>
      <Header />
      <main>
        <Section background="charcoal" className="min-h-screen pt-28 md:pt-32">
          <Container width="wide">
            <div className="mb-10">
              <p
                className="mb-2 text-xs font-semibold uppercase tracking-widest text-coral"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                RideZones
              </p>
              <h1 className="font-heading text-4xl uppercase tracking-wide text-off-white md:text-5xl">
                Your riding, read honestly
              </h1>
            </div>
            <RideZonesApp />
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
