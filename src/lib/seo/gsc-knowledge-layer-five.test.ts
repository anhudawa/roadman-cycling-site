import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

const parse = (relativePath: string) => matter(read(relativePath));

describe("GSC knowledge-layer five", () => {
  it("publishes source-bounded Joe Friel and Stephen Seiler entity owners", () => {
    const joe = parse("content/entities/joe-friel.mdx");
    const seiler = parse("content/entities/stephen-seiler.mdx");

    expect(joe.data.seoTitle).toContain("Joe Friel");
    expect(joe.data.podcastAppearances).toBe(2);
    expect(joe.data.sources).toHaveLength(4);
    expect(joe.data.faqs).toHaveLength(5);
    expect(joe.data.lastReviewed).toBe("2026-08-27");
    expect(joe.content).toContain("did not prescribe one perfect week");
    expect(joe.content).not.toContain("sold more copies than any other");

    expect(seiler.data.seoTitle).toContain("Stephen Seiler");
    expect(seiler.data.podcastAppearances).toBe(3);
    expect(seiler.data.sources).toHaveLength(5);
    expect(seiler.data.faqs).toHaveLength(5);
    expect(seiler.data.lastReviewed).toBe("2026-08-27");
    expect(seiler.content).toContain("80% of **sessions**");
    expect(seiler.content).not.toContain("Both terms originate with him");
  });

  it("makes the Alpe d'Huez owner current after the 2026 double finish", () => {
    const source = read("content/blog/alpe-dhuez-tour-de-france-history.mdx");
    const page = matter(source);

    expect(page.data.seoTitle).toBe(
      "Alpe d'Huez Record & Tour de France History",
    );
    expect(page.data.updatedDate).toBe("2026-08-27");
    expect(page.data.lastReviewed).toBe("2026-08-27");
    expect(page.data.answerCapsule).toContain("35:26");
    expect(page.data.answerCapsule).toContain("Richard Carapaz");
    expect(source).toContain("https://www.letour.fr/en/stage-19");
    expect(source).toContain("data/data-du-jour-etape-20");
    expect(source).toContain("methodology label");
    expect(source).not.toContain("The 2026 double ascent is about to");
    expect(source).not.toContain("Pantani holds the fastest");
  });

  it("separates Marco Pantani findings, allegations and current case status", () => {
    const source = read(
      "content/blog/marco-pantani-death-doping-mafia-investigation.mdx",
    );
    const page = matter(source);

    expect(page.data.seoTitle).toBe(
      "Marco Pantani Death: Cause, Inquiries & 2026 Status",
    );
    expect(page.data.lastReviewed).toBe("2026-08-27");
    expect(page.data.answerCapsule).toContain("acute cocaine intoxication");
    expect(page.data.answerCapsule).toContain("archived on 16 May 2026");
    expect(source).toContain("parlamento.it/application/xmanager");
    expect(source).toContain("corrieredeltrentino.corriere.it");
    expect(source).toContain("A responsible account does not convert an open file into a verdict");
    expect(source).not.toContain("Both files are officially open");
  });

  it("assigns broad Velominati intent to part one and narrows parts two and three", () => {
    const part1 = parse(
      "content/podcast/the-secret-velominati-rules-part-1.mdx",
    );
    const part2 = parse(
      "content/podcast/the-secret-velominati-rules-part-2.mdx",
    );
    const part3 = parse(
      "content/podcast/the-secret-velominati-rules-part-3.mdx",
    );

    expect(part1.data.seoTitle).toBe(
      "Velominati Rules: Unofficial Cycling Code Explained",
    );
    expect(part1.data.answerCapsule).toContain("not UCI regulations");
    expect(part1.data.citations[0]).toMatchObject({ reviewed: true });

    expect(part2.data.seoTitle).toContain("Part 2");
    expect(part2.data.keywords).toContain("velominati rules part 2");
    expect(part2.data.answerCapsule).toContain("owns only the second episode");

    expect(part3.data.seoTitle).toContain("Part 3");
    expect(part3.data.keywords).toContain("velominati rules part 3");
    expect(part3.data.answerCapsule).toContain("not bike-fit");
    expect(part3.data.citations[0]).toMatchObject({ reviewed: true });

    for (const page of [part1, part2, part3]) {
      expect(page.data.updatedDate).toBe("2026-08-27");
      expect(page.data.lastReviewed).toBe("2026-08-27");
    }
  });

  it("extends LLM discovery, recrawl and answer-engine measurement", () => {
    const llms = read("src/app/llms.txt/route.ts");
    const pinned = read("src/lib/seo/llms-content.ts");
    const indexNow = read("scripts/submit-indexnow.ts");
    const benchmark = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string }>;
    };

    for (const path of [
      "/entity/joe-friel",
      "/entity/stephen-seiler",
      "/podcast/the-secret-velominati-rules-part-1",
    ]) {
      expect(llms).toContain(path);
    }

    for (const path of [
      "/entity/joe-friel",
      "/entity/stephen-seiler",
      "/blog/alpe-dhuez-tour-de-france-history",
      "/blog/marco-pantani-death-doping-mafia-investigation",
      "/podcast/the-secret-velominati-rules-part-1",
    ]) {
      expect(indexNow).toContain(path);
    }

    for (const slug of [
      "stephen-seiler-80-20-polarised-training-cyclists",
      "alpe-dhuez-tour-de-france-history",
      "marco-pantani-death-doping-mafia-investigation",
    ]) {
      expect(pinned).toContain(slug);
    }

    expect(benchmark.metadata.prompt_count).toBe(benchmark.prompts.length);
    expect(benchmark.prompts.slice(-5).map((prompt) => prompt.id)).toEqual([
      312, 313, 314, 315, 316,
    ]);
  });
});
