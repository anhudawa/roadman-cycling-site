import type { Metadata } from "next";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "The Clubhouse — Free Cycling Community",
  description:
    "Join 2,100+ serious cyclists in the free Roadman Cycling Clubhouse. Weekly live Q&A with Anthony Walsh, free training plans, and a community that gets it.",
  alternates: {
    canonical: "https://roadmancycling.com/community/clubhouse",
  },
  openGraph: {
    title: "The Clubhouse — Free Cycling Community",
    description:
      "Join 2,100+ serious cyclists in the free Roadman Cycling Clubhouse. Weekly live Q&A with Anthony Walsh, free training plans, and a community that gets it.",
    type: "website",
    url: "https://roadmancycling.com/community/clubhouse",
  },
};

export default function ClubhousePage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "The Clubhouse — Free Cycling Community",
          description:
            "Free cycling community with weekly live Q&A, 16-week training plans, and peer support for serious cyclists.",
          url: "https://roadmancycling.com/community/clubhouse",
          provider: {
            "@type": "Organization",
            name: "Roadman Cycling",
            url: "https://roadmancycling.com",
          },
          isAccessibleForFree: true,
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
          },
        }}
      />
      <Header />
      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-16">
          <Container className="text-center">
            <p className="text-coral font-heading text-lg mb-4 tracking-widest">
              FREE — NO CATCH
            </p>
            <h1
              className="font-heading text-off-white mb-6"
              style={{ fontSize: "var(--text-hero)" }}
            >
              THE CLUBHOUSE
            </h1>
            <p className="text-foreground-muted text-xl max-w-2xl mx-auto mb-8">
              Free training plans. Free calculators. A weekly live Q&amp;A with
              Anthony. And 2,100 cyclists who actually care about getting faster.
              This is your starting point. No credit card. No upsell pressure.
              Just tools and a community that gets it.
            </p>
            <Button
              href="https://skool.com/roadman"
              external
              size="lg"
            >
              Join the Clubhouse — Free
            </Button>
          </Container>
        </Section>

        {/* What's Inside */}
        <Section background="charcoal">
          <Container width="narrow">
            <h2
              className="font-heading text-off-white text-center mb-12"
              style={{ fontSize: "var(--text-section)" }}
            >
              WHAT&apos;S INSIDE
            </h2>

            <div className="space-y-8">
              {[
                {
                  title: "Weekly Live Q&A with Anthony",
                  description:
                    "Every week, Anthony goes live to answer your training, nutrition, and cycling questions. No gatekeeping. No upsell. Just direct access to someone who's recorded 1,400+ episodes with the world's best coaches, scientists, and riders.",
                },
                {
                  title: "Free 16-Week Training Plans",
                  description:
                    "Structured plans for Road Racing, Gravel, and Sportive preparation. Built on the same principles discussed on the podcast. Delivered through Vekta integration.",
                },
                {
                  title: "Community of Serious Cyclists",
                  description:
                    "This isn't a beginner group. The Clubhouse is full of professionals with families who train 6-12 hours a week and take their cycling seriously. People exactly like you.",
                },
                {
                  title: "Podcast Deep-Dives",
                  description:
                    "Extended discussions on episodes, bonus content, and the conversations that didn't make the final cut. The Clubhouse gets more than the public feed.",
                },
                {
                  title: "Monthly Challenges",
                  description:
                    "Structured challenges that give you something to work toward each month. Accountability without pressure. Progress you can feel.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-background-elevated rounded-lg border border-white/5 p-6"
                >
                  <h3 className="font-heading text-xl text-off-white mb-2">
                    {item.title.toUpperCase()}
                  </h3>
                  <p className="text-foreground-muted text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Final CTA */}
            <div className="mt-16 text-center">
              <h2 className="font-heading text-3xl text-off-white mb-4">
                ZERO COST. ZERO CATCH.
              </h2>
              <p className="text-foreground-muted mb-8 max-w-md mx-auto">
                Join 2,100+ cyclists who are already inside. The only thing
                you&apos;re losing is time by not being part of this.
              </p>
              <Button
                href="https://skool.com/roadman"
                external
                size="lg"
              >
                Join the Clubhouse — Free
              </Button>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
