import { describe, it, expect, vi, afterEach } from "vitest";
import { PerplexityProvider } from "@/lib/citation-tests/providers/perplexity";

const ORIGINAL_KEY = process.env.PERPLEXITY_API_KEY;

afterEach(() => {
  if (ORIGINAL_KEY === undefined) delete process.env.PERPLEXITY_API_KEY;
  else process.env.PERPLEXITY_API_KEY = ORIGINAL_KEY;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("PerplexityProvider", () => {
  it("isConfigured is false without PERPLEXITY_API_KEY", () => {
    delete process.env.PERPLEXITY_API_KEY;
    expect(new PerplexityProvider().isConfigured()).toBe(false);
  });

  it("query parses response + citations array", async () => {
    process.env.PERPLEXITY_API_KEY = "pk-test";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            choices: [{ message: { content: "See roadmancycling.com." } }],
            citations: [
              "https://roadmancycling.com/blog/zone-2",
              "https://example.com",
            ],
          }),
          { status: 200 },
        ),
      ),
    );
    const result = await new PerplexityProvider().query("zone 2?");
    expect(result.response).toBe("See roadmancycling.com.");
    expect(result.citations).toEqual([
      "https://roadmancycling.com/blog/zone-2",
      "https://example.com",
    ]);
  });

  it("query returns error on non-2xx", async () => {
    process.env.PERPLEXITY_API_KEY = "pk-test";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("nope", { status: 500 })),
    );
    expect((await new PerplexityProvider().query("hi")).error).toContain("500");
  });

  it("returns missing-key error when PERPLEXITY_API_KEY is unset", async () => {
    delete process.env.PERPLEXITY_API_KEY;
    expect((await new PerplexityProvider().query("hi")).error).toBe(
      "PERPLEXITY_API_KEY not set",
    );
  });
});
