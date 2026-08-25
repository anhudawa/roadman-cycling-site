import { describe, it, expect } from "vitest";
import {
  searchContentChunks,
  __resetContentChunkIndex,
} from "@/lib/ask/retrieval/content-chunks";
import { getAnswerBySlug } from "@/lib/answers";

describe("ask/retrieval/content-chunks", () => {
  it("retrieves a relevant answer page for a topical query", async () => {
    const res = await searchContentChunks("how do I improve my FTP", 4);
    expect(res.length).toBeGreaterThan(0);
    // The directly-matching answer should be the top hit.
    expect(res[0].sourceId).toBe("how-to-improve-ftp");
    expect(res[0].sourceType).toBe("content_chunk");
    expect(res[0].url).toBe("/answers/how-to-improve-ftp");
    // Title + excerpt come straight from the answer page.
    const page = getAnswerBySlug("how-to-improve-ftp")!;
    expect(res[0].title).toBe(page.question);
    expect(res[0].excerpt).toBe(page.directAnswer);
  });

  it("scores in a 0–1 range comparable to other sources", async () => {
    const res = await searchContentChunks("zone 2 training", 4);
    expect(res.length).toBeGreaterThan(0);
    for (const c of res) {
      expect(c.score).toBeGreaterThan(0);
      expect(c.score).toBeLessThanOrEqual(0.98);
    }
  });

  it("returns results sorted by score descending", async () => {
    const res = await searchContentChunks("carbs per hour fuelling long ride", 6);
    for (let i = 1; i < res.length; i++) {
      expect(res[i - 1].score).toBeGreaterThanOrEqual(res[i].score);
    }
  });

  it("respects the limit", async () => {
    const res = await searchContentChunks("training", 3);
    expect(res.length).toBeLessThanOrEqual(3);
  });

  it("returns an empty set for a query with no real terms", async () => {
    const res = await searchContentChunks("the a of to");
    expect(res).toEqual([]);
  });

  it("returns an empty set for an off-domain query", async () => {
    const res = await searchContentChunks("quarterly stock market dividends");
    expect(res).toEqual([]);
  });

  it("still supports deliberate single-term cycling searches", async () => {
    const res = await searchContentChunks("FTP", 4);
    expect(res.length).toBeGreaterThan(0);
    expect(res.some((chunk) => chunk.sourceId === "how-to-improve-ftp")).toBe(
      true,
    );
  });

  it("rebuilds the index after a reset without changing output", async () => {
    const before = await searchContentChunks("strength training for cyclists", 4);
    __resetContentChunkIndex();
    const after = await searchContentChunks("strength training for cyclists", 4);
    expect(after.map((c) => c.sourceId)).toEqual(before.map((c) => c.sourceId));
  });
});
