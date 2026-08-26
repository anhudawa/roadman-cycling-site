import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";

const ORIGINAL_RELEASE_DATE = "2026-08-25T00:00:00.000Z";
const COACHING_RELEASE_DATE = "2026-08-26T00:00:00.000Z";

describe("priority owner sitemap freshness", () => {
  it("advertises the actual release date for every changed owner surface", async () => {
    const entries = await sitemap({ id: Promise.resolve("0") });
    const byUrl = new Map(entries.map((entry) => [entry.url, entry]));
    const changedUrls = new Map([
      ["https://roadmancycling.com/podcast", ORIGINAL_RELEASE_DATE],
      ["https://roadmancycling.com/coaching", COACHING_RELEASE_DATE],
      ["https://roadmancycling.com/masters", COACHING_RELEASE_DATE],
      ["https://roadmancycling.com/training-plans", COACHING_RELEASE_DATE],
      ["https://roadmancycling.com/training-camps", ORIGINAL_RELEASE_DATE],
      ["https://roadmancycling.com/plan", ORIGINAL_RELEASE_DATE],
    ]);

    for (const [url, releaseDate] of changedUrls) {
      const lastModified = byUrl.get(url)?.lastModified;

      expect(lastModified, `${url} is missing lastModified`).toBeInstanceOf(Date);
      expect((lastModified as Date).toISOString()).toBe(releaseDate);
    }
  });
});
