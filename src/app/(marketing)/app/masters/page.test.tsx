import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/features/conversion/AppEarlyAccessCapture", () => ({
  AppEarlyAccessCapture: ({
    placement,
    acquisitionSource,
  }: {
    placement: string;
    acquisitionSource: string;
  }) => (
    <form
      data-source={`roadman-app-waitlist-${acquisitionSource}-${placement}`}
    >
      GET EARLY ACCESS
    </form>
  ),
  AppEarlyAccessCaptureFallback: ({
    placement,
    acquisitionSource,
  }: {
    placement: string;
    acquisitionSource: string;
  }) => (
    <form
      data-source={`roadman-app-waitlist-${acquisitionSource}-${placement}`}
    >
      GET EARLY ACCESS
    </form>
  ),
}));

vi.mock("@/components/layout", () => ({
  Header: () => <header>HEADER</header>,
  Footer: () => <footer>FOOTER</footer>,
  Section: ({ children, id }: { children: React.ReactNode; id?: string }) => (
    <section id={id}>{children}</section>
  ),
  Container: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/components/ui", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

async function renderPage() {
  const mod = await import("./page");
  return renderToStaticMarkup(<mod.default />);
}

describe("masters cycling app acquisition page", () => {
  it("publishes a self-canonical, name-neutral segment page", async () => {
    const { metadata } = await import("./page");

    expect(metadata.title).toMatchObject({
      absolute: "Cycling App for Masters Cyclists Over 40 | Roadman",
    });
    expect(metadata.alternates).toMatchObject({
      canonical: "https://roadmancycling.com/app/masters",
      types: {
        "application/json": "https://roadmancycling.com/feeds/app-product.json",
      },
    });
    expect(JSON.stringify(metadata)).not.toMatch(/pocket coach/i);
  });

  it("uses the single app waitlist with masters attribution and clear boundaries", async () => {
    const html = await renderPage();

    expect(html).toContain("A CYCLING APP FOR MASTERS RIDERS");
    expect(html).toContain("NOT AN AGE TEMPLATE");
    expect(html).toContain(
      'data-source="roadman-app-waitlist-masters-app-hero"',
    );
    expect(html).toContain(
      'data-source="roadman-app-waitlist-masters-app-bottom"',
    );
    expect(html).toContain("One Roadman app waitlist");
    expect(html).toContain("NOT A DIAGNOSIS OR A GENERIC AI COACH");
    expect(html).toContain('"@id":"https://roadmancycling.com/app#software"');
    expect(html).toContain('href="/app"');
    expect(html).toContain('href="/masters"');
    expect(html).not.toMatch(/pocket coach/i);
  });
});
