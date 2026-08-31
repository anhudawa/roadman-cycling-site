import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("cycling strength session planner search owner", () => {
  const page = read(
    "src/app/(content)/tools/strength-session-planner/page.tsx",
  );
  const layout = read(
    "src/app/(content)/tools/strength-session-planner/layout.tsx",
  );

  it("owns strength-placement intent with an inspectable, bounded tool", () => {
    expect(page).toContain("CYCLING STRENGTH SESSION PLANNER");
    expect(page).toContain("PLACEMENT_RULES");
    expect(page).toContain('<ToolLanding slug="strength-session-planner" />');
    expect(page).toContain('href="/app"');
    expect(page).toContain('data-track="strength_placement_app"');
    expect(page).toMatch(/does not prescribe exercises/i);
    expect(layout).toContain('canonical: "/tools/strength-session-planner"');
    expect(layout).toContain('<ToolSchemas slug="strength-session-planner" />');
  });

  it("is connected from every core crawl and knowledge surface", () => {
    for (const path of [
      "src/app/(content)/tools/page.tsx",
      "src/app/(marketing)/app/page.tsx",
      "src/app/sitemap.ts",
      "src/app/llms.txt/route.ts",
      "src/app/llms-full.txt/route.ts",
      "src/lib/tools-registry.ts",
      "src/lib/tools/landing-content.ts",
      "src/lib/topics.ts",
      "scripts/submit-indexnow.ts",
    ]) {
      expect(read(path)).toContain("strength-session-planner");
    }
  });

  it("receives contextual links from the two established strength owners", () => {
    for (const path of [
      "content/blog/cycling-strength-training-guide.mdx",
      "content/blog/cycling-gym-exercises-best.mdx",
    ]) {
      expect(read(path)).toContain("](/tools/strength-session-planner)");
    }
  });

  it("adds four measurable AI-search prompts without changing the app owner", () => {
    const benchmark = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string }>;
    };

    expect(benchmark.metadata.prompt_count).toBe(benchmark.prompts.length);
    const placementPrompts = benchmark.prompts.filter(
      (prompt) => prompt.target_page === "/tools/strength-session-planner",
    );

    expect(placementPrompts).toMatchObject(
      Array.from({ length: 4 }, (_, index) => ({
        id: 327 + index,
        target_page: "/tools/strength-session-planner",
      })),
    );
  });

  it("keeps the internal product codename off public surfaces", () => {
    for (const path of [
      "src/app/(content)/tools/strength-session-planner/page.tsx",
      "src/app/(content)/tools/strength-session-planner/layout.tsx",
      "src/lib/tools/landing-content.ts",
      "src/app/(marketing)/app/page.tsx",
      "src/app/llms.txt/route.ts",
      "src/app/llms-full.txt/route.ts",
    ]) {
      expect(read(path)).not.toContain("Pocket Coach");
    }
  });
});
