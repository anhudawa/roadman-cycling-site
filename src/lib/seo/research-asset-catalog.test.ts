import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { RESEARCH_ASSETS } from "@/data/research-assets";

const root = process.cwd();

function read(relativePath: string) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

describe("research asset catalogue discovery", () => {
  it("keeps every registered canonical page and data file in the repository", () => {
    for (const asset of RESEARCH_ASSETS) {
      if (asset.canonicalPath.startsWith("/blog/")) {
        expect(
          fs.existsSync(
            path.join(root, "content/blog", `${asset.canonicalPath.replace("/blog/", "")}.mdx`),
          ),
        ).toBe(true);
      }

      if (asset.dataPath.startsWith("/data/")) {
        expect(fs.existsSync(path.join(root, "public", asset.dataPath))).toBe(true);
      }
    }
  });

  it("makes the new assets and machine-readable catalogue visible from /research", () => {
    const page = read("src/app/(content)/research/page.tsx");

    expect(page).toContain("/feeds/research-assets.json");
    expect(page).toContain("/blog/sportive-training-readiness-index-2026");
    expect(page).toContain("/blog/amateur-cyclist-fuelling-benchmarks-report-2026");
    expect(page).toContain("NOT POPULATION DATA");
    expect(page).toContain("NOT A RIDER SURVEY");
  });

  it("advertises the catalogue in both LLM discovery files", () => {
    expect(read("src/app/llms.txt/route.ts")).toContain("/feeds/research-assets.json");
    expect(read("src/app/llms-full.txt/route.ts")).toContain(
      "/feeds/research-assets.json",
    );
  });
});
