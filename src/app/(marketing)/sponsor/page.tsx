import type { Metadata } from "next";
import Image from "next/image";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal, GradientText, AnimatedCounter } from "@/components/ui";
import { getEvents, getAvailability, BASE_RATES, EVENT_MULTIPLIERS } from "@/lib/inventory";
import type { Event, AvailabilityByMonth } from "@/lib/inventory";
import {
  EventsCalendar,
  FAQSection,
  RecommendationQuiz,
  SpotlightBooking,
  QuarterBooking,
  AnnualApplication,
} from "./SponsorClientSections";

export const metadata: Metadata = {
  title: "Sponsor — Roadman Cycling",
  description:
    "Real inventory. Live pricing. Actual dates. Sponsor the biggest cycling podcast in Europe — Spotlight, Quarter, or Annual partnerships available.",
  alternates: {
    canonical: "https://roadmancycling.com/sponsor",
  },
  openGraph: {
    title: "Sponsor Roadman Cycling",
    description:
      "No media kit fluff. Actual inventory, live pricing, and a calendar that shows exactly what's available.",
    type: "website",
    url: "https://roadmancycling.com/sponsor",
  },
};

// Coverage plan copy for each event — written in Roadman voice
const COVERAGE_PLANS: Record<string, string> = {
  "Spring Classics Block":
    "The monuments. The cobbles. The crosswinds. Two weeks of the hardest one-day racing on the calendar, covered daily with dedicated podcast episodes, social content, and newsletter sends. Sponsor gets placement across every dispatch episode and dedicated email coverage.",
  "Giro d'Italia 2026":
    "Three weeks of Italian racing. Daily podcast dispatches, two long-form YouTube pieces, and dedicated newsletter sends throughout. Sponsor gets read-outs in every daily episode and logo placement in all dedicated sends.",
  "Critérium du Dauphiné 2026":
    "The Tour warm-up. Eight days of racing that sets the narrative for July. Daily podcast coverage, social content, and one dedicated YouTube analysis. Sponsor gets placement across all dispatch episodes.",
  "Tour de France 2026":
    "Three weeks. Twenty-one stages. Anthony is in the car for nine of them, with nightly dispatch episodes recorded from the team hotels and published same-day. Full daily podcast coverage for the duration, two long-form YouTube pieces, plus dedicated emails on race morning and when the peloton hits Paris. Sponsor gets read-outs in every daily episode, opening placement in both YouTube pieces, logo in the dedicated sends, and a custom mid-roll recorded by Anthony in-location.",
  "Vuelta a España 2026":
    "Three weeks of Spanish racing to close the Grand Tour season. Daily podcast dispatches, newsletter coverage, and one long-form YouTube debrief. Sponsor gets consistent placement across the full coverage window.",
  "UCI World Championships 2026":
    "The rainbow jersey races. Road, time trial, and team events covered with daily podcast episodes, social content, and dedicated newsletter sends. Premium audience — peak cycling attention.",
  "Il Lombardia 2026":
    "The Race of the Falling Leaves. Season finale monument. Dedicated pre-race episode, live social coverage, and full race debrief podcast. Sponsor gets placement across all race-week content.",
  "Migration Gravel 2026":
    "This is Roadman's own race. We built it. We run it. We cover every inch of it. Two dedicated pre-race episodes, live social coverage on the day, a full race debrief episode, and a short-form YouTube doc. The audience for this one is not passive — these are the people who paid to turn up and ride. Sponsor gets title placement in the pre-race episodes, branding across all race-day comms, logo on the event page, and an on-site mention in Anthony's race-day address.",
  "Roadman Performance Camp 2026":
    "Three days in the mountains with Roadman listeners. Dedicated pre-camp episode, daily social coverage, post-camp debrief podcast, and YouTube highlights. Sponsor gets on-site branding, product placement opportunities, and content integration across all camp media.",
  "Winter Indoor Season 2026–27":
    "Off-season content block. Training-focused episodes three times per week, indoor training guides, and newsletter coverage. Consistent audience through the winter months when cyclists are planning their next season — and their next purchases.",
};

// Build event card data from the data layer
async function getEventCards() {
  try {
    const now = new Date();
    const sixMonthsLater = new Date(now);
    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 12);

    const events = await getEvents({
      dateRange: {
        from: now.toISOString().slice(0, 10),
        to: sixMonthsLater.toISOString().slice(0, 10),
      },
    });

    const availability = await getAvailability({
      from: now.toISOString().slice(0, 10),
      to: sixMonthsLater.toISOString().slice(0, 10),
    });

    // Map events to card data
    return events.map((event) => {
      // Sum availability across all months that fall within this event's date range
      let totalSlots = 0;
      let availableSlots = 0;
      let minRate = Infinity;

      for (const monthData of availability) {
        const monthStart = `${monthData.month}-01`;
        const monthEnd = `${monthData.month}-31`;

        if (monthStart <= event.endDate && monthEnd >= event.startDate) {
          for (const [type, counts] of Object.entries(monthData.byType)) {
            totalSlots += counts.total;
            availableSlots += counts.available;
            const rate = BASE_RATES[type as keyof typeof BASE_RATES];
            const multiplier = EVENT_MULTIPLIERS[event.premiumTier];
            if (rate * multiplier < minRate) {
              minRate = rate * multiplier;
            }
          }
        }
      }

      return {
        id: event.id,
        eventName: event.eventName,
        startDate: event.startDate,
        endDate: event.endDate,
        premiumTier: event.premiumTier,
        coveragePlan: COVERAGE_PLANS[event.eventName] ?? event.coveragePlan,
        status: event.status,
        totalSlots,
        availableSlots,
        minRate: minRate === Infinity ? 0 : minRate,
      };
    });
  } catch {
    // If Airtable is not connected yet, return placeholder data
    return getPlaceholderEvents();
  }
}

function getPlaceholderEvents() {
  const events = [
    { name: "Spring Classics Block", start: "2026-04-04", end: "2026-04-19", tier: "2" },
    { name: "Giro d'Italia 2026", start: "2026-05-09", end: "2026-05-31", tier: "2" },
    { name: "Critérium du Dauphiné 2026", start: "2026-06-07", end: "2026-06-14", tier: "3" },
    { name: "Tour de France 2026", start: "2026-07-04", end: "2026-07-26", tier: "1" },
    { name: "Vuelta a España 2026", start: "2026-08-15", end: "2026-09-06", tier: "2" },
    { name: "UCI World Championships 2026", start: "2026-09-20", end: "2026-09-27", tier: "1" },
    { name: "Il Lombardia 2026", start: "2026-10-10", end: "2026-10-10", tier: "3" },
    { name: "Migration Gravel 2026", start: "2026-10-24", end: "2026-10-25", tier: "3" },
    { name: "Roadman Performance Camp 2026", start: "2026-11-14", end: "2026-11-16", tier: "3" },
    { name: "Winter Indoor Season 2026–27", start: "2026-11-01", end: "2027-02-28", tier: "3" },
  ];

  return events.map((e, i) => ({
    id: `placeholder-${i}`,
    eventName: e.name,
    startDate: e.start,
    endDate: e.end,
    premiumTier: e.tier,
    coveragePlan: COVERAGE_PLANS[e.name] ?? null,
    status: "upcoming",
    totalSlots: Math.floor(Math.random() * 30) + 10,
    availableSlots: Math.floor(Math.random() * 20) + 2,
    minRate: BASE_RATES.podcast_endroll * EVENT_MULTIPLIERS[e.tier as "1" | "2" | "3"],
  }));
}

const brandPartners = [
  { name: "TrainingPeaks", logo: "/images/partners/trainingpeaks.png", invert: true },
  { name: "SRAM", logo: "/images/partners/sram.png", invert: false },
  { name: "Parlee", logo: "/images/partners/parlee.png", invert: false },
  { name: "4Endurance", logo: "/images/partners/4endurance.png", invert: false },
  { name: "Bikmo", logo: "/images/partners/bikmo.svg", invert: false },
];

export default async function SponsorPage() {
  const eventCards = await getEventCards();

  return (
    <>
      <Header />
      <main>
        {/* ═══════════════════════════════════════════
            1. HERO
        ═══════════════════════════════════════════ */}
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
                No media kit fluff. Actual inventory, live pricing, and a calendar
                that shows exactly what&apos;s available. Pick a slot. Book it. Done.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <Button href="#rates" size="lg">
                SEE RATES AND WHAT&apos;S STILL OPEN
              </Button>
            </ScrollReveal>
          </Container>
        </Section>

        {/* ═══════════════════════════════════════════
            2. EVENTS CALENDAR
        ═══════════════════════════════════════════ */}
        <EventsCalendar events={eventCards} />

        {/* ═══════════════════════════════════════════
            3. THREE-TIER RATE CARD
        ═══════════════════════════════════════════ */}
        <Section id="rates" className="section-glow-coral">
          <Container>
            <ScrollReveal>
              <p className="text-coral font-heading text-sm tracking-widest mb-4">
                EVERGREEN INVENTORY
              </p>
              <h2 className="font-heading text-section mb-6">
                PICK YOUR WEIGHT CLASS
              </h2>
              <p className="text-foreground-muted text-body-lg max-w-3xl mb-16 leading-relaxed">
                Short engagement or long game &mdash; both work. What doesn&apos;t work
                is a brand dropping in for a week and expecting transformation. Pick the
                level that matches where you actually are.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Spotlight */}
              <ScrollReveal delay={0}>
                <Card glass className="p-8 h-full flex flex-col">
                  <p className="text-coral font-heading text-sm tracking-widest mb-2">
                    FROM &pound;500
                  </p>
                  <h3 className="font-heading text-[40px] mb-2">SPOTLIGHT</h3>
                  <p className="text-coral text-sm font-medium mb-4">
                    One placement. In and out. No fuss.
                  </p>
                  <p className="text-foreground-muted leading-relaxed mb-8 flex-grow">
                    You want to test the water before committing to a quarter. Fair
                    enough. Spotlight gives you a single slot &mdash; one end-roll, one
                    mid-roll, or one newsletter classified &mdash; scripted by Anthony,
                    delivered to the full list or full listener base. No long brief
                    process. You tell us what you need said, we say it properly, and we
                    send you the numbers afterwards. If it works, you&apos;ll know.
                  </p>
                  <Button href="#spotlight-booking" size="md" className="w-full">
                    BOOK NOW
                  </Button>
                </Card>
              </ScrollReveal>

              {/* Quarter — Most Popular */}
              <ScrollReveal delay={0.1}>
                <Card glass className="p-8 h-full flex flex-col border-rotating rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-coral font-heading text-sm tracking-widest">
                      FROM &pound;6,000/QUARTER
                    </p>
                    <span className="bg-coral text-off-white text-xs font-heading tracking-wider px-3 py-1 rounded-full">
                      MOST POPULAR
                    </span>
                  </div>
                  <h3 className="font-heading text-[40px] mb-2">QUARTER</h3>
                  <p className="text-coral text-sm font-medium mb-4">
                    Three months. Proper presence. Audience actually learns who you are.
                  </p>

                  {/* Sub-tiers */}
                  <div className="space-y-3 mb-6">
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-heading text-sm text-off-white">STARTER</span>
                        <span className="text-coral font-medium">&pound;6,000</span>
                      </div>
                      <p className="text-foreground-subtle text-xs">
                        6 mid-rolls + 1 dedicated email + 1 banner
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-heading text-sm text-off-white">STANDARD</span>
                        <span className="text-coral font-medium">&pound;12,000</span>
                      </div>
                      <p className="text-foreground-subtle text-xs">
                        12 mid-rolls + 3 dedicated sends + 1 YouTube
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-heading text-sm text-off-white">PREMIUM</span>
                        <span className="text-coral font-medium">&pound;20,000</span>
                      </div>
                      <p className="text-foreground-subtle text-xs">
                        24 mid-rolls + 6 dedicated sends + 2 YouTube + 1 co-produced piece
                      </p>
                    </div>
                  </div>

                  <p className="text-foreground-muted leading-relaxed mb-8 flex-grow text-sm">
                    One mention doesn&apos;t move a room. But twelve weeks of consistent
                    placement &mdash; mid-rolls in the episodes your audience listens to
                    on their Saturday ride, a dedicated email to 40,000+ subscribers,
                    your brand turning up in the YouTube pieces they share &mdash;
                    that&apos;s when something shifts.
                  </p>
                  <Button href="#quarter-booking" size="md" className="w-full">
                    CHECK AVAILABILITY
                  </Button>
                </Card>
              </ScrollReveal>

              {/* Annual */}
              <ScrollReveal delay={0.2}>
                <Card glass className="p-8 h-full flex flex-col">
                  <p className="text-coral font-heading text-sm tracking-widest mb-2">
                    FROM &pound;8,000/MONTH
                  </p>
                  <h3 className="font-heading text-[40px] mb-2">ANNUAL TITLE PARTNER</h3>
                  <p className="text-coral text-sm font-medium mb-4">
                    Three brands. All year. First at everything.
                  </p>
                  <p className="text-foreground-muted leading-relaxed mb-8 flex-grow">
                    There are three slots. That&apos;s the policy, and it won&apos;t
                    change. Title partners get first refusal on every event, logo
                    placement on the /partners page for the full year, a quarterly
                    strategy call with Anthony to plan what&apos;s coming and where your
                    brand sits in it, and the kind of deep audience familiarity that only
                    happens when you&apos;re consistently present across twelve months of
                    serious cycling content. This isn&apos;t a package you buy off a
                    shelf. It&apos;s an ongoing working relationship. If that&apos;s what
                    you&apos;re after, apply below and we&apos;ll have a proper
                    conversation.
                  </p>
                  <Button href="#annual-booking" variant="secondary" size="md" className="w-full">
                    APPLY FOR PARTNERSHIP
                  </Button>
                </Card>
              </ScrollReveal>
            </div>
          </Container>
        </Section>

        {/* ═══════════════════════════════════════════
            4. PROOF BLOCK
        ═══════════════════════════════════════════ */}
        <Section>
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

            {/* Case study */}
            <ScrollReveal delay={0.2}>
              <Card glass className="p-8 md:p-12 mb-12">
                <p className="text-coral font-heading text-sm tracking-widest mb-3">
                  CASE STUDY
                </p>
                <h3 className="font-heading text-[32px] md:text-[40px] mb-4">
                  DISCOVERY+ &times; GIRO D&apos;ITALIA
                </h3>
                <p className="text-foreground-muted leading-relaxed max-w-2xl">
                  The Discovery+ partnership around the Giro d&apos;Italia is
                  documented in full. If you want to see how a major media brand
                  integrated into a race coverage block and what the results looked
                  like, that case study is available &mdash; ask for it in the
                  enquiry form.
                </p>
              </Card>
            </ScrollReveal>

            {/* Testimonial */}
            <ScrollReveal delay={0.3}>
              <blockquote className="text-center max-w-2xl mx-auto">
                <p className="font-heading text-[clamp(1.5rem,3vw,2.5rem)] text-off-white mb-4 leading-tight">
                  &ldquo;THE ROADMAN AUDIENCE DOESN&apos;T JUST LISTEN &mdash; THEY ACT.&rdquo;
                </p>
                {/* [CONFIRM: exact quote and attribution name/title needed from Anthony] */}
                <cite className="text-foreground-muted text-sm not-italic">
                  &mdash; 4iiii
                </cite>
              </blockquote>
            </ScrollReveal>
          </Container>
        </Section>

        {/* ═══════════════════════════════════════════
            5. AUDIENCE BLOCK
        ═══════════════════════════════════════════ */}
        <Section background="deep-purple" className="section-glow-purple">
          <Container>
            <ScrollReveal>
              <p className="text-foreground-muted text-body-lg max-w-3xl mb-12 leading-relaxed">
                Look, if the audience numbers don&apos;t work for your brand, nothing
                else on this page matters. So here they are.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {/* [CONFIRM] — all stat values are placeholders pending confirmation */}
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
                    <AnimatedCounter value="£85K" />
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
                    <AnimatedCounter value="£4,200" />
                  </p>
                  <p className="text-foreground-muted text-sm mt-2">
                    Annual cycling spend
                  </p>
                </div>
              </ScrollReveal>
            </div>

            <ScrollReveal delay={0.4}>
              <p className="text-foreground-subtle text-sm text-center max-w-2xl mx-auto">
                Full audience report &mdash; demographics, device split, geographic
                breakdown, purchasing behaviour &mdash; available on request. Ask for
                it in the enquiry form.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* ═══════════════════════════════════════════
            6. FAQ
        ═══════════════════════════════════════════ */}
        <FAQSection />

        {/* ═══════════════════════════════════════════
            7. RECOMMENDATION QUIZ
        ═══════════════════════════════════════════ */}
        <RecommendationQuiz />

        {/* ═══════════════════════════════════════════
            8. BOOKING FLOWS
        ═══════════════════════════════════════════ */}
        <Section id="booking">
          <Container>
            <ScrollReveal>
              <h2 className="font-heading text-section mb-12">BOOK YOUR SLOT</h2>
            </ScrollReveal>

            <div className="space-y-24">
              <ScrollReveal>
                <SpotlightBooking />
              </ScrollReveal>

              <div className="gradient-divider" />

              <ScrollReveal>
                <QuarterBooking />
              </ScrollReveal>

              <div className="gradient-divider" />

              <ScrollReveal>
                <AnnualApplication />
              </ScrollReveal>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
