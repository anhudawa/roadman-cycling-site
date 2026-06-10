import { describe, it, expect } from "vitest";
import { checkContent } from "../content-guard";

describe("checkContent — fact-integrity blocklist", () => {
  it("rejects any copy pairing Dan Lorang with Pogačar", () => {
    const result = checkContent(
      "Under coach Dan Lorang, Tadej Pogačar arrives in Barcelona as the favourite.",
    );
    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.rule)).toContain("fact_blocklist");
  });

  it("catches the unaccented spelling too", () => {
    expect(checkContent("Lorang has guided Pogacar to a new level.").ok).toBe(false);
  });

  it("allows Lorang in correct context (no Pogačar in the same copy)", () => {
    expect(
      checkContent("Dan Lorang's Red Bull-Bora-Hansgrohe squad will ride for Lipowitz today.").ok,
    ).toBe(true);
  });
});

describe("checkContent — AI-slop filters", () => {
  it("rejects banned openers", () => {
    const result = checkContent("When it comes to sprint stages, Bordeaux rarely disappoints.");
    expect(result.violations.map((v) => v.rule)).toContain("banned_opener");
  });

  it("rejects banned words anywhere in the copy", () => {
    const result = checkContent("Stage 14 is a game-changer for the GC battle.");
    expect(result.violations.map((v) => v.rule)).toContain("banned_word");
  });

  it("rejects em-dash carpet-bombing", () => {
    const result = checkContent(
      "Pau — the Tour's old friend — hosts again — expect a break — and a sprint.",
    );
    expect(result.violations.map((v) => v.rule)).toContain("em_dash_density");
  });

  it("passes clean stage copy in Anthony's voice", () => {
    const result = checkContent(
      "Two laps of Montmartre before the Champs finish. The break has a real chance if the sprint teams hesitate, and 130 km gives them nowhere to hide. Watch the third climb with 28 km to go.",
    );
    expect(result.ok).toBe(true);
    expect(result.violations).toEqual([]);
  });
});
