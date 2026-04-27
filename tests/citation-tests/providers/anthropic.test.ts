import { describe, it, expect, vi, afterEach } from "vitest";
import { AnthropicProvider } from "@/lib/citation-tests/providers/anthropic";
import type Anthropic from "@anthropic-ai/sdk";

const ORIGINAL_KEY = process.env.ANTHROPIC_API_KEY;

afterEach(() => {
  if (ORIGINAL_KEY === undefined) delete process.env.ANTHROPIC_API_KEY;
  else process.env.ANTHROPIC_API_KEY = ORIGINAL_KEY;
  vi.restoreAllMocks();
});

function makeStubClient(messagesCreate: ReturnType<typeof vi.fn>) {
  // Cast through `unknown` — we only need the .messages.create surface.
  return { messages: { create: messagesCreate } } as unknown as Anthropic;
}

describe("AnthropicProvider", () => {
  it("isConfigured is false when ANTHROPIC_API_KEY is unset", () => {
    delete process.env.ANTHROPIC_API_KEY;
    expect(new AnthropicProvider().isConfigured()).toBe(false);
  });

  it("isConfigured is true when ANTHROPIC_API_KEY is set", () => {
    process.env.ANTHROPIC_API_KEY = "sk-ant-test";
    expect(new AnthropicProvider().isConfigured()).toBe(true);
  });

  it("query returns concatenated text content on success", async () => {
    process.env.ANTHROPIC_API_KEY = "sk-ant-test";
    const create = vi.fn().mockResolvedValue({
      content: [
        { type: "text", text: "Roadman Cycling " },
        { type: "text", text: "is a great podcast." },
      ],
    });
    const result = await new AnthropicProvider({
      client: makeStubClient(create),
    }).query("podcast?");
    expect(result.response).toBe("Roadman Cycling \nis a great podcast.");
    expect(result.citations).toEqual([]);
    expect(result.error).toBeUndefined();
    expect(create).toHaveBeenCalledOnce();
  });

  it("query returns error string when the SDK call rejects", async () => {
    process.env.ANTHROPIC_API_KEY = "sk-ant-test";
    const create = vi.fn().mockRejectedValue(new Error("rate-limited"));
    const result = await new AnthropicProvider({
      client: makeStubClient(create),
    }).query("hi");
    expect(result.response).toBe("");
    expect(result.error).toContain("rate-limited");
  });

  it("query returns missing-key error when ANTHROPIC_API_KEY is unset", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const result = await new AnthropicProvider().query("hi");
    expect(result.error).toBe("ANTHROPIC_API_KEY not set");
    expect(result.response).toBe("");
  });
});
