import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { ENTITY_IDS } from "@/lib/brand-facts";

export const metadata: Metadata = {
  title: "Press & Media Kit — Anthony Walsh & Roadman Cycling",
  description:
    "Press kit and media enquiries for Roadman Cycling and Anthony Walsh. Brand stats, founder bio, guest credentials, approved assets, and podcast-guesting availability.",
  alternates: {
    canonical: "https://roadmancycling.com/about/press",
  },
  openGraph: {
    title: "Press & Media Kit — Anthony Walsh & Roadman Cycling",
    description:
      "Press kit and media enquiries for Roadman Cycling and Anthony Walsh. Brand stats, founder bio, guest credentials, approved assets.",
    type: "profile",
    url: "https://roadmancycling.com/about/press",
  },
};

// Facts surfaced on the press page are pulled from existing public content
// on roadmancycling.com (about page, homepage, podcast feed, Skool community).
// Do not add claims here that are not substantiated elsewhere on the site.
const brandStats = [
  {
    stat: "1M+",
    label: "Monthly listeners",
    detail: "Across Spotify, Apple Podcasts, YouTube and all podcast platforms",
  },
  {
    stat: "1,400+",
    label: "Episodes published",
    detail:
      "In-depth interviews with World Tour coaches, sports scientists and pro riders — weekly since 2021, available everywhere podcasts are",
  },
  {
    stat: "65K",
    label: "Newsletter subscribers",
    detail:
      "Engaged inbox audience receiving weekly performance breakdowns distilled from the podcast",
  },
  {
    stat: "18",
    label: "Countries coached",
    detail:
      "Full coaching programme serving serious amateur cyclists across 18 countries",
  },
];

// Names here are cross-verified against /guests slugs and the /about expert
// network list — all on-the-record podcast guests with episodes published
// on roadmancycling.com.
const notableGuests = [
  { name: "Professor Stephen Seiler", credential: "Polarised training pioneer" },
  {
    name: "Dan Lorang",
    credential: "Head of Performance, Red Bull–Bora–Hansgrohe (since 2017)",
  },
  { name: "Greg LeMond", credential: "3× Tour de France winner" },
  { name: "Lachlan Morton", credential: "EF Education pro cyclist" },
  { name: "Joe Friel", credential: "Author, The Cyclist's Training Bible" },
  { name: "Ben Healy", credential: "Pro cyclist, Tour de France stage winner" },
  {
    name: "Michael Matthews",
    credential: "15+ year World Tour pro, Grand Tour stage winner",
  },
  { name: "Dan Bigham", credential: "Head of Engineering, Red Bull–Bora–Hansgrohe · Former UCI Hour Record holder" },
  { name: "Rosa Kloser", credential: "2024 Unbound Gravel 200 winner" },
  {
    name: "Tim Spector",
    credential: "ZOE founder, epidemiologist, nutrition scientist",
  },
];

const pitchAngles = [
  {
    title: "The cycling podcast built on access, not algorithms",
    body: "How one host's 1,400+ on-the-record interviews with the world's best coaches and scientists built a million-listener audience — and changed how amateur cyclists train.",
  },
  {
    title: "What the World Tour knows that age-groupers don't — yet",
    body: "Polarised training, periodisation, race-day fuelling: the methodology gap between pros and amateurs is closing, and most of it is coming through long-form podcasting.",
  },
  {
    title: "The triathlon bike-leg problem nobody is solving",
    body: "The bike is 50–60% of race-day in long-course triathlon, yet most triathlon coaches treat it as a third of the plan. Why bike-specific coaching is the biggest unserved niche in endurance sport.",
  },
  {
    title: "Longevity in endurance sport: cyclists over 40",
    body: "Masters cyclists are the fastest-growing segment in the sport. What the science says about getting faster — not slower — after 40, 50, and beyond.",
  },
];

const brandAssets = [
  {
    label: "Logo (white, 1x)",
    href: "/images/logo-white.png",
    type: "PNG",
  },
  {
    label: "Logo (white, 2x)",
    href: "/images/logo-white-2x.png",
    type: "PNG",
  },
  {
    label: "Anthony Walsh — studio",
    href: "/images/about/anthony-walsh-podcast.jpg",
    type: "JPG",
  },
  {
    label: "Anthony Walsh — profile",
    href: "/images/about/anthony-profile-closeup-v2.jpg",
    type: "JPG",
  },
];

export default function PressPage() {
  return (
    <>
      {/* This press page references the canonical Anthony + Roadman entities
          declared in the root layout's @graph (see components/seo/JsonLd.tsx)
          rather than redeclaring them. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "Press & Media Kit — Anthony Walsh & Roadman Cycling",
          url: "https://roadmancycling.com/about/press",
          mainEntity: { "@id": ENTITY_IDS.organization },
          about: [
            { "@id": ENTITY_IDS.person },
            { "@id": ENTITY_IDS.organization },
          ],
          isPartOf: { "@id": ENTITY_IDS.website },
        }}
      />

      {/* Breadcrumb */}
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
              name: "About",
              item: "https://roadmancycling.com/about",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: "Press & Media",
              item: "https://roadmancycling.com/about/press",
            },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-16">
          <Container className="text-center">
            <ScrollReveal direction="up">
              <p className="text-coral font-heading text-sm tracking-widest mb-6">
                PRESS &amp; MEDIA KIT
              </p>
              <h1
                className="font-heading text-off-white mb-6"
                style={{ fontSize: "var(--text-hero)" }}
              >
                ROADMAN CYCLING
                <br />
                <span className="text-coral">PRESS &amp; MEDIA</span>
              </h1>
              <p className="text-foreground-muted text-xl max-w-2xl mx-auto leading-relaxed">
                For interviews, features, podcast guesting, and media enquiries
                — everything journalists and producers need in one place.
                Brand stats, bio, approved assets, and direct contact below.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
                <Button
                  href="mailto:anthony@roadmancycling.com?subject=Press%20enquiry"
                  size="lg"
                >
                  Email Press Enquiry
                </Button>
                <Button href="#brand-assets" variant="ghost" size="lg">
                  Brand Assets
                </Button>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        <div className="gradient-divider" />

        {/* Brand stats */}
        <Section background="charcoal">
          <Container>
            <ScrollReveal direction="up" className="text-center mb-12">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                THE NUMBERS
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto">
                The concise stats most editors ask for. All figures
                cross-referenced with on-site content.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {brandStats.map((s, i) => (
                <ScrollReveal key={s.label} direction="up" delay={i * 0.08}>
                  <Card className="p-6 text-center h-full" glass hoverable={false}>
                    <p className="font-heading text-5xl text-coral mb-2">
                      {s.stat}
                    </p>
                    <p className="text-off-white font-medium mb-2">{s.label}</p>
                    <p className="text-xs text-foreground-subtle leading-relaxed">
                      {s.detail}
                    </p>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Founder bio */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2
                className="font-heading text-off-white mb-6"
                style={{ fontSize: "var(--text-section)" }}
              >
                FOUNDER BIO
              </h2>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-8 items-start">
              <ScrollReveal direction="left" className="md:col-span-1">
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden">
                  <Image
                    src="/images/about/anthony-walsh-podcast.jpg"
                    alt="Anthony Walsh — founder and host, Roadman Cycling Podcast"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                </div>
              </ScrollReveal>

              <ScrollReveal
                direction="right"
                className="md:col-span-2 space-y-4 text-foreground-muted leading-relaxed"
              >
                <p className="text-off-white font-medium">
                  Anthony Walsh is the founder of Roadman Cycling and host of
                  The Roadman Cycling Podcast — one of the most-listened-to
                  cycling performance podcasts in the world.
                </p>
                <p>
                  Based in Dublin, Ireland, Anthony built Roadman from a
                  one-man recording setup into a company coaching cyclists
                  across 18 countries. His interview catalogue runs to over
                  1,400 on-the-record conversations with the coaches,
                  scientists, and athletes who are actively shaping elite
                  cycling — from polarised training pioneer Prof. Stephen
                  Seiler to Red Bull–Bora–Hansgrohe head of performance Dan
                  Lorang, three-time Tour de France winner Greg LeMond, and
                  EF Education pro Lachlan Morton.
                </p>
                <p>
                  The Roadman Cycling coaching programme applies that body
                  of work to serious amateur cyclists — time-crunched
                  professionals, comeback riders, and age-group racers who
                  refuse to accept that their best days are behind them.
                </p>
                <p className="text-foreground-subtle text-sm pt-4 border-t border-white/10">
                  <strong className="text-off-white">Short bio (50 words):</strong>{" "}
                  Anthony Walsh is the founder of Roadman Cycling and host of
                  The Roadman Cycling Podcast. Over 1,400 interviews with
                  World Tour coaches, sports scientists and pro cyclists
                  have built a community of one million monthly listeners
                  and a coaching programme serving cyclists in 18 countries.
                </p>
              </ScrollReveal>
            </div>
          </Container>
        </Section>

        {/* Story angles */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                STORY ANGLES FOR EDITORS
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto">
                Four angles we are actively available to discuss on podcasts,
                features, and opinion pieces.
              </p>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-4">
              {pitchAngles.map((a, i) => (
                <ScrollReveal key={a.title} direction="up" delay={i * 0.06}>
                  <Card className="p-6 h-full" hoverable={false}>
                    <h3 className="font-heading text-lg text-coral mb-3">
                      {a.title.toUpperCase()}
                    </h3>
                    <p className="text-sm text-foreground-muted leading-relaxed">
                      {a.body}
                    </p>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Notable guests credibility strip */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-10">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                SELECTED PODCAST GUESTS
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto">
                A representative sample of the on-the-record guests behind the
                Roadman catalogue. Full archive at{" "}
                <Link href="/guests" className="text-coral hover:underline">
                  /guests
                </Link>
                .
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {notableGuests.map((g) => (
                <Card
                  key={g.name}
                  className="p-4 flex items-baseline gap-3"
                  hoverable={false}
                >
                  <p className="font-heading text-off-white shrink-0">
                    {g.name.toUpperCase()}
                  </p>
                  <p className="text-xs text-foreground-subtle">
                    {g.credential}
                  </p>
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        {/* Brand assets */}
        <Section background="charcoal" id="brand-assets">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-10">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                APPROVED BRAND ASSETS
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto">
                Logos and photography cleared for editorial use with
                attribution to Roadman Cycling.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {brandAssets.map((a) => (
                <a
                  key={a.label}
                  href={a.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                  download
                >
                  <Card className="p-4 text-center h-full" hoverable={true}>
                    <p className="font-heading text-sm text-off-white group-hover:text-coral transition-colors mb-1">
                      {a.label.toUpperCase()}
                    </p>
                    <p className="text-[10px] text-foreground-subtle tracking-wider">
                      {a.type} &middot; DOWNLOAD
                    </p>
                  </Card>
                </a>
              ))}
            </div>
          </Container>
        </Section>

        {/* Contact */}
        <Section background="coral" className="!py-16 md:!py-24">
          <Container className="text-center">
            <h2
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              MEDIA ENQUIRIES
            </h2>
            <p className="text-off-white/80 max-w-lg mx-auto mb-8">
              For interviews, features, podcast guesting, and partnership
              enquiries — email directly. Most requests answered within 48
              hours.
            </p>
            <Button
              href="mailto:anthony@roadmancycling.com?subject=Press%20enquiry"
              size="lg"
              className="!bg-off-white !text-coral !shadow-none hover:!bg-off-white/90"
            >
              anthony@roadmancycling.com
            </Button>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
