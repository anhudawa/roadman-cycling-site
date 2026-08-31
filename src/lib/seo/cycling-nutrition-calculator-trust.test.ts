import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

const TOOL_PATH = "src/app/(content)/tools/fuelling/FuellingClient.tsx";
const CONTENT_PATH = "src/lib/tools/landing-content.ts";

describe("cycling nutrition calculator search and evidence trust", () => {
  it("makes the exact high-impression query the visible and metadata owner", () => {
    const page = read("src/app/(content)/tools/fuelling/page.tsx");
    const layout = read("src/app/(content)/tools/fuelling/layout.tsx");
    const client = read(TOOL_PATH);
    const content = read(CONTENT_PATH);

    expect(page).toContain(
      'absolute: "Cycling Nutrition Calculator: Carbs, Fluid & Sodium"',
    );
    expect(layout).toContain(
      'absolute: "Cycling Nutrition Calculator: Carbs, Fluid & Sodium"',
    );
    expect(layout).toContain('"cycling nutrition calculator"');
    expect(layout).toContain('"cycling fuelling calculator"');
    expect(client).toContain("CYCLING NUTRITION CALCULATOR");
    expect(content).toContain('title: "Cycling Nutrition Calculator"');
    expect(content).toContain('breadcrumbName: "Cycling Nutrition Calculator"');
  });

  it("shows model boundaries instead of presenting estimates as measurements", () => {
    const client = read(TOOL_PATH);
    const content = read(CONTENT_PATH);

    for (const required of [
      "planning estimates, not measured sweat or nutrition losses",
      "It is not a laboratory measurement of your oxidation rate",
      "The carbohydrate model is driven by power, session type and duration",
      "do not drink enough to gain body mass",
      "durationPlanningCap",
      "planning cap, not a measured absorption limit",
      "This is a planning model",
      "Research supporting 120 g/hr comes from tightly controlled endurance protocols",
    ]) {
      expect(`${client}\n${content}`).toContain(required);
    }

    for (const staleClaim of [
      "precise carb burn rate",
      "trained athletes absorb double what beginners tolerate",
      "Dual-source (glucose:fructose 1:0.8) is essential",
      "Almost always because total carbohydrate intake",
      "Lighter riders need fewer total carbs",
    ]) {
      expect(`${client}\n${content}`).not.toContain(staleClaim);
    }
  });

  it("publishes primary sources, a scoped review and connected structured data", () => {
    const content = read(CONTENT_PATH);
    const landing = read("src/components/features/tools/ToolLanding.tsx");
    const schemas = read("src/components/seo/ToolSchemas.tsx");

    for (const pmid of [
      "8214047",
      "1501563",
      "23765351",
      "42322010",
      "26070030",
      "17277604",
      "28985128",
    ]) {
      expect(content).toContain(`https://pubmed.ncbi.nlm.nih.gov/${pmid}/`);
    }
    expect(content).toContain('dateModified: "2026-08-25"');
    expect(content).toContain('reviewedBy: "Anthony Walsh"');
    expect(content).toContain('reviewScope: "primary-source verification"');
    expect(landing).toContain("Evidence sources");
    expect(landing).toContain("Report a correction");
    expect(schemas).toContain('"@type": "WebPage"');
    expect(schemas).toContain('mainEntity: { "@id": `${c.url}#webapplication` }');
    expect(schemas).toContain("citation: c.evidenceSources.map");
  });

  it("strengthens authoritative internal anchors without chasing diet intent", () => {
    const topics = read("src/lib/topics.ts");
    const guide = read("content/blog/cycling-in-ride-nutrition-guide.mdx");
    const carbs = read("content/blog/carbohydrate-per-hour-cyclists.mdx");

    expect(topics.match(/title: "Cycling Nutrition Calculator"/g)?.length).toBeGreaterThanOrEqual(6);
    expect(guide).toContain("[Cycling Nutrition Calculator](/tools/fuelling)");
    expect(carbs).toContain("[cycling nutrition calculator](/tools/fuelling)");
    expect(read("src/app/(content)/tools/fuelling/layout.tsx")).not.toContain(
      '"carb cycling calculator"',
    );
  });

  it("records the GSC baseline and extends search and AI discovery", () => {
    const decision = read(
      "docs/seo/gsc-cycling-nutrition-calculator-ctr-2026-08-25.md",
    );
    for (const signal of [
      "2,480 clicks, 57,640",
      "91 clicks, 14,334 impressions, 0.6% CTR",
      "average position 1.7",
      "earliest reliable review 3",
      "earliest reliable\n  review 24 September 2026",
    ]) {
      expect(decision).toContain(signal);
    }

    expect(read("scripts/submit-indexnow.ts")).toContain("/tools/fuelling");

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string; prompt: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({
        id: 224,
        target_page: "/tools/fuelling",
        prompt: "cycling nutrition calculator for carbs fluid and sodium per hour",
      }),
    );
  });

  it("keeps the public calculator static while loading private defaults later", () => {
    const page = read("src/app/(content)/tools/fuelling/page.tsx");
    const client = read(TOOL_PATH);
    const prefillRoute = read(
      "src/app/api/tools/fuelling/prefill/route.ts",
    );

    expect(page).toContain('dynamic = "force-static"');
    expect(page).not.toContain("getRiderSession");
    expect(page).not.toContain("getMethodSession");
    expect(page).not.toContain("loadByEmail");
    expect(client).toContain('fetch("/api/tools/fuelling/prefill"');
    expect(client).toContain('cache: "no-store"');
    expect(prefillRoute).toContain('dynamic = "force-dynamic"');
    expect(prefillRoute).toContain('"Cache-Control": "private, no-store');
  });
});
