import type { Metadata } from "next";
import Image from "next/image";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal, GradientText, AnimatedCounter } from "@/components/ui";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { JsonLd } from "@/components/seo/JsonLd";
import Link from "next/link";

const brandPartners = [
  { name: "TrainingPeaks", logo: "/images/partners/trainingpeaks.png", invert: true },
  { name: "SRAM", logo: "/images/partners/sram.png", invert: false },
  { name: "discovery+", logo: "/images/partners/discovery-plus.svg", invert: true },
  { name: "4iiii", logo: "/images/partners/4iiii.svg", invert: true },
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

const platformReach = [
  {
    platform: "PODCAST",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    ),
    stat: "1M+",
    statLabel: "monthly listeners",
    description: "Top 3 cycling podcast worldwide. 12 new episodes per month across 1,400+ total.",
    color: "from-coral/20 to-coral/5",
  },
  {
    platform: "YOUTUBE",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    stat: "800K+",
    statLabel: "monthly views",
    description: "75K subscribers across our YouTube channels. 8–10 new videos per month. Long-form content with high watch time.",
    color: "from-red-500/20 to-red-500/5",
  },
  {
    platform: "FACEBOOK",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    stat: "6.5M",
    statLabel: "monthly reach",
    description: "112% growth in reach. 2,400+ new followers monthly. Highly engaged cycling community.",
    color: "from-blue-500/20 to-blue-500/5",
  },
  {
    platform: "INSTAGRAM",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
    stat: "1.8M",
    statLabel: "monthly views",
    description: "49.5K followers. 777K+ interactions per month. High-performing Reels and Stories.",
    color: "from-pink-500/20 to-pink-500/5",
  },
  {
    platform: "X (TWITTER)",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    stat: "1.2M",
    statLabel: "monthly impressions",
    description: "Real-time race commentary. Breaking news amplification. Engaged cycling audience.",
    color: "from-gray-400/20 to-gray-400/5",
  },
  {
    platform: "NEWSLETTER",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    stat: "60K+",
    statLabel: "weekly readers",
    description: "65%+ open rate (industry avg: 21%). The Saturday Spin every week. Direct click-through.",
    color: "from-emerald-500/20 to-emerald-500/5",
  },
];

const partnershipOptions = [
  {
    title: "PODCAST SPONSORSHIP",
    badge: "Most Popular",
    description:
      "Host-read ads that land. Pre-roll, mid-roll, or post-roll placements across 1,400+ episodes. Anthony delivers every read personally — no generic scripts, no phoned-in endorsements.",
    features: [
      "Host-read ad placements (pre-roll, mid-roll, post-roll)",
      "1M+ monthly listeners across all platforms",
      "Evergreen back-catalogue exposure",
      "Custom talking points tailored to your brand",
    ],
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    ),
  },
  {
    title: "NEWSLETTER SPONSORSHIP",
    badge: "Highest ROI",
    description:
      "The Saturday Spin lands in 60,000+ inboxes every week with a 65%+ open rate. Dedicated sends or banner placements — your brand in front of cyclists who actually open, read, and click.",
    features: [
      "60,000+ engaged subscribers",
      "65%+ open rate — 3x industry average",
      "Dedicated send or banner placement",
      "Direct link to purchase or landing page",
    ],
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    title: "CONTENT PARTNERSHIPS",
    badge: null,
    description:
      "Co-produced podcast episodes, in-depth product reviews, video content, and branded series. Built around your story, delivered with the credibility Roadman is known for.",
    features: [
      "Co-produced podcast episodes",
      "In-depth product reviews and features",
      "YouTube video integrations",
      "Branded content series",
    ],
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
  },
  {
    title: "EVENT SPONSORSHIP",
    badge: null,
    description:
      "Put your brand in front of the Roadman community IRL. From Not Done Yet training camps to group rides and live podcast events — direct access to engaged, passionate cyclists.",
    features: [
      "Training camp & group ride branding",
      "Live podcast event sponsorship",
      "Product sampling & demo opportunities",
      "Community member engagement",
    ],
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

const audienceProfile = [
  {
    label: "Age Range",
    value: "25-54",
    detail: "Peak earning years",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    label: "Avg. Annual Spend",
    value: "\u00a33,500+",
    detail: "On cycling gear & services",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    label: "Purchase Intent",
    value: "87%",
    detail: "Have bought from a sponsor",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  {
    label: "Household Income",
    value: "\u00a365K+",
    detail: "Above UK national average",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
];

const testimonials = [
  {
    quote: "The ROADMAN Podcast has been a fantastic platform for 4iiii to connect directly with a dedicated and engaged audience of serious cyclists. Anthony Walsh's authentic approach and deep knowledge create highly valuable content that helps listeners improve their riding. It's an ideal partnership for promoting performance tools like our power meters.",
    author: "Andreja Grenier",
    company: "4iiii",
    companyUrl: "https://4iiii.com",
  },
  {
    quote: "The Roadman Cycling Podcast was a perfect fit for our discovery+ Giro d'Italia campaign, not only allowing us to contextually target relevant cycling content, but also delivering genuine endorsement from a trusted source. The host made the entire process seamless, delivering scripts and reads quickly and professionally, whilst also taking into account the creative need for multiple variations of the messaging for different campaign phases.",
    author: "discovery+",
    company: "Discovery",
    companyUrl: "https://www.discoveryplus.com",
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
        {/* ═══════════════════════════════════════════
            HERO — Premium, confident, bold
        ═══════════════════════════════════════════ */}
        <Section background="deep-purple" grain className="pt-32 pb-20 md:pt-40 md:pb-28">
          <FloatingParticles count={30} color="rgba(241, 99, 99, 0.08)" />
          <Container className="text-center relative z-10">
            <ScrollReveal direction="up">
              <p className="text-coral font-heading tracking-[0.3em] uppercase text-sm mb-6">
                Media Kit 2026
              </p>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.1}>
              <h1
                className="font-heading text-off-white mb-8 leading-[0.95]"
                style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
              >
                <GradientText as="span">
                  PARTNER WITH THE WORLD&apos;S MOST TRUSTED CYCLING VOICE
                </GradientText>
              </h1>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.2}>
              <p className="text-foreground-muted text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-4">
                1 million monthly listeners. 60,000 newsletter subscribers.
                A community of serious cyclists who train with power meters,
                race on weekends, and spend real money on equipment, nutrition, and coaching.
              </p>
              <p className="text-foreground-subtle text-base max-w-2xl mx-auto leading-relaxed mb-10">
                Not casual listeners. Committed athletes with disposable income
                and purchase intent. Your brand in front of the people who actually buy.
              </p>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.3}>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Button href="/contact" size="lg">
                  Become a Partner
                </Button>
                <Button href="#the-reach" variant="ghost" size="lg">
                  See the Numbers
                </Button>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* ═══════════════════════════════════════════
            SOCIAL PROOF STRIP — Partner logos
        ═══════════════════════════════════════════ */}
        <section className="bg-deep-purple border-t border-b border-white/5 py-10 md:py-14">
          <div className="mx-auto max-w-[1200px] px-5 md:px-8">
            <ScrollReveal direction="up">
              <p className="text-center text-foreground-subtle text-xs tracking-[0.3em] uppercase mb-8">
                Trusted by leading brands in cycling
              </p>
              <div className="flex items-center justify-center gap-10 md:gap-16 flex-wrap">
                {brandPartners.map((brand) => (
                  <div
                    key={brand.name}
                    className="relative h-8 md:h-10 opacity-50 hover:opacity-100 transition-all duration-500"
                  >
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      width={140}
                      height={40}
                      className="h-full w-auto object-contain"
                      style={brand.invert ? { filter: "brightness(0) invert(1)" } : undefined}
                    />
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            THE REACH — Big numbers, visual impact
        ═══════════════════════════════════════════ */}
        <Section background="charcoal" className="section-glow-coral" id="the-reach">
          <Container>
            <ScrollReveal direction="up">
              <div className="text-center mb-16">
                <p className="text-coral font-heading tracking-[0.3em] uppercase text-sm mb-4">
                  The Numbers
                </p>
                <h2
                  className="font-heading text-off-white mb-4"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  THE REACH
                </h2>
                <p className="text-foreground-muted max-w-2xl mx-auto text-lg">
                  Your brand across every platform cyclists use — every single day
                  of the week. Not vanity metrics. Real, measurable reach across
                  an audience that buys.
                </p>
              </div>
            </ScrollReveal>

            {/* Headline stat — the big number */}
            <ScrollReveal direction="up" delay={0.1}>
              <div className="text-center mb-16 py-8">
                <p className="font-heading text-coral stat-glow" style={{ fontSize: "clamp(4rem, 10vw, 8rem)", lineHeight: 1 }}>
                  <AnimatedCounter value="11M+" />
                </p>
                <p className="text-foreground-muted text-lg mt-3 tracking-wide">
                  Combined monthly reach across all platforms
                </p>
              </div>
            </ScrollReveal>

            {/* Platform grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {platformReach.map((p, i) => (
                <ScrollReveal key={p.platform} direction="up" delay={i * 0.08}>
                  <Card className="p-6 h-full card-shimmer relative overflow-hidden" glass>
                    {/* Gradient accent */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${p.color} opacity-50`} />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                          <span className="text-coral" aria-hidden="true">
                            {p.icon}
                          </span>
                          <h3 className="font-heading text-lg text-foreground-subtle tracking-wider">
                            {p.platform}
                          </h3>
                        </div>
                      </div>
                      <p className="font-heading text-coral stat-glow mb-1" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 1 }}>
                        <AnimatedCounter value={p.stat} />
                      </p>
                      <p className="text-foreground-muted text-sm uppercase tracking-wider mb-4">
                        {p.statLabel}
                      </p>
                      <p className="text-sm text-foreground-muted leading-relaxed">
                        {p.description}
                      </p>
                    </div>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Gradient divider */}
        <div className="gradient-divider" />

        {/* ═══════════════════════════════════════════
            AUDIENCE PROFILE — Data-driven, compelling
        ═══════════════════════════════════════════ */}
        <Section background="deep-purple" grain>
          <Container>
            <ScrollReveal direction="up">
              <div className="text-center mb-16">
                <p className="text-coral font-heading tracking-[0.3em] uppercase text-sm mb-4">
                  Your Target Customer
                </p>
                <h2
                  className="font-heading text-off-white mb-4"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  WHO&apos;S LISTENING
                </h2>
                <p className="text-foreground-muted max-w-2xl mx-auto text-lg">
                  Affluent, educated, performance-driven cyclists in their peak
                  earning years. They don&apos;t just consume content — they act on it.
                </p>
              </div>
            </ScrollReveal>

            {/* Audience stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
              {audienceProfile.map((item, i) => (
                <ScrollReveal key={item.label} direction="up" delay={i * 0.1}>
                  <Card className="p-6 h-full text-center card-shimmer" glass>
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-coral/10 text-coral mb-4">
                      {item.icon}
                    </div>
                    <p className="font-heading text-3xl md:text-4xl text-coral stat-glow mb-1">
                      <AnimatedCounter value={item.value} />
                    </p>
                    <p className="font-heading text-sm text-off-white tracking-wider mb-1">
                      {item.label.toUpperCase()}
                    </p>
                    <p className="text-xs text-foreground-subtle">{item.detail}</p>
                  </Card>
                </ScrollReveal>
              ))}
            </div>

            {/* Audience traits */}
            <ScrollReveal direction="up" delay={0.3}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  {
                    title: "HIGH INTENT BUYERS",
                    description:
                      "Our audience actively searches for products to make them faster. They read reviews, compare specs, and buy. Your brand reaches people already in buying mode.",
                  },
                  {
                    title: "DEEP TRUST",
                    description:
                      "1,400+ episodes of honest, expert-led content has built a community that trusts our recommendations. When Anthony endorses a product, people listen — and act.",
                  },
                  {
                    title: "GEAR OBSESSED",
                    description:
                      "Power meters, carbon wheels, indoor trainers, nutrition. This audience spends on performance and recovery. They want to know what works — and they'll buy it.",
                  },
                ].map((item, i) => (
                  <ScrollReveal key={item.title} direction="up" delay={0.3 + i * 0.1}>
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
            </ScrollReveal>
          </Container>
        </Section>

        {/* Gradient divider */}
        <div className="gradient-divider" />

        {/* ═══════════════════════════════════════════
            PARTNERSHIP OPTIONS — Clear, professional
        ═══════════════════════════════════════════ */}
        <Section background="charcoal">
          <Container>
            <ScrollReveal direction="up">
              <div className="text-center mb-16">
                <p className="text-coral font-heading tracking-[0.3em] uppercase text-sm mb-4">
                  How We Work Together
                </p>
                <h2
                  className="font-heading text-off-white mb-4"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  PARTNERSHIP OPTIONS
                </h2>
                <p className="text-foreground-muted max-w-xl mx-auto text-lg">
                  Flexible formats built around what actually works. Every
                  partnership is tailored — no cookie-cutter packages.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {partnershipOptions.map((option, i) => (
                <ScrollReveal key={option.title} direction="up" delay={i * 0.1}>
                  <Card className="p-8 h-full card-shimmer relative" glass>
                    {option.badge && (
                      <span className="absolute top-4 right-4 bg-coral/15 text-coral text-xs font-heading tracking-wider px-3 py-1 rounded-full border border-coral/20">
                        {option.badge}
                      </span>
                    )}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-coral/10 text-coral">
                        {option.icon}
                      </div>
                      <h3 className="font-heading text-2xl text-off-white">
                        {option.title}
                      </h3>
                    </div>
                    <p className="text-foreground-muted mb-6 leading-relaxed">
                      {option.description}
                    </p>
                    <ul className="space-y-2.5">
                      {option.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2.5 text-sm text-foreground-muted"
                        >
                          <span className="text-coral mt-0.5 flex-shrink-0">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </span>
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

        {/* ═══════════════════════════════════════════
            HOW IT WORKS — 3-step process
        ═══════════════════════════════════════════ */}
        <Section background="deep-purple" grain>
          <Container>
            <ScrollReveal direction="up">
              <div className="text-center mb-16">
                <p className="text-coral font-heading tracking-[0.3em] uppercase text-sm mb-4">
                  Simple Process
                </p>
                <h2
                  className="font-heading text-off-white mb-4"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  HOW IT WORKS
                </h2>
                <p className="text-foreground-muted max-w-xl mx-auto text-lg">
                  From first conversation to live campaign in as little as 48 hours.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  step: "01",
                  title: "BRIEF",
                  description: "Tell us your goals, target audience, and budget. We'll recommend the right format — podcast, newsletter, video, or a combination.",
                },
                {
                  step: "02",
                  title: "SCRIPT",
                  description: "We craft the messaging. Anthony writes every host-read ad personally, tailored to your brand voice. You approve before anything goes live.",
                },
                {
                  step: "03",
                  title: "LIVE",
                  description: "Your campaign goes out to 1M+ engaged cyclists. We share performance data, listener feedback, and optimise for the next run.",
                },
              ].map((item, i) => (
                <ScrollReveal key={item.step} direction="up" delay={i * 0.15}>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-coral/30 mb-6">
                      <span className="font-heading text-2xl text-coral">{item.step}</span>
                    </div>
                    <h3 className="font-heading text-2xl text-off-white mb-3">{item.title}</h3>
                    <p className="text-foreground-muted text-sm leading-relaxed">{item.description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Gradient divider */}
        <div className="gradient-divider" />

        {/* ═══════════════════════════════════════════
            CASE STUDY — Discovery+ Giro d'Italia
        ═══════════════════════════════════════════ */}
        <Section background="charcoal" className="section-glow-coral">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <div className="text-center mb-10">
                <p className="text-coral font-heading tracking-[0.3em] uppercase text-sm mb-4">
                  Case Study
                </p>
                <h2
                  className="font-heading text-off-white mb-4"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  DISCOVERY+ &times; GIRO D&apos;ITALIA
                </h2>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.1}>
              <Card className="p-8 card-shimmer" glass>
                <div className="space-y-6">
                  <div>
                    <p className="text-xs text-coral font-heading tracking-widest mb-3">THE CHALLENGE</p>
                    <p className="text-foreground-muted leading-relaxed">
                      Drive subscriptions for discovery+ Giro d&apos;Italia coverage among serious
                      cycling fans — a niche audience that traditional advertising struggles to reach with authenticity.
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-coral font-heading tracking-widest mb-3">THE APPROACH</p>
                    <p className="text-foreground-muted leading-relaxed">
                      Multi-phase host-read campaign across podcast episodes timed to the race calendar.
                      Multiple script variations for different campaign phases — pre-race hype, mid-race
                      engagement, and post-stage recaps. Anthony delivered every read personally.
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-coral font-heading tracking-widest mb-3">THE RESULT</p>
                    <p className="text-foreground-muted leading-relaxed">
                      Genuine endorsement from a trusted voice in cycling. Contextually targeted content
                      that felt native, not forced. Seamless delivery across creative variations —
                      scripts returned and reads completed within 48 hours of briefing.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-off-white text-sm italic leading-relaxed">
                      &ldquo;The host made the entire process seamless, delivering scripts and reads
                      quickly and professionally.&rdquo;
                    </p>
                    <p className="text-foreground-subtle text-xs mt-2">— discovery+, Discovery</p>
                  </div>
                </div>
              </Card>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Gradient divider */}
        <div className="gradient-divider" />

        {/* ═══════════════════════════════════════════
            TESTIMONIALS — Social proof quotes
        ═══════════════════════════════════════════ */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up">
              <div className="text-center mb-12">
                <p className="text-coral font-heading tracking-[0.3em] uppercase text-sm mb-4">
                  Partner Feedback
                </p>
                <h2
                  className="font-heading text-off-white mb-4"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  WHAT PARTNERS SAY
                </h2>
              </div>
            </ScrollReveal>

            <div className="space-y-6">
              {testimonials.map((t, i) => (
                <ScrollReveal key={i} direction="up" delay={i * 0.15}>
                  <Card className="p-8 card-shimmer relative" glass>
                    {/* Large quote mark */}
                    <span className="absolute top-4 left-6 font-heading text-coral/20 leading-none select-none" style={{ fontSize: "5rem" }}>
                      &ldquo;
                    </span>
                    <blockquote className="relative z-10 pt-8">
                      <p className="text-off-white text-lg leading-relaxed mb-6 italic">
                        &ldquo;{t.quote}&rdquo;
                      </p>
                      <footer className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-coral/15 flex items-center justify-center">
                          <span className="text-coral font-heading text-sm">
                            {t.author.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-off-white text-sm font-heading tracking-wider">
                            {t.author.toUpperCase()}
                          </p>
                          <p className="text-foreground-subtle text-xs">
                            {t.companyUrl ? (
                              <a href={t.companyUrl} target="_blank" rel="noopener noreferrer" className="hover:text-coral transition-colors">
                                {t.company} ↗
                              </a>
                            ) : t.company}
                          </p>
                        </div>
                      </footer>
                    </blockquote>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Gradient divider */}
        <div className="gradient-divider" />

        {/* ═══════════════════════════════════════════
            WORLD-CLASS GUESTS — Credibility
        ═══════════════════════════════════════════ */}
        <Section background="charcoal" className="section-glow-coral">
          <Container>
            <ScrollReveal direction="up">
              <div className="text-center mb-12">
                <p className="text-coral font-heading tracking-[0.3em] uppercase text-sm mb-4">
                  Credibility
                </p>
                <h2
                  className="font-heading text-off-white mb-4"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  WORLD-CLASS GUESTS
                </h2>
                <p className="text-foreground-muted max-w-xl mx-auto">
                  Tour de France winners, Olympic gold medallists, world-leading
                  sports scientists, and F1 drivers. The calibre of guest reflects
                  the calibre of audience.
                </p>
              </div>
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

        {/* ═══════════════════════════════════════════
            CTA — Big, clear, impossible to miss
        ═══════════════════════════════════════════ */}
        <Section background="deep-purple" grain className="py-24 md:py-32">
          <FloatingParticles count={15} color="rgba(241, 99, 99, 0.1)" />
          <Container className="text-center relative z-10">
            <ScrollReveal direction="up">
              <h2
                className="font-heading text-off-white mb-6 leading-[0.95]"
                style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
              >
                <GradientText as="span">LET&apos;S BUILD SOMETHING TOGETHER</GradientText>
              </h2>
              <p className="text-foreground-muted text-lg md:text-xl max-w-2xl mx-auto mb-4 leading-relaxed">
                Whether you&apos;re a bike brand, nutrition company, tech
                startup, or anything in between — if your product makes cyclists
                faster, safer, or happier, we want to hear from you.
              </p>
              <p className="text-foreground-subtle text-base max-w-xl mx-auto mb-8 leading-relaxed">
                Reach out and we&apos;ll send you the full media kit with
                rates, case studies, and audience data.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap mb-8">
                <Button href="/contact" size="lg">
                  Get in Touch
                </Button>
                <Button href="/media-kit.pdf" variant="ghost" size="lg" external>
                  Download Media Kit
                </Button>
              </div>
              <div className="flex items-center justify-center gap-2 text-foreground-muted">
                <svg className="w-5 h-5 text-coral" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span className="text-sm">
                  Or email directly:{" "}
                  <a href="mailto:anthony@roadmancycling.com" className="text-coral hover:underline font-medium">
                    anthony@roadmancycling.com
                  </a>
                </span>
              </div>
            </ScrollReveal>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
