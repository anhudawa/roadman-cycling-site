import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const OWNER = "cycling-sleep-performance-guide";
const RETIRED = [
  "sleep-cycling-performance-complete-guide",
  "cycling-sleep-optimisation",
  "cycling-sleep-optimisation-performance-guide",
] as const;
const read = (relativePath: string) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");
const owner = matter(read(`content/blog/${OWNER}.mdx`));

describe("cycling sleep search owner", () => {
  it("keeps one reviewed broad owner and retires all broad duplicates", () => {
    expect(owner.data.seoTitle).toBe(
      "Sleep and Cycling Performance: Evidence-Based Guide",
    );
    expect(owner.data.updatedDate).toBe("2026-08-31");
    expect(owner.data.lastReviewed).toBe("2026-08-31");
    expect(owner.data.evidenceLevel).toBe("moderate");
    expect(owner.data.citedClaims).toHaveLength(6);
    expect(owner.data.faq).toHaveLength(8);

    const redirects = read("next.config.ts");
    for (const slug of RETIRED) {
      expect(fs.existsSync(path.join(ROOT, `content/blog/${slug}.mdx`))).toBe(
        false,
      );
      const start = redirects.indexOf(`source: "/blog/${slug}"`);
      expect(start, slug).toBeGreaterThan(-1);
      expect(redirects.slice(start, start + 280)).toContain(
        `destination: "/blog/${OWNER}"`,
      );
      expect(redirects.slice(start, start + 280)).toContain("permanent: true");
    }
  });

  it("answers the broad cycling sleep query family directly", () => {
    for (const answer of [
      "Your cycling sleep audit in 60 seconds",
      "How much sleep do cyclists need?",
      "What sleep loss does to cycling performance",
      "Caffeine: use dose and timing, not a universal cutoff",
      "Does evening cycling harm sleep?",
      "Naps and sleep extension",
      "What sleep trackers can and cannot tell cyclists",
      "Race week and the bad night before an event",
      "Sleep for masters cyclists",
      "When poor sleep needs clinical help",
    ]) {
      expect(owner.content).toContain(answer);
    }
  });

  it("cites the athlete consensus, intervention reviews and controlled evidence", () => {
    for (const pmid of [
      "33144349",
      "25979105",
      "39006249",
      "37462808",
      "33352457",
      "36870101",
      "39377163",
      "42632303",
      "39484805",
    ]) {
      expect(owner.content).toContain(
        `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      );
    }
  });

  it("removes unsupported universal sleep prescriptions from the owner", () => {
    const trusted = `${JSON.stringify(owner.data)}\n${owner.content}`.toLowerCase();
    for (const unsupported of [
      "70% of your growth hormone",
      "testosterone drops by 10-15%",
      "7.5-8.5 hours nightly",
      "9-10 hours becomes necessary",
      "20-25 minute nap before 2pm",
      "75-80% accurate",
      "16-19 degrees celsius is optimal",
      "hard cutoff at midday",
      "high-intensity exercise within 3 hours",
      "magnesium glycinate",
      "melatonin 0.5",
    ]) {
      expect(trusted).not.toContain(unsupported);
    }
  });

  it("keeps the direct sleep answer aligned with the reviewed owner", () => {
    const answers = read("src/lib/answers-data/recovery.ts");
    expect(answers).toContain(
      "Healthy adults should regularly sleep at least seven hours",
    );
    expect(answers).toContain('updatedDate: "2026-08-31"');
    expect(answers).not.toContain(
      "Cyclists need 8–9 hours of sleep per night",
    );
    expect(answers).not.toContain(
      "Masters riders need more sleep to achieve the same recovery",
    );
  });

  it("removes active internal references to every retired URL", () => {
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
        for (const slug of RETIRED) {
          expect(source, `${file} -> ${slug}`).not.toContain(`/blog/${slug}`);
          expect(source, `${file} -> ${slug}`).not.toContain(`- ${slug}`);
          expect(source, `${file} -> ${slug}`).not.toContain(`- "${slug}"`);
        }
      }
    }
  });

  it("routes interest into the existing single attributed app audience", () => {
    expect(owner.content).toContain(
      "](/app?source=sleep-guide)",
    );
    expect(read("src/lib/app-acquisition.ts")).toContain('"sleep-guide"');
    expect(read("src/lib/app-acquisition.test.ts")).toContain(
      "roadman-app-waitlist-sleep-guide-bottom",
    );
  });

  it("records demand and extends AI discovery measurement", () => {
    const brief = read("docs/seo/gsc-cycling-sleep-owner-2026-08-31.md");
    for (const signal of [
      "102 clicks",
      "25,604 web impressions",
      "6,044 Google AI-feature impressions",
      "average position of 7.0",
      "prompt 359",
    ]) {
      expect(brief).toContain(signal);
    }

    for (const slug of [OWNER, ...RETIRED]) {
      expect(read("scripts/submit-indexnow.ts")).toContain(`/blog/${slug}`);
    }
    expect(read("src/lib/seo/llms-content.ts")).toContain(`"${OWNER}"`);

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({ id: 359, target_page: `/blog/${OWNER}` }),
    );
  });
});
