import { describe, it, expect } from "vitest";
import { classifyPersona } from "./persona";

describe("classifyPersona", () => {
  it("defaults to listener for vague answers", () => {
    expect(classifyPersona(["just discovered the podcast"])).toBe("listener");
    expect(classifyPersona([])).toBe("listener");
    expect(classifyPersona([""])).toBe("listener");
  });

  it("identifies plateau answers", () => {
    expect(classifyPersona(["I've been stuck at the same level for a year"])).toBe("plateau");
    expect(classifyPersona(["hit a wall after my FTP test"])).toBe("plateau");
    expect(classifyPersona(["no progress, going nowhere"])).toBe("plateau");
  });

  it("identifies comeback answers", () => {
    expect(classifyPersona(["coming back after a knee injury"])).toBe("comeback");
    expect(classifyPersona(["time off the bike for 18 months, getting back into it"])).toBe("comeback");
    expect(classifyPersona(["used to ride a lot, now restarting"])).toBe("comeback");
  });

  it("identifies event-prep answers", () => {
    expect(classifyPersona(["training for my first gran fondo"])).toBe("event-prep");
    expect(classifyPersona(["preparing for the Etape du Tour"])).toBe("event-prep");
    expect(classifyPersona(["ultra race in six months"])).toBe("event-prep");
  });

  it("picks the best-scoring persona when multiple keywords match", () => {
    // plateau (2 hits) vs event-prep (1 hit)
    expect(
      classifyPersona(["stuck at the same level but training for a race"])
    ).toBe("plateau");
  });

  it("is case-insensitive", () => {
    expect(classifyPersona(["INJURY", "Off the Bike"])).toBe("comeback");
  });

  it("handles multi-element answer arrays", () => {
    expect(
      classifyPersona([
        "Been riding for years",
        "Preparing for a sportive in August",
        "Looking to get faster",
      ])
    ).toBe("event-prep");
  });
});
