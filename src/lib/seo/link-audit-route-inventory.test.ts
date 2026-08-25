import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getAllAnswerSlugs } from "@/lib/answers";
import { getVideoEpisodes } from "@/lib/seo/video-watch";
import { getAllGuestSlugs } from "@/lib/guests";

const inventorySource = readFileSync(
  resolve(process.cwd(), "scripts/dump-route-inventory.ts"),
  "utf8",
);
const auditSource = readFileSync(
  resolve(process.cwd(), "scripts/audit-links.mjs"),
  "utf8",
);

describe("link-audit route inventory", () => {
  it("has substantial, duplicate-free answer and watch inventories", () => {
    const answerSlugs = getAllAnswerSlugs();
    const watchSlugs = getVideoEpisodes().map((episode) => episode.slug);

    expect(answerSlugs.length).toBeGreaterThan(500);
    expect(new Set(answerSlugs).size).toBe(answerSlugs.length);
    expect(watchSlugs.length).toBeGreaterThan(300);
    expect(new Set(watchSlugs).size).toBe(watchSlugs.length);
  });

  it("keeps one canonical owner for the tubeless setup answer", () => {
    expect(
      getAllAnswerSlugs().filter(
        (slug) => slug === "how-to-set-up-tubeless-tyres",
      ),
    ).toHaveLength(1);
  });

  it("keeps the repaired podcast guest entities in the canonical inventory", () => {
    const guestSlugs = new Set(getAllGuestSlugs());
    for (const slug of [
      "benji-naesen",
      "chris-harper",
      "dylan-johnson",
      "lael-wilcox",
      "sebastian-breuer",
      "ted-king",
    ]) {
      expect(guestSlugs.has(slug), slug).toBe(true);
    }
  });

  it("exports both production inventories for the offline link audit", () => {
    expect(inventorySource).toContain("answers: getAllAnswerSlugs()");
    expect(inventorySource).toContain(
      "watch: getVideoEpisodes().map((episode) => episode.slug)",
    );
    expect(inventorySource).toContain("tourStages: TOUR_STAGES.map");
    expect(inventorySource).toContain("tourHistory: getAllHistorySlugs()");
    expect(inventorySource).toContain("expertTopicPairs: getAllExpertTopicPairs()");
    expect(inventorySource).toContain("recommendationCategories: FALLBACK_CATEGORIES.map");
  });

  it("permanently consolidates retired campaign URLs into current owners", () => {
    const configSource = readFileSync(
      resolve(process.cwd(), "next.config.ts"),
      "utf8",
    );
    for (const [source, destination] of [
      ["/14day", "/training-plans"],
      ["/8week", "/training-plans"],
      ["/roadmancc52487793", "/community"],
      ["/web-class", "/coaching"],
    ]) {
      expect(configSource).toContain(
        `{ source: "${source}", destination: "${destination}", permanent: true }`,
      );
    }
  });

  it("validates answer and watch links against those inventories", () => {
    expect(auditSource).toContain('["/answers/", ANSWER_SLUGS]');
    expect(auditSource).toContain('["/watch/", WATCH_SLUGS]');
    expect(auditSource).toContain("answerSlugs: ANSWER_SLUGS.size");
    expect(auditSource).toContain("watchSlugs: WATCH_SLUGS.size");
  });

  it("mirrors the runtime safeguards for missing blog images and unpublished plans", () => {
    expect(auditSource).toContain("sanitized-blog-image-fallback");
    expect(auditSource).toContain("non-navigable-training-peaks-placeholder");

    const blogSource = readFileSync(
      resolve(process.cwd(), "src/lib/blog.ts"),
      "utf8",
    );
    const resourceListSource = readFileSync(
      resolve(
        process.cwd(),
        "src/app/(method)/method/_components/ResourceList.tsx",
      ),
      "utf8",
    );
    expect(blogSource).toContain("fs.existsSync(onDisk) ? value : undefined");
    expect(resourceListSource).toContain('resource.kind === "training-peaks"');
    expect(resourceListSource).toContain("COMING SOON");
  });
});
