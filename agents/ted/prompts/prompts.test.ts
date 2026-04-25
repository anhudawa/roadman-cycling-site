import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { quickBannedWordScan } from "../src/lib/voice-check";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const promptsDir = __dirname;

// The voice-check prompt deliberately LISTS banned phrases; it's not a
// post Ted would ever emit, so it's exempt from the scan.
const LITERAL_LIST_FILES = new Set(["voice-check-ted.md", "system-ted.md"]);

function readPromptFiles(): Array<{ name: string; contents: string }> {
  return fs
    .readdirSync(promptsDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => ({
      name: f,
      contents: fs.readFileSync(path.join(promptsDir, f), "utf-8"),
    }));
}

describe("prompt files", () => {
  it("exist and are non-empty", () => {
    const files = readPromptFiles();
    expect(files.length).toBeGreaterThanOrEqual(12);
    for (const f of files) {
      expect(f.contents.length).toBeGreaterThan(50);
    }
  });

  it("never contain banned phrases in non-list prompts", () => {
    for (const f of readPromptFiles()) {
      if (LITERAL_LIST_FILES.has(f.name)) continue;
      const hits = quickBannedWordScan(f.contents);
      expect(
        hits,
        `Banned phrases leaked into ${f.name}: ${hits.join(", ")}`
      ).toEqual([]);
    }
  });

  it("has one prompt per pillar weekday", () => {
    const pillars = [
      "pillar-monday.md",
      "pillar-tuesday.md",
      "pillar-wednesday.md",
      "pillar-thursday.md",
      "pillar-friday.md",
      "pillar-saturday.md",
      "pillar-sunday.md",
    ];
    const present = new Set(readPromptFiles().map((f) => f.name));
    for (const p of pillars) {
      expect(present.has(p), `Missing pillar prompt: ${p}`).toBe(true);
    }
  });

  it("has all three surface variants", () => {
    const variants = ["surface-tag.md", "surface-link.md", "surface-summary.md"];
    const present = new Set(readPromptFiles().map((f) => f.name));
    for (const v of variants) {
      expect(present.has(v), `Missing surface variant: ${v}`).toBe(true);
    }
  });

  it("pillar prompts instruct the sign-off on its own line", () => {
    const pillars = readPromptFiles().filter((f) => f.name.startsWith("pillar-"));
    for (const p of pillars) {
      expect(p.contents, `${p.name} must mention the Ted sign-off`).toMatch(
        /$€” Ted/
      );
    }
  });
});
