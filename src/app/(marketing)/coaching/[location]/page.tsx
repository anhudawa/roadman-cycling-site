import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal, GradientText } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { FAQSchema } from "@/components/seo/FAQSchema";

interface LocationData {
  title: string;
  seoTitle: string;
  seoDescription: string;
  heroSubtitle: string;
  heroBody: string;
  areaServed: string;
  countryCode: string;
  localContext: string;
  testimonials: {
    quote: string;
    name: string;
    detail: string;
  }[];
  faqs: { question: string; answer: string }[];
  localContent: string[];
}

const LOCATIONS: Record<string, LocationData> = {
  ireland: {
    title: "Cycling Coach Ireland",
    seoTitle: "Cycling Coach Ireland — Online Coaching from Dublin",
    seoDescription:
      "Online cycling coaching from Dublin, Ireland. Personalised training plans, nutrition, strength, and accountability from Anthony Walsh and the Roadman Cycling team. Trusted by Irish cyclists from club racers to national-level competitors.",
    heroSubtitle: "IRELAND'S MOST LISTENED-TO CYCLING COACH",
    heroBody:
      "Roadman Cycling is based in Dublin and has been coaching Irish cyclists since the podcast launched. Whether you ride the Wicklow mountains, race on the Mondello circuit, or are training for the Ring of Kerry, your plan is built around Irish roads, Irish weather, and your actual schedule.",
    areaServed: "Ireland",
    countryCode: "IE",
    localContext: "Dublin, Ireland",
    testimonials: [
      {
        quote:
          "I was an average sportive rider who had plateaued. Roadman custom built a plan to achieve my goals. I've gotten much more out of Roadman than I ever imagined.",
        name: "Damien Maloney",
        detail: "Ireland — FTP: 205w → 295w",
      },
      {
        quote:
          "From 113kg to 97kg. The structured approach to training and nutrition changed everything. I'm faster, lighter, and actually enjoying the process.",
        name: "Chris O'Connor",
        detail: "Ireland — Lost 16kg",
      },
      {
        quote:
          "The accountability and structure is what makes the difference. Having someone who understands Irish racing and the conditions we train in — it just works.",
        name: "John Devlin",
        detail: "Ireland — Club racer",
      },
    ],
    faqs: [
      {
        question: "Can I meet my cycling coach in person in Dublin?",
        answer:
          "Yes. Roadman Cycling is based in Dublin and runs the Roadman CC club rides. While all coaching is delivered online through TrainingPeaks and Zoom, Premium members in Dublin can join club rides and occasionally meet Anthony in person. The online delivery means you get the same quality of coaching whether you are in Dublin, Cork, Galway, or anywhere in Ireland.",
      },
      {
        question: "Does Roadman coach for Irish cycling events?",
        answer:
          "Yes. We regularly coach riders for events like the Ring of Kerry, Wicklow 200, Ras Tailteann, and local league racing. Your training plan is periodised around your target events with specific preparation blocks, tapering, and race-day strategy.",
      },
      {
        question: "Is this suitable for Cycling Ireland licence holders?",
        answer:
          "Absolutely. We coach riders from A4 through to A1 and have helped multiple members move up categories. Your plan accounts for the Irish racing calendar, typical race profiles, and the specific demands of racing in Ireland.",
      },
    ],
    localContent: [
      "Based in Dublin with deep roots in Irish cycling",
      "Coaching riders for Ring of Kerry, Wicklow 200, and league racing",
      "Home of Roadman CC — Dublin's fastest-growing cycling club",
      "Plans built for Irish weather, Irish roads, and Irish racing",
    ],
  },
  uk: {
    title: "Cycling Coach UK",
    seoTitle: "Cycling Coach UK — Online Cycling Coaching",
    seoDescription:
      "Online cycling coaching for UK riders. Personalised training plans, nutrition, strength, and accountability. From sportive riders to British Cycling licence holders. Trusted by cyclists across England, Scotland, Wales, and Northern Ireland.",
    heroSubtitle: "TRUSTED BY UK CYCLISTS FROM CLUBBERS TO CAT 1",
    heroBody:
      "Roadman Cycling coaches riders across England, Scotland, Wales, and Northern Ireland. Whether you are training for a sportive like Ride London, racing in your local league, or chasing a British Cycling category upgrade, your plan is built around your goals, your hours, and your life.",
    areaServed: "United Kingdom",
    countryCode: "GB",
    localContext: "United Kingdom",
    testimonials: [
      {
        quote:
          "The system took me from Cat 3 to Cat 1. The structured approach changed everything about how I train and race.",
        name: "Daniel Stone",
        detail: "UK — Cat 3 → Cat 1",
      },
      {
        quote:
          "This really works. I'm training so much less than last year, at lower intensities and not getting sick. FTHR up from 175 to 180, peak HR up to 193.",
        name: "Brian Morrissey",
        detail: "UK — Age 52, shift worker",
      },
      {
        quote:
          "I tried TrainerRoad, Zwift plans, self-coaching — nothing stuck. Having a real coach who adjusts my plan weekly based on how I actually feel is a completely different experience.",
        name: "Aaron Kearney",
        detail: "UK — Time-crunched rider",
      },
    ],
    faqs: [
      {
        question: "Do you coach for British Cycling events and races?",
        answer:
          "Yes. We coach riders competing in British Cycling road races, criteriums, time trials, and hill climbs. Your plan is periodised around the British racing calendar with targeted preparation for your priority events. We have helped multiple UK riders achieve category upgrades.",
      },
      {
        question: "Can you coach me for Ride London or other UK sportives?",
        answer:
          "Absolutely. Sportive preparation is one of our most popular coaching goals. Whether it is Ride London, the Etape du Tour, Dragon Ride, or a local charity event, we build a structured plan that gets you to the start line prepared and confident.",
      },
      {
        question: "What time zone are coaching calls for UK riders?",
        answer:
          "Coaching calls are scheduled flexibly to suit your availability. We are based in Dublin which is on GMT/BST — the same time zone as the UK. Group coaching calls, 1:1 sessions, and community events are all at UK-friendly times.",
      },
    ],
    localContent: [
      "Same time zone — Dublin operates on GMT/BST like the UK",
      "Coaching for British Cycling racing, sportives, and time trials",
      "Members across England, Scotland, Wales, and Northern Ireland",
      "Plans built for UK roads, weather, and the British racing calendar",
    ],
  },
  usa: {
    title: "Cycling Coach USA",
    seoTitle: "Cycling Coach USA — Online Cycling Coaching Program",
    seoDescription:
      "Online cycling coaching for American riders. Personalised training plans, nutrition, strength, and accountability. From gran fondos to USAC racing. Coaching cyclists across all 50 states with flexible scheduling across time zones.",
    heroSubtitle: "THE COACHING SYSTEM TRUSTED BY CYCLISTS ACROSS AMERICA",
    heroBody:
      "Roadman Cycling coaches riders across the United States — from New York to California, Texas to Colorado. Whether you are training for a USAC crit, a gran fondo, or your first century ride, your plan is built around your goals, your time zone, and your life.",
    areaServed: "United States",
    countryCode: "US",
    localContext: "United States",
    testimonials: [
      {
        quote:
          "From 315lbs to sub-100kg, and I'm still going. The accountability and structure changed my life — not just my cycling.",
        name: "Gregory Gross",
        detail: "USA — Weight loss transformation",
      },
      {
        quote:
          "I was an average sportive rider who had plateaued. Roadman custom built a plan to achieve my goals. I've gotten much more out of Roadman than I ever imagined.",
        name: "Damien Maloney",
        detail: "FTP: 205w → 295w",
      },
      {
        quote:
          "The system took me from Cat 3 to Cat 1. The structured approach changed everything about how I train and race.",
        name: "Daniel Stone",
        detail: "Cat 3 → Cat 1",
      },
    ],
    faqs: [
      {
        question: "What time zone are coaching calls for US riders?",
        answer:
          "All coaching communication is asynchronous-first — you update your training log and your coach reviews and adjusts your plan on their schedule. For live coaching calls, we offer flexible scheduling that works across US time zones. Many of our American members prefer evening calls EST which align with morning time in Dublin.",
      },
      {
        question: "Do you coach for USAC races and American events?",
        answer:
          "Yes. We coach riders competing in USAC criteriums, road races, time trials, and gran fondos across the United States. Your plan is built around the American racing calendar and your specific target events, with proper periodisation, tapering, and race-day strategy.",
      },
      {
        question: "Is online coaching as effective as having a local coach?",
        answer:
          "Online coaching is often more effective because your coach has access to all your training data — power files, heart rate trends, sleep metrics, and subjective feedback — which gives a more complete picture than a local coach who sees you once a week. The key is communication, and our system is built around regular asynchronous check-ins plus live calls when needed.",
      },
    ],
    localContent: [
      "Flexible scheduling across all US time zones",
      "Coaching for USAC racing, gran fondos, and century rides",
      "Asynchronous-first communication for cross-Atlantic coaching",
      "Members across all 50 states from New York to California",
    ],
  },
};

interface Props {
  params: Promise<{ location: string }>;
}

export function generateStaticParams() {
  return Object.keys(LOCATIONS).map((location) => ({ location }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { location } = await params;
  const data = LOCATIONS[location];
  if (!data) return {};

  return {
    title: data.seoTitle,
    description: data.seoDescription,
    alternates: {
      canonical: `https://roadmancycling.com/coaching/${location}`,
    },
    openGraph: {
      title: data.seoTitle,
      description: data.seoDescription,
      type: "website",
      url: `https://roadmancycling.com/coaching/${location}`,
    },
  };
}

export default async function CoachingLocationPage({ params }: Props) {
  const { location } = await params;
  const data = LOCATIONS[location];
  if (!data) notFound();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: `Roadman Cycling Coaching — ${data.areaServed}`,
          description: data.seoDescription,
          serviceType: "Online Cycling Coaching",
          provider: {
            "@type": "Person",
            name: "Anthony Walsh",
            jobTitle: "Head Coach & Founder",
            url: "https://roadmancycling.com",
          },
          areaServed: {
            "@type": "Country",
            name: data.areaServed,
          },
          offers: {
            "@type": "Offer",
            name: "Not Done Yet — Personalised Coaching",
            price: "195",
            priceCurrency: "USD",
            description:
              "1:1 personalised coaching across training, nutrition, strength, recovery, and accountability",
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
              name: "Coaching",
              item: "https://roadmancycling.com/coaching",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: data.title,
              item: `https://roadmancycling.com/coaching/${location}`,
            },
          ],
        }}
      />

      {/* LocalBusiness schema for Ireland — triggers Google local business features */}
      {location === "ireland" && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "Roadman Cycling",
            description:
              "Personalised online cycling coaching from Dublin, Ireland. Training, nutrition, strength, recovery, and accountability.",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Dublin",
              addressCountry: "IE",
            },
            geo: {
              "@type": "GeoCoordinates",
              latitude: 53.3498,
              longitude: -6.2603,
            },
            url: "https://roadmancycling.com/coaching/ireland",
            priceRange: "$195/month",
            sameAs: [
              "https://youtube.com/@theroadmanpodcast",
              "https://instagram.com/roadman.cycling",
            ],
          }}
        />
      )}

      <Header />

      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-20">
          <Container className="text-center">
            <ScrollReveal direction="up">
              <p className="text-coral font-heading text-sm tracking-widest mb-6">
                {data.heroSubtitle}
              </p>
              <h1
                className="font-heading text-off-white mb-6"
                style={{ fontSize: "var(--text-hero)" }}
              >
                {data.title.toUpperCase()}
              </h1>
              <p className="text-foreground-muted text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
                {data.heroBody}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
                <Button href="/apply" size="lg">
                  Apply Now — 7-Day Free Trial
                </Button>
                <Button href="/coaching" variant="ghost" size="lg">
                  See All Coaching Options
                </Button>
              </div>
              <p className="text-foreground-subtle text-sm">
                $195/month. 7-day free trial. Cancel anytime.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Local context */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                WHY ROADMAN FOR {data.areaServed.toUpperCase()} CYCLISTS
              </h2>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.localContent.map((item, i) => (
                <ScrollReveal key={item} direction="up" delay={i * 0.08}>
                  <Card className="p-5" hoverable={false}>
                    <div className="flex items-start gap-3">
                      <span className="text-coral mt-0.5 shrink-0">
                        &#10003;
                      </span>
                      <p className="text-sm text-foreground-muted leading-relaxed">
                        {item}
                      </p>
                    </div>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Five Pillars summary */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                <GradientText as="span">
                  FIVE PILLARS. ONE SYSTEM.
                </GradientText>
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto leading-relaxed">
                Every coaching programme covers training, nutrition, strength,
                recovery, and accountability. Not just workouts — a complete
                system built around your life.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {["Training", "Nutrition", "Strength", "Recovery", "Accountability"].map(
                (pillar, i) => (
                  <ScrollReveal key={pillar} direction="up" delay={i * 0.06}>
                    <Card className="p-4 text-center" glass hoverable={false}>
                      <p className="font-heading text-sm text-coral tracking-wider">
                        {pillar.toUpperCase()}
                      </p>
                    </Card>
                  </ScrollReveal>
                )
              )}
            </div>
          </Container>
        </Section>

        {/* Testimonials */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                RESULTS FROM {data.areaServed.toUpperCase()} CYCLISTS
              </h2>
            </ScrollReveal>

            <div className="space-y-4">
              {data.testimonials.map((t, i) => (
                <ScrollReveal
                  key={t.name}
                  direction={i % 2 === 0 ? "left" : "right"}
                >
                  <Card className="p-6" glass hoverable={false}>
                    <p className="text-foreground-muted italic leading-relaxed mb-4">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-coral font-heading tracking-wider">
                        {t.name.toUpperCase()}
                      </p>
                      <p className="text-xs text-foreground-subtle">
                        &middot; {t.detail}
                      </p>
                    </div>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* FAQ */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up" className="text-center mb-12">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                COMMON QUESTIONS
              </h2>
            </ScrollReveal>

            <FAQSchema faqs={data.faqs} />

            <div className="space-y-4">
              {data.faqs.map((item, i) => (
                <ScrollReveal key={item.question} direction="up" delay={i * 0.06}>
                  <Card className="p-6" hoverable={false}>
                    <h3 className="font-heading text-lg text-off-white mb-3">
                      {item.question.toUpperCase()}
                    </h3>
                    <p className="text-sm text-foreground-muted leading-relaxed">
                      {item.answer}
                    </p>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* CTA */}
        <Section background="coral" className="!py-16 md:!py-24">
          <Container className="text-center">
            <h2
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              START COACHING TODAY.
            </h2>
            <p className="text-off-white/80 max-w-lg mx-auto mb-8">
              7-day free trial. Five pillars. Personalised to your goals.
              Coaching cyclists in {data.areaServed} and worldwide.
            </p>
            <Button href="/apply" size="lg" className="bg-off-white text-coral hover:bg-off-white/90">
              Apply Now
            </Button>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 text-off-white/60 text-sm">
              <span>$195/month</span>
              <span className="hidden sm:inline">&middot;</span>
              <span>7-day free trial</span>
              <span className="hidden sm:inline">&middot;</span>
              <span>Cancel anytime</span>
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
