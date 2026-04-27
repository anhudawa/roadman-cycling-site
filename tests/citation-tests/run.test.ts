import { describe, it, expect, vi } from "vitest";
import { runPromptsAgainstProviders } from "@/lib/citation-tests";
import type { CitationProvider } from "@/lib/citation-tests/providers/types";
import type { BrandPrompt } from "@/lib/citation-tests/store";

function makePrompt(id: number, prompt = "x"): BrandPrompt {
  return {
    id,
    prompt,
    category: "general",
    enabled: true,
    createdAt: new Date(),
  };
}

interface ProviderOpts {
  name: string;
  configured: boolean;
  response?: string;
  errorMsg?: string;
}

function makeProvider(opts: ProviderOpts): CitationProvider {
  return {
    name: opts.name,
    model: `${opts.name}:test`,
    isConfigured: () => opts.configured,
    query: vi.fn(async () => {
      if (opts.errorMsg) {
        return { response: "", citations: [], error: opts.errorMsg };
      }
      return { response: opts.response ?? "", citations: [] };
    }),
  };
}

describe("runPromptsAgainstProviders", () => {
  it("skips unconfigured providers", async () => {
    const recordRun = vi.fn();
    const configured = makeProvider({
      name: "anthropic",
      configured: true,
      response: "Roadman",
    });
    const unconfigured = makeProvider({ name: "openai", configured: false });

    const summary = await runPromptsAgainstProviders({
      prompts: [makePrompt(1)],
      providers: [configured, unconfigured],
      recordRun,
    });

    expect(configured.query).toHaveBeenCalledOnce();
    expect(unconfigured.query).not.toHaveBeenCalled();
    expect(recordRun).toHaveBeenCalledOnce();
    expect(recordRun.mock.calls[0][0]).toMatchObject({
      promptId: 1,
      model: "anthropic:test",
      mentioned: true,
    });
    expect(summary.skippedProviders).toEqual(["openai"]);
  });

  it("records error rows when a provider fails but continues running", async () => {
    const recordRun = vi.fn();
    const failing = makeProvider({
      name: "openai",
      configured: true,
      errorMsg: "boom",
    });
    const ok = makeProvider({
      name: "anthropic",
      configured: true,
      response: "Try Roadman",
    });

    const summary = await runPromptsAgainstProviders({
      prompts: [makePrompt(7)],
      providers: [failing, ok],
      recordRun,
    });

    expect(recordRun).toHaveBeenCalledTimes(2);
    expect(recordRun).toHaveBeenCalledWith(
      expect.objectContaining({
        promptId: 7,
        model: "openai:test",
        error: "boom",
        mentioned: false,
        response: null,
      }),
    );
    expect(summary.errors).toBe(1);
    expect(summary.mentions).toBe(1);
  });

  it("returns summary counts", async () => {
    const summary = await runPromptsAgainstProviders({
      prompts: [makePrompt(1, "p1"), makePrompt(2, "p2")],
      providers: [
        makeProvider({ name: "anthropic", configured: true, response: "Roadman cycling" }),
        makeProvider({ name: "openai", configured: true, response: "no match" }),
      ],
      recordRun: vi.fn(),
    });
    expect(summary.totalRuns).toBe(4);
    expect(summary.mentions).toBe(2);
    expect(summary.errors).toBe(0);
    expect(summary.skippedProviders).toEqual([]);
  });
});
