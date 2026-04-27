import type { CitationProvider, ProviderResult } from "./types";

const MODEL_ID = "gemini-2.0-flash";
const TIMEOUT_MS = 30_000;

function endpoint(key: string): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${encodeURIComponent(key)}`;
}

export class GeminiProvider implements CitationProvider {
  name = "gemini";
  model = `gemini:${MODEL_ID}`;

  isConfigured(): boolean {
    return !!process.env.GOOGLE_AI_API_KEY;
  }

  async query(prompt: string): Promise<ProviderResult> {
    const key = process.env.GOOGLE_AI_API_KEY;
    if (!key) {
      return { response: "", citations: [], error: "GOOGLE_AI_API_KEY not set" };
    }
    try {
      const resp = await fetch(endpoint(key), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!resp.ok) {
        const body = await resp.text();
        return {
          response: "",
          citations: [],
          error: `Gemini HTTP ${resp.status}: ${body.slice(0, 200)}`,
        };
      }
      const json = (await resp.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const text =
        json.candidates?.[0]?.content?.parts
          ?.map((p) => p.text ?? "")
          .filter(Boolean)
          .join("\n") ?? "";
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
