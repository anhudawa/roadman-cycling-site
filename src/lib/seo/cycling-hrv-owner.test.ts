import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const OWNER = "cycling-hrv-training-guide";
const RETIRED = "cycling-heart-rate-variability-guide";
const read = (relativePath: string) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");
const owner = matter(read(`content/blog/${OWNER}.mdx`));

describe("cycling HRV search owner", () => {
  it("keeps one reviewed broad owner and retires the competing guide", () => {
    expect(owner.data.seoTitle).toBe(
      "HRV for Cyclists: How to Measure and Use It",
    );
    expect(owner.data.updatedDate).toBe("2026-08-31");
    expect(owner.data.lastReviewed).toBe("2026-08-31");
    expect(owner.data.evidenceLevel).toBe("moderate");
    expect(owner.data.citedClaims).toHaveLength(6);
    expect(owner.data.faq).toHaveLength(8);
    expect(
      fs.existsSync(path.join(ROOT, `content/blog/${RETIRED}.mdx`)),
    ).toBe(false);

    const redirects = read("next.config.ts");
    const start = redirects.indexOf(`source: "/blog/${RETIRED}"`);
    expect(start).toBeGreaterThan(-1);
    expect(redirects.slice(start, start + 280)).toContain(
      `destination: "/blog/${OWNER}"`,
    );
    expect(redirects.slice(start, start + 280)).toContain("permanent: true");
  });

  it("answers the broad HRV query family directly", () => {
    for (const answer of [
      "Your HRV training decision in 60 seconds",
      "What HRV measures—and what it does not",
      "Is higher HRV always better?",
      "What is a good HRV for a cyclist?",
      "How cyclists should measure HRV",
      "Do trends beat single readings?",
      "Can HRV-guided training improve cycling performance?",
      "A multi-input framework that cyclists can actually use",
      "Can HRV predict illness or overtraining?",
      "HRV for masters cyclists and women",
      "When HRV needs a health boundary",
    ]) {
      expect(owner.content).toContain(answer);
    }
  });

  it("cites measurement guidance, reviews and athlete evidence", () => {
    for (const pmid of [
      "38873876",
      "26888648",
      "26635629",
      "29668452",
      "42286401",
      "34639599",
      "34489178",
      "26909534",
      "41028151",
    ]) {
      expect(owner.content).toContain(
        `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      );
    }
  });

  it("removes unsupported universal prescriptions from the owner", () => {
    const trusted = `${JSON.stringify(owner.data)}\n${owner.content}`.toLowerCase();
    for (const unsupported of [
      "within 10% is normal",
      "15-20% below baseline",
      "five days consistently 10–15%",
      "cut volume to 50–60%",
      "the most sensitive daily recovery indicator",
      "ready to train hard",
      "can catch overtraining 3–5 days",
      "wrist-based optical sensors are the least accurate",
      "ecg-accurate hrv data",
      "hrv drops in the luteal phase",
    ]) {
      expect(trusted).not.toContain(unsupported);
    }
  });

  it("keeps both direct HRV answers aligned with the reviewed owner", () => {
    const physiology = read("src/lib/answers-data/training-physiology.ts");
    const whatIsHrv = physiology.slice(
      physiology.indexOf('slug: "what-is-hrv-cycling"'),
      physiology.indexOf("// WHAT IS VO2 MAX"),
    );
    const recovery = read("src/lib/answers-data/recovery.ts");
    const shouldUseHrv = recovery.slice(
      recovery.indexOf('slug: "should-cyclists-use-hrv"'),
      recovery.indexOf("// 8 — HOW LONG TO RECOVER AFTER HARD RIDE"),
    );

    for (const answer of [whatIsHrv, shouldUseHrv]) {
      expect(answer).toContain('updatedDate: "2026-08-31"');
      expect(answer).toContain("symptoms");
      expect(answer).not.toContain("15% below your baseline");
      expect(answer).not.toContain("can catch overtraining");
      expect(answer).not.toContain("ready to train hard");
    }
  });

  it("aligns the main HRV-supporting pages with the owner", () => {
    const supportingPages = {
      "content/topics/cycling-recovery.mdx":
        "no universal rolling window does either",
      "content/pillars/recovery.mdx":
        "one rolling window and one percentage threshold cannot decide training",
      "content/blog/cycling-self-coaching-framework-guide.mdx":
        "No universal 7-day, 60-day or percentage threshold",
      "content/blog/training-stress-management-masters-cyclist.mdx":
        "no one window is a diagnosis",
      "content/blog/cycling-post-covid-return-guide.mdx":
        "there is no validated 7-day or 15–20% threshold",
      "content/blog/cycling-cortisol-stress-performance-guide.mdx":
        "it is not a cortisol dashboard",
    } as const;

    for (const [file, position] of Object.entries(supportingPages)) {
      expect(read(file), file).toContain(position);
    }
  });

  it("removes active internal references to the retired URL", () => {
    for (const base of ["content", "src/lib"]) {
      const files = fs
        .readdirSync(path.join(ROOT, base), { recursive: true })
        .filter((entry) => typeof entry === "string")
        .map((entry) => path.join(ROOT, base, entry as string))
        .filter((entry) => fs.existsSync(entry) && fs.statSync(entry).isFile())
        .filter(
          (entry) =>
            path.relative(ROOT, entry) !==
            "src/lib/method/protocol-content.ts",
        );

      for (const file of files) {
        const source = read(path.relative(ROOT, file));
        expect(source, file).not.toContain(`/blog/${RETIRED}`);
        expect(source, file).not.toContain(`- ${RETIRED}`);
        expect(source, file).not.toContain(`- "${RETIRED}"`);
      }
    }
  });

  it("routes interest into the existing single attributed app audience", () => {
    expect(owner.content).toContain("](/app?source=hrv-guide)");
    expect(read("src/lib/app-acquisition.ts")).toContain('"hrv-guide"');
    expect(read("src/lib/app-acquisition.test.ts")).toContain(
      "roadman-app-waitlist-hrv-guide-bottom",
    );
  });

  it("records demand and extends AI discovery measurement", () => {
    const brief = read("docs/seo/gsc-cycling-hrv-owner-2026-08-31.md");
    for (const signal of [
      "61 clicks",
      "14,276 web impressions",
      "2,754 Google AI-feature impressions",
      "average position of 6.7",
      "prompt 360",
    ]) {
      expect(brief).toContain(signal);
    }

    for (const slug of [OWNER, RETIRED]) {
      expect(read("scripts/submit-indexnow.ts")).toContain(`/blog/${slug}`);
    }
    expect(read("src/lib/seo/llms-content.ts")).toContain(`"${OWNER}"`);

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({ id: 360, target_page: `/blog/${OWNER}` }),
    );
  });
});
