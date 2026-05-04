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
    "Two five-day camps in Girona, October 2026. Road camp 13–17 October, Gravel camp 18–22 October. Led by Anthony Walsh, Sarah and Wes. Sixteen spots per camp. €995 all-in.",
  alternates: {
    canonical: "https://roadmancycling.com/training-camps",
  },
  openGraph: {
    title: "Roadman Training Camps — Girona, October 2026",
    description:
      "Two five-day camps in Girona. Road and Gravel. Led by Anthony, Sarah and Wes. Sixteen spots, €995 all-in.",
    type: "website",
    url: "https://roadmancycling.com/training-camps",
    images: [
      {
        url: "https://roadmancycling.com/images/camps/girona-river-houses.jpg",
        alt: "Girona old town along the Onyar river",
      },
    ],
  },
};

const HERO_IMAGES = [
  "/images/camps/girona-river-houses.jpg",
  "/images/camps/girona-cathedral-aerial.jpg",
];

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
            "Two five-day cycling camps in Girona, October 2026. Road and Gravel formats. Led by Anthony Walsh.",
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
          className="!pt-36 !pb-16 md:!pt-44 md:!pb-24 relative"
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
              <p className="font-heading text-coral text-xs md:text-sm tracking-[0.4em] mb-6 text-center">
                NEW FOR 2026 &middot; ROADMAN TRAINING CAMPS
              </p>
              <h1
                className="font-heading text-off-white leading-[1.0] mb-6 text-center"
                style={{ fontSize: "clamp(2.75rem, 8vw, 6rem)" }}
              >
                FIVE DAYS IN
                <br />
                <span className="text-coral">GIRONA.</span>
              </h1>
              <p
                className="text-foreground-muted mx-auto mb-10 leading-relaxed font-light text-center"
                style={{
                  fontSize: "clamp(1.0625rem, 1.5vw, 1.375rem)",
                  maxWidth: "660px",
                }}
              >
                The first-ever Roadman camps. Two five-day weeks at our private
                farmhouse base, October 2026. Road, then gravel, back to back.
                Sixteen spots each.
              </p>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.06}>
              <div className="grid grid-cols-2 max-w-2xl mx-auto rounded-xl overflow-hidden border border-white/10 relative">
                {HERO_IMAGES.map((src) => (
                  <div
                    key={src}
                    className="relative aspect-[4/3] overflow-hidden"
                  >
                    <Image
                      src={src}
                      alt="Girona — pro cycling capital of the world"
                      fill
                      sizes="(max-width: 768px) 50vw, 360px"
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
        <Section background="charcoal" className="!py-20 md:!py-28">
          <Container>
            <ScrollReveal direction="up">
              <p className="font-heading text-coral text-xs tracking-[0.4em] mb-4 text-center">
                PICK YOUR FORMAT
              </p>
              <h2
                className="font-heading text-off-white leading-[1.05] mb-3 text-center"
                style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)" }}
              >
                TWO CAMPS, BACK TO BACK.
              </h2>
              <p className="text-foreground-muted text-center max-w-xl mx-auto leading-relaxed mb-12">
                Same farmhouse, same team, two formats. Pick one. Or do both —
                ten days, no airport transfer in between.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {CAMP_LIST.map((camp, i) => (
                <ScrollReveal key={camp.slug} direction="up" delay={i * 0.08}>
                  <Link
                    href={camp.href}
                    className="group block rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-coral/40 transition-all overflow-hidden"
                  >
                    <div className="relative aspect-[16/10]">
                      <Image
                        src={
                          camp.slug === "road"
                            ? "/images/camps/girona-cathedral-walls.jpg"
                            : "/images/camps/girona-old-town.jpg"
                        }
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
                    <div className="p-6 md:p-8">
                      <p className="font-heading text-foreground-subtle text-xs tracking-[0.3em] uppercase mb-3">
                        {formatCampDates(camp)}
                      </p>
                      <h3
                        className="font-heading text-off-white text-3xl md:text-4xl leading-[1.05] mb-4 group-hover:text-coral transition-colors"
                      >
                        {camp.shortName.toUpperCase()}
                        <br />
                        CAMP.
                      </h3>
                      <p className="text-foreground-muted leading-relaxed mb-5 text-sm">
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
          </Container>
        </Section>

        {/* WHY GIRONA ───────────────────────────────────────── */}
        <Section background="deep-purple" grain className="!py-20 md:!py-28">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <ScrollReveal direction="up">
                <p className="font-heading text-coral text-xs tracking-[0.4em] mb-4">
                  WHY GIRONA
                </p>
                <h2
                  className="font-heading text-off-white leading-[1.05] mb-6"
                  style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)" }}
                >
                  THE PLACE PROS MOVE TO.
                </h2>
                <p className="text-foreground-muted leading-relaxed mb-4">
                  More World Tour pros live in Girona than anywhere else on the
                  planet. They didn&apos;t pick it for the lifestyle — they picked
                  it because every road that leaves the city is good. Long
                  tempo climbs, quiet roads, dirt that connects to tarmac that
                  connects to the coast.
                </p>
                <p className="text-foreground-muted leading-relaxed mb-4">
                  October is when Girona is at its best. Vines turning, low
                  traffic, mid-twenties most days, sea still warm enough to swim
                  in if you fancy it after a ride.
                </p>
                <p className="text-foreground-muted leading-relaxed">
                  We&apos;re running our first camps here because it&apos;s the spot
                  we&apos;d pick for ourselves. Same logic for everything else this
                  week — the house, the rides, the coffee stops. We&apos;re going
                  where we&apos;d go anyway, and bringing sixteen people with us.
                </p>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.05}>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "/images/camps/girona-river-houses.jpg",
                    "/images/camps/girona-old-town.jpg",
                    "/images/camps/girona-cathedral-walls.jpg",
                    "/images/camps/girona-cathedral-aerial.jpg",
                  ].map((src) => (
                    <div
                      key={src}
                      className="relative aspect-[4/5] rounded-lg overflow-hidden border border-white/10"
                    >
                      <Image
                        src={src}
                        alt="Girona old town"
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
        <Section background="charcoal" className="!py-20 md:!py-28">
          <Container>
            <ScrollReveal direction="up">
              <p className="font-heading text-coral text-xs tracking-[0.4em] mb-4 text-center">
                WHAT MAKES IT DIFFERENT
              </p>
              <h2
                className="font-heading text-off-white leading-[1.05] mb-12 text-center"
                style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)" }}
              >
                NOT A TOUR COMPANY.
                <br />
                <span className="text-coral">RIDING WITH YOUR MATES.</span>
              </h2>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 max-w-5xl mx-auto">
              {[
                {
                  n: "01",
                  t: "Anthony rides every day",
                  d: "Not a guide and a clipboard. Anthony rides one of the two groups every day, both camps. Sarah handles ops and rides. Wes is on support. Three of us, sixteen of you.",
                },
                {
                  n: "02",
                  t: "Two groups, never dropped",
                  d: "Chill and Fast. We sort the groups on day one and adjust through the week. The follow car is in radio contact with both — nobody waits at the side of a Catalan back road.",
                },
                {
                  n: "03",
                  t: "Roads we'd ride anyway",
                  d: "Rocacorba. Els Àngels. The Ter river path. The Gavarres forest. The roads in your training plan, but with the right people, the right coffee stops, and the follow car carrying gels.",
                },
              ].map((item, i) => (
                <ScrollReveal key={item.n} direction="up" delay={i * 0.06}>
                  <div className="h-full rounded-xl border border-white/10 bg-white/[0.02] p-6 md:p-7 backdrop-blur-sm">
                    <p className="font-heading text-coral text-xs tracking-[0.3em] mb-4">
                      {item.n}
                    </p>
                    <h3 className="font-heading text-off-white text-xl tracking-wide leading-snug mb-3">
                      {item.t.toUpperCase()}
                    </h3>
                    <p className="text-foreground-muted text-sm leading-relaxed">
                      {item.d}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* CLOSING CTA ──────────────────────────────────────── */}
        <Section background="deep-purple" grain className="!py-20 md:!py-28">
          <Container width="narrow" className="text-center">
            <ScrollReveal direction="up">
              <h2
                className="font-heading text-off-white leading-[1.05] mb-6"
                style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)" }}
              >
                SIXTEEN SPOTS.
                <br />
                <span className="text-coral">FIRST-COME.</span>
              </h2>
              <p className="text-foreground-muted leading-relaxed mb-10 max-w-md mx-auto">
                Pick your format and reserve a spot. Anthony writes back inside
                48 hours with the payment link.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {CAMP_LIST.map((c) => (
                  <Link
                    key={c.slug}
                    href={c.href}
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-md font-heading tracking-[0.15em] uppercase text-off-white bg-coral hover:bg-coral-hover transition-all shadow-[0_10px_30px_-12px_rgba(241,99,99,0.55)]"
                  >
                    Book {c.shortName}
                  </Link>
                ))}
              </div>
            </ScrollReveal>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
