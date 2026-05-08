import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { CAMP_LIST, formatCampDates } from "@/lib/camps/camps";

export const metadata: Metadata = {
  title: "Roadman Training Camps — Girona, October 2026",
  description:
    "Two six-day camps in Girona, October 2026. Road 10–15 October, Gravel 16–21 October. Sixteen riders per camp, Anthony in the group every day. €995 per camp, or €1,700 for both back-to-back.",
  alternates: {
    canonical: "https://roadmancycling.com/training-camps",
  },
  openGraph: {
    title: "Roadman Training Camps — Girona, October 2026",
    description:
      "Two six-day camps in Girona. Road and Gravel, back-to-back. Anthony, Sarah and Matthew on hand all week. Sixteen spots, €995 per camp, €1,700 for both.",
    type: "website",
    url: "https://roadmancycling.com/training-camps",
    images: [
      {
        url: "https://roadmancycling.com/images/camps/girona-onyar-houses.jpeg",
        alt: "Girona old town along the Onyar river",
      },
    ],
  },
};

const HERO_IMAGES = [
  "/images/camps/girona-onyar-houses.jpeg",
  "/images/camps/girona-bridge-view.jpeg",
];

const CAMP_CARD_IMAGES: Record<"road" | "gravel", string> = {
  road: "/images/camps/girona-road-landing.jpg",
  gravel: "/images/camps/girona-gravel-landing.webp",
};

const BUNDLE_PRICE = 1700;
const BUNDLE_SAVINGS = 995 * 2 - BUNDLE_PRICE; // €290

export default function TrainingCampsLandingPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Roadman Training Camps — Girona 2026",
          url: "https://roadmancycling.com/training-camps",
          description:
            "Two six-day cycling camps in Girona, October 2026. Road and Gravel formats. Led by Anthony Walsh.",
          isPartOf: { "@id": "https://roadmancycling.com#website" },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": CAMP_LIST.map((c) => ({
            "@type": "Event",
            name: c.name,
            description: c.description,
            startDate: c.startDate,
            endDate: c.endDate,
            url: `https://roadmancycling.com${c.href}`,
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
                addressCountry: "ES",
              },
            },
            offers: {
              "@type": "Offer",
              price: String(c.pricePerPerson),
              priceCurrency: "EUR",
              availability: "https://schema.org/InStock",
              url: `https://roadmancycling.com${c.href}`,
              validFrom: "2026-05-04",
            },
            organizer: {
              "@type": "Organization",
              name: "Roadman Cycling",
              url: "https://roadmancycling.com",
            },
            performer: { "@type": "Person", name: "Anthony Walsh" },
            maximumAttendeeCapacity: c.capacity,
          })),
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
                SIX DAYS IN
                <br />
                <span className="text-coral">GIRONA.</span>
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
              {CAMP_LIST.map((camp, i) => (
                <ScrollReveal key={camp.slug} direction="up" delay={i * 0.08}>
                  <Link
                    href={camp.href}
                    className="group block rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-coral/40 transition-all overflow-hidden"
                  >
                    <div className="relative aspect-[4/3] sm:aspect-[16/10]">
                      <Image
                        src={CAMP_CARD_IMAGES[camp.slug]}
                        alt={`${camp.name} — Girona`}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div
                        aria-hidden
                        className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/30 to-transparent"
                      />
                      <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-coral/90 backdrop-blur-sm text-off-white font-heading text-xs tracking-[0.2em]">
                        {camp.type.toUpperCase()}
                      </div>
                    </div>
                    <div className="p-5 sm:p-6 md:p-8">
                      <p className="font-heading text-foreground-subtle text-[11px] md:text-xs tracking-[0.3em] uppercase mb-3">
                        {formatCampDates(camp)}
                      </p>
                      <h3
                        className="font-heading text-off-white text-[2rem] sm:text-3xl md:text-4xl leading-[1.05] mb-4 group-hover:text-coral transition-colors"
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
                          <p className="font-heading text-off-white text-2xl">
                            €{camp.pricePerPerson}
                          </p>
                          <p className="text-foreground-subtle text-[10px] tracking-[0.2em] uppercase mt-0.5">
                            per person &middot; {camp.capacity} spots
                          </p>
                        </div>
                        <span className="font-heading text-coral text-sm tracking-[0.2em] uppercase">
                          See camp →
                        </span>
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>

            {/* BOTH CAMPS BUNDLE ──────────────────────────────── */}
            <ScrollReveal direction="up" delay={0.16}>
              <div className="mt-6 md:mt-8 rounded-2xl border border-coral/40 bg-gradient-to-br from-coral/[0.07] to-transparent p-5 sm:p-6 md:p-8 backdrop-blur-sm flex flex-col md:flex-row md:items-center md:justify-between gap-5 md:gap-6">
                <div className="md:max-w-xl">
                  <p className="font-heading text-coral text-[11px] md:text-xs tracking-[0.3em] mb-3">
                    SAVE €{BUNDLE_SAVINGS} &middot; BOTH CAMPS
                  </p>
                  <h3 className="font-heading text-off-white text-2xl md:text-3xl leading-tight mb-3">
                    DO BOTH WEEKS BACK-TO-BACK.
                  </h3>
                  <p className="text-foreground-muted text-[15px] md:text-sm leading-relaxed">
                    Ten days. Two formats. Same farmhouse, no airport transfer
                    in between. €{BUNDLE_PRICE.toLocaleString("en-IE")} for the
                    pair — €{BUNDLE_SAVINGS} less than booking each camp on its
                    own.
                  </p>
                </div>
                <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto">
                  <p className="font-heading text-off-white text-3xl md:text-4xl leading-none">
                    €{BUNDLE_PRICE.toLocaleString("en-IE")}
                  </p>
                  <p className="text-foreground-subtle text-[10px] tracking-[0.2em] uppercase">
                    Both Camps &middot; per person
                  </p>
                  <Link
                    href="/training-camps/girona-road#book"
                    className="mt-3 md:mt-2 w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md font-heading tracking-[0.15em] uppercase text-off-white bg-coral hover:bg-coral-hover transition-all text-sm shadow-[0_10px_30px_-12px_rgba(241,99,99,0.55)]"
                  >
                    Book Both →
                  </Link>
                </div>
              </div>
            </ScrollReveal>
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

        {/* CLOSING CTA ──────────────────────────────────────── */}
        <Section background="deep-purple" grain className="!py-16 md:!py-28">
          <Container width="narrow" className="text-center">
            <ScrollReveal direction="up">
              <h2
                className="font-heading text-off-white leading-[1.05] mb-5 md:mb-6"
                style={{ fontSize: "clamp(2.125rem, 4vw, 3.25rem)" }}
              >
                SIXTEEN SPOTS.
                <br />
                <span className="text-coral">FIRST-COME.</span>
              </h2>
              <p className="text-foreground-muted leading-relaxed mb-8 md:mb-10 max-w-md mx-auto text-[15px] md:text-base">
                Pick your format and book. Payment is taken in full through
                Stripe — your spot is locked the moment it clears.
              </p>
              <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-center gap-3">
                {CAMP_LIST.map((c) => (
                  <Link
                    key={c.slug}
                    href={`${c.href}#book`}
                    className="inline-flex items-center justify-center gap-2 px-7 py-4 sm:py-3.5 rounded-md font-heading tracking-[0.15em] uppercase text-off-white bg-coral hover:bg-coral-hover transition-all shadow-[0_10px_30px_-12px_rgba(241,99,99,0.55)]"
                  >
                    Book {c.shortName}
                  </Link>
                ))}
                <Link
                  href="/training-camps/girona-road#book"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 sm:py-3.5 rounded-md font-heading tracking-[0.15em] uppercase text-off-white border border-coral/60 hover:bg-coral/10 transition-all"
                >
                  Book Both &middot; €{BUNDLE_PRICE.toLocaleString("en-IE")}
                </Link>
              </div>
            </ScrollReveal>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
