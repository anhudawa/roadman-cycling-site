import fs from "fs";
import path from "path";
import { db, schema } from "./db.js";

export type TedJob =
  | "draft-prompt"
  | "post-prompt"
  | "draft-welcome"
  | "post-welcome"
  | "surface-threads";

export type LogLevel = "info" | "warn" | "error";

export class TedLogger {
  private runId: string;
  private jsonlFile: string;

  constructor(opts: { job: TedJob; logsDir: string }) {
    this.runId = `${opts.job}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    fs.mkdirSync(opts.logsDir, { recursive: true });
    this.jsonlFile = path.join(opts.logsDir, `${this.runId}.jsonl`);
  }

  get id(): string {
    return this.runId;
  }

  async write(params: {
    job: TedJob;
    action: string;
    level?: LogLevel;
    payload?: Record<string, unknown>;
    error?: string;
  }): Promise<void> {
    const entry = {
      runId: this.runId,
      timestamp: new Date().toISOString(),
      job: params.job,
      action: params.action,
      level: params.level ?? "info",
      payload: params.payload ?? null,
      error: params.error ?? null,
    };

    // JSONL to disk (mirrors transcript-indexer pattern)
    try {
      fs.appendFileSync(this.jsonlFile, JSON.stringify(entry) + "\n");
    } catch {
      // disk failures shouldn't abort the run
    }

    // DB so it surfaces in /admin/ted/log
    try {
      await db.insert(schema.tedActivityLog).values({
        job: params.job,
        action: params.action,
        level: params.level ?? "info",
        payload: params.payload ?? null,
        error: params.error ?? null,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[ted-log] DB insert failed: ${msg}`);
    }

    console.log(
      `[${params.level ?? "info"}] ${params.job} :: ${params.action}${
        params.error ? ` $— ${params.error}` : ""
      }`
    );
  }
}
