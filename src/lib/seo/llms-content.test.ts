import { describe, expect, it } from "vitest";
import { GET as getFullLlms } from "@/app/llms-full.txt/route";
import { GET as getShortLlms } from "@/app/llms.txt/route";
import {
  LLMS_FULL_MAX_BYTES,
  LLMS_PINNED_BLOG_SLUGS,
  LLMS_SHORT_MAX_BYTES,
  selectPriorityAndRecent,
} from "./llms-content";

const OWNER_PATHS = [
  "/podcast",
  "/coaching",
  "/masters",
  "/training-plans",
  "/training-camps",
] as const;

describe("LLM discovery content budgets", () => {
  it("puts evergreen priorities before the newest non-pinned window", () => {
    const pinnedSlug = LLMS_PINNED_BLOG_SLUGS.values().next().value as string;
    const selected = selectPriorityAndRecent(
      [
        { slug: "recent-one" },
        { slug: pinnedSlug },
        { slug: "recent-two" },
        { slug: "recent-three" },
      ],
      2,
    );

    expect(selected.map((item) => item.slug)).toEqual([
      pinnedSlug,
      "recent-one",
      "recent-two",
    ]);
  });

  it("keeps the live-corpus exports bounded and owner-first", async () => {
    const shortText = await (await getShortLlms()).text();
    const fullText = await (await getFullLlms()).text();

    expect(Buffer.byteLength(shortText)).toBeLessThanOrEqual(
      LLMS_SHORT_MAX_BYTES,
    );
    expect(Buffer.byteLength(fullText)).toBeLessThanOrEqual(
      LLMS_FULL_MAX_BYTES,
    );
    expect(shortText).toContain("## Selected Blog Posts");
    expect(shortText).toContain("## Recent Podcast Episodes");
    expect(fullText).toContain("## Selected Blog Posts");
    expect(fullText).toContain("/feeds/articles.json");
    expect(fullText).toContain("/feeds/episodes.json");

    for (const path of OWNER_PATHS) {
      expect(shortText).toContain(`https://roadmancycling.com${path}`);
      expect(fullText).toContain(`https://roadmancycling.com${path}`);
    }
  });
});
