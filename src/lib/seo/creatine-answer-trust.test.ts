import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getAnswerBySlug } from "@/lib/answers";

const ROOT = process.cwd();
const read = (relativePath: string) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf8");

describe("creatine answer AI-search trust owner", () => {
  const answer = getAnswerBySlug("should-cyclists-take-creatine");

  it("opens with a qualified verdict and the direct endurance boundary", () => {
    expect(answer).not.toBeNull();
    expect(answer?.seoTitle).toBe(
      "Should Cyclists Take Creatine? Evidence & Trade-Offs",
    );
    expect(answer?.directAnswer).toContain("optional, not a blanket requirement");
    expect(answer?.directAnswer).toContain(
      "pooled trained-endurance data show no improvement",
    );
    expect(answer?.directAnswer).not.toContain(
      "Cyclists should consider creatine monohydrate — specifically 5g daily",
    );
  });

  it("separates masters, resistance-training and first-party evidence", () => {
    const combined = JSON.stringify(answer);

    expect(combined).toContain("mean ages of 57–70");
    expect(combined).toContain("not masters cyclists specifically");
    expect(combined).toContain("n=1 report without placebo control");
    expect(combined).not.toContain("If you are over 40 and not on creatine");
  });

  it("publishes a dated source trail and cautious health boundary", () => {
    expect(answer?.updatedDate).toBe("2026-08-31");
    expect(answer?.reviewedBy).toContain("Anthony Walsh");
    expect(answer?.sources?.length).toBeGreaterThanOrEqual(8);
    expect(answer?.sources?.map((source) => source.url)).toEqual(
      expect.arrayContaining([
        "https://pubmed.ncbi.nlm.nih.gov/36877404/",
        "https://pubmed.ncbi.nlm.nih.gov/42280321/",
        "https://pubmed.ncbi.nlm.nih.gov/29138605/",
      ]),
    );
    expect(JSON.stringify(answer?.faq)).toContain("kidney disease");

    const route = read("src/app/(content)/answers/[slug]/page.tsx");
    expect(route).toContain('answer.reviewedBy?.startsWith("Anthony Walsh")');
  });

  it("connects evidence to the app, strength tool and distinct companions", () => {
    const links = answer?.relatedTopics.map((topic) => topic.href);

    expect(links).toEqual(
      expect.arrayContaining([
        "/app?source=creatine-answer",
        "/tools/strength-session-planner",
        "/blog/creatine-for-cyclists-thirty-day-data",
        "/blog/creatine-for-cyclists-30-day-protocol",
      ]),
    );
  });

  it("places all three canonical owners in priority recrawl", () => {
    const indexNow = read("scripts/submit-indexnow.ts");

    expect(indexNow).toContain(
      "`https://${HOST}/answers/should-cyclists-take-creatine`",
    );
    expect(indexNow).toContain(
      "`https://${HOST}/blog/creatine-for-cyclists-thirty-day-data`",
    );
    expect(indexNow).toContain(
      "`https://${HOST}/blog/creatine-for-cyclists-30-day-protocol`",
    );
  });
});
