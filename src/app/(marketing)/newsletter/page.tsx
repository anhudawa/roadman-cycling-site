import type { Metadata } from "next";
import { Header, Footer, Section, Container } from "@/components/layout";
import { ScrollReveal } from "@/components/ui";
import { EmailCapture } from "@/components/features/conversion/EmailCapture";

export const metadata: Metadata = {
  title: "Newsletter — Weekly Cycling Insights from the World's Best",
  description:
    "Get the stuff that actually makes you faster. Once a week. No fluff. Training, nutrition, and performance insights from Anthony Walsh and the Roadman Cycling Podcast.",
};

const pastIssues = [
  {
    title: "Why 80% of your training should feel embarrassingly easy",
    topic: "Training",
  },
  {
    title: "The fuelling mistake that's costing you 20 watts on climbs",
    topic: "Nutrition",
  },
  {
    title: "What Dan Lorang told me about Pogacar's winter training",
    topic: "Coaching",
  },
  {
    title: "3 core exercises that fixed my lower back pain on the bike",
    topic: "S&C",
  },
  {
    title: "Why your recovery rides are making you slower (and what to do instead)",
    topic: "Recovery",
  },
];

export default function NewsletterPage() {
  return (
    <>
      <Header />
      <main>
        <Section background="deep-purple" grain className="pt-32 pb-16">
          <Container width="narrow" className="text-center">
            <ScrollReveal direction="up">
              <h1
                className="font-heading text-off-white mb-6"
                style={{ fontSize: "var(--text-hero)" }}
              >
                THE INSIGHTS
              </h1>
              <p className="text-foreground-muted text-xl leading-relaxed mb-8">
                Once a week. The stuff that actually makes you faster. Straight
                from the conversations with the world&apos;s best coaches,
                scientists, and riders.
              </p>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.2}>
              <EmailCapture
                variant="inline"
                heading=""
                subheading=""
                buttonText="SUBSCRIBE"
                source="newsletter-page"
                className="max-w-md mx-auto"
              />
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.3}>
              <p className="text-foreground-subtle text-sm mt-6">
                Join 29,782 cyclists. Unsubscribe anytime.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2
                className="font-heading text-off-white text-center mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                WHAT YOU&apos;LL GET
              </h2>
              <p className="text-foreground-muted text-center mb-12 max-w-lg mx-auto">
                No fluff. No filler. No generic fitness advice. Everything is
                cycling-specific, grounded in science, and drawn from real
                conversations with the experts.
              </p>
            </ScrollReveal>

            <div className="space-y-6">
              {[
                {
                  title: "Training insights you can apply this week",
                  description:
                    "Zone 2 structure, interval sessions, periodisation — the principles from Seiler, Lorang, and Wakefield translated into actionable training advice.",
                },
                {
                  title: "Nutrition that actually works for cyclists",
                  description:
                    "Fuelling, body composition, race weight — the stuff that makes a real difference to your power-to-weight ratio. No diet culture.",
                },
                {
                  title: "The stories behind the podcast",
                  description:
                    "Extended insights from podcast conversations. The things that didn't make the final cut. Context that makes the episodes even more valuable.",
                },
                {
                  title: "Community highlights and member results",
                  description:
                    "Real results from Clubhouse and Not Done Yet members. What's working, what's not, and what you can learn from their experience.",
                },
              ].map((item, i) => (
                <ScrollReveal key={item.title} direction="up" delay={i * 0.1}>
                  <div className="bg-background-elevated rounded-lg border border-white/5 p-6">
                    <h3 className="font-heading text-xl text-off-white mb-2">
                      {item.title.toUpperCase()}
                    </h3>
                    <p className="text-foreground-muted text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2
                className="font-heading text-off-white text-center mb-12"
                style={{ fontSize: "var(--text-section)" }}
              >
                RECENT ISSUES
              </h2>
            </ScrollReveal>

            <div className="space-y-4">
              {pastIssues.map((issue, i) => (
                <ScrollReveal key={issue.title} direction="left" delay={i * 0.08}>
                  <div className="flex items-center gap-4 bg-white/5 rounded-lg p-4">
                    <span className="text-xs text-coral font-heading tracking-widest shrink-0 w-20">
                      {issue.topic.toUpperCase()}
                    </span>
                    <p className="text-foreground-muted text-sm">
                      {issue.title}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        <EmailCapture
          variant="banner"
          heading="STOP GUESSING. START KNOWING."
          subheading="29,782 cyclists already get the weekly insights. Join them."
          source="newsletter-page-bottom"
        />
      </main>
      <Footer />
    </>
  );
}
