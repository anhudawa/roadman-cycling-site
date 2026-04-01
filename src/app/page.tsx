import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card } from "@/components/ui";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/JsonLd";
import { CONTENT_PILLARS } from "@/types";

const stats = [
  { value: "100M+", label: "Podcast Downloads" },
  { value: "1,852", label: "Community Members" },
  { value: "61K+", label: "YouTube Subscribers" },
  { value: "49K+", label: "Instagram Followers" },
];

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
        {/* ============================================
            HERO — Full viewport, cinematic
            ============================================ */}
        <Section
          background="charcoal"
          fullHeight
          grain
          className="relative flex items-center justify-center"
        >
          {/* Background gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-deep-purple/40 via-charcoal/80 to-charcoal" />

          <Container className="relative z-10 text-center pt-20">
            <h1
              className="font-heading text-off-white leading-none mb-6"
              style={{ fontSize: "var(--text-hero)" }}
            >
              CYCLING IS HARD.
              <br />
              <span className="text-coral">WE MAKE IT LESS HARD.</span>
            </h1>

            <p className="font-body text-foreground-muted max-w-2xl mx-auto mb-10 text-lg md:text-xl leading-relaxed">
              The podcast trusted by 100 million listeners. The community where
              serious cyclists stop guessing and start getting faster.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button href="/podcast" size="lg">
                Listen Now
              </Button>
              <Button href="/community/clubhouse" variant="ghost" size="lg">
                Join Free
              </Button>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
              <div className="w-0.5 h-12 bg-gradient-to-b from-coral to-transparent opacity-50" />
            </div>
          </Container>
        </Section>

        {/* ============================================
            SOCIAL PROOF — Stats bar
            ============================================ */}
        <Section background="deep-purple" className="!py-12 md:!py-16">
          <Container>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="font-heading text-3xl md:text-5xl text-coral mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-foreground-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        {/* ============================================
            CONTENT PILLARS — Five cards
            ============================================ */}
        <Section background="charcoal">
          <Container>
            <div className="text-center mb-12">
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {(
                Object.entries(CONTENT_PILLARS) as [
                  string,
                  (typeof CONTENT_PILLARS)[keyof typeof CONTENT_PILLARS],
                ][]
              ).map(([key, pillar]) => (
                <Card
                  key={key}
                  href={`/blog?pillar=${key}`}
                  className="p-6 group"
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
              ))}
            </div>
          </Container>
        </Section>

        {/* ============================================
            EXPERT ACCESS — Credibility
            ============================================ */}
        <Section background="deep-purple" grain>
          <Container>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
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
                <Button href="/podcast">Explore the Archive</Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {experts.map((expert) => (
                  <div
                    key={expert}
                    className="bg-white/5 border border-white/10 rounded-lg p-4 text-center"
                  >
                    <p className="font-heading text-lg text-off-white">
                      {expert.toUpperCase()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </Section>

        {/* ============================================
            TOOLS — Interactive calculators
            ============================================ */}
        <Section background="charcoal">
          <Container>
            <div className="text-center mb-12">
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools.map((tool) => (
                <Card key={tool.href} href={tool.href} className="p-6 group">
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
              ))}
            </div>
          </Container>
        </Section>

        {/* ============================================
            COMMUNITY — Free & Paid
            ============================================ */}
        <Section background="deep-purple" grain>
          <Container>
            <div className="text-center mb-12">
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
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Clubhouse (Free) */}
              <Card className="p-8" hoverable={false}>
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
                  training plans, and a community of 1,852 cyclists who get it.
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
                <Button href="/community/clubhouse" size="lg" className="w-full">
                  Join Free
                </Button>
              </Card>

              {/* Not Done Yet (Paid) */}
              <Card
                className="p-8 border-coral/30 bg-gradient-to-br from-background-elevated to-deep-purple/30"
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
            </div>
          </Container>
        </Section>

        {/* ============================================
            NEWSLETTER — Full-width CTA
            ============================================ */}
        <Section background="coral" className="!py-16 md:!py-20">
          <Container className="text-center">
            <h2
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              GET THE INSIGHTS. NO FLUFF.
            </h2>
            <p className="text-off-white/80 max-w-lg mx-auto mb-8">
              Once a week. The stuff that actually makes you faster. Straight
              from the conversations with the world&apos;s best.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email"
                className="
                  flex-1 bg-white/20 border border-white/30 rounded-md px-4 py-3
                  text-off-white placeholder:text-off-white/60
                  focus:border-white focus:outline-none
                  transition-colors
                "
                style={{ transitionDuration: "var(--duration-fast)" }}
              />
              <button
                type="submit"
                className="
                  font-heading tracking-wider
                  bg-charcoal hover:bg-deep-purple
                  text-off-white px-8 py-3 rounded-md
                  transition-colors shrink-0 cursor-pointer
                "
                style={{ transitionDuration: "var(--duration-fast)" }}
              >
                SUBSCRIBE
              </button>
            </form>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
