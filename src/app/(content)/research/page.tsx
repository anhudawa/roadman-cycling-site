import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Card, ScrollReveal, GradientText } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Research & Evidence Base $€” Roadman Cycling",
  description:
    "The research, expert interviews, and evidence that underpins every Roadman article and coaching decision. Named sources, specific studies, zero guesswork.",
  alternates: {
    canonical: "https://roadmancycling.com/research",
  },
  openGraph: {
    title: "Research & Evidence Base $€” Roadman Cycling",
    description:
      "The research, expert interviews, and evidence behind Roadman's coaching methodology.",
    type: "website",
    url: "https://roadmancycling.com/research",
  },
};

const RESEARCH_AREAS = [
  {
    title: "Polarised Training & Intensity Distribution",
    expert: "Prof. Stephen Seiler, University of Agder",
    articles: [
      { title: "Zone 2 Training: The Complete Guide", href: "/blog/zone-2-training-complete-guide" },
      { title: "Polarised vs Sweet Spot Training", href: "/blog/polarised-vs-sweet-spot-training" },
      { title: "Zone 2 vs Endurance Training", href: "/blog/zone-2-vs-endurance-training" },
      { title: "Every Seiler Episode", href: "/blog/every-roadman-episode-with-stephen-seiler" },
      { title: "Prof. Seiler on Low Heart Rate Cycling", href: "/blog/prof-seiler-low-heart-rate-cycling" },
    ],
    description: "Seiler's 20-year body of work on the 80/20 intensity distribution that elite endurance athletes converge on independently.",
  },
  {
    title: "World Tour Training Methodology",
    expert: "Dan Lorang, Red Bull-Bora-Hansgrohe",
    articles: [
      { title: "Dan Lorang's Amateur Training Plan", href: "/blog/dan-lorang-amateur-training-plan" },
      { title: "Every Lorang Episode", href: "/blog/every-roadman-episode-with-dan-lorang" },
      { title: "How a Pro Cyclist Trains for 60 Days", href: "/blog/how-pro-cyclist-trains-60-days" },
    ],
    description: "Lorang's periodisation framework adapted from Grand Tour preparation to amateur cycling $€” the same methodology, different volume.",
  },
  {
    title: "Cycling Nutrition & Body Composition",
    expert: "Dr Sam Impey, Prof. Asker Jeukendrup, Alex Larson RD",
    articles: [
      { title: "Fuel for the Work Required", href: "/blog/cycling-weight-loss-fuel-for-the-work-required" },
      { title: "Fasted vs Fuelled Training", href: "/blog/fasted-vs-fueled-cycling" },
      { title: "Body Composition for Cyclists", href: "/blog/alex-larson-body-composition-cyclists" },
      { title: "In-Ride Nutrition Guide", href: "/blog/cycling-in-ride-nutrition-guide" },
    ],
    description: "Periodised nutrition matching carbohydrate intake to training demands. Evidence from World Tour nutritionists and sports dietitians.",
  },
  {
    title: "Aerodynamics & Equipment Science",
    expert: "Dan Bigham, Red Bull-Bora-Hansgrohe",
    articles: [
      { title: "Dan Bigham on Amateur Aerodynamics", href: "/blog/dan-bigham-aerodynamics-amateur-cyclists" },
      { title: "Aero vs Weight", href: "/blog/aero-vs-weight-cyclist" },
      { title: "Tubeless vs Clincher Tyres", href: "/blog/tubeless-vs-clincher-tyres" },
    ],
    description: "Bigham's hierarchy of aerodynamic gains $€” position, clothing, helmet, wheels, frame $€” validated by wind tunnel data and Hour Record preparation.",
  },
  {
    title: "Strength & Conditioning for Cyclists",
    expert: "Derek Teel, S&C Coach",
    articles: [
      { title: "Best Exercises for Cyclists", href: "/blog/derek-teel-best-exercises-cyclists" },
      { title: "Strength Training Guide", href: "/blog/cycling-strength-training-guide" },
      { title: "Heavy S&C Beats More Miles After 40", href: "/blog/new-study-confirms-heavy-strength-training-beats-more-miles-after-40" },
    ],
    description: "Transfer-focused strength programming for endurance cyclists. Evidence from RÃ¸nnestad, Sunde, and applied S&C practice.",
  },
  {
    title: "Respiratory & Breathing Performance",
    expert: "Dr Sellers",
    articles: [
      { title: "Breathing Techniques: 2$€“5% Time-Trial Gains", href: "/blog/breathing-techniques-cycling-performance" },
    ],
    description: "Inspiratory muscle training producing 2$€“5% time-trial improvements in trained cyclists in the published literature. Device protocols and evidence review.",
  },
];

export default function ResearchPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Research & Evidence Base $€” Roadman Cycling",
          description:
            "The research, expert interviews, and evidence that underpins Roadman's coaching methodology and content.",
          url: "https://roadmancycling.com/research",
          isPartOf: {
            "@type": "WebSite",
            name: "Roadman Cycling",
            url: "https://roadmancycling.com",
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://roadmancycling.com" },
            { "@type": "ListItem", position: 2, name: "Research", item: "https://roadmancycling.com/research" },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-14">
          <Container width="narrow" className="text-center">
            <ScrollReveal direction="up" eager>
              <p className="text-coral font-heading text-sm tracking-widest mb-4">
                EVIDENCE BASE
              </p>
              <GradientText as="h1" className="font-heading mb-6">
                <span style={{ fontSize: "var(--text-hero)" }}>OUR SOURCES.</span>
              </GradientText>
              <p className="text-foreground-muted text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                Every claim on this site traces back to a named expert, a published
                study, or an on-the-record podcast conversation. This page maps the
                research areas, the people behind them, and the articles that apply
                their work.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        <Section background="charcoal">
          <Container>
            <div className="space-y-8 max-w-4xl mx-auto">
              {RESEARCH_AREAS.map((area, i) => (
                <ScrollReveal key={area.title} direction="up" delay={i * 0.04}>
                  <Card className="p-6 md:p-8" hoverable={false}>
                    <p className="text-coral font-heading text-xs tracking-widest mb-2">
                      {area.expert.toUpperCase()}
                    </p>
                    <h2 className="font-heading text-off-white text-xl md:text-2xl mb-3">
                      {area.title}
                    </h2>
                    <p className="text-foreground-muted text-sm leading-relaxed mb-5">
                      {area.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {area.articles.map((a) => (
                        <Link
                          key={a.href}
                          href={a.href}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/15 hover:border-coral/40 bg-white/[0.04] hover:bg-white/[0.07] px-3 py-1.5 text-xs font-heading text-off-white tracking-wider transition-all"
                        >
                          {a.title} <span className="text-coral">$†’</span>
                        </Link>
                      ))}
                    </div>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        <Section background="deep-purple" grain className="!py-14">
          <Container width="narrow" className="text-center">
            <ScrollReveal direction="up">
              <p className="text-foreground-muted text-base leading-relaxed max-w-xl mx-auto mb-6">
                All content is authored by Anthony Walsh and reviewed against the
                primary sources listed above. How we source, review, update, and
                correct content is documented in our{" "}
                <Link href="/editorial-standards" className="text-coral hover:text-coral/80 transition-colors">
                  editorial standards
                </Link>
                . For corrections or clarifications, contact{" "}
                <a href="mailto:anthony@roadmancycling.com" className="text-coral hover:text-coral/80 transition-colors">
                  anthony@roadmancycling.com
                </a>.
              </p>
              <div className="flex flex-wrap gap-4 justify-center text-sm">
                <Link href="/editorial-standards" className="text-coral hover:text-coral/80 transition-colors">Editorial Standards $†’</Link>
                <Link href="/about" className="text-coral hover:text-coral/80 transition-colors">About $†’</Link>
                <Link href="/podcast" className="text-coral hover:text-coral/80 transition-colors">Podcast $†’</Link>
                <Link href="/blog" className="text-coral hover:text-coral/80 transition-colors">All Articles $†’</Link>
              </div>
            </ScrollReveal>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
