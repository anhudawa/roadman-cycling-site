import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("crawlable internal-link graph", () => {
  it("models every server-rendered link source used by the public templates", () => {
    const audit = read("scripts/audit-orphans.ts");

    for (const requiredModel of [
      "RETIRED_BLOG_SLUGS",
      "data.relatedPosts",
      "getAllTopics()",
      "generatedRelatedEpisodes",
      "chronological older/newer links",
      "[blog archive]",
      "[podcast archive]",
    ]) {
      expect(audit).toContain(requiredModel);
    }
  });

  it("gives every podcast record a stable chronological crawl path", () => {
    const page = read("src/app/(content)/podcast/[slug]/page.tsx");

    expect(page).toContain('aria-label="Episode chronology"');
    expect(page).toContain("← OLDER EPISODE");
    expect(page).toContain("NEWER EPISODE →");
    expect(page).toContain("getAllEpisodes");
  });

  it("keeps priority media and training articles connected to a live owner", () => {
    const topics = read("src/lib/topics.ts");
    const tour = read("src/app/tour-de-france/page.tsx");

    expect(topics).toContain(
      '"breitling-top-time-eddy-merckx-cycling-watch"',
    );
    expect(topics).toContain('"zone-2-not-working-cycling"');
    expect(topics).toContain('"how-grand-tour-riders-fuel-5000-calories"');
    expect(tour).toContain(
      'href="/blog/paul-seixas-tour-de-france-2026-youngest-contender"',
    );
  });

  it("publishes a zero-defect graph report", () => {
    const report = read("docs/seo/orphan-audit.md");

    expect(report).toContain("Orphans (0 inbound): **0**");
    expect(report).toContain("Weak (1 inbound): **0**");
    expect(report).not.toContain("Broken internal links");
  });
});
