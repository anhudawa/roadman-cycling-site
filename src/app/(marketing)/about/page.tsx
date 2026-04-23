import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal, ParallaxImage } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "About — Anthony Walsh & Roadman Cycling",
  description:
    "The story behind Roadman Cycling. How Anthony Walsh built a 1M+ listener podcast and a community of serious cyclists who refuse to accept their best days are behind them.",
  alternates: {
    canonical: "https://roadmancycling.com/about",
  },
  openGraph: {
    title: "About — Anthony Walsh & Roadman Cycling",
    description:
      "The story behind Roadman Cycling. How Anthony Walsh built a 1M+ listener podcast and a community of serious cyclists who refuse to accept their best days are behind them.",
    type: "profile",
    url: "https://roadmancycling.com/about",
  },
};

type ExpertCategory = "scientist" | "coach" | "athlete";

const categoryStyles: Record<ExpertCategory, { label: string; color: string; border: string }> = {
  scientist: { label: "SCIENCE", color: "text-fuchsia-300", border: "border-l-fuchsia-300" },
  coach: { label: "COACHING", color: "text-coral", border: "border-l-coral" },
  athlete: { label: "ATHLETE", color: "text-green-400", border: "border-l-green-400" },
};

const expertNetwork: { name: string; role: string; category: ExpertCategory; highlight?: string; slug?: string }[] = [
  { name: "Professor Stephen Seiler", role: "Exercise physiologist", category: "scientist", highlight: "Polarised training pioneer" },
  { name: "Dan Lorang", role: "Head of Performance, Red Bull–Bora–Hansgrohe", category: "coach", highlight: "World Tour training methodology" },
  { name: "Greg LeMond", role: "3× Tour de France winner", category: "athlete", highlight: "American cycling legend" },
  { name: "Lachlan Morton", role: "EF Education pro", category: "athlete", highlight: "Alt-racing pioneer" },
  { name: "Joe Friel", role: "Author, Cyclist's Training Bible", category: "coach", highlight: "Legendary cycling coach" },
  { name: "Dr. David Dunne", role: "Sports science researcher", category: "scientist", highlight: "Performance physiology" },
  { name: "Ben Healy", role: "Pro cyclist, Tour de France", category: "athlete", highlight: "Irish cycling star" },
  { name: "John Wakefield", role: "Red Bull–Bora–Hansgrohe coach", category: "coach", highlight: "World Tour performance" },
  { name: "Michael Matthews", role: "15+ year World Tour pro", category: "athlete", highlight: "Grand Tour stage winner" },
  { name: "Dan Bigham", role: "Former Hour Record holder", category: "athlete", highlight: "Aerodynamics specialist" },
  { name: "Rosa Kloser", role: "2024 Unbound Gravel winner", category: "athlete", highlight: "Off-road trailblazer" },
  { name: "Tim Spector", role: "ZOE founder, epidemiologist", category: "scientist", highlight: "Nutrition science" },
];

const milestones = [
  { year: "2021", event: "Roadman Cycling Podcast launches", icon: "🎙️" },
  { year: "2022", event: "1 million downloads", icon: "📈" },
  { year: "2023", event: "Sarah joins the podcast team", icon: "🤝" },
  { year: "2024", event: "Greg LeMond interview — a career highlight", icon: "🏆" },
  { year: "2025", event: "1 million monthly listeners", icon: "🔊" },
  { year: "2026", event: "Not Done Yet coaching community launches", icon: "💪" },
  { year: "NOW", event: "New site. New era. We're just getting started.", icon: "🚀" },
];

export default function AboutPage() {
  return (
    <>
      {/* Full Person entity for Anthony Walsh — supports Google Knowledge Panel
          eligibility by linking the same-name entity across Roadman's podcast
          feeds, YouTube, and social platforms. Kept consistent with the founder
          Person inside Organization JsonLd emitted in JsonLd.tsx. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": ["Person", "ProfilePage"],
          name: "Anthony Walsh",
          alternateName: "Anthony Walsh (Roadman Cycling)",
          mainEntity: {
            "@type": "Person",
            name: "Anthony Walsh",
          },
          description:
            "Cycling coach and founder of Roadman Cycling. Host of the Roadman Cycling Podcast, with over 1,300 conversations with World Tour coaches, sports scientists, and professional riders — including Prof. Stephen Seiler, Dan Lorang, Greg LeMond, and Lachlan Morton.",
          image: "https://roadmancycling.com/images/about/anthony-walsh-podcast.jpg",
          jobTitle: "Cycling Coach & Podcast Host",
          url: "https://roadmancycling.com/about",
          sameAs: [
            "https://youtube.com/@theroadmanpodcast",
            "https://instagram.com/roadman.cycling",
            "https://facebook.com/roadmancycling",
            "https://x.com/Roadman_Podcast",
            "https://tiktok.com/@roadmancyclingpodcast",
            "https://open.spotify.com/show/2oCs3N4ahypwzzUrFqgUmC",
            "https://podcasts.apple.com/us/podcast/the-roadman-cycling-podcast/id1224143549",
          ],
          knowsAbout: [
            "Cycling coaching",
            "Cycling training methodology",
            "Polarised training",
            "Functional Threshold Power (FTP)",
            "Cycling nutrition",
            "Strength training for cyclists",
            "Triathlon bike coaching",
            "Endurance sports podcasting",
          ],
          worksFor: {
            "@type": "Organization",
            name: "Roadman Cycling",
            url: "https://roadmancycling.com",
          },
          founder: {
            "@type": "Organization",
            name: "Roadman Cycling",
            url: "https://roadmancycling.com",
          },
          mainEntityOfPage: "https://roadmancycling.com/about",
        }}
      />

      <Header />

      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-16">
          <Container className="text-center">
            <ScrollReveal direction="up">
              <h1
                className="font-heading text-off-white mb-6"
                style={{ fontSize: "var(--text-hero)" }}
              >
                WHY WE EXIST
              </h1>
              <p className="text-foreground-muted text-xl max-w-3xl mx-auto leading-relaxed">
                The best information in sport — the stuff that actually moves
                the needle — reaches elite athletes first, then the mega-rich,
                and sometimes takes decades to trickle down to the rest of us.
                I set out to short-circuit that process. To connect you directly
                with the best minds in the game — the coaches, scientists, and
                riders at the tip of the spear — so you get the same edge
                without the wait. Performance, longevity, and a better life on
                and off the bike. That&apos;s why Roadman exists.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Anthony Photos */}
        <Section background="charcoal" className="!pb-0">
          <Container>
            <ScrollReveal direction="up">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 relative aspect-[4/3] md:aspect-[16/9] rounded-xl overflow-hidden">
                  <Image
                    src="/images/about/anthony-walsh-podcast.jpg"
                    alt="Anthony Walsh recording the Roadman Cycling Podcast"
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 768px) 100vw, 800px"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent" />
                </div>
                <div className="relative aspect-[4/3] md:aspect-[9/16] rounded-xl overflow-hidden">
                  <Image
                    src="/images/about/anthony-profile-closeup.jpg"
                    alt="Anthony Walsh — close-up profile after a ride"
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent" />
                </div>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Anthony's Story */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2
                className="font-heading text-off-white mb-8"
                style={{ fontSize: "var(--text-section)" }}
              >
                THE STORY
              </h2>
            </ScrollReveal>

            <div className="space-y-6 text-foreground-muted leading-relaxed">
              <ScrollReveal direction="up" delay={0.1}>
                <p>
                  Most of what makes cyclists faster never leaves the team bus.
                  The periodisation models, the nutrition protocols, the recovery
                  strategies — they stay behind closed doors. Roadman Cycling
                  was built to change that.
                </p>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.15}>
                <p>
                  Anthony Walsh started as a cyclist chasing marginal gains with
                  no access to the people who actually understood them. So he
                  picked up a microphone and went straight to the source —
                  the coaches, the scientists, the riders living it every day.
                </p>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.2}>
                <p>
                  Professor Stephen Seiler broke down polarised training.
                  Dan Lorang explained World Tour training methodology.
                  Greg LeMond shared what it took to win three Tours de France.
                  Lachlan Morton talked about why the World Tour wasn&apos;t
                  enough. Over 1,300 conversations later, the access hasn&apos;t
                  slowed down.
                </p>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.25}>
                <p>
                  Today, 1 million monthly listeners tune in — not casual fans,
                  but serious cyclists with families, limited time, and real
                  ambitions on the bike. People who refuse to accept that their
                  best days are behind them.
                </p>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.3}>
                <p className="text-off-white font-medium text-lg">
                  We don&apos;t have all the answers. But we&apos;re going to ask all
                  the questions. We&apos;re not done yet. And neither are you.
                </p>
              </ScrollReveal>
            </div>
          </Container>
        </Section>

        {/* Parallax — Desert road climb */}
        <ParallaxImage
          src="/images/cycling/gravel-desert-road-epic.jpg"
          alt="Two cyclists climbing a winding road through dramatic desert terrain"
          className="h-[50vh] md:h-[70vh]"
          objectPosition="center 45%"
          speed={0.3}
          overlayColor="from-charcoal via-charcoal/50 to-deep-purple"
        />

        {/* Timeline */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2
                className="font-heading text-off-white text-center mb-16"
                style={{ fontSize: "var(--text-section)" }}
              >
                THE TIMELINE
              </h2>
            </ScrollReveal>

            <div className="relative">
              {/* Central line */}
              <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-coral/60 via-purple/40 to-transparent md:-translate-x-px" />

              {milestones.map((m, i) => {
                const isLast = i === milestones.length - 1;
                const isEven = i % 2 === 0;
                return (
                  <ScrollReveal
                    key={m.year}
                    direction={isEven ? "left" : "right"}
                    delay={i * 0.1}
                  >
                    <div
                      className={`relative flex items-start gap-6 mb-12 last:mb-0 md:gap-0 ${
                        isEven ? "md:flex-row" : "md:flex-row-reverse"
                      }`}
                    >
                      {/* Dot on the line */}
                      <div
                        className={`absolute left-6 md:left-1/2 -translate-x-1/2 top-1 z-10 w-4 h-4 rounded-full border-2 ${
                          isLast
                            ? "border-coral bg-coral shadow-[0_0_12px_rgba(255,107,74,0.6)]"
                            : "border-coral/60 bg-deep-purple"
                        }`}
                      />

                      {/* Content card — mobile: always right of line, desktop: alternating */}
                      <div className="pl-12 md:pl-0 md:w-1/2">
                        <div
                          className={`${
                            isEven ? "md:pr-12 md:text-right" : "md:pl-12"
                          }`}
                        >
                          <span className="font-heading text-3xl text-coral block mb-1">
                            {m.year}
                          </span>
                          <span className="text-2xl block mb-2" aria-hidden="true">
                            {m.icon}
                          </span>
                          <p
                            className={`text-foreground-muted text-lg leading-relaxed ${
                              isLast ? "text-off-white font-medium" : ""
                            }`}
                          >
                            {m.event}
                          </p>
                        </div>
                      </div>

                      {/* Spacer for the other side on desktop */}
                      <div className="hidden md:block md:w-1/2" />
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </Container>
        </Section>

        {/* Coaching CTA — caught mid-story, highest-intent moment */}
        <Section background="charcoal" className="!py-16">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <div className="rounded-2xl border border-coral/20 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-8 md:p-12 text-center">
                <p className="font-heading text-coral text-sm tracking-widest mb-4">
                  WORK WITH ME
                </p>
                <h3
                  className="font-heading text-off-white mb-4"
                  style={{ fontSize: "var(--text-section-sm, 2.25rem)" }}
                >
                  EVERYTHING I&apos;VE LEARNED, APPLIED TO YOUR TRAINING.
                </h3>
                <p className="text-foreground-muted text-lg mb-8 max-w-xl mx-auto leading-relaxed">
                  1,300+ conversations with the best coaches, scientists and
                  riders in the sport — distilled into a plan built around
                  your power numbers, your events, your calendar, your life.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button href="/apply" size="lg">
                    Apply for Coaching
                  </Button>
                  <Button href="/coaching" variant="ghost" size="lg">
                    How Coaching Works
                  </Button>
                </div>
                <p className="text-foreground-subtle text-sm mt-6">
                  7-day free trial · $195/month · Cancel anytime
                </p>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Expert Network */}
        <Section background="charcoal" className="section-glow-coral">
          <Container>
            <ScrollReveal direction="up">
              <h2
                className="font-heading text-off-white text-center mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                THE EXPERT NETWORK
              </h2>
              <p className="text-foreground-muted text-center max-w-xl mx-auto mb-6">
                The coaches, scientists, and athletes who have shaped Roadman
                Cycling through hundreds of conversations.
              </p>
            </ScrollReveal>

            {/* Category legend */}
            <ScrollReveal direction="up" delay={0.05}>
              <div className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap mb-12">
                {(Object.entries(categoryStyles) as [ExpertCategory, typeof categoryStyles[ExpertCategory]][]).map(([key, style]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full bg-current ${style.color}`} />
                    <span className={`text-xs font-body tracking-widest ${style.color}`}>
                      {style.label}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {expertNetwork.map((expert, i) => {
                const style = categoryStyles[expert.category];
                return (
                  <ScrollReveal key={expert.name} direction="up" delay={i * 0.04}>
                    <Card className={`p-5 h-full border-l-2 ${style.border} card-shimmer`} href={`/guests/${expert.name.toLowerCase().replace(/['']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`} glass>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <p className="font-heading text-lg text-off-white leading-tight group-hover:text-coral transition-colors">
                          {expert.name.toUpperCase()}
                        </p>
                        <span className={`text-[10px] font-body tracking-widest ${style.color} shrink-0 mt-1`}>
                          {style.label}
                        </span>
                      </div>
                      <p className="text-sm text-foreground-muted mb-2">
                        {expert.role}
                      </p>
                      {expert.highlight && (
                        <p className={`text-xs ${style.color} font-medium`}>
                          {expert.highlight}
                        </p>
                      )}
                    </Card>
                  </ScrollReveal>
                );
              })}
            </div>

            <ScrollReveal direction="up" delay={0.5}>
              <p className="text-center text-foreground-muted text-sm mt-8">
                Plus 1,300+ more conversations in{" "}
                <Link href="/guests" className="text-coral hover:underline">
                  the full guest archive
                </Link>
                .
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Team */}
        <Section background="deep-purple" grain>
          <Container>
            <ScrollReveal direction="up">
              <h2
                className="font-heading text-off-white text-center mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                THE TEAM
              </h2>
              <p className="text-foreground-muted text-center max-w-lg mx-auto mb-12">
                Small team. Big ambitions. Every one of us rides.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[
                { name: "Anthony Walsh", role: "Host & Content", image: "/images/team/anthony.avif", bio: "The voice behind 1,300+ episodes" },
                { name: "Sarah Ann Egan", role: "Co-Host & Operations", image: "/images/team/sarah-solo.jpg", bio: "Keeps the wheels turning" },
                { name: "Wes Andrade", role: "Production", image: "/images/team/wes.jpg", bio: "Makes it sound this good" },
                { name: "Matthew Devins", role: "Coaching", image: "/images/team/devins.jpg", bio: "Not Done Yet coaching community lead" },
              ].map((member, i) => (
                <ScrollReveal key={member.name} direction="up" delay={i * 0.1}>
                  <div className="group relative h-full">
                    {/* Photo area */}
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-4">
                      {member.image ? (
                        <>
                          <Image
                            src={member.image}
                            alt={member.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-deep-purple/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                            <p className="text-sm text-off-white/90">{member.bio}</p>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-coral/10 via-purple/20 to-deep-purple flex items-center justify-center rounded-xl border border-white/5">
                          <span className="font-heading text-5xl text-off-white/30 group-hover:text-off-white/50 transition-colors duration-300">
                            {"initials" in member ? (member as { initials: string }).initials : ""}
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Name + role */}
                    <p className="font-heading text-lg text-off-white group-hover:text-coral transition-colors duration-300">
                      {member.name.toUpperCase()}
                    </p>
                    <p className="text-xs text-foreground-subtle font-body tracking-widest mt-1">
                      {member.role.toUpperCase()}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* CTA — apply is primary; free community + press are softer options */}
            <div className="mt-16 text-center">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button href="/apply" size="lg">
                  Apply to Work With Us
                </Button>
                <Button href="/community/clubhouse" variant="ghost" size="lg">
                  Join Free Community
                </Button>
                <Button href="/about/press" variant="ghost" size="lg">
                  Press &amp; Media Kit
                </Button>
              </div>
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
