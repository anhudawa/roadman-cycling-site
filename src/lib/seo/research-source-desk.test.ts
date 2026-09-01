import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { RESEARCH_ASSETS } from "@/data/research-assets";

const page = fs.readFileSync(
  path.join(process.cwd(), "src/app/(marketing)/about/press/page.tsx"),
  "utf8",
);

describe("Roadman research source desk", () => {
  it("renders the maintained asset registry instead of a second hardcoded list", () => {
    expect(RESEARCH_ASSETS).toHaveLength(4);
    expect(page).toContain("RESEARCH_ASSETS.map");
    expect(page).toContain("/feeds/research-assets.json");
  });

  it("publishes editorial boundaries and direct downloads", () => {
    expect(page).toContain("asset.limitations[0]");
    expect(page).toContain('"supplementaryDataPaths" in asset');
    expect(page).toContain("a coaching framework is not a rider");
    expect(page).toContain("an evidence benchmark is not a survey");
  });
});
