/**
 * Minimal SSE encoder for the Ask Roadman chat API.
 *
 * Spec reference: https://html.spec.whatwg.org/multipage/server-sent-events.html
 *
 * Wire format: `event: <type>\ndata: <json>\n\n`. The data field is
 * ALWAYS JSON-encoded (strings included) so payloads can contain
 * newlines, leading spaces, and any other character without colliding
 * with SSE framing. Anthropic token deltas frequently start with a
 * single space (" Roadman", " is") and contain "\n\n" between
 * paragraphs — encoding those as raw `data: ${value}` would either
 * trip a frame boundary or get eaten by the spec's leading-space rule.
 * The client mirrors this by JSON.parsing every event's data.
 */

import type { OrchestratorEmit } from "./types";

const encoder = new TextEncoder();

export function sseFormat(event: OrchestratorEmit): Uint8Array {
  const payload = JSON.stringify(event.data);
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
        // client disconnected — swallow; the main loop should detect EOF elsewhere
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
