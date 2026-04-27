import { describe, it, expect, vi, afterEach } from "vitest";
import { OpenAIProvider } from "@/lib/citation-tests/providers/openai";

const ORIGINAL_KEY = process.env.OPENAI_API_KEY;

afterEach(() => {
  if (ORIGINAL_KEY === undefined) delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY = ORIGINAL_KEY;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("OpenAIProvider", () => {
  it("isConfigured tracks env key presence", () => {
    delete process.env.OPENAI_API_KEY;
    expect(new OpenAIProvider().isConfigured()).toBe(false);
    process.env.OPENAI_API_KEY = "sk-test";
    expect(new OpenAIProvider().isConfigured()).toBe(true);
  });

  it("query parses chat completions response", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: "Try Roadman Cycling." } }],
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await new OpenAIProvider().query("podcast?");
    expect(result.response).toBe("Try Roadman Cycling.");
    expect(result.error).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.openai.com/v1/chat/completions",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("query returns error on non-2xx response", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("rate limited", { status: 429 })),
    );
    const result = await new OpenAIProvider().query("hi");
    expect(result.error).toContain("429");
  });

  it("query returns missing-key error when OPENAI_API_KEY is unset", async () => {
    delete process.env.OPENAI_API_KEY;
    const result = await new OpenAIProvider().query("hi");
    expect(result.error).toBe("OPENAI_API_KEY not set");
  });
});
