import type { Metadata } from "next";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Strength Training for Cyclists — The Complete S&C Course",
  description:
    "The strength and conditioning program built specifically for cyclists. 114 cyclists are already using it. Built on the same principles discussed with World Tour coaches on the podcast.",
};

const modules = [
  {
    title: "Foundation",
    description: "Movement patterns, mobility assessment, and building the base. No gym experience required.",
  },
  {
    title: "Power Development",
    description: "Exercises that transfer directly to the bike. Squats, deadlifts, and single-leg work programmed for cyclists.",
  },
  {
    title: "Core & Stability",
    description: "The anti-rotation and stability work that keeps you efficient when fatigue kicks in at the end of a race or sportive.",
  },
  {
    title: "Injury Prevention",
    description: "The prehab exercises that keep you on the bike. Address the common cyclist imbalances before they become injuries.",
  },
  {
    title: "In-Season Programming",
    description: "How to maintain strength without compromising your riding. The minimal effective dose approach.",
  },
  {
    title: "Integration",
    description: "How to fit S&C around your training plan. Weekly templates for different training loads and phases.",
  },
];

export default function StrengthTrainingPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: "Strength Training for Cyclists",
          description:
            "Complete S&C course for cyclists. 6 modules, video instruction, programming templates.",
          brand: { "@type": "Brand", name: "Roadman Cycling" },
          offers: {
            "@type": "Offer",
            price: "49.99",
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
          },
        }}
      />

      <Header />

      <main>
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-16">
          <Container className="text-center">
            <ScrollReveal direction="up">
              <p className="text-coral font-heading text-lg mb-4">
                THE ROADMAN S&amp;C COURSE
              </p>
              <h1
                className="font-heading text-off-white mb-6"
                style={{ fontSize: "var(--text-hero)" }}
              >
                STRENGTH
                <br />
                <span className="text-coral">FOR CYCLISTS</span>
              </h1>
              <p className="text-foreground-muted text-xl max-w-2xl mx-auto mb-4">
                The strength and conditioning program built specifically for
                cyclists who want to ride faster, last longer, and stay injury-free.
              </p>
              <p className="text-foreground-subtle mb-8">
                114 cyclists enrolled &middot; Video instruction &middot;
                Programming templates
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button href="#enrol" size="lg">
                  Enrol Now — $49.99
                </Button>
                <span className="text-foreground-subtle text-sm">
                  One-time payment. Lifetime access.
                </span>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* The Problem */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2
                className="font-heading text-off-white mb-6"
                style={{ fontSize: "var(--text-section)" }}
              >
                THE PROBLEM
              </h2>
              <div className="space-y-5 text-foreground-muted leading-relaxed">
                <p>
                  Most cyclists know they should do strength work. The science is
                  clear — S&amp;C improves power output, delays fatigue, and reduces
                  injury risk. The coaches on the podcast have been saying it for
                  years.
                </p>
                <p>
                  But knowing and doing are different things. Generic gym programs
                  aren&apos;t designed for cyclists. They build the wrong muscles, ignore
                  the movement patterns that matter, and don&apos;t account for
                  training load on the bike.
                </p>
                <p className="text-off-white font-medium text-lg">
                  This course fixes that. Every exercise, every rep scheme, every
                  weekly template is built for cyclists, by cyclists, informed by
                  the same coaches who work with the pros.
                </p>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Modules */}
        <Section background="deep-purple" grain>
          <Container>
            <ScrollReveal direction="up">
              <h2
                className="font-heading text-off-white text-center mb-12"
                style={{ fontSize: "var(--text-section)" }}
              >
                WHAT&apos;S INSIDE
              </h2>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {modules.map((mod, i) => (
                <ScrollReveal key={mod.title} direction="up" delay={i * 0.06}>
                  <Card className="p-6 h-full" hoverable={false}>
                    <span className="text-coral font-heading text-sm tracking-widest">
                      MODULE {i + 1}
                    </span>
                    <h3 className="font-heading text-xl text-off-white mt-2 mb-3">
                      {mod.title.toUpperCase()}
                    </h3>
                    <p className="text-sm text-foreground-muted leading-relaxed">
                      {mod.description}
                    </p>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Social Proof */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2
                className="font-heading text-off-white text-center mb-12"
                style={{ fontSize: "var(--text-section)" }}
              >
                WHAT CYCLISTS ARE SAYING
              </h2>
            </ScrollReveal>

            <div className="space-y-4">
              {[
                {
                  quote: "Finally a strength program that doesn't feel like it was designed for a bodybuilder. Every exercise makes sense for what I do on the bike.",
                  name: "Dave T., Cat 3 racer",
                },
                {
                  quote: "My lower back pain on long rides has completely gone since starting the core module. Should have done this years ago.",
                  name: "Sarah M., Gran Fondo rider",
                },
                {
                  quote: "The in-season templates are gold. I was always worried S&C would compromise my riding, but the minimal dose approach works perfectly.",
                  name: "James K., 10hr/week cyclist",
                },
              ].map((t) => (
                <ScrollReveal key={t.name} direction="up">
                  <Card className="p-6" hoverable={false}>
                    <p className="text-foreground-muted italic leading-relaxed mb-3">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <p className="text-xs text-foreground-subtle">
                      &mdash; {t.name}
                    </p>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Enrol CTA */}
        <Section background="coral" className="!py-16 md:!py-20" id="enrol">
          <Container className="text-center">
            <h2
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              READY TO GET STRONGER?
            </h2>
            <p className="text-off-white/80 max-w-lg mx-auto mb-2">
              One-time payment. Lifetime access. 6 modules of cycling-specific
              strength training.
            </p>
            <p className="font-heading text-4xl text-off-white mb-8">$49.99</p>
            <Button
              href="https://roadmancycling.com/strength-training/checkout"
              variant="secondary"
              size="lg"
              className="bg-charcoal hover:bg-deep-purple text-off-white"
            >
              Enrol Now
            </Button>
            <p className="text-off-white/60 text-xs mt-4">
              Secure payment via Stripe. Instant access after purchase.
            </p>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
