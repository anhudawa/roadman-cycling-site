import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/layout", () => ({ Header: () => null, Footer: () => null }));

import RacePage, { generateMetadata } from "./page";

describe("edition-specific race guides", () => {
  it("keeps historic routes distinct from the next event and removes unsupported predictions", async () => {
    const props = { params: Promise.resolve({ slug: "dragon-ride" }) };
    const html = renderToStaticMarkup(await RacePage(props));
    const metadata = await generateMetadata(props);
    expect(metadata.alternates?.canonical).toBe("https://roadmancycling.com/races/dragon-ride");
    expect(metadata.description).toContain("2026");
    expect(metadata.description).toContain("13 June 2027");
    expect(html).toContain("2026 Gran Fondo");
    expect(html).toContain("222km");
    expect(html).toContain("3,583m");
    expect(html).toContain("Dragon Devil");
    expect(html).toContain("298km");
    expect(html).toContain("not yet confirmed");
    expect(html).toContain('href="/blog/dragon-ride-training-guide"');
    expect(html).toContain('href="/apply"');
    expect(html).not.toContain("Typical Finish Times");
    expect(html).not.toContain("Get My Time Estimate");
    expect(html).not.toContain("real elevation data");
    expect(html).not.toContain("SportsEvent");
    expect(html).not.toContain("Bwlch y Groes");
    expect(html).not.toContain("311km");
  });

  it("preserves other race guides' existing rendering and links", async () => {
    const html = renderToStaticMarkup(await RacePage({ params: Promise.resolve({ slug: "fred-whitton" }) }));
    expect(html).toContain("Typical Finish Times");
    expect(html).toContain("Key Climbs");
    expect(html).toContain("Fred Whitton");
    expect(html).not.toContain("Compare the 2026 routes");
    expect(html).toContain("2026 Gran Fondo"); // Related Dragon Ride card keeps its edition.
  });
});
