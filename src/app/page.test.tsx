import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/layout", () => ({
  Header: () => <div data-testid="header">HEADER</div>,
  Footer: () => <div data-testid="footer">FOOTER</div>,
}));

vi.mock("@/components/seo/JsonLd", () => ({
  JsonLd: () => <script type="application/ld+json" />,
}));

vi.mock("@/components/ui", () => ({
  ScrollReveal: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
}));

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    <span data-image-src={src} aria-label={alt} />
  ),
}));

async function renderHomepage() {
  const mod = await import("./page");
  return renderToStaticMarkup(<mod.default />);
}

describe("Roadman coaching homepage", () => {
  it("uses coaching-first metadata and the bespoke social card", async () => {
    const { metadata } = await import("./page");

    expect(metadata.title).toBe(
      "Not Done Yet Cycling Coaching | Roadman Cycling",
    );
    expect(metadata.description).toContain("Stop plateauing");
    expect(metadata.openGraph).toMatchObject({
      images: [
        {
          url: "/og-ndy.png",
          width: 1200,
          height: 630,
        },
      ],
    });
  });

  it("keeps the homepage focused on the Not Done Yet application", async () => {
    const html = await renderHomepage();
    const applicationLinks = html.match(/href="\/apply"/g) ?? [];

    expect(applicationLinks.length).toBeGreaterThanOrEqual(4);
    expect(html).toContain("Apply for Not Done Yet");
    expect(html).toContain("$195");
    expect(html).toContain("7-day free trial");
    expect(html).not.toContain('href="/tools"');
    expect(html).not.toContain('href="/newsletter"');
  });

  it("puts named coaching outcomes before media authority", async () => {
    const html = await renderHomepage();

    expect(html).toContain("Damien Maloney");
    expect(html).toContain("Daniel Stone");
    expect(html).toContain("Brian Morrissey");
    expect(html.indexOf("Damien Maloney")).toBeLessThan(
      html.indexOf("1,400+ CONVERSATIONS"),
    );
  });

  it("renders the conversion copy before the coach portrait on mobile DOM order", async () => {
    const html = await renderHomepage();

    expect(html.indexOf("STOP")).toBeLessThan(
      html.indexOf("Anthony Walsh, Roadman cycling coach"),
    );
  });
});
