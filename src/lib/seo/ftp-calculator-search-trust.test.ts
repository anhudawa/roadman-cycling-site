import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

const PAGE = "src/app/(content)/tools/ftp-zones/page.tsx";
const LAYOUT = "src/app/(content)/tools/ftp-zones/layout.tsx";
const CLIENT = "src/app/(content)/tools/ftp-zones/FTPZonesClient.tsx";
const CONTENT = "src/lib/tools/landing-content.ts";

describe("FTP calculator search ownership and evidence trust", () => {
  it("makes the exact general query the metadata and visible owner", () => {
    for (const file of [PAGE, LAYOUT]) {
      expect(read(file)).toContain(
        'absolute: "FTP Calculator: 7 Cycling Power Zones (2026)"',
      );
      expect(read(file)).toContain(
        'canonical: "https://roadmancycling.com/tools/ftp-zones"',
      );
    }

    expect(read(CLIENT)).toContain("FTP CALCULATOR: 7 CYCLING POWER ZONES");
    expect(read(CONTENT)).toContain('title: "FTP Calculator"');
    expect(read(CONTENT)).toContain('breadcrumbName: "FTP Calculator"');
  });

  it("separates general, testing and masters calculator intent", () => {
    const general = read(CLIENT);
    const masters = read(
      "src/app/(content)/tools/masters-ftp-benchmark/page.tsx",
    );
    const mastersLayout = read(
      "src/app/(content)/tools/masters-ftp-benchmark/layout.tsx",
    );

    expect(general).toContain("masters FTP calculator by age and gender");
    expect(general).toContain('href="/tools/ftp-test"');
    expect(masters).toContain("FTP CALCULATOR BY AGE &amp; GENDER");
    expect(masters).toContain('href="/tools/ftp-zones"');
    expect(mastersLayout).toContain(
      'absolute: "FTP Calculator by Age & Gender | Masters Benchmark"',
    );
  });

  it("uses one gap-free calculation model for the page and public API", () => {
    const client = read(CLIENT);
    const calculator = read("src/lib/tools/calculators.ts");
    const api = read("src/app/api/v1/tools/ftp-zones/route.ts");

    expect(client).toContain("calculateFtpZones(ftpValue)");
    expect(api).toContain("calculateFtpZones(ftp, lthr)");
    expect(calculator).toContain("previousMaxWatts + 1");
    expect(calculator).toContain("Math.floor");
    expect(client).not.toContain("const ZONES:");
  });

  it("publishes sources, a scoped review and explicit evidence limits", () => {
    const content = read(CONTENT);

    for (const source of [
      "https://www.trainingpeaks.com/blog/power-training-levels/",
      "https://pubmed.ncbi.nlm.nih.gov/31952081/",
      "https://pubmed.ncbi.nlm.nih.gov/33551839/",
      "https://pubmed.ncbi.nlm.nih.gov/34127613/",
      "https://pubmed.ncbi.nlm.nih.gov/35835698/",
      "https://pubmed.ncbi.nlm.nih.gov/39888556/",
    ]) {
      expect(content).toContain(source);
    }

    expect(content).toContain('dateModified: "2026-08-26"');
    expect(content).toContain('reviewedBy: "Anthony Walsh"');
    expect(content).toContain(
      'reviewScope: "method and primary-source verification"',
    );
    expect(content).toContain(
      "a seven-zone power table is not the same thing as the three-zone models",
    );
  });

  it("removes universal training and one-hour claims from the owner", () => {
    const registry = read(CONTENT);
    const ftpContent = registry.slice(
      registry.indexOf('"ftp-zones": {'),
      registry.indexOf('"race-weight": {'),
    );
    const owner = `${read(CLIENT)}\n${ftpContent}`;

    for (const staleClaim of [
      "The 80/20 rule is real",
      "turns a single FTP number into a complete training prescription",
      "single most important metric",
      "highest average power you can sustain for approximately one hour",
      "best predictor of climbing and overall cycling performance",
    ]) {
      expect(owner).not.toContain(staleClaim);
    }
  });

  it("records the two-query GSC baseline and extends AI discovery", () => {
    const decision = read(
      "docs/seo/gsc-ftp-calculator-ctr-2026-08-26.md",
    );
    for (const signal of [
      "44",
      "4,522",
      "1.0%",
      "8.2",
      "80",
      "1,115",
      "7.2%",
      "4.4",
      "5 September 2026",
      "26 September 2026",
    ]) {
      expect(decision).toContain(signal);
    }

    expect(read("src/app/llms.txt/route.ts")).toContain(
      "seven continuous whole-watt cycling power-zone ranges",
    );
    const sitemap = read("src/app/sitemap.ts");
    for (const path of ["/tools/ftp-zones", "/tools/masters-ftp-benchmark"]) {
      const entry = sitemap.slice(
        sitemap.indexOf(path),
        sitemap.indexOf(path) + 180,
      );
      expect(entry).toContain('new Date("2026-08-26")');
      expect(entry).toContain('changeFrequency: "weekly"');
    }

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string; prompt: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({
        id: 233,
        target_page: "/tools/ftp-zones",
        prompt: "free FTP calculator for seven cycling power zones",
      }),
    );
  });
});
