import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const OWNER_SLUG = "low-cadence-training-cycling-torque-intervals";
const RETIRED_SLUG = "low-cadence-training-world-tour-coaches";

function repoFile(path: string) {
  return resolve(process.cwd(), path);
}

function blogFile(slug: string) {
  return repoFile(`content/blog/${slug}.mdx`);
}

describe("low-cadence evidence consolidation", () => {
  it("permanently redirects and removes the weaker duplicate", () => {
    const config = readFileSync(repoFile("next.config.ts"), "utf8");
    const source = `source: "/blog/${RETIRED_SLUG}"`;
    const redirect = config.slice(
      config.indexOf(source),
      config.indexOf(source) + 320,
    );

    expect(config).toContain(source);
    expect(redirect).toContain(`destination: "/blog/${OWNER_SLUG}"`);
    expect(redirect).toContain("permanent: true");
    expect(existsSync(blogFile(RETIRED_SLUG))).toBe(false);
  });

  it("makes the incumbent a reviewed, primary-source evidence owner", () => {
    const raw = readFileSync(blogFile(OWNER_SLUG), "utf8");
    const { data, content } = matter(raw);

    expect(data.title).toBe(
      "Low Cadence Training for Cycling: Evidence & Torque Sessions",
    );
    expect(data.primaryHub).toBe("cycling-cadence");
    expect(data.updatedDate).toBe("2026-08-25");
    expect(data.lastReviewed).toBe("2026-08-25");
    expect(data.reviewedBy).toContain("Matthew Devins");
    expect(data.citedClaims).toHaveLength(5);
    expect(data.keyTakeaways).toHaveLength(6);
    expect(content).toContain(
      "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0311833",
    );
    expect(content).toContain("https://pubmed.ncbi.nlm.nih.gov/24550843/");
    expect(content).toContain("https://pubmed.ncbi.nlm.nih.gov/27175601/");
    expect(content).toContain("https://pubmed.ncbi.nlm.nih.gov/23898683/");
    expect(content).toContain("8–12 × 30 seconds maximal");
    expect(content).toContain("4–6 × 4 minutes");
    expect(content).toContain("90–100% maximal aerobic power");
    expect(content).toContain("150–180 minutes");
    expect(content.match(/^# /gm)).toBeNull();
  });

  it("removes the old promises from the answer surfaces", () => {
    const raw = readFileSync(blogFile(OWNER_SLUG), "utf8");
    const { data } = matter(raw);
    const answerSurfaces = JSON.stringify({
      title: data.title,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      excerpt: data.excerpt,
      answerCapsule: data.answerCapsule,
      keyTakeaways: data.keyTakeaways,
      faq: data.faq,
      roadmanView: data.roadmanView,
    });

    expect(answerSurfaces).not.toContain("The Study That Proved the Coaches Right");
    expect(answerSurfaces).not.toContain("same sessions, same effort, nearly double");
    expect(answerSurfaces).not.toContain("will get injured");
    expect(answerSurfaces).not.toContain("body mass stayed exactly");
    expect(answerSurfaces).not.toContain("forcing fast-twitch fibres to develop");
    expect(data.answerCapsule).toContain("24");
    expect(data.answerCapsule).toContain("50–70 rpm");
    expect(data.answerCapsule).toContain("null or mixed");
  });

  it("routes active support surfaces to the owner", () => {
    const activeFiles = [
      "src/lib/topics.ts",
      "content/blog/best-cadence-for-climbing.mdx",
      "content/blog/climb-faster-cycling-five-fixable-reasons.mdx",
      "content/blog/cycling-cadence-guide-runners.mdx",
      "content/blog/fasted-vs-fueled-cycling.mdx",
      "content/blog/sweet-spot-training-cycling-guide.mdx",
      "content/blog/tour-training-methods-amateurs-can-use.mdx",
      "content/method/protocols/09-power-where-it-counts.mdx",
    ];

    for (const path of activeFiles) {
      const raw = readFileSync(repoFile(path), "utf8");
      expect(raw, path).not.toContain(RETIRED_SLUG);
    }

    const topicMap = readFileSync(repoFile("src/lib/topics.ts"), "utf8");
    expect(topicMap).toContain(OWNER_SLUG);
    expect(topicMap).toContain(
      "A small 2024 trial in 24 well-trained female cyclists aged 17-20",
    );
  });

  it("records the GSC decision and extends discovery tracking", () => {
    const gsc = readFileSync(
      repoFile("docs/seo/gsc-low-cadence-consolidation-2026-08-25.md"),
      "utf8",
    );
    expect(gsc).toContain("224 clicks, 15,669 impressions, 1.4% CTR");
    expect(gsc).toContain("45\nclicks, 4,550 impressions, 1.0% CTR");
    expect(gsc).toContain("cosine similarity of **0.883**");
    expect(gsc).toContain("**13 clicks,\n829 impressions, 1.6% CTR");
    expect(gsc).toContain("earliest reliable review 3\n  September 2026");
    expect(gsc).toContain("earliest reliable\n  review 24 September 2026");

    const indexNow = readFileSync(repoFile("scripts/submit-indexnow.ts"), "utf8");
    expect(indexNow).toContain(`/blog/${OWNER_SLUG}`);

    const prompts = JSON.parse(
      readFileSync(repoFile("scripts/ai-benchmark-prompts.json"), "utf8"),
    ) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string; prompt: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({
        id: 223,
        target_page: `/blog/${OWNER_SLUG}`,
        prompt: "what does the evidence say about low cadence torque intervals for cyclists",
      }),
    );
  });
});
