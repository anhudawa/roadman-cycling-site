import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

const CANONICAL_SLUG = "age-group-ftp-benchmarks-2026";
const EXPERIENCE_SLUG = "ftp-benchmarks-by-age-and-experience";
const RETIRED_SLUGS = [
  "good-ftp-for-my-age",
  "cycling-what-is-a-good-ftp-by-age-guide",
  "masters-ftp-benchmarks-cycling-guide",
] as const;

function blogFile(slug: string) {
  return resolve(process.cwd(), `content/blog/${slug}.mdx`);
}

describe("FTP benchmark intent consolidation", () => {
  it("permanently redirects each retired duplicate to the maintained report", () => {
    const config = readFileSync(
      resolve(process.cwd(), "next.config.ts"),
      "utf8",
    );

    for (const slug of RETIRED_SLUGS) {
      expect(config).toContain(`source: "/blog/${slug}"`);
      const redirect = config.slice(
        config.indexOf(`source: "/blog/${slug}"`),
        config.indexOf(`source: "/blog/${slug}"`) + 220,
      );
      expect(redirect).toContain(
        `destination: "/blog/${CANONICAL_SLUG}"`,
      );
      expect(redirect).toContain("permanent: true");
      expect(existsSync(blogFile(slug))).toBe(false);
    }
  });

  it("keeps the annual age report current and free of retired links", () => {
    const raw = readFileSync(blogFile(CANONICAL_SLUG), "utf8");
    const { data } = matter(raw);

    expect(data.updatedDate).toBe("2026-08-26");
    expect(data.lastReviewed).toBe("2026-08-26");
    expect(data.relatedPosts).toContain(EXPERIENCE_SLUG);
    expect(raw).toContain(`/blog/${EXPERIENCE_SLUG}`);

    for (const slug of RETIRED_SLUGS) {
      expect(raw).not.toContain(slug);
    }
  });

  it("keeps the incumbent page focused on training experience", () => {
    const raw = readFileSync(blogFile(EXPERIENCE_SLUG), "utf8");
    const { data, content } = matter(raw);

    expect(data.updatedDate).toBe("2026-08-26");
    expect(data.lastReviewed).toBe("2026-08-26");
    expect(data.title).toMatch(/Experience Level/i);
    expect(data.keywords).toEqual(
      expect.arrayContaining([
        "ftp benchmarks by experience",
        "beginner cyclist ftp",
        "club cyclist ftp",
        "elite amateur ftp",
      ]),
    );
    expect(
      (data.keywords as string[]).every((keyword) => !/\bage\b/i.test(keyword)),
    ).toBe(true);
    expect(content).toContain(`/blog/${CANONICAL_SLUG}`);
    expect(content).not.toContain(
      "## FTP benchmarks by age group (supporting context)",
    );

    for (const slug of RETIRED_SLUGS) {
      expect(raw).not.toContain(slug);
    }
  });
});
