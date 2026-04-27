import type { Metadata } from "next";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Card, ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { ENTITY_IDS } from "@/lib/brand-facts";

export const metadata: Metadata = {
  title: "Cycling Tools & Calculators",
  description:
    "Free interactive tools for serious cyclists. Plateau Diagnostic, Ask Roadman, Coaching Assessment, plus calculators for FTP zones, tyre pressure, race weight, fuelling, energy availability, and shock pressure.",
  alternates: {
    canonical: "https://roadmancycling.com/tools",
  },
  openGraph: {
    title: "Cycling Tools & Calculators",
    description:
      "Free interactive tools for serious cyclists. Plateau Diagnostic, Ask Roadman, Coaching Assessment, plus calculators for FTP zones, tyre pressure, race weight, fuelling, energy availability, and shock pressure.",
    type: "website",
    url: "https://roadmancycling.com/tools",
  },
};

const tools = [
  {
    title: "Race Predictor",
    description:
      "Enter your FTP, weight, and course — we simulate the ride on real elevation data and give you a finish time within ±3%. Free for the prediction. The $29 Race Report adds your full pacing plan, fuelling strategy, and equipment what-ifs.",
    href: "/predict",
    status: "live" as const,
  },
  {
    title: "Plateau Diagnostic",
    description:
      "Stuck on the same FTP for a year? Twelve questions. Four minutes. One specific answer keyed to your limiter.",
    href: "/plateau",
    status: "live" as const,
  },
  {
    title: "Ask Roadman",
    description:
      "Anthony's coaching brain on tap. Ask any cycling question and get an answer grounded in 1,400+ episodes with World Tour coaches and sports scientists.",
    href: "/ask",
    status: "live" as const,
  },
  {
    title: "Coaching Assessment",
    description:
      "Ten questions to surface the right coaching pathway for where you are now — Clubhouse, Not Done Yet, or 1:1.",
    href: "/assessment",
    status: "live" as const,
  },
  {
    title: "FTP Zone Calculator",
    description:
      "Enter your FTP and get your complete 7-zone power table with training recommendations for each zone.",
    href: "/tools/ftp-zones",
    status: "live" as const,
  },
  {
    title: "Tyre Pressure Calculator",
    description:
      "SILCA-grade front and rear PSI based on weight, tyre width, rim width, tube type, and road surface.",
    href: "/tools/tyre-pressure",
    status: "live" as const,
  },
  {
    title: "Race Weight Calculator",
    description:
      "Your target weight range for peak cycling performance based on height, body composition, and event type.",
    href: "/tools/race-weight",
    status: "live" as const,
  },
  {
    title: "In-Ride Fuelling Calculator",
    description:
      "Exactly how many carbs and how much fluid you need per hour based on ride duration, intensity, and weight.",
    href: "/tools/fuelling",
    status: "live" as const,
  },
  {
    title: "Energy Availability Calculator",
    description:
      "Check whether you're eating enough to support your training. Identify RED-S risk before it becomes a problem.",
    href: "/tools/energy-availability",
    status: "live" as const,
  },
  {
    title: "MTB Setup Calculator",
    description:
      "Suspension pressure, sag targets, and tyre pressure for your mountain bike. One form, complete setup.",
    href: "/tools/shock-pressure",
    status: "live" as const,
  },
];

export default function ToolsPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Cycling Tools & Calculators",
          description:
            "Free interactive tools for serious cyclists. Tyre pressure, FTP zones, race weight, fuelling, energy availability, and shock pressure calculators.",
          url: "https://roadmancycling.com/tools",
          numberOfItems: tools.length,
          isPartOf: { "@id": ENTITY_IDS.website },
        }}
      />
      <Header />
      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container className="text-center">
            <ScrollReveal direction="up">
              <h1
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-hero)" }}
              >
                YOUR TOOLKIT
              </h1>
              <p className="text-foreground-muted max-w-xl mx-auto text-lg">
                Free tools built on the same science discussed on the podcast.
                Stop guessing. Start knowing.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        <Section background="charcoal">
          <Container>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool, i) => (
                <ScrollReveal key={tool.href} direction="up" delay={i * 0.06}>
                <Card
                  href={tool.href}
                  className="p-6 group h-full"
                >
                  <h3
                    className="font-heading text-xl mb-2 text-off-white group-hover:text-coral transition-colors"
                  >
                    {tool.title.toUpperCase()}
                  </h3>
                  <p
                    className="text-sm leading-relaxed mb-4 text-foreground-muted"
                  >
                    {tool.description}
                  </p>
                  <span className="text-coral text-sm font-body font-medium">
                    Try it free &rarr;
                  </span>
                </Card>
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
