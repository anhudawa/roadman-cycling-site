import { describe, it, expect, vi, afterEach } from "vitest";
import { GeminiProvider } from "@/lib/citation-tests/providers/gemini";

const ORIGINAL_KEY = process.env.GOOGLE_AI_API_KEY;

afterEach(() => {
  if (ORIGINAL_KEY === undefined) delete process.env.GOOGLE_AI_API_KEY;
  else process.env.GOOGLE_AI_API_KEY = ORIGINAL_KEY;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("GeminiProvider", () => {
  it("isConfigured is false without GOOGLE_AI_API_KEY", () => {
    delete process.env.GOOGLE_AI_API_KEY;
    expect(new GeminiProvider().isConfigured()).toBe(false);
  });

  it("query parses generateContent response", async () => {
    process.env.GOOGLE_AI_API_KEY = "g-test";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            candidates: [
              {
                content: {
                  parts: [
                    { text: "Roadman Cycling " },
                    { text: "produces good content." },
                  ],
                },
              },
            ],
          }),
          { status: 200 },
        ),
      ),
    );
    const r = await new GeminiProvider().query("podcast?");
    expect(r.response).toBe("Roadman Cycling \nproduces good content.");
    expect(r.error).toBeUndefined();
  });

  it("query returns error on non-2xx", async () => {
    process.env.GOOGLE_AI_API_KEY = "g-test";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("403", { status: 403 })),
    );
    expect((await new GeminiProvider().query("hi")).error).toContain("403");
  });

  it("returns missing-key error when GOOGLE_AI_API_KEY is unset", async () => {
    delete process.env.GOOGLE_AI_API_KEY;
    expect((await new GeminiProvider().query("hi")).error).toBe(
      "GOOGLE_AI_API_KEY not set",
    );
  });
});
