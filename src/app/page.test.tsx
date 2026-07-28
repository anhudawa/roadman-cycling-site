import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/layout/CoachingHeader", () => ({
  CoachingHeader: () => (
    <div data-testid="header" data-variant="coaching">
      HEADER
    </div>
  ),
}));

vi.mock("@/components/layout/CoachingFooter", () => ({
  CoachingFooter: () => (
    <div data-testid="footer" data-variant="coaching">
      FOOTER
    </div>
  ),
}));

vi.mock("@/components/seo/JsonLd", () => ({
  JsonLd: () => <script type="application/ld+json" />,
}));

vi.mock("@/components/ui/ScrollReveal", () => ({
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
  it("uses hybrid brand metadata and the bespoke coaching social card", async () => {
    const { metadata } = await import("./page");

    expect(metadata.title).toEqual({
      absolute: "Roadman Cycling | Cycling Coaching, Podcast & Training",
    });
    expect(metadata.description).toContain("Personalised cycling coaching");
    expect(metadata.description).toContain("free cycling tools");
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
    expect(html).toContain("Start the 2-minute application");
    expect(html).toContain("$195");
    expect(html).toContain("7-day free trial");
    expect(html).toContain('data-variant="coaching"');
    expect(html).toContain('href="/tools"');
    expect(html).toContain('href="/blog"');
    expect(html).toContain('href="/training-camps"');
    expect(html).toContain('href="/newsletter"');
    expect(html.indexOf("OTHER WAYS INTO ROADMAN")).toBeGreaterThan(
      html.indexOf("STRAIGHT"),
    );
    expect(html.indexOf("OTHER WAYS INTO ROADMAN")).toBeLessThan(
      html.indexOf("YOUR NEXT BEST SEASON"),
    );
  });

  it("puts named coaching outcomes before media authority", async () => {
    const html = await renderHomepage();

    expect(html).toContain("Damien Maloney");
    expect(html).toContain("Daniel Stone");
    expect(html).toContain("Brian Morrissey");
    expect(html.indexOf("Damien Maloney")).toBeLessThan(
      html.indexOf("1,400+ CONVERSATIONS"),
    );
    expect(html).toContain('href="/case-studies/damien-maloney"');
    expect(html).toContain("Read the verified case study");
  });

  it("states the exact coaching cadence without unsupported scarcity", async () => {
    const html = await renderHomepage();

    expect(html).toContain(
      "Personalised TrainingPeaks plan, reviewed every week",
    );
    expect(html).toContain(
      "Weekly live group coaching with Anthony — recordings included",
    );
    expect(html).toContain("replies within 48 hours");
    expect(html).not.toMatch(/30 (places|spots)/i);
  });

  it("renders the conversion copy before the coach portrait on mobile DOM order", async () => {
    const html = await renderHomepage();

    expect(html.indexOf("STOP")).toBeLessThan(
      html.indexOf("Anthony Walsh, Roadman cycling coach"),
    );
  });
});
