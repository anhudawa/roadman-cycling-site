import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  calculateHeartRateZones,
  formatHeartRateZoneRange,
} from "@/lib/hr-zones";
import { TOOL_LANDING_CONTENT } from "@/lib/tools/landing-content";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

const OWNER = "/tools/hr-zones";
const RETIRED = [
  "cycling-heart-rate-zones-explained",
  "cycling-heart-rate-zones-explained-guide",
  "heart-rate-zone-training-cycling-guide",
] as const;

describe("cycling heart-rate-zone calculator ownership", () => {
  it("returns the disclosed gap-free whole-bpm ranges", () => {
    const maxHr = calculateHeartRateZones(188, "maxhr");
    const lthr = calculateHeartRateZones(168, "lthr");

    expect(maxHr.map(formatHeartRateZoneRange)).toEqual([
      "94–113",
      "114–132",
      "133–150",
      "151–169",
      "170–188",
    ]);
    expect(lthr.map(formatHeartRateZoneRange)).toEqual([
      "≤136",
      "137–151",
      "152–158",
      "159–168",
      "≥169",
    ]);

    for (const zones of [maxHr, lthr]) {
      for (let index = 1; index < zones.length; index += 1) {
        const previousMax = zones[index - 1].maxBpm;
        const currentMin = zones[index].minBpm;
        if (previousMax !== null && currentMin !== null) {
          expect(currentMin).toBe(previousMax + 1);
        }
      }
    }
  });

  it("makes the calculator the direct, reviewed and cited broad answer", () => {
    const content = TOOL_LANDING_CONTENT["hr-zones"];
    const rendered = JSON.stringify(content);
    const layout = read("src/app/(content)/tools/hr-zones/layout.tsx");

    expect(content.title).toBe("Cycling Heart-Rate Zone Calculator");
    expect(content.url).toBe("https://roadmancycling.com/tools/hr-zones");
    expect(content.dateModified).toBe("2026-08-26");
    expect(content.reviewedBy).toBe("Anthony Walsh");
    expect(content.reviewScope).toBe(
      "source-to-claim and calculator-method review",
    );
    expect(content.evidenceSources).toHaveLength(8);
    expect(content.howToSteps).toHaveLength(6);
    expect(content.faqs).toHaveLength(6);
    expect(content.examples.map((example) => example.output)).toEqual([
      "Z1: ≤136 bpm · Z2: 137–151 bpm · Z3: 152–158 bpm · Z4: 159–168 bpm · Z5: ≥169 bpm.",
      "Z1: 94–113 bpm · Z2: 114–132 bpm · Z3: 133–150 bpm · Z4: 151–169 bpm · Z5: 170–188 bpm.",
    ]);

    for (const signal of [
      "canonical calculator and explanation",
      "not a laboratory threshold measurement",
      "not the Karvonen heart-rate-reserve method",
      "not interchangeable with the three-zone models",
      "rate-limiting medication",
      "power records external work",
    ]) {
      expect(rendered).toContain(signal);
    }

    for (const staleClaim of [
      "slightly more accurate than Max HR",
      "average HR for the last 20 minutes of an FTP test",
      "Heart rate drifts upward 5-10 bpm after 60 minutes",
      "that formula is wrong for most trained athletes",
      "power as the primary control",
    ]) {
      expect(rendered).not.toContain(staleClaim);
    }

    expect(layout).toContain(
      "Cycling Heart Rate Zones Calculator: Max HR or LTHR",
    );
    expect(layout).toContain('alternates: { canonical: "/tools/hr-zones" }');
  });

  it("retires only the three same-job guides", () => {
    const redirects = read("next.config.ts");

    for (const slug of RETIRED) {
      expect(
        existsSync(resolve(process.cwd(), `content/blog/${slug}.mdx`)),
        slug,
      ).toBe(false);
      expect(redirects).toContain(
        `{ source: "/blog/${slug}", destination: "${OWNER}", permanent: true }`,
      );
    }

    for (const file of [
      "content/blog/heart-rate-zones-indoor-vs-outdoor-cycling.mdx",
      "content/blog/mtb-heart-rate-zones-guide.mdx",
      "content/blog/zone-2-cycling-heart-rate-vs-power-vs-rpe.mdx",
      "content/blog/cycling-training-with-heart-rate-only-guide.mdx",
      "content/blog/cycling-heart-rate-monitor-complete-guide.mdx",
    ]) {
      expect(existsSync(resolve(process.cwd(), file)), file).toBe(true);
    }
  });

  it("repoints active editorial and collection signals to the owner", () => {
    for (const file of [
      "content/blog/cycling-e-bikes-for-training-guide.mdx",
      "content/blog/cycling-exercise-induced-asthma-management-guide.mdx",
      "content/blog/cycling-fitting-training-around-work-family-guide.mdx",
      "content/blog/cycling-heart-rate-monitor-complete-guide.mdx",
      "content/blog/heart-rate-high-cycling-fixable-reasons.mdx",
      "content/blog/heart-rate-zones-indoor-vs-outdoor-cycling.mdx",
      "src/lib/answers-data/high-volume-queries.ts",
    ]) {
      expect(read(file), file).toContain(OWNER);
    }

    const topics = read("src/lib/topics.ts");
    for (const slug of RETIRED) {
      expect(topics).not.toContain(`"${slug}"`);
    }
  });

  it("records the GSC evidence and extends recrawl and AI discovery", () => {
    const decision = read(
      "docs/seo/gsc-cycling-heart-rate-zones-owner-2026-08-26.md",
    );
    for (const signal of [
      "1.24K clicks and 42.8K impressions",
      "21 of the 24 exact-query clicks",
      "41 clicks and 3.76K impressions",
      "96 clicks and 5.95K impressions",
      "0.904",
      "5 September 2026",
      "26 September 2026",
    ]) {
      expect(decision).toContain(signal);
    }

    expect(read("src/app/llms.txt/route.ts")).toContain(
      "Canonical broad cycling-HR-zone owner",
    );
    expect(read("src/app/llms-full.txt/route.ts")).toContain(
      "canonical broad cycling-HR-zone owner",
    );
    expect(read("scripts/submit-indexnow.ts")).toContain(
      "`https://${HOST}/tools/hr-zones`",
    );

    const benchmark = JSON.parse(
      read("scripts/ai-benchmark-prompts.json"),
    ) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; prompt: string; target_page: string }>;
    };
    expect(benchmark.metadata.prompt_count).toBe(benchmark.prompts.length);
    expect(benchmark.prompts).toContainEqual(
      expect.objectContaining({
        id: 293,
        prompt:
          "how do I calculate cycling heart rate zones from max HR or lactate threshold heart rate",
        target_page: OWNER,
      }),
    );
  });
});
