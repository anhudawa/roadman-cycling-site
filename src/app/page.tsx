import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal, ParallaxImage, GradientText, GuestMarquee } from "@/components/ui";
import Image from "next/image";
import Link from "next/link";
import { HeroSection } from "@/components/features/home/HeroSection";
import { getLatestEpisode } from "@/lib/podcast";
import { StatsSection } from "@/components/features/home/StatsSection";
import { PersonaRouter } from "@/components/features/home/PersonaRouter";
import { PillarIcon } from "@/components/features/home/PillarIcon";
import { EmailCapture } from "@/components/features/conversion/EmailCapture";
import { CONTENT_PILLARS, type ContentPillar } from "@/types";

const marqueeGuests = [
  { name: "Greg LeMond", credential: "3Ã— Tour de France winner", href: "https://www.youtube.com/watch?v=_kFSe3VxS10" },
  { name: "Professor Seiler", credential: "Polarised training pioneer", href: "https://www.youtube.com/watch?v=j443DjmheHw" },
  { name: "Dan Lorang", credential: "Red Bull$€“Bora$€“Hansgrohe", href: "https://www.youtube.com/watch?v=Qbub4VwLHW4" },
  { name: "Lachlan Morton", credential: "EF Education, alt-racing pioneer", href: "https://www.youtube.com/watch?v=-X-Owk2VOoM" },
  { name: "Dan Bigham", credential: "Former Hour Record holder", href: "https://www.youtube.com/watch?v=gxiqIIVB3OA" },
  { name: "Alistair Brownlee", credential: "2Ã— Olympic triathlon gold", href: "https://www.youtube.com/watch?v=gZEl_NCr5_I" },
  { name: "Valtteri Bottas", credential: "F1 driver & cyclist", href: "https://www.youtube.com/watch?v=F9Fnts3Cv_U" },
  { name: "Alex Dowsett", credential: "Former Hour Record holder, TT specialist", href: "https://www.youtube.com/watch?v=DnGKpEPEdUM" },
  { name: "George Hincapie", credential: "17Ã— Tour de France starter", href: "https://www.youtube.com/watch?v=nEBqxv2WZVs" },
  { name: "AndrÃ© Greipel", credential: "22 Grand Tour stage wins", href: "https://www.youtube.com/watch?v=aLrD94_D13Y" },
  { name: "Joe Friel", credential: "Author, Cyclist's Training Bible", href: "https://www.youtube.com/watch?v=ov9qv73_lH4" },
  { name: "Hannah Grant", credential: "Pro team chef", href: "https://www.youtube.com/watch?v=fAvIMy4UQu4" },
  { name: "Ed Clancy", credential: "3Ã— Olympic gold, team pursuit", href: "https://www.youtube.com/watch?v=NQ2d5IFGmaA" },
  { name: "Tim Spector", credential: "ZOE founder, epidemiologist", href: "https://www.youtube.com/watch?v=GdIJQ__lqHA" },
  { name: "Mark Beaumont", credential: "Around the World record", href: "https://www.youtube.com/watch?v=b27wvtFa78g" },
  { name: "Colin O Brady", credential: "Solo Antarctic crossing, 10 Peaks adventurer", href: "https://www.youtube.com/watch?v=Pu8hNDM9uzU" },
  { name: "Uli Schoberer", credential: "Inventor of the SRM power meter", href: "https://www.youtube.com/watch?v=GPY7ReSpOpU" },
  { name: "Olav Bu", credential: "Uno-X Mobility head coach", href: "https://www.youtube.com/watch?v=t73tCc_BA2c" },
];

const tools = [
  // The Masters Plateau Diagnostic sits in the feature slot (2-col
  // span on sm+). It's the highest-intent action on the site for
  // 40+ riders $€” higher conversion to NDY than any of the other
  // calculators, so it earns the prime position.
  {
    title: "Plateau Diagnostic",
    description:
      "Stuck on the same FTP for a year? Twelve questions. Four minutes. One specific answer.",
    href: "/plateau",
  },
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
    title: "MTB Setup Calculator",
    description: "Dial in fork and shock pressure for your weight and riding style.",
    href: "/tools/shock-pressure",
  },
];

export default function HomePage() {
  const latestEpisode = getLatestEpisode();
  return (
    <>
      <Header />

      <main id="main-content">
        {/* HERO $€” podcast-first on mobile (waveform + play latest),
            glitch portrait on desktop. APPLY is the primary CTA. */}
        <HeroSection latestEpisode={latestEpisode} />

        {/* STATS $€” Animated counters */}
        <StatsSection />

        {/* PERSONA ROUTER $€” route visitors by current cycling state */}
        <PersonaRouter />

        {/* SATURDAY SPIN $€” moved up from mid-page. Specific promise +
            social proof count, tied to the community not generic "insights". */}
        <EmailCapture
          variant="banner"
          heading="THE SATURDAY SPIN"
          subheading="The weekly training breakdown 65,000+ serious cyclists use to break plateaus. What's working, what the pros do, how to apply it this week. Free."
          source="homepage-top"
        />

        {/* Gradient divider */}
        <div className="gradient-divider" />

        {/* CONTENT PILLARS */}
        <Section background="charcoal">
          <Container>
            <ScrollReveal direction="up" className="text-center mb-12">
              <p className="text-coral font-heading text-sm tracking-widest mb-3">
                <Link href="/apply" className="hover:underline">
                  NOT DONE YET COACHING COMMUNITY
                </Link>
              </p>
              <h2
                className="font-heading mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                <Link href="/apply" className="hover:opacity-80 transition-opacity">
                  <GradientText as="span">FIVE PILLARS. ONE SYSTEM.</GradientText>
                </Link>
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto mb-6">
                Inside the{" "}
                <Link href="/apply" className="text-coral hover:underline">
                  Not Done Yet coaching community
                </Link>
                , everything connects. Training, nutrition, strength, recovery,
                and community $€” coached together as one system. That&apos;s what
                makes the difference between guessing and getting faster.
              </p>
              <Button href="/apply">
                Apply to Join
              </Button>
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
                    className="p-6 group h-full card-shimmer"
                  >
                    <PillarIcon
                      pillar={key as ContentPillar}
                      color={pillar.color}
                      className="w-10 h-10 mb-4"
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

        {/* PARALLAX DIVIDER $€” Epic desert road climb */}
        <ParallaxImage
          src="/images/cycling/gravel-desert-road-epic.jpg"
          alt="Two cyclists climbing a winding road through dramatic desert terrain"
          className="h-[30vh] md:h-[50vh]"
          objectPosition="center 40%"
          speed={0.3}
          overlayColor="from-charcoal via-charcoal/50 to-deep-purple"
        />

        {/* EXPERT ACCESS $€” The Moat */}
        <Section background="deep-purple" grain className="overflow-hidden">
          <Container>
            <ScrollReveal direction="up" className="text-center mb-4">
              <h2
                className="font-heading text-off-white mb-3"
                style={{ fontSize: "var(--text-section)" }}
              >
                <span className="block">1,400+ EPISODES.</span>
                <span className="block text-coral">ONE GUEST LIST.</span>
              </h2>
              <p className="text-foreground-muted max-w-lg mx-auto">
                No other cycling podcast has Greg LeMond, Professor Seiler,
                Dan Lorang, and Lachlan Morton on the same show.
              </p>
            </ScrollReveal>
          </Container>

          {/* Full-bleed marquee $€” breaks out of Container for edge-to-edge scroll */}
          <div className="my-10">
            <GuestMarquee guests={marqueeGuests} />
          </div>

          <Container>
            <div className="flex items-center justify-center gap-4">
              <Button href="/guests">
                Meet the Guests
              </Button>
              <Button href="/podcast" variant="ghost">
                Explore the Archive
              </Button>
            </div>
          </Container>
        </Section>

        {/* PARALLAX DIVIDER $€” Beach bikepacking */}
        <ParallaxImage
          src="/images/community/DSC05808.JPG"
          alt="Two riders pushing bikes across a beach at sunset"
          className="h-[30vh] md:h-[50vh]"
          objectPosition="center 20%"
          speed={0.3}
          overlayColor="from-deep-purple via-deep-purple/50 to-charcoal"
        />

        {/* TOOLS */}
        <Section background="charcoal" className="section-glow-coral">
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
                <ScrollReveal key={tool.href} direction="up" delay={i * 0.06} className={i === 0 ? "sm:col-span-2 lg:col-span-2" : ""}>
                  <Card href={tool.href} className="p-6 h-full card-shimmer" glass tilt>
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

        {/* PARALLAX DIVIDER $€” Post-ride rest against wall */}
        <ParallaxImage
          src="/images/cycling/post-ride-rest-wall.jpg"
          alt="Two cyclists resting against a white wall with their gravel bikes after a long ride"
          className="h-[35vh] md:h-[60vh]"
          objectPosition="center 60%"
          speed={0.3}
          overlayColor="from-charcoal via-charcoal/50 to-deep-purple"
        />

        {/* COMMUNITY */}
        <Section background="deep-purple" grain>
          <Container>
            <ScrollReveal direction="up" className="text-center mb-12">
              <h2
                className="font-heading mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                <GradientText as="span">YOU&apos;RE NOT DONE YET</GradientText>
              </h2>
              <p className="text-foreground-muted max-w-2xl mx-auto text-lg">
                Most cyclists plateau because they train alone, guess at
                nutrition, and skip the stuff that actually compounds.
                Inside the Not Done Yet coaching community, riders follow
                one coached system $€” training, nutrition, strength,
                recovery, and accountability $€” and they&apos;re proving every
                week that faster is still ahead.
              </p>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-6">
              <ScrollReveal direction="left">
                <Card className="p-6 md:p-8 h-full" hoverable={false}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 rounded-full bg-coral pulse-glow" />
                    <span className="text-xs text-foreground-muted uppercase tracking-widest font-body">
                      Free
                    </span>
                  </div>
                  <h3 className="font-heading text-3xl text-off-white mb-3">
                    THE CLUBHOUSE
                  </h3>
                  <p className="text-foreground-muted mb-6 leading-relaxed">
                    Free tools, free plans, and 2,100 cyclists who get it. Your
                    starting point before you&apos;re ready for the full system.
                  </p>
                  <ul className="space-y-2 mb-8">
                    {[
                      "Free 16-week training plans (road, gravel, sportive)",
                      "Weekly live Q&A with Anthony",
                      "Free calculators and resources",
                      "Community of serious cyclists",
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
                  className="p-6 md:p-8 h-full border-rotating rounded-lg bg-gradient-to-br from-background-elevated to-deep-purple/30"
                  hoverable={false}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 rounded-full bg-purple pulse-glow" />
                    <span className="text-xs text-foreground-muted uppercase tracking-widest font-body">
                      $195/month
                    </span>
                  </div>
                  <h3 className="font-heading text-3xl text-off-white mb-3">
                    NOT DONE YET
                  </h3>
                  <p className="text-coral font-heading text-xs tracking-widest mb-4 uppercase">
                    The coaching community
                  </p>
                  <p className="text-foreground-muted mb-6 leading-relaxed">
                    You&apos;re not buying a subscription. You&apos;re joining
                    the Not Done Yet coaching community $€” cyclists who refuse
                    to plateau. Five pillars. One coached system. The same
                    principles Seiler and Lorang discussed on the podcast,
                    structured into your week.
                  </p>
                  <ul className="space-y-2 mb-8">
                    {[
                      "Pillar 1: Weekly structured training plans",
                      "Pillar 2: Race weight & nutrition guidance",
                      "Pillar 3: Cycling-specific strength programme",
                      "Pillar 4: Recovery protocols & coaching calls",
                      "Pillar 5: Accountability & coached community",
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
                    Inside Not Done Yet
                  </Button>
                </Card>
              </ScrollReveal>
            </div>
          </Container>
        </Section>

        {/* Featured content $€” passes homepage authority to high-value
            blog cluster articles. These links are the single strongest
            internal-link equity transfer on the site. */}
        <Section background="charcoal">
          <Container>
            <ScrollReveal direction="up" className="text-center mb-10">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                FEATURED GUIDES
              </h2>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {[
                {
                  href: "/blog/age-group-ftp-benchmarks-2026",
                  title: "Age-Group FTP Benchmarks 2026",
                  sub: "Where your watts actually place you",
                },
                {
                  href: "/blog/polarised-vs-sweet-spot-training",
                  title: "Polarised vs Sweet Spot",
                  sub: "What the science actually says",
                },
                {
                  href: "/blog/bike-leg-of-triathlon-why-age-groupers-get-it-wrong",
                  title: "The Bike Leg of Triathlon",
                  sub: "Why most age-groupers get it wrong",
                },
              ].map((guide) => (
                <ScrollReveal key={guide.href} direction="up">
                  <Link
                    href={guide.href}
                    className="block p-6 rounded-xl bg-white/5 hover:bg-coral/10 border border-white/5 hover:border-coral/30 transition-all group text-center h-full"
                  >
                    <p className="font-heading text-lg text-off-white group-hover:text-coral transition-colors tracking-wide mb-2">
                      {guide.title.toUpperCase()}
                    </p>
                    <p className="text-sm text-foreground-muted">
                      {guide.sub}
                    </p>
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
