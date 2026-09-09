import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { ScrollReveal } from "@/components/ui";
import { EmailCapture } from "@/components/features/conversion/EmailCapture";
import { JsonLd } from "@/components/seo/JsonLd";
import { ENTITY_IDS } from "@/lib/brand-facts";
import { fetchNewsletterIssues } from "@/lib/integrations/beehiiv";

export const metadata: Metadata = {
  title: "The Saturday Spin — Weekly Cycling Newsletter",
  description:
    "One useful cycling training letter every Saturday, read by 23,000 weekly readers. A clear takeaway, why it matters, and what to do with it on the bike. Free.",
  alternates: {
    canonical: "https://roadmancycling.com/newsletter",
  },
  openGraph: {
    title: "The Saturday Spin — Weekly Cycling Newsletter",
    description:
      "One useful cycling training letter every Saturday. A clear takeaway, why it matters, and what to do with it on the bike.",
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
          name: "The Saturday Spin Newsletter — Roadman Cycling",
          description:
            "One useful cycling training letter from Anthony Walsh every Saturday: a clear takeaway, why it matters, and what to do with it on the bike.",
          url: "https://roadmancycling.com/newsletter",
          isPartOf: { "@id": ENTITY_IDS.website },
          publisher: { "@id": ENTITY_IDS.organization },
        }}
      />
      <Header />
      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-16">
          <Container width="narrow" className="text-center">
            <ScrollReveal direction="up">
              <p className="text-coral font-heading text-sm tracking-widest mb-4">
                ONE USEFUL TRAINING LETTER · EVERY SATURDAY
              </p>
              <h1
                className="font-heading text-off-white mb-6"
                style={{ fontSize: "var(--text-hero)" }}
              >
                THE SATURDAY SPIN
              </h1>
              <p className="text-foreground-muted text-xl leading-relaxed mb-8">
                One training idea worth knowing. Why it matters. And one
                specific thing you can do with it on the bike this week. Free,
                every Saturday.
              </p>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.2}>
              <EmailCapture
                variant="inline"
                heading=""
                subheading=""
                buttonText="SUBSCRIBE"
                source="newsletter-page"
                captureQueryAttribution
                className="max-w-md mx-auto"
              />
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.3}>
              <p className="text-foreground-subtle text-sm mt-6">
                Join 23,000 weekly readers. One email a week. Unsubscribe anytime.
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
                WHAT LANDS IN YOUR INBOX
              </h2>
              <p className="text-foreground-muted text-center mb-12 max-w-lg mx-auto">
                Not a digest. Not a list of links. One focused training letter
                designed to leave you with something useful before your next ride.
              </p>
            </ScrollReveal>

            <div className="space-y-6">
              {[
                {
                  title: "One clear training takeaway",
                  description:
                    "A single idea from coaching, physiology, fuelling, recovery, or performance — explained without the jargon.",
                },
                {
                  title: "Why it matters",
                  description:
                    "The context that tells you when the idea is useful, what problem it solves, and where riders commonly get it wrong.",
                },
                {
                  title: "What to do this week",
                  description:
                    "A practical action you can take into your own training instead of another piece of cycling content to save and forget.",
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
          heading="GET THE SATURDAY SPIN"
          subheading="23,000 weekly readers get one useful training letter every Saturday. Join them."
          source="newsletter-page-bottom"
          captureQueryAttribution
        />
      </main>
      <Footer />
    </>
  );
}