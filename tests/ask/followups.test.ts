import { describe, it, expect } from "vitest";
import { buildFollowups } from "@/lib/ask/followups";
import { getAnswerBySlug } from "@/lib/answers";
import type { RetrievedChunk } from "@/lib/ask/types";

function contentChunk(slug: string): RetrievedChunk {
  return {
    sourceType: "content_chunk",
    sourceId: slug,
    title: slug,
    url: `/answers/${slug}`,
    excerpt: "",
    score: 0.9,
  };
}

describe("ask/followups", () => {
  it("mines follow-ups from a matched answer page's FAQ", () => {
    const page = getAnswerBySlug("how-to-improve-ftp")!;
    const faqQuestions = new Set(page.faq.map((f) => f.question));
    const out = buildFollowups({
      query: "how do I improve my FTP",
      intent: "training_general",
      chunks: [contentChunk("how-to-improve-ftp")],
    });
    expect(out.length).toBeGreaterThan(0);
    // At least one suggestion is drawn from the page's own FAQ.
    expect(out.some((q) => faqQuestions.has(q))).toBe(true);
  });

  it("never echoes the rider's own question back", () => {
    const query = "How long does it take to improve FTP?";
    const out = buildFollowups({
      query,
      intent: "training_general",
      chunks: [contentChunk("how-to-improve-ftp")],
    });
    expect(out.map((q) => q.toLowerCase())).not.toContain(query.toLowerCase());
  });

  it("falls back to per-intent suggestions when retrieval is empty", () => {
    const out = buildFollowups({
      query: "something with no answer page",
      intent: "fuelling",
      chunks: [],
    });
    expect(out.length).toBe(3);
  });

  it("returns nothing for safety intents", () => {
    const out = buildFollowups({
      query: "I have chest pain on the bike",
      intent: "safety_medical",
      chunks: [],
    });
    expect(out).toEqual([]);
  });

  it("respects the limit", () => {
    const out = buildFollowups({
      query: "ftp",
      intent: "training_general",
      chunks: [contentChunk("how-to-improve-ftp")],
      limit: 2,
    });
    expect(out.length).toBeLessThanOrEqual(2);
  });

  it("dedupes near-identical suggestions", () => {
    const out = buildFollowups({
      query: "zone 2",
      intent: "training_general",
      chunks: [contentChunk("how-much-zone-2")],
    });
    const lowered = out.map((q) => q.toLowerCase());
    expect(new Set(lowered).size).toBe(lowered.length);
  });
});
