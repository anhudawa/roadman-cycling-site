import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

const OWNER = "cycling-zone-5-vo2max-intervals-guide";
const OWNER_PATH = `/blog/${OWNER}`;

describe("cycling Zone 5 search owner and evidence trust", () => {
  const raw = read(`content/blog/${OWNER}.mdx`);
  const { data, content } = matter(raw);

  it("publishes a direct model-specific Zone 5 answer", () => {
    expect(data.seoTitle).toBe(
      "Cycling Zone 5: Power, Heart Rate & VO2max Explained",
    );
    expect(data.seoTitle.length).toBeLessThanOrEqual(60);
    expect(data.seoDescription.length).toBeGreaterThanOrEqual(120);
    expect(data.seoDescription.length).toBeLessThanOrEqual(160);
    expect(data.updatedDate).toBe("2026-08-26");
    expect(data.lastReviewed).toBe("2026-08-26");
    expect(data.reviewedBy).toContain("zone-model");
    expect(data.answerCapsule.split(/\s+/).length).toBeGreaterThanOrEqual(70);
    expect(data.answerCapsule.split(/\s+/).length).toBeLessThanOrEqual(100);
    expect(data.citedClaims).toHaveLength(6);
    expect(data.faq).toHaveLength(6);
    expect(data.howTo.steps).toHaveLength(6);
    expect(data.howTo.totalTime).toBe("PT10M");
    expect(content).toContain("Cycling Zone 5 at a glance");
    expect(content).toContain("Which Zone 5, calculated from what?");
    expect(content).toContain("Power Zone 5 versus heart-rate Zone 5");
    expect(content).toContain("How much Zone 5 per week?");
  });

  it("grounds zone labels, anchors, kinetics and dose boundaries in sources", () => {
    for (const url of [
      "https://www.trainingpeaks.com/blog/power-training-levels/",
      "https://pubmed.ncbi.nlm.nih.gov/41169886/",
      "https://pubmed.ncbi.nlm.nih.gov/34304689/",
      "https://pubmed.ncbi.nlm.nih.gov/29801189/",
      "https://pubmed.ncbi.nlm.nih.gov/32899777/",
      "https://pubmed.ncbi.nlm.nih.gov/34708276/",
      "https://pubmed.ncbi.nlm.nih.gov/35995143/",
      "https://pubmed.ncbi.nlm.nih.gov/39538060/",
      "https://pubmed.ncbi.nlm.nih.gov/40247924/",
      "https://pubmed.ncbi.nlm.nih.gov/42237396/",
      "https://pubmed.ncbi.nlm.nih.gov/36281325/",
    ]) {
      expect(raw).toContain(url);
    }

    expect(content).toContain(
      "a zone number is shorthand, not a universal unit",
    );
    expect(content).toContain("false precision");
    expect(content).toContain("the percentage is not the athlete");
    expect(content).toContain("One unusual session is data, not a diagnosis");
  });

  it("removes fixed recovery, frequency, decline and gain promises", () => {
    for (const staleClaim of [
      "Two sessions per week is the ceiling",
      "Recovery from Zone 5 sessions takes 36-48 hours",
      "declines 7-10% per decade",
      "declining roughly 7-10 per cent per decade",
      "expect a gain of 3-8 per cent in FTP",
      "expect 2-5 per cent FTP improvements",
      "shift your VO2max by 5-8 per cent over six weeks",
      "This is not fitness — it is cardiac fatigue",
      "Use it for 4-6 weeks",
      "No Zone 5 sessions",
    ]) {
      expect(raw).not.toContain(staleClaim);
    }
  });

  it("hands protocol choice to the canonical VO2max interval owner", () => {
    const protocolOwner = "/blog/cycling-vo2max-intervals";
    expect(content).toContain(
      `[canonical VO2max interval guide](${protocolOwner})`,
    );
    expect(content).toContain(`[VO2max interval guide](${protocolOwner})`);
    expect(read(`content/blog/cycling-vo2max-intervals.mdx`)).toContain(
      `[Zone 5 guide](${OWNER_PATH})`,
    );

    for (const duplicatedSection of [
      "### Long repeats: 3-5 minutes",
      "### Short-short: 30/30 and 40/20",
      "### Micro-intervals: Ronnestad 30/15",
      "Where Zone 5 fits in the season",
    ]) {
      expect(content).not.toContain(duplicatedSection);
    }
  });

  it("routes the Zone 5 glossary entity to the article owner", () => {
    const glossary = read("src/lib/glossary.ts");
    expect(glossary).toContain('slug: "zone-5"');
    expect(glossary).toContain('term: "Cycling Zone 5"');
    expect(glossary).toContain(`canonicalPath: "${OWNER_PATH}"`);
    expect(glossary).toContain(
      "A zone number has meaning only when its model, metric and test anchor are stated",
    );
    expect(glossary).not.toContain(
      "The key is consistent testing and honest zone adherence",
    );
  });

  it("extends LLM, AI benchmark and recrawl discovery", () => {
    expect(read("src/lib/seo/llms-content.ts")).toContain(`"${OWNER}"`);
    expect(read("src/app/llms-full.txt/route.ts")).toContain(
      `${OWNER} — Canonical cycling Zone 5 guide`,
    );
    expect(read("scripts/submit-indexnow.ts")).toContain(`"${OWNER}"`);

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; prompt: string; target_page: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({
        id: 288,
        prompt:
          "what is cycling Zone 5 and is it the same as VO2 max for power and heart rate",
        target_page: OWNER_PATH,
      }),
    );
  });

  it("records and protects the Search Console measurement cohort", () => {
    const decision = read(
      "docs/seo/gsc-cycling-zone-5-opportunity-2026-08-26.md",
    );
    for (const signal of [
      "19",
      "1.15K",
      "1.7%",
      "7.5",
      "zone 5 vo2 max",
      "zone 5 cycling",
      "how much zone 5 per week",
      "5 September 2026",
      "26 September 2026",
    ]) {
      expect(decision).toContain(signal);
    }
  });
});
