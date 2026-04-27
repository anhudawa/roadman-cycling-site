// Orchestrator for the brand-citation test runner.
//
// `runPromptsAgainstProviders` is the pure version — providers and the
// recordRun sink are injected so the orchestrator can be unit-tested
// without DB or network. `runAllPrompts` is the production entry point
// the cron + admin Run Now button call: it loads enabled prompts from
// the DB and instantiates the four real provider adapters.

import { detect } from "./detect";
import type { CitationProvider } from "./providers/types";
import { AnthropicProvider } from "./providers/anthropic";
import { OpenAIProvider } from "./providers/openai";
import { PerplexityProvider } from "./providers/perplexity";
import { GeminiProvider } from "./providers/gemini";
import {
  listEnabledPrompts,
  recordRun,
  type BrandPrompt,
  type NewRunRow,
} from "./store";

export interface RunSummary {
  totalRuns: number;
  mentions: number;
  errors: number;
  skippedProviders: string[];
}

export interface RunOptions {
  prompts: BrandPrompt[];
  providers: CitationProvider[];
  recordRun: (row: NewRunRow) => Promise<void> | void;
}

export async function runPromptsAgainstProviders(
  opts: RunOptions,
): Promise<RunSummary> {
  const summary: RunSummary = {
    totalRuns: 0,
    mentions: 0,
    errors: 0,
    skippedProviders: [],
  };

  const active = opts.providers.filter((p) => {
    if (!p.isConfigured()) {
      summary.skippedProviders.push(p.name);
      return false;
    }
    return true;
  });

  for (const prompt of opts.prompts) {
    for (const provider of active) {
      const { response, citations, error } = await provider.query(prompt.prompt);
      const det = detect(response, citations);
      const row: NewRunRow = {
        promptId: prompt.id,
        model: provider.model,
        response: error ? null : response,
        mentioned: det.mentioned,
        matchedTerms: det.matchedTerms,
        matchedUrls: det.matchedUrls,
        citations,
        error: error ?? null,
      };
      await opts.recordRun(row);
      summary.totalRuns++;
      if (det.mentioned) summary.mentions++;
      if (error) summary.errors++;
    }
  }

  return summary;
}

/** Production entry point: load enabled prompts + run all four providers. */
export async function runAllPrompts(): Promise<RunSummary> {
  const prompts = await listEnabledPrompts();
  const providers: CitationProvider[] = [
    new AnthropicProvider(),
    new OpenAIProvider(),
    new PerplexityProvider(),
    new GeminiProvider(),
  ];
  return runPromptsAgainstProviders({
    prompts,
    providers,
    recordRun,
  });
}
