import { preload } from "react-dom";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal, ParallaxImage, GradientText, GuestMarquee } from "@/components/ui";
import Link from "next/link";
import { HeroSection } from "@/components/features/home/HeroSection";
import { getLatestEpisode } from "@/lib/podcast";
import { StatsSection } from "@/components/features/home/StatsSection";
import { PersonaRouter } from "@/components/features/home/PersonaRouter";
import { PillarIcon } from "@/components/features/home/PillarIcon";
import { ChoosePath } from "@/components/features/routing/ChoosePath";
import { EmailCapture } from "@/components/features/conversion/EmailCapture";
import { CONTENT_PILLARS, type ContentPillar } from "@/types";

const marqueeGuests = [
  { name: "Greg LeMond", credential: "3× Tour de France winner", href: "https://www.youtube.com/watch?v=_kFSe3VxS10" },
  { name: "Professor Seiler", credential: "Polarised training pioneer", href: "https://www.youtube.com/watch?v=j443DjmheHw" },
  { name: "Dan Lorang", credential: "Red Bull–Bora–Hansgrohe", href: "https://www.youtube.com/watch?v=Qbub4VwLHW4" },
  { name: "Lachlan Morton", credential: "EF Education, alt-racing pioneer", href: "https://www.youtube.com/watch?v=-X-Owk2VOoM" },
  { name: "Dan Bigham", credential: "Former Hour Record holder", href: "https://www.youtube.com/watch?v=gxiqIIVB3OA" },
  { name: "Alistair Brownlee", credential: "2× Olympic triathlon gold", href: "https://www.youtube.com/watch?v=gZEl_NCr5_I" },
  { name: "Valtteri Bottas", credential: "F1 driver & cyclist", href: "https://www.youtube.com/watch?v=F9Fnts3Cv_U" },
  { name: "Alex Dowsett", credential: "Former Hour Record holder, TT specialist", href: "https://www.youtube.com/watch?v=DnGKpEPEdUM" },
  { name: "George Hincapie", credential: "17× Tour de France starter", href: "https://www.youtube.com/watch?v=nEBqxv2WZVs" },
  { name: "André Greipel", credential: "22 Grand Tour stage wins", href: "https://www.youtube.com/watch?v=aLrD94_D13Y" },
  { name: "Joe Friel", credential: "Author, Cyclist's Training Bible", href: "https://www.youtube.com/watch?v=ov9qv73_lH4" },
  { name: "Hannah Grant", credential: "Pro team chef", href: "https://www.youtube.com/watch?v=fAvIMy4UQu4" },
  { name: "Ed Clancy", credential: "3× Olympic gold, team pursuit", href: "https://www.youtube.com/watch?v=NQ2d5IFGmaA" },
  { name: "Tim Spector", credential: "ZOE founder, epidemiologist", href: "https://www.youtube.com/watch?v=GdIJQ__lqHA" },
  { name: "Mark Beaumont", credential: "Around the World record", href: "https://www.youtube.com/watch?v=b27wvtFa78g" },
  { name: "Colin O Brady", credential: "Solo Antarctic crossing, 10 Peaks adventurer", href: "https://www.youtube.com/watch?v=Pu8hNDM9uzU" },
  { name: "Uli Schoberer", credential: "Inventor of the SRM power meter", href: "https://www.youtube.com/watch?v=GPY7ReSpOpU" },
  { name: "Olav Bu", credential: "Uno-X Mobility head coach", href: "https://www.youtube.com/watch?v=t73tCc_BA2c" },
];

const tools = [
  // The Masters Plateau Diagnostic sits in the feature slot (2-col
  // span on sm+). It's the highest-intent action on the site for
  // 40+ riders — higher conversion to NDY than any of the other
  // calculators, so it earns the prime position.
  {
    title: "Plateau Diagnostic",
    description:
      "Stuck on the same FTP for a year? Twelve questions. Four minutes. One specific answer.",
    href: "/plateau",
  },
  {
    title: "Ask Roadman",
    description:
      "Anthony's coaching brain on tap. Ask any cycling question — answers grounded in 1,400+ podcast episodes.",
    href: "/ask",
  },
  {
    title: "Coaching Assessment",
    description:
      "Ten questions to surface the right coaching pathway for where you are right now.",
    href: "/assessment",
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
  // The hero portrait is a CSS background-image (see GlitchHero.module.css),
  // so Next.js can't auto-preload it. Preload from the server so the browser
  // can fetch it in parallel with the route's CSS chunk — improves mobile LCP.
  preload("/images/hero/glitch-portrait.jpg", {
    as: "image",
    fetchPriority: "high",
  });

  const latestEpisode = getLatestEpisode();
  return (
    <>
      <Header />

      <main id="main-content">
        {/* HERO — leads with the rider problem ("Stop plateauing. Start
            progressing.") and routes the highest-intent visitor straight
            into the Plateau Diagnostic. Listen sits as a soft secondary
            link; Apply lives further down the page in the offer ladder. */}
        <HeroSection latestEpisode={latestEpisode} />

        {/* MANIFESTO — positioning. We are not a media brand. We are the
            clearest path back to progress for serious amateurs who
            stopped improving. */}
        <Section background="charcoal" className="!py-10 border-y border-white/5">
          <Container width="narrow" className="text-center">
            <p className="font-heading text-coral text-[11px] tracking-[0.3em] mb-3">
              WHAT WE DO
            </p>
            <p className="font-heading text-off-white text-xl md:text-2xl leading-snug mb-3">
              THE CLEAREST PATH BACK TO PROGRESS.
            </p>
            <p className="text-foreground-muted text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              For serious amateurs who stopped improving. Stuck FTP.
              Plans that don&apos;t fit your week. Conflicting advice
              from every podcast and forum. We take the same principles
              Stephen Seiler, Dan Lorang, and the World Tour use — and
              adapt them for cyclists with jobs, families, and 8–12 hours
              a week.
              <span className="block mt-3">
                <Link href="/methodology" className="text-coral hover:text-coral/80 transition-colors font-heading tracking-wider text-xs">
                  READ THE METHODOLOGY →
                </Link>
              </span>
            </p>
          </Container>
        </Section>

        {/* STATS — Reframed as receipts/proof. Lead with 100M+ downloads
            so the podcast scale lands as evidence behind the coaching,
            not the headline offering. */}
        <StatsSection />

        {/* PERSONA ROUTER — route visitors by current cycling state */}
        <PersonaRouter />

        {/* SATURDAY SPIN — secondary CTA after the coaching framing.
            Specific promise + social proof count, tied to the community
            not generic "insights". */}
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
                Inside{" "}
                <Link href="/apply" className="text-coral hover:underline">
                  Not Done Yet coaching
                </Link>
                , everything connects. Training, nutrition, strength, recovery,
                and the riders alongside you — coached together as one system.
                That&apos;s what makes the difference between guessing and
                getting faster.
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

        {/* PARALLAX DIVIDER — Epic desert road climb */}
        <ParallaxImage
          src="/images/cycling/gravel-desert-road-epic.jpg"
          alt="Two cyclists climbing a winding road through dramatic desert terrain"
          className="h-[30vh] md:h-[50vh]"
          objectPosition="center 40%"
          speed={0.3}
          overlayColor="from-charcoal via-charcoal/50 to-deep-purple"
        />

        {/* PROOF ENGINE — the podcast reframed. Not the product. The
            evidence behind the coaching. CTA hierarchy: coaching first
            (Apply), archive second (Explore). */}
        <Section background="deep-purple" grain className="overflow-hidden">
          <Container>
            <ScrollReveal direction="up" className="text-center mb-4">
              <p className="font-heading text-coral text-[11px] tracking-[0.3em] mb-3">
                THE PROOF ENGINE
              </p>
              <h2
                className="font-heading text-off-white mb-3"
                style={{ fontSize: "var(--text-section)" }}
              >
                <span className="block">100M+ DOWNLOADS.</span>
                <span className="block text-coral">ONE GUEST LIST.</span>
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto">
                Greg LeMond. Professor Seiler. Dan Lorang. Lachlan Morton.
                The podcast is not the product — it&apos;s how we earned
                the right to coach you. What they shared on the show is
                the foundation of Not Done Yet.
              </p>
            </ScrollReveal>
          </Container>

          {/* Full-bleed marquee — breaks out of Container for edge-to-edge scroll */}
          <div className="my-10">
            <GuestMarquee guests={marqueeGuests} />
          </div>

          <Container>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button href="/apply" dataTrack="home_proof_apply">
                Apply for Coaching
              </Button>
              <Button href="/podcast" variant="ghost" dataTrack="home_proof_archive">
                Explore the Archive
              </Button>
            </div>
          </Container>
        </Section>

        {/* PARALLAX DIVIDER — Beach bikepacking */}
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

        {/* CHOOSE YOUR PATH — problem-led routing. PersonaRouter routes
            by identity ("who am I?"); this routes by current problem
            ("what do I need?"). Eight specific destinations covering
            free tools, coaching, newsletter, and Ask Roadman. */}
        <ChoosePath source="home" />

        {/* PARALLAX DIVIDER — Post-ride rest against wall */}
        <ParallaxImage
          src="/images/cycling/post-ride-rest-wall.jpg"
          alt="Two cyclists resting against a white wall with their gravel bikes after a long ride"
          className="h-[35vh] md:h-[60vh]"
          objectPosition="center 60%"
          speed={0.3}
          overlayColor="from-charcoal via-charcoal/50 to-deep-purple"
        />

        {/* OFFER LADDER — the explicit four-step path. Free content,
            then the Plateau Diagnostic, then Not Done Yet coaching,
            then 1:1 with Anthony. Middle two rungs are the conversion
            spine, so they get the coral border and primary buttons. */}
        <Section background="deep-purple" grain>
          <Container>
            <ScrollReveal direction="up" className="text-center mb-12">
              <p className="font-heading text-coral text-[11px] tracking-[0.3em] mb-3">
                THE PATH FORWARD
              </p>
              <h2
                className="font-heading mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                <GradientText as="span">FOUR STEPS. ONE DIRECTION.</GradientText>
              </h2>
              <p className="text-foreground-muted max-w-2xl mx-auto text-lg">
                Not every cyclist is ready for the same step. Start where
                you are. Move when you&apos;re ready.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* RUNG 1 — Free content. The way in. */}
              <ScrollReveal direction="up" delay={0}>
                <Card className="p-6 h-full" hoverable={false}>
                  <p className="font-heading text-[10px] tracking-[0.3em] text-foreground-muted mb-3">
                    01 · FREE
                  </p>
                  <h3 className="font-heading text-2xl text-off-white mb-3">
                    PODCAST &amp; NEWSLETTER
                  </h3>
                  <p className="text-foreground-muted text-sm leading-relaxed mb-6">
                    1,400+ episodes with the coaches and pros behind Grand
                    Tour wins. The Saturday Spin newsletter every week.
                    Start here if you&apos;re still learning.
                  </p>
                  <Button
                    href="/podcast"
                    variant="secondary"
                    className="w-full"
                    dataTrack="home_ladder_podcast"
                  >
                    Listen Free
                  </Button>
                </Card>
              </ScrollReveal>

              {/* RUNG 2 — Plateau Diagnostic. The lead-gen spine. */}
              <ScrollReveal direction="up" delay={0.08}>
                <Card
                  className="p-6 h-full border border-coral/40 rounded-lg bg-gradient-to-br from-background-elevated to-deep-purple/30"
                  hoverable={false}
                >
                  <p className="font-heading text-[10px] tracking-[0.3em] text-coral mb-3">
                    02 · FREE · 4 MIN
                  </p>
                  <h3 className="font-heading text-2xl text-off-white mb-3">
                    PLATEAU DIAGNOSTIC
                  </h3>
                  <p className="text-foreground-muted text-sm leading-relaxed mb-6">
                    Stuck on the same FTP for a year? Twelve questions
                    surface the specific reason — and what to do about
                    it this week.
                  </p>
                  <Button
                    href="/plateau"
                    className="w-full"
                    dataTrack="home_ladder_plateau"
                  >
                    Take the Diagnostic
                  </Button>
                </Card>
              </ScrollReveal>

              {/* RUNG 3 — Not Done Yet. The core membership. */}
              <ScrollReveal direction="up" delay={0.16}>
                <Card
                  className="p-6 h-full border-rotating rounded-lg bg-gradient-to-br from-background-elevated to-deep-purple/30"
                  hoverable={false}
                >
                  <p className="font-heading text-[10px] tracking-[0.3em] text-coral mb-3">
                    03 · €195/MONTH
                  </p>
                  <h3 className="font-heading text-2xl text-off-white mb-3">
                    NOT DONE YET
                  </h3>
                  <p className="text-foreground-muted text-sm leading-relaxed mb-6">
                    Five-pillar coached system. Weekly live calls with
                    Anthony. Vekta training plans. The riders breaking
                    through their plateaus right now.
                  </p>
                  <Button
                    href="/apply"
                    className="w-full"
                    dataTrack="home_ladder_ndy"
                  >
                    Apply to Join
                  </Button>
                </Card>
              </ScrollReveal>

              {/* RUNG 4 — Premium 1:1. The high-touch tier. */}
              <ScrollReveal direction="up" delay={0.24}>
                <Card className="p-6 h-full" hoverable={false}>
                  <p className="font-heading text-[10px] tracking-[0.3em] text-foreground-muted mb-3">
                    04 · BY APPLICATION
                  </p>
                  <h3 className="font-heading text-2xl text-off-white mb-3">
                    1:1 COACHING
                  </h3>
                  <p className="text-foreground-muted text-sm leading-relaxed mb-6">
                    Direct coaching with Anthony. Limited slots. For
                    riders with a specific event, a specific deadline,
                    and the commitment to match.
                  </p>
                  <Button
                    href="/coaching"
                    variant="secondary"
                    className="w-full"
                    dataTrack="home_ladder_coaching"
                  >
                    Inquire
                  </Button>
                </Card>
              </ScrollReveal>
            </div>

            {/* Receipts — concrete member results, not vague testimonials. */}
            <ScrollReveal direction="up" delay={0.32} className="mt-12">
              <div className="max-w-3xl mx-auto text-center">
                <p className="font-heading text-coral text-[11px] tracking-[0.3em] mb-3">
                  WHAT THE LADDER LOOKS LIKE WHEN IT WORKS
                </p>
                <p className="text-foreground-muted text-sm md:text-base leading-relaxed">
                  Cat 3 to Cat 1. Body fat 20% to 7%. Women&apos;s
                  National Series results. Riders moving from
                  &ldquo;stuck&rdquo; to &ldquo;ahead of where they
                  were a decade ago&rdquo; — proving every week that
                  faster is still in front of them.
                </p>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Featured content — passes homepage authority to high-value
            blog cluster articles. These links are the single strongest
            internal-link equity transfer on the site. The Masters Cycling
            Training Report is the flagship long-form asset and gets a
            full-width feature treatment above the supporting guides. */}
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

            <div className="max-w-4xl mx-auto mb-4">
              <ScrollReveal direction="up">
                <Link
                  href="/blog/masters-cycling-training-report-2026"
                  className="block p-6 md:p-8 rounded-xl bg-gradient-to-br from-coral/15 via-deep-purple/30 to-charcoal hover:from-coral/25 border border-coral/30 hover:border-coral/60 transition-all group"
                >
                  <p className="font-heading text-coral text-[11px] tracking-[0.3em] mb-3">
                    THE FLAGSHIP REPORT
                  </p>
                  <p className="font-heading text-2xl md:text-3xl text-off-white group-hover:text-coral transition-colors tracking-wide mb-3">
                    THE MASTERS CYCLING TRAINING REPORT 2026
                  </p>
                  <p className="text-foreground-muted leading-relaxed mb-4 max-w-2xl">
                    The reference for training as a masters cyclist. What
                    actually declines after 40, what doesn&apos;t, and the
                    training that holds up. 10 sections, 40+ citations, 5 named
                    case studies, and a 12-week block you can run on Monday.
                  </p>
                  <span className="text-coral text-sm font-body font-medium">
                    Read the full report &rarr;
                  </span>
                </Link>
              </ScrollReveal>
            </div>

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
