import { describe, it, expect } from "vitest";
import { parseTranslatorJson, translateRiderInput } from "./translator";

describe("parseTranslatorJson", () => {
  it("parses a clean JSON response", () => {
    const raw = `{"cda":0.31,"crr":0.0033,"bodyMass":76,"bikeMass":7.8,"position":"aero_hoods","surface":"tarmac_smooth","confidence":0.85,"reasoning":"Aeroad on hoods.","missing":[]}`;
    const out = parseTranslatorJson(raw);
    expect(out).not.toBeNull();
    expect(out!.cda).toBe(0.31);
    expect(out!.position).toBe("aero_hoods");
    expect(out!.surface).toBe("tarmac_smooth");
    expect(out!.confidence).toBe(0.85);
  });

  it("strips markdown fences and trailing text", () => {
    const raw =
      "```json\n" +
      `{"cda":0.34,"crr":0.0034,"bodyMass":80,"bikeMass":8,"position":"endurance_hoods","surface":"tarmac_mixed","confidence":0.7,"reasoning":"Roubaix-style endurance bike.","missing":[]}` +
      "\n```\n\nlet me know if you need anything else!";
    const out = parseTranslatorJson(raw);
    expect(out).not.toBeNull();
    expect(out!.position).toBe("endurance_hoods");
  });

  it("clamps an unrealistic mass to a sane range", () => {
    const raw = `{"cda":0.32,"crr":0.0033,"bodyMass":-50,"bikeMass":0,"position":"aero_hoods","surface":"tarmac_smooth","confidence":1,"reasoning":"x","missing":[]}`;
    const out = parseTranslatorJson(raw);
    expect(out!.bodyMass).toBeGreaterThanOrEqual(40);
    expect(out!.bikeMass).toBeGreaterThanOrEqual(5);
  });

  it("rejects an invalid position with the schema fallback", () => {
    const raw = `{"cda":0.32,"crr":0.0033,"bodyMass":75,"bikeMass":8,"position":"recumbent","surface":"tarmac_smooth","confidence":0.6,"reasoning":"x","missing":[]}`;
    const out = parseTranslatorJson(raw);
    expect(out!.position).toBe("endurance_hoods");
  });

  it("returns null on garbage input", () => {
    expect(parseTranslatorJson("hello world")).toBeNull();
    expect(parseTranslatorJson("")).toBeNull();
  });
});

describe("translateRiderInput (mocked client)", () => {
  it("applies default parameters when input is empty", async () => {
    const result = await translateRiderInput("");
    expect(result.confidence).toBeLessThanOrEqual(0.4);
    expect(result.position).toBe("endurance_hoods");
  });

  it("uses prompt caching control on the system block", async () => {
    let capturedPayload: unknown = null;
    const mockClient = {
      messages: {
        create: async (payload: unknown) => {
          capturedPayload = payload;
          return {
            content: [
              {
                type: "text",
                text: `{"cda":0.31,"crr":0.0033,"bodyMass":76,"bikeMass":7.8,"position":"aero_hoods","surface":"tarmac_smooth","confidence":0.85,"reasoning":"Test.","missing":[]}`,
              },
            ],
          };
        },
      },
    };
    const result = await translateRiderInput(
      "Canyon Aeroad CFR, Continental GP5000 28mm, hoods, 76 kg",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { client: mockClient as any },
    );
    expect(result.position).toBe("aero_hoods");
    // Verify cache_control was set on the system block.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload = capturedPayload as any;
    expect(payload.system).toBeDefined();
    expect(Array.isArray(payload.system)).toBe(true);
    expect(payload.system[0].cache_control).toEqual({ type: "ephemeral" });
    expect(payload.model).toContain("haiku");
    expect(payload.temperature).toBe(0);
  });
});
