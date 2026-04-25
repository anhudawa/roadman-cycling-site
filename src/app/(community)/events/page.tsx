import type { Metadata } from "next";
import { Header, Footer } from "@/components/layout";
import { JsonLd } from "@/components/seo/JsonLd";
import { EventsClient } from "@/components/features/events/EventsClient";

export const metadata: Metadata = {
  title: "Events $€” Weekly Rides, Coaching Calls & Community",
  description:
    "Join the Roadman Cycling community for weekly group rides in Dublin, live coaching calls, and structured training sessions. All levels welcome.",
  alternates: {
    canonical: "https://roadmancycling.com/events",
  },
  openGraph: {
    title: "Events $€” Weekly Rides, Coaching Calls & Community",
    description:
      "Join the Roadman Cycling community for weekly group rides in Dublin, live coaching calls, and structured training sessions.",
    type: "website",
    url: "https://roadmancycling.com/events",
  },
};

export default function EventsPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Roadman Cycling Events",
          description:
            "Weekly group rides, coaching calls, and community events for cyclists in Dublin and online.",
          mainEntity: [
            {
              "@type": "Event",
              name: "Live Coaching Call",
              description:
                "Weekly live Q&A and coaching session with Anthony Walsh.",
              eventSchedule: {
                "@type": "Schedule",
                byDay: "https://schema.org/Monday",
                startTime: "19:30",
                repeatFrequency: "P1W",
              },
              eventAttendanceMode:
                "https://schema.org/OnlineEventAttendanceMode",
              organizer: {
                "@type": "Organization",
                name: "Roadman Cycling",
                url: "https://roadmancycling.com",
              },
            },
            {
              "@type": "Event",
              name: "Thursday Chop",
              description:
                "Fast-paced group ride through Phoenix Park. All abilities welcome.",
              eventSchedule: {
                "@type": "Schedule",
                byDay: "https://schema.org/Thursday",
                startTime: "18:30",
                repeatFrequency: "P1W",
              },
              eventAttendanceMode:
                "https://schema.org/OfflineEventAttendanceMode",
              location: {
                "@type": "Place",
                name: "Popes Cross, Phoenix Park",
                address: {
                  "@type": "PostalAddress",
                  addressLocality: "Dublin",
                  addressCountry: "IE",
                },
              },
              organizer: {
                "@type": "Organization",
                name: "Roadman Cycling",
                url: "https://roadmancycling.com",
              },
            },
            {
              "@type": "Event",
              name: "Saturday Spin",
              description:
                "Community group ride from 360 Cycles, Clontarf. All levels welcome.",
              eventSchedule: {
                "@type": "Schedule",
                byDay: "https://schema.org/Saturday",
                startTime: "09:30",
                repeatFrequency: "P1W",
              },
              eventAttendanceMode:
                "https://schema.org/OfflineEventAttendanceMode",
              location: {
                "@type": "Place",
                name: "360 Cycles, Clontarf",
                address: {
                  "@type": "PostalAddress",
                  addressLocality: "Dublin",
                  addressCountry: "IE",
                },
              },
              organizer: {
                "@type": "Organization",
                name: "Roadman Cycling",
                url: "https://roadmancycling.com",
              },
            },
          ],
        }}
      />

      <Header />

      <main id="main-content">
        <EventsClient />
      </main>

      <Footer />
    </>
  );
}
