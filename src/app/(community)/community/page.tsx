import type { Metadata } from "next";
import Image from "next/image";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Community — Serious Cyclists Who Refuse to Settle",
  description:
    "Two communities. One mission. Join the free Clubhouse or go premium with the Not Done Yet coaching community — personalised coaching, training plans, and accountability.",
  alternates: {
    canonical: "https://roadmancycling.com/community",
  },
  openGraph: {
    title: "Community — Serious Cyclists Who Refuse to Settle",
    description:
      "Two communities. One mission. Join the free Clubhouse or go premium with the Not Done Yet coaching community — personalised coaching, training plans, and accountability.",
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
            "Two communities for serious cyclists. The free Clubhouse and the premium Not Done Yet coaching community.",
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

            {/* Tier ladder — three-step progression from free to premium */}
            <div className="max-w-6xl mx-auto mb-10">
              <div className="hidden md:flex items-center justify-between text-xs text-foreground-subtle font-body tracking-widest uppercase mb-4 px-4">
                <span>Start here</span>
                <span>→</span>
                <span>Ready to plug in</span>
                <span>→</span>
                <span>Hands-on coaching</span>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* TIER 1 — Clubhouse */}
                <Card className="p-7 h-full flex flex-col" hoverable={false}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-coral/70" />
                    <span className="text-[10px] text-foreground-subtle uppercase tracking-widest font-body">
                      Tier 1 · Free
                    </span>
                  </div>
                  <h2 className="font-heading text-2xl md:text-3xl text-off-white mb-3 leading-tight">
                    THE CLUBHOUSE
                  </h2>
                  <p className="text-xs text-foreground-subtle uppercase tracking-widest font-body mb-4">
                    1,852 members
                  </p>
                  <p className="text-foreground-muted text-sm mb-5 leading-relaxed">
                    Your entry point. Free plans, weekly live Q&amp;A, a
                    community of serious cyclists. For when you&apos;re
                    starting to take it seriously.
                  </p>
                  <ul className="space-y-2 mb-6 flex-1">
                    {[
                      "Free 16-week training plans",
                      "Weekly live Q&A with Anthony",
                      "Community discussion",
                      "Monthly challenges",
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
                  <Button
                    href="/community/clubhouse"
                    size="lg"
                    className="w-full"
                    variant="ghost"
                  >
                    Join Free
                  </Button>
                </Card>

                {/* TIER 2 — Not Done Yet (the recommended path) */}
                <Card
                  className="p-7 h-full flex flex-col border-coral/40 bg-gradient-to-br from-background-elevated to-deep-purple/40 relative md:-mt-3"
                  hoverable={false}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-coral text-off-white text-[10px] font-heading tracking-widest px-3 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-coral" />
                    <span className="text-[10px] text-foreground-subtle uppercase tracking-widest font-body">
                      Tier 2 · $195/month
                    </span>
                  </div>
                  <h2 className="font-heading text-2xl md:text-3xl text-off-white mb-1 leading-tight">
                    NOT DONE YET
                  </h2>
                  <p className="text-coral font-heading text-[11px] tracking-widest uppercase mb-3">
                    The coaching community
                  </p>
                  <p className="text-xs text-foreground-subtle uppercase tracking-widest font-body mb-4">
                    113 members · 7-day free trial
                  </p>
                  <p className="text-foreground-muted text-sm mb-5 leading-relaxed">
                    The coached system. Personalised plans, weekly calls,
                    expert masterclasses. For when guessing isn&apos;t working
                    anymore.
                  </p>
                  <ul className="space-y-2 mb-6 flex-1">
                    {[
                      "Personalised TrainingPeaks plans",
                      "Weekly coaching calls with Anthony",
                      "Expert masterclasses (Seiler, Lorang)",
                      "S&C roadmap for cyclists",
                      "Daily accountability group",
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
                  <Button href="/apply" size="lg" className="w-full">
                    Apply — 7-Day Free Trial
                  </Button>
                </Card>

                {/* TIER 3 — Premium / VIP */}
                <Card className="p-7 h-full flex flex-col" hoverable={false}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-purple" />
                    <span className="text-[10px] text-foreground-subtle uppercase tracking-widest font-body">
                      Tier 3 · By application
                    </span>
                  </div>
                  <h2 className="font-heading text-2xl md:text-3xl text-off-white mb-3 leading-tight">
                    PREMIUM &amp; VIP
                  </h2>
                  <p className="text-xs text-foreground-subtle uppercase tracking-widest font-body mb-4">
                    18 VIP members
                  </p>
                  <p className="text-foreground-muted text-sm mb-5 leading-relaxed">
                    1:1 direct access to Anthony. Race strategy, custom
                    camps, and the highest-touch tier. For cyclists chasing
                    specific podium targets.
                  </p>
                  <ul className="space-y-2 mb-6 flex-1">
                    {[
                      "Everything in Not Done Yet",
                      "Direct 1:1 with Anthony",
                      "Race & event strategy",
                      "Custom training camps",
                      "Application-only",
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
                  <Button
                    href="/apply"
                    size="lg"
                    className="w-full"
                    variant="secondary"
                  >
                    Apply &amp; Talk to Us
                  </Button>
                </Card>
              </div>

              <p className="text-center text-foreground-subtle text-sm mt-8 max-w-2xl mx-auto">
                The ladder: start free in the Clubhouse, plug into Not Done
                Yet when you&apos;re ready to stop guessing, move up to
                Premium when your goals need hands-on coaching.
              </p>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
