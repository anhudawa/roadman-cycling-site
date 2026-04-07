import type { Metadata } from "next";
import Image from "next/image";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Community — Serious Cyclists Who Refuse to Settle",
  description:
    "Two communities. One mission. Join the free Clubhouse or go premium with Not Done Yet — personalised coaching, training plans, and accountability.",
  alternates: {
    canonical: "https://roadmancycling.com/community",
  },
  openGraph: {
    title: "Community — Serious Cyclists Who Refuse to Settle",
    description:
      "Two communities. One mission. Join the free Clubhouse or go premium with Not Done Yet — personalised coaching, training plans, and accountability.",
    type: "website",
    url: "https://roadmancycling.com/community",
  },
};

export default function CommunityPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Roadman Cycling Community",
          description:
            "Two communities for serious cyclists. The free Clubhouse and premium Not Done Yet coaching programme.",
          url: "https://roadmancycling.com/community",
          parentOrganization: {
            "@type": "Organization",
            name: "Roadman Cycling",
            url: "https://roadmancycling.com",
          },
        }}
      />
      <Header />
      <main id="main-content">
        <Section background="deep-purple" grain fullHeight>
          <Container>
            <div className="text-center mb-16 pt-20">
              <h1
                className="font-heading text-off-white mb-6"
                style={{ fontSize: "var(--text-hero)" }}
              >
                YOU&apos;RE
                <br />
                <span className="text-coral">NOT DONE YET</span>
              </h1>
              <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
                Two communities for serious cyclists who believe they have more
                in them. Start free. Go premium when you&apos;re ready for the
                system.
              </p>
            </div>

            {/* Photo strip */}
            <div className="flex gap-3 mb-16 max-w-4xl mx-auto overflow-hidden rounded-xl">
              <div className="relative flex-1 aspect-[4/3] rounded-lg overflow-hidden">
                <Image
                  src="/images/community/DSC05602.JPG"
                  alt="Riders on a gravel road through canyon terrain"
                  fill
                  className="object-cover"
                  sizes="33vw"
                />
              </div>
              <div className="relative flex-1 aspect-[4/3] rounded-lg overflow-hidden">
                <Image
                  src="/images/community/DSC05644.JPG"
                  alt="Post-ride rest in the shade"
                  fill
                  className="object-cover"
                  sizes="33vw"
                />
              </div>
              <div className="relative flex-1 aspect-[4/3] rounded-lg overflow-hidden hidden sm:block">
                <Image
                  src="/images/community/DSC05670.JPG"
                  alt="Riders at the summit"
                  fill
                  className="object-cover"
                  sizes="33vw"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Clubhouse */}
              <Card className="p-8" hoverable={false}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-coral" />
                  <span className="text-xs text-foreground-muted uppercase tracking-widest font-body">
                    Free forever
                  </span>
                </div>
                <h2 className="font-heading text-4xl text-off-white mb-4">
                  THE CLUBHOUSE
                </h2>
                <p className="text-foreground-muted mb-6 leading-relaxed">
                  2,100+ cyclists. Weekly live Q&amp;A with Anthony. Free
                  training plans. The entry point for everyone who&apos;s ready
                  to take their cycling seriously.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Weekly live Q&A with Anthony Walsh",
                    "Free 16-week training plans (Road, Gravel, Sportive)",
                    "Community discussion & peer support",
                    "Podcast deep-dives & bonus content",
                    "Monthly challenges",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-foreground-muted"
                    >
                      <span className="text-coral mt-0.5 shrink-0">
                        &#10003;
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Button
                  href="https://www.skool.com/roadman"
                  external
                  size="lg"
                  className="w-full"
                >
                  Join the Clubhouse — Free
                </Button>
              </Card>

              {/* Not Done Yet */}
              <Card
                className="p-8 border-coral/30 bg-gradient-to-br from-background-elevated to-deep-purple/30"
                hoverable={false}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-purple" />
                  <span className="text-xs text-foreground-muted uppercase tracking-widest font-body">
                    From $15/month
                  </span>
                </div>
                <h2 className="font-heading text-4xl text-off-white mb-4">
                  NOT DONE YET
                </h2>
                <p className="text-foreground-muted mb-6 leading-relaxed">
                  The system. Anthony&apos;s coaching, personalised Vekta plans,
                  expert masterclasses, and a private community of 113 cyclists
                  who are actively getting faster.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Personalised Vekta training plans",
                    "Weekly coaching calls with Anthony",
                    "Expert masterclasses (Seiler, Lorang, Wakefield)",
                    "S&C roadmap for cyclists",
                    "Daily accountability group",
                    "Private community of serious cyclists",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-foreground-muted"
                    >
                      <span className="text-coral mt-0.5 shrink-0">
                        &#10003;
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Button
                  href="/community/not-done-yet"
                  variant="secondary"
                  size="lg"
                  className="w-full"
                >
                  See Plans & Pricing
                </Button>
              </Card>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
