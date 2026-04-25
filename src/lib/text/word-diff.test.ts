import { describe, it, expect } from "vitest";
import { wordDiff } from "./word-diff";

/** Reconstruct the "before" and "after" strings from the diff tokens. */
function reconstruct(tokens: ReturnType<typeof wordDiff>): { before: string; after: string } {
  let before = "";
  let after = "";
  for (const t of tokens) {
    if (t.kind === "kept" || t.kind === "removed") before += t.token;
    if (t.kind === "kept" || t.kind === "added") after += t.token;
  }
  return { before, after };
}

describe("wordDiff — round-trip invariant", () => {
  const cases: Array<[string, string]> = [
    ["hello world", "hello world"],
    ["hello world", "hello mate"],
    ["the quick brown fox", "the brown fox"],
    ["post to group", "post a question to group"],
    ["", "new text"],
    ["old text", ""],
    ["a\n\nb", "a\nc\n\nb"],
    ["Question for the group.\n\n— Ted", "Quick question for the crew.\n\n— Ted"],
  ];

  for (const [before, after] of cases) {
    it(`round-trips "${before.slice(0, 20)}" → "${after.slice(0, 20)}"`, () => {
      const tokens = wordDiff(before, after);
      const rebuilt = reconstruct(tokens);
      expect(rebuilt.before).toBe(before);
      expect(rebuilt.after).toBe(after);
    });
  }
});

describe("wordDiff — structural properties", () => {
  it("marks unchanged strings as all kept", () => {
    const tokens = wordDiff("hello world", "hello world");
    expect(tokens.every((t) => t.kind === "kept")).toBe(true);
  });

  it("produces at least one removed token when text shortens", () => {
    const tokens = wordDiff("the quick brown fox", "the brown fox");
    expect(tokens.some((t) => t.kind === "removed" && t.token.trim() === "quick")).toBe(true);
  });

  it("produces at least one added token when text grows", () => {
    const tokens = wordDiff("post to group", "post a question to group");
    const addedWords = tokens
      .filter((t) => t.kind === "added")
      .map((t) => t.token.trim())
      .filter(Boolean);
    expect(addedWords).toContain("a");
    expect(addedWords).toContain("question");
  });

  it("has no kept tokens when comparing against empty string", () => {
    expect(wordDiff("only text", "").every((t) => t.kind !== "kept")).toBe(true);
    expect(wordDiff("", "only text").every((t) => t.kind !== "kept")).toBe(true);
  });

  it("preserves identity when before === after", () => {
    const tokens = wordDiff("a b c", "a b c");
    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens.every((t) => t.kind === "kept")).toBe(true);
  });
});
