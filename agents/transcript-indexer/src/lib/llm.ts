// ---------------------------------------------------------------------------
// LLM interface — provider-agnostic completion surface
//
// The extraction pipeline depends on this interface, not on a concrete SDK,
// so the model provider can be swapped (or stubbed for offline runs) without
// touching extraction logic. `ClaudeLLMClient` is the production path (wraps
// the repo's existing Anthropic helper); `MockLLMClient` lets the CLI run a
// full dry-run with no network — used for local verification and `--mock`.
// ---------------------------------------------------------------------------

import { callLLM } from "./anthropic.js";
import { MODELS } from "../config.js";

export interface LLMRequest {
  /** System prompt — task framing and output contract. */
  system: string;
  /** User message — the episode payload to extract from. */
  user: string;
  maxTokens?: number;
}

export interface LLMResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  runtimeMs: number;
  /** Identifier of the backing model/provider, for provenance. */
  model: string;
}

export interface LLMClient {
  /** Stable identifier written to the `model` column for provenance. */
  readonly model: string;
  complete(req: LLMRequest): Promise<LLMResult>;
}

/**
 * Production client — routes to Claude via the repo's `callLLM` helper
 * (which handles token accounting and cost in `config.COST_PER_M`).
 */
export class ClaudeLLMClient implements LLMClient {
  readonly model: string;

  constructor(model: string = MODELS.generation) {
    this.model = model;
  }

  async complete(req: LLMRequest): Promise<LLMResult> {
    const r = await callLLM({
      model: this.model,
      system: req.system,
      userMessage: req.user,
      maxTokens: req.maxTokens,
    });
    return {
      text: r.text,
      inputTokens: r.inputTokens,
      outputTokens: r.outputTokens,
      costUsd: r.cost,
      runtimeMs: r.runtimeMs,
      model: this.model,
    };
  }
}

/**
 * Offline client — returns whatever the supplied handler produces. Used for
 * `--mock` dry-runs so the rest of the pipeline (parsing, validation,
 * canonical-entity mapping, JSON output) can be exercised with no API key.
 */
export class MockLLMClient implements LLMClient {
  readonly model = "mock";
  private handler: (req: LLMRequest) => string;

  constructor(handler: (req: LLMRequest) => string) {
    this.handler = handler;
  }

  async complete(req: LLMRequest): Promise<LLMResult> {
    const start = Date.now();
    const text = this.handler(req);
    return {
      text,
      inputTokens: 0,
      outputTokens: 0,
      costUsd: 0,
      runtimeMs: Date.now() - start,
      model: this.model,
    };
  }
}

export interface CreateLLMOptions {
  /** When true, return a MockLLMClient regardless of environment. */
  mock?: boolean;
  /** Handler for the mock client (required when `mock` is true). */
  mockHandler?: (req: LLMRequest) => string;
  /** Override the Claude model id. */
  model?: string;
}

/**
 * Resolve the LLM client for a run. Returns the mock when asked (or when no
 * `ANTHROPIC_API_KEY` is present and a mock handler was supplied), otherwise
 * the Claude client. Throwing here keeps a real run from silently producing
 * empty extractions when the key is missing.
 */
export function createLLMClient(opts: CreateLLMOptions = {}): LLMClient {
  const hasKey = Boolean(process.env.ANTHROPIC_API_KEY);
  if (opts.mock || (!hasKey && opts.mockHandler)) {
    if (!opts.mockHandler) {
      throw new Error("createLLMClient: mock requested but no mockHandler supplied");
    }
    return new MockLLMClient(opts.mockHandler);
  }
  if (!hasKey) {
    throw new Error(
      "createLLMClient: ANTHROPIC_API_KEY is not set. Set it, or run with --mock for an offline dry-run."
    );
  }
  return new ClaudeLLMClient(opts.model);
}
