import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { getTopicBySlug } from "@/lib/topics";
import { SEARCH_OWNER_BY_ID } from "./search-ownership";

const ROOT = process.cwd();
const OWNER = "cycling-recovery-tips";
const RETIRED = "recovery-for-cyclists-world-tour-protocols";
const read = (relativePath: string) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");
const owner = matter(read(`content/blog/${OWNER}.mdx`));

describe("cycling recovery search owner", () => {
  it("keeps one reviewed owner and retires the broad World Tour duplicate", () => {
    expect(owner.data.seoTitle).toBe(
      "Cycling Recovery: What Actually Works After a Ride",
    );
    expect(owner.data.updatedDate).toBe("2026-08-31");
    expect(owner.data.lastReviewed).toBe("2026-08-31");
    expect(owner.data.evidenceLevel).toBe("moderate");
    expect(owner.data.citedClaims).toHaveLength(5);
    expect(owner.data.faq).toHaveLength(8);
    expect(fs.existsSync(path.join(ROOT, `content/blog/${RETIRED}.mdx`))).toBe(
      false,
    );

    const redirects = read("next.config.ts");
    const start = redirects.indexOf(`source: "/blog/${RETIRED}"`);
    expect(start).toBeGreaterThan(-1);
    expect(redirects.slice(start, start + 260)).toContain(
      `destination: "/blog/${OWNER}"`,
    );
    expect(redirects.slice(start, start + 260)).toContain("permanent: true");
  });

  it("answers the broad recovery query family directly", () => {
    for (const answer of [
      "Your cycling recovery plan in 60 seconds",
      "The cycling recovery hierarchy",
      "Is active recovery better than rest?",
      "Do ice baths work for cyclists?",
      "Massage, massage guns and compression boots",
      "How professional cyclists recover quickly",
      "Cycling recovery after 40",
      "What a recovery score can and cannot do",
    ]) {
      expect(owner.content).toContain(answer);
    }
  });

  it("cites primary consensus and recovery reviews", () => {
    for (const pmid of [
      "33144349",
      "28919842",
      "36862831",
      "33146851",
      "32426160",
      "39416507",
    ]) {
      expect(owner.content).toContain(
        `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      );
    }
  });

  it("removes universal recovery prescriptions from the owner", () => {
    const trusted = `${JSON.stringify(owner.data)}\n${owner.content}`.toLowerCase();
    for (const unsupported of [
      "8 hours is the floor",
      "72 hours, not 48",
      "48 hours minimum",
      "4:1 carbohydrate-to-protein ratio applies",
      "accelerates recovery better than complete rest",
      "single most powerful recovery tool",
      "mouth taping reverses",
      "25 points within 48 hours",
      "7-day rolling average is the signal",
    ]) {
      expect(trusted).not.toContain(unsupported);
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
    expect(owner.content).toContain("](/app?source=recovery-guide)");
    expect(read("src/lib/app-acquisition.ts")).toContain('"recovery-guide"');
    expect(read("src/lib/app-acquisition.test.ts")).toContain(
      "roadman-app-waitlist-recovery-guide-bottom",
    );
  });

  it("records demand and extends AI discovery measurement", () => {
    const brief = read("docs/seo/gsc-cycling-recovery-owner-2026-08-31.md");
    for (const signal of [
      "73 clicks",
      "7,863 web impressions",
      "1,841 Google AI-feature impressions",
      "average positions 10.5–12",
      "prompt 358",
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
      expect.objectContaining({ id: 358, target_page: `/blog/${OWNER}` }),
    );
  });

  it("publishes reviewed claims and primary sources on the research library", () => {
    const topic = getTopicBySlug("cycling-recovery");

    expect(topic?.lastReviewed).toBe("2026-09-01");
    expect(topic?.citedClaims).toHaveLength(4);
    expect(topic?.sources).toHaveLength(6);
    expect(SEARCH_OWNER_BY_ID.get("cycling-recovery")?.path).toBe(
      "/blog/cycling-recovery-tips",
    );
  });

  it("connects the owner schema and removes unsafe library prescriptions", () => {
    const ownerPage = read("src/app/(content)/blog/[slug]/page.tsx");
    const libraryPage = read("src/app/(content)/topics/[slug]/page.tsx");
    const content = read("content/topics/cycling-recovery.mdx");

    expect(ownerPage).toContain("buildSearchOwnerTrustProperties(");
    expect(ownerPage).toContain("directSearchOwner");
    expect(ownerPage).toContain("/feeds/cycling-recovery.json");
    expect(libraryPage).toContain("/feeds/cycling-recovery.json");
    expect(content).toContain("machine-readable cycling recovery evidence map");
    expect(content).not.toContain("magnesium-and-glycine combination");
    expect(content).not.toContain("Every 3-4 weeks");
    expect(content).not.toContain("under 30 kcal/kg/lbm/day");
    expect(content).not.toContain("Three weeks of Zone 2 base");
  });
});
