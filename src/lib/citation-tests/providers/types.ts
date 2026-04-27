// Common contract for AI providers used by the brand-citation test runner.
// Adapters wrap each vendor (Anthropic, OpenAI, Perplexity, Gemini) behind
// a uniform shape so the orchestrator can iterate without caring which
// vendor it's talking to or which env keys are set.

export interface ProviderResult {
  /** Free-form response text. Empty string when the call errored. */
  response: string;
  /**
   * Citation URLs surfaced by the provider, when supported (Perplexity
   * returns these natively; most chat APIs return []).
   */
  citations: string[];
  /** Set when the call failed. `response` will be "" in that case. */
  error?: string;
}

export interface CitationProvider {
  /** Lower-case vendor id, e.g. "anthropic". */
  name: string;
  /** Specific model id stored in `brand_citation_runs.model`. */
  model: string;
  /** True iff the env key for this provider is set and the adapter can run. */
  isConfigured(): boolean;
  /** Run a single prompt. Never throws — error states surface via `error`. */
  query(prompt: string): Promise<ProviderResult>;
}
