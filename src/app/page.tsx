import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal, ParallaxImage, MagneticButton } from "@/components/ui";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/JsonLd";
import { HeroSection } from "@/components/features/home/HeroSection";
import { StatsSection } from "@/components/features/home/StatsSection";
import { EmailCapture } from "@/components/features/conversion/EmailCapture";
import { CONTENT_PILLARS } from "@/types";

const experts = [
  "Professor Seiler",
  "Dan Lorang",
  "Lachlan Morton",
  "Tim Kerrison",
  "John Wakefield",
  "Dr. David Dunne",
];

const tools = [
  {
    title: "FTP Zone Calculator",
    description: "Know your zones. Train with precision.",
    href: "/tools/ftp-zones",
  },
  {
    title: "Tyre Pressure Calculator",
    description: "Optimal PSI for your weight, tyres, and conditions.",
    href: "/tools/tyre-pressure",
  },
  {
    title: "Race Weight Calculator",
    description: "Your target weight range for peak performance.",
    href: "/tools/race-weight",
  },
  {
    title: "In-Ride Fuelling",
    description: "Exactly what to eat and drink, hour by hour.",
    href: "/tools/fuelling",
  },
  {
    title: "Energy Availability",
    description: "Are you eating enough to perform? Find out.",
    href: "/tools/energy-availability",
  },
  {
    title: "Shock Pressure",
    description: "Dial in your suspension for your weight and style.",
    href: "/tools/shock-pressure",
  },
];

export default function HomePage() {
  return (
    <>
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <Header />

      <main>
        {/* HERO — Animated entrance, video-ready */}
        <HeroSection />

        {/* STATS — Animated counters */}
        <StatsSection />

        {/* CONTENT PILLARS */}
        <Section background="charcoal">
          <Container>
            <ScrollReveal direction="up" className="text-center mb-12">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                FIVE PILLARS. ONE SYSTEM.
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto">
                Everything you need to get faster, stay healthy, and love the
                bike more. Grounded in science. Delivered by the world&apos;s
                best.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {(
                Object.entries(CONTENT_PILLARS) as [
                  string,
                  (typeof CONTENT_PILLARS)[keyof typeof CONTENT_PILLARS],
                ][]
              ).map(([key, pillar], i) => (
                <ScrollReveal key={key} direction="up" delay={i * 0.08}>
                  <Card
                    href={`/blog?pillar=${key}`}
                    className="p-6 group h-full"
                  >
                    <div
                      className="w-1 h-8 rounded-full mb-4 transition-all group-hover:h-12"
                      style={{
                        backgroundColor: pillar.color,
                        transitionDuration: "var(--duration-normal)",
                      }}
                    />
                    <h3 className="font-heading text-xl text-off-white mb-2">
                      {pillar.label.toUpperCase()}
                    </h3>
                    <p className="text-sm text-foreground-muted leading-relaxed">
                      {pillar.description}
                    </p>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* EXPERT ACCESS */}
        <Section background="deep-purple" grain>
          <Container>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <ScrollReveal direction="left">
                <h2
                  className="font-heading text-off-white mb-6"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  ACCESS THE WORLD&apos;S
                  <br />
                  <span className="text-coral">BEST MINDS</span>
                </h2>
                <p className="text-foreground-muted text-lg leading-relaxed mb-8">
                  Anthony Walsh has spent a decade sitting across the table from
                  the coaches, scientists, and riders who shape professional
                  cycling. Roadman translates that access into a system you can
                  actually use.
                </p>
                <MagneticButton>
                  <Button href="/podcast">Explore the Archive</Button>
                </MagneticButton>
              </ScrollReveal>

              <div className="grid grid-cols-2 gap-3">
                {experts.map((expert, i) => (
                  <ScrollReveal key={expert} direction="right" delay={i * 0.06}>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center hover:bg-white/8 hover:border-white/20 transition-colors">
                      <p className="font-heading text-lg text-off-white">
                        {expert.toUpperCase()}
                      </p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </Container>
        </Section>

        {/* TOOLS */}
        <Section background="charcoal">
          <Container>
            <ScrollReveal direction="up" className="text-center mb-12">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                YOUR TOOLKIT
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto">
                Free tools built on the same science discussed on the podcast.
                Stop guessing. Start knowing.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools.map((tool, i) => (
                <ScrollReveal key={tool.href} direction="up" delay={i * 0.06}>
                  <Card href={tool.href} className="p-6 group h-full">
                    <h3 className="font-heading text-xl text-off-white mb-2 group-hover:text-coral transition-colors">
                      {tool.title.toUpperCase()}
                    </h3>
                    <p className="text-sm text-foreground-muted mb-4">
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

        {/* PARALLAX DIVIDER — Cycling image */}
        <ParallaxImage
          src="/images/cycling/gravel-road-climb.jpg"
          alt="Cyclists riding through dramatic landscape"
          className="h-[50vh] md:h-[60vh]"
          speed={0.3}
          overlayColor="from-charcoal via-charcoal/50 to-deep-purple"
        />

        {/* COMMUNITY */}
        <Section background="deep-purple" grain>
          <Container>
            <ScrollReveal direction="up" className="text-center mb-12">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                YOU&apos;RE NOT DONE YET
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto">
                Join a community of serious cyclists who believe they have more
                in them. Because you do.
              </p>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-6">
              <ScrollReveal direction="left">
                <Card className="p-8 h-full" hoverable={false}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 rounded-full bg-coral" />
                    <span className="text-xs text-foreground-muted uppercase tracking-widest font-body">
                      Free
                    </span>
                  </div>
                  <h3 className="font-heading text-3xl text-off-white mb-3">
                    THE CLUBHOUSE
                  </h3>
                  <p className="text-foreground-muted mb-6 leading-relaxed">
                    Your entry point. Weekly live Q&amp;A with Anthony, free
                    training plans, and a community of 1,852 cyclists who get
                    it.
                  </p>
                  <ul className="space-y-2 mb-8">
                    {[
                      "Weekly live Q&A with Anthony",
                      "Free 16-week training plans",
                      "Community discussion & support",
                      "Podcast deep-dives",
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-foreground-muted"
                      >
                        <span className="text-coral mt-0.5">&#10003;</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button
                    href="/community/clubhouse"
                    size="lg"
                    className="w-full"
                  >
                    Join Free
                  </Button>
                </Card>
              </ScrollReveal>

              <ScrollReveal direction="right">
                <Card
                  className="p-8 h-full border-coral/30 bg-gradient-to-br from-background-elevated to-deep-purple/30"
                  hoverable={false}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 rounded-full bg-purple" />
                    <span className="text-xs text-foreground-muted uppercase tracking-widest font-body">
                      From $15/month
                    </span>
                  </div>
                  <h3 className="font-heading text-3xl text-off-white mb-3">
                    NOT DONE YET
                  </h3>
                  <p className="text-foreground-muted mb-6 leading-relaxed">
                    The system. Personalised Vekta training plans, expert
                    masterclasses, Anthony&apos;s coaching calls, and the
                    accountability that makes it stick.
                  </p>
                  <ul className="space-y-2 mb-8">
                    {[
                      "Personalised Vekta training plans",
                      "Weekly coaching calls with Anthony",
                      "Expert masterclasses",
                      "S&C roadmap",
                      "Private community of serious cyclists",
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-foreground-muted"
                      >
                        <span className="text-coral mt-0.5">&#10003;</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button
                    href="/community/not-done-yet"
                    variant="secondary"
                    size="lg"
                    className="w-full"
                  >
                    Learn More
                  </Button>
                </Card>
              </ScrollReveal>
            </div>
          </Container>
        </Section>

        {/* NEWSLETTER — Now using Beehiiv-connected component */}
        <EmailCapture
          variant="banner"
          heading="GET THE INSIGHTS. NO FLUFF."
          subheading="Once a week. The stuff that actually makes you faster. Straight from the conversations with the world's best."
          source="homepage"
        />
      </main>

      <Footer />
    </>
  );
}
