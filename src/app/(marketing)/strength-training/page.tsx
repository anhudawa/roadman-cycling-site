import type { Metadata } from "next";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal, GradientText } from "@/components/ui";
import { CheckoutButton } from "@/components/features/conversion/CheckoutButton";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Strength Training for Cyclists — 12-Week S&C Plan",
  description:
    "The 12-week S&C plan built specifically for cyclists over 30. Training plan, instructional videos, stretching guide, core guide, and goal setting audio. One-time payment. 100% money back guarantee.",
  alternates: {
    canonical: "https://roadmancycling.com/strength-training",
  },
  openGraph: {
    title: "Strength Training for Cyclists — 12-Week S&C Plan",
    description:
      "The 12-week S&C plan built specifically for cyclists over 30. Training plan, instructional videos, stretching guide, core guide, and goal setting audio. One-time payment.",
    type: "website",
    url: "https://roadmancycling.com/strength-training",
  },
};

const whatsIncluded = [
  {
    number: "01",
    title: "The 12-Week Training Plan",
    description:
      "Outlines exactly what to do on a weekly basis. Periodised, progressive, and aligned with your riding — so you get stronger in the gym without wrecking your legs for the bike.",
  },
  {
    number: "02",
    title: "Instructional Videos",
    description:
      "Every exercise demonstrated with correct technique so you can train safely and effectively. No guessing, no bad form, no wasted reps.",
  },
  {
    number: "03",
    title: "Stretching Guide for Cyclists",
    description:
      "Targets the key muscle groups used in pedalling — unlock greater mobility, reduce soreness, and prevent the tightness that leads to injury.",
  },
  {
    number: "04",
    title: "Core Training Guide",
    description:
      "Build a stronger core for more power on the bike. Transfer more force through the legs, improve posture, reduce back pain, and support long-term riding health.",
  },
  {
    number: "05",
    title: "Goal Setting Audio Guide",
    description:
      "A bonus audio resource to sharpen your mindset, set powerful goals, trigger the small habits that drive big changes, and stay consistent even when life gets busy.",
  },
];

const results = [
  { stat: "8–15%", label: "power increase in 12 weeks", source: "Rønnestad et al., 2010" },
  { stat: "3–5%", label: "improvement in cycling economy", source: "Sunde et al., 2010" },
  { stat: "17%", label: "longer time to exhaustion", source: "Aagaard et al., 2011" },
];

export default function StrengthTrainingPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://roadmancycling.com" },
            { "@type": "ListItem", position: 2, name: "Strength Training", item: "https://roadmancycling.com/strength-training" },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: "Roadman Strength & Conditioning Plan",
          description:
            "12-week S&C plan for cyclists. Training plan, instructional videos, stretching guide, core guide, goal setting audio.",
          brand: { "@type": "Brand", name: "Roadman Cycling" },
          offers: {
            "@type": "Offer",
            price: "65",
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
          },
        }}
      />

      <Header />

      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-20">
          <Container className="text-center">
            <ScrollReveal direction="up">
              <p className="text-coral font-heading text-sm tracking-widest mb-6">
                ROADMAN STRENGTH &amp; CONDITIONING
              </p>
              <h1
                className="font-heading text-off-white mb-6"
                style={{ fontSize: "var(--text-hero)" }}
              >
                STOP LOSING WATTS
                <br />
                <span className="text-coral">TO A WEAK BODY</span>
              </h1>
              <p className="text-foreground-muted text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
                A 12-week strength and conditioning plan built specifically for
                cyclists over 30. Target the exact muscles and movement patterns
                that drive better cycling — your glutes, core, and posterior
                chain — without adding bulk or draining your energy.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
                <Button href="#enrol" size="lg">
                  Get the Plan — $65
                </Button>

                <Button href="#whats-inside" variant="ghost" size="lg">
                  See What&apos;s Inside
                </Button>
              </div>
              <p className="text-foreground-subtle text-sm">
                One-time payment. Lifetime access. 100% money back guarantee.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Gradient divider */}
        <div className="gradient-divider" />

        {/* The Science */}
        <Section background="charcoal">
          <Container>
            <ScrollReveal direction="up" className="text-center mb-12">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                THE SCIENCE IS NOT SUBTLE
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto">
                Peer-reviewed research on strength training for endurance
                cyclists. These aren&apos;t opinions — they&apos;re results.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {results.map((r, i) => (
                <ScrollReveal key={r.stat} direction="up" delay={i * 0.1}>
                  <Card className="p-8 text-center h-full" glass hoverable={false}>
                    <p className="font-heading text-5xl text-coral mb-2">
                      {r.stat}
                    </p>
                    <p className="text-off-white font-medium mb-3">
                      {r.label}
                    </p>
                    <p className="text-xs text-foreground-subtle">
                      {r.source}
                    </p>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* The Problem */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <ScrollReveal direction="left">
                <h2
                  className="font-heading text-off-white mb-6"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  <GradientText as="span">MOST STRENGTH PLANS AREN&apos;T MADE FOR CYCLISTS.</GradientText>
                </h2>
                <div className="space-y-4 text-foreground-muted leading-relaxed">
                  <p>
                    They&apos;re built by gym bros who&apos;ve never touched a bike,
                    or they pile on movements that leave you too sore to ride.
                    Bodybuilding splits that add bulk you don&apos;t need. CrossFit
                    WODs that wreck your legs before Tuesday&apos;s intervals.
                  </p>
                  <p>
                    This plan is different — because it&apos;s built by cyclists,
                    for cyclists. We target the exact muscles and movement patterns
                    that drive better cycling. It&apos;s all periodised, progressive,
                    and aligned with your riding.
                  </p>
                  <p className="text-off-white font-medium">
                    You won&apos;t just feel stronger in the gym — you&apos;ll feel
                    faster, more stable, and pain-free on the bike.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="right">
                <Card className="p-6" hoverable={false}>
                  <h3 className="font-heading text-lg text-off-white mb-4">
                    WHY S&amp;C FOR CYCLISTS?
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Increased power output — develop the muscles critical for powerful pedalling",
                      "Injury prevention — address muscle imbalances and strengthen connective tissues",
                      "Enhanced endurance — ride longer with less fatigue",
                      "Better efficiency — optimise movement patterns for less energy waste",
                      "Improved explosive power — handle accelerations and surges",
                      "Halts muscle loss — combats the decline that starts in your 30s",
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-foreground-muted"
                      >
                        <span className="text-coral mt-0.5 shrink-0">&#10003;</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              </ScrollReveal>
            </div>
          </Container>
        </Section>

        {/* Visual break — abstract gradient divider */}
        <div className="relative h-[25vh] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-coral/20 via-deep-purple to-charcoal" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(255,107,74,0.15),transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(139,92,246,0.2),transparent_60%)]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="font-heading text-off-white/10 text-[8rem] md:text-[12rem] select-none tracking-tighter leading-none">
              S&amp;C
            </p>
          </div>
        </div>

        {/* What's Inside */}
        <Section background="charcoal" id="whats-inside">
          <Container>
            <ScrollReveal direction="up" className="text-center mb-16">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                WHAT&apos;S INCLUDED
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto">
                Everything you need to get stronger on the bike. No guesswork.
                No gym experience required.
              </p>
            </ScrollReveal>

            <div className="max-w-4xl mx-auto space-y-4">
              {whatsIncluded.map((item, i) => (
                <ScrollReveal key={item.title} direction="up" delay={i * 0.06}>
                  <Card className="p-6 card-shimmer group" glass tilt tiltStrength={4}>
                    <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
                      <div className="shrink-0">
                        <span className="font-heading text-4xl text-coral/40 group-hover:text-coral transition-colors duration-300">
                          {item.number}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading text-xl text-off-white mb-2 group-hover:text-coral transition-colors duration-300">
                          {item.title.toUpperCase()}
                        </h3>
                        <p className="text-sm text-foreground-muted leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Who This Is For */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                IS THIS FOR YOU?
              </h2>
              <p className="text-foreground-muted max-w-lg mx-auto">
                Designed specifically for cyclists over 30 who want to rebuild
                strength, boost endurance, eliminate pain, and reignite
                performance.
              </p>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-8">
              <ScrollReveal direction="left">
                <Card className="p-6 h-full border-l-2 border-l-coral" hoverable={false}>
                  <h3 className="font-heading text-lg text-coral mb-4">YES, IF YOU...</h3>
                  <ul className="space-y-3">
                    {[
                      "Ride regularly but do zero strength work",
                      "Feel your position collapse on long rides",
                      "Get lower back or knee pain after 3+ hours",
                      "Want to be faster without adding more saddle time",
                      "Have tried gym plans that didn't stick or didn't transfer",
                      "Are over 30 and feel the muscle loss creeping in",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-foreground-muted">
                        <span className="text-coral mt-0.5 shrink-0">&#10003;</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              </ScrollReveal>

              <ScrollReveal direction="right">
                <Card className="p-6 h-full border-l-2 border-l-foreground-subtle" hoverable={false}>
                  <h3 className="font-heading text-lg text-foreground-subtle mb-4">NOT IF YOU...</h3>
                  <ul className="space-y-3">
                    {[
                      "Already follow a structured S&C plan from a coach",
                      "Are looking for a bodybuilding or muscle-gain programme",
                      "Want a personal coaching service (this is self-guided)",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-foreground-muted">
                        <span className="text-foreground-subtle mt-0.5 shrink-0">&times;</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              </ScrollReveal>
            </div>
          </Container>
        </Section>

        {/* Social Proof */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                FROM CYCLISTS WHO&apos;VE DONE IT
              </h2>
            </ScrollReveal>

            <div className="space-y-4">
              {[
                {
                  quote:
                    "I've been riding for over four decades and never realized how much I was leaving on the table. I'm more powerful, more stable, and recovering faster. I only wish I found this sooner.",
                  name: "Kevin L",
                  detail: "Age 67",
                },
                {
                  quote:
                    "I love how targeted it is to cycling — not just general gym stuff. Every session feels like it's actually helping my performance on the bike. Core's stronger, legs feel more connected, and even my position on the bike feels better.",
                  name: "Mary K",
                  detail: "Age 56",
                },
                {
                  quote:
                    "I'm climbing better, I've stopped getting that nagging knee pain. I always thought more riding was the answer — but this strength plan changed everything.",
                  name: "Community member",
                },
                {
                  quote:
                    "I used to skip strength work because I didn't know what to do. This plan made it simple. The videos are clear, the structure makes sense, and I can feel myself getting stronger on the bike.",
                  name: "Community member",
                },
              ].map((t, i) => (
                <ScrollReveal key={t.name + i} direction={i % 2 === 0 ? "left" : "right"}>
                  <Card className="p-6" glass hoverable={false}>
                    <p className="text-foreground-muted italic leading-relaxed mb-4">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-coral font-heading tracking-wider">
                        {t.name.toUpperCase()}
                      </p>
                      {t.detail && (
                        <p className="text-xs text-foreground-subtle">
                          &middot; {t.detail}
                        </p>
                      )}
                    </div>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Enrol CTA */}
        <Section background="coral" className="!py-16 md:!py-24" id="enrol">
          <Container className="text-center">
            <h2
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              STRONGER ON THE BIKE.<br />STARTING THIS WEEK.
            </h2>
            <p className="text-off-white/80 max-w-lg mx-auto mb-2">
              12-week training plan. Instructional videos. Stretching guide. Core
              guide. Goal setting audio. Everything you need — nothing you don&apos;t.
            </p>
            <p className="font-heading text-5xl text-off-white my-8">
              $65
            </p>
            <CheckoutButton>
              Get the Plan
            </CheckoutButton>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 text-off-white/60 text-sm">
              <span>One-time payment</span>
              <span className="hidden sm:inline">&middot;</span>
              <span>Lifetime access</span>
              <span className="hidden sm:inline">&middot;</span>
              <span>100% money back guarantee</span>
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
