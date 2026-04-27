import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal, GradientText } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { ENTITY_IDS } from "@/lib/brand-facts";

export const metadata: Metadata = {
  title: "Start Here — New to Roadman Cycling?",
  description:
    "New to Roadman? Start here. The best episodes, articles, tools, and resources to get you faster on the bike — curated from 1,400+ episodes and 170 articles.",
  alternates: {
    canonical: "https://roadmancycling.com/start-here",
  },
  openGraph: {
    title: "Start Here — New to Roadman Cycling?",
    description:
      "The best episodes, articles, tools, and resources to get you faster on the bike.",
    type: "website",
    url: "https://roadmancycling.com/start-here",
  },
};

const FOUNDATION_ARTICLES = [
  {
    title: "How to Get Faster at Cycling",
    href: "/blog/how-to-get-faster-cycling",
    desc: "12 evidence-based methods that actually work. The foundation.",
  },
  {
    title: "Zone 2 Training: Complete Guide",
    href: "/blog/zone-2-training-complete-guide",
    desc: "Why pros ride 80% easy — and how to apply it yourself.",
  },
  {
    title: "FTP Training Zones Guide",
    href: "/blog/ftp-training-zones-cycling-complete-guide",
    desc: "Understanding and using your 7 power zones.",
  },
  {
    title: "Is a Cycling Coach Worth It?",
    href: "/blog/is-a-cycling-coach-worth-it",
    desc: "Honest breakdown of when coaching pays off — and when it doesn't.",
  },
];

const COMPARISON_PICKS = [
  {
    title: "Zwift vs TrainerRoad",
    href: "/blog/zwift-vs-trainerroad",
    desc: "Which platform actually makes you faster?",
  },
  {
    title: "Polarised vs Sweet Spot",
    href: "/blog/polarised-vs-sweet-spot-training",
    desc: "The training intensity debate, settled.",
  },
  {
    title: "Fasted vs Fuelled Training",
    href: "/blog/fasted-vs-fueled-cycling",
    desc: "When training low helps, when it wrecks your week.",
  },
  {
    title: "Power Meter vs Smart Trainer",
    href: "/blog/power-meter-vs-smart-trainer",
    desc: "Where your first $500 should go.",
  },
];

const TOOLS = [
  { title: "Plateau Diagnostic", href: "/plateau", desc: "For 35+ riders stuck on the same FTP. Four minutes, one answer." },
  { title: "FTP Zone Calculator", href: "/tools/ftp-zones", desc: "Your 7 power zones in seconds." },
  { title: "Tyre Pressure Calculator", href: "/tools/tyre-pressure", desc: "Optimal PSI for your setup." },
  { title: "Race Weight Calculator", href: "/tools/race-weight", desc: "Your target performance weight." },
  { title: "In-Ride Fuelling", href: "/tools/fuelling", desc: "Carbs and fluid per hour." },
  { title: "Energy Availability", href: "/tools/energy-availability", desc: "Are you eating enough?" },
  { title: "MTB Setup Calculator", href: "/tools/shock-pressure", desc: "Fork, shock, and tyre pressure." },
];

const MUST_LISTEN = [
  {
    title: "Prof. Seiler on Polarised Training",
    href: "/podcast/ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler",
    desc: "The man who coined 80/20 training explains what it actually means.",
  },
  {
    title: "Dan Lorang: How Roglič's Coach Trains Amateurs",
    href: "/podcast/ep-2134-roglics-coach-builds-a-training-plan-for-amateur-riders-dan",
    desc: "The head of performance at Red Bull–Bora–Hansgrohe builds a plan for time-crunched age-groupers.",
  },
  {
    title: "Joe Friel on Structuring Training",
    href: "/podcast/ep-40-how-joe-friel-structures-the-ideal-cycling-training-week",
    desc: "The Training Bible author on weekly structure.",
  },
  {
    title: "Greg LeMond: My Untold Story of EPO",
    href: "/podcast/ep-2210-my-untold-story-of-epo-greg-lemond",
    desc: "3× Tour de France winner opens up. Our most-watched episode on YouTube.",
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
            "Curated starting point for new visitors. Best episodes, articles, tools, and resources from 1,400+ episodes and 170 articles.",
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
                1,400+ episodes. 170 articles. 6 free tools. This page cuts through it all — the
                essential starting points to get faster on the bike.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Foundation articles */}
        <Section background="charcoal">
          <Container>
            <ScrollReveal direction="up" className="text-center mb-10">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                READ FIRST
              </p>
              <h2 className="font-heading text-off-white" style={{ fontSize: "var(--text-section)" }}>
                THE FOUNDATION
              </h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {FOUNDATION_ARTICLES.map((a, i) => (
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

        {/* Must-listen episodes */}
        <Section background="deep-purple" grain>
          <Container>
            <ScrollReveal direction="up" className="text-center mb-10">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                LISTEN FIRST
              </p>
              <h2 className="font-heading text-off-white" style={{ fontSize: "var(--text-section)" }}>
                4 ESSENTIAL EPISODES
              </h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {MUST_LISTEN.map((ep, i) => (
                <ScrollReveal key={ep.href} direction="up" delay={i * 0.05}>
                  <Link href={ep.href} className="block h-full">
                    <Card hoverable className="h-full p-6">
                      <h3 className="font-heading text-off-white text-lg mb-2">{ep.title}</h3>
                      <p className="text-foreground-muted text-sm leading-relaxed">{ep.desc}</p>
                    </Card>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Free tools */}
        <Section background="charcoal">
          <Container>
            <ScrollReveal direction="up" className="text-center mb-10">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                FREE TOOLS
              </p>
              <h2 className="font-heading text-off-white" style={{ fontSize: "var(--text-section)" }}>
                6 CALCULATORS
              </h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {TOOLS.map((t, i) => (
                <ScrollReveal key={t.href} direction="up" delay={i * 0.04}>
                  <Link href={t.href} className="block h-full">
                    <Card hoverable className="h-full p-5">
                      <h3 className="font-heading text-off-white text-base mb-1">{t.title}</h3>
                      <p className="text-foreground-muted text-xs leading-relaxed">{t.desc}</p>
                    </Card>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Comparison picks */}
        <Section background="deep-purple" grain>
          <Container>
            <ScrollReveal direction="up" className="text-center mb-10">
              <p className="text-coral font-heading text-xs tracking-widest mb-3">
                MAKING A DECISION?
              </p>
              <h2 className="font-heading text-off-white" style={{ fontSize: "var(--text-section)" }}>
                X VS Y COMPARISONS
              </h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {COMPARISON_PICKS.map((a, i) => (
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

        {/* Next steps */}
        <Section background="charcoal" className="section-glow-coral !py-14">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <div className="rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-8 md:p-12 text-center">
                <p className="font-heading text-coral text-sm tracking-widest mb-3">
                  READY FOR MORE?
                </p>
                <h2
                  className="font-heading text-off-white mb-4"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  WHERE TO GO NEXT
                </h2>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button href="/podcast" size="lg">
                    Browse All Episodes
                  </Button>
                  <Button href="/apply" variant="ghost" size="lg">
                    Apply for Coaching
                  </Button>
                </div>
                <div className="flex flex-wrap gap-4 justify-center mt-6 text-sm">
                  <Link href="/blog" className="text-coral hover:text-coral/80 transition-colors">All Articles →</Link>
                  <Link href="/topics" className="text-coral hover:text-coral/80 transition-colors">Topic Hubs →</Link>
                  <Link href="/plan" className="text-coral hover:text-coral/80 transition-colors">Training Plans →</Link>
                  <Link href="/guests" className="text-coral hover:text-coral/80 transition-colors">Guest Archive →</Link>
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
