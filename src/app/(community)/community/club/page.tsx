import type { Metadata } from "next";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Roadman CC — Dublin Cycling Club",
  description:
    "A cycling club for every rider. Weekly group rides in Dublin — Thursday evenings in Phoenix Park, Saturday and Sunday from 360 Cycles, Clontarf. All levels welcome.",
  keywords: [
    "cycling club Dublin",
    "Dublin cycling club",
    "Roadman CC",
    "group rides Dublin",
    "cycling club Ireland",
  ],
  alternates: { canonical: "https://roadmancycling.com/community/club" },
};

const rides = [
  {
    day: "Thursday",
    time: "6:30 PM",
    location: "Pope's Cross, Phoenix Park",
    name: "The Circuit",
    description:
      "Fast 60-minute session on a closed-loop road circuit. If you get dropped, you catch back on the next lap. Sharp, structured, and done before dark.",
    distance: "~40km",
    pace: "Fast",
  },
  {
    day: "Saturday",
    time: "9:30 AM",
    location: "360 Cycles, Clontarf",
    name: "The Main Ride",
    description:
      "The flagship weekly ride. 90km undulating route with a cafe stop in the middle. Two groups to suit different levels. This is where the community comes alive.",
    distance: "~90km",
    pace: "Two groups — all levels",
  },
  {
    day: "Sunday",
    time: "10:00 AM",
    location: "360 Cycles, Clontarf",
    name: "The Sunday Spin",
    description:
      "80km with a cafe stop. Chilled out, no-drop, nobody gets left behind. The ride for when you want the miles without the intensity.",
    distance: "~80km",
    pace: "No-drop — everyone welcome",
  },
];

export default function ClubPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SportsOrganization",
          name: "Roadman CC",
          description:
            "Dublin-based cycling club. Weekly group rides for all levels.",
          url: "https://roadmancycling.com/community/club",
          sport: "Cycling",
          location: {
            "@type": "Place",
            name: "Dublin, Ireland",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Dublin",
              addressCountry: "IE",
            },
          },
          memberOf: {
            "@type": "Organization",
            name: "Roadman Cycling",
          },
        }}
      />

      <Header />

      <main>
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-16">
          <Container className="text-center">
            <ScrollReveal direction="up">
              <p className="text-coral font-heading text-lg mb-4 tracking-widest">
                DUBLIN, IRELAND
              </p>
              <h1
                className="font-heading text-off-white mb-6"
                style={{ fontSize: "var(--text-hero)" }}
              >
                ROADMAN CC
              </h1>
              <p className="text-foreground-muted text-xl max-w-2xl mx-auto mb-8">
                A club for every rider. A community for every journey. Three
                weekly rides, one cafe stop, and the kind of people who make you
                want to clip in even when it&apos;s raining.
              </p>
              <Button
                href="https://www.roadmancycling.com/roadman-club-membership"
                external
                size="lg"
              >
                Join Roadman CC
              </Button>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Rides */}
        <Section background="charcoal">
          <Container>
            <ScrollReveal direction="up" className="text-center mb-12">
              <h2
                className="font-heading text-off-white mb-4"
                style={{ fontSize: "var(--text-section)" }}
              >
                THREE RIDES. EVERY WEEK.
              </h2>
              <p className="text-foreground-muted max-w-lg mx-auto">
                Whether you want to hammer or just spin, there&apos;s a ride for
                you. Show up, clip in, ride through.
              </p>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-6">
              {rides.map((ride, i) => (
                <ScrollReveal key={ride.day} direction="up" delay={i * 0.1}>
                  <Card className="p-6 h-full" hoverable={false}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-3 h-3 rounded-full bg-coral" />
                      <span className="text-xs text-foreground-muted uppercase tracking-widest font-body">
                        {ride.day}
                      </span>
                    </div>
                    <h3 className="font-heading text-2xl text-off-white mb-1">
                      {ride.name.toUpperCase()}
                    </h3>
                    <p className="text-coral font-heading text-sm mb-4">
                      {ride.time} &middot; {ride.distance}
                    </p>
                    <p className="text-foreground-muted text-sm leading-relaxed mb-4">
                      {ride.description}
                    </p>
                    <div className="space-y-2 text-sm">
                      <p className="text-foreground-subtle">
                        <span className="text-off-white">Meeting point:</span>{" "}
                        {ride.location}
                      </p>
                      <p className="text-foreground-subtle">
                        <span className="text-off-white">Pace:</span>{" "}
                        {ride.pace}
                      </p>
                    </div>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Philosophy */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up">
              <h2
                className="font-heading text-off-white text-center mb-8"
                style={{ fontSize: "var(--text-section)" }}
              >
                RIDING THROUGH. TOGETHER.
              </h2>
              <div className="space-y-5 text-foreground-muted leading-relaxed text-center max-w-2xl mx-auto">
                <p>
                  Roadman CC isn&apos;t about racing. It&apos;s about showing up.
                  It&apos;s about the Thursday evening in Phoenix Park when
                  you&apos;re hanging on for dear life and loving every second.
                  It&apos;s about the Saturday cafe stop where the conversation
                  is better than the coffee. It&apos;s about the Sunday spin
                  where nobody gets dropped and everybody gets home smiling.
                </p>
                <p>
                  Health, happiness, and lifelong progression — on and off the
                  bike. That&apos;s what Roadman CC is built around.
                </p>
                <p className="text-off-white font-medium text-lg">
                  We&apos;re all riding through.
                </p>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Membership */}
        <Section background="charcoal">
          <Container width="narrow">
            <ScrollReveal direction="up">
              <div className="bg-background-elevated rounded-xl border border-white/5 p-8 text-center">
                <h2 className="font-heading text-3xl text-off-white mb-4">
                  MEMBERSHIP
                </h2>
                <p className="text-foreground-muted mb-6 max-w-md mx-auto">
                  3 weekly group rides. WhatsApp &amp; Strava community. Exclusive
                  discounts on select brands. All levels welcome.
                </p>
                <ul className="space-y-2 mb-8 text-left max-w-sm mx-auto">
                  {[
                    "3 weekly group rides (Thu, Sat, Sun)",
                    "WhatsApp community group",
                    "Strava club membership",
                    "Exclusive partner discounts",
                    "Club kit (when available)",
                    "All levels — from beginner to Cat 1",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-foreground-muted"
                    >
                      <span className="text-coral mt-0.5 shrink-0">
                        &#10003;
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Button
                  href="https://www.roadmancycling.com/roadman-club-membership"
                  external
                  size="lg"
                >
                  Join Roadman CC
                </Button>
              </div>
            </ScrollReveal>

            {/* Location */}
            <ScrollReveal direction="up" delay={0.1}>
              <div className="mt-8 bg-background-elevated rounded-xl border border-white/5 p-6">
                <h3 className="font-heading text-xl text-off-white mb-3">
                  WHERE TO FIND US
                </h3>
                <div className="space-y-3 text-sm text-foreground-muted">
                  <p>
                    <span className="text-off-white">Weekday base:</span>{" "}
                    Pope&apos;s Cross, Phoenix Park, Dublin
                  </p>
                  <p>
                    <span className="text-off-white">Weekend base:</span> 360
                    Cycles, Clontarf, Dublin
                  </p>
                  <p>
                    <span className="text-off-white">Online:</span>{" "}
                    <a
                      href="https://instagram.com/roadman.cycling"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-coral hover:underline"
                    >
                      @roadman.cycling
                    </a>{" "}
                    on Instagram
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
