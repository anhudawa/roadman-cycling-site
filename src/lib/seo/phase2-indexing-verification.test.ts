import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("Phase 2 owner indexing verification", () => {
  const decision = read(
    "docs/seo/gsc-phase2-owner-indexing-verification-2026-08-26.md",
  );
  const handoff = read("docs/seo/manual-tasks-handoff.md");

  it("records read-only GSC evidence for every canonical owner", () => {
    for (const path of [
      "/podcast",
      "/coaching",
      "/masters",
      "/training-plans",
      "/training-camps",
    ]) {
      expect(decision).toContain(`| \`${path}\` | **URL is on Google**`);
      expect(handoff).toContain(`| \`${path}\` | **URL is on Google**`);
    }

    expect(decision).toContain("No **Request\nindexing** action was triggered");
    expect(decision).toContain("does not justify");
  });

  it("replaces the obsolete bulk-submission playbook", () => {
    for (const staleInstruction of [
      "still click Request Indexing",
      "forces discovery within 24-48 hours",
      "Google limits indexing requests to ~10-12 per day",
      "FAQ/HowTo/Review rich snippets start appearing",
      "should start appearing within 48-72 hours",
    ]) {
      expect(handoff).not.toContain(staleInstruction);
    }

    expect(handoff).toContain("Use URL Inspection as a read-only diagnostic");
    expect(handoff).toContain("Never batch-click");
    expect(handoff).toContain(
      "gsc-phase2-owner-indexing-verification-2026-08-26.md",
    );
  });

  it("keeps Google and IndexNow discovery channels distinct", () => {
    expect(handoff).toContain("Google does not use IndexNow");
    expect(handoff).toContain(
      "canonical internal\nlink graph plus the submitted sitemap",
    );
    expect(decision).toContain("does not submit URLs to Google");
  });

  it("records the successful sitemap state without hiding stale rows", () => {
    expect(decision).toContain("sitemap index as **Success**");
    expect(decision).toContain("349 discovered pages");
    expect(decision).toContain("/sitemap/7.xml");
    expect(decision).toContain("historical\n**Couldn't fetch** result");
    expect(handoff).toContain("successful canonical sitemap index");
  });

  it("distinguishes indexed URLs from post-release recrawls", () => {
    expect(decision).toContain("## Day-zero crawl-processing baseline");
    expect(decision).toContain(
      "| `/podcast` | 26 Aug 2026, 2:31:26 PM | Recrawled after the owner release |",
    );
    expect(decision).toContain(
      "| `/training-plans` | 25 Aug 2026, 7:01:52 PM | Recrawled after the owner release |",
    );

    const mastersRelease = read(
      "docs/seo/gsc-masters-vo2max-nutrition-authority-2026-08-26.md",
    );
    expect(mastersRelease).toContain("### Google recrawl baseline");
    expect(mastersRelease).toContain(
      "| `/masters/vo2max` | 19 Aug 2026, 5:37:07 AM |",
    );
    expect(mastersRelease).toContain(
      "does not yet prove that Google has processed the new evidence",
    );
    expect(mastersRelease).toContain(
      "No manual request-indexing action is\nrequired",
    );
  });
});
