import type { Metadata } from "next";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Card } from "@/components/ui";

export const metadata: Metadata = {
  title: "Cycling Tools & Calculators",
  description:
    "Free interactive tools for serious cyclists. Tyre pressure, FTP zones, race weight, fuelling, energy availability, and shock pressure calculators.",
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
      "Optimal front and rear PSI based on your weight, tyre width, road surface, and conditions.",
    href: "/tools/tyre-pressure",
    status: "coming-soon" as const,
  },
  {
    title: "Race Weight Calculator",
    description:
      "Your target weight range for peak cycling performance based on height, body composition, and event type.",
    href: "/tools/race-weight",
    status: "coming-soon" as const,
  },
  {
    title: "In-Ride Fuelling Calculator",
    description:
      "Exactly how many carbs and how much fluid you need per hour based on ride duration, intensity, and weight.",
    href: "/tools/fuelling",
    status: "coming-soon" as const,
  },
  {
    title: "Energy Availability Calculator",
    description:
      "Check whether you're eating enough to support your training. Identify RED-S risk before it becomes a problem.",
    href: "/tools/energy-availability",
    status: "coming-soon" as const,
  },
  {
    title: "Shock Pressure Calculator",
    description:
      "Recommended air pressure and sag percentage for your suspension based on rider weight and riding style.",
    href: "/tools/shock-pressure",
    status: "coming-soon" as const,
  },
];

export default function ToolsPage() {
  return (
    <>
      <Header />
      <main>
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container className="text-center">
            <h1
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              YOUR TOOLKIT
            </h1>
            <p className="text-foreground-muted max-w-xl mx-auto text-lg">
              Free tools built on the same science discussed on the podcast.
              Stop guessing. Start knowing.
            </p>
          </Container>
        </Section>

        <Section background="charcoal">
          <Container>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool) => (
                <Card
                  key={tool.href}
                  href={tool.status === "live" ? tool.href : undefined}
                  className="p-6 group"
                  hoverable={tool.status === "live"}
                >
                  {tool.status === "coming-soon" && (
                    <span className="inline-block text-xs font-body font-medium text-foreground-subtle bg-white/5 border border-white/10 rounded-full px-3 py-1 mb-3">
                      Coming Soon
                    </span>
                  )}
                  <h3
                    className={`font-heading text-xl mb-2 ${
                      tool.status === "live"
                        ? "text-off-white group-hover:text-coral transition-colors"
                        : "text-foreground-subtle"
                    }`}
                  >
                    {tool.title.toUpperCase()}
                  </h3>
                  <p
                    className={`text-sm leading-relaxed mb-4 ${
                      tool.status === "live"
                        ? "text-foreground-muted"
                        : "text-foreground-subtle"
                    }`}
                  >
                    {tool.description}
                  </p>
                  {tool.status === "live" && (
                    <span className="text-coral text-sm font-body font-medium">
                      Try it free &rarr;
                    </span>
                  )}
                </Card>
              ))}
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
