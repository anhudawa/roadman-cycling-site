import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { EVENTS, PHASES } from "@/lib/training-plans";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Cycling Training Plans by Event and Weeks Out",
  description:
    "Event-specific cycling training plans for the Wicklow 200, Ride London, Fred Whitton, Étape du Tour, Maratona Dolomites and more. Structured by weeks out from your event — base, build, peak, taper.",
  alternates: {
    canonical: "https://roadmancycling.com/plan",
  },
  openGraph: {
    title: "Cycling Training Plans by Event and Weeks Out",
    description:
      "Structured training plans for the world's best cycling sportives. Find the plan built around your event date and your weeks remaining.",
    type: "website",
    url: "https://roadmancycling.com/plan",
  },
};

export default function PlanIndexPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Cycling Training Plans",
          description:
            "Structured training plans for specific cycling sportives and events, organised by weeks remaining.",
          url: "https://roadmancycling.com/plan",
          hasPart: EVENTS.map((e) => ({
            "@type": "WebPage",
            name: `${e.name} Training Plan`,
            url: `https://roadmancycling.com/plan/${e.slug}`,
          })),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: "https://roadmancycling.com",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Training Plans",
              item: "https://roadmancycling.com/plan",
            },
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
                TRAINING PLANS
              </p>
              <h1
                className="font-heading text-off-white mb-6 leading-none"
                style={{ fontSize: "var(--text-hero)" }}
              >
                FIND THE PLAN BUILT FOR <span className="text-coral">YOUR EVENT.</span>
              </h1>
              <p className="text-foreground-muted text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                Event-specific training plans structured by how many weeks you&apos;ve got left. Pick your event, pick your window, get the week-by-week framework.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Events grid */}
        <Section background="charcoal">
          <Container>
            <ScrollReveal direction="up" className="mb-10 text-center">
              <p className="font-heading text-coral text-xs tracking-widest mb-3">
                BY EVENT
              </p>
              <h2
                className="font-heading text-off-white"
                style={{ fontSize: "var(--text-section)" }}
              >
                {EVENTS.length} SPORTIVES + EVENTS
              </h2>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
              {EVENTS.map((e, i) => (
                <ScrollReveal key={e.slug} direction="up" delay={i * 0.05}>
                  <Card
                    className="p-6 h-full flex flex-col card-shimmer"
                    glass
                  >
                    <div className="flex items-start justify-between mb-3 gap-3">
                      <h3 className="font-heading text-xl text-off-white leading-tight">
                        {e.name.toUpperCase()}
                      </h3>
                      <span className="text-xs text-foreground-subtle font-body tracking-widest uppercase shrink-0 mt-1">
                        {e.region}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-foreground-subtle mb-4">
                      <span>{e.distanceKm} km</span>
                      <span className="opacity-50">·</span>
                      <span>{e.elevationGainM.toLocaleString()} m</span>
                      <span className="opacity-50">·</span>
                      <span>{e.defaultMonth}</span>
                    </div>
                    <p className="text-foreground-muted text-sm leading-relaxed mb-5 flex-1">
                      {e.description}
                    </p>
                    <div className="space-y-2">
                      {PHASES.map((p) => (
                        <Link
                          key={p.slug}
                          href={`/plan/${e.slug}/${p.slug}`}
                          className="flex items-center justify-between px-3 py-2 rounded-lg border border-white/10 hover:border-coral/30 hover:bg-white/[0.04] transition-all text-sm"
                        >
                          <span className="text-foreground-muted">
                            {p.weeksOut} weeks out · {p.label}
                          </span>
                          <span className="text-coral">&rarr;</span>
                        </Link>
                      ))}
                    </div>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Phase explainer */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up" className="mb-10 text-center">
              <p className="font-heading text-coral text-xs tracking-widest mb-3">
                BY PHASE
              </p>
              <h2
                className="font-heading text-off-white"
                style={{ fontSize: "var(--text-section)" }}
              >
                HOW THE PLAN CHANGES OVER TIME
              </h2>
              <p className="text-foreground-muted text-base md:text-lg leading-relaxed max-w-2xl mx-auto mt-5">
                Every plan moves through the same phases — base, build, peak, taper. The ratio shifts as you get closer to the event. Below is what each phase looks like in isolation.
              </p>
            </ScrollReveal>
            <div className="space-y-4">
              {PHASES.map((p, i) => (
                <ScrollReveal key={p.slug} direction="up" delay={i * 0.05}>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
                      <div className="md:w-40 shrink-0">
                        <p className="font-heading text-coral text-2xl leading-none">
                          {p.weeksOut}
                        </p>
                        <p className="text-xs text-foreground-subtle font-body tracking-widest uppercase mt-1">
                          weeks out
                        </p>
                      </div>
                      <div className="flex-1">
                        <p className="font-heading text-off-white text-lg mb-1">
                          {p.label}
                        </p>
                        <p className="text-foreground-muted text-sm leading-relaxed">
                          {p.tagline}
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Related training articles */}
        {(() => {
          const PLAN_BLOG_SLUGS = [
            "how-to-structure-cycling-training-plan",
            "polarised-vs-sweet-spot-training",
            "time-crunched-cyclist-8-hours-week",
            "gran-fondo-training-plan-12-weeks",
            "how-to-periodise-cycling-season",
            "steady-state-vs-interval-training-cycling",
            "zone-2-vs-endurance-training",
            "zwift-vs-trainerroad",
          ];
          const posts = getAllPosts().filter((p) => PLAN_BLOG_SLUGS.includes(p.slug));
          if (posts.length === 0) return null;
          return (
            <Section background="charcoal">
              <Container>
                <ScrollReveal direction="up" className="mb-10 text-center">
                  <p className="font-heading text-coral text-xs tracking-widest mb-3">
                    FROM THE BLOG
                  </p>
                  <h2
                    className="font-heading text-off-white"
                    style={{ fontSize: "var(--text-section)" }}
                  >
                    TRAINING GUIDES
                  </h2>
                </ScrollReveal>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
                  {posts.slice(0, 8).map((post, i) => (
                    <ScrollReveal key={post.slug} direction="up" delay={i * 0.04}>
                      <Link href={`/blog/${post.slug}`} className="block h-full">
                        <Card hoverable className="h-full p-5">
                          <p className="font-heading text-off-white text-sm leading-tight mb-2">
                            {post.title}
                          </p>
                          <p className="text-foreground-muted text-xs leading-relaxed line-clamp-3">
                            {post.excerpt}
                          </p>
                        </Card>
                      </Link>
                    </ScrollReveal>
                  ))}
                </div>
              </Container>
            </Section>
          );
        })()}

        {/* Coaching CTA */}
        <Section background="charcoal" className="section-glow-coral !py-14">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <div className="rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-8 md:p-12 text-center">
                <h2
                  className="font-heading text-off-white mb-3"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  WANT THIS BUILT AROUND YOUR FTP?
                </h2>
                <p className="text-foreground-muted text-base md:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
                  The Not Done Yet coaching community runs the coached five-pillar system. Your plan gets built backwards from your event date using your actual numbers. 7-day free trial.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button href="/apply" size="lg">
                    Apply for Coaching
                  </Button>
                  <Button href="/coaching" variant="ghost" size="lg">
                    How Coaching Works
                  </Button>
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
