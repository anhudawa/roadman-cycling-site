import React from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/features/conversion/EmailCapture", () => ({
  EmailCapture: ({
    heading,
    source,
  }: {
    heading: string;
    source: string;
  }) => <form data-source={source}>{heading}</form>,
}));

vi.mock("@/components/layout", () => ({
  Header: () => <header>HEADER</header>,
  Footer: () => <footer>FOOTER</footer>,
  Section: ({
    children,
    id,
  }: {
    children: React.ReactNode;
    id?: string;
  }) => <section id={id}>{children}</section>,
  Container: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/components/ui", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ScrollReveal: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

async function renderPage() {
  const mod = await import("./page");
  return renderToStaticMarkup(<mod.default />);
}

describe("Roadman strength and recovery app search owner", () => {
  it("publishes stable, name-neutral metadata", async () => {
    const { metadata } = await import("./page");

    expect(metadata.title).toMatchObject({
      absolute: "Cycling Strength & Recovery App | Roadman Cycling",
    });
    expect(metadata.description).toContain(
      "cyclist-specific strength and recovery app",
    );
    expect(metadata.alternates).toMatchObject({
      canonical: "https://roadmancycling.com/app",
    });
    expect(JSON.stringify(metadata)).not.toContain("Pocket Coach");
  });

  it("renders the product boundary, structured entity and real waitlist sources", async () => {
    const html = await renderPage();

    expect(html).toContain("STRENGTH THAT FITS YOUR CYCLING");
    expect(html).toContain("RECOVERY THAT HAS A JOB");
    expect(html).toContain("30, 45 or 60-minute strength");
    expect(html).toContain("NOT A GENERIC AI COACH");
    expect(html).toContain("versioned, testable and coach-reviewed rules");
    expect(html).toContain('data-source="roadman-app-waitlist-hero"');
    expect(html).toContain('data-source="roadman-app-waitlist-bottom"');
    expect(html).toContain('"SoftwareApplication"');
    expect(html).toContain('"MobileApplication"');
    expect(html).toContain('"operatingSystem":"iOS"');
    expect(html).not.toContain('"offers"');
    expect(html).not.toContain("Pocket Coach");

    for (const href of [
      "/topics/cycling-strength-conditioning",
      "/topics/cycling-recovery",
      "/tools/strength-session-planner",
      "/tools/training-readiness",
      "/tools/recovery-screen",
      "/strength-training",
    ]) {
      expect(html).toContain(`href="${href}"`);
    }
  });

  it("connects sitemap, discovery, recrawl, benchmarks and relevant owners", () => {
    const sitemap = read("src/app/sitemap.ts");
    const footer = read("src/components/layout/Footer.tsx");
    const llms = read("src/app/llms.txt/route.ts");
    const llmsFull = read("src/app/llms-full.txt/route.ts");
    const indexNow = read("scripts/submit-indexnow.ts");
    const strengthHub = read(
      "content/topics/cycling-strength-conditioning.mdx",
    );
    const recoveryHub = read("content/topics/cycling-recovery.mdx");
    const strengthProduct = read(
      "src/app/(marketing)/strength-training/page.tsx",
    );
    const benchmark = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string }>;
    };

    for (const source of [
      sitemap,
      footer,
      llms,
      llmsFull,
      indexNow,
      strengthHub,
      recoveryHub,
      strengthProduct,
    ]) {
      expect(source).toContain("/app");
    }

    expect(benchmark.metadata.prompt_count).toBe(benchmark.prompts.length);
    expect(
      benchmark.prompts.filter((prompt) => prompt.id >= 319 && prompt.id <= 326),
    ).toMatchObject(
      Array.from({ length: 8 }, (_, index) => ({
        id: 319 + index,
        target_page: "/app",
      })),
    );
  });
});
