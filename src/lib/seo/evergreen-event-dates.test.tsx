import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/layout", () => ({
  Header: () => null,
  Footer: () => null,
  Section: ({ children }: { children: React.ReactNode }) => <section>{children}</section>,
  Container: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import RacePage from "@/app/(marketing)/races/[slug]/page";
import EventGuidePage from "@/app/(content)/event/[slug]/page";
import PlanEventHubPage from "@/app/(content)/plan/[event]/page";
import { RACES } from "@/data/races";
import { getAllEventGuideSlugs } from "@/lib/event-guides";
import { getAllEventSlugs } from "@/lib/training-plans";

function structuredData(html: string): unknown[] {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1]));
}

function expectEvergreenGuide(html: string, pageType: string) {
  const data = structuredData(html);
  expect(data).toEqual(expect.arrayContaining([expect.objectContaining({ "@type": pageType })]));
  const serialized = JSON.stringify(data);
  expect(serialized).not.toMatch(/"@type":"(?:SportsEvent|Event)"/);
  expect(serialized).not.toContain('"startDate"');
  expect(serialized).not.toContain('"eventStatus"');
  expect(data).toEqual(expect.arrayContaining([expect.objectContaining({ "@type": "BreadcrumbList" })]));
}

describe("evergreen event guides do not invent scheduled dates", () => {
  it.each(RACES.map((race) => race.slug))("race guide: %s", async (slug) => {
    const html = renderToStaticMarkup(await RacePage({ params: Promise.resolve({ slug }) }));
    expectEvergreenGuide(html, "WebPage");
  });

  it.each(getAllEventGuideSlugs())("event preparation guide: %s", async (slug) => {
    const html = renderToStaticMarkup(await EventGuidePage({ params: Promise.resolve({ slug }) }));
    expectEvergreenGuide(html, "Article");
  });

  it.each(getAllEventSlugs())("training plan hub: %s", async (event) => {
    const html = renderToStaticMarkup(await PlanEventHubPage({ params: Promise.resolve({ event }) }));
    expectEvergreenGuide(html, "CollectionPage");
  });
});
