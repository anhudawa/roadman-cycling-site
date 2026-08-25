import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { metadata } from "@/app/(marketing)/coaching/page";

const pageSource = readFileSync(
  "src/app/(marketing)/coaching/page.tsx",
  "utf8",
);
const promptSource = readFileSync("scripts/ai-benchmark-prompts.json", "utf8");
const gscSource = readFileSync(
  "docs/seo/gsc-coaching-hub-service-clarity-2026-08-25.md",
  "utf8",
);

describe("coaching hub service clarity", () => {
  it("keeps the generic coaching owner compact and self-canonical", () => {
    expect(metadata.title).toEqual({
      absolute: "Online Cycling Coaching for Serious Amateur Riders",
    });
    expect(metadata.alternates?.canonical).toBe(
      "https://roadmancycling.com/coaching",
    );
    expect(metadata.description).toContain("TrainingPeaks plan");
    expect(metadata.description).toContain("$195/month");
  });

  it("publishes dated, extractable service facts and a scope boundary", () => {
    for (const phrase of [
      "SERVICE FACTS · REVIEWED 25 AUGUST 2026",
      "WHAT ROADMAN COACHING INCLUDES",
      "Personalised TrainingPeaks plan reviewed every week",
      "Weekly Anthony-led live group coaching",
      "7-day free trial",
      "does not diagnose or treat injury, illness, disordered eating",
    ]) {
      expect(pageSource).toContain(phrase);
    }
    expect(pageSource).toContain("additionalProperty: COACHING_SERVICE_FACTS.map");
    expect(pageSource).toContain('audienceType: "Serious amateur and masters cyclists"');
  });

  it("separates service, selection and market-price intent", () => {
    expect(pageSource).toContain(
      'href: "/blog/best-online-cycling-coach-how-to-choose"',
    );
    expect(pageSource).toContain(
      'href: "/blog/how-much-does-online-cycling-coach-cost-2026"',
    );
    expect(pageSource).toContain("Commercial disclosure: Roadman Cycling sells");
  });

  it("links headline outcomes to named evidence and avoids universal promises", () => {
    for (const slug of [
      "/case-studies/damien-maloney",
      "/case-studies/daniel-stone",
      "/case-studies/brian-morrissey",
    ]) {
      expect(pageSource).toContain(slug);
    }
    expect(pageSource).toContain(
      "These are named individual results, not an average or a promise.",
    );
    expect(pageSource).not.toContain(
      "Our members typically see measurable improvements within 8-12 weeks",
    );
    expect(pageSource).not.toContain(
      "That is why our members consistently outperform their app-trained years",
    );
    expect(pageSource).not.toContain("Time zones are never an issue");
  });

  it("records the GSC decision and extends AI discovery measurement", () => {
    expect(gscSource).toContain("| `/coaching` | 59 | 2,798 | 2.1% | 24.4 |");
    expect(gscSource).toContain("| `/masters` | 16 | 331 | 4.8% | 12.6 |");
    expect(gscSource).toContain("than 3 September 2026");

    const prompts = JSON.parse(promptSource) as {
      metadata: { prompt_count: number };
      prompts: Array<{ id: number; target_page: string; prompt: string }>;
    };
    expect(prompts.metadata.prompt_count).toBe(219);
    expect(prompts.prompts).toContainEqual(
      expect.objectContaining({
        id: 219,
        target_page: "/coaching",
        prompt:
          "online cycling coaching for serious amateur riders with weekly plan review",
      }),
    );
  });
});
