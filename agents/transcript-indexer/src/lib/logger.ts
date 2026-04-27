import fs from "fs";
import path from "path";
import type { LogEntry, UsageStats, StepUsage } from "../types.js";

export class AgentLogger {
  private runId: string;
  private logsDir: string;
  private logFile: string;
  private entries: LogEntry[] = [];

  constructor(logsDir: string) {
    this.runId = `run-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.logsDir = logsDir;
    this.logFile = path.join(logsDir, `${this.runId}.jsonl`);
    fs.mkdirSync(logsDir, { recursive: true });
  }

  get id() {
    return this.runId;
  }

  log(entry: Omit<LogEntry, "timestamp" | "runId">) {
    const full: LogEntry = {
      timestamp: new Date().toISOString(),
      runId: this.runId,
      ...entry,
    };
    this.entries.push(full);
    fs.appendFileSync(this.logFile, JSON.stringify(full) + "\n");
  }

  logStep(
    episodeSlug: string,
    episodeNumber: number,
    step: string,
    model: string,
    usage: { inputTokens: number; outputTokens: number },
    runtimeMs: number,
    pass: boolean,
    opts?: { regenerationAttempt?: number; sacredCowScore?: number; error?: string }
  ) {
    this.log({
      episodeSlug,
      episodeNumber,
      step,
      model,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      runtimeMs,
      regenerationAttempt: opts?.regenerationAttempt ?? 0,
      sacredCowScore: opts?.sacredCowScore,
      pass,
      error: opts?.error,
    });
  }

  summarize(): { episodeCount: number; totalTokens: number; totalCost: number } {
    let totalTokens = 0;
    const totalCost = 0;
    const episodes = new Set<string>();

    for (const entry of this.entries) {
      episodes.add(entry.episodeSlug);
      totalTokens += entry.inputTokens + entry.outputTokens;
    }

    return {
      episodeCount: episodes.size,
      totalTokens,
      totalCost,
    };
  }

  // Collect per-step usage into a UsageStats object for a single episode
  collectUsage(episodeSlug: string, startTime: number): UsageStats {
    const episodeEntries = this.entries.filter((e) => e.episodeSlug === episodeSlug);
    const stepBreakdown: StepUsage[] = episodeEntries.map((e) => ({
      step: e.step,
      model: e.model,
      inputTokens: e.inputTokens,
      outputTokens: e.outputTokens,
      cost: 0, // calculated by caller
      runtimeMs: e.runtimeMs,
    }));

    return {
      totalInputTokens: episodeEntries.reduce((s, e) => s + e.inputTokens, 0),
      totalOutputTokens: episodeEntries.reduce((s, e) => s + e.outputTokens, 0),
      totalCost: 0,
      runtimeMs: Date.now() - startTime,
      stepBreakdown,
    };
  }
}
