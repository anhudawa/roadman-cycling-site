import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

const OWNER_PATH = "/guests/george-hincapie";
const ROUBAIX_EPISODE =
  "ep-2536-hincape-opens-up-about-how-pogacar-can-win-roubaix";

describe("George Hincapie entity and CTR owner", () => {
  it("turns the established guest owner into a current, source-bounded answer", () => {
    const profiles = read("src/lib/guests/profiles.ts");

    expect(profiles).toContain(
      'seoTitle: "George Hincapie: Career, US Postal & Podcast"',
    );
    expect(profiles).toContain("https://www.wikidata.org/wiki/Q267142");
    expect(profiles).toContain("https://www.maprocycling.com/leadership");
    expect(profiles).toContain("USADA disqualified his results");
    expect(profiles).toContain('lastReviewed: "2026-08-26"');

    const page = read("src/app/(content)/guests/[slug]/page.tsx");
    expect(page).toContain('"@type": "FAQPage"');
    expect(page).toContain("SOURCES AND VERIFICATION");
    expect(page).toContain("citation: override.sources.map");
    expect(page).toContain("override?.credential ?? guest.credential");
  });

  it("corrects the Roubaix record and cleans the surfaced quotations", () => {
    const roubaix = matter(
      read(`content/podcast/${ROUBAIX_EPISODE}.mdx`),
    );
    const olderClip = matter(
      read(
        "content/podcast/ep-2180-hincapie-opens-up-about-sagan-paris-roubaix-rdmn-clips.mdx",
      ),
    );

    expect(roubaix.data.updatedDate).toBe("2026-08-26");
    expect(roubaix.data.description).toContain("started Paris-Roubaix 17 times");
    expect(roubaix.data.description).toContain("seven top-10");
    expect(roubaix.data.guestCredential).toContain("Modern Adventure");
    expect(roubaix.data.keyQuotes[1].text).toContain("Koppenberg");
    expect(roubaix.data.keyQuotes[2].text).toContain("whole peloton is blocked");
    expect(roubaix.data.keyQuotes[2].text).not.toContain("cra if");
    expect(roubaix.data.keyQuotes[2].credential).not.toContain("Alpas");
    expect(olderClip.data.keyQuotes[0].text).toContain("Arenberg");
  });

  it("differentiates the expert index and points the Person to the owner", () => {
    const expertPage = read("src/app/(content)/experts/[expertSlug]/page.tsx");

    expect(expertPage).toContain(
      "title: `What Does ${guest.name} Say? — Topics`",
    );
    expect(expertPage).toContain(
      "url: `${SITE_ORIGIN}/guests/${expertSlug}`",
    );
    expect(expertPage).toContain("Full profile &amp; episodes");
  });

  it("records the baseline and extends AI and crawler discovery", () => {
    const decision = read(
      "docs/seo/gsc-george-hincapie-opportunity-2026-08-26.md",
    );
    expect(decision).toContain("13 clicks");
    expect(decision).toContain("7,311 impressions");
    expect(decision).toContain("0.2% CTR");
    expect(decision).toContain("Average position 10");
    expect(decision).toContain("6,306");
    expect(decision).toContain("**5 September 2026**");
    expect(decision).toContain("**26 September 2026**");

    expect(read("src/app/llms.txt/route.ts")).toContain(
      "George Hincapie: Career, US Postal and Roadman Podcast Profile",
    );
    const indexNow = read("scripts/submit-indexnow.ts");
    for (const path of [
      OWNER_PATH,
      "/experts/george-hincapie",
      `/podcast/${ROUBAIX_EPISODE}`,
    ]) {
      expect(indexNow).toContain(path);
    }

    const benchmark = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string; prompt: string }>;
    };
    expect(benchmark.metadata.prompt_count).toBe(benchmark.prompts.length);
    expect(benchmark.prompts).toContainEqual(
      expect.objectContaining({
        id: 228,
        target_page: OWNER_PATH,
        prompt:
          "who is George Hincapie and what did he say about the US Postal doping era",
      }),
    );
  });
});
