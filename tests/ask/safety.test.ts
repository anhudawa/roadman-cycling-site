import { describe, it, expect } from "vitest";
import { detectSafety, buildSafeResponse, postFilterCitations } from "@/lib/ask/safety";

describe("ask/safety detectSafety", () => {
  it("flags medical escalation for chest pain", () => {
    const d = detectSafety("I've been getting chest pain on hard climbs, should I push through?");
    expect(d.flags).toContain("medical_escalation");
    expect(d.block).toBe(true);
    expect(d.templateKey).toBe("medical");
  });

  it("flags injury for a torn meniscus", () => {
    const d = detectSafety("I tore my meniscus last week $€” what rehab should I do?");
    expect(d.flags).toContain("injury_escalation");
    expect(d.block).toBe(true);
    expect(d.templateKey).toBe("injury");
  });

  it("flags extreme weight loss", () => {
    const d = detectSafety("how do I drop 15kg in 4 weeks?");
    expect(d.flags).toContain("extreme_weight_loss");
    expect(d.block).toBe(true);
  });

  it("does not flag benign zone 2 questions", () => {
    const d = detectSafety("How should I structure zone 2 this week?");
    expect(d.flags).toEqual([]);
    expect(d.block).toBe(false);
    expect(d.templateKey).toBeUndefined();
  });

  it("buildSafeResponse returns a medical escalation when templateKey is medical", () => {
    const out = buildSafeResponse({ flags: ["medical_escalation"], block: true, templateKey: "medical" });
    expect(out.text.length).toBeGreaterThan(100);
    expect(out.text.toLowerCase()).toContain("doctor");
    expect(out.cta).toBeDefined();
  });

  it("postFilterCitations flags invented podcast titles not in retrieval set", () => {
    const text = `We covered this in the episode "Inventing Performance Lies Forever" last year.`;
    const res = postFilterCitations(text, ["Masters FTP Blueprint", "Fuelling The Gran Fondo"]);
    expect(res.flaggedInvented).toContain("Inventing Performance Lies Forever");
  });

  it("postFilterCitations does not flag quoted titles matching retrieval set", () => {
    const text = `Check the episode "Fuelling The Gran Fondo" for a full breakdown.`;
    const res = postFilterCitations(text, ["Fuelling The Gran Fondo"]);
    expect(res.flaggedInvented).toEqual([]);
  });
});
