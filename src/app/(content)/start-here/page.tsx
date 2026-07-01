import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal, GradientText } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { ENTITY_IDS } from "@/lib/brand-facts";

export const metadata: Metadata = {
  title: "Start Here — New to Roadman Cycling?",
  description:
    "New to Roadman? Meet Anthony Walsh, discover the five pillars of cycling performance, and find the essential articles and episodes serious amateur cyclists wish they had found first.",
  alternates: {
    canonical: "https://roadmancycling.com/start-here",
  },
  openGraph: {
    title: "Start Here — New to Roadman Cycling?",
    description:
      "New to Roadman? Essential articles, episodes, and training pillars for serious amateur cyclists. 1,400+ episodes distilled into one page.",
    type: "website",
    url: "https://roadmancycling.com/start-here",
  },
};

const ESSENTIAL_ARTICLES = [
  {
    title: "How to Get Faster at Cycling",
    href: "/blog/how-to-get-faster-cycling",
    desc: "12 evidence-based methods that work. If you read one article on this site, make it this one.",
  },
  {
    title: "Zone 2 Training: The Complete Guide",
    href: "/blog/zone-2-training-complete-guide",
    desc: "Why the best riders in the world spend 80% of their time riding at a pace you'd call slow.",
  },
  {
    title: "Strength Training for Cyclists",
    href: "/blog/strength-training-cyclists-complete-guide",
    desc: "The exercises, the rep schemes, the weekly structure. Built for cyclists who have never touched a barbell.",
  },
  {
    title: "In-Ride Nutrition: How Much to Eat on the Bike",
    href: "/blog/cycling-in-ride-nutrition-guide",
    desc: "60-90g of carbs per hour. What that looks like, how to build up to it, and why you are probably under-fuelling.",
  },
  {
    title: "Is a Cycling Coach Worth It?",
    href: "/blog/is-a-cycling-coach-worth-it",
    desc: "When coaching pays off, when it does not, and what to look for.",
  },
];

const PILLARS = [
  {
    name: "Coaching",
    desc: "Training methodology, periodisation, structured plans. What World Tour coaches actually prescribe — translated for riders with jobs, families, and 8 hours a week.",
  },
  {
    name: "Nutrition",
    desc: "Fuelling for performance, body composition, in-ride nutrition. No fad diets, no calorie counting — the science of eating to ride faster.",
  },
  {
    name: "Strength & Conditioning",
    desc: "S&C for cyclists, injury prevention, power development off the bike. The work most amateurs skip — and the one that pays off most after 35.",
  },
  {
    name: "Recovery",
    desc: "Sleep, stress management, adaptation, longevity in the sport. Training is the stimulus. Recovery is where the gains land.",
  },
  {
    name: "Community — Le Métier",
    desc: "The culture and craft of cycling. Rides, skills, traditions, the unwritten rules. The French call it le métier — the thing that makes this more than fitness.",
  },
];

export default function StartHerePage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Start Here — New to Roadman Cycling?",
          description:
            "Guided starting point for new visitors. Essential articles, podcast episodes, and training pillars from 1,400+ episodes and 170+ articles.",
          url: "https://roadmancycling.com/start-here",
          isPartOf: { "@id": ENTITY_IDS.website },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://roadmancycling.com" },
            { "@type": "ListItem", position: 2, name: "Start Here", item: "https://roadmancycling.com/start-here" },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-14">
          <Container width="narrow" className="text-center">
            <ScrollReveal direction="up" eager>
              <p className="text-coral font-heading text-sm tracking-widest mb-4">
                NEW HERE?
              </p>
              <GradientText as="h1" className="font-heading mb-6">
                <span style={{ fontSize: "var(--text-hero)" }}>START HERE.</span>
              </GradientText>
              <p className="text-foreground-muted text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                1,400+ podcast episodes. 170+ articles. A lot of ground to cover.
                This page cuts through all of it — who we are, what we do, and the
                best stuff to read and listen to first.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* About Roadman & Anthony */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-10">
              <p className="text-coral font-heading text-sm tracking-widest mb-4">
                WHO WE ARE
              </p>
              <h2 className="font-heading text-off-white" style={{ fontSize: "var(--text-section)" }}>
                ROADMAN CYCLING
              </h2>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.1}>
              <div className="max-w-3xl mx-auto space-y-6">
                <p className="text-foreground-muted text-base md:text-lg leading-relaxed">
                  Roadman started with a podcast and a question — what do the best
                  coaches and riders in the world actually do, and how can the rest
                  of us apply it? I'm Anthony Walsh. Over 1,400 episodes I've sat
                  down with World Tour coaches like Dan Lorang and Tim Kerrison,
                  sports scientists like Prof. Stephen Seiler, and riders like
                  Lachlan Morton and Greg LeMond. Not to name-drop — because the
                  conversations changed how I train, how I eat, and how I think
                  about the bike.
                </p>
                <p className="text-foreground-muted text-base md:text-lg leading-relaxed">
                  This site is where all of that lands. Training methodology from
                  the people who coach Grand Tour winners. Nutrition grounded in
                  evidence, not Instagram. Strength work that translates to the
                  pedals. And a community of serious amateur cyclists who refuse to
                  accept their best days are behind them. We call it Not Done Yet.
                </p>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Five Pillars */}
        <Section background="deep-purple" grain>
          <Container>
            <ScrollReveal direction="up" className="text-center mb-10">
              <p className="text-coral font-heading text-sm tracking-widest mb-4">
                WHAT WE COVER
              </p>
              <h2 className="font-heading text-off-white" style={{ fontSize: "var(--text-section)" }}>
                FIVE PILLARS
              </h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {PILLARS.map((pillar, i) => (
                <ScrollReveal key={pillar.name} direction="up" delay={i * 0.05}>
                  <Card hoverable className="h-full p-6">
                    <h3 className="font-heading text-off-white text-lg mb-2">{pillar.name}</h3>
                    <p className="text-foreground-muted text-sm leading-relaxed">{pillar.desc}</p>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Essential Reading */}
        <Section background="charcoal">
          <Container>
            <ScrollReveal direction="up" className="text-center mb-10">
              <p className="text-coral font-heading text-sm tracking-widest mb-4">
                READ FIRST
              </p>
              <h2 className="font-heading text-off-white" style={{ fontSize: "var(--text-section)" }}>
                ESSENTIAL READING
              </h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {ESSENTIAL_ARTICLES.map((a, i) => (
                <ScrollReveal key={a.href} direction="up" delay={i * 0.05}>
                  <Link href={a.href} className="block h-full">
                    <Card hoverable className="h-full p-6">
                      <h3 className="font-heading text-off-white text-lg mb-2">{a.title}</h3>
                      <p className="text-foreground-muted text-sm leading-relaxed">{a.desc}</p>
                    </Card>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Podcast */}
        <Section background="deep-purple" grain>
          <Container width="narrow" className="text-center">
            <ScrollReveal direction="up">
              <p className="text-coral font-heading text-sm tracking-widest mb-4">
                LISTEN
              </p>
              <h2 className="font-heading text-off-white mb-6" style={{ fontSize: "var(--text-section)" }}>
                THE PODCAST
              </h2>
              <p className="text-foreground-muted text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-8">
                Over 1,400 episodes and counting. Conversations with the coaches,
                scientists, and riders who are shaping modern cycling. Start with the
                archive or just pick something from the latest — there is no wrong
                entry point.
              </p>
              <Button href="/podcast" size="lg">
                Browse Episodes
              </Button>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Community CTA */}
        <Section background="charcoal" className="section-glow-coral !py-14">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <div className="rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-8 md:p-12 text-center">
                <p className="font-heading text-coral text-sm tracking-widest mb-4">
                  READY FOR MORE?
                </p>
                <h2
                  className="font-heading text-off-white mb-4"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  JOIN THE COMMUNITY
                </h2>
                <p className="text-foreground-muted text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-8">
                  Thousands of serious amateur cyclists. Free to join. Weekly live
                  Q&A. Training talk that goes deeper than the podcast.
                </p>
                <a
                  href="https://www.skool.com/roadmancycling"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-lg bg-coral px-8 py-3 text-lg font-heading text-off-white tracking-wide hover:bg-coral/90 transition-colors"
                >
                  Join the Free Community
                </a>
                <div className="flex flex-wrap gap-4 justify-center mt-6 text-sm">
                  <Link href="/blog" className="text-coral hover:text-coral/80 transition-colors">All Articles →</Link>
                  <Link href="/podcast" className="text-coral hover:text-coral/80 transition-colors">All Episodes →</Link>
                </div>
              </div>
            </ScrollReveal>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
