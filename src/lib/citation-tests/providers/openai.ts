import type { CitationProvider, ProviderResult } from "./types";

const MODEL_ID = "gpt-4o-mini";
const ENDPOINT = "https://api.openai.com/v1/chat/completions";
const TIMEOUT_MS = 30_000;

export class OpenAIProvider implements CitationProvider {
  name = "openai";
  model = `openai:${MODEL_ID}`;

  isConfigured(): boolean {
    return !!process.env.OPENAI_API_KEY;
  }

  async query(prompt: string): Promise<ProviderResult> {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      return { response: "", citations: [], error: "OPENAI_API_KEY not set" };
    }
    try {
      const resp = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: MODEL_ID,
          messages: [{ role: "user", content: prompt }],
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!resp.ok) {
        const body = await resp.text();
        return {
          response: "",
          citations: [],
          error: `OpenAI HTTP ${resp.status}: ${body.slice(0, 200)}`,
        };
      }
      const json = (await resp.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      return {
        response: json.choices?.[0]?.message?.content ?? "",
        citations: [],
      };
    } catch (e) {
      return {
        response: "",
        citations: [],
        error: e instanceof Error ? e.message : String(e),
      };
    }
  }
}
