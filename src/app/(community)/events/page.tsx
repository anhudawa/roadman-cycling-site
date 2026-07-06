import type { Metadata } from "next";
import { Header, Footer } from "@/components/layout";
import { JsonLd } from "@/components/seo/JsonLd";
import { ENTITY_IDS } from "@/lib/brand-facts";
import {
  nextWeekdayDate,
  EVENT_STATUS_SCHEDULED,
} from "@/lib/event-schema";
import { EventsClient } from "@/components/features/events/EventsClient";

export const metadata: Metadata = {
  title: "Roadman Cycling Events — Dublin Rides & Coaching Calls",
  description:
    "Group rides in Dublin and live coaching calls with Anthony, week in week out. The events calendar for the Roadman community. Roadman CC pace groups for every level.",
  alternates: {
    canonical: "https://roadmancycling.com/events",
  },
  openGraph: {
    title: "Roadman Cycling Events — Dublin Rides & Coaching Calls",
    description:
      "Group rides in Dublin and live coaching calls with Anthony, week in week out. Roadman CC pace groups for every level.",
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
              // startDate (next occurrence) + eventStatus are required for
              // a valid Event; eventSchedule carries the recurring cadence
              // and time-of-day.
              startDate: nextWeekdayDate("Monday"),
              eventStatus: EVENT_STATUS_SCHEDULED,
              eventSchedule: {
                "@type": "Schedule",
                byDay: "https://schema.org/Monday",
                startTime: "19:30",
                repeatFrequency: "P1W",
              },
              eventAttendanceMode:
                "https://schema.org/OnlineEventAttendanceMode",
              // Online events need a location — a VirtualLocation URL.
              location: {
                "@type": "VirtualLocation",
                url: "https://roadmancycling.com/community",
              },
              organizer: { "@id": ENTITY_IDS.organization },
            },
            {
              "@type": "Event",
              name: "Thursday Chop",
              description:
                "Fast-paced group ride through Phoenix Park. All abilities welcome.",
              startDate: nextWeekdayDate("Thursday"),
              eventStatus: EVENT_STATUS_SCHEDULED,
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
              organizer: { "@id": ENTITY_IDS.organization },
            },
            {
              "@type": "Event",
              name: "Saturday Spin",
              description:
                "Community group ride from 360 Cycles, Clontarf. All levels welcome.",
              startDate: nextWeekdayDate("Saturday"),
              eventStatus: EVENT_STATUS_SCHEDULED,
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
              organizer: { "@id": ENTITY_IDS.organization },
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
