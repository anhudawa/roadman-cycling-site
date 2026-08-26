import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

const OWNER = "ftp-training-zones-cycling-complete-guide";
const OWNER_PATH = `/blog/${OWNER}`;

describe("cycling power-zones search ownership", () => {
  const raw = read(`content/blog/${OWNER}.mdx`);
  const { data, content } = matter(raw);

  it("publishes a reviewed informational owner with answer-ready structure", () => {
    expect(data.seoTitle).toBe(
      "Cycling Power Zones: FTP Chart & 7-Zone Guide",
    );
    expect(data.seoTitle.length).toBeLessThanOrEqual(60);
    expect(data.seoDescription.length).toBeGreaterThanOrEqual(120);
    expect(data.seoDescription.length).toBeLessThanOrEqual(160);
    expect(data.primaryHub).toBe("ftp-training");
    expect(data.updatedDate).toBe("2026-08-26");
    expect(data.lastReviewed).toBe("2026-08-26");
    expect(data.reviewedBy).toContain("primary research");
    expect(data.citedClaims).toHaveLength(6);
    expect(data.faq).toHaveLength(6);
    expect(data.howTo.steps).toHaveLength(5);
    expect(data.howTo.totalTime).toBe("PT5M");
    expect(content).toContain("## Cycling power zone chart");
    expect(content).toContain(
      "## Seven power zones versus three training zones",
    );
    expect(content).toContain("## Which Roadman FTP page should you use?");
  });

  it("grounds the zone model and FTP limits in maintained sources", () => {
    for (const source of [
      "https://www.trainingpeaks.com/blog/power-training-levels/",
      "https://pubmed.ncbi.nlm.nih.gov/31952081/",
      "https://pubmed.ncbi.nlm.nih.gov/33551839/",
      "https://pubmed.ncbi.nlm.nih.gov/34127613/",
      "https://pubmed.ncbi.nlm.nih.gov/35835698/",
      "https://pubmed.ncbi.nlm.nih.gov/39888556/",
    ]) {
      expect(raw).toContain(source);
    }
  });

  it("removes universal prescriptions and unsupported performance claims", () => {
    for (const staleClaim of [
      "spend roughly 80% of your time in Zone 1-2",
      "FTP is the highest power you can sustain for approximately one hour",
      "Zone 3 (76-90% FTP) is too hard to properly recover from but not hard enough",
      "The three zones that produce the most adaptation per hour",
      "each zone targets specific physiological adaptations",
      "15-40 watts over 8 weeks",
      "Every 6-8 weeks is ideal",
      "World Tour professionals at 380-450W",
      "Amateur cyclists obsess over their FTP number",
    ]) {
      expect(raw).not.toContain(staleClaim);
    }
  });

  it("keeps distinct FTP jobs while narrowing the percentage answer", () => {
    for (const path of [
      "src/app/(content)/tools/ftp-zones/page.tsx",
      "src/app/(content)/tools/ftp-test/page.tsx",
      "src/app/(content)/tools/masters-ftp-benchmark/page.tsx",
      "src/app/(content)/topics/[slug]/page.tsx",
      "src/app/(content)/answers/[slug]/page.tsx",
    ]) {
      expect(existsSync(resolve(process.cwd(), path)), path).toBe(true);
    }

    const ftpAnswers = read("src/lib/answers-data/ftp.ts");
    const answer = ftpAnswers.slice(
      ftpAnswers.indexOf('slug: "what-percent-ftp-for-zones"'),
      ftpAnswers.indexOf("// 14 — WHAT IS FTP"),
    );
    expect(answer).toContain("This page owns the short percentage answer");
    expect(answer).toContain("three-zone training-distribution research");
    expect(answer).not.toContain("Most amateur training sits in zones 2, 4, and 5");
    expect(answer).not.toContain("roughly 80% of training time");
    expect(answer).not.toContain("Zone 3 is the grey zone");
    expect(answer).not.toContain("typically every 6–8 weeks");
  });

  it("extends web, AI and crawler discovery for the informational owner", () => {
    expect(read("src/lib/seo/llms-content.ts")).toContain(`"${OWNER}"`);
    expect(read("src/app/llms.txt/route.ts")).toContain(
      "Canonical informational owner for cycling power zones",
    );
    expect(read("src/app/llms-full.txt/route.ts")).toContain(
      "Canonical informational owner for the seven cycling power zones",
    );
    expect(read("scripts/submit-indexnow.ts")).toContain(OWNER_PATH);
  });

  it("records the GSC baseline and AI citation prompts", () => {
    const decision = read(
      "docs/seo/gsc-cycling-power-zones-owner-2026-08-26.md",
    );
    for (const signal of [
      "216 | 51,999 | 0.4% | 5.5",
      "813 | 48,906 | 1.7% | 5.8",
      "2 | 214",
      "8 | 501",
      "2 | 77",
      "0 | 58",
      "5 September 2026",
      "26 September 2026",
    ]) {
      expect(decision).toContain(signal);
    }

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; prompt: string; target_page: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    for (const id of [296, 297]) {
      expect(prompts.prompts).toContainEqual(
        expect.objectContaining({ id, target_page: OWNER_PATH }),
      );
    }
  });
});
