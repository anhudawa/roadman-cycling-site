import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { BEST_FOR_PAGES, getBestForBySlug } from "@/lib/best-for";

const APP_GUIDE_SLUGS = [
  "best-cycling-training-apps",
  "best-cycling-strength-training-apps",
  "best-cycling-recovery-apps",
  "best-cycling-apps-structured-training",
] as const;

function source(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

describe("app commercial search owners", () => {
  it("assigns one substantial owner to each commercial app search job", () => {
    expect(new Set(BEST_FOR_PAGES.map((page) => page.slug)).size).toBe(
      BEST_FOR_PAGES.length,
    );

    for (const slug of APP_GUIDE_SLUGS) {
      const page = getBestForBySlug(slug);
      expect(page, slug).not.toBeNull();
      expect(page?.shortAnswer?.length, slug).toBeGreaterThan(140);
      expect(page?.criteria?.length, slug).toBeGreaterThanOrEqual(4);
      expect(page?.sections?.length, slug).toBeGreaterThanOrEqual(2);
      expect(page?.officialSources?.length, slug).toBeGreaterThanOrEqual(3);
      expect(page?.lastReviewed, slug).toBe("2026-08-31");
      expect(page?.methodology, slug).toContain("desk-based");
      expect(page?.disclosure, slug).toContain("Roadman");
      expect(page?.appCta?.body, slug).toContain("/app");
      expect(page?.picks.some((pick) => /Roadman/i.test(pick.name)), slug).toBe(
        false,
      );

      for (const pick of page?.picks ?? []) {
        expect(pick.officialUrl, `${slug}: ${pick.name}`).toMatch(/^https:\/\//);
        expect(pick.strength?.length, `${slug}: ${pick.name}`).toBeGreaterThan(
          80,
        );
        expect(pick.limitation?.length, `${slug}: ${pick.name}`).toBeGreaterThan(
          60,
        );
      }
    }
  });

  it("keeps the unreleased Roadman product honest and outside the rankings", () => {
    const payload = APP_GUIDE_SLUGS.map((slug) =>
      JSON.stringify(getBestForBySlug(slug)),
    ).join("\n");

    expect(payload).not.toContain("Pocket Coach");
    expect(payload).not.toContain("Android");
    expect(payload).not.toMatch(/Roadman[^\n]{0,80}\$\d/);
    expect(payload).toContain("not ranked before launch");
    expect(payload).toContain("not included in the ranking");
  });

  it("renders trust signals, official evidence and the single /app handoff", () => {
    const route = source("src/app/(content)/best/[slug]/page.tsx");
    const app = source("src/app/(marketing)/app/page.tsx");

    expect(route).toContain('"@type": "Article"');
    expect(route).toContain('"@type": "SoftwareApplication"');
    expect(route).toContain("COMMERCIAL DISCLOSURE");
    expect(route).toContain("Verify on official site");
    expect(route).toContain("research={page.officialSources}");
    expect(route).toContain('href="/app"');
    expect(route).not.toContain("EmailCapture");

    for (const slug of APP_GUIDE_SLUGS) {
      expect(app).toContain(`href="/best/${slug}"`);
    }
  });

  it("records canonical ownership and removes the stale blog owner", () => {
    const keywordMap = source("docs/keyword-map.md");
    const launchSprint = source(
      "docs/seo/app-strength-recovery-launch-sprint-2026-08-28.md",
    );

    expect(keywordMap).not.toContain(
      "| best cycling training apps | /blog/best-cycling-training-apps |",
    );
    for (const slug of APP_GUIDE_SLUGS) {
      expect(`${keywordMap}\n${launchSprint}`).toContain(`/best/${slug}`);
    }
  });
});
