import { describe, it, expect } from "vitest";
import { detectAIReferrerFromRequest } from "@/lib/analytics/ai-referrer-server";

describe("detectAIReferrerFromRequest", () => {
  it("prefers utm_source over Referer header", () => {
    expect(
      detectAIReferrerFromRequest({
        pageUrl: "https://roadmancycling.com/blog/foo?utm_source=chatgpt.com",
        referer: "https://google.com/",
      }),
    ).toBe("chatgpt.com");
  });

  it("falls back to Referer header hostname when no utm_source", () => {
    expect(
      detectAIReferrerFromRequest({
        pageUrl: "https://roadmancycling.com/blog/foo",
        referer: "https://www.perplexity.ai/search/123",
      }),
    ).toBe("perplexity.ai");
  });

  it("recognises legacy chat.openai.com host as chatgpt.com", () => {
    expect(
      detectAIReferrerFromRequest({
        pageUrl: "https://roadmancycling.com/",
        referer: "https://chat.openai.com/c/abc",
      }),
    ).toBe("chatgpt.com");
  });

  it("recognises legacy bard.google.com host as gemini.google.com", () => {
    expect(
      detectAIReferrerFromRequest({
        pageUrl: "https://roadmancycling.com/",
        referer: "https://bard.google.com/chat",
      }),
    ).toBe("gemini.google.com");
  });

  it("returns undefined for non-AI traffic", () => {
    expect(
      detectAIReferrerFromRequest({
        pageUrl: "https://roadmancycling.com/",
        referer: "https://twitter.com/x",
      }),
    ).toBeUndefined();
  });

  it("handles missing referer + no utm gracefully", () => {
    expect(
      detectAIReferrerFromRequest({
        pageUrl: "https://roadmancycling.com/",
        referer: null,
      }),
    ).toBeUndefined();
  });

  it("accepts a relative pageUrl", () => {
    expect(
      detectAIReferrerFromRequest({
        pageUrl: "/blog/foo?utm_source=perplexity.ai",
        referer: null,
      }),
    ).toBe("perplexity.ai");
  });

  it("recognises the synthetic llms-txt slug from utm_source", () => {
    expect(
      detectAIReferrerFromRequest({
        pageUrl: "/?utm_source=llms-txt",
        referer: null,
      }),
    ).toBe("llms-txt");
  });

  it("ignores malformed Referer values", () => {
    expect(
      detectAIReferrerFromRequest({
        pageUrl: "https://roadmancycling.com/",
        referer: "::not a url::",
      }),
    ).toBeUndefined();
  });
});
