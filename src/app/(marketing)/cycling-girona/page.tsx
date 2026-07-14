import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { FAQSchema } from "@/components/seo/FAQSchema";
import { ENTITY_IDS } from "@/lib/brand-facts";
import { CAMPS, formatCampDates } from "@/lib/camps/camps";
import { GIRONA_ROUTE_LIST } from "@/lib/girona/routes";

const SITE = "https://roadmancycling.com";

export const metadata: Metadata = {
  title: "Cycling in Girona — The Complete Guide for Riders",
  description:
    "Why every World Tour pro lives in Girona, what the famous climbs really ride like, when to visit, where to coffee, and how to plan a cycling holiday here. Written by riders.",
  alternates: {
    canonical: `${SITE}/cycling-girona`,
  },
  keywords: [
    "cycling in Girona",
    "cycling holiday Girona",
    "Girona cycling routes",
    "Girona cycling camp",
    "cycling holiday Spain",
    "best time to cycle Girona",
    "where to cycle in Girona",
    "Girona climbs",
    "Rocacorba cycling",
    "Els Àngels cycling",
  ],
  openGraph: {
    title: "Cycling in Girona — The Complete Guide for Riders",
    description:
      "Routes, climbs, weather, cafés, the lot. The cycling guide to Girona, Spain — written by riders who train here every year.",
    type: "article",
    url: `${SITE}/cycling-girona`,
    images: [
      {
        url: `${SITE}/images/camps/girona-onyar-houses.jpeg`,
        alt: "Girona old town along the Onyar river — Europe's pro cycling capital",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cycling in Girona — The Complete Guide",
    description:
      "Why the pros live here. What the climbs really ride like. When to visit. Where to coffee.",
  },
};

const PILLAR_FAQS = [
  {
    q: "Why do so many pro cyclists live in Girona?",
    a: "More World Tour pros live in Girona than in any other city on the planet. They moved for the riding, not the lifestyle: every road that leaves the city is good. Long even-gradient climbs, quiet back roads, dirt that connects to tarmac that connects to the Mediterranean coast. It's also a one-hour flight from most of Europe, an hour from Barcelona-El Prat by train, and warm enough to ride in shorts from March to November.",
  },
  {
    q: "When is the best time of year to cycle in Girona?",
    a: "March to early June and September to early November are the sweet spots. Spring is busier and a touch wetter; autumn is the season the locals quietly prefer — empty roads, mid-twenties most days, vines turning, pool warm enough to swim in after a ride. July and August are too hot for serious training. December to February is rideable on the right day but you'll want lights and a warm jacket.",
  },
  {
    q: "What are the famous climbs in Girona?",
    a: "Rocacorba is the legend — 11 km of even-gradient road every pro in town uses for testing. Els Àngels is the everyday tempo climb. Mare de Déu del Mont is the big mountain day. Coll de Bracons is the quiet beech-forest classic west of the city. Beyond those, the area has dozens of climbs in the 4–8 km range, almost all of them on quiet roads with a café at one end.",
  },
  {
    q: "Do I need to be a strong rider to cycle in Girona?",
    a: "No. The famous climbs are advertised in the magazines but most of the riding is gently rolling — lanes through the Empordà, the Ter river path, the lake at Banyoles, the coastal roads above the Med. You can spend a week here at base-tempo pace and never see a steep gradient. The climbs are there if you want them, but they're not the whole place.",
  },
  {
    q: "Should I bring my own bike or hire one?",
    a: "Bring your own if you can. It's dialled to your fit and you'll ride it best. Hire is good in Girona — multiple shops with current-spec road and gravel bikes — but plan ahead in October peak, especially for taller riders. Reckon on €60–110 a day depending on the bike.",
  },
  {
    q: "How do I get to Girona?",
    a: "Easiest is Girona-Costa Brava (GRO) — small airport, 15 minutes from the city, served by Ryanair from most of Europe. Barcelona-El Prat (BCN) is bigger and 90 minutes south by train or car. Anyone flying with a bike: GRO is more bike-friendly at oversized baggage; BCN has the wider flight schedule.",
  },
  {
    q: "Is Girona safe to cycle in?",
    a: "Yes. Catalan drivers are among the most cycling-aware in Europe — there's a strong cycling culture, the local police know the roads, and the back lanes most riders use see almost no traffic. Use lights, ride predictably, stay off the C-roads at peak hours and you'll have a quieter time on the road than at home.",
  },
  {
    q: "How does Girona compare to Mallorca for cycling?",
    a: "Mallorca is steeper terrain in a smaller area, with a bigger cycling-tourism economy and more all-inclusive resorts. Girona is wider terrain on quieter roads, with a smaller scene that feels more like a working pro town. Mallorca is better for a first cycling holiday and packed with options. Girona is better for serious training, gravel, and riders who want to share roads with the World Tour.",
  },
];

export default function CyclingGironaPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Cycling in Girona — The Complete Guide for Riders",
          description:
            "The complete guide to cycling in Girona, Spain. Routes, climbs, weather, cafés, when to visit and how to plan a cycling holiday or training camp here.",
          url: `${SITE}/cycling-girona`,
          image: `${SITE}/images/camps/girona-onyar-houses.jpeg`,
          author: { "@id": ENTITY_IDS.person },
          publisher: { "@id": ENTITY_IDS.organization },
          isPartOf: { "@id": ENTITY_IDS.website },
          mainEntityOfPage: `${SITE}/cycling-girona`,
          articleSection: "Cycling in Girona",
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
      <FAQSchema
        faqs={PILLAR_FAQS.map((f) => ({ question: f.q, answer: f.a }))}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE },
            {
              "@type": "ListItem",
              position: 2,
              name: "Cycling in Girona",
              item: `${SITE}/cycling-girona`,
            },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        {/* HERO */}
        <Section
          background="deep-purple"
          grain
          className="!pt-36 !pb-14 md:!pt-44 md:!pb-20 relative"
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
                THE COMPLETE GUIDE
              </p>
              <h1
                className="font-heading text-off-white leading-[0.95] mb-5 md:mb-6 text-center"
                style={{ fontSize: "clamp(2.75rem, 12vw, 5.5rem)" }}
              >
                CYCLING
                <br />
                IN <span className="text-coral">GIRONA.</span>
              </h1>
              <p
                className="text-foreground-muted mx-auto mb-8 md:mb-10 leading-relaxed font-light text-center"
                style={{
                  fontSize: "clamp(1.0625rem, 1.5vw, 1.375rem)",
                  maxWidth: "720px",
                }}
              >
                More World Tour pros live here than in any other city on
                the planet. They didn&apos;t pick it for the lifestyle. They
                picked it because every road that leaves the city is good.
                Here&apos;s why — and how to ride it yourself.
              </p>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.04}>
              <div className="relative aspect-[16/10] md:aspect-[16/8] max-w-5xl mx-auto rounded-xl md:rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
                <Image
                  src="/images/camps/girona-onyar-houses.jpeg"
                  alt="Girona old town along the Onyar river — Europe's pro cycling capital"
                  fill
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  className="object-cover"
                  priority
                />
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* WHY GIRONA */}
        <Section background="charcoal" className="!py-16 md:!py-24">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <p className="font-heading text-coral text-[11px] md:text-xs tracking-[0.35em] md:tracking-[0.4em] mb-4">
                WHY THE PROS LIVE HERE
              </p>
              <h2
                className="font-heading text-off-white leading-[1.05] mb-6 md:mb-8"
                style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
              >
                THE PLACE PROS MOVE TO.
              </h2>
              <p className="text-foreground-muted leading-relaxed text-[16px] md:text-lg mb-5">
                Girona is a small Catalan city — one cathedral, a river full
                of coloured houses, a bridge built by Eiffel — that happens
                to be the most concentrated home of professional cyclists in
                the world. The Yates twins lived here. Pogačar trains here in
                the build-up to a Tour. Tao Geoghegan Hart, Lachlan Morton,
                half the Ineos roster, most of the EF squad, dozens more.
                When pros pick a base, they pick this place.
              </p>
              <p className="text-foreground-muted leading-relaxed text-[16px] md:text-lg mb-5">
                The reason is simple. Pros need three things from a base:
                quiet roads, varied terrain, and a runway out of the city
                that doesn&apos;t involve a busy ring road. Girona delivers
                all three in the first ten kilometres. Roll out north
                towards Banyoles and you&apos;re on farm lanes. Roll east
                towards Sant Martí Vell and you&apos;re climbing tempo.
                Roll west into the Garrotxa and you&apos;re in beech forest
                inside half an hour.
              </p>
              <p className="text-foreground-muted leading-relaxed text-[16px] md:text-lg">
                The lifestyle is a bonus. Cheap rent. Decent coffee. A
                fifteen-minute flight to most of Europe. Twenty minutes to
                the Mediterranean. A Spanish-speaking, Catalan-cooking,
                cycling-literate working town that hasn&apos;t been priced
                out of itself yet. The pros aren&apos;t in Girona because
                it&apos;s pretty. They&apos;re here because the riding is
                unreasonable.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* THE FAMOUS CLIMBS */}
        <Section background="deep-purple" grain className="!py-16 md:!py-24">
          <Container>
            <ScrollReveal direction="up">
              <p className="font-heading text-coral text-[11px] md:text-xs tracking-[0.35em] md:tracking-[0.4em] mb-4 text-center">
                THE FAMOUS CLIMBS
              </p>
              <h2
                className="font-heading text-off-white leading-[1.05] mb-5 md:mb-6 text-center"
                style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
              >
                THE ROADS YOU&apos;VE
                <br />
                <span className="text-coral">WATCHED ON YOUTUBE.</span>
              </h2>
              <p className="text-foreground-muted text-center max-w-2xl mx-auto leading-relaxed mb-10 md:mb-12 text-[15px] md:text-base">
                Four climbs make up the spine of the Girona riding diet.
                The pros do them on rotation through the season. Each one
                rides differently, and the right one for you depends on
                your week, your legs, and how much daylight you have.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 max-w-5xl mx-auto">
              {GIRONA_ROUTE_LIST.map((route, i) => (
                <ScrollReveal key={route.slug} direction="up" delay={i * 0.05}>
                  <Link
                    href={`/cycling-girona/${route.slug}`}
                    className="group block h-full rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-coral/40 transition-all overflow-hidden"
                  >
                    <div className="p-5 sm:p-6 md:p-7">
                      <div className="flex items-baseline justify-between mb-3">
                        <p className="font-heading text-coral text-[10px] tracking-[0.3em] uppercase">
                          {route.surface} · {route.climbLength}
                        </p>
                        <p className="font-heading text-foreground-subtle text-[10px] tracking-[0.2em] uppercase">
                          {route.averageGradient} avg
                        </p>
                      </div>
                      <h3 className="font-heading text-off-white text-2xl md:text-3xl leading-tight mb-3 group-hover:text-coral transition-colors">
                        {route.name.toUpperCase()}
                      </h3>
                      <p className="text-foreground-muted text-[15px] leading-relaxed mb-4">
                        {route.summary}
                      </p>
                      <span className="font-heading text-coral text-xs tracking-[0.2em] uppercase">
                        Read the climb guide →
                      </span>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* WHEN TO VISIT */}
        <Section background="charcoal" className="!py-16 md:!py-24">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <p className="font-heading text-coral text-[11px] md:text-xs tracking-[0.35em] md:tracking-[0.4em] mb-4">
                WHEN TO VISIT
              </p>
              <h2
                className="font-heading text-off-white leading-[1.05] mb-6"
                style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
              >
                THE TWO PROPER SEASONS.
              </h2>
              <p className="text-foreground-muted leading-relaxed text-[16px] md:text-lg mb-8">
                Girona has two cycling windows: spring (March to early June)
                and autumn (September to early November). Pick autumn if you
                can — quieter roads, better light, October is the locals&apos;
                month for a reason.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {[
                {
                  season: "March – early June",
                  headline: "Spring",
                  body:
                    "Daytime 16–25°C, occasional showers, vines coming back. Busy with pro teams in pre-season camps. The classic European spring window — works well if you&apos;re building toward a summer event.",
                },
                {
                  season: "September – early November",
                  headline: "Autumn",
                  body:
                    "Daytime 20–26°C, drier than spring, harvest in full swing. Empty roads, the best light of the year, pool still warm enough to swim in after a ride. Locals&apos; favourite. October is peak.",
                },
                {
                  season: "July – August",
                  headline: "Avoid for training",
                  body:
                    "Mid-thirties most days. The pros leave for altitude or northern Europe. Rideable at 6 a.m. but the heat costs you any meaningful training quality after 9.",
                },
                {
                  season: "December – February",
                  headline: "Quiet but cold",
                  body:
                    "Daytime 5–14°C, short days. The locals ride through it but visitors mostly skip it. If you come, bring lights and treat it as base miles, not key sessions.",
                },
              ].map((s, i) => (
                <ScrollReveal key={s.season} direction="up" delay={i * 0.04}>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 md:p-7">
                    <p className="font-heading text-coral text-[10px] tracking-[0.3em] uppercase mb-2">
                      {s.season}
                    </p>
                    <h3 className="font-heading text-off-white text-xl md:text-2xl leading-tight mb-3">
                      {s.headline.toUpperCase()}
                    </h3>
                    <p
                      className="text-foreground-muted text-[14px] md:text-[15px] leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: s.body }}
                    />
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* CAFÉS & RIDING CULTURE */}
        <Section background="deep-purple" grain className="!py-16 md:!py-24">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <p className="font-heading text-coral text-[11px] md:text-xs tracking-[0.35em] md:tracking-[0.4em] mb-4">
                THE CULTURE
              </p>
              <h2
                className="font-heading text-off-white leading-[1.05] mb-6"
                style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
              >
                COFFEE, CAKE, COBBLES.
              </h2>
              <p className="text-foreground-muted leading-relaxed text-[16px] md:text-lg mb-5">
                Cycling-friendly coffee is its own genre in Girona. Most
                serious riders end the morning at La Fábrica, run by ex-pro
                Christian Meier — espresso, eggs on toast, half the
                international peloton at any given hour. Espresso Mafia, around
                the corner, does the actual best espresso in town. Federal
                Café across the river is the long-lunch option.
              </p>
              <p className="text-foreground-muted leading-relaxed text-[16px] md:text-lg mb-5">
                On the road, the coffee stops are the calendar. Sanctuari
                Mare de Déu dels Àngels at the top of Els Àngels. The square
                in Beuda after Mare de Déu del Mont. Santa Pau&apos;s tiny
                cobbled plaza in the volcanic park. The fishing-village
                terraces along the Costa Brava. None of it is showroom-cycling
                café branding — it&apos;s village cafés that have been
                pouring cortados for fifty years and quietly become part of
                the riding.
              </p>
              <p className="text-foreground-muted leading-relaxed text-[16px] md:text-lg">
                One thing to know: Catalans eat late. Lunch starts at 14:00
                and dinner at 21:00. If you ride at 8 a.m. and want food at
                noon, you&apos;ll be one of two people in a café. Adapt or
                bring snacks.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* GRAVEL */}
        <Section background="charcoal" className="!py-16 md:!py-24">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <p className="font-heading text-coral text-[11px] md:text-xs tracking-[0.35em] md:tracking-[0.4em] mb-4">
                GRAVEL
              </p>
              <h2
                className="font-heading text-off-white leading-[1.05] mb-6"
                style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
              >
                THE QUIET REASON
                <br />
                <span className="text-coral">PROS COME BACK.</span>
              </h2>
              <p className="text-foreground-muted leading-relaxed text-[16px] md:text-lg mb-5">
                Girona&apos;s gravel scene is the second reason the place
                stayed. The Traka — the longest gravel race in Europe —
                starts and finishes here. Lachlan Morton trained for the
                Tour Divide on these trails. The terrain ranges from
                vineyard service roads in the Empordà to volcanic dirt
                inside La Garrotxa Natural Park to cork-oak singletrack
                through Les Gavarres. Coastal gravel above the Med. Forest
                tracks west of Olot. None of it requires a mountain bike;
                most of it is comfortable on 40–45 mm tyres.
              </p>
              <p className="text-foreground-muted leading-relaxed text-[16px] md:text-lg">
                The other quiet truth: the road and gravel networks
                interlock. You can ride a Catalan back-road loop, drop onto
                a vineyard track for ten minutes, climb a paved col, and
                roll home down a coastal dirt path — all in a single
                morning. Girona is one of the few places in Europe where a
                pure gravel bike is the most useful bike to bring.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* CAMPS CTA */}
        <Section background="deep-purple" grain className="!py-16 md:!py-24">
          <Container>
            <ScrollReveal direction="up">
              <p className="font-heading text-coral text-[11px] md:text-xs tracking-[0.35em] md:tracking-[0.4em] mb-4 text-center">
                RIDE IT WITH ROADMAN
              </p>
              <h2
                className="font-heading text-off-white leading-[1.05] mb-5 md:mb-6 text-center"
                style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
              >
                TWO CAMPS. ONE FARMHOUSE.
              </h2>
              <p className="text-foreground-muted text-center max-w-2xl mx-auto leading-relaxed mb-10 md:mb-12 text-[15px] md:text-base">
                The Roadman Girona Training Camps run back-to-back in
                October — road first, then gravel. Sixteen riders per camp.
                Anthony in the group every day. €995 per camp from a
                private 1749 Catalan farmhouse, twenty minutes from the
                old town.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 max-w-4xl mx-auto">
              {Object.values(CAMPS).map((camp, i) => (
                <ScrollReveal key={camp.slug} direction="up" delay={i * 0.05}>
                  <Link
                    href={camp.href}
                    className="group block h-full rounded-xl border border-coral/40 bg-coral/[0.05] hover:bg-coral/[0.1] transition-all p-5 sm:p-6 md:p-7"
                  >
                    <p className="font-heading text-coral text-[10px] tracking-[0.3em] uppercase mb-2">
                      {formatCampDates(camp)}
                    </p>
                    <h3 className="font-heading text-off-white text-2xl md:text-3xl leading-tight mb-3 group-hover:text-coral transition-colors">
                      {camp.shortName.toUpperCase()} CAMP
                    </h3>
                    <p className="text-foreground-muted text-[15px] leading-relaxed mb-4">
                      {camp.description}
                    </p>
                    <p className="font-heading text-off-white text-xl mb-1">
                      €{camp.pricePerPerson}{" "}
                      <span className="text-foreground-subtle text-[10px] tracking-[0.2em] uppercase ml-1">
                        per person · {camp.capacity} spots
                      </span>
                    </p>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* FAQ */}
        <Section background="charcoal" className="!py-16 md:!py-24">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <p className="font-heading text-coral text-[11px] md:text-xs tracking-[0.35em] md:tracking-[0.4em] mb-4 text-center">
                COMMON QUESTIONS
              </p>
              <h2
                className="font-heading text-off-white leading-[1.05] mb-10 md:mb-12 text-center"
                style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)" }}
              >
                CYCLING IN GIRONA — FAQ.
              </h2>
            </ScrollReveal>
            <div className="space-y-4 md:space-y-5">
              {PILLAR_FAQS.map((f, i) => (
                <ScrollReveal key={f.q} direction="up" delay={i * 0.03}>
                  <details className="group rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
                    <summary className="flex items-baseline justify-between gap-4 cursor-pointer p-5 sm:p-6 list-none">
                      <span className="font-heading text-off-white text-lg md:text-xl leading-tight">
                        {f.q}
                      </span>
                      <span
                        className="text-coral text-2xl shrink-0 transition-transform group-open:rotate-45"
                        aria-hidden
                      >
                        +
                      </span>
                    </summary>
                    <div className="px-5 sm:px-6 pb-5 sm:pb-6 -mt-1">
                      <p className="text-foreground-muted leading-relaxed text-[15px] md:text-base">
                        {f.a}
                      </p>
                    </div>
                  </details>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
