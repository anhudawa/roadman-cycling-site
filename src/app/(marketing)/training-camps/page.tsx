import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { EvidenceBlock } from "@/components/seo/EvidenceBlock";
import { ENTITY_IDS } from "@/lib/brand-facts";
import { CAMP_LIST, formatCampDates } from "@/lib/camps/camps";
import { buildSearchOwnerTrustProperties } from "@/lib/seo/search-owner-schema";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: { absolute: "Cycling Training Camps in Girona — October 2026" },
  description:
    "Six-day road and gravel cycling camps in Girona, Spain. Two pace groups, follow car and coaching. October 2026, 16 riders, from €995.",
  keywords: [
    "cycling training camp",
    "cycling training camps",
    "cycling holiday Girona",
    "Girona cycling camp",
    "cycling holiday Spain",
    "road cycling camp Europe",
    "gravel cycling camp",
    "gravel camp Girona",
    "cycling camp October 2026",
    "Roadman training camp",
  ],
  alternates: {
    canonical: "https://roadmancycling.com/training-camps",
  },
  openGraph: {
    title: "Cycling Training Camps in Girona, Spain — October 2026",
    description:
      "Road and Gravel camps from a private Catalan farmhouse. Two pace groups, follow car, sixteen spots, Anthony in the group every day. €995 per camp.",
    type: "website",
    url: "https://roadmancycling.com/training-camps",
    images: [
      {
        url: "https://roadmancycling.com/images/camps/girona-onyar-houses.jpeg",
        alt: "Girona old town along the Onyar river — base of the Roadman cycling training camps",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cycling Training Camps in Girona — Roadman 2026",
    description:
      "Two six-day camps in Girona. Road and Gravel, back-to-back. Sixteen spots per camp, €995 each.",
  },
  robots: { index: true, follow: true },
};

const HERO_IMAGES = [
  "/images/camps/girona-onyar-houses.jpeg",
  "/images/camps/girona-bridge-view.jpeg",
];

const CAMP_CARD_IMAGES: Record<"road" | "gravel", string> = {
  road: "/images/camps/girona-road-landing.jpg",
  gravel: "/images/camps/girona-gravel-landing.webp",
};

const CAMP_GUIDES = [
  {
    href: "/blog/what-to-expect-cycling-training-camp",
    label: "First camp",
    title: "What a real training-camp week looks like",
  },
  {
    href: "/blog/cycling-training-camp-preparation-guide",
    label: "Before you travel",
    title: "How to prepare, train and pack",
  },
  {
    href: "/blog/cycling-training-camps-what-to-expect-guide",
    label: "Make it count",
    title: "How to structure the load and recovery",
  },
] as const;

function CampCardWrapper({
  soldOut,
  href,
  className,
  children,
}: {
  soldOut: boolean;
  href: string;
  className: string;
  children: ReactNode;
}) {
  return soldOut ? (
    <div className={className}>{children}</div>
  ) : (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export default function TrainingCampsLandingPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "@id": "https://roadmancycling.com/training-camps#webpage",
          name: "Cycling Training Camps in Girona — Roadman 2026",
          url: "https://roadmancycling.com/training-camps",
          description:
            "Road and gravel cycling training camps in Girona, October 2026. Led by Anthony Walsh from a private Catalan farmhouse. Sixteen riders per camp, two pace groups, follow car, €995 per camp.",
          ...buildSearchOwnerTrustProperties("cycling-training-camps"),
          about: {
            "@type": "Place",
            name: "Girona, Catalunya, Spain",
            geo: {
              "@type": "GeoCoordinates",
              latitude: 41.9794,
              longitude: 2.8214,
            },
          },
        }}
      />
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
              name: "Training Camps",
              item: "https://roadmancycling.com/training-camps",
            },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": CAMP_LIST.flatMap((c) => [
            {
              "@type": "Event",
              "@id": `https://roadmancycling.com${c.href}#event`,
              name: c.name,
              description: c.description,
              startDate: c.startDate,
              endDate: c.endDate,
              url: `https://roadmancycling.com${c.href}`,
              image: [`https://roadmancycling.com${c.heroImage}`],
              eventAttendanceMode:
                "https://schema.org/OfflineEventAttendanceMode",
              eventStatus: "https://schema.org/EventScheduled",
              location: {
                "@type": "Place",
                name: "Can Sagnari",
                address: {
                  "@type": "PostalAddress",
                  addressLocality: "Cornellà del Terri",
                  addressRegion: "Catalunya",
                  postalCode: "17844",
                  addressCountry: "ES",
                },
                geo: {
                  "@type": "GeoCoordinates",
                  latitude: 42.0867,
                  longitude: 2.8222,
                },
              },
              offers: {
                "@type": "Offer",
                price: String(c.pricePerPerson),
                priceCurrency: "EUR",
                availability: c.soldOut
                  ? "https://schema.org/SoldOut"
                  : "https://schema.org/InStock",
                url: `https://roadmancycling.com${c.href}`,
                validFrom: "2026-05-04",
                validThrough: c.startDate,
                category: "Cycling Training Camp",
              },
              organizer: { "@id": ENTITY_IDS.organization },
              performer: { "@id": ENTITY_IDS.person },
              maximumAttendeeCapacity: c.capacity,
            },
            {
              "@type": "TouristTrip",
              name: c.name,
              description: c.description,
              url: `https://roadmancycling.com${c.href}`,
              image: [`https://roadmancycling.com${c.heroImage}`],
              touristType: [
                "Cyclists",
                "Endurance athletes",
                "Recreational riders",
                c.type === "Road"
                  ? "Road cyclists"
                  : "Gravel cyclists",
              ],
              itinerary: {
                "@type": "ItemList",
                numberOfItems: 6,
                itemListOrder: "https://schema.org/ItemListOrderAscending",
              },
              offers: {
                "@type": "Offer",
                price: String(c.pricePerPerson),
                priceCurrency: "EUR",
                availability: c.soldOut
                  ? "https://schema.org/SoldOut"
                  : "https://schema.org/InStock",
                url: `https://roadmancycling.com${c.href}`,
                validFrom: "2026-05-04",
              },
              provider: { "@id": ENTITY_IDS.organization },
              subjectOf: {
                "@type": "Place",
                name: "Girona, Catalunya, Spain",
              },
            },
          ]),
        }}
      />

      <Header />

      <main id="main-content">
        {/* HERO ─────────────────────────────────────────────── */}
        <Section
          background="deep-purple"
          grain
          className="!pt-36 !pb-14 md:!pt-44 md:!pb-24 relative"
        >
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 1100px 700px at 50% 20%, rgba(76,18,115,0.55) 0%, transparent 60%), radial-gradient(ellipse 700px 450px at 50% 100%, rgba(241,99,99,0.10) 0%, transparent 70%)",
            }}
          />
          <Container className="relative">
            <ScrollReveal direction="up" eager>
              <p className="font-heading text-coral text-[11px] md:text-sm tracking-[0.35em] md:tracking-[0.4em] mb-5 md:mb-6 text-center">
                NEW FOR 2026 &middot; ROADMAN TRAINING CAMPS
              </p>
              <h1
                className="font-heading text-off-white leading-[0.95] mb-5 md:mb-6 text-center"
                style={{ fontSize: "clamp(3rem, 13vw, 6rem)" }}
              >
                CYCLING TRAINING CAMPS
                <br />
                <span className="text-coral">IN GIRONA.</span>
              </h1>
              <p
                className="text-foreground-muted mx-auto mb-8 md:mb-10 leading-relaxed font-light text-center"
                style={{
                  fontSize: "clamp(1.0625rem, 1.5vw, 1.375rem)",
                  maxWidth: "680px",
                }}
              >
                The first-ever Roadman camps. Two weeks in October at our
                private Catalan farmhouse — road first, then gravel. Sixteen
                riders per camp, and Anthony&apos;s in the group every day.
              </p>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.06}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-0 max-w-2xl mx-auto sm:rounded-xl sm:overflow-hidden sm:border sm:border-white/10 relative">
                {HERO_IMAGES.map((src) => (
                  <div
                    key={src}
                    className="relative aspect-[4/3] overflow-hidden rounded-xl sm:rounded-none border border-white/10 sm:border-0"
                  >
                    <Image
                      src={src}
                      alt="Girona — pro cycling capital of the world"
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
                      className="object-cover"
                      priority
                    />
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* CAMP CARDS ───────────────────────────────────────── */}
        <Section background="charcoal" className="!py-16 md:!py-28">
          <Container>
            <div className="max-w-5xl mx-auto mb-14 md:mb-20">
              <p className="text-foreground-muted text-center leading-relaxed max-w-3xl mx-auto mb-7">
                A cycling training camp is a supported multi-day training block,
                not just a holiday with rides. Roadman camps combine progressive
                routes, matched pace groups, follow-car support, on-bike fuelling,
                and planned recovery from one Girona base.
              </p>
              <div className="grid gap-3 md:grid-cols-3">
                {CAMP_GUIDES.map((guide) => (
                  <Link
                    key={guide.href}
                    href={guide.href}
                    className="group rounded-xl border border-white/10 bg-white/[0.03] p-5 hover:border-coral/40 hover:bg-coral/[0.06] transition-all"
                  >
                    <p className="font-heading text-[10px] tracking-[0.25em] uppercase text-coral mb-2">
                      {guide.label}
                    </p>
                    <p className="font-heading text-base text-off-white group-hover:text-coral transition-colors leading-snug">
                      {guide.title.toUpperCase()} →
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            <ScrollReveal direction="up">
              <p className="font-heading text-coral text-[11px] md:text-xs tracking-[0.35em] md:tracking-[0.4em] mb-4 text-center">
                PICK YOUR FORMAT
              </p>
              <h2
                className="font-heading text-off-white leading-[1.05] mb-3 text-center"
                style={{ fontSize: "clamp(2.125rem, 4vw, 3.25rem)" }}
              >
                TWO CAMPS. ONE BASE.
              </h2>
              <p className="text-foreground-muted text-center max-w-xl mx-auto leading-relaxed mb-10 md:mb-12 text-[15px] md:text-base">
                Same farmhouse, same team, two formats. Pick one — or stack
                both for ten days end-to-end with no flight in between.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {CAMP_LIST.map((camp, i) => {
                const isSoldOut = camp.soldOut === true;

                return (
                  <ScrollReveal key={camp.slug} direction="up" delay={i * 0.08}>
                    <CampCardWrapper
                      soldOut={isSoldOut}
                      href={camp.href}
                      className={`group block rounded-2xl border overflow-hidden transition-all ${
                        isSoldOut
                          ? "border-white/5 bg-white/[0.01] opacity-75 cursor-default"
                          : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-coral/40"
                      }`}
                    >
                      <div className="relative aspect-[4/3] sm:aspect-[16/10]">
                        <Image
                          src={CAMP_CARD_IMAGES[camp.slug]}
                          alt={`${camp.name} — Girona`}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className={`object-cover transition-transform duration-700 ${
                            isSoldOut ? "grayscale-[40%]" : "group-hover:scale-105"
                          }`}
                        />
                        <div
                          aria-hidden
                          className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/30 to-transparent"
                        />
                        {/* Type badge */}
                        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full backdrop-blur-sm font-heading text-xs tracking-[0.2em] ${
                          isSoldOut
                            ? "bg-white/20 text-white/70"
                            : "bg-coral/90 text-off-white"
                        }`}>
                          {camp.type.toUpperCase()}
                        </div>
                        {/* SOLD OUT banner — angled across the card image */}
                        {isSoldOut && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div
                              className="bg-deep-purple/90 backdrop-blur-sm py-3 px-16 font-heading text-off-white tracking-[0.3em] text-3xl sm:text-4xl md:text-5xl shadow-[0_4px_30px_rgba(0,0,0,0.5)] border-y-2 border-coral/60"
                              style={{ transform: "rotate(-12deg)" }}
                            >
                              SOLD OUT
                            </div>
                          </div>
                        )}
                        {/* Limited places badge for active camps */}
                        {!isSoldOut && (
                          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-coral backdrop-blur-sm text-off-white font-heading text-[10px] tracking-[0.2em] animate-pulse">
                            LIMITED PLACES
                          </div>
                        )}
                      </div>
                      <div className="p-5 sm:p-6 md:p-8">
                        <p className="font-heading text-foreground-subtle text-[11px] md:text-xs tracking-[0.3em] uppercase mb-3">
                          {formatCampDates(camp)}
                        </p>
                        <h3
                          className={`font-heading text-[2rem] sm:text-3xl md:text-4xl leading-[1.05] mb-4 transition-colors ${
                            isSoldOut
                              ? "text-foreground-subtle"
                              : "text-off-white group-hover:text-coral"
                          }`}
                        >
                          {camp.shortName.toUpperCase()}
                          <br />
                          CAMP.
                        </h3>
                        <p className="text-foreground-muted leading-relaxed mb-5 text-[15px] md:text-sm">
                          {camp.description}
                        </p>
                        <div className="flex items-center justify-between border-t border-white/10 pt-4">
                          <div>
                            {isSoldOut ? (
                              <>
                                <p className="font-heading text-foreground-subtle text-2xl line-through">
                                  €{camp.pricePerPerson}
                                </p>
                                <p className="text-coral text-[10px] tracking-[0.2em] uppercase mt-0.5 font-heading">
                                  SOLD OUT
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="font-heading text-off-white text-2xl">
                                  €{camp.pricePerPerson}
                                </p>
                                <p className="text-foreground-subtle text-[10px] tracking-[0.2em] uppercase mt-0.5">
                                  per person &middot; {camp.capacity} spots
                                </p>
                              </>
                            )}
                          </div>
                          {!isSoldOut && (
                            <span className="font-heading text-coral text-sm tracking-[0.2em] uppercase">
                              See camp →
                            </span>
                          )}
                        </div>
                      </div>
                    </CampCardWrapper>
                  </ScrollReveal>
                );
              })}
            </div>

            {/* BOTH CAMPS BUNDLE — hidden while road camp is sold out */}
          </Container>
        </Section>

        {/* WHY GIRONA ───────────────────────────────────────── */}
        <Section background="deep-purple" grain className="!py-16 md:!py-28">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12 lg:gap-16 items-center">
              <ScrollReveal direction="up">
                <p className="font-heading text-coral text-[11px] md:text-xs tracking-[0.35em] md:tracking-[0.4em] mb-4">
                  WHY GIRONA
                </p>
                <h2
                  className="font-heading text-off-white leading-[1.05] mb-5 md:mb-6"
                  style={{ fontSize: "clamp(2.125rem, 4vw, 3.25rem)" }}
                >
                  THE PLACE PROS MOVE TO.
                </h2>
                <p className="text-foreground-muted leading-relaxed mb-4 text-[15px] md:text-base">
                  More World Tour pros live in Girona than anywhere else on the
                  planet. They didn&apos;t pick it for the lifestyle — they
                  picked it because every road that leaves the city is good.
                  Long tempo climbs. Quiet back roads. Dirt that connects to
                  tarmac that connects to the coast.
                </p>
                <p className="text-foreground-muted leading-relaxed mb-4 text-[15px] md:text-base">
                  October is when it&apos;s at its best. Mid-twenties most
                  days. Vines turning. Empty roads after the August rush. Pool
                  at the house still warm enough to swim in after a ride.
                </p>
                <p className="text-foreground-muted leading-relaxed text-[15px] md:text-base">
                  We&apos;re running our first camps here because it&apos;s the
                  spot we&apos;d pick for ourselves. Same logic for everything
                  else — the farmhouse, the rides, the cafés. Sixteen of you,
                  three of us, the place we&apos;d go anyway.
                </p>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.05}>
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  {[
                    {
                      src: "/images/camps/girona-onyar-houses.jpeg",
                      alt: "Colourful houses lining the Onyar river in Girona",
                    },
                    {
                      src: "/images/camps/girona-bridge-view.jpeg",
                      alt: "View across a bridge over the Onyar river in Girona",
                    },
                    {
                      src: "/images/camps/girona-cathedral.jpeg",
                      alt: "Girona cathedral steps and old town stonework",
                    },
                    {
                      src: "/images/camps/girona-town-4.jpeg",
                      alt: "Narrow medieval streets in Girona's old quarter",
                    },
                  ].map(({ src, alt }) => (
                    <div
                      key={src}
                      className="relative aspect-[4/5] rounded-lg overflow-hidden border border-white/10"
                    >
                      <Image
                        src={src}
                        alt={alt}
                        fill
                        sizes="(max-width: 1024px) 50vw, 25vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </Container>
        </Section>

        {/* WHAT MAKES IT DIFFERENT ──────────────────────────── */}
        <Section background="charcoal" className="!py-16 md:!py-28">
          <Container>
            <ScrollReveal direction="up">
              <p className="font-heading text-coral text-[11px] md:text-xs tracking-[0.35em] md:tracking-[0.4em] mb-4 text-center">
                WHAT MAKES IT DIFFERENT
              </p>
              <h2
                className="font-heading text-off-white leading-[1.05] mb-10 md:mb-12 text-center"
                style={{ fontSize: "clamp(2.125rem, 4vw, 3.25rem)" }}
              >
                NOT A TOUR COMPANY.
                <br />
                <span className="text-coral">RIDING WITH YOUR MATES.</span>
              </h2>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
              {[
                {
                  n: "01",
                  t: "Anthony rides every day",
                  d: "No guide with a clipboard. Anthony rides one of the two groups every day, both camps. Sarah's on ops and in the saddle. Matthew runs the follow car. Three of us, sixteen of you.",
                },
                {
                  n: "02",
                  t: "Two groups, never dropped",
                  d: "Chill and Fast. We sort the groups on day one and adjust through the week. The follow car's on radio with both — nobody waits at the side of a Catalan back road.",
                },
                {
                  n: "03",
                  t: "Roads we'd ride anyway",
                  d: "Rocacorba. Els Àngels. The Ter river path. Les Gavarres. The roads you've watched on YouTube — ridden with the right people, the right coffee stops, and a car behind you carrying gels.",
                },
              ].map((item, i) => (
                <ScrollReveal key={item.n} direction="up" delay={i * 0.06}>
                  <div className="h-full rounded-xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 md:p-7 backdrop-blur-sm">
                    <p className="font-heading text-coral text-xs tracking-[0.3em] mb-3 md:mb-4">
                      {item.n}
                    </p>
                    <h3 className="font-heading text-off-white text-xl tracking-wide leading-snug mb-3">
                      {item.t.toUpperCase()}
                    </h3>
                    <p className="text-foreground-muted text-[15px] md:text-sm leading-relaxed">
                      {item.d}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* REVIEW + CLOSING CTA ─────────────────────────────── */}
        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <EvidenceBlock
              lastReviewed="24 August 2026"
              reviewedBy="Roadman Cycling operations and coaching team"
            />
          </Container>
        </Section>

        <Section background="deep-purple" grain className="!py-16 md:!py-28">
          <Container width="narrow" className="text-center">
            <ScrollReveal direction="up">
              <h2
                className="font-heading text-off-white leading-[1.05] mb-5 md:mb-6"
                style={{ fontSize: "clamp(2.125rem, 4vw, 3.25rem)" }}
              >
                GRAVEL CAMP.
                <br />
                <span className="text-coral">LIMITED PLACES.</span>
              </h2>
              <p className="text-foreground-muted leading-relaxed mb-8 md:mb-10 max-w-md mx-auto text-[15px] md:text-base">
                The road camp is sold out. Gravel still has places — pick your
                spot and book. Payment through Stripe, locked the moment it
                clears.
              </p>
              <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-center gap-3">
                <Link
                  href="/training-camps/girona-gravel#book"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 sm:py-3.5 rounded-md font-heading tracking-[0.15em] uppercase text-off-white bg-coral hover:bg-coral-hover transition-all shadow-[0_10px_30px_-12px_rgba(241,99,99,0.55)]"
                >
                  Book Girona Gravel →
                </Link>
                <span
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 sm:py-3.5 rounded-md font-heading tracking-[0.15em] uppercase text-foreground-subtle border border-white/10 cursor-default opacity-50"
                >
                  Road Camp — Sold Out
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
