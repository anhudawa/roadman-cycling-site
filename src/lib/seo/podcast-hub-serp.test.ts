import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { generateMetadata } from "@/app/(content)/podcast/page";

function absoluteTitle(value: unknown): string | undefined {
  if (typeof value !== "object" || value === null || !("absolute" in value)) {
    return undefined;
  }
  const absolute = (value as { absolute?: unknown }).absolute;
  return typeof absolute === "string" ? absolute : undefined;
}

describe("podcast hub SERP proposition", () => {
  it("leads the page-one snippet with the exact entity and core topics", async () => {
    const metadata = await generateMetadata({ searchParams: Promise.resolve({}) });
    const title = absoluteTitle(metadata.title);

    expect(title).toBe(
      "Roadman Cycling Podcast: Training, Nutrition & Racing",
    );
    expect(title?.length).toBeLessThanOrEqual(60);
    expect(metadata.description).toContain("810+");
    expect(metadata.description).toContain("training, nutrition, racing");
    expect(metadata.description).toContain("masters performance");
    expect(String(metadata.description).length).toBeLessThanOrEqual(160);
    expect(metadata.alternates?.canonical).toBe(
      "https://roadmancycling.com/podcast",
    );
  });

  it("keeps paginated archive titles and canonicals distinct", async () => {
    const metadata = await generateMetadata({
      searchParams: Promise.resolve({ page: "2" }),
    });

    expect(absoluteTitle(metadata.title)).toBe(
      "Roadman Cycling Podcast Episodes — Page 2",
    );
    expect(metadata.alternates?.canonical).toBe(
      "https://roadmancycling.com/podcast?page=2",
    );
  });

  it("aligns the visible H1 and video-library path with the snippet", () => {
    const pageSource = readFileSync(
      resolve(process.cwd(), "src/app/(content)/podcast/page.tsx"),
      "utf8",
    );

    expect(pageSource).toContain("THE ROADMAN CYCLING PODCAST");
    expect(pageSource).toContain('href="/watch"');
    expect(pageSource).toContain("WATCH CYCLING PODCAST VIDEOS");
  });
});
