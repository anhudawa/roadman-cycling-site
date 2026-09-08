import { describe, expect, it } from "vitest";
import { findInternalSearchLanguage } from "./reader-copy";

describe("reader copy does not expose internal search instructions", () => {
  it.each([
    "This page owns the first-time booking question.",
    "The guide owns this search intent.",
    "## What this page owns",
    "This episode page owns the interview intent.",
    "The canonical owner keeps a distinct Search Console footprint.",
    "This page\n  owns only the second episode's kit-and-caps intent.",
    "This is Roadman's canonical calculator for zone searches.",
    "The planner is the tool-intent owner.",
    "The companion guide owns explanatory intent.",
  ])("reports internal language: %s", (text) => {
    expect(findInternalSearchLanguage(text).length).toBeGreaterThan(0);
  });
  it("allows useful navigation, coaching responsibility and ordinary intent", () => {
    expect(findInternalSearchLanguage("The coach owns the week. Read the preparation guide before departure. Explain the intent of your session."))
      .toEqual([]);
  });
});
