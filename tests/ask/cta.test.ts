import { describe, it, expect } from "vitest";
import { pickCta } from "@/lib/ask/cta";
import type { RetrievedChunk } from "@/lib/ask/types";

const chunk: RetrievedChunk = {
  sourceType: "episode",
  sourceId: "1",
  title: "x",
  excerpt: "x",
  score: 0.8,
};

describe("ask/cta pickCta", () => {
  it("plateau intent → plateau diagnostic", () => {
    const c = pickCta({ intent: "plateau", hasProfile: false, retrieved: [] });
    expect(c.key).toBe("plateau_diagnostic");
  });

  it("fuelling intent → fuelling calculator", () => {
    const c = pickCta({ intent: "fuelling", hasProfile: false, retrieved: [] });
    expect(c.key).toBe("fuelling_calculator");
  });

  it("coaching_decision with interest=ready → vip_coaching", () => {
    const c = pickCta({ intent: "coaching_decision", hasProfile: true, coachingInterest: "ready", retrieved: [] });
    expect(c.key).toBe("vip_coaching");
  });

  it("coaching_decision with interest=interested → ndy_coaching", () => {
    const c = pickCta({ intent: "coaching_decision", hasProfile: true, coachingInterest: "interested", retrieved: [] });
    expect(c.key).toBe("ndy_coaching");
  });

  it("coaching_decision with no interest → roadman_plus", () => {
    const c = pickCta({ intent: "coaching_decision", hasProfile: false, retrieved: [] });
    expect(c.key).toBe("roadman_plus");
  });

  it("event_prep with profile → ndy_coaching, without profile → plateau_diagnostic", () => {
    const withP = pickCta({ intent: "event_prep", hasProfile: true, retrieved: [] });
    expect(withP.key).toBe("ndy_coaching");
    const withoutP = pickCta({ intent: "event_prep", hasProfile: false, retrieved: [] });
    expect(withoutP.key).toBe("plateau_diagnostic");
  });

  it("training_general with retrieved content → saturday_spin", () => {
    const c = pickCta({ intent: "training_general", hasProfile: false, retrieved: [chunk] });
    expect(c.key).toBe("saturday_spin");
  });

  it("training_general with no retrieved content → clubhouse", () => {
    const c = pickCta({ intent: "training_general", hasProfile: false, retrieved: [] });
    expect(c.key).toBe("clubhouse");
  });

  it("safety and off-topic intents → no cta", () => {
    for (const intent of ["safety_medical", "safety_injury", "safety_weight", "off_topic", "unknown"] as const) {
      const c = pickCta({ intent, hasProfile: false, retrieved: [] });
      expect(c.key).toBe("none");
    }
  });
});
