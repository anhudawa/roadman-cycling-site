import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import {
  getSearchOwnerFallbackForTopicHub,
  resolveSearchOwner,
} from "./search-ownership";

function resolveArticleOwner(slug: string) {
  const { data } = matter(
    readFileSync(resolve(process.cwd(), `content/blog/${slug}.mdx`), "utf8"),
  );

  return resolveSearchOwner(
    [data.title, data.seoTitle, data.seoDescription, ...(data.keywords ?? [])],
    {
      currentPath: `/blog/${slug}`,
      fallbackId: getSearchOwnerFallbackForTopicHub(data.primaryHub),
    },
  );
}

describe("topic-hub search-owner fallback", () => {
  it.each([
    ["amstel-gold-race-sportive-training-guide", "/training-plans"],
    ["70-3-bike-training-plan-12-weeks", "/training-plans"],
    ["ironman-bike-training-plan-16-weeks", "/training-plans"],
    ["age-group-ftp-benchmarks-2026", "/masters"],
    ["cycling-blood-pressure-cardiovascular-health-guide", "/masters"],
    ["cornering-confidence-road-bike-technique", "/coaching"],
  ])("routes %s through its editorial hub to %s", (slug, ownerPath) => {
    expect(resolveArticleOwner(slug)?.path).toBe(ownerPath);
  });

  it("keeps narrower camp intent ahead of the training-plan fallback", () => {
    expect(
      resolveArticleOwner("cycling-training-camp-preparation-guide")?.path,
    ).toBe("/training-camps");
  });
});
