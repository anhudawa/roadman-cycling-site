import type { Metadata } from "next";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Card, ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Cycling Tools & Calculators",
  description:
    "Free interactive tools for serious cyclists. Tyre pressure, FTP zones, race weight, fuelling, energy availability, and shock pressure calculators.",
  alternates: {
    canonical: "https://roadmancycling.com/tools",
  },
  openGraph: {
    title: "Cycling Tools & Calculators",
    description:
      "Free interactive tools for serious cyclists. Tyre pressure, FTP zones, race weight, fuelling, energy availability, and shock pressure calculators.",
    type: "website",
    url: "https://roadmancycling.com/tools",
  },
};

const tools = [
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
          isPartOf: {
            "@type": "WebSite",
            name: "Roadman Cycling",
            url: "https://roadmancycling.com",
          },
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

        <Section background="deep-purple">
          <Container>
            <div className="text-center mb-10">
              <p className="font-heading tracking-[0.3em] text-coral text-sm mb-2">
                Premium
              </p>
              <h2
                className="font-heading text-off-white"
                style={{ fontSize: "var(--text-section)" }}
              >
                Decode something deeper
              </h2>
              <p className="text-foreground-muted mt-3 max-w-xl mx-auto">
                When the calculators don&apos;t go far enough — when you&apos;ve got
                bloodwork in hand and you need it read through a cycling lens.
              </p>
            </div>
            <div className="max-w-3xl mx-auto">
              <Card href="/blood-engine" className="p-8 group">
                <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                  <h3 className="font-heading text-2xl text-off-white group-hover:text-coral transition-colors uppercase">
                    Blood Engine
                  </h3>
                  <span className="text-xs font-heading uppercase tracking-wider text-coral border border-coral/40 rounded-full px-3 py-1">
                    €97 lifetime
                  </span>
                </div>
                <p className="text-foreground-muted mb-4">
                  Cycling-specific bloodwork interpretation for masters
                  cyclists. Upload any blood test, get a report tuned to
                  athlete-optimal ranges — not the generic lab norms your GP
                  reads from. Every retest decoded forever.
                </p>
                <span className="text-coral text-sm font-body font-medium">
                  How it works &rarr;
                </span>
              </Card>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
