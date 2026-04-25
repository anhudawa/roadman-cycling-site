import { describe, expect, it } from "vitest";
import { parseAnswers, parseUtm } from "./parse";

/**
 * Request parser tests. These guard the POST /api/diagnostic/submit
 * endpoint $€” if parseAnswers returns null the route hands back a 400
 * before ever touching the scoring engine or Claude.
 */

const VALID: Record<string, unknown> = {
  age: "45-54",
  hoursPerWeek: "9-12",
  ftp: 285,
  goal: "Etape du Tour",
  Q1: 2, Q2: 1, Q3: 1,
  Q4: 1, Q5: 1, Q6: 1,
  Q7: 1, Q8: 1, Q9: 1,
  Q10: 1, Q11: 1, Q12: 1,
  Q13: "Just feeling flat.",
};

describe("parseAnswers", () => {
  it("accepts a well-formed payload and echoes every field", () => {
    const result = parseAnswers({ ...VALID });
    expect(result).not.toBeNull();
    expect(result!.age).toBe("45-54");
    expect(result!.hoursPerWeek).toBe("9-12");
    expect(result!.ftp).toBe(285);
    expect(result!.goal).toBe("Etape du Tour");
    expect(result!.Q1).toBe(2);
    expect(result!.Q13).toBe("Just feeling flat.");
  });

  it("rejects an unknown age bracket", () => {
    const result = parseAnswers({ ...VALID, age: "30-34" });
    expect(result).toBeNull();
  });

  it("rejects an unknown hours bracket", () => {
    const result = parseAnswers({ ...VALID, hoursPerWeek: "3-5" });
    expect(result).toBeNull();
  });

  it("rejects out-of-range question scores", () => {
    const result = parseAnswers({ ...VALID, Q5: 4 });
    expect(result).toBeNull();
  });

  it("rejects non-integer question scores", () => {
    const result = parseAnswers({ ...VALID, Q5: 2.5 });
    expect(result).toBeNull();
  });

  it("rejects a payload missing a required question", () => {
    const { Q7: _dropped, ...rest } = VALID;
    const result = parseAnswers(rest);
    expect(result).toBeNull();
  });

  it("accepts FTP as a numeric string and normalises to integer", () => {
    const result = parseAnswers({ ...VALID, ftp: "275" });
    expect(result?.ftp).toBe(275);
  });

  it("rejects unrealistic FTP values", () => {
    const low = parseAnswers({ ...VALID, ftp: 0 });
    const high = parseAnswers({ ...VALID, ftp: 9999 });
    expect(low?.ftp).toBeNull();
    expect(high?.ftp).toBeNull();
  });

  it("drops an empty goal string rather than persisting whitespace", () => {
    const result = parseAnswers({ ...VALID, goal: "   " });
    expect(result?.goal).toBeNull();
  });

  it("truncates goal + Q13 to the 500-char cap", () => {
    const long = "x".repeat(1000);
    const result = parseAnswers({ ...VALID, goal: long, Q13: long });
    expect(result?.goal?.length).toBe(500);
    expect(result?.Q13?.length).toBe(500);
  });

  it("returns null on non-object inputs", () => {
    expect(parseAnswers(null)).toBeNull();
    expect(parseAnswers(undefined)).toBeNull();
    expect(parseAnswers("string")).toBeNull();
    expect(parseAnswers(42)).toBeNull();
  });
});

describe("parseUtm", () => {
  it("returns an all-null shape for missing input", () => {
    expect(parseUtm(undefined)).toEqual({
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmContent: null,
      utmTerm: null,
    });
  });

  it("picks up standard UTM keys", () => {
    expect(
      parseUtm({
        source: "facebook",
        medium: "cpc",
        campaign: "plateau-diagnostic",
        content: "variant-1",
        term: "masters cycling",
      })
    ).toEqual({
      utmSource: "facebook",
      utmMedium: "cpc",
      utmCampaign: "plateau-diagnostic",
      utmContent: "variant-1",
      utmTerm: "masters cycling",
    });
  });

  it("ignores empty string values", () => {
    expect(parseUtm({ source: "  ", medium: "" })).toEqual({
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmContent: null,
      utmTerm: null,
    });
  });

  it("caps individual UTM values at 100 chars", () => {
    const giant = "a".repeat(500);
    const result = parseUtm({ campaign: giant });
    expect(result.utmCampaign?.length).toBe(100);
  });
});
