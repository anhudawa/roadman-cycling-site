import type { Metadata } from "next";
import Image from "next/image";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal, GradientText, AnimatedCounter } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import Link from "next/link";

const brandPartners = [
  { name: "TrainingPeaks", logo: "/images/partners/trainingpeaks.png", invert: true },
  { name: "SRAM", logo: "/images/partners/sram.svg", invert: false },
  { name: "Parlee", logo: "/images/partners/parlee.png", invert: false },
  { name: "4Endurance", logo: "/images/partners/4endurance.png", invert: false },
  { name: "Bikmo", logo: "/images/partners/bikmo.png", invert: true },
];

export const metadata: Metadata = {
  title: "Partner With Us — Roadman Cycling Media Kit",
  description:
    "Reach 1M+ serious cyclists through podcast sponsorship, newsletter ads, community integration, and custom content. Download the Roadman Cycling media kit.",
  alternates: {
    canonical: "https://roadmancycling.com/partners",
  },
  openGraph: {
    title: "Partner With Us — Roadman Cycling Media Kit",
    description:
      "Reach 1M+ serious cyclists through podcast sponsorship, newsletter ads, community integration, and custom content.",
    type: "website",
    url: "https://roadmancycling.com/partners",
  },
};

const audienceStats = [
  { value: "1M+", label: "Monthly Downloads" },
  { value: "60,000+", label: "Newsletter Subscribers" },
  { value: "9.7M+", label: "YouTube Views" },
  { value: "65%+", label: "Email Open Rate" },
];

const platformReach = [
  {
    platform: "PODCAST",
    icon: "🎙️",
    headline: "1M+ monthly downloads",
    stats: [
      "Top 3 cycling podcast worldwide",
      "1,400+ episodes across all platforms",
      "3 episodes per week",
      "Evergreen back-catalogue driving daily discovery",
    ],
  },
  {
    platform: "YOUTUBE",
    icon: "▶️",
    headline: "7.1M views on main channel",
    stats: [
      "2.6M additional views on clips channel",
      "28K+ combined subscribers",
      "623K+ watch hours",
      "Twice-weekly high-quality video content",
    ],
  },
  {
    platform: "FACEBOOK",
    icon: "📘",
    headline: "5.5M views in 28 days",
    stats: [
      "407K+ engagements per month",
      "112% growth in reach",
      "169% growth in engagement",
      "2,400+ new followers monthly",
    ],
  },
  {
    platform: "INSTAGRAM",
    icon: "📷",
    headline: "1.8M views per month",
    stats: [
      "777K+ interactions",
      "3,300+ new followers monthly",
      "High-performing Reels and Stories",
      "Direct product tagging opportunities",
    ],
  },
  {
    platform: "X (TWITTER)",
    icon: "𝕏",
    headline: "1.2M impressions",
    stats: [
      "50K+ engagements",
      "Real-time race and training commentary",
      "Direct audience interaction",
      "Breaking news amplification",
    ],
  },
  {
    platform: "NEWSLETTER",
    icon: "✉️",
    headline: "60,000+ subscribers",
    stats: [
      "65%+ open rate (industry avg: 21%)",
      "Weekly Saturday Spin edition",
      "Dedicated send or banner placements",
      "Direct click-through to your landing page",
    ],
  },
];

const partnershipOptions = [
  {
    title: "PODCAST SPONSORSHIP",
    description:
      "Host-read ads that land. Pre-roll, mid-roll, or post-roll placements across 1,400+ episodes and counting. Anthony delivers every read personally — no generic scripts, no phoned-in endorsements.",
    features: [
      "Host-read ad placements (pre-roll, mid-roll, post-roll)",
      "1M+ monthly listeners across all platforms",
      "Evergreen back-catalogue exposure",
      "Custom talking points tailored to your brand",
    ],
  },
  {
    title: "NEWSLETTER SPONSORSHIP",
    description:
      "The Saturday Spin lands in 60,000+ inboxes every week with a 65%+ open rate. Dedicated sends or banner placements — your brand in front of cyclists who actually open, read, and click.",
    features: [
      "60,000+ engaged subscribers",
      "Dedicated send or banner placement",
      "High open rates from an opted-in audience",
      "Direct link to purchase or landing page",
    ],
  },
  {
    title: "COMMUNITY INTEGRATION",
    description:
      "Put your product in the hands of 2,100+ active cyclists. Real-world testing, honest feedback, and organic word-of-mouth inside a community that trusts each other.",
    features: [
      "Product seeding with active community members",
      "Genuine user feedback and testimonials",
      "Organic discussion and word-of-mouth",
      "Access to Not Done Yet coaching members",
    ],
  },
  {
    title: "CUSTOM CONTENT",
    description:
      "Co-produced podcast episodes, in-depth product reviews, video content, and branded series. Built around your story, delivered with the credibility Roadman is known for.",
    features: [
      "Co-produced podcast episodes",
      "In-depth product reviews and features",
      "YouTube video integrations",
      "Branded content series",
    ],
  },
];

const notableGuests = [
  "Greg LeMond — 3x Tour de France winner",
  "Professor Stephen Seiler — Polarised training pioneer",
  "Dan Lorang — Red Bull-Bora-Hansgrohe",
  "Lachlan Morton — EF Education, alt-racing pioneer",
  "Dan Bigham — Former Hour Record holder",
  "Alistair Brownlee — 2x Olympic triathlon gold",
  "Valtteri Bottas — F1 driver & cyclist",
  "Joe Friel — Author, Cyclist's Training Bible",
  "Tim Spector — ZOE founder, epidemiologist",
];

export default function PartnersPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Partner With Roadman Cycling",
          description:
            "Media kit and partnership opportunities for brands looking to reach serious cyclists through podcast, newsletter, community, and custom content.",
          url: "https://roadmancycling.com/partners",
          publisher: {
            "@type": "Organization",
            name: "Roadman Cycling",
            url: "https://roadmancycling.com",
          },
          mainEntity: {
            "@type": "Service",
            name: "Roadman Cycling Sponsorship & Advertising",
            provider: {
              "@type": "Organization",
              name: "Roadman Cycling",
            },
            serviceType: "Advertising",
            description:
              "Podcast sponsorship, newsletter advertising, community integration, and custom content partnerships for cycling and endurance brands.",
          },
        }}
      />

      <Header />

      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-16">
          <Container className="text-center">
            <ScrollReveal direction="up">
              <h1
                className="font-heading text-off-white mb-6"
                style={{ fontSize: "var(--text-hero)" }}
              >
                <GradientText as="span">PARTNER WITH ROADMAN</GradientText>
              </h1>
              <p className="text-foreground-muted text-xl max-w-3xl mx-auto leading-relaxed mb-8">
                We work with some of the biggest brands in cycling. Your brand
                in front of serious cyclists who buy gear, follow training plans,
                and invest in performance. Not casual listeners — committed
                athletes with disposable income and purchase intent.
              </p>
              <Button href="/contact" size="lg">
                Get in Touch
              </Button>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Trusted By */}
        <section className="bg-deep-purple py-12 md:py-16 border-t border-white/5">
          <div className="mx-auto max-w-[1200px] px-5 md:px-8">
            <ScrollReveal direction="up">
              <p className="text-center text-foreground-subtle text-xs tracking-[0.3em] uppercase mb-10">
                Our sponsors — some of the biggest brands in cycling
              </p>
              <div className="flex items-center justify-center gap-10 md:gap-16 flex-wrap">
                {brandPartners.map((brand) => (
                  <div
                    key={brand.name}
                    className="relative h-8 md:h-10 opacity-60 hover:opacity-100 transition-all duration-300"
                  >
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      width={140}
                      height={40}
                      className={`h-full w-auto object-contain ${brand.invert ? "invert brightness-0 invert hover:brightness-100" : ""}`}
                      style={brand.invert ? { filter: "brightness(0) invert(1)" } : undefined}
                    />
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Audience Stats */}
        <section className="bg-deep-purple py-12 md:py-16 relative overflow-hidden">
          <div className="relative z-10 mx-auto max-w-[1200px] px-5 md:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {audienceStats.map((stat, i) => (
                <ScrollReveal key={stat.label} direction="up" delay={i * 0.12}>
                  <div className="stat-card-pulse rounded-xl p-4">
                    <p className="font-heading text-3xl md:text-5xl text-coral mb-1 stat-glow">
                      <AnimatedCounter value={stat.value} />
                    </p>
                    <p className="text-sm text-foreground-muted">{stat.label}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Gradient divider */}
        <div className="gradient-divider" />

        {/* The Reach — platform breakdown */}
        <Section background="charcoal" className="section-glow-coral">
          <Container>
            <ScrollReveal direction="up">
              <h2
                className="font-heading text-off-white text-center mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                THE REACH
              </h2>
              <p className="text-foreground-muted text-center max-w-2xl mx-auto mb-12">
                Your brand across every platform cyclists use — every single day
                of the week. These are not vanity metrics. This is real,
                measurable reach across an audience that buys.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {platformReach.map((p, i) => (
                <ScrollReveal key={p.platform} direction="up" delay={i * 0.08}>
                  <Card className="p-6 h-full card-shimmer" glass>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl" aria-hidden="true">
                        {p.icon}
                      </span>
                      <h3 className="font-heading text-xl text-off-white">
                        {p.platform}
                      </h3>
                    </div>
                    <p className="text-coral font-heading text-lg mb-4">
                      {p.headline}
                    </p>
                    <ul className="space-y-2">
                      {p.stats.map((stat) => (
                        <li
                          key={stat}
                          className="flex items-start gap-2 text-sm text-foreground-muted"
                        >
                          <span className="text-coral mt-0.5">&#10003;</span>
                          {stat}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Gradient divider */}
        <div className="gradient-divider" />

        {/* Why Partner */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2
                className="font-heading text-off-white text-center mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                WHY ROADMAN
              </h2>
              <p className="text-foreground-muted text-center max-w-xl mx-auto mb-12">
                This is not a casual audience. These are cyclists who train with
                power meters, race on weekends, and spend real money on
                equipment, nutrition, and coaching.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "HIGH INTENT",
                  description:
                    "Our audience actively searches for products to make them faster. They read reviews, compare specs, and buy. Your brand reaches people already in buying mode.",
                },
                {
                  title: "DEEP TRUST",
                  description:
                    "1,400+ episodes of honest, expert-led content has built a community that trusts our recommendations. When Anthony endorses a product, people listen.",
                },
                {
                  title: "MULTI-CHANNEL",
                  description:
                    "Podcast, YouTube, newsletter, community, and social. One partnership can reach your audience across every platform they use, every day of the week.",
                },
              ].map((item, i) => (
                <ScrollReveal key={item.title} direction="up" delay={i * 0.1}>
                  <Card className="p-6 h-full card-shimmer" glass>
                    <h3 className="font-heading text-xl text-coral mb-3">
                      {item.title}
                    </h3>
                    <p className="text-sm text-foreground-muted leading-relaxed">
                      {item.description}
                    </p>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Gradient divider */}
        <div className="gradient-divider" />

        {/* Partnership Options */}
        <Section background="deep-purple" grain>
          <Container>
            <ScrollReveal direction="up">
              <h2
                className="font-heading text-off-white text-center mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                PARTNERSHIP OPTIONS
              </h2>
              <p className="text-foreground-muted text-center max-w-xl mx-auto mb-12">
                Flexible formats built around what actually works. Every
                partnership is tailored — no cookie-cutter packages.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {partnershipOptions.map((option, i) => (
                <ScrollReveal key={option.title} direction="up" delay={i * 0.1}>
                  <Card className="p-8 h-full card-shimmer" glass>
                    <h3 className="font-heading text-2xl text-off-white mb-3">
                      {option.title}
                    </h3>
                    <p className="text-foreground-muted mb-6 leading-relaxed">
                      {option.description}
                    </p>
                    <ul className="space-y-2">
                      {option.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-sm text-foreground-muted"
                        >
                          <span className="text-coral mt-0.5">&#10003;</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Gradient divider */}
        <div className="gradient-divider" />

        {/* Past Guests / Credibility */}
        <Section background="charcoal" className="section-glow-coral">
          <Container>
            <ScrollReveal direction="up">
              <h2
                className="font-heading text-off-white text-center mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                WORLD-CLASS GUESTS
              </h2>
              <p className="text-foreground-muted text-center max-w-xl mx-auto mb-12">
                Tour de France winners, Olympic gold medallists, world-leading
                sports scientists, and F1 drivers. The calibre of guest reflects
                the calibre of audience.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {notableGuests.map((guest, i) => {
                const [name, credential] = guest.split(" — ");
                return (
                  <ScrollReveal key={name} direction="up" delay={i * 0.05}>
                    <Card className="p-5 h-full border-l-2 border-l-coral card-shimmer" glass>
                      <p className="font-heading text-lg text-off-white leading-tight mb-1">
                        {name.toUpperCase()}
                      </p>
                      <p className="text-sm text-foreground-muted">
                        {credential}
                      </p>
                    </Card>
                  </ScrollReveal>
                );
              })}
            </div>

            <ScrollReveal direction="up" delay={0.5}>
              <p className="text-center text-foreground-muted text-sm mt-8">
                Plus 1,400+ more conversations in{" "}
                <Link href="/guests" className="text-coral hover:underline">
                  the full guest archive
                </Link>
                .
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Gradient divider */}
        <div className="gradient-divider" />

        {/* CTA */}
        <Section background="deep-purple" grain>
          <Container className="text-center">
            <ScrollReveal direction="up">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                <GradientText as="span">LET&apos;S WORK TOGETHER</GradientText>
              </h2>
              <p className="text-foreground-muted text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
                Whether you&apos;re a bike brand, nutrition company, tech
                startup, or anything in between — if your product makes cyclists
                faster, safer, or happier, we want to hear from you.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Button href="/contact" size="lg">
                  Get in Touch
                </Button>
                <Button href="/about" variant="ghost" size="lg">
                  Learn More About Us
                </Button>
              </div>
            </ScrollReveal>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
