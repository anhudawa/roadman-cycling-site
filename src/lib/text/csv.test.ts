import { describe, it, expect } from "vitest";
import { parseCsv, parseCsvLine } from "./csv";

describe("parseCsvLine", () => {
  it("splits simple comma-separated values", () => {
    expect(parseCsvLine("a,b,c")).toEqual(["a", "b", "c"]);
  });

  it("handles quoted fields with internal commas", () => {
    expect(parseCsvLine('alice,"endurance, nutrition",ok')).toEqual([
      "alice",
      "endurance, nutrition",
      "ok",
    ]);
  });

  it("handles escaped double quotes inside quoted fields", () => {
    expect(parseCsvLine('a,"she said ""go""",c')).toEqual([
      "a",
      'she said "go"',
      "c",
    ]);
  });

  it("preserves empty trailing fields", () => {
    expect(parseCsvLine("a,b,")).toEqual(["a", "b", ""]);
  });
});

describe("parseCsv", () => {
  it("separates headers from rows", () => {
    const text = `member_id,first_name,topic_tags\nalice-1,Alice,"endurance,nutrition"\nsean-2,Seán,culture`;
    const { headers, rows } = parseCsv(text);
    expect(headers).toEqual(["member_id", "first_name", "topic_tags"]);
    expect(rows).toEqual([
      ["alice-1", "Alice", "endurance,nutrition"],
      ["sean-2", "Seán", "culture"],
    ]);
  });

  it("skips blank lines", () => {
    const text = `a,b\n\nx,y\n`;
    const { rows } = parseCsv(text);
    expect(rows).toEqual([["x", "y"]]);
  });

  it("returns empty table on empty input", () => {
    expect(parseCsv("")).toEqual({ headers: [], rows: [] });
  });
});
