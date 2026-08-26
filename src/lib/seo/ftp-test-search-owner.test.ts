import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getAnswerBySlug } from "@/lib/answers";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

const OWNER = "/answers/ftp-test-guide";
const TOOL = "/tools/ftp-test";

describe("FTP test search ownership and evidence trust", () => {
  it("makes the incumbent answer the reviewed informational owner", () => {
    const answer = getAnswerBySlug("ftp-test-guide");
    const words = answer?.directAnswer.split(/\s+/).filter(Boolean) ?? [];

    expect(answer?.question).toBe("Which FTP Test Should a Cyclist Use?");
    expect(answer?.seoTitle).toBe(
      "FTP Test: Protocols, Accuracy & How to Choose",
    );
    expect(answer?.updatedDate).toBe("2026-08-26");
    expect(answer?.reviewedBy).toContain("Anthony Walsh");
    expect(words.length).toBeGreaterThanOrEqual(40);
    expect(words.length).toBeLessThanOrEqual(80);
    expect(answer?.keyTakeaways).toHaveLength(4);
    expect(answer?.practicalApplication).toHaveLength(4);
    expect(answer?.commonMistakes).toHaveLength(3);
    expect(answer?.faq).toHaveLength(6);
  });

  it("publishes primary evidence and removes universal protocol claims", () => {
    const answer = getAnswerBySlug("ftp-test-guide");
    const rendered = JSON.stringify(answer);
    const sources = answer?.sources ?? [];

    expect(sources).toHaveLength(6);
    expect(sources.map((source) => new URL(source.url).hostname)).toEqual(
      expect.arrayContaining([
        "www.trainingpeaks.com",
        "help.trainingpeaks.com",
        "www.britishcycling.org.uk",
        "pubmed.ncbi.nlm.nih.gov",
      ]),
    );

    for (const staleClaim of [
      "fatigue can understate FTP by 5%+",
      "Retest every 6–8 weeks",
      "slightly more accurate",
      "within 5–10% of reality",
      "the difference between adaptation and over-reaching",
    ]) {
      expect(rendered).not.toContain(staleClaim);
    }

    for (const boundary of [
      "no protocol is exact for every cyclist",
      "not automatically interchangeable",
      "calibration",
      "time-to-exhaustion",
    ]) {
      expect(rendered).toContain(boundary);
    }
  });

  it("separates the answer, calculator and protocol-specific tasks", () => {
    const answer = getAnswerBySlug("ftp-test-guide");
    const links = answer?.relatedTopics.map((item) => item.href) ?? [];

    expect(links).toEqual(
      expect.arrayContaining([
        TOOL,
        "/answers/20-minute-ftp-test",
        "/answers/how-to-do-a-ramp-test",
        "/blog/when-to-test-ftp-cycling",
        "/topics/ftp-training",
      ]),
    );

    const topic = read("content/topics/ftp-training.mdx");
    expect(topic).toContain(
      "[FTP test selection guide](/answers/ftp-test-guide)",
    );
    expect(topic).toContain("[FTP test result calculator](/tools/ftp-test)");
  });

  it("narrows the tool to a transparent, shared calculation", () => {
    const page = read("src/app/(content)/tools/ftp-test/page.tsx");
    const layout = read("src/app/(content)/tools/ftp-test/layout.tsx");

    expect(layout).toContain("FTP Test Calculator");
    expect(page).toContain('href="/answers/ftp-test-guide"');
    expect(page).toContain("calculateFtpZones(estimatedFtp)");
    expect(page).toContain("EQUATION COMPARISON");
    expect(page).not.toContain("const FTP_TIERS");
    expect(page).not.toContain("const ZONES");

    for (const staleClaim of [
      "The industry standard",
      "The gold standard by definition",
      "all protocols have individual error",
      "highest power you can sustain for approximately one hour",
    ]) {
      expect(page).not.toContain(staleClaim);
    }
  });

  it("records the baseline and aligns crawler and AI discovery", () => {
    const decision = read("docs/seo/gsc-ftp-test-opportunity-2026-08-26.md");
    for (const signal of [
      "5",
      "694",
      "0.7%",
      "19.9",
      "500",
      "25.2",
      "115",
      "5 September 2026",
      "26 September 2026",
    ]) {
      expect(decision).toContain(signal);
    }

    expect(read("src/app/llms.txt/route.ts")).toContain(
      "Canonical informational owner for choosing and repeating an FTP test",
    );
    const indexNow = read("scripts/submit-indexnow.ts");
    expect(indexNow).toContain(OWNER);
    expect(indexNow).toContain(TOOL);

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string; prompt: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({
        id: 274,
        target_page: OWNER,
        prompt: "which FTP test should I use 20 minute ramp or a longer effort",
      }),
    );
  });
});
