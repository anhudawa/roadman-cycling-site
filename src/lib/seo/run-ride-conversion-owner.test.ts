import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { getAnswerBySlug } from "@/lib/answers";
import { TOOL_LANDING_CONTENT } from "@/lib/tools/landing-content";
import {
  convertRunRideEnergyCost,
  CYCLING_ACTIVITIES,
  RUNNING_ACTIVITIES,
} from "@/lib/tools/run-ride-equivalence";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

const OWNER = "running-cycling-conversion-calculator";
const OWNER_PATH = `/blog/${OWNER}`;
const TOOL_PATH = "/tools/run-ride-converter";

describe("running and cycling conversion search ownership", () => {
  const raw = read(`content/blog/${OWNER}.mdx`);
  const { data, content } = matter(raw);

  it("publishes a reviewed guide owner with worked, answer-ready structure", () => {
    expect(data.seoTitle).toBe(
      "Cycling to Running Conversion Chart: Distance & Time",
    );
    expect(data.seoTitle.length).toBeLessThanOrEqual(60);
    expect(data.seoDescription.length).toBeGreaterThanOrEqual(120);
    expect(data.seoDescription.length).toBeLessThanOrEqual(160);
    expect(data.primaryHub).toBe("running-for-cyclists");
    expect(data.updatedDate).toBe("2026-08-26");
    expect(data.lastReviewed).toBe("2026-08-26");
    expect(data.reviewedBy).toContain("calculation");
    expect(data.citedClaims).toHaveLength(6);
    expect(data.faq).toHaveLength(6);
    expect(data.howTo.steps).toHaveLength(4);
    expect(data.howTo.totalTime).toBe("PT3M");
    expect(content).toContain("## Cycling to running conversion chart");
    expect(content).toContain("## What cycling distance equals a 5K run?");
    expect(content).toContain(
      "## Why Roadman removed the FTP and VDOT conversion",
    );
    expect(content).toContain("## Which Roadman page should you use?");
  });

  it("grounds the calculator and cross-training limits in maintained sources", () => {
    for (const source of [
      "https://pmc.ncbi.nlm.nih.gov/articles/PMC10818145/",
      "https://pacompendium.com/wp-content/uploads/2024/03/1_2024-adult-compendium_1_2024.pdf",
      "https://pubmed.ncbi.nlm.nih.gov/42267259/",
      "https://pubmed.ncbi.nlm.nih.gov/19290675/",
      "https://pubmed.ncbi.nlm.nih.gov/41758294/",
    ]) {
      expect(raw).toContain(source);
    }
  });

  it("uses source-coded MET-minute arithmetic rather than performance prediction", () => {
    const result = convertRunRideEnergyCost({
      direction: "run-to-ride",
      inputMode: "time",
      amount: 30,
      distanceUnit: "mile",
      sourceActivityId: "run-6",
      targetActivityId: "ride-12",
    });
    expect(result.metMinutes).toBe(279);
    expect(result.targetMinutes).toBeCloseTo(34.875, 8);
    expect(RUNNING_ACTIVITIES).toHaveLength(9);
    expect(CYCLING_ACTIVITIES).toHaveLength(6);

    const client = read(
      "src/app/(content)/tools/run-ride-converter/RunRideConverterClient.tsx",
    );
    const registry = JSON.stringify(TOOL_LANDING_CONTENT["run-ride-converter"]);
    const tool = `${client}\n${registry}`;
    for (const staleModel of [
      "CYCLING_VO2_CORRECTION",
      "EASY_DURATION_SCALE",
      "vdotFromVelocityAndTime",
      "vo2maxFromFTP",
      "ftpFromVO2max",
      "0.92 correction factor",
      "1.65x duration scale",
      "estimated cycling FTP",
      "predicted 5K",
    ]) {
      expect(tool).not.toContain(staleModel);
    }
  });

  it("makes the interactive tool the exact calculator owner", () => {
    const layout = read(
      "src/app/(content)/tools/run-ride-converter/layout.tsx",
    );
    const client = read(
      "src/app/(content)/tools/run-ride-converter/RunRideConverterClient.tsx",
    );
    expect(layout).toContain(
      'title: "Cycling to Running Conversion Calculator (2026)"',
    );
    expect(layout).toContain(
      'alternates: { canonical: "/tools/run-ride-converter" }',
    );
    expect(client).toContain("CYCLING TO RUNNING CONVERSION CALCULATOR");
    expect(client).toContain("POPULATION-AVERAGE ENERGY-COST MATCH");
    expect(client).toContain("MET-minutes on each side");
  });

  it("narrows the short answer and removes the universal three-to-one rule", () => {
    const answer = getAnswerBySlug("how-many-minutes-cycling-equals-running");
    expect(answer).not.toBeNull();
    expect(answer?.updatedDate).toBe("2026-08-26");
    expect(answer?.reviewedBy).toBe("Anthony Walsh");
    expect(answer?.sources).toHaveLength(4);
    expect(answer?.directAnswer).toContain("There is no universal");
    expect(answer?.directAnswer).toContain("279 MET-minutes");
    const rendered = JSON.stringify(answer);
    expect(rendered).not.toContain("3 minutes of cycling per 1 minute");
    expect(rendered).not.toContain("start around there, then check how you feel");
    expect(rendered).not.toContain("Can I use this to plan a taper week around an injury?\",\"answer\":\"Yes");
  });

  it("extends crawler and AI discovery with measured ownership", () => {
    expect(read("src/lib/seo/llms-content.ts")).toContain(`"${OWNER}"`);
    expect(read("src/app/llms.txt/route.ts")).toContain(
      "Canonical informational owner for distance, time, MET-minute examples",
    );
    expect(read("src/app/llms-full.txt/route.ts")).toContain(
      'category: "Running and cycling conversion"',
    );
    const indexNow = read("scripts/submit-indexnow.ts");
    expect(indexNow).toContain(OWNER_PATH);
    expect(indexNow).toContain(TOOL_PATH);
  });

  it("records the GSC baseline and benchmark prompts", () => {
    const decision = read(
      "docs/seo/gsc-running-cycling-conversion-owner-2026-08-26.md",
    );
    for (const signal of [
      "1,029 | 113,114 | 0.9% | 5.7",
      "4 clicks / 46 impressions",
      "9 / 107 / 8.4% / 3.0",
      "4 / 306 / 1.3% / 5.2",
      "3 / 147 / 2.0% / 4.9",
      "7 / 128 / 5.5% / 5.0",
      "5 September 2026",
      "26 September 2026",
    ]) {
      expect(decision).toContain(signal);
    }

    const prompts = JSON.parse(read("scripts/ai-benchmark-prompts.json")) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(prompts.prompts.length);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({ id: 298, target_page: OWNER_PATH }),
    );
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({ id: 299, target_page: TOOL_PATH }),
    );
  });
});
