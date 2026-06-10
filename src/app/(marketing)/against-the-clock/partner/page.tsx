import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { BRAND_STATS, ENTITY_IDS, FOUNDER, SITE_ORIGIN } from "@/lib/brand-facts";

const PAGE_URL = `${SITE_ORIGIN}/against-the-clock/partner`;
const SERIES_ID = `${SITE_ORIGIN}/entity/against-the-clock#series`;
const ENTITY_URL = `${SITE_ORIGIN}/entity/against-the-clock`;

const KIT_DESCRIPTION =
  "Against the Clock is Roadman Cycling's cycling × horology property — the place where the sport's oldest obsession meets fine watchmaking. A partnership platform built for watch brands who want to reach an audience of 35–55 professional men who already live at the intersection of precision, performance, and time.";

const CONTACT_HREF =
  "mailto:anthony@roadmancycling.com?subject=Against%20the%20Clock%20partnership%20enquiry";

export const metadata: Metadata = {
  title: "Against the Clock — Watch Brand Partnerships | Roadman Cycling",
  description:
    "Partner with Against the Clock, Roadman Cycling's cycling × horology property. Reach 35–55 professional men through a 100M+ download podcast. Title sponsor, episode sponsor, and product placement.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Against the Clock — Watch Brand Partnerships | Roadman Cycling",
    description:
      "A cycling × horology partnership platform for watch brands. Reach an audience of professional men who care about precision, craft, and time.",
    type: "website",
    url: PAGE_URL,
  },
};

/* ------------------------------------------------------------------ */
/*  Audience — qualitative demographic framing (no invented numbers)   */
/* ------------------------------------------------------------------ */

const audience = [
  {
    label: "AGE 35–55",
    body:
      "The core Roadman listener sits squarely inside a watch brand's prime acquisition window — old enough to buy considered, young enough to keep buying.",
  },
  {
    label: "PROFESSIONAL MEN",
    body:
      "Predominantly male, in serious careers — doctors, engineers, founders, finance. Time-crunched professionals who reward precision and afford quality.",
  },
  {
    label: "CONSIDERED SPENDERS",
    body:
      "Riders who think nothing of four figures on a wheelset, a power meter, or a bike fit. They buy quality once and keep it for a decade.",
  },
  {
    label: "PRECISION & LONGEVITY",
    body:
      "\"Not Done Yet\" — an audience obsessed with marginal gains, craft, and objects built to last. The exact values a fine watch is sold on.",
  },
];

/* ------------------------------------------------------------------ */
/*  Reach — canonical figures only, pulled from brand-facts            */
/* ------------------------------------------------------------------ */

const reach = [
  {
    stat: BRAND_STATS.podcastDownloadsLabel,
    label: "Podcast downloads",
    detail: "Lifetime, across Spotify, Apple Podcasts, YouTube and every podcast platform.",
  },
  {
    stat: BRAND_STATS.episodeCountLabel,
    label: "Episodes published",
    detail: "Long-form interviews with World Tour coaches, scientists and pro riders.",
  },
  {
    stat: BRAND_STATS.youtubeSubscribersLabel,
    label: "YouTube subscribers",
    detail: "Full-length video episodes and clips on the main channel.",
  },
  {
    stat: BRAND_STATS.newsletterSubscribersLabel,
    label: "Newsletter subscribers",
    detail: "The Saturday Spin — a weekly performance digest with a 65%+ open rate.",
  },
  {
    stat: BRAND_STATS.instagramFollowersLabel,
    label: "Instagram followers",
    detail: "@roadman.cycling — behind-the-scenes, clips, and community.",
  },
  {
    stat: BRAND_STATS.communityMembersLabel,
    label: "Community members",
    detail: "The free Roadman Clubhouse on Skool — the engaged inner audience.",
  },
];

/* ------------------------------------------------------------------ */
/*  What the property covers                                           */
/* ------------------------------------------------------------------ */

const scope = [
  {
    number: "01",
    title: "The Hour Record",
    body:
      "Cycling's purest test against time — the furthest a rider can travel in sixty minutes on a velodrome. Contested since the 1890s and revered for stripping the sport down to power, aerodynamics, and the clock.",
  },
  {
    number: "02",
    title: "The race of truth",
    body:
      "The individual time trial — contre la montre, literally \"against the watch.\" No teammates, no wheel to sit on. The time you post is the exact, un-negotiable measure of the day.",
  },
  {
    number: "03",
    title: "The watch on the wrist",
    body:
      "The chronograph and the time trial were built for the same job: measuring exactly how long something took. A property that runs from the velodrome to the watch on a rider's wrist — and the brands that put it there.",
  },
];

const surfaces = [
  "The flagship feature and the Against the Clock hub on roadmancycling.com",
  "Themed long-form podcast episodes — audio and on-camera video",
  "The Saturday Spin newsletter and social channels",
  "Evergreen, search-indexed pages that keep working long after a campaign ends",
];

/* ------------------------------------------------------------------ */
/*  Production quality — grounded in the real body of work            */
/* ------------------------------------------------------------------ */

const production = [
  {
    label: "ON-CAMERA STUDIO",
    body: `${BRAND_STATS.videoEpisodesLabel} episodes filmed for video, not just recorded for audio. A consistent studio look that frames a timepiece the way it deserves to be seen.`,
  },
  {
    label: "WORLD TOUR ACCESS",
    body:
      "Guests the rest of cycling media cannot book — World Tour coaches, sports scientists, and Grand Tour riders. Your brand sits inside conversations that carry real authority.",
  },
  {
    label: "LONG-FORM CRAFT",
    body:
      "Hour-long interviews edited with care, not churned. The pacing and detail a considered audience expects — and the room to tell a brand story properly.",
  },
  {
    label: "EDITORIAL STANDARDS",
    body:
      "Every claim sourced and fact-checked to a published editorial standard. A partner brand is associated with credibility, not hype.",
  },
  {
    label: "MULTI-FORMAT MASTERS",
    body:
      "One shoot becomes a long-form episode, social cuts, newsletter features, and an evergreen page — your placement worked across formats, not spent in a single slot.",
  },
  {
    label: "OWN-CHANNEL RIGHTS",
    body:
      "Usage rights to the assets we create together, cleared for your own website, social, and retail screens. The work keeps earning on your channels too.",
  },
];

/* ------------------------------------------------------------------ */
/*  Partnership tiers                                                  */
/* ------------------------------------------------------------------ */

const tiers = [
  {
    name: "Title Sponsor",
    tagline: "Against the Clock, presented by your brand.",
    featured: true,
    includes: [
      "Naming integration across the whole property — hub, feature, and episodes",
      "Brand woven into the editorial narrative of cycling and time",
      "Premium placement in podcast, newsletter, and social",
      "Co-created content built around your collection",
    ],
  },
  {
    name: "Episode Sponsor",
    tagline: "Own a single moment against the clock.",
    featured: false,
    includes: [
      "Host-read integration in a themed Against the Clock episode",
      "Show-notes placement with a tracked link",
      "A dedicated social clip cut from the episode",
      "Newsletter mention to 30,000+ subscribers",
    ],
  },
  {
    name: "Product Placement",
    tagline: "A watch on the wrist, on camera.",
    featured: false,
    includes: [
      "Your timepiece styled into video episodes and photography",
      "Wrist-shots and detail framing in the cycling-and-time narrative",
      "Natural, non-interruptive brand presence",
      "Usage rights for your own channels",
    ],
  },
];

export default function AgainstTheClockPartnerPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "Against the Clock — Watch Brand Partnerships",
          url: PAGE_URL,
          description: KIT_DESCRIPTION,
          isPartOf: { "@id": ENTITY_IDS.website },
          publisher: { "@id": ENTITY_IDS.organization },
          mainEntity: { "@id": SERIES_ID },
          about: [{ "@id": SERIES_ID }, { "@id": ENTITY_IDS.organization }],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
            { "@type": "ListItem", position: 2, name: "Against the Clock", item: ENTITY_URL },
            { "@type": "ListItem", position: 3, name: "Partnerships", item: PAGE_URL },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <p className="text-coral font-heading text-sm tracking-widest mb-4">
                PARTNERSHIPS · CYCLING × HOROLOGY
              </p>
              <h1
                className="font-heading text-off-white mb-6"
                style={{ fontSize: "var(--text-hero)" }}
              >
                AGAINST THE CLOCK
                <br />
                <span className="text-coral">FOR WATCH BRANDS</span>
              </h1>
              <p className="text-off-white text-xl leading-relaxed mb-6">
                {KIT_DESCRIPTION}
              </p>
              <p className="text-foreground-muted leading-relaxed">
                Explore the property itself on the{" "}
                <Link href="/entity/against-the-clock" className="text-coral hover:underline">
                  Against the Clock entity page
                </Link>{" "}
                and the flagship feature{" "}
                <Link href="/blog/against-the-clock-cycling-watches" className="text-coral hover:underline">
                  Cycling, Watches, and the Oldest Obsession in the Sport
                </Link>
                .
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <Button href={CONTACT_HREF} size="lg" dataTrack="atc_partner_hero_contact">
                  Start a Conversation
                </Button>
                <Button href="#tiers" variant="ghost" size="lg">
                  See Partnership Tiers
                </Button>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* The fit */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2 className="font-heading text-2xl text-off-white tracking-wide mb-6">
                WHY A WATCH BRAND BELONGS HERE
              </h2>
              <div className="space-y-4 text-foreground-muted leading-relaxed">
                <p>
                  Cycling is the only sport that names its hardest discipline after a
                  watch. <span className="text-off-white">Contre la montre</span> — against
                  the clock. From Henri Desgrange&apos;s first Hour in 1893 to the carbon-and-aero
                  machines of today, the sport has always measured itself in seconds.
                </p>
                <p>
                  The audience that obsesses over those seconds is the same audience
                  that obsesses over a movement, a complication, a case finished by hand.
                  Precision, craft, and objects built to last — a watch brand and the
                  Roadman audience are sold on exactly the same values.
                </p>
                <p>
                  Against the Clock is where we tell that story. A partnership puts your
                  brand inside it — not as an ad break, but as part of the narrative.
                </p>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Audience */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up" className="mb-8">
              <h2 className="font-heading text-2xl text-off-white tracking-wide mb-3">
                THE AUDIENCE
              </h2>
              <p className="text-foreground-muted leading-relaxed">
                Serious amateur cyclists who treat the sport like a craft. The exact
                demographic the watch world spends fortunes trying to reach.
              </p>
            </ScrollReveal>
            <div className="grid sm:grid-cols-2 gap-4">
              {audience.map((a) => (
                <Card key={a.label} className="p-6" hoverable={false}>
                  <p className="font-heading text-coral tracking-widest text-sm mb-2">
                    {a.label}
                  </p>
                  <p className="text-sm text-foreground-muted leading-relaxed">{a.body}</p>
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        {/* Reach */}
        <Section background="charcoal">
          <Container>
            <ScrollReveal direction="up" className="text-center mb-12">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                THE REACH
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto">
                The Roadman Cycling Podcast is the largest cycling performance podcast
                in the world. Every figure below is the canonical, verified number.
              </p>
            </ScrollReveal>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {reach.map((s, i) => (
                <ScrollReveal key={s.label} direction="up" delay={i * 0.06}>
                  <Card className="p-6 text-center h-full" glass hoverable={false}>
                    <p className="font-heading text-4xl md:text-5xl text-coral mb-2">
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

        {/* Content scope — uses brand purple #4C1273 */}
        <Section background="purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up" className="mb-8">
              <h2 className="font-heading text-2xl text-off-white tracking-wide mb-3">
                WHAT THE PROPERTY COVERS
              </h2>
              <p className="text-off-white/75 leading-relaxed">
                Three threads run through everything we make against the clock — and a
                partner brand can live across all of them.
              </p>
            </ScrollReveal>
            <div className="space-y-3">
              {scope.map((f) => (
                <Card key={f.number} className="p-6" hoverable={false}>
                  <div className="flex items-start gap-4">
                    <span className="font-heading text-2xl text-coral shrink-0">
                      {f.number}
                    </span>
                    <div className="flex-1">
                      <p className="font-heading text-off-white tracking-wide mb-2">
                        {f.title.toUpperCase()}
                      </p>
                      <p className="text-sm text-foreground-muted leading-relaxed">
                        {f.body}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <ScrollReveal direction="up" className="mt-8">
              <p className="font-heading text-off-white tracking-widest text-sm mb-4">
                WHERE IT RUNS
              </p>
              <ul className="space-y-3">
                {surfaces.map((s) => (
                  <li
                    key={s}
                    className="flex items-start gap-3 text-off-white/80 leading-relaxed"
                  >
                    <span className="text-coral mt-1 shrink-0">—</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Partnership tiers */}
        <Section background="charcoal" id="tiers">
          <Container>
            <ScrollReveal direction="up" className="text-center mb-12">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                PARTNERSHIP TIERS
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto">
                Three ways to come in. Combine them, or let us build something bespoke
                around your launch calendar.
              </p>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {tiers.map((t, i) => (
                <ScrollReveal key={t.name} direction="up" delay={i * 0.08} className="h-full">
                  <Card
                    className={`p-7 h-full flex flex-col ${
                      t.featured ? "border-2 border-coral" : ""
                    }`}
                    hoverable={false}
                  >
                    {t.featured && (
                      <p className="font-heading text-coral text-xs tracking-widest mb-3">
                        FLAGSHIP
                      </p>
                    )}
                    <h3 className="font-heading text-xl text-off-white mb-1">
                      {t.name.toUpperCase()}
                    </h3>
                    <p className="text-sm text-coral mb-5">{t.tagline}</p>
                    <ul className="space-y-3 mb-6 flex-1">
                      {t.includes.map((inc) => (
                        <li
                          key={inc}
                          className="flex items-start gap-3 text-sm text-foreground-muted leading-relaxed"
                        >
                          <span className="text-coral mt-0.5 shrink-0">→</span>
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-foreground-subtle font-heading tracking-widest pt-4 border-t border-white/10">
                      PRICING ON ENQUIRY
                    </p>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Production quality */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up" className="mb-8">
              <h2 className="font-heading text-2xl text-off-white tracking-wide mb-3">
                PRODUCTION QUALITY
              </h2>
              <p className="text-foreground-muted leading-relaxed">
                A property is only worth your name if it is made to your
                standard. Here is how Against the Clock is built.
              </p>
            </ScrollReveal>
            <div className="grid sm:grid-cols-2 gap-4">
              {production.map((p) => (
                <Card key={p.label} className="p-6" hoverable={false}>
                  <p className="font-heading text-coral tracking-widest text-sm mb-2">
                    {p.label}
                  </p>
                  <p className="text-sm text-foreground-muted leading-relaxed">{p.body}</p>
                </Card>
              ))}
            </div>
            <ScrollReveal direction="up" className="mt-8 text-center">
              <Button href="/against-the-clock/partner/one-pager" variant="ghost" size="md">
                Download the One-Pager
              </Button>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Contact CTA */}
        <Section background="coral" className="!py-16 md:!py-24">
          <Container className="text-center">
            <h2
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              PUT YOUR BRAND ON THE WRIST
            </h2>
            <p className="text-off-white/80 max-w-lg mx-auto mb-8">
              Tell us about your brand and where you want to be by next season. We&apos;ll
              come back with a tailored plan, real availability, and pricing — most
              enquiries answered within 48 hours.
            </p>
            <Button
              href={CONTACT_HREF}
              size="lg"
              className="!bg-off-white !text-coral !shadow-none hover:!bg-off-white/90"
              dataTrack="atc_partner_footer_contact"
            >
              {FOUNDER.email}
            </Button>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
