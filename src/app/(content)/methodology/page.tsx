import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Card, ScrollReveal, GradientText } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { ENTITY_IDS } from "@/lib/brand-facts";
import { CoachingCTA } from "@/components/proof";
import { JourneyBlock } from "@/components/journey";

export const metadata: Metadata = {
  title: "Coaching Methodology — How Roadman Coaches Cyclists",
  description:
    "The Roadman coaching methodology — five pillars, the science it sits on, and the guests who shaped it. Evidence-based coaching for serious amateur and masters cyclists.",
  alternates: {
    canonical: "https://roadmancycling.com/methodology",
  },
  openGraph: {
    title: "Coaching Methodology — Roadman Cycling",
    description:
      "Evidence-based coaching for serious amateur and masters cyclists. Five pillars, real science, real results.",
    type: "website",
    url: "https://roadmancycling.com/methodology",
  },
};

interface PillarSpec {
  number: string;
  title: string;
  promise: string;
  body: string;
  /** Named experts whose work or interviews shaped this pillar */
  rooted: { name: string; href: string; credential?: string }[];
  /** Internal pages where the methodology is applied */
  see: { label: string; href: string }[];
}

const PILLARS: PillarSpec[] = [
  {
    number: "01",
    title: "Training",
    promise:
      "Periodised, polarised-leaning training built around your week — not a stock template.",
    body: "We coach off the 80/20 intensity distribution Stephen Seiler observed in elite endurance athletes, adjusted for the time-limited reality of serious amateur and masters riders. Personalised TrainingPeaks plans, weekly review of how you actually responded, and direct calls when life or fatigue forces a re-plan.",
    rooted: [
      {
        name: "Prof. Stephen Seiler",
        href: "/guests/stephen-seiler",
        credential: "Polarised training pioneer",
      },
      {
        name: "Dan Lorang",
        href: "/guests/dan-lorang",
        credential: "Red Bull–Bora–Hansgrohe Head of Performance",
      },
      {
        name: "Joe Friel",
        href: "/guests/joe-friel",
        credential: "Author, The Cyclist's Training Bible",
      },
    ],
    see: [
      { label: "Polarised vs Sweet Spot", href: "/compare/polarised-vs-sweet-spot-training" },
      { label: "Zone 2 Training Guide", href: "/blog/zone-2-training-complete-guide" },
      { label: "FTP Zone Calculator", href: "/tools/ftp-zones" },
    ],
  },
  {
    number: "02",
    title: "Nutrition",
    promise:
      "Practical fuelling for performance, race weight, and body composition — periodised with your training.",
    body: "Carbohydrate availability matched to the work required. We avoid the fasted-everything trap and the high-carb-everything trap. Race weight is a downstream outcome of training honestly and fuelling specifically — not a calorie deficit on top of an already-heavy training week.",
    rooted: [
      {
        name: "Dr David Dunne",
        href: "/guests/david-dunne",
        credential: "World Tour nutritionist",
      },
      {
        name: "Dr Sam Impey",
        href: "/guests/sam-impey",
        credential: "Sports nutritionist, performance researcher",
      },
      {
        name: "Tim Podlogar",
        href: "/guests/tim-podlogar",
        credential: "Carbohydrate metabolism researcher",
      },
    ],
    see: [
      { label: "Fuel for the Work Required", href: "/blog/cycling-weight-loss-fuel-for-the-work-required" },
      { label: "Race Weight Calculator", href: "/tools/race-weight" },
      { label: "In-Ride Fuelling", href: "/tools/fuelling" },
    ],
  },
  {
    number: "03",
    title: "Strength",
    promise:
      "Cycling-specific strength that transfers to the bike — not bodybuilding, not generic gym work.",
    body: "Heavy-leg-day-into-intervals is how amateurs wreck themselves. We periodise S&C with your riding so strength sessions support, never compromise, your rides. Particular focus on hip and glute strength for masters cyclists where the joint-loading rationale is strongest.",
    rooted: [
      {
        name: "Derek Teel",
        href: "/guests/derek-teel",
        credential: "S&C coach for cyclists, Dialed Health",
      },
      {
        name: "Dr Andy Pruitt",
        href: "/guests/dr-andy-pruitt",
        credential: "Pioneering bike fit and physio expert",
      },
    ],
    see: [
      { label: "Strength Training for Cyclists", href: "/strength-training" },
      { label: "Cycling vs Endurance Strength", href: "/compare/strength-vs-endurance-cyclist" },
    ],
  },
  {
    number: "04",
    title: "Recovery",
    promise:
      "Sleep, stress and adaptation treated as part of the plan — not the part you skip when work gets busy.",
    body: "Recovery is where the adaptation lives. Energy availability, HRV trends, sleep window protection, deload cadence. Most plateaus we diagnose are recovery shortfalls in disguise — not training errors.",
    rooted: [
      {
        name: "Dr Michael Gervais",
        href: "/guests/dr-michael-gervais",
        credential: "High-performance psychologist",
      },
      {
        name: "Dr Mark Gordon",
        href: "/guests/dr-mark-gordon",
        credential: "Endocrinologist, hormone specialist",
      },
    ],
    see: [
      { label: "Energy Availability Tool", href: "/tools/energy-availability" },
      { label: "Always Tired On The Bike", href: "/problem/always-tired-on-the-bike" },
    ],
  },
  {
    number: "05",
    title: "Community",
    promise:
      "A coached, accountable community of serious cyclists — not a Strava feed, not a Discord ghost town.",
    body: "Le metier — the craft — only exists when you're around people obsessed with it. Weekly live coaching calls, 1:1 plan reviews, and a private group of riders who know your numbers and notice when you go quiet. The reason this works when apps and solo plans don't.",
    rooted: [
      {
        name: "Anthony Walsh",
        href: "/author/anthony-walsh",
        credential: "Coach, Roadman Cycling",
      },
    ],
    see: [
      { label: "Inside Not Done Yet", href: "/community/not-done-yet" },
      { label: "The Clubhouse (free)", href: "/community/clubhouse" },
    ],
  },
];

export default function MethodologyPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Coaching Methodology — Roadman Cycling",
          description:
            "Evidence-based coaching methodology for serious amateur and masters cyclists. Five pillars rooted in named expert sources.",
          url: "https://roadmancycling.com/methodology",
          isPartOf: { "@id": ENTITY_IDS.website },
          author: { "@id": ENTITY_IDS.person },
          publisher: { "@id": ENTITY_IDS.organization },
          speakable: {
            "@type": "SpeakableSpecification",
            cssSelector: ["h1", ".methodology-intro"],
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://roadmancycling.com" },
            { "@type": "ListItem", position: 2, name: "Methodology", item: "https://roadmancycling.com/methodology" },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-16">
          <Container width="narrow" className="text-center">
            <ScrollReveal direction="up" eager>
              <p className="font-heading text-coral text-sm tracking-widest mb-4">
                METHODOLOGY
              </p>
              <GradientText as="h1" className="font-heading mb-6">
                <span style={{ fontSize: "var(--text-hero)" }}>
                  HOW WE COACH.
                </span>
              </GradientText>
              <p className="methodology-intro text-foreground-muted text-lg max-w-2xl mx-auto leading-relaxed">
                Roadman is evidence-based coaching for serious amateur and
                masters cyclists. Five pillars, each rooted in named experts and
                published research, built into one coached weekly system. No
                guesswork, no influencer protocols, no generic gym programmes.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        <Section background="charcoal">
          <Container width="narrow">
            <div className="space-y-6">
              {PILLARS.map((p, i) => (
                <ScrollReveal key={p.number} direction="up" delay={i * 0.05}>
                  <Card className="p-6 md:p-8" hoverable={false}>
                    <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                      <div className="md:w-32 shrink-0">
                        <p
                          className="font-heading text-coral leading-none"
                          style={{ fontSize: "clamp(2.5rem, 4vw, 3.25rem)" }}
                        >
                          {p.number}
                        </p>
                        <p className="font-heading text-off-white text-lg tracking-wide mt-2">
                          {p.title.toUpperCase()}
                        </p>
                      </div>
                      <div className="flex-1">
                        <p className="font-heading text-off-white text-lg leading-snug mb-3">
                          {p.promise}
                        </p>
                        <p className="text-foreground-muted text-sm md:text-base leading-relaxed mb-5">
                          {p.body}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div>
                            <p className="font-heading text-coral text-[11px] tracking-[0.25em] mb-2">
                              ROOTED IN
                            </p>
                            <ul className="space-y-1.5">
                              {p.rooted.map((r) => (
                                <li key={r.name}>
                                  <Link
                                    href={r.href}
                                    className="text-off-white text-sm hover:text-coral transition-colors"
                                  >
                                    {r.name}
                                  </Link>
                                  {r.credential && (
                                    <span className="text-foreground-subtle text-xs block leading-snug">
                                      {r.credential}
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="font-heading text-coral text-[11px] tracking-[0.25em] mb-2">
                              SEE IT APPLIED
                            </p>
                            <ul className="space-y-1.5">
                              {p.see.map((s) => (
                                <li key={s.href}>
                                  <Link
                                    href={s.href}
                                    className="text-off-white text-sm hover:text-coral transition-colors"
                                  >
                                    {s.label} →
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up" className="mb-8 text-center">
              <p className="font-heading text-coral text-xs tracking-widest mb-3">
                TRUST
              </p>
              <h2
                className="font-heading text-off-white"
                style={{ fontSize: "var(--text-section)" }}
              >
                HOW WE STAY HONEST
              </h2>
              <p className="text-foreground-muted text-sm md:text-base mt-4 max-w-xl mx-auto leading-relaxed">
                Every claim on this site is sourced. Every protocol we
                recommend has been tested in 100+ coached athletes. Every
                article is reviewed before publication.
              </p>
            </ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card href="/research" className="p-5 text-center" hoverable>
                <p className="font-heading text-coral text-xs tracking-widest mb-1">
                  RESEARCH
                </p>
                <p className="font-heading text-off-white text-base group-hover:text-coral transition-colors">
                  Evidence base →
                </p>
              </Card>
              <Card href="/editorial-standards" className="p-5 text-center" hoverable>
                <p className="font-heading text-coral text-xs tracking-widest mb-1">
                  STANDARDS
                </p>
                <p className="font-heading text-off-white text-base group-hover:text-coral transition-colors">
                  Editorial standards →
                </p>
              </Card>
              <Card href="/author/anthony-walsh" className="p-5 text-center" hoverable>
                <p className="font-heading text-coral text-xs tracking-widest mb-1">
                  WHO COACHES
                </p>
                <p className="font-heading text-off-white text-base group-hover:text-coral transition-colors">
                  Anthony Walsh →
                </p>
              </Card>
            </div>
          </Container>
        </Section>

        <Section background="charcoal">
          <Container width="narrow">
            <JourneyBlock
              stage="coaching"
              source="methodology"
              eyebrow="WHERE TO GO NEXT"
              heading="DECIDE FROM EVIDENCE — NOT FROM A SALES PAGE."
              className="mb-12"
            />
            <CoachingCTA source="methodology" />
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
