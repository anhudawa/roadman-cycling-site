import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { recoveryAnswers } from "@/lib/answers-data/recovery";
import { highVolumeQuery14Answers } from "@/lib/answers-data/high-volume-queries-14";

const root = process.cwd();
const read = (relativePath: string) =>
  readFileSync(resolve(root, relativePath), "utf8");

const OWNER = "cycling-active-recovery-rides-guide";
const RETIRED = [
  "cycling-active-recovery-explained",
  "active-recovery-rides-evidence-cyclists",
  "cycling-recovery-rides-how-to-do-them-properly-guide",
] as const;

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return [".md", ".mdx", ".ts", ".tsx", ".json"].includes(extname(path))
      ? [path]
      : [];
  });
}

describe("active-recovery search ownership and trust", () => {
  it("keeps one reviewed, evidence-bounded broad owner", () => {
    const owner = matter(read(`content/blog/${OWNER}.mdx`));

    expect(owner.data.seoTitle).toBe(
      "Active Recovery Rides: Power, Duration & Rest (2026)",
    );
    expect(owner.data.updatedDate).toBe("2026-08-31");
    expect(owner.data.lastReviewed).toBe("2026-08-31");
    expect(owner.data.reviewedBy).toContain("Anthony Walsh");
    expect(owner.data.citedClaims).toHaveLength(4);
    expect(owner.data.faq).toHaveLength(5);
    expect(owner.content).toContain(
      "## First, separate a cool-down from a recovery ride",
    );
    expect(owner.content).toContain(
      "https://pubmed.ncbi.nlm.nih.gov/29663142/",
    );
    expect(owner.content).toContain(
      "https://pubmed.ncbi.nlm.nih.gov/26972271/",
    );
    expect(owner.content).toContain("/tools/training-readiness");
    expect(owner.content).toContain("/tools/recovery-screen");
    expect(owner.content).toContain(
      "[Join the single app waiting list](/app?source=active-recovery-guide)",
    );
    expect(owner.content).not.toContain("flush metabolites");
    expect(owner.content).not.toContain("resting HR is elevated 10+ bpm");
  });

  it("retires every broad duplicate with a permanent redirect", () => {
    const redirects = read("next.config.ts");

    for (const slug of RETIRED) {
      expect(existsSync(resolve(root, `content/blog/${slug}.mdx`))).toBe(false);
      expect(redirects).toContain(`source: "/blog/${slug}"`);
    }
    expect(
      redirects.match(
        /destination: "\/blog\/cycling-active-recovery-rides-guide"/g,
      ),
    ).toHaveLength(3);
  });

  it("removes retired URLs and duplicate owner recommendations from live source", () => {
    const files = ["content", "src", "scripts"].flatMap((directory) =>
      sourceFiles(resolve(root, directory)),
    );
    const generatedAuditFiles = [
      "scripts/audit-links-report.json",
      "scripts/route-inventory.json",
    ];

    for (const path of files) {
      if (
        generatedAuditFiles.some(
          (generated) => path === resolve(root, generated),
        )
      )
        continue;
      if (path.endsWith("active-recovery-search-owner.test.ts")) continue;
      const source = readFileSync(path, "utf8");
      for (const retired of RETIRED) expect(source).not.toContain(retired);

      if (extname(path) === ".mdx") {
        const relatedPosts = matter(source).data.relatedPosts;
        if (Array.isArray(relatedPosts)) {
          expect(relatedPosts.filter((slug) => slug === OWNER)).toHaveLength(
            relatedPosts.includes(OWNER) ? 1 : 0,
          );
        }
      }
    }
  });

  it("keeps the comparison answer consistent with the owner", () => {
    const comparison = recoveryAnswers.find(
      ({ slug }) => slug === "active-or-passive-recovery",
    );
    const restDays = recoveryAnswers.find(
      ({ slug }) => slug === "how-many-rest-days-cycling",
    );

    expect(comparison).toMatchObject({
      updatedDate: "2026-08-31",
      reviewedBy: "Anthony Walsh",
    });
    expect(comparison?.directAnswer).toContain("Neither active nor passive");
    expect(comparison?.directAnswer).not.toContain("clears metabolic waste");
    expect(restDays?.updatedDate).toBe("2026-08-31");
    expect(restDays?.directAnswer).toContain("no universal number");

    const fasterRecovery = highVolumeQuery14Answers.find(
      ({ slug }) => slug === "how-to-recover-faster-after-cycling",
    );
    expect(fasterRecovery?.directAnswer).toContain(
      "does not show a consistent",
    );
    expect(fasterRecovery?.directAnswer).not.toContain("clearing metabolites");
    expect(read("content/blog/cycling-recovery-tips.mdx")).not.toContain(
      "Active recovery (easy Zone 1 spin) is better than complete rest",
    );
    expect(
      matter(read("content/blog/cycling-post-race-recovery-protocol-guide.mdx"))
        .data.answerCapsule,
    ).not.toContain("clears metabolic");
  });

  it("records the baseline and extends AI and recrawl discovery", () => {
    const decision = read(
      "docs/seo/gsc-active-recovery-consolidation-2026-08-31.md",
    );
    expect(decision).toContain("11 clicks");
    expect(decision).toContain("2,124 impressions");
    expect(decision).toContain("**7 September 2026**");
    expect(decision).toContain("**28 September 2026**");

    expect(read("src/app/llms.txt/route.ts")).toContain(
      "Active recovery rides and rest-day decisions",
    );
    expect(read("src/lib/seo/llms-content.ts")).toContain(OWNER);
    expect(read("scripts/submit-indexnow.ts")).toContain(
      "ACTIVE_RECOVERY_TRUST_CLUSTER",
    );

    const benchmark = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string }>;
    };
    expect(benchmark.metadata.prompt_count).toBe(benchmark.prompts.length);
    for (const id of [331, 332, 333]) {
      expect(benchmark.prompts).toContainEqual(
        expect.objectContaining({ id, target_page: `/blog/${OWNER}` }),
      );
    }
  });
});
