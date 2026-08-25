import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";

const RELEASE_DATE = "2026-08-25T00:00:00.000Z";

describe("priority owner sitemap freshness", () => {
  it("advertises the actual release date for every changed owner surface", async () => {
    const entries = await sitemap({ id: Promise.resolve("0") });
    const byUrl = new Map(entries.map((entry) => [entry.url, entry]));
    const changedUrls = [
      "https://roadmancycling.com/podcast",
      "https://roadmancycling.com/coaching",
      "https://roadmancycling.com/masters",
      "https://roadmancycling.com/training-plans",
      "https://roadmancycling.com/training-camps",
      "https://roadmancycling.com/plan",
    ];

    for (const url of changedUrls) {
      const lastModified = byUrl.get(url)?.lastModified;

      expect(lastModified, `${url} is missing lastModified`).toBeInstanceOf(Date);
      expect((lastModified as Date).toISOString()).toBe(RELEASE_DATE);
    }
  });
});
