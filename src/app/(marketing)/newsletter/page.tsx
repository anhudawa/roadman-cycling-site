import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { ScrollReveal } from "@/components/ui";
import { EmailCapture } from "@/components/features/conversion/EmailCapture";
import { JsonLd } from "@/components/seo/JsonLd";
import { fetchNewsletterIssues } from "@/lib/integrations/beehiiv";

export const metadata: Metadata = {
  title: "Newsletter $€” Weekly Cycling Insights",
  description:
    "Get the stuff that actually makes you faster. Once a week. No fluff. Training, nutrition, and performance insights from Anthony Walsh and the Roadman Cycling Podcast.",
  alternates: {
    canonical: "https://roadmancycling.com/newsletter",
  },
  openGraph: {
    title: "Newsletter $€” Weekly Cycling Insights",
    description:
      "Get the stuff that actually makes you faster. Once a week. No fluff. Training, nutrition, and performance insights from Anthony Walsh and the Roadman Cycling Podcast.",
    type: "website",
    url: "https://roadmancycling.com/newsletter",
  },
};

export const revalidate = 3600; // Revalidate every hour

export default async function NewsletterPage() {
  const issues = await fetchNewsletterIssues(20);
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "The Saturday Spin Newsletter $€” Roadman Cycling",
          description:
            "Weekly cycling insights from Anthony Walsh. Training, nutrition, and performance content drawn from conversations with the world's best coaches and scientists.",
          url: "https://roadmancycling.com/newsletter",
          isPartOf: {
            "@type": "WebSite",
            name: "Roadman Cycling",
            url: "https://roadmancycling.com",
          },
          publisher: {
            "@type": "Organization",
            name: "Roadman Cycling",
            url: "https://roadmancycling.com",
          },
        }}
      />
      <Header />
      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-16">
          <Container width="narrow" className="text-center">
            <ScrollReveal direction="up">
              <p className="text-coral font-heading text-sm tracking-widest mb-4">
                EVERY SATURDAY $· FROM THE ROADMAN PODCAST
              </p>
              <h1
                className="font-heading text-off-white mb-6"
                style={{ fontSize: "var(--text-hero)" }}
              >
                THE SATURDAY SPIN
              </h1>
              <p className="text-foreground-muted text-xl leading-relaxed mb-8">
                The week&apos;s sharpest training takeaway, one specific
                action you can use this week, and what the pros did
                differently &mdash; distilled from the conversations most of
                the sport will never hear. Free. Once a week.
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
                Join 65,000+ cyclists. One email a week. Unsubscribe anytime.
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
                    "Zone 2 structure, interval sessions, periodisation $€” the principles from Seiler, Lorang, and Wakefield translated into actionable training advice.",
                },
                {
                  title: "Nutrition that actually works for cyclists",
                  description:
                    "Fuelling, body composition, race weight $€” the stuff that makes a real difference to your power-to-weight ratio. No diet culture.",
                },
                {
                  title: "The stories behind the podcast",
                  description:
                    "Extended insights from podcast conversations. The things that didn't make the final cut. Context that makes the episodes even more valuable.",
                },
                {
                  title: "Community highlights and member results",
                  description:
                    "Real results from Clubhouse and Not Done Yet coaching community members. What's working, what's not, and what you can learn from their experience.",
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

        {issues.length > 0 && (
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
                {issues.map((issue, i) => {
                  const date = issue.publishDate
                    ? new Date(issue.publishDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })
                    : null;
                  return (
                    <ScrollReveal key={issue.id} direction="left" delay={i * 0.08}>
                      <Link
                        href={`/newsletter/${issue.slug}`}
                        className="flex items-center gap-4 bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors group"
                      >
                        {date && (
                          <span className="text-xs text-coral font-heading tracking-widest shrink-0 w-20">
                            {date.toUpperCase()}
                          </span>
                        )}
                        <p className="text-foreground-muted text-sm group-hover:text-off-white transition-colors">
                          {issue.title}
                        </p>
                      </Link>
                    </ScrollReveal>
                  );
                })}
              </div>
            </Container>
          </Section>
        )}

        <EmailCapture
          variant="banner"
          heading="STOP GUESSING. START KNOWING."
          subheading="65,000+ cyclists get the week's sharpest training insights every Saturday. Join them."
          source="newsletter-page-bottom"
        />
      </main>
      <Footer />
    </>
  );
}
