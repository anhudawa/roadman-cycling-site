import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { getAnswerBySlug } from "@/lib/answers";
import { getGlossaryTermPath, getTermBySlug } from "@/lib/glossary";

const OWNER = "/answers/what-is-a-domestique";
const LEGACY = "/glossary/domestique";
const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("domestique cycling search owner", () => {
  it("turns the established answer into a concise, reviewed definition", () => {
    const answer = getAnswerBySlug("what-is-a-domestique");
    expect(answer).not.toBeNull();

    expect(answer?.seoTitle).toBe(
      "Domestique in Cycling: Meaning, Jobs & Tactics",
    );
    expect(answer?.updatedDate).toBe("2026-08-26");
    expect(answer?.reviewedBy).toBe("Anthony Walsh");
    expect(answer?.keyTakeaways).toHaveLength(4);
    expect(answer?.practicalApplication).toHaveLength(3);
    expect(answer?.commonMistakes).toHaveLength(3);
    expect(answer?.faq).toHaveLength(6);
    expect(answer?.directAnswer.split(/\s+/).filter(Boolean).length).toBeGreaterThanOrEqual(40);
    expect(answer?.directAnswer.split(/\s+/).filter(Boolean).length).toBeLessThanOrEqual(80);
    expect(answer?.directAnswer).toContain("tactical role");
    expect(JSON.stringify(answer)).toContain("road captain");
    expect(JSON.stringify(answer)).toContain("super-domestique");
    expect(JSON.stringify(answer)).toContain("lead-out");
  });

  it("publishes official, visible evidence with explicit historical boundaries", () => {
    const answer = getAnswerBySlug("what-is-a-domestique");
    const sources = answer?.sources ?? [];

    expect(sources).toHaveLength(5);
    expect(sources.map((source) => new URL(source.url).hostname)).toEqual(
      expect.arrayContaining([
        "www.letour.fr",
        "assets.ctfassets.net",
        "www.uci.org",
        "roadmancycling.com",
      ]),
    );
    expect(answer?.expertEvidence[0].insight).toContain("doping");
    expect(answer?.expertEvidence[0].insight).toContain("first-person evidence");
    expect(answer?.definedTerm?.name).toBe("Domestique");

    const template = read("src/components/templates/AnswerTemplate.tsx");
    const evidenceBlock = read("src/components/seo/EvidenceBlock.tsx");
    const route = read("src/app/(content)/answers/[slug]/page.tsx");
    expect(template).toContain("reviewedSources={answer.sources?.map");
    expect(evidenceBlock).toContain("Reviewed references");
    expect(route).toContain("citation: answer.sources.map");
    expect(route).toContain('"@type": "DefinedTerm"');
    expect(route).toContain("reviewedBy:");
  });

  it("permanently consolidates the competing glossary URL", () => {
    const term = getTermBySlug("domestique");
    expect(term).not.toBeNull();
    expect(term?.canonicalPath).toBe(OWNER);
    expect(getGlossaryTermPath(term!)).toBe(OWNER);
    expect(JSON.stringify(term)).not.toContain("Tim Declercq");
    expect(JSON.stringify(term)).not.toContain("Wout Poels");

    const glossaryRoute = read("src/app/(content)/glossary/[slug]/page.tsx");
    const sitemap = read("src/app/sitemap.ts");
    const glossaryIndex = read("src/app/(content)/glossary/page.tsx");
    expect(glossaryRoute).toContain("permanentRedirect(term.canonicalPath)");
    expect(sitemap).toContain("?.canonicalPath");
    expect(glossaryIndex).toContain("getGlossaryTermPath(term)");

    for (const path of [
      "src/app/knowledge-graph.json/route.ts",
      "src/app/feeds/glossary.json/route.ts",
      "src/app/api/v1/search/route.ts",
      "src/app/api/v1/fetch/route.ts",
      "src/app/api/content-map/route.ts",
    ]) {
      expect(read(path)).toContain("getGlossaryTermPath");
    }

    expect(LEGACY).not.toBe(OWNER);
  });

  it("records the baseline and aligns crawler and AI discovery", () => {
    const decision = read(
      "docs/seo/gsc-domestique-opportunity-2026-08-26.md",
    );
    expect(decision).toContain("18 clicks");
    expect(decision).toContain("4,806 impressions");
    expect(decision).toContain("0.4% CTR");
    expect(decision).toContain("Average position 7.6");
    expect(decision).toContain("4,716");
    expect(decision).toContain("183");
    expect(decision).toContain("**5 September 2026**");
    expect(decision).toContain("**26 September 2026**");

    const indexNow = read("scripts/submit-indexnow.ts");
    expect(indexNow).toContain(OWNER);
    expect(indexNow).toContain(LEGACY);
    expect(read("src/app/llms.txt/route.ts")).toContain(
      "What Is a Domestique in Cycling?",
    );

    const benchmark = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string; prompt: string }>;
    };
    expect(benchmark.metadata.prompt_count).toBe(benchmark.prompts.length);
    expect(benchmark.prompts).toContainEqual(
      expect.objectContaining({
        id: 272,
        target_page: OWNER,
        prompt:
          "what is a domestique in cycling and what jobs do they do in a race",
      }),
    );
  });
});
