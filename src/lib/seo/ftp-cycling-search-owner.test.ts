import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getGlossaryTermPath, getTermBySlug } from "@/lib/glossary";
import { getTopicBySlug } from "@/lib/topics";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

const OWNER = "/topics/ftp-training";
const LEGACY = "/glossary/ftp";

describe("FTP cycling search ownership and evidence trust", () => {
  it("makes the topic hub the reviewed broad-intent owner", () => {
    const topic = getTopicBySlug("ftp-training");

    expect(topic?.title).toBe("FTP Cycling: Meaning, Tests, Zones & Training");
    expect(topic?.description).toContain(
      "practical estimate of threshold power",
    );
    expect(topic?.lastReviewed).toBe("2026-08-26");
    expect(topic?.reviewedBy?.name).toBe("Anthony Walsh");
    expect(topic?.definedTerm?.termCode).toBe("FTP");
    expect(topic?.faqs).toHaveLength(6);
    expect(topic?.sources).toHaveLength(7);
  });

  it("publishes primary references and removes universal FTP claims", () => {
    const topic = getTopicBySlug("ftp-training");
    const sourceHosts = topic?.sources.map(
      (source) => new URL(source.href).hostname,
    );

    expect(sourceHosts).toEqual(
      expect.arrayContaining([
        "www.trainingpeaks.com",
        "help.trainingpeaks.com",
        "www.britishcycling.org.uk",
        "pubmed.ncbi.nlm.nih.gov",
      ]),
    );

    const owner = read("content/topics/ftp-training.mdx");
    for (const staleClaim of [
      "determines your climbing speed",
      "Most cyclists see measurable improvement within 6-8 weeks",
      "The gold standard",
      "every elite coach",
      "Aim for 80% of your training time",
      "estimates FTP within ~5% for most amateurs",
    ]) {
      expect(owner).not.toContain(staleClaim);
    }

    for (const evidenceBoundary of [
      "not a universal physiological breakpoint",
      "FTP, critical power",
      "time to exhaustion",
      "power-duration curve",
      "measurement and day-to-day noise",
    ]) {
      expect(owner).toContain(evidenceBoundary);
    }
  });

  it("emits citations, review signals and the canonical DefinedTerm", () => {
    const route = read("src/app/(content)/topics/[slug]/page.tsx");
    const methodology = read(
      "src/components/features/aeo/SourceMethodology.tsx",
    );

    expect(route).toContain("citation: topic.sources.map");
    expect(route).toContain('"@type": "DefinedTerm"');
    expect(route).toContain('"#defined-term"');
    expect(route).toContain("research={topic.sources}");
    expect(route).toContain("lastReviewed={topic.lastReviewed}");
    expect(methodology).toContain("Primary references");
  });

  it("retires the duplicate glossary owner across discovery surfaces", () => {
    const term = getTermBySlug("ftp");

    expect(term?.canonicalPath).toBe(OWNER);
    expect(getGlossaryTermPath(term!)).toBe(OWNER);

    const glossaryRoute = read("src/app/(content)/glossary/[slug]/page.tsx");
    const sitemap = read("src/app/sitemap.ts");
    expect(glossaryRoute).toContain("permanentRedirect(term.canonicalPath)");
    expect(sitemap).toContain("?.canonicalPath");
    expect(sitemap).toContain('slug === "ftp-training"');
    expect(LEGACY).not.toBe(OWNER);
  });

  it("keeps specialist intents separate and links them to the broad owner", () => {
    const experience = read(
      "content/blog/ftp-benchmarks-by-age-and-experience.mdx",
    );
    const age = read("content/blog/age-group-ftp-benchmarks-2026.mdx");

    expect(experience).toContain(
      "This page owns the narrower experience-level comparison",
    );
    expect(age).toContain("This is the age-qualified benchmark owner");
    expect(experience).toContain("](/topics/ftp-training)");
    expect(age).toContain("](/topics/ftp-training)");
    expect(experience).toContain(
      "What FTP is typical for a male cyclist at each experience level?",
    );
    expect(age).toContain(
      "How should age-group cyclists use FTP and W/kg together?",
    );
  });

  it("records the GSC baseline and aligns search and AI discovery", () => {
    const decision = read("docs/seo/gsc-ftp-cycling-opportunity-2026-08-26.md");
    for (const signal of [
      "15",
      "2,332",
      "0.6%",
      "6.9",
      "1,637",
      "640",
      "65",
      "5 September 2026",
      "26 September 2026",
    ]) {
      expect(decision).toContain(signal);
    }

    expect(read("src/app/llms.txt/route.ts")).toContain(
      "Canonical broad FTP owner",
    );
    const indexNow = read("scripts/submit-indexnow.ts");
    expect(indexNow).toContain(OWNER);
    expect(indexNow).toContain(LEGACY);

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string; prompt: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({
        id: 273,
        target_page: OWNER,
        prompt:
          "what is FTP in cycling and does it always equal one hour power",
      }),
    );
  });
});
