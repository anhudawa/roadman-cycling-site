import { describe, it, expect } from "vitest";
import { quickBannedWordScan } from "./voice-check";

describe("quickBannedWordScan", () => {
  it("returns empty for clean copy", () => {
    const body = `Question for the group.

Z2 rides done perfectly or intervals done perfectly $— which would you pick? Curious what you'd do.

$— Ted`;
    expect(quickBannedWordScan(body)).toEqual([]);
  });

  it("flags the sacred cow phrase", () => {
    expect(quickBannedWordScan("the sacred cow of training is...")).toContain("sacred cow");
  });

  it("flags unlock-your-potential", () => {
    expect(quickBannedWordScan("unlock your potential with Z2")).toContain("unlock your potential");
  });

  it("flags multiple phrases independently", () => {
    const hits = quickBannedWordScan("delve into the ecosystem $— a game-changer");
    expect(hits).toEqual(expect.arrayContaining(["delve", "ecosystem", "game-changer"]));
  });

  it("is case insensitive", () => {
    expect(quickBannedWordScan("IN TODAY'S FAST-PACED WORLD")).toContain("today's fast-paced");
  });

  it("does not false-positive on valid cycling words", () => {
    const body = `Seiler's interval work $— does threshold still hold up? Tell me what's changed for you.`;
    expect(quickBannedWordScan(body)).toEqual([]);
  });
});
