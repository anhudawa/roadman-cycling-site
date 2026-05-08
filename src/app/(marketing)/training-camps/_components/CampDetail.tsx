import Image from "next/image";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { ScrollReveal } from "@/components/ui";
import { JsonLd, FAQPageJsonLd } from "@/components/seo/JsonLd";
import { CAMPS, formatCampDates, type CampConfig } from "@/lib/camps/camps";
import { ITINERARIES } from "@/lib/camps/itineraries";
import { CAMP_FAQS } from "@/lib/camps/faqs";
import { GIRONA_ROUTE_LIST } from "@/lib/girona/routes";
import { Itinerary } from "./Itinerary";
import { FAQ } from "./FAQ";
import { BookingForm } from "./BookingForm";

interface Props {
  camp: CampConfig;
}

const CAN_SAGNARI_GALLERY = [
  {
    src: "/images/camps/can-sagnari-pool.png",
    alt: "Can Sagnari farmhouse — Roadman cycling camp pool, open year-round, near Girona",
  },
  {
    src: "/images/camps/can-sagnari-interior.png",
    alt: "Can Sagnari farmhouse — stone-walled interior lounge, Roadman cycling camp base near Girona",
  },
  {
    src: "/images/camps/can-sagnari-exterior.png",
    alt: "Can Sagnari — the 1749 Catalan stone farmhouse, base for the Roadman cycling training camps in Girona",
  },
  {
    src: "/images/camps/can-sagnari-aerial.png",
    alt: "Aerial view of Can Sagnari farmhouse and pool — Roadman cycling camp base, Cornellà del Terri, Girona",
  },
];

const GIRONA_GALLERY = [
  {
    src: "/images/camps/girona-onyar-houses.jpeg",
    alt: "Coloured houses along the Onyar river in Girona old town — Europe's pro cycling capital",
  },
  {
    src: "/images/camps/girona-bridge-view.jpeg",
    alt: "The Eiffel bridge over the Onyar in Girona — postcard view of the cycling base city",
  },
  {
    src: "/images/camps/girona-cathedral.jpeg",
    alt: "Girona cathedral tower above the old town — the cycling capital of Catalonia, Spain",
  },
  {
    src: "/images/camps/girona-town-5.jpeg",
    alt: "Stone streets of Girona old town — base of the Roadman cycling training camps",
  },
];

const INCLUDED = [
  "5 nights at Can Sagnari, our private 1749 farmhouse",
  "Breakfast every morning at the house",
  "6 fully guided rides — two pace groups, never dropped",
  "Follow car the whole week — spares, support, mechanicals covered",
  "In-ride nutrition every day — gels, bars, drink mix",
  "Airport transfers from Girona–Costa Brava (GRO), both ways",
  "Anthony, Sarah and Matthew hosting it all",
];

const NOT_INCLUDED = [
  "Flights — fly into Girona (GRO) or Barcelona (BCN)",
  "Travel insurance — required, sort it before you fly",
  "Lunches and dinners — €15–25 per meal, eaten out",
  "Hire bike — we can help you source a hire bike",
  "Single-room supplement (+€200) — optional, otherwise we pair you up",
];

export function CampDetail({ camp }: Props) {
  const days = ITINERARIES[camp.slug];
  const totalDistance = days.reduce(
    (acc, d) => acc + parseInt(d.distance.replace(/\D/g, ""), 10) || 0,
    0,
  );
  const otherCamp = camp.slug === "road" ? CAMPS.gravel : CAMPS.road;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Event",
          name: camp.name,
          description: camp.description,
          startDate: camp.startDate,
          endDate: camp.endDate,
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          eventStatus: "https://schema.org/EventScheduled",
          location: {
            "@type": "Place",
            name: "Can Sagnari, Girona",
            address: {
              "@type": "PostalAddress",
              streetAddress: "Cornellà del Terri",
              addressLocality: "Girona",
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
            price: String(camp.pricePerPerson),
            priceCurrency: "EUR",
            availability: "https://schema.org/InStock",
            url: `https://roadmancycling.com${camp.href}`,
            validFrom: "2026-05-04",
            validThrough: camp.startDate,
            category: "Cycling Training Camp",
          },
          organizer: {
            "@type": "Organization",
            name: "Roadman Cycling",
            url: "https://roadmancycling.com",
          },
          performer: {
            "@type": "Person",
            name: "Anthony Walsh",
          },
          maximumAttendeeCapacity: camp.capacity,
          image: [`https://roadmancycling.com${camp.heroImage}`],
        }}
      />
      {/* TouristTrip — duplicates the trip product layer for travel-aware crawlers. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TouristTrip",
          name: camp.name,
          description: camp.description,
          url: `https://roadmancycling.com${camp.href}`,
          image: [`https://roadmancycling.com${camp.heroImage}`],
          touristType: [
            "Cyclists",
            "Endurance athletes",
            "Recreational riders",
            camp.type === "Road" ? "Road cyclists" : "Gravel cyclists",
          ],
          itinerary: {
            "@type": "ItemList",
            numberOfItems: days.length,
            itemListOrder: "https://schema.org/ItemListOrderAscending",
            itemListElement: days.map((d) => ({
              "@type": "ListItem",
              position: d.day,
              item: {
                "@type": "TouristAttraction",
                name: d.title,
                description: d.description,
              },
            })),
          },
          offers: {
            "@type": "Offer",
            price: String(camp.pricePerPerson),
            priceCurrency: "EUR",
            availability: "https://schema.org/InStock",
            url: `https://roadmancycling.com${camp.href}#book`,
            validFrom: "2026-05-04",
          },
          provider: {
            "@type": "Organization",
            name: "Roadman Cycling",
            url: "https://roadmancycling.com",
          },
          subjectOf: {
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
      <FAQPageJsonLd
        questions={CAMP_FAQS.map((f) => ({ question: f.q, answer: f.a }))}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://roadmancycling.com" },
            { "@type": "ListItem", position: 2, name: "Training Camps", item: "https://roadmancycling.com/training-camps" },
            { "@type": "ListItem", position: 3, name: camp.shortName, item: `https://roadmancycling.com${camp.href}` },
          ],
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
                ROADMAN TRAINING CAMPS &middot; GIRONA 2026
              </p>
              <h1
                className="font-heading text-off-white leading-[0.95] mb-5 md:mb-6 text-center"
                style={{ fontSize: "clamp(2.75rem, 12vw, 5.5rem)" }}
              >
                {camp.shortName.toUpperCase()}
                <br />
                <span className="text-coral">CAMP.</span>
              </h1>
              <p
                className="text-foreground-muted mx-auto mb-8 md:mb-10 leading-relaxed font-light text-center"
                style={{
                  fontSize: "clamp(1.0625rem, 1.5vw, 1.375rem)",
                  maxWidth: "660px",
                }}
              >
                {camp.heroSubtitle}
              </p>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.04}>
              <div className="relative aspect-[4/5] sm:aspect-[16/10] md:aspect-[16/9] max-w-5xl mx-auto mb-8 md:mb-10 rounded-xl md:rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
                <Image
                  src={camp.heroImage}
                  alt={camp.heroImageAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  className="object-cover"
                  priority
                />
              </div>
            </ScrollReveal>

            {/* Stats bar */}
            <ScrollReveal direction="up" delay={0.05}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-px bg-white/10 max-w-5xl mx-auto rounded-xl overflow-hidden border border-white/10">
                {[
                  { label: "Dates", value: formatCampDates(camp) },
                  { label: "Duration", value: camp.durationLabel },
                  { label: "Level", value: camp.level },
                  { label: "Daily distance", value: camp.dailyDistance },
                  { label: "Total elevation", value: camp.totalElevation },
                ].map((stat, idx) => (
                  <div
                    key={stat.label}
                    className={`bg-deep-purple px-4 py-4 md:py-5 text-center ${
                      // 5 items in a 2-col grid leaves the last item orphaned;
                      // span both columns so it fills the row cleanly.
                      idx === 4
                        ? "col-span-2 sm:col-span-1"
                        : ""
                    }`}
                  >
                    <p className="font-heading text-coral text-[10px] tracking-[0.25em] uppercase mb-1.5 md:mb-2">
                      {stat.label}
                    </p>
                    <p className="text-off-white text-sm md:text-base font-light leading-tight">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-center gap-3 mt-8 md:mt-10">
              <a
                href="#book"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 sm:py-3.5 rounded-md font-heading tracking-[0.15em] uppercase text-off-white bg-coral hover:bg-coral-hover transition-all shadow-[0_10px_30px_-12px_rgba(241,99,99,0.55)]"
              >
                Book now &middot; €{camp.pricePerPerson}
              </a>
              <a
                href="#itinerary"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 sm:py-3.5 rounded-md font-heading tracking-[0.15em] uppercase text-foreground-muted border border-white/15 hover:text-off-white hover:border-white/30 transition-colors"
              >
                See the rides
              </a>
            </div>
          </Container>
        </Section>

        {/* SUMMARY ──────────────────────────────────────────── */}
        <Section background="charcoal" className="!py-16 md:!py-28">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-14">
              <ScrollReveal direction="up" className="lg:col-span-2">
                <p className="font-heading text-coral text-[11px] md:text-xs tracking-[0.35em] md:tracking-[0.4em] mb-4">
                  THE CAMP
                </p>
                <h2
                  className="font-heading text-off-white leading-[1.05] mb-5 md:mb-6"
                  style={{ fontSize: "clamp(2.125rem, 4vw, 3.25rem)" }}
                >
                  {camp.summaryHeading.main}
                  <br />
                  <span className="text-coral">{camp.summaryHeading.accent}</span>
                </h2>
                <p className="text-foreground-muted leading-relaxed text-[17px] md:text-lg mb-4 md:mb-5">
                  {camp.description}
                </p>
                <p className="text-foreground-muted leading-relaxed text-[15px] md:text-base">
                  This isn&apos;t a tour company. It&apos;s us — Anthony, Sarah and
                  Matthew — taking sixteen riders to the spot we&apos;d pick for
                  ourselves and riding it the way it&apos;s meant to be ridden. Two
                  groups so nobody waits or gets dropped. A car behind us with
                  everything you need. The kind of week you&apos;ll talk about for
                  years.
                </p>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.05}>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 backdrop-blur-sm">
                  <p className="font-heading text-coral text-[10px] tracking-[0.3em] uppercase mb-3 md:mb-4">
                    At a glance
                  </p>
                  <dl className="space-y-3 text-sm">
                    {[
                      ["Type", camp.type + " cycling"],
                      ["Dates", formatCampDates(camp)],
                      ["Group size", `Max ${camp.capacity} riders`],
                      ["Ride groups", "Chill & Fast"],
                      ["Total distance", `~${totalDistance} km`],
                      ["Total elevation", camp.totalElevation],
                      ["Price", `€${camp.pricePerPerson} per person`],
                      ["Single room", `+€${camp.singleSupplement}`],
                    ].map(([k, v]) => (
                      <div
                        key={k}
                        className="flex items-baseline justify-between gap-3 border-b border-white/5 pb-3 last:border-0 last:pb-0"
                      >
                        <dt className="text-foreground-subtle text-[11px] md:text-xs tracking-[0.15em] uppercase shrink-0">
                          {k}
                        </dt>
                        <dd className="text-off-white text-right font-light text-[13px] md:text-sm">
                          {v}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </ScrollReveal>
            </div>
          </Container>
        </Section>

        {/* ITINERARY ────────────────────────────────────────── */}
        <Section
          id="itinerary"
          background="deep-purple"
          grain
          className="!py-16 md:!py-28"
        >
          <Container>
            <ScrollReveal direction="up">
              <p className="font-heading text-coral text-[11px] md:text-xs tracking-[0.35em] md:tracking-[0.4em] mb-4 text-center">
                DAY BY DAY
              </p>
              <h2
                className="font-heading text-off-white leading-[1.05] mb-10 md:mb-12 text-center"
                style={{ fontSize: "clamp(2.125rem, 4vw, 3.25rem)" }}
              >
                {camp.itineraryHeading.main}
                <br />
                <span className="text-coral">{camp.itineraryHeading.accent}</span>
              </h2>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.05}>
              <div className="max-w-4xl mx-auto rounded-xl overflow-hidden">
                <Itinerary days={days} />
              </div>
              <p className="text-foreground-subtle text-xs text-center mt-6 max-w-2xl mx-auto leading-relaxed">
                Routes are indicative. Anthony tweaks the final week based on
                weather, the group, and which cafés are open — that&apos;s the
                upside of running camps with sixteen people instead of fifty.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* INCLUDED / NOT ───────────────────────────────────── */}
        <Section background="charcoal" className="!py-16 md:!py-24">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 max-w-5xl mx-auto">
              <ScrollReveal direction="up">
                <p className="font-heading text-coral text-[11px] md:text-xs tracking-[0.35em] md:tracking-[0.4em] mb-4">
                  WHAT&apos;S INCLUDED
                </p>
                <h3 className="font-heading text-off-white text-2xl sm:text-3xl mb-5 md:mb-6 leading-tight">
                  EVERYTHING SORTED ONCE YOU LAND.
                </h3>
                <ul className="space-y-3 md:space-y-3.5">
                  {INCLUDED.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-foreground-muted leading-relaxed text-[15px] md:text-base"
                    >
                      <span className="text-coral mt-0.5 shrink-0 font-heading" aria-hidden>
                        ✓
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.05}>
                <p className="font-heading text-foreground-subtle text-[11px] md:text-xs tracking-[0.35em] md:tracking-[0.4em] mb-4">
                  NOT INCLUDED
                </p>
                <h3 className="font-heading text-off-white text-2xl sm:text-3xl mb-5 md:mb-6 leading-tight">
                  ON YOU. WE&apos;LL POINT YOU IN THE RIGHT DIRECTION.
                </h3>
                <ul className="space-y-3 md:space-y-3.5">
                  {NOT_INCLUDED.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-foreground-muted leading-relaxed text-[15px] md:text-base"
                    >
                      <span className="text-foreground-subtle mt-0.5 shrink-0" aria-hidden>
                        —
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
            </div>
          </Container>
        </Section>

        {/* ACCOMMODATION ────────────────────────────────────── */}
        <Section background="deep-purple" grain className="!py-16 md:!py-28">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12 items-center">
              <ScrollReveal direction="up">
                <p className="font-heading text-coral text-[11px] md:text-xs tracking-[0.35em] md:tracking-[0.4em] mb-4">
                  THE BASE
                </p>
                <h2
                  className="font-heading text-off-white leading-[1.05] mb-5 md:mb-6"
                  style={{ fontSize: "clamp(2.125rem, 4vw, 3.25rem)" }}
                >
                  CAN SAGNARI.
                  <br />
                  <span className="text-coral">A 1749 FARMHOUSE.</span>
                </h2>
                <p className="text-foreground-muted leading-relaxed mb-4 text-[15px] md:text-base">
                  Our private base in Cornellà del Terri, 20 minutes from
                  Girona and five from Banyoles. A restored Catalan stone
                  farmhouse with 500 m² of living space and four thousand
                  square metres of gardens to wander after a long day on the
                  bike.
                </p>
                <p className="text-foreground-muted leading-relaxed mb-6 text-[15px] md:text-base">
                  Pool open all year. A pond, a petanque court, and the kind
                  of stone walls and slow Catalan light you&apos;d normally only
                  get if you knew someone with a place out here. Now you do.
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 text-[15px] md:text-sm text-foreground-muted">
                  <li className="flex items-baseline gap-2">
                    <span className="text-coral" aria-hidden>★</span>
                    <span>Pool, year-round</span>
                  </li>
                  <li className="flex items-baseline gap-2">
                    <span className="text-coral" aria-hidden>★</span>
                    <span>Gardens &amp; petanque</span>
                  </li>
                  <li className="flex items-baseline gap-2">
                    <span className="text-coral" aria-hidden>★</span>
                    <span>20 min from Girona</span>
                  </li>
                  <li className="flex items-baseline gap-2">
                    <span className="text-coral" aria-hidden>★</span>
                    <span>5 min from Lake Banyoles</span>
                  </li>
                  <li className="flex items-baseline gap-2">
                    <span className="text-coral" aria-hidden>★</span>
                    <span>1749 Catalan stone farmhouse</span>
                  </li>
                  <li className="flex items-baseline gap-2">
                    <span className="text-coral" aria-hidden>★</span>
                    <span>500 m² living space</span>
                  </li>
                </ul>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.05}>
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  {CAN_SAGNARI_GALLERY.map((g) => (
                    <div
                      key={g.src}
                      className="relative aspect-[4/5] rounded-lg overflow-hidden border border-white/10"
                    >
                      <Image
                        src={g.src}
                        alt={g.alt}
                        fill
                        sizes="(max-width: 1024px) 50vw, 25vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-foreground-subtle text-xs mt-3 leading-relaxed">
                  Can Sagnari — pool, interior, exterior, aerial.
                </p>
              </ScrollReveal>
            </div>
          </Container>
        </Section>

        {/* GALLERY ──────────────────────────────────────────── */}
        <Section background="charcoal" className="!py-16 md:!py-24">
          <Container>
            <ScrollReveal direction="up">
              <p className="font-heading text-coral text-[11px] md:text-xs tracking-[0.35em] md:tracking-[0.4em] mb-4 text-center">
                THE PLACE
              </p>
              <h2
                className="font-heading text-off-white leading-[1.05] mb-10 md:mb-12 text-center"
                style={{ fontSize: "clamp(2.125rem, 4vw, 3.25rem)" }}
              >
                GIRONA.
              </h2>
            </ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4">
              {GIRONA_GALLERY.map((g, i) => (
                <ScrollReveal key={g.src} direction="up" delay={i * 0.05}>
                  <div className="relative aspect-square rounded-lg overflow-hidden border border-white/10">
                    <Image
                      src={g.src}
                      alt={g.alt}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* BOOKING ──────────────────────────────────────────── */}
        <Section
          id="book"
          background="deep-purple"
          grain
          className="!py-16 md:!py-28 relative"
        >
          <Container width="narrow" className="relative">
            <ScrollReveal direction="up">
              <p className="font-heading text-coral text-[11px] md:text-xs tracking-[0.35em] md:tracking-[0.4em] mb-4 text-center">
                RESERVE YOUR SPOT
              </p>
              <h2
                className="font-heading text-off-white leading-[1.05] mb-4 text-center"
                style={{ fontSize: "clamp(2.125rem, 4vw, 3.25rem)" }}
              >
                BOOK THE {camp.shortName.toUpperCase()} CAMP.
              </h2>
              <p className="text-foreground-muted text-center max-w-xl mx-auto leading-relaxed mb-8 md:mb-10 text-[15px] md:text-base">
                Sixteen spots, first-come. Fill the form, pay through Stripe,
                and the spot is yours the moment the payment clears.
              </p>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.05}>
              <div className="rounded-xl md:rounded-2xl border border-white/10 bg-charcoal/60 backdrop-blur-sm p-5 sm:p-7 md:p-10">
                <BookingForm defaultCamp={camp.slug} camps={CAMPS} />
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.1}>
              <p className="text-foreground-subtle text-xs text-center mt-8 max-w-md mx-auto leading-relaxed">
                Want both formats? You can book{" "}
                <Link
                  href={otherCamp.href}
                  className="text-coral hover:underline"
                >
                  the {otherCamp.type.toLowerCase()} camp
                </Link>{" "}
                back-to-back — same farmhouse, no airport transfer in between.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* CYCLING IN GIRONA — internal links to route guides + pillar */}
        <Section background="charcoal" className="!py-16 md:!py-24">
          <Container>
            <ScrollReveal direction="up">
              <p className="font-heading text-coral text-[11px] md:text-xs tracking-[0.35em] md:tracking-[0.4em] mb-4 text-center">
                THE ROUTES, IN DEPTH
              </p>
              <h2
                className="font-heading text-off-white leading-[1.05] mb-5 md:mb-6 text-center"
                style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)" }}
              >
                CYCLING IN GIRONA —
                <br />
                <span className="text-coral">THE FULL HANDBOOK.</span>
              </h2>
              <p className="text-foreground-muted text-center max-w-2xl mx-auto leading-relaxed mb-10 md:mb-12 text-[15px] md:text-base">
                Want to know what each climb actually rides like before you
                book? We&apos;ve put guides up for the ones that anchor the
                week — the test pieces, the tempo climbs, the big mountain
                day — plus the broader cycling-in-Girona handbook.
              </p>
            </ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 max-w-5xl mx-auto">
              {GIRONA_ROUTE_LIST.slice(0, 3).map((route, i) => (
                <ScrollReveal key={route.slug} direction="up" delay={i * 0.04}>
                  <Link
                    href={`/cycling-girona/${route.slug}`}
                    className="group block h-full rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-coral/40 transition-all p-5 sm:p-6"
                  >
                    <p className="font-heading text-coral text-[10px] tracking-[0.3em] uppercase mb-2">
                      {route.surface} · {route.climbLength}
                    </p>
                    <h3 className="font-heading text-off-white text-xl md:text-2xl leading-tight mb-3 group-hover:text-coral transition-colors">
                      {route.name.toUpperCase()}
                    </h3>
                    <p className="text-foreground-muted text-[14px] leading-relaxed line-clamp-3 mb-3">
                      {route.summary}
                    </p>
                    <span className="font-heading text-coral text-xs tracking-[0.2em] uppercase">
                      Climb guide →
                    </span>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
            <ScrollReveal direction="up" delay={0.16}>
              <div className="mt-6 md:mt-8 text-center">
                <Link
                  href="/cycling-girona"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md font-heading tracking-[0.15em] uppercase text-foreground-muted border border-white/15 hover:text-off-white hover:border-coral/40 transition-colors text-sm"
                >
                  Read the full Cycling in Girona guide →
                </Link>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* FAQ ──────────────────────────────────────────────── */}
        <Section background="deep-purple" grain className="!py-16 md:!py-24">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <p className="font-heading text-coral text-[11px] md:text-xs tracking-[0.35em] md:tracking-[0.4em] mb-4 text-center">
                COMMON QUESTIONS
              </p>
              <h2
                className="font-heading text-off-white leading-[1.05] mb-10 md:mb-12 text-center"
                style={{ fontSize: "clamp(2.125rem, 4vw, 3rem)" }}
              >
                THINGS PEOPLE ASK.
              </h2>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.05}>
              <FAQ items={CAMP_FAQS} />
            </ScrollReveal>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
