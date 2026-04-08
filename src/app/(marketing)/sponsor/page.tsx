import type { Metadata } from "next";
import Image from "next/image";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal, AnimatedCounter } from "@/components/ui";
import { getEvents, getAvailability } from "@/lib/inventory";
import type { AvailabilityByMonth } from "@/lib/inventory";
import BookingFlow, { FAQSection } from "./SponsorClientSections";

export const metadata: Metadata = {
  title: "Sponsor — Roadman Cycling",
  description:
    "Real inventory. Live pricing. Actual dates. Sponsor the biggest cycling podcast in Europe — pick a moment or a duration, choose your slot, upload your assets, done.",
  alternates: {
    canonical: "https://roadmancycling.com/sponsor",
  },
  openGraph: {
    title: "Sponsor Roadman Cycling",
    description:
      "No media kit fluff. Pick a moment or a duration. Choose your slot. Upload your assets. Done.",
    type: "website",
    url: "https://roadmancycling.com/sponsor",
  },
};

// ---------------------------------------------------------------------------
// Brand partners for proof block
// ---------------------------------------------------------------------------

const brandPartners = [
  { name: "TrainingPeaks", logo: "/images/partners/trainingpeaks.png", invert: true },
  { name: "SRAM", logo: "/images/partners/sram.png", invert: false },
  { name: "Parlee", logo: "/images/partners/parlee.png", invert: false },
  { name: "4Endurance", logo: "/images/partners/4endurance.png", invert: false },
  { name: "Bikmo", logo: "/images/partners/bikmo.svg", invert: false },
];

// ---------------------------------------------------------------------------
// Hardcoded season blocks (not single events in Airtable)
// ---------------------------------------------------------------------------

const SEASON_BLOCKS = [
  {
    id: "season-gravel",
    eventName: "Gravel Season",
    startDate: "2026-04-01",
    endDate: "2026-09-30",
    premiumTier: "3" as const,
    coverageDescription: "Six months of gravel content. Training plans, race previews, gear reviews, and Roadman\u2019s own Migration Gravel build-up.",
    episodeCount: 78, // 3/week x 26 weeks
    newsletterCount: 26, // 1/week x 26 weeks
  },
  {
    id: "season-indoor",
    eventName: "Indoor Season",
    startDate: "2026-11-01",
    endDate: "2027-03-31",
    premiumTier: "3" as const,
    coverageDescription: "Five months of off-season content. Indoor training, gear deep-dives, and season planning \u2014 when cyclists are deciding what to buy next.",
    episodeCount: 65, // 3/week x ~21.7 weeks
    newsletterCount: 22, // 1/week x ~22 weeks
  },
];

// ---------------------------------------------------------------------------
// Server data fetching
// ---------------------------------------------------------------------------

async function getBookingFlowData() {
  try {
    const now = new Date();
    const futureDate = new Date(now);
    futureDate.setMonth(futureDate.getMonth() + 18);

    const [events, availability] = await Promise.all([
      getEvents({
        dateRange: {
          from: now.toISOString().slice(0, 10),
          to: futureDate.toISOString().slice(0, 10),
        },
      }),
      getAvailability({
        from: now.toISOString().slice(0, 10),
        to: futureDate.toISOString().slice(0, 10),
      }),
    ]);

    // Filter to the 3 marquee Grand Tour events
    const marqueeEventNames = [
      "Tour de France",
      "Giro d\u2019Italia",
      "Vuelta a Espa\u00f1a",
    ];

    const marqueeEvents = events
      .filter((e) =>
        marqueeEventNames.some((name) =>
          e.eventName.toLowerCase().includes(name.toLowerCase()),
        ),
      )
      .map((event) => {
        // Compute availability for this event
        let totalSlots = 0;
        let availableSlots = 0;

        for (const monthData of availability) {
          const monthStart = `${monthData.month}-01`;
          const monthEnd = `${monthData.month}-31`;

          if (monthStart <= event.endDate && monthEnd >= event.startDate) {
            for (const [, counts] of Object.entries(monthData.byType)) {
              totalSlots += counts.total;
              availableSlots += counts.available;
            }
          }
        }

        return {
          id: event.id,
          eventName: event.eventName,
          startDate: event.startDate,
          endDate: event.endDate,
          premiumTier: event.premiumTier,
          status: event.status,
          totalSlots,
          availableSlots,
        };
      });

    // Compute availability for season blocks by aggregating slots in their windows
    const seasonBlocks = SEASON_BLOCKS.map((block) => {
      let totalSlots = 0;
      let availableSlots = 0;

      for (const monthData of availability) {
        const monthStart = `${monthData.month}-01`;
        const monthEnd = `${monthData.month}-31`;

        if (monthStart <= block.endDate && monthEnd >= block.startDate) {
          for (const [, counts] of Object.entries(monthData.byType)) {
            totalSlots += counts.total;
            availableSlots += counts.available;
          }
        }
      }

      return {
        id: block.id,
        eventName: block.eventName,
        startDate: block.startDate,
        endDate: block.endDate,
        premiumTier: block.premiumTier,
        coverageDescription: block.coverageDescription,
        episodeCount: block.episodeCount,
        newsletterCount: block.newsletterCount,
        totalSlots,
        availableSlots,
      };
    });

    return { events: marqueeEvents, seasonBlocks, availability };
  } catch {
    // Fallback with placeholder data if Airtable is not connected
    return {
      events: getPlaceholderMarqueeEvents(),
      seasonBlocks: SEASON_BLOCKS.map((block) => ({
        ...block,
        totalSlots: 24,
        availableSlots: Math.floor(Math.random() * 16) + 4,
      })),
      availability: [] as AvailabilityByMonth[],
    };
  }
}

function getPlaceholderMarqueeEvents() {
  const placeholders = [
    { name: "Tour de France 2026", start: "2026-07-04", end: "2026-07-26", tier: "1" as const },
    { name: "Giro d\u2019Italia 2026", start: "2026-05-09", end: "2026-05-31", tier: "2" as const },
    { name: "Vuelta a Espa\u00f1a 2026", start: "2026-08-15", end: "2026-09-06", tier: "2" as const },
  ];

  return placeholders.map((e, i) => ({
    id: `placeholder-${i}`,
    eventName: e.name,
    startDate: e.start,
    endDate: e.end,
    premiumTier: e.tier,
    status: "upcoming" as const,
    totalSlots: Math.floor(Math.random() * 30) + 10,
    availableSlots: Math.floor(Math.random() * 20) + 2,
  }));
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default async function SponsorPage() {
  const { events, seasonBlocks, availability } = await getBookingFlowData();

  return (
    <>
      <Header />
      <main>
        {/* ===========================================
            1. HERO
        =========================================== */}
        <Section background="charcoal" fullHeight grain className="relative">
          {/* Aurora background */}
          <div className="aurora-container">
            <div className="aurora-band aurora-band-1" />
            <div className="aurora-band aurora-band-2" />
            <div className="aurora-band aurora-band-3" />
          </div>

          <Container className="relative z-10 text-center">
            <ScrollReveal>
              <h1
                className="font-heading text-hero leading-[0.95] mb-6 text-gradient-animated"
              >
                REAL NUMBERS. REAL DATES.
                <br />
                REAL CYCLING FANS.
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <p className="text-foreground-muted text-body-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                No media kit fluff. Pick a moment or a duration. Choose your slot.
                Upload your assets. Done.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <Button href="#booking-flow" size="lg">
                SEE WHAT&apos;S AVAILABLE
              </Button>
            </ScrollReveal>
          </Container>
        </Section>

        {/* ===========================================
            2. BOOKING FLOW (client component)
        =========================================== */}
        <Section id="booking-flow-section">
          <Container>
            <BookingFlow
              eventBlocks={[
                // Grand Tour events from Airtable
                ...events.map((e) => {
                  const premiumMap: Record<string, number> = { "1": 1.15, "2": 1.10 };
                  return {
                    name: e.eventName,
                    dates: `${new Date(e.startDate).toLocaleDateString("en-GB", { month: "short", day: "numeric" })} \u2013 ${new Date(e.endDate).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" })}`,
                    startDate: e.startDate,
                    endDate: e.endDate,
                    description: "Three weeks of Grand Tour dispatches, daily hot-takes, and race analysis.",
                    episodeCount: 9,
                    newsletterCount: 3,
                    premiumMultiplier: premiumMap[e.premiumTier] ?? 1.0,
                    totalSlots: e.totalSlots,
                    availableSlots: e.availableSlots,
                    selfServe: true,
                  };
                }),
                // Season blocks (hardcoded durations)
                ...seasonBlocks.map((b) => ({
                  name: b.eventName,
                  dates: `${new Date(b.startDate).toLocaleDateString("en-GB", { month: "short", year: "numeric" })} \u2013 ${new Date(b.endDate).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}`,
                  startDate: b.startDate,
                  endDate: b.endDate,
                  description: b.coverageDescription,
                  episodeCount: b.episodeCount,
                  newsletterCount: b.newsletterCount,
                  premiumMultiplier: 1.0,
                  totalSlots: b.totalSlots,
                  availableSlots: b.availableSlots,
                  selfServe: false,
                })),
              ]}
            />
          </Container>
        </Section>

        {/* ===========================================
            3. PROOF BLOCK
        =========================================== */}
        <Section background="deep-purple" className="section-glow-purple">
          <Container>
            <ScrollReveal>
              <h2 className="font-heading text-[clamp(2rem,4vw,3.75rem)] text-center mb-4">
                BRANDS THAT DIDN&apos;T NEED TO BE CONVINCED TWICE
              </h2>
              <p className="text-foreground-muted text-center text-body-lg mb-12">
                A few of the brands who&apos;ve already figured out that this audience buys things.
              </p>
            </ScrollReveal>

            {/* Logo row */}
            <ScrollReveal delay={0.1}>
              <div className="flex items-center justify-center gap-8 md:gap-12 flex-wrap mb-16">
                {brandPartners.map((partner) => (
                  <div
                    key={partner.name}
                    className="relative w-24 md:w-32 h-12 md:h-16 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all"
                    style={{ transitionDuration: "var(--duration-normal)" }}
                  >
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      fill
                      className={`object-contain ${partner.invert ? "invert" : ""}`}
                      sizes="128px"
                    />
                  </div>
                ))}
              </div>
            </ScrollReveal>

            {/* 4iiii testimonial */}
            <ScrollReveal delay={0.2}>
              <blockquote className="text-center max-w-2xl mx-auto mb-16">
                <p className="font-heading text-[clamp(1.5rem,3vw,2.5rem)] text-off-white mb-4 leading-tight">
                  &ldquo;THE ROADMAN AUDIENCE DOESN&apos;T JUST LISTEN &mdash; THEY ACT.&rdquo;
                </p>
                <cite className="text-foreground-muted text-sm not-italic">
                  &mdash; 4iiii
                </cite>
              </blockquote>
            </ScrollReveal>

            {/* Audience numbers */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <ScrollReveal delay={0}>
                <div className="text-center stat-card-pulse rounded-xl p-6">
                  <p className="font-heading text-[clamp(2.5rem,5vw,4rem)] text-coral stat-glow">
                    <AnimatedCounter value="1M+" />
                  </p>
                  <p className="text-foreground-muted text-sm mt-2">
                    Monthly podcast listeners
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.1}>
                <div className="text-center stat-card-pulse rounded-xl p-6">
                  <p className="font-heading text-[clamp(2.5rem,5vw,4rem)] text-coral stat-glow">
                    <AnimatedCounter value="\u00a385K" />
                  </p>
                  <p className="text-foreground-muted text-sm mt-2">
                    Average household income
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.2}>
                <div className="text-center stat-card-pulse rounded-xl p-6">
                  <p className="font-heading text-[clamp(2.5rem,5vw,4rem)] text-coral stat-glow">
                    <AnimatedCounter value="73%" />
                  </p>
                  <p className="text-foreground-muted text-sm mt-2">
                    Purchase intent
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.3}>
                <div className="text-center stat-card-pulse rounded-xl p-6">
                  <p className="font-heading text-[clamp(2.5rem,5vw,4rem)] text-coral stat-glow">
                    <AnimatedCounter value="\u00a34,200" />
                  </p>
                  <p className="text-foreground-muted text-sm mt-2">
                    Annual cycling spend
                  </p>
                </div>
              </ScrollReveal>
            </div>

            <ScrollReveal delay={0.4}>
              <p className="text-foreground-subtle text-sm text-center max-w-2xl mx-auto">
                Full audience report available on request.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* ===========================================
            4. FAQ (4 questions)
        =========================================== */}
        <FAQSection />
      </main>
      <Footer />
    </>
  );
}
