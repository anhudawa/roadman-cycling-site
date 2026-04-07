import type { Metadata } from "next";
import Image from "next/image";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button, Card, ScrollReveal } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { DublinRouteMap } from "@/components/features/club/DublinRouteMap";

export const metadata: Metadata = {
  title: "Roadman CC — Dublin Cycling Club",
  description:
    "Three rides a week. One community. Dublin's cycling club for riders who still believe the best is ahead. Thursday Phoenix Park. Saturday and Sunday from Clontarf.",
  keywords: [
    "cycling club Dublin",
    "Dublin cycling club",
    "Roadman CC",
    "group rides Dublin",
    "cycling club Ireland",
  ],
  alternates: { canonical: "https://roadmancycling.com/community/club" },
  openGraph: {
    title: "Roadman CC — Dublin Cycling Club",
    description:
      "Three rides a week. One community. Dublin's cycling club for riders who still believe the best is ahead. Thursday Phoenix Park. Saturday and Sunday from Clontarf.",
    type: "website",
    url: "https://roadmancycling.com/community/club",
  },
};

const rides = [
  {
    day: "Thursday",
    time: "6:30 PM",
    location: "Pope's Cross, Phoenix Park",
    name: "The Circuit",
    tagline: "Sixty minutes. Open road. No hiding.",
    description:
      "A closed-loop circuit in the Park. Fast enough to hurt, structured enough to learn. Get dropped on the climb, catch back on the descent. The lap resets everything.",
    distance: "~40km",
  },
  {
    day: "Saturday",
    time: "9:30 AM",
    location: "360 Cycles, Clontarf",
    name: "The Main Ride",
    tagline: "Ninety kilometres. Two groups. One cafe stop.",
    description:
      "The ride that defines the week. Undulating roads north of the city, a stop where the conversation matters as much as the coffee, and two pace groups so nobody rides alone.",
    distance: "~90km",
  },
  {
    day: "Sunday",
    time: "10:00 AM",
    location: "360 Cycles, Clontarf",
    name: "The Sunday Spin",
    tagline: "Nobody gets dropped. Everybody gets home.",
    description:
      "Eighty kilometres at a pace that lets you talk. A cafe stop. A no-drop policy that means exactly what it says. The ride for when the legs are tired and the company is the point.",
    distance: "~80km",
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
            "Dublin cycling club. Three weekly group rides for all levels.",
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

      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-20">
          <Container width="narrow" className="text-center">
            <ScrollReveal direction="up">
              <p className="text-foreground-subtle text-sm tracking-[0.3em] uppercase mb-6">
                Dublin, Ireland
              </p>
              <h1
                className="font-heading text-off-white mb-8"
                style={{ fontSize: "var(--text-hero)" }}
              >
                ROADMAN CC
              </h1>
              <p className="text-foreground-muted text-xl leading-relaxed max-w-lg mx-auto">
                One message turns into a plan. Routes mapped. Bidon filled. The
                season begins the moment you show up.
              </p>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Photo Grid */}
        <Section background="charcoal" className="!py-8">
          <Container>
            <ScrollReveal direction="up">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="relative aspect-square rounded-lg overflow-hidden col-span-2 row-span-2">
                  <Image
                    src="/images/community/club-3.jpg"
                    alt="The Roadman CC crew at the summit — group photo"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="relative aspect-square rounded-lg overflow-hidden">
                  <Image
                    src="/images/community/club-4.png"
                    alt="Riders in Roadman kit from above"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                <div className="relative aspect-square rounded-lg overflow-hidden">
                  <Image
                    src="/images/community/DSC05601.JPG"
                    alt="Riders on an epic climb through canyon terrain"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                <div className="relative aspect-square rounded-lg overflow-hidden">
                  <Image
                    src="/images/community/DSC05644.JPG"
                    alt="Post-ride refuelling in the shade"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                <div className="relative aspect-square rounded-lg overflow-hidden">
                  <Image
                    src="/images/community/DSC05670.JPG"
                    alt="Riders stretching at a summit with observatory views"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Route Map */}
        <Section background="charcoal" className="!pb-0">
          <Container>
            <ScrollReveal direction="up">
              <DublinRouteMap />
            </ScrollReveal>
          </Container>
        </Section>

        {/* The Rides */}
        <Section background="charcoal">
          <Container>
            <div className="grid md:grid-cols-3 gap-8">
              {rides.map((ride, i) => (
                <ScrollReveal key={ride.day} direction="up" delay={i * 0.12}>
                  <div className="h-full">
                    <p className="text-coral font-heading text-sm tracking-widest mb-3">
                      {ride.day.toUpperCase()} &middot; {ride.time}
                    </p>
                    <h2 className="font-heading text-3xl text-off-white mb-2">
                      {ride.name.toUpperCase()}
                    </h2>
                    <p className="text-off-white text-sm font-medium mb-4 italic">
                      {ride.tagline}
                    </p>
                    <p className="text-foreground-muted text-sm leading-relaxed mb-6">
                      {ride.description}
                    </p>
                    <div className="text-xs text-foreground-subtle space-y-1">
                      <p>{ride.location}</p>
                      <p>{ride.distance}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Philosophy — the emotional centre */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <ScrollReveal direction="up">
              <div className="text-center space-y-8">
                <h2
                  className="font-heading text-off-white"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  RIDING THROUGH
                </h2>
                <div className="space-y-6 text-foreground-muted text-lg leading-relaxed">
                  <p>
                    Saturday morning. You roll out of Clontarf and the group
                    finds its rhythm. Someone new sits in and you drift back
                    to make sure they&apos;re okay. The road opens up north of
                    the city and the chat quiets down because the gradient
                    doesn&apos;t care about your week.
                  </p>
                  <p>
                    Your legs start asking questions you don&apos;t want to
                    answer. You hold on anyway. The rider beside you is
                    holding on too. Neither of you says anything. You don&apos;t
                    need to.
                  </p>
                  <p>
                    Over the top. Regroup. The cafe stop where the coffee is
                    average and the conversation is the best part of your
                    weekend. Then home. Wind behind you if you&apos;re lucky.
                    Headwind if you&apos;re not. Either way, you rode through.
                  </p>
                  <p className="text-off-white font-medium">
                    We&apos;re all riding through.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </Container>
        </Section>

        {/* Join */}
        <Section background="charcoal">
          <Container width="narrow" className="text-center">
            <ScrollReveal direction="up">
              <h2
                className="font-heading text-off-white mb-6"
                style={{ fontSize: "var(--text-section)" }}
              >
                COME RIDE WITH US
              </h2>
              <p className="text-foreground-muted text-lg mb-3 max-w-md mx-auto">
                Three rides a week. WhatsApp group. Strava community. Partner
                discounts. Club kit when it drops.
              </p>
              <p className="text-foreground-subtle text-sm mb-10">
                All levels. From first sportive to Cat 1.
              </p>
              <Button
                href="https://www.skool.com/roadmancycling/plans"
                external
                size="lg"
              >
                Join Roadman CC
              </Button>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.15}>
              <div className="mt-16 pt-12 border-t border-white/5 grid grid-cols-2 gap-8 text-left max-w-sm mx-auto">
                <div>
                  <p className="text-xs text-foreground-subtle uppercase tracking-widest mb-2">
                    Weekdays
                  </p>
                  <p className="text-sm text-foreground-muted">
                    Pope&apos;s Cross
                    <br />
                    Phoenix Park
                  </p>
                </div>
                <div>
                  <p className="text-xs text-foreground-subtle uppercase tracking-widest mb-2">
                    Weekends
                  </p>
                  <p className="text-sm text-foreground-muted">
                    360 Cycles
                    <br />
                    Clontarf
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
