/**
 * Minimal SSE encoder for the Ask Roadman chat API.
 *
 * Spec reference: https://html.spec.whatwg.org/multipage/server-sent-events.html
 * Each event is `event: <type>\ndata: <json>\n\n`. Clients use `EventSource`
 * or a manual fetch-reader; we don't depend on the SDK's own SSE helper
 * because we need to interleave meta / citations / cta / delta events.
 */

import type { OrchestratorEmit } from "./types";

const encoder = new TextEncoder();

export function sseFormat(event: OrchestratorEmit): Uint8Array {
  const payload =
    typeof event.data === "string" ? event.data : JSON.stringify(event.data);
  return encoder.encode(`event: ${event.type}\ndata: ${payload}\n\n`);
}

export interface SseController {
  enqueue(event: OrchestratorEmit): void;
  close(): void;
  error(err: unknown): void;
}

export interface SseStream {
  response: Response;
  controller: Promise<SseController>;
}

export function createSseStream(init?: { headers?: Record<string, string> }): SseStream {
  let ctrl!: ReadableStreamDefaultController<Uint8Array>;
  const body = new ReadableStream<Uint8Array>({
    start(c) {
      ctrl = c;
    },
  });

  const controller: SseController = {
    enqueue(event) {
      try {
        ctrl.enqueue(sseFormat(event));
      } catch {
        // client disconnected $€” swallow; the main loop should detect EOF elsewhere
      }
    },
    close() {
      try {
        ctrl.close();
      } catch {
        // double close; ignore
      }
    },
    error(err) {
      try {
        ctrl.error(err);
      } catch {
        // ignore
      }
    },
  };

  const response = new Response(body, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      ...init?.headers,
    },
  });

  return { response, controller: Promise.resolve(controller) };
}
