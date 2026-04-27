import Anthropic from "@anthropic-ai/sdk";
import type { CitationProvider, ProviderResult } from "./types";

const MODEL_ID = "claude-sonnet-4-6";
const MAX_TOKENS = 1024;

export class AnthropicProvider implements CitationProvider {
  name = "anthropic";
  model = `anthropic:${MODEL_ID}`;
  private client: Anthropic | null;

  constructor(opts?: { client?: Anthropic }) {
    if (opts?.client) {
      this.client = opts.client;
    } else if (process.env.ANTHROPIC_API_KEY) {
      this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    } else {
      this.client = null;
    }
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  async query(prompt: string): Promise<ProviderResult> {
    if (!this.client) {
      return { response: "", citations: [], error: "ANTHROPIC_API_KEY not set" };
    }
    try {
      const resp = await this.client.messages.create({
        model: MODEL_ID,
        max_tokens: MAX_TOKENS,
        messages: [{ role: "user", content: prompt }],
      });
      const text = resp.content
        .map((b) => (b.type === "text" ? b.text : ""))
        .filter((t) => t.length > 0)
        .join("\n");
      return { response: text, citations: [] };
    } catch (e) {
      return {
        response: "",
        citations: [],
        error: e instanceof Error ? e.message : String(e),
      };
    }
  }
}
